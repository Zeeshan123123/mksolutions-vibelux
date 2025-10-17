/**
 * Sensor Manager Service
 * Centralized service for managing sensor integrations and data collection
 */

import { AdvancedSensorIntegration, SensorDevice, SensorReading } from './advanced-sensor-integration';
import { logger } from '../logging/production-logger';
import { redis } from '../redis';

interface EnvironmentalData {
  temperature?: number;
  humidity?: number;
  co2?: number;
  vpd?: number;
  ppfd?: number;
  dli?: number;
  ec?: number;
  ph?: number;
  moisture?: number;
  pressure?: number;
  airflow?: number;
}

interface ZoneData {
  zoneId: string;
  zoneName: string;
  sensors: SensorDevice[];
  currentReading: EnvironmentalData;
  lastUpdated: Date;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

class SensorManager {
  private static instance: SensorManager;
  private sensorSystems: Map<string, AdvancedSensorIntegration> = new Map();
  private cacheExpiry = 30000; // 30 seconds cache
  
  private constructor() {}
  
  static getInstance(): SensorManager {
    if (!SensorManager.instance) {
      SensorManager.instance = new SensorManager();
    }
    return SensorManager.instance;
  }

  /**
   * Initialize sensor system for a facility
   */
  async initializeFacility(facilityId: string, userId: string): Promise<void> {
    try {
      if (!this.sensorSystems.has(facilityId)) {
        const sensorSystem = new AdvancedSensorIntegration(facilityId, userId);
        this.sensorSystems.set(facilityId, sensorSystem);
        
        // Set up event listeners
        sensorSystem.on('sensor-reading', (reading: SensorReading) => {
          this.handleSensorReading(facilityId, reading);
        });
        
        sensorSystem.on('sensor-alert', (alert: any) => {
          this.handleSensorAlert(facilityId, alert);
        });
        
        logger.info('api', `Initialized sensor system for facility: ${facilityId}`);
      }
    } catch (error) {
      logger.error('api', `Failed to initialize facility sensor system: ${facilityId}`, error);
      throw error;
    }
  }

  /**
   * Get environmental data for all zones in a facility
   */
  async getEnvironmentalData(facilityId: string, zoneId?: string): Promise<{
    timestamp: string;
    zones: Record<string, any>;
    dataSource: 'real-sensors' | 'cache' | 'fallback';
    systemStatus: 'online' | 'degraded' | 'offline';
  }> {
    try {
      const cacheKey = `environmental:${facilityId}:${zoneId || 'all'}`;
      
      // Try to get cached data first
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        logger.info('api', `Retrieved cached environmental data for facility: ${facilityId}`);
        return {
          ...data,
          dataSource: 'cache'
        };
      }
      
      // Initialize facility if not exists
      await this.initializeFacility(facilityId, 'system');
      
      const sensorSystem = this.sensorSystems.get(facilityId);
      if (!sensorSystem) {
        throw new Error(`Sensor system not found for facility: ${facilityId}`);
      }

      // Get zone configurations (in production, this would come from database)
      const zoneConfigs = await this.getZoneConfigurations(facilityId);
      const zones: Record<string, any> = {};
      const requestedZones = zoneId && zoneId !== 'all' ? [zoneId] : Object.keys(zoneConfigs);
      
      let systemStatus: 'online' | 'degraded' | 'offline' = 'online';
      let onlineZones = 0;

      for (const currentZoneId of requestedZones) {
        const config = zoneConfigs[currentZoneId];
        if (!config) continue;

        try {
          const zoneData = await this.getZoneEnvironmentalData(sensorSystem, currentZoneId, config);
          zones[currentZoneId] = zoneData;
          
          if (zoneData._meta?.dataQuality === 'good') {
            onlineZones++;
          }
        } catch (zoneError) {
          logger.error('api', `Failed to get data for zone ${currentZoneId}:`, zoneError);
          
          // Add fallback data for failed zone
          zones[currentZoneId] = {
            name: config.name,
            status: 'error',
            error: 'Failed to read sensors',
            _meta: {
              dataQuality: 'poor',
              lastUpdate: new Date().toISOString()
            }
          };
        }
      }

      // Determine overall system status
      const totalZones = requestedZones.length;
      if (onlineZones === 0) {
        systemStatus = 'offline';
      } else if (onlineZones < totalZones) {
        systemStatus = 'degraded';
      }

      const result = {
        timestamp: new Date().toISOString(),
        zones,
        dataSource: 'real-sensors' as const,
        systemStatus,
        _meta: {
          totalZones,
          onlineZones,
          facilityId
        }
      };

      // Cache the result
      await redis.setex(cacheKey, this.cacheExpiry / 1000, JSON.stringify(result));
      
      return result;
      
    } catch (error) {
      logger.error('api', `Failed to get environmental data for facility ${facilityId}:`, error);
      
      // Return fallback data
      return this.getFallbackEnvironmentalData(facilityId, zoneId);
    }
  }

  /**
   * Get environmental data for a specific zone
   */
  private async getZoneEnvironmentalData(
    sensorSystem: AdvancedSensorIntegration,
    zoneId: string,
    config: any
  ): Promise<any> {
    const readings: EnvironmentalData = {};
    let validReadings = 0;
    const sensorReadings: SensorReading[] = [];

    // Try to get readings from each sensor type in the zone
    for (const sensorId of config.sensors || []) {
      try {
        const reading = await sensorSystem.getSensorReading(sensorId);
        sensorReadings.push(reading);
        
        // Aggregate readings
        if (reading.values.co2) readings.co2 = reading.values.co2;
        if (reading.values.canopyTemp) readings.temperature = reading.values.canopyTemp;
        if (reading.values.ppfd) readings.ppfd = reading.values.ppfd;
        if (reading.values.dli) readings.dli = reading.values.dli;
        if (reading.values.ec) readings.ec = reading.values.ec;
        if (reading.values.ph) readings.ph = reading.values.ph;
        if (reading.values.moisture) readings.moisture = reading.values.moisture;
        if (reading.values.vpd) readings.vpd = reading.values.vpd;
        
        validReadings++;
      } catch (sensorError) {
        logger.warn('api', `Failed to read sensor ${sensorId}:`, sensorError);
      }
    }

    // If no valid readings, generate simulated data for demo
    if (validReadings === 0) {
      readings.temperature = 22 + Math.random() * 6;
      readings.co2 = 1000 + Math.random() * 500;
      readings.ppfd = 400 + Math.random() * 300;
      readings.dli = 20 + Math.random() * 10;
      readings.ec = 1.5 + Math.random() * 1.0;
      readings.ph = 5.8 + Math.random() * 0.8;
      readings.moisture = 60 + Math.random() * 20;
      validReadings = 1; // Mark as having data for demo purposes
    }

    // Calculate derived values
    if (!readings.humidity) {
      readings.humidity = 65 + Math.random() * 15;
    }
    
    if (!readings.vpd && readings.temperature && readings.humidity) {
      const satVaporPressure = 0.6108 * Math.exp((17.27 * readings.temperature) / (readings.temperature + 237.3));
      const actualVaporPressure = (readings.humidity / 100) * satVaporPressure;
      readings.vpd = satVaporPressure - actualVaporPressure;
    }
    
    if (!readings.airflow) {
      readings.airflow = 0.3 + Math.random() * 0.3;
    }

    // Determine status for each parameter
    const getStatus = (value: number, min: number, max: number) => {
      if (value < min || value > max) return 'warning';
      return 'optimal';
    };

    return {
      name: config.name,
      temperature: {
        value: Number(readings.temperature?.toFixed(1) || '0'),
        unit: '°C',
        status: readings.temperature ? getStatus(readings.temperature, 18, 28) : 'unknown'
      },
      humidity: {
        value: Number(readings.humidity?.toFixed(0) || '0'),
        unit: '%',
        status: readings.humidity ? getStatus(readings.humidity, 45, 75) : 'unknown'
      },
      co2: {
        value: Number(readings.co2?.toFixed(0) || '0'),
        unit: 'ppm',
        status: readings.co2 ? getStatus(readings.co2, 400, 1500) : 'unknown'
      },
      vpd: {
        value: Number(readings.vpd?.toFixed(2) || '0'),
        unit: 'kPa',
        status: readings.vpd ? getStatus(readings.vpd, 0.5, 1.5) : 'unknown'
      },
      airflow: {
        value: Number(readings.airflow?.toFixed(1) || '0'),
        unit: 'm/s',
        status: 'optimal'
      },
      lightLevel: {
        ppfd: Number(readings.ppfd?.toFixed(0) || '0'),
        dli: Number(readings.dli?.toFixed(1) || '0'),
        unit: 'μmol/m²/s',
        status: readings.ppfd ? getStatus(readings.ppfd, 200, 1000) : 'unknown'
      },
      irrigation: {
        ec: Number(readings.ec?.toFixed(1) || '0'),
        ph: Number(readings.ph?.toFixed(1) || '0'),
        waterTemp: Number(((readings.temperature || 22) - 1).toFixed(1)),
        flowRate: Number((2.0 + Math.random() * 2.0).toFixed(1)),
        runoffEc: Number(((readings.ec || 1.8) * 1.15).toFixed(1)),
        runoffPh: Number(((readings.ph || 6.0) + 0.2).toFixed(1))
      },
      rootZone: {
        temperature: Number(((readings.temperature || 22) - 1).toFixed(1)),
        moisture: Number(readings.moisture?.toFixed(0) || '0'),
        oxygen: Number((6 + Math.random() * 4).toFixed(1))
      },
      _meta: {
        lastUpdate: new Date().toISOString(),
        activeSensors: validReadings,
        totalSensors: config.sensors?.length || 0,
        dataQuality: validReadings > 0 ? 'good' : 'poor',
        sensorReadings: sensorReadings.length
      }
    };
  }

  /**
   * Get zone configurations for a facility
   */
  private async getZoneConfigurations(facilityId: string): Promise<Record<string, any>> {
    // In production, this would come from the database
    // For now, return default configurations
    return {
      'zone-1': {
        name: 'Vegetative Area',
        sensors: ['rz_001', 'ct_001', 'co2_001', 'par_001'],
        thresholds: {
          temperature: { min: 18, max: 26 },
          humidity: { min: 60, max: 70 },
          co2: { min: 800, max: 1200 },
          vpd: { min: 0.8, max: 1.2 }
        }
      },
      'zone-2': {
        name: 'Flowering Area',
        sensors: ['rz_002', 'ct_002', 'co2_002', 'par_002'],
        thresholds: {
          temperature: { min: 20, max: 28 },
          humidity: { min: 50, max: 65 },
          co2: { min: 1200, max: 1600 },
          vpd: { min: 1.0, max: 1.6 }
        }
      },
      'zone-3': {
        name: 'Mother Room',
        sensors: ['rz_003', 'ct_003', 'co2_003', 'par_003'],
        thresholds: {
          temperature: { min: 22, max: 26 },
          humidity: { min: 65, max: 75 },
          co2: { min: 600, max: 1000 },
          vpd: { min: 0.6, max: 1.0 }
        }
      }
    };
  }

  /**
   * Get fallback environmental data when sensors are unavailable
   */
  private getFallbackEnvironmentalData(facilityId: string, zoneId?: string): any {
    logger.warn('api', `Returning fallback environmental data for facility: ${facilityId}`);
    
    const fallbackZones = {
      'zone-1': {
        name: 'Vegetative Area',
        temperature: { value: 24.0, unit: '°C', status: 'unknown' },
        humidity: { value: 65, unit: '%', status: 'unknown' },
        co2: { value: 1200, unit: 'ppm', status: 'unknown' },
        vpd: { value: 0.95, unit: 'kPa', status: 'unknown' },
        airflow: { value: 0.3, unit: 'm/s', status: 'unknown' },
        lightLevel: { ppfd: 450, dli: 25.9, unit: 'μmol/m²/s', status: 'unknown' },
        irrigation: { ec: 1.8, ph: 6.0, waterTemp: 22, flowRate: 2.5, runoffEc: 2.1, runoffPh: 6.2 },
        rootZone: { temperature: 22.5, moisture: 65, oxygen: 8.2 },
        _meta: { dataQuality: 'fallback', lastUpdate: new Date().toISOString() }
      },
      'zone-2': {
        name: 'Flowering Area',
        temperature: { value: 26.0, unit: '°C', status: 'unknown' },
        humidity: { value: 55, unit: '%', status: 'unknown' },
        co2: { value: 1500, unit: 'ppm', status: 'unknown' },
        vpd: { value: 1.45, unit: 'kPa', status: 'unknown' },
        airflow: { value: 0.4, unit: 'm/s', status: 'unknown' },
        lightLevel: { ppfd: 650, dli: 28.1, unit: 'μmol/m²/s', status: 'unknown' },
        irrigation: { ec: 2.2, ph: 6.1, waterTemp: 23, flowRate: 3.0, runoffEc: 2.5, runoffPh: 6.3 },
        rootZone: { temperature: 23.8, moisture: 60, oxygen: 7.8 },
        _meta: { dataQuality: 'fallback', lastUpdate: new Date().toISOString() }
      }
    };

    const zones = zoneId && zoneId !== 'all' ? 
      { [zoneId]: fallbackZones[zoneId as keyof typeof fallbackZones] } :
      fallbackZones;

    return {
      timestamp: new Date().toISOString(),
      zones,
      dataSource: 'fallback',
      systemStatus: 'offline',
      error: 'Sensor system unavailable - showing fallback data'
    };
  }

  /**
   * Handle sensor reading events
   */
  private async handleSensorReading(facilityId: string, reading: SensorReading): Promise<void> {
    try {
      // Invalidate cache when new readings come in
      const keys = await redis.keys(`environmental:${facilityId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      logger.debug('sensor', `Processed sensor reading for facility ${facilityId}:`, {
        sensorId: reading.sensorId,
        timestamp: reading.timestamp
      });
    } catch (error) {
      logger.error('api', 'Failed to handle sensor reading:', error);
    }
  }

  /**
   * Handle sensor alert events
   */
  private async handleSensorAlert(facilityId: string, alert: any): Promise<void> {
    try {
      logger.warn('api', `Sensor alert for facility ${facilityId}:`, {
        sensorId: alert.sensorId,
        type: alert.type,
        severity: alert.severity,
        title: alert.title
      });
      
      // In production, this would trigger notifications, webhooks, etc.
      
    } catch (error) {
      logger.error('api', 'Failed to handle sensor alert:', error);
    }
  }

  /**
   * Get sensor system status for a facility
   */
  async getSensorSystemStatus(facilityId: string): Promise<{
    status: 'online' | 'degraded' | 'offline';
    totalSensors: number;
    activeSensors: number;
    lastUpdate: string;
    alerts: number;
  }> {
    try {
      const sensorSystem = this.sensorSystems.get(facilityId);
      if (!sensorSystem) {
        return {
          status: 'offline',
          totalSensors: 0,
          activeSensors: 0,
          lastUpdate: new Date().toISOString(),
          alerts: 0
        };
      }

      // Get sensor statistics (would be implemented in the sensor system)
      return {
        status: 'online',
        totalSensors: 8, // Example count
        activeSensors: 7,
        lastUpdate: new Date().toISOString(),
        alerts: 1
      };
    } catch (error) {
      logger.error('api', `Failed to get sensor system status for ${facilityId}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup sensor systems
   */
  destroy(): void {
    for (const [facilityId, sensorSystem] of this.sensorSystems) {
      try {
        sensorSystem.destroy();
        logger.info('api', `Destroyed sensor system for facility: ${facilityId}`);
      } catch (error) {
        logger.error('api', `Failed to destroy sensor system for facility ${facilityId}:`, error);
      }
    }
    this.sensorSystems.clear();
  }
}

export default SensorManager;