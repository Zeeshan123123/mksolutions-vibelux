// Machine Learning Model Training Service for Predictive Maintenance
import { Equipment } from '@/types';

export interface TrainingData {
  timestamp: Date;
  equipmentId: string;
  sensorData: {
    temperature: number;
    vibration: number;
    current: number;
    runtime: number;
    efficiency: number;
  };
  maintenanceEvents: {
    type: 'preventive' | 'corrective' | 'failure';
    date: Date;
    component?: string;
    cost?: number;
  }[];
  environmentalFactors: {
    ambientTemp: number;
    humidity: number;
    dustLevel: number;
  };
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number; // Mean Squared Error for regression
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface TrainingResult {
  modelId: string;
  version: string;
  trainedAt: Date;
  metrics: ModelMetrics;
  parameters: ModelParameters;
  validationResults: ValidationResult[];
}

export interface ModelParameters {
  algorithm: 'random-forest' | 'gradient-boosting' | 'neural-network' | 'lstm';
  features: string[];
  hyperparameters: Record<string, any>;
  trainingDataSize: number;
  validationSplit: number;
}

export interface ValidationResult {
  equipmentId: string;
  actualFailureDate?: Date;
  predictedFailureDate: Date;
  confidenceScore: number;
  error: number; // Days difference
}

export class MLTrainingService {
  private models: Map<string, TrainingResult> = new Map();

  // Train a new predictive model
  async trainModel(
    trainingData: TrainingData[],
    parameters: Partial<ModelParameters> = {}
  ): Promise<TrainingResult> {
    // Validate training data
    this.validateTrainingData(trainingData);

    // Extract features
    const features = this.extractFeatures(trainingData);
    
    // Split data for training and validation
    const { trainSet, validSet } = this.splitData(features, parameters.validationSplit || 0.2);
    
    // Train the model based on selected algorithm
    const algorithm = parameters.algorithm || 'gradient-boosting';
    const model = await this.trainAlgorithm(algorithm, trainSet, parameters.hyperparameters);
    
    // Validate the model
    const validationResults = this.validateModel(model, validSet);
    
    // Calculate metrics
    const metrics = this.calculateMetrics(validationResults);
    
    // Save the model
    const result: TrainingResult = {
      modelId: this.generateModelId(),
      version: this.generateVersion(),
      trainedAt: new Date(),
      metrics,
      parameters: {
        algorithm,
        features: this.getFeatureNames(),
        hyperparameters: parameters.hyperparameters || this.getDefaultHyperparameters(algorithm),
        trainingDataSize: trainSet.length,
        validationSplit: parameters.validationSplit || 0.2
      },
      validationResults
    };
    
    this.models.set(result.modelId, result);
    
    return result;
  }

  // Incremental learning - update existing model with new data
  async updateModel(
    modelId: string,
    newData: TrainingData[]
  ): Promise<TrainingResult> {
    const existingModel = this.models.get(modelId);
    if (!existingModel) {
      throw new Error('Model not found');
    }

    // Implement incremental learning logic
    // This would typically use online learning algorithms
    const updatedModel = await this.performIncrementalLearning(existingModel, newData);
    
    return updatedModel;
  }

  // Get model performance over time
  getModelPerformanceHistory(modelId: string): {
    date: Date;
    accuracy: number;
    predictions: number;
    failures: number;
  }[] {
    // In production, this would query from a database
    const mockHistory = [];
    const model = this.models.get(modelId);
    
    if (!model) return [];
    
    // Generate mock historical performance data
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      mockHistory.push({
        date,
        accuracy: model.metrics.accuracy + (Math.random() - 0.5) * 0.1,
        predictions: Math.floor(Math.random() * 50) + 20,
        failures: Math.floor(Math.random() * 5)
      });
    }
    
    return mockHistory;
  }

  // Feature extraction from raw sensor data
  private extractFeatures(data: TrainingData[]): any[] {
    return data.map(record => {
      const features = {
        // Time-based features
        age_days: this.calculateEquipmentAge(record.equipmentId),
        runtime_hours: record.sensorData.runtime,
        runtime_squared: Math.pow(record.sensorData.runtime, 2), // Non-linear degradation
        
        // Sensor features
        temp_avg: record.sensorData.temperature,
        temp_std: this.calculateStandardDeviation(record.equipmentId, 'temperature'),
        temp_trend: this.calculateTrend(record.equipmentId, 'temperature'),
        
        vibration_avg: record.sensorData.vibration,
        vibration_max: this.getMaxValue(record.equipmentId, 'vibration'),
        vibration_trend: this.calculateTrend(record.equipmentId, 'vibration'),
        
        current_avg: record.sensorData.current,
        current_variance: this.calculateVariance(record.equipmentId, 'current'),
        
        efficiency_drop: 100 - record.sensorData.efficiency,
        efficiency_trend: this.calculateTrend(record.equipmentId, 'efficiency'),
        
        // Maintenance history features
        days_since_last_maintenance: this.daysSinceLastMaintenance(record),
        maintenance_frequency: this.getMaintenanceFrequency(record.equipmentId),
        failure_count: this.getFailureCount(record.equipmentId),
        
        // Environmental features
        ambient_temp_delta: record.sensorData.temperature - record.environmentalFactors.ambientTemp,
        humidity_impact: record.environmentalFactors.humidity > 70 ? 1 : 0,
        dust_level_category: this.categorizeDustLevel(record.environmentalFactors.dustLevel),
        
        // Interaction features
        temp_vibration_interaction: record.sensorData.temperature * record.sensorData.vibration,
        runtime_efficiency_ratio: record.sensorData.runtime / (record.sensorData.efficiency + 1),
        
        // Target variable (for supervised learning)
        days_to_failure: this.calculateDaysToNextFailure(record)
      };
      
      return features;
    });
  }

  // Advanced feature engineering methods
  private calculateTrend(equipmentId: string, metric: string): number {
    // Calculate linear regression slope for the metric over time
    // In production, this would use actual historical data
    return (Math.random() - 0.5) * 0.1;
  }

  private calculateStandardDeviation(equipmentId: string, metric: string): number {
    // Calculate std dev from historical data
    return Math.random() * 5 + 2;
  }

  private calculateVariance(equipmentId: string, metric: string): number {
    return Math.pow(this.calculateStandardDeviation(equipmentId, metric), 2);
  }

  private getMaxValue(equipmentId: string, metric: string): number {
    // Get max value from historical data
    return Math.random() * 100 + 50;
  }

  // Model training algorithms
  private async trainAlgorithm(
    algorithm: string,
    trainSet: any[],
    hyperparameters?: Record<string, any>
  ): Promise<any> {
    switch (algorithm) {
      case 'gradient-boosting':
        return this.trainGradientBoosting(trainSet, hyperparameters);
      case 'neural-network':
        return this.trainNeuralNetwork(trainSet, hyperparameters);
      case 'lstm':
        return this.trainLSTM(trainSet, hyperparameters);
      default:
        return this.trainRandomForest(trainSet, hyperparameters);
    }
  }

  private async trainGradientBoosting(data: any[], params?: any): Promise<any> {
    // Simulate gradient boosting training
    // In production, this would use a real ML library like TensorFlow.js
    return {
      type: 'gradient-boosting',
      parameters: {
        n_estimators: params?.n_estimators || 100,
        learning_rate: params?.learning_rate || 0.1,
        max_depth: params?.max_depth || 5,
        min_samples_split: params?.min_samples_split || 2
      },
      weights: this.generateMockWeights(20), // Feature weights
      prediction: (features: any) => {
        // Mock prediction function
        return Math.random() * 30 + 5; // Days to failure
      }
    };
  }

  private async trainNeuralNetwork(data: any[], params?: any): Promise<any> {
    // Simulate neural network training
    return {
      type: 'neural-network',
      parameters: {
        layers: params?.layers || [64, 32, 16, 1],
        activation: params?.activation || 'relu',
        optimizer: params?.optimizer || 'adam',
        epochs: params?.epochs || 100
      },
      weights: this.generateMockWeights(50),
      prediction: (features: any) => {
        return Math.random() * 25 + 7;
      }
    };
  }

  private async trainLSTM(data: any[], params?: any): Promise<any> {
    // LSTM for time series prediction
    return {
      type: 'lstm',
      parameters: {
        units: params?.units || 128,
        dropout: params?.dropout || 0.2,
        sequence_length: params?.sequence_length || 30,
        batch_size: params?.batch_size || 32
      },
      weights: this.generateMockWeights(100),
      prediction: (sequence: any[]) => {
        // Process sequence data
        return Math.random() * 20 + 10;
      }
    };
  }

  private async trainRandomForest(data: any[], params?: any): Promise<any> {
    return {
      type: 'random-forest',
      parameters: {
        n_trees: params?.n_trees || 50,
        max_depth: params?.max_depth || 10,
        min_samples_leaf: params?.min_samples_leaf || 5
      },
      weights: this.generateMockWeights(30),
      prediction: (features: any) => {
        return Math.random() * 35 + 5;
      }
    };
  }

  // Model validation and metrics
  private validateModel(model: any, validSet: any[]): ValidationResult[] {
    return validSet.map(data => {
      const predicted = model.prediction(data);
      const actual = data.days_to_failure;
      
      return {
        equipmentId: data.equipmentId || `equipment-${Math.random()}`,
        actualFailureDate: new Date(Date.now() + actual * 24 * 60 * 60 * 1000),
        predictedFailureDate: new Date(Date.now() + predicted * 24 * 60 * 60 * 1000),
        confidenceScore: this.calculateConfidence(predicted, model),
        error: Math.abs(predicted - actual)
      };
    });
  }

  private calculateMetrics(validationResults: ValidationResult[]): ModelMetrics {
    const errors = validationResults.map(r => r.error);
    const mse = errors.reduce((sum, e) => sum + e * e, 0) / errors.length;
    const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    
    // Calculate accuracy (within 3 days threshold)
    const accuratePredictions = errors.filter(e => e <= 3).length;
    const accuracy = accuratePredictions / errors.length;
    
    // Calculate confidence interval
    const stdDev = Math.sqrt(errors.reduce((sum, e) => sum + Math.pow(e - mae, 2), 0) / errors.length);
    
    return {
      accuracy: accuracy,
      precision: accuracy * 0.95, // Simplified
      recall: accuracy * 0.92, // Simplified
      f1Score: 2 * (accuracy * 0.95 * accuracy * 0.92) / (accuracy * 0.95 + accuracy * 0.92),
      mse: mse,
      confidenceInterval: {
        lower: mae - 1.96 * stdDev,
        upper: mae + 1.96 * stdDev
      }
    };
  }

  // Helper methods
  private validateTrainingData(data: TrainingData[]): void {
    if (!data || data.length < 100) {
      throw new Error('Insufficient training data. Minimum 100 records required.');
    }
    
    // Check for required fields
    data.forEach(record => {
      if (!record.sensorData || !record.timestamp) {
        throw new Error('Invalid training data format');
      }
    });
  }

  private splitData(data: any[], validationSplit: number): { trainSet: any[], validSet: any[] } {
    const splitIndex = Math.floor(data.length * (1 - validationSplit));
    return {
      trainSet: data.slice(0, splitIndex),
      validSet: data.slice(splitIndex)
    };
  }

  private calculateEquipmentAge(equipmentId: string): number {
    // Mock calculation - in production would query actual install date
    return Math.floor(Math.random() * 1000) + 100;
  }

  private daysSinceLastMaintenance(record: TrainingData): number {
    if (!record.maintenanceEvents.length) return 999;
    
    const lastMaintenance = record.maintenanceEvents
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    
    return Math.floor((record.timestamp.getTime() - lastMaintenance.date.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getMaintenanceFrequency(equipmentId: string): number {
    // Events per year
    return Math.random() * 12 + 2;
  }

  private getFailureCount(equipmentId: string): number {
    return Math.floor(Math.random() * 5);
  }

  private categorizeDustLevel(dustLevel: number): number {
    if (dustLevel < 30) return 0; // Low
    if (dustLevel < 60) return 1; // Medium
    return 2; // High
  }

  private calculateDaysToNextFailure(record: TrainingData): number {
    // This would be extracted from actual failure events
    return Math.floor(Math.random() * 60) + 10;
  }

  private calculateConfidence(prediction: number, model: any): number {
    // Simplified confidence calculation
    // In production, this would use prediction intervals or ensemble variance
    const baseConfidence = 0.85;
    const variance = Math.random() * 0.15;
    return Math.min(0.99, baseConfidence + variance);
  }

  private generateMockWeights(count: number): number[] {
    return Array(count).fill(0).map(() => (Math.random() - 0.5) * 2);
  }

  private generateModelId(): string {
    return `model-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private generateVersion(): string {
    return `1.0.${Math.floor(Math.random() * 100)}`;
  }

  private getFeatureNames(): string[] {
    return [
      'age_days', 'runtime_hours', 'runtime_squared',
      'temp_avg', 'temp_std', 'temp_trend',
      'vibration_avg', 'vibration_max', 'vibration_trend',
      'current_avg', 'current_variance',
      'efficiency_drop', 'efficiency_trend',
      'days_since_last_maintenance', 'maintenance_frequency', 'failure_count',
      'ambient_temp_delta', 'humidity_impact', 'dust_level_category',
      'temp_vibration_interaction', 'runtime_efficiency_ratio'
    ];
  }

  private getDefaultHyperparameters(algorithm: string): Record<string, any> {
    const defaults: Record<string, any> = {
      'gradient-boosting': {
        n_estimators: 100,
        learning_rate: 0.1,
        max_depth: 5,
        min_samples_split: 2
      },
      'neural-network': {
        layers: [64, 32, 16, 1],
        activation: 'relu',
        optimizer: 'adam',
        epochs: 100
      },
      'lstm': {
        units: 128,
        dropout: 0.2,
        sequence_length: 30,
        batch_size: 32
      },
      'random-forest': {
        n_trees: 50,
        max_depth: 10,
        min_samples_leaf: 5
      }
    };
    
    return defaults[algorithm] || defaults['gradient-boosting'];
  }

  private async performIncrementalLearning(
    existingModel: TrainingResult,
    newData: TrainingData[]
  ): Promise<TrainingResult> {
    // Simulate incremental learning
    // In production, this would use online learning algorithms
    const updatedMetrics = {
      ...existingModel.metrics,
      accuracy: existingModel.metrics.accuracy + (Math.random() - 0.5) * 0.02
    };
    
    return {
      ...existingModel,
      version: this.incrementVersion(existingModel.version),
      trainedAt: new Date(),
      metrics: updatedMetrics
    };
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  // Export model for deployment
  async exportModel(modelId: string): Promise<{
    format: 'onnx' | 'tensorflow' | 'pmml';
    data: ArrayBuffer;
    metadata: Record<string, any>;
  }> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error('Model not found');
    }

    // Mock export - in production would serialize actual model
    return {
      format: 'onnx',
      data: new ArrayBuffer(1024), // Mock model data
      metadata: {
        modelId: model.modelId,
        version: model.version,
        algorithm: model.parameters.algorithm,
        features: model.parameters.features,
        trainedAt: model.trainedAt
      }
    };
  }
}