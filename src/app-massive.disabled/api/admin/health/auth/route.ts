import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test Clerk authentication
    const { userId } = auth();
    
    // Test Clerk client connection
    const userCount = await clerkClient.users.getCount();
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      responseTime,
      details: `Authentication service operational. ${userCount} total users in Clerk`,
      metrics: {
        clerkUsers: userCount,
        currentUser: userId ? 'authenticated' : 'anonymous',
        connectionTime: responseTime
      }
    });

  } catch (error) {
    logger.error('system', 'Auth health check failed:', error);
    
    return NextResponse.json({
      status: 'down',
      error: error instanceof Error ? error.message : 'Authentication service failed',
      details: 'Unable to connect to Clerk authentication service'
    }, { status: 500 });
  }
}