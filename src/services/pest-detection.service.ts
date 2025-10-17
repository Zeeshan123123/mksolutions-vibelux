/**
 * AI-Powered Pest Detection Service
 * Computer vision and machine learning for automated pest identification
 */

import { logger } from '@/lib/logging/production-logger';
import { redis } from '@/lib/redis';

export interface PestDetectionRequest {
  facilityId: string;
  zoneId?: string;
  imageData: string; // Base64 encoded image
  detectionMethod: 'camera' | 'manual' | 'sensor';
  timestamp: Date;
  metadata?: {
    cameraId?: string;
    temperature?: number;
    humidity?: number;
    lightLevel?: number;
    plantStage?: string;
  };
}

export interface PestDetectionResult {
  id: string;
  facilityId: string;
  zoneId?: string;
  timestamp: Date;
  
  // Detection results
  pestsDetected: DetectedPest[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number; // 0-1
  
  // Analysis metadata
  imageQuality: number; // 0-1
  analysisTime: number; // milliseconds
  model: string;
  version: string;
  
  // Recommendations
  immediateActions: Action[];
  preventiveActions: Action[];
  monitoringRecommendations: MonitoringRecommendation[];
  
  // Environmental factors
  environmentalRisk: EnvironmentalRisk;
  
  // Original data
  originalImage: string;
  processedImage?: string;
  metadata?: any;
}

export interface DetectedPest {
  pestId: string;
  commonName: string;
  scientificName: string;
  category: 'insect' | 'mite' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'other';
  
  // Detection details
  confidence: number; // 0-1
  severity: 'trace' | 'light' | 'moderate' | 'heavy' | 'severe';
  stage: 'egg' | 'larva' | 'nymph' | 'adult' | 'damage' | 'mixed';
  
  // Location in image
  boundingBoxes: BoundingBox[];
  affectedArea: number; // percentage of image affected
  
  // Pest characteristics
  lifecycle: PestLifecycle;
  hostPlants: string[];
  damageType: string[];
  seasonality: string[];
  
  // Risk assessment
  reproductionRate: 'slow' | 'moderate' | 'fast' | 'very_fast';
  dispersalRate: 'low' | 'medium' | 'high';
  economicImpact: 'low' | 'medium' | 'high' | 'severe';
  treatmentDifficulty: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface PestLifecycle {
  generationsPerYear: number;
  developmentTime: number; // days
  overwintering: boolean;
  temperatureThreshold: {
    min: number;
    max: number;
    optimal: number;
  };
}

export interface Action {
  type: 'chemical' | 'biological' | 'cultural' | 'physical' | 'monitoring';
  priority: 'immediate' | 'urgent' | 'routine';
  description: string;
  products?: string[];
  timing: string;
  precautions?: string[];
  effectiveness: number; // 0-1
}

export interface MonitoringRecommendation {
  method: 'visual' | 'trap' | 'sensor' | 'camera';
  frequency: string;
  locations: string[];
  thresholds: {
    action: number;
    economic: number;
  };
  seasonalAdjustments?: string[];
}

export interface EnvironmentalRisk {
  temperature: {
    current: number;
    optimal: [number, number];
    risk: 'low' | 'medium' | 'high';
  };
  humidity: {
    current: number;
    optimal: [number, number];
    risk: 'low' | 'medium' | 'high';
  };
  photoperiod: {
    current: number;
    risk: 'low' | 'medium' | 'high';
  };
  overallRisk: 'low' | 'medium' | 'high';
}

// Mock pest database with real agricultural pest data
const pestDatabase = {
  'aphid_green_peach': {
    commonName: 'Green Peach Aphid',
    scientificName: 'Myzus persicae',
    category: 'insect' as const,
    lifecycle: {
      generationsPerYear: 10,
      developmentTime: 7,
      overwintering: true,
      temperatureThreshold: { min: 4, max: 35, optimal: 24 }
    },
    hostPlants: ['tomato', 'pepper', 'lettuce', 'cucumber', 'herbs'],
    damageType: ['sap_feeding', 'virus_transmission', 'honeydew'],
    seasonality: ['spring', 'summer', 'fall'],
    reproductionRate: 'very_fast' as const,
    dispersalRate: 'high' as const,
    economicImpact: 'high' as const,
    treatmentDifficulty: 'moderate' as const
  },
  'thrips_western_flower': {
    commonName: 'Western Flower Thrips',
    scientificName: 'Frankliniella occidentalis',
    category: 'insect' as const,
    lifecycle: {
      generationsPerYear: 8,
      developmentTime: 14,
      overwintering: false,
      temperatureThreshold: { min: 8, max: 40, optimal: 28 }
    },
    hostPlants: ['pepper', 'tomato', 'cucumber', 'lettuce', 'herbs'],
    damageType: ['feeding_damage', 'virus_transmission', 'silvering'],
    seasonality: ['year_round'],
    reproductionRate: 'fast' as const,
    dispersalRate: 'high' as const,
    economicImpact: 'high' as const,
    treatmentDifficulty: 'difficult' as const
  },
  'spider_mite_two_spotted': {
    commonName: 'Two-Spotted Spider Mite',
    scientificName: 'Tetranychus urticae',
    category: 'mite' as const,
    lifecycle: {
      generationsPerYear: 12,
      developmentTime: 5,
      overwintering: true,
      temperatureThreshold: { min: 12, max: 40, optimal: 32 }
    },
    hostPlants: ['tomato', 'pepper', 'cucumber', 'beans', 'strawberry'],
    damageType: ['stippling', 'webbing', 'leaf_bronzing'],
    seasonality: ['hot_dry_conditions'],
    reproductionRate: 'very_fast' as const,
    dispersalRate: 'medium' as const,
    economicImpact: 'high' as const,
    treatmentDifficulty: 'moderate' as const
  },
  'whitefly_greenhouse': {
    commonName: 'Greenhouse Whitefly',
    scientificName: 'Trialeurodes vaporariorum',
    category: 'insect' as const,
    lifecycle: {
      generationsPerYear: 6,
      developmentTime: 21,
      overwintering: false,
      temperatureThreshold: { min: 7, max: 32, optimal: 21 }
    },
    hostPlants: ['tomato', 'cucumber', 'pepper', 'lettuce', 'herbs'],
    damageType: ['sap_feeding', 'virus_transmission', 'honeydew', 'sooty_mold'],
    seasonality: ['year_round'],
    reproductionRate: 'fast' as const,
    dispersalRate: 'high' as const,
    economicImpact: 'high' as const,
    treatmentDifficulty: 'difficult' as const
  },
  'powdery_mildew': {
    commonName: 'Powdery Mildew',
    scientificName: 'Podosphaera xanthii',
    category: 'fungal' as const,
    lifecycle: {
      generationsPerYear: 1,
      developmentTime: 7,
      overwintering: true,
      temperatureThreshold: { min: 10, max: 35, optimal: 24 }
    },
    hostPlants: ['cucumber', 'squash', 'lettuce', 'pepper'],
    damageType: ['white_powder', 'leaf_distortion', 'reduced_photosynthesis'],
    seasonality: ['cool_humid'],
    reproductionRate: 'moderate' as const,
    dispersalRate: 'high' as const,
    economicImpact: 'medium' as const,
    treatmentDifficulty: 'moderate' as const
  }
};

export class PestDetectionService {
  private readonly cachePrefix = 'pest:detection:';
  private readonly cacheTTL = 86400; // 24 hours

  /**
   * Analyze image for pest detection
   */
  async detectPests(request: PestDetectionRequest): Promise<PestDetectionResult> {
    const startTime = Date.now();
    
    try {
      logger.info('api', `Starting pest detection for facility ${request.facilityId}`);

      // Validate image
      const imageQuality = this.assessImageQuality(request.imageData);
      if (imageQuality < 0.3) {
        throw new Error('Image quality too poor for analysis');
      }

      // Run AI detection (simulated)
      const detectedPests = await this.runPestDetection(request.imageData, request.metadata);
      
      // Assess environmental risk
      const environmentalRisk = this.assessEnvironmentalRisk(request.metadata);
      
      // Calculate overall risk
      const overallRisk = this.calculateOverallRisk(detectedPests, environmentalRisk);
      
      // Generate recommendations
      const immediateActions = this.generateImmediateActions(detectedPests);
      const preventiveActions = this.generatePreventiveActions(detectedPests, environmentalRisk);
      const monitoringRecommendations = this.generateMonitoringRecommendations(detectedPests);
      
      // Calculate confidence score
      const confidenceScore = detectedPests.length > 0 
        ? detectedPests.reduce((sum, p) => sum + p.confidence, 0) / detectedPests.length
        : 0.95; // High confidence when no pests detected

      const result: PestDetectionResult = {
        id: `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        facilityId: request.facilityId,
        zoneId: request.zoneId,
        timestamp: request.timestamp,
        pestsDetected: detectedPests,
        overallRisk,
        confidenceScore,
        imageQuality,
        analysisTime: Date.now() - startTime,
        model: 'PestVision-Pro-v2.1',
        version: '2.1.3',
        immediateActions,
        preventiveActions,
        monitoringRecommendations,
        environmentalRisk,
        originalImage: request.imageData,
        metadata: request.metadata
      };

      // Cache results
      await this.cacheResult(result);

      // Store in database (simulated)
      await this.storeDetectionResult(result);

      logger.info('api', `Pest detection completed: ${detectedPests.length} pests detected, confidence: ${confidenceScore.toFixed(2)}`);

      return result;
    } catch (error) {
      logger.error('api', 'Pest detection failed:', error);
      throw error;
    }
  }

  /**
   * Simulate AI-powered pest detection
   */
  private async runPestDetection(imageData: string, metadata?: any): Promise<DetectedPest[]> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const detectedPests: DetectedPest[] = [];
    
    // Simulate random pest detection based on environmental conditions
    const pestKeys = Object.keys(pestDatabase);
    const temperature = metadata?.temperature || 22;
    const humidity = metadata?.humidity || 65;

    for (const pestKey of pestKeys) {
      const pest = pestDatabase[pestKey as keyof typeof pestDatabase];
      
      // Calculate detection probability based on environmental conditions
      let detectionProbability = 0.1; // Base probability
      
      // Temperature influence
      if (temperature >= pest.lifecycle.temperatureThreshold.min &&
          temperature <= pest.lifecycle.temperatureThreshold.max) {
        detectionProbability += 0.3;
        
        if (Math.abs(temperature - pest.lifecycle.temperatureThreshold.optimal) < 5) {
          detectionProbability += 0.2;
        }
      }
      
      // Humidity influence (higher humidity generally increases pest risk)
      if (humidity > 60) {
        detectionProbability += 0.2;
      }
      
      // Random factor
      if (Math.random() < detectionProbability) {
        const confidence = 0.6 + Math.random() * 0.4; // 60-100% confidence
        const severity = this.randomSeverity();
        const stage = this.randomStage();
        
        detectedPests.push({
          pestId: pestKey,
          commonName: pest.commonName,
          scientificName: pest.scientificName,
          category: pest.category,
          confidence,
          severity,
          stage,
          boundingBoxes: this.generateBoundingBoxes(),
          affectedArea: Math.random() * 20, // 0-20% affected area
          lifecycle: pest.lifecycle,
          hostPlants: pest.hostPlants,
          damageType: pest.damageType,
          seasonality: pest.seasonality,
          reproductionRate: pest.reproductionRate,
          dispersalRate: pest.dispersalRate,
          economicImpact: pest.economicImpact,
          treatmentDifficulty: pest.treatmentDifficulty
        });
      }
    }

    return detectedPests;
  }

  private randomSeverity(): 'trace' | 'light' | 'moderate' | 'heavy' | 'severe' {
    const severities: ('trace' | 'light' | 'moderate' | 'heavy' | 'severe')[] = 
      ['trace', 'light', 'moderate', 'heavy', 'severe'];
    const weights = [0.4, 0.3, 0.2, 0.08, 0.02]; // Most detections are trace/light
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < severities.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return severities[i];
      }
    }
    
    return 'trace';
  }

  private randomStage(): 'egg' | 'larva' | 'nymph' | 'adult' | 'damage' | 'mixed' {
    const stages: ('egg' | 'larva' | 'nymph' | 'adult' | 'damage' | 'mixed')[] = 
      ['egg', 'larva', 'nymph', 'adult', 'damage', 'mixed'];
    return stages[Math.floor(Math.random() * stages.length)];
  }

  private generateBoundingBoxes(): BoundingBox[] {
    const numBoxes = 1 + Math.floor(Math.random() * 3); // 1-3 bounding boxes
    const boxes: BoundingBox[] = [];
    
    for (let i = 0; i < numBoxes; i++) {
      boxes.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: 50 + Math.random() * 100,
        height: 50 + Math.random() * 100,
        confidence: 0.7 + Math.random() * 0.3
      });
    }
    
    return boxes;
  }

  private assessImageQuality(imageData: string): number {
    // Simulate image quality assessment
    // In reality, this would analyze resolution, focus, lighting, etc.
    const baseQuality = 0.7 + Math.random() * 0.3; // 70-100%
    
    // Simulate occasional poor quality images
    if (Math.random() < 0.1) {
      return Math.random() * 0.5; // 0-50% for poor quality
    }
    
    return baseQuality;
  }

  private assessEnvironmentalRisk(metadata?: any): EnvironmentalRisk {
    const temperature = metadata?.temperature || 22;
    const humidity = metadata?.humidity || 65;
    const photoperiod = metadata?.lightLevel || 12;

    const tempRisk = this.calculateTemperatureRisk(temperature);
    const humidityRisk = this.calculateHumidityRisk(humidity);
    const photoperiodRisk = this.calculatePhotoperiodRisk(photoperiod);

    // Overall risk is highest individual risk
    const risks = [tempRisk.risk, humidityRisk.risk, photoperiodRisk.risk];
    const overallRisk = risks.includes('high') ? 'high' : 
                       risks.includes('medium') ? 'medium' : 'low';

    return {
      temperature: tempRisk,
      humidity: humidityRisk,
      photoperiod: photoperiodRisk,
      overallRisk: overallRisk as 'low' | 'medium' | 'high'
    };
  }

  private calculateTemperatureRisk(temperature: number) {
    const optimal: [number, number] = [18, 26]; // 18-26°C optimal range
    
    let risk: 'low' | 'medium' | 'high';
    if (temperature >= optimal[0] && temperature <= optimal[1]) {
      risk = 'low';
    } else if (temperature >= optimal[0] - 5 && temperature <= optimal[1] + 5) {
      risk = 'medium';
    } else {
      risk = 'high';
    }

    return {
      current: temperature,
      optimal,
      risk
    };
  }

  private calculateHumidityRisk(humidity: number) {
    const optimal: [number, number] = [50, 70]; // 50-70% optimal range
    
    let risk: 'low' | 'medium' | 'high';
    if (humidity >= optimal[0] && humidity <= optimal[1]) {
      risk = 'low';
    } else if (humidity >= optimal[0] - 10 && humidity <= optimal[1] + 10) {
      risk = 'medium';
    } else {
      risk = 'high';
    }

    return {
      current: humidity,
      optimal,
      risk
    };
  }

  private calculatePhotoperiodRisk(photoperiod: number) {
    let risk: 'low' | 'medium' | 'high';
    if (photoperiod >= 12 && photoperiod <= 16) {
      risk = 'low';
    } else if (photoperiod >= 10 && photoperiod <= 18) {
      risk = 'medium';
    } else {
      risk = 'high';
    }

    return {
      current: photoperiod,
      risk
    };
  }

  private calculateOverallRisk(
    pests: DetectedPest[], 
    environmental: EnvironmentalRisk
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (pests.length === 0) {
      return environmental.overallRisk === 'high' ? 'medium' : 'low';
    }

    const highSeverityPests = pests.filter(p => 
      p.severity === 'heavy' || p.severity === 'severe'
    ).length;

    const highImpactPests = pests.filter(p => 
      p.economicImpact === 'high' || p.economicImpact === 'severe'
    ).length;

    if (highSeverityPests > 0 || highImpactPests > 1) {
      return 'critical';
    } else if (pests.length > 2 || environmental.overallRisk === 'high') {
      return 'high';
    } else if (pests.length > 0 || environmental.overallRisk === 'medium') {
      return 'medium';
    }

    return 'low';
  }

  private generateImmediateActions(pests: DetectedPest[]): Action[] {
    const actions: Action[] = [];

    pests.forEach(pest => {
      if (pest.severity === 'heavy' || pest.severity === 'severe') {
        actions.push({
          type: 'chemical',
          priority: 'immediate',
          description: `Apply targeted treatment for ${pest.commonName}`,
          products: this.getRecommendedTreatments(pest),
          timing: 'Apply immediately, repeat in 7-10 days if necessary',
          precautions: ['Wear PPE', 'Follow label instructions', 'Check PHI'],
          effectiveness: 0.85
        });
      } else if (pest.severity === 'moderate') {
        actions.push({
          type: 'biological',
          priority: 'urgent',
          description: `Release beneficial insects for ${pest.commonName}`,
          products: this.getBiologicalControls(pest),
          timing: 'Release within 3-5 days',
          effectiveness: 0.75
        });
      }
    });

    // Add monitoring action if any pests detected
    if (pests.length > 0) {
      actions.push({
        type: 'monitoring',
        priority: 'immediate',
        description: 'Increase monitoring frequency in affected areas',
        timing: 'Start immediately, continue for 2 weeks',
        effectiveness: 0.9
      });
    }

    return actions;
  }

  private generatePreventiveActions(
    pests: DetectedPest[], 
    environmental: EnvironmentalRisk
  ): Action[] {
    const actions: Action[] = [];

    // Environmental controls
    if (environmental.temperature.risk === 'high') {
      actions.push({
        type: 'cultural',
        priority: 'routine',
        description: 'Adjust temperature to optimal range (18-26°C)',
        timing: 'Ongoing',
        effectiveness: 0.7
      });
    }

    if (environmental.humidity.risk === 'high') {
      actions.push({
        type: 'cultural',
        priority: 'routine',
        description: 'Improve ventilation and humidity control',
        timing: 'Implement within 1 week',
        effectiveness: 0.8
      });
    }

    // General IPM practices
    actions.push(
      {
        type: 'cultural',
        priority: 'routine',
        description: 'Maintain plant hygiene and remove debris',
        timing: 'Weekly',
        effectiveness: 0.6
      },
      {
        type: 'physical',
        priority: 'routine',
        description: 'Install and maintain sticky traps',
        timing: 'Check weekly, replace monthly',
        effectiveness: 0.5
      }
    );

    return actions;
  }

  private generateMonitoringRecommendations(pests: DetectedPest[]): MonitoringRecommendation[] {
    const recommendations: MonitoringRecommendation[] = [];

    // Visual monitoring
    recommendations.push({
      method: 'visual',
      frequency: pests.length > 0 ? 'Daily' : 'Weekly',
      locations: ['All growing areas', 'Entry points', 'Waste areas'],
      thresholds: {
        action: 1, // per plant
        economic: 5 // per plant
      }
    });

    // Trap monitoring
    recommendations.push({
      method: 'trap',
      frequency: 'Weekly',
      locations: ['Strategic trap locations', 'Near vents', 'Between zones'],
      thresholds: {
        action: 10, // per trap per week
        economic: 50 // per trap per week
      }
    });

    // Camera monitoring (if available)
    recommendations.push({
      method: 'camera',
      frequency: 'Daily automated scans',
      locations: ['High-risk zones', 'Entry points'],
      thresholds: {
        action: 0.1, // 10% affected area
        economic: 0.25 // 25% affected area
      }
    });

    return recommendations;
  }

  private getRecommendedTreatments(pest: DetectedPest): string[] {
    const treatments: { [key: string]: string[] } = {
      'aphid_green_peach': ['Insecticidal soap', 'Neem oil', 'Pyrethrins', 'Imidacloprid'],
      'thrips_western_flower': ['Blue sticky traps', 'Spinosad', 'Predatory mites', 'Reflective mulch'],
      'spider_mite_two_spotted': ['Predatory mites', 'Miticide rotation', 'Increased humidity', 'Horticultural oil'],
      'whitefly_greenhouse': ['Yellow sticky traps', 'Encarsia formosa', 'Insecticidal soap', 'Reflective mulch'],
      'powdery_mildew': ['Potassium bicarbonate', 'Horticultural oil', 'Improved air circulation', 'Resistant varieties']
    };

    return treatments[pest.pestId] || ['Consult IPM specialist'];
  }

  private getBiologicalControls(pest: DetectedPest): string[] {
    const bioControls: { [key: string]: string[] } = {
      'aphid_green_peach': ['Aphidius colemani', 'Chrysoperla carnea', 'Aphidoletes aphidimyza'],
      'thrips_western_flower': ['Amblyseius cucumeris', 'Orius insidiosus', 'Hypoaspis miles'],
      'spider_mite_two_spotted': ['Phytoseiulus persimilis', 'Amblyseius californicus', 'Feltiella acarisuga'],
      'whitefly_greenhouse': ['Encarsia formosa', 'Eretmocerus eremicus', 'Delphastus catalinae'],
      'powdery_mildew': ['Bacillus subtilis', 'Trichoderma harzianum', 'AQ10 biofungicide']
    };

    return bioControls[pest.pestId] || ['Consult biological control specialist'];
  }

  private async cacheResult(result: PestDetectionResult): Promise<void> {
    const cacheKey = `${this.cachePrefix}${result.id}`;
    try {
      await redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));
    } catch (error) {
      logger.error('api', 'Failed to cache detection result:', error);
    }
  }

  private async storeDetectionResult(result: PestDetectionResult): Promise<void> {
    // In production, this would store to database
    logger.info('api', `Storing detection result ${result.id} to database`, {
      facilityId: result.facilityId,
      pestsCount: result.pestsDetected.length,
      riskLevel: result.overallRisk
    });
  }

  /**
   * Get detection history for a facility
   */
  async getDetectionHistory(
    facilityId: string, 
    days: number = 30
  ): Promise<PestDetectionResult[]> {
    // Mock historical data
    const history: PestDetectionResult[] = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      if (Math.random() > 0.7) { // 30% chance of detection per day
        const mockResult = await this.detectPests({
          facilityId,
          imageData: 'mock_image_data',
          detectionMethod: 'camera',
          timestamp: date,
          metadata: {
            temperature: 20 + Math.random() * 10,
            humidity: 50 + Math.random() * 30,
            lightLevel: 12 + Math.random() * 4
          }
        });
        
        history.push({ ...mockResult, timestamp: date });
      }
    }
    
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get pest statistics for facility
   */
  async getPestStatistics(facilityId: string, days: number = 30): Promise<any> {
    const history = await this.getDetectionHistory(facilityId, days);
    
    const pestCounts: { [key: string]: number } = {};
    const severityCounts = { trace: 0, light: 0, moderate: 0, heavy: 0, severe: 0 };
    let totalDetections = 0;
    
    history.forEach(detection => {
      totalDetections++;
      detection.pestsDetected.forEach(pest => {
        pestCounts[pest.commonName] = (pestCounts[pest.commonName] || 0) + 1;
        severityCounts[pest.severity]++;
      });
    });
    
    return {
      totalDetections,
      uniquePests: Object.keys(pestCounts).length,
      mostCommonPest: Object.entries(pestCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['None', 0]),
      severityDistribution: severityCounts,
      riskTrend: this.calculateRiskTrend(history),
      averageConfidence: history.reduce((sum, h) => sum + h.confidenceScore, 0) / history.length || 0
    };
  }

  private calculateRiskTrend(history: PestDetectionResult[]): 'improving' | 'stable' | 'worsening' {
    if (history.length < 7) return 'stable';
    
    const recent = history.slice(0, 7);
    const older = history.slice(7, 14);
    
    const recentRisk = recent.reduce((sum, h) => sum + this.riskToNumber(h.overallRisk), 0) / recent.length;
    const olderRisk = older.reduce((sum, h) => sum + this.riskToNumber(h.overallRisk), 0) / older.length;
    
    const change = (recentRisk - olderRisk) / olderRisk;
    
    if (change > 0.1) return 'worsening';
    if (change < -0.1) return 'improving';
    return 'stable';
  }

  private riskToNumber(risk: string): number {
    switch (risk) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 1;
    }
  }
}

export const pestDetectionService = new PestDetectionService();
export default pestDetectionService;