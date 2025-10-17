import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { isUserAdmin } from '@/lib/admin/impersonation';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });
    
    if (!adminUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch recent audit logs
    const logs = await prisma.auditLog.findMany({
      where: {
        userId: adminUser.id
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    
    return NextResponse.json({ logs });
  } catch (error) {
    logger.error('api', 'Error fetching audit logs:', error );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}