'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, Sparkles, Leaf, Building, Globe, Calculator,
  TrendingUp, Shield, Zap, ArrowRight, Star, Info,
  DollarSign, Users, BarChart3, Brain, Eye
} from 'lucide-react';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';

// Unified pricing structure
const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Learn & Explore',
    description: 'Perfect for students and hobbyists exploring indoor growing',
    price: {
      monthly: 0,
      annual: 0
    },
    color: 'gray',
    icon: Sparkles,
    highlighted: false,
    features: [
      'PPFD & DLI Calculators',
      'Basic VPD Calculator', 
      'Energy Cost Estimator',
      '1 Project (7-day storage)',
      '50 Fixture Library Access',
      'Educational Resources',
      'Community Support'
    ],
    limitations: [
      'No heat mapping',
      'No 3D design tools',
      'No API access',
      'Basic exports only'
    ],
    cta: {
      text: 'Start Free',
      variant: 'outline'
    },
    metrics: {
      projects: 1,
      teamMembers: 1,
      dataRetention: '7 days',
      support: 'Community'
    }
  },
  {
    id: 'grower',
    name: 'Grower',
    tagline: 'Personal & Small Operations',
    description: 'Advanced tools for serious home growers and small commercial ops',
    price: {
      monthly: 29,
      annual: 24
    },
    color: 'green',
    icon: Leaf,
    highlighted: false,
    features: [
      'Everything in Free',
      'Advanced Heat Mapping',
      '2D/3D Design Studio',
      'Environmental Monitoring',
      'ROI & Yield Calculators',
      '10 Projects (90-day storage)',
      '500+ Fixture Library',
      'Mobile App Access',
      'Email Support (24hr)'
    ],
    limitations: [
      'No AI optimization',
      'No predictive maintenance',
      'Limited API calls'
    ],
    cta: {
      text: 'Start 14-Day Trial',
      variant: 'outline'
    },
    metrics: {
      projects: 10,
      teamMembers: 3,
      dataRetention: '90 days',
      support: 'Email (24hr)'
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    tagline: 'Commercial Operations',
    description: 'Complete toolkit for commercial cultivators and consultants',
    price: {
      monthly: 99,
      annual: 79
    },
    color: 'blue',
    icon: Building,
    highlighted: true,
    popularBadge: 'Most Popular',
    features: [
      'Everything in Grower',
      'AI-Powered Optimization',
      'Predictive Maintenance',
      'Advanced Analytics',
      'Energy Optimization Suite',
      'Compliance Tracking',
      '50 Projects (1-year storage)',
      'API Access (100k calls/mo)',
      'Priority Support (4hr)',
      'Custom Reports & Branding'
    ],
    limitations: [
      'Single facility only',
      'Standard integrations'
    ],
    cta: {
      text: 'Start 14-Day Trial',
      variant: 'primary'
    },
    metrics: {
      projects: 50,
      teamMembers: 10,
      dataRetention: '1 year',
      support: 'Priority (4hr)'
    }
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Multi-Site & Enterprise',
    description: 'Scalable solution for multi-facility operations and enterprises',
    price: {
      monthly: 299,
      annual: 239
    },
    color: 'purple',
    icon: Globe,
    highlighted: false,
    features: [
      'Everything in Professional',
      'Unlimited Projects & Storage',
      'Multi-Facility Management',
      'Advanced AI Insights',
      'White Label Options',
      'Custom Integrations',
      'Dedicated Account Manager',
      'SLA Guarantee',
      'On-Premise Option',
      'Unlimited API Access'
    ],
    limitations: [],
    cta: {
      text: 'Contact Sales',
      variant: 'outline'
    },
    metrics: {
      projects: 'Unlimited',
      teamMembers: 'Unlimited',
      dataRetention: 'Unlimited',
      support: 'Dedicated Manager'
    }
  }
];

// Value props for each tier
const VALUE_PROPS = {
  free: {
    headline: 'Start Your Growing Journey',
    subheadline: 'Learn the fundamentals of horticultural lighting with professional-grade calculators',
    benefits: [
      'No credit card required',
      'Access forever',
      'Learn at your own pace'
    ]
  },
  grower: {
    headline: 'Optimize Your Grow',
    subheadline: 'Save 15-25% on energy costs while improving plant health and yields',
    benefits: [
      'Reduce energy waste',
      'Prevent crop failures', 
      'Professional reporting'
    ]
  },
  pro: {
    headline: 'Scale Your Operation',
    subheadline: 'AI-powered insights that typically deliver 20-40% energy savings and 15-25% yield improvements',
    benefits: [
      'Predictive analytics',
      'Automated compliance',
      'ROI in <6 months'
    ]
  },
  business: {
    headline: 'Enterprise Excellence', 
    subheadline: 'Manage multiple facilities with enterprise-grade tools and dedicated support',
    benefits: [
      'Centralized control',
      'Custom workflows',
      'Priority implementation'
    ]
  }
};

export default function UnifiedPricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showCalculator, setShowCalculator] = useState(false);

  const handleSelectPlan = (tierId: string) => {
    if (tierId === 'free') {
      router.push('/sign-up');
    } else if (tierId === 'business') {
      router.push('/contact-sales');
    } else {
      router.push(`/sign-up?plan=${tierId}&billing=${billingPeriod}`);
    }
  };

  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-blue-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join 500+ growers saving millions on energy costs while improving yields. 
              No hardware required. Works with any lighting system.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-16 h-8 bg-gray-700 rounded-full transition-colors hover:bg-gray-600"
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-lg ${billingPeriod === 'annual' ? 'text-white' : 'text-gray-400'}`}>
                Annual
                <span className="text-green-400 text-sm ml-2">Save 20%</span>
              </span>
            </div>

            {/* ROI Calculator Button */}
            <button
              onClick={() => setShowCalculator(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Calculator className="w-5 h-5" />
              Calculate Your ROI
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const price = billingPeriod === 'monthly' ? tier.price.monthly : tier.price.annual;
            const isPopular = tier.highlighted;
            
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border transition-all duration-200 hover:shadow-2xl ${
                  isPopular 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-700'
                } bg-gray-800/50 backdrop-blur-sm`}
              >
                {/* Popular Badge */}
                {tier.popularBadge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {tier.popularBadge}
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-700/50 rounded-xl">
                      <Icon className={`w-6 h-6 text-${tier.color}-400`} />
                    </div>
                    {isPopular && (
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tier Info */}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tier.tagline}</p>
                  <p className="text-gray-300 text-sm mb-6">{tier.description}</p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-gray-400">
                        /{billingPeriod === 'monthly' ? 'month' : 'month'}
                      </span>
                    </div>
                    {billingPeriod === 'annual' && tier.price.monthly > 0 && (
                      <p className="text-sm text-gray-500 line-through">
                        ${tier.price.monthly}/month
                      </p>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400">Projects</p>
                      <p className="text-sm font-semibold text-white">{tier.metrics.projects}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Team Size</p>
                      <p className="text-sm font-semibold text-white">{tier.metrics.teamMembers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Data Storage</p>
                      <p className="text-sm font-semibold text-white">{tier.metrics.dataRetention}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Support</p>
                      <p className="text-sm font-semibold text-white">{tier.metrics.support}</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(tier.id)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      tier.cta.variant === 'primary'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                    }`}
                  >
                    {tier.cta.text}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Features */}
                  <div className="mt-8 space-y-3">
                    <p className="text-sm font-semibold text-gray-300 mb-3">Includes:</p>
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {tier.limitations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
                      {tier.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5">•</div>
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Value Props Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why VibeLux Delivers ROI
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our customers typically see payback in under 6 months through energy savings alone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">20-40% Energy Savings</h3>
              <p className="text-gray-400 text-sm">AI optimization reduces wasted electricity</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">15-25% Yield Increase</h3>
              <p className="text-gray-400 text-sm">Optimal light recipes improve plant health</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Prevent Crop Loss</h3>
              <p className="text-gray-400 text-sm">Predictive alerts catch issues early</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Insights</h3>
              <p className="text-gray-400 text-sm">Continuous learning improves results</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Do I need special hardware?
            </h3>
            <p className="text-gray-400">
              No! VibeLux works with any lighting system. We analyze your existing setup and optimize it.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              How quickly will I see ROI?
            </h3>
            <p className="text-gray-400">
              Most customers see payback in 3-6 months through energy savings. Yield improvements are additional upside.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Can I change plans anytime?
            </h3>
            <p className="text-gray-400">
              Yes! Upgrade or downgrade anytime. Changes take effect on your next billing cycle.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Is there a setup fee?
            </h3>
            <p className="text-gray-400">
              No setup fees! Start with a free trial and only pay when you're getting value.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Grow?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 500+ commercial growers already saving with VibeLux
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/sign-up')}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => setShowCalculator(true)}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Calculate Savings
            </button>
          </div>
        </div>
      </div>

      {/* ROI Calculator Modal */}
      {showCalculator && (
        <ROICalculator onClose={() => setShowCalculator(false)} />
      )}
    </div>
    <Footer />
    </>
  );
}

// ROI Calculator Component
function ROICalculator({ onClose }: { onClose: () => void }) {
  const [facilitySize, setFacilitySize] = useState(10000);
  const [lightingWatts, setLightingWatts] = useState(600);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [electricityRate, setElectricityRate] = useState(0.12);
  const [currentYield, setCurrentYield] = useState(50);

  // Calculate savings
  const totalLights = Math.floor(facilitySize / 50); // Assume 50 sq ft per light
  const dailyKwh = (totalLights * lightingWatts * hoursPerDay) / 1000;
  const monthlyCost = dailyKwh * 30 * electricityRate;
  const annualCost = monthlyCost * 12;
  
  // Estimated savings
  const energySavingsPercent = 0.25; // 25% average
  const yieldIncreasePercent = 0.20; // 20% average
  
  const energySavingsAnnual = annualCost * energySavingsPercent;
  const yieldIncreaseValue = (currentYield * facilitySize / 1000) * yieldIncreasePercent * 3000; // $3000/lb
  const totalAnnualSavings = energySavingsAnnual + yieldIncreaseValue;
  
  // ROI calculation
  const proPrice = 99 * 12; // Annual Pro plan
  const paybackMonths = proPrice / (totalAnnualSavings / 12);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">ROI Calculator</h2>
              <p className="text-gray-400">See how much you can save with VibeLux</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Facility Size (sq ft)
              </label>
              <input
                type="number"
                value={facilitySize}
                onChange={(e) => setFacilitySize(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Watts per Light
              </label>
              <input
                type="number"
                value={lightingWatts}
                onChange={(e) => setLightingWatts(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hours per Day
              </label>
              <input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={electricityRate}
                onChange={(e) => setElectricityRate(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Yield (g/sq ft)
              </label>
              <input
                type="number"
                value={currentYield}
                onChange={(e) => setCurrentYield(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Estimated Savings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-gray-400">Energy Savings</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${energySavingsAnnual.toLocaleString()}/year
                </p>
                <p className="text-sm text-green-400">25% reduction</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-gray-400">Yield Increase Value</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${yieldIncreaseValue.toLocaleString()}/year
                </p>
                <p className="text-sm text-green-400">20% improvement</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-gray-400">Total Annual Value</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${totalAnnualSavings.toLocaleString()}/year
                </p>
                <p className="text-sm text-green-400">Combined benefit</p>
              </div>
            </div>

            {/* Payback */}
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 text-center">
              <p className="text-sm text-green-400 mb-1">Payback Period with Pro Plan</p>
              <p className="text-3xl font-bold text-green-400">
                {paybackMonths.toFixed(1)} months
              </p>
              <p className="text-sm text-gray-300 mt-2">
                ROI: {((totalAnnualSavings / proPrice - 1) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/sign-up?plan=pro'}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start Saving Now
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Close Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}