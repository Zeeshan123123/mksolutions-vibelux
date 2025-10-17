/**
 * Integration between Blackout Curtain Control and Greenhouse Automation Rules Engine
 * Provides seamless coordination between the two systems
 */

import { 
  blackoutController, 
  BlackoutCurtainController,
  ScreenType,
  ScreenConfig,
  DeploymentStrategy
} from './blackout-curtain-control';
import { 
  GreenhouseAutomationEngine, 
  Rule, 
  Action,
  SensorData,
  Actuator,
  RULE_TEMPLATES
} from '../greenhouse-automation-rules';

export class BlackoutAutomationIntegration {
  private automationEngine: GreenhouseAutomationEngine;
  private blackoutController: BlackoutCurtainController;
  private actuatorMapping: Map<string, string> = new Map(); // actuatorId -> screenId

  constructor(
    automationEngine: GreenhouseAutomationEngine,
    blackoutController: BlackoutCurtainController
  ) {
    this.automationEngine = automationEngine;
    this.blackoutController = blackoutController;
    
    this.setupIntegration();
  }

  /**
   * Setup integration between systems
   */
  private setupIntegration(): void {
    // Register blackout screens as actuators in the automation engine
    this.registerBlackoutActuators();
    
    // Listen to automation engine actions
    this.setupActionHandlers();
    
    // Setup sensor data forwarding
    this.setupSensorForwarding();
    
    // Import blackout-specific rules
    this.importBlackoutRules();
  }

  /**
   * Register all blackout screens as actuators
   */
  private registerBlackoutActuators(): void {
    // Get all screen types
    const screenTypes = [
      ScreenType.BLACKOUT,
      ScreenType.SHADE,
      ScreenType.THERMAL,
      ScreenType.ENERGY
    ];

    screenTypes.forEach(type => {
      const screens = this.blackoutController.getScreensByType(type);
      screens.forEach(screen => {
        const actuatorId = this.screenToActuatorId(screen);
        
        // Map actuator ID to screen ID
        this.actuatorMapping.set(actuatorId, screen.id);
        
        // Register actuator with automation engine
        this.automationEngine.registerActuator({
          id: actuatorId,
          type: this.getActuatorType(screen.type),
          state: 'auto',
          value: 0,
          lastChange: new Date(),
          screenLayer: screen.layer
        });
      });
    });
  }

  /**
   * Convert screen config to actuator ID
   */
  private screenToActuatorId(screen: ScreenConfig): string {
    return `${screen.type}_${screen.layer}_${screen.zone || 'all'}`.replace(/\s+/g, '_');
  }

  /**
   * Get actuator type from screen type
   */
  private getActuatorType(screenType: ScreenType): string {
    switch (screenType) {
      case ScreenType.BLACKOUT:
        return 'blackout';
      case ScreenType.SHADE:
        return 'shade';
      case ScreenType.THERMAL:
        return 'thermal_screen';
      case ScreenType.ENERGY:
        return 'energy_screen';
      default:
        return 'shade';
    }
  }

  /**
   * Setup handlers for automation actions
   */
  private setupActionHandlers(): void {
    // Override the automation engine's execute action method
    const originalExecuteAction = this.automationEngine.executeAction.bind(this.automationEngine);
    
    this.automationEngine.executeAction = async (action: Action) => {
      // Check if this is a screen-related action
      const screenId = this.actuatorMapping.get(action.actuatorId);
      
      if (screenId) {
        // This is a screen action, handle it
        await this.handleScreenAction(screenId, action);
      } else {
        // Not a screen action, use original handler
        originalExecuteAction(action);
      }
    };
  }

  /**
   * Handle screen-related actions from automation engine
   */
  private async handleScreenAction(screenId: string, action: Action): Promise<void> {
    let targetPosition = 0;
    
    switch (action.command) {
      case 'on':
        targetPosition = 100;
        break;
      
      case 'off':
        targetPosition = 0;
        break;
      
      case 'set':
        targetPosition = action.value || 0;
        break;
      
      case 'increment':
        const currentStatus = this.blackoutController.getAllStatuses().get(screenId);
        targetPosition = Math.min(100, (currentStatus?.currentPosition || 0) + (action.value || 10));
        break;
      
      case 'decrement':
        const status = this.blackoutController.getAllStatuses().get(screenId);
        targetPosition = Math.max(0, (status?.currentPosition || 0) - (action.value || 10));
        break;
    }

    // Create deployment strategy based on action parameters
    const strategy: DeploymentStrategy = {
      mode: action.rampTime ? 'gradual' : 'immediate',
      speed: 'normal',
      checkpoints: [],
      weatherOverrides: {
        highWind: 'hold',
        rain: 'deploy',
        snow: 'retract',
        highTemp: 'deploy'
      }
    };

    // Deploy the screen
    await this.blackoutController.deployScreen(screenId, targetPosition, strategy);
  }

  /**
   * Setup sensor data forwarding
   */
  private setupSensorForwarding(): void {
    // Listen to light sensor updates from blackout controller
    this.blackoutController.on('sensor:light', (data: { zone: string; lux: number }) => {
      // Update light sensor data for the zone
      this.blackoutController.updateLightSensor(data.zone, data.lux);
    });

    // Listen to dark period breaches
    this.blackoutController.on('darkperiod:breach', (breach: any) => {
      // Create emergency rule to correct breach
      const emergencyRule: Rule = {
        id: `emergency_breach_${Date.now()}`,
        name: 'Emergency Dark Period Correction',
        description: `Correcting light breach in ${breach.zone}`,
        enabled: true,
        priority: 25, // Highest priority
        conditions: [
          {
            type: 'sensor',
            parameter: 'lightLevel',
            operator: '>',
            value: breach.maxAllowed
          }
        ],
        actions: [
          {
            actuatorId: `blackout_screen_${breach.zone}`,
            command: 'set',
            value: 100
          }
        ]
      };

      // Temporarily add emergency rule
      this.automationEngine.addRule(emergencyRule);
      
      // Remove after 5 minutes
      setTimeout(() => {
        this.automationEngine.removeRule(emergencyRule.id);
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Import blackout-specific rules from templates
   */
  private importBlackoutRules(): void {
    // Import rule templates from greenhouse-automation-rules
    const ruleTemplates = [
      'blackout_photoperiod',
      'light_deprivation_schedule',
      'dark_period_breach',
      'thermal_screen_night',
      'weather_screen_deploy',
      'multi_layer_summer',
      'multi_layer_winter'
    ];

    ruleTemplates.forEach(templateId => {
      // The automation engine should have these templates available
      // This would require updating the automation engine to expose templates
    });
  }

  /**
   * Update sensor data in automation engine
   */
  updateSensorData(sensorData: SensorData): void {
    // Forward to automation engine for rule evaluation
    const actions = this.automationEngine.evaluateRules(sensorData);
    
    // Actions are automatically handled by our overridden executeAction method
  }

  /**
   * Create custom rule for specific photoperiod
   */
  createPhotoperiodRule(
    cropType: string,
    lightHours: number,
    startTime: string,
    zones: string[]
  ): Rule {
    const endHour = (parseInt(startTime.split(':')[0]) + lightHours) % 24;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    return {
      id: `photoperiod_${cropType}_${Date.now()}`,
      name: `${cropType} Photoperiod Control`,
      description: `${lightHours} hour photoperiod starting at ${startTime}`,
      enabled: true,
      priority: 15,
      conditions: [
        {
          type: 'time',
          parameter: 'current',
          operator: 'outside',
          value: [startTime, endTime]
        }
      ],
      actions: zones.map(zone => ({
        actuatorId: `blackout_middle_${zone}`,
        command: 'set' as const,
        value: 100,
        rampTime: 30
      }))
    };
  }

  /**
   * Create weather-based screen coordination rule
   */
  createWeatherCoordinationRule(
    tempThreshold: number,
    lightThreshold: number,
    screenPositions: { [screenType: string]: number }
  ): Rule {
    const actions: Action[] = [];
    
    Object.entries(screenPositions).forEach(([screenType, position]) => {
      const screens = this.blackoutController.getScreensByType(screenType as ScreenType);
      screens.forEach(screen => {
        actions.push({
          actuatorId: this.screenToActuatorId(screen),
          command: 'set',
          value: position,
          rampTime: 10
        });
      });
    });

    return {
      id: `weather_coordination_${Date.now()}`,
      name: 'Weather-Based Screen Coordination',
      description: `Deploy screens based on temp > ${tempThreshold}°C and light > ${lightThreshold} lux`,
      enabled: true,
      priority: 12,
      conditions: [
        {
          type: 'sensor',
          parameter: 'temperature',
          operator: '>',
          value: tempThreshold
        },
        {
          type: 'sensor',
          parameter: 'lightLevel',
          operator: '>',
          value: lightThreshold
        }
      ],
      actions,
      cooldownMinutes: 20
    };
  }

  /**
   * Get integration status
   */
  getStatus(): {
    connectedScreens: number;
    activeRules: number;
    actuatorMappings: number;
  } {
    return {
      connectedScreens: this.blackoutController.getAllStatuses().size,
      activeRules: this.automationEngine.getRules().filter(r => r.enabled).length,
      actuatorMappings: this.actuatorMapping.size
    };
  }

  /**
   * Emergency override - retract all screens
   */
  async emergencyRetractAll(reason: string): Promise<void> {
    // Use blackout controller's emergency retract
    await this.blackoutController.emergencyRetract(reason);
    
    // Disable all screen-related rules temporarily
    const screenRules = this.automationEngine.getRules().filter(rule => 
      rule.actions.some(action => this.actuatorMapping.has(action.actuatorId))
    );
    
    screenRules.forEach(rule => {
      this.automationEngine.toggleRule(rule.id, false);
    });
    
    // Re-enable after 30 minutes
    setTimeout(() => {
      screenRules.forEach(rule => {
        this.automationEngine.toggleRule(rule.id, true);
      });
    }, 30 * 60 * 1000);
  }
}

// Export singleton instance
export const blackoutAutomation = new BlackoutAutomationIntegration(
  new GreenhouseAutomationEngine(),
  blackoutController
);