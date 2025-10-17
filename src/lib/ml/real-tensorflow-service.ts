/**
 * Real TensorFlow.js Machine Learning Service
 * Actual model training, persistence, and predictions - no fake data!
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '@/lib/logging/production-logger';
import prisma from '@/lib/prisma';
import { labIntegration } from '@/lib/lab-integration/lab-api-service';

export interface TrainingData {
  inputs: {
    // Environmental conditions
    avgTemperature: number;
    avgHumidity: number;
    avgCO2: number;
    avgPPFD: number;
    avgDLI: number;
    
    // Light spectrum (normalized 0-1)
    redSpectrum: number;
    blueSpectrum: number;
    greenSpectrum: number;
    farRedSpectrum: number;
    uvSpectrum: number;
    
    // Nutrients
    ecLevel: number;
    phLevel: number;
    nitrogenPPM: number;
    phosphorusPPM: number;
    potassiumPPM: number;
    
    // Growing parameters
    vegetativeDays: number;
    floweringDays: number;
    strainGeneticsIndex: number; // Encoded strain type
  };
  
  outputs: {
    // What we're predicting
    thcPercentage?: number;
    cbdPercentage?: number;
    totalCannabinoids?: number;
    totalTerpenes?: number;
    yieldGramsPerSqM?: number;
    
    // For vegetables/fruits
    vitaminC?: number;
    sugarContent?: number;
    shelfLife?: number;
  };
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  type: 'regression' | 'classification';
  inputShape: number[];
  outputShape: number[];
  metrics: {
    loss: number;
    mae?: number;
    mse?: number;
    accuracy?: number;
    r2Score?: number;
  };
  trainingSamples: number;
  createdAt: Date;
  updatedAt: Date;
}

class RealTensorFlowService {
  private models: Map<string, tf.LayersModel> = new Map();
  private modelMetadata: Map<string, ModelMetadata> = new Map();
  
  constructor() {
    this.initializeTensorFlow();
  }
  
  private async initializeTensorFlow() {
    // Set backend
    await tf.setBackend('webgl'); // Use GPU acceleration if available
    await tf.ready();
    
    logger.info('TensorFlow.js initialized with backend:', tf.getBackend());
    
    // Load existing models from database
    await this.loadPersistedModels();
  }
  
  /**
   * Train a real neural network model with actual data
   */
  async trainModel(
    modelName: string,
    trainingData: TrainingData[],
    options: {
      epochs?: number;
      batchSize?: number;
      validationSplit?: number;
      learningRate?: number;
      modelType?: 'cannabinoid' | 'yield' | 'nutrient';
    } = {}
  ): Promise<ModelMetadata> {
    const {
      epochs = 100,
      batchSize = 32,
      validationSplit = 0.2,
      learningRate = 0.001,
      modelType = 'cannabinoid'
    } = options;
    
    logger.info(`Starting REAL model training for ${modelName} with ${trainingData.length} samples`);
    
    if (trainingData.length < 10) {
      throw new Error('Insufficient training data. Need at least 10 samples.');
    }
    
    // Prepare data tensors
    const { xTensor, yTensor, inputShape, outputShape } = this.prepareTrainingData(trainingData, modelType);
    
    try {
      // Create model architecture
      const model = this.createModelArchitecture(inputShape[0], outputShape[0], modelType);
      
      // Compile model
      model.compile({
        optimizer: tf.train.adam(learningRate),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });
      
      // Train model
      const history = await model.fit(xTensor, yTensor, {
        epochs,
        batchSize,
        validationSplit,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              logger.info(`Epoch ${epoch}: loss=${logs?.loss?.toFixed(4)}, val_loss=${logs?.val_loss?.toFixed(4)}`);
            }
          }
        }
      });
      
      // Calculate R² score on validation data
      const r2Score = await this.calculateR2Score(model, xTensor, yTensor, validationSplit);
      
      // Save model to IndexedDB and database
      const metadata: ModelMetadata = {
        id: `model-${Date.now()}`,
        name: modelName,
        version: '1.0.0',
        type: 'regression',
        inputShape,
        outputShape,
        metrics: {
          loss: history.history.loss[history.history.loss.length - 1] as number,
          mae: history.history.mae ? history.history.mae[history.history.mae.length - 1] as number : undefined,
          mse: history.history.loss[history.history.loss.length - 1] as number,
          r2Score
        },
        trainingSamples: trainingData.length,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store model
      await this.saveModel(model, metadata);
      
      // Store in memory
      this.models.set(modelName, model);
      this.modelMetadata.set(modelName, metadata);
      
      // Clean up tensors
      xTensor.dispose();
      yTensor.dispose();
      
      logger.info(`Model ${modelName} trained successfully! R² Score: ${r2Score.toFixed(3)}`);
      
      return metadata;
      
    } catch (error) {
      logger.error('Model training failed:', error);
      xTensor.dispose();
      yTensor.dispose();
      throw error;
    }
  }
  
  /**
   * Make predictions using trained model
   */
  async predict(
    modelName: string,
    input: TrainingData['inputs']
  ): Promise<TrainingData['outputs']> {
    const model = this.models.get(modelName);
    const metadata = this.modelMetadata.get(modelName);
    
    if (!model || !metadata) {
      throw new Error(`Model ${modelName} not found. Please train it first.`);
    }
    
    // Prepare input tensor
    const inputArray = this.inputToArray(input);
    const inputTensor = tf.tensor2d([inputArray]);
    
    try {
      // Make prediction
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const values = await prediction.array() as number[][];
      
      // Clean up
      inputTensor.dispose();
      prediction.dispose();
      
      // Map predictions to output structure
      const result = values[0];
      
      // Return based on what this model predicts
      if (modelName.includes('cannabinoid')) {
        return {
          thcPercentage: result[0],
          cbdPercentage: result[1] || 0,
          totalCannabinoids: result[2] || result[0] + (result[1] || 0),
          totalTerpenes: result[3] || 0
        };
      } else if (modelName.includes('yield')) {
        return {
          yieldGramsPerSqM: result[0]
        };
      } else if (modelName.includes('nutrient')) {
        return {
          vitaminC: result[0] || 0,
          sugarContent: result[1] || 0,
          shelfLife: result[2] || 0
        };
      }
      
      return {};
      
    } catch (error) {
      logger.error('Prediction failed:', error);
      inputTensor.dispose();
      throw error;
    }
  }
  
  /**
   * Create neural network architecture
   */
  private createModelArchitecture(
    inputSize: number,
    outputSize: number,
    modelType: string
  ): tf.Sequential {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [inputSize],
      kernelInitializer: 'heNormal'
    }));
    
    // Batch normalization
    model.add(tf.layers.batchNormalization());
    
    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Hidden layers
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));
    
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));
    
    // Output layer
    model.add(tf.layers.dense({
      units: outputSize,
      activation: modelType === 'cannabinoid' ? 'sigmoid' : 'linear' // Sigmoid for percentages
    }));
    
    return model;
  }
  
  /**
   * Prepare training data for TensorFlow
   */
  private prepareTrainingData(
    data: TrainingData[],
    modelType: string
  ): {
    xTensor: tf.Tensor;
    yTensor: tf.Tensor;
    inputShape: number[];
    outputShape: number[];
  } {
    // Convert to arrays
    const inputs = data.map(d => this.inputToArray(d.inputs));
    const outputs = data.map(d => this.outputToArray(d.outputs, modelType));
    
    // Normalize inputs (important for neural networks)
    const normalizedInputs = this.normalizeData(inputs);
    
    // Normalize outputs if they're percentages
    const normalizedOutputs = modelType === 'cannabinoid' 
      ? outputs.map(row => row.map(val => val / 100)) // Convert percentages to 0-1
      : outputs;
    
    // Create tensors
    const xTensor = tf.tensor2d(normalizedInputs);
    const yTensor = tf.tensor2d(normalizedOutputs);
    
    return {
      xTensor,
      yTensor,
      inputShape: [inputs[0].length],
      outputShape: [outputs[0].length]
    };
  }
  
  /**
   * Convert input object to array
   */
  private inputToArray(input: TrainingData['inputs']): number[] {
    return [
      input.avgTemperature,
      input.avgHumidity,
      input.avgCO2,
      input.avgPPFD,
      input.avgDLI,
      input.redSpectrum,
      input.blueSpectrum,
      input.greenSpectrum,
      input.farRedSpectrum,
      input.uvSpectrum,
      input.ecLevel,
      input.phLevel,
      input.nitrogenPPM,
      input.phosphorusPPM,
      input.potassiumPPM,
      input.vegetativeDays,
      input.floweringDays,
      input.strainGeneticsIndex
    ];
  }
  
  /**
   * Convert output object to array
   */
  private outputToArray(output: TrainingData['outputs'], modelType: string): number[] {
    if (modelType === 'cannabinoid') {
      return [
        output.thcPercentage || 0,
        output.cbdPercentage || 0,
        output.totalCannabinoids || 0,
        output.totalTerpenes || 0
      ];
    } else if (modelType === 'yield') {
      return [output.yieldGramsPerSqM || 0];
    } else if (modelType === 'nutrient') {
      return [
        output.vitaminC || 0,
        output.sugarContent || 0,
        output.shelfLife || 0
      ];
    }
    
    return [0];
  }
  
  /**
   * Normalize data to 0-1 range
   */
  private normalizeData(data: number[][]): number[][] {
    const mins: number[] = [];
    const maxs: number[] = [];
    
    // Find min and max for each feature
    for (let i = 0; i < data[0].length; i++) {
      const column = data.map(row => row[i]);
      mins.push(Math.min(...column));
      maxs.push(Math.max(...column));
    }
    
    // Normalize
    return data.map(row => 
      row.map((val, i) => {
        const range = maxs[i] - mins[i];
        return range > 0 ? (val - mins[i]) / range : 0;
      })
    );
  }
  
  /**
   * Calculate R² score for model evaluation
   */
  private async calculateR2Score(
    model: tf.LayersModel,
    xTensor: tf.Tensor,
    yTensor: tf.Tensor,
    validationSplit: number
  ): Promise<number> {
    const totalSamples = xTensor.shape[0];
    const trainSamples = Math.floor(totalSamples * (1 - validationSplit));
    
    // Get validation data
    const xVal = xTensor.slice([trainSamples, 0], [-1, -1]);
    const yVal = yTensor.slice([trainSamples, 0], [-1, -1]);
    
    // Make predictions
    const predictions = model.predict(xVal) as tf.Tensor;
    
    // Calculate R²
    const yValArray = await yVal.array() as number[][];
    const predArray = await predictions.array() as number[][];
    
    const yMean = yValArray.reduce((sum, row) => sum + row[0], 0) / yValArray.length;
    
    const ssTotal = yValArray.reduce((sum, row) => sum + Math.pow(row[0] - yMean, 2), 0);
    const ssResidual = yValArray.reduce((sum, row, i) => sum + Math.pow(row[0] - predArray[i][0], 2), 0);
    
    const r2 = 1 - (ssResidual / ssTotal);
    
    // Clean up
    xVal.dispose();
    yVal.dispose();
    predictions.dispose();
    
    return r2;
  }
  
  /**
   * Save model to IndexedDB and database
   */
  private async saveModel(model: tf.LayersModel, metadata: ModelMetadata): Promise<void> {
    try {
      // Save to IndexedDB
      await model.save(`indexeddb://${metadata.name}`);
      
      // Save metadata to database
      await prisma.mLModel.create({
        data: {
          name: metadata.name,
          version: metadata.version,
          type: metadata.type,
          inputShape: metadata.inputShape,
          outputShape: metadata.outputShape,
          metrics: metadata.metrics,
          trainingSamples: metadata.trainingSamples,
          modelData: {
            // Store model architecture as JSON
            architecture: model.toJSON()
          }
        }
      });
      
      logger.info(`Model ${metadata.name} saved successfully`);
    } catch (error) {
      logger.error('Failed to save model:', error);
      throw error;
    }
  }
  
  /**
   * Load persisted models from database
   */
  private async loadPersistedModels(): Promise<void> {
    try {
      const models = await prisma.mLModel.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      for (const modelRecord of models) {
        try {
          // Load from IndexedDB
          const model = await tf.loadLayersModel(`indexeddb://${modelRecord.name}`);
          
          const metadata: ModelMetadata = {
            id: modelRecord.id,
            name: modelRecord.name,
            version: modelRecord.version,
            type: modelRecord.type as 'regression' | 'classification',
            inputShape: modelRecord.inputShape as number[],
            outputShape: modelRecord.outputShape as number[],
            metrics: modelRecord.metrics as any,
            trainingSamples: modelRecord.trainingSamples,
            createdAt: modelRecord.createdAt,
            updatedAt: modelRecord.updatedAt
          };
          
          this.models.set(modelRecord.name, model);
          this.modelMetadata.set(modelRecord.name, metadata);
          
          logger.info(`Loaded model: ${modelRecord.name}`);
        } catch (error) {
          logger.warn(`Failed to load model ${modelRecord.name}:`, error);
        }
      }
      
      logger.info(`Loaded ${this.models.size} models from storage`);
    } catch (error) {
      logger.error('Failed to load persisted models:', error);
    }
  }
  
  /**
   * Retrain model with new data (continuous learning)
   */
  async retrainModel(
    modelName: string,
    newData: TrainingData[],
    options: {
      epochs?: number;
      preserveOldWeights?: boolean;
    } = {}
  ): Promise<ModelMetadata> {
    const existingModel = this.models.get(modelName);
    const existingMetadata = this.modelMetadata.get(modelName);
    
    if (!existingModel || !existingMetadata) {
      // No existing model, train from scratch
      return this.trainModel(modelName, newData, options);
    }
    
    logger.info(`Retraining model ${modelName} with ${newData.length} new samples`);
    
    const { epochs = 20, preserveOldWeights = true } = options;
    
    // Prepare new data
    const { xTensor, yTensor } = this.prepareTrainingData(
      newData, 
      modelName.includes('cannabinoid') ? 'cannabinoid' : 'yield'
    );
    
    try {
      // If preserving old weights, use transfer learning
      if (preserveOldWeights) {
        // Fine-tune existing model with new data
        const history = await existingModel.fit(xTensor, yTensor, {
          epochs,
          batchSize: 16,
          validationSplit: 0.2,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              logger.info(`Retraining epoch ${epoch}: loss=${logs?.loss?.toFixed(4)}`);
            }
          }
        });
        
        // Update metadata
        existingMetadata.metrics.loss = history.history.loss[history.history.loss.length - 1] as number;
        existingMetadata.trainingSamples += newData.length;
        existingMetadata.updatedAt = new Date();
        
        // Save updated model
        await this.saveModel(existingModel, existingMetadata);
      } else {
        // Train from scratch with combined data
        return this.trainModel(modelName, newData, { epochs });
      }
      
      // Clean up
      xTensor.dispose();
      yTensor.dispose();
      
      return existingMetadata;
      
    } catch (error) {
      logger.error('Model retraining failed:', error);
      xTensor.dispose();
      yTensor.dispose();
      throw error;
    }
  }
  
  /**
   * Get model performance metrics
   */
  getModelMetrics(modelName: string): ModelMetadata | null {
    return this.modelMetadata.get(modelName) || null;
  }
  
  /**
   * List all available models
   */
  listModels(): ModelMetadata[] {
    return Array.from(this.modelMetadata.values());
  }
  
  /**
   * Delete a model
   */
  async deleteModel(modelName: string): Promise<void> {
    const model = this.models.get(modelName);
    
    if (model) {
      model.dispose();
      this.models.delete(modelName);
      this.modelMetadata.delete(modelName);
      
      // Remove from IndexedDB
      await tf.io.removeModel(`indexeddb://${modelName}`);
      
      // Remove from database
      await prisma.mLModel.deleteMany({
        where: { name: modelName }
      });
      
      logger.info(`Model ${modelName} deleted`);
    }
  }
}

// Export singleton instance
export const tensorflowService = new RealTensorFlowService();