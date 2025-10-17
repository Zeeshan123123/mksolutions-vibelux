/**
 * Proposal to Project Converter
 * Automatically converts approved cogeneration proposals into structured project management plans
 */

import type { CogenerationProposal } from '@/lib/proposals/cogeneration-proposal-generator';
import type {
  Project,
  ProjectTask,
  ProjectPhase,
  Milestone,
  Risk,
  ProjectMember,
  ClientInfo as ProjectClientInfo,
  ProjectLocation,
  ProjectBudget,
  Contract,
  TaskCategory,
  TaskStatus,
  TaskPriority,
  ProjectRole
} from '@/lib/project-management/project-types';

interface ProposalConversionOptions {
  autoAssignResources: boolean;
  includeContingency: boolean;
  generateDetailedTasks: boolean;
  createClientAccess: boolean;
  enableNotifications: boolean;
  projectStartDate?: Date;
}

interface ConversionResult {
  project: Project;
  warnings: string[];
  recommendations: string[];
  nextSteps: string[];
}

export class ProposalToProjectConverter {
  private proposal: CogenerationProposal;
  private options: ProposalConversionOptions;

  constructor(proposal: CogenerationProposal, options: Partial<ProposalConversionOptions> = {}) {
    this.proposal = proposal;
    this.options = {
      autoAssignResources: true,
      includeContingency: true,
      generateDetailedTasks: true,
      createClientAccess: false,
      enableNotifications: true,
      ...options
    };
  }

  /**
   * Convert proposal to project
   */
  async convertToProject(): Promise<ConversionResult> {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      // Extract key information from proposal
      const projectInfo = this.extractProjectInformation();
      const phases = this.generateProjectPhases();
      const tasks = await this.generateProjectTasks(phases);
      const milestones = this.generateProjectMilestones(tasks);
      const risks = this.generateProjectRisks();
      const budget = this.convertProposalBudget();
      const contracts = this.generateContracts();

      // Create project structure
      const project: Project = {
        id: `proj-${Date.now()}`,
        name: `${projectInfo.client.companyName} Cogeneration Project`,
        description: this.proposal.executiveSummary.projectOverview,
        type: 'cogeneration',
        
        // Client & Location
        client: this.convertClientInfo(projectInfo.client),
        location: this.generateProjectLocation(),
        
        // Timing
        plannedStartDate: this.options.projectStartDate || new Date(),
        plannedEndDate: this.calculateProjectEndDate(),
        
        // Status & Progress
        status: 'planning',
        overallProgress: 0,
        health: 'green',
        
        // Structure
        phases,
        tasks,
        milestones,
        
        // Team & Resources
        projectManager: 'pm-001', // Default PM
        team: this.generateDefaultTeam(),
        stakeholders: this.generateStakeholders(),
        
        // Budget & Contracts
        budget,
        contracts,
        
        // Quality & Risk
        qualityPlan: this.generateQualityPlan(),
        riskRegister: risks,
        
        // Design Integration
        designData: {
          facilityId: `facility-${Date.now()}`,
          designState: null,
          cogenerationComponents: this.proposal.systemDesign.selectedEquipment.map(eq => eq.component),
          drawings: this.proposal.technicalSpecifications.drawings ? Object.values(this.proposal.technicalSpecifications.drawings) : [],
          specifications: []
        },
        
        // Communication
        communications: [],
        meetingNotes: [],
        
        // Documentation
        documents: this.generateInitialDocuments(),
        
        // Tracking
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      };

      // Generate warnings and recommendations
      this.generateConversionInsights(project, warnings, recommendations, nextSteps);

      return {
        project,
        warnings,
        recommendations,
        nextSteps
      };

    } catch (error) {
      throw new Error(`Failed to convert proposal to project: ${error.message}`);
    }
  }

  private extractProjectInformation() {
    return {
      client: this.proposal.metadata.preparedFor,
      totalInvestment: this.proposal.executiveSummary.investmentSummary.totalInvestment,
      systemCapacity: {
        electrical: this.proposal.systemDesign.systemConfiguration.totalElectricalOutput,
        thermal: this.proposal.systemDesign.systemConfiguration.totalThermalOutput
      },
      timeline: this.proposal.installationPlan.projectSchedule
    };
  }

  private generateProjectPhases(): ProjectPhase[] {
    const startDate = this.options.projectStartDate || new Date();
    
    return [
      {
        id: 'phase-1',
        name: 'Engineering & Design',
        description: 'Complete detailed engineering design, drawings, and specifications',
        order: 1,
        color: '#3B82F6',
        plannedStartDate: startDate,
        plannedEndDate: new Date(startDate.getTime() + this.proposal.installationPlan.projectSchedule.engineering.duration * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: this.proposal.economicAnalysis.capitalCosts.engineering,
        actualCost: 0,
        approvals: [
          {
            id: 'approval-eng-001',
            title: 'Design Package Approval',
            description: 'Client approval of final design package',
            requiredBy: new Date(startDate.getTime() + (this.proposal.installationPlan.projectSchedule.engineering.duration - 2) * 24 * 60 * 60 * 1000),
            approver: this.proposal.metadata.preparedFor.contactPerson,
            status: 'pending',
            comments: '',
            conditions: []
          }
        ],
        taskIds: []
      },
      {
        id: 'phase-2',
        name: 'Procurement',
        description: 'Equipment and material procurement',
        order: 2,
        color: '#F59E0B',
        plannedStartDate: new Date(startDate.getTime() + this.proposal.installationPlan.projectSchedule.engineering.duration * 24 * 60 * 60 * 1000),
        plannedEndDate: new Date(startDate.getTime() + (this.proposal.installationPlan.projectSchedule.engineering.duration + this.proposal.installationPlan.projectSchedule.procurement.duration) * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: this.proposal.economicAnalysis.capitalCosts.equipment,
        actualCost: 0,
        approvals: [],
        taskIds: []
      },
      {
        id: 'phase-3',
        name: 'Installation',
        description: 'Equipment installation and system integration',
        order: 3,
        color: '#EF4444',
        plannedStartDate: new Date(startDate.getTime() + (this.proposal.installationPlan.projectSchedule.engineering.duration + this.proposal.installationPlan.projectSchedule.procurement.duration) * 24 * 60 * 60 * 1000),
        plannedEndDate: new Date(startDate.getTime() + (this.proposal.installationPlan.projectSchedule.engineering.duration + this.proposal.installationPlan.projectSchedule.procurement.duration + this.proposal.installationPlan.projectSchedule.installation.duration) * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: this.proposal.economicAnalysis.capitalCosts.installation + this.proposal.economicAnalysis.capitalCosts.electrical + this.proposal.economicAnalysis.capitalCosts.piping,
        actualCost: 0,
        approvals: [],
        taskIds: []
      },
      {
        id: 'phase-4',
        name: 'Commissioning',
        description: 'System testing, commissioning, and handover',
        order: 4,
        color: '#10B981',
        plannedStartDate: new Date(startDate.getTime() + (this.proposal.installationPlan.projectSchedule.engineering.duration + this.proposal.installationPlan.projectSchedule.procurement.duration + this.proposal.installationPlan.projectSchedule.installation.duration) * 24 * 60 * 60 * 1000),
        plannedEndDate: new Date(startDate.getTime() + (this.proposal.installationPlan.projectSchedule.engineering.duration + this.proposal.installationPlan.projectSchedule.procurement.duration + this.proposal.installationPlan.projectSchedule.installation.duration + this.proposal.installationPlan.projectSchedule.commissioning.duration) * 24 * 60 * 60 * 1000),
        status: 'planned',
        progress: 0,
        budget: this.proposal.economicAnalysis.capitalCosts.commissioning,
        actualCost: 0,
        approvals: [],
        taskIds: []
      }
    ];
  }

  private async generateProjectTasks(phases: ProjectPhase[]): Promise<ProjectTask[]> {
    const tasks: ProjectTask[] = [];
    let taskCounter = 1;

    // Engineering Phase Tasks
    const engineeringPhase = phases[0];
    tasks.push(
      this.createTask(`task-${taskCounter++}`, 'Site Survey and Energy Analysis', 'Conduct comprehensive site survey and detailed energy analysis', 'engineering', engineeringPhase, 5, [], ['task-2'], 'high'),
      this.createTask(`task-${taskCounter++}`, 'Equipment Selection and Sizing', 'Select and size cogeneration equipment based on analysis', 'engineering', engineeringPhase, 7, ['task-1'], ['task-3'], 'high'),
      this.createTask(`task-${taskCounter++}`, 'Detailed Design and Engineering', 'Create detailed engineering drawings and specifications', 'design', engineeringPhase, 10, ['task-2'], ['task-4'], 'high'),
      this.createTask(`task-${taskCounter++}`, 'Permit Applications', 'Submit and obtain all required permits', 'approval', engineeringPhase, 21, ['task-3'], ['task-5'], 'high')
    );

    // Procurement Phase Tasks
    const procurementPhase = phases[1];
    tasks.push(
      this.createTask(`task-${taskCounter++}`, 'Equipment Procurement', 'Order cogeneration units and major equipment', 'procurement', procurementPhase, 56, ['task-4'], ['task-6'], 'critical'),
      this.createTask(`task-${taskCounter++}`, 'Material Procurement', 'Order installation materials and components', 'procurement', procurementPhase, 28, ['task-4'], ['task-7'], 'high')
    );

    // Installation Phase Tasks
    const installationPhase = phases[2];
    tasks.push(
      this.createTask(`task-${taskCounter++}`, 'Site Preparation', 'Prepare site and install foundations', 'construction', installationPhase, 14, ['task-5', 'task-6'], ['task-8'], 'high'),
      this.createTask(`task-${taskCounter++}`, 'Equipment Installation', 'Install cogeneration units and auxiliary equipment', 'construction', installationPhase, 21, ['task-7'], ['task-9'], 'critical'),
      this.createTask(`task-${taskCounter++}`, 'Electrical Installation', 'Install electrical systems and connections', 'construction', installationPhase, 14, ['task-8'], ['task-10'], 'high'),
      this.createTask(`task-${taskCounter++}`, 'Piping and Controls Installation', 'Install piping systems and control equipment', 'construction', installationPhase, 14, ['task-8'], ['task-11'], 'high')
    );

    // Commissioning Phase Tasks
    const commissioningPhase = phases[3];
    tasks.push(
      this.createTask(`task-${taskCounter++}`, 'System Testing', 'Conduct comprehensive system testing', 'testing', commissioningPhase, 10, ['task-9', 'task-10'], ['task-12'], 'high'),
      this.createTask(`task-${taskCounter++}`, 'Performance Commissioning', 'Commission system and verify performance', 'commissioning', commissioningPhase, 7, ['task-11'], ['task-13'], 'high'),
      this.createTask(`task-${taskCounter++}`, 'Training and Documentation', 'Provide operator training and final documentation', 'training', commissioningPhase, 5, ['task-12'], [], 'medium')
    );

    return tasks;
  }

  private createTask(
    id: string,
    name: string,
    description: string,
    category: TaskCategory,
    phase: ProjectPhase,
    duration: number,
    predecessors: string[],
    successors: string[],
    priority: TaskPriority
  ): ProjectTask {
    const startDate = predecessors.length === 0 ? phase.plannedStartDate : new Date(phase.plannedStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Offset for dependencies
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    return {
      id,
      name,
      description,
      category,
      phase,
      startDate,
      endDate,
      duration,
      plannedDuration: duration,
      dependencies: predecessors.map(predId => ({
        predecessorId: predId,
        type: 'finish_to_start',
        lag: 0
      })),
      predecessors,
      successors,
      status: 'not_started',
      progress: 0,
      priority,
      assignedTo: this.options.autoAssignResources ? this.getDefaultAssignee(category) : [],
      estimatedHours: duration * 8, // 8 hours per day
      actualHours: 0,
      cost: {
        budgeted: duration * 8 * 75, // $75/hour average
        actual: 0,
        currency: 'USD'
      },
      deliverables: this.getTaskDeliverables(category, name),
      milestones: [],
      qualityChecks: [],
      risks: [],
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'system'
    };
  }

  private getDefaultAssignee(category: TaskCategory): ProjectMember[] {
    const defaultAssignments: Record<TaskCategory, ProjectMember[]> = {
      engineering: [{
        id: 'tm-002',
        name: 'Michael Rodriguez',
        email: 'michael.rodriguez@vibelux.ai',
        role: 'design_engineer',
        department: 'Engineering',
        hourlyRate: 85,
        availability: 100,
        skills: ['AutoCAD', 'Mechanical Design', 'Cogeneration Systems'],
        certifications: ['PE License'],
        contactInfo: {
          phone: '(555) 234-5678',
          email: 'michael.rodriguez@vibelux.ai',
          location: 'Austin, TX'
        }
      }],
      design: [{
        id: 'tm-002',
        name: 'Michael Rodriguez',
        email: 'michael.rodriguez@vibelux.ai',
        role: 'design_engineer',
        department: 'Engineering',
        hourlyRate: 85,
        availability: 100,
        skills: ['AutoCAD', 'Mechanical Design'],
        certifications: ['PE License'],
        contactInfo: {
          phone: '(555) 234-5678',
          email: 'michael.rodriguez@vibelux.ai',
          location: 'Austin, TX'
        }
      }],
      construction: [{
        id: 'tm-004',
        name: 'David Thompson',
        email: 'david.thompson@vibelux.ai',
        role: 'construction_manager',
        department: 'Construction',
        hourlyRate: 70,
        availability: 100,
        skills: ['Construction Management', 'Site Safety'],
        certifications: ['CCM', 'OSHA 30'],
        contactInfo: {
          phone: '(555) 456-7890',
          email: 'david.thompson@vibelux.ai',
          location: 'Phoenix, AZ'
        }
      }],
      procurement: [],
      commissioning: [],
      testing: [],
      documentation: [],
      approval: [],
      training: [],
      maintenance: []
    };

    return defaultAssignments[category] || [];
  }

  private getTaskDeliverables(category: TaskCategory, taskName: string) {
    const deliverableMap: Record<string, any[]> = {
      'Site Survey and Energy Analysis': [
        {
          id: 'del-001',
          name: 'Site Survey Report',
          description: 'Comprehensive site survey and energy analysis report',
          type: 'report',
          dueDate: new Date(),
          status: 'draft',
          assignedTo: 'tm-002',
          files: [],
          reviewers: ['tm-001'],
          approvalRequired: true,
          approved: false
        }
      ],
      'Equipment Selection and Sizing': [
        {
          id: 'del-002',
          name: 'Equipment Selection Report',
          description: 'Equipment sizing calculations and selection rationale',
          type: 'calculation',
          dueDate: new Date(),
          status: 'draft',
          assignedTo: 'tm-002',
          files: [],
          reviewers: ['tm-001'],
          approvalRequired: true,
          approved: false
        }
      ]
    };

    return deliverableMap[taskName] || [];
  }

  private generateProjectMilestones(tasks: ProjectTask[]): Milestone[] {
    return [
      {
        id: 'milestone-1',
        name: 'Design Package Complete',
        description: 'All engineering designs and specifications completed',
        targetDate: new Date(tasks[2].endDate),
        status: 'upcoming',
        critical: true,
        dependencies: ['task-3'],
        criteria: [
          'All drawings approved',
          'Specifications finalized',
          'Permit applications submitted'
        ]
      },
      {
        id: 'milestone-2',
        name: 'Equipment Delivery',
        description: 'All major equipment delivered to site',
        targetDate: new Date(tasks[4].endDate),
        status: 'upcoming',
        critical: true,
        dependencies: ['task-5'],
        criteria: [
          'Cogeneration units delivered',
          'All equipment inspected',
          'Site ready for installation'
        ]
      },
      {
        id: 'milestone-3',
        name: 'Installation Complete',
        description: 'All equipment installed and connected',
        targetDate: new Date(tasks[9].endDate),
        status: 'upcoming',
        critical: true,
        dependencies: ['task-8', 'task-9', 'task-10'],
        criteria: [
          'All equipment installed',
          'Electrical connections complete',
          'Piping systems complete'
        ]
      },
      {
        id: 'milestone-4',
        name: 'System Commissioned',
        description: 'System fully commissioned and operational',
        targetDate: new Date(tasks[11].endDate),
        status: 'upcoming',
        critical: true,
        dependencies: ['task-12'],
        criteria: [
          'Performance testing complete',
          'System operational',
          'Training provided'
        ]
      }
    ];
  }

  private generateProjectRisks(): Risk[] {
    return [
      {
        id: 'risk-001',
        title: 'Equipment Delivery Delays',
        description: 'Potential delays in cogeneration unit delivery due to supply chain issues',
        category: 'schedule',
        probability: 'medium',
        impact: 'high',
        riskScore: 6,
        status: 'open',
        owner: 'tm-001',
        mitigationPlan: 'Maintain regular communication with supplier, identify backup suppliers',
        contingencyPlan: 'Source alternative equipment if delays exceed 4 weeks',
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'risk-002',
        title: 'Permit Approval Delays',
        description: 'Local authority permit approval may take longer than expected',
        category: 'schedule',
        probability: 'medium',
        impact: 'medium',
        riskScore: 4,
        status: 'open',
        owner: 'tm-002',
        mitigationPlan: 'Submit permits early, maintain regular contact with authorities',
        contingencyPlan: 'Escalate through regulatory contacts if delays occur',
        reviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'risk-003',
        title: 'Site Access Constraints',
        description: 'Limited site access may impact installation schedule',
        category: 'technical',
        probability: 'low',
        impact: 'medium',
        riskScore: 2,
        status: 'open',
        owner: 'tm-004',
        mitigationPlan: 'Conduct detailed site survey, plan equipment routes',
        contingencyPlan: 'Arrange alternative access routes or staging areas',
        reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private convertProposalBudget(): ProjectBudget {
    const totalBudget = this.proposal.economicAnalysis.capitalCosts.total;
    
    return {
      totalBudget,
      spent: 0,
      committed: 0,
      remaining: totalBudget,
      contingency: this.proposal.economicAnalysis.capitalCosts.contingency,
      currency: 'USD',
      breakdown: [
        {
          category: 'Equipment',
          budgeted: this.proposal.economicAnalysis.capitalCosts.equipment,
          actual: 0,
          variance: 0,
          variancePercent: 0
        },
        {
          category: 'Installation',
          budgeted: this.proposal.economicAnalysis.capitalCosts.installation,
          actual: 0,
          variance: 0,
          variancePercent: 0
        },
        {
          category: 'Engineering',
          budgeted: this.proposal.economicAnalysis.capitalCosts.engineering,
          actual: 0,
          variance: 0,
          variancePercent: 0
        }
      ],
      changes: []
    };
  }

  private convertClientInfo(proposalClient: any): ProjectClientInfo {
    return {
      id: `client-${Date.now()}`,
      companyName: proposalClient.companyName,
      contactPerson: proposalClient.contactPerson,
      title: 'Project Manager', // Default title
      email: proposalClient.email,
      phone: proposalClient.phone,
      address: proposalClient.address,
      industry: 'Manufacturing', // Default industry
      facilityType: proposalClient.facilityType
    };
  }

  private generateProjectLocation(): ProjectLocation {
    return {
      name: this.proposal.metadata.preparedFor.companyName + ' Facility',
      address: this.proposal.metadata.preparedFor.address,
      coordinates: {
        latitude: 40.7128, // Default NYC coordinates
        longitude: -74.0060
      },
      timezone: 'America/New_York',
      climate: 'Temperate',
      utilities: {
        electrical: 'Local Utility Company',
        gas: 'Natural Gas Provider',
        water: 'Municipal Water',
        internet: 'High-speed available'
      }
    };
  }

  private calculateProjectEndDate(): Date {
    const startDate = this.options.projectStartDate || new Date();
    const totalDuration = this.proposal.installationPlan.projectSchedule.total_duration * 7; // Convert weeks to days
    return new Date(startDate.getTime() + totalDuration * 24 * 60 * 60 * 1000);
  }

  private generateDefaultTeam(): ProjectMember[] {
    return [
      {
        id: 'tm-001',
        name: 'Sarah Chen',
        email: 'sarah.chen@vibelux.ai',
        role: 'project_manager',
        department: 'Engineering',
        hourlyRate: 75,
        availability: 95,
        skills: ['Project Management', 'PMP Certified'],
        certifications: ['PMP', 'PRINCE2'],
        contactInfo: {
          phone: '(555) 123-4567',
          email: 'sarah.chen@vibelux.ai',
          location: 'San Francisco, CA'
        }
      }
    ];
  }

  private generateStakeholders() {
    return [
      {
        id: 'stakeholder-001',
        name: this.proposal.metadata.preparedFor.contactPerson,
        organization: this.proposal.metadata.preparedFor.companyName,
        role: 'Client Representative',
        influence: 'high' as const,
        interest: 'high' as const,
        contactInfo: {
          email: this.proposal.metadata.preparedFor.email,
          phone: this.proposal.metadata.preparedFor.phone || ''
        },
        communicationFrequency: 'weekly' as const
      }
    ];
  }

  private generateContracts(): Contract[] {
    return [
      {
        id: 'contract-001',
        title: 'Cogeneration System Installation Contract',
        contractor: 'VibeLux',
        type: 'design_build',
        value: this.proposal.economicAnalysis.capitalCosts.total,
        startDate: this.options.projectStartDate || new Date(),
        endDate: this.calculateProjectEndDate(),
        status: 'draft',
        terms: 'Standard design-build contract terms',
        deliverables: [
          'Complete cogeneration system',
          'Installation and commissioning',
          'Training and documentation',
          'Performance guarantee'
        ]
      }
    ];
  }

  private generateQualityPlan() {
    return {
      standards: ['ISO 9001:2015', 'ASME B31.1', 'NECA Standards'],
      procedures: [
        {
          id: 'qp-001',
          name: 'Design Review Process',
          description: 'Systematic review of engineering designs',
          steps: ['Initial review', 'Technical review', 'Client review', 'Final approval'],
          frequency: 'Per deliverable',
          responsible: 'Design Manager'
        }
      ],
      inspectionSchedule: [],
      metrics: [
        {
          id: 'qm-001',
          name: 'Design Quality Score',
          target: 4.5,
          actual: 0,
          unit: '/5',
          trend: 'stable'
        }
      ]
    };
  }

  private generateInitialDocuments() {
    return [
      {
        id: 'doc-001',
        title: 'Project Charter',
        type: 'contract',
        version: '1.0',
        file: {
          id: 'file-001',
          filename: 'project-charter.pdf',
          originalName: 'Project Charter.pdf',
          mimeType: 'application/pdf',
          size: 1024000,
          url: '/documents/project-charter.pdf',
          uploadedBy: 'system',
          uploadedAt: new Date(),
          version: 1
        },
        category: 'Project Management',
        status: 'draft',
        reviewers: [],
        approvers: []
      }
    ];
  }

  private generateConversionInsights(
    project: Project,
    warnings: string[],
    recommendations: string[],
    nextSteps: string[]
  ) {
    // Warnings
    if (project.budget.totalBudget > 1000000) {
      warnings.push('Large budget project - consider additional oversight and risk management');
    }
    
    if (project.tasks.length > 20) {
      warnings.push('Complex project with many tasks - ensure adequate resource allocation');
    }

    // Recommendations
    recommendations.push('Review and adjust task assignments based on team availability');
    recommendations.push('Schedule regular stakeholder communications');
    recommendations.push('Implement risk monitoring and mitigation procedures');
    
    if (this.options.createClientAccess) {
      recommendations.push('Set up client portal access for project transparency');
    }

    // Next Steps
    nextSteps.push('Review and approve project plan');
    nextSteps.push('Assign project team members');
    nextSteps.push('Schedule project kickoff meeting');
    nextSteps.push('Begin detailed engineering phase');
    
    if (this.options.enableNotifications) {
      nextSteps.push('Configure project notifications and alerts');
    }
  }
}

/**
 * Utility function to convert proposal to project
 */
export async function convertProposalToProject(
  proposal: CogenerationProposal,
  options?: Partial<ProposalConversionOptions>
): Promise<ConversionResult> {
  const converter = new ProposalToProjectConverter(proposal, options);
  return await converter.convertToProject();
}