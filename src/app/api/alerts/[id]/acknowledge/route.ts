import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { getWebSocketServer } from '@/lib/websocket/scalable-websocket-server';
import { escalationService } from '@/services/escalation-service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: alertId } = params;

    // Find the alert
    const alert = await prisma.alertLog.findUnique({
      where: { id: alertId },
      include: {
        facility: true,
        sensor: true
      }
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Check if user has access to the facility
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        facilityId: alert.facilityId,
        userId: session.userId
      }
    });

    if (!facilityUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already acknowledged
    if (alert.acknowledgedAt) {
      return NextResponse.json({
        error: 'Alert already acknowledged',
        acknowledgedAt: alert.acknowledgedAt,
        acknowledgedBy: alert.acknowledgedBy
      }, { status: 400 });
    }

    // Update alert
    const updatedAlert = await prisma.alertLog.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        acknowledgedBy: session.userId
      },
      include: {
        sensor: true,
        facility: true
      }
    });

    // Calculate response time
    const responseTime = escalationService.calculateResponseTime(updatedAlert);

    logger.info('alerts', `Alert ${alertId} acknowledged by ${session.userId}`, {
      responseTimeMinutes: responseTime?.responseTimeMinutes
    });

    // Broadcast WebSocket update
    try {
      const wsServer = getWebSocketServer();
      wsServer.io.to(`facility:${alert.facilityId}`).emit('alert:acknowledged', {
        alertId,
        acknowledgedBy: session.userId,
        acknowledgedAt: updatedAlert.acknowledgedAt,
        responseTime: responseTime?.responseTimeMinutes
      });
    } catch (wsError) {
      logger.warn('alerts', 'Failed to broadcast WebSocket update', wsError as Error);
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      responseTime
    });

  } catch (error) {
    logger.error('alerts', 'Error acknowledging alert', error as Error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}

