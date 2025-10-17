export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for saving design
const saveDesignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Design name is required'),
  description: z.string().optional(),
  facilityId: z.string().optional(),

  room: z.object({
    width: z.number().positive(),
    length: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['ft', 'm']).default('ft'),
    dimensions: z.any().optional(),
  }),
  fixtures: z.array(z.any()).default([]),
  equipment: z.array(z.any()).optional(),
  zones: z.array(z.any()).optional(),
  calculations: z.object({
    avgPPFD: z.number().optional(),
    uniformity: z.number().optional(),
    totalPower: z.number().optional(),
    efficacy: z.number().optional(),
  }).optional(),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    lastModified: z.string().optional(),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(), // Base64 encoded thumbnail
  }).optional(),
  settings: z.any().optional(),
});

// POST /api/designs/save - Save or update design
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = saveDesignSchema.parse(body);

    // Check if user exists in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      // Create user if doesn't exist
      const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }).then(res => res.json());

      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        }
      });
    }

    // Convert to meters if needed (assuming input is in feet by default)
    const conversionFactor = validatedData.room.unit === 'm' ? 1 : 0.3048;
    const widthInMeters = validatedData.room.width * conversionFactor;
    const lengthInMeters = validatedData.room.length * conversionFactor;
    const heightInMeters = validatedData.room.height * conversionFactor;

    // Calculate area and volume in square/cubic meters
    const area = widthInMeters * lengthInMeters;
    const volume = area * heightInMeters;

    // Prepare design data
    const designData = {
      name: validatedData.name,
      description: validatedData.description,
      userId: dbUser.id,
      facilityId: validatedData.facilityId || null,
      width: widthInMeters,
      length: lengthInMeters,
      height: heightInMeters,
      area,
      volume,
      designData: {
        room: validatedData.room,
        fixtures: validatedData.fixtures,
        equipment: validatedData.equipment || [],
        zones: validatedData.zones || [],
        calculations: validatedData.calculations || {},
        settings: validatedData.settings || {},
        version: validatedData.metadata?.version || '1.0.0',
        created: validatedData.id ? undefined : new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
      thumbnail: validatedData.metadata?.thumbnail || null,
    };

    let savedDesign;

    if (validatedData.id) {
      // Update existing design
      const existingDesign = await prisma.greenhouseDesign.findFirst({
        where: {
          id: validatedData.id,
          userId: dbUser.id
        }
      });

      if (!existingDesign) {
        return NextResponse.json(
          { error: 'Design not found or access denied' },
          { status: 404 }
        );
      }

      savedDesign = await prisma.greenhouseDesign.update({
        where: { id: validatedData.id },
        data: {
          ...designData,
          version: (existingDesign.version || 0) + 1,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          facility: {
            select: { id: true, name: true }
          }
        }
      });

      // Create version history entry
      await prisma.designRevision.create({
        data: {
          designId: savedDesign.id,
          version: savedDesign.version || 1,
          changes: savedDesign.designData as any,
          userId: dbUser.id,
          message: 'Design updated',
        }
      });

    } else {
      // Create new design
      savedDesign = await prisma.greenhouseDesign.create({
        data: {
          ...designData,
          version: 1,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          facility: {
            select: { id: true, name: true }
          }
        }
      });

      // Create initial version history
      await prisma.designRevision.create({
        data: {
          designId: savedDesign.id,
          version: 1,
          changes: savedDesign.designData as any,
          userId: dbUser.id,
          message: 'Initial design creation',
        }
      });
    }

    // Track activity in audit log
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        action: validatedData.id ? 'UPDATE_DESIGN' : 'CREATE_DESIGN',
        entityType: 'GreenhouseDesign',
        entityId: savedDesign.id,
        details: {
          designName: savedDesign.name,
          version: savedDesign.version,
        }
      }
    });

    return NextResponse.json({
      success: true,
      design: savedDesign,
      message: validatedData.id ? 'Design updated successfully' : 'Design saved successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/designs/save error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save design' },
      { status: 500 }
    );
  }
}

// GET /api/designs/save - List user's saved designs
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ designs: [], total: 0 });
    }

    // Build query filters
    const where: any = {
      userId: dbUser.id,
      status: { not: 'ARCHIVED' },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.greenhouseDesign.count({ where });

    // Get designs with pagination
    const designs = await prisma.greenhouseDesign.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        facility: {
          select: { id: true, name: true }
        },
        _count: {
          select: {
            zones: true,
            equipment: true,
          }
        }
      }
    });

    return NextResponse.json({
      designs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('GET /api/designs/save error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

// DELETE /api/designs/save - Soft delete a design
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('id');

    if (!designId) {
      return NextResponse.json({ error: 'Design ID required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check ownership
    const design = await prisma.greenhouseDesign.findFirst({
      where: {
        id: designId,
        userId: dbUser.id
      }
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete by archiving
    await prisma.greenhouseDesign.update({
      where: { id: designId },
      data: { status: 'ARCHIVED' }
    });

    // Track activity in audit log
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        action: 'DELETE_DESIGN',
        entityType: 'GreenhouseDesign',
        entityId: designId,
        details: {
          designName: design.name,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Design deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/designs/save error:', error);
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    );
  }
}