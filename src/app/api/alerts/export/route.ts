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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    if (format !== 'csv') {
      return NextResponse.json(
        { error: 'Only CSV format is supported' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Facility filter
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
        return new NextResponse('No alerts found', { status: 404 });
      }

      where.facilityId = { in: facilityIds };
    }

    // Fetch alerts
    const alerts = await prisma.alertLog.findMany({
      where,
      include: {
        facility: {
          select: {
            id: true,
            name: true
          }
        },
        sensor: {
          select: {
            id: true,
            name: true
          }
        },
        alertConfig: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (alerts.length === 0) {
      return new NextResponse('No alerts found', { status: 404 });
    }

    // Generate CSV
    const csvHeaders = [
      'Alert ID',
      'Facility',
      'Sensor',
      'Alert Type',
      'Severity',
      'Message',
      'Triggered Value',
      'Threshold Value',
      'Unit',
      'Status',
      'Created At',
      'Acknowledged At',
      'Acknowledged By',
      'Resolved At',
      'Resolved By',
      'Resolution Notes',
      'Response Time (min)',
      'Location',
      'Alert Rule Name'
    ];

    const csvRows = alerts.map(alert => {
      const facilityName = alert.facility?.name || 'N/A';
      const sensorName = alert.sensor?.name || alert.sensorName || 'N/A';
      const alertRuleName = alert.alertConfig?.name || 'N/A';

      // Calculate response time
      let responseTime = '';
      if (alert.acknowledgedAt) {
        const responseMs = new Date(alert.acknowledgedAt).getTime() - new Date(alert.createdAt).getTime();
        responseTime = Math.round(responseMs / 60000).toString();
      }

      return [
        alert.id,
        facilityName,
        sensorName,
        alert.alertType.replace(/_/g, ' '),
        alert.severity,
        `"${alert.message.replace(/"/g, '""')}"`, // Escape quotes
        alert.triggeredValue?.toString() || '',
        alert.thresholdValue?.toString() || '',
        alert.unit || '',
        alert.status,
        alert.createdAt.toISOString(),
        alert.acknowledgedAt?.toISOString() || '',
        alert.acknowledgedBy || '',
        alert.resolvedAt?.toISOString() || '',
        alert.resolvedBy || '',
        alert.resolutionNotes ? `"${alert.resolutionNotes.replace(/"/g, '""')}"` : '',
        responseTime,
        alert.location || '',
        alertRuleName
      ].join(',');
    });

    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    logger.info('alerts', `Exported ${alerts.length} alerts for user ${session.userId}`);

    // Return CSV response
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="alerts-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    logger.error('alerts', 'Error exporting alerts', error as Error);
    return NextResponse.json(
      { error: 'Failed to export alerts' },
      { status: 500 }
    );
  }
}

