/**
 * Real MQTT Client Implementation
 * Supports IoT device communication via MQTT broker
 */

import mqtt, { MqttClient as MqttClientType, IClientOptions, IClientPublishOptions } from 'mqtt';
import { EventEmitter } from 'events';

export interface MqttDeviceConfig {
  brokerUrl: string; // mqtt://host:port or mqtts://host:port
  clientId?: string;
  username?: string;
  password?: string;
  keepalive?: number;
  clean?: boolean;
  reconnectPeriod?: number;
  connectTimeout?: number;
  qos?: 0 | 1 | 2;
  retain?: boolean;
  will?: {
    topic: string;
    payload: string;
    qos?: 0 | 1 | 2;
    retain?: boolean;
  };
  ca?: string; // CA certificate for TLS
  cert?: string; // Client certificate for TLS
  key?: string; // Client key for TLS
  rejectUnauthorized?: boolean;
}

export interface MqttTopicMapping {
  // Status topics (subscribe)
  status?: string;
  telemetry?: string;
  alarms?: string;
  events?: string;
  // Command topics (publish)
  command?: string;
  config?: string;
  // Custom topics
  [key: string]: string | undefined;
}

export interface MqttDevice {
  deviceId: string;
  deviceType: string;
  online: boolean;
  lastSeen: Date;
  telemetry?: any;
  attributes?: any;
  topics: MqttTopicMapping;
}

// Common IoT device topic patterns
export const MQTT_TOPIC_PATTERNS = {
  'tasmota': {
    status: 'tele/{deviceId}/STATE',
    telemetry: 'tele/{deviceId}/SENSOR',
    command: 'cmnd/{deviceId}/{command}',
    config: 'cmnd/{deviceId}/Status',
    lwt: 'tele/{deviceId}/LWT'
  },
  'homie': {
    status: 'homie/{deviceId}/$state',
    telemetry: 'homie/{deviceId}/{node}/{property}',
    command: 'homie/{deviceId}/{node}/{property}/set',
    attributes: 'homie/{deviceId}/$attributes',
    lwt: 'homie/{deviceId}/$state'
  },
  'homeassistant': {
    status: 'homeassistant/{component}/{deviceId}/state',
    telemetry: 'homeassistant/{component}/{deviceId}/state',
    command: 'homeassistant/{component}/{deviceId}/set',
    config: 'homeassistant/{component}/{deviceId}/config',
    availability: 'homeassistant/{component}/{deviceId}/availability'
  },
  'generic': {
    status: 'devices/{deviceId}/status',
    telemetry: 'devices/{deviceId}/telemetry',
    command: 'devices/{deviceId}/command',
    config: 'devices/{deviceId}/config',
    events: 'devices/{deviceId}/events'
  }
};

export class MqttClient extends EventEmitter {
  private client: MqttClientType | null = null;
  private config: MqttDeviceConfig;
  private connected: boolean = false;
  private devices: Map<string, MqttDevice> = new Map();
  private subscriptions: Map<string, (topic: string, payload: Buffer) => void> = new Map();
  
  constructor(config: MqttDeviceConfig) {
    super();
    this.config = {
      ...config,
      clientId: config.clientId || `vibelux_${Math.random().toString(16).substr(2, 8)}`,
      keepalive: config.keepalive || 60,
      clean: config.clean !== false,
      reconnectPeriod: config.reconnectPeriod || 5000,
      connectTimeout: config.connectTimeout || 30000,
      qos: config.qos || 1,
      retain: config.retain || false
    };
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: IClientOptions = {
        clientId: this.config.clientId,
        username: this.config.username,
        password: this.config.password,
        keepalive: this.config.keepalive,
        clean: this.config.clean,
        reconnectPeriod: this.config.reconnectPeriod,
        connectTimeout: this.config.connectTimeout,
        will: this.config.will,
        rejectUnauthorized: this.config.rejectUnauthorized
      };
      
      // Add TLS options if provided
      if (this.config.ca) options.ca = this.config.ca;
      if (this.config.cert) options.cert = this.config.cert;
      if (this.config.key) options.key = this.config.key;
      
      this.client = mqtt.connect(this.config.brokerUrl, options);
      
      this.client.on('connect', () => {
        this.connected = true;
        this.emit('connected');
        resolve();
      });
      
      this.client.on('error', (error) => {
        this.emit('error', error);
        if (!this.connected) {
          reject(error);
        }
      });
      
      this.client.on('offline', () => {
        this.connected = false;
        this.emit('offline');
      });
      
      this.client.on('close', () => {
        this.connected = false;
        this.emit('disconnected');
      });
      
      this.client.on('reconnect', () => {
        this.emit('reconnecting');
      });
      
      this.client.on('message', (topic, payload) => {
        this.handleMessage(topic, payload);
      });
    });
  }
  
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.end(false, {}, () => {
          this.connected = false;
          this.client = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  
  isConnected(): boolean {
    return this.connected && this.client !== null;
  }
  
  // Subscribe to topics
  async subscribe(topic: string | string[], handler?: (topic: string, payload: any) => void): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected to MQTT broker');
    }
    
    return new Promise((resolve, reject) => {
      this.client!.subscribe(topic, { qos: this.config.qos || 1 }, (err) => {
        if (err) {
          reject(err);
        } else {
          if (handler) {
            const topics = Array.isArray(topic) ? topic : [topic];
            topics.forEach(t => {
              this.subscriptions.set(t, (topic, payload) => {
                try {
                  const data = JSON.parse(payload.toString());
                  handler(topic, data);
                } catch {
                  handler(topic, payload.toString());
                }
              });
            });
          }
          resolve();
        }
      });
    });
  }
  
  // Unsubscribe from topics
  async unsubscribe(topic: string | string[]): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected to MQTT broker');
    }
    
    return new Promise((resolve, reject) => {
      this.client!.unsubscribe(topic, {}, (err) => {
        if (err) {
          reject(err);
        } else {
          const topics = Array.isArray(topic) ? topic : [topic];
          topics.forEach(t => this.subscriptions.delete(t));
          resolve();
        }
      });
    });
  }
  
  // Publish message
  async publish(
    topic: string,
    payload: string | Buffer | object,
    options?: IClientPublishOptions
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected to MQTT broker');
    }
    
    return new Promise((resolve, reject) => {
      let message: string | Buffer;
      if (typeof payload === 'object' && !Buffer.isBuffer(payload)) {
        message = JSON.stringify(payload);
      } else {
        message = payload;
      }
      
      const pubOptions: IClientPublishOptions = {
        qos: this.config.qos || 1,
        retain: this.config.retain || false,
        ...options
      };
      
      this.client!.publish(topic, message, pubOptions, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  // Device management
  registerDevice(device: MqttDevice): void {
    this.devices.set(device.deviceId, device);
    
    // Subscribe to device topics
    const topicsToSubscribe: string[] = [];
    if (device.topics.status) topicsToSubscribe.push(device.topics.status);
    if (device.topics.telemetry) topicsToSubscribe.push(device.topics.telemetry);
    if (device.topics.alarms) topicsToSubscribe.push(device.topics.alarms);
    if (device.topics.events) topicsToSubscribe.push(device.topics.events);
    
    if (topicsToSubscribe.length > 0) {
      this.subscribe(topicsToSubscribe).catch(err => {
        logger.error('api', `Failed to subscribe to device ${device.deviceId} topics:`, err);
      });
    }
  }
  
  unregisterDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      // Unsubscribe from device topics
      const topicsToUnsubscribe: string[] = [];
      Object.values(device.topics).forEach(topic => {
        if (topic) topicsToUnsubscribe.push(topic);
      });
      
      if (topicsToUnsubscribe.length > 0) {
        this.unsubscribe(topicsToUnsubscribe).catch(err => {
          logger.error('api', `Failed to unsubscribe from device ${deviceId} topics:`, err);
        });
      }
      
      this.devices.delete(deviceId);
    }
  }
  
  getDevice(deviceId: string): MqttDevice | undefined {
    return this.devices.get(deviceId);
  }
  
  getAllDevices(): MqttDevice[] {
    return Array.from(this.devices.values());
  }
  
  // Send command to device
  async sendCommand(deviceId: string, command: string, params?: any): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device || !device.topics.command) {
      throw new Error(`No command topic configured for device ${deviceId}`);
    }
    
    const topic = device.topics.command.replace('{command}', command);
    await this.publish(topic, params || '');
  }
  
  // Request device status
  async requestStatus(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device || !device.topics.config) {
      throw new Error(`No config topic configured for device ${deviceId}`);
    }
    
    await this.publish(device.topics.config, '0'); // Status 0 = request all status
  }
  
  // Handle incoming messages
  private handleMessage(topic: string, payload: Buffer): void {
    // Check subscriptions
    this.subscriptions.forEach((handler, pattern) => {
      if (this.topicMatches(pattern, topic)) {
        handler(topic, payload);
      }
    });
    
    // Update device state
    this.devices.forEach((device, deviceId) => {
      if (device.topics.status === topic || device.topics.telemetry === topic) {
        try {
          const data = JSON.parse(payload.toString());
          device.telemetry = data;
          device.lastSeen = new Date();
          device.online = true;
          this.emit('deviceUpdate', deviceId, data);
        } catch (err) {
          logger.error('api', `Failed to parse message from ${deviceId}:`, err);
        }
      } else if (device.topics.alarms === topic) {
        try {
          const alarm = JSON.parse(payload.toString());
          this.emit('deviceAlarm', deviceId, alarm);
        } catch (err) {
          logger.error('api', `Failed to parse alarm from ${deviceId}:`, err);
        }
      }
    });
    
    // Emit raw message event
    this.emit('message', topic, payload);
  }
  
  // Check if topic matches pattern (supports + and # wildcards)
  private topicMatches(pattern: string, topic: string): boolean {
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');
    
    if (pattern === '#' || pattern === topic) {
      return true;
    }
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '#') {
        return true;
      }
      if (patternParts[i] !== '+' && patternParts[i] !== topicParts[i]) {
        return false;
      }
    }
    
    return patternParts.length === topicParts.length;
  }
  
  // Helper to create topic from pattern
  static createTopic(pattern: string, params: Record<string, string>): string {
    let topic = pattern;
    Object.entries(params).forEach(([key, value]) => {
      topic = topic.replace(`{${key}}`, value);
    });
    return topic;
  }
  
  // Discover devices using common patterns
  async discoverDevices(topicPattern: string = '+/+/status'): Promise<string[]> {
    const discoveredDevices: Set<string> = new Set();
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.unsubscribe(topicPattern);
        resolve(Array.from(discoveredDevices));
      }, 5000);
      
      this.subscribe(topicPattern, (topic, payload) => {
        const parts = topic.split('/');
        if (parts.length >= 2) {
          const deviceId = parts[1];
          discoveredDevices.add(deviceId);
        }
      });
    });
  }
}

// Factory function for common IoT devices
export function createMqttDevice(
  deviceType: keyof typeof MQTT_TOPIC_PATTERNS,
  deviceId: string,
  config: MqttDeviceConfig
): { client: MqttClient; device: MqttDevice } {
  const client = new MqttClient(config);
  const patterns = MQTT_TOPIC_PATTERNS[deviceType];
  
  const device: MqttDevice = {
    deviceId,
    deviceType,
    online: false,
    lastSeen: new Date(),
    topics: {}
  };
  
  // Create topics from patterns
  Object.entries(patterns).forEach(([key, pattern]) => {
    device.topics[key] = MqttClient.createTopic(pattern, { deviceId });
  });
  
  return { client, device };
}