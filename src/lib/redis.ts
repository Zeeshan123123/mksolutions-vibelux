/**
 * Redis client for real-time features and caching
 */
import Redis from 'ioredis';
import { logger } from '@/lib/logging/production-logger';

// Create Redis client with proper configuration
const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('api', 'Redis connection failed after 10 retries');
        return null; // Stop retrying
      }
      // Exponential backoff with max 3 seconds
      const delay = Math.min(times * 100, 3000);
      logger.info('api', `Redis retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true;
      }
      return false;
    },
    enableOfflineQueue: true,
    lazyConnect: true
  });

  // Handle Redis events
  client.on('error', (err) => {
    logger.error('api', 'Redis Client Error:', err);
  });

  client.on('connect', () => {
    logger.info('api', 'Redis client connected');
  });

  client.on('ready', () => {
    logger.info('api', 'Redis client ready');
  });

  client.on('reconnecting', () => {
    logger.warn('api', 'Redis client reconnecting...');
  });

  client.on('close', () => {
    logger.warn('api', 'Redis connection closed');
  });

  return client;
};

// Create the main Redis client
const redisClient = createRedisClient();

// In-memory fallback for development/testing when Redis is unavailable
const memoryCache = new Map<string, { value: string; expires?: number }>();
const memoryLists = new Map<string, string[]>();
const memoryHashes = new Map<string, Map<string, string>>();

// Track connection status
let isConnected = false;
let connectionAttempted = false;

// Connect to Redis with fallback
const ensureConnection = async (): Promise<boolean> => {
  if (isConnected) return true;
  
  if (!connectionAttempted) {
    connectionAttempted = true;
    try {
      await redisClient.connect();
      isConnected = true;
      logger.info('api', 'Redis connected successfully');
      return true;
    } catch (error) {
      logger.warn('api', 'Redis connection failed, using in-memory fallback:', error);
      return false;
    }
  }
  
  return isConnected;
};

// Wrapper that provides Redis functionality with automatic fallback
export const redis = {
  // String operations
  async get(key: string): Promise<string | null> {
    if (await ensureConnection()) {
      try {
        return await redisClient.get(key);
      } catch (error) {
        logger.error('api', 'Redis get error:', error);
      }
    }
    
    // Fallback to memory cache
    const item = memoryCache.get(key);
    if (!item) return null;
    
    if (item.expires && item.expires < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.value;
  },

  async set(key: string, value: string): Promise<'OK' | null> {
    if (await ensureConnection()) {
      try {
        return await redisClient.set(key, value);
      } catch (error) {
        logger.error('api', 'Redis set error:', error);
      }
    }
    
    // Fallback to memory cache
    memoryCache.set(key, { value });
    return 'OK';
  },

  async setex(key: string, seconds: number, value: string): Promise<'OK' | null> {
    if (await ensureConnection()) {
      try {
        return await redisClient.setex(key, seconds, value);
      } catch (error) {
        logger.error('api', 'Redis setex error:', error);
      }
    }
    
    // Fallback to memory cache
    memoryCache.set(key, { 
      value, 
      expires: Date.now() + (seconds * 1000) 
    });
    return 'OK';
  },

  async del(...keys: string[]): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.del(...keys);
      } catch (error) {
        logger.error('api', 'Redis del error:', error);
      }
    }
    
    // Fallback to memory cache
    let deleted = 0;
    for (const key of keys) {
      if (memoryCache.delete(key)) deleted++;
      if (memoryLists.delete(key)) deleted++;
      if (memoryHashes.delete(key)) deleted++;
    }
    return deleted;
  },

  async keys(pattern: string): Promise<string[]> {
    if (await ensureConnection()) {
      try {
        return await redisClient.keys(pattern);
      } catch (error) {
        logger.error('api', 'Redis keys error:', error);
      }
    }
    
    // Fallback to memory cache
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const allKeys = new Set([
      ...memoryCache.keys(),
      ...memoryLists.keys(),
      ...memoryHashes.keys()
    ]);
    return Array.from(allKeys).filter(key => regex.test(key));
  },

  async exists(...keys: string[]): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.exists(...keys);
      } catch (error) {
        logger.error('api', 'Redis exists error:', error);
      }
    }
    
    // Fallback to memory cache
    let count = 0;
    for (const key of keys) {
      if (memoryCache.has(key) || memoryLists.has(key) || memoryHashes.has(key)) {
        count++;
      }
    }
    return count;
  },

  async expire(key: string, seconds: number): Promise<0 | 1> {
    if (await ensureConnection()) {
      try {
        return await redisClient.expire(key, seconds);
      } catch (error) {
        logger.error('api', 'Redis expire error:', error);
      }
    }
    
    // Fallback to memory cache
    const item = memoryCache.get(key);
    if (!item) return 0;
    
    item.expires = Date.now() + (seconds * 1000);
    return 1;
  },

  async ttl(key: string): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.ttl(key);
      } catch (error) {
        logger.error('api', 'Redis ttl error:', error);
      }
    }
    
    // Fallback to memory cache
    const item = memoryCache.get(key);
    if (!item || !item.expires) return -1;
    
    const ttl = Math.floor((item.expires - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  },

  async flushall(): Promise<'OK'> {
    if (await ensureConnection()) {
      try {
        return await redisClient.flushall();
      } catch (error) {
        logger.error('api', 'Redis flushall error:', error);
      }
    }
    
    // Fallback to memory cache
    memoryCache.clear();
    memoryLists.clear();
    memoryHashes.clear();
    return 'OK';
  },

  async ping(): Promise<'PONG'> {
    if (await ensureConnection()) {
      try {
        return await redisClient.ping();
      } catch (error) {
        logger.error('api', 'Redis ping error:', error);
      }
    }
    
    return 'PONG';
  },

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<0 | 1> {
    if (await ensureConnection()) {
      try {
        return await redisClient.hset(key, field, value);
      } catch (error) {
        logger.error('api', 'Redis hset error:', error);
      }
    }
    
    // Fallback to memory cache
    if (!memoryHashes.has(key)) {
      memoryHashes.set(key, new Map());
    }
    const hash = memoryHashes.get(key)!;
    const isNew = !hash.has(field);
    hash.set(field, value);
    return isNew ? 1 : 0;
  },

  async hget(key: string, field: string): Promise<string | null> {
    if (await ensureConnection()) {
      try {
        return await redisClient.hget(key, field);
      } catch (error) {
        logger.error('api', 'Redis hget error:', error);
      }
    }
    
    // Fallback to memory cache
    const hash = memoryHashes.get(key);
    if (!hash) return null;
    return hash.get(field) || null;
  },

  async hgetall(key: string): Promise<Record<string, string>> {
    if (await ensureConnection()) {
      try {
        return await redisClient.hgetall(key);
      } catch (error) {
        logger.error('api', 'Redis hgetall error:', error);
      }
    }
    
    // Fallback to memory cache
    const hash = memoryHashes.get(key);
    if (!hash) return {};
    return Object.fromEntries(hash);
  },

  async hmset(key: string, data: Record<string, string>): Promise<'OK'> {
    if (await ensureConnection()) {
      try {
        return await redisClient.hmset(key, data);
      } catch (error) {
        logger.error('api', 'Redis hmset error:', error);
      }
    }
    
    // Fallback to memory cache
    if (!memoryHashes.has(key)) {
      memoryHashes.set(key, new Map());
    }
    const hash = memoryHashes.get(key)!;
    Object.entries(data).forEach(([field, value]) => {
      hash.set(field, value);
    });
    return 'OK';
  },

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.lpush(key, ...values);
      } catch (error) {
        logger.error('api', 'Redis lpush error:', error);
      }
    }
    
    // Fallback to memory lists
    if (!memoryLists.has(key)) {
      memoryLists.set(key, []);
    }
    const list = memoryLists.get(key)!;
    list.unshift(...values.reverse());
    return list.length;
  },

  async rpush(key: string, ...values: string[]): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.rpush(key, ...values);
      } catch (error) {
        logger.error('api', 'Redis rpush error:', error);
      }
    }
    
    // Fallback to memory lists
    if (!memoryLists.has(key)) {
      memoryLists.set(key, []);
    }
    const list = memoryLists.get(key)!;
    list.push(...values);
    return list.length;
  },

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (await ensureConnection()) {
      try {
        return await redisClient.lrange(key, start, stop);
      } catch (error) {
        logger.error('api', 'Redis lrange error:', error);
      }
    }
    
    // Fallback to memory lists
    const list = memoryLists.get(key);
    if (!list) return [];
    
    // Handle negative indices
    const len = list.length;
    if (start < 0) start = len + start;
    if (stop < 0) stop = len + stop;
    
    return list.slice(start, stop + 1);
  },

  async llen(key: string): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.llen(key);
      } catch (error) {
        logger.error('api', 'Redis llen error:', error);
      }
    }
    
    // Fallback to memory lists
    const list = memoryLists.get(key);
    return list ? list.length : 0;
  },

  // Pub/Sub operations (no fallback for these)
  async publish(channel: string, message: string): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.publish(channel, message);
      } catch (error) {
        logger.error('api', 'Redis publish error:', error);
      }
    }
    
    logger.warn('api', 'Redis not available for pub/sub');
    return 0;
  },

  createSubscriber(): Redis | null {
    if (!isConnected && !ensureConnection()) {
      logger.warn('api', 'Cannot create Redis subscriber - Redis not available');
      return null;
    }
    
    const subscriber = createRedisClient();
    subscriber.connect().catch((error) => {
      logger.error('api', 'Failed to connect Redis subscriber:', error);
    });
    
    return subscriber;
  },

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.sadd(key, ...members);
      } catch (error) {
        logger.error('api', 'Redis sadd error:', error);
      }
    }
    
    // Simple fallback using hash
    if (!memoryHashes.has(key)) {
      memoryHashes.set(key, new Map());
    }
    const set = memoryHashes.get(key)!;
    let added = 0;
    for (const member of members) {
      if (!set.has(member)) {
        set.set(member, '1');
        added++;
      }
    }
    return added;
  },

  async smembers(key: string): Promise<string[]> {
    if (await ensureConnection()) {
      try {
        return await redisClient.smembers(key);
      } catch (error) {
        logger.error('api', 'Redis smembers error:', error);
      }
    }
    
    // Fallback
    const set = memoryHashes.get(key);
    return set ? Array.from(set.keys()) : [];
  },

  // Sorted set operations
  async zadd(key: string, ...scoreMembers: (string | number)[]): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.zadd(key, ...scoreMembers);
      } catch (error) {
        logger.error('api', 'Redis zadd error:', error);
      }
    }
    
    // No fallback for sorted sets
    logger.warn('api', 'Redis not available for sorted set operations');
    return 0;
  },

  // Increment operations
  async incr(key: string): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.incr(key);
      } catch (error) {
        logger.error('api', 'Redis incr error:', error);
      }
    }
    
    // Fallback
    const current = await this.get(key);
    const value = current ? parseInt(current) + 1 : 1;
    await this.set(key, value.toString());
    return value;
  },

  async incrby(key: string, increment: number): Promise<number> {
    if (await ensureConnection()) {
      try {
        return await redisClient.incrby(key, increment);
      } catch (error) {
        logger.error('api', 'Redis incrby error:', error);
      }
    }
    
    // Fallback
    const current = await this.get(key);
    const value = current ? parseInt(current) + increment : increment;
    await this.set(key, value.toString());
    return value;
  },

  // Cleanup method
  async disconnect(): Promise<void> {
    if (isConnected) {
      try {
        await redisClient.disconnect();
        isConnected = false;
        connectionAttempted = false;
        logger.info('api', 'Redis disconnected');
      } catch (error) {
        logger.error('api', 'Redis disconnect error:', error);
      }
    }
  },

  // Get the raw client for advanced operations
  getClient(): Redis | null {
    return isConnected ? redisClient : null;
  }
};

export default redis;