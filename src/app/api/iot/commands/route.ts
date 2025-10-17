import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { IoTDeviceHubService } from '@/services/iot-device-hub.service';
import { DeviceCommand } from '@/lib/iot/device-protocols';
export const dynamic = 'force-dynamic'

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
    const { deviceId, command, parameters, priority = 'medium' } = body;

    if (!deviceId || !command) {
      return NextResponse.json(
        { error: 'deviceId and command are required' },
        { status: 400 }
      );
    }

    // Validate priority
    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be: low, medium, high, or critical' },
        { status: 400 }
      );
    }

    const deviceCommand: DeviceCommand = {
      deviceId,
      command,
      parameters: parameters || {},
      timestamp: new Date(),
      priority
    };

    const hubService = new IoTDeviceHubService();
    const success = await hubService.sendCommand(deviceCommand);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send command to device' },
        { status: 500 }
      );
    }

    logger.info('api', 'Command sent successfully', {
      deviceId,
      command,
      priority
    });

    return NextResponse.json({
      success: true,
      message: 'Command sent successfully',
      commandId: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      command,
      timestamp: deviceCommand.timestamp
    });

  } catch (error) {
    logger.error('api', 'Failed to send device command', error as Error);
    return NextResponse.json(
      { error: 'Failed to send command', details: (error as Error).message },
      { status: 500 }
    );
  }
}

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
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    // This would typically retrieve command history from a database
    // For now, returning mock data
    const commandHistory = [
      {
        id: 'cmd_001',
        deviceId,
        command: 'set_temperature',
        parameters: { temperature: 22.5 },
        timestamp: new Date(Date.now() - 60000),
        priority: 'medium',
        status: 'completed'
      },
      {
        id: 'cmd_002',
        deviceId,
        command: 'enable_irrigation',
        parameters: { duration: 300 },
        timestamp: new Date(Date.now() - 120000),
        priority: 'high',
        status: 'completed'
      }
    ];

    return NextResponse.json({
      success: true,
      deviceId,
      commands: commandHistory,
      count: commandHistory.length
    });

  } catch (error) {
    logger.error('api', 'Failed to get command history', error as Error);
    return NextResponse.json(
      { error: 'Failed to get command history', details: (error as Error).message },
      { status: 500 }
    );
  }
}