import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import energyMonitoringService from '@/services/energy-monitoring.service';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';

// Validation schema
const loadSheddingSchema = z.object({
  facilityId: z.string(),
  zoneId: z.string(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  targetReductionKw: z.number().positive(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  reason: z.enum(['peak_demand', 'grid_event', 'cost_optimization', 'manual']),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = loadSheddingSchema.parse(body);

    await energyMonitoringService.implementLoadShedding(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Load shedding schedule created successfully',
      schedule: validatedData,
    });
  } catch (error) {
    logger.error('api', 'Error creating load shedding schedule:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create load shedding schedule' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    
    if (!facilityId) {
      return NextResponse.json(
        { error: 'Missing required parameter: facilityId' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get active and upcoming load shedding schedules
    const schedules = await prisma.$queryRaw`
      SELECT 
        id,
        facility_id,
        zone_id,
        start_time,
        end_time,
        target_reduction_kw,
        priority,
        reason,
        created_at
      FROM load_shedding_schedules
      WHERE facility_id = ${facilityId}
        AND end_time >= NOW()
      ORDER BY start_time ASC
      LIMIT 50
    `;

    return NextResponse.json({
      facilityId,
      schedules,
    });
  } catch (error) {
    logger.error('api', 'Error fetching load shedding schedules:', error );
    return NextResponse.json(
      { error: 'Failed to fetch load shedding schedules' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    
    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Missing required parameter: scheduleId' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$executeRaw`
      DELETE FROM load_shedding_schedules
      WHERE id = ${scheduleId}
        AND start_time > NOW()
    `;

    return NextResponse.json({
      success: true,
      message: 'Load shedding schedule cancelled',
    });
  } catch (error) {
    logger.error('api', 'Error cancelling load shedding schedule:', error );
    return NextResponse.json(
      { error: 'Failed to cancel load shedding schedule' },
      { status: 500 }
    );
  }
}