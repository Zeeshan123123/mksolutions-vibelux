// Apogee Instruments Sensor Integration Adapter
// Supports SQ-500, SQ-520, MQ-500, SI-400 series sensors

import { EventEmitter } from 'events';
import { logger } from '../logging/production-logger';

export interface ApogeeSensorReading {
  timestamp: Date;
  sensorId: string;
  sensorType: ApogeeModelType;
  value: number;
  unit: string;
  quality: 'good' | 'warning' | 'error';
  calibrationDate?: Date;
  calibrationConstant?: number;
  temperature?: number; // For temperature-compensated sensors
}

export type ApogeeModelType = 
  // PPFD/PAR Sensors
  | 'SQ-500'    // Full spectrum PPFD sensor
  | 'SQ-520'    // Full spectrum PPFD sensor with heater
  | 'SQ-421'    // Red/Far-red sensor
  | 'SQ-422'    // Blue sensor
  // Irradiance Sensors
  | 'SQ-212'    // Total solar irradiance
  | 'SQ-215'    // UV-A sensor
  | 'SQ-110'    // Total solar irradiance
  // Environmental Sensors
  | 'SI-400'    // Temperature/RH probe
  | 'SI-111'    // Infrared radiometer
  // Underwater sensors
  | 'MQ-500'    // Underwater PPFD
  | 'MQ-510'    // Underwater scalar irradiance;

export interface SQ500Reading extends ApogeeSensorReading {
  sensorType: 'SQ-500';
  ppfd: number;           // μmol·m⁻²·s⁻¹
  voltage: number;        // mV
  unit: 'μmol·m⁻²·s⁻¹';
  spectralRange: '389-692 nm';
}

export interface SQ520Reading extends ApogeeSensorReading {
  sensorType: 'SQ-520';
  ppfd: number;           // μmol·m⁻²·s⁻¹
  voltage: number;        // mV
  heaterStatus: boolean;  // Heater on/off status
  bodyTemperature: number; // °C
  unit: 'μmol·m⁻²·s⁻¹';
}

export interface SI400Reading extends ApogeeSensorReading {
  sensorType: 'SI-400';
  temperature: number;    // °C
  relativeHumidity: number; // %
  vaporPressure: number;  // kPa
  dewPoint: number;       // °C
  vpd: number;            // kPa (calculated)
  unit: '°C, %RH';
}

export interface MQ500Reading extends ApogeeSensorReading {
  sensorType: 'MQ-500';
  underwaterPPFD: number; // μmol·m⁻²·s⁻¹
  depth: number;          // meters
  waterTemperature: number; // °C
  unit: 'μmol·m⁻²·s⁻¹';
}

export interface ApogeeCalibration {
  sensorId: string;
  calibrationConstant: number;
  calibrationDate: Date;
  calibrationCertificate: string;
  nextCalibrationDue: Date;
  temperatureCoefficient?: number;
  offsetCorrection?: number;
}

export class ApogeeAdapter extends EventEmitter {
  private sensors: Map<string, any> = new Map();
  private calibrationData: Map<string, ApogeeCalibration> = new Map();
  private dataBuffer: Map<string, ApogeeSensorReading[]> = new Map();
  private isConnected: boolean = false;
  
  // Apogee sensor specifications and calibration constants
  private readonly SENSOR_SPECS = {
    'SQ-500': {
      range: '0 to 4000 μmol·m⁻²·s⁻¹',
      accuracy: '± 5%',
      spectralRange: '389 to 692 ± 5 nm',
      defaultCalibration: 4.29, // μmol·m⁻²·s⁻¹ per mV
      temperatureCoefficient: 0.04, // % per °C
      operatingTemp: '-40 to 70°C'
    },
    'SQ-520': {
      range: '0 to 4000 μmol·m⁻²·s⁻¹',
      accuracy: '± 5%',
      spectralRange: '389 to 692 ± 5 nm',
      defaultCalibration: 4.29,
      temperatureCoefficient: 0.04,
      operatingTemp: '-40 to 70°C',
      hasHeater: true
    },
    'SI-400': {
      temperatureRange: '-40 to 70°C',
      temperatureAccuracy: '± 0.1°C',
      humidityRange: '0 to 100%',
      humidityAccuracy: '± 2.5%',
      operatingTemp: '-40 to 70°C'
    },
    'MQ-500': {
      range: '0 to 4000 μmol·m⁻²·s⁻¹',
      accuracy: '± 5%',
      spectralRange: '389 to 692 ± 5 nm',
      maxDepth: '100 m',
      pressureRating: '1 MPa'
    }
  };

  constructor(private config: {
    serialPort?: string;
    baudRate?: number;
    tcpHost?: string;
    tcpPort?: number;
    protocol: 'serial' | 'tcp' | 'usb';
  }) {
    super();
    this.setupConnection();
  }

  async connect(): Promise<boolean> {
    try {
      logger.info('api', 'Connecting to Apogee sensors...', { config: this.config });
      
      // Initialize connection based on protocol
      switch (this.config.protocol) {
        case 'serial':
          await this.connectSerial();
          break;
        case 'tcp':
          await this.connectTCP();
          break;
        case 'usb':
          await this.connectUSB();
          break;
        default:
          throw new Error(`Unsupported protocol: ${this.config.protocol}`);
      }

      this.isConnected = true;
      this.emit('connected');
      logger.info('api', 'Successfully connected to Apogee sensors');
      return true;
    } catch (error) {
      logger.error('api', 'Failed to connect to Apogee sensors:', error);
      this.emit('error', error);
      return false;
    }
  }

  private async connectSerial(): Promise<void> {
    // Serial connection implementation for RS-485 or RS-232
    const serialPort = this.config.serialPort || '/dev/ttyUSB0';
    const baudRate = this.config.baudRate || 9600;
    
    // Implementation would use serialport library
    logger.info('api', `Connecting via serial: ${serialPort} at ${baudRate} baud`);
  }

  private async connectTCP(): Promise<void> {
    // TCP connection for network-enabled loggers
    const host = this.config.tcpHost || 'localhost';
    const port = this.config.tcpPort || 502;
    
    logger.info('api', `Connecting via TCP: ${host}:${port}`);
  }

  private async connectUSB(): Promise<void> {
    // USB connection for direct sensor connection
    logger.info('api', 'Connecting via USB');
  }

  async registerSensor(sensorId: string, modelType: ApogeeModelType, calibration?: ApogeeCalibration): Promise<void> {
    const sensorSpec = this.SENSOR_SPECS[modelType];
    if (!sensorSpec) {
      throw new Error(`Unsupported Apogee sensor model: ${modelType}`);
    }

    this.sensors.set(sensorId, {
      id: sensorId,
      type: modelType,
      spec: sensorSpec,
      registeredAt: new Date(),
      lastReading: null
    });

    if (calibration) {
      this.calibrationData.set(sensorId, calibration);
    } else {
      // Use default calibration
      this.calibrationData.set(sensorId, {
        sensorId,
        calibrationConstant: (sensorSpec as any).defaultCalibration || 1.0,
        calibrationDate: new Date(),
        calibrationCertificate: 'default',
        nextCalibrationDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    }

    this.dataBuffer.set(sensorId, []);
    this.emit('sensorRegistered', { sensorId, modelType });
    
    logger.info('api', `Registered Apogee sensor: ${sensorId} (${modelType})`);
  }

  async readSensor(sensorId: string): Promise<ApogeeSensorReading | null> {
    const sensor = this.sensors.get(sensorId);
    const calibration = this.calibrationData.get(sensorId);
    
    if (!sensor || !calibration) {
      throw new Error(`Sensor not registered: ${sensorId}`);
    }

    try {
      // Read raw voltage/digital value from sensor
      const rawValue = await this.readRawValue(sensorId, sensor.type);
      
      // Apply calibration and create reading
      const reading = this.processReading(rawValue, sensor, calibration);
      
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
      logger.error('api', `Failed to read sensor ${sensorId}:`, error);
      return null;
    }
  }

  private async readRawValue(sensorId: string, sensorType: ApogeeModelType): Promise<any> {
    // This would interface with actual sensor hardware
    // For now, return mock data based on sensor type
    switch (sensorType) {
      case 'SQ-500':
      case 'SQ-520':
        return {
          voltage: Math.random() * 2000 + 100, // 100-2100 mV
          temperature: 25 + Math.random() * 10,
          heaterStatus: sensorType === 'SQ-520' ? Math.random() > 0.5 : undefined
        };
      case 'SI-400':
        return {
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          voltage: 2500 // mV
        };
      case 'MQ-500':
        return {
          voltage: Math.random() * 1500 + 50,
          depth: Math.random() * 10,
          waterTemp: 15 + Math.random() * 10
        };
      default:
        return { voltage: 1000 + Math.random() * 1000 };
    }
  }

  private processReading(rawValue: any, sensor: any, calibration: ApogeeCalibration): ApogeeSensorReading {
    const timestamp = new Date();
    const sensorType = sensor.type as ApogeeModelType;

    switch (sensorType) {
      case 'SQ-500': {
        const ppfd = rawValue.voltage * calibration.calibrationConstant;
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: ppfd,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: this.assessQuality(ppfd, sensorType),
          calibrationDate: calibration.calibrationDate,
          calibrationConstant: calibration.calibrationConstant,
          ppfd,
          voltage: rawValue.voltage,
          spectralRange: '389-692 nm'
        } as SQ500Reading;
      }

      case 'SQ-520': {
        const ppfd = rawValue.voltage * calibration.calibrationConstant;
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: ppfd,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: this.assessQuality(ppfd, sensorType),
          calibrationDate: calibration.calibrationDate,
          calibrationConstant: calibration.calibrationConstant,
          ppfd,
          voltage: rawValue.voltage,
          heaterStatus: rawValue.heaterStatus || false,
          bodyTemperature: rawValue.temperature || 25
        } as SQ520Reading;
      }

      case 'SI-400': {
        const temp = rawValue.temperature;
        const rh = rawValue.humidity;
        const vpd = this.calculateVPD(temp, rh);
        const dewPoint = this.calculateDewPoint(temp, rh);
        const vaporPressure = this.calculateVaporPressure(temp, rh);

        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: temp,
          unit: '°C, %RH',
          quality: this.assessQuality([temp, rh], sensorType),
          calibrationDate: calibration.calibrationDate,
          temperature: temp,
          relativeHumidity: rh,
          vaporPressure,
          dewPoint,
          vpd
        } as SI400Reading;
      }

      case 'MQ-500': {
        const underwaterPPFD = rawValue.voltage * calibration.calibrationConstant;
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: underwaterPPFD,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: this.assessQuality(underwaterPPFD, sensorType),
          calibrationDate: calibration.calibrationDate,
          calibrationConstant: calibration.calibrationConstant,
          underwaterPPFD,
          depth: rawValue.depth || 0,
          waterTemperature: rawValue.waterTemp || 20
        } as MQ500Reading;
      }

      default: {
        return {
          timestamp,
          sensorId: sensor.id,
          sensorType,
          value: rawValue.voltage || 0,
          unit: 'mV',
          quality: 'good',
          calibrationDate: calibration.calibrationDate,
          calibrationConstant: calibration.calibrationConstant
        };
      }
    }
  }

  private assessQuality(value: number | number[], sensorType: ApogeeModelType): 'good' | 'warning' | 'error' {
    // Quality assessment based on sensor type and expected ranges
    if (Array.isArray(value)) {
      return value.every(v => v >= 0 && v <= 10000) ? 'good' : 'warning';
    }

    switch (sensorType) {
      case 'SQ-500':
      case 'SQ-520':
        if (value < 0) return 'error';
        if (value > 4000) return 'warning';
        return 'good';
      
      case 'SI-400':
        if (value < -50 || value > 80) return 'error';
        return 'good';
      
      default:
        return value >= 0 ? 'good' : 'error';
    }
  }

  // Environmental calculation methods
  private calculateVPD(temperature: number, relativeHumidity: number): number {
    // Calculate saturation vapor pressure (kPa)
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    
    // Calculate actual vapor pressure
    const avp = (relativeHumidity / 100) * svp;
    
    // VPD = SVP - AVP
    return svp - avp;
  }

  private calculateDewPoint(temperature: number, relativeHumidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(relativeHumidity / 100);
    return (b * alpha) / (a - alpha);
  }

  private calculateVaporPressure(temperature: number, relativeHumidity: number): number {
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    return (relativeHumidity / 100) * svp;
  }

  async calibrateSensor(sensorId: string, calibration: ApogeeCalibration): Promise<boolean> {
    try {
      this.calibrationData.set(sensorId, calibration);
      this.emit('calibrationUpdated', { sensorId, calibration });
      
      logger.info('api', `Calibration updated for sensor ${sensorId}`, {
        calibrationConstant: calibration.calibrationConstant,
        calibrationDate: calibration.calibrationDate
      });
      
      return true;
    } catch (error) {
      logger.error('api', `Failed to calibrate sensor ${sensorId}:`, error);
      return false;
    }
  }

  async getHistoricalData(sensorId: string, hours: number = 24): Promise<ApogeeSensorReading[]> {
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

    // Generate calibration certificate data
    const certificate = {
      sensorId,
      sensorType: sensor.type,
      calibrationConstant: calibration.calibrationConstant,
      calibrationDate: calibration.calibrationDate,
      certificateNumber: calibration.calibrationCertificate,
      nextCalibrationDue: calibration.nextCalibrationDue,
      calibratedBy: 'Apogee Instruments',
      traceability: 'NIST traceable'
    };

    return JSON.stringify(certificate, null, 2);
  }

  private setupConnection(): void {
    // Setup connection monitoring
    setInterval(() => {
      if (this.isConnected) {
        this.emit('heartbeat');
      }
    }, 30000); // 30 second heartbeat
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.emit('disconnected');
    logger.info('api', 'Disconnected from Apogee sensors');
  }

  getConnectedSensors(): string[] {
    return Array.from(this.sensors.keys());
  }

  getSensorInfo(sensorId: string): any {
    return this.sensors.get(sensorId);
  }
}

export default ApogeeAdapter;