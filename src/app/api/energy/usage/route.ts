import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import energyMonitoringService from '@/services/energy-monitoring.service';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

// Validation schema for energy reading
const energyReadingSchema = z.object({
  facilityId: z.string(),
  zoneId: z.string().optional(),
  timestamp: z.string().transform(str => new Date(str)),
  powerKw: z.number().positive(),
  energyKwh: z.number().positive().optional(),
  voltage: z.number().positive().optional(),
  current: z.number().positive().optional(),
  powerFactor: z.number().min(0).max(1).optional(),
  source: z.enum(['meter', 'control_system', 'estimated']),
  deviceId: z.string().optional(),
});

// Batch reading schema
const batchReadingSchema = z.object({
  readings: z.array(energyReadingSchema),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if it's a batch or single reading
    if (Array.isArray(body.readings)) {
      // Batch processing
      const validatedData = batchReadingSchema.parse(body);
      
      const results = await Promise.all(
        validatedData.readings.map(reading => 
          energyMonitoringService.recordEnergyUsage(reading)
        )
      );
      
      return NextResponse.json({
        success: true,
        message: `Recorded ${validatedData.readings.length} energy readings`,
        recordedAt: new Date().toISOString(),
      });
    } else {
      // Single reading
      const validatedData = energyReadingSchema.parse(body);
      await energyMonitoringService.recordEnergyUsage(validatedData);
      
      return NextResponse.json({
        success: true,
        message: 'Energy reading recorded successfully',
        recordedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('api', 'Error recording energy usage:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to record energy usage' },
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const aggregation = searchParams.get('aggregation') as any || 'hourly';

    if (!facilityId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: facilityId, startDate, endDate' },
        { status: 400 }
      );
    }

    const historicalData = await energyMonitoringService.getHistoricalData(
      facilityId,
      new Date(startDate),
      new Date(endDate),
      aggregation
    );

    return NextResponse.json(historicalData);
  } catch (error) {
    logger.error('api', 'Error fetching historical data:', error );
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}