import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { sendTeamInviteEmail } from '@/lib/email/team-invite';

export async function POST(
  request: Request,
  { params }: { params: { inviteId: string } }
) {
  try {
    const { userId } = auth();
    const { inviteId } = params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the invitation
    const invitation = await prisma.facilityInvite.findUnique({
      where: { id: inviteId },
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
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if current user is from the same facility and has permission
    const userFacility = await prisma.facilityUser.findFirst({
      where: { 
        userId,
        facilityId: invitation.facilityId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (!userFacility) {
      return NextResponse.json({ error: 'Unauthorized to resend this invitation' }, { status: 403 });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Can only resend pending invitations' }, { status: 400 });
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      // Extend the expiry date
      await prisma.facilityInvite.update({
        where: { id: inviteId },
        data: {
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      });
    }

    // Find the inviter
    const inviter = invitation.facility.users.find(u => u.userId === invitation.invitedBy);

    // Resend the invitation email
    try {
      await sendTeamInviteEmail({
        to: invitation.email,
        inviterName: inviter?.user.name || inviter?.user.email || 'Team Admin',
        role: invitation.role.toLowerCase(),
        inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${invitation.token}`
      });
    } catch (emailError) {
      logger.error('api', 'Failed to resend invitation email:', emailError);
      return NextResponse.json({ error: 'Failed to resend invitation email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invitation resent successfully' });
  } catch (error) {
    logger.error('api', 'Resend invitation error:', error );
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
  }
}