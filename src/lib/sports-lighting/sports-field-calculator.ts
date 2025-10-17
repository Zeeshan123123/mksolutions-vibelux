/**
 * Sports Field Lighting Calculator
 * 
 * Specialized for soccer fields, football fields, and other sports venues
 * Includes FIFA/UEFA compliance and turfgrass PPFD requirements
 */

export interface SportsFieldConfiguration {
  // Field specifications
  fieldType: 'soccer' | 'football' | 'baseball' | 'tennis' | 'cricket' | 'rugby' | 'lacrosse' | 'field-hockey';
  fieldLength: number; // meters
  fieldWidth: number; // meters
  
  // Lighting standards
  lightingStandard: 'FIFA' | 'UEFA' | 'NCAA' | 'NFL' | 'MLB' | 'ITF' | 'custom';
  competitionLevel: 'recreational' | 'amateur' | 'semi-professional' | 'professional' | 'international';
  
  // Turfgrass requirements
  grassType: 'bermuda' | 'zoysia' | 'st-augustine' | 'fescue' | 'ryegrass' | 'kentucky-bluegrass' | 'artificial';
  maintainOffSeason: boolean;
  supplementalLighting: boolean; // For turfgrass health
  
  // Lighting system
  poleHeight: number; // meters
  poleConfiguration: 'perimeter' | 'corner' | 'sideline' | 'boom-mobile';
  fixtureType: 'led' | 'metal-halide' | 'high-pressure-sodium';
  fixtureCount: number;
  fixtureWattage: number;
  beamAngle: number;
  
  // Operating schedule
  operatingHours: number; // hours per day
  seasonalVariation: boolean;
  winterSchedule: boolean; // Extended lighting for winter sports
  
  // Compliance requirements
  broadcastQuality: boolean; // TV/streaming requirements
  colorRendering: number; // CRI requirement
  flicker: boolean; // Flicker-free for broadcast
  spillLight: boolean; // Minimize spill light
}

export interface SportsLightingResult {
  // Illumination compliance
  averageIlluminance: number; // lux
  uniformityRatio: number; // min/avg
  colorTemperature: number; // Kelvin
  colorRenderingIndex: number; // CRI
  
  // Standards compliance
  meetsStandard: boolean;
  standardRequirements: {
    minIlluminance: number;
    maxUniformity: number;
    minCRI: number;
    maxGlare: number;
  };
  
  // Turfgrass calculations
  turfgrassHealth: {
    dailyPPFD: number; // μmol/m²/s
    dailyDLI: number; // mol/m²/day
    seasonalTotal: number; // mol/m²/season
    healthScore: number; // 0-100
    supplementalNeeded: boolean;
  };
  
  // Field zones analysis
  zoneAnalysis: {
    centerCircle: { illuminance: number; uniformity: number };
    penaltyAreas: { illuminance: number; uniformity: number };
    touchlines: { illuminance: number; uniformity: number };
    goalAreas: { illuminance: number; uniformity: number };
  };
  
  // Performance metrics
  energyConsumption: number; // kWh per hour
  operatingCost: number; // $ per hour
  maintenanceCost: number; // $ per year
  
  // Broadcast quality
  broadcastCompliance: {
    verticalIlluminance: number; // lux
    flickerFree: boolean;
    colorConsistency: number; // Delta E
    shadowReduction: number; // %
  };
}

export interface TurfgrassRequirements {
  grassType: string;
  minDLI: number; // mol/m²/day
  optimalDLI: number; // mol/m²/day
  maxDLI: number; // mol/m²/day
  lightQuality: {
    red: number; // percentage
    blue: number; // percentage
    green: number; // percentage
    farRed: number; // percentage
  };
  photoperiod: number; // hours
  seasonalVariation: boolean;
}

export class SportsFieldLightingCalculator {
  private config: SportsFieldConfiguration;
  private standards: Record<string, any>;
  private turfgrassData: Record<string, TurfgrassRequirements>;
  
  constructor(config: SportsFieldConfiguration) {
    this.config = config;
    this.initializeStandards();
    this.initializeTurfgrassData();
  }
  
  private initializeStandards(): void {
    this.standards = {
      FIFA: {
        recreational: { minIlluminance: 200, uniformity: 0.5, cri: 65 },
        amateur: { minIlluminance: 500, uniformity: 0.7, cri: 80 },
        professional: { minIlluminance: 1000, uniformity: 0.7, cri: 90 },
        international: { minIlluminance: 1400, uniformity: 0.8, cri: 95 }
      },
      UEFA: {
        recreational: { minIlluminance: 200, uniformity: 0.5, cri: 65 },
        amateur: { minIlluminance: 500, uniformity: 0.7, cri: 80 },
        professional: { minIlluminance: 1200, uniformity: 0.8, cri: 90 },
        international: { minIlluminance: 1400, uniformity: 0.8, cri: 95 }
      },
      NCAA: {
        recreational: { minIlluminance: 300, uniformity: 0.6, cri: 70 },
        amateur: { minIlluminance: 500, uniformity: 0.7, cri: 80 },
        professional: { minIlluminance: 1000, uniformity: 0.7, cri: 85 }
      },
      NFL: {
        professional: { minIlluminance: 1200, uniformity: 0.8, cri: 90 },
        broadcast: { minIlluminance: 1800, uniformity: 0.8, cri: 95 }
      }
    };
  }
  
  private initializeTurfgrassData(): void {
    this.turfgrassData = {
      bermuda: {
        grassType: 'Bermuda Grass',
        minDLI: 25,
        optimalDLI: 40,
        maxDLI: 60,
        lightQuality: { red: 45, blue: 15, green: 35, farRed: 5 },
        photoperiod: 14,
        seasonalVariation: true
      },
      zoysia: {
        grassType: 'Zoysia Grass',
        minDLI: 20,
        optimalDLI: 35,
        maxDLI: 50,
        lightQuality: { red: 40, blue: 20, green: 35, farRed: 5 },
        photoperiod: 12,
        seasonalVariation: true
      },
      'st-augustine': {
        grassType: 'St. Augustine Grass',
        minDLI: 15,
        optimalDLI: 25,
        maxDLI: 40,
        lightQuality: { red: 35, blue: 25, green: 35, farRed: 5 },
        photoperiod: 10,
        seasonalVariation: false
      },
      fescue: {
        grassType: 'Fescue',
        minDLI: 18,
        optimalDLI: 30,
        maxDLI: 45,
        lightQuality: { red: 40, blue: 20, green: 35, farRed: 5 },
        photoperiod: 12,
        seasonalVariation: true
      },
      ryegrass: {
        grassType: 'Perennial Ryegrass',
        minDLI: 20,
        optimalDLI: 32,
        maxDLI: 48,
        lightQuality: { red: 42, blue: 18, green: 35, farRed: 5 },
        photoperiod: 12,
        seasonalVariation: true
      },
      'kentucky-bluegrass': {
        grassType: 'Kentucky Bluegrass',
        minDLI: 22,
        optimalDLI: 35,
        maxDLI: 50,
        lightQuality: { red: 40, blue: 20, green: 35, farRed: 5 },
        photoperiod: 12,
        seasonalVariation: true
      },
      artificial: {
        grassType: 'Artificial Turf',
        minDLI: 0,
        optimalDLI: 0,
        maxDLI: 0,
        lightQuality: { red: 0, blue: 0, green: 0, farRed: 0 },
        photoperiod: 0,
        seasonalVariation: false
      }
    };
  }
  
  /**
   * Calculate sports field lighting design
   */
  calculateLighting(): SportsLightingResult {
    const standardReqs = this.getStandardRequirements();
    const illuminanceCalc = this.calculateIlluminance();
    const uniformityCalc = this.calculateUniformity();
    const turfgrassCalc = this.calculateTurfgrassRequirements();
    const energyCalc = this.calculateEnergyConsumption();
    const broadcastCalc = this.calculateBroadcastCompliance();
    const zoneAnalysis = this.analyzeFieldZones();
    
    return {
      averageIlluminance: illuminanceCalc.average,
      uniformityRatio: uniformityCalc.ratio,
      colorTemperature: this.getColorTemperature(),
      colorRenderingIndex: this.config.colorRendering,
      meetsStandard: this.checkStandardCompliance(illuminanceCalc, uniformityCalc, standardReqs),
      standardRequirements: standardReqs,
      turfgrassHealth: turfgrassCalc,
      zoneAnalysis,
      energyConsumption: energyCalc.hourly,
      operatingCost: energyCalc.hourlyCost,
      maintenanceCost: energyCalc.annualMaintenance,
      broadcastCompliance: broadcastCalc
    };
  }
  
  private getStandardRequirements(): any {
    const standard = this.standards[this.config.lightingStandard];
    if (!standard) {
      return { minIlluminance: 500, maxUniformity: 0.7, minCRI: 80, maxGlare: 50 };
    }
    
    const level = standard[this.config.competitionLevel] || standard.recreational;
    return {
      minIlluminance: level.minIlluminance,
      maxUniformity: level.uniformity,
      minCRI: level.cri,
      maxGlare: 50
    };
  }
  
  private calculateIlluminance(): { average: number; min: number; max: number } {
    const { fixtureCount, fixtureWattage, fieldLength, fieldWidth, poleHeight } = this.config;
    
    // Simplified illuminance calculation
    const totalLumens = fixtureCount * fixtureWattage * this.getLumensPerWatt();
    const fieldArea = fieldLength * fieldWidth;
    const utilization = this.getUtilizationFactor();
    const maintenanceFactor = 0.85;
    
    const averageIlluminance = (totalLumens * utilization * maintenanceFactor) / fieldArea;
    
    // Estimate min/max based on uniformity
    const estimatedUniformity = this.estimateUniformity();
    const minIlluminance = averageIlluminance * estimatedUniformity;
    const maxIlluminance = averageIlluminance * 1.2;
    
    return {
      average: averageIlluminance,
      min: minIlluminance,
      max: maxIlluminance
    };
  }
  
  private calculateUniformity(): { ratio: number; gradient: number } {
    const uniformity = this.estimateUniformity();
    
    return {
      ratio: uniformity,
      gradient: 1 - uniformity
    };
  }
  
  private estimateUniformity(): number {
    // Uniformity depends on pole configuration and height
    const { poleConfiguration, poleHeight, fieldLength, fieldWidth } = this.config;
    const fieldDiagonal = Math.sqrt(fieldLength * fieldLength + fieldWidth * fieldWidth);
    const heightRatio = poleHeight / fieldDiagonal;
    
    let baseUniformity = 0.5;
    
    switch (poleConfiguration) {
      case 'corner':
        baseUniformity = 0.4 + (heightRatio * 0.3);
        break;
      case 'perimeter':
        baseUniformity = 0.6 + (heightRatio * 0.2);
        break;
      case 'sideline':
        baseUniformity = 0.5 + (heightRatio * 0.25);
        break;
      case 'boom-mobile':
        baseUniformity = 0.7 + (heightRatio * 0.15);
        break;
    }
    
    return Math.min(0.9, Math.max(0.3, baseUniformity));
  }
  
  private calculateTurfgrassRequirements(): any {
    const grassData = this.turfgrassData[this.config.grassType];
    if (!grassData) {
      return {
        dailyPPFD: 0,
        dailyDLI: 0,
        seasonalTotal: 0,
        healthScore: 0,
        supplementalNeeded: false
      };
    }
    
    // Convert illuminance to PPFD (rough approximation)
    const illuminance = this.calculateIlluminance().average;
    const ppfdConversion = 0.0185; // lux to μmol/m²/s conversion factor
    const dailyPPFD = illuminance * ppfdConversion;
    
    // Calculate DLI based on photoperiod
    const photoperiodHours = this.config.operatingHours || grassData.photoperiod;
    const dailyDLI = (dailyPPFD * photoperiodHours * 3600) / 1000000; // mol/m²/day
    
    // Seasonal calculation
    const seasonalDays = this.config.seasonalVariation ? 120 : 365;
    const seasonalTotal = dailyDLI * seasonalDays;
    
    // Health score calculation
    const healthScore = Math.min(100, (dailyDLI / grassData.optimalDLI) * 100);
    const supplementalNeeded = dailyDLI < grassData.minDLI;
    
    return {
      dailyPPFD,
      dailyDLI,
      seasonalTotal,
      healthScore,
      supplementalNeeded
    };
  }
  
  private calculateEnergyConsumption(): {
    hourly: number;
    hourlyCost: number;
    annualMaintenance: number;
  } {
    const { fixtureCount, fixtureWattage, operatingHours } = this.config;
    
    const totalWattage = fixtureCount * fixtureWattage;
    const hourlyKWh = totalWattage / 1000;
    const hourlyCost = hourlyKWh * 0.12; // $0.12/kWh
    
    // Annual maintenance cost estimate
    const annualMaintenance = fixtureCount * 150; // $150 per fixture per year
    
    return {
      hourly: hourlyKWh,
      hourlyCost,
      annualMaintenance
    };
  }
  
  private calculateBroadcastCompliance(): any {
    const { broadcastQuality, flicker, colorRendering } = this.config;
    
    const illuminance = this.calculateIlluminance().average;
    const verticalIlluminance = illuminance * 0.75; // Estimate vertical illuminance
    
    return {
      verticalIlluminance,
      flickerFree: flicker,
      colorConsistency: colorRendering > 90 ? 2 : colorRendering > 80 ? 4 : 6,
      shadowReduction: this.config.poleConfiguration === 'perimeter' ? 85 : 70
    };
  }
  
  private analyzeFieldZones(): any {
    const baseIlluminance = this.calculateIlluminance().average;
    const baseUniformity = this.calculateUniformity().ratio;
    
    // Different zones have different lighting characteristics
    return {
      centerCircle: {
        illuminance: baseIlluminance * 1.1,
        uniformity: baseUniformity * 1.05
      },
      penaltyAreas: {
        illuminance: baseIlluminance * 1.15,
        uniformity: baseUniformity * 1.1
      },
      touchlines: {
        illuminance: baseIlluminance * 0.9,
        uniformity: baseUniformity * 0.95
      },
      goalAreas: {
        illuminance: baseIlluminance * 1.2,
        uniformity: baseUniformity * 1.15
      }
    };
  }
  
  private checkStandardCompliance(illuminance: any, uniformity: any, requirements: any): boolean {
    return (
      illuminance.average >= requirements.minIlluminance &&
      uniformity.ratio >= requirements.maxUniformity &&
      this.config.colorRendering >= requirements.minCRI
    );
  }
  
  private getLumensPerWatt(): number {
    switch (this.config.fixtureType) {
      case 'led':
        return 150;
      case 'metal-halide':
        return 90;
      case 'high-pressure-sodium':
        return 120;
      default:
        return 100;
    }
  }
  
  private getUtilizationFactor(): number {
    // Utilization factor depends on pole configuration and field geometry
    switch (this.config.poleConfiguration) {
      case 'corner':
        return 0.4;
      case 'perimeter':
        return 0.6;
      case 'sideline':
        return 0.5;
      case 'boom-mobile':
        return 0.7;
      default:
        return 0.5;
    }
  }
  
  private getColorTemperature(): number {
    // Typical color temperatures for sports lighting
    switch (this.config.fixtureType) {
      case 'led':
        return 5000;
      case 'metal-halide':
        return 4200;
      case 'high-pressure-sodium':
        return 2100;
      default:
        return 4000;
    }
  }
  
  /**
   * Generate field-specific recommendations
   */
  generateRecommendations(): {
    lighting: string[];
    turfgrass: string[];
    compliance: string[];
    energy: string[];
  } {
    const result = this.calculateLighting();
    const recommendations = {
      lighting: [],
      turfgrass: [],
      compliance: [],
      energy: []
    };
    
    // Lighting recommendations
    if (result.averageIlluminance < result.standardRequirements.minIlluminance) {
      recommendations.lighting.push('Increase fixture count or wattage to meet illuminance requirements');
    }
    
    if (result.uniformityRatio < result.standardRequirements.maxUniformity) {
      recommendations.lighting.push('Improve pole positioning or add fixtures for better uniformity');
    }
    
    // Turfgrass recommendations
    if (result.turfgrassHealth.supplementalNeeded) {
      recommendations.turfgrass.push('Add supplemental lighting for turfgrass health');
    }
    
    if (result.turfgrassHealth.healthScore < 70) {
      recommendations.turfgrass.push('Increase lighting duration or intensity for optimal grass growth');
    }
    
    // Compliance recommendations
    if (!result.meetsStandard) {
      recommendations.compliance.push('Current design does not meet specified lighting standards');
    }
    
    if (this.config.broadcastQuality && result.broadcastCompliance.colorConsistency > 3) {
      recommendations.compliance.push('Improve color rendering for broadcast quality');
    }
    
    // Energy recommendations
    if (result.energyConsumption > 50) {
      recommendations.energy.push('Consider LED fixtures for improved energy efficiency');
    }
    
    return recommendations;
  }
  
  /**
   * Calculate seasonal lighting schedule for turfgrass
   */
  calculateSeasonalSchedule(): Array<{
    month: string;
    dailyHours: number;
    weeklyHours: number;
    recommendedDLI: number;
    grassGrowthRate: number;
  }> {
    const grassData = this.turfgrassData[this.config.grassType];
    if (!grassData || this.config.grassType === 'artificial') {
      return [];
    }
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return months.map((month, index) => {
      // Seasonal variation for temperate climates
      const seasonalFactor = grassData.seasonalVariation ? 
        0.6 + 0.4 * Math.sin((index - 2) * Math.PI / 6) : 1.0;
      
      const recommendedDLI = grassData.optimalDLI * seasonalFactor;
      const dailyHours = Math.max(4, Math.min(16, recommendedDLI / 2)); // Rough estimate
      const weeklyHours = dailyHours * 7;
      const grassGrowthRate = seasonalFactor * 100;
      
      return {
        month,
        dailyHours,
        weeklyHours,
        recommendedDLI,
        grassGrowthRate
      };
    });
  }
}

/**
 * Pitch lighting specifically for soccer fields
 */
export class SoccerPitchLightingCalculator extends SportsFieldLightingCalculator {
  constructor(config: Omit<SportsFieldConfiguration, 'fieldType'>) {
    super({ ...config, fieldType: 'soccer' });
  }
  
  /**
   * Calculate FIFA-specific pitch zones
   */
  calculateFIFAZones(): {
    pitch: { illuminance: number; uniformity: number };
    penalties: { illuminance: number; uniformity: number };
    goals: { illuminance: number; uniformity: number };
    corners: { illuminance: number; uniformity: number };
    center: { illuminance: number; uniformity: number };
  } {
    const baseResult = this.calculateLighting();
    const baseIlluminance = baseResult.averageIlluminance;
    const baseUniformity = baseResult.uniformityRatio;
    
    return {
      pitch: {
        illuminance: baseIlluminance,
        uniformity: baseUniformity
      },
      penalties: {
        illuminance: baseIlluminance * 1.15,
        uniformity: baseUniformity * 1.1
      },
      goals: {
        illuminance: baseIlluminance * 1.2,
        uniformity: baseUniformity * 1.15
      },
      corners: {
        illuminance: baseIlluminance * 0.95,
        uniformity: baseUniformity * 0.9
      },
      center: {
        illuminance: baseIlluminance * 1.1,
        uniformity: baseUniformity * 1.05
      }
    };
  }
}