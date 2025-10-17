// VibeLux Pricing Marketing Copy
// Carefully crafted messaging for each tier and use case

export const PRICING_COPY = {
  // Main value proposition
  hero: {
    headline: "Simple, Transparent Pricing That Pays for Itself",
    subheadline: "Join 500+ commercial growers who've reduced energy costs by 20-40% while improving yields by 15-25%",
    trustSignals: [
      "No hardware required",
      "Works with any lighting system", 
      "14-day free trial",
      "Cancel anytime"
    ]
  },

  // Individual tier messaging
  tiers: {
    free: {
      targetAudience: "Students, Hobbyists & Evaluators",
      painPoints: [
        "Learning curve of professional growing",
        "Expensive mistakes from poor planning",
        "Not sure where to start"
      ],
      benefits: [
        "Learn with professional-grade tools",
        "Plan your first grow correctly",
        "No credit card required"
      ],
      socialProof: "Used by 5,000+ home growers to plan their first setup",
      emailSubject: "Start Your Growing Journey - Free Forever",
      cta: {
        primary: "Start Learning Free",
        secondary: "No credit card needed"
      }
    },

    grower: {
      targetAudience: "Serious Home Growers & Small Commercial Ops",
      painPoints: [
        "High electricity bills eating into profits",
        "Inconsistent yields between cycles",
        "Manual tracking is time-consuming"
      ],
      benefits: [
        "Cut electricity costs by 15-25%",
        "Prevent crop failures with environmental alerts",
        "Professional reports impress investors"
      ],
      socialProof: "Trusted by 300+ medical growers for consistent results",
      emailSubject: "Grow Smarter, Not Harder - Save $200+/month",
      cta: {
        primary: "Start 14-Day Free Trial",
        secondary: "No credit card required"
      },
      testimonial: {
        quote: "VibeLux paid for itself in the first month. My electricity bill dropped by $280 and my yields are more consistent.",
        author: "Sarah Chen",
        role: "Medical Cannabis Grower",
        savings: "$3,360/year saved"
      }
    },

    pro: {
      targetAudience: "Commercial Cultivators & Consultants",
      painPoints: [
        "Energy costs destroying profit margins",
        "Compliance documentation nightmare",
        "Can't scale without hiring more staff"
      ],
      benefits: [
        "AI optimization delivers 20-40% energy savings",
        "Predictive maintenance prevents $10k+ failures",
        "Automated compliance reports save 10hrs/week"
      ],
      socialProof: "Powering 200+ commercial facilities nationwide",
      emailSubject: "Your Facility Could Save $50,000+ This Year",
      cta: {
        primary: "Calculate Your Savings",
        secondary: "ROI in <6 months"
      },
      testimonial: {
        quote: "We've saved $127,000 in energy costs this year alone. The predictive maintenance caught a chiller failure that would have cost us a full crop.",
        author: "Marcus Rodriguez", 
        role: "Director of Cultivation, GreenLeaf Farms",
        savings: "$127,000/year saved"
      },
      roi: {
        typical: "3-6 months",
        energySavings: "20-40%",
        yieldIncrease: "15-25%",
        complianceTime: "10 hours/week saved"
      }
    },

    business: {
      targetAudience: "Multi-Site Operations & Enterprise",
      painPoints: [
        "Managing consistency across facilities",
        "Scaling without proportional cost increase",
        "Need enterprise-grade security & support"
      ],
      benefits: [
        "Centralized control of all facilities",
        "White-label for your brand",
        "Dedicated success manager"
      ],
      socialProof: "Chosen by 3 of the top 10 MSOs",
      emailSubject: "Enterprise Solutions for Cannabis at Scale",
      cta: {
        primary: "Schedule Demo",
        secondary: "Custom pricing available"
      },
      testimonial: {
        quote: "VibeLux enabled us to standardize operations across 12 facilities. We're saving $1.2M annually while improving quality metrics.",
        author: "Jennifer Walsh",
        role: "VP Operations, Multi-State Operator",
        savings: "$1.2M/year across portfolio"
      }
    }
  },

  // Feature descriptions (benefit-focused)
  features: {
    calculators: {
      title: "Professional Calculators",
      description: "Stop guessing. Know exactly how much light your plants need.",
      benefit: "Prevent light burn and maximize photosynthesis"
    },
    heatMapping: {
      title: "3D Heat Mapping", 
      description: "Visualize light distribution before buying expensive fixtures.",
      benefit: "Eliminate dead spots and hot spots"
    },
    aiOptimization: {
      title: "AI-Powered Optimization",
      description: "Machine learning continuously improves your lighting efficiency.",
      benefit: "Save 20-40% on energy automatically"
    },
    predictiveMaintenance: {
      title: "Predictive Maintenance",
      description: "Know when fixtures will fail before they do.",
      benefit: "Prevent crop loss from unexpected failures"
    },
    compliance: {
      title: "Automated Compliance",
      description: "Generate audit-ready reports with one click.",
      benefit: "Pass inspections without stress"
    },
    mobileApp: {
      title: "Mobile Monitoring",
      description: "Check your facility from anywhere, anytime.",
      benefit: "Peace of mind when you're away"
    }
  },

  // Objection handlers
  objections: {
    tooExpensive: {
      question: "Seems expensive for software?",
      answer: "VibeLux typically pays for itself in 2-3 months through energy savings alone. The yield improvements are pure profit on top. Plus, preventing just one crop failure saves tens of thousands.",
      proof: "See our ROI calculator with your actual numbers"
    },
    noTimeToLearn: {
      question: "I don't have time to learn new software",
      answer: "Most users are saving money within 48 hours. Our onboarding specialist will have you set up in under an hour, and our interface is designed for growers, not engineers.",
      proof: "Watch our 5-minute setup video"
    },
    happyWithCurrent: {
      question: "My current setup works fine",
      answer: "Great! VibeLux makes your good setup even better. We don't require any hardware changes - we optimize what you already have. Even well-run facilities see 15-20% improvements.",
      proof: "Read case studies from facilities like yours"
    },
    dataSecurityConcerns: {
      question: "Is my facility data secure?",
      answer: "Absolutely. We use bank-level encryption, SOC 2 compliance, and never share your data. You own all your information and can export or delete it anytime.",
      proof: "View our security certifications"
    }
  },

  // Email campaigns
  emailSequences: {
    trialExpiring: {
      subject: "Your trial ends in 3 days - here's what you'll miss",
      preview: "Don't lose your configured projects and savings calculations",
      cta: "Keep Your Savings Going"
    },
    abandoned: {
      subject: "Your facility could be saving $[AMOUNT]/month",
      preview: "Based on your trial data, here's what you're leaving on the table",
      cta: "Claim Your Savings"
    },
    winBack: {
      subject: "We miss you - here's 25% off your first 3 months",
      preview: "See what's new in VibeLux since you left",
      cta: "Come Back and Save"
    }
  },

  // Social proof elements
  socialProof: {
    stats: {
      totalSaved: "$12.5M+ saved by our customers",
      facilitiesOptimized: "500+ facilities optimized",
      lightsAnalyzed: "50,000+ lights analyzed",
      cropsProtected: "1,000+ crops protected from failure"
    },
    logos: {
      title: "Trusted by Industry Leaders",
      companies: ["GreenThumb Industries", "Curaleaf", "Cresco Labs", "Trulieve", "Columbia Care"]
    },
    awards: [
      "Cannabis Industry Journal - Best Software 2024",
      "MJBizCon Innovation Award Winner",
      "Greenhouse Grower Top 10 Technologies"
    ]
  },

  // Guarantees
  guarantees: {
    satisfaction: {
      title: "30-Day Money-Back Guarantee",
      description: "If you don't see measurable energy savings within 30 days, we'll refund your subscription."
    },
    roi: {
      title: "6-Month ROI Guarantee", 
      description: "Professional tier customers who don't see ROI within 6 months get 3 months free."
    },
    support: {
      title: "24/7 Support Guarantee",
      description: "Pro and Business customers get responses within 4 hours, guaranteed."
    }
  },

  // Competitive differentiators
  differentiators: {
    vsSpreadsheets: {
      them: "Error-prone manual calculations",
      us: "Automated optimization with AI"
    },
    vsLightingManufacturers: {
      them: "Locked into their hardware",
      us: "Works with any lighting brand"
    },
    vsConsultants: {
      them: "$500/hour for one-time advice",
      us: "24/7 optimization for less than $100/month"
    }
  }
};

// Pricing page FAQ content
export const PRICING_FAQ = [
  {
    question: "How quickly will I see ROI?",
    answer: "Most customers see payback within 3-6 months through energy savings alone. Facilities running 12+ hours/day often see ROI in under 3 months. The yield improvements and prevented crop failures are additional value on top."
  },
  {
    question: "Do I need to buy special hardware?",
    answer: "No! VibeLux is 100% software. We work with whatever lighting system you already have - HPS, LED, CMH, or mixed. No sensors or controllers required to start saving."
  },
  {
    question: "What if I have multiple facilities?",
    answer: "Our Business plan is designed for multi-site operations. You get centralized dashboards, bulk configuration tools, and facility comparison reports. Contact sales for volume discounts."
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes! Upgrade anytime and we'll prorate the difference. Downgrade at the end of any billing cycle. No long-term contracts or cancellation fees."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, ACH transfers, and wire transfers for annual plans. Business customers can request NET 30 invoicing."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use 256-bit encryption, SOC 2 Type II compliance, and regular third-party security audits. Your data is never shared or sold. You can export or delete it anytime."
  },
  {
    question: "Do you offer discounts?",
    answer: "Yes! Save 20% with annual billing. We also offer discounts for non-profits, educational institutions, and multi-year commitments. Contact sales for details."
  },
  {
    question: "What counts as a 'project'?",
    answer: "A project is typically one grow room or greenhouse zone. You can create unlimited designs within a project. Most facilities need 1 project per independently controlled lighting zone."
  },
  {
    question: "What's included in support?",
    answer: "Free tier gets community forums. Grower gets email support (24hr response). Pro gets priority support (4hr response) plus onboarding help. Business gets a dedicated success manager."
  },
  {
    question: "Can I get a demo?",
    answer: "Absolutely! Book a 30-minute demo with our team to see VibeLux in action with your facility data. We'll show you potential savings specific to your operation."
  }
];

// Industry-specific messaging
export const VERTICAL_MESSAGING = {
  cannabis: {
    headline: "Built for Cannabis Cultivators",
    painPoints: ["Compliance documentation", "Strain-specific optimization", "Multi-state operations"],
    features: ["Strain library", "State compliance templates", "Cannabinoid optimization"]
  },
  vegetables: {
    headline: "Maximize Vegetable Production", 
    painPoints: ["Year-round consistency", "Energy costs", "Food safety compliance"],
    features: ["Crop scheduling", "FDA compliance tools", "Nutritional optimization"]
  },
  vertical: {
    headline: "Vertical Farming Optimized",
    painPoints: ["Multi-tier complexity", "Urban energy costs", "Space efficiency"],
    features: ["Stack optimization", "Inter-canopy lighting", "Urban utility integration"]
  }
};

// Call-to-action variations for A/B testing
export const CTA_VARIATIONS = {
  primary: [
    "Start Free Trial",
    "Calculate Your Savings",
    "See Your ROI",
    "Start Saving Today",
    "Optimize My Grow"
  ],
  secondary: [
    "No credit card required",
    "14-day free trial", 
    "ROI in <6 months",
    "Cancel anytime",
    "Setup in 5 minutes"
  ],
  urgency: [
    "Limited time: 25% off first 3 months",
    "Join 500+ growers already saving",
    "Prices increasing next month",
    "Lock in 2024 pricing",
    "Save $1000s this quarter"
  ]
};