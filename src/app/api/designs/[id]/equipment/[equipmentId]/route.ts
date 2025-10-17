/**
 * Individual Equipment API Routes
 * Manage specific equipment items
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateEquipmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  z: z.number().optional(),
  powerRating: z.number().positive().optional(),
  efficiency: z.number().min(0).max(1).optional(),
  status: z.enum(['PLANNED', 'ORDERED', 'DELIVERED', 'INSTALLED', 'ACTIVE', 'MAINTENANCE', 'INACTIVE', 'RETIRED']).optional(),
  isActive: z.boolean().optional(),
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

// GET /api/designs/[id]/equipment/[equipmentId] - Get specific equipment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; equipmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const equipment = await prisma.greenhouseEquipment.findFirst({
      where: {
        id: params.equipmentId,
        designId: params.id
      },
      include: {
        zone: {
          select: { id: true, name: true, zoneType: true }
        },
        sensors: {
          include: {
            readings: {
              take: 100,
              orderBy: { timestamp: 'desc' }
            },
          }
        },
      }
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);

  } catch (error) {
    console.error(`GET /api/designs/${params.id}/equipment/${params.equipmentId} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

// PUT /api/designs/[id]/equipment/[equipmentId] - Update equipment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; equipmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateEquipmentSchema.parse(body);

    // Verify design ownership and get current equipment
    const [design, currentEquipment] = await Promise.all([
      prisma.greenhouseDesign.findFirst({
        where: { id: params.id, userId }
      }),
      prisma.greenhouseEquipment.findFirst({
        where: {
          id: params.equipmentId,
          designId: params.id
        }
      })
    ]);

    if (!design || !currentEquipment) {
      return NextResponse.json(
        { error: 'Design or equipment not found' },
        { status: 404 }
      );
    }

    // Check position bounds if position is being updated
    if (validatedData.x !== undefined || validatedData.y !== undefined) {
      const x = validatedData.x ?? currentEquipment.x;
      const y = validatedData.y ?? currentEquipment.y;

      if (x !== null && y !== null && (x < 0 || x > design.width || y < 0 || y > design.length)) {
        return NextResponse.json(
          { error: 'Equipment position exceeds design boundaries' },
          { status: 400 }
        );
      }
    }

    // If zoneId is being updated, verify zone exists
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

      // Check if equipment position is within zone bounds
      const x = validatedData.x ?? currentEquipment.x;
      const y = validatedData.y ?? currentEquipment.y;

      if (x !== null && y !== null && (x < zone.x || x > zone.x + zone.width ||
          y < zone.y || y > zone.y + zone.length)) {
        return NextResponse.json(
          { error: 'Equipment position is outside the specified zone' },
          { status: 400 }
        );
      }
    }

    const updatedEquipment = await prisma.greenhouseEquipment.update({
      where: { id: params.equipmentId },
      data: {
        name: validatedData.name,
        manufacturer: validatedData.manufacturer,
        model: validatedData.model,
        x: validatedData.x,
        y: validatedData.y,
        efficiency: validatedData.efficiency,
        updatedAt: new Date()
      },
      include: {
        zone: {
          select: { id: true, name: true, zoneType: true }
        },
        sensors: true
      }
    });

    return NextResponse.json(updatedEquipment);

  } catch (error) {
    console.error(`PUT /api/designs/${params.id}/equipment/${params.equipmentId} error:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

// DELETE /api/designs/[id]/equipment/[equipmentId] - Delete equipment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; equipmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Check if equipment exists
    const equipment = await prisma.greenhouseEquipment.findFirst({
      where: {
        id: params.equipmentId,
        designId: params.id
      }
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to RETIRED
    await prisma.greenhouseEquipment.update({
      where: { id: params.equipmentId },
      data: {
        status: 'DECOMMISSIONED',
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`DELETE /api/designs/${params.id}/equipment/${params.equipmentId} error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}