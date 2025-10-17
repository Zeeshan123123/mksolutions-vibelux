// Environmental controller database for controlled environment agriculture
// Includes climate controllers, sensor systems, and automation platforms

export interface EnvironmentalController {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Climate' | 'Fertigation' | 'Lighting' | 'Integrated' | 'Sensor' | 'Software';
  type: 'Standalone' | 'Networked' | 'Cloud' | 'Hybrid';
  capabilities: {
    zones?: number;
    sensors?: number;
    outputs?: number;
    recipes?: number;
    dataLogging?: boolean;
    remoteAccess?: boolean;
  };
  control: {
    temperature?: boolean;
    humidity?: boolean;
    co2?: boolean;
    lighting?: boolean;
    irrigation?: boolean;
    vpd?: boolean;
    ph?: boolean;
    ec?: boolean;
  };
  connectivity: string[];
  compatibility: string[];
  physical: {
    width: number; // inches
    height: number;
    depth: number;
    weight: number; // lbs
    mounting: 'Wall' | 'DIN Rail' | 'Rack' | 'Desktop';
  };
  power: {
    voltage: number;
    watts?: number;
    backup?: boolean;
  };
  features: string[];
  price?: number;
  subscription?: {
    required: boolean;
    monthly?: number;
    features: string[];
  };
}

export const controllerCategories = {
  Climate: {
    name: 'Climate Controllers',
    description: 'Temperature, humidity, and VPD control',
    icon: 'thermometer',
    pros: ['Precise environmental control', 'Energy savings', 'Crop consistency'],
    cons: ['Initial setup complexity', 'Sensor calibration needed']
  },
  Fertigation: {
    name: 'Fertigation Controllers',
    description: 'Nutrient and irrigation automation',
    icon: 'droplet',
    pros: ['Precise nutrient delivery', 'Water savings', 'pH/EC control'],
    cons: ['Requires monitoring', 'Pump maintenance']
  },
  Lighting: {
    name: 'Lighting Controllers',
    description: 'Photoperiod and intensity control',
    icon: 'sun',
    pros: ['Energy optimization', 'Spectrum control', 'Sunrise/sunset simulation'],
    cons: ['Fixture compatibility', 'Dimming limitations']
  },
  Integrated: {
    name: 'Integrated Systems',
    description: 'All-in-one facility control',
    icon: 'cpu',
    pros: ['Complete automation', 'Single interface', 'Data integration'],
    cons: ['Higher cost', 'Vendor lock-in']
  },
  Sensor: {
    name: 'Sensor Systems',
    description: 'Environmental monitoring',
    icon: 'activity',
    pros: ['Real-time data', 'Alerts', 'Historical tracking'],
    cons: ['Sensor maintenance', 'Calibration drift']
  },
  Software: {
    name: 'Software Platforms',
    description: 'Cloud-based control systems',
    icon: 'cloud',
    pros: ['Remote access', 'Analytics', 'Multi-site management'],
    cons: ['Internet dependency', 'Subscription costs']
  }
};

export const environmentalControllerDatabase: Record<string, EnvironmentalController> = {
  // Integrated Controllers
  'argus-titan': {
    id: 'argus-titan',
    manufacturer: 'Argus',
    model: 'TITAN',
    category: 'Integrated',
    type: 'Networked',
    capabilities: {
      zones: 64,
      sensors: 256,
      outputs: 128,
      recipes: 100,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['Ethernet', 'RS485', 'Modbus', 'BACnet'],
    compatibility: ['Most HVAC', 'Most lighting', 'Most sensors'],
    physical: {
      width: 19,
      height: 7,
      depth: 12,
      weight: 15,
      mounting: 'Rack'
    },
    power: {
      voltage: 120,
      watts: 50,
      backup: true
    },
    features: [
      'Multi-zone control',
      'Recipe management',
      'Alarm system',
      'Data analytics',
      'Mobile app',
      'Cloud backup',
      'Weather integration',
      'Energy monitoring'
    ],
    price: 15000,
    subscription: {
      required: false,
      monthly: 99,
      features: ['Cloud storage', 'Remote support', 'Advanced analytics']
    }
  },
  'priva-compact-cc': {
    id: 'priva-compact-cc',
    manufacturer: 'Priva',
    model: 'Compact CC',
    category: 'Integrated',
    type: 'Hybrid',
    capabilities: {
      zones: 8,
      sensors: 32,
      outputs: 24,
      recipes: 50,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true
    },
    connectivity: ['Ethernet', 'WiFi', 'Modbus'],
    compatibility: ['Priva sensors', 'Standard 0-10V'],
    physical: {
      width: 12,
      height: 10,
      depth: 4,
      weight: 8,
      mounting: 'Wall'
    },
    power: {
      voltage: 240,
      watts: 30,
      backup: false
    },
    features: [
      'Touchscreen interface',
      'Graphical programming',
      'Energy optimization',
      'Crop registration',
      'Weather compensation',
      'Mobile access'
    ],
    price: 8500
  },
  'priva-connext': {
    id: 'priva-connext',
    manufacturer: 'Priva',
    model: 'Connext',
    category: 'Integrated',
    type: 'Cloud',
    capabilities: {
      zones: 64,
      sensors: 256,
      outputs: 128,
      recipes: 200,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['Ethernet', 'WiFi', 'Cellular', 'BACnet', 'Modbus'],
    compatibility: ['Priva ecosystem', 'Third-party systems', 'Building APIs'],
    physical: {
      width: 19,
      height: 7,
      depth: 12,
      weight: 18,
      mounting: 'Rack'
    },
    power: {
      voltage: 240,
      watts: 65,
      backup: true
    },
    features: [
      'Cloud-based platform',
      'Multi-site management',
      'Advanced analytics',
      'Energy optimization',
      'Crop steering',
      'Weather integration',
      'Mobile app',
      'API access',
      'Dutch engineering'
    ],
    price: 18500,
    subscription: {
      required: true,
      monthly: 299,
      features: ['Cloud platform', 'Digital services', 'Support']
    }
  },
  'priva-digital-services': {
    id: 'priva-digital-services',
    manufacturer: 'Priva',
    model: 'Digital Services Platform',
    category: 'Software',
    type: 'Cloud',
    capabilities: {
      zones: 999,
      sensors: 999,
      outputs: 999,
      recipes: 500,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['HTTPS API', 'REST API', 'OAuth 2.0', 'OpenID Connect'],
    compatibility: ['Building Connectivity API', 'Third-party software', 'JSON payload'],
    physical: {
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      mounting: 'Desktop'
    },
    power: {
      voltage: 0
    },
    features: [
      'Building Connectivity API',
      'Realtime Data API',
      'Historical Data API',
      'JSON Web Token auth',
      'OAuth 2.0 security',
      'Setpoint modifications',
      'Access Control App',
      'Self-service management',
      'Third-party integrations',
      'Live system data access'
    ],
    price: 0,
    subscription: {
      required: true,
      monthly: 199,
      features: ['API portal access', 'Digital services', 'Real-time data', 'Historical data']
    }
  },
  'priva-atlas': {
    id: 'priva-atlas',
    manufacturer: 'Priva',
    model: 'Atlas Process Computer',
    category: 'Integrated',
    type: 'Standalone',
    capabilities: {
      zones: 32,
      sensors: 128,
      outputs: 96,
      recipes: 100,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['Ethernet', 'Modbus', 'BACnet', 'OPC'],
    compatibility: ['Priva sensors', 'Industry protocols'],
    physical: {
      width: 16,
      height: 12,
      depth: 8,
      weight: 15,
      mounting: 'Wall'
    },
    power: {
      voltage: 240,
      watts: 45,
      backup: true
    },
    features: [
      'Process computer',
      'Graphical interface',
      'Climate algorithms',
      'Energy screens control',
      'Water management',
      'Labor registration',
      'Process optimization',
      'Professional grade'
    ],
    price: 22000
  },
  'growtronix': {
    id: 'growtronix',
    manufacturer: 'GrowTronix',
    model: 'Automation System',
    category: 'Integrated',
    type: 'Cloud',
    capabilities: {
      zones: 16,
      sensors: 64,
      outputs: 48,
      recipes: 20,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['Ethernet', 'WiFi', 'Cellular'],
    compatibility: ['Universal sensors', 'Most equipment'],
    physical: {
      width: 16,
      height: 12,
      depth: 6,
      weight: 12,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 40,
      backup: true
    },
    features: [
      'Web-based interface',
      'Custom dashboards',
      'Multi-site management',
      'Video integration',
      'Historical graphing',
      'Email/SMS alerts',
      'API access'
    ],
    price: 5500,
    subscription: {
      required: true,
      monthly: 49,
      features: ['Cloud hosting', 'Data storage', 'Remote access']
    }
  },

  // Climate Controllers
  'trolmaster-hydro-x-pro': {
    id: 'trolmaster-hydro-x-pro',
    manufacturer: 'TrolMaster',
    model: 'Hydro-X Pro',
    category: 'Climate',
    type: 'Standalone',
    capabilities: {
      zones: 2,
      sensors: 16,
      outputs: 16,
      recipes: 10,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      vpd: true
    },
    connectivity: ['WiFi', 'Ethernet', 'RS485'],
    compatibility: ['TrolMaster modules', 'Most HVAC'],
    physical: {
      width: 9,
      height: 6,
      depth: 2,
      weight: 3,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 15,
      backup: false
    },
    features: [
      'Touchscreen display',
      'Mobile app control',
      'Multiple room support',
      'Customizable alerts',
      'Schedule programming',
      'VPD optimization',
      'Expandable modules'
    ],
    price: 1200
  },
  'autopilot-master': {
    id: 'autopilot-master',
    manufacturer: 'AutoPilot',
    model: 'Master Controller',
    category: 'Climate',
    type: 'Standalone',
    capabilities: {
      zones: 1,
      sensors: 8,
      outputs: 8,
      recipes: 5,
      dataLogging: true,
      remoteAccess: false
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true
    },
    connectivity: ['RS485'],
    compatibility: ['AutoPilot devices', 'Standard relays'],
    physical: {
      width: 10,
      height: 8,
      depth: 4,
      weight: 5,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 20
    },
    features: [
      'LCD display',
      'Push-button interface',
      'Day/night settings',
      'High temp shutdown',
      'CO2 fuzzy logic',
      'Plug-and-play setup'
    ],
    price: 800
  },

  // Fertigation Controllers
  'intellidose': {
    id: 'intellidose',
    manufacturer: 'Autogrow',
    model: 'IntelliDose',
    category: 'Fertigation',
    type: 'Cloud',
    capabilities: {
      zones: 4,
      sensors: 8,
      outputs: 12,
      recipes: 20,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      irrigation: true,
      ph: true,
      ec: true
    },
    connectivity: ['WiFi', 'Ethernet', 'Cellular'],
    compatibility: ['Most dosing pumps', 'Standard sensors'],
    physical: {
      width: 14,
      height: 10,
      depth: 4,
      weight: 7,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 25
    },
    features: [
      'Cloud-based control',
      'Nutrient recipes',
      'Dosing algorithms',
      'Tank level monitoring',
      'Flow monitoring',
      'Alarm notifications',
      'Multi-site support'
    ],
    price: 3500,
    subscription: {
      required: true,
      monthly: 39,
      features: ['Cloud platform', 'Data analytics', 'Support']
    }
  },
  'bluelab-pro-controller': {
    id: 'bluelab-pro-controller',
    manufacturer: 'Bluelab',
    model: 'Pro Controller',
    category: 'Fertigation',
    type: 'Standalone',
    capabilities: {
      zones: 1,
      sensors: 3,
      outputs: 4,
      dataLogging: false,
      remoteAccess: false
    },
    control: {
      ph: true,
      ec: true,
      temperature: true
    },
    connectivity: [],
    compatibility: ['Bluelab probes'],
    physical: {
      width: 9,
      height: 6,
      depth: 3,
      weight: 2,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 10
    },
    features: [
      'Continuous monitoring',
      'Set point control',
      'Dosing lockouts',
      'High/low alarms',
      'Probe calibration reminders',
      'Simple interface'
    ],
    price: 650
  },

  // Lighting Controllers
  'gavita-epl': {
    id: 'gavita-epl',
    manufacturer: 'Gavita',
    model: 'E-Series Controller',
    category: 'Lighting',
    type: 'Standalone',
    capabilities: {
      zones: 2,
      outputs: 80,
      dataLogging: true,
      remoteAccess: false
    },
    control: {
      lighting: true,
      temperature: true
    },
    connectivity: ['RS485'],
    compatibility: ['Gavita fixtures', 'EL1/EL2 fixtures'],
    physical: {
      width: 8,
      height: 6,
      depth: 3,
      weight: 2,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 5
    },
    features: [
      'Sunrise/sunset simulation',
      '0-100% dimming',
      'Temperature dimming',
      'Auto-shutdown',
      'External contact control',
      'Status LEDs'
    ],
    price: 450
  },

  // Sensor Systems
  'pulse-pro': {
    id: 'pulse-pro',
    manufacturer: 'Pulse',
    model: 'Pulse Pro',
    category: 'Sensor',
    type: 'Cloud',
    capabilities: {
      sensors: 1,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: false,
      humidity: false,
      co2: false,
      vpd: false,
      lighting: false
    },
    connectivity: ['WiFi', 'Bluetooth'],
    compatibility: ['Monitoring only'],
    physical: {
      width: 3,
      height: 4,
      depth: 2,
      weight: 0.5,
      mounting: 'Desktop'
    },
    power: {
      voltage: 5,
      watts: 2
    },
    features: [
      'Environmental monitoring',
      'Light spectrum analysis',
      'VPD calculations',
      'Historical graphs',
      'Threshold alerts',
      'Mobile app',
      'Multi-device support'
    ],
    price: 350,
    subscription: {
      required: false,
      monthly: 5,
      features: ['Extended history', 'Advanced analytics']
    }
  },
  'sensaphone-sentinel-pro': {
    id: 'sensaphone-sentinel-pro',
    manufacturer: 'Sensaphone',
    model: 'Sentinel PRO',
    category: 'Sensor',
    type: 'Cloud',
    capabilities: {
      sensors: 16,
      outputs: 8,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: false,
      humidity: false
    },
    connectivity: ['Ethernet', 'Cellular', 'WiFi'],
    compatibility: ['Universal sensors', 'Dry contacts'],
    physical: {
      width: 11,
      height: 7,
      depth: 3,
      weight: 4,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 15,
      backup: true
    },
    features: [
      'Cloud monitoring',
      'Unlimited users',
      'Voice/SMS/email alerts',
      'Power failure detection',
      'Battery backup',
      'FCC Part 15 compliant',
      'NEMA 4X enclosure option'
    ],
    price: 1200
  },

  // Software Platforms
  'aroya': {
    id: 'aroya',
    manufacturer: 'Aroya',
    model: 'Platform',
    category: 'Software',
    type: 'Cloud',
    capabilities: {
      zones: 999,
      sensors: 999,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: false,
      humidity: false,
      irrigation: false,
      vpd: false,
      ph: false,
      ec: false
    },
    connectivity: ['API', 'WiFi', 'Cellular'],
    compatibility: ['TEROS sensors', 'Various controllers'],
    physical: {
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      mounting: 'Desktop'
    },
    power: {
      voltage: 0
    },
    features: [
      'Crop steering',
      'Harvest predictions',
      'Task management',
      'Compliance tracking',
      'Analytics dashboard',
      'Mobile app',
      'API integrations',
      'Expert support'
    ],
    price: 0,
    subscription: {
      required: true,
      monthly: 500,
      features: ['Full platform access', 'Support', 'Training']
    }
  },
  'growlink': {
    id: 'growlink',
    manufacturer: 'GrowLink',
    model: 'Platform',
    category: 'Software',
    type: 'Cloud',
    capabilities: {
      zones: 100,
      sensors: 500,
      outputs: 200,
      recipes: 50,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['WiFi', 'Ethernet', 'Cellular', 'LoRa'],
    compatibility: ['GrowLink hardware', 'Third-party devices'],
    physical: {
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      mounting: 'Desktop'
    },
    power: {
      voltage: 0
    },
    features: [
      'Modular hardware',
      'Wireless sensors',
      'Custom rules engine',
      'Multi-facility',
      'Inventory tracking',
      'Compliance reports',
      'Weather integration',
      'Energy monitoring'
    ],
    price: 500,
    subscription: {
      required: true,
      monthly: 99,
      features: ['Cloud platform', 'Updates', 'Support']
    }
  },
  
  // MicroGrow Systems
  'microgrow-leafy': {
    id: 'microgrow-leafy',
    manufacturer: 'MicroGrow',
    model: 'Leafy',
    category: 'Integrated',
    type: 'Cloud',
    capabilities: {
      zones: 32,
      sensors: 128,
      outputs: 96,
      recipes: 100,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['WiFi', 'Ethernet', 'Cellular', 'Zigbee'],
    compatibility: ['Universal sensors', 'Modbus devices', 'BACnet'],
    physical: {
      width: 16,
      height: 12,
      depth: 6,
      weight: 15,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 45,
      backup: true
    },
    features: [
      'AI-powered optimization',
      'Predictive analytics',
      'Energy management',
      'Multi-site control',
      'Mobile app',
      'Voice control',
      'Weather integration',
      'Custom dashboards',
      'API access',
      'Machine learning'
    ],
    price: 12000,
    subscription: {
      required: true,
      monthly: 199,
      features: ['Cloud platform', 'AI updates', 'Premium support']
    }
  },
  'microgrow-master-controller': {
    id: 'microgrow-master-controller',
    manufacturer: 'MicroGrow',
    model: 'Master Controller Pro',
    category: 'Integrated',
    type: 'Standalone',
    capabilities: {
      zones: 16,
      sensors: 64,
      outputs: 48,
      recipes: 50,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['Ethernet', 'WiFi', 'RS485', 'Modbus'],
    compatibility: ['MicroGrow sensors', 'Third-party equipment'],
    physical: {
      width: 12,
      height: 8,
      depth: 4,
      weight: 8,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 25,
      backup: true
    },
    features: [
      'Touchscreen interface',
      'Recipe management',
      'Alarm system',
      'Data export',
      'Multi-room control',
      'Weather station ready',
      'Expandable I/O',
      'Local data storage'
    ],
    price: 6500
  },
  'microgrow-climate-station': {
    id: 'microgrow-climate-station',
    manufacturer: 'MicroGrow',
    model: 'Climate Station',
    category: 'Climate',
    type: 'Standalone',
    capabilities: {
      zones: 4,
      sensors: 16,
      outputs: 12,
      recipes: 20,
      dataLogging: true,
      remoteAccess: false
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      vpd: true
    },
    connectivity: ['RS485', 'Modbus'],
    compatibility: ['Standard HVAC', 'MicroGrow ecosystem'],
    physical: {
      width: 8,
      height: 6,
      depth: 3,
      weight: 4,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 15
    },
    features: [
      'LCD display',
      'Simple programming',
      'Manual overrides',
      'Sensor calibration',
      'Set point control',
      'Differential control',
      'Time scheduling',
      'Expandable modules'
    ],
    price: 2500
  },
  'microgrow-fertigation-controller': {
    id: 'microgrow-fertigation-controller',
    manufacturer: 'MicroGrow',
    model: 'Fertigation Controller',
    category: 'Fertigation',
    type: 'Standalone',
    capabilities: {
      zones: 8,
      sensors: 12,
      outputs: 16,
      recipes: 30,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      irrigation: true,
      ph: true,
      ec: true,
      temperature: true
    },
    connectivity: ['WiFi', 'Ethernet', 'Modbus'],
    compatibility: ['Most dosing pumps', 'Standard sensors'],
    physical: {
      width: 10,
      height: 8,
      depth: 4,
      weight: 6,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 20
    },
    features: [
      'Multi-zone irrigation',
      'pH/EC monitoring',
      'Dosing pump control',
      'Flow monitoring',
      'Nutrient recipes',
      'Irrigation scheduling',
      'Tank level monitoring',
      'Mobile app support'
    ],
    price: 3500
  },
  'microgrow-sensor-hub': {
    id: 'microgrow-sensor-hub',
    manufacturer: 'MicroGrow',
    model: 'Wireless Sensor Hub',
    category: 'Sensor',
    type: 'Networked',
    capabilities: {
      sensors: 32,
      dataLogging: true,
      remoteAccess: true
    },
    control: {},
    connectivity: ['WiFi', 'Zigbee', 'LoRa'],
    compatibility: ['MicroGrow sensors', 'Universal protocols'],
    physical: {
      width: 6,
      height: 4,
      depth: 2,
      weight: 1.5,
      mounting: 'Wall'
    },
    power: {
      voltage: 12,
      watts: 5
    },
    features: [
      'Wireless mesh network',
      'Battery backup',
      'Long range communication',
      'Self-healing network',
      'Low power consumption',
      'Weather resistant',
      'Easy installation',
      'Scalable system'
    ],
    price: 850
  },
  
  // Ridder Systems
  'ridder-synopta': {
    id: 'ridder-synopta',
    manufacturer: 'Ridder',
    model: 'Synopta',
    category: 'Integrated',
    type: 'Hybrid',
    capabilities: {
      zones: 48,
      sensors: 200,
      outputs: 160,
      recipes: 200,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['Ethernet', 'WiFi', 'Modbus', 'BACnet', 'OPC'],
    compatibility: ['Ridder sensors', 'Industry standard protocols'],
    physical: {
      width: 19,
      height: 8,
      depth: 14,
      weight: 20,
      mounting: 'Rack'
    },
    power: {
      voltage: 240,
      watts: 60,
      backup: true
    },
    features: [
      'Process computer',
      'Graphical interface',
      'Climate optimization',
      'Energy curtain control',
      'Water management',
      'Labor registration',
      'Crop registration',
      'Remote support',
      'Multi-language support',
      'Dutch engineering'
    ],
    price: 25000,
    subscription: {
      required: false,
      monthly: 250,
      features: ['Cloud backup', 'Remote diagnostics', 'Updates']
    }
  },
  'ridder-connext': {
    id: 'ridder-connext',
    manufacturer: 'Ridder',
    model: 'Connext',
    category: 'Software',
    type: 'Cloud',
    capabilities: {
      zones: 999,
      sensors: 999,
      outputs: 999,
      recipes: 500,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['API', 'WiFi', 'Ethernet', 'Cloud'],
    compatibility: ['Ridder hardware', 'Third-party systems'],
    physical: {
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      mounting: 'Desktop'
    },
    power: {
      voltage: 0
    },
    features: [
      'Cloud-based platform',
      'Data analytics',
      'Benchmarking tools',
      'Energy optimization',
      'Yield predictions',
      'Mobile access',
      'API integrations',
      'Multi-site management',
      'KPI dashboards',
      'Advisory services'
    ],
    price: 0,
    subscription: {
      required: true,
      monthly: 399,
      features: ['Full platform', 'Support', 'Advisory']
    }
  },
  
  // Link4 Corporation
  'link4-icrop': {
    id: 'link4-icrop',
    manufacturer: 'Link4',
    model: 'iCrop',
    category: 'Integrated',
    type: 'Cloud',
    capabilities: {
      zones: 24,
      sensors: 96,
      outputs: 72,
      recipes: 50,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      irrigation: true,
      vpd: true,
      ph: true,
      ec: true
    },
    connectivity: ['WiFi', 'Ethernet', 'Cellular', 'RS485'],
    compatibility: ['Link4 modules', 'Standard sensors'],
    physical: {
      width: 14,
      height: 10,
      depth: 4,
      weight: 10,
      mounting: 'Wall'
    },
    power: {
      voltage: 120,
      watts: 35,
      backup: false
    },
    features: [
      'Modular design',
      'Touchscreen interface',
      'Remote monitoring',
      'Email/SMS alerts',
      'Scheduling system',
      'Data graphing',
      'Weather station',
      'Expandable I/O',
      'Mobile app',
      'Cloud backup'
    ],
    price: 6500,
    subscription: {
      required: false,
      monthly: 49,
      features: ['Cloud services', 'Remote access', 'Support']
    }
  },
  'link4-gh-node': {
    id: 'link4-gh-node',
    manufacturer: 'Link4',
    model: 'GH-Node',
    category: 'Climate',
    type: 'Standalone',
    capabilities: {
      zones: 1,
      sensors: 8,
      outputs: 12,
      recipes: 10,
      dataLogging: true,
      remoteAccess: true
    },
    control: {
      temperature: true,
      humidity: true,
      co2: true,
      lighting: true,
      vpd: true
    },
    connectivity: ['RS485', 'Wireless mesh'],
    compatibility: ['Link4 ecosystem', 'iCrop integration'],
    physical: {
      width: 8,
      height: 6,
      depth: 3,
      weight: 3,
      mounting: 'Wall'
    },
    power: {
      voltage: 24,
      watts: 15
    },
    features: [
      'Zone controller',
      'Mesh networking',
      'LCD display',
      'Local control',
      'iCrop compatible',
      'DIN rail mount option',
      'Expandable relays',
      'Sensor inputs'
    ],
    price: 850
  }
};

// Helper functions for controller selection
export function calculateControlPoints(
  roomCount: number,
  sensorsPerRoom: number = 4,
  outputsPerRoom: number = 8
): {
  totalSensors: number;
  totalOutputs: number;
  zones: number;
} {
  return {
    totalSensors: roomCount * sensorsPerRoom,
    totalOutputs: roomCount * outputsPerRoom,
    zones: roomCount
  };
}

export function recommendController(
  roomCount: number,
  requiredControl: Partial<EnvironmentalController['control']>,
  budget?: number,
  preferredType: 'Standalone' | 'Cloud' | 'Any' = 'Any'
): {
  primary: EnvironmentalController[];
  alternative: EnvironmentalController[];
  notes: string[];
} {
  const requirements = calculateControlPoints(roomCount);
  const controllers = Object.values(environmentalControllerDatabase);
  
  // Filter by capabilities
  const suitable = controllers.filter(controller => {
    // Check control capabilities
    const meetsControl = Object.entries(requiredControl).every(([key, required]) => {
      if (!required) return true;
      return controller.control[key as keyof typeof controller.control];
    });
    
    // Check capacity
    const hasCapacity = (!controller.capabilities.zones || controller.capabilities.zones >= requirements.zones) &&
                       (!controller.capabilities.sensors || controller.capabilities.sensors >= requirements.totalSensors) &&
                       (!controller.capabilities.outputs || controller.capabilities.outputs >= requirements.totalOutputs);
    
    // Check type preference
    const matchesType = preferredType === 'Any' || 
                       controller.type === preferredType ||
                       (preferredType === 'Cloud' && controller.type === 'Hybrid');
    
    // Check budget
    const withinBudget = !budget || !controller.price || controller.price <= budget;
    
    return meetsControl && hasCapacity && matchesType && withinBudget;
  });
  
  // Sort by features and price
  suitable.sort((a, b) => {
    // Prioritize integrated systems for multi-room
    if (roomCount > 4) {
      if (a.category === 'Integrated' && b.category !== 'Integrated') return -1;
      if (b.category === 'Integrated' && a.category !== 'Integrated') return 1;
    }
    
    // Then by feature count
    const aFeatures = a.features.length + Object.values(a.control).filter(Boolean).length;
    const bFeatures = b.features.length + Object.values(b.control).filter(Boolean).length;
    if (aFeatures !== bFeatures) return bFeatures - aFeatures;
    
    // Finally by price
    return (a.price || 999999) - (b.price || 999999);
  });
  
  const notes: string[] = [];
  
  if (roomCount > 8) {
    notes.push('Consider professional integration for large facilities');
  }
  
  if (requiredControl.irrigation && requiredControl.temperature) {
    notes.push('Integrated system recommended for coordinated control');
  }
  
  if (preferredType === 'Cloud') {
    notes.push('Ensure reliable internet connection for cloud systems');
  }
  
  return {
    primary: suitable.slice(0, 3),
    alternative: suitable.slice(3, 6),
    notes
  };
}