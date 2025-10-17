/**
 * Cost Estimation and Budgeting Automation System
 * Provides real-time cost tracking, predictions, and procurement cost calculations
 */

import type {
  Project,
  ProjectTask,
  ProjectPhase,
  ProjectType
} from '@/lib/project-management/project-types';

// Cost Database Types
export interface CostDatabase {
  materials: MaterialCost[];
  labor: LaborRate[];
  equipment: EquipmentCost[];
  services: ServiceCost[];
  overhead: OverheadRate[];
  markups: MarkupRate[];
}

export interface MaterialCost {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  unitCost: number;
  currency: string;
  supplier: string;
  leadTime: number; // days
  minimumOrder: number;
  priceValidUntil: Date;
  location: string;
  specifications: Record<string, any>;
  lastUpdated: Date;
}

export interface LaborRate {
  id: string;
  role: string;
  skillLevel: 'entry' | 'mid' | 'senior' | 'expert';
  hourlyRate: number;
  currency: string;
  location: string;
  unionRate: boolean;
  benefits: number; // percentage
  overhead: number; // percentage
  availability: 'high' | 'medium' | 'low';
  certifications: string[];
  lastUpdated: Date;
}

export interface EquipmentCost {
  id: string;
  name: string;
  category: EquipmentCategory;
  type: 'purchase' | 'rental';
  cost: number;
  currency: string;
  capacity: string;
  specifications: Record<string, any>;
  supplier: string;
  leadTime: number;
  warranty: number; // months
  maintenance: MaintenanceCost;
  depreciation: DepreciationSchedule;
  lastUpdated: Date;
}

export interface ServiceCost {
  id: string;
  name: string;
  category: ServiceCategory;
  provider: string;
  unitCost: number;
  unit: string;
  currency: string;
  minimumCharge: number;
  leadTime: number;
  location: string;
  qualifications: string[];
  lastUpdated: Date;
}

export type MaterialCategory = 
  | 'electrical'
  | 'mechanical'
  | 'piping'
  | 'insulation'
  | 'controls'
  | 'structural'
  | 'safety'
  | 'consumables';

export type EquipmentCategory =
  | 'cogeneration'
  | 'boilers'
  | 'turbines'
  | 'generators'
  | 'heat_exchangers'
  | 'pumps'
  | 'compressors'
  | 'electrical_panels'
  | 'controls'
  | 'safety_systems';

export type ServiceCategory =
  | 'engineering'
  | 'permitting'
  | 'construction'
  | 'commissioning'
  | 'testing'
  | 'training'
  | 'maintenance'
  | 'consulting';

export interface MaintenanceCost {
  annualRate: number; // percentage of equipment cost
  scheduleType: 'hourly' | 'calendar' | 'condition';
  majorOverhaulInterval: number; // years
  majorOverhaulCost: number;
  spareParts: number; // percentage
}

export interface DepreciationSchedule {
  method: 'straight_line' | 'declining_balance' | 'units_of_production';
  usefulLife: number; // years
  salvageValue: number; // percentage
  taxDepreciation: boolean;
}

export interface OverheadRate {
  category: 'general' | 'project' | 'administrative';
  rate: number; // percentage
  appliesTo: ('labor' | 'materials' | 'equipment' | 'services')[];
  location: string;
}

export interface MarkupRate {
  category: 'profit' | 'risk' | 'contingency';
  rate: number; // percentage
  appliesTo: ('labor' | 'materials' | 'equipment' | 'services')[];
  projectType: ProjectType[];
  complexity: ('simple' | 'moderate' | 'complex')[];
}

// Cost Estimation Results
export interface CostEstimate {
  projectId: string;
  estimateId: string;
  version: number;
  createdAt: Date;
  createdBy: string;
  status: 'draft' | 'preliminary' | 'detailed' | 'final' | 'approved';
  
  // Breakdown by category
  breakdown: {
    materials: CategoryCost;
    labor: CategoryCost;
    equipment: CategoryCost;
    services: CategoryCost;
    overhead: CategoryCost;
    contingency: CategoryCost;
    profit: CategoryCost;
  };
  
  // Summary
  summary: {
    directCosts: number;
    indirectCosts: number;
    totalCosts: number;
    currency: string;
    confidence: number; // percentage
    accuracy: string; // '-20%/+30%'
  };
  
  // Phase breakdown
  phaseBreakdown: PhaseCost[];
  
  // Risk factors
  riskFactors: CostRisk[];
  
  // Assumptions
  assumptions: string[];
  
  // Comparison with budget
  budgetComparison: {
    allocatedBudget: number;
    estimatedCost: number;
    variance: number;
    variancePercentage: number;
    status: 'under' | 'on' | 'over';
  };
}

export interface CategoryCost {
  baseAmount: number;
  adjustments: CostAdjustment[];
  total: number;
  confidence: number;
  details: CostLineItem[];
}

export interface CostLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  source: string;
  notes: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CostAdjustment {
  type: 'escalation' | 'location' | 'risk' | 'complexity' | 'schedule';
  factor: number;
  description: string;
}

export interface PhaseCost {
  phaseId: string;
  phaseName: string;
  materials: number;
  labor: number;
  equipment: number;
  services: number;
  total: number;
  cashFlow: CashFlowItem[];
}

export interface CashFlowItem {
  date: Date;
  description: string;
  amount: number;
  cumulative: number;
}

export interface CostRisk {
  id: string;
  factor: string;
  probability: number; // 0-1
  impact: number; // cost impact
  mitigation: string;
  contingency: number;
}

// Real-time Cost Tracking
export interface CostTracker {
  projectId: string;
  trackingPeriod: {
    start: Date;
    end: Date;
  };
  
  actual: {
    materials: number;
    labor: number;
    equipment: number;
    services: number;
    total: number;
  };
  
  committed: {
    purchaseOrders: CommittedCost[];
    contracts: CommittedCost[];
    total: number;
  };
  
  forecasted: {
    remainingWork: number;
    changeOrders: number;
    contingency: number;
    total: number;
  };
  
  variance: {
    costVariance: number;
    scheduleVariance: number;
    performanceIndex: number;
  };
  
  trends: CostTrend[];
  alerts: CostAlert[];
}

export interface CommittedCost {
  id: string;
  type: 'purchase_order' | 'contract' | 'commitment';
  vendor: string;
  description: string;
  amount: number;
  currency: string;
  commitDate: Date;
  expectedDelivery: Date;
  status: 'pending' | 'approved' | 'ordered' | 'delivered' | 'invoiced';
}

export interface CostTrend {
  category: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  rate: number; // percentage change per period
  confidence: number;
  factors: string[];
}

export interface CostAlert {
  id: string;
  type: 'budget_exceeded' | 'cost_escalation' | 'variance' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
}

export class CostEstimator {
  private costDatabase: CostDatabase;
  
  constructor(costDatabase: CostDatabase) {
    this.costDatabase = costDatabase;
  }

  /**
   * Generate comprehensive cost estimate for a project
   */
  async generateEstimate(
    project: Project,
    estimationType: 'preliminary' | 'detailed' = 'detailed'
  ): Promise<CostEstimate> {
    const estimateId = `est-${Date.now()}`;
    
    // Calculate base costs by category
    const materials = await this.estimateMaterialCosts(project);
    const labor = await this.estimateLaborCosts(project);
    const equipment = await this.estimateEquipmentCosts(project);
    const services = await this.estimateServiceCosts(project);
    
    // Apply overhead and markups
    const overhead = this.calculateOverhead(materials, labor, equipment, services, project);
    const contingency = this.calculateContingency(project);
    const profit = this.calculateProfit(project);
    
    // Calculate phase breakdown
    const phaseBreakdown = this.calculatePhaseBreakdown(project, {
      materials,
      labor,
      equipment,
      services
    });
    
    // Assess risks
    const riskFactors = await this.assessCostRisks(project);
    
    // Calculate totals
    const directCosts = materials.total + labor.total + equipment.total + services.total;
    const indirectCosts = overhead.total + contingency.total + profit.total;
    const totalCosts = directCosts + indirectCosts;
    
    const estimate: CostEstimate = {
      projectId: project.id,
      estimateId,
      version: 1,
      createdAt: new Date(),
      createdBy: 'cost-estimator',
      status: estimationType === 'preliminary' ? 'preliminary' : 'detailed',
      
      breakdown: {
        materials,
        labor,
        equipment,
        services,
        overhead,
        contingency,
        profit
      },
      
      summary: {
        directCosts,
        indirectCosts,
        totalCosts,
        currency: 'USD',
        confidence: this.calculateConfidence(estimationType, project),
        accuracy: estimationType === 'preliminary' ? '-30%/+50%' : '-15%/+25%'
      },
      
      phaseBreakdown,
      riskFactors,
      assumptions: this.generateAssumptions(project, estimationType),
      
      budgetComparison: {
        allocatedBudget: project.budget.totalBudget,
        estimatedCost: totalCosts,
        variance: totalCosts - project.budget.totalBudget,
        variancePercentage: ((totalCosts - project.budget.totalBudget) / project.budget.totalBudget) * 100,
        status: totalCosts <= project.budget.totalBudget ? 'under' : 'over'
      }
    };
    
    return estimate;
  }

  /**
   * Track real-time project costs
   */
  async trackProjectCosts(project: Project): Promise<CostTracker> {
    const actualCosts = await this.getActualCosts(project);
    const committedCosts = await this.getCommittedCosts(project);
    const forecastedCosts = await this.getForecastedCosts(project);
    
    const variance = this.calculateVariance(project, actualCosts);
    const trends = await this.analyzeCostTrends(project);
    const alerts = await this.generateCostAlerts(project, actualCosts, variance);
    
    return {
      projectId: project.id,
      trackingPeriod: {
        start: project.createdAt,
        end: new Date()
      },
      actual: actualCosts,
      committed: committedCosts,
      forecasted: forecastedCosts,
      variance,
      trends,
      alerts
    };
  }

  private async estimateMaterialCosts(project: Project): Promise<CategoryCost> {
    const materials = this.costDatabase.materials.filter(m => 
      this.isRelevantMaterial(m, project.type)
    );
    
    const details: CostLineItem[] = [];
    let baseAmount = 0;
    
    // Estimate based on project type and capacity
    if (project.type === 'cogeneration') {
      const capacity = this.extractCapacityFromProject(project);
      
      // Electrical materials
      const electricalMaterials = materials.filter(m => m.category === 'electrical');
      for (const material of electricalMaterials) {
        const quantity = this.calculateMaterialQuantity(material, capacity, project);
        const cost = quantity * material.unitCost;
        baseAmount += cost;
        
        details.push({
          id: `line-${Date.now()}-${Math.random()}`,
          description: material.name,
          quantity,
          unit: material.unit,
          unitCost: material.unitCost,
          totalCost: cost,
          source: material.supplier,
          notes: `For ${capacity}kW cogeneration system`,
          riskLevel: this.assessMaterialRisk(material, project)
        });
      }
      
      // Mechanical materials
      const mechanicalMaterials = materials.filter(m => m.category === 'mechanical');
      for (const material of mechanicalMaterials) {
        const quantity = this.calculateMaterialQuantity(material, capacity, project);
        const cost = quantity * material.unitCost;
        baseAmount += cost;
        
        details.push({
          id: `line-${Date.now()}-${Math.random()}`,
          description: material.name,
          quantity,
          unit: material.unit,
          unitCost: material.unitCost,
          totalCost: cost,
          source: material.supplier,
          notes: `For ${capacity}kW cogeneration system`,
          riskLevel: this.assessMaterialRisk(material, project)
        });
      }
    }
    
    // Apply adjustments
    const adjustments: CostAdjustment[] = [
      {
        type: 'escalation',
        factor: 1.03, // 3% annual escalation
        description: 'Material price escalation'
      },
      {
        type: 'location',
        factor: this.getLocationFactor(project.location.address),
        description: 'Location adjustment factor'
      }
    ];
    
    let total = baseAmount;
    for (const adjustment of adjustments) {
      total *= adjustment.factor;
    }
    
    return {
      baseAmount,
      adjustments,
      total,
      confidence: 85,
      details
    };
  }

  private async estimateLaborCosts(project: Project): Promise<CategoryCost> {
    const laborRates = this.costDatabase.labor.filter(l => 
      this.isRelevantLabor(l, project.type)
    );
    
    const details: CostLineItem[] = [];
    let baseAmount = 0;
    
    // Calculate labor hours by role
    const laborRequirements = this.calculateLaborRequirements(project);
    
    for (const [role, hours] of Object.entries(laborRequirements)) {
      const rate = laborRates.find(l => l.role === role);
      if (rate) {
        const cost = hours * rate.hourlyRate * (1 + rate.benefits/100) * (1 + rate.overhead/100);
        baseAmount += cost;
        
        details.push({
          id: `line-${Date.now()}-${Math.random()}`,
          description: `${role} - ${rate.skillLevel}`,
          quantity: hours,
          unit: 'hours',
          unitCost: rate.hourlyRate * (1 + rate.benefits/100) * (1 + rate.overhead/100),
          totalCost: cost,
          source: rate.location,
          notes: `Includes benefits (${rate.benefits}%) and overhead (${rate.overhead}%)`,
          riskLevel: rate.availability === 'low' ? 'high' : 'medium'
        });
      }
    }
    
    const adjustments: CostAdjustment[] = [
      {
        type: 'complexity',
        factor: project.type === 'cogeneration' ? 1.15 : 1.0,
        description: 'Project complexity adjustment'
      }
    ];
    
    let total = baseAmount;
    for (const adjustment of adjustments) {
      total *= adjustment.factor;
    }
    
    return {
      baseAmount,
      adjustments,
      total,
      confidence: 80,
      details
    };
  }

  private async estimateEquipmentCosts(project: Project): Promise<CategoryCost> {
    const equipment = this.costDatabase.equipment.filter(e => 
      this.isRelevantEquipment(e, project.type)
    );
    
    const details: CostLineItem[] = [];
    let baseAmount = 0;
    
    if (project.type === 'cogeneration') {
      const capacity = this.extractCapacityFromProject(project);
      
      // Major equipment
      const majorEquipment = equipment.filter(e => 
        e.category === 'cogeneration' || e.category === 'generators'
      );
      
      for (const equip of majorEquipment) {
        if (this.isEquipmentSuitable(equip, capacity)) {
          const cost = equip.cost;
          baseAmount += cost;
          
          details.push({
            id: `line-${Date.now()}-${Math.random()}`,
            description: equip.name,
            quantity: 1,
            unit: 'unit',
            unitCost: cost,
            totalCost: cost,
            source: equip.supplier,
            notes: `${equip.capacity} capacity, ${equip.leadTime} days lead time`,
            riskLevel: equip.leadTime > 90 ? 'high' : 'medium'
          });
        }
      }
    }
    
    const adjustments: CostAdjustment[] = [
      {
        type: 'escalation',
        factor: 1.05, // 5% equipment escalation
        description: 'Equipment price escalation'
      }
    ];
    
    let total = baseAmount;
    for (const adjustment of adjustments) {
      total *= adjustment.factor;
    }
    
    return {
      baseAmount,
      adjustments,
      total,
      confidence: 90,
      details
    };
  }

  private async estimateServiceCosts(project: Project): Promise<CategoryCost> {
    const services = this.costDatabase.services.filter(s => 
      this.isRelevantService(s, project.type)
    );
    
    const details: CostLineItem[] = [];
    let baseAmount = 0;
    
    // Engineering services
    const engineeringServices = services.filter(s => s.category === 'engineering');
    for (const service of engineeringServices) {
      const units = this.calculateServiceUnits(service, project);
      const cost = units * service.unitCost;
      if (cost >= service.minimumCharge) {
        baseAmount += cost;
        
        details.push({
          id: `line-${Date.now()}-${Math.random()}`,
          description: service.name,
          quantity: units,
          unit: service.unit,
          unitCost: service.unitCost,
          totalCost: cost,
          source: service.provider,
          notes: `Minimum charge: $${service.minimumCharge}`,
          riskLevel: 'medium'
        });
      }
    }
    
    const adjustments: CostAdjustment[] = [];
    
    return {
      baseAmount,
      adjustments,
      total: baseAmount,
      confidence: 75,
      details
    };
  }

  private calculateOverhead(
    materials: CategoryCost,
    labor: CategoryCost,
    equipment: CategoryCost,
    services: CategoryCost,
    project: Project
  ): CategoryCost {
    const overheadRates = this.costDatabase.overhead;
    let total = 0;
    const details: CostLineItem[] = [];
    
    for (const rate of overheadRates) {
      let applicableAmount = 0;
      
      if (rate.appliesTo.includes('labor')) applicableAmount += labor.total;
      if (rate.appliesTo.includes('materials')) applicableAmount += materials.total;
      if (rate.appliesTo.includes('equipment')) applicableAmount += equipment.total;
      if (rate.appliesTo.includes('services')) applicableAmount += services.total;
      
      const overheadAmount = applicableAmount * (rate.rate / 100);
      total += overheadAmount;
      
      details.push({
        id: `overhead-${Date.now()}-${Math.random()}`,
        description: `${rate.category} overhead`,
        quantity: 1,
        unit: 'lump sum',
        unitCost: overheadAmount,
        totalCost: overheadAmount,
        source: 'internal',
        notes: `${rate.rate}% of applicable costs`,
        riskLevel: 'low'
      });
    }
    
    return {
      baseAmount: total,
      adjustments: [],
      total,
      confidence: 95,
      details
    };
  }

  private calculateContingency(project: Project): CategoryCost {
    const contingencyRates = this.costDatabase.markups.filter(m => m.category === 'contingency');
    const applicableRate = contingencyRates.find(r => 
      r.projectType.includes(project.type)
    );
    
    const rate = applicableRate?.rate || 10; // Default 10%
    const baseAmount = project.budget.totalBudget * 0.8; // Apply to 80% of direct costs
    const total = baseAmount * (rate / 100);
    
    return {
      baseAmount: total,
      adjustments: [],
      total,
      confidence: 70,
      details: [{
        id: `contingency-${Date.now()}`,
        description: 'Project contingency',
        quantity: 1,
        unit: 'percentage',
        unitCost: total,
        totalCost: total,
        source: 'calculation',
        notes: `${rate}% contingency for ${project.type} project`,
        riskLevel: 'medium'
      }]
    };
  }

  private calculateProfit(project: Project): CategoryCost {
    const profitRates = this.costDatabase.markups.filter(m => m.category === 'profit');
    const applicableRate = profitRates.find(r => 
      r.projectType.includes(project.type)
    );
    
    const rate = applicableRate?.rate || 15; // Default 15%
    const baseAmount = project.budget.totalBudget * 0.85; // Apply to 85% of costs
    const total = baseAmount * (rate / 100);
    
    return {
      baseAmount: total,
      adjustments: [],
      total,
      confidence: 90,
      details: [{
        id: `profit-${Date.now()}`,
        description: 'Profit margin',
        quantity: 1,
        unit: 'percentage',
        unitCost: total,
        totalCost: total,
        source: 'company policy',
        notes: `${rate}% profit margin`,
        riskLevel: 'low'
      }]
    };
  }

  private calculatePhaseBreakdown(
    project: Project,
    costs: {
      materials: CategoryCost;
      labor: CategoryCost;
      equipment: CategoryCost;
      services: CategoryCost;
    }
  ): PhaseCost[] {
    return project.phases.map(phase => {
      // Distribute costs based on phase characteristics
      const phaseWeight = this.calculatePhaseWeight(phase, project);
      
      const materials = costs.materials.total * phaseWeight.materials;
      const labor = costs.labor.total * phaseWeight.labor;
      const equipment = costs.equipment.total * phaseWeight.equipment;
      const services = costs.services.total * phaseWeight.services;
      const total = materials + labor + equipment + services;
      
      return {
        phaseId: phase.id,
        phaseName: phase.name,
        materials,
        labor,
        equipment,
        services,
        total,
        cashFlow: this.generatePhaseCashFlow(phase, total)
      };
    });
  }

  // Helper methods
  private isRelevantMaterial(material: MaterialCost, projectType: ProjectType): boolean {
    const relevantCategories = {
      cogeneration: ['electrical', 'mechanical', 'piping', 'controls', 'safety'],
      lighting_design: ['electrical'],
      hvac_design: ['mechanical', 'electrical', 'controls'],
      facility_design: ['electrical', 'mechanical', 'structural'],
      retrofit: ['electrical', 'mechanical'],
      maintenance: ['consumables', 'safety']
    };
    
    return relevantCategories[projectType]?.includes(material.category) || false;
  }

  private isRelevantLabor(labor: LaborRate, projectType: ProjectType): boolean {
    const relevantRoles = {
      cogeneration: ['project_manager', 'engineer', 'technician', 'electrician', 'pipefitter'],
      lighting_design: ['designer', 'electrician', 'technician'],
      hvac_design: ['engineer', 'technician', 'pipefitter'],
      facility_design: ['architect', 'engineer', 'project_manager'],
      retrofit: ['engineer', 'technician', 'electrician'],
      maintenance: ['technician', 'specialist']
    };
    
    return relevantRoles[projectType]?.some(role => 
      labor.role.toLowerCase().includes(role)
    ) || false;
  }

  private isRelevantEquipment(equipment: EquipmentCost, projectType: ProjectType): boolean {
    const relevantCategories = {
      cogeneration: ['cogeneration', 'generators', 'heat_exchangers', 'controls'],
      lighting_design: ['electrical_panels'],
      hvac_design: ['pumps', 'compressors', 'heat_exchangers', 'controls'],
      facility_design: ['electrical_panels', 'pumps', 'controls'],
      retrofit: ['pumps', 'controls'],
      maintenance: ['safety_systems']
    };
    
    return relevantCategories[projectType]?.includes(equipment.category) || false;
  }

  private isRelevantService(service: ServiceCost, projectType: ProjectType): boolean {
    const relevantCategories = {
      cogeneration: ['engineering', 'permitting', 'commissioning', 'testing'],
      lighting_design: ['engineering', 'consulting'],
      hvac_design: ['engineering', 'commissioning'],
      facility_design: ['engineering', 'permitting', 'consulting'],
      retrofit: ['engineering', 'consulting'],
      maintenance: ['maintenance', 'training']
    };
    
    return relevantCategories[projectType]?.includes(service.category) || false;
  }

  private extractCapacityFromProject(project: Project): number {
    // Extract capacity from project design data or default
    return 330; // Default 330kW
  }

  private calculateMaterialQuantity(
    material: MaterialCost,
    capacity: number,
    project: Project
  ): number {
    // Calculate material quantities based on capacity and project specifics
    const baseQuantities: Record<string, number> = {
      'Copper Wire': capacity * 0.5, // 0.5 units per kW
      'Conduit': capacity * 0.3,
      'Control Cable': capacity * 0.2,
      'Pipe Fittings': capacity * 0.4,
      'Insulation': capacity * 1.2
    };
    
    return baseQuantities[material.name] || 1;
  }

  private calculateLaborRequirements(project: Project): Record<string, number> {
    const baseHours = {
      'project_manager': 160,
      'engineer': 240,
      'technician': 480,
      'electrician': 320,
      'pipefitter': 280
    };
    
    // Adjust based on project complexity
    const multiplier = project.type === 'cogeneration' ? 1.5 : 1.0;
    
    return Object.fromEntries(
      Object.entries(baseHours).map(([role, hours]) => [role, hours * multiplier])
    );
  }

  private isEquipmentSuitable(equipment: EquipmentCost, capacity: number): boolean {
    // Check if equipment capacity matches project requirements
    const equipCapacity = parseInt(equipment.capacity) || 0;
    return equipCapacity >= capacity * 0.8 && equipCapacity <= capacity * 1.2;
  }

  private calculateServiceUnits(service: ServiceCost, project: Project): number {
    const baseUnits: Record<string, number> = {
      'Engineering Design': 100, // hours
      'Permit Applications': 40,  // hours
      'Commissioning': 60,       // hours
      'Testing Services': 30,    // hours
      'Training': 16             // hours
    };
    
    return baseUnits[service.name] || 1;
  }

  private getLocationFactor(location: string): number {
    // Location-based cost adjustment factors
    const locationFactors: Record<string, number> = {
      'New York': 1.25,
      'California': 1.20,
      'Texas': 1.05,
      'Florida': 1.10,
      'default': 1.00
    };
    
    for (const [state, factor] of Object.entries(locationFactors)) {
      if (location.includes(state)) {
        return factor;
      }
    }
    
    return locationFactors.default;
  }

  private assessMaterialRisk(material: MaterialCost, project: Project): 'low' | 'medium' | 'high' {
    if (material.leadTime > 90) return 'high';
    if (material.leadTime > 30) return 'medium';
    return 'low';
  }

  private calculatePhaseWeight(phase: ProjectPhase, project: Project) {
    // Define typical cost distribution by phase
    const phaseWeights: Record<string, any> = {
      'Pre-Engineering & Planning': { materials: 0.05, labor: 0.20, equipment: 0.0, services: 0.40 },
      'Engineering & Design': { materials: 0.10, labor: 0.30, equipment: 0.0, services: 0.35 },
      'Procurement': { materials: 0.60, labor: 0.05, equipment: 0.90, services: 0.10 },
      'Installation': { materials: 0.20, labor: 0.40, equipment: 0.10, services: 0.10 },
      'Commissioning': { materials: 0.05, labor: 0.05, equipment: 0.0, services: 0.05 }
    };
    
    return phaseWeights[phase.name] || { materials: 0.2, labor: 0.2, equipment: 0.2, services: 0.2 };
  }

  private generatePhaseCashFlow(phase: ProjectPhase, totalCost: number): CashFlowItem[] {
    const duration = Math.ceil(
      (phase.plannedEndDate.getTime() - phase.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const items: CashFlowItem[] = [];
    let cumulative = 0;
    
    // Distribute costs over phase duration
    for (let day = 0; day < duration; day += 7) { // Weekly intervals
      const weeklyAmount = totalCost / (duration / 7);
      cumulative += weeklyAmount;
      
      items.push({
        date: new Date(phase.plannedStartDate.getTime() + day * 24 * 60 * 60 * 1000),
        description: `Week ${Math.floor(day/7) + 1} expenses`,
        amount: weeklyAmount,
        cumulative
      });
    }
    
    return items;
  }

  private calculateConfidence(estimationType: string, project: Project): number {
    let confidence = estimationType === 'preliminary' ? 70 : 85;
    
    // Adjust based on project factors
    if (project.type === 'cogeneration') confidence -= 5; // More complex
    if (project.status === 'planning') confidence -= 10; // Early stage
    
    return Math.max(50, confidence);
  }

  private generateAssumptions(project: Project, estimationType: string): string[] {
    return [
      'Material prices based on current market rates',
      'Labor rates include benefits and overhead',
      'Equipment prices include delivery and basic installation',
      'Normal site conditions assumed',
      'No extraordinary permitting requirements',
      'Standard quality specifications',
      estimationType === 'preliminary' ? 'Preliminary estimate accuracy ±30%' : 'Detailed estimate accuracy ±15%'
    ];
  }

  private async assessCostRisks(project: Project): Promise<CostRisk[]> {
    return [
      {
        id: 'risk-cost-001',
        factor: 'Material Price Volatility',
        probability: 0.3,
        impact: project.budget.totalBudget * 0.05,
        mitigation: 'Lock in material prices early with suppliers',
        contingency: project.budget.totalBudget * 0.02
      },
      {
        id: 'risk-cost-002',
        factor: 'Labor Availability',
        probability: 0.25,
        impact: project.budget.totalBudget * 0.08,
        mitigation: 'Secure skilled labor early in project',
        contingency: project.budget.totalBudget * 0.03
      },
      {
        id: 'risk-cost-003',
        factor: 'Equipment Lead Times',
        probability: 0.4,
        impact: project.budget.totalBudget * 0.03,
        mitigation: 'Order long-lead equipment early',
        contingency: project.budget.totalBudget * 0.015
      }
    ];
  }

  private async getActualCosts(project: Project) {
    // In real implementation, this would query actual cost data
    return {
      materials: project.budget.spent * 0.4,
      labor: project.budget.spent * 0.35,
      equipment: project.budget.spent * 0.20,
      services: project.budget.spent * 0.05,
      total: project.budget.spent
    };
  }

  private async getCommittedCosts(project: Project) {
    // In real implementation, this would query committed costs
    const total = project.budget.committed;
    return {
      purchaseOrders: [],
      contracts: [],
      total
    };
  }

  private async getForecastedCosts(project: Project) {
    const remaining = project.budget.remaining;
    return {
      remainingWork: remaining * 0.8,
      changeOrders: remaining * 0.1,
      contingency: remaining * 0.1,
      total: remaining
    };
  }

  private calculateVariance(project: Project, actualCosts: any) {
    const budgetedCost = project.budget.totalBudget * (project.overallProgress / 100);
    const costVariance = budgetedCost - actualCosts.total;
    const scheduleVariance = 0; // Would calculate based on schedule performance
    
    return {
      costVariance,
      scheduleVariance,
      performanceIndex: budgetedCost / actualCosts.total
    };
  }

  private async analyzeCostTrends(project: Project): Promise<CostTrend[]> {
    return [
      {
        category: 'Materials',
        trend: 'increasing',
        rate: 2.5,
        confidence: 80,
        factors: ['Supply chain inflation', 'Increased demand']
      },
      {
        category: 'Labor',
        trend: 'stable',
        rate: 0.5,
        confidence: 85,
        factors: ['Stable market conditions']
      }
    ];
  }

  private async generateCostAlerts(project: Project, actualCosts: any, variance: any): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];
    
    if (variance.costVariance < -project.budget.totalBudget * 0.05) {
      alerts.push({
        id: `alert-${Date.now()}`,
        type: 'budget_exceeded',
        severity: 'high',
        message: 'Project costs are exceeding budget by more than 5%',
        recommendation: 'Review scope and implement cost control measures',
        threshold: project.budget.totalBudget * 0.05,
        currentValue: Math.abs(variance.costVariance),
        createdAt: new Date()
      });
    }
    
    return alerts;
  }
}

