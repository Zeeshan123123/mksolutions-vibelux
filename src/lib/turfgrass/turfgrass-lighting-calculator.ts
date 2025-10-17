/**
 * Turfgrass Lighting Calculator
 * 
 * Specialized calculator for sports field turfgrass health and maintenance
 * Focuses on photosynthetic requirements rather than visibility lighting
 */

export interface TurfgrassConfiguration {
  // Field specifications
  fieldType: 'soccer' | 'football' | 'baseball' | 'golf' | 'tennis' | 'general';
  grassType: 'bermuda' | 'zoysia' | 'st-augustine' | 'fescue' | 'ryegrass' | 'kentucky-bluegrass';
  fieldArea: number; // square meters
  
  // Lighting system
  supplementalLighting: boolean;
  fixtureType: 'led-horticultural' | 'led-sports' | 'metal-halide' | 'high-pressure-sodium';
  fixtureCount: number;
  fixtureWattage: number;
  fixtureHeight: number; // meters above ground
  
  // Growing conditions
  climate: 'temperate' | 'subtropical' | 'tropical' | 'arid' | 'continental';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  shadingLevel: number; // 0-100% (from structures, trees, etc.)
  
  // Maintenance schedule
  playingSchedule: 'daily' | 'weekly' | 'occasional';
  maintenanceWindow: number; // hours per day for lighting
  offSeasonLighting: boolean;
  
  // Performance goals
  targetQuality: 'basic' | 'professional' | 'championship';
  uniformityRequired: boolean;
  yearRoundMaintenance: boolean;
}

export interface TurfgrassLightingResult {
  // Photosynthetic requirements
  photosynthesis: {
    requiredDLI: number; // mol/m²/day
    providedDLI: number; // mol/m²/day
    lightingSufficiency: number; // 0-100%
    seasonalAdjustment: number; // factor for current season
  };
  
  // Grass health metrics
  grassHealth: {
    healthScore: number; // 0-100
    growthRate: number; // relative to optimal
    stressLevel: number; // 0-100
    recoveryTime: number; // days for damage recovery
    dormancyRisk: number; // 0-100%
  };
  
  // Light distribution
  lightDistribution: {
    averagePPFD: number; // μmol/m²/s
    uniformityRatio: number; // min/max
    shadedAreas: number; // percentage of field
    adequateCoverage: number; // percentage receiving minimum DLI
  };
  
  // Maintenance recommendations
  maintenance: {
    lightingSchedule: Array<{
      startHour: number;
      duration: number;
      intensity: number;
      purpose: string;
    }>;
    seasonalAdjustments: Record<string, number>;
    supplementalNeeds: string[];
  };
  
  // Performance impact
  performance: {
    playingSurface: number; // 0-100 quality score
    playerSafety: number; // 0-100 safety score
    durability: number; // 0-100 wear resistance
    appearance: number; // 0-100 aesthetic score
  };
  
  // Economics
  economics: {
    energyCost: number; // $ per day
    maintenanceSavings: number; // $ per year from better grass health
    surfaceReplacement: number; // years between major renovations
    roi: number; // % return on investment
  };
}

export interface GrassSpecifications {
  name: string;
  optimalDLI: number; // mol/m²/day
  minimumDLI: number; // mol/m²/day
  maxDLI: number; // mol/m²/day
  photoperiod: number; // hours
  lightQuality: {
    red: number; // percentage
    blue: number; // percentage
    green: number; // percentage
    farRed: number; // percentage
  };
  temperature: {
    optimal: number; // °C
    minimum: number; // °C
    maximum: number; // °C
  };
  seasonalVariation: boolean;
  wearTolerance: number; // 0-100
  recoveryRate: number; // 0-100
}

export class TurfgrassLightingCalculator {
  private config: TurfgrassConfiguration;
  private grassSpecs: Record<string, GrassSpecifications>;
  
  constructor(config: TurfgrassConfiguration) {
    this.config = config;
    this.initializeGrassSpecifications();
  }
  
  private initializeGrassSpecifications(): void {
    this.grassSpecs = {
      bermuda: {
        name: 'Bermuda Grass',
        optimalDLI: 35,
        minimumDLI: 20,
        maxDLI: 55,
        photoperiod: 14,
        lightQuality: { red: 45, blue: 15, green: 35, farRed: 5 },
        temperature: { optimal: 27, minimum: 15, maximum: 35 },
        seasonalVariation: true,
        wearTolerance: 95,
        recoveryRate: 90
      },
      zoysia: {
        name: 'Zoysia Grass',
        optimalDLI: 30,
        minimumDLI: 18,
        maxDLI: 45,
        photoperiod: 12,
        lightQuality: { red: 40, blue: 20, green: 35, farRed: 5 },
        temperature: { optimal: 25, minimum: 10, maximum: 32 },
        seasonalVariation: true,
        wearTolerance: 85,
        recoveryRate: 75
      },
      'st-augustine': {
        name: 'St. Augustine Grass',
        optimalDLI: 25,
        minimumDLI: 15,
        maxDLI: 40,
        photoperiod: 10,
        lightQuality: { red: 35, blue: 25, green: 35, farRed: 5 },
        temperature: { optimal: 24, minimum: 12, maximum: 30 },
        seasonalVariation: false,
        wearTolerance: 65,
        recoveryRate: 60
      },
      fescue: {
        name: 'Fescue',
        optimalDLI: 28,
        minimumDLI: 16,
        maxDLI: 42,
        photoperiod: 12,
        lightQuality: { red: 40, blue: 20, green: 35, farRed: 5 },
        temperature: { optimal: 18, minimum: 5, maximum: 25 },
        seasonalVariation: true,
        wearTolerance: 75,
        recoveryRate: 70
      },
      ryegrass: {
        name: 'Perennial Ryegrass',
        optimalDLI: 30,
        minimumDLI: 18,
        maxDLI: 45,
        photoperiod: 12,
        lightQuality: { red: 42, blue: 18, green: 35, farRed: 5 },
        temperature: { optimal: 20, minimum: 8, maximum: 28 },
        seasonalVariation: true,
        wearTolerance: 80,
        recoveryRate: 85
      },
      'kentucky-bluegrass': {
        name: 'Kentucky Bluegrass',
        optimalDLI: 32,
        minimumDLI: 20,
        maxDLI: 48,
        photoperiod: 12,
        lightQuality: { red: 40, blue: 20, green: 35, farRed: 5 },
        temperature: { optimal: 22, minimum: 10, maximum: 30 },
        seasonalVariation: true,
        wearTolerance: 70,
        recoveryRate: 75
      }
    };
  }
  
  /**
   * Calculate turfgrass lighting requirements and performance
   */
  calculate(): TurfgrassLightingResult {
    const grassSpec = this.grassSpecs[this.config.grassType];
    const photosynthesis = this.calculatePhotosynthesis(grassSpec);
    const grassHealth = this.calculateGrassHealth(grassSpec, photosynthesis);
    const lightDistribution = this.calculateLightDistribution();
    const maintenance = this.generateMaintenanceSchedule(grassSpec);
    const performance = this.calculatePerformance(grassHealth, lightDistribution);
    const economics = this.calculateEconomics(grassHealth, performance);
    
    return {
      photosynthesis,
      grassHealth,
      lightDistribution,
      maintenance,
      performance,
      economics
    };
  }
  
  private calculatePhotosynthesis(grassSpec: GrassSpecifications): any {
    // Calculate seasonal adjustment
    const seasonalFactor = this.getSeasonalFactor(grassSpec);
    const requiredDLI = grassSpec.optimalDLI * seasonalFactor;
    
    // Calculate provided DLI from lighting system
    const providedDLI = this.calculateProvidedDLI();
    
    // Calculate natural light contribution
    const naturalDLI = this.calculateNaturalDLI();
    
    // Total DLI available
    const totalDLI = providedDLI + naturalDLI;
    
    // Sufficiency calculation
    const lightingSufficiency = Math.min(100, (totalDLI / requiredDLI) * 100);
    
    return {
      requiredDLI,
      providedDLI: totalDLI,
      lightingSufficiency,
      seasonalAdjustment: seasonalFactor
    };
  }
  
  private calculateGrassHealth(grassSpec: GrassSpecifications, photosynthesis: any): any {
    // Base health from light sufficiency
    let healthScore = photosynthesis.lightingSufficiency;
    
    // Adjust for stress factors
    const stressFactors = this.calculateStressFactors(grassSpec);
    healthScore *= (1 - stressFactors.overall / 100);
    
    // Growth rate relative to optimal
    const growthRate = Math.min(1.0, healthScore / 100);
    
    // Stress level (inverse of health)
    const stressLevel = 100 - healthScore;
    
    // Recovery time based on grass type and health
    const recoveryTime = this.calculateRecoveryTime(grassSpec, healthScore);
    
    // Dormancy risk
    const dormancyRisk = this.calculateDormancyRisk(grassSpec, photosynthesis);
    
    return {
      healthScore: Math.max(0, healthScore),
      growthRate,
      stressLevel,
      recoveryTime,
      dormancyRisk
    };
  }
  
  private calculateLightDistribution(): any {
    const { fixtureCount, fixtureWattage, fixtureHeight, fieldArea } = this.config;
    
    // Calculate average PPFD
    const totalPPF = fixtureCount * this.getFixturePPF(fixtureWattage);
    const averagePPFD = totalPPF / fieldArea;
    
    // Estimate uniformity based on fixture layout
    const uniformityRatio = this.estimateUniformity();
    
    // Calculate shaded areas
    const shadedAreas = this.config.shadingLevel;
    
    // Adequate coverage calculation
    const adequateCoverage = this.calculateAdequateCoverage(averagePPFD, uniformityRatio);
    
    return {
      averagePPFD,
      uniformityRatio,
      shadedAreas,
      adequateCoverage
    };
  }
  
  private generateMaintenanceSchedule(grassSpec: GrassSpecifications): any {
    const lightingSchedule = [];
    const seasonalAdjustments = {};
    const supplementalNeeds = [];
    
    // Basic daily schedule
    if (this.config.supplementalLighting) {
      const startHour = this.config.climate === 'temperate' ? 6 : 5;
      const duration = Math.min(this.config.maintenanceWindow, grassSpec.photoperiod);
      
      lightingSchedule.push({
        startHour,
        duration,
        intensity: 100,
        purpose: 'Primary photosynthesis'
      });
      
      // Evening supplemental if needed
      if (this.config.maintenanceWindow > duration) {
        lightingSchedule.push({
          startHour: 18,
          duration: Math.min(4, this.config.maintenanceWindow - duration),
          intensity: 75,
          purpose: 'Extended growth period'
        });
      }
    }
    
    // Seasonal adjustments
    seasonalAdjustments['spring'] = 1.2;
    seasonalAdjustments['summer'] = 0.8;
    seasonalAdjustments['fall'] = 1.1;
    seasonalAdjustments['winter'] = 1.5;
    
    // Supplemental needs assessment
    const photosynthesis = this.calculatePhotosynthesis(grassSpec);
    if (photosynthesis.lightingSufficiency < 80) {
      supplementalNeeds.push('Increase lighting duration');
    }
    
    if (this.config.shadingLevel > 30) {
      supplementalNeeds.push('Address shading issues');
    }
    
    if (this.config.playingSchedule === 'daily') {
      supplementalNeeds.push('Enhanced recovery lighting');
    }
    
    return {
      lightingSchedule,
      seasonalAdjustments,
      supplementalNeeds
    };
  }
  
  private calculatePerformance(grassHealth: any, lightDistribution: any): any {
    // Playing surface quality
    const playingSurface = Math.min(100, grassHealth.healthScore * 0.8 + lightDistribution.adequateCoverage * 0.2);
    
    // Player safety (consistent surface)
    const playerSafety = Math.min(100, lightDistribution.uniformityRatio * 100);
    
    // Durability (wear resistance)
    const grassSpec = this.grassSpecs[this.config.grassType];
    const durability = Math.min(100, grassHealth.healthScore * 0.6 + grassSpec.wearTolerance * 0.4);
    
    // Appearance (aesthetic quality)
    const appearance = Math.min(100, grassHealth.healthScore * 0.7 + lightDistribution.adequateCoverage * 0.3);
    
    return {
      playingSurface,
      playerSafety,
      durability,
      appearance
    };
  }
  
  private calculateEconomics(grassHealth: any, performance: any): any {
    // Energy cost calculation
    const totalWattage = this.config.fixtureCount * this.config.fixtureWattage;
    const dailyKWh = (totalWattage * this.config.maintenanceWindow) / 1000;
    const energyCost = dailyKWh * 0.12; // $0.12 per kWh
    
    // Maintenance savings from better grass health
    const healthFactor = grassHealth.healthScore / 100;
    const baseMaintenance = 15000; // $15,000 per year base maintenance
    const maintenanceSavings = baseMaintenance * (1 - healthFactor) * 0.3;
    
    // Surface replacement cycle
    const surfaceReplacement = 5 + (performance.durability / 100) * 5; // 5-10 years
    
    // ROI calculation
    const annualSavings = maintenanceSavings + (50000 / surfaceReplacement); // Replacement cost amortization
    const annualCost = energyCost * 365 + 5000; // Energy + maintenance
    const roi = ((annualSavings - annualCost) / annualCost) * 100;
    
    return {
      energyCost,
      maintenanceSavings,
      surfaceReplacement,
      roi
    };
  }
  
  // Helper methods
  private getSeasonalFactor(grassSpec: GrassSpecifications): number {
    if (!grassSpec.seasonalVariation) return 1.0;
    
    const seasonFactors = {
      spring: 1.2,
      summer: 0.8,
      fall: 1.1,
      winter: 1.5
    };
    
    return seasonFactors[this.config.season] || 1.0;
  }
  
  private calculateProvidedDLI(): number {
    if (!this.config.supplementalLighting) return 0;
    
    const ppf = this.config.fixtureCount * this.getFixturePPF(this.config.fixtureWattage);
    const ppfd = ppf / this.config.fieldArea;
    const dli = (ppfd * this.config.maintenanceWindow * 3600) / 1000000; // mol/m²/day
    
    return dli;
  }
  
  private calculateNaturalDLI(): number {
    const baseNaturalDLI = {
      spring: 25,
      summer: 35,
      fall: 20,
      winter: 12
    };
    
    const naturalDLI = baseNaturalDLI[this.config.season] || 20;
    const shadingReduction = this.config.shadingLevel / 100;
    
    return naturalDLI * (1 - shadingReduction);
  }
  
  private calculateStressFactors(grassSpec: GrassSpecifications): any {
    let overall = 0;
    
    // Shading stress
    if (this.config.shadingLevel > 50) {
      overall += 20;
    }
    
    // Playing frequency stress
    if (this.config.playingSchedule === 'daily') {
      overall += 15;
    }
    
    // Climate stress
    if (this.config.climate === 'arid') {
      overall += 10;
    }
    
    return { overall: Math.min(100, overall) };
  }
  
  private calculateRecoveryTime(grassSpec: GrassSpecifications, healthScore: number): number {
    const baseRecovery = 14; // days
    const healthFactor = healthScore / 100;
    const recoveryFactor = grassSpec.recoveryRate / 100;
    
    return Math.round(baseRecovery * (1 - healthFactor * recoveryFactor));
  }
  
  private calculateDormancyRisk(grassSpec: GrassSpecifications, photosynthesis: any): number {
    if (photosynthesis.lightingSufficiency > 70) return 0;
    
    const lightRisk = (70 - photosynthesis.lightingSufficiency) * 1.5;
    const seasonalRisk = this.config.season === 'winter' ? 25 : 0;
    
    return Math.min(100, lightRisk + seasonalRisk);
  }
  
  private estimateUniformity(): number {
    // Simple uniformity estimation based on fixture count and area
    const fixturesPerArea = this.config.fixtureCount / this.config.fieldArea;
    
    if (fixturesPerArea > 0.01) return 0.85; // Good uniformity
    if (fixturesPerArea > 0.005) return 0.75; // Moderate uniformity
    return 0.65; // Poor uniformity
  }
  
  private calculateAdequateCoverage(averagePPFD: number, uniformityRatio: number): number {
    const minPPFD = averagePPFD * uniformityRatio;
    const requiredPPFD = 200; // Minimum for grass health
    
    if (minPPFD >= requiredPPFD) return 100;
    return (minPPFD / requiredPPFD) * 100;
  }
  
  private getFixturePPF(wattage: number): number {
    // PPF estimation based on fixture type and wattage
    const efficacyMap = {
      'led-horticultural': 2.8,
      'led-sports': 2.2,
      'metal-halide': 1.8,
      'high-pressure-sodium': 1.5
    };
    
    const efficacy = efficacyMap[this.config.fixtureType] || 2.0;
    return wattage * efficacy;
  }
  
  /**
   * Generate field-specific recommendations
   */
  generateRecommendations(): {
    lighting: string[];
    maintenance: string[];
    performance: string[];
    economics: string[];
  } {
    const result = this.calculate();
    const recommendations = {
      lighting: [],
      maintenance: [],
      performance: [],
      economics: []
    };
    
    // Lighting recommendations
    if (result.photosynthesis.lightingSufficiency < 70) {
      recommendations.lighting.push('Increase supplemental lighting duration or intensity');
    }
    
    if (result.lightDistribution.uniformityRatio < 0.7) {
      recommendations.lighting.push('Improve fixture layout for better uniformity');
    }
    
    if (result.lightDistribution.shadedAreas > 30) {
      recommendations.lighting.push('Address shading issues or add targeted lighting');
    }
    
    // Maintenance recommendations
    if (result.grassHealth.healthScore < 70) {
      recommendations.maintenance.push('Implement enhanced recovery lighting program');
    }
    
    if (result.grassHealth.dormancyRisk > 25) {
      recommendations.maintenance.push('Increase winter lighting to prevent dormancy');
    }
    
    // Performance recommendations
    if (result.performance.playingSurface < 80) {
      recommendations.performance.push('Focus on uniform light distribution for consistent surface');
    }
    
    if (result.performance.durability < 75) {
      recommendations.performance.push('Enhance grass health to improve wear tolerance');
    }
    
    // Economic recommendations
    if (result.economics.roi < 15) {
      recommendations.economics.push('Optimize lighting schedule for better ROI');
    }
    
    return recommendations;
  }
  
  /**
   * Calculate optimal lighting schedule for different seasons
   */
  generateSeasonalSchedule(): Record<string, Array<{
    month: string;
    dailyHours: number;
    intensity: number;
    startTime: string;
    purpose: string;
  }>> {
    const grassSpec = this.grassSpecs[this.config.grassType];
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    const schedule: Record<string, any[]> = {};
    
    seasons.forEach(season => {
      const seasonalFactor = this.getSeasonalFactor(grassSpec);
      const requiredDLI = grassSpec.optimalDLI * seasonalFactor;
      const naturalDLI = this.calculateNaturalDLI();
      const supplementalNeeded = Math.max(0, requiredDLI - naturalDLI);
      
      const dailyHours = Math.min(
        this.config.maintenanceWindow,
        (supplementalNeeded * 1000000) / (400 * 3600) // Convert to hours at 400 PPFD
      );
      
      schedule[season] = [{
        month: season,
        dailyHours,
        intensity: Math.min(100, (supplementalNeeded / 20) * 100),
        startTime: season === 'winter' ? '7:00 AM' : '6:00 AM',
        purpose: `${season} grass health maintenance`
      }];
    });
    
    return schedule;
  }
}

// Export utility functions
export const TurfgrassUtils = {
  /**
   * Calculate water savings from better grass health
   */
  calculateWaterSavings(healthScore: number, fieldArea: number): number {
    const basalWaterUse = fieldArea * 0.5; // liters per m² per day
    const healthFactor = healthScore / 100;
    const efficiency = 0.8 + (healthFactor * 0.2); // 80-100% efficiency
    
    return basalWaterUse * fieldArea * (1 - efficiency);
  },
  
  /**
   * Estimate carbon footprint reduction
   */
  calculateCarbonReduction(energyKWh: number, healthScore: number): number {
    const carbonPerKWh = 0.4; // kg CO2 per kWh
    const healthFactor = healthScore / 100;
    const maintenanceReduction = healthFactor * 0.3; // 30% reduction in maintenance
    
    return energyKWh * carbonPerKWh * maintenanceReduction;
  }
};