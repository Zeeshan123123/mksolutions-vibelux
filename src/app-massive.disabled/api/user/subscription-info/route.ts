import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Get subscription tier from user metadata or your billing system
    const subscriptionTier = user.publicMetadata?.subscriptionTier as string || 'free';
    
    // You might also want to verify this against your billing system
    // const billingInfo = await stripe.subscriptions.list({
    //   customer: user.publicMetadata?.stripeCustomerId
    // });

    return NextResponse.json({
      tier: subscriptionTier,
      features: getFeaturesByTier(subscriptionTier),
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress
    });

  } catch (error) {
    console.error('Failed to get subscription info:', error);
    return NextResponse.json({ 
      error: 'Failed to get subscription info' 
    }, { status: 500 });
  }
}

function getFeaturesByTier(tier: string) {
  const features = {
    free: [
      'Basic calculations',
      'Limited projects (1)',
      'Basic documentation access'
    ],
    starter: [
      'Advanced calculations', 
      'Multiple projects (5)',
      'Standard documentation',
      'Email support'
    ],
    professional: [
      'AI Assistant',
      '3D visualization',
      'Team sharing',
      'Premium documentation',
      'API access (limited)',
      'Priority support'
    ],
    business: [
      'Advanced analytics',
      'Custom branding',
      'Advanced API access',
      'Multi-facility management',
      'Phone support'
    ],
    enterprise: [
      'ML predictions',
      'IoT integration',
      'Unlimited API access',
      'Full documentation access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees'
    ]
  };

  return features[tier] || features.free;
}