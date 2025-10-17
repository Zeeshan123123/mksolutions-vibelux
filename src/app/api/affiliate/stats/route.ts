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

    // Get or create affiliate record
    let affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        referrals: true,
        clicks: true,
      }
    });

    if (!affiliate) {
      // Auto-create affiliate account for logged-in users
      const code = generateAffiliateCode();
      affiliate = await prisma.affiliate.create({
        data: {
          userId,
          code,
          tier: 'BRONZE',
          status: 'ACTIVE',
          baseCommission: 25,
          totalReferrals: 0,
          activeReferrals: 0,
          totalRevenue: 0,
          totalCommission: 0,
          totalClicks: 0
        },
        include: {
          referrals: true,
          clicks: true,
        }
      });
    }

    // Calculate stats
    const activeReferrals = affiliate.referrals.filter(
      r => r.status === 'ACTIVE' || r.status === 'TRIAL'
    ).length;

    const totalRevenue = affiliate.referrals.reduce(
      (sum, r) => sum + r.totalPurchases, 0
    );

    const totalCommission = affiliate.referrals.reduce(
      (sum, r) => sum + r.totalCommission, 0
    );

    // Calculate pending payout (last 30 days commissions)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const pendingPayout = await prisma.affiliateCommission.aggregate({
      where: {
        affiliateId: affiliate.id,
        status: 'PENDING',
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        amount: true
      }
    });

    // Determine tier based on active referrals
    let tier = 'bronze';
    let nextTierProgress = 0;
    
    if (activeReferrals >= 101) {
      tier = 'platinum';
      nextTierProgress = 100;
    } else if (activeReferrals >= 51) {
      tier = 'gold';
      nextTierProgress = ((activeReferrals - 51) / 50) * 100;
    } else if (activeReferrals >= 11) {
      tier = 'silver';
      nextTierProgress = ((activeReferrals - 11) / 40) * 100;
    } else {
      tier = 'bronze';
      nextTierProgress = (activeReferrals / 10) * 100;
    }

    const stats = {
      totalClicks: affiliate.totalClicks,
      totalConversions: affiliate.totalReferrals,
      conversionRate: affiliate.totalClicks > 0 
        ? (affiliate.totalReferrals / affiliate.totalClicks) * 100 
        : 0,
      totalRevenue,
      totalCommission,
      pendingPayout: pendingPayout._sum.amount || 0,
      activeReferrals,
      tier,
      nextTierProgress
    };

    return NextResponse.json({
      stats,
      affiliateCode: affiliate.code
    });

  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate stats' },
      { status: 500 }
    );
  }
}

function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VB';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}