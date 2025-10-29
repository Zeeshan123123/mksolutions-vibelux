import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get('facilityId');

    // Build where clause
    const where: any = {};

    if (facilityId) {
      // Verify user has access to facility
      const facilityUser = await prisma.facilityUser.findFirst({
        where: {
          facilityId,
          userId: session.userId
        }
      });

      if (!facilityUser) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      where.facilityId = facilityId;
    } else {
      // Get all facilities user has access to
      const facilityUsers = await prisma.facilityUser.findMany({
        where: { userId: session.userId },
        select: { facilityId: true }
      });

      const facilityIds = facilityUsers.map(fu => fu.facilityId);

      if (facilityIds.length === 0) {
        return NextResponse.json({
          total: 0,
          unacknowledged: 0,
          bySeverity: {},
          todayCount: 0,
          avgResponseTime: null,
          topSensors: []
        });
      }

      where.facilityId = { in: facilityIds };
    }

    // Get total alerts
    const total = await prisma.alertLog.count({ where });

    // Get unacknowledged count
    const unacknowledged = await prisma.alertLog.count({
      where: {
        ...where,
        acknowledgedAt: null,
        status: { in: ['ACTIVE'] }
      }
    });

    // Get counts by severity
    const severityCounts = await prisma.alertLog.groupBy({
      by: ['severity'],
      where,
      _count: {
        severity: true
      }
    });

    const bySeverity = severityCounts.reduce((acc, item) => {
      acc[item.severity] = item._count.severity;
      return acc;
    }, {} as Record<string, number>);

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.alertLog.count({
      where: {
        ...where,
        createdAt: {
          gte: today
        }
      }
    });

    // Calculate average response time
    const acknowledgedAlerts = await prisma.alertLog.findMany({
      where: {
        ...where,
        acknowledgedAt: { not: null }
      },
      select: {
        createdAt: true,
        acknowledgedAt: true
      },
      take: 100, // Limit to last 100 for performance
      orderBy: {
        acknowledgedAt: 'desc'
      }
    });

    let avgResponseTime = null;
    if (acknowledgedAlerts.length > 0) {
      const totalResponseTime = acknowledgedAlerts.reduce((sum, alert) => {
        if (alert.acknowledgedAt) {
          const responseTime = new Date(alert.acknowledgedAt).getTime() - new Date(alert.createdAt).getTime();
          return sum + responseTime;
        }
        return sum;
      }, 0);

      avgResponseTime = Math.round(totalResponseTime / acknowledgedAlerts.length / 60000); // Convert to minutes
    }

    // Get top sensors by alert count
    const sensorCounts = await prisma.alertLog.groupBy({
      by: ['sensorId', 'sensorName'],
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      _count: {
        sensorId: true
      },
      orderBy: {
        _count: {
          sensorId: 'desc'
        }
      },
      take: 5
    });

    const topSensors = sensorCounts.map(item => ({
      sensorId: item.sensorId,
      sensorName: item.sensorName,
      count: item._count.sensorId
    }));

    return NextResponse.json({
      total,
      unacknowledged,
      bySeverity,
      todayCount,
      avgResponseTime,
      topSensors
    });

  } catch (error) {
    logger.error('alerts', 'Error fetching alert stats', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch alert statistics' },
      { status: 500 }
    );
  }
}

