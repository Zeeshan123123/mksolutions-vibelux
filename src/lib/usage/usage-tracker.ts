/**
 * Usage Tracking System
 * Tracks user activity for billing and analytics
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export interface UsageMetrics {
  apiCalls: number;
  aiQueries: number;
  exports: number;
  roomsCreated: number;
  fixturesAdded: number;
  designsCreated: number;
  mlPredictions: number;
  facilityDashboards: number;
}

export interface UsageTrackingEvent {
  userId: string;
  eventType: keyof UsageMetrics;
  eventData?: Record<string, any>;
  facilityId?: string;
  timestamp?: Date;
}

/**
 * Track a usage event for billing purposes
 */
export async function trackUsage(event: UsageTrackingEvent): Promise<void> {
  try {
    // Create usage record
    await prisma.usageRecord.create({
      data: {
        userId: event.userId,
        eventType: event.eventType,
        eventData: event.eventData || {},
        facilityId: event.facilityId,
        timestamp: event.timestamp || new Date(),
        billingMonth: getBillingMonth(event.timestamp || new Date())
      }
    });

    logger.info('api', 'Usage event tracked', {
      userId: event.userId,
      eventType: event.eventType,
      facilityId: event.facilityId
    });

  } catch (error) {
    logger.error('api', 'Failed to track usage event', {
      error,
      userId: event.userId,
      eventType: event.eventType
    });
    
    // Don't throw error - usage tracking should not break app functionality
  }
}

/**
 * Get usage metrics for a user within a date range
 */
export async function getUserUsage(
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<UsageMetrics> {
  try {
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        eventType: true
      }
    });

    // Count events by type
    const usage: UsageMetrics = {
      apiCalls: 0,
      aiQueries: 0,
      exports: 0,
      roomsCreated: 0,
      fixturesAdded: 0,
      designsCreated: 0,
      mlPredictions: 0,
      facilityDashboards: 0
    };

    for (const record of usageRecords) {
      if (record.eventType in usage) {
        usage[record.eventType as keyof UsageMetrics]++;
      }
    }

    return usage;

  } catch (error) {
    logger.error('api', 'Failed to get user usage', {
      error,
      userId,
      startDate,
      endDate
    });

    // Return zero usage on error
    return {
      apiCalls: 0,
      aiQueries: 0,
      exports: 0,
      roomsCreated: 0,
      fixturesAdded: 0,
      designsCreated: 0,
      mlPredictions: 0,
      facilityDashboards: 0
    };
  }
}

/**
 * Get usage for current billing period
 */
export async function getCurrentPeriodUsage(userId: string): Promise<UsageMetrics> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getUserUsage(userId, startOfMonth, endOfMonth);
}

/**
 * Check if user has exceeded usage limits for their plan
 */
export async function checkUsageLimits(userId: string, eventType: keyof UsageMetrics): Promise<{
  allowed: boolean;
  limit: number;
  current: number;
  planTier: string;
}> {
  try {
    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });

    const planTier = user?.subscriptionTier?.toLowerCase() || 'free';
    const limits = getUsageLimits(planTier);
    
    if (!limits[eventType]) {
      // No limit for this event type
      return {
        allowed: true,
        limit: -1, // Unlimited
        current: 0,
        planTier
      };
    }

    // Get current usage
    const usage = await getCurrentPeriodUsage(userId);
    const current = usage[eventType];
    const limit = limits[eventType];

    return {
      allowed: current < limit,
      limit,
      current,
      planTier
    };

  } catch (error) {
    logger.error('api', 'Failed to check usage limits', {
      error,
      userId,
      eventType
    });

    // Allow usage on error to not break functionality
    return {
      allowed: true,
      limit: -1,
      current: 0,
      planTier: 'unknown'
    };
  }
}

/**
 * Get usage limits for different subscription tiers
 */
function getUsageLimits(planTier: string): Partial<UsageMetrics> {
  const limits: Record<string, Partial<UsageMetrics>> = {
    free: {
      apiCalls: 1000,
      aiQueries: 50,
      exports: 10,
      roomsCreated: 5,
      fixturesAdded: 100,
      designsCreated: 3,
      mlPredictions: 100,
      facilityDashboards: 2
    },
    starter: {
      apiCalls: 10000,
      aiQueries: 500,
      exports: 100,
      roomsCreated: 25,
      fixturesAdded: 1000,
      designsCreated: 20,
      mlPredictions: 1000,
      facilityDashboards: 10
    },
    professional: {
      apiCalls: 50000,
      aiQueries: 2000,
      exports: 500,
      roomsCreated: 100,
      fixturesAdded: 5000,
      designsCreated: 100,
      mlPredictions: 5000,
      facilityDashboards: 50
    },
    enterprise: {
      // Unlimited for enterprise
    }
  };

  return limits[planTier] || limits.free;
}

/**
 * Get billing month identifier (YYYY-MM format)
 */
function getBillingMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Helper function to track common events
 */
export const trackingHelpers = {
  trackAPICall: (userId: string, endpoint: string, facilityId?: string) =>
    trackUsage({ userId, eventType: 'apiCalls', eventData: { endpoint }, facilityId }),

  trackAIQuery: (userId: string, queryType: string, facilityId?: string) =>
    trackUsage({ userId, eventType: 'aiQueries', eventData: { queryType }, facilityId }),

  trackExport: (userId: string, exportType: string, facilityId?: string) =>
    trackUsage({ userId, eventType: 'exports', eventData: { exportType }, facilityId }),

  trackRoomCreated: (userId: string, roomId: string, facilityId?: string) =>
    trackUsage({ userId, eventType: 'roomsCreated', eventData: { roomId }, facilityId }),

  trackFixtureAdded: (userId: string, fixtureType: string, facilityId?: string) =>
    trackUsage({ userId, eventType: 'fixturesAdded', eventData: { fixtureType }, facilityId }),

  trackDesignCreated: (userId: string, designId: string, facilityId?: string) =>
    trackUsage({ userId, eventType: 'designsCreated', eventData: { designId }, facilityId }),

  trackMLPrediction: (userId: string, predictionType: string, facilityId?: string) =>
    trackUsage({ userId, eventType: 'mlPredictions', eventData: { predictionType }, facilityId }),

  trackFacilityDashboard: (userId: string, facilityId: string) =>
    trackUsage({ userId, eventType: 'facilityDashboards', facilityId })
};