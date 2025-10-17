/**
 * Blackout Curtain and Screen Control System
 * Provides comprehensive control for multi-layer greenhouse screens including
 * blackout, shade, thermal, and energy screens with photoperiod management
 */

import { EventEmitter } from 'events';

// Screen types with light transmission properties
export enum ScreenType {
  BLACKOUT = 'blackout',           // 0% light transmission
  SHADE = 'shade',                 // 30-70% light transmission
  THERMAL = 'thermal',             // 85% light transmission, energy saving
  ENERGY = 'energy',               // 75% light transmission, heat retention
  INSECT = 'insect',              // 90% light transmission, pest exclusion
  HAIL = 'hail'                   // 95% light transmission, weather protection
}

// Screen layer positions
export enum ScreenLayer {
  UPPER = 'upper',                 // Top layer (usually thermal/energy)
  MIDDLE = 'middle',               // Middle layer (shade/blackout)
  LOWER = 'lower',                 // Bottom layer (additional shade/blackout)
  SIDEWALL = 'sidewall'            // Sidewall screens
}

// Deployment states
export enum DeploymentState {
  RETRACTED = 'retracted',         // 0% deployed
  DEPLOYING = 'deploying',         // In motion
  PARTIAL = 'partial',             // 1-99% deployed
  DEPLOYED = 'deployed',           // 100% deployed
  RETRACTING = 'retracting',       // In motion
  ERROR = 'error',                 // Error state
  MAINTENANCE = 'maintenance'       // Maintenance mode
}

// Screen configuration
export interface ScreenConfig {
  id: string;
  name: string;
  type: ScreenType;
  layer: ScreenLayer;
  zone?: string;                   // Optional zone assignment
  lightTransmission: number;       // 0-100%
  energySavings: number;           // 0-100% heat retention
  deploymentSpeed: number;         // seconds for full deployment
  motorType: 'servo' | 'stepper' | 'dc';
  maxPosition: number;             // Maximum deployment percentage
  safetyFeatures: {
    windSpeedLimit: number;        // m/s - auto retract above this
    rainSensor: boolean;           // Auto deploy on rain
    snowLoadLimit: number;         // kg/m² - auto retract
    temperatureLimit: number;      // °C - prevent deployment above
  };
}

// Screen status
export interface ScreenStatus {
  id: string;
  currentPosition: number;         // 0-100%
  targetPosition: number;          // 0-100%
  state: DeploymentState;
  lastUpdate: Date;
  motorTemp: number;               // °C
  errorCode?: string;
  maintenanceRequired: boolean;
}

// Photoperiod configuration
export interface PhotoperiodConfig {
  id: string;
  name: string;
  cropType: string;
  growthStage: 'vegetative' | 'flowering' | 'fruiting';
  schedule: DaylightSchedule[];
  blackoutRequired: boolean;
  lightDeprivation: {
    enabled: boolean;
    startTime: string;             // HH:MM format
    duration: number;              // hours
    gradualTransition: boolean;    // Gradual deployment
    transitionMinutes: number;     // Minutes for transition
  };
  darkPeriodProtection: {
    enabled: boolean;
    alertOnBreach: boolean;
    maxAllowedLux: number;         // Maximum light during dark
    emergencyOverride: boolean;    // Allow emergency lighting
  };
}

// Daily schedule entry
export interface DaylightSchedule {
  dayOfWeek: number;              // 0-6 (Sunday-Saturday)
  periods: LightPeriod[];
}

// Light period definition
export interface LightPeriod {
  startTime: string;               // HH:MM format
  endTime: string;                 // HH:MM format
  targetPAR: number;               // μmol/m²/s
  screenOverrides?: {
    [screenId: string]: number;    // Position override 0-100%
  };
}

// Multi-layer coordination
export interface LayerCoordination {
  priority: ScreenLayer[];         // Deployment order
  conflictResolution: 'override' | 'blend' | 'priority';
  delayBetweenLayers: number;      // Seconds
  synchronizedMovement: boolean;
}

// Deployment strategy
export interface DeploymentStrategy {
  mode: 'immediate' | 'gradual' | 'staged' | 'weather-based';
  speed: 'slow' | 'normal' | 'fast';
  checkpoints: number[];           // Pause at these positions
  weatherOverrides: {
    highWind: 'retract' | 'hold' | 'deploy';
    rain: 'deploy' | 'hold' | 'retract';
    snow: 'retract' | 'hold';
    highTemp: 'deploy' | 'partial' | 'retract';
  };
}

// Alert configuration
export interface AlertConfig {
  darkPeriodBreach: boolean;
  motorOverheat: boolean;
  positionMismatch: boolean;
  maintenanceReminder: boolean;
  weatherOverride: boolean;
}

export class BlackoutCurtainController extends EventEmitter {
  private screens: Map<string, ScreenConfig> = new Map();
  private screenStatus: Map<string, ScreenStatus> = new Map();
  private photoperiods: Map<string, PhotoperiodConfig> = new Map();
  private activeSchedules: Map<string, NodeJS.Timeout> = new Map();
  private layerCoordination: LayerCoordination;
  private alertConfig: AlertConfig;
  private lightSensorData: Map<string, number> = new Map(); // zone -> lux

  constructor() {
    super();
    
    // Default layer coordination
    this.layerCoordination = {
      priority: [ScreenLayer.UPPER, ScreenLayer.MIDDLE, ScreenLayer.LOWER],
      conflictResolution: 'priority',
      delayBetweenLayers: 5,
      synchronizedMovement: false
    };

    // Default alert configuration
    this.alertConfig = {
      darkPeriodBreach: true,
      motorOverheat: true,
      positionMismatch: true,
      maintenanceReminder: true,
      weatherOverride: true
    };

    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Register a new screen/curtain
   */
  registerScreen(config: ScreenConfig): void {
    this.screens.set(config.id, config);
    this.screenStatus.set(config.id, {
      id: config.id,
      currentPosition: 0,
      targetPosition: 0,
      state: DeploymentState.RETRACTED,
      lastUpdate: new Date(),
      motorTemp: 25,
      maintenanceRequired: false
    });

    this.emit('screen:registered', config);
  }

  /**
   * Deploy screen to specific position
   */
  async deployScreen(
    screenId: string, 
    position: number, 
    strategy?: DeploymentStrategy
  ): Promise<void> {
    const screen = this.screens.get(screenId);
    const status = this.screenStatus.get(screenId);

    if (!screen || !status) {
      throw new Error(`Screen ${screenId} not found`);
    }

    // Validate position
    position = Math.max(0, Math.min(position, screen.maxPosition));

    // Check safety conditions
    const safetyCheck = await this.performSafetyCheck(screen);
    if (!safetyCheck.safe) {
      this.emit('deployment:blocked', {
        screenId,
        reason: safetyCheck.reason,
        conditions: safetyCheck.conditions
      });
      
      if (!safetyCheck.override) {
        throw new Error(`Deployment blocked: ${safetyCheck.reason}`);
      }
    }

    // Update status
    status.targetPosition = position;
    status.state = position > status.currentPosition 
      ? DeploymentState.DEPLOYING 
      : DeploymentState.RETRACTING;

    // Calculate deployment time
    const positionDelta = Math.abs(position - status.currentPosition);
    const deploymentTime = (positionDelta / 100) * screen.deploymentSpeed * 1000;

    // Apply deployment strategy
    if (strategy?.mode === 'gradual') {
      await this.gradualDeployment(screenId, position, deploymentTime);
    } else if (strategy?.mode === 'staged') {
      await this.stagedDeployment(screenId, position, strategy.checkpoints || []);
    } else {
      await this.immediateDeployment(screenId, position, deploymentTime);
    }
  }

  /**
   * Deploy multiple screens with coordination
   */
  async deployMultipleScreens(
    deployments: Array<{ screenId: string; position: number }>,
    coordination?: LayerCoordination
  ): Promise<void> {
    const coord = coordination || this.layerCoordination;
    
    // Group by layer
    const layerGroups = new Map<ScreenLayer, typeof deployments>();
    
    for (const deployment of deployments) {
      const screen = this.screens.get(deployment.screenId);
      if (screen) {
        const layer = screen.layer;
        if (!layerGroups.has(layer)) {
          layerGroups.set(layer, []);
        }
        layerGroups.get(layer)!.push(deployment);
      }
    }

    // Deploy according to priority
    for (const layer of coord.priority) {
      const group = layerGroups.get(layer);
      if (group) {
        if (coord.synchronizedMovement) {
          // Deploy all screens in this layer simultaneously
          await Promise.all(
            group.map(d => this.deployScreen(d.screenId, d.position))
          );
        } else {
          // Deploy sequentially
          for (const deployment of group) {
            await this.deployScreen(deployment.screenId, deployment.position);
          }
        }
        
        // Delay between layers
        if (coord.delayBetweenLayers > 0) {
          await new Promise(resolve => 
            setTimeout(resolve, coord.delayBetweenLayers * 1000)
          );
        }
      }
    }
  }

  /**
   * Configure photoperiod schedule
   */
  configurePhotoperiod(config: PhotoperiodConfig): void {
    this.photoperiods.set(config.id, config);
    
    // Cancel existing schedule
    const existingSchedule = this.activeSchedules.get(config.id);
    if (existingSchedule) {
      clearInterval(existingSchedule);
    }

    // Start new schedule
    if (config.blackoutRequired || config.lightDeprivation.enabled) {
      this.startPhotoperiodSchedule(config);
    }

    this.emit('photoperiod:configured', config);
  }

  /**
   * Start photoperiod schedule monitoring
   */
  private startPhotoperiodSchedule(config: PhotoperiodConfig): void {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Find current day's schedule
      const daySchedule = config.schedule.find(s => s.dayOfWeek === dayOfWeek);
      if (!daySchedule) return;

      // Check if we're in a light or dark period
      let inLightPeriod = false;
      let currentPeriod: LightPeriod | null = null;

      for (const period of daySchedule.periods) {
        if (this.isTimeInPeriod(currentTime, period.startTime, period.endTime)) {
          inLightPeriod = true;
          currentPeriod = period;
          break;
        }
      }

      // Handle light deprivation
      if (config.lightDeprivation.enabled) {
        const deprivationActive = this.isTimeInPeriod(
          currentTime,
          config.lightDeprivation.startTime,
          this.addHoursToTime(config.lightDeprivation.startTime, config.lightDeprivation.duration)
        );

        if (deprivationActive) {
          this.enforceBlackout(config, 'light-deprivation');
        }
      }

      // Handle dark period
      if (!inLightPeriod && config.blackoutRequired) {
        this.enforceBlackout(config, 'dark-period');
      } else if (inLightPeriod && currentPeriod) {
        this.retractBlackout(config, currentPeriod);
      }

      // Check dark period integrity
      if (!inLightPeriod && config.darkPeriodProtection.enabled) {
        this.checkDarkPeriodIntegrity(config);
      }
    }, 60000); // Check every minute

    this.activeSchedules.set(config.id, checkInterval);
  }

  /**
   * Enforce blackout conditions
   */
  private async enforceBlackout(
    config: PhotoperiodConfig, 
    reason: 'dark-period' | 'light-deprivation'
  ): Promise<void> {
    // Find all blackout screens
    const blackoutScreens = Array.from(this.screens.values())
      .filter(s => s.type === ScreenType.BLACKOUT);

    // Deploy blackout screens
    const deployments = blackoutScreens.map(screen => ({
      screenId: screen.id,
      position: 100
    }));

    if (config.lightDeprivation.gradualTransition) {
      // Gradual deployment
      const strategy: DeploymentStrategy = {
        mode: 'gradual',
        speed: 'slow',
        checkpoints: [25, 50, 75],
        weatherOverrides: {
          highWind: 'hold',
          rain: 'deploy',
          snow: 'hold',
          highTemp: 'deploy'
        }
      };

      for (const deployment of deployments) {
        await this.deployScreen(
          deployment.screenId, 
          deployment.position, 
          strategy
        );
      }
    } else {
      await this.deployMultipleScreens(deployments);
    }

    this.emit('blackout:enforced', { 
      config, 
      reason, 
      screens: deployments 
    });
  }

  /**
   * Retract blackout screens
   */
  private async retractBlackout(
    config: PhotoperiodConfig,
    period: LightPeriod
  ): Promise<void> {
    // Find all blackout screens
    const blackoutScreens = Array.from(this.screens.values())
      .filter(s => s.type === ScreenType.BLACKOUT);

    // Prepare retractions
    const deployments = blackoutScreens.map(screen => ({
      screenId: screen.id,
      position: period.screenOverrides?.[screen.id] || 0
    }));

    await this.deployMultipleScreens(deployments);

    this.emit('blackout:retracted', { 
      config, 
      period, 
      screens: deployments 
    });
  }

  /**
   * Check dark period integrity
   */
  private checkDarkPeriodIntegrity(config: PhotoperiodConfig): void {
    const zones = new Set<string>();
    
    // Get all zones with blackout screens
    this.screens.forEach(screen => {
      if (screen.type === ScreenType.BLACKOUT && screen.zone) {
        zones.add(screen.zone);
      }
    });

    // Check light levels in each zone
    zones.forEach(zone => {
      const lightLevel = this.lightSensorData.get(zone) || 0;
      
      if (lightLevel > config.darkPeriodProtection.maxAllowedLux) {
        const breach = {
          zone,
          lightLevel,
          maxAllowed: config.darkPeriodProtection.maxAllowedLux,
          timestamp: new Date()
        };

        if (config.darkPeriodProtection.alertOnBreach) {
          this.emit('darkperiod:breach', breach);
        }

        // Attempt to correct
        this.correctDarkPeriodBreach(zone, config);
      }
    });
  }

  /**
   * Correct dark period breach
   */
  private async correctDarkPeriodBreach(
    zone: string, 
    config: PhotoperiodConfig
  ): Promise<void> {
    // Find screens for this zone
    const zoneScreens = Array.from(this.screens.values())
      .filter(s => s.zone === zone && s.type === ScreenType.BLACKOUT);

    // Check current positions
    const underDeployed = zoneScreens.filter(screen => {
      const status = this.screenStatus.get(screen.id);
      return status && status.currentPosition < 100;
    });

    // Deploy any under-deployed screens
    if (underDeployed.length > 0) {
      const deployments = underDeployed.map(screen => ({
        screenId: screen.id,
        position: 100
      }));

      await this.deployMultipleScreens(deployments);
      
      this.emit('darkperiod:corrected', {
        zone,
        screens: deployments,
        config
      });
    }
  }

  /**
   * Perform safety checks before deployment
   */
  private async performSafetyCheck(screen: ScreenConfig): Promise<{
    safe: boolean;
    reason?: string;
    conditions?: any;
    override?: boolean;
  }> {
    const conditions: any = {};

    // Get current weather conditions (mock for now)
    const weather = await this.getCurrentWeather();
    conditions.weather = weather;

    // Wind speed check
    if (weather.windSpeed > screen.safetyFeatures.windSpeedLimit) {
      return {
        safe: false,
        reason: `Wind speed (${weather.windSpeed} m/s) exceeds limit`,
        conditions,
        override: false
      };
    }

    // Temperature check
    if (weather.temperature > screen.safetyFeatures.temperatureLimit) {
      return {
        safe: false,
        reason: `Temperature (${weather.temperature}°C) exceeds limit`,
        conditions,
        override: true // Can be overridden
      };
    }

    // Snow load check (if applicable)
    if (weather.snowLoad > screen.safetyFeatures.snowLoadLimit) {
      return {
        safe: false,
        reason: `Snow load (${weather.snowLoad} kg/m²) exceeds limit`,
        conditions,
        override: false
      };
    }

    return { safe: true, conditions };
  }

  /**
   * Gradual deployment implementation
   */
  private async gradualDeployment(
    screenId: string,
    targetPosition: number,
    totalTime: number
  ): Promise<void> {
    const status = this.screenStatus.get(screenId)!;
    const startPosition = status.currentPosition;
    const positionDelta = targetPosition - startPosition;
    const steps = 20; // Number of steps
    const stepTime = totalTime / steps;
    const stepSize = positionDelta / steps;

    for (let i = 1; i <= steps; i++) {
      status.currentPosition = startPosition + (stepSize * i);
      
      if (i === steps) {
        status.currentPosition = targetPosition;
        status.state = targetPosition === 0 
          ? DeploymentState.RETRACTED 
          : targetPosition === 100 
          ? DeploymentState.DEPLOYED 
          : DeploymentState.PARTIAL;
      }

      this.emit('screen:position', {
        screenId,
        position: status.currentPosition,
        targetPosition,
        state: status.state
      });

      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
  }

  /**
   * Staged deployment with checkpoints
   */
  private async stagedDeployment(
    screenId: string,
    targetPosition: number,
    checkpoints: number[]
  ): Promise<void> {
    const sortedCheckpoints = [...checkpoints, targetPosition].sort((a, b) => a - b);
    
    for (const checkpoint of sortedCheckpoints) {
      if (checkpoint <= targetPosition) {
        await this.deployScreen(screenId, checkpoint);
        
        // Pause at checkpoint
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Immediate deployment
   */
  private async immediateDeployment(
    screenId: string,
    targetPosition: number,
    deploymentTime: number
  ): Promise<void> {
    const status = this.screenStatus.get(screenId)!;
    
    // Simulate deployment
    setTimeout(() => {
      status.currentPosition = targetPosition;
      status.state = targetPosition === 0 
        ? DeploymentState.RETRACTED 
        : targetPosition === 100 
        ? DeploymentState.DEPLOYED 
        : DeploymentState.PARTIAL;

      this.emit('screen:position', {
        screenId,
        position: status.currentPosition,
        targetPosition,
        state: status.state
      });
    }, deploymentTime);

    await new Promise(resolve => setTimeout(resolve, deploymentTime));
  }

  /**
   * Update light sensor data
   */
  updateLightSensor(zone: string, lux: number): void {
    this.lightSensorData.set(zone, lux);
  }

  /**
   * Get current weather (mock implementation)
   */
  private async getCurrentWeather(): Promise<any> {
    // In real implementation, this would fetch from weather API
    return {
      temperature: 25,
      windSpeed: 5,
      rain: false,
      snowLoad: 0,
      humidity: 65
    };
  }

  /**
   * Check if time is within period
   */
  private isTimeInPeriod(
    currentTime: string, 
    startTime: string, 
    endTime: string
  ): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (end > start) {
      return current >= start && current < end;
    } else {
      // Handles overnight periods
      return current >= start || current < end;
    }
  }

  /**
   * Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Add hours to time string
   */
  private addHoursToTime(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + (hours * 60);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Start system monitoring
   */
  private startMonitoring(): void {
    setInterval(() => {
      // Monitor motor temperatures
      this.screenStatus.forEach((status, screenId) => {
        if (status.state === DeploymentState.DEPLOYING || 
            status.state === DeploymentState.RETRACTING) {
          // Simulate motor heating
          status.motorTemp += 0.5;
          
          if (status.motorTemp > 70 && this.alertConfig.motorOverheat) {
            this.emit('motor:overheat', {
              screenId,
              temperature: status.motorTemp
            });
          }
        } else {
          // Cool down
          status.motorTemp = Math.max(25, status.motorTemp - 0.2);
        }
      });

      // Check maintenance schedules
      const now = Date.now();
      this.screens.forEach((screen, screenId) => {
        const status = this.screenStatus.get(screenId)!;
        const lastMaintenance = status.lastUpdate.getTime();
        const daysSinceMaintenance = (now - lastMaintenance) / (1000 * 60 * 60 * 24);
        
        if (daysSinceMaintenance > 90 && !status.maintenanceRequired) {
          status.maintenanceRequired = true;
          
          if (this.alertConfig.maintenanceReminder) {
            this.emit('maintenance:required', {
              screenId,
              screen,
              daysSinceMaintenance
            });
          }
        }
      });
    }, 5000); // Check every 5 seconds
  }

  /**
   * Get all screen statuses
   */
  getAllStatuses(): Map<string, ScreenStatus> {
    return new Map(this.screenStatus);
  }

  /**
   * Get screens by type
   */
  getScreensByType(type: ScreenType): ScreenConfig[] {
    return Array.from(this.screens.values())
      .filter(screen => screen.type === type);
  }

  /**
   * Emergency retract all screens
   */
  async emergencyRetract(reason: string): Promise<void> {
    this.emit('emergency:retract', { reason, timestamp: new Date() });
    
    const deployments = Array.from(this.screens.keys()).map(screenId => ({
      screenId,
      position: 0
    }));

    // Use immediate deployment for emergency
    for (const deployment of deployments) {
      await this.deployScreen(deployment.screenId, deployment.position, {
        mode: 'immediate',
        speed: 'fast',
        checkpoints: [],
        weatherOverrides: {
          highWind: 'retract',
          rain: 'retract',
          snow: 'retract',
          highTemp: 'retract'
        }
      });
    }
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    // Clear all schedules
    this.activeSchedules.forEach(schedule => clearInterval(schedule));
    this.activeSchedules.clear();
    
    // Remove all listeners
    this.removeAllListeners();
  }
}

// Cannabis-specific flowering automation helper
export class CannabisFloweringAutomation {
  private controller: BlackoutCurtainController;
  private currentStage: 'vegetative' | 'flowering' = 'vegetative';
  private transitionDate?: Date;

  constructor(controller: BlackoutCurtainController) {
    this.controller = controller;
  }

  /**
   * Configure vegetative stage (18/6 or 24/0)
   */
  configureVegetativeStage(
    lightHours: 18 | 24,
    zones: string[]
  ): PhotoperiodConfig {
    const config: PhotoperiodConfig = {
      id: 'cannabis-veg',
      name: 'Cannabis Vegetative Stage',
      cropType: 'cannabis',
      growthStage: 'vegetative',
      schedule: this.generateWeeklySchedule(lightHours),
      blackoutRequired: false,
      lightDeprivation: {
        enabled: false,
        startTime: '',
        duration: 0,
        gradualTransition: false,
        transitionMinutes: 0
      },
      darkPeriodProtection: {
        enabled: lightHours === 18,
        alertOnBreach: true,
        maxAllowedLux: 0.1,
        emergencyOverride: false
      }
    };

    this.controller.configurePhotoperiod(config);
    this.currentStage = 'vegetative';
    
    return config;
  }

  /**
   * Configure flowering stage (12/12)
   */
  configureFloweringStage(zones: string[]): PhotoperiodConfig {
    const config: PhotoperiodConfig = {
      id: 'cannabis-flower',
      name: 'Cannabis Flowering Stage',
      cropType: 'cannabis',
      growthStage: 'flowering',
      schedule: this.generateWeeklySchedule(12),
      blackoutRequired: true,
      lightDeprivation: {
        enabled: true,
        startTime: '18:00',
        duration: 12,
        gradualTransition: true,
        transitionMinutes: 30
      },
      darkPeriodProtection: {
        enabled: true,
        alertOnBreach: true,
        maxAllowedLux: 0.01, // Very strict for flowering
        emergencyOverride: false
      }
    };

    this.controller.configurePhotoperiod(config);
    this.currentStage = 'flowering';
    this.transitionDate = new Date();
    
    return config;
  }

  /**
   * Automated transition from veg to flower
   */
  async automatedTransition(
    fromVegDays: number,
    zones: string[]
  ): Promise<void> {
    // Schedule transition
    const transitionDelay = fromVegDays * 24 * 60 * 60 * 1000;
    
    setTimeout(() => {
      this.configureFloweringStage(zones);
      
      this.controller.emit('cannabis:flowering-initiated', {
        zones,
        transitionDate: new Date(),
        vegDays: fromVegDays
      });
    }, transitionDelay);
  }

  /**
   * Generate weekly schedule
   */
  private generateWeeklySchedule(lightHours: number): DaylightSchedule[] {
    const schedule: DaylightSchedule[] = [];
    
    for (let day = 0; day < 7; day++) {
      schedule.push({
        dayOfWeek: day,
        periods: [{
          startTime: '06:00',
          endTime: this.addHours('06:00', lightHours),
          targetPAR: 800 // μmol/m²/s for cannabis
        }]
      });
    }
    
    return schedule;
  }

  /**
   * Add hours to time
   */
  private addHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    const newHour = (h + hours) % 24;
    return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}

// Export singleton instance
export const blackoutController = new BlackoutCurtainController();
export const cannabisAutomation = new CannabisFloweringAutomation(blackoutController);