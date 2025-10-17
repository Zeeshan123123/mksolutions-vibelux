import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Security headers for production (CSP is now handled by middleware/csp.ts)
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0', // Disabled in favor of CSP
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially harmful characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Generate secure tokens
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash sensitive data
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Validate API keys
export function validateApiKey(apiKey: string, validKeys: string[]): boolean {
  if (!apiKey || !validKeys.length) return false;
  
  // Use timing-safe comparison to prevent timing attacks
  return validKeys.some(validKey => {
    if (apiKey.length !== validKey.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(apiKey),
      Buffer.from(validKey)
    );
  });
}

// Check for common security vulnerabilities in request
export function checkRequestSecurity(req: NextRequest): { safe: boolean; reason?: string } {
  const url = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent') || '';
  
  // Check for SQL injection patterns
  const sqlInjectionPattern = /(\b(union|select|insert|update|delete|drop|create|alter|exec|script)\b|--|\/\*|\*\/|;|'|")/i;
  if (sqlInjectionPattern.test(url)) {
    return { safe: false, reason: 'Potential SQL injection detected' };
  }
  
  // Check for path traversal
  const pathTraversalPattern = /(\.\.|\/\/|\\\\)/;
  if (pathTraversalPattern.test(url)) {
    return { safe: false, reason: 'Potential path traversal detected' };
  }
  
  // Check for suspicious user agents
  const suspiciousAgents = ['sqlmap', 'nikto', 'scanner', 'nmap', 'havij', 'acunetix'];
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return { safe: false, reason: 'Suspicious user agent detected' };
  }
  
  return { safe: true };
}

// IP-based security checks
export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
         req.headers.get('x-real-ip') || 
         req.ip || 
         'unknown';
}

// Brute force protection
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkBruteForce(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempt = failedAttempts.get(identifier);
  
  if (!attempt || now - attempt.lastAttempt > windowMs) {
    failedAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempt.count >= maxAttempts) {
    return false;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  return true;
}

export function resetBruteForce(identifier: string): void {
  failedAttempts.delete(identifier);
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  for (const [key, value] of failedAttempts.entries()) {
    if (now - value.lastAttempt > windowMs) {
      failedAttempts.delete(key);
    }
  }
}, 60 * 1000); // Run every minute