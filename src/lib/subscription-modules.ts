// Subscription modules for feature gating
export interface SubscriptionModule {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  category: 'core' | 'professional' | 'enterprise' | 'analytics';
  requiredTier?: 'starter' | 'professional' | 'enterprise';
}

export const subscriptionModules: Record<string, SubscriptionModule> = {
  'advanced-designer': {
    id: 'advanced-designer',
    name: 'Advanced Designer',
    description: 'Professional CAD integration and 3D design tools',
    price: 49,
    features: ['CAD Import', '3D Visualization', 'Multi-layer Design'],
    category: 'professional'
  },
  'energy-monitoring': {
    id: 'energy-monitoring',
    name: 'Energy Monitoring',
    description: 'Real-time energy tracking and optimization',
    price: 29,
    features: ['Real-time Monitoring', 'Cost Analysis', 'Usage Alerts'],
    category: 'analytics'
  },
  'research-suite': {
    id: 'research-suite',
    name: 'Research Suite',
    description: 'Statistical analysis and research tools',
    price: 79,
    features: ['ANOVA Analysis', 'Data Export', 'Research Database'],
    category: 'analytics'
  },
  'marketplace': {
    id: 'marketplace',
    name: 'Marketplace Access',
    description: 'B2B marketplace for equipment and supplies',
    price: 19,
    features: ['Vendor Access', 'Bulk Ordering', 'Price Comparison'],
    category: 'enterprise'
  },
  'investment-platform': {
    id: 'investment-platform',
    name: 'Investment Platform',
    description: 'VibeLux Capital investment and deal flow platform',
    price: 2000,
    features: ['Deal Flow Management', 'Investment Tracking', 'Portfolio Analytics'],
    category: 'enterprise',
    requiredTier: 'professional'
  }
};

export const getModulesByCategory = (category: string) => {
  return Object.values(subscriptionModules).filter(module => module.category === category);
};

export const getModuleById = (id: string) => {
  return subscriptionModules[id];
};

export const calculateModuleTotal = (moduleIds: string[]) => {
  return moduleIds.reduce((total, id) => {
    const module = subscriptionModules[id];
    return total + (module?.price || 0);
  }, 0);
};

// Module types enum for easier access
export enum ModuleType {
  CORE = 'core',
  PROFESSIONAL = 'professional', 
  ENTERPRISE = 'enterprise',
  ANALYTICS = 'analytics',
  MARKETPLACE = 'marketplace',
  INVESTMENT_PLATFORM = 'investment-platform'
}

export interface SubscriptionInterface {
  id: string;
  userId: string;
  tierId: string;
  moduleIds: string[];
  status: 'active' | 'inactive' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export class UserSubscription {
  constructor(
    public tier: string,
    public modules: string[] = [],
    public bundleId?: string
  ) {}

  hasFeature(moduleType: string, feature?: string): boolean {
    return this.modules.includes(moduleType) || this.modules.includes(moduleType.toLowerCase());
  }

  get status(): 'active' | 'inactive' | 'cancelled' {
    return 'active';
  }

  getAvailableFeatures() {
    return {
      modules: this.modules.filter(m => m !== 'addon'),
      addOns: this.modules.filter(m => ADD_ON_MODULES[m])
    };
  }

  getTotalCost(): number {
    const tierPrice = SUBSCRIPTION_TIERS[this.tier as keyof typeof SUBSCRIPTION_TIERS]?.price || 0;
    const addonCost = this.modules.reduce((total, moduleId) => {
      const module = ADD_ON_MODULES[moduleId];
      return total + (module?.price || 0);
    }, 0);
    return tierPrice + addonCost;
  }

  canAddModule(moduleId: string): boolean {
    const module = ADD_ON_MODULES[moduleId];
    if (!module) return false;
    
    // Check if already has module
    if (this.modules.includes(moduleId)) return false;
    
    // Check tier requirements
    if (module.requiredTier) {
      const tierLevels = { starter: 1, professional: 2, enterprise: 3 };
      const currentLevel = tierLevels[this.tier as keyof typeof tierLevels] || 0;
      const requiredLevel = tierLevels[module.requiredTier as keyof typeof tierLevels] || 0;
      return currentLevel >= requiredLevel;
    }
    
    return true;
  }
}

export const SUBSCRIPTION_TIERS = {
  starter: { 
    id: 'starter', 
    name: 'Starter', 
    price: 29,
    limits: {
      users: 5,
      sqft: 10000,
      apiCalls: 1000,
      projects: 5,
      exports: 10
    }
  },
  professional: { 
    id: 'professional', 
    name: 'Professional', 
    price: 79,
    limits: {
      users: 25,
      sqft: 50000,
      apiCalls: 10000,
      projects: 25,
      exports: 100
    }
  },
  enterprise: { 
    id: 'enterprise', 
    name: 'Enterprise', 
    price: 199,
    limits: {
      users: -1,
      sqft: -1,
      apiCalls: -1,
      projects: -1,
      exports: -1
    }
  }
};

export const ADD_ON_MODULES = subscriptionModules;

export const checkFeatureAccess = (subscription: UserSubscription, feature: string) => {
  // Basic feature access check
  const hasAccess = subscription.status === 'active' && subscription.hasFeature(feature);
  
  return {
    hasAccess,
    reason: hasAccess ? null : 'Feature not available in current subscription'
  };
};

// Safe subscription tiers for backward compatibility
export const SAFE_SUBSCRIPTION_TIERS = [
  { id: 'starter', name: 'Starter', price: 29 },
  { id: 'professional', name: 'Professional', price: 79 },
  { id: 'enterprise', name: 'Enterprise', price: 199 }
];