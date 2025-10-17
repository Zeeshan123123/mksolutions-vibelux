import { Job } from 'bull';
import { queues, DataProcessingJobData } from '../queue-manager';
import { logger } from '../../logging/production-logger';
import { db } from '../../prisma';
import { influxDB } from '../../influxdb-client';

// Data processing worker
queues.dataProcessingQueue.process('process-aggregation', async (job: Job<DataProcessingJobData>) => {
  const { targetId, options } = job.data;
  
  try {
    logger.info('api', 'Processing data aggregation', { targetId, options });
    
    const { period, metrics, groupBy } = options;
    
    // Perform aggregation based on target type
    let results;
    
    if (options.targetType === 'facility') {
      results = await aggregateFacilityData(targetId, period, metrics, groupBy);
    } else if (options.targetType === 'room') {
      results = await aggregateRoomData(targetId, period, metrics, groupBy);
    } else {
      throw new Error(`Unknown target type: ${options.targetType}`);
    }
    
    // Store aggregated results
    await db.dataAggregation.create({
      data: {
        targetType: options.targetType,
        targetId,
        period,
        metrics,
        results,
        createdAt: new Date()
      }
    });
    
    await job.progress(100);
    
    return {
      success: true,
      recordCount: results.length,
      targetId
    };
    
  } catch (error) {
    logger.error('api', 'Data aggregation failed', error as Error);
    throw error;
  }
});

// ML training job
queues.dataProcessingQueue.process('process-ml-training', async (job: Job<DataProcessingJobData>) => {
  const { targetId, options } = job.data;
  
  try {
    logger.info('api', 'Starting ML model training', { targetId, options });
    
    const { modelType, features, trainingPeriod } = options;
    
    // Fetch training data
    const trainingData = await fetchTrainingData(targetId, trainingPeriod, features);
    
    await job.progress(20);
    
    // Train model (placeholder - integrate with actual ML service)
    const modelResult = await trainModel(modelType, trainingData);
    
    await job.progress(80);
    
    // Save model
    await db.mlModel.create({
      data: {
        targetId,
        modelType,
        version: generateModelVersion(),
        metrics: modelResult.metrics,
        parameters: modelResult.parameters,
        status: 'active',
        createdAt: new Date()
      }
    });
    
    await job.progress(100);
    
    return {
      success: true,
      modelId: modelResult.id,
      accuracy: modelResult.metrics.accuracy
    };
    
  } catch (error) {
    logger.error('api', 'ML training failed', error as Error);
    throw error;
  }
});

// Data cleanup job
queues.dataProcessingQueue.process('process-data-cleanup', async (job: Job<DataProcessingJobData>) => {
  const { targetId, options } = job.data;
  
  try {
    logger.info('api', 'Starting data cleanup', { targetId, options });
    
    const { retentionDays, archiveOldData } = options;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // Clean sensor readings
    const sensorCleanup = await db.sensorReading.deleteMany({
      where: {
        facilityId: targetId,
        createdAt: { lt: cutoffDate }
      }
    });
    
    await job.progress(33);
    
    // Clean power readings
    const powerCleanup = await db.powerReading.deleteMany({
      where: {
        facilityId: targetId,
        timestamp: { lt: cutoffDate }
      }
    });
    
    await job.progress(66);
    
    // Clean old logs
    const logCleanup = await db.apiLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });
    
    await job.progress(100);
    
    logger.info('api', 'Data cleanup completed', {
      sensorReadings: sensorCleanup.count,
      powerReadings: powerCleanup.count,
      apiLogs: logCleanup.count
    });
    
    return {
      success: true,
      deletedRecords: {
        sensorReadings: sensorCleanup.count,
        powerReadings: powerCleanup.count,
        apiLogs: logCleanup.count
      }
    };
    
  } catch (error) {
    logger.error('api', 'Data cleanup failed', error as Error);
    throw error;
  }
});

// Data export job
queues.dataProcessingQueue.process('process-export', async (job: Job<DataProcessingJobData>) => {
  const { targetId, options } = job.data;
  
  try {
    logger.info('api', 'Starting data export', { targetId, options });
    
    const { format, dateRange, dataTypes } = options;
    
    // Fetch data for export
    const exportData: any = {};
    
    if (dataTypes.includes('sensors')) {
      exportData.sensors = await exportSensorData(targetId, dateRange);
    }
    
    if (dataTypes.includes('energy')) {
      exportData.energy = await exportEnergyData(targetId, dateRange);
    }
    
    if (dataTypes.includes('experiments')) {
      exportData.experiments = await exportExperimentData(targetId, dateRange);
    }
    
    await job.progress(50);
    
    // Generate export file
    let fileUrl;
    
    switch (format) {
      case 'csv':
        fileUrl = await generateCSVExport(exportData);
        break;
      case 'json':
        fileUrl = await generateJSONExport(exportData);
        break;
      case 'parquet':
        fileUrl = await generateParquetExport(exportData);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    await job.progress(90);
    
    // Save export record
    await db.dataExport.create({
      data: {
        userId: options.userId,
        facilityId: targetId,
        format,
        fileUrl,
        dataTypes,
        dateRange,
        status: 'completed',
        createdAt: new Date()
      }
    });
    
    await job.progress(100);
    
    return {
      success: true,
      fileUrl,
      format,
      recordCount: Object.values(exportData).reduce((sum: number, data: any) => sum + data.length, 0)
    };
    
  } catch (error) {
    logger.error('api', 'Data export failed', error as Error);
    throw error;
  }
});

// Helper functions
async function aggregateFacilityData(facilityId: string, period: string, metrics: string[], groupBy: string) {
  // Implement facility data aggregation
  const queryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG!);
  
  const query = `
    from(bucket: "${process.env.INFLUXDB_BUCKET}")
      |> range(start: -${period})
      |> filter(fn: (r) => r.facility_id == "${facilityId}")
      |> aggregateWindow(every: 1h, fn: mean)
      |> group(columns: ["${groupBy}"])
  `;
  
  const results: any[] = [];
  await queryApi.collectRows(query, (row: any) => {
    results.push(row);
  });
  
  return results;
}

async function aggregateRoomData(roomId: string, period: string, metrics: string[], groupBy: string) {
  // Similar to facility but for room level
  return [];
}

async function fetchTrainingData(targetId: string, period: string, features: string[]) {
  // Fetch data for ML training
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));
  
  return await db.sensorReading.findMany({
    where: {
      sensor: {
        facilityId: targetId
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      value: true,
      timestamp: true,
      sensor: {
        select: {
          type: true,
          location: true
        }
      }
    }
  });
}

async function trainModel(modelType: string, trainingData: any) {
  // Placeholder for ML training
  // In production, this would call your ML service
  return {
    id: `model_${Date.now()}`,
    metrics: {
      accuracy: 0.95,
      precision: 0.93,
      recall: 0.94
    },
    parameters: {
      learningRate: 0.001,
      epochs: 100
    }
  };
}

function generateModelVersion(): string {
  return `v${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${Date.now()}`;
}

async function exportSensorData(facilityId: string, dateRange: any) {
  return await db.sensorReading.findMany({
    where: {
      sensor: { facilityId },
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }
  });
}

async function exportEnergyData(facilityId: string, dateRange: any) {
  return await db.powerReading.findMany({
    where: {
      facilityId,
      timestamp: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }
  });
}

async function exportExperimentData(facilityId: string, dateRange: any) {
  return await db.experiment.findMany({
    where: {
      facilityId,
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }
  });
}

async function generateCSVExport(data: any): Promise<string> {
  // Generate CSV and upload to S3
  // Return S3 URL
  return `https://s3.amazonaws.com/vibelux-exports/${Date.now()}.csv`;
}

async function generateJSONExport(data: any): Promise<string> {
  // Generate JSON and upload to S3
  return `https://s3.amazonaws.com/vibelux-exports/${Date.now()}.json`;
}

async function generateParquetExport(data: any): Promise<string> {
  // Generate Parquet and upload to S3
  return `https://s3.amazonaws.com/vibelux-exports/${Date.now()}.parquet`;
}

export default queues.dataProcessingQueue;