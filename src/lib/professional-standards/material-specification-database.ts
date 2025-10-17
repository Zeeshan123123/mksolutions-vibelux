/**
 * Advanced Material Specification Database
 * Comprehensive database of construction materials with specifications,
 * testing data, code compliance, and cost information
 */

export interface MaterialSpecification {
  id: string;
  name: string;
  category: MaterialCategory;
  subcategory: string;
  manufacturer: ManufacturerInfo;
  model: string;
  description: string;
  physicalProperties: PhysicalProperties;
  mechanicalProperties?: MechanicalProperties;
  thermalProperties?: ThermalProperties;
  electricalProperties?: ElectricalProperties;
  chemicalProperties?: ChemicalProperties;
  sustainability: SustainabilityData;
  compliance: ComplianceData;
  testing: TestingData;
  installation: InstallationData;
  maintenance: MaintenanceData;
  warranty: WarrantyInfo;
  cost: CostData;
  availability: AvailabilityData;
  documents: DocumentReference[];
  revisionHistory: RevisionRecord[];
  lastUpdated: Date;
  approvedBy?: string;
}

export type MaterialCategory = 
  | 'structural'
  | 'glazing'
  | 'insulation'
  | 'sealants'
  | 'hardware'
  | 'electrical'
  | 'mechanical'
  | 'plumbing'
  | 'irrigation'
  | 'flooring'
  | 'roofing'
  | 'finishes'
  | 'equipment';

export interface ManufacturerInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  representative?: ContactInfo;
  certifications: string[];
  qualityManagement: string; // ISO 9001, etc.
}

export interface ContactInfo {
  name: string;
  title: string;
  phone: string;
  email: string;
  territory?: string;
}

export interface PhysicalProperties {
  dimensions?: {
    length?: Measurement;
    width?: Measurement;
    height?: Measurement;
    thickness?: Measurement;
    diameter?: Measurement;
  };
  weight?: Measurement;
  density?: Measurement;
  color?: string;
  finish?: string;
  texture?: string;
  transparency?: number; // 0-100%
  hardness?: Measurement;
}

export interface MechanicalProperties {
  tensileStrength?: Measurement;
  compressiveStrength?: Measurement;
  flexuralStrength?: Measurement;
  shearStrength?: Measurement;
  elasticModulus?: Measurement;
  poissonRatio?: number;
  fatigueLimit?: Measurement;
  impactStrength?: Measurement;
  elongation?: number; // %
  ductility?: string;
}

export interface ThermalProperties {
  conductivity?: Measurement; // W/m·K
  resistance?: Measurement; // R-value
  expansion?: Measurement; // per °C
  maxTemperature?: Measurement;
  minTemperature?: Measurement;
  meltingPoint?: Measurement;
  specificHeat?: Measurement;
  emissivity?: number;
  fireRating?: string;
}

export interface ElectricalProperties {
  resistance?: Measurement;
  conductivity?: Measurement;
  dielectricStrength?: Measurement;
  dielectricConstant?: number;
  powerFactor?: number;
  insulationClass?: string;
  voltage?: Measurement;
  current?: Measurement;
  frequency?: Measurement;
}

export interface ChemicalProperties {
  composition?: ChemicalComposition[];
  corrosionResistance?: string;
  chemicalResistance?: ChemicalResistance[];
  ph?: number;
  solubility?: string;
  flammability?: FlammabilityData;
  toxicity?: ToxicityData;
  environmentalImpact?: EnvironmentalImpact;
}

export interface ChemicalComposition {
  element: string;
  percentage: number;
  tolerance?: number;
}

export interface ChemicalResistance {
  chemical: string;
  resistance: 'excellent' | 'good' | 'fair' | 'poor' | 'not-recommended';
  conditions?: string;
}

export interface FlammabilityData {
  flameSpread?: number;
  smokeIndex?: number;
  ignititionTemperature?: Measurement;
  flashPoint?: Measurement;
  toxicGases?: string[];
}

export interface ToxicityData {
  acuteToxicity?: string;
  chronicToxicity?: string;
  carcinogenic?: boolean;
  reproductive?: string;
  respiratory?: string;
  skin?: string;
  eye?: string;
}

export interface EnvironmentalImpact {
  embodiedEnergy?: Measurement;
  carbonFootprint?: Measurement;
  recyclable?: boolean;
  recycledContent?: number; // %
  voc?: Measurement;
  ozone?: string;
  biodegradable?: boolean;
}

export interface Measurement {
  value: number;
  unit: string;
  tolerance?: number;
  testMethod?: string;
  conditions?: string;
}

export interface SustainabilityData {
  leedCredits?: LEEDCredit[];
  breeamRating?: string;
  greenGuardCertified?: boolean;
  energyStarRated?: boolean;
  recycledContent?: number; // %
  recyclability?: number; // %
  regionalMaterial?: boolean;
  rapidlyRenewable?: boolean;
  carbonNeutral?: boolean;
  lifecycleAssessment?: string;
}

export interface LEEDCredit {
  category: string;
  credit: string;
  points: number;
  requirements: string;
}

export interface ComplianceData {
  standards: StandardCompliance[];
  certifications: CertificationData[];
  codes: CodeCompliance[];
  testing: TestingCompliance[];
  approvals: ApprovalData[];
}

export interface StandardCompliance {
  standard: string; // ASTM, ISO, ANSI, etc.
  specification: string;
  grade?: string;
  class?: string;
  type?: string;
  compliance: 'full' | 'partial' | 'exceeds';
  notes?: string;
}

export interface CertificationData {
  certification: string;
  certifyingBody: string;
  certificateNumber?: string;
  issueDate?: Date;
  expirationDate?: Date;
  scope?: string;
}

export interface CodeCompliance {
  code: string; // IBC, NEC, IMC, etc.
  section?: string;
  requirement: string;
  compliance: 'compliant' | 'exceeds' | 'not-applicable';
  notes?: string;
}

export interface TestingCompliance {
  testStandard: string;
  testMethod: string;
  testResult: string;
  passFail: 'pass' | 'fail' | 'conditional';
  testDate?: Date;
  testLab?: string;
  reportNumber?: string;
}

export interface ApprovalData {
  authority: string;
  approvalNumber?: string;
  approvalDate?: Date;
  expirationDate?: Date;
  conditions?: string[];
}

export interface InstallationData {
  methods: InstallationMethod[];
  tools: string[];
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'specialized';
  certification?: string;
  safety: SafetyRequirement[];
  environmental: EnvironmentalRequirement[];
  quality: QualityRequirement[];
  sequence: InstallationStep[];
}

export interface InstallationMethod {
  method: string;
  description: string;
  applicability: string[];
  advantages?: string[];
  disadvantages?: string[];
  cost?: 'low' | 'medium' | 'high';
}

export interface SafetyRequirement {
  hazard: string;
  protection: string;
  training?: string;
  equipment?: string[];
}

export interface EnvironmentalRequirement {
  parameter: string; // temperature, humidity, wind, etc.
  acceptable: string;
  optimal?: string;
  restrictions?: string;
}

export interface QualityRequirement {
  aspect: string;
  requirement: string;
  tolerance?: string;
  inspection?: string;
  testing?: string;
}

export interface InstallationStep {
  step: number;
  description: string;
  duration?: string;
  crew?: number;
  dependencies?: number[]; // other step numbers
  quality?: string;
  safety?: string;
}

export interface MaintenanceData {
  schedule: MaintenanceSchedule[];
  procedures: MaintenanceProcedure[];
  troubleshooting: TroubleshootingGuide[];
  replacement: ReplacementData;
}

export interface MaintenanceSchedule {
  interval: string; // daily, weekly, monthly, annually
  task: string;
  duration?: string;
  skillLevel: 'basic' | 'intermediate' | 'advanced';
  tools?: string[];
  materials?: string[];
}

export interface MaintenanceProcedure {
  task: string;
  steps: string[];
  safety?: string[];
  quality?: string[];
  documentation?: string;
}

export interface TroubleshootingGuide {
  symptom: string;
  possibleCauses: string[];
  solutions: string[];
  preventive?: string[];
}

export interface ReplacementData {
  expectedLife: string;
  indicators: string[];
  procedure: string;
  disposal: string;
  recycling?: string;
}

export interface WarrantyInfo {
  duration: string;
  coverage: string[];
  exclusions?: string[];
  conditions?: string[];
  transferable?: boolean;
  registration?: boolean;
  contact: ContactInfo;
}

export interface CostData {
  unitCost: number;
  unit: string;
  currency: string;
  priceDate: Date;
  source: string;
  laborCost?: number;
  laborUnit?: string;
  equipmentCost?: number;
  shipping?: number;
  minimumOrder?: number;
  volumeDiscounts?: VolumeDiscount[];
  regionalVariation?: RegionalPricing[];
}

export interface VolumeDiscount {
  quantity: number;
  discount: number; // %
  unit: string;
}

export interface RegionalPricing {
  region: string;
  factor: number; // multiplier
  notes?: string;
}

export interface AvailabilityData {
  leadTime: string;
  stockStatus: 'in-stock' | 'limited' | 'backorder' | 'discontinued';
  minimumOrder?: number;
  orderMultiple?: number;
  distributors: DistributorInfo[];
  seasonality?: string;
  alternatives?: string[]; // alternative material IDs
}

export interface DistributorInfo {
  name: string;
  location: string;
  contact: ContactInfo;
  serviceArea: string[];
  inventory?: boolean;
  specializations?: string[];
}

export interface DocumentReference {
  type: 'datasheet' | 'specification' | 'installation-guide' | 'test-report' | 'certification' | 'cad-drawing' | 'photo';
  title: string;
  url?: string;
  filePath?: string;
  version?: string;
  date?: Date;
  language?: string;
}

export interface RevisionRecord {
  version: string;
  date: Date;
  author: string;
  changes: string[];
  approvedBy?: string;
}

/**
 * Material Specification Database Management System
 */
export class MaterialSpecificationDatabase {
  private materials: Map<string, MaterialSpecification> = new Map();
  private categories: Map<MaterialCategory, string[]> = new Map();
  private manufacturers: Map<string, string[]> = new Map();

  constructor() {
    this.initializeStandardMaterials();
  }

  private initializeStandardMaterials(): void {
    // Structural Materials
    this.addMaterial(this.createStructuralSteelSpec());
    this.addMaterial(this.createConcreteSpec());
    this.addMaterial(this.createAluminumFrameSpec());
    
    // Glazing Materials
    this.addMaterial(this.createTemperedGlassSpec());
    this.addMaterial(this.createPolycarbonateSpec());
    this.addMaterial(this.createAcrylicSpec());
    
    // Hardware
    this.addMaterial(this.createAnchorBoltSpec());
    this.addMaterial(this.createStructuralBoltSpec());
    this.addMaterial(this.createSealantSpec());
    
    // Electrical
    this.addMaterial(this.createElectricalConduitSpec());
    this.addMaterial(this.createWireSpec());
    this.addMaterial(this.createLightingFixtureSpec());
    
    // Mechanical
    this.addMaterial(this.createHVACDuctSpec());
    this.addMaterial(this.createInsulationSpec());
    this.addMaterial(this.createVibrationIsolatorSpec());
  }

  private createStructuralSteelSpec(): MaterialSpecification {
    return {
      id: 'STEEL-A36',
      name: 'Structural Steel - ASTM A36',
      category: 'structural',
      subcategory: 'hot-rolled-steel',
      manufacturer: {
        name: 'Multiple Suppliers',
        address: 'Various',
        phone: '',
        email: '',
        website: '',
        certifications: ['ISO 9001', 'AISC Certified'],
        qualityManagement: 'ISO 9001:2015'
      },
      model: 'A36',
      description: 'Carbon structural steel for general construction use',
      physicalProperties: {
        density: { value: 490, unit: 'pcf', testMethod: 'ASTM A36' },
        color: 'Steel gray',
        finish: 'Mill finish'
      },
      mechanicalProperties: {
        tensileStrength: { value: 58000, unit: 'psi', testMethod: 'ASTM A370' },
        yieldStrength: { value: 36000, unit: 'psi', testMethod: 'ASTM A370' },
        elasticModulus: { value: 29000000, unit: 'psi', testMethod: 'ASTM A370' },
        elongation: 20,
        ductility: 'High'
      },
      thermalProperties: {
        conductivity: { value: 26, unit: 'W/m·K' },
        expansion: { value: 12, unit: '×10⁻⁶/°C' },
        maxTemperature: { value: 1000, unit: '°F' },
        meltingPoint: { value: 2750, unit: '°F' }
      },
      chemicalProperties: {
        composition: [
          { element: 'Carbon', percentage: 0.26, tolerance: 0.03 },
          { element: 'Manganese', percentage: 0.80, tolerance: 0.20 },
          { element: 'Silicon', percentage: 0.40, tolerance: 0.15 },
          { element: 'Sulfur', percentage: 0.05, tolerance: 0.01 },
          { element: 'Phosphorus', percentage: 0.05, tolerance: 0.01 }
        ],
        corrosionResistance: 'Poor - requires protection',
        flammability: {
          ignititionTemperature: { value: 2750, unit: '°F' }
        }
      },
      sustainability: {
        recycledContent: 90,
        recyclability: 100,
        regionalMaterial: true,
        carbonNeutral: false,
        embodiedEnergy: { value: 24, unit: 'MJ/kg' }
      },
      compliance: {
        standards: [
          {
            standard: 'ASTM A36',
            specification: 'A36/A36M-19',
            compliance: 'full'
          },
          {
            standard: 'AISC 360',
            specification: 'AISC 360-16',
            compliance: 'full'
          }
        ],
        codes: [
          {
            code: 'IBC 2021',
            requirement: 'Structural steel requirements',
            compliance: 'compliant'
          }
        ],
        certifications: [
          {
            certification: 'Mill Test Certificate',
            certifyingBody: 'Steel Mill',
            scope: 'Chemical and mechanical properties'
          }
        ],
        testing: [],
        approvals: []
      },
      testing: {
        required: [
          {
            test: 'Tensile Test',
            standard: 'ASTM A370',
            frequency: 'Per heat',
            acceptance: 'Min 58 ksi tensile, 36 ksi yield'
          },
          {
            test: 'Chemical Analysis',
            standard: 'ASTM A36',
            frequency: 'Per heat',
            acceptance: 'Within specification limits'
          }
        ],
        optional: []
      },
      installation: {
        methods: [
          {
            method: 'Welding',
            description: 'AWS D1.1 welding procedures',
            applicability: ['field-connections', 'shop-fabrication'],
            advantages: ['Strong joints', 'Economical'],
            cost: 'medium'
          },
          {
            method: 'Bolting',
            description: 'High-strength bolted connections',
            applicability: ['field-connections', 'removable-connections'],
            advantages: ['Reversible', 'No heat'],
            cost: 'low'
          }
        ],
        tools: ['Welding equipment', 'Crane', 'Cutting torch', 'Grinder'],
        skillLevel: 'advanced',
        certification: 'AWS certified welder',
        safety: [
          {
            hazard: 'Hot metal',
            protection: 'Heat-resistant gloves and clothing'
          },
          {
            hazard: 'Fumes',
            protection: 'Adequate ventilation'
          }
        ],
        environmental: [
          {
            parameter: 'Temperature',
            acceptable: '-20°F to 100°F',
            optimal: '32°F to 80°F'
          }
        ],
        quality: [
          {
            aspect: 'Weld quality',
            requirement: 'Visual inspection per AWS D1.1',
            inspection: 'Certified welding inspector'
          }
        ],
        sequence: [
          {
            step: 1,
            description: 'Material inspection and preparation',
            duration: '1 hour'
          },
          {
            step: 2,
            description: 'Layout and cutting',
            duration: '2 hours',
            dependencies: [1]
          },
          {
            step: 3,
            description: 'Fit-up and welding',
            duration: '4 hours',
            dependencies: [2]
          }
        ]
      },
      maintenance: {
        schedule: [
          {
            interval: 'annually',
            task: 'Visual inspection for corrosion',
            duration: '2 hours',
            skillLevel: 'basic'
          },
          {
            interval: '5 years',
            task: 'Repainting if required',
            duration: '1 day',
            skillLevel: 'intermediate',
            materials: ['primer', 'paint']
          }
        ],
        procedures: [
          {
            task: 'Corrosion repair',
            steps: [
              'Remove rust by wire brushing',
              'Apply primer to bare metal',
              'Apply finish coat'
            ],
            safety: ['Respiratory protection', 'Eye protection']
          }
        ],
        troubleshooting: [
          {
            symptom: 'Surface rust',
            possibleCauses: ['Moisture exposure', 'Coating failure'],
            solutions: ['Clean and repaint', 'Improve drainage'],
            preventive: ['Regular inspection', 'Proper coating']
          }
        ],
        replacement: {
          expectedLife: '50+ years with proper maintenance',
          indicators: ['Severe corrosion', 'Structural damage'],
          procedure: 'Remove and replace with new members',
          disposal: 'Recycle at scrap yard'
        }
      },
      warranty: {
        duration: '1 year',
        coverage: ['Material defects'],
        exclusions: ['Corrosion', 'Improper installation'],
        contact: {
          name: 'Steel Supplier',
          title: 'Customer Service',
          phone: '1-800-STEEL',
          email: 'support@steel.com'
        }
      },
      cost: {
        unitCost: 0.85,
        unit: 'lb',
        currency: 'USD',
        priceDate: new Date(),
        source: 'Regional steel supplier',
        laborCost: 2.50,
        laborUnit: 'lb',
        shipping: 0.10,
        volumeDiscounts: [
          { quantity: 10000, discount: 5, unit: 'lb' },
          { quantity: 50000, discount: 10, unit: 'lb' }
        ]
      },
      availability: {
        leadTime: '2-4 weeks',
        stockStatus: 'in-stock',
        minimumOrder: 500,
        distributors: [
          {
            name: 'Local Steel Supply',
            location: 'Regional',
            contact: {
              name: 'Sales Department',
              title: 'Sales',
              phone: '555-0123',
              email: 'sales@localsteel.com'
            },
            serviceArea: ['Midwest', 'Southeast']
          }
        ]
      },
      documents: [
        {
          type: 'specification',
          title: 'ASTM A36 Specification',
          url: 'https://www.astm.org/Standards/A36'
        },
        {
          type: 'datasheet',
          title: 'A36 Steel Properties',
          filePath: '/docs/materials/A36-datasheet.pdf'
        }
      ],
      revisionHistory: [
        {
          version: '1.0',
          date: new Date(),
          author: 'Materials Engineer',
          changes: ['Initial specification']
        }
      ],
      lastUpdated: new Date()
    };
  }

  private createTemperedGlassSpec(): MaterialSpecification {
    return {
      id: 'GLASS-TEMP-6MM',
      name: 'Tempered Safety Glass - 6mm',
      category: 'glazing',
      subcategory: 'safety-glazing',
      manufacturer: {
        name: 'Guardian Glass',
        address: '2300 Harmon Rd, Auburn Hills, MI 48326',
        phone: '248-340-1800',
        email: 'info@guardian.com',
        website: 'https://www.guardian.com',
        certifications: ['ISO 9001', 'SGCC Member'],
        qualityManagement: 'ISO 9001:2015'
      },
      model: 'ClimaGuard Premium²',
      description: '6mm tempered safety glass with low-E coating for greenhouse applications',
      physicalProperties: {
        dimensions: {
          thickness: { value: 6, unit: 'mm', tolerance: 0.2 }
        },
        weight: { value: 3.3, unit: 'lb/sf' },
        density: { value: 160, unit: 'pcf' },
        color: 'Clear',
        finish: 'Smooth',
        transparency: 90
      },
      mechanicalProperties: {
        tensileStrength: { value: 24000, unit: 'psi', testMethod: 'ASTM C1048' },
        compressiveStrength: { value: 120000, unit: 'psi' },
        flexuralStrength: { value: 10000, unit: 'psi' },
        elasticModulus: { value: 10000000, unit: 'psi' }
      },
      thermalProperties: {
        conductivity: { value: 1.0, unit: 'W/m·K' },
        expansion: { value: 9.0, unit: '×10⁻⁶/°C' },
        maxTemperature: { value: 300, unit: '°C' },
        minTemperature: { value: -40, unit: '°C' }
      },
      chemicalProperties: {
        composition: [
          { element: 'SiO₂', percentage: 72.0 },
          { element: 'Na₂O', percentage: 14.2 },
          { element: 'CaO', percentage: 9.0 },
          { element: 'MgO', percentage: 2.5 },
          { element: 'Al₂O₃', percentage: 1.2 }
        ],
        corrosionResistance: 'Excellent',
        chemicalResistance: [
          { chemical: 'Water', resistance: 'excellent' },
          { chemical: 'Acids', resistance: 'good' },
          { chemical: 'Alkalis', resistance: 'fair' }
        ]
      },
      sustainability: {
        recycledContent: 30,
        recyclability: 100,
        regionalMaterial: false,
        voc: { value: 0, unit: 'g/L' },
        leedCredits: [
          {
            category: 'Energy & Atmosphere',
            credit: 'Optimize Energy Performance',
            points: 1,
            requirements: 'High-performance glazing'
          }
        ]
      },
      compliance: {
        standards: [
          {
            standard: 'ANSI Z97.1',
            specification: 'Safety Glazing Materials',
            grade: 'Category II',
            compliance: 'full'
          },
          {
            standard: 'ASTM C1048',
            specification: 'Heat-Strengthened and Fully Tempered Flat Glass',
            type: 'Fully Tempered',
            compliance: 'full'
          }
        ],
        codes: [
          {
            code: 'IBC 2021',
            section: '2406',
            requirement: 'Safety glazing requirements',
            compliance: 'compliant'
          }
        ],
        certifications: [
          {
            certification: 'SGCC Certification',
            certifyingBody: 'Safety Glazing Certification Council',
            certificateNumber: 'SGCC-1234',
            scope: 'Tempered glass safety requirements'
          }
        ],
        testing: [
          {
            testStandard: 'ANSI Z97.1',
            testMethod: 'Impact test',
            testResult: 'Pass',
            passFail: 'pass'
          }
        ],
        approvals: []
      },
      testing: {
        required: [
          {
            test: 'Impact Test',
            standard: 'ANSI Z97.1',
            frequency: 'Per batch',
            acceptance: 'Break safely into small pieces'
          },
          {
            test: 'Thermal Stress Test',
            standard: 'ASTM C1048',
            frequency: 'Per production run',
            acceptance: 'No spontaneous breakage'
          }
        ],
        optional: [
          {
            test: 'U-Value Testing',
            standard: 'ASTM C518',
            frequency: 'Annual',
            acceptance: 'Meet energy performance requirements'
          }
        ]
      },
      installation: {
        methods: [
          {
            method: 'Structural Glazing',
            description: 'Glazing with structural sealant',
            applicability: ['curtain-walls', 'structural-glazing'],
            advantages: ['Weather seal', 'Structural support']
          },
          {
            method: 'Conventional Glazing',
            description: 'Glazing with gaskets and stops',
            applicability: ['punched-openings', 'storefront'],
            advantages: ['Replaceable', 'Lower cost']
          }
        ],
        tools: ['Glass suction cups', 'Sealant gun', 'Rubber mallet'],
        skillLevel: 'specialized',
        certification: 'Certified glazier',
        safety: [
          {
            hazard: 'Glass breakage',
            protection: 'Cut-resistant gloves and safety glasses'
          },
          {
            hazard: 'Heavy lifting',
            protection: 'Mechanical lifting aids'
          }
        ],
        environmental: [
          {
            parameter: 'Temperature',
            acceptable: '40°F to 95°F',
            optimal: '65°F to 75°F',
            restrictions: 'No installation during precipitation'
          }
        ],
        quality: [
          {
            aspect: 'Glazing alignment',
            requirement: '±1/8" from true position',
            inspection: 'Visual and measurement'
          },
          {
            aspect: 'Sealant application',
            requirement: 'Complete continuous bead',
            inspection: 'Visual inspection'
          }
        ],
        sequence: [
          {
            step: 1,
            description: 'Prepare opening and check dimensions',
            duration: '30 minutes'
          },
          {
            step: 2,
            description: 'Install setting blocks and gaskets',
            duration: '15 minutes',
            dependencies: [1]
          },
          {
            step: 3,
            description: 'Position and secure glass',
            duration: '45 minutes',
            dependencies: [2]
          },
          {
            step: 4,
            description: 'Apply sealant and finish work',
            duration: '30 minutes',
            dependencies: [3]
          }
        ]
      },
      maintenance: {
        schedule: [
          {
            interval: 'monthly',
            task: 'Visual inspection for cracks or damage',
            duration: '15 minutes',
            skillLevel: 'basic'
          },
          {
            interval: 'quarterly',
            task: 'Clean glass surfaces',
            duration: '1 hour',
            skillLevel: 'basic',
            materials: ['glass cleaner', 'squeegee']
          },
          {
            interval: 'annually',
            task: 'Inspect sealant condition',
            duration: '30 minutes',
            skillLevel: 'intermediate'
          }
        ],
        procedures: [
          {
            task: 'Glass cleaning',
            steps: [
              'Use approved glass cleaner',
              'Clean with lint-free cloth',
              'Squeegee dry to prevent streaking'
            ],
            safety: ['Non-slip footwear', 'Fall protection if elevated']
          }
        ],
        troubleshooting: [
          {
            symptom: 'Condensation between panes',
            possibleCauses: ['Seal failure', 'Manufacturing defect'],
            solutions: ['Replace IGU', 'Check warranty'],
            preventive: ['Quality installation', 'Regular inspection']
          }
        ],
        replacement: {
          expectedLife: '25-30 years',
          indicators: ['Cracking', 'Seal failure', 'Impact damage'],
          procedure: 'Remove old glass and install new per installation procedures',
          disposal: 'Recycle at glass processing facility'
        }
      },
      warranty: {
        duration: '10 years',
        coverage: ['Manufacturing defects', 'Seal failure'],
        exclusions: ['Impact damage', 'Improper installation'],
        transferable: true,
        registration: true,
        contact: {
          name: 'Guardian Glass Warranty',
          title: 'Customer Service',
          phone: '1-866-482-7342',
          email: 'warranty@guardian.com'
        }
      },
      cost: {
        unitCost: 8.50,
        unit: 'sf',
        currency: 'USD',
        priceDate: new Date(),
        source: 'Glazing contractor',
        laborCost: 4.25,
        laborUnit: 'sf',
        shipping: 0.75,
        minimumOrder: 100,
        volumeDiscounts: [
          { quantity: 1000, discount: 5, unit: 'sf' },
          { quantity: 5000, discount: 10, unit: 'sf' }
        ]
      },
      availability: {
        leadTime: '3-4 weeks',
        stockStatus: 'limited',
        minimumOrder: 100,
        orderMultiple: 25,
        distributors: [
          {
            name: 'Commercial Glass & Glazing',
            location: 'Chicago, IL',
            contact: {
              name: 'Tom Johnson',
              title: 'Sales Manager',
              phone: '312-555-0199',
              email: 'tjohnson@comglass.com'
            },
            serviceArea: ['Illinois', 'Indiana', 'Wisconsin'],
            inventory: true
          }
        ],
        alternatives: ['GLASS-TEMP-5MM', 'GLASS-LAMI-6MM']
      },
      documents: [
        {
          type: 'datasheet',
          title: 'ClimaGuard Premium² Performance Data',
          url: 'https://www.guardian.com/climaguard'
        },
        {
          type: 'installation-guide',
          title: 'Structural Glazing Installation Guide',
          filePath: '/docs/glazing/installation-guide.pdf'
        },
        {
          type: 'certification',
          title: 'SGCC Certificate',
          filePath: '/docs/glazing/sgcc-cert.pdf'
        }
      ],
      revisionHistory: [
        {
          version: '1.0',
          date: new Date(),
          author: 'Glazing Specialist',
          changes: ['Initial specification entry']
        }
      ],
      lastUpdated: new Date()
    };
  }

  // Additional material creation methods would be implemented here...
  private createConcreteSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createAluminumFrameSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createPolycarbonateSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createAcrylicSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createAnchorBoltSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createStructuralBoltSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createSealantSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createElectricalConduitSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createWireSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createLightingFixtureSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createHVACDuctSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createInsulationSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }
  private createVibrationIsolatorSpec(): MaterialSpecification { /* Implementation */ return {} as MaterialSpecification; }

  public addMaterial(material: MaterialSpecification): void {
    this.materials.set(material.id, material);
    
    // Update category index
    if (!this.categories.has(material.category)) {
      this.categories.set(material.category, []);
    }
    this.categories.get(material.category)!.push(material.id);
    
    // Update manufacturer index
    const manufacturerName = material.manufacturer.name;
    if (!this.manufacturers.has(manufacturerName)) {
      this.manufacturers.set(manufacturerName, []);
    }
    this.manufacturers.get(manufacturerName)!.push(material.id);
  }

  public getMaterial(id: string): MaterialSpecification | undefined {
    return this.materials.get(id);
  }

  public getMaterialsByCategory(category: MaterialCategory): MaterialSpecification[] {
    const ids = this.categories.get(category) || [];
    return ids.map(id => this.materials.get(id)!).filter(m => m);
  }

  public getMaterialsByManufacturer(manufacturer: string): MaterialSpecification[] {
    const ids = this.manufacturers.get(manufacturer) || [];
    return ids.map(id => this.materials.get(id)!).filter(m => m);
  }

  public searchMaterials(criteria: SearchCriteria): MaterialSpecification[] {
    return Array.from(this.materials.values()).filter(material => {
      return this.matchesCriteria(material, criteria);
    });
  }

  private matchesCriteria(material: MaterialSpecification, criteria: SearchCriteria): boolean {
    // Text search
    if (criteria.text) {
      const searchText = criteria.text.toLowerCase();
      const searchableText = `
        ${material.name} 
        ${material.description} 
        ${material.manufacturer.name}
        ${material.model}
      `.toLowerCase();
      
      if (!searchableText.includes(searchText)) {
        return false;
      }
    }

    // Category filter
    if (criteria.category && material.category !== criteria.category) {
      return false;
    }

    // Manufacturer filter
    if (criteria.manufacturer && material.manufacturer.name !== criteria.manufacturer) {
      return false;
    }

    // Cost range filter
    if (criteria.costRange) {
      const cost = material.cost.unitCost;
      if (criteria.costRange.min && cost < criteria.costRange.min) return false;
      if (criteria.costRange.max && cost > criteria.costRange.max) return false;
    }

    // Property filters
    if (criteria.properties) {
      for (const [property, requirement] of Object.entries(criteria.properties)) {
        if (!this.checkPropertyRequirement(material, property, requirement)) {
          return false;
        }
      }
    }

    // Compliance filters
    if (criteria.compliance) {
      for (const requiredCompliance of criteria.compliance) {
        if (!this.hasCompliance(material, requiredCompliance)) {
          return false;
        }
      }
    }

    return true;
  }

  private checkPropertyRequirement(material: MaterialSpecification, property: string, requirement: any): boolean {
    // Implementation would check specific property requirements
    // This is a simplified version
    return true;
  }

  private hasCompliance(material: MaterialSpecification, requiredCompliance: string): boolean {
    return material.compliance.standards.some(std => std.standard === requiredCompliance) ||
           material.compliance.codes.some(code => code.code === requiredCompliance) ||
           material.compliance.certifications.some(cert => cert.certification === requiredCompliance);
  }

  public generateSpecificationSheet(materialId: string, format: 'pdf' | 'html' | 'word' = 'pdf'): string {
    const material = this.getMaterial(materialId);
    if (!material) {
      throw new Error(`Material ${materialId} not found`);
    }

    switch (format) {
      case 'pdf':
        return this.generatePDFSpecification(material);
      case 'html':
        return this.generateHTMLSpecification(material);
      case 'word':
        return this.generateWordSpecification(material);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generatePDFSpecification(material: MaterialSpecification): string {
    // PDF generation implementation
    return `PDF specification for ${material.name}`;
  }

  private generateHTMLSpecification(material: MaterialSpecification): string {
    return `
      <html>
        <head><title>${material.name} Specification</title></head>
        <body>
          <h1>${material.name}</h1>
          <h2>Manufacturer: ${material.manufacturer.name}</h2>
          <h3>Description</h3>
          <p>${material.description}</p>
          <!-- Additional specification details would be formatted here -->
        </body>
      </html>
    `;
  }

  private generateWordSpecification(material: MaterialSpecification): string {
    // Word document generation implementation
    return `Word specification for ${material.name}`;
  }

  public getAllMaterials(): MaterialSpecification[] {
    return Array.from(this.materials.values());
  }

  public getCategories(): MaterialCategory[] {
    return Array.from(this.categories.keys());
  }

  public getManufacturers(): string[] {
    return Array.from(this.manufacturers.keys());
  }

  public getMaterialCount(): number {
    return this.materials.size;
  }

  public getCategoryCount(category: MaterialCategory): number {
    return this.categories.get(category)?.length || 0;
  }
}

export interface SearchCriteria {
  text?: string;
  category?: MaterialCategory;
  manufacturer?: string;
  costRange?: {
    min?: number;
    max?: number;
  };
  properties?: Record<string, any>;
  compliance?: string[];
}

export interface TestingData {
  required: TestRequirement[];
  optional: TestRequirement[];
}

export interface TestRequirement {
  test: string;
  standard: string;
  frequency: string;
  acceptance: string;
}

// Export singleton instance
export const materialDatabase = new MaterialSpecificationDatabase();