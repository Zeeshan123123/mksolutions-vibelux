/**
 * Control System Manager
 * Orchestrates all professional control system integrations
 * Provides unified interface for multi-system facilities
 */

import { EventEmitter } from 'events';
import ControlSystemAdapter, { ControlSystemConfig, SystemStatus } from './control-system-adapters';
import ArgusAdapter from './argus-adapter';
import PrivaAdapter from './priva-adapter';
import TrolMasterAdapter from './trolmaster-adapter';

interface ManagedFacility {
  id: string;
  name: string;
  systems: ManagedSystem[];
  totalZones: number;
  totalFixtures: number;
  energyProfile: {
    dailyConsumption: number; // kWh
    monthlyCost: number; // USD
    co2Footprint: number; // kg CO2/month
  };
  optimizationStats: {
    totalSavings: number; // kWh/month
    dollarsaved: number; // USD/month
    co2Reduced: number; // kg CO2/month
    efficiency: number; // percentage improvement
  };
}

interface ManagedSystem {
  id: string;
  type: 'argus' | 'priva' | 'trolmaster' | 'gavita' | 'generic';
  adapter: ControlSystemAdapter;
  config: ControlSystemConfig;
  status: SystemStatus;
  lastOptimization: Date;
  performance: {
    uptime: number; // percentage
    avgResponseTime: number; // ms
    successRate: number; // percentage
    energySaved: number; // kWh/month
  };
}

interface OptimizationPlan {
  facilityId: string;
  systems: SystemOptimization[];
  schedule: {
    immediate: SystemOptimization[];
    delayed: SystemOptimization[];
    scheduled: ScheduledOptimization[];
  };
  coordination: {
    crossSystemEffects: string[];
    energyLoadBalancing: boolean;
    peakDemandManagement: boolean;
  };
  projections: {
    monthlySavings: number;
    paybackPeriod: number; // months
    riskLevel: 'low' | 'medium' | 'high';
  };
}

interface SystemOptimization {
  systemId: string;
  zones: string[];
  optimizations: any[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedSavings: number;
  timeToExecute: number; // minutes
}

interface ScheduledOptimization {
  systemId: string;
  scheduledTime: Date;
  optimization: SystemOptimization;
  reason: string;
  recurring: boolean;
}

export class ControlSystemManager extends EventEmitter {
  private facilities = new Map<string, ManagedFacility>();
  private adapters = new Map<string, ControlSystemAdapter>();
  private isRunning = false;
  private optimizationInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.startManager();
  }

  private startManager() {
    logger.info('api', '🚀 Starting Control System Manager...');
    this.isRunning = true;
    
    // Run facility-wide optimization every 15 minutes
    this.optimizationInterval = setInterval(async () => {
      await this.runFacilityOptimizations();
    }, 15 * 60 * 1000);

    logger.info('api', '✅ Control System Manager started');
  }

  async addFacility(facilityConfig: {
    id: string;
    name: string;
    systems: ControlSystemConfig[];
  }): Promise<ManagedFacility> {
    logger.info('api', `🏭 Adding facility: ${facilityConfig.name}`);

    const managedSystems: ManagedSystem[] = [];

    // Create adapters for each control system
    for (const systemConfig of facilityConfig.systems) {
      const adapter = this.createAdapter(systemConfig);
      const systemId = `${facilityConfig.id}_${systemConfig.type}_${systemConfig.id}`;

      // Connect to the system
      const connected = await adapter.connect();
      if (!connected) {
        logger.error('api', `❌ Failed to connect to ${systemConfig.type} system ${systemConfig.id}`);
        continue;
      }

      const status = await adapter.getSystemStatus();
      
      const managedSystem: ManagedSystem = {
        id: systemId,
        type: systemConfig.type,
        adapter,
        config: systemConfig,
        status,
        lastOptimization: new Date(0),
        performance: {
          uptime: 100,
          avgResponseTime: 500,
          successRate: 100,
          energySaved: 0
        }
      };

      managedSystems.push(managedSystem);
      this.adapters.set(systemId, adapter);

      // Set up event listeners
      this.setupAdapterEvents(adapter, systemId, facilityConfig.id);
    }

    const facility: ManagedFacility = {
      id: facilityConfig.id,
      name: facilityConfig.name,
      systems: managedSystems,
      totalZones: managedSystems.reduce((sum, s) => sum + s.status.totalZones, 0),
      totalFixtures: managedSystems.reduce((sum, s) => sum + s.config.zones.reduce((zSum, z) => zSum + z.fixtures.length, 0), 0),
      energyProfile: {
        dailyConsumption: 0,
        monthlyCost: 0,
        co2Footprint: 0
      },
      optimizationStats: {
        totalSavings: 0,
        dollarsaved: 0,
        co2Reduced: 0,
        efficiency: 0
      }
    };

    this.facilities.set(facilityConfig.id, facility);
    
    // Calculate initial energy profile
    await this.updateFacilityMetrics(facilityConfig.id);

    logger.info('api', `✅ Facility ${facilityConfig.name} added with ${managedSystems.length} control systems`);
    this.emit('facilityAdded', facility);

    return facility;
  }

  private createAdapter(config: ControlSystemConfig): ControlSystemAdapter {
    switch (config.type) {
      case 'argus':
        return new ArgusAdapter(config);
      case 'priva':
        return new PrivaAdapter(config);
      case 'trolmaster':
        return new TrolMasterAdapter(config);
      default:
        throw new Error(`Unsupported control system type: ${config.type}`);
    }
  }

  private setupAdapterEvents(adapter: ControlSystemAdapter, systemId: string, facilityId: string) {
    adapter.on('optimizationCompleted', (data) => {
      logger.info('api', `✅ Optimization completed: ${systemId} - ${data.zoneId}`);
      this.emit('systemOptimized', { facilityId, systemId, ...data });
    });

    adapter.on('commandExecuted', (data) => {
      logger.info('api', `🎛️ Command executed: ${systemId}`);
      this.emit('commandExecuted', { facilityId, systemId, ...data });
    });

    adapter.on('commandFailed', (data) => {
      logger.error('api', `❌ Command failed: ${systemId}`, data.error);
      this.emit('commandFailed', { facilityId, systemId, ...data });
    });

    adapter.on('connectionError', (error) => {
      logger.error('api', `🔌 Connection error: ${systemId}`, error);
      this.emit('systemError', { facilityId, systemId, error });
    });
  }

  async optimizeFacility(facilityId: string, goals?: {
    energyReduction?: number; // percentage
    costReduction?: number; // percentage
    co2Reduction?: number; // percentage
    maintainQuality?: boolean;
  }): Promise<OptimizationPlan> {
    const facility = this.facilities.get(facilityId);
    if (!facility) {
      throw new Error(`Facility ${facilityId} not found`);
    }

    logger.info('api', `🧠 Creating optimization plan for facility: ${facility.name}`);

    const systemOptimizations: SystemOptimization[] = [];
    let totalSavings = 0;

    // Optimize each control system
    for (const system of facility.systems) {
      try {
        const systemPlan = await this.optimizeSystem(system, goals);
        systemOptimizations.push(systemPlan);
        totalSavings += systemPlan.estimatedSavings;
      } catch (error) {
        logger.error('api', `Failed to optimize system ${system.id}:`, error);
      }
    }

    // Coordinate cross-system optimizations
    const coordinatedPlan = this.coordinateSystems(systemOptimizations, facility);

    const optimizationPlan: OptimizationPlan = {
      facilityId,
      systems: systemOptimizations,
      schedule: this.scheduleOptimizations(coordinatedPlan),
      coordination: {
        crossSystemEffects: this.identifyCrossSystemEffects(facility),
        energyLoadBalancing: true,
        peakDemandManagement: true
      },
      projections: {
        monthlySavings: totalSavings * 30, // Convert daily to monthly
        paybackPeriod: this.calculatePaybackPeriod(totalSavings, facility),
        riskLevel: this.assessRiskLevel(systemOptimizations)
      }
    };

    logger.info('api', `📊 Optimization plan created: ${totalSavings.toFixed(1)} kWh/day savings projected`);
    this.emit('optimizationPlanCreated', optimizationPlan);

    return optimizationPlan;
  }

  private async optimizeSystem(system: ManagedSystem, goals?: any): Promise<SystemOptimization> {
    const zones = system.config.zones.map(z => z.id);
    const optimizations = [];
    let totalSavings = 0;

    for (const zoneId of zones) {
      try {
        const result = await system.adapter.optimizeZone(zoneId, goals);
        if (result.success) {
          optimizations.push(result);
          totalSavings += result.estimatedDailySavings;
        }
      } catch (error) {
        logger.error('api', `Failed to optimize zone ${zoneId}:`, error);
      }
    }

    return {
      systemId: system.id,
      zones,
      optimizations,
      priority: totalSavings > 50 ? 'high' : totalSavings > 20 ? 'medium' : 'low',
      estimatedSavings: totalSavings,
      timeToExecute: optimizations.length * 5 // 5 minutes per optimization
    };
  }

  private coordinateSystems(optimizations: SystemOptimization[], facility: ManagedFacility): SystemOptimization[] {
    // Implement cross-system coordination logic
    // For example, if one system reduces power, others might compensate
    
    const totalPowerReduction = optimizations.reduce((sum, opt) => sum + opt.estimatedSavings, 0);
    
    if (totalPowerReduction > facility.energyProfile.dailyConsumption * 0.3) {
      // If reducing more than 30% of daily consumption, stagger the optimizations
      logger.info('api', '📈 Coordinating large power reduction across systems');
      optimizations.forEach((opt, index) => {
        opt.priority = index === 0 ? 'high' : 'medium';
      });
    }

    return optimizations;
  }

  private scheduleOptimizations(optimizations: SystemOptimization[]) {
    const immediate = optimizations.filter(opt => opt.priority === 'high' || opt.priority === 'critical');
    const delayed = optimizations.filter(opt => opt.priority === 'medium');
    const scheduled: ScheduledOptimization[] = optimizations
      .filter(opt => opt.priority === 'low')
      .map(opt => ({
        systemId: opt.systemId,
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        optimization: opt,
        reason: 'Low priority - scheduled for off-peak hours',
        recurring: false
      }));

    return { immediate, delayed, scheduled };
  }

  private identifyCrossSystemEffects(facility: ManagedFacility): string[] {
    const effects: string[] = [];
    
    if (facility.systems.length > 1) {
      effects.push('Multiple control systems detected - coordination enabled');
      
      const hasArgus = facility.systems.some(s => s.type === 'argus');
      const hasPriva = facility.systems.some(s => s.type === 'priva');
      const hasTrolMaster = facility.systems.some(s => s.type === 'trolmaster');

      if (hasArgus && hasPriva) {
        effects.push('Argus-Priva coordination: Climate and lighting synchronization');
      }
      
      if (hasTrolMaster && (hasArgus || hasPriva)) {
        effects.push('Cannabis-specific optimization with environmental integration');
      }
    }

    return effects;
  }

  private calculatePaybackPeriod(dailySavings: number, facility: ManagedFacility): number {
    const monthlySavings = dailySavings * 30 * 0.12; // Assume $0.12/kWh
    const integrationCost = facility.systems.length * 5000; // $5K per system integration
    return integrationCost / monthlySavings;
  }

  private assessRiskLevel(optimizations: SystemOptimization[]): 'low' | 'medium' | 'high' {
    const highRiskCount = optimizations.filter(opt => opt.estimatedSavings > 100).length;
    const totalOptimizations = optimizations.length;

    if (highRiskCount > totalOptimizations * 0.5) return 'high';
    if (highRiskCount > 0) return 'medium';
    return 'low';
  }

  private async updateFacilityMetrics(facilityId: string) {
    const facility = this.facilities.get(facilityId);
    if (!facility) return;

    let totalDailyConsumption = 0;
    let totalSavings = 0;

    for (const system of facility.systems) {
      const savingsReport = system.adapter.getSavingsReport();
      totalDailyConsumption += 1000; // Estimate based on system size
      totalSavings += savingsReport.dailyAvgSavings;
    }

    facility.energyProfile = {
      dailyConsumption: totalDailyConsumption,
      monthlyCost: totalDailyConsumption * 30 * 0.12,
      co2Footprint: totalDailyConsumption * 30 * 0.92 // kg CO2/kWh (US average)
    };

    facility.optimizationStats = {
      totalSavings: totalSavings * 30,
      dollarsaved: totalSavings * 30 * 0.12,
      co2Reduced: totalSavings * 30 * 0.92,
      efficiency: (totalSavings / totalDailyConsumption) * 100
    };

    this.facilities.set(facilityId, facility);
  }

  private async runFacilityOptimizations() {
    if (!this.isRunning) return;

    logger.info('api', '🔄 Running scheduled facility optimizations...');

    for (const [facilityId, facility] of this.facilities) {
      try {
        // Only optimize if last optimization was more than 4 hours ago
        const shouldOptimize = facility.systems.some(system => 
          Date.now() - system.lastOptimization.getTime() > 4 * 60 * 60 * 1000
        );

        if (shouldOptimize) {
          await this.optimizeFacility(facilityId, {
            energyReduction: 15,
            maintainQuality: true
          });
        }
      } catch (error) {
        logger.error('api', `Failed to optimize facility ${facilityId}:`, error);
      }
    }
  }

  // Public API methods
  public getFacility(facilityId: string): ManagedFacility | undefined {
    return this.facilities.get(facilityId);
  }

  public getAllFacilities(): ManagedFacility[] {
    return Array.from(this.facilities.values());
  }

  public async getSystemStatus(facilityId: string, systemId: string): Promise<SystemStatus> {
    const adapter = this.adapters.get(systemId);
    if (!adapter) {
      throw new Error(`System ${systemId} not found`);
    }
    return await adapter.getSystemStatus();
  }

  public async emergencyStop(facilityId: string, reason: string) {
    logger.info('api', `🚨 EMERGENCY STOP: ${facilityId} - ${reason}`);
    
    const facility = this.facilities.get(facilityId);
    if (!facility) return;

    for (const system of facility.systems) {
      try {
        // Each adapter should implement emergency procedures
        if (system.type === 'argus') {
          await (system.adapter as ArgusAdapter).emergencyOverride('all', 'reduce_50');
        } else if (system.type === 'priva') {
          await (system.adapter as PrivaAdapter).emergencyClimateResponse('all', 'power_limit');
        } else if (system.type === 'trolmaster') {
          // TrolMaster emergency procedures would be implemented here
        }
      } catch (error) {
        logger.error('api', `Emergency stop failed for system ${system.id}:`, error);
      }
    }

    this.emit('emergencyStop', { facilityId, reason, timestamp: new Date() });
  }

  public async generateReport(facilityId: string, period: 'day' | 'week' | 'month') {
    const facility = this.facilities.get(facilityId);
    if (!facility) {
      throw new Error(`Facility ${facilityId} not found`);
    }

    const systemReports = await Promise.all(
      facility.systems.map(async (system) => ({
        systemId: system.id,
        type: system.type,
        status: await system.adapter.getSystemStatus(),
        savings: system.adapter.getSavingsReport(),
        performance: system.performance
      }))
    );

    return {
      facilityId,
      facilityName: facility.name,
      period,
      generated: new Date(),
      summary: {
        totalSystems: facility.systems.length,
        totalZones: facility.totalZones,
        energyProfile: facility.energyProfile,
        optimizationStats: facility.optimizationStats
      },
      systems: systemReports,
      recommendations: this.generateRecommendations(facility)
    };
  }

  private generateRecommendations(facility: ManagedFacility): string[] {
    const recommendations: string[] = [];

    if (facility.optimizationStats.efficiency < 10) {
      recommendations.push('Consider more aggressive optimization settings to increase energy savings');
    }

    if (facility.systems.length > 1) {
      recommendations.push('Enable cross-system coordination for better facility-wide optimization');
    }

    if (facility.energyProfile.dailyConsumption > 5000) {
      recommendations.push('Large facility detected - consider demand response programs for additional savings');
    }

    return recommendations;
  }

  public async shutdown() {
    logger.info('api', '🛑 Shutting down Control System Manager...');
    
    this.isRunning = false;
    
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }

    // Disconnect all adapters
    for (const [systemId, adapter] of this.adapters) {
      try {
        await adapter.disconnect();
      } catch (error) {
        logger.error('api', `Failed to disconnect ${systemId}:`, error);
      }
    }

    this.facilities.clear();
    this.adapters.clear();
    
    logger.info('api', '✅ Control System Manager shutdown complete');
  }
}

export default ControlSystemManager;