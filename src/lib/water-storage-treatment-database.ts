// Water storage and treatment systems database for controlled environment agriculture
// Includes tanks, reservoirs, RO systems, chillers, and water treatment equipment

export interface WaterStorageSystem {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Storage' | 'RO' | 'UV' | 'Chiller' | 'Pump' | 'Condensate' | 'Monitoring';
  type: 'Tank' | 'Reservoir' | 'Treatment' | 'Cooling' | 'Recovery' | 'Transfer';
  capacity: {
    volume?: number; // gallons
    flowRate?: number; // GPM or GPD
    coolingCapacity?: number; // BTU/hr
    recoveryRate?: number; // gallons/day
  };
  specifications: {
    material?: 'Polyethylene' | 'Fiberglass' | 'Stainless' | 'PVC' | 'Concrete';
    pressure?: { min: number; max: number; unit: 'PSI' };
    temperature?: { min: number; max: number; unit: 'F' };
    efficiency?: number; // % for RO systems
    uvDose?: number; // mJ/cm² for UV systems
  };
  power?: {
    watts: number;
    voltage: number;
    phase?: 1 | 3;
    amps?: number;
  };
  physical: {
    width: number; // inches
    height: number;
    depth: number;
    weight: number; // lbs empty
    connections?: string[]; // "2 inch NPT", etc.
  };
  features: string[];
  certifications?: string[];
  price?: number;
  consumables?: {
    type: string;
    lifespan: string;
    cost: number;
  }[];
}

export const waterStorageCategories = {
  Storage: {
    name: 'Water Storage',
    description: 'Tanks and reservoirs for nutrient solution storage',
    icon: 'droplet',
    pros: ['Bulk storage', 'Multiple sizes', 'Various materials', 'Gravity feed option'],
    cons: ['Space requirements', 'Cleaning needs', 'Algae risk']
  },
  RO: {
    name: 'Reverse Osmosis',
    description: 'Water purification systems for consistent quality',
    icon: 'filter',
    pros: ['Pure water', 'Consistent EC', 'Removes contaminants', 'Better nutrient control'],
    cons: ['Water waste', 'Slow production', 'Membrane replacement']
  },
  UV: {
    name: 'UV Sterilization',
    description: 'Ultraviolet water treatment for pathogen control',
    icon: 'zap',
    pros: ['Chemical-free', 'Kills pathogens', 'No residuals', 'Low maintenance'],
    cons: ['No residual protection', 'Bulb replacement', 'Flow rate dependent']
  },
  Chiller: {
    name: 'Water Chillers',
    description: 'Temperature control for nutrient solutions',
    icon: 'thermometer',
    pros: ['Prevents root disease', 'Oxygen solubility', 'Consistent temps', 'Better growth'],
    cons: ['Energy use', 'Initial cost', 'Maintenance needs']
  },
  Pump: {
    name: 'Transfer Pumps',
    description: 'Pumps for water and nutrient solution transfer',
    icon: 'arrow-right',
    pros: ['High flow rates', 'Various pressures', 'Automated filling', 'Chemical resistant'],
    cons: ['Power required', 'Noise', 'Seal maintenance']
  },
  Condensate: {
    name: 'Condensate Recovery',
    description: 'Systems to capture and reuse HVAC condensate',
    icon: 'recycle',
    pros: ['Water savings', 'Low EC water', 'Sustainability', 'Cost savings'],
    cons: ['Collection complexity', 'Treatment needed', 'Seasonal variation']
  },
  Monitoring: {
    name: 'Water Monitoring',
    description: 'Sensors and meters for water quality monitoring',
    icon: 'activity',
    pros: ['Real-time data', 'Quality assurance', 'Automated alerts', 'Data logging'],
    cons: ['Calibration needs', 'Sensor maintenance', 'Integration complexity']
  }
};

export const waterStorageDatabase: Record<string, WaterStorageSystem> = {
  // Water Storage Tanks
  'norwesco-550-vertical': {
    id: 'norwesco-550-vertical',
    manufacturer: 'Norwesco',
    model: '550 Gallon Vertical',
    category: 'Storage',
    type: 'Tank',
    capacity: {
      volume: 550
    },
    specifications: {
      material: 'Polyethylene',
      temperature: { min: -20, max: 120, unit: 'F' }
    },
    physical: {
      width: 64,
      height: 69,
      depth: 64,
      weight: 115,
      connections: ['2" NPT outlet', '16" lid opening']
    },
    features: [
      'UV inhibited resin',
      'FDA approved material',
      'Molded-in gallon markers',
      'Flat bottom design',
      'Self-supporting',
      '3-year warranty'
    ],
    certifications: ['NSF-61'],
    price: 785
  },
  'ace-roto-mold-1000': {
    id: 'ace-roto-mold-1000',
    manufacturer: 'Ace Roto-Mold',
    model: '1000 Gallon Cone Bottom',
    category: 'Storage',
    type: 'Tank',
    capacity: {
      volume: 1000
    },
    specifications: {
      material: 'Polyethylene',
      temperature: { min: -40, max: 140, unit: 'F' }
    },
    physical: {
      width: 87,
      height: 91,
      depth: 87,
      weight: 200,
      connections: ['3" NPT outlet', '16" lid', '2" NPT drain']
    },
    features: [
      'Cone bottom for complete drainage',
      'Heavy-duty construction',
      'UV stabilized',
      'Translucent for level viewing',
      'Tie-down slots',
      'Made in USA'
    ],
    certifications: ['NSF-61', 'FDA'],
    price: 1485
  },
  'chem-tainer-2500': {
    id: 'chem-tainer-2500',
    manufacturer: 'Chem-Tainer',
    model: '2500 Gallon Industrial',
    category: 'Storage',
    type: 'Tank',
    capacity: {
      volume: 2500
    },
    specifications: {
      material: 'Polyethylene',
      temperature: { min: -40, max: 140, unit: 'F' },
      pressure: { min: 0, max: 0.5, unit: 'PSI' }
    },
    physical: {
      width: 102,
      height: 103,
      depth: 102,
      weight: 425,
      connections: ['4" NPT outlet', '2" NPT drain', '18" manway']
    },
    features: [
      'Industrial grade',
      'Double wall option',
      'Seismic restraints available',
      'Custom fittings',
      'Level gauge compatible',
      '5-year warranty'
    ],
    certifications: ['NSF-61', 'ASTM D1998'],
    price: 3250
  },

  // Reverse Osmosis Systems
  'hydrologic-hyperlogic': {
    id: 'hydrologic-hyperlogic',
    manufacturer: 'HydroLogic',
    model: 'HyperLogic Commercial',
    category: 'RO',
    type: 'Treatment',
    capacity: {
      flowRate: 10000 // GPD
    },
    specifications: {
      pressure: { min: 40, max: 100, unit: 'PSI' },
      efficiency: 98,
      temperature: { min: 35, max: 100, unit: 'F' }
    },
    power: {
      watts: 1500,
      voltage: 240,
      phase: 1,
      amps: 6.5
    },
    physical: {
      width: 48,
      height: 72,
      depth: 24,
      weight: 350,
      connections: ['1.5" inlet', '1" product', '1" waste']
    },
    features: [
      '1:1 waste ratio',
      'Automatic flush cycles',
      'TDS monitoring',
      'Flow meters included',
      'Stainless steel frame',
      'Remote monitoring capable'
    ],
    certifications: ['NSF-58', 'WQA Gold Seal'],
    price: 12500,
    consumables: [
      {
        type: 'Pre-filters',
        lifespan: '6 months',
        cost: 125
      },
      {
        type: 'RO membranes (4)',
        lifespan: '2-3 years',
        cost: 1200
      }
    ]
  },
  'pure-water-club-8000': {
    id: 'pure-water-club-8000',
    manufacturer: 'Pure Water Club',
    model: 'Commercial 8000 GPD',
    category: 'RO',
    type: 'Treatment',
    capacity: {
      flowRate: 8000
    },
    specifications: {
      pressure: { min: 35, max: 90, unit: 'PSI' },
      efficiency: 97,
      temperature: { min: 40, max: 100, unit: 'F' }
    },
    power: {
      watts: 1200,
      voltage: 240,
      phase: 1
    },
    physical: {
      width: 36,
      height: 60,
      depth: 20,
      weight: 285,
      connections: ['1" inlet', '3/4" product', '3/4" waste']
    },
    features: [
      'Low energy membranes',
      'Automatic backwash',
      'Digital controller',
      'Pressure gauges',
      'Powder coated steel',
      'Made in USA'
    ],
    price: 8950,
    consumables: [
      {
        type: 'Carbon block filters',
        lifespan: '6-12 months',
        cost: 95
      },
      {
        type: 'RO membranes (3)',
        lifespan: '2 years',
        cost: 850
      }
    ]
  },

  // UV Sterilization Systems
  'viqua-e4-plus': {
    id: 'viqua-e4-plus',
    manufacturer: 'VIQUA',
    model: 'E4-Plus Commercial',
    category: 'UV',
    type: 'Treatment',
    capacity: {
      flowRate: 40 // GPM
    },
    specifications: {
      uvDose: 40, // mJ/cm²
      pressure: { min: 0, max: 125, unit: 'PSI' },
      temperature: { min: 36, max: 104, unit: 'F' }
    },
    power: {
      watts: 90,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 5,
      height: 36,
      depth: 5,
      weight: 18,
      connections: ['1.5" NPT inlet/outlet']
    },
    features: [
      'LED status display',
      'Lamp life counter',
      'Audible alarm',
      '316L stainless steel',
      'Constant current driver',
      'NSF Class A validated'
    ],
    certifications: ['NSF-55 Class A', 'CSA'],
    price: 1850,
    consumables: [{
      type: 'UV lamp',
      lifespan: '12 months',
      cost: 125
    }]
  },
  'aquafine-csl-8r': {
    id: 'aquafine-csl-8r',
    manufacturer: 'Aquafine',
    model: 'CSL-8R Industrial',
    category: 'UV',
    type: 'Treatment',
    capacity: {
      flowRate: 165 // GPM
    },
    specifications: {
      uvDose: 30,
      pressure: { min: 0, max: 150, unit: 'PSI' },
      temperature: { min: 35, max: 110, unit: 'F' }
    },
    power: {
      watts: 425,
      voltage: 240,
      phase: 1
    },
    physical: {
      width: 8,
      height: 48,
      depth: 8,
      weight: 65,
      connections: ['3" flanged']
    },
    features: [
      'High-output amalgam lamps',
      'PLC control system',
      'UV intensity monitor',
      'Automatic wiper system',
      'Remote monitoring',
      'Pharmaceutical grade'
    ],
    certifications: ['NSF-61', 'FDA', 'CE'],
    price: 8500,
    consumables: [{
      type: 'UV lamps (4)',
      lifespan: '16,000 hours',
      cost: 480
    }]
  },

  // Water Chillers
  'active-aqua-1hp': {
    id: 'active-aqua-1hp',
    manufacturer: 'Active Aqua',
    model: 'AACH25HP Chiller',
    category: 'Chiller',
    type: 'Cooling',
    capacity: {
      coolingCapacity: 10000, // BTU/hr
      volume: 250 // max gallons
    },
    specifications: {
      temperature: { min: 39, max: 80, unit: 'F' }
    },
    power: {
      watts: 850,
      voltage: 120,
      phase: 1,
      amps: 8.5
    },
    physical: {
      width: 17,
      height: 19,
      depth: 19,
      weight: 68,
      connections: ['3/4" barb fittings']
    },
    features: [
      'Digital temperature controller',
      'Titanium heat exchanger',
      'Auto-restart after power loss',
      'Quiet operation',
      'R410A refrigerant',
      'Boost function'
    ],
    price: 785
  },
  'ecoplus-1-5hp': {
    id: 'ecoplus-1-5hp',
    manufacturer: 'EcoPlus',
    model: '1.5 HP Commercial',
    category: 'Chiller',
    type: 'Cooling',
    capacity: {
      coolingCapacity: 15000,
      volume: 500
    },
    specifications: {
      temperature: { min: 40, max: 85, unit: 'F' },
      pressure: { min: 0, max: 50, unit: 'PSI' }
    },
    power: {
      watts: 1400,
      voltage: 240,
      phase: 1,
      amps: 6.5
    },
    physical: {
      width: 24,
      height: 26,
      depth: 20,
      weight: 125,
      connections: ['1" NPT inlet/outlet']
    },
    features: [
      'LCD display with diagnostics',
      'Corrosion-resistant coating',
      'High/low pressure protection',
      'Flow switch protection',
      'Remote sensor included',
      '2-year warranty'
    ],
    price: 1850
  },
  'hydrofarm-ice-box': {
    id: 'hydrofarm-ice-box',
    manufacturer: 'Hydrofarm',
    model: 'Ice Box Heat Exchanger',
    category: 'Chiller',
    type: 'Cooling',
    capacity: {
      coolingCapacity: 8000,
      flowRate: 250 // GPH through exchanger
    },
    specifications: {
      temperature: { min: 35, max: 75, unit: 'F' }
    },
    physical: {
      width: 8,
      height: 8,
      depth: 8,
      weight: 12,
      connections: ['3/4" barb water', '8" duct flanges']
    },
    features: [
      'Water-cooled air handler',
      'No refrigerant needed',
      'Works with reservoir chiller',
      'Reduces AC load',
      'Insulated housing',
      'Simple installation'
    ],
    price: 285
  },

  // Transfer Pumps
  'little-giant-5-md': {
    id: 'little-giant-5-md',
    manufacturer: 'Little Giant',
    model: '5-MD-HC Magnetic Drive',
    category: 'Pump',
    type: 'Transfer',
    capacity: {
      flowRate: 25 // GPM at 1ft head
    },
    specifications: {
      pressure: { min: 0, max: 35, unit: 'PSI' },
      temperature: { min: 32, max: 190, unit: 'F' }
    },
    power: {
      watts: 190,
      voltage: 120,
      phase: 1,
      amps: 1.8
    },
    physical: {
      width: 8,
      height: 6,
      depth: 10,
      weight: 12,
      connections: ['3/4" NPT inlet/outlet']
    },
    features: [
      'Chemical resistant',
      'Magnetic drive - no seals',
      'Continuous duty',
      'Self-priming',
      'Highly corrosion resistant',
      'Made in USA'
    ],
    certifications: ['UL', 'CSA'],
    price: 425
  },
  'iwaki-md-70': {
    id: 'iwaki-md-70',
    manufacturer: 'Iwaki',
    model: 'MD-70RLT',
    category: 'Pump',
    type: 'Transfer',
    capacity: {
      flowRate: 45 // GPM
    },
    specifications: {
      pressure: { min: 0, max: 95, unit: 'PSI' },
      temperature: { min: 32, max: 160, unit: 'F' }
    },
    power: {
      watts: 750,
      voltage: 240,
      phase: 1,
      amps: 3.5
    },
    physical: {
      width: 10,
      height: 8,
      depth: 14,
      weight: 28,
      connections: ['1.5" NPT inlet/outlet']
    },
    features: [
      'Japanese engineering',
      'Sealless design',
      'ETFE coating option',
      'Run-dry protection',
      'Low noise operation',
      '3-year warranty'
    ],
    certifications: ['CE', 'RoHS'],
    price: 1285
  },

  // Condensate Recovery Systems
  'water-saver-crs-500': {
    id: 'water-saver-crs-500',
    manufacturer: 'Water Saver Tech',
    model: 'CRS-500 Recovery System',
    category: 'Condensate',
    type: 'Recovery',
    capacity: {
      volume: 500,
      recoveryRate: 250 // gallons/day typical
    },
    specifications: {
      material: 'Polyethylene'
    },
    power: {
      watts: 125,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 64,
      height: 69,
      depth: 64,
      weight: 185,
      connections: ['Multiple 3/4" condensate inlets', '1" outlet']
    },
    features: [
      'Automatic pump out',
      'Float switch control',
      'Overflow protection',
      'Pre-filter included',
      'UV resistant tank',
      'Collection manifold'
    ],
    price: 1850
  },

  // Water Quality Monitoring
  'bluelab-guardian-connect': {
    id: 'bluelab-guardian-connect',
    manufacturer: 'Bluelab',
    model: 'Guardian Monitor Connect',
    category: 'Monitoring',
    type: 'Tank',
    capacity: {
      flowRate: 0 // Static monitoring
    },
    specifications: {
      temperature: { min: 32, max: 122, unit: 'F' }
    },
    power: {
      watts: 5,
      voltage: 12,
      phase: 1
    },
    physical: {
      width: 8,
      height: 10,
      depth: 4,
      weight: 3,
      connections: ['Probe cables']
    },
    features: [
      'pH, EC, temperature monitoring',
      'WiFi connectivity',
      'Data logging',
      'Mobile app alerts',
      'Replaceable probes',
      'Wall mountable'
    ],
    certifications: ['CE', 'FCC'],
    price: 495,
    consumables: [
      {
        type: 'pH probe',
        lifespan: '12-18 months',
        cost: 95
      },
      {
        type: 'EC probe',
        lifespan: '24 months',
        cost: 125
      }
    ]
  },
  'hanna-hi-9814': {
    id: 'hanna-hi-9814',
    manufacturer: 'Hanna Instruments',
    model: 'HI-9814 GroLine',
    category: 'Monitoring',
    type: 'Tank',
    capacity: {
      flowRate: 0
    },
    specifications: {
      temperature: { min: 32, max: 122, unit: 'F' }
    },
    power: {
      watts: 2,
      voltage: 9, // Battery
      phase: 1
    },
    physical: {
      width: 3,
      height: 7,
      depth: 2,
      weight: 0.5,
      connections: ['Probe']
    },
    features: [
      'pH/EC/TDS/Temp combo',
      'Waterproof design',
      'One-point calibration',
      'Replaceable probe',
      'Auto-off function',
      'Cal Check feature'
    ],
    certifications: ['CE', 'IP67'],
    price: 285
  }
};

// Helper functions for water system design
export function calculateWaterStorageNeeds(
  plantCount: number,
  waterPerPlant: number, // gallons/day
  daysOfAutonomy: number = 3,
  systemRedundancy: number = 1.2 // 20% safety factor
): {
  minimumStorage: number;
  recommendedStorage: number;
  tankOptions: WaterStorageSystem[];
  notes: string[];
} {
  const dailyUsage = plantCount * waterPerPlant;
  const minimumStorage = dailyUsage * daysOfAutonomy;
  const recommendedStorage = minimumStorage * systemRedundancy;
  
  // Find suitable tanks
  const storageSystems = Object.values(waterStorageDatabase).filter(
    system => system.category === 'Storage' && system.capacity.volume
  );
  
  const tankOptions = storageSystems.filter(
    tank => tank.capacity.volume! >= recommendedStorage * 0.8
  ).sort((a, b) => a.capacity.volume! - b.capacity.volume!);
  
  const notes: string[] = [];
  notes.push(`Daily water usage: ${dailyUsage.toFixed(0)} gallons`);
  notes.push(`${daysOfAutonomy} days autonomy requires ${minimumStorage.toFixed(0)} gallons`);
  notes.push(`Recommended storage with safety factor: ${recommendedStorage.toFixed(0)} gallons`);
  
  if (tankOptions.length === 0) {
    notes.push('Consider multiple tanks for required capacity');
  }
  
  return {
    minimumStorage,
    recommendedStorage,
    tankOptions: tankOptions.slice(0, 3), // Top 3 options
    notes
  };
}

export function calculateROSystemSize(
  dailyWaterNeed: number, // gallons
  operatingHours: number = 20, // hours/day for RO production
  storageCapacity: number // gallons available for storage
): {
  requiredGPD: number;
  recommendedSystem: WaterStorageSystem | null;
  recoveryTime: number; // hours to fill storage
  notes: string[];
} {
  // RO systems are rated in GPD (gallons per day)
  const requiredGPD = (dailyWaterNeed * 24) / operatingHours;
  
  const roSystems = Object.values(waterStorageDatabase).filter(
    system => system.category === 'RO' && system.capacity.flowRate
  );
  
  const recommendedSystem = roSystems.find(
    system => system.capacity.flowRate! >= requiredGPD
  ) || null;
  
  const actualGPD = recommendedSystem?.capacity.flowRate || 0;
  const recoveryTime = actualGPD > 0 ? (storageCapacity / actualGPD) * 24 : 0;
  
  const notes: string[] = [];
  notes.push(`Minimum RO production needed: ${requiredGPD.toFixed(0)} GPD`);
  
  if (recommendedSystem) {
    notes.push(`Selected system produces ${actualGPD} GPD`);
    notes.push(`Time to fill storage: ${recoveryTime.toFixed(1)} hours`);
  } else {
    notes.push('No single system meets requirements - consider multiple units');
  }
  
  return {
    requiredGPD,
    recommendedSystem,
    recoveryTime,
    notes
  };
}

export function calculateChillerSize(
  reservoirVolume: number, // gallons
  targetTemp: number, // °F
  ambientTemp: number, // °F
  heatLoad: number = 50 // BTU/hr per 100 gallons (typical for pumps/lights)
): {
  requiredBTU: number;
  recommendedChiller: WaterStorageSystem | null;
  coolingTime: number; // hours to reach target
  notes: string[];
} {
  // Calculate heat removal needed
  const tempDifference = ambientTemp - targetTemp;
  const initialCoolingBTU = reservoirVolume * 8.34 * tempDifference; // BTU to cool water
  const continuousLoadBTU = (reservoirVolume / 100) * heatLoad; // Ongoing heat load
  
  // Size for continuous load with safety factor
  const requiredBTU = continuousLoadBTU * 2; // 2x safety factor
  
  const chillers = Object.values(waterStorageDatabase).filter(
    system => system.category === 'Chiller' && system.capacity.coolingCapacity
  );
  
  const recommendedChiller = chillers.find(
    chiller => chiller.capacity.coolingCapacity! >= requiredBTU
  ) || null;
  
  const actualBTU = recommendedChiller?.capacity.coolingCapacity || 0;
  const coolingTime = actualBTU > 0 ? initialCoolingBTU / actualBTU : 0;
  
  const notes: string[] = [];
  notes.push(`Temperature drop needed: ${tempDifference}°F`);
  notes.push(`Continuous heat load: ${continuousLoadBTU.toFixed(0)} BTU/hr`);
  notes.push(`Recommended capacity: ${requiredBTU.toFixed(0)} BTU/hr`);
  
  if (recommendedChiller) {
    notes.push(`Initial cooling time: ${coolingTime.toFixed(1)} hours`);
  }
  
  return {
    requiredBTU,
    recommendedChiller,
    coolingTime,
    notes
  };
}