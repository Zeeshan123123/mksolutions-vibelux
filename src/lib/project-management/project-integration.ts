/**
 * Project Management Integration
 * Connects VibeLux CAD system with project management platforms
 */

import { EventEmitter } from 'events';
import { GreenhouseModel } from '../cad/greenhouse-cad-system';
import { BOMItem } from '../cad/bom-generator';
import { PurchaseOrder } from '../suppliers/supplier-integration';
import { ProcurementProject } from '../suppliers/procurement-workflow';

export interface ProjectPlatform {
  id: string;
  name: string;
  type: 'jira' | 'asana' | 'monday' | 'clickup' | 'notion' | 'linear' | 'azure_devops' | 'github_projects';
  apiEndpoint: string;
  apiKey: string;
  organizationId: string;
  workspaceId?: string;
  defaultProjectId?: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: {
    tasks: boolean;
    milestones: boolean;
    resources: boolean;
    timeTracking: boolean;
    customFields: boolean;
    attachments: boolean;
    comments: boolean;
    webhooks: boolean;
  };
  configuration: {
    taskPrefix: string;
    autoAssign: boolean;
    statusMapping: Record<string, string>;
    priorityMapping: Record<string, string>;
    labelMapping: Record<string, string>;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  lastSync: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTask {
  id: string;
  externalId?: string;
  platformId: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'design' | 'procurement' | 'construction' | 'quality' | 'documentation' | 'review' | 'maintenance';
  category: 'cad' | 'bom' | 'procurement' | 'structural' | 'mechanical' | 'electrical' | 'quality' | 'delivery';
  assignee?: string;
  reporter: string;
  estimatedHours: number;
  actualHours: number;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  dependencies: string[];
  relatedItems: {
    modelId?: string;
    bomId?: string;
    procurementId?: string;
    orderId?: string;
    drawingId?: string;
  };
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
  }>;
  labels: string[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: string;
  externalId?: string;
  platformId: string;
  projectId: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  type: 'design' | 'procurement' | 'construction' | 'delivery' | 'quality' | 'approval';
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  progress: number; // 0-100
  tasks: string[];
  deliverables: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    dueDate: Date;
    completedDate?: Date;
  }>;
  stakeholders: Array<{
    userId: string;
    role: 'owner' | 'contributor' | 'reviewer' | 'approver';
    notifications: boolean;
  }>;
  dependencies: string[];
  risks: Array<{
    id: string;
    description: string;
    probability: number;
    impact: number;
    mitigation: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectResource {
  id: string;
  externalId?: string;
  platformId: string;
  projectId: string;
  name: string;
  type: 'human' | 'equipment' | 'material' | 'space' | 'budget';
  category: string;
  availability: {
    totalCapacity: number;
    allocatedCapacity: number;
    availableCapacity: number;
    unit: string;
  };
  cost: {
    hourlyRate?: number;
    dailyRate?: number;
    unitCost?: number;
    currency: string;
  };
  skills: string[];
  location: string;
  calendar: Array<{
    startDate: Date;
    endDate: Date;
    taskId?: string;
    notes?: string;
  }>;
  performance: {
    utilizationRate: number;
    efficiency: number;
    qualityScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  phases: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    milestones: string[];
    tasks: string[];
    dependencies: string[];
    criticalPath: boolean;
  }>;
  dependencies: Array<{
    predecessorId: string;
    successorId: string;
    type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    lag: number; // days
  }>;
  criticalPath: string[];
  totalFloat: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectReport {
  id: string;
  projectId: string;
  type: 'status' | 'progress' | 'budget' | 'resource' | 'quality' | 'risk';
  period: { start: Date; end: Date };
  metrics: {
    tasksCompleted: number;
    tasksInProgress: number;
    tasksOverdue: number;
    milestonesCompleted: number;
    milestonesDelayed: number;
    budgetUtilization: number;
    resourceUtilization: number;
    qualityScore: number;
    riskScore: number;
  };
  insights: Array<{
    type: 'trend' | 'issue' | 'opportunity' | 'recommendation';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    action: string;
  }>;
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
  }>;
  recipients: string[];
  generatedAt: Date;
  scheduledFor?: Date;
}

export interface ProjectIntegrationConfig {
  platforms: ProjectPlatform[];
  synchronization: {
    enabled: boolean;
    interval: number; // minutes
    autoSync: boolean;
    conflictResolution: 'local' | 'remote' | 'manual';
  };
  taskAutomation: {
    createFromBOM: boolean;
    createFromProcurement: boolean;
    createFromDrawings: boolean;
    autoAssign: boolean;
    autoEstimate: boolean;
  };
  notifications: {
    enabled: boolean;
    channels: Array<{
      type: 'email' | 'slack' | 'teams' | 'webhook';
      endpoint: string;
      events: string[];
    }>;
  };
  reporting: {
    automated: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    templates: string[];
  };
}

class ProjectManagementIntegration extends EventEmitter {
  private platforms: Map<string, ProjectPlatform> = new Map();
  private tasks: Map<string, ProjectTask> = new Map();
  private milestones: Map<string, ProjectMilestone> = new Map();
  private resources: Map<string, ProjectResource> = new Map();
  private timelines: Map<string, ProjectTimeline> = new Map();
  private reports: Map<string, ProjectReport> = new Map();
  private config: ProjectIntegrationConfig;
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized: boolean = false;

  constructor(config: ProjectIntegrationConfig) {
    super();
    this.config = config;
    this.initializePlatforms();
  }

  /**
   * Initialize project management integration
   */
  async initialize(): Promise<void> {
    try {
      // Initialize all configured platforms
      await this.initializePlatformConnections();
      
      // Start synchronization if enabled
      if (this.config.synchronization.enabled) {
        this.startSynchronization();
      }
      
      // Setup task automation
      if (this.config.taskAutomation.createFromBOM) {
        this.setupBOMTaskAutomation();
      }
      
      if (this.config.taskAutomation.createFromProcurement) {
        this.setupProcurementTaskAutomation();
      }
      
      this.isInitialized = true;
      this.emit('initialized');
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Initialize platform connections
   */
  private async initializePlatformConnections(): Promise<void> {
    const connectionPromises = this.config.platforms.map(async (platform) => {
      try {
        const connected = await this.testPlatformConnection(platform);
        if (connected) {
          platform.status = 'active';
          platform.lastSync = new Date();
          this.platforms.set(platform.id, platform);
          this.emit('platform-connected', platform.id);
        } else {
          platform.status = 'error';
          this.emit('platform-connection-failed', platform.id);
        }
      } catch (error) {
        platform.status = 'error';
        this.emit('platform-connection-failed', { platformId: platform.id, error });
      }
    });

    await Promise.all(connectionPromises);
  }

  /**
   * Test platform connection
   */
  private async testPlatformConnection(platform: ProjectPlatform): Promise<boolean> {
    try {
      // Simulate API connection test based on platform type
      switch (platform.type) {
        case 'jira':
          return await this.testJiraConnection(platform);
        case 'asana':
          return await this.testAsanaConnection(platform);
        case 'monday':
          return await this.testMondayConnection(platform);
        case 'clickup':
          return await this.testClickupConnection(platform);
        case 'notion':
          return await this.testNotionConnection(platform);
        case 'linear':
          return await this.testLinearConnection(platform);
        case 'azure_devops':
          return await this.testAzureDevOpsConnection(platform);
        case 'github_projects':
          return await this.testGitHubProjectsConnection(platform);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Create tasks from BOM items
   */
  async createTasksFromBOM(
    bomItems: BOMItem[],
    projectId: string,
    platformId: string
  ): Promise<ProjectTask[]> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }

    const tasks: ProjectTask[] = [];

    // Group BOM items by category
    const itemsByCategory = this.groupItemsByCategory(bomItems);

    for (const [category, items] of itemsByCategory.entries()) {
      // Create procurement task for each category
      const procurementTask = await this.createProcurementTask(
        category,
        items,
        projectId,
        platformId
      );
      tasks.push(procurementTask);

      // Create quality control task
      const qualityTask = await this.createQualityControlTask(
        category,
        items,
        projectId,
        platformId
      );
      tasks.push(qualityTask);

      // Create installation task
      const installationTask = await this.createInstallationTask(
        category,
        items,
        projectId,
        platformId
      );
      tasks.push(installationTask);
    }

    // Create overall project coordination tasks
    const coordinationTasks = await this.createCoordinationTasks(
      bomItems,
      projectId,
      platformId
    );
    tasks.push(...coordinationTasks);

    this.emit('tasks-created-from-bom', {
      projectId,
      platformId,
      taskCount: tasks.length,
      categories: Array.from(itemsByCategory.keys())
    });

    return tasks;
  }

  /**
   * Create tasks from procurement project
   */
  async createTasksFromProcurement(
    procurementProject: ProcurementProject,
    projectId: string,
    platformId: string
  ): Promise<ProjectTask[]> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }

    const tasks: ProjectTask[] = [];

    // Create procurement workflow tasks
    const workflowTasks = [
      {
        title: 'Supplier Sourcing',
        description: `Identify and evaluate suppliers for ${procurementProject.name}`,
        type: 'procurement' as const,
        category: 'procurement' as const,
        estimatedHours: 8,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      },
      {
        title: 'Quote Collection',
        description: `Collect and analyze quotes for ${procurementProject.name}`,
        type: 'procurement' as const,
        category: 'procurement' as const,
        estimatedHours: 12,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
      },
      {
        title: 'Purchase Order Creation',
        description: `Create and submit purchase orders for ${procurementProject.name}`,
        type: 'procurement' as const,
        category: 'procurement' as const,
        estimatedHours: 4,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      {
        title: 'Delivery Coordination',
        description: `Coordinate delivery and receipt of materials for ${procurementProject.name}`,
        type: 'procurement' as const,
        category: 'delivery' as const,
        estimatedHours: 6,
        dueDate: procurementProject.timeline.requiredDate
      }
    ];

    for (const taskData of workflowTasks) {
      const task = await this.createTask({
        ...taskData,
        projectId,
        platformId,
        status: 'todo',
        priority: procurementProject.priority,
        reporter: procurementProject.createdBy,
        relatedItems: {
          procurementId: procurementProject.id
        }
      });
      tasks.push(task);
    }

    // Create approval tasks if needed
    if (procurementProject.budget.estimated > 25000) {
      const approvalTask = await this.createTask({
        title: 'Procurement Approval',
        description: `Obtain approval for ${procurementProject.name} procurement`,
        type: 'review',
        category: 'procurement',
        status: 'todo',
        priority: 'high',
        projectId,
        platformId,
        reporter: procurementProject.createdBy,
        estimatedHours: 2,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        relatedItems: {
          procurementId: procurementProject.id
        }
      });
      tasks.push(approvalTask);
    }

    this.emit('tasks-created-from-procurement', {
      projectId,
      platformId,
      procurementId: procurementProject.id,
      taskCount: tasks.length
    });

    return tasks;
  }

  /**
   * Create task
   */
  async createTask(taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt' | 'dependencies' | 'attachments' | 'comments' | 'labels' | 'customFields' | 'actualHours' | 'startDate'>): Promise<ProjectTask> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: ProjectTask = {
      id: taskId,
      ...taskData,
      actualHours: 0,
      startDate: new Date(),
      dependencies: [],
      attachments: [],
      comments: [],
      labels: [],
      customFields: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create task in external platform
    const platform = this.platforms.get(taskData.platformId);
    if (platform) {
      try {
        const externalTask = await this.createTaskInPlatform(task, platform);
        task.externalId = externalTask.id;
      } catch (error) {
        this.emit('task-creation-failed', { taskId, platformId: taskData.platformId, error });
      }
    }

    this.tasks.set(taskId, task);
    this.emit('task-created', task);
    
    return task;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const updatedTask = { ...task, ...updates, updatedAt: new Date() };
    
    // Update task in external platform
    const platform = this.platforms.get(task.platformId);
    if (platform && task.externalId) {
      try {
        await this.updateTaskInPlatform(updatedTask, platform);
      } catch (error) {
        this.emit('task-update-failed', { taskId, platformId: task.platformId, error });
      }
    }

    this.tasks.set(taskId, updatedTask);
    this.emit('task-updated', updatedTask);
    
    return updatedTask;
  }

  /**
   * Create milestone
   */
  async createMilestone(milestoneData: Omit<ProjectMilestone, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'tasks' | 'deliverables' | 'stakeholders' | 'dependencies' | 'risks'>): Promise<ProjectMilestone> {
    const milestoneId = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const milestone: ProjectMilestone = {
      id: milestoneId,
      ...milestoneData,
      progress: 0,
      tasks: [],
      deliverables: [],
      stakeholders: [],
      dependencies: [],
      risks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create milestone in external platform
    const platform = this.platforms.get(milestoneData.platformId);
    if (platform) {
      try {
        const externalMilestone = await this.createMilestoneInPlatform(milestone, platform);
        milestone.externalId = externalMilestone.id;
      } catch (error) {
        this.emit('milestone-creation-failed', { milestoneId, platformId: milestoneData.platformId, error });
      }
    }

    this.milestones.set(milestoneId, milestone);
    this.emit('milestone-created', milestone);
    
    return milestone;
  }

  /**
   * Generate project timeline
   */
  async generateProjectTimeline(
    projectId: string,
    greenhouseModel: GreenhouseModel,
    bomItems: BOMItem[],
    procurementProject: ProcurementProject
  ): Promise<ProjectTimeline> {
    const timelineId = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate project phases based on complexity
    const complexity = this.calculateProjectComplexity(greenhouseModel, bomItems);
    const phases = this.generateProjectPhases(complexity, procurementProject);
    
    // Calculate dependencies
    const dependencies = this.calculatePhaseDependencies(phases);
    
    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(phases, dependencies);
    
    const timeline: ProjectTimeline = {
      id: timelineId,
      projectId,
      name: `${greenhouseModel.name} Project Timeline`,
      startDate: new Date(),
      endDate: procurementProject.timeline.requiredDate,
      phases,
      dependencies,
      criticalPath,
      totalFloat: this.calculateTotalFloat(phases, dependencies),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.timelines.set(timelineId, timeline);
    this.emit('timeline-generated', timeline);
    
    return timeline;
  }

  /**
   * Generate project report
   */
  async generateProjectReport(
    projectId: string,
    type: ProjectReport['type'],
    period: { start: Date; end: Date }
  ): Promise<ProjectReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get project data
    const projectTasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
    const projectMilestones = Array.from(this.milestones.values()).filter(m => m.projectId === projectId);
    const projectResources = Array.from(this.resources.values()).filter(r => r.projectId === projectId);
    
    // Calculate metrics
    const metrics = this.calculateProjectMetrics(projectTasks, projectMilestones, projectResources, period);
    
    // Generate insights
    const insights = this.generateProjectInsights(metrics, projectTasks, projectMilestones);
    
    const report: ProjectReport = {
      id: reportId,
      projectId,
      type,
      period,
      metrics,
      insights,
      attachments: [],
      recipients: this.config.reporting.recipients,
      generatedAt: new Date()
    };

    this.reports.set(reportId, report);
    this.emit('report-generated', report);
    
    return report;
  }

  /**
   * Sync with external platforms
   */
  async syncWithPlatforms(): Promise<void> {
    const activePlatforms = Array.from(this.platforms.values()).filter(p => p.status === 'active');
    
    for (const platform of activePlatforms) {
      try {
        await this.syncPlatformData(platform);
        platform.lastSync = new Date();
        this.platforms.set(platform.id, platform);
        this.emit('platform-synced', platform.id);
      } catch (error) {
        this.emit('platform-sync-failed', { platformId: platform.id, error });
      }
    }
  }

  /**
   * Get project dashboard data
   */
  getProjectDashboard(projectId: string): {
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
      overdue: number;
      byCategory: Record<string, number>;
    };
    milestones: {
      total: number;
      completed: number;
      delayed: number;
      upcoming: number;
    };
    resources: {
      total: number;
      utilized: number;
      available: number;
      overallocated: number;
    };
    timeline: {
      progress: number;
      daysRemaining: number;
      criticalPathStatus: string;
    };
  } {
    const projectTasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
    const projectMilestones = Array.from(this.milestones.values()).filter(m => m.projectId === projectId);
    const projectResources = Array.from(this.resources.values()).filter(r => r.projectId === projectId);
    const projectTimeline = Array.from(this.timelines.values()).find(t => t.projectId === projectId);
    
    return {
      tasks: {
        total: projectTasks.length,
        completed: projectTasks.filter(t => t.status === 'done').length,
        inProgress: projectTasks.filter(t => t.status === 'in_progress').length,
        overdue: projectTasks.filter(t => t.dueDate < new Date() && t.status !== 'done').length,
        byCategory: this.groupTasksByCategory(projectTasks)
      },
      milestones: {
        total: projectMilestones.length,
        completed: projectMilestones.filter(m => m.status === 'completed').length,
        delayed: projectMilestones.filter(m => m.status === 'delayed').length,
        upcoming: projectMilestones.filter(m => m.dueDate > new Date() && m.status !== 'completed').length
      },
      resources: {
        total: projectResources.length,
        utilized: projectResources.filter(r => r.availability.allocatedCapacity > 0).length,
        available: projectResources.filter(r => r.availability.availableCapacity > 0).length,
        overallocated: projectResources.filter(r => r.availability.allocatedCapacity > r.availability.totalCapacity).length
      },
      timeline: {
        progress: projectTimeline ? this.calculateTimelineProgress(projectTimeline) : 0,
        daysRemaining: projectTimeline ? this.calculateDaysRemaining(projectTimeline) : 0,
        criticalPathStatus: projectTimeline ? this.getCriticalPathStatus(projectTimeline) : 'unknown'
      }
    };
  }

  // Helper methods

  private initializePlatforms(): void {
    this.config.platforms.forEach(platform => {
      this.platforms.set(platform.id, platform);
    });
  }

  private startSynchronization(): void {
    const interval = this.config.synchronization.interval * 60 * 1000; // Convert to milliseconds
    
    const syncInterval = setInterval(() => {
      if (this.config.synchronization.autoSync) {
        this.syncWithPlatforms();
      }
    }, interval);

    this.syncIntervals.set('main', syncInterval);
  }

  private setupBOMTaskAutomation(): void {
    // Listen for BOM events and automatically create tasks
    this.on('bom-generated', (event) => {
      if (this.config.taskAutomation.createFromBOM) {
        this.createTasksFromBOM(event.bomItems, event.projectId, event.platformId);
      }
    });
  }

  private setupProcurementTaskAutomation(): void {
    // Listen for procurement events and automatically create tasks
    this.on('procurement-project-created', (event) => {
      if (this.config.taskAutomation.createFromProcurement) {
        this.createTasksFromProcurement(event.procurementProject, event.projectId, event.platformId);
      }
    });
  }

  private groupItemsByCategory(items: BOMItem[]): Map<string, BOMItem[]> {
    const grouped = new Map<string, BOMItem[]>();
    
    items.forEach(item => {
      const category = item.category || 'general';
      const categoryItems = grouped.get(category) || [];
      categoryItems.push(item);
      grouped.set(category, categoryItems);
    });
    
    return grouped;
  }

  private async createProcurementTask(
    category: string,
    items: BOMItem[],
    projectId: string,
    platformId: string
  ): Promise<ProjectTask> {
    return await this.createTask({
      title: `Procure ${category} Materials`,
      description: `Procurement of ${items.length} ${category} items including: ${items.slice(0, 3).map(i => i.description).join(', ')}`,
      type: 'procurement',
      category: 'procurement',
      status: 'todo',
      priority: 'medium',
      projectId,
      platformId,
      reporter: 'system',
      estimatedHours: Math.max(8, items.length * 2),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      relatedItems: {
        bomId: items[0]?.id
      }
    });
  }

  private async createQualityControlTask(
    category: string,
    items: BOMItem[],
    projectId: string,
    platformId: string
  ): Promise<ProjectTask> {
    return await this.createTask({
      title: `Quality Control - ${category}`,
      description: `Quality inspection and verification of ${category} materials`,
      type: 'quality',
      category: 'quality',
      status: 'todo',
      priority: 'high',
      projectId,
      platformId,
      reporter: 'system',
      estimatedHours: Math.max(4, items.length),
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
      relatedItems: {
        bomId: items[0]?.id
      }
    });
  }

  private async createInstallationTask(
    category: string,
    items: BOMItem[],
    projectId: string,
    platformId: string
  ): Promise<ProjectTask> {
    return await this.createTask({
      title: `Install ${category} Components`,
      description: `Installation and assembly of ${category} components`,
      type: 'construction',
      category: 'construction',
      status: 'todo',
      priority: 'medium',
      projectId,
      platformId,
      reporter: 'system',
      estimatedHours: Math.max(12, items.length * 3),
      dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
      relatedItems: {
        bomId: items[0]?.id
      }
    });
  }

  private async createCoordinationTasks(
    bomItems: BOMItem[],
    projectId: string,
    platformId: string
  ): Promise<ProjectTask[]> {
    const tasks: ProjectTask[] = [];

    // Project kickoff task
    tasks.push(await this.createTask({
      title: 'Project Kickoff',
      description: 'Initial project setup and team coordination',
      type: 'design',
      category: 'cad',
      status: 'todo',
      priority: 'high',
      projectId,
      platformId,
      reporter: 'system',
      estimatedHours: 4,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      relatedItems: {}
    }));

    // Final inspection task
    tasks.push(await this.createTask({
      title: 'Final Inspection',
      description: 'Final quality inspection and project sign-off',
      type: 'quality',
      category: 'quality',
      status: 'todo',
      priority: 'high',
      projectId,
      platformId,
      reporter: 'system',
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 5 weeks
      relatedItems: {}
    }));

    return tasks;
  }

  private calculateProjectComplexity(model: GreenhouseModel, bomItems: BOMItem[]): number {
    let complexity = 0;
    
    // Base complexity from model dimensions
    const area = model.dimensions.length * model.dimensions.width;
    complexity += Math.log10(area) * 10;
    
    // Add complexity based on BOM item count
    complexity += bomItems.length * 0.1;
    
    // Add complexity based on unique categories
    const categories = new Set(bomItems.map(item => item.category));
    complexity += categories.size * 2;
    
    return Math.min(100, Math.max(1, complexity));
  }

  private generateProjectPhases(complexity: number, procurementProject: ProcurementProject): ProjectTimeline['phases'] {
    const totalDays = Math.ceil((procurementProject.timeline.requiredDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const basePhases = [
      { name: 'Design & Planning', percentage: 15 },
      { name: 'Procurement', percentage: 30 },
      { name: 'Site Preparation', percentage: 10 },
      { name: 'Construction', percentage: 35 },
      { name: 'Testing & Commissioning', percentage: 10 }
    ];

    const phases: ProjectTimeline['phases'] = basePhases.map((phase, index) => {
      const duration = Math.ceil(totalDays * (phase.percentage / 100));
      const startDate = new Date(Date.now() + (index * duration * 24 * 60 * 60 * 1000));
      const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

      return {
        id: `phase_${index + 1}`,
        name: phase.name,
        startDate,
        endDate,
        progress: 0,
        milestones: [],
        tasks: [],
        dependencies: index > 0 ? [`phase_${index}`] : [],
        criticalPath: true
      };
    });

    return phases;
  }

  private calculatePhaseDependencies(phases: ProjectTimeline['phases']): ProjectTimeline['dependencies'] {
    const dependencies: ProjectTimeline['dependencies'] = [];
    
    for (let i = 1; i < phases.length; i++) {
      dependencies.push({
        predecessorId: phases[i - 1].id,
        successorId: phases[i].id,
        type: 'finish_to_start',
        lag: 0
      });
    }
    
    return dependencies;
  }

  private calculateCriticalPath(phases: ProjectTimeline['phases'], dependencies: ProjectTimeline['dependencies']): string[] {
    // Simplified critical path calculation
    return phases.filter(phase => phase.criticalPath).map(phase => phase.id);
  }

  private calculateTotalFloat(phases: ProjectTimeline['phases'], dependencies: ProjectTimeline['dependencies']): number {
    // Simplified float calculation
    return 0; // Assuming no float for critical path
  }

  private calculateProjectMetrics(
    tasks: ProjectTask[],
    milestones: ProjectMilestone[],
    resources: ProjectResource[],
    period: { start: Date; end: Date }
  ): ProjectReport['metrics'] {
    const periodTasks = tasks.filter(t => 
      t.createdAt >= period.start && t.createdAt <= period.end
    );

    return {
      tasksCompleted: periodTasks.filter(t => t.status === 'done').length,
      tasksInProgress: periodTasks.filter(t => t.status === 'in_progress').length,
      tasksOverdue: periodTasks.filter(t => t.dueDate < new Date() && t.status !== 'done').length,
      milestonesCompleted: milestones.filter(m => m.status === 'completed').length,
      milestonesDelayed: milestones.filter(m => m.status === 'delayed').length,
      budgetUtilization: 85, // Placeholder
      resourceUtilization: resources.reduce((sum, r) => sum + r.performance.utilizationRate, 0) / Math.max(1, resources.length),
      qualityScore: 92, // Placeholder
      riskScore: 15 // Placeholder
    };
  }

  private generateProjectInsights(
    metrics: ProjectReport['metrics'],
    tasks: ProjectTask[],
    milestones: ProjectMilestone[]
  ): ProjectReport['insights'] {
    const insights: ProjectReport['insights'] = [];

    // Task completion insights
    if (metrics.tasksCompleted > 0) {
      insights.push({
        type: 'trend',
        title: 'Task Completion Progress',
        description: `${metrics.tasksCompleted} tasks completed this period`,
        impact: 'medium',
        action: 'Continue current pace'
      });
    }

    // Overdue task insights
    if (metrics.tasksOverdue > 0) {
      insights.push({
        type: 'issue',
        title: 'Overdue Tasks',
        description: `${metrics.tasksOverdue} tasks are overdue`,
        impact: 'high',
        action: 'Review and reschedule overdue tasks'
      });
    }

    // Resource utilization insights
    if (metrics.resourceUtilization > 90) {
      insights.push({
        type: 'issue',
        title: 'High Resource Utilization',
        description: `Resource utilization at ${metrics.resourceUtilization}%`,
        impact: 'medium',
        action: 'Consider additional resources or timeline adjustment'
      });
    }

    return insights;
  }

  private groupTasksByCategory(tasks: ProjectTask[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    tasks.forEach(task => {
      const category = task.category;
      grouped[category] = (grouped[category] || 0) + 1;
    });
    
    return grouped;
  }

  private calculateTimelineProgress(timeline: ProjectTimeline): number {
    const totalPhases = timeline.phases.length;
    const completedPhases = timeline.phases.filter(p => p.progress >= 100).length;
    const inProgressPhases = timeline.phases.filter(p => p.progress > 0 && p.progress < 100);
    
    let totalProgress = completedPhases * 100;
    totalProgress += inProgressPhases.reduce((sum, phase) => sum + phase.progress, 0);
    
    return Math.round(totalProgress / totalPhases);
  }

  private calculateDaysRemaining(timeline: ProjectTimeline): number {
    const now = new Date();
    const remaining = (timeline.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(remaining));
  }

  private getCriticalPathStatus(timeline: ProjectTimeline): string {
    const criticalPhases = timeline.phases.filter(p => timeline.criticalPath.includes(p.id));
    const delayedPhases = criticalPhases.filter(p => new Date() > p.endDate && p.progress < 100);
    
    if (delayedPhases.length > 0) {
      return 'delayed';
    } else if (criticalPhases.some(p => p.progress > 0)) {
      return 'on_track';
    } else {
      return 'not_started';
    }
  }

  // Platform-specific connection methods (simplified implementations)

  private async testJiraConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1; // 90% success rate
  }

  private async testAsanaConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1;
  }

  private async testMondayConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1;
  }

  private async testClickupConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1;
  }

  private async testNotionConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1;
  }

  private async testLinearConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1;
  }

  private async testAzureDevOpsConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1;
  }

  private async testGitHubProjectsConnection(platform: ProjectPlatform): Promise<boolean> {
    return Math.random() > 0.1;
  }

  private async createTaskInPlatform(task: ProjectTask, platform: ProjectPlatform): Promise<{ id: string }> {
    // Simulate creating task in external platform
    return { id: `ext_${Date.now()}` };
  }

  private async updateTaskInPlatform(task: ProjectTask, platform: ProjectPlatform): Promise<void> {
    // Simulate updating task in external platform
  }

  private async createMilestoneInPlatform(milestone: ProjectMilestone, platform: ProjectPlatform): Promise<{ id: string }> {
    // Simulate creating milestone in external platform
    return { id: `ext_ms_${Date.now()}` };
  }

  private async syncPlatformData(platform: ProjectPlatform): Promise<void> {
    // Simulate syncing data with external platform
  }

  /**
   * Get all tasks
   */
  getTasks(projectId?: string): ProjectTask[] {
    const tasks = Array.from(this.tasks.values());
    return projectId ? tasks.filter(t => t.projectId === projectId) : tasks;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ProjectTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all milestones
   */
  getMilestones(projectId?: string): ProjectMilestone[] {
    const milestones = Array.from(this.milestones.values());
    return projectId ? milestones.filter(m => m.projectId === projectId) : milestones;
  }

  /**
   * Get milestone by ID
   */
  getMilestone(milestoneId: string): ProjectMilestone | undefined {
    return this.milestones.get(milestoneId);
  }

  /**
   * Get all platforms
   */
  getPlatforms(): ProjectPlatform[] {
    return Array.from(this.platforms.values());
  }

  /**
   * Get platform by ID
   */
  getPlatform(platformId: string): ProjectPlatform | undefined {
    return this.platforms.get(platformId);
  }

  /**
   * Shutdown integration
   */
  async shutdown(): Promise<void> {
    // Clear all intervals
    this.syncIntervals.forEach(interval => clearInterval(interval));
    this.syncIntervals.clear();
    
    // Clear all data
    this.platforms.clear();
    this.tasks.clear();
    this.milestones.clear();
    this.resources.clear();
    this.timelines.clear();
    this.reports.clear();
    
    this.isInitialized = false;
    this.emit('shutdown');
  }
}

export {
  ProjectManagementIntegration,
  ProjectPlatform,
  ProjectTask,
  ProjectMilestone,
  ProjectResource,
  ProjectTimeline,
  ProjectReport,
  ProjectIntegrationConfig
};

export default ProjectManagementIntegration;