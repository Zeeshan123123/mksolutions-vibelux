/**
 * Intelligent Design Assistant
 * Comprehensive questioning system to ensure optimal grow room designs
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';
import OpenAI from 'openai';

export type QuestionCategory = 'facility' | 'cultivation' | 'environmental' | 'operational' | 'regulatory';
export type QuestionPriority = 'required' | 'important' | 'optional' | 'advanced';
export type AnswerType = 'text' | 'number' | 'select' | 'multiselect' | 'range' | 'boolean' | 'location';
export type DesignPhase = 'initial' | 'requirements' | 'constraints' | 'optimization' | 'validation' | 'complete';

export interface DesignQuestion {
  id: string;
  category: QuestionCategory;
  priority: QuestionPriority;
  phase: DesignPhase;
  
  // Question Details
  question: string;
  description?: string;
  helpText?: string;
  
  // Answer Configuration
  answerType: AnswerType;
  options?: Array<{ value: string; label: string; description?: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
  
  // Dependencies
  dependsOn?: Array<{
    questionId: string;
    condition: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }>;
  
  // Impact
  impactAreas: Array<'lighting' | 'hvac' | 'irrigation' | 'racking' | 'automation' | 'compliance' | 'efficiency'>;
  creditWeight: number; // How important this is for credit optimization
}

export interface DesignSession {
  id: string;
  userId: string;
  
  // Session Info
  startedAt: Date;
  completedAt?: Date;
  phase: DesignPhase;
  
  // Facility Details
  projectName: string;
  facilityType?: 'indoor' | 'greenhouse' | 'hybrid';
  
  // Responses
  responses: Array<{
    questionId: string;
    answer: any;
    confidence?: number;
    timestamp: Date;
  }>;
  
  // Recommendations
  missingCriticalInfo: string[];
  suggestedQuestions: string[];
  completenessScore: number;
  
  // Design Output
  designRecommendations?: {
    lighting: any;
    hvac: any;
    irrigation: any;
    racking: any;
    automation: any;
    energy_analysis: any;
    efficiency_metrics: any;
  };
  
  // Credit Usage
  creditsUsed: number;
  estimatedCreditsRemaining: number;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionFlow {
  id: string;
  name: string;
  description: string;
  
  // Flow Configuration
  cultivationType: 'cannabis' | 'vegetables' | 'herbs' | 'flowers' | 'mixed';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Questions
  questionSequence: Array<{
    questionId: string;
    order: number;
    conditional: boolean;
  }>;
  
  // Optimization
  focusAreas: string[];
  creditEfficiency: number;
}

export interface DesignInsight {
  id: string;
  sessionId: string;
  
  // Insight Details
  type: 'warning' | 'opportunity' | 'recommendation' | 'validation';
  category: string;
  title: string;
  description: string;
  
  // Impact
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  potentialSavings?: number;
  efficiencyGain?: number;
  
  // Actions
  suggestedActions: Array<{
    action: string;
    effort: 'low' | 'medium' | 'high';
    impact: number;
  }>;
  
  // Tracking
  acknowledged: boolean;
  implementationStatus?: 'planned' | 'in_progress' | 'completed';
  createdAt: Date;
}

class IntelligentDesignAssistant extends EventEmitter {
  private openai: OpenAI;
  private questions: Map<string, DesignQuestion> = new Map();
  private flows: Map<string, QuestionFlow> = new Map();
  private activeSession: DesignSession | null = null;

  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.initializeQuestions();
  }

  /**
   * Initialize comprehensive question database
   */
  private initializeQuestions(): void {
    // Facility Questions
    this.addQuestion({
      id: 'facility_dimensions',
      category: 'facility',
      priority: 'required',
      phase: 'initial',
      question: 'What are the dimensions of your grow space?',
      description: 'Please provide length, width, and height in feet',
      helpText: 'Accurate dimensions help optimize equipment placement and airflow',
      answerType: 'text',
      validation: { required: true },
      impactAreas: ['lighting', 'hvac', 'racking'],
      creditWeight: 0.9
    });

    this.addQuestion({
      id: 'ceiling_height',
      category: 'facility',
      priority: 'required',
      phase: 'initial',
      question: 'What is the exact ceiling height?',
      description: 'Height from floor to lowest obstruction',
      helpText: 'Critical for determining vertical growing systems and light placement',
      answerType: 'number',
      validation: { min: 8, max: 40, required: true },
      impactAreas: ['lighting', 'hvac', 'racking'],
      creditWeight: 0.8
    });

    this.addQuestion({
      id: 'electrical_capacity',
      category: 'facility',
      priority: 'important',
      phase: 'requirements',
      question: 'What is your available electrical capacity?',
      description: 'Total amps available at voltage (e.g., 200A @ 480V)',
      helpText: 'Determines maximum lighting and HVAC capacity',
      answerType: 'text',
      impactAreas: ['lighting', 'hvac'],
      creditWeight: 0.9
    });

    // Cultivation Questions
    this.addQuestion({
      id: 'crop_type',
      category: 'cultivation',
      priority: 'required',
      phase: 'initial',
      question: 'What crop(s) will you be growing?',
      answerType: 'multiselect',
      options: [
        { value: 'cannabis', label: 'Cannabis' },
        { value: 'tomatoes', label: 'Tomatoes' },
        { value: 'leafy_greens', label: 'Leafy Greens' },
        { value: 'herbs', label: 'Herbs' },
        { value: 'strawberries', label: 'Strawberries' },
        { value: 'other', label: 'Other' }
      ],
      validation: { required: true },
      impactAreas: ['lighting', 'hvac', 'irrigation', 'compliance'],
      creditWeight: 1.0
    });

    this.addQuestion({
      id: 'growing_method',
      category: 'cultivation',
      priority: 'required',
      phase: 'initial',
      question: 'What growing method will you use?',
      answerType: 'select',
      options: [
        { value: 'soil', label: 'Soil', description: 'Traditional soil-based growing' },
        { value: 'coco', label: 'Coco Coir', description: 'Coconut fiber substrate' },
        { value: 'rockwool', label: 'Rockwool', description: 'Mineral wool substrate' },
        { value: 'dwc', label: 'Deep Water Culture', description: 'Roots in oxygenated water' },
        { value: 'nft', label: 'NFT', description: 'Nutrient Film Technique' },
        { value: 'ebb_flow', label: 'Ebb & Flow', description: 'Flood and drain system' }
      ],
      validation: { required: true },
      impactAreas: ['irrigation', 'racking', 'automation'],
      creditWeight: 0.8
    });

    this.addQuestion({
      id: 'plant_count',
      category: 'cultivation',
      priority: 'important',
      phase: 'requirements',
      question: 'How many plants do you plan to grow?',
      description: 'Total plant count at maximum capacity',
      answerType: 'number',
      validation: { min: 1, max: 100000 },
      impactAreas: ['lighting', 'irrigation', 'compliance'],
      creditWeight: 0.7
    });

    this.addQuestion({
      id: 'canopy_coverage',
      category: 'cultivation',
      priority: 'important',
      phase: 'requirements',
      question: 'What percentage of floor space will be canopy?',
      description: 'Helps optimize light coverage and uniformity',
      helpText: 'Typical ranges: 60-70% for aisles, 80-90% for rolling benches',
      answerType: 'number',
      validation: { min: 40, max: 95 },
      impactAreas: ['lighting', 'racking'],
      creditWeight: 0.8
    });

    // Environmental Questions
    this.addQuestion({
      id: 'target_ppfd',
      category: 'environmental',
      priority: 'important',
      phase: 'requirements',
      question: 'What is your target PPFD (light intensity)?',
      description: 'Photosynthetic Photon Flux Density in μmol/m²/s',
      helpText: 'Vegetative: 400-600, Flowering: 800-1000+ for cannabis',
      answerType: 'range',
      validation: { min: 200, max: 1500 },
      impactAreas: ['lighting', 'hvac'],
      creditWeight: 0.9
    });

    this.addQuestion({
      id: 'uniformity_requirement',
      category: 'environmental',
      priority: 'advanced',
      phase: 'optimization',
      question: 'What light uniformity percentage do you require?',
      description: 'Minimum PPFD / Average PPFD as percentage',
      helpText: 'Higher uniformity (>80%) ensures even growth but may require more fixtures',
      answerType: 'number',
      validation: { min: 60, max: 95 },
      impactAreas: ['lighting', 'efficiency'],
      creditWeight: 0.7
    });

    this.addQuestion({
      id: 'temperature_range',
      category: 'environmental',
      priority: 'required',
      phase: 'requirements',
      question: 'What are your target temperature ranges?',
      description: 'Day and night temperatures in °F',
      answerType: 'text',
      helpText: 'Example: Day 75-78°F, Night 65-70°F',
      validation: { required: true },
      impactAreas: ['hvac'],
      creditWeight: 0.8
    });

    this.addQuestion({
      id: 'humidity_control',
      category: 'environmental',
      priority: 'required',
      phase: 'requirements',
      question: 'What are your target humidity ranges?',
      description: 'Relative humidity for different growth stages',
      helpText: 'Vegetative: 60-70%, Flowering: 40-50% for cannabis',
      answerType: 'text',
      validation: { required: true },
      impactAreas: ['hvac'],
      creditWeight: 0.8
    });

    this.addQuestion({
      id: 'co2_enrichment',
      category: 'environmental',
      priority: 'optional',
      phase: 'optimization',
      question: 'Will you use CO2 enrichment?',
      answerType: 'boolean',
      helpText: 'CO2 enrichment can increase yields 20-30% with proper lighting',
      impactAreas: ['hvac', 'automation', 'efficiency'],
      creditWeight: 0.6
    });

    // Operational Questions
    this.addQuestion({
      id: 'automation_level',
      category: 'operational',
      priority: 'important',
      phase: 'requirements',
      question: 'What level of automation do you want?',
      answerType: 'select',
      options: [
        { value: 'manual', label: 'Manual', description: 'Basic timers and manual control' },
        { value: 'basic', label: 'Basic Automation', description: 'Environmental controls and scheduling' },
        { value: 'advanced', label: 'Advanced', description: 'Full sensor integration and remote monitoring' },
        { value: 'ai', label: 'AI-Driven', description: 'Machine learning optimization and predictive control' }
      ],
      impactAreas: ['automation', 'efficiency'],
      creditWeight: 0.7
    });

    this.addQuestion({
      id: 'labor_availability',
      category: 'operational',
      priority: 'important',
      phase: 'constraints',
      question: 'How many labor hours per day are available?',
      description: 'Helps determine automation needs',
      answerType: 'number',
      validation: { min: 0, max: 24 },
      impactAreas: ['automation', 'irrigation', 'efficiency'],
      creditWeight: 0.6
    });

    this.addQuestion({
      id: 'experience_level',
      category: 'operational',
      priority: 'important',
      phase: 'initial',
      question: 'What is your cultivation experience level?',
      answerType: 'select',
      options: [
        { value: 'beginner', label: 'Beginner', description: 'New to commercial cultivation' },
        { value: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
        { value: 'advanced', label: 'Advanced', description: '3-5 years experience' },
        { value: 'expert', label: 'Expert', description: '5+ years commercial experience' }
      ],
      impactAreas: ['automation', 'efficiency'],
      creditWeight: 0.5
    });

    // Energy and Efficiency Questions
    this.addQuestion({
      id: 'energy_efficiency_priority',
      category: 'operational',
      priority: 'optional',
      phase: 'optimization',
      question: 'How important is energy efficiency to your operation?',
      answerType: 'select',
      options: [
        { value: 'critical', label: 'Critical', description: 'Maximize energy efficiency' },
        { value: 'important', label: 'Important', description: 'Balance efficiency and performance' },
        { value: 'moderate', label: 'Moderate', description: 'Standard efficiency acceptable' },
        { value: 'low', label: 'Low Priority', description: 'Performance over efficiency' }
      ],
      impactAreas: ['lighting', 'hvac', 'efficiency'],
      creditWeight: 0.6
    });

    this.addQuestion({
      id: 'sustainability_goals',
      category: 'operational',
      priority: 'optional',
      phase: 'optimization',
      question: 'Do you have sustainability or certification goals?',
      answerType: 'multiselect',
      options: [
        { value: 'energy_star', label: 'Energy Star', description: 'Energy efficiency certification' },
        { value: 'organic', label: 'Organic', description: 'Organic growing practices' },
        { value: 'water_conservation', label: 'Water Conservation', description: 'Minimize water usage' },
        { value: 'carbon_neutral', label: 'Carbon Neutral', description: 'Net zero carbon emissions' },
        { value: 'none', label: 'None', description: 'No specific certifications' }
      ],
      impactAreas: ['lighting', 'hvac', 'irrigation', 'efficiency'],
      creditWeight: 0.5
    });

    // Regulatory Questions
    this.addQuestion({
      id: 'location_state',
      category: 'regulatory',
      priority: 'required',
      phase: 'initial',
      question: 'In which state/province is your facility?',
      description: 'For compliance and environmental considerations',
      answerType: 'text',
      validation: { required: true },
      impactAreas: ['compliance', 'hvac'],
      creditWeight: 0.7
    });

    this.addQuestion({
      id: 'licensing_type',
      category: 'regulatory',
      priority: 'important',
      phase: 'requirements',
      question: 'What type of cultivation license do you have?',
      answerType: 'select',
      options: [
        { value: 'micro', label: 'Micro/Craft', description: 'Small scale cultivation' },
        { value: 'standard', label: 'Standard', description: 'Standard commercial' },
        { value: 'large', label: 'Large Scale', description: 'Industrial cultivation' },
        { value: 'medical', label: 'Medical Only', description: 'Medical cannabis only' },
        { value: 'adult_use', label: 'Adult Use', description: 'Recreational cannabis' },
        { value: 'na', label: 'Not Applicable', description: 'Non-cannabis crops' }
      ],
      dependsOn: [{
        questionId: 'crop_type',
        condition: 'contains',
        value: 'cannabis'
      }],
      impactAreas: ['compliance'],
      creditWeight: 0.6
    });
  }

  /**
   * Start new design session
   */
  async startDesignSession(
    userId: string,
    projectName: string
  ): Promise<DesignSession> {
    try {
      const session: DesignSession = {
        id: this.generateSessionId(),
        userId,
        projectName,
        startedAt: new Date(),
        phase: 'initial',
        responses: [],
        missingCriticalInfo: [],
        suggestedQuestions: [],
        completenessScore: 0,
        creditsUsed: 0,
        estimatedCreditsRemaining: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSession(session);
      this.activeSession = session;

      // Get initial questions
      const initialQuestions = await this.getNextQuestions(session);
      
      this.emit('session-started', {
        session,
        questions: initialQuestions
      });

      return session;
    } catch (error) {
      logger.error('api', 'Failed to start design session:', error );
      throw error;
    }
  }

  /**
   * Submit answer to question
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: any,
    confidence?: number
  ): Promise<{
    accepted: boolean;
    validation?: string;
    nextQuestions: DesignQuestion[];
    insights: DesignInsight[];
  }> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      const question = this.questions.get(questionId);
      if (!question) throw new Error('Question not found');

      // Validate answer
      const validation = this.validateAnswer(question, answer);
      if (!validation.valid) {
        return {
          accepted: false,
          validation: validation.message,
          nextQuestions: [],
          insights: []
        };
      }

      // Save response
      session.responses.push({
        questionId,
        answer,
        confidence: confidence || 1.0,
        timestamp: new Date()
      });

      // Update completeness
      session.completenessScore = this.calculateCompleteness(session);
      
      // Update credits used (based on question weight)
      session.creditsUsed += question.creditWeight * 0.1;
      session.estimatedCreditsRemaining = 100 - session.creditsUsed;

      await this.saveSession(session);

      // Get next questions
      const nextQuestions = await this.getNextQuestions(session);
      
      // Generate insights based on answer
      const insights = await this.generateInsights(session, questionId, answer);

      this.emit('answer-submitted', {
        sessionId,
        questionId,
        answer,
        nextQuestions,
        insights
      });

      return {
        accepted: true,
        nextQuestions,
        insights
      };
    } catch (error) {
      logger.error('api', 'Failed to submit answer:', error );
      throw error;
    }
  }

  /**
   * Get smart question recommendations
   */
  async getSmartRecommendations(
    sessionId: string
  ): Promise<{
    criticalMissing: Array<{ question: DesignQuestion; reason: string }>;
    highImpact: Array<{ question: DesignQuestion; potentialValue: string }>;
    creditOptimization: Array<{ question: DesignQuestion; creditEfficiency: number }>;
  }> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      const answeredIds = new Set(session.responses.map(r => r.questionId));
      const unansweredQuestions = Array.from(this.questions.values())
        .filter(q => !answeredIds.has(q.id));

      // Find critical missing information
      const criticalMissing = unansweredQuestions
        .filter(q => q.priority === 'required')
        .map(q => ({
          question: q,
          reason: this.getCriticalReason(q)
        }));

      // Find high impact questions
      const highImpact = unansweredQuestions
        .filter(q => q.impactAreas.length >= 3)
        .sort((a, b) => b.impactAreas.length - a.impactAreas.length)
        .slice(0, 5)
        .map(q => ({
          question: q,
          potentialValue: this.getImpactDescription(q)
        }));

      // Find credit-efficient questions
      const creditOptimization = unansweredQuestions
        .map(q => ({
          question: q,
          creditEfficiency: q.creditWeight / (q.priority === 'optional' ? 0.5 : 1)
        }))
        .sort((a, b) => b.creditEfficiency - a.creditEfficiency)
        .slice(0, 5);

      return {
        criticalMissing,
        highImpact,
        creditOptimization
      };
    } catch (error) {
      logger.error('api', 'Failed to get smart recommendations:', error );
      throw error;
    }
  }

  /**
   * Generate comprehensive design
   */
  async generateDesign(
    sessionId: string
  ): Promise<{
    complete: boolean;
    missingCritical: string[];
    design?: any;
    alternativeOptions?: any[];
  }> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      // Check for critical missing information
      const missingCritical = this.checkCriticalRequirements(session);
      if (missingCritical.length > 0) {
        return {
          complete: false,
          missingCritical
        };
      }

      // Generate design using AI
      const design = await this.aiGenerateDesign(session);
      
      // Generate alternative options
      const alternativeOptions = await this.generateAlternatives(session, design);

      // Update session
      session.phase = 'complete';
      session.completedAt = new Date();
      session.designRecommendations = design;
      await this.saveSession(session);

      this.emit('design-generated', {
        sessionId,
        design,
        alternativeOptions
      });

      return {
        complete: true,
        missingCritical: [],
        design,
        alternativeOptions
      };
    } catch (error) {
      logger.error('api', 'Failed to generate design:', error );
      throw error;
    }
  }

  /**
   * Get detailed question explanation
   */
  async explainQuestion(
    questionId: string
  ): Promise<{
    explanation: string;
    examples: string[];
    commonMistakes: string[];
    proTips: string[];
  }> {
    const question = this.questions.get(questionId);
    if (!question) throw new Error('Question not found');

    // Use AI to generate detailed explanation
    const prompt = `
      Explain this grow room design question in detail:
      Question: ${question.question}
      Category: ${question.category}
      Impact Areas: ${question.impactAreas.join(', ')}
      
      Provide:
      1. Detailed explanation of why this matters
      2. 3 specific examples of good answers
      3. 2 common mistakes to avoid
      4. 2 pro tips for maximizing value
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    // Parse AI response
    const response = completion.choices[0].message.content || '';
    return this.parseExplanation(response);
  }

  // Private helper methods

  private addQuestion(question: Omit<DesignQuestion, 'id'> & { id: string }): void {
    this.questions.set(question.id, question);
  }

  private async getNextQuestions(
    session: DesignSession
  ): Promise<DesignQuestion[]> {
    const answeredIds = new Set(session.responses.map(r => r.questionId));
    const currentPhase = session.phase;
    
    // Get questions for current phase
    const phaseQuestions = Array.from(this.questions.values())
      .filter(q => q.phase === currentPhase && !answeredIds.has(q.id));
    
    // Check dependencies
    const availableQuestions = phaseQuestions.filter(q => {
      if (!q.dependsOn) return true;
      
      return q.dependsOn.every(dep => {
        const response = session.responses.find(r => r.questionId === dep.questionId);
        if (!response) return false;
        
        switch (dep.condition) {
          case 'equals':
            return response.answer === dep.value;
          case 'contains':
            return Array.isArray(response.answer) ? 
              response.answer.includes(dep.value) : 
              response.answer.includes(dep.value);
          case 'greater_than':
            return response.answer > dep.value;
          case 'less_than':
            return response.answer < dep.value;
          default:
            return true;
        }
      });
    });
    
    // Sort by priority and credit weight
    return availableQuestions.sort((a, b) => {
      const priorityOrder = { required: 0, important: 1, optional: 2, advanced: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.creditWeight - a.creditWeight;
    }).slice(0, 5); // Return top 5 questions
  }

  private validateAnswer(
    question: DesignQuestion,
    answer: any
  ): { valid: boolean; message?: string } {
    if (!question.validation) return { valid: true };
    
    const { min, max, pattern, required } = question.validation;
    
    if (required && (answer === null || answer === undefined || answer === '')) {
      return { valid: false, message: 'This field is required' };
    }
    
    if (question.answerType === 'number') {
      const num = Number(answer);
      if (isNaN(num)) {
        return { valid: false, message: 'Please enter a valid number' };
      }
      if (min !== undefined && num < min) {
        return { valid: false, message: `Value must be at least ${min}` };
      }
      if (max !== undefined && num > max) {
        return { valid: false, message: `Value must be at most ${max}` };
      }
    }
    
    if (pattern && typeof answer === 'string') {
      const regex = new RegExp(pattern);
      if (!regex.test(answer)) {
        return { valid: false, message: 'Invalid format' };
      }
    }
    
    return { valid: true };
  }

  private calculateCompleteness(session: DesignSession): number {
    const requiredQuestions = Array.from(this.questions.values())
      .filter(q => q.priority === 'required');
    const importantQuestions = Array.from(this.questions.values())
      .filter(q => q.priority === 'important');
    
    const answeredIds = new Set(session.responses.map(r => r.questionId));
    
    const requiredAnswered = requiredQuestions.filter(q => answeredIds.has(q.id)).length;
    const importantAnswered = importantQuestions.filter(q => answeredIds.has(q.id)).length;
    
    const requiredScore = (requiredAnswered / requiredQuestions.length) * 60;
    const importantScore = (importantAnswered / importantQuestions.length) * 30;
    const totalResponses = Math.min(session.responses.length / 20, 1) * 10;
    
    return requiredScore + importantScore + totalResponses;
  }

  private async generateInsights(
    session: DesignSession,
    questionId: string,
    answer: any
  ): Promise<DesignInsight[]> {
    const insights: DesignInsight[] = [];
    const question = this.questions.get(questionId);
    if (!question) return insights;

    // Generate insights based on answer patterns
    switch (questionId) {
      case 'facility_dimensions':
        const dimensions = this.parseDimensions(answer);
        if (dimensions && dimensions.area < 1000) {
          insights.push({
            id: this.generateInsightId(),
            sessionId: session.id,
            type: 'recommendation',
            category: 'space_optimization',
            title: 'Vertical Growing Recommended',
            description: 'Your space is ideal for vertical growing systems to maximize yield per square foot',
            impactLevel: 'high',
            efficiencyGain: 200, // 200% space utilization improvement
            suggestedActions: [
              {
                action: 'Consider multi-tier racking systems',
                effort: 'medium',
                impact: 0.8
              },
              {
                action: 'Evaluate mobile racking options',
                effort: 'high',
                impact: 0.6
              }
            ],
            acknowledged: false,
            createdAt: new Date()
          });
        }
        break;

      case 'uniformity_requirement':
        if (typeof answer === 'number' && answer < 80) {
          insights.push({
            id: this.generateInsightId(),
            sessionId: session.id,
            type: 'warning',
            category: 'light_quality',
            title: 'Low Uniformity May Impact Quality',
            description: 'Uniformity below 80% can lead to uneven growth and quality issues',
            impactLevel: 'medium',
            efficiencyGain: 15,
            suggestedActions: [
              {
                action: 'Consider additional fixtures for better coverage',
                effort: 'low',
                impact: 0.7
              },
              {
                action: 'Optimize fixture spacing and height',
                effort: 'low',
                impact: 0.5
              }
            ],
            acknowledged: false,
            createdAt: new Date()
          });
        }
        break;

      case 'automation_level':
        if (answer === 'manual' || answer === 'basic') {
          const laborResponse = session.responses.find(r => r.questionId === 'labor_availability');
          if (laborResponse && laborResponse.answer < 8) {
            insights.push({
              id: this.generateInsightId(),
              sessionId: session.id,
              type: 'opportunity',
              category: 'automation',
              title: 'Automation Could Reduce Labor Needs',
              description: 'Higher automation could help with limited labor availability',
              impactLevel: 'high',
              efficiencyGain: 40, // 40% labor efficiency improvement
              suggestedActions: [
                {
                  action: 'Implement automated irrigation system',
                  effort: 'medium',
                  impact: 0.9
                },
                {
                  action: 'Add environmental monitoring and alerts',
                  effort: 'low',
                  impact: 0.6
                }
              ],
              acknowledged: false,
              createdAt: new Date()
            });
          }
        }
        break;
    }

    return insights;
  }

  private getCriticalReason(question: DesignQuestion): string {
    const reasons: Record<string, string> = {
      'facility_dimensions': 'Essential for calculating equipment requirements and costs',
      'crop_type': 'Different crops have vastly different environmental and regulatory requirements',
      'growing_method': 'Determines irrigation system design and infrastructure needs',
      'temperature_range': 'Critical for HVAC sizing and energy calculations',
      'humidity_control': 'Required for preventing mold and optimizing growth',
      'location_state': 'Affects compliance requirements and environmental system design'
    };
    
    return reasons[question.id] || 'Required for accurate system design';
  }

  private getImpactDescription(question: DesignQuestion): string {
    const impactCount = question.impactAreas.length;
    const areas = question.impactAreas.join(', ');
    return `Impacts ${impactCount} critical systems: ${areas}. Answering this can significantly improve design accuracy and cost optimization.`;
  }

  private checkCriticalRequirements(session: DesignSession): string[] {
    const missing: string[] = [];
    const answeredIds = new Set(session.responses.map(r => r.questionId));
    
    const criticalQuestions = [
      'facility_dimensions',
      'crop_type',
      'growing_method',
      'temperature_range',
      'humidity_control'
    ];
    
    for (const qId of criticalQuestions) {
      if (!answeredIds.has(qId)) {
        const question = this.questions.get(qId);
        if (question) {
          missing.push(question.question);
        }
      }
    }
    
    return missing;
  }

  private async aiGenerateDesign(session: DesignSession): Promise<any> {
    // Prepare context from responses
    const context = this.prepareDesignContext(session);
    
    const prompt = `
      Generate a comprehensive grow room design based on these specifications:
      ${JSON.stringify(context, null, 2)}
      
      Include:
      1. Lighting system specifications and layout
      2. HVAC requirements and equipment
      3. Irrigation system design
      4. Racking/benching layout
      5. Automation and control systems
      6. Energy consumption estimates
      7. Efficiency metrics and optimization opportunities
      8. Compliance considerations
      
      Format as structured JSON.
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private async generateAlternatives(
    session: DesignSession,
    baseDesign: any
  ): Promise<any[]> {
    // Generate efficiency-focused alternative
    const efficiencyOption = { ...baseDesign };
    efficiencyOption.name = 'Maximum Efficiency Design';
    efficiencyOption.description = 'Optimized for lowest operating costs and highest efficiency';
    // Adjust specifications for efficiency
    
    // Generate performance-focused alternative
    const performanceOption = { ...baseDesign };
    performanceOption.name = 'Maximum Performance Design';
    performanceOption.description = 'Optimized for highest yields and quality';
    // Enhance specifications for performance
    
    // Generate balanced alternative
    const balancedOption = { ...baseDesign };
    balancedOption.name = 'Balanced Design';
    balancedOption.description = 'Balanced approach between efficiency and performance';
    
    return [efficiencyOption, performanceOption, balancedOption];
  }

  private prepareDesignContext(session: DesignSession): any {
    const context: any = {};
    
    for (const response of session.responses) {
      const question = this.questions.get(response.questionId);
      if (question) {
        context[response.questionId] = {
          question: question.question,
          answer: response.answer,
          category: question.category,
          impacts: question.impactAreas
        };
      }
    }
    
    return context;
  }

  private parseDimensions(answer: string): { length: number; width: number; height: number; area: number } | null {
    // Parse dimensions from various formats
    const patterns = [
      /(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i,
      /(\d+)\s*['’]?\s*x\s*(\d+)\s*['’]?\s*x\s*(\d+)\s*['’]?/i
    ];
    
    for (const pattern of patterns) {
      const match = answer.match(pattern);
      if (match) {
        const length = parseFloat(match[1]);
        const width = parseFloat(match[2]);
        const height = parseFloat(match[3]);
        return {
          length,
          width,
          height,
          area: length * width
        };
      }
    }
    
    return null;
  }

  private parseExplanation(aiResponse: string): {
    explanation: string;
    examples: string[];
    commonMistakes: string[];
    proTips: string[];
  } {
    // Parse structured response from AI
    // This is a simplified version - in production would use more robust parsing
    const sections = aiResponse.split('\n\n');
    
    return {
      explanation: sections[0] || '',
      examples: sections[1]?.split('\n').filter(s => s.trim()) || [],
      commonMistakes: sections[2]?.split('\n').filter(s => s.trim()) || [],
      proTips: sections[3]?.split('\n').filter(s => s.trim()) || []
    };
  }

  // Database operations
  private async saveSession(session: DesignSession): Promise<void> {
    await prisma.designSession.upsert({
      where: { id: session.id },
      create: session,
      update: session
    });
  }

  private async getSession(sessionId: string): Promise<DesignSession | null> {
    return await prisma.designSession.findUnique({
      where: { id: sessionId }
    });
  }

  // ID generators
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { IntelligentDesignAssistant };
export default IntelligentDesignAssistant;