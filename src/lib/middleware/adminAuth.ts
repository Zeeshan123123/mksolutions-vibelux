import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * Middleware to protect admin routes
 */
export async function adminAuth(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin role in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, email: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-admin-user-id', userId);
    response.headers.set('x-admin-email', user.email || '');
    
    return response;

  } catch (error) {
    logger.error('api', 'Admin auth middleware error:', error );
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Higher-order function to wrap API routes with admin authentication
 */
export function withAdminAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await adminAuth(request);
    
    // If auth failed, return the error response
    if (authResult.status !== 200) {
      return authResult;
    }
    
    // Otherwise, proceed with the original handler
    return handler(request);
  };
}