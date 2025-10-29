import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const sensorId = searchParams.get('sensorId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    const where: any = {
      facilityId
    };

    if (sensorId) {
      where.sensorId = sensorId;
    }

    const configurations = await prisma.alertConfiguration.findMany({
      where,
      include: {
        sensor: {
          include: {
            zone: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ configurations });
  } catch (error) {
    console.error('Error fetching alert configurations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      facilityId,
      sensorId,
      name,
      alertType,
      condition,
      threshold,
      thresholdMax,
      severity,
      duration,
      cooldownMinutes,
      actions,
      notificationMessage,
      enabled
    } = body;

    // Validate required fields
    if (!facilityId || !sensorId || !name || !alertType || !condition || threshold === undefined || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If updating existing configuration
    if (id) {
      const updated = await prisma.alertConfiguration.update({
        where: { id },
        data: {
          name,
          alertType,
          condition,
          threshold,
          thresholdMax,
          severity,
          duration,
          cooldownMinutes: cooldownMinutes || 15,
          actions,
          notificationMessage,
          enabled: enabled !== undefined ? enabled : true
        },
        include: {
          sensor: true
        }
      });

      return NextResponse.json({ configuration: updated });
    }

    // Create new configuration
    const configuration = await prisma.alertConfiguration.create({
      data: {
        facilityId,
        sensorId,
        name,
        alertType,
        condition,
        threshold,
        thresholdMax,
        severity,
        duration,
        cooldownMinutes: cooldownMinutes || 15,
        actions,
        notificationMessage,
        enabled: enabled !== undefined ? enabled : true
      },
      include: {
        sensor: true
      }
    });

    return NextResponse.json({ configuration }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating alert configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
