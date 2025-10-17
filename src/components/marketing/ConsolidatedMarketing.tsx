'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Lightbulb, TrendingUp, Shield, Clock, ArrowRight, CheckCircle,
  Star, Users, DollarSign, Zap, Building, Leaf, BarChart3,
  FileText, Brain, Database, Calculator, Target, Award,
  Smartphone, Code2, Link2, Gauge, Settings, ChevronRight
} from 'lucide-react'

// Consolidated energy savings data - single source of truth
export const ENERGY_SAVINGS = {
  percentage: 'Up to 30%',
  monthlyAverage: '$3,000-4,500',
  yearlyAverage: '$36,000-54,000',
  disclaimer: '*Results vary based on facility size and current efficiency'
}

// Consolidated yield improvements
export const YIELD_IMPROVEMENTS = {
  percentage: 'Up to 20%',
  typical: '0.7-1.2 lbs/sq ft',
  disclaimer: '*Based on optimized lighting and environmental controls'
}

// Platform statistics - verified counts
export const PLATFORM_STATS = {
  totalFeatures: '2,400+',
  totalComponents: '1,000+',
  totalCalculators: '300+',
  totalApiEndpoints: '400+',
  dlcFixtures: '2,400+',
  totalFiles: '4,247'
}

// Core platform features - deduplicated
export const CORE_FEATURES = [
  {
    id: 'dlc-database',
    title: 'DLC Fixture Database',
    description: '2,400+ certified fixtures with real photometric data',
    icon: Database,
    highlights: ['Real IES files', 'Accurate specifications', 'CAD models'],
    category: 'lighting'
  },
  {
    id: 'ai-design',
    title: 'AI-Powered Design',
    description: 'Design optimal layouts in minutes with intelligent algorithms',
    icon: Brain,
    highlights: ['Natural language input', 'Automatic optimization', 'Professional reports'],
    category: 'design'
  },
  {
    id: 'cad-export',
    title: 'CAD Integration',
    description: 'Export to DWG, DXF, Revit with complete construction drawings',
    icon: Building,
    highlights: ['45-sheet drawing sets', 'BIM compatibility', 'Code compliance'],
    category: 'design'
  },
  {
    id: 'ppfd-calc',
    title: 'PPFD/DLI Calculator',
    description: 'Scientific light intensity mapping and daily light integral',
    icon: Calculator,
    highlights: ['3D visualization', 'Uniformity analysis', 'Spectrum optimization'],
    category: 'lighting'
  },
  {
    id: 'cloud-save',
    title: 'Cloud Design Storage',
    description: 'Save and manage all your designs in the cloud',
    icon: Shield,
    highlights: ['Version history', 'Team collaboration', 'Secure backup'],
    category: 'platform'
  },
  {
    id: 'multi-facility',
    title: 'Multi-Facility Management',
    description: 'Manage multiple locations from one dashboard',
    icon: Building,
    highlights: ['Centralized control', 'Performance comparison', 'Scalable'],
    category: 'platform'
  }
]

// How it works - consolidated steps
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Define Your Space',
    description: 'Upload CAD files or sketch your facility layout',
    duration: '5 minutes',
    icon: Building
  },
  {
    step: 2,
    title: 'AI Optimization',
    description: 'Our AI analyzes and designs optimal fixture placement',
    duration: '2 minutes',
    icon: Brain
  },
  {
    step: 3,
    title: 'Review & Adjust',
    description: 'Fine-tune the design with our interactive tools',
    duration: 'As needed',
    icon: Settings
  },
  {
    step: 4,
    title: 'Export & Implement',
    description: 'Download professional drawings and reports',
    duration: 'Instant',
    icon: FileText
  }
]

// Customer types - consolidated
export const CUSTOMER_TYPES = [
  {
    type: 'Cannabis Cultivation',
    description: 'Indoor & greenhouse optimization',
    benefits: ['Compliance reporting', 'Strain-specific recipes', 'Canopy management']
  },
  {
    type: 'Vertical Farms',
    description: 'Multi-tier growing systems',
    benefits: ['Stack optimization', 'Crop rotation planning', 'Labor efficiency']
  },
  {
    type: 'Research Facilities',
    description: 'Academic and R&D operations',
    benefits: ['Experimental design', 'Data export', 'Publication-ready charts']
  },
  {
    type: 'Commercial Greenhouses',
    description: 'Large-scale production',
    benefits: ['Supplemental lighting', 'Energy management', 'Yield forecasting']
  }
]

// Main consolidated marketing component
export function ConsolidatedMarketing() {
  const [selectedFeature, setSelectedFeature] = useState(CORE_FEATURES[0])

  return (
    <>
      {/* Value Proposition Section */}
      <section className="py-20 bg-gradient-to-b from-gray-950 to-purple-950/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              The Complete CEA Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to design, optimize, and manage your controlled environment agriculture facility
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{ENERGY_SAVINGS.percentage}</div>
              <div className="text-gray-400 mb-2">Energy Cost Reduction</div>
              <div className="text-sm text-gray-500">{ENERGY_SAVINGS.disclaimer}</div>
            </div>
            
            <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{YIELD_IMPROVEMENTS.percentage}</div>
              <div className="text-gray-400 mb-2">Yield Improvement</div>
              <div className="text-sm text-gray-500">{YIELD_IMPROVEMENTS.disclaimer}</div>
            </div>
            
            <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 text-center">
              <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">10+ Hours</div>
              <div className="text-gray-400 mb-2">Saved Weekly</div>
              <div className="text-sm text-gray-500">Through automation and optimization</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How VibeLux Works
            </h2>
            <p className="text-xl text-gray-400">
              Get professional results in minutes, not weeks
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <step.icon className="w-10 h-10 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{step.description}</p>
                  <p className="text-purple-400 text-sm font-medium">{step.duration}</p>
                </div>
                {step.step < HOW_IT_WORKS.length && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Professional Tools for CEA
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built on scientific principles, designed for practical use
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CORE_FEATURES.map((feature) => (
              <div 
                key={feature.id}
                className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedFeature(feature)}
              >
                <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Types */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Your Industry
            </h2>
            <p className="text-xl text-gray-400">
              Tailored solutions for every type of CEA operation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {CUSTOMER_TYPES.map((customer, idx) => (
              <div key={idx} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-2">{customer.type}</h3>
                <p className="text-gray-400 text-sm mb-4">{customer.description}</p>
                <ul className="space-y-2">
                  {customer.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Facility?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join growers who are saving energy and increasing yields with VibeLux
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
              href="/demo" 
              className="px-8 py-4 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
            >
              Schedule Demo
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            14-day free trial • Credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </>
  )
}

// Export individual sections for flexible use
export function ValuePropositionSection() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="text-center">
        <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <div className="text-3xl font-bold text-white mb-2">{ENERGY_SAVINGS.percentage}</div>
        <div className="text-gray-400">Energy Savings</div>
      </div>
      <div className="text-center">
        <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <div className="text-3xl font-bold text-white mb-2">{YIELD_IMPROVEMENTS.percentage}</div>
        <div className="text-gray-400">Yield Increase</div>
      </div>
      <div className="text-center">
        <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <div className="text-3xl font-bold text-white mb-2">10+ Hours</div>
        <div className="text-gray-400">Saved Weekly</div>
      </div>
    </div>
  )
}

export function HowItWorksSection() {
  return (
    <div className="grid md:grid-cols-4 gap-8">
      {HOW_IT_WORKS.map((step) => (
        <div key={step.step} className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <step.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Step {step.step}: {step.title}</h3>
          <p className="text-gray-400 text-sm">{step.description}</p>
        </div>
      ))}
    </div>
  )
}