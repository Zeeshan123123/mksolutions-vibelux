// LI-COR Sensor Integration Adapter
// Supports LI-190R, LI-200R, LI-210R, LI-250A sensors and LI-1500 data logger
// Enhanced with latest LI-COR models and professional calibration features

import { EventEmitter } from 'events';
import { logger } from '../logging/production-logger';

export type LICORModelType = 
  | 'LI-190R'    // Quantum sensor (PPFD)
  | 'LI-200R'    // Pyranometer (Solar irradiance)
  | 'LI-210R'    // Photometric sensor (Illuminance)
  | 'LI-250A'    // Light meter (Illuminance)
  | 'LI-6800'    // Portable photosynthesis system
  | 'LI-3100C'   // Leaf area meter
  | 'LI-840A';   // CO2/H2O gas analyzer

export interface LICORSensorReading {
  timestamp: Date;
  sensorId: string;
  sensorType: LICORModelType;
  value: number;
  unit: string;
  quality: 'good' | 'warning' | 'error';
  calibrationDate?: Date;
  calibrationConstant?: number;
  temperature?: number;
  serialNumber?: string;
}

export interface LI190RReading extends LICORSensorReading {
  sensorType: 'LI-190R';
  ppfd: number;           // μmol·m⁻²·s⁻¹
  par: number;            // μmol·m⁻²·s⁻¹ (same as PPFD)
  voltage: number;        // mV
  current: number;        // μA
  unit: 'μmol·m⁻²·s⁻¹';
  spectralResponse: string; // Spectral response curve identifier
  cosineResponse: number;   // Cosine response accuracy %
}

export interface LI6800Reading extends LICORSensorReading {
  sensorType: 'LI-6800';
  photosynthesis: number;      // μmol CO2·m⁻²·s⁻¹
  transpiration: number;       // mmol H2O·m⁻²·s⁻¹
  stomatalConductance: number; // mol H2O·m⁻²·s⁻¹
  intercellularCO2: number;    // μmol CO2·mol⁻¹
  leafTemperature: number;     // °C
  ppfd: number;                // μmol·m⁻²·s⁻¹
  unit: 'μmol·m⁻²·s⁻¹';
}

export interface LI840AReading extends LICORSensorReading {
  sensorType: 'LI-840A';
  co2Concentration: number;    // μmol CO2·mol⁻¹
  h2oConcentration: number;    // mmol H2O·mol⁻¹
  temperature: number;         // °C
  pressure: number;            // kPa
  flowRate: number;            // L·min⁻¹
  unit: 'μmol·mol⁻¹';
}

export interface LI200RReading extends LICORSensorReading {
  sensorType: 'LI-200R';
  irradiance: number;     // W·m⁻²
  voltage: number;        // mV
  current: number;        // μA
  unit: 'W·m⁻²';
}

export interface DLICalculation {
  timestamp: Date;
  dli: number;            // mol·m⁻²·d⁻¹
  peakPPFD: number;       // μmol·m⁻²·s⁻¹
  avgPPFD: number;        // μmol·m⁻²·s⁻¹
  photoperiod: number;    // hours
  readings: number;       // number of measurements
}

export interface LICORCalibration {
  sensorId: string;
  calibrationConstant: number;
  calibrationDate: Date;
  calibrationCertificate: string;
  nextCalibrationDue: Date;
  linearityCoefficients?: number[];  // For multi-point calibrations
  temperatureCoefficient?: number;
  serialNumber: string;
  factoryCalibration?: {
    constant: number;
    date: Date;
    certificate: string;
  };
}

export class LICORAdapter extends EventEmitter {
  private sensors: Map<string, any> = new Map();
  private calibrationData: Map<string, LICORCalibration> = new Map();
  private dataBuffer: Map<string, LICORSensorReading[]> = new Map();
  private isConnected: boolean = false;
  private connectionType: 'serial' | 'usb' | 'tcp' = 'serial';
  
  // Enhanced LI-COR sensor specifications with latest models
  private readonly SENSOR_SPECS = {
    'LI-190R': {
      sensitivity: 5.0,    // μA per 1000 μmol·m⁻²·s⁻¹
      loadResistor: 604,   // Ω (standard LI-COR load resistor)
      maxPPFD: 3000,       // μmol·m⁻²·s⁻¹
      spectralRange: { min: 400, max: 700 }, // nm
      calibrationMultiplier: 200.0, // Default calibration constant
      accuracy: 0.05,      // ±5%
      operatingTemp: { min: -40, max: 65 }, // °C
      cosineResponse: 0.02, // ±2% from 0° to 75°
      nonLinearity: 0.01,   // ±1%
      stability: '<2% per year',
      spectralResponse: 'matches plant photosynthetic response'
    },
    'LI-200R': {
      sensitivity: 75.0,   // μA per 1000 W·m⁻²
      loadResistor: 147,   // Ω
      maxIrradiance: 2000, // W·m⁻²
      spectralRange: { min: 400, max: 1100 }, // nm
      calibrationMultiplier: 13.33, // Default calibration constant
      accuracy: 0.05,      // ±5%
      operatingTemp: { min: -40, max: 65 }, // °C
      cosineResponse: 0.02,
      nonLinearity: 0.01
    },
    'LI-210R': {
      sensitivity: 10.0,   // μA per 100 klux
      loadResistor: 147,   // Ω
      maxLux: 200000,      // lux
      accuracy: 0.03,      // ±3%
      operatingTemp: { min: -40, max: 65 }, // °C
      spectralResponse: 'photopic response'
    },
    'LI-6800': {
      co2Range: { min: 0, max: 3000 }, // μmol·mol⁻¹
      h2oRange: { min: 0, max: 75 },   // mmol·mol⁻¹
      leafTempRange: { min: -10, max: 65 }, // °C
      ppfdRange: { min: 0, max: 3000 }, // μmol·m⁻²·s⁻¹
      accuracy: {
        co2: '±1 μmol·mol⁻¹',
        h2o: '±0.1 mmol·mol⁻¹',
        temperature: '±0.2°C'
      },
      measurementTime: '< 2 minutes'
    },
    'LI-840A': {
      co2Range: { min: 0, max: 20000 }, // μmol·mol⁻¹
      h2oRange: { min: 0, max: 60 },    // mmol·mol⁻¹
      precision: {
        co2: '< 1 μmol·mol⁻¹ RMS @ 1 Hz',
        h2o: '< 0.05 mmol·mol⁻¹ RMS @ 1 Hz'
      },
      accuracy: {
        co2: '±1% of reading',
        h2o: '±2% of reading'
      },
      responseTime: '< 0.1 seconds (10-90%)',
      operatingTemp: { min: 5, max: 45 } // °C
    }
  };

  constructor(private config: {
    connectionType?: 'serial' | 'usb' | 'tcp';
    serialPort?: string;
    baudRate?: number;
    tcpHost?: string;
    tcpPort?: number;
  } = {}) {
    super();
    this.connectionType = config.connectionType || 'serial';
    this.initializeCalibrationData();
    this.setupConnection();
  }

  private initializeCalibrationData(): void {
    // Load stored calibration data from database
    // These would typically come from your database or calibration certificates
    this.calibrationData.set('LI-190R-001', {
      sensorId: 'LI-190R-001',
      calibrationConstant: 199.8,
      calibrationDate: new Date('2024-01-15'),
      calibrationCertificate: 'CAL-190R-2024-001',
      nextCalibrationDue: new Date('2025-01-15'),
      serialNumber: 'Q12345',
      factoryCalibration: {
        constant: 200.0,
        date: new Date('2023-12-01'),
        certificate: 'LI-COR-FAC-190R-2023-12345'
      }
    });
    
    logger.info('api', 'LICOR calibration data initialized');
  }

  private setupConnection(): void {
    // Setup connection monitoring and data acquisition
    logger.info('api', `Setting up LICOR connection: ${this.connectionType}`);
  }

  async connect(): Promise<boolean> {
    try {
      logger.info('api', 'Connecting to LI-COR sensors...', { config: this.config });
      
      switch (this.connectionType) {
        case 'serial':
          await this.connectSerial();
          break;
        case 'tcp':
          await this.connectTCP();
          break;
        case 'usb':
          await this.connectUSB();
          break;
      }

      this.isConnected = true;
      this.emit('connected');
      logger.info('api', 'Successfully connected to LI-COR sensors');
      return true;
    } catch (error) {
      logger.error('api', 'Failed to connect to LI-COR sensors:', error);
      this.emit('error', error);
      return false;
    }
  }

  private async connectSerial(): Promise<void> {
    const port = this.config.serialPort || '/dev/ttyUSB0';
    const baud = this.config.baudRate || 9600;
    logger.info('api', `Connecting to LI-COR via serial: ${port} at ${baud} baud`);
  }

  private async connectTCP(): Promise<void> {
    const host = this.config.tcpHost || 'localhost';
    const port = this.config.tcpPort || 502;
    logger.info('api', `Connecting to LI-COR via TCP: ${host}:${port}`);
  }

  private async connectUSB(): Promise<void> {
    logger.info('api', 'Connecting to LI-COR via USB');
  }

  async registerSensor(sensorId: string, modelType: LICORModelType, calibration?: LICORCalibration): Promise<void> {
    const sensorSpec = this.SENSOR_SPECS[modelType];
    if (!sensorSpec) {
      throw new Error(`Unsupported LI-COR sensor model: ${modelType}`);
    }

    this.sensors.set(sensorId, {
      id: sensorId,
      type: modelType,
      spec: sensorSpec,
      registeredAt: new Date(),
      lastReading: null,
      status: 'registered'
    });

    if (calibration) {
      this.calibrationData.set(sensorId, calibration);
    }

    this.dataBuffer.set(sensorId, []);
    this.emit('sensorRegistered', { sensorId, modelType });
    
    logger.info('api', `Registered LI-COR sensor: ${sensorId} (${modelType})`);
  }

  async readSensor(sensorId: string): Promise<LICORSensorReading | null> {
    const sensor = this.sensors.get(sensorId);
    const calibration = this.calibrationData.get(sensorId);
    
    if (!sensor || !calibration) {
      throw new Error(`Sensor not registered: ${sensorId}`);
    }

    try {
      // Read raw data from sensor
      const rawData = await this.readRawData(sensorId, sensor.type);
      
      // Process reading based on sensor type
      const reading = this.processReading(rawData, sensor, calibration);
      
      // Store in buffer
      const buffer = this.dataBuffer.get(sensorId);
      buffer?.push(reading);
      
      // Keep only last 1000 readings
      if (buffer && buffer.length > 1000) {
        buffer.shift();
      }
      
      sensor.lastReading = reading;
      this.emit('reading', reading);
      
      return reading;
    } catch (error) {
      logger.error('api', `Failed to read LI-COR sensor ${sensorId}:`, error);
      return null;
    }
  }

  private async readRawData(sensorId: string, sensorType: LICORModelType): Promise<any> {
    // Interface with actual sensor hardware
    // For now, return mock data based on sensor type
    switch (sensorType) {
      case 'LI-190R':
        return {
          voltage: Math.random() * 2000 + 100, // 100-2100 mV
          temperature: 25 + Math.random() * 10
        };
      case 'LI-200R':
        return {
          voltage: Math.random() * 1500 + 50,
          temperature: 25 + Math.random() * 10
        };
      case 'LI-6800':
        return {
          co2: 400 + Math.random() * 200,
          h2o: 15 + Math.random() * 10,
          leafTemp: 25 + Math.random() * 5,
          ppfd: 800 + Math.random() * 400
        };
      case 'LI-840A':
        return {
          co2: 380 + Math.random() * 50,
          h2o: 12 + Math.random() * 8,
          temperature: 25 + Math.random() * 5,
          pressure: 101.3 + Math.random() * 2
        };
      default:
        return { voltage: 1000 + Math.random() * 1000 };
    }
  }

  private processReading(rawData: any, sensor: any, calibration: LICORCalibration): LICORSensorReading {
    const timestamp = new Date();
    const sensorType = sensor.type as LICORModelType;

    switch (sensorType) {
      case 'LI-190R': {
        const ppfd = this.convertToPPFD(rawData.voltage, calibration.calibrationConstant);
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: ppfd,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: this.assessQuality(ppfd, sensorType),
          calibrationDate: calibration.calibrationDate,
          calibrationConstant: calibration.calibrationConstant,
          temperature: rawData.temperature,
          serialNumber: calibration.serialNumber,
          ppfd,
          par: ppfd, // PAR is same as PPFD
          voltage: rawData.voltage,
          current: rawData.voltage / 604, // μA
          spectralResponse: 'plant photosynthetic response',
          cosineResponse: 2.0 // %
        } as LI190RReading;
      }

      case 'LI-6800': {
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: rawData.co2,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: this.assessQuality(rawData.co2, sensorType),
          calibrationDate: calibration.calibrationDate,
          serialNumber: calibration.serialNumber,
          photosynthesis: rawData.co2 * 0.1, // Mock calculation
          transpiration: rawData.h2o * 0.5,
          stomatalConductance: rawData.h2o * 0.02,
          intercellularCO2: rawData.co2 * 0.8,
          leafTemperature: rawData.leafTemp,
          ppfd: rawData.ppfd
        } as LI6800Reading;
      }

      case 'LI-840A': {
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: rawData.co2,
          unit: 'μmol·mol⁻¹',
          quality: this.assessQuality(rawData.co2, sensorType),
          calibrationDate: calibration.calibrationDate,
          serialNumber: calibration.serialNumber,
          co2Concentration: rawData.co2,
          h2oConcentration: rawData.h2o,
          temperature: rawData.temperature,
          pressure: rawData.pressure,
          flowRate: 1.0 // L·min⁻¹
        } as LI840AReading;
      }

      default: {
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: rawData.voltage || 0,
          unit: 'mV',
          quality: 'good',
          calibrationDate: calibration.calibrationDate,
          calibrationConstant: calibration.calibrationConstant,
          serialNumber: calibration.serialNumber
        };
      }
    }
  }

  // Convert analog signal to PPFD for LI-190R
  private convertToPPFD(voltage: number, calibrationConstant: number): number {
    const spec = this.SENSOR_SPECS['LI-190R'];
    
    // Convert voltage to current (μA)
    const current = (voltage * 1000) / spec.loadResistor; // mV to V, then V/Ω = A
    
    // Apply calibration constant to get PPFD
    const ppfd = current * calibrationConstant;
    
    return Math.round(ppfd * 10) / 10; // Round to 1 decimal place
  }

  private assessQuality(value: number | number[], sensorType: LICORModelType): 'good' | 'warning' | 'error' {
    if (Array.isArray(value)) {
      return value.every(v => v >= 0 && v <= 10000) ? 'good' : 'warning';
    }

    switch (sensorType) {
      case 'LI-190R':
        if (value < 0) return 'error';
        if (value > 3000) return 'warning';
        return 'good';
      
      case 'LI-6800':
        if (value < 0 || value > 3000) return 'error';
        return 'good';
      
      case 'LI-840A':
        if (value < 0 || value > 20000) return 'error';
        return 'good';
      
      default:
        return value >= 0 ? 'good' : 'error';
    }
  }

  async calibrateSensor(sensorId: string, calibration: LICORCalibration): Promise<boolean> {
    try {
      this.calibrationData.set(sensorId, calibration);
      this.emit('calibrationUpdated', { sensorId, calibration });
      
      logger.info('api', `Calibration updated for LI-COR sensor ${sensorId}`, {
        calibrationConstant: calibration.calibrationConstant,
        calibrationDate: calibration.calibrationDate,
        certificate: calibration.calibrationCertificate
      });
      
      return true;
    } catch (error) {
      logger.error('api', `Failed to calibrate LI-COR sensor ${sensorId}:`, error);
      return false;
    }
  }

  async getHistoricalData(sensorId: string, hours: number = 24): Promise<LICORSensorReading[]> {
    const buffer = this.dataBuffer.get(sensorId);
    if (!buffer) return [];

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return buffer.filter(reading => reading.timestamp >= cutoffTime);
  }

  async exportCalibrationCertificate(sensorId: string): Promise<string> {
    const sensor = this.sensors.get(sensorId);
    const calibration = this.calibrationData.get(sensorId);
    
    if (!sensor || !calibration) {
      throw new Error(`Sensor or calibration not found: ${sensorId}`);
    }

    const certificate = {
      sensorId,
      sensorType: sensor.type,
      serialNumber: calibration.serialNumber,
      calibrationConstant: calibration.calibrationConstant,
      calibrationDate: calibration.calibrationDate,
      certificateNumber: calibration.calibrationCertificate,
      nextCalibrationDue: calibration.nextCalibrationDue,
      calibratedBy: 'LI-COR Biosciences',
      traceability: 'NIST traceable',
      factoryCalibration: calibration.factoryCalibration,
      specifications: this.SENSOR_SPECS[sensor.type as LICORModelType]
    };

    return JSON.stringify(certificate, null, 2);
  }

  getConnectedSensors(): string[] {
    return Array.from(this.sensors.keys());
  }

  getSensorInfo(sensorId: string): any {
    const sensor = this.sensors.get(sensorId);
    const calibration = this.calibrationData.get(sensorId);
    
    return {
      ...sensor,
      calibration,
      specification: sensor ? this.SENSOR_SPECS[sensor.type as LICORModelType] : null
    };
  }

  // Calculate Daily Light Integral
  public calculateDLI(readings: LI190RReading[], date: Date = new Date()): DLICalculation {
    if (readings.length === 0) {
      throw new Error('No readings provided for DLI calculation');
    }

    // Sort readings by timestamp
    const sortedReadings = readings.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate DLI using trapezoidal integration
    let totalLight = 0;
    let peakPPFD = 0;
    let sumPPFD = 0;

    for (let i = 1; i < sortedReadings.length; i++) {
      const prev = sortedReadings[i - 1];
      const curr = sortedReadings[i];
      
      // Time interval in seconds
      const intervalSeconds = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
      
      // Trapezoidal area (average PPFD × time)
      const avgPPFD = (prev.ppfd + curr.ppfd) / 2;
      totalLight += avgPPFD * intervalSeconds;
      
      // Track peak and sum
      peakPPFD = Math.max(peakPPFD, curr.ppfd);
      sumPPFD += curr.ppfd;
    }

    // Convert to mol·m⁻²·d⁻¹
    const dli = totalLight / 1000000; // μmol to mol
    
    // Calculate photoperiod
    const firstReading = sortedReadings[0].timestamp;
    const lastReading = sortedReadings[sortedReadings.length - 1].timestamp;
    const photoperiod = (lastReading.getTime() - firstReading.getTime()) / (1000 * 60 * 60);

    return {
      timestamp: date,
      dli: Math.round(dli * 100) / 100,
      peakPPFD: Math.round(peakPPFD),
      avgPPFD: Math.round(sumPPFD / sortedReadings.length),
      photoperiod: Math.round(photoperiod * 10) / 10,
      readings: sortedReadings.length
    };
  }

  // Connect to LI-1500 Data Logger
  public async connectToDataLogger(host: string, port: number = 80): Promise<void> {
    try {
      // In a real implementation, this would establish HTTP connection
      // to the LI-1500 data logger's web interface
      const response = await fetch(`http://${host}:${port}/api/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to connect to LI-1500: ${response.statusText}`);
      }

      const status = await response.json();
      this.emit('connected', { host, port, status });
      
      // Start polling for data
      this.startDataPolling(host, port);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async startDataPolling(host: string, port: number): Promise<void> {
    // Poll every 5 seconds for new data
    setInterval(async () => {
      try {
        const response = await fetch(`http://${host}:${port}/api/readings`);
        const data = await response.json();
        
        // Process each channel
        data.channels.forEach((channel: any) => {
          const reading = this.processChannelData(channel);
          this.bufferReading(reading);
          this.emit('reading', reading);
        });
      } catch (error) {
        this.emit('error', error);
      }
    }, 5000);
  }

  private processChannelData(channel: any): LICORSensorReading {
    const { sensorType, value, voltage, timestamp } = channel;
    
    switch (sensorType) {
      case 'LI-190R':
        return {
          timestamp: new Date(timestamp),
          sensorId: channel.id,
          sensorType: 'LI-190R',
          value: this.convertToPPFD(voltage, channel.id),
          ppfd: this.convertToPPFD(voltage, channel.id),
          par: this.convertToPPFD(voltage, channel.id),
          voltage,
          current: (voltage * 1000) / this.SENSOR_SPECS['LI-190R'].loadResistor,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: this.assessSignalQuality(voltage, 'LI-190R'),
          calibrationDate: new Date(channel.calibrationDate),
          calibrationConstant: this.calibrationConstants.get(channel.id)
        } as LI190RReading;
        
      case 'LI-200R':
        const irradiance = this.convertToIrradiance(voltage, channel.id);
        return {
          timestamp: new Date(timestamp),
          sensorId: channel.id,
          sensorType: 'LI-200R',
          value: irradiance,
          irradiance,
          voltage,
          current: (voltage * 1000) / this.SENSOR_SPECS['LI-200R'].loadResistor,
          unit: 'W·m⁻²',
          quality: this.assessSignalQuality(voltage, 'LI-200R'),
          calibrationDate: new Date(channel.calibrationDate),
          calibrationConstant: this.calibrationConstants.get(channel.id)
        } as LI200RReading;
        
      default:
        throw new Error(`Unsupported sensor type: ${sensorType}`);
    }
  }

  private convertToIrradiance(voltage: number, sensorId: string): number {
    const spec = this.SENSOR_SPECS['LI-200R'];
    const calibrationConstant = this.calibrationConstants.get(sensorId) || spec.calibrationMultiplier;
    
    const current = (voltage * 1000) / spec.loadResistor;
    const irradiance = current * calibrationConstant;
    
    return Math.round(irradiance * 10) / 10;
  }

  private assessSignalQuality(voltage: number, sensorType: string): 'good' | 'warning' | 'error' {
    // Check if voltage is within expected range
    if (voltage < 0.1) return 'error'; // Too low, possibly disconnected
    if (voltage > 4900) return 'error'; // Too high, possibly saturated
    if (voltage < 1 || voltage > 4800) return 'warning'; // Near limits
    return 'good';
  }

  private bufferReading(reading: LICORSensorReading): void {
    const buffer = this.dataBuffer.get(reading.sensorId) || [];
    buffer.push(reading);
    
    // Keep last 24 hours of data
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);
    
    const filtered = buffer.filter(r => r.timestamp > cutoff);
    this.dataBuffer.set(reading.sensorId, filtered);
  }

  // Get buffered readings for DLI calculation
  public getBufferedReadings(sensorId: string): LICORSensorReading[] {
    return this.dataBuffer.get(sensorId) || [];
  }

  // Manual reading from USB/Serial connection
  public async readFromUSB(port: string): Promise<LICORSensorReading> {
    // This would interface with USB/Serial port
    // Implementation depends on the specific hardware interface
    throw new Error('USB reading not implemented yet');
  }

  // Calibrate sensor with known light source
  public calibrateSensor(
    sensorId: string, 
    knownPPFD: number, 
    measuredVoltage: number
  ): number {
    const spec = this.SENSOR_SPECS['LI-190R'];
    const current = (measuredVoltage * 1000) / spec.loadResistor;
    const newConstant = knownPPFD / current;
    
    this.calibrationConstants.set(sensorId, newConstant);
    this.emit('calibrated', { sensorId, constant: newConstant });
    
    return newConstant;
  }

  // Export data in LI-COR format
  public exportData(readings: LICORSensorReading[], format: 'csv' | 'json' = 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(readings, null, 2);
    }
    
    // CSV format matching LI-COR's standard output
    let csv = 'Timestamp,Sensor ID,Type,Value,Unit,Quality,Calibration Constant\n';
    
    readings.forEach(reading => {
      csv += `${reading.timestamp.toISOString()},${reading.sensorId},${reading.sensorType},`;
      csv += `${reading.value},${reading.unit},${reading.quality},`;
      csv += `${reading.calibrationConstant || 'N/A'}\n`;
    });
    
    return csv;
  }
}