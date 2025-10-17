import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { affiliateSystem } from '@/lib/affiliates/affiliate-system';
import { affiliateEmailService } from '@/lib/affiliates/email-service';
import { db } from '@/lib/db/affiliate-queries';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      website,
      audience,
      experience,
      promotionMethod,
      expectedReferrals,
      affiliateCode,
      paymentMethod,
      paymentEmail
    } = body;

    // Validate required fields
    if (!fullName || !email || !website || !audience || !experience || !promotionMethod || !paymentEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create affiliate account
    const affiliate = await affiliateSystem.createAffiliate(userId, {
      companyName: body.companyName,
      website,
      socialMedia: body.socialMedia,
      audienceSize: body.audienceSize || parseInt(audience),
      niche: body.niche || [promotionMethod],
      requestedCommissionRate: 20 // Start at 20% for new affiliates
    });

    // Store additional application data  
    await db.affiliates.update(affiliate.id, {
      customRates: {
        paymentMethod: paymentMethod || 'stripe',
        paymentEmail,
        applicationData: {
          fullName,
          email,
          website,
          audience,
          experience,
          promotionMethod,
          expectedReferrals
        }
      }
    });

    // Send confirmation email
    await affiliateEmailService.sendApplicationReceived({
      email,
      name: fullName
    });

    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        code: affiliate.affiliateCode,
        status: affiliate.status
      },
      message: 'Application submitted successfully. You will receive an email once approved.'
    });
  } catch (error) {
    logger.error('api', 'Affiliate registration error:', error );
    return NextResponse.json(
      { error: 'Failed to register affiliate', details: String(error) },
      { status: 500 }
    );
  }
}