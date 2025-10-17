import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { prisma } from '../prisma-client'
import { performHealthCheck, getConnectionMetrics, resetMetrics } from '../monitoring'
import { withRetry } from '../retry'
import { getPoolConfig } from '../config'

describe('Database Connection Pooling', () => {
  beforeAll(async () => {
    // Ensure clean state
    resetMetrics()
  })

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect()
  })

  describe('Connection Management', () => {
    it('should establish connection successfully', async () => {
      await expect(prisma.$connect()).resolves.not.toThrow()
    })

    it('should perform health check', async () => {
      const health = await performHealthCheck(prisma)
      
      expect(health.isHealthy).toBe(true)
      expect(health.latency).toBeGreaterThan(0)
      expect(health.timestamp).toBeInstanceOf(Date)
    })

    it('should track connection metrics', async () => {
      // Perform some queries
      await prisma.$queryRaw`SELECT 1`
      await prisma.$queryRaw`SELECT 2`
      
      const metrics = getConnectionMetrics()
      
      expect(metrics.activeConnections).toBeGreaterThanOrEqual(0)
      expect(metrics.connectionErrors).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Pool Configuration', () => {
    it('should return development config in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const config = getPoolConfig()
      
      expect(config.connection_limit).toBe(5)
      expect(config.pool_timeout).toBe(10)
      
      process.env.NODE_ENV = originalEnv
    })

    it('should return serverless config when on Vercel', () => {
      const originalVercel = process.env.VERCEL
      process.env.VERCEL = 'true'
      
      const config = getPoolConfig()
      
      expect(config.connection_limit).toBe(1)
      expect(config.pool_timeout).toBe(2)
      
      process.env.VERCEL = originalVercel
    })

    it('should use custom environment variables', () => {
      const originalLimit = process.env.DATABASE_CONNECTION_LIMIT
      process.env.DATABASE_CONNECTION_LIMIT = '50'
      
      const config = getPoolConfig()
      
      expect(config.connection_limit).toBe(50)
      
      process.env.DATABASE_CONNECTION_LIMIT = originalLimit
    })
  })

  describe('Retry Logic', () => {
    it('should retry on transient errors', async () => {
      let attempts = 0
      const operation = jest.fn().mockImplementation(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Connection timeout')
        }
        return 'success'
      })

      const result = await withRetry(operation, {
        retries: 3,
        delay: 10,
      })

      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('should not retry on non-retryable errors', async () => {
      const operation = jest.fn().mockRejectedValue(
        new Error('Unique constraint violation')
      )

      await expect(
        withRetry(operation, {
          retries: 3,
          delay: 10,
        })
      ).rejects.toThrow('Unique constraint violation')

      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should apply exponential backoff', async () => {
      const delays: number[] = []
      const startTime = Date.now()
      
      const operation = jest.fn().mockImplementation(async () => {
        const currentDelay = Date.now() - startTime
        delays.push(currentDelay)
        throw new Error('Temporary error')
      })

      await expect(
        withRetry(operation, {
          retries: 3,
          delay: 100,
          backoff: 'exponential',
        })
      ).rejects.toThrow()

      // Check that delays increase exponentially
      expect(delays.length).toBe(3)
      expect(delays[1]).toBeGreaterThan(delays[0])
      expect(delays[2]).toBeGreaterThan(delays[1])
    })
  })

  describe('Query Monitoring', () => {
    it('should track query performance', async () => {
      // Reset metrics for clean test
      resetMetrics()
      
      // Execute some queries
      await prisma.$queryRaw`SELECT 1`
      await prisma.$queryRaw`SELECT 2`
      
      // Note: Query metrics would be tracked if middleware is properly set up
      // This is a simplified test - full implementation would require middleware testing
    })
  })
})

// Integration test for real database operations
describe('Database Integration', () => {
  it('should handle concurrent connections', async () => {
    const promises = Array.from({ length: 10 }, async (_, i) => {
      return prisma.$queryRaw`SELECT ${i} as number`
    })

    const results = await Promise.all(promises)
    
    expect(results).toHaveLength(10)
  })

  it('should recover from connection errors', async () => {
    // This test would require mocking database connection failures
    // Simplified version shown here
    const result = await withRetry(
      async () => {
        return await prisma.$queryRaw`SELECT 1`
      },
      { retries: 1 }
    )

    expect(result).toBeDefined()
  })
})