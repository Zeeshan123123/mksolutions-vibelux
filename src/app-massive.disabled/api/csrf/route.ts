import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, getSessionId, logCSRFEvent } from '@/lib/csrf';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';

/**
 * GET /api/csrf
 * Generate and return a CSRF token for the current session
 */
export async function GET(req: NextRequest) {
  try {
    // Get session ID
    const sessionId = await getSessionId(req);
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unable to establish session' },
        { status: 400 }
      );
    }

    // Get auth status for logging
    const { userId } = auth();

    // Generate token
    const token = await generateCSRFToken(sessionId);

    // Log token generation
    await logCSRFEvent('generated', {
      sessionId
    });

    // Create response with token
    const response = NextResponse.json({
      token,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    });

    // Set secure cookie as backup
    response.cookies.set('vibelux-csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    logger.error('api', 'Failed to generate CSRF token:', error );
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}