# Blackout Curtain Control System

## Overview
The Blackout Curtain Control System provides comprehensive management for multi-layer greenhouse screens including blackout curtains, shade screens, thermal screens, and energy screens. It integrates seamlessly with the existing greenhouse automation rules engine and provides advanced features for photoperiod management, energy optimization, and weather-based control.

## Key Features

### 1. **Multi-Layer Screen Management**
- Support for multiple screen types: Blackout, Shade, Thermal, Energy, Insect, and Hail screens
- Layer-based organization (Upper, Middle, Lower, Sidewall)
- Coordinated deployment strategies
- Conflict resolution between layers

### 2. **Photoperiod Control**
- Automated dark period enforcement
- Light deprivation scheduling
- Cannabis-specific flowering automation (18/6 → 12/12 transitions)
- Dark period breach detection and correction
- Gradual deployment options to prevent plant shock

### 3. **Energy Optimization**
- Weather-based screen deployment
- Multi-layer insulation for winter
- Heat load reduction in summer
- Integration with demand response systems
- Time-of-use optimization

### 4. **Safety Features**
- Wind speed monitoring and automatic retraction
- Rain sensors for weather protection
- Snow load limits
- Temperature-based deployment restrictions
- Emergency retract functionality
- Motor overheat protection

### 5. **Advanced Deployment Strategies**
- Immediate deployment
- Gradual deployment with customizable ramp times
- Staged deployment with checkpoints
- Weather-based overrides
- Synchronized multi-screen movements

## Usage Examples

### Basic Screen Control
```typescript
import { blackoutController, ScreenType, ScreenLayer } from '@/lib/greenhouse/blackout-curtain-control';

// Register a blackout screen
blackoutController.registerScreen({
  id: 'main-blackout',
  name: 'Main Blackout Screen',
  type: ScreenType.BLACKOUT,
  layer: ScreenLayer.MIDDLE,
  zone: 'Zone A',
  lightTransmission: 0,
  energySavings: 15,
  deploymentSpeed: 180,
  motorType: 'servo',
  maxPosition: 100,
  safetyFeatures: {
    windSpeedLimit: 20,
    rainSensor: true,
    snowLoadLimit: 50,
    temperatureLimit: 45
  }
});

// Deploy screen to 100%
await blackoutController.deployScreen('main-blackout', 100);
```

### Cannabis Photoperiod Management
```typescript
import { cannabisAutomation } from '@/lib/greenhouse/blackout-curtain-control';

// Configure vegetative stage (18/6)
cannabisAutomation.configureVegetativeStage(18, ['Zone A', 'Zone B']);

// Transition to flowering (12/12)
cannabisAutomation.configureFloweringStage(['Zone A', 'Zone B']);

// Automated transition after 30 days
await cannabisAutomation.automatedTransition(30, ['Zone A', 'Zone B']);
```

### Multi-Layer Coordination
```typescript
// Deploy multiple screens with coordination
await blackoutController.deployMultipleScreens([
  { screenId: 'shade-upper', position: 30 },
  { screenId: 'shade-middle', position: 30 },
  { screenId: 'thermal-lower', position: 85 }
], {
  priority: [ScreenLayer.UPPER, ScreenLayer.MIDDLE, ScreenLayer.LOWER],
  conflictResolution: 'priority',
  delayBetweenLayers: 5,
  synchronizedMovement: false
});
```

### Custom Photoperiod Schedule
```typescript
blackoutController.configurePhotoperiod({
  id: 'tomato-photoperiod',
  name: 'Tomato 14-Hour Photoperiod',
  cropType: 'tomato',
  growthStage: 'fruiting',
  schedule: [
    {
      dayOfWeek: 0, // Sunday
      periods: [{
        startTime: '06:00',
        endTime: '20:00',
        targetPAR: 600,
        screenOverrides: {
          'shade-screen': 30 // Deploy shade to 30% during light period
        }
      }]
    }
    // ... other days
  ],
  blackoutRequired: false,
  lightDeprivation: {
    enabled: false,
    startTime: '',
    duration: 0,
    gradualTransition: false,
    transitionMinutes: 0
  },
  darkPeriodProtection: {
    enabled: true,
    alertOnBreach: true,
    maxAllowedLux: 0.5,
    emergencyOverride: false
  }
});
```

## Integration with Automation Rules

The blackout system integrates with the greenhouse automation rules engine:

### Using Predefined Templates
```typescript
import { RULE_TEMPLATES } from '@/lib/greenhouse-automation-rules';

// Enable blackout photoperiod control
automationEngine.addRule(RULE_TEMPLATES.blackout_control.photoperiod_enforcement);

// Enable thermal screen for energy savings
automationEngine.addRule(RULE_TEMPLATES.thermal_screen_control.energy_saving_night);

// Enable multi-layer summer cooling
automationEngine.addRule(RULE_TEMPLATES.multi_layer_coordination.summer_heat_management);
```

### Creating Custom Rules
```typescript
const customRule: Rule = {
  id: 'custom_shade_rule',
  name: 'High Light Shading',
  description: 'Deploy shade screens when light exceeds threshold',
  enabled: true,
  priority: 10,
  conditions: [
    {
      type: 'sensor',
      parameter: 'lightLevel',
      operator: '>',
      value: 100000 // lux
    }
  ],
  actions: [
    {
      actuatorId: 'shade_screen_upper',
      command: 'set',
      value: 50,
      rampTime: 15
    }
  ],
  cooldownMinutes: 30
};

automationEngine.addRule(customRule);
```

## Event Monitoring

The system emits various events for monitoring:

```typescript
// Screen position updates
blackoutController.on('screen:position', (data) => {
  console.log(`Screen ${data.screenId} at ${data.position}%`);
});

// Dark period breaches
blackoutController.on('darkperiod:breach', (breach) => {
  console.log(`Light breach in ${breach.zone}: ${breach.lightLevel} lux`);
});

// Motor overheating
blackoutController.on('motor:overheat', (data) => {
  console.log(`Motor overheating: ${data.screenId} at ${data.temperature}°C`);
});

// Maintenance required
blackoutController.on('maintenance:required', (data) => {
  console.log(`Maintenance needed for ${data.screenId}`);
});
```

## UI Component

The system includes a comprehensive React component for visual control:

```tsx
import { BlackoutCurtainPanel } from '@/components/greenhouse/BlackoutCurtainPanel';

// Use in your app
<BlackoutCurtainPanel />
```

The UI provides:
- Real-time screen position monitoring
- Manual control with deployment strategies
- Photoperiod configuration
- Cannabis growth stage management
- Weather status display
- Alert notifications
- Multi-layer visualization

## Best Practices

1. **Safety First**: Always configure appropriate wind speed and temperature limits
2. **Gradual Transitions**: Use gradual deployment for sensitive crops
3. **Layer Coordination**: Deploy screens from top to bottom for optimal results
4. **Regular Maintenance**: Monitor motor temperatures and schedule maintenance
5. **Dark Period Protection**: Enable alerts for light-sensitive crops
6. **Energy Optimization**: Use thermal screens at night for energy savings
7. **Weather Integration**: Configure weather-based overrides for protection

## Troubleshooting

### Screen Not Deploying
- Check safety conditions (wind, temperature)
- Verify motor temperature is within limits
- Ensure no conflicting rules are active
- Check for maintenance requirements

### Dark Period Breaches
- Verify all blackout screens are properly registered
- Check light sensor calibration
- Ensure screens achieve 100% deployment
- Look for gaps in sidewall coverage

### Motor Overheating
- Reduce deployment frequency
- Check for mechanical resistance
- Verify motor specifications match screen weight
- Schedule maintenance if persistent

## Future Enhancements

Planned features include:
- Machine learning for optimal deployment timing
- Integration with weather forecast APIs
- Predictive maintenance based on usage patterns
- Energy cost optimization algorithms
- Mobile app control
- Voice assistant integration