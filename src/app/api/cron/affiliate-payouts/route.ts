import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { processAffiliatePayouts } from '@/services/affiliate-payouts';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from our cron service
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      logger.warn('api', 'Unauthorized affiliate payout cron attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('api', 'Starting affiliate payout processing');

    const result = await processAffiliatePayouts();

    logger.info('api', 'Affiliate payout processing completed', {
      processed: result.processed,
      failed: result.failed,
      totalPaid: result.totalPaid
    });

    return NextResponse.json({
      success: result.success,
      summary: {
        processed: result.processed,
        failed: result.failed,
        totalPaid: result.totalPaid,
        errors: result.errors.length > 0 ? result.errors : undefined
      }
    });
  } catch (error) {
    logger.error('api', 'Affiliate payout processing failed:', error);
    return NextResponse.json(
      { error: 'Payout processing failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ready',
    service: 'affiliate-payouts',
    timestamp: new Date().toISOString()
  });
}