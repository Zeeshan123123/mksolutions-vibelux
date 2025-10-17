import type { DatabaseConfig, PoolConfig } from './types'

// Get pool configuration based on environment
export function getPoolConfig(): PoolConfig {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    throw new Error('getPoolConfig() can only be called on the server')
  }
  
  const isProduction = process.env.NODE_ENV === 'production'
  const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
  
  // Base configuration
  const baseConfig: PoolConfig = {
    // Connection pool size
    connection_limit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
    
    // Pool timeout in milliseconds
    pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10'),
    
    // Idle timeout in milliseconds
    idle_in_transaction_session_timeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '10'),
    
    // Statement timeout in milliseconds
    statement_timeout: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT || '5000'),
    
    // Connect timeout in milliseconds
    connect_timeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10'),
  }

  // Serverless optimizations
  if (isServerless) {
    return {
      ...baseConfig,
      // Smaller pool for serverless
      connection_limit: 1,
      // Shorter timeouts for serverless
      pool_timeout: 2,
      idle_in_transaction_session_timeout: 5,
      // Faster connection timeout
      connect_timeout: 5,
    }
  }

  // Production configuration
  if (isProduction) {
    return {
      ...baseConfig,
      // Larger pool for production
      connection_limit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '25'),
      // Longer timeouts for production
      pool_timeout: 20,
      idle_in_transaction_session_timeout: 20,
      statement_timeout: 10000,
      connect_timeout: 15,
    }
  }

  // Development configuration
  return {
    ...baseConfig,
    // Smaller pool for development
    connection_limit: 5,
    pool_timeout: 10,
    idle_in_transaction_session_timeout: 10,
    statement_timeout: 5000,
    connect_timeout: 10,
  }
}

// Build database URL with connection pooling parameters
export function buildDatabaseUrl(): string {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    throw new Error('buildDatabaseUrl() can only be called on the server')
  }
  
  const baseUrl = process.env.DATABASE_URL || ''
  
  if (!baseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  const poolConfig = getPoolConfig()
  const url = new URL(baseUrl)
  
  // Add pooling parameters to the connection string
  url.searchParams.set('connection_limit', poolConfig.connection_limit.toString())
  url.searchParams.set('pool_timeout', poolConfig.pool_timeout.toString())
  url.searchParams.set('idle_in_transaction_session_timeout', poolConfig.idle_in_transaction_session_timeout.toString())
  url.searchParams.set('statement_timeout', poolConfig.statement_timeout.toString())
  url.searchParams.set('connect_timeout', poolConfig.connect_timeout.toString())
  
  // Add pgbouncer mode for better connection pooling if specified
  if (process.env.DATABASE_POOLING_MODE) {
    url.searchParams.set('pgbouncer', process.env.DATABASE_POOLING_MODE)
  }
  
  // Add schema if specified
  if (process.env.DATABASE_SCHEMA) {
    url.searchParams.set('schema', process.env.DATABASE_SCHEMA)
  }
  
  return url.toString()
}

// Get complete database configuration
export function getDatabaseConfig(): DatabaseConfig {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    throw new Error('getDatabaseConfig() can only be called on the server')
  }
  
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Determine log levels
  const logLevels = []
  
  if (isDevelopment) {
    logLevels.push('query', 'info', 'warn', 'error')
  } else if (process.env.DATABASE_LOG_QUERIES === 'true') {
    logLevels.push('query', 'error')
  } else {
    logLevels.push('error')
  }
  
  return {
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
    log: logLevels as any,
  }
}

// Validate database configuration
export function validateDatabaseConfig(): void {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    throw new Error('validateDatabaseConfig() can only be called on the server')
  }
  
  const requiredEnvVars = ['DATABASE_URL']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
  
  // Validate URL format
  try {
    new URL(process.env.DATABASE_URL!)
  } catch (error) {
    throw new Error('DATABASE_URL is not a valid URL')
  }
}