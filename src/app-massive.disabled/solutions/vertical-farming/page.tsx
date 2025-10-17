'use client';

import Link from 'next/link';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Layers, 
  ArrowRight,
  CheckCircle,
  Clock,
  Bell,
  Calculator,
  Lightbulb,
  BarChart3,
  Zap
} from 'lucide-react';

export default function VerticalFarmingSolutionPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-900/20 to-gray-950 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-600/50 rounded-full px-4 py-2 text-sm text-blue-300">
                <Bell className="w-4 h-4" />
                Early Development
              </div>
              <h1 className="text-5xl font-bold text-white">Vertical Farming Solutions</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Multi-layer lighting optimization for vertical growing operations. Currently developing 
                specialized tools based on vertical farming requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Current Capabilities */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Available Today</h2>
              <p className="text-gray-400 text-lg">Core lighting tools that apply to vertical farming operations</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Calculator className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Single-Layer Optimization</h3>
                <p className="text-gray-400 mb-4">
                  Design optimal lighting for individual growing levels with precise PPFD calculations.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Layer-by-layer design
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Uniformity analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Energy calculations
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Lightbulb className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Leafy Greens Focus</h3>
                <p className="text-gray-400 mb-4">
                  Specialized calculations for lettuce, herbs, and other leafy greens commonly grown vertically.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Crop-specific DLI targets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Growth cycle planning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Harvest timing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* In Development */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Vertical Farming Features in Development</h2>
              <p className="text-gray-400 text-lg">Specialized tools for multi-layer growing systems</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Multi-Layer Design</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Optimize entire vertical systems with heat and light interaction modeling.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Research phase
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Automated Scheduling</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Dynamic lighting schedules for rapid growth cycles and multiple harvests.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Planning
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Space Efficiency</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Maximize production per square foot with optimized spacing and lighting.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Concept phase
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Capabilities */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-green-900/20 border border-green-600/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Layers className="w-6 h-6 text-green-400" />
                Current Capabilities & Roadmap
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>Available Now:</strong> Multi-tier lighting design with advanced ray tracing, 
                  layer-specific canopy modeling, inter-tier light distribution analysis, and vertical 
                  farm optimization algorithms. Supports rolling benches and multi-layer crop scheduling.
                </p>
                <p>
                  <strong>Advanced Features:</strong> Multi-layer canopy ray tracer, tier-specific PPFD 
                  calculations, shadowing analysis between levels, and energy optimization across multiple 
                  growing layers with spectral distribution modeling.
                </p>
                <p>
                  <strong>Coming Soon:</strong> Enhanced heat modeling integration with HVAC systems, 
                  automated harvest scheduling optimization, and advanced vertical farm economics modeling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partner CTA */}
        <section className="py-20 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <div className="flex items-center justify-center gap-3">
              <Layers className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Partner with Us</h2>
            </div>
            <p className="text-xl text-gray-400">
              Help us develop the first comprehensive vertical farming lighting platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Become a Development Partner
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/sign-up"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Current Tools
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}