import { prisma } from '@/lib/prisma';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  maxBurst?: number;
}

interface RateLimitCheck {
  allowed: boolean;
  retryAfter?: number;
  usage?: {
    used: number;
    remaining: number;
    resetIn: number;
  };
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  burstUsed: number;
  lastRequest: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly config: Required<RateLimitConfig>;
  
  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      maxBurst: config.maxBurst || Math.floor(config.maxRequests * 0.2), // 20% burst by default
    };
    
    // Clean up old entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  async checkLimit(userId: string): Promise<RateLimitCheck> {
    const now = Date.now();
    const userLimit = this.limits.get(userId);

    // Clean up expired entry
    if (userLimit && now > userLimit.resetTime) {
      this.limits.delete(userId);
    }

    // Get or create rate limit entry
    const limit = this.limits.get(userId) || {
      count: 0,
      resetTime: now + this.config.windowMs,
      burstUsed: 0,
      lastRequest: now,
    };

    // Check burst protection (prevent rapid-fire requests)
    const timeSinceLastRequest = now - limit.lastRequest;
    if (timeSinceLastRequest < 1000 && limit.burstUsed >= this.config.maxBurst) {
      return {
        allowed: false,
        retryAfter: 1, // Wait at least 1 second between burst requests
        usage: this.getUsageInfo(limit),
      };
    }

    // Check overall rate limit
    if (limit.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        usage: this.getUsageInfo(limit),
      };
    }

    // Update counters
    limit.count++;
    if (timeSinceLastRequest < 1000) {
      limit.burstUsed++;
    } else {
      limit.burstUsed = 1; // Reset burst counter after 1 second gap
    }
    limit.lastRequest = now;
    
    this.limits.set(userId, limit);

    // Log high usage
    if (limit.count > this.config.maxRequests * 0.8) {
      this.logHighUsage(userId, limit);
    }

    return {
      allowed: true,
      usage: this.getUsageInfo(limit),
    };
  }

  async checkLimitWithPlan(userId: string, plan: string): Promise<RateLimitCheck> {
    // Get plan-specific limits
    const planLimits = this.getPlanLimits(plan);
    
    // Create a temporary rate limiter with plan-specific config
    const planLimiter = new RateLimiter({
      maxRequests: planLimits.perMinute,
      windowMs: 60000,
      maxBurst: planLimits.burst,
    });
    
    return planLimiter.checkLimit(userId);
  }

  private getUsageInfo(limit: RateLimitEntry): RateLimitCheck['usage'] {
    const now = Date.now();
    return {
      used: limit.count,
      remaining: Math.max(0, this.config.maxRequests - limit.count),
      resetIn: Math.ceil(Math.max(0, limit.resetTime - now) / 1000),
    };
  }

  private getPlanLimits(plan: string): { perMinute: number; perHour: number; burst: number } {
    const limits: Record<string, { perMinute: number; perHour: number; burst: number }> = {
      free: { perMinute: 5, perHour: 50, burst: 2 },
      starter: { perMinute: 20, perHour: 500, burst: 5 },
      professional: { perMinute: 50, perHour: 2000, burst: 10 },
      business: { perMinute: 100, perHour: 5000, burst: 20 },
      enterprise: { perMinute: 500, perHour: 20000, burst: 50 },
    };
    
    return limits[plan] || limits.free;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [userId, limit] of this.limits.entries()) {
      if (now > limit.resetTime + 300000) { // 5 minutes after expiry
        this.limits.delete(userId);
      }
    }
  }

  private async logHighUsage(userId: string, limit: RateLimitEntry): Promise<void> {
    try {
      await prisma.aiUsageAlert.create({
        data: {
          userId,
          alertType: 'high_usage',
          details: {
            count: limit.count,
            maxRequests: this.config.maxRequests,
            percentage: Math.round((limit.count / this.config.maxRequests) * 100),
          },
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('api', 'Failed to log high usage alert:', error );
    }
  }

  reset(userId: string): void {
    this.limits.delete(userId);
  }

  resetAll(): void {
    this.limits.clear();
  }
}

// Global rate limiter instances
export const globalRateLimiter = new RateLimiter({
  maxRequests: 1000, // Global limit across all users
  windowMs: 60000,
  maxBurst: 100,
});

export const perUserRateLimiter = new RateLimiter({
  maxRequests: 100, // Per user limit
  windowMs: 60000,
  maxBurst: 10,
});

// Distributed rate limiting using Redis (for production)
export class RedisRateLimiter {
  private redis: any; // Redis client instance
  
  constructor(redisClient: any) {
    this.redis = redisClient;
  }

  async checkLimit(key: string, limit: number, windowMs: number): Promise<RateLimitCheck> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Use Redis sorted sets for sliding window rate limiting
    const pipe = this.redis.pipeline();
    
    // Remove old entries
    pipe.zremrangebyscore(key, '-inf', windowStart);
    
    // Count current entries
    pipe.zcard(key);
    
    // Add current request
    pipe.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry
    pipe.expire(key, Math.ceil(windowMs / 1000) + 1);
    
    const results = await pipe.exec();
    const count = results[1][1];
    
    if (count >= limit) {
      // Get oldest entry to calculate retry after
      const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const oldestTime = oldest.length > 1 ? parseInt(oldest[1]) : now;
      const retryAfter = Math.ceil((oldestTime + windowMs - now) / 1000);
      
      return {
        allowed: false,
        retryAfter,
        usage: {
          used: count,
          remaining: 0,
          resetIn: retryAfter,
        },
      };
    }
    
    return {
      allowed: true,
      usage: {
        used: count + 1,
        remaining: Math.max(0, limit - count - 1),
        resetIn: Math.ceil(windowMs / 1000),
      },
    };
  }
}