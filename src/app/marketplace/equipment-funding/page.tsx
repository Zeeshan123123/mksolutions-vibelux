'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { 
  Zap, TrendingUp, Shield, Users, ArrowRight, Check, Package,
  DollarSign, BarChart3, Leaf, Building, Clock, Award,
  Calculator, FileText, MessageSquare, Eye, Globe, Sparkles
} from 'lucide-react';

export default function EquipmentFundingMarketplace() {
  const { isSignedIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'grower' | 'investor' | null>(null);

  const growerBenefits = [
    {
      icon: DollarSign,
      title: "Zero Upfront Cost",
      description: "Get equipment installed with no capital expenditure"
    },
    {
      icon: TrendingUp,
      title: "Pay from Revenue",
      description: "Share a percentage of increased revenue, not fixed payments"
    },
    {
      icon: Shield,
      title: "No Personal Guarantees",
      description: "Equipment-backed financing without risking personal assets"
    },
    {
      icon: Clock,
      title: "Fast Approval",
      description: "Get matched with investors in 24-48 hours"
    }
  ];

  const investorBenefits = [
    {
      icon: Leaf,
      title: "Cannabis Exposure",
      description: "Invest in the industry without touching the plant"
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Real-time ROI data from VibeLux monitoring"
    },
    {
      icon: Shield,
      title: "Asset-Backed",
      description: "Equipment ownership provides downside protection"
    },
    {
      icon: Award,
      title: "Verified Growers",
      description: "All facilities are pre-screened and monitored"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Post Your Need",
      grower: "List equipment needs and proposed revenue share",
      investor: "Browse verified equipment requests"
    },
    {
      step: 2,
      title: "Get Matched",
      grower: "Review investor offers and terms",
      investor: "Make offers on promising opportunities"
    },
    {
      step: 3,
      title: "Execute Agreement",
      grower: "Sign revenue share agreement via DocuSign",
      investor: "Fund equipment purchase directly"
    },
    {
      step: 4,
      title: "Track Performance",
      grower: "Equipment installed, start growing",
      investor: "Monitor ROI through VibeLux dashboard"
    }
  ];

  const successStories = [
    {
      grower: "Green Valley Farms",
      equipment: "LED Lighting Upgrade",
      value: "$125,000",
      revShare: "15%",
      result: "32% yield increase, paid back in 14 months"
    },
    {
      grower: "Urban Leaf Co",
      equipment: "HVAC System",
      value: "$85,000",
      revShare: "12%",
      result: "28% energy savings, 18-month payback"
    },
    {
      grower: "Mountain High Gardens",
      equipment: "Automation Package",
      value: "$200,000",
      revShare: "18%",
      result: "45% labor reduction, 16-month payback"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-950 to-purple-900/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Equipment Funding Marketplace</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Equipment Financing That
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
                {" "}Shares Your Success
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect growers needing equipment with investors seeking cannabis industry returns. 
              Pay from increased revenue, not fixed payments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button
                onClick={() => setSelectedRole('grower')}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  selectedRole === 'grower'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Leaf className="w-5 h-5 inline mr-2" />
                I'm a Grower
              </button>
              <button
                onClick={() => setSelectedRole('investor')}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  selectedRole === 'investor'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <DollarSign className="w-5 h-5 inline mr-2" />
                I'm an Investor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">$2.8M</div>
              <div className="text-gray-400 mt-1">Equipment Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">126</div>
              <div className="text-gray-400 mt-1">Deals Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">15.2%</div>
              <div className="text-gray-400 mt-1">Avg. Investor Return</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">14mo</div>
              <div className="text-gray-400 mt-1">Avg. Payback Period</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {selectedRole && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">
                Benefits for {selectedRole === 'grower' ? 'Growers' : 'Investors'}
              </h2>
              <p className="text-xl text-gray-400">
                {selectedRole === 'grower' 
                  ? 'Get the equipment you need without diluting equity or taking on debt'
                  : 'Access cannabis industry returns without operational complexity'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(selectedRole === 'grower' ? growerBenefits : investorBenefits).map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      selectedRole === 'grower' ? 'bg-green-500/20' : 'bg-purple-500/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        selectedRole === 'grower' ? 'text-green-400' : 'text-purple-400'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">
              Simple 4-step process from request to revenue
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  {selectedRole && (
                    <p className="text-gray-400">
                      {selectedRole === 'grower' ? step.grower : step.investor}
                    </p>
                  )}
                </div>
                {step.step < 4 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Success Stories</h2>
            <p className="text-xl text-gray-400">
              Real results from our equipment funding marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{story.grower}</h3>
                    <p className="text-gray-400">{story.equipment}</p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Investment:</span>
                    <span className="text-white font-medium">{story.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revenue Share:</span>
                    <span className="text-white font-medium">{story.revShare}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-green-400 font-medium">{story.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to {selectedRole === 'grower' ? 'Get Funded' : 'Start Investing'}?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {selectedRole === 'grower' 
              ? 'Post your equipment needs and get matched with investors today'
              : 'Browse active opportunities and start earning returns'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <>
                <Link
                  href={selectedRole === 'grower' ? '/equipment-board/create' : '/equipment-board'}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  {selectedRole === 'grower' ? 'Post Equipment Need' : 'Browse Opportunities'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/equipment-board"
                  className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all"
                >
                  View Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/sign-in"
                  className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Bank-Level Security</p>
            </div>
            <div className="text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Legal Templates Included</p>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Performance Monitoring</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Verified Community</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}