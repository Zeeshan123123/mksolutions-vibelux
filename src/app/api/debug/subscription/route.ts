import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/lib/auth/access-control';
import { SUBSCRIPTION_TIERS, MODULES } from '@/lib/pricing/unified-pricing';
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        message: 'Please sign in to check subscription status'
      }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      return NextResponse.json({
        tier: 'free',
        status: 'No subscription found',
        features: SUBSCRIPTION_TIERS.free.features,
        modules: SUBSCRIPTION_TIERS.free.modules,
        credits: SUBSCRIPTION_TIERS.free.credits,
        limits: SUBSCRIPTION_TIERS.free.limits
      });
    }

    // Get tier details
    const tierDetails = SUBSCRIPTION_TIERS[subscription.tier] || SUBSCRIPTION_TIERS.free;
    
    // Get accessible modules
    const accessibleModules = tierDetails.modules.includes('all') 
      ? Object.keys(MODULES)
      : tierDetails.modules;

    // Calculate module value
    const moduleValue = accessibleModules.reduce((total, moduleId) => {
      const module = MODULES[moduleId];
      return total + (module?.price || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        tierName: tierDetails.name,
        price: tierDetails.price,
        interval: tierDetails.interval
      },
      access: {
        features: tierDetails.features,
        modules: accessibleModules.map(id => ({
          id,
          name: MODULES[id]?.name || id,
          price: MODULES[id]?.price || 0
        })),
        moduleCount: accessibleModules.length,
        totalModuleValue: moduleValue
      },
      limits: {
        ...subscription.limits,
        ...tierDetails.limits
      },
      credits: {
        ...subscription.credits,
        ...tierDetails.credits
      },
      userPricing: tierDetails.userPricing,
      debug: {
        userId,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    console.error('Subscription debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}