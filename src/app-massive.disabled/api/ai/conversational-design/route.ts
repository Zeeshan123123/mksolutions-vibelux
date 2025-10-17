import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { conversationalBIM, ConversationContext } from '@/lib/ai/conversational-bim-engine';

// Input validation schemas
const initialRequestSchema = z.object({
  userInput: z.string().min(10, 'Please provide more detail about your lighting design needs'),
  context: z.object({
    initialRequest: z.string(),
    projectType: z.string().optional(),
    clarificationHistory: z.array(z.object({
      question: z.string(),
      answer: z.string().optional(),
      questionType: z.enum(['critical', 'optimization', 'preference', 'validation']),
      timestamp: z.string()
    })),
    currentPhase: z.enum(['analysis', 'clarification', 'design', 'refinement', 'complete']),
    confidence: z.number().min(0).max(1),
    missingInformation: z.array(z.string()),
    assumptions: z.array(z.object({
      category: z.string(),
      assumption: z.string(),
      confidence: z.number(),
      needsValidation: z.boolean()
    }))
  }).optional()
});

const answerQuestionSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
  context: z.object({
    initialRequest: z.string(),
    projectType: z.string().optional(),
    clarificationHistory: z.array(z.object({
      question: z.string(),
      answer: z.string().optional(),
      questionType: z.enum(['critical', 'optimization', 'preference', 'validation']),
      timestamp: z.string()
    })),
    currentPhase: z.enum(['analysis', 'clarification', 'design', 'refinement', 'complete']),
    confidence: z.number().min(0).max(1),
    missingInformation: z.array(z.string()),
    assumptions: z.array(z.object({
      category: z.string(),
      assumption: z.string(),
      confidence: z.number(),
      needsValidation: z.boolean()
    }))
  })
});

export async function POST(request: NextRequest) {
  try {
    logger.info('api', '🗣️ Conversational design API called');
    
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'start';

    if (action === 'start' || action === 'continue') {
      // Initial request or continuing conversation
      const validationResult = initialRequestSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Invalid input',
          details: validationResult.error.errors
        }, { status: 400 });
      }

      const { userInput, context } = validationResult.data;
      
      logger.info('api', `📝 Processing user input: ${userInput.substring(0, 100)}...`);
      
      const response = await conversationalBIM.processUserRequest(userInput, context);
      
      return NextResponse.json({
        success: true,
        data: response,
        metadata: {
          timestamp: new Date().toISOString(),
          phase: response.phase,
          confidence: response.confidence,
          questionsCount: response.clarificationQuestions?.length || 0
        }
      });

    } else if (action === 'answer') {
      // User answering a clarification question
      const validationResult = answerQuestionSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Invalid answer format',
          details: validationResult.error.errors
        }, { status: 400 });
      }

      const { questionId, answer, context } = validationResult.data;
      
      logger.info('api', `❓ User answered question ${questionId}: ${answer}`);
      
      const response = await conversationalBIM.continueConversation(questionId, answer, context);
      
      return NextResponse.json({
        success: true,
        data: response,
        metadata: {
          timestamp: new Date().toISOString(),
          questionAnswered: questionId,
          phase: response.phase,
          confidence: response.confidence
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action',
        message: 'Supported actions: start, continue, answer'
      }, { status: 400 });
    }

  } catch (error) {
    logger.error('api', '❌ Conversational design API error:', error );
    
    return NextResponse.json({
      success: false,
      error: 'Conversational design failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for conversation templates and examples
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'capabilities';

    if (type === 'capabilities') {
      return NextResponse.json({
        success: true,
        capabilities: {
          conversationalDesign: true,
          intelligentQuestioning: true,
          contextAwareness: true,
          smartDefaults: true,
          iterativeRefinement: true
        },
        features: {
          questionTypes: ['multiple_choice', 'numeric', 'text', 'boolean'],
          questionCategories: ['dimensions', 'requirements', 'constraints', 'preferences', 'validation'],
          questionPriorities: ['critical', 'important', 'optional'],
          phases: ['analysis', 'clarification', 'design', 'refinement', 'complete']
        },
        supportedProjectTypes: [
          'vertical_cannabis',
          'greenhouse_tomato',
          'leafy_greens', 
          'cannabis_flower',
          'research_facility'
        ]
      });

    } else if (type === 'examples') {
      return NextResponse.json({
        success: true,
        examples: {
          initialRequests: [
            "I need lighting for a 40x20 cannabis facility",
            "Help me design lighting for tomato greenhouse",
            "What fixtures do I need for a vertical farm?",
            "I want to optimize my existing grow room lighting",
            "Need a complete lighting design for research facility"
          ],
          conversationFlow: {
            step1: "User provides initial request",
            step2: "AI analyzes and asks clarifying questions",
            step3: "User answers questions (can skip optional ones)",
            step4: "AI generates complete design with documentation",
            step5: "User can request refinements or modifications"
          },
          sampleQuestions: [
            {
              type: "critical",
              question: "What are your facility dimensions?",
              impact: "Essential for fixture placement calculations"
            },
            {
              type: "important", 
              question: "What's your target PPFD?",
              impact: "Determines fixture count and power requirements"
            },
            {
              type: "optional",
              question: "Do you prefer specific manufacturers?",
              impact: "Helps narrow fixture selection"
            }
          ]
        }
      });

    } else if (type === 'template') {
      return NextResponse.json({
        success: true,
        conversationTemplate: {
          initialRequest: "",
          context: {
            initialRequest: "",
            clarificationHistory: [],
            currentPhase: "analysis",
            confidence: 0,
            missingInformation: [],
            assumptions: []
          }
        },
        apiUsage: {
          startConversation: "POST /api/ai/conversational-design?action=start",
          answerQuestion: "POST /api/ai/conversational-design?action=answer",
          getCapabilities: "GET /api/ai/conversational-design?type=capabilities"
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid type parameter',
        supportedTypes: ['capabilities', 'examples', 'template']
      }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve conversation info'
    }, { status: 500 });
  }
}

// Example conversation flow for documentation
export const EXAMPLE_CONVERSATION_FLOW = {
  // Step 1: User starts conversation
  initialRequest: {
    method: "POST",
    url: "/api/ai/conversational-design?action=start",
    body: {
      userInput: "I need lighting for a cannabis grow room",
      context: null
    }
  },

  // Step 2: AI responds with clarification questions
  aiResponse: {
    phase: "clarification",
    confidence: 0.3,
    readyToDesign: false,
    clarificationQuestions: [
      {
        id: "facility_dimensions",
        question: "What are your facility dimensions?",
        type: "text",
        priority: "critical",
        impact: "Essential for fixture placement calculations"
      },
      {
        id: "growth_stage", 
        question: "What growth stage will you focus on?",
        type: "multiple_choice",
        priority: "critical",
        options: ["Vegetative", "Flowering", "Both"]
      }
    ]
  },

  // Step 3: User answers questions
  userAnswers: {
    method: "POST", 
    url: "/api/ai/conversational-design?action=answer",
    body: {
      questionId: "facility_dimensions",
      answer: "40 feet by 20 feet by 12 feet high",
      context: {
        // Updated context with conversation history
      }
    }
  },

  // Step 4: AI generates complete design
  finalDesign: {
    phase: "complete",
    confidence: 0.9,
    readyToDesign: true,
    design: {
      // Complete BIM design with CAD files, BOM, etc.
    }
  }
};