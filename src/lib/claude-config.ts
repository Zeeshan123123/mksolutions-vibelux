import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/logging/production-logger';

// Production-ready Claude configuration
export const CLAUDE_CONFIG = {
  // API key will be read at runtime, not build time
  get apiKey() {
    return process.env.ANTHROPIC_API_KEY || '';
  },
  
  // Default model configurations - using Claude 4 models (latest generation)
  models: {
    design: 'claude-4-opus-20250514',        // Claude 4 Opus - most powerful model for complex design tasks
    simple: 'claude-4-sonnet-20250514',      // Claude 4 Sonnet - high performance for general tasks
    haiku: 'claude-3-5-haiku-20241022'       // Fast model for simple queries when needed
  },
  
  // No token limits - let users consume what they need and charge accordingly
  tokenLimits: {
    small: 200000,     // Use max context window for all requests
    medium: 200000,    // Use max context window for all requests
    large: 200000,     // Use max context window for all requests
    xlarge: 200000     // Use max context window for all requests
  },
  
  // Rate limiting configuration
  rateLimits: {
    maxRetries: 5,
    retryDelay: 2000,       // Claude has better rate limits
    backoffFactor: 2,
    timeout: 120000,        // 120s timeout
    jitter: true
  },
  
  // Usage tracking
  tracking: {
    logUsage: true,
    alertThreshold: 0.8   // Alert at 80% usage
  }
};

// Create configured Claude client with lazy loading
export function createClaudeClient() {
  if (!CLAUDE_CONFIG.apiKey) {
    throw new Error('Claude API key not configured. Set ANTHROPIC_API_KEY in environment.');
  }
  
  if (typeof window !== 'undefined') {
    throw new Error('Claude client should not be used in browser environment');
  }
  
  try {
    return new Anthropic({
      apiKey: CLAUDE_CONFIG.apiKey,
    });
  } catch (error) {
    logger.error('api', 'Failed to create Claude client:', error );
    throw error;
  }
}

// Helper to select appropriate model based on query complexity
export function selectModel(queryType: 'design' | 'simple' | 'fast' = 'design') {
  if (queryType === 'fast') return CLAUDE_CONFIG.models.haiku;
  return queryType === 'simple' ? CLAUDE_CONFIG.models.simple : CLAUDE_CONFIG.models.design;
}

// Helper to get token limit based on facility size
export function getTokenLimit(facilityArea: number): number {
  if (facilityArea > 20000) return CLAUDE_CONFIG.tokenLimits.xlarge;
  if (facilityArea > 10000) return CLAUDE_CONFIG.tokenLimits.large;
  if (facilityArea > 5000) return CLAUDE_CONFIG.tokenLimits.medium;
  return CLAUDE_CONFIG.tokenLimits.small;
}

// Production readiness checklist
export function checkProductionReadiness(): {
  ready: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!CLAUDE_CONFIG.apiKey) {
    issues.push('Anthropic API key not set (ANTHROPIC_API_KEY)');
  }
  
  if (!process.env.STRIPE_SECRET_KEY) {
    issues.push('Stripe not configured for usage billing');
  }
  
  return {
    ready: issues.length === 0,
    issues
  };
}

// Main function to get Claude response
export async function getClaudeResponse(systemPrompt: string, userPrompt: string, options?: {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const client = createClaudeClient();
  
  try {
    const response = await client.messages.create({
      model: options?.model || CLAUDE_CONFIG.models.design,
      max_tokens: options?.maxTokens || 8192,
      temperature: options?.temperature || 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });
    
    // Extract text from response
    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    logger.error('api', 'Claude API error:', error );
    throw error;
  }
}