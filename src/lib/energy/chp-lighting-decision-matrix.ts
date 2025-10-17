/**
 * CHP & Lighting Decision Matrix
 * Advanced decision support system for optimizing cogeneration and lighting operations
 * based on electricity prices, CO2 value, and multiple economic scenarios
 */

export interface ElectricityPricing {
  // Time-of-use pricing
  peakPrice: number;          // $/kWh during peak hours
  midPeakPrice: number;       // $/kWh during mid-peak
  offPeakPrice: number;       // $/kWh during off-peak
  
  // Feed-in tariff (selling to grid)
  feedInTariff: number;       // $/kWh for electricity sold to grid
  netMeteringEnabled: boolean;
  exportLimit?: number;       // kW max export
  
  // Demand charges
  demandCharge: number;       // $/kW for peak demand
  demandRatchet?: number;     // % of annual peak applied monthly
}

export interface CO2Economics {
  // CO2 purchase costs
  liquidCO2Price: number;     // $/kg for purchased liquid CO2
  deliveryCharge: number;     // $/delivery
  storageCapacity: number;    // kg storage capacity
  
  // CO2 from CHP
  chpCO2Production: number;   // kg/hour when running
  co2Purity: number;          // % purity (affects plant uptake)
  
  // Plant CO2 requirements
  targetPPM: number;          // Target CO2 concentration
  ventilationRate: number;    // Air changes per hour
  greenhouseVolume: number;   // m³
  plantUptakeRate: number;    // kg/hour during photosynthesis
  
  // CO2 enrichment value
  yieldIncrease: number;      // % yield increase from CO2
  cropValuePerKg: number;     // $/kg crop value
}

export interface CHPSpecifications {
  // Technical specs
  electricalOutput: number;    // kW electrical
  thermalOutput: number;       // kW thermal
  fuelConsumption: number;     // m³/hour natural gas
  electricalEfficiency: number; // %
  thermalEfficiency: number;   // %
  totalEfficiency: number;     // %
  
  // Operating constraints
  minLoadFactor: number;       // % minimum load
  rampUpTime: number;         // minutes to start
  rampDownTime: number;       // minutes to stop
  minRunTime: number;         // hours minimum run
  minDownTime: number;        // hours minimum stop
  
  // Maintenance
  maintenanceCost: number;    // $/operating hour
  mtbf: number;               // Mean time between failures (hours)
}

export interface LightingSystem {
  // Fixture specifications
  totalPower: number;         // kW total lighting load
  efficacy: number;           // μmol/J
  zones: LightingZone[];
  
  // Control capabilities
  dimmable: boolean;
  minDimLevel: number;        // % minimum dim
  powerFactorCorrection: boolean;
}

export interface LightingZone {
  id: string;
  name: string;
  power: number;              // kW
  area: number;               // m²
  currentPPFD: number;        // μmol/m²/s
  targetDLI: number;          // mol/m²/day
  photoperiod: number;        // hours
  cropStage: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface DecisionScenario {
  id: string;
  name: string;
  description: string;
  timeHorizon: 'hourly' | 'daily' | 'weekly' | 'monthly';
  
  // Scenario parameters
  electricityPricing: ElectricityPricing;
  co2Economics: CO2Economics;
  naturalGasPrice: number;    // $/m³
  
  // Operating strategy
  strategy: 'maximize_profit' | 'minimize_cost' | 'maximize_yield' | 'balanced';
  constraints: OperatingConstraints;
}

export interface OperatingConstraints {
  // Grid constraints
  maxImport: number;          // kW max from grid
  maxExport: number;          // kW max to grid
  
  // Environmental constraints
  maxCO2Emissions?: number;   // kg/day
  renewableTarget?: number;   // % renewable energy
  
  // Production constraints
  minDLI: number;             // mol/m²/day minimum light
  minCO2Hours: number;        // hours/day of CO2 enrichment
  
  // Economic constraints
  maxDailyCost?: number;      // $/day budget
  minDailyRevenue?: number;   // $/day target
}

export interface DecisionOutput {
  scenario: DecisionScenario;
  timestamp: Date;
  
  // Hourly schedule (24 hours)
  hourlySchedule: HourlyDecision[];
  
  // Daily summary
  dailySummary: {
    totalCost: number;
    totalRevenue: number;
    netProfit: number;
    
    // Energy flows
    gridImport: number;         // kWh
    gridExport: number;         // kWh
    chpGeneration: number;      // kWh
    lightingConsumption: number; // kWh
    
    // CO2 flows
    co2FromCHP: number;         // kg
    co2Purchased: number;       // kg
    co2Consumed: number;        // kg
    
    // Performance metrics
    averageDLI: number;         // mol/m²/day
    co2EnrichmentHours: number; // hours
    chpOperatingHours: number;  // hours
    gridRevenueCapture: number; // % of optimal
  };
  
  // Key recommendations
  recommendations: Recommendation[];
  
  // Sensitivity analysis
  sensitivity: SensitivityAnalysis;
}

export interface HourlyDecision {
  hour: number;               // 0-23
  
  // CHP decision
  chpOperation: {
    run: boolean;
    powerOutput: number;      // kW
    reason: string;
  };
  
  // Lighting decisions by zone
  lightingDecisions: {
    zoneId: string;
    powerLevel: number;       // % (0-100)
    ppfd: number;            // μmol/m²/s
    reason: string;
  }[];
  
  // CO2 management
  co2Management: {
    enrichmentActive: boolean;
    sourcePreference: 'chp' | 'purchased' | 'none';
    injectionRate: number;    // kg/hour
    targetPPM: number;
  };
  
  // Economic metrics
  economics: {
    gridPrice: number;        // $/kWh current price
    feedInRevenue: number;    // $/hour from export
    lightingCost: number;     // $/hour
    chpFuelCost: number;      // $/hour
    co2Cost: number;          // $/hour
    netCostBenefit: number;   // $/hour (negative = profit)
  };
  
  // Grid interaction
  gridFlow: {
    import: number;           // kW from grid
    export: number;           // kW to grid
    netPosition: 'importing' | 'exporting' | 'balanced';
  };
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'immediate' | 'planning' | 'investment';
  title: string;
  description: string;
  impact: {
    costSavings?: number;     // $/year
    revenueIncrease?: number; // $/year
    yieldImprovement?: number; // %
    implementation: string;
  };
}

export interface SensitivityAnalysis {
  // Impact of ±10% change in key variables
  variables: {
    parameter: string;
    currentValue: number;
    impactOnProfit: number;   // $/day per 10% change
    breakEvenPoint?: number;  // Value where profit = 0
  }[];
  
  // Optimal operating windows
  optimalWindows: {
    parameter: string;
    optimalRange: [number, number];
    currentPosition: number;
  }[];
}

export class CHPLightingDecisionMatrix {
  private scenarios: Map<string, DecisionScenario> = new Map();
  private chpSpecs: CHPSpecifications;
  private lightingSystem: LightingSystem;
  
  constructor(
    chpSpecs: CHPSpecifications,
    lightingSystem: LightingSystem
  ) {
    this.chpSpecs = chpSpecs;
    this.lightingSystem = lightingSystem;
  }
  
  /**
   * Add a scenario for analysis
   */
  addScenario(scenario: DecisionScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }
  
  /**
   * Run decision analysis for all scenarios
   */
  async analyzeAllScenarios(): Promise<Map<string, DecisionOutput>> {
    const results = new Map<string, DecisionOutput>();
    
    for (const [id, scenario] of this.scenarios) {
      const output = await this.analyzeScenario(scenario);
      results.set(id, output);
    }
    
    return results;
  }
  
  /**
   * Analyze a single scenario
   */
  async analyzeScenario(scenario: DecisionScenario): Promise<DecisionOutput> {
    const hourlySchedule: HourlyDecision[] = [];
    
    // Analyze each hour of the day
    for (let hour = 0; hour < 24; hour++) {
      const decision = this.optimizeHour(hour, scenario);
      hourlySchedule.push(decision);
    }
    
    // Calculate daily summary
    const dailySummary = this.calculateDailySummary(hourlySchedule, scenario);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      hourlySchedule, 
      dailySummary, 
      scenario
    );
    
    // Perform sensitivity analysis
    const sensitivity = this.performSensitivityAnalysis(scenario, dailySummary);
    
    return {
      scenario,
      timestamp: new Date(),
      hourlySchedule,
      dailySummary,
      recommendations,
      sensitivity
    };
  }
  
  /**
   * Optimize operations for a specific hour
   */
  private optimizeHour(hour: number, scenario: DecisionScenario): HourlyDecision {
    // Determine time-of-use period
    const gridPrice = this.getHourlyGridPrice(hour, scenario.electricityPricing);
    const feedInTariff = scenario.electricityPricing.feedInTariff;
    
    // Calculate lighting requirements
    const lightingNeeds = this.calculateLightingNeeds(hour, scenario);
    
    // Determine if it's more profitable to run CHP or buy from grid
    const chpDecision = this.optimizeCHPOperation(
      gridPrice,
      feedInTariff,
      scenario.naturalGasPrice,
      lightingNeeds.totalPower,
      scenario
    );
    
    // Optimize lighting levels based on grid prices and constraints
    const lightingDecisions = this.optimizeLightingLevels(
      hour,
      gridPrice,
      chpDecision.run ? this.chpSpecs.electricalOutput : 0,
      scenario
    );
    
    // Determine CO2 strategy
    const co2Management = this.optimizeCO2Management(
      hour,
      chpDecision.run,
      scenario
    );
    
    // Calculate grid flows
    const gridFlow = this.calculateGridFlow(
      chpDecision,
      lightingDecisions,
      scenario
    );
    
    // Calculate economics
    const economics = this.calculateHourlyEconomics(
      chpDecision,
      lightingDecisions,
      co2Management,
      gridFlow,
      gridPrice,
      feedInTariff,
      scenario
    );
    
    return {
      hour,
      chpOperation: chpDecision,
      lightingDecisions,
      co2Management,
      economics,
      gridFlow
    };
  }
  
  /**
   * Get hourly grid price based on TOU schedule
   */
  private getHourlyGridPrice(hour: number, pricing: ElectricityPricing): number {
    // Peak hours: 4 PM - 9 PM (16:00 - 21:00)
    if (hour >= 16 && hour < 21) {
      return pricing.peakPrice;
    }
    // Mid-peak: 12 PM - 4 PM, 9 PM - 11 PM
    else if ((hour >= 12 && hour < 16) || (hour >= 21 && hour < 23)) {
      return pricing.midPeakPrice;
    }
    // Off-peak: 11 PM - 12 PM
    else {
      return pricing.offPeakPrice;
    }
  }
  
  /**
   * Calculate lighting needs for the hour
   */
  private calculateLightingNeeds(
    hour: number, 
    scenario: DecisionScenario
  ): { totalPower: number; zoneRequirements: Map<string, number> } {
    const zoneRequirements = new Map<string, number>();
    let totalPower = 0;
    
    for (const zone of this.lightingSystem.zones) {
      // Check if lights should be on based on photoperiod
      const lightsOn = this.isWithinPhotoperiod(hour, zone.photoperiod);
      
      if (lightsOn) {
        // Calculate required power to meet DLI target
        const hoursRemaining = this.calculateRemainingPhotoperiod(hour, zone.photoperiod);
        const dliAchieved = this.calculateCurrentDLI(hour, zone);
        const dliRemaining = zone.targetDLI - dliAchieved;
        
        if (dliRemaining > 0 && hoursRemaining > 0) {
          const requiredPPFD = (dliRemaining * 1000000) / (hoursRemaining * 3600);
          const requiredPower = (requiredPPFD * zone.area) / 
            (this.lightingSystem.efficacy * 1000);
          
          zoneRequirements.set(zone.id, Math.min(requiredPower, zone.power));
          totalPower += zoneRequirements.get(zone.id)!;
        } else {
          zoneRequirements.set(zone.id, 0);
        }
      } else {
        zoneRequirements.set(zone.id, 0);
      }
    }
    
    return { totalPower, zoneRequirements };
  }
  
  /**
   * Optimize CHP operation decision
   */
  private optimizeCHPOperation(
    gridPrice: number,
    feedInTariff: number,
    gasPrice: number,
    lightingLoad: number,
    scenario: DecisionScenario
  ): { run: boolean; powerOutput: number; reason: string } {
    // Calculate CHP operating cost
    const fuelCost = gasPrice * this.chpSpecs.fuelConsumption;
    const maintenanceCost = this.chpSpecs.maintenanceCost;
    const totalOperatingCost = fuelCost + maintenanceCost;
    
    // Calculate CHP benefits
    const electricityValue = this.chpSpecs.electricalOutput * gridPrice;
    const heatValue = this.calculateHeatValue(scenario);
    const co2Value = this.calculateCO2Value(scenario);
    
    // Net electricity after lighting
    const netElectricity = this.chpSpecs.electricalOutput - lightingLoad;
    
    // Calculate total benefit
    let totalBenefit: number;
    if (netElectricity > 0) {
      // Exporting power
      totalBenefit = (lightingLoad * gridPrice) + // Avoided purchase
                     (netElectricity * feedInTariff) + // Export revenue
                     heatValue + 
                     co2Value;
    } else {
      // Still importing some power
      totalBenefit = (this.chpSpecs.electricalOutput * gridPrice) + // Avoided purchase
                     heatValue + 
                     co2Value;
    }
    
    // Decision logic
    const netBenefit = totalBenefit - totalOperatingCost;
    const marginPercent = (netBenefit / totalOperatingCost) * 100;
    
    // Consider strategy
    let runCHP = false;
    let reason = '';
    
    switch (scenario.strategy) {
      case 'maximize_profit':
        runCHP = netBenefit > 0 && marginPercent > 15; // 15% margin threshold
        reason = `Net benefit: $${netBenefit.toFixed(2)}/hr (${marginPercent.toFixed(0)}% margin)`;
        break;
        
      case 'minimize_cost':
        const gridCost = lightingLoad * gridPrice;
        const chpCost = totalOperatingCost - heatValue - co2Value;
        runCHP = chpCost < gridCost;
        reason = `CHP cost: $${chpCost.toFixed(2)}/hr vs Grid: $${gridCost.toFixed(2)}/hr`;
        break;
        
      case 'maximize_yield':
        // Prioritize CO2 production for yield
        runCHP = co2Value > totalOperatingCost * 0.3; // CO2 covers 30% of cost
        reason = `CO2 value: $${co2Value.toFixed(2)}/hr supports yield optimization`;
        break;
        
      case 'balanced':
        runCHP = netBenefit > 0 && (marginPercent > 10 || feedInTariff > gridPrice * 0.8);
        reason = `Balanced decision: ${marginPercent.toFixed(0)}% margin, Feed-in ratio: ${(feedInTariff/gridPrice).toFixed(2)}`;
        break;
    }
    
    return {
      run: runCHP,
      powerOutput: runCHP ? this.chpSpecs.electricalOutput : 0,
      reason
    };
  }
  
  /**
   * Optimize lighting levels for each zone
   */
  private optimizeLightingLevels(
    hour: number,
    gridPrice: number,
    chpPower: number,
    scenario: DecisionScenario
  ): Array<{
    zoneId: string;
    powerLevel: number;
    ppfd: number;
    reason: string;
  }> {
    const decisions: Array<{
      zoneId: string;
      powerLevel: number;
      ppfd: number;
      reason: string;
    }> = [];
    
    let availableCHPPower = chpPower;
    
    // Sort zones by priority
    const sortedZones = [...this.lightingSystem.zones].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    for (const zone of sortedZones) {
      const isLightPeriod = this.isWithinPhotoperiod(hour, zone.photoperiod);
      
      if (!isLightPeriod) {
        decisions.push({
          zoneId: zone.id,
          powerLevel: 0,
          ppfd: 0,
          reason: 'Outside photoperiod'
        });
        continue;
      }
      
      // Calculate optimal power level
      let optimalPower = zone.power; // Default to full power
      let reason = 'Standard operation';
      
      // High grid price optimization
      if (gridPrice > scenario.electricityPricing.midPeakPrice * 1.5) {
        if (zone.priority === 'low' || zone.priority === 'medium') {
          // Reduce non-critical lighting during expensive periods
          optimalPower *= 0.7; // 70% power
          reason = 'Reduced due to high grid price';
        }
      }
      
      // Use CHP power first
      if (availableCHPPower > 0) {
        const chpAllocation = Math.min(optimalPower, availableCHPPower);
        availableCHPPower -= chpAllocation;
        
        if (chpAllocation >= optimalPower * 0.9) {
          reason = 'Powered by CHP';
        } else {
          reason = 'Partially powered by CHP';
        }
      }
      
      // Check DLI achievement
      const currentDLI = this.calculateCurrentDLI(hour, zone);
      if (currentDLI >= zone.targetDLI * 0.95) {
        optimalPower = 0;
        reason = 'DLI target achieved';
      }
      
      const powerLevel = (optimalPower / zone.power) * 100;
      const ppfd = (optimalPower * this.lightingSystem.efficacy * 1000) / zone.area;
      
      decisions.push({
        zoneId: zone.id,
        powerLevel,
        ppfd,
        reason
      });
    }
    
    return decisions;
  }
  
  /**
   * Optimize CO2 management strategy
   */
  private optimizeCO2Management(
    hour: number,
    chpRunning: boolean,
    scenario: DecisionScenario
  ): {
    enrichmentActive: boolean;
    sourcePreference: 'chp' | 'purchased' | 'none';
    injectionRate: number;
    targetPPM: number;
  } {
    // Check if it's during light period (photosynthesis active)
    const lightingActive = this.lightingSystem.zones.some(zone => 
      this.isWithinPhotoperiod(hour, zone.photoperiod)
    );
    
    if (!lightingActive) {
      return {
        enrichmentActive: false,
        sourcePreference: 'none',
        injectionRate: 0,
        targetPPM: 400 // Ambient
      };
    }
    
    // Calculate CO2 requirements
    const co2Requirement = this.calculateCO2Requirement(scenario.co2Economics);
    
    // Determine source preference
    let sourcePreference: 'chp' | 'purchased' | 'none';
    
    if (chpRunning) {
      const chpCO2Available = scenario.co2Economics.chpCO2Production;
      
      if (chpCO2Available >= co2Requirement) {
        sourcePreference = 'chp';
      } else {
        // Need supplemental CO2
        const supplementalCost = (co2Requirement - chpCO2Available) * 
          scenario.co2Economics.liquidCO2Price;
        const yieldValue = this.calculateCO2YieldValue(
          co2Requirement - chpCO2Available, 
          scenario.co2Economics
        );
        
        sourcePreference = yieldValue > supplementalCost * 1.5 ? 'purchased' : 'chp';
      }
    } else {
      // No CHP, evaluate purchased CO2
      const purchaseCost = co2Requirement * scenario.co2Economics.liquidCO2Price;
      const yieldValue = this.calculateCO2YieldValue(co2Requirement, scenario.co2Economics);
      
      sourcePreference = yieldValue > purchaseCost * 2 ? 'purchased' : 'none';
    }
    
    return {
      enrichmentActive: sourcePreference !== 'none',
      sourcePreference,
      injectionRate: sourcePreference !== 'none' ? co2Requirement : 0,
      targetPPM: scenario.co2Economics.targetPPM
    };
  }
  
  /**
   * Calculate grid power flows
   */
  private calculateGridFlow(
    chpDecision: { run: boolean; powerOutput: number },
    lightingDecisions: Array<{ zoneId: string; powerLevel: number }>,
    scenario: DecisionScenario
  ): {
    import: number;
    export: number;
    netPosition: 'importing' | 'exporting' | 'balanced';
  } {
    // Calculate total lighting load
    const lightingLoad = lightingDecisions.reduce((total, decision) => {
      const zone = this.lightingSystem.zones.find(z => z.id === decision.zoneId)!;
      return total + (zone.power * decision.powerLevel / 100);
    }, 0);
    
    const generation = chpDecision.run ? chpDecision.powerOutput : 0;
    const netPower = generation - lightingLoad;
    
    if (Math.abs(netPower) < 0.1) {
      return {
        import: 0,
        export: 0,
        netPosition: 'balanced'
      };
    } else if (netPower > 0) {
      // Excess power - check export limits
      const exportPower = Math.min(
        netPower, 
        scenario.electricityPricing.exportLimit || Infinity,
        scenario.constraints.maxExport
      );
      
      return {
        import: 0,
        export: exportPower,
        netPosition: 'exporting'
      };
    } else {
      // Need grid power
      const importPower = Math.min(
        Math.abs(netPower),
        scenario.constraints.maxImport
      );
      
      return {
        import: importPower,
        export: 0,
        netPosition: 'importing'
      };
    }
  }
  
  /**
   * Calculate hourly economics
   */
  private calculateHourlyEconomics(
    chpDecision: { run: boolean; powerOutput: number },
    lightingDecisions: Array<{ zoneId: string; powerLevel: number }>,
    co2Management: { enrichmentActive: boolean; sourcePreference: string; injectionRate: number },
    gridFlow: { import: number; export: number },
    gridPrice: number,
    feedInTariff: number,
    scenario: DecisionScenario
  ): {
    gridPrice: number;
    feedInRevenue: number;
    lightingCost: number;
    chpFuelCost: number;
    co2Cost: number;
    netCostBenefit: number;
  } {
    // Feed-in revenue from exports
    const feedInRevenue = gridFlow.export * feedInTariff;
    
    // Lighting cost (only for power imported from grid)
    const lightingCost = gridFlow.import * gridPrice;
    
    // CHP fuel cost
    const chpFuelCost = chpDecision.run ? 
      scenario.naturalGasPrice * this.chpSpecs.fuelConsumption + 
      this.chpSpecs.maintenanceCost : 0;
    
    // CO2 cost (only for purchased CO2)
    const co2Cost = co2Management.sourcePreference === 'purchased' ?
      co2Management.injectionRate * scenario.co2Economics.liquidCO2Price : 0;
    
    // Net cost/benefit (negative = profit)
    const netCostBenefit = lightingCost + chpFuelCost + co2Cost - feedInRevenue;
    
    return {
      gridPrice,
      feedInRevenue,
      lightingCost,
      chpFuelCost,
      co2Cost,
      netCostBenefit
    };
  }
  
  /**
   * Helper methods
   */
  
  private isWithinPhotoperiod(hour: number, photoperiod: number): boolean {
    // Assume lights start at 6 AM
    const startHour = 6;
    const endHour = startHour + photoperiod;
    
    return hour >= startHour && hour < endHour;
  }
  
  private calculateRemainingPhotoperiod(hour: number, photoperiod: number): number {
    const startHour = 6;
    const endHour = startHour + photoperiod;
    
    if (hour < startHour) return photoperiod;
    if (hour >= endHour) return 0;
    
    return endHour - hour;
  }
  
  private calculateCurrentDLI(hour: number, zone: LightingZone): number {
    // Simplified calculation - in reality would use historical data
    const hoursElapsed = Math.max(0, hour - 6);
    const hoursLit = Math.min(hoursElapsed, zone.photoperiod);
    
    return (zone.currentPPFD * hoursLit * 3600) / 1000000;
  }
  
  private calculateHeatValue(scenario: DecisionScenario): number {
    // Value of heat recovery (avoided heating cost)
    // Simplified - would depend on heating demand
    const heatingSeasonMultiplier = 0.7; // 70% of year needs heating
    const naturalGasHeatingCost = scenario.naturalGasPrice * 1.1; // Boiler efficiency
    const heatValue = this.chpSpecs.thermalOutput * 0.8 * // 80% utilized
      heatingSeasonMultiplier * naturalGasHeatingCost / 10; // Convert to $/kWh
    
    return heatValue;
  }
  
  private calculateCO2Value(scenario: DecisionScenario): number {
    const co2Produced = scenario.co2Economics.chpCO2Production;
    const co2Utilized = Math.min(
      co2Produced, 
      scenario.co2Economics.plantUptakeRate
    );
    
    // Value = avoided purchase cost + yield improvement value
    const avoidedPurchase = co2Utilized * scenario.co2Economics.liquidCO2Price;
    const yieldValue = this.calculateCO2YieldValue(co2Utilized, scenario.co2Economics);
    
    return avoidedPurchase + yieldValue;
  }
  
  private calculateCO2YieldValue(co2Amount: number, co2Economics: CO2Economics): number {
    // Estimate yield improvement from CO2 enrichment
    const baseYield = 50; // kg/m²/year baseline
    const enrichedYield = baseYield * (1 + co2Economics.yieldIncrease / 100);
    const yieldIncrease = enrichedYield - baseYield;
    
    // Convert to hourly value
    const hourlyYieldValue = (yieldIncrease * co2Economics.cropValuePerKg) / (365 * 24);
    
    // Scale by CO2 amount (simplified)
    const utilizationFactor = Math.min(1, co2Amount / co2Economics.plantUptakeRate);
    
    return hourlyYieldValue * utilizationFactor * 1000; // Scale for greenhouse size
  }
  
  private calculateCO2Requirement(co2Economics: CO2Economics): number {
    // Calculate CO2 needed to maintain target PPM
    const ambientPPM = 400;
    const targetPPM = co2Economics.targetPPM;
    const deltaPPM = targetPPM - ambientPPM;
    
    // CO2 loss through ventilation
    const volumePerHour = co2Economics.greenhouseVolume * co2Economics.ventilationRate;
    const co2Loss = (volumePerHour * deltaPPM * 1.8) / 1000000; // kg/hour
    
    // Plant uptake
    const totalRequirement = co2Loss + co2Economics.plantUptakeRate;
    
    return totalRequirement;
  }
  
  /**
   * Calculate daily summary from hourly decisions
   */
  private calculateDailySummary(
    hourlySchedule: HourlyDecision[],
    scenario: DecisionScenario
  ): DecisionOutput['dailySummary'] {
    // Initialize accumulators
    let totalCost = 0;
    let totalRevenue = 0;
    let gridImport = 0;
    let gridExport = 0;
    let chpGeneration = 0;
    let lightingConsumption = 0;
    let co2FromCHP = 0;
    let co2Purchased = 0;
    let co2Consumed = 0;
    let chpOperatingHours = 0;
    let co2EnrichmentHours = 0;
    
    // Process each hour
    for (const hour of hourlySchedule) {
      // Costs
      totalCost += hour.economics.lightingCost + 
                   hour.economics.chpFuelCost + 
                   hour.economics.co2Cost;
      
      // Revenue
      totalRevenue += hour.economics.feedInRevenue;
      
      // Energy flows
      gridImport += hour.gridFlow.import;
      gridExport += hour.gridFlow.export;
      
      if (hour.chpOperation.run) {
        chpGeneration += hour.chpOperation.powerOutput;
        chpOperatingHours++;
        co2FromCHP += scenario.co2Economics.chpCO2Production;
      }
      
      // Lighting consumption
      const hourlyLighting = hour.lightingDecisions.reduce((total, decision) => {
        const zone = this.lightingSystem.zones.find(z => z.id === decision.zoneId)!;
        return total + (zone.power * decision.powerLevel / 100);
      }, 0);
      lightingConsumption += hourlyLighting;
      
      // CO2 tracking
      if (hour.co2Management.enrichmentActive) {
        co2EnrichmentHours++;
        co2Consumed += hour.co2Management.injectionRate;
        
        if (hour.co2Management.sourcePreference === 'purchased') {
          co2Purchased += hour.co2Management.injectionRate;
        }
      }
    }
    
    // Calculate average DLI
    const zoneDLIs = this.lightingSystem.zones.map(zone => {
      let totalPPFD = 0;
      let lightHours = 0;
      
      for (const hour of hourlySchedule) {
        const zoneDecision = hour.lightingDecisions.find(d => d.zoneId === zone.id);
        if (zoneDecision && zoneDecision.ppfd > 0) {
          totalPPFD += zoneDecision.ppfd;
          lightHours++;
        }
      }
      
      return lightHours > 0 ? (totalPPFD / lightHours * lightHours * 3.6) / 1000 : 0;
    });
    
    const averageDLI = zoneDLIs.reduce((sum, dli) => sum + dli, 0) / zoneDLIs.length;
    
    // Calculate grid revenue capture
    const optimalRevenue = this.calculateOptimalGridRevenue(scenario);
    const gridRevenueCapture = totalRevenue / optimalRevenue * 100;
    
    return {
      totalCost,
      totalRevenue,
      netProfit: totalRevenue - totalCost,
      gridImport,
      gridExport,
      chpGeneration,
      lightingConsumption,
      co2FromCHP,
      co2Purchased,
      co2Consumed,
      averageDLI,
      co2EnrichmentHours,
      chpOperatingHours,
      gridRevenueCapture
    };
  }
  
  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    hourlySchedule: HourlyDecision[],
    dailySummary: DecisionOutput['dailySummary'],
    scenario: DecisionScenario
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Check CHP utilization
    if (dailySummary.chpOperatingHours < 12) {
      recommendations.push({
        priority: 'high',
        category: 'immediate',
        title: 'Increase CHP Operating Hours',
        description: `CHP is only running ${dailySummary.chpOperatingHours} hours/day. Consider running during more mid-peak hours.`,
        impact: {
          costSavings: (18 - dailySummary.chpOperatingHours) * 50 * 365,
          implementation: 'Adjust CHP operating schedule to include mid-peak hours'
        }
      });
    }
    
    // Check grid revenue capture
    if (dailySummary.gridRevenueCapture < 70) {
      recommendations.push({
        priority: 'high',
        category: 'planning',
        title: 'Optimize Grid Export Timing',
        description: 'Missing opportunities to export during high feed-in tariff periods',
        impact: {
          revenueIncrease: dailySummary.totalRevenue * 0.3,
          implementation: 'Shift non-critical loads to off-peak hours'
        }
      });
    }
    
    // Check lighting efficiency during peak hours
    const peakHourLighting = hourlySchedule
      .filter(h => h.hour >= 16 && h.hour < 21)
      .reduce((sum, h) => sum + h.economics.lightingCost, 0);
    
    if (peakHourLighting > dailySummary.totalCost * 0.4) {
      recommendations.push({
        priority: 'medium',
        category: 'planning',
        title: 'Reduce Peak Hour Lighting',
        description: 'High lighting costs during peak electricity prices',
        impact: {
          costSavings: peakHourLighting * 0.3 * 365,
          implementation: 'Implement dynamic photoperiod adjustment or DLI front-loading'
        }
      });
    }
    
    // Check CO2 source optimization
    if (dailySummary.co2Purchased > dailySummary.co2FromCHP * 0.5 && 
        dailySummary.chpOperatingHours < 20) {
      recommendations.push({
        priority: 'medium',
        category: 'immediate',
        title: 'Reduce CO2 Purchases',
        description: 'Significant CO2 purchases while CHP has available capacity',
        impact: {
          costSavings: dailySummary.co2Purchased * scenario.co2Economics.liquidCO2Price * 365,
          implementation: 'Align CHP operation with CO2 enrichment schedule'
        }
      });
    }
    
    // Investment recommendations
    if (scenario.electricityPricing.feedInTariff > scenario.electricityPricing.offPeakPrice * 1.5) {
      recommendations.push({
        priority: 'low',
        category: 'investment',
        title: 'Consider Battery Storage',
        description: 'High feed-in tariffs create arbitrage opportunity',
        impact: {
          revenueIncrease: dailySummary.gridExport * 0.2 * 365,
          implementation: 'Install battery system for time-shifting generation'
        }
      });
    }
    
    return recommendations;
  }
  
  /**
   * Perform sensitivity analysis
   */
  private performSensitivityAnalysis(
    scenario: DecisionScenario,
    dailySummary: DecisionOutput['dailySummary']
  ): SensitivityAnalysis {
    const baseProfit = dailySummary.netProfit;
    
    const variables = [
      {
        parameter: 'Grid Electricity Price',
        currentValue: scenario.electricityPricing.peakPrice,
        impactOnProfit: this.calculateSensitivity(
          scenario, 
          'gridPrice', 
          baseProfit
        ),
        breakEvenPoint: this.findBreakEven(scenario, 'gridPrice')
      },
      {
        parameter: 'Feed-in Tariff',
        currentValue: scenario.electricityPricing.feedInTariff,
        impactOnProfit: this.calculateSensitivity(
          scenario, 
          'feedInTariff', 
          baseProfit
        ),
        breakEvenPoint: this.findBreakEven(scenario, 'feedInTariff')
      },
      {
        parameter: 'Natural Gas Price',
        currentValue: scenario.naturalGasPrice,
        impactOnProfit: this.calculateSensitivity(
          scenario, 
          'gasPrice', 
          baseProfit
        ),
        breakEvenPoint: this.findBreakEven(scenario, 'gasPrice')
      },
      {
        parameter: 'CO2 Price',
        currentValue: scenario.co2Economics.liquidCO2Price,
        impactOnProfit: this.calculateSensitivity(
          scenario, 
          'co2Price', 
          baseProfit
        ),
        breakEvenPoint: undefined // May not have breakeven
      }
    ];
    
    const optimalWindows = [
      {
        parameter: 'CHP Operating Hours',
        optimalRange: [16, 22] as [number, number],
        currentPosition: dailySummary.chpOperatingHours
      },
      {
        parameter: 'Grid Export (kWh)',
        optimalRange: [
          dailySummary.chpGeneration * 0.3,
          dailySummary.chpGeneration * 0.7
        ] as [number, number],
        currentPosition: dailySummary.gridExport
      },
      {
        parameter: 'Average DLI',
        optimalRange: [18, 25] as [number, number],
        currentPosition: dailySummary.averageDLI
      }
    ];
    
    return { variables, optimalWindows };
  }
  
  private calculateSensitivity(
    scenario: DecisionScenario,
    parameter: string,
    baseProfit: number
  ): number {
    // Create modified scenario with 10% increase
    const modifiedScenario = this.modifyScenario(scenario, parameter, 1.1);
    
    // Run analysis with modified scenario
    const modifiedResult = this.analyzeScenario(modifiedScenario);
    const modifiedProfit = modifiedResult.dailySummary.netProfit;
    
    // Calculate impact per 10% change
    return modifiedProfit - baseProfit;
  }
  
  private findBreakEven(
    scenario: DecisionScenario,
    parameter: string
  ): number | undefined {
    // Binary search for breakeven point
    let low = 0;
    let high = this.getParameterValue(scenario, parameter) * 3;
    let iterations = 0;
    
    while (iterations < 20 && high - low > 0.01) {
      const mid = (low + high) / 2;
      const modifiedScenario = this.setParameterValue(scenario, parameter, mid);
      const result = this.analyzeScenario(modifiedScenario);
      
      if (result.dailySummary.netProfit > 0) {
        if (parameter === 'gasPrice' || parameter === 'co2Price') {
          low = mid; // For costs, profitable means we can go higher
        } else {
          high = mid; // For revenues, profitable means we can go lower
        }
      } else {
        if (parameter === 'gasPrice' || parameter === 'co2Price') {
          high = mid;
        } else {
          low = mid;
        }
      }
      
      iterations++;
    }
    
    return iterations < 20 ? (low + high) / 2 : undefined;
  }
  
  private calculateOptimalGridRevenue(scenario: DecisionScenario): number {
    // Calculate theoretical maximum grid revenue
    // Assumes perfect timing of exports during highest prices
    const maxExportCapacity = this.chpSpecs.electricalOutput;
    const peakHours = 5; // 4 PM - 9 PM
    const maxDailyRevenue = maxExportCapacity * peakHours * 
      scenario.electricityPricing.feedInTariff;
    
    return maxDailyRevenue;
  }
  
  private modifyScenario(
    scenario: DecisionScenario,
    parameter: string,
    multiplier: number
  ): DecisionScenario {
    // Deep clone scenario and modify parameter
    const modified = JSON.parse(JSON.stringify(scenario));
    
    switch (parameter) {
      case 'gridPrice':
        modified.electricityPricing.peakPrice *= multiplier;
        modified.electricityPricing.midPeakPrice *= multiplier;
        modified.electricityPricing.offPeakPrice *= multiplier;
        break;
      case 'feedInTariff':
        modified.electricityPricing.feedInTariff *= multiplier;
        break;
      case 'gasPrice':
        modified.naturalGasPrice *= multiplier;
        break;
      case 'co2Price':
        modified.co2Economics.liquidCO2Price *= multiplier;
        break;
    }
    
    return modified;
  }
  
  private getParameterValue(scenario: DecisionScenario, parameter: string): number {
    switch (parameter) {
      case 'gridPrice':
        return scenario.electricityPricing.peakPrice;
      case 'feedInTariff':
        return scenario.electricityPricing.feedInTariff;
      case 'gasPrice':
        return scenario.naturalGasPrice;
      case 'co2Price':
        return scenario.co2Economics.liquidCO2Price;
      default:
        return 0;
    }
  }
  
  private setParameterValue(
    scenario: DecisionScenario,
    parameter: string,
    value: number
  ): DecisionScenario {
    const ratio = value / this.getParameterValue(scenario, parameter);
    return this.modifyScenario(scenario, parameter, ratio);
  }
}

// Export types and class
export default CHPLightingDecisionMatrix;