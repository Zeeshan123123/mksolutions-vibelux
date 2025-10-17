/**
 * Individual Greenhouse Design API Routes
 * GET, PUT, DELETE operations for specific designs
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateDesignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  width: z.number().positive().optional(),
  length: z.number().positive().optional(),
  height: z.number().positive().optional(),
  sideHeight: z.number().positive().optional(),
  structureType: z.enum(['GUTTER_CONNECTED', 'FREESTANDING', 'TUNNEL', 'LEAN_TO', 'RIDGE_FURROW']).optional(),
  glazingType: z.enum(['GLASS', 'POLYCARBONATE', 'POLYETHYLENE', 'ACRYLIC']).optional(),
  frameType: z.enum(['STEEL', 'ALUMINUM', 'WOOD', 'COMPOSITE']).optional(),
  roofType: z.enum(['GABLE', 'GOTHIC', 'BARREL_VAULT', 'SAWTOOTH', 'FLAT']).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'IN_CONSTRUCTION', 'COMPLETED', 'ARCHIVED']).optional(),
  designData: z.object({}).passthrough().optional(),
  forgeUrn: z.string().optional(),
  forgeViewToken: z.string().optional(),
  forgeBucketKey: z.string().optional(),
  forgeObjectKey: z.string().optional(),
});

// GET /api/designs/[id] - Get specific design
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const design = await prisma.greenhouseDesign.findFirst({
      where: {
        id: params.id,
        userId // Ensure user owns the design
      },
      include: {
        facility: {
          select: { id: true, name: true, type: true }
        },
        zones: {
          include: {
            sensors: {
              include: {
                readings: {
                  take: 1,
                  orderBy: { timestamp: 'desc' }
                }
              }
            },
            equipment: true,
            irrigation: true,
            lighting: true,
            climateData: {
              take: 10,
              orderBy: { readingAt: 'desc' }
            }
          }
        },
        equipment: {
          include: {
            sensors: {
              include: {
                readings: {
                  take: 1,
                  orderBy: { timestamp: 'desc' }
                }
              }
            }
          }
        },
        exports: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            version: true,
            title: true,
            description: true,
            changeType: true,
            changedBy: true,
            createdAt: true
          }
        }
      }
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(design);

  } catch (error) {
    console.error(`GET /api/designs/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch design' },
      { status: 500 }
    );
  }
}

// PUT /api/designs/[id] - Update design
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateDesignSchema.parse(body);

    // Get current design to check ownership and create revision
    const currentDesign = await prisma.greenhouseDesign.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!currentDesign) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    // Calculate derived properties if dimensions changed
    let derivedProperties: any = {};
    if (validatedData.width || validatedData.length || validatedData.height || validatedData.sideHeight) {
      const width = validatedData.width || currentDesign.width;
      const length = validatedData.length || currentDesign.length;
      const height = validatedData.height || currentDesign.height;
      const sideHeight = validatedData.sideHeight || currentDesign.sideHeight || height * 0.6;
      
      derivedProperties = {
        area: width * length,
        volume: width * length * ((sideHeight + height) / 2),
        sideHeight
      };
    }

    // Create revision before updating
    if (Object.keys(validatedData).length > 0) {
      await prisma.designRevision.create({
        data: {
          designId: params.id,
          version: currentDesign.version + 1,
          title: body.revisionTitle || 'Design Update',
          description: body.revisionDescription || 'Updated design properties',
          changedBy: userId,
          changeType: body.changeType || 'MINOR',
          designData: currentDesign.designData || {},
          changes: {
            updated: Object.keys(validatedData),
            timestamp: new Date().toISOString(),
            userId
          }
        }
      });
    }

    // Update the design
    const updatedDesign = await prisma.greenhouseDesign.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...derivedProperties,
        version: currentDesign.version + 1,
        updatedAt: new Date()
      },
      include: {
        facility: {
          select: { id: true, name: true }
        },
        zones: true,
        equipment: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json(updatedDesign);

  } catch (error) {
    console.error(`PUT /api/designs/${params.id} error:`, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    );
  }
}

// DELETE /api/designs/[id] - Delete design
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
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

    // Soft delete by archiving
    await prisma.greenhouseDesign.update({
      where: { id: params.id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`DELETE /api/designs/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    );
  }
}