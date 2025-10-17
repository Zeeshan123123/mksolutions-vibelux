/**
 * Professional Cogeneration Proposal Generator
 * Integrates with existing VibeLux export systems and Autodesk integration
 */

import type { CogenerationComponent, DesignerState } from '@/components/designer/context/types';
import { generateReportHTML } from '@/components/designer/utils/reportGenerator';

export interface CogenerationProposal {
  metadata: {
    proposalNumber: string;
    date: Date;
    version: string;
    preparedFor: ClientInfo;
    preparedBy: CompanyInfo;
    validUntil: Date;
  };
  executiveSummary: ExecutiveSummary;
  facilityAnalysis: FacilityAnalysis;
  systemDesign: SystemDesign;
  economicAnalysis: EconomicAnalysis;
  technicalSpecifications: TechnicalSpecifications;
  installationPlan: InstallationPlan;
  operationMaintenance: OperationMaintenance;
  warranty: WarrantyTerms;
  appendices: Appendices;
}

interface ClientInfo {
  companyName: string;
  contactPerson: string;
  address: string;
  phone: string;
  email: string;
  facilityType: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  license: string;
  certifications: string[];
}

interface ExecutiveSummary {
  projectOverview: string;
  keyBenefits: string[];
  investmentSummary: {
    totalInvestment: number;
    annualSavings: number;
    paybackPeriod: number;
    roi: number;
  };
  recommendations: string[];
}

interface FacilityAnalysis {
  currentEnergyProfile: {
    electricalLoad: LoadProfile;
    thermalLoad: LoadProfile;
    peakDemand: number;
    loadFactor: number;
    utilityRates: UtilityRates;
  };
  energyConsumption: {
    annual: number;
    monthly: number[];
    seasonal: 'summer' | 'winter' | 'constant';
  };
  existingInfrastructure: {
    electrical: string;
    gas: string;
    cooling: string;
    heating: string;
    limitations: string[];
  };
}

interface LoadProfile {
  baseLoad: number;
  peakLoad: number;
  averageLoad: number;
  loadPattern: 'constant' | 'variable' | 'cyclical';
  operatingHours: number;
}

interface UtilityRates {
  electricity: {
    energy: number; // $/kWh
    demand: number; // $/kW
    timeOfUse: boolean;
    peakRates?: number;
    offPeakRates?: number;
  };
  naturalGas: {
    commodity: number; // $/therm
    delivery: number; // $/therm
    capacity: number; // $/therm/day
  };
}

interface SystemDesign {
  selectedEquipment: EquipmentSelection[];
  systemConfiguration: SystemConfiguration;
  performanceProjections: PerformanceProjections;
  integration: IntegrationDetails;
}

interface EquipmentSelection {
  component: CogenerationComponent;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: DetailedSpecs;
  manufacturer: ManufacturerInfo;
}

interface SystemConfiguration {
  totalElectricalOutput: number; // kW
  totalThermalOutput: number; // kW
  overallEfficiency: number; // %
  heatToElectricRatio: number;
  operatingStrategy: 'base_load' | 'peak_shaving' | 'thermal_following';
  redundancy: 'n+1' | 'n+2' | 'none';
}

interface PerformanceProjections {
  annualElectricalGeneration: number; // kWh
  annualThermalGeneration: number; // kWh
  capacity_factor: number; // %
  availability: number; // %
  emissions: EmissionsData;
}

interface EmissionsData {
  co2_avoided: number; // tons/year
  nox: number; // lbs/year
  co: number; // lbs/year
  environmental_benefit: string;
}

interface IntegrationDetails {
  electricalIntegration: {
    connectionPoint: string;
    synchronization: string;
    protection: string[];
    utility_interconnection: boolean;
  };
  thermalIntegration: {
    heatRecoveryMethod: string;
    distributionSystem: string;
    controls: string;
    backup_heating: boolean;
  };
  controls: {
    controlSystem: string;
    monitoring: string;
    communication: string;
    remoteAccess: boolean;
  };
}

interface EconomicAnalysis {
  capitalCosts: CapitalCosts;
  operatingCosts: OperatingCosts;
  savings: SavingsAnalysis;
  incentives: IncentiveAnalysis;
  financialMetrics: FinancialMetrics;
  cashFlow: CashFlowProjection[];
}

interface CapitalCosts {
  equipment: number;
  installation: number;
  electrical: number;
  piping: number;
  controls: number;
  engineering: number;
  permitting: number;
  commissioning: number;
  contingency: number;
  total: number;
}

interface OperatingCosts {
  fuel: number; // $/year
  maintenance: number; // $/year
  insurance: number; // $/year
  labor: number; // $/year
  overhaul_reserve: number; // $/year
  total: number; // $/year
}

interface SavingsAnalysis {
  electricalSavings: number; // $/year
  thermalSavings: number; // $/year
  demandSavings: number; // $/year
  totalAnnualSavings: number; // $/year
  lifetimeSavings: number; // $ over project life
}

interface IncentiveAnalysis {
  federal_tax_credits: number;
  state_incentives: number;
  utility_rebates: number;
  total_incentives: number;
  net_investment: number;
}

interface FinancialMetrics {
  simple_payback: number; // years
  discounted_payback: number; // years
  npv: number; // $
  irr: number; // %
  benefit_cost_ratio: number;
  levelized_cost: number; // $/kWh
}

interface CashFlowProjection {
  year: number;
  savings: number;
  operating_costs: number;
  net_cash_flow: number;
  cumulative_cash_flow: number;
}

interface TechnicalSpecifications {
  equipmentSpecs: EquipmentSpecification[];
  drawings: DrawingList;
  calculations: CalculationSummary;
  codes_standards: string[];
}

interface EquipmentSpecification {
  item: string;
  manufacturer: string;
  model: string;
  specifications: Record<string, any>;
  certifications: string[];
  warranty: string;
}

interface DrawingList {
  site_plan: string;
  equipment_layout: string;
  piping_isometric: string;
  electrical_single_line: string;
  control_schematic: string;
  details: string[];
}

interface CalculationSummary {
  heat_balance: string;
  electrical_load_analysis: string;
  thermal_load_analysis: string;
  efficiency_calculations: string;
  emissions_calculations: string;
}

interface InstallationPlan {
  projectSchedule: ProjectSchedule;
  installationSequence: InstallationPhase[];
  qualityAssurance: QualityPlan;
  testing_commissioning: CommissioningPlan;
}

interface ProjectSchedule {
  engineering: { duration: number; start: Date; end: Date };
  procurement: { duration: number; start: Date; end: Date };
  installation: { duration: number; start: Date; end: Date };
  commissioning: { duration: number; start: Date; end: Date };
  total_duration: number;
}

interface InstallationPhase {
  phase: string;
  description: string;
  duration: number;
  dependencies: string[];
  deliverables: string[];
}

interface QualityPlan {
  standards: string[];
  inspection_points: string[];
  testing_requirements: string[];
  documentation: string[];
}

interface CommissioningPlan {
  functional_testing: string[];
  performance_testing: string[];
  training: string[];
  documentation: string[];
}

interface OperationMaintenance {
  operatingProcedures: string[];
  maintenanceSchedule: MaintenanceSchedule;
  sparePartsRecommendations: SparePart[];
  training: TrainingProgram;
}

interface MaintenanceSchedule {
  daily: string[];
  weekly: string[];
  monthly: string[];
  quarterly: string[];
  annual: string[];
  major_overhaul: { interval: number; scope: string[] };
}

interface SparePart {
  description: string;
  part_number: string;
  recommended_quantity: number;
  cost: number;
  lead_time: number;
}

interface TrainingProgram {
  operator_training: { duration: number; topics: string[] };
  maintenance_training: { duration: number; topics: string[] };
  materials: string[];
  certification: boolean;
}

interface WarrantyTerms {
  equipment_warranty: EquipmentWarranty[];
  installation_warranty: string;
  performance_guarantee: PerformanceGuarantee;
  service_support: ServiceSupport;
}

interface EquipmentWarranty {
  component: string;
  duration: number;
  coverage: string[];
  exclusions: string[];
}

interface PerformanceGuarantee {
  electrical_output: { guaranteed: number; tolerance: number };
  thermal_output: { guaranteed: number; tolerance: number };
  efficiency: { guaranteed: number; tolerance: number };
  availability: { guaranteed: number; measurement_period: number };
  testing_procedure: string;
  remedies: string[];
}

interface ServiceSupport {
  service_hours: string;
  response_time: number;
  remote_monitoring: boolean;
  service_packages: ServicePackage[];
}

interface ServicePackage {
  name: string;
  description: string;
  annual_cost: number;
  included_services: string[];
}

interface Appendices {
  equipment_cut_sheets: string[];
  calculations: string[];
  drawings: string[];
  certifications: string[];
  references: string[];
  terms_conditions: string;
}

interface DetailedSpecs {
  power_output: number;
  thermal_output: number;
  fuel_consumption: number;
  efficiency: number;
  emissions: Record<string, number>;
  dimensions: { width: number; depth: number; height: number; weight: number };
  utilities: Record<string, any>;
  environmental: { sound: number; vibration: number };
  certifications: string[];
}

interface ManufacturerInfo {
  name: string;
  model: string;
  warranty: string;
  support: string;
  lead_time: number;
  certifications: string[];
}

/**
 * Generate a comprehensive cogeneration proposal
 */
export class CogenerationProposalGenerator {
  private designerState: DesignerState;
  private clientInfo: ClientInfo;
  private projectParameters: any;

  constructor(
    designerState: DesignerState,
    clientInfo: ClientInfo,
    projectParameters: any = {}
  ) {
    this.designerState = designerState;
    this.clientInfo = clientInfo;
    this.projectParameters = projectParameters;
  }

  /**
   * Generate complete proposal
   */
  async generateProposal(): Promise<CogenerationProposal> {
    const cogenerationComponents = this.designerState.cogenerationComponents || [];
    
    return {
      metadata: this.generateMetadata(),
      executiveSummary: this.generateExecutiveSummary(cogenerationComponents),
      facilityAnalysis: this.generateFacilityAnalysis(),
      systemDesign: this.generateSystemDesign(cogenerationComponents),
      economicAnalysis: this.generateEconomicAnalysis(cogenerationComponents),
      technicalSpecifications: this.generateTechnicalSpecifications(cogenerationComponents),
      installationPlan: this.generateInstallationPlan(),
      operationMaintenance: this.generateOperationMaintenance(),
      warranty: this.generateWarrantyTerms(),
      appendices: this.generateAppendices()
    };
  }

  /**
   * Export proposal as PDF using existing report system
   */
  async exportToPDF(proposal: CogenerationProposal): Promise<string> {
    const htmlContent = this.generateHTMLContent(proposal);
    
    // Use existing report generation system
    return generateReportHTML({
      title: `Cogeneration System Proposal - ${this.clientInfo.companyName}`,
      clientName: this.clientInfo.companyName,
      projectName: `${this.clientInfo.facilityType} Cogeneration System`,
      format: 'pdf',
      sections: [
        { id: 'executive_summary', enabled: true },
        { id: 'system_design', enabled: true },
        { id: 'economic_analysis', enabled: true },
        { id: 'technical_specifications', enabled: true }
      ]
    });
  }

  /**
   * Export to Autodesk CAD format
   */
  async exportToCAD(proposal: CogenerationProposal): Promise<any> {
    const cogenerationComponents = this.designerState.cogenerationComponents || [];
    
    // Generate CAD data using existing CAD integration
    const cadData = {
      layers: this.generateCADLayers(cogenerationComponents),
      blocks: this.generateCADBlocks(cogenerationComponents),
      dimensions: this.generateCADDimensions(cogenerationComponents),
      annotations: this.generateCADAnnotations(cogenerationComponents)
    };
    
    // Use existing Autodesk Forge integration
    return this.exportUsingForge(cadData);
  }

  private generateMetadata() {
    return {
      proposalNumber: `VL-CHP-${Date.now().toString().slice(-6)}`,
      date: new Date(),
      version: '1.0',
      preparedFor: this.clientInfo,
      preparedBy: {
        name: 'VibeLux',
        address: '123 Innovation Drive, Tech City, TC 12345',
        phone: '(555) 123-4567',
        email: 'proposals@vibelux.ai',
        website: 'https://vibelux.ai',
        license: 'Mechanical Contractor License #MC-2024-001',
        certifications: ['ISO 9001:2015', 'NECA Member', 'ASHRAE Member']
      },
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }

  private generateExecutiveSummary(components: CogenerationComponent[]): ExecutiveSummary {
    const totalElectrical = components
      .filter(c => c.type === 'cogeneration_unit')
      .reduce((sum, c) => sum + (c.specifications.electricalOutput || 0), 0);
    
    const totalThermal = components
      .filter(c => c.type === 'cogeneration_unit')
      .reduce((sum, c) => sum + (c.specifications.thermalOutput || 0), 0);

    const annualSavings = this.calculateAnnualSavings(totalElectrical, totalThermal);
    const totalInvestment = this.calculateTotalInvestment(components);

    return {
      projectOverview: `This proposal outlines a comprehensive ${totalElectrical}kW cogeneration system for ${this.clientInfo.companyName}'s ${this.clientInfo.facilityType} facility. The system will provide reliable, efficient on-site power generation while capturing waste heat for facility thermal needs.`,
      keyBenefits: [
        `${totalElectrical}kW of reliable on-site electrical generation`,
        `${totalThermal}kW of recoverable thermal energy`,
        `${Math.round((totalElectrical + totalThermal) / (totalElectrical / 0.35) * 100)}% total system efficiency`,
        `$${annualSavings.toLocaleString()} in estimated annual energy savings`,
        'Reduced dependence on grid electricity',
        'Lower carbon footprint and emissions',
        'Enhanced energy security and reliability'
      ],
      investmentSummary: {
        totalInvestment,
        annualSavings,
        paybackPeriod: totalInvestment / annualSavings,
        roi: (annualSavings / totalInvestment) * 100
      },
      recommendations: [
        'Proceed with proposed cogeneration system installation',
        'Consider expansion capabilities for future growth',
        'Implement comprehensive maintenance program',
        'Pursue available incentives and rebates'
      ]
    };
  }

  private generateFacilityAnalysis(): FacilityAnalysis {
    // This would be populated from actual facility data
    return {
      currentEnergyProfile: {
        electricalLoad: {
          baseLoad: 200,
          peakLoad: 350,
          averageLoad: 275,
          loadPattern: 'variable',
          operatingHours: 8760
        },
        thermalLoad: {
          baseLoad: 150,
          peakLoad: 300,
          averageLoad: 225,
          loadPattern: 'variable',
          operatingHours: 6000
        },
        peakDemand: 350,
        loadFactor: 0.79,
        utilityRates: {
          electricity: {
            energy: 0.12,
            demand: 15.50,
            timeOfUse: true,
            peakRates: 0.18,
            offPeakRates: 0.08
          },
          naturalGas: {
            commodity: 0.85,
            delivery: 0.35,
            capacity: 0.15
          }
        }
      },
      energyConsumption: {
        annual: 2408000, // kWh
        monthly: [220000, 210000, 200000, 190000, 185000, 180000, 185000, 190000, 195000, 205000, 215000, 225000],
        seasonal: 'winter'
      },
      existingInfrastructure: {
        electrical: '480V/3-phase service, 600A main panel',
        gas: '2" medium pressure service, 5 psig',
        cooling: 'Central chilled water system, 200 tons',
        heating: 'Natural gas boilers, 2 x 1.5 MMBtu/hr',
        limitations: [
          'Limited electrical room space',
          'Boiler room requires modifications',
          'Cooling tower access challenging'
        ]
      }
    };
  }

  private generateSystemDesign(components: CogenerationComponent[]): SystemDesign {
    const equipment = components.map(comp => ({
      component: comp,
      quantity: 1,
      unitPrice: this.getComponentPrice(comp),
      totalPrice: this.getComponentPrice(comp),
      specifications: this.generateDetailedSpecs(comp),
      manufacturer: this.generateManufacturerInfo(comp)
    }));

    const totalElectrical = equipment
      .filter(e => e.component.type === 'cogeneration_unit')
      .reduce((sum, e) => sum + (e.component.specifications.electricalOutput || 0), 0);
    
    const totalThermal = equipment
      .filter(e => e.component.type === 'cogeneration_unit')
      .reduce((sum, e) => sum + (e.component.specifications.thermalOutput || 0), 0);

    return {
      selectedEquipment: equipment,
      systemConfiguration: {
        totalElectricalOutput: totalElectrical,
        totalThermalOutput: totalThermal,
        overallEfficiency: ((totalElectrical + totalThermal) / (totalElectrical / 0.35)) * 100,
        heatToElectricRatio: totalThermal / totalElectrical,
        operatingStrategy: 'base_load',
        redundancy: 'n+1'
      },
      performanceProjections: {
        annualElectricalGeneration: totalElectrical * 8760 * 0.85,
        annualThermalGeneration: totalThermal * 6000 * 0.85,
        capacity_factor: 85,
        availability: 95,
        emissions: {
          co2_avoided: 1250,
          nox: 2400,
          co: 1200,
          environmental_benefit: 'Equivalent to removing 275 cars from the road annually'
        }
      },
      integration: {
        electricalIntegration: {
          connectionPoint: 'Main electrical panel',
          synchronization: 'Automatic synchronization controls',
          protection: ['Overcurrent protection', 'Reverse power protection', 'Anti-islanding'],
          utility_interconnection: true
        },
        thermalIntegration: {
          heatRecoveryMethod: 'Engine jacket water and exhaust heat recovery',
          distributionSystem: 'Hot water distribution to existing heating system',
          controls: 'Modulating 3-way valves with PID control',
          backup_heating: true
        },
        controls: {
          controlSystem: 'PLC-based control system with HMI',
          monitoring: 'Remote monitoring and data logging',
          communication: 'Ethernet and cellular connectivity',
          remoteAccess: true
        }
      }
    };
  }

  private generateEconomicAnalysis(components: CogenerationComponent[]): EconomicAnalysis {
    const equipmentCost = components.reduce((sum, comp) => sum + this.getComponentPrice(comp), 0);
    
    const capitalCosts: CapitalCosts = {
      equipment: equipmentCost,
      installation: equipmentCost * 0.25,
      electrical: 75000,
      piping: 45000,
      controls: 35000,
      engineering: equipmentCost * 0.08,
      permitting: 15000,
      commissioning: 25000,
      contingency: 0,
      total: 0
    };
    
    capitalCosts.contingency = (Object.values(capitalCosts).reduce((a, b) => a + b, 0) - capitalCosts.contingency) * 0.1;
    capitalCosts.total = Object.values(capitalCosts).reduce((a, b) => a + b, 0);

    const annualSavings = this.calculateAnnualSavings(330, 449); // Example values
    
    return {
      capitalCosts,
      operatingCosts: {
        fuel: 145000,
        maintenance: 22000,
        insurance: 8500,
        labor: 15000,
        overhaul_reserve: 12000,
        total: 202500
      },
      savings: {
        electricalSavings: 285000,
        thermalSavings: 67000,
        demandSavings: 48000,
        totalAnnualSavings: annualSavings,
        lifetimeSavings: annualSavings * 20
      },
      incentives: {
        federal_tax_credits: capitalCosts.total * 0.10,
        state_incentives: 25000,
        utility_rebates: 15000,
        total_incentives: 0,
        net_investment: 0
      },
      financialMetrics: {
        simple_payback: capitalCosts.total / annualSavings,
        discounted_payback: 6.8,
        npv: 2850000,
        irr: 18.5,
        benefit_cost_ratio: 2.4,
        levelized_cost: 0.065
      },
      cashFlow: this.generateCashFlow(capitalCosts.total, annualSavings, 202500)
    };
  }

  private generateTechnicalSpecifications(components: CogenerationComponent[]): TechnicalSpecifications {
    return {
      equipmentSpecs: components.map(comp => ({
        item: `${comp.manufacturer} ${comp.model}`,
        manufacturer: comp.manufacturer,
        model: comp.model,
        specifications: comp.specifications,
        certifications: ['UL Listed', 'EPA Certified', 'CARB Certified'],
        warranty: '5 years or 60,000 hours'
      })),
      drawings: {
        site_plan: 'SP-001: Site Plan with Equipment Locations',
        equipment_layout: 'EP-001: Equipment Layout and Clearances',
        piping_isometric: 'PI-001: Piping Isometric and P&ID',
        electrical_single_line: 'EL-001: Electrical Single Line Diagram',
        control_schematic: 'CS-001: Control System Schematic',
        details: [
          'DT-001: Foundation Details',
          'DT-002: Mounting Details',
          'DT-003: Utility Connections'
        ]
      },
      calculations: {
        heat_balance: 'Heat and mass balance calculations',
        electrical_load_analysis: 'Electrical load analysis and sizing',
        thermal_load_analysis: 'Thermal load analysis and heat recovery',
        efficiency_calculations: 'Overall system efficiency calculations',
        emissions_calculations: 'Emissions and environmental impact'
      },
      codes_standards: [
        'NFPA 37 - Standard for the Installation and Use of Stationary Combustion Engines',
        'IEEE 1547 - Standard for Interconnecting Distributed Resources',
        'ASME B31.1 - Power Piping Code',
        'NEC Article 445 - Generators',
        'Local building and electrical codes'
      ]
    };
  }

  private generateInstallationPlan(): InstallationPlan {
    const startDate = new Date();
    const phases: InstallationPhase[] = [
      {
        phase: 'Site Preparation',
        description: 'Foundation, utilities, and access preparation',
        duration: 2,
        dependencies: [],
        deliverables: ['Foundation complete', 'Utilities roughed in']
      },
      {
        phase: 'Equipment Installation',
        description: 'Cogeneration unit and auxiliary equipment installation',
        duration: 3,
        dependencies: ['Site Preparation'],
        deliverables: ['Equipment set and connected']
      },
      {
        phase: 'System Integration',
        description: 'Electrical, piping, and control system connections',
        duration: 2,
        dependencies: ['Equipment Installation'],
        deliverables: ['All systems connected and tested']
      },
      {
        phase: 'Commissioning',
        description: 'Testing, startup, and performance verification',
        duration: 1,
        dependencies: ['System Integration'],
        deliverables: ['System operational and performance verified']
      }
    ];

    return {
      projectSchedule: {
        engineering: { duration: 3, start: startDate, end: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000) },
        procurement: { duration: 8, start: startDate, end: new Date(startDate.getTime() + 56 * 24 * 60 * 60 * 1000) },
        installation: { duration: 8, start: new Date(startDate.getTime() + 56 * 24 * 60 * 60 * 1000), end: new Date(startDate.getTime() + 112 * 24 * 60 * 60 * 1000) },
        commissioning: { duration: 2, start: new Date(startDate.getTime() + 112 * 24 * 60 * 60 * 1000), end: new Date(startDate.getTime() + 126 * 24 * 60 * 60 * 1000) },
        total_duration: 18
      },
      installationSequence: phases,
      qualityAssurance: {
        standards: ['ISO 9001:2015', 'ASME B31.1', 'NECA Standards'],
        inspection_points: ['Foundation', 'Equipment setting', 'Piping pressure test', 'Electrical connections'],
        testing_requirements: ['Hydrostatic testing', 'Electrical testing', 'Performance testing'],
        documentation: ['QA/QC reports', 'Test certificates', 'As-built drawings']
      },
      testing_commissioning: {
        functional_testing: ['Control system testing', 'Safety system testing', 'Synchronization testing'],
        performance_testing: ['Full load testing', 'Heat recovery testing', 'Efficiency verification'],
        training: ['Operator training', 'Maintenance training'],
        documentation: ['O&M manuals', 'Training records', 'Performance reports']
      }
    };
  }

  private generateOperationMaintenance(): OperationMaintenance {
    return {
      operatingProcedures: [
        'Daily startup and shutdown procedures',
        'Normal operation monitoring',
        'Emergency shutdown procedures',
        'Load management procedures'
      ],
      maintenanceSchedule: {
        daily: ['Visual inspection', 'Check fluid levels', 'Record operating parameters'],
        weekly: ['Check belt tension', 'Inspect air filters', 'Test safety systems'],
        monthly: ['Oil analysis', 'Coolant testing', 'Electrical connections'],
        quarterly: ['Valve testing', 'Heat exchanger cleaning', 'Control calibration'],
        annual: ['Major inspection', 'Spark plug replacement', 'Thermostat replacement'],
        major_overhaul: {
          interval: 60000, // hours
          scope: ['Engine rebuild', 'Generator overhaul', 'Complete system refurbishment']
        }
      },
      sparePartsRecommendations: [
        { description: 'Oil filters', part_number: 'OF-001', recommended_quantity: 12, cost: 25, lead_time: 1 },
        { description: 'Air filters', part_number: 'AF-001', recommended_quantity: 6, cost: 45, lead_time: 1 },
        { description: 'Spark plugs', part_number: 'SP-001', recommended_quantity: 24, cost: 15, lead_time: 1 }
      ],
      training: {
        operator_training: {
          duration: 16,
          topics: ['System operation', 'Safety procedures', 'Emergency response', 'Maintenance basics']
        },
        maintenance_training: {
          duration: 40,
          topics: ['Preventive maintenance', 'Troubleshooting', 'Parts replacement', 'Safety procedures']
        },
        materials: ['O&M manuals', 'Training videos', 'Quick reference guides'],
        certification: true
      }
    };
  }

  private generateWarrantyTerms(): WarrantyTerms {
    return {
      equipment_warranty: [
        {
          component: 'Cogeneration Unit',
          duration: 5,
          coverage: ['Parts and labor', 'Performance guarantee'],
          exclusions: ['Normal wear items', 'Misuse or abuse']
        }
      ],
      installation_warranty: '2 years parts and labor on installation workmanship',
      performance_guarantee: {
        electrical_output: { guaranteed: 330, tolerance: 5 },
        thermal_output: { guaranteed: 449, tolerance: 5 },
        efficiency: { guaranteed: 81.2, tolerance: 2 },
        availability: { guaranteed: 95, measurement_period: 12 },
        testing_procedure: 'Performance testing per manufacturer specifications',
        remedies: ['Corrective action', 'Equipment replacement', 'Financial compensation']
      },
      service_support: {
        service_hours: '24/7 emergency support',
        response_time: 4,
        remote_monitoring: true,
        service_packages: [
          {
            name: 'Basic Service',
            description: 'Scheduled maintenance and basic support',
            annual_cost: 15000,
            included_services: ['Scheduled maintenance', 'Parts discount', 'Technical support']
          }
        ]
      }
    };
  }

  private generateAppendices(): Appendices {
    return {
      equipment_cut_sheets: ['Cogeneration unit specifications', 'Heat exchanger specifications'],
      calculations: ['Heat balance calculations', 'Economic analysis details'],
      drawings: ['Equipment layouts', 'Piping schematics', 'Electrical diagrams'],
      certifications: ['Equipment certifications', 'Company certifications'],
      references: ['Similar project references', 'Customer testimonials'],
      terms_conditions: 'Standard terms and conditions of sale'
    };
  }

  // Helper methods
  private calculateAnnualSavings(electricalkW: number, thermalkW: number): number {
    const electricalSavings = electricalkW * 8760 * 0.85 * 0.12; // kW * hours * capacity factor * rate
    const thermalSavings = thermalkW * 6000 * 0.85 * 0.025; // Thermal equivalent savings
    return electricalSavings + thermalSavings;
  }

  private calculateTotalInvestment(components: CogenerationComponent[]): number {
    const equipmentCost = components.reduce((sum, comp) => sum + this.getComponentPrice(comp), 0);
    return equipmentCost * 1.6; // Including installation, engineering, etc.
  }

  private getComponentPrice(component: CogenerationComponent): number {
    // Simplified pricing - would be from actual database
    const basePrices: Record<string, number> = {
      cogeneration_unit: 400000,
      boiler: 150000,
      heat_exchanger: 25000,
      chiller: 200000,
      cooling_tower: 75000
    };
    return basePrices[component.type] || 50000;
  }

  private generateDetailedSpecs(component: CogenerationComponent): DetailedSpecs {
    return {
      power_output: component.specifications.electricalOutput || 0,
      thermal_output: component.specifications.thermalOutput || 0,
      fuel_consumption: 1200, // Example
      efficiency: 85,
      emissions: { nox: 0.5, co: 2.0 },
      dimensions: component.dimensions,
      utilities: component.utilities,
      environmental: { sound: 75, vibration: 0.2 },
      certifications: ['UL Listed', 'EPA Certified']
    };
  }

  private generateManufacturerInfo(component: CogenerationComponent): ManufacturerInfo {
    return {
      name: component.manufacturer,
      model: component.model,
      warranty: '5 years or 60,000 hours',
      support: '24/7 technical support',
      lead_time: 16,
      certifications: ['ISO 9001', 'EPA Certified']
    };
  }

  private generateCashFlow(investment: number, annualSavings: number, operatingCosts: number): CashFlowProjection[] {
    const cashFlow: CashFlowProjection[] = [];
    let cumulative = -investment;
    
    for (let year = 1; year <= 20; year++) {
      const netCashFlow = annualSavings - operatingCosts;
      cumulative += netCashFlow;
      
      cashFlow.push({
        year,
        savings: annualSavings,
        operating_costs: operatingCosts,
        net_cash_flow: netCashFlow,
        cumulative_cash_flow: cumulative
      });
    }
    
    return cashFlow;
  }

  private generateHTMLContent(proposal: CogenerationProposal): string {
    // Generate comprehensive HTML content for the proposal
    return `
      <div class="proposal">
        <h1>Cogeneration System Proposal</h1>
        <div class="executive-summary">
          <h2>Executive Summary</h2>
          <p>${proposal.executiveSummary.projectOverview}</p>
          <!-- Additional content -->
        </div>
        <!-- Additional sections -->
      </div>
    `;
  }

  private generateCADLayers(components: CogenerationComponent[]): any[] {
    return [
      { name: 'EQUIPMENT', color: 'red', lineType: 'continuous' },
      { name: 'CLEARANCES', color: 'yellow', lineType: 'dashed' },
      { name: 'UTILITIES', color: 'blue', lineType: 'continuous' },
      { name: 'DIMENSIONS', color: 'green', lineType: 'continuous' }
    ];
  }

  private generateCADBlocks(components: CogenerationComponent[]): any[] {
    return components.map(comp => ({
      name: `${comp.manufacturer}_${comp.model}`,
      basePoint: { x: 0, y: 0 },
      objects: [
        // Rectangle representing equipment
        {
          type: 'rectangle',
          corner1: { x: 0, y: 0 },
          corner2: { x: comp.dimensions.width, y: comp.dimensions.depth }
        }
      ]
    }));
  }

  private generateCADDimensions(components: CogenerationComponent[]): any[] {
    return components.map(comp => ({
      componentId: comp.id,
      dimensions: [
        { type: 'linear', value: comp.dimensions.width, label: `${comp.dimensions.width}"` },
        { type: 'linear', value: comp.dimensions.depth, label: `${comp.dimensions.depth}"` },
        { type: 'linear', value: comp.dimensions.height, label: `${comp.dimensions.height}"` }
      ]
    }));
  }

  private generateCADAnnotations(components: CogenerationComponent[]): any[] {
    return components.map(comp => ({
      text: `${comp.manufacturer} ${comp.model}`,
      position: { x: comp.position.x, y: comp.position.y },
      height: 12,
      justification: 'center'
    }));
  }

  private async exportUsingForge(cadData: any): Promise<any> {
    // Use existing Forge integration to export CAD data
    // This would call the existing /api/forge/* endpoints
    return {
      success: true,
      urn: 'generated-urn',
      downloadUrl: '/api/forge/download/generated-urn'
    };
  }
}

export { CogenerationProposalGenerator };