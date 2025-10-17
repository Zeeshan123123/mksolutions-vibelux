import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { stripeConnect } from '@/lib/stripe/affiliate-connect';
import { db } from '@/lib/db/affiliate-queries';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliate = await db.affiliates.findByUserId(userId);
    if (!affiliate || !affiliate.stripeAccountId) {
      return NextResponse.json({ 
        error: 'No payment account connected' 
      }, { status: 404 });
    }

    // Generate Stripe Express dashboard link
    const dashboardUrl = await stripeConnect.createDashboardLink(affiliate.stripeAccountId);

    return NextResponse.json({
      success: true,
      dashboardUrl
    });
  } catch (error) {
    logger.error('api', 'Failed to create dashboard link:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard link' },
      { status: 500 }
    );
  }
}