import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { affiliateService } from '@/lib/services/affiliate.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const affiliateId = searchParams.get('id');

    if (!affiliateId) {
      // Get affiliate ID by user ID
      const affiliate = await prisma.affiliate.findUnique({
        where: { userId }
      });

      if (!affiliate) {
        return NextResponse.json({ error: 'Affiliate account not found' }, { status: 404 });
      }

      const dashboardData = await affiliateService.getAffiliateDashboard(affiliate.id);
      return NextResponse.json(dashboardData);
    }

    // Verify user owns this affiliate account
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId }
    });

    if (!affiliate || affiliate.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const dashboardData = await affiliateService.getAffiliateDashboard(affiliateId);
    return NextResponse.json(dashboardData);
  } catch (error) {
    logger.error('api', 'Error fetching affiliate dashboard:', error );
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}