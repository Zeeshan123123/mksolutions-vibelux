import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { logger } from '@/lib/logging/production-logger';

// Configuration
const CSRF_TOKEN_NAME = 'vibelux-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET;

if (!CSRF_SECRET) {
  throw new Error('CSRF_SECRET or NEXTAUTH_SECRET environment variable is required');
}
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const DOUBLE_SUBMIT_COOKIE_NAME = 'vibelux-csrf-cookie';

// Methods that require CSRF protection
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

// Paths that should be excluded from CSRF protection
const EXCLUDED_PATHS = [
  '/api/webhooks', // Webhook endpoints typically can't send CSRF tokens
  '/api/health', // Health check endpoints
  '/api/v1/docs', // Documentation endpoints
];

interface CSRFTokenPayload {
  sessionId: string;
  timestamp: number;
  nonce: string;
  [key: string]: any;
}

/**
 * Generate a secure CSRF token
 */
export async function generateCSRFToken(sessionId: string): Promise<string> {
  const payload: CSRFTokenPayload = {
    sessionId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const secret = new TextEncoder().encode(CSRF_SECRET);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret);

  return token;
}

/**
 * Verify a CSRF token
 */
export async function verifyCSRFToken(token: string, sessionId: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(CSRF_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    const tokenPayload = payload as unknown as CSRFTokenPayload;
    
    // Verify session ID matches using timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(tokenPayload.sessionId), Buffer.from(sessionId))) {
      logger.error('api', 'CSRF token session mismatch');
      return false;
    }
    
    // Check token age
    const tokenAge = Date.now() - tokenPayload.timestamp;
    if (tokenAge > TOKEN_EXPIRY) {
      logger.error('api', 'CSRF token expired');
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('api', 'CSRF token verification failed:', error );
    return false;
  }
}

/**
 * Get CSRF token from request
 */
export function getCSRFTokenFromRequest(req: NextRequest): string | null {
  // Check header first (preferred method)
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }
  
  // Check request body for form submissions
  if (req.headers.get('content-type')?.includes('application/json')) {
    // For JSON requests, the token should be in the header
    return null;
  }
  
  // For form data, we'd need to parse the body (handled in route handlers)
  return null;
}

/**
 * Set CSRF token cookie
 */
export async function setCSRFCookie(token: string, response: NextResponse): Promise<void> {
  const cookieStore = await cookies();
  
  // Set HTTP-only cookie for double-submit cookie pattern
  response.cookies.set(DOUBLE_SUBMIT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
  });
}

/**
 * Get session ID from Clerk auth
 */
export async function getSessionId(req: NextRequest): Promise<string | null> {
  // Get Clerk session ID from cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session');
  
  if (sessionCookie) {
    return sessionCookie.value;
  }
  
  // Fallback to IP-based session for non-authenticated requests
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Check if a path should be excluded from CSRF protection
 */
export function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Check if a request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  return PROTECTED_METHODS.includes(method.toUpperCase());
}

/**
 * Create CSRF error response
 */
export function createCSRFErrorResponse(message: string = 'CSRF validation failed'): NextResponse {
  return NextResponse.json(
    {
      error: 'CSRF_VALIDATION_FAILED',
      message,
      timestamp: new Date().toISOString(),
    },
    {
      status: 403,
      headers: {
        'X-CSRF-Error': 'true',
      },
    }
  );
}

/**
 * Log CSRF events for security monitoring
 */
export async function logCSRFEvent(
  event: 'generated' | 'validated' | 'failed' | 'rotated',
  details: Record<string, any>
): Promise<void> {
  // In production, this should log to your security monitoring system
  if (process.env.NODE_ENV === 'production') {
    logger.info('api', `[CSRF ${event.toUpperCase()}]`, {
      timestamp: new Date().toISOString(),
      ...details,
    });
  } else {
    logger.debug('system', `[CSRF ${event}]`, { data: details });
  }
}