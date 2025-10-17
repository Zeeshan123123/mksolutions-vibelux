/**
 * Priva Control System Adapter
 * Dutch greenhouse automation leader
 * Used by major commercial tomato, cucumber, and cannabis operations
 */

import ControlSystemAdapter, { 
  ControlSystemConfig, 
  OptimizationCommand, 
  SystemStatus 
} from './control-system-adapters';
import { logger } from '../logging/production-logger';

interface PrivaCredentials {
  username: string;
  password: string;
  farmCode: string;
  apiKey?: string;
}

interface PrivaCompartment {
  id: string;
  name: string;
  crop: string;
  area: number;
  climate: {
    temperature: number;
    humidity: number;
    co2: number;
    radiation: number; // W/m²
  };
  lighting: {
    groups: PrivaLightGroup[];
    totalPower: number;
    ppfd: number;
    photoperiod: number;
  };
  irrigation: {
    ec: number;
    ph: number;
    lastWatering: Date;
  };
  setpoints: PrivaSetpoints;
}

interface PrivaLightGroup {
  id: string;
  name: string;
  fixtures: number;
  power: {
    rated: number;
    current: number;
    percentage: number;
  };
  spectrum: {
    red: number;
    blue: number;
    white: number;
    farRed: number;
  };
  schedule: {
    on: string;
    off: string;
    dimming: PrivaDimmingProfile[];
  };
  status: 'on' | 'off' | 'dimmed' | 'error';
}

interface PrivaDimmingProfile {
  time: string;
  percentage: number;
  spectrum?: Partial<PrivaLightGroup['spectrum']>;
}

interface PrivaSetpoints {
  temperature: { day: number; night: number };
  humidity: { max: number; min: number };
  co2: { target: number; minimum: number };
  lighting: { 
    ppfd: number; 
    photoperiod: number;
    maxPower: number;
  };
  irrigation: {
    frequency: number;
    volume: number;
    ec: { min: number; max: number };
    ph: { min: number; max: number };
  };
}

export class PrivaAdapter extends ControlSystemAdapter {
  private sessionId?: string;
  private farmCode: string;
  private apiVersion = '3.2';
  private baseUrl: string;

  constructor(config: ControlSystemConfig) {
    super(config);
    this.baseUrl = config.endpoint;
    this.farmCode = (config.credentials as PrivaCredentials).farmCode;
  }

  async connect(): Promise<boolean> {
    try {
      logger.info('api', '🔌 Connecting to Priva system...');
      
      const credentials = this.config.credentials as PrivaCredentials;
      
      // Authenticate with Priva API
      const authResponse = await this.makeHttpRequest('POST', '/api/v3/auth/login', {
        username: credentials.username,
        password: credentials.password,
        farmCode: credentials.farmCode,
        clientType: 'VibeLux',
        version: this.apiVersion
      });

      this.sessionId = authResponse.sessionId;
      this.isConnected = true;

      // Get farm information
      const farmInfo = await this.getFarmInfo();
      logger.info('api', `✅ Connected to Priva farm: ${farmInfo.name}`);
      logger.info('api', `🏠 Compartments: ${farmInfo.compartments}, Total area: ${farmInfo.totalArea} m²`);

      this.emit('connected', farmInfo);
      return true;

    } catch (error) {
      logger.error('api', '❌ Failed to connect to Priva:', error );
      this.isConnected = false;
      this.emit('connectionError', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sessionId) {
      try {
        await this.makeHttpRequest('POST', '/api/v3/auth/logout', {
          sessionId: this.sessionId
        });
      } catch (error) {
        logger.warn('api', 'Warning during Priva disconnect:', { data: error  });
      }
    }

    this.sessionId = undefined;
    this.isConnected = false;
    this.emit('disconnected');
    logger.info('api', '🔌 Disconnected from Priva');
  }

  async readZoneData(compartmentId: string): Promise<PrivaCompartment> {
    if (!this.isConnected || !this.sessionId) {
      throw new Error('Not connected to Priva system');
    }

    try {
      // Priva uses "compartments" instead of zones
      const response = await this.makeHttpRequest('GET', 
        `/api/v3/farms/${this.farmCode}/compartments/${compartmentId}/status`, 
        {}, 
        { 'X-Session-ID': this.sessionId }
      );

      return this.parsePrivaCompartmentData(response);

    } catch (error) {
      logger.error('api', `Failed to read Priva compartment data for ${compartmentId}:`, error);
      throw error;
    }
  }

  private parsePrivaCompartmentData(data: any): PrivaCompartment {
    return {
      id: data.compartmentId,
      name: data.name,
      crop: data.crop?.type || 'Unknown',
      area: data.area || 0,
      climate: {
        temperature: data.climate?.temperature?.current || 0,
        humidity: data.climate?.humidity?.current || 0,
        co2: data.climate?.co2?.current || 400,
        radiation: data.climate?.radiation?.current || 0
      },
      lighting: {
        groups: data.lighting?.groups?.map(this.parsePrivaLightGroup) || [],
        totalPower: data.lighting?.totalPower || 0,
        ppfd: data.lighting?.ppfd || 0,
        photoperiod: data.lighting?.photoperiod || 0
      },
      irrigation: {
        ec: data.irrigation?.ec?.current || 0,
        ph: data.irrigation?.ph?.current || 0,
        lastWatering: new Date(data.irrigation?.lastWatering || Date.now())
      },
      setpoints: this.parsePrivaSetpoints(data.setpoints)
    };
  }

  private parsePrivaLightGroup(group: any): PrivaLightGroup {
    return {
      id: group.id,
      name: group.name,
      fixtures: group.fixtureCount || 0,
      power: {
        rated: group.power?.rated || 0,
        current: group.power?.current || 0,
        percentage: group.power?.percentage || 0
      },
      spectrum: {
        red: group.spectrum?.red || 0,
        blue: group.spectrum?.blue || 0,
        white: group.spectrum?.white || 0,
        farRed: group.spectrum?.farRed || 0
      },
      schedule: {
        on: group.schedule?.on || '06:00',
        off: group.schedule?.off || '22:00',
        dimming: group.schedule?.dimming || []
      },
      status: group.status || 'off'
    };
  }

  private parsePrivaSetpoints(setpoints: any): PrivaSetpoints {
    return {
      temperature: {
        day: setpoints?.temperature?.day || 24,
        night: setpoints?.temperature?.night || 18
      },
      humidity: {
        max: setpoints?.humidity?.max || 85,
        min: setpoints?.humidity?.min || 65
      },
      co2: {
        target: setpoints?.co2?.target || 800,
        minimum: setpoints?.co2?.minimum || 400
      },
      lighting: {
        ppfd: setpoints?.lighting?.ppfd || 400,
        photoperiod: setpoints?.lighting?.photoperiod || 16,
        maxPower: setpoints?.lighting?.maxPower || 1000
      },
      irrigation: {
        frequency: setpoints?.irrigation?.frequency || 3,
        volume: setpoints?.irrigation?.volume || 100,
        ec: {
          min: setpoints?.irrigation?.ec?.min || 1.8,
          max: setpoints?.irrigation?.ec?.max || 2.2
        },
        ph: {
          min: setpoints?.irrigation?.ph?.min || 5.5,
          max: setpoints?.irrigation?.ph?.max || 6.5
        }
      }
    };
  }

  async executeCommand(command: OptimizationCommand): Promise<boolean> {
    if (!this.isConnected || !this.sessionId) {
      throw new Error('Not connected to Priva system');
    }

    try {
      logger.info('api', `🎛️ Executing Priva command for compartment ${command.zoneId}`, { data: { group: command.fixtureId } });

      // Convert VibeLux command to Priva format
      const privaCommand = {
        compartmentId: command.zoneId,
        lightGroupId: command.fixtureId,
        changes: command.changes.map(change => ({
          parameter: this.mapChannelToPriva(change.channelId),
          value: change.newValue,
          transitionMinutes: change.transitionTime || 15,
          gradual: change.gradualTransition
        })),
        metadata: {
          source: 'VibeLux AI Optimization',
          reason: command.reason,
          confidence: command.confidence,
          timestamp: new Date().toISOString(),
          reversible: command.reversible
        }
      };

      const response = await this.makeHttpRequest('POST', 
        `/api/v3/farms/${this.farmCode}/lighting/optimize`, 
        privaCommand, 
        { 'X-Session-ID': this.sessionId }
      );

      if (response.success) {
        logger.info('api', `✅ Priva optimization executed: ${command.reason}`);
        this.emit('commandExecuted', { command, response });
        return true;
      } else {
        logger.error('api', `❌ Priva command failed: ${response.error}`);
        this.emit('commandFailed', { command, error: response.error });
        return false;
      }

    } catch (error) {
      logger.error('api', 'Failed to execute Priva command:', error );
      this.emit('commandFailed', { command, error });
      return false;
    }
  }

  private mapChannelToPriva(channelId: string): string {
    const mapping: Record<string, string> = {
      'intensity': 'lightIntensity',
      'red': 'redSpectrum',
      'blue': 'blueSpectrum', 
      'white': 'whiteSpectrum',
      'far_red': 'farRedSpectrum',
      'uv': 'uvSpectrum'
    };
    return mapping[channelId] || channelId;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    if (!this.isConnected) {
      return {
        connected: false,
        lastUpdate: new Date(),
        totalZones: 0,
        activeOptimizations: 0,
        dailySavings: 0,
        monthlyProjection: 0,
        health: 'error',
        issues: ['System not connected']
      };
    }

    try {
      const farmInfo = await this.getFarmInfo();
      const systemAlarms = await this.getSystemAlarms();
      const allSavings = this.getSavingsReport();

      return {
        connected: true,
        lastUpdate: new Date(),
        totalZones: farmInfo.compartments,
        activeOptimizations: this.lastOptimization.size,
        dailySavings: allSavings.dailyAvgSavings,
        monthlyProjection: allSavings.monthlyProjection,
        health: this.determinePrivaHealth(systemAlarms),
        issues: this.getPrivaIssues(systemAlarms)
      };

    } catch (error) {
      return {
        connected: false,
        lastUpdate: new Date(),
        totalZones: 0,
        activeOptimizations: 0,
        dailySavings: 0,
        monthlyProjection: 0,
        health: 'error',
        issues: [`System status check failed: ${error}`]
      };
    }
  }

  private async getFarmInfo() {
    return await this.makeHttpRequest('GET', 
      `/api/v3/farms/${this.farmCode}/info`, 
      {}, 
      { 'X-Session-ID': this.sessionId }
    );
  }

  private async getSystemAlarms() {
    return await this.makeHttpRequest('GET', 
      `/api/v3/farms/${this.farmCode}/alarms?active=true`, 
      {}, 
      { 'X-Session-ID': this.sessionId }
    );
  }

  private determinePrivaHealth(alarms: any): 'excellent' | 'good' | 'warning' | 'error' {
    const criticalAlarms = alarms.alarms?.filter((a: any) => a.priority === 'critical').length || 0;
    const highAlarms = alarms.alarms?.filter((a: any) => a.priority === 'high').length || 0;

    if (criticalAlarms > 0) return 'error';
    if (highAlarms > 2) return 'warning';
    if (highAlarms > 0) return 'good';
    return 'excellent';
  }

  private getPrivaIssues(alarms: any): string[] {
    const issues: string[] = [];
    
    const criticalAlarms = alarms.alarms?.filter((a: any) => a.priority === 'critical') || [];
    const highAlarms = alarms.alarms?.filter((a: any) => a.priority === 'high') || [];

    if (criticalAlarms.length > 0) {
      issues.push(`${criticalAlarms.length} critical alarms need immediate attention`);
    }

    if (highAlarms.length > 0) {
      issues.push(`${highAlarms.length} high priority alarms`);
    }

    // Check for specific Priva system issues
    const lightingAlarms = alarms.alarms?.filter((a: any) => 
      a.category === 'lighting' || a.description?.toLowerCase().includes('light')
    ) || [];

    if (lightingAlarms.length > 0) {
      issues.push(`${lightingAlarms.length} lighting system alarms`);
    }

    return issues;
  }

  // Priva-specific optimization methods
  async optimizeForCrop(compartmentId: string, cropStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting') {
    const compartmentData = await this.readZoneData(compartmentId);
    
    // Crop-specific optimization profiles
    const profiles = {
      seedling: {
        ppfd: 200,
        photoperiod: 18,
        spectrum: { red: 30, blue: 40, white: 20, farRed: 10 }
      },
      vegetative: {
        ppfd: 400,
        photoperiod: 18,
        spectrum: { red: 40, blue: 35, white: 20, farRed: 5 }
      },
      flowering: {
        ppfd: 600,
        photoperiod: 12,
        spectrum: { red: 60, blue: 20, white: 15, farRed: 5 }
      },
      fruiting: {
        ppfd: 500,
        photoperiod: 14,
        spectrum: { red: 50, blue: 25, white: 20, farRed: 5 }
      }
    };

    const profile = profiles[cropStage];
    
    // Create optimization command using Claude AI
    const optimizationGoals = {
      targetPPFD: profile.ppfd,
      photoperiod: profile.photoperiod,
      spectrum: profile.spectrum,
      cropStage,
      energyEfficiency: true
    };

    return await this.optimizeZone(compartmentId, optimizationGoals);
  }

  async scheduleEnergyOptimization(compartmentId: string, schedule: {
    peakHours: { start: string; end: string };
    offPeakReduction: number; // percentage
    demandResponseEnabled: boolean;
  }) {
    try {
      const response = await this.makeHttpRequest('POST', 
        `/api/v3/farms/${this.farmCode}/compartments/${compartmentId}/energy-schedule`, 
        {
          schedule: {
            peakHours: schedule.peakHours,
            offPeakReduction: schedule.offPeakReduction,
            demandResponse: schedule.demandResponseEnabled,
            optimizationType: 'vibelux_energy',
            created: new Date().toISOString()
          },
          metadata: {
            source: 'VibeLux Energy Optimizer',
            version: '2.0'
          }
        }, 
        { 'X-Session-ID': this.sessionId }
      );

      logger.info('api', `⚡ Energy optimization scheduled for compartment ${compartmentId}`);
      return response;

    } catch (error) {
      logger.error('api', 'Failed to schedule Priva energy optimization:', error );
      throw error;
    }
  }

  async getEnergyConsumption(compartmentId: string, period: 'hour' | 'day' | 'week' | 'month') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'hour':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const response = await this.makeHttpRequest('GET', 
      `/api/v3/farms/${this.farmCode}/compartments/${compartmentId}/energy?` +
      `start=${startDate.toISOString()}&end=${endDate.toISOString()}&period=${period}`, 
      {}, 
      { 'X-Session-ID': this.sessionId }
    );

    return {
      totalKwh: response.totalKwh,
      averageKw: response.averageKw,
      peakKw: response.peakKw,
      costEstimate: response.totalKwh * 0.12, // European energy rates
      efficiency: response.totalKwh / (response.cropArea * response.days), // kWh/m²/day
      breakdown: {
        lighting: response.breakdown?.lighting || 0,
        heating: response.breakdown?.heating || 0,
        cooling: response.breakdown?.cooling || 0,
        other: response.breakdown?.other || 0
      }
    };
  }

  // Climate integration for optimal lighting
  async integrateClimateOptimization(compartmentId: string) {
    const compartmentData = await this.readZoneData(compartmentId);
    
    // Use current climate conditions to optimize lighting
    const climatePrompt = `
    Current greenhouse conditions:
    - Temperature: ${compartmentData.climate.temperature}°C
    - Humidity: ${compartmentData.climate.humidity}%
    - CO2: ${compartmentData.climate.co2} ppm
    - Current radiation: ${compartmentData.climate.radiation} W/m²
    - Current PPFD: ${compartmentData.lighting.ppfd} μmol/m²/s
    
    Crop: ${compartmentData.crop}
    
    Optimize lighting to work synergistically with climate control for maximum efficiency.
    Consider DLI targets, energy costs, and plant stress prevention.
    `;

    return await this.optimizeZone(compartmentId, { 
      climateIntegrated: true,
      currentClimate: compartmentData.climate 
    });
  }

  // Emergency shutdown for Priva (common in EU greenhouse operations)
  async emergencyClimateResponse(compartmentId: string, trigger: 'high_temp' | 'power_limit' | 'system_failure') {
    logger.info('api', `🚨 EMERGENCY CLIMATE RESPONSE: ${trigger} for Priva compartment ${compartmentId}`);

    const emergencyActions = {
      high_temp: {
        lightingReduction: 70, // Reduce to 30%
        reason: 'Emergency temperature control - reducing heat load',
        priority: 'immediate'
      },
      power_limit: {
        lightingReduction: 50, // Reduce to 50%
        reason: 'Peak demand management - temporary power reduction',
        priority: 'high'
      },
      system_failure: {
        lightingReduction: 80, // Reduce to 20%
        reason: 'System failure protection - minimum safe operation',
        priority: 'critical'
      }
    };

    const action = emergencyActions[trigger];

    return await this.makeHttpRequest('POST', 
      `/api/v3/farms/${this.farmCode}/compartments/${compartmentId}/emergency`, 
      {
        trigger,
        action: {
          type: 'lighting_reduction',
          percentage: action.lightingReduction,
          reason: action.reason,
          priority: action.priority,
          source: 'VibeLux Emergency System',
          timestamp: new Date().toISOString()
        }
      }, 
      { 
        'X-Session-ID': this.sessionId,
        'X-Emergency': 'true'
      }
    );
  }
}

export default PrivaAdapter;