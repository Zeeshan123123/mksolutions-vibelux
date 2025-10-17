// Advanced flow measurement and analysis utilities for irrigation systems
// Precision dripper nozzle and pump performance analysis

export interface DripperNozzle {
  id: string;
  manufacturer: string;
  model: string;
  nominalFlowRate: number; // GPH at rated pressure
  ratedPressure: number; // PSI
  pressureCompensating: boolean;
  coefficientOfVariation: number; // Manufacturing uniformity (%)
  minPressure: number; // PSI
  maxPressure: number; // PSI
  orificeSize: number; // mm
  antiDrainPressure?: number; // PSI
  flushingPressure?: number; // PSI
}

export interface PumpCurve {
  pressure: number; // PSI
  flowRate: number; // GPM
  efficiency: number; // %
  powerDraw: number; // Watts
}

export interface PumpPerformance {
  id: string;
  manufacturer: string;
  model: string;
  maxFlowRate: number; // GPM
  maxPressure: number; // PSI
  peakEfficiency: number; // %
  optimumFlowRate: number; // GPM at peak efficiency
  curves: PumpCurve[];
  impellerDiameter: number; // inches
  motorHP: number;
  inletSize: number; // inches
  outletSize: number; // inches
  npshr: number; // Net Positive Suction Head Required (ft)
}

export interface FlowMeasurement {
  timestamp: Date;
  location: string;
  flowRate: number; // GPM or GPH
  pressure: number; // PSI
  temperature: number; // °F
  sensorId: string;
  accuracy: number; // ±%
}

export interface DripperLineAnalysis {
  lineId: string;
  length: number; // feet
  dripperCount: number;
  dripperSpacing: number; // inches
  tubeSize: number; // inches diameter
  elevation: number; // feet
  actualFlowRates: number[]; // GPH per dripper
  uniformity: {
    coefficient: number; // %
    distribution: number; // %
    emission: number; // %
  };
  pressureLoss: {
    friction: number; // PSI
    elevation: number; // PSI
    total: number; // PSI
  };
}

export interface NFTSystemAnalysis {
  systemId: string;
  channels: number;
  channelLength: number; // feet
  channelSlope: number; // degrees
  targetFlowRate: number; // L/min per channel
  actualFlowRate: number; // L/min per channel
  filmThickness: number; // mm
  velocity: number; // cm/s
  retentionTime: number; // minutes
  uniformity: {
    flowDistribution: number; // % between channels
    filmConsistency: number; // %
  };
  recommendations: string[];
}

export interface EbbFlowAnalysis {
  systemId: string;
  tableArea: number; // sq ft
  tankVolume: number; // gallons
  floodVolume: number; // gallons
  drainVolume: number; // gallons
  cycleTime: {
    flood: number; // minutes
    drain: number; // minutes
    total: number; // minutes
  };
  flowRates: {
    flood: number; // GPM
    drain: number; // GPM
  };
  efficiency: {
    waterUse: number; // %
    energyUse: number; // %
  };
  recommendations: string[];
}

export interface DWCAnalysis {
  systemId: string;
  reservoirVolume: number; // gallons
  airFlowRate: number; // CFM
  dissolvedOxygen: number; // mg/L
  waterTemperature: number; // °F
  circulationRate: number; // GPH
  oxygenationEfficiency: number; // %
  turnoverRate: number; // times per hour
  recommendations: string[];
}

export interface AeroponicAnalysis {
  systemId: string;
  mistingPressure: number; // PSI
  dropletSize: number; // microns
  sprayVolume: number; // ml/min per nozzle
  sprayPattern: 'cone' | 'fan' | 'stream';
  coverage: number; // % root zone coverage
  mistingCycle: {
    on: number; // seconds
    off: number; // minutes
    frequency: number; // cycles per hour
  };
  efficiency: {
    water: number; // %
    coverage: number; // %
  };
  recommendations: string[];
}

// Dripper nozzle database with detailed flow characteristics
export const dripperNozzleDatabase: Record<string, DripperNozzle> = {
  'netafim-pc-cnl-05': {
    id: 'netafim-pc-cnl-05',
    manufacturer: 'Netafim',
    model: 'PC CNL 0.5 GPH',
    nominalFlowRate: 0.5,
    ratedPressure: 14.5,
    pressureCompensating: true,
    coefficientOfVariation: 5,
    minPressure: 10,
    maxPressure: 60,
    orificeSize: 0.7,
    antiDrainPressure: 3.5,
    flushingPressure: 14.5
  },
  'netafim-pc-cnl-10': {
    id: 'netafim-pc-cnl-10',
    manufacturer: 'Netafim',
    model: 'PC CNL 1.0 GPH',
    nominalFlowRate: 1.0,
    ratedPressure: 14.5,
    pressureCompensating: true,
    coefficientOfVariation: 5,
    minPressure: 10,
    maxPressure: 60,
    orificeSize: 1.0,
    antiDrainPressure: 3.5,
    flushingPressure: 14.5
  },
  'rainbird-pc-18': {
    id: 'rainbird-pc-18',
    manufacturer: 'Rain Bird',
    model: 'PC-18 (0.5 GPH)',
    nominalFlowRate: 0.5,
    ratedPressure: 15,
    pressureCompensating: true,
    coefficientOfVariation: 7,
    minPressure: 8,
    maxPressure: 50,
    orificeSize: 0.8,
    antiDrainPressure: 3.0
  },
  'toro-pc-05': {
    id: 'toro-pc-05',
    manufacturer: 'Toro',
    model: 'PC 0.5 GPH',
    nominalFlowRate: 0.5,
    ratedPressure: 15,
    pressureCompensating: true,
    coefficientOfVariation: 6,
    minPressure: 10,
    maxPressure: 45,
    orificeSize: 0.75
  }
};

// Pump performance database with detailed curves
export const pumpPerformanceDatabase: Record<string, PumpPerformance> = {
  'little-giant-nk-2': {
    id: 'little-giant-nk-2',
    manufacturer: 'Little Giant',
    model: 'NK-2',
    maxFlowRate: 1200, // GPH
    maxPressure: 18,
    peakEfficiency: 65,
    optimumFlowRate: 800,
    impellerDiameter: 4.5,
    motorHP: 0.33,
    inletSize: 1.25,
    outletSize: 1,
    npshr: 8,
    curves: [
      { pressure: 0, flowRate: 20, efficiency: 45, powerDraw: 180 },
      { pressure: 5, flowRate: 18, efficiency: 55, powerDraw: 190 },
      { pressure: 10, flowRate: 15, efficiency: 65, powerDraw: 200 },
      { pressure: 15, flowRate: 12, efficiency: 60, powerDraw: 220 },
      { pressure: 18, flowRate: 8, efficiency: 50, powerDraw: 240 }
    ]
  },
  'pentair-sta-rite-3hp': {
    id: 'pentair-sta-rite-3hp',
    manufacturer: 'Pentair Sta-Rite',
    model: 'Dyna-Pro 3HP',
    maxFlowRate: 150, // GPM
    maxPressure: 80,
    peakEfficiency: 78,
    optimumFlowRate: 110,
    impellerDiameter: 8.5,
    motorHP: 3,
    inletSize: 3,
    outletSize: 2,
    npshr: 12,
    curves: [
      { pressure: 0, flowRate: 150, efficiency: 65, powerDraw: 1800 },
      { pressure: 20, flowRate: 140, efficiency: 72, powerDraw: 1950 },
      { pressure: 40, flowRate: 120, efficiency: 78, powerDraw: 2100 },
      { pressure: 60, flowRate: 90, efficiency: 75, powerDraw: 2300 },
      { pressure: 80, flowRate: 50, efficiency: 65, powerDraw: 2500 }
    ]
  }
};

/**
 * Calculate actual dripper flow rate based on pressure
 */
export function calculateDripperFlowRate(
  dripper: DripperNozzle,
  actualPressure: number
): number {
  if (dripper.pressureCompensating) {
    // Pressure compensating drippers maintain constant flow within operating range
    if (actualPressure < dripper.minPressure) {
      // Below minimum pressure - reduced flow
      const ratio = actualPressure / dripper.minPressure;
      return dripper.nominalFlowRate * Math.sqrt(ratio);
    } else if (actualPressure > dripper.maxPressure) {
      // Above maximum pressure - potential damage or increased flow
      return dripper.nominalFlowRate * 1.1; // 10% increase assumption
    } else {
      // Within operating range - constant flow
      return dripper.nominalFlowRate;
    }
  } else {
    // Non-pressure compensating - flow varies with square root of pressure
    const pressureRatio = actualPressure / dripper.ratedPressure;
    return dripper.nominalFlowRate * Math.sqrt(pressureRatio);
  }
}

/**
 * Calculate pressure loss through dripper line
 */
export function calculatePressureLoss(
  lineLength: number, // feet
  tubeDiameter: number, // inches
  flowRate: number, // GPM
  elevation: number = 0 // feet
): { friction: number; elevation: number; total: number } {
  // Hazen-Williams equation for friction loss
  const C = 150; // Hazen-Williams coefficient for polyethylene
  const frictionLoss = 4.52 * Math.pow(flowRate, 1.85) * lineLength / 
    (Math.pow(C, 1.85) * Math.pow(tubeDiameter, 4.87));
  
  // Elevation pressure loss (0.433 PSI per foot)
  const elevationLoss = elevation * 0.433;
  
  return {
    friction: frictionLoss,
    elevation: elevationLoss,
    total: frictionLoss + elevationLoss
  };
}

/**
 * Analyze dripper line uniformity
 */
export function analyzeDripperLineUniformity(
  flowRates: number[] // GPH per dripper
): { coefficient: number; distribution: number; emission: number } {
  const n = flowRates.length;
  const average = flowRates.reduce((sum, rate) => sum + rate, 0) / n;
  
  // Coefficient of variation (CV)
  const variance = flowRates.reduce((sum, rate) => sum + Math.pow(rate - average, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);
  const coefficient = (standardDeviation / average) * 100;
  
  // Distribution uniformity (DU) - lowest 25% average / overall average
  const sorted = flowRates.sort((a, b) => a - b);
  const lowestQuarter = sorted.slice(0, Math.ceil(n * 0.25));
  const lowestAverage = lowestQuarter.reduce((sum, rate) => sum + rate, 0) / lowestQuarter.length;
  const distribution = (lowestAverage / average) * 100;
  
  // Emission uniformity (EU) - 1 - (CV / 100)
  const emission = Math.max(0, 100 - coefficient);
  
  return { coefficient, distribution, emission };
}

/**
 * Find optimal pump operating point
 */
export function findOptimalPumpOperatingPoint(
  pump: PumpPerformance,
  systemDemand: { flowRate: number; pressure: number }
): { operatingPoint: PumpCurve; efficiency: number; powerConsumption: number } | null {
  // Find closest curve point to system demand
  let closestPoint = pump.curves[0];
  let minDistance = Infinity;
  
  for (const point of pump.curves) {
    const distance = Math.sqrt(
      Math.pow(point.flowRate - systemDemand.flowRate, 2) +
      Math.pow(point.pressure - systemDemand.pressure, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  }
  
  return {
    operatingPoint: closestPoint,
    efficiency: closestPoint.efficiency,
    powerConsumption: closestPoint.powerDraw
  };
}

/**
 * Calculate system flow requirements
 */
export function calculateSystemFlowRequirements(
  plantCount: number,
  dripperFlowRate: number, // GPH per dripper
  irrigationDuration: number, // minutes per cycle
  cyclesPerDay: number
): {
  totalDailyFlow: number; // gallons
  peakFlowRate: number; // GPM
  averageFlowRate: number; // GPM
} {
  const totalDailyFlow = plantCount * dripperFlowRate * (irrigationDuration / 60) * cyclesPerDay;
  const peakFlowRate = (plantCount * dripperFlowRate) / 60; // Convert GPH to GPM
  const averageFlowRate = totalDailyFlow / (24 * 60); // Spread over 24 hours
  
  return {
    totalDailyFlow,
    peakFlowRate,
    averageFlowRate
  };
}

/**
 * Recommend dripper spacing for uniform coverage
 */
export function recommendDripperSpacing(
  soilType: 'sand' | 'loam' | 'clay' | 'coco' | 'rockwool',
  dripperFlowRate: number, // GPH
  plantSpacing: number // inches
): {
  recommendedSpacing: number; // inches
  wetPattern: { diameter: number; depth: number }; // inches
  reasoning: string;
} {
  const soilCharacteristics = {
    sand: { lateral: 6, vertical: 18 },
    loam: { lateral: 12, vertical: 12 },
    clay: { lateral: 18, vertical: 6 },
    coco: { lateral: 8, vertical: 10 },
    rockwool: { lateral: 4, vertical: 8 }
  };
  
  const soil = soilCharacteristics[soilType];
  const wetDiameter = soil.lateral;
  const wetDepth = soil.vertical;
  
  // Recommend spacing based on 80% overlap for uniform coverage
  const recommendedSpacing = Math.min(plantSpacing, wetDiameter * 0.8);
  
  return {
    recommendedSpacing,
    wetPattern: { diameter: wetDiameter, depth: wetDepth },
    reasoning: `For ${soilType}, drippers create ${wetDiameter}" diameter wet pattern. ` +
              `Recommended ${recommendedSpacing}" spacing ensures 80% overlap for uniform coverage.`
  };
}

/**
 * Analyze NFT system flow performance
 */
export function analyzeNFTSystem(
  channels: number,
  channelLength: number, // feet
  channelSlope: number, // degrees
  targetFlowRate: number, // L/min per channel
  channelWidth: number = 4 // inches
): NFTSystemAnalysis {
  // Calculate film thickness based on flow rate and slope
  const slopeRadians = (channelSlope * Math.PI) / 180;
  const filmThickness = Math.pow((targetFlowRate * 1000) / (channelWidth * 25.4 * Math.sin(slopeRadians) * 9.81), 1/3); // mm
  
  // Calculate velocity
  const velocity = (targetFlowRate * 1000) / (channelWidth * 25.4 * filmThickness); // cm/s
  
  // Calculate retention time
  const retentionTime = (channelLength * 30.48) / (velocity / 100); // minutes
  
  // Flow distribution uniformity (simplified calculation)
  const flowDistribution = Math.max(85, 100 - (channelLength * 0.5)); // Longer channels = less uniform
  
  // Film consistency
  const filmConsistency = Math.max(80, 100 - Math.abs(channelSlope - 2) * 5); // 2° is optimal
  
  const recommendations: string[] = [];
  
  if (filmThickness < 1) {
    recommendations.push('Flow rate too low - risk of inadequate nutrient delivery');
  } else if (filmThickness > 3) {
    recommendations.push('Flow rate too high - risk of poor oxygenation');
  }
  
  if (velocity < 0.1) {
    recommendations.push('Flow velocity too slow - risk of nutrient depletion');
  } else if (velocity > 3) {
    recommendations.push('Flow velocity too fast - risk of root damage');
  }
  
  if (retentionTime > 3) {
    recommendations.push('Consider increasing flow rate or reducing channel length');
  }
  
  if (channelSlope < 1 || channelSlope > 4) {
    recommendations.push('Optimal slope is 1-4 degrees for best performance');
  }

  return {
    systemId: `nft-${channels}ch`,
    channels,
    channelLength,
    channelSlope,
    targetFlowRate,
    actualFlowRate: targetFlowRate, // Assuming target is achieved
    filmThickness,
    velocity,
    retentionTime,
    uniformity: {
      flowDistribution,
      filmConsistency
    },
    recommendations
  };
}

/**
 * Analyze Ebb & Flow system performance
 */
export function analyzeEbbFlowSystem(
  tableArea: number, // sq ft
  tankVolume: number, // gallons
  floodDepth: number, // inches
  floodDuration: number, // minutes
  drainDuration: number, // minutes
  pumpFlowRate: number, // GPM
  tableLength?: number, // feet (optional for dimension-specific analysis)
  tableWidth?: number // feet (optional for dimension-specific analysis)
): EbbFlowAnalysis {
  // Calculate flood and drain volumes
  const floodVolume = (tableArea * floodDepth) / 12 * 7.48; // Convert to gallons
  const drainVolume = floodVolume * 0.95; // Assume 5% retained
  
  // Calculate actual flow rates
  const actualFloodRate = floodVolume / floodDuration;
  const actualDrainRate = drainVolume / drainDuration;
  
  // Calculate cycle time
  const totalCycleTime = floodDuration + drainDuration;
  
  // Calculate efficiencies
  const waterUseEfficiency = (drainVolume / floodVolume) * 100;
  const pumpEfficiency = Math.min(100, (actualFloodRate / pumpFlowRate) * 100);
  
  const recommendations: string[] = [];
  
  // Table dimension-specific analysis
  if (tableLength && tableWidth) {
    const aspectRatio = Math.max(tableLength, tableWidth) / Math.min(tableLength, tableWidth);
    
    if (aspectRatio > 4) {
      recommendations.push(`Long aspect ratio (${aspectRatio.toFixed(1)}:1) - consider multiple drain points for uniform drainage`);
    }
    
    if (tableLength > 12 || tableWidth > 8) {
      recommendations.push('Large table - ensure multiple flood/drain inlets for even distribution');
    }
    
    // Specific dimension recommendations
    if (tableLength === 16 && tableWidth === 4) {
      recommendations.push('16x4 table: Use 3 drain zones, flood from both ends for best uniformity');
    } else if (tableLength === 12 && tableWidth === 8) {
      recommendations.push('12x8 table: Use 4 drain points in grid pattern for optimal drainage');
    } else if (tableLength === 10 && tableWidth === 10) {
      recommendations.push('10x10 table: Center drain with sloped edges works best for large square tables');
    }
    
    // Calculate optimal pump sizing based on dimensions
    const perimeterDrainLength = (tableLength + tableWidth) * 2;
    const recommendedFlowRate = Math.max(actualFloodRate * 1.5, perimeterDrainLength * 0.5);
    
    if (pumpFlowRate < recommendedFlowRate) {
      recommendations.push(`Consider ${recommendedFlowRate.toFixed(0)} GPM pump for ${tableLength}x${tableWidth} table`);
    }
  }
  
  if (floodDepth < 1) {
    recommendations.push('Flood depth too shallow - may not reach all roots');
  } else if (floodDepth > 6) {
    recommendations.push('Flood depth too deep - wastes water and reduces oxygenation');
  }
  
  if (floodDuration < 5) {
    recommendations.push('Flood duration too short - roots may not get adequate water');
  } else if (floodDuration > 30) {
    recommendations.push('Flood duration too long - may cause root rot');
  }
  
  if (drainDuration < 15) {
    recommendations.push('Drain duration too short - insufficient root oxygenation');
  }
  
  if (pumpFlowRate < actualFloodRate * 1.2) {
    recommendations.push('Pump undersized - consider larger pump for reliable flooding');
  }
  
  // Table size-specific recommendations
  if (tableArea > 80) {
    recommendations.push('Large table (>80 sq ft) - consider zone flooding for water conservation');
  }
  
  if (tableArea < 20) {
    recommendations.push('Small table (<20 sq ft) - can use simpler single-zone flooding');
  }

  return {
    systemId: `ebb-flow-${tableArea}sf`,
    tableArea,
    tankVolume,
    floodVolume,
    drainVolume,
    cycleTime: {
      flood: floodDuration,
      drain: drainDuration,
      total: totalCycleTime
    },
    flowRates: {
      flood: actualFloodRate,
      drain: actualDrainRate
    },
    efficiency: {
      waterUse: waterUseEfficiency,
      energyUse: pumpEfficiency
    },
    recommendations
  };
}

/**
 * Analyze DWC system performance
 */
export function analyzeDWCSystem(
  reservoirVolume: number, // gallons
  airPumpCFM: number, // CFM
  waterTemperature: number, // °F
  circulationPumpGPH: number, // GPH
  targetDO: number = 8 // mg/L dissolved oxygen
): DWCAnalysis {
  // Calculate actual dissolved oxygen based on temperature and aeration
  const doCapacity = getDissolvedOxygenCapacity(waterTemperature);
  const aerationEfficiency = Math.min(1, airPumpCFM / (reservoirVolume * 0.1)); // Rule of thumb: 0.1 CFM per gallon
  const actualDO = doCapacity * aerationEfficiency;
  
  // Calculate turnover rate
  const turnoverRate = circulationPumpGPH / reservoirVolume;
  
  // Calculate oxygenation efficiency
  const oxygenationEfficiency = (actualDO / targetDO) * 100;
  
  const recommendations: string[] = [];
  
  if (actualDO < targetDO) {
    recommendations.push(`Increase aeration - current DO: ${actualDO.toFixed(1)} mg/L, target: ${targetDO} mg/L`);
  }
  
  if (waterTemperature > 75) {
    recommendations.push('Water temperature too high - consider chilling for better DO');
  } else if (waterTemperature < 60) {
    recommendations.push('Water temperature too low - may slow plant growth');
  }
  
  if (turnoverRate < 1) {
    recommendations.push('Increase circulation rate - water should turn over at least once per hour');
  }
  
  if (airPumpCFM < reservoirVolume * 0.05) {
    recommendations.push('Air pump undersized - recommend 0.1 CFM per gallon minimum');
  }

  return {
    systemId: `dwc-${reservoirVolume}gal`,
    reservoirVolume,
    airFlowRate: airPumpCFM,
    dissolvedOxygen: actualDO,
    waterTemperature,
    circulationRate: circulationPumpGPH,
    oxygenationEfficiency,
    turnoverRate,
    recommendations
  };
}

/**
 * Analyze Aeroponic system performance
 */
export function analyzeAeroponicSystem(
  mistingPressure: number, // PSI
  nozzleCount: number,
  sprayVolumePerNozzle: number, // ml/min
  mistingCycleOn: number, // seconds
  mistingCycleOff: number, // minutes
  rootZoneArea: number // sq ft
): AeroponicAnalysis {
  // Calculate droplet size based on pressure
  const dropletSize = calculateDropletSize(mistingPressure);
  
  // Calculate coverage
  const nozzleCoverage = 4; // sq ft per nozzle (typical)
  const totalCoverage = nozzleCount * nozzleCoverage;
  const coveragePercentage = Math.min(100, (totalCoverage / rootZoneArea) * 100);
  
  // Calculate spray pattern
  const sprayPattern: 'cone' | 'fan' | 'stream' = mistingPressure > 80 ? 'cone' : 
                                                  mistingPressure > 40 ? 'fan' : 'stream';
  
  // Calculate cycle frequency
  const cycleFrequency = 60 / (mistingCycleOff + (mistingCycleOn / 60));
  
  // Calculate total spray volume
  const totalSprayVolume = nozzleCount * sprayVolumePerNozzle;
  
  // Calculate water efficiency
  const waterEfficiency = Math.min(100, 120 - (dropletSize / 10)); // Smaller droplets = better efficiency
  
  const recommendations: string[] = [];
  
  if (mistingPressure < 40) {
    recommendations.push('Pressure too low - increase to 60-100 PSI for optimal atomization');
  } else if (mistingPressure > 100) {
    recommendations.push('Pressure too high - may damage roots, reduce to 60-100 PSI');
  }
  
  if (dropletSize > 50) {
    recommendations.push('Droplet size too large - increase pressure for better atomization');
  } else if (dropletSize < 5) {
    recommendations.push('Droplet size too small - may not provide adequate water');
  }
  
  if (coveragePercentage < 80) {
    recommendations.push('Insufficient nozzle coverage - add more nozzles or adjust placement');
  }
  
  if (mistingCycleOn > 30) {
    recommendations.push('Misting duration too long - reduce to 10-30 seconds');
  } else if (mistingCycleOn < 5) {
    recommendations.push('Misting duration too short - increase to 10-30 seconds');
  }
  
  if (mistingCycleOff < 3) {
    recommendations.push('Misting interval too short - roots need 3-5 minutes between cycles');
  }

  return {
    systemId: `aero-${nozzleCount}nozzles`,
    mistingPressure,
    dropletSize,
    sprayVolume: sprayVolumePerNozzle,
    sprayPattern,
    coverage: coveragePercentage,
    mistingCycle: {
      on: mistingCycleOn,
      off: mistingCycleOff,
      frequency: cycleFrequency
    },
    efficiency: {
      water: waterEfficiency,
      coverage: coveragePercentage
    },
    recommendations
  };
}

/**
 * Helper function to get dissolved oxygen capacity based on temperature
 */
function getDissolvedOxygenCapacity(temperature: number): number {
  // Dissolved oxygen capacity in mg/L at sea level
  const tempCelsius = (temperature - 32) * 5/9;
  return 14.652 - 0.41022 * tempCelsius + 0.007991 * Math.pow(tempCelsius, 2) - 0.000077774 * Math.pow(tempCelsius, 3);
}

/**
 * Helper function to calculate droplet size based on pressure
 */
function calculateDropletSize(pressure: number): number {
  // Simplified relationship: higher pressure = smaller droplets
  // Typical range: 5-100 microns
  return Math.max(5, 100 - (pressure - 20) * 1.2);
}

/**
 * Standard flood table configurations
 */
export const floodTablePresets = {
  '2x4': { length: 4, width: 2, area: 8, tankSize: 25, recommendedPump: 5 },
  '4x4': { length: 4, width: 4, area: 16, tankSize: 50, recommendedPump: 8 },
  '4x8': { length: 8, width: 4, area: 32, tankSize: 100, recommendedPump: 15 },
  '4x12': { length: 12, width: 4, area: 48, tankSize: 150, recommendedPump: 20 },
  '4x16': { length: 16, width: 4, area: 64, tankSize: 200, recommendedPump: 25 },
  '6x8': { length: 8, width: 6, area: 48, tankSize: 150, recommendedPump: 20 },
  '6x12': { length: 12, width: 6, area: 72, tankSize: 220, recommendedPump: 30 },
  '8x8': { length: 8, width: 8, area: 64, tankSize: 200, recommendedPump: 25 },
  '8x12': { length: 12, width: 8, area: 96, tankSize: 300, recommendedPump: 35 },
  '10x10': { length: 10, width: 10, area: 100, tankSize: 350, recommendedPump: 40 },
  '12x12': { length: 12, width: 12, area: 144, tankSize: 500, recommendedPump: 50 }
};

/**
 * Get optimal flood table configuration recommendations
 */
export function getFloodTableRecommendations(
  targetArea: number, // sq ft
  spaceLength: number, // feet
  spaceWidth: number // feet
): {
  recommended: string[];
  alternatives: string[];
  considerations: string[];
} {
  const recommendations: string[] = [];
  const alternatives: string[] = [];
  const considerations: string[] = [];
  
  // Find tables that fit the space
  const fittingTables = Object.entries(floodTablePresets).filter(([_, config]) => 
    config.length <= spaceLength && config.width <= spaceWidth
  );
  
  // Sort by how close to target area
  fittingTables.sort((a, b) => 
    Math.abs(a[1].area - targetArea) - Math.abs(b[1].area - targetArea)
  );
  
  if (fittingTables.length > 0) {
    const [bestSize, bestConfig] = fittingTables[0];
    recommendations.push(`${bestSize} table (${bestConfig.area} sq ft) - best fit for your space`);
    
    // Add alternatives
    fittingTables.slice(1, 4).forEach(([size, config]) => {
      alternatives.push(`${size} table (${config.area} sq ft)`);
    });
  }
  
  // Add considerations based on space constraints
  if (spaceLength > 12) {
    considerations.push('Long space allows for 16ft tables with excellent plant access');
  }
  
  if (spaceWidth >= 8) {
    considerations.push('Wide space allows for square tables with center access');
  }
  
  if (targetArea > 80) {
    considerations.push('Large area - consider multiple smaller tables for better management');
  }
  
  return { recommended: recommendations, alternatives, considerations };
}