/**
 * Safety Monitoring Service
 * Monitors lighting system for safety violations and takes corrective actions
 */

import { EventEmitter } from 'events';
import { prisma } from '@/lib/prisma';
import HLPManager from '@/lib/protocols/hlp';

export interface SafetyEvent {
  id: string;
  timestamp: Date;
  type: 'power_exceeded' | 'high_temperature' | 'device_failure' | 'circuit_overload';
  severity: 'warning' | 'critical' | 'emergency';
  zoneId?: string;
  deviceId?: string;
  value: number;
  limit: number;
  unit: string;
  action: 'alert' | 'reduce' | 'shutdown';
  message: string;
}

export interface CircuitBreaker {
  circuitId: string;
  name: string;
  maxAmps: number;
  voltage: number;
  maxWatts: number;
  currentLoad: number;
  zones: string[];
  status: 'normal' | 'warning' | 'tripped';
}

export class SafetyMonitorService extends EventEmitter {
  private static instance: SafetyMonitorService;
  private hlpManager: HLPManager;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  // Circuit breaker tracking
  private circuits: Map<string, CircuitBreaker> = new Map();
  
  // Safety thresholds
  private readonly TEMP_WARNING = 50; // °C
  private readonly TEMP_CRITICAL = 60; // °C
  private readonly TEMP_EMERGENCY = 70; // °C
  
  private readonly POWER_WARNING_PERCENT = 80; // % of max
  private readonly POWER_CRITICAL_PERCENT = 90; // % of max
  private readonly POWER_EMERGENCY_PERCENT = 95; // % of max
  
  private constructor() {
    super();
    this.hlpManager = new HLPManager();
  }
  
  static getInstance(): SafetyMonitorService {
    if (!this.instance) {
      this.instance = new SafetyMonitorService();
    }
    return this.instance;
  }
  
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    logger.info('api', 'Starting Safety Monitor Service...');
    
    // Load circuit configurations
    await this.loadCircuitConfigurations();
    
    // Start monitoring loop (every 5 seconds)
    this.monitoringInterval = setInterval(() => {
      this.performSafetyChecks();
    }, 5000);
    
    this.isRunning = true;
    
    // Perform initial check
    this.performSafetyChecks();
  }
  
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    logger.info('api', 'Stopping Safety Monitor Service...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isRunning = false;
  }
  
  /**
   * Load circuit breaker configurations
   */
  private async loadCircuitConfigurations(): Promise<void> {
    // In a real system, this would load from database
    // For now, using example configurations
    
    this.circuits.set('circuit-1', {
      circuitId: 'circuit-1',
      name: 'Grow Room A - Circuit 1',
      maxAmps: 30,
      voltage: 240,
      maxWatts: 7200,
      currentLoad: 0,
      zones: ['zone-1', 'zone-2'],
      status: 'normal'
    });
    
    this.circuits.set('circuit-2', {
      circuitId: 'circuit-2',
      name: 'Grow Room A - Circuit 2',
      maxAmps: 30,
      voltage: 240,
      maxWatts: 7200,
      currentLoad: 0,
      zones: ['zone-3', 'zone-4'],
      status: 'normal'
    });
  }
  
  /**
   * Perform comprehensive safety checks
   */
  private async performSafetyChecks(): Promise<void> {
    try {
      // Check all devices
      const devices = this.hlpManager.getDevices();
      
      for (const device of devices) {
        await this.checkDeviceSafety(device.id);
      }
      
      // Check circuit loads
      await this.checkCircuitLoads();
      
      // Check zone power limits
      await this.checkZonePowerLimits();
      
    } catch (error) {
      logger.error('api', 'Error performing safety checks:', error );
      this.emit('error', error);
    }
  }
  
  /**
   * Check individual device safety
   */
  private async checkDeviceSafety(deviceId: string): Promise<void> {
    try {
      const status = await this.hlpManager.getStatus(deviceId);
      if (!status) return;
      
      // Temperature check
      if (status.temperature !== undefined) {
        if (status.temperature >= this.TEMP_EMERGENCY) {
          await this.handleSafetyViolation({
            id: `temp-${deviceId}-${Date.now()}`,
            timestamp: new Date(),
            type: 'high_temperature',
            severity: 'emergency',
            deviceId,
            value: status.temperature,
            limit: this.TEMP_EMERGENCY,
            unit: '°C',
            action: 'shutdown',
            message: `Device ${deviceId} temperature critical: ${status.temperature}°C`
          });
        } else if (status.temperature >= this.TEMP_CRITICAL) {
          await this.handleSafetyViolation({
            id: `temp-${deviceId}-${Date.now()}`,
            timestamp: new Date(),
            type: 'high_temperature',
            severity: 'critical',
            deviceId,
            value: status.temperature,
            limit: this.TEMP_CRITICAL,
            unit: '°C',
            action: 'reduce',
            message: `Device ${deviceId} temperature high: ${status.temperature}°C`
          });
        } else if (status.temperature >= this.TEMP_WARNING) {
          await this.handleSafetyViolation({
            id: `temp-${deviceId}-${Date.now()}`,
            timestamp: new Date(),
            type: 'high_temperature',
            severity: 'warning',
            deviceId,
            value: status.temperature,
            limit: this.TEMP_WARNING,
            unit: '°C',
            action: 'alert',
            message: `Device ${deviceId} temperature warning: ${status.temperature}°C`
          });
        }
      }
      
      // Device failure check
      if (status.deviceStatus === 'error' || status.errors.length > 0) {
        await this.handleSafetyViolation({
          id: `failure-${deviceId}-${Date.now()}`,
          timestamp: new Date(),
          type: 'device_failure',
          severity: 'critical',
          deviceId,
          value: 0,
          limit: 0,
          unit: '',
          action: 'alert',
          message: `Device ${deviceId} failure: ${status.errors.join(', ')}`
        });
      }
    } catch (error) {
      logger.error('api', `Error checking device ${deviceId} safety:`, error);
    }
  }
  
  /**
   * Check circuit loads
   */
  private async checkCircuitLoads(): Promise<void> {
    // Reset circuit loads
    this.circuits.forEach(circuit => {
      circuit.currentLoad = 0;
    });
    
    // Calculate loads per circuit
    for (const [circuitId, circuit] of this.circuits) {
      let totalPower = 0;
      
      for (const zoneId of circuit.zones) {
        const zoneStatus = await this.hlpManager.getZoneStatus(zoneId);
        totalPower += zoneStatus.totalPower;
      }
      
      circuit.currentLoad = totalPower;
      
      // Check thresholds
      const loadPercent = (totalPower / circuit.maxWatts) * 100;
      
      if (loadPercent >= this.POWER_EMERGENCY_PERCENT) {
        circuit.status = 'tripped';
        await this.handleSafetyViolation({
          id: `circuit-${circuitId}-${Date.now()}`,
          timestamp: new Date(),
          type: 'circuit_overload',
          severity: 'emergency',
          value: totalPower,
          limit: circuit.maxWatts,
          unit: 'W',
          action: 'shutdown',
          message: `Circuit ${circuit.name} overload: ${totalPower}W / ${circuit.maxWatts}W`
        });
      } else if (loadPercent >= this.POWER_CRITICAL_PERCENT) {
        circuit.status = 'warning';
        await this.handleSafetyViolation({
          id: `circuit-${circuitId}-${Date.now()}`,
          timestamp: new Date(),
          type: 'circuit_overload',
          severity: 'critical',
          value: totalPower,
          limit: circuit.maxWatts * (this.POWER_CRITICAL_PERCENT / 100),
          unit: 'W',
          action: 'reduce',
          message: `Circuit ${circuit.name} near capacity: ${totalPower}W / ${circuit.maxWatts}W`
        });
      } else if (loadPercent >= this.POWER_WARNING_PERCENT) {
        circuit.status = 'warning';
        // Just emit warning, don't take action
        this.emit('warning', {
          circuit: circuit.name,
          load: totalPower,
          capacity: circuit.maxWatts,
          percent: loadPercent
        });
      } else {
        circuit.status = 'normal';
      }
    }
  }
  
  /**
   * Check zone power limits from database
   */
  private async checkZonePowerLimits(): Promise<void> {
    try {
      const limits = await prisma.safetyLimit.findMany({
        where: {
          limitType: 'power',
          enabled: true
        }
      });
      
      for (const limit of limits) {
        if (!limit.zoneId) continue;
        
        const zoneStatus = await this.hlpManager.getZoneStatus(limit.zoneId);
        
        if (zoneStatus.totalPower > limit.maxValue) {
          await this.handleSafetyViolation({
            id: `zone-power-${limit.zoneId}-${Date.now()}`,
            timestamp: new Date(),
            type: 'power_exceeded',
            severity: limit.priority > 5 ? 'critical' : 'warning',
            zoneId: limit.zoneId,
            value: zoneStatus.totalPower,
            limit: limit.maxValue,
            unit: limit.unit,
            action: limit.action as 'alert' | 'reduce' | 'shutdown',
            message: `Zone ${limit.zoneId} power limit exceeded: ${zoneStatus.totalPower}${limit.unit} > ${limit.maxValue}${limit.unit}`
          });
        }
      }
    } catch (error) {
      logger.error('api', 'Error checking zone power limits:', error );
    }
  }
  
  /**
   * Handle safety violation
   */
  private async handleSafetyViolation(event: SafetyEvent): Promise<void> {
    // Emit event for logging/notification
    this.emit('safety-violation', event);
    
    // Log to database
    try {
      await prisma.systemAlert.create({
        data: {
          type: 'safety_violation',
          severity: event.severity,
          source: 'SafetyMonitor',
          message: event.message,
          metadata: JSON.stringify(event),
          acknowledged: false
        }
      });
    } catch (error) {
      logger.error('api', 'Error logging safety violation:', error );
    }
    
    // Take action based on severity and type
    switch (event.action) {
      case 'shutdown':
        if (event.deviceId) {
          // Shutdown specific device
          await this.hlpManager.setIntensity(event.deviceId, {
            channels: [{ channelId: 0, intensity: 0, rampTime: 1 }]
          });
        } else if (event.zoneId) {
          // Shutdown entire zone
          await this.hlpManager.setZoneIntensity(event.zoneId, 0, 1);
        }
        break;
        
      case 'reduce':
        if (event.type === 'high_temperature' && event.deviceId) {
          // Reduce intensity by 25% to lower temperature
          const currentStatus = await this.hlpManager.getStatus(event.deviceId);
          if (currentStatus) {
            const avgIntensity = currentStatus.channels.reduce((sum, ch) => sum + ch.intensity, 0) / currentStatus.channels.length;
            const newIntensity = Math.max(0, avgIntensity * 0.75);
            await this.hlpManager.setIntensity(event.deviceId, {
              channels: currentStatus.channels.map(ch => ({
                channelId: ch.channelId,
                intensity: newIntensity,
                rampTime: 10
              }))
            });
          }
        } else if (event.type === 'circuit_overload') {
          // Reduce all zones on circuit by 10%
          const circuit = Array.from(this.circuits.values()).find(c => 
            c.zones.includes(event.zoneId || '')
          );
          if (circuit) {
            for (const zoneId of circuit.zones) {
              const zoneStatus = await this.hlpManager.getZoneStatus(zoneId);
              const newIntensity = Math.max(0, zoneStatus.averageIntensity * 0.9);
              await this.hlpManager.setZoneIntensity(zoneId, newIntensity, 10);
            }
          }
        }
        break;
        
      case 'alert':
        // Just log and notify, no automatic action
        break;
    }
  }
  
  /**
   * Get current circuit status
   */
  getCircuitStatus(): CircuitBreaker[] {
    return Array.from(this.circuits.values());
  }
  
  /**
   * Emergency shutdown
   */
  async emergencyShutdown(reason: string): Promise<void> {
    logger.error('api', `EMERGENCY SHUTDOWN: ${reason}`);
    
    // Shutdown all devices
    const devices = this.hlpManager.getDevices();
    for (const device of devices) {
      try {
        await this.hlpManager.setIntensity(device.id, {
          channels: [{ channelId: 0, intensity: 0, rampTime: 0 }]
        });
      } catch (error) {
        logger.error('api', `Failed to shutdown device ${device.id}:`, error);
      }
    }
    
    // Log emergency event
    await prisma.systemAlert.create({
      data: {
        type: 'emergency_shutdown',
        severity: 'emergency',
        source: 'SafetyMonitor',
        message: `Emergency shutdown initiated: ${reason}`,
        metadata: JSON.stringify({ reason, timestamp: new Date() }),
        acknowledged: false
      }
    });
    
    this.emit('emergency-shutdown', { reason, timestamp: new Date() });
  }
}

// Export singleton instance
export const safetyMonitor = SafetyMonitorService.getInstance();