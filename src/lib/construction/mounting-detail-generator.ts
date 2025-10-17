/**
 * Mounting Detail Generator
 * Creates detailed installation drawings and specifications
 */

import { CONSTRUCTION_COMPONENTS, ConstructionComponent } from './component-database';

export interface MountingDetail {
  id: string;
  name: string;
  description: string;
  fixtureType: string;
  mountingMethod: MountingMethod;
  components: MountingComponent[];
  structuralRequirements: StructuralRequirements;
  installationSteps: InstallationStep[];
  drawing: DetailDrawing;
  loadCalculation: LoadCalculation;
  notes: string[];
  warnings: string[];
}

export type MountingMethod = 
  | 'unistrut-grid'
  | 'chain-hung'
  | 'cable-suspended'
  | 'direct-mount'
  | 'track-system'
  | 'adjustable-ratchet';

export interface MountingComponent {
  sku: string;
  description: string;
  quantity: number;
  purpose: string;
  location: 'structure' | 'intermediate' | 'fixture';
}

export interface StructuralRequirements {
  attachmentPoints: number;
  spacing: { min: number; max: number; recommended: number };
  loadPerPoint: number; // lbs
  safetyFactor: number;
  requiredStructure: 'steel-beam' | 'wood-joist' | 'concrete' | 'any';
  minimumStructuralCapacity: number; // lbs
}

export interface InstallationStep {
  number: number;
  description: string;
  tools: string[];
  components: string[]; // SKUs used in this step
  safetyNotes?: string[];
  timeEstimate: number; // minutes
  image?: string; // Reference to detail drawing
}

export interface DetailDrawing {
  views: DrawingView[];
  dimensions: Dimension[];
  callouts: Callout[];
  legend: LegendItem[];
}

export interface DrawingView {
  type: 'elevation' | 'plan' | 'section' | 'isometric' | 'detail';
  title: string;
  scale: string;
  elements: DrawingElement[];
}

export interface DrawingElement {
  type: 'line' | 'rect' | 'circle' | 'arc' | 'text' | 'component';
  properties: any;
  layer: 'structure' | 'mounting' | 'fixture' | 'dimension' | 'annotation';
}

export interface Dimension {
  from: { x: number; y: number };
  to: { x: number; y: number };
  value: string;
  units: 'inches' | 'feet';
}

export interface Callout {
  number: number;
  text: string;
  leaderLine: { from: { x: number; y: number }; to: { x: number; y: number } };
  component?: string; // SKU reference
}

export interface LegendItem {
  symbol: string;
  description: string;
  sku?: string;
}

export interface LoadCalculation {
  fixtureWeight: number;
  mountingHardwareWeight: number;
  totalStaticLoad: number;
  dynamicLoadFactor: number;
  totalDesignLoad: number;
  loadPerAttachmentPoint: number;
  structuralCapacityRequired: number;
}

export class MountingDetailGenerator {
  
  /**
   * Generate complete mounting detail for fixture installation
   */
  static generateMountingDetail(
    fixtureInfo: {
      model: string;
      weight: number;
      dimensions: { length: number; width: number; height: number };
      mountingPoints: number;
    },
    mountingMethod: MountingMethod,
    structuralType: 'steel-beam' | 'wood-joist' | 'concrete' = 'steel-beam'
  ): MountingDetail {
    switch (mountingMethod) {
      case 'unistrut-grid':
        return this.generateUnistrut(fixtureInfo, structuralType);
      case 'chain-hung':
        return this.generateChainHungMounting(fixtureInfo, structuralType);
      case 'cable-suspended':
        return this.generateCableSuspendedMounting(fixtureInfo, structuralType);
      default:
        return this.generateChainHungMounting(fixtureInfo, structuralType);
    }
  }

  /**
   * Generate Unistrut grid mounting detail
   */
  private static generateUnistrutGridMounting(
    fixtureInfo: any,
    structuralType: string
  ): MountingDetail {
    const components: MountingComponent[] = [
      {
        sku: 'MOUNT-UNISTRUT-10FT',
        description: 'Unistrut P1000 Channel, 10ft',
        quantity: Math.ceil(fixtureInfo.dimensions.length / 48) * 2, // Parallel runs
        purpose: 'Primary support rails',
        location: 'intermediate'
      },
      {
        sku: 'STRUCT-BEAM-CLAMP-3/8',
        description: 'Beam Clamp, 3/8" rod',
        quantity: 8, // 4 per rail
        purpose: 'Attach Unistrut to structure',
        location: 'structure'
      },
      {
        sku: 'MOUNT-UNISTRUT-NUT',
        description: 'Unistrut Spring Nut, 3/8"-16',
        quantity: fixtureInfo.mountingPoints * 2,
        purpose: 'Fixture attachment',
        location: 'intermediate'
      },
      {
        sku: 'MOUNT-UNISTRUT-BOLT',
        description: 'Hex Bolt, 3/8"-16 x 1-1/2"',
        quantity: fixtureInfo.mountingPoints * 2,
        purpose: 'Fixture mounting bolts',
        location: 'fixture'
      }
    ];

    const loadCalc = this.calculateLoads(fixtureInfo, components);

    const detail: MountingDetail = {
      id: `mount-detail-${Date.now()}`,
      name: 'Unistrut Grid Mount System',
      description: 'Professional-grade Unistrut mounting grid for grow light fixtures',
      fixtureType: fixtureInfo.model,
      mountingMethod: 'unistrut-grid',
      components,
      structuralRequirements: {
        attachmentPoints: 8,
        spacing: { min: 24, max: 48, recommended: 36 },
        loadPerPoint: loadCalc.loadPerAttachmentPoint,
        safetyFactor: 5,
        requiredStructure: structuralType,
        minimumStructuralCapacity: loadCalc.structuralCapacityRequired
      },
      installationSteps: [
        {
          number: 1,
          description: 'Mark beam locations and verify structural capacity',
          tools: ['Measuring Tape', 'Chalk Line', 'Level'],
          components: [],
          safetyNotes: ['Verify beam load ratings before installation'],
          timeEstimate: 15
        },
        {
          number: 2,
          description: 'Install beam clamps at marked locations',
          tools: ['3/8" Wrench', 'Torque Wrench'],
          components: ['STRUCT-BEAM-CLAMP-3/8'],
          safetyNotes: ['Torque to manufacturer specifications (20 ft-lbs)'],
          timeEstimate: 30
        },
        {
          number: 3,
          description: 'Cut Unistrut channels to length',
          tools: ['Metal Cutting Saw', 'File', 'Measuring Tape'],
          components: ['MOUNT-UNISTRUT-10FT'],
          safetyNotes: ['Wear safety glasses when cutting metal'],
          timeEstimate: 20
        },
        {
          number: 4,
          description: 'Attach Unistrut to beam clamps',
          tools: ['3/8" Socket Wrench', 'Level'],
          components: ['MOUNT-UNISTRUT-BOLT'],
          safetyNotes: ['Ensure channels are level and parallel'],
          timeEstimate: 30
        },
        {
          number: 5,
          description: 'Install spring nuts and mount fixtures',
          tools: ['3/8" Socket Wrench', 'Torque Wrench'],
          components: ['MOUNT-UNISTRUT-NUT', 'MOUNT-UNISTRUT-BOLT'],
          safetyNotes: ['Support fixture weight during installation'],
          timeEstimate: 20
        }
      ],
      drawing: this.generateUnistrutDrawing(fixtureInfo),
      loadCalculation: loadCalc,
      notes: [
        'Unistrut must be installed with slots facing down',
        'Maximum span between supports: 6 feet',
        'Use thread locker on all critical connections',
        'Check alignment before final tightening'
      ],
      warnings: [
        'Do not exceed rated load capacity of Unistrut (1900 lbs per 10ft span)',
        'Ensure all connections are properly torqued',
        'Regular inspection required for commercial installations'
      ]
    };

    return detail;
  }

  /**
   * Generate chain hung mounting detail
   */
  private static generateChainHungMounting(
    fixtureInfo: any,
    structuralType: string
  ): MountingDetail {
    const components: MountingComponent[] = [
      {
        sku: 'MOUNT-V-HOOK-6',
        description: 'V-Hook Hanger, 6", 75 lb rating',
        quantity: fixtureInfo.mountingPoints,
        purpose: 'Fixture attachment points',
        location: 'fixture'
      },
      {
        sku: 'MOUNT-CHAIN-JACK-6',
        description: 'Jack Chain, #14, 6ft',
        quantity: fixtureInfo.mountingPoints,
        purpose: 'Adjustable suspension',
        location: 'intermediate'
      },
      {
        sku: 'MOUNT-EYEBOLT-14',
        description: 'Eye Bolt, 1/4"-20 x 2"',
        quantity: fixtureInfo.mountingPoints,
        purpose: 'Structural attachment',
        location: 'structure'
      },
      {
        sku: 'MOUNT-S-HOOK-M',
        description: 'S-Hook, Medium, Zinc',
        quantity: fixtureInfo.mountingPoints * 2,
        purpose: 'Chain connections',
        location: 'intermediate'
      }
    ];

    const loadCalc = this.calculateLoads(fixtureInfo, components);

    const detail: MountingDetail = {
      id: `mount-detail-${Date.now()}`,
      name: 'Chain Hung Mounting System',
      description: 'Adjustable chain suspension system for grow lights',
      fixtureType: fixtureInfo.model,
      mountingMethod: 'chain-hung',
      components,
      structuralRequirements: {
        attachmentPoints: fixtureInfo.mountingPoints,
        spacing: { 
          min: fixtureInfo.dimensions.length * 0.25, 
          max: fixtureInfo.dimensions.length * 0.75, 
          recommended: fixtureInfo.dimensions.length * 0.5 
        },
        loadPerPoint: loadCalc.loadPerAttachmentPoint,
        safetyFactor: 5,
        requiredStructure: structuralType,
        minimumStructuralCapacity: loadCalc.structuralCapacityRequired
      },
      installationSteps: [
        {
          number: 1,
          description: 'Locate and mark structural mounting points',
          tools: ['Stud Finder', 'Measuring Tape', 'Pencil'],
          components: [],
          safetyNotes: ['Verify structural member locations'],
          timeEstimate: 10
        },
        {
          number: 2,
          description: 'Drill pilot holes for eye bolts',
          tools: ['Drill', '3/16" Drill Bit'],
          components: [],
          safetyNotes: ['Wear safety glasses', 'Check for electrical/plumbing'],
          timeEstimate: 15
        },
        {
          number: 3,
          description: 'Install eye bolts into structure',
          tools: ['Adjustable Wrench', 'Thread Locker'],
          components: ['MOUNT-EYEBOLT-14'],
          safetyNotes: ['Ensure full thread engagement'],
          timeEstimate: 15
        },
        {
          number: 4,
          description: 'Attach chains to eye bolts with S-hooks',
          tools: ['Pliers'],
          components: ['MOUNT-CHAIN-JACK-6', 'MOUNT-S-HOOK-M'],
          safetyNotes: ['Close S-hooks completely'],
          timeEstimate: 10
        },
        {
          number: 5,
          description: 'Install V-hooks on fixture and hang',
          tools: ['Screwdriver', 'Level'],
          components: ['MOUNT-V-HOOK-6', 'MOUNT-S-HOOK-M'],
          safetyNotes: ['Support fixture weight during installation'],
          timeEstimate: 20
        },
        {
          number: 6,
          description: 'Adjust height and level fixture',
          tools: ['Level', 'Measuring Tape'],
          components: [],
          safetyNotes: ['Ensure even weight distribution'],
          timeEstimate: 10
        }
      ],
      drawing: this.generateChainHungDrawing(fixtureInfo),
      loadCalculation: loadCalc,
      notes: [
        'Chain links can be adjusted for precise height control',
        'Use matching chain grade for all suspension points',
        'Recommended mounting height: 24-36" above canopy',
        'Check chain condition regularly for wear'
      ],
      warnings: [
        'Never exceed working load limit of weakest component',
        'All S-hooks must be fully closed',
        'Do not use damaged or worn chains',
        'Account for dynamic loads from air movement'
      ]
    };

    return detail;
  }

  /**
   * Generate cable suspended mounting detail
   */
  private static generateCableSuspendedMounting(
    fixtureInfo: any,
    structuralType: string
  ): MountingDetail {
    // Implementation similar to above but with aircraft cable components
    // This would include cable, cable clamps, turnbuckles, etc.
    return this.generateChainHungMounting(fixtureInfo, structuralType); // Placeholder
  }

  /**
   * Calculate load requirements
   */
  private static calculateLoads(
    fixtureInfo: any,
    components: MountingComponent[]
  ): LoadCalculation {
    const fixtureWeight = fixtureInfo.weight;
    
    // Calculate mounting hardware weight
    const hardwareWeight = components.reduce((total, comp) => {
      const component = CONSTRUCTION_COMPONENTS[comp.sku];
      if (component) {
        return total + (component.weight * comp.quantity);
      }
      return total;
    }, 0);

    const totalStaticLoad = fixtureWeight + hardwareWeight;
    const dynamicLoadFactor = 1.5; // Account for installation forces, vibration
    const totalDesignLoad = totalStaticLoad * dynamicLoadFactor;
    const safetyFactor = 5;
    const loadPerAttachmentPoint = totalDesignLoad / fixtureInfo.mountingPoints;
    const structuralCapacityRequired = totalDesignLoad * safetyFactor;

    return {
      fixtureWeight,
      mountingHardwareWeight: hardwareWeight,
      totalStaticLoad,
      dynamicLoadFactor,
      totalDesignLoad,
      loadPerAttachmentPoint,
      structuralCapacityRequired
    };
  }

  /**
   * Generate drawing for Unistrut mounting
   */
  private static generateUnistrutDrawing(fixtureInfo: any): DetailDrawing {
    return {
      views: [
        {
          type: 'elevation',
          title: 'Front Elevation',
          scale: '1/4" = 1\'-0"',
          elements: [
            {
              type: 'line',
              properties: { 
                start: { x: 0, y: 0 }, 
                end: { x: 100, y: 0 },
                strokeWidth: 2,
                label: 'Structural Beam'
              },
              layer: 'structure'
            },
            {
              type: 'rect',
              properties: {
                x: 10,
                y: 10,
                width: 80,
                height: 10,
                label: 'Unistrut Channel'
              },
              layer: 'mounting'
            },
            {
              type: 'rect',
              properties: {
                x: 20,
                y: 20,
                width: 60,
                height: 30,
                label: 'Light Fixture'
              },
              layer: 'fixture'
            }
          ]
        },
        {
          type: 'section',
          title: 'Section A-A',
          scale: '1" = 1\'-0"',
          elements: [
            // Detailed connection elements
          ]
        }
      ],
      dimensions: [
        {
          from: { x: 10, y: 0 },
          to: { x: 90, y: 0 },
          value: `${fixtureInfo.dimensions.length}"`,
          units: 'inches'
        }
      ],
      callouts: [
        {
          number: 1,
          text: 'Beam Clamp - See Detail',
          leaderLine: { from: { x: 15, y: 5 }, to: { x: 30, y: -10 } },
          component: 'STRUCT-BEAM-CLAMP-3/8'
        },
        {
          number: 2,
          text: 'Unistrut P1000',
          leaderLine: { from: { x: 50, y: 15 }, to: { x: 65, y: 5 } },
          component: 'MOUNT-UNISTRUT-10FT'
        }
      ],
      legend: [
        { symbol: '⊡', description: 'Beam Clamp', sku: 'STRUCT-BEAM-CLAMP-3/8' },
        { symbol: '═', description: 'Unistrut Channel', sku: 'MOUNT-UNISTRUT-10FT' },
        { symbol: '◯', description: 'Spring Nut', sku: 'MOUNT-UNISTRUT-NUT' }
      ]
    };
  }

  /**
   * Generate drawing for chain hung mounting
   */
  private static generateChainHungDrawing(fixtureInfo: any): DetailDrawing {
    return {
      views: [
        {
          type: 'elevation',
          title: 'Side Elevation',
          scale: '1/4" = 1\'-0"',
          elements: [
            // Drawing elements for chain hung system
          ]
        }
      ],
      dimensions: [],
      callouts: [
        {
          number: 1,
          text: 'Eye Bolt into Structure',
          leaderLine: { from: { x: 50, y: 10 }, to: { x: 70, y: -5 } },
          component: 'MOUNT-EYEBOLT-14'
        },
        {
          number: 2,
          text: 'Jack Chain #14',
          leaderLine: { from: { x: 50, y: 30 }, to: { x: 70, y: 30 } },
          component: 'MOUNT-CHAIN-JACK-6'
        }
      ],
      legend: [
        { symbol: '◉', description: 'Eye Bolt', sku: 'MOUNT-EYEBOLT-14' },
        { symbol: '⚬', description: 'V-Hook', sku: 'MOUNT-V-HOOK-6' },
        { symbol: 'S', description: 'S-Hook', sku: 'MOUNT-S-HOOK-M' }
      ]
    };
  }

  /**
   * Generate installation checklist
   */
  static generateInstallationChecklist(detail: MountingDetail): string[] {
    const checklist: string[] = [
      '□ Verify all components match bill of materials',
      '□ Check structural capacity meets requirements',
      '□ Gather all required tools',
      '□ Review safety requirements',
      ''
    ];

    for (const step of detail.installationSteps) {
      checklist.push(`□ Step ${step.number}: ${step.description}`);
      if (step.safetyNotes) {
        step.safetyNotes.forEach(note => {
          checklist.push(`   ⚠️  ${note}`);
        });
      }
      checklist.push(`   Time estimate: ${step.timeEstimate} minutes`);
      checklist.push('');
    }

    checklist.push('Post-Installation:');
    checklist.push('□ Verify all connections are secure');
    checklist.push('□ Check fixture level and alignment');
    checklist.push('□ Test electrical connections');
    checklist.push('□ Document installation with photos');
    checklist.push('□ Complete warranty registration');

    return checklist;
  }
}