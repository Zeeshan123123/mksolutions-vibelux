/**
 * Demand Response Manager
 * Handles utility demand response events and optimizes facility operations
 */

import { UtilityAPIClient, GridStatus, DemandData, TariffData } from './utility-api-client';

export interface DemandResponseEvent {
  id: string;
  startTime: Date;
  endTime: Date;
  targetReduction: number; // kW
  incentiveRate: number; // $/kWh
  status: 'pending' | 'active' | 'completed';
  actualReduction?: number;
  earnings?: number;
}

export interface LoadPriority {
  id: string;
  name: string;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = critical, 5 = non-essential
  currentLoad: number; // kW
  minimumLoad: number; // kW
  canShed: boolean;
  shedDuration: number; // minutes
}

export interface OptimizationStrategy {
  type: 'time-shift' | 'load-shed' | 'dim' | 'temperature-adjust';
  targetReduction: number; // kW
  duration: number; // minutes
  impact: 'none' | 'minimal' | 'moderate' | 'significant';
  estimatedSavings: number; // $
}

export class DemandResponseManager {
  private utilityClient: UtilityAPIClient;
  private loadPriorities: LoadPriority[] = [];
  private activeEvents: DemandResponseEvent[] = [];
  private strategies: OptimizationStrategy[] = [];

  constructor(utilityClient: UtilityAPIClient) {
    this.utilityClient = utilityClient;
    this.initializeLoadPriorities();
  }

  /**
   * Initialize default load priorities for cultivation facility
   */
  private initializeLoadPriorities() {
    this.loadPriorities = [
      {
        id: 'critical-lighting',
        name: 'Critical Growth Lighting',
        priority: 1,
        currentLoad: 2.5,
        minimumLoad: 2.0,
        canShed: true,
        shedDuration: 30
      },
      {
        id: 'hvac-cooling',
        name: 'HVAC Cooling',
        priority: 2,
        currentLoad: 1.5,
        minimumLoad: 0.8,
        canShed: true,
        shedDuration: 60
      },
      {
        id: 'dehumidification',
        name: 'Dehumidification',
        priority: 2,
        currentLoad: 0.8,
        minimumLoad: 0.4,
        canShed: true,
        shedDuration: 45
      },
      {
        id: 'supplemental-lighting',
        name: 'Supplemental Lighting',
        priority: 3,
        currentLoad: 1.0,
        minimumLoad: 0,
        canShed: true,
        shedDuration: 120
      },
      {
        id: 'irrigation',
        name: 'Irrigation Pumps',
        priority: 3,
        currentLoad: 0.5,
        minimumLoad: 0,
        canShed: true,
        shedDuration: 180
      },
      {
        id: 'air-circulation',
        name: 'Air Circulation Fans',
        priority: 4,
        currentLoad: 0.3,
        minimumLoad: 0.1,
        canShed: true,
        shedDuration: 30
      },
      {
        id: 'office-lighting',
        name: 'Office/Warehouse Lighting',
        priority: 5,
        currentLoad: 0.2,
        minimumLoad: 0,
        canShed: true,
        shedDuration: 240
      }
    ];
  }

  /**
   * Monitor grid conditions and respond to events
   */
  async monitorAndRespond(): Promise<void> {
    try {
      const [gridStatus, demandData, tariffData] = await Promise.all([
        this.utilityClient.getGridStatus(),
        this.utilityClient.getDemandData(),
        this.utilityClient.getTariffData()
      ]);

      // Check for active demand response events
      if (gridStatus.demandResponse.active) {
        await this.handleDemandResponseEvent(gridStatus);
      }

      // Check if approaching demand threshold
      if (demandData.predicted > demandData.threshold * 0.9) {
        await this.preventDemandExceedance(demandData, tariffData);
      }

      // Optimize for time-of-use rates
      await this.optimizeForTimeOfUse(tariffData);

    } catch (error) {
      logger.error('api', 'Error monitoring grid conditions:', error );
    }
  }

  /**
   * Handle active demand response event
   */
  private async handleDemandResponseEvent(gridStatus: GridStatus): Promise<void> {
    const event: DemandResponseEvent = {
      id: `dr-${Date.now()}`,
      startTime: new Date(),
      endTime: new Date(Date.now() + gridStatus.demandResponse.duration * 60000),
      targetReduction: 1.0, // Default 1kW reduction target
      incentiveRate: gridStatus.demandResponse.incentiveRate,
      status: 'active'
    };

    this.activeEvents.push(event);

    // Generate optimization strategies
    const strategies = this.generateOptimizationStrategies(event.targetReduction);
    
    // Execute best strategy
    const bestStrategy = this.selectBestStrategy(strategies);
    if (bestStrategy) {
      await this.executeStrategy(bestStrategy);
    }
  }

  /**
   * Prevent demand threshold exceedance
   */
  private async preventDemandExceedance(
    demandData: DemandData,
    tariffData: TariffData
  ): Promise<void> {
    const reductionNeeded = demandData.predicted - demandData.threshold * 0.95;
    
    if (reductionNeeded > 0) {
      logger.info('api', `Demand threshold warning: Need to reduce ${reductionNeeded.toFixed(2)}kW`);
      
      const strategies = this.generateOptimizationStrategies(reductionNeeded);
      const bestStrategy = this.selectBestStrategy(strategies, 'minimal'); // Prefer minimal impact
      
      if (bestStrategy) {
        await this.executeStrategy(bestStrategy);
      }
    }
  }

  /**
   * Optimize loads based on time-of-use rates
   */
  private async optimizeForTimeOfUse(tariffData: TariffData): Promise<void> {
    const hour = new Date().getHours();
    const currentRate = tariffData.currentRate;
    
    // If we're in on-peak hours, reduce non-critical loads
    if (currentRate === tariffData.timeOfUse.onPeak) {
      const strategies = this.strategies.filter(s => 
        s.type === 'time-shift' || 
        (s.type === 'load-shed' && s.impact !== 'significant')
      );
      
      for (const strategy of strategies) {
        if (strategy.estimatedSavings > 10) { // Only execute if savings > $10
          await this.executeStrategy(strategy);
        }
      }
    }
  }

  /**
   * Generate optimization strategies based on target reduction
   */
  private generateOptimizationStrategies(targetReduction: number): OptimizationStrategy[] {
    const strategies: OptimizationStrategy[] = [];
    let cumulativeReduction = 0;

    // Sort loads by priority (highest priority first)
    const sortedLoads = [...this.loadPriorities].sort((a, b) => b.priority - a.priority);

    for (const load of sortedLoads) {
      if (!load.canShed || cumulativeReduction >= targetReduction) continue;

      const maxReduction = load.currentLoad - load.minimumLoad;
      if (maxReduction <= 0) continue;

      // Dimming strategy (for lighting)
      if (load.id.includes('lighting') && load.priority > 2) {
        strategies.push({
          type: 'dim',
          targetReduction: maxReduction * 0.3, // 30% dimming
          duration: load.shedDuration,
          impact: this.assessImpact(load.priority, 0.3),
          estimatedSavings: this.calculateSavings(maxReduction * 0.3, load.shedDuration)
        });
      }

      // Load shedding strategy
      if (load.priority >= 3) {
        strategies.push({
          type: 'load-shed',
          targetReduction: maxReduction,
          duration: load.shedDuration,
          impact: this.assessImpact(load.priority, 1.0),
          estimatedSavings: this.calculateSavings(maxReduction, load.shedDuration)
        });
      }

      // Time shifting strategy (for schedulable loads)
      if (load.id === 'irrigation' || load.id === 'dehumidification') {
        strategies.push({
          type: 'time-shift',
          targetReduction: load.currentLoad,
          duration: 240, // Shift by 4 hours
          impact: 'minimal',
          estimatedSavings: this.calculateTimeShiftSavings(load.currentLoad)
        });
      }

      // Temperature adjustment (for HVAC)
      if (load.id === 'hvac-cooling') {
        strategies.push({
          type: 'temperature-adjust',
          targetReduction: maxReduction * 0.5, // 50% reduction
          duration: 120,
          impact: 'moderate',
          estimatedSavings: this.calculateSavings(maxReduction * 0.5, 120)
        });
      }

      cumulativeReduction += maxReduction;
    }

    return strategies;
  }

  /**
   * Select best strategy based on criteria
   */
  private selectBestStrategy(
    strategies: OptimizationStrategy[],
    preferredImpact?: 'none' | 'minimal' | 'moderate' | 'significant'
  ): OptimizationStrategy | null {
    if (strategies.length === 0) return null;

    // Filter by preferred impact level if specified
    let filtered = preferredImpact
      ? strategies.filter(s => s.impact === preferredImpact)
      : strategies;

    if (filtered.length === 0) filtered = strategies;

    // Sort by savings per impact ratio
    const impactScore = (impact: string) => {
      switch (impact) {
        case 'none': return 0;
        case 'minimal': return 1;
        case 'moderate': return 3;
        case 'significant': return 5;
        default: return 10;
      }
    };

    filtered.sort((a, b) => {
      const ratioA = a.estimatedSavings / (impactScore(a.impact) + 1);
      const ratioB = b.estimatedSavings / (impactScore(b.impact) + 1);
      return ratioB - ratioA;
    });

    return filtered[0];
  }

  /**
   * Execute selected optimization strategy
   */
  private async executeStrategy(strategy: OptimizationStrategy): Promise<void> {
    logger.info('api', `Executing ${strategy.type} strategy:`, { data: {
      reduction: `${strategy.targetReduction.toFixed(2)}kW`,
      duration: `${strategy.duration} minutes`,
      savings: `$${strategy.estimatedSavings.toFixed(2)}`
    } });

    // In a real implementation, this would send commands to the control system
    // For now, we'll simulate the execution
    switch (strategy.type) {
      case 'dim':
        await this.executeDimming(strategy);
        break;
      case 'load-shed':
        await this.executeLoadShed(strategy);
        break;
      case 'time-shift':
        await this.executeTimeShift(strategy);
        break;
      case 'temperature-adjust':
        await this.executeTemperatureAdjust(strategy);
        break;
    }
  }

  /**
   * Strategy execution methods
   */
  private async executeDimming(strategy: OptimizationStrategy): Promise<void> {
    // Simulate sending dimming command to lighting system
    logger.info('api', `Dimming lights to reduce load by ${strategy.targetReduction}kW`);
  }

  private async executeLoadShed(strategy: OptimizationStrategy): Promise<void> {
    // Simulate turning off non-critical loads
    logger.info('api', `Shedding loads to reduce by ${strategy.targetReduction}kW`);
  }

  private async executeTimeShift(strategy: OptimizationStrategy): Promise<void> {
    // Simulate rescheduling loads to off-peak hours
    logger.info('api', `Shifting load to off-peak hours: ${strategy.targetReduction}kW`);
  }

  private async executeTemperatureAdjust(strategy: OptimizationStrategy): Promise<void> {
    // Simulate adjusting HVAC setpoints
    logger.info('api', `Adjusting temperature setpoints to reduce load by ${strategy.targetReduction}kW`);
  }

  /**
   * Helper methods
   */
  private assessImpact(priority: number, reductionFactor: number): OptimizationStrategy['impact'] {
    const impactScore = priority * reductionFactor;
    if (impactScore <= 1) return 'none';
    if (impactScore <= 2) return 'minimal';
    if (impactScore <= 3.5) return 'moderate';
    return 'significant';
  }

  private calculateSavings(reduction: number, duration: number): number {
    const rate = 0.15; // Average $/kWh
    const hours = duration / 60;
    return reduction * hours * rate;
  }

  private calculateTimeShiftSavings(load: number): number {
    const onPeakRate = 0.28;
    const offPeakRate = 0.12;
    const hours = 4; // Typical shift duration
    return load * hours * (onPeakRate - offPeakRate);
  }

  /**
   * Get current optimization status
   */
  getOptimizationStatus() {
    return {
      activeEvents: this.activeEvents,
      currentStrategies: this.strategies,
      loadPriorities: this.loadPriorities,
      totalReduction: this.strategies.reduce((sum, s) => sum + s.targetReduction, 0),
      estimatedSavings: this.strategies.reduce((sum, s) => sum + s.estimatedSavings, 0)
    };
  }
}