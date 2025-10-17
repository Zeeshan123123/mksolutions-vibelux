/**
 * API Route: Utility Authorization
 * Handles customer utility account authorization via UtilityAPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { sql } from '@/lib/db';

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

    // Generate customer-specific authorization URL
    const authUrl = `https://utilityapi.com/authorize/blake_vibelux?facility_id=${facilityId}&user_id=${userId}`;

    return NextResponse.json({
      authorizationUrl: authUrl,
      instructions: [
        'Click the link to authorize VibeLux to access your utility data',
        'Login with your utility account credentials',
        'Grant permission for energy data access',
        'Return to VibeLux to complete setup'
      ]
    });

  } catch (error) {
    logger.error('api', 'Authorization URL error:', error );
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}

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
    const { facilityId, authorizationCode, utilityAccountId } = body;

    if (!facilityId || !authorizationCode) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Store the authorization in database
    await sql`
      INSERT INTO utility_connections (
        facility_id,
        user_id,
        provider_id,
        authorization_code,
        utility_account_id,
        connection_status,
        created_at
      ) VALUES (
        ${facilityId},
        ${userId},
        'utilityapi',
        ${authorizationCode},
        ${utilityAccountId},
        'pending',
        NOW()
      )
    `;

    // Trigger initial data sync
    await initiateDataSync(facilityId, authorizationCode);

    return NextResponse.json({
      success: true,
      message: 'Utility authorization successful',
      status: 'pending_data_sync'
    });

  } catch (error) {
    logger.error('api', 'Authorization processing error:', error );
    return NextResponse.json(
      { error: 'Failed to process authorization' },
      { status: 500 }
    );
  }
}

async function initiateDataSync(facilityId: string, authCode: string) {
  // This would trigger the UtilityAPI connector to fetch historical data
  logger.info('api', `🔄 Initiating data sync for facility ${facilityId}`);
  
  // In a real implementation, you would:
  // 1. Call UtilityAPI to get customer's historical data
  // 2. Store usage and billing data in database
  // 3. Update connection status to 'active'
  // 4. Send notification to customer
}