import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logging/production-logger';

export async function POST(req: NextRequest) {
  // Stripe webhook is temporarily disabled due to API compatibility issues
  // TODO: Update to use correct Stripe API types for current version
  logger.info('api', 'Stripe webhook called - currently disabled');
  
  return NextResponse.json({
    success: true,
    message: 'Stripe webhook is under development',
    status: 'disabled'
  });
}