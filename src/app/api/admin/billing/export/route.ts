/**
 * Admin Billing Export API
 * Export usage data to CSV
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
    
    // Get current billing period if not specified
    const currentPeriod = billingPeriod || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

    // Fetch all usage data for the period
    const usageData = await prisma.userUsageMetrics.findMany({
      where: { billingPeriod: currentPeriod },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            subscriptionTier: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Generate CSV
    const headers = [
      'User ID',
      'Email',
      'Name',
      'Plan Tier',
      'Overage Status',
      'API Calls',
      'AI Queries',
      'Exports',
      'Designs Created',
      'Rooms Created',
      'Fixtures Added',
      'ML Predictions',
      'Facility Dashboards',
      'Last Synced',
      'User Created At',
    ];

    const rows = usageData.map((metrics) => [
      metrics.userId,
      metrics.user.email,
      metrics.user.name || '',
      metrics.planTier,
      metrics.overageStatus,
      metrics.apiCalls,
      metrics.aiQueries,
      metrics.exports,
      metrics.designsCreated,
      metrics.roomsCreated,
      metrics.fixturesAdded,
      metrics.mlPredictions,
      metrics.facilityDashboards,
      metrics.lastSyncedAt.toISOString(),
      metrics.user.createdAt.toISOString(),
    ]);

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    // Return as downloadable CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="usage-export-${currentPeriod}.csv"`,
      },
    });
  } catch (error) {
    logger.error('api', 'Admin billing export error', { error });
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

