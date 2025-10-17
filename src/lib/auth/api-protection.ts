/**
 * API Route Protection Helpers
 * Standardized access control for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAccess } from './access-control';
import { checkRateLimit as checkRateLimitImpl, trackAPIUsage as trackAPIUsageImpl, getUsageStats } from './rate-limiter';
import { logger } from '@/lib/logging/production-logger';

export interface APIProtectionConfig {
  /** Required subscription tier(s) */
  tier?: string | string[];
  /** Required module */
  module?: string;
  /** Required credits */
  credits?: {
    type: 'aiDesigner' | 'apiCalls' | 'reports' | 'simulations';
    amount: number;
  };
  /** Allow authenticated users without subscription check */
  allowAuthenticated?: boolean;
  /** Custom access check function */
  customCheck?: (userId: string, req: NextRequest) => Promise<{ allowed: boolean; reason?: string }>;
}

/**
 * Standard API protection wrapper
 */
export async function withAPIProtection(
  req: NextRequest,
  config: APIProtectionConfig
): Promise<{ allowed: boolean; response?: NextResponse; userId?: string }> {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    // If only authentication is required, skip subscription checks
    if (config.allowAuthenticated && !config.tier && !config.module && !config.credits) {
      return { allowed: true, userId };
    }

    // Custom access check
    if (config.customCheck) {
      const customResult = await config.customCheck(userId, req);
      if (!customResult.allowed) {
        return {
          allowed: false,
          response: NextResponse.json(
            { error: customResult.reason || 'Access denied' },
            { status: 403 }
          )
        };
      }
    }

    // Standard subscription-based access check
    const accessCheck = await requireAccess('api-access', {
      tier: config.tier,
      module: config.module,
      credits: config.credits,
      userId: userId
    });

    if (!accessCheck.allowed) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: 'Access denied',
            message: accessCheck.reason,
            upgradeRequired: accessCheck.upgradeRequired
          },
          { status: 403 }
        )
      };
    }

    return { allowed: true, userId };
  } catch (error) {
    logger.error('api', 'API protection error:', error );
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Access control check failed' },
        { status: 500 }
      )
    };
  }
}

/**
 * Decorator for API route handlers
 */
export function protectedAPIRoute(config: APIProtectionConfig) {
  return function (handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>) {
    return async function (req: NextRequest, routeContext?: any) {
      const protection = await withAPIProtection(req, config);
      
      if (!protection.allowed) {
        return protection.response!;
      }

      return handler(req, { userId: protection.userId! });
    };
  };
}

/**
 * Common protection configurations
 */
export const PROTECTION_CONFIGS = {
  // Basic authenticated access
  authenticated: {
    allowAuthenticated: true
  },

  // Tier-based access
  professional: {
    tier: ['professional', 'enterprise']
  },

  enterprise: {
    tier: 'enterprise'
  },

  // Module-based access
  advancedDesign: {
    module: 'advanced-designer-suite',
    credits: { type: 'aiDesigner' as const, amount: 10 }
  },

  research: {
    module: 'research-analytics-suite'
  },

  smartFacility: {
    module: 'smart-facility-suite'
  },

  // Credit-based access
  aiHeavy: {
    credits: { type: 'aiDesigner' as const, amount: 50 }
  },

  // Combined requirements
  enterpriseDesign: {
    tier: 'enterprise',
    module: 'advanced-designer-suite',
    credits: { type: 'aiDesigner' as const, amount: 25 }
  }
} as const;

/**
 * Quick protection wrapper for simple cases
 */
export const withAuth = (handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>) =>
  protectedAPIRoute(PROTECTION_CONFIGS.authenticated)(handler);

export const withProfessional = (handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>) =>
  protectedAPIRoute(PROTECTION_CONFIGS.professional)(handler);

export const withEnterprise = (handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>) =>
  protectedAPIRoute(PROTECTION_CONFIGS.enterprise)(handler);

export const withResearch = (handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>) =>
  protectedAPIRoute(PROTECTION_CONFIGS.research)(handler);

/**
 * Usage tracking for API calls
 */
export async function trackAPIUsage(
  userId: string,
  endpoint: string,
  metadata: any = {}
) {
  try {
    // Use the actual implementation
    await trackAPIUsageImpl(userId, endpoint, metadata);
    return true;
  } catch (error) {
    logger.error('api', 'Failed to track API usage:', error );
    return false;
  }
}

/**
 * Rate limiting for API endpoints
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  userTier: string = 'FREE'
): Promise<{ allowed: boolean; remaining?: number; resetTime?: number; limit?: number }> {
  try {
    const result = await checkRateLimitImpl(userId, endpoint, userTier);
    
    if (!result.allowed) {
      logger.warn('api', `Rate limit exceeded for user ${userId} on ${endpoint}`, {
        data: { remaining: result.remaining, resetTime: result.resetTime }
      });
    }
    
    return result;
  } catch (error) {
    logger.error('api', 'Rate limit check failed:', error );
    return { allowed: false };
  }
}