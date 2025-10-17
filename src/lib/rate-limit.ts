import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Simple in-memory rate limiter for production
// For distributed systems, use Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory (consider Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max requests per window
  message?: string; // Error message
  keyGenerator?: (req: NextRequest) => string; // Function to generate unique key
  skip?: (req: NextRequest) => boolean; // Function to skip rate limiting
}

const defaultConfig: Required<RateLimitConfig> = {
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.API_RATE_LIMIT || '100'),
  message: 'Too many requests, please try again later.',
  keyGenerator: (req) => {
    // Use IP address as default key
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return ip;
  },
  skip: () => false
};

export function createRateLimiter(config: RateLimitConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return async function rateLimit(req: NextRequest) {
    // Check if we should skip rate limiting for this request
    if (finalConfig.skip(req)) {
      return null; // No rate limit applied
    }

    const key = finalConfig.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;
    const resetTime = now + finalConfig.windowMs;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = { count: 1, resetTime };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count for existing entry
      entry.count++;
    }

    // Check if limit exceeded
    if (entry.count > finalConfig.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: finalConfig.message,
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(finalConfig.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(entry.resetTime),
            'Retry-After': String(retryAfter)
          }
        }
      );
    }

    // Add rate limit headers to successful responses
    return null; // Continue with request
  };
}

// Pre-configured rate limiters for different endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.nextUrl.pathname === '/api/health';
  }
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts. Please try again later.'
});

export const energyApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Higher limit for energy monitoring endpoints
  keyGenerator: (req) => {
    // Use API key for authenticated requests
    const apiKey = req.headers.get('x-api-key');
    if (apiKey) return `api:${apiKey}`;
    
    // Fall back to IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `ip:${ip}`;
  }
});

// Helper function to apply rate limiting in API routes
export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  rateLimiter = apiRateLimiter
): Promise<NextResponse> {
  const rateLimitResponse = await rateLimiter(req);
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return handler();
}