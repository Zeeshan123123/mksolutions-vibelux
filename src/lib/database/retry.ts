import type { RetryOptions } from './types'

// Default retry options
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  retries: 3,
  delay: 1000,
  maxDelay: 30000,
  backoff: 'exponential',
}

// Retry logic for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw error
      }
      
      // Last attempt, throw the error
      if (attempt === config.retries) {
        throw error
      }
      
      // Calculate delay with backoff
      const delay = calculateDelay(attempt, config)
      
      // Call onRetry callback if provided
      if (config.onRetry) {
        config.onRetry(lastError, attempt)
      }
      
      // Wait before next attempt
      await sleep(delay)
    }
  }
  
  throw lastError || new Error('Retry failed')
}

// Calculate delay with backoff strategy
function calculateDelay(attempt: number, config: RetryOptions): number {
  let delay = config.delay
  
  if (config.backoff === 'exponential') {
    delay = Math.min(config.delay * Math.pow(2, attempt - 1), config.maxDelay || 30000)
  } else if (config.backoff === 'linear') {
    delay = Math.min(config.delay * attempt, config.maxDelay || 30000)
  }
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay
  return Math.floor(delay + jitter)
}

// Check if error should not be retried
function isNonRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  
  const message = error.message.toLowerCase()
  
  // Don't retry on authentication errors
  if (message.includes('authentication') || message.includes('unauthorized')) {
    return true
  }
  
  // Don't retry on invalid query errors
  if (message.includes('syntax error') || message.includes('invalid query')) {
    return true
  }
  
  // Don't retry on constraint violations
  if (message.includes('unique constraint') || message.includes('foreign key constraint')) {
    return true
  }
  
  return false
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry decorator for class methods
export function RetryableOperation(options?: Partial<RetryOptions>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), options)
    }
    
    return descriptor
  }
}