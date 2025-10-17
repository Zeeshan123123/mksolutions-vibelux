import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimit, trackAPIUsage } from '@/lib/auth/rate-limiter';
import { getUserRole } from '@/lib/auth/roles';
import { logger } from '@/lib/logging/production-logger';

/**
 * API Rate Limiting Middleware
 */
export async function apiRateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip rate limiting for webhooks and health checks
  const skipPaths = ['/api/webhooks', '/api/health', '/api/stripe/webhook'];
  if (skipPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  try {
    // Get user from auth
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - API key or authentication required' },
        { status: 401 }
      );
    }
    
    // Get user tier
    const userRole = await getUserRole(userId);
    const userTier = userRole?.subscriptionTier || 'FREE';
    
    // Check rate limit
    const endpoint = request.nextUrl.pathname;
    const rateLimit = await checkRateLimit(userId, endpoint, userTier);
    
    if (!rateLimit.allowed) {
      // Track the rejected request
      await trackAPIUsage(userId, endpoint, {
        method: request.method,
        statusCode: 429,
        rejected: true
      });
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `You have exceeded the rate limit for your ${userTier} plan`,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          resetTime: new Date(rateLimit.resetTime || 0).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit || 0),
            'X-RateLimit-Remaining': String(rateLimit.remaining || 0),
            'X-RateLimit-Reset': String(rateLimit.resetTime || 0),
            'Retry-After': String(Math.ceil((rateLimit.resetTime || 0 - Date.now()) / 1000))
          }
        }
      );
    }
    
    // Track successful request
    const startTime = Date.now();
    
    // Get response to track status
    const response = NextResponse.next();
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(rateLimit.limit || 0));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining || 0));
    response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime || 0));
    
    // Track usage after response
    setImmediate(async () => {
      await trackAPIUsage(userId, endpoint, {
        method: request.method,
        statusCode: response.status,
        responseTime: Date.now() - startTime
      });
    });
    
    return response;
    
  } catch (error) {
    logger.error('api', 'Rate limit middleware error:', error);
    // Don't block on errors - fail open
    return NextResponse.next();
  }
}