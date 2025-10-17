/**
 * API Route: Utility OAuth Callback
 * Handles OAuth callback from utility providers
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/logging/production-logger';
import { OAuthHandler } from '@/lib/utility-integration/oauth-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors
    if (error) {
      logger.error('api', 'OAuth provider error:', new Error(`${error}: ${errorDescription}`));

      // Redirect to error page
      const errorUrl = new URL('/dashboard/facilities/utility-error', request.url);
      errorUrl.searchParams.set('error', error);
      if (errorDescription) {
        errorUrl.searchParams.set('description', errorDescription);
      }

      return NextResponse.redirect(errorUrl);
    }

    // Validate required parameters
    if (!code || !state) {
      const errorUrl = new URL('/dashboard/facilities/utility-error', request.url);
      errorUrl.searchParams.set('error', 'missing_parameters');
      errorUrl.searchParams.set('description', 'Authorization code or state parameter missing');

      return NextResponse.redirect(errorUrl);
    }

    // Handle OAuth callback
    const oauthHandler = new OAuthHandler();
    const result = await oauthHandler.handleCallback(code, state);

    if (result.success) {
      // Redirect to success page
      const successUrl = new URL('/dashboard/facilities/utility-connected', request.url);
      successUrl.searchParams.set('facilityId', result.facilityId!);
      successUrl.searchParams.set('status', 'success');

      return NextResponse.redirect(successUrl);
    } else {
      // Redirect to error page
      const errorUrl = new URL('/dashboard/facilities/utility-error', request.url);
      errorUrl.searchParams.set('error', 'callback_failed');
      errorUrl.searchParams.set('description', result.error || 'Failed to connect utility account');

      return NextResponse.redirect(errorUrl);
    }

  } catch (error) {
    logger.error('api', 'OAuth callback error:', error );

    // Redirect to error page
    const errorUrl = new URL('/dashboard/facilities/utility-error', request.url);
    errorUrl.searchParams.set('error', 'internal_error');
    errorUrl.searchParams.set('description', 'An unexpected error occurred');

    return NextResponse.redirect(errorUrl);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Some utilities may use POST for callbacks
    const body = await request.json();
    const { code, state, error, error_description } = body;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error,
          description: error_description
        },
        { status: 400 }
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters'
        },
        { status: 400 }
      );
    }

    const oauthHandler = new OAuthHandler();
    const result = await oauthHandler.handleCallback(code, state);

    if (result.success) {
      return NextResponse.json({
        success: true,
        facilityId: result.facilityId,
        message: 'Utility account connected successfully'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Callback processing failed'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    logger.error('api', 'OAuth callback POST error:', error );
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}