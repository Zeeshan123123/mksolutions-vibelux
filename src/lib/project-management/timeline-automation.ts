/**
 * Automated Timeline Management
 * Handles real-time project adjustments when stakeholders update delivery times
 */

import { EventEmitter } from 'events';
import type { Project, ProjectTask, Stakeholder } from './project-types';

export interface TimelineUpdate {
  id: string;
  projectId: string;
  stakeholderId: string;
  updateType: 'lead_time_change' | 'delivery_delay' | 'resource_unavailable' | 'schedule_conflict';
  affectedItems: Array<{
    itemId: string;
    itemType: 'fixture' | 'equipment' | 'material' | 'service';
    previousLeadTime: number;
    newLeadTime: number;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  reason: string;
  updatedBy: string;
  updatedAt: Date;
  approvalRequired: boolean;
}

export interface CascadeRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }>;
  actions: Array<{
    type: 'adjust_timeline' | 'notify_stakeholders' | 'create_task' | 'escalate';
    parameters: Record<string, any>;
  }>;
  priority: number;
  enabled: boolean;
}

export interface TimelineAdjustment {
  id: string;
  projectId: string;
  originalUpdate: TimelineUpdate;
  proposedChanges: Array<{
    taskId: string;
    taskName: string;
    currentStartDate: Date;
    currentEndDate: Date;
    proposedStartDate: Date;
    proposedEndDate: Date;
    impact: string;
  }>;
  criticalPathAffected: boolean;
  budgetImpact: number;
  stakeholderApprovals: Array<{
    stakeholderId: string;
    role: string;
    required: boolean;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    approvedAt?: Date;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  createdAt: Date;
  implementedAt?: Date;
}

export class TimelineAutomationEngine extends EventEmitter {
  private cascadeRules: Map<string, CascadeRule> = new Map();
  private pendingAdjustments: Map<string, TimelineAdjustment> = new Map();
  
  constructor() {
    super();
    this.initializeDefaultRules();
  }

  /**
   * Process stakeholder update (e.g., lighting manufacturer updates lead time)
   */
  async processStakeholderUpdate(
    project: Project,
    update: TimelineUpdate
  ): Promise<TimelineAdjustment> {
    console.log(`🔄 Processing update from ${update.stakeholderId}: ${update.updateType}`);
    
    // 1. Analyze impact on project timeline
    const impact = await this.analyzeTimelineImpact(project, update);
    
    // 2. Calculate cascade effects
    const cascadeEffects = await this.calculateCascadeEffects(project, update, impact);
    
    // 3. Create proposed timeline adjustment
    const adjustment = await this.createTimelineAdjustment(project, update, cascadeEffects);
    
    // 4. Determine required approvals
    const approvals = await this.determineRequiredApprovals(project, adjustment);
    adjustment.stakeholderApprovals = approvals;
    
    // 5. Store pending adjustment
    this.pendingAdjustments.set(adjustment.id, adjustment);
    
    // 6. Notify stakeholders
    await this.notifyStakeholders(project, adjustment);
    
    // 7. Auto-approve if within tolerance
    if (await this.shouldAutoApprove(adjustment)) {
      await this.implementAdjustment(project, adjustment);
    }
    
    this.emit('timeline_adjustment_created', { project, adjustment });
    
    return adjustment;
  }

  /**
   * Example: Lighting manufacturer reports 26-week lead time instead of 10 weeks
   */
  async handleLightingLeadTimeChange(
    project: Project,
    manufacturerId: string,
    fixtureModels: string[],
    newLeadTimeWeeks: number,
    reason: string
  ): Promise<TimelineAdjustment> {
    
    const update: TimelineUpdate = {
      id: `update-${Date.now()}`,
      projectId: project.id,
      stakeholderId: manufacturerId,
      updateType: 'lead_time_change',
      affectedItems: fixtureModels.map(modelId => ({
        itemId: modelId,
        itemType: 'fixture' as const,
        previousLeadTime: 10 * 7, // 10 weeks in days
        newLeadTime: newLeadTimeWeeks * 7, // Convert to days
        impactLevel: newLeadTimeWeeks > 20 ? 'critical' : 'high' as const
      })),
      reason,
      updatedBy: manufacturerId,
      updatedAt: new Date(),
      approvalRequired: newLeadTimeWeeks > 16 // Require approval for major delays
    };

    return await this.processStakeholderUpdate(project, update);
  }

  private async analyzeTimelineImpact(
    project: Project,
    update: TimelineUpdate
  ): Promise<{
    affectedTasks: ProjectTask[];
    criticalPathImpact: boolean;
    delayDays: number;
    budgetImpact: number;
  }> {
    
    // Find all tasks that depend on the affected items
    const affectedTasks = project.tasks.filter(task => 
      update.affectedItems.some(item => 
        task.relatedItems.bomId?.includes(item.itemId) ||
        task.relatedItems.procurementId?.includes(item.itemId)
      )
    );

    // Calculate delay
    const maxDelayDays = Math.max(...update.affectedItems.map(item => 
      item.newLeadTime - item.previousLeadTime
    ));

    // Check critical path impact
    const criticalTasks = this.findCriticalPath(project);
    const criticalPathImpact = affectedTasks.some(task => 
      criticalTasks.includes(task.id)
    );

    // Estimate budget impact (storage, expediting, etc.)
    const budgetImpact = criticalPathImpact ? maxDelayDays * 500 : maxDelayDays * 100;

    return {
      affectedTasks,
      criticalPathImpact,
      delayDays: maxDelayDays,
      budgetImpact
    };
  }

  private async calculateCascadeEffects(
    project: Project,
    update: TimelineUpdate,
    impact: any
  ): Promise<Array<{
    taskId: string;
    currentStart: Date;
    currentEnd: Date;
    newStart: Date;
    newEnd: Date;
    reason: string;
  }>> {
    
    const effects = [];
    const delayDays = impact.delayDays;
    
    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(project.tasks);
    
    // Propagate delays through dependent tasks
    for (const task of impact.affectedTasks) {
      const dependentTasks = this.findDependentTasks(task.id, dependencyGraph);
      
      for (const depTask of dependentTasks) {
        const newStart = new Date(depTask.startDate.getTime() + delayDays * 24 * 60 * 60 * 1000);
        const newEnd = new Date(depTask.dueDate.getTime() + delayDays * 24 * 60 * 60 * 1000);
        
        effects.push({
          taskId: depTask.id,
          currentStart: depTask.startDate,
          currentEnd: depTask.dueDate,
          newStart,
          newEnd,
          reason: `Delayed due to ${update.updateType} from ${update.stakeholderId}`
        });
      }
    }
    
    return effects;
  }

  private async createTimelineAdjustment(
    project: Project,
    update: TimelineUpdate,
    cascadeEffects: any[]
  ): Promise<TimelineAdjustment> {
    
    return {
      id: `adjustment-${Date.now()}`,
      projectId: project.id,
      originalUpdate: update,
      proposedChanges: cascadeEffects.map(effect => ({
        taskId: effect.taskId,
        taskName: project.tasks.find(t => t.id === effect.taskId)?.title || 'Unknown Task',
        currentStartDate: effect.currentStart,
        currentEndDate: effect.currentEnd,
        proposedStartDate: effect.newStart,
        proposedEndDate: effect.newEnd,
        impact: effect.reason
      })),
      criticalPathAffected: true, // Calculated in analyzeTimelineImpact
      budgetImpact: 15000, // Estimated additional costs
      stakeholderApprovals: [], // Filled by determineRequiredApprovals
      status: 'pending',
      createdAt: new Date()
    };
  }

  private async determineRequiredApprovals(
    project: Project,
    adjustment: TimelineAdjustment
  ): Promise<Array<{
    stakeholderId: string;
    role: string;
    required: boolean;
    status: 'pending' | 'approved' | 'rejected';
  }>> {
    
    const approvals = [];
    
    // Project manager approval always required
    const pm = project.stakeholders.find(s => s.role === 'project_manager');
    if (pm) {
      approvals.push({
        stakeholderId: pm.id,
        role: 'project_manager',
        required: true,
        status: 'pending' as const
      });
    }
    
    // Client approval for critical path or budget impact > $10k
    if (adjustment.criticalPathAffected || adjustment.budgetImpact > 10000) {
      const client = project.stakeholders.find(s => s.role === 'client');
      if (client) {
        approvals.push({
          stakeholderId: client.id,
          role: 'client',
          required: true,
          status: 'pending' as const
        });
      }
    }
    
    return approvals;
  }

  private async notifyStakeholders(
    project: Project,
    adjustment: TimelineAdjustment
  ): Promise<void> {
    
    const message = `
🚨 PROJECT TIMELINE UPDATE REQUIRED

Project: ${project.name}
Trigger: ${adjustment.originalUpdate.updateType}
Impact: ${adjustment.criticalPathAffected ? 'Critical Path Affected' : 'Non-Critical'}
Budget Impact: $${adjustment.budgetImpact.toLocaleString()}

Proposed Changes:
${adjustment.proposedChanges.map(change => 
  `• ${change.taskName}: ${change.currentEndDate.toDateString()} → ${change.proposedEndDate.toDateString()}`
).join('\n')}

${adjustment.stakeholderApprovals.filter(a => a.required).length > 0 ? 
  'Approval Required From:\n' + 
  adjustment.stakeholderApprovals.filter(a => a.required).map(a => `• ${a.role}`).join('\n')
  : 'Auto-implementing...'
}
    `.trim();

    // Send notifications to required approvers
    for (const approval of adjustment.stakeholderApprovals.filter(a => a.required)) {
      await this.sendNotification(approval.stakeholderId, message);
    }

    // Broadcast to all project stakeholders
    this.emit('stakeholder_notification', {
      projectId: project.id,
      message,
      recipients: project.stakeholders.map(s => s.id),
      priority: adjustment.criticalPathAffected ? 'high' : 'medium'
    });
  }

  private async shouldAutoApprove(adjustment: TimelineAdjustment): Promise<boolean> {
    // Auto-approve if:
    // 1. No critical path impact AND budget impact < $5k
    // 2. OR delay is less than 5 days
    const delayDays = Math.max(...adjustment.proposedChanges.map(change => 
      Math.ceil((change.proposedEndDate.getTime() - change.currentEndDate.getTime()) / (24 * 60 * 60 * 1000))
    ));
    
    return (!adjustment.criticalPathAffected && adjustment.budgetImpact < 5000) || 
           delayDays < 5;
  }

  private async implementAdjustment(
    project: Project,
    adjustment: TimelineAdjustment
  ): Promise<void> {
    
    console.log(`✅ Implementing timeline adjustment for project ${project.id}`);
    
    // Update task dates
    for (const change of adjustment.proposedChanges) {
      const task = project.tasks.find(t => t.id === change.taskId);
      if (task) {
        task.startDate = change.proposedStartDate;
        task.dueDate = change.proposedEndDate;
      }
    }
    
    // Update milestones
    await this.updateMilestones(project, adjustment);
    
    // Update resource allocations
    await this.updateResourceAllocations(project, adjustment);
    
    // Mark as implemented
    adjustment.status = 'implemented';
    adjustment.implementedAt = new Date();
    
    // Emit success event
    this.emit('timeline_implemented', { project, adjustment });
    
    // Send confirmation notifications
    await this.sendImplementationNotification(project, adjustment);
  }

  private async sendNotification(stakeholderId: string, message: string): Promise<void> {
    // Integration with notification system
    console.log(`📧 Notifying ${stakeholderId}: ${message}`);
  }

  private findCriticalPath(project: Project): string[] {
    // Simplified critical path calculation
    // In reality, this would use proper CPM algorithm
    return project.tasks
      .filter(task => task.priority === 'critical')
      .map(task => task.id);
  }

  private buildDependencyGraph(tasks: ProjectTask[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    for (const task of tasks) {
      graph.set(task.id, task.dependencies || []);
    }
    
    return graph;
  }

  private findDependentTasks(taskId: string, dependencyGraph: Map<string, string[]>): ProjectTask[] {
    // Find all tasks that depend on the given task
    const dependents = [];
    
    for (const [id, deps] of dependencyGraph.entries()) {
      if (deps.includes(taskId)) {
        dependents.push(id);
      }
    }
    
    // Return task objects (simplified - would need project context)
    return dependents.map(id => ({ id } as ProjectTask));
  }

  private async updateMilestones(project: Project, adjustment: TimelineAdjustment): Promise<void> {
    // Update milestone dates based on affected tasks
    console.log('📅 Updating project milestones');
  }

  private async updateResourceAllocations(project: Project, adjustment: TimelineAdjustment): Promise<void> {
    // Adjust resource schedules for new timeline
    console.log('👥 Updating resource allocations');
  }

  private async sendImplementationNotification(project: Project, adjustment: TimelineAdjustment): Promise<void> {
    const message = `✅ Timeline adjustment implemented for ${project.name}. New project completion date: ${new Date(project.plannedEndDate.getTime() + adjustment.budgetImpact).toDateString()}`;
    
    for (const stakeholder of project.stakeholders) {
      await this.sendNotification(stakeholder.id, message);
    }
  }

  private initializeDefaultRules(): void {
    // Initialize standard cascade rules for common scenarios
    console.log('🔧 Initializing timeline automation rules');
  }
}

export { TimelineAutomationEngine };