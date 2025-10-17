/**
 * CSRF Protection Library
 * Implements double-submit cookie pattern with JWT tokens for enhanced security
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '@/lib/logging/production-logger';

// CSRF Configuration
const CSRF_SECRET = process.env.CSRF_SECRET || 'vibelux-csrf-secret-key-change-in-production';
const CSRF_TOKEN_EXPIRY = 3600; // 1 hour in seconds
const CSRF_COOKIE_NAME = 'vibelux-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Paths that don't require CSRF protection
const EXCLUDED_PATHS = [
  '/api/auth', // Clerk auth endpoints
  '/api/webhooks', // Webhook endpoints
  '/api/health', // Health checks
  '/api/monitoring', // Monitoring endpoints
  '/favicon.ico',
  '/_next', // Next.js static files
  '/images', // Static images
  '/icons', // Static icons
];

// API paths that require CSRF protection
const PROTECTED_API_PATHS = [
  '/api/facilities',
  '/api/users', 
  '/api/subscriptions',
  '/api/billing',
  '/api/sensors',
  '/api/energy',
  '/api/pest-detection',
  '/api/accounting',
  '/api/admin',
];

// HTTP methods that require CSRF protection
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export interface CSRFTokenPayload {
  sessionId: string;
  timestamp: number;
  nonce: string;
}

export interface CSRFLogEvent {
  event: 'generated' | 'validated' | 'failed' | 'rotated';
  sessionId?: string;
  path?: string;
  method?: string;
  reason?: string;
  error?: string;
  trigger?: string;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

/**
 * Generate a new CSRF token
 */
export async function generateCSRFToken(sessionId: string): Promise<string> {
  try {
    const payload: CSRFTokenPayload = {
      sessionId,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const token = jwt.sign(payload, CSRF_SECRET, {
      expiresIn: CSRF_TOKEN_EXPIRY,
      algorithm: 'HS256',
      issuer: 'vibelux-app',
      audience: sessionId
    });

    return token;
  } catch (error) {
    logger.error('api', 'Failed to generate CSRF token:', error);
    throw new Error('CSRF token generation failed');
  }
}

/**
 * Verify CSRF token
 */
export async function verifyCSRFToken(token: string, sessionId: string): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, CSRF_SECRET, {
      algorithm: 'HS256',
      issuer: 'vibelux-app',
      audience: sessionId
    }) as CSRFTokenPayload;

    // Check if token is not too old (additional validation)
    const tokenAge = Date.now() - decoded.timestamp;
    const maxAge = CSRF_TOKEN_EXPIRY * 1000; // Convert to milliseconds

    if (tokenAge > maxAge) {
      logger.warn('api', 'CSRF token expired', { sessionId, tokenAge, maxAge });
      return false;
    }

    // Validate session ID matches
    if (decoded.sessionId !== sessionId) {
      logger.warn('api', 'CSRF token session mismatch', { 
        tokenSessionId: decoded.sessionId, 
        requestSessionId: sessionId 
      });
      return false;
    }

    return true;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('api', 'Invalid CSRF token:', { 
        error: error.message, 
        sessionId 
      });
    } else {
      logger.error('api', 'CSRF token verification error:', error);
    }
    return false;
  }
}

/**
 * Get CSRF token from request (header or body)
 */
export function getCSRFTokenFromRequest(req: NextRequest): string | null {
  // Check header first
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Check form data for multipart requests
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    // For file uploads, token should be in header
    return null;
  }

  // For JSON requests, token should be in header
  return null;
}

/**
 * Set CSRF token as HTTP-only cookie
 */
export async function setCSRFCookie(token: string, response: NextResponse): Promise<void> {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/'
  });
}

/**
 * Get session ID from request
 */
export async function getSessionId(req: NextRequest): Promise<string | null> {
  try {
    // Try to get Clerk session first
    const { userId } = await auth();
    if (userId) {
      return `clerk_${userId}`;
    }

    // Fallback to IP-based session for anonymous users
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Create a stable session ID based on IP and User-Agent
    const sessionData = `${ip}_${userAgent}`;
    const sessionHash = crypto.createHash('sha256').update(sessionData).digest('hex');
    
    return `anonymous_${sessionHash.substring(0, 16)}`;
  } catch (error) {
    logger.error('api', 'Failed to get session ID:', error);
    return null;
  }
}

/**
 * Check if path is excluded from CSRF protection
 */
export function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATHS.some(excludedPath => {
    if (excludedPath.endsWith('*')) {
      return pathname.startsWith(excludedPath.slice(0, -1));
    }
    return pathname.startsWith(excludedPath);
  });
}

/**
 * Check if method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  return PROTECTED_METHODS.includes(method.toUpperCase());
}

/**
 * Check if API path requires CSRF protection
 */
export function isProtectedAPIPath(pathname: string): boolean {
  return PROTECTED_API_PATHS.some(protectedPath => 
    pathname.startsWith(protectedPath)
  );
}

/**
 * Create CSRF error response
 */
export function createCSRFErrorResponse(message: string, statusCode: number = 403): NextResponse {
  return NextResponse.json(
    {
      error: 'CSRF_VALIDATION_FAILED',
      message,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

/**
 * Log CSRF events for monitoring
 */
export async function logCSRFEvent(
  event: CSRFLogEvent['event'],
  details: Omit<CSRFLogEvent, 'event' | 'timestamp'>
): Promise<void> {
  const logEntry: CSRFLogEvent = {
    event,
    timestamp: Date.now(),
    ...details
  };

  switch (event) {
    case 'failed':
      logger.warn('api', `CSRF validation failed: ${details.reason}`, logEntry);
      break;
    case 'generated':
      logger.info('api', 'CSRF token generated', logEntry);
      break;
    case 'validated':
      logger.info('api', 'CSRF token validated', logEntry);
      break;
    case 'rotated':
      logger.info('api', 'CSRF token rotated', logEntry);
      break;
    default:
      logger.info('api', `CSRF event: ${event}`, logEntry);
  }
}

/**
 * Generate CSRF token for frontend use
 */
export async function generateCSRFTokenForClient(req: NextRequest): Promise<string | null> {
  try {
    const sessionId = await getSessionId(req);
    if (!sessionId) {
      return null;
    }

    const token = await generateCSRFToken(sessionId);
    
    await logCSRFEvent('generated', {
      sessionId,
      path: req.nextUrl.pathname,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    });

    return token;
  } catch (error) {
    logger.error('api', 'Failed to generate CSRF token for client:', error);
    return null;
  }
}

/**
 * Validate CSRF token and return detailed result
 */
export async function validateCSRFTokenDetailed(
  req: NextRequest
): Promise<{
  valid: boolean;
  reason?: string;
  sessionId?: string;
}> {
  try {
    const sessionId = await getSessionId(req);
    if (!sessionId) {
      return { valid: false, reason: 'no_session' };
    }

    const token = getCSRFTokenFromRequest(req);
    if (!token) {
      return { valid: false, reason: 'missing_token', sessionId };
    }

    const isValid = await verifyCSRFToken(token, sessionId);
    if (!isValid) {
      return { valid: false, reason: 'invalid_token', sessionId };
    }

    return { valid: true, sessionId };
  } catch (error) {
    logger.error('api', 'CSRF validation error:', error);
    return { valid: false, reason: 'validation_error' };
  }
}

/**
 * Middleware helper to check if request needs CSRF protection
 */
export function needsCSRFProtection(req: NextRequest): boolean {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // Skip if excluded path
  if (isExcludedPath(pathname)) {
    return false;
  }

  // Skip if safe method
  if (!requiresCSRFProtection(method)) {
    return false;
  }

  // Check if it's a protected API path
  if (pathname.startsWith('/api/')) {
    return isProtectedAPIPath(pathname);
  }

  // Protect all form submissions on pages
  return true;
}

/**
 * Get CSRF configuration summary
 */
export function getCSRFConfig() {
  return {
    tokenExpiry: CSRF_TOKEN_EXPIRY,
    cookieName: CSRF_COOKIE_NAME,
    headerName: CSRF_HEADER_NAME,
    excludedPaths: EXCLUDED_PATHS,
    protectedMethods: PROTECTED_METHODS,
    protectedAPIPaths: PROTECTED_API_PATHS,
    isProduction: process.env.NODE_ENV === 'production'
  };
}