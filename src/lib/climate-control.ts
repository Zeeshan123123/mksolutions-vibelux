// Advanced climate setpoint management for controlled environment agriculture
// Implements sophisticated control algorithms for optimal plant growth

export interface ClimateSetpoint {
  temperature: {
    day: number; // °F
    night: number; // °F
    deadband: number; // Minimum temperature difference before equipment changes
    rampRate: number; // °F/hour - rate of temperature change
  };
  humidity: {
    target: number; // % RH
    tolerance: number; // ± %
    vpdTarget?: number; // Vapor Pressure Deficit (kPa)
  };
  co2: {
    target: number; // ppm
    enrichmentRate: number; // ppm/hour
    cutoffTemp: number; // °F - stop enrichment if too hot
    minVentilation: number; // CFM minimum for CO2 distribution
  };
  lighting: {
    photoperiod: number; // hours/day
    intensity: number; // µmol/m²/s PPFD
    spectrum: {
      red: number; // % of total
      blue: number; // % of total
      green: number; // % of total
      farRed: number; // % of total
    };
    dailyIntegral: number; // DLI target
  };
  ventilation: {
    minRate: number; // air changes per hour
    maxRate: number; // air changes per hour
    temperatureThreshold: number; // °F - when to increase ventilation
    humidityThreshold: number; // % RH - when to increase ventilation
  };
}

export interface EnvironmentalConditions {
  temperature: number; // °F
  humidity: number; // % RH
  co2: number; // ppm
  light: number; // µmol/m²/s PPFD
  vpd: number; // kPa
  windSpeed: number; // mph (for greenhouse ventilation)
}

export interface EquipmentState {
  heating: {
    active: boolean;
    capacity: number; // % of maximum
    setpoint: number; // °F
  };
  cooling: {
    active: boolean;
    capacity: number; // % of maximum
    evaporativePads: boolean;
    mechanicalCooling: boolean;
  };
  ventilation: {
    exhaustFans: number; // % speed
    intakeLouvers: number; // % open
    circulationFans: number; // % speed
    airExchangeRate: number; // ACH actual
  };
  co2System: {
    active: boolean;
    injectionRate: number; // CFH or lb/hr
    source: 'burner' | 'liquid' | 'flue_gas';
  };
  lighting: {
    active: boolean;
    intensity: number; // % of maximum
    spectrum: string; // Current spectrum setting
    hoursOn: number; // Hours operated today
  };
  dehumidification: {
    active: boolean;
    capacity: number; // % of maximum
  };
}

export interface ClimateStrategy {
  name: string;
  description: string;
  cropStage: 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  priority: 'energy_efficiency' | 'growth_optimization' | 'quality_focus' | 'yield_maximization';
  setpoints: ClimateSetpoint;
  automationRules: {
    temperatureControl: 'aggressive' | 'moderate' | 'conservative';
    humidityControl: 'tight' | 'moderate' | 'loose';
    co2Strategy: 'maximum' | 'efficient' | 'minimal';
    lightingStrategy: 'full_spectrum' | 'energy_efficient' | 'crop_specific';
  };
}

// Calculate Vapor Pressure Deficit
export function calculateVPD(temperature: number, humidity: number): number {
  // Saturation vapor pressure at given temperature (kPa)
  const svp = 0.6108 * Math.exp((17.27 * ((temperature - 32) * 5/9)) / (((temperature - 32) * 5/9) + 237.3));
  
  // Actual vapor pressure
  const avp = svp * (humidity / 100);
  
  // VPD = SVP - AVP
  return svp - avp;
}

// Calculate optimal temperature based on light levels
export function calculateOptimalTemperature(
  baseTemp: number,
  lightLevel: number, // µmol/m²/s
  maxTempIncrease: number = 10 // °F
): number {
  // Higher light levels allow for higher temperatures (photosynthetic optimization)
  const lightFactor = Math.min(1, lightLevel / 1000); // Normalize to 1000 µmol/m²/s
  return baseTemp + (lightFactor * maxTempIncrease);
}

// Advanced climate control algorithm
export function calculateClimateActions(
  current: EnvironmentalConditions,
  setpoints: ClimateSetpoint,
  equipmentState: EquipmentState,
  outsideConditions: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  }
): {
  actions: Array<{
    equipment: string;
    action: string;
    value: number;
    reason: string;
    priority: number;
  }>;
  efficiency: {
    energyScore: number; // 0-100
    controlAccuracy: number; // 0-100
    recommendations: string[];
  };
} {
  const actions: Array<{
    equipment: string;
    action: string;
    value: number;
    reason: string;
    priority: number;
  }> = [];

  // Temperature control logic
  const tempError = current.temperature - setpoints.temperature.day;
  const isNightMode = new Date().getHours() < 6 || new Date().getHours() > 18;
  const targetTemp = isNightMode ? setpoints.temperature.night : setpoints.temperature.day;
  const actualTempError = current.temperature - targetTemp;

  if (Math.abs(actualTempError) > setpoints.temperature.deadband) {
    if (actualTempError > 0) {
      // Too hot - cooling needed
      if (outsideConditions.temperature < current.temperature - 5) {
        // Natural ventilation first (energy efficient)
        actions.push({
          equipment: 'ventilation',
          action: 'increase_exhaust',
          value: Math.min(100, 50 + (actualTempError * 10)),
          reason: 'Natural cooling available',
          priority: 1
        });
      } else {
        // Evaporative cooling if humidity allows
        if (current.humidity < 70) {
          actions.push({
            equipment: 'cooling',
            action: 'evaporative_pads',
            value: Math.min(100, actualTempError * 20),
            reason: 'Evaporative cooling efficient',
            priority: 2
          });
        } else {
          // Mechanical cooling needed
          actions.push({
            equipment: 'cooling',
            action: 'mechanical',
            value: Math.min(100, actualTempError * 15),
            reason: 'Mechanical cooling required',
            priority: 3
          });
        }
      }
    } else {
      // Too cold - heating needed
      actions.push({
        equipment: 'heating',
        action: 'increase',
        value: Math.min(100, Math.abs(actualTempError) * 25),
        reason: 'Temperature below setpoint',
        priority: 1
      });
    }
  }

  // Humidity control using VPD
  const currentVPD = calculateVPD(current.temperature, current.humidity);
  const targetVPD = setpoints.humidity.vpdTarget || 1.0; // Default 1.0 kPa
  const vpdError = currentVPD - targetVPD;

  if (Math.abs(vpdError) > 0.2) {
    if (vpdError > 0) {
      // VPD too high (too dry) - increase humidity
      if (equipmentState.cooling.evaporativePads) {
        actions.push({
          equipment: 'cooling',
          action: 'adjust_evaporative',
          value: Math.min(100, equipmentState.cooling.capacity + 20),
          reason: 'Increase humidity via evaporative cooling',
          priority: 2
        });
      } else {
        actions.push({
          equipment: 'humidification',
          action: 'increase',
          value: Math.min(100, vpdError * 50),
          reason: 'VPD too high, add moisture',
          priority: 2
        });
      }
    } else {
      // VPD too low (too humid) - reduce humidity
      actions.push({
        equipment: 'dehumidification',
        action: 'increase',
        value: Math.min(100, Math.abs(vpdError) * 50),
        reason: 'VPD too low, remove moisture',
        priority: 2
      });
    }
  }

  // CO2 control logic
  const co2Error = current.co2 - setpoints.co2.target;
  const tempTooHigh = current.temperature > setpoints.co2.cutoffTemp;
  const ventilationTooHigh = equipmentState.ventilation.airExchangeRate > 10; // ACH

  if (co2Error < -50 && !tempTooHigh && !ventilationTooHigh) {
    // CO2 too low - increase injection
    actions.push({
      equipment: 'co2',
      action: 'increase_injection',
      value: Math.min(setpoints.co2.enrichmentRate, Math.abs(co2Error) / 10),
      reason: 'CO2 below target',
      priority: 1
    });
  } else if (co2Error > 200 || tempTooHigh) {
    // CO2 too high or temperature cutoff - stop injection
    actions.push({
      equipment: 'co2',
      action: 'stop_injection',
      value: 0,
      reason: tempTooHigh ? 'Temperature cutoff' : 'CO2 above target',
      priority: 1
    });
  }

  // Lighting control (DLI management)
  const currentTime = new Date().getHours();
  const isPhotoperiod = currentTime >= 6 && currentTime < (6 + setpoints.lighting.photoperiod);
  const targetDLI = setpoints.lighting.dailyIntegral;
  const currentDLI = equipmentState.lighting.hoursOn * (current.light * 3.6 / 1000000); // Approximate DLI

  if (isPhotoperiod && currentDLI < targetDLI) {
    const intensityNeeded = Math.min(100, (targetDLI - currentDLI) * 10);
    actions.push({
      equipment: 'lighting',
      action: 'adjust_intensity',
      value: intensityNeeded,
      reason: 'DLI target not met',
      priority: 2
    });
  } else if (!isPhotoperiod && equipmentState.lighting.active) {
    actions.push({
      equipment: 'lighting',
      action: 'turn_off',
      value: 0,
      reason: 'Outside photoperiod',
      priority: 1
    });
  }

  // Calculate efficiency metrics
  const energyScore = calculateEnergyEfficiency(actions, outsideConditions);
  const controlAccuracy = calculateControlAccuracy(current, setpoints);
  
  const recommendations = generateRecommendations(actions, current, setpoints, outsideConditions);

  return {
    actions: actions.sort((a, b) => a.priority - b.priority),
    efficiency: {
      energyScore,
      controlAccuracy,
      recommendations
    }
  };
}

// Calculate energy efficiency score
function calculateEnergyEfficiency(
  actions: Array<{ equipment: string; action: string; value: number }>,
  outsideConditions: { temperature: number; humidity: number; windSpeed: number }
): number {
  let score = 100;
  
  // Penalize high-energy actions
  actions.forEach(action => {
    switch (action.equipment) {
      case 'heating':
        score -= action.value * 0.3; // Heating is expensive
        break;
      case 'cooling':
        if (action.action === 'mechanical') {
          score -= action.value * 0.4; // Mechanical cooling is most expensive
        } else if (action.action === 'evaporative_pads') {
          score -= action.value * 0.1; // Evaporative is efficient
        }
        break;
      case 'lighting':
        score -= action.value * 0.2; // LED lighting moderate impact
        break;
      case 'dehumidification':
        score -= action.value * 0.25; // Dehumidification energy intensive
        break;
    }
  });
  
  // Bonus for using natural cooling
  const hasNaturalCooling = actions.some(a => 
    a.equipment === 'ventilation' && a.reason.includes('Natural')
  );
  if (hasNaturalCooling) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// Calculate control accuracy
function calculateControlAccuracy(
  current: EnvironmentalConditions,
  setpoints: ClimateSetpoint
): number {
  const tempAccuracy = Math.max(0, 100 - Math.abs(current.temperature - setpoints.temperature.day) * 10);
  const humidityAccuracy = Math.max(0, 100 - Math.abs(current.humidity - setpoints.humidity.target) * 2);
  const co2Accuracy = Math.max(0, 100 - Math.abs(current.co2 - setpoints.co2.target) * 0.1);
  
  return (tempAccuracy + humidityAccuracy + co2Accuracy) / 3;
}

// Generate efficiency recommendations
function generateRecommendations(
  actions: Array<{ equipment: string; action: string; value: number; reason: string }>,
  current: EnvironmentalConditions,
  setpoints: ClimateSetpoint,
  outsideConditions: { temperature: number; humidity: number; windSpeed: number }
): string[] {
  const recommendations: string[] = [];
  
  // Check for conflicting actions
  const heatingActions = actions.filter(a => a.equipment === 'heating');
  const coolingActions = actions.filter(a => a.equipment === 'cooling');
  
  if (heatingActions.length > 0 && coolingActions.length > 0) {
    recommendations.push('Warning: Simultaneous heating and cooling detected. Check setpoints and deadbands.');
  }
  
  // Energy efficiency suggestions
  if (outsideConditions.temperature < current.temperature - 10) {
    recommendations.push('Consider increasing natural ventilation to reduce cooling energy costs.');
  }
  
  if (current.humidity > 80) {
    recommendations.push('High humidity detected. Consider increasing ventilation or dehumidification.');
  }
  
  if (current.co2 < 300 && actions.some(a => a.equipment === 'ventilation' && a.value > 70)) {
    recommendations.push('High ventilation is reducing CO2 levels. Consider reducing exhaust or timing CO2 injection.');
  }
  
  return recommendations;
}

// Pre-configured climate strategies for different crop stages
export const CLIMATE_STRATEGIES: Record<string, ClimateStrategy> = {
  lettuce_germination: {
    name: 'Lettuce Germination',
    description: 'Optimal conditions for lettuce seed germination',
    cropStage: 'germination',
    priority: 'growth_optimization',
    setpoints: {
      temperature: { day: 68, night: 62, deadband: 2, rampRate: 2 },
      humidity: { target: 85, tolerance: 5, vpdTarget: 0.6 },
      co2: { target: 600, enrichmentRate: 100, cutoffTemp: 80, minVentilation: 0.5 },
      lighting: {
        photoperiod: 16,
        intensity: 150,
        spectrum: { red: 25, blue: 20, green: 15, farRed: 10 },
        dailyIntegral: 8
      },
      ventilation: { minRate: 0.25, maxRate: 2, temperatureThreshold: 75, humidityThreshold: 90 }
    },
    automationRules: {
      temperatureControl: 'moderate',
      humidityControl: 'tight',
      co2Strategy: 'minimal',
      lightingStrategy: 'crop_specific'
    }
  },
  
  lettuce_growth: {
    name: 'Lettuce Vegetative Growth',
    description: 'Optimal conditions for lettuce vegetative development',
    cropStage: 'vegetative',
    priority: 'yield_maximization',
    setpoints: {
      temperature: { day: 65, night: 58, deadband: 3, rampRate: 3 },
      humidity: { target: 75, tolerance: 8, vpdTarget: 0.8 },
      co2: { target: 1000, enrichmentRate: 200, cutoffTemp: 78, minVentilation: 1 },
      lighting: {
        photoperiod: 16,
        intensity: 250,
        spectrum: { red: 30, blue: 25, green: 20, farRed: 5 },
        dailyIntegral: 14
      },
      ventilation: { minRate: 0.5, maxRate: 4, temperatureThreshold: 72, humidityThreshold: 85 }
    },
    automationRules: {
      temperatureControl: 'moderate',
      humidityControl: 'moderate',
      co2Strategy: 'maximum',
      lightingStrategy: 'full_spectrum'
    }
  },
  
  tomato_flowering: {
    name: 'Tomato Flowering',
    description: 'Optimal conditions for tomato flowering and fruit set',
    cropStage: 'flowering',
    priority: 'quality_focus',
    setpoints: {
      temperature: { day: 75, night: 65, deadband: 2, rampRate: 2 },
      humidity: { target: 65, tolerance: 5, vpdTarget: 1.0 },
      co2: { target: 1200, enrichmentRate: 250, cutoffTemp: 85, minVentilation: 1.5 },
      lighting: {
        photoperiod: 14,
        intensity: 400,
        spectrum: { red: 35, blue: 15, green: 25, farRed: 15 },
        dailyIntegral: 20
      },
      ventilation: { minRate: 1, maxRate: 8, temperatureThreshold: 80, humidityThreshold: 75 }
    },
    automationRules: {
      temperatureControl: 'aggressive',
      humidityControl: 'tight',
      co2Strategy: 'maximum',
      lightingStrategy: 'crop_specific'
    }
  }
};