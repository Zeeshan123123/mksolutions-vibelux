import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Mock error statistics - in production this would come from actual error logs
    const stats = {
      totalErrors: Math.floor(Math.random() * 50) + 10,
      uniqueErrors: Math.floor(Math.random() * 20) + 5,
      errorRate: Math.random() * 3, // 0-3% error rate
      topErrors: [
        {
          message: 'Database connection timeout',
          count: Math.floor(Math.random() * 15) + 5,
          lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000)
        },
        {
          message: 'API rate limit exceeded',
          count: Math.floor(Math.random() * 10) + 3,
          lastSeen: new Date(Date.now() - Math.random() * 30 * 60 * 1000)
        },
        {
          message: 'Invalid fixture data format',
          count: Math.floor(Math.random() * 8) + 2,
          lastSeen: new Date(Date.now() - Math.random() * 120 * 60 * 1000)
        }
      ],
      errorsBySource: [
        { source: 'api/v1/sensors', count: Math.floor(Math.random() * 15) + 5 },
        { source: 'api/fixtures', count: Math.floor(Math.random() * 12) + 3 },
        { source: 'lib/dlc-parser', count: Math.floor(Math.random() * 8) + 2 },
        { source: 'components/design', count: Math.floor(Math.random() * 6) + 1 }
      ]
    };

    return NextResponse.json(stats);

  } catch (error) {
    logger.error('system', 'Failed to fetch error stats:', error);
    return NextResponse.json({
      error: 'Failed to fetch error stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}