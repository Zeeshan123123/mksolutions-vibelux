/**
 * Unified Pricing Structure for VibeLux
 * Combines subscription tiers, a la carte modules, and credit system
 */

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  credits: {
    aiDesigner: number;
    aiQueries: number; // New: General AI queries
    apiCalls: number;
    reports: number;
    simulations: number;
  };
  limits: {
    facilities: number;
    users: number;
    projects: number;
    dataRetention: number; // days
  };
  modules: string[]; // included module IDs
  userPricing?: {
    baseUsers: number; // included users
    additionalUserPrice: number; // price per additional user
    scoutingLicense?: number; // price per employee with camera access
  };
}

export interface Module {
  id: string;
  name: string;
  category: 'essential' | 'professional' | 'enterprise' | 'suite';
  price: number;
  description: string;
  features: string[];
  creditCost?: {
    aiDesigner?: number;
    apiCalls?: number;
    reports?: number;
  };
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number; // percentage bonus credits
  popular?: boolean;
}

// Hybrid Free/Premium Features
export const HYBRID_FEATURES = {
  'energy-savings': {
    free: {
      id: 'energy-savings-free',
      name: 'Energy Savings Program (Free)',
      price: 0,
      description: 'Make money while saving energy - no upfront costs',
      revenueShare: 0.25, // Standardized 25% VibeLux share
      features: [
        'Basic energy optimization with shared savings model',
        'Automated load management',
        'Smart scheduling optimization',
        'Basic energy monitoring',
        'Monthly performance reports',
      ],
    },
    premium: {
      id: 'energy-savings-premium',
      name: 'Energy Savings Premium',
      price: 29,
      description: 'Advanced energy analytics with enhanced savings model',
      revenueShare: 0.25, // Standardized 25% VibeLux share
      features: [
        'Advanced energy analytics with improved savings share',
        'Predictive optimization algorithms',
        'Real-time optimization alerts',
        'Priority utility rebate processing',
        'Carbon credit monetization',
        'Energy storage integration',
        'Advanced weather prediction integration',
      ],
    },
  },
  
  'weather-ai': {
    free: {
      id: 'weather-ai-free',
      name: 'Weather AI (Free)',
      price: 0,
      description: 'Basic weather data and forecasts',
      features: [
        'Basic weather data',
        'Simple forecasts',
        'Daily weather updates',
      ],
    },
    premium: {
      id: 'weather-ai-premium',
      name: 'Weather AI Premium',
      price: 19,
      description: 'Advanced ML predictions and microclimate modeling',
      features: [
        'Advanced ML predictions',
        'Microclimate modeling',
        'Disease risk alerts',
        'Optimal planting windows',
        'Extreme weather warnings',
      ],
    },
  },
  
  'scientific-tools': {
    free: {
      id: 'scientific-tools-free',
      name: 'Scientific Tools (Free)',
      price: 0,
      description: 'Basic data collection and analysis',
      features: [
        'Basic data collection',
        'Simple analysis',
        'Basic reporting',
      ],
    },
    premium: {
      id: 'scientific-tools-premium',
      name: 'Scientific Tools Premium',
      price: 49,
      description: 'Advanced analysis and research capabilities',
      features: [
        'Advanced statistical analysis',
        'Research paper generation',
        'Peer collaboration tools',
        'Publication-ready reports',
      ],
    },
  },
};

// Subscription Tiers
export const SUBSCRIPTION_TIERS: Record<string, PricingTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Get started with basic tools',
    features: [
      'Basic PPFD/DLI calculator',
      'Coverage area calculator',
      'Community support',
      '1 project',
      '7-day data retention',
    ],
    credits: {
      aiDesigner: 5, // 5 AI designs per month
      aiQueries: 10, // 10 AI queries per month
      apiCalls: 100,
      reports: 5,
      simulations: 10,
    },
    limits: {
      facilities: 1,
      users: 1,
      projects: 1,
      dataRetention: 7,
    },
    modules: ['basic-calculators'],
  },

  // New low-friction designer plan for freelancers/solo users
  'design-solo': {
    id: 'design-solo',
    name: 'Design Solo',
    price: 29,
    interval: 'month',
    description: 'Advanced Designer + Calculator Suite for individuals',
    features: [
      'Advanced lighting designer (core features)',
      'Calculator Suite (25+)',
      '3 PDF exports/month',
      '1 facility, 2 projects',
      '30-day data retention',
      'Email support'
    ],
    credits: {
      aiDesigner: 50,
      aiQueries: 50,
      apiCalls: 1000,
      reports: 25,
      simulations: 100,
    },
    limits: {
      facilities: 1,
      users: 1,
      projects: 2,
      dataRetention: 30,
    },
    modules: ['calculator-suite', 'basic-design'],
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    interval: 'month',
    description: 'Perfect for small operations - Get hooked on VibeLux!',
    features: [
      'Advanced lighting designer (full access)',
      'All calculators (25+)',
      'Basic environmental monitoring (view-only)',
      'Basic workflow automation (5 workflows)',
      'Standard AI credits (100/month)',
      'Basic PPFD/DLI calculations',
      'QR code generation',
      'Mobile app access',
      'Email support',
      'Data export (CSV)',
      '30-day data retention',
      'Up to 3 users included',
      '$15/month per additional user',
    ],
    credits: {
      aiDesigner: 100,
      aiQueries: 50,
      apiCalls: 2000,
      reports: 50,
      simulations: 100,
    },
    limits: {
      facilities: 1,
      users: 3,
      projects: 10,
      dataRetention: 30,
    },
    modules: ['calculator-suite', 'basic-design', 'basic-compliance'],
    userPricing: {
      baseUsers: 3,
      additionalUserPrice: 15,
    },
  },

  // New plan for small teams with MEP-lite deliverables
  teams: {
    id: 'teams',
    name: 'Teams',
    price: 99,
    interval: 'month',
    description: 'For small teams building real projects',
    features: [
      'Everything in Starter',
      '2 facilities, 10 users',
      'Basic greenhouse project management',
      'Project templates & WBS generator',
      'Panel schedule generator',
      'HVAC planner (lite)',
      '90-day data retention',
      'Email & chat support'
    ],
    credits: {
      aiDesigner: 300,
      aiQueries: 150,
      apiCalls: 5000,
      reports: 150,
      simulations: 300,
    },
    limits: {
      facilities: 2,
      users: 10,
      projects: 25,
      dataRetention: 90,
    },
    // Include Marketplace Access for sellers starting at Teams
    modules: ['calculator-suite', 'advanced-designer-suite', 'analytics-pro', 'marketplace'],
    userPricing: {
      baseUsers: 10,
      additionalUserPrice: 12,
    },
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 199,
    interval: 'month',
    description: 'For growing operations with full control',
    features: [
      'Everything in Starter',
      'Full BMS environmental controls',
      'Advanced workflow automation (unlimited)',
      'Advanced AI credits (1000/month)',
      'Multi-room management',
      'Advanced analytics and reporting',
      'Priority support',
      'API access',
      '6-month data retention',
      'Custom reports',
      'Integration support',
      'Basic document analysis (50 docs/month)',
      'Basic plant health AI (100 scans/month)',
      'Basic labor tracking',
      'Up to 10 users included',
      '$10/month per additional user',
      'Employee scouting licenses available ($5/user/month)',
      'Opt-in camera system for pest/disease scouting',
    ],
    credits: {
      aiDesigner: 1000,
      aiQueries: 500, // 500 AI queries per month
      apiCalls: 5000,
      reports: 200,
      simulations: 500,
    },
    limits: {
      facilities: 5,
      users: 10,
      projects: 50,
      dataRetention: 180,
    },
    // Include Plant Health AI addon for Pro by default
    modules: [
      'calculator-suite',
      'advanced-designer-suite',
      'ai-assistant',
      'analytics-pro',
      'compliance-pro',
      'sensor-hub',
      'automation-builder',
      'plant-health-ai-addon',
    ],
    userPricing: {
      baseUsers: 10,
      additionalUserPrice: 10,
      scoutingLicense: 5,
    },
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    interval: 'month',
    description: 'For multi-site operations',
    features: [
      'Everything in Professional',
      'Multi-facility management',
      'Advanced integrations (unlimited)',
      'Enterprise AI credits (3000/month)',
      'White-label options',
      'Custom development support',
      'Dedicated account manager',
      'Unlimited data retention',
      'SLA guarantee',
      'Training included',
      'Full document analysis (unlimited)',
      'Full plant health AI (unlimited scans)',
      'Basic GMP compliance features',
      'Basic financial integrations',
      'All 6 ML prediction models',
      'Up to 25 users included',
      'Volume pricing for additional users',
      'Unlimited scouting licenses included',
      'Advanced employee management system',
      'Role-based access control',
    ],
    credits: {
      aiDesigner: 3000,
      aiQueries: 2000, // 2000 AI queries per month
      apiCalls: 50000,
      reports: 1000,
      simulations: 5000,
    },
    limits: {
      facilities: -1, // unlimited
      users: -1, // unlimited
      projects: -1, // unlimited
      dataRetention: -1, // unlimited
    },
    modules: ['all'], // access to all modules
    userPricing: {
      baseUsers: 25,
      additionalUserPrice: 8, // volume pricing
      scoutingLicense: 0, // included with enterprise
    },
  },
};

// A La Carte Modules
export const MODULES: Record<string, Module> = {
  // Essential Standalone Modules
  'electrical-estimator': {
    id: 'electrical-estimator',
    name: 'Electrical Estimator',
    category: 'essential',
    price: 29,
    description: 'Professional electrical calculations and load analysis',
    features: [
      'Load calculations and power requirements',
      'Electrical panel sizing and design',
      'Wire gauge and conduit calculations',
      'Circuit breaker specifications',
      'Electrical code compliance checking',
      'Cost estimation for electrical installations',
      'Energy consumption projections',
      'Integration with lighting design',
    ],
  },
  
  'calculator-suite': {
    id: 'calculator-suite',
    name: 'Calculator Suite',
    category: 'essential',
    price: 19,
    description: 'All 25+ professional calculators',
    features: [
      'PPFD/DLI/Uniformity',
      'VPD & Psychrometric',
      'Heat load & HVAC sizing',
      'CO2 enrichment',
      'ROI calculator',
      'Fertigation calculator',
      'And 18+ more',
    ],
  },
  
  'basic-design': {
    id: 'basic-design',
    name: 'Basic Design Tools',
    category: 'essential',
    price: 29,
    description: '2D layout and planning tools',
    features: [
      '2D room designer',
      'Fixture placement',
      'Coverage calculator',
      'Basic PPFD mapping',
      'Export to PDF',
    ],
    creditCost: {
      aiDesigner: 5,
    },
  },
  
  'basic-compliance': {
    id: 'basic-compliance',
    name: 'Compliance Tracker',
    category: 'essential',
    price: 19,
    description: 'Stay compliant with regulations',
    features: [
      'State compliance checklists',
      'Record keeping',
      'Audit trail',
      'Reminder system',
      'Document storage',
    ],
  },
  
  // Professional Integrated Suites
  'advanced-designer-suite': {
    id: 'advanced-designer-suite',
    name: 'Advanced Designer Suite',
    category: 'professional',
    price: 89,
    description: 'Complete professional design toolkit',
    features: [
      'Advanced lighting designer (full access)',
      'Electrical estimator (included - $29 value)',
      'Advanced PPFD/DLI calculations',
      'Custom fixture library',
      'Professional reporting',
      'CAD export capabilities',
      '3D room modeling',
      'Shadow analysis',
      'Multi-tier design',
      'IES file support',
    ],
    creditCost: {
      aiDesigner: 10,
      reports: 5,
    },
  },
  
  'ai-assistant': {
    id: 'ai-assistant',
    name: 'AI Crop Assistant',
    category: 'professional',
    price: 49,
    description: 'AI-powered growing insights',
    features: [
      'Yield predictions',
      'Disease detection',
      'Growth optimization',
      'Harvest timing',
      'Strain recommendations',
      'Problem diagnosis',
    ],
    creditCost: {
      aiDesigner: 20,
      apiCalls: 100,
    },
  },
  
  'analytics-pro': {
    id: 'analytics-pro',
    name: 'Analytics Pro',
    category: 'professional',
    price: 39,
    description: 'Advanced analytics and reporting',
    features: [
      'Custom dashboards',
      'Trend analysis',
      'Regression models',
      'Export to Excel/JSON',
      'API webhooks',
      'Scheduled reports',
    ],
    creditCost: {
      reports: 10,
      apiCalls: 50,
    },
  },
  
  'sensor-hub': {
    id: 'sensor-hub',
    name: 'Sensor Integration',
    category: 'professional',
    price: 69,
    description: 'Connect all your sensors',
    features: [
      'Multi-protocol support',
      'Real-time monitoring',
      'Alert system',
      'Historical data',
      'Calibration tools',
      'Mobile dashboard',
    ],
  },
  
  // Enterprise Modules ($99+)
  'multi-site': {
    id: 'multi-site',
    name: 'Multi-Site Management',
    category: 'enterprise',
    price: 199,
    description: 'Manage multiple facilities',
    features: [
      'Centralized dashboard',
      'Cross-site analytics',
      'Bulk configuration',
      'Role management',
      'Site comparison',
      'Executive reports',
    ],
  },
  
  'marketplace': {
    id: 'marketplace',
    name: 'Marketplace Access',
    category: 'enterprise',
    price: 99,
    description: 'Buy and sell on the platform',
    features: [
      'Produce marketplace',
      'Equipment trading',
      'Service providers',
      'Bulk discounts',
      'Payment processing',
      'Rating system',
    ],
  },
  
  'research-analytics-suite': {
    id: 'research-analytics-suite',
    name: 'Research & Analytics Suite',
    category: 'suite',
    price: 399,
    description: 'Complete research, analytics, and biotechnology platform',
    features: [
      // Research Suite Features
      'ANOVA & statistical tests',
      'Factorial & split-plot designs',
      'Power analysis calculator',
      'Experimental design wizard',
      'Research data logger',
      'Literature review AI assistant',
      'Publication-ready reports',
      'Collaboration tools',
      'API access for R/Python',
      // Scientific Tools Premium
      'Advanced data collection',
      'Research paper generation',
      'Peer collaboration tools',
      // Biotechnology Premium
      'Gene expression predictions',
      'Metabolite optimization',
      'Custom breeding recommendations',
      'Advanced plant health monitoring',
    ],
    creditCost: {
      aiDesigner: 50,
      reports: 20,
      apiCalls: 100,
    },
  },
  
  // Integrated Industrial Automation Suite
  'smart-facility-suite': {
    id: 'smart-facility-suite',
    name: 'Smart Facility Suite',
    category: 'suite',
    price: 199,
    description: 'Complete industrial automation and facility management',
    features: [
      // BMS Features
      'Multi-zone climate control',
      'Real-time environmental monitoring',
      'Control strategies builder',
      'Energy consumption tracking',
      'Automated scheduling',
      // HMI Features
      'Real-time equipment monitoring',
      '2D/3D visualization',
      'Alarm management system',
      'Equipment auto-discovery',
      'Mobile access dashboard',
      // SCADA Features
      'Industrial protocol support (Modbus, BACnet, OPC UA, MQTT)',
      'PLC integration (Allen-Bradley, Siemens)',
      'Process monitoring and control',
      'Historical data trending',
      'Automated reporting',
      // Additional Integrated Features
      'Energy Savings Premium (included)',
      'Weather AI Premium (included)',
      'Centralized control dashboard',
      'Predictive maintenance alerts',
    ],
    creditCost: {
      aiDesigner: 25,
      reports: 15,
      apiCalls: 100,
    },
  },
  
  'automation-builder': {
    id: 'automation-builder',
    name: 'Automation Builder',
    category: 'professional',
    price: 59,
    description: 'Visual workflow automation system',
    features: [
      'Drag-and-drop workflow builder',
      'Trigger-based automation',
      'Conditional logic builder',
      'Email/SMS notifications',
      'Device control actions',
      'Scheduled operations',
      'Webhook integrations',
      'Automation templates',
      'Performance monitoring',
      'Error handling & logging',
    ],
    creditCost: {
      aiDesigner: 15,
      apiCalls: 50,
    },
  },
  
  'food-safety-operations-suite': {
    id: 'food-safety-operations-suite',
    name: 'Food Safety & Operations Suite',
    category: 'suite',
    price: 149,
    description: 'Complete food safety compliance and operations management',
    features: [
      // Food Safety Features
      'HACCP plan templates',
      'Compliance tracking',
      'Audit preparation',
      'Regulatory reporting',
      'Certification management',
      // Labor Management Features
      'Employee scheduling',
      'Time tracking & clock-in',
      'QR code task assignments',
      'Mobile workforce app',
      'Labor cost analytics',
      'Productivity tracking',
      // QR & Inventory Features
      'QR code generation',
      'Barcode scanner integration',
      'Plant tag management',
      'Inventory tracking',
      'Batch scanning',
      'Asset tagging',
      'Location tracking',
      'Audit trails',
    ],
    creditCost: {
      reports: 15,
      apiCalls: 40,
    },
  },
  
  'business-intelligence-suite': {
    id: 'business-intelligence-suite',
    name: 'Business Intelligence Suite',
    category: 'suite',
    price: 99,
    description: 'Complete business intelligence and financial management',
    features: [
      // Investment Platform Premium
      'Advanced financial modeling',
      'Grant and rebate optimization',
      'Investment portfolio management',
      'Tax optimization strategies',
      'ROI analysis and projections',
      // Insurance Integration Premium
      'Automated claims processing',
      'Real-time risk monitoring',
      'Premium optimization',
      'Loss prevention alerts',
      // Professional Services Premium
      'Expert consultation credits',
      'Priority support access',
      'Marketplace premium features',
      'Reduced transaction fees',
      'Advanced analytics',
    ],
    creditCost: {
      aiDesigner: 25,
      reports: 15,
      apiCalls: 100,
    },
  },
  
  // Standalone Modules
  'cfd-analysis': {
    id: 'cfd-analysis',
    name: 'CFD Analysis',
    category: 'professional',
    price: 79,
    description: 'Computational Fluid Dynamics analysis for airflow optimization',
    features: [
      'Advanced CFD simulations',
      'Airflow visualization',
      'Custom environmental modeling',
      'Optimization recommendations',
      'Temperature distribution analysis',
      'Pressure mapping',
      'Multi-zone analysis',
      'Export capabilities',
    ],
    creditCost: {
      aiDesigner: 30,
      reports: 15,
      apiCalls: 50,
    },
  },
  
  'employee-scouting': {
    id: 'employee-scouting',
    name: 'Employee Scouting System',
    category: 'professional',
    price: 49,
    description: 'Mobile scouting app with opt-in camera system for employees',
    features: [
      'Mobile app for employee phones',
      'Opt-in camera permissions',
      'GPS-tagged scouting reports',
      'Pest & disease photo capture',
      'AI-powered issue detection',
      'Task assignment & routing',
      'Real-time alerts to managers',
      'Scouting history & trends',
      'Employee performance tracking',
      'Integration with IPM system',
      'Batch photo uploads',
      'Offline mode support',
    ],
  },
  
  'gmp-compliance-suite': {
    id: 'gmp-compliance-suite',
    name: 'GMP Compliance Suite',
    category: 'enterprise',
    price: 299,
    description: 'Complete 21 CFR Part 11 compliant documentation system',
    features: [
      'Electronic signatures & audit trails',
      'Document version control with check-in/out',
      'Batch record management',
      'Deviation & CAPA tracking',
      'Training record compliance',
      'SOP management system',
      'Quality control workflows',
      'FDA inspection readiness',
      'Change control procedures',
      'Supplier qualification',
      'Equipment qualification (IQ/OQ/PQ)',
      'Validation master plans',
    ],
  },
  
  'financial-integration-suite': {
    id: 'financial-integration-suite',
    name: 'Financial Integration Suite',
    category: 'professional',
    price: 149,
    description: 'Complete accounting and financial analysis platform',
    features: [
      'QuickBooks & Xero integration',
      'Automated invoice sync',
      'AI-powered document analysis',
      'SAM solar financial modeling',
      'TCO & ROI calculations',
      'Financial reporting dashboards',
      'Payment processing integration',
      'Tax optimization strategies',
      'Grant & rebate tracking',
      'Energy savings analysis',
      'Carbon credit valuation',
      'Investment scenario modeling',
    ],
  },
  
  'advanced-labor-management': {
    id: 'advanced-labor-management',
    name: 'Advanced Labor Management',
    category: 'professional',
    price: 99,
    description: 'Complete workforce and productivity management',
    features: [
      'Employee scheduling & time clock',
      'Task assignment & tracking',
      'Productivity analytics',
      'Payroll system integration',
      'Skills & certification tracking',
      'Mobile workforce app',
      'Labor cost optimization',
      'Performance dashboards',
      'Training management',
      'Break & overtime tracking',
      'Multi-location support',
      'Union compliance tools',
    ],
  },
  
  'plant-health-ai-addon': {
    id: 'plant-health-ai-addon',
    name: 'Plant Health AI (Beta)',
    category: 'addon',
    price: 29,
    description: 'AI-powered pest & disease detection using Google Vision & Claude',
    features: [
      'Pest & disease detection (Google Vision + Claude AI)',
      'AWS Rekognition integration (optional)',
      'Basic treatment recommendations',
      'Image-based analysis (100 scans/month)',
      'Historical tracking',
      'Environmental correlation',
      'Mobile app scanning',
      'Email alerts for critical issues',
    ],
  },
  
  'ml-prediction-suite': {
    id: 'ml-prediction-suite',
    name: 'ML Prediction Suite',
    category: 'enterprise',
    price: 199,
    description: 'Advanced machine learning models for cultivation optimization',
    features: [
      'Yield prediction models',
      'Energy consumption forecasting',
      'Pest risk assessment',
      'Optimal harvest timing',
      'Environmental optimization',
      'Crop quality predictions',
      'Market price forecasting',
      'Resource usage optimization',
      'Climate impact modeling',
      'Strain-specific recommendations',
      'ROI optimization models',
      'Predictive maintenance',
    ],
  },
  
  // Greenhouse Project Management Suite
  'greenhouse-project-management': {
    id: 'greenhouse-project-management',
    name: 'Greenhouse Project Management',
    category: 'professional',
    price: 149,
    description: 'Complete greenhouse construction and operations project management',
    features: [
      'Greenhouse construction planning & timelines',
      'MEP (Mechanical, Electrical, Plumbing) coordination',
      'Vendor & contractor management',
      'Material procurement tracking',
      'Installation scheduling & sequencing',
      'Commissioning checklists',
      'Gantt charts & critical path analysis',
      'Budget tracking & cost control',
      'Change order management',
      'Document control & versioning',
      'Multi-zone project coordination',
      'Equipment delivery tracking',
      'Startup & testing protocols',
      'Maintenance scheduling',
      'Project templates library',
      'Mobile field app for updates',
      'Progress photo documentation',
      'Milestone tracking & reporting',
    ],
  },

  // Budget-Friendly Starter Modules
  'basic-reporting': {
    id: 'basic-reporting',
    name: 'Basic Reporting',
    category: 'essential',
    price: 9,
    description: 'Simple reporting tools for small operations',
    features: [
      'Daily production reports',
      'Basic yield tracking',
      'Simple expense tracking',
      'CSV export',
      'Email reports',
      'Mobile-friendly views',
    ],
  },
  
  'simple-inventory': {
    id: 'simple-inventory',
    name: 'Simple Inventory',
    category: 'essential',
    price: 19,
    description: 'Basic inventory tracking for supplies and products',
    features: [
      'Supply tracking',
      'Low stock alerts',
      'Basic lot tracking',
      'Purchase history',
      'Inventory counts',
      'Barcode scanning',
    ],
  },
  
  'basic-customer-crm': {
    id: 'basic-customer-crm',
    name: 'Basic Customer CRM',
    category: 'essential',
    price: 19,
    description: 'Simple customer relationship management',
    features: [
      'Customer database',
      'Contact management',
      'Order history',
      'Basic communications',
      'Customer notes',
      'Export capabilities',
    ],
  },
  
  // Cultivation Operations Modules
  'ipm-system': {
    id: 'ipm-system',
    name: 'Integrated Pest Management (IPM)',
    category: 'professional',
    price: 89,
    description: 'Complete pest management system with AI detection and GPS mapping',
    features: [
      'AI-powered pest detection with photo analysis',
      'GPS location mapping of pest incidents',
      'IPM protocol generation',
      'Treatment recommendations database',
      'Sticky trap monitoring',
      'Beneficial insect tracking',
      'Spray records & REI tracking',
      'Resistance management',
      'Mobile scouting app',
      'Pest lifecycle predictions',
      'Environmental correlation analysis',
      'Automated alert system',
    ],
  },

  'seed-to-sale': {
    id: 'seed-to-sale',
    name: 'Seed-to-Sale Tracking',
    category: 'professional',
    price: 129,
    description: 'Complete plant lifecycle tracking from seed to harvest',
    features: [
      'Full plant lifecycle tracking',
      'Batch management system',
      'Mother plant management',
      'Clone tracking & success rates',
      'Transplant scheduling',
      'Growth stage monitoring',
      'Phenotype tracking',
      'Genetic lineage records',
      'Harvest planning & timing',
      'Yield tracking & analysis',
      'Compliance reporting',
      'Mobile barcode scanning',
    ],
  },

  'crop-planning-suite': {
    id: 'crop-planning-suite',
    name: 'Crop Planning & Scheduling',
    category: 'professional',
    price: 79,
    description: 'Advanced crop planning with 200+ varieties database',
    features: [
      '200+ crop varieties database',
      'Strain/variety selection tools',
      'DLI/PPFD requirements per crop',
      'Growth stage scheduling',
      'Phenotype analysis',
      'Crop rotation planning',
      'Planting calendars',
      'Resource allocation',
      'Labor requirement forecasting',
      'Harvest predictions',
      'Market timing optimization',
      'Climate zone adaptation',
    ],
  },

  'harvest-management': {
    id: 'harvest-management',
    name: 'Harvest Management System',
    category: 'professional',
    price: 99,
    description: 'Complete harvest and post-harvest processing management',
    features: [
      'Harvest planning & scheduling',
      'Harvest crew management',
      'Yield estimation & tracking',
      'Post-harvest processing workflow',
      'Drying room management',
      'Curing environment control',
      'Trimming workflow optimization',
      'Quality grading system',
      'Packaging automation',
      'Weight tracking & reconciliation',
      'Loss tracking & analysis',
      'Batch labeling & tracking',
    ],
  },

  'equipment-maintenance': {
    id: 'equipment-maintenance',
    name: 'Equipment Maintenance Management',
    category: 'professional',
    price: 69,
    description: 'Comprehensive equipment lifecycle and maintenance tracking',
    features: [
      'Equipment inventory management',
      'Preventive maintenance scheduling',
      'Repair history tracking',
      'Calibration schedules',
      'Warranty tracking',
      'Service contractor management',
      'Parts inventory',
      'Equipment downtime analysis',
      'Cost tracking per equipment',
      'Equipment leasing analysis',
      'Depreciation tracking',
      'Mobile maintenance app',
    ],
  },

  'training-certification': {
    id: 'training-certification',
    name: 'Training & Certification Management',
    category: 'essential',
    price: 49,
    description: 'Employee training and certification tracking system',
    features: [
      'Employee training records',
      'Certification tracking',
      'Training schedule management',
      'Compliance training tracking',
      'Safety training records',
      'Skills matrix management',
      'Training material library',
      'Quiz & assessment tools',
      'Certificate generation',
      'Expiration alerts',
      'Training cost tracking',
      'Performance tracking',
    ],
  },

  'cad-bim-export': {
    id: 'cad-bim-export',
    name: 'CAD/BIM Export Suite',
    category: 'professional',
    price: 199,
    description: 'Professional CAD/BIM export for construction documentation',
    features: [
      'DWG file generation',
      'IFC export support',
      'Revit integration',
      'MEP design export',
      'Construction drawings',
      'Single-line diagrams',
      'Panel schedules',
      'Equipment schedules',
      '3D model export',
      'Layer management',
      'Drawing templates',
      'Title block customization',
    ],
  },

  // Specialty Modules
  'cannabis-compliance': {
    id: 'cannabis-compliance',
    name: 'Cannabis Compliance Module',
    category: 'professional',
    price: 79,
    description: 'State-specific cannabis compliance tracking',
    features: [
      'METRC integration',
      'State reporting tools',
      'Seed-to-sale tracking',
      'Lab testing management',
      'Waste tracking',
      'Transport manifests',
      'Compliance alerts',
      'Audit preparation',
    ],
  },
  
  'organic-certification': {
    id: 'organic-certification',
    name: 'Organic Certification Tracking',
    category: 'essential',
    price: 49,
    description: 'Tools for maintaining organic certification',
    features: [
      'Input tracking',
      'Certification records',
      'Inspection preparation',
      'Organic SOPs',
      'Buffer zone management',
      'Contamination prevention',
      'Annual reports',
      'Document storage',
    ],
  },
  
  'water-management': {
    id: 'water-management',
    name: 'Water Management Suite',
    category: 'professional',
    price: 69,
    description: 'Comprehensive water usage and quality management',
    features: [
      'Water usage tracking',
      'Quality monitoring',
      'Irrigation scheduling',
      'Runoff management',
      'pH/EC tracking',
      'Nutrient management',
      'Water recycling metrics',
      'Conservation reports',
    ],
  },
  
  'pest-database': {
    id: 'pest-database',
    name: 'Pest Management Database',
    category: 'essential',
    price: 39,
    description: 'Comprehensive pest identification and treatment database',
    features: [
      'Pest identification guide',
      'Treatment protocols',
      'Spray records',
      'REI tracking',
      'Beneficial insects database',
      'IPM planning tools',
      'Application history',
      'Resistance management',
    ],
  },
  
  // Integration Modules
  'erp-integration': {
    id: 'erp-integration',
    name: 'ERP Integration Module',
    category: 'professional',
    price: 99,
    description: 'Connect to major ERP systems',
    features: [
      'SAP integration',
      'Oracle NetSuite connector',
      'Microsoft Dynamics',
      'Custom API support',
      'Data synchronization',
      'Workflow automation',
      'Error handling',
      'Audit logs',
    ],
  },
  
  'iot-device-hub': {
    id: 'iot-device-hub',
    name: 'IoT Device Hub',
    category: 'professional',
    price: 59,
    description: 'Universal IoT device integration platform',
    features: [
      'Multi-protocol support',
      'Device discovery',
      'Data aggregation',
      'Alert management',
      'Device health monitoring',
      'Firmware updates',
      'Edge computing',
      'Custom integrations',
    ],
  },
  
  'weather-integration': {
    id: 'weather-integration',
    name: 'Weather Station Integration',
    category: 'essential',
    price: 29,
    description: 'Professional weather data and forecasting',
    features: [
      'Local weather stations',
      'Microclimate modeling',
      'Historical data',
      '14-day forecasts',
      'Severe weather alerts',
      'Growing degree days',
      'DLI predictions',
      'API access',
    ],
  },
  
  'energy-monitoring-basic': {
    id: 'energy-monitoring-basic',
    name: 'Basic Energy Monitoring',
    category: 'essential',
    price: 19,
    description: 'Simple energy usage tracking',
    features: [
      'Real-time usage',
      'Daily/monthly reports',
      'Cost tracking',
      'Peak demand alerts',
      'Usage trends',
      'Simple dashboards',
    ],
  },
  
};

// Credit Packages
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter-pack',
    name: 'Starter Pack',
    credits: 100,
    price: 9,
    bonus: 0,
  },
  {
    id: 'growth-pack',
    name: 'Growth Pack',
    credits: 500,
    price: 39,
    bonus: 10, // 10% bonus = 550 credits
    popular: true,
  },
  {
    id: 'pro-pack',
    name: 'Pro Pack',
    credits: 1000,
    price: 69,
    bonus: 20, // 20% bonus = 1200 credits
  },
  {
    id: 'bulk-pack',
    name: 'Bulk Pack',
    credits: 5000,
    price: 299,
    bonus: 30, // 30% bonus = 6500 credits
  },
];

// Credit Costs for Various Actions
export const CREDIT_COSTS = {
  aiDesigner: {
    simple: 10, // Basic facility design
    complex: 25, // Advanced multi-zone design
    optimization: 50, // Complete facility optimization
  },
  ai: {
    // AI Designer
    design_command: 10, // Natural language design requests
    lighting_recommendations: 15, // Lighting optimization suggestions
    // Health Monitoring
    health_analysis: 25, // Comprehensive health analysis
    monitoring_check: 5, // Real-time monitoring update
    image_analysis: 10, // Per image analysis
    diagnostic_report: 20, // Diagnostic assessment
    // Yield Optimization
    yield_forecast: 30, // Production forecasting
    progress_tracking: 5, // Growth tracking update
    // Document Processing
    document_processing: 15, // Document analysis and extraction
    data_extraction: 10, // Data extraction from documents
    compliance_analysis: 20, // Compliance document review
    // Predictive Analytics
    performance_forecast: 25, // Performance prediction
    timing_optimization: 20, // Optimal timing predictions
    quality_analysis: 30, // Quality assessment
    advanced_analytics: 50, // Advanced analytical modeling
    // General AI
    consultation: 5, // General AI consultation
    analysis: 20, // Complex analysis request
    optimization: 40, // Full optimization analysis
  },
  reports: {
    basic: 5,
    detailed: 10,
    custom: 20,
    ai_enhanced: 30, // AI-generated insights
    compliance: 25, // Compliance reporting
    financial: 35, // Financial analysis
  },
  api: {
    standard: 1,
    compute: 5,
    ai: 10,
    integration: 3, // System integration calls
  },
  simulations: {
    quick: 5,
    detailed: 15,
    advanced: 50,
    ai_powered: 75, // AI-enhanced modeling
    environmental: 100, // Environmental simulations
  },
};

// Bundle Discounts
export const BUNDLES = [
  {
    id: 'complete-enterprise',
    name: 'Complete Enterprise Bundle',
    modules: [
      'advanced-designer-suite',
      'smart-facility-suite', 
      'research-analytics-suite',
      'food-safety-operations-suite',
      'business-intelligence-suite',
      'gmp-compliance-suite',
      'financial-integration-suite',
      'ml-prediction-suite',
      'plant-health-ai-addon',
      'advanced-labor-management',
      'cfd-analysis'
    ],
    price: 1299, // Save $600+ vs individual pricing
    savings: 600,
    description: 'All premium modules with unlimited AI credits',
  },
  {
    id: 'regulated-facility-bundle',
    name: 'Regulated Facility Bundle',
    modules: [
      'gmp-compliance-suite',
      'food-safety-operations-suite',
      'financial-integration-suite',
      'advanced-labor-management',
      'plant-health-ai-addon'
    ],
    price: 599, // Save $226 vs individual pricing
    savings: 226,
    description: 'Everything needed for FDA/USDA regulated facilities',
  },
  {
    id: 'industrial-automation-bundle',
    name: 'Industrial Automation Bundle',
    modules: [
      'smart-facility-suite',
      'food-safety-operations-suite',
      'cfd-analysis',
      'ml-prediction-suite'
    ],
    price: 499, // Save $127 vs individual pricing
    savings: 127,
    description: 'Complete industrial automation with predictive capabilities',
  },
  {
    id: 'professional-grower-bundle',
    name: 'Professional Grower Bundle',
    modules: [
      'advanced-designer-suite',
      'business-intelligence-suite',
      'ai-assistant',
      'analytics-pro',
      'plant-health-ai-addon',
      'employee-scouting'
    ],
    price: 349, // Save $106 vs individual pricing
    savings: 106,
    description: 'Everything a professional grower needs to succeed',
  },
  {
    id: 'research-facility-bundle',
    name: 'Research Facility Bundle',
    modules: [
      'research-analytics-suite',
      'smart-facility-suite',
      'cfd-analysis',
      'ml-prediction-suite'
    ],
    price: 699, // Save $177 vs individual pricing
    savings: 177,
    description: 'Complete research facility with ML capabilities',
  },
  {
    id: 'financial-operations-bundle',
    name: 'Financial Operations Bundle',
    modules: [
      'financial-integration-suite',
      'business-intelligence-suite',
      'advanced-labor-management',
      'energy-savings-premium'
    ],
    price: 299, // Save $77 vs individual pricing
    savings: 77,
    description: 'Complete financial management and optimization',
  },
  {
    id: 'small-grower-starter',
    name: 'Small Grower Starter Bundle',
    modules: [
      'basic-reporting',
      'simple-inventory',
      'basic-customer-crm',
      'energy-monitoring-basic',
      'weather-integration'
    ],
    price: 59, // Save $36 vs individual pricing
    savings: 36,
    description: 'Essential tools for small operations just getting started',
  },
  {
    id: 'cannabis-operations-bundle',
    name: 'Cannabis Operations Bundle',
    modules: [
      'cannabis-compliance',
      'advanced-labor-management',
      'plant-health-ai-addon',
      'pest-database',
      'water-management'
    ],
    price: 299, // Save $115 vs individual pricing
    savings: 115,
    description: 'Complete cannabis cultivation and compliance solution',
  },
  {
    id: 'sustainable-farming-bundle',
    name: 'Sustainable Farming Bundle',
    modules: [
      'organic-certification',
      'water-management',
      'pest-database',
      'weather-integration',
      'energy-monitoring-basic'
    ],
    price: 149, // Save $55 vs individual pricing
    savings: 55,
    description: 'Tools for sustainable and organic farming operations',
  },
  {
    id: 'greenhouse-operations-bundle',
    name: 'Greenhouse Operations Bundle',
    modules: [
      'greenhouse-project-management',
      'smart-facility-suite',
      'advanced-designer-suite',
      'water-management',
      'weather-integration'
    ],
    price: 499, // Save $187 vs individual pricing
    savings: 187,
    description: 'Complete greenhouse construction, design, and operations management',
  },
  {
    id: 'complete-cultivation-bundle',
    name: 'Complete Cultivation Bundle',
    modules: [
      'seed-to-sale',
      'crop-planning-suite',
      'harvest-management',
      'ipm-system',
      'water-management',
      'pest-database'
    ],
    price: 399, // Save $205 vs individual pricing
    savings: 205,
    description: 'Everything needed for professional cultivation operations',
  },
  {
    id: 'facility-operations-bundle',
    name: 'Facility Operations Bundle',
    modules: [
      'equipment-maintenance',
      'training-certification',
      'advanced-labor-management',
      'food-safety-operations-suite'
    ],
    price: 299, // Save $67 vs individual pricing
    savings: 67,
    description: 'Complete facility and workforce management solution',
  },
  {
    id: 'construction-documentation-bundle',
    name: 'Construction Documentation Bundle',
    modules: [
      'cad-bim-export',
      'greenhouse-project-management',
      'advanced-designer-suite',
      'electrical-estimator'
    ],
    price: 399, // Save $67 vs individual pricing
    savings: 67,
    description: 'Professional construction planning and documentation suite',
  },
];

// Energy Savings Program Configuration
export const ENERGY_SAVINGS_PROGRAM = {
  id: 'energy-savings-free',
  name: 'Energy Savings Program',
  description: 'Make money while saving energy - completely free',
  price: 0,
  revenueShare: 0.25, // Shared savings model
  estimatedSavings: {
    typical: 0.3, // Significant energy savings typically achieved
    range: { min: 0.15, max: 0.45 },
  },
  features: [
    'Automated demand management during peak periods',
    'Utility rebate program participation',
    'Intelligent environmental control',
    'Smart scheduling optimization',
    'Real-time energy monitoring',
    'Monthly performance reports',
    'Savings guarantees',
    'No upfront investment',
  ],
  requirements: [
    'Minimum facility load requirements',
    'Compatible control systems',
    'Internet connectivity required',
    'Works with major equipment brands',
  ],
  benefits: {
    growerShare: 0.75, // Majority of savings retained by grower
    vibeluxShare: 0.25, // Platform service fee from savings
    paymentFrequency: 'monthly',
    minimumContract: '12 months',
  },
};

// Helper Functions
export function calculateModulePrice(moduleIds: string[]): number {
  return moduleIds.reduce((total, id) => {
    const module = MODULES[id];
    return total + (module?.price || 0);
  }, 0);
}

export function getBundleDiscount(moduleIds: string[]): number {
  const bundle = BUNDLES.find(b => 
    b.modules.length === moduleIds.length &&
    b.modules.every(m => moduleIds.includes(m))
  );
  return bundle?.savings || 0;
}

export function calculateCreditsWithBonus(packageId: string): number {
  const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return 0;
  return pkg.credits + (pkg.credits * pkg.bonus / 100);
}