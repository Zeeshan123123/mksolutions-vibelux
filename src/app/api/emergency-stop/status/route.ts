import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { emergencyStopSystem } from '@/services/emergency-stop-system';
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const status = emergencyStopSystem.getStatus();

    return NextResponse.json(status);

  } catch (error) {
    logger.error('api', 'Failed to get emergency stop status:', error );
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}