import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { IoTDeviceHubService } from '@/services/iot-device-hub.service';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const deviceId = searchParams.get('deviceId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const hubService = new IoTDeviceHubService();

    if (deviceId) {
      // Get specific device status
      const status = await hubService.getDeviceStatus(deviceId);
      if (!status) {
        return NextResponse.json(
          { error: 'Device not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        deviceId,
        status
      });
    } else {
      // Get all devices for facility
      const devices = await hubService.getDevices(facilityId);
      
      return NextResponse.json({
        success: true,
        facilityId,
        devices,
        count: devices.length
      });
    }

  } catch (error) {
    logger.error('api', 'Failed to get devices', error as Error);
    return NextResponse.json(
      { error: 'Failed to get devices', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { operation, device, facilityId } = body;

    if (!operation) {
      return NextResponse.json(
        { error: 'operation is required' },
        { status: 400 }
      );
    }

    const hubService = new IoTDeviceHubService();

    switch (operation) {
      case 'register': {
        if (!device) {
          return NextResponse.json(
            { error: 'device data is required for registration' },
            { status: 400 }
          );
        }

        const success = await hubService.registerDevice(device);
        
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to register device' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Device registered successfully',
          deviceId: device.id
        });
      }

      case 'initialize_hub': {
        if (!facilityId) {
          return NextResponse.json(
            { error: 'facilityId is required for hub initialization' },
            { status: 400 }
          );
        }

        const { config } = body;
        if (!config) {
          return NextResponse.json(
            { error: 'config is required for hub initialization' },
            { status: 400 }
          );
        }

        const success = await hubService.initializeHub({
          facilityId,
          ...config
        });

        if (!success) {
          return NextResponse.json(
            { error: 'Failed to initialize IoT hub' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'IoT hub initialized successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Device operation failed', error as Error);
    return NextResponse.json(
      { error: 'Device operation failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const hubService = new IoTDeviceHubService();
    const success = await hubService.removeDevice(deviceId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove device' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Device removed successfully',
      deviceId
    });

  } catch (error) {
    logger.error('api', 'Failed to remove device', error as Error);
    return NextResponse.json(
      { error: 'Failed to remove device', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { deviceId, configuration } = body;

    if (!deviceId || !configuration) {
      return NextResponse.json(
        { error: 'deviceId and configuration are required' },
        { status: 400 }
      );
    }

    const hubService = new IoTDeviceHubService();
    const success = await hubService.updateDeviceConfiguration(deviceId, configuration);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update device configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Device configuration updated successfully',
      deviceId
    });

  } catch (error) {
    logger.error('api', 'Failed to update device configuration', error as Error);
    return NextResponse.json(
      { error: 'Failed to update device configuration', details: (error as Error).message },
      { status: 500 }
    );
  }
}