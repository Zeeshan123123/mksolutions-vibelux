import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { getWebSocketServer } from '@/lib/websocket/scalable-websocket-server';

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
    const body = await req.json();
    const { resolutionNotes } = body;

    // Validation
    if (!resolutionNotes || typeof resolutionNotes !== 'string' || resolutionNotes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resolution notes are required' },
        { status: 400 }
      );
    }

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

    // Check if already resolved
    if (alert.resolvedAt) {
      return NextResponse.json({
        error: 'Alert already resolved',
        resolvedAt: alert.resolvedAt
      }, { status: 400 });
    }

    // Update alert
    const updatedAlert = await prisma.alertLog.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: session.userId,
        resolutionNotes: resolutionNotes.trim(),
        // Auto-acknowledge if not already acknowledged
        ...((!alert.acknowledgedAt) && {
          acknowledgedAt: new Date(),
          acknowledgedBy: session.userId
        })
      },
      include: {
        sensor: true,
        facility: true
      }
    });

    logger.info('alerts', `Alert ${alertId} resolved by ${session.userId}`, {
      resolution: resolutionNotes
    });

    // Broadcast WebSocket update
    try {
      const wsServer = getWebSocketServer();
      wsServer.io.to(`facility:${alert.facilityId}`).emit('alert:resolved', {
        alertId,
        resolvedAt: updatedAlert.resolvedAt,
        resolvedBy: session.userId,
        resolutionNotes: resolutionNotes.trim()
      });
    } catch (wsError) {
      logger.warn('alerts', 'Failed to broadcast WebSocket update', wsError as Error);
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert
    });

  } catch (error) {
    logger.error('alerts', 'Error resolving alert', error as Error);
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}

