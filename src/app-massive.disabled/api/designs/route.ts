/**
 * Greenhouse Design API Routes
 * Core CRUD operations for greenhouse designs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createDesignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  facilityId: z.string(),
  width: z.number().positive(),
  length: z.number().positive(),
  height: z.number().positive(),
  sideHeight: z.number().positive().optional(),
  structureType: z.enum(['GUTTER_CONNECTED', 'FREESTANDING', 'TUNNEL', 'LEAN_TO', 'RIDGE_FURROW']),
  glazingType: z.enum(['GLASS', 'POLYCARBONATE', 'POLYETHYLENE', 'ACRYLIC']),
  frameType: z.enum(['STEEL', 'ALUMINUM', 'WOOD', 'COMPOSITE']),
  roofType: z.enum(['GABLE', 'GOTHIC', 'BARREL_VAULT', 'SAWTOOTH', 'FLAT']),
  designData: z.object({}).passthrough(), // Allow any design configuration
});

const updateDesignSchema = createDesignSchema.partial().omit({ facilityId: true });

// GET /api/designs - List user's designs
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId };
    if (facilityId) whereClause.facilityId = facilityId;
    if (status) whereClause.status = status;

    // Get designs with pagination
    const [designs, total] = await Promise.all([
      prisma.greenhouseDesign.findMany({
        where: whereClause,
        include: {
          facility: {
            select: { id: true, name: true }
          },
          zones: {
            select: { id: true, name: true, zoneType: true, area: true }
          },
          equipment: {
            select: { id: true, name: true, equipmentType: true, status: true }
          },
          _count: {
            select: { zones: true, equipment: true, exports: true, revisions: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.greenhouseDesign.count({ where: whereClause })
    ]);

    return NextResponse.json({
      designs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('GET /api/designs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

// POST /api/designs - Create new design
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDesignSchema.parse(body);

    // Verify user has access to the facility
    const facility = await prisma.facility.findFirst({
      where: {
        id: validatedData.facilityId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId } } }
        ]
      }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found or access denied' },
        { status: 403 }
      );
    }

    // Calculate derived properties
    const area = validatedData.width * validatedData.length;
    const sideHeight = validatedData.sideHeight || validatedData.height * 0.6;
    const volume = area * ((sideHeight + validatedData.height) / 2); // Approximate volume

    // Create the design
    const design = await prisma.greenhouseDesign.create({
      data: {
        ...validatedData,
        userId,
        area,
        volume,
        sideHeight,
        // Initialize with empty design data if not provided
        designData: validatedData.designData || {
          zones: [],
          equipment: [],
          version: '1.0.0',
          created: new Date().toISOString()
        }
      },
      include: {
        facility: {
          select: { id: true, name: true }
        },
        zones: true,
        equipment: true
      }
    });

    return NextResponse.json(design, { status: 201 });

  } catch (error) {
    console.error('POST /api/designs error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 }
    );
  }
}