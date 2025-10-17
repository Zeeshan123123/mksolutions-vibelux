/**
 * IoT Device Hub Service
 * Centralized management for all IoT devices and protocols
 */

import { logger } from '@/lib/logging/production-logger';
import { redis } from '@/lib/redis';
import { 
  IoTDevice, 
  DeviceReading, 
  DeviceCommand, 
  DeviceStatus,
  DeviceConfiguration,
  ProtocolFactory,
  DeviceParsers,
  MQTTProtocol,
  LoRaWANProtocol,
  ModbusProtocol,
  HTTPProtocol,
  WebSocketProtocol
} from '@/lib/iot/device-protocols';

export interface DeviceHubConfig {
  facilityId: string;
  protocols: {
    mqtt?: {
      brokerUrl: string;
      username?: string;
      password?: string;
      clientId: string;
    };
    lorawan?: {
      networkServerUrl: string;
      applicationId: string;
      accessKey: string;
    };
    modbus?: {
      tcp?: {
        host: string;
        port: number;
        timeout: number;
      };
      rtu?: {
        serialPort: string;
        baudRate: number;
        timeout: number;
      };
    };
    http?: {
      baseUrl: string;
      authentication?: {
        type: 'basic' | 'bearer' | 'apikey';
        credentials: Record<string, string>;
      };
      timeout: number;
    };
    websocket?: {
      url: string;
      protocols?: string[];
      reconnectInterval: number;
      maxReconnectAttempts: number;
    };
  };
  settings: {
    dataRetentionDays: number;
    alertThresholds: Record<string, { min?: number; max?: number }>;
    autoDiscovery: boolean;
    pollingInterval: number; // seconds
    batchSize: number;
  };
}

export interface AlertRule {
  id: string;
  deviceId: string;
  sensorType: string;
  condition: 'above' | 'below' | 'outside_range' | 'no_data';
  threshold: number | { min: number; max: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: Date;
  cooldownMinutes: number;
}

export interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  deviceIds: string[];
  location: string;
  facilityId: string;
  groupType: 'climate' | 'irrigation' | 'lighting' | 'security' | 'custom';
  settings: Record<string, any>;
}

export class IoTDeviceHubService {
  private readonly cachePrefix = 'iot_hub:';
  private readonly cacheTTL = 3600; // 1 hour
  private protocolHandlers: Map<string, any> = new Map();
  private activeDevices: Map<string, IoTDevice> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();

  /**
   * Initialize IoT Device Hub
   */
  async initializeHub(config: DeviceHubConfig): Promise<boolean> {
    try {
      logger.info('api', `Initializing IoT Device Hub for facility ${config.facilityId}`);

      // Initialize protocol handlers
      await this.initializeProtocols(config);

      // Store configuration
      await this.storeConfiguration(config);

      // Load existing devices
      await this.loadDevices(config.facilityId);

      // Load alert rules
      await this.loadAlertRules(config.facilityId);

      // Start device discovery if enabled
      if (config.settings.autoDiscovery) {
        await this.startDeviceDiscovery(config);
      }

      logger.info('api', 'IoT Device Hub initialized successfully');
      return true;

    } catch (error) {
      logger.error('api', 'Failed to initialize IoT Device Hub:', error);
      return false;
    }
  }

  /**
   * Register a new IoT device
   */
  async registerDevice(device: Omit<IoTDevice, 'status'>): Promise<boolean> {
    try {
      logger.info('api', `Registering device ${device.id}`, { 
        type: device.type, 
        protocol: device.protocol 
      });

      const fullDevice: IoTDevice = {
        ...device,
        status: {
          deviceId: device.id,
          online: false,
          lastSeen: new Date(),
          batteryLevel: undefined,
          signalStrength: undefined,
          firmware: undefined,
          errorCodes: []
        }
      };

      // Store device
      await this.storeDevice(fullDevice);
      this.activeDevices.set(device.id, fullDevice);

      // Start monitoring
      await this.startDeviceMonitoring(fullDevice);

      // Test connection
      await this.testDeviceConnection(device.id);

      logger.info('api', `Device ${device.id} registered successfully`);
      return true;

    } catch (error) {
      logger.error('api', `Failed to register device ${device.id}:`, error);
      return false;
    }
  }

  /**
   * Remove a device from the hub
   */
  async removeDevice(deviceId: string): Promise<boolean> {
    try {
      logger.info('api', `Removing device ${deviceId}`);

      // Stop monitoring
      await this.stopDeviceMonitoring(deviceId);

      // Remove from active devices
      this.activeDevices.delete(deviceId);

      // Remove from storage
      await this.deleteDevice(deviceId);

      logger.info('api', `Device ${deviceId} removed successfully`);
      return true;

    } catch (error) {
      logger.error('api', `Failed to remove device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Send command to device
   */
  async sendCommand(command: DeviceCommand): Promise<boolean> {
    try {
      const device = this.activeDevices.get(command.deviceId);
      if (!device) {
        throw new Error(`Device ${command.deviceId} not found`);
      }

      logger.info('api', `Sending command to device ${command.deviceId}`, {
        command: command.command,
        priority: command.priority
      });

      const protocolHandler = this.protocolHandlers.get(device.protocol);
      if (!protocolHandler) {
        throw new Error(`Protocol handler for ${device.protocol} not found`);
      }

      // Send command based on protocol
      switch (device.protocol) {
        case 'mqtt':
          await protocolHandler.publish(
            `devices/${command.deviceId}/commands`, 
            {
              command: command.command,
              parameters: command.parameters,
              timestamp: command.timestamp.toISOString()
            }
          );
          break;

        case 'http':
          await protocolHandler.sendCommand(
            command.deviceId,
            `/devices/${command.deviceId}/command`,
            {
              command: command.command,
              parameters: command.parameters
            }
          );
          break;

        case 'modbus_tcp':
        case 'modbus_rtu':
          // Convert command to Modbus register writes
          const registerMap = this.getModbusRegisterMap(device.type, command.command);
          if (registerMap) {
            await protocolHandler.writeSingleRegister(
              device.configuration.deviceAddress,
              registerMap.address,
              registerMap.value
            );
          }
          break;

        case 'websocket':
          protocolHandler.send({
            type: 'command',
            deviceId: command.deviceId,
            command: command.command,
            parameters: command.parameters,
            timestamp: command.timestamp.toISOString()
          });
          break;
      }

      // Log command
      await this.logCommand(command);

      return true;

    } catch (error) {
      logger.error('api', `Failed to send command to device ${command.deviceId}:`, error);
      return false;
    }
  }

  /**
   * Get device readings
   */
  async getDeviceReadings(
    deviceId: string, 
    startTime?: Date, 
    endTime?: Date, 
    sensorTypes?: string[]
  ): Promise<DeviceReading[]> {
    try {
      // In a real implementation, this would query a time-series database
      const cacheKey = `${this.cachePrefix}readings:${deviceId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        let readings: DeviceReading[] = JSON.parse(cached);
        
        // Filter by time range
        if (startTime) {
          readings = readings.filter(r => new Date(r.timestamp) >= startTime);
        }
        if (endTime) {
          readings = readings.filter(r => new Date(r.timestamp) <= endTime);
        }
        
        // Filter by sensor types
        if (sensorTypes) {
          readings = readings.filter(r => sensorTypes.includes(r.sensorType));
        }
        
        return readings;
      }

      return [];

    } catch (error) {
      logger.error('api', `Failed to get readings for device ${deviceId}:`, error);
      return [];
    }
  }

  /**
   * Get all devices for a facility
   */
  async getDevices(facilityId: string): Promise<IoTDevice[]> {
    try {
      const devices = Array.from(this.activeDevices.values())
        .filter(device => device.facilityId === facilityId);
      
      return devices;

    } catch (error) {
      logger.error('api', `Failed to get devices for facility ${facilityId}:`, error);
      return [];
    }
  }

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId: string): Promise<DeviceStatus | null> {
    try {
      const device = this.activeDevices.get(deviceId);
      return device ? device.status : null;

    } catch (error) {
      logger.error('api', `Failed to get status for device ${deviceId}:`, error);
      return null;
    }
  }

  /**
   * Update device configuration
   */
  async updateDeviceConfiguration(deviceId: string, config: Partial<DeviceConfiguration>): Promise<boolean> {
    try {
      const device = this.activeDevices.get(deviceId);
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      device.configuration = { ...device.configuration, ...config };
      await this.storeDevice(device);

      // Restart monitoring with new configuration
      await this.stopDeviceMonitoring(deviceId);
      await this.startDeviceMonitoring(device);

      logger.info('api', `Updated configuration for device ${deviceId}`);
      return true;

    } catch (error) {
      logger.error('api', `Failed to update configuration for device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Create device group
   */
  async createDeviceGroup(group: DeviceGroup): Promise<boolean> {
    try {
      await redis.setex(
        `${this.cachePrefix}group:${group.id}`,
        this.cacheTTL * 24,
        JSON.stringify(group)
      );

      logger.info('api', `Created device group ${group.id}`, { type: group.groupType });
      return true;

    } catch (error) {
      logger.error('api', `Failed to create device group ${group.id}:`, error);
      return false;
    }
  }

  /**
   * Add alert rule
   */
  async addAlertRule(rule: AlertRule): Promise<boolean> {
    try {
      this.alertRules.set(rule.id, rule);
      
      await redis.setex(
        `${this.cachePrefix}alert_rule:${rule.id}`,
        this.cacheTTL * 24,
        JSON.stringify(rule)
      );

      logger.info('api', `Added alert rule ${rule.id}`, { 
        deviceId: rule.deviceId, 
        severity: rule.severity 
      });
      return true;

    } catch (error) {
      logger.error('api', `Failed to add alert rule ${rule.id}:`, error);
      return false;
    }
  }

  // Private helper methods

  private async initializeProtocols(config: DeviceHubConfig): Promise<void> {
    // Initialize MQTT
    if (config.protocols.mqtt) {
      const mqttHandler = new MQTTProtocol({
        brokerUrl: config.protocols.mqtt.brokerUrl,
        username: config.protocols.mqtt.username,
        password: config.protocols.mqtt.password,
        clientId: config.protocols.mqtt.clientId
      });
      
      await mqttHandler.connect();
      this.protocolHandlers.set('mqtt', mqttHandler);
    }

    // Initialize LoRaWAN
    if (config.protocols.lorawan) {
      const loraHandler = new LoRaWANProtocol(config.protocols.lorawan);
      this.protocolHandlers.set('lorawan', loraHandler);
    }

    // Initialize Modbus TCP
    if (config.protocols.modbus?.tcp) {
      const modbusHandler = new ModbusProtocol({
        type: 'TCP',
        ...config.protocols.modbus.tcp
      });
      this.protocolHandlers.set('modbus_tcp', modbusHandler);
    }

    // Initialize Modbus RTU
    if (config.protocols.modbus?.rtu) {
      const modbusHandler = new ModbusProtocol({
        type: 'RTU',
        ...config.protocols.modbus.rtu
      });
      this.protocolHandlers.set('modbus_rtu', modbusHandler);
    }

    // Initialize HTTP
    if (config.protocols.http) {
      const httpHandler = new HTTPProtocol(config.protocols.http);
      this.protocolHandlers.set('http', httpHandler);
    }

    // Initialize WebSocket
    if (config.protocols.websocket) {
      const wsHandler = new WebSocketProtocol(config.protocols.websocket);
      await wsHandler.connect();
      this.protocolHandlers.set('websocket', wsHandler);
    }
  }

  private async startDeviceMonitoring(device: IoTDevice): Promise<void> {
    const interval = setInterval(async () => {
      try {
        await this.pollDevice(device);
      } catch (error) {
        logger.error('api', `Failed to poll device ${device.id}:`, error);
      }
    }, device.configuration.reportingInterval * 1000);

    this.pollingIntervals.set(device.id, interval);
  }

  private async stopDeviceMonitoring(deviceId: string): Promise<void> {
    const interval = this.pollingIntervals.get(deviceId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(deviceId);
    }
  }

  private async pollDevice(device: IoTDevice): Promise<void> {
    try {
      const protocolHandler = this.protocolHandlers.get(device.protocol);
      if (!protocolHandler) return;

      let rawData: any;

      switch (device.protocol) {
        case 'http':
          rawData = await protocolHandler.getDeviceData(
            device.id, 
            `/devices/${device.id}/data`
          );
          break;

        case 'modbus_tcp':
        case 'modbus_rtu':
          const registers = await protocolHandler.readHoldingRegisters(
            device.configuration.deviceAddress,
            0,
            10
          );
          rawData = this.parseModbusRegisters(device.type, registers);
          break;

        default:
          return;
      }

      // Parse device data
      const readings = this.parseDeviceData(device, rawData);
      
      // Store readings
      await this.storeReadings(readings);

      // Check alerts
      await this.checkAlerts(device, readings);

      // Update device status
      device.status.online = true;
      device.status.lastSeen = new Date();
      if (readings.length > 0) {
        device.lastReading = readings[readings.length - 1];
      }

    } catch (error) {
      device.status.online = false;
      logger.error('api', `Failed to poll device ${device.id}:`, error);
    }
  }

  private parseDeviceData(device: IoTDevice, rawData: any): DeviceReading[] {
    try {
      // Use device-specific parsers
      if (device.type.includes('climate')) {
        return DeviceParsers.parseClimateData(rawData, device.type);
      } else if (device.type.includes('irrigation') || device.type.includes('soil')) {
        return DeviceParsers.parseIrrigationData(rawData, device.type);
      }

      // Generic parsing
      const readings: DeviceReading[] = [];
      const timestamp = new Date();

      Object.entries(rawData.sensors || rawData).forEach(([key, value]) => {
        if (typeof value === 'number') {
          readings.push({
            deviceId: device.id,
            timestamp,
            sensorType: key,
            value,
            unit: this.getSensorUnit(key),
            location: device.location
          });
        }
      });

      return readings;

    } catch (error) {
      logger.error('api', `Failed to parse device data for ${device.id}:`, error);
      return [];
    }
  }

  private async checkAlerts(device: IoTDevice, readings: DeviceReading[]): Promise<void> {
    for (const reading of readings) {
      const deviceAlerts = Array.from(this.alertRules.values())
        .filter(rule => rule.deviceId === device.id && rule.sensorType === reading.sensorType && rule.enabled);

      for (const alert of deviceAlerts) {
        // Check cooldown
        if (alert.lastTriggered && 
            Date.now() - alert.lastTriggered.getTime() < alert.cooldownMinutes * 60000) {
          continue;
        }

        let triggered = false;

        switch (alert.condition) {
          case 'above':
            triggered = reading.value > (alert.threshold as number);
            break;
          case 'below':
            triggered = reading.value < (alert.threshold as number);
            break;
          case 'outside_range':
            const range = alert.threshold as { min: number; max: number };
            triggered = reading.value < range.min || reading.value > range.max;
            break;
        }

        if (triggered) {
          await this.triggerAlert(alert, reading);
          alert.lastTriggered = new Date();
        }
      }
    }
  }

  private async triggerAlert(alert: AlertRule, reading: DeviceReading): Promise<void> {
    logger.warn('api', `Alert triggered: ${alert.id}`, {
      deviceId: alert.deviceId,
      sensorType: alert.sensorType,
      value: reading.value,
      severity: alert.severity
    });

    // Here you would integrate with notification systems
    // For now, just log the alert
  }

  private getSensorUnit(sensorType: string): string {
    const unitMap: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      co2: 'ppm',
      light_intensity: 'lux',
      par: 'μmol/m²/s',
      soil_moisture: '%',
      ph: 'pH',
      electrical_conductivity: 'µS/cm',
      flow_rate: 'L/min',
      pressure: 'bar',
      voltage: 'V',
      current: 'A',
      power: 'W'
    };

    return unitMap[sensorType] || '';
  }

  private getModbusRegisterMap(deviceType: string, command: string): { address: number; value: number } | null {
    // Device-specific Modbus register mappings
    const registerMaps: Record<string, Record<string, { address: number; value: number }>> = {
      'climate_controller': {
        'set_temperature': { address: 100, value: 0 }, // Value would be calculated from command parameters
        'set_humidity': { address: 101, value: 0 },
        'enable_cooling': { address: 102, value: 1 },
        'disable_cooling': { address: 102, value: 0 }
      },
      'irrigation_controller': {
        'start_irrigation': { address: 200, value: 1 },
        'stop_irrigation': { address: 200, value: 0 },
        'set_flow_rate': { address: 201, value: 0 }
      }
    };

    return registerMaps[deviceType]?.[command] || null;
  }

  private parseModbusRegisters(deviceType: string, registers: number[]): any {
    // Parse Modbus registers into meaningful data based on device type
    const data: any = { sensors: {} };

    switch (deviceType) {
      case 'climate_sensor':
        if (registers.length >= 3) {
          data.sensors.temperature = (registers[0] - 1000) / 10; // Example scaling
          data.sensors.humidity = registers[1] / 10;
          data.sensors.co2 = registers[2];
        }
        break;
      
      case 'irrigation_sensor':
        if (registers.length >= 4) {
          data.sensors.soil_moisture = registers[0] / 10;
          data.sensors.ph = registers[1] / 100;
          data.sensors.ec = registers[2];
          data.sensors.soil_temperature = (registers[3] - 1000) / 10;
        }
        break;
    }

    return data;
  }

  private async testDeviceConnection(deviceId: string): Promise<boolean> {
    try {
      const device = this.activeDevices.get(deviceId);
      if (!device) return false;

      // Simple ping/test command based on protocol
      switch (device.protocol) {
        case 'http':
          const httpHandler = this.protocolHandlers.get('http');
          await httpHandler.getDeviceData(deviceId, `/devices/${deviceId}/ping`);
          break;
        
        case 'modbus_tcp':
        case 'modbus_rtu':
          const modbusHandler = this.protocolHandlers.get(device.protocol);
          await modbusHandler.readHoldingRegisters(device.configuration.deviceAddress, 0, 1);
          break;
      }

      device.status.online = true;
      return true;

    } catch (error) {
      const device = this.activeDevices.get(deviceId);
      if (device) {
        device.status.online = false;
      }
      return false;
    }
  }

  private async startDeviceDiscovery(config: DeviceHubConfig): Promise<void> {
    // Auto-discovery implementation would go here
    // This could involve network scanning, mDNS, etc.
    logger.info('api', 'Device auto-discovery started');
  }

  private async loadDevices(facilityId: string): Promise<void> {
    // Load devices from storage
    // This would typically query a database
  }

  private async loadAlertRules(facilityId: string): Promise<void> {
    // Load alert rules from storage
    // This would typically query a database
  }

  private async storeConfiguration(config: DeviceHubConfig): Promise<void> {
    const key = `${this.cachePrefix}config:${config.facilityId}`;
    await redis.setex(key, this.cacheTTL * 24, JSON.stringify(config));
  }

  private async storeDevice(device: IoTDevice): Promise<void> {
    const key = `${this.cachePrefix}device:${device.id}`;
    await redis.setex(key, this.cacheTTL * 24, JSON.stringify(device));
  }

  private async deleteDevice(deviceId: string): Promise<void> {
    const key = `${this.cachePrefix}device:${deviceId}`;
    await redis.del(key);
  }

  private async storeReadings(readings: DeviceReading[]): Promise<void> {
    if (readings.length === 0) return;

    // Store in Redis with TTL
    for (const reading of readings) {
      const key = `${this.cachePrefix}readings:${reading.deviceId}`;
      const existing = await redis.get(key);
      const allReadings = existing ? JSON.parse(existing) : [];
      
      allReadings.push(reading);
      
      // Keep only recent readings (last 1000)
      if (allReadings.length > 1000) {
        allReadings.splice(0, allReadings.length - 1000);
      }
      
      await redis.setex(key, this.cacheTTL * 24, JSON.stringify(allReadings));
    }
  }

  private async logCommand(command: DeviceCommand): Promise<void> {
    const key = `${this.cachePrefix}commands:${command.deviceId}`;
    const existing = await redis.get(key);
    const allCommands = existing ? JSON.parse(existing) : [];
    
    allCommands.push(command);
    
    // Keep only recent commands (last 100)
    if (allCommands.length > 100) {
      allCommands.splice(0, allCommands.length - 100);
    }
    
    await redis.setex(key, this.cacheTTL * 24, JSON.stringify(allCommands));
  }
}

export const iotDeviceHubService = new IoTDeviceHubService();
export default iotDeviceHubService;