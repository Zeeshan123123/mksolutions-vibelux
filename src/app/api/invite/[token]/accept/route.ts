import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { userId } = auth();
    const { token } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the invitation
    const invitation = await prisma.facilityInvite.findUnique({
      where: { token },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            users: {
              where: { userId: { not: undefined } },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    // Check if invitation is already accepted or cancelled
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    if (invitation.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Invitation has been cancelled' }, { status: 410 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the invitation email matches the current user's email
    if (currentUser.email !== invitation.email) {
      return NextResponse.json({ 
        error: 'This invitation was sent to a different email address' 
      }, { status: 400 });
    }

    // Start a transaction to accept the invitation
    await prisma.$transaction(async (tx) => {
      // Mark invitation as accepted
      await tx.facilityInvite.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        }
      });

      // Check if user is already a facility member
      const existingMembership = await tx.facilityUser.findFirst({
        where: {
          userId: currentUser.id,
          facilityId: invitation.facilityId
        }
      });

      if (!existingMembership) {
        // Add the invited user to the facility
        await tx.facilityUser.create({
          data: {
            userId: currentUser.id,
            facilityId: invitation.facilityId,
            role: invitation.role,
            joinedAt: new Date(),
          }
        });
      }
    });

    return NextResponse.json({ 
      message: 'Invitation accepted successfully',
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name || currentUser.email,
      }
    });
  } catch (error) {
    logger.error('api', 'Invitation accept error:', error );
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}