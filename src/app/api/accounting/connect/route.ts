import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

// OAuth URLs
const QUICKBOOKS_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize';

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
    const provider = searchParams.get('provider');
    const facilityId = searchParams.get('facilityId');

    if (!provider || !facilityId) {
      return NextResponse.json(
        { error: 'Missing provider or facilityId' },
        { status: 400 }
      );
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId,
      facilityId,
      provider,
      timestamp: Date.now()
    })).toString('base64');

    // Build redirect URL based on provider
    let authUrl: string;

    if (provider === 'quickbooks') {
      const params = new URLSearchParams({
        client_id: process.env.QUICKBOOKS_CLIENT_ID!,
        scope: 'com.intuit.quickbooks.accounting',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/accounting/callback`,
        response_type: 'code',
        state
      });
      authUrl = `${QUICKBOOKS_AUTH_URL}?${params.toString()}`;
    } else if (provider === 'xero') {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.XERO_CLIENT_ID!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/accounting/callback`,
        scope: 'accounting.transactions accounting.contacts accounting.settings offline_access',
        state
      });
      authUrl = `${XERO_AUTH_URL}?${params.toString()}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    logger.info('api', 'Redirecting to OAuth provider', { provider, facilityId });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error('api', 'Failed to initiate OAuth connection', error as Error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}

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
    const { provider, facilityId, credentials } = body;

    if (!provider || !facilityId || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize the accounting integration
    const { AccountingIntegrationServiceV2 } = await import('@/services/accounting-integration-v2.service');
    const service = new AccountingIntegrationServiceV2();

    const success = await service.initializeIntegration({
      facilityId,
      provider,
      credentials,
      settings: {
        autoSyncEnabled: true,
        syncInterval: 60, // 1 hour
        lastSyncDate: new Date(),
        accountMappings: [],
        syncSettings: {
          syncInvoices: true,
          syncPayments: true,
          syncExpenses: true,
          syncCustomers: true,
          syncProducts: true,
          autoCreateMissingAccounts: true,
          dateRange: {
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        }
      }
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to initialize integration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${provider} integration configured successfully`
    });

  } catch (error) {
    logger.error('api', 'Failed to configure accounting integration', error as Error);
    return NextResponse.json(
      { error: 'Failed to configure integration' },
      { status: 500 }
    );
  }
}