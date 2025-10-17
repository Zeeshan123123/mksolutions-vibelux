// Location-Based Analysis (LBA) System
// Analyzes local climate conditions and provides crop-specific recommendations

export interface LocationData {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    street?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  elevation: number; // feet above sea level
  timezone: string;
  climateZone: string; // USDA Hardiness Zone
}

export interface ClimateProfile {
  location: LocationData;
  temperatureData: {
    annual: {
      average: number;
      min: number;
      max: number;
    };
    monthly: Array<{
      month: number;
      avgHigh: number;
      avgLow: number;
      extremeHigh: number;
      extremeLow: number;
      averageTemp: number;
    }>;
    frostDates: {
      lastSpring: Date;
      firstFall: Date;
      frostFreeDays: number;
    };
    heatingDegreeDays: number; // Base 65°F
    coolingDegreeDays: number; // Base 65°F
  };
  precipitationData: {
    annualTotal: number; // inches
    monthly: Array<{
      month: number;
      average: number;
      min: number;
      max: number;
    }>;
    wetSeason: { start: number; end: number }; // month numbers
    drySeason: { start: number; end: number };
  };
  solarData: {
    annualDLI: number; // Daily Light Integral mol/m²/day average
    monthly: Array<{
      month: number;
      averageDLI: number;
      peakDLI: number;
      sunlightHours: number;
    }>;
    lowLightMonths: number[]; // months requiring supplemental lighting
  };
  windData: {
    averageSpeed: number; // mph
    prevailingDirection: string;
    extremeEvents: Array<{
      type: 'hurricane' | 'tornado' | 'severe_storm';
      frequency: number; // events per year
      season: string;
    }>;
  };
  humidityData: {
    annual: {
      average: number;
      min: number;
      max: number;
    };
    monthly: Array<{
      month: number;
      average: number;
      morningAvg: number;
      afternoonAvg: number;
    }>;
  };
}

export interface CropSuitability {
  cropName: string;
  suitabilityScore: number; // 0-100
  growingSeason: {
    optimal: { start: number; end: number }; // month numbers
    possible: { start: number; end: number };
    yearRound: boolean;
  };
  challenges: Array<{
    factor: 'temperature' | 'humidity' | 'light' | 'precipitation' | 'wind';
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
  opportunities: Array<{
    factor: string;
    advantage: string;
    recommendations: string[];
  }>;
  energyRequirements: {
    heating: {
      annualBTU: number;
      peakMonths: number[];
      estimatedCost: number;
    };
    cooling: {
      annualBTU: number;
      peakMonths: number[];
      estimatedCost: number;
      recommendedMethod: 'evaporative' | 'mechanical' | 'natural';
    };
    supplementalLighting: {
      required: boolean;
      months: number[];
      estimatedPower: number; // kW
      estimatedCost: number;
    };
  };
  recommendations: {
    varieties: string[];
    growingMethod: 'greenhouse' | 'tunnel' | 'open_field' | 'hybrid';
    specialConsiderations: string[];
  };
}

export interface LBAReport {
  id: string;
  location: LocationData;
  climateProfile: ClimateProfile;
  analysisDate: Date;
  cropAnalysis: CropSuitability[];
  overallRecommendations: {
    bestCrops: string[];
    seasonalStrategy: string;
    infrastructureNeeds: string[];
    riskFactors: string[];
    opportunities: string[];
  };
  economicAnalysis: {
    operatingCosts: {
      heating: number;
      cooling: number;
      lighting: number;
      water: number;
      total: number;
    };
    productionPotential: {
      cropYield: Record<string, number>; // crop name -> lbs/acre/year
      revenueProjection: number;
    };
    paybackAnalysis: {
      initialInvestment: number;
      annualOperatingCost: number;
      annualRevenue: number;
      paybackPeriod: number; // years
    };
  };
}

// Climate data calculation functions
export function calculateGrowingDegreeDays(
  monthlyTemps: Array<{ month: number; avgHigh: number; avgLow: number }>,
  baseTemp: number,
  cropGrowingMonths: number[]
): number {
  let totalGDD = 0;
  
  monthlyTemps.forEach(monthData => {
    if (cropGrowingMonths.includes(monthData.month)) {
      const dailyAvg = (monthData.avgHigh + monthData.avgLow) / 2;
      const dailyGDD = Math.max(0, dailyAvg - baseTemp);
      const daysInMonth = new Date(2024, monthData.month, 0).getDate();
      totalGDD += dailyGDD * daysInMonth;
    }
  });
  
  return totalGDD;
}

export function calculateVaporPressureDeficit(
  temperature: number,
  humidity: number
): number {
  // Calculate saturation vapor pressure (kPa)
  const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  
  // Calculate actual vapor pressure
  const avp = svp * (humidity / 100);
  
  // VPD = SVP - AVP
  return svp - avp;
}

export function calculateSupplementalLightingNeeds(
  monthlyDLI: Array<{ month: number; averageDLI: number }>,
  requiredDLI: number
): Array<{ month: number; additionalDLI: number; hoursNeeded: number }> {
  return monthlyDLI.map(monthData => {
    const deficit = Math.max(0, requiredDLI - monthData.averageDLI);
    // Estimate hours needed (assuming 150 µmol/m²/s LED efficiency)
    const hoursNeeded = deficit > 0 ? (deficit * 1000000) / (150 * 3600) : 0;
    
    return {
      month: monthData.month,
      additionalDLI: deficit,
      hoursNeeded
    };
  });
}

export function calculateHeatingCoolingLoads(
  location: LocationData,
  monthlyTemps: Array<{ month: number; avgHigh: number; avgLow: number }>,
  targetTemp: { day: number; night: number },
  facilitySize: number // square feet
): {
  heating: Array<{ month: number; btuRequired: number; cost: number }>;
  cooling: Array<{ month: number; btuRequired: number; cost: number }>;
} {
  const heatingLoads: Array<{ month: number; btuRequired: number; cost: number }> = [];
  const coolingLoads: Array<{ month: number; btuRequired: number; cost: number }> = [];
  
  // Simplified heat loss calculation (BTU/hr per sq ft)
  const baseHeatLoss = 15; // BTU/hr/sq ft at 30°F difference
  const baseCoolingLoad = 12; // BTU/hr/sq ft at 20°F difference
  
  monthlyTemps.forEach(monthData => {
    const daysInMonth = new Date(2024, monthData.month, 0).getDate();
    
    // Heating calculation
    const heatingDegreeHours = Math.max(0, (targetTemp.night - monthData.avgLow)) * 12 + 
                              Math.max(0, (targetTemp.day - monthData.avgHigh)) * 12;
    const monthlyHeatingBTU = heatingDegreeHours * baseHeatLoss * facilitySize * daysInMonth;
    const heatingCost = monthlyHeatingBTU * 0.000012; // $12/million BTU natural gas
    
    // Cooling calculation  
    const coolingDegreeHours = Math.max(0, (monthData.avgHigh - targetTemp.day)) * 12;
    const monthlyCoolingBTU = coolingDegreeHours * baseCoolingLoad * facilitySize * daysInMonth;
    const coolingCost = monthlyCoolingBTU * 0.000035; // $35/million BTU electricity
    
    heatingLoads.push({
      month: monthData.month,
      btuRequired: monthlyHeatingBTU,
      cost: heatingCost
    });
    
    coolingLoads.push({
      month: monthData.month,
      btuRequired: monthlyCoolingBTU,
      cost: coolingCost
    });
  });
  
  return { heating: heatingLoads, cooling: coolingLoads };
}

// Crop suitability analysis
export function analyzeCropSuitability(
  climateProfile: ClimateProfile,
  cropName: string,
  cropRequirements: {
    optimalTemp: { min: number; max: number };
    chillHours?: number;
    gddRequired: number;
    baseTemp: number;
    waterNeeds: number; // inches per season
    lightRequirement: number; // DLI
    humidityRange: { min: number; max: number };
    windTolerance: number; // max mph
  }
): CropSuitability {
  let suitabilityScore = 100;
  const challenges: CropSuitability['challenges'] = [];
  const opportunities: CropSuitability['opportunities'] = [];
  
  // Temperature analysis
  const avgTemp = climateProfile.temperatureData.annual.average;
  if (avgTemp < cropRequirements.optimalTemp.min || avgTemp > cropRequirements.optimalTemp.max) {
    const severity = Math.abs(avgTemp - 
      (cropRequirements.optimalTemp.min + cropRequirements.optimalTemp.max) / 2) > 10 ? 'high' : 'medium';
    
    challenges.push({
      factor: 'temperature',
      severity,
      description: `Average temperature (${avgTemp}°F) outside optimal range (${cropRequirements.optimalTemp.min}-${cropRequirements.optimalTemp.max}°F)`,
      mitigation: avgTemp < cropRequirements.optimalTemp.min ? 'Greenhouse heating required' : 'Cooling system recommended'
    });
    
    suitabilityScore -= severity === 'high' ? 25 : 15;
  }
  
  // GDD analysis
  const availableGDD = calculateGrowingDegreeDays(
    climateProfile.temperatureData.monthly,
    cropRequirements.baseTemp,
    [4, 5, 6, 7, 8, 9, 10] // Growing season months
  );
  
  if (availableGDD < cropRequirements.gddRequired) {
    challenges.push({
      factor: 'temperature',
      severity: 'medium',
      description: `Insufficient growing degree days (${availableGDD} available vs ${cropRequirements.gddRequired} required)`,
      mitigation: 'Extend growing season with protected cultivation'
    });
    suitabilityScore -= 20;
  } else {
    opportunities.push({
      factor: 'Growing Degree Days',
      advantage: `Adequate heat units available (${availableGDD} GDD)`,
      recommendations: ['Multiple crops per season possible', 'Early/late season production potential']
    });
  }
  
  // Light analysis
  const winterDLI = Math.min(...climateProfile.solarData.monthly.map(m => m.averageDLI));
  if (winterDLI < cropRequirements.lightRequirement) {
    challenges.push({
      factor: 'light',
      severity: 'medium',
      description: `Insufficient winter light (${winterDLI} DLI vs ${cropRequirements.lightRequirement} required)`,
      mitigation: 'Supplemental LED lighting recommended'
    });
    suitabilityScore -= 15;
  }
  
  // Water analysis
  const annualPrecipitation = climateProfile.precipitationData.annualTotal;
  if (annualPrecipitation < cropRequirements.waterNeeds) {
    challenges.push({
      factor: 'precipitation',
      severity: 'medium',
      description: `Limited precipitation (${annualPrecipitation}" vs ${cropRequirements.waterNeeds}" needed)`,
      mitigation: 'Irrigation system required'
    });
    suitabilityScore -= 10;
  } else {
    opportunities.push({
      factor: 'Water Resources',
      advantage: `Adequate natural precipitation (${annualPrecipitation}")`,
      recommendations: ['Rainwater harvesting potential', 'Reduced irrigation costs']
    });
  }
  
  // Calculate energy requirements
  const facilitySize = 43560; // 1 acre in sq ft
  const energyCalc = calculateHeatingCoolingLoads(
    climateProfile.location,
    climateProfile.temperatureData.monthly,
    { day: (cropRequirements.optimalTemp.min + cropRequirements.optimalTemp.max) / 2, night: cropRequirements.optimalTemp.min },
    facilitySize
  );
  
  const lightingNeeds = calculateSupplementalLightingNeeds(
    climateProfile.solarData.monthly,
    cropRequirements.lightRequirement
  );
  
  // Determine growing season
  const optimalMonths = climateProfile.temperatureData.monthly
    .filter(m => m.averageTemp >= cropRequirements.optimalTemp.min && 
                 m.averageTemp <= cropRequirements.optimalTemp.max)
    .map(m => m.month);
  
  const possibleMonths = climateProfile.temperatureData.monthly
    .filter(m => m.averageTemp >= cropRequirements.optimalTemp.min - 10 && 
                 m.averageTemp <= cropRequirements.optimalTemp.max + 10)
    .map(m => m.month);
  
  return {
    cropName,
    suitabilityScore: Math.max(0, suitabilityScore),
    growingSeason: {
      optimal: { 
        start: Math.min(...optimalMonths) || 4, 
        end: Math.max(...optimalMonths) || 10 
      },
      possible: { 
        start: Math.min(...possibleMonths) || 3, 
        end: Math.max(...possibleMonths) || 11 
      },
      yearRound: optimalMonths.length >= 10
    },
    challenges,
    opportunities,
    energyRequirements: {
      heating: {
        annualBTU: energyCalc.heating.reduce((sum, month) => sum + month.btuRequired, 0),
        peakMonths: energyCalc.heating
          .filter(month => month.btuRequired > 0)
          .sort((a, b) => b.btuRequired - a.btuRequired)
          .slice(0, 3)
          .map(month => month.month),
        estimatedCost: energyCalc.heating.reduce((sum, month) => sum + month.cost, 0)
      },
      cooling: {
        annualBTU: energyCalc.cooling.reduce((sum, month) => sum + month.btuRequired, 0),
        peakMonths: energyCalc.cooling
          .filter(month => month.btuRequired > 0)
          .sort((a, b) => b.btuRequired - a.btuRequired)
          .slice(0, 3)
          .map(month => month.month),
        estimatedCost: energyCalc.cooling.reduce((sum, month) => sum + month.cost, 0),
        recommendedMethod: energyCalc.cooling.reduce((sum, month) => sum + month.btuRequired, 0) > 500000 ? 'mechanical' : 'evaporative'
      },
      supplementalLighting: {
        required: lightingNeeds.some(month => month.additionalDLI > 0),
        months: lightingNeeds.filter(month => month.additionalDLI > 0).map(month => month.month),
        estimatedPower: lightingNeeds.reduce((sum, month) => sum + month.hoursNeeded, 0) * 0.1, // kW estimate
        estimatedCost: lightingNeeds.reduce((sum, month) => sum + month.hoursNeeded * 0.12, 0) // $0.12/kWh
      }
    },
    recommendations: {
      varieties: [], // Would be populated based on specific crop database
      growingMethod: suitabilityScore > 80 ? 'open_field' : 
                    suitabilityScore > 60 ? 'tunnel' : 'greenhouse',
      specialConsiderations: challenges.map(c => c.mitigation)
    }
  };
}

// Generate comprehensive LBA report
export function generateLBAReport(
  location: LocationData,
  climateProfile: ClimateProfile,
  targetCrops: string[]
): LBAReport {
  const cropRequirementsDatabase = {
    'Butter Lettuce': {
      optimalTemp: { min: 55, max: 70 },
      gddRequired: 900,
      baseTemp: 32,
      waterNeeds: 15,
      lightRequirement: 12,
      humidityRange: { min: 60, max: 80 },
      windTolerance: 15
    },
    'Roma Tomatoes': {
      optimalTemp: { min: 65, max: 85 },
      gddRequired: 2100,
      baseTemp: 50,
      waterNeeds: 25,
      lightRequirement: 20,
      humidityRange: { min: 50, max: 70 },
      windTolerance: 20
    },
    'Spinach': {
      optimalTemp: { min: 45, max: 65 },
      gddRequired: 600,
      baseTemp: 32,
      waterNeeds: 12,
      lightRequirement: 10,
      humidityRange: { min: 60, max: 85 },
      windTolerance: 25
    }
  };
  
  const cropAnalysis = targetCrops.map(cropName => {
    const requirements = cropRequirementsDatabase[cropName];
    if (!requirements) {
      throw new Error(`Crop requirements not found for ${cropName}`);
    }
    return analyzeCropSuitability(climateProfile, cropName, requirements);
  });
  
  // Identify best crops
  const bestCrops = cropAnalysis
    .filter(analysis => analysis.suitabilityScore >= 70)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .map(analysis => analysis.cropName);
  
  // Calculate economic projections
  const totalHeatingCost = cropAnalysis.reduce((sum, crop) => sum + crop.energyRequirements.heating.estimatedCost, 0);
  const totalCoolingCost = cropAnalysis.reduce((sum, crop) => sum + crop.energyRequirements.cooling.estimatedCost, 0);
  const totalLightingCost = cropAnalysis.reduce((sum, crop) => sum + crop.energyRequirements.supplementalLighting.estimatedCost, 0);
  
  return {
    id: `lba_${Date.now()}`,
    location,
    climateProfile,
    analysisDate: new Date(),
    cropAnalysis,
    overallRecommendations: {
      bestCrops,
      seasonalStrategy: bestCrops.length > 0 ? 
        'Multi-crop rotation recommended for year-round production' : 
        'Protected cultivation required for viable production',
      infrastructureNeeds: [
        ...(totalHeatingCost > 5000 ? ['Heating system required'] : []),
        ...(totalCoolingCost > 3000 ? ['Cooling system recommended'] : []),
        ...(totalLightingCost > 2000 ? ['Supplemental lighting needed'] : [])
      ],
      riskFactors: [
        ...cropAnalysis.flatMap(crop => 
          crop.challenges
            .filter(challenge => challenge.severity === 'high')
            .map(challenge => challenge.description)
        )
      ],
      opportunities: cropAnalysis.flatMap(crop => 
        crop.opportunities.map(opp => opp.advantage)
      )
    },
    economicAnalysis: {
      operatingCosts: {
        heating: totalHeatingCost,
        cooling: totalCoolingCost,
        lighting: totalLightingCost,
        water: 1500, // Estimated
        total: totalHeatingCost + totalCoolingCost + totalLightingCost + 1500
      },
      productionPotential: {
        cropYield: Object.fromEntries(
          bestCrops.map(crop => [crop, 25000]) // Simplified yield estimate
        ),
        revenueProjection: bestCrops.length * 50000 // Simplified revenue estimate
      },
      paybackAnalysis: {
        initialInvestment: 150000, // Estimated greenhouse setup
        annualOperatingCost: totalHeatingCost + totalCoolingCost + totalLightingCost + 15000,
        annualRevenue: bestCrops.length * 50000,
        paybackPeriod: 150000 / Math.max(1, (bestCrops.length * 50000) - (totalHeatingCost + totalCoolingCost + totalLightingCost + 15000))
      }
    }
  };
}

// Mock climate data generator for development
export function generateMockClimateProfile(location: LocationData): ClimateProfile {
  // Generate realistic climate data based on location
  const baseTemp = 50 + (location.coordinates.latitude - 30) * -1.5; // Cooler as latitude increases
  
  const monthlyTemperatures = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const seasonalVariation = Math.sin((month - 1) * Math.PI / 6) * 25; // ±25°F seasonal swing
    const avgTemp = baseTemp + seasonalVariation;
    
    return {
      month,
      avgHigh: avgTemp + 15,
      avgLow: avgTemp - 15,
      extremeHigh: avgTemp + 25,
      extremeLow: avgTemp - 25,
      averageTemp: avgTemp
    };
  });
  
  const monthlyPrecipitation = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    average: 2 + Math.random() * 3, // 2-5 inches per month
    min: 0.5,
    max: 8
  }));
  
  const monthlySolar = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const seasonalDLI = 15 + Math.sin((month - 1) * Math.PI / 6) * 10; // 5-25 DLI range
    
    return {
      month,
      averageDLI: seasonalDLI,
      peakDLI: seasonalDLI + 5,
      sunlightHours: 8 + Math.sin((month - 1) * Math.PI / 6) * 4 // 4-12 hours
    };
  });
  
  const monthlyHumidity = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    average: 65 + Math.random() * 20, // 65-85% humidity
    morningAvg: 80,
    afternoonAvg: 50
  }));
  
  return {
    location,
    temperatureData: {
      annual: {
        average: baseTemp,
        min: Math.min(...monthlyTemperatures.map(m => m.extremeLow)),
        max: Math.max(...monthlyTemperatures.map(m => m.extremeHigh))
      },
      monthly: monthlyTemperatures,
      frostDates: {
        lastSpring: new Date(2024, 3, 15), // April 15
        firstFall: new Date(2024, 9, 15), // October 15
        frostFreeDays: 183
      },
      heatingDegreeDays: monthlyTemperatures.reduce((sum, month) => 
        sum + Math.max(0, 65 - month.averageTemp) * 30, 0),
      coolingDegreeDays: monthlyTemperatures.reduce((sum, month) => 
        sum + Math.max(0, month.averageTemp - 65) * 30, 0)
    },
    precipitationData: {
      annualTotal: monthlyPrecipitation.reduce((sum, month) => sum + month.average, 0),
      monthly: monthlyPrecipitation,
      wetSeason: { start: 11, end: 3 }, // Nov-Mar
      drySeason: { start: 6, end: 9 } // Jun-Sep
    },
    solarData: {
      annualDLI: monthlySolar.reduce((sum, month) => sum + month.averageDLI, 0) / 12,
      monthly: monthlySolar,
      lowLightMonths: monthlySolar.filter(month => month.averageDLI < 12).map(month => month.month)
    },
    windData: {
      averageSpeed: 8 + Math.random() * 4, // 8-12 mph
      prevailingDirection: 'SW',
      extremeEvents: []
    },
    humidityData: {
      annual: {
        average: 70,
        min: 45,
        max: 95
      },
      monthly: monthlyHumidity
    }
  };
}