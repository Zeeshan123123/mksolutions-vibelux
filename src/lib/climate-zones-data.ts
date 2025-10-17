// Climate and Energy Data for Growing Operations
// This includes USDA zones, energy costs, and optimal growing conditions

export interface ClimateZone {
  id: string;
  name: string;
  coordinates: [number, number][];
  properties: {
    zone: string;
    avgTemp: { min: number; max: number };
    humidity: { min: number; max: number };
    solarRadiation: number; // kWh/m²/day
    heatingDegreeDays: number;
    coolingDegreeDays: number;
    optimalCrops: string[];
    challenges: string[];
  };
}

export interface EnergyRegion {
  id: string;
  state: string;
  coordinates: [number, number];
  energyCosts: {
    residential: number; // $/kWh
    commercial: number; // $/kWh
    industrial: number; // $/kWh
    peakHours: string;
    offPeakDiscount: number; // percentage
  };
  renewableIncentives: {
    solarRebate: number; // $/W
    taxCredit: number; // percentage
    netMetering: boolean;
  };
  carbonIntensity: number; // kg CO2/kWh
}

// Major US energy regions with 2024 data
export const ENERGY_REGIONS: EnergyRegion[] = [
  {
    id: 'ca',
    state: 'California',
    coordinates: [-119.4179, 36.7783],
    energyCosts: {
      residential: 0.28,
      commercial: 0.22,
      industrial: 0.18,
      peakHours: '4PM-8PM',
      offPeakDiscount: 40
    },
    renewableIncentives: {
      solarRebate: 0.20,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.2
  },
  {
    id: 'tx',
    state: 'Texas',
    coordinates: [-99.9018, 31.9686],
    energyCosts: {
      residential: 0.14,
      commercial: 0.09,
      industrial: 0.07,
      peakHours: '3PM-7PM',
      offPeakDiscount: 25
    },
    renewableIncentives: {
      solarRebate: 0,
      taxCredit: 30,
      netMetering: false
    },
    carbonIntensity: 0.4
  },
  {
    id: 'ny',
    state: 'New York',
    coordinates: [-75.4999, 42.1657],
    energyCosts: {
      residential: 0.23,
      commercial: 0.16,
      industrial: 0.12,
      peakHours: '2PM-6PM',
      offPeakDiscount: 35
    },
    renewableIncentives: {
      solarRebate: 0.40,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.3
  },
  {
    id: 'fl',
    state: 'Florida',
    coordinates: [-81.5158, 27.6648],
    energyCosts: {
      residential: 0.13,
      commercial: 0.10,
      industrial: 0.08,
      peakHours: '5PM-9PM',
      offPeakDiscount: 20
    },
    renewableIncentives: {
      solarRebate: 0,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.35
  },
  {
    id: 'co',
    state: 'Colorado',
    coordinates: [-105.7821, 39.5501],
    energyCosts: {
      residential: 0.13,
      commercial: 0.10,
      industrial: 0.08,
      peakHours: '3PM-7PM',
      offPeakDiscount: 30
    },
    renewableIncentives: {
      solarRebate: 0.10,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.5
  },
  {
    id: 'wa',
    state: 'Washington',
    coordinates: [-120.7401, 47.7511],
    energyCosts: {
      residential: 0.10,
      commercial: 0.08,
      industrial: 0.06,
      peakHours: 'None',
      offPeakDiscount: 0
    },
    renewableIncentives: {
      solarRebate: 0,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.1 // Mostly hydro
  },
  {
    id: 'az',
    state: 'Arizona',
    coordinates: [-111.0937, 34.0489],
    energyCosts: {
      residential: 0.13,
      commercial: 0.11,
      industrial: 0.09,
      peakHours: '3PM-8PM',
      offPeakDiscount: 45
    },
    renewableIncentives: {
      solarRebate: 0.10,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.35
  },
  {
    id: 'mi',
    state: 'Michigan',
    coordinates: [-85.6024, 44.3148],
    energyCosts: {
      residential: 0.18,
      commercial: 0.12,
      industrial: 0.09,
      peakHours: '3PM-7PM',
      offPeakDiscount: 25
    },
    renewableIncentives: {
      solarRebate: 0,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.45
  },
  {
    id: 'il',
    state: 'Illinois',
    coordinates: [-89.3985, 40.6331],
    energyCosts: {
      residential: 0.13,
      commercial: 0.09,
      industrial: 0.07,
      peakHours: '2PM-7PM',
      offPeakDiscount: 30
    },
    renewableIncentives: {
      solarRebate: 0.30,
      taxCredit: 30,
      netMetering: true
    },
    carbonIntensity: 0.3
  },
  {
    id: 'ok',
    state: 'Oklahoma',
    coordinates: [-97.9298, 35.0078],
    energyCosts: {
      residential: 0.11,
      commercial: 0.08,
      industrial: 0.06,
      peakHours: '2PM-7PM',
      offPeakDiscount: 20
    },
    renewableIncentives: {
      solarRebate: 0,
      taxCredit: 30,
      netMetering: false
    },
    carbonIntensity: 0.5
  }
];

// Growing climate zones with recommendations
export const GROWING_ZONES = {
  optimal: {
    name: 'Optimal Indoor Growing',
    color: '#10b981',
    opacity: 0.3,
    criteria: {
      energyCost: { max: 0.10 },
      avgTemp: { min: 50, max: 75 },
      humidity: { min: 30, max: 60 }
    },
    benefits: [
      'Low HVAC costs',
      'Minimal dehumidification needed',
      'Year-round stable conditions'
    ]
  },
  moderate: {
    name: 'Moderate Growing Conditions',
    color: '#f59e0b',
    opacity: 0.3,
    criteria: {
      energyCost: { max: 0.15 },
      avgTemp: { min: 40, max: 85 },
      humidity: { min: 20, max: 70 }
    },
    challenges: [
      'Seasonal HVAC adjustments',
      'Moderate energy costs',
      'Some climate control needed'
    ]
  },
  challenging: {
    name: 'Challenging Conditions',
    color: '#ef4444',
    opacity: 0.3,
    criteria: {
      energyCost: { max: 0.30 },
      avgTemp: { min: 20, max: 100 },
      humidity: { min: 10, max: 90 }
    },
    challenges: [
      'High HVAC costs',
      'Extreme temperature swings',
      'Heavy dehumidification needs'
    ]
  }
};

// Calculate estimated operating costs
export function calculateOperatingCosts(
  region: EnergyRegion,
  facilitySize: number, // sq ft
  lightingWatts: number, // total watts
  hvacTons: number
): {
  monthly: {
    lighting: number;
    hvac: number;
    other: number;
    total: number;
  };
  annual: {
    total: number;
    withSolar: number;
    carbonFootprint: number;
  };
  payback: {
    solarROI: number; // years
    ledROI: number; // years
  };
} {
  // Constants
  const hoursPerDay = 18; // typical photoperiod
  const daysPerMonth = 30;
  const hvacWattsPerTon = 3500;
  const otherLoadsWatts = facilitySize * 2; // misc equipment
  
  // Calculate monthly kWh
  const lightingKWh = (lightingWatts / 1000) * hoursPerDay * daysPerMonth;
  const hvacKWh = (hvacTons * hvacWattsPerTon / 1000) * 24 * daysPerMonth * 0.6; // 60% runtime
  const otherKWh = (otherLoadsWatts / 1000) * 24 * daysPerMonth * 0.3; // 30% runtime
  
  // Apply time-of-use rates
  const peakHours = 4; // typical peak hours per day
  const offPeakHours = hoursPerDay - peakHours;
  const peakRatio = peakHours / hoursPerDay;
  const offPeakRatio = offPeakHours / hoursPerDay;
  
  const effectiveRate = region.energyCosts.commercial * 
    (peakRatio + offPeakRatio * (1 - region.energyCosts.offPeakDiscount / 100));
  
  // Calculate costs
  const lightingCost = lightingKWh * effectiveRate;
  const hvacCost = hvacKWh * region.energyCosts.commercial; // HVAC runs 24/7
  const otherCost = otherKWh * region.energyCosts.commercial;
  
  const monthlyTotal = lightingCost + hvacCost + otherCost;
  const annualTotal = monthlyTotal * 12;
  
  // Solar calculations
  const solarSystemSize = (lightingWatts + hvacTons * hvacWattsPerTon) / 1000 * 1.2; // kW with 20% overhead
  const solarCost = solarSystemSize * 2500; // $2.50/W installed
  const solarIncentive = solarSystemSize * 1000 * region.renewableIncentives.solarRebate;
  const taxCredit = (solarCost - solarIncentive) * region.renewableIncentives.taxCredit / 100;
  const netSolarCost = solarCost - solarIncentive - taxCredit;
  
  const annualSolarGeneration = solarSystemSize * 4.5 * 365; // 4.5 sun hours average
  const annualSolarSavings = annualSolarGeneration * region.energyCosts.commercial;
  const annualWithSolar = Math.max(0, annualTotal - annualSolarSavings);
  
  // Carbon footprint
  const totalKWh = (lightingKWh + hvacKWh + otherKWh) * 12;
  const carbonFootprint = totalKWh * region.carbonIntensity;
  
  // ROI calculations
  const solarROI = netSolarCost / annualSolarSavings;
  const ledUpgradeCost = lightingWatts * 0.20; // $0.20/W for LED upgrade
  const ledSavings = lightingCost * 0.4 * 12; // 40% energy savings
  const ledROI = ledUpgradeCost / ledSavings;
  
  return {
    monthly: {
      lighting: lightingCost,
      hvac: hvacCost,
      other: otherCost,
      total: monthlyTotal
    },
    annual: {
      total: annualTotal,
      withSolar: annualWithSolar,
      carbonFootprint
    },
    payback: {
      solarROI: Math.round(solarROI * 10) / 10,
      ledROI: Math.round(ledROI * 10) / 10
    }
  };
}

// Weather impact on growing operations
export const WEATHER_IMPACTS = {
  temperature: {
    extreme_cold: {
      threshold: 20, // °F
      impact: 'Heating costs increase 40-60%',
      mitigation: 'Insulation upgrade, heat recovery'
    },
    extreme_heat: {
      threshold: 95, // °F
      impact: 'Cooling costs increase 50-70%',
      mitigation: 'Evaporative cooling, night operation'
    }
  },
  humidity: {
    high: {
      threshold: 70, // %
      impact: 'Dehumidification needs increase 200%',
      mitigation: 'Sealed room, commercial dehumidifiers'
    },
    low: {
      threshold: 30, // %
      impact: 'Humidification needed, pest pressure',
      mitigation: 'Fogging systems, wet walls'
    }
  },
  natural_disasters: {
    hurricane: {
      states: ['FL', 'TX', 'LA', 'NC', 'SC'],
      impact: 'Power outages, structural damage',
      mitigation: 'Backup generators, reinforced structures'
    },
    tornado: {
      states: ['OK', 'KS', 'TX', 'NE', 'MO'],
      impact: 'Structural damage risk',
      mitigation: 'Underground facilities, reinforced buildings'
    },
    earthquake: {
      states: ['CA', 'WA', 'OR', 'AK'],
      impact: 'Equipment damage, power loss',
      mitigation: 'Seismic bracing, flexible connections'
    },
    wildfire: {
      states: ['CA', 'OR', 'WA', 'CO', 'NM'],
      impact: 'Air quality, evacuation risk',
      mitigation: 'Advanced filtration, defensible space'
    }
  }
};