/**
 * Advanced Tomato Nutrient Calculator
 * Calculates precise nutrient requirements based on growth stage, environmental conditions,
 * and production targets for hydroponic and soil-based tomato production
 */

export interface PlantParameters {
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'ripening';
  varietyType: 'determinate' | 'indeterminate' | 'cherry' | 'beefsteak' | 'roma';
  plantAge: number; // days since germination
  plantHeight: number; // cm
  leafCount: number;
  flowerTrussCount?: number;
  fruitCount?: number;
  averageFruitWeight?: number; // grams
}

export interface EnvironmentalConditions {
  temperature: number; // °C
  humidity: number; // %
  co2Level: number; // ppm
  lightIntensity: number; // PPFD μmol/m²/s
  photoperiod: number; // hours
  growingMedium: 'hydroponic' | 'soilless' | 'soil' | 'coco' | 'rockwool';
  ph: number;
  ec: number; // mS/cm
}

export interface ProductionTargets {
  targetYield: number; // kg/m²
  harvestWeeks: number;
  qualityFocus: 'yield' | 'flavor' | 'shelf_life' | 'uniform_size';
  organicCertified: boolean;
}

export interface NutrientRequirements {
  // Primary macronutrients (ppm)
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  
  // Secondary macronutrients (ppm)
  calcium: number;
  magnesium: number;
  sulfur: number;
  
  // Micronutrients (ppm)
  iron: number;
  manganese: number;
  zinc: number;
  copper: number;
  boron: number;
  molybdenum: number;
  
  // Solution parameters
  targetEC: number; // mS/cm
  targetPH: number;
  waterUptake: number; // L/plant/day
  
  // Application rates
  dailyFeedVolume: number; // L/m²
  fertilizerConcentration: number; // g/L
  
  // Growth predictions
  expectedGrowthRate: number; // cm/week
  estimatedYield: number; // kg/m²
  daysToHarvest: number;
}

export interface NutrientProfile {
  name: string;
  description: string;
  baseNutrients: Partial<NutrientRequirements>;
  stageModifiers: Record<string, number>;
  environmentalAdjustments: {
    temperatureCoeff: number;
    lightCoeff: number;
    co2Coeff: number;
    humidityCoeff: number;
  };
}

export const GROWTH_STAGES = {
  seedling: {
    name: 'Seedling',
    duration: '0-21 days',
    description: 'Germination to first true leaves'
  },
  vegetative: {
    name: 'Vegetative Growth',
    duration: '21-42 days', 
    description: 'Rapid stem and leaf development'
  },
  flowering: {
    name: 'Flowering',
    duration: '42-63 days',
    description: 'First flower truss formation'
  },
  fruiting: {
    name: 'Fruit Development',
    duration: '63-90 days',
    description: 'Fruit set and early development'
  },
  ripening: {
    name: 'Ripening',
    duration: '90+ days',
    description: 'Fruit maturation and harvest'
  }
} as const;

export const VARIETY_CHARACTERISTICS = {
  determinate: {
    maxHeight: 120, // cm
    fruitingPeriod: 8, // weeks
    averageYield: 4.5, // kg/m²
    nutrientDemand: 'moderate'
  },
  indeterminate: {
    maxHeight: 250,
    fruitingPeriod: 20,
    averageYield: 8.5,
    nutrientDemand: 'high'
  },
  cherry: {
    maxHeight: 180,
    fruitingPeriod: 16,
    averageYield: 6.0,
    nutrientDemand: 'moderate'
  },
  beefsteak: {
    maxHeight: 200,
    fruitingPeriod: 14,
    averageYield: 7.5,
    nutrientDemand: 'high'
  },
  roma: {
    maxHeight: 100,
    fruitingPeriod: 10,
    averageYield: 5.2,
    nutrientDemand: 'moderate'
  }
} as const;

export const NUTRIENT_PROFILES: Record<string, NutrientProfile> = {
  standard: {
    name: 'Standard Hydroponic',
    description: 'Balanced nutrition for typical growing conditions',
    baseNutrients: {
      nitrogen: 190,
      phosphorus: 50,
      potassium: 220,
      calcium: 180,
      magnesium: 40,
      sulfur: 60,
      iron: 2.8,
      manganese: 0.8,
      zinc: 0.3,
      copper: 0.1,
      boron: 0.5,
      molybdenum: 0.05,
      targetEC: 2.2,
      targetPH: 5.8
    },
    stageModifiers: {
      seedling: 0.4,
      vegetative: 0.8,
      flowering: 1.0,
      fruiting: 1.2,
      ripening: 0.9
    },
    environmentalAdjustments: {
      temperatureCoeff: 0.02,
      lightCoeff: 0.001,
      co2Coeff: 0.0005,
      humidityCoeff: -0.01
    }
  },
  
  high_yield: {
    name: 'High Yield Performance',
    description: 'Optimized for maximum production in controlled environments',
    baseNutrients: {
      nitrogen: 220,
      phosphorus: 65,
      potassium: 280,
      calcium: 200,
      magnesium: 50,
      sulfur: 75,
      iron: 3.2,
      manganese: 1.0,
      zinc: 0.4,
      copper: 0.15,
      boron: 0.6,
      molybdenum: 0.08,
      targetEC: 2.6,
      targetPH: 5.9
    },
    stageModifiers: {
      seedling: 0.3,
      vegetative: 0.9,
      flowering: 1.1,
      fruiting: 1.4,
      ripening: 1.0
    },
    environmentalAdjustments: {
      temperatureCoeff: 0.025,
      lightCoeff: 0.0012,
      co2Coeff: 0.0008,
      humidityCoeff: -0.008
    }
  },
  
  organic: {
    name: 'Organic Certified',
    description: 'OMRI-approved nutrients for organic production',
    baseNutrients: {
      nitrogen: 160,
      phosphorus: 40,
      potassium: 180,
      calcium: 150,
      magnesium: 35,
      sulfur: 50,
      iron: 2.2,
      manganese: 0.6,
      zinc: 0.25,
      copper: 0.08,
      boron: 0.4,
      molybdenum: 0.04,
      targetEC: 1.8,
      targetPH: 6.2
    },
    stageModifiers: {
      seedling: 0.5,
      vegetative: 0.8,
      flowering: 1.0,
      fruiting: 1.1,
      ripening: 0.8
    },
    environmentalAdjustments: {
      temperatureCoeff: 0.015,
      lightCoeff: 0.0008,
      co2Coeff: 0.0003,
      humidityCoeff: -0.012
    }
  },

  flavor_focus: {
    name: 'Flavor Enhancement',
    description: 'Optimized for superior taste and aroma development',
    baseNutrients: {
      nitrogen: 170,
      phosphorus: 45,
      potassium: 240,
      calcium: 190,
      magnesium: 45,
      sulfur: 80,
      iron: 2.5,
      manganese: 0.9,
      zinc: 0.35,
      copper: 0.12,
      boron: 0.55,
      molybdenum: 0.06,
      targetEC: 2.0,
      targetPH: 6.0
    },
    stageModifiers: {
      seedling: 0.4,
      vegetative: 0.7,
      flowering: 0.9,
      fruiting: 1.0,
      ripening: 1.1
    },
    environmentalAdjustments: {
      temperatureCoeff: 0.018,
      lightCoeff: 0.0009,
      co2Coeff: 0.0004,
      humidityCoeff: -0.015
    }
  }
};

/**
 * Calculate comprehensive nutrient requirements for tomato production
 */
export const calculateNutrientRequirements = (
  plantParams: PlantParameters,
  envConditions: EnvironmentalConditions,
  productionTargets: ProductionTargets,
  profileName: keyof typeof NUTRIENT_PROFILES = 'standard'
): NutrientRequirements => {
  const profile = NUTRIENT_PROFILES[profileName];
  const varietyChar = VARIETY_CHARACTERISTICS[plantParams.varietyType];
  const stageModifier = profile.stageModifiers[plantParams.growthStage];
  
  // Environmental adjustments
  const tempAdjustment = 1 + ((envConditions.temperature - 22) * profile.environmentalAdjustments.temperatureCoeff);
  const lightAdjustment = 1 + ((envConditions.lightIntensity - 300) * profile.environmentalAdjustments.lightCoeff);
  const co2Adjustment = 1 + ((envConditions.co2Level - 400) * profile.environmentalAdjustments.co2Coeff);
  const humidityAdjustment = 1 + ((envConditions.humidity - 65) * profile.environmentalAdjustments.humidityCoeff);
  
  const totalEnvironmentalModifier = tempAdjustment * lightAdjustment * co2Adjustment * humidityAdjustment;
  
  // Production target adjustments
  const yieldModifier = productionTargets.targetYield / varietyChar.averageYield;
  const qualityModifier = productionTargets.qualityFocus === 'yield' ? 1.1 : 
                         productionTargets.qualityFocus === 'flavor' ? 0.9 : 1.0;
  
  // Age-based adjustments
  const ageModifier = Math.min(1.0, plantParams.plantAge / 21); // Ramp up over 3 weeks
  
  const finalModifier = stageModifier * totalEnvironmentalModifier * yieldModifier * qualityModifier * ageModifier;
  
  // Calculate water uptake based on plant size and environment
  const leafAreaIndex = Math.log(plantParams.leafCount + 1) * 0.5; // Simplified LAI
  const baseWaterUptake = 0.5; // L/plant/day base
  const waterUptake = baseWaterUptake * 
    (1 + leafAreaIndex * 0.3) * 
    (1 + (envConditions.temperature - 22) * 0.02) * 
    (1 + (envConditions.lightIntensity - 300) * 0.0008) *
    (1 - (envConditions.humidity - 65) * 0.005);
    
  // Growth rate prediction
  const optimalTemp = plantParams.growthStage === 'fruiting' ? 24 : 22;
  const tempStress = Math.abs(envConditions.temperature - optimalTemp) / 10;
  const lightFactor = Math.min(1.0, envConditions.lightIntensity / 400);
  const expectedGrowthRate = (8 - tempStress * 2) * lightFactor * (envConditions.co2Level / 400);
  
  // Yield estimation
  const daysRemaining = Math.max(0, 120 - plantParams.plantAge);
  const harvestFactor = productionTargets.harvestWeeks / 16; // Normalized to 16-week season
  const estimatedYield = varietyChar.averageYield * yieldModifier * lightFactor * harvestFactor;
  
  return {
    // Primary macronutrients
    nitrogen: Math.round((profile.baseNutrients.nitrogen || 0) * finalModifier),
    phosphorus: Math.round((profile.baseNutrients.phosphorus || 0) * finalModifier),
    potassium: Math.round((profile.baseNutrients.potassium || 0) * finalModifier),
    
    // Secondary macronutrients
    calcium: Math.round((profile.baseNutrients.calcium || 0) * finalModifier),
    magnesium: Math.round((profile.baseNutrients.magnesium || 0) * finalModifier),
    sulfur: Math.round((profile.baseNutrients.sulfur || 0) * finalModifier),
    
    // Micronutrients
    iron: Number(((profile.baseNutrients.iron || 0) * finalModifier).toFixed(2)),
    manganese: Number(((profile.baseNutrients.manganese || 0) * finalModifier).toFixed(2)),
    zinc: Number(((profile.baseNutrients.zinc || 0) * finalModifier).toFixed(2)),
    copper: Number(((profile.baseNutrients.copper || 0) * finalModifier).toFixed(3)),
    boron: Number(((profile.baseNutrients.boron || 0) * finalModifier).toFixed(2)),
    molybdenum: Number(((profile.baseNutrients.molybdenum || 0) * finalModifier).toFixed(3)),
    
    // Solution parameters
    targetEC: Number(((profile.baseNutrients.targetEC || 2.0) * Math.sqrt(finalModifier)).toFixed(2)),
    targetPH: profile.baseNutrients.targetPH || 5.8,
    waterUptake: Number(waterUptake.toFixed(2)),
    
    // Application rates
    dailyFeedVolume: Number((waterUptake * 1.2).toFixed(2)), // 20% excess for leaching
    fertilizerConcentration: Number(((profile.baseNutrients.targetEC || 2.0) * 0.64).toFixed(2)), // Rough conversion
    
    // Growth predictions
    expectedGrowthRate: Number(expectedGrowthRate.toFixed(1)),
    estimatedYield: Number(estimatedYield.toFixed(2)),
    daysToHarvest: Math.round(daysRemaining)
  };
};

/**
 * Calculate nutrient deficiency symptoms based on current nutrient levels
 */
export const diagnosePotentialDeficiencies = (
  currentNutrients: Partial<NutrientRequirements>,
  requiredNutrients: NutrientRequirements
) => {
  const deficiencies = [];
  const tolerances = {
    nitrogen: 0.15,
    phosphorus: 0.20,
    potassium: 0.15,
    calcium: 0.10,
    magnesium: 0.20,
    iron: 0.25
  };
  
  Object.entries(tolerances).forEach(([nutrient, tolerance]) => {
    const current = (currentNutrients as any)[nutrient] || 0;
    const required = (requiredNutrients as any)[nutrient] || 0;
    
    if (current < required * (1 - tolerance)) {
      deficiencies.push({
        nutrient,
        severity: ((required - current) / required) * 100,
        symptoms: getNutrientDeficiencySymptoms(nutrient as keyof NutrientRequirements),
        recommendations: getNutrientRecommendations(nutrient as keyof NutrientRequirements)
      });
    }
  });
  
  return deficiencies;
};

const getNutrientDeficiencySymptoms = (nutrient: keyof NutrientRequirements): string[] => {
  const symptoms: Record<string, string[]> = {
    nitrogen: ['Yellowing of older leaves', 'Reduced growth rate', 'Light green coloration'],
    phosphorus: ['Purple/reddish leaf undersides', 'Delayed flowering', 'Stunted growth'],
    potassium: ['Yellow/brown leaf margins', 'Poor fruit quality', 'Reduced disease resistance'],
    calcium: ['Blossom end rot', 'Distorted new growth', 'Leaf tip burn'],
    magnesium: ['Interveinal chlorosis', 'Older leaves affected first', 'Reduced photosynthesis'],
    iron: ['Young leaves chlorotic', 'Interveinal yellowing', 'Reduced vigor']
  };
  
  return symptoms[nutrient] || [];
};

const getNutrientRecommendations = (nutrient: keyof NutrientRequirements): string[] => {
  const recommendations: Record<string, string[]> = {
    nitrogen: ['Increase nitrogen fertilizer', 'Check root health', 'Monitor EC levels'],
    phosphorus: ['Add phosphorus supplement', 'Check pH levels', 'Improve root zone temperature'],
    potassium: ['Increase potassium fertilizer', 'Monitor calcium balance', 'Check water quality'],
    calcium: ['Add calcium supplement', 'Check pH and EC', 'Improve water distribution'],
    magnesium: ['Add magnesium sulfate', 'Check potassium levels', 'Monitor pH'],
    iron: ['Add iron chelate', 'Lower pH if above 6.5', 'Check root oxygenation']
  };
  
  return recommendations[nutrient] || [];
};

export default {
  calculateNutrientRequirements,
  diagnosePotentialDeficiencies,
  GROWTH_STAGES,
  NUTRIENT_PROFILES,
  VARIETY_CHARACTERISTICS
};