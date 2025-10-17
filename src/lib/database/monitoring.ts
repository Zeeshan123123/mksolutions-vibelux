import { PrismaClient } from '@prisma/client'
import type { ConnectionMetrics, HealthCheckResult } from './types'

// Connection metrics storage
const connectionMetrics: ConnectionMetrics = {
  totalConnections: 0,
  activeConnections: 0,
  idleConnections: 0,
  waitingRequests: 0,
  connectionErrors: 0,
}

// Track query performance
interface QueryMetrics {
  count: number
  totalDuration: number
  errors: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: Date
  }>
}

const queryMetrics: QueryMetrics = {
  count: 0,
  totalDuration: 0,
  errors: 0,
  slowQueries: [],
}

// Slow query threshold in milliseconds
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000')

// Instrument Prisma client for monitoring
export function instrumentPrisma<T extends PrismaClient>(client: T): T {
  // Use Prisma middleware for query monitoring
  client.$use(async (params, next) => {
    const startTime = Date.now()
    
    try {
      connectionMetrics.activeConnections++
      const result = await next(params)
      
      // Track query metrics
      const duration = Date.now() - startTime
      queryMetrics.count++
      queryMetrics.totalDuration += duration
      
      // Log slow queries
      if (duration > SLOW_QUERY_THRESHOLD) {
        const slowQuery = {
          query: `${params.model}.${params.action}`,
          duration,
          timestamp: new Date(),
        }
        
        queryMetrics.slowQueries.push(slowQuery)
        
        // Keep only last 100 slow queries
        if (queryMetrics.slowQueries.length > 100) {
          queryMetrics.slowQueries.shift()
        }
        
        logger.warn('api', `[Prisma] Slow query detected:`, { data: slowQuery })
      }
      
      return result
    } catch (error) {
      connectionMetrics.connectionErrors++
      connectionMetrics.lastError = error as Error
      connectionMetrics.lastErrorTime = new Date()
      queryMetrics.errors++
      
      throw error
    } finally {
      connectionMetrics.activeConnections--
    }
  })
  
  return client
}

// Get current connection metrics
export function getConnectionMetrics(): ConnectionMetrics {
  return { ...connectionMetrics }
}

// Get query performance metrics
export function getQueryMetrics() {
  const avgDuration = queryMetrics.count > 0 
    ? queryMetrics.totalDuration / queryMetrics.count 
    : 0
    
  return {
    totalQueries: queryMetrics.count,
    totalDuration: queryMetrics.totalDuration,
    averageDuration: avgDuration,
    errorCount: queryMetrics.errors,
    errorRate: queryMetrics.count > 0 ? queryMetrics.errors / queryMetrics.count : 0,
    slowQueries: [...queryMetrics.slowQueries],
  }
}

// Perform health check on database connection
export async function performHealthCheck(prisma: PrismaClient): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1`
    
    const latency = Date.now() - startTime
    
    return {
      isHealthy: true,
      latency,
      timestamp: new Date(),
      metrics: getConnectionMetrics(),
    }
  } catch (error) {
    return {
      isHealthy: false,
      error: (error as Error).message,
      timestamp: new Date(),
      metrics: getConnectionMetrics(),
    }
  }
}

// Export metrics for monitoring endpoints
export function getMonitoringData() {
  return {
    connection: getConnectionMetrics(),
    queries: getQueryMetrics(),
    timestamp: new Date(),
  }
}

// Reset metrics (useful for testing)
export function resetMetrics() {
  connectionMetrics.totalConnections = 0
  connectionMetrics.activeConnections = 0
  connectionMetrics.idleConnections = 0
  connectionMetrics.waitingRequests = 0
  connectionMetrics.connectionErrors = 0
  connectionMetrics.lastError = undefined
  connectionMetrics.lastErrorTime = undefined
  
  queryMetrics.count = 0
  queryMetrics.totalDuration = 0
  queryMetrics.errors = 0
  queryMetrics.slowQueries = []
}