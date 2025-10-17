import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { affiliateService } from '@/lib/services/affiliate.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { affiliateId } = body;

    if (!affiliateId) {
      return NextResponse.json({ error: 'Affiliate ID required' }, { status: 400 });
    }

    // Verify user owns this affiliate account
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId }
    });

    if (!affiliate || affiliate.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Request payout
    const payout = await affiliateService.requestPayout(affiliateId);

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
        period: payout.period
      }
    });
  } catch (error) {
    logger.error('api', 'Payout request error:', error );
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Minimum payout')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to request payout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get affiliate account
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId }
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate account not found' }, { status: 404 });
    }

    // Get payout history
    const payouts = await prisma.affiliatePayout.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Get pending commissions
    const pendingCommissions = await prisma.affiliateCommission.aggregate({
      where: {
        affiliateId: affiliate.id,
        status: 'APPROVED',
        paidAt: null
      },
      _sum: { amount: true },
      _count: true
    });

    return NextResponse.json({
      success: true,
      payouts: payouts.map(payout => ({
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
        period: payout.period,
        transactionId: payout.transactionId,
        createdAt: payout.createdAt,
        paidAt: payout.paidAt
      })),
      pending: {
        amount: pendingCommissions._sum.amount || 0,
        count: pendingCommissions._count
      }
    });
  } catch (error) {
    logger.error('api', 'Error fetching payouts:', error );
    return NextResponse.json(
      { error: 'Failed to fetch payout data' },
      { status: 500 }
    );
  }
}