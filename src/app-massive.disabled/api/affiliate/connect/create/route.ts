import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { stripeConnect } from '@/lib/stripe/affiliate-connect';
import { db } from '@/lib/db/affiliate-queries';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an affiliate
    const affiliate = await db.affiliates.findByUserId(userId);
    if (!affiliate) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 });
    }

    // Check if already has a connected account
    if (affiliate.stripeAccountId) {
      return NextResponse.json({ 
        error: 'Payment account already exists',
        accountId: affiliate.stripeAccountId 
      }, { status: 409 });
    }

    const body = await request.json();
    const { businessType, country } = body;

    // Create Stripe Connect account
    const { accountId, onboardingUrl } = await stripeConnect.createConnectAccount({
      affiliateId: affiliate.id,
      email: affiliate.user.email,
      country: country || 'US',
      businessType: businessType || 'individual'
    });

    // Update affiliate with Stripe account ID
    await db.affiliates.update(affiliate.id, {
      stripeAccountId: accountId,
      stripeAccountStatus: 'pending'
    });

    logger.info('api', `Created Stripe Connect account for affiliate ${affiliate.id}`);

    return NextResponse.json({
      success: true,
      accountId,
      onboardingUrl
    });
  } catch (error) {
    logger.error('api', 'Failed to create Stripe Connect account:', error);
    return NextResponse.json(
      { error: 'Failed to create payment account' },
      { status: 500 }
    );
  }
}