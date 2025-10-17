// Energy demand calculations for controlled environment agriculture
// Based on greenhouse climate control requirements

export interface GreenhouseSpecs {
  area: number; // square feet
  height: number; // feet
  volume: number; // cubic feet
  glazingType: 'glass' | 'polycarbonate' | 'polyethylene';
  insulationR: number; // R-value
  orientation: 'north-south' | 'east-west';
  location: {
    latitude: number;
    longitude: number;
    elevation: number; // feet above sea level
  };
}

export interface ClimateSetpoints {
  temperature: {
    day: number; // °F
    night: number; // °F
    deadband: number; // temperature difference before action
  };
  humidity: {
    target: number; // % RH
    tolerance: number; // ± %
  };
  co2: {
    target: number; // ppm
    enrichmentRate: number; // ppm/hour
  };
  ventilation: {
    minRate: number; // air changes per hour
    maxRate: number; // air changes per hour
  };
}

export interface EnergyRequirements {
  heating: {
    peak: number; // BTU/hr
    annual: number; // BTU/year
    fuel: 'natural_gas' | 'propane' | 'electric' | 'biomass';
  };
  cooling: {
    peak: number; // BTU/hr (cooling load)
    annual: number; // BTU/year
    method: 'evaporative' | 'mechanical' | 'natural_ventilation';
  };
  lighting: {
    power: number; // watts
    dailyUse: number; // hours/day
    annual: number; // kWh/year
  };
  ventilation: {
    power: number; // watts
    annual: number; // kWh/year
  };
  co2Generation: {
    rate: number; // lb CO2/hour
    annual: number; // lb CO2/year
    source: 'burner' | 'liquid' | 'flue_gas';
  };
  totalCost: {
    heating: number; // $/year
    cooling: number; // $/year
    lighting: number; // $/year
    co2: number; // $/year
    total: number; // $/year
  };
}

export interface WeatherConditions {
  outsideTemp: number; // °F
  humidity: number; // % RH
  windSpeed: number; // mph
  solarRadiation: number; // BTU/sq ft/day
  cloudCover: number; // 0-1
}

// Heat transfer calculations
export function calculateHeatLoss(
  greenhouse: GreenhouseSpecs,
  insideTemp: number,
  outsideTemp: number,
  windSpeed: number = 10
): number {
  const tempDiff = insideTemp - outsideTemp;
  
  // Calculate surface areas
  const wallArea = 2 * greenhouse.area * greenhouse.height / 100; // Simplified wall area
  const roofArea = greenhouse.area * 1.2; // Roof area with slope factor
  const totalSurfaceArea = wallArea + roofArea;
  
  // U-value based on glazing type and R-value
  const uValue = 1 / greenhouse.insulationR;
  
  // Conduction heat loss
  const conductionLoss = totalSurfaceArea * uValue * tempDiff;
  
  // Infiltration heat loss (air leakage)
  const airDensity = 0.075; // lb/ft³ at standard conditions
  const specificHeat = 0.24; // BTU/lb/°F for air
  const infiltrationRate = 0.5 * greenhouse.volume; // ft³/hr (0.5 air changes/hr)
  const infiltrationLoss = infiltrationRate * airDensity * specificHeat * tempDiff;
  
  // Wind effect on heat loss
  const windFactor = 1 + (windSpeed - 10) * 0.02;
  
  return (conductionLoss + infiltrationLoss) * windFactor;
}

// Solar heat gain calculations
export function calculateSolarHeatGain(
  greenhouse: GreenhouseSpecs,
  solarRadiation: number,
  cloudCover: number = 0
): number {
  // Solar heat gain coefficient based on glazing
  let shgc = 0.8; // Default for single glass
  
  switch (greenhouse.glazingType) {
    case 'glass':
      shgc = 0.8;
      break;
    case 'polycarbonate':
      shgc = 0.7;
      break;
    case 'polyethylene':
      shgc = 0.85;
      break;
  }
  
  // Adjust for cloud cover
  const effectiveRadiation = solarRadiation * (1 - cloudCover * 0.8);
  
  // Calculate solar gain
  const solarGain = greenhouse.area * effectiveRadiation * shgc;
  
  return solarGain;
}

// Evaporative cooling calculations
export function calculateEvaporativeCooling(
  airflow: number, // CFM
  wetBulbTemp: number, // °F
  dryBulbTemp: number, // °F
  efficiency: number = 0.85 // Pad efficiency
): number {
  const tempDrop = (dryBulbTemp - wetBulbTemp) * efficiency;
  const coolingCapacity = airflow * 1.08 * tempDrop; // BTU/hr
  
  return coolingCapacity;
}

// CO2 generation requirements
export function calculateCO2Requirements(
  greenhouse: GreenhouseSpecs,
  targetCO2: number,
  ambientCO2: number = 400,
  ventilationRate: number = 2 // air changes per hour
): number {
  const co2Deficit = Math.max(0, targetCO2 - ambientCO2);
  const ventilationLoss = greenhouse.volume * ventilationRate * co2Deficit / 1000000; // Convert ppm to fraction
  const generationRate = ventilationLoss * 0.044; // lb CO2/hour (molecular weight factor)
  
  return generationRate;
}

// LED lighting calculations
export function calculateLightingRequirements(
  greenhouse: GreenhouseSpecs,
  targetDLI: number, // Daily Light Integral (mol/m²/day)
  naturalLight: number = 10, // Average natural DLI
  photoperiod: number = 16 // hours/day
): { power: number; cost: number } {
  const areaSquareMeters = greenhouse.area * 0.092903; // Convert ft² to m²
  const supplementalDLI = Math.max(0, targetDLI - naturalLight);
  
  // PPFD needed (µmol/m²/s)
  const requiredPPFD = (supplementalDLI * 1000000) / (photoperiod * 3600);
  
  // LED efficiency (µmol/J) - modern LEDs achieve 2.5-3.0
  const ledEfficiency = 2.7;
  
  // Power calculation
  const powerDensity = requiredPPFD / ledEfficiency; // W/m²
  const totalPower = powerDensity * areaSquareMeters;
  
  // Annual energy cost (assuming $0.12/kWh)
  const annualKWh = (totalPower * photoperiod * 365) / 1000;
  const annualCost = annualKWh * 0.12;
  
  return {
    power: totalPower,
    cost: annualCost
  };
}

// Comprehensive energy demand calculation
export function calculateEnergyDemand(
  greenhouse: GreenhouseSpecs,
  setpoints: ClimateSetpoints,
  weather: WeatherConditions,
  cropRequirements: {
    dli: number;
    co2: number;
  }
): EnergyRequirements {
  // Heating calculations
  const heatLoss = calculateHeatLoss(
    greenhouse,
    setpoints.temperature.day,
    weather.outsideTemp,
    weather.windSpeed
  );
  
  const solarGain = calculateSolarHeatGain(
    greenhouse,
    weather.solarRadiation,
    weather.cloudCover
  );
  
  const netHeatingLoad = Math.max(0, heatLoss - solarGain);
  
  // Cooling calculations
  const excessHeat = Math.max(0, solarGain - heatLoss);
  const coolingRequired = excessHeat > 0;
  
  let coolingCapacity = 0;
  if (coolingRequired) {
    // Estimate wet bulb temperature (simplified)
    const wetBulbTemp = weather.outsideTemp - ((100 - weather.humidity) * 0.15);
    const ventilationCFM = greenhouse.volume * setpoints.ventilation.maxRate / 60;
    coolingCapacity = calculateEvaporativeCooling(ventilationCFM, wetBulbTemp, weather.outsideTemp);
  }
  
  // Lighting calculations
  const lighting = calculateLightingRequirements(
    greenhouse,
    cropRequirements.dli,
    weather.solarRadiation * 0.0046, // Convert BTU/ft²/day to approximate DLI
    16
  );
  
  // CO2 calculations
  const co2Rate = calculateCO2Requirements(
    greenhouse,
    cropRequirements.co2,
    400,
    setpoints.ventilation.minRate
  );
  
  // Annual calculations (simplified)
  const heatingHours = 4000; // Typical heating hours per year
  const coolingHours = 2000; // Typical cooling hours per year
  
  // Cost calculations (example rates)
  const naturalGasRate = 1.2; // $/therm
  const electricRate = 0.12; // $/kWh
  const co2Rate = 0.8; // $/lb CO2
  
  return {
    heating: {
      peak: netHeatingLoad,
      annual: netHeatingLoad * heatingHours,
      fuel: 'natural_gas'
    },
    cooling: {
      peak: coolingCapacity,
      annual: coolingCapacity * coolingHours,
      method: 'evaporative'
    },
    lighting: {
      power: lighting.power,
      dailyUse: 16,
      annual: lighting.power * 16 * 365 / 1000
    },
    ventilation: {
      power: 500, // Estimated fan power
      annual: 500 * 8760 / 1000 // kWh/year
    },
    co2Generation: {
      rate: co2Rate,
      annual: co2Rate * 8760,
      source: 'burner'
    },
    totalCost: {
      heating: (netHeatingLoad * heatingHours) / 100000 * naturalGasRate, // Convert BTU to therms
      cooling: (coolingCapacity * coolingHours) / 3412 * electricRate / 1000, // Convert to kWh
      lighting: lighting.cost,
      co2: co2Rate * 8760 * co2Rate,
      total: 0 // Will be calculated
    }
  };
}

// Heat and cold storage calculations
export function calculateThermalStorage(
  greenhouse: GreenhouseSpecs,
  storageVolume: number, // gallons
  storageType: 'water' | 'concrete' | 'phase_change'
): {
  heatingCapacity: number; // BTU
  coolingCapacity: number; // BTU
  efficiency: number; // 0-1
} {
  let specificHeat = 8.33; // BTU/gallon/°F for water
  let efficiency = 0.8;
  
  switch (storageType) {
    case 'water':
      specificHeat = 8.33;
      efficiency = 0.85;
      break;
    case 'concrete':
      specificHeat = 0.2 * 150; // density * specific heat
      efficiency = 0.75;
      break;
    case 'phase_change':
      specificHeat = 100; // Higher effective heat capacity
      efficiency = 0.9;
      break;
  }
  
  // Assume 20°F temperature swing for storage
  const temperatureSwing = 20;
  const capacity = storageVolume * specificHeat * temperatureSwing * efficiency;
  
  return {
    heatingCapacity: capacity,
    coolingCapacity: capacity * 0.8, // Cooling typically less efficient
    efficiency
  };
}