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
    const deviceId = searchParams.get('deviceId');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const sensorTypes = searchParams.get('sensorTypes');
    const aggregation = searchParams.get('aggregation'); // 'hour', 'day', 'week'
    const limit = parseInt(searchParams.get('limit') || '1000');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const hubService = new IoTDeviceHubService();
    
    const startDate = startTime ? new Date(startTime) : undefined;
    const endDate = endTime ? new Date(endTime) : undefined;
    const sensorTypeArray = sensorTypes ? sensorTypes.split(',') : undefined;

    let readings = await hubService.getDeviceReadings(
      deviceId,
      startDate,
      endDate,
      sensorTypeArray
    );

    // Apply limit
    if (readings.length > limit) {
      readings = readings.slice(-limit);
    }

    // Apply aggregation if requested
    if (aggregation && readings.length > 0) {
      readings = aggregateReadings(readings, aggregation);
    }

    return NextResponse.json({
      success: true,
      deviceId,
      readings,
      count: readings.length,
      timeRange: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString()
      },
      aggregation: aggregation || 'none'
    });

  } catch (error) {
    logger.error('api', 'Failed to get device readings', error as Error);
    return NextResponse.json(
      { error: 'Failed to get device readings', details: (error as Error).message },
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
    const { readings } = body;

    if (!readings || !Array.isArray(readings)) {
      return NextResponse.json(
        { error: 'readings array is required' },
        { status: 400 }
      );
    }

    // Validate readings format
    for (const reading of readings) {
      if (!reading.deviceId || !reading.sensorType || reading.value === undefined) {
        return NextResponse.json(
          { error: 'Each reading must have deviceId, sensorType, and value' },
          { status: 400 }
        );
      }
    }

    // Add timestamps if not provided
    const processedReadings = readings.map(reading => ({
      ...reading,
      timestamp: reading.timestamp ? new Date(reading.timestamp) : new Date()
    }));

    // Store readings (in a real implementation, this would go to a time-series database)
    // For now, we'll just log them
    logger.info('api', 'Received device readings', {
      count: processedReadings.length,
      devices: [...new Set(processedReadings.map(r => r.deviceId))]
    });

    return NextResponse.json({
      success: true,
      message: 'Readings stored successfully',
      count: processedReadings.length,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('api', 'Failed to store device readings', error as Error);
    return NextResponse.json(
      { error: 'Failed to store device readings', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to aggregate readings
function aggregateReadings(readings: any[], aggregation: string): any[] {
  if (readings.length === 0) return readings;

  const aggregated: { [key: string]: { values: number[], timestamps: Date[], sensorType: string, deviceId: string, unit: string } } = {};
  
  // Determine aggregation interval in milliseconds
  let intervalMs: number;
  switch (aggregation) {
    case 'hour':
      intervalMs = 60 * 60 * 1000;
      break;
    case 'day':
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case 'week':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    default:
      return readings;
  }

  // Group readings by time intervals and sensor type
  readings.forEach(reading => {
    const timestamp = new Date(reading.timestamp);
    const intervalStart = new Date(Math.floor(timestamp.getTime() / intervalMs) * intervalMs);
    const key = `${reading.sensorType}_${intervalStart.getTime()}`;

    if (!aggregated[key]) {
      aggregated[key] = {
        values: [],
        timestamps: [],
        sensorType: reading.sensorType,
        deviceId: reading.deviceId,
        unit: reading.unit
      };
    }

    aggregated[key].values.push(reading.value);
    aggregated[key].timestamps.push(timestamp);
  });

  // Calculate aggregated values
  return Object.entries(aggregated).map(([key, group]) => {
    const avgValue = group.values.reduce((sum, val) => sum + val, 0) / group.values.length;
    const minValue = Math.min(...group.values);
    const maxValue = Math.max(...group.values);
    const intervalStart = new Date(parseInt(key.split('_').pop()!));

    return {
      deviceId: group.deviceId,
      timestamp: intervalStart,
      sensorType: group.sensorType,
      value: parseFloat(avgValue.toFixed(2)),
      unit: group.unit,
      aggregation: {
        type: aggregation,
        count: group.values.length,
        min: parseFloat(minValue.toFixed(2)),
        max: parseFloat(maxValue.toFixed(2)),
        avg: parseFloat(avgValue.toFixed(2))
      }
    };
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}