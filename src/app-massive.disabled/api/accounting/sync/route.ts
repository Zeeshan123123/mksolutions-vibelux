/**
 * Accounting Sync API V2
 * Endpoints for syncing data with actual QuickBooks and Xero APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { AccountingIntegrationServiceV2 } from '@/services/accounting-integration-v2.service';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { facilityId, operation = 'sync' } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const service = new AccountingIntegrationServiceV2();

    switch (operation) {
      case 'sync': {
        logger.info('api', 'Starting data sync', { facilityId });
        
        const invoices = await service.syncInvoices(facilityId);
        
        return NextResponse.json({
          success: true,
          message: 'Sync completed successfully',
          data: {
            invoices: invoices.length,
            timestamp: new Date()
          }
        });
      }

      case 'create_invoice': {
        const { invoice } = body;
        if (!invoice) {
          return NextResponse.json(
            { error: 'Missing invoice data' },
            { status: 400 }
          );
        }

        const invoiceId = await service.createInvoice(facilityId, {
          ...invoice,
          date: new Date(invoice.date),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined
        });

        return NextResponse.json({
          success: true,
          invoiceId,
          message: 'Invoice created successfully'
        });
      }

      case 'record_payment': {
        const { payment } = body;
        if (!payment) {
          return NextResponse.json(
            { error: 'Missing payment data' },
            { status: 400 }
          );
        }

        const paymentId = await service.recordPayment(facilityId, {
          ...payment,
          date: new Date(payment.date)
        });

        return NextResponse.json({
          success: true,
          paymentId,
          message: 'Payment recorded successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    logger.error('api', 'Sync operation failed', error as Error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const operation = searchParams.get('operation') || 'status';

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const service = new AccountingIntegrationServiceV2();

    switch (operation) {
      case 'status': {
        return NextResponse.json({
          success: true,
          status: 'active',
          lastSync: new Date(),
          message: 'Accounting integration is active'
        });
      }

      case 'invoices': {
        const invoices = await service.syncInvoices(facilityId);
        return NextResponse.json({
          success: true,
          invoices,
          count: invoices.length
        });
      }

      case 'reports': {
        const reportType = searchParams.get('reportType') as 'profit_loss' | 'balance_sheet';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const asOfDate = searchParams.get('asOfDate');
        
        if (!reportType) {
          return NextResponse.json(
            { error: 'reportType is required' },
            { status: 400 }
          );
        }

        let params: any = {};
        if (reportType === 'profit_loss') {
          if (!startDate || !endDate) {
            return NextResponse.json(
              { error: 'startDate and endDate are required for profit_loss report' },
              { status: 400 }
            );
          }
          params = { startDate, endDate };
        } else if (reportType === 'balance_sheet') {
          if (!asOfDate) {
            return NextResponse.json(
              { error: 'asOfDate is required for balance_sheet report' },
              { status: 400 }
            );
          }
          params = { asOfDate };
        }
        
        const report = await service.getFinancialReports(facilityId, reportType, params);
        
        return NextResponse.json({
          success: true,
          report
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    logger.error('api', 'Failed to get sync data', error as Error);
    
    return NextResponse.json(
      { error: 'Failed to get sync data' },
      { status: 500 }
    );
  }
}