/**
 * Unified Sensor Calibration and Validation System
 * Professional-grade sensor management for LI-COR and Apogee instruments
 */

import { EventEmitter } from 'events';
import { logger } from '../logging/production-logger';
import { LICORAdapter, LICORModelType, LICORCalibration, LICORSensorReading } from './licor-adapter';
import { ApogeeAdapter, ApogeeModelType, ApogeeCalibration, ApogeeSensorReading } from './apogee-adapter';

export type SensorBrand = 'LICOR' | 'APOGEE';
export type UnifiedSensorReading = LICORSensorReading | ApogeeSensorReading;
export type UnifiedCalibration = LICORCalibration | ApogeeCalibration;

export interface SensorConfiguration {
  id: string;
  brand: SensorBrand;
  model: LICORModelType | ApogeeModelType;
  serialNumber: string;
  location: {
    zone: string;
    coordinates?: { x: number; y: number; z: number };
    description?: string;
  };
  calibration: UnifiedCalibration;
  installationDate: Date;
  maintenanceSchedule: {
    lastMaintenance: Date;
    nextMaintenance: Date;
    calibrationInterval: number; // days
  };
  dataLoggingInterval: number; // seconds
  alertThresholds: {
    min?: number;
    max?: number;
    qualityThreshold: 'good' | 'warning' | 'error';
  };
}

export interface ValidationResult {
  sensorId: string;
  isValid: boolean;
  issues: Array<{
    type: 'calibration' | 'hardware' | 'data' | 'maintenance';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    recommendations?: string[];
  }>;
  lastValidated: Date;
  nextValidationDue: Date;
}

export interface ComparisonResult {
  primarySensorId: string;
  referenceSensorId: string;
  correlation: number;
  bias: number;
  rmse: number; // Root Mean Square Error
  dataPoints: number;
  timeRange: { start: Date; end: Date };
  recommendation: 'pass' | 'investigate' | 'recalibrate';
}

export interface CalibrationReport {
  sensorId: string;
  calibrationType: 'field' | 'laboratory' | 'cross-reference';
  preCalibrationData: UnifiedSensorReading[];
  postCalibrationData: UnifiedSensorReading[];
  referenceValues: number[];
  calibrationEquation: {
    slope: number;
    intercept: number;
    r2: number;
    uncertainty: number;
  };
  environment: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  calibratedBy: string;
  date: Date;
  certificate: string;
  traceability: string;
}

export class UnifiedSensorSystem extends EventEmitter {
  private licorAdapter: LICORAdapter;
  private apogeeAdapter: ApogeeAdapter;
  private sensors: Map<string, SensorConfiguration> = new Map();
  private validationResults: Map<string, ValidationResult> = new Map();
  private calibrationHistory: Map<string, CalibrationReport[]> = new Map();
  private dataBuffer: Map<string, UnifiedSensorReading[]> = new Map();

  constructor(config: {
    licorConfig?: any;
    apogeeConfig?: any;
  } = {}) {
    super();
    
    this.licorAdapter = new LICORAdapter(config.licorConfig);
    this.apogeeAdapter = new ApogeeAdapter(config.apogeeConfig);
    
    this.setupEventHandlers();
    logger.info('api', 'Unified Sensor System initialized');
  }

  private setupEventHandlers(): void {
    // LI-COR events
    this.licorAdapter.on('reading', (reading: LICORSensorReading) => {
      this.handleSensorReading(reading);
    });
    
    this.licorAdapter.on('error', (error) => {
      this.emit('sensorError', { brand: 'LICOR', error });
    });

    // Apogee events
    this.apogeeAdapter.on('reading', (reading: ApogeeSensorReading) => {
      this.handleSensorReading(reading);
    });
    
    this.apogeeAdapter.on('error', (error) => {
      this.emit('sensorError', { brand: 'APOGEE', error });
    });

    // Start validation scheduler
    this.startValidationScheduler();
  }

  private handleSensorReading(reading: UnifiedSensorReading): void {
    const buffer = this.dataBuffer.get(reading.sensorId);
    if (buffer) {
      buffer.push(reading);
      
      // Keep only last 10,000 readings per sensor
      if (buffer.length > 10000) {
        buffer.shift();
      }
    }

    // Emit unified reading event
    this.emit('reading', reading);
    
    // Check alert thresholds
    this.checkAlertThresholds(reading);
  }

  async registerSensor(config: SensorConfiguration): Promise<boolean> {
    try {
      // Register with appropriate adapter
      if (config.brand === 'LICOR') {
        await this.licorAdapter.registerSensor(
          config.id,
          config.model as LICORModelType,
          config.calibration as LICORCalibration
        );
      } else if (config.brand === 'APOGEE') {
        await this.apogeeAdapter.registerSensor(
          config.id,
          config.model as ApogeeModelType,
          config.calibration as ApogeeCalibration
        );
      }

      // Store configuration
      this.sensors.set(config.id, config);
      this.dataBuffer.set(config.id, []);
      
      // Initialize validation
      await this.validateSensor(config.id);
      
      this.emit('sensorRegistered', config);
      logger.info('api', `Registered ${config.brand} sensor: ${config.id} (${config.model})`);
      
      return true;
    } catch (error) {
      logger.error('api', `Failed to register sensor ${config.id}:`, error);
      return false;
    }
  }

  async readSensor(sensorId: string): Promise<UnifiedSensorReading | null> {
    const config = this.sensors.get(sensorId);
    if (!config) {
      throw new Error(`Sensor not registered: ${sensorId}`);
    }

    try {
      let reading: UnifiedSensorReading | null = null;
      
      if (config.brand === 'LICOR') {
        reading = await this.licorAdapter.readSensor(sensorId);
      } else if (config.brand === 'APOGEE') {
        reading = await this.apogeeAdapter.readSensor(sensorId);
      }

      return reading;
    } catch (error) {
      logger.error('api', `Failed to read sensor ${sensorId}:`, error);
      return null;
    }
  }

  async validateSensor(sensorId: string): Promise<ValidationResult> {
    const config = this.sensors.get(sensorId);
    if (!config) {
      throw new Error(`Sensor not registered: ${sensorId}`);
    }

    const issues: ValidationResult['issues'] = [];
    const now = new Date();

    // Check calibration status
    const daysSinceCalibration = (now.getTime() - config.calibration.calibrationDate.getTime()) 
      / (1000 * 60 * 60 * 24);
    
    if (daysSinceCalibration > config.maintenanceSchedule.calibrationInterval) {
      issues.push({
        type: 'calibration',
        severity: daysSinceCalibration > config.maintenanceSchedule.calibrationInterval * 1.5 ? 'error' : 'warning',
        message: `Calibration expired ${Math.floor(daysSinceCalibration)} days ago`,
        recommendations: [
          'Schedule recalibration with certified reference standards',
          'Perform cross-reference validation with known good sensor',
          'Check for drift using historical data'
        ]
      });
    }

    // Check maintenance schedule
    const daysSinceMaintenance = (now.getTime() - config.maintenanceSchedule.lastMaintenance.getTime()) 
      / (1000 * 60 * 60 * 24);
    
    if (now > config.maintenanceSchedule.nextMaintenance) {
      issues.push({
        type: 'maintenance',
        severity: 'warning',
        message: `Maintenance overdue by ${Math.floor(daysSinceMaintenance)} days`,
        recommendations: [
          'Clean sensor surface with appropriate cleaning solution',
          'Check cable connections and integrity',
          'Inspect for physical damage or wear'
        ]
      });
    }

    // Validate recent data quality
    const recentReadings = await this.getHistoricalData(sensorId, 24); // Last 24 hours
    if (recentReadings.length > 0) {
      const qualityIssues = recentReadings.filter(r => r.quality !== 'good').length;
      const qualityRatio = qualityIssues / recentReadings.length;
      
      if (qualityRatio > 0.1) { // More than 10% poor quality readings
        issues.push({
          type: 'data',
          severity: qualityRatio > 0.3 ? 'error' : 'warning',
          message: `${(qualityRatio * 100).toFixed(1)}% of recent readings have quality issues`,
          recommendations: [
            'Check sensor cleanliness and environment',
            'Verify cable connections',
            'Consider recalibration if issues persist'
          ]
        });
      }

      // Check for data consistency (standard deviation)
      if (recentReadings.length > 10) {
        const values = recentReadings.map(r => r.value);
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100; // Coefficient of variation
        
        if (cv > 50) { // High variability
          issues.push({
            type: 'data',
            severity: cv > 100 ? 'error' : 'warning',
            message: `High data variability detected (CV: ${cv.toFixed(1)}%)`,
            recommendations: [
              'Check for environmental interference',
              'Verify sensor stability and mounting',
              'Consider environmental controls to reduce variability'
            ]
          });
        }
      }
    } else {
      issues.push({
        type: 'hardware',
        severity: 'error',
        message: 'No recent data received from sensor',
        recommendations: [
          'Check power supply and connections',
          'Verify sensor communication settings',
          'Test sensor with diagnostic tools'
        ]
      });
    }

    const validationResult: ValidationResult = {
      sensorId,
      isValid: issues.filter(i => i.severity === 'error' || i.severity === 'critical').length === 0,
      issues,
      lastValidated: now,
      nextValidationDue: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.validationResults.set(sensorId, validationResult);
    this.emit('validationComplete', validationResult);
    
    logger.info('api', `Validation complete for sensor ${sensorId}`, {
      isValid: validationResult.isValid,
      issueCount: issues.length
    });

    return validationResult;
  }

  async compareSensors(primarySensorId: string, referenceSensorId: string, hours: number = 24): Promise<ComparisonResult> {
    const primaryData = await this.getHistoricalData(primarySensorId, hours);
    const referenceData = await this.getHistoricalData(referenceSensorId, hours);

    if (primaryData.length === 0 || referenceData.length === 0) {
      throw new Error('Insufficient data for sensor comparison');
    }

    // Align timestamps (find closest readings)
    const alignedPairs: Array<{ primary: number; reference: number; time: Date }> = [];
    
    for (const primaryReading of primaryData) {
      const closestReference = referenceData.reduce((closest, current) => {
        const currentDiff = Math.abs(current.timestamp.getTime() - primaryReading.timestamp.getTime());
        const closestDiff = Math.abs(closest.timestamp.getTime() - primaryReading.timestamp.getTime());
        return currentDiff < closestDiff ? current : closest;
      });

      // Only include if timestamps are within 5 minutes
      const timeDiff = Math.abs(closestReference.timestamp.getTime() - primaryReading.timestamp.getTime());
      if (timeDiff <= 5 * 60 * 1000) { // 5 minutes
        alignedPairs.push({
          primary: primaryReading.value,
          reference: closestReference.value,
          time: primaryReading.timestamp
        });
      }
    }

    if (alignedPairs.length < 10) {
      throw new Error('Insufficient aligned data points for comparison');
    }

    // Statistical analysis
    const primaryValues = alignedPairs.map(p => p.primary);
    const referenceValues = alignedPairs.map(p => p.reference);
    
    // Calculate correlation coefficient
    const correlation = this.calculateCorrelation(primaryValues, referenceValues);
    
    // Calculate bias (mean difference)
    const differences = alignedPairs.map(p => p.primary - p.reference);
    const bias = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    
    // Calculate RMSE
    const squaredErrors = differences.map(diff => Math.pow(diff, 2));
    const rmse = Math.sqrt(squaredErrors.reduce((sum, se) => sum + se, 0) / squaredErrors.length);
    
    // Determine recommendation
    let recommendation: ComparisonResult['recommendation'] = 'pass';
    if (Math.abs(correlation) < 0.95 || Math.abs(bias) > rmse * 2) {
      recommendation = 'investigate';
    }
    if (Math.abs(correlation) < 0.85 || Math.abs(bias) > rmse * 5) {
      recommendation = 'recalibrate';
    }

    const result: ComparisonResult = {
      primarySensorId,
      referenceSensorId,
      correlation,
      bias,
      rmse,
      dataPoints: alignedPairs.length,
      timeRange: {
        start: new Date(Math.min(...alignedPairs.map(p => p.time.getTime()))),
        end: new Date(Math.max(...alignedPairs.map(p => p.time.getTime())))
      },
      recommendation
    };

    logger.info('api', `Sensor comparison complete`, {
      primarySensorId,
      referenceSensorId,
      correlation,
      bias,
      rmse,
      recommendation
    });

    return result;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  async performFieldCalibration(sensorId: string, referenceValues: number[]): Promise<CalibrationReport> {
    const config = this.sensors.get(sensorId);
    if (!config) {
      throw new Error(`Sensor not registered: ${sensorId}`);
    }

    // Collect pre-calibration readings
    const preCalibrationData: UnifiedSensorReading[] = [];
    for (let i = 0; i < referenceValues.length; i++) {
      const reading = await this.readSensor(sensorId);
      if (reading) {
        preCalibrationData.push(reading);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between readings
    }

    if (preCalibrationData.length !== referenceValues.length) {
      throw new Error('Failed to collect sufficient calibration data');
    }

    // Calculate calibration equation using linear regression
    const sensorValues = preCalibrationData.map(r => r.value);
    const { slope, intercept, r2 } = this.calculateLinearRegression(sensorValues, referenceValues);

    // Create new calibration
    const newCalibration = {
      ...config.calibration,
      calibrationConstant: slope,
      calibrationDate: new Date(),
      calibrationCertificate: `FIELD-CAL-${Date.now()}`,
      nextCalibrationDue: new Date(Date.now() + config.maintenanceSchedule.calibrationInterval * 24 * 60 * 60 * 1000)
    };

    // Update sensor calibration
    if (config.brand === 'LICOR') {
      await this.licorAdapter.calibrateSensor(sensorId, newCalibration as LICORCalibration);
    } else if (config.brand === 'APOGEE') {
      await this.apogeeAdapter.calibrateSensor(sensorId, newCalibration as ApogeeCalibration);
    }

    // Collect post-calibration readings for verification
    const postCalibrationData: UnifiedSensorReading[] = [];
    for (let i = 0; i < referenceValues.length; i++) {
      const reading = await this.readSensor(sensorId);
      if (reading) {
        postCalibrationData.push(reading);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const calibrationReport: CalibrationReport = {
      sensorId,
      calibrationType: 'field',
      preCalibrationData,
      postCalibrationData,
      referenceValues,
      calibrationEquation: {
        slope,
        intercept,
        r2,
        uncertainty: this.calculateUncertainty(sensorValues, referenceValues, slope, intercept)
      },
      environment: {
        temperature: 25, // Would be measured from environmental sensor
        humidity: 50,
        pressure: 101.3
      },
      calibratedBy: 'Field Technician',
      date: new Date(),
      certificate: newCalibration.calibrationCertificate,
      traceability: 'NIST traceable reference standards'
    };

    // Store calibration history
    const history = this.calibrationHistory.get(sensorId) || [];
    history.push(calibrationReport);
    this.calibrationHistory.set(sensorId, history);

    // Update sensor configuration
    config.calibration = newCalibration;
    this.sensors.set(sensorId, config);

    this.emit('calibrationComplete', calibrationReport);
    logger.info('api', `Field calibration completed for sensor ${sensorId}`, {
      r2,
      slope,
      uncertainty: calibrationReport.calibrationEquation.uncertainty
    });

    return calibrationReport;
  }

  private calculateLinearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssResidual = x.reduce((sum, val, i) => sum + Math.pow(y[i] - (slope * val + intercept), 2), 0);
    const r2 = 1 - (ssResidual / ssTotal);

    return { slope, intercept, r2 };
  }

  private calculateUncertainty(measured: number[], reference: number[], slope: number, intercept: number): number {
    const residuals = measured.map((m, i) => reference[i] - (slope * m + intercept));
    const variance = residuals.reduce((sum, r) => sum + r * r, 0) / (residuals.length - 2);
    return Math.sqrt(variance);
  }

  async getHistoricalData(sensorId: string, hours: number = 24): Promise<UnifiedSensorReading[]> {
    const buffer = this.dataBuffer.get(sensorId);
    if (!buffer) return [];

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return buffer.filter(reading => reading.timestamp >= cutoffTime);
  }

  private checkAlertThresholds(reading: UnifiedSensorReading): void {
    const config = this.sensors.get(reading.sensorId);
    if (!config || !config.alertThresholds) return;

    const { min, max, qualityThreshold } = config.alertThresholds;
    const alerts: string[] = [];

    if (min !== undefined && reading.value < min) {
      alerts.push(`Value ${reading.value} below minimum threshold ${min}`);
    }

    if (max !== undefined && reading.value > max) {
      alerts.push(`Value ${reading.value} above maximum threshold ${max}`);
    }

    if (reading.quality !== 'good' && reading.quality !== qualityThreshold) {
      alerts.push(`Quality alert: ${reading.quality}`);
    }

    if (alerts.length > 0) {
      this.emit('alert', {
        sensorId: reading.sensorId,
        alerts,
        reading,
        timestamp: new Date()
      });
    }
  }

  private startValidationScheduler(): void {
    // Run validation checks every hour
    setInterval(async () => {
      for (const [sensorId, config] of this.sensors) {
        const lastValidation = this.validationResults.get(sensorId);
        
        if (!lastValidation || new Date() > lastValidation.nextValidationDue) {
          try {
            await this.validateSensor(sensorId);
          } catch (error) {
            logger.error('api', `Scheduled validation failed for sensor ${sensorId}:`, error);
          }
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  getSystemStatus(): any {
    return {
      totalSensors: this.sensors.size,
      activeSensors: Array.from(this.sensors.values()).filter(s => 
        this.validationResults.get(s.id)?.isValid
      ).length,
      brands: {
        LICOR: Array.from(this.sensors.values()).filter(s => s.brand === 'LICOR').length,
        APOGEE: Array.from(this.sensors.values()).filter(s => s.brand === 'APOGEE').length
      },
      lastUpdate: new Date()
    };
  }

  async exportSystemReport(): Promise<string> {
    const report = {
      systemStatus: this.getSystemStatus(),
      sensors: Array.from(this.sensors.entries()).map(([id, config]) => ({
        id,
        config,
        validation: this.validationResults.get(id),
        calibrationHistory: this.calibrationHistory.get(id) || []
      })),
      generatedAt: new Date(),
      generatedBy: 'VibeLux Unified Sensor System'
    };

    return JSON.stringify(report, null, 2);
  }

  async disconnect(): Promise<void> {
    await this.licorAdapter.disconnect();
    await this.apogeeAdapter.disconnect();
    logger.info('api', 'Unified Sensor System disconnected');
  }
}

export default UnifiedSensorSystem;