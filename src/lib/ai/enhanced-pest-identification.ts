import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

// Enhanced pest identification interfaces
export interface PestIdentificationRequest {
  imageBase64: string;
  imageUrl?: string;
  facilityId?: string;
  zoneId?: string;
  cropType?: string;
  growthStage?: string;
  environmentalData?: {
    temperature: number;
    humidity: number;
    leafWetness?: number;
    co2?: number;
    vpd?: number;
  };
  suspectedPest?: string;
  symptoms?: string[];
  location?: {
    latitude: number;
    longitude: number;
    zone?: string;
    block?: string;
  };
}

export interface MorphologicalAnalysis {
  bodyLength: {
    estimate: number; // mm
    confidence: number;
    range: { min: number; max: number };
  };
  wingspan?: {
    estimate: number; // mm
    confidence: number;
  };
  colorPatterns: {
    primary: string;
    secondary?: string;
    markings: string[];
  };
  distinguishingFeatures: string[];
  sexualDimorphism?: {
    gender: 'male' | 'female' | 'unknown';
    confidence: number;
    indicators: string[];
  };
}

export interface TaxonomicClassification {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  commonName: string;
  scientificName: string;
  authority?: string; // taxonomic authority
  synonyms?: string[];
}

export interface LifeStageAnalysis {
  stage: 'egg' | 'larva' | 'pupa' | 'adult' | 'mixed' | 'unknown';
  confidence: number;
  developmentalStage?: {
    instar?: number; // for larvae
    maturity: 'early' | 'middle' | 'late';
    reproductiveStatus?: 'pre-reproductive' | 'reproductive' | 'post-reproductive';
  };
  estimatedAge?: {
    days: number;
    confidence: number;
  };
  nextStageInfo?: {
    nextStage: string;
    timeToNext: number; // days
    conditions: string[];
  };
}

export interface DamageAssessment {
  damageType: string[];
  severity: 'none' | 'minimal' | 'moderate' | 'severe' | 'critical';
  economicThreshold: {
    reached: boolean;
    currentLevel: number;
    actionLevel: number;
    treatmentRecommended: boolean;
  };
  affectedPlantParts: string[];
  progressionRate: 'slow' | 'moderate' | 'rapid';
  yieldImpact: {
    estimated: number; // percentage
    confidence: number;
  };
}

export interface IPMRecommendations {
  immediateActions: Array<{
    action: string;
    urgency: 'immediate' | 'within_24h' | 'within_week';
    effectiveness: number; // 0-100%
    cost: 'low' | 'medium' | 'high';
  }>;
  biologicalControl: Array<{
    agent: string;
    effectiveness: number;
    applicationMethod: string;
    timing: string;
    considerations: string[];
  }>;
  chemicalOptions: Array<{
    activeIngredient: string;
    tradeName: string;
    mode: string;
    resistance: {
      riskLevel: 'low' | 'medium' | 'high';
      rotationNeeded: boolean;
    };
  }>;
  culturalControls: string[];
  monitoringPlan: {
    frequency: string;
    method: string;
    thresholds: Record<string, number>;
  };
}

export interface EnhancedPestIdentificationResult {
  identification: {
    taxonomy: TaxonomicClassification;
    confidence: number; // 0-100%
    alternativeSpecies?: Array<{
      taxonomy: TaxonomicClassification;
      confidence: number;
    }>;
  };
  morphology: MorphologicalAnalysis;
  lifeStage: LifeStageAnalysis;
  damage: DamageAssessment;
  ipm: IPMRecommendations;
  riskAssessment: {
    populationGrowthPotential: 'low' | 'medium' | 'high';
    dispersalRisk: 'low' | 'medium' | 'high';
    resistanceHistory: string[];
    seasonalConsiderations: string[];
  };
  metadata: {
    processingTime: number; // ms
    modelVersion: string;
    confidenceThreshold: number;
    requiresExpertReview: boolean;
    analysisId: string;
  };
}

export class EnhancedPestIdentificationService {
  private anthropic: Anthropic;
  
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 3,
      timeout: 60000,
    });
  }

  async identifyPest(request: PestIdentificationRequest): Promise<EnhancedPestIdentificationResult> {
    const startTime = Date.now();
    const analysisId = `pest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Enhanced expert entomologist prompt
      const expertPrompt = this.buildExpertPrompt(request);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        system: this.getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: expertPrompt
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: request.imageBase64
                }
              }
            ]
          }
        ]
      });

      const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
      const result = this.parseAnalysisResult(analysisText);
      
      // Add metadata
      result.metadata = {
        processingTime: Date.now() - startTime,
        modelVersion: 'claude-3.5-sonnet-enhanced',
        confidenceThreshold: 0.7,
        requiresExpertReview: result.identification.confidence < 70,
        analysisId
      };

      // Store analysis for learning and improvement
      await this.storeAnalysis(request, result);
      
      return result;
      
    } catch (error) {
      logger.error('api', 'Pest identification error:', error );
      throw new Error(`Pest identification failed: ${error.message}`);
    }
  }

  private getSystemPrompt(): string {
    return `You are Dr. Elena Rodriguez, a world-renowned entomologist with 25 years of experience specializing in agricultural pest management. You have a PhD in Entomology from UC Davis, have published 150+ peer-reviewed papers, and are recognized as a leading expert in IPM for controlled environment agriculture.

Your expertise includes:
- Taxonomic identification of arthropod pests and beneficial insects
- Economic threshold development and validation
- Resistance management strategies
- Biological control agent evaluation
- Morphological analysis and species differentiation
- Agricultural pest population dynamics

Analyze images with the precision and attention to detail expected from a university-level diagnostic laboratory. Provide taxonomically accurate identifications with appropriate confidence levels, and always include practical IPM recommendations based on current research.

When confidence is below 80%, suggest alternative identification approaches or indicate the need for additional diagnostic methods (molecular, microscopic examination, etc.).`;
  }

  private buildExpertPrompt(request: PestIdentificationRequest): string {
    const environmentalContext = request.environmentalData ? 
      `Environmental Conditions:
      - Temperature: ${request.environmentalData.temperature}°C
      - Humidity: ${request.environmentalData.humidity}%
      - VPD: ${request.environmentalData.vpd || 'not provided'}
      - Leaf Wetness: ${request.environmentalData.leafWetness || 'not provided'} hours
      - CO2: ${request.environmentalData.co2 || 'not provided'} ppm` : '';

    const cropContext = request.cropType ? 
      `Crop Information:
      - Crop Type: ${request.cropType}
      - Growth Stage: ${request.growthStage || 'not specified'}` : '';

    const suspectedPestContext = request.suspectedPest ? 
      `Preliminary Observations:
      - Suspected Pest: ${request.suspectedPest}
      - Symptoms: ${request.symptoms?.join(', ') || 'none specified'}` : '';

    return `Please analyze this agricultural pest image with university-level precision and provide a comprehensive entomological assessment.

${environmentalContext}

${cropContext}

${suspectedPestContext}

Required Analysis (provide as structured JSON):

{
  "identification": {
    "taxonomy": {
      "kingdom": "Animalia",
      "phylum": "Arthropoda",
      "class": "Insecta/Arachnida/etc",
      "order": "specific order",
      "family": "specific family", 
      "genus": "specific genus",
      "species": "specific species",
      "scientificName": "Genus species",
      "commonName": "common name",
      "authority": "taxonomic authority if known",
      "synonyms": ["alternative names if applicable"]
    },
    "confidence": 85,
    "alternativeSpecies": [
      {
        "taxonomy": {...},
        "confidence": 15
      }
    ]
  },
  "morphology": {
    "bodyLength": {
      "estimate": 2.5,
      "confidence": 80,
      "range": {"min": 2.0, "max": 3.0}
    },
    "wingspan": {
      "estimate": 8.0,
      "confidence": 75
    },
    "colorPatterns": {
      "primary": "dark brown",
      "secondary": "yellow markings",
      "markings": ["striped pattern", "spotted wing tips"]
    },
    "distinguishingFeatures": ["characteristic antenna shape", "wing venation pattern"],
    "sexualDimorphism": {
      "gender": "female",
      "confidence": 70,
      "indicators": ["broader abdomen", "ovipositor visible"]
    }
  },
  "lifeStage": {
    "stage": "adult",
    "confidence": 95,
    "developmentalStage": {
      "maturity": "middle",
      "reproductiveStatus": "reproductive"
    },
    "estimatedAge": {
      "days": 14,
      "confidence": 60
    },
    "nextStageInfo": {
      "nextStage": "senescence",
      "timeToNext": 21,
      "conditions": ["continued reproduction for 2-3 weeks"]
    }
  },
  "damage": {
    "damageType": ["feeding damage", "oviposition scars"],
    "severity": "moderate",
    "economicThreshold": {
      "reached": true,
      "currentLevel": 15,
      "actionLevel": 10,
      "treatmentRecommended": true
    },
    "affectedPlantParts": ["leaves", "stems"],
    "progressionRate": "moderate",
    "yieldImpact": {
      "estimated": 12,
      "confidence": 75
    }
  },
  "ipm": {
    "immediateActions": [
      {
        "action": "Begin weekly monitoring with sticky traps",
        "urgency": "within_24h",
        "effectiveness": 85,
        "cost": "low"
      }
    ],
    "biologicalControl": [
      {
        "agent": "Phytoseiulus persimilis",
        "effectiveness": 80,
        "applicationMethod": "release in hotspots",
        "timing": "immediately",
        "considerations": ["maintain humidity >60%"]
      }
    ],
    "chemicalOptions": [
      {
        "activeIngredient": "abamectin",
        "tradeName": "Avid",
        "mode": "translaminar",
        "resistance": {
          "riskLevel": "medium",
          "rotationNeeded": true
        }
      }
    ],
    "culturalControls": ["remove heavily infested plants", "increase air circulation"],
    "monitoringPlan": {
      "frequency": "twice weekly",
      "method": "visual inspection + sticky traps",
      "thresholds": {"adults_per_trap": 5, "mites_per_leaf": 2}
    }
  },
  "riskAssessment": {
    "populationGrowthPotential": "high",
    "dispersalRisk": "medium", 
    "resistanceHistory": ["organophosphates", "pyrethroids"],
    "seasonalConsiderations": ["peak activity in warm months", "overwinters as adult"]
  }
}

Important: 
- Provide exact scientific names with proper taxonomic hierarchy
- Include confidence scores for all assessments
- Base economic thresholds on peer-reviewed research
- Consider environmental factors in your recommendations
- Indicate if specimen quality requires additional diagnostic methods
- Flag any potential beneficial insects (parasitoids, predators) that should be protected`;
  }

  private parseAnalysisResult(analysisText: string): EnhancedPestIdentificationResult {
    try {
      // Extract JSON from the response text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in analysis response');
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      // Validate required fields and provide defaults
      return {
        identification: result.identification || { taxonomy: {}, confidence: 0 },
        morphology: result.morphology || {},
        lifeStage: result.lifeStage || { stage: 'unknown', confidence: 0 },
        damage: result.damage || { severity: 'unknown', economicThreshold: { reached: false } },
        ipm: result.ipm || { immediateActions: [], biologicalControl: [], chemicalOptions: [] },
        riskAssessment: result.riskAssessment || {},
        metadata: {
          processingTime: 0,
          modelVersion: 'claude-3.5-sonnet-enhanced',
          confidenceThreshold: 0.7,
          requiresExpertReview: true,
          analysisId: ''
        }
      };
    } catch (error) {
      logger.error('api', 'Failed to parse analysis result:', error );
      throw new Error('Failed to parse pest identification result');
    }
  }

  private async storeAnalysis(request: PestIdentificationRequest, result: EnhancedPestIdentificationResult): Promise<void> {
    try {
      // Store for learning and improvement
      await prisma.pestAnalysis.create({
        data: {
          analysisId: result.metadata.analysisId,
          facilityId: request.facilityId,
          zoneId: request.zoneId,
          imageData: request.imageBase64.substring(0, 100), // Store thumbnail reference
          identification: result.identification as any,
          confidence: result.identification.confidence,
          processingTime: result.metadata.processingTime,
          requiresReview: result.metadata.requiresExpertReview,
          createdAt: new Date()
        }
      });
    } catch (error) {
      logger.error('api', 'Failed to store pest analysis:', error );
      // Don't throw - this is non-critical
    }
  }
}

export const enhancedPestIdentification = new EnhancedPestIdentificationService();