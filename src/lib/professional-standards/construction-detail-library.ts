/**
 * Professional Construction Detail Library
 * Comprehensive library of buildable construction details for greenhouse projects
 * Based on industry standards and professional practices
 */

export interface ConstructionDetail {
  id: string;
  title: string;
  category: DetailCategory;
  scale: string;
  description: string;
  drawing: DetailDrawing;
  specifications: MaterialSpecification[];
  notes: string[];
  codeReferences: CodeReference[];
  applicability: string[];
  revision: number;
  lastUpdated: Date;
}

export type DetailCategory = 
  | 'foundation'
  | 'structural'
  | 'glazing'
  | 'roofing' 
  | 'mechanical'
  | 'electrical'
  | 'irrigation'
  | 'ventilation'
  | 'doors'
  | 'connections'
  | 'drainage'
  | 'insulation';

export interface DetailDrawing {
  elements: DrawingElement[];
  dimensions: Dimension[];
  annotations: Annotation[];
  materialCallouts: MaterialCallout[];
}

export interface DrawingElement {
  type: 'line' | 'arc' | 'rectangle' | 'circle' | 'polyline' | 'hatch';
  geometry: number[][];
  lineWeight: number;
  lineType: 'solid' | 'dashed' | 'dotted' | 'hidden';
  color: string;
  layer: string;
}

export interface Dimension {
  points: [number, number][];
  value: string;
  tolerance?: string;
  unit: 'inches' | 'feet' | 'mm' | 'meters';
  precision: number;
}

export interface Annotation {
  position: [number, number];
  text: string;
  fontSize: number;
  style: 'normal' | 'bold' | 'italic';
  leader?: [number, number][];
}

export interface MaterialCallout {
  position: [number, number];
  materialId: string;
  quantity?: string;
  notes?: string;
}

export interface MaterialSpecification {
  id: string;
  name: string;
  description: string;
  manufacturer?: string;
  model?: string;
  grade?: string;
  size?: string;
  finish?: string;
  properties: MaterialProperties;
  installation: InstallationRequirements;
  codes: CodeCompliance[];
  cost: CostData;
}

export interface MaterialProperties {
  structural?: {
    yieldStrength?: number;
    tensileStrength?: number;
    compressiveStrength?: number;
    elasticModulus?: number;
    density?: number;
  };
  thermal?: {
    conductivity?: number;
    resistance?: number;
    expansion?: number;
    maxTemp?: number;
    minTemp?: number;
  };
  environmental?: {
    weatherResistance?: string;
    corrosionResistance?: string;
    uvResistance?: string;
    fireRating?: string;
  };
}

export interface InstallationRequirements {
  tools: string[];
  skills: string[];
  safety: string[];
  sequence: string[];
  special: string[];
}

export interface CodeReference {
  code: string; // e.g., "IBC 2021", "ASCE 7-16", "NEC 2023"
  section: string;
  requirement: string;
  compliance: string;
}

export interface CodeCompliance {
  standard: string;
  certification?: string;
  testReport?: string;
  rating?: string;
}

export interface CostData {
  unitCost: number;
  unit: string;
  laborHours?: number;
  equipmentCost?: number;
  lastUpdated: Date;
  source: string;
}

/**
 * Professional Construction Detail Library
 * Contains industry-standard buildable details
 */
export class ConstructionDetailLibrary {
  private details: Map<string, ConstructionDetail> = new Map();

  constructor() {
    this.initializeStandardDetails();
  }

  private initializeStandardDetails(): void {
    // Foundation Details
    this.addDetail(this.createFoundationDetail());
    this.addDetail(this.createAnchorBoltDetail());
    this.addDetail(this.createFootingDetail());
    
    // Structural Details  
    this.addDetail(this.createBeamConnectionDetail());
    this.addDetail(this.createColumnBaseDetail());
    this.addDetail(this.createTrussConnectionDetail());
    
    // Glazing Details
    this.addDetail(this.createGlazingGasketDetail());
    this.addDetail(this.createSillFlashingDetail());
    this.addDetail(this.createRidgeCapDetail());
    
    // Mechanical Details
    this.addDetail(this.createHVACMountingDetail());
    this.addDetail(this.createDuctSupportDetail());
    this.addDetail(this.createVentilationDetail());
    
    // Electrical Details
    this.addDetail(this.createFixtureMountingDetail());
    this.addDetail(this.createConduitRoutingDetail());
    this.addDetail(this.createGroundingDetail());
    
    // Irrigation Details
    this.addDetail(this.createIrrigationConnectionDetail());
    this.addDetail(this.createDrainageDetail());
    this.addDetail(this.createBackflowPreventerDetail());
  }

  private createFoundationDetail(): ConstructionDetail {
    return {
      id: 'FND-001',
      title: 'CONTINUOUS FOUNDATION WITH ANCHOR BOLTS',
      category: 'foundation',
      scale: '1" = 1\'-0"',
      description: 'Standard continuous concrete foundation with embedded anchor bolts for greenhouse column attachment',
      drawing: {
        elements: [
          // Foundation wall
          {
            type: 'rectangle',
            geometry: [[0, 0], [24, 36]],
            lineWeight: 0.016,
            lineType: 'solid',
            color: '#000000',
            layer: 'foundation'
          },
          // Footing
          {
            type: 'rectangle', 
            geometry: [[-6, -12], [36, 0]],
            lineWeight: 0.016,
            lineType: 'solid',
            color: '#000000',
            layer: 'foundation'
          },
          // Anchor bolts
          {
            type: 'circle',
            geometry: [[6, 18], [18, 18]],
            lineWeight: 0.008,
            lineType: 'solid',
            color: '#000000',
            layer: 'hardware'
          },
          // Reinforcement
          {
            type: 'line',
            geometry: [[3, 3], [21, 3], [21, 33], [3, 33], [3, 3]],
            lineWeight: 0.004,
            lineType: 'dashed',
            color: '#FF0000',
            layer: 'reinforcement'
          }
        ],
        dimensions: [
          {
            points: [[0, 0], [24, 0]],
            value: '2\'-0"',
            unit: 'inches',
            precision: 1
          },
          {
            points: [[0, 0], [0, 36]], 
            value: '3\'-0"',
            unit: 'inches',
            precision: 1
          },
          {
            points: [[-6, -12], [36, -12]],
            value: '3\'-6"',
            unit: 'inches', 
            precision: 1
          }
        ],
        annotations: [
          {
            position: [12, 40],
            text: '4000 PSI CONCRETE',
            fontSize: 8,
            style: 'normal'
          },
          {
            position: [30, 18],
            text: '1/2" Ø x 12" ANCHOR BOLT\nEMBED 8" MIN.',
            fontSize: 6,
            style: 'normal',
            leader: [[30, 18], [18, 18]]
          },
          {
            position: [12, -18],
            text: 'FOOTING BELOW FROST LINE\nMIN. 36" BELOW GRADE',
            fontSize: 6,
            style: 'normal'
          }
        ],
        materialCallouts: [
          {
            position: [6, 6],
            materialId: 'CONC-4000',
            quantity: '0.25 CY/LF'
          },
          {
            position: [18, 18],
            materialId: 'BOLT-SS-05',
            quantity: '2 EA @ 4\' O.C.'
          }
        ]
      },
      specifications: [
        {
          id: 'CONC-4000',
          name: 'Structural Concrete',
          description: '4000 PSI concrete with air entrainment',
          grade: '4000 PSI',
          properties: {
            structural: {
              compressiveStrength: 4000,
              tensileStrength: 400,
              elasticModulus: 3600000,
              density: 150
            }
          },
          installation: {
            tools: ['Concrete mixer', 'Vibrator', 'Screeds', 'Floats'],
            skills: ['Certified concrete finisher'],
            safety: ['Fall protection', 'Chemical protection'],
            sequence: ['Excavation', 'Formwork', 'Reinforcement', 'Pour', 'Cure'],
            special: ['Minimum 28-day cure time', 'Temperature protection']
          },
          codes: [
            {
              standard: 'ACI 318',
              certification: 'Ready-mix certification',
              rating: '4000 PSI @ 28 days'
            }
          ],
          cost: {
            unitCost: 125.0,
            unit: 'CY',
            laborHours: 2.5,
            lastUpdated: new Date(),
            source: 'RSMeans 2024'
          }
        }
      ],
      notes: [
        'Foundation to be designed by licensed structural engineer',
        'Verify frost depth with local building department',
        'Install vapor barrier under slab where required',
        'Anchor bolt pattern must match column base plate',
        'Concrete cure time minimum 28 days before loading'
      ],
      codeReferences: [
        {
          code: 'IBC 2021',
          section: '1805',
          requirement: 'Foundation design requirements',
          compliance: 'Designed per ACI 318 with engineer stamp'
        },
        {
          code: 'ACI 318-19',
          section: '7.7',
          requirement: 'Minimum concrete cover',
          compliance: '3" clear cover to reinforcement'
        }
      ],
      applicability: ['All greenhouse structures', 'Permanent foundations'],
      revision: 3,
      lastUpdated: new Date()
    };
  }

  private createGlazingGasketDetail(): ConstructionDetail {
    return {
      id: 'GLZ-001',
      title: 'STRUCTURAL GLAZING GASKET DETAIL',
      category: 'glazing',
      scale: '3" = 1\'-0"',
      description: 'Professional structural glazing connection with weatherproof gasket system',
      drawing: {
        elements: [
          // Aluminum frame
          {
            type: 'rectangle',
            geometry: [[0, 0], [6, 24]],
            lineWeight: 0.012,
            lineType: 'solid',
            color: '#666666',
            layer: 'frame'
          },
          // Glass panel
          {
            type: 'rectangle',
            geometry: [[6, 2], [18, 22]],
            lineWeight: 0.004,
            lineType: 'solid',
            color: '#0066CC',
            layer: 'glazing'
          },
          // Gasket
          {
            type: 'polyline',
            geometry: [[6, 1], [7, 1], [8, 2], [8, 22], [7, 23], [6, 23]],
            lineWeight: 0.008,
            lineType: 'solid',
            color: '#000000',
            layer: 'sealant'
          },
          // Drainage channel
          {
            type: 'rectangle',
            geometry: [[1, 1], [5, 3]],
            lineWeight: 0.004,
            lineType: 'solid',
            color: '#888888',
            layer: 'drainage'
          }
        ],
        dimensions: [
          {
            points: [[0, 0], [6, 0]],
            value: '2"',
            unit: 'inches',
            precision: 2
          },
          {
            points: [[6, 2], [18, 2]],
            value: '4"',
            unit: 'inches',
            precision: 2
          }
        ],
        annotations: [
          {
            position: [12, 26],
            text: 'TEMPERED SAFETY GLASS\n6MM THICK MIN.',
            fontSize: 6,
            style: 'normal',
            leader: [[12, 26], [12, 12]]
          },
          {
            position: [20, 12],
            text: 'STRUCTURAL GLAZING\nGASKET - EPDM',
            fontSize: 6,
            style: 'normal',
            leader: [[20, 12], [7, 12]]
          },
          {
            position: [3, -2],
            text: 'WEEP HOLES\n@ 24" O.C.',
            fontSize: 6,
            style: 'normal',
            leader: [[3, -2], [3, 2]]
          }
        ],
        materialCallouts: [
          {
            position: [12, 12],
            materialId: 'GLASS-TEMP-6',
            quantity: '1 SF/SF'
          },
          {
            position: [7, 12],
            materialId: 'GASKET-EPDM',
            quantity: '2 LF/SF'
          }
        ]
      },
      specifications: [
        {
          id: 'GLASS-TEMP-6',
          name: 'Tempered Safety Glass',
          description: '6mm tempered safety glass for greenhouse glazing',
          manufacturer: 'Guardian Glass',
          grade: 'Tempered',
          size: '6mm thick',
          properties: {
            structural: {
              tensileStrength: 24000,
              compressiveStrength: 120000
            },
            thermal: {
              conductivity: 1.0,
              expansion: 9.0,
              maxTemp: 300,
              minTemp: -40
            },
            environmental: {
              weatherResistance: 'Excellent',
              uvResistance: 'High transmittance',
              fireRating: 'Non-combustible'
            }
          },
          installation: {
            tools: ['Glass suction cups', 'Rubber mallets', 'Sealant guns'],
            skills: ['Certified glazier'],
            safety: ['Cut-resistant gloves', 'Safety glasses'],
            sequence: ['Measure opening', 'Apply gasket', 'Install glass', 'Seal'],
            special: ['Handle with care - tempered glass cannot be cut on site']
          },
          codes: [
            {
              standard: 'ANSI Z97.1',
              certification: 'Safety glazing',
              rating: 'Category II'
            }
          ],
          cost: {
            unitCost: 12.50,
            unit: 'SF',
            laborHours: 0.5,
            lastUpdated: new Date(),
            source: 'Manufacturer quote'
          }
        }
      ],
      notes: [
        'All glazing must meet safety glazing requirements',
        'Gasket system must provide structural and weather seal',
        'Drainage weep holes required every 24" on center',
        'Glass panels to be labeled per code requirements',
        'Sealant compatibility must be verified'
      ],
      codeReferences: [
        {
          code: 'IBC 2021',
          section: '2406',
          requirement: 'Safety glazing requirements',
          compliance: 'Tempered glass per ANSI Z97.1'
        },
        {
          code: 'AAMA 501.2',
          section: '3.1',
          requirement: 'Field testing of glazing systems',
          compliance: 'Water infiltration testing required'
        }
      ],
      applicability: ['Venlo greenhouses', 'Gutter-connected structures'],
      revision: 2,
      lastUpdated: new Date()
    };
  }

  private createBeamConnectionDetail(): ConstructionDetail {
    return {
      id: 'STR-001', 
      title: 'STEEL BEAM TO COLUMN CONNECTION',
      category: 'structural',
      scale: '1 1/2" = 1\'-0"',
      description: 'Bolted steel beam to column connection with backing plate',
      drawing: {
        elements: [
          // Column
          {
            type: 'rectangle',
            geometry: [[18, 0], [30, 48]],
            lineWeight: 0.016,
            lineType: 'solid',
            color: '#000000',
            layer: 'steel'
          },
          // Beam
          {
            type: 'rectangle',
            geometry: [[0, 18], [48, 30]],
            lineWeight: 0.016,
            lineType: 'solid',
            color: '#000000',
            layer: 'steel'
          },
          // Connection plate
          {
            type: 'rectangle',
            geometry: [[12, 15], [36, 33]],
            lineWeight: 0.012,
            lineType: 'solid',
            color: '#666666',
            layer: 'connection'
          },
          // Bolts
          {
            type: 'circle',
            geometry: [[15, 21], [15, 27], [21, 21], [21, 27], [27, 21], [27, 27], [33, 21], [33, 27]],
            lineWeight: 0.008,
            lineType: 'solid',
            color: '#000000',
            layer: 'hardware'
          }
        ],
        dimensions: [
          {
            points: [[18, 0], [30, 0]],
            value: '4"',
            unit: 'inches',
            precision: 2
          },
          {
            points: [[0, 18], [0, 30]],
            value: '6"',
            unit: 'inches',
            precision: 2
          }
        ],
        annotations: [
          {
            position: [24, 40],
            text: 'W8x31 BEAM',
            fontSize: 8,
            style: 'bold'
          },
          {
            position: [36, 24],
            text: 'W12x53 COLUMN',
            fontSize: 8,
            style: 'bold'
          },
          {
            position: [40, 15],
            text: '3/4" Ø A325 BOLTS\n(8) REQUIRED',
            fontSize: 6,
            style: 'normal',
            leader: [[40, 15], [27, 21]]
          }
        ],
        materialCallouts: [
          {
            position: [24, 24],
            materialId: 'PLATE-05',
            quantity: '1 EA'
          },
          {
            position: [21, 24],
            materialId: 'BOLT-A325-75',
            quantity: '8 EA'
          }
        ]
      },
      specifications: [
        {
          id: 'BOLT-A325-75',
          name: 'High-Strength Structural Bolt',
          description: '3/4" diameter ASTM A325 structural bolt',
          grade: 'A325',
          size: '3/4" x 3"',
          properties: {
            structural: {
              tensileStrength: 120000,
              yieldStrength: 92000,
              shearStrength: 48000
            }
          },
          installation: {
            tools: ['Torque wrench', 'Impact wrench', 'Spud wrench'],
            skills: ['Certified ironworker'],
            safety: ['Fall protection', 'Hard hat'],
            sequence: ['Install bolt', 'Snug tight', 'Mark', 'Final tension'],
            special: ['Turn-of-nut method required for final tensioning']
          },
          codes: [
            {
              standard: 'AISC 360',
              certification: 'Mill test certificate',
              rating: '120 ksi minimum tensile'
            }
          ],
          cost: {
            unitCost: 8.50,
            unit: 'EA',
            laborHours: 0.25,
            lastUpdated: new Date(),
            source: 'Local supplier'
          }
        }
      ],
      notes: [
        'Connection to be designed by licensed structural engineer',
        'Bolts to be installed per AISC specifications',
        'All steel surfaces to be primed and painted',
        'Field welding prohibited without engineer approval',
        'Connection capacity must exceed beam capacity'
      ],
      codeReferences: [
        {
          code: 'AISC 360-16',
          section: 'J3',
          requirement: 'Bolted connection design',
          compliance: 'Connection designed per LRFD method'
        },
        {
          code: 'IBC 2021',
          section: '2205',
          requirement: 'Steel construction standards',
          compliance: 'AISC 360 referenced standard'
        }
      ],
      applicability: ['Steel frame greenhouses', 'Industrial structures'],
      revision: 1,
      lastUpdated: new Date()
    };
  }

  private createHVACMountingDetail(): ConstructionDetail {
    return {
      id: 'MEC-001',
      title: 'HVAC UNIT VIBRATION ISOLATION MOUNTING',
      category: 'mechanical',
      scale: '1" = 1\'-0"',
      description: 'Rooftop HVAC unit mounting with vibration isolation and structural support',
      drawing: {
        elements: [
          // Structural curb
          {
            type: 'rectangle',
            geometry: [[6, 0], [42, 12]],
            lineWeight: 0.016,
            lineType: 'solid',
            color: '#000000',
            layer: 'structure'
          },
          // Equipment pad
          {
            type: 'rectangle',
            geometry: [[0, 12], [48, 18]],
            lineWeight: 0.012,
            lineType: 'solid',
            color: '#666666',
            layer: 'equipment'
          },
          // Vibration isolators
          {
            type: 'rectangle',
            geometry: [[9, 6], [12, 12], [36, 6], [39, 12]],
            lineWeight: 0.008,
            lineType: 'solid',
            color: '#FF6600',
            layer: 'isolators'
          },
          // Flashing
          {
            type: 'polyline',
            geometry: [[3, 0], [6, 0], [6, 12], [9, 15], [39, 15], [42, 12], [42, 0], [45, 0]],
            lineWeight: 0.006,
            lineType: 'solid',
            color: '#0066CC',
            layer: 'flashing'
          }
        ],
        dimensions: [
          {
            points: [[0, 18], [48, 18]],
            value: '4\'-0"',
            unit: 'feet',
            precision: 1
          },
          {
            points: [[48, 0], [48, 18]],
            value: '1\'-6"',
            unit: 'feet',
            precision: 1
          }
        ],
        annotations: [
          {
            position: [24, 22],
            text: 'HVAC UNIT\n(BY OTHERS)',
            fontSize: 8,
            style: 'normal'
          },
          {
            position: [52, 9],
            text: 'SPRING VIBRATION\nISOLATORS (4)',
            fontSize: 6,
            style: 'normal',
            leader: [[52, 9], [39, 9]]
          },
          {
            position: [24, -4],
            text: 'STRUCTURAL CURB\nBY STRUCTURAL ENGINEER',
            fontSize: 6,
            style: 'normal'
          }
        ],
        materialCallouts: [
          {
            position: [10, 9],
            materialId: 'ISO-SPRING',
            quantity: '4 EA'
          },
          {
            position: [24, 3],
            materialId: 'FLASH-EPDM',
            quantity: '20 LF'
          }
        ]
      },
      specifications: [
        {
          id: 'ISO-SPRING',
          name: 'Spring Vibration Isolator',
          description: 'Heavy-duty spring vibration isolator for HVAC equipment',
          manufacturer: 'Mason Industries',
          model: 'KSH-1000',
          properties: {
            structural: {
              loadCapacity: 1000,
              deflection: 1.5
            },
            environmental: {
              corrosionResistance: 'Galvanized coating',
              weatherResistance: 'Outdoor rated'
            }
          },
          installation: {
            tools: ['Level', 'Torque wrench'],
            skills: ['HVAC technician'],
            safety: ['Fall protection'],
            sequence: ['Level curb', 'Install isolators', 'Level unit', 'Connect'],
            special: ['Pre-compressed springs require settling time']
          },
          codes: [
            {
              standard: 'ASHRAE',
              rating: '95% vibration isolation @ operating speed'
            }
          ],
          cost: {
            unitCost: 185.0,
            unit: 'EA',
            laborHours: 1.0,
            lastUpdated: new Date(),
            source: 'HVAC supplier'
          }
        }
      ],
      notes: [
        'Structural curb to be designed for equipment loads',
        'Vibration isolators sized for equipment weight and RPM',
        'All penetrations through roof to be properly flashed',
        'Electrical disconnects required within sight of equipment',
        'Refrigerant piping to include vibration loops'
      ],
      codeReferences: [
        {
          code: 'IMC 2021',
          section: '301.11',
          requirement: 'Vibration isolation',
          compliance: 'Spring isolators per manufacturer specs'
        },
        {
          code: 'IBC 2021',
          section: '1607.13',
          requirement: 'Equipment live loads',
          compliance: 'Structural design includes equipment weight'
        }
      ],
      applicability: ['Rooftop HVAC units', 'Mechanical equipment'],
      revision: 1,
      lastUpdated: new Date()
    };
  }

  // Additional detail creation methods would go here...
  private createAnchorBoltDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createFootingDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createColumnBaseDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createTrussConnectionDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createSillFlashingDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createRidgeCapDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createDuctSupportDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createVentilationDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createFixtureMountingDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createConduitRoutingDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createGroundingDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createIrrigationConnectionDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createDrainageDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }
  private createBackflowPreventerDetail(): ConstructionDetail { /* Implementation */ return {} as ConstructionDetail; }

  public addDetail(detail: ConstructionDetail): void {
    this.details.set(detail.id, detail);
  }

  public getDetail(id: string): ConstructionDetail | undefined {
    return this.details.get(id);
  }

  public getDetailsByCategory(category: DetailCategory): ConstructionDetail[] {
    return Array.from(this.details.values()).filter(detail => detail.category === category);
  }

  public searchDetails(query: string): ConstructionDetail[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.details.values()).filter(detail => 
      detail.title.toLowerCase().includes(searchTerm) ||
      detail.description.toLowerCase().includes(searchTerm) ||
      detail.notes.some(note => note.toLowerCase().includes(searchTerm))
    );
  }

  public getAllDetails(): ConstructionDetail[] {
    return Array.from(this.details.values());
  }

  public getDetailCount(): number {
    return this.details.size;
  }

  public getCategoryCounts(): Record<DetailCategory, number> {
    const counts = {} as Record<DetailCategory, number>;
    
    for (const detail of this.details.values()) {
      counts[detail.category] = (counts[detail.category] || 0) + 1;
    }
    
    return counts;
  }

  /**
   * Generate construction detail drawing in CAD format
   */
  public generateDetailDrawing(detailId: string, format: 'svg' | 'dxf' | 'pdf' = 'svg'): string {
    const detail = this.getDetail(detailId);
    if (!detail) {
      throw new Error(`Detail ${detailId} not found`);
    }

    switch (format) {
      case 'svg':
        return this.generateSVGDrawing(detail);
      case 'dxf':
        return this.generateDXFDrawing(detail);
      case 'pdf':
        return this.generatePDFDrawing(detail);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generateSVGDrawing(detail: ConstructionDetail): string {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <title>${detail.title}</title>
      <defs>
        <style>
          .construction-line { stroke: #000; fill: none; }
          .dimension-line { stroke: #000; stroke-width: 0.5; }
          .annotation-text { font-family: Arial; font-size: 8px; }
          .material-hatch { fill: url(#hatch); }
        </style>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M0,4 L4,0" stroke="#666" stroke-width="0.5"/>
        </pattern>
      </defs>`;

    // Draw elements
    for (const element of detail.drawing.elements) {
      svg += this.generateSVGElement(element);
    }

    // Add dimensions
    for (const dimension of detail.drawing.dimensions) {
      svg += this.generateSVGDimension(dimension);
    }

    // Add annotations
    for (const annotation of detail.drawing.annotations) {
      svg += this.generateSVGAnnotation(annotation);
    }

    svg += '</svg>';
    return svg;
  }

  private generateSVGElement(element: DrawingElement): string {
    const strokeWidth = element.lineWeight * 100; // Convert to SVG units
    const stroke = element.color;
    const strokeDasharray = element.lineType === 'dashed' ? '5,5' : 
                           element.lineType === 'dotted' ? '1,3' : 'none';

    switch (element.type) {
      case 'line':
        return `<polyline points="${element.geometry.map(p => p.join(',')).join(' ')}" 
                class="construction-line" stroke="${stroke}" stroke-width="${strokeWidth}" 
                stroke-dasharray="${strokeDasharray}"/>`;
      
      case 'rectangle':
        const [[x, y], [x2, y2]] = element.geometry;
        return `<rect x="${x}" y="${y}" width="${x2-x}" height="${y2-y}" 
                class="construction-line" stroke="${stroke}" stroke-width="${strokeWidth}" 
                stroke-dasharray="${strokeDasharray}" fill="none"/>`;
      
      case 'circle':
        const [cx, cy] = element.geometry[0];
        const radius = element.geometry[1] ? 
          Math.sqrt(Math.pow(element.geometry[1][0] - cx, 2) + Math.pow(element.geometry[1][1] - cy, 2)) : 5;
        return `<circle cx="${cx}" cy="${cy}" r="${radius}" 
                class="construction-line" stroke="${stroke}" stroke-width="${strokeWidth}" 
                stroke-dasharray="${strokeDasharray}" fill="none"/>`;
      
      default:
        return '';
    }
  }

  private generateSVGDimension(dimension: Dimension): string {
    const [[x1, y1], [x2, y2]] = dimension.points;
    return `<g class="dimension">
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="dimension-line"/>
      <text x="${(x1+x2)/2}" y="${(y1+y2)/2-2}" class="annotation-text" text-anchor="middle">
        ${dimension.value}
      </text>
    </g>`;
  }

  private generateSVGAnnotation(annotation: Annotation): string {
    const [x, y] = annotation.position;
    let svg = `<text x="${x}" y="${y}" class="annotation-text" 
               font-weight="${annotation.style === 'bold' ? 'bold' : 'normal'}"
               font-style="${annotation.style === 'italic' ? 'italic' : 'normal'}">
               ${annotation.text}
               </text>`;
    
    if (annotation.leader) {
      svg += `<polyline points="${annotation.leader.map(p => p.join(',')).join(' ')}" 
              class="dimension-line" marker-end="url(#arrowhead)"/>`;
    }
    
    return svg;
  }

  private generateDXFDrawing(detail: ConstructionDetail): string {
    // DXF format implementation would go here
    return `0\nSECTION\n2\nENTITIES\n${detail.title}\n0\nENDSEC\n0\nEOF\n`;
  }

  private generatePDFDrawing(detail: ConstructionDetail): string {
    // PDF generation would use jsPDF or similar
    return `PDF content for ${detail.title}`;
  }
}

// Export singleton instance
export const constructionDetailLibrary = new ConstructionDetailLibrary();