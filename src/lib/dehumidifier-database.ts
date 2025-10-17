// Commercial dehumidifier database for controlled environment agriculture
// Based on industry-leading manufacturers and models

export interface DehumidifierModel {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Portable' | 'Ducted' | 'Desiccant' | 'Split';
  capacity: {
    pintsPerDay: number; // @ 80°F, 60% RH (AHAM standard)
    litersPerDay?: number;
    grainsPer24Hr?: number;
  };
  coverage: {
    sqft: number;
    cuft?: number;
    plantCount?: number; // Estimated based on transpiration
  };
  power: {
    watts: number;
    voltage: number;
    phase: 1 | 3;
    amps: number;
  };
  efficiency: {
    pintsPerKwh: number;
    cop?: number; // Coefficient of Performance
  };
  physical: {
    width: number; // inches
    depth: number;
    height: number;
    weight: number; // lbs
    refrigerant?: string;
  };
  features: string[];
  price?: number;
  specSheet?: string;
}

export const dehumidifierCategories = {
  Portable: {
    name: 'Portable Units',
    description: 'Standalone units for smaller rooms or supplemental dehumidification',
    icon: 'box'
  },
  Ducted: {
    name: 'Ducted Systems',
    description: 'Integrated with HVAC for whole-facility dehumidification',
    icon: 'wind'
  },
  Desiccant: {
    name: 'Desiccant Dehumidifiers',
    description: 'Low-temperature operation, ideal for drying rooms',
    icon: 'droplet-off'
  },
  Split: {
    name: 'Split Systems',
    description: 'Remote condenser units for indoor growing',
    icon: 'split'
  }
};

export const dehumidifierDatabase: Record<string, DehumidifierModel> = {
  // Quest - Industry leader for cannabis cultivation (Expanded)
  'quest-110': {
    id: 'quest-110',
    manufacturer: 'Quest',
    model: '110',
    category: 'Portable',
    capacity: {
      pintsPerDay: 110,
      litersPerDay: 52,
      grainsPer24Hr: 14080
    },
    coverage: {
      sqft: 1800,
      cuft: 14400,
      plantCount: 90 // Flowering cannabis plants
    },
    power: {
      watts: 1465,
      voltage: 115,
      phase: 1,
      amps: 12.7
    },
    efficiency: {
      pintsPerKwh: 3.3,
      cop: 3.1
    },
    physical: {
      width: 22,
      depth: 30,
      height: 32,
      weight: 165,
      refrigerant: 'R410A'
    },
    features: [
      'MERV 11 filtration',
      'Digital humidistat',
      'Built-in condensate pump',
      'Stainless steel coils',
      'Ducting ready',
      'Remote monitoring capability'
    ],
    price: 2995,
    specSheet: '/specs/quest-110.pdf'
  },

  'quest-335': {
    id: 'quest-335',
    manufacturer: 'Quest',
    model: '335',
    category: 'Portable',
    capacity: {
      pintsPerDay: 335,
      litersPerDay: 158,
      grainsPer24Hr: 42880
    },
    coverage: {
      sqft: 5300,
      cuft: 42400,
      plantCount: 265 // Flowering cannabis plants
    },
    power: {
      watts: 4500,
      voltage: 240,
      phase: 1,
      amps: 18.8
    },
    efficiency: {
      pintsPerKwh: 3.2,
      cop: 2.95
    },
    physical: {
      width: 26,
      depth: 42,
      height: 44,
      weight: 280,
      refrigerant: 'R410A'
    },
    features: [
      'MERV 11 filtration',
      'Digital humidistat',
      'Built-in condensate pump',
      'Stainless steel coils',
      'Ducting ready',
      'Remote monitoring capability',
      'Hot gas defrost'
    ],
    price: 4795,
    specSheet: '/specs/quest-335.pdf'
  },

  'quest-506': {
    id: 'quest-506',
    manufacturer: 'Quest',
    model: '506',
    category: 'Portable',
    capacity: {
      pintsPerDay: 506,
      litersPerDay: 239,
      grainsPer24Hr: 64768
    },
    coverage: {
      sqft: 8000,
      cuft: 64000,
      plantCount: 400 // Flowering cannabis plants
    },
    power: {
      watts: 6800,
      voltage: 240,
      phase: 1,
      amps: 28.3
    },
    efficiency: {
      pintsPerKwh: 3.1,
      cop: 2.85
    },
    physical: {
      width: 29,
      depth: 47,
      height: 48,
      weight: 340,
      refrigerant: 'R410A'
    },
    features: [
      'MERV 11 filtration',
      'Digital humidistat',
      'Auto-restart',
      'Condensate pump included',
      'Ducting collars',
      'Made in USA'
    ],
    price: 6500
  },
  'quest-335': {
    id: 'quest-335',
    manufacturer: 'Quest',
    model: '335',
    category: 'Portable',
    capacity: {
      pintsPerDay: 335,
      litersPerDay: 158
    },
    coverage: {
      sqft: 5500,
      cuft: 44000,
      plantCount: 275
    },
    power: {
      watts: 4300,
      voltage: 240,
      phase: 1,
      amps: 17.9
    },
    efficiency: {
      pintsPerKwh: 3.3
    },
    physical: {
      width: 25,
      depth: 37,
      height: 44,
      weight: 260
    },
    features: [
      'MERV 11 filtration',
      'Digital controls',
      'Automatic defrost',
      'External condensate pump',
      'Stackable design'
    ],
    price: 4800
  },
  'quest-225': {
    id: 'quest-225',
    manufacturer: 'Quest',
    model: '225',
    category: 'Portable',
    capacity: {
      pintsPerDay: 225,
      litersPerDay: 106
    },
    coverage: {
      sqft: 3500,
      cuft: 28000,
      plantCount: 175
    },
    power: {
      watts: 2650,
      voltage: 240,
      phase: 1,
      amps: 11
    },
    efficiency: {
      pintsPerKwh: 3.5
    },
    physical: {
      width: 23,
      depth: 30,
      height: 41,
      weight: 195
    },
    features: [
      'Plug-and-play operation',
      'MERV 11 filter',
      'Epoxy coated coils',
      'Quiet operation',
      'Horizontal or vertical discharge'
    ],
    price: 3200
  },

  // Anden (by Aprilaire) - Premium efficiency
  'anden-a710v': {
    id: 'anden-a710v',
    manufacturer: 'Anden',
    model: 'A710V',
    category: 'Ducted',
    capacity: {
      pintsPerDay: 710,
      litersPerDay: 335
    },
    coverage: {
      sqft: 11000,
      cuft: 88000,
      plantCount: 550
    },
    power: {
      watts: 8150,
      voltage: 240,
      phase: 1,
      amps: 34
    },
    efficiency: {
      pintsPerKwh: 4.3,
      cop: 3.2
    },
    physical: {
      width: 29,
      depth: 57,
      height: 44,
      weight: 380,
      refrigerant: 'R410A'
    },
    features: [
      'Variable speed compressor',
      'MERV 13 filtration',
      'Integrated controls',
      'Remote monitoring capable',
      'Corrosion resistant',
      'Industry-leading efficiency'
    ],
    price: 8900
  },
  'anden-a320v': {
    id: 'anden-a320v',
    manufacturer: 'Anden',
    model: 'A320V',
    category: 'Ducted',
    capacity: {
      pintsPerDay: 320,
      litersPerDay: 151
    },
    coverage: {
      sqft: 5000,
      cuft: 40000,
      plantCount: 250
    },
    power: {
      watts: 3700,
      voltage: 240,
      phase: 1,
      amps: 15.4
    },
    efficiency: {
      pintsPerKwh: 4.1
    },
    physical: {
      width: 21,
      depth: 48,
      height: 36,
      weight: 245
    },
    features: [
      'Variable capacity',
      'Ducted installation',
      'MERV 13 filter',
      'Integrated humidistat',
      'Quiet operation'
    ],
    price: 5200
  },

  // DriEaz - Industrial strength
  'drieaz-lgr7000': {
    id: 'drieaz-lgr7000',
    manufacturer: 'Dri-Eaz',
    model: 'LGR 7000XLi',
    category: 'Portable',
    capacity: {
      pintsPerDay: 235,
      litersPerDay: 111
    },
    coverage: {
      sqft: 3600,
      cuft: 28800,
      plantCount: 180
    },
    power: {
      watts: 2400,
      voltage: 115,
      phase: 1,
      amps: 11.5
    },
    efficiency: {
      pintsPerKwh: 4.0
    },
    physical: {
      width: 20,
      depth: 33,
      height: 36,
      weight: 155
    },
    features: [
      'Low grain refrigerant',
      'Automatic pump-out',
      'Hour meter',
      'Ring air design',
      'Rugged construction'
    ],
    price: 2800
  },

  // Ideal-Air - Budget-friendly options
  'ideal-air-700860': {
    id: 'ideal-air-700860',
    manufacturer: 'Ideal-Air',
    model: '700860',
    category: 'Portable',
    capacity: {
      pintsPerDay: 180,
      litersPerDay: 85
    },
    coverage: {
      sqft: 2800,
      cuft: 22400,
      plantCount: 140
    },
    power: {
      watts: 1900,
      voltage: 115,
      phase: 1,
      amps: 8.7
    },
    efficiency: {
      pintsPerKwh: 2.3
    },
    physical: {
      width: 19,
      depth: 25,
      height: 35,
      weight: 125
    },
    features: [
      'Digital display',
      'Auto-restart',
      'Washable filter',
      'Continuous drain',
      'Budget-friendly'
    ],
    price: 1500
  },

  // Desiccant options for drying rooms
  'munters-mg90': {
    id: 'munters-mg90',
    manufacturer: 'Munters',
    model: 'MG90',
    category: 'Desiccant',
    capacity: {
      pintsPerDay: 190, // @ 60°F, 60% RH
      litersPerDay: 90
    },
    coverage: {
      sqft: 3000,
      cuft: 24000,
      plantCount: 0 // Primarily for drying
    },
    power: {
      watts: 2100,
      voltage: 115,
      phase: 1,
      amps: 18.3
    },
    efficiency: {
      pintsPerKwh: 2.2
    },
    physical: {
      width: 16,
      depth: 24,
      height: 29,
      weight: 97
    },
    features: [
      'Works in cold conditions',
      'No compressor',
      'Continuous operation',
      'Ideal for drying rooms',
      'Low temperature performance'
    ],
    price: 2200
  },

  // Split system for sealed rooms
  'quest-dual-506-split': {
    id: 'quest-dual-506-split',
    manufacturer: 'Quest',
    model: 'Dual 506 Split',
    category: 'Split',
    capacity: {
      pintsPerDay: 506,
      litersPerDay: 239
    },
    coverage: {
      sqft: 8000,
      cuft: 64000,
      plantCount: 400
    },
    power: {
      watts: 6800,
      voltage: 240,
      phase: 1,
      amps: 28.3
    },
    efficiency: {
      pintsPerKwh: 3.1
    },
    physical: {
      width: 30,
      depth: 48,
      height: 50,
      weight: 380,
      refrigerant: 'R410A'
    },
    features: [
      'Remote condenser',
      'Sealed room compatible',
      'No heat added to room',
      'Quiet indoor operation',
      'Premium efficiency'
    ],
    price: 8500
  },

  // Santa Fe - Industry leader in residential/commercial dehumidification
  'santa-fe-classic': {
    id: 'santa-fe-classic',
    manufacturer: 'Santa Fe',
    model: 'Classic',
    category: 'Ducted',
    capacity: {
      pintsPerDay: 110,
      litersPerDay: 52,
      grainsPer24Hr: 14080
    },
    coverage: {
      sqft: 2500,
      cuft: 20000,
      plantCount: 125
    },
    power: {
      watts: 1350,
      voltage: 115,
      phase: 1,
      amps: 11.7
    },
    efficiency: {
      pintsPerKwh: 3.6,
      cop: 3.2
    },
    physical: {
      width: 23,
      depth: 22,
      height: 46,
      weight: 110,
      refrigerant: 'R410A'
    },
    features: [
      'MERV 8 filter',
      'Ducting ready',
      'Auto-defrost',
      'Condensate pump',
      'Corrosion resistant',
      'WiFi ready'
    ],
    price: 3200,
    specSheet: '/specs/santa-fe-classic.pdf'
  },

  'santa-fe-advance100': {
    id: 'santa-fe-advance100',
    manufacturer: 'Santa Fe',
    model: 'Advance100',
    category: 'Ducted',
    capacity: {
      pintsPerDay: 100,
      litersPerDay: 47,
      grainsPer24Hr: 12800
    },
    coverage: {
      sqft: 2200,
      cuft: 17600,
      plantCount: 110
    },
    power: {
      watts: 1100,
      voltage: 115,
      phase: 1,
      amps: 9.6
    },
    efficiency: {
      pintsPerKwh: 4.0,
      cop: 3.8
    },
    physical: {
      width: 21,
      depth: 20,
      height: 42,
      weight: 95,
      refrigerant: 'R410A'
    },
    features: [
      'MERV 13 filter',
      'Variable speed fan',
      'Smart controls',
      'Automatic drain',
      'Energy Star rated',
      'Quiet operation'
    ],
    price: 2800,
    specSheet: '/specs/santa-fe-advance100.pdf'
  },

  // Desert Aire - Major commercial/industrial dehumidifier manufacturer
  'desert-aire-dt-450': {
    id: 'desert-aire-dt-450',
    manufacturer: 'Desert Aire',
    model: 'DT-450',
    category: 'Ducted',
    capacity: {
      pintsPerDay: 450,
      litersPerDay: 213,
      grainsPer24Hr: 57600
    },
    coverage: {
      sqft: 9000,
      cuft: 72000,
      plantCount: 450
    },
    power: {
      watts: 5200,
      voltage: 240,
      phase: 3,
      amps: 12.5
    },
    efficiency: {
      pintsPerKwh: 3.8,
      cop: 3.5
    },
    physical: {
      width: 36,
      depth: 48,
      height: 60,
      weight: 450,
      refrigerant: 'R410A'
    },
    features: [
      'Commercial grade',
      'BMS integration',
      'Variable capacity',
      'Hot gas reheat',
      'Stainless steel construction',
      'Advanced controls'
    ],
    price: 12500,
    specSheet: '/specs/desert-aire-dt-450.pdf'
  },

  // OptiClimate - Grow room specialists
  'opticlimate-15000-pro4': {
    id: 'opticlimate-15000-pro4',
    manufacturer: 'OptiClimate',
    model: '15000 Pro4',
    category: 'Split',
    capacity: {
      pintsPerDay: 320,
      litersPerDay: 151,
      grainsPer24Hr: 40960
    },
    coverage: {
      sqft: 6000,
      cuft: 48000,
      plantCount: 300
    },
    power: {
      watts: 4500,
      voltage: 240,
      phase: 1,
      amps: 18.8
    },
    efficiency: {
      pintsPerKwh: 3.1,
      cop: 2.9
    },
    physical: {
      width: 32,
      depth: 44,
      height: 46,
      weight: 320,
      refrigerant: 'R32'
    },
    features: [
      'All-in-one climate control',
      'Cooling + dehumidification',
      'CO2 enrichment ready',
      'Precise humidity control',
      'Grow room optimized',
      'Split system design'
    ],
    price: 9500,
    specSheet: '/specs/opticlimate-15000-pro4.pdf'
  },

  // Therma-Stor - Professional restoration equipment
  'therma-stor-phoenix-200-max': {
    id: 'therma-stor-phoenix-200-max',
    manufacturer: 'Therma-Stor',
    model: 'Phoenix 200 MAX',
    category: 'Portable',
    capacity: {
      pintsPerDay: 200,
      litersPerDay: 95,
      grainsPer24Hr: 25600
    },
    coverage: {
      sqft: 3500,
      cuft: 28000,
      plantCount: 175
    },
    power: {
      watts: 2100,
      voltage: 115,
      phase: 1,
      amps: 18.3
    },
    efficiency: {
      pintsPerKwh: 4.2,
      cop: 3.9
    },
    physical: {
      width: 20,
      depth: 32,
      height: 38,
      weight: 150,
      refrigerant: 'R410A'
    },
    features: [
      'Low grain refrigerant',
      'Rotomolded housing',
      'Auto-pump out',
      'Precision controls',
      'Corrosion resistant',
      'Professional grade'
    ],
    price: 3800,
    specSheet: '/specs/therma-stor-phoenix-200-max.pdf'
  },

  // Ebac - Commercial dehumidifiers
  'ebac-cd60e': {
    id: 'ebac-cd60e',
    manufacturer: 'Ebac',
    model: 'CD60E',
    category: 'Portable',
    capacity: {
      pintsPerDay: 60,
      litersPerDay: 28,
      grainsPer24Hr: 7680
    },
    coverage: {
      sqft: 1200,
      cuft: 9600,
      plantCount: 60
    },
    power: {
      watts: 650,
      voltage: 115,
      phase: 1,
      amps: 5.7
    },
    efficiency: {
      pintsPerKwh: 4.1,
      cop: 3.8
    },
    physical: {
      width: 18,
      depth: 24,
      height: 28,
      weight: 85,
      refrigerant: 'R134a'
    },
    features: [
      'British engineering',
      'Intelligent defrost',
      'Auto-restart',
      'Continuous drain',
      'Compact design',
      'Energy efficient'
    ],
    price: 1800,
    specSheet: '/specs/ebac-cd60e.pdf'
  }
};

// Helper functions for dehumidifier calculations
export function calculateRequiredCapacity(
  roomVolume: number, // cubic feet
  plantCount: number,
  plantStage: 'clone' | 'veg' | 'flower',
  targetRH: number = 50
): number {
  // Transpiration rates per plant per day (gallons)
  const transpirationRates = {
    clone: 0.05,
    veg: 0.25,
    flower: 0.5
  };
  
  // Calculate daily moisture load from plants (convert gallons to pints)
  const plantMoisture = plantCount * transpirationRates[plantStage] * 8;
  
  // Add infiltration and other loads (approximately 20% of plant load)
  const totalMoisture = plantMoisture * 1.2;
  
  // Add safety factor
  return Math.ceil(totalMoisture * 1.25);
}

export function calculateEnergyUsage(
  dehumidifier: DehumidifierModel,
  hoursPerDay: number = 12
): {
  dailyKwh: number;
  monthlyCost: number; // at $0.12/kWh
  yearlyMoisture: number; // gallons removed
} {
  const dailyKwh = (dehumidifier.power.watts / 1000) * hoursPerDay;
  const monthlyCost = dailyKwh * 30 * 0.12;
  const yearlyMoisture = (dehumidifier.capacity.pintsPerDay / 8) * 365 * (hoursPerDay / 24);
  
  return {
    dailyKwh,
    monthlyCost,
    yearlyMoisture
  };
}

export function recommendDehumidifiers(
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
  plantCount: number,
  plantStage: 'clone' | 'veg' | 'flower' = 'flower'
): DehumidifierModel[] {
  const roomVolume = roomWidth * roomLength * roomHeight;
  const requiredCapacity = calculateRequiredCapacity(roomVolume, plantCount, plantStage);
  
  // Filter and sort by suitability
  return Object.values(dehumidifierDatabase)
    .filter(unit => unit.capacity.pintsPerDay >= requiredCapacity * 0.8)
    .sort((a, b) => {
      // Prioritize efficiency and appropriate sizing
      const aScore = a.efficiency.pintsPerKwh * (1 - Math.abs(a.capacity.pintsPerDay - requiredCapacity) / requiredCapacity);
      const bScore = b.efficiency.pintsPerKwh * (1 - Math.abs(b.capacity.pintsPerDay - requiredCapacity) / requiredCapacity);
      return bScore - aScore;
    })
    .slice(0, 5);
}