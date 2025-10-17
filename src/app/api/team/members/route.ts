import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user's facility memberships
    const userFacilities = await prisma.facilityUser.findMany({
      where: { userId },
      include: {
        facility: {
          include: {
            users: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    // For now, we'll return members from the first facility
    // In a more complex system, you might need to specify which facility
    const facilityMembers = userFacilities[0]?.facility.users || [];

    const members = facilityMembers.map(member => ({
      id: member.user.id,
      name: member.user.name || member.user.email,
      email: member.user.email,
      role: member.role.toLowerCase(),
      status: 'active', // Simplified status since lastActiveAt field doesn't exist
      lastActive: member.user.createdAt.toISOString(), // Use createdAt since lastActiveAt doesn't exist
      joinDate: member.joinedAt.toISOString(),
      avatar: `/api/placeholder/40/40`,
      permissions: getPermissionsForRole(member.role),
      department: 'General' // Could be enhanced with actual department data
    }));

    return NextResponse.json({ members });
  } catch (error) {
    logger.error('api', 'Team members fetch error:', error );
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

function getPermissionsForRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    'OWNER': ['all'],
    'ADMIN': ['manage_users', 'manage_projects', 'manage_settings', 'view_analytics'],
    'MANAGER': ['manage_projects', 'view_analytics', 'view_reports'],
    'OPERATOR': ['manage_cultivation', 'view_reports', 'view_dashboards'],
    'VIEWER': ['view_dashboards', 'view_reports']
  };

  return permissions[role] || permissions['VIEWER'];
}