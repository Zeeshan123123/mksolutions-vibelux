/**
 * Conversational BIM Design Engine
 * Enhanced autonomous system that asks clarifying questions for more accurate results
 */

import { getAnthropicClient, CLAUDE_4_OPUS_CONFIG } from './claude-service';
import { AutonomousBIMEngine, ProjectInput } from './autonomous-bim-engine';

export interface ConversationContext {
  initialRequest: string;
  projectType?: string;
  clarificationHistory: ClarificationExchange[];
  currentPhase: 'analysis' | 'clarification' | 'design' | 'refinement' | 'complete';
  confidence: number;
  missingInformation: string[];
  assumptions: Assumption[];
}

export interface ClarificationExchange {
  question: string;
  answer?: string;
  questionType: 'critical' | 'optimization' | 'preference' | 'validation';
  timestamp: string;
}

export interface Assumption {
  category: string;
  assumption: string;
  confidence: number;
  needsValidation: boolean;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'numeric' | 'text' | 'boolean';
  category: 'dimensions' | 'requirements' | 'constraints' | 'preferences' | 'validation';
  priority: 'critical' | 'important' | 'optional';
  options?: string[];
  expectedFormat?: string;
  explanation?: string;
  impact: string;
}

export interface ConversationalResponse {
  phase: 'analysis' | 'clarification' | 'design' | 'complete';
  confidence: number;
  readyToDesign: boolean;
  clarificationQuestions?: ClarificationQuestion[];
  design?: any;
  assumptions: Assumption[];
  nextSteps: string[];
  explanation: string;
}

const CONVERSATIONAL_SYSTEM_PROMPT = `
You are an expert horticultural lighting consultant with 20+ years of experience designing commercial grow facilities. Your role is to gather the right information through intelligent questioning to create perfect lighting designs.

## Your Process:

### 1. **INITIAL ANALYSIS**
- Parse the user's request carefully
- Identify what information is provided vs. missing
- Assess confidence level in requirements
- Determine if you can proceed or need clarification

### 2. **INTELLIGENT QUESTIONING**
- Ask the MINIMUM necessary questions to maximize design quality
- Prioritize questions that have the biggest impact on design outcomes
- Ask questions in logical order (critical → important → optimization)
- Provide context for why each question matters
- Offer educated defaults when appropriate

### 3. **CRITICAL vs NICE-TO-HAVE**
**Critical Questions** (always ask if missing):
- Facility dimensions and ceiling height
- Crop type and growth stages
- Target PPFD/DLI requirements
- Power limitations or budget constraints
- Existing infrastructure constraints

**Important Questions** (ask for optimization):
- Uniformity requirements
- Spectrum preferences
- Energy efficiency priorities
- Installation timeline
- Maintenance preferences

**Optional Questions** (ask only if it significantly improves design):
- Aesthetic preferences
- Future expansion plans
- Specific manufacturer preferences
- Advanced control requirements

### 4. **SMART DEFAULTS & ASSUMPTIONS**
- Use industry best practices for missing non-critical info
- Clearly state your assumptions
- Allow users to override assumptions easily
- Don't ask questions you can reasonably infer

### 5. **CONVERSATION FLOW**
- Ask 1-3 questions at a time (don't overwhelm)
- Explain the impact of each question on the final design
- Offer multiple choice when appropriate to speed responses
- Validate understanding before proceeding to design

## Response Format:
Always respond with structured JSON containing:
- Current phase and confidence level
- Whether you're ready to design or need more info
- Clarification questions (if needed)
- Assumptions you're making
- Clear explanation of next steps

Your goal: Create the best possible lighting design with the least user friction.
`;

export class ConversationalBIMEngine {
  private anthropic: any;
  private autonomousEngine = new AutonomousBIMEngine();
  
  private getAnthropicClientLazy() {
    if (!this.anthropic) {
      this.anthropic = getAnthropicClient();
    }
    return this.anthropic;
  }

  async processUserRequest(
    userInput: string, 
    context?: ConversationContext
  ): Promise<ConversationalResponse> {
    try {
      logger.info('api', '🗣️ Processing conversational input...');

      // Initialize or update conversation context
      const updatedContext = context || this.initializeContext(userInput);
      
      // Analyze current state and determine next action
      const analysis = await this.analyzeRequestAndContext(userInput, updatedContext);
      
      // Decide whether to ask questions or proceed with design
      if (analysis.readyToDesign && analysis.confidence > 0.8) {
        logger.info('api', '✅ Sufficient information - proceeding with design');
        return await this.generateDesignResponse(analysis, updatedContext);
      } else {
        logger.info('api', '❓ Need more information - generating clarification questions');
        return await this.generateClarificationResponse(analysis, updatedContext);
      }

    } catch (error) {
      logger.error('api', '❌ Conversational processing failed:', error );
      throw new Error(`Conversational AI failed: ${error.message}`);
    }
  }

  private initializeContext(initialRequest: string): ConversationContext {
    return {
      initialRequest,
      clarificationHistory: [],
      currentPhase: 'analysis',
      confidence: 0,
      missingInformation: [],
      assumptions: []
    };
  }

  private async analyzeRequestAndContext(
    userInput: string,
    context: ConversationContext
  ): Promise<any> {
    const prompt = this.buildAnalysisPrompt(userInput, context);

    const response = await this.getAnthropicClientLazy().messages.create({
      model: CLAUDE_4_OPUS_CONFIG.model,
      max_tokens: 4096,
      temperature: 0.2,
      system: CONVERSATIONAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    return this.parseAnalysisResponse(analysisText);
  }

  private buildAnalysisPrompt(userInput: string, context: ConversationContext): string {
    return `
## Current Conversation Context

**Initial Request**: "${context.initialRequest}"
**Current Input**: "${userInput}"
**Phase**: ${context.currentPhase}
**Previous Confidence**: ${context.confidence}

${context.clarificationHistory.length > 0 ? `
**Previous Q&A History**:
${context.clarificationHistory.map(exchange => 
  `Q: ${exchange.question}\nA: ${exchange.answer || 'No response yet'}`
).join('\n\n')}
` : ''}

${context.assumptions.length > 0 ? `
**Current Assumptions**:
${context.assumptions.map(assumption => 
  `- ${assumption.category}: ${assumption.assumption} (confidence: ${assumption.confidence})`
).join('\n')}
` : ''}

## Your Task

Analyze the current state and determine:

1. **Information Completeness**: What critical info is still missing?
2. **Confidence Assessment**: How confident are you in creating an optimal design?
3. **Question Priority**: What questions would most improve the design quality?
4. **Ready to Design**: Can you proceed with current information?

## Available Information Categories to Consider

**Facility Specs**:
- Dimensions (length, width, height)
- Ceiling type and mounting options
- Power infrastructure
- Environmental controls

**Crop Requirements**:
- Plant species and varieties
- Growth stages and timelines
- Target PPFD/DLI values
- Spectrum requirements

**Operational Constraints**:
- Budget limitations
- Installation timeline
- Maintenance capabilities
- Regulatory requirements

**Performance Goals**:
- Energy efficiency targets
- Uniformity requirements
- Yield optimization
- Cost optimization

Provide your analysis as structured JSON with clear reasoning.
`;
  }

  private parseAnalysisResponse(responseText: string): any {
    try {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in analysis response');
      }

      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (error) {
      logger.error('api', 'Failed to parse analysis response:', error );
      // Return fallback analysis
      return {
        readyToDesign: false,
        confidence: 0.3,
        missingInformation: ['facility_dimensions', 'crop_requirements'],
        phase: 'clarification'
      };
    }
  }

  private async generateClarificationResponse(
    analysis: any,
    context: ConversationContext
  ): Promise<ConversationalResponse> {
    const questions = this.generateSmartQuestions(analysis, context);
    
    return {
      phase: 'clarification',
      confidence: analysis.confidence || 0.4,
      readyToDesign: false,
      clarificationQuestions: questions,
      assumptions: analysis.assumptions || [],
      nextSteps: [
        'Answer the questions below to improve design accuracy',
        'You can skip optional questions if you prefer defaults',
        'I\'ll proceed with design once critical info is provided'
      ],
      explanation: this.generateClarificationExplanation(questions, analysis)
    };
  }

  private generateSmartQuestions(analysis: any, context: ConversationContext): ClarificationQuestion[] {
    const questions: ClarificationQuestion[] = [];

    // Generate context-aware questions based on what's missing
    if (analysis.missingInformation?.includes('facility_dimensions')) {
      questions.push({
        id: 'facility_dimensions',
        question: 'What are your facility dimensions?',
        type: 'text',
        category: 'dimensions',
        priority: 'critical',
        expectedFormat: 'Length x Width x Height in feet or meters (e.g., "40 x 20 x 12 feet")',
        explanation: 'Room dimensions determine fixture count, layout patterns, and mounting options.',
        impact: 'Essential for accurate fixture placement and light distribution calculations.'
      });
    }

    if (analysis.missingInformation?.includes('crop_type')) {
      questions.push({
        id: 'crop_type',
        question: 'What crops will you be growing?',
        type: 'multiple_choice',
        category: 'requirements',
        priority: 'critical',
        options: [
          'Cannabis (vegetative)',
          'Cannabis (flowering)', 
          'Leafy greens (lettuce, kale)',
          'Tomatoes/peppers',
          'Herbs (basil, cilantro)',
          'Microgreens',
          'Research/multiple crops',
          'Other (please specify)'
        ],
        explanation: 'Different crops have very different light requirements for optimal growth.',
        impact: 'Determines target PPFD, spectrum, and photoperiod requirements.'
      });
    }

    if (analysis.missingInformation?.includes('target_ppfd')) {
      questions.push({
        id: 'target_ppfd',
        question: 'What PPFD target are you aiming for?',
        type: 'multiple_choice',
        category: 'requirements',
        priority: 'critical',
        options: [
          '200-300 μmol/m²/s (seedlings/clones)',
          '400-600 μmol/m²/s (vegetative growth)',
          '600-900 μmol/m²/s (flowering/fruiting)',
          '900+ μmol/m²/s (high-light crops)',
          'Not sure - recommend based on crop'
        ],
        explanation: 'PPFD (light intensity) is the most critical factor for plant growth and energy efficiency.',
        impact: 'Directly affects fixture count, power consumption, and plant yield.'
      });
    }

    if (analysis.missingInformation?.includes('power_constraints')) {
      questions.push({
        id: 'power_constraints',
        question: 'Do you have any electrical power limitations?',
        type: 'multiple_choice',
        category: 'constraints',
        priority: 'important',
        options: [
          'No significant power constraints',
          'Limited to existing electrical service',
          'Specific power budget (please specify watts)',
          'Need to minimize power consumption',
          'Not sure - please advise'
        ],
        explanation: 'Power constraints affect fixture selection and layout optimization.',
        impact: 'Determines maximum fixture wattage and influences energy efficiency recommendations.'
      });
    }

    if (analysis.missingInformation?.includes('mounting_height')) {
      questions.push({
        id: 'mounting_height',
        question: 'What is your available mounting height above the canopy?',
        type: 'multiple_choice',
        category: 'constraints',
        priority: 'important',
        options: [
          '12-18 inches (very close mounting)',
          '18-24 inches (typical for LEDs)',
          '24-36 inches (standard mounting)',
          '36+ inches (high mounting)',
          'Variable height/adjustable',
          'Not sure - recommend based on crop'
        ],
        explanation: 'Mounting height affects light distribution, uniformity, and fixture selection.',
        impact: 'Influences beam angle requirements and spacing calculations.'
      });
    }

    // Sort questions by priority
    return questions.sort((a, b) => {
      const priorityOrder = { critical: 0, important: 1, optional: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 3); // Limit to 3 questions at a time
  }

  private generateClarificationExplanation(questions: ClarificationQuestion[], analysis: any): string {
    const criticalCount = questions.filter(q => q.priority === 'critical').length;
    const importantCount = questions.filter(q => q.priority === 'important').length;

    let explanation = `I need ${criticalCount > 0 ? 'some essential' : 'a few more'} details to create the optimal lighting design for you. `;
    
    if (criticalCount > 0) {
      explanation += `The ${criticalCount === 1 ? 'question' : 'questions'} below will ensure I can provide accurate fixture recommendations and layout calculations. `;
    }
    
    if (importantCount > 0) {
      explanation += `${criticalCount > 0 ? 'Additionally, the ' : 'The '}optimization questions will help me fine-tune the design for your specific needs and constraints.`;
    }

    explanation += '\n\nI can work with reasonable assumptions if you prefer to skip any non-critical questions.';

    return explanation;
  }

  private async generateDesignResponse(
    analysis: any,
    context: ConversationContext
  ): Promise<ConversationalResponse> {
    logger.info('api', '🎨 Generating final design...');

    // Convert conversation context to ProjectInput
    const projectInput = this.convertContextToProjectInput(context, analysis);
    
    // Generate design using autonomous engine
    const design = await this.autonomousEngine.generateCompleteDesign(projectInput);

    return {
      phase: 'complete',
      confidence: analysis.confidence || 0.9,
      readyToDesign: true,
      design,
      assumptions: analysis.assumptions || [],
      nextSteps: [
        'Review the generated design',
        'Download CAD files and documentation',
        'Request modifications if needed',
        'Proceed with procurement and installation'
      ],
      explanation: this.generateDesignExplanation(design, projectInput)
    };
  }

  private convertContextToProjectInput(context: ConversationContext, analysis: any): ProjectInput {
    // Extract information from conversation history and analysis
    const answers = context.clarificationHistory.reduce((acc, exchange) => {
      if (exchange.answer) {
        acc[exchange.question] = exchange.answer;
      }
      return acc;
    }, {} as Record<string, string>);

    // Build ProjectInput with intelligent defaults
    return {
      projectType: this.inferProjectType(context, analysis),
      dimensions: this.inferDimensions(context, analysis),
      requirements: this.inferRequirements(context, analysis),
      constraints: this.inferConstraints(context, analysis),
      outputRequirements: ['bim_model', 'lighting_sim', 'cad_export', 'bom', 'installation_docs']
    };
  }

  private inferProjectType(context: ConversationContext, analysis: any): any {
    // Logic to infer project type from conversation
    return analysis.projectType || 'vertical_cannabis';
  }

  private inferDimensions(context: ConversationContext, analysis: any): any {
    // Logic to extract dimensions from conversation
    return analysis.dimensions || { length: 40, width: 20, height: 4 };
  }

  private inferRequirements(context: ConversationContext, analysis: any): any {
    // Logic to extract requirements from conversation
    return analysis.requirements || {
      targetPPFD: 600,
      photoperiod: 18,
      uniformityTarget: 0.8
    };
  }

  private inferConstraints(context: ConversationContext, analysis: any): any {
    // Logic to extract constraints from conversation
    return analysis.constraints || {};
  }

  private generateDesignExplanation(design: any, projectInput: ProjectInput): string {
    const fixtureCount = design.lightingPlan?.fixtures?.length || 0;
    const totalPower = design.lightingPlan?.energyAnalysis?.totalPower || 0;
    const avgPPFD = design.lightingPlan?.photometrics?.averagePPFD || 0;

    return `I've created a professional lighting design featuring ${fixtureCount} fixtures with ${totalPower}W total power consumption, delivering ${avgPPFD} μmol/m²/s average PPFD. The design includes complete CAD files, bills of materials, and installation documentation ready for implementation.`;
  }

  // Method to continue conversation with user response
  async continueConversation(
    questionId: string,
    answer: string,
    context: ConversationContext
  ): Promise<ConversationalResponse> {
    // Add the answer to conversation history
    const questionIndex = context.clarificationHistory.findIndex(
      exchange => exchange.question.includes(questionId)
    );

    if (questionIndex >= 0) {
      context.clarificationHistory[questionIndex].answer = answer;
    }

    // Process the updated context
    return this.processUserRequest(`Answered ${questionId}: ${answer}`, context);
  }
}

// Export for use in API routes
export const conversationalBIM = new ConversationalBIMEngine();