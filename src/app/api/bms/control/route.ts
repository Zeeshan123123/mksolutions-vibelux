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
    const { deviceId, command, parameters, zone, priority, override, duration } = body;
    
    const result = await deviceControlService.executeCommand({
      deviceId,
      command,
      parameters,
      zone,
      priority,
      override,
      duration
    });
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('api', 'Device control error:', error );
    return NextResponse.json(
      { 
        success: false,
        error: 'Control command failed',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}