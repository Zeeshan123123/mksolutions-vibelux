/**
 * LSTM Neural Network for Energy Time-Series Prediction
 * Uses TensorFlow.js for deep learning time-series forecasting
 */

import * as tf from '@tensorflow/tfjs';

interface TimeSeriesData {
  timestamp: Date;
  powerConsumption: number;
  temperature: number;
  humidity: number;
  ppfd: number;
  co2: number;
  utilityRate: number;
}

interface PredictionResult {
  timestamp: Date;
  predictedPower: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export class LSTMEnergyPredictor {
  private model: tf.LayersModel | null = null;
  private readonly sequenceLength = 24; // 24 hours of historical data
  private readonly features = 6; // Number of input features
  private readonly outputSteps = 24; // Predict next 24 hours
  
  /**
   * Build LSTM model architecture
   */
  buildModel(): tf.LayersModel {
    const model = tf.sequential();

    // First LSTM layer with return sequences
    model.add(tf.layers.lstm({
      units: 128,
      returnSequences: true,
      inputShape: [this.sequenceLength, this.features],
      dropout: 0.2,
      recurrentDropout: 0.2,
    }));

    // Second LSTM layer with attention mechanism
    model.add(tf.layers.lstm({
      units: 64,
      returnSequences: true,
      dropout: 0.2,
      recurrentDropout: 0.2,
    }));

    // Attention layer for temporal focus
    model.add(tf.layers.multiHeadAttention({
      numHeads: 4,
      keyDim: 16,
      dropout: 0.1,
    }));

    // Third LSTM layer
    model.add(tf.layers.lstm({
      units: 32,
      returnSequences: false,
      dropout: 0.2,
    }));

    // Dense layers for output
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
    }));

    model.add(tf.layers.dropout({ rate: 0.3 }));

    model.add(tf.layers.dense({
      units: this.outputSteps,
      activation: 'linear',
    }));

    // Compile with custom loss function for time-series
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: this.customTimeSeriesLoss,
      metrics: ['mae', 'mse'],
    });

    this.model = model;
    return model;
  }

  /**
   * Custom loss function that weights recent predictions more heavily
   */
  private customTimeSeriesLoss(yTrue: tf.Tensor, yPred: tf.Tensor): tf.Tensor {
    return tf.tidy(() => {
      // Calculate squared error
      const squaredError = tf.square(tf.sub(yTrue, yPred));
      
      // Create time weights (more weight on near-term predictions)
      const timeSteps = yTrue.shape[1] || this.outputSteps;
      const weights = tf.range(1, timeSteps + 1)
        .div(tf.scalar(timeSteps))
        .reverse()
        .expandDims(0);
      
      // Apply weights
      const weightedError = tf.mul(squaredError, weights);
      
      // Return mean weighted error
      return tf.mean(weightedError);
    });
  }

  /**
   * Prepare time-series data for LSTM input
   */
  prepareData(
    data: TimeSeriesData[],
    normalizeParams?: { mean: number[]; std: number[] }
  ): {
    sequences: tf.Tensor3D;
    targets: tf.Tensor2D;
    normalizeParams: { mean: number[]; std: number[] };
  } {
    // Extract features
    const features = data.map(d => [
      d.powerConsumption,
      d.temperature,
      d.humidity,
      d.ppfd,
      d.co2,
      d.utilityRate,
    ]);

    // Calculate normalization parameters if not provided
    if (!normalizeParams) {
      const featureTensor = tf.tensor2d(features);
      const mean = featureTensor.mean(0).arraySync() as number[];
      const std = featureTensor.std(0).arraySync() as number[];
      normalizeParams = { mean, std };
      featureTensor.dispose();
    }

    // Normalize features
    const normalizedFeatures = features.map(row =>
      row.map((val, i) => (val - normalizeParams.mean[i]) / (normalizeParams.std[i] || 1))
    );

    // Create sequences
    const sequences: number[][][] = [];
    const targets: number[][] = [];

    for (let i = 0; i < data.length - this.sequenceLength - this.outputSteps; i++) {
      const sequence = normalizedFeatures.slice(i, i + this.sequenceLength);
      const target = normalizedFeatures
        .slice(i + this.sequenceLength, i + this.sequenceLength + this.outputSteps)
        .map(row => row[0]); // Power consumption only

      sequences.push(sequence);
      targets.push(target);
    }

    return {
      sequences: tf.tensor3d(sequences),
      targets: tf.tensor2d(targets),
      normalizeParams,
    };
  }

  /**
   * Train the LSTM model
   */
  async train(
    trainingData: TimeSeriesData[],
    validationData?: TimeSeriesData[],
    epochs: number = 100,
    batchSize: number = 32
  ): Promise<tf.History> {
    if (!this.model) {
      this.buildModel();
    }

    const { sequences, targets, normalizeParams } = this.prepareData(trainingData);
    
    let validationDataset;
    if (validationData) {
      const valData = this.prepareData(validationData, normalizeParams);
      validationDataset = [valData.sequences, valData.targets];
    }

    const history = await this.model!.fit(sequences, targets, {
      epochs,
      batchSize,
      validationData: validationDataset,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          logger.info('api', `Epoch ${epoch + 1}/${epochs} - Loss: ${logs?.loss?.toFixed(4)}, MAE: ${logs?.mae?.toFixed(4)}`);
        },
      },
    });

    // Clean up tensors
    sequences.dispose();
    targets.dispose();
    if (validationDataset) {
      validationDataset[0].dispose();
      validationDataset[1].dispose();
    }

    return history;
  }

  /**
   * Make predictions with uncertainty estimation
   */
  async predict(
    recentData: TimeSeriesData[],
    normalizeParams: { mean: number[]; std: number[] }
  ): Promise<PredictionResult[]> {
    if (!this.model) {
      throw new Error('Model not trained');
    }

    // Prepare input sequence
    const features = recentData.slice(-this.sequenceLength).map(d => [
      d.powerConsumption,
      d.temperature,
      d.humidity,
      d.ppfd,
      d.co2,
      d.utilityRate,
    ]);

    // Normalize
    const normalizedFeatures = features.map(row =>
      row.map((val, i) => (val - normalizeParams.mean[i]) / (normalizeParams.std[i] || 1))
    );

    const inputTensor = tf.tensor3d([normalizedFeatures]);

    // Make predictions with dropout for uncertainty estimation
    const predictions: number[][] = [];
    const numSamples = 100;

    for (let i = 0; i < numSamples; i++) {
      const pred = this.model.predict(inputTensor, { training: true }) as tf.Tensor;
      const predArray = await pred.array() as number[][];
      predictions.push(predArray[0]);
      pred.dispose();
    }

    inputTensor.dispose();

    // Calculate statistics
    const results: PredictionResult[] = [];
    const lastTimestamp = recentData[recentData.length - 1].timestamp;

    for (let t = 0; t < this.outputSteps; t++) {
      const values = predictions.map(p => p[t] * normalizeParams.std[0] + normalizeParams.mean[0]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );

      results.push({
        timestamp: new Date(lastTimestamp.getTime() + (t + 1) * 3600000), // +1 hour
        predictedPower: mean,
        confidence: 1 / (1 + std), // Simple confidence metric
        upperBound: mean + 2 * std, // 95% confidence interval
        lowerBound: Math.max(0, mean - 2 * std),
      });
    }

    return results;
  }

  /**
   * Predict anomalies in energy consumption
   */
  async detectAnomalies(
    data: TimeSeriesData[],
    threshold: number = 3 // Standard deviations
  ): Promise<Array<{ timestamp: Date; severity: number; expected: number; actual: number }>> {
    if (!this.model) {
      throw new Error('Model not trained');
    }

    const anomalies: Array<{ timestamp: Date; severity: number; expected: number; actual: number }> = [];
    const { normalizeParams } = this.prepareData(data.slice(0, -this.outputSteps));

    for (let i = this.sequenceLength; i < data.length - this.outputSteps; i++) {
      const sequence = data.slice(i - this.sequenceLength, i);
      const predictions = await this.predict(sequence, normalizeParams);
      
      // Check next hour prediction vs actual
      const actual = data[i].powerConsumption;
      const predicted = predictions[0].predictedPower;
      const upperBound = predictions[0].upperBound;
      const lowerBound = predictions[0].lowerBound;
      
      if (actual > upperBound || actual < lowerBound) {
        const severity = Math.abs(actual - predicted) / (upperBound - predicted);
        anomalies.push({
          timestamp: data[i].timestamp,
          severity: Math.min(severity, 10), // Cap at 10
          expected: predicted,
          actual,
        });
      }
    }

    return anomalies;
  }

  /**
   * Feature importance analysis using permutation
   */
  async analyzeFeatureImportance(
    testData: TimeSeriesData[]
  ): Promise<Map<string, number>> {
    if (!this.model) {
      throw new Error('Model not trained');
    }

    const featureNames = ['power', 'temperature', 'humidity', 'ppfd', 'co2', 'utilityRate'];
    const importance = new Map<string, number>();
    
    const { sequences, targets, normalizeParams } = this.prepareData(testData);
    
    // Get baseline performance
    const baselinePred = this.model.predict(sequences) as tf.Tensor;
    const baselineError = tf.losses.meanSquaredError(targets, baselinePred).dataSync()[0];
    baselinePred.dispose();

    // Test each feature
    for (let featureIdx = 0; featureIdx < featureNames.length; featureIdx++) {
      // Permute feature values
      const permutedSequences = tf.tidy(() => {
        const sequencesArray = sequences.arraySync() as number[][][];
        const permuted = sequencesArray.map(seq => {
          const newSeq = seq.map(step => [...step]);
          // Shuffle this feature across the batch
          const featureValues = sequencesArray.map(s => s[0][featureIdx]);
          const shuffled = [...featureValues].sort(() => Math.random() - 0.5);
          newSeq.forEach((step, i) => {
            step[featureIdx] = shuffled[i % shuffled.length];
          });
          return newSeq;
        });
        return tf.tensor3d(permuted);
      });

      // Measure performance drop
      const permutedPred = this.model.predict(permutedSequences) as tf.Tensor;
      const permutedError = tf.losses.meanSquaredError(targets, permutedPred).dataSync()[0];
      
      importance.set(featureNames[featureIdx], (permutedError - baselineError) / baselineError);
      
      permutedSequences.dispose();
      permutedPred.dispose();
    }

    sequences.dispose();
    targets.dispose();

    return importance;
  }

  /**
   * Save model to browser storage or file
   */
  async saveModel(path: string = 'localstorage://lstm-energy-model'): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }
    await this.model.save(path);
  }

  /**
   * Load model from storage
   */
  async loadModel(path: string = 'localstorage://lstm-energy-model'): Promise<void> {
    this.model = await tf.loadLayersModel(path);
  }

  /**
   * Dispose of model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}