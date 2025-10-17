/**
 * Vision Types for VibeLux Mobile Scouting
 * Type definitions for computer vision and image analysis
 */

export interface VisionAnalysisResult {
  id: string;
  timestamp: Date;
  imageUrl: string;
  analysis: {
    plantHealth: PlantHealthAnalysis;
    pestDetection: PestDetection[];
    diseaseDetection: DiseaseDetection[];
    growthMetrics: GrowthMetrics;
    environmentalFactors: EnvironmentalFactors;
  };
  confidence: number;
  processingTime: number;
}

export interface PlantHealthAnalysis {
  overallHealth: number; // 0-100
  leafColor: {
    rgb: [number, number, number];
    lab: [number, number, number];
    chlorophyllIndex: number;
  };
  stressIndicators: {
    waterStress: number;
    nutrientDeficiency: NutrientDeficiency[];
    lightStress: number;
    heatStress: number;
  };
  vigor: number; // 0-100
}

export interface NutrientDeficiency {
  nutrient: 'nitrogen' | 'phosphorus' | 'potassium' | 'calcium' | 'magnesium' | 'iron' | 'other';
  severity: number; // 0-100
  symptoms: string[];
  affectedArea: number; // Percentage of plant affected
}

export interface PestDetection {
  pestType: string;
  scientificName?: string;
  count: number;
  locations: BoundingBox[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendedAction: string;
}

export interface DiseaseDetection {
  diseaseType: string;
  pathogen?: string;
  affectedArea: number; // Percentage
  stage: 'early' | 'developing' | 'advanced';
  symptoms: string[];
  boundingBoxes: BoundingBox[];
  confidence: number;
  treatmentRecommendations: string[];
}

export interface GrowthMetrics {
  height: number; // cm
  width: number; // cm
  leafArea: number; // cm²
  leafCount: number;
  internodeDistance: number; // cm
  stemDiameter: number; // mm
  canopyDensity: number; // 0-100
  growthStage: string;
}

export interface EnvironmentalFactors {
  lightLevel: number; // Estimated from image brightness
  shadowPatterns: ShadowPattern[];
  colorTemperature: number; // Kelvin
  haziness: number; // Air quality indicator
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  confidence?: number;
}

export interface ShadowPattern {
  area: number; // Percentage of image
  intensity: number; // 0-100
  direction?: number; // Degrees
}

export interface ImageProcessingOptions {
  resolution: 'low' | 'medium' | 'high' | 'original';
  enhanceContrast: boolean;
  colorCorrection: boolean;
  noiseReduction: boolean;
  edgeDetection: boolean;
}

export interface VisionModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'detection' | 'segmentation';
  inputSize: [number, number];
  outputClasses: string[];
  accuracy: number;
  lastUpdated: Date;
}

export interface CameraCalibration {
  focalLength: number;
  sensorSize: [number, number];
  distortionCoefficients: number[];
  principalPoint: [number, number];
  calibrationDate: Date;
}

export interface ImageAnnotation {
  id: string;
  imageId: string;
  type: 'bbox' | 'polygon' | 'point' | 'line';
  coordinates: number[][];
  label: string;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
}

export interface BatchAnalysisRequest {
  images: string[]; // URLs or base64
  models: string[]; // Model IDs to run
  options: ImageProcessingOptions;
  priority: 'low' | 'normal' | 'high';
  callback?: string; // Webhook URL
}

export interface VisionTrainingData {
  datasetId: string;
  images: Array<{
    url: string;
    annotations: ImageAnnotation[];
  }>;
  splitRatio: {
    train: number;
    validation: number;
    test: number;
  };
  augmentations?: ImageAugmentation[];
}

export interface ImageAugmentation {
  type: 'rotation' | 'flip' | 'brightness' | 'contrast' | 'noise' | 'blur';
  parameters: Record<string, any>;
  probability: number;
}

export interface RealTimeVisionStream {
  streamId: string;
  source: 'camera' | 'video' | 'screen';
  fps: number;
  resolution: [number, number];
  models: string[];
  onFrame: (result: VisionAnalysisResult) => void;
  onError: (error: Error) => void;
}

export interface VisionAlertRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
    threshold: number;
  };
  action: 'notify' | 'log' | 'webhook' | 'email';
  recipients?: string[];
  cooldown?: number; // Minutes
  enabled: boolean;
}