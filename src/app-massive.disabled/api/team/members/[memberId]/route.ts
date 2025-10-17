import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const { userId } = auth();
    const { memberId } = params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    // Check if current user has permission to update roles
    const currentUserMembership = await prisma.facilityUser.findFirst({
      where: { 
        userId,
        facility: {
          users: {
            some: { userId: memberId }
          }
        }
      }
    });

    if (!currentUserMembership || !['OWNER', 'ADMIN'].includes(currentUserMembership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update the member's role
    const updatedMembership = await prisma.facilityUser.updateMany({
      where: { 
        userId: memberId,
        facilityId: currentUserMembership.facilityId
      },
      data: {
        role: role.toUpperCase() as any,
        updatedAt: new Date()
      }
    });

    if (updatedMembership.count === 0) {
      return NextResponse.json({ error: 'Member not found or not in same facility' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member role updated successfully' });
  } catch (error) {
    logger.error('api', 'Update member role error:', error );
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const { userId } = auth();
    const { memberId } = params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user has permission to remove members
    const currentUserMembership = await prisma.facilityUser.findFirst({
      where: { 
        userId,
        facility: {
          users: {
            some: { userId: memberId }
          }
        }
      }
    });

    if (!currentUserMembership || !['OWNER', 'ADMIN'].includes(currentUserMembership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Prevent removing the facility owner
    const memberToRemove = await prisma.facilityUser.findFirst({
      where: { 
        userId: memberId,
        facilityId: currentUserMembership.facilityId
      }
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (memberToRemove.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove facility owner' }, { status: 400 });
    }

    // Remove the member from the facility
    await prisma.facilityUser.deleteMany({
      where: { 
        userId: memberId,
        facilityId: currentUserMembership.facilityId
      }
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    logger.error('api', 'Remove member error:', error );
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}