// Growing Degree Day (GDD) calculation and harvest prediction system
// Base temperature and GDD requirements for common crops

export interface CropGDDData {
  name: string;
  category: string;
  baseTemp: number; // Base temperature in Fahrenheit
  gddToMaturity: number; // GDD required from planting to harvest
  optimalTemp: {
    day: number;
    night: number;
  };
  temperatureTolerance: {
    min: number;
    max: number;
  };
  co2Requirements: {
    vegetative: number; // ppm
    flowering: number; // ppm
    fruiting: number; // ppm
  };
  varieties: {
    [variety: string]: {
      gddToMaturity: number;
      daysToMaturity: number; // Typical days under ideal conditions
      harvestWindow: number; // Days of optimal harvest window
      qualityFactors: {
        temperatureStress: number; // Impact factor 0-1
        co2Response: number; // Impact factor 0-1
        lightRequirement: number; // DLI (Daily Light Integral)
      };
    };
  };
  growthStages: {
    germination: number;
    vegetative: number;
    flowering: number;
    maturity: number;
  };
}

export const CROP_GDD_DATABASE: Record<string, CropGDDData> = {
  'Butter Lettuce': {
    name: 'Butter Lettuce',
    category: 'Leafy Greens',
    baseTemp: 32,
    gddToMaturity: 900,
    optimalTemp: { day: 65, night: 55 },
    temperatureTolerance: { min: 35, max: 75 },
    co2Requirements: { vegetative: 800, flowering: 1000, fruiting: 1000 },
    varieties: {
      'Boston Bibb': { 
        gddToMaturity: 850, 
        daysToMaturity: 65, 
        harvestWindow: 10,
        qualityFactors: { temperatureStress: 0.8, co2Response: 0.7, lightRequirement: 12 }
      },
      'Buttercrunch': { 
        gddToMaturity: 900, 
        daysToMaturity: 70, 
        harvestWindow: 12,
        qualityFactors: { temperatureStress: 0.75, co2Response: 0.65, lightRequirement: 14 }
      },
      'Tom Thumb': { 
        gddToMaturity: 750, 
        daysToMaturity: 55, 
        harvestWindow: 8,
        qualityFactors: { temperatureStress: 0.9, co2Response: 0.6, lightRequirement: 10 }
      }
    },
    growthStages: { germination: 100, vegetative: 400, flowering: 700, maturity: 900 }
  },
  'Roma Tomatoes': {
    name: 'Roma Tomatoes',
    category: 'Vine Crops',
    baseTemp: 50,
    gddToMaturity: 2100,
    optimalTemp: { day: 75, night: 65 },
    temperatureTolerance: { min: 50, max: 95 },
    co2Requirements: { vegetative: 1000, flowering: 1200, fruiting: 1500 },
    varieties: {
      'San Marzano': { 
        gddToMaturity: 2200, 
        daysToMaturity: 85, 
        harvestWindow: 21,
        qualityFactors: { temperatureStress: 0.6, co2Response: 0.9, lightRequirement: 25 }
      },
      'Roma VF': { 
        gddToMaturity: 2000, 
        daysToMaturity: 78, 
        harvestWindow: 28,
        qualityFactors: { temperatureStress: 0.7, co2Response: 0.85, lightRequirement: 22 }
      },
      'Italian Gold': { 
        gddToMaturity: 2150, 
        daysToMaturity: 82, 
        harvestWindow: 25,
        qualityFactors: { temperatureStress: 0.65, co2Response: 0.9, lightRequirement: 24 }
      }
    },
    growthStages: { germination: 200, vegetative: 800, flowering: 1400, maturity: 2100 }
  },
  'Spinach': {
    name: 'Spinach',
    category: 'Leafy Greens',
    baseTemp: 32,
    gddToMaturity: 600,
    optimalTemp: { day: 60, night: 50 },
    temperatureTolerance: { min: 25, max: 70 },
    co2Requirements: { vegetative: 600, flowering: 800, fruiting: 800 },
    varieties: {
      'Space': { 
        gddToMaturity: 550, 
        daysToMaturity: 40, 
        harvestWindow: 14,
        qualityFactors: { temperatureStress: 0.85, co2Response: 0.6, lightRequirement: 10 }
      },
      'Bloomsdale': { 
        gddToMaturity: 650, 
        daysToMaturity: 48, 
        harvestWindow: 16,
        qualityFactors: { temperatureStress: 0.8, co2Response: 0.65, lightRequirement: 12 }
      },
      'Tyee': { 
        gddToMaturity: 580, 
        daysToMaturity: 45, 
        harvestWindow: 12,
        qualityFactors: { temperatureStress: 0.9, co2Response: 0.55, lightRequirement: 9 }
      }
    },
    growthStages: { germination: 80, vegetative: 300, flowering: 500, maturity: 600 }
  },
  'Basil': {
    name: 'Basil',
    category: 'Herbs',
    baseTemp: 50,
    gddToMaturity: 1200,
    varieties: {
      'Genovese': { gddToMaturity: 1150, daysToMaturity: 70, harvestWindow: 30 },
      'Purple Ruffles': { gddToMaturity: 1250, daysToMaturity: 75, harvestWindow: 28 },
      'Lemon Basil': { gddToMaturity: 1100, daysToMaturity: 65, harvestWindow: 35 }
    },
    growthStages: { germination: 150, vegetative: 600, flowering: 1000, maturity: 1200 }
  },
  'Carrots': {
    name: 'Carrots',
    category: 'Root Vegetables',
    baseTemp: 32,
    gddToMaturity: 1300,
    varieties: {
      'Nantes': { gddToMaturity: 1250, daysToMaturity: 75, harvestWindow: 21 },
      'Chantenay': { gddToMaturity: 1350, daysToMaturity: 80, harvestWindow: 28 },
      'Purple Haze': { gddToMaturity: 1200, daysToMaturity: 70, harvestWindow: 25 }
    },
    growthStages: { germination: 120, vegetative: 600, flowering: 1100, maturity: 1300 }
  },
  'Broccoli': {
    name: 'Broccoli',
    category: 'Brassicas',
    baseTemp: 32,
    gddToMaturity: 1500,
    varieties: {
      'Calabrese': { gddToMaturity: 1450, daysToMaturity: 85, harvestWindow: 10 },
      'De Cicco': { gddToMaturity: 1300, daysToMaturity: 75, harvestWindow: 12 },
      'Purple Sprouting': { gddToMaturity: 1600, daysToMaturity: 95, harvestWindow: 21 }
    },
    growthStages: { germination: 150, vegetative: 800, flowering: 1200, maturity: 1500 }
  },
  'Strawberries': {
    name: 'Strawberries',
    category: 'Berries',
    baseTemp: 32,
    gddToMaturity: 1800,
    varieties: {
      'Albion': { gddToMaturity: 1750, daysToMaturity: 90, harvestWindow: 45 },
      'Seascape': { gddToMaturity: 1850, daysToMaturity: 95, harvestWindow: 50 },
      'Chandler': { gddToMaturity: 1700, daysToMaturity: 85, harvestWindow: 42 }
    },
    growthStages: { germination: 200, vegetative: 800, flowering: 1400, maturity: 1800 }
  },
  'Cannabis': {
    name: 'Cannabis',
    category: 'Cannabis',
    baseTemp: 50,
    gddToMaturity: 2500,
    varieties: {
      'Blue Dream': { gddToMaturity: 2400, daysToMaturity: 110, harvestWindow: 14 },
      'OG Kush': { gddToMaturity: 2600, daysToMaturity: 120, harvestWindow: 16 },
      'White Widow': { gddToMaturity: 2350, daysToMaturity: 105, harvestWindow: 12 }
    },
    growthStages: { germination: 300, vegetative: 1200, flowering: 2000, maturity: 2500 }
  }
};

export interface WeatherData {
  date: Date;
  highTemp: number;
  lowTemp: number;
  avgTemp?: number;
  humidity?: number;
  co2?: number;
  lightHours?: number;
  windSpeed?: number;
}

export interface ClimateConditions {
  temperature: {
    current: number;
    optimal: number;
    stress: number; // 0-1, where 1 is maximum stress
  };
  co2: {
    current: number;
    optimal: number;
    efficiency: number; // 0-1, photosynthetic efficiency
  };
  light: {
    dailyIntegral: number; // DLI
    required: number;
    saturation: number; // 0-1
  };
}

export interface PlantingRecord {
  id: string;
  cropName: string;
  variety: string;
  plantingDate: Date;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
  quantity: number;
  unit: string;
  fieldId?: string;
  notes?: string;
}

export interface HarvestPrediction {
  plantingId: string;
  cropName: string;
  variety: string;
  plantingDate: Date;
  currentGDD: number;
  requiredGDD: number;
  progressPercent: number;
  estimatedHarvestDate: Date;
  harvestWindow: {
    earliest: Date;
    latest: Date;
    optimal: Date;
  };
  confidence: number;
  currentStage: 'germination' | 'vegetative' | 'flowering' | 'maturity' | 'harvest';
  quantity: number;
  unit: string;
  weatherRisk: 'low' | 'medium' | 'high';
  qualityPrediction: 'premium' | 'standard' | 'processing';
}

// Calculate Growing Degree Days for a given day
export function calculateDailyGDD(highTemp: number, lowTemp: number, baseTemp: number): number {
  const avgTemp = (highTemp + lowTemp) / 2;
  const gdd = Math.max(0, avgTemp - baseTemp);
  return gdd;
}

// Calculate temperature stress factor
export function calculateTemperatureStress(
  currentTemp: number, 
  optimalRange: { day: number; night: number },
  tolerance: { min: number; max: number }
): number {
  const optimal = (optimalRange.day + optimalRange.night) / 2;
  
  if (currentTemp >= tolerance.min && currentTemp <= tolerance.max) {
    // Within tolerance - calculate stress based on distance from optimal
    const deviation = Math.abs(currentTemp - optimal);
    const maxDeviation = Math.max(optimal - tolerance.min, tolerance.max - optimal);
    return Math.min(1, deviation / maxDeviation);
  }
  
  // Outside tolerance - maximum stress
  return 1;
}

// Calculate CO2 efficiency factor
export function calculateCO2Efficiency(currentCO2: number, optimalCO2: number): number {
  if (currentCO2 >= optimalCO2) {
    return 1; // Maximum efficiency at or above optimal
  }
  
  // Michaelis-Menten kinetics approximation for CO2 response
  const km = optimalCO2 * 0.3; // Half-saturation constant
  return currentCO2 / (currentCO2 + km);
}

// Calculate climate-adjusted GDD
export function calculateClimateAdjustedGDD(
  weather: WeatherData,
  cropData: CropGDDData,
  variety: string,
  growthStage: keyof CropGDDData['growthStages']
): number {
  const baseGDD = calculateDailyGDD(weather.highTemp, weather.lowTemp, cropData.baseTemp);
  const varietyData = cropData.varieties[variety];
  
  if (!varietyData) return baseGDD;
  
  // Calculate stress factors
  const tempStress = calculateTemperatureStress(
    weather.avgTemp || (weather.highTemp + weather.lowTemp) / 2,
    cropData.optimalTemp,
    cropData.temperatureTolerance
  );
  
  const co2Efficiency = weather.co2 ? 
    calculateCO2Efficiency(weather.co2, cropData.co2Requirements[growthStage as keyof typeof cropData.co2Requirements] || cropData.co2Requirements.vegetative) : 
    0.8; // Default efficiency if CO2 not measured
  
  // Light saturation factor (simplified)
  const lightSaturation = weather.lightHours ? 
    Math.min(1, weather.lightHours / varietyData.qualityFactors.lightRequirement) : 
    0.8; // Default if light not measured
  
  // Adjust GDD based on climate factors
  const stressReduction = 1 - (tempStress * varietyData.qualityFactors.temperatureStress);
  const co2Boost = 1 + ((co2Efficiency - 0.8) * varietyData.qualityFactors.co2Response);
  const lightFactor = 0.7 + (lightSaturation * 0.3); // Light affects growth rate
  
  return baseGDD * stressReduction * co2Boost * lightFactor;
}

// Enhanced harvest prediction with climate factors
export function calculateClimateConditions(
  weather: WeatherData,
  cropData: CropGDDData,
  variety: string,
  currentStage: string
): ClimateConditions {
  const varietyData = cropData.varieties[variety];
  const avgTemp = weather.avgTemp || (weather.highTemp + weather.lowTemp) / 2;
  const optimalTemp = (cropData.optimalTemp.day + cropData.optimalTemp.night) / 2;
  
  const stageKey = currentStage as keyof typeof cropData.co2Requirements;
  const optimalCO2 = cropData.co2Requirements[stageKey] || cropData.co2Requirements.vegetative;
  
  return {
    temperature: {
      current: avgTemp,
      optimal: optimalTemp,
      stress: calculateTemperatureStress(avgTemp, cropData.optimalTemp, cropData.temperatureTolerance)
    },
    co2: {
      current: weather.co2 || 400, // Ambient CO2
      optimal: optimalCO2,
      efficiency: calculateCO2Efficiency(weather.co2 || 400, optimalCO2)
    },
    light: {
      dailyIntegral: weather.lightHours || 12,
      required: varietyData?.qualityFactors.lightRequirement || 12,
      saturation: Math.min(1, (weather.lightHours || 12) / (varietyData?.qualityFactors.lightRequirement || 12))
    }
  };
}

// Calculate accumulated GDD from planting date to current date
export function calculateAccumulatedGDD(
  plantingDate: Date,
  currentDate: Date,
  weatherData: WeatherData[],
  baseTemp: number
): number {
  let totalGDD = 0;
  
  const relevantWeather = weatherData.filter(day => 
    day.date >= plantingDate && day.date <= currentDate
  );
  
  for (const day of relevantWeather) {
    totalGDD += calculateDailyGDD(day.highTemp, day.lowTemp, baseTemp);
  }
  
  return totalGDD;
}

// Predict harvest date based on current GDD and remaining requirement
export function predictHarvestDate(
  currentDate: Date,
  currentGDD: number,
  requiredGDD: number,
  avgDailyGDD: number
): Date {
  const remainingGDD = requiredGDD - currentGDD;
  const daysRemaining = Math.ceil(remainingGDD / avgDailyGDD);
  
  const harvestDate = new Date(currentDate);
  harvestDate.setDate(harvestDate.getDate() + daysRemaining);
  
  return harvestDate;
}

// Generate enhanced harvest prediction with climate factors
export function generateHarvestPrediction(
  planting: PlantingRecord,
  weatherData: WeatherData[],
  currentDate: Date = new Date()
): HarvestPrediction | null {
  const cropData = CROP_GDD_DATABASE[planting.cropName];
  if (!cropData) return null;
  
  const varietyData = cropData.varieties[planting.variety];
  if (!varietyData) return null;
  
  // Calculate both traditional and climate-adjusted GDD
  const currentGDD = calculateAccumulatedGDD(
    planting.plantingDate,
    currentDate,
    weatherData,
    cropData.baseTemp
  );
  
  // Determine current growth stage
  let currentStage: HarvestPrediction['currentStage'] = 'germination';
  if (currentGDD >= cropData.growthStages.maturity) currentStage = 'harvest';
  else if (currentGDD >= cropData.growthStages.flowering) currentStage = 'maturity';
  else if (currentGDD >= cropData.growthStages.vegetative) currentStage = 'flowering';
  else if (currentGDD >= cropData.growthStages.germination) currentStage = 'vegetative';
  
  // Calculate climate-adjusted accumulated GDD for more accurate prediction
  let climateAdjustedGDD = 0;
  const relevantWeather = weatherData.filter(day => 
    day.date >= planting.plantingDate && day.date <= currentDate
  );
  
  for (const day of relevantWeather) {
    climateAdjustedGDD += calculateClimateAdjustedGDD(day, cropData, planting.variety, currentStage);
  }
  
  const requiredGDD = varietyData.gddToMaturity;
  const progressPercent = Math.min(100, (climateAdjustedGDD / requiredGDD) * 100);
  
  // Calculate recent weather conditions and trends
  const recentWeather = weatherData
    .filter(day => {
      const daysDiff = (currentDate.getTime() - day.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= 0 && daysDiff <= 14;
    })
    .slice(-14);
  
  // Calculate climate-adjusted daily GDD average
  const avgDailyGDD = recentWeather.length > 0
    ? recentWeather.reduce((sum, day) => 
        sum + calculateClimateAdjustedGDD(day, cropData, planting.variety, currentStage), 0
      ) / recentWeather.length
    : 15; // Fallback average
  
  const estimatedHarvestDate = predictHarvestDate(
    currentDate,
    climateAdjustedGDD,
    requiredGDD,
    avgDailyGDD
  );
  
  // Calculate harvest window with climate factor adjustments
  const baseWindowDays = varietyData.harvestWindow;
  const climateConditions = recentWeather.length > 0 ? 
    calculateClimateConditions(recentWeather[recentWeather.length - 1], cropData, planting.variety, currentStage) :
    null;
  
  // Adjust harvest window based on climate stress
  const climateStress = climateConditions ? 
    (climateConditions.temperature.stress + (1 - climateConditions.co2.efficiency) + (1 - climateConditions.light.saturation)) / 3 :
    0.3;
  
  const adjustedWindowDays = baseWindowDays * (1 + climateStress * 0.5); // Stress increases window uncertainty
  
  const harvestWindow = {
    earliest: new Date(estimatedHarvestDate.getTime() - (adjustedWindowDays / 2) * 24 * 60 * 60 * 1000),
    latest: new Date(estimatedHarvestDate.getTime() + (adjustedWindowDays / 2) * 24 * 60 * 60 * 1000),
    optimal: estimatedHarvestDate
  };
  
  // Enhanced confidence calculation with climate factors
  let confidence = 0.4; // Lower base confidence
  if (recentWeather.length >= 14) confidence += 0.3;
  if (progressPercent > 50) confidence += 0.2;
  if (climateConditions && climateStress < 0.3) confidence += 0.15; // Low stress improves confidence
  if (recentWeather.some(day => day.co2 && day.lightHours)) confidence += 0.1; // Data completeness
  confidence = Math.min(1.0, confidence);
  
  // Enhanced weather risk assessment
  const recentTemps = recentWeather.map(day => (day.highTemp + day.lowTemp) / 2);
  const tempVariance = recentTemps.length > 0 
    ? recentTemps.reduce((sum, temp, _, arr) => {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        return sum + Math.pow(temp - avg, 2);
      }, 0) / recentTemps.length
    : 0;
  
  let weatherRisk: HarvestPrediction['weatherRisk'] = 'low';
  
  // Factor in climate stress and temperature variance
  const riskScore = tempVariance / 50 + (climateStress * 2);
  
  if (riskScore > 2.5) weatherRisk = 'high';
  else if (riskScore > 1.5) weatherRisk = 'medium';
  
  // Enhanced quality prediction with climate factors
  let qualityPrediction: HarvestPrediction['qualityPrediction'] = 'standard';
  
  if (climateConditions) {
    const qualityScore = (
      (1 - climateConditions.temperature.stress) * 0.4 +
      climateConditions.co2.efficiency * 0.3 +
      climateConditions.light.saturation * 0.3
    );
    
    if (qualityScore > 0.8 && weatherRisk === 'low') {
      qualityPrediction = 'premium';
    } else if (qualityScore < 0.5 || weatherRisk === 'high') {
      qualityPrediction = 'processing';
    }
  } else {
    // Fallback to simpler calculation
    if (weatherRisk === 'low' && progressPercent > 75) qualityPrediction = 'premium';
    else if (weatherRisk === 'high' || progressPercent < 25) qualityPrediction = 'processing';
  }
  
  return {
    plantingId: planting.id,
    cropName: planting.cropName,
    variety: planting.variety,
    plantingDate: planting.plantingDate,
    currentGDD: climateAdjustedGDD, // Use climate-adjusted value
    requiredGDD,
    progressPercent,
    estimatedHarvestDate,
    harvestWindow,
    confidence,
    currentStage,
    quantity: planting.quantity,
    unit: planting.unit,
    weatherRisk,
    qualityPrediction
  };
}

// Generate predictions for multiple plantings
export function generateBulkHarvestPredictions(
  plantings: PlantingRecord[],
  weatherData: WeatherData[],
  currentDate: Date = new Date()
): HarvestPrediction[] {
  return plantings
    .map(planting => generateHarvestPrediction(planting, weatherData, currentDate))
    .filter((prediction): prediction is HarvestPrediction => prediction !== null);
}

// Get seasonal planting recommendations
export function getPlantingRecommendations(
  cropName: string,
  location: { latitude: number; longitude: number },
  targetHarvestDate: Date
): {
  recommendedPlantingDate: Date;
  plantingWindow: { earliest: Date; latest: Date };
  expectedYield: string;
  riskFactors: string[];
} | null {
  const cropData = CROP_GDD_DATABASE[cropName];
  if (!cropData) return null;
  
  // Simplified calculation - in production, this would use historical weather data
  const avgDailyGDD = 15; // Approximate for temperate climates
  const daysToMaturity = cropData.gddToMaturity / avgDailyGDD;
  
  const recommendedPlantingDate = new Date(targetHarvestDate);
  recommendedPlantingDate.setDate(recommendedPlantingDate.getDate() - daysToMaturity);
  
  const plantingWindow = {
    earliest: new Date(recommendedPlantingDate.getTime() - 7 * 24 * 60 * 60 * 1000),
    latest: new Date(recommendedPlantingDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  };
  
  const riskFactors = [];
  
  // Check for seasonal risks (simplified)
  const month = targetHarvestDate.getMonth();
  if (month >= 11 || month <= 2) riskFactors.push('Cold weather risk');
  if (month >= 6 && month <= 8) riskFactors.push('Heat stress risk');
  
  return {
    recommendedPlantingDate,
    plantingWindow,
    expectedYield: 'Standard yield expected',
    riskFactors
  };
}

// Mock weather data generator for development
export function generateMockWeatherData(
  startDate: Date,
  endDate: Date,
  location: { latitude: number; longitude: number }
): WeatherData[] {
  const weatherData: WeatherData[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Generate realistic temperature data based on season and location
    const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const seasonalTemp = 60 + 20 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
    
    const variation = (Math.random() - 0.5) * 20;
    const avgTemp = seasonalTemp + variation;
    
    weatherData.push({
      date: new Date(currentDate),
      highTemp: avgTemp + 10 + Math.random() * 10,
      lowTemp: avgTemp - 10 - Math.random() * 10,
      avgTemp
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return weatherData;
}