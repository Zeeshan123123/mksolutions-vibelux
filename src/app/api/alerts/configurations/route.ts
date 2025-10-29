/**
 * Alert Configuration API
 * Manage alert rules and configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import { alertDetector } from '@/lib/sensors/alert-detector';

// Get alert configurations for a facility
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const sensorId = searchParams.get('sensorId');

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

    const configurations = await prisma.alertConfiguration.findMany({
      where,
      include: {
        sensor: {
          select: {
            id: true,
            name: true,
            sensorType: true,
            location: true
          }
        },
        alertLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            severity: true,
            message: true,
            triggeredValue: true,
            thresholdValue: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { enabled: 'desc' },
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      configurations
    });

  } catch (error) {
    logger.error('api', 'Failed to fetch alert configurations', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch alert configurations' },
      { status: 500 }
    );
  }
}

// Create new alert configuration
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
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
      enabled = true
    } = body;

    // Validate required fields
    if (!facilityId || !sensorId || !name || !alertType || !condition || threshold === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Verify sensor exists and belongs to facility
    const sensor = await prisma.zoneSensor.findFirst({
      where: {
        id: sensorId,
        zone: {
          facilityId: facilityId
        }
      }
    });

    if (!sensor) {
      return NextResponse.json({ error: 'Sensor not found or access denied' }, { status: 404 });
    }

    // Validate condition-specific requirements
    if (condition === 'BETWEEN' && thresholdMax === undefined) {
      return NextResponse.json(
        { error: 'thresholdMax is required for BETWEEN condition' },
        { status: 400 }
      );
    }

    // Create alert configuration
    const configuration = await prisma.alertConfiguration.create({
      data: {
        facilityId,
        sensorId,
        name,
        enabled,
        alertType,
        condition,
        threshold,
        thresholdMax,
        severity: severity || 'MEDIUM',
        duration,
        cooldownMinutes: cooldownMinutes || 15,
        actions: actions || { email: true, push: true },
        notificationMessage
      },
      include: {
        sensor: {
          select: {
            id: true,
            name: true,
            sensorType: true
          }
        }
      }
    });

    // Invalidate cache for this sensor
    alertDetector.invalidateConfigCache(sensorId);

    logger.info('api', 'Alert configuration created', {
      configurationId: configuration.id,
      facilityId,
      sensorId,
      alertType,
      condition
    });

    return NextResponse.json({
      success: true,
      configuration
    });

  } catch (error) {
    logger.error('api', 'Failed to create alert configuration', error as Error);
    return NextResponse.json(
      { error: 'Failed to create alert configuration' },
      { status: 500 }
    );
  }
}

// Update alert configuration
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    // Get existing configuration
    const existingConfig = await prisma.alertConfiguration.findUnique({
      where: { id },
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

    if (!existingConfig) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // Verify user has access
    if (existingConfig.facility.users.length === 0) {
      return NextResponse.json({ error: 'No access to this configuration' }, { status: 403 });
    }

    // Update configuration
    const configuration = await prisma.alertConfiguration.update({
      where: { id },
      data: updateData,
      include: {
        sensor: {
          select: {
            id: true,
            name: true,
            sensorType: true
          }
        }
      }
    });

    // Invalidate cache for this sensor
    alertDetector.invalidateConfigCache(configuration.sensorId);

    logger.info('api', 'Alert configuration updated', {
      configurationId: id,
      changes: Object.keys(updateData)
    });

    return NextResponse.json({
      success: true,
      configuration
    });

  } catch (error) {
    logger.error('api', 'Failed to update alert configuration', error as Error);
    return NextResponse.json(
      { error: 'Failed to update alert configuration' },
      { status: 500 }
    );
  }
}

// Delete alert configuration
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    // Get existing configuration
    const existingConfig = await prisma.alertConfiguration.findUnique({
      where: { id },
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

    if (!existingConfig) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // Verify user has access
    if (existingConfig.facility.users.length === 0) {
      return NextResponse.json({ error: 'No access to this configuration' }, { status: 403 });
    }

    // Delete configuration
    await prisma.alertConfiguration.delete({
      where: { id }
    });

    // Invalidate cache for this sensor
    alertDetector.invalidateConfigCache(existingConfig.sensorId);

    logger.info('api', 'Alert configuration deleted', {
      configurationId: id,
      facilityId: existingConfig.facilityId,
      sensorId: existingConfig.sensorId
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully'
    });

  } catch (error) {
    logger.error('api', 'Failed to delete alert configuration', error as Error);
    return NextResponse.json(
      { error: 'Failed to delete alert configuration' },
      { status: 500 }
    );
  }
}


