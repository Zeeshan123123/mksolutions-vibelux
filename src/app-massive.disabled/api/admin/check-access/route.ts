import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { isUserAdmin } from '@/lib/admin/impersonation';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    const isAdmin = await isUserAdmin(userId);
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    logger.error('api', 'Error checking admin access:', error );
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}