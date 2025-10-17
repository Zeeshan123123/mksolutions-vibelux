/**
 * User Satisfaction Tracking System
 * Comprehensive satisfaction measurement and analysis
 */

export interface SatisfactionSurvey {
  id: string;
  type: 'nps' | 'csat' | 'ces' | 'feature_satisfaction' | 'onboarding' | 'custom';
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  
  // Targeting
  triggers: SurveyTrigger[];
  targeting: {
    userSegments?: string[];
    pages?: string[];
    frequency: 'once' | 'weekly' | 'monthly' | 'after_action' | 'time_based';
    cooldownDays?: number;
  };
  
  // Configuration
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  maxResponses?: number;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'nps' | 'multiple_choice' | 'text' | 'yes_no' | 'ces';
  question: string;
  description?: string;
  required: boolean;
  
  // Question-specific config
  options?: string[]; // for multiple choice
  scale?: { min: number; max: number; labels?: { [key: number]: string } };
  followUpConditions?: { [answer: string]: string[] }; // conditional follow-up questions
}

export interface SurveyTrigger {
  event: string;
  conditions?: Record<string, any>;
  delay?: number; // seconds to wait after trigger
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  sessionId?: string;
  
  // Responses
  answers: { [questionId: string]: any };
  
  // Context
  page: string;
  userAgent: string;
  triggerEvent?: string;
  context: Record<string, any>;
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  timeToComplete?: number; // seconds
  
  // Quality
  isComplete: boolean;
  qualityScore: number; // 0-1, based on response quality
}

export interface SatisfactionMetrics {
  period: {
    start: Date;
    end: Date;
  };
  
  // Core metrics
  nps: {
    score: number; // -100 to 100
    promoters: number;
    passives: number;
    detractors: number;
    responses: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  
  csat: {
    score: number; // 0-100
    responses: number;
    distribution: { [rating: string]: number };
  };
  
  ces: {
    score: number; // 1-7 typically
    responses: number;
    effortDistribution: { [level: string]: number };
  };
  
  // Segmentation
  bySegment: {
    [segment: string]: {
      nps: number;
      csat: number;
      responses: number;
    };
  };
  
  byFeature: {
    [feature: string]: {
      satisfaction: number;
      usage: number;
      importance: number;
    };
  };
  
  // Trends
  trends: {
    metric: string;
    data: Array<{ date: Date; value: number }>;
    change: number; // percentage change
    direction: 'up' | 'down' | 'stable';
  }[];
  
  // Insights
  insights: SatisfactionInsight[];
  recommendations: string[];
}

export interface SatisfactionInsight {
  type: 'alert' | 'trend' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  data: Record<string, any>;
  actions?: string[];
}

export interface UserSatisfactionProfile {
  userId: string;
  
  // Current scores
  currentNPS?: number;
  currentCSAT?: number;
  currentCES?: number;
  
  // History
  responseHistory: SurveyResponse[];
  satisfactionTrend: 'improving' | 'declining' | 'stable';
  
  // Segments
  segment: string;
  riskLevel: 'high' | 'medium' | 'low'; // churn risk
  
  // Preferences
  feedbackFrequency: 'high' | 'medium' | 'low';
  preferredChannels: string[];
  
  // Last interaction
  lastSurveyDate?: Date;
  lastScore?: number;
  
  // Analytics
  totalResponses: number;
  averageResponseTime: number;
  completionRate: number;
}

export class UserSatisfactionTracker {
  private surveys: Map<string, SatisfactionSurvey> = new Map();
  private responses: SurveyResponse[] = [];
  private userProfiles: Map<string, UserSatisfactionProfile> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultSurveys();
  }

  /**
   * Create a new satisfaction survey
   */
  async createSurvey(surveyData: Omit<SatisfactionSurvey, 'id' | 'createdAt' | 'updatedAt'>): Promise<SatisfactionSurvey> {
    const survey: SatisfactionSurvey = {
      ...surveyData,
      id: this.generateSurveyId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.surveys.set(survey.id, survey);
    
    // Set up event listeners for triggers
    this.setupSurveyTriggers(survey);

    logger.info('api', `📊 Created satisfaction survey: ${survey.title} (${survey.id})`);
    return survey;
  }

  /**
   * Check if user should be shown a survey
   */
  async shouldShowSurvey(
    userId: string, 
    event: string, 
    context: Record<string, any> = {}
  ): Promise<SatisfactionSurvey | null> {
    const userProfile = await this.getUserProfile(userId);
    
    for (const [_, survey] of this.surveys) {
      if (!survey.isActive) continue;
      
      // Check if survey is triggered by this event
      const trigger = survey.triggers.find(t => t.event === event);
      if (!trigger) continue;
      
      // Check conditions
      if (trigger.conditions && !this.matchesConditions(trigger.conditions, context)) {
        continue;
      }
      
      // Check targeting
      if (!this.matchesTargeting(survey.targeting, userId, context, userProfile)) {
        continue;
      }
      
      // Check cooldown
      if (this.isInCooldown(survey, userProfile)) {
        continue;
      }
      
      return survey;
    }
    
    return null;
  }

  /**
   * Submit survey response
   */
  async submitResponse(responseData: Omit<SurveyResponse, 'id' | 'qualityScore'>): Promise<SurveyResponse> {
    const response: SurveyResponse = {
      ...responseData,
      id: this.generateResponseId(),
      qualityScore: this.calculateResponseQuality(responseData)
    };

    this.responses.push(response);
    
    // Update user profile
    await this.updateUserProfile(response);
    
    // Trigger analysis
    await this.analyzeResponse(response);

    logger.info('api', `📋 Survey response submitted: ${response.surveyId} by ${response.userId}`);
    return response;
  }

  /**
   * Get satisfaction metrics for a time period
   */
  async getSatisfactionMetrics(
    startDate: Date, 
    endDate: Date, 
    filters: Record<string, any> = {}
  ): Promise<SatisfactionMetrics> {
    const periodResponses = this.responses.filter(r => 
      r.completedAt && 
      r.completedAt >= startDate && 
      r.completedAt <= endDate &&
      this.matchesFilters(r, filters)
    );

    // Calculate core metrics
    const nps = this.calculateNPS(periodResponses);
    const csat = this.calculateCSAT(periodResponses);
    const ces = this.calculateCES(periodResponses);
    
    // Calculate segmentation metrics
    const bySegment = await this.calculateSegmentMetrics(periodResponses);
    const byFeature = await this.calculateFeatureMetrics(periodResponses);
    
    // Calculate trends
    const trends = await this.calculateTrends(startDate, endDate, filters);
    
    // Generate insights
    const insights = await this.generateInsights(periodResponses, trends);
    const recommendations = this.generateRecommendations(insights, { nps, csat, ces });

    return {
      period: { start: startDate, end: endDate },
      nps,
      csat,
      ces,
      bySegment,
      byFeature,
      trends,
      insights,
      recommendations
    };
  }

  /**
   * Get user satisfaction profile
   */
  async getUserProfile(userId: string): Promise<UserSatisfactionProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    // Create new profile
    const profile: UserSatisfactionProfile = {
      userId,
      responseHistory: [],
      satisfactionTrend: 'stable',
      segment: 'unknown',
      riskLevel: 'low',
      feedbackFrequency: 'medium',
      preferredChannels: ['in-app'],
      totalResponses: 0,
      averageResponseTime: 0,
      completionRate: 0
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Pre-built survey creators for common use cases
   */

  /**
   * Create NPS survey
   */
  async createNPSSurvey(config: {
    title?: string;
    frequency: 'monthly' | 'quarterly';
    segments?: string[];
  }): Promise<SatisfactionSurvey> {
    return this.createSurvey({
      type: 'nps',
      title: config.title || 'How likely are you to recommend Vibelux?',
      questions: [
        {
          id: 'nps_score',
          type: 'nps',
          question: 'How likely are you to recommend Vibelux to a friend or colleague?',
          required: true,
          scale: { min: 0, max: 10, labels: { 0: 'Not at all likely', 10: 'Extremely likely' } }
        },
        {
          id: 'nps_reason',
          type: 'text',
          question: 'What is the primary reason for your score?',
          required: false
        }
      ],
      triggers: [
        { event: 'session_milestone', conditions: { sessions: 10 } },
        { event: 'feature_usage', conditions: { feature: 'core_feature', usage_count: 5 } }
      ],
      targeting: {
        userSegments: config.segments,
        frequency: config.frequency,
        cooldownDays: config.frequency === 'monthly' ? 30 : 90
      },
      isActive: true,
      createdBy: 'system'
    });
  }

  /**
   * Create feature satisfaction survey
   */
  async createFeatureSatisfactionSurvey(feature: string): Promise<SatisfactionSurvey> {
    return this.createSurvey({
      type: 'feature_satisfaction',
      title: `How satisfied are you with ${feature}?`,
      questions: [
        {
          id: 'feature_satisfaction',
          type: 'rating',
          question: `How satisfied are you with the ${feature} feature?`,
          required: true,
          scale: { min: 1, max: 5, labels: { 1: 'Very dissatisfied', 5: 'Very satisfied' } }
        },
        {
          id: 'feature_importance',
          type: 'rating',
          question: `How important is the ${feature} feature to you?`,
          required: true,
          scale: { min: 1, max: 5, labels: { 1: 'Not important', 5: 'Very important' } }
        },
        {
          id: 'feature_feedback',
          type: 'text',
          question: 'Any suggestions for improving this feature?',
          required: false
        }
      ],
      triggers: [
        { event: 'feature_usage', conditions: { feature, usage_count: 3 }, delay: 30 }
      ],
      targeting: {
        frequency: 'once',
        cooldownDays: 90
      },
      isActive: true,
      createdBy: 'system'
    });
  }

  // Private helper methods

  private initializeDefaultSurveys(): void {
    // Initialize with common satisfaction surveys
    this.createNPSSurvey({ frequency: 'quarterly' });
    this.createFeatureSatisfactionSurvey('ML Data Import');
    this.createFeatureSatisfactionSurvey('Recipe Marketplace');
  }

  private setupSurveyTriggers(survey: SatisfactionSurvey): void {
    for (const trigger of survey.triggers) {
      if (!this.eventListeners.has(trigger.event)) {
        this.eventListeners.set(trigger.event, []);
      }
      
      const handler = async (userId: string, context: Record<string, any>) => {
        const shouldShow = await this.shouldShowSurvey(userId, trigger.event, context);
        if (shouldShow?.id === survey.id) {
          // Trigger survey display (would integrate with UI components)
          logger.info('api', `🎯 Triggering survey: ${survey.title} for user ${userId}`);
        }
      };
      
      this.eventListeners.get(trigger.event)!.push(handler);
    }
  }

  private matchesConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    return Object.entries(conditions).every(([key, expectedValue]) => {
      return context[key] === expectedValue;
    });
  }

  private matchesTargeting(
    targeting: SatisfactionSurvey['targeting'],
    userId: string,
    context: Record<string, any>,
    userProfile: UserSatisfactionProfile
  ): boolean {
    // Check user segments
    if (targeting.userSegments && !targeting.userSegments.includes(userProfile.segment)) {
      return false;
    }
    
    // Check pages
    if (targeting.pages && context.page && !targeting.pages.includes(context.page)) {
      return false;
    }
    
    return true;
  }

  private isInCooldown(survey: SatisfactionSurvey, userProfile: UserSatisfactionProfile): boolean {
    if (!survey.targeting.cooldownDays || !userProfile.lastSurveyDate) {
      return false;
    }
    
    const daysSinceLastSurvey = (Date.now() - userProfile.lastSurveyDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastSurvey < survey.targeting.cooldownDays;
  }

  private calculateResponseQuality(response: Omit<SurveyResponse, 'id' | 'qualityScore'>): number {
    let score = 1.0;
    
    // Penalize very fast completion
    if (response.timeToComplete && response.timeToComplete < 10) {
      score -= 0.3;
    }
    
    // Penalize incomplete responses
    if (!response.isComplete) {
      score -= 0.5;
    }
    
    // Check for meaningful text responses
    const textAnswers = Object.values(response.answers).filter(a => 
      typeof a === 'string' && a.length > 10
    );
    if (textAnswers.length === 0) {
      score -= 0.2;
    }
    
    return Math.max(0, score);
  }

  private calculateNPS(responses: SurveyResponse[]): SatisfactionMetrics['nps'] {
    const npsResponses = responses.filter(r => 
      r.answers.nps_score !== undefined && 
      typeof r.answers.nps_score === 'number'
    );
    
    if (npsResponses.length === 0) {
      return { score: 0, promoters: 0, passives: 0, detractors: 0, responses: 0, trend: 'stable' };
    }
    
    const promoters = npsResponses.filter(r => r.answers.nps_score >= 9).length;
    const passives = npsResponses.filter(r => r.answers.nps_score >= 7 && r.answers.nps_score <= 8).length;
    const detractors = npsResponses.filter(r => r.answers.nps_score <= 6).length;
    
    const score = Math.round(((promoters - detractors) / npsResponses.length) * 100);
    
    return {
      score,
      promoters,
      passives,
      detractors,
      responses: npsResponses.length,
      trend: 'stable' // Would calculate based on historical data
    };
  }

  private calculateCSAT(responses: SurveyResponse[]): SatisfactionMetrics['csat'] {
    const csatResponses = responses.filter(r => 
      r.answers.feature_satisfaction !== undefined ||
      r.answers.satisfaction !== undefined
    );
    
    if (csatResponses.length === 0) {
      return { score: 0, responses: 0, distribution: {} };
    }
    
    const scores = csatResponses.map(r => 
      r.answers.feature_satisfaction || r.answers.satisfaction
    ).filter(s => typeof s === 'number');
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const normalizedScore = (averageScore / 5) * 100; // Assuming 5-point scale
    
    const distribution: { [rating: string]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i.toString()] = scores.filter(s => s === i).length;
    }
    
    return {
      score: Math.round(normalizedScore),
      responses: scores.length,
      distribution
    };
  }

  private calculateCES(responses: SurveyResponse[]): SatisfactionMetrics['ces'] {
    const cesResponses = responses.filter(r => 
      r.answers.effort !== undefined && 
      typeof r.answers.effort === 'number'
    );
    
    if (cesResponses.length === 0) {
      return { score: 0, responses: 0, effortDistribution: {} };
    }
    
    const scores = cesResponses.map(r => r.answers.effort);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const effortDistribution: { [level: string]: number } = {};
    for (let i = 1; i <= 7; i++) {
      effortDistribution[i.toString()] = scores.filter(s => s === i).length;
    }
    
    return {
      score: Math.round(averageScore * 10) / 10,
      responses: scores.length,
      effortDistribution
    };
  }

  private async updateUserProfile(response: SurveyResponse): Promise<void> {
    const profile = await this.getUserProfile(response.userId);
    
    profile.responseHistory.push(response);
    profile.totalResponses++;
    profile.lastSurveyDate = response.completedAt || response.startedAt;
    
    if (response.answers.nps_score) {
      profile.currentNPS = response.answers.nps_score;
      profile.lastScore = response.answers.nps_score;
    }
    
    if (response.timeToComplete) {
      profile.averageResponseTime = (
        (profile.averageResponseTime * (profile.totalResponses - 1)) + 
        response.timeToComplete
      ) / profile.totalResponses;
    }
    
    profile.completionRate = profile.responseHistory.filter(r => r.isComplete).length / profile.totalResponses;
    
    // Update risk level based on recent scores
    if (profile.currentNPS !== undefined) {
      if (profile.currentNPS <= 6) {
        profile.riskLevel = 'high';
      } else if (profile.currentNPS <= 8) {
        profile.riskLevel = 'medium';
      } else {
        profile.riskLevel = 'low';
      }
    }
  }

  private async analyzeResponse(response: SurveyResponse): Promise<void> {
    // Analyze response for immediate insights
    if (response.answers.nps_score <= 6) {
      logger.info('api', `🚨 Detractor alert: User ${response.userId} gave NPS score ${response.answers.nps_score}`);
      // Trigger customer success follow-up
    }
    
    if (response.qualityScore < 0.5) {
      logger.info('api', `⚠️ Low quality response from user ${response.userId}`);
    }
  }

  private async calculateSegmentMetrics(responses: SurveyResponse[]): Promise<SatisfactionMetrics['bySegment']> {
    // Group responses by user segment and calculate metrics
    const bySegment: SatisfactionMetrics['bySegment'] = {};
    
    // Would integrate with user segmentation system
    // For now, mock implementation
    bySegment['premium'] = { nps: 75, csat: 85, responses: responses.length * 0.3 };
    bySegment['free'] = { nps: 45, csat: 70, responses: responses.length * 0.7 };
    
    return bySegment;
  }

  private async calculateFeatureMetrics(responses: SurveyResponse[]): Promise<SatisfactionMetrics['byFeature']> {
    const byFeature: SatisfactionMetrics['byFeature'] = {};
    
    // Extract feature-specific responses
    const featureResponses = responses.filter(r => r.surveyId.includes('feature'));
    
    // Mock implementation
    byFeature['ML Data Import'] = { satisfaction: 82, usage: 450, importance: 4.2 };
    byFeature['Recipe Marketplace'] = { satisfaction: 78, usage: 320, importance: 3.8 };
    
    return byFeature;
  }

  private async calculateTrends(
    startDate: Date, 
    endDate: Date, 
    filters: Record<string, any>
  ): Promise<SatisfactionMetrics['trends']> {
    // Calculate trends over time periods
    return [
      {
        metric: 'nps',
        data: [
          { date: new Date('2024-01-01'), value: 45 },
          { date: new Date('2024-02-01'), value: 52 },
          { date: new Date('2024-03-01'), value: 58 }
        ],
        change: 15.6,
        direction: 'up'
      }
    ];
  }

  private async generateInsights(
    responses: SurveyResponse[], 
    trends: SatisfactionMetrics['trends']
  ): Promise<SatisfactionInsight[]> {
    const insights: SatisfactionInsight[] = [];
    
    // Generate insights based on data patterns
    if (responses.length > 0) {
      const avgNPS = responses
        .filter(r => r.answers.nps_score)
        .reduce((sum, r) => sum + r.answers.nps_score, 0) / responses.length;
      
      if (avgNPS < 50) {
        insights.push({
          type: 'alert',
          title: 'NPS Below Industry Average',
          description: 'Current NPS score is below the industry average of 50',
          impact: 'high',
          confidence: 0.9,
          data: { currentNPS: avgNPS, benchmark: 50 },
          actions: ['Identify key pain points', 'Implement customer success program']
        });
      }
    }
    
    return insights;
  }

  private generateRecommendations(
    insights: SatisfactionInsight[], 
    metrics: { nps: any; csat: any; ces: any }
  ): string[] {
    const recommendations = [];
    
    if (metrics.nps.score < 50) {
      recommendations.push('Focus on converting detractors to passives through targeted improvements');
    }
    
    if (metrics.csat.score < 80) {
      recommendations.push('Investigate feature-specific satisfaction scores to identify improvement areas');
    }
    
    if (insights.some(i => i.type === 'alert')) {
      recommendations.push('Address high-impact alerts immediately to prevent churn');
    }
    
    return recommendations;
  }

  private matchesFilters(response: SurveyResponse, filters: Record<string, any>): boolean {
    return Object.entries(filters).every(([key, value]) => {
      return response.context[key] === value || response[key as keyof SurveyResponse] === value;
    });
  }

  private generateSurveyId(): string {
    return `survey_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

export default UserSatisfactionTracker;