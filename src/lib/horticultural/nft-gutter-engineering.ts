/**
 * NFT Gutter Engineering System
 * Real technical calculations for nutrient film technique systems
 * Based on commercial horticultural engineering standards
 */

export interface NFTGutterSpecs {
  // Physical dimensions (all in meters unless specified)
  length: number;
  width: number;           // Internal width
  depth: number;           // Internal depth
  wallThickness: number;   // Gutter wall thickness
  slope: number;           // degrees - typically 1:40 to 1:80 ratio
  
  // Material properties
  material: 'PVC' | 'ABS' | 'HDPE' | 'stainless_steel';
  thermalExpansion: number; // coefficient per °C
  maxLoadCapacity: number;  // kg/m distributed load
  
  // Flow characteristics
  flowRate: number;        // L/min - typically 1-4 L/min per gutter
  filmDepth: number;       // mm - optimal 2-3mm film depth
  reynoldsNumber: number;  // for flow characterization
}

export interface PlantSpacingData {
  species: string;
  cultivar: string;
  
  // Growth characteristics
  seedlingDiameter: number;     // cm at transplant
  matureCanopyDiameter: number; // cm at harvest
  canopyHeight: number;         // cm mature height
  rootSpread: number;          // cm lateral root spread
  
  // Physiological data
  leafAreaIndex: number;        // LAI at maturity
  lightSaturationPoint: number; // μmol/m²/s PPFD
  lightCompensationPoint: number; // μmol/m²/s PPFD
  photosynthesisEfficiency: number; // quantum efficiency
  
  // Growth timing
  daysToHarvest: number;
  peakGrowthPhase: [number, number]; // [start_day, end_day]
  
  // Economic data
  plantValue: number;           // $ per plant at harvest
  costPerSeedling: number;      // $ per transplant
}

export interface EnvironmentalConstraints {
  // Climate control limitations
  minTemperature: number;       // °C
  maxTemperature: number;       // °C
  optimalTemperature: number;   // °C
  
  minHumidity: number;         // %RH
  maxHumidity: number;         // %RH
  optimalHumidity: number;     // %RH
  
  // Air circulation
  minAirVelocity: number;      // m/s
  maxAirVelocity: number;      // m/s
  
  // Lighting constraints
  dailyLightIntegral: number;   // mol/m²/day
  maxInstantaneousPPFD: number; // μmol/m²/s
  photoperiod: number;         // hours/day
}

export interface NutrientSystemSpecs {
  // Solution properties
  ecRange: [number, number];    // mS/cm [min, max]
  phRange: [number, number];    // pH [min, max]  
  temperature: number;          // °C solution temp
  dissolvedOxygen: number;      // mg/L minimum DO
  
  // Flow system
  pumpCapacity: number;         // L/min total system
  pressureDrop: number;         // kPa across system
  reservoirVolume: number;      // L total volume
  turnoverRate: number;         // complete changes per hour
  
  // Monitoring requirements
  ecTolerance: number;          // ±mS/cm acceptable variation
  phTolerance: number;          // ±pH acceptable variation
  temperatureTolerance: number; // ±°C acceptable variation
}

/**
 * Technical spacing calculations based on plant interference theory
 */
export class NFTSpacingCalculator {
  private gutterSpecs: NFTGutterSpecs;
  private plantData: PlantSpacingData;
  private environment: EnvironmentalConstraints;
  private nutrientSystem: NutrientSystemSpecs;
  
  constructor(
    gutterSpecs: NFTGutterSpecs,
    plantData: PlantSpacingData,
    environment: EnvironmentalConstraints,
    nutrientSystem: NutrientSystemSpecs
  ) {
    this.gutterSpecs = gutterSpecs;
    this.plantData = plantData;
    this.environment = environment;
    this.nutrientSystem = nutrientSystem;
  }

  /**
   * Calculate optimal plant spacing based on growth interference models
   * Uses established horticultural spacing formulas
   */
  calculateOptimalSpacing(daysAfterTransplant: number): {
    spacing: number;           // cm between plant centers
    plantDensity: number;      // plants per m²
    lightInterception: number; // % of available light
    competitionIndex: number;  // 0-1, 0=no competition
    reasoning: string;
  } {
    // Current canopy diameter based on growth curve
    const canopyDiameter = this.calculateCanopyDiameter(daysAfterTransplant);
    
    // Light interception model (Monsi-Saeki equation)
    const leafAreaIndex = this.calculateCurrentLAI(daysAfterTransplant);
    const lightInterception = 1 - Math.exp(-0.5 * leafAreaIndex);
    
    // Competition coefficient based on root and shoot competition
    const competitionRadius = Math.max(canopyDiameter / 2, this.plantData.rootSpread);
    
    // Base spacing on 90% canopy coverage at maturity
    const coverageEfficiency = 0.90;
    const baseSpacing = canopyDiameter / Math.sqrt(coverageEfficiency);
    
    // Adjust for light competition using Beer-Lambert law
    const lightAdjustment = this.calculateLightSpacingAdjustment(leafAreaIndex);
    
    // Adjust for nutrient competition
    const nutrientAdjustment = this.calculateNutrientSpacingAdjustment(daysAfterTransplant);
    
    // Final spacing calculation
    const optimalSpacing = Math.max(
      baseSpacing * lightAdjustment * nutrientAdjustment,
      this.getMinimumSpacing()
    );
    
    const plantDensity = 10000 / (optimalSpacing ** 2); // plants per m²
    const competitionIndex = this.calculateCompetitionIndex(optimalSpacing, canopyDiameter);
    
    return {
      spacing: Math.round(optimalSpacing * 10) / 10, // Round to 1mm
      plantDensity: Math.round(plantDensity * 100) / 100,
      lightInterception: Math.round(lightInterception * 1000) / 10, // as percentage
      competitionIndex: Math.round(competitionIndex * 1000) / 1000,
      reasoning: this.generateSpacingReasoning(daysAfterTransplant, optimalSpacing)
    };
  }

  /**
   * Calculate current canopy diameter using sigmoid growth curve
   */
  private calculateCanopyDiameter(days: number): number {
    const maxDiameter = this.plantData.matureCanopyDiameter;
    const seedlingDiameter = this.plantData.seedlingDiameter;
    const harvestDays = this.plantData.daysToHarvest;
    
    // Sigmoid growth curve: y = L / (1 + e^(-k(x-x0)))
    const L = maxDiameter - seedlingDiameter;
    const k = 0.15; // Growth rate constant
    const x0 = harvestDays * 0.5; // Inflection point at mid-cycle
    
    const currentGrowth = L / (1 + Math.exp(-k * (days - x0)));
    return seedlingDiameter + currentGrowth;
  }

  /**
   * Calculate current Leaf Area Index
   */
  private calculateCurrentLAI(days: number): number {
    const maxLAI = this.plantData.leafAreaIndex;
    const harvestDays = this.plantData.daysToHarvest;
    
    // LAI follows canopy development
    const maturityFactor = Math.min(days / harvestDays, 1.0);
    const growthCurve = 3 * (maturityFactor ** 2) - 2 * (maturityFactor ** 3); // Smooth step
    
    return maxLAI * growthCurve;
  }

  /**
   * Calculate light-based spacing adjustment using photosynthesis models
   */
  private calculateLightSpacingAdjustment(lai: number): number {
    const availablePPFD = this.environment.maxInstantaneousPPFD;
    const lightSaturation = this.plantData.lightSaturationPoint;
    const lightCompensation = this.plantData.lightCompensationPoint;
    
    // Light extinction through canopy (Beer-Lambert law)
    const extinctionCoefficient = 0.7; // Typical for leafy crops
    const lightAtBase = availablePPFD * Math.exp(-extinctionCoefficient * lai);
    
    // Ensure bottom leaves receive compensation point
    if (lightAtBase < lightCompensation) {
      // Increase spacing to reduce LAI
      const targetLAI = -Math.log(lightCompensation / availablePPFD) / extinctionCoefficient;
      return Math.sqrt(lai / targetLAI);
    }
    
    // Optimize for light saturation
    const lightUtilization = Math.min(availablePPFD / lightSaturation, 1.0);
    return 1.0 / Math.sqrt(lightUtilization);
  }

  /**
   * Calculate nutrient-based spacing adjustment
   */
  private calculateNutrientSpacingAdjustment(days: number): number {
    // Nutrient uptake increases with plant size
    const currentBiomass = this.estimateCurrentBiomass(days);
    const matureBiomass = this.estimateCurrentBiomass(this.plantData.daysToHarvest);
    
    // Nutrient demand scaling factor
    const nutrientDemandRatio = currentBiomass / matureBiomass;
    
    // Flow rate per plant calculation
    const totalFlowRate = this.nutrientSystem.pumpCapacity;
    const gutterCount = 10; // Typical system assumption
    const flowPerGutter = totalFlowRate / gutterCount;
    
    // Each plant needs minimum flow for proper nutrition
    const minFlowPerPlant = 0.1; // L/min minimum
    const maxPlantsPerGutter = flowPerGutter / minFlowPerPlant;
    const maxDensity = maxPlantsPerGutter / this.gutterSpecs.length;
    
    // Adjust spacing based on nutrient availability
    const baseSpacing = 100 / Math.sqrt(maxDensity); // cm
    const currentSpacing = baseSpacing / Math.sqrt(nutrientDemandRatio);
    
    return currentSpacing / baseSpacing;
  }

  /**
   * Estimate plant biomass using allometric equations
   */
  private estimateCurrentBiomass(days: number): number {
    const canopyDiameter = this.calculateCanopyDiameter(days);
    const height = this.plantData.canopyHeight * (days / this.plantData.daysToHarvest);
    
    // Simple allometric model: biomass ∝ diameter² × height
    const biomassIndex = (canopyDiameter ** 2) * height;
    return biomassIndex;
  }

  /**
   * Calculate competition index between neighboring plants
   */
  private calculateCompetitionIndex(spacing: number, canopyDiameter: number): number {
    // Competition occurs when canopies overlap
    const overlapDistance = Math.max(0, canopyDiameter - spacing);
    const maxPossibleOverlap = canopyDiameter;
    
    return Math.min(overlapDistance / maxPossibleOverlap, 1.0);
  }

  /**
   * Get minimum allowable spacing based on physical constraints
   */
  private getMinimumSpacing(): number {
    // Minimum spacing considerations:
    // 1. Transplant handling space
    // 2. Air circulation requirements
    // 3. Maintenance access
    // 4. Root competition threshold
    
    const handlingSpace = 5.0; // cm minimum for transplant handling
    const airCirculation = this.plantData.seedlingDiameter * 1.5;
    const rootCompetition = this.plantData.rootSpread * 0.8;
    
    return Math.max(handlingSpace, airCirculation, rootCompetition);
  }

  /**
   * Generate technical reasoning for spacing recommendation
   */
  private generateSpacingReasoning(days: number, spacing: number): string {
    const canopyDiameter = this.calculateCanopyDiameter(days);
    const coverage = (canopyDiameter / spacing) ** 2 * 100;
    
    let reasoning = `Day ${days}: `;
    
    if (days < 7) {
      reasoning += `Transplant establishment phase. Spacing optimized for handling and early root development.`;
    } else if (days < this.plantData.peakGrowthPhase[0]) {
      reasoning += `Vegetative growth phase. Spacing allows for rapid canopy expansion while maintaining light access.`;
    } else if (days <= this.plantData.peakGrowthPhase[1]) {
      reasoning += `Peak growth phase. Spacing balanced for maximum photosynthetic efficiency and minimal competition.`;
    } else {
      reasoning += `Pre-harvest phase. Spacing maintains quality while maximizing canopy coverage (${coverage.toFixed(1)}%).`;
    }
    
    return reasoning;
  }

  /**
   * Calculate system-wide production metrics
   */
  calculateProductionMetrics(spacing: number): {
    plantsPerGutter: number;
    totalYieldEstimate: number;    // kg per gutter per cycle
    waterUseEfficiency: number;    // kg yield per L water
    lightUseEfficiency: number;    // kg yield per mol photons
    economicReturn: number;        // $ per m² per year
    spaceUtilization: number;      // % of gutter length utilized
  } {
    const plantsPerGutter = Math.floor(this.gutterSpecs.length * 100 / spacing);
    const yieldPerPlant = this.estimateYieldPerPlant();
    const totalYield = plantsPerGutter * yieldPerPlant;
    
    // Water use calculation
    const cycleLength = this.plantData.daysToHarvest;
    const dailyWaterUse = this.calculateDailyWaterUse(plantsPerGutter);
    const totalWaterUse = dailyWaterUse * cycleLength;
    const waterUseEfficiency = totalYield / totalWaterUse;
    
    // Light use calculation  
    const dailyLightUse = this.environment.dailyLightIntegral;
    const totalLightUse = dailyLightUse * cycleLength;
    const lightUseEfficiency = totalYield / totalLightUse;
    
    // Economic calculation
    const cyclesPerYear = 365 / cycleLength;
    const annualRevenue = totalYield * this.plantData.plantValue * cyclesPerYear;
    const gutterArea = this.gutterSpecs.length * this.gutterSpecs.width;
    const economicReturn = annualRevenue / gutterArea;
    
    // Space utilization
    const usedLength = (plantsPerGutter * spacing) / 100;
    const spaceUtilization = (usedLength / this.gutterSpecs.length) * 100;
    
    return {
      plantsPerGutter,
      totalYieldEstimate: Math.round(totalYield * 100) / 100,
      waterUseEfficiency: Math.round(waterUseEfficiency * 100) / 100,
      lightUseEfficiency: Math.round(lightUseEfficiency * 1000) / 1000,
      economicReturn: Math.round(economicReturn * 100) / 100,
      spaceUtilization: Math.round(spaceUtilization * 10) / 10
    };
  }

  /**
   * Estimate yield per plant based on growing conditions
   */
  private estimateYieldPerPlant(): number {
    // Base yield modified by environmental factors
    const baseYield = 0.15; // kg per lettuce plant (typical)
    
    // Temperature effect on yield
    const tempEffect = this.calculateTemperatureEffect();
    
    // Light effect on yield
    const lightEffect = this.calculateLightEffect();
    
    // Nutrient effect on yield
    const nutrientEffect = this.calculateNutrientEffect();
    
    return baseYield * tempEffect * lightEffect * nutrientEffect;
  }

  private calculateTemperatureEffect(): number {
    const optimal = this.environment.optimalTemperature;
    const min = this.environment.minTemperature;
    const max = this.environment.maxTemperature;
    
    // Assume we're maintaining optimal temperature
    return 1.0; // 100% efficiency at optimal temperature
  }

  private calculateLightEffect(): number {
    const available = this.environment.maxInstantaneousPPFD;
    const saturation = this.plantData.lightSaturationPoint;
    
    return Math.min(available / saturation, 1.0);
  }

  private calculateNutrientEffect(): number {
    // Assume optimal nutrition with proper EC/pH control
    return 1.0; // 100% efficiency with proper nutrition
  }

  private calculateDailyWaterUse(plantCount: number): number {
    // Water use based on transpiration rates
    const baseTranspiration = 0.5; // L per plant per day (lettuce)
    const plantingDensityFactor = Math.sqrt(plantCount / 40); // Normalized to 40 plants
    
    return plantCount * baseTranspiration * plantingDensityFactor;
  }
}

/**
 * Standard crop specifications for common NFT crops
 */
export const standardCropSpecs: Record<string, PlantSpacingData> = {
  'lettuce_butterhead': {
    species: 'Lactuca sativa',
    cultivar: 'Butterhead',
    seedlingDiameter: 3.0,
    matureCanopyDiameter: 25.0,
    canopyHeight: 15.0,
    rootSpread: 8.0,
    leafAreaIndex: 3.5,
    lightSaturationPoint: 300,
    lightCompensationPoint: 20,
    photosynthesisEfficiency: 0.05,
    daysToHarvest: 35,
    peakGrowthPhase: [14, 28],
    plantValue: 2.50,
    costPerSeedling: 0.25
  },
  
  'lettuce_romaine': {
    species: 'Lactuca sativa',
    cultivar: 'Romaine',
    seedlingDiameter: 3.0,
    matureCanopyDiameter: 20.0,
    canopyHeight: 25.0,
    rootSpread: 6.0,
    leafAreaIndex: 4.0,
    lightSaturationPoint: 350,
    lightCompensationPoint: 25,
    photosynthesisEfficiency: 0.055,
    daysToHarvest: 42,
    peakGrowthPhase: [18, 35],
    plantValue: 3.00,
    costPerSeedling: 0.25
  },
  
  'basil_genovese': {
    species: 'Ocimum basilicum',
    cultivar: 'Genovese',
    seedlingDiameter: 2.5,
    matureCanopyDiameter: 18.0,
    canopyHeight: 20.0,
    rootSpread: 7.0,
    leafAreaIndex: 3.0,
    lightSaturationPoint: 400,
    lightCompensationPoint: 30,
    photosynthesisEfficiency: 0.06,
    daysToHarvest: 28,
    peakGrowthPhase: [10, 21],
    plantValue: 4.00,
    costPerSeedling: 0.30
  },
  
  'arugula': {
    species: 'Eruca vesicaria',
    cultivar: 'Wild Rocket',
    seedlingDiameter: 2.0,
    matureCanopyDiameter: 15.0,
    canopyHeight: 12.0,
    rootSpread: 5.0,
    leafAreaIndex: 2.8,
    lightSaturationPoint: 250,
    lightCompensationPoint: 15,
    photosynthesisEfficiency: 0.045,
    daysToHarvest: 21,
    peakGrowthPhase: [7, 17],
    plantValue: 6.00,
    costPerSeedling: 0.20
  }
};

/**
 * Standard gutter specifications for commercial systems
 */
export const standardGutterSpecs: Record<string, NFTGutterSpecs> = {
  'standard_4inch': {
    length: 12.0,
    width: 0.10,  // 4 inch internal
    depth: 0.05,  // 2 inch depth
    wallThickness: 0.003, // 3mm PVC
    slope: 1.25,  // 1:40 ratio = 1.43 degrees
    material: 'PVC',
    thermalExpansion: 0.00008, // per °C
    maxLoadCapacity: 50, // kg/m
    flowRate: 2.0, // L/min
    filmDepth: 2.5, // mm
    reynoldsNumber: 500 // laminar flow
  },
  
  'heavy_duty_6inch': {
    length: 15.0,
    width: 0.15,  // 6 inch internal
    depth: 0.075, // 3 inch depth
    wallThickness: 0.005, // 5mm ABS
    slope: 1.0,   // 1:60 ratio
    material: 'ABS',
    thermalExpansion: 0.00009,
    maxLoadCapacity: 80,
    flowRate: 3.0,
    filmDepth: 3.0,
    reynoldsNumber: 750
  }
};