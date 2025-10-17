import { CreditManager } from '@/lib/credits/credit-manager';
import { CREDIT_COSTS } from '@/lib/pricing/unified-pricing';

export interface AIRequest {
  userId: string;
  type: 'simple' | 'complex' | 'optimization';
  prompt: string;
  context?: Record<string, any>;
}

export interface AIUsageResult {
  success: boolean;
  creditsUsed?: number;
  error?: string;
  remainingCredits?: number;
}

export class AIUsageTrackerV2 {
  /**
   * Check if user can make AI request and calculate cost
   */
  static async canMakeRequest(
    userId: string,
    requestType: 'simple' | 'complex' | 'optimization'
  ): Promise<{ allowed: boolean; cost: number; reason?: string }> {
    const cost = CREDIT_COSTS.aiDesigner[requestType];
    const hasCredits = await CreditManager.hasCredits(userId, 'aiDesigner', requestType);
    
    if (!hasCredits) {
      const balance = await CreditManager.getBalance(userId);
      return {
        allowed: false,
        cost,
        reason: `Insufficient credits. Need ${cost} credits, but you have ${balance.available}. Purchase more credits to continue.`
      };
    }

    // Check for abuse patterns
    const abuseCheck = await CreditManager.checkForAbuse(userId);
    if (abuseCheck.isAbusive) {
      return {
        allowed: false,
        cost,
        reason: `Unusual usage pattern detected: ${abuseCheck.reasons[0]}. Please wait before making more requests.`
      };
    }

    return {
      allowed: true,
      cost
    };
  }

  /**
   * Track AI usage and deduct credits
   */
  static async trackUsage(
    request: AIRequest
  ): Promise<AIUsageResult> {
    const { userId, type, prompt, context } = request;
    
    // Check if user can make request
    const canMake = await this.canMakeRequest(userId, type);
    if (!canMake.allowed) {
      return {
        success: false,
        error: canMake.reason
      };
    }

    // Use credits
    const result = await CreditManager.useCredits(
      userId,
      'aiDesigner',
      type,
      {
        prompt: prompt.substring(0, 100), // Store first 100 chars
        requestType: type,
        timestamp: new Date(),
        ...context
      }
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true,
      creditsUsed: canMake.cost,
      remainingCredits: result.balance.available
    };
  }

  /**
   * Estimate credits needed for a request
   */
  static estimateCredits(prompt: string, hasComplexRequirements: boolean = false): {
    type: 'simple' | 'complex' | 'optimization';
    cost: number;
  } {
    // Simple heuristics for estimation
    const promptLength = prompt.length;
    const hasMultipleRequests = prompt.includes('and') && prompt.includes('also');
    const hasOptimizationKeywords = /optimize|maximize|minimize|best|ideal/i.test(prompt);
    
    let type: 'simple' | 'complex' | 'optimization';
    
    if (hasOptimizationKeywords || promptLength > 500) {
      type = 'optimization';
    } else if (hasComplexRequirements || hasMultipleRequests || promptLength > 200) {
      type = 'complex';
    } else {
      type = 'simple';
    }

    return {
      type,
      cost: CREDIT_COSTS.aiDesigner[type]
    };
  }

  /**
   * Get user's AI usage history
   */
  static async getUsageHistory(userId: string, days: number = 30) {
    const stats = await CreditManager.getUsageStats(userId, days);
    
    // Filter for AI-specific usage
    const aiUsage = Object.entries(stats.usageByType)
      .filter(([action]) => action.startsWith('aiDesigner'))
      .reduce((acc, [action, credits]) => {
        acc[action] = credits;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalAICreditsUsed: Object.values(aiUsage).reduce((sum, credits) => sum + credits, 0),
      usageByType: aiUsage,
      dailyAverage: Math.round(Object.values(aiUsage).reduce((sum, credits) => sum + credits, 0) / days),
    };
  }

  /**
   * Check if user is approaching credit limit
   */
  static async checkCreditWarning(userId: string): Promise<{
    showWarning: boolean;
    message?: string;
  }> {
    const balance = await CreditManager.getBalance(userId);
    const percentage = (balance.available / (balance.monthlyAllocation + balance.purchased + balance.bonus)) * 100;

    if (percentage < 10) {
      return {
        showWarning: true,
        message: `Critical: Only ${balance.available} credits remaining. AI features will be limited.`
      };
    } else if (percentage < 25) {
      return {
        showWarning: true,
        message: `Low credits: ${balance.available} remaining. Consider purchasing more credits.`
      };
    }

    return { showWarning: false };
  }
}

// Export convenience functions for backward compatibility
export async function checkAIUsageLimit(
  userId: string,
  userTier: string, // No longer used, kept for compatibility
  feature: string
): Promise<{ allowed: boolean; reason?: string; remainingCredits?: number }> {
  const balance = await CreditManager.getBalance(userId);
  const canMake = await AIUsageTrackerV2.canMakeRequest(userId, 'simple');
  
  return {
    allowed: canMake.allowed,
    reason: canMake.reason,
    remainingCredits: balance.available
  };
}

export async function trackAIUsage(
  userId: string,
  feature: string,
  tokensUsed: number, // No longer used, kept for compatibility
  endpoint: string
): Promise<void> {
  // Convert to new system
  const request: AIRequest = {
    userId,
    type: 'simple',
    prompt: endpoint,
    context: { feature, endpoint }
  };
  
  await AIUsageTrackerV2.trackUsage(request);
}