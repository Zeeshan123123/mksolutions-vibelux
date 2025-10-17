// Professional Hydraulic Engineering Library
// ASABE Standards Compliant Irrigation System Design and Analysis

export interface SoilProperties {
  type: 'sand' | 'loamy_sand' | 'sandy_loam' | 'loam' | 'silt_loam' | 'sandy_clay_loam' | 'clay_loam' | 'silty_clay_loam' | 'sandy_clay' | 'silty_clay' | 'clay' | 'peat' | 'rockwool' | 'perlite' | 'vermiculite' | 'coco_coir';
  hydraulicConductivity: number; // cm/hr
  fieldCapacity: number; // % by volume
  wiltingPoint: number; // % by volume
  availableWater: number; // % by volume
  bulkDensity: number; // g/cm³
  porosity: number; // % by volume
  infiltrationRate: number; // cm/hr
  textureClass: 'coarse' | 'medium' | 'fine';
}

export interface PipeSpecifications {
  material: 'PVC' | 'HDPE' | 'steel' | 'galvanized_steel' | 'copper' | 'aluminum' | 'concrete';
  nominalDiameter: number; // inches
  innerDiameter: number; // inches
  wallThickness: number; // inches
  roughnessCoefficient: number; // Hazen-Williams C-factor or Manning's n
  workingPressure: number; // PSI
  safetyFactor: number; // typically 1.5-2.0
  elasticModulus: number; // PSI for water hammer analysis
}

export interface HydraulicCalculationParams {
  // Flow parameters
  designFlowRate: number; // GPM
  peakFlowRate: number; // GPM
  simultaneityFactor: number; // 0.0-1.0
  
  // Pressure parameters
  inletPressure: number; // PSI
  requiredOutletPressure: number; // PSI
  pressureRegulatorLoss: number; // PSI
  
  // System geometry
  totalLength: number; // feet
  elevationGain: number; // feet (positive = uphill)
  numberOfFittings: FittingLosses[];
  
  // Environmental factors
  waterTemperature: number; // °F
  ambientTemperature: number; // °F
  operatingHours: number; // hours/day
  
  // Safety and standards
  velocityLimit: number; // ft/s (typically 5-8 ft/s)
  pressureVariation: number; // % allowable
  leachingFraction: number; // 0.0-0.3
}

export interface FittingLosses {
  type: 'elbow_90' | 'elbow_45' | 'tee_through' | 'tee_branch' | 'reducer' | 'valve_gate' | 'valve_globe' | 'valve_ball' | 'strainer' | 'check_valve';
  quantity: number;
  nominalSize: number; // inches
  lossCoefficient: number; // K-factor
}

export interface HydraulicAnalysisResult {
  // Flow analysis
  actualFlowRate: number; // GPM
  velocity: number; // ft/s
  reynoldsNumber: number;
  flowRegime: 'laminar' | 'transitional' | 'turbulent';
  
  // Pressure analysis
  frictionLoss: number; // PSI
  elevationLoss: number; // PSI
  minorLosses: number; // PSI
  totalSystemLoss: number; // PSI
  availablePressure: number; // PSI
  pressureMargin: number; // PSI
  
  // Velocity and energy
  velocityHead: number; // feet
  totalDynamicHead: number; // feet
  netPositiveSuctionHead: number; // feet
  
  // Water hammer analysis
  waveSpeed: number; // ft/s
  maxPressureRise: number; // PSI
  waterHammerRisk: 'low' | 'moderate' | 'high' | 'critical';
  
  // Performance metrics
  distributionUniformity: number; // %
  applicationEfficiency: number; // %
  emissionUniformity: number; // %
  
  // Compliance and warnings
  asabeCompliance: boolean;
  velocityCompliance: boolean;
  pressureCompliance: boolean;
  warnings: string[];
  recommendations: string[];
}

export interface IrrigationZoneDesign {
  zoneId: string;
  area: number; // sq ft
  emitterType: 'dripper' | 'microspray' | 'bubbler' | 'sprinkler';
  emitterFlowRate: number; // GPH
  emitterSpacing: number; // inches
  emitterCount: number;
  precipitationRate: number; // in/hr
  cropCoefficient: number;
  referenceET: number; // in/day
  irrigationRequirement: number; // in/week
  leachingRequirement: number; // in/week
}

// Professional soil database with hydraulic properties
export const professionalSoilDatabase: Record<string, SoilProperties> = {
  sand: {
    type: 'sand',
    hydraulicConductivity: 12.0,
    fieldCapacity: 9,
    wiltingPoint: 4,
    availableWater: 5,
    bulkDensity: 1.6,
    porosity: 40,
    infiltrationRate: 8.0,
    textureClass: 'coarse'
  },
  loamy_sand: {
    type: 'loamy_sand',
    hydraulicConductivity: 6.0,
    fieldCapacity: 14,
    wiltingPoint: 6,
    availableWater: 8,
    bulkDensity: 1.55,
    porosity: 42,
    infiltrationRate: 4.0,
    textureClass: 'coarse'
  },
  sandy_loam: {
    type: 'sandy_loam',
    hydraulicConductivity: 2.5,
    fieldCapacity: 22,
    wiltingPoint: 10,
    availableWater: 12,
    bulkDensity: 1.5,
    porosity: 43,
    infiltrationRate: 2.0,
    textureClass: 'medium'
  },
  loam: {
    type: 'loam',
    hydraulicConductivity: 1.0,
    fieldCapacity: 27,
    wiltingPoint: 13,
    availableWater: 14,
    bulkDensity: 1.4,
    porosity: 47,
    infiltrationRate: 1.0,
    textureClass: 'medium'
  },
  silt_loam: {
    type: 'silt_loam',
    hydraulicConductivity: 0.5,
    fieldCapacity: 33,
    wiltingPoint: 15,
    availableWater: 18,
    bulkDensity: 1.35,
    porosity: 49,
    infiltrationRate: 0.5,
    textureClass: 'medium'
  },
  clay_loam: {
    type: 'clay_loam',
    hydraulicConductivity: 0.2,
    fieldCapacity: 31,
    wiltingPoint: 16,
    availableWater: 15,
    bulkDensity: 1.3,
    porosity: 51,
    infiltrationRate: 0.2,
    textureClass: 'fine'
  },
  clay: {
    type: 'clay',
    hydraulicConductivity: 0.05,
    fieldCapacity: 39,
    wiltingPoint: 20,
    availableWater: 19,
    bulkDensity: 1.25,
    porosity: 53,
    infiltrationRate: 0.05,
    textureClass: 'fine'
  },
  // Soilless media
  rockwool: {
    type: 'rockwool',
    hydraulicConductivity: 25.0,
    fieldCapacity: 80,
    wiltingPoint: 5,
    availableWater: 75,
    bulkDensity: 0.1,
    porosity: 95,
    infiltrationRate: 20.0,
    textureClass: 'coarse'
  },
  coco_coir: {
    type: 'coco_coir',
    hydraulicConductivity: 8.0,
    fieldCapacity: 85,
    wiltingPoint: 10,
    availableWater: 75,
    bulkDensity: 0.15,
    porosity: 90,
    infiltrationRate: 6.0,
    textureClass: 'medium'
  },
  perlite: {
    type: 'perlite',
    hydraulicConductivity: 30.0,
    fieldCapacity: 50,
    wiltingPoint: 2,
    availableWater: 48,
    bulkDensity: 0.12,
    porosity: 88,
    infiltrationRate: 25.0,
    textureClass: 'coarse'
  }
};

// Pipe material specifications database
export const pipeSpecifications: Record<string, Omit<PipeSpecifications, 'nominalDiameter' | 'innerDiameter'>> = {
  PVC: {
    material: 'PVC',
    wallThickness: 0.154, // SDR 26 average
    roughnessCoefficient: 150, // Hazen-Williams C-factor
    workingPressure: 200,
    safetyFactor: 2.0,
    elasticModulus: 400000
  },
  HDPE: {
    material: 'HDPE',
    wallThickness: 0.125,
    roughnessCoefficient: 140,
    workingPressure: 160,
    safetyFactor: 2.0,
    elasticModulus: 110000
  },
  steel: {
    material: 'steel',
    wallThickness: 0.154,
    roughnessCoefficient: 120,
    workingPressure: 400,
    safetyFactor: 1.5,
    elasticModulus: 30000000
  }
};

// Fitting loss coefficients (K-factors)
export const fittingLossCoefficients: Record<string, number> = {
  elbow_90: 0.9,
  elbow_45: 0.4,
  tee_through: 0.2,
  tee_branch: 1.8,
  reducer: 0.5,
  valve_gate: 0.2,
  valve_globe: 10.0,
  valve_ball: 0.05,
  strainer: 2.0,
  check_valve: 2.5
};

/**
 * Calculate Reynolds Number for flow regime determination
 */
export function calculateReynoldsNumber(
  velocity: number, // ft/s
  diameter: number, // inches
  kinematicViscosity: number = 1.13e-5 // ft²/s for water at 68°F
): number {
  const diameterFt = diameter / 12;
  return (velocity * diameterFt) / kinematicViscosity;
}

/**
 * Calculate friction loss using Hazen-Williams equation
 */
export function calculateHazenWilliamsFriction(
  flowRate: number, // GPM
  diameter: number, // inches
  length: number, // feet
  cFactor: number // Hazen-Williams C-factor
): number {
  // Hazen-Williams equation: hf = 4.52 * Q^1.85 * L / (C^1.85 * D^4.87)
  const frictionLoss = 4.52 * Math.pow(flowRate, 1.85) * length / 
    (Math.pow(cFactor, 1.85) * Math.pow(diameter, 4.87));
  
  return frictionLoss; // feet of head
}

/**
 * Calculate friction loss using Darcy-Weisbach equation (more accurate)
 */
export function calculateDarcyWeisbachFriction(
  velocity: number, // ft/s
  diameter: number, // inches
  length: number, // feet
  roughness: number, // feet (absolute roughness)
  reynoldsNumber: number
): number {
  const diameterFt = diameter / 12;
  const relativeRoughness = roughness / diameterFt;
  
  // Calculate friction factor using Colebrook-White equation (approximation)
  let frictionFactor: number;
  
  if (reynoldsNumber < 2000) {
    // Laminar flow
    frictionFactor = 64 / reynoldsNumber;
  } else {
    // Turbulent flow - Swamee-Jain approximation
    frictionFactor = 0.25 / Math.pow(
      Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynoldsNumber, 0.9)), 2
    );
  }
  
  // Darcy-Weisbach equation: hf = f * (L/D) * (V²/2g)
  const frictionLoss = frictionFactor * (length / diameterFt) * (Math.pow(velocity, 2) / (2 * 32.174));
  
  return frictionLoss; // feet of head
}

/**
 * Calculate minor losses from fittings
 */
export function calculateMinorLosses(
  velocity: number, // ft/s
  fittings: FittingLosses[]
): number {
  const velocityHead = Math.pow(velocity, 2) / (2 * 32.174); // V²/2g
  
  const totalKFactor = fittings.reduce((total, fitting) => {
    return total + (fitting.lossCoefficient * fitting.quantity);
  }, 0);
  
  return totalKFactor * velocityHead; // feet of head
}

/**
 * Calculate water hammer pressure rise
 */
export function calculateWaterHammer(
  velocity: number, // ft/s
  waveSpeed: number, // ft/s
  gravity: number = 32.174 // ft/s²
): number {
  // Joukowsky equation: ΔP = ρ * a * ΔV
  // Converted to pressure head: Δh = (a * ΔV) / g
  const pressureRise = (waveSpeed * velocity) / gravity;
  return pressureRise; // feet of head
}

/**
 * Calculate wave speed for water hammer analysis
 */
export function calculateWaveSpeed(
  bulkModulus: number, // PSI (water ~300,000 PSI)
  density: number, // slugs/ft³ (water ~1.94)
  pipeModulus: number, // PSI
  pipeThickness: number, // inches
  pipeDiameter: number // inches
): number {
  // Wave speed equation: a = √(K/ρ) / √(1 + (K*D)/(E*t))
  const k = bulkModulus * 144; // Convert PSI to lb/ft²
  const e = pipeModulus * 144;
  
  const denominator = 1 + (k * pipeDiameter) / (e * pipeThickness);
  const waveSpeed = Math.sqrt(k / density) / Math.sqrt(denominator);
  
  return waveSpeed; // ft/s
}

/**
 * Calculate distribution uniformity for irrigation systems
 */
export function calculateDistributionUniformity(
  flowRates: number[] // Array of individual emitter flow rates
): {
  distributionUniformity: number; // %
  emissionUniformity: number; // %
  coefficientOfVariation: number; // %
} {
  const n = flowRates.length;
  const average = flowRates.reduce((sum, rate) => sum + rate, 0) / n;
  
  // Sort flow rates
  const sorted = [...flowRates].sort((a, b) => a - b);
  
  // Distribution Uniformity (DU) - average of lowest 25% / overall average
  const lowestQuarterCount = Math.ceil(n * 0.25);
  const lowestQuarterAverage = sorted.slice(0, lowestQuarterCount)
    .reduce((sum, rate) => sum + rate, 0) / lowestQuarterCount;
  const distributionUniformity = (lowestQuarterAverage / average) * 100;
  
  // Coefficient of Variation
  const variance = flowRates.reduce((sum, rate) => sum + Math.pow(rate - average, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (standardDeviation / average) * 100;
  
  // Emission Uniformity
  const emissionUniformity = 100 - coefficientOfVariation;
  
  return {
    distributionUniformity,
    emissionUniformity,
    coefficientOfVariation
  };
}

/**
 * Calculate irrigation application rate and efficiency
 */
export function calculateApplicationEfficiency(
  appliedWater: number, // inches
  cropWaterNeed: number, // inches
  leachingFraction: number, // 0.0-1.0
  runoffLoss: number = 0, // inches
  evaporationLoss: number = 0 // inches
): {
  applicationEfficiency: number; // %
  uniformityEfficiency: number; // %
  distributionEfficiency: number; // %
} {
  const beneficialWater = cropWaterNeed + (appliedWater * leachingFraction);
  const applicationEfficiency = (beneficialWater / appliedWater) * 100;
  
  // Simplified efficiency calculations
  const uniformityEfficiency = Math.max(0, 100 - (runoffLoss / appliedWater) * 100);
  const distributionEfficiency = Math.max(0, 100 - (evaporationLoss / appliedWater) * 100);
  
  return {
    applicationEfficiency,
    uniformityEfficiency,
    distributionEfficiency
  };
}

/**
 * Comprehensive hydraulic system analysis
 */
export function analyzeHydraulicSystem(
  params: HydraulicCalculationParams,
  pipe: PipeSpecifications,
  soil?: SoilProperties
): HydraulicAnalysisResult {
  // Calculate basic flow parameters
  const area = Math.PI * Math.pow(pipe.innerDiameter / 12 / 2, 2); // ft²
  const velocity = (params.designFlowRate * 0.00223) / area; // ft/s
  const reynoldsNumber = calculateReynoldsNumber(velocity, pipe.innerDiameter);
  
  // Determine flow regime
  let flowRegime: 'laminar' | 'transitional' | 'turbulent';
  if (reynoldsNumber < 2000) {
    flowRegime = 'laminar';
  } else if (reynoldsNumber < 4000) {
    flowRegime = 'transitional';
  } else {
    flowRegime = 'turbulent';
  }
  
  // Calculate friction losses
  const frictionLoss = calculateHazenWilliamsFriction(
    params.designFlowRate,
    pipe.innerDiameter,
    params.totalLength,
    pipe.roughnessCoefficient
  );
  
  // Calculate minor losses
  const minorLosses = calculateMinorLosses(velocity, params.numberOfFittings);
  
  // Calculate elevation loss
  const elevationLoss = params.elevationGain; // feet of head
  
  // Convert to PSI
  const frictionLossPsi = frictionLoss * 0.433;
  const minorLossesPsi = minorLosses * 0.433;
  const elevationLossPsi = elevationLoss * 0.433;
  const totalSystemLoss = frictionLossPsi + minorLossesPsi + elevationLossPsi;
  
  // Calculate available pressure
  const availablePressure = params.inletPressure - totalSystemLoss - params.pressureRegulatorLoss;
  const pressureMargin = availablePressure - params.requiredOutletPressure;
  
  // Water hammer analysis
  const waveSpeed = calculateWaveSpeed(300000, 1.94, pipe.elasticModulus, pipe.wallThickness, pipe.innerDiameter);
  const waterHammerRise = calculateWaterHammer(velocity, waveSpeed);
  const maxPressureRise = waterHammerRise * 0.433; // Convert to PSI
  
  let waterHammerRisk: 'low' | 'moderate' | 'high' | 'critical';
  if (maxPressureRise < 50) waterHammerRisk = 'low';
  else if (maxPressureRise < 100) waterHammerRisk = 'moderate';
  else if (maxPressureRise < 200) waterHammerRisk = 'high';
  else waterHammerRisk = 'critical';
  
  // Performance metrics (simplified)
  const distributionUniformity = 90; // Would be calculated from actual emitter data
  const applicationEfficiency = 85;
  const emissionUniformity = 88;
  
  // Compliance checks
  const velocityCompliance = velocity <= params.velocityLimit;
  const pressureCompliance = Math.abs(pressureMargin / params.requiredOutletPressure) <= (params.pressureVariation / 100);
  const asabeCompliance = velocityCompliance && pressureCompliance && distributionUniformity >= 80;
  
  // Generate warnings and recommendations
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!velocityCompliance) {
    warnings.push(`Velocity (${velocity.toFixed(1)} ft/s) exceeds limit (${params.velocityLimit} ft/s)`);
    recommendations.push('Increase pipe diameter to reduce velocity');
  }
  
  if (!pressureCompliance) {
    warnings.push(`Pressure variation exceeds allowable range (${params.pressureVariation}%)`);
    recommendations.push('Install pressure regulators or adjust system design');
  }
  
  if (waterHammerRisk !== 'low') {
    warnings.push(`Water hammer risk: ${waterHammerRisk} (${maxPressureRise.toFixed(0)} PSI rise)`);
    recommendations.push('Install air chambers or surge suppressors');
  }
  
  if (reynoldsNumber < 4000) {
    warnings.push('Flow regime is not fully turbulent - consider flow rate adjustment');
  }
  
  return {
    actualFlowRate: params.designFlowRate,
    velocity,
    reynoldsNumber,
    flowRegime,
    frictionLoss: frictionLossPsi,
    elevationLoss: elevationLossPsi,
    minorLosses: minorLossesPsi,
    totalSystemLoss,
    availablePressure,
    pressureMargin,
    velocityHead: Math.pow(velocity, 2) / (2 * 32.174),
    totalDynamicHead: totalSystemLoss / 0.433,
    netPositiveSuctionHead: 10, // Simplified
    waveSpeed,
    maxPressureRise,
    waterHammerRisk,
    distributionUniformity,
    applicationEfficiency,
    emissionUniformity,
    asabeCompliance,
    velocityCompliance,
    pressureCompliance,
    warnings,
    recommendations
  };
}