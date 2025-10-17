import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/affiliate-queries';
import { logger } from '@/lib/logging/production-logger';
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
    const { baseCommission } = body;

    if (typeof baseCommission !== 'number' || baseCommission < 0 || baseCommission > 100) {
      return NextResponse.json(
        { error: 'Invalid commission rate' },
        { status: 400 }
      );
    }

    const affiliate = await db.affiliates.update(params.affiliateId, {
      baseCommission
    });

    logger.info('api', `Updated affiliate ${params.affiliateId} commission to ${baseCommission}%`);

    return NextResponse.json({ success: true, affiliate });
  } catch (error) {
    logger.error('api', 'Failed to update affiliate commission:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate commission' },
      { status: 500 }
    );
  }
}