import { Job } from 'bull';
import { queues, SensorDataJobData } from '../queue-manager';
import { logger } from '../../logging/production-logger';
import { db } from '../../prisma';
import { influxDB } from '../../influxdb-client';
import { Point } from '@influxdata/influxdb-client';
import { getWebSocketServer } from '../../websocket/scalable-websocket-server';
import { alertDetector } from '../../sensors/alert-detector';

// Process sensor data in batches
queues.sensorDataQueue.process('process-sensor-data', 10, async (job: Job<SensorDataJobData>) => {
  const { sensorId, readings, batchId } = job.data;
  
  try {
    logger.debug('worker', `Processing ${readings.length} readings for sensor ${sensorId}`);
    
    // Get sensor details
    const sensor = await db.sensor.findUnique({
      where: { id: sensorId },
      include: { facility: true }
    });
    
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }
    
    // Prepare points for InfluxDB
    const points: Point[] = [];
    const postgresData: any[] = [];
    
    for (const reading of readings) {
      // Create InfluxDB point
      const point = new Point('sensor_reading')
        .tag('sensor_id', sensorId)
        .tag('sensor_type', sensor.type)
        .tag('facility_id', sensor.facilityId)
        .tag('location', sensor.location || 'unknown')
        .floatField('value', reading.value)
        .stringField('unit', reading.unit)
        .timestamp(reading.timestamp);
      
      // Add metadata as fields
      if (reading.metadata) {
        Object.entries(reading.metadata).forEach(([key, value]) => {
          if (typeof value === 'number') {
            point.floatField(key, value);
          } else if (typeof value === 'string') {
            point.stringField(key, value);
          } else if (typeof value === 'boolean') {
            point.booleanField(key, value);
          }
        });
      }
      
      points.push(point);
      
      // Prepare PostgreSQL data
      postgresData.push({
        sensorId,
        value: reading.value,
        unit: reading.unit,
        metadata: reading.metadata || {},
        timestamp: reading.timestamp,
        batchId
      });
    }
    
    // Write to InfluxDB
    try {
      const writeApi = influxDB.getWriteApi(
        process.env.INFLUXDB_ORG!,
        process.env.INFLUXDB_BUCKET!,
        'ns' // nanosecond precision
      );
      
      writeApi.writePoints(points);
      await writeApi.close();
      
      logger.debug('worker', `Wrote ${points.length} points to InfluxDB`);
    } catch (error) {
      logger.error('api', 'Failed to write to InfluxDB', error as Error);
      // Continue processing - don't fail the job
    }
    
    // Batch insert to PostgreSQL (for backup and complex queries)
    await db.sensorReading.createMany({
      data: postgresData,
      skipDuplicates: true
    });
    
    // Update sensor last reading
    const latestReading = readings[readings.length - 1];
    await db.sensor.update({
      where: { id: sensorId },
      data: {
        lastReading: latestReading.value,
        lastReadingAt: latestReading.timestamp,
        status: determineSensorStatus(latestReading.value, sensor)
      }
    });
    
    // Check for alerts using the new AlertDetector
    for (const reading of readings) {
      try {
        await alertDetector.detectAlerts({
          sensorId,
          value: reading.value,
          unit: reading.unit,
          timestamp: reading.timestamp,
          metadata: {
            sensorName: sensor.name,
            location: sensor.location,
            sensorType: sensor.type,
            facilityId: sensor.facilityId,
            batchId
          }
        });
      } catch (error) {
        logger.error('worker', 'Alert detection failed for reading', error as Error, {
          sensorId,
          readingId: reading.id || 'unknown'
        });
        // Continue processing other readings
      }
    }
    
    // Broadcast real-time update
    const wsServer = getWebSocketServer();
    wsServer.io.to(`sensor:${sensorId}`).emit('sensor:update', {
      sensorId,
      latestValue: latestReading.value,
      unit: latestReading.unit,
      timestamp: latestReading.timestamp,
      status: sensor.status
    });
    
    // Broadcast to facility
    wsServer.sendToFacility(sensor.facilityId, 'sensor:data', {
      sensorId,
      sensorType: sensor.type,
      value: latestReading.value,
      unit: latestReading.unit,
      timestamp: latestReading.timestamp
    });
    
    return {
      processed: readings.length,
      sensorId,
      batchId
    };
    
  } catch (error) {
    logger.error('api', `Sensor data processing failed for ${sensorId}`, error as Error);
    throw error;
  }
});

// Process aggregated sensor data
queues.sensorDataQueue.process('aggregate-sensor-data', async (job: Job) => {
  const { facilityId, interval, startTime, endTime } = job.data;
  
  try {
    logger.info('api', 'Starting sensor data aggregation', {
      facilityId,
      interval,
      startTime,
      endTime
    });
    
    // Query InfluxDB for aggregated data
    const queryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG!);
    
    const query = `
      from(bucket: "${process.env.INFLUXDB_BUCKET}")
        |> range(start: ${startTime}, stop: ${endTime})
        |> filter(fn: (r) => r.facility_id == "${facilityId}")
        |> aggregateWindow(every: ${interval}, fn: mean, createEmpty: false)
        |> yield(name: "mean")
    `;
    
    const results: any[] = [];
    
    await queryApi.collectRows(query, (row: any) => {
      results.push({
        sensorId: row.sensor_id,
        time: row._time,
        value: row._value,
        field: row._field
      });
    });
    
    // Store aggregated data
    const aggregatedData = results.reduce((acc: any, row) => {
      if (!acc[row.sensorId]) {
        acc[row.sensorId] = [];
      }
      acc[row.sensorId].push({
        timestamp: row.time,
        value: row.value,
        field: row.field
      });
      return acc;
    }, {});
    
    // Save to PostgreSQL for reporting
    for (const [sensorId, data] of Object.entries(aggregatedData)) {
      await db.sensorAggregation.create({
        data: {
          sensorId,
          facilityId,
          interval,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          data: data as any,
          createdAt: new Date()
        }
      });
    }
    
    logger.info('api', 'Sensor data aggregation completed', {
      facilityId,
      sensorCount: Object.keys(aggregatedData).length
    });
    
    return {
      success: true,
      sensorCount: Object.keys(aggregatedData).length,
      interval
    };
    
  } catch (error) {
    logger.error('api', 'Sensor data aggregation failed', error as Error);
    throw error;
  }
});

// Helper functions
function determineSensorStatus(value: number, sensor: any): string {
  // Check against thresholds
  if (sensor.thresholds) {
    const { min, max, critical_min, critical_max } = sensor.thresholds;
    
    if (value < critical_min || value > critical_max) {
      return 'critical';
    }
    if (value < min || value > max) {
      return 'warning';
    }
  }
  
  return 'normal';
}

// Legacy alert functions removed - now using AlertDetector service

export default queues.sensorDataQueue;