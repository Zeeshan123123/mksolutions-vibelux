import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const invitation = await prisma.facilityInvite.findUnique({
      where: { token },
      include: {
        facility: {
          select: {
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

    // Check if invitation is cancelled
    if (invitation.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Invitation has been cancelled' }, { status: 410 });
    }

    // Find the inviter from the facility users
    const inviter = invitation.facility.users.find(u => u.userId === invitation.invitedBy);

    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role.toLowerCase(),
      invitedBy: invitation.invitedBy,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      status: invitation.status.toLowerCase(),
      inviterName: inviter?.user.name || inviter?.user.email || 'Unknown',
      facilityName: invitation.facility.name
    });
  } catch (error) {
    logger.error('api', 'Invitation fetch error:', error );
    return NextResponse.json({ error: 'Failed to fetch invitation' }, { status: 500 });
  }
}