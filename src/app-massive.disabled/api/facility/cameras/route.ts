import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's facilities
    const facilities = await prisma.facility.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { users: { some: { userId } } },
        ],
      },
      // TODO: Add camera relations to Prisma schema
    });

    const cameras: any[] = []; // TODO: Implement camera queries when schema is updated

    return NextResponse.json({ cameras });
  } catch (error) {
    logger.error('api', 'Failed to get cameras:', error );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { facilityId, ...cameraData } = data;

    // Verify user has access to facility
    const facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId, role: { in: ['ADMIN', 'MANAGER'] } } } },
        ],
      },
    });

    if (!facility) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create camera - TODO: Implement when camera model is added to schema
    const camera = {
      id: 'camera-' + Date.now(),
      facilityId,
      ...cameraData,
      createdAt: new Date(),
    };

    return NextResponse.json({ camera });
  } catch (error) {
    logger.error('api', 'Failed to create camera:', error );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}