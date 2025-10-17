/**
 * Construction Documentation Generator
 * Creates complete installation packages with drawings, specs, and instructions
 */

import { ElectricalSystem, Panel, Circuit } from './electrical-system-designer';
import { MountingDetail } from './mounting-detail-generator';
import { ConstructionComponent, CONSTRUCTION_COMPONENTS, ConstructionCalculator } from './component-database';

export interface ConstructionPackage {
  project: ProjectInfo;
  drawings: ConstructionDrawing[];
  specifications: Specification[];
  billOfMaterials: BillOfMaterials;
  installationManual: InstallationManual;
  permits: PermitRequirements;
  commissioning: CommissioningPlan;
  asBuilt: AsBuiltDocumentation;
}

export interface ProjectInfo {
  name: string;
  address: string;
  client: ClientInfo;
  contractor: ContractorInfo;
  engineer: EngineerInfo;
  permitNumber?: string;
  projectNumber: string;
  dateCreated: Date;
  revision: string;
}

export interface ClientInfo {
  name: string;
  contact: string;
  phone: string;
  email: string;
}

export interface ContractorInfo {
  company: string;
  license: string;
  contact: string;
  phone: string;
  email: string;
}

export interface EngineerInfo {
  name: string;
  license: string;
  discipline: string;
  signature?: string;
}

export interface ConstructionDrawing {
  number: string;
  title: string;
  scale: string;
  revision: string;
  type: DrawingType;
  content: DrawingContent;
  notes: string[];
  references: string[];
}

export type DrawingType = 
  | 'cover-sheet'
  | 'site-plan'
  | 'floor-plan'
  | 'reflected-ceiling'
  | 'electrical-plan'
  | 'single-line'
  | 'panel-schedule'
  | 'mounting-details'
  | 'sections'
  | 'elevations';

export interface DrawingContent {
  layers: DrawingLayer[];
  titleBlock: TitleBlock;
  viewport: Viewport;
  elements: any[]; // Actual drawing elements
}

export interface DrawingLayer {
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  lineWeight: number;
}

export interface TitleBlock {
  projectName: string;
  drawingTitle: string;
  drawingNumber: string;
  scale: string;
  date: string;
  drawnBy: string;
  checkedBy: string;
  revision: string;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface Specification {
  section: string;
  title: string;
  content: SpecificationContent[];
}

export interface SpecificationContent {
  part: string;
  title: string;
  paragraphs: Paragraph[];
}

export interface Paragraph {
  number: string;
  title: string;
  text: string;
  subParagraphs?: Paragraph[];
}

export interface BillOfMaterials {
  summary: BOMSummary;
  categories: BOMCategory[];
  alternates: AlternateItem[];
  procurement: ProcurementInfo;
}

export interface BOMSummary {
  totalItems: number;
  totalCost: number;
  taxRate: number;
  taxAmount: number;
  shippingEstimate: number;
  grandTotal: number;
}

export interface BOMCategory {
  name: string;
  items: BOMItem[];
  subtotal: number;
}

export interface BOMItem {
  lineNumber: number;
  sku: string;
  manufacturer: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  leadTime: number;
  notes?: string;
}

export interface AlternateItem {
  originalSku: string;
  alternateSku: string;
  reason: string;
  priceDifference: number;
}

export interface ProcurementInfo {
  suppliers: SupplierOrder[];
  deliverySchedule: DeliveryPhase[];
  storageRequirements: string[];
}

export interface SupplierOrder {
  supplier: string;
  items: string[]; // SKUs
  subtotal: number;
  accountNumber?: string;
  orderNotes: string[];
}

export interface DeliveryPhase {
  phase: number;
  description: string;
  items: string[]; // SKUs
  deliveryDate: Date;
  storageLocation: string;
}

export interface InstallationManual {
  tableOfContents: TOCEntry[];
  safety: SafetySection;
  phases: InstallationPhase[];
  testing: TestingProcedures;
  troubleshooting: TroubleshootingGuide;
}

export interface TOCEntry {
  section: string;
  title: string;
  page: number;
  subsections?: TOCEntry[];
}

export interface SafetySection {
  generalSafety: string[];
  electricalSafety: string[];
  structuralSafety: string[];
  ppe: string[];
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  service: string;
  phone: string;
}

export interface InstallationPhase {
  number: number;
  name: string;
  duration: number; // days
  prerequisites: string[];
  crews: CrewRequirement[];
  tasks: InstallationTask[];
  inspections: InspectionPoint[];
}

export interface CrewRequirement {
  trade: string;
  quantity: number;
  hours: number;
  certification?: string;
}

export interface InstallationTask {
  id: string;
  description: string;
  location: string;
  crew: string;
  duration: number; // hours
  materials: string[]; // SKUs
  tools: string[];
  procedure: string[];
  qualityChecks: string[];
}

export interface InspectionPoint {
  type: string;
  description: string;
  criteria: string[];
  signOff: string;
}

export interface TestingProcedures {
  electrical: ElectricalTest[];
  mechanical: MechanicalTest[];
  controls: ControlsTest[];
  integrated: IntegratedTest[];
}

export interface ElectricalTest {
  name: string;
  equipment: string[];
  procedure: string[];
  acceptanceCriteria: string[];
  results: TestResult[];
}

export interface TestResult {
  parameter: string;
  expected: string;
  actual?: string;
  pass?: boolean;
}

export interface MechanicalTest {
  name: string;
  procedure: string[];
  criteria: string[];
}

export interface ControlsTest {
  name: string;
  sequence: string[];
  expectedResponse: string[];
}

export interface IntegratedTest {
  name: string;
  systems: string[];
  procedure: string[];
  duration: number; // hours
}

export interface TroubleshootingGuide {
  commonIssues: TroubleshootingItem[];
  diagnosticFlowcharts: FlowChart[];
}

export interface TroubleshootingItem {
  symptom: string;
  possibleCauses: string[];
  checkProcedure: string[];
  solutions: string[];
}

export interface FlowChart {
  title: string;
  startPoint: string;
  nodes: FlowNode[];
}

export interface FlowNode {
  id: string;
  type: 'decision' | 'action' | 'end';
  text: string;
  yes?: string; // next node ID
  no?: string; // next node ID
  next?: string; // next node ID
}

export interface PermitRequirements {
  required: PermitItem[];
  submitted: PermitSubmission[];
  inspections: ScheduledInspection[];
}

export interface PermitItem {
  type: string;
  authority: string;
  requirements: string[];
  forms: string[];
  fee: number;
}

export interface PermitSubmission {
  type: string;
  submitDate: Date;
  permitNumber?: string;
  status: 'pending' | 'approved' | 'revision-required';
  comments?: string;
}

export interface ScheduledInspection {
  type: string;
  scheduledDate?: Date;
  inspector?: string;
  requirements: string[];
  result?: 'pass' | 'fail' | 'partial';
}

export interface CommissioningPlan {
  overview: string;
  systems: SystemCommissioning[];
  startupSequence: StartupStep[];
  performanceTests: PerformanceTest[];
  training: TrainingPlan;
  documentation: RequiredDocumentation[];
}

export interface SystemCommissioning {
  system: string;
  preChecks: string[];
  startupProcedure: string[];
  functionalTests: string[];
  setpoints: Setpoint[];
}

export interface Setpoint {
  parameter: string;
  value: number;
  units: string;
  tolerance: number;
}

export interface StartupStep {
  sequence: number;
  system: string;
  action: string;
  verification: string;
  safety: string[];
}

export interface PerformanceTest {
  name: string;
  duration: number; // hours
  conditions: string[];
  measurements: string[];
  acceptanceCriteria: string[];
}

export interface TrainingPlan {
  sessions: TrainingSession[];
  materials: string[];
  certification: string;
}

export interface TrainingSession {
  topic: string;
  audience: string;
  duration: number; // hours
  objectives: string[];
  materials: string[];
}

export interface RequiredDocumentation {
  document: string;
  responsible: string;
  dueDate: Date;
  submitted?: boolean;
}

export interface AsBuiltDocumentation {
  drawings: string[]; // drawing numbers
  photos: PhotoDocumentation[];
  changes: ChangeOrder[];
  warranties: WarrantyItem[];
  manuals: EquipmentManual[];
}

export interface PhotoDocumentation {
  id: string;
  description: string;
  location: string;
  date: Date;
  phase: string;
  tags: string[];
}

export interface ChangeOrder {
  number: string;
  date: Date;
  description: string;
  reason: string;
  cost: number;
  approved: boolean;
  impact: string;
}

export interface WarrantyItem {
  equipment: string;
  manufacturer: string;
  startDate: Date;
  duration: number; // months
  contact: string;
  registrationNumber?: string;
}

export interface EquipmentManual {
  equipment: string;
  manufacturer: string;
  model: string;
  documentType: string;
  fileLocation: string;
}

export class ConstructionDocumentationGenerator {
  private project: ProjectInfo;
  
  constructor(projectInfo: ProjectInfo) {
    this.project = projectInfo;
  }

  /**
   * Generate complete construction package
   */
  generateConstructionPackage(
    electricalSystem: ElectricalSystem,
    mountingDetails: MountingDetail[],
    components: Array<{ sku: string; quantity: number }>
  ): ConstructionPackage {
    return {
      project: this.project,
      drawings: this.generateDrawings(electricalSystem, mountingDetails),
      specifications: this.generateSpecifications(components),
      billOfMaterials: this.generateBOM(components),
      installationManual: this.generateInstallationManual(electricalSystem, mountingDetails),
      permits: this.generatePermitRequirements(electricalSystem),
      commissioning: this.generateCommissioningPlan(electricalSystem),
      asBuilt: this.generateAsBuiltTemplate()
    };
  }

  /**
   * Generate construction drawings
   */
  private generateDrawings(
    electricalSystem: ElectricalSystem,
    mountingDetails: MountingDetail[]
  ): ConstructionDrawing[] {
    const drawings: ConstructionDrawing[] = [];

    // Cover sheet
    drawings.push({
      number: 'G-001',
      title: 'COVER SHEET',
      scale: 'N/A',
      revision: 'A',
      type: 'cover-sheet',
      content: this.generateCoverSheet(),
      notes: [
        'All work to be performed in accordance with local codes',
        'Contractor to verify all dimensions in field',
        'Report discrepancies to engineer before proceeding'
      ],
      references: ['NEC 2020', 'Local Building Code']
    });

    // Electrical plan
    drawings.push({
      number: 'E-101',
      title: 'ELECTRICAL LIGHTING PLAN',
      scale: '1/8" = 1\'-0"',
      revision: 'A',
      type: 'electrical-plan',
      content: this.generateElectricalPlan(electricalSystem),
      notes: [
        'All wiring to be THHN in EMT conduit',
        'Maintain 3% maximum voltage drop',
        'Coordinate with structural drawings for support locations'
      ],
      references: ['A-101', 'S-101']
    });

    // Single line diagram
    drawings.push({
      number: 'E-201',
      title: 'SINGLE LINE DIAGRAM',
      scale: 'NTS',
      revision: 'A',
      type: 'single-line',
      content: this.generateSingleLineDrawing(electricalSystem),
      notes: [
        'Breaker sizes shown are maximum',
        'Coordinate with utility for service requirements',
        'All panels to be labeled per schedule'
      ],
      references: ['E-301']
    });

    // Panel schedules
    electricalSystem.panels.forEach((panel, index) => {
      drawings.push({
        number: `E-301.${index + 1}`,
        title: `PANEL SCHEDULE - ${panel.name}`,
        scale: 'N/A',
        revision: 'A',
        type: 'panel-schedule',
        content: this.generatePanelSchedule(panel),
        notes: [
          'Verify load calculations before installation',
          'Spare breakers to be installed in bottom positions'
        ],
        references: ['E-201']
      });
    });

    // Mounting details
    mountingDetails.forEach((detail, index) => {
      drawings.push({
        number: `E-501.${index + 1}`,
        title: `MOUNTING DETAIL - ${detail.name.toUpperCase()}`,
        scale: 'AS NOTED',
        revision: 'A',
        type: 'mounting-details',
        content: this.generateMountingDetailDrawing(detail),
        notes: detail.notes,
        references: ['E-101', 'S-101']
      });
    });

    return drawings;
  }

  /**
   * Generate specifications
   */
  private generateSpecifications(
    components: Array<{ sku: string; quantity: number }>
  ): Specification[] {
    return [
      {
        section: '26 50 00',
        title: 'LIGHTING',
        content: [
          {
            part: '1',
            title: 'GENERAL',
            paragraphs: [
              {
                number: '1.01',
                title: 'SUMMARY',
                text: 'This section includes furnishing and installation of horticultural lighting systems including fixtures, controls, mounting systems, and associated electrical work.'
              },
              {
                number: '1.02',
                title: 'SUBMITTALS',
                text: 'Submit product data sheets, shop drawings, and installation instructions for all lighting equipment.',
                subParagraphs: [
                  {
                    number: 'A',
                    title: 'Product Data',
                    text: 'Include photometric data, electrical characteristics, and mounting details.'
                  },
                  {
                    number: 'B',
                    title: 'Certifications',
                    text: 'Provide DLC, UL, and other required certifications.'
                  }
                ]
              }
            ]
          },
          {
            part: '2',
            title: 'PRODUCTS',
            paragraphs: this.generateProductSpecifications(components)
          },
          {
            part: '3',
            title: 'EXECUTION',
            paragraphs: [
              {
                number: '3.01',
                title: 'INSTALLATION',
                text: 'Install lighting systems in accordance with manufacturer instructions and approved shop drawings.'
              },
              {
                number: '3.02',
                title: 'TESTING',
                text: 'Test all circuits for proper operation. Verify PPFD levels meet design requirements.'
              }
            ]
          }
        ]
      }
    ];
  }

  /**
   * Generate bill of materials
   */
  private generateBOM(
    components: Array<{ sku: string; quantity: number }>
  ): BillOfMaterials {
    const categories = new Map<string, BOMItem[]>();
    let totalCost = 0;
    let lineNumber = 1;

    // Group by category
    for (const item of components) {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        const category = component.category;
        if (!categories.has(category)) {
          categories.set(category, []);
        }

        const bomItem: BOMItem = {
          lineNumber: lineNumber++,
          sku: component.sku,
          manufacturer: component.manufacturer,
          description: component.description,
          quantity: item.quantity,
          unit: 'EA',
          unitPrice: component.price,
          totalPrice: component.price * item.quantity,
          supplier: component.supplier.name,
          leadTime: component.leadTime,
          notes: component.installationRequirements.notes
        };

        categories.get(category)!.push(bomItem);
        totalCost += bomItem.totalPrice;
      }
    }

    // Create category array
    const bomCategories: BOMCategory[] = [];
    categories.forEach((items, name) => {
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      bomCategories.push({ name, items, subtotal });
    });

    const taxRate = 0.0875; // 8.75% sales tax
    const taxAmount = totalCost * taxRate;
    const shippingEstimate = totalCost * 0.05; // 5% shipping estimate
    const grandTotal = totalCost + taxAmount + shippingEstimate;

    return {
      summary: {
        totalItems: components.reduce((sum, item) => sum + item.quantity, 0),
        totalCost,
        taxRate,
        taxAmount,
        shippingEstimate,
        grandTotal
      },
      categories: bomCategories,
      alternates: [],
      procurement: this.generateProcurementInfo(bomCategories)
    };
  }

  /**
   * Generate installation manual
   */
  private generateInstallationManual(
    electricalSystem: ElectricalSystem,
    mountingDetails: MountingDetail[]
  ): InstallationManual {
    return {
      tableOfContents: [
        {
          section: '1',
          title: 'Safety Requirements',
          page: 1,
          subsections: [
            { section: '1.1', title: 'General Safety', page: 2 },
            { section: '1.2', title: 'Electrical Safety', page: 3 },
            { section: '1.3', title: 'Fall Protection', page: 4 }
          ]
        },
        {
          section: '2',
          title: 'Installation Phases',
          page: 5,
          subsections: [
            { section: '2.1', title: 'Phase 1: Structural', page: 6 },
            { section: '2.2', title: 'Phase 2: Electrical Rough-In', page: 10 },
            { section: '2.3', title: 'Phase 3: Equipment Installation', page: 15 },
            { section: '2.4', title: 'Phase 4: Commissioning', page: 20 }
          ]
        }
      ],
      safety: {
        generalSafety: [
          'All personnel must attend site safety orientation',
          'Hard hats required at all times',
          'Safety glasses required when cutting or drilling',
          'Report all injuries immediately'
        ],
        electricalSafety: [
          'Verify circuits are de-energized before work',
          'Use lockout/tagout procedures',
          'Only licensed electricians to perform electrical work',
          'Test equipment must be calibrated'
        ],
        structuralSafety: [
          'Verify structural capacity before loading',
          'Use fall protection above 6 feet',
          'Inspect all rigging equipment daily',
          'Do not exceed rated loads'
        ],
        ppe: [
          'Hard hat',
          'Safety glasses',
          'Work gloves',
          'Steel-toed boots',
          'High-visibility vest',
          'Fall protection harness (when required)'
        ],
        emergencyContacts: [
          { service: 'Emergency', phone: '911' },
          { service: 'Site Safety Manager', phone: '555-0100' },
          { service: 'Local Hospital', phone: '555-0200' }
        ]
      },
      phases: this.generateInstallationPhases(electricalSystem, mountingDetails),
      testing: this.generateTestingProcedures(electricalSystem),
      troubleshooting: this.generateTroubleshootingGuide()
    };
  }

  /**
   * Helper methods for generating specific content
   */
  private generateCoverSheet(): DrawingContent {
    return {
      layers: [
        { name: 'Border', visible: true, locked: true, color: 'black', lineWeight: 2 },
        { name: 'Text', visible: true, locked: false, color: 'black', lineWeight: 1 }
      ],
      titleBlock: {
        projectName: this.project.name,
        drawingTitle: 'COVER SHEET',
        drawingNumber: 'G-001',
        scale: 'N/A',
        date: new Date().toLocaleDateString(),
        drawnBy: 'CAD',
        checkedBy: this.project.engineer.name,
        revision: 'A'
      },
      viewport: { x: 0, y: 0, width: 36, height: 24, scale: 1 },
      elements: [] // Would contain actual drawing elements
    };
  }

  private generateElectricalPlan(electricalSystem: ElectricalSystem): DrawingContent {
    // Implementation would generate actual electrical plan drawing
    return this.generateCoverSheet(); // Placeholder
  }

  private generateSingleLineDrawing(electricalSystem: ElectricalSystem): DrawingContent {
    // Implementation would convert single line diagram to drawing format
    return this.generateCoverSheet(); // Placeholder
  }

  private generatePanelSchedule(panel: Panel): DrawingContent {
    // Implementation would generate panel schedule drawing
    return this.generateCoverSheet(); // Placeholder
  }

  private generateMountingDetailDrawing(detail: MountingDetail): DrawingContent {
    // Implementation would convert mounting detail to drawing format
    return this.generateCoverSheet(); // Placeholder
  }

  private generateProductSpecifications(
    components: Array<{ sku: string; quantity: number }>
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const componentsByType = new Map<string, ConstructionComponent[]>();

    // Group components by type
    components.forEach(item => {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        const type = component.type;
        if (!componentsByType.has(type)) {
          componentsByType.set(type, []);
        }
        componentsByType.get(type)!.push(component);
      }
    });

    // Generate paragraphs for each type
    let paragraphNumber = 2.01;
    componentsByType.forEach((comps, type) => {
      paragraphs.push({
        number: paragraphNumber.toFixed(2),
        title: type.toUpperCase().replace(/-/g, ' '),
        text: `The following ${type} products are approved for use:`,
        subParagraphs: comps.map((comp, index) => ({
          number: String.fromCharCode(65 + index), // A, B, C...
          title: `${comp.manufacturer} ${comp.model}`,
          text: `${comp.description}. SKU: ${comp.sku}`
        }))
      });
      paragraphNumber += 0.01;
    });

    return paragraphs;
  }

  private generateProcurementInfo(categories: BOMCategory[]): ProcurementInfo {
    const supplierMap = new Map<string, SupplierOrder>();

    // Group by supplier
    categories.forEach(category => {
      category.items.forEach(item => {
        if (!supplierMap.has(item.supplier)) {
          supplierMap.set(item.supplier, {
            supplier: item.supplier,
            items: [],
            subtotal: 0,
            orderNotes: []
          });
        }
        const order = supplierMap.get(item.supplier)!;
        order.items.push(item.sku);
        order.subtotal += item.totalPrice;
      });
    });

    return {
      suppliers: Array.from(supplierMap.values()),
      deliverySchedule: [
        {
          phase: 1,
          description: 'Structural and Mounting Hardware',
          items: [], // Would be populated based on categories
          deliveryDate: new Date(),
          storageLocation: 'Site Storage Container A'
        }
      ],
      storageRequirements: [
        'Dry, secure storage required for electrical components',
        'Temperature-controlled storage for sensitive equipment',
        'Minimum 500 sq ft storage area required'
      ]
    };
  }

  private generateInstallationPhases(
    electricalSystem: ElectricalSystem,
    mountingDetails: MountingDetail[]
  ): InstallationPhase[] {
    return [
      {
        number: 1,
        name: 'Electrical Infrastructure',
        duration: 5,
        prerequisites: [
          'Building dried in',
          'Structural framing complete',
          'Electrical service available'
        ],
        crews: [
          { trade: 'Electrician', quantity: 4, hours: 160, certification: 'Licensed' },
          { trade: 'Helper', quantity: 2, hours: 80 }
        ],
        tasks: [], // Would be populated based on electrical system
        inspections: [
          {
            type: 'Electrical Rough-In',
            description: 'Conduit and wire installation',
            criteria: ['Conduit properly supported', 'Wire sized correctly', 'Grounds installed'],
            signOff: 'Electrical Inspector'
          }
        ]
      }
    ];
  }

  private generateTestingProcedures(electricalSystem: ElectricalSystem): TestingProcedures {
    return {
      electrical: [
        {
          name: 'Continuity Test',
          equipment: ['Digital Multimeter', 'Test Leads'],
          procedure: [
            'Verify main breaker is OFF',
            'Test continuity of all circuit conductors',
            'Verify no shorts to ground',
            'Document results'
          ],
          acceptanceCriteria: ['Continuity < 1 ohm', 'No shorts detected'],
          results: []
        }
      ],
      mechanical: [],
      controls: [],
      integrated: []
    };
  }

  private generateTroubleshootingGuide(): TroubleshootingGuide {
    return {
      commonIssues: [
        {
          symptom: 'Fixture not illuminating',
          possibleCauses: [
            'Circuit breaker tripped',
            'Loose connection',
            'Failed driver',
            'Control system issue'
          ],
          checkProcedure: [
            'Check circuit breaker status',
            'Verify voltage at fixture',
            'Check control signal',
            'Inspect connections'
          ],
          solutions: [
            'Reset breaker if tripped',
            'Tighten all connections',
            'Replace driver if failed',
            'Troubleshoot control system'
          ]
        }
      ],
      diagnosticFlowcharts: []
    };
  }

  private generatePermitRequirements(electricalSystem: ElectricalSystem): PermitRequirements {
    return {
      required: [
        {
          type: 'Electrical',
          authority: 'Local Building Department',
          requirements: [
            'Licensed contractor',
            'Load calculations',
            'Single line diagram',
            'Panel schedules'
          ],
          forms: ['Electrical Permit Application', 'Load Calculation Form'],
          fee: 500
        }
      ],
      submitted: [],
      inspections: []
    };
  }

  private generateCommissioningPlan(electricalSystem: ElectricalSystem): CommissioningPlan {
    return {
      overview: 'Systematic process to verify all systems operate as designed',
      systems: [],
      startupSequence: [],
      performanceTests: [],
      training: {
        sessions: [],
        materials: [],
        certification: 'Operator Certification'
      },
      documentation: []
    };
  }

  private generateAsBuiltTemplate(): AsBuiltDocumentation {
    return {
      drawings: [],
      photos: [],
      changes: [],
      warranties: [],
      manuals: []
    };
  }
}