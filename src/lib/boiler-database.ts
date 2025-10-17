// Comprehensive boiler and heating equipment database
// Includes specifications for greenhouse and industrial applications

export interface BoilerSystem {
  id: string;
  manufacturer: string;
  model: string;
  series?: string;
  category: 'Boiler' | 'Water Heater' | 'Steam Generator' | 'Thermal Fluid Heater';
  type: 'Natural Draft' | 'Forced Draft' | 'Condensing' | 'Combi' | 'Fire Tube' | 'Water Tube' | 'Electric';
  fuel: 'Natural Gas' | 'Propane' | 'Oil' | 'Electric' | 'Dual Fuel' | 'Biomass';
  application: string[];
  capacity: {
    input: number; // BTU/hr or kW
    output: number; // BTU/hr or kW
    units: 'BTU/hr' | 'MBH' | 'kW' | 'MW' | 'HP';
  };
  efficiency: {
    thermal: number; // %
    combustion: number; // %
    seasonal?: number; // AFUE %
  };
  temperature: {
    maxSupply: number; // °F
    maxReturn?: number; // °F
    deltaT: number; // °F
  };
  pressure: {
    maxWorking: number; // PSI
    testPressure?: number; // PSI
    safetyRelief: number; // PSI
  };
  flow: {
    min?: number; // GPM
    max?: number; // GPM
    pressureDrop?: number; // PSI
  };
  emissions: {
    nox: number; // ppm or lb/MMBtu
    co: number; // ppm
    co2?: number; // %
    certification?: string[]; // ['SCAQMD', 'EPA', etc]
  };
  electrical: {
    voltage: number;
    phase: 1 | 3;
    frequency: 50 | 60;
    power: number; // kW
    controlVoltage?: number;
  };
  dimensions: {
    width: number; // inches
    depth: number; // inches
    height: number; // inches
    weight: number; // lbs
    clearances: {
      front: number;
      back: number;
      sides: number;
      top: number;
    };
  };
  connections: {
    gasInlet: string; // pipe size
    waterInlet: string;
    waterOutlet: string;
    flue: string;
    condensate?: string;
  };
  controls: {
    type: 'Basic' | 'Advanced' | 'BMS Ready' | 'Full Modulation';
    interface: string[];
    protocols?: string[]; // ['BACnet', 'Modbus', 'LonWorks']
    staging?: number; // Number of stages
    turndown?: string; // e.g., "10:1"
  };
  features: string[];
  certifications: string[];
  warranty: {
    heatExchanger: number; // years
    parts: number; // years
  };
  price: {
    list: number;
    typical?: number; // Street price
    installation?: number; // Typical install cost
  };
  maintenance: {
    interval: number; // hours
    annualCost: number; // $/year
  };
}

export const boilerDatabase: Record<string, BoilerSystem> = {
  // AERCO Condensing Boilers
  'aerco-benchmark-3000': {
    id: 'aerco-benchmark-3000',
    manufacturer: 'AERCO',
    model: 'BMK3000',
    series: 'Benchmark',
    category: 'Boiler',
    type: 'Condensing',
    fuel: 'Natural Gas',
    application: ['Greenhouse Heating', 'Process Heat', 'Space Heating', 'Hydronic'],
    capacity: {
      input: 3000000,
      output: 2850000,
      units: 'BTU/hr'
    },
    efficiency: {
      thermal: 95,
      combustion: 98,
      seasonal: 95
    },
    temperature: {
      maxSupply: 200,
      maxReturn: 180,
      deltaT: 40
    },
    pressure: {
      maxWorking: 160,
      testPressure: 240,
      safetyRelief: 160
    },
    flow: {
      min: 30,
      max: 300,
      pressureDrop: 8.5
    },
    emissions: {
      nox: 20,
      co: 50,
      co2: 9,
      certification: ['SCAQMD', 'EPA']
    },
    electrical: {
      voltage: 120,
      phase: 1,
      frequency: 60,
      power: 0.75
    },
    dimensions: {
      width: 39,
      depth: 50,
      height: 78,
      weight: 1700,
      clearances: {
        front: 24,
        back: 6,
        sides: 12,
        top: 24
      }
    },
    connections: {
      gasInlet: '2" NPT',
      waterInlet: '3" Victaulic',
      waterOutlet: '3" Victaulic',
      flue: '8"',
      condensate: '3/4" PVC'
    },
    controls: {
      type: 'Full Modulation',
      interface: ['Touch Screen', 'BMS'],
      protocols: ['BACnet', 'Modbus', 'LonWorks'],
      staging: 1,
      turndown: '25:1'
    },
    features: [
      'O2 Trim Standard',
      'Parallel Operation up to 32 units',
      'Outdoor Reset',
      'Night Setback',
      'Warm Weather Shutdown',
      'Anti-Short Cycling',
      'Freeze Protection',
      'Variable Speed Combustion Fan'
    ],
    certifications: ['ASME', 'CSA', 'NSF', 'Energy Star'],
    warranty: {
      heatExchanger: 15,
      parts: 2
    },
    price: {
      list: 45000,
      typical: 38000,
      installation: 12000
    },
    maintenance: {
      interval: 8760, // Annual
      annualCost: 800
    }
  },

  // Cleaver-Brooks Fire Tube Boilers
  'cleaver-brooks-cb-200': {
    id: 'cleaver-brooks-cb-200',
    manufacturer: 'Cleaver-Brooks',
    model: 'CB-200',
    series: 'CB',
    category: 'Boiler',
    type: 'Fire Tube',
    fuel: 'Natural Gas',
    application: ['Industrial Process', 'Large Greenhouse', 'District Heating'],
    capacity: {
      input: 8368000,
      output: 7000000,
      units: 'BTU/hr'
    },
    efficiency: {
      thermal: 83.6,
      combustion: 85,
      seasonal: 82
    },
    temperature: {
      maxSupply: 250,
      deltaT: 20
    },
    pressure: {
      maxWorking: 150,
      testPressure: 225,
      safetyRelief: 150
    },
    flow: {
      min: 100,
      max: 700
    },
    emissions: {
      nox: 30,
      co: 60,
      certification: ['EPA']
    },
    electrical: {
      voltage: 460,
      phase: 3,
      frequency: 60,
      power: 15,
      controlVoltage: 120
    },
    dimensions: {
      width: 84,
      depth: 144,
      height: 96,
      weight: 12000,
      clearances: {
        front: 48,
        back: 36,
        sides: 24,
        top: 48
      }
    },
    connections: {
      gasInlet: '3" Flanged',
      waterInlet: '4" Flanged',
      waterOutlet: '4" Flanged',
      flue: '16"'
    },
    controls: {
      type: 'Advanced',
      interface: ['Touchscreen HMI', 'Remote Access'],
      protocols: ['BACnet', 'Modbus'],
      staging: 3,
      turndown: '4:1'
    },
    features: [
      'Integral Economizer',
      'VFD on Combustion Fan',
      'Flame Safeguard System',
      'Water Level Controls',
      'Stack Temperature Monitoring',
      'Efficiency Monitoring'
    ],
    certifications: ['ASME', 'UL', 'CSA', 'NB'],
    warranty: {
      heatExchanger: 10,
      parts: 1
    },
    price: {
      list: 125000,
      typical: 110000,
      installation: 35000
    },
    maintenance: {
      interval: 4380, // Semi-annual
      annualCost: 3500
    }
  },

  // Fulton Vertical Tubeless Boiler
  'fulton-vmp-30': {
    id: 'fulton-vmp-30',
    manufacturer: 'Fulton',
    model: 'VMP-30',
    series: 'Vantage',
    category: 'Steam Generator',
    type: 'Water Tube',
    fuel: 'Natural Gas',
    application: ['Steam Sterilization', 'Process Steam', 'Humidification'],
    capacity: {
      input: 1004000,
      output: 30,
      units: 'HP'
    },
    efficiency: {
      thermal: 82,
      combustion: 84
    },
    temperature: {
      maxSupply: 338, // Saturated steam at 100 PSI
      deltaT: 0
    },
    pressure: {
      maxWorking: 100,
      testPressure: 150,
      safetyRelief: 100
    },
    emissions: {
      nox: 30,
      co: 50
    },
    electrical: {
      voltage: 208,
      phase: 3,
      frequency: 60,
      power: 2.5
    },
    dimensions: {
      width: 32,
      depth: 34,
      height: 78,
      weight: 1850,
      clearances: {
        front: 36,
        back: 18,
        sides: 18,
        top: 36
      }
    },
    connections: {
      gasInlet: '1-1/2" NPT',
      waterInlet: '1" NPT',
      waterOutlet: '2" NPT', // Steam outlet
      flue: '8"'
    },
    controls: {
      type: 'Advanced',
      interface: ['Digital Display', 'ModSync'],
      protocols: ['Modbus'],
      staging: 1,
      turndown: '5:1'
    },
    features: [
      'Vertical Design - Small Footprint',
      'Quick Start - 10 minutes to steam',
      'Low Water Volume',
      'Stainless Steel Heat Exchanger',
      'Integral Blowdown Separator'
    ],
    certifications: ['ASME', 'UL', 'CSD-1'],
    warranty: {
      heatExchanger: 10,
      parts: 1
    },
    price: {
      list: 35000,
      typical: 30000,
      installation: 15000
    },
    maintenance: {
      interval: 2190, // Quarterly
      annualCost: 2000
    }
  },

  // Lochinvar High Efficiency Boiler
  'lochinvar-ftxl-850': {
    id: 'lochinvar-ftxl-850',
    manufacturer: 'Lochinvar',
    model: 'FTXL 850',
    series: 'FTXL Fire Tube',
    category: 'Boiler',
    type: 'Condensing',
    fuel: 'Natural Gas',
    application: ['Greenhouse Heating', 'Radiant Floor', 'Snow Melt'],
    capacity: {
      input: 850000,
      output: 807500,
      units: 'BTU/hr'
    },
    efficiency: {
      thermal: 95,
      combustion: 97,
      seasonal: 95
    },
    temperature: {
      maxSupply: 180,
      maxReturn: 160,
      deltaT: 35
    },
    pressure: {
      maxWorking: 80,
      testPressure: 120,
      safetyRelief: 80
    },
    flow: {
      min: 16,
      max: 85,
      pressureDrop: 5.8
    },
    emissions: {
      nox: 20,
      co: 40,
      certification: ['SCAQMD', 'Energy Star']
    },
    electrical: {
      voltage: 120,
      phase: 1,
      frequency: 60,
      power: 0.5
    },
    dimensions: {
      width: 28,
      depth: 44,
      height: 46,
      weight: 625,
      clearances: {
        front: 24,
        back: 1,
        sides: 6,
        top: 12
      }
    },
    connections: {
      gasInlet: '1" NPT',
      waterInlet: '2" NPT',
      waterOutlet: '2" NPT',
      flue: '4" PVC/CPVC',
      condensate: '3/4" PVC'
    },
    controls: {
      type: 'Full Modulation',
      interface: ['SMART TOUCH', 'CON·X·US Remote Connect'],
      protocols: ['BACnet', 'Modbus', 'LonWorks'],
      staging: 1,
      turndown: '10:1'
    },
    features: [
      'Stainless Steel Fire Tube Heat Exchanger',
      'Common Venting up to 8 units',
      'Cascading Capable',
      'Built-in Cascading Sequencer',
      'Low NOx Premix Burner',
      'Direct Vent'
    ],
    certifications: ['ASME H Stamp', 'CSA', 'Energy Star'],
    warranty: {
      heatExchanger: 12,
      parts: 2
    },
    price: {
      list: 18000,
      typical: 15000,
      installation: 6000
    },
    maintenance: {
      interval: 8760,
      annualCost: 500
    }
  },

  // Electric Boiler Option
  'precision-eb-500': {
    id: 'precision-eb-500',
    manufacturer: 'Precision',
    model: 'EB-500',
    series: 'Electric Boilers',
    category: 'Boiler',
    type: 'Electric',
    fuel: 'Electric',
    application: ['Clean Room', 'Laboratory', 'Small Greenhouse'],
    capacity: {
      input: 500,
      output: 500,
      units: 'kW'
    },
    efficiency: {
      thermal: 99,
      combustion: 100,
      seasonal: 98
    },
    temperature: {
      maxSupply: 250,
      deltaT: 40
    },
    pressure: {
      maxWorking: 150,
      testPressure: 225,
      safetyRelief: 150
    },
    flow: {
      min: 25,
      max: 250
    },
    emissions: {
      nox: 0,
      co: 0,
      co2: 0,
      certification: ['Zero Emissions']
    },
    electrical: {
      voltage: 480,
      phase: 3,
      frequency: 60,
      power: 500,
      controlVoltage: 24
    },
    dimensions: {
      width: 48,
      depth: 36,
      height: 72,
      weight: 1200,
      clearances: {
        front: 36,
        back: 12,
        sides: 12,
        top: 24
      }
    },
    connections: {
      gasInlet: 'N/A',
      waterInlet: '3" Flanged',
      waterOutlet: '3" Flanged',
      flue: 'None Required'
    },
    controls: {
      type: 'Full Modulation',
      interface: ['Touch Screen', 'Web Interface'],
      protocols: ['BACnet', 'Modbus'],
      staging: 10,
      turndown: 'Infinite'
    },
    features: [
      'Silent Operation',
      'No Combustion Air Required',
      'No Flue Required',
      'Staged Elements',
      'SCR Power Control',
      'Zero Emissions',
      'Compact Design'
    ],
    certifications: ['ASME', 'UL', 'NEC'],
    warranty: {
      heatExchanger: 10,
      parts: 2
    },
    price: {
      list: 55000,
      typical: 48000,
      installation: 8000
    },
    maintenance: {
      interval: 8760,
      annualCost: 300
    }
  }
};

// Helper functions for boiler selection
export function calculateBoilerSize(
  heatLoad: number, // BTU/hr
  efficiency: number = 0.85,
  safetyFactor: number = 1.2
): number {
  return (heatLoad * safetyFactor) / efficiency;
}

export function recommendBoilers(
  heatLoad: number, // BTU/hr
  fuelType: 'Natural Gas' | 'Propane' | 'Oil' | 'Electric',
  application: string[],
  budget?: number
): BoilerSystem[] {
  const requiredCapacity = calculateBoilerSize(heatLoad);
  
  return Object.values(boilerDatabase)
    .filter(boiler => {
      const matchesFuel = boiler.fuel === fuelType || boiler.fuel === 'Dual Fuel';
      const matchesCapacity = boiler.capacity.output >= requiredCapacity * 0.9;
      const matchesApplication = application.some(app => 
        boiler.application.includes(app)
      );
      const matchesBudget = !budget || boiler.price.typical <= budget;
      
      return matchesFuel && matchesCapacity && matchesApplication && matchesBudget;
    })
    .sort((a, b) => {
      // Sort by efficiency then by price
      const efficiencyDiff = b.efficiency.thermal - a.efficiency.thermal;
      if (Math.abs(efficiencyDiff) > 5) return efficiencyDiff;
      return a.price.typical - b.price.typical;
    });
}

export function calculateOperatingCost(
  boiler: BoilerSystem,
  annualHours: number,
  fuelCost: number, // $/therm for gas, $/kWh for electric
  loadFactor: number = 0.7
): {
  annualFuelCost: number;
  annualMaintenanceCost: number;
  totalOperatingCost: number;
} {
  let annualFuelCost = 0;
  
  if (boiler.fuel === 'Electric') {
    // Electric cost calculation
    const annualEnergy = boiler.capacity.input * annualHours * loadFactor; // kWh
    annualFuelCost = annualEnergy * fuelCost;
  } else {
    // Gas/Oil cost calculation
    const annualEnergy = boiler.capacity.input * annualHours * loadFactor / 100000; // therms
    annualFuelCost = annualEnergy * fuelCost;
  }
  
  return {
    annualFuelCost,
    annualMaintenanceCost: boiler.maintenance.annualCost,
    totalOperatingCost: annualFuelCost + boiler.maintenance.annualCost
  };
}