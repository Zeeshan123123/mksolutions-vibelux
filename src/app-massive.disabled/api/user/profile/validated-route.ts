import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { 
  withValidation, 
  withAuth, 
  withRateLimit,
  withSecurityHeaders,
  withLogging
} from '@/lib/validation/middleware';
import { userProfileUpdateSchema } from '@/lib/validation/schemas/user';

// Example of a fully validated and secured API route
async function handler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const validatedData = (req as any).validated.body;

    // Get current settings
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
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
        ...validatedData
      }
    };

    // Update user profile with validated data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
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

    // Log the update for audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'profile_updated',
        entityType: 'user',
        entityId: user.id,
        details: validatedData,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
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
    logger.error('api', 'Profile update error:', error );
    
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

// Export the route with all middleware applied
export const PUT = withLogging(
  withSecurityHeaders(
    withRateLimit(
      withAuth(
        withValidation(handler, {
          body: userProfileUpdateSchema
        }),
        { requireAuth: true }
      ),
      { max: 10, windowMs: 60000 } // 10 requests per minute
    )
  )
);