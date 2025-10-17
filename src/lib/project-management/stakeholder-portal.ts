/**
 * Stakeholder Portal Integration
 * Allows suppliers, contractors, and vendors to directly update project timelines
 */

import { EventEmitter } from 'events';
import { TimelineAutomationEngine, TimelineUpdate } from './timeline-automation';
import type { Project, Stakeholder } from './project-types';

export interface StakeholderPortalUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'supplier' | 'contractor' | 'vendor' | 'consultant' | 'client';
  
  // Authentication
  auth: {
    apiKey: string;
    lastLogin: Date;
    isActive: boolean;
    twoFactorEnabled: boolean;
  };
  
  // Permissions
  permissions: {
    canUpdateTimelines: boolean;
    canViewFinancials: boolean;
    canDownloadDocuments: boolean;
    canSubmitDeliverables: boolean;
    maxBudgetImpact: number; // Max $ impact they can cause without approval
    maxDelayDays: number; // Max days delay they can cause without approval
  };
  
  // Integration
  integration: {
    erpSystemId?: string;
    supplierPortalUrl?: string;
    webhookEndpoint?: string;
    apiCredentials?: {
      username: string;
      password: string;
      endpoint: string;
    };
  };
  
  // Products/Services
  capabilities: {
    productCategories: string[];
    serviceTypes: string[];
    geographicCoverage: string[];
    certifications: string[];
  };
  
  // Performance
  metrics: {
    onTimeDeliveryRate: number;
    qualityScore: number;
    communicationScore: number;
    reliabilityScore: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PortalUpdate {
  id: string;
  userId: string;
  projectId: string;
  updateType: 'delivery_schedule' | 'lead_time' | 'availability' | 'pricing' | 'quality_issue' | 'scope_change';
  
  // Timeline Changes
  timelineChanges: Array<{
    itemId: string;
    itemName: string;
    itemType: 'fixture' | 'equipment' | 'material' | 'service';
    currentSchedule: {
      startDate: Date;
      endDate: Date;
      quantity: number;
    };
    proposedSchedule: {
      startDate: Date;
      endDate: Date;
      quantity: number;
    };
    reason: string;
    alternatives?: Array<{
      description: string;
      timeline: { startDate: Date; endDate: Date };
      costImpact: number;
      qualityImpact: string;
    }>;
  }>;
  
  // Additional Information
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  documentation: Array<{
    filename: string;
    url: string;
    type: 'pdf' | 'image' | 'document' | 'email';
  }>;
  
  // Status
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  reviewComments?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  triggers: Array<{
    event: string;
    conditions: Record<string, any>;
  }>;
  recipients: Array<{
    type: 'stakeholder' | 'role' | 'email';
    identifier: string;
  }>;
  channels: Array<{
    type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook';
    endpoint?: string;
    template?: string;
  }>;
  enabled: boolean;
}

export class StakeholderPortalEngine extends EventEmitter {
  private portalUsers: Map<string, StakeholderPortalUser> = new Map();
  private pendingUpdates: Map<string, PortalUpdate> = new Map();
  private notificationRules: Map<string, NotificationRule> = new Map();
  private timelineEngine: TimelineAutomationEngine;
  
  constructor(timelineEngine: TimelineAutomationEngine) {
    super();
    this.timelineEngine = timelineEngine;
    this.initializeNotificationRules();
  }

  /**
   * Register a new stakeholder portal user (e.g., lighting manufacturer)
   */
  async registerStakeholder(stakeholder: Partial<StakeholderPortalUser>): Promise<StakeholderPortalUser> {
    const user: StakeholderPortalUser = {
      id: stakeholder.id || `stakeholder-${Date.now()}`,
      name: stakeholder.name || '',
      email: stakeholder.email || '',
      company: stakeholder.company || '',
      role: stakeholder.role || 'supplier',
      
      auth: {
        apiKey: this.generateApiKey(),
        lastLogin: new Date(),
        isActive: true,
        twoFactorEnabled: false
      },
      
      permissions: {
        canUpdateTimelines: true,
        canViewFinancials: stakeholder.role === 'client',
        canDownloadDocuments: true,
        canSubmitDeliverables: true,
        maxBudgetImpact: stakeholder.role === 'supplier' ? 25000 : 50000,
        maxDelayDays: stakeholder.role === 'supplier' ? 30 : 60
      },
      
      integration: stakeholder.integration || {},
      
      capabilities: {
        productCategories: stakeholder.role === 'supplier' ? ['lighting', 'electrical'] : [],
        serviceTypes: stakeholder.role === 'contractor' ? ['installation', 'maintenance'] : [],
        geographicCoverage: ['North America'],
        certifications: ['UL', 'CE']
      },
      
      metrics: {
        onTimeDeliveryRate: 0.95,
        qualityScore: 0.92,
        communicationScore: 0.88,
        reliabilityScore: 0.90
      },
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.portalUsers.set(user.id, user);
    
    await this.sendWelcomeNotification(user);
    
    this.emit('stakeholder_registered', { user });
    
    return user;
  }

  /**
   * Submit timeline update (e.g., "fixtures will take 26 weeks instead of 10")
   */
  async submitTimelineUpdate(
    userId: string,
    projectId: string,
    updateData: Partial<PortalUpdate>
  ): Promise<PortalUpdate> {
    
    const user = this.portalUsers.get(userId);
    if (!user) {
      throw new Error('Stakeholder not found');
    }

    if (!user.permissions.canUpdateTimelines) {
      throw new Error('User does not have permission to update timelines');
    }

    const update: PortalUpdate = {
      id: `update-${Date.now()}`,
      userId,
      projectId,
      updateType: updateData.updateType || 'delivery_schedule',
      timelineChanges: updateData.timelineChanges || [],
      priority: updateData.priority || 'medium',
      reason: updateData.reason || '',
      documentation: updateData.documentation || [],
      status: 'submitted',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate update doesn't exceed user permissions
    const impact = await this.calculateUpdateImpact(update);
    
    if (impact.budgetImpact > user.permissions.maxBudgetImpact ||
        impact.delayDays > user.permissions.maxDelayDays) {
      update.status = 'under_review';
      await this.escalateForApproval(update, impact);
    } else {
      // Auto-approve within limits
      update.status = 'approved';
      await this.processApprovedUpdate(update);
    }

    this.pendingUpdates.set(update.id, update);
    
    // Send notifications
    await this.notifyProjectTeam(update);
    
    this.emit('timeline_update_submitted', { update, user });
    
    return update;
  }

  /**
   * Example: Fluence updates LED fixture delivery from 10 to 26 weeks
   */
  async handleManufacturerDelayUpdate(
    manufacturerId: string,
    projectId: string,
    fixtureDetails: Array<{
      fixtureId: string;
      model: string;
      quantity: number;
      originalDeliveryWeeks: number;
      newDeliveryWeeks: number;
      reason: string;
    }>
  ): Promise<PortalUpdate> {
    
    const timelineChanges = fixtureDetails.map(fixture => ({
      itemId: fixture.fixtureId,
      itemName: `${fixture.model} LED Fixtures (${fixture.quantity} units)`,
      itemType: 'fixture' as const,
      currentSchedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + fixture.originalDeliveryWeeks * 7 * 24 * 60 * 60 * 1000),
        quantity: fixture.quantity
      },
      proposedSchedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + fixture.newDeliveryWeeks * 7 * 24 * 60 * 60 * 1000),
        quantity: fixture.quantity
      },
      reason: fixture.reason,
      alternatives: [
        {
          description: 'Partial delivery - 50% at week 16, 50% at week 26',
          timeline: { 
            startDate: new Date(), 
            endDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000) 
          },
          costImpact: 2500,
          qualityImpact: 'No impact on quality'
        },
        {
          description: 'Alternative supplier with 18-week delivery',
          timeline: { 
            startDate: new Date(), 
            endDate: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000) 
          },
          costImpact: 8000,
          qualityImpact: 'Similar specifications, 95% compatibility'
        }
      ]
    }));

    return await this.submitTimelineUpdate(manufacturerId, projectId, {
      updateType: 'delivery_schedule',
      timelineChanges,
      priority: 'high',
      reason: 'Supply chain delays due to component shortages',
      documentation: [
        {
          filename: 'supply_chain_analysis.pdf',
          url: '/documents/supply_chain_analysis.pdf',
          type: 'pdf'
        }
      ]
    });
  }

  /**
   * Process approved timeline update through the automation engine
   */
  private async processApprovedUpdate(update: PortalUpdate): Promise<void> {
    console.log(`✅ Processing approved update ${update.id}`);
    
    // Convert portal update to timeline automation format
    const timelineUpdate: TimelineUpdate = {
      id: `timeline-${update.id}`,
      projectId: update.projectId,
      stakeholderId: update.userId,
      updateType: 'lead_time_change',
      affectedItems: update.timelineChanges.map(change => ({
        itemId: change.itemId,
        itemType: change.itemType,
        previousLeadTime: this.calculateDays(change.currentSchedule.startDate, change.currentSchedule.endDate),
        newLeadTime: this.calculateDays(change.proposedSchedule.startDate, change.proposedSchedule.endDate),
        impactLevel: this.determineImpactLevel(change)
      })),
      reason: update.reason,
      updatedBy: update.userId,
      updatedAt: new Date(),
      approvalRequired: false // Already approved
    };

    // Process through timeline automation engine
    // This will trigger cascade calculations and project rearrangement
    const project = await this.getProject(update.projectId);
    await this.timelineEngine.processStakeholderUpdate(project, timelineUpdate);
    
    // Update portal update status
    update.status = 'implemented';
    update.updatedAt = new Date();
    
    // Send success notification
    await this.sendImplementationNotification(update);
  }

  /**
   * Calculate impact of update for approval workflow
   */
  private async calculateUpdateImpact(update: PortalUpdate): Promise<{
    delayDays: number;
    budgetImpact: number;
    criticalPathAffected: boolean;
  }> {
    
    let maxDelayDays = 0;
    let totalBudgetImpact = 0;
    
    for (const change of update.timelineChanges) {
      const currentDays = this.calculateDays(change.currentSchedule.startDate, change.currentSchedule.endDate);
      const proposedDays = this.calculateDays(change.proposedSchedule.startDate, change.proposedSchedule.endDate);
      const delayDays = proposedDays - currentDays;
      
      maxDelayDays = Math.max(maxDelayDays, delayDays);
      
      // Estimate budget impact (storage, expediting, labor costs, etc.)
      if (delayDays > 0) {
        totalBudgetImpact += delayDays * 200; // $200 per day delay per item
      }
    }
    
    return {
      delayDays: maxDelayDays,
      budgetImpact: totalBudgetImpact,
      criticalPathAffected: update.priority === 'high' || update.priority === 'urgent'
    };
  }

  /**
   * Escalate update for management approval
   */
  private async escalateForApproval(update: PortalUpdate, impact: any): Promise<void> {
    console.log(`🚨 Escalating update ${update.id} for approval - Impact: ${impact.delayDays} days, $${impact.budgetImpact}`);
    
    const escalationMessage = `
🚨 TIMELINE UPDATE REQUIRES APPROVAL

Stakeholder: ${this.portalUsers.get(update.userId)?.company}
Project: ${update.projectId}
Impact: ${impact.delayDays} days delay, $${impact.budgetImpact.toLocaleString()} budget impact

Changes:
${update.timelineChanges.map(change => 
  `• ${change.itemName}: ${change.currentSchedule.endDate.toDateString()} → ${change.proposedSchedule.endDate.toDateString()}`
).join('\n')}

Reason: ${update.reason}

Alternatives Provided: ${update.timelineChanges[0]?.alternatives?.length || 0}

Action Required: Review and approve/reject within 24 hours
    `.trim();

    await this.sendEscalationNotification(update, escalationMessage);
    
    this.emit('update_escalated', { update, impact });
  }

  /**
   * Send notifications to project team about timeline update
   */
  private async notifyProjectTeam(update: PortalUpdate): Promise<void> {
    const user = this.portalUsers.get(update.userId);
    const urgencyLevel = update.priority === 'urgent' ? '🚨 URGENT' : 
                        update.priority === 'high' ? '⚠️ HIGH PRIORITY' : 
                        '📋 UPDATE';
    
    const message = `
${urgencyLevel}: Timeline Update from ${user?.company}

Project: ${update.projectId}
Update Type: ${update.updateType}
Status: ${update.status}

Summary:
${update.timelineChanges.map(change => 
  `• ${change.itemName}: ${this.calculateDays(change.currentSchedule.startDate, change.currentSchedule.endDate)} days → ${this.calculateDays(change.proposedSchedule.startDate, change.proposedSchedule.endDate)} days`
).join('\n')}

Reason: ${update.reason}

${update.status === 'approved' ? '✅ Auto-approved and processing...' : 
  update.status === 'under_review' ? '⏳ Under review - approval required' : 
  '📝 Submitted for processing'}
    `.trim();

    // Send to project stakeholders based on notification rules
    await this.broadcastNotification('timeline_update', {
      projectId: update.projectId,
      message,
      priority: update.priority,
      source: user?.company
    });
  }

  /**
   * API endpoint for external systems to submit updates
   */
  async apiSubmitUpdate(apiKey: string, updateData: any): Promise<PortalUpdate> {
    // Find user by API key
    const user = Array.from(this.portalUsers.values()).find(u => u.auth.apiKey === apiKey);
    
    if (!user || !user.auth.isActive) {
      throw new Error('Invalid API key or inactive user');
    }

    // Update last login
    user.auth.lastLogin = new Date();
    
    return await this.submitTimelineUpdate(user.id, updateData.projectId, updateData);
  }

  /**
   * Webhook handler for ERP system integration
   */
  async handleERPWebhook(payload: any): Promise<void> {
    console.log('📡 Received ERP webhook:', payload);
    
    // Parse ERP-specific payload format
    if (payload.event === 'delivery_date_changed') {
      await this.handleDeliveryDateChange(payload);
    } else if (payload.event === 'order_delayed') {
      await this.handleOrderDelay(payload);
    }
  }

  private async handleDeliveryDateChange(payload: any): Promise<void> {
    // Convert ERP payload to portal update format
    const updateData = {
      updateType: 'delivery_schedule' as const,
      timelineChanges: [{
        itemId: payload.itemId,
        itemName: payload.itemName,
        itemType: payload.itemType,
        currentSchedule: {
          startDate: new Date(payload.originalDate),
          endDate: new Date(payload.originalDate),
          quantity: payload.quantity
        },
        proposedSchedule: {
          startDate: new Date(payload.newDate),
          endDate: new Date(payload.newDate),
          quantity: payload.quantity
        },
        reason: payload.reason || 'ERP system update'
      }],
      priority: 'medium' as const,
      reason: payload.reason || 'Delivery date updated in ERP system'
    };

    // Find user by ERP system ID
    const user = Array.from(this.portalUsers.values()).find(u => 
      u.integration.erpSystemId === payload.supplierId
    );

    if (user) {
      await this.submitTimelineUpdate(user.id, payload.projectId, updateData);
    }
  }

  private generateApiKey(): string {
    return 'vbx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private calculateDays(startDate: Date, endDate: Date): number {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  private determineImpactLevel(change: any): 'low' | 'medium' | 'high' | 'critical' {
    const delayDays = this.calculateDays(change.currentSchedule.endDate, change.proposedSchedule.endDate);
    
    if (delayDays > 60) return 'critical';
    if (delayDays > 30) return 'high';
    if (delayDays > 7) return 'medium';
    return 'low';
  }

  private async getProject(projectId: string): Promise<Project> {
    // In real implementation, fetch from database
    return {} as Project;
  }

  private async sendWelcomeNotification(user: StakeholderPortalUser): Promise<void> {
    console.log(`👋 Welcome notification sent to ${user.email}`);
  }

  private async sendImplementationNotification(update: PortalUpdate): Promise<void> {
    console.log(`✅ Implementation notification sent for update ${update.id}`);
  }

  private async sendEscalationNotification(update: PortalUpdate, message: string): Promise<void> {
    console.log(`🚨 Escalation notification: ${message}`);
  }

  private async broadcastNotification(type: string, data: any): Promise<void> {
    console.log(`📢 Broadcasting ${type} notification:`, data);
  }

  private initializeNotificationRules(): void {
    // Default notification rules for common scenarios
    this.notificationRules.set('critical_delay', {
      id: 'critical_delay',
      name: 'Critical Project Delay',
      description: 'Notify when delays exceed 30 days or $25k impact',
      triggers: [{
        event: 'timeline_update_submitted',
        conditions: { delayDays: { $gt: 30 }, budgetImpact: { $gt: 25000 } }
      }],
      recipients: [
        { type: 'role', identifier: 'project_manager' },
        { type: 'role', identifier: 'client' }
      ],
      channels: [
        { type: 'email', template: 'critical_delay_template' },
        { type: 'sms' }
      ],
      enabled: true
    });
  }

  private async handleOrderDelay(payload: any): Promise<void> {
    console.log('📦 Handling order delay from ERP:', payload);
  }
}

export { StakeholderPortalEngine };