/**
 * Database Health Check API
 * Monitors database connection and performance
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();

    // Check database health
    let health = { connected: false, error: undefined as string | undefined, stats: undefined as any };
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.connected = true;
    } catch (e) {
      health.connected = false;
      health.error = e instanceof Error ? e.message : 'Unknown error';
    }
    const responseTime = Date.now() - startTime;

    // Determine overall status
    const status = health.connected ? 'healthy' : 'unhealthy';
    const statusCode = health.connected ? 200 : 503;

    // Log health check
    if (!health.connected) {
      logger.error('health', 'Database health check failed', new Error(health.error || 'Unknown error'));
    }

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: health.connected,
        error: health.error,
        stats: health.stats
      },
      services: {
        prisma: health.connected ? 'operational' : 'down',
        postgres: health.connected ? 'operational' : 'down'
      }
    }, { status: statusCode });

  } catch (error) {
    logger.error('health', 'Health check error', error as Error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      },
      services: {
        prisma: 'down',
        postgres: 'unknown'
      }
    }, { status: 503 });
  }
}

// HEAD request for simple health check
export async function HEAD(req: NextRequest) {
  try {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return new NextResponse(null, { status: 200, headers: { 'X-Database-Status': 'healthy' } });
    } catch (e) {
      return new NextResponse(null, { status: 503, headers: { 'X-Database-Status': 'unhealthy' } });
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}