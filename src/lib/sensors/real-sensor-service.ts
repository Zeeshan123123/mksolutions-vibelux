/**
 * Real Sensor Communication Service
 * Implements actual hardware communication protocols
 */

import { EventEmitter } from 'events';
import * as mqtt from 'mqtt';
// Avoid bundling optional native dep in serverless
let ModbusRTU: any;
try {
  // eslint-disable-next-line no-eval
  ModbusRTU = eval("require('modbus-serial')");
} catch (e) {
  ModbusRTU = null;
}
import { SerialPort } from 'serialport';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logging/production-logger';

export type SensorProtocol = 'modbus' | 'mqtt' | 'serial' | 'http';
export type SensorStatus = 'connected' | 'disconnected' | 'error' | 'calibrating';

export interface SensorConfig {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'ph' | 'ec' | 'light' | 'pressure';
  protocol: SensorProtocol;
  connectionDetails: {
    // Modbus
    modbusAddress?: number;
    modbusRegister?: number;
    modbusPort?: string;
    modbusIp?: string;
    
    // MQTT
    mqttBroker?: string;
    mqttTopic?: string;
    mqttUsername?: string;
    mqttPassword?: string;
    
    // Serial
    serialPort?: string;
    baudRate?: number;
    
    // HTTP
    httpEndpoint?: string;
    httpMethod?: 'GET' | 'POST';
    httpHeaders?: Record<string, string>;
  };
  calibration: {
    offset: number;
    scale: number;
    lastCalibrated: Date;
  };
  pollingInterval: number; // seconds
  alertThresholds?: {
    min?: number;
    max?: number;
  };
}

export interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'good' | 'questionable' | 'bad';
  raw?: number;
}

export class RealSensorService extends EventEmitter {
  private static instance: RealSensorService;
  private sensors: Map<string, SensorConfig> = new Map();
  private connections: Map<string, any> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private sensorStatus: Map<string, SensorStatus> = new Map();
  private lastReadings: Map<string, SensorReading> = new Map();
  private errorCounts: Map<string, number> = new Map();
  
  private constructor() {
    super();
  }
  
  static getInstance(): RealSensorService {
    if (!this.instance) {
      this.instance = new RealSensorService();
    }
    return this.instance;
  }
  
  /**
   * Register a new sensor
   */
  async registerSensor(config: SensorConfig): Promise<void> {
    try {
      this.sensors.set(config.id, config);
      this.sensorStatus.set(config.id, 'disconnected');
      this.errorCounts.set(config.id, 0);
      
      // Store configuration in database
      await prisma.zoneSensor.upsert({
        where: { id: config.id },
        update: {
          name: config.name,
          sensorType: config.type as any,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          id: config.id,
          zoneId: 'default-zone', // Should be passed in config
          name: config.name,
          sensorType: config.type as any,
          unit: this.getUnitForType(config.type),
          isActive: true
        }
      });
      
      // Connect to sensor
      await this.connectSensor(config);
      
      // Start polling
      this.startPolling(config);
      
      logger.info(`Sensor registered: ${config.name} (${config.protocol})`);
      this.emit('sensorRegistered', config);
      
    } catch (error) {
      logger.error('Failed to register sensor:', error);
      this.emit('error', { sensorId: config.id, error });
      throw error;
    }
  }
  
  /**
   * Connect to sensor based on protocol
   */
  private async connectSensor(config: SensorConfig): Promise<void> {
    try {
      switch (config.protocol) {
        case 'modbus':
          await this.connectModbus(config);
          break;
        case 'mqtt':
          await this.connectMqtt(config);
          break;
        case 'serial':
          await this.connectSerial(config);
          break;
        case 'http':
          // HTTP doesn't need persistent connection
          this.sensorStatus.set(config.id, 'connected');
          break;
      }
    } catch (error) {
      logger.error(`Failed to connect to sensor ${config.id}:`, error);
      this.sensorStatus.set(config.id, 'error');
      throw error;
    }
  }
  
  /**
   * Connect to Modbus sensor
   */
  private async connectModbus(config: SensorConfig): Promise<void> {
    const client = new ModbusRTU();
    
    try {
      if (config.connectionDetails.modbusIp) {
        // TCP connection
        await client.connectTCP(config.connectionDetails.modbusIp, {
          port: parseInt(config.connectionDetails.modbusPort || '502')
        });
      } else if (config.connectionDetails.modbusPort) {
        // RTU connection
        await client.connectRTU(config.connectionDetails.modbusPort, {
          baudRate: config.connectionDetails.baudRate || 9600
        });
      }
      
      client.setID(config.connectionDetails.modbusAddress || 1);
      this.connections.set(config.id, client);
      this.sensorStatus.set(config.id, 'connected');
      
      logger.info(`Modbus sensor connected: ${config.name}`);
      
    } catch (error) {
      logger.error(`Modbus connection failed for ${config.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Connect to MQTT sensor
   */
  private async connectMqtt(config: SensorConfig): Promise<void> {
    const client = mqtt.connect(config.connectionDetails.mqttBroker || 'mqtt://localhost', {
      username: config.connectionDetails.mqttUsername,
      password: config.connectionDetails.mqttPassword
    });
    
    return new Promise((resolve, reject) => {
      client.on('connect', () => {
        if (config.connectionDetails.mqttTopic) {
          client.subscribe(config.connectionDetails.mqttTopic, (err) => {
            if (err) {
              reject(err);
            } else {
              this.connections.set(config.id, client);
              this.sensorStatus.set(config.id, 'connected');
              
              // Set up message handler
              client.on('message', (topic, message) => {
                if (topic === config.connectionDetails.mqttTopic) {
                  this.handleMqttMessage(config, message);
                }
              });
              
              logger.info(`MQTT sensor connected: ${config.name}`);
              resolve();
            }
          });
        }
      });
      
      client.on('error', (error) => {
        logger.error(`MQTT connection failed for ${config.name}:`, error);
        reject(error);
      });
    });
  }
  
  /**
   * Connect to Serial sensor
   */
  private async connectSerial(config: SensorConfig): Promise<void> {
    const port = new SerialPort({
      path: config.connectionDetails.serialPort || '/dev/ttyUSB0',
      baudRate: config.connectionDetails.baudRate || 9600
    });
    
    return new Promise((resolve, reject) => {
      port.on('open', () => {
        this.connections.set(config.id, port);
        this.sensorStatus.set(config.id, 'connected');
        
        // Set up data handler
        port.on('data', (data: Buffer) => {
          this.handleSerialData(config, data);
        });
        
        logger.info(`Serial sensor connected: ${config.name}`);
        resolve();
      });
      
      port.on('error', (error) => {
        logger.error(`Serial connection failed for ${config.name}:`, error);
        reject(error);
      });
    });
  }
  
  /**
   * Start polling sensor
   */
  private startPolling(config: SensorConfig): void {
    // Don't poll MQTT sensors (they push data)
    if (config.protocol === 'mqtt') return;
    
    const interval = setInterval(async () => {
      try {
        await this.readSensor(config);
      } catch (error) {
        this.handleReadError(config, error);
      }
    }, config.pollingInterval * 1000);
    
    this.pollingIntervals.set(config.id, interval);
  }
  
  /**
   * Read sensor value
   */
  private async readSensor(config: SensorConfig): Promise<void> {
    let rawValue: number | undefined;
    
    try {
      switch (config.protocol) {
        case 'modbus':
          rawValue = await this.readModbus(config);
          break;
        case 'serial':
          // Serial data comes via event, not polling
          return;
        case 'http':
          rawValue = await this.readHttp(config);
          break;
      }
      
      if (rawValue !== undefined) {
        const calibratedValue = this.applyCalibration(rawValue, config.calibration);
        await this.processSensorReading(config, calibratedValue, rawValue);
      }
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Read Modbus register
   */
  private async readModbus(config: SensorConfig): Promise<number> {
    const client = this.connections.get(config.id) as ModbusRTU;
    if (!client) throw new Error('Modbus client not connected');
    
    const register = config.connectionDetails.modbusRegister || 0;
    const result = await client.readHoldingRegisters(register, 1);
    
    return result.data[0];
  }
  
  /**
   * Read HTTP endpoint
   */
  private async readHttp(config: SensorConfig): Promise<number> {
    if (!config.connectionDetails.httpEndpoint) {
      throw new Error('HTTP endpoint not configured');
    }
    
    const response = await fetch(config.connectionDetails.httpEndpoint, {
      method: config.connectionDetails.httpMethod || 'GET',
      headers: config.connectionDetails.httpHeaders
    });
    
    const data = await response.json();
    
    // Parse value from response (implementation depends on API format)
    return this.parseHttpResponse(data, config);
  }
  
  /**
   * Handle MQTT message
   */
  private handleMqttMessage(config: SensorConfig, message: Buffer): void {
    try {
      const rawValue = parseFloat(message.toString());
      if (!isNaN(rawValue)) {
        const calibratedValue = this.applyCalibration(rawValue, config.calibration);
        this.processSensorReading(config, calibratedValue, rawValue);
      }
    } catch (error) {
      logger.error(`Failed to parse MQTT message for ${config.name}:`, error);
    }
  }
  
  /**
   * Handle Serial data
   */
  private handleSerialData(config: SensorConfig, data: Buffer): void {
    try {
      const rawValue = parseFloat(data.toString().trim());
      if (!isNaN(rawValue)) {
        const calibratedValue = this.applyCalibration(rawValue, config.calibration);
        this.processSensorReading(config, calibratedValue, rawValue);
      }
    } catch (error) {
      logger.error(`Failed to parse serial data for ${config.name}:`, error);
    }
  }
  
  /**
   * Apply calibration to raw value
   */
  private applyCalibration(raw: number, calibration: SensorConfig['calibration']): number {
    return raw * calibration.scale + calibration.offset;
  }
  
  /**
   * Process and store sensor reading
   */
  private async processSensorReading(
    config: SensorConfig, 
    value: number, 
    raw?: number
  ): Promise<void> {
    const reading: SensorReading = {
      sensorId: config.id,
      value,
      unit: this.getUnitForType(config.type),
      timestamp: new Date(),
      quality: this.assessQuality(value, config),
      raw
    };
    
    // Store in memory
    this.lastReadings.set(config.id, reading);
    
    // Store in database
    try {
      await prisma.sensorReading.create({
        data: {
          sensorId: config.id,
          value,
          timestamp: reading.timestamp,
          quality: reading.quality
        }
      });
      
      // Update sensor last reading
      await prisma.zoneSensor.update({
        where: { id: config.id },
        data: {
          lastReading: value,
          lastReadingAt: reading.timestamp
        }
      });
      
    } catch (error) {
      logger.error(`Failed to store reading for ${config.name}:`, error);
    }
    
    // Check thresholds
    this.checkThresholds(config, value);
    
    // Reset error count on successful reading
    this.errorCounts.set(config.id, 0);
    
    // Emit reading event
    this.emit('sensorReading', reading);
  }
  
  /**
   * Handle sensor read error
   */
  private handleReadError(config: SensorConfig, error: any): void {
    const errorCount = (this.errorCounts.get(config.id) || 0) + 1;
    this.errorCounts.set(config.id, errorCount);
    
    logger.error(`Sensor read error for ${config.name} (${errorCount} errors):`, error);
    
    // Mark as disconnected after 3 consecutive errors
    if (errorCount >= 3) {
      this.sensorStatus.set(config.id, 'disconnected');
      this.emit('sensorDisconnected', {
        sensorId: config.id,
        name: config.name,
        errorCount
      });
      
      // Try to reconnect
      this.attemptReconnection(config);
    }
  }
  
  /**
   * Attempt to reconnect to sensor
   */
  private async attemptReconnection(config: SensorConfig): Promise<void> {
    logger.info(`Attempting to reconnect to ${config.name}...`);
    
    try {
      // Close existing connection
      const connection = this.connections.get(config.id);
      if (connection) {
        if (config.protocol === 'modbus' && connection.close) {
          connection.close();
        } else if (config.protocol === 'mqtt' && connection.end) {
          connection.end();
        } else if (config.protocol === 'serial' && connection.close) {
          connection.close();
        }
        this.connections.delete(config.id);
      }
      
      // Reconnect
      await this.connectSensor(config);
      this.errorCounts.set(config.id, 0);
      
      logger.info(`Successfully reconnected to ${config.name}`);
      this.emit('sensorReconnected', {
        sensorId: config.id,
        name: config.name
      });
      
    } catch (error) {
      logger.error(`Failed to reconnect to ${config.name}:`, error);
      
      // Retry after 30 seconds
      setTimeout(() => this.attemptReconnection(config), 30000);
    }
  }
  
  /**
   * Check alert thresholds
   */
  private checkThresholds(config: SensorConfig, value: number): void {
    if (!config.alertThresholds) return;
    
    const { min, max } = config.alertThresholds;
    
    if (min !== undefined && value < min) {
      this.emit('thresholdViolation', {
        sensorId: config.id,
        name: config.name,
        type: 'low',
        value,
        threshold: min
      });
    }
    
    if (max !== undefined && value > max) {
      this.emit('thresholdViolation', {
        sensorId: config.id,
        name: config.name,
        type: 'high',
        value,
        threshold: max
      });
    }
  }
  
  /**
   * Assess reading quality
   */
  private assessQuality(value: number, config: SensorConfig): SensorReading['quality'] {
    // Check if value is within reasonable range for sensor type
    const ranges: Record<string, [number, number]> = {
      temperature: [-50, 150],
      humidity: [0, 100],
      co2: [0, 5000],
      ph: [0, 14],
      ec: [0, 10],
      light: [0, 100000],
      pressure: [800, 1200]
    };
    
    const [min, max] = ranges[config.type] || [Number.MIN_VALUE, Number.MAX_VALUE];
    
    if (value < min || value > max) {
      return 'bad';
    }
    
    // Check if value changed too quickly
    const lastReading = this.lastReadings.get(config.id);
    if (lastReading) {
      const changeRate = Math.abs(value - lastReading.value) / 
        ((Date.now() - lastReading.timestamp.getTime()) / 1000);
      
      // Define max change rates for each sensor type (per second)
      const maxChangeRates: Record<string, number> = {
        temperature: 1,
        humidity: 5,
        co2: 50,
        ph: 0.5,
        ec: 0.5,
        light: 1000,
        pressure: 10
      };
      
      const maxRate = maxChangeRates[config.type] || Number.MAX_VALUE;
      if (changeRate > maxRate) {
        return 'questionable';
      }
    }
    
    return 'good';
  }
  
  /**
   * Parse HTTP response based on sensor type
   */
  private parseHttpResponse(data: any, config: SensorConfig): number {
    // This should be customized based on the API format
    // Common patterns:
    if (typeof data === 'number') return data;
    if (data.value !== undefined) return data.value;
    if (data.data?.value !== undefined) return data.data.value;
    if (data[config.type] !== undefined) return data[config.type];
    
    throw new Error('Unable to parse HTTP response');
  }
  
  /**
   * Get unit for sensor type
   */
  private getUnitForType(type: SensorConfig['type']): string {
    const units: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      co2: 'ppm',
      ph: 'pH',
      ec: 'mS/cm',
      light: 'μmol/m²/s',
      pressure: 'hPa'
    };
    
    return units[type] || '';
  }
  
  /**
   * Get sensor status
   */
  getSensorStatus(sensorId: string): SensorStatus {
    return this.sensorStatus.get(sensorId) || 'disconnected';
  }
  
  /**
   * Get last reading
   */
  getLastReading(sensorId: string): SensorReading | undefined {
    return this.lastReadings.get(sensorId);
  }
  
  /**
   * Get all sensors
   */
  getAllSensors(): SensorConfig[] {
    return Array.from(this.sensors.values());
  }
  
  /**
   * Calibrate sensor
   */
  async calibrateSensor(
    sensorId: string, 
    referenceValue: number
  ): Promise<void> {
    const config = this.sensors.get(sensorId);
    if (!config) throw new Error('Sensor not found');
    
    const lastReading = this.lastReadings.get(sensorId);
    if (!lastReading || !lastReading.raw) {
      throw new Error('No recent raw reading available for calibration');
    }
    
    // Calculate new calibration
    const newOffset = referenceValue - lastReading.raw * config.calibration.scale;
    
    // Update calibration
    config.calibration.offset = newOffset;
    config.calibration.lastCalibrated = new Date();
    
    // Store updated config
    this.sensors.set(sensorId, config);
    
    logger.info(`Sensor ${config.name} calibrated. New offset: ${newOffset}`);
    this.emit('sensorCalibrated', {
      sensorId,
      offset: newOffset,
      referenceValue
    });
  }
  
  /**
   * Disconnect sensor
   */
  async disconnectSensor(sensorId: string): Promise<void> {
    const config = this.sensors.get(sensorId);
    if (!config) return;
    
    // Stop polling
    const interval = this.pollingIntervals.get(sensorId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(sensorId);
    }
    
    // Close connection
    const connection = this.connections.get(sensorId);
    if (connection) {
      try {
        if (config.protocol === 'modbus' && connection.close) {
          connection.close();
        } else if (config.protocol === 'mqtt' && connection.end) {
          connection.end();
        } else if (config.protocol === 'serial' && connection.close) {
          connection.close();
        }
      } catch (error) {
        logger.error(`Error closing connection for ${config.name}:`, error);
      }
      this.connections.delete(sensorId);
    }
    
    // Update status
    this.sensorStatus.set(sensorId, 'disconnected');
    
    // Update database
    await prisma.zoneSensor.update({
      where: { id: sensorId },
      data: { isActive: false }
    });
    
    logger.info(`Sensor disconnected: ${config.name}`);
    this.emit('sensorDisconnected', { sensorId, name: config.name });
  }
  
  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down sensor service...');
    
    // Disconnect all sensors
    for (const sensorId of this.sensors.keys()) {
      await this.disconnectSensor(sensorId);
    }
    
    this.sensors.clear();
    this.lastReadings.clear();
    this.sensorStatus.clear();
    this.errorCounts.clear();
    
    logger.info('Sensor service shutdown complete');
  }
}

// Export singleton instance
export const realSensorService = RealSensorService.getInstance();