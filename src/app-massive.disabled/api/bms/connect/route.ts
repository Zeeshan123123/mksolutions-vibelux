import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { deviceDiscovery } from '@/lib/services/device-discovery';
import { dataCollectionService } from '@/lib/services/realtime-data-collection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId } = body;
    
    // Get device configuration
    const deviceConfig = await deviceDiscovery.configureDevice(deviceId);
    
    if (!deviceConfig) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Start data collection
    await dataCollectionService.startCollection({
      deviceId: deviceConfig.id,
      protocol: deviceConfig.protocol.split('-')[0], // Extract protocol type
      enabled: true,
      pollInterval: 1000, // 1 second
      connection: deviceConfig.connection,
      mapping: deviceConfig.mapping
    });
    
    return NextResponse.json({
      success: true,
      deviceId: deviceConfig.id
    });
  } catch (error) {
    logger.error('api', 'Device connection error:', error );
    return NextResponse.json(
      { error: 'Connection failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}