// Air filtration and purification systems database for controlled environment agriculture
// Includes HEPA filters, carbon filters, UV sterilizers, and air purifiers

export interface AirFiltrationSystem {
  id: string;
  manufacturer: string;
  model: string;
  category: 'HEPA' | 'Carbon' | 'UV' | 'Ozone' | 'Combination' | 'Industrial';
  type: 'Standalone' | 'Inline' | 'Ducted' | 'Portable';
  capacity: {
    airflow: number; // CFM
    roomSize?: number; // sq ft coverage
    filterArea?: number; // sq ft of filter media
  };
  filtration: {
    hepaRating?: 'H13' | 'H14' | 'ULPA';
    merv?: number; // MERV rating
    efficiency?: number; // % at 0.3 microns
    carbonWeight?: number; // lbs of activated carbon
    uvPower?: number; // watts of UV-C
    ozoneOutput?: number; // mg/hr
  };
  power: {
    watts: number;
    voltage: number;
    phase?: 1 | 3;
    amps?: number;
  };
  physical: {
    width: number; // inches
    height: number;
    depth: number;
    weight: number; // lbs
    ductSize?: number; // inches
  };
  features: string[];
  noise?: number; // dB
  price?: number;
  consumables?: {
    type: string;
    lifespan: string;
    cost: number;
  }[];
}

export const airFiltrationCategories = {
  HEPA: {
    name: 'HEPA Filtration',
    description: 'High-efficiency particulate air filters for cleanroom environments',
    icon: 'shield',
    pros: ['99.97% efficiency', 'Removes particles', 'Medical grade', 'Mold/pollen removal'],
    cons: ['Higher pressure drop', 'Regular replacement', 'No odor control']
  },
  Carbon: {
    name: 'Carbon Filtration',
    description: 'Activated carbon filters for odor and VOC control',
    icon: 'filter',
    pros: ['Odor control', 'VOC removal', 'Chemical filtration', 'Lower pressure drop'],
    cons: ['No particle filtration', 'Saturation issues', 'Heavy weight']
  },
  UV: {
    name: 'UV Sterilization',
    description: 'Ultraviolet germicidal irradiation systems',
    icon: 'zap',
    pros: ['Kills pathogens', 'No consumables', 'Low maintenance', 'Chemical-free'],
    cons: ['No particle removal', 'Limited contact time', 'Eye safety concerns']
  },
  Ozone: {
    name: 'Ozone Generators',
    description: 'Ozone-based air treatment systems',
    icon: 'cloud',
    pros: ['Strong oxidizer', 'Odor elimination', 'Kills microbes', 'Reaches everywhere'],
    cons: ['Health hazards', 'Requires monitoring', 'Material degradation']
  },
  Combination: {
    name: 'Multi-Stage Systems',
    description: 'Combined HEPA, carbon, and UV filtration',
    icon: 'layers',
    pros: ['Complete solution', 'All contaminants', 'Best protection', 'Versatile'],
    cons: ['Higher cost', 'Complex maintenance', 'Larger footprint']
  },
  Industrial: {
    name: 'Industrial Grade',
    description: 'Heavy-duty filtration for large facilities',
    icon: 'factory',
    pros: ['High capacity', 'Continuous operation', 'Modular design', 'Professional'],
    cons: ['Expensive', 'Installation required', 'Space requirements']
  }
};

export const airFiltrationDatabase: Record<string, AirFiltrationSystem> = {
  // HEPA Filter Systems
  'aerovent-hepa-2000': {
    id: 'aerovent-hepa-2000',
    manufacturer: 'AeroVent',
    model: 'HEPA-2000 Inline',
    category: 'HEPA',
    type: 'Inline',
    capacity: {
      airflow: 2000,
      filterArea: 85
    },
    filtration: {
      hepaRating: 'H13',
      merv: 17,
      efficiency: 99.97
    },
    power: {
      watts: 450,
      voltage: 120,
      phase: 1,
      amps: 4.2
    },
    physical: {
      width: 24,
      height: 24,
      depth: 12,
      weight: 65,
      ductSize: 12
    },
    features: [
      'Medical grade H13 HEPA',
      'Galvanized steel housing',
      'Pressure differential gauge',
      'Pre-filter included',
      'Sealed construction',
      'ETL certified'
    ],
    noise: 55,
    price: 1850,
    consumables: [
      {
        type: 'HEPA filter',
        lifespan: '12-18 months',
        cost: 385
      },
      {
        type: 'Pre-filter',
        lifespan: '3-6 months',
        cost: 65
      }
    ]
  },
  'camfil-absolute-vg': {
    id: 'camfil-absolute-vg',
    manufacturer: 'Camfil',
    model: 'Absolute VG HEPA',
    category: 'HEPA',
    type: 'Ducted',
    capacity: {
      airflow: 3000,
      filterArea: 125
    },
    filtration: {
      hepaRating: 'H14',
      merv: 18,
      efficiency: 99.995
    },
    power: {
      watts: 680,
      voltage: 240,
      phase: 1,
      amps: 3.2
    },
    physical: {
      width: 24,
      height: 24,
      depth: 18,
      weight: 95,
      ductSize: 16
    },
    features: [
      'H14 HEPA for cleanrooms',
      'Leak-tested certified',
      'Low pressure drop design',
      'Gel seal technology',
      'Stainless steel option',
      'ISO 14644 compliant'
    ],
    noise: 52,
    price: 3200,
    consumables: [{
      type: 'H14 HEPA filter',
      lifespan: '18-24 months',
      cost: 685
    }]
  },
  
  // Carbon Filter Systems
  'can-filter-max-2400': {
    id: 'can-filter-max-2400',
    manufacturer: 'Can-Filters',
    model: 'Max 2400 CFM',
    category: 'Carbon',
    type: 'Inline',
    capacity: {
      airflow: 2400,
      filterArea: 60
    },
    filtration: {
      carbonWeight: 95,
      efficiency: 99.5
    },
    power: {
      watts: 0, // Passive filter
      voltage: 0
    },
    physical: {
      width: 20,
      height: 40,
      depth: 20,
      weight: 110,
      ductSize: 12
    },
    features: [
      'Australian virgin carbon',
      '2.5" carbon bed',
      'Reversible design',
      'No ozone emissions',
      'High adsorption capacity',
      'Aluminum housing'
    ],
    price: 485,
    consumables: [{
      type: 'Complete filter',
      lifespan: '18-24 months',
      cost: 485
    }]
  },
  'phresh-carbon-1700': {
    id: 'phresh-carbon-1700',
    manufacturer: 'Phresh',
    model: 'Carbon Filter 1700',
    category: 'Carbon',
    type: 'Inline',
    capacity: {
      airflow: 1700
    },
    filtration: {
      carbonWeight: 68,
      efficiency: 99.9
    },
    power: {
      watts: 0,
      voltage: 0
    },
    physical: {
      width: 16,
      height: 38,
      depth: 16,
      weight: 75,
      ductSize: 10
    },
    features: [
      'RC-48 activated carbon',
      'Aluminum tops/bases',
      'Machine packed carbon',
      'Anti-air bypass design',
      '51% open air flow',
      'Laboratory tested'
    ],
    price: 365,
    consumables: [{
      type: 'Complete filter',
      lifespan: '24 months',
      cost: 365
    }]
  },

  // UV Sterilization Systems
  'sanuvox-biowall-max': {
    id: 'sanuvox-biowall-max',
    manufacturer: 'Sanuvox',
    model: 'Biowall MAX',
    category: 'UV',
    type: 'Ducted',
    capacity: {
      airflow: 2000,
      roomSize: 4000
    },
    filtration: {
      uvPower: 180,
      efficiency: 99.9
    },
    power: {
      watts: 180,
      voltage: 120,
      phase: 1,
      amps: 1.5
    },
    physical: {
      width: 24,
      height: 24,
      depth: 7,
      weight: 35,
      ductSize: 0 // Mounts in duct
    },
    features: [
      'High-output UV-C lamps',
      'Patented reflector system',
      '3-log reduction pathogens',
      'Parallel airflow design',
      'Status indicator lights',
      'Easy lamp replacement'
    ],
    noise: 0,
    price: 2850,
    consumables: [{
      type: 'UV-C lamps',
      lifespan: '12 months',
      cost: 185
    }]
  },
  'fresh-aire-uv-apco': {
    id: 'fresh-aire-uv-apco',
    manufacturer: 'Fresh-Aire UV',
    model: 'APCO-X',
    category: 'UV',
    type: 'Ducted',
    capacity: {
      airflow: 2500
    },
    filtration: {
      uvPower: 60,
      efficiency: 99
    },
    power: {
      watts: 60,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 16,
      height: 13,
      depth: 5,
      weight: 12
    },
    features: [
      'Dual UV-C lamps',
      'Titanium dioxide catalyst',
      'VOC reduction',
      'Odor control',
      'Carbon matrix',
      '2-year warranty'
    ],
    noise: 0,
    price: 950,
    consumables: [{
      type: 'UV lamp and carbon',
      lifespan: '12-24 months',
      cost: 125
    }]
  },

  // Combination Systems
  'airocide-aps-200': {
    id: 'airocide-aps-200',
    manufacturer: 'Airocide',
    model: 'APS-200 Professional',
    category: 'Combination',
    type: 'Standalone',
    capacity: {
      airflow: 200,
      roomSize: 800
    },
    filtration: {
      hepaRating: 'H13',
      carbonWeight: 5,
      uvPower: 25,
      efficiency: 99.97
    },
    power: {
      watts: 85,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 18,
      height: 22,
      depth: 10,
      weight: 28
    },
    features: [
      'NASA PCO technology',
      'No ozone emissions',
      'Whisper quiet operation',
      'HEPA + Carbon + PCO',
      'Touchscreen controls',
      'WiFi monitoring'
    ],
    noise: 35,
    price: 1650,
    consumables: [
      {
        type: 'HEPA filter',
        lifespan: '12 months',
        cost: 85
      },
      {
        type: 'Carbon filter',
        lifespan: '6 months',
        cost: 45
      },
      {
        type: 'PCO chamber',
        lifespan: '24 months',
        cost: 165
      }
    ]
  },
  'quest-dual-105': {
    id: 'quest-dual-105',
    manufacturer: 'Quest',
    model: 'Dual 105 HEPA',
    category: 'Combination',
    type: 'Portable',
    capacity: {
      airflow: 500,
      roomSize: 1500
    },
    filtration: {
      hepaRating: 'H13',
      merv: 17,
      carbonWeight: 10,
      efficiency: 99.97
    },
    power: {
      watts: 250,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 20,
      height: 40,
      depth: 20,
      weight: 85
    },
    features: [
      'HEPA + Carbon combo',
      'Built for grow rooms',
      'Dehumidifier compatible',
      'Variable speed motor',
      'Powder coated steel',
      'Ducting adaptable'
    ],
    noise: 58,
    price: 1285,
    consumables: [
      {
        type: 'HEPA filter',
        lifespan: '12 months',
        cost: 145
      },
      {
        type: 'Carbon filter',
        lifespan: '6-12 months',
        cost: 95
      }
    ]
  },

  // Industrial Grade Systems
  'biosecurity-cleanroom-5000': {
    id: 'biosecurity-cleanroom-5000',
    manufacturer: 'BioSecurity',
    model: 'CleanRoom 5000',
    category: 'Industrial',
    type: 'Ducted',
    capacity: {
      airflow: 5000,
      roomSize: 10000,
      filterArea: 250
    },
    filtration: {
      hepaRating: 'ULPA',
      merv: 20,
      efficiency: 99.999,
      uvPower: 240
    },
    power: {
      watts: 1200,
      voltage: 480,
      phase: 3,
      amps: 3.5
    },
    physical: {
      width: 48,
      height: 48,
      depth: 24,
      weight: 450,
      ductSize: 24
    },
    features: [
      'ULPA grade filtration',
      'Integrated UV-C chamber',
      'Pressure monitoring',
      'SCADA compatible',
      'Redundant fan design',
      'ISO Class 5 capable'
    ],
    noise: 65,
    price: 18500,
    consumables: [
      {
        type: 'ULPA filter bank',
        lifespan: '24-36 months',
        cost: 2850
      },
      {
        type: 'UV-C lamp array',
        lifespan: '12 months',
        cost: 485
      }
    ]
  }
};

// Helper functions for air filtration system recommendations
export function calculateRequiredAirflow(
  roomVolume: number, // cubic feet
  airChangesPerHour: number = 12 // Typical for grow rooms
): number {
  return (roomVolume * airChangesPerHour) / 60; // CFM
}

export function recommendFiltrationSystem(
  roomSize: number, // sq ft
  ceilingHeight: number = 10, // feet
  contaminantLevel: 'low' | 'medium' | 'high' = 'medium',
  odorControl: boolean = true
): {
  primary: AirFiltrationSystem;
  secondary?: AirFiltrationSystem;
  totalCost: number;
  notes: string[];
} {
  const roomVolume = roomSize * ceilingHeight;
  const requiredCFM = calculateRequiredAirflow(roomVolume);
  const recommendations: any = { notes: [] };
  
  // Determine filtration needs
  const needsHEPA = contaminantLevel === 'high' || roomSize > 5000;
  const needsCarbon = odorControl;
  const needsUV = contaminantLevel === 'high';
  
  // Find suitable systems
  const systems = Object.values(airFiltrationDatabase);
  
  if (needsHEPA && needsCarbon) {
    // Prefer combination systems
    const comboSystems = systems.filter(s => 
      s.category === 'Combination' && 
      s.capacity.airflow >= requiredCFM * 0.8
    );
    
    if (comboSystems.length > 0) {
      recommendations.primary = comboSystems[0];
      recommendations.notes.push('Combination system provides complete filtration');
    } else {
      // Separate HEPA and carbon
      const hepaSystems = systems.filter(s => 
        s.category === 'HEPA' && 
        s.capacity.airflow >= requiredCFM
      );
      const carbonSystems = systems.filter(s => 
        s.category === 'Carbon' && 
        s.capacity.airflow >= requiredCFM
      );
      
      if (hepaSystems.length > 0) recommendations.primary = hepaSystems[0];
      if (carbonSystems.length > 0) recommendations.secondary = carbonSystems[0];
      recommendations.notes.push('Dual system for particle and odor control');
    }
  } else if (needsCarbon) {
    const carbonSystems = systems.filter(s => 
      s.category === 'Carbon' && 
      s.capacity.airflow >= requiredCFM
    );
    if (carbonSystems.length > 0) {
      recommendations.primary = carbonSystems[0];
      recommendations.notes.push('Carbon filtration for odor control');
    }
  }
  
  // Add UV if needed
  if (needsUV && recommendations.primary?.category !== 'Combination') {
    const uvSystems = systems.filter(s => 
      s.category === 'UV' && 
      s.capacity.airflow >= requiredCFM * 0.5
    );
    if (uvSystems.length > 0 && !recommendations.secondary) {
      recommendations.secondary = uvSystems[0];
      recommendations.notes.push('UV sterilization for pathogen control');
    }
  }
  
  // Calculate total cost
  recommendations.totalCost = (recommendations.primary?.price || 0) + 
                             (recommendations.secondary?.price || 0);
  
  // Air changes recommendation
  const actualACH = recommendations.primary ? 
    (recommendations.primary.capacity.airflow * 60) / roomVolume : 0;
  recommendations.notes.push(`System provides ${actualACH.toFixed(1)} air changes per hour`);
  
  return recommendations;
}

export function calculateFilterLifespan(
  baseLifespan: number, // months
  contaminantLoad: 'low' | 'medium' | 'high',
  operatingHours: number = 24 // hours per day
): number {
  const loadFactors = { low: 1.2, medium: 1.0, high: 0.7 };
  const hoursFactor = operatingHours / 24;
  
  return baseLifespan * loadFactors[contaminantLoad] / hoursFactor;
}