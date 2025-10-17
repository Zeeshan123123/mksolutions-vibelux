/**
 * Greenhouse Equipment API Routes
 * Manage equipment within greenhouse designs
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createEquipmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  equipmentType: z.enum([
    'HEATING', 'COOLING', 'VENTILATION', 'IRRIGATION', 'LIGHTING',
    'CO2_INJECTION', 'DEHUMIDIFIER', 'HUMIDIFIER', 'FERTILIZER_INJECTOR',
    'MONITORING', 'AUTOMATION', 'SHADING', 'FOGGING', 'OTHER'
  ]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  powerRating: z.number().positive().optional(),
  efficiency: z.number().min(0).max(1).optional(),
  operatingTemp: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  operatingHumidity: z.object({
    min: z.number().min(0).max(100),
    max: z.number().min(0).max(100)
  }).optional(),
  config: z.object({}).passthrough().optional(),
  zoneId: z.string().optional(),
});

const updateEquipmentSchema = createEquipmentSchema.partial();

// GET /api/designs/[id]/equipment - Get equipment for a design
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
    const equipmentType = searchParams.get('type');
    const status = searchParams.get('status');
    const zoneId = searchParams.get('zoneId');

    // Build where clause
    const whereClause: any = { designId: params.id };
    if (equipmentType) whereClause.equipmentType = equipmentType;
    if (status) whereClause.status = status;
    if (zoneId) whereClause.zoneId = zoneId;

    const equipment = await prisma.greenhouseEquipment.findMany({
      where: whereClause,
      include: {
        zone: {
          select: { id: true, name: true, zoneType: true }
        },
        sensors: {
          include: {
            readings: {
              take: 1,
              orderBy: { timestamp: 'desc' }
            },
          }
        },
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(equipment);

  } catch (error) {
    console.error(`GET /api/designs/${params.id}/equipment error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

// POST /api/designs/[id]/equipment - Create new equipment
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
    const validatedData = createEquipmentSchema.parse(body);

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

    // Check if equipment position is within design bounds
    if (validatedData.x < 0 || validatedData.x > design.width ||
        validatedData.y < 0 || validatedData.y > design.length) {
      return NextResponse.json(
        { error: 'Equipment position exceeds design boundaries' },
        { status: 400 }
      );
    }

    // If zoneId provided, verify zone exists and belongs to design
    if (validatedData.zoneId) {
      const zone = await prisma.greenhouseZone.findFirst({
        where: {
          id: validatedData.zoneId,
          designId: params.id
        }
      });

      if (!zone) {
        return NextResponse.json(
          { error: 'Zone not found in this design' },
          { status: 400 }
        );
      }

      // Check if equipment is within zone bounds
      if (validatedData.x < zone.x || validatedData.x > zone.x + zone.width ||
          validatedData.y < zone.y || validatedData.y > zone.y + zone.length) {
        return NextResponse.json(
          { error: 'Equipment position is outside the specified zone' },
          { status: 400 }
        );
      }
    }

    const equipment = await prisma.greenhouseEquipment.create({
      data: {
        name: validatedData.name,
        equipmentType: 'MONITORING' as any,
        manufacturer: validatedData.manufacturer,
        model: validatedData.model,
        x: validatedData.x,
        y: validatedData.y,
        efficiency: validatedData.efficiency,
        designId: params.id,
        status: 'OFFLINE',
        isActive: false,
        settings: {},
        specifications: {},
      },
      include: {
        zone: {
          select: { id: true, name: true, zoneType: true }
        },
        sensors: true
      }
    });

    return NextResponse.json(equipment, { status: 201 });

  } catch (error) {
    console.error(`POST /api/designs/${params.id}/equipment error:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}