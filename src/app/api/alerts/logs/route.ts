/**
 * Alert Logs API
 * Manage and query alert history
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

// Get alert logs
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const sensorId = searchParams.get('sensorId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!facilityId) {
      return NextResponse.json({ error: 'facilityId is required' }, { status: 400 });
    }

    // Verify user has access to facility
    const facilityAccess = await prisma.facilityUser.findFirst({
      where: {
        userId: userId,
        facilityId: facilityId
      }
    });

    if (!facilityAccess) {
      return NextResponse.json({ error: 'No access to this facility' }, { status: 403 });
    }

    // Build query
    const where: any = { facilityId };
    
    if (sensorId) {
      where.sensorId = sensorId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (severity) {
      where.severity = severity;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [alerts, totalCount] = await Promise.all([
      prisma.alertLog.findMany({
        where,
        include: {
          alertConfig: {
            select: {
              id: true,
              name: true,
              alertType: true,
              condition: true
            }
          },
          sensor: {
            select: {
              id: true,
              name: true,
              sensorType: true,
              location: true
            }
          },
          acknowledger: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          resolver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.alertLog.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      alerts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to fetch alert logs', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch alert logs' },
      { status: 500 }
    );
  }
}

// Acknowledge or resolve alert
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alertId, action, notes } = body;

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'alertId and action are required' },
        { status: 400 }
      );
    }

    if (!['acknowledge', 'resolve'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "acknowledge" or "resolve"' },
        { status: 400 }
      );
    }

    // Get alert and verify access
    const alert = await prisma.alertLog.findUnique({
      where: { id: alertId },
      include: {
        facility: {
          include: {
            users: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    if (alert.facility.users.length === 0) {
      return NextResponse.json({ error: 'No access to this alert' }, { status: 403 });
    }

    // Update alert based on action
    const updateData: any = {};
    
    if (action === 'acknowledge') {
      updateData.status = 'ACKNOWLEDGED';
      updateData.acknowledgedBy = userId;
      updateData.acknowledgedAt = new Date();
    } else if (action === 'resolve') {
      updateData.status = 'RESOLVED';
      updateData.resolvedBy = userId;
      updateData.resolvedAt = new Date();
      if (notes) {
        updateData.resolutionNotes = notes;
      }
    }

    const updatedAlert = await prisma.alertLog.update({
      where: { id: alertId },
      data: updateData,
      include: {
        alertConfig: {
          select: {
            id: true,
            name: true,
            alertType: true
          }
        },
        sensor: {
          select: {
            id: true,
            name: true,
            sensorType: true
          }
        },
        acknowledger: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    logger.info('api', `Alert ${action}d`, {
      alertId,
      action,
      userId,
      facilityId: alert.facilityId
    });

    return NextResponse.json({
      success: true,
      alert: updatedAlert
    });

  } catch (error) {
    logger.error('api', 'Failed to update alert', error as Error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}


