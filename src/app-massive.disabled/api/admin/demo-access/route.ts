import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { isAdminUser } from '@/lib/auth/access-control';

// Demo access storage (in production, use Redis or database)
const demoAccess = new Map<string, { email: string; expires: Date; modules: string[] }>();

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const adminStatus = await isAdminUser();
    if (!adminStatus.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, durationHours = 24, modules = ['all'] } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Set demo access
    const expires = new Date(Date.now() + (durationHours * 60 * 60 * 1000));
    demoAccess.set(email, { email, expires, modules });

    return NextResponse.json({
      success: true,
      message: `Demo access granted to ${email} for ${durationHours} hours`,
      expires: expires.toISOString(),
      modules
    });
  } catch (error) {
    logger.error('api', 'Demo access error:', error );
    return NextResponse.json({ error: 'Failed to grant demo access' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const adminStatus = await isAdminUser();
    if (!adminStatus.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Clean up expired access
    const now = new Date();
    for (const [email, access] of demoAccess) {
      if (access.expires < now) {
        demoAccess.delete(email);
      }
    }

    const activeAccess = Array.from(demoAccess.values());
    
    return NextResponse.json({
      success: true,
      activeAccess,
      count: activeAccess.length
    });
  } catch (error) {
    logger.error('api', 'Demo access list error:', error );
    return NextResponse.json({ error: 'Failed to list demo access' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check if user is admin
    const adminStatus = await isAdminUser();
    if (!adminStatus.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    demoAccess.delete(email);

    return NextResponse.json({
      success: true,
      message: `Demo access revoked for ${email}`
    });
  } catch (error) {
    logger.error('api', 'Demo access revoke error:', error );
    return NextResponse.json({ error: 'Failed to revoke demo access' }, { status: 500 });
  }
}

// Helper function to check if user has demo access
export function hasDemoAccess(email: string): { hasAccess: boolean; modules: string[] } {
  const access = demoAccess.get(email);
  if (!access) return { hasAccess: false, modules: [] };
  
  if (access.expires < new Date()) {
    demoAccess.delete(email);
    return { hasAccess: false, modules: [] };
  }
  
  return { hasAccess: true, modules: access.modules };
}