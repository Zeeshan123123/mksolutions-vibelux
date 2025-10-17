import { SUBSCRIPTION_TIERS, MODULES } from '@/lib/pricing/unified-pricing';

export type TierLevel = 'free' | 'starter' | 'professional' | 'enterprise';
export type ModuleId = string;

// Feature access mapping
export const FEATURE_ACCESS = {
  // Dashboard features
  'dashboard.overview': ['free', 'starter', 'professional', 'enterprise'],
  'dashboard.collaborative': ['starter', 'professional', 'enterprise'],
  'dashboard.builder': ['professional', 'enterprise'],
  'dashboard.intelligence': ['enterprise'],
  'dashboard.projects': ['starter', 'professional', 'enterprise'],
  
  // Calculator categories
  'calculators.basic': ['free', 'starter', 'professional', 'enterprise'],
  'calculators.lighting': ['starter', 'professional', 'enterprise'],
  'calculators.environmental': ['starter', 'professional', 'enterprise'],
  'calculators.financial': ['professional', 'enterprise'],
  'calculators.plant-science': ['professional', 'enterprise'],
  'calculators.sustainability': ['enterprise'],
  
  // Energy features
  'energy.overview': ['starter', 'professional', 'enterprise'],
  'energy.monitoring': ['starter', 'professional', 'enterprise'],
  'energy.optimization': ['professional', 'enterprise'],
  'energy.savings': ['professional', 'enterprise'],
  'energy.setup': ['enterprise'],
  
  // Design features
  'design.basic': ['starter', 'professional', 'enterprise'],
  'design.advanced': ['professional', 'enterprise'],
  'design.ai-assistant': ['professional', 'enterprise'],
  'design.automation': ['enterprise'],
  'design.export-pro': ['enterprise'],
  
  // Admin features (role-based + tier)
  'admin.access': ['professional', 'enterprise'],
  'admin.full': ['enterprise'],

  // Control Center features
  'control_center_zone_details': ['professional', 'enterprise'],
  'control_center_production_flow': ['professional', 'enterprise'],
  'control_center_automation': ['professional', 'enterprise'],
  'control_center_performance': ['starter', 'professional', 'enterprise'],
  'control_center_integrations': ['starter', 'professional', 'enterprise'],
} as const;

// Module access mapping
export const MODULE_ACCESS = {
  'environmental-monitoring': ['starter', 'professional', 'enterprise'],
  'workflow-automation': ['professional', 'enterprise'],
  'energy-management': ['professional', 'enterprise'],
  'advanced-analytics': ['enterprise'],
  'research-suite': ['enterprise'],
  'marketplace': ['starter', 'professional', 'enterprise'],
} as const;

// Credit limits per tier
export const CREDIT_LIMITS = {
  free: {
    aiDesigner: 5,
    aiQueries: 10,
    apiCalls: 100,
    reports: 5,
    simulations: 10,
  },
  starter: {
    aiDesigner: 500,
    aiQueries: 100,
    apiCalls: 5000,
    reports: 50,
    simulations: 100,
  },
  professional: {
    aiDesigner: 2000,
    aiQueries: 500,
    apiCalls: 50000,
    reports: 200,
    simulations: 500,
  },
  enterprise: {
    aiDesigner: -1, // unlimited
    aiQueries: -1,
    apiCalls: -1,
    reports: -1,
    simulations: -1,
  },
} as const;

// Check if user has access to a feature
export function hasFeatureAccess(
  feature: keyof typeof FEATURE_ACCESS,
  userTier: TierLevel
): boolean {
  const allowedTiers = FEATURE_ACCESS[feature] as readonly TierLevel[];
  if (!allowedTiers) {
    console.warn(`Feature "${feature}" not found in FEATURE_ACCESS`);
    return false;
  }
  return allowedTiers.includes(userTier);
}

// Check if user has access to a module
export function hasModuleAccess(
  moduleId: string,
  userTier: TierLevel,
  userModules: string[] = []
): boolean {
  // Ensure userModules is an array
  const modules = Array.isArray(userModules) ? userModules : [];
  
  // Check if user purchased the module
  if (modules.includes(moduleId)) return true;
  
  // Check if tier includes the module
  const moduleAccess = MODULE_ACCESS[moduleId as keyof typeof MODULE_ACCESS] as readonly TierLevel[] | undefined;
  if (moduleAccess && (moduleAccess as readonly TierLevel[]).includes(userTier)) return true;
  
  // Check if included in subscription tier
  const tierData = SUBSCRIPTION_TIERS[userTier];
  if (tierData && tierData.modules.includes(moduleId)) return true;
  
  return false;
}

// Get user's current credit usage
export function getCreditUsage(
  userTier: TierLevel,
  creditType: keyof typeof CREDIT_LIMITS.free
): { used: number; limit: number; remaining: number } {
  const limits = CREDIT_LIMITS[userTier];
  const limit = limits[creditType];
  
  // TODO: Get actual usage from database
  const used = 0;
  
  return {
    used,
    limit,
    remaining: limit === -1 ? -1 : Math.max(0, limit - used),
  };
}

// Get upgrade prompt for a feature
export function getUpgradePrompt(feature: keyof typeof FEATURE_ACCESS): {
  title: string;
  description: string;
  requiredTier: TierLevel;
} {
  const allowedTiers = FEATURE_ACCESS[feature];
  const requiredTier = allowedTiers[0] as TierLevel;
  
  const prompts = {
    'dashboard.collaborative': {
      title: 'Unlock Collaborative Dashboards',
      description: 'Share insights and collaborate with your team in real-time.',
    },
    'dashboard.builder': {
      title: 'Custom Dashboard Builder',
      description: 'Create personalized dashboards tailored to your workflow.',
    },
    'dashboard.intelligence': {
      title: 'AI-Powered Intelligence',
      description: 'Get unified analytics and predictive insights across all your data.',
    },
    'calculators.financial': {
      title: 'Financial Calculators',
      description: 'Access ROI, TCO, and advanced financial planning tools.',
    },
    'calculators.plant-science': {
      title: 'Plant Science Suite',
      description: 'Advanced calculators for crop optimization and research.',
    },
    'calculators.sustainability': {
      title: 'Sustainability Analytics',
      description: 'Carbon footprint tracking and environmental impact analysis.',
    },
    'energy.optimization': {
      title: 'Energy Optimization',
      description: 'AI-driven energy savings and predictive optimization.',
    },
    'design.advanced': {
      title: 'Advanced Designer',
      description: 'Professional lighting design with AI assistance and automation.',
    },
    'control_center_zone_details': {
      title: 'Zone Details & Tuning',
      description: 'Unlock detailed zone telemetry and tuning controls in Control Center.',
    },
    'control_center_production_flow': {
      title: 'Production Flow Insights',
      description: 'Visualize crop flow and throughput KPIs across zones.',
    },
    'control_center_automation': {
      title: 'Automation Rules',
      description: 'Create and manage automation rules for climate, irrigation, and lighting.',
    },
    'control_center_performance': {
      title: 'Live Performance Metrics',
      description: 'Access live energy, water, movement, and uptime metrics.',
    },
    'control_center_integrations': {
      title: 'Integrations Status',
      description: 'Monitor sensor network, PLC, SCADA, and HVAC integrations.',
    },
  };
  
  const prompt = prompts[feature] || {
    title: 'Upgrade Required',
    description: 'This feature requires a higher subscription tier.',
  };
  
  return { ...prompt, requiredTier };
}

// Check if user can perform an action that costs credits
export function canUseCredits(
  userTier: TierLevel,
  creditType: keyof typeof CREDIT_LIMITS.free,
  amount: number = 1
): boolean {
  const { remaining } = getCreditUsage(userTier, creditType);
  return remaining === -1 || remaining >= amount;
}

// Get tier comparison data for upgrade modal
export function getTierComparison() {
  return Object.entries(SUBSCRIPTION_TIERS).map(([id, tier]) => ({
    id,
    name: tier.name,
    price: tier.price,
    features: tier.features,
    credits: tier.credits,
    limits: tier.limits,
    highlighted: id === 'professional', // Recommended tier
  }));
}