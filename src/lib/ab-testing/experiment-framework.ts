import { logger } from '@/lib/logging/production-logger';
/**
 * A/B Testing Framework for ML Features
 * Enables data-driven experimentation for ML models and features
 */

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  type: 'feature_flag' | 'ml_model' | 'ui_variant' | 'algorithm' | 'parameter_tuning';
  
  // Targeting
  targeting: {
    percentage: number; // 0-100, percentage of users to include
    userSegments?: string[]; // premium, free, admin, etc.
    geoTargets?: string[]; // country codes
    platforms?: string[]; // web, mobile, api
    conditions?: Record<string, any>; // custom conditions
  };
  
  // Variants
  variants: ExperimentVariant[];
  
  // Metrics
  primaryMetric: string;
  secondaryMetrics: string[];
  successCriteria: {
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equal_to';
    value: number;
    confidence: number; // 90, 95, 99
  };
  
  // Duration
  startDate: Date;
  endDate: Date;
  estimatedDuration?: number; // days
  
  // Analysis
  statisticalSignificance?: number;
  results?: ExperimentResults;
  
  // Metadata
  creator: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficAllocation: number; // percentage of experiment traffic
  
  // Configuration
  config: Record<string, any>;
  
  // ML-specific
  modelId?: string;
  algorithmType?: string;
  hyperparameters?: Record<string, any>;
  featureSet?: string[];
  
  // UI-specific
  componentProps?: Record<string, any>;
  styleOverrides?: Record<string, any>;
}

export interface ExperimentResults {
  totalUsers: number;
  conversionData: {
    [variantId: string]: {
      users: number;
      conversions: number;
      conversionRate: number;
      confidenceInterval: { lower: number; upper: number };
    };
  };
  metricData: {
    [metric: string]: {
      [variantId: string]: {
        mean: number;
        median: number;
        standardDeviation: number;
        sampleSize: number;
        percentiles: { p25: number; p50: number; p75: number; p95: number };
      };
    };
  };
  statisticalTests: {
    [variantId: string]: {
      pValue: number;
      significance: boolean;
      effect: 'positive' | 'negative' | 'neutral';
      liftPercentage: number;
    };
  };
  recommendations: string[];
  winner?: string;
  conclusive: boolean;
}

export interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  context: Record<string, any>;
}

export interface ExperimentEvent {
  id: string;
  experimentId: string;
  variantId: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  context: Record<string, any>;
}

export class ExperimentFramework {
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, UserAssignment[]> = new Map();
  private events: ExperimentEvent[] = [];

  /**
   * Create a new experiment
   */
  async createExperiment(experimentData: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Experiment> {
    const experiment: Experiment = {
      ...experimentData,
      id: this.generateExperimentId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate experiment
    this.validateExperiment(experiment);

    // Store experiment
    this.experiments.set(experiment.id, experiment);

    logger.info('api', `🧪 Created experiment: ${experiment.name} (${experiment.id})`);
    return experiment;
  }

  /**
   * Get user's variant for an experiment
   */
  async getVariant(experimentId: string, userId: string, context: Record<string, any> = {}): Promise<ExperimentVariant | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user is already assigned
    const existingAssignment = this.getUserAssignment(userId, experimentId);
    if (existingAssignment) {
      const variant = experiment.variants.find(v => v.id === existingAssignment.variantId);
      return variant || null;
    }

    // Check if user should be included in experiment
    if (!this.shouldIncludeUser(experiment, userId, context)) {
      return null;
    }

    // Assign user to variant
    const variant = this.assignUserToVariant(experiment, userId, context);
    
    if (variant) {
      // Record assignment
      const assignment: UserAssignment = {
        userId,
        experimentId,
        variantId: variant.id,
        assignedAt: new Date(),
        context
      };

      if (!this.userAssignments.has(userId)) {
        this.userAssignments.set(userId, []);
      }
      this.userAssignments.get(userId)!.push(assignment);

      // Track assignment event
      await this.trackEvent({
        experimentId,
        variantId: variant.id,
        userId,
        eventType: 'experiment_assignment',
        eventData: { context },
        timestamp: new Date(),
        context
      });
    }

    return variant;
  }

  /**
   * Track experiment event
   */
  async trackEvent(eventData: Omit<ExperimentEvent, 'id'>): Promise<void> {
    const event: ExperimentEvent = {
      ...eventData,
      id: this.generateEventId()
    };

    this.events.push(event);

    logger.info('api', `📊 Tracked event: ${event.eventType} for experiment ${event.experimentId}`);

    // In production, this would:
    // 1. Send to analytics platform
    // 2. Update real-time dashboards
    // 3. Trigger statistical analysis
  }

  /**
   * Get experiment results with statistical analysis
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const events = this.events.filter(e => e.experimentId === experimentId);
    const assignments = Array.from(this.userAssignments.values())
      .flat()
      .filter(a => a.experimentId === experimentId);

    // Calculate conversion data
    const conversionData = this.calculateConversions(experiment, events, assignments);
    
    // Calculate metric data
    const metricData = this.calculateMetrics(experiment, events);
    
    // Perform statistical tests
    const statisticalTests = this.performStatisticalTests(experiment, conversionData, metricData);

    const results: ExperimentResults = {
      totalUsers: assignments.length,
      conversionData,
      metricData,
      statisticalTests,
      recommendations: this.generateRecommendations(experiment, statisticalTests),
      winner: this.determineWinner(statisticalTests),
      conclusive: this.isConclusive(statisticalTests, experiment.successCriteria)
    };

    // Update experiment with results
    experiment.results = results;
    experiment.updatedAt = new Date();

    return results;
  }

  /**
   * ML-specific experiment creation helpers
   */
  
  /**
   * Create model comparison experiment
   */
  async createModelComparison(config: {
    name: string;
    description: string;
    models: Array<{
      id: string;
      name: string;
      type: string;
      hyperparameters: Record<string, any>;
    }>;
    trafficSplit: number[];
    primaryMetric: string;
    duration: number;
  }): Promise<Experiment> {
    const variants: ExperimentVariant[] = config.models.map((model, index) => ({
      id: `variant_${index + 1}`,
      name: model.name,
      description: `Model: ${model.type}`,
      isControl: index === 0,
      trafficAllocation: config.trafficSplit[index] || 0,
      config: {},
      modelId: model.id,
      algorithmType: model.type,
      hyperparameters: model.hyperparameters
    }));

    return this.createExperiment({
      name: config.name,
      description: config.description,
      status: 'draft',
      type: 'ml_model',
      targeting: { percentage: 100 },
      variants,
      primaryMetric: config.primaryMetric,
      secondaryMetrics: ['accuracy', 'precision', 'recall', 'response_time'],
      successCriteria: {
        metric: config.primaryMetric,
        operator: 'greater_than',
        value: 0.05, // 5% improvement
        confidence: 95
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + config.duration * 24 * 60 * 60 * 1000),
      creator: 'ml_team',
      tags: ['ml', 'model_comparison']
    });
  }

  /**
   * Create feature engineering experiment
   */
  async createFeatureExperiment(config: {
    name: string;
    description: string;
    featureSets: Array<{
      name: string;
      features: string[];
      description: string;
    }>;
    model: string;
    targetMetric: string;
  }): Promise<Experiment> {
    const variants: ExperimentVariant[] = config.featureSets.map((featureSet, index) => ({
      id: `features_${index + 1}`,
      name: featureSet.name,
      description: featureSet.description,
      isControl: index === 0,
      trafficAllocation: 100 / config.featureSets.length,
      config: {},
      featureSet: featureSet.features,
      modelId: config.model
    }));

    return this.createExperiment({
      name: config.name,
      description: config.description,
      status: 'draft',
      type: 'feature_flag',
      targeting: { percentage: 50 }, // Start with 50% of users
      variants,
      primaryMetric: config.targetMetric,
      secondaryMetrics: ['model_confidence', 'prediction_accuracy'],
      successCriteria: {
        metric: config.targetMetric,
        operator: 'greater_than',
        value: 0.03, // 3% improvement
        confidence: 90
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      creator: 'data_science_team',
      tags: ['ml', 'feature_engineering']
    });
  }

  // Private helper methods

  private validateExperiment(experiment: Experiment): void {
    // Validate traffic allocation
    const totalAllocation = experiment.variants.reduce((sum, v) => sum + v.trafficAllocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Variant traffic allocation must sum to 100%');
    }

    // Ensure exactly one control
    const controlCount = experiment.variants.filter(v => v.isControl).length;
    if (controlCount !== 1) {
      throw new Error('Exactly one variant must be marked as control');
    }

    // Validate dates
    if (experiment.endDate <= experiment.startDate) {
      throw new Error('End date must be after start date');
    }
  }

  private shouldIncludeUser(experiment: Experiment, userId: string, context: Record<string, any>): boolean {
    // Check percentage targeting
    const userHash = this.hashString(userId + experiment.id);
    const userPercentile = userHash % 100;
    
    if (userPercentile >= experiment.targeting.percentage) {
      return false;
    }

    // Check segment targeting
    if (experiment.targeting.userSegments && context.userSegment) {
      if (!experiment.targeting.userSegments.includes(context.userSegment)) {
        return false;
      }
    }

    // Check geo targeting
    if (experiment.targeting.geoTargets && context.country) {
      if (!experiment.targeting.geoTargets.includes(context.country)) {
        return false;
      }
    }

    // Check platform targeting
    if (experiment.targeting.platforms && context.platform) {
      if (!experiment.targeting.platforms.includes(context.platform)) {
        return false;
      }
    }

    return true;
  }

  private assignUserToVariant(experiment: Experiment, userId: string, context: Record<string, any>): ExperimentVariant | null {
    // Use consistent hashing for stable assignments
    const hash = this.hashString(userId + experiment.id);
    const percentile = hash % 100;

    let cumulativeAllocation = 0;
    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.trafficAllocation;
      if (percentile < cumulativeAllocation) {
        return variant;
      }
    }

    return null;
  }

  private getUserAssignment(userId: string, experimentId: string): UserAssignment | null {
    const assignments = this.userAssignments.get(userId) || [];
    return assignments.find(a => a.experimentId === experimentId) || null;
  }

  private calculateConversions(
    experiment: Experiment, 
    events: ExperimentEvent[], 
    assignments: UserAssignment[]
  ): ExperimentResults['conversionData'] {
    const conversionData: ExperimentResults['conversionData'] = {};

    for (const variant of experiment.variants) {
      const variantAssignments = assignments.filter(a => a.variantId === variant.id);
      const variantEvents = events.filter(e => e.variantId === variant.id && e.eventType === 'conversion');
      
      const users = variantAssignments.length;
      const conversions = new Set(variantEvents.map(e => e.userId)).size;
      const conversionRate = users > 0 ? conversions / users : 0;

      // Calculate confidence interval (simplified)
      const z = 1.96; // 95% confidence
      const se = Math.sqrt((conversionRate * (1 - conversionRate)) / users);
      const margin = z * se;

      conversionData[variant.id] = {
        users,
        conversions,
        conversionRate,
        confidenceInterval: {
          lower: Math.max(0, conversionRate - margin),
          upper: Math.min(1, conversionRate + margin)
        }
      };
    }

    return conversionData;
  }

  private calculateMetrics(experiment: Experiment, events: ExperimentEvent[]): ExperimentResults['metricData'] {
    const metricData: ExperimentResults['metricData'] = {};

    const allMetrics = [experiment.primaryMetric, ...experiment.secondaryMetrics];

    for (const metric of allMetrics) {
      metricData[metric] = {};

      for (const variant of experiment.variants) {
        const variantEvents = events.filter(e => 
          e.variantId === variant.id && 
          e.eventData[metric] !== undefined
        );

        const values = variantEvents.map(e => Number(e.eventData[metric])).filter(v => !isNaN(v));
        
        if (values.length > 0) {
          const sorted = values.sort((a, b) => a - b);
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
          const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

          metricData[metric][variant.id] = {
            mean,
            median: sorted[Math.floor(sorted.length / 2)],
            standardDeviation: Math.sqrt(variance),
            sampleSize: values.length,
            percentiles: {
              p25: sorted[Math.floor(sorted.length * 0.25)],
              p50: sorted[Math.floor(sorted.length * 0.5)],
              p75: sorted[Math.floor(sorted.length * 0.75)],
              p95: sorted[Math.floor(sorted.length * 0.95)]
            }
          };
        }
      }
    }

    return metricData;
  }

  private performStatisticalTests(
    experiment: Experiment,
    conversionData: ExperimentResults['conversionData'],
    metricData: ExperimentResults['metricData']
  ): ExperimentResults['statisticalTests'] {
    const statisticalTests: ExperimentResults['statisticalTests'] = {};
    const control = experiment.variants.find(v => v.isControl);
    
    if (!control) return statisticalTests;

    for (const variant of experiment.variants) {
      if (variant.isControl) continue;

      // Simplified statistical test (in production, use proper statistical libraries)
      const controlConversion = conversionData[control.id];
      const variantConversion = conversionData[variant.id];

      let pValue = 0.5;
      let liftPercentage = 0;

      if (controlConversion && variantConversion && controlConversion.users > 0 && variantConversion.users > 0) {
        liftPercentage = ((variantConversion.conversionRate - controlConversion.conversionRate) / controlConversion.conversionRate) * 100;
        
        // Simplified z-test for proportions
        const p1 = controlConversion.conversionRate;
        const p2 = variantConversion.conversionRate;
        const n1 = controlConversion.users;
        const n2 = variantConversion.users;
        
        const pooledP = (controlConversion.conversions + variantConversion.conversions) / (n1 + n2);
        const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
        const z = Math.abs(p2 - p1) / se;
        
        // Approximate p-value
        if (z > 2.58) pValue = 0.01;
        else if (z > 1.96) pValue = 0.05;
        else if (z > 1.64) pValue = 0.1;
        else pValue = 0.5;
      }

      statisticalTests[variant.id] = {
        pValue,
        significance: pValue < 0.05,
        effect: liftPercentage > 0 ? 'positive' : liftPercentage < 0 ? 'negative' : 'neutral',
        liftPercentage
      };
    }

    return statisticalTests;
  }

  private generateRecommendations(experiment: Experiment, statisticalTests: ExperimentResults['statisticalTests']): string[] {
    const recommendations = [];

    const significantVariants = Object.entries(statisticalTests).filter(([_, test]) => test.significance);
    
    if (significantVariants.length === 0) {
      recommendations.push('No statistically significant differences found. Consider running the experiment longer or increasing sample size.');
    } else {
      const bestVariant = significantVariants.reduce((best, [variantId, test]) => 
        test.liftPercentage > (statisticalTests[best] || { liftPercentage: -Infinity }).liftPercentage ? variantId : best
      , '');

      if (bestVariant) {
        const variant = experiment.variants.find(v => v.id === bestVariant);
        const test = statisticalTests[bestVariant];
        recommendations.push(`Consider implementing ${variant?.name} - shows ${test.liftPercentage.toFixed(1)}% improvement`);
      }
    }

    // ML-specific recommendations
    if (experiment.type === 'ml_model') {
      recommendations.push('Monitor model performance in production and set up automated retraining triggers');
      recommendations.push('Collect user feedback on prediction quality to validate statistical improvements');
    }

    return recommendations;
  }

  private determineWinner(statisticalTests: ExperimentResults['statisticalTests']): string | undefined {
    const significantPositive = Object.entries(statisticalTests)
      .filter(([_, test]) => test.significance && test.effect === 'positive')
      .sort(([_, a], [__, b]) => b.liftPercentage - a.liftPercentage);

    return significantPositive.length > 0 ? significantPositive[0][0] : undefined;
  }

  private isConclusive(statisticalTests: ExperimentResults['statisticalTests'], successCriteria: Experiment['successCriteria']): boolean {
    return Object.values(statisticalTests).some(test => 
      test.significance && Math.abs(test.liftPercentage) >= successCriteria.value * 100
    );
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private generateExperimentId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

export default ExperimentFramework;