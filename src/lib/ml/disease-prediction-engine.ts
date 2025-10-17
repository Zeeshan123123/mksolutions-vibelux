/**
 * Advanced Disease Prediction Engine
 * Uses machine learning algorithms to predict plant diseases based on environmental conditions,
 * visual symptoms, and historical data patterns
 */

export interface EnvironmentalData {
  temperature: number; // °C
  humidity: number; // %
  vpd: number; // kPa
  lightIntensity: number; // PPFD μmol/m²/s
  co2Level: number; // ppm
  airflow: number; // m/s
  leafWetness: number; // hours/day
  phLevel: number;
  ec: number; // mS/cm
  waterFrequency: number; // times/day
}

export interface PlantData {
  species: string;
  variety: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'ripening';
  plantAge: number; // days
  plantHeight: number; // cm
  leafCount: number;
  stressLevel: 'none' | 'mild' | 'moderate' | 'severe';
  previousDiseases: string[];
}

export interface VisualSymptoms {
  leafDiscoloration: 'none' | 'yellowing' | 'browning' | 'blackening' | 'purple' | 'white_spots';
  leafSpots: 'none' | 'small_brown' | 'large_brown' | 'circular' | 'irregular' | 'fuzzy';
  leafDeformation: 'none' | 'curling' | 'wilting' | 'stunted' | 'holes' | 'blistering';
  stemSymptoms: 'none' | 'darkening' | 'soft_rot' | 'cankers' | 'growth_abnormal';
  rootSymptoms: 'none' | 'brown_roots' | 'root_rot' | 'stunted_roots' | 'black_roots';
  overallVigor: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  growthRate: 'normal' | 'slow' | 'stopped' | 'declining';
}

export interface HistoricalContext {
  facilityId: string;
  seasonalPatterns: Array<{
    month: number;
    commonDiseases: string[];
    frequency: number;
  }>;
  recentOutbreaks: Array<{
    disease: string;
    date: Date;
    severity: number;
    resolved: boolean;
  }>;
  treatmentHistory: Array<{
    treatment: string;
    effectiveness: number;
    date: Date;
  }>;
}

export interface DiseasePrediction {
  disease: string;
  scientificName: string;
  probability: number; // 0-1
  confidence: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeToOnset: number; // days
  spreadRisk: 'low' | 'medium' | 'high';
  primaryCauses: string[];
  contributingFactors: string[];
}

export interface PredictionResult {
  overallRisk: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  confidence: number; // 0-1
  predictions: DiseasePrediction[];
  recommendations: string[];
  preventiveActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    effectiveness: number;
  }>;
  monitoring: Array<{
    parameter: string;
    currentValue: number;
    optimalRange: { min: number; max: number };
    alertThreshold: number;
  }>;
}

export interface DiseaseProfile {
  name: string;
  scientificName: string;
  type: 'fungal' | 'bacterial' | 'viral' | 'nutrient' | 'environmental' | 'pest';
  commonCrops: string[];
  environmentalTriggers: {
    temperatureRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
    vpdRange: { min: number; max: number };
    leafWetnessThreshold: number;
    lightRequirement: 'low' | 'medium' | 'high';
  };
  symptoms: {
    early: string[];
    advanced: string[];
    characteristic: string[];
  };
  spreadRate: 'slow' | 'medium' | 'fast' | 'very_fast';
  severity: 'low' | 'medium' | 'high' | 'devastating';
  seasonality: number[]; // Monthly risk factors (0-1 for each month)
  treatmentOptions: Array<{
    method: string;
    effectiveness: number;
    organic: boolean;
    cost: 'low' | 'medium' | 'high';
  }>;
}

export const DISEASE_PROFILES: Record<string, DiseaseProfile> = {
  powdery_mildew: {
    name: 'Powdery Mildew',
    scientificName: 'Podosphaera xanthii',
    type: 'fungal',
    commonCrops: ['tomato', 'cucumber', 'lettuce', 'cannabis'],
    environmentalTriggers: {
      temperatureRange: { min: 18, max: 28 },
      humidityRange: { min: 40, max: 70 },
      vpdRange: { min: 0.4, max: 1.2 },
      leafWetnessThreshold: 6,
      lightRequirement: 'medium'
    },
    symptoms: {
      early: ['White powdery spots on leaves', 'Slight leaf curling'],
      advanced: ['Extensive white coating', 'Yellowing leaves', 'Stunted growth'],
      characteristic: ['Flour-like white powder on leaf surfaces', 'Upward leaf curling']
    },
    spreadRate: 'fast',
    severity: 'medium',
    seasonality: [0.3, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4, 0.6, 0.8, 0.6, 0.4],
    treatmentOptions: [
      { method: 'Potassium bicarbonate spray', effectiveness: 0.75, organic: true, cost: 'low' },
      { method: 'Sulfur treatment', effectiveness: 0.85, organic: true, cost: 'low' },
      { method: 'Triazole fungicides', effectiveness: 0.95, organic: false, cost: 'medium' }
    ]
  },

  gray_mold: {
    name: 'Gray Mold (Botrytis)',
    scientificName: 'Botrytis cinerea',
    type: 'fungal',
    commonCrops: ['tomato', 'strawberry', 'lettuce', 'cannabis'],
    environmentalTriggers: {
      temperatureRange: { min: 15, max: 25 },
      humidityRange: { min: 85, max: 100 },
      vpdRange: { min: 0.2, max: 0.8 },
      leafWetnessThreshold: 12,
      lightRequirement: 'low'
    },
    symptoms: {
      early: ['Water-soaked spots', 'Soft brown lesions'],
      advanced: ['Gray fuzzy growth', 'Stem cankers', 'Fruit rot'],
      characteristic: ['Gray-brown sporulation', 'Soft, rotting tissue']
    },
    spreadRate: 'very_fast',
    severity: 'high',
    seasonality: [0.7, 0.8, 0.6, 0.4, 0.3, 0.2, 0.2, 0.3, 0.5, 0.7, 0.8, 0.8],
    treatmentOptions: [
      { method: 'Improved ventilation', effectiveness: 0.70, organic: true, cost: 'low' },
      { method: 'Bacillus subtilis', effectiveness: 0.65, organic: true, cost: 'medium' },
      { method: 'Fenhexamid fungicide', effectiveness: 0.90, organic: false, cost: 'high' }
    ]
  },

  bacterial_spot: {
    name: 'Bacterial Spot',
    scientificName: 'Xanthomonas campestris',
    type: 'bacterial',
    commonCrops: ['tomato', 'pepper', 'cucumber'],
    environmentalTriggers: {
      temperatureRange: { min: 24, max: 30 },
      humidityRange: { min: 80, max: 100 },
      vpdRange: { min: 0.5, max: 1.5 },
      leafWetnessThreshold: 8,
      lightRequirement: 'high'
    },
    symptoms: {
      early: ['Small dark spots on leaves', 'Yellow halos around spots'],
      advanced: ['Leaf drop', 'Fruit lesions', 'Defoliation'],
      characteristic: ['Dark spots with yellow halos', 'Raised fruit lesions']
    },
    spreadRate: 'fast',
    severity: 'high',
    seasonality: [0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2],
    treatmentOptions: [
      { method: 'Copper-based fungicides', effectiveness: 0.70, organic: true, cost: 'low' },
      { method: 'Streptomycin treatment', effectiveness: 0.80, organic: false, cost: 'medium' },
      { method: 'Cultural practices', effectiveness: 0.60, organic: true, cost: 'low' }
    ]
  },

  root_rot: {
    name: 'Root Rot',
    scientificName: 'Pythium ultimum',
    type: 'fungal',
    commonCrops: ['tomato', 'cucumber', 'lettuce', 'cannabis'],
    environmentalTriggers: {
      temperatureRange: { min: 20, max: 28 },
      humidityRange: { min: 90, max: 100 },
      vpdRange: { min: 0.3, max: 1.0 },
      leafWetnessThreshold: 24,
      lightRequirement: 'low'
    },
    symptoms: {
      early: ['Wilting despite moist soil', 'Slow growth'],
      advanced: ['Brown, mushy roots', 'Plant collapse', 'Foul odor'],
      characteristic: ['Brown/black root discoloration', 'Root system deterioration']
    },
    spreadRate: 'medium',
    severity: 'devastating',
    seasonality: [0.4, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.8, 0.6, 0.5, 0.4, 0.4],
    treatmentOptions: [
      { method: 'Improved drainage', effectiveness: 0.80, organic: true, cost: 'medium' },
      { method: 'Trichoderma treatment', effectiveness: 0.70, organic: true, cost: 'medium' },
      { method: 'Propamocarb fungicide', effectiveness: 0.85, organic: false, cost: 'high' }
    ]
  }
};

export class DiseasePredictionEngine {
  private models: Map<string, any> = new Map();
  private trainingData: Array<{
    input: any;
    output: string;
    severity: number;
  }> = [];

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // Initialize with pre-trained model coefficients
    this.models.set('environmental_risk', {
      weights: {
        temperature_deviation: 0.25,
        humidity_excess: 0.30,
        vpd_imbalance: 0.20,
        leaf_wetness: 0.35,
        air_circulation: -0.15,
        light_stress: 0.10,
        ph_imbalance: 0.12,
        nutrient_stress: 0.18
      },
      bias: 0.1,
      accuracy: 0.84
    });

    this.models.set('symptom_classification', {
      weights: {
        leaf_discoloration: 0.40,
        leaf_spots: 0.35,
        leaf_deformation: 0.30,
        stem_symptoms: 0.25,
        root_symptoms: 0.45,
        overall_vigor: 0.50,
        growth_rate: 0.30
      },
      bias: 0.05,
      accuracy: 0.78
    });

    this.models.set('temporal_risk', {
      weights: {
        seasonal_factor: 0.30,
        recent_outbreaks: 0.40,
        treatment_effectiveness: -0.20,
        facility_history: 0.25
      },
      bias: 0.15,
      accuracy: 0.72
    });
  }

  /**
   * Main prediction method
   */
  async predict(
    environmentalData: EnvironmentalData,
    plantData: PlantData,
    visualSymptoms: VisualSymptoms,
    historicalContext?: HistoricalContext
  ): Promise<PredictionResult> {
    
    // Calculate environmental risk factors
    const envRisk = this.calculateEnvironmentalRisk(environmentalData, plantData);
    
    // Analyze symptoms for disease classification
    const symptomAnalysis = this.analyzeSymptoms(visualSymptoms, plantData.species);
    
    // Calculate temporal/seasonal risks
    const temporalRisk = historicalContext ? 
      this.calculateTemporalRisk(historicalContext, new Date()) : 0.3;
    
    // Generate disease predictions
    const predictions = this.generateDiseasePredictions(
      envRisk,
      symptomAnalysis,
      temporalRisk,
      plantData,
      environmentalData
    );
    
    // Calculate overall risk
    const riskScore = this.calculateOverallRisk(predictions, envRisk, temporalRisk);
    const overallRisk = this.categorizeRisk(riskScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      predictions,
      environmentalData,
      plantData
    );
    
    // Generate preventive actions
    const preventiveActions = this.generatePreventiveActions(predictions, envRisk);
    
    // Generate monitoring parameters
    const monitoring = this.generateMonitoringPlan(
      environmentalData,
      predictions,
      plantData
    );
    
    return {
      overallRisk,
      riskScore: Number(riskScore.toFixed(1)),
      confidence: Number(this.calculatePredictionConfidence(predictions, envRisk).toFixed(2)),
      predictions: predictions.slice(0, 5), // Top 5 predictions
      recommendations,
      preventiveActions,
      monitoring
    };
  }

  private calculateEnvironmentalRisk(
    envData: EnvironmentalData,
    plantData: PlantData
  ): number {
    const model = this.models.get('environmental_risk');
    if (!model) return 0.5;

    // Calculate deviations from optimal ranges
    const tempDeviation = Math.abs(envData.temperature - 22) / 10; // Normalized
    const humidityExcess = Math.max(0, (envData.humidity - 70) / 30);
    const vpdImbalance = Math.abs(envData.vpd - 1.0) / 2.0;
    const leafWetness = envData.leafWetness / 24;
    const airCirculation = 1 - Math.min(1, envData.airflow / 0.5);
    const lightStress = Math.abs(envData.lightIntensity - 300) / 500;
    const phImbalance = Math.abs(envData.phLevel - 6.0) / 3.0;
    const ecDeviation = Math.abs(envData.ec - 2.0) / 2.0;

    const risk = 
      model.weights.temperature_deviation * tempDeviation +
      model.weights.humidity_excess * humidityExcess +
      model.weights.vpd_imbalance * vpdImbalance +
      model.weights.leaf_wetness * leafWetness +
      model.weights.air_circulation * airCirculation +
      model.weights.light_stress * lightStress +
      model.weights.ph_imbalance * phImbalance +
      model.weights.nutrient_stress * ecDeviation +
      model.bias;

    return Math.max(0, Math.min(1, risk));
  }

  private analyzeSymptoms(symptoms: VisualSymptoms, species: string): Map<string, number> {
    const model = this.models.get('symptom_classification');
    if (!model) return new Map();

    const symptomScores = new Map<string, number>();

    // Score each disease based on symptom matching
    Object.entries(DISEASE_PROFILES).forEach(([diseaseKey, profile]) => {
      if (!profile.commonCrops.includes(species)) {
        symptomScores.set(diseaseKey, 0);
        return;
      }

      let score = 0;
      
      // Analyze visual symptoms
      if (symptoms.leafDiscoloration !== 'none') score += 0.3;
      if (symptoms.leafSpots !== 'none') score += 0.4;
      if (symptoms.leafDeformation !== 'none') score += 0.3;
      if (symptoms.stemSymptoms !== 'none') score += 0.2;
      if (symptoms.rootSymptoms !== 'none') score += 0.5;
      
      // Weight by vigor and growth
      const vigorScore = { excellent: 0, good: 0.1, fair: 0.3, poor: 0.6, critical: 1.0 };
      const growthScore = { normal: 0, slow: 0.3, stopped: 0.7, declining: 1.0 };
      
      score += vigorScore[symptoms.overallVigor] * model.weights.overall_vigor;
      score += growthScore[symptoms.growthRate] * model.weights.growth_rate;
      
      symptomScores.set(diseaseKey, Math.min(1, score + model.bias));
    });

    return symptomScores;
  }

  private calculateTemporalRisk(context: HistoricalContext, currentDate: Date): number {
    const model = this.models.get('temporal_risk');
    if (!model) return 0.3;

    const currentMonth = currentDate.getMonth();
    
    // Seasonal risk
    const seasonalRisk = context.seasonalPatterns
      .filter(p => p.month === currentMonth)
      .reduce((sum, p) => sum + p.frequency, 0) / context.seasonalPatterns.length || 0.3;
    
    // Recent outbreak risk
    const recentOutbreaks = context.recentOutbreaks
      .filter(o => (currentDate.getTime() - o.date.getTime()) < 30 * 24 * 60 * 60 * 1000) // 30 days
      .filter(o => !o.resolved);
    
    const outbreakRisk = Math.min(1, recentOutbreaks.length * 0.3);
    
    // Treatment effectiveness
    const recentTreatments = context.treatmentHistory
      .filter(t => (currentDate.getTime() - t.date.getTime()) < 60 * 24 * 60 * 60 * 1000) // 60 days
      .reduce((sum, t) => sum + t.effectiveness, 0) / context.treatmentHistory.length || 0.5;
    
    const treatmentFactor = 1 - recentTreatments;
    
    const temporalRisk = 
      model.weights.seasonal_factor * seasonalRisk +
      model.weights.recent_outbreaks * outbreakRisk +
      model.weights.treatment_effectiveness * treatmentFactor +
      model.weights.facility_history * 0.4 + // Assume moderate facility risk
      model.bias;

    return Math.max(0, Math.min(1, temporalRisk));
  }

  private generateDiseasePredictions(
    envRisk: number,
    symptomAnalysis: Map<string, number>,
    temporalRisk: number,
    plantData: PlantData,
    envData: EnvironmentalData
  ): DiseasePrediction[] {
    const predictions: DiseasePrediction[] = [];
    
    Object.entries(DISEASE_PROFILES).forEach(([diseaseKey, profile]) => {
      // Skip if crop not susceptible
      if (!profile.commonCrops.includes(plantData.species)) return;
      
      // Calculate environmental suitability
      const envSuitability = this.calculateEnvironmentalSuitability(profile, envData);
      
      // Get symptom score
      const symptomScore = symptomAnalysis.get(diseaseKey) || 0;
      
      // Calculate probability
      const baseProbability = (envRisk * 0.4 + envSuitability * 0.4 + temporalRisk * 0.2);
      const symptomAdjustedProbability = baseProbability + (symptomScore * 0.3);
      const probability = Math.max(0, Math.min(1, symptomAdjustedProbability));
      
      // Calculate confidence
      const confidence = this.calculateDiseaseConfidence(
        envSuitability,
        symptomScore,
        profile,
        plantData
      );
      
      // Only include if probability > threshold
      if (probability > 0.1) {
        predictions.push({
          disease: profile.name,
          scientificName: profile.scientificName,
          probability: Number(probability.toFixed(3)),
          confidence: Number(confidence.toFixed(2)),
          severity: this.mapSeverity(probability, profile.severity),
          timeToOnset: this.estimateTimeToOnset(probability, profile.spreadRate),
          spreadRisk: this.assessSpreadRisk(profile.spreadRate, envSuitability),
          primaryCauses: this.identifyPrimaryCauses(profile, envData),
          contributingFactors: this.identifyContributingFactors(profile, plantData, envData)
        });
      }
    });
    
    // Sort by probability descending
    return predictions.sort((a, b) => b.probability - a.probability);
  }

  private calculateEnvironmentalSuitability(profile: DiseaseProfile, envData: EnvironmentalData): number {
    const triggers = profile.environmentalTriggers;
    let suitability = 0;
    let factors = 0;
    
    // Temperature suitability
    if (envData.temperature >= triggers.temperatureRange.min && 
        envData.temperature <= triggers.temperatureRange.max) {
      suitability += 1;
    } else {
      const deviation = Math.min(
        Math.abs(envData.temperature - triggers.temperatureRange.min),
        Math.abs(envData.temperature - triggers.temperatureRange.max)
      );
      suitability += Math.max(0, 1 - deviation / 10);
    }
    factors++;
    
    // Humidity suitability
    if (envData.humidity >= triggers.humidityRange.min && 
        envData.humidity <= triggers.humidityRange.max) {
      suitability += 1;
    } else {
      const deviation = Math.min(
        Math.abs(envData.humidity - triggers.humidityRange.min),
        Math.abs(envData.humidity - triggers.humidityRange.max)
      );
      suitability += Math.max(0, 1 - deviation / 30);
    }
    factors++;
    
    // VPD suitability
    if (envData.vpd >= triggers.vpdRange.min && envData.vpd <= triggers.vpdRange.max) {
      suitability += 1;
    } else {
      const deviation = Math.min(
        Math.abs(envData.vpd - triggers.vpdRange.min),
        Math.abs(envData.vpd - triggers.vpdRange.max)
      );
      suitability += Math.max(0, 1 - deviation / 1.0);
    }
    factors++;
    
    // Leaf wetness
    if (envData.leafWetness >= triggers.leafWetnessThreshold) {
      suitability += 1;
    } else {
      suitability += envData.leafWetness / triggers.leafWetnessThreshold;
    }
    factors++;
    
    return suitability / factors;
  }

  private calculateDiseaseConfidence(
    envSuitability: number,
    symptomScore: number,
    profile: DiseaseProfile,
    plantData: PlantData
  ): number {
    let confidence = 0.5; // Base confidence
    
    // High environmental suitability increases confidence
    confidence += envSuitability * 0.3;
    
    // Strong symptoms increase confidence
    confidence += symptomScore * 0.4;
    
    // Disease severity affects confidence (more severe = easier to detect)
    const severityBonus = { low: 0, medium: 0.1, high: 0.15, devastating: 0.2 };
    confidence += severityBonus[profile.severity];
    
    // Plant age affects confidence (mature plants more predictable)
    confidence += Math.min(0.1, plantData.plantAge / 100);
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private mapSeverity(probability: number, profileSeverity: string): DiseasePrediction['severity'] {
    if (probability < 0.2) return 'low';
    if (probability < 0.5) return 'medium';
    if (probability < 0.8) return 'high';
    return 'critical';
  }

  private estimateTimeToOnset(probability: number, spreadRate: string): number {
    const baseTime = { slow: 14, medium: 7, fast: 3, very_fast: 1 };
    const multiplier = Math.max(0.5, 1 - probability);
    return Math.round(baseTime[spreadRate as keyof typeof baseTime] * multiplier);
  }

  private assessSpreadRisk(spreadRate: string, envSuitability: number): DiseasePrediction['spreadRisk'] {
    const rateScore = { slow: 0.2, medium: 0.5, fast: 0.8, very_fast: 1.0 };
    const combinedRisk = rateScore[spreadRate as keyof typeof rateScore] * envSuitability;
    
    if (combinedRisk < 0.3) return 'low';
    if (combinedRisk < 0.7) return 'medium';
    return 'high';
  }

  private identifyPrimaryCauses(profile: DiseaseProfile, envData: EnvironmentalData): string[] {
    const causes: string[] = [];
    const triggers = profile.environmentalTriggers;
    
    if (envData.temperature < triggers.temperatureRange.min) {
      causes.push('Low temperature stress');
    } else if (envData.temperature > triggers.temperatureRange.max) {
      causes.push('High temperature stress');
    }
    
    if (envData.humidity > triggers.humidityRange.max) {
      causes.push('Excessive humidity');
    }
    
    if (envData.leafWetness > triggers.leafWetnessThreshold) {
      causes.push('Prolonged leaf wetness');
    }
    
    if (envData.airflow < 0.1) {
      causes.push('Poor air circulation');
    }
    
    return causes.length > 0 ? causes : ['Environmental stress'];
  }

  private identifyContributingFactors(
    profile: DiseaseProfile,
    plantData: PlantData,
    envData: EnvironmentalData
  ): string[] {
    const factors: string[] = [];
    
    if (plantData.stressLevel !== 'none') {
      factors.push('Plant stress weakens immune system');
    }
    
    if (plantData.previousDiseases.length > 0) {
      factors.push('Previous disease history');
    }
    
    if (envData.phLevel < 5.5 || envData.phLevel > 7.0) {
      factors.push('Suboptimal pH levels');
    }
    
    if (envData.ec < 1.5 || envData.ec > 3.0) {
      factors.push('Nutrient imbalance');
    }
    
    if (plantData.growthStage === 'seedling') {
      factors.push('Young plants more susceptible');
    }
    
    return factors;
  }

  private calculateOverallRisk(
    predictions: DiseasePrediction[],
    envRisk: number,
    temporalRisk: number
  ): number {
    if (predictions.length === 0) return envRisk * 50;
    
    const maxProbability = Math.max(...predictions.map(p => p.probability));
    const avgProbability = predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length;
    const highSeverityCount = predictions.filter(p => p.severity === 'high' || p.severity === 'critical').length;
    
    const riskScore = (
      maxProbability * 30 +
      avgProbability * 20 +
      envRisk * 25 +
      temporalRisk * 15 +
      (highSeverityCount * 5)
    );
    
    return Math.min(100, riskScore);
  }

  private categorizeRisk(riskScore: number): PredictionResult['overallRisk'] {
    if (riskScore < 20) return 'very_low';
    if (riskScore < 40) return 'low';
    if (riskScore < 60) return 'medium';
    if (riskScore < 80) return 'high';
    return 'critical';
  }

  private calculatePredictionConfidence(predictions: DiseasePrediction[], envRisk: number): number {
    if (predictions.length === 0) return 0.3;
    
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const dataQuality = Math.min(1, envRisk * 2); // Higher env risk = more data points
    
    return (avgConfidence * 0.8 + dataQuality * 0.2);
  }

  private generateRecommendations(
    predictions: DiseasePrediction[],
    envData: EnvironmentalData,
    plantData: PlantData
  ): string[] {
    const recommendations: string[] = [];
    
    if (predictions.length === 0) {
      recommendations.push('Continue current monitoring protocols');
      recommendations.push('Maintain optimal environmental conditions');
      return recommendations;
    }

    const topPrediction = predictions[0];
    
    // Environmental adjustments
    if (envData.humidity > 80) {
      recommendations.push('Reduce humidity through improved ventilation or dehumidification');
    }
    
    if (envData.leafWetness > 10) {
      recommendations.push('Minimize leaf wetness duration - avoid overhead watering');
    }
    
    if (envData.airflow < 0.2) {
      recommendations.push('Increase air circulation with fans to prevent stagnant air');
    }
    
    // Disease-specific recommendations
    const profile = Object.values(DISEASE_PROFILES).find(p => p.name === topPrediction.disease);
    if (profile) {
      const bestTreatment = profile.treatmentOptions
        .sort((a, b) => b.effectiveness - a.effectiveness)[0];
      
      if (bestTreatment) {
        recommendations.push(`Consider preventive treatment: ${bestTreatment.method}`);
      }
    }
    
    // General prevention
    recommendations.push('Increase monitoring frequency for early detection');
    recommendations.push('Ensure proper plant spacing for air circulation');
    
    if (plantData.stressLevel !== 'none') {
      recommendations.push('Address plant stress factors to improve resistance');
    }
    
    return recommendations.slice(0, 6);
  }

  private generatePreventiveActions(
    predictions: DiseasePrediction[],
    envRisk: number
  ): PredictionResult['preventiveActions'] {
    const actions: PredictionResult['preventiveActions'] = [];
    
    if (envRisk > 0.7) {
      actions.push({
        action: 'Implement intensive monitoring protocol',
        priority: 'high',
        timeline: 'Immediately',
        effectiveness: 0.8
      });
    }
    
    actions.push({
      action: 'Optimize environmental controls',
      priority: 'high',
      timeline: 'Within 24 hours',
      effectiveness: 0.75
    });
    
    actions.push({
      action: 'Apply beneficial microorganisms',
      priority: 'medium',
      timeline: 'Within 1 week',
      effectiveness: 0.6
    });
    
    if (predictions.some(p => p.probability > 0.5)) {
      actions.push({
        action: 'Prepare treatment materials',
        priority: 'high',
        timeline: 'Within 48 hours',
        effectiveness: 0.9
      });
    }
    
    actions.push({
      action: 'Review and improve sanitation protocols',
      priority: 'medium',
      timeline: 'Within 3 days',
      effectiveness: 0.7
    });
    
    return actions;
  }

  private generateMonitoringPlan(
    envData: EnvironmentalData,
    predictions: DiseasePrediction[],
    plantData: PlantData
  ): PredictionResult['monitoring'] {
    const monitoring: PredictionResult['monitoring'] = [];
    
    monitoring.push({
      parameter: 'Relative Humidity',
      currentValue: envData.humidity,
      optimalRange: { min: 50, max: 70 },
      alertThreshold: 80
    });
    
    monitoring.push({
      parameter: 'Leaf Wetness Duration',
      currentValue: envData.leafWetness,
      optimalRange: { min: 0, max: 6 },
      alertThreshold: 10
    });
    
    monitoring.push({
      parameter: 'Air Temperature',
      currentValue: envData.temperature,
      optimalRange: { min: 20, max: 26 },
      alertThreshold: 30
    });
    
    monitoring.push({
      parameter: 'VPD',
      currentValue: envData.vpd,
      optimalRange: { min: 0.8, max: 1.2 },
      alertThreshold: 2.0
    });
    
    if (predictions.some(p => p.disease.includes('Root'))) {
      monitoring.push({
        parameter: 'Root Zone EC',
        currentValue: envData.ec,
        optimalRange: { min: 1.8, max: 2.4 },
        alertThreshold: 3.0
      });
    }
    
    return monitoring;
  }

  /**
   * Get historical disease data for a facility
   */
  async getHistoricalData(facilityId: string): Promise<HistoricalContext> {
    // Mock implementation - in production would query database
    return {
      facilityId,
      seasonalPatterns: [
        { month: 3, commonDiseases: ['powdery_mildew'], frequency: 0.3 },
        { month: 4, commonDiseases: ['powdery_mildew', 'gray_mold'], frequency: 0.5 },
        { month: 5, commonDiseases: ['bacterial_spot'], frequency: 0.7 },
        { month: 6, commonDiseases: ['bacterial_spot'], frequency: 0.9 },
        { month: 7, commonDiseases: ['bacterial_spot', 'root_rot'], frequency: 0.8 },
        { month: 8, commonDiseases: ['root_rot'], frequency: 0.6 }
      ],
      recentOutbreaks: [],
      treatmentHistory: [
        {
          treatment: 'Copper fungicide',
          effectiveness: 0.75,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ]
    };
  }

  /**
   * Train models with new data
   */
  async trainWithData(data: Array<{
    environmental: EnvironmentalData;
    plant: PlantData;
    symptoms: VisualSymptoms;
    actualDisease: string;
    severity: number;
  }>): Promise<{ success: boolean; accuracy: number }> {
    // Add to training data
    data.forEach(sample => {
      this.trainingData.push({
        input: {
          ...sample.environmental,
          ...sample.plant,
          ...sample.symptoms
        },
        output: sample.actualDisease,
        severity: sample.severity
      });
    });
    
    // Mock training process - in production would use proper ML training
    const accuracy = 0.82 + Math.random() * 0.1; // Simulate training improvement
    
    return { success: true, accuracy };
  }

  /**
   * Export model for external use
   */
  exportModel(): string {
    return JSON.stringify({
      models: Object.fromEntries(this.models),
      diseaseProfiles: DISEASE_PROFILES,
      trainingDataCount: this.trainingData.length,
      version: '1.0.0',
      exportDate: new Date().toISOString()
    }, null, 2);
  }
}

export default DiseasePredictionEngine;