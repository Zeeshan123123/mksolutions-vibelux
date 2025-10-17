/**
 * Advanced Vapor Pressure Deficit (VPD) Calculator
 * Calculates precise VPD values with environmental corrections for optimal plant growth
 * Includes plant-specific adjustments and growth stage recommendations
 */

export interface EnvironmentalParameters {
  airTemperature: number; // °C
  relativeHumidity: number; // %
  leafTemperature?: number; // °C (if available from IR sensors)
  lightIntensity?: number; // PPFD μmol/m²/s
  co2Level?: number; // ppm
  airflow?: number; // m/s
  barometricPressure?: number; // hPa (for altitude corrections)
}

export interface PlantParameters {
  species: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'ripening';
  leafAreaIndex?: number; // LAI
  canopyDensity?: 'low' | 'medium' | 'high';
  stressLevel?: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface VPDResult {
  // Core VPD calculations
  vpd: number; // kPa - Standard VPD
  leafVPD: number; // kPa - Leaf-based VPD
  relativeVPD: number; // % of optimal range
  
  // Supporting calculations
  saturationVaporPressure: number; // kPa
  actualVaporPressure: number; // kPa
  leafSaturationVP?: number; // kPa
  dewPoint: number; // °C
  absoluteHumidity: number; // g/m³
  
  // Assessment
  optimal: boolean;
  status: 'too_low' | 'optimal' | 'slightly_high' | 'too_high' | 'critical';
  stressRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Recommendations
  recommendations: string[];
  adjustments: {
    temperatureChange?: number; // °C
    humidityChange?: number; // %
    airflowIncrease?: boolean;
    mistingRecommended?: boolean;
  };
  
  // Predictions
  transpirationRate: number; // relative scale 0-100
  stomatalConductance: number; // relative scale 0-100
  photosynthesisEfficiency: number; // % of optimal
  
  // Growth stage specific
  optimalRange: { min: number; max: number };
  currentDeviation: number; // kPa from optimal
}

export interface CropVPDProfile {
  name: string;
  species: string;
  optimalRanges: {
    seedling: { min: number; max: number; };
    vegetative: { min: number; max: number; };
    flowering: { min: number; max: number; };
    fruiting: { min: number; max: number; };
    ripening: { min: number; max: number; };
  };
  temperatureCompensation: number; // °C offset for leaf temp
  humidityTolerance: number; // deviation tolerance %
  stressThresholds: {
    mild: number;
    moderate: number;
    severe: number;
  };
}

export const CROP_VPD_PROFILES: Record<string, CropVPDProfile> = {
  tomato: {
    name: 'Tomato',
    species: 'Solanum lycopersicum',
    optimalRanges: {
      seedling: { min: 0.4, max: 0.8 },
      vegetative: { min: 0.8, max: 1.2 },
      flowering: { min: 1.0, max: 1.5 },
      fruiting: { min: 0.9, max: 1.4 },
      ripening: { min: 0.7, max: 1.2 }
    },
    temperatureCompensation: -2.0, // Leaves typically 2°C cooler
    humidityTolerance: 0.15,
    stressThresholds: {
      mild: 1.8,
      moderate: 2.2,
      severe: 2.8
    }
  },
  
  lettuce: {
    name: 'Lettuce',
    species: 'Lactuca sativa',
    optimalRanges: {
      seedling: { min: 0.3, max: 0.6 },
      vegetative: { min: 0.5, max: 0.9 },
      flowering: { min: 0.8, max: 1.2 },
      fruiting: { min: 0.8, max: 1.2 },
      ripening: { min: 0.6, max: 1.0 }
    },
    temperatureCompensation: -1.5,
    humidityTolerance: 0.20,
    stressThresholds: {
      mild: 1.4,
      moderate: 1.8,
      severe: 2.2
    }
  },
  
  cannabis: {
    name: 'Cannabis',
    species: 'Cannabis sativa',
    optimalRanges: {
      seedling: { min: 0.4, max: 0.8 },
      vegetative: { min: 0.8, max: 1.2 },
      flowering: { min: 1.0, max: 1.6 },
      fruiting: { min: 0.8, max: 1.4 },
      ripening: { min: 0.6, max: 1.0 }
    },
    temperatureCompensation: -1.8,
    humidityTolerance: 0.12,
    stressThresholds: {
      mild: 1.8,
      moderate: 2.3,
      severe: 2.9
    }
  },
  
  cucumber: {
    name: 'Cucumber',
    species: 'Cucumis sativus',
    optimalRanges: {
      seedling: { min: 0.5, max: 0.9 },
      vegetative: { min: 0.9, max: 1.3 },
      flowering: { min: 1.1, max: 1.6 },
      fruiting: { min: 1.0, max: 1.5 },
      ripening: { min: 0.8, max: 1.3 }
    },
    temperatureCompensation: -2.2,
    humidityTolerance: 0.18,
    stressThresholds: {
      mild: 1.9,
      moderate: 2.4,
      severe: 3.0
    }
  },
  
  strawberry: {
    name: 'Strawberry',
    species: 'Fragaria × ananassa',
    optimalRanges: {
      seedling: { min: 0.3, max: 0.7 },
      vegetative: { min: 0.6, max: 1.0 },
      flowering: { min: 0.8, max: 1.3 },
      fruiting: { min: 0.7, max: 1.2 },
      ripening: { min: 0.5, max: 0.9 }
    },
    temperatureCompensation: -1.5,
    humidityTolerance: 0.25,
    stressThresholds: {
      mild: 1.6,
      moderate: 2.0,
      severe: 2.5
    }
  }
};

/**
 * Calculate saturation vapor pressure using Tetens formula
 * More accurate than simple approximations for horticultural applications
 */
const calculateSaturationVaporPressure = (temperature: number): number => {
  // Tetens formula - improved accuracy over Magnus formula
  const a = 17.27;
  const b = 237.7;
  return 0.6108 * Math.exp((a * temperature) / (b + temperature));
};

/**
 * Calculate actual vapor pressure from relative humidity
 */
const calculateActualVaporPressure = (temperature: number, relativeHumidity: number): number => {
  const svp = calculateSaturationVaporPressure(temperature);
  return svp * (relativeHumidity / 100);
};

/**
 * Calculate dew point temperature
 */
const calculateDewPoint = (temperature: number, relativeHumidity: number): number => {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temperature) / (b + temperature)) + Math.log(relativeHumidity / 100);
  return (b * alpha) / (a - alpha);
};

/**
 * Calculate absolute humidity (g/m³)
 */
const calculateAbsoluteHumidity = (temperature: number, relativeHumidity: number): number => {
  const avp = calculateActualVaporPressure(temperature, relativeHumidity);
  // Using ideal gas law approximation
  return (avp * 1000 * 216.7) / (temperature + 273.15);
};

/**
 * Estimate leaf temperature based on environmental conditions
 */
const estimateLeafTemperature = (
  airTemp: number,
  lightIntensity: number = 300,
  airflow: number = 0.1,
  species: string = 'tomato'
): number => {
  const profile = CROP_VPD_PROFILES[species] || CROP_VPD_PROFILES.tomato;
  let leafTemp = airTemp + profile.temperatureCompensation;
  
  // Light-induced heating (more light = warmer leaves)
  const lightHeating = (lightIntensity - 300) * 0.005; // 0.5°C per 100 PPFD above 300
  leafTemp += Math.max(0, lightHeating);
  
  // Airflow cooling effect
  const airflowCooling = Math.min(2.0, airflow * 5); // Max 2°C cooling
  leafTemp -= airflowCooling;
  
  return leafTemp;
};

/**
 * Advanced VPD calculation with plant-specific adjustments
 */
export const calculateVPD = (
  envParams: EnvironmentalParameters,
  plantParams: PlantParameters = { species: 'tomato', growthStage: 'vegetative' }
): VPDResult => {
  const { airTemperature, relativeHumidity, lightIntensity = 300, airflow = 0.1 } = envParams;
  const { species = 'tomato', growthStage } = plantParams;
  
  // Get crop profile
  const profile = CROP_VPD_PROFILES[species] || CROP_VPD_PROFILES.tomato;
  const optimalRange = profile.optimalRanges[growthStage];
  
  // Calculate basic vapor pressures
  const saturationVP = calculateSaturationVaporPressure(airTemperature);
  const actualVP = calculateActualVaporPressure(airTemperature, relativeHumidity);
  const standardVPD = saturationVP - actualVP;
  
  // Calculate leaf-based VPD
  const leafTemp = envParams.leafTemperature || 
    estimateLeafTemperature(airTemperature, lightIntensity, airflow, species);
  const leafSaturationVP = calculateSaturationVaporPressure(leafTemp);
  const leafVPD = leafSaturationVP - actualVP;
  
  // Environmental corrections for extreme conditions
  let correctedVPD = leafVPD;
  
  // CO2 concentration effect (higher CO2 allows higher VPD)
  if (envParams.co2Level) {
    const co2Factor = Math.min(1.2, envParams.co2Level / 400); // Max 20% increase
    correctedVPD *= co2Factor;
  }
  
  // Barometric pressure correction (altitude effect)
  if (envParams.barometricPressure) {
    const pressureFactor = envParams.barometricPressure / 1013.25;
    correctedVPD *= pressureFactor;
  }
  
  // Calculate assessment metrics
  const optimalMidpoint = (optimalRange.min + optimalRange.max) / 2;
  const relativeVPD = (correctedVPD / optimalMidpoint) * 100;
  const currentDeviation = Math.abs(correctedVPD - optimalMidpoint);
  
  // Determine status
  let status: VPDResult['status'];
  let stressRisk: VPDResult['stressRisk'];
  let optimal = false;
  
  if (correctedVPD < optimalRange.min * 0.7) {
    status = 'too_low';
    stressRisk = 'high';
  } else if (correctedVPD < optimalRange.min) {
    status = 'too_low';
    stressRisk = 'medium';
  } else if (correctedVPD >= optimalRange.min && correctedVPD <= optimalRange.max) {
    status = 'optimal';
    stressRisk = 'none';
    optimal = true;
  } else if (correctedVPD <= optimalRange.max * 1.3) {
    status = 'slightly_high';
    stressRisk = 'low';
  } else if (correctedVPD <= profile.stressThresholds.moderate) {
    status = 'too_high';
    stressRisk = 'medium';
  } else {
    status = 'critical';
    stressRisk = 'critical';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  const adjustments: VPDResult['adjustments'] = {};
  
  if (status === 'too_low') {
    recommendations.push('Increase air temperature or decrease humidity');
    recommendations.push('Improve air circulation to reduce leaf boundary layer');
    if (relativeHumidity > 70) {
      adjustments.humidityChange = -10;
      recommendations.push('Use dehumidification to reduce RH by 10%');
    } else {
      adjustments.temperatureChange = 2;
      recommendations.push('Increase temperature by 2°C');
    }
    adjustments.airflowIncrease = true;
  } else if (status === 'too_high' || status === 'critical') {
    recommendations.push('Increase humidity or decrease temperature');
    recommendations.push('Reduce light intensity if excessive');
    if (relativeHumidity < 50) {
      adjustments.humidityChange = 15;
      adjustments.mistingRecommended = true;
      recommendations.push('Increase humidity through misting or humidification');
    }
    if (airTemperature > 26) {
      adjustments.temperatureChange = -3;
      recommendations.push('Reduce temperature by 3°C');
    }
  } else if (status === 'slightly_high') {
    recommendations.push('Minor adjustments needed - monitor closely');
    adjustments.humidityChange = 5;
  }
  
  // Add stage-specific recommendations
  if (growthStage === 'seedling' && correctedVPD > 1.0) {
    recommendations.push('Young plants are sensitive - keep VPD below 1.0 kPa');
  } else if (growthStage === 'flowering' && correctedVPD < 0.8) {
    recommendations.push('Flowering plants need higher VPD for nutrient transport');
  }
  
  // Calculate physiological predictions
  const transpirationRate = Math.max(0, Math.min(100, 
    50 + (correctedVPD - optimalMidpoint) * 30
  ));
  
  const stomatalConductance = Math.max(0, Math.min(100,
    100 - Math.pow(Math.abs(correctedVPD - optimalMidpoint) * 50, 1.5)
  ));
  
  const photosynthesisEfficiency = Math.max(0, Math.min(100,
    100 - Math.pow(currentDeviation * 40, 1.2)
  ));
  
  return {
    vpd: Number(standardVPD.toFixed(3)),
    leafVPD: Number(correctedVPD.toFixed(3)),
    relativeVPD: Number(relativeVPD.toFixed(1)),
    saturationVaporPressure: Number(saturationVP.toFixed(3)),
    actualVaporPressure: Number(actualVP.toFixed(3)),
    leafSaturationVP: Number(leafSaturationVP.toFixed(3)),
    dewPoint: Number(calculateDewPoint(airTemperature, relativeHumidity).toFixed(1)),
    absoluteHumidity: Number(calculateAbsoluteHumidity(airTemperature, relativeHumidity).toFixed(2)),
    optimal,
    status,
    stressRisk,
    recommendations,
    adjustments,
    transpirationRate: Number(transpirationRate.toFixed(1)),
    stomatalConductance: Number(stomatalConductance.toFixed(1)),
    photosynthesisEfficiency: Number(photosynthesisEfficiency.toFixed(1)),
    optimalRange,
    currentDeviation: Number(currentDeviation.toFixed(3))
  };
};

/**
 * Calculate VPD for multiple environmental scenarios
 */
export const calculateVPDMatrix = (
  temperatureRange: { min: number; max: number; step: number },
  humidityRange: { min: number; max: number; step: number },
  plantParams: PlantParameters
) => {
  const matrix = [];
  
  for (let temp = temperatureRange.min; temp <= temperatureRange.max; temp += temperatureRange.step) {
    for (let rh = humidityRange.min; rh <= humidityRange.max; rh += humidityRange.step) {
      const result = calculateVPD(
        { airTemperature: temp, relativeHumidity: rh },
        plantParams
      );
      
      matrix.push({
        temperature: temp,
        humidity: rh,
        vpd: result.leafVPD,
        optimal: result.optimal,
        status: result.status
      });
    }
  }
  
  return matrix;
};

/**
 * Legacy compatibility - simple VPD calculation
 */
export const calculateSimpleVPD = (temp: number, humidity: number) => {
  const result = calculateVPD(
    { airTemperature: temp, relativeHumidity: humidity },
    { species: 'tomato', growthStage: 'vegetative' }
  );
  
  return {
    vpd: result.vpd,
    leafVPD: result.leafVPD,
    optimal: result.optimal
  };
};

// Legacy export for backwards compatibility
export const VPD_RANGES = {
  vegetative: { min: 0.8, max: 1.2 },
  flowering: { min: 1.0, max: 1.5 }
};

export default {
  calculateVPD,
  calculateSimpleVPD,
  calculateVPDMatrix,
  VPD_RANGES,
  CROP_VPD_PROFILES
};