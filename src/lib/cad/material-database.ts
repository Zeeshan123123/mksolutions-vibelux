/**
 * Material Database System
 * Comprehensive database of construction materials with properties and specifications
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { Material, MaterialCategory, UnitType } from './greenhouse-cad-system';

class MaterialDatabase {
  private materials: Map<string, Material> = new Map();
  private categories: Map<MaterialCategory, Material[]> = new Map();
  private suppliers: Map<string, string[]> = new Map(); // supplier -> material IDs

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize the material database with standard materials
   */
  private async initializeDatabase(): Promise<void> {
    await this.loadStructuralMaterials();
    await this.loadGlazingMaterials();
    await this.loadFoundationMaterials();
    await this.loadHardwareMaterials();
    await this.loadSealantMaterials();
    await this.indexMaterials();
  }

  /**
   * Load structural materials (steel, aluminum, wood)
   */
  private async loadStructuralMaterials(): Promise<void> {
    // Galvanized Steel - Various sizes
    const steelSizes = [
      { size: '2x2x0.125', weight: 1.65, price: 25 },
      { size: '2x4x0.125', weight: 2.05, price: 32 },
      { size: '4x4x0.125', weight: 3.07, price: 45 },
      { size: '6x6x0.125', weight: 4.57, price: 68 },
      { size: '2x2x0.1875', weight: 2.39, price: 38 },
      { size: '4x4x0.1875', weight: 4.32, price: 62 }
    ];

    for (const steel of steelSizes) {
      const material: Material = {
        id: `steel_${steel.size.replace(/[x.]/g, '_')}`,
        name: `Galvanized Steel Tube ${steel.size}`,
        manufacturer: 'Generic',
        model: steel.size,
        category: 'metal',
        properties: {
          thermal: {
            thermalExpansion: 0.0000065,
            uValue: 0.0 // Thermal bridge
          },
          structural: {
            tensileStrength: 58000,
            compressiveStrength: 58000,
            elasticModulus: 29000000,
            density: 490
          },
          optical: {},
          environmental: {
            weatherResistance: 25,
            fireRating: 'Non-combustible',
            recycledContent: 85
          }
        },
        specifications: {
          dimensions: {
            length: 240, // 20 feet in inches
            width: parseFloat(steel.size.split('x')[0]),
            thickness: parseFloat(steel.size.split('x')[2])
          },
          finish: 'Hot-dip galvanized',
          color: 'Galvanized silver',
          warranty: 25
        },
        availability: {
          regions: ['US', 'CA', 'MX'],
          leadTime: 7,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'each', price: steel.price },
            { quantity: 10, unit: 'each', price: steel.price * 0.9 },
            { quantity: 50, unit: 'each', price: steel.price * 0.8 },
            { quantity: 100, unit: 'each', price: steel.price * 0.75 }
          ]
        },
        suppliers: [
          {
            name: 'Steel Supply Co.',
            contact: 'sales@steelsupply.com',
            website: 'www.steelsupply.com',
            certifications: ['AISC', 'ASTM A500']
          },
          {
            name: 'Nucor Steel',
            contact: 'orders@nucor.com',
            website: 'www.nucor.com',
            certifications: ['AISC', 'ASTM A500', 'ISO 9001']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }

    // Aluminum Extrusions
    const aluminumProfiles = [
      { profile: '2x2x0.125', weight: 0.58, price: 35 },
      { profile: '2x4x0.125', weight: 0.71, price: 42 },
      { profile: '4x4x0.125', weight: 1.05, price: 58 },
      { profile: '6x6x0.250', weight: 2.14, price: 95 }
    ];

    for (const aluminum of aluminumProfiles) {
      const material: Material = {
        id: `aluminum_${aluminum.profile.replace(/[x.]/g, '_')}`,
        name: `Aluminum Extrusion ${aluminum.profile}`,
        manufacturer: 'Generic',
        model: aluminum.profile,
        category: 'metal',
        properties: {
          thermal: {
            thermalExpansion: 0.0000128,
            uValue: 0.0 // Thermal bridge
          },
          structural: {
            tensileStrength: 42000,
            compressiveStrength: 42000,
            elasticModulus: 10000000,
            density: 168
          },
          optical: {},
          environmental: {
            weatherResistance: 50,
            fireRating: 'Non-combustible',
            recycledContent: 95
          }
        },
        specifications: {
          dimensions: {
            length: 240, // 20 feet
            width: parseFloat(aluminum.profile.split('x')[0]),
            thickness: parseFloat(aluminum.profile.split('x')[2])
          },
          finish: 'Anodized',
          color: 'Natural aluminum',
          warranty: 20
        },
        availability: {
          regions: ['US', 'CA', 'MX'],
          leadTime: 10,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'each', price: aluminum.price },
            { quantity: 10, unit: 'each', price: aluminum.price * 0.92 },
            { quantity: 50, unit: 'each', price: aluminum.price * 0.85 }
          ]
        },
        suppliers: [
          {
            name: 'Aluminum Supply Inc.',
            contact: 'sales@aluminumsupply.com',
            website: 'www.aluminumsupply.com',
            certifications: ['ASTM B221', 'AA']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }

    // Pressure-treated lumber
    const lumberSizes = [
      { size: '2x4', weight: 1.28, price: 8 },
      { size: '2x6', weight: 1.92, price: 12 },
      { size: '2x8', weight: 2.56, price: 16 },
      { size: '4x4', weight: 2.56, price: 18 },
      { size: '6x6', weight: 5.76, price: 42 }
    ];

    for (const lumber of lumberSizes) {
      const material: Material = {
        id: `lumber_${lumber.size.replace('x', '_')}`,
        name: `Pressure Treated Lumber ${lumber.size}`,
        manufacturer: 'Generic',
        model: `${lumber.size} PT`,
        category: 'wood',
        properties: {
          thermal: {
            thermalExpansion: 0.0000033,
            rValue: 1.25 // per inch
          },
          structural: {
            tensileStrength: 1200,
            compressiveStrength: 1400,
            elasticModulus: 1600000,
            density: 35
          },
          optical: {},
          environmental: {
            weatherResistance: 20,
            fireRating: 'Combustible',
            recycledContent: 0
          }
        },
        specifications: {
          dimensions: {
            length: 96, // 8 feet
            width: parseFloat(lumber.size.split('x')[0]),
            thickness: parseFloat(lumber.size.split('x')[1])
          },
          finish: 'Pressure treated',
          color: 'Brown',
          warranty: 15
        },
        availability: {
          regions: ['US', 'CA'],
          leadTime: 3,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'each', price: lumber.price },
            { quantity: 10, unit: 'each', price: lumber.price * 0.95 },
            { quantity: 50, unit: 'each', price: lumber.price * 0.88 }
          ]
        },
        suppliers: [
          {
            name: 'Home Depot',
            contact: 'pro@homedepot.com',
            website: 'www.homedepot.com',
            certifications: ['ALSC']
          },
          {
            name: 'Lowes',
            contact: 'pro@lowes.com',
            website: 'www.lowes.com',
            certifications: ['ALSC']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }
  }

  /**
   * Load glazing materials (polycarbonate, glass, acrylic)
   */
  private async loadGlazingMaterials(): Promise<void> {
    // Polycarbonate panels
    const polycarbonateTypes = [
      { 
        type: 'twin_wall_6mm', 
        thickness: 6, 
        uValue: 0.65, 
        transmission: 82, 
        price: 3.50 
      },
      { 
        type: 'twin_wall_8mm', 
        thickness: 8, 
        uValue: 0.55, 
        transmission: 80, 
        price: 4.25 
      },
      { 
        type: 'twin_wall_10mm', 
        thickness: 10, 
        uValue: 0.48, 
        transmission: 78, 
        price: 5.10 
      },
      { 
        type: 'triple_wall_16mm', 
        thickness: 16, 
        uValue: 0.35, 
        transmission: 75, 
        price: 7.80 
      }
    ];

    for (const poly of polycarbonateTypes) {
      const material: Material = {
        id: `polycarbonate_${poly.type}`,
        name: `Polycarbonate ${poly.type.replace(/_/g, ' ')}`,
        manufacturer: 'Palram',
        model: `Suntuf ${poly.thickness}mm`,
        category: 'plastic',
        properties: {
          thermal: {
            uValue: poly.uValue,
            rValue: 1 / poly.uValue,
            thermalExpansion: 0.0000375
          },
          structural: {
            tensileStrength: 9000,
            compressiveStrength: 12000,
            elasticModulus: 350000,
            density: 75
          },
          optical: {
            lightTransmission: poly.transmission,
            solarHeatGain: 0.65,
            uvTransmission: 0.1
          },
          environmental: {
            weatherResistance: 15,
            fireRating: 'Class A',
            recycledContent: 0
          }
        },
        specifications: {
          dimensions: {
            length: 96, // 8 feet
            width: 48, // 4 feet
            thickness: poly.thickness / 25.4 // convert mm to inches
          },
          finish: 'Clear',
          color: 'Clear',
          warranty: 10
        },
        availability: {
          regions: ['US', 'CA', 'MX'],
          leadTime: 5,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'square_feet', price: poly.price },
            { quantity: 500, unit: 'square_feet', price: poly.price * 0.9 },
            { quantity: 1000, unit: 'square_feet', price: poly.price * 0.85 },
            { quantity: 5000, unit: 'square_feet', price: poly.price * 0.8 }
          ]
        },
        suppliers: [
          {
            name: 'Greenhouse Supply',
            contact: 'orders@greenhousesupply.com',
            website: 'www.greenhousesupply.com',
            certifications: ['ICC', 'ASTM D3935']
          },
          {
            name: 'Palram Direct',
            contact: 'sales@palram.com',
            website: 'www.palram.com',
            certifications: ['ICC', 'ASTM D3935', 'ISO 9001']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }

    // Tempered glass
    const glassTypes = [
      { thickness: 3, uValue: 1.1, transmission: 90, price: 6.50 },
      { thickness: 4, uValue: 1.0, transmission: 89, price: 7.25 },
      { thickness: 5, uValue: 0.95, transmission: 88, price: 8.10 },
      { thickness: 6, uValue: 0.90, transmission: 87, price: 9.75 }
    ];

    for (const glass of glassTypes) {
      const material: Material = {
        id: `tempered_glass_${glass.thickness}mm`,
        name: `Tempered Glass ${glass.thickness}mm`,
        manufacturer: 'Guardian Glass',
        model: `Tempered ${glass.thickness}mm`,
        category: 'glass',
        properties: {
          thermal: {
            uValue: glass.uValue,
            rValue: 1 / glass.uValue,
            thermalExpansion: 0.0000048
          },
          structural: {
            tensileStrength: 24000,
            compressiveStrength: 150000,
            elasticModulus: 10000000,
            density: 156
          },
          optical: {
            lightTransmission: glass.transmission,
            solarHeatGain: 0.85,
            uvTransmission: 0.05
          },
          environmental: {
            weatherResistance: 50,
            fireRating: 'Non-combustible',
            recycledContent: 20
          }
        },
        specifications: {
          dimensions: {
            length: 96, // 8 feet
            width: 48, // 4 feet
            thickness: glass.thickness / 25.4 // convert mm to inches
          },
          finish: 'Tempered',
          color: 'Clear',
          warranty: 10
        },
        availability: {
          regions: ['US', 'CA'],
          leadTime: 14,
          minimumOrder: 10,
          priceBreaks: [
            { quantity: 1, unit: 'square_feet', price: glass.price },
            { quantity: 200, unit: 'square_feet', price: glass.price * 0.95 },
            { quantity: 500, unit: 'square_feet', price: glass.price * 0.9 },
            { quantity: 1000, unit: 'square_feet', price: glass.price * 0.85 }
          ]
        },
        suppliers: [
          {
            name: 'Guardian Glass',
            contact: 'commercial@guardian.com',
            website: 'www.guardian.com',
            certifications: ['ASTM C1048', 'ANSI Z97.1']
          },
          {
            name: 'Pilkington',
            contact: 'sales@pilkington.com',
            website: 'www.pilkington.com',
            certifications: ['ASTM C1048', 'ANSI Z97.1']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }

    // Acrylic panels
    const acrylicTypes = [
      { thickness: 3, uValue: 1.2, transmission: 92, price: 4.80 },
      { thickness: 6, uValue: 1.0, transmission: 91, price: 8.50 },
      { thickness: 12, uValue: 0.8, transmission: 90, price: 15.20 }
    ];

    for (const acrylic of acrylicTypes) {
      const material: Material = {
        id: `acrylic_${acrylic.thickness}mm`,
        name: `Acrylic Panel ${acrylic.thickness}mm`,
        manufacturer: 'Plexiglas',
        model: `Plexiglas ${acrylic.thickness}mm`,
        category: 'plastic',
        properties: {
          thermal: {
            uValue: acrylic.uValue,
            rValue: 1 / acrylic.uValue,
            thermalExpansion: 0.000039
          },
          structural: {
            tensileStrength: 10000,
            compressiveStrength: 18000,
            elasticModulus: 450000,
            density: 74
          },
          optical: {
            lightTransmission: acrylic.transmission,
            solarHeatGain: 0.88,
            uvTransmission: 0.02
          },
          environmental: {
            weatherResistance: 20,
            fireRating: 'Class CC1',
            recycledContent: 0
          }
        },
        specifications: {
          dimensions: {
            length: 96, // 8 feet
            width: 48, // 4 feet
            thickness: acrylic.thickness / 25.4 // convert mm to inches
          },
          finish: 'Clear',
          color: 'Clear',
          warranty: 15
        },
        availability: {
          regions: ['US', 'CA'],
          leadTime: 7,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'square_feet', price: acrylic.price },
            { quantity: 100, unit: 'square_feet', price: acrylic.price * 0.92 },
            { quantity: 500, unit: 'square_feet', price: acrylic.price * 0.88 }
          ]
        },
        suppliers: [
          {
            name: 'Plexiglas Direct',
            contact: 'orders@plexiglas.com',
            website: 'www.plexiglas.com',
            certifications: ['ASTM D4802']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }
  }

  /**
   * Load foundation materials (concrete, gravel, insulation)
   */
  private async loadFoundationMaterials(): Promise<void> {
    // Concrete types
    const concreteTypes = [
      { strength: 3000, price: 110, description: 'Standard concrete' },
      { strength: 4000, price: 120, description: 'High strength concrete' },
      { strength: 5000, price: 135, description: 'High performance concrete' }
    ];

    for (const concrete of concreteTypes) {
      const material: Material = {
        id: `concrete_${concrete.strength}psi`,
        name: `Concrete ${concrete.strength} PSI`,
        manufacturer: 'Ready Mix',
        model: `${concrete.strength} PSI`,
        category: 'concrete',
        properties: {
          thermal: {
            uValue: 0.08,
            rValue: 0.125,
            thermalExpansion: 0.0000055
          },
          structural: {
            tensileStrength: concrete.strength * 0.1,
            compressiveStrength: concrete.strength,
            elasticModulus: 57000 * Math.sqrt(concrete.strength),
            density: 150
          },
          optical: {},
          environmental: {
            weatherResistance: 100,
            fireRating: 'Non-combustible',
            recycledContent: 15
          }
        },
        specifications: {
          dimensions: {
            length: 0,
            width: 0,
            thickness: 0
          },
          finish: 'Smooth trowel',
          color: 'Gray',
          warranty: 50
        },
        availability: {
          regions: ['US', 'CA', 'MX'],
          leadTime: 1,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'cubic_feet', price: concrete.price / 27 },
            { quantity: 10, unit: 'cubic_feet', price: concrete.price * 0.95 / 27 },
            { quantity: 50, unit: 'cubic_feet', price: concrete.price * 0.9 / 27 }
          ]
        },
        suppliers: [
          {
            name: 'Local Ready Mix',
            contact: 'dispatch@readymix.com',
            website: 'www.readymix.com',
            certifications: ['ASTM C94', 'NRMCA']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }

    // Gravel types
    const gravelTypes = [
      { size: '3/4_inch', price: 35, description: 'Crushed stone base' },
      { size: '1/2_inch', price: 38, description: 'Pea gravel' },
      { size: '1/4_inch', price: 42, description: 'Screening gravel' }
    ];

    for (const gravel of gravelTypes) {
      const material: Material = {
        id: `gravel_${gravel.size}`,
        name: `Gravel ${gravel.size.replace('_', ' ')}`,
        manufacturer: 'Quarry',
        model: gravel.size,
        category: 'concrete',
        properties: {
          thermal: {
            uValue: 0.1,
            rValue: 0.6
          },
          structural: {
            compressiveStrength: 2000,
            density: 110
          },
          optical: {},
          environmental: {
            weatherResistance: 100,
            fireRating: 'Non-combustible',
            recycledContent: 90
          }
        },
        specifications: {
          dimensions: {
            length: 0,
            width: 0,
            thickness: 0
          },
          finish: 'Crushed',
          color: 'Gray',
          warranty: 0
        },
        availability: {
          regions: ['US', 'CA'],
          leadTime: 2,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'cubic_feet', price: gravel.price / 27 },
            { quantity: 10, unit: 'cubic_feet', price: gravel.price * 0.9 / 27 }
          ]
        },
        suppliers: [
          {
            name: 'Local Quarry',
            contact: 'sales@quarry.com',
            website: 'www.quarry.com',
            certifications: ['ASTM C33']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }
  }

  /**
   * Load hardware materials (bolts, screws, brackets)
   */
  private async loadHardwareMaterials(): Promise<void> {
    // Bolts
    const boltTypes = [
      { size: '1/4_x_1', price: 0.25, description: 'Hex bolt galvanized' },
      { size: '1/4_x_2', price: 0.35, description: 'Hex bolt galvanized' },
      { size: '3/8_x_2', price: 0.55, description: 'Hex bolt galvanized' },
      { size: '1/2_x_3', price: 0.85, description: 'Hex bolt galvanized' },
      { size: '5/8_x_4', price: 1.25, description: 'Hex bolt galvanized' }
    ];

    for (const bolt of boltTypes) {
      const material: Material = {
        id: `bolt_${bolt.size}`,
        name: `Hex Bolt ${bolt.size.replace('_', '" x ')}"`,
        manufacturer: 'Fastenal',
        model: bolt.size,
        category: 'hardware',
        properties: {
          thermal: {},
          structural: {
            tensileStrength: 60000,
            density: 490
          },
          optical: {},
          environmental: {
            weatherResistance: 25,
            fireRating: 'Non-combustible',
            recycledContent: 75
          }
        },
        specifications: {
          dimensions: {
            length: parseFloat(bolt.size.split('_x_')[1]),
            diameter: parseFloat(bolt.size.split('_x_')[0].replace('_', '.'))
          },
          finish: 'Hot-dip galvanized',
          color: 'Galvanized',
          warranty: 5
        },
        availability: {
          regions: ['US', 'CA', 'MX'],
          leadTime: 1,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'each', price: bolt.price },
            { quantity: 100, unit: 'each', price: bolt.price * 0.8 },
            { quantity: 500, unit: 'each', price: bolt.price * 0.7 }
          ]
        },
        suppliers: [
          {
            name: 'Fastenal',
            contact: 'orders@fastenal.com',
            website: 'www.fastenal.com',
            certifications: ['ASTM A307', 'ASTM F593']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }

    // Structural screws
    const screwTypes = [
      { size: '10_x_2', price: 0.15, description: 'Self-drilling screw' },
      { size: '10_x_3', price: 0.20, description: 'Self-drilling screw' },
      { size: '12_x_2', price: 0.18, description: 'Self-drilling screw' },
      { size: '14_x_3', price: 0.25, description: 'Self-drilling screw' }
    ];

    for (const screw of screwTypes) {
      const material: Material = {
        id: `screw_${screw.size}`,
        name: `Self-Drilling Screw #${screw.size.replace('_', ' x ')}"`,
        manufacturer: 'Simpson Strong-Tie',
        model: screw.size,
        category: 'hardware',
        properties: {
          thermal: {},
          structural: {
            tensileStrength: 50000,
            density: 490
          },
          optical: {},
          environmental: {
            weatherResistance: 20,
            fireRating: 'Non-combustible',
            recycledContent: 70
          }
        },
        specifications: {
          dimensions: {
            length: parseFloat(screw.size.split('_x_')[1]),
            diameter: parseFloat(screw.size.split('_x_')[0]) / 10
          },
          finish: 'Zinc plated',
          color: 'Silver',
          warranty: 5
        },
        availability: {
          regions: ['US', 'CA'],
          leadTime: 2,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'each', price: screw.price },
            { quantity: 100, unit: 'each', price: screw.price * 0.85 },
            { quantity: 500, unit: 'each', price: screw.price * 0.75 }
          ]
        },
        suppliers: [
          {
            name: 'Simpson Strong-Tie',
            contact: 'orders@strongtie.com',
            website: 'www.strongtie.com',
            certifications: ['ICC-ES', 'ASTM F1575']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }
  }

  /**
   * Load sealant materials (glazing tape, caulk, gaskets)
   */
  private async loadSealantMaterials(): Promise<void> {
    // Glazing tape
    const tapeSizes = [
      { width: 1, thickness: 0.125, price: 2.50 },
      { width: 2, thickness: 0.125, price: 4.80 },
      { width: 1, thickness: 0.25, price: 3.20 },
      { width: 2, thickness: 0.25, price: 5.95 }
    ];

    for (const tape of tapeSizes) {
      const material: Material = {
        id: `glazing_tape_${tape.width}x${tape.thickness}`,
        name: `Glazing Tape ${tape.width}" x ${tape.thickness}"`,
        manufacturer: '3M',
        model: `VHB ${tape.width}x${tape.thickness}`,
        category: 'sealant',
        properties: {
          thermal: {
            uValue: 0.2
          },
          structural: {
            tensileStrength: 400,
            density: 65
          },
          optical: {},
          environmental: {
            weatherResistance: 20,
            fireRating: 'Class A',
            recycledContent: 0
          }
        },
        specifications: {
          dimensions: {
            length: 1200, // 100 feet
            width: tape.width,
            thickness: tape.thickness
          },
          finish: 'Adhesive',
          color: 'Clear',
          warranty: 10
        },
        availability: {
          regions: ['US', 'CA'],
          leadTime: 3,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'linear_feet', price: tape.price / 100 },
            { quantity: 500, unit: 'linear_feet', price: tape.price * 0.9 / 100 },
            { quantity: 1000, unit: 'linear_feet', price: tape.price * 0.85 / 100 }
          ]
        },
        suppliers: [
          {
            name: '3M',
            contact: 'industrial@3m.com',
            website: 'www.3m.com',
            certifications: ['ASTM D1000', 'AAMA 812']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }

    // Structural sealant
    const sealantTypes = [
      { type: 'structural', price: 12.50, description: 'High-strength structural sealant' },
      { type: 'weather', price: 8.25, description: 'Weather-resistant sealant' },
      { type: 'glazing', price: 15.80, description: 'Glazing compound' }
    ];

    for (const sealant of sealantTypes) {
      const material: Material = {
        id: `sealant_${sealant.type}`,
        name: `${sealant.type} Sealant`,
        manufacturer: 'Dow Corning',
        model: sealant.type,
        category: 'sealant',
        properties: {
          thermal: {
            uValue: 0.15
          },
          structural: {
            tensileStrength: 200,
            density: 90
          },
          optical: {},
          environmental: {
            weatherResistance: 25,
            fireRating: 'Class A',
            recycledContent: 5
          }
        },
        specifications: {
          dimensions: {
            length: 0,
            width: 0,
            thickness: 0
          },
          finish: 'Cured rubber',
          color: 'Clear',
          warranty: 20
        },
        availability: {
          regions: ['US', 'CA', 'MX'],
          leadTime: 2,
          minimumOrder: 1,
          priceBreaks: [
            { quantity: 1, unit: 'each', price: sealant.price },
            { quantity: 12, unit: 'each', price: sealant.price * 0.92 },
            { quantity: 24, unit: 'each', price: sealant.price * 0.88 }
          ]
        },
        suppliers: [
          {
            name: 'Dow Corning',
            contact: 'construction@dow.com',
            website: 'www.dow.com',
            certifications: ['ASTM C920', 'AAMA 802.3']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.materials.set(material.id, material);
    }
  }

  /**
   * Index materials by category and supplier
   */
  private async indexMaterials(): Promise<void> {
    // Index by category
    for (const material of this.materials.values()) {
      const category = material.category;
      const categoryMaterials = this.categories.get(category) || [];
      categoryMaterials.push(material);
      this.categories.set(category, categoryMaterials);
      
      // Index by supplier
      for (const supplier of material.suppliers) {
        const supplierMaterials = this.suppliers.get(supplier.name) || [];
        supplierMaterials.push(material.id);
        this.suppliers.set(supplier.name, supplierMaterials);
      }
    }
  }

  /**
   * Get material by ID
   */
  getMaterial(id: string): Material | undefined {
    return this.materials.get(id);
  }

  /**
   * Get materials by category
   */
  getMaterialsByCategory(category: MaterialCategory): Material[] {
    return this.categories.get(category) || [];
  }

  /**
   * Get materials by supplier
   */
  getMaterialsBySupplier(supplierName: string): Material[] {
    const materialIds = this.suppliers.get(supplierName) || [];
    return materialIds.map(id => this.materials.get(id)!).filter(Boolean);
  }

  /**
   * Search materials by name or description
   */
  searchMaterials(query: string): Material[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.materials.values()).filter(material => 
      material.name.toLowerCase().includes(lowerQuery) ||
      material.manufacturer.toLowerCase().includes(lowerQuery) ||
      material.model.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all materials
   */
  getAllMaterials(): Material[] {
    return Array.from(this.materials.values());
  }

  /**
   * Get material count
   */
  getMaterialCount(): number {
    return this.materials.size;
  }

  /**
   * Get categories
   */
  getCategories(): MaterialCategory[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get suppliers
   */
  getSuppliers(): string[] {
    return Array.from(this.suppliers.keys());
  }

  /**
   * Calculate material cost with quantity breaks
   */
  calculateMaterialCost(materialId: string, quantity: number, unit: UnitType): number {
    const material = this.materials.get(materialId);
    if (!material) return 0;

    // Find applicable price break
    const priceBreaks = material.availability.priceBreaks
      .filter(pb => pb.unit === unit)
      .sort((a, b) => b.quantity - a.quantity);

    let applicablePrice = 0;
    for (const priceBreak of priceBreaks) {
      if (quantity >= priceBreak.quantity) {
        applicablePrice = priceBreak.price;
        break;
      }
    }

    // If no price break found, use the smallest quantity price
    if (applicablePrice === 0 && priceBreaks.length > 0) {
      applicablePrice = priceBreaks[priceBreaks.length - 1].price;
    }

    return applicablePrice * quantity;
  }

  /**
   * Add custom material
   */
  async addMaterial(material: Material): Promise<void> {
    this.materials.set(material.id, material);
    
    // Update category index
    const categoryMaterials = this.categories.get(material.category) || [];
    categoryMaterials.push(material);
    this.categories.set(material.category, categoryMaterials);
    
    // Update supplier index
    for (const supplier of material.suppliers) {
      const supplierMaterials = this.suppliers.get(supplier.name) || [];
      supplierMaterials.push(material.id);
      this.suppliers.set(supplier.name, supplierMaterials);
    }
    
    // Save to database
    await this.saveMaterial(material);
  }

  /**
   * Update material
   */
  async updateMaterial(material: Material): Promise<void> {
    material.updatedAt = new Date();
    this.materials.set(material.id, material);
    await this.saveMaterial(material);
  }

  /**
   * Save material to database
   */
  private async saveMaterial(material: Material): Promise<void> {
    await prisma.material.upsert({
      where: { id: material.id },
      create: material,
      update: material
    });
  }

  /**
   * Load materials from database
   */
  async loadFromDatabase(): Promise<void> {
    const materials = await prisma.material.findMany();
    
    for (const material of materials) {
      this.materials.set(material.id, material as Material);
    }
    
    await this.indexMaterials();
  }
}

export { MaterialDatabase };
export default MaterialDatabase;