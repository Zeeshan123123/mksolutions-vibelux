import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Get user from Clerk
    const user = await currentUser();
    
    // Only allow specific owner emails to have admin access
    const ownerEmails = ['blake@vibelux.ai'];
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (userEmail && ownerEmails.includes(userEmail)) {
      return NextResponse.json({ 
        isAdmin: true,
        role: 'admin',
        permissions: ['admin', 'analytics', 'reports', 'owner']
      });
    }
    
    // Check if user has admin role in Clerk metadata
    const isClerkAdmin = user?.publicMetadata?.role === 'admin' || 
                        user?.privateMetadata?.role === 'admin';
    
    // Also check database for admin status
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        role: true
        // isAdmin and permissions fields don't exist in User schema
      }
    });
    
    const isAdmin = isClerkAdmin || 
                   dbUser?.role === 'ADMIN';
    
    // Log admin access attempts
    if (isAdmin) {
      // TODO: auditLog model doesn't exist - skip audit logging
      // await prisma.auditLog.create({
      //   data: {
      //     userId,
      //     action: 'ADMIN_ACCESS_CHECK',
      //     resource: 'analytics',
      //     ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      //     userAgent: request.headers.get('user-agent') || 'unknown',
      //     success: true
      //   }
      // }).catch((error) => logger.error('api', 'Failed to create audit log', error));
    }
    
    return NextResponse.json({ 
      isAdmin,
      role: dbUser?.role || 'user',
      permissions: [] // permissions field doesn't exist in User schema
    });
    
  } catch (error) {
    logger.error('api', 'Error checking admin status:', error );
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}