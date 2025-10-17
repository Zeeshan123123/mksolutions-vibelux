import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Redis } from 'ioredis'
export const dynamic = 'force-dynamic'

interface ReadinessCheckResult {
  ready: boolean
  timestamp: string
  checks: {
    database: boolean
    redis: boolean
    migrations: boolean
  }
  errors: string[]
}

// Initialize Redis only when needed
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

// Readiness check for Kubernetes deployments
export async function GET(request: NextRequest) {
  const errors: string[] = []
  const checks = {
    database: false,
    redis: false,
    migrations: false
  }

  try {
    // Check database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.database = true
    } catch (error) {
      errors.push('Database connection failed')
    }

    // Check Redis connectivity
    const redis = createRedisClient();
    if (redis) {
      try {
        await redis.ping()
        checks.redis = true
        redis.disconnect()
      } catch (error) {
        errors.push('Redis connection failed')
        redis.disconnect()
      }
    } else {
      errors.push('Redis not configured')
    }

    // Check if migrations are up to date
    try {
      // In production, you might want to check if all migrations have been applied
      // For now, we'll just check if we can query a table
      await prisma.user.count()
      checks.migrations = true
    } catch (error) {
      errors.push('Database migrations may not be complete')
    }

    const allChecksPass = Object.values(checks).every(check => check)

    const result: ReadinessCheckResult = {
      ready: allChecksPass,
      timestamp: new Date().toISOString(),
      checks,
      errors
    }

    return NextResponse.json(result, { 
      status: allChecksPass ? 200 : 503 
    })
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        timestamp: new Date().toISOString(),
        checks,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 503 }
    )
  }
}

// Lightweight readiness check
export async function HEAD(request: NextRequest) {
  try {
    const redis = createRedisClient();
    
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis separately
    if (redis) {
      await redis.ping();
    }
    
    if (redis) {
      redis.disconnect();
    }
    
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}