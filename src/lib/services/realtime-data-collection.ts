/**
 * Real-time Data Collection Service
 * Collects data from BMS/SCADA devices and stores in time-series database
 */

import { EventEmitter } from 'events';
import { ModbusClient, ModbusDeviceConfig, ModbusDeviceMapping } from '../protocols/modbus-client';
import { BACnetClient, BACnetObjectType, BACnetPropertyId } from '../protocols/bacnet-client';
import { MqttClient, MqttDevice } from '../protocols/mqtt-client';
import { OpcUaClient } from '../protocols/opcua-client';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { prisma } from '@/lib/prisma';

export interface DeviceDataPoint {
  deviceId: string;
  timestamp: Date;
  measurements: Record<string, number | boolean | string>;
  tags?: Record<string, string>;
  quality?: 'good' | 'bad' | 'uncertain';
}

export interface CollectorConfig {
  deviceId: string;
  protocol: 'modbus' | 'bacnet' | 'mqtt' | 'opcua';
  enabled: boolean;
  pollInterval: number; // milliseconds
  connection: any;
  mapping?: any;
  zones?: string[];
}

export interface DataCollectionStats {
  deviceId: string;
  pointsCollected: number;
  lastCollection: Date;
  failureCount: number;
  averageCollectionTime: number;
  status: 'running' | 'stopped' | 'error';
  error?: string;
}

export class RealtimeDataCollectionService extends EventEmitter {
  private collectors: Map<string, any> = new Map();
  private influxDB?: InfluxDB;
  private writeApi?: WriteApi;
  private stats: Map<string, DataCollectionStats> = new Map();
  
  constructor() {
    super();
    this.initializeInfluxDB();
  }
  
  private initializeInfluxDB(): void {
    const url = process.env.INFLUXDB_URL || 'http://localhost:8086';
    const token = process.env.INFLUXDB_TOKEN || 'vibelux-token';
    const org = process.env.INFLUXDB_ORG || 'vibelux';
    const bucket = process.env.INFLUXDB_BUCKET || 'bms-data';
    
    if (url && token) {
      this.influxDB = new InfluxDB({ url, token });
      this.writeApi = this.influxDB.getWriteApi(org, bucket, 'ms');
      this.writeApi.useDefaultTags({ source: 'bms' });
    }
  }
  
  // Start collecting data from a device
  async startCollection(config: CollectorConfig): Promise<void> {
    if (this.collectors.has(config.deviceId)) {
      throw new Error(`Collection already running for device ${config.deviceId}`);
    }
    
    // Initialize stats
    this.stats.set(config.deviceId, {
      deviceId: config.deviceId,
      pointsCollected: 0,
      lastCollection: new Date(),
      failureCount: 0,
      averageCollectionTime: 0,
      status: 'running'
    });
    
    let collector: any;
    
    switch (config.protocol) {
      case 'modbus':
        collector = await this.createModbusCollector(config);
        break;
      case 'bacnet':
        collector = await this.createBACnetCollector(config);
        break;
      case 'mqtt':
        collector = await this.createMqttCollector(config);
        break;
      case 'opcua':
        collector = await this.createOpcUaCollector(config);
        break;
      default:
        throw new Error(`Unsupported protocol: ${config.protocol}`);
    }
    
    this.collectors.set(config.deviceId, collector);
    this.emit('collectionStarted', config.deviceId);
  }
  
  // Stop collecting data from a device
  async stopCollection(deviceId: string): Promise<void> {
    const collector = this.collectors.get(deviceId);
    if (!collector) {
      throw new Error(`No collector found for device ${deviceId}`);
    }
    
    // Stop the collector
    if (collector.stop) {
      await collector.stop();
    }
    
    this.collectors.delete(deviceId);
    
    const stats = this.stats.get(deviceId);
    if (stats) {
      stats.status = 'stopped';
    }
    
    this.emit('collectionStopped', deviceId);
  }
  
  // Create Modbus collector
  private async createModbusCollector(config: CollectorConfig): Promise<any> {
    const client = new ModbusClient(config.connection as ModbusDeviceConfig, config.mapping);
    
    // Connect to device
    const connected = await client.connect();
    if (!connected) {
      throw new Error('Failed to connect to Modbus device');
    }
    
    // Set up polling
    const interval = setInterval(async () => {
      const startTime = Date.now();
      const stats = this.stats.get(config.deviceId)!;
      
      try {
        const data = await client.readAllMappedRegisters();
        
        const dataPoint: DeviceDataPoint = {
          deviceId: config.deviceId,
          timestamp: new Date(),
          measurements: data,
          quality: 'good'
        };
        
        await this.storeDataPoint(dataPoint);
        
        // Update stats
        stats.pointsCollected++;
        stats.lastCollection = new Date();
        const collectionTime = Date.now() - startTime;
        stats.averageCollectionTime = 
          (stats.averageCollectionTime * (stats.pointsCollected - 1) + collectionTime) / stats.pointsCollected;
        stats.status = 'running';
        stats.error = undefined;
        
        this.emit('dataCollected', dataPoint);
      } catch (error) {
        stats.failureCount++;
        stats.status = 'error';
        stats.error = (error as Error).message;
        this.emit('collectionError', config.deviceId, error);
      }
    }, config.pollInterval);
    
    return {
      client,
      interval,
      stop: async () => {
        clearInterval(interval);
        await client.disconnect();
      }
    };
  }
  
  // Create BACnet collector
  private async createBACnetCollector(config: CollectorConfig): Promise<any> {
    const client = new BACnetClient(config.connection);
    client.connect();
    
    // Set up COV subscriptions or polling based on device capabilities
    const deviceId = config.connection.deviceId;
    const address = config.connection.address;
    const mapping = config.mapping || {};
    
    // Subscribe to COV for efficient updates
    const subscriptions: number[] = [];
    
    for (const [key, object] of Object.entries(mapping.objects || {})) {
      const obj = object as any;
      try {
        await client.subscribeCOV(
          address,
          obj.type,
          obj.instance,
          true,
          300 // 5 minute lifetime
        );
        subscriptions.push(obj.instance);
      } catch (error) {
        logger.error('api', `Failed to subscribe to COV for ${key}:`, error);
      }
    }
    
    // Handle value changes
    client.on('valueChange', async (data) => {
      const dataPoint: DeviceDataPoint = {
        deviceId: config.deviceId,
        timestamp: new Date(),
        measurements: {
          [data.objectInstance]: data.values[0]?.value
        },
        quality: 'good'
      };
      
      await this.storeDataPoint(dataPoint);
      this.emit('dataCollected', dataPoint);
    });
    
    // Also set up periodic polling as backup
    const interval = setInterval(async () => {
      const stats = this.stats.get(config.deviceId)!;
      
      try {
        const measurements: Record<string, any> = {};
        
        for (const [key, object] of Object.entries(mapping.objects || {})) {
          const obj = object as any;
          try {
            const value = await client.readProperty(
              address,
              obj.type,
              obj.instance,
              BACnetPropertyId.PRESENT_VALUE
            );
            measurements[key] = value;
          } catch (error) {
            logger.error('api', `Failed to read ${key}:`, error);
          }
        }
        
        if (Object.keys(measurements).length > 0) {
          const dataPoint: DeviceDataPoint = {
            deviceId: config.deviceId,
            timestamp: new Date(),
            measurements,
            quality: 'good'
          };
          
          await this.storeDataPoint(dataPoint);
          stats.pointsCollected++;
          stats.lastCollection = new Date();
          this.emit('dataCollected', dataPoint);
        }
      } catch (error) {
        stats.failureCount++;
        stats.status = 'error';
        stats.error = (error as Error).message;
        this.emit('collectionError', config.deviceId, error);
      }
    }, config.pollInterval);
    
    return {
      client,
      interval,
      subscriptions,
      stop: async () => {
        clearInterval(interval);
        client.disconnect();
      }
    };
  }
  
  // Create MQTT collector
  private async createMqttCollector(config: CollectorConfig): Promise<any> {
    const client = new MqttClient(config.connection);
    await client.connect();
    
    const device: MqttDevice = {
      deviceId: config.deviceId,
      deviceType: config.mapping?.deviceType || 'generic',
      online: false,
      lastSeen: new Date(),
      topics: config.mapping?.topics || {}
    };
    
    client.registerDevice(device);
    
    // Handle device updates
    client.on('deviceUpdate', async (deviceId, data) => {
      if (deviceId === config.deviceId) {
        const dataPoint: DeviceDataPoint = {
          deviceId: config.deviceId,
          timestamp: new Date(),
          measurements: data,
          quality: 'good'
        };
        
        await this.storeDataPoint(dataPoint);
        
        const stats = this.stats.get(config.deviceId)!;
        stats.pointsCollected++;
        stats.lastCollection = new Date();
        
        this.emit('dataCollected', dataPoint);
      }
    });
    
    // Handle alarms
    client.on('deviceAlarm', (deviceId, alarm) => {
      if (deviceId === config.deviceId) {
        this.emit('deviceAlarm', deviceId, alarm);
      }
    });
    
    return {
      client,
      stop: async () => {
        client.unregisterDevice(config.deviceId);
        await client.disconnect();
      }
    };
  }
  
  // Create OPC UA collector
  private async createOpcUaCollector(config: CollectorConfig): Promise<any> {
    const client = new OpcUaClient(config.connection);
    await client.connect();
    
    const mapping = config.mapping || {};
    const nodeIds = Object.values(mapping.nodes || {}) as string[];
    
    // Create subscription
    const subscriptionId = await client.createSubscription(1000);
    
    // Monitor nodes
    for (const nodeId of nodeIds) {
      try {
        await client.monitorNode(subscriptionId, nodeId);
      } catch (error) {
        logger.error('api', `Failed to monitor node ${nodeId}:`, error);
      }
    }
    
    // Handle data changes
    client.on('dataChange', async (data) => {
      const dataPoint: DeviceDataPoint = {
        deviceId: config.deviceId,
        timestamp: new Date(),
        measurements: {
          [data.nodeId]: data.value
        },
        quality: data.statusCode === 'Good' ? 'good' : 'uncertain'
      };
      
      await this.storeDataPoint(dataPoint);
      this.emit('dataCollected', dataPoint);
    });
    
    // Periodic read for non-subscription nodes
    const interval = setInterval(async () => {
      const stats = this.stats.get(config.deviceId)!;
      
      try {
        const values = await client.read(nodeIds);
        const measurements: Record<string, any> = {};
        
        nodeIds.forEach((nodeId, index) => {
          if (values[index]) {
            measurements[nodeId] = values[index].value;
          }
        });
        
        if (Object.keys(measurements).length > 0) {
          const dataPoint: DeviceDataPoint = {
            deviceId: config.deviceId,
            timestamp: new Date(),
            measurements,
            quality: 'good'
          };
          
          await this.storeDataPoint(dataPoint);
          stats.pointsCollected++;
          stats.lastCollection = new Date();
          this.emit('dataCollected', dataPoint);
        }
      } catch (error) {
        stats.failureCount++;
        stats.status = 'error';
        stats.error = (error as Error).message;
        this.emit('collectionError', config.deviceId, error);
      }
    }, config.pollInterval);
    
    return {
      client,
      interval,
      subscriptionId,
      stop: async () => {
        clearInterval(interval);
        await client.disconnect();
      }
    };
  }
  
  // Store data point in time-series database
  private async storeDataPoint(dataPoint: DeviceDataPoint): Promise<void> {
    // Store in InfluxDB if available
    if (this.writeApi) {
      const point = new Point('device_data')
        .tag('device_id', dataPoint.deviceId)
        .tag('quality', dataPoint.quality || 'good')
        .timestamp(dataPoint.timestamp);
      
      // Add tags
      if (dataPoint.tags) {
        Object.entries(dataPoint.tags).forEach(([key, value]) => {
          point.tag(key, value);
        });
      }
      
      // Add measurements
      Object.entries(dataPoint.measurements).forEach(([key, value]) => {
        if (typeof value === 'number') {
          point.floatField(key, value);
        } else if (typeof value === 'boolean') {
          point.booleanField(key, value);
        } else {
          point.stringField(key, String(value));
        }
      });
      
      this.writeApi.writePoint(point);
    }
    
    // Also store latest values in PostgreSQL for quick access
    try {
      await prisma.deviceReading.create({
        data: {
          deviceId: dataPoint.deviceId,
          timestamp: dataPoint.timestamp,
          data: dataPoint.measurements as any,
          quality: dataPoint.quality
        }
      });
    } catch (error) {
      logger.error('api', 'Failed to store in PostgreSQL:', error );
    }
  }
  
  // Get collection statistics
  getStats(deviceId?: string): DataCollectionStats | DataCollectionStats[] {
    if (deviceId) {
      const stats = this.stats.get(deviceId);
      if (!stats) {
        throw new Error(`No stats found for device ${deviceId}`);
      }
      return stats;
    }
    
    return Array.from(this.stats.values());
  }
  
  // Get active collectors
  getActiveCollectors(): string[] {
    return Array.from(this.collectors.keys());
  }
  
  // Flush pending writes
  async flush(): Promise<void> {
    if (this.writeApi) {
      await this.writeApi.flush();
    }
  }
  
  // Clean up resources
  async shutdown(): Promise<void> {
    // Stop all collectors
    const deviceIds = Array.from(this.collectors.keys());
    for (const deviceId of deviceIds) {
      await this.stopCollection(deviceId);
    }
    
    // Flush and close InfluxDB
    if (this.writeApi) {
      await this.writeApi.close();
    }
  }
}

// Singleton instance
export const dataCollectionService = new RealtimeDataCollectionService();