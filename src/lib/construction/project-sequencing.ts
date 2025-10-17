/**
 * Construction Project Phasing and Sequencing Engine
 * Advanced scheduling system with Critical Path Method (CPM) and resource optimization
 */

import { TaskEstimate, ProjectData } from './contractor-estimation';

export interface ConstructionPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: number; // days
  sequence: number;
  prerequisites: string[]; // Phase IDs that must complete first
  activities: ConstructionActivity[];
  milestone: boolean;
  phase: 'planning' | 'sitework' | 'foundation' | 'structure' | 'envelope' | 'mep' | 'finishes' | 'commissioning' | 'closeout';
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'on_hold';
  completionPercentage: number;
  criticalPath: boolean;
}

export interface ConstructionActivity {
  id: string;
  name: string;
  description: string;
  phase: string;
  duration: number; // days
  startDate: Date;
  endDate: Date;
  predecessors: ActivityPredecessor[];
  successors: string[]; // Activity IDs
  resources: ActivityResource[];
  constraints: ActivityConstraint[];
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  completionPercentage: number;
  criticalPath: boolean;
  float: number; // Total float in days
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
  actualStart?: Date;
  actualFinish?: Date;
  weather_dependent: boolean;
  quality_checkpoints: QualityCheckpoint[];
}

export interface ActivityPredecessor {
  activityId: string;
  relationship: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-Start, Start-Start, Finish-Finish, Start-Finish
  lag: number; // days (positive for delay, negative for lead)
}

export interface ActivityResource {
  type: 'labor' | 'material' | 'equipment';
  resourceId: string;
  quantity: number;
  unit: string;
  availability: ResourceAvailability[];
  cost: number;
  critical: boolean; // Resource bottleneck
}

export interface ResourceAvailability {
  startDate: Date;
  endDate: Date;
  quantity: number;
  allocated: number;
  available: number;
}

export interface ActivityConstraint {
  type: 'must_start_on' | 'must_finish_on' | 'start_no_earlier_than' | 'start_no_later_than' | 'finish_no_earlier_than' | 'finish_no_later_than';
  date: Date;
  reason: string;
}

export interface QualityCheckpoint {
  id: string;
  name: string;
  description: string;
  inspector: string;
  required: boolean;
  status: 'pending' | 'passed' | 'failed' | 'waived';
  scheduledDate?: Date;
  completedDate?: Date;
  notes?: string;
}

export interface ProjectSchedule {
  projectId: string;
  projectName: string;
  baselineStart: Date;
  baselineFinish: Date;
  forecastStart: Date;
  forecastFinish: Date;
  actualStart?: Date;
  actualFinish?: Date;
  totalDuration: number;
  phases: ConstructionPhase[];
  activities: ConstructionActivity[];
  criticalPath: string[]; // Activity IDs
  milestones: Milestone[];
  resourceCalendar: ResourceCalendar;
  weatherConstraints: WeatherConstraint[];
  riskMitigations: ScheduleRiskMitigation[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'upcoming' | 'achieved' | 'missed' | 'at_risk';
  dependencies: string[]; // Activity IDs that must complete
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResourceCalendar {
  workDays: number[]; // 0-6 (Sunday-Saturday)
  workHours: { start: number; end: number }; // 24-hour format
  holidays: Date[];
  shutdownPeriods: { start: Date; end: Date; reason: string }[];
  overtime: { 
    authorized: boolean; 
    maxHoursPerDay: number; 
    maxHoursPerWeek: number; 
    costMultiplier: number;
  };
}

export interface WeatherConstraint {
  activityIds: string[];
  constraint: 'no_rain' | 'temperature_above' | 'temperature_below' | 'wind_below' | 'no_snow';
  threshold?: number;
  bufferDays: number; // Additional days to account for weather delays
  seasonalRestriction?: { startMonth: number; endMonth: number };
}

export interface ScheduleRiskMitigation {
  riskId: string;
  description: string;
  probability: number; // 0-1
  impact: number; // days of delay
  mitigation: string;
  contingencyBuffer: number; // days
  triggerConditions: string[];
}

export interface ScheduleOptimizationOptions {
  prioritizeFinishDate: boolean;
  prioritizeCost: boolean;
  allowOvertime: boolean;
  allowResourceLeveling: boolean;
  weatherBufferDays: number;
  qualityBuffer: number; // percentage
  riskBuffer: number; // percentage
}

export interface ScheduleAnalysis {
  schedule: ProjectSchedule;
  criticalPathLength: number;
  totalFloat: number;
  resourceUtilization: ResourceUtilization[];
  bottlenecks: ScheduleBottleneck[];
  recommendations: ScheduleRecommendation[];
  riskAssessment: ScheduleRiskAssessment;
  whatIfScenarios: WhatIfScenario[];
}

export interface ResourceUtilization {
  resourceId: string;
  resourceType: string;
  peakUtilization: number; // percentage
  averageUtilization: number; // percentage
  overallocationPeriods: { start: Date; end: Date; overallocation: number }[];
  underutilizationPeriods: { start: Date; end: Date; utilization: number }[];
}

export interface ScheduleBottleneck {
  type: 'resource' | 'activity' | 'constraint' | 'weather';
  description: string;
  impact: number; // days of delay
  affectedActivities: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScheduleRecommendation {
  category: 'sequencing' | 'resources' | 'risk' | 'optimization';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  effort: string;
  costBenefit: number;
}

export interface ScheduleRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  scheduleVariance: number; // percentage
  probabilityOfDelay: number; // percentage
  expectedDelay: number; // days
  keyRisks: {
    category: string;
    description: string;
    probability: number;
    impact: number;
  }[];
  mitigationEffectiveness: number; // percentage
}

export interface WhatIfScenario {
  name: string;
  description: string;
  assumptions: string[];
  adjustments: {
    activityId: string;
    durationChange: number;
    resourceChange?: number;
  }[];
  results: {
    newFinishDate: Date;
    scheduleVariance: number;
    costImpact: number;
    riskLevel: string;
  };
}

export class ProjectSequencingEngine {
  private resourceCalendar: ResourceCalendar;
  private optimizationOptions: ScheduleOptimizationOptions;

  constructor() {
    this.resourceCalendar = this.getDefaultResourceCalendar();
    this.optimizationOptions = this.getDefaultOptimizationOptions();
  }

  /**
   * Create comprehensive project schedule with phasing and sequencing
   */
  async createProjectSchedule(
    projectData: ProjectData,
    taskEstimates: TaskEstimate[],
    startDate: Date,
    constraints?: ActivityConstraint[]
  ): Promise<ProjectSchedule> {
    
    logger.info('api', `🏗️ Creating project schedule for: ${projectData.name}`);

    // Step 1: Create construction phases
    const phases = this.createConstructionPhases(projectData, startDate);
    
    // Step 2: Convert task estimates to detailed activities
    const activities = this.createActivitiesFromTasks(taskEstimates, phases, constraints);
    
    // Step 3: Define activity dependencies and relationships
    this.establishActivityDependencies(activities);
    
    // Step 4: Calculate critical path using CPM
    const criticalPath = this.calculateCriticalPath(activities);
    
    // Step 5: Optimize resource allocation
    await this.optimizeResourceAllocation(activities);
    
    // Step 6: Add weather and seasonal constraints
    this.applyWeatherConstraints(activities, projectData);
    
    // Step 7: Create project milestones
    const milestones = this.createProjectMilestones(phases, activities);
    
    // Step 8: Calculate final dates with all constraints
    const finalDates = this.calculateFinalSchedule(activities, startDate);

    return {
      projectId: projectData.id || this.generateProjectId(),
      projectName: projectData.name || 'Construction Project',
      baselineStart: startDate,
      baselineFinish: finalDates.finish,
      forecastStart: startDate,
      forecastFinish: finalDates.finish,
      totalDuration: this.calculateDuration(startDate, finalDates.finish),
      phases,
      activities,
      criticalPath,
      milestones,
      resourceCalendar: this.resourceCalendar,
      weatherConstraints: this.getWeatherConstraints(projectData),
      riskMitigations: this.getScheduleRiskMitigations(projectData)
    };
  }

  /**
   * Analyze schedule and provide optimization recommendations
   */
  async analyzeSchedule(schedule: ProjectSchedule): Promise<ScheduleAnalysis> {
    
    const resourceUtilization = this.analyzeResourceUtilization(schedule.activities);
    const bottlenecks = this.identifyBottlenecks(schedule);
    const riskAssessment = this.assessScheduleRisks(schedule);
    const recommendations = this.generateRecommendations(schedule, resourceUtilization, bottlenecks);
    const whatIfScenarios = this.generateWhatIfScenarios(schedule);

    return {
      schedule,
      criticalPathLength: this.calculateCriticalPathLength(schedule.activities),
      totalFloat: this.calculateTotalFloat(schedule.activities),
      resourceUtilization,
      bottlenecks,
      recommendations,
      riskAssessment,
      whatIfScenarios
    };
  }

  /**
   * Update schedule progress and recalculate forecasts
   */
  updateScheduleProgress(
    schedule: ProjectSchedule, 
    activityUpdates: { activityId: string; completionPercentage: number; actualStart?: Date; actualFinish?: Date }[]
  ): ProjectSchedule {
    
    // Update activity progress
    activityUpdates.forEach(update => {
      const activity = schedule.activities.find(a => a.id === update.activityId);
      if (activity) {
        activity.completionPercentage = update.completionPercentage;
        if (update.actualStart) activity.actualStart = update.actualStart;
        if (update.actualFinish) activity.actualFinish = update.actualFinish;
        
        if (update.completionPercentage === 100) {
          activity.status = 'completed';
        } else if (update.completionPercentage > 0) {
          activity.status = 'in_progress';
        }
      }
    });

    // Recalculate forecasts based on actual progress
    this.recalculateForecasts(schedule);
    
    // Update phase completion
    this.updatePhaseProgress(schedule);
    
    // Update milestone status
    this.updateMilestoneStatus(schedule);

    return schedule;
  }

  /**
   * Optimize schedule for specific objectives
   */
  optimizeSchedule(
    schedule: ProjectSchedule,
    objectives: ScheduleOptimizationOptions
  ): ProjectSchedule {
    
    this.optimizationOptions = objectives;
    
    if (objectives.allowResourceLeveling) {
      this.levelResources(schedule.activities);
    }
    
    if (objectives.prioritizeFinishDate) {
      this.compressSchedule(schedule.activities);
    }
    
    if (objectives.allowOvertime) {
      this.applyOvertimeOptions(schedule.activities);
    }
    
    // Apply buffers
    this.applyScheduleBuffers(schedule, objectives);
    
    // Recalculate critical path after optimization
    schedule.criticalPath = this.calculateCriticalPath(schedule.activities);
    
    return schedule;
  }

  // Private helper methods for schedule creation and management

  private createConstructionPhases(projectData: ProjectData, startDate: Date): ConstructionPhase[] {
    const phases: ConstructionPhase[] = [];
    let currentDate = new Date(startDate);

    const phaseTemplates = [
      { name: 'Pre-Construction', phase: 'planning', duration: 14, milestone: true },
      { name: 'Site Preparation', phase: 'sitework', duration: 7, milestone: false },
      { name: 'Foundation Work', phase: 'foundation', duration: 10, milestone: true },
      { name: 'Structural Systems', phase: 'structure', duration: 21, milestone: true },
      { name: 'Building Envelope', phase: 'envelope', duration: 14, milestone: false },
      { name: 'MEP Rough-In', phase: 'mep', duration: 18, milestone: true },
      { name: 'Interior Finishes', phase: 'finishes', duration: 16, milestone: false },
      { name: 'MEP Trim & Testing', phase: 'mep', duration: 12, milestone: false },
      { name: 'Commissioning', phase: 'commissioning', duration: 7, milestone: true },
      { name: 'Project Closeout', phase: 'closeout', duration: 5, milestone: true }
    ];

    phaseTemplates.forEach((template, index) => {
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + template.duration);

      phases.push({
        id: `phase-${index + 1}`,
        name: template.name,
        description: `${template.name} phase of construction`,
        startDate: new Date(currentDate),
        endDate,
        duration: template.duration,
        sequence: index + 1,
        prerequisites: index > 0 ? [`phase-${index}`] : [],
        activities: [],
        milestone: template.milestone,
        phase: template.phase as ConstructionPhase['phase'],
        status: 'not_started',
        completionPercentage: 0,
        criticalPath: false
      });

      currentDate = new Date(endDate);
    });

    return phases;
  }

  private createActivitiesFromTasks(
    taskEstimates: TaskEstimate[], 
    phases: ConstructionPhase[],
    constraints?: ActivityConstraint[]
  ): ConstructionActivity[] {
    
    const activities: ConstructionActivity[] = [];
    
    taskEstimates.forEach((task, index) => {
      // Determine which phase this task belongs to
      const phase = this.determineTaskPhase(task);
      const phaseObj = phases.find(p => p.phase === phase);
      
      if (!phaseObj) return;

      const startDate = new Date(phaseObj.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + task.duration);

      const activity: ConstructionActivity = {
        id: `activity-${index + 1}`,
        name: task.taskName,
        description: `${task.taskName} - ${task.category}`,
        phase: phaseObj.id,
        duration: task.duration,
        startDate,
        endDate,
        predecessors: [],
        successors: [],
        resources: this.convertTaskResourcesToActivityResources(task),
        constraints: this.getActivityConstraints(task, constraints),
        status: 'not_started',
        completionPercentage: 0,
        criticalPath: false,
        float: 0,
        earlyStart: startDate,
        earlyFinish: endDate,
        lateStart: startDate,
        lateFinish: endDate,
        weather_dependent: this.isWeatherDependent(task),
        quality_checkpoints: this.createQualityCheckpoints(task)
      };

      activities.push(activity);
      phaseObj.activities.push(activity);
    });

    return activities;
  }

  private establishActivityDependencies(activities: ConstructionActivity[]): void {
    // Define typical construction sequence dependencies
    const dependencyRules = [
      { from: 'Foundation', to: 'Structural', relationship: 'FS', lag: 0 },
      { from: 'Structural', to: 'Envelope', relationship: 'FS', lag: 2 },
      { from: 'Envelope', to: 'MEP', relationship: 'FS', lag: 1 },
      { from: 'Electrical Rough', to: 'Electrical Trim', relationship: 'FS', lag: 7 },
      { from: 'Rough', to: 'Finish', relationship: 'FS', lag: 3 }
    ];

    activities.forEach(activity => {
      dependencyRules.forEach(rule => {
        if (activity.name.includes(rule.to)) {
          const predecessor = activities.find(a => a.name.includes(rule.from));
          if (predecessor && predecessor.id !== activity.id) {
            activity.predecessors.push({
              activityId: predecessor.id,
              relationship: rule.relationship as ActivityPredecessor['relationship'],
              lag: rule.lag
            });
            predecessor.successors.push(activity.id);
          }
        }
      });
    });
  }

  private calculateCriticalPath(activities: ConstructionActivity[]): string[] {
    // Forward pass - calculate early start and finish
    activities.forEach(activity => {
      if (activity.predecessors.length === 0) {
        // No predecessors - can start immediately
        activity.earlyStart = activity.startDate;
      } else {
        // Calculate based on predecessors
        let latestFinish = new Date(0);
        activity.predecessors.forEach(pred => {
          const predActivity = activities.find(a => a.id === pred.activityId);
          if (predActivity) {
            const finishWithLag = new Date(predActivity.earlyFinish);
            finishWithLag.setDate(finishWithLag.getDate() + pred.lag);
            if (finishWithLag > latestFinish) {
              latestFinish = finishWithLag;
            }
          }
        });
        activity.earlyStart = latestFinish;
      }
      
      activity.earlyFinish = new Date(activity.earlyStart);
      activity.earlyFinish.setDate(activity.earlyFinish.getDate() + activity.duration);
    });

    // Backward pass - calculate late start and finish
    const projectFinish = Math.max(...activities.map(a => a.earlyFinish.getTime()));
    
    activities.reverse().forEach(activity => {
      if (activity.successors.length === 0) {
        // No successors - late finish is project finish
        activity.lateFinish = new Date(projectFinish);
      } else {
        // Calculate based on successors
        let earliestStart = new Date(projectFinish);
        activity.successors.forEach(succId => {
          const succActivity = activities.find(a => a.id === succId);
          if (succActivity) {
            const pred = succActivity.predecessors.find(p => p.activityId === activity.id);
            const startWithLag = new Date(succActivity.lateStart);
            if (pred) {
              startWithLag.setDate(startWithLag.getDate() - pred.lag);
            }
            if (startWithLag < earliestStart) {
              earliestStart = startWithLag;
            }
          }
        });
        activity.lateFinish = earliestStart;
      }
      
      activity.lateStart = new Date(activity.lateFinish);
      activity.lateStart.setDate(activity.lateStart.getDate() - activity.duration);
      
      // Calculate total float
      activity.float = Math.max(0, 
        (activity.lateStart.getTime() - activity.earlyStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Critical path activities have zero float
      activity.criticalPath = activity.float === 0;
    });

    activities.reverse(); // Restore original order

    return activities.filter(a => a.criticalPath).map(a => a.id);
  }

  private async optimizeResourceAllocation(activities: ConstructionActivity[]): Promise<void> {
    // Simple resource leveling - distribute resource usage more evenly
    const resourceMap = new Map<string, ActivityResource[]>();
    
    // Collect all resources by type
    activities.forEach(activity => {
      activity.resources.forEach(resource => {
        const key = `${resource.type}-${resource.resourceId}`;
        if (!resourceMap.has(key)) {
          resourceMap.set(key, []);
        }
        resourceMap.get(key)?.push(resource);
      });
    });

    // Check for resource conflicts and adjust non-critical activities
    resourceMap.forEach((resources) => {
      // Sort by activity start date
      resources.sort((a, b) => {
        const activityA = activities.find(act => act.resources.includes(a));
        const activityB = activities.find(act => act.resources.includes(b));
        return (activityA?.earlyStart.getTime() || 0) - (activityB?.earlyStart.getTime() || 0);
      });

      // Identify overlapping resource usage
      for (let i = 0; i < resources.length - 1; i++) {
        const currentActivity = activities.find(act => act.resources.includes(resources[i]));
        const nextActivity = activities.find(act => act.resources.includes(resources[i + 1]));
        
        if (currentActivity && nextActivity && !currentActivity.criticalPath && 
            currentActivity.earlyFinish > nextActivity.earlyStart) {
          // Delay the non-critical activity
          const delay = Math.ceil(
            (currentActivity.earlyFinish.getTime() - nextActivity.earlyStart.getTime()) / (1000 * 60 * 60 * 24)
          );
          nextActivity.earlyStart.setDate(nextActivity.earlyStart.getDate() + delay);
          nextActivity.earlyFinish.setDate(nextActivity.earlyFinish.getDate() + delay);
        }
      }
    });
  }

  // Additional helper methods for comprehensive scheduling...

  private determineTaskPhase(task: TaskEstimate): string {
    const taskName = task.taskName.toLowerCase();
    
    if (taskName.includes('foundation') || taskName.includes('footing')) {
      return 'foundation';
    } else if (taskName.includes('structural') || taskName.includes('frame')) {
      return 'structure';
    } else if (taskName.includes('rough') || taskName.includes('electrical rough')) {
      return 'mep';
    } else if (taskName.includes('finish') || taskName.includes('trim')) {
      return 'finishes';
    } else if (taskName.includes('envelope') || taskName.includes('roofing')) {
      return 'envelope';
    } else if (taskName.includes('site') || taskName.includes('excavation')) {
      return 'sitework';
    } else {
      return 'mep'; // Default for electrical/lighting work
    }
  }

  private convertTaskResourcesToActivityResources(task: TaskEstimate): ActivityResource[] {
    const resources: ActivityResource[] = [];
    
    // Convert labor resources
    task.labor.forEach(labor => {
      resources.push({
        type: 'labor',
        resourceId: labor.trade,
        quantity: labor.hours / 8, // Convert hours to crew-days
        unit: 'crew-days',
        availability: [],
        cost: labor.total,
        critical: labor.trade.includes('Electrician')
      });
    });

    // Convert material resources
    task.materials.forEach(material => {
      resources.push({
        type: 'material',
        resourceId: material.id,
        quantity: material.quantity,
        unit: 'units',
        availability: [],
        cost: material.total,
        critical: false
      });
    });

    // Convert equipment resources
    task.equipment.forEach(equipment => {
      resources.push({
        type: 'equipment',
        resourceId: equipment.id,
        quantity: equipment.duration,
        unit: 'days',
        availability: [],
        cost: equipment.total,
        critical: equipment.id.includes('LIFT')
      });
    });

    return resources;
  }

  private getActivityConstraints(task: TaskEstimate, globalConstraints?: ActivityConstraint[]): ActivityConstraint[] {
    const constraints: ActivityConstraint[] = [];
    
    // Add global constraints if they apply to this task
    if (globalConstraints) {
      constraints.push(...globalConstraints);
    }

    // Add task-specific constraints based on task type
    if (task.taskName.includes('Foundation')) {
      constraints.push({
        type: 'start_no_earlier_than',
        date: new Date(), // Can't start until permits are ready
        reason: 'Foundation permit required'
      });
    }

    return constraints;
  }

  private isWeatherDependent(task: TaskEstimate): boolean {
    const weatherSensitive = [
      'foundation', 'concrete', 'roofing', 'siding', 'exterior', 'site work', 'excavation'
    ];
    
    return weatherSensitive.some(keyword => 
      task.taskName.toLowerCase().includes(keyword) || 
      task.category.toLowerCase().includes(keyword)
    );
  }

  private createQualityCheckpoints(task: TaskEstimate): QualityCheckpoint[] {
    const checkpoints: QualityCheckpoint[] = [];
    
    if (task.category === 'Electrical') {
      checkpoints.push({
        id: `qc-${task.id}-1`,
        name: 'Rough Electrical Inspection',
        description: 'Verify electrical rough-in meets code requirements',
        inspector: 'Electrical Inspector',
        required: true,
        status: 'pending'
      });
      
      if (task.taskName.includes('Finish') || task.taskName.includes('Trim')) {
        checkpoints.push({
          id: `qc-${task.id}-2`,
          name: 'Final Electrical Inspection',
          description: 'Final electrical inspection and testing',
          inspector: 'Electrical Inspector',
          required: true,
          status: 'pending'
        });
      }
    }

    return checkpoints;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createProjectMilestones(phases: ConstructionPhase[], activities: ConstructionActivity[]): Milestone[] {
    const milestones: Milestone[] = [];
    
    phases.filter(p => p.milestone).forEach((phase, index) => {
      milestones.push({
        id: `milestone-${index + 1}`,
        name: `${phase.name} Complete`,
        description: `Completion of ${phase.name} phase`,
        targetDate: phase.endDate,
        status: 'upcoming',
        dependencies: phase.activities.map(a => a.id),
        importance: phase.phase === 'foundation' || phase.phase === 'commissioning' ? 'critical' : 'high'
      });
    });

    return milestones;
  }

  private calculateFinalSchedule(activities: ConstructionActivity[], startDate: Date): { start: Date; finish: Date } {
    const latestFinish = Math.max(...activities.map(a => a.earlyFinish.getTime()));
    return {
      start: startDate,
      finish: new Date(latestFinish)
    };
  }

  private calculateDuration(startDate: Date, endDate: Date): number {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private applyWeatherConstraints(activities: ConstructionActivity[], _projectData: ProjectData): void {
    // Apply weather constraints to weather-dependent activities
    const weatherConstraints = this.getWeatherConstraints(_projectData);
    
    activities.forEach(activity => {
      if (activity.weather_dependent) {
        weatherConstraints.forEach(constraint => {
          // Add buffer days for weather-dependent activities
          activity.duration += constraint.bufferDays;
          activity.endDate = new Date(activity.startDate.getTime() + activity.duration * 24 * 60 * 60 * 1000);
        });
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getWeatherConstraints(_projectData: ProjectData): WeatherConstraint[] {
    return [
      {
        activityIds: [], // Would be populated with weather-dependent activities
        constraint: 'no_rain',
        bufferDays: 3,
        seasonalRestriction: { startMonth: 11, endMonth: 3 }
      },
      {
        activityIds: [],
        constraint: 'temperature_above',
        threshold: 32,
        bufferDays: 2
      }
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getScheduleRiskMitigations(_projectData: ProjectData): ScheduleRiskMitigation[] {
    return [
      {
        riskId: 'weather-delays',
        description: 'Weather-related construction delays',
        probability: 0.4,
        impact: 5,
        mitigation: 'Build weather buffer into critical activities',
        contingencyBuffer: 3,
        triggerConditions: ['Extended precipitation forecast', 'Temperature below freezing']
      },
      {
        riskId: 'material-delays',
        description: 'Long-lead material delivery delays',
        probability: 0.3,
        impact: 7,
        mitigation: 'Order materials with lead time buffer',
        contingencyBuffer: 5,
        triggerConditions: ['Supplier delay notification', 'Supply chain disruption']
      }
    ];
  }

  // Analysis and optimization methods...

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private analyzeResourceUtilization(activities: ConstructionActivity[]): ResourceUtilization[] {
    const utilization: ResourceUtilization[] = [];
    
    // Group resources by type and ID
    const resourceMap = new Map<string, ActivityResource[]>();
    activities.forEach(activity => {
      activity.resources.forEach(resource => {
        const key = `${resource.type}-${resource.resourceId}`;
        if (!resourceMap.has(key)) {
          resourceMap.set(key, []);
        }
        resourceMap.get(key)?.push(resource);
      });
    });

    resourceMap.forEach((resources, resourceKey) => {
      utilization.push({
        resourceId: resourceKey,
        resourceType: resources[0].type,
        peakUtilization: 100, // Simplified calculation
        averageUtilization: 75,
        overallocationPeriods: [],
        underutilizationPeriods: []
      });
    });

    return utilization;
  }

  private identifyBottlenecks(schedule: ProjectSchedule): ScheduleBottleneck[] {
    const bottlenecks: ScheduleBottleneck[] = [];

    // Critical path is a natural bottleneck
    if (schedule.criticalPath.length > 0) {
      bottlenecks.push({
        type: 'activity',
        description: 'Critical path activities with no float',
        impact: 0,
        affectedActivities: schedule.criticalPath,
        recommendations: ['Monitor critical activities closely', 'Consider fast-tracking options'],
        severity: 'high'
      });
    }

    return bottlenecks;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private assessScheduleRisks(_schedule: ProjectSchedule): ScheduleRiskAssessment {
    return {
      overallRisk: 'medium',
      scheduleVariance: 10,
      probabilityOfDelay: 35,
      expectedDelay: 3,
      keyRisks: [
        {
          category: 'Weather',
          description: 'Seasonal weather delays',
          probability: 0.4,
          impact: 5
        },
        {
          category: 'Resources',
          description: 'Labor availability',
          probability: 0.3,
          impact: 7
        }
      ],
      mitigationEffectiveness: 75
    };
  }

  private generateRecommendations(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _schedule: ProjectSchedule, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _utilization: ResourceUtilization[], 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _bottlenecks: ScheduleBottleneck[]
  ): ScheduleRecommendation[] {
    return [
      {
        category: 'sequencing',
        priority: 'high',
        title: 'Fast-track electrical rough-in',
        description: 'Begin electrical rough-in in completed areas before all framing is complete',
        impact: 'Could save 3-5 days on overall schedule',
        effort: 'Medium - requires coordination between trades',
        costBenefit: 0.8
      },
      {
        category: 'resources',
        priority: 'medium',
        title: 'Add electrical crew during peak period',
        description: 'Supplement primary electrical crew during high-demand periods',
        impact: 'Reduce electrical phase duration by 2 days',
        effort: 'Low - hire additional qualified electricians',
        costBenefit: 0.6
      }
    ];
  }

  private generateWhatIfScenarios(schedule: ProjectSchedule): WhatIfScenario[] {
    return [
      {
        name: 'Fast Track MEP',
        description: 'Overlap MEP rough-in with structural work',
        assumptions: ['Adequate coordination', 'Structural work allows access'],
        adjustments: [
          {
            activityId: 'activity-electrical-rough',
            durationChange: -2
          }
        ],
        results: {
          newFinishDate: new Date(schedule.forecastFinish.getTime() - 2 * 24 * 60 * 60 * 1000),
          scheduleVariance: -5,
          costImpact: 5000,
          riskLevel: 'medium'
        }
      }
    ];
  }

  private calculateCriticalPathLength(activities: ConstructionActivity[]): number {
    return activities.filter(a => a.criticalPath).reduce((sum, a) => sum + a.duration, 0);
  }

  private calculateTotalFloat(activities: ConstructionActivity[]): number {
    return activities.reduce((sum, a) => sum + a.float, 0);
  }

  private recalculateForecasts(schedule: ProjectSchedule): void {
    // Recalculate based on actual progress vs planned
    const completedActivities = schedule.activities.filter(a => a.status === 'completed');
    // const inProgressActivities = schedule.activities.filter(a => a.status === 'in_progress');
    
    // Update forecast finish date based on actual progress
    // Simplified calculation - would be more complex in practice
    let totalDelay = 0;
    completedActivities.forEach(activity => {
      if (activity.actualFinish && activity.actualFinish > activity.endDate) {
        const delay = (activity.actualFinish.getTime() - activity.endDate.getTime()) / (1000 * 60 * 60 * 24);
        totalDelay += delay;
      }
    });

    schedule.forecastFinish = new Date(schedule.baselineFinish.getTime() + totalDelay * 24 * 60 * 60 * 1000);
  }

  private updatePhaseProgress(schedule: ProjectSchedule): void {
    schedule.phases.forEach(phase => {
      const phaseActivities = schedule.activities.filter(a => a.phase === phase.id);
      const totalActivities = phaseActivities.length;
      const completedActivities = phaseActivities.filter(a => a.status === 'completed').length;
      
      phase.completionPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
      
      if (phase.completionPercentage === 100) {
        phase.status = 'completed';
      } else if (phase.completionPercentage > 0) {
        phase.status = 'in_progress';
      }
    });
  }

  private updateMilestoneStatus(schedule: ProjectSchedule): void {
    schedule.milestones.forEach(milestone => {
      const dependentActivities = schedule.activities.filter(a => 
        milestone.dependencies.includes(a.id)
      );
      
      const allComplete = dependentActivities.every(a => a.status === 'completed');
      const anyStarted = dependentActivities.some(a => a.status !== 'not_started');
      
      if (allComplete) {
        milestone.status = 'achieved';
        milestone.actualDate = new Date();
      } else if (anyStarted && new Date() > milestone.targetDate) {
        milestone.status = 'at_risk';
      }
    });
  }

  private levelResources(_activities: ConstructionActivity[]): void {
    // Resource leveling algorithm to smooth resource usage
    // Simplified implementation
    logger.info('api', 'Applying resource leveling to activities', { data: { count: _activities.length } });
  }

  private compressSchedule(activities: ConstructionActivity[]): void {
    // Schedule compression techniques (crashing, fast-tracking)
    logger.info('api', 'Applying schedule compression to activities', { data: { count: activities.length } });
  }

  private applyOvertimeOptions(activities: ConstructionActivity[]): void {
    // Apply overtime to critical activities to reduce duration
    activities.filter(a => a.criticalPath).forEach(activity => {
      // Reduce duration by 10% through overtime (simplified)
      activity.duration = Math.ceil(activity.duration * 0.9);
    });
  }

  private applyScheduleBuffers(schedule: ProjectSchedule, options: ScheduleOptimizationOptions): void {
    // Add buffers for weather, quality, and risk
    const bufferDays = options.weatherBufferDays + 
                      Math.ceil(schedule.totalDuration * options.qualityBuffer / 100) +
                      Math.ceil(schedule.totalDuration * options.riskBuffer / 100);
    
    schedule.forecastFinish = new Date(schedule.forecastFinish.getTime() + bufferDays * 24 * 60 * 60 * 1000);
    schedule.totalDuration += bufferDays;
  }

  private getDefaultResourceCalendar(): ResourceCalendar {
    return {
      workDays: [1, 2, 3, 4, 5], // Monday-Friday
      workHours: { start: 7, end: 17 }, // 7 AM - 5 PM
      holidays: [
        new Date(2024, 6, 4), // July 4th
        new Date(2024, 11, 25), // Christmas
        new Date(2024, 0, 1) // New Year's
      ],
      shutdownPeriods: [],
      overtime: {
        authorized: true,
        maxHoursPerDay: 12,
        maxHoursPerWeek: 60,
        costMultiplier: 1.5
      }
    };
  }

  private getDefaultOptimizationOptions(): ScheduleOptimizationOptions {
    return {
      prioritizeFinishDate: true,
      prioritizeCost: false,
      allowOvertime: true,
      allowResourceLeveling: true,
      weatherBufferDays: 5,
      qualityBuffer: 3, // 3%
      riskBuffer: 5 // 5%
    };
  }

  private generateProjectId(): string {
    return `PROJ-SCHED-${Date.now().toString(36).toUpperCase()}`;
  }
}