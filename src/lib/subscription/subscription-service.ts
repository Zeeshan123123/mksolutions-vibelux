// Subscription service for access control and billing
import { prisma } from '@/lib/database';
import { auth } from '@clerk/nextjs/server';

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  modules: string[];
  createdAt: Date;
  updatedAt: Date;
  currentPeriodEnd: Date;
}

export interface SubscriptionModule {
  id: string;
  name: string;
  price: number;
  features: string[];
}

// Map subscription tiers to modules
const tierModules: Record<string, string[]> = {
  FREE: [],
  STARTER: ['basic-calculations', 'email-support'],
  PROFESSIONAL: ['basic-calculations', 'email-support', 'advanced-designer', 'energy-monitoring', 'ai-assistant', 'priority-support'],
  ENTERPRISE: ['basic-calculations', 'email-support', 'advanced-designer', 'energy-monitoring', 'ai-assistant', 'priority-support', 'api-access', 'custom-integrations']
};

export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    // Get user from database by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return null;
    }

    // Return subscription based on database values
    return {
      id: user.stripeSubscriptionId || 'free-tier',
      userId: user.id,
      tierId: user.subscriptionTier?.toLowerCase() || 'free',
      status: (user.subscriptionStatus as any) || 'inactive',
      modules: tierModules[user.subscriptionTier || 'FREE'] || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentPeriodEnd: user.subscriptionPeriodEnd || new Date()
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

export async function getSubscriptionByClerkId(clerkUserId: string): Promise<Subscription | null> {
  return getSubscription(clerkUserId);
}

export async function getCurrentUserSubscription(): Promise<Subscription | null> {
  const { userId } = auth();
  if (!userId) return null;
  return getSubscription(userId);
}

export async function hasModule(userId: string, moduleId: string): Promise<boolean> {
  const subscription = await getSubscription(userId);
  return subscription?.modules.includes(moduleId) || false;
}

export async function hasModuleByClerkId(clerkUserId: string, moduleId: string): Promise<boolean> {
  const subscription = await getSubscriptionByClerkId(clerkUserId);
  return subscription?.modules.includes(moduleId) || false;
}

export async function canAccessFeature(userId: string, feature: string): Promise<boolean> {
  const subscription = await getSubscription(userId);
  if (!subscription) {
    // Allow basic features for free users
    const freeFeatures = ['basic-calculations', 'basic-design'];
    return freeFeatures.includes(feature);
  }
  
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false;
  }
  
  // Comprehensive tier feature mapping
  const tierFeatures: Record<string, string[]> = {
    free: ['basic-calculations', 'basic-design'],
    starter: ['basic-calculations', 'basic-design', 'email-support', 'standard-calculators'],
    professional: [
      'basic-calculations', 'basic-design', 'email-support', 'standard-calculators',
      'ai-assistant', 'priority-support', 'advanced-calculators', 'multi-facility',
      'custom-reports', 'cad-export', 'dlc-database', 'energy-monitoring'
    ],
    enterprise: [
      'basic-calculations', 'basic-design', 'email-support', 'standard-calculators',
      'ai-assistant', 'priority-support', 'advanced-calculators', 'multi-facility',
      'custom-reports', 'cad-export', 'dlc-database', 'energy-monitoring',
      'api-access', 'custom-integrations', 'white-label', 'dedicated-support',
      'advanced-analytics', 'team-management', 'sso'
    ]
  };
  
  return tierFeatures[subscription.tierId]?.includes(feature) || false;
}

export async function updateSubscription(clerkUserId: string, updates: Partial<{
  tierId: string;
  status: string;
  stripeSubscriptionId: string;
  subscriptionPeriodEnd: Date;
}>): Promise<Subscription> {
  try {
    // Update user in database
    const user = await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: {
        subscriptionTier: updates.tierId?.toUpperCase(),
        subscriptionStatus: updates.status,
        stripeSubscriptionId: updates.stripeSubscriptionId,
        subscriptionPeriodEnd: updates.subscriptionPeriodEnd,
        updatedAt: new Date()
      }
    });

    // Return updated subscription
    return {
      id: user.stripeSubscriptionId || 'free-tier',
      userId: user.id,
      tierId: user.subscriptionTier?.toLowerCase() || 'free',
      status: (user.subscriptionStatus as any) || 'inactive',
      modules: tierModules[user.subscriptionTier || 'FREE'] || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentPeriodEnd: user.subscriptionPeriodEnd || new Date()
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

export async function cancelSubscription(clerkUserId: string): Promise<void> {
  await updateSubscription(clerkUserId, { 
    status: 'cancelled',
    tierId: 'FREE'
  });
}

export async function reactivateSubscription(clerkUserId: string): Promise<void> {
  await updateSubscription(clerkUserId, { status: 'active' });
}

// Helper function to check if user has access to a specific tier
export async function hasAccessToTier(clerkUserId: string, requiredTier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'): Promise<boolean> {
  const subscription = await getSubscription(clerkUserId);
  if (!subscription) return requiredTier === 'FREE';
  
  const tierHierarchy = {
    'FREE': 0,
    'STARTER': 1,
    'PROFESSIONAL': 2,
    'ENTERPRISE': 3
  };
  
  const userTier = subscription.tierId.toUpperCase() as keyof typeof tierHierarchy;
  const userLevel = tierHierarchy[userTier] || 0;
  const requiredLevel = tierHierarchy[requiredTier];
  
  return userLevel >= requiredLevel;
}