import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/affiliate-queries';
import { logger } from '@/lib/logging/production-logger';
import { AffiliateStatus } from '@prisma/client';
export const dynamic = 'force-dynamic'

export async function PATCH(
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
    const { status } = body;

    if (!status || !Object.values(AffiliateStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const affiliate = await db.affiliates.update(params.affiliateId, {
      status: status as AffiliateStatus
    });

    // Update affiliate stats if activating
    if (status === AffiliateStatus.ACTIVE) {
      await db.affiliates.updateStats(params.affiliateId);
    }

    logger.info('api', `Updated affiliate ${params.affiliateId} status to ${status}`);

    return NextResponse.json({ success: true, affiliate });
  } catch (error) {
    logger.error('api', 'Failed to update affiliate status:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate status' },
      { status: 500 }
    );
  }
}