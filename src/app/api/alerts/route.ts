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
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};

    // Filter by facility
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
          alerts: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        });
      }

      where.facilityId = { in: facilityIds };
    }

    // Filter by status
    if (status) {
      where.status = status.toUpperCase();
    }

    // Filter by severity
    if (severity) {
      where.severity = severity.toUpperCase();
    }

    // Search by message, sensor name, or location
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { sensorName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.alertLog.count({ where });

    // Get alerts with pagination
    const alerts = await prisma.alertLog.findMany({
      where,
      include: {
        sensor: {
          select: {
            id: true,
            name: true,
            sensorType: true
          }
        },
        facility: {
          select: {
            id: true,
            name: true
          }
        },
        alertConfig: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    logger.error('alerts', 'Error fetching alerts', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

