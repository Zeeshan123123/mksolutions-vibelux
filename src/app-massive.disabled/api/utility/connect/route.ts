/**
 * API Route: Connect Utility Account
 * Initiates utility account connection process
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { UtilityAPIManager } from '@/lib/utility-integration/utility-api-manager';
import { UtilityAPIConnector } from '@/lib/utility-integration/connectors/utilityapi-connector';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { facilityId, providerId, connectionMethod, credentials } = body;

    if (!facilityId || !providerId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const utilityManager = new UtilityAPIManager();

    // Handle different connection methods
    switch (connectionMethod) {
      case 'oauth': {
        // OAuth flow - redirect to authorization
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.vibelux.com';
        const authUrl = `${baseUrl}/api/utility/oauth/authorize`;
        
        return NextResponse.json({
          method: 'oauth',
          authUrl,
          facilityId,
          providerId
        });
      }

      case 'utilityapi': {
        // UtilityAPI form-based flow
        const connector = new UtilityAPIConnector({
          apiKey: process.env.UTILITYAPI_KEY!
        });

        const form = await connector.createAuthorizationForm(
          providerId,
          credentials?.email,
          credentials?.accountNumber
        );

        return NextResponse.json({
          method: 'utilityapi',
          formUrl: form.https_auth_url,
          formId: form.uid,
          facilityId,
          providerId
        });
      }

      case 'credentials': {
        // Direct credentials flow
        if (!credentials?.accountNumber) {
          return NextResponse.json(
            { error: 'Account credentials required' },
            { status: 400 }
          );
        }

        const account = await utilityManager.connectUtilityAccount(
          facilityId,
          providerId,
          credentials
        );

        return NextResponse.json({
          success: true,
          account: {
            id: account.id,
            status: account.status,
            accountNumber: account.accountNumber
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid connection method' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Utility connection error:', error );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID required' },
        { status: 400 }
      );
    }

    const utilityManager = new UtilityAPIManager();
    const accounts = utilityManager.getFacilityAccounts(facilityId);

    return NextResponse.json({
      accounts: accounts.map(account => ({
        id: account.id,
        providerId: account.providerId,
        accountNumber: account.accountNumber,
        status: account.status,
        lastSyncDate: account.lastSyncDate,
        connectionDate: account.connectionDate
      }))
    });

  } catch (error) {
    logger.error('api', 'Get utility accounts error:', error );
    return NextResponse.json(
      { error: 'Failed to retrieve accounts' },
      { status: 500 }
    );
  }
}