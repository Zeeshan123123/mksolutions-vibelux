/**
 * Procurement Workflow Engine
 * Manages the complete procurement process from BOM to delivery
 */

import { EventEmitter } from 'events';
import { BOMItem } from '../cad/bom-generator';
import { SupplierIntegration, PriceQuote, PurchaseOrder, SupplierConfig } from './supplier-integration';
import { SupplierAPIClient } from './supplier-api-client';

export interface ProcurementProject {
  id: string;
  name: string;
  description: string;
  bomId: string;
  projectId: string;
  status: 'planning' | 'sourcing' | 'quoted' | 'approved' | 'ordered' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: {
    approved: number;
    estimated: number;
    actual: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    requiredDate: Date;
    estimatedDelivery: Date;
    actualDelivery?: Date;
  };
  deliveryAddress: {
    company: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    contact: string;
    phone: string;
    email: string;
  };
  approvals: {
    technical: { approved: boolean; approver?: string; date?: Date; notes?: string };
    financial: { approved: boolean; approver?: string; date?: Date; notes?: string };
    management: { approved: boolean; approver?: string; date?: Date; notes?: string };
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcurementItem {
  id: string;
  procurementProjectId: string;
  bomItemId: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  specifications: Record<string, any>;
  status: 'pending' | 'sourcing' | 'quoted' | 'approved' | 'ordered' | 'received' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  requiredDate: Date;
  quotes: PriceQuote[];
  selectedQuote?: string;
  purchaseOrder?: string;
  receivedQuantity: number;
  qualityCheck: {
    passed: boolean;
    inspector?: string;
    date?: Date;
    notes?: string;
    issues?: string[];
  };
  notes: string;
}

export interface ProcurementWorkflow {
  id: string;
  name: string;
  description: string;
  stages: ProcurementStage[];
  rules: ProcurementRule[];
  notifications: ProcurementNotification[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcurementStage {
  id: string;
  name: string;
  description: string;
  order: number;
  type: 'sourcing' | 'quoting' | 'approval' | 'ordering' | 'receiving' | 'quality_check';
  duration: number; // hours
  requirements: string[];
  approvers: string[];
  isParallel: boolean;
  conditions: Record<string, any>;
}

export interface ProcurementRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
}

export interface ProcurementNotification {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'dashboard';
  event: string;
  recipients: string[];
  template: string;
  isActive: boolean;
}

export interface ProcurementMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpend: number;
  averageLeadTime: number;
  onTimeDelivery: number;
  qualityScore: number;
  costSavings: number;
  supplierPerformance: Record<string, number>;
  categorySpend: Record<string, number>;
  timeToApproval: number;
}

export interface ProcurementAlert {
  id: string;
  type: 'budget_exceeded' | 'deadline_approaching' | 'quality_issue' | 'supplier_delay' | 'approval_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  projectId: string;
  itemId?: string;
  supplierId?: string;
  createdAt: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  actions: string[];
}

class ProcurementWorkflowEngine extends EventEmitter {
  private supplierIntegration: SupplierIntegration;
  private apiClient: SupplierAPIClient;
  private projects: Map<string, ProcurementProject> = new Map();
  private items: Map<string, ProcurementItem> = new Map();
  private workflows: Map<string, ProcurementWorkflow> = new Map();
  private alerts: Map<string, ProcurementAlert> = new Map();
  private isInitialized: boolean = false;

  constructor(supplierIntegration: SupplierIntegration, apiClient: SupplierAPIClient) {
    super();
    this.supplierIntegration = supplierIntegration;
    this.apiClient = apiClient;
    this.initializeWorkflows();
  }

  /**
   * Initialize procurement workflows
   */
  async initialize(): Promise<void> {
    try {
      await this.loadWorkflows();
      this.startWorkflowProcessing();
      this.startAlertMonitoring();
      
      this.isInitialized = true;
      this.emit('initialized');
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create procurement project from BOM
   */
  async createProcurementProject(
    bomItems: BOMItem[],
    projectInfo: {
      name: string;
      description: string;
      bomId: string;
      projectId: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      budget: number;
      currency: string;
      requiredDate: Date;
      deliveryAddress: ProcurementProject['deliveryAddress'];
      createdBy: string;
    }
  ): Promise<ProcurementProject> {
    const projectId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const project: ProcurementProject = {
      id: projectId,
      name: projectInfo.name,
      description: projectInfo.description,
      bomId: projectInfo.bomId,
      projectId: projectInfo.projectId,
      status: 'planning',
      priority: projectInfo.priority,
      budget: {
        approved: projectInfo.budget,
        estimated: 0,
        actual: 0,
        currency: projectInfo.currency
      },
      timeline: {
        startDate: new Date(),
        requiredDate: projectInfo.requiredDate,
        estimatedDelivery: new Date(projectInfo.requiredDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      deliveryAddress: projectInfo.deliveryAddress,
      approvals: {
        technical: { approved: false },
        financial: { approved: false },
        management: { approved: false }
      },
      createdBy: projectInfo.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create procurement items from BOM
    const items = bomItems.map(bomItem => this.createProcurementItem(projectId, bomItem));
    
    // Calculate estimated budget
    project.budget.estimated = items.reduce((total, item) => {
      return total + (item.quantity * 10); // Rough estimate
    }, 0);

    // Store project and items
    this.projects.set(projectId, project);
    items.forEach(item => this.items.set(item.id, item));

    // Start workflow
    await this.startWorkflow(projectId);

    this.emit('project-created', project);
    return project;
  }

  /**
   * Create procurement item from BOM item
   */
  private createProcurementItem(projectId: string, bomItem: BOMItem): ProcurementItem {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: itemId,
      procurementProjectId: projectId,
      bomItemId: bomItem.id,
      partNumber: bomItem.partNumber,
      description: bomItem.description,
      quantity: bomItem.quantity,
      unitOfMeasure: bomItem.unitOfMeasure,
      specifications: bomItem.specifications || {},
      status: 'pending',
      priority: 'medium',
      category: bomItem.category,
      requiredDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
      quotes: [],
      receivedQuantity: 0,
      qualityCheck: { passed: false },
      notes: ''
    };
  }

  /**
   * Start procurement workflow
   */
  private async startWorkflow(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const workflow = this.workflows.get('default');
    if (!workflow) {
      throw new Error('Default workflow not found');
    }

    // Execute first stage
    await this.executeWorkflowStage(project, workflow.stages[0]);
  }

  /**
   * Execute workflow stage
   */
  private async executeWorkflowStage(project: ProcurementProject, stage: ProcurementStage): Promise<void> {
    try {
      this.emit('stage-started', { projectId: project.id, stage: stage.name });

      switch (stage.type) {
        case 'sourcing':
          await this.executeSourcingStage(project);
          break;
        case 'quoting':
          await this.executeQuotingStage(project);
          break;
        case 'approval':
          await this.executeApprovalStage(project);
          break;
        case 'ordering':
          await this.executeOrderingStage(project);
          break;
        case 'receiving':
          await this.executeReceivingStage(project);
          break;
        case 'quality_check':
          await this.executeQualityCheckStage(project);
          break;
      }

      this.emit('stage-completed', { projectId: project.id, stage: stage.name });

    } catch (error) {
      this.emit('stage-failed', { projectId: project.id, stage: stage.name, error });
      throw error;
    }
  }

  /**
   * Execute sourcing stage
   */
  private async executeSourcingStage(project: ProcurementProject): Promise<void> {
    const projectItems = Array.from(this.items.values()).filter(
      item => item.procurementProjectId === project.id
    );

    // Group items by category
    const itemsByCategory = new Map<string, ProcurementItem[]>();
    projectItems.forEach(item => {
      const categoryItems = itemsByCategory.get(item.category) || [];
      categoryItems.push(item);
      itemsByCategory.set(item.category, categoryItems);
    });

    // Find suppliers for each category
    for (const [category, items] of itemsByCategory.entries()) {
      const suppliers = this.supplierIntegration.getSuppliers().filter(
        supplier => supplier.type === category && supplier.status === 'active'
      );

      if (suppliers.length === 0) {
        this.createAlert({
          type: 'supplier_delay',
          severity: 'high',
          message: `No active suppliers found for category: ${category}`,
          projectId: project.id
        });
      }

      // Update item status
      items.forEach(item => {
        item.status = 'sourcing';
        this.items.set(item.id, item);
      });
    }

    // Update project status
    project.status = 'sourcing';
    project.updatedAt = new Date();
    this.projects.set(project.id, project);
  }

  /**
   * Execute quoting stage
   */
  private async executeQuotingStage(project: ProcurementProject): Promise<void> {
    const projectItems = Array.from(this.items.values()).filter(
      item => item.procurementProjectId === project.id && item.status === 'sourcing'
    );

    // Convert to BOM items for quote request
    const bomItems = projectItems.map(item => ({
      id: item.id,
      partNumber: item.partNumber,
      description: item.description,
      quantity: item.quantity,
      unitOfMeasure: item.unitOfMeasure,
      category: item.category,
      specifications: item.specifications,
      unitCost: 0,
      totalCost: 0,
      material: '',
      finish: '',
      supplier: '',
      leadTime: 0,
      type: item.category
    }));

    // Request quotes
    const quotes = await this.supplierIntegration.getPriceQuote(bomItems, project.id);

    // Associate quotes with items
    projectItems.forEach(item => {
      const itemQuotes = quotes.filter(quote => 
        quote.items.some(quoteItem => quoteItem.sku === item.partNumber)
      );
      
      item.quotes = itemQuotes;
      item.status = 'quoted';
      this.items.set(item.id, item);
    });

    // Update project budget estimate
    const totalEstimate = quotes.reduce((sum, quote) => sum + quote.totalAmount, 0);
    project.budget.estimated = totalEstimate;
    project.status = 'quoted';
    project.updatedAt = new Date();
    this.projects.set(project.id, project);

    // Check budget
    if (totalEstimate > project.budget.approved) {
      this.createAlert({
        type: 'budget_exceeded',
        severity: 'high',
        message: `Estimated cost (${totalEstimate}) exceeds approved budget (${project.budget.approved})`,
        projectId: project.id
      });
    }
  }

  /**
   * Execute approval stage
   */
  private async executeApprovalStage(project: ProcurementProject): Promise<void> {
    // Check if technical approval is required
    if (project.budget.estimated > 10000) {
      this.requestApproval(project.id, 'technical');
    }

    // Check if financial approval is required
    if (project.budget.estimated > 25000) {
      this.requestApproval(project.id, 'financial');
    }

    // Check if management approval is required
    if (project.budget.estimated > 50000) {
      this.requestApproval(project.id, 'management');
    }

    // For smaller projects, auto-approve
    if (project.budget.estimated <= 10000) {
      project.approvals.technical.approved = true;
      project.approvals.financial.approved = true;
      project.approvals.management.approved = true;
      project.status = 'approved';
      project.updatedAt = new Date();
      this.projects.set(project.id, project);
    }
  }

  /**
   * Execute ordering stage
   */
  private async executeOrderingStage(project: ProcurementProject): Promise<void> {
    const projectItems = Array.from(this.items.values()).filter(
      item => item.procurementProjectId === project.id && item.status === 'quoted'
    );

    // Select best quotes and create orders
    for (const item of projectItems) {
      if (item.quotes.length === 0) continue;

      // Select best quote (lowest price for now)
      const bestQuote = item.quotes.reduce((best, current) => 
        current.totalAmount < best.totalAmount ? current : best
      );

      item.selectedQuote = bestQuote.quoteId;

      // Create purchase order
      try {
        const order = await this.supplierIntegration.createPurchaseOrder(
          bestQuote.supplierId,
          bestQuote.quoteId,
          project.id,
          project.deliveryAddress,
          project.deliveryAddress, // Use same for billing
          project.timeline.requiredDate,
          `Procurement project: ${project.name}`
        );

        item.purchaseOrder = order.orderId;
        item.status = 'ordered';
        this.items.set(item.id, item);

      } catch (error) {
        this.createAlert({
          type: 'supplier_delay',
          severity: 'medium',
          message: `Failed to create order for item ${item.partNumber}: ${error.message}`,
          projectId: project.id,
          itemId: item.id
        });
      }
    }

    // Update project status
    project.status = 'ordered';
    project.updatedAt = new Date();
    this.projects.set(project.id, project);
  }

  /**
   * Execute receiving stage
   */
  private async executeReceivingStage(project: ProcurementProject): Promise<void> {
    const projectItems = Array.from(this.items.values()).filter(
      item => item.procurementProjectId === project.id && item.status === 'ordered'
    );

    // Check order status for each item
    for (const item of projectItems) {
      if (!item.purchaseOrder) continue;

      try {
        const order = await this.supplierIntegration.trackOrder(item.purchaseOrder);
        
        if (order.status === 'delivered') {
          item.status = 'received';
          item.receivedQuantity = item.quantity; // Assume full delivery
          this.items.set(item.id, item);
        }

      } catch (error) {
        this.createAlert({
          type: 'supplier_delay',
          severity: 'medium',
          message: `Failed to track order for item ${item.partNumber}: ${error.message}`,
          projectId: project.id,
          itemId: item.id
        });
      }
    }

    // Check if all items received
    const allReceived = projectItems.every(item => item.status === 'received');
    if (allReceived) {
      project.status = 'in_progress';
      project.timeline.actualDelivery = new Date();
      project.updatedAt = new Date();
      this.projects.set(project.id, project);
    }
  }

  /**
   * Execute quality check stage
   */
  private async executeQualityCheckStage(project: ProcurementProject): Promise<void> {
    const projectItems = Array.from(this.items.values()).filter(
      item => item.procurementProjectId === project.id && item.status === 'received'
    );

    // Simulate quality checks
    projectItems.forEach(item => {
      const qualityPassed = Math.random() > 0.1; // 90% pass rate
      
      item.qualityCheck = {
        passed: qualityPassed,
        inspector: 'QC Inspector',
        date: new Date(),
        notes: qualityPassed ? 'Item meets specifications' : 'Item has quality issues',
        issues: qualityPassed ? [] : ['Dimensional variance', 'Surface defects']
      };

      if (!qualityPassed) {
        this.createAlert({
          type: 'quality_issue',
          severity: 'medium',
          message: `Quality check failed for item ${item.partNumber}`,
          projectId: project.id,
          itemId: item.id
        });
      }

      this.items.set(item.id, item);
    });

    // Update project status
    const allPassed = projectItems.every(item => item.qualityCheck.passed);
    if (allPassed) {
      project.status = 'completed';
      project.updatedAt = new Date();
      this.projects.set(project.id, project);
    }
  }

  /**
   * Request approval
   */
  private requestApproval(projectId: string, type: 'technical' | 'financial' | 'management'): void {
    this.createAlert({
      type: 'approval_required',
      severity: 'medium',
      message: `${type} approval required for project ${projectId}`,
      projectId,
      actions: [`Approve ${type}`, `Reject ${type}`, 'Request more info']
    });
  }

  /**
   * Process approval
   */
  async processApproval(
    projectId: string,
    type: 'technical' | 'financial' | 'management',
    approved: boolean,
    approver: string,
    notes?: string
  ): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.approvals[type] = {
      approved,
      approver,
      date: new Date(),
      notes
    };

    // Check if all required approvals are complete
    const allApproved = Object.values(project.approvals).every(approval => approval.approved);
    
    if (allApproved) {
      project.status = 'approved';
      await this.executeOrderingStage(project);
    } else if (!approved) {
      project.status = 'cancelled';
    }

    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    
    this.emit('approval-processed', { projectId, type, approved, approver });
  }

  /**
   * Create alert
   */
  private createAlert(alertData: Omit<ProcurementAlert, 'id' | 'createdAt'>): void {
    const alert: ProcurementAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      actions: alertData.actions || [],
      ...alertData
    };

    this.alerts.set(alert.id, alert);
    this.emit('alert-created', alert);
  }

  /**
   * Get procurement metrics
   */
  getProcurementMetrics(): ProcurementMetrics {
    const projects = Array.from(this.projects.values());
    const items = Array.from(this.items.values());

    const completedProjects = projects.filter(p => p.status === 'completed');
    const activeProjects = projects.filter(p => !['completed', 'cancelled'].includes(p.status));

    const totalSpend = completedProjects.reduce((sum, p) => sum + p.budget.actual, 0);
    const averageLeadTime = this.calculateAverageLeadTime(completedProjects);
    const onTimeDelivery = this.calculateOnTimeDelivery(completedProjects);

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      totalSpend,
      averageLeadTime,
      onTimeDelivery,
      qualityScore: this.calculateQualityScore(items),
      costSavings: this.calculateCostSavings(projects),
      supplierPerformance: this.calculateSupplierPerformance(items),
      categorySpend: this.calculateCategorySpend(items),
      timeToApproval: this.calculateTimeToApproval(projects)
    };
  }

  /**
   * Initialize default workflows
   */
  private initializeWorkflows(): void {
    const defaultWorkflow: ProcurementWorkflow = {
      id: 'default',
      name: 'Standard Procurement Workflow',
      description: 'Default procurement workflow for all projects',
      stages: [
        {
          id: 'sourcing',
          name: 'Sourcing',
          description: 'Identify and evaluate suppliers',
          order: 1,
          type: 'sourcing',
          duration: 24,
          requirements: ['Supplier identification', 'Capability assessment'],
          approvers: [],
          isParallel: false,
          conditions: {}
        },
        {
          id: 'quoting',
          name: 'Quoting',
          description: 'Request and evaluate quotes',
          order: 2,
          type: 'quoting',
          duration: 48,
          requirements: ['Quote requests', 'Quote evaluation'],
          approvers: [],
          isParallel: false,
          conditions: {}
        },
        {
          id: 'approval',
          name: 'Approval',
          description: 'Obtain required approvals',
          order: 3,
          type: 'approval',
          duration: 72,
          requirements: ['Budget approval', 'Technical approval'],
          approvers: ['technical_manager', 'financial_manager'],
          isParallel: true,
          conditions: {}
        },
        {
          id: 'ordering',
          name: 'Ordering',
          description: 'Create and submit purchase orders',
          order: 4,
          type: 'ordering',
          duration: 4,
          requirements: ['Purchase orders', 'Supplier confirmation'],
          approvers: [],
          isParallel: false,
          conditions: {}
        },
        {
          id: 'receiving',
          name: 'Receiving',
          description: 'Receive and inspect goods',
          order: 5,
          type: 'receiving',
          duration: 168, // 1 week
          requirements: ['Delivery confirmation', 'Initial inspection'],
          approvers: [],
          isParallel: false,
          conditions: {}
        },
        {
          id: 'quality_check',
          name: 'Quality Check',
          description: 'Perform quality inspection',
          order: 6,
          type: 'quality_check',
          duration: 24,
          requirements: ['Quality inspection', 'Acceptance confirmation'],
          approvers: ['quality_manager'],
          isParallel: false,
          conditions: {}
        }
      ],
      rules: [],
      notifications: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set('default', defaultWorkflow);
  }

  /**
   * Load workflows from database
   */
  private async loadWorkflows(): Promise<void> {
    // In production, load from database
    this.emit('workflows-loaded', Array.from(this.workflows.values()));
  }

  /**
   * Start workflow processing
   */
  private startWorkflowProcessing(): void {
    setInterval(() => {
      this.processWorkflows();
    }, 60000); // Process every minute
  }

  /**
   * Process workflows
   */
  private processWorkflows(): void {
    const activeProjects = Array.from(this.projects.values()).filter(
      p => !['completed', 'cancelled'].includes(p.status)
    );

    activeProjects.forEach(project => {
      this.checkProjectDeadlines(project);
      this.checkBudgetStatus(project);
    });
  }

  /**
   * Start alert monitoring
   */
  private startAlertMonitoring(): void {
    setInterval(() => {
      this.monitorAlerts();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Monitor alerts
   */
  private monitorAlerts(): void {
    const activeAlerts = Array.from(this.alerts.values()).filter(
      alert => !alert.resolvedAt
    );

    activeAlerts.forEach(alert => {
      if (alert.severity === 'critical') {
        this.escalateAlert(alert);
      }
    });
  }

  /**
   * Check project deadlines
   */
  private checkProjectDeadlines(project: ProcurementProject): void {
    const now = new Date();
    const daysUntilDeadline = (project.timeline.requiredDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
      this.createAlert({
        type: 'deadline_approaching',
        severity: 'medium',
        message: `Project ${project.name} deadline approaching in ${Math.ceil(daysUntilDeadline)} days`,
        projectId: project.id
      });
    }
  }

  /**
   * Check budget status
   */
  private checkBudgetStatus(project: ProcurementProject): void {
    const utilizationRate = project.budget.actual / project.budget.approved;

    if (utilizationRate > 0.9) {
      this.createAlert({
        type: 'budget_exceeded',
        severity: 'high',
        message: `Project ${project.name} has utilized ${Math.round(utilizationRate * 100)}% of budget`,
        projectId: project.id
      });
    }
  }

  /**
   * Escalate alert
   */
  private escalateAlert(alert: ProcurementAlert): void {
    this.emit('alert-escalated', alert);
  }

  // Helper methods for metrics calculation

  private calculateAverageLeadTime(projects: ProcurementProject[]): number {
    if (projects.length === 0) return 0;

    const totalLeadTime = projects.reduce((sum, project) => {
      if (project.timeline.actualDelivery) {
        return sum + (project.timeline.actualDelivery.getTime() - project.timeline.startDate.getTime());
      }
      return sum;
    }, 0);

    return totalLeadTime / projects.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private calculateOnTimeDelivery(projects: ProcurementProject[]): number {
    if (projects.length === 0) return 0;

    const onTimeProjects = projects.filter(project => 
      project.timeline.actualDelivery && 
      project.timeline.actualDelivery <= project.timeline.requiredDate
    );

    return (onTimeProjects.length / projects.length) * 100;
  }

  private calculateQualityScore(items: ProcurementItem[]): number {
    if (items.length === 0) return 0;

    const qualityCheckedItems = items.filter(item => item.qualityCheck.date);
    const passedItems = qualityCheckedItems.filter(item => item.qualityCheck.passed);

    return qualityCheckedItems.length > 0 ? 
      (passedItems.length / qualityCheckedItems.length) * 100 : 0;
  }

  private calculateCostSavings(projects: ProcurementProject[]): number {
    return projects.reduce((savings, project) => {
      const estimatedSavings = project.budget.estimated - project.budget.actual;
      return savings + Math.max(0, estimatedSavings);
    }, 0);
  }

  private calculateSupplierPerformance(items: ProcurementItem[]): Record<string, number> {
    const performance: Record<string, number> = {};
    
    // This would be calculated based on actual supplier performance metrics
    // For now, return placeholder data
    return {
      'atlas-commercial': 85,
      'nexus-glazing': 92,
      'priva-systems': 78,
      'rimol-fasteners': 96,
      'argus-controls': 88
    };
  }

  private calculateCategorySpend(items: ProcurementItem[]): Record<string, number> {
    const spend: Record<string, number> = {};
    
    items.forEach(item => {
      const category = item.category;
      const cost = item.quantity * 10; // Placeholder calculation
      spend[category] = (spend[category] || 0) + cost;
    });

    return spend;
  }

  private calculateTimeToApproval(projects: ProcurementProject[]): number {
    const approvedProjects = projects.filter(p => p.status === 'approved' || p.status === 'completed');
    
    if (approvedProjects.length === 0) return 0;

    const totalTime = approvedProjects.reduce((sum, project) => {
      const approvalDates = [
        project.approvals.technical.date,
        project.approvals.financial.date,
        project.approvals.management.date
      ].filter(date => date !== undefined);

      if (approvalDates.length > 0) {
        const latestApproval = Math.max(...approvalDates.map(date => date!.getTime()));
        return sum + (latestApproval - project.createdAt.getTime());
      }
      return sum;
    }, 0);

    return totalTime / approvedProjects.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  /**
   * Get all projects
   */
  getProjects(): ProcurementProject[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get project by ID
   */
  getProject(projectId: string): ProcurementProject | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Get project items
   */
  getProjectItems(projectId: string): ProcurementItem[] {
    return Array.from(this.items.values()).filter(
      item => item.procurementProjectId === projectId
    );
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ProcurementAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolvedAt);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      alert.acknowledgedBy = resolvedBy;
      this.alerts.set(alertId, alert);
      this.emit('alert-resolved', alert);
    }
  }

  /**
   * Shutdown workflow engine
   */
  async shutdown(): Promise<void> {
    this.projects.clear();
    this.items.clear();
    this.workflows.clear();
    this.alerts.clear();
    this.isInitialized = false;
    
    this.emit('shutdown');
  }
}

export {
  ProcurementWorkflowEngine,
  ProcurementProject,
  ProcurementItem,
  ProcurementWorkflow,
  ProcurementStage,
  ProcurementRule,
  ProcurementNotification,
  ProcurementMetrics,
  ProcurementAlert
};

export default ProcurementWorkflowEngine;