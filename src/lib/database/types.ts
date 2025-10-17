export interface PoolConfig {
  // Maximum number of connections in the pool
  connection_limit: number
  
  // Time to wait for a connection from the pool (seconds)
  pool_timeout: number
  
  // Time before idle connections are closed (seconds)
  idle_in_transaction_session_timeout: number
  
  // Maximum time for a statement to execute (milliseconds)
  statement_timeout: number
  
  // Time to wait for a connection to be established (seconds)
  connect_timeout: number
}

export interface DatabaseConfig {
  datasources: {
    db: {
      url: string
    }
  }
  log: ('query' | 'info' | 'warn' | 'error')[]
}

export interface ConnectionMetrics {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
  connectionErrors: number
  lastError?: Error
  lastErrorTime?: Date
}

export interface HealthCheckResult {
  isHealthy: boolean
  latency?: number
  error?: string
  timestamp: Date
  metrics?: ConnectionMetrics
}

export interface RetryOptions {
  retries: number
  delay: number
  maxDelay?: number
  backoff?: 'linear' | 'exponential'
  onRetry?: (error: Error, attempt: number) => void
}