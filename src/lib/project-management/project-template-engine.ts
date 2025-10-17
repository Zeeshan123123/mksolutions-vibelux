/**
 * Project Template Engine
 * Automated project template generation system for different types of cogeneration projects
 */

import type {
  ProjectTemplate,
  PhaseTemplate,
  TaskTemplate,
  Project,
  ProjectTask,
  ProjectPhase,
  ProjectType,
  TaskCategory,
  TaskPriority
} from '@/lib/project-management/project-types';

interface ProjectRequirements {
  projectType: ProjectType;
  systemCapacity: {
    electrical: number; // kW
    thermal: number; // kW
  };
  facilityType: string;
  complexity: 'simple' | 'moderate' | 'complex';
  budget: number;
  timeline: number; // weeks
  specialRequirements?: string[];
  clientPreferences?: {
    fastTrack: boolean;
    qualityFocus: boolean;
    costOptimized: boolean;
  };
}

interface TemplateGenerationOptions {
  includeOptionalTasks: boolean;
  addBufferTime: boolean;
  enableRiskMitigation: boolean;
  generateDetailedSpecs: boolean;
  includeTraining: boolean;
}

export class ProjectTemplateEngine {
  private static readonly BASE_TEMPLATES: Record<ProjectType, ProjectTemplate> = {
    cogeneration: {
      id: 'template-cogen-001',
      name: 'Standard Cogeneration Project',
      description: 'Comprehensive cogeneration system installation project',
      type: 'cogeneration',
      phases: [
        {
          name: 'Pre-Engineering & Planning',
          description: 'Initial planning, site assessment, and preliminary design',
          durationPercent: 15,
          tasks: ['site-survey', 'energy-analysis', 'feasibility-study', 'preliminary-design']
        },
        {
          name: 'Engineering & Design',
          description: 'Detailed engineering design and documentation',
          durationPercent: 25,
          tasks: ['detailed-design', 'equipment-selection', 'permit-applications', 'design-review']
        },
        {
          name: 'Procurement',
          description: 'Equipment and material procurement',
          durationPercent: 35,
          tasks: ['equipment-procurement', 'material-procurement', 'delivery-coordination', 'quality-inspection']
        },
        {
          name: 'Installation',
          description: 'Site preparation and equipment installation',
          durationPercent: 20,
          tasks: ['site-preparation', 'equipment-installation', 'electrical-installation', 'piping-installation']
        },
        {
          name: 'Commissioning',
          description: 'Testing, commissioning, and handover',
          durationPercent: 5,
          tasks: ['system-testing', 'performance-commissioning', 'training', 'documentation']
        }
      ],
      tasks: [
        // Pre-Engineering Phase
        {
          name: 'Site Survey and Assessment',
          description: 'Comprehensive site survey and facility assessment',
          category: 'engineering',
          estimatedHours: 40,
          dependencies: [],
          deliverables: ['Site Survey Report', 'Facility Assessment']
        },
        {
          name: 'Energy Analysis',
          description: 'Detailed energy consumption and load analysis',
          category: 'engineering',
          estimatedHours: 32,
          dependencies: ['site-survey'],
          deliverables: ['Energy Analysis Report', 'Load Profiles']
        },
        {
          name: 'Feasibility Study',
          description: 'Technical and economic feasibility analysis',
          category: 'engineering',
          estimatedHours: 24,
          dependencies: ['energy-analysis'],
          deliverables: ['Feasibility Report', 'ROI Analysis']
        },
        
        // Engineering Phase
        {
          name: 'Equipment Selection and Sizing',
          description: 'Select and size cogeneration equipment',
          category: 'engineering',
          estimatedHours: 48,
          dependencies: ['feasibility-study'],
          deliverables: ['Equipment Specifications', 'Sizing Calculations']
        },
        {
          name: 'Detailed Engineering Design',
          description: 'Create detailed engineering drawings and specifications',
          category: 'design',
          estimatedHours: 120,
          dependencies: ['equipment-selection'],
          deliverables: ['P&ID Drawings', 'Electrical Schematics', 'Layout Drawings']
        },
        {
          name: 'Permit Applications',
          description: 'Submit and obtain all required permits',
          category: 'approval',
          estimatedHours: 80,
          dependencies: ['detailed-design'],
          deliverables: ['Permit Applications', 'Regulatory Approvals']
        },
        
        // Procurement Phase
        {
          name: 'Equipment Procurement',
          description: 'Order major cogeneration equipment',
          category: 'procurement',
          estimatedHours: 40,
          dependencies: ['permit-applications'],
          deliverables: ['Purchase Orders', 'Equipment Schedules']
        },
        {
          name: 'Material Procurement',
          description: 'Order installation materials and components',
          category: 'procurement',
          estimatedHours: 32,
          dependencies: ['detailed-design'],
          deliverables: ['Material Lists', 'Procurement Schedule']
        },
        
        // Installation Phase
        {
          name: 'Site Preparation',
          description: 'Prepare site and install foundations',
          category: 'construction',
          estimatedHours: 200,
          dependencies: ['equipment-procurement'],
          deliverables: ['Site Ready', 'Foundation Complete']
        },
        {
          name: 'Equipment Installation',
          description: 'Install cogeneration units and auxiliary equipment',
          category: 'construction',
          estimatedHours: 320,
          dependencies: ['site-preparation'],
          deliverables: ['Equipment Installed', 'Mechanical Complete']
        },
        {
          name: 'Electrical Installation',
          description: 'Install electrical systems and connections',
          category: 'construction',
          estimatedHours: 160,
          dependencies: ['equipment-installation'],
          deliverables: ['Electrical Complete', 'Control Systems Ready']
        },
        
        // Commissioning Phase
        {
          name: 'System Testing',
          description: 'Conduct comprehensive system testing',
          category: 'testing',
          estimatedHours: 80,
          dependencies: ['electrical-installation'],
          deliverables: ['Test Reports', 'Performance Data']
        },
        {
          name: 'Performance Commissioning',
          description: 'Commission system and verify performance',
          category: 'commissioning',
          estimatedHours: 60,
          dependencies: ['system-testing'],
          deliverables: ['Commissioning Report', 'Performance Guarantee']
        },
        {
          name: 'Training and Documentation',
          description: 'Provide operator training and final documentation',
          category: 'training',
          estimatedHours: 40,
          dependencies: ['performance-commissioning'],
          deliverables: ['Training Records', 'O&M Manuals']
        }
      ],
      estimatedDuration: 140, // days
      complexity: 'moderate'
    },
    
    lighting_design: {
      id: 'template-lighting-001',
      name: 'LED Lighting Retrofit Project',
      description: 'Facility-wide LED lighting upgrade project',
      type: 'lighting_design',
      phases: [],
      tasks: [],
      estimatedDuration: 45,
      complexity: 'simple'
    },
    
    hvac_design: {
      id: 'template-hvac-001',
      name: 'HVAC System Design Project',
      description: 'Commercial HVAC system design and installation',
      type: 'hvac_design',
      phases: [],
      tasks: [],
      estimatedDuration: 90,
      complexity: 'moderate'
    },
    
    facility_design: {
      id: 'template-facility-001',
      name: 'Comprehensive Facility Design',
      description: 'Complete facility energy system design',
      type: 'facility_design',
      phases: [],
      tasks: [],
      estimatedDuration: 180,
      complexity: 'complex'
    },
    
    retrofit: {
      id: 'template-retrofit-001',
      name: 'Energy Efficiency Retrofit',
      description: 'Building energy efficiency improvement project',
      type: 'retrofit',
      phases: [],
      tasks: [],
      estimatedDuration: 60,
      complexity: 'simple'
    },
    
    maintenance: {
      id: 'template-maintenance-001',
      name: 'Preventive Maintenance Program',
      description: 'Comprehensive maintenance program setup',
      type: 'maintenance',
      phases: [],
      tasks: [],
      estimatedDuration: 30,
      complexity: 'simple'
    }
  };

  /**
   * Generate a customized project template based on requirements
   */
  static generateTemplate(
    requirements: ProjectRequirements,
    options: TemplateGenerationOptions = {
      includeOptionalTasks: true,
      addBufferTime: true,
      enableRiskMitigation: true,
      generateDetailedSpecs: true,
      includeTraining: true
    }
  ): ProjectTemplate {
    const baseTemplate = this.BASE_TEMPLATES[requirements.projectType];
    if (!baseTemplate) {
      throw new Error(`No template found for project type: ${requirements.projectType}`);
    }

    // Clone base template
    const template: ProjectTemplate = JSON.parse(JSON.stringify(baseTemplate));
    
    // Customize based on requirements
    template.id = `template-${requirements.projectType}-${Date.now()}`;
    template.name = this.generateTemplateName(requirements);
    template.description = this.generateTemplateDescription(requirements);
    template.complexity = requirements.complexity;
    
    // Adjust duration based on complexity and capacity
    template.estimatedDuration = this.calculateDuration(requirements, options);
    
    // Customize phases
    template.phases = this.customizePhases(template.phases, requirements, options);
    
    // Customize tasks
    template.tasks = this.customizeTasks(template.tasks, requirements, options);

    return template;
  }

  /**
   * Create a project from a template
   */
  static async createProjectFromTemplate(
    template: ProjectTemplate,
    projectDetails: {
      name: string;
      clientInfo: any;
      startDate: Date;
      budget: number;
      teamMembers?: string[];
    }
  ): Promise<Project> {
    const phases = this.generateProjectPhases(template, projectDetails.startDate);
    const tasks = this.generateProjectTasks(template, phases, projectDetails.startDate);
    
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: projectDetails.name,
      description: template.description,
      type: template.type,
      
      // Client & Location (simplified for template)
      client: projectDetails.clientInfo,
      location: {
        name: 'Project Site',
        address: '',
        coordinates: { latitude: 0, longitude: 0 },
        timezone: 'America/New_York',
        climate: 'Temperate',
        utilities: {
          electrical: 'Local Utility',
          gas: 'Natural Gas Provider',
          water: 'Municipal Water',
          internet: 'High-speed available'
        }
      },
      
      // Timing
      plannedStartDate: projectDetails.startDate,
      plannedEndDate: this.calculateProjectEndDate(projectDetails.startDate, template.estimatedDuration),
      
      // Status & Progress
      status: 'planning',
      overallProgress: 0,
      health: 'green',
      
      // Structure
      phases,
      tasks,
      milestones: this.generateMilestones(tasks),
      
      // Team & Resources
      projectManager: projectDetails.teamMembers?.[0] || 'pm-001',
      team: [],
      stakeholders: [],
      
      // Budget & Contracts
      budget: {
        totalBudget: projectDetails.budget,
        spent: 0,
        committed: 0,
        remaining: projectDetails.budget,
        contingency: projectDetails.budget * 0.1,
        currency: 'USD',
        breakdown: [],
        changes: []
      },
      contracts: [],
      
      // Quality & Risk
      qualityPlan: {
        standards: ['ISO 9001:2015'],
        procedures: [],
        inspectionSchedule: [],
        metrics: []
      },
      riskRegister: this.generateTemplateRisks(template.type),
      
      // Design Integration
      designData: {
        facilityId: `facility-${Date.now()}`,
        designState: null,
        cogenerationComponents: [],
        drawings: [],
        specifications: []
      },
      
      // Communication
      communications: [],
      meetingNotes: [],
      
      // Documentation
      documents: [],
      
      // Tracking
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'template-engine'
    };

    return project;
  }

  private static generateTemplateName(requirements: ProjectRequirements): string {
    const capacity = requirements.systemCapacity.electrical;
    const type = requirements.projectType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (requirements.projectType === 'cogeneration') {
      return `${capacity}kW Cogeneration ${requirements.complexity.charAt(0).toUpperCase() + requirements.complexity.slice(1)} Project`;
    }
    
    return `${type} ${requirements.complexity.charAt(0).toUpperCase() + requirements.complexity.slice(1)} Project`;
  }

  private static generateTemplateDescription(requirements: ProjectRequirements): string {
    const descriptions = {
      cogeneration: `${requirements.systemCapacity.electrical}kW cogeneration system installation for ${requirements.facilityType} facility`,
      lighting_design: `LED lighting retrofit project for ${requirements.facilityType}`,
      hvac_design: `HVAC system design and installation for ${requirements.facilityType}`,
      facility_design: `Comprehensive facility energy system design for ${requirements.facilityType}`,
      retrofit: `Energy efficiency retrofit project for ${requirements.facilityType}`,
      maintenance: `Preventive maintenance program for ${requirements.facilityType}`
    };
    
    return descriptions[requirements.projectType] || `${requirements.projectType} project`;
  }

  private static calculateDuration(requirements: ProjectRequirements, options: TemplateGenerationOptions): number {
    let baseDuration = this.BASE_TEMPLATES[requirements.projectType].estimatedDuration;
    
    // Adjust for complexity
    const complexityMultipliers = {
      simple: 0.8,
      moderate: 1.0,
      complex: 1.4
    };
    baseDuration *= complexityMultipliers[requirements.complexity];
    
    // Adjust for system capacity (for cogeneration)
    if (requirements.projectType === 'cogeneration') {
      const capacityFactor = Math.max(0.8, Math.min(1.5, requirements.systemCapacity.electrical / 500));
      baseDuration *= capacityFactor;
    }
    
    // Add buffer time if requested
    if (options.addBufferTime) {
      baseDuration *= 1.15; // 15% buffer
    }
    
    // Fast track option
    if (requirements.clientPreferences?.fastTrack) {
      baseDuration *= 0.85; // 15% reduction
    }
    
    return Math.ceil(baseDuration);
  }

  private static customizePhases(
    basePhases: PhaseTemplate[],
    requirements: ProjectRequirements,
    options: TemplateGenerationOptions
  ): PhaseTemplate[] {
    return basePhases.map(phase => ({
      ...phase,
      durationPercent: this.adjustPhaseDuration(phase, requirements, options)
    }));
  }

  private static adjustPhaseDuration(
    phase: PhaseTemplate,
    requirements: ProjectRequirements,
    options: TemplateGenerationOptions
  ): number {
    let duration = phase.durationPercent;
    
    // Adjust based on client preferences
    if (requirements.clientPreferences?.qualityFocus && phase.name.includes('Engineering')) {
      duration *= 1.2; // More time for engineering
    }
    
    if (requirements.clientPreferences?.fastTrack && phase.name.includes('Procurement')) {
      duration *= 0.9; // Accelerate procurement
    }
    
    return duration;
  }

  private static customizeTasks(
    baseTasks: TaskTemplate[],
    requirements: ProjectRequirements,
    options: TemplateGenerationOptions
  ): TaskTemplate[] {
    let tasks = [...baseTasks];
    
    // Add optional tasks based on requirements
    if (options.includeOptionalTasks) {
      tasks = this.addOptionalTasks(tasks, requirements);
    }
    
    // Add risk mitigation tasks
    if (options.enableRiskMitigation) {
      tasks = this.addRiskMitigationTasks(tasks, requirements);
    }
    
    // Add detailed specifications tasks
    if (options.generateDetailedSpecs) {
      tasks = this.addDetailedSpecTasks(tasks, requirements);
    }
    
    // Adjust task effort based on complexity
    tasks = tasks.map(task => ({
      ...task,
      estimatedHours: this.adjustTaskEffort(task, requirements)
    }));
    
    return tasks;
  }

  private static addOptionalTasks(tasks: TaskTemplate[], requirements: ProjectRequirements): TaskTemplate[] {
    const optionalTasks: TaskTemplate[] = [];
    
    if (requirements.systemCapacity.electrical > 1000) {
      optionalTasks.push({
        name: 'Environmental Impact Assessment',
        description: 'Assess environmental impact for large systems',
        category: 'approval',
        estimatedHours: 40,
        dependencies: ['feasibility-study'],
        deliverables: ['Environmental Report']
      });
    }
    
    if (requirements.complexity === 'complex') {
      optionalTasks.push({
        name: 'Advanced Controls Integration',
        description: 'Integrate with building management systems',
        category: 'engineering',
        estimatedHours: 60,
        dependencies: ['detailed-design'],
        deliverables: ['Controls Integration Plan']
      });
    }
    
    return [...tasks, ...optionalTasks];
  }

  private static addRiskMitigationTasks(tasks: TaskTemplate[], requirements: ProjectRequirements): TaskTemplate[] {
    const riskTasks: TaskTemplate[] = [
      {
        name: 'Risk Assessment and Planning',
        description: 'Identify and plan mitigation for project risks',
        category: 'engineering',
        estimatedHours: 16,
        dependencies: ['site-survey'],
        deliverables: ['Risk Register', 'Mitigation Plan']
      },
      {
        name: 'Contingency Planning',
        description: 'Develop contingency plans for critical risks',
        category: 'engineering',
        estimatedHours: 12,
        dependencies: ['risk-assessment'],
        deliverables: ['Contingency Plans']
      }
    ];
    
    return [...tasks, ...riskTasks];
  }

  private static addDetailedSpecTasks(tasks: TaskTemplate[], requirements: ProjectRequirements): TaskTemplate[] {
    const specTasks: TaskTemplate[] = [
      {
        name: 'Detailed Specifications Development',
        description: 'Develop comprehensive technical specifications',
        category: 'documentation',
        estimatedHours: 40,
        dependencies: ['detailed-design'],
        deliverables: ['Technical Specifications', 'Performance Requirements']
      }
    ];
    
    return [...tasks, ...specTasks];
  }

  private static adjustTaskEffort(task: TaskTemplate, requirements: ProjectRequirements): number {
    let effort = task.estimatedHours;
    
    // Complexity adjustments
    const complexityMultipliers = {
      simple: 0.8,
      moderate: 1.0,
      complex: 1.3
    };
    effort *= complexityMultipliers[requirements.complexity];
    
    // Category-specific adjustments
    if (task.category === 'engineering' && requirements.systemCapacity.electrical > 500) {
      effort *= 1.2; // More engineering for larger systems
    }
    
    return Math.ceil(effort);
  }

  private static generateProjectPhases(template: ProjectTemplate, startDate: Date): ProjectPhase[] {
    const phases: ProjectPhase[] = [];
    let currentDate = new Date(startDate);
    
    template.phases.forEach((phaseTemplate, index) => {
      const phaseDuration = Math.ceil((template.estimatedDuration * phaseTemplate.durationPercent) / 100);
      const endDate = new Date(currentDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000);
      
      phases.push({
        id: `phase-${index + 1}`,
        name: phaseTemplate.name,
        description: phaseTemplate.description,
        order: index + 1,
        color: this.getPhaseColor(index),
        plannedStartDate: new Date(currentDate),
        plannedEndDate: endDate,
        status: 'planned',
        progress: 0,
        budget: 100000, // Default budget
        actualCost: 0,
        approvals: [],
        taskIds: []
      });
      
      currentDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // Next day
    });
    
    return phases;
  }

  private static generateProjectTasks(
    template: ProjectTemplate,
    phases: ProjectPhase[],
    startDate: Date
  ): ProjectTask[] {
    const tasks: ProjectTask[] = [];
    let taskCounter = 1;
    
    // Group tasks by phase
    const phaseTaskMap = new Map<string, TaskTemplate[]>();
    template.phases.forEach(phase => {
      phaseTaskMap.set(phase.name, template.tasks.filter(task => 
        phase.tasks.some(taskName => task.name.toLowerCase().includes(taskName.replace('-', ' ')))
      ));
    });
    
    phases.forEach(phase => {
      const phaseTasks = phaseTaskMap.get(phase.name) || [];
      let phaseStartDate = new Date(phase.plannedStartDate);
      
      phaseTasks.forEach((taskTemplate, index) => {
        const taskDuration = Math.ceil(taskTemplate.estimatedHours / 8); // 8 hours per day
        const endDate = new Date(phaseStartDate.getTime() + taskDuration * 24 * 60 * 60 * 1000);
        
        tasks.push({
          id: `task-${taskCounter++}`,
          name: taskTemplate.name,
          description: taskTemplate.description,
          category: taskTemplate.category,
          phase,
          startDate: new Date(phaseStartDate),
          endDate,
          duration: taskDuration,
          plannedDuration: taskDuration,
          dependencies: [],
          predecessors: [],
          successors: [],
          status: 'not_started',
          progress: 0,
          priority: this.getTaskPriority(taskTemplate),
          assignedTo: [],
          estimatedHours: taskTemplate.estimatedHours,
          actualHours: 0,
          cost: {
            budgeted: taskTemplate.estimatedHours * 75, // $75/hour
            actual: 0,
            currency: 'USD'
          },
          deliverables: taskTemplate.deliverables.map(name => ({
            id: `del-${Date.now()}-${Math.random()}`,
            name,
            description: `Deliverable: ${name}`,
            type: 'document',
            dueDate: endDate,
            status: 'draft',
            assignedTo: '',
            files: [],
            reviewers: [],
            approvalRequired: true,
            approved: false
          })),
          milestones: [],
          qualityChecks: [],
          risks: [],
          notes: '',
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'template-engine',
          lastUpdatedBy: 'template-engine'
        });
        
        phaseStartDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // Next day
      });
    });
    
    return tasks;
  }

  private static generateMilestones(tasks: ProjectTask[]) {
    // Generate milestones at key completion points
    const milestones = [];
    const phaseMilestones = new Map();
    
    tasks.forEach(task => {
      const phaseKey = task.phase.name;
      if (!phaseMilestones.has(phaseKey)) {
        phaseMilestones.set(phaseKey, []);
      }
      phaseMilestones.get(phaseKey).push(task);
    });
    
    phaseMilestones.forEach((phaseTasks, phaseName) => {
      const lastTask = phaseTasks[phaseTasks.length - 1];
      milestones.push({
        id: `milestone-${milestones.length + 1}`,
        name: `${phaseName} Complete`,
        description: `Completion of ${phaseName} phase`,
        targetDate: lastTask.endDate,
        status: 'upcoming',
        critical: true,
        dependencies: phaseTasks.map(t => t.id),
        criteria: ['All phase tasks completed', 'Quality checks passed', 'Deliverables approved']
      });
    });
    
    return milestones;
  }

  private static generateTemplateRisks(projectType: ProjectType) {
    const commonRisks = [
      {
        id: 'risk-001',
        title: 'Resource Availability',
        description: 'Key resources may not be available when needed',
        category: 'resource',
        probability: 'medium',
        impact: 'medium',
        riskScore: 4,
        status: 'open',
        owner: 'pm-001',
        mitigationPlan: 'Early resource planning and backup resource identification',
        contingencyPlan: 'Engage external contractors if needed',
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];
    
    return commonRisks;
  }

  private static calculateProjectEndDate(startDate: Date, duration: number): Date {
    return new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
  }

  private static getPhaseColor(index: number): string {
    const colors = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];
    return colors[index % colors.length];
  }

  private static getTaskPriority(task: TaskTemplate): TaskPriority {
    // Determine priority based on task characteristics
    if (task.category === 'approval' || task.name.includes('Critical')) {
      return 'critical';
    } else if (task.category === 'engineering' || task.category === 'procurement') {
      return 'high';
    } else if (task.category === 'construction') {
      return 'high';
    } else {
      return 'medium';
    }
  }

  /**
   * Get available project templates
   */
  static getAvailableTemplates(): ProjectTemplate[] {
    return Object.values(this.BASE_TEMPLATES);
  }

  /**
   * Get template by ID
   */
  static getTemplate(templateId: string): ProjectTemplate | null {
    return Object.values(this.BASE_TEMPLATES).find(t => t.id === templateId) || null;
  }
}

export { ProjectTemplateEngine };