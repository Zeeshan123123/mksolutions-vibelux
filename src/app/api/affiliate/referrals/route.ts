import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId }
    });

    if (!affiliate) {
      return NextResponse.json({ referrals: [] });
    }

    const referrals = await prisma.affiliateReferral.findMany({
      where: { affiliateId: affiliate.id },
      include: {
        referredUser: {
          select: {
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Format referrals for frontend
    const formattedReferrals = referrals.map(ref => {
      // Calculate monthly value based on status
      let monthlyValue = 0;
      let plan = 'Free';
      
      if (ref.status === 'ACTIVE') {
        // Mock subscription data - in production, fetch from Stripe
        monthlyValue = 49; // Default to Starter plan
        plan = 'Starter';
      } else if (ref.status === 'TRIAL') {
        monthlyValue = 0;
        plan = 'Trial';
      }

      return {
        id: ref.id,
        email: ref.referredEmail,
        status: ref.status.toLowerCase(),
        plan,
        monthlyValue,
        lifetimeValue: ref.totalPurchases,
        signedUpAt: ref.signedUpAt || ref.createdAt,
        lastActiveAt: ref.updatedAt
      };
    });

    return NextResponse.json({ referrals: formattedReferrals });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}