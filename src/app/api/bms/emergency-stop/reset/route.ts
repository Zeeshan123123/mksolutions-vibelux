import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { deviceControlService } from '@/lib/services/device-control';
import { getServerSession } from '@/lib/auth';
export const dynamic = 'force-dynamic'

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
    const { operator } = body;
    
    await deviceControlService.resetEmergencyStop(
      operator || session.user?.email || 'Unknown'
    );
    
    return NextResponse.json({
      success: true,
      message: 'Emergency stop reset'
    });
  } catch (error) {
    logger.error('api', 'Emergency stop reset error:', error );
    return NextResponse.json(
      { 
        success: false,
        error: 'Emergency stop reset failed',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}