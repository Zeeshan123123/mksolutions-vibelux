import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, buildCSP, getCSPConfig, reportToHeader } from '@/lib/csp/config';

// Store nonce in request headers for use in components
export const NONCE_HEADER = 'x-nonce';

export async function applyCSPHeaders(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  // Generate a unique nonce for this request
  const nonce = generateNonce();
  
  // Store nonce in response header for use in server components
  response.headers.set(NONCE_HEADER, nonce);
  
  // Get CSP configuration based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cspConfig = getCSPConfig(isDevelopment);
  
  // Build CSP header with nonce
  const cspHeader = buildCSP(cspConfig, nonce);
  
  // Apply CSP header
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Set other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to allow Clerk iframes
  response.headers.set('X-XSS-Protection', '0'); // Disabled in favor of CSP
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add Report-To header for CSP reporting
  response.headers.set('Report-To', reportToHeader);
  
  // HSTS header for production
  if (!isDevelopment) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
}

// Extract nonce from headers (for use in server components)
export function getNonce(headers: Headers): string | null {
  return headers.get(NONCE_HEADER);
}