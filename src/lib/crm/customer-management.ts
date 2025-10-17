/**
 * Customer Relationship Management (CRM) System
 * Comprehensive customer management, sales pipeline, and relationship tracking
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';

export type CustomerType = 'individual' | 'business' | 'enterprise' | 'partner' | 'reseller';
export type CustomerStatus = 'lead' | 'prospect' | 'customer' | 'inactive' | 'churned';
export type LeadSource = 'website' | 'referral' | 'trade_show' | 'cold_outreach' | 'social_media' | 'advertising' | 'partner';
export type PipelineStage = 'qualified_lead' | 'discovery' | 'demo' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type InteractionType = 'email' | 'phone' | 'meeting' | 'demo' | 'support' | 'follow_up' | 'proposal' | 'contract';
export type OpportunityStatus = 'open' | 'won' | 'lost' | 'abandoned';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Customer {
  id: string;
  type: CustomerType;
  status: CustomerStatus;
  
  // Basic Information
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  website?: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Business Information
  industry?: string;
  companySize?: string;
  annualRevenue?: number;
  
  // Lead Information
  leadSource: LeadSource;
  leadScore: number;
  qualificationStatus: 'unqualified' | 'qualified' | 'disqualified';
  
  // Relationship Information
  assignedSalesRep?: string;
  accountManager?: string;
  
  // Financial Information
  creditLimit?: number;
  paymentTerms?: string;
  totalSpent: number;
  lifetimeValue: number;
  
  // Custom Fields
  customFields: Record<string, any>;
  
  // Metadata
  tags: string[];
  notes: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
}

export interface Opportunity {
  id: string;
  customerId: string;
  name: string;
  description: string;
  
  // Sales Information
  value: number;
  probability: number;
  stage: PipelineStage;
  status: OpportunityStatus;
  
  // Timeline
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  
  // Assignment
  assignedTo: string;
  
  // Products/Services
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  
  // Metadata
  tags: string[];
  notes: string;
}

export interface Interaction {
  id: string;
  customerId: string;
  opportunityId?: string;
  
  // Interaction Details
  type: InteractionType;
  subject: string;
  description: string;
  
  // Participants
  performedBy: string;
  attendees: string[];
  
  // Scheduling
  scheduledDate?: Date;
  actualDate: Date;
  duration?: number;
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  
  // Metadata
  attachments: string[];
  tags: string[];
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMTask {
  id: string;
  customerId?: string;
  opportunityId?: string;
  
  // Task Details
  title: string;
  description: string;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Assignment
  assignedTo: string;
  assignedBy: string;
  
  // Timing
  dueDate: Date;
  completedDate?: Date;
  
  // Metadata
  tags: string[];
  attachments: string[];
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesMetrics {
  totalRevenue: number;
  newCustomers: number;
  churnRate: number;
  conversionRate: number;
  averageDealSize: number;
  salesCycleLength: number;
  pipelineValue: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  monthlyRecurringRevenue: number;
  netPromoterScore: number;
  customerSatisfactionScore: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    customerType?: CustomerType[];
    industry?: string[];
    companySize?: string[];
    revenueRange?: { min: number; max: number };
    totalSpentRange?: { min: number; max: number };
    leadScore?: { min: number; max: number };
    tags?: string[];
    customFields?: Record<string, any>;
  };
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'direct_mail' | 'social' | 'advertising' | 'event';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Targeting
  targetSegments: string[];
  targetCustomers: string[];
  
  // Content
  subject?: string;
  content: string;
  attachments: string[];
  
  // Scheduling
  startDate: Date;
  endDate?: Date;
  
  // Metrics
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  convertedCount: number;
  
  // Budget
  budget: number;
  spent: number;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

class CustomerRelationshipManager extends EventEmitter {
  private facilityId: string;
  private userId: string;

  constructor(facilityId: string, userId: string) {
    super();
    this.facilityId = facilityId;
    this.userId = userId;
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const customer: Customer = {
        id: this.generateCustomerId(),
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await this.saveCustomer(customer);

      // Calculate initial lead score
      await this.calculateLeadScore(customer.id);

      // Create welcome task
      await this.createTask({
        customerId: customer.id,
        title: 'Welcome New Customer',
        description: `Follow up with ${customer.companyName || customer.firstName} ${customer.lastName}`,
        type: 'follow_up',
        priority: 'medium',
        assignedTo: customerData.assignedSalesRep || this.userId,
        assignedBy: this.userId,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        tags: ['new_customer', 'welcome'],
        attachments: []
      });

      this.emit('customer-created', customer);
      logger.info('api', `Created customer: ${customer.id}`);
      
      return customer;
    } catch (error) {
      logger.error('api', 'Failed to create customer:', error );
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    customerId: string, 
    updates: Partial<Customer>
  ): Promise<Customer> {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer) throw new Error('Customer not found');

      const updatedCustomer = {
        ...customer,
        ...updates,
        updatedAt: new Date()
      };

      await this.saveCustomer(updatedCustomer);

      // Recalculate lead score if relevant fields changed
      if (updates.leadSource || updates.customFields || updates.tags) {
        await this.calculateLeadScore(customerId);
      }

      this.emit('customer-updated', updatedCustomer);
      logger.info('api', `Updated customer: ${customerId}`);
      
      return updatedCustomer;
    } catch (error) {
      logger.error('api', 'Failed to update customer:', error );
      throw error;
    }
  }

  /**
   * Create sales opportunity
   */
  async createOpportunity(opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Opportunity> {
    try {
      const opportunity: Opportunity = {
        id: this.generateOpportunityId(),
        ...opportunityData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveOpportunity(opportunity);

      // Create follow-up task
      await this.createTask({
        customerId: opportunity.customerId,
        opportunityId: opportunity.id,
        title: `Work on ${opportunity.name}`,
        description: `Progress opportunity through ${opportunity.stage} stage`,
        type: 'sales_activity',
        priority: 'high',
        assignedTo: opportunity.assignedTo,
        assignedBy: this.userId,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        tags: ['opportunity', opportunity.stage],
        attachments: []
      });

      this.emit('opportunity-created', opportunity);
      logger.info('api', `Created opportunity: ${opportunity.id}`);
      
      return opportunity;
    } catch (error) {
      logger.error('api', 'Failed to create opportunity:', error );
      throw error;
    }
  }

  /**
   * Update opportunity stage
   */
  async updateOpportunityStage(
    opportunityId: string,
    newStage: PipelineStage,
    notes?: string
  ): Promise<Opportunity> {
    try {
      const opportunity = await this.getOpportunity(opportunityId);
      if (!opportunity) throw new Error('Opportunity not found');

      const updates: Partial<Opportunity> = {
        stage: newStage,
        updatedAt: new Date()
      };

      // Handle closed stages
      if (newStage === 'closed_won') {
        updates.status = 'won';
        updates.actualCloseDate = new Date();
      } else if (newStage === 'closed_lost') {
        updates.status = 'lost';
        updates.actualCloseDate = new Date();
      }

      if (notes) {
        updates.notes = opportunity.notes ? `${opportunity.notes}\n\n${notes}` : notes;
      }

      const updatedOpportunity = await this.updateOpportunity(opportunityId, updates);

      // Log interaction
      await this.createInteraction({
        customerId: opportunity.customerId,
        opportunityId: opportunity.id,
        type: 'follow_up',
        subject: `Stage updated to ${newStage}`,
        description: notes || `Opportunity moved to ${newStage} stage`,
        performedBy: this.userId,
        attendees: [],
        actualDate: new Date(),
        followUpRequired: newStage !== 'closed_won' && newStage !== 'closed_lost',
        attachments: [],
        tags: ['stage_update', newStage]
      });

      this.emit('opportunity-stage-updated', updatedOpportunity);
      
      return updatedOpportunity;
    } catch (error) {
      logger.error('api', 'Failed to update opportunity stage:', error );
      throw error;
    }
  }

  /**
   * Update opportunity
   */
  async updateOpportunity(
    opportunityId: string,
    updates: Partial<Opportunity>
  ): Promise<Opportunity> {
    try {
      const opportunity = await this.getOpportunity(opportunityId);
      if (!opportunity) throw new Error('Opportunity not found');

      const updatedOpportunity = {
        ...opportunity,
        ...updates,
        updatedAt: new Date()
      };

      await this.saveOpportunity(updatedOpportunity);

      this.emit('opportunity-updated', updatedOpportunity);
      logger.info('api', `Updated opportunity: ${opportunityId}`);
      
      return updatedOpportunity;
    } catch (error) {
      logger.error('api', 'Failed to update opportunity:', error );
      throw error;
    }
  }

  /**
   * Create customer interaction
   */
  async createInteraction(interactionData: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interaction> {
    try {
      const interaction: Interaction = {
        id: this.generateInteractionId(),
        ...interactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveInteraction(interaction);

      // Update customer last contact date
      await this.updateCustomer(interaction.customerId, {
        lastContactDate: new Date()
      });

      // Create follow-up task if required
      if (interaction.followUpRequired && interaction.followUpDate) {
        await this.createTask({
          customerId: interaction.customerId,
          opportunityId: interaction.opportunityId,
          title: 'Follow-up Required',
          description: interaction.followUpNotes || `Follow up on ${interaction.subject}`,
          type: 'follow_up',
          priority: 'medium',
          assignedTo: interaction.performedBy,
          assignedBy: this.userId,
          dueDate: interaction.followUpDate,
          tags: ['follow_up', interaction.type],
          attachments: []
        });
      }

      this.emit('interaction-created', interaction);
      logger.info('api', `Created interaction: ${interaction.id}`);
      
      return interaction;
    } catch (error) {
      logger.error('api', 'Failed to create interaction:', error );
      throw error;
    }
  }

  /**
   * Create CRM task
   */
  async createTask(taskData: Omit<CRMTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMTask> {
    try {
      const task: CRMTask = {
        id: this.generateTaskId(),
        ...taskData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTask(task);

      this.emit('task-created', task);
      logger.info('api', `Created task: ${task.id}`);
      
      return task;
    } catch (error) {
      logger.error('api', 'Failed to create task:', error );
      throw error;
    }
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string, notes?: string): Promise<CRMTask> {
    try {
      const task = await this.getTask(taskId);
      if (!task) throw new Error('Task not found');

      const updatedTask = {
        ...task,
        status: 'completed' as TaskStatus,
        completedDate: new Date(),
        updatedAt: new Date()
      };

      if (notes) {
        updatedTask.description = `${task.description}\n\nCompletion notes: ${notes}`;
      }

      await this.saveTask(updatedTask);

      this.emit('task-completed', updatedTask);
      logger.info('api', `Completed task: ${taskId}`);
      
      return updatedTask;
    } catch (error) {
      logger.error('api', 'Failed to complete task:', error );
      throw error;
    }
  }

  /**
   * Calculate lead score
   */
  async calculateLeadScore(customerId: string): Promise<number> {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer) throw new Error('Customer not found');

      let score = 0;

      // Company size scoring
      if (customer.companySize) {
        const sizeScores = {
          '1-10': 10,
          '11-50': 20,
          '51-100': 30,
          '101-500': 40,
          '500+': 50
        };
        score += sizeScores[customer.companySize] || 0;
      }

      // Revenue scoring
      if (customer.annualRevenue) {
        if (customer.annualRevenue > 10000000) score += 50;
        else if (customer.annualRevenue > 5000000) score += 40;
        else if (customer.annualRevenue > 1000000) score += 30;
        else if (customer.annualRevenue > 500000) score += 20;
        else score += 10;
      }

      // Lead source scoring
      const sourceScores = {
        'referral': 40,
        'website': 30,
        'trade_show': 35,
        'partner': 45,
        'social_media': 20,
        'advertising': 25,
        'cold_outreach': 15
      };
      score += sourceScores[customer.leadSource] || 0;

      // Industry scoring
      if (customer.industry) {
        const industryScores = {
          'agriculture': 50,
          'cannabis': 50,
          'hydroponics': 45,
          'research': 40,
          'technology': 35
        };
        score += industryScores[customer.industry] || 20;
      }

      // Interaction scoring
      const interactions = await this.getCustomerInteractions(customerId);
      score += Math.min(interactions.length * 5, 25);

      // Engagement scoring
      const recentInteractions = interactions.filter(
        i => i.actualDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      score += Math.min(recentInteractions.length * 10, 30);

      // Cap score at 100
      const finalScore = Math.min(score, 100);

      // Update customer
      await this.updateCustomer(customerId, { leadScore: finalScore });

      return finalScore;
    } catch (error) {
      logger.error('api', 'Failed to calculate lead score:', error );
      throw error;
    }
  }

  /**
   * Create customer segment
   */
  async createSegment(segmentData: Omit<CustomerSegment, 'id' | 'customerCount' | 'createdAt' | 'updatedAt'>): Promise<CustomerSegment> {
    try {
      const segment: CustomerSegment = {
        id: this.generateSegmentId(),
        ...segmentData,
        customerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate customer count
      segment.customerCount = await this.getSegmentCustomerCount(segment.criteria);

      await this.saveSegment(segment);

      this.emit('segment-created', segment);
      logger.info('api', `Created segment: ${segment.id}`);
      
      return segment;
    } catch (error) {
      logger.error('api', 'Failed to create segment:', error );
      throw error;
    }
  }

  /**
   * Create marketing campaign
   */
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'convertedCount' | 'spent' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    try {
      const campaign: Campaign = {
        id: this.generateCampaignId(),
        ...campaignData,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        convertedCount: 0,
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveCampaign(campaign);

      this.emit('campaign-created', campaign);
      logger.info('api', `Created campaign: ${campaign.id}`);
      
      return campaign;
    } catch (error) {
      logger.error('api', 'Failed to create campaign:', error );
      throw error;
    }
  }

  /**
   * Get sales metrics
   */
  async getSalesMetrics(startDate: Date, endDate: Date): Promise<SalesMetrics> {
    try {
      const opportunities = await this.getOpportunitiesInDateRange(startDate, endDate);
      const customers = await this.getCustomersInDateRange(startDate, endDate);
      const interactions = await this.getInteractionsInDateRange(startDate, endDate);

      const wonOpportunities = opportunities.filter(o => o.status === 'won');
      const totalRevenue = wonOpportunities.reduce((sum, o) => sum + o.value, 0);
      const averageDealSize = wonOpportunities.length > 0 ? totalRevenue / wonOpportunities.length : 0;

      const pipelineValue = opportunities
        .filter(o => o.status === 'open')
        .reduce((sum, o) => sum + o.value, 0);

      // Calculate conversion rate
      const totalOpportunities = opportunities.length;
      const conversionRate = totalOpportunities > 0 ? (wonOpportunities.length / totalOpportunities) * 100 : 0;

      // Calculate average sales cycle
      const closedOpportunities = opportunities.filter(o => o.actualCloseDate);
      const salesCycleLength = closedOpportunities.length > 0 
        ? closedOpportunities.reduce((sum, o) => {
            const cycle = (o.actualCloseDate!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + cycle;
          }, 0) / closedOpportunities.length
        : 0;

      return {
        totalRevenue,
        newCustomers: customers.length,
        churnRate: 0, // TODO: Calculate based on customer status changes
        conversionRate,
        averageDealSize,
        salesCycleLength,
        pipelineValue,
        customerLifetimeValue: 0, // TODO: Calculate based on historical data
        customerAcquisitionCost: 0, // TODO: Calculate based on marketing spend
        monthlyRecurringRevenue: 0, // TODO: Calculate based on subscription data
        netPromoterScore: 0, // TODO: Calculate based on survey data
        customerSatisfactionScore: 0 // TODO: Calculate based on survey data
      };
    } catch (error) {
      logger.error('api', 'Failed to get sales metrics:', error );
      throw error;
    }
  }

  /**
   * Get customer pipeline
   */
  async getCustomerPipeline(): Promise<Record<PipelineStage, Opportunity[]>> {
    try {
      const opportunities = await this.getAllOpportunities();
      const pipeline: Record<PipelineStage, Opportunity[]> = {
        qualified_lead: [],
        discovery: [],
        demo: [],
        proposal: [],
        negotiation: [],
        closed_won: [],
        closed_lost: []
      };

      opportunities.forEach(opportunity => {
        pipeline[opportunity.stage].push(opportunity);
      });

      return pipeline;
    } catch (error) {
      logger.error('api', 'Failed to get customer pipeline:', error );
      throw error;
    }
  }

  /**
   * Get customer insights
   */
  async getCustomerInsights(customerId: string): Promise<{
    totalSpent: number;
    lifetimeValue: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    lastPurchaseDate?: Date;
    preferredProducts: string[];
    interactionHistory: Interaction[];
    opportunities: Opportunity[];
    tasks: CRMTask[];
    recommendedActions: string[];
  }> {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer) throw new Error('Customer not found');

      const interactions = await this.getCustomerInteractions(customerId);
      const opportunities = await this.getCustomerOpportunities(customerId);
      const tasks = await this.getCustomerTasks(customerId);

      const wonOpportunities = opportunities.filter(o => o.status === 'won');
      const totalSpent = wonOpportunities.reduce((sum, o) => sum + o.value, 0);
      const averageOrderValue = wonOpportunities.length > 0 ? totalSpent / wonOpportunities.length : 0;

      const recommendations = [];
      
      // Generate recommendations based on customer data
      if (customer.leadScore > 80) {
        recommendations.push('High-quality lead - prioritize for immediate follow-up');
      }
      
      if (interactions.length === 0) {
        recommendations.push('No recent interactions - schedule follow-up call');
      }
      
      if (opportunities.length === 0) {
        recommendations.push('No active opportunities - create new opportunity');
      }

      const pendingTasks = tasks.filter(t => t.status === 'pending');
      if (pendingTasks.length > 0) {
        recommendations.push(`${pendingTasks.length} pending tasks - review and prioritize`);
      }

      return {
        totalSpent,
        lifetimeValue: customer.lifetimeValue,
        averageOrderValue,
        purchaseFrequency: wonOpportunities.length,
        lastPurchaseDate: wonOpportunities.length > 0 
          ? new Date(Math.max(...wonOpportunities.map(o => o.actualCloseDate?.getTime() || 0)))
          : undefined,
        preferredProducts: [], // TODO: Calculate based on purchase history
        interactionHistory: interactions.sort((a, b) => b.actualDate.getTime() - a.actualDate.getTime()),
        opportunities,
        tasks,
        recommendedActions: recommendations
      };
    } catch (error) {
      logger.error('api', 'Failed to get customer insights:', error );
      throw error;
    }
  }

  // Database operations

  private async saveCustomer(customer: Customer): Promise<void> {
    await prisma.customer.upsert({
      where: { id: customer.id },
      create: customer,
      update: customer
    });
  }

  private async getCustomer(customerId: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { id: customerId }
    });
  }

  private async saveOpportunity(opportunity: Opportunity): Promise<void> {
    await prisma.opportunity.upsert({
      where: { id: opportunity.id },
      create: opportunity,
      update: opportunity
    });
  }

  private async getOpportunity(opportunityId: string): Promise<Opportunity | null> {
    return await prisma.opportunity.findUnique({
      where: { id: opportunityId }
    });
  }

  private async saveInteraction(interaction: Interaction): Promise<void> {
    await prisma.customerInteraction.upsert({
      where: { id: interaction.id },
      create: interaction,
      update: interaction
    });
  }

  private async saveTask(task: CRMTask): Promise<void> {
    await prisma.crmTask.upsert({
      where: { id: task.id },
      create: task,
      update: task
    });
  }

  private async getTask(taskId: string): Promise<CRMTask | null> {
    return await prisma.crmTask.findUnique({
      where: { id: taskId }
    });
  }

  private async saveSegment(segment: CustomerSegment): Promise<void> {
    await prisma.customerSegment.upsert({
      where: { id: segment.id },
      create: segment,
      update: segment
    });
  }

  private async saveCampaign(campaign: Campaign): Promise<void> {
    await prisma.marketingCampaign.upsert({
      where: { id: campaign.id },
      create: campaign,
      update: campaign
    });
  }

  private async getCustomerInteractions(customerId: string): Promise<Interaction[]> {
    return await prisma.customerInteraction.findMany({
      where: { customerId },
      orderBy: { actualDate: 'desc' }
    });
  }

  private async getCustomerOpportunities(customerId: string): Promise<Opportunity[]> {
    return await prisma.opportunity.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getCustomerTasks(customerId: string): Promise<CRMTask[]> {
    return await prisma.crmTask.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getAllOpportunities(): Promise<Opportunity[]> {
    return await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getOpportunitiesInDateRange(startDate: Date, endDate: Date): Promise<Opportunity[]> {
    return await prisma.opportunity.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getCustomersInDateRange(startDate: Date, endDate: Date): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getInteractionsInDateRange(startDate: Date, endDate: Date): Promise<Interaction[]> {
    return await prisma.customerInteraction.findMany({
      where: {
        actualDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getSegmentCustomerCount(criteria: CustomerSegment['criteria']): Promise<number> {
    const whereClause: any = {};

    if (criteria.customerType) {
      whereClause.type = { in: criteria.customerType };
    }

    if (criteria.industry) {
      whereClause.industry = { in: criteria.industry };
    }

    if (criteria.companySize) {
      whereClause.companySize = { in: criteria.companySize };
    }

    if (criteria.revenueRange) {
      whereClause.annualRevenue = {
        gte: criteria.revenueRange.min,
        lte: criteria.revenueRange.max
      };
    }

    if (criteria.totalSpentRange) {
      whereClause.totalSpent = {
        gte: criteria.totalSpentRange.min,
        lte: criteria.totalSpentRange.max
      };
    }

    if (criteria.leadScore) {
      whereClause.leadScore = {
        gte: criteria.leadScore.min,
        lte: criteria.leadScore.max
      };
    }

    return await prisma.customer.count({ where: whereClause });
  }

  // ID generators
  private generateCustomerId(): string {
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOpportunityId(): string {
    return `opportunity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInteractionId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSegmentId(): string {
    return `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCampaignId(): string {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { CustomerRelationshipManager };
export default CustomerRelationshipManager;