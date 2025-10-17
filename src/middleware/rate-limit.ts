import { NextRequest, NextResponse } from 'next/server'
import { 
  checkRateLimit, 
  checkDDoSPattern, 
  isBlocked, 
  getClientIdentifier,
  getRateLimitHeaders,
  checkAIRateLimit,
  RATE_LIMITS
} from '@/lib/rate-limiter'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
// Use simple console logging instead of production logger for middleware
const logger = {
  error: (context: string, message: string, error?: any) => {
    console.error(`[${context}] ${message}`, error);
  }
};

// API routes that should be rate limited
const RATE_LIMITED_ROUTES = [
  '/api/team',
  '/api/user',
  '/api/facilities',
  '/api/projects',
  '/api/lighting-designs',
  '/api/energy-savings',
  '/api/revenue-share',
  '/api/ai'
]

// AI-specific routes that need special rate limiting
const AI_ROUTES = [
  '/api/ai',
  '/api/lighting-designs/generate',
  '/api/energy-savings/predict'
]

// Routes that should have stricter rate limits
const STRICT_ROUTES = {
  '/api/team/invite': {
    requests_per_hour: 10,
    requests_per_minute: 3,
    burst_limit: 1
  },
  '/api/user/delete': {
    requests_per_hour: 3,
    requests_per_minute: 1,
    burst_limit: 1
  },
  '/api/user/export': {
    requests_per_hour: 10,
    requests_per_minute: 2,
    burst_limit: 1
  }
}

export async function rateLimitMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip rate limiting for non-API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Skip rate limiting for health checks
  if (pathname === '/api/health' || pathname === '/api/ready') {
    return NextResponse.next()
  }

  try {
    // Get client identifier
    const identifier = await getClientIdentifier(request)

    // Check if the client is blocked
    if (await isBlocked(identifier)) {
      return NextResponse.json(
        { error: 'Access denied. Please contact support.' },
        { 
          status: 403,
          headers: {
            'X-RateLimit-Blocked': 'true'
          }
        }
      )
    }

    // Check for DDoS patterns
    if (await checkDDoSPattern(request)) {
      return NextResponse.json(
        { error: 'Unusual activity detected. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if this route should be rate limited
    const shouldRateLimit = RATE_LIMITED_ROUTES.some(route => pathname.startsWith(route))
    if (!shouldRateLimit) {
      return NextResponse.next()
    }

    // Get user subscription tier
    const { userId } = await auth()
    let tier: keyof typeof RATE_LIMITS = 'free'

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { subscriptionTier: true }
      })

      if (user?.subscriptionTier) {
        tier = user.subscriptionTier as keyof typeof RATE_LIMITS
      }
    }

    // Check if this is a strict route with custom limits
    let customLimits = null
    for (const [route, limits] of Object.entries(STRICT_ROUTES)) {
      if (pathname === route) {
        customLimits = limits
        break
      }
    }

    // Apply rate limiting
    let rateLimitResult
    if (customLimits) {
      // Use custom limits for strict routes
      rateLimitResult = await checkRateLimit(identifier, 'free', pathname)
      // Override with custom limits
      if (!rateLimitResult.allowed && customLimits) {
        const now = Date.now()
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded for this endpoint',
            limit: customLimits.requests_per_hour,
            reset: now + 3600000
          },
          { 
            status: 429,
            headers: getRateLimitHeaders({
              allowed: false,
              limit: customLimits.requests_per_hour,
              remaining: 0,
              reset: now + 3600000,
              retryAfter: 3600
            })
          }
        )
      }
    } else {
      rateLimitResult = await checkRateLimit(identifier, tier, pathname)
    }

    // Check AI-specific rate limits
    if (AI_ROUTES.some(route => pathname.startsWith(route))) {
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required for AI features' },
          { status: 401 }
        )
      }

      const aiRateLimitResult = await checkAIRateLimit(userId, tier)
      if (!aiRateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: 'AI request limit exceeded. Please upgrade your plan for more AI requests.',
            limit: aiRateLimitResult.limit,
            remaining: aiRateLimitResult.remaining,
            reset: aiRateLimitResult.reset
          },
          { 
            status: 429,
            headers: getRateLimitHeaders(aiRateLimitResult)
          }
        )
      }
    }

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next()
    const headers = getRateLimitHeaders(rateLimitResult)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    logger.error('api', 'Rate limiting error:', error )
    // If rate limiting fails, allow the request but log the error
    return NextResponse.next()
  }
}