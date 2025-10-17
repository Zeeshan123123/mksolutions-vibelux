// Wadsworth greenhouse equipment database
// Includes control systems, vents, fans, and greenhouse automation

export interface WadsworthEquipment {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Control' | 'Ventilation' | 'Heating' | 'Cooling' | 'Screening' | 'Structural';
  type: string;
  specifications: {
    capacity?: number;
    coverage?: number; // sq ft
    airflow?: number; // CFM
    btu?: number; // BTU/hr
    power?: {
      voltage: number;
      phase?: 1 | 3;
      watts?: number;
      amps?: number;
    };
  };
  features: string[];
  physical?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  price?: number;
}

export const wadsworthCategories = {
  Control: {
    name: 'Control Systems',
    description: 'Environmental control and automation systems',
    icon: 'cpu'
  },
  Ventilation: {
    name: 'Ventilation',
    description: 'Natural and mechanical ventilation systems',
    icon: 'wind'
  },
  Heating: {
    name: 'Heating Systems',
    description: 'Unit heaters and heating distribution',
    icon: 'flame'
  },
  Cooling: {
    name: 'Cooling Systems',
    description: 'Evaporative cooling and fans',
    icon: 'snowflake'
  },
  Screening: {
    name: 'Screening Systems',
    description: 'Shade and energy screens',
    icon: 'grid'
  },
  Structural: {
    name: 'Structural Components',
    description: 'Greenhouse structures and components',
    icon: 'building'
  }
};

export const wadsworthDatabase: Record<string, WadsworthEquipment> = {
  // Control Systems
  'wadsworth-seed': {
    id: 'wadsworth-seed',
    manufacturer: 'Wadsworth',
    model: 'SEED Environmental Controller',
    category: 'Control',
    type: 'Integrated Controller',
    specifications: {
      coverage: 50000, // sq ft
      power: {
        voltage: 120,
        phase: 1,
        watts: 50
      }
    },
    features: [
      'Touchscreen interface',
      'Multi-zone control',
      'Weather station integration',
      'Remote access capability',
      'Data logging',
      'Alarm notifications',
      'Energy optimization',
      'Modbus compatibility',
      'Expandable I/O',
      'Cloud connectivity'
    ],
    price: 8500
  },
  'wadsworth-step-500': {
    id: 'wadsworth-step-500',
    manufacturer: 'Wadsworth',
    model: 'STEP 500 Controller',
    category: 'Control',
    type: 'Climate Controller',
    specifications: {
      coverage: 30000,
      power: {
        voltage: 120,
        phase: 1,
        watts: 30
      }
    },
    features: [
      'Stage control logic',
      'Temperature management',
      'Humidity control',
      'Vent positioning',
      'Heating/cooling stages',
      'Simple programming',
      'LCD display',
      'Manual override',
      'Zone capability',
      'Sensor inputs'
    ],
    price: 3500
  },
  
  // Ventilation Systems
  'wadsworth-ridge-vent': {
    id: 'wadsworth-ridge-vent',
    manufacturer: 'Wadsworth',
    model: 'Continuous Ridge Vent',
    category: 'Ventilation',
    type: 'Natural Ventilation',
    specifications: {
      coverage: 1000, // linear feet
      capacity: 2500 // CFM per 100 ft
    },
    features: [
      'Continuous opening',
      'Rack and pinion drive',
      'Weather resistant',
      'Manual or motorized',
      'Aluminum construction',
      'Snow load rated',
      'Insect screening option',
      'Low maintenance'
    ],
    physical: {
      height: 24,
      weight: 15 // per linear foot
    },
    price: 125 // per linear foot
  },
  'wadsworth-sidewall-vent': {
    id: 'wadsworth-sidewall-vent',
    manufacturer: 'Wadsworth',
    model: 'Roll-Up Side Vent',
    category: 'Ventilation',
    type: 'Natural Ventilation',
    specifications: {
      coverage: 100, // linear feet
      capacity: 1800 // CFM per 100 ft
    },
    features: [
      'Roll-up design',
      'Gear drive motor',
      'Polyethylene material',
      'UV resistant',
      'Manual backup',
      'Wind sensor compatible',
      'Adjustable height',
      'Easy installation'
    ],
    physical: {
      height: 72, // 6 feet typical
      weight: 8 // per linear foot
    },
    price: 45 // per linear foot
  },
  
  // HAF Fans
  'wadsworth-haf-24': {
    id: 'wadsworth-haf-24',
    manufacturer: 'Wadsworth',
    model: '24" HAF Fan',
    category: 'Ventilation',
    type: 'Horizontal Air Flow',
    specifications: {
      airflow: 7200, // CFM
      power: {
        voltage: 120,
        phase: 1,
        watts: 250,
        amps: 2.1
      }
    },
    features: [
      'Horizontal air flow',
      'Variable speed capable',
      'Corrosion resistant',
      'Balanced blades',
      'Thermal overload',
      'Permanently lubricated',
      'Quick mount bracket',
      'Energy efficient motor'
    ],
    physical: {
      width: 24,
      height: 24,
      depth: 12,
      weight: 35
    },
    price: 485
  },
  'wadsworth-haf-36': {
    id: 'wadsworth-haf-36',
    manufacturer: 'Wadsworth',
    model: '36" HAF Fan',
    category: 'Ventilation',
    type: 'Horizontal Air Flow',
    specifications: {
      airflow: 12500, // CFM
      power: {
        voltage: 240,
        phase: 1,
        watts: 450,
        amps: 3.5
      }
    },
    features: [
      'High volume air flow',
      'Variable speed motor',
      'Aluminum housing',
      'OSHA guards',
      'Low noise operation',
      'Direct drive',
      'Moisture resistant',
      'Commercial grade'
    ],
    physical: {
      width: 36,
      height: 36,
      depth: 14,
      weight: 65
    },
    price: 785
  },
  
  // Exhaust Fans
  'wadsworth-exhaust-48': {
    id: 'wadsworth-exhaust-48',
    manufacturer: 'Wadsworth',
    model: '48" Exhaust Fan',
    category: 'Ventilation',
    type: 'Exhaust Fan',
    specifications: {
      airflow: 24500, // CFM
      power: {
        voltage: 240,
        phase: 1,
        watts: 1100,
        amps: 5.8
      }
    },
    features: [
      'Belt drive system',
      'Galvanized housing',
      'Automatic shutters',
      'Variable speed compatible',
      'Weather hood included',
      'AMCA certified',
      'High efficiency blades',
      'Low maintenance'
    ],
    physical: {
      width: 54,
      height: 54,
      depth: 24,
      weight: 185
    },
    price: 1850
  },
  
  // Heating Systems
  'wadsworth-unit-heater-200k': {
    id: 'wadsworth-unit-heater-200k',
    manufacturer: 'Wadsworth',
    model: '200K BTU Unit Heater',
    category: 'Heating',
    type: 'Gas Unit Heater',
    specifications: {
      btu: 200000,
      coverage: 5000,
      power: {
        voltage: 120,
        phase: 1,
        watts: 250
      }
    },
    features: [
      'Natural gas/propane',
      'Stainless steel exchanger',
      'Power vented',
      'Electronic ignition',
      'Modulating control',
      'Horizontal air flow',
      'Safety shutoffs',
      'CSA certified'
    ],
    physical: {
      width: 24,
      height: 30,
      depth: 48,
      weight: 125
    },
    price: 2850
  },
  'wadsworth-radiant-tube': {
    id: 'wadsworth-radiant-tube',
    manufacturer: 'Wadsworth',
    model: 'Radiant Tube Heater',
    category: 'Heating',
    type: 'Radiant Heating',
    specifications: {
      btu: 150000,
      coverage: 4000,
      power: {
        voltage: 120,
        phase: 1,
        watts: 150
      }
    },
    features: [
      'Infrared radiant heat',
      'U-tube design',
      'Reflectors included',
      'Low clearance',
      'Even heat distribution',
      'Energy efficient',
      'Quiet operation',
      'Zone heating capable'
    ],
    physical: {
      width: 6,
      height: 8,
      depth: 240, // 20 feet
      weight: 95
    },
    price: 2450
  },
  
  // Cooling Systems
  'wadsworth-evap-cooling': {
    id: 'wadsworth-evap-cooling',
    manufacturer: 'Wadsworth',
    model: 'Evaporative Cooling System',
    category: 'Cooling',
    type: 'Evaporative Cooling',
    specifications: {
      coverage: 10000,
      airflow: 35000,
      power: {
        voltage: 240,
        phase: 3,
        watts: 2200
      }
    },
    features: [
      'Pad and fan system',
      'Cellulose pads',
      'Water distribution',
      'Automatic controls',
      'Low water shutoff',
      'Algae resistant',
      'High efficiency',
      'Modular design'
    ],
    physical: {
      width: 120, // 10 feet wall
      height: 72,
      depth: 12,
      weight: 450
    },
    price: 6500
  },
  'wadsworth-high-pressure-fog': {
    id: 'wadsworth-high-pressure-fog',
    manufacturer: 'Wadsworth',
    model: 'High Pressure Fog System',
    category: 'Cooling',
    type: 'Fogging System',
    specifications: {
      coverage: 5000,
      capacity: 15, // GPM
      power: {
        voltage: 240,
        phase: 1,
        watts: 1500
      }
    },
    features: [
      '1000 PSI operation',
      'Stainless steel lines',
      'Anti-drip nozzles',
      'VFD pump control',
      'Zone capability',
      'Humidity control',
      'Fine droplet size',
      'Low water usage'
    ],
    physical: {
      width: 24,
      height: 36,
      depth: 18,
      weight: 125
    },
    price: 8500
  },
  
  // Screening Systems
  'wadsworth-shade-screen': {
    id: 'wadsworth-shade-screen',
    manufacturer: 'Wadsworth',
    model: 'Retractable Shade Screen',
    category: 'Screening',
    type: 'Shade System',
    specifications: {
      coverage: 5000, // sq ft
      power: {
        voltage: 240,
        phase: 1,
        watts: 750
      }
    },
    features: [
      'Automated control',
      'Multiple shade levels',
      'Flame retardant',
      'UV resistant',
      'Drive motor system',
      'Manual override',
      'Slope/flat capable',
      'Energy savings'
    ],
    physical: {
      weight: 0.5 // per sq ft
    },
    price: 4.50 // per sq ft
  },
  'wadsworth-energy-curtain': {
    id: 'wadsworth-energy-curtain',
    manufacturer: 'Wadsworth',
    model: 'Energy Curtain System',
    category: 'Screening',
    type: 'Energy Screen',
    specifications: {
      coverage: 10000,
      power: {
        voltage: 240,
        phase: 3,
        watts: 1100
      }
    },
    features: [
      'Heat retention',
      'Shade combination',
      'Gutter to gutter',
      'Moisture control',
      'Drive system included',
      'Fire resistant option',
      'Clear or opaque',
      'Long life fabric'
    ],
    physical: {
      weight: 0.75 // per sq ft
    },
    price: 6.25 // per sq ft
  },
  
  // Structural Components
  'wadsworth-gutter-connect': {
    id: 'wadsworth-gutter-connect',
    manufacturer: 'Wadsworth',
    model: 'Gutter Connect Greenhouse',
    category: 'Structural',
    type: 'Greenhouse Structure',
    specifications: {
      coverage: 10000 // base module
    },
    features: [
      'Aluminum frame',
      'Gutter connection',
      'Snow load rated',
      'Wind resistant',
      'Modular expansion',
      'Natural ventilation',
      'Clear span design',
      'Professional grade'
    ],
    physical: {
      height: 144, // 12 ft sidewall
      weight: 3.5 // per sq ft
    },
    price: 18.50 // per sq ft
  }
};

// Helper function to calculate Wadsworth system requirements
export function calculateWadsworthRequirements(
  greenhouseArea: number, // sq ft
  climateZone: 'cold' | 'moderate' | 'hot',
  cropType: 'vegetables' | 'cannabis' | 'ornamentals'
): {
  controller: WadsworthEquipment;
  ventilation: WadsworthEquipment[];
  heating?: WadsworthEquipment[];
  cooling?: WadsworthEquipment[];
  screening?: WadsworthEquipment;
  totalCost: number;
  notes: string[];
} {
  const recommendations: any = {
    ventilation: [],
    notes: []
  };
  let totalCost = 0;

  // Controller selection
  if (greenhouseArea > 30000) {
    recommendations.controller = wadsworthDatabase['wadsworth-seed'];
    recommendations.notes.push('SEED controller recommended for large operations');
  } else {
    recommendations.controller = wadsworthDatabase['wadsworth-step-500'];
    recommendations.notes.push('STEP 500 suitable for this greenhouse size');
  }
  totalCost += recommendations.controller.price || 0;

  // Ventilation
  const ridgeVentLength = Math.sqrt(greenhouseArea) * 2;
  recommendations.ventilation.push({
    ...wadsworthDatabase['wadsworth-ridge-vent'],
    quantity: ridgeVentLength,
    totalPrice: ridgeVentLength * (wadsworthDatabase['wadsworth-ridge-vent'].price || 0)
  });
  totalCost += ridgeVentLength * (wadsworthDatabase['wadsworth-ridge-vent'].price || 0);

  // HAF fans (1 per 2500 sq ft)
  const hafFanCount = Math.ceil(greenhouseArea / 2500);
  const hafFan = greenhouseArea > 20000 ? 
    wadsworthDatabase['wadsworth-haf-36'] : 
    wadsworthDatabase['wadsworth-haf-24'];
  recommendations.ventilation.push({
    ...hafFan,
    quantity: hafFanCount,
    totalPrice: hafFanCount * (hafFan.price || 0)
  });
  totalCost += hafFanCount * (hafFan.price || 0);

  // Climate-specific equipment
  if (climateZone === 'cold') {
    const heaterCount = Math.ceil(greenhouseArea / 5000);
    recommendations.heating = [{
      ...wadsworthDatabase['wadsworth-unit-heater-200k'],
      quantity: heaterCount,
      totalPrice: heaterCount * (wadsworthDatabase['wadsworth-unit-heater-200k'].price || 0)
    }];
    totalCost += heaterCount * (wadsworthDatabase['wadsworth-unit-heater-200k'].price || 0);
    recommendations.notes.push('Unit heaters sized for cold climate');
  }

  if (climateZone === 'hot' || cropType === 'cannabis') {
    if (greenhouseArea > 5000) {
      recommendations.cooling = [wadsworthDatabase['wadsworth-evap-cooling']];
      totalCost += wadsworthDatabase['wadsworth-evap-cooling'].price || 0;
    } else {
      recommendations.cooling = [wadsworthDatabase['wadsworth-high-pressure-fog']];
      totalCost += wadsworthDatabase['wadsworth-high-pressure-fog'].price || 0;
    }
    recommendations.notes.push('Cooling system essential for climate/crop');
  }

  // Screening for all cannabis operations
  if (cropType === 'cannabis') {
    recommendations.screening = {
      ...wadsworthDatabase['wadsworth-shade-screen'],
      coverage: greenhouseArea,
      totalPrice: greenhouseArea * (wadsworthDatabase['wadsworth-shade-screen'].price || 0)
    };
    totalCost += greenhouseArea * (wadsworthDatabase['wadsworth-shade-screen'].price || 0);
    recommendations.notes.push('Shade screen for photoperiod control');
  }

  return {
    ...recommendations,
    totalCost,
    notes: recommendations.notes
  };
}