'use client';

import Link from 'next/link';
import { Calculator, ArrowRight, Zap, Thermometer, Droplets, Sprout } from 'lucide-react';

const calculatorCategories = [
  {
    title: 'Environmental Calculators',
    description: 'Climate control and environmental optimization',
    icon: Thermometer,
    calculators: [
      { name: 'VPD Calculator', href: '/calculators/vpd', description: 'Vapor Pressure Deficit optimization' },
      { name: 'DLI Calculator', href: '/calculators/dli', description: 'Daily Light Integral planning' },
      { name: 'NASA NREL Solar DLI', href: '/calculators/solar-dli', description: 'Solar irradiance & natural DLI data' },
      { name: 'HVAC Sizing', href: '/calculators/hvac', description: 'Heating and cooling requirements' },
      { name: 'Psychrometric Chart', href: '/calculators/psychrometric', description: 'Air property analysis' }
    ]
  },
  {
    title: 'Lighting Calculators', 
    description: 'Horticultural lighting design and optimization',
    icon: Zap,
    calculators: [
      { name: 'PPFD Calculator', href: '/calculators/ppfd', description: 'Photosynthetic photon flux density' },
      { name: 'Light Spectrum Designer', href: '/calculators/spectrum', description: 'Custom spectrum optimization' },
      { name: 'Coverage Area Calculator', href: '/calculators/coverage', description: 'Fixture placement planning' },
      { name: 'Energy Cost Calculator', href: '/calculators/energy-cost', description: 'Operating cost analysis' }
    ]
  },
  {
    title: 'Irrigation & Nutrition',
    description: 'Water and nutrient management systems',
    icon: Droplets,
    calculators: [
      { name: 'Nutrient Calculator', href: '/calculators/nutrients', description: 'Fertilizer mixing and EC/pH' },
      { name: 'Irrigation Scheduler', href: '/calculators/irrigation', description: 'Watering schedule optimization' },
      { name: 'Water Quality Analyzer', href: '/calculators/water-quality', description: 'Source water analysis' },
      { name: 'Substrate Calculator', href: '/calculators/substrate', description: 'Growing media selection' }
    ]
  },
  {
    title: 'Crop Planning',
    description: 'Production planning and yield optimization',
    icon: Sprout,
    calculators: [
      { name: 'Crop Planner', href: '/calculators/crop-planner', description: 'Production scheduling' },
      { name: 'Yield Estimator', href: '/calculators/yield', description: 'Harvest prediction' },
      { name: 'Space Utilization', href: '/calculators/space', description: 'Growing area optimization' },
      { name: 'ROI Calculator', href: '/calculators/roi', description: 'Investment return analysis' }
    ]
  }
];

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-6">
            <Calculator className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Professional Calculators
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            25+ precision calculators for controlled environment agriculture. 
            Research-grade tools used by professionals worldwide.
          </p>
        </div>
      </div>

      {/* Calculator Categories */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {calculatorCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="bg-gray-900/50 rounded-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                    <p className="text-gray-400">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {category.calculators.map((calc) => (
                    <Link
                      key={calc.name}
                      href={calc.href}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {calc.name}
                        </h3>
                        <p className="text-sm text-gray-400">{calc.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Need More Advanced Tools?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Upgrade to VibeLux Pro for advanced modeling, AI optimization, and custom calculators.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            Upgrade Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
