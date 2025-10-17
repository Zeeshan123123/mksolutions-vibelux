import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({
        plan: 'free',
        usage: {},
        features: {}
      });
    }

    // Get user's subscription from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // Get usage records for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get real usage data from usage tracking system
    const { getCurrentPeriodUsage } = await import('@/lib/usage/usage-tracker');
    const usage = await getCurrentPeriodUsage(user.id);

    return NextResponse.json({
      plan: user?.subscriptionTier?.toLowerCase() || 'free',
      usage,
      customerId: user?.stripeCustomerId || null,
      subscriptionId: user?.stripeSubscriptionId || null,
      currentPeriodEnd: user?.subscriptionPeriodEnd || null
    });
  } catch (error) {
    logger.error('api', 'Subscription fetch error:', error );
    return NextResponse.json({
      plan: 'free',
      usage: {},
      error: 'Failed to fetch subscription'
    }, { status: 500 });
  }
}