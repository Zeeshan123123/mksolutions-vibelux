import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const expert = await prisma.expert.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    const profile = {
      id: expert.id,
      displayName: expert.displayName,
      title: expert.title,
      bio: expert.bio,
      photoUrl: expert.photoUrl,
      specialties: expert.specialties,
      certifications: expert.certifications,
      yearsExperience: expert.yearsExperience,
      hourlyRate: expert.hourlyRate,
      linkedinUrl: expert.linkedinUrl,
      websiteUrl: expert.websiteUrl,
      timezone: expert.timezone,
      status: expert.status,
      stripeConnectId: expert.id, // Placeholder - would store actual Stripe Connect account ID
      stripeOnboardingComplete: expert.status === 'ACTIVE', // Simplified check
      email: expert.user.email,
      name: expert.user.name
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    logger.error('api', 'Error fetching expert profile:', error );
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expert profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      title,
      bio,
      specialties,
      certifications,
      hourlyRate,
      linkedinUrl,
      websiteUrl,
      timezone
    } = body;

    // Validate expert exists
    const expert = await prisma.expert.findUnique({
      where: { userId: userId }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    // Update expert profile
    const updatedExpert = await prisma.expert.update({
      where: { userId: userId },
      data: {
        displayName: displayName || expert.displayName,
        title: title || expert.title,
        bio: bio || expert.bio,
        specialties: Array.isArray(specialties) ? specialties : expert.specialties,
        certifications: Array.isArray(certifications) ? certifications : expert.certifications,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : expert.hourlyRate,
        linkedinUrl: linkedinUrl || expert.linkedinUrl,
        websiteUrl: websiteUrl || expert.websiteUrl,
        timezone: timezone || expert.timezone,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedExpert.id,
        displayName: updatedExpert.displayName,
        title: updatedExpert.title,
        bio: updatedExpert.bio,
        specialties: updatedExpert.specialties,
        certifications: updatedExpert.certifications,
        hourlyRate: updatedExpert.hourlyRate
      }
    });

  } catch (error) {
    logger.error('api', 'Error updating expert profile:', error );
    return NextResponse.json(
      { success: false, error: 'Failed to update expert profile' },
      { status: 500 }
    );
  }
}