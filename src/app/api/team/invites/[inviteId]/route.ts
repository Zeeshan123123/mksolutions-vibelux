import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function DELETE(
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
      where: { id: inviteId }
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
      return NextResponse.json({ error: 'Unauthorized to cancel this invitation' }, { status: 403 });
    }

    // Cancel the invitation
    await prisma.facilityInvite.update({
      where: { id: inviteId },
      data: {
        status: 'CANCELLED'
      }
    });

    return NextResponse.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    logger.error('api', 'Cancel invitation error:', error );
    return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 });
  }
}