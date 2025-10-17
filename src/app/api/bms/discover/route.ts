import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { deviceDiscovery } from '@/lib/services/device-discovery';
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { protocols, ipRange, timeout } = body;
    
    const devices = await deviceDiscovery.discover({
      protocols,
      ipRange,
      timeout
    });
    
    return NextResponse.json(devices);
  } catch (error) {
    logger.error('api', 'Device discovery error:', error );
    return NextResponse.json(
      { error: 'Discovery failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}