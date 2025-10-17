import { NextRequest, NextResponse } from 'next/server';

interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultOptions: CorsOptions = {
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function cors(options: CorsOptions = {}) {
  const config = { ...defaultOptions, ...options };
  
  return (req: NextRequest, res: NextResponse) => {
    const origin = req.headers.get('origin') || '';
    
    // Check if origin is allowed
    let isAllowed = false;
    
    if (typeof config.origin === 'string') {
      isAllowed = origin === config.origin;
    } else if (Array.isArray(config.origin)) {
      isAllowed = config.origin.includes(origin);
    } else if (typeof config.origin === 'function') {
      isAllowed = config.origin(origin);
    }
    
    // Set CORS headers if origin is allowed
    if (isAllowed || config.origin === '*') {
      res.headers.set('Access-Control-Allow-Origin', origin || '*');
      
      if (config.credentials) {
        res.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      if (config.methods) {
        res.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
      }
      
      if (config.allowedHeaders) {
        res.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
      }
      
      if (config.exposedHeaders) {
        res.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
      }
      
      if (req.method === 'OPTIONS') {
        res.headers.set('Access-Control-Max-Age', String(config.maxAge));
      }
    }
    
    return res;
  };
}

// Production CORS configuration
export const productionCors: CorsOptions = {
  origin: (origin: string) => {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://vibelux.com',
      'https://www.vibelux.com',
      'https://app.vibelux.com',
      // Add your production domains here
    ].filter(Boolean);
    
    return allowedOrigins.includes(origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Development CORS configuration
export const developmentCors: CorsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
};

// Helper function to apply CORS to API routes
export function withCors(handler: Function, options?: CorsOptions) {
  return async (req: NextRequest) => {
    const res = await handler(req);
    const corsOptions = process.env.NODE_ENV === 'production' ? productionCors : developmentCors;
    return cors({ ...corsOptions, ...options })(req, res);
  };
}