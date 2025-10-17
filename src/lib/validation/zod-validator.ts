import { z, ZodError, ZodSchema } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Custom error formatter for better error messages
export function formatZodError(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  
  return formatted;
}

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

// Main validation function
export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodError(error)
      };
    }
    throw error;
  }
}

// Safe parse with detailed error info
export function safeParse<T>(schema: ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors: Record<string, string[]>;
  };
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    error: {
      message: 'Validation failed',
      errors: formatZodError(result.error)
    }
  };
}

// Async validation wrapper for API routes
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return { data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: formatZodError(error)
          },
          { status: 400 }
        )
      };
    }
    
    return {
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    };
  }
}

// Query parameters validation
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const params: Record<string, any> = {};
  
  searchParams.forEach((value, key) => {
    // Handle array parameters (e.g., ?tags=a&tags=b)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  });
  
  return validate(schema, params);
}

// Middleware for validating request body
export function createValidationMiddleware<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest) => {
    const validation = await validateRequest(request, schema);
    
    if ('error' in validation) {
      return validation.error;
    }
    
    // Attach validated data to request for use in route handler
    (request as any).validatedData = validation.data;
    
    return null; // Continue to route handler
  };
}

// Helper to create a validated API route handler
export function createValidatedHandler<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const validation = await validateRequest(request, schema);
    
    if ('error' in validation) {
      return validation.error;
    }
    
    try {
      return await handler(request, validation.data);
    } catch (error) {
      logger.error('api', 'Handler error:', error );
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Sanitization helpers
export const sanitizers = {
  // Remove any potential SQL injection attempts
  sanitizeSql: (input: string): string => {
    return input
      .replace(/['";\\]/g, '') // Remove quotes and escape characters
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE|EXEC|UNION|SELECT)\b/gi, ''); // Remove SQL keywords
  },
  
  // Sanitize HTML to prevent XSS
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  // Sanitize file paths
  sanitizePath: (input: string): string => {
    return input
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[^a-zA-Z0-9\-_./]/g, ''); // Allow only safe characters
  },
  
  // Sanitize URLs
  sanitizeUrl: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  }
};

// Common validation patterns
export const patterns = {
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  username: /^[a-zA-Z0-9_-]{3,30}$/,
  hexColor: /^#[0-9A-F]{6}$/i,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  base64: /^[A-Za-z0-9+/]*(={0,2})$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  mongoId: /^[a-f\d]{24}$/i,
  cuid: /^c[^\s-]{8,}$/i,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

// Type guards for common validations
export const guards = {
  isEmail: (value: unknown): value is string => {
    return typeof value === 'string' && z.string().email().safeParse(value).success;
  },
  
  isUrl: (value: unknown): value is string => {
    return typeof value === 'string' && z.string().url().safeParse(value).success;
  },
  
  isUuid: (value: unknown): value is string => {
    return typeof value === 'string' && patterns.uuid.test(value);
  },
  
  isCuid: (value: unknown): value is string => {
    return typeof value === 'string' && patterns.cuid.test(value);
  },
  
  isMongoId: (value: unknown): value is string => {
    return typeof value === 'string' && patterns.mongoId.test(value);
  }
};

// Export all schemas
export * from './schemas/common';
export * from './schemas/user';
export * from './schemas/project';
export * from './schemas/facility';
export * from './schemas/payment';
export * from './schemas/api';