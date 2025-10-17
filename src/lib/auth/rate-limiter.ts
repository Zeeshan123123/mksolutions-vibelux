/**
 * Rate Limiting Service
 * Implements token bucket algorithm for API rate limiting
 */

import { logger } from '@/lib/logging/production-logger';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  requests: Array<{ timestamp: number; endpoint: string }>;
}

interface RateLimitConfig {
  maxTokens: number;      // Maximum tokens in bucket
  refillRate: number;     // Tokens per minute
  windowMs: number;       // Time window in milliseconds
}

// In-memory storage (replace with Redis in production)
const rateLimitBuckets = new Map<string, RateLimitBucket>();

// API usage tracking
const apiUsageStats = new Map<string, {
  daily: Map<string, number>;
  monthly: Map<string, number>;
  total: number;
}>();

// Rate limit configurations by tier
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  FREE: {
    maxTokens: 100,
    refillRate: 100,  // 100 requests per minute
    windowMs: 60000   // 1 minute
  },
  PROFESSIONAL: {
    maxTokens: 1000,
    refillRate: 1000, // 1000 requests per minute
    windowMs: 60000
  },
  ENTERPRISE: {
    maxTokens: 10000,
    refillRate: 10000, // 10000 requests per minute
    windowMs: 60000
  },
  UNLIMITED: {
    maxTokens: Infinity,
    refillRate: Infinity,
    windowMs: 60000
  }
};

/**
 * Check rate limit for a user
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  userTier: string = 'FREE'
): Promise<{ 
  allowed: boolean; 
  remaining: number;
  resetTime: number;
  limit: number;
}> {
  const config = RATE_LIMIT_CONFIGS[userTier] || RATE_LIMIT_CONFIGS.FREE;
  const bucketKey = `${userId}:${endpoint}`;
  
  let bucket = rateLimitBuckets.get(bucketKey);
  const now = Date.now();
  
  // Initialize bucket if it doesn't exist
  if (!bucket) {
    bucket = {
      tokens: config.maxTokens,
      lastRefill: now,
      requests: []
    };
    rateLimitBuckets.set(bucketKey, bucket);
  }
  
  // Refill tokens based on time elapsed
  const timeSinceLastRefill = now - bucket.lastRefill;
  const tokensToAdd = Math.floor((timeSinceLastRefill / 60000) * config.refillRate);
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
  
  // Clean up old requests outside the window
  bucket.requests = bucket.requests.filter(req => 
    now - req.timestamp < config.windowMs
  );
  
  // Check if request is allowed
  const allowed = bucket.tokens > 0;
  
  if (allowed) {
    bucket.tokens--;
    bucket.requests.push({ timestamp: now, endpoint });
  }
  
  // Calculate reset time
  const resetTime = bucket.lastRefill + 60000; // Next minute
  
  return {
    allowed,
    remaining: Math.max(0, bucket.tokens),
    resetTime,
    limit: config.maxTokens
  };
}

/**
 * Track API usage for analytics and billing
 */
export async function trackAPIUsage(
  userId: string,
  endpoint: string,
  metadata: {
    method?: string;
    statusCode?: number;
    responseTime?: number;
    dataSize?: number;
  } = {}
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    // Get or create user stats
    let userStats = apiUsageStats.get(userId);
    if (!userStats) {
      userStats = {
        daily: new Map(),
        monthly: new Map(),
        total: 0
      };
      apiUsageStats.set(userId, userStats);
    }
    
    // Update daily usage
    const dailyKey = `${today}:${endpoint}`;
    userStats.daily.set(dailyKey, (userStats.daily.get(dailyKey) || 0) + 1);
    
    // Update monthly usage
    const monthlyKey = `${month}:${endpoint}`;
    userStats.monthly.set(monthlyKey, (userStats.monthly.get(monthlyKey) || 0) + 1);
    
    // Update total
    userStats.total++;
    
    // Log usage for monitoring
    logger.info('api', 'API Usage tracked', {
      data: {
        userId,
        endpoint,
        ...metadata,
        dailyUsage: userStats.daily.get(dailyKey),
        monthlyUsage: userStats.monthly.get(monthlyKey),
        totalUsage: userStats.total
      }
    });
    
    // Clean up old data (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    for (const [key] of userStats.daily) {
      const keyDate = key.split(':')[0];
      if (keyDate < cutoffDate) {
        userStats.daily.delete(key);
      }
    }
  } catch (error) {
    logger.error('api', 'Failed to track API usage:', error);
    // Don't throw - usage tracking failure shouldn't break API calls
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUsageStats(
  userId: string,
  period: 'daily' | 'monthly' | 'all' = 'all'
): Promise<{
  daily?: Record<string, number>;
  monthly?: Record<string, number>;
  total: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
}> {
  const userStats = apiUsageStats.get(userId);
  
  if (!userStats) {
    return {
      total: 0,
      topEndpoints: []
    };
  }
  
  const result: any = {
    total: userStats.total,
    topEndpoints: []
  };
  
  // Convert Maps to objects for response
  if (period === 'daily' || period === 'all') {
    result.daily = Object.fromEntries(userStats.daily);
  }
  
  if (period === 'monthly' || period === 'all') {
    result.monthly = Object.fromEntries(userStats.monthly);
  }
  
  // Calculate top endpoints
  const endpointCounts = new Map<string, number>();
  for (const [key, count] of userStats.monthly) {
    const endpoint = key.split(':')[1];
    endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + count);
  }
  
  result.topEndpoints = Array.from(endpointCounts.entries())
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return result;
}

/**
 * Reset rate limit for a user (admin use)
 */
export async function resetRateLimit(userId: string): Promise<void> {
  // Remove all buckets for the user
  for (const [key] of rateLimitBuckets) {
    if (key.startsWith(userId)) {
      rateLimitBuckets.delete(key);
    }
  }
  
  logger.info('api', `Rate limit reset for user ${userId}`);
}

/**
 * Clean up expired rate limit buckets (run periodically)
 */
export function cleanupExpiredBuckets(): void {
  const now = Date.now();
  const expirationTime = 3600000; // 1 hour
  
  for (const [key, bucket] of rateLimitBuckets) {
    if (now - bucket.lastRefill > expirationTime) {
      rateLimitBuckets.delete(key);
    }
  }
}

// Run cleanup every hour
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredBuckets, 3600000);
}