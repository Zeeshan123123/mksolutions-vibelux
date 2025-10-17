import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getUsageStats } from '@/lib/auth/rate-limiter';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'daily' | 'monthly' | 'all' || 'all';
    
    // Get usage statistics
    const stats = await getUsageStats(userId, period);
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        period,
        ...stats
      }
    });
    
  } catch (error) {
    logger.error('api', 'Failed to get usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve usage statistics' },
      { status: 500 }
    );
  }
}