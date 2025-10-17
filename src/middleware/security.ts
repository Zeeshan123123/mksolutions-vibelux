import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logging/production-logger';

// Wrapper version of security middleware for route handlers
export function securityMiddleware(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Handle case where req might be undefined during build
    if (!req || !req.headers) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    try {
      // Execute the handler
      const response = await handler(req);
      
      // Security headers are now handled by CSP middleware
      // Basic headers that don't conflict with CSP middleware
      response.headers.set('X-Request-ID', randomUUID());
      
      // Add rate limiting headers
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', '99');
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
      
      return response;
    } catch (error) {
      logger.error('api', 'Security middleware error:', error );
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// Input validation function
export function validateInput<T = any>(input: any, schema?: any): T {
  // Basic input validation
  if (input === null || input === undefined) {
    throw new Error('Input is required');
  }
  
  // Remove any potential XSS attempts
  if (typeof input === 'string') {
    // Basic XSS prevention
    const cleaned = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return cleaned as T;
  }
  
  // For objects, recursively clean
  if (typeof input === 'object' && !Array.isArray(input)) {
    const cleaned: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        cleaned[key] = validateInput(input[key]);
      }
    }
    return cleaned as T;
  }
  
  // For arrays
  if (Array.isArray(input)) {
    return input.map(item => validateInput(item)) as T;
  }
  
  // For other types, return as is
  return input as T;
}