import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

export async function GET(req: NextRequest) {
  try {
    // Skip execution during build time and when email services aren't configured
    if (process.env.NODE_ENV !== 'production' || !process.env.SENDGRID_API_KEY || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        message: 'Skipped - not in production or missing configuration',
        env: process.env.NODE_ENV,
        hasEmail: !!process.env.SENDGRID_API_KEY,
        hasStripe: !!process.env.STRIPE_SECRET_KEY
      }, { status: 200 });
    }

    // Verify this is a valid cron request (in production, verify with a secret)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dynamic imports only when needed to avoid build-time execution
    const { processAutomatedBilling } = await import('@/services/invoice-generation');
    const { processDisputesAutomatically } = await import('@/services/dispute-resolution');
    
    // Process automated billing
    await processAutomatedBilling();
    
    // Process any pending disputes
    await processDisputesAutomatically();
    

    return NextResponse.json({ 
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Automated billing and dispute resolution completed'
    });

  } catch (error) {
    logger.error('api', 'Error in automated billing cron job:', error );
    return NextResponse.json({ 
      error: 'Failed to process automated billing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// This endpoint can be called by:
// 1. Vercel Cron Jobs
// 2. External cron services
// 3. GitHub Actions
// 4. Manual trigger from admin panel