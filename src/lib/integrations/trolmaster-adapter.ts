/**
 * TrolMaster Control System Adapter
 * Popular in cannabis and indoor farming operations
 * Specializes in environmental and lighting control
 */

import ControlSystemAdapter, { 
  ControlSystemConfig, 
  OptimizationCommand, 
  SystemStatus 
} from './control-system-adapters';
import { logger } from '../logging/production-logger';

interface TrolMasterCredentials {
  deviceId: string;
  accessKey: string;
  localIP?: string; // For local API access
}

interface TrolMasterRoom {
  id: string;
  name: string;
  type: 'veg' | 'flower' | 'clone' | 'dry' | 'mother';
  area: number;
  environment: {
    temperature: { value: number; unit: 'F' | 'C' };
    humidity: { value: number; unit: '%' };
    co2: { value: number; unit: 'ppm' };
    vpd: { value: number; unit: 'kPa' };
    dli: { value: number; unit: 'mol/m²/day' };
  };
  lighting: {
    devices: TrolMasterLightDevice[];
    totalPower: number;
    ppfd: number;
    schedule: TrolMasterSchedule;
    spectrum: TrolMasterSpectrum;
  };
  hvac: {
    ac: { status: boolean; temperature: number };
    heater: { status: boolean; temperature: number };
    dehumidifier: { status: boolean; humidity: number };
    humidifier: { status: boolean; humidity: number };
    exhaust: { status: boolean; speed: number };
  };
  alerts: TrolMasterAlert[];
}

interface TrolMasterLightDevice {
  id: string;
  name: string;
  type: 'led_bar' | 'led_panel' | 'hps' | 'cmh' | 'fluorescent';
  brand: string;
  model: string;
  power: {
    rated: number;
    current: number;
    percentage: number;
  };
  channels: {
    intensity: number;
    red: number;
    blue: number;
    white: number;
    uv: number;
    farRed: number;
  };
  position: {
    x: number;
    y: number;
    height: number; // inches above canopy
  };
  status: 'on' | 'off' | 'dimmed' | 'error' | 'maintenance';
  temperature: number; // fixture temperature in F
  runtime: number; // hours
}

interface TrolMasterSchedule {
  mode: 'timer' | 'sunrise_sunset' | 'dli_target' | 'custom';
  photoperiod: number; // hours
  currentCycle: {
    on: string; // HH:MM
    off: string; // HH:MM
    timeRemaining: number; // minutes
  };
  programs: {
    vegetative: { hours: number; intensity: number; spectrum: TrolMasterSpectrum };
    flowering: { hours: number; intensity: number; spectrum: TrolMasterSpectrum };
  };
}

interface TrolMasterSpectrum {
  red: number;
  blue: number;
  white: number;
  uv: number;
  farRed: number;
  green: number;
}

interface TrolMasterAlert {
  id: string;
  type: 'temperature' | 'humidity' | 'co2' | 'power' | 'lighting' | 'system';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  autoResolved: boolean;
}

export class TrolMasterAdapter extends ControlSystemAdapter {
  private deviceToken?: string;
  private localMode: boolean = false;
  private deviceId: string;
  private localIP?: string;

  constructor(config: ControlSystemConfig) {
    super(config);
    const credentials = config.credentials as TrolMasterCredentials;
    this.deviceId = credentials.deviceId;
    this.localIP = credentials.localIP;
    this.localMode = !!credentials.localIP;
  }

  async connect(): Promise<boolean> {
    try {
      logger.info('api', '🔌 Connecting to TrolMaster system...');
      
      const credentials = this.config.credentials as TrolMasterCredentials;
      
      if (this.localMode && this.localIP) {
        // Connect via local API (faster, more reliable)
        await this.connectLocal();
      } else {
        // Connect via cloud API
        await this.connectCloud(credentials);
      }

      // Verify device status
      const deviceInfo = await this.getDeviceInfo();
      logger.info('api', `✅ Connected to TrolMaster ${deviceInfo.model} v${deviceInfo.firmware}`);
      logger.info('api', `🏠 Rooms: ${deviceInfo.rooms}, Total devices: ${deviceInfo.totalDevices}`);

      this.emit('connected', deviceInfo);
      return true;

    } catch (error) {
      logger.error('api', '❌ Failed to connect to TrolMaster:', error );
      this.isConnected = false;
      this.emit('connectionError', error);
      return false;
    }
  }

  private async connectLocal() {
    // TrolMaster local API authentication
    const response = await fetch(`http://${this.localIP}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: this.deviceId,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`Local authentication failed: ${response.statusText}`);
    }

    const auth = await response.json();
    this.deviceToken = auth.token;
    this.isConnected = true;
    logger.info('api', '🏠 Connected via TrolMaster local API');
  }

  private async connectCloud(credentials: TrolMasterCredentials) {
    // TrolMaster cloud API authentication
    const response = await this.makeHttpRequest('POST', '/api/v2/auth/device', {
      deviceId: credentials.deviceId,
      accessKey: credentials.accessKey,
      clientType: 'VibeLux_Integration'
    });

    this.deviceToken = response.accessToken;
    this.isConnected = true;
    logger.info('api', '☁️ Connected via TrolMaster cloud API');
  }

  async disconnect(): Promise<void> {
    if (this.deviceToken) {
      try {
        if (this.localMode) {
          await fetch(`http://${this.localIP}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.deviceToken}` }
          });
        } else {
          await this.makeHttpRequest('POST', '/api/v2/auth/logout', {
            deviceId: this.deviceId
          }, {
            'Authorization': `Bearer ${this.deviceToken}`
          });
        }
      } catch (error) {
        logger.warn('api', 'Warning during TrolMaster disconnect:', { data: error  });
      }
    }

    this.deviceToken = undefined;
    this.isConnected = false;
    this.emit('disconnected');
    logger.info('api', '🔌 Disconnected from TrolMaster');
  }

  async readZoneData(roomId: string): Promise<TrolMasterRoom> {
    if (!this.isConnected || !this.deviceToken) {
      throw new Error('Not connected to TrolMaster system');
    }

    try {
      let response;
      
      if (this.localMode) {
        // Local API call (faster)
        const res = await fetch(`http://${this.localIP}/api/rooms/${roomId}/status`, {
          headers: { 'Authorization': `Bearer ${this.deviceToken}` }
        });
        response = await res.json();
      } else {
        // Cloud API call
        response = await this.makeHttpRequest('GET', 
          `/api/v2/devices/${this.deviceId}/rooms/${roomId}/status`, 
          {}, 
          { 'Authorization': `Bearer ${this.deviceToken}` }
        );
      }

      return this.parseTrolMasterRoomData(response);

    } catch (error) {
      logger.error('api', `Failed to read TrolMaster room data for ${roomId}:`, error);
      throw error;
    }
  }

  private parseTrolMasterRoomData(data: any): TrolMasterRoom {
    return {
      id: data.roomId,
      name: data.name,
      type: data.type || 'flower',
      area: data.area || 0,
      environment: {
        temperature: {
          value: data.sensors?.temperature?.value || 0,
          unit: data.sensors?.temperature?.unit || 'F'
        },
        humidity: {
          value: data.sensors?.humidity?.value || 0,
          unit: '%'
        },
        co2: {
          value: data.sensors?.co2?.value || 400,
          unit: 'ppm'
        },
        vpd: {
          value: data.sensors?.vpd?.value || 0,
          unit: 'kPa'
        },
        dli: {
          value: data.sensors?.dli?.value || 0,
          unit: 'mol/m²/day'
        }
      },
      lighting: {
        devices: data.lighting?.devices?.map(this.parseTrolMasterDevice) || [],
        totalPower: data.lighting?.totalPower || 0,
        ppfd: data.lighting?.ppfd || 0,
        schedule: this.parseTrolMasterSchedule(data.lighting?.schedule),
        spectrum: data.lighting?.spectrum || {}
      },
      hvac: {
        ac: data.hvac?.ac || { status: false, temperature: 0 },
        heater: data.hvac?.heater || { status: false, temperature: 0 },
        dehumidifier: data.hvac?.dehumidifier || { status: false, humidity: 0 },
        humidifier: data.hvac?.humidifier || { status: false, humidity: 0 },
        exhaust: data.hvac?.exhaust || { status: false, speed: 0 }
      },
      alerts: data.alerts?.map(this.parseTrolMasterAlert) || []
    };
  }

  private parseTrolMasterDevice(device: any): TrolMasterLightDevice {
    return {
      id: device.id,
      name: device.name,
      type: device.type || 'led_panel',
      brand: device.brand || 'Unknown',
      model: device.model || 'Unknown',
      power: {
        rated: device.power?.rated || 0,
        current: device.power?.current || 0,
        percentage: device.power?.percentage || 0
      },
      channels: {
        intensity: device.channels?.intensity || 0,
        red: device.channels?.red || 0,
        blue: device.channels?.blue || 0,
        white: device.channels?.white || 0,
        uv: device.channels?.uv || 0,
        farRed: device.channels?.farRed || 0
      },
      position: {
        x: device.position?.x || 0,
        y: device.position?.y || 0,
        height: device.position?.height || 18
      },
      status: device.status || 'off',
      temperature: device.temperature || 0,
      runtime: device.runtime || 0
    };
  }

  private parseTrolMasterSchedule(schedule: any): TrolMasterSchedule {
    return {
      mode: schedule?.mode || 'timer',
      photoperiod: schedule?.photoperiod || 12,
      currentCycle: {
        on: schedule?.currentCycle?.on || '06:00',
        off: schedule?.currentCycle?.off || '18:00',
        timeRemaining: schedule?.currentCycle?.timeRemaining || 0
      },
      programs: {
        vegetative: schedule?.programs?.vegetative || { hours: 18, intensity: 75, spectrum: {} },
        flowering: schedule?.programs?.flowering || { hours: 12, intensity: 100, spectrum: {} }
      }
    };
  }

  private parseTrolMasterAlert(alert: any): TrolMasterAlert {
    return {
      id: alert.id,
      type: alert.type || 'system',
      severity: alert.severity || 'info',
      message: alert.message || '',
      timestamp: new Date(alert.timestamp),
      acknowledged: alert.acknowledged || false,
      autoResolved: alert.autoResolved || false
    };
  }

  async executeCommand(command: OptimizationCommand): Promise<boolean> {
    if (!this.isConnected || !this.deviceToken) {
      throw new Error('Not connected to TrolMaster system');
    }

    try {
      logger.info('api', `🎛️ Executing TrolMaster command for room ${command.zoneId}`, { data: { device: command.fixtureId } });

      // Build TrolMaster command
      const trolCommand = {
        roomId: command.zoneId,
        deviceId: command.fixtureId,
        changes: command.changes.map(change => ({
          channel: change.channelId,
          value: change.newValue,
          transitionMinutes: change.transitionTime || 10,
          gradual: change.gradualTransition
        })),
        metadata: {
          source: 'VibeLux AI',
          reason: command.reason,
          confidence: command.confidence,
          timestamp: new Date().toISOString(),
          reversible: command.reversible
        }
      };

      let response;
      
      if (this.localMode) {
        // Execute via local API (faster)
        const res = await fetch(`http://${this.localIP}/api/lighting/control`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deviceToken}`
          },
          body: JSON.stringify(trolCommand)
        });
        response = await res.json();
      } else {
        // Execute via cloud API
        response = await this.makeHttpRequest('POST', 
          `/api/v2/devices/${this.deviceId}/control`, 
          trolCommand, 
          { 'Authorization': `Bearer ${this.deviceToken}` }
        );
      }

      if (response.success) {
        logger.info('api', `✅ TrolMaster optimization executed: ${command.reason}`);
        this.emit('commandExecuted', { command, response });
        return true;
      } else {
        logger.error('api', `❌ TrolMaster command failed: ${response.error}`);
        this.emit('commandFailed', { command, error: response.error });
        return false;
      }

    } catch (error) {
      logger.error('api', 'Failed to execute TrolMaster command:', error );
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
      const deviceInfo = await this.getDeviceInfo();
      const systemAlerts = await this.getSystemAlerts();
      const allSavings = this.getSavingsReport();

      return {
        connected: true,
        lastUpdate: new Date(),
        totalZones: deviceInfo.rooms,
        activeOptimizations: this.lastOptimization.size,
        dailySavings: allSavings.dailyAvgSavings,
        monthlyProjection: allSavings.monthlyProjection,
        health: this.determineTrolMasterHealth(systemAlerts),
        issues: this.getTrolMasterIssues(systemAlerts)
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

  private async getDeviceInfo() {
    if (this.localMode) {
      const res = await fetch(`http://${this.localIP}/api/device/info`, {
        headers: { 'Authorization': `Bearer ${this.deviceToken}` }
      });
      return await res.json();
    } else {
      return await this.makeHttpRequest('GET', 
        `/api/v2/devices/${this.deviceId}/info`, 
        {}, 
        { 'Authorization': `Bearer ${this.deviceToken}` }
      );
    }
  }

  private async getSystemAlerts() {
    if (this.localMode) {
      const res = await fetch(`http://${this.localIP}/api/alerts?active=true`, {
        headers: { 'Authorization': `Bearer ${this.deviceToken}` }
      });
      return await res.json();
    } else {
      return await this.makeHttpRequest('GET', 
        `/api/v2/devices/${this.deviceId}/alerts?active=true`, 
        {}, 
        { 'Authorization': `Bearer ${this.deviceToken}` }
      );
    }
  }

  private determineTrolMasterHealth(alerts: any): 'excellent' | 'good' | 'warning' | 'error' {
    const criticalAlerts = alerts.alerts?.filter((a: any) => a.severity === 'critical').length || 0;
    const warningAlerts = alerts.alerts?.filter((a: any) => a.severity === 'warning').length || 0;

    if (criticalAlerts > 0) return 'error';
    if (warningAlerts > 3) return 'warning';
    if (warningAlerts > 0) return 'good';
    return 'excellent';
  }

  private getTrolMasterIssues(alerts: any): string[] {
    const issues: string[] = [];
    
    const criticalAlerts = alerts.alerts?.filter((a: any) => a.severity === 'critical') || [];
    const warningAlerts = alerts.alerts?.filter((a: any) => a.severity === 'warning') || [];

    if (criticalAlerts.length > 0) {
      issues.push(`${criticalAlerts.length} critical alerts need immediate attention`);
    }

    if (warningAlerts.length > 0) {
      issues.push(`${warningAlerts.length} warning alerts`);
    }

    return issues;
  }

  // TrolMaster-specific optimization for cannabis cultivation
  async optimizeForCannabis(roomId: string, stage: 'clone' | 'veg' | 'flower', week: number) {
    const roomData = await this.readZoneData(roomId);
    
    // Cannabis-specific optimization profiles by stage and week
    const profiles = {
      clone: {
        ppfd: 150,
        photoperiod: 18,
        spectrum: { red: 20, blue: 50, white: 25, uv: 0, farRed: 5 },
        vpd: 0.6
      },
      veg: {
        weeks: {
          1: { ppfd: 300, spectrum: { red: 30, blue: 40, white: 25, uv: 0, farRed: 5 } },
          2: { ppfd: 400, spectrum: { red: 35, blue: 35, white: 25, uv: 0, farRed: 5 } },
          3: { ppfd: 500, spectrum: { red: 40, blue: 30, white: 25, uv: 2, farRed: 3 } },
          4: { ppfd: 600, spectrum: { red: 45, blue: 25, white: 25, uv: 3, farRed: 2 } }
        },
        photoperiod: 18,
        vpd: 0.8
      },
      flower: {
        weeks: {
          1: { ppfd: 700, spectrum: { red: 60, blue: 20, white: 15, uv: 3, farRed: 2 } },
          2: { ppfd: 800, spectrum: { red: 65, blue: 15, white: 15, uv: 3, farRed: 2 } },
          3: { ppfd: 900, spectrum: { red: 70, blue: 10, white: 15, uv: 3, farRed: 2 } },
          4: { ppfd: 900, spectrum: { red: 70, blue: 10, white: 15, uv: 3, farRed: 2 } },
          5: { ppfd: 850, spectrum: { red: 68, blue: 12, white: 15, uv: 3, farRed: 2 } },
          6: { ppfd: 800, spectrum: { red: 65, blue: 15, white: 15, uv: 3, farRed: 2 } },
          7: { ppfd: 750, spectrum: { red: 60, blue: 20, white: 15, uv: 3, farRed: 2 } },
          8: { ppfd: 700, spectrum: { red: 55, blue: 25, white: 15, uv: 3, farRed: 2 } }
        },
        photoperiod: 12,
        vpd: 1.0
      }
    };

    let profile;
    if (stage === 'clone') {
      profile = profiles.clone;
    } else {
      const stageProfile = profiles[stage as 'veg' | 'flower'];
      const weekProfile = stageProfile.weeks[week as keyof typeof stageProfile.weeks];
      profile = {
        ...weekProfile,
        photoperiod: stageProfile.photoperiod,
        vpd: stageProfile.vpd
      };
    }

    if (!profile) {
      throw new Error(`Invalid cannabis stage/week combination: ${stage} week ${week}`);
    }

    logger.info('api', `🌿 Optimizing cannabis room ${roomId} for ${stage} stage`, { data: { week: week } });

    return await this.optimizeZone(roomId, {
      targetPPFD: profile.ppfd,
      photoperiod: profile.photoperiod,
      spectrum: profile.spectrum,
      vpd: profile.vpd,
      cannabisStage: stage,
      cannabisWeek: week
    });
  }

  // TrolMaster environmental integration
  async optimizeWithEnvironment(roomId: string) {
    const roomData = await this.readZoneData(roomId);
    
    // Factor in current environmental conditions
    const temp = roomData.environment.temperature.value;
    const humidity = roomData.environment.humidity.value;
    const co2 = roomData.environment.co2.value;
    const vpd = roomData.environment.vpd.value;

    const adjustments = [];

    // Temperature-based adjustments
    if (temp > 85) { // Too hot
      adjustments.push('Reduce light intensity by 15% to lower heat load');
    } else if (temp < 75) { // Too cool
      adjustments.push('Increase light intensity by 10% to raise temperature');
    }

    // VPD-based adjustments
    if (vpd > 1.2) { // Too high VPD (plant stress)
      adjustments.push('Reduce light intensity to lower transpiration');
    } else if (vpd < 0.6) { // Too low VPD (slow growth)
      adjustments.push('Increase light intensity to boost transpiration');
    }

    // CO2-based adjustments
    if (co2 > 1000) { // High CO2, can handle more light
      adjustments.push('Increase light intensity to maximize CO2 utilization');
    }

    const environmentalPrompt = `
    TrolMaster environmental optimization for room ${roomData.name}:
    
    Current conditions:
    - Temperature: ${temp}°F
    - Humidity: ${humidity}%
    - CO2: ${co2} ppm
    - VPD: ${vpd} kPa
    - Current PPFD: ${roomData.lighting.ppfd}
    
    Room type: ${roomData.type}
    Suggested adjustments: ${adjustments.join(', ')}
    
    Optimize lighting to work with these environmental conditions for maximum efficiency and plant health.
    `;

    return await this.optimizeZone(roomId, {
      environmentalOptimization: true,
      currentEnvironment: roomData.environment,
      suggestions: adjustments
    });
  }

  // Power monitoring and demand response
  async getDemandResponse(roomId: string, maxPowerKw: number) {
    const roomData = await this.readZoneData(roomId);
    const currentPower = roomData.lighting.totalPower / 1000; // Convert to kW
    
    if (currentPower <= maxPowerKw) {
      return { needed: false, currentPower, maxPower: maxPowerKw };
    }

    const reductionNeeded = ((currentPower - maxPowerKw) / currentPower) * 100;
    
    logger.info('api', `⚡ Demand response needed: Reduce ${reductionNeeded.toFixed(1)}% power in room ${roomId}`);

    // Create demand response command
    const commands = roomData.lighting.devices.map(device => ({
      zoneId: roomId,
      fixtureId: device.id,
      changes: [{
        channelId: 'intensity',
        newValue: Math.max(20, device.channels.intensity * (1 - reductionNeeded / 100)),
        gradualTransition: true,
        transitionTime: 5 // Quick transition for demand response
      }],
      reason: `Demand response: Power limit ${maxPowerKw}kW exceeded`,
      confidence: 1.0,
      estimatedSavings: (currentPower - maxPowerKw) * 24, // kWh saved per day
      reversible: true
    }));

    // Execute demand response
    for (const command of commands) {
      await this.executeCommand(command);
    }

    return {
      needed: true,
      reductionPercent: reductionNeeded,
      currentPower,
      maxPower: maxPowerKw,
      commandsExecuted: commands.length
    };
  }
}

export default TrolMasterAdapter;