"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Zap, Database, Calculator, CheckCircle, Users, Shield, Clock, Star, TrendingUp, Building2, Lightbulb, DollarSign, BarChart3, Leaf, Brain } from 'lucide-react'
import { ConsolidatedMarketing } from '@/components/marketing/ConsolidatedMarketing'
import { Footer } from '@/components/Footer'
import { SimplifiedFAQ } from '@/components/marketing/SimplifiedFAQ'
import { NewUserGuide } from '@/components/marketing/NewUserGuide'
import { FeatureShowcase } from '@/components/marketing/FeatureShowcase'
import { VibeLuxLogo } from '@/components/VibeLuxLogo'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'
import { UnifiedMainNavigation } from '@/components/UnifiedMainNavigation'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Global Navigation with dropdowns */}
      <UnifiedMainNavigation />

      {/* Hero Section with Purple Gradient */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Purple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-950" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl" />
        
        <div className="relative container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/50 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Professional CEA Platform • AI-Powered Design • DLC Database
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Reduce Energy Costs with AI
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A comprehensive, end‑to‑end platform for controlled environment agriculture. Includes a large DLC fixtures
            database, 25+ calculators, robust components and API endpoints, AI‑assisted optimization, and complete
            facility management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
href="/design/advanced"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              Start AI Design Studio
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/demo" 
              className="px-8 py-4 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
            >
              Schedule Live Demo
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Free trial available
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              DLC fixtures library
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              CAD/PDF export
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-lg font-semibold text-white">Comprehensive Feature Set</div>
              <div className="text-sm text-gray-400">Design to operations</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-400">Energy Optimization</div>
              <div className="text-sm text-gray-400">AI‑assisted planning & control</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">DLC Fixtures Library</div>
              <div className="text-sm text-gray-400">Search and compare</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Free Trial</div>
              <div className="text-sm text-gray-400">Get started quickly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Complete Platform for <span className="text-purple-400">Professional Growers</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything from AI design to construction drawings to operational management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all">
              <Brain className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">AI Design Studio</h3>
              <p className="text-gray-400 mb-4">Generate complete facility designs from natural language. Creates professional AMPE drawings automatically.</p>
<Link href="/design/advanced" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-2">
                Try AI Designer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-green-500/50 transition-all">
              <Database className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">DLC Database</h3>
              <p className="text-gray-400 mb-4">Access 2,400+ certified fixtures with real dimensions, IES files, and photometric data.</p>
              <Link href="/fixtures" className="text-green-400 hover:text-green-300 inline-flex items-center gap-2">
                Browse Fixtures <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all">
              <BarChart3 className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Analytics</h3>
              <p className="text-gray-400 mb-4">Monitor energy, yield, environmental data across all facilities with predictive insights.</p>
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-2">
                View Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-yellow-500/50 transition-all">
              <Building2 className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">CAD Export</h3>
              <p className="text-gray-400 mb-4">Export to DWG, DXF, IFC, Revit. Generate 45-sheet professional drawing sets.</p>
              <Link href="/cad-integration" className="text-yellow-400 hover:text-yellow-300 inline-flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-orange-500/50 transition-all">
              <Calculator className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">25+ Calculators</h3>
              <p className="text-gray-400 mb-4">Professional tools for PPFD, DLI, VPD, ROI, TCO with DuPont analysis and more.</p>
<Link href="/calculators" className="text-orange-400 hover:text-orange-300 inline-flex items-center gap-2">
                Try Calculators <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all">
              <Shield className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">ESG Compliance</h3>
              <p className="text-gray-400 mb-4">Track Scope 1, 2, 3 emissions. Generate carbon credits and compliance reports.</p>
              <Link href="/sustainability/carbon-credits" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-2">
                ESG Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use the consolidated marketing component */}
      {/* Comprehensive Feature Showcase - NEW! */}
      <FeatureShowcase />
      
      <ConsolidatedMarketing />
      
      {/* New User Guide - How it works and pricing */}
      <NewUserGuide />

      {/* Condensed How it Works strips */}
      <HowItWorksStrip
        dense
        heading="How Energy Savings Works"
        subheading="Connect utility → establish baseline → optimize → verify savings."
        steps={[
          { title: 'Connect/Upload', description: 'Utility API or PDF bills', href: '/integrations/utility-api?tab=connections', ctaLabel: 'Connect' },
          { title: 'Seasonality', description: 'Monthly baselines + adjustments', href: '/energy/setup/utility', ctaLabel: 'Configure' },
          { title: 'Optimize', description: 'Schedules, DR, batteries/solar', href: '/energy-monitoring', ctaLabel: 'Open' },
          { title: 'Verify', description: 'Savings tracking and payout', href: '/pricing', ctaLabel: 'Learn More' },
        ]}
      />
      
      {/* Testimonials */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Trusted by Industry Leaders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "VibeLux reduced our energy costs by 35% while increasing yields. The AI design tool saved us $50k in consulting fees."
              </p>
              <div className="text-sm text-gray-500">
                <div className="font-semibold text-white">John Smith</div>
                <div>Director of Operations, GreenLeaf Farms</div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The CAD export feature alone is worth the subscription. We generate professional drawings in minutes, not days."
              </p>
              <div className="text-sm text-gray-500">
                <div className="font-semibold text-white">Sarah Johnson</div>
                <div>Lead Engineer, Urban Harvest Co.</div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Managing 12 facilities is seamless with VibeLux. Real-time monitoring and predictive maintenance changed everything."
              </p>
              <div className="text-sm text-gray-500">
                <div className="font-semibold text-white">Mike Chen</div>
                <div>CEO, Precision Agriculture Inc.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <SimplifiedFAQ />

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Operation?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start optimizing your facility's lighting design and energy efficiency today
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/design/advanced" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/pricing" 
              className="px-8 py-4 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}