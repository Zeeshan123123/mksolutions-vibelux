/**
 * Device Discovery Service
 * Automatically discovers and configures BMS/SCADA devices on the network
 */

import { ModbusClient, ModbusDeviceConfig, DEVICE_MAPPINGS as MODBUS_MAPPINGS } from '../protocols/modbus-client';
import { BACnetClient, BACnetDevice, BACnetObjectType, BACnetPropertyId } from '../protocols/bacnet-client';
import { MqttClient, MqttDeviceConfig, MQTT_TOPIC_PATTERNS } from '../protocols/mqtt-client';
import { OpcUaClient, OpcUaDeviceConfig } from '../protocols/opcua-client';
import { EventEmitter } from 'events';
import * as os from 'os';
import * as dgram from 'dgram';

export interface DiscoveredDevice {
  id: string;
  name: string;
  protocol: 'modbus-tcp' | 'modbus-rtu' | 'bacnet' | 'mqtt' | 'opcua';
  address: string;
  port?: number;
  deviceType?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: 'online' | 'offline' | 'unknown';
  discovered: Date;
  lastSeen: Date;
  metadata?: any;
}

export interface DiscoveryOptions {
  protocols?: Array<'modbus' | 'bacnet' | 'mqtt' | 'opcua'>;
  ipRange?: string; // e.g., '192.168.1.0/24'
  ports?: {
    modbus?: number[];
    bacnet?: number;
    mqtt?: number[];
    opcua?: number[];
  };
  timeout?: number;
  concurrent?: number;
}

export class DeviceDiscoveryService extends EventEmitter {
  private discoveredDevices: Map<string, DiscoveredDevice> = new Map();
  private discovering: boolean = false;
  
  constructor() {
    super();
  }
  
  // Start device discovery
  async discover(options: DiscoveryOptions = {}): Promise<DiscoveredDevice[]> {
    if (this.discovering) {
      throw new Error('Discovery already in progress');
    }
    
    this.discovering = true;
    this.emit('discoveryStarted');
    
    const protocols = options.protocols || ['modbus', 'bacnet', 'mqtt', 'opcua'];
    const results: DiscoveredDevice[] = [];
    
    try {
      // Discover devices for each protocol
      const discoveries = [];
      
      if (protocols.includes('bacnet')) {
        discoveries.push(this.discoverBACnetDevices(options));
      }
      
      if (protocols.includes('modbus')) {
        discoveries.push(this.discoverModbusDevices(options));
      }
      
      if (protocols.includes('mqtt')) {
        discoveries.push(this.discoverMqttDevices(options));
      }
      
      if (protocols.includes('opcua')) {
        discoveries.push(this.discoverOpcUaDevices(options));
      }
      
      // Wait for all discoveries to complete
      const allResults = await Promise.allSettled(discoveries);
      
      allResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(...result.value);
        }
      });
      
      // Update discovered devices
      results.forEach(device => {
        this.discoveredDevices.set(device.id, device);
      });
      
      this.emit('discoveryCompleted', results);
      return results;
    } finally {
      this.discovering = false;
    }
  }
  
  // Discover BACnet devices
  private async discoverBACnetDevices(options: DiscoveryOptions): Promise<DiscoveredDevice[]> {
    const devices: DiscoveredDevice[] = [];
    const client = new BACnetClient({
      port: options.ports?.bacnet || 47808
    });
    
    try {
      client.connect();
      
      // Send Who-Is to discover devices
      const bacnetDevices = await client.discoverDevices();
      
      // Get detailed information for each device
      for (const device of bacnetDevices) {
        try {
          const deviceInfo = await client.readDeviceInfo(device.address, device.deviceId);
          
          const discovered: DiscoveredDevice = {
            id: `bacnet-${device.deviceId}`,
            name: deviceInfo.name || `BACnet Device ${device.deviceId}`,
            protocol: 'bacnet',
            address: device.address,
            port: 47808,
            deviceType: 'BACnet Device',
            manufacturer: device.vendorId?.toString(),
            model: deviceInfo.modelName,
            serialNumber: device.deviceId.toString(),
            status: 'online',
            discovered: new Date(),
            lastSeen: new Date(),
            metadata: {
              maxApdu: device.maxApdu,
              segmentation: device.segmentation,
              vendorId: device.vendorId,
              location: deviceInfo.location,
              description: deviceInfo.description
            }
          };
          
          devices.push(discovered);
          this.emit('deviceDiscovered', discovered);
        } catch (err) {
          logger.error('api', `Failed to get info for BACnet device ${device.deviceId}:`, err);
        }
      }
    } catch (error) {
      logger.error('api', 'BACnet discovery error:', error );
    } finally {
      client.disconnect();
    }
    
    return devices;
  }
  
  // Discover Modbus devices
  private async discoverModbusDevices(options: DiscoveryOptions): Promise<DiscoveredDevice[]> {
    const devices: DiscoveredDevice[] = [];
    const ports = options.ports?.modbus || [502, 503];
    const ipRange = options.ipRange || this.getLocalSubnet();
    const ips = this.generateIPRange(ipRange);
    
    // Limit concurrent connections
    const concurrent = options.concurrent || 10;
    const timeout = options.timeout || 2000;
    
    for (let i = 0; i < ips.length; i += concurrent) {
      const batch = ips.slice(i, i + concurrent);
      const promises = batch.map(ip => this.scanModbusDevice(ip, ports, timeout));
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const device = result.value;
          devices.push(device);
          this.emit('deviceDiscovered', device);
        }
      });
    }
    
    return devices;
  }
  
  // Scan individual Modbus device
  private async scanModbusDevice(ip: string, ports: number[], timeout: number): Promise<DiscoveredDevice | null> {
    for (const port of ports) {
      const config: ModbusDeviceConfig = {
        type: 'TCP',
        host: ip,
        port,
        unitId: 1,
        timeout
      };
      
      const client = new ModbusClient(config);
      
      try {
        const connected = await client.connect();
        if (!connected) continue;
        
        // Try to identify device type by reading common registers
        let deviceType = 'Unknown Modbus Device';
        let manufacturer = 'Unknown';
        let model = 'Unknown';
        
        // Try known device mappings
        for (const [mappingKey, mapping] of Object.entries(MODBUS_MAPPINGS)) {
          try {
            if (mapping.registers.status) {
              await client.readRegister(mapping.registers.status);
              deviceType = mapping.deviceType;
              manufacturer = mapping.manufacturer || 'Unknown';
              model = mapping.model || 'Unknown';
              break;
            }
          } catch {
            // Continue trying other mappings
          }
        }
        
        await client.disconnect();
        
        return {
          id: `modbus-tcp-${ip}-${port}`,
          name: `${deviceType} at ${ip}:${port}`,
          protocol: 'modbus-tcp',
          address: ip,
          port,
          deviceType,
          manufacturer,
          model,
          status: 'online',
          discovered: new Date(),
          lastSeen: new Date(),
          metadata: {
            unitId: 1,
            timeout
          }
        };
      } catch (error) {
        // Device not responding on this port
      } finally {
        await client.disconnect().catch(() => {});
      }
    }
    
    return null;
  }
  
  // Discover MQTT devices
  private async discoverMqttDevices(options: DiscoveryOptions): Promise<DiscoveredDevice[]> {
    const devices: DiscoveredDevice[] = [];
    const brokers = this.findMqttBrokers(options);
    
    for (const broker of brokers) {
      try {
        const config: MqttDeviceConfig = {
          brokerUrl: broker,
          clientId: 'vibelux-discovery-' + Date.now()
        };
        
        const client = new MqttClient(config);
        await client.connect();
        
        // Subscribe to common discovery topics
        const discoveryTopics = [
          '+/+/status',
          'homeassistant/+/+/config',
          'homie/+/$state',
          'tasmota/+/STATE'
        ];
        
        const discoveredIds = new Set<string>();
        
        await client.subscribe(discoveryTopics, (topic, payload) => {
          // Parse device ID from topic
          const parts = topic.split('/');
          let deviceId: string | null = null;
          let deviceType = 'MQTT Device';
          
          if (topic.includes('homeassistant')) {
            deviceId = parts[2];
            deviceType = 'Home Assistant Device';
          } else if (topic.includes('homie')) {
            deviceId = parts[1];
            deviceType = 'Homie Device';
          } else if (topic.includes('tasmota')) {
            deviceId = parts[1];
            deviceType = 'Tasmota Device';
          } else if (parts.length >= 3) {
            deviceId = parts[1];
          }
          
          if (deviceId && !discoveredIds.has(deviceId)) {
            discoveredIds.add(deviceId);
            
            const device: DiscoveredDevice = {
              id: `mqtt-${deviceId}`,
              name: deviceId,
              protocol: 'mqtt',
              address: broker,
              deviceType,
              status: 'online',
              discovered: new Date(),
              lastSeen: new Date(),
              metadata: {
                broker,
                topic,
                payload: typeof payload === 'object' ? payload : payload.toString()
              }
            };
            
            devices.push(device);
            this.emit('deviceDiscovered', device);
          }
        });
        
        // Wait for discovery
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await client.disconnect();
      } catch (error) {
        logger.error('api', `Failed to discover MQTT devices on ${broker}:`, error);
      }
    }
    
    return devices;
  }
  
  // Discover OPC UA devices
  private async discoverOpcUaDevices(options: DiscoveryOptions): Promise<DiscoveredDevice[]> {
    const devices: DiscoveredDevice[] = [];
    const ports = options.ports?.opcua || [4840, 4841, 4855];
    const ipRange = options.ipRange || this.getLocalSubnet();
    const ips = this.generateIPRange(ipRange);
    
    for (const ip of ips) {
      for (const port of ports) {
        const endpointUrl = `opc.tcp://${ip}:${port}`;
        const config: OpcUaDeviceConfig = {
          endpointUrl
        };
        
        const client = new OpcUaClient(config);
        
        try {
          await client.connect();
          
          // Read server information
          const serverStatus = await client.read('ns=0;i=2256'); // Server status
          
          const device: DiscoveredDevice = {
            id: `opcua-${ip}-${port}`,
            name: `OPC UA Server at ${ip}:${port}`,
            protocol: 'opcua',
            address: ip,
            port,
            deviceType: 'OPC UA Server',
            status: 'online',
            discovered: new Date(),
            lastSeen: new Date(),
            metadata: {
              endpointUrl,
              serverStatus: serverStatus[0]
            }
          };
          
          devices.push(device);
          this.emit('deviceDiscovered', device);
          
          await client.disconnect();
        } catch {
          // Server not responding
        }
      }
    }
    
    return devices;
  }
  
  // Get configured device mappings for a protocol
  getDeviceMappings(protocol: string): any {
    switch (protocol) {
      case 'modbus':
        return MODBUS_MAPPINGS;
      case 'mqtt':
        return MQTT_TOPIC_PATTERNS;
      default:
        return {};
    }
  }
  
  // Auto-configure discovered device
  async configureDevice(deviceId: string): Promise<any> {
    const device = this.discoveredDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }
    
    // Create appropriate configuration based on device type
    const config: any = {
      id: device.id,
      name: device.name,
      protocol: device.protocol,
      enabled: true,
      zones: []
    };
    
    switch (device.protocol) {
      case 'modbus-tcp':
        config.connection = {
          type: 'TCP',
          host: device.address,
          port: device.port || 502,
          unitId: 1,
          timeout: 5000,
          pollInterval: 1000
        };
        break;
        
      case 'bacnet':
        config.connection = {
          deviceId: parseInt(device.serialNumber || '0'),
          address: device.address
        };
        break;
        
      case 'mqtt':
        config.connection = {
          broker: device.address,
          topics: MQTT_TOPIC_PATTERNS.generic
        };
        break;
        
      case 'opcua':
        config.connection = {
          endpointUrl: `opc.tcp://${device.address}:${device.port || 4840}`
        };
        break;
    }
    
    return config;
  }
  
  // Helper methods
  private getLocalSubnet(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;
      
      for (const addr of iface) {
        if (addr.family === 'IPv4' && !addr.internal) {
          // Convert IP to subnet (assuming /24)
          const parts = addr.address.split('.');
          return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
        }
      }
    }
    return '192.168.1.0/24'; // Default
  }
  
  private generateIPRange(cidr: string): string[] {
    const ips: string[] = [];
    const [baseIP, maskBits] = cidr.split('/');
    const parts = baseIP.split('.').map(Number);
    
    // For simplicity, only handle /24 networks
    if (maskBits === '24') {
      for (let i = 1; i < 255; i++) {
        ips.push(`${parts[0]}.${parts[1]}.${parts[2]}.${i}`);
      }
    }
    
    return ips;
  }
  
  private findMqttBrokers(options: DiscoveryOptions): string[] {
    const brokers: string[] = [];
    const ports = options.ports?.mqtt || [1883, 8883];
    
    // Common MQTT broker addresses
    const commonHosts = [
      'localhost',
      'mqtt.local',
      'broker.local',
      'mosquitto.local'
    ];
    
    // Also check local network
    const localIP = this.getLocalIP();
    if (localIP) {
      const parts = localIP.split('.');
      commonHosts.push(`${parts[0]}.${parts[1]}.${parts[2]}.1`); // Router/gateway
    }
    
    commonHosts.forEach(host => {
      ports.forEach(port => {
        brokers.push(`mqtt://${host}:${port}`);
        if (port === 8883) {
          brokers.push(`mqtts://${host}:${port}`);
        }
      });
    });
    
    return brokers;
  }
  
  private getLocalIP(): string | null {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;
      
      for (const addr of iface) {
        if (addr.family === 'IPv4' && !addr.internal) {
          return addr.address;
        }
      }
    }
    return null;
  }
}

// Singleton instance
export const deviceDiscovery = new DeviceDiscoveryService();