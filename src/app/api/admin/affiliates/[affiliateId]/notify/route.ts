import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/affiliate-queries';
import { logger } from '@/lib/logging/production-logger';
import { affiliateEmailService } from '@/lib/affiliates/email-service';
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { affiliateId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin permission check

    const body = await request.json();
    const { type } = body;

    const affiliate = await db.affiliates.findById(params.affiliateId);
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    switch (type) {
      case 'approval':
        await affiliateEmailService.sendWelcomeEmail({
          email: affiliate.user.email,
          name: affiliate.user.name || 'Partner',
          affiliateCode: affiliate.code,
          commissionRate: affiliate.baseCommission
        });
        break;

      case 'suspension':
        await affiliateEmailService.sendAccountSuspension({
          email: affiliate.user.email,
          name: affiliate.user.name || 'Partner',
          reason: body.reason || 'Terms of service violation',
          contactEmail: 'affiliates@vibelux.app'
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    logger.info('api', `Sent ${type} notification to affiliate ${params.affiliateId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('api', 'Failed to send affiliate notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}