/**
 * ETL Pipeline for Real-time Data Processing
 * Handles Extract, Transform, Load operations for analytics data
 */

import { prisma } from '@/lib/prisma';
import { dataValidationService } from './data-validation';

export interface ETLJobConfig {
  name: string;
  source: 'sensor' | 'external_api' | 'file_upload' | 'manual_entry';
  destination: 'postgres' | 'influxdb' | 'cache';
  schedule: string; // Cron expression
  enabled: boolean;
  transformations: TransformationStep[];
  validations: ValidationStep[];
}

export interface TransformationStep {
  type: 'map' | 'filter' | 'aggregate' | 'normalize' | 'enrich';
  config: any;
  order: number;
}

export interface ValidationStep {
  type: 'schema' | 'range' | 'required' | 'custom';
  config: any;
  onFailure: 'skip' | 'stop' | 'log';
}

export interface ETLJobResult {
  jobName: string;
  status: 'success' | 'partial_success' | 'failure';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  errors: string[];
  warnings: string[];
  metrics: {
    throughput: number; // records per second
    dataQualityScore: number;
    validationsPassed: number;
    validationsFailed: number;
  };
}

export interface DataStream {
  id: string;
  facilityId: string;
  source: string;
  dataType: 'sensor' | 'harvest' | 'financial' | 'environmental';
  frequency: 'realtime' | 'minute' | 'hourly' | 'daily';
  lastProcessed: Date;
  schema: any;
  transformations: string[];
  isActive: boolean;
}

export class ETLPipeline {
  private runningJobs = new Map<string, boolean>();
  private jobQueue: Array<{ job: ETLJobConfig; priority: number }> = [];

  /**
   * Register a new ETL job
   */
  async registerJob(jobConfig: ETLJobConfig): Promise<void> {
    await prisma.etlJob.upsert({
      where: { name: jobConfig.name },
      update: {
        config: jobConfig,
        enabled: jobConfig.enabled,
        updatedAt: new Date()
      },
      create: {
        name: jobConfig.name,
        config: jobConfig,
        enabled: jobConfig.enabled,
        status: 'idle',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * Process real-time sensor data
   */
  async processSensorData(
    facilityId: string,
    rawSensorData: any[]
  ): Promise<ETLJobResult> {
    const startTime = new Date();
    const jobName = `sensor_data_${facilityId}_${Date.now()}`;
    
    let recordsProcessed = 0;
    let recordsSuccessful = 0;
    let recordsFailed = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Extract - data is already provided
      logger.info('api', `ETL: Processing ${rawSensorData.length} sensor readings for facility ${facilityId}`);

      // Step 2: Transform
      const transformedData = await this.transformSensorData(rawSensorData);
      
      // Step 3: Validate
      const validationResult = await dataValidationService.validateSensorData(
        facilityId,
        transformedData,
        startTime
      );

      // Track validation issues
      warnings.push(...validationResult.warnings.map(w => w.description));
      errors.push(...validationResult.errors.map(e => e.description));
      errors.push(...validationResult.criticalIssues.map(c => c.description));

      // Step 4: Load - Insert valid data
      for (const reading of transformedData) {
        try {
          recordsProcessed++;
          
          // Skip records with critical validation errors
          const hasCriticalErrors = validationResult.criticalIssues.some(
            issue => issue.recordId === reading.id
          );
          
          if (hasCriticalErrors) {
            recordsFailed++;
            continue;
          }

          // Insert into database
          await prisma.sensorReading.upsert({
            where: {
              facilityId_sensorType_timestamp: {
                facilityId: reading.facilityId,
                sensorType: reading.sensorType,
                timestamp: reading.timestamp
              }
            },
            update: {
              value: reading.value,
              unit: reading.unit,
              zoneId: reading.zoneId,
              metadata: reading.metadata,
              updatedAt: new Date()
            },
            create: {
              id: reading.id || crypto.randomUUID(),
              facilityId: reading.facilityId,
              sensorType: reading.sensorType,
              value: reading.value,
              unit: reading.unit,
              timestamp: reading.timestamp,
              zoneId: reading.zoneId,
              metadata: reading.metadata || {},
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          recordsSuccessful++;
        } catch (error) {
          recordsFailed++;
          errors.push(`Failed to insert reading ${reading.id}: ${error}`);
        }
      }

      // Step 5: Aggregate for analytics
      await this.generateAggregatedMetrics(facilityId, transformedData);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        jobName,
        status: recordsFailed === 0 ? 'success' : recordsSuccessful > 0 ? 'partial_success' : 'failure',
        recordsProcessed,
        recordsSuccessful,
        recordsFailed,
        startTime,
        endTime,
        duration,
        errors,
        warnings,
        metrics: {
          throughput: recordsProcessed / (duration / 1000),
          dataQualityScore: validationResult.dataQualityScore,
          validationsPassed: recordsSuccessful,
          validationsFailed: recordsFailed
        }
      };
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        jobName,
        status: 'failure',
        recordsProcessed,
        recordsSuccessful,
        recordsFailed: recordsProcessed,
        startTime,
        endTime,
        duration,
        errors: [`Job failed: ${error}`],
        warnings,
        metrics: {
          throughput: 0,
          dataQualityScore: 0,
          validationsPassed: 0,
          validationsFailed: recordsProcessed
        }
      };
    }
  }

  /**
   * Process harvest data through ETL pipeline
   */
  async processHarvestData(
    facilityId: string,
    rawHarvestData: any[]
  ): Promise<ETLJobResult> {
    const startTime = new Date();
    const jobName = `harvest_data_${facilityId}_${Date.now()}`;
    
    let recordsProcessed = 0;
    let recordsSuccessful = 0;
    let recordsFailed = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Transform harvest data
      const transformedData = await this.transformHarvestData(rawHarvestData);
      
      // Validate
      const validationResult = await dataValidationService.validateHarvestData(
        facilityId,
        transformedData,
        startTime
      );

      warnings.push(...validationResult.warnings.map(w => w.description));
      errors.push(...validationResult.errors.map(e => e.description));

      // Load validated data
      for (const harvest of transformedData) {
        try {
          recordsProcessed++;
          
          const hasCriticalErrors = validationResult.criticalIssues.some(
            issue => issue.recordId === harvest.id
          );
          
          if (hasCriticalErrors) {
            recordsFailed++;
            continue;
          }

          await prisma.harvestBatch.upsert({
            where: { id: harvest.id },
            update: {
              actualYield: harvest.actualYield,
              qualityGrade: harvest.qualityGrade,
              notes: harvest.notes,
              updatedAt: new Date()
            },
            create: {
              id: harvest.id || crypto.randomUUID(),
              facilityId: harvest.facilityId,
              batchNumber: harvest.batchNumber,
              strain: harvest.strain,
              zoneId: harvest.zoneId,
              harvestDate: harvest.harvestDate,
              plantCount: harvest.plantCount,
              actualYield: harvest.actualYield,
              qualityGrade: harvest.qualityGrade,
              status: harvest.status || 'COMPLETED',
              notes: harvest.notes,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          recordsSuccessful++;
        } catch (error) {
          recordsFailed++;
          errors.push(`Failed to insert harvest ${harvest.id}: ${error}`);
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        jobName,
        status: recordsFailed === 0 ? 'success' : 'partial_success',
        recordsProcessed,
        recordsSuccessful,
        recordsFailed,
        startTime,
        endTime,
        duration,
        errors,
        warnings,
        metrics: {
          throughput: recordsProcessed / (duration / 1000),
          dataQualityScore: validationResult.dataQualityScore,
          validationsPassed: recordsSuccessful,
          validationsFailed: recordsFailed
        }
      };
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        jobName,
        status: 'failure',
        recordsProcessed,
        recordsSuccessful,
        recordsFailed: recordsProcessed,
        startTime,
        endTime,
        duration,
        errors: [`Job failed: ${error}`],
        warnings,
        metrics: {
          throughput: 0,
          dataQualityScore: 0,
          validationsPassed: 0,
          validationsFailed: recordsProcessed
        }
      };
    }
  }

  /**
   * Process external API data
   */
  async processExternalAPIData(
    facilityId: string,
    source: string,
    apiConfig: any
  ): Promise<ETLJobResult> {
    const startTime = new Date();
    const jobName = `external_api_${source}_${facilityId}_${Date.now()}`;
    
    try {
      // Extract data from external API
      const rawData = await this.extractFromAPI(apiConfig);
      
      // Route to appropriate processor based on data type
      if (source.includes('sensor')) {
        return await this.processSensorData(facilityId, rawData);
      } else if (source.includes('weather')) {
        return await this.processWeatherData(facilityId, rawData);
      } else {
        throw new Error(`Unknown external data source: ${source}`);
      }
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        jobName,
        status: 'failure',
        recordsProcessed: 0,
        recordsSuccessful: 0,
        recordsFailed: 0,
        startTime,
        endTime,
        duration,
        errors: [`Failed to extract from external API: ${error}`],
        warnings: [],
        metrics: {
          throughput: 0,
          dataQualityScore: 0,
          validationsPassed: 0,
          validationsFailed: 0
        }
      };
    }
  }

  /**
   * Schedule and run ETL jobs
   */
  async runScheduledJobs(): Promise<void> {
    const enabledJobs = await prisma.etlJob.findMany({
      where: { enabled: true }
    });

    for (const job of enabledJobs) {
      // Check if job should run based on schedule
      if (this.shouldRunJob(job.config.schedule, job.lastRun)) {
        try {
          await this.executeJob(job.config);
          
          await prisma.etlJob.update({
            where: { id: job.id },
            data: {
              lastRun: new Date(),
              status: 'completed',
              updatedAt: new Date()
            }
          });
        } catch (error) {
          await prisma.etlJob.update({
            where: { id: job.id },
            data: {
              status: 'failed',
              lastError: String(error),
              updatedAt: new Date()
            }
          });
        }
      }
    }
  }

  /**
   * Transform sensor data
   */
  private async transformSensorData(rawData: any[]): Promise<any[]> {
    return rawData.map(reading => ({
      ...reading,
      // Normalize timestamp
      timestamp: new Date(reading.timestamp),
      // Ensure numeric values
      value: parseFloat(reading.value),
      // Standardize sensor types
      sensorType: this.normalizeSensorType(reading.sensorType),
      // Add derived fields
      metadata: {
        ...reading.metadata,
        processedAt: new Date(),
        source: 'etl_pipeline'
      }
    }));
  }

  /**
   * Transform harvest data
   */
  private async transformHarvestData(rawData: any[]): Promise<any[]> {
    return rawData.map(harvest => ({
      ...harvest,
      // Normalize dates
      harvestDate: new Date(harvest.harvestDate),
      // Ensure numeric values
      actualYield: parseFloat(harvest.actualYield),
      plantCount: parseInt(harvest.plantCount),
      // Standardize quality grades
      qualityGrade: this.normalizeQualityGrade(harvest.qualityGrade),
      // Generate batch number if missing
      batchNumber: harvest.batchNumber || `BATCH-${Date.now()}`
    }));
  }

  /**
   * Process weather data from external APIs
   */
  private async processWeatherData(facilityId: string, rawData: any[]): Promise<ETLJobResult> {
    const startTime = new Date();
    const jobName = `weather_data_${facilityId}_${Date.now()}`;
    
    try {
      // Transform weather data to sensor readings format
      const sensorReadings = [];
      
      for (const weatherPoint of rawData) {
        if (weatherPoint.temperature !== undefined) {
          sensorReadings.push({
            facilityId,
            sensorType: 'TEMPERATURE_EXTERNAL',
            value: weatherPoint.temperature,
            unit: '°C',
            timestamp: new Date(weatherPoint.timestamp),
            metadata: {
              source: 'weather_api',
              location: weatherPoint.location
            }
          });
        }
        
        if (weatherPoint.humidity !== undefined) {
          sensorReadings.push({
            facilityId,
            sensorType: 'HUMIDITY_EXTERNAL',
            value: weatherPoint.humidity,
            unit: '%',
            timestamp: new Date(weatherPoint.timestamp),
            metadata: {
              source: 'weather_api',
              location: weatherPoint.location
            }
          });
        }
      }

      // Process as sensor data
      return await this.processSensorData(facilityId, sensorReadings);
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        jobName,
        status: 'failure',
        recordsProcessed: 0,
        recordsSuccessful: 0,
        recordsFailed: 0,
        startTime,
        endTime,
        duration,
        errors: [`Weather data processing failed: ${error}`],
        warnings: [],
        metrics: {
          throughput: 0,
          dataQualityScore: 0,
          validationsPassed: 0,
          validationsFailed: 0
        }
      };
    }
  }

  /**
   * Generate aggregated metrics for analytics
   */
  private async generateAggregatedMetrics(facilityId: string, sensorData: any[]): Promise<void> {
    // Group by sensor type and time intervals
    const hourlyAggregates = new Map();
    
    for (const reading of sensorData) {
      const hourKey = `${reading.sensorType}_${new Date(reading.timestamp).toISOString().slice(0, 13)}`;
      
      if (!hourlyAggregates.has(hourKey)) {
        hourlyAggregates.set(hourKey, {
          facilityId,
          sensorType: reading.sensorType,
          hour: new Date(reading.timestamp).toISOString().slice(0, 13) + ':00:00.000Z',
          values: [],
          count: 0,
          sum: 0,
          min: reading.value,
          max: reading.value
        });
      }
      
      const aggregate = hourlyAggregates.get(hourKey);
      aggregate.values.push(reading.value);
      aggregate.count++;
      aggregate.sum += reading.value;
      aggregate.min = Math.min(aggregate.min, reading.value);
      aggregate.max = Math.max(aggregate.max, reading.value);
    }

    // Insert aggregated data
    for (const [key, aggregate] of hourlyAggregates) {
      const avg = aggregate.sum / aggregate.count;
      
      await prisma.sensorAggregation.upsert({
        where: {
          facilityId_sensorType_interval_timestamp: {
            facilityId: aggregate.facilityId,
            sensorType: aggregate.sensorType,
            interval: 'HOUR',
            timestamp: new Date(aggregate.hour)
          }
        },
        update: {
          average: avg,
          minimum: aggregate.min,
          maximum: aggregate.max,
          count: aggregate.count,
          updatedAt: new Date()
        },
        create: {
          id: crypto.randomUUID(),
          facilityId: aggregate.facilityId,
          sensorType: aggregate.sensorType,
          interval: 'HOUR',
          timestamp: new Date(aggregate.hour),
          average: avg,
          minimum: aggregate.min,
          maximum: aggregate.max,
          count: aggregate.count,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }

  /**
   * Extract data from external API
   */
  private async extractFromAPI(apiConfig: any): Promise<any[]> {
    const response = await fetch(apiConfig.url, {
      method: apiConfig.method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiConfig.token}`,
        'Content-Type': 'application/json',
        ...apiConfig.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return apiConfig.dataPath ? this.extractDataByPath(data, apiConfig.dataPath) : data;
  }

  /**
   * Execute ETL job
   */
  private async executeJob(jobConfig: ETLJobConfig): Promise<void> {
    switch (jobConfig.source) {
      case 'external_api':
        // Implementation for external API jobs
        break;
      case 'sensor':
        // Implementation for sensor data jobs
        break;
      default:
        throw new Error(`Unsupported job source: ${jobConfig.source}`);
    }
  }

  /**
   * Check if job should run based on schedule
   */
  private shouldRunJob(schedule: string, lastRun: Date | null): boolean {
    if (!lastRun) return true;
    
    // Simple schedule checking - in production, use a proper cron parser
    const now = new Date();
    const timeSinceLastRun = now.getTime() - lastRun.getTime();
    
    switch (schedule) {
      case '*/5 * * * *': // Every 5 minutes
        return timeSinceLastRun >= 5 * 60 * 1000;
      case '0 * * * *': // Every hour
        return timeSinceLastRun >= 60 * 60 * 1000;
      case '0 0 * * *': // Daily
        return timeSinceLastRun >= 24 * 60 * 60 * 1000;
      default:
        return false;
    }
  }

  /**
   * Normalize sensor type names
   */
  private normalizeSensorType(type: string): string {
    const normalizedTypes: Record<string, string> = {
      'temp': 'TEMPERATURE',
      'temperature': 'TEMPERATURE',
      'humid': 'HUMIDITY',
      'humidity': 'HUMIDITY',
      'co2': 'CO2',
      'carbon_dioxide': 'CO2',
      'power': 'POWER',
      'electricity': 'POWER',
      'light': 'LIGHT',
      'ppfd': 'LIGHT'
    };

    return normalizedTypes[type.toLowerCase()] || type.toUpperCase();
  }

  /**
   * Normalize quality grades
   */
  private normalizeQualityGrade(grade: string): string {
    if (!grade) return 'B'; // Default grade
    
    const normalized = grade.toUpperCase().charAt(0);
    return ['A', 'B', 'C', 'D'].includes(normalized) ? normalized : 'B';
  }

  /**
   * Extract data by path from nested object
   */
  private extractDataByPath(data: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], data);
  }
}

// Export singleton instance
export const etlPipeline = new ETLPipeline();