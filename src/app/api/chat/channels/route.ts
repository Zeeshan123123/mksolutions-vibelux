import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
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
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Check if user has access to facility
    const facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        // Add ownership check if needed in the future
      }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Get channels user has access to
    const channels = await prisma.chatChannel.findMany({
      where: {
        facilityId,
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            members: {
              some: {
                userId
              }
            }
          }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                createdAt: {
                  gte: new Date(0)
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formattedChannels = channels;

    return NextResponse.json({
      success: true,
      channels: formattedChannels
    });

  } catch (error) {
    logger.error('api', 'Failed to fetch channels', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch channels', details: (error as Error).message },
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
    const { facilityId, name, description, isPrivate = false, memberIds = [] } = body;

    if (!facilityId || !name) {
      return NextResponse.json(
        { error: 'facilityId and name are required' },
        { status: 400 }
      );
    }

    // TODO: Verify user has permission to create channels when chat is implemented
    // Skip permission check for now

    // TODO: Create channel when chat functionality is implemented
    /*const channel = await prisma.chatChannel.create({
      data: {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        type,
        facilityId,
        createdBy: userId,
        members: {
          create: [
            // Creator is always a member
            {
              userId,
              role: 'admin',
              notificationsEnabled: true
            },
            // Add other members
            ...memberIds.map((memberId: string) => ({
              userId: memberId,
              role: 'member',
              notificationsEnabled: true
            }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    }); */

    return NextResponse.json({
      success: true,
      message: 'Chat functionality not yet implemented'
    });

  } catch (error) {
    logger.error('api', 'Failed to create channel', error as Error);
    return NextResponse.json(
      { error: 'Failed to create channel', details: (error as Error).message },
      { status: 500 }
    );
  }
}