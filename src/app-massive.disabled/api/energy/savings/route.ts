import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import energyMonitoringService from '@/services/energy-monitoring.service';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';

// Validation schema
const savingsCalculationSchema = z.object({
  facilityId: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = savingsCalculationSchema.parse(body);

    const savingsReport = await energyMonitoringService.calculateSavings(
      validatedData.facilityId,
      validatedData.startDate,
      validatedData.endDate
    );

    return NextResponse.json({
      success: true,
      report: savingsReport,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('api', 'Error calculating savings:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate savings' },
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

    // Mock savings data since verified_savings model doesn't exist yet
    const mockSavings = {
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      kwhSaved: 1200,
      costSaved: 144, // $0.12 per kWh
      co2Avoided: 0.48, // 0.4 kg CO2 per kWh
      peakReduction: 15,
    };

    // Generate mock monthly trend for last 6 months
    const monthlyTrend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      monthlyTrend.push({
        month: date.toISOString().slice(0, 7),
        kwhSaved: 1000 + Math.random() * 400,
        costSaved: 120 + Math.random() * 48,
        co2Avoided: 0.4 + Math.random() * 0.16,
      });
    }

    return NextResponse.json({
      current: mockSavings,
      trend: monthlyTrend,
    });
  } catch (error) {
    logger.error('api', 'Error fetching savings data:', error );
    return NextResponse.json(
      { error: 'Failed to fetch savings data' },
      { status: 500 }
    );
  }
}