// Re-export everything from the database module
export { prisma } from './prisma-client'
export { 
  performHealthCheck, 
  getConnectionMetrics, 
  getQueryMetrics,
  getMonitoringData 
} from './monitoring'
export { withRetry, RetryableOperation } from './retry'
export { getDatabaseConfig, getPoolConfig, validateDatabaseConfig } from './config'
export type { 
  DatabaseConfig, 
  PoolConfig, 
  ConnectionMetrics, 
  HealthCheckResult,
  RetryOptions 
} from './types'

// Re-export Prisma for convenience
export { Prisma } from '@prisma/client'