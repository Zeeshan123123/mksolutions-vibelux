/**
 * Admin Billing Analytics API
 * Get analytics data for charts and visualizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const billingPeriod = searchParams.get('billingPeriod');
    const timeRange = searchParams.get('timeRange') || '6'; // months

    // Get current billing period if not specified
    const currentPeriod = billingPeriod || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

    // Usage by plan tier
    const usageByPlan = await prisma.userUsageMetrics.groupBy({
      by: ['planTier'],
      where: { billingPeriod: currentPeriod },
      _count: true,
      _sum: {
        apiCalls: true,
        aiQueries: true,
        exports: true,
        designsCreated: true,
      },
    });

    // Overage distribution
    const overageDistribution = await prisma.userUsageMetrics.groupBy({
      by: ['overageStatus'],
      where: { billingPeriod: currentPeriod },
      _count: true,
    });

    // Usage trends over time (last N months)
    const months = parseInt(timeRange);
    const now = new Date();
    const periods: string[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const usageTrends = await Promise.all(
      periods.map(async (period) => {
        const metrics = await prisma.userUsageMetrics.aggregate({
          where: { billingPeriod: period },
          _sum: {
            apiCalls: true,
            aiQueries: true,
            exports: true,
            designsCreated: true,
            roomsCreated: true,
            fixturesAdded: true,
            mlPredictions: true,
            facilityDashboards: true,
          },
          _count: true,
        });

        return {
          period,
          ...metrics._sum,
          userCount: metrics._count,
        };
      })
    );

    // Top users by usage
    const topUsers = await prisma.userUsageMetrics.findMany({
      where: { billingPeriod: currentPeriod },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            subscriptionTier: true,
          },
        },
      },
      orderBy: [
        { apiCalls: 'desc' },
      ],
      take: 10,
    });

    // Revenue estimation (simplified)
    const revenueByPlan = usageByPlan.map((plan) => {
      const pricing: Record<string, number> = {
        free: 0,
        starter: 29,
        professional: 99,
        enterprise: 499,
      };

      return {
        planTier: plan.planTier,
        userCount: plan._count,
        monthlyRevenue: (pricing[plan.planTier.toLowerCase()] || 0) * plan._count,
      };
    });

    const totalRevenue = revenueByPlan.reduce((sum, plan) => sum + plan.monthlyRevenue, 0);

    // Alert statistics
    const alertStats = await prisma.usageOverageAlert.groupBy({
      by: ['alertType', 'sent'],
      where: {
        billingPeriod: currentPeriod,
      },
      _count: true,
    });

    return NextResponse.json({
      period: currentPeriod,
      usageByPlan,
      overageDistribution,
      usageTrends,
      topUsers,
      revenue: {
        byPlan: revenueByPlan,
        total: totalRevenue,
      },
      alerts: alertStats,
    });
  } catch (error) {
    logger.error('api', 'Admin billing analytics fetch error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

