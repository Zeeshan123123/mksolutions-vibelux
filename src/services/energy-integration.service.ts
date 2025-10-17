import { logger } from '@/lib/logging/production-logger';
import { EnergyReading } from './energy-monitoring.service';
import energyMonitoringService from './energy-monitoring.service';

export interface IntegrationConfig {
  facilityId: string;
  integrationType: 'modbus' | 'mqtt' | 'api' | 'csv';
  connectionDetails: any;
  pollingInterval?: number; // milliseconds
  active: boolean;
}

export class EnergyIntegrationService {
  private activeIntegrations: Map<string, NodeJS.Timer> = new Map();

  /**
   * Register a new integration
   */
  async registerIntegration(config: IntegrationConfig): Promise<void> {
    try {
      // Validate connection
      await this.validateConnection(config);

      // Store configuration
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.$executeRaw`
        INSERT INTO energy_integrations (
          facility_id, integration_type, connection_details, 
          polling_interval, active, created_at
        ) VALUES (
          ${config.facilityId}, ${config.integrationType}, 
          ${JSON.stringify(config.connectionDetails)}, 
          ${config.pollingInterval || 60000}, ${config.active}, ${new Date()}
        )
        ON CONFLICT (facility_id) 
        DO UPDATE SET 
          integration_type = EXCLUDED.integration_type,
          connection_details = EXCLUDED.connection_details,
          polling_interval = EXCLUDED.polling_interval,
          active = EXCLUDED.active,
          updated_at = ${new Date()}
      `;

      // Start polling if active
      if (config.active) {
        await this.startPolling(config);
      }
    } catch (error) {
      logger.error('api', 'Error registering integration:', error );
      throw error;
    }
  }

  /**
   * Start polling for a facility
   */
  async startPolling(config: IntegrationConfig): Promise<void> {
    const { facilityId, pollingInterval = 60000 } = config;

    // Stop existing polling if any
    this.stopPolling(facilityId);

    // Start new polling
    const timer = setInterval(async () => {
      try {
        const readings = await this.fetchReadings(config);
        
        // Record each reading
        for (const reading of readings) {
          await energyMonitoringService.recordEnergyUsage(reading);
        }
      } catch (error) {
        logger.error('api', `Error polling facility ${facilityId}:`, error instanceof Error ? error : undefined, error instanceof Error ? undefined : { error });
      }
    }, pollingInterval);

    this.activeIntegrations.set(facilityId, timer);
  }

  /**
   * Stop polling for a facility
   */
  stopPolling(facilityId: string): void {
    const timer = this.activeIntegrations.get(facilityId);
    if (timer) {
      clearInterval(timer);
      this.activeIntegrations.delete(facilityId);
    }
  }

  /**
   * Validate integration connection
   */
  private async validateConnection(config: IntegrationConfig): Promise<boolean> {
    switch (config.integrationType) {
      case 'modbus':
        return this.validateModbusConnection(config.connectionDetails);
      case 'mqtt':
        return this.validateMqttConnection(config.connectionDetails);
      case 'api':
        return this.validateApiConnection(config.connectionDetails);
      case 'csv':
        return true; // CSV doesn't need validation
      default:
        throw new Error(`Unknown integration type: ${config.integrationType}`);
    }
  }

  /**
   * Fetch readings based on integration type
   */
  private async fetchReadings(config: IntegrationConfig): Promise<EnergyReading[]> {
    switch (config.integrationType) {
      case 'modbus':
        return this.fetchModbusReadings(config);
      case 'mqtt':
        return this.fetchMqttReadings(config);
      case 'api':
        return this.fetchApiReadings(config);
      case 'csv':
        return this.fetchCsvReadings(config);
      default:
        throw new Error(`Unknown integration type: ${config.integrationType}`);
    }
  }

  /**
   * Modbus integration
   */
  private async validateModbusConnection(details: any): Promise<boolean> {
    try {
      let ModbusRTU: any;
      try {
        // eslint-disable-next-line no-eval
        ModbusRTU = eval("require('modbus-serial')");
      } catch (e) {
        logger.warn('api', 'Modbus-serial not available, skipping validation');
        return true;
      }
      const client = new ModbusRTU();
      
      await client.connectTCP(details.host, { port: details.port || 502 });
      await client.readHoldingRegisters(details.startRegister || 0, 1);
      client.close();
      
      return true;
    } catch (error) {
      logger.error('api', 'Modbus connection failed:', error );
      return false;
    }
  }

  private async fetchModbusReadings(config: IntegrationConfig): Promise<EnergyReading[]> {
    let ModbusRTU: any;
    try {
      // eslint-disable-next-line no-eval
      ModbusRTU = eval("require('modbus-serial')");
    } catch (e) {
      logger.warn('api', 'Modbus-serial not available');
      return [];
    }
    const client = new ModbusRTU();
    const { connectionDetails, facilityId } = config;

    try {
      await client.connectTCP(connectionDetails.host, { 
        port: connectionDetails.port || 502 
      });
      
      // Read power meter registers (example for common meters)
      const powerData = await client.readHoldingRegisters(
        connectionDetails.powerRegister || 1000, 
        2
      );
      const energyData = await client.readHoldingRegisters(
        connectionDetails.energyRegister || 1100, 
        2
      );
      const voltageData = await client.readHoldingRegisters(
        connectionDetails.voltageRegister || 1200, 
        2
      );
      const currentData = await client.readHoldingRegisters(
        connectionDetails.currentRegister || 1300, 
        2
      );

      client.close();

      // Convert register values to actual readings
      const power = this.convertModbusValue(powerData.data, connectionDetails.powerScale || 0.1);
      const energy = this.convertModbusValue(energyData.data, connectionDetails.energyScale || 0.01);
      const voltage = this.convertModbusValue(voltageData.data, connectionDetails.voltageScale || 0.1);
      const current = this.convertModbusValue(currentData.data, connectionDetails.currentScale || 0.01);

      return [{
        facilityId,
        timestamp: new Date(),
        powerKw: power,
        energyKwh: energy,
        voltage,
        current,
        powerFactor: 0.95, // Default if not available
        source: 'meter',
        deviceId: `modbus-${connectionDetails.host}`,
      }];
    } catch (error) {
      logger.error('api', 'Error reading Modbus data:', error );
      throw error;
    }
  }

  private convertModbusValue(registers: number[], scale: number): number {
    // Convert 32-bit float from two 16-bit registers
    const buffer = Buffer.alloc(4);
    buffer.writeUInt16BE(registers[0], 0);
    buffer.writeUInt16BE(registers[1], 2);
    return buffer.readFloatBE(0) * scale;
  }

  /**
   * MQTT integration
   */
  private async validateMqttConnection(details: any): Promise<boolean> {
    try {
      const mqtt = require('mqtt');
      const client = mqtt.connect(details.broker, {
        username: details.username,
        password: details.password,
      });

      return new Promise((resolve) => {
        client.on('connect', () => {
          client.end();
          resolve(true);
        });
        client.on('error', () => {
          resolve(false);
        });
      });
    } catch (error) {
      logger.error('api', 'MQTT connection failed:', error );
      return false;
    }
  }

  private async fetchMqttReadings(config: IntegrationConfig): Promise<EnergyReading[]> {
    const mqtt = require('mqtt');
    const { connectionDetails, facilityId } = config;
    
    return new Promise((resolve, reject) => {
      const client = mqtt.connect(connectionDetails.broker, {
        username: connectionDetails.username,
        password: connectionDetails.password,
      });

      const readings: EnergyReading[] = [];
      const timeout = setTimeout(() => {
        client.end();
        resolve(readings);
      }, 5000); // 5 second timeout

      client.on('connect', () => {
        client.subscribe(connectionDetails.topic || 'energy/+/reading');
      });

      client.on('message', (topic: string, message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          readings.push({
            facilityId,
            zoneId: data.zoneId,
            timestamp: new Date(data.timestamp || Date.now()),
            powerKw: data.power,
            energyKwh: data.energy,
            voltage: data.voltage,
            current: data.current,
            powerFactor: data.powerFactor,
            source: 'meter',
            deviceId: data.deviceId || topic,
          });
        } catch (error) {
          logger.error('api', 'Error parsing MQTT message:', error );
        }
      });

      client.on('error', (error: Error) => {
        clearTimeout(timeout);
        client.end();
        reject(error);
      });
    });
  }

  /**
   * REST API integration
   */
  private async validateApiConnection(details: any): Promise<boolean> {
    try {
      const response = await fetch(details.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${details.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      logger.error('api', 'API connection failed:', error );
      return false;
    }
  }

  private async fetchApiReadings(config: IntegrationConfig): Promise<EnergyReading[]> {
    const { connectionDetails, facilityId } = config;

    try {
      const response = await fetch(connectionDetails.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connectionDetails.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map API response to our format
      return data.readings.map((reading: any) => ({
        facilityId,
        zoneId: reading.zoneId,
        timestamp: new Date(reading.timestamp),
        powerKw: reading.power,
        energyKwh: reading.energy,
        voltage: reading.voltage,
        current: reading.current,
        powerFactor: reading.powerFactor || 0.95,
        source: 'meter',
        deviceId: reading.meterId,
      }));
    } catch (error) {
      logger.error('api', 'Error fetching API data:', error );
      throw error;
    }
  }

  /**
   * CSV file integration (for manual uploads)
   */
  private async fetchCsvReadings(config: IntegrationConfig): Promise<EnergyReading[]> {
    // This would typically read from a watched directory or S3 bucket
    // For now, return empty array as CSV is manual upload
    return [];
  }

  /**
   * Process CSV file upload
   */
  async processCsvUpload(
    facilityId: string, 
    csvContent: string
  ): Promise<{ processed: number; errors: number }> {
    const csvParse = require('csv-parse/sync');
    let processed = 0;
    let errors = 0;

    try {
      const records = csvParse.parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
      });

      for (const record of records) {
        try {
          const reading: EnergyReading = {
            facilityId,
            timestamp: new Date(record.timestamp || record.date),
            powerKw: parseFloat(record.power || record.kw),
            energyKwh: parseFloat(record.energy || record.kwh),
            voltage: record.voltage ? parseFloat(record.voltage) : undefined,
            current: record.current ? parseFloat(record.current) : undefined,
            powerFactor: record.powerFactor ? parseFloat(record.powerFactor) : undefined,
            source: 'meter',
            deviceId: record.meterId || 'csv-upload',
          };

          await energyMonitoringService.recordEnergyUsage(reading);
          processed++;
        } catch (error) {
          logger.error('api', 'Error processing CSV row:', error );
          errors++;
        }
      }

      return { processed, errors };
    } catch (error) {
      logger.error('api', 'Error parsing CSV:', error );
      throw error;
    }
  }
}

export default new EnergyIntegrationService();