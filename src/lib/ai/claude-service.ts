import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { CreditManager } from '@/lib/credits/credit-manager';
import { RateLimiter } from '@/lib/ai/rate-limiter';
import { CLAUDE_CONFIG, selectModel } from '@/lib/claude-config';
import { logger } from '@/lib/logging/production-logger';

// Lazy-initialize Anthropic client to avoid build-time errors
let anthropic: Anthropic | null = null;

// Claude 4 Opus model configuration
export const CLAUDE_4_OPUS_CONFIG = {
  model: selectModel('design'), // Claude 4 Opus for complex design tasks
  maxTokens: 8192, // Increased for complex BIM output
  temperature: 0.1, // Lower for more deterministic professional output
  topP: 0.9,
} as const;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    if (typeof window !== 'undefined') {
      throw new Error('Anthropic client should not be used in browser environment');
    }
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 3,
      timeout: 120000, // Increased timeout for complex BIM generation
    });
  }
  return anthropic;
}

// Rate limiter instance
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  maxBurst: 10,
});

export interface AIContext {
  facilityData?: any;
  sensorData?: any[];
  historicalData?: any[];
  environmentalData?: any;
  cropData?: any;
  cropType?: string;
  historicalYields?: any[];
  currentDesign?: any;
  userRole?: string;
  metadata?: Record<string, any>;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  tokensUsed?: number;
  creditsUsed?: number;
  processingTime?: number;
}

export class ClaudeAIService {
  private static instance: ClaudeAIService;
  
  private constructor() {}
  
  static getInstance(): ClaudeAIService {
    if (!this.instance) {
      this.instance = new ClaudeAIService();
    }
    return this.instance;
  }

  /**
   * Main method to interact with Claude API
   */
  async query<T = any>(
    prompt: string,
    context: AIContext,
    options: {
      maxTokens?: number;
      temperature?: number;
      model?: string; // Support any Claude model
      responseFormat?: 'json' | 'text';
      userId: string;
      feature: string;
      creditCost?: number;
    }
  ): Promise<AIResponse<T>> {
    const startTime = Date.now();
    
    try {
      // Check rate limits
      const rateLimitCheck = await rateLimiter.checkLimit(options.userId);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${Math.ceil((rateLimitCheck.retryAfter || 0) / 1000)} seconds.`,
        };
      }

      // Check credits
      const creditCost = options.creditCost || this.calculateCreditCost(prompt, options.model);
      const hasCredits = await CreditManager.hasCredits(options.userId, 'ai', options.feature);
      if (!hasCredits) {
        return {
          success: false,
          error: 'Insufficient credits for this AI request.',
        };
      }

      // Prepare the system message with context
      const systemMessage = this.buildSystemMessage(context, options.responseFormat);
      
      // Make API call to Claude
      const response = await getAnthropicClient().messages.create({
        model: options.model || selectModel('design'),
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        system: systemMessage,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude');
      }

      // Parse response based on format
      let parsedData: T;
      if (options.responseFormat === 'json') {
        try {
          parsedData = JSON.parse(content.text);
        } catch (parseError) {
          logger.error('Failed to parse JSON response:', parseError);
          parsedData = content.text as any;
        }
      } else {
        parsedData = content.text as any;
      }

      // Calculate tokens used (approximate)
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;

      // Deduct credits
      await CreditManager.useCredits(options.userId, 'ai', options.feature, {
        model: options.model,
        tokensUsed,
        feature: options.feature,
      });

      // Log successful request
      await this.logRequest({
        userId: options.userId,
        feature: options.feature,
        prompt: prompt.substring(0, 100), // Store first 100 chars
        model: options.model || selectModel('design'),
        tokensUsed,
        creditsUsed: creditCost,
        success: true,
        processingTime: Date.now() - startTime,
      });

      return {
        success: true,
        data: parsedData,
        confidence: 0.95, // Claude generally has high confidence
        tokensUsed,
        creditsUsed: creditCost,
        processingTime: Date.now() - startTime,
      };

    } catch (error: any) {
      logger.error('Claude AI Service Error:', error);

      // Log failed request
      await this.logRequest({
        userId: options.userId,
        feature: options.feature,
        prompt: prompt.substring(0, 100),
        model: options.model || selectModel('design'),
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      });

      return {
        success: false,
        error: this.getErrorMessage(error),
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Specialized method for lighting design recommendations
   */
  async getLightingRecommendations(
    userId: string,
    facilityData: any,
    targetMetrics: {
      ppfd?: number;
      dli?: number;
      uniformity?: number;
    }
  ): Promise<AIResponse<{
    recommendations: Array<{
      type: string;
      description: string;
      impact: string;
      priority: 'high' | 'medium' | 'low';
      estimatedCost?: string;
      energySavings?: string;
    }>;
    optimizations: Array<{
      parameter: string;
      currentValue: any;
      recommendedValue: any;
      reasoning: string;
    }>;
  }>> {
    const prompt = `As a lighting design expert for controlled environment agriculture, analyze the following facility and provide specific, actionable recommendations.

FACILITY DATA:
${JSON.stringify(facilityData, null, 2)}

TARGET METRICS:
- PPFD: ${targetMetrics.ppfd || 'not specified'} μmol/m²/s
- DLI: ${targetMetrics.dli || 'not specified'} mol/m²/day
- Uniformity: ${targetMetrics.uniformity || 0.8}

Please provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "type": "fixture_placement" | "spectrum_optimization" | "dimming_strategy" | "maintenance" | "upgrade",
      "description": "Detailed description of the recommendation",
      "impact": "Expected impact on yield, quality, or efficiency",
      "priority": "high" | "medium" | "low",
      "estimatedCost": "Cost estimate if applicable",
      "energySavings": "Potential energy savings"
    }
  ],
  "optimizations": [
    {
      "parameter": "Parameter name",
      "currentValue": "Current value",
      "recommendedValue": "Recommended value",
      "reasoning": "Scientific reasoning"
    }
  ]
}

Focus on practical, cost-effective solutions that can be implemented immediately.`;

    return this.query(prompt, { facilityData }, {
      userId,
      feature: 'lighting_recommendations',
      responseFormat: 'json',
      temperature: 0.5, // Lower temperature for more consistent recommendations
    });
  }

  /**
   * Disease prediction based on environmental data
   */
  async predictDiseases(
    userId: string,
    environmentalData: {
      temperature: number;
      humidity: number;
      vpd: number;
      airflow: number;
      leafWetness?: number;
    },
    cropType: string,
    historicalData?: any[]
  ): Promise<AIResponse<{
    predictions: Array<{
      disease: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      probability: number;
      timeframe: string;
      riskFactors: string[];
      preventiveMeasures: Array<{
        action: string;
        urgency: 'immediate' | 'soon' | 'routine';
        effectiveness: number;
      }>;
      earlyWarningSignals: string[];
    }>;
    environmentalAlerts: string[];
    recommendations: string[];
  }>> {
    const prompt = `As an expert plant pathologist specializing in controlled environment agriculture, analyze the environmental conditions and predict disease risks.

ENVIRONMENTAL CONDITIONS:
- Temperature: ${environmentalData.temperature}°C
- Humidity: ${environmentalData.humidity}%
- VPD: ${environmentalData.vpd} kPa
- Airflow: ${environmentalData.airflow} m/s
${environmentalData.leafWetness ? `- Leaf Wetness: ${environmentalData.leafWetness} hours/day` : ''}

CROP TYPE: ${cropType}

${historicalData ? `HISTORICAL DISEASE INCIDENTS:
${JSON.stringify(historicalData.slice(-10), null, 2)}` : ''}

Provide a comprehensive disease risk assessment in the following JSON format:
{
  "predictions": [
    {
      "disease": "Disease name",
      "riskLevel": "low" | "medium" | "high" | "critical",
      "probability": 0.0-1.0,
      "timeframe": "When disease might appear",
      "riskFactors": ["Factor 1", "Factor 2"],
      "preventiveMeasures": [
        {
          "action": "Specific action to take",
          "urgency": "immediate" | "soon" | "routine",
          "effectiveness": 0.0-1.0
        }
      ],
      "earlyWarningSignals": ["Sign 1", "Sign 2"]
    }
  ],
  "environmentalAlerts": ["Alert 1", "Alert 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Base predictions on scientific research and established disease models for ${cropType}.`;

    return this.query(prompt, { environmentalData, cropType, historicalData }, {
      userId,
      feature: 'disease_prediction',
      responseFormat: 'json',
              model: selectModel('design'), // Use best model for critical predictions
    });
  }

  /**
   * Yield prediction based on facility data
   */
  async predictYield(
    userId: string,
    facilityData: {
      cropType: string;
      area: number;
      currentStage: string;
      plantingDate: Date;
    },
    environmentalData: {
      avgTemperature: number;
      avgHumidity: number;
      avgPPFD: number;
      avgCO2: number;
      avgVPD: number;
    },
    historicalYields?: any[]
  ): Promise<AIResponse<{
    prediction: {
      expectedYield: number;
      unit: string;
      confidence: number;
      harvestDate: string;
      qualityScore: number;
    };
    factors: {
      positive: Array<{ factor: string; impact: number; description: string }>;
      negative: Array<{ factor: string; impact: number; description: string }>;
    };
    optimization: {
      potentialYield: number;
      improvements: Array<{
        action: string;
        expectedIncrease: number;
        difficulty: 'easy' | 'medium' | 'hard';
        roi: string;
      }>;
    };
    comparison: {
      industryAverage: number;
      topPerformers: number;
      yourRanking: string;
    };
  }>> {
    const prompt = `As an agricultural data scientist, predict yield for the following cultivation facility.

FACILITY DATA:
- Crop: ${facilityData.cropType}
- Growing Area: ${facilityData.area} sq ft
- Current Stage: ${facilityData.currentStage}
- Days Since Planting: ${Math.floor((Date.now() - new Date(facilityData.plantingDate).getTime()) / (1000 * 60 * 60 * 24))}

ENVIRONMENTAL CONDITIONS (Averages):
- Temperature: ${environmentalData.avgTemperature}°C
- Humidity: ${environmentalData.avgHumidity}%
- PPFD: ${environmentalData.avgPPFD} μmol/m²/s
- CO2: ${environmentalData.avgCO2} ppm
- VPD: ${environmentalData.avgVPD} kPa

${historicalYields ? `HISTORICAL YIELDS:
${historicalYields.map(y => `- ${y.date}: ${y.yield} ${y.unit}`).join('\\n')}` : ''}

Provide yield prediction in the following JSON format:
{
  "prediction": {
    "expectedYield": numeric value,
    "unit": "lbs/sq ft" or appropriate unit,
    "confidence": 0.0-1.0,
    "harvestDate": "YYYY-MM-DD",
    "qualityScore": 0-100
  },
  "factors": {
    "positive": [
      {
        "factor": "Factor name",
        "impact": percentage impact,
        "description": "How this helps yield"
      }
    ],
    "negative": [
      {
        "factor": "Factor name", 
        "impact": negative percentage,
        "description": "How this reduces yield"
      }
    ]
  },
  "optimization": {
    "potentialYield": numeric value,
    "improvements": [
      {
        "action": "Specific improvement",
        "expectedIncrease": percentage,
        "difficulty": "easy" | "medium" | "hard",
        "roi": "Return on investment timeframe"
      }
    ]
  },
  "comparison": {
    "industryAverage": numeric value,
    "topPerformers": numeric value,
    "yourRanking": "Description of performance level"
  }
}

Base predictions on proven yield models and industry benchmarks for ${facilityData.cropType}.`;

    return this.query(prompt, { facilityData, environmentalData, historicalYields }, {
      userId,
      feature: 'yield_prediction',
      responseFormat: 'json',
      temperature: 0.3, // Lower temperature for more accurate predictions
    });
  }

  /**
   * Natural language design commands
   */
  async processDesignCommand(
    userId: string,
    command: string,
    currentDesign: any
  ): Promise<AIResponse<{
    interpretation: string;
    actions: Array<{
      type: string;
      parameters: Record<string, any>;
      description: string;
    }>;
    validation: {
      feasible: boolean;
      issues: string[];
      warnings: string[];
    };
    alternatives?: Array<{
      description: string;
      reason: string;
    }>;
  }>> {
    const prompt = `As a lighting design AI assistant, interpret the following natural language command and convert it to specific design actions.

USER COMMAND: "${command}"

CURRENT DESIGN STATE:
${JSON.stringify(currentDesign, null, 2)}

Interpret the command and provide actionable design steps in JSON format:
{
  "interpretation": "What I understand you want to do",
  "actions": [
    {
      "type": "CREATE_ROOM" | "ADD_FIXTURES" | "OPTIMIZE_LAYOUT" | etc.,
      "parameters": {
        // Relevant parameters for the action
      },
      "description": "What this action does"
    }
  ],
  "validation": {
    "feasible": true/false,
    "issues": ["Any problems with the request"],
    "warnings": ["Any concerns or suggestions"]
  },
  "alternatives": [
    {
      "description": "Alternative approach",
      "reason": "Why this might be better"
    }
  ]
}

Be helpful and suggest improvements when the user's request could be optimized.`;

    return this.query(prompt, { currentDesign }, {
      userId,
      feature: 'design_command',
      responseFormat: 'json',
      maxTokens: 1500,
    });
  }

  /**
   * Helper method to build system message with context
   */
  private buildSystemMessage(context: AIContext, responseFormat?: string): string {
    let systemMessage = `You are VibeLux AI, an expert assistant for controlled environment agriculture and horticultural lighting design. 
You have deep knowledge of:
- LED lighting technology and photobiology
- Plant growth optimization and crop science
- Environmental control systems
- Energy efficiency and sustainability
- Industry standards and best practices

Your responses should be:
- Scientifically accurate and evidence-based
- Practical and actionable
- Cost-conscious and ROI-focused
- Tailored to the user's specific context`;

    if (context.userRole) {
      systemMessage += `\n\nUser role: ${context.userRole} - adjust technical depth accordingly.`;
    }

    if (responseFormat === 'json') {
      systemMessage += `\n\nIMPORTANT: Always respond with valid JSON that matches the requested format exactly.`;
    }

    return systemMessage;
  }

  /**
   * Calculate credit cost based on request complexity
   */
  private calculateCreditCost(prompt: string, model?: string): number {
    const baseCost = model?.includes('haiku') ? 5 : 10;
    const lengthMultiplier = Math.ceil(prompt.length / 1000); // 1 credit per 1000 chars
    return baseCost * Math.max(1, lengthMultiplier);
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.status === 429) {
      return 'AI service is currently at capacity. Please try again in a few moments.';
    } else if (error.status === 401) {
      return 'AI service authentication failed. Please contact support.';
    } else if (error.message?.includes('timeout')) {
      return 'Request timed out. Please try a simpler query.';
    } else {
      return 'An error occurred processing your request. Please try again.';
    }
  }

  /**
   * Log AI request for analytics and monitoring
   */
  private async logRequest(data: {
    userId: string;
    feature: string;
    prompt: string;
    model: string;
    tokensUsed?: number;
    creditsUsed?: number;
    success: boolean;
    error?: string;
    processingTime: number;
  }): Promise<void> {
    try {
      await prisma.aiRequestLog.create({
        data: {
          ...data,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to log AI request:', error);
    }
  }
}

// Export singleton instance
export const claudeAI = ClaudeAIService.getInstance();

// Export getAnthropicClient for other modules that need direct access
export { getAnthropicClient };