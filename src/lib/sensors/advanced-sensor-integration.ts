/**
 * Advanced Sensor Integration System
 * Comprehensive support for root zone, canopy, CO2, and light sensors
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';
// Dynamic import for optional serialport
let SerialPort: any;
try {
  SerialPort = require('serialport');
} catch (e) {
  // serialport is optional, provide mock if not available
  SerialPort = {
    SerialPort: class MockSerialPort {
      constructor() {}
      open() { return Promise.reject(new Error('SerialPort not available in browser environment')); }
      close() { return Promise.reject(new Error('SerialPort not available in browser environment')); }
      write() { return Promise.reject(new Error('SerialPort not available in browser environment')); }
      on() {}
      off() {}
    },
    list: () => Promise.resolve([])
  };
}
// Dynamic import for optional modbus-serial
let modbus: any;
try {
  // eslint-disable-next-line no-eval
  modbus = eval("require('modbus-serial')");
} catch (e) {
  // modbus-serial is optional, provide mock if not available
  modbus = {
    default: class MockModbusRTU {
      connectTCP() { return Promise.reject(new Error('Modbus not available in browser environment')); }
      connectRTU() { return Promise.reject(new Error('Modbus not available in browser environment')); }
      readHoldingRegisters() { return Promise.reject(new Error('Modbus not available')); }
      readInputRegisters() { return Promise.reject(new Error('Modbus not available')); }
      writeRegister() { return Promise.reject(new Error('Modbus not available')); }
      setID() {}
      setTimeout() {}
      isOpen = false;
    }
  };
}
import mqtt from 'mqtt';
import { logger } from '../logging/production-logger';

export type SensorType = 'root_zone' | 'canopy_temp' | 'co2' | 'light_par' | 'vpd' | 'leaf_wetness';
export type SensorProtocol = 'analog' | 'digital' | 'i2c' | 'spi' | 'uart' | 'modbus' | 'mqtt' | 'http';
export type SensorStatus = 'active' | 'inactive' | 'error' | 'calibrating' | 'maintenance';
export type CalibrationStatus = 'calibrated' | 'needs_calibration' | 'calibrating' | 'failed';

export interface SensorDevice {
  id: string;
  type: SensorType;
  model: string;
  manufacturer: string;
  serialNumber: string;
  
  // Connection Details
  protocol: SensorProtocol;
  connectionDetails: {
    port?: string;
    address?: string;
    baudRate?: number;
    ipAddress?: string;
    mqttTopic?: string;
    pollingInterval?: number;
  };
  
  // Specifications
  specifications: {
    measurementRange: { min: number; max: number; unit: string };
    accuracy: number; // percentage or absolute
    resolution: number;
    responseTime: number; // seconds
    operatingTemp: { min: number; max: number };
  };
  
  // Calibration
  calibration: {
    status: CalibrationStatus;
    lastCalibrated: Date;
    nextCalibration: Date;
    calibrationPoints: Array<{
      reference: number;
      measured: number;
      timestamp: Date;
    }>;
    offset: number;
    slope: number;
  };
  
  // Location
  location: {
    facilityId: string;
    roomId: string;
    zoneId?: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
    installDate: Date;
  };
  
  // Status
  status: SensorStatus;
  lastReading: Date;
  errorCount: number;
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    notes: string;
    performedBy: string;
  }>;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface RootZoneSensor extends SensorDevice {
  type: 'root_zone';
  capabilities: {
    ec: boolean;
    ph: boolean;
    moisture: boolean;
    temperature: boolean;
  };
  substrateType: 'rockwool' | 'coco' | 'peat' | 'soil' | 'perlite' | 'hydroponic';
}

export interface CanopyTempSensor extends SensorDevice {
  type: 'canopy_temp';
  measurementMode: 'infrared' | 'contact' | 'thermal_imaging';
  fieldOfView?: number; // degrees for IR sensors
  emissivity: number; // for IR sensors
}

export interface CO2Sensor extends SensorDevice {
  type: 'co2';
  technology: 'ndir' | 'chemical' | 'photoacoustic';
  autoCalibration: boolean;
  warmupTime: number; // seconds
}

export interface LightPARSensor extends SensorDevice {
  type: 'light_par';
  spectralRange: {
    min: number; // nm
    max: number; // nm
  };
  measurementTypes: Array<'ppfd' | 'dli' | 'spectrum' | 'uv' | 'far_red'>;
  cosineCorrection: boolean;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  
  // Values based on sensor type
  values: {
    // Root Zone
    ec?: number; // mS/cm
    ph?: number;
    moisture?: number; // %
    rootTemp?: number; // °C
    
    // Canopy
    canopyTemp?: number; // °C
    leafTemp?: number; // °C
    
    // CO2
    co2?: number; // ppm
    
    // Light
    ppfd?: number; // μmol/m²/s
    dli?: number; // mol/m²/day
    spectrum?: Record<string, number>; // wavelength: intensity
    
    // Calculated
    vpd?: number; // kPa
    leafVpd?: number; // kPa
  };
  
  // Quality
  quality: {
    signalStrength?: number;
    batteryLevel?: number;
    errorFlags?: string[];
  };
  
  // Context
  environmentalContext?: {
    airTemp: number;
    humidity: number;
    lightStatus: 'on' | 'off';
  };
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  type: 'out_of_range' | 'sensor_error' | 'calibration_needed' | 'maintenance_due' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Alert Details
  title: string;
  description: string;
  threshold?: {
    parameter: string;
    condition: 'above' | 'below' | 'outside_range';
    value: number;
    actualValue: number;
  };
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Actions
  recommendedActions: string[];
  automatedActions?: Array<{
    action: string;
    executed: boolean;
    result?: string;
  }>;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorCalibration {
  id: string;
  sensorId: string;
  calibrationType: 'zero' | 'span' | 'multipoint' | 'factory';
  
  // Calibration Data
  referenceStandards: Array<{
    value: number;
    unit: string;
    certificateNumber?: string;
  }>;
  
  measurements: Array<{
    reference: number;
    measured: number;
    adjusted: number;
    timestamp: Date;
  }>;
  
  // Results
  previousCalibration: {
    offset: number;
    slope: number;
  };
  newCalibration: {
    offset: number;
    slope: number;
  };
  
  // Validation
  validationTest: {
    passed: boolean;
    accuracy: number;
    r2?: number;
  };
  
  // Metadata
  performedBy: string;
  temperature: number;
  notes?: string;
  
  // Tracking
  createdAt: Date;
}

export interface SensorGroup {
  id: string;
  name: string;
  description: string;
  
  // Sensors
  sensorIds: string[];
  
  // Configuration
  aggregationMethod: 'average' | 'median' | 'min' | 'max' | 'weighted';
  weights?: Record<string, number>; // sensorId: weight
  
  // Alerts
  groupAlerts: {
    enabled: boolean;
    thresholds: Record<string, { min?: number; max?: number }>;
  };
  
  // Tracking
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class AdvancedSensorIntegration extends EventEmitter {
  private facilityId: string;
  private userId: string;
  private sensors: Map<string, SensorDevice> = new Map();
  private connections: Map<string, any> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private calibrationQueue: string[] = [];

  constructor(facilityId: string, userId: string) {
    super();
    this.facilityId = facilityId;
    this.userId = userId;
    this.initializeSystem();
  }

  /**
   * Initialize sensor system
   */
  private async initializeSystem(): Promise<void> {
    try {
      await this.loadSensors();
      await this.establishConnections();
      this.startMonitoring();
      this.startCalibrationScheduler();
      
      logger.info('api', 'Advanced sensor integration initialized');
    } catch (error) {
      logger.error('api', 'Failed to initialize sensor system:', error );
    }
  }

  /**
   * Add root zone sensor
   */
  async addRootZoneSensor(
    sensorData: Omit<RootZoneSensor, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RootZoneSensor> {
    try {
      const sensor: RootZoneSensor = {
        id: this.generateSensorId('rz'),
        ...sensorData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSensor(sensor);
      this.sensors.set(sensor.id, sensor);
      
      // Establish connection
      await this.connectSensor(sensor);
      
      this.emit('sensor-added', sensor);
      logger.info('api', `Added root zone sensor: ${sensor.model}`);
      
      return sensor;
    } catch (error) {
      logger.error('api', 'Failed to add root zone sensor:', error );
      throw error;
    }
  }

  /**
   * Add canopy temperature sensor
   */
  async addCanopyTempSensor(
    sensorData: Omit<CanopyTempSensor, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CanopyTempSensor> {
    try {
      const sensor: CanopyTempSensor = {
        id: this.generateSensorId('ct'),
        ...sensorData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSensor(sensor);
      this.sensors.set(sensor.id, sensor);
      
      await this.connectSensor(sensor);
      
      this.emit('sensor-added', sensor);
      logger.info('api', `Added canopy temperature sensor: ${sensor.model}`);
      
      return sensor;
    } catch (error) {
      logger.error('api', 'Failed to add canopy temp sensor:', error );
      throw error;
    }
  }

  /**
   * Add CO2 sensor
   */
  async addCO2Sensor(
    sensorData: Omit<CO2Sensor, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CO2Sensor> {
    try {
      const sensor: CO2Sensor = {
        id: this.generateSensorId('co2'),
        ...sensorData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSensor(sensor);
      this.sensors.set(sensor.id, sensor);
      
      // Handle warmup time for CO2 sensors
      if (sensor.warmupTime > 0) {
        logger.info('api', `CO2 sensor warming up for ${sensor.warmupTime} seconds...`);
        setTimeout(() => {
          this.connectSensor(sensor);
        }, sensor.warmupTime * 1000);
      } else {
        await this.connectSensor(sensor);
      }
      
      this.emit('sensor-added', sensor);
      logger.info('api', `Added CO2 sensor: ${sensor.model}`);
      
      return sensor;
    } catch (error) {
      logger.error('api', 'Failed to add CO2 sensor:', error );
      throw error;
    }
  }

  /**
   * Add light/PAR sensor
   */
  async addLightPARSensor(
    sensorData: Omit<LightPARSensor, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LightPARSensor> {
    try {
      const sensor: LightPARSensor = {
        id: this.generateSensorId('par'),
        ...sensorData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSensor(sensor);
      this.sensors.set(sensor.id, sensor);
      
      await this.connectSensor(sensor);
      
      this.emit('sensor-added', sensor);
      logger.info('api', `Added light/PAR sensor: ${sensor.model}`);
      
      return sensor;
    } catch (error) {
      logger.error('api', 'Failed to add light/PAR sensor:', error );
      throw error;
    }
  }

  /**
   * Get sensor reading
   */
  async getSensorReading(sensorId: string): Promise<SensorReading> {
    try {
      const sensor = this.sensors.get(sensorId);
      if (!sensor) throw new Error('Sensor not found');

      const connection = this.connections.get(sensorId);
      if (!connection) throw new Error('Sensor not connected');

      let values: SensorReading['values'] = {};

      // Read based on sensor type
      switch (sensor.type) {
        case 'root_zone':
          values = await this.readRootZoneSensor(sensor as RootZoneSensor, connection);
          break;
        case 'canopy_temp':
          values = await this.readCanopyTempSensor(sensor as CanopyTempSensor, connection);
          break;
        case 'co2':
          values = await this.readCO2Sensor(sensor as CO2Sensor, connection);
          break;
        case 'light_par':
          values = await this.readLightPARSensor(sensor as LightPARSensor, connection);
          break;
      }

      // Apply calibration
      values = this.applyCalibration(sensor, values);

      // Calculate derived values
      if (values.canopyTemp && values.leafTemp) {
        const airTemp = await this.getAmbientTemperature(sensor.location.roomId);
        const humidity = await this.getAmbientHumidity(sensor.location.roomId);
        values.vpd = this.calculateVPD(airTemp, humidity);
        values.leafVpd = this.calculateLeafVPD(values.leafTemp, airTemp, humidity);
      }

      const reading: SensorReading = {
        id: this.generateReadingId(),
        sensorId,
        timestamp: new Date(),
        values,
        quality: {
          signalStrength: 95,
          batteryLevel: sensor.protocol === 'mqtt' ? 85 : undefined
        }
      };

      await this.saveReading(reading);

      // Check thresholds
      await this.checkThresholds(sensor, reading);

      // Update sensor status
      sensor.lastReading = new Date();
      sensor.status = 'active';
      await this.saveSensor(sensor);

      this.emit('sensor-reading', reading);
      
      return reading;
    } catch (error) {
      logger.error('api', `Failed to get sensor reading for ${sensorId}:`, error);
      
      // Update error count
      const sensor = this.sensors.get(sensorId);
      if (sensor) {
        sensor.errorCount++;
        if (sensor.errorCount > 5) {
          sensor.status = 'error';
          await this.createSensorAlert(sensor, 'sensor_error', 'high', 
            'Sensor communication failure',
            `Sensor ${sensor.model} has failed to respond multiple times`);
        }
        await this.saveSensor(sensor);
      }
      
      throw error;
    }
  }

  /**
   * Calibrate sensor
   */
  async calibrateSensor(
    sensorId: string,
    calibrationData: Omit<SensorCalibration, 'id' | 'sensorId' | 'createdAt'>
  ): Promise<SensorCalibration> {
    try {
      const sensor = this.sensors.get(sensorId);
      if (!sensor) throw new Error('Sensor not found');

      sensor.status = 'calibrating';
      await this.saveSensor(sensor);

      const calibration: SensorCalibration = {
        id: this.generateCalibrationId(),
        sensorId,
        ...calibrationData,
        createdAt: new Date()
      };

      // Perform calibration calculations
      const { offset, slope } = this.calculateCalibrationCoefficients(
        calibration.measurements
      );

      calibration.newCalibration = { offset, slope };

      // Validate calibration
      const validation = this.validateCalibration(calibration.measurements, offset, slope);
      calibration.validationTest = validation;

      if (validation.passed) {
        // Update sensor calibration
        sensor.calibration.offset = offset;
        sensor.calibration.slope = slope;
        sensor.calibration.status = 'calibrated';
        sensor.calibration.lastCalibrated = new Date();
        sensor.calibration.nextCalibration = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        );
        sensor.calibration.calibrationPoints = calibration.measurements.map(m => ({
          reference: m.reference,
          measured: m.measured,
          timestamp: m.timestamp
        }));
      } else {
        sensor.calibration.status = 'failed';
        await this.createSensorAlert(sensor, 'calibration_needed', 'high',
          'Calibration failed',
          `Calibration validation failed with accuracy ${validation.accuracy.toFixed(1)}%`);
      }

      sensor.status = 'active';
      await this.saveSensor(sensor);
      await this.saveCalibration(calibration);

      this.emit('sensor-calibrated', { sensor, calibration });
      logger.info('api', `Calibrated sensor ${sensor.model}`);
      
      return calibration;
    } catch (error) {
      logger.error('api', `Failed to calibrate sensor ${sensorId}:`, error);
      
      const sensor = this.sensors.get(sensorId);
      if (sensor) {
        sensor.status = 'error';
        sensor.calibration.status = 'failed';
        await this.saveSensor(sensor);
      }
      
      throw error;
    }
  }

  /**
   * Create sensor group
   */
  async createSensorGroup(
    groupData: Omit<SensorGroup, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SensorGroup> {
    try {
      const group: SensorGroup = {
        id: this.generateGroupId(),
        ...groupData,
        createdBy: this.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate sensors exist
      for (const sensorId of group.sensorIds) {
        if (!this.sensors.has(sensorId)) {
          throw new Error(`Sensor ${sensorId} not found`);
        }
      }

      await this.saveSensorGroup(group);

      this.emit('sensor-group-created', group);
      logger.info('api', `Created sensor group: ${group.name}`);
      
      return group;
    } catch (error) {
      logger.error('api', 'Failed to create sensor group:', error );
      throw error;
    }
  }

  /**
   * Get aggregated readings from sensor group
   */
  async getGroupReading(groupId: string): Promise<{
    groupId: string;
    timestamp: Date;
    aggregatedValues: SensorReading['values'];
    individualReadings: SensorReading[];
  }> {
    try {
      const group = await this.getSensorGroup(groupId);
      if (!group) throw new Error('Sensor group not found');

      const readings: SensorReading[] = [];
      
      // Get readings from all sensors in group
      for (const sensorId of group.sensorIds) {
        try {
          const reading = await this.getSensorReading(sensorId);
          readings.push(reading);
        } catch (error) {
          logger.error('api', `Failed to read sensor ${sensorId} in group:`, error);
        }
      }

      if (readings.length === 0) {
        throw new Error('No valid readings from sensor group');
      }

      // Aggregate values
      const aggregatedValues = this.aggregateReadings(readings, group);

      return {
        groupId,
        timestamp: new Date(),
        aggregatedValues,
        individualReadings: readings
      };
    } catch (error) {
      logger.error('api', `Failed to get group reading for ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get sensor analytics
   */
  async getSensorAnalytics(
    sensorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    sensor: SensorDevice;
    statistics: {
      mean: Record<string, number>;
      median: Record<string, number>;
      min: Record<string, number>;
      max: Record<string, number>;
      stdDev: Record<string, number>;
    };
    trends: Array<{
      parameter: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      changePercent: number;
    }>;
    anomalies: Array<{
      timestamp: Date;
      parameter: string;
      value: number;
      expectedRange: { min: number; max: number };
    }>;
    uptime: number;
    errorRate: number;
  }> {
    try {
      const sensor = this.sensors.get(sensorId);
      if (!sensor) throw new Error('Sensor not found');

      const readings = await this.getReadingsInRange(sensorId, startDate, endDate);
      
      if (readings.length === 0) {
        throw new Error('No readings found in date range');
      }

      // Calculate statistics
      const statistics = this.calculateStatistics(readings);
      
      // Analyze trends
      const trends = this.analyzeTrends(readings);
      
      // Detect anomalies
      const anomalies = this.detectAnomalies(readings, statistics);
      
      // Calculate uptime
      const totalTime = endDate.getTime() - startDate.getTime();
      const downtime = await this.calculateDowntime(sensorId, startDate, endDate);
      const uptime = ((totalTime - downtime) / totalTime) * 100;
      
      // Calculate error rate
      const totalReadings = await this.getTotalReadingCount(sensorId, startDate, endDate);
      const errorRate = (sensor.errorCount / totalReadings) * 100;

      return {
        sensor,
        statistics,
        trends,
        anomalies,
        uptime,
        errorRate
      };
    } catch (error) {
      logger.error('api', `Failed to get sensor analytics for ${sensorId}:`, error);
      throw error;
    }
  }

  // Private helper methods

  private async loadSensors(): Promise<void> {
    const sensors = await prisma.sensor.findMany({
      where: { facilityId: this.facilityId }
    });

    for (const sensor of sensors) {
      this.sensors.set(sensor.id, sensor as SensorDevice);
    }
  }

  private async establishConnections(): Promise<void> {
    for (const [sensorId, sensor] of this.sensors) {
      try {
        await this.connectSensor(sensor);
      } catch (error) {
        logger.error('api', `Failed to connect sensor ${sensorId}:`, error);
      }
    }
  }

  private async connectSensor(sensor: SensorDevice): Promise<void> {
    switch (sensor.protocol) {
      case 'uart':
        await this.connectSerialSensor(sensor);
        break;
      case 'modbus':
        await this.connectModbusSensor(sensor);
        break;
      case 'mqtt':
        await this.connectMQTTSensor(sensor);
        break;
      case 'http':
        // HTTP sensors are polled on demand
        break;
      default:
        logger.info('api', `Unsupported protocol: ${sensor.protocol}`);
    }
  }

  private async connectSerialSensor(sensor: SensorDevice): Promise<void> {
    const port = new SerialPort(sensor.connectionDetails.port!, {
      baudRate: sensor.connectionDetails.baudRate || 9600
    });

    port.on('error', (err) => {
      logger.error('api', `Serial port error for ${sensor.id}:`, err);
      sensor.status = 'error';
    });

    this.connections.set(sensor.id, port);
  }

  private async connectModbusSensor(sensor: SensorDevice): Promise<void> {
    const client = new modbus();
    await client.connectTCP(sensor.connectionDetails.ipAddress!, {
      port: sensor.connectionDetails.port || 502
    });
    client.setID(sensor.connectionDetails.address || 1);
    
    this.connections.set(sensor.id, client);
  }

  private async connectMQTTSensor(sensor: SensorDevice): Promise<void> {
    const client = mqtt.connect(`mqtt://${sensor.connectionDetails.ipAddress}`);
    
    client.on('connect', () => {
      client.subscribe(sensor.connectionDetails.mqttTopic!);
    });

    client.on('message', async (topic, message) => {
      if (topic === sensor.connectionDetails.mqttTopic) {
        await this.processMQTTReading(sensor.id, message);
      }
    });

    this.connections.set(sensor.id, client);
  }

  private startMonitoring(): void {
    for (const [sensorId, sensor] of this.sensors) {
      const interval = sensor.connectionDetails.pollingInterval || 60000; // Default 1 minute
      
      const pollInterval = setInterval(async () => {
        try {
          await this.getSensorReading(sensorId);
        } catch (error) {
          logger.error('api', `Failed to poll sensor ${sensorId}:`, error);
        }
      }, interval);

      this.pollingIntervals.set(sensorId, pollInterval);
    }
  }

  private startCalibrationScheduler(): void {
    // Check calibration status daily
    setInterval(async () => {
      for (const [sensorId, sensor] of this.sensors) {
        if (sensor.calibration.nextCalibration < new Date()) {
          await this.createSensorAlert(sensor, 'calibration_needed', 'medium',
            'Calibration due',
            `Sensor ${sensor.model} is due for calibration`);
          
          this.calibrationQueue.push(sensorId);
        }
      }
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private async readRootZoneSensor(
    sensor: RootZoneSensor,
    connection: any
  ): Promise<SensorReading['values']> {
    const values: SensorReading['values'] = {};

    if (sensor.capabilities.ec) {
      values.ec = await this.readSensorValue(connection, 'ec', sensor.protocol);
    }
    if (sensor.capabilities.ph) {
      values.ph = await this.readSensorValue(connection, 'ph', sensor.protocol);
    }
    if (sensor.capabilities.moisture) {
      values.moisture = await this.readSensorValue(connection, 'moisture', sensor.protocol);
    }
    if (sensor.capabilities.temperature) {
      values.rootTemp = await this.readSensorValue(connection, 'temperature', sensor.protocol);
    }

    return values;
  }

  private async readCanopyTempSensor(
    sensor: CanopyTempSensor,
    connection: any
  ): Promise<SensorReading['values']> {
    const canopyTemp = await this.readSensorValue(connection, 'temperature', sensor.protocol);
    
    // For IR sensors, also calculate leaf temperature
    let leafTemp = canopyTemp;
    if (sensor.measurementMode === 'infrared') {
      // Apply emissivity correction
      leafTemp = canopyTemp * sensor.emissivity;
    }

    return { canopyTemp, leafTemp };
  }

  private async readCO2Sensor(
    sensor: CO2Sensor,
    connection: any
  ): Promise<SensorReading['values']> {
    const co2 = await this.readSensorValue(connection, 'co2', sensor.protocol);
    return { co2 };
  }

  private async readLightPARSensor(
    sensor: LightPARSensor,
    connection: any
  ): Promise<SensorReading['values']> {
    const values: SensorReading['values'] = {};

    if (sensor.measurementTypes.includes('ppfd')) {
      values.ppfd = await this.readSensorValue(connection, 'ppfd', sensor.protocol);
    }
    if (sensor.measurementTypes.includes('dli')) {
      values.dli = await this.readSensorValue(connection, 'dli', sensor.protocol);
    }
    if (sensor.measurementTypes.includes('spectrum')) {
      values.spectrum = await this.readSpectrum(connection, sensor.protocol);
    }

    return values;
  }

  private async readSensorValue(
    connection: any,
    parameter: string,
    protocol: SensorProtocol
  ): Promise<number> {
    // Simulated reading - in production, this would use actual protocol
    switch (protocol) {
      case 'modbus':
        // Read Modbus register based on parameter
        return Math.random() * 100;
      case 'uart':
        // Read serial data
        return Math.random() * 100;
      case 'mqtt':
        // Return last MQTT value
        return Math.random() * 100;
      default:
        return Math.random() * 100;
    }
  }

  private async readSpectrum(
    connection: any,
    protocol: SensorProtocol
  ): Promise<Record<string, number>> {
    // Simulated spectrum reading
    return {
      '400': Math.random() * 10,
      '450': Math.random() * 50,
      '500': Math.random() * 30,
      '550': Math.random() * 20,
      '600': Math.random() * 40,
      '650': Math.random() * 60,
      '700': Math.random() * 50,
      '750': Math.random() * 10
    };
  }

  private applyCalibration(
    sensor: SensorDevice,
    values: SensorReading['values']
  ): SensorReading['values'] {
    const calibrated = { ...values };
    const { offset, slope } = sensor.calibration;

    // Apply linear calibration: corrected = (raw * slope) + offset
    for (const [key, value] of Object.entries(calibrated)) {
      if (typeof value === 'number') {
        calibrated[key as keyof typeof calibrated] = (value * slope) + offset;
      }
    }

    return calibrated;
  }

  private calculateVPD(temperature: number, humidity: number): number {
    // Tetens equation for saturation vapor pressure
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const avp = (humidity / 100) * svp;
    return svp - avp;
  }

  private calculateLeafVPD(
    leafTemp: number,
    airTemp: number,
    humidity: number
  ): number {
    // Leaf VPD calculation
    const leafSVP = 0.6108 * Math.exp((17.27 * leafTemp) / (leafTemp + 237.3));
    const airSVP = 0.6108 * Math.exp((17.27 * airTemp) / (airTemp + 237.3));
    const avp = (humidity / 100) * airSVP;
    return leafSVP - avp;
  }

  private calculateCalibrationCoefficients(
    measurements: SensorCalibration['measurements']
  ): { offset: number; slope: number } {
    // Linear regression
    const n = measurements.length;
    const sumX = measurements.reduce((sum, m) => sum + m.measured, 0);
    const sumY = measurements.reduce((sum, m) => sum + m.reference, 0);
    const sumXY = measurements.reduce((sum, m) => sum + m.measured * m.reference, 0);
    const sumX2 = measurements.reduce((sum, m) => sum + m.measured * m.measured, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const offset = (sumY - slope * sumX) / n;

    return { offset, slope };
  }

  private validateCalibration(
    measurements: SensorCalibration['measurements'],
    offset: number,
    slope: number
  ): SensorCalibration['validationTest'] {
    let sumError = 0;
    let sumSquaredError = 0;

    for (const m of measurements) {
      const predicted = (m.measured * slope) + offset;
      const error = Math.abs(predicted - m.reference);
      const percentError = (error / m.reference) * 100;
      sumError += percentError;
      sumSquaredError += error * error;
    }

    const avgAccuracy = 100 - (sumError / measurements.length);
    const r2 = this.calculateR2(measurements, offset, slope);

    return {
      passed: avgAccuracy >= 95,
      accuracy: avgAccuracy,
      r2
    };
  }

  private calculateR2(
    measurements: SensorCalibration['measurements'],
    offset: number,
    slope: number
  ): number {
    const mean = measurements.reduce((sum, m) => sum + m.reference, 0) / measurements.length;
    let ssTotal = 0;
    let ssResidual = 0;

    for (const m of measurements) {
      const predicted = (m.measured * slope) + offset;
      ssTotal += Math.pow(m.reference - mean, 2);
      ssResidual += Math.pow(m.reference - predicted, 2);
    }

    return 1 - (ssResidual / ssTotal);
  }

  private async checkThresholds(
    sensor: SensorDevice,
    reading: SensorReading
  ): Promise<void> {
    // Check each value against thresholds
    for (const [parameter, value] of Object.entries(reading.values)) {
      if (typeof value === 'number') {
        const thresholds = await this.getThresholds(sensor.id, parameter);
        
        if (thresholds.min !== undefined && value < thresholds.min) {
          await this.createSensorAlert(sensor, 'out_of_range', 'high',
            `${parameter} below minimum`,
            `${parameter} reading of ${value} is below minimum threshold of ${thresholds.min}`,
            { parameter, condition: 'below', value: thresholds.min, actualValue: value });
        }
        
        if (thresholds.max !== undefined && value > thresholds.max) {
          await this.createSensorAlert(sensor, 'out_of_range', 'high',
            `${parameter} above maximum`,
            `${parameter} reading of ${value} is above maximum threshold of ${thresholds.max}`,
            { parameter, condition: 'above', value: thresholds.max, actualValue: value });
        }
      }
    }
  }

  private aggregateReadings(
    readings: SensorReading[],
    group: SensorGroup
  ): SensorReading['values'] {
    const aggregated: SensorReading['values'] = {};
    const valueArrays: Record<string, number[]> = {};

    // Collect all values by parameter
    for (const reading of readings) {
      for (const [param, value] of Object.entries(reading.values)) {
        if (typeof value === 'number') {
          if (!valueArrays[param]) valueArrays[param] = [];
          
          // Apply weight if specified
          const weight = group.weights?.[reading.sensorId] || 1;
          valueArrays[param].push(value * weight);
        }
      }
    }

    // Aggregate based on method
    for (const [param, values] of Object.entries(valueArrays)) {
      switch (group.aggregationMethod) {
        case 'average':
          aggregated[param as keyof typeof aggregated] = 
            values.reduce((sum, v) => sum + v, 0) / values.length;
          break;
        case 'median':
          values.sort((a, b) => a - b);
          const mid = Math.floor(values.length / 2);
          aggregated[param as keyof typeof aggregated] = 
            values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
          break;
        case 'min':
          aggregated[param as keyof typeof aggregated] = Math.min(...values);
          break;
        case 'max':
          aggregated[param as keyof typeof aggregated] = Math.max(...values);
          break;
        case 'weighted':
          const totalWeight = Object.values(group.weights || {}).reduce((sum, w) => sum + w, 0);
          aggregated[param as keyof typeof aggregated] = 
            values.reduce((sum, v) => sum + v, 0) / totalWeight;
          break;
      }
    }

    return aggregated;
  }

  private calculateStatistics(
    readings: SensorReading[]
  ): {
    mean: Record<string, number>;
    median: Record<string, number>;
    min: Record<string, number>;
    max: Record<string, number>;
    stdDev: Record<string, number>;
  } {
    const stats = {
      mean: {} as Record<string, number>,
      median: {} as Record<string, number>,
      min: {} as Record<string, number>,
      max: {} as Record<string, number>,
      stdDev: {} as Record<string, number>
    };

    // Organize values by parameter
    const valuesByParam: Record<string, number[]> = {};
    
    for (const reading of readings) {
      for (const [param, value] of Object.entries(reading.values)) {
        if (typeof value === 'number') {
          if (!valuesByParam[param]) valuesByParam[param] = [];
          valuesByParam[param].push(value);
        }
      }
    }

    // Calculate statistics for each parameter
    for (const [param, values] of Object.entries(valuesByParam)) {
      values.sort((a, b) => a - b);
      
      stats.mean[param] = values.reduce((sum, v) => sum + v, 0) / values.length;
      stats.min[param] = values[0];
      stats.max[param] = values[values.length - 1];
      
      const mid = Math.floor(values.length / 2);
      stats.median[param] = values.length % 2 ? 
        values[mid] : (values[mid - 1] + values[mid]) / 2;
      
      // Standard deviation
      const variance = values.reduce((sum, v) => 
        sum + Math.pow(v - stats.mean[param], 2), 0) / values.length;
      stats.stdDev[param] = Math.sqrt(variance);
    }

    return stats;
  }

  private analyzeTrends(
    readings: SensorReading[]
  ): Array<{
    parameter: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
  }> {
    const trends = [];
    
    // Sort readings by timestamp
    readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Get first and last quarter of readings
    const quarterSize = Math.floor(readings.length / 4);
    const firstQuarter = readings.slice(0, quarterSize);
    const lastQuarter = readings.slice(-quarterSize);
    
    // Calculate average for each parameter in both quarters
    const firstAvg: Record<string, number> = {};
    const lastAvg: Record<string, number> = {};
    
    for (const reading of firstQuarter) {
      for (const [param, value] of Object.entries(reading.values)) {
        if (typeof value === 'number') {
          firstAvg[param] = (firstAvg[param] || 0) + value / quarterSize;
        }
      }
    }
    
    for (const reading of lastQuarter) {
      for (const [param, value] of Object.entries(reading.values)) {
        if (typeof value === 'number') {
          lastAvg[param] = (lastAvg[param] || 0) + value / quarterSize;
        }
      }
    }
    
    // Determine trends
    for (const param of Object.keys(firstAvg)) {
      if (lastAvg[param] !== undefined) {
        const changePercent = ((lastAvg[param] - firstAvg[param]) / firstAvg[param]) * 100;
        
        let trend: 'increasing' | 'decreasing' | 'stable';
        if (Math.abs(changePercent) < 5) {
          trend = 'stable';
        } else if (changePercent > 0) {
          trend = 'increasing';
        } else {
          trend = 'decreasing';
        }
        
        trends.push({ parameter: param, trend, changePercent });
      }
    }
    
    return trends;
  }

  private detectAnomalies(
    readings: SensorReading[],
    statistics: ReturnType<typeof this.calculateStatistics>
  ): Array<{
    timestamp: Date;
    parameter: string;
    value: number;
    expectedRange: { min: number; max: number };
  }> {
    const anomalies = [];
    
    for (const reading of readings) {
      for (const [param, value] of Object.entries(reading.values)) {
        if (typeof value === 'number' && statistics.mean[param] !== undefined) {
          // Define expected range as mean ± 3 standard deviations
          const expectedMin = statistics.mean[param] - 3 * statistics.stdDev[param];
          const expectedMax = statistics.mean[param] + 3 * statistics.stdDev[param];
          
          if (value < expectedMin || value > expectedMax) {
            anomalies.push({
              timestamp: reading.timestamp,
              parameter: param,
              value,
              expectedRange: { min: expectedMin, max: expectedMax }
            });
          }
        }
      }
    }
    
    return anomalies;
  }

  private async createSensorAlert(
    sensor: SensorDevice,
    type: SensorAlert['type'],
    severity: SensorAlert['severity'],
    title: string,
    description: string,
    threshold?: SensorAlert['threshold']
  ): Promise<void> {
    const alert: SensorAlert = {
      id: this.generateAlertId(),
      sensorId: sensor.id,
      type,
      severity,
      title,
      description,
      threshold,
      status: 'active',
      recommendedActions: this.getRecommendedActions(type, sensor),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveAlert(alert);
    this.emit('sensor-alert', alert);
  }

  private getRecommendedActions(
    alertType: SensorAlert['type'],
    sensor: SensorDevice
  ): string[] {
    switch (alertType) {
      case 'out_of_range':
        return [
          'Check environmental controls',
          'Verify sensor calibration',
          'Inspect growing conditions'
        ];
      case 'sensor_error':
        return [
          'Check sensor connections',
          'Restart sensor',
          'Replace sensor if issue persists'
        ];
      case 'calibration_needed':
        return [
          'Prepare calibration standards',
          'Schedule calibration window',
          'Notify maintenance team'
        ];
      case 'maintenance_due':
        return [
          'Clean sensor',
          'Check for physical damage',
          'Update firmware if available'
        ];
      default:
        return ['Investigate issue', 'Contact support if needed'];
    }
  }

  private async getAmbientTemperature(roomId: string): Promise<number> {
    // Get from environmental monitoring system
    return 22; // Placeholder
  }

  private async getAmbientHumidity(roomId: string): Promise<number> {
    // Get from environmental monitoring system
    return 65; // Placeholder
  }

  private async getThresholds(
    sensorId: string,
    parameter: string
  ): Promise<{ min?: number; max?: number }> {
    // Get configured thresholds for sensor/parameter
    const defaults: Record<string, { min?: number; max?: number }> = {
      ec: { min: 1.0, max: 3.0 },
      ph: { min: 5.5, max: 6.5 },
      moisture: { min: 40, max: 80 },
      co2: { min: 400, max: 1500 },
      canopyTemp: { min: 18, max: 28 },
      ppfd: { min: 200, max: 1000 }
    };
    
    return defaults[parameter] || {};
  }

  private async processMQTTReading(sensorId: string, message: Buffer): Promise<void> {
    try {
      const data = JSON.parse(message.toString());
      // Process MQTT data format
    } catch (error) {
      logger.error('api', `Failed to process MQTT reading for ${sensorId}:`, error);
    }
  }

  private async calculateDowntime(
    sensorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Calculate total downtime in milliseconds
    return 0; // Placeholder
  }

  private async getTotalReadingCount(
    sensorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return await prisma.sensorReading.count({
      where: {
        sensorId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  // Database operations
  private async saveSensor(sensor: SensorDevice): Promise<void> {
    await prisma.sensor.upsert({
      where: { id: sensor.id },
      create: { ...sensor, facilityId: this.facilityId },
      update: sensor
    });
  }

  private async saveReading(reading: SensorReading): Promise<void> {
    await prisma.sensorReading.create({
      data: reading
    });
  }

  private async saveCalibration(calibration: SensorCalibration): Promise<void> {
    await prisma.sensorCalibration.create({
      data: calibration
    });
  }

  private async saveSensorGroup(group: SensorGroup): Promise<void> {
    await prisma.sensorGroup.upsert({
      where: { id: group.id },
      create: { ...group, facilityId: this.facilityId },
      update: group
    });
  }

  private async saveAlert(alert: SensorAlert): Promise<void> {
    await prisma.sensorAlert.create({
      data: { ...alert, facilityId: this.facilityId }
    });
  }

  private async getSensorGroup(groupId: string): Promise<SensorGroup | null> {
    return await prisma.sensorGroup.findUnique({
      where: { id: groupId }
    });
  }

  private async getReadingsInRange(
    sensorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SensorReading[]> {
    return await prisma.sensorReading.findMany({
      where: {
        sensorId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });
  }

  // Cleanup
  public destroy(): void {
    // Stop all polling intervals
    for (const interval of this.pollingIntervals.values()) {
      clearInterval(interval);
    }
    
    // Close all connections
    for (const [sensorId, connection] of this.connections) {
      if (connection.close) connection.close();
      if (connection.end) connection.end();
    }
    
    this.pollingIntervals.clear();
    this.connections.clear();
    this.removeAllListeners();
  }

  // ID generators
  private generateSensorId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReadingId(): string {
    return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCalibrationId(): string {
    return `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { AdvancedSensorIntegration };
export default AdvancedSensorIntegration;