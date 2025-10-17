/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production
 */

import { NextRequest, NextResponse } from 'next/server';

// Security headers configuration
export const SECURITY_HEADERS = {
  // Content Security Policy - Restrict resource loading
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://api.sendgrid.com https://utilityapi.com wss://localhost:* ws://localhost:*",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Strict Transport Security - Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', '),
  
  // Prevent DNS prefetching
  'X-DNS-Prefetch-Control': 'off',
  
  // Disable powered by header
  'X-Powered-By': '',
  
  // Add security headers for modern browsers
  'X-Permitted-Cross-Domain-Policies': 'none',
  
  // Expect-CT for Certificate Transparency
  'Expect-CT': 'max-age=86400, enforce',
};

// Development-specific CSP (more permissive)
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' http: https: ws: wss:",
  "font-src 'self' data: https:",
].join('; ');

// Apply security headers to response
export function applySecurityHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Apply all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    // Use more permissive CSP in development
    if (key === 'Content-Security-Policy' && isDevelopment) {
      response.headers.set(key, DEV_CSP);
    } else if (key === 'Strict-Transport-Security' && isDevelopment) {
      // Skip HSTS in development
      return;
    } else {
      response.headers.set(key, value);
    }
  });
  
  // Add CORS headers if needed (configure based on your needs)
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://vibelux.ai'];
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return response;
}

// Security middleware wrapper
export async function withSecurityHeaders(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const response = await handler();
  return applySecurityHeaders(request, response);
}

// Validate origin for CSRF protection
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // Allow same-origin requests
  if (!origin || origin === `https://${host}` || origin === `http://${host}`) {
    return true;
  }
  
  // Check allowed origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  return allowedOrigins.includes(origin);
}

// Generate CSP nonce for inline scripts (if needed)
export function generateCSPNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}