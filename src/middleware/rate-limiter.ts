/**
 * Rate Limiting Middleware for API Protection
 * Prevents abuse and ensures fair usage of API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// Rate limit configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts. Please try again later.'
  },
  
  // Payment endpoints - moderate limits
  payment: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many payment requests. Please wait before trying again.'
  },
  
  // Data retrieval endpoints - generous limits
  read: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Rate limit exceeded. Please slow down your requests.'
  },
  
  // Write/Update endpoints - moderate limits
  write: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many write requests. Please wait before trying again.'
  },
  
  // Public endpoints - relaxed limits
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many requests. Please try again later.'
  },
  
  // Utility connection endpoints - strict limits
  utility: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: 'Too many utility connection attempts. Please try again later.'
  }
};

// Type for rate limit configuration
type RateLimitConfig = {
  windowMs: number;
  max: number;
  message: string;
};

// Create separate caches for different rate limit types
const rateLimiters = new Map<string, LRUCache<string, number[]>>();

// Get or create a rate limiter for a specific type
function getRateLimiter(type: string): LRUCache<string, number[]> {
  if (!rateLimiters.has(type)) {
    rateLimiters.set(type, new LRUCache<string, number[]>({
      max: 10000, // Store up to 10,000 unique IPs
      ttl: 24 * 60 * 60 * 1000, // 24 hour TTL
    }));
  }
  return rateLimiters.get(type)!;
}

// Get client identifier (IP + User ID if authenticated)
function getClientIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  // Include user ID if authenticated (from Clerk)
  const userId = request.headers.get('x-user-id');
  
  return userId ? `${ip}:${userId}` : ip;
}

// Main rate limiting function
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'public'
): Promise<NextResponse | null> {
  const config = RATE_LIMIT_CONFIGS[type];
  const clientId = getClientIdentifier(request);
  const now = Date.now();
  
  // Get the rate limiter for this type
  const limiter = getRateLimiter(type);
  
  // Get existing timestamps for this client
  const timestamps = limiter.get(clientId) || [];
  
  // Remove timestamps outside the current window
  const validTimestamps = timestamps.filter(
    timestamp => now - timestamp < config.windowMs
  );
  
  // Check if limit exceeded
  if (validTimestamps.length >= config.max) {
    const resetTime = Math.min(...validTimestamps) + config.windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: config.message,
        retryAfter: retryAfter,
        limit: config.max,
        remaining: 0,
        reset: new Date(resetTime).toISOString()
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': retryAfter.toString(),
        }
      }
    );
  }
  
  // Add current timestamp and update cache
  validTimestamps.push(now);
  limiter.set(clientId, validTimestamps);
  
  // Return null to continue processing
  return null;
}

// Middleware function to be used in middleware.ts
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'public'
): Promise<NextResponse> {
  const rateLimitResponse = await rateLimit(request, type);
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  const response = await handler();
  
  // Add rate limit headers to successful responses
  const config = RATE_LIMIT_CONFIGS[type];
  const clientId = getClientIdentifier(request);
  const limiter = getRateLimiter(type);
  const timestamps = limiter.get(clientId) || [];
  const now = Date.now();
  const validTimestamps = timestamps.filter(
    timestamp => now - timestamp < config.windowMs
  );
  const remaining = Math.max(0, config.max - validTimestamps.length);
  const resetTime = validTimestamps.length > 0 
    ? Math.min(...validTimestamps) + config.windowMs 
    : now + config.windowMs;
  
  response.headers.set('X-RateLimit-Limit', config.max.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());
  
  return response;
}

// Utility function to clear rate limit for a specific client
export function clearRateLimit(clientId: string, type?: string) {
  if (type) {
    const limiter = getRateLimiter(type);
    limiter.delete(clientId);
  } else {
    // Clear from all limiters
    rateLimiters.forEach(limiter => limiter.delete(clientId));
  }
}

// Utility function to get current rate limit status
export function getRateLimitStatus(
  clientId: string, 
  type: keyof typeof RATE_LIMIT_CONFIGS = 'public'
) {
  const config = RATE_LIMIT_CONFIGS[type];
  const limiter = getRateLimiter(type);
  const timestamps = limiter.get(clientId) || [];
  const now = Date.now();
  const validTimestamps = timestamps.filter(
    timestamp => now - timestamp < config.windowMs
  );
  
  return {
    limit: config.max,
    remaining: Math.max(0, config.max - validTimestamps.length),
    used: validTimestamps.length,
    reset: validTimestamps.length > 0 
      ? new Date(Math.min(...validTimestamps) + config.windowMs)
      : new Date(now + config.windowMs)
  };
}