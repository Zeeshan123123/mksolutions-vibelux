// import crypto from 'crypto'; // Disabled for edge runtime compatibility

// CSP directive types
export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'child-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'base-uri'?: string[];
  'manifest-src'?: string[];
  'prefetch-src'?: string[];
  'script-src-elem'?: string[];
  'style-src-elem'?: string[];
  'script-src-attr'?: string[];
  'style-src-attr'?: string[];
  'report-uri'?: string[];
  'report-to'?: string[];
  'require-trusted-types-for'?: string[];
  'trusted-types'?: string[];
  'upgrade-insecure-requests'?: string[];
  'block-all-mixed-content'?: string[];
}

// Base CSP configuration
const baseCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'block-all-mixed-content': [],
  'upgrade-insecure-requests': [],
};

// Development CSP (more permissive)
const developmentCSP: CSPDirectives = {
  ...baseCSP,
  'script-src': [
    "'self'",
    "'nonce-{nonce}'",
    // Required for Next.js development
    "'unsafe-eval'", // Will be removed in production
    "'unsafe-inline'", // Only for development - Hot Module Replacement
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",

    "https://accounts.vibelux.ai",
    "https://challenges.cloudflare.com",
  ],
  'style-src': [
    "'self'",
    "'nonce-{nonce}'",
    "'unsafe-inline'", // Only for development - styled-components dev mode
    "https://fonts.googleapis.com",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",

    "https://accounts.vibelux.ai",
    "https://api.mapbox.com",
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "http://localhost:*",
  ],
  'connect-src': [
    "'self'",
    "https://clerk.com",
    "https://*.clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://api.clerk.com",
    "https://api.clerk.dev",

    "https://accounts.vibelux.ai",
    "https://api.stripe.com",
    "https://*.pusher.com",
    "wss://*.pusher.com",
    "https://sockjs-us3.pusher.com",
    "wss://ws-us3.pusher.com",
    "https://api.openai.com",
    "https://api.anthropic.com",
    "https://api.weather.gov",
    "https://*.weather.gov",
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://api.openweathermap.org",
    "https://weather.visualcrossing.com",
    "https://nationalmap.gov",
    "ws://localhost:*",
    "http://localhost:*",
  ],
  'frame-src': [
    "'self'",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.services",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.com",

    "https://accounts.vibelux.ai",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://challenges.cloudflare.com",
  ],
  'worker-src': [
    "'self'",
    "blob:",
  ],
  'media-src': [
    "'self'",
    "blob:",
    "data:",
  ],
};

// Production CSP (strict)
const productionCSP: CSPDirectives = {
  ...baseCSP,
  'script-src': [
    "'self'",
    "'nonce-{nonce}'",
    // Note: Temporarily keeping unsafe-inline for third-party compatibility
    // TODO: Remove once all inline scripts are migrated to nonce-based approach
    "'unsafe-inline'",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.services",
    "https://*.clerk.com",

    "https://accounts.vibelux.ai",
    "https://challenges.cloudflare.com",
    "https://js.stripe.com",
    "https://www.vibelux.ai",
    "https://vibelux.ai",
  ],
  'style-src': [
    "'self'",
    "'nonce-{nonce}'",
    "'unsafe-inline'", // Allow inline styles for Clerk components and dynamic styling
    "https://fonts.googleapis.com",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",

    "https://accounts.vibelux.ai",
    "https://vercel.live",
    "https://*.vercel.app",
    "https://www.vibelux.ai",
    "https://vibelux.ai",
    "https://api.mapbox.com",
  ],
  'style-src-attr': [
    "'unsafe-inline'", // Allow inline style attributes
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ],
  'connect-src': [
    "'self'",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.services",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.com",

    "https://accounts.vibelux.ai",
    "https://api.stripe.com",
    "https://*.pusher.com",
    "wss://*.pusher.com",
    "https://sockjs-us3.pusher.com",
    "wss://ws-us3.pusher.com",
    "https://api.openai.com",
    "https://api.anthropic.com",
    "https://*.ingest.sentry.io",
    "https://*.ingest.us.sentry.io",
    "https://api.weather.gov",
    "https://*.weather.gov",
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://api.openweathermap.org",
    "https://weather.visualcrossing.com",
    "https://nationalmap.gov",
  ],
  'frame-src': [
    "'self'",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.services",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.com",

    "https://accounts.vibelux.ai",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://challenges.cloudflare.com",
  ],
  'worker-src': [
    "'self'",
    "blob:",
  ],
  'media-src': [
    "'self'",
    "blob:",
  ],
  'report-uri': ['/api/csp-report'],
  'report-to': ['csp-endpoint'],
};

// Generate a random nonce
export function generateNonce(): string {
  // Use Web Crypto API for better security in edge runtime
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
  }
  // Fallback for environments without Web Crypto API
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Build CSP string from directives
export function buildCSP(directives: CSPDirectives, nonce?: string): string {
  return Object.entries(directives)
    .map(([directive, values]) => {
      if (!values || values.length === 0) {
        return directive;
      }
      const valueString = values
        .join(' ')
        .replace(/{nonce}/g, nonce || '');
      return `${directive} ${valueString}`;
    })
    .join('; ');
}

// Get CSP configuration based on environment
export function getCSPConfig(isDevelopment: boolean = process.env.NODE_ENV === 'development'): CSPDirectives {
  const level = getCSPLevel();
  switch (level) {
    case 'development':
      return developmentCSP;
    case 'strict':
      return strictCSP;
    case 'production':
    default:
      return productionCSP;
  }
}

// CSP Report-To header value
export const reportToHeader = JSON.stringify({
  group: 'csp-endpoint',
  max_age: 10886400,
  endpoints: [
    {
      url: '/api/csp-report',
    },
  ],
});

// Strict CSP configuration (for enhanced security)
const strictCSP: CSPDirectives = {
  ...baseCSP,
  'script-src': [
    "'self'",
    "'nonce-{nonce}'",
    "'strict-dynamic'", // Allows scripts loaded by trusted scripts
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",

    "https://accounts.vibelux.ai",
    "https://challenges.cloudflare.com",
    "https://js.stripe.com",
  ],
  'style-src': [
    "'self'",
    "'nonce-{nonce}'",
    "https://fonts.googleapis.com",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",

    "https://accounts.vibelux.ai",
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ],
  'connect-src': [
    "'self'",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.services",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.com",

    "https://accounts.vibelux.ai",
    "https://api.stripe.com",
    "https://*.pusher.com",
    "wss://*.pusher.com",
    "https://sockjs-us3.pusher.com",
    "wss://ws-us3.pusher.com",
    "https://api.openai.com",
    "https://api.anthropic.com",
    "https://*.ingest.sentry.io",
    "https://*.ingest.us.sentry.io",
    "https://api.weather.gov",
    "https://*.weather.gov",
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://api.openweathermap.org",
    "https://weather.visualcrossing.com",
    "https://nationalmap.gov",
  ],
  'frame-src': [
    "'self'",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.services",
    "https://*.clerk.accounts.dev",
    "https://accounts.vibelux.ai",
    "https://*.clerk.com",

    "https://accounts.vibelux.ai",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://challenges.cloudflare.com",
  ],
  'worker-src': [
    "'self'",
    "blob:",
  ],
  'media-src': [
    "'self'",
    "blob:",
  ],
  'report-uri': ['/api/csp-report'],
  'report-to': ['csp-endpoint'],
  'require-trusted-types-for': ["'script'"], // Enable Trusted Types
  'trusted-types': ['default', 'dompurify'],
};

// Helper to get appropriate CSP level
export function getCSPLevel(): 'development' | 'production' | 'strict' {
  if (process.env.NODE_ENV === 'development') return 'development';
  if (process.env.NEXT_PUBLIC_CSP_MODE === 'strict') return 'strict';
  return 'production';
}