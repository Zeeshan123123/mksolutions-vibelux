import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = [
  'blakelange@gmail.com',
  'blake@vibelux.ai'
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's current status
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, role: true, clerkId: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if user should be admin
    const shouldBeAdmin = ADMIN_EMAILS.includes(user.email);

    if (!shouldBeAdmin) {
      return NextResponse.json(
        { error: 'Email not in admin list', email: user.email },
        { status: 403 }
      );
    }

    // Grant admin access
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { role: 'ADMIN' }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin access granted',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    logger.error('api', 'Grant access error:', error );
    return NextResponse.json(
      { error: 'Failed to grant access', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's current status
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, role: true, clerkId: true }
    });

    return NextResponse.json({
      success: true,
      user,
      isAdminEmail: user ? ADMIN_EMAILS.includes(user.email) : false
    });

  } catch (error) {
    logger.error('api', 'Status check error:', error );
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}