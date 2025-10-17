// Legacy subscription tiers for backward compatibility
export interface SubscriptionTier15 {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export const SUBSCRIPTION_TIERS_15: Record<string, SubscriptionTier15> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: ['Basic calculations', 'Email support']
  },
  professional: {
    id: 'professional', 
    name: 'Professional',
    price: 79,
    features: ['Advanced calculations', 'AI assistant', 'Priority support']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    features: ['Custom integrations', 'Dedicated support', 'API access']
  }
};

export const getTier15 = (id: string) => SUBSCRIPTION_TIERS_15[id];
export const getAllTiers15 = () => Object.values(SUBSCRIPTION_TIERS_15);