/**
 * API Errors Tests
 */

import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InsufficientCreditsError
} from '@/lib/error-handler'

describe('API Errors', () => {
  describe('AppError', () => {
    it('should create error with code, message and status code', () => {
      const error = new AppError('BAD_REQUEST', 'Test error', 400)
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('BAD_REQUEST')
      expect(error.name).toBe('AppError')
      expect(error instanceof Error).toBe(true)
    })

    it('should have correct prototype chain', () => {
      const error = new AppError('INTERNAL_ERROR', 'Test error', 500)
      
      expect(error instanceof AppError).toBe(true)
      expect(error instanceof Error).toBe(true)
      expect(error.stack).toBeDefined()
    })

    it('should preserve stack trace', () => {
      const error = new AppError('INTERNAL_ERROR', 'Test error', 500)
      
      expect(error.stack).toContain('AppError')
      expect(error.stack).toContain('api-errors.test.ts')
    })

    it('should accept optional details', () => {
      const details = { field: 'email', reason: 'invalid format' }
      const error = new AppError('VALIDATION_ERROR', 'Invalid input', 400, details)
      
      expect(error.details).toEqual(details)
    })
  })

  describe('AuthenticationError', () => {
    it('should create error with 401 status code', () => {
      const error = new AuthenticationError()
      
      expect(error.message).toBe('Authentication required')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.name).toBe('AuthenticationError')
    })

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token')
      
      expect(error.message).toBe('Invalid token')
      expect(error.statusCode).toBe(401)
    })

    it('should inherit from APIError', () => {
      const error = new AuthenticationError()
      
      expect(error instanceof AuthenticationError).toBe(true)
      expect(error instanceof APIError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('AuthorizationError', () => {
    it('should create error with 403 status code', () => {
      const error = new AuthorizationError()
      
      expect(error.message).toBe('Insufficient permissions')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
      expect(error.name).toBe('AuthorizationError')
    })

    it('should accept custom message', () => {
      const error = new AuthorizationError('Admin access required')
      
      expect(error.message).toBe('Admin access required')
      expect(error.statusCode).toBe(403)
    })
  })

  describe('ValidationError', () => {
    it('should create error with 400 status code', () => {
      const error = new ValidationError()
      
      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.name).toBe('ValidationError')
      expect(error.details).toBeUndefined()
    })

    it('should accept custom message and details', () => {
      const details = {
        email: 'Invalid email format',
        password: 'Too short'
      }
      const error = new ValidationError('Invalid input', details)
      
      expect(error.message).toBe('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual(details)
    })

    it('should handle array details', () => {
      const details = ['Field 1 is required', 'Field 2 is invalid']
      const error = new ValidationError('Multiple errors', details)
      
      expect(error.details).toEqual(details)
    })
  })

  describe('NotFoundError', () => {
    it('should create error with 404 status code', () => {
      const error = new NotFoundError()
      
      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND_ERROR')
      expect(error.name).toBe('NotFoundError')
    })

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found')
      
      expect(error.message).toBe('User not found')
      expect(error.statusCode).toBe(404)
    })
  })

  describe('ConflictError', () => {
    it('should create error with 409 status code', () => {
      const error = new ConflictError()
      
      expect(error.message).toBe('Resource already exists')
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT_ERROR')
      expect(error.name).toBe('ConflictError')
    })

    it('should accept custom message', () => {
      const error = new ConflictError('Email already in use')
      
      expect(error.message).toBe('Email already in use')
      expect(error.statusCode).toBe(409)
    })
  })

  describe('RateLimitError', () => {
    it('should create error with 429 status code', () => {
      const error = new RateLimitError()
      
      expect(error.message).toBe('Too many requests')
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMITED')
      expect(error.name).toBe('RateLimitError')
      expect(error.retryAfter).toBeUndefined()
    })

    it('should accept custom message and retry after', () => {
      const error = new RateLimitError('Rate limit exceeded', 60)
      
      expect(error.message).toBe('Rate limit exceeded')
      expect(error.statusCode).toBe(429)
      expect(error.retryAfter).toBe(60)
    })

    it('should handle zero retry after', () => {
      const error = new RateLimitError('Limited', 0)
      
      expect(error.retryAfter).toBe(0)
    })
  })

  describe('InsufficientCreditsError', () => {
    it('should create error with 402 status code', () => {
      const error = new InsufficientCreditsError(100, 50)
      
      expect(error.message).toBe('Insufficient credits for this operation')
      expect(error.statusCode).toBe(402)
      expect(error.code).toBe('INSUFFICIENT_CREDITS')
      expect(error.details).toEqual({ required: 100, available: 50 })
    })
  })

  describe('Error serialization', () => {
    it('should serialize AppError to JSON', () => {
      const error = new AppError('BAD_REQUEST', 'Test error', 400)
      const json = JSON.parse(JSON.stringify(error))
      
      expect(json.message).toBe('Test error')
      expect(json.statusCode).toBe(400)
      expect(json.code).toBe('BAD_REQUEST')
      expect(json.name).toBe('AppError')
    })

    it('should serialize ValidationError with details', () => {
      const details = { field: 'Invalid' }
      const error = new ValidationError('Validation failed', details)
      const json = JSON.parse(JSON.stringify(error))
      
      expect(json.message).toBe('Validation failed')
      expect(json.details).toEqual(details)
    })

    it('should serialize RateLimitError with retryAfter', () => {
      const error = new RateLimitError('Limited', 30)
      const json = JSON.parse(JSON.stringify(error))
      
      expect(json.retryAfter).toBe(30)
    })
  })

  describe('Error comparison', () => {
    it('should compare error types correctly', () => {
      const authError = new AuthenticationError()
      const authzError = new AuthorizationError()
      const validationError = new ValidationError()
      
      expect(authError instanceof AuthenticationError).toBe(true)
      expect(authError instanceof AuthorizationError).toBe(false)
      expect(authError instanceof ValidationError).toBe(false)
      
      expect(authzError instanceof AuthorizationError).toBe(true)
      expect(authzError instanceof AuthenticationError).toBe(false)
      
      expect(validationError instanceof ValidationError).toBe(true)
      expect(validationError instanceof AuthenticationError).toBe(false)
    })

    it('should all inherit from AppError', () => {
      const errors = [
        new AuthenticationError(),
        new AuthorizationError(),
        new ValidationError({}),
        new NotFoundError(),
        new ConflictError(),
        new RateLimitError(),
        new InsufficientCreditsError(10, 5)
      ]
      
      errors.forEach(error => {
        expect(error instanceof AppError).toBe(true)
        expect(error instanceof Error).toBe(true)
      })
    })
  })
})