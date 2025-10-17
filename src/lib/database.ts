/**
 * Main database module with connection pooling and health monitoring
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from '@/lib/logging/production-logger';

// Global connection pooling
declare global {
  var __prisma: PrismaClient | undefined
}

// Initialize Prisma client with connection pooling
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Re-export Prisma types
export { Prisma }

// Connection metrics tracking
interface ConnectionMetrics {
  activeConnections: number
  totalQueries: number
  avgQueryTime: number
  errors: number
  lastHealthCheck: Date
}

const connectionMetrics: ConnectionMetrics = {
  activeConnections: 0,
  totalQueries: 0,
  avgQueryTime: 0,
  errors: 0,
  lastHealthCheck: new Date()
}

// Health check function
export async function performHealthCheck(client: PrismaClient = prisma): Promise<{
  isHealthy: boolean
  latency: number
  version: string
  timestamp: Date
}> {
  const startTime = Date.now()
  
  try {
    // Simple health check query
    await client.$queryRaw`SELECT 1 as health`
    
    const latency = Date.now() - startTime
    connectionMetrics.lastHealthCheck = new Date()
    
    return {
      isHealthy: true,
      latency,
      version: '1.0.0',
      timestamp: new Date()
    }
  } catch (error) {
    connectionMetrics.errors++
    return {
      isHealthy: false,
      latency: Date.now() - startTime,
      version: '1.0.0',
      timestamp: new Date()
    }
  }
}

// Get connection metrics
export function getConnectionMetrics(): ConnectionMetrics {
  return { ...connectionMetrics }
}

// Get query metrics (simplified)
export function getQueryMetrics(): {
  totalQueries: number
  avgQueryTime: number
  errors: number
} {
  return {
    totalQueries: connectionMetrics.totalQueries,
    avgQueryTime: connectionMetrics.avgQueryTime,
    errors: connectionMetrics.errors
  }
}

// Retry wrapper for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()
      return result
    } catch (error) {
      lastError = error as Error
      connectionMetrics.errors++
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

// Graceful shutdown
async function gracefulShutdown() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    logger.error('api', 'Error during database disconnect:', error)
  }
}

// Register shutdown handlers
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('beforeExit', gracefulShutdown)

// Get monitoring data for health checks
export async function getMonitoringData() {
  const health = await performHealthCheck()
  const connectionMetrics = getConnectionMetrics()
  const queryMetrics = getQueryMetrics()
  
  return {
    health,
    connections: {
      active: connectionMetrics.activeConnections,
      lastCheck: connectionMetrics.lastHealthCheck
    },
    queries: queryMetrics,
    timestamp: new Date()
  }
}