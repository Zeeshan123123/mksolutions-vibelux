import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { stripeConnect } from '@/lib/stripe/affiliate-connect';
import { db } from '@/lib/db/affiliate-queries';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliate = await db.affiliates.findByUserId(userId);
    if (!affiliate) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 });
    }

    // No Stripe account connected
    if (!affiliate.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        verified: false
      });
    }

    // Check account status with Stripe
    try {
      const isReady = await stripeConnect.isAccountReady(affiliate.stripeAccountId);
      
      return NextResponse.json({
        connected: true,
        verified: isReady,
        accountId: affiliate.stripeAccountId
      });
    } catch (error) {
      logger.error('api', `Failed to check Stripe account status for ${affiliate.stripeAccountId}:`, error);
      
      return NextResponse.json({
        connected: true,
        verified: false,
        accountId: affiliate.stripeAccountId,
        error: 'Unable to verify account status'
      });
    }
  } catch (error) {
    logger.error('api', 'Failed to get affiliate connect status:', error);
    return NextResponse.json(
      { error: 'Failed to get account status' },
      { status: 500 }
    );
  }
}