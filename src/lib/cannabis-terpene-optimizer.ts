/**
 * Cannabis Terpene Profile Optimizer
 * Optimizes environmental conditions for specific terpene expression
 */

export interface TerpeneProfile {
  myrcene: number;      // Earthy, musky (0-3%)
  limonene: number;     // Citrus (0-2%)
  caryophyllene: number; // Spicy, peppery (0-1%)
  pinene: number;       // Pine (0-1%)
  linalool: number;     // Floral, lavender (0-1%)
  humulene: number;     // Woody, earthy (0-0.5%)
  terpinolene: number;  // Fruity, herbal (0-0.5%)
  ocimene: number;      // Sweet, herbal (0-0.3%)
}

export interface EnvironmentalConditions {
  temperature: { day: number; night: number };
  humidity: { day: number; night: number };
  co2: number;
  lightIntensity: number; // PPFD
  lightSpectrum: {
    blue: number;  // 400-500nm
    green: number; // 500-600nm
    red: number;   // 600-700nm
    farRed: number; // 700-800nm
    uv: number;    // 280-400nm
  };
  vpd: number; // Vapor Pressure Deficit
}

export interface TerpeneOptimizationResult {
  targetProfile: TerpeneProfile;
  recommendedConditions: EnvironmentalConditions;
  growthPhase: 'vegetative' | 'early-flower' | 'mid-flower' | 'late-flower';
  confidence: number;
  estimatedYield: {
    terpenePercentage: number;
    aromaIntensity: number;
  };
}

export class CannabisTerpeneOptimizer {
  // Terpene production rules based on research
  private terpeneRules = {
    myrcene: {
      optimalTemp: { day: 24, night: 18 },
      optimalHumidity: { day: 55, night: 50 },
      uvSensitive: false,
      stressResponse: 'moderate'
    },
    limonene: {
      optimalTemp: { day: 26, night: 20 },
      optimalHumidity: { day: 50, night: 45 },
      uvSensitive: true,
      stressResponse: 'high'
    },
    caryophyllene: {
      optimalTemp: { day: 23, night: 17 },
      optimalHumidity: { day: 45, night: 40 },
      uvSensitive: true,
      stressResponse: 'high'
    },
    pinene: {
      optimalTemp: { day: 22, night: 16 },
      optimalHumidity: { day: 50, night: 45 },
      uvSensitive: false,
      stressResponse: 'low'
    },
    linalool: {
      optimalTemp: { day: 25, night: 19 },
      optimalHumidity: { day: 60, night: 55 },
      uvSensitive: true,
      stressResponse: 'moderate'
    }
  };

  optimizeForProfile(
    targetProfile: Partial<TerpeneProfile>,
    currentPhase: TerpeneOptimizationResult['growthPhase'],
    strain?: string
  ): TerpeneOptimizationResult {
    // Normalize target profile
    const normalizedProfile = this.normalizeProfile(targetProfile);
    
    // Calculate optimal conditions based on weighted terpene preferences
    const conditions = this.calculateOptimalConditions(normalizedProfile, currentPhase);
    
    // Estimate confidence based on how well conditions can produce target profile
    const confidence = this.calculateConfidence(normalizedProfile, conditions);
    
    // Estimate terpene yield
    const estimatedYield = this.estimateTerpeneYield(normalizedProfile, conditions, currentPhase);

    return {
      targetProfile: normalizedProfile,
      recommendedConditions: conditions,
      growthPhase: currentPhase,
      confidence,
      estimatedYield
    };
  }

  private normalizeProfile(profile: Partial<TerpeneProfile>): TerpeneProfile {
    const defaultProfile: TerpeneProfile = {
      myrcene: 0.5,
      limonene: 0.3,
      caryophyllene: 0.2,
      pinene: 0.15,
      linalool: 0.1,
      humulene: 0.05,
      terpinolene: 0.05,
      ocimene: 0.02
    };

    return { ...defaultProfile, ...profile };
  }

  private calculateOptimalConditions(
    profile: TerpeneProfile,
    phase: TerpeneOptimizationResult['growthPhase']
  ): EnvironmentalConditions {
    // Weight conditions by terpene concentration goals
    const weightedTemp = { day: 0, night: 0 };
    const weightedHumidity = { day: 0, night: 0 };
    let totalWeight = 0;
    let uvRequirement = 0;

    Object.entries(profile).forEach(([terpene, concentration]) => {
      const rule = this.terpeneRules[terpene as keyof typeof this.terpeneRules];
      if (rule && concentration > 0) {
        weightedTemp.day += rule.optimalTemp.day * concentration;
        weightedTemp.night += rule.optimalTemp.night * concentration;
        weightedHumidity.day += rule.optimalHumidity.day * concentration;
        weightedHumidity.night += rule.optimalHumidity.night * concentration;
        totalWeight += concentration;
        
        if (rule.uvSensitive) {
          uvRequirement += concentration;
        }
      }
    });

    // Calculate phase-specific adjustments
    const phaseAdjustments = this.getPhaseAdjustments(phase);
    
    // Normalize and apply phase adjustments
    const baseConditions: EnvironmentalConditions = {
      temperature: {
        day: (weightedTemp.day / totalWeight) + phaseAdjustments.tempOffset,
        night: (weightedTemp.night / totalWeight) + phaseAdjustments.tempOffset - 2
      },
      humidity: {
        day: (weightedHumidity.day / totalWeight) * phaseAdjustments.humidityMultiplier,
        night: (weightedHumidity.night / totalWeight) * phaseAdjustments.humidityMultiplier
      },
      co2: phaseAdjustments.co2,
      lightIntensity: phaseAdjustments.ppfd,
      lightSpectrum: {
        blue: phase === 'vegetative' ? 30 : 15,
        green: 10,
        red: phase === 'vegetative' ? 50 : 60,
        farRed: phase.includes('flower') ? 15 : 5,
        uv: Math.min(uvRequirement * 5, 5) // Max 5% UV
      },
      vpd: this.calculateVPD(
        (weightedTemp.day / totalWeight) + phaseAdjustments.tempOffset,
        (weightedHumidity.day / totalWeight) * phaseAdjustments.humidityMultiplier
      )
    };

    return baseConditions;
  }

  private getPhaseAdjustments(phase: TerpeneOptimizationResult['growthPhase']) {
    const adjustments = {
      vegetative: {
        tempOffset: 2,
        humidityMultiplier: 1.1,
        co2: 1000,
        ppfd: 600
      },
      'early-flower': {
        tempOffset: 0,
        humidityMultiplier: 1.0,
        co2: 1200,
        ppfd: 800
      },
      'mid-flower': {
        tempOffset: -1,
        humidityMultiplier: 0.9,
        co2: 1200,
        ppfd: 900
      },
      'late-flower': {
        tempOffset: -2,
        humidityMultiplier: 0.8,
        co2: 900,
        ppfd: 700
      }
    };

    return adjustments[phase];
  }

  private calculateVPD(temperature: number, humidity: number): number {
    // Saturation vapor pressure
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    // Actual vapor pressure
    const avp = (humidity / 100) * svp;
    // VPD in kPa
    return svp - avp;
  }

  private calculateConfidence(profile: TerpeneProfile, conditions: EnvironmentalConditions): number {
    // Base confidence on how well conditions match optimal for each terpene
    let confidence = 0.85; // Base confidence
    
    // Reduce confidence for extreme conditions
    if (conditions.temperature.day > 28 || conditions.temperature.day < 20) {
      confidence -= 0.1;
    }
    if (conditions.humidity.day > 70 || conditions.humidity.day < 40) {
      confidence -= 0.1;
    }
    if (conditions.vpd < 0.8 || conditions.vpd > 1.5) {
      confidence -= 0.05;
    }
    
    return Math.max(0.5, Math.min(1.0, confidence));
  }

  private estimateTerpeneYield(
    profile: TerpeneProfile,
    conditions: EnvironmentalConditions,
    phase: TerpeneOptimizationResult['growthPhase']
  ): { terpenePercentage: number; aromaIntensity: number } {
    // Base yield on phase
    const phaseMultipliers = {
      vegetative: 0.1,
      'early-flower': 0.4,
      'mid-flower': 0.8,
      'late-flower': 1.0
    };

    const baseYield = phaseMultipliers[phase];
    
    // Calculate total potential terpene percentage
    const totalTerpenes = Object.values(profile).reduce((sum, val) => sum + val, 0);
    
    // Environmental optimization factor
    let envFactor = 1.0;
    if (conditions.vpd >= 0.8 && conditions.vpd <= 1.2) envFactor += 0.1;
    if (conditions.lightSpectrum.uv > 0) envFactor += 0.05;
    if (conditions.co2 >= 1000) envFactor += 0.05;

    return {
      terpenePercentage: totalTerpenes * baseYield * envFactor,
      aromaIntensity: Math.min(10, totalTerpenes * envFactor * 2)
    };
  }

  // Stress protocols for enhanced terpene production
  generateStressProtocol(
    targetTerpenes: (keyof TerpeneProfile)[],
    currentWeek: number
  ): { protocol: string; timing: string; intensity: 'low' | 'medium' | 'high' }[] {
    const protocols = [];

    if (targetTerpenes.includes('limonene') || targetTerpenes.includes('caryophyllene')) {
      protocols.push({
        protocol: 'UV-B Supplementation',
        timing: '2-3 hours mid-day',
        intensity: 'medium' as const
      });
    }

    if (currentWeek > 6) {
      protocols.push({
        protocol: 'Drought Stress',
        timing: '48-72 hours before harvest',
        intensity: 'medium' as const
      });
    }

    if (targetTerpenes.includes('myrcene')) {
      protocols.push({
        protocol: 'Temperature Drop',
        timing: 'Last 2 weeks, nights to 15°C',
        intensity: 'low' as const
      });
    }

    return protocols;
  }
}

export const terpeneOptimizer = new CannabisTerpeneOptimizer();