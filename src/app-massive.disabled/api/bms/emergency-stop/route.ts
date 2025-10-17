import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { deviceControlService } from '@/lib/services/device-control';
import { getServerSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { deviceIds, zones, stopAll, reason, operator } = body;
    
    await deviceControlService.emergencyStop({
      deviceIds,
      zones,
      stopAll: stopAll || false,
      reason: reason || 'Emergency stop triggered',
      operator: operator || session.user?.email || 'Unknown'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Emergency stop activated'
    });
  } catch (error) {
    logger.error('api', 'Emergency stop error:', error );
    return NextResponse.json(
      { 
        success: false,
        error: 'Emergency stop failed',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}