/**
 * Enhanced module details with additional metadata for pricing page
 */

export const MODULE_DETAILS = {
  // Greenhouse & Project Management
  'greenhouse-project-management': {
    includedInPlans: ['Teams', 'Professional', 'Enterprise'],
    requiredPlan: 'Teams',
    popularWith: ['Greenhouse Builders', 'Construction Firms', 'Large Growers'],
    savingsInBundle: 50,
    roiEstimate: '3-6 months',
    setupTime: '2-4 hours',
    whyPriced: 'Comprehensive project management tools that replace expensive standalone software like MS Project',
    competitorPrice: '$299-499/month for similar tools',
  },

  // Cultivation Operations
  'ipm-system': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Starter',
    popularWith: ['Commercial Growers', 'Organic Farms', 'Cannabis Cultivators'],
    savingsInBundle: 30,
    roiEstimate: '2-3 months',
    setupTime: '1-2 hours',
    whyPriced: 'AI-powered pest detection with GPS mapping saves thousands in crop losses',
    competitorPrice: '$150-250/month for basic IPM software',
  },

  'seed-to-sale': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Starter',
    popularWith: ['Cannabis Operations', 'Commercial Farms', 'Research Facilities'],
    savingsInBundle: 50,
    roiEstimate: '1-2 months',
    setupTime: '3-5 hours',
    whyPriced: 'Complete traceability required for compliance, replaces multiple tracking systems',
    competitorPrice: '$200-500/month (METRC, BioTrack, etc.)',
  },

  'crop-planning-suite': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Starter',
    popularWith: ['Multi-Crop Operations', 'Vertical Farms', 'Greenhouses'],
    savingsInBundle: 25,
    roiEstimate: '2-4 months',
    setupTime: '1-2 hours',
    whyPriced: '200+ crop database with scientific DLI/PPFD data worth thousands in research',
    competitorPrice: '$100-200/month for basic crop planning',
  },

  'harvest-management': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Teams',
    popularWith: ['Large Scale Growers', 'Processing Facilities', 'Co-ops'],
    savingsInBundle: 40,
    roiEstimate: '1 harvest cycle',
    setupTime: '2-3 hours',
    whyPriced: 'Optimizes post-harvest workflow, reduces labor costs by 20-30%',
    competitorPrice: '$150-300/month for harvest software',
  },

  // Technical & Design
  'cad-bim-export': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['Engineering Firms', 'Contractors', 'Consultants'],
    savingsInBundle: 75,
    roiEstimate: '1-2 projects',
    setupTime: '30 minutes',
    whyPriced: 'Professional CAD export replaces $5000+ CAD software licenses',
    competitorPrice: '$500-1000/month for AutoCAD/Revit',
  },

  'advanced-designer-suite': {
    includedInPlans: ['Teams', 'Professional', 'Enterprise'],
    requiredPlan: 'Solo',
    popularWith: ['Lighting Designers', 'Engineers', 'Consultants'],
    savingsInBundle: 30,
    roiEstimate: '1-2 projects',
    setupTime: '1 hour',
    whyPriced: 'Professional lighting design tool with electrical estimation included',
    competitorPrice: '$200-500/month for professional design software',
  },

  'electrical-estimator': {
    includedInPlans: ['Advanced Designer Suite'],
    requiredPlan: 'Solo',
    popularWith: ['Electrical Contractors', 'Engineers', 'Installers'],
    savingsInBundle: 10,
    roiEstimate: '1 project',
    setupTime: '30 minutes',
    whyPriced: 'Accurate electrical load calculations save thousands in over/under-sizing',
    competitorPrice: '$50-150/month for electrical estimating',
  },

  // AI & Analytics
  'ai-assistant': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Starter',
    popularWith: ['Tech-Forward Growers', 'Research Teams', 'Large Operations'],
    savingsInBundle: 20,
    roiEstimate: '2-3 months',
    setupTime: 'Instant',
    whyPriced: 'AI insights improve yields by 15-25% on average',
    competitorPrice: '$100-300/month for AI analytics',
  },

  'plant-health-ai-addon': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Starter',
    popularWith: ['All Growers', 'Scouts', 'IPM Managers'],
    savingsInBundle: 10,
    roiEstimate: '1 month',
    setupTime: 'Instant',
    whyPriced: 'Beta pricing - uses Google Vision, Claude, and AWS Rekognition',
    competitorPrice: '$50-100/month once out of beta',
  },

  'ml-prediction-suite': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['Large Operations', 'Research Facilities', 'Investors'],
    savingsInBundle: 80,
    roiEstimate: '3-6 months',
    setupTime: '1 week training',
    whyPriced: '6 advanced ML models that typically cost $50K+ to develop',
    competitorPrice: '$500-1500/month for predictive analytics',
  },

  // Facility Management
  'smart-facility-suite': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['Industrial Growers', 'Multi-Site Operations', 'Automated Facilities'],
    savingsInBundle: 100,
    roiEstimate: '3-4 months',
    setupTime: '1-2 days',
    whyPriced: 'Complete BMS/SCADA replacement with energy savings included',
    competitorPrice: '$500-2000/month for industrial automation',
  },

  'equipment-maintenance': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Starter',
    popularWith: ['Facility Managers', 'Maintenance Teams', 'Asset Managers'],
    savingsInBundle: 25,
    roiEstimate: '3-6 months',
    setupTime: '2-3 hours',
    whyPriced: 'Prevents costly equipment failures, extends equipment life 20-30%',
    competitorPrice: '$100-300/month for CMMS software',
  },

  'sensor-hub': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['Tech Operations', 'Automated Facilities', 'Research'],
    savingsInBundle: 30,
    roiEstimate: '2-3 months',
    setupTime: '1-2 hours',
    whyPriced: 'Universal sensor integration replaces multiple proprietary systems',
    competitorPrice: '$150-400/month per sensor brand',
  },

  // Compliance & Operations
  'gmp-compliance-suite': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['FDA Regulated', 'Pharmaceuticals', 'Food Processors'],
    savingsInBundle: 120,
    roiEstimate: '1 audit',
    setupTime: '1-2 weeks',
    whyPriced: '21 CFR Part 11 compliance system prevents regulatory fines',
    competitorPrice: '$1000-3000/month for GMP software',
  },

  'food-safety-operations-suite': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Teams',
    popularWith: ['Food Producers', 'Processors', 'Packagers'],
    savingsInBundle: 60,
    roiEstimate: '3-4 months',
    setupTime: '3-5 hours',
    whyPriced: 'HACCP compliance and labor management in one system',
    competitorPrice: '$300-600/month for food safety software',
  },

  'cannabis-compliance': {
    includedInPlans: [],
    requiredPlan: 'Starter',
    popularWith: ['Cannabis Growers', 'Dispensaries', 'Processors'],
    savingsInBundle: 30,
    roiEstimate: '1-2 months',
    setupTime: '2-4 hours',
    whyPriced: 'METRC integration and state compliance tracking',
    competitorPrice: '$150-400/month for compliance software',
  },

  // Financial & Business
  'financial-integration-suite': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['CFOs', 'Accounting Teams', 'Business Owners'],
    savingsInBundle: 60,
    roiEstimate: '2-3 months',
    setupTime: '3-5 hours',
    whyPriced: 'QuickBooks/Xero integration with advanced financial modeling',
    competitorPrice: '$200-500/month for financial software',
  },

  'business-intelligence-suite': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Teams',
    popularWith: ['Executives', 'Investors', 'Business Analysts'],
    savingsInBundle: 40,
    roiEstimate: '3-6 months',
    setupTime: '2-3 hours',
    whyPriced: 'Investment analysis and grant optimization tools',
    competitorPrice: '$200-400/month for BI tools',
  },

  // Labor Management
  'advanced-labor-management': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Teams',
    popularWith: ['HR Managers', 'Operations', 'Large Teams'],
    savingsInBundle: 40,
    roiEstimate: '2-3 months',
    setupTime: '3-5 hours',
    whyPriced: 'Complete workforce management reduces labor costs 15-20%',
    competitorPrice: '$10-20/user/month for workforce software',
  },

  'training-certification': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Starter',
    popularWith: ['HR Teams', 'Safety Managers', 'Compliance Officers'],
    savingsInBundle: 20,
    roiEstimate: '6 months',
    setupTime: '2-3 hours',
    whyPriced: 'Ensures compliance training, reduces liability',
    competitorPrice: '$5-15/user/month for LMS',
  },

  'employee-scouting': {
    includedInPlans: ['Professional', 'Enterprise'],
    requiredPlan: 'Teams',
    popularWith: ['IPM Managers', 'Field Operations', 'Quality Control'],
    savingsInBundle: 20,
    roiEstimate: '1-2 months',
    setupTime: '1 hour',
    whyPriced: 'Mobile scouting with AI detection catches issues 70% faster',
    competitorPrice: '$10-20/user/month for scouting apps',
  },

  // Research & Analytics
  'research-analytics-suite': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['Universities', 'R&D Teams', 'Biotech'],
    savingsInBundle: 150,
    roiEstimate: '1 research project',
    setupTime: '1 week',
    whyPriced: 'Complete research platform with statistical analysis and publishing tools',
    competitorPrice: '$1000-2000/month for research software',
  },

  'cfd-analysis': {
    includedInPlans: [],
    requiredPlan: 'Professional',
    popularWith: ['HVAC Engineers', 'Facility Designers', 'Consultants'],
    savingsInBundle: 30,
    roiEstimate: '1 project',
    setupTime: '2-3 hours',
    whyPriced: 'CFD analysis optimizes airflow, saves 20-30% on HVAC costs',
    competitorPrice: '$500-2000/month for CFD software',
  },

  // Essential/Budget Modules
  'calculator-suite': {
    includedInPlans: ['Starter', 'Teams', 'Professional', 'Enterprise'],
    requiredPlan: 'Free',
    popularWith: ['All Users', 'Students', 'Hobbyists'],
    savingsInBundle: 5,
    roiEstimate: 'Immediate',
    setupTime: 'Instant',
    whyPriced: '25+ professional calculators worth $500+ if purchased separately',
    competitorPrice: '$20-50/calculator as one-time purchase',
  },

  'basic-reporting': {
    includedInPlans: ['All Paid Plans'],
    requiredPlan: 'Free',
    popularWith: ['Small Growers', 'Startups', 'Hobbyists'],
    savingsInBundle: 3,
    roiEstimate: '1 month',
    setupTime: '30 minutes',
    whyPriced: 'Essential reporting for operations tracking',
    competitorPrice: '$20-50/month for basic reporting',
  },

  // Marketplace & Integration
  'marketplace': {
    includedInPlans: ['Teams', 'Professional', 'Enterprise'],
    requiredPlan: 'Teams',
    popularWith: ['Sellers', 'Buyers', 'Service Providers'],
    savingsInBundle: 40,
    roiEstimate: '1-3 sales',
    setupTime: '1-2 hours',
    whyPriced: 'Access to B2B marketplace with payment processing',
    competitorPrice: '5-15% transaction fees on other platforms',
  },

  'erp-integration': {
    includedInPlans: ['Enterprise'],
    requiredPlan: 'Professional',
    popularWith: ['Enterprise Operations', 'Multi-Site', 'Corporate'],
    savingsInBundle: 40,
    roiEstimate: '3-6 months',
    setupTime: '1-2 weeks',
    whyPriced: 'Seamless integration with SAP, Oracle, Microsoft Dynamics',
    competitorPrice: '$500-2000/month for integration middleware',
  },
};

// Helper function to get complete module info
export function getEnhancedModuleInfo(moduleId: string) {
  return MODULE_DETAILS[moduleId] || {
    includedInPlans: [],
    requiredPlan: 'Starter',
    popularWith: [],
    savingsInBundle: 0,
    roiEstimate: 'Varies',
    setupTime: 'Varies',
    whyPriced: 'Professional tools for your operation',
    competitorPrice: 'Varies by feature set',
  };
}

// Get modules by plan
export function getModulesForPlan(planName: string): string[] {
  return Object.entries(MODULE_DETAILS)
    .filter(([_, details]) => details.includedInPlans.includes(planName))
    .map(([moduleId]) => moduleId);
}

// Get recommended modules for user type
export function getRecommendedModules(userType: string): string[] {
  const recommendations: Record<string, string[]> = {
    'Greenhouse Builder': ['greenhouse-project-management', 'cad-bim-export', 'advanced-designer-suite', 'electrical-estimator'],
    'Commercial Grower': ['crop-planning-suite', 'ipm-system', 'harvest-management', 'seed-to-sale'],
    'Cannabis Operator': ['cannabis-compliance', 'seed-to-sale', 'ipm-system', 'gmp-compliance-suite'],
    'Vertical Farm': ['advanced-designer-suite', 'smart-facility-suite', 'crop-planning-suite', 'ml-prediction-suite'],
    'Research Facility': ['research-analytics-suite', 'ml-prediction-suite', 'cfd-analysis', 'sensor-hub'],
    'Consultant': ['advanced-designer-suite', 'cad-bim-export', 'calculator-suite', 'cfd-analysis'],
    'Facility Manager': ['equipment-maintenance', 'smart-facility-suite', 'advanced-labor-management', 'training-certification'],
  };
  
  return recommendations[userType] || [];
}