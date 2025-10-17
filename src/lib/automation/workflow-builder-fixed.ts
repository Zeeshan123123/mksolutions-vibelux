/**
 * Workflow Builder with Production Database Models
 * Automation workflow engine for VibeLux platform
 */

import { EventEmitter } from 'events';
import cron from 'node-cron';
import { logger } from '../logging/production-logger';
import prisma from '../db/production-setup';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  config: Record<string, any>;
  connections: string[]; // Next node IDs
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  category: string;
  nodes: WorkflowNode[];
  variables: Record<string, any>;
  triggers: Record<string, any>;
  enabled: boolean;
  schedule?: string;
  lastRunAt?: Date;
  runCount: number;
  errorCount: number;
  avgExecutionTime?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  context: Record<string, any>;
  logs: Array<{ timestamp: Date; level: string; message: string; data?: any }>;
  error?: string;
}

export class WorkflowBuilder extends EventEmitter {
  private runningWorkflows: Map<string, cron.ScheduledTask> = new Map();
  
  constructor() {
    super();
    this.initializeScheduledWorkflows();
  }
  
  /**
   * Initialize all scheduled workflows on startup
   */
  private async initializeScheduledWorkflows() {
    try {
      const workflows = await prisma.workflow.findMany({
        where: { 
          enabled: true,
          schedule: { not: null }
        }
      });
      
      for (const workflow of workflows) {
        if (workflow.schedule) {
          this.scheduleWorkflow(workflow.id, workflow.schedule);
        }
      }
      
      logger.info('workflow', `Initialized ${workflows.length} scheduled workflows`);
    } catch (error) {
      logger.error('workflow', 'Failed to initialize workflows', error as Error);
    }
  }
  
  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'lastRunAt' | 'runCount' | 'errorCount' | 'avgExecutionTime'>): Promise<Workflow> {
    const created = await prisma.workflow.create({
      data: {
        name: workflow.name,
        description: workflow.description,
        category: workflow.category,
        nodes: workflow.nodes as any,
        variables: workflow.variables,
        triggers: workflow.triggers,
        enabled: workflow.enabled,
        schedule: workflow.schedule
      }
    });
    
    if (created.enabled && created.schedule) {
      this.scheduleWorkflow(created.id, created.schedule);
    }
    
    this.emit('workflowCreated', created);
    
    return this.dbWorkflowToWorkflow(created);
  }
  
  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        name: updates.name,
        description: updates.description,
        category: updates.category,
        nodes: updates.nodes as any,
        variables: updates.variables,
        triggers: updates.triggers,
        enabled: updates.enabled,
        schedule: updates.schedule
      }
    });
    
    // Reschedule if needed
    if (updates.enabled !== undefined || updates.schedule !== undefined) {
      await this.rescheduleWorkflow(updated.id, updated.schedule || null, updated.enabled);
    }
    
    return this.dbWorkflowToWorkflow(updated);
  }
  
  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, context: Record<string, any> = {}): Promise<WorkflowExecution> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running',
        startTime: new Date(),
        context: { ...(workflow.variables as any), ...context },
        logs: []
      }
    });
    
    const executionData: WorkflowExecution = {
      id: execution.id,
      workflowId: execution.workflowId,
      status: 'running',
      startTime: execution.startTime,
      context: execution.context as any,
      logs: []
    };
    
    try {
      // Find trigger node
      const nodes = workflow.nodes as WorkflowNode[];
      const triggerNode = nodes.find(n => n.type === 'trigger');
      
      if (!triggerNode) {
        throw new Error('No trigger node found');
      }
      
      // Execute workflow
      await this.executeNode(this.dbWorkflowToWorkflow(workflow), triggerNode, executionData);
      
      // Update execution status
      executionData.status = 'completed';
      executionData.endTime = new Date();
      executionData.duration = executionData.endTime.getTime() - executionData.startTime.getTime();
      
      // Update workflow stats
      await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
          avgExecutionTime: executionData.duration
        }
      });
      
    } catch (error) {
      executionData.status = 'failed';
      executionData.error = error instanceof Error ? error.message : 'Unknown error';
      executionData.endTime = new Date();
      executionData.duration = executionData.endTime.getTime() - executionData.startTime.getTime();
      
      // Update error count
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { errorCount: { increment: 1 } }
      });
      
      this.logExecution(executionData, 'error', 'Workflow execution failed', { error: executionData.error });
    }
    
    // Save final execution state
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: executionData.status,
        endTime: executionData.endTime,
        duration: executionData.duration,
        logs: executionData.logs as any,
        error: executionData.error
      }
    });
    
    return executionData;
  }
  
  /**
   * Execute a single node in the workflow
   */
  private async executeNode(
    workflow: Workflow,
    node: WorkflowNode,
    execution: WorkflowExecution
  ): Promise<void> {
    this.logExecution(execution, 'info', `Executing node: ${node.id}`, { type: node.type });
    
    try {
      switch (node.type) {
        case 'trigger':
          // Trigger nodes just pass through
          break;
          
        case 'condition':
          const result = await this.evaluateCondition(node.config, execution.context);
          if (!result) {
            this.logExecution(execution, 'info', 'Condition not met, stopping branch');
            return;
          }
          break;
          
        case 'delay':
          const delay = node.config.duration || 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          break;
          
        case 'action':
          await this.executeAction(node.config, execution);
          break;
      }
      
      // Execute connected nodes
      for (const nextNodeId of node.connections) {
        const nextNode = workflow.nodes.find(n => n.id === nextNodeId);
        if (nextNode) {
          await this.executeNode(workflow, nextNode, execution);
        }
      }
      
    } catch (error) {
      this.logExecution(execution, 'error', `Node execution failed: ${node.id}`, { error });
      throw error;
    }
  }
  
  /**
   * Evaluate a condition node
   */
  private async evaluateCondition(config: any, context: Record<string, any>): Promise<boolean> {
    const { field, operator, value } = config;
    const fieldValue = this.getNestedValue(context, field);
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return false;
    }
  }
  
  /**
   * Execute an action node
   */
  private async executeAction(config: any, execution: WorkflowExecution): Promise<void> {
    const { actionType, parameters } = config;
    
    switch (actionType) {
      case 'send_notification':
        await this.sendNotification(parameters, execution);
        break;
        
      case 'update_database':
        await this.updateDatabase(parameters, execution);
        break;
        
      case 'control_equipment':
        await this.controlEquipment(parameters, execution);
        break;
        
      case 'log_data':
        this.logExecution(execution, 'info', 'Data logged', parameters);
        break;
        
      case 'webhook':
        await this.callWebhook(parameters, execution);
        break;
        
      default:
        this.logExecution(execution, 'warn', `Unknown action type: ${actionType}`);
    }
  }
  
  /**
   * Send a notification
   */
  private async sendNotification(params: any, execution: WorkflowExecution): Promise<void> {
    this.logExecution(execution, 'info', 'Sending notification', params);
    
    // Integration with notification service would go here
    this.emit('notification', {
      workflowId: execution.workflowId,
      executionId: execution.id,
      ...params
    });
  }
  
  /**
   * Update database based on workflow action
   */
  private async updateDatabase(params: any, execution: WorkflowExecution): Promise<void> {
    this.logExecution(execution, 'info', 'Updating database', params);
    
    // Database updates would be performed here based on params
    // This is a placeholder for actual database operations
  }
  
  /**
   * Control equipment through workflow
   */
  private async controlEquipment(params: any, execution: WorkflowExecution): Promise<void> {
    this.logExecution(execution, 'info', 'Controlling equipment', params);
    
    // Equipment control integration would go here
    this.emit('equipmentControl', {
      workflowId: execution.workflowId,
      executionId: execution.id,
      ...params
    });
  }
  
  /**
   * Call an external webhook
   */
  private async callWebhook(params: any, execution: WorkflowExecution): Promise<void> {
    const { url, method = 'POST', headers = {}, body } = params;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
      
      this.logExecution(execution, 'info', 'Webhook called successfully', { url, status: response.status });
    } catch (error) {
      this.logExecution(execution, 'error', 'Webhook failed', { url, error });
      throw error;
    }
  }
  
  /**
   * Schedule a workflow
   */
  private scheduleWorkflow(workflowId: string, schedule: string) {
    // Remove existing schedule if any
    const existing = this.runningWorkflows.get(workflowId);
    if (existing) {
      existing.stop();
      this.runningWorkflows.delete(workflowId);
    }
    
    // Create new schedule
    const task = cron.schedule(schedule, async () => {
      try {
        await this.executeWorkflow(workflowId);
      } catch (error) {
        logger.error('workflow', `Scheduled execution failed for ${workflowId}`, error as Error);
      }
    });
    
    this.runningWorkflows.set(workflowId, task);
    logger.info('workflow', `Workflow ${workflowId} scheduled: ${schedule}`);
  }
  
  /**
   * Reschedule a workflow
   */
  private async rescheduleWorkflow(workflowId: string, schedule: string | null, enabled: boolean) {
    const existing = this.runningWorkflows.get(workflowId);
    if (existing) {
      existing.stop();
      this.runningWorkflows.delete(workflowId);
    }
    
    if (enabled && schedule) {
      this.scheduleWorkflow(workflowId, schedule);
    }
  }
  
  /**
   * Log to execution
   */
  private logExecution(
    execution: WorkflowExecution,
    level: string,
    message: string,
    data?: any
  ) {
    const log = {
      timestamp: new Date(),
      level,
      message,
      data
    };
    
    execution.logs.push(log);
    logger.info('workflow', `[${execution.id}] ${message}`, data);
  }
  
  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  /**
   * Convert database workflow to Workflow interface
   */
  private dbWorkflowToWorkflow(dbWorkflow: any): Workflow {
    return {
      id: dbWorkflow.id,
      name: dbWorkflow.name,
      description: dbWorkflow.description,
      category: dbWorkflow.category,
      nodes: dbWorkflow.nodes as WorkflowNode[],
      variables: dbWorkflow.variables as Record<string, any>,
      triggers: dbWorkflow.triggers as Record<string, any>,
      enabled: dbWorkflow.enabled,
      schedule: dbWorkflow.schedule,
      lastRunAt: dbWorkflow.lastRunAt,
      runCount: dbWorkflow.runCount,
      errorCount: dbWorkflow.errorCount,
      avgExecutionTime: dbWorkflow.avgExecutionTime
    };
  }
  
  /**
   * Get all workflows
   */
  async getWorkflows(category?: string): Promise<Workflow[]> {
    const workflows = await prisma.workflow.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    
    return workflows.map(w => this.dbWorkflowToWorkflow(w));
  }
  
  /**
   * Get workflow execution history
   */
  async getExecutionHistory(workflowId: string, limit = 10): Promise<WorkflowExecution[]> {
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { startTime: 'desc' },
      take: limit
    });
    
    return executions.map(e => ({
      id: e.id,
      workflowId: e.workflowId,
      status: e.status as any,
      startTime: e.startTime,
      endTime: e.endTime || undefined,
      duration: e.duration || undefined,
      context: e.context as any,
      logs: e.logs as any,
      error: e.error || undefined
    }));
  }
  
  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    // Stop scheduled task if running
    const task = this.runningWorkflows.get(workflowId);
    if (task) {
      task.stop();
      this.runningWorkflows.delete(workflowId);
    }
    
    // Delete from database
    await prisma.workflow.delete({
      where: { id: workflowId }
    });
    
    this.emit('workflowDeleted', workflowId);
  }
  
  /**
   * Clean up on shutdown
   */
  shutdown() {
    for (const [id, task] of this.runningWorkflows) {
      task.stop();
      logger.info('workflow', `Stopped scheduled workflow: ${id}`);
    }
    this.runningWorkflows.clear();
  }
}

// Export singleton instance
export const workflowBuilder = new WorkflowBuilder();

// Handle process termination
process.on('SIGINT', () => {
  workflowBuilder.shutdown();
});

process.on('SIGTERM', () => {
  workflowBuilder.shutdown();
});