/**
 * Sensor Data API Routes
 * Manage sensor data ingestion and retrieval for greenhouse designs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sensorReadingSchema = z.object({
  sensorId: z.string(),
  value: z.number(),
  unit: z.string(),
  quality: z.enum(['GOOD', 'UNCERTAIN', 'BAD']).optional(),
  timestamp: z.string().datetime().optional(),
  metadata: z.object({}).passthrough().optional()
});

const batchReadingsSchema = z.object({
  readings: z.array(sensorReadingSchema)
});

const createSensorSchema = z.object({
  name: z.string().min(1).max(100),
  sensorType: z.enum([
    'TEMPERATURE', 'HUMIDITY', 'CO2', 'LIGHT', 'SOIL_MOISTURE', 
    'PH', 'EC', 'PRESSURE', 'FLOW', 'LEVEL', 'MOTION', 'OTHER'
  ]),
  unit: z.string(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  accuracy: z.number().optional(),
  resolution: z.number().optional(),
  deviceId: z.string().optional(),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  zoneId: z.string().optional(),
  equipmentId: z.string().optional(),
  config: z.object({}).passthrough().optional()
});

// GET /api/designs/[id]/sensors - Get sensors and recent readings
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
    const sensorType = searchParams.get('type');
    const zoneId = searchParams.get('zoneId');
    const equipmentId = searchParams.get('equipmentId');
    const hours = parseInt(searchParams.get('hours') || '24');

    // Build where clause for zone sensors
    const zoneWhereClause: any = {
      zone: { designId: params.id }
    };
    if (sensorType) zoneWhereClause.sensorType = sensorType;
    if (zoneId) zoneWhereClause.zoneId = zoneId;

    // Build where clause for equipment sensors
    const equipmentWhereClause: any = {
      equipment: { designId: params.id }
    };
    if (sensorType) equipmentWhereClause.sensorType = sensorType;
    if (equipmentId) equipmentWhereClause.equipmentId = equipmentId;

    const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Get both zone and equipment sensors
    const [zoneSensors, equipmentSensors] = await Promise.all([
      prisma.zoneSensor.findMany({
        where: zoneWhereClause,
        include: {
          zone: {
            select: { id: true, name: true, zoneType: true }
          },
          readings: {
            where: { timestamp: { gte: timeFilter } },
            orderBy: { timestamp: 'desc' },
            take: 100
          },
        }
      }),
      prisma.equipmentSensor.findMany({
        where: equipmentWhereClause,
        include: {
          equipment: {
            select: { id: true, name: true, equipmentType: true }
          },
          readings: {
            where: { timestamp: { gte: timeFilter } },
            orderBy: { timestamp: 'desc' },
            take: 100
          },
        }
      })
    ]);

    // Combine and format sensor data
    const sensors = [
      ...zoneSensors.map(sensor => ({
        ...sensor,
        location: { type: 'zone', data: sensor.zone },
        parentId: sensor.zoneId,
        parentType: 'zone'
      })),
      ...equipmentSensors.map(sensor => ({
        ...sensor,
        location: { type: 'equipment', data: sensor.equipment },
        parentId: sensor.equipmentId,
        parentType: 'equipment'
      }))
    ];

    return NextResponse.json(sensors);

  } catch (error) {
    console.error(`GET /api/designs/${params.id}/sensors error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch sensors' },
      { status: 500 }
    );
  }
}

// POST /api/designs/[id]/sensors - Create new sensor or ingest readings
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
    
    // Check if this is a batch readings ingestion
    if (body.readings) {
      return handleBatchReadings(body, params.id, userId);
    }

    // Otherwise, this is creating a new sensor
    return handleCreateSensor(body, params.id, userId);

  } catch (error) {
    console.error(`POST /api/designs/${params.id}/sensors error:`, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper function to handle batch sensor readings
async function handleBatchReadings(body: any, designId: string, userId: string) {
  const validatedData = batchReadingsSchema.parse(body);

  // Verify design ownership
  const design = await prisma.greenhouseDesign.findFirst({
    where: { id: designId, userId }
  });

  if (!design) {
    return NextResponse.json(
      { error: 'Design not found' },
      { status: 404 }
    );
  }

  // Process readings in batches
  const results: any[] = [];
  for (const reading of validatedData.readings) {
    try {
      // Find the sensor (could be zone or equipment sensor)
      const [zoneSensor, equipmentSensor] = await Promise.all([
        prisma.zoneSensor.findFirst({
          where: {
            id: reading.sensorId,
            zone: { designId }
          }
        }),
        prisma.equipmentSensor.findFirst({
          where: {
            id: reading.sensorId,
            equipment: { designId }
          }
        })
      ]);

      if (!zoneSensor && !equipmentSensor) {
        results.push({
          sensorId: reading.sensorId,
          status: 'error',
          message: 'Sensor not found'
        });
        continue;
      }

      // Create sensor reading
      const sensorReading = await prisma.sensorReading.create({
        data: {
          facilityId: design.facilityId,
          sensorId: reading.sensorId,
          sensorType: 'ENVIRONMENTAL',
          value: reading.value,
          unit: reading.unit,
          quality: reading.quality || 'GOOD',
          timestamp: reading.timestamp ? new Date(reading.timestamp) : new Date(),
          ...(zoneSensor ? { zoneSensorId: reading.sensorId } : { equipmentSensorId: reading.sensorId })
        }
      });

      results.push({
        sensorId: reading.sensorId,
        status: 'success',
        readingId: sensorReading.id
      });

    } catch (error) {
      results.push({
        sensorId: reading.sensorId,
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
}

// Helper function to handle sensor creation
async function handleCreateSensor(body: any, designId: string, userId: string) {
  const validatedData = createSensorSchema.parse(body);

  // Verify design ownership
  const design = await prisma.greenhouseDesign.findFirst({
    where: { id: designId, userId }
  });

  if (!design) {
    return NextResponse.json(
      { error: 'Design not found' },
      { status: 404 }
    );
  }

  // Check position bounds
  if (validatedData.x < 0 || validatedData.x > design.width ||
      validatedData.y < 0 || validatedData.y > design.length) {
    return NextResponse.json(
      { error: 'Sensor position exceeds design boundaries' },
      { status: 400 }
    );
  }

  // Create sensor based on parent type
  let sensor;
  if (validatedData.zoneId) {
    // Verify zone exists
    const zone = await prisma.greenhouseZone.findFirst({
      where: {
        id: validatedData.zoneId,
        designId
      }
    });

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 400 }
      );
    }

    sensor = await prisma.zoneSensor.create({
      data: {
        name: validatedData.name,
        sensorType: 'TEMPERATURE' as any,
        unit: validatedData.unit,
        x: validatedData.x,
        y: validatedData.y,
        minValue: validatedData.minValue,
        maxValue: validatedData.maxValue,
        accuracy: validatedData.accuracy,
        zoneId: validatedData.zoneId!,
      }
    });
  } else if (validatedData.equipmentId) {
    // Verify equipment exists
    const equipment = await prisma.greenhouseEquipment.findFirst({
      where: {
        id: validatedData.equipmentId,
        designId
      }
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 400 }
      );
    }

    sensor = await prisma.equipmentSensor.create({
      data: {
        name: validatedData.name,
        sensorType: 'TEMPERATURE' as any,
        unit: validatedData.unit,
        minValue: validatedData.minValue,
        maxValue: validatedData.maxValue,
        accuracy: validatedData.accuracy,
        equipmentId: validatedData.equipmentId!,
      }
    });
  } else {
    return NextResponse.json(
      { error: 'Either zoneId or equipmentId must be provided' },
      { status: 400 }
    );
  }

  return NextResponse.json(sensor, { status: 201 });
}