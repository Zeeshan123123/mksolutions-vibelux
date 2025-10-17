'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  PlayCircle, BookOpen, Calculator, Brain, FileText, 
  Users, CreditCard, CheckCircle, ArrowRight, Info,
  Zap, TrendingUp, Clock, DollarSign, Shield, Gift
} from 'lucide-react'

// Complete pricing summary
export const PRICING_SUMMARY = {
  free: {
    name: 'Limited Free Access',
    price: '$0/month',
    description: 'Basic calculators only - no design tools',
    highlights: [
      'Basic PPFD/DLI calculator only',
      'View-only demo mode',
      'No project saving',
      'No AI features',
      'Community forum access'
    ]
  },
  energySavings: {
    name: 'Energy Savings Program',
    price: '$0 upfront',
    description: 'Make money while saving energy',
    highlights: [
      '100% free to start',
      'You keep 75% of energy savings',
      'We only profit when you save',
      'Automated optimization',
      'Monthly performance reports'
    ]
  },
  designSolo: {
    name: 'Design Solo',
    price: '$29/month',
    description: 'For individual designers',
    highlights: [
      'Advanced lighting designer',
      '25+ calculators',
      '50 AI designs/month',
      '3 PDF exports/month',
      'Email support'
    ]
  },
  starter: {
    name: 'Starter',
    price: '$49/month',
    description: 'Perfect for small operations',
    highlights: [
      'Full lighting designer',
      'All calculators',
      '100 AI designs/month',
      'Up to 3 users',
      'Mobile app access'
    ]
  },
  teams: {
    name: 'Teams',
    price: '$99/month',
    description: 'For small teams',
    highlights: [
      'Everything in Starter',
      '2 facilities, 10 users',
      'Project templates',
      'Panel schedule generator',
      'Chat support'
    ]
  },
  professional: {
    name: 'Professional',
    price: '$199/month',
    description: 'For growing operations',
    highlights: [
      'Full BMS controls',
      'Advanced automation',
      '1000 AI credits/month',
      'API access',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$499/month',
    description: 'For multi-site operations',
    highlights: [
      'Unlimited facilities',
      'White-label options',
      'Dedicated account manager',
      'Custom development',
      'SLA guarantee'
    ]
  }
}

export function NewUserGuide() {
  const [activeTab, setActiveTab] = useState<'how-it-works' | 'pricing' | 'free-features'>('how-it-works')

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Know Before Starting
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Start your 14-day free trial. Credit card required for full access.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'how-it-works'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <PlayCircle className="w-5 h-5 inline mr-2" />
            How It Works
          </button>
          <button
            onClick={() => setActiveTab('free-features')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'free-features'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Gift className="w-5 h-5 inline mr-2" />
            Free Features
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pricing'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            All Pricing Options
          </button>
        </div>

        {/* How It Works Tab */}
        {activeTab === 'how-it-works' && (
          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Getting Started is Simple
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Start Free Trial</h4>
                      <p className="text-gray-400 text-sm">Credit card required. Cancel anytime within 14 days.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Try Everything</h4>
                      <p className="text-gray-400 text-sm">Access lighting designer, calculators, and AI tools immediately.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Design Your First Layout</h4>
                      <p className="text-gray-400 text-sm">Use AI or manual tools to create professional lighting designs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Export or Upgrade</h4>
                      <p className="text-gray-400 text-sm">Download your designs or upgrade for advanced features.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
                <h3 className="text-2xl font-bold text-white mb-6">
                  What You Can Do Immediately
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Design lighting layouts with 2,400+ DLC fixtures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Calculate PPFD, DLI, and uniformity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Use AI to optimize your designs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Access 25+ professional calculators</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Save designs to the cloud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Export to PDF (limited on free plan)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Import CAD files (DWG, DXF, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Join the Energy Savings Program</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-8 rounded-xl border border-purple-800/50">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-300 mb-6">
                  Start your 14-day free trial with full access to all features
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link 
                    href="/demo"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all inline-flex items-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Interactive Demo
                  </Link>
                  <Link 
                    href="/calculators"
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all inline-flex items-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Try Calculators
                  </Link>
                  <Link 
                    href="/docs/getting-started"
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all inline-flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Documentation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Free Features Tab */}
        {activeTab === 'free-features' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 p-8 rounded-xl border border-green-700">
                <Zap className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Energy Savings Program (100% Free)
                </h3>
                <p className="text-gray-300 mb-4">
                  No upfront costs. We only make money when you save energy.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automated energy optimization
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    You keep 75% of savings
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Monthly performance reports
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Smart scheduling optimization
                  </li>
                </ul>
                <Link 
                  href="/energy"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 p-8 rounded-xl border border-purple-700">
                <Gift className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  14-Day Free Trial
                </h3>
                <p className="text-gray-300 mb-4">
                  Full access to all features. Credit card required.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Full lighting designer access
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    All 25+ calculators
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    AI design features
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Cancel anytime
                  </li>
                </ul>
                <Link 
                  href="/sign-up"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                Free Access (No Credit Card)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-purple-400 mb-3">Limited Tools</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Basic PPFD calculator</li>
                    <li>• Simple DLI calculator</li>
                    <li>• View-only demos</li>
                    <li>• No saving features</li>
                    <li>• No AI access</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-3">Resources</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Documentation</li>
                    <li>• Video tutorials</li>
                    <li>• Community forum</li>
                    <li>• Knowledge base</li>
                    <li>• Blog articles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-3">To Unlock Full Access</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Start 14-day trial</li>
                    <li>• Credit card required</li>
                    <li>• Cancel anytime</li>
                    <li>• Choose plan after trial</li>
                    <li>• Full feature access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(PRICING_SUMMARY).map(([key, tier]) => (
                <div 
                  key={key}
                  className={`bg-gray-900 p-6 rounded-xl border ${
                    key === 'starter' ? 'border-purple-500' : 'border-gray-800'
                  } relative`}
                >
                  {key === 'starter' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-2xl font-bold text-white mb-2">{tier.price}</div>
                  <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                  <ul className="space-y-2 mb-6">
                    {tier.highlights.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/pricing"
                    className="block text-center py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
                  >
                    Learn More
                  </Link>
                </div>
              ))}
            </div>

            <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-800">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-2">Additional Options Available</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    We also offer A La Carte modules, credit packages, and custom enterprise solutions.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                    <li>• Electrical Estimator ($29/mo)</li>
                    <li>• Plant Health AI ($49/mo)</li>
                    <li>• Advanced Analytics ($39/mo)</li>
                    <li>• Compliance Suite ($59/mo)</li>
                    <li>• API Access ($99/mo)</li>
                    <li>• White Label (Custom)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                View Complete Pricing Details
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}