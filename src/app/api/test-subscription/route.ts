import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSubscription, canAccessFeature, hasAccessToTier } from '@/lib/subscription/subscription-service';
import { prisma } from '@/lib/database';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'Please sign in to test subscription gating'
      }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true,
        subscriptionPeriodEnd: true,
        stripeCustomerId: true
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'User not found in database',
        message: 'Your Clerk account is not linked to a database user. This typically happens for new users.',
        clerkId: userId,
        suggestion: 'Try signing out and signing back in, or contact support.'
      }, { status: 404 });
    }

    // Get subscription details using our service
    const subscription = await getSubscription(userId);

    // Test feature access
    const featureTests = {
      'basic-calculations': await canAccessFeature(userId, 'basic-calculations'),
      'email-support': await canAccessFeature(userId, 'email-support'),
      'ai-assistant': await canAccessFeature(userId, 'ai-assistant'),
      'advanced-calculators': await canAccessFeature(userId, 'advanced-calculators'),
      'api-access': await canAccessFeature(userId, 'api-access'),
      'custom-integrations': await canAccessFeature(userId, 'custom-integrations')
    };

    // Test tier access
    const tierTests = {
      FREE: await hasAccessToTier(userId, 'FREE'),
      STARTER: await hasAccessToTier(userId, 'STARTER'),
      PROFESSIONAL: await hasAccessToTier(userId, 'PROFESSIONAL'),
      ENTERPRISE: await hasAccessToTier(userId, 'ENTERPRISE')
    };

    return NextResponse.json({
      success: true,
      message: 'Subscription gating test results',
      user: {
        email: user.email,
        databaseId: user.id,
        clerkId: userId
      },
      databaseValues: {
        tier: user.subscriptionTier || 'FREE',
        status: user.subscriptionStatus || 'inactive',
        stripeSubscriptionId: user.stripeSubscriptionId || null,
        stripeCustomerId: user.stripeCustomerId || null,
        periodEnd: user.subscriptionPeriodEnd
      },
      computedSubscription: subscription ? {
        tier: subscription.tierId,
        status: subscription.status,
        modules: subscription.modules,
        periodEnd: subscription.currentPeriodEnd
      } : null,
      featureAccess: featureTests,
      tierAccess: tierTests,
      analysis: {
        isPayingCustomer: !!user.stripeSubscriptionId,
        hasActiveSubscription: subscription?.status === 'active',
        effectiveTier: subscription?.tierId || 'free',
        recommendation: getRecommendation(user, subscription)
      }
    });

  } catch (error) {
    console.error('Test subscription error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getRecommendation(user: any, subscription: any) {
  if (!user.stripeCustomerId) {
    return 'User has never made a purchase. Show pricing page.';
  }
  if (!subscription || subscription.status === 'inactive') {
    return 'User has inactive/no subscription. Prompt to reactivate or upgrade.';
  }
  if (subscription.tierId === 'free') {
    return 'Free tier user. Show upgrade benefits.';
  }
  if (subscription.tierId === 'starter') {
    return 'Starter tier user. Highlight Professional features.';
  }
  if (subscription.tierId === 'professional') {
    return 'Professional user. Everything working correctly!';
  }
  if (subscription.tierId === 'enterprise') {
    return 'Enterprise user. Full access granted!';
  }
  return 'Unknown state - needs investigation.';
}