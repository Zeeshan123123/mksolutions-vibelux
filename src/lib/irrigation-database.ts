// Irrigation and fertigation systems database for controlled environment agriculture
// Includes drip, ebb & flow, NFT, DWC, and automated dosing systems

export interface IrrigationSystem {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Drip' | 'EbbFlow' | 'NFT' | 'DWC' | 'Aeroponic' | 'Dosing' | 'Controller' | 'WaterTreatment' | 'Boom' | 'Spray' | 'Overhead' | 'Valves' | 'Filtration' | 'Monitoring' | 'Safety';
  type?: 'Distribution' | 'Monitoring' | 'Treatment' | 'Storage' | 'Control' | 'Safety';
  capacity: {
    flowRate?: number; // GPH or GPM
    coverage?: number; // number of plants or sq ft
    tankSize?: number; // gallons
    channels?: number; // for controllers
    zones?: number; // irrigation zones
  };
  specifications: {
    pressure?: { min: number; max: number; unit: 'PSI' };
    accuracy?: number; // percentage
    ecRange?: { min: number; max: number };
    phRange?: { min: number; max: number };
  };
  power?: {
    watts?: number;
    voltage?: number;
    phase?: 1 | 3;
  };
  physical: {
    width?: number; // inches
    height?: number;
    depth?: number;
    weight?: number; // lbs
  };
  features: string[];
  connectivity?: string[];
  price?: number;
  consumables?: {
    type: string;
    lifespan: string;
    cost?: number;
  }[];
}

export const irrigationCategories = {
  Drip: {
    name: 'Drip Irrigation',
    description: 'Precise water delivery to individual plants',
    icon: 'droplet',
    pros: ['Water efficient', 'Precise delivery', 'Reduces disease'],
    cons: ['Can clog', 'Installation time', 'Maintenance required']
  },
  EbbFlow: {
    name: 'Ebb & Flow',
    description: 'Flood and drain hydroponic systems',
    icon: 'waves',
    pros: ['Simple operation', 'Good oxygenation', 'Versatile'],
    cons: ['Pump dependency', 'Disease spread risk', 'Timer critical']
  },
  NFT: {
    name: 'NFT Systems',
    description: 'Nutrient Film Technique for continuous flow',
    icon: 'stream',
    pros: ['Water efficient', 'Good oxygenation', 'No medium needed'],
    cons: ['Power outage risk', 'Clogging issues', 'Limited to small plants']
  },
  DWC: {
    name: 'Deep Water Culture',
    description: 'Roots suspended in oxygenated nutrient solution',
    icon: 'pool',
    pros: ['Fast growth', 'Simple setup', 'Low maintenance'],
    cons: ['Temperature sensitive', 'Power dependency', 'Disease risk']
  },
  Aeroponic: {
    name: 'Aeroponic Systems',
    description: 'Misting roots with nutrient solution',
    icon: 'spray',
    pros: ['Maximum oxygenation', 'Water efficient', 'Fast growth'],
    cons: ['Complex', 'Expensive', 'Power critical']
  },
  Dosing: {
    name: 'Dosing Systems',
    description: 'Automated nutrient injection',
    icon: 'syringe',
    pros: ['Precise control', 'Automated', 'Consistent EC/pH'],
    cons: ['Expensive', 'Calibration needed', 'Complex setup']
  },
  Controller: {
    name: 'Controllers',
    description: 'Irrigation automation and monitoring',
    icon: 'cpu',
    pros: ['Automation', 'Data logging', 'Remote access'],
    cons: ['Learning curve', 'Cost', 'Sensor maintenance']
  },
  WaterTreatment: {
    name: 'Water Treatment',
    description: 'RO, UV, filtration systems',
    icon: 'filter',
    pros: ['Clean water', 'Pathogen control', 'Consistent quality'],
    cons: ['Water waste (RO)', 'Maintenance', 'Operating cost']
  },
  Boom: {
    name: 'Boom Irrigation',
    description: 'Linear boom systems for uniform coverage',
    icon: 'zap',
    pros: ['Wide coverage', 'Uniform application', 'Automation'],
    cons: ['Complex setup', 'Higher cost', 'Maintenance needs']
  },
  Spray: {
    name: 'Spray Systems',
    description: 'Various spray nozzles and patterns',
    icon: 'droplets',
    pros: ['Flexible coverage', 'Quick application', 'Various patterns'],
    cons: ['Wind sensitive', 'Evaporation loss', 'Pressure dependent']
  },
  Overhead: {
    name: 'Overhead Irrigation',
    description: 'Overhead sprinkler and misting systems',
    icon: 'cloud-rain',
    pros: ['Complete coverage', 'Easy installation', 'Climate control'],
    cons: ['Disease risk', 'Water waste', 'Leaf wetting']
  },
  Valves: {
    name: 'Valves & Controls',
    description: 'Pressure regulators, venturi valves, and control valves',
    icon: 'settings',
    pros: ['Precise control', 'Pressure regulation', 'System protection'],
    cons: ['Maintenance needs', 'Pressure drop', 'Installation complexity']
  },
  Filtration: {
    name: 'Filtration Systems',
    description: 'Sand, disc, screen, and specialty filters',
    icon: 'filter',
    pros: ['Clean water', 'Clog prevention', 'System protection'],
    cons: ['Maintenance required', 'Pressure drop', 'Replacement costs']
  },
  Monitoring: {
    name: 'Flow & Monitoring',
    description: 'Flow meters, pressure gauges, and monitoring equipment',
    icon: 'gauge',
    pros: ['Precise measurement', 'System diagnostics', 'Performance tracking'],
    cons: ['Installation cost', 'Calibration needs', 'Complexity']
  },
  Safety: {
    name: 'Safety Equipment',
    description: 'Backflow preventers and safety devices',
    icon: 'shield',
    pros: ['System protection', 'Code compliance', 'Safety assurance'],
    cons: ['Added cost', 'Pressure drop', 'Maintenance required']
  }
};

export const irrigationDatabase: Record<string, IrrigationSystem> = {
  // Drip Irrigation Systems
  'netafim-netbow': {
    id: 'netafim-netbow',
    manufacturer: 'Netafim',
    model: 'NetBow',
    category: 'Drip',
    type: 'Distribution',
    capacity: {
      flowRate: 0.5, // GPH per dripper
      coverage: 1000 // plants
    },
    specifications: {
      pressure: { min: 10, max: 60, unit: 'PSI' },
      accuracy: 5
    },
    physical: {
      weight: 0.1
    },
    features: [
      'Pressure compensating',
      'Anti-drain mechanism',
      'Self-flushing',
      'UV resistant',
      'Clog resistant',
      'Color coded flow rates'
    ],
    price: 0.45, // per dripper
    consumables: [{
      type: 'Dripper',
      lifespan: '5-10 years',
      cost: 0.45
    }]
  },
  'rainbird-xfs-cv': {
    id: 'rainbird-xfs-cv',
    manufacturer: 'Rain Bird',
    model: 'XFS-CV Dripline',
    category: 'Drip',
    type: 'Distribution',
    capacity: {
      flowRate: 0.6,
      coverage: 500 // linear feet
    },
    specifications: {
      pressure: { min: 15, max: 60, unit: 'PSI' }
    },
    features: [
      'Copper oxide root barrier',
      'Check valve in every emitter',
      'Flexible tubing',
      'Self-flushing',
      'Subsurface compatible'
    ],
    price: 0.65 // per foot
  },

  // Ebb & Flow Systems
  'botanicare-ebb-4x4': {
    id: 'botanicare-ebb-4x4',
    manufacturer: 'Botanicare',
    model: '4x4 Ebb & Flow',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 16, // sq ft
      tankSize: 40
    },
    specifications: {
      pressure: { min: 0, max: 10, unit: 'PSI' }
    },
    power: {
      watts: 25,
      voltage: 120
    },
    physical: {
      width: 48,
      height: 7,
      depth: 48,
      weight: 35
    },
    features: [
      'Complete tray system',
      'Overflow fitting',
      'Heavy-duty pump',
      'Timer included',
      'Expandable design'
    ],
    price: 380
  },
  'active-aqua-grow-flow': {
    id: 'active-aqua-grow-flow',
    manufacturer: 'Active Aqua',
    model: 'Grow Flow 2x4',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 8,
      tankSize: 25
    },
    power: {
      watts: 18,
      voltage: 120
    },
    physical: {
      width: 48,
      height: 7,
      depth: 24,
      weight: 25
    },
    features: [
      'Modular system',
      'Extension kits available',
      'Premium pump',
      'Digital timer',
      'Drain kit included'
    ],
    price: 250
  },

  // Commercial Flood Tables - Various Sizes
  'botanicare-flood-4x8': {
    id: 'botanicare-flood-4x8',
    manufacturer: 'Botanicare',
    model: '4x8 Commercial Flood Table',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 32, // sq ft
      tankSize: 100
    },
    specifications: {
      pressure: { min: 0, max: 15, unit: 'PSI' }
    },
    power: {
      watts: 45,
      voltage: 120
    },
    physical: {
      width: 96, // 8 feet
      height: 8,
      depth: 48, // 4 feet
      weight: 65
    },
    features: [
      'Heavy-duty construction',
      'Integrated drain fittings',
      'Level adjustable legs',
      'Food-grade materials',
      'Modular expandable'
    ],
    price: 580
  },

  'botanicare-flood-4x12': {
    id: 'botanicare-flood-4x12',
    manufacturer: 'Botanicare',
    model: '4x12 Commercial Flood Table',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 48, // sq ft
      tankSize: 150
    },
    specifications: {
      pressure: { min: 0, max: 15, unit: 'PSI' }
    },
    power: {
      watts: 65,
      voltage: 120
    },
    physical: {
      width: 144, // 12 feet
      height: 8,
      depth: 48, // 4 feet
      weight: 95
    },
    features: [
      'Extra long design',
      'Multiple drain points',
      'Reinforced frame',
      'Quick-connect fittings',
      'Professional grade'
    ],
    price: 780
  },

  'botanicare-flood-4x16': {
    id: 'botanicare-flood-4x16',
    manufacturer: 'Botanicare',
    model: '4x16 Commercial Flood Table',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 64, // sq ft
      tankSize: 200
    },
    specifications: {
      pressure: { min: 0, max: 20, unit: 'PSI' }
    },
    power: {
      watts: 85,
      voltage: 120
    },
    physical: {
      width: 192, // 16 feet
      height: 8,
      depth: 48, // 4 feet
      weight: 125
    },
    features: [
      'Maximum length design',
      'Three drain zones',
      'Heavy-duty support',
      'Professional installation',
      'Commercial grade'
    ],
    price: 1180
  },

  'active-aqua-flood-8x8': {
    id: 'active-aqua-flood-8x8',
    manufacturer: 'Active Aqua',
    model: '8x8 Square Flood Table',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 64, // sq ft
      tankSize: 200
    },
    specifications: {
      pressure: { min: 0, max: 15, unit: 'PSI' }
    },
    power: {
      watts: 75,
      voltage: 120
    },
    physical: {
      width: 96, // 8 feet
      height: 8,
      depth: 96, // 8 feet
      weight: 110
    },
    features: [
      'Square configuration',
      'Center drain design',
      'Adjustable slope',
      'Modular corners',
      'Easy assembly'
    ],
    price: 980
  },

  'active-aqua-flood-6x12': {
    id: 'active-aqua-flood-6x12',
    manufacturer: 'Active Aqua',
    model: '6x12 Rectangular Flood Table',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 72, // sq ft
      tankSize: 220
    },
    specifications: {
      pressure: { min: 0, max: 15, unit: 'PSI' }
    },
    power: {
      watts: 80,
      voltage: 120
    },
    physical: {
      width: 144, // 12 feet
      height: 8,
      depth: 72, // 6 feet
      weight: 115
    },
    features: [
      'Optimal ratio design',
      'Dual drain points',
      'Sloped for drainage',
      'Heavy-duty frame',
      'Quick setup'
    ],
    price: 1080
  },

  'botanicare-flood-8x12': {
    id: 'botanicare-flood-8x12',
    manufacturer: 'Botanicare',
    model: '8x12 Large Commercial Table',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 96, // sq ft
      tankSize: 300
    },
    specifications: {
      pressure: { min: 0, max: 20, unit: 'PSI' }
    },
    power: {
      watts: 100,
      voltage: 120
    },
    physical: {
      width: 144, // 12 feet
      height: 9,
      depth: 96, // 8 feet
      weight: 155
    },
    features: [
      'Large commercial size',
      'Four drain zones',
      'Professional frame',
      'Multiple inlet points',
      'Maximum capacity'
    ],
    price: 1580
  },

  'active-aqua-flood-10x10': {
    id: 'active-aqua-flood-10x10',
    manufacturer: 'Active Aqua',
    model: '10x10 Mega Square Table',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 100, // sq ft
      tankSize: 350
    },
    specifications: {
      pressure: { min: 0, max: 20, unit: 'PSI' }
    },
    power: {
      watts: 110,
      voltage: 120
    },
    physical: {
      width: 120, // 10 feet
      height: 9,
      depth: 120, // 10 feet
      weight: 175
    },
    features: [
      'Maximum square design',
      'Central drain manifold',
      'Professional grade',
      'Reinforced corners',
      'Industrial strength'
    ],
    price: 1880
  },

  // NFT Systems
  'cropking-nft-4-6': {
    id: 'cropking-nft-4-6',
    manufacturer: 'CropKing',
    model: 'NFT 4-6',
    category: 'NFT',
    type: 'Distribution',
    capacity: {
      coverage: 24, // plant sites
      channels: 4
    },
    specifications: {
      pressure: { min: 0, max: 5, unit: 'PSI' }
    },
    power: {
      watts: 35,
      voltage: 120
    },
    physical: {
      width: 72,
      height: 36,
      depth: 24,
      weight: 45
    },
    features: [
      'Food-grade channels',
      'Adjustable slope',
      'Complete nutrient delivery',
      'End caps included',
      'Commercial grade'
    ],
    price: 650
  },

  // DWC Systems
  'current-culture-uc-solo': {
    id: 'current-culture-uc-solo',
    manufacturer: 'Current Culture',
    model: 'Under Current Solo',
    category: 'DWC',
    type: 'Distribution',
    capacity: {
      coverage: 1, // plant
      tankSize: 13
    },
    specifications: {
      pressure: { min: 0, max: 0, unit: 'PSI' }
    },
    power: {
      watts: 10, // air pump
      voltage: 120
    },
    physical: {
      width: 20,
      height: 16,
      depth: 20,
      weight: 15
    },
    features: [
      'Patented Sub-Current',
      'Premium air diffuser',
      'Light-proof design',
      'Bulkhead fittings',
      'Scalable system'
    ],
    price: 180
  },
  'oxypot-xl': {
    id: 'oxypot-xl',
    manufacturer: 'OxyPot',
    model: 'XL System',
    category: 'DWC',
    type: 'Distribution',
    capacity: {
      coverage: 1,
      tankSize: 19
    },
    power: {
      watts: 5,
      voltage: 120
    },
    physical: {
      width: 15,
      height: 15,
      depth: 15,
      weight: 10
    },
    features: [
      'Mesh pot included',
      'Quiet air pump',
      'Easy access lid',
      'pH stable plastic',
      'Complete kit'
    ],
    price: 95
  },

  // Dosing Systems
  'dosatron-d14mz2': {
    id: 'dosatron-d14mz2',
    manufacturer: 'Dosatron',
    model: 'D14MZ2',
    category: 'Dosing',
    type: 'Monitoring',
    capacity: {
      flowRate: 40, // GPM max
      coverage: 10000 // sq ft
    },
    specifications: {
      pressure: { min: 4.5, max: 85, unit: 'PSI' },
      accuracy: 3
    },
    physical: {
      width: 8,
      height: 24,
      depth: 8,
      weight: 15
    },
    features: [
      'No electricity required',
      'Proportional injection',
      '1:500 to 1:50 ratio',
      'External adjustment',
      'Chemical resistant',
      'NSF certified'
    ],
    price: 850
  },
  'bluelab-dosetronic': {
    id: 'bluelab-dosetronic',
    manufacturer: 'Bluelab',
    model: 'Dosetronic',
    category: 'Dosing',
    type: 'Monitoring',
    capacity: {
      channels: 6,
      zones: 1
    },
    specifications: {
      ecRange: { min: 0, max: 10 },
      phRange: { min: 0, max: 14 },
      accuracy: 2
    },
    power: {
      watts: 15,
      voltage: 120
    },
    physical: {
      width: 12,
      height: 10,
      depth: 4,
      weight: 8
    },
    features: [
      'Peristaltic pumps',
      'pH/EC control',
      'Data logging',
      'Alarm functions',
      'Connect app compatible',
      'Wall mountable'
    ],
    connectivity: ['Bluetooth', 'WiFi'],
    price: 1950
  },

  // Controllers
  'netafim-netbeat': {
    id: 'netafim-netbeat',
    manufacturer: 'Netafim',
    model: 'NetBeat',
    category: 'Controller',
    type: 'Monitoring',
    capacity: {
      zones: 50,
      coverage: 50000
    },
    power: {
      watts: 20,
      voltage: 120
    },
    features: [
      'Cloud-based control',
      'Weather integration',
      'Fertigation control',
      'Flow monitoring',
      'Mobile app',
      'Multi-site management'
    ],
    connectivity: ['Cellular', 'WiFi', 'Ethernet'],
    price: 2500
  },
  'galcon-8056s': {
    id: 'galcon-8056s',
    manufacturer: 'Galcon',
    model: '8056S',
    category: 'Controller',
    type: 'Monitoring',
    capacity: {
      zones: 24
    },
    power: {
      watts: 10,
      voltage: 120
    },
    physical: {
      width: 14,
      height: 10,
      depth: 4,
      weight: 5
    },
    features: [
      'Weekly programming',
      'Manual override',
      'Rain delay',
      'Battery backup',
      'Sensor inputs',
      'Expandable'
    ],
    price: 450
  },

  // Boom Irrigation Systems
  'zimmatic-linear-20ft': {
    id: 'zimmatic-linear-20ft',
    manufacturer: 'Zimmatic',
    model: 'Linear 20ft Boom',
    category: 'Boom',
    type: 'Distribution',
    capacity: {
      flowRate: 120, // GPM
      coverage: 1200 // sq ft per pass
    },
    specifications: {
      pressure: { min: 30, max: 80, unit: 'PSI' }
    },
    power: {
      watts: 2500,
      voltage: 240,
      phase: 3
    },
    physical: {
      width: 240, // 20 feet
      height: 120,
      depth: 48,
      weight: 850
    },
    features: [
      'Automated travel system',
      'Variable rate application',
      'GPS guidance ready',
      'Weather station compatible',
      'Uniform water distribution',
      'Remote monitoring'
    ],
    price: 28500
  },
  'valley-linear-40ft': {
    id: 'valley-linear-40ft',
    manufacturer: 'Valley',
    model: 'Linear 40ft Commercial Boom',
    category: 'Boom',
    type: 'Distribution',
    capacity: {
      flowRate: 240, // GPM
      coverage: 2400 // sq ft per pass
    },
    specifications: {
      pressure: { min: 35, max: 85, unit: 'PSI' }
    },
    power: {
      watts: 4200,
      voltage: 480,
      phase: 3
    },
    physical: {
      width: 480, // 40 feet
      height: 144,
      depth: 60,
      weight: 1650
    },
    features: [
      'Heavy-duty construction',
      'Precision application',
      'Variable speed drive',
      'Auto-guidance system',
      'Field mapping capability',
      'Professional grade'
    ],
    price: 48500
  },
  'reinke-circular-30ft': {
    id: 'reinke-circular-30ft',
    manufacturer: 'Reinke',
    model: 'Circular 30ft Boom System',
    category: 'Boom',
    type: 'Distribution',
    capacity: {
      flowRate: 180, // GPM
      coverage: 2827 // π * 30²
    },
    specifications: {
      pressure: { min: 30, max: 75, unit: 'PSI' }
    },
    power: {
      watts: 3500,
      voltage: 240,
      phase: 3
    },
    physical: {
      width: 360, // 30 feet radius
      height: 120,
      depth: 360,
      weight: 1200
    },
    features: [
      'Center pivot design',
      'Radial uniformity',
      'Automated control',
      'Corner watering system',
      'End gun compatibility',
      'Weather monitoring'
    ],
    price: 38500
  },

  // Spray Nozzles - Different Angles
  'rainbird-spray-0deg': {
    id: 'rainbird-spray-0deg',
    manufacturer: 'Rain Bird',
    model: '0° Stream Nozzle',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 2.5, // GPM
      coverage: 15 // linear feet reach
    },
    specifications: {
      pressure: { min: 20, max: 50, unit: 'PSI' }
    },
    physical: {
      width: 1,
      height: 2,
      depth: 1,
      weight: 0.2
    },
    features: [
      '0° straight stream',
      'Precision targeting',
      'Anti-clog design',
      'Stainless steel',
      'Color coded',
      'Easy installation'
    ],
    price: 12
  },
  'toro-spray-15deg': {
    id: 'toro-spray-15deg',
    manufacturer: 'Toro',
    model: '15° Narrow Spray',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 3.2, // GPM
      coverage: 12 // sq ft
    },
    specifications: {
      pressure: { min: 15, max: 45, unit: 'PSI' }
    },
    physical: {
      width: 1,
      height: 2,
      depth: 1,
      weight: 0.15
    },
    features: [
      '15° spray pattern',
      'Narrow coverage',
      'High uniformity',
      'Matched precipitation',
      'Pressure compensating',
      'UV resistant'
    ],
    price: 14
  },
  'hunter-spray-25deg': {
    id: 'hunter-spray-25deg',
    manufacturer: 'Hunter',
    model: '25° Quarter Circle',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 4.1, // GPM
      coverage: 25 // sq ft
    },
    specifications: {
      pressure: { min: 18, max: 50, unit: 'PSI' }
    },
    physical: {
      width: 1,
      height: 2,
      depth: 1,
      weight: 0.18
    },
    features: [
      '25° spray angle',
      'Quarter circle pattern',
      'Even distribution',
      'Professional grade',
      'Corrosion resistant',
      'Field adjustable'
    ],
    price: 16
  },
  'netafim-spray-45deg': {
    id: 'netafim-spray-45deg',
    manufacturer: 'Netafim',
    model: '45° Wide Angle Spray',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 5.8, // GPM
      coverage: 45 // sq ft
    },
    specifications: {
      pressure: { min: 20, max: 55, unit: 'PSI' }
    },
    physical: {
      width: 1,
      height: 2,
      depth: 1,
      weight: 0.2
    },
    features: [
      '45° spray pattern',
      'Wide angle coverage',
      'Excellent uniformity',
      'Self-cleaning',
      'Greenhouse compatible',
      'Precision engineered'
    ],
    price: 18
  },
  'rainbird-spray-80deg': {
    id: 'rainbird-spray-80deg',
    manufacturer: 'Rain Bird',
    model: '80° Fan Spray',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 7.2, // GPM
      coverage: 80 // sq ft
    },
    specifications: {
      pressure: { min: 25, max: 60, unit: 'PSI' }
    },
    physical: {
      width: 1,
      height: 2,
      depth: 1,
      weight: 0.22
    },
    features: [
      '80° fan pattern',
      'Wide area coverage',
      'High flow capacity',
      'Wind resistant',
      'Professional series',
      'Maintenance free'
    ],
    price: 22
  },
  'toro-spray-110deg': {
    id: 'toro-spray-110deg',
    manufacturer: 'Toro',
    model: '110° Full Circle Spray',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 9.5, // GPM
      coverage: 110 // sq ft
    },
    specifications: {
      pressure: { min: 30, max: 65, unit: 'PSI' }
    },
    physical: {
      width: 1,
      height: 2,
      depth: 1,
      weight: 0.25
    },
    features: [
      '110° wide coverage',
      'Near full circle',
      'Maximum coverage',
      'Balanced pressure',
      'Commercial grade',
      'Long service life'
    ],
    price: 26
  },

  // Overhead Irrigation Systems
  'fogco-misting-system': {
    id: 'fogco-misting-system',
    manufacturer: 'Fogco',
    model: 'High Pressure Misting',
    category: 'Overhead',
    type: 'Distribution',
    capacity: {
      flowRate: 15, // GPM
      coverage: 500 // sq ft
    },
    specifications: {
      pressure: { min: 800, max: 1200, unit: 'PSI' }
    },
    power: {
      watts: 1500,
      voltage: 240
    },
    physical: {
      width: 24,
      height: 36,
      depth: 18,
      weight: 85
    },
    features: [
      'High pressure misting',
      'Ultra-fine droplets',
      'Climate control',
      'Automated operation',
      'Stainless steel nozzles',
      'Variable flow control'
    ],
    price: 3800
  },
  'nelson-big-gun-sprinkler': {
    id: 'nelson-big-gun-sprinkler',
    manufacturer: 'Nelson',
    model: 'Big Gun Sprinkler',
    category: 'Overhead',
    type: 'Distribution',
    capacity: {
      flowRate: 45, // GPM
      coverage: 2500 // sq ft
    },
    specifications: {
      pressure: { min: 40, max: 100, unit: 'PSI' }
    },
    physical: {
      width: 12,
      height: 24,
      depth: 12,
      weight: 15
    },
    features: [
      'Large area coverage',
      'Adjustable pattern',
      'Heavy-duty construction',
      'Impact resistant',
      'Weather resistant',
      'Professional grade'
    ],
    price: 485
  },
  
  // Dramm Irrigation Equipment
  'dramm-colorstorm-pro': {
    id: 'dramm-colorstorm-pro',
    manufacturer: 'Dramm',
    model: 'ColorStorm Pro',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 10, // GPM max
      coverage: 40 // feet spray distance
    },
    specifications: {
      pressure: { min: 30, max: 100, unit: 'PSI' }
    },
    physical: {
      width: 10,
      height: 3,
      depth: 3,
      weight: 1.2
    },
    features: [
      '9 spray patterns',
      'Heavy-duty metal construction',
      'Insulated grip',
      'Lockable trigger',
      'Quick connect compatible',
      'Chemical resistant',
      'Professional grade'
    ],
    price: 45
  },
  'dramm-rain-wand-30': {
    id: 'dramm-rain-wand-30',
    manufacturer: 'Dramm',
    model: 'Rain Wand 30"',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 4, // GPM
      coverage: 16 // inch diameter spray
    },
    specifications: {
      pressure: { min: 30, max: 80, unit: 'PSI' }
    },
    physical: {
      width: 30,
      height: 2,
      depth: 2,
      weight: 0.8
    },
    features: [
      '400 water breaker head',
      'Gentle rain-like flow',
      'Aluminum tube',
      'Shut-off valve',
      'Foam grip',
      'Multiple lengths available',
      'Ideal for delicate plants'
    ],
    price: 38
  },
  'dramm-hydra-boom': {
    id: 'dramm-hydra-boom',
    manufacturer: 'Dramm',
    model: 'Hydra Boom System',
    category: 'Boom',
    type: 'Distribution',
    capacity: {
      flowRate: 300, // GPM max
      coverage: 200 // linear feet
    },
    specifications: {
      pressure: { min: 40, max: 100, unit: 'PSI' }
    },
    power: {
      watts: 3000,
      voltage: 240,
      phase: 3
    },
    physical: {
      width: 2400, // 200 feet max
      height: 120,
      depth: 48,
      weight: 1500
    },
    features: [
      'Self-propelled option',
      'Variable speed control',
      'Aluminum construction',
      'Quick-change nozzles',
      'End-of-row sensors',
      'PLC control available',
      'Professional greenhouse grade'
    ],
    price: 18500
  },
  'dramm-autofog-system': {
    id: 'dramm-autofog-system',
    manufacturer: 'Dramm',
    model: 'AutoFog System',
    category: 'Overhead',
    type: 'Distribution',
    capacity: {
      flowRate: 0.2, // GPH per nozzle
      coverage: 32 // sq ft per nozzle
    },
    specifications: {
      pressure: { min: 600, max: 1000, unit: 'PSI' }
    },
    power: {
      watts: 2200,
      voltage: 240,
      phase: 1
    },
    physical: {
      width: 36,
      height: 48,
      depth: 24,
      weight: 125
    },
    features: [
      'Ultra-fine mist 10-50 micron',
      'Stainless steel nozzles',
      'Anti-drip design',
      'Zone control',
      'VPD optimization',
      'Automated control',
      'Propagation specialist'
    ],
    price: 4850
  },
  'dramm-revolver-spray-gun': {
    id: 'dramm-revolver-spray-gun',
    manufacturer: 'Dramm',
    model: 'Revolver Spray Gun',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 12, // GPM max
      coverage: 45 // feet spray distance
    },
    specifications: {
      pressure: { min: 30, max: 120, unit: 'PSI' }
    },
    physical: {
      width: 8,
      height: 4,
      depth: 3,
      weight: 1.5
    },
    features: [
      'Rotating 9-pattern spray head',
      'Heavy-duty die-cast metal',
      'Ergonomic design',
      'Quick-connect fitting',
      'Lifetime guarantee',
      'Commercial grade',
      'Chemical resistant'
    ],
    price: 65
  },
  'dramm-water-breaker-170': {
    id: 'dramm-water-breaker-170',
    manufacturer: 'Dramm',
    model: '170 Water Breaker',
    category: 'Spray',
    type: 'Distribution',
    capacity: {
      flowRate: 8, // GPM
      coverage: 8 // inch diameter
    },
    specifications: {
      pressure: { min: 20, max: 60, unit: 'PSI' }
    },
    physical: {
      width: 4,
      height: 4,
      depth: 2,
      weight: 0.3
    },
    features: [
      '170 hole design',
      'Gentle water flow',
      'Brass construction',
      'Standard hose thread',
      'Ideal for seedlings',
      'Professional quality'
    ],
    price: 18
  },

  // Valves & Controls
  'netafim-pressure-regulator': {
    id: 'netafim-pressure-regulator',
    manufacturer: 'Netafim',
    model: 'Pressure Regulator 30 PSI',
    category: 'Valves',
    type: 'Control',
    capacity: {
      flowRate: 150 // GPM max
    },
    specifications: {
      pressure: { min: 35, max: 100, unit: 'PSI' },
      accuracy: 5
    },
    physical: {
      width: 3,
      height: 4,
      depth: 3,
      weight: 1.2
    },
    features: [
      'Pressure compensating',
      'Self-cleaning design',
      'Corrosion resistant',
      'Field adjustable',
      'Low pressure drop',
      'Weather resistant'
    ],
    price: 45
  },
  'mazzei-venturi-injector': {
    id: 'mazzei-venturi-injector',
    manufacturer: 'Mazzei',
    model: 'Venturi Injector 284',
    category: 'Valves',
    type: 'Control',
    capacity: {
      flowRate: 50 // GPM
    },
    specifications: {
      pressure: { min: 15, max: 100, unit: 'PSI' },
      accuracy: 2
    },
    physical: {
      width: 2,
      height: 8,
      depth: 2,
      weight: 2.5
    },
    features: [
      'No moving parts',
      'Proportional injection',
      'Chemical resistant',
      'Easy installation',
      'Self-priming',
      'Maintenance free'
    ],
    price: 125
  },
  'rain-bird-solenoid-valve': {
    id: 'rain-bird-solenoid-valve',
    manufacturer: 'Rain Bird',
    model: '100-DVF Solenoid Valve',
    category: 'Valves',
    type: 'Control',
    capacity: {
      flowRate: 35 // GPM
    },
    specifications: {
      pressure: { min: 15, max: 150, unit: 'PSI' }
    },
    power: {
      watts: 7,
      voltage: 24
    },
    physical: {
      width: 4,
      height: 6,
      depth: 4,
      weight: 3.2
    },
    features: [
      'Flow control mechanism',
      'Manual bleed feature',
      'Stainless steel spring',
      'Weather resistant',
      'Easy wire connection',
      'Professional grade'
    ],
    price: 89
  },
  'bermad-air-relief-valve': {
    id: 'bermad-air-relief-valve',
    manufacturer: 'Bermad',
    model: 'C30 Air Relief Valve',
    category: 'Valves',
    type: 'Safety',
    capacity: {
      flowRate: 200 // GPM
    },
    specifications: {
      pressure: { min: 0, max: 250, unit: 'PSI' }
    },
    physical: {
      width: 3,
      height: 5,
      depth: 3,
      weight: 2.8
    },
    features: [
      'Automatic air release',
      'Vacuum prevention',
      'Corrosion resistant',
      'Field serviceable',
      'Large orifice design',
      'Professional grade'
    ],
    price: 165
  },

  // Filtration Systems
  'netafim-super-typhoon': {
    id: 'netafim-super-typhoon',
    manufacturer: 'Netafim',
    model: 'Super Typhoon Sand Filter',
    category: 'Filtration',
    type: 'Treatment',
    capacity: {
      flowRate: 180 // GPM
    },
    specifications: {
      pressure: { min: 30, max: 87, unit: 'PSI' }
    },
    physical: {
      width: 30,
      height: 60,
      depth: 30,
      weight: 450
    },
    features: [
      'Automatic backwash',
      'High filtration capacity',
      'Self-cleaning',
      'Pressure differential gauge',
      'Corrosion resistant tank',
      'Professional grade'
    ],
    price: 3200,
    consumables: [{
      type: 'Filter media',
      lifespan: '3-5 years',
      cost: 150
    }]
  },
  'arkal-disc-filter': {
    id: 'arkal-disc-filter',
    manufacturer: 'Arkal',
    model: 'Spin Klin Disc Filter',
    category: 'Filtration',
    type: 'Treatment',
    capacity: {
      flowRate: 120 // GPM
    },
    specifications: {
      pressure: { min: 25, max: 150, unit: 'PSI' }
    },
    physical: {
      width: 18,
      height: 36,
      depth: 18,
      weight: 85
    },
    features: [
      'Self-cleaning discs',
      'High flow capacity',
      'Compact design',
      'Low maintenance',
      'Easy installation',
      'Long service life'
    ],
    price: 1850,
    consumables: [{
      type: 'Filter discs',
      lifespan: '2-3 years',
      cost: 120
    }]
  },
  'amiad-screen-filter': {
    id: 'amiad-screen-filter',
    manufacturer: 'Amiad',
    model: 'Stainless Steel Screen Filter',
    category: 'Filtration',
    type: 'Treatment',
    capacity: {
      flowRate: 250 // GPM
    },
    specifications: {
      pressure: { min: 20, max: 150, unit: 'PSI' }
    },
    physical: {
      width: 12,
      height: 24,
      depth: 12,
      weight: 45
    },
    features: [
      'Stainless steel screen',
      'High flow capacity',
      'Manual cleaning',
      'Corrosion resistant',
      'Easy maintenance',
      'Cost effective'
    ],
    price: 385,
    consumables: [{
      type: 'Screen element',
      lifespan: '1-2 years',
      cost: 85
    }]
  },

  // Flow & Monitoring Equipment
  'seametrics-flow-meter': {
    id: 'seametrics-flow-meter',
    manufacturer: 'Seametrics',
    model: 'AG2000 Flow Meter',
    category: 'Monitoring',
    type: 'Monitoring',
    capacity: {
      flowRate: 500 // GPM max
    },
    specifications: {
      pressure: { min: 0, max: 200, unit: 'PSI' },
      accuracy: 1
    },
    power: {
      watts: 12,
      voltage: 12
    },
    physical: {
      width: 8,
      height: 12,
      depth: 6,
      weight: 15
    },
    features: [
      'Digital display',
      'Totalizing function',
      'Data logging',
      'Remote monitoring',
      'Battery powered',
      'Weather resistant'
    ],
    connectivity: ['4-20mA', 'Pulse', 'Modbus'],
    price: 850
  },
  'ashcroft-pressure-gauge': {
    id: 'ashcroft-pressure-gauge',
    manufacturer: 'Ashcroft',
    model: 'Commercial Pressure Gauge',
    category: 'Monitoring',
    type: 'Monitoring',
    specifications: {
      pressure: { min: 0, max: 200, unit: 'PSI' },
      accuracy: 2
    },
    physical: {
      width: 4,
      height: 4,
      depth: 2,
      weight: 1.5
    },
    features: [
      'Glycerin filled',
      'Stainless steel case',
      'Easy to read dial',
      'Corrosion resistant',
      'Temperature compensated',
      'Professional grade'
    ],
    price: 65
  },
  'hunter-flow-sensor': {
    id: 'hunter-flow-sensor',
    manufacturer: 'Hunter',
    model: 'FS-100 Flow Sensor',
    category: 'Monitoring',
    type: 'Monitoring',
    capacity: {
      flowRate: 100 // GPM max
    },
    specifications: {
      pressure: { min: 15, max: 100, unit: 'PSI' },
      accuracy: 5
    },
    power: {
      watts: 0.5,
      voltage: 24
    },
    physical: {
      width: 3,
      height: 6,
      depth: 3,
      weight: 2.2
    },
    features: [
      'Low flow detection',
      'High flow alarm',
      'Leak detection',
      'Controller compatible',
      'Easy installation',
      'Weather resistant'
    ],
    connectivity: ['2-wire'],
    price: 185
  },

  // Safety Equipment
  'watts-backflow-preventer': {
    id: 'watts-backflow-preventer',
    manufacturer: 'Watts',
    model: '909 Backflow Preventer',
    category: 'Safety',
    type: 'Safety',
    capacity: {
      flowRate: 150 // GPM
    },
    specifications: {
      pressure: { min: 15, max: 175, unit: 'PSI' }
    },
    physical: {
      width: 12,
      height: 18,
      depth: 8,
      weight: 35
    },
    features: [
      'Reduced pressure zone',
      'Code compliant',
      'Test cocks included',
      'Bronze construction',
      'Field testable',
      'Professional grade'
    ],
    price: 485
  },
  'febco-pressure-vacuum-breaker': {
    id: 'febco-pressure-vacuum-breaker',
    manufacturer: 'Febco',
    model: '765 Pressure Vacuum Breaker',
    category: 'Safety',
    type: 'Safety',
    capacity: {
      flowRate: 80 // GPM
    },
    specifications: {
      pressure: { min: 15, max: 150, unit: 'PSI' }
    },
    physical: {
      width: 6,
      height: 12,
      depth: 6,
      weight: 12
    },
    features: [
      'Vacuum breaker protection',
      'Easy installation',
      'Code approved',
      'Bronze body',
      'Field serviceable',
      'Cost effective'
    ],
    price: 125
  },

  // Water Treatment
  'hydrologic-evolution-1000': {
    id: 'hydrologic-evolution-1000',
    manufacturer: 'HydroLogic',
    model: 'Evolution RO1000',
    category: 'WaterTreatment',
    type: 'Treatment',
    capacity: {
      flowRate: 1000 // GPD
    },
    specifications: {
      pressure: { min: 40, max: 100, unit: 'PSI' }
    },
    physical: {
      width: 24,
      height: 48,
      depth: 12,
      weight: 65
    },
    features: [
      '2:1 waste ratio',
      'KDF85 pre-filter',
      'Membrane flush kit',
      'Pressure gauge',
      'TDS meter included',
      'Wall mountable'
    ],
    price: 850,
    consumables: [
      {
        type: 'Sediment filter',
        lifespan: '6 months',
        cost: 25
      },
      {
        type: 'Carbon filter',
        lifespan: '6 months',
        cost: 35
      },
      {
        type: 'RO membrane',
        lifespan: '2-3 years',
        cost: 150
      }
    ]
  },
  'ideal-h2o-premium': {
    id: 'ideal-h2o-premium',
    manufacturer: 'Ideal H2O',
    model: 'Premium 2000',
    category: 'WaterTreatment',
    type: 'Treatment',
    capacity: {
      flowRate: 2000
    },
    specifications: {
      pressure: { min: 45, max: 90, unit: 'PSI' }
    },
    physical: {
      width: 30,
      height: 60,
      depth: 16,
      weight: 95
    },
    features: [
      'Coconut carbon filter',
      'Catalytic carbon',
      'De-ionization stage',
      '1:1 waste ratio',
      'Automatic shutoff',
      'Premium fittings'
    ],
    price: 1450,
    consumables: [
      {
        type: 'Pre-filter set',
        lifespan: '6 months',
        cost: 65
      },
      {
        type: 'RO membrane',
        lifespan: '2 years',
        cost: 200
      }
    ]
  }
};

// Helper functions for irrigation calculations
export function calculateWaterRequirement(
  plantCount: number,
  plantStage: 'seedling' | 'vegetative' | 'flowering',
  growthMedium: 'soil' | 'coco' | 'rockwool' | 'hydro',
  environmentTemp: number = 78
): {
  dailyWaterPerPlant: number; // gallons
  totalDailyWater: number;
  irrigationFrequency: string;
  runoffPercentage: number;
} {
  // Base water requirements (gallons per day)
  const baseWater = {
    seedling: { soil: 0.1, coco: 0.15, rockwool: 0.2, hydro: 0.25 },
    vegetative: { soil: 0.5, coco: 0.75, rockwool: 1.0, hydro: 1.5 },
    flowering: { soil: 1.0, coco: 1.5, rockwool: 2.0, hydro: 2.5 }
  };

  // Temperature adjustment factor
  const tempFactor = environmentTemp > 80 ? 1.2 : 1.0;
  
  const dailyWaterPerPlant = baseWater[plantStage][growthMedium] * tempFactor;
  const runoffPercentage = growthMedium === 'hydro' ? 0 : growthMedium === 'coco' ? 20 : 10;
  
  // Irrigation frequency recommendations
  const frequencies = {
    soil: { seedling: 'Every 2-3 days', vegetative: 'Daily', flowering: 'Daily' },
    coco: { seedling: '2x daily', vegetative: '3-4x daily', flowering: '4-6x daily' },
    rockwool: { seedling: '2x daily', vegetative: '4x daily', flowering: '6x daily' },
    hydro: { seedling: 'Continuous', vegetative: 'Continuous', flowering: 'Continuous' }
  };

  return {
    dailyWaterPerPlant,
    totalDailyWater: dailyWaterPerPlant * plantCount * (1 + runoffPercentage / 100),
    irrigationFrequency: frequencies[growthMedium][plantStage],
    runoffPercentage
  };
}

export function calculateDosingRequirements(
  waterVolume: number, // gallons per day
  targetEC: number = 1.5,
  stockSolutionRatio: number = 100 // 100:1 concentrated
): {
  nutrientADaily: number; // ml
  nutrientBDaily: number; // ml
  phAdjustDaily: number; // ml estimate
  monthlyNutrientCost: number;
} {
  // Rough calculations for 2-part nutrients
  const nutrientConcentration = targetEC * 700; // PPM estimate
  const stockSolutionNeeded = (waterVolume * 3.785 * nutrientConcentration) / (stockSolutionRatio * 1000);
  
  return {
    nutrientADaily: stockSolutionNeeded * 500, // ml
    nutrientBDaily: stockSolutionNeeded * 500, // ml
    phAdjustDaily: waterVolume * 2, // ml rough estimate
    monthlyNutrientCost: stockSolutionNeeded * 30 * 20 // $20/L estimate
  };
}

export function recommendIrrigationSystem(
  roomWidth: number,
  roomLength: number,
  plantCount: number,
  growthMedium: 'soil' | 'coco' | 'rockwool' | 'hydro' = 'coco',
  automationLevel: 'basic' | 'advanced' = 'advanced'
): {
  distribution: IrrigationSystem;
  controller?: IrrigationSystem;
  dosing?: IrrigationSystem;
  waterTreatment?: IrrigationSystem;
  totalCost: number;
  notes: string[];
} {
  const area = roomWidth * roomLength;
  const recommendations: any = {};
  const notes: string[] = [];
  let totalCost = 0;

  // Distribution system based on medium
  if (growthMedium === 'hydro') {
    if (plantCount <= 50) {
      recommendations.distribution = irrigationDatabase['current-culture-uc-solo'];
      notes.push('DWC recommended for small hydro operations');
    } else {
      recommendations.distribution = irrigationDatabase['cropking-nft-4-6'];
      notes.push('NFT system for larger hydro operations');
    }
  } else {
    recommendations.distribution = irrigationDatabase['netafim-netbow'];
    notes.push('Drip irrigation recommended for coco/soil');
    totalCost += plantCount * 0.45; // dripper cost
  }

  // Controller for automation
  if (automationLevel === 'advanced') {
    if (area > 5000) {
      recommendations.controller = irrigationDatabase['netafim-netbeat'];
      notes.push('Cloud-based control for large operations');
    } else {
      recommendations.controller = irrigationDatabase['galcon-8056s'];
      notes.push('Zone controller for smaller facilities');
    }
    totalCost += recommendations.controller.price;
  }

  // Dosing system
  if (plantCount > 100 || automationLevel === 'advanced') {
    if (plantCount > 500) {
      recommendations.dosing = irrigationDatabase['dosatron-d14mz2'];
      notes.push('Proportional dosing for consistent EC');
    } else {
      recommendations.dosing = irrigationDatabase['bluelab-dosetronic'];
      notes.push('Precision dosing with pH/EC control');
    }
    totalCost += recommendations.dosing.price;
  }

  // Water treatment
  const dailyWater = calculateWaterRequirement(plantCount, 'flowering', growthMedium).totalDailyWater;
  if (dailyWater > 100) {
    recommendations.waterTreatment = dailyWater > 200 
      ? irrigationDatabase['ideal-h2o-premium']
      : irrigationDatabase['hydrologic-evolution-1000'];
    notes.push('RO system recommended for consistent water quality');
    totalCost += recommendations.waterTreatment.price;
  }

  return {
    ...recommendations,
    totalCost,
    notes
  };
}