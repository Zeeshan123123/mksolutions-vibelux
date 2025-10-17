import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import axios from 'axios';
export const dynamic = 'force-dynamic'

const QUICKBOOKS_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const realmId = searchParams.get('realmId'); // QuickBooks specific

    if (error) {
      logger.error('api', 'OAuth error', undefined, { errorMessage: error });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=missing_params`);
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      logger.error('api', 'Invalid state parameter');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=invalid_state`);
    }

    const { provider, facilityId, userId: stateUserId } = stateData;

    // Verify the current user matches the state
    const { userId } = auth();
    if (userId !== stateUserId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=unauthorized`);
    }

    // Exchange code for tokens
    let tokens;
    let tenantId;

    if (provider === 'quickbooks') {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/accounting/callback`
      });

      const response = await axios.post(QUICKBOOKS_TOKEN_URL, params, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      tokens = response.data;
      
    } else if (provider === 'xero') {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/accounting/callback`,
        client_id: process.env.XERO_CLIENT_ID!,
        client_secret: process.env.XERO_CLIENT_SECRET!
      });

      const response = await axios.post(XERO_TOKEN_URL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      tokens = response.data;

      // Get tenant ID for Xero
      const connectionsResponse = await axios.get('https://api.xero.com/connections', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      tenantId = connectionsResponse.data[0]?.tenantId;
    }

    // Initialize the accounting integration with tokens
    const { AccountingIntegrationServiceV2 } = await import('@/services/accounting-integration-v2.service');
    const service = new AccountingIntegrationServiceV2();

    const success = await service.initializeIntegration({
      facilityId,
      provider,
      credentials: {
        clientId: provider === 'quickbooks' ? process.env.QUICKBOOKS_CLIENT_ID! : process.env.XERO_CLIENT_ID!,
        clientSecret: provider === 'quickbooks' ? process.env.QUICKBOOKS_CLIENT_SECRET! : process.env.XERO_CLIENT_SECRET!,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        realmId: realmId || undefined,
        tenantId: tenantId || undefined
      },
      settings: {
        autoSyncEnabled: true,
        syncInterval: 60,
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
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      }
    });

    if (!success) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=init_failed`);
    }

    logger.info('api', 'Successfully connected accounting provider', { provider, facilityId });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?success=true&provider=${provider}`);

  } catch (error) {
    logger.error('api', 'Failed to handle OAuth callback', error as Error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=callback_failed`);
  }
}