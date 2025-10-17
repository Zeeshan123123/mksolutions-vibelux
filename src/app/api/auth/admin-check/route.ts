import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/access-control';
import { SecurityConfig } from '@/lib/security-config';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    logger.info('api', 'Admin check - userId:', { data: userId });
    logger.info('api', 'Admin check - session keys:', { data: Object.keys(session || {}) });
    
    if (!userId) {
      logger.info('api', 'Admin check - no userId found');
      return NextResponse.json({ isAdmin: false, debug: 'No userId' });
    }

    // Call isAdminUser without passing userId to let it get the session itself
    const adminStatus = await isAdminUser();
    
    logger.info('api', 'Admin check - adminStatus:', { data: adminStatus });
    logger.info('api', 'Admin check - ownerEmails:', { data: SecurityConfig.ownerEmails });
    logger.info('api', 'Admin check - adminEmails:', { data: SecurityConfig.adminEmails });
    
    return NextResponse.json({ 
      isAdmin: adminStatus.isAdmin,
      isOwner: adminStatus.isOwner,
      userEmail: adminStatus.userEmail,
      debug: {
        userId,
        ownerEmails: SecurityConfig.ownerEmails,
        adminEmails: SecurityConfig.adminEmails,
        sessionHasUserId: !!session?.userId
      }
    });
  } catch (error) {
    logger.error('api', 'Admin check error:', error );
    return NextResponse.json({ 
      isAdmin: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: 'Exception thrown'
    });
  }
}