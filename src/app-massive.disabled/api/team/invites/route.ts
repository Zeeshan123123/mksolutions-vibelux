import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user's facility
    const userFacility = await prisma.facilityUser.findFirst({
      where: { userId }
    });

    if (!userFacility) {
      return NextResponse.json({ invites: [] });
    }

    // Find pending invitations for the user's facility
    const invitations = await prisma.facilityInvite.findMany({
      where: { 
        facilityId: userFacility.facilityId,
        status: 'PENDING'
      },
      include: {
        facility: {
          select: {
            users: {
              where: { userId },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const invites = invitations.map(invite => {
      const inviter = invite.facility.users.find(u => u.userId === invite.invitedBy);
      return {
        id: invite.id,
        email: invite.email,
        role: invite.role.toLowerCase(),
        invitedBy: invite.invitedBy,
        inviterName: inviter?.user.name || inviter?.user.email || 'Unknown',
        inviteDate: invite.createdAt.toISOString().split('T')[0],
        expiresDate: invite.expiresAt.toISOString().split('T')[0],
        status: invite.status.toLowerCase()
      };
    });

    return NextResponse.json({ invites });
  } catch (error) {
    logger.error('api', 'Team invites fetch error:', error );
    return NextResponse.json({ error: 'Failed to fetch team invites' }, { status: 500 });
  }
}