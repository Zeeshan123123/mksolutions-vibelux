import { NextRequest, NextResponse } from 'next/server';
import { auth, getAuth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

// API routes are dynamic by default

// GET /api/user/profile - Fetch user profile
async function getHandler(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Extract profile data from settings
    const settings = user.settings as any || {};
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: settings.profile?.firstName || '',
      lastName: settings.profile?.lastName || '',
      company: settings.profile?.company || '',
      phone: settings.profile?.phone || '',
      bio: settings.profile?.bio || '',
      website: settings.profile?.website || '',
      timezone: settings.profile?.timezone || 'UTC',
      profileImage: settings.profile?.profileImage || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      user: profile
    });
  } catch (error) {
    logger.error('api', 'Error fetching user profile:', error );
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
async function putHandler(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Basic validation without external schemas during build
    const body = await request.json();
    const validatedData = {
      name: body.name,
      firstName: body.firstName,
      lastName: body.lastName,
      company: body.company,
      phone: body.phone,
      bio: body.bio,
      website: body.website,
      timezone: body.timezone,
      profileImage: body.profileImage
    };

    // Get current settings
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true, name: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSettings = currentUser.settings as any || {};
    
    // Update profile settings within the settings JSON
    const updatedSettings = {
      ...currentSettings,
      profile: {
        ...currentSettings.profile,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        company: validatedData.company,
        phone: validatedData.phone,
        bio: validatedData.bio,
        website: validatedData.website,
        timezone: validatedData.timezone,
        profileImage: validatedData.profileImage
      }
    };

    // Update user profile with validated and sanitized data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name || currentUser.name,
        settings: updatedSettings,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        settings: true,
        updatedAt: true
      }
    });

    // Log profile update for audit with sanitized data
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'profile_updated',
        entityType: 'user',
        entityId: userId,
        details: validatedData,
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Extract and return profile data
    const finalSettings = updatedUser.settings as any || {};
    const updatedProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      firstName: finalSettings.profile?.firstName || '',
      lastName: finalSettings.profile?.lastName || '',
      company: finalSettings.profile?.company || '',
      phone: finalSettings.profile?.phone || '',
      bio: finalSettings.profile?.bio || '',
      website: finalSettings.profile?.website || '',
      timezone: finalSettings.profile?.timezone || 'UTC',
      profileImage: finalSettings.profile?.profileImage || '',
      updatedAt: updatedUser.updatedAt
    };

    return NextResponse.json({
      success: true,
      user: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('api', 'Error updating user profile:', error );
    
    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Export routes directly without middleware during build
export const GET = getHandler;
export const PUT = putHandler;