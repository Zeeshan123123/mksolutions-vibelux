/**
 * CSRF Token API
 * Generates CSRF tokens for authenticated requests
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { generateCSRFTokenForClient } from '@/lib/csrf';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const token = await generateCSRFTokenForClient(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Unable to generate CSRF token' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      token,
      headerName: 'x-csrf-token',
      timestamp: new Date().toISOString()
    });

    // Set token as cookie as well
    response.cookies.set('vibelux-csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/'
    });

    return response;

  } catch (error) {
    logger.error('api', 'Failed to generate CSRF token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}