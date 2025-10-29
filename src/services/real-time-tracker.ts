/**
 * Real-Time Usage Tracker Service
 * High-performance usage tracking with in-memory cache and background sync
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import { LRUCache } from 'lru-cache';

// Usage metrics type definition
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

export type UsageEventType = keyof UsageMetrics;

export interface TrackEventParams {
  userId: string;
  eventType: UsageEventType;
  metadata?: Record<string, any>;
  facilityId?: string;
}

export interface OverageCheckResult {
  allowed: boolean;
  gracePeriod: boolean;
  currentUsage: number;
  limit: number;
  percentage: number;
  planTier: string;
  threshold?: 'warning_80' | 'warning_90' | 'exceeded_100';
}

interface CachedUserUsage {
  userId: string;
  billingPeriod: string;
  metrics: UsageMetrics;
  planTier: string;
  lastUpdated: number;
  dirty: boolean;
}

// LRU Cache for active users (max 10,000 users in memory)
const usageCache = new LRUCache<string, CachedUserUsage>({
  max: 10000,
  ttl: 1000 * 60 * 30, // 30 minutes TTL
  updateAgeOnGet: true,
  allowStale: false,
});

// Background sync interval (5 minutes)
const SYNC_INTERVAL = 5 * 60 * 1000;
let syncInterval: NodeJS.Timeout | null = null;

// Usage limits per plan tier
const USAGE_LIMITS: Record<string, Partial<UsageMetrics>> = {
  free: {
    apiCalls: 1000,
    aiQueries: 50,
    exports: 10,
    roomsCreated: 5,
    fixturesAdded: 100,
    designsCreated: 3,
    mlPredictions: 100,
    facilityDashboards: 2,
  },
  starter: {
    apiCalls: 10000,
    aiQueries: 500,
    exports: 100,
    roomsCreated: 25,
    fixturesAdded: 1000,
    designsCreated: 20,
    mlPredictions: 1000,
    facilityDashboards: 10,
  },
  professional: {
    apiCalls: 50000,
    aiQueries: 2000,
    exports: 500,
    roomsCreated: 100,
    fixturesAdded: 5000,
    designsCreated: 100,
    mlPredictions: 5000,
    facilityDashboards: 50,
  },
  enterprise: {
    // Unlimited for enterprise
  },
};

/**
 * Get current billing period in YYYY-MM format
 */
function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get period start and end dates
 */
function getPeriodDates(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get cache key for user
 */
function getCacheKey(userId: string, billingPeriod: string): string {
  return `${userId}:${billingPeriod}`;
}

/**
 * Initialize cache for a user by loading from database
 */
export async function initializeCache(userId: string): Promise<CachedUserUsage> {
  const billingPeriod = getCurrentBillingPeriod();
  const cacheKey = getCacheKey(userId, billingPeriod);

  try {
    // Get user's plan tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    const planTier = (user?.subscriptionTier?.toLowerCase() || 'free').toLowerCase();

    // Try to get existing metrics from database
    let metrics = await prisma.userUsageMetrics.findUnique({
      where: {
        userId_billingPeriod: {
          userId,
          billingPeriod,
        },
      },
    });

    // If no metrics exist, create initial record
    if (!metrics) {
      const { start, end } = getPeriodDates();
      metrics = await prisma.userUsageMetrics.create({
        data: {
          userId,
          billingPeriod,
          periodStart: start,
          periodEnd: end,
          planTier,
          apiCalls: 0,
          aiQueries: 0,
          exports: 0,
          roomsCreated: 0,
          fixturesAdded: 0,
          designsCreated: 0,
          mlPredictions: 0,
          facilityDashboards: 0,
          overageStatus: 'ok',
        },
      });
    }

    const cached: CachedUserUsage = {
      userId,
      billingPeriod,
      metrics: {
        apiCalls: metrics.apiCalls,
        aiQueries: metrics.aiQueries,
        exports: metrics.exports,
        roomsCreated: metrics.roomsCreated,
        fixturesAdded: metrics.fixturesAdded,
        designsCreated: metrics.designsCreated,
        mlPredictions: metrics.mlPredictions,
        facilityDashboards: metrics.facilityDashboards,
      },
      planTier,
      lastUpdated: Date.now(),
      dirty: false,
    };

    usageCache.set(cacheKey, cached);
    return cached;
  } catch (error) {
    logger.error('api', 'Failed to initialize usage cache', { error, userId });
    throw error;
  }
}

/**
 * Get current usage for a user from cache or database
 */
export async function getCurrentUsage(userId: string): Promise<UsageMetrics & { planTier: string }> {
  const billingPeriod = getCurrentBillingPeriod();
  const cacheKey = getCacheKey(userId, billingPeriod);

  let cached = usageCache.get(cacheKey);

  if (!cached) {
    cached = await initializeCache(userId);
  }

  return {
    ...cached.metrics,
    planTier: cached.planTier,
  };
}

/**
 * Check if user has exceeded usage limits
 */
export async function checkOverage(
  userId: string,
  eventType: UsageEventType
): Promise<OverageCheckResult> {
  try {
    const usage = await getCurrentUsage(userId);
    const planTier = usage.planTier;
    const limits = USAGE_LIMITS[planTier] || USAGE_LIMITS.free;

    // Enterprise has no limits
    if (planTier === 'enterprise') {
      return {
        allowed: true,
        gracePeriod: false,
        currentUsage: usage[eventType],
        limit: -1,
        percentage: 0,
        planTier,
      };
    }

    const limit = limits[eventType];

    // If no limit is set for this event type, allow it
    if (!limit) {
      return {
        allowed: true,
        gracePeriod: false,
        currentUsage: usage[eventType],
        limit: -1,
        percentage: 0,
        planTier,
      };
    }

    const currentUsage = usage[eventType];
    const percentage = (currentUsage / limit) * 100;

    // Check thresholds
    if (currentUsage >= limit) {
      // 100% threshold - exceeded but allow with grace period (soft limit)
      return {
        allowed: true, // Soft limit - we still allow it
        gracePeriod: true,
        currentUsage,
        limit,
        percentage,
        planTier,
        threshold: 'exceeded_100',
      };
    } else if (currentUsage >= limit * 0.9) {
      // 90% threshold
      return {
        allowed: true,
        gracePeriod: false,
        currentUsage,
        limit,
        percentage,
        planTier,
        threshold: 'warning_90',
      };
    } else if (currentUsage >= limit * 0.8) {
      // 80% threshold
      return {
        allowed: true,
        gracePeriod: false,
        currentUsage,
        limit,
        percentage,
        planTier,
        threshold: 'warning_80',
      };
    }

    // Under all thresholds
    return {
      allowed: true,
      gracePeriod: false,
      currentUsage,
      limit,
      percentage,
      planTier,
    };
  } catch (error) {
    logger.error('api', 'Failed to check overage', { error, userId, eventType });
    // On error, allow the operation to not break functionality
    return {
      allowed: true,
      gracePeriod: false,
      currentUsage: 0,
      limit: -1,
      percentage: 0,
      planTier: 'unknown',
    };
  }
}

/**
 * Track a usage event
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  const { userId, eventType, metadata, facilityId } = params;
  const billingPeriod = getCurrentBillingPeriod();
  const cacheKey = getCacheKey(userId, billingPeriod);

  try {
    // Get or initialize cache
    let cached = usageCache.get(cacheKey);
    if (!cached) {
      cached = await initializeCache(userId);
    }

    // Increment the metric in cache
    cached.metrics[eventType]++;
    cached.lastUpdated = Date.now();
    cached.dirty = true;

    // Update cache
    usageCache.set(cacheKey, cached);

    // Also create a detailed usage record asynchronously (don't await to not slow down)
    prisma.usageRecord
      .create({
        data: {
          userId,
          eventType,
          eventData: metadata || {},
          facilityId,
          billingMonth: billingPeriod,
          timestamp: new Date(),
        },
      })
      .catch((error) => {
        logger.error('api', 'Failed to create usage record', {
          error,
          userId,
          eventType,
        });
      });

    logger.info('api', 'Usage event tracked', {
      userId,
      eventType,
      currentUsage: cached.metrics[eventType],
    });
  } catch (error) {
    logger.error('api', 'Failed to track event', { error, userId, eventType });
    // Don't throw - tracking should not break app functionality
  }
}

/**
 * Sync cache to database for a specific user
 */
async function syncUserToDatabase(cached: CachedUserUsage): Promise<void> {
  const { userId, billingPeriod, metrics, planTier } = cached;

  try {
    const { start, end } = getPeriodDates();

    // Determine overage status
    let overageStatus = 'ok';
    const limits = USAGE_LIMITS[planTier] || USAGE_LIMITS.free;

    for (const [key, value] of Object.entries(metrics)) {
      const limit = limits[key as UsageEventType];
      if (limit && value >= limit) {
        overageStatus = 'exceeded_100';
        break;
      } else if (limit && value >= limit * 0.9) {
        overageStatus = 'warning_90';
      } else if (limit && value >= limit * 0.8 && overageStatus === 'ok') {
        overageStatus = 'warning_80';
      }
    }

    await prisma.userUsageMetrics.upsert({
      where: {
        userId_billingPeriod: {
          userId,
          billingPeriod,
        },
      },
      update: {
        ...metrics,
        planTier,
        overageStatus,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        billingPeriod,
        periodStart: start,
        periodEnd: end,
        ...metrics,
        planTier,
        overageStatus,
      },
    });

    // Mark as clean
    cached.dirty = false;

    logger.info('api', 'Synced user usage to database', { userId, billingPeriod });
  } catch (error) {
    logger.error('api', 'Failed to sync user usage to database', {
      error,
      userId,
      billingPeriod,
    });
  }
}

/**
 * Sync all dirty cache entries to database
 */
export async function syncToDatabase(): Promise<void> {
  const dirtyUsers: CachedUserUsage[] = [];

  // Collect all dirty cache entries
  for (const [, cached] of usageCache.entries()) {
    if (cached.dirty) {
      dirtyUsers.push(cached);
    }
  }

  if (dirtyUsers.length === 0) {
    logger.info('api', 'No dirty usage cache entries to sync');
    return;
  }

  logger.info('api', 'Syncing usage cache to database', { count: dirtyUsers.length });

  // Sync in batches of 50
  const batchSize = 50;
  for (let i = 0; i < dirtyUsers.length; i += batchSize) {
    const batch = dirtyUsers.slice(i, i + batchSize);
    await Promise.all(batch.map((cached) => syncUserToDatabase(cached)));
  }

  logger.info('api', 'Usage cache sync completed', { synced: dirtyUsers.length });
}

/**
 * Clear cache for a user (useful on logout or plan change)
 */
export function clearCache(userId: string): void {
  const billingPeriod = getCurrentBillingPeriod();
  const cacheKey = getCacheKey(userId, billingPeriod);
  usageCache.delete(cacheKey);
  logger.info('api', 'Cleared usage cache for user', { userId });
}

/**
 * Start background sync worker
 */
export function startBackgroundSync(): void {
  if (syncInterval) {
    logger.warn('api', 'Background sync already running');
    return;
  }

  logger.info('api', 'Starting background usage sync', {
    interval: SYNC_INTERVAL / 1000 + 's',
  });

  syncInterval = setInterval(() => {
    syncToDatabase().catch((error) => {
      logger.error('api', 'Background sync failed', { error });
    });
  }, SYNC_INTERVAL);
}

/**
 * Stop background sync worker
 */
export function stopBackgroundSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    logger.info('api', 'Stopped background usage sync');
  }
}

/**
 * Force sync all cache to database (useful before shutdown)
 */
export async function forceSync(): Promise<void> {
  logger.info('api', 'Force syncing all usage cache to database');
  await syncToDatabase();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: usageCache.size,
    max: usageCache.max,
    dirtyCount: Array.from(usageCache.values()).filter((c) => c.dirty).length,
  };
}

// Auto-start background sync
if (process.env.NODE_ENV !== 'test') {
  startBackgroundSync();
}

