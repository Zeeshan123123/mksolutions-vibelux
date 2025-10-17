import { Redis } from 'ioredis'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
})

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  USER_PROFILE: 300,        // 5 minutes
  FACILITY_DATA: 600,       // 10 minutes
  PROJECT_DATA: 300,        // 5 minutes
  LIGHTING_DESIGNS: 1800,   // 30 minutes
  ENERGY_SAVINGS: 3600,     // 1 hour
  REVENUE_SHARE: 3600,      // 1 hour
  TEAM_MEMBERS: 180,        // 3 minutes
  AI_RESULTS: 7200,         // 2 hours
  DASHBOARD_STATS: 300,     // 5 minutes
  NOTIFICATIONS: 60,        // 1 minute
  SEARCH_RESULTS: 900,      // 15 minutes
  ANALYTICS: 1800,          // 30 minutes
  SYSTEM_CONFIG: 3600,      // 1 hour
  SUBSCRIPTION_DATA: 600,   // 10 minutes
  FEATURE_FLAGS: 300        // 5 minutes
}

// Cache key prefixes
const CACHE_PREFIXES = {
  USER: 'user:',
  FACILITY: 'facility:',
  PROJECT: 'project:',
  LIGHTING: 'lighting:',
  ENERGY: 'energy:',
  REVENUE: 'revenue:',
  TEAM: 'team:',
  AI: 'ai:',
  DASHBOARD: 'dashboard:',
  NOTIFICATION: 'notification:',
  SEARCH: 'search:',
  ANALYTICS: 'analytics:',
  SYSTEM: 'system:',
  SUBSCRIPTION: 'subscription:',
  FEATURE: 'feature:'
}

interface CacheOptions {
  ttl?: number
  prefix?: string
  tags?: string[]
}

export class CacheManager {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  // Generate cache key with prefix
  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}${key}` : key
  }

  // Set cache value
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = CACHE_TTL.USER_PROFILE, prefix = '', tags = [] } = options
    const cacheKey = this.generateKey(key, prefix)
    
    try {
      // Serialize the value
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        tags
      })

      // Set with TTL
      await this.redis.setex(cacheKey, ttl, serializedValue)

      // Add to tag sets for cache invalidation
      for (const tag of tags) {
        await this.redis.sadd(`tag:${tag}`, cacheKey)
        await this.redis.expire(`tag:${tag}`, ttl)
      }
    } catch (error) {
      logger.error('api', 'Cache set error:', error )
    }
  }

  // Get cache value
  async get<T = any>(key: string, prefix?: string): Promise<T | null> {
    const cacheKey = this.generateKey(key, prefix)
    
    try {
      const cachedValue = await this.redis.get(cacheKey)
      if (!cachedValue) return null

      const parsed = JSON.parse(cachedValue)
      return parsed.data as T
    } catch (error) {
      logger.error('api', 'Cache get error:', error )
      return null
    }
  }

  // Delete cache value
  async delete(key: string, prefix?: string): Promise<void> {
    const cacheKey = this.generateKey(key, prefix)
    
    try {
      await this.redis.del(cacheKey)
    } catch (error) {
      logger.error('api', 'Cache delete error:', error )
    }
  }

  // Check if key exists
  async exists(key: string, prefix?: string): Promise<boolean> {
    const cacheKey = this.generateKey(key, prefix)
    
    try {
      const exists = await this.redis.exists(cacheKey)
      return exists === 1
    } catch (error) {
      logger.error('api', 'Cache exists error:', error )
      return false
    }
  }

  // Increment counter
  async increment(key: string, prefix?: string, ttl?: number): Promise<number> {
    const cacheKey = this.generateKey(key, prefix)
    
    try {
      const result = await this.redis.incr(cacheKey)
      if (ttl && result === 1) {
        await this.redis.expire(cacheKey, ttl)
      }
      return result
    } catch (error) {
      logger.error('api', 'Cache increment error:', error )
      return 0
    }
  }

  // Invalidate cache by tags
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`)
        if (keys.length > 0) {
          await this.redis.del(...keys)
          await this.redis.del(`tag:${tag}`)
        }
      }
    } catch (error) {
      logger.error('api', 'Cache invalidate by tags error:', error )
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb()
    } catch (error) {
      logger.error('api', 'Cache clear error:', error )
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    memory: string
    keys: number
    hits: number
    misses: number
    hitRate: number
  }> {
    try {
      const info = await this.redis.info('memory')
      const dbSize = await this.redis.dbsize()
      const stats = await this.redis.info('stats')
      
      const memoryMatch = info.match(/used_memory_human:(.+)/)?.[1]?.trim()
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/)?.[1]
      const missesMatch = stats.match(/keyspace_misses:(\d+)/)?.[1]
      
      const hits = parseInt(hitsMatch || '0')
      const misses = parseInt(missesMatch || '0')
      const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0

      return {
        memory: memoryMatch || '0B',
        keys: dbSize,
        hits,
        misses,
        hitRate: Math.round(hitRate * 100) / 100
      }
    } catch (error) {
      logger.error('api', 'Cache stats error:', error )
      return {
        memory: '0B',
        keys: 0,
        hits: 0,
        misses: 0,
        hitRate: 0
      }
    }
  }
}

// Global cache instance
export const cache = new CacheManager()

// Cache decorators for common use cases
export function withCache<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = await cache.get<T>(key, options.prefix)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // If not in cache, fetch and cache
      const result = await fetcher()
      await cache.set(key, result, options)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

// Cache middleware for API routes
export function cacheMiddleware(options: CacheOptions = {}) {
  return async (request: NextRequest, handler: () => Promise<NextResponse>) => {
    const { ttl = CACHE_TTL.USER_PROFILE, prefix = 'api:' } = options
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler()
    }

    const cacheKey = `${prefix}${request.nextUrl.pathname}${request.nextUrl.search}`
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': `public, max-age=${ttl}`
          }
        })
      }

      // If not cached, execute handler
      const response = await handler()
      
      // Cache successful responses
      if (response.status === 200) {
        const responseData = await response.json()
        await cache.set(cacheKey, responseData, { ttl, prefix })
        
        return NextResponse.json(responseData, {
          headers: {
            'X-Cache': 'MISS',
            'Cache-Control': `public, max-age=${ttl}`
          }
        })
      }

      return response
    } catch (error) {
      logger.error('api', 'Cache middleware error:', error )
      return handler()
    }
  }
}

// Utility functions for specific cache patterns
export const userCache = {
  get: (userId: string) => cache.get(userId, CACHE_PREFIXES.USER),
  set: (userId: string, data: any) => cache.set(userId, data, { 
    ttl: CACHE_TTL.USER_PROFILE, 
    prefix: CACHE_PREFIXES.USER,
    tags: ['user', `user:${userId}`]
  }),
  delete: (userId: string) => cache.delete(userId, CACHE_PREFIXES.USER),
  invalidate: (userId: string) => cache.invalidateByTags([`user:${userId}`])
}

export const facilityCache = {
  get: (facilityId: string) => cache.get(facilityId, CACHE_PREFIXES.FACILITY),
  set: (facilityId: string, data: any) => cache.set(facilityId, data, { 
    ttl: CACHE_TTL.FACILITY_DATA, 
    prefix: CACHE_PREFIXES.FACILITY,
    tags: ['facility', `facility:${facilityId}`]
  }),
  delete: (facilityId: string) => cache.delete(facilityId, CACHE_PREFIXES.FACILITY),
  invalidate: (facilityId: string) => cache.invalidateByTags([`facility:${facilityId}`])
}

export const teamCache = {
  get: (teamId: string) => cache.get(teamId, CACHE_PREFIXES.TEAM),
  set: (teamId: string, data: any) => cache.set(teamId, data, { 
    ttl: CACHE_TTL.TEAM_MEMBERS, 
    prefix: CACHE_PREFIXES.TEAM,
    tags: ['team', `team:${teamId}`]
  }),
  delete: (teamId: string) => cache.delete(teamId, CACHE_PREFIXES.TEAM),
  invalidate: (teamId: string) => cache.invalidateByTags([`team:${teamId}`])
}

export const aiCache = {
  get: (key: string) => cache.get(key, CACHE_PREFIXES.AI),
  set: (key: string, data: any) => cache.set(key, data, { 
    ttl: CACHE_TTL.AI_RESULTS, 
    prefix: CACHE_PREFIXES.AI,
    tags: ['ai']
  }),
  delete: (key: string) => cache.delete(key, CACHE_PREFIXES.AI),
  invalidateAll: () => cache.invalidateByTags(['ai'])
}