/**
 * Greenhouse Zone API Routes
 * Manage zones within greenhouse designs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createZoneSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  zoneType: z.enum(['GROWING', 'PROPAGATION', 'STORAGE', 'PROCESSING', 'OFFICE', 'MAINTENANCE', 'WALKWAY']),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  length: z.number().positive(),
  height: z.number().positive(),
  targetTemp: z.number().optional(),
  targetHumidity: z.number().min(0).max(100).optional(),
  targetCO2: z.number().min(300).max(2000).optional(),
  targetVPD: z.number().min(0.4).max(2.0).optional(),
  plantDensity: z.number().positive().optional(),
  cropType: z.string().optional(),
  growthStage: z.string().optional(),
  config: z.object({}).passthrough().optional(),
});

// GET /api/designs/[id]/zones - Get zones for a design
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

    const zones = await prisma.greenhouseZone.findMany({
      where: { designId: params.id },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            equipmentType: true,
            status: true,
            isActive: true
          }
        },
        sensors: {
          include: {
            readings: {
              take: 1,
              orderBy: { timestamp: 'desc' }
            },
            alerts: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        climateData: {
          take: 24, // Last 24 readings
          orderBy: { readingAt: 'desc' }
        },
        irrigation: {
          include: {
            events: {
              where: {
                startTime: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              }
            }
          }
        },
        lighting: {
          include: {
            events: {
              where: {
                startTime: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(zones);

  } catch (error) {
    console.error(`GET /api/designs/${params.id}/zones error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}

// POST /api/designs/[id]/zones - Create new zone
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
    const validatedData = createZoneSchema.parse(body);

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

    // Calculate zone area
    const area = validatedData.width * validatedData.length;

    // Check if zone fits within design bounds
    if (validatedData.x + validatedData.width > design.width ||
        validatedData.y + validatedData.length > design.length) {
      return NextResponse.json(
        { error: 'Zone exceeds design boundaries' },
        { status: 400 }
      );
    }

    // Check for overlapping zones
    const overlappingZones = await prisma.greenhouseZone.findMany({
      where: {
        designId: params.id,
        AND: [
          { x: { lt: validatedData.x + validatedData.width } },
          { x: { gte: validatedData.x - validatedData.width } },
          { y: { lt: validatedData.y + validatedData.length } },
          { y: { gte: validatedData.y - validatedData.length } }
        ]
      }
    });

    if (overlappingZones.length > 0) {
      return NextResponse.json(
        { error: 'Zone overlaps with existing zones' },
        { status: 400 }
      );
    }

    const zone = await prisma.greenhouseZone.create({
      data: {
        ...validatedData,
        designId: params.id,
        area,
        config: validatedData.config || {}
      },
      include: {
        equipment: true,
        sensors: true
      }
    });

    return NextResponse.json(zone, { status: 201 });

  } catch (error) {
    console.error(`POST /api/designs/${params.id}/zones error:`, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create zone' },
      { status: 500 }
    );
  }
}