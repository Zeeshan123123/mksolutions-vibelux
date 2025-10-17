'use client';

import Link from 'next/link';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Building2, 
  ArrowRight,
  CheckCircle,
  Clock,
  Bell,
  Calculator,
  Lightbulb,
  Sun,
  Thermometer
} from 'lucide-react';

export default function GreenhouseSolutionPage() {
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
                Planning Phase
              </div>
              <h1 className="text-5xl font-bold text-white">Greenhouse Production</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Professional greenhouse lighting design combining natural sunlight with supplemental LED systems. 
                Features being planned based on industry needs.
              </p>
            </div>
          </div>
        </div>

        {/* Current Tools */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Available Lighting Tools</h2>
              <p className="text-gray-400 text-lg">Core design capabilities that work for greenhouse applications</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Calculator className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">LED System Design</h3>
                <p className="text-gray-400 mb-4">
                  Design LED lighting systems for sole-source or supplemental applications.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    PPFD calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Fixture placement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Energy analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Cost projections
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Lightbulb className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">3D Visualization</h3>
                <p className="text-gray-400 mb-4">
                  Visualize lighting layouts in your greenhouse structure with real fixture data.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Import greenhouse plans
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    DLC fixture database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Professional reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Export capabilities
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Planned Features */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Greenhouse-Specific Features Planned</h2>
              <p className="text-gray-400 text-lg">Advanced tools being developed for greenhouse production</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sun className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Natural Light Integration</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Calculate supplemental lighting needs based on natural sunlight availability and seasonal changes.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Research & planning
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Thermometer className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-bold text-white">Climate Integration</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Coordinate lighting with heating, cooling, and ventilation systems for optimal growing conditions.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Concept development
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Dutch Methods</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Implement proven Dutch greenhouse growing protocols and environmental control strategies.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Research partnerships
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Seasonal Optimization</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Automatically adjust lighting schedules and intensity based on changing daylight hours.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Planning
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Crop-Specific Programs</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Specialized lighting programs for tomatoes, cucumbers, peppers, and other greenhouse crops.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Data collection
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Energy Management</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Optimize energy usage with demand response and time-of-use electricity pricing.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Development
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Focus */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-green-900/20 border border-green-600/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-green-400" />
                Our Greenhouse Focus
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>Experience:</strong> Blake Lange's background includes extensive work with greenhouse 
                  operations through Signify/Philips, bringing real-world greenhouse knowledge to VibeLux.
                </p>
                <p>
                  <strong>Current capability:</strong> While greenhouse-specific features are in development, 
                  our core lighting design tools work well for greenhouse LED installations.
                </p>
                <p>
                  <strong>Development priority:</strong> Greenhouse features are high on our roadmap, 
                  especially natural light integration and climate coordination.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl font-bold text-white">Interested in Greenhouse Solutions?</h2>
            <p className="text-xl text-gray-400">
              Help us prioritize greenhouse features and get early access when they're ready
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Express Interest
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/sign-up"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Try LED Design Tools
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}