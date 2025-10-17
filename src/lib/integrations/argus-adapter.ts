/**
 * Argus Titan Control System Adapter
 * Professional greenhouse automation integration
 * Used by major commercial growers worldwide
 */

import ControlSystemAdapter, { 
  ControlSystemConfig, 
  OptimizationCommand, 
  SystemStatus,
  ControlZone,
  ControlFixture,
  ControlSensor 
} from './control-system-adapters';
import { logger } from '../logging/production-logger';

interface ArgusCredentials {
  username: string;
  password: string;
  apiKey?: string;
}

interface ArgusZoneData {
  zoneId: string;
  sensors: {
    temperature: number;
    humidity: number;
    co2: number;
    par: number;
    ppfd: number;
  };
  lighting: {
    fixtures: ArgusFixture[];
    totalPower: number;
    averagePPFD: number;
    uniformity: number;
  };
  schedule: {
    currentProgram: string;
    timeRemaining: number;
    nextTransition: Date;
  };
  alarms: ArgusAlarm[];
}

interface ArgusFixture {
  id: string;
  name: string;
  type: string;
  location: [number, number];
  channels: {
    intensity: number;
    red: number;
    blue: number;
    white: number;
    farRed: number;
  };
  power: {
    current: number;
    rated: number;
    efficiency: number;
  };
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastUpdate: Date;
}

interface ArgusAlarm {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export class ArgusAdapter extends ControlSystemAdapter {
  private sessionToken?: string;
  private apiVersion = '2.1';
  private baseUrl: string;

  constructor(config: ControlSystemConfig) {
    super(config);
    this.baseUrl = config.endpoint;
  }

  async connect(): Promise<boolean> {
    try {
      logger.info('api', '🔌 Connecting to Argus Titan system...');
      
      const credentials = this.config.credentials as ArgusCredentials;
      
      // Authenticate with Argus API
      const authResponse = await this.makeHttpRequest('POST', '/api/auth/login', {
        username: credentials.username,
        password: credentials.password,
        version: this.apiVersion
      });

      this.sessionToken = authResponse.token;
      this.isConnected = true;

      // Verify system status
      const systemInfo = await this.getArgusSystemInfo();
      logger.info('api', `✅ Connected to Argus Titan v${systemInfo.version}`);
      logger.info('api', `📊 Monitoring ${systemInfo.zones} zones`);

      this.emit('connected', systemInfo);
      return true;

    } catch (error) {
      logger.error('api', '❌ Failed to connect to Argus Titan:', error );
      this.isConnected = false;
      this.emit('connectionError', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sessionToken) {
      try {
        await this.makeHttpRequest('POST', '/api/auth/logout', {}, {
          'Authorization': `Bearer ${this.sessionToken}`
        });
      } catch (error) {
        logger.warn('api', 'Warning during Argus disconnect:', { data: error  });
      }
    }

    this.sessionToken = undefined;
    this.isConnected = false;
    this.emit('disconnected');
    logger.info('api', '🔌 Disconnected from Argus Titan');
  }

  async readZoneData(zoneId: string): Promise<ArgusZoneData> {
    if (!this.isConnected || !this.sessionToken) {
      throw new Error('Not connected to Argus system');
    }

    try {
      // Get comprehensive zone data from Argus
      const [sensors, lighting, schedule, alarms] = await Promise.all([
        this.getZoneSensors(zoneId),
        this.getZoneLighting(zoneId),
        this.getZoneSchedule(zoneId),
        this.getZoneAlarms(zoneId)
      ]);

      return {
        zoneId,
        sensors,
        lighting,
        schedule,
        alarms
      };

    } catch (error) {
      logger.error('api', `Failed to read Argus zone data for ${zoneId}:`, error);
      throw error;
    }
  }

  private async getZoneSensors(zoneId: string) {
    const response = await this.makeHttpRequest('GET', `/api/zones/${zoneId}/sensors`, {}, {
      'Authorization': `Bearer ${this.sessionToken}`
    });

    return {
      temperature: response.temperature?.value || 0,
      humidity: response.humidity?.value || 0,
      co2: response.co2?.value || 400,
      par: response.par?.value || 0,
      ppfd: response.ppfd?.value || 0
    };
  }

  private async getZoneLighting(zoneId: string) {
    const response = await this.makeHttpRequest('GET', `/api/zones/${zoneId}/lighting`, {}, {
      'Authorization': `Bearer ${this.sessionToken}`
    });

    const fixtures: ArgusFixture[] = response.fixtures.map((f: any) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      location: [f.x, f.y],
      channels: {
        intensity: f.channels.find((c: any) => c.type === 'intensity')?.value || 0,
        red: f.channels.find((c: any) => c.type === 'red')?.value || 0,
        blue: f.channels.find((c: any) => c.type === 'blue')?.value || 0,
        white: f.channels.find((c: any) => c.type === 'white')?.value || 0,
        farRed: f.channels.find((c: any) => c.type === 'far_red')?.value || 0
      },
      power: {
        current: f.power?.current || 0,
        rated: f.power?.rated || 0,
        efficiency: f.power?.efficiency || 0
      },
      status: f.status || 'unknown',
      lastUpdate: new Date(f.lastUpdate)
    }));

    return {
      fixtures,
      totalPower: fixtures.reduce((sum, f) => sum + f.power.current, 0),
      averagePPFD: response.metrics?.averagePPFD || 0,
      uniformity: response.metrics?.uniformity || 0
    };
  }

  private async getZoneSchedule(zoneId: string) {
    const response = await this.makeHttpRequest('GET', `/api/zones/${zoneId}/schedule`, {}, {
      'Authorization': `Bearer ${this.sessionToken}`
    });

    return {
      currentProgram: response.currentProgram?.name || 'Unknown',
      timeRemaining: response.timeRemaining || 0,
      nextTransition: new Date(response.nextTransition || Date.now())
    };
  }

  private async getZoneAlarms(zoneId: string): Promise<ArgusAlarm[]> {
    const response = await this.makeHttpRequest('GET', `/api/zones/${zoneId}/alarms`, {}, {
      'Authorization': `Bearer ${this.sessionToken}`
    });

    return response.alarms?.map((a: any) => ({
      id: a.id,
      severity: a.severity,
      message: a.message,
      timestamp: new Date(a.timestamp),
      acknowledged: a.acknowledged
    })) || [];
  }

  async executeCommand(command: OptimizationCommand): Promise<boolean> {
    if (!this.isConnected || !this.sessionToken) {
      throw new Error('Not connected to Argus system');
    }

    try {
      logger.info('api', `🎛️ Executing Argus command for zone ${command.zoneId}`, { data: { fixture: command.fixtureId } });

      // Build Argus-specific command format
      const argusCommand = {
        fixtureId: command.fixtureId,
        channels: command.changes.map(change => ({
          channelId: change.channelId,
          value: change.newValue,
          transitionTime: change.transitionTime || 15,
          gradual: change.gradualTransition
        })),
        metadata: {
          source: 'VibeLux AI',
          reason: command.reason,
          confidence: command.confidence,
          reversible: command.reversible,
          timestamp: new Date().toISOString()
        }
      };

      // Execute command through Argus API
      const response = await this.makeHttpRequest('POST', `/api/lighting/command`, argusCommand, {
        'Authorization': `Bearer ${this.sessionToken}`,
        'X-VibeLux-Command': 'true'
      });

      if (response.success) {
        logger.info('api', `✅ Argus command executed successfully: ${command.reason}`);
        this.emit('commandExecuted', { command, response });
        return true;
      } else {
        logger.error('api', `❌ Argus command failed: ${response.error}`);
        this.emit('commandFailed', { command, error: response.error });
        return false;
      }

    } catch (error) {
      logger.error('api', 'Failed to execute Argus command:', error );
      this.emit('commandFailed', { command, error });
      return false;
    }
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
      const systemInfo = await this.getArgusSystemInfo();
      const allSavings = this.getSavingsReport();

      return {
        connected: true,
        lastUpdate: new Date(),
        totalZones: systemInfo.zones,
        activeOptimizations: this.lastOptimization.size,
        dailySavings: allSavings.dailyAvgSavings,
        monthlyProjection: allSavings.monthlyProjection,
        health: this.determineSystemHealth(systemInfo),
        issues: this.getSystemIssues(systemInfo)
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

  private async getArgusSystemInfo() {
    return await this.makeHttpRequest('GET', '/api/system/info', {}, {
      'Authorization': `Bearer ${this.sessionToken}`
    });
  }

  private determineSystemHealth(systemInfo: any): 'excellent' | 'good' | 'warning' | 'error' {
    const criticalAlarms = systemInfo.alarms?.filter((a: any) => a.severity === 'critical').length || 0;
    const warningAlarms = systemInfo.alarms?.filter((a: any) => a.severity === 'warning').length || 0;
    const offlineFixtures = systemInfo.fixtures?.filter((f: any) => f.status === 'offline').length || 0;

    if (criticalAlarms > 0 || offlineFixtures > systemInfo.fixtures * 0.1) {
      return 'error';
    }
    if (warningAlarms > 3 || offlineFixtures > 0) {
      return 'warning';
    }
    if (warningAlarms > 0) {
      return 'good';
    }
    return 'excellent';
  }

  private getSystemIssues(systemInfo: any): string[] {
    const issues: string[] = [];
    
    const criticalAlarms = systemInfo.alarms?.filter((a: any) => a.severity === 'critical') || [];
    const offlineFixtures = systemInfo.fixtures?.filter((f: any) => f.status === 'offline') || [];

    if (criticalAlarms.length > 0) {
      issues.push(`${criticalAlarms.length} critical alarms require attention`);
    }

    if (offlineFixtures.length > 0) {
      issues.push(`${offlineFixtures.length} fixtures are offline`);
    }

    const outdatedFixtures = systemInfo.fixtures?.filter((f: any) => 
      Date.now() - new Date(f.lastUpdate).getTime() > 10 * 60 * 1000
    ) || [];

    if (outdatedFixtures.length > 0) {
      issues.push(`${outdatedFixtures.length} fixtures have stale data (>10min)`);
    }

    return issues;
  }

  // Argus-specific optimization methods
  async scheduleOptimization(zoneId: string, schedule: {
    startTime: Date;
    endTime: Date;
    intensity: number;
    spectrum: { red: number; blue: number; white: number; farRed: number };
  }) {
    if (!this.isConnected || !this.sessionToken) {
      throw new Error('Not connected to Argus system');
    }

    try {
      const response = await this.makeHttpRequest('POST', `/api/zones/${zoneId}/schedule`, {
        programName: `VibeLux_Optimization_${Date.now()}`,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
        lighting: {
          intensity: schedule.intensity,
          spectrum: schedule.spectrum
        },
        metadata: {
          source: 'VibeLux AI',
          type: 'energy_optimization',
          created: new Date().toISOString()
        }
      }, {
        'Authorization': `Bearer ${this.sessionToken}`
      });

      logger.info('api', `📅 Scheduled optimization for zone ${zoneId}: ${schedule.startTime} - ${schedule.endTime}`);
      return response.programId;

    } catch (error) {
      logger.error('api', 'Failed to schedule Argus optimization:', error );
      throw error;
    }
  }

  async getPowerConsumption(zoneId: string, timeRange: { start: Date; end: Date }) {
    const response = await this.makeHttpRequest('GET', 
      `/api/zones/${zoneId}/power?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`, 
      {}, 
      { 'Authorization': `Bearer ${this.sessionToken}` }
    );

    return {
      totalKwh: response.totalKwh,
      averageKw: response.averageKw,
      peakKw: response.peakKw,
      costEstimate: response.totalKwh * 0.12, // Assume $0.12/kWh
      hourlyData: response.hourlyData
    };
  }

  // Emergency override for Argus systems
  async emergencyOverride(zoneId: string, action: 'reduce_50' | 'minimum_safe' | 'full_shutdown') {
    logger.info('api', `🚨 EMERGENCY OVERRIDE: ${action} for Argus zone ${zoneId}`);

    const overrideSettings = {
      reduce_50: { intensity: 50, reason: 'Emergency 50% power reduction' },
      minimum_safe: { intensity: 20, reason: 'Emergency minimum safe lighting' },
      full_shutdown: { intensity: 0, reason: 'Emergency full shutdown' }
    };

    const settings = overrideSettings[action];

    return await this.makeHttpRequest('POST', `/api/zones/${zoneId}/emergency`, {
      action,
      settings,
      override: true,
      timestamp: new Date().toISOString(),
      source: 'VibeLux Emergency System'
    }, {
      'Authorization': `Bearer ${this.sessionToken}`,
      'X-Emergency-Override': 'true'
    });
  }
}

export default ArgusAdapter;