import { PrismaClient } from '@prisma/client'
import { getDatabaseConfig } from './config'
import { instrumentPrisma } from './monitoring'
import { withRetry } from './retry'
import type { DatabaseConfig } from './types'

// Extend PrismaClient for custom functionality
class ExtendedPrismaClient extends PrismaClient {
  private connectionCheckInterval?: NodeJS.Timeout
  private lastHealthCheck?: Date
  private isHealthy: boolean = true

  constructor(config: DatabaseConfig) {
    const { datasources, log } = config
    
    super({
      datasources,
      log,
      errorFormat: 'minimal',
    })

    // Setup connection health monitoring
    if (process.env.NODE_ENV === 'production') {
      this.setupHealthMonitoring()
    }
  }

  private setupHealthMonitoring() {
    // Check connection health every 30 seconds
    this.connectionCheckInterval = setInterval(async () => {
      try {
        await this.$queryRaw`SELECT 1`
        this.isHealthy = true
        this.lastHealthCheck = new Date()
      } catch (error) {
        this.isHealthy = false
        logger.error('api', '[Prisma] Health check failed:', error )
      }
    }, 30000)
  }

  async $connect() {
    return withRetry(
      async () => {
        await super.$connect()
        logger.info('api', '[Prisma] Connected to database')
      },
      {
        retries: 3,
        delay: 1000,
        onRetry: (error, attempt) => {
          logger.warn('api', `[Prisma] Connection attempt ${attempt} failed:`, { data: error })
        }
      }
    )
  }

  async $disconnect() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
    }
    await super.$disconnect()
    logger.info('api', '[Prisma] Disconnected from database')
  }

  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastHealthCheck: this.lastHealthCheck,
    }
  }
}

// Global Prisma client instance management
const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

// Create Prisma client with proper configuration
export function createPrismaClient(): ExtendedPrismaClient {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    throw new Error('createPrismaClient() can only be called on the server')
  }
  
  const config = getDatabaseConfig()
  const client = new ExtendedPrismaClient(config)
  
  // Instrument for monitoring
  if (process.env.NODE_ENV === 'production') {
    return instrumentPrisma(client)
  }
  
  return client
}

// Singleton pattern for Prisma client - only initialize on server
export const prisma = typeof window === 'undefined' 
  ? globalForPrisma.prisma ?? createPrismaClient()
  : null as any

// Prevent multiple instances in development - only on server
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown handling - only on server
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}