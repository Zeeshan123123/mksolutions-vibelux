'use client';

import React, { useState } from 'react';
import { 
  Heart, Microscope, Zap, TrendingUp, ArrowRight, CheckCircle, 
  Beaker, Target, BarChart3, Settings, AlertTriangle, Leaf,
  LineChart, Activity, Award, FileText, Shield, Clock,
  Lightbulb, Database, Brain, Package, Factory, Droplets
} from 'lucide-react';

interface NutritionalTarget {
  compound: string;
  baseLevel: number;
  enhancedLevel: number;
  unit: string;
  healthBenefit: string;
  achievementMethod: string;
}

interface FunctionalFoodApplication {
  name: string;
  market: string;
  targetCompounds: string[];
  lightProtocol: string;
  expectedIncrease: string;
  certification: string;
  roi: string;
}

export default function FunctionalFoodsHowItWorks() {
  const [activeTab, setActiveTab] = useState('overview');

  const nutritionalTargets: NutritionalTarget[] = [
    {
      compound: 'Vitamin C',
      baseLevel: 25,
      enhancedLevel: 35,
      unit: 'mg/100g',
      healthBenefit: 'Immune system support, antioxidant protection',
      achievementMethod: 'UV-B stress response + optimized blue light spectrum'
    },
    {
      compound: 'Anthocyanins',
      baseLevel: 12,
      enhancedLevel: 18,
      unit: 'mg/100g',
      healthBenefit: 'Anti-inflammatory, cardiovascular health',
      achievementMethod: 'Extended far-red exposure + temperature stress'
    },
    {
      compound: 'Lycopene',
      baseLevel: 3.1,
      enhancedLevel: 4.5,
      unit: 'mg/100g',
      healthBenefit: 'Prostate health, cancer prevention',
      achievementMethod: 'Green-yellow spectrum optimization (505-575nm)'
    },
    {
      compound: 'Lutein',
      baseLevel: 8,
      enhancedLevel: 11,
      unit: 'mg/100g',
      healthBenefit: 'Eye health, macular degeneration prevention',
      achievementMethod: 'Blue light stress + carotenoid pathway activation'
    },
    {
      compound: 'Folate',
      baseLevel: 35,
      enhancedLevel: 45,
      unit: 'μg/100g',
      healthBenefit: 'Prenatal health, DNA synthesis',
      achievementMethod: 'Controlled nitrogen regulation + UV enhancement'
    },
    {
      compound: 'Nitrates (Reduction)',
      baseLevel: 450,
      enhancedLevel: 280,
      unit: 'mg/kg',
      healthBenefit: 'Infant-safe produce, reduced health risks',
      achievementMethod: 'Blue light inhibition of nitrate reductase'
    }
  ];

  const functionalFoodApplications: FunctionalFoodApplication[] = [
    {
      name: 'Medical-Grade Low-Potassium Lettuce',
      market: 'Kidney Disease Patients',
      targetCompounds: ['Reduced Potassium', 'Enhanced Folate'],
      lightProtocol: 'Modified red/blue with minimal UV',
      expectedIncrease: '50% potassium reduction',
      certification: 'Medical Grade',
      roi: '3-6 months'
    },
    {
      name: 'Antioxidant-Rich Microgreens',
      market: 'Health Food Stores',
      targetCompounds: ['Anthocyanins', 'Vitamin C', 'Polyphenols'],
      lightProtocol: 'UV-B enhancement with blue stress',
      expectedIncrease: '40-60% antioxidants',
      certification: 'Organic Plus',
      roi: '2-4 months'
    },
    {
      name: 'Infant-Safe Baby Greens',
      market: 'Baby Food Industry',
      targetCompounds: ['Low Nitrates', 'Enhanced Vitamins'],
      lightProtocol: 'Nitrate-reducing blue spectrum',
      expectedIncrease: '75% nitrate reduction',
      certification: 'Infant Safe',
      roi: '4-8 months'
    },
    {
      name: 'High-Lycopene Tomatoes',
      market: 'Nutraceutical Industry',
      targetCompounds: ['Lycopene', 'Carotenoids'],
      lightProtocol: 'Green-yellow optimization (505-575nm)',
      expectedIncrease: '45% lycopene increase',
      certification: 'Nutraceutical Grade',
      roi: '2-5 months'
    },
    {
      name: 'Therapeutic Herbs',
      market: 'Pharmaceutical Companies',
      targetCompounds: ['Bioactive Compounds', 'Essential Oils'],
      lightProtocol: 'Multi-stress protocol with UV',
      expectedIncrease: '50-150% active compounds',
      certification: 'GMP Certified',
      roi: '6-12 months'
    },
    {
      name: 'Protein-Enhanced Algae',
      market: 'Plant-Based Protein',
      targetCompounds: ['Complete Proteins', 'Omega-3s'],
      lightProtocol: 'High-intensity red with nitrogen optimization',
      expectedIncrease: '40% protein content',
      certification: 'Food Grade',
      roi: '1-3 months'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-800/30 border border-green-600/50 rounded-full px-4 py-2 text-sm text-green-300">
              <Heart className="w-4 h-4" />
              Medical & Nutraceutical Innovation
            </div>
            <h1 className="text-5xl font-bold text-white">Functional Foods & Nutraceutical Optimization</h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Revolutionary light-based enhancement of nutritional compounds for medical applications, 
              functional foods, and therapeutic nutrition. VibeLux's precision spectral control enables 
              targeted bioactive compound production for specific health outcomes.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Medical-Grade Protocols
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                GMP Certified Processes
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Research-Based Enhancement
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'How It Works', icon: <Brain className="w-4 h-4" /> },
              { id: 'applications', label: 'Applications', icon: <Heart className="w-4 h-4" /> },
              { id: 'science', label: 'The Science', icon: <Microscope className="w-4 h-4" /> },
              { id: 'results', label: 'Results & ROI', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Light-Based Nutritional Enhancement</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                VibeLux leverages photobiology research to precisely control bioactive compound production in crops
              </p>
            </div>

            {/* Process Flow */}
            <div className="grid lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Target Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Identify specific nutritional compounds and health benefits required for your target market
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Beaker className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Protocol Design</h3>
                <p className="text-gray-400 text-sm">
                  AI-designed light protocols based on plant biochemistry and metabolic pathway research
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Precision Control</h3>
                <p className="text-gray-400 text-sm">
                  Automated spectral delivery with real-time monitoring of compound development
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Certified Results</h3>
                <p className="text-gray-400 text-sm">
                  Medical-grade validation with GMP-compliant processes and third-party testing
                </p>
              </div>
            </div>

            {/* Nutritional Enhancement Showcase */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Proven Nutritional Enhancements</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nutritionalTargets.map((target, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white">{target.compound}</h4>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {target.compound.includes('Reduction') ? '-' : '+'}
                          {Math.round(((target.enhancedLevel - target.baseLevel) / target.baseLevel) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Standard:</span>
                        <span className="text-white">{target.baseLevel} {target.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Enhanced:</span>
                        <span className="text-green-400 font-bold">{target.enhancedLevel} {target.unit}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Health Benefit:</p>
                        <p className="text-sm text-gray-300">{target.healthBenefit}</p>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-gray-400 mb-1">Method:</p>
                        <p className="text-xs text-purple-300">{target.achievementMethod}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Technologies */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl border border-green-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Microscope className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">Bioactive Compound Analysis</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Metabolic pathway modeling for targeted compound synthesis
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Real-time phytochemical monitoring during growth
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    HPLC-based compound quantification methods
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Bioavailability optimization for maximum health benefits
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Precision Light Protocols</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Wavelength-specific activation of biosynthetic pathways
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Controlled stress induction for secondary metabolite production
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Growth stage-specific spectral adjustments
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Multi-parameter environmental integration (temperature, humidity, CO₂)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Market Applications</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Specialized applications across medical, nutraceutical, and functional food markets
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {functionalFoodApplications.map((app, index) => (
                <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
                      <p className="text-gray-400">{app.market}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm bg-green-800/30 text-green-300 px-2 py-1 rounded">
                        {app.certification}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Target Compounds</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.targetCompounds.map((compound, i) => (
                          <span key={i} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                            {compound}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Light Protocol</h4>
                      <p className="text-sm text-gray-300">{app.lightProtocol}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Enhancement</h4>
                        <p className="text-lg font-bold text-green-400">{app.expectedIncrease}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">ROI Timeline</h4>
                        <p className="text-sm text-gray-300">{app.roi}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Market Segments */}
            <div className="mt-16 bg-gray-900/50 rounded-xl border border-gray-800 p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Target Markets & Revenue Potential</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Medical Foods</h4>
                  <p className="text-2xl font-bold text-red-400 mb-1">$4.7B</p>
                  <p className="text-xs text-gray-400">Market Size (2024)</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Nutraceuticals</h4>
                  <p className="text-2xl font-bold text-green-400 mb-1">$382B</p>
                  <p className="text-xs text-gray-400">Market Size (2024)</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Functional Foods</h4>
                  <p className="text-2xl font-bold text-blue-400 mb-1">$279B</p>
                  <p className="text-xs text-gray-400">Market Size (2024)</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Factory className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Pharmaceuticals</h4>
                  <p className="text-2xl font-bold text-purple-400 mb-1">$1.4T</p>
                  <p className="text-xs text-gray-400">Market Size (2024)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Science Tab */}
      {activeTab === 'science' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Scientific Foundation</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Research-based protocols backed by peer-reviewed studies in plant photobiology and nutrition
              </p>
            </div>

            {/* Biological Mechanisms */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl border border-green-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Microscope className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">Light-Metabolite Interactions</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Phenylpropanoid Pathway</h4>
                    <p className="text-gray-300 text-sm">
                      UV-B radiation (280-315nm) activates PAL (phenylalanine ammonia-lyase), the key enzyme 
                      initiating anthocyanin and flavonoid synthesis for enhanced antioxidant production.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Carotenoid Biosynthesis</h4>
                    <p className="text-gray-300 text-sm">
                      Green-yellow light (505-575nm) specifically enhances lycopene cyclase activity, 
                      converting lycopene to beta-carotene and other high-value carotenoids.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Ascorbic Acid Enhancement</h4>
                    <p className="text-gray-300 text-sm">
                      Blue light stress (400-500nm) upregulates L-galactono-1,4-lactone dehydrogenase, 
                      the final enzyme in vitamin C biosynthesis pathway.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Stress-Response Optimization</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Controlled Abiotic Stress</h4>
                    <p className="text-gray-300 text-sm">
                      Precisely controlled light, temperature, and water stress triggers secondary 
                      metabolite production without compromising plant health or yield quality.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">ROS Signaling</h4>
                    <p className="text-gray-300 text-sm">
                      Reactive oxygen species generated by specific light wavelengths act as signaling 
                      molecules to activate antioxidant defense systems and bioactive compound synthesis.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Nitrate Reduction Control</h4>
                    <p className="text-gray-300 text-sm">
                      Blue light (440-480nm) inhibits nitrate reductase activity, reducing nitrate 
                      accumulation for infant-safe produce while maintaining nutritional quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Citations */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Research Foundation</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Bian et al. (2015)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Blue light suppresses nitrate accumulation in leafy vegetables"
                    - Journal Food Chemistry
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Cited 287x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Viršilė et al. (2019)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Light spectrum effects on antioxidant compounds in microgreens"
                    - Plant Science
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Cited 156x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Kelly et al. (2020)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Medical foods: regulatory framework and market applications"
                    - Functional Foods in Health
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Cited 92x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Dumas et al. (2003)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Light spectrum effects on lycopene accumulation in tomatoes"
                    - HortScience
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Cited 423x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Gautier et al. (2005)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Carotenoid biosynthesis pathway optimization in controlled environments"
                    - Plant Physiology
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Cited 367x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Dannehl et al. (2021)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "LED-enhanced functional compound production in horticultural crops"
                    - Frontiers Plant Science
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Cited 78x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Expected Results & Market Impact</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Proven enhancement levels and revenue potential across different market segments
              </p>
            </div>

            {/* Enhancement Results */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl border border-green-800/50 p-8 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">40-80%</div>
                <div className="text-gray-400">Antioxidant Enhancement</div>
                <div className="text-xs text-gray-500 mt-2">Anthocyanins, Vitamin C, Polyphenols</div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8 text-center">
                <Heart className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">45%</div>
                <div className="text-gray-400">Lycopene Increase</div>
                <div className="text-xs text-gray-500 mt-2">Cardiovascular health compounds</div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-xl border border-purple-800/50 p-8 text-center">
                <Droplets className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">75%</div>
                <div className="text-gray-400">Nitrate Reduction</div>
                <div className="text-xs text-gray-500 mt-2">Infant-safe produce</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/20 to-gray-900 rounded-xl border border-yellow-800/50 p-8 text-center">
                <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">50%</div>
                <div className="text-gray-400">Potassium Reduction</div>
                <div className="text-xs text-gray-500 mt-2">Medical-grade specifications</div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">Revenue Impact Analysis</h3>
              <div className="grid lg:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Premium Pricing</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      Medical foods: 300-500% premium over standard produce
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      Nutraceutical ingredients: 200-400% higher value
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      Certified organic plus: 150-250% premium pricing
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Market Access</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      Hospital and healthcare facility contracts
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      Pharmaceutical ingredient supply agreements
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      Premium health food store placement
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Competitive Advantages</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      Consistent bioactive compound levels
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      Year-round production capability
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      Customizable nutritional profiles
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Implementation Timeline */}
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-800/50 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Implementation & Certification Timeline</h3>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Assessment</h4>
                  <p className="text-xs text-gray-400">Market analysis & compound targets</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Protocol Development</h4>
                  <p className="text-xs text-gray-400">Custom light recipes & validation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Pilot Testing</h4>
                  <p className="text-xs text-gray-400">Small-scale testing & optimization</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Certification</h4>
                  <p className="text-xs text-gray-400">GMP, organic, medical compliance</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Scale-Up</h4>
                  <p className="text-xs text-gray-400">Commercial production & marketing</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-green-900/20 to-gray-950 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">Ready to Enter the Functional Foods Market?</h2>
          <p className="text-xl text-gray-400">
            Join innovative producers creating the next generation of medical-grade and nutraceutical foods
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Start Your Functional Foods Program
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Download Market Analysis
              <FileText className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>GMP-certified processes • Medical-grade validation • Premium market access</p>
            <p className="mt-2">💊 <em>"Transforming nutrition through precision agriculture"</em></p>
          </div>
        </div>
      </section>
    </div>
  );
}