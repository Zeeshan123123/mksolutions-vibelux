import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null as any;

// Client-side Stripe promise - temporarily disabled to fix development issues
export const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Legacy function for backward compatibility
export const getStripeJs = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return stripePromise;
};

// Updated pricing plans to match unified pricing
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Explore basic features',
    price: {
      monthly: 0,
      annually: 0
    },
    interval: null,
    stripePriceId: null,
    features: [
      '1 grow room',
      '2 saved designs', 
      'Basic PPFD calculators',
      'Limited fixture library',
      'Community support',
      '5 AI queries/month'
    ],
    limitations: {
      rooms: 1,
      savedDesigns: 2,
      fixtures: 50,
      users: 1,
      aiQueries: 5,
      exportFormats: [],
      cadImports: 0 // No CAD imports in free tier
    }
  },
  grower: {
    id: 'grower',
    name: 'Grower',
    description: 'Perfect for small operations',
    price: {
      monthly: 29,
      annually: 23 // per month when billed annually (20% off)
    },
    stripePriceId: {
      monthly: process.env.STRIPE_GROWER_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_GROWER_ANNUAL_PRICE_ID
    },
    interval: 'month',
    features: [
      '10 grow rooms',
      '50 saved designs',
      'Heat map visualizations',
      '500+ fixture library',
      'Environmental monitoring',
      'Mobile app access',
      'Email support (24hr)',
      '50 AI queries/month',
      'Basic analytics',
      'PDF exports',
      '5 CAD file imports/month (DWG, DXF, STEP)'
    ],
    limitations: {
      rooms: 10,
      savedDesigns: 50,
      fixtures: 500,
      users: 3,
      aiQueries: 50,
      exportFormats: ['pdf'],
      cadImports: 5, // 5 simple CAD conversions per month
      cadFormats: ['dwg', 'dxf', 'step', 'stl', 'obj'] // Simple formats only
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced features for serious cultivators',
    price: {
      monthly: 99,
      annually: 79 // per month when billed annually (20% off)
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID
    },
    interval: 'month',
    features: [
      '50 grow rooms',
      'Unlimited saved designs',
      'AI-powered optimization',
      'Predictive maintenance',
      'Advanced energy analytics',
      'Yield predictions',
      'Custom reports',
      'Priority support (4hr)',
      '250 AI queries/month',
      'API access (100k/mo)',
      'Team collaboration (10 users)',
      '1-on-1 onboarding',
      'All export formats',
      '20 CAD imports/month (60+ formats)',
      'Revit & IFC BIM support',
      '3D model viewer & heatmaps'
    ],
    limitations: {
      rooms: 50,
      savedDesigns: -1, // unlimited
      fixtures: -1, // all fixtures
      users: 10,
      aiQueries: 250,
      apiCalls: 100000,
      exportFormats: ['pdf', 'excel', 'csv', 'json'],
      cadImports: 20, // 20 CAD conversions per month
      cadFormats: 'all' // All 60+ supported formats including Revit, IFC
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'Complete solution for commercial operations',
    price: {
      monthly: 299,
      annually: 239 // per month when billed annually (20% off)
    },
    stripePriceId: {
      monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID
    },
    interval: 'month',
    features: [
      'Unlimited grow rooms',
      'Unlimited saved designs',
      'Multi-facility management',
      'White label options',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantee',
      'Advanced compliance tools',
      'Dedicated support',
      'Unlimited AI queries',
      'Unlimited API access',
      'Unlimited team members',
      'Custom training',
      'Unlimited CAD imports',
      'Multi-model coordination',
      'Advanced BIM workflows',
      'Real-time collaboration'
    ],
    limitations: {
      rooms: -1,
      savedDesigns: -1,
      fixtures: -1,
      users: -1,
      aiQueries: -1,
      apiCalls: -1,
      exportFormats: ['all'],
      cadImports: -1, // Unlimited CAD conversions
      cadFormats: 'all'
    }
  }
};

export type PricingPlan = typeof PRICING_PLANS[keyof typeof PRICING_PLANS];

// Subscription status interface
export interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';
  plan: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

/**
 * Format price for display
 */
export function formatPrice(priceInDollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInDollars);
}

/**
 * Check if user has access to a feature based on their plan
 */
export function hasFeatureAccess(userPlan: string, feature: string): boolean {
  const featureMatrix = {
    free: [
      'basic_design',
      'basic_ppfd',
      'fixtures_limited',
      'ai_queries_limited',
      'community_support'
    ],
    grower: [
      'basic_design',
      'cad_import_basic',
      'pdf_export', 
      'heat_maps',
      'environmental_monitoring',
      'mobile_app',
      'fixtures_standard',
      'ai_queries_basic',
      'email_support',
      'multi_room_limited',
      'basic_analytics'
    ],
    professional: [
      'unlimited_design',
      'all_exports',
      'advanced_ppfd',
      'fixtures_full',
      'ai_optimization',
      'predictive_maintenance',
      'yield_predictions',
      'custom_reporting',
      'priority_support',
      'advanced_analytics',
      'api_access',
      'team_collaboration',
      'cad_import_professional',
      'model_viewer',
      'heat_map_3d'
    ],
    business: [
      'all_features',
      'multi_facility',
      'unlimited_team',
      'ai_queries_unlimited',
      'api_unlimited',
      'custom_integrations',
      'white_label',
      'on_premise',
      'dedicated_support',
      'sla_guarantee',
      'compliance_tools',
      'cad_import_unlimited',
      'multi_model_coordination',
      'bim_workflows'
    ]
  };

  // Get the user's plan level
  const planLevel = userPlan.toLowerCase();

  // Business gets everything
  if (planLevel === 'business') return true;
  
  // Professional gets professional + grower + free features
  if (planLevel === 'professional') {
    return featureMatrix.professional.includes(feature) || 
           featureMatrix.grower.includes(feature) ||
           featureMatrix.free.includes(feature);
  }
  
  // Grower gets grower + free features
  if (planLevel === 'grower') {
    return featureMatrix.grower.includes(feature) || 
           featureMatrix.free.includes(feature);
  }
  
  // Free only gets free features
  return featureMatrix.free.includes(feature);
}