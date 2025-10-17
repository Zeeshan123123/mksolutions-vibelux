/**
 * Construction Component Database
 * Real-world components with actual SKUs, specifications, and installation requirements
 */

export interface ConstructionComponent {
  id: string;
  category: ComponentCategory;
  type: string;
  manufacturer: string;
  model: string;
  sku: string;
  description: string;
  specifications: Record<string, any>;
  weight: number; // lbs
  dimensions: {
    length: number; // inches
    width: number;
    height: number;
  };
  price: number; // USD
  leadTime: number; // days
  supplier: SupplierInfo;
  installationRequirements: InstallationRequirements;
  certifications: string[];
  documentation: DocumentationLinks;
}

export interface SupplierInfo {
  name: string;
  contact: string;
  phone: string;
  email: string;
  website: string;
  accountNumber?: string;
}

export interface InstallationRequirements {
  laborHours: number;
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'licensed';
  tools: string[];
  relatedComponents: string[]; // SKUs of required components
  notes: string;
}

export interface DocumentationLinks {
  datasheet?: string;
  installGuide?: string;
  warranty?: string;
  cad?: string;
}

export type ComponentCategory = 
  | 'lighting-fixtures'
  | 'mounting-hardware'
  | 'electrical-components'
  | 'control-systems'
  | 'environmental-equipment'
  | 'structural'
  | 'safety-equipment'
  | 'irrigation'
  | 'hvac';

// Real-world component database
export const CONSTRUCTION_COMPONENTS: Record<string, ConstructionComponent> = {
  // Mounting Hardware for Fixtures
  'MOUNT-V-HOOK-6': {
    id: 'MOUNT-V-HOOK-6',
    category: 'mounting-hardware',
    type: 'V-Hook Hanger',
    manufacturer: 'Hydrofarm',
    model: 'SLVH6',
    sku: 'SLVH6',
    description: '6" V-Hook for hanging grow lights, rated 75 lbs',
    specifications: {
      loadRating: 75, // lbs
      material: 'Galvanized Steel',
      hookOpening: 1.5, // inches
      threadSize: '1/4-20'
    },
    weight: 0.25,
    dimensions: { length: 6, width: 1, height: 1 },
    price: 3.95,
    leadTime: 1,
    supplier: {
      name: 'Hydrofarm',
      contact: 'Commercial Sales',
      phone: '800-634-9999',
      email: 'commercial@hydrofarm.com',
      website: 'https://www.hydrofarm.com'
    },
    installationRequirements: {
      laborHours: 0.1,
      skillLevel: 'basic',
      tools: ['Drill', '1/4" Drill Bit', 'Adjustable Wrench'],
      relatedComponents: ['MOUNT-EYEBOLT-14', 'CHAIN-JACK-6'],
      notes: 'Install into structural member or use appropriate anchor'
    },
    certifications: ['UL Listed'],
    documentation: {
      datasheet: 'https://www.hydrofarm.com/downloads/SLVH6-spec.pdf'
    }
  },

  'MOUNT-UNISTRUT-10FT': {
    id: 'MOUNT-UNISTRUT-10FT',
    category: 'mounting-hardware',
    type: 'Unistrut Channel',
    manufacturer: 'Unistrut',
    model: 'P1000-10',
    sku: 'P1000-10PG',
    description: '1-5/8" x 1-5/8" Pre-Galvanized Steel Channel, 10ft',
    specifications: {
      channelType: 'P1000',
      material: 'Pre-Galvanized Steel',
      gauge: 12,
      slotted: true,
      loadCapacity: 1900, // lbs per 10ft span
      finish: 'Pre-Galvanized'
    },
    weight: 19,
    dimensions: { length: 120, width: 1.625, height: 1.625 },
    price: 45.80,
    leadTime: 2,
    supplier: {
      name: 'Grainger',
      contact: 'Inside Sales',
      phone: '800-472-4643',
      email: 'orders@grainger.com',
      website: 'https://www.grainger.com',
      accountNumber: 'Your-Account-Here'
    },
    installationRequirements: {
      laborHours: 0.5,
      skillLevel: 'intermediate',
      tools: ['Drill', 'Metal Cutting Saw', 'Level', 'Measuring Tape'],
      relatedComponents: ['MOUNT-UNISTRUT-BOLT', 'MOUNT-UNISTRUT-NUT', 'MOUNT-BEAM-CLAMP'],
      notes: 'Attach to structure with beam clamps or threaded rod'
    },
    certifications: ['NEMA Standard'],
    documentation: {
      datasheet: 'https://www.unistrut.com/downloads/P1000-load-data.pdf',
      cad: 'https://www.unistrut.com/cad/P1000.dwg'
    }
  },

  // Electrical Components
  'ELEC-PANEL-200A': {
    id: 'ELEC-PANEL-200A',
    category: 'electrical-components',
    type: 'Electrical Panel',
    manufacturer: 'Square D',
    model: 'QO142M200PC',
    sku: 'QO142M200PC',
    description: '200A Main Breaker Load Center, 42 Spaces',
    specifications: {
      amperage: 200,
      voltage: '120/240V',
      phase: 'Single Phase',
      spaces: 42,
      circuits: 42,
      mainBreaker: 'Included',
      mounting: 'Surface/Flush',
      nemaType: '1'
    },
    weight: 45,
    dimensions: { length: 38, width: 14.25, height: 5.75 },
    price: 285.00,
    leadTime: 5,
    supplier: {
      name: 'Rexel USA',
      contact: 'Branch Manager',
      phone: '800-REXEL-01',
      email: 'quotes@rexelusa.com',
      website: 'https://www.rexelusa.com'
    },
    installationRequirements: {
      laborHours: 4,
      skillLevel: 'licensed',
      tools: ['Voltage Tester', 'Wire Strippers', 'Torque Screwdriver', 'Level'],
      relatedComponents: ['ELEC-BREAKER-20A-1P', 'ELEC-BREAKER-30A-2P', 'ELEC-GROUND-BAR'],
      notes: 'Must be installed by licensed electrician. Requires permit.'
    },
    certifications: ['UL Listed', 'NEMA Compliant'],
    documentation: {
      datasheet: 'https://download.schneider-electric.com/files?p_Doc_Ref=QO142M200PC',
      installGuide: 'https://www.se.com/us/en/download/document/QO-LoadCenter-Install/'
    }
  },

  'ELEC-WIRE-12AWG-THHN': {
    id: 'ELEC-WIRE-12AWG-THHN',
    category: 'electrical-components',
    type: 'Building Wire',
    manufacturer: 'Southwire',
    model: '12 AWG THHN',
    sku: '11587401',
    description: '12 AWG THHN Copper Wire, Black, 500ft',
    specifications: {
      gauge: '12 AWG',
      conductor: 'Copper',
      insulation: 'THHN/THWN-2',
      voltage: '600V',
      temperature: '90°C Dry / 75°C Wet',
      color: 'Black',
      stranded: true,
      length: 500 // feet
    },
    weight: 16.5,
    dimensions: { length: 12, width: 12, height: 6 }, // spool dimensions
    price: 125.00,
    leadTime: 1,
    supplier: {
      name: 'Home Depot Pro',
      contact: 'Pro Desk',
      phone: '800-HOME-DEPOT',
      email: 'pro@homedepot.com',
      website: 'https://www.homedepotpro.com'
    },
    installationRequirements: {
      laborHours: 0.02, // per foot
      skillLevel: 'licensed',
      tools: ['Wire Strippers', 'Cable Puller', 'Fish Tape'],
      relatedComponents: ['ELEC-CONDUIT-3/4', 'ELEC-CONNECTOR-3/4'],
      notes: 'Use appropriate conduit for installation type'
    },
    certifications: ['UL Listed', 'RoHS Compliant'],
    documentation: {
      datasheet: 'https://www.southwire.com/products/12-awg-thhn'
    }
  },

  // Control Systems
  'CONTROL-TROLMASTER-HCS2': {
    id: 'CONTROL-TROLMASTER-HCS2',
    category: 'control-systems',
    type: 'Environmental Controller',
    manufacturer: 'TrolMaster',
    model: 'Hydro-X Pro HCS-2',
    sku: 'HCS-2',
    description: 'Professional Environmental Control System with Cloud Connectivity',
    specifications: {
      channels: 16,
      sensors: ['Temperature', 'Humidity', 'CO2', 'Light'],
      outputs: '16 x 120V @ 15A',
      connectivity: ['Ethernet', 'WiFi', 'RS485'],
      display: '7" Touch Screen',
      dataLogging: 'Unlimited Cloud Storage',
      zones: 50
    },
    weight: 8.5,
    dimensions: { length: 12, width: 10, height: 3 },
    price: 2495.00,
    leadTime: 7,
    supplier: {
      name: 'TrolMaster',
      contact: 'Sales Department',
      phone: '888-224-3317',
      email: 'sales@trolmaster.com',
      website: 'https://www.trolmaster.com'
    },
    installationRequirements: {
      laborHours: 4,
      skillLevel: 'intermediate',
      tools: ['Screwdriver', 'Wire Strippers', 'Network Cable Tester'],
      relatedComponents: ['CONTROL-SENSOR-TEMP', 'CONTROL-SENSOR-CO2', 'CONTROL-RELAY-BOX'],
      notes: 'Configure network settings before installation. Follow zone mapping diagram.'
    },
    certifications: ['UL Listed', 'FCC Part 15', 'CE'],
    documentation: {
      datasheet: 'https://www.trolmaster.com/downloads/HCS-2-datasheet.pdf',
      installGuide: 'https://www.trolmaster.com/downloads/HCS-2-manual.pdf'
    }
  },

  // Structural Components
  'STRUCT-BEAM-CLAMP-3/8': {
    id: 'STRUCT-BEAM-CLAMP-3/8',
    category: 'structural',
    type: 'Beam Clamp',
    manufacturer: 'Empire',
    model: 'BC-200',
    sku: 'BC-200-38',
    description: 'Malleable Iron Beam Clamp, 3/8" Rod, 2" Max Flange',
    specifications: {
      rodSize: '3/8-16',
      flangeThickness: '0.125" to 2"',
      loadRating: 600, // lbs
      material: 'Malleable Iron',
      finish: 'Electro-galvanized',
      setScrew: 'Hardened Cup Point'
    },
    weight: 0.5,
    dimensions: { length: 2.5, width: 2, height: 2 },
    price: 8.75,
    leadTime: 1,
    supplier: {
      name: 'McMaster-Carr',
      contact: 'Customer Service',
      phone: '630-833-0300',
      email: 'sales@mcmaster.com',
      website: 'https://www.mcmaster.com'
    },
    installationRequirements: {
      laborHours: 0.15,
      skillLevel: 'basic',
      tools: ['3/8" Wrench', 'Torque Wrench'],
      relatedComponents: ['STRUCT-THREADED-ROD-3/8', 'STRUCT-NUT-3/8'],
      notes: 'Torque to 20 ft-lbs. Do not exceed rated load.'
    },
    certifications: ['Factory Mutual Approved'],
    documentation: {
      datasheet: 'https://www.empireindustries.com/bc-200-spec.pdf'
    }
  }
};

// Helper functions for construction calculations
export class ConstructionCalculator {
  /**
   * Calculate total material cost including markup
   */
  static calculateMaterialCost(
    components: Array<{ sku: string; quantity: number }>,
    markupPercent: number = 15
  ): {
    subtotal: number;
    markup: number;
    total: number;
    breakdown: Array<{ sku: string; description: string; quantity: number; unitPrice: number; total: number }>;
  } {
    let subtotal = 0;
    const breakdown: Array<{ sku: string; description: string; quantity: number; unitPrice: number; total: number }> = [];

    for (const item of components) {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        const itemTotal = component.price * item.quantity;
        subtotal += itemTotal;
        breakdown.push({
          sku: item.sku,
          description: component.description,
          quantity: item.quantity,
          unitPrice: component.price,
          total: itemTotal
        });
      }
    }

    const markup = subtotal * (markupPercent / 100);
    const total = subtotal + markup;

    return { subtotal, markup, total, breakdown };
  }

  /**
   * Calculate labor hours and cost
   */
  static calculateLaborCost(
    components: Array<{ sku: string; quantity: number }>,
    laborRates: { basic: number; intermediate: number; advanced: number; licensed: number }
  ): {
    totalHours: number;
    totalCost: number;
    breakdown: Array<{ skill: string; hours: number; rate: number; cost: number }>;
  } {
    const hoursBySkill: Record<string, number> = {
      basic: 0,
      intermediate: 0,
      advanced: 0,
      licensed: 0
    };

    for (const item of components) {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        const skill = component.installationRequirements.skillLevel;
        hoursBySkill[skill] += component.installationRequirements.laborHours * item.quantity;
      }
    }

    let totalHours = 0;
    let totalCost = 0;
    const breakdown: Array<{ skill: string; hours: number; rate: number; cost: number }> = [];

    for (const [skill, hours] of Object.entries(hoursBySkill)) {
      if (hours > 0) {
        const rate = laborRates[skill as keyof typeof laborRates];
        const cost = hours * rate;
        totalHours += hours;
        totalCost += cost;
        breakdown.push({ skill, hours, rate, cost });
      }
    }

    return { totalHours, totalCost, breakdown };
  }

  /**
   * Generate complete BOM with all related components
   */
  static generateCompleteBOM(
    primaryComponents: Array<{ sku: string; quantity: number }>
  ): Array<{ sku: string; quantity: number; category: string }> {
    const bom = new Map<string, { quantity: number; category: string }>();

    // Add primary components
    for (const item of primaryComponents) {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        const existing = bom.get(item.sku) || { quantity: 0, category: component.category };
        bom.set(item.sku, {
          quantity: existing.quantity + item.quantity,
          category: component.category
        });

        // Add related components
        for (const relatedSku of component.installationRequirements.relatedComponents) {
          const relatedComponent = CONSTRUCTION_COMPONENTS[relatedSku];
          if (relatedComponent) {
            const relatedExisting = bom.get(relatedSku) || { quantity: 0, category: relatedComponent.category };
            // Assume 1:1 ratio unless specified otherwise
            bom.set(relatedSku, {
              quantity: relatedExisting.quantity + item.quantity,
              category: relatedComponent.category
            });
          }
        }
      }
    }

    // Convert map to array
    return Array.from(bom.entries()).map(([sku, data]) => ({
      sku,
      quantity: data.quantity,
      category: data.category
    }));
  }

  /**
   * Check structural load requirements
   */
  static checkStructuralLoad(
    components: Array<{ sku: string; quantity: number; location: { x: number; y: number } }>,
    maxLoadPerSqFt: number = 10 // lbs/sq.ft
  ): {
    totalWeight: number;
    loadDistribution: Array<{ zone: string; weight: number; area: number; loadPerSqFt: number }>;
    warnings: string[];
  } {
    let totalWeight = 0;
    const warnings: string[] = [];
    
    // Calculate total weight
    for (const item of components) {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        totalWeight += component.weight * item.quantity;
      }
    }

    // This is simplified - in reality would need structural analysis
    const loadPerSqFt = totalWeight / 1000; // Assuming 1000 sq ft area
    
    if (loadPerSqFt > maxLoadPerSqFt) {
      warnings.push(`Load exceeds maximum: ${loadPerSqFt.toFixed(1)} lbs/sq.ft > ${maxLoadPerSqFt} lbs/sq.ft`);
    }

    return {
      totalWeight,
      loadDistribution: [{
        zone: 'Main Growing Area',
        weight: totalWeight,
        area: 1000,
        loadPerSqFt
      }],
      warnings
    };
  }
}