/**
 * Pest & Disease Detection and Management Service
 * Provides AI-powered pest identification, treatment recommendations, and tracking
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export interface PestDetection {
  id: string;
  timestamp: Date;
  location: {
    facilityId: string;
    zoneId: string;
    rowNumber?: number;
    plantId?: string;
    coordinates?: { lat: number; lng: number };
  };
  detection: {
    type: 'pest' | 'disease' | 'deficiency' | 'environmental';
    name: string;
    scientificName?: string;
    confidence: number; // 0-100%
    severity: 'low' | 'medium' | 'high' | 'critical';
    stage: string; // e.g., 'early', 'established', 'spreading'
  };
  affectedArea: {
    plantsAffected: number;
    percentageOfZone: number;
    spreadRate?: number; // % per day
  };
  images?: {
    url: string;
    analysisResults?: any;
    timestamp: Date;
  }[];
  environmentalConditions?: {
    temperature: number;
    humidity: number;
    lightLevel: number;
    airflow: number;
  };
}

export interface TreatmentProtocol {
  id: string;
  pestOrDisease: string;
  severity: string;
  treatments: Treatment[];
  preventiveMeasures: string[];
  monitoringSchedule: {
    frequency: string;
    duration: number; // days
    checkpoints: string[];
  };
  expectedOutcome: {
    timeToControl: number; // days
    successRate: number; // percentage
    reoccurrenceRisk: string;
  };
}

export interface Treatment {
  id: string;
  name: string;
  type: 'biological' | 'chemical' | 'cultural' | 'mechanical' | 'integrated';
  category: 'organic' | 'conventional' | 'both';
  applicationMethod: string;
  dosage: {
    amount: number;
    unit: string;
    perArea: string; // e.g., "per 1000 sq ft"
  };
  timing: {
    whenToApply: string;
    frequency: string;
    numberOfApplications: number;
    interval: number; // days between applications
  };
  restrictions: {
    preHarvestInterval: number; // days
    reEntryInterval: number; // hours
    maximumApplicationsPerSeason: number;
    restrictedUseProduct: boolean;
  };
  efficacy: {
    controlLevel: number; // percentage
    resistanceRisk: string;
    compatibleProducts: string[];
    incompatibleProducts: string[];
  };
  safetyPrecautions: string[];
  cost: {
    productCost: number;
    laborCost: number;
    totalCostPerApplication: number;
  };
}

export interface SprayRecord {
  id: string;
  timestamp: Date;
  location: {
    facilityId: string;
    zoneIds: string[];
    area: number; // square feet
  };
  product: {
    name: string;
    activeIngredient: string;
    epaNumber?: string;
    lotNumber: string;
  };
  application: {
    rate: number;
    unit: string;
    totalAmountUsed: number;
    waterVolume: number;
    method: string;
    equipment: string;
  };
  conditions: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    timeOfDay: string;
  };
  applicator: {
    name: string;
    licenseNumber?: string;
    certificationExpiry?: Date;
  };
  targetPests: string[];
  effectiveness?: {
    checkDate: Date;
    controlAchieved: number; // percentage
    notes: string;
  };
}

// Common pests and diseases database
export const PEST_DATABASE = {
  cannabis: {
    pests: [
      {
        name: 'Spider Mites',
        scientificName: 'Tetranychus urticae',
        symptoms: ['Tiny yellow/white spots on leaves', 'Fine webbing', 'Bronze or yellow leaves'],
        favorableConditions: { temp: [70, 80], humidity: [30, 50] },
        treatments: ['Predatory mites', 'Neem oil', 'Insecticidal soap', 'Pyrethrin']
      },
      {
        name: 'Aphids',
        scientificName: 'Various species',
        symptoms: ['Sticky honeydew', 'Curled leaves', 'Stunted growth'],
        favorableConditions: { temp: [60, 75], humidity: [40, 60] },
        treatments: ['Ladybugs', 'Lacewings', 'Neem oil', 'Insecticidal soap']
      },
      {
        name: 'Thrips',
        scientificName: 'Frankliniella occidentalis',
        symptoms: ['Silver streaks on leaves', 'Deformed flowers', 'Stippling'],
        favorableConditions: { temp: [68, 80], humidity: [40, 70] },
        treatments: ['Predatory mites', 'Spinosad', 'Blue sticky traps']
      }
    ],
    diseases: [
      {
        name: 'Powdery Mildew',
        scientificName: 'Golovinomyces spp.',
        symptoms: ['White powdery coating', 'Yellowing leaves', 'Reduced yield'],
        favorableConditions: { temp: [60, 80], humidity: [50, 70] },
        treatments: ['Sulfur', 'Potassium bicarbonate', 'Bacillus subtilis', 'UV-C treatment']
      },
      {
        name: 'Botrytis (Bud Rot)',
        scientificName: 'Botrytis cinerea',
        symptoms: ['Gray mold on buds', 'Brown/gray spots', 'Musty smell'],
        favorableConditions: { temp: [60, 75], humidity: [60, 90] },
        treatments: ['Improve airflow', 'Reduce humidity', 'Remove infected material', 'Bacillus amyloliquefaciens']
      },
      {
        name: 'Root Rot',
        scientificName: 'Pythium spp.',
        symptoms: ['Brown roots', 'Wilting', 'Stunted growth', 'Foul smell'],
        favorableConditions: { temp: [65, 80], humidity: [70, 100] },
        treatments: ['Hydrogen peroxide', 'Beneficial bacteria', 'Improve drainage', 'Trichoderma']
      }
    ]
  },
  tomatoes: {
    pests: [
      {
        name: 'Tomato Hornworm',
        scientificName: 'Manduca quinquemaculata',
        symptoms: ['Large holes in leaves', 'Defoliation', 'Dark droppings'],
        favorableConditions: { temp: [70, 85], humidity: [40, 60] },
        treatments: ['Bt spray', 'Hand picking', 'Parasitic wasps']
      },
      {
        name: 'Whiteflies',
        scientificName: 'Bemisia tabaci',
        symptoms: ['Sticky honeydew', 'Yellow leaves', 'Sooty mold'],
        favorableConditions: { temp: [75, 85], humidity: [50, 70] },
        treatments: ['Yellow sticky traps', 'Encarsia formosa', 'Neem oil']
      }
    ],
    diseases: [
      {
        name: 'Early Blight',
        scientificName: 'Alternaria solani',
        symptoms: ['Dark spots with rings', 'Yellow halos', 'Leaf drop'],
        favorableConditions: { temp: [75, 85], humidity: [60, 90] },
        treatments: ['Copper fungicide', 'Crop rotation', 'Resistant varieties']
      },
      {
        name: 'Late Blight',
        scientificName: 'Phytophthora infestans',
        symptoms: ['Water-soaked spots', 'White fuzzy growth', 'Rapid spread'],
        favorableConditions: { temp: [60, 70], humidity: [75, 100] },
        treatments: ['Copper spray', 'Remove infected plants', 'Improve air circulation']
      }
    ]
  },
  leafyGreens: {
    pests: [
      {
        name: 'Leaf Miners',
        scientificName: 'Liriomyza spp.',
        symptoms: ['Serpentine trails in leaves', 'White tunnels', 'Reduced photosynthesis'],
        favorableConditions: { temp: [65, 75], humidity: [40, 60] },
        treatments: ['Parasitic wasps', 'Spinosad', 'Row covers']
      }
    ],
    diseases: [
      {
        name: 'Downy Mildew',
        scientificName: 'Peronospora farinosa',
        symptoms: ['Yellow patches', 'Gray fuzzy growth underneath', 'Leaf curling'],
        favorableConditions: { temp: [50, 65], humidity: [70, 100] },
        treatments: ['Copper hydroxide', 'Improve ventilation', 'Resistant cultivars']
      }
    ]
  }
};

export class PestManagementService {
  /**
   * Detect pest or disease from image using AI
   */
  async detectFromImage(
    imageUrl: string,
    cropType: string,
    metadata?: any
  ): Promise<PestDetection> {
    try {
      // In production, this would call an AI vision API
      // For now, simulate detection
      const mockDetection: PestDetection = {
        id: `detect_${Date.now()}`,
        timestamp: new Date(),
        location: metadata?.location || {},
        detection: {
          type: 'pest',
          name: 'Spider Mites',
          scientificName: 'Tetranychus urticae',
          confidence: 85,
          severity: 'medium',
          stage: 'early'
        },
        affectedArea: {
          plantsAffected: 5,
          percentageOfZone: 2,
          spreadRate: 0.5
        },
        images: [{
          url: imageUrl,
          timestamp: new Date()
        }],
        environmentalConditions: metadata?.environmental
      };

      // Log detection
      await this.logDetection(mockDetection);

      return mockDetection;
    } catch (error) {
      logger.error('Pest detection failed', error);
      throw error;
    }
  }

  /**
   * Get treatment recommendations based on detection
   */
  async getTreatmentProtocol(
    detection: PestDetection,
    cropType: string,
    preferences: {
      organic: boolean;
      budgetLimit?: number;
      harvestDate?: Date;
    }
  ): Promise<TreatmentProtocol> {
    const pestInfo = this.findPestInfo(detection.detection.name, cropType);
    
    if (!pestInfo) {
      throw new Error(`No treatment data for ${detection.detection.name}`);
    }

    const treatments = this.selectTreatments(
      pestInfo.treatments,
      detection.detection.severity,
      preferences
    );

    return {
      id: `protocol_${Date.now()}`,
      pestOrDisease: detection.detection.name,
      severity: detection.detection.severity,
      treatments,
      preventiveMeasures: this.getPreventiveMeasures(detection.detection.name),
      monitoringSchedule: {
        frequency: detection.detection.severity === 'high' ? 'daily' : 'every 3 days',
        duration: 14,
        checkpoints: ['Population levels', 'Damage assessment', 'Treatment efficacy']
      },
      expectedOutcome: {
        timeToControl: detection.detection.severity === 'low' ? 7 : 14,
        successRate: 85,
        reoccurrenceRisk: 'moderate'
      }
    };
  }

  /**
   * Record spray application
   */
  async recordSprayApplication(record: SprayRecord): Promise<void> {
    try {
      // Save to database
      await prisma.sprayRecord.create({
        data: record as any
      });

      // Update treatment schedule
      await this.updateTreatmentSchedule(record);

      // Check compliance
      await this.checkCompliance(record);

      logger.info('Spray application recorded', { recordId: record.id });
    } catch (error) {
      logger.error('Failed to record spray application', error);
      throw error;
    }
  }

  /**
   * Generate IPM report
   */
  async generateIPMReport(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const detections = await prisma.pestDetection.findMany({
      where: {
        'location.facilityId': facilityId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const sprayRecords = await prisma.sprayRecord.findMany({
      where: {
        'location.facilityId': facilityId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalDetections: detections.length,
        uniquePests: new Set(detections.map(d => d.detection.name)).size,
        totalApplications: sprayRecords.length,
        totalCost: sprayRecords.reduce((sum, r) => sum + r.cost.totalCostPerApplication, 0)
      },
      detections,
      treatments: sprayRecords,
      effectiveness: this.calculateEffectiveness(detections, sprayRecords),
      recommendations: this.generateRecommendations(detections, sprayRecords)
    };
  }

  // Helper methods
  private findPestInfo(pestName: string, cropType: string): any {
    const cropData = PEST_DATABASE[cropType as keyof typeof PEST_DATABASE];
    if (!cropData) return null;

    return [...cropData.pests, ...cropData.diseases].find(
      p => p.name === pestName || p.scientificName === pestName
    );
  }

  private selectTreatments(
    availableTreatments: string[],
    severity: string,
    preferences: any
  ): Treatment[] {
    // Simplified treatment selection logic
    return availableTreatments.map(name => ({
      id: `treat_${Date.now()}`,
      name,
      type: 'integrated' as const,
      category: preferences.organic ? 'organic' as const : 'conventional' as const,
      applicationMethod: 'Foliar spray',
      dosage: {
        amount: 2,
        unit: 'oz',
        perArea: 'per 1000 sq ft'
      },
      timing: {
        whenToApply: 'Evening',
        frequency: 'Every 7 days',
        numberOfApplications: severity === 'high' ? 3 : 2,
        interval: 7
      },
      restrictions: {
        preHarvestInterval: 0,
        reEntryInterval: 4,
        maximumApplicationsPerSeason: 8,
        restrictedUseProduct: false
      },
      efficacy: {
        controlLevel: 85,
        resistanceRisk: 'low',
        compatibleProducts: [],
        incompatibleProducts: []
      },
      safetyPrecautions: ['Wear PPE', 'Avoid spray drift'],
      cost: {
        productCost: 25,
        laborCost: 15,
        totalCostPerApplication: 40
      }
    }));
  }

  private getPreventiveMeasures(pestName: string): string[] {
    const generalMeasures = [
      'Regular monitoring and scouting',
      'Maintain optimal environmental conditions',
      'Practice good sanitation',
      'Use resistant varieties when available',
      'Implement companion planting'
    ];

    // Add specific measures based on pest
    if (pestName.includes('Mite')) {
      generalMeasures.push('Maintain humidity above 50%');
    }
    if (pestName.includes('Mildew')) {
      generalMeasures.push('Improve air circulation', 'Reduce humidity below 50%');
    }

    return generalMeasures;
  }

  private async logDetection(detection: PestDetection): Promise<void> {
    await prisma.pestDetection.create({
      data: detection as any
    });
  }

  private async updateTreatmentSchedule(record: SprayRecord): Promise<void> {
    // Update treatment schedule logic
  }

  private async checkCompliance(record: SprayRecord): Promise<void> {
    // Check regulatory compliance
  }

  private calculateEffectiveness(detections: any[], treatments: any[]): number {
    // Calculate treatment effectiveness
    return 85; // placeholder
  }

  private generateRecommendations(detections: any[], treatments: any[]): string[] {
    return [
      'Continue monitoring high-risk areas',
      'Consider biological control agents',
      'Adjust environmental conditions to reduce pest pressure'
    ];
  }
}

// Export singleton instance
export const pestManagement = new PestManagementService();