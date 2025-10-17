'use client';

import Link from 'next/link';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Leaf, 
  ArrowRight,
  CheckCircle,
  Clock,
  Bell,
  Calculator,
  Lightbulb,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

export default function CannabisSolutionPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-green-900/20 to-gray-950 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-600/50 rounded-full px-4 py-2 text-sm text-green-300">
                <Bell className="w-4 h-4" />
                Currently in Beta Testing
              </div>
              <h1 className="text-5xl font-bold text-white">Cannabis Cultivation</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Professional lighting design tools for cannabis cultivation, with features being 
                developed based on real grower feedback from our beta program.
              </p>
            </div>
          </div>
        </div>

        {/* Current Features */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">What's Available Today</h2>
              <p className="text-gray-400 text-lg">Core lighting design tools that work for cannabis operations</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Calculator className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">PPFD Calculations</h3>
                <p className="text-gray-400 mb-4">
                  Calculate optimal light intensity for different growth stages with professional-grade accuracy.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Vegetative & flowering stages
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Coverage analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Energy cost calculations
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Lightbulb className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">3D Layout Design</h3>
                <p className="text-gray-400 mb-4">
                  Design lighting layouts with real fixture data and 3D visualization.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    DLC fixture database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Uniformity analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Export to CAD
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Energy Analysis</h3>
                <p className="text-gray-400 mb-4">
                  Optimize power consumption and calculate operating costs for your facility.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Power calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Cost projections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Efficiency metrics
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
              <h2 className="text-3xl font-bold text-white mb-4">Cannabis-Specific Features in Development</h2>
              <p className="text-gray-400 text-lg">Based on feedback from our beta cannabis growers</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Strain-Specific Optimization</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Lighting recommendations based on strain characteristics and desired outcomes.
                </p>
                <div className="text-sm text-gray-500">
                  Status: Research phase with university partners
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Compliance Integration</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Tools to help with state compliance requirements and tracking systems.
                </p>
                <div className="text-sm text-gray-500">
                  Status: Planning phase, seeking beta partners
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beta Program CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-green-900/20 border border-green-600/50 rounded-2xl p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <Leaf className="w-8 h-8 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">Join Our Cannabis Beta Program</h2>
                </div>
                <p className="text-green-200 text-lg max-w-2xl mx-auto">
                  We're working with licensed cannabis cultivators to develop industry-specific features. 
                  Get early access and help shape the future of cannabis lighting optimization.
                </p>
                
                {/* Requirements */}
                <div className="bg-gray-900/50 rounded-xl p-6 text-left max-w-2xl mx-auto">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Beta Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Licensed cannabis cultivation facility</li>
                    <li>• Willingness to provide feedback on features</li>
                    <li>• Basic understanding of PPFD and DLI concepts</li>
                    <li>• Interest in lighting optimization</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/contact"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Apply for Beta Access
                  </Link>
                  <Link 
                    href="/sign-up"
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Try Core Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}