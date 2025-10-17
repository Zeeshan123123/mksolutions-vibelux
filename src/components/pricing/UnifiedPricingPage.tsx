'use client';

import { useState } from 'react';
import { 
  Check, X, Sparkles, Zap, Calculator, Building,
  TrendingDown, ChevronRight, Info, Star, CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { EnergySavingsCalculator } from '@/components/pricing/EnergySavingsCalculator';
// ValueComparison was removed; guard import to prevent build error
const ValueComparison = () => null;
import { 
  SUBSCRIPTION_TIERS, 
  MODULES, 
  BUNDLES, 
  CREDIT_PACKAGES,
  ENERGY_SAVINGS_PROGRAM 
} from '@/lib/pricing/unified-pricing';
import { getEnhancedModuleInfo } from '@/lib/pricing/module-details';

type ViewMode = 'energy' | 'subscription' | 'alacarte' | 'credits';

export function UnifiedPricingPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('energy');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateModuleTotal = () => {
    return selectedModules.reduce((total, moduleId) => {
      return total + (MODULES[moduleId]?.price || 0);
    }, 0);
  };

  const getBundleDiscount = () => {
    const matchingBundle = BUNDLES.find(bundle => 
      bundle.modules.length === selectedModules.length &&
      bundle.modules.every(m => selectedModules.includes(m))
    );
    return matchingBundle?.savings || 0;
  };

  const handleCheckout = async (priceId: string, planId: string) => {
    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModuleCheckout = async () => {
    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }

    if (selectedModules.length === 0) {
      alert('Please select at least one module');
      return;
    }

    // For now, we'll create a custom checkout session for modules
    // In production, you'd want to handle this differently
    alert('Module checkout coming soon! Selected modules: ' + selectedModules.join(', '));
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      {/* Value Comparison - Show why we're better */}
      <ValueComparison />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trial Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CreditCard className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">14-Day Free Trial on All Paid Plans</h2>
          </div>
          <p className="text-white/90 text-lg">
            Try any plan risk-free for 14 days • Credit card required • Cancel anytime before trial ends
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            1000+ Features • Core in every paid plan • Advanced add-ons available
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            The Industry's Most Complete Platform
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
            Get <span className="text-white font-semibold">1000+ features</span> starting at just $29/month.
            The most comprehensive CEA platform available - all included, no hidden costs.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-400" />
              25+ Calculators
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-400" />
              1,000+ Components
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-400" />
              400+ API Endpoints
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-400" />
              AI Included
            </span>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setViewMode('energy')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'energy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <TrendingDown className="w-5 h-5 inline mr-2" />
            Energy Savings (Free)
          </button>
          <button
            onClick={() => setViewMode('subscription')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'subscription'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Subscription Plans
          </button>
          <button
            onClick={() => setViewMode('alacarte')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'alacarte'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Calculator className="w-5 h-5 inline mr-2" />
            A La Carte
          </button>
          <button
            onClick={() => setViewMode('credits')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'credits'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            Buy Credits
          </button>
        </div>

        {/* Energy Savings View */}
        {viewMode === 'energy' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700 rounded-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Energy Savings Program - 100% Free
                  </h2>
                  <p className="text-gray-300">
                    Make money while reducing energy costs. We only profit when you save.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-semibold text-white mb-3">What's Included:</h3>
                  <ul className="space-y-2">
                    {ENERGY_SAVINGS_PROGRAM.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">How You Earn:</h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Typical Energy Savings:</span>
                      <span className="text-white font-semibold">15-35%*</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your Share:</span>
                      <span className="text-green-400 font-semibold">75%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">VibeLux Share:</span>
                      <span className="text-white">25%</span>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        Example: Save $10,000/month → You keep $7,500
                        <div className="text-xs text-gray-500 mt-1">
                          *Results vary by facility size, equipment age, and usage patterns
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Saving?</h3>
              <p className="text-gray-400 mb-6">Start your energy optimization journey</p>
              <button 
                onClick={() => {
                  if (!isSignedIn) {
                    router.push('/sign-up');
                  } else {
                    router.push('/energy-setup');
                  }
                }}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? 'Processing...' : "Get Started - It's Free"}
              </button>
            </div>

            <EnergySavingsCalculator />
          </div>
        )}

        {/* Subscription Plans View */}
        {viewMode === 'subscription' && (
          <div>
            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800 rounded-lg p-1 flex">
                <button
                  onClick={() => setBillingInterval('month')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    billingInterval === 'month'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('year')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    billingInterval === 'year'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            {/* Subscription Plans */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Subscription Plans</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.values(SUBSCRIPTION_TIERS).map((tier) => {
                  const yearlyPrice = tier.price * 12 * 0.8; // 20% discount
                  const displayPrice = billingInterval === 'year' ? yearlyPrice / 12 : tier.price;
                  
                  return (
                    <div
                      key={tier.id}
                      className={`bg-gray-900 rounded-xl p-6 border ${
                        tier.id === 'teams' 
                          ? 'border-purple-600 relative' 
                          : 'border-gray-800'
                      }`}
                    >
                      {tier.id === 'teams' && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">
                            ${Math.round(displayPrice)}
                          </span>
                          <span className="text-gray-400">/{billingInterval}</span>
                        </div>
                        {tier.id !== 'free' && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded text-green-400 text-xs">
                            <Check className="w-3 h-3" />
                            14-day free trial
                          </div>
                        )}
                        <p className="text-gray-400 text-sm mt-2">{tier.description}</p>
                        {tier.userPricing && (
                          <div className="mt-3 text-xs text-gray-500">
                            <div>{tier.userPricing.baseUsers} users included</div>
                            {tier.userPricing.additionalUserPrice > 0 && (
                              <div>+${tier.userPricing.additionalUserPrice}/user/mo</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <div className="text-sm text-gray-400 mb-2">Credits Included:</div>
                        <div className="bg-gray-800 rounded-lg p-3 text-sm">
                          <div className="flex justify-between mb-1">
                            <span>AI Designer:</span>
                            <span className="text-white">{tier.credits.aiDesigner}/mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span>API Calls:</span>
                            <span className="text-white">{tier.credits.apiCalls}/mo</span>
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {tier.features.slice(0, 6).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button 
                        onClick={() => {
                          if (tier.id === 'free') {
                            if (!isSignedIn) {
                              router.push('/sign-up');
                            } else {
                              router.push('/dashboard');
                            }
                          } else {
                            // Map tier IDs to Stripe price IDs (monthly/annual)
                            const priceIdMap: Record<string, string | undefined> = {
                              'design-solo': billingInterval === 'year'
                                ? process.env.NEXT_PUBLIC_STRIPE_DESIGN_SOLO_ANNUAL_PRICE_ID
                                : process.env.NEXT_PUBLIC_STRIPE_DESIGN_SOLO_MONTHLY_PRICE_ID,
                              'starter': billingInterval === 'year'
                                ? process.env.NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID
                                : process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID,
                              'teams': billingInterval === 'year'
                                ? process.env.NEXT_PUBLIC_STRIPE_TEAMS_ANNUAL_PRICE_ID
                                : process.env.NEXT_PUBLIC_STRIPE_TEAMS_MONTHLY_PRICE_ID,
                              'professional': billingInterval === 'year'
                                ? process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID
                                : process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
                              'enterprise': billingInterval === 'year'
                                ? process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID
                                : process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
                            };
                            const priceId = priceIdMap[tier.id];
                            if (priceId) {
                              handleCheckout(priceId, tier.id);
                            } else {
                              alert('This plan is not available yet');
                            }
                          }
                        }}
                        disabled={isProcessing}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                          tier.id === 'free'
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        } ${
                          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                                                      {isProcessing ? 'Processing...' : (tier.id === 'free' ? 'Get Started' : 'Start 14-Day Trial')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Integrated Suites */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Integrated Suites</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.values(MODULES).filter(module => module.category === 'suite').map((suite) => {
                  return (
                    <div
                      key={suite.id}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-600/50 transition-all"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-2">{suite.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-white">
                            ${suite.price}
                          </span>
                          <span className="text-gray-400">/month</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">{suite.description}</p>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {suite.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                            <Check className="w-3 h-3 text-green-400 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {suite.features.length > 5 && (
                          <li className="text-xs text-gray-400 italic">
                            +{suite.features.length - 5} more features
                          </li>
                        )}
                      </ul>

                      <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                        Add to Plan
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Modules */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Individual Modules</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.values(MODULES).filter(module => module.category !== 'suite').map((module) => {
                  return (
                    <div
                      key={module.id}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-blue-600/50 transition-all"
                    >
                      <div className="mb-3">
                        <h4 className="font-semibold text-white">{module.name}</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-white">${module.price}</span>
                          <span className="text-xs text-gray-400">/mo</span>
                        </div>
                      </div>

                      <ul className="space-y-1 mb-4">
                        {module.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-400">
                            • {feature}
                          </li>
                        ))}
                      </ul>

                      <button className="w-full py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tier Comparison Matrix */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Compare Plans & Features</h3>
              <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900/50">
                      <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                      <th className="p-4 text-white">Free</th>
                      <th className="p-4 text-white">Solo</th>
                      <th className="p-4 text-white">Starter</th>
                      <th className="p-4 text-white">Teams</th>
                      <th className="p-4 text-white">Pro</th>
                      <th className="p-4 text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'AI Designer Credits', values: ['5/mo', '50/mo', '100/mo', '300/mo', '1000/mo', '3000+/mo'] },
                      { name: 'Users Included', values: ['1', '1', '3', '10', '10', '25+'] },
                      { name: 'Facilities', values: ['1', '1', '1', '2', '5', 'Unlimited'] },
                      { name: 'Projects', values: ['1', '2', '10', '25', '50', 'Unlimited'] },
                      { name: 'Data Retention', values: ['7 days', '30 days', '30 days', '90 days', '6 months', 'Unlimited'] },
                      { name: 'All Calculators (25+)', values: [false, true, true, true, true, true] },
                      { name: 'Advanced Designer', values: [false, 'Core', 'Full', 'Full', 'Full', 'Full'] },
                      { name: 'API Access', values: [false, false, false, false, true, true] },
                      { name: 'Automation Builder', values: [false, false, false, 'Lite', 'Unlimited', 'Unlimited'] },
                      { name: 'Marketplace Seller Tools', values: [false, false, false, true, true, true] },
                      { name: 'Analytics Pro', values: [false, false, false, true, true, true] },
                      { name: 'Sensor Hub (BMS)', values: [false, false, false, false, true, true] },
                      { name: 'MEP Exports (PDF/DXF/Excel)', values: [false, false, false, false, true, true] },
                      { name: 'Project Management Suite', values: [false, false, true, true, true, true] },
                      { name: 'Entitlements (Buyer Access)', values: [false, false, true, true, true, true] },
                      { name: 'Security & Compliance (Audit/Webhooks)', values: [false, false, false, true, true, true] },
                      { name: 'File Storage & Exports', values: ['Basic', 'Basic', 'Basic', 'Standard', 'Advanced', 'Advanced'] },
                      { name: 'Regression Analytics', values: [false, false, false, true, true, true] },
                      { name: 'Plant Health AI (Beta)', values: [false, false, '$19/mo add-on', '$19/mo add-on', 'Included', 'Included'] },
                      { name: 'Priority Support', values: [false, false, false, 'Chat', 'Priority', 'Dedicated AM + SLA'] },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-800">
                        <td className="p-4 text-gray-300">{row.name}</td>
                        {row.values.map((val, i) => (
                          <td key={i} className="p-4 text-center">
                            {typeof val === 'boolean' ? (
                              val ? <Check className="w-4 h-4 text-green-400 inline" /> : <X className="w-4 h-4 text-gray-600 inline" />
                            ) : (
                              <span className="text-gray-200">{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* A La Carte View */}
        {viewMode === 'alacarte' && (
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Build Your Own Plan</h2>
              <p className="text-gray-400 mb-6">
                Select only the modules you need. Get bundle discounts when you combine modules.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(MODULES).map((module) => {
                  const isSelected = selectedModules.includes(module.id);
                  const moduleDetails = getEnhancedModuleInfo(module.id);
                  
                  return (
                    <div
                      key={module.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-900/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedModules(selectedModules.filter(id => id !== module.id));
                        } else {
                          setSelectedModules([...selectedModules, module.id]);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{module.name}</h3>
                          <div className="flex items-center gap-2 mt-1 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              module.category === 'essential' ? 'bg-blue-900/50 text-blue-400' :
                              module.category === 'professional' ? 'bg-purple-900/50 text-purple-400' :
                              module.category === 'enterprise' ? 'bg-orange-900/50 text-orange-400' :
                              'bg-gray-900/50 text-gray-400'
                            }`}>
                              {module.category}
                            </span>
                            {moduleDetails.requiredPlan && (
                              <span className="text-xs text-gray-500">
                                Requires {moduleDetails.requiredPlan}+
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{module.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">${module.price}</div>
                          <div className="text-xs text-gray-400">/month</div>
                        </div>
                      </div>

                      {/* Why this price */}
                      {moduleDetails.whyPriced && (
                        <div className="mb-3 p-2 bg-gray-800/50 rounded text-xs text-gray-300">
                          💡 {moduleDetails.whyPriced}
                        </div>
                      )}

                      {/* Competitor comparison */}
                      {moduleDetails.competitorPrice && (
                        <div className="mb-3 text-xs text-green-400">
                          vs. {moduleDetails.competitorPrice} elsewhere
                        </div>
                      )}

                      {/* Included in plans */}
                      {moduleDetails.includedInPlans && moduleDetails.includedInPlans.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">Included in: </span>
                          {moduleDetails.includedInPlans.map((plan, idx) => (
                            <span key={plan} className="text-xs text-purple-400">
                              {plan}{idx < moduleDetails.includedInPlans.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      <ul className="space-y-1 mb-3">
                        {module.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-400">
                            • {feature}
                          </li>
                        ))}
                        {module.features.length > 4 && (
                          <li className="text-xs text-purple-400">
                            + {module.features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      {/* Quick stats */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
                        {moduleDetails.roiEstimate && (
                          <div className="text-xs">
                            <span className="text-gray-500">ROI: </span>
                            <span className="text-green-400">{moduleDetails.roiEstimate}</span>
                          </div>
                        )}
                        {moduleDetails.setupTime && (
                          <div className="text-xs">
                            <span className="text-gray-500">Setup: </span>
                            <span className="text-blue-400">{moduleDetails.setupTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Summary */}
              {selectedModules.length > 0 && (
                <div className="mt-8 bg-gray-800 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4">Your Custom Plan</h3>
                  <div className="space-y-2 mb-4">
                    {selectedModules.map(moduleId => {
                      const module = MODULES[moduleId];
                      return (
                        <div key={moduleId} className="flex justify-between text-sm">
                          <span className="text-gray-400">{module.name}</span>
                          <span className="text-white">${module.price}/mo</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {getBundleDiscount() > 0 && (
                    <div className="flex justify-between text-sm text-green-400 mb-2">
                      <span>Bundle Discount</span>
                      <span>-${getBundleDiscount()}/mo</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-2xl font-bold text-white">
                        ${calculateModuleTotal() - getBundleDiscount()}/mo
                      </span>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Start with Custom Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credits View */}
        {viewMode === 'credits' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Credit Packages</h2>
              <p className="text-gray-400">
                Purchase credits for AI Designer, reports, and API usage
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {CREDIT_PACKAGES.map((pkg) => {
                const totalCredits = pkg.credits + (pkg.credits * pkg.bonus / 100);
                
                return (
                  <div
                    key={pkg.id}
                    className={`bg-gray-900 rounded-xl p-6 border ${
                      pkg.popular ? 'border-yellow-600' : 'border-gray-800'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="flex justify-center mb-4">
                        <span className="bg-yellow-600 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          Best Value
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-white">
                        {totalCredits.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">credits</div>
                      
                      {pkg.bonus > 0 && (
                        <div className="mt-2 text-green-400 text-sm">
                          +{pkg.bonus}% bonus credits
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-white">${pkg.price}</div>
                      <div className="text-sm text-gray-400">
                        ${(pkg.price / totalCredits).toFixed(3)} per credit
                      </div>
                    </div>

                    <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-2 px-4 rounded-lg transition-colors">
                      Buy Credits
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Credit Usage Guide</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">AI Designer</h4>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Simple design: 10 credits</li>
                    <li>• Complex design: 25 credits</li>
                    <li>• Full optimization: 50 credits</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Reports</h4>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Basic report: 5 credits</li>
                    <li>• Detailed report: 10 credits</li>
                    <li>• Custom report: 20 credits</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">API & Simulations</h4>
                  <ul className="space-y-1 text-gray-400">
                    <li>• API call: 1 credit</li>
                    <li>• Quick simulation: 5 credits</li>
                    <li>• Monte Carlo: 50 credits</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}