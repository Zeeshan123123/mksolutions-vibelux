/**
 * Real Modbus TCP/RTU Client Implementation
 * Supports actual hardware device communication
 */

// Dynamic import for optional modbus-serial
let ModbusRTU: any;
try {
  // Use eval to prevent static analyzer from bundling
  // eslint-disable-next-line no-eval
  ModbusRTU = eval("require('modbus-serial')");
} catch (e) {
  // modbus-serial is optional, provide mock if not available
  ModbusRTU = class MockModbusRTU {
    connectTCP() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    connectRTU() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    readHoldingRegisters() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    readInputRegisters() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    readCoils() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    readDiscreteInputs() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    writeRegister() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    writeRegisters() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    writeCoil() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    writeCoils() { return Promise.reject(new Error('Modbus not available in browser environment')); }
    setID() {}
    setTimeout() {}
    isOpen = false;
  };
}

export interface ModbusDeviceConfig {
  type: 'TCP' | 'RTU';
  name: string;
  description?: string;
  // TCP Config
  host?: string;
  port?: number;
  // RTU Config
  serialPort?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  // Common
  unitId: number;
  timeout?: number;
  retries?: number;
  pollInterval?: number; // ms
}

export interface ModbusRegister {
  address: number;
  type: 'coil' | 'discrete' | 'holding' | 'input';
  length?: number; // For multi-register values
  scale?: number; // Scaling factor
  offset?: number; // Offset value
  format?: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' | 'float64';
  name: string;
  unit?: string;
}

export interface ModbusDeviceMapping {
  deviceType: string;
  manufacturer?: string;
  model?: string;
  registers: {
    // Status registers
    status?: ModbusRegister;
    alarms?: ModbusRegister;
    warnings?: ModbusRegister;
    // Measurement registers
    temperature?: ModbusRegister;
    humidity?: ModbusRegister;
    co2?: ModbusRegister;
    pressure?: ModbusRegister;
    flow?: ModbusRegister;
    power?: ModbusRegister;
    energy?: ModbusRegister;
    voltage?: ModbusRegister;
    current?: ModbusRegister;
    frequency?: ModbusRegister;
    // Control registers
    enable?: ModbusRegister;
    setpoint?: ModbusRegister;
    mode?: ModbusRegister;
    speed?: ModbusRegister;
    position?: ModbusRegister;
    // Custom registers
    [key: string]: ModbusRegister | undefined;
  };
}

// Common device mappings
export const DEVICE_MAPPINGS: Record<string, ModbusDeviceMapping> = {
  'schneider-pm5000': {
    deviceType: 'Power Meter',
    manufacturer: 'Schneider Electric',
    model: 'PM5000',
    registers: {
      voltage: { address: 3020, type: 'input', format: 'float32', length: 2, name: 'Voltage L-N avg', unit: 'V' },
      current: { address: 3000, type: 'input', format: 'float32', length: 2, name: 'Current avg', unit: 'A' },
      power: { address: 3054, type: 'input', format: 'float32', length: 2, name: 'Active power total', unit: 'kW', scale: 0.001 },
      energy: { address: 3204, type: 'input', format: 'float64', length: 4, name: 'Active energy import', unit: 'kWh' },
      frequency: { address: 3110, type: 'input', format: 'float32', length: 2, name: 'Frequency', unit: 'Hz' }
    }
  },
  'siemens-s7-1200': {
    deviceType: 'PLC',
    manufacturer: 'Siemens',
    model: 'S7-1200',
    registers: {
      status: { address: 0, type: 'discrete', name: 'System Status' },
      alarms: { address: 10, type: 'holding', format: 'uint16', name: 'Active Alarms' },
      temperature: { address: 100, type: 'input', format: 'int16', scale: 0.1, name: 'Temperature', unit: '°C' },
      humidity: { address: 101, type: 'input', format: 'uint16', scale: 0.1, name: 'Humidity', unit: '%' },
      setpoint: { address: 200, type: 'holding', format: 'int16', scale: 0.1, name: 'Temperature Setpoint', unit: '°C' }
    }
  },
  'generic-sensor': {
    deviceType: 'Environmental Sensor',
    registers: {
      temperature: { address: 0, type: 'input', format: 'int16', scale: 0.1, name: 'Temperature', unit: '°C' },
      humidity: { address: 1, type: 'input', format: 'uint16', scale: 0.1, name: 'Humidity', unit: '%' },
      co2: { address: 2, type: 'input', format: 'uint16', name: 'CO2', unit: 'ppm' },
      status: { address: 10, type: 'input', format: 'uint16', name: 'Status' }
    }
  }
};

export class ModbusClient {
  private client: ModbusRTU;
  private config: ModbusDeviceConfig;
  private connected: boolean = false;
  private mapping?: ModbusDeviceMapping;
  private pollTimer?: NodeJS.Timeout;
  private lastValues: Map<string, any> = new Map();
  
  constructor(config: ModbusDeviceConfig, mapping?: ModbusDeviceMapping) {
    this.client = new ModbusRTU();
    this.config = config;
    this.mapping = mapping;
    
    // Set default timeout
    this.client.setTimeout(config.timeout || 5000);
  }
  
  async connect(): Promise<boolean> {
    try {
      if (this.config.type === 'TCP') {
        await this.client.connectTCP(this.config.host!, {
          port: this.config.port || 502
        });
      } else {
        await this.client.connectRTUBuffered(this.config.serialPort!, {
          baudRate: this.config.baudRate || 9600,
          dataBits: this.config.dataBits || 8,
          stopBits: this.config.stopBits || 1,
          parity: this.config.parity || 'none'
        });
      }
      
      this.client.setID(this.config.unitId);
      this.connected = true;
      
      // Start polling if interval is set
      if (this.config.pollInterval) {
        this.startPolling();
      }
      
      return true;
    } catch (error) {
      logger.error('api', 'Modbus connection failed:', error );
      this.connected = false;
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    this.stopPolling();
    if (this.client.isOpen) {
      await this.client.close();
    }
    this.connected = false;
  }
  
  isConnected(): boolean {
    return this.connected && this.client.isOpen;
  }
  
  async readRegister(register: ModbusRegister): Promise<any> {
    if (!this.isConnected()) {
      throw new Error('Not connected to Modbus device');
    }
    
    try {
      let rawValue: any;
      
      switch (register.type) {
        case 'coil':
          const coils = await this.client.readCoils(register.address, register.length || 1);
          rawValue = coils.data[0];
          break;
          
        case 'discrete':
          const discretes = await this.client.readDiscreteInputs(register.address, register.length || 1);
          rawValue = discretes.data[0];
          break;
          
        case 'holding':
          const holdings = await this.client.readHoldingRegisters(register.address, register.length || 1);
          rawValue = this.parseRegisterValue(holdings.buffer, register);
          break;
          
        case 'input':
          const inputs = await this.client.readInputRegisters(register.address, register.length || 1);
          rawValue = this.parseRegisterValue(inputs.buffer, register);
          break;
      }
      
      // Apply scaling and offset
      let value = rawValue;
      if (typeof value === 'number') {
        if (register.scale) value *= register.scale;
        if (register.offset) value += register.offset;
      }
      
      // Store last value
      this.lastValues.set(register.name, value);
      
      return value;
    } catch (error) {
      logger.error('api', `Failed to read register ${register.name}:`, error);
      throw error;
    }
  }
  
  async writeRegister(register: ModbusRegister, value: any): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected to Modbus device');
    }
    
    try {
      // Apply inverse scaling and offset
      let writeValue = value;
      if (typeof value === 'number') {
        if (register.offset) writeValue -= register.offset;
        if (register.scale) writeValue /= register.scale;
      }
      
      switch (register.type) {
        case 'coil':
          await this.client.writeCoil(register.address, Boolean(writeValue));
          break;
          
        case 'holding':
          if (register.length && register.length > 1) {
            const buffer = this.encodeRegisterValue(writeValue, register);
            await this.client.writeRegisters(register.address, buffer);
          } else {
            await this.client.writeRegister(register.address, Math.round(writeValue));
          }
          break;
          
        default:
          throw new Error(`Cannot write to ${register.type} register`);
      }
    } catch (error) {
      logger.error('api', `Failed to write register ${register.name}:`, error);
      throw error;
    }
  }
  
  async readAllMappedRegisters(): Promise<Record<string, any>> {
    if (!this.mapping) {
      throw new Error('No device mapping configured');
    }
    
    const values: Record<string, any> = {};
    
    for (const [key, register] of Object.entries(this.mapping.registers)) {
      if (register) {
        try {
          values[key] = await this.readRegister(register);
        } catch (error) {
          logger.error('api', `Failed to read ${key}:`, error);
          values[key] = null;
        }
      }
    }
    
    return values;
  }
  
  getLastValue(registerName: string): any {
    return this.lastValues.get(registerName);
  }
  
  getAllLastValues(): Record<string, any> {
    const values: Record<string, any> = {};
    this.lastValues.forEach((value, key) => {
      values[key] = value;
    });
    return values;
  }
  
  private parseRegisterValue(buffer: Buffer, register: ModbusRegister): any {
    switch (register.format) {
      case 'int16':
        return buffer.readInt16BE(0);
      case 'uint16':
        return buffer.readUInt16BE(0);
      case 'int32':
        return buffer.readInt32BE(0);
      case 'uint32':
        return buffer.readUInt32BE(0);
      case 'float32':
        return buffer.readFloatBE(0);
      case 'float64':
        return buffer.readDoubleBE(0);
      default:
        return buffer.readUInt16BE(0);
    }
  }
  
  private encodeRegisterValue(value: number, register: ModbusRegister): number[] {
    const buffer = Buffer.alloc(register.length! * 2);
    
    switch (register.format) {
      case 'int16':
        buffer.writeInt16BE(value, 0);
        break;
      case 'uint16':
        buffer.writeUInt16BE(value, 0);
        break;
      case 'int32':
        buffer.writeInt32BE(value, 0);
        break;
      case 'uint32':
        buffer.writeUInt32BE(value, 0);
        break;
      case 'float32':
        buffer.writeFloatBE(value, 0);
        break;
      case 'float64':
        buffer.writeDoubleBE(value, 0);
        break;
      default:
        buffer.writeUInt16BE(value, 0);
    }
    
    const registers: number[] = [];
    for (let i = 0; i < register.length!; i++) {
      registers.push(buffer.readUInt16BE(i * 2));
    }
    
    return registers;
  }
  
  private startPolling(): void {
    if (!this.config.pollInterval || !this.mapping) return;
    
    this.pollTimer = setInterval(async () => {
      if (this.isConnected()) {
        try {
          await this.readAllMappedRegisters();
        } catch (error) {
          logger.error('api', 'Polling error:', error );
        }
      }
    }, this.config.pollInterval);
  }
  
  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }
}

// Factory function for common device types
export function createModbusDevice(
  type: string,
  config: ModbusDeviceConfig
): ModbusClient {
  const mapping = DEVICE_MAPPINGS[type];
  return new ModbusClient(config, mapping);
}