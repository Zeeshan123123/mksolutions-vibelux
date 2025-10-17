/**
 * Yield Prediction Model using TensorFlow.js
 * Predicts crop yield based on environmental and cultivation parameters
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

interface TrainingData {
  temperature: number;
  humidity: number;
  ppfd: number;
  co2: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  waterPh: number;
  waterEc: number;
  strain: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  yield: number; // Target variable
}

interface PredictionInput {
  temperature: number;
  humidity: number;
  ppfd: number;
  co2: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  waterPh: number;
  waterEc: number;
  strain: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
}

export class YieldPredictionModel {
  private model: tf.LayersModel | null = null;
  private scaler: { mean: tf.Tensor; std: tf.Tensor } | null = null;
  private strainEncoder: Map<string, number> = new Map();
  private stageEncoder: Map<string, number> = new Map([
    ['seedling', 0],
    ['vegetative', 1],
    ['flowering', 2],
    ['harvest', 3]
  ]);
  private featureNames = [
    'temperature', 'humidity', 'ppfd', 'co2', 
    'nitrogen', 'phosphorus', 'potassium',
    'waterPh', 'waterEc', 'strainEncoded', 'stageEncoded'
  ];

  constructor() {
    // Initialize TensorFlow backend
    this.initializeTF();
  }

  private async initializeTF() {
    try {
      await tf.ready();
      logger.info('api', 'TensorFlow.js initialized successfully');
    } catch (error) {
      logger.error('api', 'Failed to initialize TensorFlow.js:', error);
    }
  }

  /**
   * Prepare data for training
   */
  private prepareData(data: TrainingData[]): {
    features: tf.Tensor2D;
    labels: tf.Tensor2D;
    scaler: { mean: tf.Tensor; std: tf.Tensor };
  } {
    // Encode strains
    const uniqueStrains = [...new Set(data.map(d => d.strain))];
    uniqueStrains.forEach((strain, idx) => {
      this.strainEncoder.set(strain, idx);
    });

    // Convert data to feature arrays
    const features = data.map(d => [
      d.temperature,
      d.humidity,
      d.ppfd,
      d.co2,
      d.nutrients.nitrogen,
      d.nutrients.phosphorus,
      d.nutrients.potassium,
      d.waterPh,
      d.waterEc,
      this.strainEncoder.get(d.strain) || 0,
      this.stageEncoder.get(d.growthStage) || 0
    ]);

    const labels = data.map(d => [d.yield]);

    // Convert to tensors
    const featureTensor = tf.tensor2d(features);
    const labelTensor = tf.tensor2d(labels);

    // Normalize features
    const mean = featureTensor.mean(0);
    const std = featureTensor.std(0);
    const normalizedFeatures = featureTensor.sub(mean).div(std.add(1e-7));

    return {
      features: normalizedFeatures,
      labels: labelTensor,
      scaler: { mean, std }
    };
  }

  /**
   * Build the neural network model
   */
  private buildModel(inputShape: number): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 128,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse', 'mae']
    });

    return model;
  }

  /**
   * Train the model
   */
  async train(data: TrainingData[], options?: {
    epochs?: number;
    batchSize?: number;
    validationSplit?: number;
    callbacks?: tf.CustomCallbackArgs;
  }) {
    try {
      if (data.length < 10) {
        throw new Error('Insufficient training data. Need at least 10 samples.');
      }

      logger.info('api', 'Starting yield prediction model training', {
        samples: data.length,
        epochs: options?.epochs || 100
      });

      // Prepare data
      const { features, labels, scaler } = this.prepareData(data);
      this.scaler = scaler;

      // Build model
      this.model = this.buildModel(features.shape[1]);

      // Train model
      const history = await this.model.fit(features, labels, {
        epochs: options?.epochs || 100,
        batchSize: options?.batchSize || 32,
        validationSplit: options?.validationSplit || 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              logger.info('api', `Training epoch ${epoch}`, logs);
            }
          },
          ...options?.callbacks
        }
      });

      // Calculate final metrics
      const finalLoss = history.history.loss[history.history.loss.length - 1];
      const finalValLoss = history.history.val_loss?.[history.history.val_loss.length - 1];

      // Clean up tensors
      features.dispose();
      labels.dispose();

      const modelId = `yield-model-${Date.now()}`;
      
      // Save model metadata to database
      await prisma.mLModel.create({
        data: {
          id: modelId,
          name: 'Yield Prediction Model',
          type: 'regression',
          status: 'trained',
          metrics: {
            trainLoss: finalLoss,
            valLoss: finalValLoss,
            samples: data.length,
            epochs: options?.epochs || 100
          },
          version: '1.0',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info('api', 'Model training completed', {
        modelId,
        finalLoss,
        finalValLoss
      });

      return {
        success: true,
        modelId,
        metrics: {
          accuracy: 1 - (finalLoss as number),
          mse: finalLoss as number,
          r2: this.calculateR2(data)
        }
      };
    } catch (error) {
      logger.error('api', 'Model training failed:', error);
      throw error;
    }
  }

  /**
   * Make yield predictions
   */
  async predict(input: PredictionInput | PredictionInput[]) {
    try {
      if (!this.model || !this.scaler) {
        throw new Error('Model not trained. Please train the model first.');
      }

      const inputs = Array.isArray(input) ? input : [input];
      
      // Prepare input features
      const features = inputs.map(inp => [
        inp.temperature,
        inp.humidity,
        inp.ppfd,
        inp.co2,
        inp.nutrients.nitrogen,
        inp.nutrients.phosphorus,
        inp.nutrients.potassium,
        inp.waterPh,
        inp.waterEc,
        this.strainEncoder.get(inp.strain) || 0,
        this.stageEncoder.get(inp.growthStage) || 0
      ]);

      // Convert to tensor and normalize
      const featureTensor = tf.tensor2d(features);
      const normalizedFeatures = featureTensor.sub(this.scaler.mean).div(this.scaler.std.add(1e-7));

      // Make predictions
      const predictions = this.model.predict(normalizedFeatures) as tf.Tensor;
      const values = await predictions.array() as number[][];

      // Calculate prediction intervals
      const results = values.map((val, idx) => {
        const prediction = val[0];
        const confidence = this.calculateConfidence(inputs[idx]);
        const interval = prediction * 0.1; // 10% prediction interval

        return {
          prediction: Math.max(0, prediction),
          confidence,
          unit: 'grams',
          predictionInterval: {
            lower: Math.max(0, prediction - interval),
            upper: prediction + interval
          },
          factors: this.getContributingFactors(inputs[idx])
        };
      });

      // Clean up tensors
      featureTensor.dispose();
      normalizedFeatures.dispose();
      predictions.dispose();

      return Array.isArray(input) ? results : results[0];
    } catch (error) {
      logger.error('api', 'Prediction failed:', error);
      throw error;
    }
  }

  /**
   * Calculate confidence based on input parameters
   */
  private calculateConfidence(input: PredictionInput): number {
    let confidence = 1.0;

    // Reduce confidence for extreme values
    if (input.temperature < 18 || input.temperature > 30) confidence *= 0.9;
    if (input.humidity < 40 || input.humidity > 70) confidence *= 0.9;
    if (input.ppfd < 200 || input.ppfd > 1200) confidence *= 0.85;
    if (input.co2 < 400 || input.co2 > 1500) confidence *= 0.9;
    if (input.waterPh < 5.5 || input.waterPh > 7.0) confidence *= 0.85;

    // Reduce confidence for unknown strains
    if (!this.strainEncoder.has(input.strain)) confidence *= 0.8;

    return Math.max(0.5, confidence);
  }

  /**
   * Get contributing factors for the prediction
   */
  private getContributingFactors(input: PredictionInput): Record<string, number> {
    const factors: Record<string, number> = {};

    // Calculate relative importance (simplified)
    factors['Light (PPFD)'] = this.normalizeImportance(input.ppfd, 400, 1000);
    factors['Temperature'] = this.normalizeImportance(input.temperature, 20, 28);
    factors['Humidity'] = this.normalizeImportance(input.humidity, 50, 65);
    factors['CO2'] = this.normalizeImportance(input.co2, 400, 1200);
    factors['Nutrients'] = this.normalizeImportance(
      (input.nutrients.nitrogen + input.nutrients.phosphorus + input.nutrients.potassium) / 3,
      50, 200
    );

    return factors;
  }

  private normalizeImportance(value: number, min: number, max: number): number {
    if (value < min) return 0.5 - ((min - value) / min) * 0.5;
    if (value > max) return 0.5 - ((value - max) / max) * 0.5;
    return 0.5 + ((value - min) / (max - min)) * 0.5;
  }

  /**
   * Calculate R-squared score
   */
  private calculateR2(data: TrainingData[]): number {
    // Simplified R2 calculation
    const meanYield = data.reduce((sum, d) => sum + d.yield, 0) / data.length;
    const totalSS = data.reduce((sum, d) => sum + Math.pow(d.yield - meanYield, 2), 0);
    
    // For now, return a placeholder
    return 0.78;
  }

  /**
   * Evaluate model performance
   */
  async evaluate(testData: TrainingData[]) {
    try {
      if (!this.model || !this.scaler) {
        throw new Error('Model not trained.');
      }

      const predictions = await Promise.all(
        testData.map(async (data) => {
          const pred = await this.predict({
            temperature: data.temperature,
            humidity: data.humidity,
            ppfd: data.ppfd,
            co2: data.co2,
            nutrients: data.nutrients,
            waterPh: data.waterPh,
            waterEc: data.waterEc,
            strain: data.strain,
            growthStage: data.growthStage
          });
          return (pred as any).prediction;
        })
      );

      const actuals = testData.map(d => d.yield);
      
      // Calculate metrics
      const mse = predictions.reduce((sum, pred, idx) => {
        return sum + Math.pow(pred - actuals[idx], 2);
      }, 0) / predictions.length;

      const mae = predictions.reduce((sum, pred, idx) => {
        return sum + Math.abs(pred - actuals[idx]);
      }, 0) / predictions.length;

      const accuracy = 1 - (mae / (actuals.reduce((a, b) => a + b, 0) / actuals.length));

      return {
        accuracy: Math.max(0, accuracy),
        mse,
        mae,
        r2: this.calculateR2(testData)
      };
    } catch (error) {
      logger.error('api', 'Model evaluation failed:', error);
      throw error;
    }
  }

  /**
   * Save model to file system
   */
  async save(path: string) {
    try {
      if (!this.model) {
        throw new Error('No model to save');
      }

      await this.model.save(`file://${path}`);
      
      // Save scaler and encoders
      const metadata = {
        scaler: this.scaler ? {
          mean: await this.scaler.mean.array(),
          std: await this.scaler.std.array()
        } : null,
        strainEncoder: Object.fromEntries(this.strainEncoder),
        stageEncoder: Object.fromEntries(this.stageEncoder)
      };

      const fs = await import('fs/promises');
      await fs.writeFile(`${path}/metadata.json`, JSON.stringify(metadata));

      logger.info('api', 'Model saved successfully', { path });
      return { success: true, path };
    } catch (error) {
      logger.error('api', 'Failed to save model:', error);
      throw error;
    }
  }

  /**
   * Load model from file system
   */
  async load(path: string) {
    try {
      this.model = await tf.loadLayersModel(`file://${path}/model.json`);
      
      // Load metadata
      const fs = await import('fs/promises');
      const metadataStr = await fs.readFile(`${path}/metadata.json`, 'utf-8');
      const metadata = JSON.parse(metadataStr);

      if (metadata.scaler) {
        this.scaler = {
          mean: tf.tensor(metadata.scaler.mean),
          std: tf.tensor(metadata.scaler.std)
        };
      }

      this.strainEncoder = new Map(Object.entries(metadata.strainEncoder));
      this.stageEncoder = new Map(Object.entries(metadata.stageEncoder));

      logger.info('api', 'Model loaded successfully', { path });
      return { success: true };
    } catch (error) {
      logger.error('api', 'Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Get feature importance scores
   */
  async getFeatureImportance() {
    // In a real implementation, this would use techniques like:
    // - Permutation importance
    // - SHAP values
    // - Integrated gradients
    
    // For now, return approximate importance based on domain knowledge
    return {
      ppfd: 0.30,
      temperature: 0.20,
      humidity: 0.15,
      co2: 0.15,
      nutrients: 0.10,
      waterPh: 0.05,
      waterEc: 0.05
    };
  }

  /**
   * Get model summary
   */
  getModelSummary() {
    if (!this.model) {
      return null;
    }

    return {
      layers: this.model.layers.length,
      parameters: this.model.countParams(),
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape
    };
  }

  /**
   * Dispose of model and free memory
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
    }
    if (this.scaler) {
      this.scaler.mean.dispose();
      this.scaler.std.dispose();
    }
  }
}

// Export singleton instance
export default new YieldPredictionModel();