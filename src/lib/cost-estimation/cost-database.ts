/**
 * Cost Database
 * Comprehensive database of materials, labor, equipment, and service costs
 */

import type {
  CostDatabase,
  MaterialCost,
  LaborRate,
  EquipmentCost,
  ServiceCost,
  OverheadRate,
  MarkupRate
} from './cost-estimator';

// Material Cost Database
const MATERIALS: MaterialCost[] = [
  // Electrical Materials
  {
    id: 'mat-001',
    name: 'Copper Wire #12 AWG THWN',
    category: 'electrical',
    unit: 'feet',
    unitCost: 1.25,
    currency: 'USD',
    supplier: 'Southwire',
    leadTime: 7,
    minimumOrder: 500,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      voltage: '600V',
      temperature: '90°C',
      material: 'Copper',
      insulation: 'THWN'
    },
    lastUpdated: new Date()
  },
  {
    id: 'mat-002',
    name: 'Copper Wire #10 AWG THWN',
    category: 'electrical',
    unit: 'feet',
    unitCost: 1.95,
    currency: 'USD',
    supplier: 'Southwire',
    leadTime: 7,
    minimumOrder: 500,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      voltage: '600V',
      temperature: '90°C',
      material: 'Copper',
      insulation: 'THWN'
    },
    lastUpdated: new Date()
  },
  {
    id: 'mat-003',
    name: 'EMT Conduit 3/4"',
    category: 'electrical',
    unit: 'feet',
    unitCost: 2.45,
    currency: 'USD',
    supplier: 'Allied Tube & Conduit',
    leadTime: 14,
    minimumOrder: 100,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      material: 'Steel',
      coating: 'Galvanized',
      diameter: '3/4 inch'
    },
    lastUpdated: new Date()
  },
  {
    id: 'mat-004',
    name: 'Control Cable 18 AWG 4-Conductor',
    category: 'electrical',
    unit: 'feet',
    unitCost: 3.20,
    currency: 'USD',
    supplier: 'Belden',
    leadTime: 21,
    minimumOrder: 1000,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      conductors: 4,
      gauge: '18 AWG',
      shielding: 'Overall Foil',
      jacket: 'PVC'
    },
    lastUpdated: new Date()
  },
  
  // Mechanical Materials
  {
    id: 'mat-005',
    name: 'Carbon Steel Pipe 2" Schedule 40',
    category: 'mechanical',
    unit: 'feet',
    unitCost: 8.75,
    currency: 'USD',
    supplier: 'Nucor',
    leadTime: 14,
    minimumOrder: 20,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      material: 'Carbon Steel',
      diameter: '2 inch',
      schedule: '40',
      standard: 'ASTM A53'
    },
    lastUpdated: new Date()
  },
  {
    id: 'mat-006',
    name: 'Pipe Fittings - Elbow 90° 2"',
    category: 'mechanical',
    unit: 'each',
    unitCost: 15.50,
    currency: 'USD',
    supplier: 'Mueller Industries',
    leadTime: 7,
    minimumOrder: 10,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      material: 'Carbon Steel',
      diameter: '2 inch',
      angle: '90 degrees',
      connection: 'Threaded'
    },
    lastUpdated: new Date()
  },
  {
    id: 'mat-007',
    name: 'Pipe Insulation - Fiberglass 2"',
    category: 'insulation',
    unit: 'feet',
    unitCost: 4.25,
    currency: 'USD',
    supplier: 'Owens Corning',
    leadTime: 10,
    minimumOrder: 50,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      material: 'Fiberglass',
      thickness: '1 inch',
      diameter: '2 inch pipe',
      rValue: '4.2'
    },
    lastUpdated: new Date()
  },
  
  // Safety Materials
  {
    id: 'mat-008',
    name: 'Fire Extinguisher - ABC 10lb',
    category: 'safety',
    unit: 'each',
    unitCost: 85.00,
    currency: 'USD',
    supplier: 'Amerex',
    leadTime: 7,
    minimumOrder: 1,
    priceValidUntil: new Date('2025-12-31'),
    location: 'National',
    specifications: {
      type: 'ABC Dry Chemical',
      weight: '10 pounds',
      rating: '4A:60B:C',
      certification: 'UL Listed'
    },
    lastUpdated: new Date()
  }
];

// Labor Rate Database
const LABOR: LaborRate[] = [
  {
    id: 'lab-001',
    role: 'Project Manager',
    skillLevel: 'senior',
    hourlyRate: 95.00,
    currency: 'USD',
    location: 'National Average',
    unionRate: false,
    benefits: 25,
    overhead: 15,
    availability: 'medium',
    certifications: ['PMP', 'PE'],
    lastUpdated: new Date()
  },
  {
    id: 'lab-002',
    role: 'Electrical Engineer',
    skillLevel: 'senior',
    hourlyRate: 85.00,
    currency: 'USD',
    location: 'National Average',
    unionRate: false,
    benefits: 25,
    overhead: 15,
    availability: 'medium',
    certifications: ['PE', 'IEEE'],
    lastUpdated: new Date()
  },
  {
    id: 'lab-003',
    role: 'Mechanical Engineer',
    skillLevel: 'senior',
    hourlyRate: 80.00,
    currency: 'USD',
    location: 'National Average',
    unionRate: false,
    benefits: 25,
    overhead: 15,
    availability: 'medium',
    certifications: ['PE', 'ASHRAE'],
    lastUpdated: new Date()
  },
  {
    id: 'lab-004',
    role: 'Electrician',
    skillLevel: 'expert',
    hourlyRate: 65.00,
    currency: 'USD',
    location: 'National Average',
    unionRate: true,
    benefits: 35,
    overhead: 20,
    availability: 'low',
    certifications: ['Master Electrician', 'NECA'],
    lastUpdated: new Date()
  },
  {
    id: 'lab-005',
    role: 'Pipefitter',
    skillLevel: 'senior',
    hourlyRate: 60.00,
    currency: 'USD',
    location: 'National Average',
    unionRate: true,
    benefits: 35,
    overhead: 20,
    availability: 'medium',
    certifications: ['UA Local', 'Welding Certified'],
    lastUpdated: new Date()
  },
  {
    id: 'lab-006',
    role: 'Technician - Controls',
    skillLevel: 'senior',
    hourlyRate: 55.00,
    currency: 'USD',
    location: 'National Average',
    unionRate: false,
    benefits: 25,
    overhead: 15,
    availability: 'low',
    certifications: ['Instrumentation', 'PLC Programming'],
    lastUpdated: new Date()
  },
  {
    id: 'lab-007',
    role: 'Construction Foreman',
    skillLevel: 'expert',
    hourlyRate: 70.00,
    currency: 'USD',
    location: 'National Average',
    unionRate: true,
    benefits: 35,
    overhead: 20,
    availability: 'medium',
    certifications: ['OSHA 30', 'Construction Management'],
    lastUpdated: new Date()
  }
];

// Equipment Cost Database
const EQUIPMENT: EquipmentCost[] = [
  {
    id: 'equip-001',
    name: 'Cogeneration Unit - 330kW Natural Gas',
    category: 'cogeneration',
    type: 'purchase',
    cost: 485000,
    currency: 'USD',
    capacity: '330kW',
    specifications: {
      fuel: 'Natural Gas',
      electricalOutput: '330kW',
      thermalOutput: '450kW',
      efficiency: '85%',
      emissions: 'Low NOx',
      manufacturer: 'Caterpillar'
    },
    supplier: 'Caterpillar Energy Solutions',
    leadTime: 120,
    warranty: 24,
    maintenance: {
      annualRate: 3.5,
      scheduleType: 'hourly',
      majorOverhaulInterval: 5,
      majorOverhaulCost: 48500,
      spareParts: 2.5
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 20,
      salvageValue: 10,
      taxDepreciation: true
    },
    lastUpdated: new Date()
  },
  {
    id: 'equip-002',
    name: 'Heat Recovery Steam Generator',
    category: 'heat_exchangers',
    type: 'purchase',
    cost: 125000,
    currency: 'USD',
    capacity: '450kW Thermal',
    specifications: {
      type: 'Fire Tube',
      steamPressure: '150 PSI',
      steamOutput: '1500 lb/hr',
      efficiency: '82%',
      manufacturer: 'Cleaver-Brooks'
    },
    supplier: 'Cleaver-Brooks',
    leadTime: 90,
    warranty: 12,
    maintenance: {
      annualRate: 2.5,
      scheduleType: 'calendar',
      majorOverhaulInterval: 7,
      majorOverhaulCost: 12500,
      spareParts: 2.0
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 25,
      salvageValue: 5,
      taxDepreciation: true
    },
    lastUpdated: new Date()
  },
  {
    id: 'equip-003',
    name: 'Electrical Switchgear - 480V',
    category: 'electrical_panels',
    type: 'purchase',
    cost: 45000,
    currency: 'USD',
    capacity: '800A',
    specifications: {
      voltage: '480V',
      amperage: '800A',
      breakers: '6',
      type: 'Metal Clad',
      manufacturer: 'Schneider Electric'
    },
    supplier: 'Schneider Electric',
    leadTime: 60,
    warranty: 12,
    maintenance: {
      annualRate: 1.5,
      scheduleType: 'calendar',
      majorOverhaulInterval: 15,
      majorOverhaulCost: 4500,
      spareParts: 1.0
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 30,
      salvageValue: 10,
      taxDepreciation: true
    },
    lastUpdated: new Date()
  },
  {
    id: 'equip-004',
    name: 'Control System - PLC Based',
    category: 'controls',
    type: 'purchase',
    cost: 35000,
    currency: 'USD',
    capacity: '64 I/O Points',
    specifications: {
      type: 'PLC',
      ioPoints: '64',
      hmi: 'Touchscreen 12"',
      communication: 'Ethernet/IP',
      manufacturer: 'Allen-Bradley'
    },
    supplier: 'Rockwell Automation',
    leadTime: 45,
    warranty: 24,
    maintenance: {
      annualRate: 5.0,
      scheduleType: 'condition',
      majorOverhaulInterval: 10,
      majorOverhaulCost: 7000,
      spareParts: 3.0
    },
    depreciation: {
      method: 'declining_balance',
      usefulLife: 10,
      salvageValue: 15,
      taxDepreciation: true
    },
    lastUpdated: new Date()
  },
  {
    id: 'equip-005',
    name: 'Circulating Pump - Hot Water',
    category: 'pumps',
    type: 'purchase',
    cost: 8500,
    currency: 'USD',
    capacity: '200 GPM',
    specifications: {
      flow: '200 GPM',
      head: '80 feet',
      motor: '5 HP',
      material: 'Cast Iron',
      manufacturer: 'Grundfos'
    },
    supplier: 'Grundfos',
    leadTime: 30,
    warranty: 24,
    maintenance: {
      annualRate: 4.0,
      scheduleType: 'hourly',
      majorOverhaulInterval: 8,
      majorOverhaulCost: 1700,
      spareParts: 5.0
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 15,
      salvageValue: 5,
      taxDepreciation: true
    },
    lastUpdated: new Date()
  }
];

// Service Cost Database
const SERVICES: ServiceCost[] = [
  {
    id: 'serv-001',
    name: 'Engineering Design Services',
    category: 'engineering',
    provider: 'Energy Engineering Solutions',
    unitCost: 125.00,
    unit: 'hour',
    currency: 'USD',
    minimumCharge: 5000,
    leadTime: 14,
    location: 'National',
    qualifications: ['PE License', '20+ Years Experience'],
    lastUpdated: new Date()
  },
  {
    id: 'serv-002',
    name: 'Permit Application Services',
    category: 'permitting',
    provider: 'Regulatory Compliance Group',
    unitCost: 150.00,
    unit: 'hour',
    currency: 'USD',
    minimumCharge: 3000,
    leadTime: 7,
    location: 'Regional',
    qualifications: ['Local Permit Experience', 'Regulatory Knowledge'],
    lastUpdated: new Date()
  },
  {
    id: 'serv-003',
    name: 'System Commissioning',
    category: 'commissioning',
    provider: 'Professional Commissioning Services',
    unitCost: 140.00,
    unit: 'hour',
    currency: 'USD',
    minimumCharge: 8000,
    leadTime: 21,
    location: 'National',
    qualifications: ['CxA Certification', 'ASHRAE Standards'],
    lastUpdated: new Date()
  },
  {
    id: 'serv-004',
    name: 'Performance Testing',
    category: 'testing',
    provider: 'Independent Testing Laboratory',
    unitCost: 165.00,
    unit: 'hour',
    currency: 'USD',
    minimumCharge: 4000,
    leadTime: 14,
    location: 'Regional',
    qualifications: ['NETA Accredited', 'Calibrated Equipment'],
    lastUpdated: new Date()
  },
  {
    id: 'serv-005',
    name: 'Operator Training',
    category: 'training',
    provider: 'Technical Training Institute',
    unitCost: 95.00,
    unit: 'hour',
    currency: 'USD',
    minimumCharge: 1500,
    leadTime: 10,
    location: 'National',
    qualifications: ['Certified Instructors', 'Hands-on Training'],
    lastUpdated: new Date()
  },
  {
    id: 'serv-006',
    name: 'Construction Management',
    category: 'construction',
    provider: 'Prime Construction Services',
    unitCost: 85.00,
    unit: 'hour',
    currency: 'USD',
    minimumCharge: 10000,
    leadTime: 7,
    location: 'Regional',
    qualifications: ['Licensed Contractor', 'Bonded & Insured'],
    lastUpdated: new Date()
  }
];

// Overhead Rate Database
const OVERHEAD: OverheadRate[] = [
  {
    category: 'general',
    rate: 12,
    appliesTo: ['labor', 'materials', 'equipment'],
    location: 'National'
  },
  {
    category: 'project',
    rate: 8,
    appliesTo: ['labor', 'services'],
    location: 'National'
  },
  {
    category: 'administrative',
    rate: 5,
    appliesTo: ['labor', 'materials', 'equipment', 'services'],
    location: 'National'
  }
];

// Markup Rate Database
const MARKUPS: MarkupRate[] = [
  {
    category: 'profit',
    rate: 15,
    appliesTo: ['labor', 'materials', 'equipment', 'services'],
    projectType: ['cogeneration', 'lighting_design', 'hvac_design'],
    complexity: ['simple', 'moderate', 'complex']
  },
  {
    category: 'risk',
    rate: 8,
    appliesTo: ['labor', 'materials', 'equipment'],
    projectType: ['cogeneration'],
    complexity: ['complex']
  },
  {
    category: 'contingency',
    rate: 10,
    appliesTo: ['labor', 'materials', 'equipment', 'services'],
    projectType: ['cogeneration', 'facility_design'],
    complexity: ['moderate', 'complex']
  },
  {
    category: 'contingency',
    rate: 5,
    appliesTo: ['labor', 'materials', 'equipment', 'services'],
    projectType: ['lighting_design', 'hvac_design', 'retrofit', 'maintenance'],
    complexity: ['simple', 'moderate']
  }
];

// Create the cost database
export const COST_DATABASE: CostDatabase = {
  materials: MATERIALS,
  labor: LABOR,
  equipment: EQUIPMENT,
  services: SERVICES,
  overhead: OVERHEAD,
  markups: MARKUPS
};

// Export individual arrays for convenience
export {
  MATERIALS,
  LABOR,
  EQUIPMENT,
  SERVICES,
  OVERHEAD,
  MARKUPS
};