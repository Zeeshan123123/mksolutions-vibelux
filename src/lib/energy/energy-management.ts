/**
 * Energy Management System
 * Real-time power monitoring, cost tracking, and optimization for cultivation facilities
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';

export type EnergySource = 'grid' | 'solar' | 'wind' | 'generator' | 'battery';
export type EquipmentType = 'lighting' | 'hvac' | 'irrigation' | 'fans' | 'dehumidifier' | 'co2' | 'other';
export type TariffType = 'flat' | 'time_of_use' | 'demand' | 'tiered';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EnergyMeter {
  id: string;
  name: string;
  location: string;
  meterType: 'main' | 'sub' | 'equipment';
  
  // Connection Info
  ipAddress?: string;
  modbusAddress?: number;
  protocol: 'modbus' | 'mqtt' | 'http' | 'manual';
  
  // Current Readings
  currentPower: number; // kW
  voltage: number; // V
  current: number; // A
  powerFactor: number;
  frequency: number; // Hz
  
  // Cumulative Data
  totalEnergy: number; // kWh
  dailyEnergy: number; // kWh
  monthlyEnergy: number; // kWh
  
  // Status
  isOnline: boolean;
  lastReading: Date;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface PowerConsumption {
  id: string;
  meterId: string;
  timestamp: Date;
  
  // Instantaneous Values
  power: number; // kW
  voltage: number; // V
  current: number; // A
  powerFactor: number;
  
  // Energy Values
  energy: number; // kWh (for the period)
  
  // Environmental Context
  temperature?: number;
  humidity?: number;
  lightIntensity?: number;
  
  // Cost
  energyRate: number; // $/kWh
  cost: number; // $
  
  // Peak Demand
  isPeak: boolean;
  demandCharge?: number;
}

export interface EquipmentEnergy {
  id: string;
  equipmentId: string;
  equipmentType: EquipmentType;
  name: string;
  
  // Power Specifications
  ratedPower: number; // kW
  actualPower: number; // kW
  efficiency: number; // %
  
  // Usage Patterns
  dailyRuntime: number; // hours
  scheduleOn: string;
  scheduleOff: string;
  
  // Energy Consumption
  dailyEnergy: number; // kWh
  monthlyEnergy: number; // kWh
  yearlyEnergy: number; // kWh
  
  // Cost Analysis
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  
  // Optimization
  optimizationPotential: number; // % possible reduction
  recommendations: string[];
  
  // Tracking
  lastUpdated: Date;
}

export interface EnergyTariff {
  id: string;
  utilityProvider: string;
  tariffName: string;
  tariffType: TariffType;
  
  // Rate Structure
  rates: Array<{
    name: string;
    rate: number; // $/kWh
    startTime?: string;
    endTime?: string;
    threshold?: number; // kWh
    season?: 'summer' | 'winter';
  }>;
  
  // Demand Charges
  demandCharges?: Array<{
    name: string;
    rate: number; // $/kW
    threshold: number; // kW
  }>;
  
  // Fixed Charges
  monthlyFixedCharge: number;
  connectionCharge: number;
  
  // Renewable Energy Credits
  solarCreditRate?: number;
  netMeteringAvailable: boolean;
  
  // Validity
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyOptimization {
  id: string;
  type: 'schedule' | 'setpoint' | 'load_shift' | 'demand_response';
  
  // Optimization Details
  name: string;
  description: string;
  targetReduction: number; // %
  
  // Implementation
  equipment: string[];
  parameters: Record<string, any>;
  
  // Schedule
  enabled: boolean;
  schedule: {
    startDate: Date;
    endDate?: Date;
    activeHours?: string[];
    activeDays?: number[];
  };
  
  // Results
  actualReduction?: number; // %
  energySaved?: number; // kWh
  costSaved?: number; // $
  
  // Tracking
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemandResponse {
  id: string;
  eventType: 'voluntary' | 'mandatory' | 'price_signal';
  
  // Event Details
  utilityEventId?: string;
  startTime: Date;
  endTime: Date;
  targetReduction: number; // kW
  incentiveRate?: number; // $/kW
  
  // Response Strategy
  strategy: {
    lightingReduction: number; // %
    hvacAdjustment: number; // degrees
    nonCriticalShutdown: string[];
  };
  
  // Results
  baselineLoad: number; // kW
  actualLoad: number; // kW
  reductionAchieved: number; // kW
  incentiveEarned?: number; // $
  
  // Status
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyCost {
  id: string;
  period: { startDate: Date; endDate: Date };
  
  // Consumption
  totalEnergy: number; // kWh
  peakDemand: number; // kW
  loadFactor: number; // %
  
  // Cost Breakdown
  energyCharges: number;
  demandCharges: number;
  fixedCharges: number;
  taxes: number;
  totalCost: number;
  
  // Comparison
  previousPeriodCost: number;
  yearOverYearChange: number; // %
  budgetVariance: number; // %
  
  // By Category
  costByEquipment: Array<{
    equipmentType: EquipmentType;
    energy: number;
    cost: number;
    percentage: number;
  }>;
  
  // Opportunities
  savingsOpportunities: Array<{
    measure: string;
    potentialSavings: number;
    investmentRequired: number;
    paybackPeriod: number; // months
  }>;
}

export interface RenewableEnergy {
  id: string;
  source: EnergySource;
  
  // System Info
  capacity: number; // kW
  installedDate: Date;
  manufacturer: string;
  model: string;
  
  // Current Production
  currentOutput: number; // kW
  dailyGeneration: number; // kWh
  monthlyGeneration: number; // kWh
  yearlyGeneration: number; // kWh
  
  // Performance
  capacityFactor: number; // %
  performanceRatio: number; // %
  availability: number; // %
  
  // Financial
  installationCost: number;
  maintenanceCost: number;
  energyValue: number; // $ saved
  paybackProgress: number; // %
  
  // Environmental
  co2Avoided: number; // tons
  
  // Status
  isOperational: boolean;
  lastMaintenance: Date;
  nextMaintenance: Date;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

class EnergyManagementSystem extends EventEmitter {
  private facilityId: string;
  private userId: string;
  private meters: Map<string, EnergyMeter> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(facilityId: string, userId: string) {
    super();
    this.facilityId = facilityId;
    this.userId = userId;
    this.initializeSystem();
  }

  /**
   * Initialize energy monitoring system
   */
  private async initializeSystem(): Promise<void> {
    try {
      // Load energy meters
      await this.loadEnergyMeters();
      
      // Start monitoring
      this.startEnergyMonitoring();
      
      // Load tariff information
      await this.loadTariffInfo();
      
      logger.info('api', 'Energy management system initialized');
    } catch (error) {
      logger.error('api', 'Failed to initialize energy system:', error );
    }
  }

  /**
   * Add energy meter
   */
  async addEnergyMeter(meterData: Omit<EnergyMeter, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnergyMeter> {
    try {
      const meter: EnergyMeter = {
        id: this.generateMeterId(),
        ...meterData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveMeter(meter);
      this.meters.set(meter.id, meter);

      // Start polling for this meter
      this.startMeterPolling(meter.id);

      this.emit('meter-added', meter);
      logger.info('api', `Added energy meter: ${meter.name}`);
      
      return meter;
    } catch (error) {
      logger.error('api', 'Failed to add energy meter:', error );
      throw error;
    }
  }

  /**
   * Get real-time power consumption
   */
  async getRealTimePower(): Promise<{
    totalPower: number;
    byMeter: Array<{ meterId: string; name: string; power: number }>;
    byEquipment: Array<{ type: EquipmentType; power: number }>;
  }> {
    try {
      let totalPower = 0;
      const byMeter = [];
      const byEquipmentMap: Record<EquipmentType, number> = {} as any;

      for (const [meterId, meter] of this.meters) {
        totalPower += meter.currentPower;
        byMeter.push({
          meterId,
          name: meter.name,
          power: meter.currentPower
        });

        // Get equipment connected to this meter
        const equipment = await this.getEquipmentByMeter(meterId);
        for (const eq of equipment) {
          byEquipmentMap[eq.equipmentType] = (byEquipmentMap[eq.equipmentType] || 0) + eq.actualPower;
        }
      }

      const byEquipment = Object.entries(byEquipmentMap).map(([type, power]) => ({
        type: type as EquipmentType,
        power
      }));

      return { totalPower, byMeter, byEquipment };
    } catch (error) {
      logger.error('api', 'Failed to get real-time power:', error );
      throw error;
    }
  }

  /**
   * Record power consumption
   */
  async recordPowerConsumption(
    meterId: string,
    data: Omit<PowerConsumption, 'id' | 'meterId' | 'timestamp' | 'cost'>
  ): Promise<PowerConsumption> {
    try {
      const meter = this.meters.get(meterId);
      if (!meter) throw new Error('Meter not found');

      // Get current tariff rate
      const energyRate = await this.getCurrentEnergyRate();
      const cost = data.energy * energyRate;

      const consumption: PowerConsumption = {
        id: this.generateConsumptionId(),
        meterId,
        timestamp: new Date(),
        ...data,
        energyRate,
        cost
      };

      await this.saveConsumption(consumption);

      // Update meter readings
      meter.currentPower = data.power;
      meter.voltage = data.voltage;
      meter.current = data.current;
      meter.powerFactor = data.powerFactor;
      meter.dailyEnergy += data.energy;
      meter.monthlyEnergy += data.energy;
      meter.totalEnergy += data.energy;
      meter.lastReading = new Date();
      meter.updatedAt = new Date();

      await this.saveMeter(meter);

      // Check for anomalies
      await this.checkPowerAnomalies(meter, consumption);

      this.emit('power-recorded', consumption);
      
      return consumption;
    } catch (error) {
      logger.error('api', 'Failed to record power consumption:', error );
      throw error;
    }
  }

  /**
   * Get energy analytics
   */
  async getEnergyAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalConsumption: number;
    totalCost: number;
    peakDemand: number;
    averageLoad: number;
    loadFactor: number;
    consumptionByHour: Array<{ hour: number; consumption: number; cost: number }>;
    consumptionByDay: Array<{ date: Date; consumption: number; cost: number }>;
    consumptionByEquipment: Array<{ type: EquipmentType; consumption: number; percentage: number }>;
    costBreakdown: {
      energy: number;
      demand: number;
      fixed: number;
      total: number;
    };
  }> {
    try {
      const consumptions = await this.getConsumptionsInRange(startDate, endDate);
      
      const totalConsumption = consumptions.reduce((sum, c) => sum + c.energy, 0);
      const totalCost = consumptions.reduce((sum, c) => sum + c.cost, 0);
      const peakDemand = Math.max(...consumptions.map(c => c.power));
      const averageLoad = consumptions.reduce((sum, c) => sum + c.power, 0) / consumptions.length || 0;
      const loadFactor = averageLoad / peakDemand * 100 || 0;

      // Hourly analysis
      const consumptionByHour = this.aggregateByHour(consumptions);

      // Daily analysis
      const consumptionByDay = this.aggregateByDay(consumptions);

      // Equipment analysis
      const consumptionByEquipment = await this.analyzeEquipmentConsumption(startDate, endDate);

      // Cost breakdown
      const costBreakdown = await this.calculateCostBreakdown(consumptions, peakDemand);

      return {
        totalConsumption,
        totalCost,
        peakDemand,
        averageLoad,
        loadFactor,
        consumptionByHour,
        consumptionByDay,
        consumptionByEquipment,
        costBreakdown
      };
    } catch (error) {
      logger.error('api', 'Failed to get energy analytics:', error );
      throw error;
    }
  }

  /**
   * Create optimization strategy
   */
  async createOptimization(
    optimizationData: Omit<EnergyOptimization, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EnergyOptimization> {
    try {
      const optimization: EnergyOptimization = {
        id: this.generateOptimizationId(),
        ...optimizationData,
        createdBy: this.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveOptimization(optimization);

      // Apply optimization if enabled
      if (optimization.enabled) {
        await this.applyOptimization(optimization);
      }

      this.emit('optimization-created', optimization);
      logger.info('api', `Created optimization: ${optimization.name}`);
      
      return optimization;
    } catch (error) {
      logger.error('api', 'Failed to create optimization:', error );
      throw error;
    }
  }

  /**
   * Handle demand response event
   */
  async handleDemandResponse(
    eventData: Omit<DemandResponse, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DemandResponse> {
    try {
      const event: DemandResponse = {
        id: this.generateDemandResponseId(),
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveDemandResponse(event);

      // Execute response strategy if active
      if (event.status === 'active') {
        await this.executeDemandResponse(event);
      }

      this.emit('demand-response-created', event);
      logger.info('api', `Created demand response event: ${event.id}`);
      
      return event;
    } catch (error) {
      logger.error('api', 'Failed to handle demand response:', error );
      throw error;
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<Array<{
    type: string;
    description: string;
    potentialSavings: number;
    implementation: string;
    priority: 'low' | 'medium' | 'high';
  }>> {
    try {
      const recommendations = [];

      // Analyze current consumption patterns
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const analytics = await this.getEnergyAnalytics(lastMonth, new Date());

      // Load shifting recommendation
      if (analytics.loadFactor < 70) {
        recommendations.push({
          type: 'load_shifting',
          description: 'Shift non-critical loads to off-peak hours',
          potentialSavings: analytics.totalCost * 0.15,
          implementation: 'Reschedule irrigation and non-critical HVAC to night hours',
          priority: 'high'
        });
      }

      // Peak demand reduction
      if (analytics.peakDemand > analytics.averageLoad * 2) {
        recommendations.push({
          type: 'demand_reduction',
          description: 'Reduce peak demand through load staging',
          potentialSavings: analytics.costBreakdown.demand * 0.2,
          implementation: 'Implement sequential equipment startup',
          priority: 'high'
        });
      }

      // Lighting optimization
      const lightingConsumption = analytics.consumptionByEquipment.find(e => e.type === 'lighting');
      if (lightingConsumption && lightingConsumption.percentage > 40) {
        recommendations.push({
          type: 'lighting_optimization',
          description: 'Optimize lighting schedules based on DLI targets',
          potentialSavings: lightingConsumption.consumption * 0.1 * analytics.totalCost / analytics.totalConsumption,
          implementation: 'Implement dynamic lighting control based on natural light',
          priority: 'medium'
        });
      }

      // HVAC optimization
      const hvacConsumption = analytics.consumptionByEquipment.find(e => e.type === 'hvac');
      if (hvacConsumption && hvacConsumption.percentage > 30) {
        recommendations.push({
          type: 'hvac_optimization',
          description: 'Optimize HVAC setpoints and schedules',
          potentialSavings: hvacConsumption.consumption * 0.15 * analytics.totalCost / analytics.totalConsumption,
          implementation: 'Widen temperature deadbands during non-critical hours',
          priority: 'medium'
        });
      }

      // Power factor correction
      const avgPowerFactor = await this.getAveragePowerFactor();
      if (avgPowerFactor < 0.9) {
        recommendations.push({
          type: 'power_factor_correction',
          description: 'Install power factor correction equipment',
          potentialSavings: analytics.totalCost * 0.05,
          implementation: 'Install capacitor banks to improve power factor',
          priority: 'low'
        });
      }

      return recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);
    } catch (error) {
      logger.error('api', 'Failed to get optimization recommendations:', error );
      throw error;
    }
  }

  /**
   * Track renewable energy production
   */
  async updateRenewableProduction(
    renewableId: string,
    production: { currentOutput: number; dailyGeneration: number }
  ): Promise<RenewableEnergy> {
    try {
      const renewable = await this.getRenewableSystem(renewableId);
      if (!renewable) throw new Error('Renewable system not found');

      renewable.currentOutput = production.currentOutput;
      renewable.dailyGeneration = production.dailyGeneration;
      renewable.monthlyGeneration += production.dailyGeneration;
      renewable.yearlyGeneration += production.dailyGeneration;

      // Calculate performance metrics
      renewable.capacityFactor = (renewable.dailyGeneration / 24) / renewable.capacity * 100;
      
      // Calculate financial metrics
      const energyRate = await this.getCurrentEnergyRate();
      renewable.energyValue += production.dailyGeneration * energyRate;
      renewable.paybackProgress = (renewable.energyValue / renewable.installationCost) * 100;

      // Calculate environmental impact
      renewable.co2Avoided = renewable.yearlyGeneration * 0.0004; // tons CO2 per kWh

      renewable.updatedAt = new Date();
      await this.saveRenewableSystem(renewable);

      this.emit('renewable-updated', renewable);
      
      return renewable;
    } catch (error) {
      logger.error('api', 'Failed to update renewable production:', error );
      throw error;
    }
  }

  // Private helper methods

  private async loadEnergyMeters(): Promise<void> {
    const meters = await prisma.energyMeter.findMany({
      where: { facilityId: this.facilityId }
    });

    for (const meter of meters) {
      this.meters.set(meter.id, meter);
      this.startMeterPolling(meter.id);
    }
  }

  private startEnergyMonitoring(): void {
    // Main monitoring loop
    setInterval(async () => {
      await this.checkSystemAlerts();
      await this.updateDailyResets();
    }, 60000); // Every minute
  }

  private startMeterPolling(meterId: string): void {
    const meter = this.meters.get(meterId);
    if (!meter) return;

    // Poll based on protocol
    const pollInterval = meter.protocol === 'modbus' ? 5000 : 60000; // 5s for Modbus, 1m for others

    const interval = setInterval(async () => {
      await this.pollMeter(meterId);
    }, pollInterval);

    this.pollingIntervals.set(meterId, interval);
  }

  private async pollMeter(meterId: string): Promise<void> {
    const meter = this.meters.get(meterId);
    if (!meter) return;

    try {
      // Simulate meter reading - in production, this would connect to actual meter
      const reading = {
        power: meter.currentPower + (Math.random() - 0.5) * 2,
        voltage: 480 + (Math.random() - 0.5) * 10,
        current: meter.current + (Math.random() - 0.5),
        powerFactor: 0.85 + Math.random() * 0.1,
        energy: meter.currentPower * (5 / 3600) // kWh for 5 second interval
      };

      await this.recordPowerConsumption(meterId, reading);
    } catch (error) {
      logger.error('api', `Failed to poll meter ${meterId}:`, error);
      meter.isOnline = false;
    }
  }

  private async checkPowerAnomalies(meter: EnergyMeter, consumption: PowerConsumption): Promise<void> {
    // Check for unusual consumption
    const historicalAvg = await this.getHistoricalAverage(meter.id);
    
    if (consumption.power > historicalAvg * 1.5) {
      await this.createEnergyAlert({
        type: 'high_consumption',
        severity: 'medium',
        title: `High power consumption detected on ${meter.name}`,
        description: `Current: ${consumption.power.toFixed(1)}kW, Average: ${historicalAvg.toFixed(1)}kW`,
        meterId: meter.id
      });
    }

    // Check power quality
    if (consumption.powerFactor < 0.8) {
      await this.createEnergyAlert({
        type: 'poor_power_factor',
        severity: 'low',
        title: `Low power factor on ${meter.name}`,
        description: `Power factor: ${consumption.powerFactor.toFixed(2)}`,
        meterId: meter.id
      });
    }
  }

  private async applyOptimization(optimization: EnergyOptimization): Promise<void> {
    // Apply optimization based on type
    switch (optimization.type) {
      case 'schedule':
        await this.applyScheduleOptimization(optimization);
        break;
      case 'setpoint':
        await this.applySetpointOptimization(optimization);
        break;
      case 'load_shift':
        await this.applyLoadShiftOptimization(optimization);
        break;
      case 'demand_response':
        await this.applyDemandResponseOptimization(optimization);
        break;
    }
  }

  private async executeDemandResponse(event: DemandResponse): Promise<void> {
    // Execute demand response strategy
    logger.info('api', `Executing demand response: ${event.id}`);
    
    // Reduce lighting
    if (event.strategy.lightingReduction > 0) {
      // Implement lighting reduction
    }

    // Adjust HVAC
    if (event.strategy.hvacAdjustment !== 0) {
      // Implement HVAC adjustment
    }

    // Shutdown non-critical loads
    for (const equipment of event.strategy.nonCriticalShutdown) {
      // Implement equipment shutdown
    }
  }

  private async loadTariffInfo(): Promise<void> {
    // Load current energy tariff
    const tariff = await prisma.energyTariff.findFirst({
      where: {
        facilityId: this.facilityId,
        effectiveDate: { lte: new Date() },
        OR: [
          { expirationDate: null },
          { expirationDate: { gte: new Date() } }
        ]
      }
    });

    if (tariff) {
      await redis.set(`tariff:${this.facilityId}`, JSON.stringify(tariff));
    }
  }

  private async getCurrentEnergyRate(): Promise<number> {
    const tariffData = await redis.get(`tariff:${this.facilityId}`);
    if (!tariffData) return 0.12; // Default rate

    const tariff: EnergyTariff = JSON.parse(tariffData);
    const currentHour = new Date().getHours();

    // Find applicable rate
    for (const rate of tariff.rates) {
      if (rate.startTime && rate.endTime) {
        const start = parseInt(rate.startTime.split(':')[0]);
        const end = parseInt(rate.endTime.split(':')[0]);
        if (currentHour >= start && currentHour < end) {
          return rate.rate;
        }
      }
    }

    return tariff.rates[0]?.rate || 0.12;
  }

  private aggregateByHour(consumptions: PowerConsumption[]): Array<{
    hour: number;
    consumption: number;
    cost: number;
  }> {
    const hourly: Record<number, { consumption: number; cost: number }> = {};

    for (const c of consumptions) {
      const hour = c.timestamp.getHours();
      if (!hourly[hour]) {
        hourly[hour] = { consumption: 0, cost: 0 };
      }
      hourly[hour].consumption += c.energy;
      hourly[hour].cost += c.cost;
    }

    return Object.entries(hourly).map(([hour, data]) => ({
      hour: parseInt(hour),
      ...data
    }));
  }

  private aggregateByDay(consumptions: PowerConsumption[]): Array<{
    date: Date;
    consumption: number;
    cost: number;
  }> {
    const daily: Record<string, { consumption: number; cost: number }> = {};

    for (const c of consumptions) {
      const dateKey = c.timestamp.toISOString().split('T')[0];
      if (!daily[dateKey]) {
        daily[dateKey] = { consumption: 0, cost: 0 };
      }
      daily[dateKey].consumption += c.energy;
      daily[dateKey].cost += c.cost;
    }

    return Object.entries(daily).map(([date, data]) => ({
      date: new Date(date),
      ...data
    }));
  }

  private async analyzeEquipmentConsumption(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ type: EquipmentType; consumption: number; percentage: number }>> {
    // Analyze consumption by equipment type
    return [];
  }

  private async calculateCostBreakdown(
    consumptions: PowerConsumption[],
    peakDemand: number
  ): Promise<{ energy: number; demand: number; fixed: number; total: number }> {
    const energyCost = consumptions.reduce((sum, c) => sum + c.cost, 0);
    const demandCost = peakDemand * 15; // Example demand charge
    const fixedCost = 500; // Example fixed charges
    
    return {
      energy: energyCost,
      demand: demandCost,
      fixed: fixedCost,
      total: energyCost + demandCost + fixedCost
    };
  }

  private async getHistoricalAverage(meterId: string): Promise<number> {
    // Get average consumption for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const consumptions = await prisma.powerConsumption.findMany({
      where: {
        meterId,
        timestamp: { gte: thirtyDaysAgo }
      }
    });

    return consumptions.reduce((sum, c) => sum + c.power, 0) / consumptions.length || 0;
  }

  private async getAveragePowerFactor(): Promise<number> {
    // Calculate facility-wide average power factor
    let totalPower = 0;
    let totalPowerFactor = 0;

    for (const meter of this.meters.values()) {
      totalPower += meter.currentPower;
      totalPowerFactor += meter.currentPower * meter.powerFactor;
    }

    return totalPower > 0 ? totalPowerFactor / totalPower : 0.85;
  }

  private async checkSystemAlerts(): Promise<void> {
    // Check for system-wide energy alerts
  }

  private async updateDailyResets(): Promise<void> {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      // Reset daily counters
      for (const meter of this.meters.values()) {
        meter.dailyEnergy = 0;
        await this.saveMeter(meter);
      }
    }

    if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
      // Reset monthly counters
      for (const meter of this.meters.values()) {
        meter.monthlyEnergy = 0;
        await this.saveMeter(meter);
      }
    }
  }

  private async createEnergyAlert(alert: any): Promise<void> {
    // Create and send energy alert
    logger.info('api', 'Energy alert:', { data: alert });
  }

  private async applyScheduleOptimization(optimization: EnergyOptimization): Promise<void> {
    // Implement schedule optimization
  }

  private async applySetpointOptimization(optimization: EnergyOptimization): Promise<void> {
    // Implement setpoint optimization
  }

  private async applyLoadShiftOptimization(optimization: EnergyOptimization): Promise<void> {
    // Implement load shift optimization
  }

  private async applyDemandResponseOptimization(optimization: EnergyOptimization): Promise<void> {
    // Implement demand response optimization
  }

  // Database operations
  private async saveMeter(meter: EnergyMeter): Promise<void> {
    await prisma.energyMeter.upsert({
      where: { id: meter.id },
      create: { ...meter, facilityId: this.facilityId },
      update: meter
    });
  }

  private async saveConsumption(consumption: PowerConsumption): Promise<void> {
    await prisma.powerConsumption.create({
      data: { ...consumption, facilityId: this.facilityId }
    });
  }

  private async saveOptimization(optimization: EnergyOptimization): Promise<void> {
    await prisma.energyOptimization.upsert({
      where: { id: optimization.id },
      create: { ...optimization, facilityId: this.facilityId },
      update: optimization
    });
  }

  private async saveDemandResponse(event: DemandResponse): Promise<void> {
    await prisma.demandResponse.upsert({
      where: { id: event.id },
      create: { ...event, facilityId: this.facilityId },
      update: event
    });
  }

  private async saveRenewableSystem(renewable: RenewableEnergy): Promise<void> {
    await prisma.renewableEnergy.upsert({
      where: { id: renewable.id },
      create: { ...renewable, facilityId: this.facilityId },
      update: renewable
    });
  }

  private async getEquipmentByMeter(meterId: string): Promise<EquipmentEnergy[]> {
    return await prisma.equipmentEnergy.findMany({
      where: { meterId }
    });
  }

  private async getConsumptionsInRange(startDate: Date, endDate: Date): Promise<PowerConsumption[]> {
    return await prisma.powerConsumption.findMany({
      where: {
        facilityId: this.facilityId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getRenewableSystem(renewableId: string): Promise<RenewableEnergy | null> {
    return await prisma.renewableEnergy.findUnique({
      where: { id: renewableId }
    });
  }

  // Cleanup
  public destroy(): void {
    // Stop all polling intervals
    for (const interval of this.pollingIntervals.values()) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
    this.removeAllListeners();
  }

  // ID generators
  private generateMeterId(): string {
    return `meter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConsumptionId(): string {
    return `consumption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOptimizationId(): string {
    return `optimization_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDemandResponseId(): string {
    return `dr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { EnergyManagementSystem };
export default EnergyManagementSystem;