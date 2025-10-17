import { NextRequest, NextResponse } from 'next/server';
import { MaintenanceScheduler } from '@/lib/maintenance-scheduler';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    const statistics = await MaintenanceScheduler.getMaintenanceStatistics(facilityId);

    return NextResponse.json(statistics);
  } catch (error) {
    logger.error('api', 'Error fetching maintenance statistics:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}