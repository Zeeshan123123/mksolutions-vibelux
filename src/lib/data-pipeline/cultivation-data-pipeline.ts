/**
 * Cultivation Data Pipeline
 * Connects lab results, sensor data, and harvest outcomes to ML training and analysis
 */

import { logger } from '@/lib/logging/production-logger';
import prisma from '@/lib/prisma';
import { tensorflowService, TrainingData } from '@/lib/ml/real-tensorflow-service';
import { labIntegration, LabTestResult } from '@/lib/lab-integration/lab-api-service';
import { harvestFeedback, HarvestData } from '@/lib/cultivation/harvest-feedback-system';
import { EventEmitter } from 'events';

export interface PipelineConfig {
  autoTrain: boolean;
  minSamplesForTraining: number;
  retrainInterval: number; // hours
  dataQualityThreshold: number; // 0-1
}

export interface DataPoint {
  timestamp: Date;
  batchId: string;
  type: 'sensor' | 'lab' | 'harvest' | 'manual';
  
  // Environmental data
  environmental?: {
    temperature: number;
    humidity: number;
    co2: number;
    ppfd: number;
    dli: number;
    vpd: number;
  };
  
  // Nutrient data
  nutrients?: {
    ec: number;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  
  // Light spectrum data
  spectrum?: {
    red: number;
    blue: number;
    green: number;
    farRed: number;
    uv: number;
  };
  
  // Lab results
  labResults?: LabTestResult;
  
  // Harvest data
  harvestData?: HarvestData;
}

export class CultivationDataPipeline extends EventEmitter {
  private config: PipelineConfig;
  private dataBuffer: DataPoint[] = [];
  private lastTrainingTime: Date | null = null;
  private trainingQueue: TrainingData[] = [];
  private isProcessing = false;
  
  constructor(config?: Partial<PipelineConfig>) {
    super();
    
    this.config = {
      autoTrain: true,
      minSamplesForTraining: 10,
      retrainInterval: 24, // hours
      dataQualityThreshold: 0.8,
      ...config
    };
    
    // Start automatic processing
    if (this.config.autoTrain) {
      this.startAutomaticProcessing();
    }
  }
  
  /**
   * Ingest data point into pipeline
   */
  async ingestData(dataPoint: DataPoint): Promise<void> {
    try {
      // Validate data quality
      const quality = this.assessDataQuality(dataPoint);
      
      if (quality < this.config.dataQualityThreshold) {
        logger.warn(`Data quality below threshold: ${quality.toFixed(2)}`);
        this.emit('lowQualityData', { dataPoint, quality });
      }
      
      // Add to buffer
      this.dataBuffer.push(dataPoint);
      
      // Store in database
      await this.storeDataPoint(dataPoint);
      
      // Process if buffer is full
      if (this.dataBuffer.length >= this.config.minSamplesForTraining) {
        await this.processBuffer();
      }
      
      this.emit('dataIngested', dataPoint);
      
    } catch (error) {
      logger.error('Failed to ingest data:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Process buffered data
   */
  private async processBuffer(): Promise<void> {
    if (this.isProcessing || this.dataBuffer.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      logger.info(`Processing ${this.dataBuffer.length} data points`);
      
      // Group data by batch
      const batchGroups = this.groupDataByBatch(this.dataBuffer);
      
      // Process each batch
      for (const [batchId, dataPoints] of batchGroups.entries()) {
        await this.processBatchData(batchId, dataPoints);
      }
      
      // Clear processed data
      this.dataBuffer = [];
      
      // Trigger model training if needed
      if (this.shouldRetrain()) {
        await this.trainModels();
      }
      
      this.emit('bufferProcessed', { count: batchGroups.size });
      
    } catch (error) {
      logger.error('Failed to process buffer:', error);
      this.emit('error', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Process data for a specific batch
   */
  private async processBatchData(batchId: string, dataPoints: DataPoint[]): Promise<void> {
    try {
      // Aggregate environmental data
      const envData = this.aggregateEnvironmentalData(dataPoints);
      
      // Find lab results
      const labResults = dataPoints
        .filter(dp => dp.labResults)
        .map(dp => dp.labResults!);
      
      // Find harvest data
      const harvestData = dataPoints
        .filter(dp => dp.harvestData)
        .map(dp => dp.harvestData!)[0];
      
      // Create training data if we have both inputs and outputs
      if (envData && (labResults.length > 0 || harvestData)) {
        const trainingData: TrainingData = {
          inputs: {
            avgTemperature: envData.temperature,
            avgHumidity: envData.humidity,
            avgCO2: envData.co2,
            avgPPFD: envData.ppfd,
            avgDLI: envData.dli,
            redSpectrum: envData.spectrum.red,
            blueSpectrum: envData.spectrum.blue,
            greenSpectrum: envData.spectrum.green,
            farRedSpectrum: envData.spectrum.farRed,
            uvSpectrum: envData.spectrum.uv,
            ecLevel: envData.nutrients.ec,
            phLevel: envData.nutrients.ph,
            nitrogenPPM: envData.nutrients.nitrogen,
            phosphorusPPM: envData.nutrients.phosphorus,
            potassiumPPM: envData.nutrients.potassium,
            vegetativeDays: 30, // Default, should come from cycle data
            floweringDays: 60, // Default, should come from cycle data
            strainGeneticsIndex: 1 // Default, should be encoded
          },
          outputs: {}
        };
        
        // Add lab results as outputs
        if (labResults.length > 0) {
          const latestLab = labResults[labResults.length - 1];
          trainingData.outputs.thcPercentage = latestLab.cannabinoids.thc;
          trainingData.outputs.cbdPercentage = latestLab.cannabinoids.cbd;
          trainingData.outputs.totalCannabinoids = latestLab.cannabinoids.totalCannabinoids;
          trainingData.outputs.totalTerpenes = latestLab.terpenes.totalTerpenes;
        }
        
        // Add harvest data as outputs
        if (harvestData) {
          trainingData.outputs.yieldGramsPerSqM = harvestData.dryWeight / 10; // Assuming 10 sq m
        }
        
        // Add to training queue
        this.trainingQueue.push(trainingData);
        
        // Calculate correlations
        await this.calculateAndStoreCorrelations(batchId, envData, labResults);
      }
      
    } catch (error) {
      logger.error(`Failed to process batch ${batchId}:`, error);
    }
  }
  
  /**
   * Aggregate environmental data from multiple points
   */
  private aggregateEnvironmentalData(dataPoints: DataPoint[]): any {
    const envPoints = dataPoints.filter(dp => dp.environmental);
    
    if (envPoints.length === 0) return null;
    
    const aggregate = {
      temperature: 0,
      humidity: 0,
      co2: 0,
      ppfd: 0,
      dli: 0,
      vpd: 0,
      spectrum: { red: 0, blue: 0, green: 0, farRed: 0, uv: 0 },
      nutrients: { ec: 0, ph: 0, nitrogen: 0, phosphorus: 0, potassium: 0 }
    };
    
    let envCount = 0;
    let spectrumCount = 0;
    let nutrientCount = 0;
    
    dataPoints.forEach(dp => {
      if (dp.environmental) {
        aggregate.temperature += dp.environmental.temperature;
        aggregate.humidity += dp.environmental.humidity;
        aggregate.co2 += dp.environmental.co2;
        aggregate.ppfd += dp.environmental.ppfd;
        aggregate.dli += dp.environmental.dli;
        aggregate.vpd += dp.environmental.vpd;
        envCount++;
      }
      
      if (dp.spectrum) {
        aggregate.spectrum.red += dp.spectrum.red;
        aggregate.spectrum.blue += dp.spectrum.blue;
        aggregate.spectrum.green += dp.spectrum.green;
        aggregate.spectrum.farRed += dp.spectrum.farRed;
        aggregate.spectrum.uv += dp.spectrum.uv;
        spectrumCount++;
      }
      
      if (dp.nutrients) {
        aggregate.nutrients.ec += dp.nutrients.ec;
        aggregate.nutrients.ph += dp.nutrients.ph;
        aggregate.nutrients.nitrogen += dp.nutrients.nitrogen;
        aggregate.nutrients.phosphorus += dp.nutrients.phosphorus;
        aggregate.nutrients.potassium += dp.nutrients.potassium;
        nutrientCount++;
      }
    });
    
    // Calculate averages
    if (envCount > 0) {
      aggregate.temperature /= envCount;
      aggregate.humidity /= envCount;
      aggregate.co2 /= envCount;
      aggregate.ppfd /= envCount;
      aggregate.dli /= envCount;
      aggregate.vpd /= envCount;
    }
    
    if (spectrumCount > 0) {
      Object.keys(aggregate.spectrum).forEach(key => {
        (aggregate.spectrum as any)[key] /= spectrumCount;
      });
    }
    
    if (nutrientCount > 0) {
      Object.keys(aggregate.nutrients).forEach(key => {
        (aggregate.nutrients as any)[key] /= nutrientCount;
      });
    }
    
    return aggregate;
  }
  
  /**
   * Calculate and store correlations
   */
  private async calculateAndStoreCorrelations(
    batchId: string,
    envData: any,
    labResults: LabTestResult[]
  ): Promise<void> {
    if (labResults.length === 0) return;
    
    try {
      const correlations = await labIntegration.calculateCorrelations(batchId, {
        avgTemp: envData.temperature,
        avgHumidity: envData.humidity,
        avgCO2: envData.co2,
        avgPPFD: envData.ppfd,
        avgDLI: envData.dli,
        spectrum: envData.spectrum
      });
      
      // Store correlations in database
      await prisma.correlationAnalysis.create({
        data: {
          batchId,
          timestamp: new Date(),
          correlations: Object.fromEntries(correlations.correlations),
          pValues: Object.fromEntries(correlations.pValues),
          r2Values: Object.fromEntries(correlations.r2Values)
        }
      });
      
      this.emit('correlationsCalculated', { batchId, correlations });
      
    } catch (error) {
      logger.error('Failed to calculate correlations:', error);
    }
  }
  
  /**
   * Train ML models with queued data
   */
  private async trainModels(): Promise<void> {
    if (this.trainingQueue.length < this.config.minSamplesForTraining) {
      logger.info(`Insufficient training data: ${this.trainingQueue.length} samples`);
      return;
    }
    
    try {
      logger.info(`Training models with ${this.trainingQueue.length} samples`);
      
      // Separate data by output type
      const cannabinoidData = this.trainingQueue.filter(d => 
        d.outputs.thcPercentage !== undefined || d.outputs.cbdPercentage !== undefined
      );
      
      const yieldData = this.trainingQueue.filter(d => 
        d.outputs.yieldGramsPerSqM !== undefined
      );
      
      // Train cannabinoid model
      if (cannabinoidData.length >= 5) {
        const metadata = await tensorflowService.trainModel(
          'cannabinoid-predictor',
          cannabinoidData,
          {
            epochs: 100,
            batchSize: 16,
            validationSplit: 0.2,
            modelType: 'cannabinoid'
          }
        );
        
        logger.info(`Cannabinoid model trained: R² = ${metadata.metrics.r2Score?.toFixed(3)}`);
        this.emit('modelTrained', { name: 'cannabinoid-predictor', metadata });
      }
      
      // Train yield model
      if (yieldData.length >= 5) {
        const metadata = await tensorflowService.trainModel(
          'yield-predictor',
          yieldData,
          {
            epochs: 100,
            batchSize: 16,
            validationSplit: 0.2,
            modelType: 'yield'
          }
        );
        
        logger.info(`Yield model trained: R² = ${metadata.metrics.r2Score?.toFixed(3)}`);
        this.emit('modelTrained', { name: 'yield-predictor', metadata });
      }
      
      // Clear training queue
      this.trainingQueue = [];
      this.lastTrainingTime = new Date();
      
    } catch (error) {
      logger.error('Failed to train models:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Assess data quality
   */
  private assessDataQuality(dataPoint: DataPoint): number {
    let quality = 1.0;
    const penalties: string[] = [];
    
    // Check for missing environmental data
    if (dataPoint.environmental) {
      const env = dataPoint.environmental;
      
      // Temperature range check
      if (env.temperature < 10 || env.temperature > 40) {
        quality -= 0.2;
        penalties.push('Temperature out of range');
      }
      
      // Humidity range check
      if (env.humidity < 20 || env.humidity > 90) {
        quality -= 0.1;
        penalties.push('Humidity out of range');
      }
      
      // CO2 range check
      if (env.co2 < 300 || env.co2 > 2000) {
        quality -= 0.1;
        penalties.push('CO2 out of range');
      }
      
      // PPFD range check
      if (env.ppfd < 0 || env.ppfd > 2000) {
        quality -= 0.1;
        penalties.push('PPFD out of range');
      }
    } else if (dataPoint.type === 'sensor') {
      quality -= 0.5; // Missing environmental data for sensor reading
      penalties.push('Missing environmental data');
    }
    
    // Check nutrient data
    if (dataPoint.nutrients) {
      const nut = dataPoint.nutrients;
      
      // pH range check
      if (nut.ph < 4 || nut.ph > 9) {
        quality -= 0.2;
        penalties.push('pH out of range');
      }
      
      // EC range check
      if (nut.ec < 0 || nut.ec > 5) {
        quality -= 0.1;
        penalties.push('EC out of range');
      }
    }
    
    if (penalties.length > 0) {
      logger.debug(`Data quality issues: ${penalties.join(', ')}`);
    }
    
    return Math.max(0, quality);
  }
  
  /**
   * Check if models should be retrained
   */
  private shouldRetrain(): boolean {
    if (!this.config.autoTrain) return false;
    
    if (!this.lastTrainingTime) return true;
    
    const hoursSinceLastTraining = 
      (Date.now() - this.lastTrainingTime.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastTraining >= this.config.retrainInterval;
  }
  
  /**
   * Group data points by batch ID
   */
  private groupDataByBatch(dataPoints: DataPoint[]): Map<string, DataPoint[]> {
    const groups = new Map<string, DataPoint[]>();
    
    dataPoints.forEach(dp => {
      if (!groups.has(dp.batchId)) {
        groups.set(dp.batchId, []);
      }
      groups.get(dp.batchId)!.push(dp);
    });
    
    return groups;
  }
  
  /**
   * Store data point in database
   */
  private async storeDataPoint(dataPoint: DataPoint): Promise<void> {
    try {
      await prisma.dataPoint.create({
        data: {
          timestamp: dataPoint.timestamp,
          batchId: dataPoint.batchId,
          type: dataPoint.type,
          environmental: dataPoint.environmental,
          nutrients: dataPoint.nutrients,
          spectrum: dataPoint.spectrum,
          labResultId: dataPoint.labResults?.id,
          harvestId: dataPoint.harvestData?.id
        }
      });
    } catch (error) {
      logger.error('Failed to store data point:', error);
    }
  }
  
  /**
   * Start automatic processing
   */
  private startAutomaticProcessing(): void {
    // Process buffer every 5 minutes
    setInterval(() => {
      this.processBuffer();
    }, 5 * 60 * 1000);
    
    // Check for retraining every hour
    setInterval(() => {
      if (this.shouldRetrain()) {
        this.trainModels();
      }
    }, 60 * 60 * 1000);
    
    logger.info('Automatic pipeline processing started');
  }
  
  /**
   * Get pipeline statistics
   */
  getStatistics(): {
    bufferSize: number;
    queueSize: number;
    lastTraining: Date | null;
    isProcessing: boolean;
  } {
    return {
      bufferSize: this.dataBuffer.length,
      queueSize: this.trainingQueue.length,
      lastTraining: this.lastTrainingTime,
      isProcessing: this.isProcessing
    };
  }
  
  /**
   * Force model training
   */
  async forceTraining(): Promise<void> {
    await this.trainModels();
  }
  
  /**
   * Clear all buffers
   */
  clearBuffers(): void {
    this.dataBuffer = [];
    this.trainingQueue = [];
    logger.info('Pipeline buffers cleared');
  }
}

// Export singleton instance
export const dataPipeline = new CultivationDataPipeline();