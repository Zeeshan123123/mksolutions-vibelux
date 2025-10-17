/**
 * Contractor Estimation Tools
 * Comprehensive cost estimation system for construction projects
 */

export interface LaborRate {
  trade: string;
  skillLevel: 'apprentice' | 'journeyman' | 'master' | 'foreman';
  baseRate: number; // per hour
  burdened: number; // includes benefits, insurance, overhead
  productivity: number; // units per hour
  location: string;
  lastUpdated: Date;
}

export interface MaterialCost {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  markup: number; // percentage
  waste: number; // percentage
  location: string;
  vendor: string;
  leadTime: number; // days
  lastUpdated: Date;
}

export interface EquipmentCost {
  id: string;
  type: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  operator: boolean;
  mobilization: number;
  fuelCost: number; // per hour
  location: string;
  lastUpdated: Date;
}

export interface ProjectOverhead {
  supervision: number; // percentage of labor
  generalConditions: number; // fixed cost
  permits: number; // fixed cost
  insurance: number; // percentage of total
  bond: number; // percentage of total
  profit: number; // percentage of total
  contingency: number; // percentage of total
}

export interface TaskEstimate {
  id: string;
  taskName: string;
  category: string;
  labor: {
    trade: string;
    hours: number;
    rate: number;
    total: number;
  }[];
  materials: {
    id: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  equipment: {
    id: string;
    duration: number; // days
    dailyRate: number;
    total: number;
  }[];
  subcontractor?: {
    trade: string;
    cost: number;
    scope: string;
  };
  totalCost: number;
  unit: string;
  productivity: number; // units per day
  duration: number; // days
}

export interface ProjectEstimate {
  projectId: string;
  projectName: string;
  location: string;
  estimator: string;
  date: Date;
  tasks: TaskEstimate[];
  overhead: ProjectOverhead;
  summary: {
    totalLabor: number;
    totalMaterials: number;
    totalEquipment: number;
    totalSubcontractors: number;
    subtotal: number;
    overheadCosts: number;
    totalCost: number;
    contingency: number;
    bondCost: number;
    finalCost: number;
  };
  schedule: {
    startDate: Date;
    endDate: Date;
    totalDuration: number; // days
    criticalPath: string[];
  };
  riskFactors: RiskFactor[];
}

export interface RiskFactor {
  category: 'weather' | 'supply' | 'labor' | 'regulatory' | 'technical' | 'financial';
  description: string;
  probability: number; // 0-1
  impact: number; // cost multiplier
  mitigation: string;
}

export interface HistoricalData {
  projectType: string;
  location: string;
  size: number;
  actualCost: number;
  estimatedCost: number;
  variance: number; // percentage
  completionDate: Date;
  lessons: string[];
}

export interface TaskLaborRequirement {
  trade: string;
  skillLevel: 'apprentice' | 'journeyman' | 'master' | 'foreman';
  hoursPerUnit: number;
}

export interface TaskMaterialRequirement {
  id: string;
  quantityPerUnit: number;
}

export interface TaskEquipmentRequirement {
  id: string;
  productivityPerDay: number;
}

export interface TaskTemplate {
  category: string;
  unit: string;
  labor: TaskLaborRequirement[];
  materials: TaskMaterialRequirement[];
  equipment?: TaskEquipmentRequirement[];
}

export interface ProjectData {
  id?: string;
  name?: string;
  area?: number;
  complexity?: 'low' | 'medium' | 'high';
  startDate?: Date;
  estimator?: string;
  electrical?: boolean;
  mechanical?: boolean;
  value?: number;
  fastTrack?: boolean;
  fixtureCount?: number;
  structure?: {
    windLoadRating?: number;
    snowLoadRating?: number;
    seismicDesignCategory?: string;
  };
  envelope?: {
    climateZone?: string;
  };
}

export class ContractorEstimationEngine {
  private laborRates: Map<string, LaborRate[]> = new Map();
  private materialCosts: Map<string, MaterialCost> = new Map();
  private equipmentCosts: Map<string, EquipmentCost> = new Map();
  private historicalData: HistoricalData[] = [];

  constructor() {
    this.initializeDefaultRates();
  }

  /**
   * Create comprehensive project estimate
   */
  async createProjectEstimate(
    projectData: ProjectData,
    location: string,
    scope: string[]
  ): Promise<ProjectEstimate> {
    
    // Generate task estimates for each scope item
    const tasks: TaskEstimate[] = [];
    
    for (const scopeItem of scope) {
      const taskEstimate = this.estimateTask(scopeItem, projectData, location);
      tasks.push(taskEstimate);
    }

    // Calculate project overhead
    const overhead = this.calculateProjectOverhead(projectData, location);
    
    // Calculate summary totals
    const summary = this.calculateProjectSummary(tasks, overhead);
    
    // Generate schedule
    const schedule = this.calculateProjectSchedule(tasks, projectData.startDate);
    
    // Assess risk factors
    const riskFactors = this.assessProjectRisks(projectData, location, tasks);

    return {
      projectId: projectData.id || this.generateProjectId(),
      projectName: projectData.name || 'Construction Project',
      location,
      estimator: projectData.estimator || 'System Generated',
      date: new Date(),
      tasks,
      overhead,
      summary,
      schedule,
      riskFactors
    };
  }

  /**
   * Estimate individual construction task
   */
  private estimateTask(
    scopeItem: string,
    projectData: ProjectData,
    location: string
  ): TaskEstimate {
    
    const taskTemplate = this.getTaskTemplate(scopeItem);
    const quantity = this.calculateTaskQuantity(scopeItem, projectData);
    
    // Calculate labor costs
    const labor = this.calculateLaborCosts(taskTemplate, quantity, location);
    
    // Calculate material costs
    const materials = this.calculateMaterialCosts(taskTemplate, quantity, location);
    
    // Calculate equipment costs
    const equipment = this.calculateEquipmentCosts(taskTemplate, quantity, location);
    
    // Calculate total task cost
    const totalCost = [
      ...labor.map(l => l.total),
      ...materials.map(m => m.total),
      ...equipment.map(e => e.total)
    ].reduce((sum, cost) => sum + cost, 0);

    // Calculate productivity and duration
    const productivity = this.calculateProductivity(taskTemplate, labor);
    const duration = Math.ceil(quantity / productivity);

    return {
      id: this.generateTaskId(),
      taskName: scopeItem,
      category: taskTemplate.category,
      labor,
      materials,
      equipment,
      totalCost,
      unit: taskTemplate.unit,
      productivity,
      duration
    };
  }

  /**
   * Calculate labor costs for a task
   */
  private calculateLaborCosts(taskTemplate: TaskTemplate, quantity: number, location: string) {
    const laborCosts = [];
    
    for (const laborReq of taskTemplate.labor) {
      const rates = this.getLaborRates(laborReq.trade, location);
      const rate = rates.find(r => r.skillLevel === laborReq.skillLevel) || rates[0];
      
      if (rate) {
        const hours = quantity * laborReq.hoursPerUnit;
        const total = hours * rate.burdened;
        
        laborCosts.push({
          trade: laborReq.trade,
          hours,
          rate: rate.burdened,
          total
        });
      }
    }
    
    return laborCosts;
  }

  /**
   * Calculate material costs for a task
   */
  private calculateMaterialCosts(taskTemplate: TaskTemplate, quantity: number, location: string) {
    const materialCosts = [];
    
    for (const materialReq of taskTemplate.materials) {
      const material = this.getMaterialCost(materialReq.id, location);
      
      if (material) {
        const rawQuantity = quantity * materialReq.quantityPerUnit;
        const wasteQuantity = rawQuantity * (1 + material.waste / 100);
        const unitCostWithMarkup = material.basePrice * (1 + material.markup / 100);
        const total = wasteQuantity * unitCostWithMarkup;
        
        materialCosts.push({
          id: material.id,
          quantity: wasteQuantity,
          unitCost: unitCostWithMarkup,
          total
        });
      }
    }
    
    return materialCosts;
  }

  /**
   * Calculate equipment costs for a task
   */
  private calculateEquipmentCosts(taskTemplate: TaskTemplate, quantity: number, location: string) {
    const equipmentCosts = [];
    
    for (const equipmentReq of taskTemplate.equipment || []) {
      const equipment = this.getEquipmentCost(equipmentReq.id, location);
      
      if (equipment) {
        const duration = Math.ceil(quantity / equipmentReq.productivityPerDay);
        const total = duration * equipment.dailyRate + equipment.mobilization;
        
        equipmentCosts.push({
          id: equipment.id,
          duration,
          dailyRate: equipment.dailyRate,
          total
        });
      }
    }
    
    return equipmentCosts;
  }

  /**
   * Calculate project overhead costs
   */
  private calculateProjectOverhead(projectData: ProjectData, location: string): ProjectOverhead {
    // Base overhead percentages (can be customized by location/project type)
    const baseOverhead = {
      supervision: 15, // 15% of labor
      generalConditions: 50000, // Fixed amount
      permits: this.estimatePermitCosts(projectData, location),
      insurance: 2, // 2% of total
      bond: 1, // 1% of total
      profit: 8, // 8% of total
      contingency: 10 // 10% of total
    };

    // Adjust based on project characteristics
    if (projectData.complexity === 'high') {
      baseOverhead.supervision += 5;
      baseOverhead.contingency += 5;
    }

    if (projectData.fastTrack) {
      baseOverhead.supervision += 3;
      baseOverhead.contingency += 3;
    }

    return baseOverhead;
  }

  /**
   * Calculate project summary totals
   */
  private calculateProjectSummary(tasks: TaskEstimate[], overhead: ProjectOverhead) {
    const totalLabor = tasks.reduce((sum, task) => 
      sum + task.labor.reduce((laborSum, labor) => laborSum + labor.total, 0), 0
    );
    
    const totalMaterials = tasks.reduce((sum, task) => 
      sum + task.materials.reduce((matSum, material) => matSum + material.total, 0), 0
    );
    
    const totalEquipment = tasks.reduce((sum, task) => 
      sum + task.equipment.reduce((eqSum, equipment) => eqSum + equipment.total, 0), 0
    );
    
    const totalSubcontractors = tasks.reduce((sum, task) => 
      sum + (task.subcontractor?.cost || 0), 0
    );
    
    const subtotal = totalLabor + totalMaterials + totalEquipment + totalSubcontractors;
    
    const supervisionCost = totalLabor * (overhead.supervision / 100);
    const insuranceCost = subtotal * (overhead.insurance / 100);
    const overheadCosts = supervisionCost + overhead.generalConditions + overhead.permits + insuranceCost;
    
    const totalCost = subtotal + overheadCosts;
    const contingency = totalCost * (overhead.contingency / 100);
    const bondCost = totalCost * (overhead.bond / 100);
    const profit = totalCost * (overhead.profit / 100);
    const finalCost = totalCost + contingency + bondCost + profit;

    return {
      totalLabor,
      totalMaterials,
      totalEquipment,
      totalSubcontractors,
      subtotal,
      overheadCosts,
      totalCost,
      contingency,
      bondCost,
      finalCost
    };
  }

  /**
   * Calculate project schedule
   */
  private calculateProjectSchedule(tasks: TaskEstimate[], startDate: Date) {
    // Simple serial scheduling (could be enhanced with CPM/PERT)
    const criticalPath = [];
    let totalDuration = 0;

    // Sort tasks by logical sequence
    const orderedTasks = this.orderTasksBySequence(tasks);
    
    for (const task of orderedTasks) {
      totalDuration += task.duration;
      criticalPath.push(task.taskName);
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDuration);

    return {
      startDate,
      endDate,
      totalDuration,
      criticalPath
    };
  }

  /**
   * Assess project risk factors
   */
  private assessProjectRisks(projectData: ProjectData, location: string, tasks: TaskEstimate[]): RiskFactor[] {
    const risks: RiskFactor[] = [];

    // Weather risks
    if (this.isWeatherSensitiveLocation(location)) {
      risks.push({
        category: 'weather',
        description: 'Weather delays during construction season',
        probability: 0.3,
        impact: 1.1,
        mitigation: 'Schedule critical work during favorable weather windows'
      });
    }

    // Supply chain risks
    const hasLongLeadItems = tasks.some(task => 
      task.materials.some(material => {
        const materialData = this.materialCosts.get(material.id);
        return materialData && materialData.leadTime > 30;
      })
    );

    if (hasLongLeadItems) {
      risks.push({
        category: 'supply',
        description: 'Long lead time materials may cause delays',
        probability: 0.4,
        impact: 1.15,
        mitigation: 'Order long-lead items early and identify alternatives'
      });
    }

    // Labor risks
    if (this.isTightLaborMarket(location)) {
      risks.push({
        category: 'labor',
        description: 'Skilled labor shortage in local market',
        probability: 0.5,
        impact: 1.2,
        mitigation: 'Pre-qualify subcontractors and consider travel allowances'
      });
    }

    return risks;
  }

  /**
   * Get historical performance data for similar projects
   */
  getHistoricalPerformance(projectType: string, location: string): HistoricalData[] {
    return this.historicalData.filter(data => 
      data.projectType === projectType && 
      this.isNearbyLocation(data.location, location)
    );
  }

  /**
   * Generate change order estimate
   */
  generateChangeOrderEstimate(
    originalEstimate: ProjectEstimate,
    changeDescription: string,
    changedScope: string[]
  ): {
    addedCosts: TaskEstimate[];
    removedCosts: TaskEstimate[];
    netChange: number;
    timeImpact: number;
  } {
    const addedCosts = changedScope.map(scope => 
      this.estimateTask(scope, {}, originalEstimate.location)
    );

    // Placeholder for removed costs logic
    const removedCosts: TaskEstimate[] = [];

    const netChange = addedCosts.reduce((sum, task) => sum + task.totalCost, 0) -
                     removedCosts.reduce((sum, task) => sum + task.totalCost, 0);

    const timeImpact = Math.max(...addedCosts.map(task => task.duration));

    return {
      addedCosts,
      removedCosts,
      netChange,
      timeImpact
    };
  }

  // Helper methods and default data initialization
  private initializeDefaultRates() {
    // Initialize with realistic construction rates
    this.setDefaultLaborRates();
    this.setDefaultMaterialCosts();
    this.setDefaultEquipmentCosts();
  }

  private setDefaultLaborRates() {
    const electricianRates: LaborRate[] = [
      {
        trade: 'Electrician',
        skillLevel: 'apprentice',
        baseRate: 25,
        burdened: 40,
        productivity: 0.8,
        location: 'National',
        lastUpdated: new Date()
      },
      {
        trade: 'Electrician',
        skillLevel: 'journeyman',
        baseRate: 45,
        burdened: 70,
        productivity: 1.0,
        location: 'National',
        lastUpdated: new Date()
      },
      {
        trade: 'Electrician',
        skillLevel: 'master',
        baseRate: 55,
        burdened: 85,
        productivity: 1.2,
        location: 'National',
        lastUpdated: new Date()
      }
    ];

    this.laborRates.set('Electrician', electricianRates);
  }

  private setDefaultMaterialCosts() {
    const materials: MaterialCost[] = [
      {
        id: 'EMT-1/2',
        name: '1/2" EMT Conduit',
        category: 'Electrical',
        basePrice: 2.50,
        unit: 'LF',
        markup: 25,
        waste: 10,
        location: 'National',
        vendor: 'Electrical Supply',
        leadTime: 5,
        lastUpdated: new Date()
      },
      {
        id: 'THWN-12',
        name: '#12 THWN Wire',
        category: 'Electrical',
        basePrice: 0.85,
        unit: 'LF',
        markup: 25,
        waste: 15,
        location: 'National',
        vendor: 'Electrical Supply',
        leadTime: 3,
        lastUpdated: new Date()
      },
      {
        id: 'LED-FIXTURE-4FT',
        name: '4ft LED Light Fixture',
        category: 'Electrical',
        basePrice: 85.00,
        unit: 'EA',
        markup: 25,
        waste: 5,
        location: 'National',
        vendor: 'Lighting Supply',
        leadTime: 7,
        lastUpdated: new Date()
      },
      {
        id: 'MOUNTING-HARDWARE',
        name: 'Fixture Mounting Hardware Kit',
        category: 'Electrical',
        basePrice: 12.00,
        unit: 'EA',
        markup: 25,
        waste: 10,
        location: 'National',
        vendor: 'Hardware Supply',
        leadTime: 2,
        lastUpdated: new Date()
      }
    ];

    materials.forEach(material => {
      this.materialCosts.set(material.id, material);
    });
  }

  private setDefaultEquipmentCosts() {
    const equipment: EquipmentCost[] = [
      {
        id: 'SCISSOR-LIFT-20',
        type: '20ft Scissor Lift',
        dailyRate: 250,
        weeklyRate: 1000,
        monthlyRate: 3500,
        operator: false,
        mobilization: 200,
        fuelCost: 15,
        location: 'National',
        lastUpdated: new Date()
      }
    ];

    equipment.forEach(eq => {
      this.equipmentCosts.set(eq.id, eq);
    });
  }

  private getTaskTemplate(scopeItem: string): TaskTemplate {
    // Task templates define the resources needed for different construction activities
    const templates: Record<string, TaskTemplate> = {
      'Electrical Rough-In': {
        category: 'Electrical',
        unit: 'SF',
        labor: [
          { trade: 'Electrician', skillLevel: 'journeyman', hoursPerUnit: 0.02 }
        ],
        materials: [
          { id: 'EMT-1/2', quantityPerUnit: 0.1 },
          { id: 'THWN-12', quantityPerUnit: 0.3 }
        ],
        equipment: [
          { id: 'SCISSOR-LIFT-20', productivityPerDay: 1000 }
        ]
      },
      'LED Fixture Installation': {
        category: 'Electrical',
        unit: 'EA',
        labor: [
          { trade: 'Electrician', skillLevel: 'journeyman', hoursPerUnit: 1.5 }
        ],
        materials: [
          { id: 'LED-FIXTURE-4FT', quantityPerUnit: 1 },
          { id: 'MOUNTING-HARDWARE', quantityPerUnit: 1 }
        ]
      }
    };

    return templates[scopeItem] || {
      category: 'General',
      unit: 'LS',
      labor: [{ trade: 'General Labor', skillLevel: 'journeyman', hoursPerUnit: 8 }],
      materials: [],
      equipment: []
    };
  }

  private calculateTaskQuantity(scopeItem: string, projectData: ProjectData): number {
    // Calculate quantities based on project data
    if (scopeItem.includes('Electrical') && projectData.area) {
      return projectData.area; // SF
    }
    if (scopeItem.includes('Fixture') && projectData.fixtureCount) {
      return projectData.fixtureCount; // EA
    }
    return 1; // Default to 1 LS
  }

  private calculateProductivity(taskTemplate: TaskTemplate, labor: { trade: string; hours: number; rate: number; total: number }[]): number {
    // Calculate overall productivity based on labor and task complexity
    const baseProd = 100; // units per day base
    const laborFactor = labor.reduce((sum, l) => sum + l.hours, 0) / 8; // crew size factor
    return baseProd / Math.max(1, laborFactor);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getLaborRates(trade: string, _location: string): LaborRate[] {
    // TODO: Implement location-specific rate adjustments
    return this.laborRates.get(trade) || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getMaterialCost(materialId: string, _location: string): MaterialCost | undefined {
    // TODO: Implement location-specific material pricing
    return this.materialCosts.get(materialId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getEquipmentCost(equipmentId: string, _location: string): EquipmentCost | undefined {
    // TODO: Implement location-specific equipment rates
    return this.equipmentCosts.get(equipmentId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private estimatePermitCosts(projectData: ProjectData, _location: string): number {
    // TODO: Implement location-specific permit costs
    // Base permit costs
    let permitCost = 1000; // Base building permit
    
    if (projectData.electrical) permitCost += 500;
    if (projectData.mechanical) permitCost += 400;
    if (projectData.value > 100000) permitCost += projectData.value * 0.002;
    
    return permitCost;
  }

  private orderTasksBySequence(tasks: TaskEstimate[]): TaskEstimate[] {
    // Simple ordering - in practice would use dependency logic
    const sequence = ['Foundation', 'Framing', 'Electrical Rough', 'Drywall', 'Electrical Trim'];
    
    return tasks.sort((a, b) => {
      const aIndex = sequence.findIndex(seq => a.taskName.includes(seq));
      const bIndex = sequence.findIndex(seq => b.taskName.includes(seq));
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }

  private isWeatherSensitiveLocation(location: string): boolean {
    // Check if location has significant weather risks
    const weatherRiskStates = ['MN', 'ND', 'WI', 'MT', 'ME', 'VT', 'NH'];
    return weatherRiskStates.some(state => location.includes(state));
  }

  private isTightLaborMarket(location: string): boolean {
    // Check if location has labor shortage issues
    const tightMarkets = ['CA', 'NY', 'WA', 'CO', 'TX'];
    return tightMarkets.some(state => location.includes(state));
  }

  private isNearbyLocation(loc1: string, loc2: string): boolean {
    // Simple string comparison - could enhance with geographic distance
    return loc1.includes(loc2.split(',')[1]?.trim() || ''); // Compare states
  }

  private generateProjectId(): string {
    return `PROJ-${Date.now().toString(36).toUpperCase()}`;
  }

  private generateTaskId(): string {
    return `TASK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
}