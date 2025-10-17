// VibeLux Disease Prediction Engine - Functional Implementation
export interface DiseaseRiskFactors {
  temperature: number;
  humidity: number;
  leafWetness?: number;
  airflow?: number;
  plantDensity?: number;
  cropType?: string;
  growthStage?: string;
  previousDiseases?: string[];
  waterPH?: number;
  nutrientEC?: number;
}

export interface DiseasePrediction {
  disease: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  preventativeMeasures: string[];
  symptoms: string[];
  treatmentOptions: string[];
  environmentalTriggers: string[];
}

export interface DiseaseRule {
  disease: string;
  conditions: {
    temperatureRange?: [number, number];
    humidityRange?: [number, number];
    leafWetnessThreshold?: number;
    airflowMax?: number;
    plantDensityThreshold?: number;
    phRange?: [number, number];
  };
  cropsSusceptible: string[];
  riskMultipliers: {
    temperature?: number;
    humidity?: number;
    leafWetness?: number;
    airflow?: number;
    plantDensity?: number;
  };
}

export class DiseasePredictionEngine {
  private diseaseRules: DiseaseRule[] = [];
  
  constructor() {
    this.initializeDiseaseRules();
  }
  
  private initializeDiseaseRules() {
    this.diseaseRules = [
      {
        disease: 'Powdery Mildew',
        conditions: {
          temperatureRange: [20, 25],
          humidityRange: [40, 70],
          airflowMax: 0.3
        },
        cropsSusceptible: ['cannabis', 'cucumber', 'tomato', 'lettuce', 'spinach'],
        riskMultipliers: {
          humidity: 1.5,
          airflow: 2.0,
          plantDensity: 1.3
        }
      },
      {
        disease: 'Botrytis (Gray Mold)',
        conditions: {
          temperatureRange: [15, 23],
          humidityRange: [85, 100],
          leafWetnessThreshold: 6,
          airflowMax: 0.2
        },
        cropsSusceptible: ['cannabis', 'tomato', 'lettuce', 'strawberry', 'cucumber'],
        riskMultipliers: {
          humidity: 2.0,
          leafWetness: 2.5,
          airflow: 2.2,
          plantDensity: 1.4
        }
      },
      {
        disease: 'Bacterial Leaf Spot',
        conditions: {
          temperatureRange: [24, 30],
          humidityRange: [75, 95],
          leafWetnessThreshold: 4
        },
        cropsSusceptible: ['tomato', 'pepper', 'lettuce', 'basil'],
        riskMultipliers: {
          temperature: 1.4,
          humidity: 1.6,
          leafWetness: 1.8
        }
      },
      {
        disease: 'Fusarium Wilt',
        conditions: {
          temperatureRange: [25, 35],
          phRange: [5.0, 6.5]
        },
        cropsSusceptible: ['tomato', 'cucumber', 'lettuce', 'basil', 'cannabis'],
        riskMultipliers: {
          temperature: 1.3,
          plantDensity: 1.2
        }
      },
      {
        disease: 'Pythium Root Rot',
        conditions: {
          temperatureRange: [20, 30],
          humidityRange: [90, 100]
        },
        cropsSusceptible: ['lettuce', 'spinach', 'cannabis', 'tomato', 'cucumber'],
        riskMultipliers: {
          humidity: 1.8,
          temperature: 1.2
        }
      },
      {
        disease: 'Aphid Infestation',
        conditions: {
          temperatureRange: [20, 25],
          humidityRange: [60, 80],
          plantDensityThreshold: 8
        },
        cropsSusceptible: ['lettuce', 'cannabis', 'tomato', 'pepper', 'cucumber'],
        riskMultipliers: {
          plantDensity: 2.0,
          temperature: 1.3
        }
      },
      {
        disease: 'Spider Mites',
        conditions: {
          temperatureRange: [25, 35],
          humidityRange: [30, 60],
          airflowMax: 0.4
        },
        cropsSusceptible: ['cannabis', 'tomato', 'cucumber', 'pepper'],
        riskMultipliers: {
          temperature: 1.6,
          humidity: 0.7, // Lower humidity increases risk
          airflow: 1.4
        }
      },
      {
        disease: 'Thrips Damage',
        conditions: {
          temperatureRange: [22, 28],
          humidityRange: [50, 70],
          plantDensityThreshold: 6
        },
        cropsSusceptible: ['cannabis', 'tomato', 'cucumber', 'lettuce'],
        riskMultipliers: {
          temperature: 1.4,
          plantDensity: 1.5
        }
      }
    ];
  }
  
  async predict(factors: DiseaseRiskFactors): Promise<DiseasePrediction[]> {
    const predictions: DiseasePrediction[] = [];
    const cropType = factors.cropType?.toLowerCase() || 'generic';
    
    for (const rule of this.diseaseRules) {
      // Check if this disease affects the current crop
      if (factors.cropType && !rule.cropsSusceptible.includes(cropType)) {
        continue;
      }
      
      const riskScore = this.calculateRiskScore(factors, rule);
      
      if (riskScore > 0.3) { // Only include significant risks
        const riskLevel = this.getRiskLevel(riskScore);
        const confidence = this.calculateConfidence(factors, rule);
        
        predictions.push({
          disease: rule.disease,
          riskLevel,
          confidence,
          preventativeMeasures: this.getPreventativeMeasures(rule.disease, factors),
          symptoms: this.getSymptoms(rule.disease),
          treatmentOptions: this.getTreatmentOptions(rule.disease),
          environmentalTriggers: this.getEnvironmentalTriggers(rule.disease, factors)
        });
      }
    }
    
    // Sort by risk level and confidence
    return predictions.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      const aScore = riskOrder[a.riskLevel] * a.confidence;
      const bScore = riskOrder[b.riskLevel] * b.confidence;
      return bScore - aScore;
    });
  }
  
  private calculateRiskScore(factors: DiseaseRiskFactors, rule: DiseaseRule): number {
    let riskScore = 0;
    let factorCount = 0;
    
    // Temperature risk
    if (rule.conditions.temperatureRange) {
      const [minTemp, maxTemp] = rule.conditions.temperatureRange;
      if (factors.temperature >= minTemp && factors.temperature <= maxTemp) {
        riskScore += 0.6 * (rule.riskMultipliers.temperature || 1);
      } else if (Math.abs(factors.temperature - minTemp) < 5 || Math.abs(factors.temperature - maxTemp) < 5) {
        riskScore += 0.3 * (rule.riskMultipliers.temperature || 1);
      }
      factorCount++;
    }
    
    // Humidity risk
    if (rule.conditions.humidityRange) {
      const [minHum, maxHum] = rule.conditions.humidityRange;
      if (factors.humidity >= minHum && factors.humidity <= maxHum) {
        riskScore += 0.7 * (rule.riskMultipliers.humidity || 1);
      } else if (Math.abs(factors.humidity - minHum) < 10 || Math.abs(factors.humidity - maxHum) < 10) {
        riskScore += 0.3 * (rule.riskMultipliers.humidity || 1);
      }
      factorCount++;
    }
    
    // Leaf wetness risk
    if (rule.conditions.leafWetnessThreshold && factors.leafWetness !== undefined) {
      if (factors.leafWetness >= rule.conditions.leafWetnessThreshold) {
        riskScore += 0.8 * (rule.riskMultipliers.leafWetness || 1);
      }
      factorCount++;
    }
    
    // Airflow risk
    if (rule.conditions.airflowMax && factors.airflow !== undefined) {
      if (factors.airflow <= rule.conditions.airflowMax) {
        riskScore += 0.5 * (rule.riskMultipliers.airflow || 1);
      }
      factorCount++;
    }
    
    // Plant density risk
    if (rule.conditions.plantDensityThreshold && factors.plantDensity !== undefined) {
      if (factors.plantDensity >= rule.conditions.plantDensityThreshold) {
        riskScore += 0.4 * (rule.riskMultipliers.plantDensity || 1);
      }
      factorCount++;
    }
    
    // pH risk
    if (rule.conditions.phRange && factors.waterPH !== undefined) {
      const [minPH, maxPH] = rule.conditions.phRange;
      if (factors.waterPH >= minPH && factors.waterPH <= maxPH) {
        riskScore += 0.3;
      }
      factorCount++;
    }
    
    // Normalize risk score
    return factorCount > 0 ? Math.min(1, riskScore / factorCount) : 0;
  }
  
  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
    if (riskScore >= 0.7) return 'high';
    if (riskScore >= 0.5) return 'medium';
    return 'low';
  }
  
  private calculateConfidence(factors: DiseaseRiskFactors, rule: DiseaseRule): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence with more complete data
    const availableFactors = [
      factors.temperature !== undefined,
      factors.humidity !== undefined,
      factors.leafWetness !== undefined,
      factors.airflow !== undefined,
      factors.plantDensity !== undefined,
      factors.waterPH !== undefined
    ].filter(Boolean).length;
    
    confidence += availableFactors * 0.08;
    
    // Higher confidence for well-researched crop/disease combinations
    if (factors.cropType && rule.cropsSusceptible.includes(factors.cropType.toLowerCase())) {
      confidence += 0.15;
    }
    
    return Math.min(0.95, confidence);
  }
  
  private getPreventativeMeasures(disease: string, factors: DiseaseRiskFactors): string[] {
    const measures: { [key: string]: string[] } = {
      'Powdery Mildew': [
        'Increase air circulation around plants',
        'Reduce humidity to below 60%',
        'Apply preventive fungicide spray',
        'Remove affected leaves immediately',
        'Increase spacing between plants'
      ],
      'Botrytis (Gray Mold)': [
        'Reduce humidity below 80%',
        'Improve air circulation',
        'Remove dead plant material',
        'Avoid overhead watering',
        'Apply Bacillus subtilis biocontrol'
      ],
      'Bacterial Leaf Spot': [
        'Avoid overhead watering',
        'Increase air circulation',
        'Remove infected leaves',
        'Apply copper-based bactericide',
        'Sanitize tools between plants'
      ],
      'Fusarium Wilt': [
        'Maintain proper root zone temperature (18-22°C)',
        'Improve drainage',
        'Use beneficial microorganisms',
        'Avoid root damage during handling',
        'Monitor and adjust nutrient solution pH'
      ],
      'Pythium Root Rot': [
        'Improve drainage and aeration',
        'Reduce water temperature below 22°C',
        'Use hydrogen peroxide in nutrient solution',
        'Apply beneficial bacteria to root zone',
        'Avoid overwatering'
      ],
      'Aphid Infestation': [
        'Introduce beneficial insects (ladybugs, lacewings)',
        'Use sticky yellow traps',
        'Apply insecticidal soap',
        'Increase air circulation',
        'Remove heavily infested leaves'
      ],
      'Spider Mites': [
        'Increase humidity above 60%',
        'Spray plants with water regularly',
        'Introduce predatory mites',
        'Apply neem oil or insecticidal soap',
        'Remove heavily infested leaves'
      ],
      'Thrips Damage': [
        'Use blue sticky traps',
        'Apply beneficial nematodes',
        'Increase humidity',
        'Remove weeds around growing area',
        'Apply predatory mites'
      ]
    };
    
    return measures[disease] || ['Monitor plants closely', 'Maintain optimal growing conditions'];
  }
  
  private getSymptoms(disease: string): string[] {
    const symptoms: { [key: string]: string[] } = {
      'Powdery Mildew': ['White powdery coating on leaves', 'Yellowing leaves', 'Stunted growth', 'Leaf curling'],
      'Botrytis (Gray Mold)': ['Gray fuzzy mold growth', 'Brown spots on leaves', 'Stem rot', 'Flower bud rot'],
      'Bacterial Leaf Spot': ['Water-soaked spots on leaves', 'Yellow halos around spots', 'Leaf yellowing', 'Defoliation'],
      'Fusarium Wilt': ['Wilting despite adequate water', 'Yellowing lower leaves', 'Brown vascular tissue', 'Stunted growth'],
      'Pythium Root Rot': ['Brown, mushy roots', 'Stunted growth', 'Yellowing leaves', 'Plant wilting'],
      'Aphid Infestation': ['Small green/black insects on leaves', 'Sticky honeydew on leaves', 'Curled leaves', 'Yellowing'],
      'Spider Mites': ['Fine webbing on leaves', 'Yellow stippling on leaves', 'Bronze or yellow leaves', 'Premature leaf drop'],
      'Thrips Damage': ['Silver or bronze leaf streaks', 'Black specks on leaves', 'Distorted growth', 'Scarred fruit']
    };
    
    return symptoms[disease] || ['Visible plant stress', 'Abnormal growth patterns'];
  }
  
  private getTreatmentOptions(disease: string): string[] {
    const treatments: { [key: string]: string[] } = {
      'Powdery Mildew': ['Potassium bicarbonate spray', 'Neem oil application', 'Remove affected parts', 'Improve ventilation'],
      'Botrytis (Gray Mold)': ['Remove infected tissue', 'Reduce humidity', 'Apply biological fungicide', 'Improve air circulation'],
      'Bacterial Leaf Spot': ['Copper-based spray', 'Remove infected leaves', 'Improve air circulation', 'Avoid overhead watering'],
      'Fusarium Wilt': ['Remove infected plants', 'Soil sterilization', 'Beneficial microorganisms', 'Improve drainage'],
      'Pythium Root Rot': ['Hydrogen peroxide treatment', 'Beneficial bacteria application', 'Improve aeration', 'Reduce watering'],
      'Aphid Infestation': ['Insecticidal soap', 'Neem oil', 'Beneficial insects', 'Systemic insecticide if severe'],
      'Spider Mites': ['Predatory mites', 'Miticide application', 'Increase humidity', 'Remove heavily infested plants'],
      'Thrips Damage': ['Blue sticky traps', 'Beneficial nematodes', 'Systemic insecticide', 'Remove affected tissue']
    };
    
    return treatments[disease] || ['Consult with plant pathologist', 'Monitor and adjust environment'];
  }
  
  private getEnvironmentalTriggers(disease: string, factors: DiseaseRiskFactors): string[] {
    const triggers = [];
    
    if (factors.humidity > 80) triggers.push('High humidity (>80%)');
    if (factors.humidity < 40) triggers.push('Low humidity (<40%)');
    if (factors.temperature > 30) triggers.push('High temperature (>30°C)');
    if (factors.temperature < 15) triggers.push('Low temperature (<15°C)');
    if (factors.airflow !== undefined && factors.airflow < 0.3) triggers.push('Poor air circulation');
    if (factors.plantDensity !== undefined && factors.plantDensity > 8) triggers.push('High plant density');
    if (factors.leafWetness !== undefined && factors.leafWetness > 6) triggers.push('Extended leaf wetness');
    
    return triggers;
  }
  
  getSupportedDiseases(): string[] {
    return this.diseaseRules.map(rule => rule.disease);
  }
  
  getDiseaseInfo(diseaseName: string): DiseaseRule | null {
    return this.diseaseRules.find(rule => rule.disease === diseaseName) || null;
  }
}