import { z } from 'zod';

/**
 * Enhanced Input Validation and Sanitization
 * Provides additional security layers beyond Prisma's built-in protection
 */

// UUID validation schema
export const uuidSchema = z.string().uuid('Invalid UUID format');

// SQL injection protection - additional sanitization
export const sqlSafeString = z.string()
  .min(1)
  .max(1000)
  .refine((val) => {
    // Block common SQL injection patterns (defense in depth)
    const sqlInjectionPatterns = [
      /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(--|\#|\/\*|\*\/)/g,
      /('|"|;|\||&)/g
    ];
    
    return !sqlInjectionPatterns.some(pattern => pattern.test(val));
  }, 'Invalid characters detected');

// Facility ID validation
export const facilityIdSchema = z.string()
  .min(1, 'Facility ID is required')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid facility ID format');

// Zone ID validation  
export const zoneIdSchema = z.string()
  .min(1, 'Zone ID is required')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid zone ID format');

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date"
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).optional()
});

// Search query validation
export const searchQuerySchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Invalid search query format');

// Numeric ID validation
export const numericIdSchema = z.coerce.number().int().positive();

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Phone validation
export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Image validation
export const imageUploadSchema = z.object({
  imageBase64: z.string()
    .regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid base64 format')
    .max(10 * 1024 * 1024, 'Image too large (max 10MB)'), // Base64 encoded size
  filename: z.string()
    .regex(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i, 'Invalid filename or format'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'])
});

// Coordinate validation
export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional()
});

// File path validation (prevent path traversal)
export const safeFilePathSchema = z.string()
  .regex(/^[a-zA-Z0-9._/-]+$/, 'Invalid file path')
  .refine((path) => {
    // Prevent path traversal attacks
    return !path.includes('..') && !path.startsWith('/') && !path.includes('//');
  }, 'Unsafe file path detected');

// API key validation
export const apiKeySchema = z.string()
  .min(32, 'API key too short')
  .max(128, 'API key too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid API key format');

// Rate limiting key validation
export const rateLimitKeySchema = z.string()
  .max(100)
  .regex(/^[a-zA-Z0-9:._-]+$/, 'Invalid rate limit key');

/**
 * Sanitizes a string to prevent XSS and other injection attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"&]/g, '') // Remove dangerous HTML chars
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validates and sanitizes facility access parameters
 */
export const facilityAccessSchema = z.object({
  facilityId: facilityIdSchema,
  userId: uuidSchema.optional(),
  role: z.enum(['owner', 'admin', 'operator', 'viewer']).optional()
});

/**
 * Validates sensor data input
 */
export const sensorDataSchema = z.object({
  sensorId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  sensorType: z.enum(['temperature', 'humidity', 'co2', 'ph', 'ec', 'light', 'pressure']),
  value: z.number().finite(),
  unit: z.string().max(20).regex(/^[a-zA-Z0-9/%°-]+$/),
  timestamp: z.coerce.date().optional(),
  quality: z.enum(['good', 'questionable', 'poor']).default('good')
});

/**
 * Enhanced error handling for validation failures
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Middleware function to validate and sanitize request data
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (data: unknown): Promise<T> => {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          `Validation failed: ${error.errors.map(e => e.message).join(', ')}`,
          error.errors[0]?.path?.join('.'),
          'VALIDATION_ERROR'
        );
      }
      throw error;
    }
  };
}

/**
 * Database-safe parameter validation for raw queries
 * Additional layer even though Prisma handles parameterization
 */
export function validateDbParameter(value: unknown, type: 'string' | 'number' | 'boolean' | 'uuid'): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string' && value.length > 0 && value.length < 1000;
    case 'number':
      return typeof value === 'number' && isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'uuid':
      return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    default:
      return false;
  }
}

export default {
  uuidSchema,
  sqlSafeString,
  facilityIdSchema,
  zoneIdSchema,
  dateRangeSchema,
  paginationSchema,
  searchQuerySchema,
  numericIdSchema,
  emailSchema,
  phoneSchema,
  imageUploadSchema,
  coordinateSchema,
  safeFilePathSchema,
  apiKeySchema,
  rateLimitKeySchema,
  facilityAccessSchema,
  sensorDataSchema,
  sanitizeString,
  validateRequest,
  validateDbParameter,
  ValidationError
};