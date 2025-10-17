/**
 * Accounting Invoices API
 * Create and manage invoices in accounting systems
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { accountingIntegrationService } from '@/services/accounting-integration.service';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const { facilityId, invoice } = await request.json();

    if (!facilityId || !invoice) {
      return NextResponse.json(
        { error: 'facilityId and invoice data are required' },
        { status: 400 }
      );
    }

    // Validate invoice data
    if (!invoice.customerId || !invoice.lineItems || invoice.lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Invoice must have customerId and at least one line item' },
        { status: 400 }
      );
    }

    logger.info('api', `Creating invoice in accounting system for facility ${facilityId}`);

    const invoiceId = await accountingIntegrationService.createInvoice(facilityId, {
      ...invoice,
      date: new Date(invoice.date),
      dueDate: new Date(invoice.dueDate)
    });

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        message: 'Invoice created successfully'
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to create invoice:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    );
  }
}