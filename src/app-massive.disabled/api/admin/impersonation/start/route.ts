import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createImpersonationSession } from '@/lib/admin/impersonation';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { targetUserId, reason } = await request.json();
    
    if (!targetUserId || !reason) {
      return NextResponse.json(
        { error: 'Target user ID and reason are required' },
        { status: 400 }
      );
    }
    
    // Create impersonation session
    const token = await createImpersonationSession(
      userId,
      targetUserId,
      reason,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );
    
    // Set impersonation cookie
    const cookieStore = await cookies();
    cookieStore.set('vibelux_impersonation', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Impersonation session started'
    });
  } catch (error) {
    logger.error('api', 'Error starting impersonation:', error );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}