/**
 * Schedule Executor Service
 * Runs in background to execute lighting schedules in real-time
 */

import { prisma } from '@/lib/prisma';
import HLPManager from '@/lib/protocols/hlp';
import { 
  AdvancedSchedule, 
  calculateCurrentSpectrum,
  intensityToVoltage 
} from '@/lib/protocols/hlp/advanced-scheduling';
import { HLPChannelType } from '@/lib/protocols/hlp/types';

export interface ActiveSchedule {
  id: string;
  zoneId: string;
  schedule: AdvancedSchedule;
  lastUpdate: Date;
  nextUpdate: Date;
  status: 'active' | 'paused' | 'error';
  errorMessage?: string;
}

export class ScheduleExecutorService {
  private static instance: ScheduleExecutorService;
  private hlpManager: HLPManager;
  private activeSchedules: Map<string, ActiveSchedule> = new Map();
  private executionInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  // Safety limits
  private readonly MAX_ZONE_POWER = 10000; // Watts
  private readonly MAX_FIXTURE_TEMP = 60; // Celsius
  private readonly MIN_TRANSITION_TIME = 1; // seconds
  
  private constructor() {
    this.hlpManager = new HLPManager();
  }
  
  static getInstance(): ScheduleExecutorService {
    if (!this.instance) {
      this.instance = new ScheduleExecutorService();
    }
    return this.instance;
  }
  
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    logger.info('api', 'Starting Schedule Executor Service...');
    
    // Start HLP manager
    await this.hlpManager.start();
    
    // Load active schedules from database
    await this.loadActiveSchedules();
    
    // Start execution loop (every 10 seconds)
    this.executionInterval = setInterval(() => {
      this.executeSchedules();
    }, 10000);
    
    this.isRunning = true;
    
    // Execute immediately
    this.executeSchedules();
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    logger.info('api', 'Stopping Schedule Executor Service...');
    
    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
    
    await this.hlpManager.stop();
    this.isRunning = false;
  }
  
  /**
   * Load active schedules from database
   */
  private async loadActiveSchedules(): Promise<void> {
    try {
      const schedules = await prisma.lightingSchedule.findMany({
        where: { 
          enabled: true,
          deletedAt: null
        },
        include: {
          zone: true
        }
      });
      
      this.activeSchedules.clear();
      
      schedules.forEach(dbSchedule => {
        const schedule: AdvancedSchedule = JSON.parse(dbSchedule.data as string);
        
        this.activeSchedules.set(dbSchedule.id, {
          id: dbSchedule.id,
          zoneId: dbSchedule.zoneId,
          schedule,
          lastUpdate: dbSchedule.lastExecuted || new Date(0),
          nextUpdate: new Date(),
          status: 'active'
        });
      });
      
      logger.info('api', `Loaded ${this.activeSchedules.size} active schedules`);
    } catch (error) {
      logger.error('api', 'Error loading schedules:', error );
    }
  }
  
  /**
   * Execute all active schedules
   */
  private async executeSchedules(): Promise<void> {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday, 6=Saturday
    
    for (const [scheduleId, activeSchedule] of this.activeSchedules) {
      try {
        // Check if schedule should run today
        if (!activeSchedule.schedule.repeatDays.includes(currentDay)) {
          continue;
        }
        
        // Check if it's time to update
        if (now < activeSchedule.nextUpdate) {
          continue;
        }
        
        // Calculate current spectrum and intensity
        const current = calculateCurrentSpectrum(activeSchedule.schedule, now);
        
        // Apply safety checks
        const safetyCheck = await this.performSafetyChecks(activeSchedule.zoneId);
        if (!safetyCheck.safe) {
          activeSchedule.status = 'error';
          activeSchedule.errorMessage = safetyCheck.message;
          await this.logScheduleError(scheduleId, safetyCheck.message);
          continue;
        }
        
        // Convert to HLP spectrum format
        const hlpSpectrum: { [key in HLPChannelType]?: number } = {};
        Object.entries(current.spectrum).forEach(([channel, value]) => {
          hlpSpectrum[channel as HLPChannelType] = value as number;
        });
        
        // Apply to zone
        const success = await this.hlpManager.applyRecipeToZone(
          activeSchedule.zoneId,
          activeSchedule.zoneId // Using zoneId as recipeId for now
        );
        
        if (success) {
          // Set intensity separately
          await this.hlpManager.setZoneIntensity(
            activeSchedule.zoneId,
            current.intensity,
            Math.max(this.MIN_TRANSITION_TIME, 10) // 10 second minimum transition
          );
          
          activeSchedule.lastUpdate = now;
          activeSchedule.nextUpdate = current.nextTransition || new Date(now.getTime() + 60000);
          activeSchedule.status = 'active';
          
          // Log execution
          await this.logScheduleExecution(scheduleId, current);
        } else {
          activeSchedule.status = 'error';
          activeSchedule.errorMessage = 'Failed to apply schedule to zone';
        }
        
      } catch (error) {
        logger.error('api', `Error executing schedule ${scheduleId}:`, error);
        activeSchedule.status = 'error';
        activeSchedule.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }
  
  /**
   * Perform safety checks before applying schedule
   */
  private async performSafetyChecks(zoneId: string): Promise<{ safe: boolean; message?: string }> {
    try {
      const status = await this.hlpManager.getZoneStatus(zoneId);
      
      // Check total power
      if (status.totalPower > this.MAX_ZONE_POWER) {
        return { 
          safe: false, 
          message: `Zone power (${status.totalPower}W) exceeds limit (${this.MAX_ZONE_POWER}W)` 
        };
      }
      
      // Check device temperatures (if available)
      const devices = this.hlpManager.getDevicesByZone(zoneId);
      for (const device of devices) {
        const deviceStatus = await this.hlpManager.getStatus(device.id);
        if (deviceStatus && deviceStatus.temperature && deviceStatus.temperature > this.MAX_FIXTURE_TEMP) {
          return { 
            safe: false, 
            message: `Device ${device.id} temperature (${deviceStatus.temperature}°C) exceeds limit` 
          };
        }
      }
      
      return { safe: true };
    } catch (error) {
      return { 
        safe: false, 
        message: 'Failed to perform safety checks' 
      };
    }
  }
  
  /**
   * Add or update a schedule
   */
  async addSchedule(
    zoneId: string, 
    schedule: AdvancedSchedule,
    userId: string
  ): Promise<string> {
    try {
      // Save to database
      const dbSchedule = await prisma.lightingSchedule.create({
        data: {
          zoneId,
          name: schedule.name,
          enabled: schedule.enabled,
          data: JSON.stringify(schedule),
          createdBy: userId,
          lastExecuted: null
        }
      });
      
      // Add to active schedules if enabled
      if (schedule.enabled) {
        this.activeSchedules.set(dbSchedule.id, {
          id: dbSchedule.id,
          zoneId,
          schedule,
          lastUpdate: new Date(0),
          nextUpdate: new Date(),
          status: 'active'
        });
      }
      
      return dbSchedule.id;
    } catch (error) {
      logger.error('api', 'Error adding schedule:', error );
      throw error;
    }
  }
  
  /**
   * Remove a schedule
   */
  async removeSchedule(scheduleId: string): Promise<void> {
    try {
      // Soft delete in database
      await prisma.lightingSchedule.update({
        where: { id: scheduleId },
        data: { 
          deletedAt: new Date(),
          enabled: false
        }
      });
      
      // Remove from active schedules
      this.activeSchedules.delete(scheduleId);
    } catch (error) {
      logger.error('api', 'Error removing schedule:', error );
      throw error;
    }
  }
  
  /**
   * Pause/resume a schedule
   */
  async toggleSchedule(scheduleId: string, enabled: boolean): Promise<void> {
    try {
      await prisma.lightingSchedule.update({
        where: { id: scheduleId },
        data: { enabled }
      });
      
      const activeSchedule = this.activeSchedules.get(scheduleId);
      if (activeSchedule) {
        if (enabled) {
          activeSchedule.status = 'active';
        } else {
          activeSchedule.status = 'paused';
        }
      }
    } catch (error) {
      logger.error('api', 'Error toggling schedule:', error );
      throw error;
    }
  }
  
  /**
   * Get schedule status
   */
  getScheduleStatus(scheduleId: string): ActiveSchedule | undefined {
    return this.activeSchedules.get(scheduleId);
  }
  
  /**
   * Get all active schedules
   */
  getAllSchedules(): ActiveSchedule[] {
    return Array.from(this.activeSchedules.values());
  }
  
  /**
   * Log schedule execution
   */
  private async logScheduleExecution(
    scheduleId: string, 
    current: any
  ): Promise<void> {
    try {
      await prisma.scheduleExecutionLog.create({
        data: {
          scheduleId,
          executedAt: new Date(),
          spectrum: JSON.stringify(current.spectrum),
          intensity: current.intensity,
          activeSetpoint: current.activeSetpoint,
          success: true
        }
      });
      
      await prisma.lightingSchedule.update({
        where: { id: scheduleId },
        data: { lastExecuted: new Date() }
      });
    } catch (error) {
      logger.error('api', 'Error logging schedule execution:', error );
    }
  }
  
  /**
   * Log schedule error
   */
  private async logScheduleError(
    scheduleId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await prisma.scheduleExecutionLog.create({
        data: {
          scheduleId,
          executedAt: new Date(),
          success: false,
          errorMessage
        }
      });
    } catch (error) {
      logger.error('api', 'Error logging schedule error:', error );
    }
  }
}

// Export singleton instance
export const scheduleExecutor = ScheduleExecutorService.getInstance();