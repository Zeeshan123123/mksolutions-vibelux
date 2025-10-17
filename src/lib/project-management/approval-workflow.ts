/**
 * Approval Workflow System
 * Manages stakeholder approvals for timeline changes and project modifications
 */

import { EventEmitter } from 'events';
import type { TimelineAdjustment } from './timeline-automation';
import type { CascadeAnalysis } from './cascade-calculator';
import type { Project, Stakeholder } from './project-types';

export interface ApprovalRequest {
  id: string;
  projectId: string;
  type: 'timeline_change' | 'budget_change' | 'scope_change' | 'resource_change' | 'milestone_change';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Request Details
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: Date;
  
  // Change Information
  changes: {
    timeline?: TimelineAdjustment;
    budget?: {
      currentBudget: number;
      proposedBudget: number;
      increase: number;
      reason: string;
    };
    scope?: {
      addedItems: string[];
      removedItems: string[];
      modifiedItems: string[];
      impact: string;
    };
  };
  
  // Impact Analysis
  impact: {
    timeline: number; // days
    budget: number; // dollars
    quality: 'none' | 'minor' | 'moderate' | 'significant';
    risk: 'low' | 'medium' | 'high' | 'critical';
    stakeholders: string[]; // affected stakeholder IDs
    cascadeAnalysis?: CascadeAnalysis;
  };
  
  // Approval Chain
  approvalChain: ApprovalStep[];
  currentStep: number;
  
  // Status
  status: 'draft' | 'submitted' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  finalDecision?: 'approved' | 'rejected';
  finalDecisionBy?: string;
  finalDecisionAt?: Date;
  finalComments?: string;
  
  // Attachments
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'request_submitted' | 'approval_required' | 'approved' | 'rejected' | 'reminder';
    recipient: string;
    sentAt: Date;
    acknowledged: boolean;
    acknowledgedAt?: Date;
  }>;
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    actor: string;
    details: string;
    oldValue?: any;
    newValue?: any;
  }>;
  
  // Deadlines
  deadlines: {
    responseRequired: Date;
    implementationRequired?: Date;
    escalationDate?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  order: number;
  type: 'individual' | 'group' | 'unanimous' | 'majority';
  name: string;
  description: string;
  
  // Approvers
  approvers: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    isRequired: boolean;
    canDelegate: boolean;
  }>;
  
  // Conditions
  conditions: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'contains';
    value: any;
    description: string;
  }>;
  
  // Status
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped';
  responses: Array<{
    approverId: string;
    decision: 'approved' | 'rejected' | 'delegated';
    comments: string;
    timestamp: Date;
    conditions?: string[]; // conditional approval conditions
  }>;
  
  // Timing
  startedAt?: Date;
  completedAt?: Date;
  deadline: Date;
  
  // Escalation
  escalation: {
    enabled: boolean;
    escalateTo: string[];
    escalateAfterHours: number;
    escalated: boolean;
    escalatedAt?: Date;
  };
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  
  // Triggers
  triggers: Array<{
    event: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }>;
  
  // Workflow Template
  workflowTemplate: {
    steps: Omit<ApprovalStep, 'id' | 'status' | 'responses' | 'startedAt' | 'completedAt'>[];
    parallelExecution: boolean;
    autoApproveConditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    autoRejectConditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  
  // Notifications
  notificationTemplate: {
    channels: Array<'email' | 'sms' | 'slack' | 'teams'>;
    templates: Record<string, string>;
    reminders: Array<{
      delayHours: number;
      message: string;
    }>;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export class ApprovalWorkflowEngine extends EventEmitter {
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private approvalRules: Map<string, ApprovalRule> = new Map();
  private activeWorkflows: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    super();
    this.initializeDefaultRules();
  }

  /**
   * Create approval request for timeline change
   * Example: LED fixture delay requires client approval
   */
  async createTimelineApprovalRequest(
    project: Project,
    timelineAdjustment: TimelineAdjustment,
    cascadeAnalysis: CascadeAnalysis,
    requestedBy: string
  ): Promise<ApprovalRequest> {
    
    const impactLevel = this.determineImpactLevel(cascadeAnalysis);
    const priority = this.determinePriority(cascadeAnalysis);
    
    const request: ApprovalRequest = {
      id: `approval-${Date.now()}`,
      projectId: project.id,
      type: 'timeline_change',
      priority,
      
      title: `Timeline Change Approval - ${cascadeAnalysis.summary.totalDelayDays} Day Delay`,
      description: `
Project timeline adjustment required due to ${cascadeAnalysis.triggerType}.

Impact Summary:
• ${cascadeAnalysis.summary.totalTasksAffected} tasks affected
• ${cascadeAnalysis.summary.totalDelayDays} days maximum delay
• $${cascadeAnalysis.summary.totalCostImpact.toLocaleString()} estimated cost impact
• Critical path: ${cascadeAnalysis.criticalPathImpact.affected ? 'AFFECTED' : 'Not affected'}

Key Changes:
${timelineAdjustment.proposedChanges.slice(0, 5).map(change => 
  `• ${change.taskName}: ${change.currentEndDate.toDateString()} → ${change.proposedEndDate.toDateString()}`
).join('\n')}

Recommendations:
${cascadeAnalysis.summary.recommendations.slice(0, 3).join('\n• ')}
      `.trim(),
      
      requestedBy,
      requestedAt: new Date(),
      
      changes: {
        timeline: timelineAdjustment
      },
      
      impact: {
        timeline: cascadeAnalysis.summary.totalDelayDays,
        budget: cascadeAnalysis.summary.totalCostImpact,
        quality: this.mapRiskToQuality(cascadeAnalysis.summary.riskLevel),
        risk: cascadeAnalysis.summary.riskLevel,
        stakeholders: project.stakeholders.map(s => s.id),
        cascadeAnalysis
      },
      
      approvalChain: [],
      currentStep: 0,
      status: 'draft',
      attachments: [],
      notifications: [],
      auditTrail: [{
        timestamp: new Date(),
        action: 'created',
        actor: requestedBy,
        details: 'Approval request created'
      }],
      
      deadlines: {
        responseRequired: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        implementationRequired: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Generate approval chain based on impact
    request.approvalChain = await this.generateApprovalChain(project, request);
    
    this.approvalRequests.set(request.id, request);
    
    this.emit('approval_request_created', { request, project });
    
    return request;
  }

  /**
   * Submit approval request and start workflow
   */
  async submitApprovalRequest(requestId: string): Promise<void> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error('Approval request not found');
    }
    
    if (request.status !== 'draft') {
      throw new Error('Only draft requests can be submitted');
    }
    
    // Check for auto-approval conditions
    if (await this.checkAutoApproval(request)) {
      await this.autoApproveRequest(request);
      return;
    }
    
    // Check for auto-rejection conditions
    if (await this.checkAutoRejection(request)) {
      await this.autoRejectRequest(request);
      return;
    }
    
    // Start approval workflow
    request.status = 'in_progress';
    request.currentStep = 0;
    
    await this.startApprovalStep(request, 0);
    
    this.addAuditEntry(request, 'submitted', request.requestedBy, 'Approval request submitted');
    
    this.emit('approval_workflow_started', { request });
  }

  /**
   * Process approval response from stakeholder
   */
  async processApprovalResponse(
    requestId: string,
    approverId: string,
    decision: 'approved' | 'rejected' | 'delegated',
    comments: string,
    conditions?: string[],
    delegateTo?: string
  ): Promise<void> {
    
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error('Approval request not found');
    }
    
    const currentStep = request.approvalChain[request.currentStep];
    if (!currentStep) {
      throw new Error('No active approval step');
    }
    
    // Verify approver is authorized
    const approver = currentStep.approvers.find(a => a.id === approverId);
    if (!approver) {
      throw new Error('User not authorized to approve this step');
    }
    
    // Handle delegation
    if (decision === 'delegated') {
      if (!approver.canDelegate || !delegateTo) {
        throw new Error('Delegation not allowed or delegate not specified');
      }
      
      await this.handleDelegation(request, currentStep, approverId, delegateTo, comments);
      return;
    }
    
    // Record response
    currentStep.responses.push({
      approverId,
      decision,
      comments,
      timestamp: new Date(),
      conditions
    });
    
    this.addAuditEntry(request, decision, approverId, comments);
    
    // Check if step is complete
    const stepResult = await this.evaluateStepCompletion(currentStep);
    
    if (stepResult.complete) {
      if (stepResult.approved) {
        await this.completeApprovalStep(request, currentStep, true);
      } else {
        await this.rejectApprovalRequest(request, currentStep, stepResult.rejectionReason);
      }
    }
    
    this.emit('approval_response_received', { request, approverId, decision });
  }

  /**
   * Handle urgent approval for critical timeline changes
   */
  async requestUrgentApproval(
    requestId: string,
    reason: string,
    requestedBy: string
  ): Promise<void> {
    
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error('Approval request not found');
    }
    
    request.priority = 'urgent';
    
    // Reduce deadlines
    request.deadlines.responseRequired = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    
    // Escalate immediately
    await this.escalateApprovalRequest(request, reason);
    
    this.addAuditEntry(request, 'urgent_escalation', requestedBy, reason);
    
    this.emit('urgent_approval_requested', { request, reason });
  }

  private async generateApprovalChain(
    project: Project,
    request: ApprovalRequest
  ): Promise<ApprovalStep[]> {
    
    const steps: ApprovalStep[] = [];
    const impact = request.impact;
    
    // Step 1: Project Manager (always required)
    const projectManager = project.stakeholders.find(s => s.role === 'project_manager');
    if (projectManager) {
      steps.push({
        id: `step-pm-${Date.now()}`,
        order: 1,
        type: 'individual',
        name: 'Project Manager Review',
        description: 'Initial review by project manager',
        approvers: [{
          id: projectManager.id,
          name: projectManager.name,
          role: 'project_manager',
          email: projectManager.contactInfo.email,
          isRequired: true,
          canDelegate: false
        }],
        conditions: [],
        status: 'pending',
        responses: [],
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        escalation: {
          enabled: true,
          escalateTo: ['client'],
          escalateAfterHours: 12,
          escalated: false
        }
      });
    }
    
    // Step 2: Client Approval (for significant impacts)
    if (impact.budget > 10000 || impact.timeline > 14 || impact.risk === 'high' || impact.risk === 'critical') {
      const client = project.stakeholders.find(s => s.role === 'client');
      if (client) {
        steps.push({
          id: `step-client-${Date.now()}`,
          order: 2,
          type: 'individual',
          name: 'Client Approval',
          description: 'Client approval required for significant changes',
          approvers: [{
            id: client.id,
            name: client.name,
            role: 'client',
            email: client.contactInfo.email,
            isRequired: true,
            canDelegate: true
          }],
          conditions: [
            { field: 'budget_impact', operator: 'gt', value: 10000, description: 'Budget impact > $10,000' },
            { field: 'timeline_impact', operator: 'gt', value: 14, description: 'Timeline impact > 14 days' }
          ],
          status: 'pending',
          responses: [],
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
          escalation: {
            enabled: true,
            escalateTo: ['senior_management'],
            escalateAfterHours: 24,
            escalated: false
          }
        });
      }
    }
    
    // Step 3: Financial Approval (for high budget impact)
    if (impact.budget > 25000) {
      const finance = project.stakeholders.find(s => s.role === 'finance_manager');
      if (finance) {
        steps.push({
          id: `step-finance-${Date.now()}`,
          order: 3,
          type: 'individual',
          name: 'Financial Approval',
          description: 'Financial review for high-cost changes',
          approvers: [{
            id: finance.id,
            name: finance.name,
            role: 'finance_manager',
            email: finance.contactInfo.email,
            isRequired: true,
            canDelegate: false
          }],
          conditions: [
            { field: 'budget_impact', operator: 'gt', value: 25000, description: 'Budget impact > $25,000' }
          ],
          status: 'pending',
          responses: [],
          deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
          escalation: {
            enabled: true,
            escalateTo: ['cfo'],
            escalateAfterHours: 48,
            escalated: false
          }
        });
      }
    }
    
    return steps;
  }

  private async startApprovalStep(request: ApprovalRequest, stepIndex: number): Promise<void> {
    const step = request.approvalChain[stepIndex];
    if (!step) return;
    
    step.status = 'in_progress';
    step.startedAt = new Date();
    
    // Send notifications to all approvers
    for (const approver of step.approvers) {
      await this.sendApprovalNotification(request, step, approver);
    }
    
    // Set up reminder schedule
    this.scheduleReminders(request, step);
    
    // Set up escalation timer
    if (step.escalation.enabled) {
      this.scheduleEscalation(request, step);
    }
    
    this.emit('approval_step_started', { request, step });
  }

  private async completeApprovalStep(
    request: ApprovalRequest,
    step: ApprovalStep,
    approved: boolean
  ): Promise<void> {
    
    step.status = approved ? 'approved' : 'rejected';
    step.completedAt = new Date();
    
    if (approved) {
      // Move to next step or complete workflow
      const nextStepIndex = request.currentStep + 1;
      if (nextStepIndex < request.approvalChain.length) {
        request.currentStep = nextStepIndex;
        await this.startApprovalStep(request, nextStepIndex);
      } else {
        // All steps approved - complete workflow
        await this.completeApprovalWorkflow(request, true);
      }
    } else {
      // Rejection - end workflow
      await this.completeApprovalWorkflow(request, false);
    }
  }

  private async completeApprovalWorkflow(request: ApprovalRequest, approved: boolean): Promise<void> {
    request.status = approved ? 'approved' : 'rejected';
    request.finalDecision = approved ? 'approved' : 'rejected';
    request.finalDecisionAt = new Date();
    
    // Clear any active timers
    const timerId = this.activeWorkflows.get(request.id);
    if (timerId) {
      clearTimeout(timerId);
      this.activeWorkflows.delete(request.id);
    }
    
    // Send completion notifications
    await this.sendCompletionNotifications(request);
    
    if (approved) {
      // Trigger implementation
      await this.triggerImplementation(request);
    }
    
    this.addAuditEntry(
      request,
      approved ? 'workflow_approved' : 'workflow_rejected',
      'system',
      `Approval workflow ${approved ? 'completed successfully' : 'rejected'}`
    );
    
    this.emit('approval_workflow_completed', { request, approved });
  }

  private async evaluateStepCompletion(step: ApprovalStep): Promise<{
    complete: boolean;
    approved: boolean;
    rejectionReason?: string;
  }> {
    
    const requiredApprovers = step.approvers.filter(a => a.isRequired);
    const requiredResponses = step.responses.filter(r => 
      requiredApprovers.some(a => a.id === r.approverId)
    );
    
    // Check if all required approvers have responded
    if (requiredResponses.length < requiredApprovers.length) {
      return { complete: false, approved: false };
    }
    
    // Evaluate based on step type
    switch (step.type) {
      case 'individual':
        const response = requiredResponses[0];
        return {
          complete: true,
          approved: response.decision === 'approved',
          rejectionReason: response.decision === 'rejected' ? response.comments : undefined
        };
        
      case 'unanimous':
        const allApproved = requiredResponses.every(r => r.decision === 'approved');
        const rejectedResponse = requiredResponses.find(r => r.decision === 'rejected');
        return {
          complete: true,
          approved: allApproved,
          rejectionReason: rejectedResponse?.comments
        };
        
      case 'majority':
        const approvedCount = requiredResponses.filter(r => r.decision === 'approved').length;
        const majorityApproved = approvedCount > (requiredResponses.length / 2);
        return {
          complete: true,
          approved: majorityApproved,
          rejectionReason: majorityApproved ? undefined : 'Majority rejection'
        };
        
      default:
        return { complete: false, approved: false };
    }
  }

  private async checkAutoApproval(request: ApprovalRequest): Promise<boolean> {
    const impact = request.impact;
    
    // Auto-approve for minimal impact changes
    return impact.timeline <= 3 && 
           impact.budget <= 1000 && 
           impact.risk === 'low';
  }

  private async checkAutoRejection(request: ApprovalRequest): Promise<boolean> {
    const impact = request.impact;
    
    // Auto-reject for extremely high impact (would need board approval)
    return impact.budget > 100000 || 
           impact.timeline > 90 ||
           impact.risk === 'critical';
  }

  private async autoApproveRequest(request: ApprovalRequest): Promise<void> {
    request.status = 'approved';
    request.finalDecision = 'approved';
    request.finalDecisionAt = new Date();
    request.finalDecisionBy = 'system';
    request.finalComments = 'Auto-approved due to minimal impact';
    
    await this.triggerImplementation(request);
    
    this.addAuditEntry(request, 'auto_approved', 'system', 'Auto-approved due to minimal impact');
    
    this.emit('approval_auto_approved', { request });
  }

  private async autoRejectRequest(request: ApprovalRequest): Promise<void> {
    request.status = 'rejected';
    request.finalDecision = 'rejected';
    request.finalDecisionAt = new Date();
    request.finalDecisionBy = 'system';
    request.finalComments = 'Auto-rejected due to excessive impact - requires board approval';
    
    this.addAuditEntry(request, 'auto_rejected', 'system', 'Auto-rejected due to excessive impact');
    
    this.emit('approval_auto_rejected', { request });
  }

  private async triggerImplementation(request: ApprovalRequest): Promise<void> {
    console.log(`✅ Triggering implementation for approved request ${request.id}`);
    
    if (request.changes.timeline) {
      // Trigger timeline implementation through automation engine
      this.emit('implement_timeline_change', {
        request,
        timelineAdjustment: request.changes.timeline
      });
    }
  }

  private determineImpactLevel(cascadeAnalysis: CascadeAnalysis): 'minimal' | 'moderate' | 'significant' | 'critical' {
    if (cascadeAnalysis.summary.riskLevel === 'critical' || cascadeAnalysis.summary.totalCostImpact > 50000) {
      return 'critical';
    } else if (cascadeAnalysis.summary.riskLevel === 'high' || cascadeAnalysis.summary.totalCostImpact > 25000) {
      return 'significant';
    } else if (cascadeAnalysis.summary.riskLevel === 'medium' || cascadeAnalysis.summary.totalCostImpact > 5000) {
      return 'moderate';
    } else {
      return 'minimal';
    }
  }

  private determinePriority(cascadeAnalysis: CascadeAnalysis): 'low' | 'medium' | 'high' | 'urgent' {
    if (cascadeAnalysis.criticalPathImpact.affected && cascadeAnalysis.summary.totalDelayDays > 30) {
      return 'urgent';
    } else if (cascadeAnalysis.criticalPathImpact.affected || cascadeAnalysis.summary.riskLevel === 'high') {
      return 'high';
    } else if (cascadeAnalysis.summary.totalCostImpact > 10000 || cascadeAnalysis.summary.totalDelayDays > 7) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private mapRiskToQuality(riskLevel: string): 'none' | 'minor' | 'moderate' | 'significant' {
    switch (riskLevel) {
      case 'critical': return 'significant';
      case 'high': return 'moderate';
      case 'medium': return 'minor';
      default: return 'none';
    }
  }

  private addAuditEntry(request: ApprovalRequest, action: string, actor: string, details: string): void {
    request.auditTrail.push({
      timestamp: new Date(),
      action,
      actor,
      details
    });
    request.updatedAt = new Date();
  }

  private async sendApprovalNotification(
    request: ApprovalRequest,
    step: ApprovalStep,
    approver: any
  ): Promise<void> {
    console.log(`📧 Sending approval notification to ${approver.email} for ${request.title}`);
  }

  private async sendCompletionNotifications(request: ApprovalRequest): Promise<void> {
    console.log(`📢 Sending completion notifications for ${request.title}`);
  }

  private scheduleReminders(request: ApprovalRequest, step: ApprovalStep): void {
    // Schedule reminder 12 hours before deadline
    const reminderTime = step.deadline.getTime() - (12 * 60 * 60 * 1000);
    if (reminderTime > Date.now()) {
      const timeout = setTimeout(() => {
        this.sendReminderNotifications(request, step);
      }, reminderTime - Date.now());
      
      this.activeWorkflows.set(`${request.id}-reminder`, timeout);
    }
  }

  private scheduleEscalation(request: ApprovalRequest, step: ApprovalStep): void {
    const escalationTime = Date.now() + (step.escalation.escalateAfterHours * 60 * 60 * 1000);
    
    const timeout = setTimeout(() => {
      this.escalateApprovalStep(request, step);
    }, escalationTime - Date.now());
    
    this.activeWorkflows.set(`${request.id}-escalation`, timeout);
  }

  private async sendReminderNotifications(request: ApprovalRequest, step: ApprovalStep): Promise<void> {
    console.log(`⏰ Sending reminder notifications for ${request.title}`);
  }

  private async escalateApprovalStep(request: ApprovalRequest, step: ApprovalStep): Promise<void> {
    step.escalation.escalated = true;
    step.escalation.escalatedAt = new Date();
    
    console.log(`🚨 Escalating approval step ${step.name} for request ${request.title}`);
    
    this.addAuditEntry(request, 'escalated', 'system', `Step "${step.name}" escalated due to timeout`);
    
    this.emit('approval_escalated', { request, step });
  }

  private async escalateApprovalRequest(request: ApprovalRequest, reason: string): Promise<void> {
    console.log(`🚨 Escalating entire approval request ${request.title}: ${reason}`);
  }

  private async rejectApprovalRequest(
    request: ApprovalRequest,
    step: ApprovalStep,
    reason?: string
  ): Promise<void> {
    await this.completeApprovalWorkflow(request, false);
  }

  private async handleDelegation(
    request: ApprovalRequest,
    step: ApprovalStep,
    approverId: string,
    delegateTo: string,
    comments: string
  ): Promise<void> {
    console.log(`👥 Handling delegation from ${approverId} to ${delegateTo} for ${request.title}`);
  }

  private initializeDefaultRules(): void {
    // Initialize default approval rules for different scenarios
    console.log('📋 Initializing default approval rules');
  }
}

export { ApprovalWorkflowEngine };