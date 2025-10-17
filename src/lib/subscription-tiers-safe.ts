// Safe subscription tiers for pricing calculator
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText?: string;
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfect for small operations',
    features: [
      'Basic lighting calculations',
      'Standard calculators',
      'Email support',
      'Basic reporting'
    ],
    buttonText: 'Start Free Trial'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    description: 'For growing operations',
    features: [
      'Everything in Starter',
      'Advanced calculators',
      'AI design assistant',
      'Priority support',
      'Custom reports',
      'Multi-facility support'
    ],
    popular: true,
    buttonText: 'Most Popular'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'For large-scale operations',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'Dedicated support',
      'Advanced analytics',
      'API access',
      'White-label options'
    ],
    buttonText: 'Contact Sales'
  }
];

export const getTierById = (id: string) => {
  return subscriptionTiers.find(tier => tier.id === id);
};

export const getTierFeatures = (tierId: string) => {
  const tier = getTierById(tierId);
  return tier?.features || [];
};

// Export the safe subscription tiers constant
export const SAFE_SUBSCRIPTION_TIERS = subscriptionTiers;