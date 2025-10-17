import { claudeAI } from './claude-service';
import { prisma } from '@/lib/prisma';

export interface EnvironmentalConditions {
  temperature: number;
  humidity: number;
  vpd: number;
  airflow: number;
  leafWetness?: number;
  co2?: number;
  lightIntensity?: number;
  ph?: number;
  ec?: number;
}

export interface DiseaseRisk {
  disease: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  confidence: number;
  timeframe: string;
  riskFactors: string[];
  preventiveMeasures: Array<{
    action: string;
    urgency: 'immediate' | 'soon' | 'routine';
    effectiveness: number;
    cost?: string;
  }>;
  earlyWarningSignals: string[];
  treatmentOptions?: Array<{
    treatment: string;
    effectiveness: number;
    applicationMethod: string;
    timing: string;
  }>;
}

export interface DiseasePredictionResult {
  predictions: DiseaseRisk[];
  environmentalAlerts: string[];
  recommendations: string[];
  riskScore: number; // Overall risk score 0-100
  criticalActions: string[];
  monitoringPlan: {
    frequency: string;
    parameters: string[];
    thresholds: Record<string, number>;
  };
}

export class DiseasePredictionService {
  private static instance: DiseasePredictionService;
  
  // Disease thresholds based on scientific research
  private readonly diseaseThresholds = {
    'powdery_mildew': {
      temperature: { min: 15, max: 28, optimal: 20 },
      humidity: { min: 40, max: 100, optimal: 85 },
      vpd: { min: 0.2, max: 0.8, optimal: 0.4 },
      leafWetness: { critical: 2 }, // hours
    },
    'botrytis': {
      temperature: { min: 15, max: 25, optimal: 20 },
      humidity: { min: 80, max: 100, optimal: 95 },
      vpd: { min: 0.1, max: 0.5, optimal: 0.3 },
      leafWetness: { critical: 4 },
    },
    'pythium': {
      temperature: { min: 20, max: 30, optimal: 25 },
      humidity: { min: 70, max: 100, optimal: 90 },
      ph: { min: 5.5, max: 7.0, optimal: 6.0 },
      ec: { min: 2.0, max: 4.0, optimal: 3.0 },
    },
    'spider_mites': {
      temperature: { min: 25, max: 35, optimal: 30 },
      humidity: { min: 20, max: 60, optimal: 40 },
      vpd: { min: 1.2, max: 2.0, optimal: 1.5 },
    },
  };

  private constructor() {}
  
  static getInstance(): DiseasePredictionService {
    if (!this.instance) {
      this.instance = new DiseasePredictionService();
    }
    return this.instance;
  }

  /**
   * Predict diseases using Claude AI with real environmental data
   */
  async predictDiseases(
    userId: string,
    facilityId: string,
    conditions: EnvironmentalConditions,
    cropType: string,
    growthStage: string
  ): Promise<DiseasePredictionResult> {
    try {
      // Get historical disease data for the facility
      const historicalData = await this.getHistoricalDiseaseData(facilityId);
      
      // Get recent sensor trends
      const sensorTrends = await this.getSensorTrends(facilityId);
      
      // Calculate initial risk assessment based on thresholds
      const basicRisks = this.calculateBasicRisks(conditions, cropType);
      
      // Use Claude for advanced analysis
      const aiResponse = await claudeAI.predictDiseases(
        userId,
        conditions,
        cropType,
        historicalData
      );

      if (!aiResponse.success || !aiResponse.data) {
        // Fallback to rule-based prediction
        return this.fallbackPrediction(conditions, cropType, basicRisks);
      }

      // Enhance AI predictions with local analysis
      const enhancedPredictions = this.enhancePredictions(
        aiResponse.data.predictions,
        basicRisks,
        sensorTrends
      );

      // Calculate overall risk score
      const riskScore = this.calculateOverallRisk(enhancedPredictions);

      // Generate monitoring plan
      const monitoringPlan = this.generateMonitoringPlan(
        enhancedPredictions,
        conditions,
        cropType
      );

      // Log prediction for learning
      await this.logPrediction({
        facilityId,
        userId,
        conditions,
        predictions: enhancedPredictions,
        riskScore,
        timestamp: new Date(),
      });

      // Set up alerts if needed
      await this.setupAlerts(facilityId, enhancedPredictions, riskScore);

      return {
        predictions: enhancedPredictions,
        environmentalAlerts: aiResponse.data.environmentalAlerts || [],
        recommendations: aiResponse.data.recommendations || [],
        riskScore,
        criticalActions: this.extractCriticalActions(enhancedPredictions),
        monitoringPlan,
      };

    } catch (error) {
      logger.error('api', 'Disease prediction error:', error );
      throw error;
    }
  }

  /**
   * Real-time disease monitoring
   */
  async monitorDiseaseRisk(
    facilityId: string,
    conditions: EnvironmentalConditions
  ): Promise<{ alert: boolean; risks: string[]; actions: string[] }> {
    const risks: string[] = [];
    const actions: string[] = [];
    let alert = false;

    // Check each disease threshold
    for (const [disease, thresholds] of Object.entries(this.diseaseThresholds)) {
      let riskLevel = 0;

      // Temperature check
      if (thresholds.temperature && conditions.temperature) {
        if (conditions.temperature >= thresholds.temperature.min && 
            conditions.temperature <= thresholds.temperature.max) {
          riskLevel += 1;
          if (Math.abs(conditions.temperature - thresholds.temperature.optimal) < 2) {
            riskLevel += 2;
          }
        }
      }

      // Humidity check
      if (thresholds.humidity && conditions.humidity) {
        if (conditions.humidity >= thresholds.humidity.min && 
            conditions.humidity <= thresholds.humidity.max) {
          riskLevel += 1;
          if (Math.abs(conditions.humidity - thresholds.humidity.optimal) < 5) {
            riskLevel += 2;
          }
        }
      }

      // VPD check
      if (thresholds.vpd && conditions.vpd) {
        if (conditions.vpd >= thresholds.vpd.min && 
            conditions.vpd <= thresholds.vpd.max) {
          riskLevel += 1;
          if (Math.abs(conditions.vpd - thresholds.vpd.optimal) < 0.1) {
            riskLevel += 2;
          }
        }
      }

      // Generate alerts based on risk level
      if (riskLevel >= 4) {
        alert = true;
        risks.push(`High risk of ${disease.replace('_', ' ')}`);
        actions.push(...this.getImmediateActions(disease, conditions));
      } else if (riskLevel >= 2) {
        risks.push(`Moderate risk of ${disease.replace('_', ' ')}`);
      }
    }

    return { alert, risks, actions };
  }

  /**
   * Calculate basic disease risks using scientific thresholds
   */
  private calculateBasicRisks(
    conditions: EnvironmentalConditions,
    cropType: string
  ): Map<string, number> {
    const risks = new Map<string, number>();

    // Crop-specific disease susceptibility
    const cropSusceptibility = this.getCropSusceptibility(cropType);

    for (const [disease, thresholds] of Object.entries(this.diseaseThresholds)) {
      let riskScore = 0;
      let factorCount = 0;

      // Environmental factor analysis
      if (thresholds.temperature && conditions.temperature) {
        const tempRisk = this.calculateFactorRisk(
          conditions.temperature,
          thresholds.temperature
        );
        riskScore += tempRisk;
        factorCount++;
      }

      if (thresholds.humidity && conditions.humidity) {
        const humidityRisk = this.calculateFactorRisk(
          conditions.humidity,
          thresholds.humidity
        );
        riskScore += humidityRisk * 1.2; // Humidity is more critical
        factorCount++;
      }

      if (thresholds.vpd && conditions.vpd) {
        const vpdRisk = this.calculateFactorRisk(
          conditions.vpd,
          thresholds.vpd
        );
        riskScore += vpdRisk;
        factorCount++;
      }

      // Apply crop susceptibility multiplier
      const susceptibilityMultiplier = cropSusceptibility.get(disease) || 1.0;
      const finalRisk = (riskScore / factorCount) * susceptibilityMultiplier;

      risks.set(disease, Math.min(1.0, finalRisk));
    }

    return risks;
  }

  /**
   * Calculate risk for individual environmental factor
   */
  private calculateFactorRisk(
    value: number,
    thresholds: { min: number; max: number; optimal: number }
  ): number {
    if (value < thresholds.min || value > thresholds.max) {
      return 0; // Outside risk range
    }

    // Calculate distance from optimal
    const range = thresholds.max - thresholds.min;
    const optimalDistance = Math.abs(value - thresholds.optimal);
    const maxDistance = range / 2;

    // Convert to risk score (0-1)
    return 1 - (optimalDistance / maxDistance);
  }

  /**
   * Get crop-specific disease susceptibility
   */
  private getCropSusceptibility(cropType: string): Map<string, number> {
    const susceptibility = new Map<string, number>();

    const cropProfiles: Record<string, Record<string, number>> = {
      'cannabis': {
        'powdery_mildew': 1.5,
        'botrytis': 1.8,
        'pythium': 1.2,
        'spider_mites': 1.3,
      },
      'tomato': {
        'powdery_mildew': 1.2,
        'botrytis': 1.3,
        'pythium': 1.5,
        'spider_mites': 0.8,
      },
      'lettuce': {
        'powdery_mildew': 0.8,
        'botrytis': 1.2,
        'pythium': 1.6,
        'spider_mites': 0.5,
      },
      'basil': {
        'powdery_mildew': 1.4,
        'botrytis': 1.0,
        'pythium': 1.1,
        'spider_mites': 0.7,
      },
    };

    const profile = cropProfiles[cropType.toLowerCase()] || {};
    for (const [disease, multiplier] of Object.entries(profile)) {
      susceptibility.set(disease, multiplier);
    }

    return susceptibility;
  }

  /**
   * Enhance AI predictions with local knowledge
   */
  private enhancePredictions(
    aiPredictions: any[],
    basicRisks: Map<string, number>,
    sensorTrends: any
  ): DiseaseRisk[] {
    return aiPredictions.map(prediction => {
      const basicRisk = basicRisks.get(prediction.disease.toLowerCase().replace(' ', '_')) || 0;
      
      // Adjust probability based on local analysis
      const adjustedProbability = (prediction.probability + basicRisk) / 2;
      
      // Add trend-based adjustments
      let trendAdjustment = 0;
      if (sensorTrends.humidity?.trend === 'increasing' && prediction.disease.includes('mildew')) {
        trendAdjustment = 0.1;
      }
      
      return {
        ...prediction,
        probability: Math.min(1.0, adjustedProbability + trendAdjustment),
        confidence: prediction.confidence || 0.85,
      };
    });
  }

  /**
   * Generate immediate actions for high-risk diseases
   */
  private getImmediateActions(disease: string, conditions: EnvironmentalConditions): string[] {
    const actions: string[] = [];

    switch (disease) {
      case 'powdery_mildew':
        if (conditions.humidity > 70) {
          actions.push('Reduce humidity below 60% immediately');
          actions.push('Increase air circulation');
        }
        actions.push('Inspect plants for white powdery spots');
        actions.push('Prepare sulfur-based treatment if needed');
        break;

      case 'botrytis':
        if (conditions.humidity > 85) {
          actions.push('Emergency dehumidification required');
        }
        actions.push('Remove any dead plant material');
        actions.push('Space plants for better airflow');
        actions.push('Avoid overhead watering');
        break;

      case 'pythium':
        actions.push('Check root zone moisture levels');
        actions.push('Ensure proper drainage');
        actions.push('Test water EC and pH');
        actions.push('Consider beneficial microbe application');
        break;

      case 'spider_mites':
        if (conditions.humidity < 50) {
          actions.push('Increase humidity to 60-70%');
        }
        actions.push('Inspect undersides of leaves');
        actions.push('Prepare miticide if infestation confirmed');
        break;
    }

    return actions;
  }

  /**
   * Calculate overall facility risk score
   */
  private calculateOverallRisk(predictions: DiseaseRisk[]): number {
    if (predictions.length === 0) return 0;

    let weightedRisk = 0;
    let totalWeight = 0;

    for (const prediction of predictions) {
      const weight = prediction.riskLevel === 'critical' ? 4 :
                    prediction.riskLevel === 'high' ? 3 :
                    prediction.riskLevel === 'medium' ? 2 : 1;
      
      weightedRisk += prediction.probability * weight;
      totalWeight += weight;
    }

    return Math.round((weightedRisk / totalWeight) * 100);
  }

  /**
   * Generate monitoring plan based on risks
   */
  private generateMonitoringPlan(
    predictions: DiseaseRisk[],
    conditions: EnvironmentalConditions,
    cropType: string
  ): DiseasePredictionResult['monitoringPlan'] {
    const highRiskCount = predictions.filter(p => 
      p.riskLevel === 'high' || p.riskLevel === 'critical'
    ).length;

    const frequency = highRiskCount > 2 ? 'Every 2 hours' :
                     highRiskCount > 0 ? 'Every 4 hours' : 'Daily';

    const parameters = ['temperature', 'humidity', 'vpd'];
    const thresholds: Record<string, number> = {
      temperature_variance: 2,
      humidity_max: 70,
      vpd_min: 0.8,
      vpd_max: 1.2,
    };

    // Add specific parameters based on high-risk diseases
    for (const prediction of predictions) {
      if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
        if (prediction.disease.includes('pythium')) {
          parameters.push('ph', 'ec', 'water_temperature');
          thresholds.ph_min = 5.5;
          thresholds.ph_max = 6.5;
        }
        if (prediction.disease.includes('mildew')) {
          parameters.push('leaf_wetness', 'air_circulation');
          thresholds.leaf_wetness_max = 2;
        }
      }
    }

    return { frequency, parameters, thresholds };
  }

  /**
   * Extract critical actions from predictions
   */
  private extractCriticalActions(predictions: DiseaseRisk[]): string[] {
    const actions: string[] = [];

    for (const prediction of predictions) {
      if (prediction.riskLevel === 'critical' || prediction.riskLevel === 'high') {
        const immediateActions = prediction.preventiveMeasures
          .filter(m => m.urgency === 'immediate')
          .map(m => m.action);
        actions.push(...immediateActions);
      }
    }

    return [...new Set(actions)]; // Remove duplicates
  }

  /**
   * Fallback prediction when AI is unavailable
   */
  private fallbackPrediction(
    conditions: EnvironmentalConditions,
    cropType: string,
    basicRisks: Map<string, number>
  ): DiseasePredictionResult {
    const predictions: DiseaseRisk[] = [];

    for (const [disease, risk] of basicRisks.entries()) {
      if (risk > 0.3) {
        predictions.push({
          disease: disease.replace('_', ' '),
          riskLevel: risk > 0.7 ? 'high' : risk > 0.5 ? 'medium' : 'low',
          probability: risk,
          confidence: 0.7,
          timeframe: risk > 0.7 ? '24-48 hours' : '3-7 days',
          riskFactors: this.getBasicRiskFactors(disease, conditions),
          preventiveMeasures: this.getBasicPreventiveMeasures(disease),
          earlyWarningSignals: this.getEarlyWarningSignals(disease),
        });
      }
    }

    return {
      predictions,
      environmentalAlerts: this.generateEnvironmentalAlerts(conditions),
      recommendations: this.generateBasicRecommendations(predictions, cropType),
      riskScore: this.calculateOverallRisk(predictions),
      criticalActions: this.extractCriticalActions(predictions),
      monitoringPlan: this.generateMonitoringPlan(predictions, conditions, cropType),
    };
  }

  /**
   * Get historical disease data for learning
   */
  private async getHistoricalDiseaseData(facilityId: string): Promise<any[]> {
    try {
      const incidents = await prisma.diseaseIncident.findMany({
        where: { facilityId },
        orderBy: { occurredAt: 'desc' },
        take: 20,
        include: {
          environmentalConditions: true,
          treatments: true,
        },
      });
      return incidents;
    } catch (error) {
      logger.error('api', 'Failed to fetch historical data:', error );
      return [];
    }
  }

  /**
   * Get recent sensor trends
   */
  private async getSensorTrends(facilityId: string): Promise<any> {
    try {
      const readings = await prisma.sensorReading.findMany({
        where: {
          facilityId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Calculate trends
      const trends: any = {};
      const sensorTypes = ['temperature', 'humidity', 'co2'];
      
      for (const type of sensorTypes) {
        const values = readings
          .filter(r => r.sensorType === type)
          .map(r => ({ time: r.timestamp.getTime(), value: r.value }));
        
        if (values.length > 10) {
          trends[type] = {
            trend: this.calculateTrend(values),
            variance: this.calculateVariance(values.map(v => v.value)),
          };
        }
      }

      return trends;
    } catch (error) {
      logger.error('api', 'Failed to get sensor trends:', error );
      return {};
    }
  }

  /**
   * Calculate trend from time series data
   */
  private calculateTrend(data: { time: number; value: number }[]): string {
    if (data.length < 2) return 'stable';

    // Simple linear regression
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.time, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d) => sum + d.time * d.value, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.time * d.time, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (Math.abs(slope) < 0.0001) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Calculate variance for stability analysis
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length);
  }

  /**
   * Log prediction for continuous learning
   */
  private async logPrediction(data: any): Promise<void> {
    try {
      await prisma.diseasePredictionLog.create({
        data: {
          ...data,
          predictions: JSON.stringify(data.predictions),
          conditions: JSON.stringify(data.conditions),
        },
      });
    } catch (error) {
      logger.error('api', 'Failed to log prediction:', error );
    }
  }

  /**
   * Set up alerts for high-risk predictions
   */
  private async setupAlerts(
    facilityId: string,
    predictions: DiseaseRisk[],
    riskScore: number
  ): Promise<void> {
    const criticalPredictions = predictions.filter(p => 
      p.riskLevel === 'critical' || (p.riskLevel === 'high' && p.probability > 0.7)
    );

    if (criticalPredictions.length > 0 || riskScore > 70) {
      try {
        await prisma.diseaseAlert.create({
          data: {
            facilityId,
            severity: riskScore > 80 ? 'critical' : 'high',
            diseases: criticalPredictions.map(p => p.disease),
            riskScore,
            message: `High disease risk detected: ${criticalPredictions.map(p => p.disease).join(', ')}`,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          },
        });
      } catch (error) {
        logger.error('api', 'Failed to create alert:', error );
      }
    }
  }

  /**
   * Helper methods for fallback predictions
   */
  private getBasicRiskFactors(disease: string, conditions: EnvironmentalConditions): string[] {
    const factors: string[] = [];
    const thresholds = this.diseaseThresholds[disease];

    if (!thresholds) return ['Environmental conditions favorable for disease'];

    if (thresholds.humidity && conditions.humidity > thresholds.humidity.optimal) {
      factors.push(`High humidity (${conditions.humidity}%)`);
    }
    if (thresholds.temperature && Math.abs(conditions.temperature - thresholds.temperature.optimal) < 3) {
      factors.push(`Optimal temperature for pathogen (${conditions.temperature}°C)`);
    }
    if (thresholds.vpd && conditions.vpd < 0.8) {
      factors.push(`Low VPD (${conditions.vpd.toFixed(2)} kPa)`);
    }

    return factors;
  }

  private getBasicPreventiveMeasures(disease: string): DiseaseRisk['preventiveMeasures'] {
    const measures: DiseaseRisk['preventiveMeasures'] = [];

    switch (disease) {
      case 'powdery_mildew':
        measures.push(
          { action: 'Reduce humidity below 60%', urgency: 'immediate', effectiveness: 0.8 },
          { action: 'Increase air circulation', urgency: 'immediate', effectiveness: 0.7 },
          { action: 'Apply preventive sulfur spray', urgency: 'soon', effectiveness: 0.9 }
        );
        break;
      case 'botrytis':
        measures.push(
          { action: 'Emergency dehumidification', urgency: 'immediate', effectiveness: 0.9 },
          { action: 'Remove dead plant material', urgency: 'immediate', effectiveness: 0.8 },
          { action: 'Increase plant spacing', urgency: 'soon', effectiveness: 0.7 }
        );
        break;
      default:
        measures.push(
          { action: 'Monitor environmental conditions', urgency: 'routine', effectiveness: 0.6 },
          { action: 'Maintain optimal VPD', urgency: 'soon', effectiveness: 0.7 }
        );
    }

    return measures;
  }

  private getEarlyWarningSignals(disease: string): string[] {
    const signals: Record<string, string[]> = {
      'powdery_mildew': [
        'White powdery spots on leaves',
        'Slight leaf curling',
        'Reduced plant vigor',
      ],
      'botrytis': [
        'Gray fuzzy mold on flowers/buds',
        'Brown spots on leaves',
        'Wilting despite adequate water',
      ],
      'pythium': [
        'Brown roots',
        'Stunted growth',
        'Yellowing lower leaves',
      ],
      'spider_mites': [
        'Tiny white/yellow spots on leaves',
        'Fine webbing on plants',
        'Bronze or yellow leaf discoloration',
      ],
    };

    return signals[disease] || ['Monitor for unusual plant symptoms'];
  }

  private generateEnvironmentalAlerts(conditions: EnvironmentalConditions): string[] {
    const alerts: string[] = [];

    if (conditions.humidity > 80) {
      alerts.push('Critical: Humidity exceeds 80% - high disease risk');
    }
    if (conditions.vpd < 0.4) {
      alerts.push('Warning: VPD too low - poor transpiration');
    }
    if (conditions.vpd > 1.6) {
      alerts.push('Warning: VPD too high - plant stress likely');
    }
    if (conditions.airflow < 0.2) {
      alerts.push('Critical: Insufficient air circulation');
    }

    return alerts;
  }

  /**
   * Update prediction models based on actual disease outcomes (feedback loop)
   */
  async updateModelWithFeedback(
    facilityId: string,
    diseaseType: string,
    actualOccurred: boolean,
    conditions: EnvironmentalConditions,
    predictionId?: string
  ): Promise<void> {
    try {
      // Record the feedback
      await prisma.diseaseFeedback.create({
        data: {
          facilityId,
          diseaseType,
          actualOccurred,
          conditions: JSON.stringify(conditions),
          predictionId,
          timestamp: new Date(),
        },
      });

      // Update disease thresholds based on feedback
      await this.adjustDiseaseThresholds(diseaseType, actualOccurred, conditions);
      
      // Calculate model accuracy
      const accuracy = await this.calculateModelAccuracy(facilityId, diseaseType);
      
      // Log learning event
      logger.info('api', `Model updated for ${diseaseType}: Accuracy ${accuracy.toFixed(2)}%`);
      
    } catch (error) {
      logger.error('api', 'Failed to update model with feedback:', error );
    }
  }

  /**
   * Adjust disease thresholds based on real outcomes
   */
  private async adjustDiseaseThresholds(
    diseaseType: string,
    occurred: boolean,
    conditions: EnvironmentalConditions
  ): Promise<void> {
    const diseaseKey = diseaseType.toLowerCase().replace(' ', '_');
    const thresholds = this.diseaseThresholds[diseaseKey];
    
    if (!thresholds) return;
    
    // Learning rate for threshold adjustment
    const learningRate = 0.05;
    
    if (occurred) {
      // Disease occurred - adjust thresholds toward current conditions
      if (thresholds.temperature && conditions.temperature) {
        thresholds.temperature.optimal = 
          thresholds.temperature.optimal * (1 - learningRate) + 
          conditions.temperature * learningRate;
      }
      
      if (thresholds.humidity && conditions.humidity) {
        thresholds.humidity.optimal = 
          thresholds.humidity.optimal * (1 - learningRate) + 
          conditions.humidity * learningRate;
      }
      
      if (thresholds.vpd && conditions.vpd) {
        thresholds.vpd.optimal = 
          thresholds.vpd.optimal * (1 - learningRate) + 
          conditions.vpd * learningRate;
      }
    } else {
      // Disease didn't occur despite prediction - widen acceptable ranges
      if (thresholds.temperature) {
        const tempDiff = Math.abs(conditions.temperature - thresholds.temperature.optimal);
        if (tempDiff < 5) {
          // Conditions were near optimal but disease didn't occur
          thresholds.temperature.min *= 0.98; // Slightly expand range
          thresholds.temperature.max *= 1.02;
        }
      }
    }
  }

  /**
   * Calculate model accuracy based on feedback
   */
  private async calculateModelAccuracy(
    facilityId: string,
    diseaseType: string
  ): Promise<number> {
    try {
      const recentFeedback = await prisma.diseaseFeedback.findMany({
        where: {
          facilityId,
          diseaseType,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        take: 100,
      });
      
      if (recentFeedback.length === 0) return 0;
      
      // Get corresponding predictions
      const predictions = await prisma.diseasePredictionLog.findMany({
        where: {
          facilityId,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });
      
      let correctPredictions = 0;
      let totalPredictions = 0;
      
      for (const feedback of recentFeedback) {
        // Find prediction close to this feedback
        const prediction = predictions.find(p => {
          const timeDiff = Math.abs(p.timestamp.getTime() - feedback.timestamp.getTime());
          return timeDiff < 48 * 60 * 60 * 1000; // Within 48 hours
        });
        
        if (prediction) {
          const parsedPredictions = JSON.parse(prediction.predictions);
          const relevantPrediction = parsedPredictions.find(
            (p: any) => p.disease.toLowerCase().includes(diseaseType.toLowerCase())
          );
          
          if (relevantPrediction) {
            totalPredictions++;
            const predictedHigh = relevantPrediction.riskLevel === 'high' || 
                                 relevantPrediction.riskLevel === 'critical';
            
            if ((predictedHigh && feedback.actualOccurred) || 
                (!predictedHigh && !feedback.actualOccurred)) {
              correctPredictions++;
            }
          }
        }
      }
      
      return totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;
    } catch (error) {
      logger.error('api', 'Failed to calculate accuracy:', error );
      return 0;
    }
  }

  /**
   * Get learning insights for a facility
   */
  async getLearningInsights(facilityId: string): Promise<{
    accuracyByDisease: Record<string, number>;
    commonPatterns: string[];
    recommendations: string[];
  }> {
    const accuracyByDisease: Record<string, number> = {};
    const diseases = ['powdery_mildew', 'botrytis', 'pythium', 'spider_mites'];
    
    for (const disease of diseases) {
      accuracyByDisease[disease] = await this.calculateModelAccuracy(facilityId, disease);
    }
    
    // Analyze patterns from feedback
    const feedback = await prisma.diseaseFeedback.findMany({
      where: { facilityId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    
    const patterns = this.analyzePatterns(feedback);
    const recommendations = this.generateLearningRecommendations(accuracyByDisease, patterns);
    
    return {
      accuracyByDisease,
      commonPatterns: patterns,
      recommendations,
    };
  }

  private analyzePatterns(feedback: any[]): string[] {
    const patterns: string[] = [];
    
    // Analyze common conditions when diseases occur
    const occurredConditions = feedback
      .filter(f => f.actualOccurred)
      .map(f => JSON.parse(f.conditions));
    
    if (occurredConditions.length > 5) {
      const avgTemp = occurredConditions.reduce((sum, c) => sum + c.temperature, 0) / occurredConditions.length;
      const avgHumidity = occurredConditions.reduce((sum, c) => sum + c.humidity, 0) / occurredConditions.length;
      
      patterns.push(`Diseases commonly occur at ${avgTemp.toFixed(1)}°C and ${avgHumidity.toFixed(0)}% humidity`);
    }
    
    return patterns;
  }

  private generateLearningRecommendations(
    accuracy: Record<string, number>,
    patterns: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Find diseases with low accuracy
    for (const [disease, acc] of Object.entries(accuracy)) {
      if (acc < 70) {
        recommendations.push(
          `Consider additional monitoring for ${disease} - current prediction accuracy is ${acc.toFixed(0)}%`
        );
      }
    }
    
    if (patterns.length > 0) {
      recommendations.push('Adjust environmental controls based on identified disease patterns');
    }
    
    return recommendations;
  }

  private generateBasicRecommendations(predictions: DiseaseRisk[], cropType: string): string[] {
    const recommendations: string[] = [
      'Maintain consistent environmental conditions',
      'Implement regular scouting protocol',
      'Keep detailed records of any symptoms',
    ];

    if (predictions.some(p => p.riskLevel === 'high')) {
      recommendations.push(
        'Consider preventive fungicide application',
        'Increase monitoring frequency to twice daily',
        'Review and optimize irrigation practices'
      );
    }

    return recommendations;
  }
}

// Export singleton instance
export const diseasePrediction = DiseasePredictionService.getInstance();