/**
 * Cascade Effect Calculator
 * Calculates how timeline changes propagate through project dependencies
 */

import type { Project, ProjectTask, Milestone } from './project-types';

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge[]>;
  criticalPath: string[];
  totalFloat: number;
}

export interface GraphNode {
  id: string;
  type: 'task' | 'milestone' | 'resource' | 'deliverable';
  name: string;
  duration: number;
  earliestStart: Date;
  earliestFinish: Date;
  latestStart: Date;
  latestFinish: Date;
  totalFloat: number;
  freeFloat: number;
  isCritical: boolean;
  resource?: string;
  cost?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number; // days
  weight: number; // impact weight 0-1
}

export interface CascadeAnalysis {
  triggerId: string;
  triggerType: 'task_delay' | 'resource_unavailable' | 'milestone_moved' | 'external_dependency';
  
  // Direct impacts
  directlyAffected: Array<{
    id: string;
    name: string;
    type: string;
    originalStart: Date;
    originalEnd: Date;
    newStart: Date;
    newEnd: Date;
    delayDays: number;
    costImpact: number;
  }>;
  
  // Cascade effects
  cascadeEffects: Array<{
    level: number; // How many degrees of separation from trigger
    id: string;
    name: string;
    type: string;
    reason: string;
    originalStart: Date;
    originalEnd: Date;
    newStart: Date;
    newEnd: Date;
    delayDays: number;
    costImpact: number;
    probability: number; // 0-1, how likely this cascade is
  }>;
  
  // Critical path impact
  criticalPathImpact: {
    affected: boolean;
    newCriticalPath: string[];
    projectDelayDays: number;
    milestoneDelays: Array<{
      milestoneId: string;
      name: string;
      originalDate: Date;
      newDate: Date;
      delayDays: number;
    }>;
  };
  
  // Resource conflicts
  resourceConflicts: Array<{
    resourceId: string;
    resourceName: string;
    conflictingTasks: Array<{
      taskId: string;
      taskName: string;
      originalSchedule: { start: Date; end: Date };
      newSchedule: { start: Date; end: Date };
    }>;
    resolutionOptions: Array<{
      description: string;
      costImpact: number;
      timeImpact: number;
      feasibility: number;
    }>;
  }>;
  
  // Summary
  summary: {
    totalTasksAffected: number;
    totalDelayDays: number;
    totalCostImpact: number;
    probabilityOfSuccess: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  };
  
  calculatedAt: Date;
}

export class CascadeCalculator {
  private dependencyGraph: DependencyGraph;
  private project: Project;
  
  constructor(project: Project) {
    this.project = project;
    this.dependencyGraph = this.buildDependencyGraph(project);
  }

  /**
   * Calculate cascade effects from a timeline change
   * Example: LED fixtures delayed 16 weeks - what else is affected?
   */
  async calculateCascadeEffects(
    triggerId: string,
    triggerType: 'task_delay' | 'resource_unavailable' | 'milestone_moved' | 'external_dependency',
    delayDays: number,
    affectedItems: Array<{ id: string; type: string; delayDays: number }>
  ): Promise<CascadeAnalysis> {
    
    console.log(`🔄 Calculating cascade effects for ${triggerId}: ${delayDays} days delay`);
    
    // 1. Identify directly affected tasks
    const directlyAffected = await this.findDirectlyAffectedTasks(affectedItems);
    
    // 2. Calculate forward pass (propagate delays downstream)
    const cascadeEffects = await this.calculateForwardPass(directlyAffected, delayDays);
    
    // 3. Calculate backward pass (identify resource conflicts)
    const resourceConflicts = await this.identifyResourceConflicts(cascadeEffects);
    
    // 4. Analyze critical path impact
    const criticalPathImpact = await this.analyzeCriticalPathImpact(cascadeEffects);
    
    // 5. Generate summary and recommendations
    const summary = this.generateSummary(directlyAffected, cascadeEffects, criticalPathImpact);
    
    const analysis: CascadeAnalysis = {
      triggerId,
      triggerType,
      directlyAffected,
      cascadeEffects,
      criticalPathImpact,
      resourceConflicts,
      summary,
      calculatedAt: new Date()
    };
    
    return analysis;
  }

  /**
   * Example: Calculate effects of LED fixture delay on greenhouse construction
   */
  async calculateLightingDelayImpact(
    fixtureDeliveryDelayWeeks: number,
    affectedFixtures: Array<{ id: string; model: string; quantity: number }>
  ): Promise<CascadeAnalysis> {
    
    const delayDays = fixtureDeliveryDelayWeeks * 7;
    
    // Find tasks dependent on fixture delivery
    const affectedItems = affectedFixtures.map(fixture => ({
      id: fixture.id,
      type: 'fixture_delivery',
      delayDays
    }));
    
    // Add dependent construction tasks
    const constructionTasks = this.project.tasks.filter(task => 
      task.category === 'construction' && 
      task.name.toLowerCase().includes('lighting')
    );
    
    constructionTasks.forEach(task => {
      affectedItems.push({
        id: task.id,
        type: 'construction_task',
        delayDays
      });
    });
    
    return await this.calculateCascadeEffects(
      'lighting_delivery_delay',
      'external_dependency',
      delayDays,
      affectedItems
    );
  }

  private async findDirectlyAffectedTasks(
    affectedItems: Array<{ id: string; type: string; delayDays: number }>
  ): Promise<Array<{
    id: string;
    name: string;
    type: string;
    originalStart: Date;
    originalEnd: Date;
    newStart: Date;
    newEnd: Date;
    delayDays: number;
    costImpact: number;
  }>> {
    
    const directlyAffected = [];
    
    for (const item of affectedItems) {
      // Find project tasks related to this item
      const relatedTasks = this.project.tasks.filter(task => 
        task.relatedItems.bomId?.includes(item.id) ||
        task.relatedItems.procurementId?.includes(item.id) ||
        task.id === item.id
      );
      
      for (const task of relatedTasks) {
        directlyAffected.push({
          id: task.id,
          name: task.title,
          type: task.category,
          originalStart: task.startDate,
          originalEnd: task.dueDate,
          newStart: new Date(task.startDate.getTime() + item.delayDays * 24 * 60 * 60 * 1000),
          newEnd: new Date(task.dueDate.getTime() + item.delayDays * 24 * 60 * 60 * 1000),
          delayDays: item.delayDays,
          costImpact: this.calculateTaskDelayCost(task, item.delayDays)
        });
      }
    }
    
    return directlyAffected;
  }

  private async calculateForwardPass(
    directlyAffected: any[],
    initialDelay: number
  ): Promise<Array<{
    level: number;
    id: string;
    name: string;
    type: string;
    reason: string;
    originalStart: Date;
    originalEnd: Date;
    newStart: Date;
    newEnd: Date;
    delayDays: number;
    costImpact: number;
    probability: number;
  }>> {
    
    const cascadeEffects = [];
    const processed = new Set<string>();
    let currentLevel = 1;
    
    // Queue of tasks to process (id, delay, reason)
    let taskQueue = directlyAffected.map(task => ({
      id: task.id,
      delayDays: task.delayDays,
      reason: 'Direct dependency',
      level: 0
    }));
    
    // Process dependencies level by level
    while (taskQueue.length > 0 && currentLevel <= 5) { // Max 5 levels deep
      const nextQueue = [];
      
      for (const queueItem of taskQueue) {
        if (processed.has(queueItem.id)) continue;
        processed.add(queueItem.id);
        
        // Find tasks that depend on this task
        const dependentTasks = this.findDependentTasks(queueItem.id);
        
        for (const depTask of dependentTasks) {
          if (processed.has(depTask.id)) continue;
          
          // Calculate propagated delay
          const edge = this.getEdge(queueItem.id, depTask.id);
          const propagatedDelay = this.calculatePropagatedDelay(queueItem.delayDays, edge);
          
          if (propagatedDelay > 0) {
            const task = this.project.tasks.find(t => t.id === depTask.id);
            if (task) {
              cascadeEffects.push({
                level: currentLevel,
                id: task.id,
                name: task.title,
                type: task.category,
                reason: `Delayed due to ${queueItem.reason}`,
                originalStart: task.startDate,
                originalEnd: task.dueDate,
                newStart: new Date(task.startDate.getTime() + propagatedDelay * 24 * 60 * 60 * 1000),
                newEnd: new Date(task.dueDate.getTime() + propagatedDelay * 24 * 60 * 60 * 1000),
                delayDays: propagatedDelay,
                costImpact: this.calculateTaskDelayCost(task, propagatedDelay),
                probability: this.calculateCascadeProbability(currentLevel, edge)
              });
              
              nextQueue.push({
                id: task.id,
                delayDays: propagatedDelay,
                reason: `Cascade from ${queueItem.id}`,
                level: currentLevel
              });
            }
          }
        }
      }
      
      taskQueue = nextQueue;
      currentLevel++;
    }
    
    return cascadeEffects;
  }

  private async identifyResourceConflicts(cascadeEffects: any[]): Promise<Array<{
    resourceId: string;
    resourceName: string;
    conflictingTasks: any[];
    resolutionOptions: any[];
  }>> {
    
    const conflicts = [];
    const resourceSchedules = new Map<string, Array<{ taskId: string; start: Date; end: Date }>>();
    
    // Build resource schedules including cascaded changes
    for (const effect of cascadeEffects) {
      const task = this.project.tasks.find(t => t.id === effect.id);
      if (task && task.assignedTo) {
        for (const member of task.assignedTo) {
          if (!resourceSchedules.has(member.id)) {
            resourceSchedules.set(member.id, []);
          }
          
          resourceSchedules.get(member.id)!.push({
            taskId: task.id,
            start: effect.newStart,
            end: effect.newEnd
          });
        }
      }
    }
    
    // Check for overlapping schedules (conflicts)
    for (const [resourceId, schedule] of resourceSchedules.entries()) {
      const sortedSchedule = schedule.sort((a, b) => a.start.getTime() - b.start.getTime());
      const conflictingTasks = [];
      
      for (let i = 0; i < sortedSchedule.length - 1; i++) {
        const current = sortedSchedule[i];
        const next = sortedSchedule[i + 1];
        
        if (current.end > next.start) {
          // Conflict detected
          const task = this.project.tasks.find(t => t.id === current.taskId);
          const nextTask = this.project.tasks.find(t => t.id === next.taskId);
          
          if (task && nextTask) {
            conflictingTasks.push({
              taskId: current.taskId,
              taskName: task.title,
              originalSchedule: { start: task.startDate, end: task.dueDate },
              newSchedule: { start: current.start, end: current.end }
            });
          }
        }
      }
      
      if (conflictingTasks.length > 0) {
        const resource = this.project.team.find(m => m.id === resourceId);
        conflicts.push({
          resourceId,
          resourceName: resource?.name || 'Unknown Resource',
          conflictingTasks,
          resolutionOptions: this.generateResolutionOptions(conflictingTasks)
        });
      }
    }
    
    return conflicts;
  }

  private async analyzeCriticalPathImpact(cascadeEffects: any[]): Promise<{
    affected: boolean;
    newCriticalPath: string[];
    projectDelayDays: number;
    milestoneDelays: Array<{
      milestoneId: string;
      name: string;
      originalDate: Date;
      newDate: Date;
      delayDays: number;
    }>;
  }> {
    
    const criticalTasks = this.dependencyGraph.criticalPath;
    const affectedCriticalTasks = cascadeEffects.filter(effect => 
      criticalTasks.includes(effect.id)
    );
    
    const affected = affectedCriticalTasks.length > 0;
    let projectDelayDays = 0;
    
    if (affected) {
      // Calculate maximum delay on critical path
      projectDelayDays = Math.max(...affectedCriticalTasks.map(task => task.delayDays));
      
      // Recalculate critical path with new durations
      // (Simplified - would need full CPM recalculation)
    }
    
    // Calculate milestone delays
    const milestoneDelays = [];
    for (const milestone of this.project.milestones) {
      const affectedTasks = cascadeEffects.filter(effect => 
        milestone.dependencies.includes(effect.id)
      );
      
      if (affectedTasks.length > 0) {
        const maxDelay = Math.max(...affectedTasks.map(task => task.delayDays));
        milestoneDelays.push({
          milestoneId: milestone.id,
          name: milestone.name,
          originalDate: milestone.targetDate,
          newDate: new Date(milestone.targetDate.getTime() + maxDelay * 24 * 60 * 60 * 1000),
          delayDays: maxDelay
        });
      }
    }
    
    return {
      affected,
      newCriticalPath: criticalTasks, // Would be recalculated
      projectDelayDays,
      milestoneDelays
    };
  }

  private generateSummary(
    directlyAffected: any[],
    cascadeEffects: any[],
    criticalPathImpact: any
  ): {
    totalTasksAffected: number;
    totalDelayDays: number;
    totalCostImpact: number;
    probabilityOfSuccess: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  } {
    
    const totalTasksAffected = directlyAffected.length + cascadeEffects.length;
    const totalDelayDays = Math.max(
      ...directlyAffected.map(t => t.delayDays),
      ...cascadeEffects.map(t => t.delayDays)
    );
    const totalCostImpact = 
      directlyAffected.reduce((sum, t) => sum + t.costImpact, 0) +
      cascadeEffects.reduce((sum, t) => sum + t.costImpact, 0);
    
    // Calculate probability of successful recovery
    const highProbCascades = cascadeEffects.filter(e => e.probability > 0.7).length;
    const probabilityOfSuccess = Math.max(0.1, 1 - (highProbCascades / totalTasksAffected));
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalPathImpact.affected || totalCostImpact > 50000) riskLevel = 'critical';
    else if (totalDelayDays > 30 || totalCostImpact > 25000) riskLevel = 'high';
    else if (totalDelayDays > 7 || totalCostImpact > 5000) riskLevel = 'medium';
    
    // Generate recommendations
    const recommendations = [];
    
    if (criticalPathImpact.affected) {
      recommendations.push('Consider parallel execution of non-dependent tasks');
      recommendations.push('Evaluate alternative suppliers or expedited delivery options');
    }
    
    if (totalCostImpact > 25000) {
      recommendations.push('Review budget allocation and contingency funds');
      recommendations.push('Consider value engineering to reduce scope if needed');
    }
    
    if (totalDelayDays > 14) {
      recommendations.push('Implement fast-track construction methods where possible');
      recommendations.push('Add overtime or additional resources to critical tasks');
    }
    
    recommendations.push('Update all stakeholders on revised timeline immediately');
    recommendations.push('Monitor supplier performance closely for future projects');
    
    return {
      totalTasksAffected,
      totalDelayDays,
      totalCostImpact,
      probabilityOfSuccess,
      riskLevel,
      recommendations
    };
  }

  private buildDependencyGraph(project: Project): DependencyGraph {
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, GraphEdge[]>();
    
    // Add task nodes
    for (const task of project.tasks) {
      nodes.set(task.id, {
        id: task.id,
        type: 'task',
        name: task.title,
        duration: Math.ceil((task.dueDate.getTime() - task.startDate.getTime()) / (24 * 60 * 60 * 1000)),
        earliestStart: task.startDate,
        earliestFinish: task.dueDate,
        latestStart: task.startDate,
        latestFinish: task.dueDate,
        totalFloat: 0,
        freeFloat: 0,
        isCritical: task.priority === 'critical',
        cost: task.cost?.budgeted || 0
      });
      
      // Add edges for dependencies
      if (task.dependencies.length > 0) {
        const taskEdges = task.dependencies.map(dep => ({
          from: dep.predecessorId,
          to: task.id,
          type: dep.type,
          lag: dep.lag,
          weight: 1.0
        }));
        
        edges.set(task.id, taskEdges);
      }
    }
    
    // Calculate critical path (simplified)
    const criticalPath = this.calculateCriticalPath(nodes, edges);
    
    return {
      nodes,
      edges,
      criticalPath,
      totalFloat: 0
    };
  }

  private calculateCriticalPath(
    nodes: Map<string, GraphNode>,
    edges: Map<string, GraphEdge[]>
  ): string[] {
    // Simplified critical path calculation
    // In production, would use proper CPM algorithm
    const criticalTasks = Array.from(nodes.values())
      .filter(node => node.isCritical || node.totalFloat === 0)
      .map(node => node.id);
    
    return criticalTasks;
  }

  private findDependentTasks(taskId: string): Array<{ id: string }> {
    const dependents = [];
    
    for (const [id, taskEdges] of this.dependencyGraph.edges.entries()) {
      for (const edge of taskEdges) {
        if (edge.from === taskId) {
          dependents.push({ id: edge.to });
        }
      }
    }
    
    return dependents;
  }

  private getEdge(fromId: string, toId: string): GraphEdge | null {
    const edges = this.dependencyGraph.edges.get(toId) || [];
    return edges.find(edge => edge.from === fromId) || null;
  }

  private calculatePropagatedDelay(originalDelay: number, edge: GraphEdge | null): number {
    if (!edge) return 0;
    
    // Apply edge weight and type-specific logic
    let propagatedDelay = originalDelay * edge.weight;
    
    // Adjust based on dependency type
    switch (edge.type) {
      case 'finish_to_start':
        // Full delay propagates
        break;
      case 'start_to_start':
        // Partial delay may propagate
        propagatedDelay *= 0.5;
        break;
      case 'finish_to_finish':
        // Usually minimal propagation
        propagatedDelay *= 0.3;
        break;
      case 'start_to_finish':
        // Rare case
        propagatedDelay *= 0.1;
        break;
    }
    
    return Math.max(0, propagatedDelay - edge.lag);
  }

  private calculateCascadeProbability(level: number, edge: GraphEdge | null): number {
    // Probability decreases with cascade level and increases with edge weight
    const baseProbability = edge ? edge.weight : 0.5;
    const levelDecay = Math.pow(0.8, level - 1); // 20% decay per level
    
    return Math.min(1.0, baseProbability * levelDecay);
  }

  private calculateTaskDelayCost(task: any, delayDays: number): number {
    // Base cost: $100 per day per task
    let baseCost = delayDays * 100;
    
    // Add resource costs
    if (task.assignedTo) {
      const resourceCost = task.assignedTo.reduce((sum: number, member: any) => 
        sum + (member.hourlyRate * 8 * delayDays), 0
      );
      baseCost += resourceCost;
    }
    
    // Add material storage/handling costs
    if (task.category === 'procurement' || task.category === 'construction') {
      baseCost += delayDays * 50; // Storage costs
    }
    
    // Critical path multiplier
    if (this.dependencyGraph.criticalPath.includes(task.id)) {
      baseCost *= 1.5; // 50% penalty for critical path delays
    }
    
    return Math.round(baseCost);
  }

  private generateResolutionOptions(conflictingTasks: any[]): Array<{
    description: string;
    costImpact: number;
    timeImpact: number;
    feasibility: number;
  }> {
    
    return [
      {
        description: 'Add additional resources to parallel tasks',
        costImpact: 5000,
        timeImpact: 0,
        feasibility: 0.8
      },
      {
        description: 'Implement overtime schedule',
        costImpact: 2500,
        timeImpact: -3, // Saves 3 days
        feasibility: 0.9
      },
      {
        description: 'Reschedule non-critical tasks',
        costImpact: 500,
        timeImpact: 2, // Adds 2 days to project
        feasibility: 0.95
      }
    ];
  }
}

export { CascadeCalculator };