import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database with subscription info
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionPeriodEnd: true,
        subscriptionCancelAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true
      }
    });

    if (!user) {
      logger.error('api', `User not found in database for Clerk ID: ${clerkId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Define feature access and limits based on tier
    const tierFeatures = {
      FREE: {
        features: {
          'basic-design': true,
          'basic-analytics': true,
          'community-support': true
        },
        limits: {
          projects: 1,
          zones: 3,
          fixtures: 50,
          teamMembers: 1,
          apiCalls: 100
        }
      },
      GROWER: {
        features: {
          'basic-design': true,
          'advanced-design': true,
          'basic-analytics': true,
          'energy-monitoring': true,
          'community-support': true,
          'email-support': true
        },
        limits: {
          projects: 5,
          zones: 10,
          fixtures: 500,
          teamMembers: 3,
          apiCalls: 1000
        }
      },
      PROFESSIONAL: {
        features: {
          'basic-design': true,
          'advanced-design': true,
          'basic-analytics': true,
          'advanced-analytics': true,
          'energy-monitoring': true,
          'ai-assistant': true,
          'api-access': true,
          'community-support': true,
          'email-support': true,
          'priority-support': true
        },
        limits: {
          projects: 20,
          zones: 50,
          fixtures: 2000,
          teamMembers: 10,
          apiCalls: 10000
        }
      },
      BUSINESS: {
        features: {
          'basic-design': true,
          'advanced-design': true,
          'basic-analytics': true,
          'advanced-analytics': true,
          'energy-monitoring': true,
          'ai-assistant': true,
          'api-access': true,
          'multi-site': true,
          'custom-reports': true,
          'team-management': true,
          'community-support': true,
          'email-support': true,
          'priority-support': true,
          'dedicated-support': true
        },
        limits: {
          projects: -1, // Unlimited
          zones: -1,
          fixtures: -1,
          teamMembers: -1,
          apiCalls: -1
        }
      },
      ADMIN: {
        // Admins get everything
        features: {
          'basic-design': true,
          'advanced-design': true,
          'basic-analytics': true,
          'advanced-analytics': true,
          'energy-monitoring': true,
          'ai-assistant': true,
          'api-access': true,
          'multi-site': true,
          'custom-reports': true,
          'team-management': true,
          'community-support': true,
          'email-support': true,
          'priority-support': true,
          'dedicated-support': true,
          'admin-panel': true,
          'debug-tools': true
        },
        limits: {
          projects: -1,
          zones: -1,
          fixtures: -1,
          teamMembers: -1,
          apiCalls: -1
        }
      }
    };

    // Use role for admins, otherwise use subscription tier
    const effectiveTier = user.role === 'ADMIN' ? 'ADMIN' : (user.subscriptionTier || 'FREE');
    const tierConfig = tierFeatures[effectiveTier as keyof typeof tierFeatures] || tierFeatures.FREE;

    // Check if subscription is still active based on period end
    let effectiveStatus = user.subscriptionStatus || 'none';
    if (user.subscriptionPeriodEnd && new Date(user.subscriptionPeriodEnd) < new Date()) {
      effectiveStatus = 'expired';
    }

    const response = {
      tier: effectiveTier,
      status: effectiveStatus,
      features: tierConfig.features,
      limits: tierConfig.limits,
      periodEnd: user.subscriptionPeriodEnd?.toISOString() || null,
      cancelAt: user.subscriptionCancelAt?.toISOString() || null,
      isAdmin: user.role === 'ADMIN'
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('api', 'Error getting user subscription status:', error );
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}