import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        settings: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract privacy settings from the settings JSON field
    const settings = user.settings as any || {};
    const privacySettings = {
      analyticsOptIn: settings.privacy?.analyticsOptIn ?? true,
      researchOptIn: settings.privacy?.researchOptIn ?? false,
      emailNotifications: settings.privacy?.emailNotifications ?? true,
      marketingEmails: settings.privacy?.marketingEmails ?? false,
      dataRetentionDays: settings.privacy?.dataRetentionDays ?? 365,
    };

    return NextResponse.json(privacySettings);
  } catch (error) {
    logger.error('api', 'Privacy settings fetch error:', error );
    return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      analyticsOptIn,
      researchOptIn,
      emailNotifications,
      marketingEmails,
      dataRetentionDays
    } = body;

    // Validate input
    const allowedFields = {
      analyticsOptIn: typeof analyticsOptIn === 'boolean' ? analyticsOptIn : undefined,
      researchOptIn: typeof researchOptIn === 'boolean' ? researchOptIn : undefined,
      emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : undefined,
      marketingEmails: typeof marketingEmails === 'boolean' ? marketingEmails : undefined,
      dataRetentionDays: typeof dataRetentionDays === 'number' && dataRetentionDays > 0 ? dataRetentionDays : undefined,
    };

    // Remove undefined fields
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Get current settings
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });

    const currentSettings = currentUser?.settings as any || {};
    
    // Update privacy settings within the settings JSON
    const updatedSettings = {
      ...currentSettings,
      privacy: {
        ...currentSettings.privacy,
        ...updateData
      }
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        settings: updatedSettings,
        updatedAt: new Date(),
      },
      select: {
        settings: true,
      }
    });

    // Extract and return privacy settings
    const updatedUserSettings = updatedUser.settings as any || {};
    const updatedPrivacySettings = {
      analyticsOptIn: updatedUserSettings.privacy?.analyticsOptIn ?? true,
      researchOptIn: updatedUserSettings.privacy?.researchOptIn ?? false,
      emailNotifications: updatedUserSettings.privacy?.emailNotifications ?? true,
      marketingEmails: updatedUserSettings.privacy?.marketingEmails ?? false,
      dataRetentionDays: updatedUserSettings.privacy?.dataRetentionDays ?? 365,
    };

    return NextResponse.json(updatedPrivacySettings);
  } catch (error) {
    logger.error('api', 'Privacy settings update error:', error );
    return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
  }
}