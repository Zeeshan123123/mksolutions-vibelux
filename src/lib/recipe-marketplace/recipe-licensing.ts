/**
 * Recipe Licensing System
 * Allows growers to license their proven light recipes with specific benefits
 */

export interface RecipeFeature {
  id: string;
  name: string;
  category: 'yield' | 'quality' | 'nutrition' | 'efficiency' | 'sustainability';
  measurable: boolean;
  unit?: string;
  improvement?: number; // % improvement over baseline
  verified: boolean;
}

export interface LicensedRecipe {
  id: string;
  recipeId: string; // Original recipe ID
  name: string;
  description: string;
  crop: string;
  strain?: string; // For cannabis
  
  // Creator info
  creatorId: string;
  creatorName: string;
  creatorRating: number; // 0-5 stars
  creatorVerified: boolean;
  
  // Features & Benefits
  features: RecipeFeature[];
  provenResults: {
    metric: string;
    baseline: number;
    achieved: number;
    improvement: number; // %
    verificationSource: 'self-reported' | 'third-party' | 'platform-verified';
    evidence?: string[]; // URLs to lab reports, photos, etc.
  }[];
  
  // Licensing terms
  licensing: {
    type: 'one-time' | 'subscription' | 'usage-based' | 'freemium';
    pricing: {
      oneTime?: number;
      monthly?: number;
      yearly?: number;
      // Usage-based pricing models
      perCycle?: number; // $ per growth cycle
      perSqFt?: number; // $ per sq ft per cycle
      perPlant?: number; // $ per plant
      tieredPricing?: {
        name: string;
        maxArea: number; // sq ft
        pricePerCycle: number;
      }[];
    };
    termsOfUse: string[];
    restrictions: string[]; // e.g., "Sole-source lighting only"
    supportIncluded: boolean;
    updateIncluded: boolean;
    environmentTypes: ('sole-source' | 'supplemental' | 'greenhouse')[];
  };
  
  // Performance data
  statistics: {
    totalLicenses: number;
    activeUsers: number;
    avgRating: number;
    totalReviews: number;
    successRate: number; // % of users achieving claimed results
    totalRevenue: number;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'pending-review' | 'active' | 'suspended';
  tags: string[];
}

export interface RecipeLicense {
  id: string;
  recipeId: string;
  licenseeId: string;
  licensorId: string;
  
  // License details
  type: 'one-time' | 'subscription' | 'usage-based' | 'freemium';
  startDate: Date;
  endDate?: Date; // For subscriptions
  
  // Payment info
  payment: {
    amount: number;
    frequency?: 'one-time' | 'monthly' | 'yearly' | 'per-cycle';
    lastPayment?: Date;
    nextPayment?: Date;
    totalPaid: number;
    usageReports?: UsageReport[];
  };
  
  // Usage tracking
  usage: {
    firstUsed?: Date;
    lastUsed?: Date;
    totalCycles: number;
    totalArea: number; // sq ft
    totalPlants: number;
    implementations: string[]; // Implementation IDs
    avgCompliance?: number; // Recipe adherence %
  };
  
  // Support & updates
  support: {
    included: boolean;
    expiresAt?: Date;
    ticketsUsed: number;
    ticketsRemaining?: number;
  };
  
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
}

export interface UsageReport {
  id: string;
  period: { start: Date; end: Date };
  cycles: number;
  totalArea: number; // sq ft
  totalPlants: number;
  complianceScore: number; // % adherence to recipe
  usageFee: number; // Calculated based on pricing model
  paid: boolean;
  paidAt?: Date;
  implementationIds: string[];
}

// Common recipe features/benefits
export const RECIPE_FEATURES: RecipeFeature[] = [
  // Yield features
  { id: 'yield-increase', name: 'Increased Yield', category: 'yield', measurable: true, unit: '%', verified: false },
  { id: 'faster-growth', name: 'Faster Growth Cycle', category: 'yield', measurable: true, unit: 'days', verified: false },
  { id: 'larger-fruits', name: 'Larger Fruit Size', category: 'yield', measurable: true, unit: '%', verified: false },
  
  // Quality features
  { id: 'enhanced-color', name: 'Enhanced Coloration', category: 'quality', measurable: true, unit: 'CIE Lab', verified: false },
  { id: 'improved-taste', name: 'Improved Taste Profile', category: 'quality', measurable: false, verified: false },
  { id: 'longer-shelf-life', name: 'Extended Shelf Life', category: 'quality', measurable: true, unit: 'days', verified: false },
  { id: 'uniformity', name: 'Improved Crop Uniformity', category: 'quality', measurable: true, unit: '%', verified: false },
  
  // Nutrition features
  { id: 'vitamin-c', name: 'Increased Vitamin C', category: 'nutrition', measurable: true, unit: 'mg/100g', verified: false },
  { id: 'antioxidants', name: 'Higher Antioxidants', category: 'nutrition', measurable: true, unit: 'ORAC', verified: false },
  { id: 'sugar-content', name: 'Optimized Sugar/Brix', category: 'nutrition', measurable: true, unit: '°Brix', verified: false },
  { id: 'thc-content', name: 'Increased THC', category: 'nutrition', measurable: true, unit: '%', verified: false },
  { id: 'cbd-content', name: 'Increased CBD', category: 'nutrition', measurable: true, unit: '%', verified: false },
  { id: 'terpene-profile', name: 'Enhanced Terpenes', category: 'nutrition', measurable: true, unit: '%', verified: false },
  
  // Efficiency features
  { id: 'energy-saving', name: 'Energy Efficient', category: 'efficiency', measurable: true, unit: 'kWh/kg', verified: false },
  { id: 'water-saving', name: 'Water Efficient', category: 'efficiency', measurable: true, unit: 'L/kg', verified: false },
  { id: 'labor-saving', name: 'Reduced Labor Needs', category: 'efficiency', measurable: true, unit: 'hrs/kg', verified: false },
  
  // Sustainability features
  { id: 'organic-compatible', name: 'Organic Compatible', category: 'sustainability', measurable: false, verified: false },
  { id: 'pest-resistant', name: 'Natural Pest Resistance', category: 'sustainability', measurable: true, unit: '%', verified: false },
  { id: 'heat-tolerant', name: 'Heat Stress Tolerance', category: 'sustainability', measurable: true, unit: '°C', verified: false }
];

export class RecipeLicensingService {
  /**
   * Create a new licensed recipe listing
   */
  async createLicensedRecipe(
    recipeId: string,
    creator: { id: string; name: string },
    details: {
      name: string;
      description: string;
      crop: string;
      features: string[]; // Feature IDs
      provenResults: any[];
      pricing: any;
      termsOfUse: string[];
    }
  ): Promise<LicensedRecipe> {
    const selectedFeatures = RECIPE_FEATURES.filter(f => 
      details.features.includes(f.id)
    );

    const licensedRecipe: LicensedRecipe = {
      id: this.generateId(),
      recipeId,
      name: details.name,
      description: details.description,
      crop: details.crop,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorRating: 4.5, // Default, would come from user system
      creatorVerified: false,
      features: selectedFeatures,
      provenResults: details.provenResults,
      licensing: {
        type: details.pricing.type,
        pricing: details.pricing,
        termsOfUse: details.termsOfUse,
        restrictions: [],
        supportIncluded: true,
        updateIncluded: true
      },
      statistics: {
        totalLicenses: 0,
        activeUsers: 0,
        avgRating: 0,
        totalReviews: 0,
        successRate: 0,
        totalRevenue: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending-review',
      tags: []
    };

    // Would save to database
    return licensedRecipe;
  }

  /**
   * Purchase a recipe license
   */
  async purchaseLicense(
    recipeId: string,
    licenseeId: string,
    licenseType: 'one-time' | 'subscription' | 'royalty',
    paymentDetails: any
  ): Promise<RecipeLicense> {
    // Would process payment first
    
    const license: RecipeLicense = {
      id: this.generateId(),
      recipeId,
      licenseeId,
      licensorId: 'creator-id', // Would get from recipe
      type: licenseType,
      startDate: new Date(),
      endDate: licenseType === 'subscription' ? 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined,
      payment: {
        amount: paymentDetails.amount,
        frequency: licenseType === 'subscription' ? 'yearly' : 'one-time',
        totalPaid: paymentDetails.amount
      },
      usage: {
        totalCycles: 0,
        totalArea: 0
      },
      support: {
        included: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        ticketsUsed: 0,
        ticketsRemaining: 5
      },
      status: 'active'
    };

    return license;
  }

  /**
   * Verify recipe performance claims
   */
  async verifyRecipePerformance(
    recipeId: string,
    actualResults: {
      metric: string;
      value: number;
      evidence: string[];
    }[]
  ): Promise<boolean> {
    // Compare actual results with claimed results
    // This would involve:
    // 1. Statistical analysis of multiple user reports
    // 2. Third-party lab verification
    // 3. Platform sensor data validation
    // 4. Image analysis of crop photos
    
    // For now, return true if evidence provided
    return actualResults.every(result => result.evidence.length > 0);
  }

  /**
   * Calculate royalty payment
   */
  calculateRoyalty(
    license: RecipeLicense,
    cycleData: {
      yield: number;
      marketPrice: number;
      costs: number;
    }
  ): number {
    if (license.type !== 'royalty') return 0;
    
    const yieldValue = cycleData.yield * cycleData.marketPrice;
    const profit = yieldValue - cycleData.costs;
    const royaltyRate = license.payment.royaltyReports?.[0]?.royaltyRate || 0.05; // 5% default
    
    return Math.max(
      profit * royaltyRate,
      100 // Minimum royalty
    );
  }

  /**
   * Search marketplace for recipes
   */
  async searchMarketplace(filters: {
    crop?: string;
    features?: string[];
    maxPrice?: number;
    minRating?: number;
    verified?: boolean;
  }): Promise<LicensedRecipe[]> {
    // Would query database with filters
    // For now, return mock data
    return [];
  }

  /**
   * Get recipe performance analytics
   */
  async getRecipeAnalytics(recipeId: string): Promise<{
    avgYieldImprovement: number;
    successRate: number;
    commonIssues: string[];
    userFeedback: any[];
  }> {
    // Aggregate user data
    return {
      avgYieldImprovement: 15.3,
      successRate: 78,
      commonIssues: ['Initial calibration needed', 'Works best with CO2 supplementation'],
      userFeedback: []
    };
  }

  private generateId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton
export const recipeLicensingService = new RecipeLicensingService();