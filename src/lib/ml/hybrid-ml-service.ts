/**
 * Hybrid ML Architecture Service
 * Implements dual processing: client-side for instant UX + server-side for platform intelligence
 * 
 * Key principle: All data flows to server for platform learning while client provides instant feedback
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '@/lib/logging/production-logger';

// ML Model configurations
interface ModelConfig {
  name: string;
  clientModel?: string; // Path to lightweight client model
  serverEndpoint: string; // Server endpoint for full analysis
  confidence: number; // Minimum confidence threshold
  cacheTimeout: number; // Cache timeout in ms
}

// Prediction interfaces
interface ClientPrediction {
  confidence: number;
  prediction: any;
  processingTime: number;
  isPreview: boolean;
}

interface ServerAnalysis {
  detailed: any;
  benchmarking: any;
  platformInsights: any;
  processingTime: number;
  modelVersion: string;
}

interface HybridResult {
  instant: ClientPrediction;
  detailed: ServerAnalysis;
  combined: any;
}

// Model configurations for different use cases
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  plantHealth: {
    name: 'Plant Health Analysis',
    clientModel: '/models/plant-health-light.json',
    serverEndpoint: '/api/ml/plant-health-analysis',
    confidence: 0.7,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  },
  yieldPrediction: {
    name: 'Yield Prediction',
    clientModel: '/models/yield-preview.json',
    serverEndpoint: '/api/ml/yield-prediction',
    confidence: 0.65,
    cacheTimeout: 15 * 60 * 1000 // 15 minutes
  },
  diseaseDetection: {
    name: 'Disease Detection',
    clientModel: '/models/disease-quick.json',
    serverEndpoint: '/api/ml/disease-detection',
    confidence: 0.8,
    cacheTimeout: 2 * 60 * 1000 // 2 minutes
  },
  energyOptimization: {
    name: 'Energy Optimization',
    clientModel: undefined, // Server-only for cross-customer analysis
    serverEndpoint: '/api/ml/energy-optimization',
    confidence: 0.75,
    cacheTimeout: 30 * 60 * 1000 // 30 minutes
  },
  recipeOptimization: {
    name: 'Recipe Optimization',
    clientModel: undefined, // Server-only for platform learning
    serverEndpoint: '/api/ml/recipe-optimization',
    confidence: 0.7,
    cacheTimeout: 60 * 60 * 1000 // 1 hour
  }
};

export class HybridMLService {
  private clientModels: Map<string, tf.LayersModel> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private loadingPromises: Map<string, Promise<tf.LayersModel>> = new Map();

  constructor() {
    this.initializeClientModels();
    this.startCacheCleanup();
  }

  /**
   * Perform hybrid analysis with instant client feedback + detailed server analysis
   */
  async analyzeHybrid(
    modelType: keyof typeof MODEL_CONFIGS,
    input: any,
    options: {
      userId?: string;
      facilityId?: string;
      skipClientPreview?: boolean;
      skipServerAnalysis?: boolean;
    } = {}
  ): Promise<HybridResult> {
    const config = MODEL_CONFIGS[modelType];
    if (!config) {
      throw new Error(`Unknown model type: ${modelType}`);
    }

    const startTime = performance.now();
    let clientPrediction: ClientPrediction | null = null;
    let serverAnalysis: ServerAnalysis | null = null;

    // Step 1: Instant client-side preview (if available and not skipped)
    if (!options.skipClientPreview && config.clientModel) {
      try {
        clientPrediction = await this.getClientPrediction(modelType, input);
        
        // Show instant results to user immediately
        this.emitInstantResults(modelType, clientPrediction, options);
      } catch (error) {
        logger.warn('api', `Client prediction failed for ${modelType}:`, error);
      }
    }

    // Step 2: Detailed server-side analysis (always runs for platform intelligence)
    if (!options.skipServerAnalysis) {
      try {
        serverAnalysis = await this.getServerAnalysis(modelType, input, {
          ...options,
          hasClientPreview: !!clientPrediction
        });

        // Update platform intelligence databases
        this.updatePlatformIntelligence(modelType, input, serverAnalysis, options);
      } catch (error) {
        logger.error('api', `Server analysis failed for ${modelType}:`, error);
      }
    }

    // Step 3: Combine results for enhanced user experience
    const combinedResult = this.combineResults(clientPrediction, serverAnalysis);

    const totalTime = performance.now() - startTime;
    logger.info('api', `Hybrid ML analysis completed`, {
      modelType,
      totalTime: `${totalTime.toFixed(2)}ms`,
      hasClientResult: !!clientPrediction,
      hasServerResult: !!serverAnalysis,
      userId: options.userId,
      facilityId: options.facilityId
    });

    return {
      instant: clientPrediction!,
      detailed: serverAnalysis!,
      combined: combinedResult
    };
  }

  /**
   * Get instant client-side prediction for immediate UI feedback
   */
  private async getClientPrediction(
    modelType: keyof typeof MODEL_CONFIGS,
    input: any
  ): Promise<ClientPrediction> {
    const startTime = performance.now();
    const model = await this.getClientModel(modelType);
    
    if (!model) {
      throw new Error(`Client model not available for ${modelType}`);
    }

    // Preprocess input for client model
    const processedInput = this.preprocessForClient(input, modelType);
    
    // Run prediction
    const prediction = model.predict(processedInput) as tf.Tensor;
    const result = await prediction.data();
    
    // Clean up tensors
    prediction.dispose();
    if (processedInput !== input) {
      processedInput.dispose();
    }

    const processingTime = performance.now() - startTime;

    return {
      confidence: this.calculateConfidence(result, modelType),
      prediction: this.formatClientResult(result, modelType),
      processingTime,
      isPreview: true
    };
  }

  /**
   * Get detailed server-side analysis with platform intelligence
   */
  private async getServerAnalysis(
    modelType: keyof typeof MODEL_CONFIGS,
    input: any,
    options: any
  ): Promise<ServerAnalysis> {
    const config = MODEL_CONFIGS[modelType];
    const cacheKey = this.generateCacheKey(modelType, input, options);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const startTime = performance.now();
    
    try {
      const response = await fetch(config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          options,
          modelType,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Server analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = performance.now() - startTime;

      const serverAnalysis: ServerAnalysis = {
        detailed: result.detailed,
        benchmarking: result.benchmarking,
        platformInsights: result.platformInsights,
        processingTime,
        modelVersion: result.modelVersion
      };

      // Cache result
      this.setCache(cacheKey, serverAnalysis, config.cacheTimeout);

      return serverAnalysis;
    } catch (error) {
      logger.error('api', `Server analysis error for ${modelType}:`, error);
      throw error;
    }
  }

  /**
   * Initialize client-side models for instant feedback
   */
  private async initializeClientModels(): Promise<void> {
    for (const [modelType, config] of Object.entries(MODEL_CONFIGS)) {
      if (config.clientModel) {
        try {
          // Load model asynchronously
          const loadPromise = tf.loadLayersModel(config.clientModel);
          this.loadingPromises.set(modelType, loadPromise);
          
          loadPromise.then(model => {
            this.clientModels.set(modelType, model);
            logger.info('api', `Client model loaded: ${modelType}`);
          }).catch(error => {
            logger.warn('api', `Failed to load client model ${modelType}:`, error);
          });
        } catch (error) {
          logger.warn('api', `Error initializing client model ${modelType}:`, error);
        }
      }
    }
  }

  /**
   * Get client model, loading if necessary
   */
  private async getClientModel(modelType: string): Promise<tf.LayersModel | null> {
    // Return cached model if available
    if (this.clientModels.has(modelType)) {
      return this.clientModels.get(modelType)!;
    }

    // Wait for loading if in progress
    if (this.loadingPromises.has(modelType)) {
      try {
        const model = await this.loadingPromises.get(modelType)!;
        this.clientModels.set(modelType, model);
        return model;
      } catch (error) {
        this.loadingPromises.delete(modelType);
        return null;
      }
    }

    return null;
  }

  /**
   * Preprocess input for client-side model
   */
  private preprocessForClient(input: any, modelType: string): tf.Tensor {
    switch (modelType) {
      case 'plantHealth':
        // Resize image and normalize for plant health model
        if (input instanceof ImageData || input.data) {
          return tf.browser.fromPixels(input)
            .resizeNearestNeighbor([224, 224])
            .expandDims(0)
            .div(255.0);
        }
        break;
      
      case 'diseaseDetection':
        // Similar to plant health but different size
        if (input instanceof ImageData || input.data) {
          return tf.browser.fromPixels(input)
            .resizeNearestNeighbor([128, 128])
            .expandDims(0)
            .div(255.0);
        }
        break;

      case 'yieldPrediction':
        // Convert sensor data to tensor
        if (Array.isArray(input)) {
          return tf.tensor2d([input]);
        }
        break;
    }

    // Fallback - try to convert to tensor
    return tf.tensor(input);
  }

  /**
   * Format client result for UI display
   */
  private formatClientResult(result: Float32Array | Int32Array | Uint8Array, modelType: string): any {
    switch (modelType) {
      case 'plantHealth':
        return {
          healthScore: result[0],
          status: result[0] > 0.7 ? 'healthy' : result[0] > 0.4 ? 'moderate' : 'poor',
          isPreview: true
        };
      
      case 'diseaseDetection':
        const diseaseNames = ['healthy', 'powdery_mildew', 'downy_mildew', 'leaf_spot', 'blight'];
        const maxIndex = result.indexOf(Math.max(...Array.from(result)));
        return {
          disease: diseaseNames[maxIndex] || 'unknown',
          confidence: result[maxIndex],
          isPreview: true
        };

      case 'yieldPrediction':
        return {
          estimatedYield: result[0],
          unit: 'kg',
          isPreview: true
        };

      default:
        return { result: Array.from(result), isPreview: true };
    }
  }

  /**
   * Calculate confidence score for client prediction
   */
  private calculateConfidence(result: Float32Array | Int32Array | Uint8Array, modelType: string): number {
    if (result.length === 1) {
      return Math.abs(result[0]);
    }
    
    // For classification, return max probability
    return Math.max(...Array.from(result));
  }

  /**
   * Combine client and server results for enhanced experience
   */
  private combineResults(client: ClientPrediction | null, server: ServerAnalysis | null): any {
    if (!client && !server) {
      return null;
    }

    if (!server) {
      return { ...client, enhanced: false };
    }

    if (!client) {
      return { ...server.detailed, enhanced: true };
    }

    // Combine both results
    return {
      immediate: client.prediction,
      detailed: server.detailed,
      benchmarking: server.benchmarking,
      platformInsights: server.platformInsights,
      enhanced: true,
      processingTimes: {
        client: client.processingTime,
        server: server.processingTime
      }
    };
  }

  /**
   * Emit instant results for UI updates
   */
  private emitInstantResults(
    modelType: string,
    prediction: ClientPrediction,
    options: any
  ): void {
    // Emit to any listening components
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('ml-instant-result', {
        detail: {
          modelType,
          prediction,
          options,
          timestamp: Date.now()
        }
      }));
    }
  }

  /**
   * Update platform intelligence databases (crucial for competitive advantage)
   */
  private async updatePlatformIntelligence(
    modelType: string,
    input: any,
    analysis: ServerAnalysis,
    options: any
  ): Promise<void> {
    // This is critical - all data must flow to platform learning
    try {
      await fetch('/api/ml/platform-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelType,
          input: this.sanitizeInput(input), // Remove PII but keep patterns
          analysis: analysis.detailed,
          benchmarking: analysis.benchmarking,
          userId: options.userId,
          facilityId: options.facilityId,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      logger.error('api', 'Failed to update platform intelligence:', error);
      // Don't throw - this shouldn't break user experience
    }
  }

  /**
   * Sanitize input data for platform learning (remove PII, keep patterns)
   */
  private sanitizeInput(input: any): any {
    if (typeof input === 'object' && input !== null) {
      const sanitized = { ...input };
      
      // Remove potentially identifying information
      delete sanitized.userId;
      delete sanitized.facilityName;
      delete sanitized.userEmail;
      delete sanitized.location; // Keep region but not exact coordinates
      
      return sanitized;
    }
    
    return input;
  }

  /**
   * Cache management
   */
  private generateCacheKey(modelType: string, input: any, options: any): string {
    const inputHash = this.hashInput(input);
    const optionsHash = this.hashInput(options);
    return `${modelType}:${inputHash}:${optionsHash}`;
  }

  private hashInput(input: any): string {
    // Simple hash for caching - in production use crypto.subtle
    return btoa(JSON.stringify(input)).slice(0, 16);
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.data.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, timeout: number): void {
    this.cache.set(key, {
      data: { ...data, cacheTimeout: timeout },
      timestamp: Date.now()
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > cached.data.cacheTimeout) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
  }

  /**
   * Server-only analysis for features that require platform intelligence
   */
  async serverOnlyAnalysis(
    modelType: 'energyOptimization' | 'recipeOptimization',
    input: any,
    options: any = {}
  ): Promise<ServerAnalysis> {
    const config = MODEL_CONFIGS[modelType];
    if (config.clientModel) {
      throw new Error(`${modelType} should use hybrid analysis`);
    }

    return this.getServerAnalysis(modelType, input, options);
  }

  /**
   * Get available models and their capabilities
   */
  getAvailableModels(): Record<string, { hasClient: boolean; hasServer: boolean; capabilities: string[] }> {
    const models: Record<string, any> = {};
    
    for (const [key, config] of Object.entries(MODEL_CONFIGS)) {
      models[key] = {
        hasClient: !!config.clientModel,
        hasServer: true,
        capabilities: this.getModelCapabilities(key)
      };
    }

    return models;
  }

  private getModelCapabilities(modelType: string): string[] {
    const capabilities: Record<string, string[]> = {
      plantHealth: ['instant_preview', 'health_scoring', 'benchmarking', 'trend_analysis'],
      yieldPrediction: ['instant_estimate', 'seasonal_patterns', 'cross_facility_comparison'],
      diseaseDetection: ['instant_detection', 'disease_classification', 'outbreak_tracking'],
      energyOptimization: ['cross_customer_analysis', 'utility_integration', 'demand_forecasting'],
      recipeOptimization: ['platform_learning', 'success_rate_analysis', 'regional_optimization']
    };

    return capabilities[modelType] || ['analysis'];
  }
}

// Export singleton instance
export const hybridML = new HybridMLService();

// Export types for use in components
export type {
  ClientPrediction,
  ServerAnalysis, 
  HybridResult
};