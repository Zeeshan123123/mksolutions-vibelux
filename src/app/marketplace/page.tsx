'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Package, Sparkles, Wrench, Search, TrendingUp, 
  Shield, Star, ChevronRight, BarChart3, DollarSign,
  Leaf, BookOpen, ShoppingCart, Users, Award, Zap,
  Rocket, Clock, Lock
} from 'lucide-react';
import Link from 'next/link';

const marketplaceTypes = [
  {
    id: 'recipes',
    title: 'Recipe Marketplace',
    description: 'License proven growth recipes and cultivation protocols',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    status: 'Launching Soon',
    statusColor: 'text-purple-400',
    features: [
      'Light schedules & spectrums',
      'Nutrient regimens',
      'Environmental controls',
      'Training techniques',
      'Verified results',
      'Royalty payments'
    ],
    benefits: [
      'Monetize your proven protocols',
      'Earn passive royalty income',
      'Protect your IP with licensing',
      'Help other growers succeed'
    ],
    href: '/marketplace/recipes',
    cta: 'Explore Recipes',
    earlyAccess: true
  },
  {
    id: 'produce',
    title: 'Produce Marketplace',
    description: 'Buy and sell fresh produce directly with other growers',
    icon: Leaf,
    color: 'from-green-500 to-emerald-500',
    status: 'Beta Available',
    statusColor: 'text-green-400',
    features: [
      'Fresh produce listings',
      'Direct grower-to-buyer',
      'Quality certifications',
      'Logistics coordination',
      'Secure payments',
      'Buyer protection'
    ],
    benefits: [
      'Access new buyers instantly',
      'Better prices than distributors',
      'Direct relationships',
      'Transparent transactions'
    ],
    href: '/marketplace/produce',
    cta: 'Start Selling',
    earlyAccess: true
  },
  {
    id: 'equipment',
    title: 'Equipment Marketplace',
    description: 'Buy and sell growing equipment through our partner',
    icon: Wrench,
    color: 'from-blue-500 to-indigo-500',
    status: 'Partner Integration',
    statusColor: 'text-blue-400',
    features: [
      'Professional auction platform',
      'Verified equipment listings',
      'Secure transactions',
      'Shipping coordination',
      'Expert valuations',
      'Inspection services'
    ],
    benefits: [
      'Trusted auction house',
      'Wide selection of equipment',
      'Professional handling',
      'Buyer protection'
    ],
    href: 'https://www.secondbloomauctions.com',
    cta: 'Visit Second Bloom',
    earlyAccess: true,
    isExternal: true,
    partnerName: 'Second Bloom Auctions'
  }
];

const upcomingFeatures = [
  {
    title: 'Smart Matching',
    description: 'AI matches recipes to your facility type and goals',
    icon: Zap,
    timeline: 'Q1 2025'
  },
  {
    title: 'Performance Guarantee',
    description: 'Money-back if recipes don\'t meet claimed results',
    icon: Shield,
    timeline: 'Q2 2025'
  },
  {
    title: 'Global Shipping',
    description: 'International produce and equipment trading',
    icon: Package,
    timeline: 'Q2 2025'
  },
  {
    title: 'Mobile App',
    description: 'Manage listings and sales on the go',
    icon: ShoppingCart,
    timeline: 'Q3 2025'
  }
];

export default function MarketplaceHub() {
  const { user } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would save to database
    setJoinedWaitlist(true);
    setTimeout(() => setJoinedWaitlist(false), 5000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/50 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              <span>New: Marketplace Platform Launching</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              VibeLux Marketplace
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              The first comprehensive marketplace for controlled environment agriculture. 
              License growth recipes, trade produce, and buy/sell equipment - all in one platform.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              {user ? (
                <>
                  <Link 
                    href="/marketplace/recipes/create"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Be a Founding Recipe Creator
                  </Link>
                  <Link 
                    href="/marketplace/produce/list"
                    className="px-8 py-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all inline-flex items-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    List Your Produce (Beta)
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => router.push('/sign-in')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Sign In to Get Early Access
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              🎉 Be among the first 100 sellers and get lifetime reduced fees
            </p>
          </div>
        </div>
      </section>

      {/* Marketplace Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Three Marketplaces, One Platform
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to monetize your growing expertise and assets
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {marketplaceTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div 
                  key={type.id}
                  className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all relative"
                >
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 bg-gray-900 rounded-full text-xs font-medium ${type.statusColor}`}>
                      {type.status}
                    </span>
                  </div>
                  
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${type.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {type.title}
                    {type.partnerName && (
                      <span className="block text-sm font-normal text-blue-400 mt-1">
                        Powered by {type.partnerName}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-400 mb-6">{type.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {type.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                          <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3">Why Join:</h4>
                    <ul className="space-y-1">
                      {type.benefits.slice(0, 2).map((benefit) => (
                        <li key={benefit} className="text-xs text-gray-500">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {type.isExternal ? (
                    <a 
                      href={type.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 ${
                        type.earlyAccess 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {type.cta}
                      {type.earlyAccess && <ChevronRight className="w-5 h-5" />}
                    </a>
                  ) : (
                    <Link 
                      href={type.href}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 ${
                        type.earlyAccess 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {type.cta}
                      {type.earlyAccess && <ChevronRight className="w-5 h-5" />}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Early Adopter Benefits */}
      <section className="py-20 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/50 border border-yellow-500/30 rounded-full text-yellow-300 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>Limited Time: Founding Member Benefits</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Be a Founding Member
            </h2>
            <p className="text-gray-400 text-lg">
              Join now and lock in exclusive benefits forever
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Recipe Creators</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>90% royalty rate (vs 70% standard)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Featured placement for 6 months</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Free verification badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Priority support forever</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Produce Sellers</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>2% transaction fee (vs 5% standard)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Free premium listing upgrades</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Direct buyer connections</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Logistics support included</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Equipment Buyers</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Exclusive access via Second Bloom</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Professional auction platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Verified equipment condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Secure transactions & shipping</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-yellow-400 font-medium">
              ⏰ Only for the first 100 members in each category
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Announcement */}
      <section className="py-20 bg-blue-900/20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/50 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-6">
              <Wrench className="w-4 h-4" />
              <span>Equipment Partnership</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Equipment Trading via Second Bloom Auctions
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              For equipment needs, we've partnered with Second Bloom Auctions - 
              the trusted name in horticultural equipment auctions.
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Why Second Bloom?</h3>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Established auction house specializing in grow equipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Professional inspection and valuation services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Secure payment and shipping coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Wide network of verified buyers and sellers</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
                <ol className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Click "Visit Second Bloom" from our marketplace</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Browse their extensive equipment catalog</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Bid on auctions or buy directly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>Mention VibeLux for special consideration</span>
                  </li>
                </ol>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <a 
                href="https://www.secondbloomauctions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Visit Second Bloom Auctions
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How Recipe Licensing Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              How Recipe Licensing Works
            </h2>
            <p className="text-gray-400 text-lg">
              Turn your proven growing methods into passive income
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-purple-900/50 mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Document Your Recipe</h3>
              <p className="text-gray-400 text-sm">
                Upload your light schedules, environmental settings, and proven results
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-purple-900/50 mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Set Your Terms</h3>
              <p className="text-gray-400 text-sm">
                Choose pricing model: one-time, subscription, or usage-based royalties
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-purple-900/50 mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Verified</h3>
              <p className="text-gray-400 text-sm">
                Our team verifies your results to build trust with buyers
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-purple-900/50 mb-4">
                <span className="text-2xl font-bold text-purple-400">4</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn Royalties</h3>
              <p className="text-gray-400 text-sm">
                Get paid automatically every time someone licenses your recipe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-400 text-lg">
              Exciting features in development
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <Icon className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                  <span className="text-xs text-gray-500">{feature.timeline}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the Future of CEA Commerce
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Be among the first to access the marketplace when it fully launches. 
            Get early access, founding member benefits, and shape the platform.
          </p>
          
          {!joinedWaitlist ? (
            <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Join Waitlist
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                No spam, just important marketplace updates. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
              <p className="text-green-400 font-medium">
                ✓ You\'re on the list! We\'ll notify you when the marketplace fully launches.
              </p>
            </div>
          )}
          
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link 
              href="/marketplace/recipes"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Explore Recipe Marketplace (Beta)
            </Link>
            <Link 
              href="/marketplace/produce"
              className="px-8 py-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all inline-flex items-center gap-2"
            >
              <Leaf className="w-5 h-5" />
              Browse Produce Marketplace (Beta)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}