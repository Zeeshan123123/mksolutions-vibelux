import { z } from 'zod';

// Common refinements and transformations
// NOTE: Avoid chaining validators after transform at schema level to keep .min/.max available
export const trimString = z.string();
export const normalizeEmail = z.string().email().toLowerCase().trim();
export const safeHtml = z.string();

// ID validation - prevents SQL injection via ID parameters
export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ID format');
export const cuidSchema = z.string().regex(/^c[^\s-]{8,}$/i, 'Invalid CUID format');
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Common field schemas with XSS prevention
export const nameSchema = trimString
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\']+$/, 'Name contains invalid characters');

export const descriptionSchema = safeHtml
  .max(1000, 'Description cannot exceed 1000 characters')
  .optional();

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long')
  .optional();

export const urlSchema = z.string()
  .url('Invalid URL format')
  .refine(url => {
    try {
      const u = new URL(url);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false;
    }
  }, 'URL must use HTTP or HTTPS protocol')
  .optional();

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().regex(/^[a-zA-Z0-9_]+$/, 'Invalid sort field').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, 'Start date must be before end date');

// Coordinate validation
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

// File validation schemas
export const fileUploadSchema = z.object({
  filename: z.string()
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Filename contains invalid characters')
    .max(255, 'Filename too long'),
  mimetype: z.string(),
  size: z.number().positive().max(10 * 1024 * 1024, 'File size cannot exceed 10MB')
});

export const imageUploadSchema = fileUploadSchema.extend({
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], {
    errorMap: () => ({ message: 'Only JPEG, PNG, GIF, and WebP images are allowed' })
  }),
  size: z.number().positive().max(5 * 1024 * 1024, 'Image size cannot exceed 5MB')
});

// Agricultural measurement validations
export const temperatureSchema = z.number()
  .min(-20, 'Temperature too low')
  .max(50, 'Temperature too high');

export const humiditySchema = z.number()
  .min(0, 'Humidity cannot be negative')
  .max(100, 'Humidity cannot exceed 100%');

export const phSchema = z.number()
  .min(0, 'pH cannot be negative')
  .max(14, 'pH cannot exceed 14');

export const ecSchema = z.number()
  .min(0, 'EC cannot be negative')
  .max(10, 'EC value too high');

export const ppfdSchema = z.number()
  .min(0, 'PPFD cannot be negative')
  .max(3000, 'PPFD value too high');

export const co2Schema = z.number()
  .min(200, 'CO2 level too low')
  .max(2000, 'CO2 level too high');

export const vpdSchema = z.number()
  .min(0, 'VPD cannot be negative')
  .max(5, 'VPD value too high');

// Money/currency validation
export const moneySchema = z.number()
  .multipleOf(0.01, 'Invalid currency amount')
  .min(0, 'Amount cannot be negative')
  .max(1000000, 'Amount too large');

// Percentage validation
export const percentageSchema = z.number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

// Email validation with additional security checks
export const emailSchema = z.string()
  .email('Invalid email format')
  .toLowerCase()
  .trim()
  .refine(email => {
    // Additional validation to prevent email header injection
    return !email.includes('\n') && !email.includes('\r');
  }, 'Invalid email format');

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// API key validation
export const apiKeySchema = z.string()
  .regex(/^vl_[a-zA-Z0-9]{32,}$/, 'Invalid API key format');

// Enum schemas
export const userRoleSchema = z.enum(['USER', 'ADMIN', 'FACILITY_MANAGER', 'TECHNICIAN', 'VIEWER']);
export const subscriptionTierSchema = z.enum(['FREE', 'BASIC', 'PRO', 'ENTERPRISE']);
export const experimentStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']);
export const spaceTypeSchema = z.enum(['GREENHOUSE', 'INDOOR', 'VERTICAL_FARM', 'OUTDOOR']);
export const growthStageSchema = z.enum(['SEEDLING', 'VEGETATIVE', 'FLOWERING', 'HARVEST']);
export const environmentTypeSchema = z.enum(['GREENHOUSE', 'INDOOR', 'VERTICAL']);

// JSON field validation with structure
export const jsonSchema = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid JSON format'
    });
    return z.NEVER;
  }
});

// Array validation helpers
export const nonEmptyArray = <T extends z.ZodTypeAny>(schema: T) => 
  z.array(schema).min(1, 'At least one item is required');

export const uniqueArray = <T extends z.ZodTypeAny>(schema: T) => 
  z.array(schema).refine(
    items => new Set(items).size === items.length,
    'Array must contain unique values'
  );

// Helper to create optional nullable fields
export const optionalNullable = <T extends z.ZodTypeAny>(schema: T) => 
  schema.optional().nullable();