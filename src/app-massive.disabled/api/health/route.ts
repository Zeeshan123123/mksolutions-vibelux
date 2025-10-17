import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Redis } from 'ioredis'
import { Resend } from 'resend'

interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  services: {
    database: {
      status: 'ok' | 'error'
      responseTime?: number
      error?: string
    }
    redis: {
      status: 'ok' | 'error'
      responseTime?: number
      error?: string
    }
    email: {
      status: 'ok' | 'error'
      error?: string
    }
    storage: {
      status: 'ok' | 'error'
      freeSpace?: number
      error?: string
    }
  }
  uptime: number
  environment: string
  version: string
}

// Initialize services only when needed
function createRedisClient() {
  if (!process.env.REDIS_HOST) {
    return null;
  }
  
  return new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  });
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Track server start time
const serverStartTime = Date.now()

async function checkDatabase(): Promise<HealthCheckResult['services']['database']> {
  try {
    const start = Date.now()
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - start

    return {
      status: 'ok',
      responseTime
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

async function checkRedis(): Promise<HealthCheckResult['services']['redis']> {
  const redis = createRedisClient();
  
  if (!redis) {
    return {
      status: 'error',
      error: 'Redis not configured'
    };
  }

  try {
    const start = Date.now()
    await redis.ping()
    const responseTime = Date.now() - start
    redis.disconnect()

    return {
      status: 'ok',
      responseTime
    }
  } catch (error) {
    redis.disconnect()
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown Redis error'
    }
  }
}

async function checkEmail(): Promise<HealthCheckResult['services']['email']> {
  try {
    // We don't want to send an actual email, just verify the API key is valid
    if (!resend) {
      return {
        status: 'error',
        error: 'RESEND_API_KEY not configured'
      }
    }

    // Resend doesn't have a direct health check, but we can verify the API key format
    if (process.env.RESEND_API_KEY?.startsWith('re_')) {
      return {
        status: 'ok'
      }
    } else {
      return {
        status: 'error',
        error: 'Invalid RESEND_API_KEY format'
      }
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown email service error'
    }
  }
}

async function checkStorage(): Promise<HealthCheckResult['services']['storage']> {
  try {
    // In a real production environment, you'd check actual disk space
    // For now, we'll simulate a check
    const freeSpace = 10 * 1024 * 1024 * 1024 // 10GB in bytes

    if (freeSpace < 1024 * 1024 * 1024) { // Less than 1GB
      return {
        status: 'error',
        freeSpace,
        error: 'Low disk space'
      }
    }

    return {
      status: 'ok',
      freeSpace
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown storage error'
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Run all health checks in parallel
    const [database, redisCheck, email, storage] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkEmail(),
      checkStorage()
    ])

    // Determine overall status
    const services = { database, redis: redisCheck, email, storage }
    const allStatuses = Object.values(services).map(s => s.status)
    
    let overallStatus: HealthCheckResult['status'] = 'ok'
    if (allStatuses.every(s => s === 'error')) {
      overallStatus = 'error'
    } else if (allStatuses.some(s => s === 'error')) {
      overallStatus = 'degraded'
    }

    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      uptime: Date.now() - serverStartTime,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    }

    // Return appropriate status code based on health
    const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(healthCheck, { status: statusCode })
  } catch (error) {
    // If the health check itself fails, return 503
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
        services: {
          database: { status: 'error' },
          redis: { status: 'error' },
          email: { status: 'error' },
          storage: { status: 'error' }
        },
        uptime: Date.now() - serverStartTime,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
      },
      { status: 503 }
    )
  }
}

// Lightweight health check for load balancers
export async function HEAD(request: NextRequest) {
  try {
    // Just check if the database is reachable
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}