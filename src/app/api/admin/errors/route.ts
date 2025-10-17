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
    const limit = parseInt(searchParams.get('limit') || '100');

    // Calculate time range
    const now = new Date();
    const timeRangeMap = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const timeRangeMs = timeRangeMap[timeRange as keyof typeof timeRangeMap] || timeRangeMap['24h'];
    const startTime = new Date(now.getTime() - timeRangeMs);

    // For now, we'll create mock error data since we don't have error logging table yet
    // In production, this would query actual error logs from database
    const mockErrors = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        level: 'error' as const,
        message: 'Database connection timeout',
        source: 'api/v1/sensors',
        userId: 'user_123',
        userEmail: 'test@example.com',
        stack: 'Error: Database connection timeout\n    at connectDB (/api/db.js:23:5)\n    at handler (/api/sensors.js:12:3)',
        url: '/api/v1/sensors',
        userAgent: 'Mozilla/5.0 (Chrome)',
        resolved: false
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        level: 'warning' as const,
        message: 'API rate limit approaching',
        source: 'api/fixtures',
        resolved: true
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        level: 'error' as const,
        message: 'Failed to parse DLC fixture data',
        source: 'lib/dlc-parser',
        resolved: false
      }
    ];

    // Filter by time range
    const filteredErrors = mockErrors.filter(error => 
      error.timestamp >= startTime
    ).slice(0, limit);

    return NextResponse.json({
      errors: filteredErrors,
      total: filteredErrors.length,
      timeRange,
      startTime: startTime.toISOString()
    });

  } catch (error) {
    logger.error('system', 'Failed to fetch errors:', error);
    return NextResponse.json({
      error: 'Failed to fetch errors',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the error
    logger.error('system', data.message, undefined, {
      source: data.source,
      stack: data.stack,
      url: data.url,
      userAgent: data.userAgent,
      userId: data.userId,
      level: data.level || 'error'
    });

    // In a real implementation, you'd save this to a database
    // For now, we'll just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Error logged successfully'
    });

  } catch (error) {
    logger.error('system', 'Failed to log error:', error);
    return NextResponse.json({
      error: 'Failed to log error'
    }, { status: 500 });
  }
}