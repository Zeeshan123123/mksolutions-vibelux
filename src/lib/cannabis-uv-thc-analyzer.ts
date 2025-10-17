/**
 * Cannabis UV-THC Analyzer
 * Analyzes the relationship between UV exposure and THC/cannabinoid production
 */

export interface UVExposureProtocol {
  wavelength: 'UVA' | 'UVB' | 'UVC';
  intensity: number; // μmol/m²/s
  duration: number; // minutes per day
  timing: 'morning' | 'midday' | 'evening' | 'continuous';
  startWeek: number; // Week of flowering to start
  endWeek: number; // Week of flowering to end
}

export interface CannabinoidProfile {
  thc: number;      // Δ9-THC percentage
  thca: number;     // THC-A percentage
  cbd: number;      // CBD percentage
  cbda: number;     // CBD-A percentage
  cbg: number;      // CBG percentage
  cbc: number;      // CBC percentage
  cbn: number;      // CBN percentage
  thcv: number;     // THC-V percentage
  totalCannabinoids: number;
}

export interface UVAnalysisResult {
  protocol: UVExposureProtocol;
  predictedCannabinoids: CannabinoidProfile;
  stressLevel: 'low' | 'moderate' | 'high' | 'extreme';
  yieldImpact: number; // Percentage change in yield
  qualityScore: number; // 0-100
  recommendations: string[];
  warnings: string[];
}

export class CannabisUVTHCAnalyzer {
  // Research-based UV response curves
  private uvResponseCurves = {
    UVA: {
      thcMultiplier: 1.05,
      stressFactor: 0.2,
      optimalIntensity: 30, // μmol/m²/s
      maxSafeDuration: 360 // minutes
    },
    UVB: {
      thcMultiplier: 1.25,
      stressFactor: 0.8,
      optimalIntensity: 3, // μmol/m²/s
      maxSafeDuration: 120 // minutes
    },
    UVC: {
      thcMultiplier: 1.02,
      stressFactor: 2.0,
      optimalIntensity: 0, // Not recommended
      maxSafeDuration: 0 // Not recommended
    }
  };

  // Strain-specific UV sensitivity
  private strainCategories = {
    highland: { uvTolerance: 'high', thcResponse: 1.3 },
    lowland: { uvTolerance: 'low', thcResponse: 1.1 },
    hybrid: { uvTolerance: 'medium', thcResponse: 1.2 }
  };

  analyzeUVProtocol(
    protocol: UVExposureProtocol,
    baselineProfile: CannabinoidProfile,
    strainType: keyof typeof this.strainCategories = 'hybrid',
    currentWeek: number
  ): UVAnalysisResult {
    // Validate protocol safety
    const validation = this.validateProtocol(protocol);
    const warnings = validation.warnings;

    // Calculate stress level
    const stressLevel = this.calculateStressLevel(protocol);

    // Predict cannabinoid changes
    const predictedCannabinoids = this.predictCannabinoidChanges(
      protocol,
      baselineProfile,
      strainType,
      currentWeek
    );

    // Calculate yield impact
    const yieldImpact = this.calculateYieldImpact(protocol, stressLevel);

    // Calculate quality score
    const qualityScore = this.calculateQualityScore(
      predictedCannabinoids,
      yieldImpact,
      stressLevel
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      protocol,
      stressLevel,
      currentWeek,
      strainType
    );

    return {
      protocol,
      predictedCannabinoids,
      stressLevel,
      yieldImpact,
      qualityScore,
      recommendations,
      warnings
    };
  }

  private validateProtocol(protocol: UVExposureProtocol): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const curve = this.uvResponseCurves[protocol.wavelength];

    if (protocol.wavelength === 'UVC') {
      warnings.push('UV-C is not recommended for cannabis cultivation due to extreme plant damage');
    }

    if (protocol.intensity > curve.optimalIntensity * 2) {
      warnings.push(`UV intensity exceeds safe levels. Recommended max: ${curve.optimalIntensity * 2} μmol/m²/s`);
    }

    if (protocol.duration > curve.maxSafeDuration) {
      warnings.push(`UV exposure duration exceeds safe limits. Max recommended: ${curve.maxSafeDuration} minutes`);
    }

    if (protocol.startWeek < 3) {
      warnings.push('UV exposure before week 3 of flowering may cause excessive stress');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  private calculateStressLevel(protocol: UVExposureProtocol): UVAnalysisResult['stressLevel'] {
    const curve = this.uvResponseCurves[protocol.wavelength];
    
    // Calculate stress index
    const intensityStress = (protocol.intensity / curve.optimalIntensity) * curve.stressFactor;
    const durationStress = (protocol.duration / 60) * 0.1; // Hours of exposure
    const totalStress = intensityStress + durationStress;

    if (totalStress < 0.3) return 'low';
    if (totalStress < 0.6) return 'moderate';
    if (totalStress < 1.0) return 'high';
    return 'extreme';
  }

  private predictCannabinoidChanges(
    protocol: UVExposureProtocol,
    baseline: CannabinoidProfile,
    strainType: keyof typeof this.strainCategories,
    currentWeek: number
  ): CannabinoidProfile {
    const curve = this.uvResponseCurves[protocol.wavelength];
    const strain = this.strainCategories[strainType];
    
    // Calculate UV dose (DLI - Daily Light Integral for UV)
    const uvDose = (protocol.intensity * protocol.duration * 60) / 1000000; // mol/m²/day
    
    // Week-based response (stronger response in late flowering)
    const weekMultiplier = Math.min(1.5, 0.5 + (currentWeek / 8));
    
    // Calculate THC enhancement
    const baseMultiplier = curve.thcMultiplier * strain.thcResponse * weekMultiplier;
    const doseResponse = Math.log10(uvDose + 1) * 0.5; // Logarithmic response
    const thcMultiplier = baseMultiplier + doseResponse;

    // Apply changes to cannabinoids
    const enhanced: CannabinoidProfile = {
      thc: baseline.thc * thcMultiplier,
      thca: baseline.thca * thcMultiplier,
      cbd: baseline.cbd * (1 + (thcMultiplier - 1) * 0.3), // CBD less responsive
      cbda: baseline.cbda * (1 + (thcMultiplier - 1) * 0.3),
      cbg: baseline.cbg * (1 + (thcMultiplier - 1) * 0.5),
      cbc: baseline.cbc * (1 + (thcMultiplier - 1) * 0.4),
      cbn: baseline.cbn * (1 + (thcMultiplier - 1) * 0.2), // CBN from degradation
      thcv: baseline.thcv * (1 + (thcMultiplier - 1) * 0.6),
      totalCannabinoids: 0
    };

    // Recalculate total
    enhanced.totalCannabinoids = Object.entries(enhanced)
      .filter(([key]) => key !== 'totalCannabinoids')
      .reduce((sum, [_, value]) => sum + value, 0);

    return enhanced;
  }

  private calculateYieldImpact(
    protocol: UVExposureProtocol,
    stressLevel: UVAnalysisResult['stressLevel']
  ): number {
    // UV stress typically reduces yield
    const stressImpacts = {
      low: -2,
      moderate: -5,
      high: -10,
      extreme: -20
    };

    let impact = stressImpacts[stressLevel];

    // Timing affects impact
    if (protocol.timing === 'midday') {
      impact *= 1.2; // Worse during peak photosynthesis
    } else if (protocol.timing === 'morning' || protocol.timing === 'evening') {
      impact *= 0.8; // Less impact outside peak hours
    }

    return impact;
  }

  private calculateQualityScore(
    cannabinoids: CannabinoidProfile,
    yieldImpact: number,
    stressLevel: UVAnalysisResult['stressLevel']
  ): number {
    let score = 50; // Base score

    // Cannabinoid potency bonus
    if (cannabinoids.totalCannabinoids > 25) score += 20;
    else if (cannabinoids.totalCannabinoids > 20) score += 15;
    else if (cannabinoids.totalCannabinoids > 15) score += 10;

    // THC:CBD ratio bonus
    const ratio = cannabinoids.thc / (cannabinoids.cbd || 0.1);
    if (ratio > 20) score += 10; // High THC
    else if (ratio < 1) score += 10; // High CBD
    else if (ratio >= 1 && ratio <= 2) score += 15; // Balanced

    // Yield penalty
    score += yieldImpact * 0.5;

    // Stress penalty
    const stressPenalties = {
      low: 0,
      moderate: -5,
      high: -10,
      extreme: -20
    };
    score += stressPenalties[stressLevel];

    // Terpene bonus (UV enhances terpenes)
    if (stressLevel === 'moderate') score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    protocol: UVExposureProtocol,
    stressLevel: UVAnalysisResult['stressLevel'],
    currentWeek: number,
    strainType: keyof typeof this.strainCategories
  ): string[] {
    const recommendations: string[] = [];

    // Timing recommendations
    if (protocol.timing === 'continuous') {
      recommendations.push('Consider pulsed UV exposure instead of continuous to reduce stress');
    }

    if (currentWeek < 4) {
      recommendations.push('Wait until week 4+ of flowering for optimal UV response');
    }

    // Intensity recommendations
    const curve = this.uvResponseCurves[protocol.wavelength];
    if (protocol.intensity < curve.optimalIntensity * 0.5) {
      recommendations.push(`Increase UV intensity to ${curve.optimalIntensity * 0.7}-${curve.optimalIntensity} μmol/m²/s for better results`);
    }

    // Duration recommendations
    if (stressLevel === 'high' || stressLevel === 'extreme') {
      recommendations.push('Reduce exposure duration or intensity to prevent yield loss');
    }

    // Strain-specific
    if (strainType === 'lowland' && protocol.wavelength === 'UVB') {
      recommendations.push('Lowland strains are UV-sensitive. Start with 50% of recommended dose');
    }

    // Environmental interactions
    recommendations.push('Ensure adequate calcium and magnesium to support UV stress response');
    recommendations.push('Maintain VPD at 0.8-1.0 kPa during UV exposure for optimal results');

    // Recovery recommendations
    if (stressLevel !== 'low') {
      recommendations.push('Provide 24-48 hours recovery time between UV exposures');
      recommendations.push('Monitor for signs of bleaching or leaf curl');
    }

    return recommendations;
  }

  // Generate optimal UV protocol for target THC increase
  generateOptimalProtocol(
    targetThcIncrease: number, // Percentage increase desired
    strainType: keyof typeof this.strainCategories = 'hybrid',
    currentWeek: number,
    maxAcceptableYieldLoss: number = 5
  ): UVExposureProtocol {
    // For most strains, UV-B provides best THC enhancement
    const wavelength: 'UVB' = 'UVB';
    const curve = this.uvResponseCurves[wavelength];
    const strain = this.strainCategories[strainType];

    // Calculate required UV dose
    const requiredMultiplier = 1 + (targetThcIncrease / 100);
    const adjustedTarget = requiredMultiplier / strain.thcResponse;

    // Start conservative
    let intensity = curve.optimalIntensity * 0.7;
    let duration = 30; // Start with 30 minutes

    // Adjust based on yield tolerance
    if (maxAcceptableYieldLoss < 3) {
      intensity *= 0.5;
      duration = 20;
    } else if (maxAcceptableYieldLoss > 10) {
      intensity = curve.optimalIntensity;
      duration = 60;
    }

    // Week-based adjustments
    const startWeek = Math.max(4, currentWeek);
    const endWeek = 8; // Typical harvest week

    return {
      wavelength,
      intensity: Math.round(intensity * 10) / 10,
      duration,
      timing: 'midday', // When stomata are open
      startWeek,
      endWeek
    };
  }
}

export const uvThcAnalyzer = new CannabisUVTHCAnalyzer();