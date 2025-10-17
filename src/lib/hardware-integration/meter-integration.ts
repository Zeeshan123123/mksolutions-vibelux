/**
 * Hardware Meter Integration
 * Connects to physical energy meters for real-time monitoring
 * Supports various protocols: Modbus, BACnet, MQTT, REST APIs
 */

import { EventEmitter } from 'events';
// Dynamic import for optional modbus-serial
let ModbusRTU: any;
try {
  // eslint-disable-next-line no-eval
  ModbusRTU = eval("require('modbus-serial')");
} catch (e) {
  // modbus-serial is optional, provide mock if not available
  ModbusRTU = class MockModbusRTU {
    connectTCP() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    connectRTU() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    readHoldingRegisters() { return Promise.reject(new Error('Modbus not available')); }
    readInputRegisters() { return Promise.reject(new Error('Modbus not available')); }
    writeRegister() { return Promise.reject(new Error('Modbus not available')); }
    setID() {}
    setTimeout() {}
    isOpen = false;
  };
}
import * as mqtt from 'mqtt';
import { influxDB } from '@/lib/db/influxdb';
import { Point } from '@influxdata/influxdb-client';

// Meter interfaces
export interface MeterDevice {
  id: string;
  name: string;
  type: 'electric' | 'gas' | 'water' | 'thermal';
  manufacturer: string;
  model: string;
  protocol: 'modbus_tcp' | 'modbus_rtu' | 'bacnet' | 'mqtt' | 'rest' | 'opcua';
  connection: ConnectionConfig;
  registers: RegisterMap;
  scaling: ScalingConfig;
  status: MeterStatus;
  lastReading?: MeterReading;
  metadata: MeterMetadata;
}

export interface ConnectionConfig {
  // Modbus TCP/RTU
  host?: string;
  port?: number;
  deviceId?: number;
  baudRate?: number;
  parity?: 'none' | 'even' | 'odd';
  dataBits?: number;
  stopBits?: number;
  
  // BACnet
  deviceInstance?: number;
  networkNumber?: number;
  
  // MQTT
  brokerUrl?: string;
  topic?: string;
  clientId?: string;
  username?: string;
  password?: string;
  
  // REST API
  endpoint?: string;
  apiKey?: string;
  pollInterval?: number;
  
  // Common
  timeout?: number;
  retryAttempts?: number;
}

export interface RegisterMap {
  // Common energy registers
  voltage?: RegisterDefinition[];
  current?: RegisterDefinition[];
  power?: RegisterDefinition;
  energy?: RegisterDefinition;
  powerFactor?: RegisterDefinition;
  frequency?: RegisterDefinition;
  demandPower?: RegisterDefinition;
  
  // Advanced registers
  harmonics?: RegisterDefinition[];
  maxDemand?: RegisterDefinition;
  energyImport?: RegisterDefinition;
  energyExport?: RegisterDefinition;
  
  // Gas/Water specific
  flow?: RegisterDefinition;
  volume?: RegisterDefinition;
  temperature?: RegisterDefinition;
  pressure?: RegisterDefinition;
}

export interface RegisterDefinition {
  address: number;
  length: number;
  type: 'uint16' | 'uint32' | 'int16' | 'int32' | 'float32' | 'float64';
  byteOrder: 'BE' | 'LE' | 'BEBS' | 'LEBS'; // Big/Little Endian, Byte Swap
  scale?: number;
  offset?: number;
  unit?: string;
  description?: string;
}

export interface ScalingConfig {
  voltageScale: number;
  currentScale: number;
  powerScale: number;
  energyScale: number;
  demandScale: number;
}

export interface MeterStatus {
  connected: boolean;
  lastSeen: Date;
  errorCount: number;
  communicationQuality: number; // 0-100%
  alerts: MeterAlert[];
}

export interface MeterAlert {
  type: 'connection' | 'value_range' | 'communication' | 'hardware';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface MeterReading {
  timestamp: Date;
  voltage: VoltageReading;
  current: CurrentReading;
  power: PowerReading;
  energy: EnergyReading;
  quality: PowerQuality;
  demand?: DemandReading;
  raw?: any;
}

export interface VoltageReading {
  l1n?: number; // L1 to Neutral
  l2n?: number;
  l3n?: number;
  l1l2?: number; // L1 to L2
  l2l3?: number;
  l3l1?: number;
  average: number;
  unit: 'V';
}

export interface CurrentReading {
  l1?: number;
  l2?: number;
  l3?: number;
  neutral?: number;
  average: number;
  unit: 'A';
}

export interface PowerReading {
  active: number; // kW
  reactive: number; // kVAR
  apparent: number; // kVA
  l1?: number;
  l2?: number;
  l3?: number;
  total: number;
  unit: 'kW';
}

export interface EnergyReading {
  import: number; // kWh imported
  export: number; // kWh exported
  net: number; // import - export
  unit: 'kWh';
}

export interface PowerQuality {
  powerFactor: number;
  frequency: number;
  thd: { // Total Harmonic Distortion
    voltage?: number;
    current?: number;
  };
}

export interface DemandReading {
  current: number; // Current demand
  peak: number; // Peak demand this period
  timestamp: Date; // When peak occurred
  unit: 'kW';
}

export interface MeterMetadata {
  location: string;
  facilityId: string;
  zoneId?: string;
  installDate: Date;
  calibrationDate?: Date;
  notes?: string;
  tags: string[];
}

// Meter models configuration
const METER_MODELS: Record<string, Partial<MeterDevice>> = {
  'schneider_pm5500': {
    manufacturer: 'Schneider Electric',
    model: 'PowerLogic PM5500',
    protocol: 'modbus_tcp',
    registers: {
      voltage: [
        { address: 3020, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'L1-N Voltage' },
        { address: 3022, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'L2-N Voltage' },
        { address: 3024, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'L3-N Voltage' }
      ],
      current: [
        { address: 3000, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'L1 Current' },
        { address: 3002, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'L2 Current' },
        { address: 3004, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'L3 Current' }
      ],
      power: { address: 3054, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'Total Active Power' },
      energy: { address: 3204, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'Total Active Energy' },
      powerFactor: { address: 3078, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'Total Power Factor' },
      frequency: { address: 3110, length: 2, type: 'float32', byteOrder: 'BEBS', description: 'Frequency' }
    },
    scaling: {
      voltageScale: 1,
      currentScale: 1,
      powerScale: 0.001, // W to kW
      energyScale: 0.001, // Wh to kWh
      demandScale: 0.001
    }
  },
  'siemens_7kt1260': {
    manufacturer: 'Siemens',
    model: '7KT PAC1200',
    protocol: 'modbus_tcp',
    registers: {
      voltage: [
        { address: 1, length: 2, type: 'uint32', byteOrder: 'BE', scale: 0.1, description: 'L1 Voltage' },
        { address: 3, length: 2, type: 'uint32', byteOrder: 'BE', scale: 0.1, description: 'L2 Voltage' },
        { address: 5, length: 2, type: 'uint32', byteOrder: 'BE', scale: 0.1, description: 'L3 Voltage' }
      ],
      power: { address: 19, length: 2, type: 'int32', byteOrder: 'BE', scale: 1, description: 'Total Power' },
      energy: { address: 801, length: 2, type: 'uint32', byteOrder: 'BE', scale: 10, description: 'Total Energy' }
    },
    scaling: {
      voltageScale: 1,
      currentScale: 1,
      powerScale: 0.001,
      energyScale: 0.01,
      demandScale: 0.001
    }
  }
};

export class MeterIntegrationManager extends EventEmitter {
  private meters = new Map<string, MeterDevice>();
  private connections = new Map<string, any>(); // Connection objects
  private pollingJobs = new Map<string, NodeJS.Timeout>();
  private modbusClients = new Map<string, ModbusRTU>();
  private mqttClients = new Map<string, mqtt.MqttClient>();
  private influxWriter = influxDB.getWriteApi();
  private isActive = false;

  constructor() {
    super();
    this.startManager();
  }

  private startManager() {
    logger.info('api', '⚡ Starting Meter Integration Manager...');
    this.isActive = true;
    
    // Health check every minute
    setInterval(() => {
      this.performHealthCheck();
    }, 60 * 1000);
    
    logger.info('api', '✅ Meter Integration Manager started');
  }

  async addMeter(config: MeterDevice): Promise<void> {
    logger.info('api', `📊 Adding meter: ${config.name} (${config.manufacturer} ${config.model})`);
    
    try {
      // Initialize meter with model defaults if available
      const modelDefaults = METER_MODELS[`${config.manufacturer.toLowerCase()}_${config.model.toLowerCase()}`];
      if (modelDefaults) {
        config = { ...modelDefaults, ...config } as MeterDevice;
      }
      
      // Test connection
      const connected = await this.testConnection(config);
      if (!connected) {
        throw new Error('Failed to connect to meter');
      }
      
      // Initialize status
      config.status = {
        connected: true,
        lastSeen: new Date(),
        errorCount: 0,
        communicationQuality: 100,
        alerts: []
      };
      
      this.meters.set(config.id, config);
      
      // Start polling
      this.startPolling(config);
      
      logger.info('api', `✅ Meter ${config.name} added successfully`);
      this.emit('meterAdded', config);
      
    } catch (error) {
      logger.error('api', `❌ Failed to add meter ${config.name}:`, error);
      throw error;
    }
  }

  private async testConnection(meter: MeterDevice): Promise<boolean> {
    logger.info('api', `🔌 Testing connection to ${meter.name}...`);
    
    try {
      switch (meter.protocol) {
        case 'modbus_tcp':
          return await this.testModbusTCP(meter);
        case 'modbus_rtu':
          return await this.testModbusRTU(meter);
        case 'mqtt':
          return await this.testMQTT(meter);
        case 'rest':
          return await this.testREST(meter);
        case 'bacnet':
          return await this.testBACnet(meter);
        default:
          logger.warn('api', `Unsupported protocol: ${meter.protocol}`);
          return false;
      }
    } catch (error) {
      logger.error('api', `Connection test failed for ${meter.name}:`, error);
      return false;
    }
  }

  private async testModbusTCP(meter: MeterDevice): Promise<boolean> {
    const client = new ModbusRTU();
    
    try {
      await client.connectTCP(meter.connection.host!, {
        port: meter.connection.port || 502
      });
      
      client.setID(meter.connection.deviceId || 1);
      client.setTimeout(meter.connection.timeout || 5000);
      
      // Try reading a register to verify connection
      if (meter.registers.voltage && meter.registers.voltage[0]) {
        const testReg = meter.registers.voltage[0];
        await client.readHoldingRegisters(testReg.address, testReg.length);
      }
      
      this.modbusClients.set(meter.id, client);
      return true;
      
    } catch (error) {
      logger.error('api', `Modbus TCP connection failed:`, error );
      client.close(() => {});
      return false;
    }
  }

  private async testModbusRTU(meter: MeterDevice): Promise<boolean> {
    const client = new ModbusRTU();
    
    try {
      await client.connectRTUBuffered(meter.connection.host!, {
        baudRate: meter.connection.baudRate || 9600,
        dataBits: meter.connection.dataBits || 8,
        stopBits: meter.connection.stopBits || 1,
        parity: meter.connection.parity || 'none'
      });
      
      client.setID(meter.connection.deviceId || 1);
      client.setTimeout(meter.connection.timeout || 5000);
      
      this.modbusClients.set(meter.id, client);
      return true;
      
    } catch (error) {
      logger.error('api', `Modbus RTU connection failed:`, error );
      return false;
    }
  }

  private async testMQTT(meter: MeterDevice): Promise<boolean> {
    return new Promise((resolve) => {
      const client = mqtt.connect(meter.connection.brokerUrl!, {
        clientId: meter.connection.clientId || `vibelux_${meter.id}`,
        username: meter.connection.username,
        password: meter.connection.password,
        connectTimeout: meter.connection.timeout || 5000
      });
      
      client.on('connect', () => {
        logger.info('api', `✅ MQTT connected for ${meter.name}`);
        this.mqttClients.set(meter.id, client);
        
        // Subscribe to meter topic
        if (meter.connection.topic) {
          client.subscribe(meter.connection.topic, (err) => {
            if (err) {
              logger.error('api', `MQTT subscribe error:`, err);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
      
      client.on('error', (error) => {
        logger.error('api', `MQTT connection error:`, error );
        resolve(false);
      });
    });
  }

  private async testREST(meter: MeterDevice): Promise<boolean> {
    try {
      const response = await fetch(meter.connection.endpoint!, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${meter.connection.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(meter.connection.timeout || 5000)
      });
      
      return response.ok;
    } catch (error) {
      logger.error('api', `REST API connection failed:`, error );
      return false;
    }
  }

  private async testBACnet(meter: MeterDevice): Promise<boolean> {
    // BACnet implementation would go here
    // This would use a BACnet library like node-bacnet
    logger.info('api', `BACnet connection test for ${meter.name}`);
    return true;
  }

  private startPolling(meter: MeterDevice) {
    const interval = meter.connection.pollInterval || 15000; // Default 15 seconds
    
    logger.info('api', `⏰ Starting polling for ${meter.name} every ${interval/1000}s`);
    
    // Initial read
    this.readMeter(meter);
    
    // Schedule regular reads
    const job = setInterval(async () => {
      await this.readMeter(meter);
    }, interval);
    
    this.pollingJobs.set(meter.id, job);
  }

  private async readMeter(meter: MeterDevice): Promise<void> {
    try {
      let reading: MeterReading | null = null;
      
      switch (meter.protocol) {
        case 'modbus_tcp':
        case 'modbus_rtu':
          reading = await this.readModbus(meter);
          break;
        case 'mqtt':
          // MQTT is event-driven, not polled
          return;
        case 'rest':
          reading = await this.readREST(meter);
          break;
        case 'bacnet':
          reading = await this.readBACnet(meter);
          break;
      }
      
      if (reading) {
        // Update meter status
        meter.status.connected = true;
        meter.status.lastSeen = new Date();
        meter.status.errorCount = 0;
        meter.lastReading = reading;
        
        // Store reading
        await this.storeReading(meter, reading);
        
        // Emit event
        this.emit('meterReading', { meterId: meter.id, reading });
      }
      
    } catch (error) {
      logger.error('api', `Failed to read meter ${meter.name}:`, error);
      meter.status.connected = false;
      meter.status.errorCount++;
      
      if (meter.status.errorCount > 10) {
        meter.status.alerts.push({
          type: 'connection',
          severity: 'error',
          message: `Failed to read meter after ${meter.status.errorCount} attempts`,
          timestamp: new Date(),
          acknowledged: false
        });
      }
      
      this.emit('meterError', { meterId: meter.id, error });
    }
  }

  private async readModbus(meter: MeterDevice): Promise<MeterReading | null> {
    const client = this.modbusClients.get(meter.id);
    if (!client) {
      throw new Error('Modbus client not initialized');
    }
    
    const reading: Partial<MeterReading> = {
      timestamp: new Date(),
      voltage: { average: 0, unit: 'V' },
      current: { average: 0, unit: 'A' },
      power: { active: 0, reactive: 0, apparent: 0, total: 0, unit: 'kW' },
      energy: { import: 0, export: 0, net: 0, unit: 'kWh' },
      quality: { powerFactor: 0, frequency: 0, thd: {} }
    };
    
    // Read voltage registers
    if (meter.registers.voltage) {
      const voltages: number[] = [];
      for (const reg of meter.registers.voltage) {
        const value = await this.readModbusRegister(client, reg);
        voltages.push(value * meter.scaling.voltageScale);
      }
      
      reading.voltage!.l1n = voltages[0];
      reading.voltage!.l2n = voltages[1];
      reading.voltage!.l3n = voltages[2];
      reading.voltage!.average = voltages.reduce((a, b) => a + b, 0) / voltages.length;
    }
    
    // Read current registers
    if (meter.registers.current) {
      const currents: number[] = [];
      for (const reg of meter.registers.current) {
        const value = await this.readModbusRegister(client, reg);
        currents.push(value * meter.scaling.currentScale);
      }
      
      reading.current!.l1 = currents[0];
      reading.current!.l2 = currents[1];
      reading.current!.l3 = currents[2];
      reading.current!.average = currents.reduce((a, b) => a + b, 0) / currents.length;
    }
    
    // Read power
    if (meter.registers.power) {
      const power = await this.readModbusRegister(client, meter.registers.power);
      reading.power!.total = power * meter.scaling.powerScale;
      reading.power!.active = reading.power!.total; // Simplified
    }
    
    // Read energy
    if (meter.registers.energy) {
      const energy = await this.readModbusRegister(client, meter.registers.energy);
      reading.energy!.import = energy * meter.scaling.energyScale;
      reading.energy!.net = reading.energy!.import;
    }
    
    // Read power quality
    if (meter.registers.powerFactor) {
      reading.quality!.powerFactor = await this.readModbusRegister(client, meter.registers.powerFactor);
    }
    
    if (meter.registers.frequency) {
      reading.quality!.frequency = await this.readModbusRegister(client, meter.registers.frequency);
    }
    
    return reading as MeterReading;
  }

  private async readModbusRegister(client: ModbusRTU, register: RegisterDefinition): Promise<number> {
    const data = await client.readHoldingRegisters(register.address, register.length);
    
    let value = 0;
    
    switch (register.type) {
      case 'uint16':
        value = data.data[0];
        break;
      case 'uint32':
        if (register.byteOrder === 'BE') {
          value = (data.data[0] << 16) | data.data[1];
        } else {
          value = (data.data[1] << 16) | data.data[0];
        }
        break;
      case 'float32':
        const buffer = Buffer.allocUnsafe(4);
        if (register.byteOrder === 'BEBS') {
          buffer.writeUInt16BE(data.data[1], 0);
          buffer.writeUInt16BE(data.data[0], 2);
        } else if (register.byteOrder === 'BE') {
          buffer.writeUInt16BE(data.data[0], 0);
          buffer.writeUInt16BE(data.data[1], 2);
        }
        value = buffer.readFloatBE(0);
        break;
    }
    
    // Apply scaling and offset
    if (register.scale) value *= register.scale;
    if (register.offset) value += register.offset;
    
    return value;
  }

  private async readREST(meter: MeterDevice): Promise<MeterReading | null> {
    const response = await fetch(meter.connection.endpoint!, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${meter.connection.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`REST API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse vendor-specific format into standard reading
    return this.parseRESTResponse(data, meter);
  }

  private parseRESTResponse(data: any, meter: MeterDevice): MeterReading {
    // This would be customized per meter vendor
    return {
      timestamp: new Date(),
      voltage: {
        l1n: data.voltage?.l1 || 0,
        l2n: data.voltage?.l2 || 0,
        l3n: data.voltage?.l3 || 0,
        average: data.voltage?.avg || 0,
        unit: 'V'
      },
      current: {
        l1: data.current?.l1 || 0,
        l2: data.current?.l2 || 0,
        l3: data.current?.l3 || 0,
        average: data.current?.avg || 0,
        unit: 'A'
      },
      power: {
        active: data.power?.active || 0,
        reactive: data.power?.reactive || 0,
        apparent: data.power?.apparent || 0,
        total: data.power?.total || 0,
        unit: 'kW'
      },
      energy: {
        import: data.energy?.import || 0,
        export: data.energy?.export || 0,
        net: data.energy?.net || 0,
        unit: 'kWh'
      },
      quality: {
        powerFactor: data.pf || 0,
        frequency: data.frequency || 0,
        thd: data.thd || {}
      }
    };
  }

  private async readBACnet(meter: MeterDevice): Promise<MeterReading | null> {
    // BACnet implementation would go here
    return null;
  }

  private async storeReading(meter: MeterDevice, reading: MeterReading): Promise<void> {
    // Store in InfluxDB
    const point = new Point('meter_reading')
      .tag('meter_id', meter.id)
      .tag('meter_name', meter.name)
      .tag('facility_id', meter.metadata.facilityId)
      .tag('zone_id', meter.metadata.zoneId || 'facility')
      .floatField('voltage_avg', reading.voltage.average)
      .floatField('voltage_l1', reading.voltage.l1n || 0)
      .floatField('voltage_l2', reading.voltage.l2n || 0)
      .floatField('voltage_l3', reading.voltage.l3n || 0)
      .floatField('current_avg', reading.current.average)
      .floatField('current_l1', reading.current.l1 || 0)
      .floatField('current_l2', reading.current.l2 || 0)
      .floatField('current_l3', reading.current.l3 || 0)
      .floatField('power_active', reading.power.active)
      .floatField('power_reactive', reading.power.reactive)
      .floatField('power_apparent', reading.power.apparent)
      .floatField('energy_import', reading.energy.import)
      .floatField('energy_export', reading.energy.export)
      .floatField('power_factor', reading.quality.powerFactor)
      .floatField('frequency', reading.quality.frequency)
      .timestamp(reading.timestamp);
    
    this.influxWriter.writePoint(point);
    
    // Flush writes periodically
    await this.influxWriter.flush();
  }

  private async performHealthCheck(): Promise<void> {
    for (const [meterId, meter] of this.meters) {
      const now = new Date();
      const lastSeenAgo = now.getTime() - meter.status.lastSeen.getTime();
      
      // Alert if no data for more than 5 minutes
      if (lastSeenAgo > 5 * 60 * 1000) {
        meter.status.alerts.push({
          type: 'communication',
          severity: 'warning',
          message: `No data received for ${Math.floor(lastSeenAgo / 60000)} minutes`,
          timestamp: now,
          acknowledged: false
        });
        
        this.emit('meterAlert', { meterId, alert: meter.status.alerts[meter.status.alerts.length - 1] });
      }
      
      // Calculate communication quality
      meter.status.communicationQuality = Math.max(0, 100 - meter.status.errorCount * 10);
    }
  }

  // MQTT message handler
  private setupMQTTHandlers(meter: MeterDevice, client: mqtt.MqttClient): void {
    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        const reading = this.parseRESTResponse(data, meter);
        
        // Update meter status
        meter.status.connected = true;
        meter.status.lastSeen = new Date();
        meter.lastReading = reading;
        
        // Store and emit
        this.storeReading(meter, reading);
        this.emit('meterReading', { meterId: meter.id, reading });
        
      } catch (error) {
        logger.error('api', `Failed to parse MQTT message:`, error );
      }
    });
  }

  // Public API methods
  public getMeter(meterId: string): MeterDevice | undefined {
    return this.meters.get(meterId);
  }

  public getAllMeters(): MeterDevice[] {
    return Array.from(this.meters.values());
  }

  public getFacilityMeters(facilityId: string): MeterDevice[] {
    return Array.from(this.meters.values())
      .filter(meter => meter.metadata.facilityId === facilityId);
  }

  public async removeMeter(meterId: string): Promise<void> {
    const meter = this.meters.get(meterId);
    if (!meter) return;
    
    // Stop polling
    const job = this.pollingJobs.get(meterId);
    if (job) {
      clearInterval(job);
      this.pollingJobs.delete(meterId);
    }
    
    // Close connections
    const modbusClient = this.modbusClients.get(meterId);
    if (modbusClient) {
      modbusClient.close(() => {});
      this.modbusClients.delete(meterId);
    }
    
    const mqttClient = this.mqttClients.get(meterId);
    if (mqttClient) {
      mqttClient.end();
      this.mqttClients.delete(meterId);
    }
    
    this.meters.delete(meterId);
    logger.info('api', `🗑️ Removed meter ${meter.name}`);
  }

  public async testMeterConnection(meterId: string): Promise<boolean> {
    const meter = this.meters.get(meterId);
    if (!meter) return false;
    
    return await this.testConnection(meter);
  }

  public getLatestReading(meterId: string): MeterReading | undefined {
    return this.meters.get(meterId)?.lastReading;
  }

  public stopAllPolling(): void {
    for (const [meterId, job] of this.pollingJobs) {
      clearInterval(job);
      logger.info('api', `⏹️ Stopped polling for meter ${meterId}`);
    }
    
    this.pollingJobs.clear();
    this.isActive = false;
  }
}

export default MeterIntegrationManager;