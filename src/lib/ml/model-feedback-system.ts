/**
 * ML Model Feedback and Correction System
 * Enables user feedback on model predictions and automated retraining
 */

export interface ModelPrediction {
  id: string;
  modelId: string;
  modelVersion: string;
  userId: string;
  
  // Input data
  inputFeatures: Record<string, number>;
  inputContext: Record<string, any>;
  
  // Prediction
  prediction: {
    value: number | string;
    confidence: number;
    alternatives?: Array<{ value: number | string; confidence: number }>;
  };
  
  // Metadata
  timestamp: Date;
  predictionType: 'yield' | 'quality' | 'anomaly' | 'recommendation';
  sessionId?: string;
}

export interface UserFeedback {
  id: string;
  predictionId: string;
  userId: string;
  
  // Feedback content
  feedbackType: 'accuracy' | 'usefulness' | 'correction' | 'validation';
  rating?: number; // 1-5 scale
  correctValue?: number | string;
  comments?: string;
  
  // Context
  actualOutcome?: number | string;
  timeTaken?: number; // seconds to provide feedback
  feedbackContext: Record<string, any>;
  
  // Quality indicators
  confidence: number; // How confident is the user in their feedback
  verified: boolean; // Has this feedback been verified/validated
  
  timestamp: Date;
}

export interface ModelPerformanceMetrics {
  modelId: string;
  version: string;
  period: {
    start: Date;
    end: Date;
  };
  
  // Accuracy metrics
  accuracy: {
    overall: number;
    byConfidenceLevel: { [confidence: string]: number };
    byPredictionType: { [type: string]: number };
    trend: 'improving' | 'declining' | 'stable';
  };
  
  // User satisfaction
  userSatisfaction: {
    averageRating: number;
    ratingDistribution: { [rating: string]: number };
    usefulnessScore: number;
    feedbackVolume: number;
  };
  
  // Prediction distribution
  predictionDistribution: {
    confidenceLevels: { [range: string]: number };
    predictionTypes: { [type: string]: number };
    errorTypes: { [type: string]: number };
  };
  
  // Learning insights
  commonErrors: Array<{
    pattern: string;
    frequency: number;
    impact: 'high' | 'medium' | 'low';
    suggestedFix: string;
  }>;
  
  featureImpact: { [feature: string]: number };
  dataQualityIssues: string[];
  
  // Recommendations
  retrainingRecommended: boolean;
  improvementOpportunities: string[];
}

export interface RetrainingTrigger {
  id: string;
  modelId: string;
  triggerType: 'performance_degradation' | 'user_feedback' | 'data_drift' | 'scheduled' | 'manual';
  
  // Trigger conditions
  conditions: {
    accuracyThreshold?: number;
    feedbackScoreThreshold?: number;
    timeWindow?: number; // days
    minimumSamples?: number;
  };
  
  // Status
  isActive: boolean;
  lastTriggered?: Date;
  triggeredBy?: string;
  
  // Configuration
  cooldownPeriod: number; // days between triggers
  autoRetrainEnabled: boolean;
  requiresApproval: boolean;
}

export interface ModelCorrectionSuggestion {
  id: string;
  modelId: string;
  
  // Issue identification
  issueType: 'systematic_bias' | 'feature_importance' | 'data_quality' | 'algorithm_limitation';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  // Evidence
  affectedPredictions: string[];
  feedbackEvidence: UserFeedback[];
  statisticalEvidence: Record<string, number>;
  
  // Suggested corrections
  corrections: Array<{
    type: 'retrain' | 'feature_engineering' | 'hyperparameter_tuning' | 'data_augmentation';
    description: string;
    estimatedImpact: number; // 0-1 scale
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
  }>;
  
  // Status
  status: 'identified' | 'in_progress' | 'implemented' | 'rejected';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ModelFeedbackSystem {
  private predictions: Map<string, ModelPrediction> = new Map();
  private feedback: UserFeedback[] = [];
  private retrainingTriggers: Map<string, RetrainingTrigger> = new Map();
  private correctionSuggestions: ModelCorrectionSuggestion[] = [];

  constructor() {
    this.initializeDefaultTriggers();
  }

  /**
   * Record a model prediction for feedback tracking
   */
  async recordPrediction(predictionData: Omit<ModelPrediction, 'id' | 'timestamp'>): Promise<ModelPrediction> {
    const prediction: ModelPrediction = {
      ...predictionData,
      id: this.generatePredictionId(),
      timestamp: new Date()
    };

    this.predictions.set(prediction.id, prediction);
    
    logger.info('api', `🔮 Recorded prediction: ${prediction.predictionType} for user ${prediction.userId}`);
    return prediction;
  }

  /**
   * Submit user feedback on a prediction
   */
  async submitFeedback(feedbackData: Omit<UserFeedback, 'id' | 'timestamp'>): Promise<UserFeedback> {
    const feedback: UserFeedback = {
      ...feedbackData,
      id: this.generateFeedbackId(),
      timestamp: new Date()
    };

    this.feedback.push(feedback);
    
    // Process feedback immediately
    await this.processFeedback(feedback);
    
    logger.info('api', `💬 Feedback submitted: ${feedback.feedbackType} for prediction ${feedback.predictionId}`);
    return feedback;
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(
    modelId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ModelPerformanceMetrics> {
    const modelPredictions = Array.from(this.predictions.values()).filter(p => 
      p.modelId === modelId && 
      p.timestamp >= startDate && 
      p.timestamp <= endDate
    );

    const modelFeedback = this.feedback.filter(f => {
      const prediction = this.predictions.get(f.predictionId);
      return prediction?.modelId === modelId && 
             f.timestamp >= startDate && 
             f.timestamp <= endDate;
    });

    // Calculate accuracy metrics
    const accuracy = this.calculateAccuracyMetrics(modelPredictions, modelFeedback);
    
    // Calculate user satisfaction
    const userSatisfaction = this.calculateUserSatisfaction(modelFeedback);
    
    // Calculate prediction distribution
    const predictionDistribution = this.calculatePredictionDistribution(modelPredictions);
    
    // Identify common errors and insights
    const commonErrors = this.identifyCommonErrors(modelPredictions, modelFeedback);
    const featureImpact = this.calculateFeatureImpact(modelPredictions, modelFeedback);
    
    // Generate recommendations
    const retrainingRecommended = this.shouldRecommendRetraining(accuracy, userSatisfaction);
    const improvementOpportunities = this.identifyImprovementOpportunities(
      accuracy, userSatisfaction, commonErrors
    );

    return {
      modelId,
      version: modelPredictions[0]?.modelVersion || 'unknown',
      period: { start: startDate, end: endDate },
      accuracy,
      userSatisfaction,
      predictionDistribution,
      commonErrors,
      featureImpact,
      dataQualityIssues: [],
      retrainingRecommended,
      improvementOpportunities
    };
  }

  /**
   * Create feedback collection UI for predictions
   */
  async createFeedbackInterface(predictionId: string): Promise<{
    prediction: ModelPrediction;
    feedbackOptions: Array<{
      type: string;
      label: string;
      description: string;
      inputType: 'rating' | 'text' | 'number' | 'boolean';
    }>;
  }> {
    const prediction = this.predictions.get(predictionId);
    if (!prediction) {
      throw new Error(`Prediction ${predictionId} not found`);
    }

    // Generate contextual feedback options based on prediction type
    const feedbackOptions = this.generateFeedbackOptions(prediction);

    return { prediction, feedbackOptions };
  }

  /**
   * Analyze feedback patterns and suggest model corrections
   */
  async analyzeFeedbackPatterns(modelId: string): Promise<ModelCorrectionSuggestion[]> {
    const modelFeedback = this.feedback.filter(f => {
      const prediction = this.predictions.get(f.predictionId);
      return prediction?.modelId === modelId;
    });

    const suggestions: ModelCorrectionSuggestion[] = [];

    // Analyze for systematic bias
    const biasAnalysis = this.analyzeBias(modelFeedback);
    if (biasAnalysis.detected) {
      suggestions.push(this.createCorrectionSuggestion(
        modelId,
        'systematic_bias',
        'Systematic bias detected in predictions',
        'high',
        biasAnalysis.evidence,
        biasAnalysis.corrections
      ));
    }

    // Analyze feature importance issues
    const featureAnalysis = this.analyzeFeatureIssues(modelFeedback);
    if (featureAnalysis.issues.length > 0) {
      suggestions.push(...featureAnalysis.issues.map(issue =>
        this.createCorrectionSuggestion(
          modelId,
          'feature_importance',
          issue.description,
          issue.severity,
          issue.evidence,
          issue.corrections
        )
      ));
    }

    // Analyze data quality issues
    const dataQualityAnalysis = this.analyzeDataQuality(modelFeedback);
    if (dataQualityAnalysis.issues.length > 0) {
      suggestions.push(...dataQualityAnalysis.issues.map(issue =>
        this.createCorrectionSuggestion(
          modelId,
          'data_quality',
          issue.description,
          issue.severity,
          issue.evidence,
          issue.corrections
        )
      ));
    }

    this.correctionSuggestions.push(...suggestions);
    return suggestions;
  }

  /**
   * Set up automated retraining triggers
   */
  async setupRetrainingTrigger(triggerData: Omit<RetrainingTrigger, 'id'>): Promise<RetrainingTrigger> {
    const trigger: RetrainingTrigger = {
      ...triggerData,
      id: this.generateTriggerId()
    };

    this.retrainingTriggers.set(trigger.id, trigger);
    
    logger.info('api', `⚡ Retraining trigger set up: ${trigger.triggerType} for model ${trigger.modelId}`);
    return trigger;
  }

  /**
   * Check if retraining should be triggered
   */
  async checkRetrainingTriggers(modelId: string): Promise<{
    shouldRetrain: boolean;
    triggeredBy: RetrainingTrigger[];
    reasons: string[];
  }> {
    const modelTriggers = Array.from(this.retrainingTriggers.values()).filter(t => 
      t.modelId === modelId && t.isActive
    );

    const triggeredBy: RetrainingTrigger[] = [];
    const reasons: string[] = [];

    for (const trigger of modelTriggers) {
      const shouldTrigger = await this.evaluateTrigger(trigger);
      if (shouldTrigger.triggered) {
        triggeredBy.push(trigger);
        reasons.push(shouldTrigger.reason);
      }
    }

    return {
      shouldRetrain: triggeredBy.length > 0,
      triggeredBy,
      reasons
    };
  }

  // Private helper methods

  private async processFeedback(feedback: UserFeedback): Promise<void> {
    const prediction = this.predictions.get(feedback.predictionId);
    if (!prediction) return;

    // Check for immediate quality issues
    if (feedback.rating && feedback.rating <= 2) {
      logger.info('api', `🚨 Poor prediction quality reported: ${feedback.predictionId}`);
      // Trigger immediate review
    }

    // Check for systematic errors
    if (feedback.feedbackType === 'correction' && feedback.correctValue !== undefined) {
      const error = this.calculatePredictionError(prediction, feedback.correctValue);
      if (error > 0.3) { // 30% error
        logger.info('api', `⚠️ Large prediction error detected: ${error * 100}%`);
      }
    }

    // Update real-time metrics
    await this.updateRealTimeMetrics(prediction.modelId, feedback);
  }

  private calculateAccuracyMetrics(
    predictions: ModelPrediction[], 
    feedback: UserFeedback[]
  ): ModelPerformanceMetrics['accuracy'] {
    const correctionFeedback = feedback.filter(f => f.feedbackType === 'correction' && f.correctValue !== undefined);
    
    if (correctionFeedback.length === 0) {
      return {
        overall: 0,
        byConfidenceLevel: {},
        byPredictionType: {},
        trend: 'stable'
      };
    }

    // Calculate overall accuracy
    let totalError = 0;
    for (const fb of correctionFeedback) {
      const prediction = predictions.find(p => p.id === fb.predictionId);
      if (prediction && fb.correctValue !== undefined) {
        const error = this.calculatePredictionError(prediction, fb.correctValue);
        totalError += error;
      }
    }
    
    const overall = Math.max(0, 1 - (totalError / correctionFeedback.length));

    // Calculate by confidence level
    const byConfidenceLevel: { [confidence: string]: number } = {};
    const confidenceRanges = ['0-0.5', '0.5-0.7', '0.7-0.9', '0.9-1.0'];
    
    for (const range of confidenceRanges) {
      const [min, max] = range.split('-').map(Number);
      const rangeFeedback = correctionFeedback.filter(fb => {
        const prediction = predictions.find(p => p.id === fb.predictionId);
        return prediction && prediction.prediction.confidence >= min && prediction.prediction.confidence <= max;
      });
      
      if (rangeFeedback.length > 0) {
        let rangeError = 0;
        for (const fb of rangeFeedback) {
          const prediction = predictions.find(p => p.id === fb.predictionId);
          if (prediction && fb.correctValue !== undefined) {
            rangeError += this.calculatePredictionError(prediction, fb.correctValue);
          }
        }
        byConfidenceLevel[range] = Math.max(0, 1 - (rangeError / rangeFeedback.length));
      }
    }

    // Calculate by prediction type
    const byPredictionType: { [type: string]: number } = {};
    const types = Array.from(new Set(predictions.map(p => p.predictionType)));
    
    for (const type of types) {
      const typeFeedback = correctionFeedback.filter(fb => {
        const prediction = predictions.find(p => p.id === fb.predictionId);
        return prediction?.predictionType === type;
      });
      
      if (typeFeedback.length > 0) {
        let typeError = 0;
        for (const fb of typeFeedback) {
          const prediction = predictions.find(p => p.id === fb.predictionId);
          if (prediction && fb.correctValue !== undefined) {
            typeError += this.calculatePredictionError(prediction, fb.correctValue);
          }
        }
        byPredictionType[type] = Math.max(0, 1 - (typeError / typeFeedback.length));
      }
    }

    return {
      overall,
      byConfidenceLevel,
      byPredictionType,
      trend: 'stable' // Would calculate based on historical data
    };
  }

  private calculateUserSatisfaction(feedback: UserFeedback[]): ModelPerformanceMetrics['userSatisfaction'] {
    const ratingFeedback = feedback.filter(f => f.rating !== undefined);
    
    if (ratingFeedback.length === 0) {
      return {
        averageRating: 0,
        ratingDistribution: {},
        usefulnessScore: 0,
        feedbackVolume: feedback.length
      };
    }

    const averageRating = ratingFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingFeedback.length;
    
    const ratingDistribution: { [rating: string]: number } = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i.toString()] = ratingFeedback.filter(f => f.rating === i).length;
    }

    const usefulnessScore = feedback.filter(f => f.feedbackType === 'usefulness').length / feedback.length;

    return {
      averageRating,
      ratingDistribution,
      usefulnessScore,
      feedbackVolume: feedback.length
    };
  }

  private calculatePredictionDistribution(predictions: ModelPrediction[]): ModelPerformanceMetrics['predictionDistribution'] {
    const confidenceLevels: { [range: string]: number } = {};
    const predictionTypes: { [type: string]: number } = {};
    const errorTypes: { [type: string]: number } = {};

    // Calculate confidence level distribution
    const confidenceRanges = ['0-0.5', '0.5-0.7', '0.7-0.9', '0.9-1.0'];
    for (const range of confidenceRanges) {
      const [min, max] = range.split('-').map(Number);
      confidenceLevels[range] = predictions.filter(p => 
        p.prediction.confidence >= min && p.prediction.confidence <= max
      ).length;
    }

    // Calculate prediction type distribution
    for (const prediction of predictions) {
      predictionTypes[prediction.predictionType] = (predictionTypes[prediction.predictionType] || 0) + 1;
    }

    return {
      confidenceLevels,
      predictionTypes,
      errorTypes
    };
  }

  private calculatePredictionError(prediction: ModelPrediction, correctValue: number | string): number {
    if (typeof prediction.prediction.value === 'number' && typeof correctValue === 'number') {
      return Math.abs(prediction.prediction.value - correctValue) / Math.max(Math.abs(correctValue), 1);
    }
    
    // For categorical predictions
    return prediction.prediction.value === correctValue ? 0 : 1;
  }

  private generateFeedbackOptions(prediction: ModelPrediction): Array<{
    type: string;
    label: string;
    description: string;
    inputType: 'rating' | 'text' | 'number' | 'boolean';
  }> {
    const baseOptions = [
      {
        type: 'accuracy',
        label: 'Rate Accuracy',
        description: 'How accurate was this prediction?',
        inputType: 'rating' as const
      },
      {
        type: 'usefulness',
        label: 'Rate Usefulness',
        description: 'How useful was this prediction for your decision-making?',
        inputType: 'rating' as const
      }
    ];

    // Add prediction-type specific options
    if (prediction.predictionType === 'yield') {
      baseOptions.push({
        type: 'correction',
        label: 'Actual Yield',
        description: 'What was the actual yield you achieved?',
        inputType: 'number' as const
      });
    } else if (prediction.predictionType === 'quality') {
      baseOptions.push({
        type: 'correction',
        label: 'Actual Quality',
        description: 'What was the actual quality score?',
        inputType: 'number' as const
      });
    }

    baseOptions.push({
      type: 'comments',
      label: 'Additional Comments',
      description: 'Any additional feedback about this prediction?',
      inputType: 'text' as const
    });

    return baseOptions;
  }

  private initializeDefaultTriggers(): void {
    // Set up default retraining triggers for common scenarios
    this.setupRetrainingTrigger({
      modelId: 'yield_predictor',
      triggerType: 'performance_degradation',
      conditions: {
        accuracyThreshold: 0.7,
        timeWindow: 30,
        minimumSamples: 50
      },
      isActive: true,
      cooldownPeriod: 7,
      autoRetrainEnabled: false,
      requiresApproval: true
    });
  }

  private async evaluateTrigger(trigger: RetrainingTrigger): Promise<{ triggered: boolean; reason: string }> {
    // Check cooldown period
    if (trigger.lastTriggered && trigger.cooldownPeriod) {
      const daysSinceLastTrigger = (Date.now() - trigger.lastTriggered.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastTrigger < trigger.cooldownPeriod) {
        return { triggered: false, reason: 'In cooldown period' };
      }
    }

    // Evaluate trigger-specific conditions
    if (trigger.triggerType === 'performance_degradation') {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (trigger.conditions.timeWindow || 30) * 24 * 60 * 60 * 1000);
      
      const performance = await this.getModelPerformance(trigger.modelId, startDate, endDate);
      
      if (performance.accuracy.overall < (trigger.conditions.accuracyThreshold || 0.8)) {
        return { 
          triggered: true, 
          reason: `Accuracy dropped to ${(performance.accuracy.overall * 100).toFixed(1)}%` 
        };
      }
    }

    return { triggered: false, reason: 'Conditions not met' };
  }

  private identifyCommonErrors(
    predictions: ModelPrediction[], 
    feedback: UserFeedback[]
  ): ModelPerformanceMetrics['commonErrors'] {
    // Analyze feedback patterns to identify common error types
    const errors: ModelPerformanceMetrics['commonErrors'] = [];

    // Example: High-confidence predictions with low user ratings
    const highConfidenceLowRating = feedback.filter(f => {
      const prediction = predictions.find(p => p.id === f.predictionId);
      return prediction && prediction.prediction.confidence > 0.8 && f.rating && f.rating <= 2;
    });

    if (highConfidenceLowRating.length > 5) {
      errors.push({
        pattern: 'High confidence, low user satisfaction',
        frequency: highConfidenceLowRating.length,
        impact: 'high',
        suggestedFix: 'Review confidence calibration and feature importance'
      });
    }

    return errors;
  }

  private calculateFeatureImpact(
    predictions: ModelPrediction[], 
    feedback: UserFeedback[]
  ): { [feature: string]: number } {
    // Analyze which features correlate with poor predictions
    const featureImpact: { [feature: string]: number } = {};

    // Mock implementation - would analyze actual feature correlations
    featureImpact['temperature'] = 0.85;
    featureImpact['humidity'] = 0.72;
    featureImpact['light_intensity'] = 0.68;

    return featureImpact;
  }

  private shouldRecommendRetraining(
    accuracy: ModelPerformanceMetrics['accuracy'],
    satisfaction: ModelPerformanceMetrics['userSatisfaction']
  ): boolean {
    return accuracy.overall < 0.8 || satisfaction.averageRating < 3.5;
  }

  private identifyImprovementOpportunities(
    accuracy: ModelPerformanceMetrics['accuracy'],
    satisfaction: ModelPerformanceMetrics['userSatisfaction'],
    commonErrors: ModelPerformanceMetrics['commonErrors']
  ): string[] {
    const opportunities = [];

    if (accuracy.overall < 0.9) {
      opportunities.push('Improve prediction accuracy through feature engineering');
    }

    if (satisfaction.averageRating < 4.0) {
      opportunities.push('Enhance user experience with better confidence intervals');
    }

    if (commonErrors.length > 0) {
      opportunities.push('Address systematic prediction errors');
    }

    return opportunities;
  }

  private async updateRealTimeMetrics(modelId: string, feedback: UserFeedback): Promise<void> {
    // Update real-time performance dashboards
    logger.info('api', `📊 Updating real-time metrics for model ${modelId}`);
    
    // In production, this would:
    // 1. Update Redis cache with latest metrics
    // 2. Send to real-time dashboard
    // 3. Check alert thresholds
    // 4. Trigger webhooks if needed
  }

  private analyzeBias(feedback: UserFeedback[]): any {
    // Simplified bias analysis
    return {
      detected: false,
      evidence: [],
      corrections: []
    };
  }

  private analyzeFeatureIssues(feedback: UserFeedback[]): any {
    return { issues: [] };
  }

  private analyzeDataQuality(feedback: UserFeedback[]): any {
    return { issues: [] };
  }

  private createCorrectionSuggestion(
    modelId: string,
    issueType: ModelCorrectionSuggestion['issueType'],
    description: string,
    severity: ModelCorrectionSuggestion['severity'],
    evidence: any,
    corrections: any
  ): ModelCorrectionSuggestion {
    return {
      id: this.generateCorrectionId(),
      modelId,
      issueType,
      description,
      severity,
      affectedPredictions: [],
      feedbackEvidence: [],
      statisticalEvidence: {},
      corrections: [],
      status: 'identified',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generatePredictionId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateFeedbackId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateTriggerId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateCorrectionId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

export default ModelFeedbackSystem;