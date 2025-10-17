'use client';

import { useState } from 'react';
import { VendorOnboardingFlow } from '@/components/marketplace/VendorOnboardingFlow';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  Award,
  BarChart3,
  Package,
  Truck,
  Globe,
  ChevronRight,
  Star
} from 'lucide-react';

export default function VendorSignupPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  const handleOnboardingComplete = (vendorId: string) => {
    // Redirect to vendor dashboard after successful onboarding
    router.push(`/marketplace/vendor/dashboard?id=${vendorId}`);
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Vendor Application</h1>
            <p className="text-gray-400">Complete your application to start selling on VibeLux Marketplace</p>
          </div>
          
          <VendorOnboardingFlow 
            userId="demo-user" 
            onComplete={handleOnboardingComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 backdrop-blur-xl rounded-full mb-8 border border-purple-500/30">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Trusted B2B Marketplace
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent">
              Grow Your Business with VibeLux
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of verified vendors in the cannabis industry's premier B2B marketplace. 
              Connect with licensed buyers, streamline operations, and scale your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowOnboarding(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                <Building2 className="w-5 h-5" />
                Start Vendor Application
                <ChevronRight className="w-5 h-5" />
              </button>
              <a 
                href="#benefits"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">5,000+</div>
              <div className="text-gray-400">Active Buyers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">$2.5M+</div>
              <div className="text-gray-400">Monthly GMV</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">24hr</div>
              <div className="text-gray-400">Avg. Payment Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Sell on VibeLux?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Access the tools and network you need to grow your cannabis business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl p-8 hover:ring-2 hover:ring-purple-500 transition-all">
              <Users className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Verified Buyer Network</h3>
              <p className="text-gray-400">
                Connect with thousands of licensed dispensaries, processors, and cultivators. 
                All buyers are verified for compliance.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 hover:ring-2 hover:ring-purple-500 transition-all">
              <DollarSign className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Fast & Secure Payments</h3>
              <p className="text-gray-400">
                Get paid faster with our integrated payment system. ACH, wire transfers, 
                and crypto options available.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 hover:ring-2 hover:ring-purple-500 transition-all">
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Compliance Built-In</h3>
              <p className="text-gray-400">
                Stay compliant with automated license verification, Metrc integration, 
                and state-specific regulations.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 hover:ring-2 hover:ring-purple-500 transition-all">
              <BarChart3 className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
              <p className="text-gray-400">
                Track sales performance, inventory levels, and market trends with 
                real-time analytics dashboard.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 hover:ring-2 hover:ring-purple-500 transition-all">
              <Package className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Inventory Management</h3>
              <p className="text-gray-400">
                Sync inventory across multiple channels. Automated low-stock alerts 
                and reorder suggestions.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 hover:ring-2 hover:ring-purple-500 transition-all">
              <Truck className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Logistics Support</h3>
              <p className="text-gray-400">
                Integrated shipping solutions with licensed cannabis transporters. 
                Track shipments in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get started in minutes with our streamlined onboarding process
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Apply Online</h3>
              <p className="text-gray-400 text-sm">
                Complete our vendor application with business details and verification documents
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Verified</h3>
              <p className="text-gray-400 text-sm">
                Our team reviews your application and verifies licenses within 24-48 hours
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">List Products</h3>
              <p className="text-gray-400 text-sm">
                Upload your catalog, set pricing tiers, and configure shipping options
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Selling</h3>
              <p className="text-gray-400 text-sm">
                Receive orders, manage inventory, and grow your wholesale business
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              No setup fees. Pay only when you make sales.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-1">5%</div>
              <div className="text-gray-400 mb-6">transaction fee</div>
              <ul className="text-left space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Up to 50 SKUs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Basic analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Email support
                </li>
              </ul>
            </div>

            <div className="bg-purple-900/20 rounded-xl p-8 text-center ring-2 ring-purple-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-purple-600 text-xs rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Growth</h3>
              <div className="text-4xl font-bold mb-1">4%</div>
              <div className="text-gray-400 mb-6">transaction fee</div>
              <ul className="text-left space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Unlimited SKUs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  API access
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-1">3%</div>
              <div className="text-gray-400 mb-6">or custom pricing</div>
              <ul className="text-left space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Everything in Growth
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Volume discounts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the leading B2B marketplace for cannabis vendors
          </p>
          
          <button
            onClick={() => setShowOnboarding(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
          >
            <Building2 className="w-5 h-5" />
            Start Your Application
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              24-48hr approval
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Vendor Guide</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Compliance Center</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Sales</a></li>
                <li><a href="#" className="hover:text-white">Live Chat</a></li>
                <li><a href="#" className="hover:text-white">Status Page</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About VibeLux</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Partners</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Vendor Agreement</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 VibeLux. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}