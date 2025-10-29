/**
 * Usage Reports Cron Endpoint
 * Runs daily at midnight to generate and send usage summary reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { dailySummaryReports } from '@/services/usage-sync-jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel Cron secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('cron', 'Unauthorized cron request attempt', {
        path: '/api/cron/usage-reports',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('cron', 'Usage reports cron job triggered');

    // Run the reports job
    await dailySummaryReports();

    return NextResponse.json({
      success: true,
      message: 'Usage reports sent successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('cron', 'Usage reports cron job failed', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Usage reports failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}

