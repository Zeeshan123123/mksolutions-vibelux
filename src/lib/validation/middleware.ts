import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { formatZodError } from './zod-validator';

// Types for middleware options
interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

interface AuthOptions {
  requireAuth?: boolean;
  requireRoles?: string[];
  requirePermissions?: string[];
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyGenerator?: (req: NextRequest) => string;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Main validation middleware
export function withValidation(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: ValidationOptions = {}
) {
  return async (req: NextRequest, context?: any) => {
    try {
      const validatedData: any = {};

      // Validate request body
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
        try {
          const body = await req.json();
          validatedData.body = options.body.parse(body);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid request body',
                details: formatZodError(error)
              },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }
      }

      // Validate query parameters
      if (options.query) {
        const searchParams = new URL(req.url).searchParams;
        const queryParams: Record<string, any> = {};
        
        searchParams.forEach((value, key) => {
          if (queryParams[key]) {
            if (Array.isArray(queryParams[key])) {
              queryParams[key].push(value);
            } else {
              queryParams[key] = [queryParams[key], value];
            }
          } else {
            queryParams[key] = value;
          }
        });

        try {
          validatedData.query = options.query.parse(queryParams);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid query parameters',
                details: formatZodError(error)
              },
              { status: 400 }
            );
          }
        }
      }

      // Validate route params
      if (options.params && context?.params) {
        try {
          validatedData.params = options.params.parse(context.params);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid route parameters',
                details: formatZodError(error)
              },
              { status: 400 }
            );
          }
        }
      }

      // Validate headers
      if (options.headers) {
        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
          headers[key] = value;
        });

        try {
          validatedData.headers = options.headers.parse(headers);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid request headers',
                details: formatZodError(error)
              },
              { status: 400 }
            );
          }
        }
      }

      // Attach validated data to request
      (req as any).validated = validatedData;

      // Call the handler with validated data
      return handler(req, context);
    } catch (error) {
      logger.error('api', 'Validation middleware error:', error );
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Authentication middleware
export function withAuth(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (req: NextRequest, context?: any) => {
    try {
      const { userId } = await auth();

      if (options.requireAuth && !userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (userId) {
        // Get user with roles and permissions
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            role: true,
            subscriptionTier: true
          }
        });

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Check role requirements
        if (options.requireRoles && options.requireRoles.length > 0) {
          if (!options.requireRoles.includes(user.role)) {
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            );
          }
        }

        // Attach user to request
        (req as any).user = user;
      }

      return handler(req, context);
    } catch (error) {
      logger.error('api', 'Auth middleware error:', error );
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

// Rate limiting middleware
export function withRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  const windowMs = options.windowMs || 60000; // 1 minute default
  const max = options.max || 60; // 60 requests per window default
  const keyGenerator = options.keyGenerator || ((req) => {
    // Default: use IP address or user ID
    const userId = (req as any).user?.id;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    return userId || ip;
  });

  return async (req: NextRequest, context?: any) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    // Check if limit exceeded
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(req, context);
    
    response.headers.set('X-RateLimit-Limit', max.toString());
    response.headers.set('X-RateLimit-Remaining', (max - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

    return response;
  };
}

// Combine multiple middlewares
export function withMiddlewares(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  ...middlewares: Array<(handler: any, options?: any) => any>
) {
  return middlewares.reduceRight(
    (acc, middleware) => middleware(acc),
    handler
  );
}

// CORS middleware
export function withCors(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    allowedOrigins?: string[];
    allowedMethods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  } = {}
) {
  const allowedOrigins = options.allowedOrigins || ['*'];
  const allowedMethods = options.allowedMethods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
  const allowedHeaders = options.allowedHeaders || ['Content-Type', 'Authorization'];
  const credentials = options.credentials || false;

  return async (req: NextRequest, context?: any) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigins.join(', '),
          'Access-Control-Allow-Methods': allowedMethods.join(', '),
          'Access-Control-Allow-Headers': allowedHeaders.join(', '),
          'Access-Control-Allow-Credentials': credentials.toString()
        }
      });
    }

    const response = await handler(req, context);
    
    // Add CORS headers to response
    const origin = req.headers.get('origin') || '';
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
      response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
    }

    return response;
  };
}

// Security headers middleware
export function withSecurityHeaders(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const response = await handler(req, context);
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );
    
    return response;
  };
}

// Logging middleware
export function withLogging(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();
    
    logger.info('api', `[${requestId}] ${req.method} ${req.url}`);
    
    try {
      const response = await handler(req, context);
      
      const duration = Date.now() - start;
      logger.info('api', `[${requestId}] ${response.status} - ${duration}ms`);
      
      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('api', `[${requestId}] Error - ${duration}ms:`, error);
      throw error;
    }
  };
}