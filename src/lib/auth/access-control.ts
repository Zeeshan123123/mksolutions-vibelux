/**
 * Centralized Access Control System
 * Server-side subscription and module access validation
 */

import { auth } from '@/lib/auth';
import { getSubscription } from '@/lib/subscription/subscription-service';
import { SUBSCRIPTION_TIERS, MODULES, HYBRID_FEATURES } from '@/lib/pricing/unified-pricing';
import { NextRequest } from 'next/server';
import { SecurityConfig, getUserRole, hasPermission, Permissions } from '@/lib/security-config';
import { logger } from '@/lib/logging/production-logger';

export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: {
    currentTier: string;
    requiredTier: string;
    feature: string;
  };
}

export interface UserSubscription {
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  modules: string[];
  credits: {
    aiDesigner: number;
    apiCalls: number;
    reports: number;
    simulations: number;
  };
  limits: {
    facilities: number;
    users: number;
    projects: number;
    dataRetention: number;
  };
  status: 'active' | 'past_due' | 'canceled' | 'trial';
}

/**
 * Check if user is admin/owner with full access
 */
export async function isAdminUser(userId?: string): Promise<{ isAdmin: boolean; isOwner: boolean; userEmail?: string }> {
  try {
    if (!userId) {
      const session = await auth();
      if (!session?.user?.id) return { isAdmin: false, isOwner: false };
      userId = session.user.id;
    }

    const session = await auth();
    const userEmail = session?.user?.email || session?.user?.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail) return { isAdmin: false, isOwner: false };

    const isOwner = SecurityConfig.ownerEmails.includes(userEmail);
    const isAdmin = SecurityConfig.adminEmails.includes(userEmail);

    return { 
      isAdmin: isAdmin || isOwner, 
      isOwner, 
      userEmail 
    };
  } catch (error) {
    logger.error('api', 'Failed to check admin status:', error );
    return { isAdmin: false, isOwner: false };
  }
}

/**
 * Get user's current subscription details with admin override
 */
export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
  try {
    if (!userId) {
      const session = await auth();
      if (!session?.user?.id) return null;
      userId = session.user.id;
    }

    // Check if user is admin/owner - they get full access
    const adminStatus = await isAdminUser(userId);
    if (adminStatus.isAdmin) {
      return {
        tier: 'enterprise',
        modules: ['all'], // Admin gets access to all modules
        credits: {
          aiDesigner: 999999,
          apiCalls: 999999,
          reports: 999999,
          simulations: 999999,
        },
        limits: {
          facilities: -1, // unlimited
          users: -1, // unlimited
          projects: -1, // unlimited
          dataRetention: -1, // unlimited
        },
        status: 'active'
      };
    }

    // Demo access disabled for static export
    // TODO: Re-enable demo access when API routes are restored

    const subscription = await getSubscription(userId);
    if (!subscription) {
      // Return free tier defaults
      return {
        tier: 'free',
        modules: [],
        credits: SUBSCRIPTION_TIERS.free.credits,
        limits: SUBSCRIPTION_TIERS.free.limits,
        status: 'active'
      };
    }

    // Normalize DB subscription into unified UserSubscription shape
    const normalizedTier = (subscription.tierId as any) || 'free';
    const tierConfig = SUBSCRIPTION_TIERS[normalizedTier] || SUBSCRIPTION_TIERS.free;

    // Merge modules included in tier with any user-specific modules
    const mergedModules = Array.from(
      new Set([...(tierConfig.modules || []), ...(subscription.modules || [])])
    );

    return {
      tier: normalizedTier,
      modules: mergedModules,
      credits: tierConfig.credits,
      limits: tierConfig.limits,
      status: (subscription.status as any) || 'active',
    };
  } catch (error) {
    logger.error('api', 'Failed to get user subscription:', error );
    return null;
  }
}

/**
 * Check if user has access to a specific subscription tier
 */
export async function requireSubscriptionTier(
  requiredTier: string | string[],
  userId?: string
): Promise<AccessControlResult> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'No subscription found',
      upgradeRequired: {
        currentTier: 'none',
        requiredTier: Array.isArray(requiredTier) ? requiredTier[0] : requiredTier,
        feature: 'subscription'
      }
    };
  }

  const requiredTiers = Array.isArray(requiredTier) ? requiredTier : [requiredTier];
  const tierHierarchy = ['free', 'starter', 'professional', 'enterprise'];
  const currentTierIndex = tierHierarchy.indexOf(subscription.tier);
  
  // Check if user's tier meets any of the required tiers
  const hasAccess = requiredTiers.some(tier => {
    const requiredIndex = tierHierarchy.indexOf(tier);
    return currentTierIndex >= requiredIndex;
  });

  if (!hasAccess) {
    return {
      allowed: false,
      reason: `Requires ${requiredTiers.join(' or ')} tier, current: ${subscription.tier}`,
      upgradeRequired: {
        currentTier: subscription.tier,
        requiredTier: requiredTiers[0],
        feature: 'tier'
      }
    };
  }

  return { allowed: true };
}

/**
 * Check if user has access to a specific module
 */
export async function requireModule(
  moduleId: string,
  userId?: string
): Promise<AccessControlResult> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'No subscription found',
      upgradeRequired: {
        currentTier: 'none',
        requiredTier: 'starter',
        feature: moduleId
      }
    };
  }

  // Check if module is included in user's tier
  const tierModules = SUBSCRIPTION_TIERS[subscription.tier]?.modules || [];
  if (tierModules.includes(moduleId) || tierModules.includes('all')) {
    return { allowed: true };
  }

  // Check if user has purchased the module separately
  if (subscription.modules.includes(moduleId)) {
    return { allowed: true };
  }

  // Find the module details for better error messaging
  const module = MODULES[moduleId];
  if (!module) {
    return {
      allowed: false,
      reason: `Module ${moduleId} not found`
    };
  }

  return {
    allowed: false,
    reason: `Requires ${module.name} module`,
    upgradeRequired: {
      currentTier: subscription.tier,
      requiredTier: module.category,
      feature: moduleId
    }
  };
}

/**
 * Check if user has sufficient credits for an action
 */
export async function requireCredits(
  action: keyof UserSubscription['credits'],
  amount: number,
  userId?: string
): Promise<AccessControlResult> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'No subscription found'
    };
  }

  const availableCredits = subscription.credits[action];
  if (availableCredits < amount) {
    return {
      allowed: false,
      reason: `Insufficient ${action} credits. Required: ${amount}, Available: ${availableCredits}`,
      upgradeRequired: {
        currentTier: subscription.tier,
        requiredTier: 'professional',
        feature: 'credits'
      }
    };
  }

  return { allowed: true };
}

/**
 * Check if user is within usage limits
 */
export async function checkUsageLimit(
  limit: keyof UserSubscription['limits'],
  currentUsage: number,
  userId?: string
): Promise<AccessControlResult> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'No subscription found'
    };
  }

  const maxAllowed = subscription.limits[limit];
  if (maxAllowed === -1) {
    return { allowed: true }; // Unlimited
  }

  if (currentUsage >= maxAllowed) {
    return {
      allowed: false,
      reason: `Usage limit reached. Maximum ${limit}: ${maxAllowed}`,
      upgradeRequired: {
        currentTier: subscription.tier,
        requiredTier: 'professional',
        feature: limit
      }
    };
  }

  return { allowed: true };
}

/**
 * Comprehensive access check for features
 */
export async function requireAccess(
  feature: string,
  options: {
    module?: string;
    tier?: string | string[];
    credits?: { type: keyof UserSubscription['credits']; amount: number };
    userId?: string;
  } = {}
): Promise<AccessControlResult> {
  const { module, tier, credits, userId } = options;

  // Check subscription tier if specified
  if (tier) {
    const tierCheck = await requireSubscriptionTier(tier, userId);
    if (!tierCheck.allowed) return tierCheck;
  }

  // Check module access if specified
  if (module) {
    const moduleCheck = await requireModule(module, userId);
    if (!moduleCheck.allowed) return moduleCheck;
  }

  // Check credits if specified
  if (credits) {
    const creditCheck = await requireCredits(credits.type, credits.amount, userId);
    if (!creditCheck.allowed) return creditCheck;
  }

  return { allowed: true };
}

/**
 * Middleware helper for API routes
 */
export async function withAccessControl(
  req: NextRequest,
  feature: string,
  options: Parameters<typeof requireAccess>[1] = {}
): Promise<{ allowed: boolean; response?: Response }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        allowed: false,
        response: new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      };
    }

    const accessCheck = await requireAccess(feature, {
      ...options,
      userId: session.user.id
    });

    if (!accessCheck.allowed) {
      return {
        allowed: false,
        response: new Response(
          JSON.stringify({ 
            error: accessCheck.reason,
            upgradeRequired: accessCheck.upgradeRequired 
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      };
    }

    return { allowed: true };
  } catch (error) {
    logger.error('api', 'Access control error:', error );
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({ error: 'Access control check failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }
}

/**
 * Deduct credits after successful action
 */
export async function consumeCredits(
  action: keyof UserSubscription['credits'],
  amount: number,
  userId?: string
): Promise<boolean> {
  try {
    if (!userId) {
      const session = await auth();
      if (!session?.user?.id) return false;
      userId = session.user.id;
    }

    // This would integrate with your database to deduct credits
    // For now, we'll just log the action
    logger.info('api', `Consuming ${amount} ${action} credits for user ${userId}`);
    
    // TODO: Implement actual credit deduction in database
    return true;
  } catch (error) {
    logger.error('api', 'Failed to consume credits:', error );
    return false;
  }
}

/**
 * Check hybrid feature access (free vs premium)
 */
export async function checkHybridFeature(
  featureId: keyof typeof HYBRID_FEATURES,
  userId?: string
): Promise<{ level: 'free' | 'premium'; allowed: boolean }> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return { level: 'free', allowed: true };
  }

  const feature = HYBRID_FEATURES[featureId];
  if (!feature) {
    return { level: 'free', allowed: false };
  }

  // Check if user has premium access to this feature
  const hasPremiumModule = subscription.modules.includes(`${featureId}-premium`);
  const tierIncludesPremium = SUBSCRIPTION_TIERS[subscription.tier]?.modules?.includes(`${featureId}-premium`);

  if (hasPremiumModule || tierIncludesPremium) {
    return { level: 'premium', allowed: true };
  }

  return { level: 'free', allowed: true };
}

// Route protection configuration
export const PROTECTED_ROUTES = {
  // API Routes
  '/api/ai-designer': { module: 'advanced-designer-suite', credits: { type: 'aiDesigner' as const, amount: 10 } },
  '/api/analytics/advanced': { module: 'analytics-pro' },
  '/api/bms': { module: 'smart-facility-suite' },
  '/api/scada': { module: 'smart-facility-suite' },
  '/api/research': { module: 'research-analytics-suite' },
  '/api/cfd': { module: 'cfd-analysis' },
  '/api/robotics': { module: 'robotic-coordination' },
  '/api/multi-site': { tier: 'enterprise' },
  
  // Page Routes
  '/design/advanced': { tier: ['professional', 'enterprise'] },
  '/analytics/advanced': { tier: ['professional', 'enterprise'] },
  '/research': { module: 'research-analytics-suite' },
  '/bms': { module: 'smart-facility-suite' },
  '/robotics': { module: 'robotic-coordination' },
  '/multi-site': { tier: 'enterprise' },
  '/food-safety': { module: 'food-safety-operations-suite' },
  '/business-intelligence': { module: 'business-intelligence-suite' },
} as const;