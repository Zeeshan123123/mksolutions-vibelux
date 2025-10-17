import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import HLPManager from '@/lib/protocols/hlp';

// Global HLP manager instance
let hlpManager: HLPManager | null = null;

function getHLPManager() {
  if (!hlpManager) {
    hlpManager = new HLPManager({
      discoveryPort: parseInt(process.env.HLP_DISCOVERY_PORT || '50000'),
      commandPort: parseInt(process.env.HLP_COMMAND_PORT || '50001'),
      enableBroadcast: process.env.HLP_ENABLE_BROADCAST !== 'false',
      enableMulticast: process.env.HLP_ENABLE_MULTICAST !== 'false',
      multicastAddress: process.env.HLP_MULTICAST_ADDRESS || '239.255.255.250'
    });
    
    // Start the manager asynchronously
    hlpManager.start().catch(error => {
      logger.error('api', 'Failed to start HLP manager:', error );
    });
  }
  return hlpManager;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const manager = getHLPManager();
    const devices = manager.getDevices();

    // Get zone filter from query params
    const zoneId = req.nextUrl.searchParams.get('zoneId');
    
    if (zoneId) {
      const zoneDevices = manager.getDevicesByZone(zoneId);
      return NextResponse.json({
        devices: zoneDevices,
        total: zoneDevices.length,
        zoneId
      });
    }

    return NextResponse.json({
      devices,
      total: devices.length
    });
  } catch (error) {
    logger.error('api', 'Error getting HLP devices:', error );
    return NextResponse.json(
      { error: 'Failed to get HLP devices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const manager = getHLPManager();

    switch (action) {
      case 'discover':
        // Trigger manual discovery
        await manager.start();
        return NextResponse.json({
          success: true,
          message: 'Discovery initiated'
        });

      case 'mapToZone':
        const { deviceId, zoneId } = body;
        if (!deviceId || !zoneId) {
          return NextResponse.json(
            { error: 'Device ID and Zone ID required' },
            { status: 400 }
          );
        }
        
        await manager.mapDeviceToZone(deviceId, zoneId);
        return NextResponse.json({
          success: true,
          message: 'Device mapped to zone'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('api', 'Error in HLP devices endpoint:', error );
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}