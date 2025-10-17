import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import {
  generateCSRFToken,
  verifyCSRFToken,
  getCSRFTokenFromRequest,
  setCSRFCookie,
  getSessionId,
  isExcludedPath,
  requiresCSRFProtection,
  createCSRFErrorResponse,
  logCSRFEvent,
} from '@/lib/csrf';

/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern with JWT tokens
 */
export async function csrfProtection(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // Skip CSRF for excluded paths
  if (isExcludedPath(pathname)) {
    return null;
  }

  // Skip CSRF for safe methods
  if (!requiresCSRFProtection(method)) {
    return null;
  }

  try {
    // Get session ID (Clerk session or IP-based)
    const sessionId = await getSessionId(req);
    if (!sessionId) {
      await logCSRFEvent('failed', {
        reason: 'no_session_id',
        path: pathname,
        method,
      });
      return createCSRFErrorResponse('Unable to establish session');
    }

    // Get CSRF token from request
    const token = getCSRFTokenFromRequest(req);
    if (!token) {
      await logCSRFEvent('failed', {
        reason: 'missing_token',
        path: pathname,
        method,
        sessionId,
      });
      return createCSRFErrorResponse('CSRF token missing');
    }

    // Verify token
    const isValid = await verifyCSRFToken(token, sessionId);
    if (!isValid) {
      await logCSRFEvent('failed', {
        reason: 'invalid_token',
        path: pathname,
        method,
        sessionId,
      });
      return createCSRFErrorResponse('Invalid CSRF token');
    }

    // Token is valid
    await logCSRFEvent('validated', {
      path: pathname,
      method,
      sessionId,
    });

    return null; // Continue with request
  } catch (error) {
    logger.error('api', 'CSRF middleware error:', error );
    await logCSRFEvent('failed', {
      reason: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      path: pathname,
      method,
    });
    return createCSRFErrorResponse('CSRF validation error');
  }
}

/**
 * Generate and attach CSRF token to response
 * Use this for pages that need CSRF tokens
 */
export async function attachCSRFToken(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  try {
    const sessionId = await getSessionId(req);
    if (!sessionId) {
      return res;
    }

    // Generate new token
    const token = await generateCSRFToken(sessionId);
    
    // Set cookie
    await setCSRFCookie(token, res);
    
    // Also set as response header for easy access
    res.headers.set('X-CSRF-Token', token);
    
    await logCSRFEvent('generated', {
      sessionId,
      path: req.nextUrl.pathname,
    });

    return res;
  } catch (error) {
    logger.error('api', 'Failed to attach CSRF token:', error );
    return res;
  }
}

/**
 * Rotate CSRF token (for login/logout)
 */
export async function rotateCSRFToken(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  try {
    const sessionId = await getSessionId(req);
    if (!sessionId) {
      return res;
    }

    // Generate new token
    const newToken = await generateCSRFToken(sessionId);
    
    // Set new cookie
    await setCSRFCookie(newToken, res);
    
    // Clear old token cookie
    res.cookies.delete('vibelux-csrf-cookie');
    
    await logCSRFEvent('rotated', {
      sessionId,
      trigger: req.nextUrl.pathname,
    });

    return res;
  } catch (error) {
    logger.error('api', 'Failed to rotate CSRF token:', error );
    return res;
  }
}

// Export alias for middleware compatibility
export const csrfMiddleware = csrfProtection;