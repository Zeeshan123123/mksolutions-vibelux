import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyCSRFToken, 
  getCSRFTokenFromRequest, 
  getSessionId, 
  isExcludedPath, 
  requiresCSRFProtection,
  createCSRFErrorResponse,
  logCSRFEvent 
} from '@/lib/csrf';

type ApiHandler = (req: NextRequest) => Promise<NextResponse> | NextResponse;

interface CSRFProtectedHandlers {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  DELETE?: ApiHandler;
  PATCH?: ApiHandler;
  OPTIONS?: ApiHandler;
  HEAD?: ApiHandler;
}

/**
 * Wrapper for API routes that adds CSRF protection
 */
export function withCSRFProtection(handlers: CSRFProtectedHandlers) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const method = req.method as keyof CSRFProtectedHandlers;
    const handler = handlers[method];
    
    if (!handler) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Skip CSRF protection for excluded paths
    if (isExcludedPath(req.nextUrl.pathname)) {
      return handler(req);
    }

    // Skip CSRF protection for safe methods
    if (!requiresCSRFProtection(req.method)) {
      return handler(req);
    }

    try {
      // Get session ID
      const sessionId = await getSessionId(req);
      if (!sessionId) {
        await logCSRFEvent('failed', {
          reason: 'no_session_id',
          path: req.nextUrl.pathname,
          method: req.method,
        });
        return createCSRFErrorResponse('Unable to establish session');
      }

      // Get CSRF token from request
      let token = getCSRFTokenFromRequest(req);
      
      // For form data, try to extract from body
      if (!token && req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
        const formData = await req.clone().formData();
        token = formData.get('csrf_token') as string;
      }

      if (!token) {
        await logCSRFEvent('failed', {
          reason: 'missing_token',
          path: req.nextUrl.pathname,
          method: req.method,
          sessionId,
        });
        return createCSRFErrorResponse('CSRF token missing');
      }

      // Verify token
      const isValid = await verifyCSRFToken(token, sessionId);
      if (!isValid) {
        await logCSRFEvent('failed', {
          reason: 'invalid_token',
          path: req.nextUrl.pathname,
          method: req.method,
          sessionId,
        });
        return createCSRFErrorResponse('Invalid CSRF token');
      }

      // Log successful validation
      await logCSRFEvent('validated', {
        path: req.nextUrl.pathname,
        method: req.method,
        sessionId,
      });

      // Execute the handler
      return handler(req);
    } catch (error) {
      logger.error('api', 'CSRF protection error:', error );
      await logCSRFEvent('failed', {
        reason: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.nextUrl.pathname,
        method: req.method,
      });
      return createCSRFErrorResponse('CSRF validation error');
    }
  };
}

/**
 * Helper function to create CSRF-protected API routes
 */
export function createCSRFProtectedApi(handlers: CSRFProtectedHandlers) {
  const protectedHandler = withCSRFProtection(handlers);
  
  return {
    GET: handlers.GET ? protectedHandler : undefined,
    POST: handlers.POST ? protectedHandler : undefined,
    PUT: handlers.PUT ? protectedHandler : undefined,
    DELETE: handlers.DELETE ? protectedHandler : undefined,
    PATCH: handlers.PATCH ? protectedHandler : undefined,
    OPTIONS: handlers.OPTIONS ? protectedHandler : undefined,
    HEAD: handlers.HEAD ? protectedHandler : undefined,
  };
}

/**
 * Extract CSRF token from various request sources
 */
export async function extractCSRFToken(req: NextRequest): Promise<string | null> {
  // Check header first
  const headerToken = req.headers.get('x-csrf-token');
  if (headerToken) {
    return headerToken;
  }

  // Check JSON body
  if (req.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await req.clone().json();
      return body.csrf_token || null;
    } catch {
      return null;
    }
  }

  // Check form data
  if (req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await req.clone().formData();
      return formData.get('csrf_token') as string || null;
    } catch {
      return null;
    }
  }

  return null;
}