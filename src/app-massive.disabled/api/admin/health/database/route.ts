import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    // Check table accessibility
    const userCount = await prisma.user.count();
    
    // Check recent activity
    const recentUsers = await prisma.user.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: { id: true }
    });

    return NextResponse.json({
      status: 'healthy',
      responseTime,
      details: `Database operational. ${userCount} total users, ${recentUsers.length} active in last 24h`,
      metrics: {
        totalUsers: userCount,
        recentActivity: recentUsers.length,
        connectionTime: responseTime
      }
    });

  } catch (error) {
    logger.error('system', 'Database health check failed:', error);
    
    return NextResponse.json({
      status: 'down',
      error: error instanceof Error ? error.message : 'Database connection failed',
      details: 'Unable to connect to or query the database'
    }, { status: 500 });
  }
}