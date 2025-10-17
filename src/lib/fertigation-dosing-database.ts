// Fertigation and dosing systems database for controlled environment agriculture
// Includes dosing pumps, injectors, controllers, and mixing systems

export interface FertigationSystem {
  id: string;
  manufacturer: string;
  model: string;
  category: 'DosingPump' | 'Injector' | 'Controller' | 'MixingTank' | 'StockTank' | 'Monitor';
  type: 'Peristaltic' | 'Diaphragm' | 'Venturi' | 'Proportional' | 'Tank' | 'Digital';
  capacity: {
    flowRate?: number; // ml/min or GPH
    injectionRatio?: string; // "1:100", "1:1000", etc.
    tankVolume?: number; // gallons
    channels?: number; // number of dosing channels
    zones?: number; // irrigation zones supported
  };
  specifications: {
    accuracy?: number; // % accuracy
    pressure?: { min: number; max: number; unit: 'PSI' };
    viscosity?: { min: number; max: number; unit: 'cP' };
    phRange?: { min: number; max: number };
    ecRange?: { min: number; max: number; unit: 'mS/cm' };
    temperature?: { min: number; max: number; unit: 'F' };
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
    weight: number; // lbs
    tubingSize?: string; // "1/4 inch", "3/8 inch", etc.
  };
  control?: {
    interface: 'Manual' | 'Digital' | 'WiFi' | 'Ethernet' | '4-20mA' | 'Modbus';
    programming?: string[]; // "Time-based", "Volume-based", "Sensor-based"
    dataLogging?: boolean;
  };
  features: string[];
  chemicalCompatibility?: string[];
  certifications?: string[];
  price?: number;
  consumables?: {
    type: string;
    lifespan: string;
    cost: number;
  }[];
}

export const fertigationCategories = {
  DosingPump: {
    name: 'Dosing Pumps',
    description: 'Precision chemical and nutrient injection pumps',
    icon: 'syringe',
    pros: ['Accurate dosing', 'Automated control', 'Multiple chemicals', 'Programmable'],
    cons: ['Maintenance needs', 'Tube replacement', 'Limited flow rates']
  },
  Injector: {
    name: 'Injectors',
    description: 'Venturi and proportional injectors for inline dosing',
    icon: 'git-merge',
    pros: ['No power needed', 'High flow rates', 'Simple operation', 'Reliable'],
    cons: ['Less precise', 'Pressure dependent', 'Single ratio']
  },
  Controller: {
    name: 'Controllers',
    description: 'pH/EC controllers and automation systems',
    icon: 'cpu',
    pros: ['Automated control', 'Data logging', 'Multi-parameter', 'Remote access'],
    cons: ['Complex setup', 'Sensor calibration', 'Higher cost']
  },
  MixingTank: {
    name: 'Mixing Systems',
    description: 'Automated nutrient mixing and blending tanks',
    icon: 'beaker',
    pros: ['Batch consistency', 'Large volume', 'Complete mixing', 'Time saving'],
    cons: ['Space requirements', 'Initial cost', 'Cleaning needs']
  },
  StockTank: {
    name: 'Stock Tanks',
    description: 'Concentrated nutrient storage solutions',
    icon: 'database',
    pros: ['Space efficient', 'Long storage', 'Easy dosing', 'Cost effective'],
    cons: ['Mixing required', 'Precipitation risk', 'Limited shelf life']
  },
  Monitor: {
    name: 'Monitors',
    description: 'pH, EC, and nutrient monitoring equipment',
    icon: 'activity',
    pros: ['Real-time data', 'Quality control', 'Trend analysis', 'Alerts'],
    cons: ['Calibration needs', 'Probe replacement', 'Integration requirements']
  }
};

export const fertigationDatabase: Record<string, FertigationSystem> = {
  // Dosing Pumps - Peristaltic
  'stenner-85mhp17': {
    id: 'stenner-85mhp17',
    manufacturer: 'Stenner',
    model: '85MHP17',
    category: 'DosingPump',
    type: 'Peristaltic',
    capacity: {
      flowRate: 17 // GPD at 100 PSI
    },
    specifications: {
      accuracy: 3,
      pressure: { min: 0, max: 100, unit: 'PSI' },
      viscosity: { min: 1, max: 5000, unit: 'cP' },
      temperature: { min: 40, max: 140, unit: 'F' }
    },
    power: {
      watts: 33,
      voltage: 120,
      phase: 1,
      amps: 0.28
    },
    physical: {
      width: 4,
      height: 11,
      depth: 6,
      weight: 8,
      tubingSize: '3/8 inch'
    },
    control: {
      interface: 'Manual',
      programming: ['Continuous', 'Timer control']
    },
    features: [
      'Self-priming',
      'Run dry capable',
      'No check valves needed',
      'Tube failure detection',
      'Made in USA',
      '3-year warranty'
    ],
    chemicalCompatibility: ['Acids', 'Bases', 'Oxidizers', 'Nutrients'],
    certifications: ['NSF-50', 'NSF-61', 'CE'],
    price: 485,
    consumables: [{
      type: 'Pump tube',
      lifespan: '6-12 months',
      cost: 45
    }]
  },
  'blue-white-flexflo-a3': {
    id: 'blue-white-flexflo-a3',
    manufacturer: 'Blue-White',
    model: 'Flex-Pro A3',
    category: 'DosingPump',
    type: 'Peristaltic',
    capacity: {
      flowRate: 158.5 // ml/min max
    },
    specifications: {
      accuracy: 2,
      pressure: { min: 0, max: 125, unit: 'PSI' },
      temperature: { min: 35, max: 140, unit: 'F' }
    },
    power: {
      watts: 40,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 5,
      height: 8,
      depth: 7,
      weight: 9,
      tubingSize: '1/4 to 1/2 inch'
    },
    control: {
      interface: 'Digital',
      programming: ['Manual', '4-20mA', 'Pulse', 'Timer'],
      dataLogging: false
    },
    features: [
      'Variable speed motor',
      'LCD display',
      'Scalable 4-20mA',
      'External control',
      'IP66 rated',
      'Field serviceable'
    ],
    chemicalCompatibility: ['All chemicals'],
    certifications: ['ETL', 'CE'],
    price: 685,
    consumables: [{
      type: 'Tube assembly',
      lifespan: '6-18 months',
      cost: 65
    }]
  },

  // Dosing Pumps - Diaphragm
  'prominent-gamma-l': {
    id: 'prominent-gamma-l',
    manufacturer: 'ProMinent',
    model: 'gamma/ L',
    category: 'DosingPump',
    type: 'Diaphragm',
    capacity: {
      flowRate: 1000 // ml/min max
    },
    specifications: {
      accuracy: 1,
      pressure: { min: 0, max: 232, unit: 'PSI' },
      temperature: { min: 14, max: 113, unit: 'F' }
    },
    power: {
      watts: 35,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 7,
      height: 9,
      depth: 5,
      weight: 11
    },
    control: {
      interface: 'Digital',
      programming: ['Manual', 'Pulse', 'Analog', 'Bus'],
      dataLogging: true
    },
    features: [
      'Auto-deaeration',
      'Variable stroke length',
      'LED status display',
      'Remote control capable',
      'Pressure monitoring',
      'German engineering'
    ],
    chemicalCompatibility: ['Acids', 'Bases', 'Solvents'],
    certifications: ['CE', 'NSF', 'ATEX'],
    price: 1285,
    consumables: [{
      type: 'Diaphragm kit',
      lifespan: '2-3 years',
      cost: 125
    }]
  },
  'pulsafeeder-pulsatron': {
    id: 'pulsafeeder-pulsatron',
    manufacturer: 'Pulsafeeder',
    model: 'Pulsatron MP',
    category: 'DosingPump',
    type: 'Diaphragm',
    capacity: {
      flowRate: 30 // GPH max
    },
    specifications: {
      accuracy: 2,
      pressure: { min: 0, max: 150, unit: 'PSI' },
      temperature: { min: 30, max: 140, unit: 'F' }
    },
    power: {
      watts: 40,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 6,
      height: 8,
      depth: 4,
      weight: 7,
      tubingSize: '3/8 inch'
    },
    control: {
      interface: 'Digital',
      programming: ['External pace', 'Analog signal', 'Timer'],
      dataLogging: false
    },
    features: [
      'Microprocessor control',
      'Auto-prime feature',
      'Leak detection',
      'NEMA 4X enclosure',
      'Simple programming',
      'Long service life'
    ],
    price: 585,
    consumables: [{
      type: 'Liquid end rebuild kit',
      lifespan: '18-24 months',
      cost: 85
    }]
  },

  // Venturi Injectors
  'dosatron-d25re2': {
    id: 'dosatron-d25re2',
    manufacturer: 'Dosatron',
    model: 'D25RE2',
    category: 'Injector',
    type: 'Venturi',
    capacity: {
      flowRate: 100, // GPM water flow
      injectionRatio: '1:500 to 1:50'
    },
    specifications: {
      pressure: { min: 4.3, max: 85, unit: 'PSI' },
      temperature: { min: 40, max: 104, unit: 'F' }
    },
    physical: {
      width: 6,
      height: 18,
      depth: 6,
      weight: 12
    },
    control: {
      interface: 'Manual',
      programming: ['Ratio adjustment']
    },
    features: [
      'No electricity required',
      'Water-powered motor',
      'External adjustment',
      'PVDF construction',
      'NSF certified',
      'French engineering'
    ],
    chemicalCompatibility: ['Most fertilizers', 'Acids', 'Pesticides'],
    certifications: ['NSF-61', 'NSF-372', 'CE'],
    price: 785
  },
  'mixrite-25': {
    id: 'mixrite-25',
    manufacturer: 'MixRite',
    model: '2.5m³/h',
    category: 'Injector',
    type: 'Proportional',
    capacity: {
      flowRate: 11, // GPM
      injectionRatio: '0.2% to 2%'
    },
    specifications: {
      pressure: { min: 4.3, max: 120, unit: 'PSI' },
      temperature: { min: 39, max: 104, unit: 'F' }
    },
    physical: {
      width: 5,
      height: 14,
      depth: 5,
      weight: 8
    },
    control: {
      interface: 'Manual',
      programming: ['Ratio dial']
    },
    features: [
      'Precise proportioning',
      'No power needed',
      'Visual flow indicator',
      'Corrosion resistant',
      'Easy maintenance',
      'Wide flow range'
    ],
    price: 425
  },

  // pH/EC Controllers
  'bluelab-pro-controller': {
    id: 'bluelab-pro-controller',
    manufacturer: 'Bluelab',
    model: 'Pro Controller',
    category: 'Controller',
    type: 'Digital',
    capacity: {
      channels: 3, // pH down, pH up, nutrient
      zones: 1
    },
    specifications: {
      accuracy: 0.1,
      phRange: { min: 0, max: 14 },
      ecRange: { min: 0, max: 10, unit: 'mS/cm' },
      temperature: { min: 32, max: 122, unit: 'F' }
    },
    power: {
      watts: 15,
      voltage: 24,
      phase: 1
    },
    physical: {
      width: 10,
      height: 8,
      depth: 4,
      weight: 5
    },
    control: {
      interface: 'Digital',
      programming: ['Set point control', 'Dosing lockouts', 'Alarms'],
      dataLogging: true
    },
    features: [
      'Touchscreen interface',
      'Data logging to USB',
      'High/low alarms',
      'Dosing lockouts',
      'Connect app compatible',
      'Probe included'
    ],
    certifications: ['CE', 'FCC'],
    price: 1485,
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
  'milwaukee-mc720': {
    id: 'milwaukee-mc720',
    manufacturer: 'Milwaukee',
    model: 'MC720 pH Controller',
    category: 'Controller',
    type: 'Digital',
    capacity: {
      channels: 1,
      zones: 1
    },
    specifications: {
      accuracy: 0.1,
      phRange: { min: 0, max: 14 },
      temperature: { min: 32, max: 122, unit: 'F' }
    },
    power: {
      watts: 10,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 6,
      height: 4,
      depth: 3,
      weight: 2
    },
    control: {
      interface: 'Digital',
      programming: ['Set point control', 'Hysteresis'],
      dataLogging: false
    },
    features: [
      'LED display',
      'Simple operation',
      'Dosing LED indicator',
      'Manual override',
      'Wall mountable',
      'Budget friendly'
    ],
    price: 185,
    consumables: [{
      type: 'pH electrode',
      lifespan: '12 months',
      cost: 45
    }]
  },

  // Mixing Tanks
  'chemtainer-100-mixer': {
    id: 'chemtainer-100-mixer',
    manufacturer: 'Chem-Tainer',
    model: '100 Gallon Mixing Tank',
    category: 'MixingTank',
    type: 'Tank',
    capacity: {
      tankVolume: 100
    },
    specifications: {
      temperature: { min: -40, max: 140, unit: 'F' }
    },
    power: {
      watts: 250, // Mixer motor
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 30,
      height: 48,
      depth: 30,
      weight: 85
    },
    features: [
      'Conical bottom',
      'Direct drive mixer',
      'Variable speed motor',
      'Lid with ports',
      'Drain valve',
      'Level indicators'
    ],
    price: 1285
  },
  'graco-tote-mixer': {
    id: 'graco-tote-mixer',
    manufacturer: 'Graco',
    model: 'Tote Tank Agitator',
    category: 'MixingTank',
    type: 'Tank',
    capacity: {
      tankVolume: 275 // Standard IBC tote
    },
    specifications: {
      viscosity: { min: 1, max: 5000, unit: 'cP' }
    },
    power: {
      watts: 750,
      voltage: 120,
      phase: 1
    },
    physical: {
      width: 8,
      height: 48,
      depth: 8,
      weight: 45
    },
    features: [
      'Clamp-on mount',
      'Folding propeller',
      'Variable speed',
      'Stainless steel shaft',
      'Pneumatic option',
      'Industrial grade'
    ],
    price: 2485
  },

  // Stock Solution Tanks
  'ace-stock-tank-50': {
    id: 'ace-stock-tank-50',
    manufacturer: 'Ace Roto-Mold',
    model: '50 Gallon Stock Tank',
    category: 'StockTank',
    type: 'Tank',
    capacity: {
      tankVolume: 50
    },
    specifications: {
      temperature: { min: -40, max: 140, unit: 'F' }
    },
    physical: {
      width: 24,
      height: 36,
      depth: 24,
      weight: 25
    },
    features: [
      'Graduated markings',
      'Wide mouth lid',
      'Translucent white',
      'UV stabilized',
      'Fitting inserts',
      'Stackable design'
    ],
    price: 285
  },

  // Monitoring Equipment
  'hanna-hi-10000': {
    id: 'hanna-hi-10000',
    manufacturer: 'Hanna Instruments',
    model: 'HI-10000 Process Controller',
    category: 'Monitor',
    type: 'Digital',
    capacity: {
      channels: 6,
      zones: 4
    },
    specifications: {
      accuracy: 0.05,
      phRange: { min: -2, max: 16 },
      ecRange: { min: 0, max: 20, unit: 'mS/cm' },
      temperature: { min: -5, max: 105, unit: 'F' }
    },
    power: {
      watts: 25,
      voltage: 240,
      phase: 1
    },
    physical: {
      width: 12,
      height: 10,
      depth: 6,
      weight: 8
    },
    control: {
      interface: 'Ethernet',
      programming: ['PID control', 'Data logging', 'SCADA compatible'],
      dataLogging: true
    },
    features: [
      'Touchscreen HMI',
      'Multi-parameter control',
      'Ethernet connectivity',
      'Modbus protocol',
      'Graphical trending',
      'Italian engineering'
    ],
    certifications: ['CE', 'UL', 'IP65'],
    price: 3485,
    consumables: [
      {
        type: 'pH probe',
        lifespan: '18-24 months',
        cost: 185
      },
      {
        type: 'EC probe',
        lifespan: '24-36 months',
        cost: 245
      }
    ]
  },
  'atlas-scientific-ezo': {
    id: 'atlas-scientific-ezo',
    manufacturer: 'Atlas Scientific',
    model: 'EZO Complete Kit',
    category: 'Monitor',
    type: 'Digital',
    capacity: {
      channels: 8
    },
    specifications: {
      accuracy: 0.02,
      phRange: { min: 0, max: 14 },
      ecRange: { min: 0, max: 200, unit: 'mS/cm' }
    },
    power: {
      watts: 5,
      voltage: 5,
      phase: 1
    },
    physical: {
      width: 8,
      height: 6,
      depth: 3,
      weight: 2
    },
    control: {
      interface: 'WiFi',
      programming: ['Arduino compatible', 'Python library', 'REST API'],
      dataLogging: true
    },
    features: [
      'Embedded circuits',
      'I2C/UART interface',
      'Temperature compensation',
      'Calibration storage',
      'Open source friendly',
      'Research grade'
    ],
    price: 685,
    consumables: [{
      type: 'Lab grade probes',
      lifespan: '24 months',
      cost: 165
    }]
  }
};

// Helper functions for fertigation system design
export function calculateDosingPumpSize(
  tankVolume: number, // gallons
  targetEC: number, // mS/cm
  stockConcentration: number, // EC of stock solution in mS/cm
  turnoverTime: number = 60 // minutes to dose full tank
): {
  requiredFlowRate: number; // ml/min
  injectionVolume: number; // ml total
  recommendedPump: FertigationSystem | null;
  notes: string[];
} {
  // Calculate dilution ratio
  const dilutionRatio = stockConcentration / targetEC;
  
  // Calculate total injection volume needed
  const injectionVolume = (tankVolume * 3785) / dilutionRatio; // Convert gallons to ml
  
  // Calculate required flow rate
  const requiredFlowRate = injectionVolume / turnoverTime;
  
  const pumps = Object.values(fertigationDatabase).filter(
    system => system.category === 'DosingPump' && system.capacity.flowRate
  );
  
  const recommendedPump = pumps.find(pump => {
    const pumpFlowRate = pump.capacity.flowRate!;
    // Convert GPD to ml/min if needed
    const flowRateMLMin = pumpFlowRate > 100 ? 
      (pumpFlowRate * 3785) / (24 * 60) : pumpFlowRate;
    return flowRateMLMin >= requiredFlowRate;
  }) || null;
  
  const notes: string[] = [];
  notes.push(`Stock solution dilution ratio: 1:${dilutionRatio.toFixed(0)}`);
  notes.push(`Total injection needed: ${(injectionVolume/1000).toFixed(1)} liters`);
  notes.push(`Required pump flow rate: ${requiredFlowRate.toFixed(1)} ml/min`);
  
  if (!recommendedPump) {
    notes.push('Consider multiple pumps or longer dosing time');
  }
  
  return {
    requiredFlowRate,
    injectionVolume,
    recommendedPump,
    notes
  };
}

export function calculateInjectorSize(
  waterFlowRate: number, // GPM
  stockECTarget: number, // target EC contribution from stock
  stockConcentration: number // EC of stock solution
): {
  injectionRatio: string;
  percentInjection: number;
  recommendedInjector: FertigationSystem | null;
  notes: string[];
} {
  // Calculate required injection percentage
  const percentInjection = (stockECTarget / stockConcentration) * 100;
  const injectionRatio = `1:${Math.round(100 / percentInjection)}`;
  
  const injectors = Object.values(fertigationDatabase).filter(
    system => system.category === 'Injector' && 
    system.capacity.flowRate! >= waterFlowRate * 0.8
  );
  
  const recommendedInjector = injectors.find(injector => {
    // Check if injection ratio is within range
    const ratioRange = injector.capacity.injectionRatio;
    if (!ratioRange) return false;
    
    // Parse ratio range (e.g., "1:500 to 1:50")
    const matches = ratioRange.match(/1:(\d+)\s+to\s+1:(\d+)/);
    if (!matches) return false;
    
    const maxRatio = parseInt(matches[1]);
    const minRatio = parseInt(matches[2]);
    const targetRatio = Math.round(100 / percentInjection);
    
    return targetRatio >= minRatio && targetRatio <= maxRatio;
  }) || null;
  
  const notes: string[] = [];
  notes.push(`Required injection: ${percentInjection.toFixed(2)}%`);
  notes.push(`Injection ratio: ${injectionRatio}`);
  
  if (recommendedInjector) {
    notes.push(`Water flow within injector range`);
  } else {
    notes.push('Consider different stock concentration or multiple injectors');
  }
  
  return {
    injectionRatio,
    percentInjection,
    recommendedInjector,
    notes
  };
}

export function designStockSolutionSystem(
  dailyWaterUsage: number, // gallons/day
  numberOfNutrients: number = 2, // A & B typical
  stockConcentrationFactor: number = 100, // 100x concentrated
  daysOfStock: number = 7 // how many days stock should last
): {
  stockTankSize: number; // gallons per nutrient
  dailyStockUsage: number; // gallons/day per nutrient
  recommendedTanks: FertigationSystem[];
  mixingSystem: FertigationSystem | null;
  notes: string[];
} {
  // Calculate daily stock usage
  const dailyStockUsage = dailyWaterUsage / stockConcentrationFactor;
  
  // Calculate required tank size
  const stockTankSize = dailyStockUsage * daysOfStock * 1.2; // 20% safety factor
  
  const stockTanks = Object.values(fertigationDatabase).filter(
    system => system.category === 'StockTank' && 
    system.capacity.tankVolume! >= stockTankSize
  );
  
  const recommendedTanks = stockTanks.slice(0, numberOfNutrients);
  
  const mixingSystems = Object.values(fertigationDatabase).filter(
    system => system.category === 'MixingTank' && 
    system.capacity.tankVolume! >= stockTankSize
  );
  
  const mixingSystem = mixingSystems[0] || null;
  
  const notes: string[] = [];
  notes.push(`Daily stock usage per nutrient: ${dailyStockUsage.toFixed(1)} gallons`);
  notes.push(`Recommended tank size: ${stockTankSize.toFixed(0)} gallons`);
  notes.push(`Stock will last ${daysOfStock} days at current usage`);
  
  if (recommendedTanks.length < numberOfNutrients) {
    notes.push(`Need ${numberOfNutrients - recommendedTanks.length} additional tanks`);
  }
  
  return {
    stockTankSize,
    dailyStockUsage,
    recommendedTanks,
    mixingSystem,
    notes
  };
}