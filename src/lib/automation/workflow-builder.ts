// Workflow Automation Builder
// Visual workflow creation with triggers, conditions, and actions

import { prisma } from '@/lib/db';
import { auditLogger } from '../audit-logger';
import { emailService } from '../email/email-service';
import cron from 'node-cron';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected nodes
}

export interface WorkflowTrigger {
  type: 'schedule' | 'webhook' | 'event' | 'manual' | 'sensor';
  config: {
    schedule?: string; // Cron expression
    webhookUrl?: string;
    event?: string;
    sensorId?: string;
    threshold?: number;
    operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  };
}

export interface WorkflowCondition {
  type: 'if' | 'switch' | 'time' | 'data';
  config: {
    field?: string;
    operator?: string;
    value?: any;
    cases?: Array<{ value: any; nodeId: string }>;
    timeRange?: { start: string; end: string };
    dayOfWeek?: number[];
  };
}

export interface WorkflowAction {
  type: 'email' | 'sms' | 'webhook' | 'database' | 'control' | 'notification';
  config: {
    to?: string;
    subject?: string;
    template?: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: string;
    deviceId?: string;
    command?: string;
    notificationTitle?: string;
    notificationBody?: string;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  userId: string;
  nodes: WorkflowNode[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  runCount: number;
  errorCount: number;
  avgExecutionTime?: number;
  tags?: string[];
  variables?: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  currentNodeId?: string;
  context: Record<string, any>;
  logs: WorkflowLog[];
  error?: string;
}

export interface WorkflowLog {
  timestamp: Date;
  nodeId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}

export class WorkflowBuilder {
  private runningWorkflows: Map<string, cron.ScheduledTask> = new Map();
  
  // Create a new workflow
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt' | 'runCount' | 'errorCount'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      ...workflow,
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
      errorCount: 0
    };
    
    // Validate workflow
    this.validateWorkflow(newWorkflow);
    
    // Save to database - TODO: Add workflow model to Prisma schema
    // await prisma.workflow.create({
    //   data: newWorkflow
    // });
    
    // Schedule if enabled and has schedule trigger
    if (newWorkflow.enabled) {
      await this.scheduleWorkflow(newWorkflow);
    }
    
    await auditLogger.log({
      action: 'workflow.created',
      resourceType: 'workflow',
      resourceId: newWorkflow.id,
      userId: workflow.userId,
      details: { name: workflow.name }
    });
    
    return newWorkflow;
  }
  
  // Update workflow
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    // TODO: Add workflow model to Prisma schema
    // const workflow = await prisma.workflow.findUnique({
    //   where: { id: workflowId }
    // });
    
    // if (!workflow) {
    //   throw new Error('Workflow not found');
    // }
    
    // Temporary fallback for missing model
    throw new Error('Workflow model not implemented in database schema');
    
    // const updatedWorkflow = {
    //   ...workflow,
    //   ...updates,
    //   updatedAt: new Date()
    // };
    
    // // Validate if nodes were updated
    // if (updates.nodes) {
    //   this.validateWorkflow(updatedWorkflow);
    // }
    
    // await prisma.workflow.update({
    //   where: { id: workflowId },
    //   data: updatedWorkflow
    // });
    
    // // Reschedule if needed
    // if (updates.enabled !== undefined || updates.nodes) {
    //   await this.rescheduleWorkflow(updatedWorkflow);
    // }
    
    // return updatedWorkflow;
  }
  
  // Execute workflow
  async executeWorkflow(workflowId: string, context: Record<string, any> = {}): Promise<WorkflowExecution> {
    // TODO: Add workflow model to Prisma schema
    // const workflow = await prisma.workflow.findUnique({
    //   where: { id: workflowId }
    // });
    
    // if (!workflow) {
    //   throw new Error('Workflow not found');
    // }
    
    // Temporary fallback for missing model
    throw new Error('Workflow model not implemented in database schema');
    
    // const execution: WorkflowExecution = {
    //   id: `exec_${Date.now()}`,
    //   workflowId,
    //   status: 'running',
    //   startTime: new Date(),
    //   context: { ...workflow.variables, ...context },
    //   logs: []
    // };
    
    // // Save execution
    // await prisma.workflowExecution.create({
    //   data: execution
    // });
    
    // try {
    //   // Find trigger node
    //   const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
    //   if (!triggerNode) {
    //     throw new Error('No trigger node found');
    //   }
    //   
    //   // Execute workflow
    //   await this.executeNode(workflow, triggerNode, execution);
    //   
    //   // Update execution status
    //   execution.status = 'completed';
    //   execution.endTime = new Date();
    //   execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    //   
    //   // Update workflow stats
    //   await prisma.workflow.update({
    //     where: { id: workflowId },
    //     data: {
    //       lastRunAt: new Date(),
    //       runCount: { increment: 1 },
    //       avgExecutionTime: execution.duration
    //     }
    //   });
    //   
    // } catch (error) {
    //   execution.status = 'failed';
    //   execution.error = error instanceof Error ? error.message : 'Unknown error';
    //   execution.endTime = new Date();
    //   execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    //   
    //   // Update error count
    //   await prisma.workflow.update({
    //     where: { id: workflowId },
    //     data: { errorCount: { increment: 1 } }
    //   });
    //   
    //   this.logExecution(execution, 'error', 'Workflow execution failed', { error: execution.error });
    // }
    // 
    // // Save final execution state
    // await prisma.workflowExecution.update({
    //   where: { id: execution.id },
    //   data: execution
    // });
    // 
    // return execution;
  }
  
  // Execute a single node
  private async executeNode(
    workflow: Workflow,
    node: WorkflowNode,
    execution: WorkflowExecution
  ): Promise<void> {
    execution.currentNodeId = node.id;
    this.logExecution(execution, 'info', `Executing node: ${node.type}`, { nodeId: node.id });
    
    try {
      switch (node.type) {
        case 'trigger':
          // Triggers are entry points, nothing to execute
          break;
          
        case 'condition':
          await this.executeCondition(node, execution);
          break;
          
        case 'action':
          await this.executeAction(node, execution);
          break;
          
        case 'delay':
          await this.executeDelay(node, execution);
          break;
      }
      
      // Execute connected nodes
      for (const connectedNodeId of node.connections) {
        const connectedNode = workflow.nodes.find(n => n.id === connectedNodeId);
        if (connectedNode) {
          await this.executeNode(workflow, connectedNode, execution);
        }
      }
    } catch (error) {
      this.logExecution(execution, 'error', `Node execution failed: ${error}`, { nodeId: node.id });
      throw error;
    }
  }
  
  // Execute condition node
  private async executeCondition(node: WorkflowNode, execution: WorkflowExecution): Promise<void> {
    const condition = node.config as WorkflowCondition['config'];
    let result = false;
    
    switch (node.config.type) {
      case 'if':
        const value = this.getValueFromContext(condition.field!, execution.context);
        result = this.evaluateCondition(value, condition.operator!, condition.value);
        break;
        
      case 'time':
        const now = new Date();
        const currentHour = now.getHours();
        const startHour = parseInt(condition.timeRange!.start.split(':')[0]);
        const endHour = parseInt(condition.timeRange!.end.split(':')[0]);
        result = currentHour >= startHour && currentHour <= endHour;
        
        if (condition.dayOfWeek) {
          result = result && condition.dayOfWeek.includes(now.getDay());
        }
        break;
        
      case 'data':
        // Custom data condition
        result = await this.evaluateDataCondition(condition, execution.context);
        break;
    }
    
    this.logExecution(execution, 'info', `Condition evaluated: ${result}`, { condition, result });
    
    // For if conditions, only continue if true
    if (node.config.type === 'if' && !result) {
      node.connections = []; // Clear connections to stop execution
    }
  }
  
  // Execute action node
  private async executeAction(node: WorkflowNode, execution: WorkflowExecution): Promise<void> {
    const action = node.config as WorkflowAction['config'];
    
    switch (node.config.type) {
      case 'email':
        await emailService.sendEmail({
          to: this.interpolateString(action.to!, execution.context),
          subject: this.interpolateString(action.subject!, execution.context),
          template: action.template,
          data: execution.context
        });
        break;
        
      case 'webhook':
        await this.callWebhook({
          url: this.interpolateString(action.url!, execution.context),
          method: action.method || 'POST',
          headers: action.headers,
          body: this.interpolateObject(action.body, execution.context)
        });
        break;
        
      case 'database':
        await this.executeDatabaseQuery(action.query!, execution.context);
        break;
        
      case 'notification':
        await this.sendNotification({
          title: this.interpolateString(action.notificationTitle!, execution.context),
          body: this.interpolateString(action.notificationBody!, execution.context),
          userId: execution.context.userId
        });
        break;
        
      case 'control':
        await this.executeDeviceControl(action.deviceId!, action.command!, execution.context);
        break;
    }
    
    this.logExecution(execution, 'info', `Action executed: ${node.config.type}`, { action });
  }
  
  // Execute delay node
  private async executeDelay(node: WorkflowNode, execution: WorkflowExecution): Promise<void> {
    const delayMs = node.config.duration || 1000;
    this.logExecution(execution, 'info', `Delaying for ${delayMs}ms`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  // Helper methods
  
  private validateWorkflow(workflow: Workflow): void {
    // Check for at least one trigger
    const triggers = workflow.nodes.filter(n => n.type === 'trigger');
    if (triggers.length === 0) {
      throw new Error('Workflow must have at least one trigger');
    }
    
    // Check for circular dependencies
    const visited = new Set<string>();
    const checkCircular = (nodeId: string, path: string[] = []) => {
      if (path.includes(nodeId)) {
        throw new Error('Circular dependency detected');
      }
      
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (node) {
        for (const connectedId of node.connections) {
          checkCircular(connectedId, [...path, nodeId]);
        }
      }
    };
    
    triggers.forEach(trigger => checkCircular(trigger.id));
  }
  
  private async scheduleWorkflow(workflow: Workflow): Promise<void> {
    // Find schedule triggers
    const scheduleTriggers = workflow.nodes.filter(
      n => n.type === 'trigger' && n.config.type === 'schedule'
    );
    
    for (const trigger of scheduleTriggers) {
      const schedule = trigger.config.schedule;
      if (schedule && cron.validate(schedule)) {
        const task = cron.schedule(schedule, async () => {
          await this.executeWorkflow(workflow.id);
        });
        
        this.runningWorkflows.set(`${workflow.id}_${trigger.id}`, task);
        task.start();
      }
    }
  }
  
  private async rescheduleWorkflow(workflow: Workflow): Promise<void> {
    // Stop existing schedules
    for (const [key, task] of this.runningWorkflows.entries()) {
      if (key.startsWith(workflow.id)) {
        task.stop();
        this.runningWorkflows.delete(key);
      }
    }
    
    // Schedule if enabled
    if (workflow.enabled) {
      await this.scheduleWorkflow(workflow);
    }
  }
  
  private getValueFromContext(path: string, context: Record<string, any>): any {
    return path.split('.').reduce((obj, key) => obj?.[key], context);
  }
  
  private evaluateCondition(value: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case 'eq': return value === compareValue;
      case 'neq': return value !== compareValue;
      case 'gt': return value > compareValue;
      case 'gte': return value >= compareValue;
      case 'lt': return value < compareValue;
      case 'lte': return value <= compareValue;
      case 'contains': return String(value).includes(String(compareValue));
      case 'regex': return new RegExp(compareValue).test(String(value));
      default: return false;
    }
  }
  
  private async evaluateDataCondition(
    condition: any,
    context: Record<string, any>
  ): Promise<boolean> {
    // Custom data evaluation logic
    return true;
  }
  
  private interpolateString(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getValueFromContext(path.trim(), context);
      return value !== undefined ? String(value) : match;
    });
  }
  
  private interpolateObject(obj: any, context: Record<string, any>): any {
    if (typeof obj === 'string') {
      return this.interpolateString(obj, context);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, context));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, context);
      }
      return result;
    }
    
    return obj;
  }
  
  private async callWebhook(options: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
  }): Promise<void> {
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
  }
  
  private async executeDatabaseQuery(query: string, context: Record<string, any>): Promise<void> {
    // Execute safe database queries with parameterization
    // Only allow specific pre-defined queries for security
    const allowedQueries: Record<string, (params: any) => any> = {
      'updateSensorReading': async (params) => {
        return await prisma.sensorReading.create({
          data: {
            sensorId: params.sensorId,
            value: params.value,
            unit: params.unit,
            timestamp: new Date(),
            metadata: params.metadata || {}
          }
        });
      },
      'updateFacilityMetrics': async (params) => {
        return await prisma.facilityMetrics.upsert({
          where: { facilityId: params.facilityId },
          create: {
            facilityId: params.facilityId,
            temperature: params.temperature,
            humidity: params.humidity,
            co2Level: params.co2Level,
            lightLevel: params.lightLevel,
            updatedAt: new Date()
          },
          update: {
            temperature: params.temperature,
            humidity: params.humidity,
            co2Level: params.co2Level,
            lightLevel: params.lightLevel,
            updatedAt: new Date()
          }
        });
      },
      'createAlert': async (params) => {
        return await prisma.alert.create({
          data: {
            facilityId: params.facilityId,
            type: params.type,
            severity: params.severity,
            message: params.message,
            data: params.data || {},
            acknowledged: false,
            createdAt: new Date()
          }
        });
      },
      'updateEquipmentStatus': async (params) => {
        return await prisma.equipment.update({
          where: { id: params.equipmentId },
          data: {
            status: params.status,
            lastMaintenance: params.maintenance ? new Date() : undefined,
            metadata: params.metadata || {}
          }
        });
      }
    };

    // Parse query to get operation and params
    const queryParts = query.split(':');
    const operation = queryParts[0];
    const params = context;

    if (!allowedQueries[operation]) {
      throw new Error(`Unauthorized database operation: ${operation}`);
    }

    try {
      await allowedQueries[operation](params);
      auditLogger.log('workflow_database_query', {
        operation,
        params: { ...params, _sensitive: true }
      });
    } catch (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
  }
  
  private async sendNotification(options: {
    title: string;
    body: string;
    userId: string;
  }): Promise<void> {
    // Send in-app notification - TODO: Add notification model to Prisma schema
    // await prisma.notification.create({
    //   data: {
    //     userId: options.userId,
    //     title: options.title,
    //     body: options.body,
    //     type: 'workflow',
    //     read: false,
    //     createdAt: new Date()
    //   }
    // });
    
    // Temporary fallback - log notification instead
    console.log('Notification:', options);
  }
  
  private async executeDeviceControl(
    deviceId: string,
    command: string,
    context: Record<string, any>
  ): Promise<void> {
    // Execute device control command through IoT hub
    const iotHub = new (await import('@/services/iot-device-hub.service')).IoTDeviceHubService({
      facilityId: context.facilityId || 'default',
      protocols: {
        mqtt: {
          brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
          clientId: `workflow-${Date.now()}`
        }
      },
      settings: {
        dataRetentionDays: 30,
        alertThresholds: {},
        autoDiscovery: false,
        pollingInterval: 60,
        batchSize: 100
      }
    });

    try {
      // Initialize the hub
      await iotHub.initialize();

      // Parse command (format: "action:value" e.g., "setTemperature:72")
      const [action, value] = command.split(':');
      
      // Common device control commands
      const deviceCommands: Record<string, any> = {
        'setPower': { command: 'power', value: value === 'on' },
        'setTemperature': { command: 'set_temperature', value: parseFloat(value) },
        'setHumidity': { command: 'set_humidity', value: parseFloat(value) },
        'setIntensity': { command: 'set_intensity', value: parseFloat(value) },
        'setSchedule': { command: 'set_schedule', value: JSON.parse(value) },
        'reset': { command: 'reset', value: null },
        'calibrate': { command: 'calibrate', value: null }
      };

      if (!deviceCommands[action]) {
        throw new Error(`Unknown device command: ${action}`);
      }

      // Send command to device
      const commandData = {
        ...deviceCommands[action],
        timestamp: new Date(),
        source: 'workflow',
        context: context
      };

      await iotHub.sendCommand(deviceId, commandData);

      // Log the command execution
      auditLogger.log('workflow_device_control', {
        deviceId,
        command: action,
        value,
        context: { ...context, _sensitive: true }
      });

      // Wait for command acknowledgment (with timeout)
      const timeout = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const status = await iotHub.getDeviceStatus(deviceId);
        if (status.lastCommand?.acknowledged) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      throw new Error(`Device control failed: ${error.message}`);
    } finally {
      // Clean up
      await iotHub.disconnect();
    }
  }
  
  private async evaluateCondition(
    condition: WorkflowCondition,
    context: Record<string, any>
  ): Promise<boolean | string> {
    switch (condition.type) {
      case 'if': {
        const { field, operator, value } = condition.config;
        const fieldValue = this.getNestedValue(context, field || '');
        
        switch (operator) {
          case 'eq': return fieldValue === value;
          case 'neq': return fieldValue !== value;
          case 'gt': return fieldValue > value;
          case 'gte': return fieldValue >= value;
          case 'lt': return fieldValue < value;
          case 'lte': return fieldValue <= value;
          case 'contains': return String(fieldValue).includes(value);
          case 'startsWith': return String(fieldValue).startsWith(value);
          case 'endsWith': return String(fieldValue).endsWith(value);
          case 'in': return Array.isArray(value) && value.includes(fieldValue);
          case 'notIn': return Array.isArray(value) && !value.includes(fieldValue);
          case 'regex': return new RegExp(value).test(String(fieldValue));
          default: return false;
        }
      }
      
      case 'switch': {
        const { field, cases } = condition.config;
        const fieldValue = this.getNestedValue(context, field || '');
        
        const matchedCase = cases?.find(c => c.value === fieldValue);
        return matchedCase ? matchedCase.nodeId : 'default';
      }
      
      case 'time': {
        const { timeRange, dayOfWeek } = condition.config;
        const now = new Date();
        
        if (timeRange) {
          const currentTime = now.toTimeString().slice(0, 5);
          if (currentTime < timeRange.start || currentTime > timeRange.end) {
            return false;
          }
        }
        
        if (dayOfWeek && dayOfWeek.length > 0) {
          if (!dayOfWeek.includes(now.getDay())) {
            return false;
          }
        }
        
        return true;
      }
      
      case 'data': {
        // Complex data validation
        const { field, operator, value } = condition.config;
        const data = this.getNestedValue(context, field || '');
        
        if (operator === 'hasProperty') {
          return data && typeof data === 'object' && value in data;
        }
        
        if (operator === 'arrayLength') {
          return Array.isArray(data) && data.length === value;
        }
        
        if (operator === 'isEmpty') {
          return !data || (Array.isArray(data) && data.length === 0) || 
                 (typeof data === 'object' && Object.keys(data).length === 0);
        }
        
        return false;
      }
      
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private logExecution(
    execution: WorkflowExecution,
    level: WorkflowLog['level'],
    message: string,
    data?: any
  ): void {
    execution.logs.push({
      timestamp: new Date(),
      nodeId: execution.currentNodeId || '',
      level,
      message,
      data
    });
  }
  
  // Get workflow templates
  async getTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    workflow: Partial<Workflow>;
  }>> {
    return [
      {
        id: 'alert-notification',
        name: 'Environmental Alert',
        description: 'Send notifications when environmental conditions exceed thresholds',
        category: 'monitoring',
        workflow: {
          name: 'Environmental Alert',
          nodes: [
            {
              id: 'trigger1',
              type: 'trigger',
              config: { type: 'sensor', sensorId: '{{sensorId}}', threshold: 80, operator: 'gt' },
              position: { x: 100, y: 100 },
              connections: ['condition1']
            },
            {
              id: 'condition1',
              type: 'condition',
              config: { type: 'time', timeRange: { start: '08:00', end: '22:00' } },
              position: { x: 300, y: 100 },
              connections: ['action1']
            },
            {
              id: 'action1',
              type: 'action',
              config: {
                type: 'notification',
                notificationTitle: 'Environmental Alert',
                notificationBody: 'Temperature exceeded {{threshold}}°F'
              },
              position: { x: 500, y: 100 },
              connections: []
            }
          ]
        }
      },
      {
        id: 'daily-report',
        name: 'Daily Report',
        description: 'Send daily summary reports via email',
        category: 'reporting',
        workflow: {
          name: 'Daily Report',
          nodes: [
            {
              id: 'trigger1',
              type: 'trigger',
              config: { type: 'schedule', schedule: '0 8 * * *' }, // 8 AM daily
              position: { x: 100, y: 100 },
              connections: ['action1']
            },
            {
              id: 'action1',
              type: 'action',
              config: {
                type: 'email',
                to: '{{userEmail}}',
                subject: 'Daily Summary Report',
                template: 'daily-report'
              },
              position: { x: 300, y: 100 },
              connections: []
            }
          ]
        }
      }
    ];
  }
}

// Export singleton instance
export const workflowBuilder = new WorkflowBuilder();