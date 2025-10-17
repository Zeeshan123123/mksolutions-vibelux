/**
 * Accounting Payments API
 * Record payments in accounting systems
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { accountingIntegrationService } from '@/services/accounting-integration.service';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const { facilityId, payment } = await request.json();

    if (!facilityId || !payment) {
      return NextResponse.json(
        { error: 'facilityId and payment data are required' },
        { status: 400 }
      );
    }

    // Validate payment data
    if (!payment.invoiceId || !payment.amount || payment.amount <= 0) {
      return NextResponse.json(
        { error: 'Payment must have valid invoiceId and positive amount' },
        { status: 400 }
      );
    }

    logger.info('api', `Recording payment in accounting system for facility ${facilityId}`);

    const paymentId = await accountingIntegrationService.recordPayment(facilityId, {
      ...payment,
      date: new Date(payment.date)
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        message: 'Payment recorded successfully'
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to record payment:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record payment' },
      { status: 500 }
    );
  }
}