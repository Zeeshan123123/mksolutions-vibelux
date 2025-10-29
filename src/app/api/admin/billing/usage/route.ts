/**
 * Admin Billing Usage API
 * Get usage data for all users with filtering and pagination
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
    
    // Filters
    const planTier = searchParams.get('planTier');
    const overageStatus = searchParams.get('overageStatus');
    const billingPeriod = searchParams.get('billingPeriod');
    const searchQuery = searchParams.get('search');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (billingPeriod) {
      where.billingPeriod = billingPeriod;
    } else {
      // Default to current billing period
      const now = new Date();
      where.billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (planTier) {
      where.planTier = planTier;
    }
    
    if (overageStatus) {
      where.overageStatus = overageStatus;
    }
    
    if (searchQuery) {
      where.user = {
        OR: [
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { name: { contains: searchQuery, mode: 'insensitive' } },
        ],
      };
    }

    // Get usage data with pagination
    const [usageData, total] = await Promise.all([
      prisma.userUsageMetrics.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              subscriptionTier: true,
              createdAt: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.userUsageMetrics.count({ where }),
    ]);

    // Calculate summary statistics
    const aggregations = await prisma.userUsageMetrics.aggregate({
      where,
      _sum: {
        apiCalls: true,
        aiQueries: true,
        exports: true,
        roomsCreated: true,
        fixturesAdded: true,
        designsCreated: true,
        mlPredictions: true,
        facilityDashboards: true,
      },
      _avg: {
        apiCalls: true,
        aiQueries: true,
        exports: true,
        roomsCreated: true,
        fixturesAdded: true,
        designsCreated: true,
        mlPredictions: true,
        facilityDashboards: true,
      },
    });

    return NextResponse.json({
      data: usageData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totals: aggregations._sum,
        averages: aggregations._avg,
      },
    });
  } catch (error) {
    logger.error('api', 'Admin billing usage fetch error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

