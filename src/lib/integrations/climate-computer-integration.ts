/**
 * Climate Computer Integration System
 * Bidirectional integration with Priva, Hoogendoorn, Ridder climate control systems
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';

export type ClimateComputerBrand = 'priva' | 'hoogendoorn' | 'ridder' | 'argus' | 'link4';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'syncing';
export type ControlMode = 'monitor' | 'advise' | 'control';
export type DataFlow = 'read' | 'write' | 'bidirectional';

export interface ClimateComputer {
  id: string;
  brand: ClimateComputerBrand;
  model: string;
  version: string;
  
  // Connection Details
  connection: {
    type: 'api' | 'modbus' | 'opc' | 'mqtt';
    host: string;
    port: number;
    credentials: {
      username?: string;
      password?: string;
      apiKey?: string;
    };
  };
  
  // Configuration
  controlMode: ControlMode;
  dataFlow: DataFlow;
  syncInterval: number; // seconds
  
  // Capabilities
  capabilities: {
    temperature: boolean;
    humidity: boolean;
    co2: boolean;
    lighting: boolean;
    irrigation: boolean;
    ventilation: boolean;
    heating: boolean;
    cooling: boolean;
    screens: boolean;
  };
  
  // Status
  status: ConnectionStatus;
  lastSync: Date;
  lastError?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface ClimateSetpoint {
  id: string;
  computerId: string;
  compartmentId: string;
  
  // Environmental Setpoints
  temperature: {
    day: number;
    night: number;
    deadband: number;
    integrationTime?: number;
  };
  
  humidity: {
    day: number;
    night: number;
    deadband: number;
    dehumidifyBelow?: number;
  };
  
  co2: {
    day: number;
    night: number;
    dosing: boolean;
    ventAbove?: number;
  };
  
  // Lighting Setpoints
  lighting: {
    photoperiod: number; // hours
    intensity: number; // μmol/m²/s
    sunrise: string; // HH:MM
    sunset: string;
    dli: number;
  };
  
  // Irrigation Setpoints
  irrigation: {
    startTime: string;
    interval: number; // minutes
    duration: number; // seconds
    ecTarget: number;
    phTarget: number;
  };
  
  // Control Strategies
  strategies: {
    energySaving: boolean;
    moistureControl: boolean;
    temperatureIntegration: boolean;
    adaptiveControl: boolean;
  };
  
  // Status
  activeFrom: Date;
  activeTo?: Date;
  isActive: boolean;
  
  // Tracking
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClimateMeasurement {
  id: string;
  computerId: string;
  compartmentId: string;
  timestamp: Date;
  
  // Measurements
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  
  // Additional Sensors
  leafTemperature?: number;
  soilTemperature?: number;
  soilMoisture?: number;
  ec?: number;
  ph?: number;
  
  // Calculated Values
  vpd: number;
  dewPoint: number;
  absoluteHumidity: number;
  
  // Equipment Status
  heatingActive: boolean;
  coolingActive: boolean;
  humidificationActive: boolean;
  dehumidificationActive: boolean;
  co2DosingActive: boolean;
  lightsActive: boolean;
  screensPosition?: number;
}

export interface ControlAdvice {
  id: string;
  computerId: string;
  compartmentId: string;
  
  // Advice Details
  parameter: string;
  currentValue: number;
  recommendedValue: number;
  reason: string;
  
  // Impact Analysis
  expectedBenefit: string;
  energyImpact: number; // kWh
  costImpact: number; // $
  
  // Implementation
  priority: 'low' | 'medium' | 'high';
  autoApply: boolean;
  
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'applied';
  appliedAt?: Date;
  appliedBy?: string;
  
  // Tracking
  createdAt: Date;
  expiresAt: Date;
}

export interface ClimateCompartment {
  id: string;
  computerId: string;
  name: string;
  
  // Physical Details
  area: number; // m²
  volume: number; // m³
  cropType: string;
  
  // Sensor Configuration
  sensors: Array<{
    type: string;
    id: string;
    location: string;
    calibrationDate: Date;
  }>;
  
  // Control Zones
  zones: Array<{
    id: string;
    name: string;
    area: number;
    independentControl: boolean;
  }>;
  
  // Current Status
  currentSetpoints?: ClimateSetpoint;
  currentMeasurements?: ClimateMeasurement;
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Brand-specific API interfaces
interface PrivaAPI {
  baseURL: string;
  version: string;
  
  // Methods
  authenticate(): Promise<string>;
  getCompartments(): Promise<any[]>;
  getMeasurements(compartmentId: string, startTime: Date, endTime: Date): Promise<any[]>;
  getSetpoints(compartmentId: string): Promise<any>;
  setSetpoint(compartmentId: string, parameter: string, value: any): Promise<boolean>;
}

interface HoogendoornAPI {
  baseURL: string;
  version: string;
  
  // Methods
  connect(): Promise<void>;
  readData(addresses: number[]): Promise<any[]>;
  writeData(address: number, value: any): Promise<boolean>;
  getAlarms(): Promise<any[]>;
}

interface RidderAPI {
  baseURL: string;
  version: string;
  
  // Methods
  login(credentials: any): Promise<string>;
  getClimateData(greenhouseId: string): Promise<any>;
  updateSettings(greenhouseId: string, settings: any): Promise<boolean>;
  getHistoricalData(greenhouseId: string, period: any): Promise<any[]>;
}

class ClimateComputerIntegration extends EventEmitter {
  private facilityId: string;
  private userId: string;
  private computers: Map<string, ClimateComputer> = new Map();
  private connections: Map<string, any> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(facilityId: string, userId: string) {
    super();
    this.facilityId = facilityId;
    this.userId = userId;
    this.initializeSystem();
  }

  /**
   * Initialize climate computer integration
   */
  private async initializeSystem(): Promise<void> {
    try {
      await this.loadClimateComputers();
      await this.establishConnections();
      this.startSynchronization();
      
      logger.info('api', 'Climate computer integration initialized');
    } catch (error) {
      logger.error('api', 'Failed to initialize climate integration:', error );
    }
  }

  /**
   * Add climate computer
   */
  async addClimateComputer(computerData: Omit<ClimateComputer, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClimateComputer> {
    try {
      const computer: ClimateComputer = {
        id: this.generateComputerId(),
        ...computerData,
        status: 'disconnected',
        lastSync: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveComputer(computer);
      this.computers.set(computer.id, computer);

      // Establish connection
      await this.connectToComputer(computer.id);

      this.emit('computer-added', computer);
      logger.info('api', `Added climate computer: ${computer.brand} ${computer.model}`);
      
      return computer;
    } catch (error) {
      logger.error('api', 'Failed to add climate computer:', error );
      throw error;
    }
  }

  /**
   * Connect to climate computer
   */
  async connectToComputer(computerId: string): Promise<void> {
    try {
      const computer = this.computers.get(computerId);
      if (!computer) throw new Error('Computer not found');

      let api: any;

      switch (computer.brand) {
        case 'priva':
          api = await this.connectToPriva(computer);
          break;
        case 'hoogendoorn':
          api = await this.connectToHoogendoorn(computer);
          break;
        case 'ridder':
          api = await this.connectToRidder(computer);
          break;
        default:
          throw new Error(`Unsupported brand: ${computer.brand}`);
      }

      this.connections.set(computerId, api);
      computer.status = 'connected';
      computer.updatedAt = new Date();
      await this.saveComputer(computer);

      // Start sync interval
      this.startComputerSync(computerId);

      this.emit('computer-connected', computer);
      logger.info('api', `Connected to ${computer.brand} computer`);
    } catch (error) {
      logger.error('api', 'Failed to connect to climate computer:', error );
      const computer = this.computers.get(computerId);
      if (computer) {
        computer.status = 'error';
        computer.lastError = error.message;
        await this.saveComputer(computer);
      }
      throw error;
    }
  }

  /**
   * Get current climate data
   */
  async getCurrentClimateData(computerId: string): Promise<{
    compartments: ClimateCompartment[];
    measurements: ClimateMeasurement[];
    setpoints: ClimateSetpoint[];
  }> {
    try {
      const computer = this.computers.get(computerId);
      if (!computer) throw new Error('Computer not found');

      const compartments = await this.getCompartments(computerId);
      const measurements = [];
      const setpoints = [];

      for (const compartment of compartments) {
        const measurement = await this.getMeasurement(computerId, compartment.id);
        if (measurement) measurements.push(measurement);

        const setpoint = await this.getSetpoint(computerId, compartment.id);
        if (setpoint) setpoints.push(setpoint);
      }

      return { compartments, measurements, setpoints };
    } catch (error) {
      logger.error('api', 'Failed to get climate data:', error );
      throw error;
    }
  }

  /**
   * Update climate setpoint
   */
  async updateSetpoint(
    computerId: string,
    compartmentId: string,
    parameter: string,
    value: any
  ): Promise<boolean> {
    try {
      const computer = this.computers.get(computerId);
      if (!computer) throw new Error('Computer not found');

      if (computer.controlMode === 'monitor') {
        throw new Error('Computer is in monitor-only mode');
      }

      // Get current setpoint
      const currentSetpoint = await this.getSetpoint(computerId, compartmentId);
      if (!currentSetpoint) throw new Error('Setpoint not found');

      // Update the specific parameter
      const updatedSetpoint = this.updateSetpointParameter(currentSetpoint, parameter, value);

      // Apply to climate computer
      const success = await this.applySetpoint(computerId, compartmentId, updatedSetpoint);

      if (success) {
        // Save to database
        updatedSetpoint.updatedAt = new Date();
        await this.saveSetpoint(updatedSetpoint);

        // Log the change
        await this.logSetpointChange(computerId, compartmentId, parameter, value);

        this.emit('setpoint-updated', { computerId, compartmentId, parameter, value });
        logger.info('api', `Updated setpoint: ${parameter} = ${value}`);
      }

      return success;
    } catch (error) {
      logger.error('api', 'Failed to update setpoint:', error );
      throw error;
    }
  }

  /**
   * Generate control advice
   */
  async generateControlAdvice(computerId: string, compartmentId: string): Promise<ControlAdvice[]> {
    try {
      const computer = this.computers.get(computerId);
      if (!computer) throw new Error('Computer not found');

      const measurement = await this.getMeasurement(computerId, compartmentId);
      const setpoint = await this.getSetpoint(computerId, compartmentId);
      
      if (!measurement || !setpoint) {
        throw new Error('Missing data for advice generation');
      }

      const advice: ControlAdvice[] = [];

      // Temperature optimization
      if (Math.abs(measurement.temperature - setpoint.temperature.day) > 2) {
        advice.push({
          id: this.generateAdviceId(),
          computerId,
          compartmentId,
          parameter: 'temperature.day',
          currentValue: measurement.temperature,
          recommendedValue: setpoint.temperature.day,
          reason: 'Temperature deviation exceeds tolerance',
          expectedBenefit: 'Improved plant growth and reduced stress',
          energyImpact: this.calculateEnergyImpact('temperature', measurement.temperature, setpoint.temperature.day),
          costImpact: this.calculateCostImpact('temperature', measurement.temperature, setpoint.temperature.day),
          priority: 'high',
          autoApply: computer.controlMode === 'control',
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000) // 1 hour
        });
      }

      // VPD optimization
      const currentVPD = measurement.vpd;
      const optimalVPD = this.calculateOptimalVPD(measurement.temperature);
      if (Math.abs(currentVPD - optimalVPD) > 0.2) {
        advice.push({
          id: this.generateAdviceId(),
          computerId,
          compartmentId,
          parameter: 'humidity',
          currentValue: measurement.humidity,
          recommendedValue: this.calculateTargetHumidity(measurement.temperature, optimalVPD),
          reason: `VPD is ${currentVPD.toFixed(2)} kPa, optimal is ${optimalVPD.toFixed(2)} kPa`,
          expectedBenefit: 'Optimized transpiration and nutrient uptake',
          energyImpact: 5, // kWh estimate
          costImpact: 0.6, // $ estimate
          priority: 'medium',
          autoApply: false,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000)
        });
      }

      // CO2 optimization
      if (measurement.lightsActive && measurement.co2 < setpoint.co2.day * 0.9) {
        advice.push({
          id: this.generateAdviceId(),
          computerId,
          compartmentId,
          parameter: 'co2.dosing',
          currentValue: measurement.co2,
          recommendedValue: setpoint.co2.day,
          reason: 'CO2 levels below optimal during photoperiod',
          expectedBenefit: '5-10% increase in photosynthesis rate',
          energyImpact: 0,
          costImpact: 2.5, // CO2 cost
          priority: 'medium',
          autoApply: computer.controlMode === 'control',
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000)
        });
      }

      // Energy-saving opportunities
      if (!measurement.lightsActive && measurement.temperature > setpoint.temperature.night + 1) {
        advice.push({
          id: this.generateAdviceId(),
          computerId,
          compartmentId,
          parameter: 'temperature.night',
          currentValue: measurement.temperature,
          recommendedValue: setpoint.temperature.night,
          reason: 'Nighttime temperature higher than necessary',
          expectedBenefit: 'Reduced energy consumption without affecting growth',
          energyImpact: -10, // Negative = savings
          costImpact: -1.2,
          priority: 'low',
          autoApply: false,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7200000) // 2 hours
        });
      }

      return advice;
    } catch (error) {
      logger.error('api', 'Failed to generate control advice:', error );
      throw error;
    }
  }

  /**
   * Apply control advice
   */
  async applyControlAdvice(adviceId: string): Promise<boolean> {
    try {
      const advice = await this.getAdvice(adviceId);
      if (!advice) throw new Error('Advice not found');

      if (advice.status !== 'pending') {
        throw new Error('Advice already processed');
      }

      // Apply the recommended change
      const success = await this.updateSetpoint(
        advice.computerId,
        advice.compartmentId,
        advice.parameter,
        advice.recommendedValue
      );

      if (success) {
        advice.status = 'applied';
        advice.appliedAt = new Date();
        advice.appliedBy = this.userId;
        await this.saveAdvice(advice);

        this.emit('advice-applied', advice);
        logger.info('api', `Applied control advice: ${advice.parameter}`);
      }

      return success;
    } catch (error) {
      logger.error('api', 'Failed to apply control advice:', error );
      throw error;
    }
  }

  /**
   * Get historical climate data
   */
  async getHistoricalClimateData(
    computerId: string,
    compartmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    measurements: ClimateMeasurement[];
    setpoints: ClimateSetpoint[];
    events: any[];
  }> {
    try {
      const measurements = await this.getHistoricalMeasurements(
        computerId,
        compartmentId,
        startDate,
        endDate
      );

      const setpoints = await this.getHistoricalSetpoints(
        computerId,
        compartmentId,
        startDate,
        endDate
      );

      const events = await this.getClimateEvents(
        computerId,
        compartmentId,
        startDate,
        endDate
      );

      return { measurements, setpoints, events };
    } catch (error) {
      logger.error('api', 'Failed to get historical climate data:', error );
      throw error;
    }
  }

  // Brand-specific connection methods

  private async connectToPriva(computer: ClimateComputer): Promise<PrivaAPI> {
    const api: PrivaAPI = {
      baseURL: `http://${computer.connection.host}:${computer.connection.port}/api`,
      version: computer.version,
      
      authenticate: async () => {
        // Priva authentication logic
        const response = await fetch(`${api.baseURL}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: computer.connection.credentials.username,
            password: computer.connection.credentials.password
          })
        });
        
        if (!response.ok) throw new Error('Authentication failed');
        const data = await response.json();
        return data.token;
      },
      
      getCompartments: async () => {
        const token = await api.authenticate();
        const response = await fetch(`${api.baseURL}/compartments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
      },
      
      getMeasurements: async (compartmentId: string, startTime: Date, endTime: Date) => {
        const token = await api.authenticate();
        const response = await fetch(
          `${api.baseURL}/compartments/${compartmentId}/measurements?start=${startTime.toISOString()}&end=${endTime.toISOString()}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return await response.json();
      },
      
      getSetpoints: async (compartmentId: string) => {
        const token = await api.authenticate();
        const response = await fetch(
          `${api.baseURL}/compartments/${compartmentId}/setpoints`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return await response.json();
      },
      
      setSetpoint: async (compartmentId: string, parameter: string, value: any) => {
        const token = await api.authenticate();
        const response = await fetch(
          `${api.baseURL}/compartments/${compartmentId}/setpoints/${parameter}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value })
          }
        );
        return response.ok;
      }
    };

    // Test connection
    await api.authenticate();
    return api;
  }

  private async connectToHoogendoorn(computer: ClimateComputer): Promise<HoogendoornAPI> {
    const api: HoogendoornAPI = {
      baseURL: `http://${computer.connection.host}:${computer.connection.port}`,
      version: computer.version,
      
      connect: async () => {
        // Hoogendoorn IIVO connection logic
        // This would typically use their proprietary protocol
        logger.info('api', 'Connecting to Hoogendoorn IIVO...');
      },
      
      readData: async (addresses: number[]) => {
        // Read data from specific memory addresses
        return addresses.map(addr => ({ address: addr, value: Math.random() * 100 }));
      },
      
      writeData: async (address: number, value: any) => {
        // Write data to specific memory address
        logger.info('api', `Writing ${value} to address ${address}`);
        return true;
      },
      
      getAlarms: async () => {
        // Get active alarms
        return [];
      }
    };

    await api.connect();
    return api;
  }

  private async connectToRidder(computer: ClimateComputer): Promise<RidderAPI> {
    const api: RidderAPI = {
      baseURL: `https://${computer.connection.host}/api/v2`,
      version: computer.version,
      
      login: async (credentials: any) => {
        // Ridder HortiMaX login
        const response = await fetch(`${api.baseURL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) throw new Error('Login failed');
        const data = await response.json();
        return data.sessionId;
      },
      
      getClimateData: async (greenhouseId: string) => {
        const sessionId = await api.login(computer.connection.credentials);
        const response = await fetch(
          `${api.baseURL}/greenhouses/${greenhouseId}/climate`,
          { headers: { 'X-Session-Id': sessionId } }
        );
        return await response.json();
      },
      
      updateSettings: async (greenhouseId: string, settings: any) => {
        const sessionId = await api.login(computer.connection.credentials);
        const response = await fetch(
          `${api.baseURL}/greenhouses/${greenhouseId}/settings`,
          {
            method: 'PUT',
            headers: {
              'X-Session-Id': sessionId,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
          }
        );
        return response.ok;
      },
      
      getHistoricalData: async (greenhouseId: string, period: any) => {
        const sessionId = await api.login(computer.connection.credentials);
        const response = await fetch(
          `${api.baseURL}/greenhouses/${greenhouseId}/history?start=${period.start}&end=${period.end}`,
          { headers: { 'X-Session-Id': sessionId } }
        );
        return await response.json();
      }
    };

    // Test connection
    await api.login(computer.connection.credentials);
    return api;
  }

  // Helper methods

  private startComputerSync(computerId: string): void {
    const computer = this.computers.get(computerId);
    if (!computer) return;

    // Clear existing interval
    const existingInterval = this.syncIntervals.get(computerId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Start new sync interval
    const interval = setInterval(async () => {
      await this.syncClimateData(computerId);
    }, computer.syncInterval * 1000);

    this.syncIntervals.set(computerId, interval);
  }

  private async syncClimateData(computerId: string): Promise<void> {
    try {
      const computer = this.computers.get(computerId);
      if (!computer || computer.status !== 'connected') return;

      computer.status = 'syncing';
      await this.saveComputer(computer);

      // Get current data from climate computer
      const data = await this.getCurrentClimateData(computerId);

      // Store measurements
      for (const measurement of data.measurements) {
        await this.saveMeasurement(measurement);
      }

      // Check for needed adjustments
      if (computer.controlMode !== 'monitor') {
        for (const compartment of data.compartments) {
          const advice = await this.generateControlAdvice(computerId, compartment.id);
          
          // Auto-apply high priority advice if in control mode
          if (computer.controlMode === 'control') {
            const highPriorityAdvice = advice.filter(a => a.priority === 'high' && a.autoApply);
            for (const a of highPriorityAdvice) {
              await this.applyControlAdvice(a.id);
            }
          }
        }
      }

      computer.status = 'connected';
      computer.lastSync = new Date();
      computer.lastError = undefined;
      await this.saveComputer(computer);

    } catch (error) {
      logger.error('api', `Sync failed for computer ${computerId}:`, error);
      const computer = this.computers.get(computerId);
      if (computer) {
        computer.status = 'error';
        computer.lastError = error.message;
        await this.saveComputer(computer);
      }
    }
  }

  private async getCompartments(computerId: string): Promise<ClimateCompartment[]> {
    return await prisma.climateCompartment.findMany({
      where: { computerId, isActive: true }
    });
  }

  private async getMeasurement(computerId: string, compartmentId: string): Promise<ClimateMeasurement | null> {
    const computer = this.computers.get(computerId);
    const api = this.connections.get(computerId);
    
    if (!computer || !api) return null;

    try {
      let rawData: any;
      
      switch (computer.brand) {
        case 'priva':
          const measurements = await api.getMeasurements(
            compartmentId,
            new Date(Date.now() - 60000),
            new Date()
          );
          rawData = measurements[0];
          break;
          
        case 'hoogendoorn':
          // Map Hoogendoorn memory addresses
          const addresses = [100, 101, 102, 103]; // Example addresses
          const values = await api.readData(addresses);
          rawData = this.mapHoogendoornData(values);
          break;
          
        case 'ridder':
          rawData = await api.getClimateData(compartmentId);
          break;
      }

      if (!rawData) return null;

      // Convert to standard format
      return this.convertToStandardMeasurement(computerId, compartmentId, rawData, computer.brand);
      
    } catch (error) {
      logger.error('api', 'Failed to get measurement:', error );
      return null;
    }
  }

  private async getSetpoint(computerId: string, compartmentId: string): Promise<ClimateSetpoint | null> {
    return await prisma.climateSetpoint.findFirst({
      where: {
        computerId,
        compartmentId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private updateSetpointParameter(setpoint: ClimateSetpoint, parameter: string, value: any): ClimateSetpoint {
    const updated = { ...setpoint };
    const path = parameter.split('.');
    
    let current: any = updated;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    return updated;
  }

  private async applySetpoint(
    computerId: string,
    compartmentId: string,
    setpoint: ClimateSetpoint
  ): Promise<boolean> {
    const computer = this.computers.get(computerId);
    const api = this.connections.get(computerId);
    
    if (!computer || !api) return false;

    try {
      switch (computer.brand) {
        case 'priva':
          // Apply each parameter
          await api.setSetpoint(compartmentId, 'temperature.day', setpoint.temperature.day);
          await api.setSetpoint(compartmentId, 'humidity.day', setpoint.humidity.day);
          await api.setSetpoint(compartmentId, 'co2.day', setpoint.co2.day);
          break;
          
        case 'hoogendoorn':
          // Write to memory addresses
          await api.writeData(200, setpoint.temperature.day);
          await api.writeData(201, setpoint.humidity.day);
          await api.writeData(202, setpoint.co2.day);
          break;
          
        case 'ridder':
          await api.updateSettings(compartmentId, {
            climate: {
              temperature: setpoint.temperature,
              humidity: setpoint.humidity,
              co2: setpoint.co2
            }
          });
          break;
      }
      
      return true;
    } catch (error) {
      logger.error('api', 'Failed to apply setpoint:', error );
      return false;
    }
  }

  private calculateEnergyImpact(parameter: string, currentValue: number, targetValue: number): number {
    // Simplified energy impact calculation
    const delta = Math.abs(targetValue - currentValue);
    
    switch (parameter) {
      case 'temperature':
        return delta * 2.5; // kWh per degree
      case 'humidity':
        return delta * 0.5; // kWh per % RH
      case 'co2':
        return delta * 0.01; // kWh per ppm
      default:
        return 0;
    }
  }

  private calculateCostImpact(parameter: string, currentValue: number, targetValue: number): number {
    const energyImpact = this.calculateEnergyImpact(parameter, currentValue, targetValue);
    const energyCost = 0.12; // $/kWh
    return energyImpact * energyCost;
  }

  private calculateOptimalVPD(temperature: number): number {
    // Calculate optimal VPD based on temperature
    // Vegetative: 0.8-1.0 kPa, Flowering: 1.0-1.5 kPa
    if (temperature < 75) return 0.9;
    if (temperature < 80) return 1.1;
    return 1.3;
  }

  private calculateTargetHumidity(temperature: number, targetVPD: number): number {
    // Calculate humidity needed for target VPD at given temperature
    const saturationPressure = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const actualPressure = saturationPressure - targetVPD;
    return (actualPressure / saturationPressure) * 100;
  }

  private convertToStandardMeasurement(
    computerId: string,
    compartmentId: string,
    rawData: any,
    brand: ClimateComputerBrand
  ): ClimateMeasurement {
    // Convert brand-specific data to standard format
    const base = {
      id: this.generateMeasurementId(),
      computerId,
      compartmentId,
      timestamp: new Date()
    };

    switch (brand) {
      case 'priva':
        return {
          ...base,
          temperature: rawData.temperature,
          humidity: rawData.humidity,
          co2: rawData.co2,
          light: rawData.parLight || 0,
          vpd: rawData.vpd || this.calculateVPD(rawData.temperature, rawData.humidity),
          dewPoint: rawData.dewPoint || this.calculateDewPoint(rawData.temperature, rawData.humidity),
          absoluteHumidity: rawData.absoluteHumidity || 0,
          heatingActive: rawData.heatingValve > 0,
          coolingActive: rawData.coolingValve > 0,
          humidificationActive: rawData.humidificationValve > 0,
          dehumidificationActive: rawData.windows > 20,
          co2DosingActive: rawData.co2Valve > 0,
          lightsActive: rawData.lightsOn || false,
          screensPosition: rawData.screenPosition
        };
        
      case 'hoogendoorn':
        return {
          ...base,
          temperature: rawData.temp,
          humidity: rawData.rh,
          co2: rawData.co2ppm,
          light: rawData.radiation || 0,
          vpd: this.calculateVPD(rawData.temp, rawData.rh),
          dewPoint: this.calculateDewPoint(rawData.temp, rawData.rh),
          absoluteHumidity: 0,
          heatingActive: rawData.heating === 1,
          coolingActive: rawData.cooling === 1,
          humidificationActive: rawData.fogging === 1,
          dehumidificationActive: rawData.vents > 20,
          co2DosingActive: rawData.co2Active === 1,
          lightsActive: rawData.lights === 1
        };
        
      case 'ridder':
        return {
          ...base,
          temperature: rawData.measurements.temperature,
          humidity: rawData.measurements.relativeHumidity,
          co2: rawData.measurements.co2Level,
          light: rawData.measurements.parLevel || 0,
          vpd: rawData.calculations.vpd,
          dewPoint: rawData.calculations.dewPoint,
          absoluteHumidity: rawData.calculations.absoluteHumidity,
          heatingActive: rawData.status.heating,
          coolingActive: rawData.status.cooling,
          humidificationActive: rawData.status.humidification,
          dehumidificationActive: rawData.status.dehumidification,
          co2DosingActive: rawData.status.co2Injection,
          lightsActive: rawData.status.lighting,
          screensPosition: rawData.status.screenPosition
        };
        
      default:
        throw new Error(`Unsupported brand: ${brand}`);
    }
  }

  private calculateVPD(temperature: number, humidity: number): number {
    // Convert temperature to Celsius if needed
    const tempC = (temperature - 32) * 5/9;
    
    // Calculate saturation vapor pressure
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    
    // Calculate actual vapor pressure
    const avp = (humidity / 100) * svp;
    
    // Calculate VPD
    return svp - avp;
  }

  private calculateDewPoint(temperature: number, humidity: number): number {
    const tempC = (temperature - 32) * 5/9;
    const a = 17.27;
    const b = 237.7;
    
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
    const dewPointC = (b * alpha) / (a - alpha);
    
    return (dewPointC * 9/5) + 32;
  }

  private mapHoogendoornData(values: any[]): any {
    // Map memory addresses to data fields
    return {
      temp: values[0]?.value || 0,
      rh: values[1]?.value || 0,
      co2ppm: values[2]?.value || 0,
      radiation: values[3]?.value || 0,
      heating: 0,
      cooling: 0,
      fogging: 0,
      vents: 0,
      co2Active: 0,
      lights: 0
    };
  }

  private async logSetpointChange(
    computerId: string,
    compartmentId: string,
    parameter: string,
    value: any
  ): Promise<void> {
    await prisma.climateLog.create({
      data: {
        computerId,
        compartmentId,
        action: 'setpoint_change',
        parameter,
        value: JSON.stringify(value),
        userId: this.userId,
        timestamp: new Date()
      }
    });
  }

  private async getAdvice(adviceId: string): Promise<ControlAdvice | null> {
    return await prisma.controlAdvice.findUnique({
      where: { id: adviceId }
    });
  }

  private async getHistoricalMeasurements(
    computerId: string,
    compartmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClimateMeasurement[]> {
    return await prisma.climateMeasurement.findMany({
      where: {
        computerId,
        compartmentId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });
  }

  private async getHistoricalSetpoints(
    computerId: string,
    compartmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClimateSetpoint[]> {
    return await prisma.climateSetpoint.findMany({
      where: {
        computerId,
        compartmentId,
        activeFrom: { lte: endDate },
        OR: [
          { activeTo: null },
          { activeTo: { gte: startDate } }
        ]
      },
      orderBy: { activeFrom: 'asc' }
    });
  }

  private async getClimateEvents(
    computerId: string,
    compartmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return await prisma.climateLog.findMany({
      where: {
        computerId,
        compartmentId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });
  }

  // Database operations
  private async loadClimateComputers(): Promise<void> {
    const computers = await prisma.climateComputer.findMany({
      where: { facilityId: this.facilityId }
    });

    for (const computer of computers) {
      this.computers.set(computer.id, computer);
    }
  }

  private async establishConnections(): Promise<void> {
    for (const [computerId, computer] of this.computers) {
      try {
        await this.connectToComputer(computerId);
      } catch (error) {
        logger.error('api', `Failed to connect to ${computer.brand}:`, error);
      }
    }
  }

  private startSynchronization(): void {
    // Start sync for all connected computers
    for (const computerId of this.computers.keys()) {
      this.startComputerSync(computerId);
    }
  }

  private async saveComputer(computer: ClimateComputer): Promise<void> {
    await prisma.climateComputer.upsert({
      where: { id: computer.id },
      create: { ...computer, facilityId: this.facilityId },
      update: computer
    });
  }

  private async saveSetpoint(setpoint: ClimateSetpoint): Promise<void> {
    await prisma.climateSetpoint.upsert({
      where: { id: setpoint.id },
      create: setpoint,
      update: setpoint
    });
  }

  private async saveMeasurement(measurement: ClimateMeasurement): Promise<void> {
    await prisma.climateMeasurement.create({
      data: measurement
    });
  }

  private async saveAdvice(advice: ControlAdvice): Promise<void> {
    await prisma.controlAdvice.upsert({
      where: { id: advice.id },
      create: advice,
      update: advice
    });
  }

  // Cleanup
  public destroy(): void {
    // Stop all sync intervals
    for (const interval of this.syncIntervals.values()) {
      clearInterval(interval);
    }
    this.syncIntervals.clear();
    
    // Close connections
    this.connections.clear();
    
    this.removeAllListeners();
  }

  // ID generators
  private generateComputerId(): string {
    return `computer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMeasurementId(): string {
    return `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAdviceId(): string {
    return `advice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { ClimateComputerIntegration };
export default ClimateComputerIntegration;