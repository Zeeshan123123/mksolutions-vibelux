/**
 * API Route: Utility OAuth Authorization
 * Initiates OAuth flow for utility account connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/logging/production-logger';
import { OAuthHandler } from '@/lib/utility-integration/oauth-handler';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { facilityId, providerId } = body;

    if (!facilityId || !providerId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get redirect URI from environment or construct it
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.vibelux.com';
    const redirectUri = `${baseUrl}/api/utility/oauth/callback`;

    // Initialize OAuth flow
    const oauthHandler = new OAuthHandler();
    const { authUrl, sessionId } = await oauthHandler.initializeOAuthFlow(
      facilityId,
      providerId,
      userId,
      redirectUri
    );

    return NextResponse.json({
      authUrl,
      sessionId,
      provider: providerId
    });

  } catch (error) {
    logger.error('api', 'OAuth authorization error:', error );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OAuth initialization failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint can also handle direct navigation for certain providers
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const providerId = searchParams.get('providerId');
    const userId = searchParams.get('userId');

    if (!facilityId || !providerId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.vibelux.com';
    const redirectUri = `${baseUrl}/api/utility/oauth/callback`;

    const oauthHandler = new OAuthHandler();
    const { authUrl } = await oauthHandler.initializeOAuthFlow(
      facilityId,
      providerId,
      userId,
      redirectUri
    );

    // Redirect to utility authorization page
    return NextResponse.redirect(authUrl);

  } catch (error) {
    logger.error('api', 'OAuth redirect error:', error );
    return NextResponse.json(
      { error: 'Failed to initialize OAuth' },
      { status: 500 }
    );
  }
}