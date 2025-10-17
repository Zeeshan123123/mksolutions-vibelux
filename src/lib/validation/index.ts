// Central export for all validation utilities

// Export main validator and utilities
export {
  validate,
  safeParse,
  validateRequest,
  validateQueryParams,
  createValidationMiddleware,
  createValidatedHandler,
  sanitizers,
  patterns,
  guards,
  formatZodError,
  type ValidationResult
} from './zod-validator';

// Export all middleware
export {
  withValidation,
  withAuth,
  withRateLimit,
  withMiddlewares,
  withCors,
  withSecurityHeaders,
  withLogging,
  type ValidationOptions,
  type AuthOptions,
  type RateLimitOptions
} from './middleware';

// Export all schemas
export * from './schemas/common';
export * from './schemas/user';
export * from './schemas/project';
export * from './schemas/facility';
export * from './schemas/payment';
export * from './schemas/api';

// Re-export Zod types for convenience
export { z, ZodError, ZodSchema, ZodType } from 'zod';