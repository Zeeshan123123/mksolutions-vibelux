import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import crypto from 'crypto';

/**
 * Manual admin setup endpoint
 * This endpoint can be called once to set up initial admin users
 * REQUIRES ADMIN_SETUP_SECRET environment variable in production
 */

const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET;

// Don't throw during build time - handle at request time instead

const ADMIN_EMAILS = [
  {
    email: 'blakelange@gmail.com',
    name: 'Blake Lange',
    role: 'ADMIN' as const
  },
  {
    email: 'blake@vibelux.ai', 
    name: 'Blake Lange',
    role: 'ADMIN' as const
  }
];

export async function POST(request: NextRequest) {
  try {
    if (!SETUP_SECRET) {
      return NextResponse.json(
        { error: 'ADMIN_SETUP_SECRET environment variable is required for admin setup' },
        { status: 500 }
      );
    }
    // Additional security: Only allow in development or with proper environment setup
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_ADMIN_SETUP) {
      return NextResponse.json(
        { error: 'Admin setup not allowed in production without ALLOW_ADMIN_SETUP environment variable' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { secret } = body;

    // Check setup secret using timing-safe comparison
    if (!secret || !SETUP_SECRET || !crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(SETUP_SECRET))) {
      logger.warn('api', 'Invalid admin setup attempt from IP:', { data: request.headers.get('x-forwarded-for') || 'unknown' });
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 401 }
      );
    }

    const results: any[] = [];

    for (const adminUser of ADMIN_EMAILS) {
      try {
        // First try to find existing user
        const existingUser = await prisma.user.findUnique({
          where: { email: adminUser.email }
        });

        if (existingUser) {
          // Update existing user to admin
          const updatedUser = await prisma.user.update({
            where: { email: adminUser.email },
            data: { 
              role: adminUser.role,
              name: adminUser.name 
            }
          });
          
          results.push({
            email: adminUser.email,
            action: 'updated',
            role: updatedUser.role,
            id: updatedUser.id
          });
        } else {
          // Create new user record (they'll need to sign in with Clerk first)
          const newUser = await prisma.user.create({
            data: {
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
              clerkId: `pending_${Date.now()}`, // Temporary clerkId until they sign in
              subscriptionTier: 'PROFESSIONAL' // Give admins professional access
            }
          });

          results.push({
            email: adminUser.email,
            action: 'created',
            role: newUser.role,
            id: newUser.id,
            note: 'User needs to sign in with Clerk to activate account'
          });
        }
      } catch (error) {
        results.push({
          email: adminUser.email,
          action: 'failed',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin setup completed',
      results
    });

  } catch (error) {
    logger.error('api', 'Admin setup error:', error );
    return NextResponse.json(
      { error: 'Setup failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!SETUP_SECRET) {
    return NextResponse.json(
      { error: 'ADMIN_SETUP_SECRET environment variable is required for admin setup' },
      { status: 500 }
    );
  }
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    if (!secret || !SETUP_SECRET || !crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(SETUP_SECRET))) {
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 401 }
      );
    }

    // Check current admin status
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ADMIN_EMAILS.map(u => u.email)
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clerkId: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      adminUsers,
      totalAdminEmails: ADMIN_EMAILS.length,
      setupComplete: adminUsers.length === ADMIN_EMAILS.length
    });

  } catch (error) {
    logger.error('api', 'Admin status check error:', error );
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}