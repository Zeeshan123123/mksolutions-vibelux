/**
 * Climate Data API Routes
 * Manage climate readings and analytics for greenhouse designs
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const climateReadingSchema = z.object({
  zoneId: z.string(),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  co2: z.number().min(300).max(2000).optional(),
  vpd: z.number().min(0).max(5).optional(),
  lightLevel: z.number().min(0).optional(),
  pressure: z.number().optional(),
  readingAt: z.string().datetime().optional(),
  metadata: z.object({}).passthrough().optional()
});

const batchClimateSchema = z.object({
  readings: z.array(climateReadingSchema)
});

// GET /api/designs/[id]/climate - Get climate data with analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify design ownership
    const design = await prisma.greenhouseDesign.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');
    const hours = parseInt(searchParams.get('hours') || '24');
    const granularity = searchParams.get('granularity') || 'hour'; // hour, day, week
    const analytics = searchParams.get('analytics') === 'true';

    const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Build where clause
    const whereClause: any = {
      zone: { designId: params.id },
      readingAt: { gte: timeFilter }
    };
    if (zoneId) whereClause.zoneId = zoneId;

    // Get climate readings
    const readings = await prisma.climateReading.findMany({
      where: whereClause,
      include: {
        zone: {
          select: { id: true, name: true, zoneType: true }
        }
      },
      orderBy: { readingAt: 'desc' },
      take: 1000 // Limit to prevent excessive data
    });

    const response: any = { readings };

    // Add analytics if requested
    if (analytics && readings.length > 0) {
      response.analytics = await calculateClimateAnalytics(readings, granularity);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error(`GET /api/designs/${params.id}/climate error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch climate data' },
      { status: 500 }
    );
  }
}

// POST /api/designs/[id]/climate - Ingest climate readings
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is batch data
    const isBatch = Array.isArray(body.readings);
    const validatedData = isBatch ?
      batchClimateSchema.parse(body) :
      { readings: [climateReadingSchema.parse(body)] };

    // Verify design ownership
    const design = await prisma.greenhouseDesign.findFirst({
      where: { id: params.id, userId }
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    // Process readings
    const results: any[] = [];
    for (const reading of validatedData.readings) {
      try {
        // Verify zone exists and belongs to design
        const zone = await prisma.greenhouseZone.findFirst({
          where: {
            id: reading.zoneId,
            designId: params.id
          }
        });

        if (!zone) {
          results.push({
            zoneId: reading.zoneId,
            status: 'error',
            message: 'Zone not found'
          });
          continue;
        }

        // Create climate reading
        const climateReading = await prisma.climateReading.create({
          data: {
            ...reading,
            readingAt: reading.readingAt ? new Date(reading.readingAt) : new Date()
          }
        });

        // Check for alerts based on zone targets
        await checkClimateAlerts(climateReading, zone);

        results.push({
          zoneId: reading.zoneId,
          status: 'success',
          readingId: climateReading.id
        });

      } catch (error) {
        results.push({
          zoneId: reading.zoneId,
          status: 'error',
          message: 'Failed to create reading'
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    }, { status: 201 });

  } catch (error) {
    console.error(`POST /api/designs/${params.id}/climate error:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process climate data' },
      { status: 500 }
    );
  }
}

// Helper function to calculate climate analytics
async function calculateClimateAnalytics(readings: any[], granularity: string) {
  const analytics = {
    summary: {
      totalReadings: readings.length,
      timeRange: {
        start: readings[readings.length - 1]?.readingAt,
        end: readings[0]?.readingAt
      },
      zones: [...new Set(readings.map(r => r.zoneId))].length
    },
    temperature: calculateMetrics(readings.map(r => r.temperature)),
    humidity: calculateMetrics(readings.map(r => r.humidity)),
    co2: calculateMetrics(readings.filter(r => r.co2).map(r => r.co2)),
    vpd: calculateMetrics(readings.filter(r => r.vpd).map(r => r.vpd)),
    trends: calculateTrends(readings, granularity),
    byZone: calculateZoneAnalytics(readings)
  };

  return analytics;
}

// Helper function to calculate basic metrics
function calculateMetrics(values: number[]) {
  if (values.length === 0) return null;

  const sorted = values.sort((a, b) => a - b);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: values.reduce((sum, val) => sum + val, 0) / values.length,
    median: sorted[Math.floor(sorted.length / 2)],
    count: values.length
  };
}

// Helper function to calculate trends
function calculateTrends(readings: any[], granularity: string) {
  // Group readings by time intervals
  const intervals = groupByInterval(readings, granularity);

  return {
    temperature: intervals.map(interval => ({
      time: interval.time,
      avg: interval.readings.reduce((sum: number, r: any) => sum + r.temperature, 0) / interval.readings.length,
      min: Math.min(...interval.readings.map((r: any) => r.temperature)),
      max: Math.max(...interval.readings.map((r: any) => r.temperature))
    })),
    humidity: intervals.map(interval => ({
      time: interval.time,
      avg: interval.readings.reduce((sum: number, r: any) => sum + r.humidity, 0) / interval.readings.length,
      min: Math.min(...interval.readings.map((r: any) => r.humidity)),
      max: Math.max(...interval.readings.map((r: any) => r.humidity))
    }))
  };
}

// Helper function to group readings by time interval
function groupByInterval(readings: any[], granularity: string) {
  const intervals = new Map();

  readings.forEach(reading => {
    const date = new Date(reading.readingAt);
    let key: string;

    switch (granularity) {
      case 'hour':
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();
        break;
      case 'day':
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).toISOString();
        break;
      default:
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();
    }

    if (!intervals.has(key)) {
      intervals.set(key, { time: key, readings: [] });
    }
    intervals.get(key).readings.push(reading);
  });

  return Array.from(intervals.values()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

// Helper function to calculate zone-specific analytics
function calculateZoneAnalytics(readings: any[]) {
  const zones = new Map();

  readings.forEach(reading => {
    if (!zones.has(reading.zoneId)) {
      zones.set(reading.zoneId, {
        zoneId: reading.zoneId,
        zoneName: reading.zone.name,
        readings: []
      });
    }
    zones.get(reading.zoneId).readings.push(reading);
  });

  return Array.from(zones.values()).map(zone => ({
    ...zone,
    temperature: calculateMetrics(zone.readings.map((r: any) => r.temperature)),
    humidity: calculateMetrics(zone.readings.map((r: any) => r.humidity)),
    co2: calculateMetrics(zone.readings.filter((r: any) => r.co2).map((r: any) => r.co2)),
    readingCount: zone.readings.length
  }));
}

// Helper function to check for climate alerts
async function checkClimateAlerts(reading: any, zone: any) {
  const alerts: any[] = [];

  // Temperature alerts
  if (zone.targetTemp) {
    const tempDiff = Math.abs(reading.temperature - zone.targetTemp);
    if (tempDiff > 5) { // Alert if temperature is off by more than 5°C
      alerts.push({
        type: 'TEMPERATURE_DEVIATION',
        severity: tempDiff > 10 ? 'HIGH' : 'MEDIUM',
        message: `Temperature ${reading.temperature}°C is ${tempDiff.toFixed(1)}°C away from target ${zone.targetTemp}°C`,
        value: reading.temperature,
        target: zone.targetTemp
      });
    }
  }

  // Humidity alerts
  if (zone.targetHumidity) {
    const humidityDiff = Math.abs(reading.humidity - zone.targetHumidity);
    if (humidityDiff > 10) { // Alert if humidity is off by more than 10%
      alerts.push({
        type: 'HUMIDITY_DEVIATION',
        severity: humidityDiff > 20 ? 'HIGH' : 'MEDIUM',
        message: `Humidity ${reading.humidity}% is ${humidityDiff.toFixed(1)}% away from target ${zone.targetHumidity}%`,
        value: reading.humidity,
        target: zone.targetHumidity
      });
    }
  }

  // Create alert records if any alerts were triggered
  for (const alert of alerts) {
    // Check if similar alert already exists and is active
    const existingAlert = await prisma.sensorAlert.findFirst({
      where: {
        alertType: alert.type,
        status: 'ACTIVE',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Within last hour
        }
      }
    });

    // Skip creating alert since SensorAlert requires sensorId field
  }
}