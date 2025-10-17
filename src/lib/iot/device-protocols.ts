/**
 * IoT Device Protocols
 * Support for various IoT communication protocols
 */

import { logger } from '@/lib/logging/production-logger';

export interface DeviceReading {
  deviceId: string;
  timestamp: Date;
  sensorType: string;
  value: number;
  unit: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface DeviceCommand {
  deviceId: string;
  command: string;
  parameters?: Record<string, any>;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeviceStatus {
  deviceId: string;
  online: boolean;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength?: number;
  firmware?: string;
  errorCodes?: string[];
}

export interface IoTDevice {
  id: string;
  name: string;
  type: string;
  protocol: string;
  location: string;
  facilityId: string;
  configuration: DeviceConfiguration;
  status: DeviceStatus;
  lastReading?: DeviceReading;
  capabilities: string[];
  metadata?: Record<string, any>;
}

export interface DeviceConfiguration {
  deviceAddress: string;
  communicationSettings: Record<string, any>;
  sensorSettings: Record<string, any>;
  alertThresholds: Record<string, { min?: number; max?: number }>;
  reportingInterval: number; // seconds
  calibration?: Record<string, number>;
}

// MQTT Protocol Handler
export class MQTTProtocol {
  private client: any;
  private config: {
    brokerUrl: string;
    username?: string;
    password?: string;
    clientId: string;
  };

  constructor(config: MQTTProtocol['config']) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // In a real implementation, you'd use the mqtt library
      // const mqtt = require('mqtt');
      // this.client = mqtt.connect(this.config.brokerUrl, {
      //   username: this.config.username,
      //   password: this.config.password,
      //   clientId: this.config.clientId
      // });
      
      logger.info('api', 'Connected to MQTT broker', { brokerUrl: this.config.brokerUrl });
    } catch (error) {
      logger.error('api', 'Failed to connect to MQTT broker', error as Error);
      throw error;
    }
  }

  async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    try {
      // this.client.subscribe(topic);
      // this.client.on('message', (receivedTopic, message) => {
      //   if (receivedTopic === topic) {
      //     callback(JSON.parse(message.toString()));
      //   }
      // });
      
      logger.info('api', 'Subscribed to topic', { topic });
    } catch (error) {
      logger.error('api', 'Failed to subscribe to topic', error as Error);
      throw error;
    }
  }

  async publish(topic: string, message: any): Promise<void> {
    try {
      // this.client.publish(topic, JSON.stringify(message));
      logger.info('api', 'Published message', { topic, message });
    } catch (error) {
      logger.error('api', 'Failed to publish message', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // this.client.end();
      logger.info('api', 'Disconnected from MQTT broker');
    } catch (error) {
      logger.error('api', 'Failed to disconnect from MQTT broker', error as Error);
      throw error;
    }
  }
}

// LoRaWAN Protocol Handler
export class LoRaWANProtocol {
  private config: {
    networkServerUrl: string;
    applicationId: string;
    accessKey: string;
  };

  constructor(config: LoRaWANProtocol['config']) {
    this.config = config;
  }

  async sendDownlink(deviceEUI: string, payload: Buffer, port: number = 1): Promise<void> {
    try {
      // Implementation for LoRaWAN downlink
      const downlinkData = {
        deviceEUI,
        fPort: port,
        payload: payload.toString('base64'),
        confirmed: false
      };

      logger.info('api', 'Sending downlink message', { deviceEUI, port, payloadLength: payload.length });
    } catch (error) {
      logger.error('api', 'Failed to send downlink', error as Error);
      throw error;
    }
  }

  parseUplinkPayload(payload: Buffer, deviceType: string): DeviceReading[] {
    try {
      const readings: DeviceReading[] = [];
      
      // Example payload parsing for different device types
      switch (deviceType) {
        case 'climate_sensor':
          if (payload.length >= 6) {
            const temperature = (payload.readInt16BE(0) / 100);
            const humidity = (payload.readUInt16BE(2) / 100);
            const co2 = payload.readUInt16BE(4);
            
            readings.push(
              {
                deviceId: '',
                timestamp: new Date(),
                sensorType: 'temperature',
                value: temperature,
                unit: '°C'
              },
              {
                deviceId: '',
                timestamp: new Date(),
                sensorType: 'humidity',
                value: humidity,
                unit: '%'
              },
              {
                deviceId: '',
                timestamp: new Date(),
                sensorType: 'co2',
                value: co2,
                unit: 'ppm'
              }
            );
          }
          break;
          
        case 'soil_sensor':
          if (payload.length >= 8) {
            const moisture = (payload.readUInt16BE(0) / 100);
            const ph = (payload.readUInt16BE(2) / 100);
            const ec = payload.readUInt16BE(4);
            const temp = (payload.readInt16BE(6) / 100);
            
            readings.push(
              {
                deviceId: '',
                timestamp: new Date(),
                sensorType: 'soil_moisture',
                value: moisture,
                unit: '%'
              },
              {
                deviceId: '',
                timestamp: new Date(),
                sensorType: 'soil_ph',
                value: ph,
                unit: 'pH'
              },
              {
                deviceId: '',
                timestamp: new Date(),
                sensorType: 'soil_ec',
                value: ec,
                unit: 'µS/cm'
              },
              {
                deviceId: '',
                timestamp: new Date(),
                sensorType: 'soil_temperature',
                value: temp,
                unit: '°C'
              }
            );
          }
          break;
      }
      
      return readings;
    } catch (error) {
      logger.error('api', 'Failed to parse uplink payload', error as Error);
      return [];
    }
  }
}

// Modbus RTU/TCP Protocol Handler
export class ModbusProtocol {
  private config: {
    type: 'RTU' | 'TCP';
    host?: string;
    port?: number;
    serialPort?: string;
    baudRate?: number;
    timeout: number;
  };

  constructor(config: ModbusProtocol['config']) {
    this.config = config;
  }

  async readHoldingRegisters(slaveId: number, startAddress: number, quantity: number): Promise<number[]> {
    try {
      // Mock implementation - in real use, you'd use a modbus library
      const mockData = Array(quantity).fill(0).map(() => Math.floor(Math.random() * 65535));
      
      logger.info('api', 'Read holding registers', { 
        slaveId, 
        startAddress, 
        quantity, 
        type: this.config.type 
      });
      
      return mockData;
    } catch (error) {
      logger.error('api', 'Failed to read holding registers', error as Error);
      throw error;
    }
  }

  async readInputRegisters(slaveId: number, startAddress: number, quantity: number): Promise<number[]> {
    try {
      const mockData = Array(quantity).fill(0).map(() => Math.floor(Math.random() * 65535));
      
      logger.info('api', 'Read input registers', { 
        slaveId, 
        startAddress, 
        quantity, 
        type: this.config.type 
      });
      
      return mockData;
    } catch (error) {
      logger.error('api', 'Failed to read input registers', error as Error);
      throw error;
    }
  }

  async writeSingleRegister(slaveId: number, address: number, value: number): Promise<void> {
    try {
      logger.info('api', 'Write single register', { 
        slaveId, 
        address, 
        value, 
        type: this.config.type 
      });
    } catch (error) {
      logger.error('api', 'Failed to write single register', error as Error);
      throw error;
    }
  }

  async writeMultipleRegisters(slaveId: number, startAddress: number, values: number[]): Promise<void> {
    try {
      logger.info('api', 'Write multiple registers', { 
        slaveId, 
        startAddress, 
        count: values.length, 
        type: this.config.type 
      });
    } catch (error) {
      logger.error('api', 'Failed to write multiple registers', error as Error);
      throw error;
    }
  }
}

// HTTP/RESTful API Protocol Handler
export class HTTPProtocol {
  private config: {
    baseUrl: string;
    authentication?: {
      type: 'basic' | 'bearer' | 'apikey';
      credentials: Record<string, string>;
    };
    timeout: number;
  };

  constructor(config: HTTPProtocol['config']) {
    this.config = config;
  }

  async getDeviceData(deviceId: string, endpoint: string): Promise<any> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add authentication headers
      if (this.config.authentication) {
        switch (this.config.authentication.type) {
          case 'basic':
            const basicAuth = Buffer.from(
              `${this.config.authentication.credentials.username}:${this.config.authentication.credentials.password}`
            ).toString('base64');
            headers['Authorization'] = `Basic ${basicAuth}`;
            break;
          case 'bearer':
            headers['Authorization'] = `Bearer ${this.config.authentication.credentials.token}`;
            break;
          case 'apikey':
            headers['X-API-Key'] = this.config.authentication.credentials.apiKey;
            break;
        }
      }

      // Mock HTTP request
      logger.info('api', 'HTTP GET request', { url, deviceId });
      
      // Return mock data
      return {
        deviceId,
        timestamp: new Date().toISOString(),
        sensors: {
          temperature: 22.5,
          humidity: 65.2,
          co2: 450
        }
      };
    } catch (error) {
      logger.error('api', 'HTTP GET request failed', error as Error);
      throw error;
    }
  }

  async sendCommand(deviceId: string, endpoint: string, command: any): Promise<any> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      
      logger.info('api', 'HTTP POST command', { url, deviceId, command });
      
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      logger.error('api', 'HTTP POST command failed', error as Error);
      throw error;
    }
  }
}

// WebSocket Protocol Handler
export class WebSocketProtocol {
  private ws: WebSocket | null = null;
  private config: {
    url: string;
    protocols?: string[];
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
  private reconnectAttempts = 0;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(config: WebSocketProtocol['config']) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // In browser environment
      if (typeof WebSocket !== 'undefined') {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        this.ws.onopen = () => {
          logger.info('api', 'Connected to WebSocket', { url: this.config.url });
          this.reconnectAttempts = 0;
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const handler = this.messageHandlers.get(data.type);
            if (handler) {
              handler(data);
            }
          } catch (error) {
            logger.error('api', 'Failed to parse WebSocket message', error as Error);
          }
        };
        
        this.ws.onclose = () => {
          logger.warn('api', 'WebSocket connection closed');
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          logger.error('api', 'WebSocket error', error as any);
        };
      }
    } catch (error) {
      logger.error('api', 'Failed to connect to WebSocket', error as Error);
      throw error;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        logger.info('api', `Reconnection attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.config.reconnectInterval);
    }
  }

  addMessageHandler(messageType: string, handler: (data: any) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  removeMessageHandler(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      logger.warn('api', 'WebSocket not connected, message not sent');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Protocol Factory
export class ProtocolFactory {
  static createProtocol(type: string, config: any): 
    MQTTProtocol | LoRaWANProtocol | ModbusProtocol | HTTPProtocol | WebSocketProtocol {
    
    switch (type.toLowerCase()) {
      case 'mqtt':
        return new MQTTProtocol(config);
      case 'lorawan':
        return new LoRaWANProtocol(config);
      case 'modbus_rtu':
        return new ModbusProtocol({ ...config, type: 'RTU' });
      case 'modbus_tcp':
        return new ModbusProtocol({ ...config, type: 'TCP' });
      case 'http':
        return new HTTPProtocol(config);
      case 'websocket':
        return new WebSocketProtocol(config);
      default:
        throw new Error(`Unsupported protocol type: ${type}`);
    }
  }
}

// Device-specific parsers
export class DeviceParsers {
  static parseClimateData(rawData: any, deviceType: string): DeviceReading[] {
    const readings: DeviceReading[] = [];
    const timestamp = new Date();

    switch (deviceType) {
      case 'sensirion_sht85':
        // Sensirion SHT85 temperature/humidity sensor
        if (rawData.temperature !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'temperature',
            value: parseFloat(rawData.temperature),
            unit: '°C'
          });
        }
        if (rawData.humidity !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'humidity',
            value: parseFloat(rawData.humidity),
            unit: '%'
          });
        }
        break;

      case 'senseair_s8':
        // SenseAir S8 CO2 sensor
        if (rawData.co2 !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'co2',
            value: parseInt(rawData.co2),
            unit: 'ppm'
          });
        }
        break;

      case 'tsl2591':
        // TSL2591 light sensor
        if (rawData.lux !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'light_intensity',
            value: parseFloat(rawData.lux),
            unit: 'lux'
          });
        }
        if (rawData.par !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'par',
            value: parseFloat(rawData.par),
            unit: 'μmol/m²/s'
          });
        }
        break;
    }

    return readings;
  }

  static parseIrrigationData(rawData: any, deviceType: string): DeviceReading[] {
    const readings: DeviceReading[] = [];
    const timestamp = new Date();

    switch (deviceType) {
      case 'capacitive_soil_sensor':
        if (rawData.moisture !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'soil_moisture',
            value: parseFloat(rawData.moisture),
            unit: '%'
          });
        }
        break;

      case 'ph_ec_sensor':
        if (rawData.ph !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'ph',
            value: parseFloat(rawData.ph),
            unit: 'pH'
          });
        }
        if (rawData.ec !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'electrical_conductivity',
            value: parseFloat(rawData.ec),
            unit: 'µS/cm'
          });
        }
        break;

      case 'flow_meter':
        if (rawData.flow_rate !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'flow_rate',
            value: parseFloat(rawData.flow_rate),
            unit: 'L/min'
          });
        }
        if (rawData.total_volume !== undefined) {
          readings.push({
            deviceId: rawData.deviceId,
            timestamp,
            sensorType: 'total_volume',
            value: parseFloat(rawData.total_volume),
            unit: 'L'
          });
        }
        break;
    }

    return readings;
  }
}