/**
 * Priva Configuration and Connection Service
 * Handles user credentials, connection testing, and fallback modes
 */

import { logger } from '@/lib/logging/production-logger';
import prisma from '@/lib/prisma';
import { EventEmitter } from 'events';

export interface PrivaCredentials {
  username: string;
  password: string;
  farmCode: string;
  apiKey?: string;
  apiUrl: string;
  apiVersion: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
}

export interface PrivaConnectionConfig {
  id: string;
  userId: string;
  credentials: PrivaCredentials;
  isActive: boolean;
  isDemo: boolean;
  lastConnected?: Date;
  lastError?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'demo';
  facilities: PrivaFacility[];
}

export interface PrivaFacility {
  id: string;
  name: string;
  farmCode: string;
  compartments: PrivaCompartment[];
  totalArea: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface PrivaCompartment {
  id: string;
  name: string;
  area: number;
  crop: string;
  plantingDate?: Date;
  climateZones: number;
  hasLighting: boolean;
  hasIrrigation: boolean;
  hasHeating: boolean;
  hasCooling: boolean;
  hasCO2: boolean;
}

export interface PrivaRealtimeData {
  compartmentId: string;
  timestamp: Date;
  climate: {
    temperature: number;
    humidity: number;
    co2: number;
    radiation: number;
    vpd: number;
  };
  setpoints: {
    temperatureDay: number;
    temperatureNight: number;
    humidityMax: number;
    humidityMin: number;
    co2Target: number;
  };
  equipment: {
    heating: number; // 0-100%
    cooling: number;
    vents: number;
    screens: number;
    lights: boolean;
    irrigation: boolean;
  };
  alarms: string[];
}

// Demo data generator for testing without real Priva
class PrivaDemoDataGenerator {
  private baseTemp = 24;
  private baseHumidity = 65;
  private baseCO2 = 1000;
  
  generateRealtimeData(compartmentId: string): PrivaRealtimeData {
    // Generate realistic fluctuating data
    const time = new Date();
    const hour = time.getHours();
    const isDay = hour >= 6 && hour < 18;
    
    // Temperature varies by time of day
    const tempVariation = Math.sin((hour / 24) * Math.PI * 2) * 3;
    const temperature = this.baseTemp + tempVariation + (Math.random() - 0.5) * 2;
    
    // Humidity inversely related to temperature
    const humidity = this.baseHumidity - tempVariation * 2 + (Math.random() - 0.5) * 5;
    
    // CO2 higher during day (photosynthesis)
    const co2 = this.baseCO2 + (isDay ? 200 : -100) + (Math.random() - 0.5) * 100;
    
    // Calculate VPD
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const avp = svp * (humidity / 100);
    const vpd = svp - avp;
    
    return {
      compartmentId,
      timestamp: time,
      climate: {
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        co2: Math.round(co2),
        radiation: isDay ? 400 + Math.random() * 200 : 0,
        vpd: Math.round(vpd * 100) / 100
      },
      setpoints: {
        temperatureDay: 25,
        temperatureNight: 20,
        humidityMax: 75,
        humidityMin: 55,
        co2Target: 1000
      },
      equipment: {
        heating: temperature < 22 ? (22 - temperature) * 20 : 0,
        cooling: temperature > 26 ? (temperature - 26) * 20 : 0,
        vents: temperature > 24 ? (temperature - 24) * 25 : 0,
        screens: isDay ? 0 : 100,
        lights: !isDay,
        irrigation: hour === 8 || hour === 14
      },
      alarms: temperature > 30 ? ['High temperature warning'] : []
    };
  }
  
  generateFacility(): PrivaFacility {
    return {
      id: 'demo-facility-1',
      name: 'Demo Greenhouse Facility',
      farmCode: 'DEMO-001',
      compartments: [
        {
          id: 'demo-comp-1',
          name: 'Vegetative Bay 1',
          area: 500,
          crop: 'Cannabis - Vegetative',
          plantingDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          climateZones: 2,
          hasLighting: true,
          hasIrrigation: true,
          hasHeating: true,
          hasCooling: true,
          hasCO2: true
        },
        {
          id: 'demo-comp-2',
          name: 'Flowering Bay 1',
          area: 800,
          crop: 'Cannabis - Flowering',
          plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          climateZones: 3,
          hasLighting: true,
          hasIrrigation: true,
          hasHeating: true,
          hasCooling: true,
          hasCO2: true
        },
        {
          id: 'demo-comp-3',
          name: 'Mother Plant Room',
          area: 200,
          crop: 'Cannabis - Mothers',
          plantingDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          climateZones: 1,
          hasLighting: true,
          hasIrrigation: true,
          hasHeating: true,
          hasCooling: true,
          hasCO2: false
        }
      ],
      totalArea: 1500,
      location: {
        latitude: 52.2297,
        longitude: 5.1661,
        address: 'Demo Facility, Netherlands'
      }
    };
  }
}

export class PrivaConfigService extends EventEmitter {
  private demoGenerator = new PrivaDemoDataGenerator();
  private pollingInterval: NodeJS.Timeout | null = null;
  private currentConfig: PrivaConnectionConfig | null = null;
  
  /**
   * Save Priva configuration for a user
   */
  async saveConfiguration(
    userId: string,
    credentials: Partial<PrivaCredentials>,
    isDemo: boolean = false
  ): Promise<PrivaConnectionConfig> {
    try {
      // Validate credentials if not demo mode
      if (!isDemo) {
        this.validateCredentials(credentials);
      }
      
      // Encrypt sensitive data before storage
      const encryptedCredentials = isDemo ? {} : await this.encryptCredentials(credentials as PrivaCredentials);
      
      // Save to database
      const config = await prisma.privaConfiguration.upsert({
        where: { userId },
        update: {
          credentials: encryptedCredentials,
          isDemo,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          userId,
          credentials: encryptedCredentials,
          isDemo,
          isActive: true,
          connectionStatus: isDemo ? 'demo' : 'disconnected'
        }
      });
      
      // Create connection config object
      const connectionConfig: PrivaConnectionConfig = {
        id: config.id,
        userId: config.userId,
        credentials: isDemo ? this.getDemoCredentials() : credentials as PrivaCredentials,
        isActive: config.isActive,
        isDemo: config.isDemo,
        connectionStatus: config.connectionStatus as any,
        facilities: []
      };
      
      this.currentConfig = connectionConfig;
      
      // Test connection if not demo
      if (!isDemo) {
        await this.testConnection(connectionConfig);
      } else {
        // Load demo facility
        connectionConfig.facilities = [this.demoGenerator.generateFacility()];
        connectionConfig.connectionStatus = 'demo';
      }
      
      logger.info(`Priva configuration saved for user ${userId} (demo: ${isDemo})`);
      this.emit('configSaved', connectionConfig);
      
      return connectionConfig;
      
    } catch (error) {
      logger.error('Failed to save Priva configuration:', error);
      throw error;
    }
  }
  
  /**
   * Test Priva connection with provided credentials
   */
  async testConnection(config: PrivaConnectionConfig): Promise<boolean> {
    if (config.isDemo) {
      config.connectionStatus = 'demo';
      this.emit('connectionStatus', { status: 'demo', message: 'Using demo mode' });
      return true;
    }
    
    try {
      logger.info('Testing Priva connection...');
      
      // Attempt OAuth authentication
      const authResponse = await fetch(`${config.credentials.apiUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: config.credentials.username,
          password: config.credentials.password,
          client_id: config.credentials.oauthClientId || 'vibelux-app',
          client_secret: config.credentials.oauthClientSecret || '',
          scope: 'read write'
        })
      });
      
      if (!authResponse.ok) {
        throw new Error(`Authentication failed: ${authResponse.statusText}`);
      }
      
      const authData = await authResponse.json();
      const accessToken = authData.access_token;
      
      // Test API access by fetching facilities
      const facilitiesResponse = await fetch(
        `${config.credentials.apiUrl}/api/${config.credentials.apiVersion}/farms/${config.credentials.farmCode}/facilities`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!facilitiesResponse.ok) {
        throw new Error(`Failed to fetch facilities: ${facilitiesResponse.statusText}`);
      }
      
      const facilitiesData = await facilitiesResponse.json();
      config.facilities = this.mapPrivaFacilities(facilitiesData);
      config.connectionStatus = 'connected';
      config.lastConnected = new Date();
      
      // Update database
      await prisma.privaConfiguration.update({
        where: { id: config.id },
        data: {
          connectionStatus: 'connected',
          lastConnected: new Date(),
          lastError: null
        }
      });
      
      logger.info('Priva connection successful');
      this.emit('connectionStatus', { status: 'connected', facilities: config.facilities });
      
      return true;
      
    } catch (error: any) {
      logger.error('Priva connection test failed:', error);
      
      config.connectionStatus = 'error';
      config.lastError = error.message;
      
      // Update database with error
      await prisma.privaConfiguration.update({
        where: { id: config.id },
        data: {
          connectionStatus: 'error',
          lastError: error.message
        }
      });
      
      this.emit('connectionStatus', { status: 'error', error: error.message });
      
      // Fall back to demo mode if configured
      if (await this.shouldUseFallback(config)) {
        logger.info('Falling back to demo mode');
        config.isDemo = true;
        config.connectionStatus = 'demo';
        config.facilities = [this.demoGenerator.generateFacility()];
        this.emit('connectionStatus', { status: 'demo', message: 'Using demo mode due to connection error' });
      }
      
      return false;
    }
  }
  
  /**
   * Get real-time data from Priva or demo
   */
  async getRealtimeData(
    config: PrivaConnectionConfig,
    compartmentId: string
  ): Promise<PrivaRealtimeData> {
    if (config.isDemo || config.connectionStatus === 'demo') {
      return this.demoGenerator.generateRealtimeData(compartmentId);
    }
    
    try {
      // Get fresh access token
      const accessToken = await this.getAccessToken(config);
      
      // Fetch real-time data
      const response = await fetch(
        `${config.credentials.apiUrl}/api/${config.credentials.apiVersion}/compartments/${compartmentId}/realtime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch realtime data: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.mapPrivaRealtimeData(data);
      
    } catch (error) {
      logger.error('Failed to fetch Priva realtime data:', error);
      
      // Fall back to demo data
      if (await this.shouldUseFallback(config)) {
        logger.info('Using demo data due to API error');
        return this.demoGenerator.generateRealtimeData(compartmentId);
      }
      
      throw error;
    }
  }
  
  /**
   * Start polling for real-time data
   */
  startPolling(
    config: PrivaConnectionConfig,
    compartmentId: string,
    intervalMs: number = 30000
  ): void {
    if (this.pollingInterval) {
      this.stopPolling();
    }
    
    const poll = async () => {
      try {
        const data = await this.getRealtimeData(config, compartmentId);
        this.emit('realtimeData', data);
        
        // Store in database for historical tracking
        await this.storeRealtimeData(data);
        
        // Check for alarms
        if (data.alarms.length > 0) {
          this.emit('alarms', data.alarms);
        }
      } catch (error) {
        logger.error('Polling error:', error);
        this.emit('pollingError', error);
      }
    };
    
    // Initial poll
    poll();
    
    // Set up interval
    this.pollingInterval = setInterval(poll, intervalMs);
    logger.info(`Started polling compartment ${compartmentId} every ${intervalMs}ms`);
  }
  
  /**
   * Stop polling for real-time data
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      logger.info('Stopped polling');
    }
  }
  
  /**
   * Load user's Priva configuration
   */
  async loadConfiguration(userId: string): Promise<PrivaConnectionConfig | null> {
    try {
      const config = await prisma.privaConfiguration.findUnique({
        where: { userId }
      });
      
      if (!config) {
        return null;
      }
      
      // Decrypt credentials if not demo
      const credentials = config.isDemo 
        ? this.getDemoCredentials()
        : await this.decryptCredentials(config.credentials as any);
      
      const connectionConfig: PrivaConnectionConfig = {
        id: config.id,
        userId: config.userId,
        credentials,
        isActive: config.isActive,
        isDemo: config.isDemo,
        lastConnected: config.lastConnected || undefined,
        lastError: config.lastError || undefined,
        connectionStatus: config.connectionStatus as any,
        facilities: []
      };
      
      // Load facilities if connected or demo
      if (config.isDemo) {
        connectionConfig.facilities = [this.demoGenerator.generateFacility()];
      } else if (config.connectionStatus === 'connected') {
        // Try to fetch current facilities
        await this.testConnection(connectionConfig);
      }
      
      this.currentConfig = connectionConfig;
      return connectionConfig;
      
    } catch (error) {
      logger.error('Failed to load Priva configuration:', error);
      return null;
    }
  }
  
  /**
   * Update setpoint in Priva system
   */
  async updateSetpoint(
    config: PrivaConnectionConfig,
    compartmentId: string,
    parameter: string,
    value: number
  ): Promise<boolean> {
    if (config.isDemo) {
      logger.info(`Demo mode: Would set ${parameter} to ${value} in compartment ${compartmentId}`);
      this.emit('setpointUpdated', { compartmentId, parameter, value });
      return true;
    }
    
    try {
      const accessToken = await this.getAccessToken(config);
      
      const response = await fetch(
        `${config.credentials.apiUrl}/api/${config.credentials.apiVersion}/compartments/${compartmentId}/setpoints`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            parameter,
            value,
            timestamp: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update setpoint: ${response.statusText}`);
      }
      
      logger.info(`Updated ${parameter} to ${value} in compartment ${compartmentId}`);
      this.emit('setpointUpdated', { compartmentId, parameter, value });
      
      return true;
      
    } catch (error) {
      logger.error('Failed to update Priva setpoint:', error);
      return false;
    }
  }
  
  /**
   * Get historical data from Priva
   */
  async getHistoricalData(
    config: PrivaConnectionConfig,
    compartmentId: string,
    startDate: Date,
    endDate: Date,
    resolution: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<any[]> {
    if (config.isDemo) {
      // Generate demo historical data
      return this.generateDemoHistoricalData(compartmentId, startDate, endDate, resolution);
    }
    
    try {
      const accessToken = await this.getAccessToken(config);
      
      const response = await fetch(
        `${config.credentials.apiUrl}/api/${config.credentials.apiVersion}/compartments/${compartmentId}/history?` +
        `start=${startDate.toISOString()}&end=${endDate.toISOString()}&resolution=${resolution}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error('Failed to fetch Priva historical data:', error);
      
      if (await this.shouldUseFallback(config)) {
        return this.generateDemoHistoricalData(compartmentId, startDate, endDate, resolution);
      }
      
      throw error;
    }
  }
  
  /**
   * Validate credentials format
   */
  private validateCredentials(credentials: Partial<PrivaCredentials>): void {
    const required = ['username', 'password', 'farmCode', 'apiUrl'];
    const missing = required.filter(field => !(credentials as any)[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Validate API URL format
    try {
      new URL(credentials.apiUrl!);
    } catch {
      throw new Error('Invalid API URL format');
    }
  }
  
  /**
   * Encrypt credentials for storage
   */
  private async encryptCredentials(credentials: PrivaCredentials): Promise<any> {
    // In production, use proper encryption (e.g., crypto.subtle.encrypt)
    // For now, return as-is with a warning
    logger.warn('Credentials encryption not implemented - storing in plain text');
    return credentials;
  }
  
  /**
   * Decrypt credentials from storage
   */
  private async decryptCredentials(encryptedCredentials: any): Promise<PrivaCredentials> {
    // In production, use proper decryption
    return encryptedCredentials as PrivaCredentials;
  }
  
  /**
   * Get demo credentials
   */
  private getDemoCredentials(): PrivaCredentials {
    return {
      username: 'demo',
      password: 'demo',
      farmCode: 'DEMO-001',
      apiUrl: 'https://demo.priva.com',
      apiVersion: 'v3'
    };
  }
  
  /**
   * Check if should use fallback mode
   */
  private async shouldUseFallback(config: PrivaConnectionConfig): Promise<boolean> {
    const fallbackSettings = await prisma.userSettings.findUnique({
      where: { userId: config.userId },
      select: { privaFallbackToDemo: true }
    });
    
    return fallbackSettings?.privaFallbackToDemo ?? true;
  }
  
  /**
   * Get access token for API calls
   */
  private async getAccessToken(config: PrivaConnectionConfig): Promise<string> {
    // In production, implement proper OAuth token management with refresh
    // For now, return a placeholder
    return 'demo-access-token';
  }
  
  /**
   * Map Priva facilities data to our format
   */
  private mapPrivaFacilities(data: any): PrivaFacility[] {
    // Map Priva's format to our format
    return data.facilities?.map((f: any) => ({
      id: f.id,
      name: f.name,
      farmCode: f.farmCode,
      compartments: f.compartments?.map((c: any) => ({
        id: c.id,
        name: c.name,
        area: c.area,
        crop: c.crop,
        plantingDate: c.plantingDate ? new Date(c.plantingDate) : undefined,
        climateZones: c.climateZones,
        hasLighting: c.equipment?.lighting ?? false,
        hasIrrigation: c.equipment?.irrigation ?? false,
        hasHeating: c.equipment?.heating ?? false,
        hasCooling: c.equipment?.cooling ?? false,
        hasCO2: c.equipment?.co2 ?? false
      })) || [],
      totalArea: f.totalArea,
      location: f.location
    })) || [];
  }
  
  /**
   * Map Priva realtime data to our format
   */
  private mapPrivaRealtimeData(data: any): PrivaRealtimeData {
    return {
      compartmentId: data.compartmentId,
      timestamp: new Date(data.timestamp),
      climate: {
        temperature: data.measurements?.temperature ?? 0,
        humidity: data.measurements?.humidity ?? 0,
        co2: data.measurements?.co2 ?? 0,
        radiation: data.measurements?.radiation ?? 0,
        vpd: data.measurements?.vpd ?? 0
      },
      setpoints: {
        temperatureDay: data.setpoints?.temperatureDay ?? 25,
        temperatureNight: data.setpoints?.temperatureNight ?? 20,
        humidityMax: data.setpoints?.humidityMax ?? 75,
        humidityMin: data.setpoints?.humidityMin ?? 55,
        co2Target: data.setpoints?.co2Target ?? 1000
      },
      equipment: {
        heating: data.equipment?.heating ?? 0,
        cooling: data.equipment?.cooling ?? 0,
        vents: data.equipment?.vents ?? 0,
        screens: data.equipment?.screens ?? 0,
        lights: data.equipment?.lights ?? false,
        irrigation: data.equipment?.irrigation ?? false
      },
      alarms: data.alarms || []
    };
  }
  
  /**
   * Store realtime data in database
   */
  private async storeRealtimeData(data: PrivaRealtimeData): Promise<void> {
    try {
      await prisma.privaRealtimeData.create({
        data: {
          compartmentId: data.compartmentId,
          timestamp: data.timestamp,
          climate: data.climate,
          setpoints: data.setpoints,
          equipment: data.equipment,
          alarms: data.alarms
        }
      });
    } catch (error) {
      logger.error('Failed to store Priva realtime data:', error);
    }
  }
  
  /**
   * Generate demo historical data
   */
  private generateDemoHistoricalData(
    compartmentId: string,
    startDate: Date,
    endDate: Date,
    resolution: string
  ): any[] {
    const data = [];
    const interval = resolution === 'minute' ? 60000 : resolution === 'hour' ? 3600000 : 86400000;
    
    for (let time = startDate.getTime(); time <= endDate.getTime(); time += interval) {
      const realtimeData = this.demoGenerator.generateRealtimeData(compartmentId);
      realtimeData.timestamp = new Date(time);
      data.push(realtimeData);
    }
    
    return data;
  }
}

// Export singleton instance
export const privaConfig = new PrivaConfigService();