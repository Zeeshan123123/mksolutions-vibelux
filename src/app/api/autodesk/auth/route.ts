import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

// Autodesk OAuth 2.0 authentication endpoint
export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.AUTODESK_CLIENT_ID;
    const clientSecret = process.env.AUTODESK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      logger.error('api', 'Missing Autodesk credentials');
      return NextResponse.json(
        { error: 'Autodesk credentials not configured' },
        { status: 500 }
      );
    }

    // Request access token from Autodesk
    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret,
        'scope': [
          'data:read',
          'data:write',
          'data:create',
          'bucket:read',
          'bucket:create',
          'viewables:read'
        ].join(' ')
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('api', 'Autodesk auth error:', new Error(errorText) );
      return NextResponse.json(
        { error: 'Failed to authenticate with Autodesk' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return token data to client
    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in
    });

  } catch (error) {
    logger.error('api', 'Autodesk authentication error:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}