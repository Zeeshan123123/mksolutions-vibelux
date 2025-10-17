/**
 * Browser-Based ML Engine
 * Runs ML models directly in the customer's browser - no setup required!
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '@/lib/logging/production-logger';

// Auto-configure TensorFlow for best browser performance
export async function setupBrowserML() {
  // Use WebGL backend for GPU acceleration
  await tf.setBackend('webgl');
  
  // Enable production mode optimizations
  tf.enableProdMode();
  
  // Set memory management
  tf.engine().startScope();
  
  logger.info('api', 'Browser ML engine initialized', {
    backend: tf.getBackend(),
    webgl: tf.env().getBool('WEBGL_VERSION') >= 2
  });
}

export class BrowserYieldPredictor {
  private model: tf.LayersModel | null = null;
  private modelUrl = '/models/yield-prediction/model.json';
  
  async loadModel() {
    try {
      // Load pre-trained model from public folder
      this.model = await tf.loadGraphModel(this.modelUrl) as any;
      logger.info('api', 'Yield prediction model loaded');
      return true;
    } catch (error) {
      logger.warn('api', 'Using rule-based yield prediction (ML model not found)');
      return false;
    }
  }
  
  async predict(inputs: {
    temperature: number;
    humidity: number;
    ppfd: number;
    co2: number;
    ec: number;
    ph: number;
    cropType: string;
    growthStage: string;
    plantAge: number;
  }): Promise<{
    yield: number;
    confidence: number;
    factors: any;
  }> {
    // If ML model is loaded, use it
    if (this.model) {
      const features = tf.tensor2d([[
        inputs.temperature / 40,  // Normalize to 0-1
        inputs.humidity / 100,
        inputs.ppfd / 1000,
        inputs.co2 / 2000,
        inputs.ec / 5,
        inputs.ph / 14,
        this.encodeCropType(inputs.cropType),
        this.encodeGrowthStage(inputs.growthStage),
        inputs.plantAge / 120
      ]]);
      
      const prediction = this.model.predict(features) as tf.Tensor;
      const [yieldValue] = await prediction.data();
      
      features.dispose();
      prediction.dispose();
      
      return {
        yield: yieldValue * 50, // Denormalize (kg/m²)
        confidence: 0.85,
        factors: this.calculateFactors(inputs)
      };
    }
    
    // Fallback to rule-based calculation
    return this.ruleBasedPrediction(inputs);
  }
  
  private ruleBasedPrediction(inputs: any) {
    // Use existing rule-based logic as fallback
    const baseYield = 2.5;
    const factors = this.calculateFactors(inputs);
    const multiplier = Object.values(factors).reduce((sum: number, f: any) => sum + f.impact, 0) / 100;
    
    return {
      yield: baseYield * (1 + multiplier),
      confidence: 0.7,
      factors
    };
  }
  
  private calculateFactors(inputs: any) {
    return {
      temperature: {
        impact: this.calculateImpact(inputs.temperature, 22, 2),
        optimal: 22,
        current: inputs.temperature
      },
      humidity: {
        impact: this.calculateImpact(inputs.humidity, 65, 5),
        optimal: 65,
        current: inputs.humidity
      },
      lighting: {
        impact: this.calculateImpact(inputs.ppfd, 450, 50),
        optimal: 450,
        current: inputs.ppfd
      },
      co2: {
        impact: this.calculateImpact(inputs.co2, 1000, 100),
        optimal: 1000,
        current: inputs.co2
      }
    };
  }
  
  private calculateImpact(value: number, optimal: number, tolerance: number): number {
    const diff = Math.abs(value - optimal);
    if (diff <= tolerance) {
      return 50 - (diff / tolerance) * 40;
    }
    return Math.max(-50, -10 - ((diff - tolerance) / (tolerance * 2)) * 40);
  }
  
  private encodeCropType(crop: string): number {
    const types: Record<string, number> = {
      'lettuce': 0.1,
      'tomato': 0.3,
      'cannabis': 0.5,
      'herbs': 0.7,
      'strawberry': 0.9
    };
    return types[crop.toLowerCase()] || 0.5;
  }
  
  private encodeGrowthStage(stage: string): number {
    const stages: Record<string, number> = {
      'seedling': 0.2,
      'vegetative': 0.4,
      'flowering': 0.6,
      'fruiting': 0.8,
      'harvest': 1.0
    };
    return stages[stage.toLowerCase()] || 0.5;
  }
}

export class BrowserDiseasePredictor {
  private model: tf.LayersModel | null = null;
  private modelUrl = '/models/disease-prediction/model.json';
  
  async loadModel() {
    try {
      this.model = await tf.loadGraphModel(this.modelUrl) as any;
      logger.info('api', 'Disease prediction model loaded');
      return true;
    } catch (error) {
      logger.warn('api', 'Using rule-based disease prediction');
      return false;
    }
  }
  
  async predict(inputs: {
    temperature: number;
    humidity: number;
    leafWetness: number;
    vpd: number;
    cropType: string;
  }): Promise<{
    diseases: Array<{
      name: string;
      risk: number;
      confidence: number;
    }>;
  }> {
    if (this.model) {
      // Use real ML model
      const features = tf.tensor2d([[
        inputs.temperature / 40,
        inputs.humidity / 100,
        inputs.leafWetness / 24,
        inputs.vpd / 3,
        this.encodeCropType(inputs.cropType)
      ]]);
      
      const prediction = this.model.predict(features) as tf.Tensor;
      const risks = await prediction.data();
      
      features.dispose();
      prediction.dispose();
      
      const diseases = ['powdery_mildew', 'botrytis', 'spider_mites', 'aphids'];
      return {
        diseases: diseases.map((name, i) => ({
          name,
          risk: risks[i] * 100,
          confidence: 0.85
        })).filter(d => d.risk > 10)
      };
    }
    
    // Fallback to environmental thresholds
    return this.ruleBasedDiseaseRisk(inputs);
  }
  
  private ruleBasedDiseaseRisk(inputs: any) {
    const diseases = [];
    
    // Powdery mildew risk
    if (inputs.humidity > 40 && inputs.humidity < 70 && inputs.temperature > 20) {
      diseases.push({
        name: 'powdery_mildew',
        risk: 60,
        confidence: 0.7
      });
    }
    
    // Botrytis risk
    if (inputs.humidity > 85 && inputs.leafWetness > 6) {
      diseases.push({
        name: 'botrytis',
        risk: 80,
        confidence: 0.7
      });
    }
    
    return { diseases };
  }
  
  private encodeCropType(crop: string): number {
    const types: Record<string, number> = {
      'lettuce': 0.2,
      'tomato': 0.4,
      'cannabis': 0.6,
      'herbs': 0.8
    };
    return types[crop.toLowerCase()] || 0.5;
  }
}

// Singleton instances
let yieldPredictor: BrowserYieldPredictor | null = null;
let diseasePredictor: BrowserDiseasePredictor | null = null;

export async function initializeBrowserML() {
  await setupBrowserML();
  
  yieldPredictor = new BrowserYieldPredictor();
  diseasePredictor = new BrowserDiseasePredictor();
  
  // Try to load models, fall back gracefully
  await yieldPredictor.loadModel();
  await diseasePredictor.loadModel();
  
  return { yieldPredictor, diseasePredictor };
}

// Export for easy use in components
export { yieldPredictor, diseasePredictor };