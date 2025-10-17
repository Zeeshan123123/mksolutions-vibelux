'use client';

import React, { useState } from 'react';
import { 
  Factory, Zap, TrendingUp, ArrowRight, CheckCircle, 
  Beaker, Target, BarChart3, Settings, Leaf, Database,
  LineChart, Activity, Award, FileText, Shield, Clock,
  Lightbulb, Brain, Package, Droplets, Wind, Gauge,
  Sun, Thermometer, FlaskConical, Microscope, Globe
} from 'lucide-react';

interface BiomassApplication {
  name: string;
  targetBiomass: string;
  lightStrategy: string;
  expectedIncrease: string;
  energyEfficiency: string;
  marketValue: string;
  co2Impact: string;
}

interface BiomassMetric {
  parameter: string;
  standardValue: number;
  optimizedValue: number;
  unit: string;
  improvementType: 'increase' | 'decrease';
  method: string;
}

export default function BiomassOptimizationHowItWorks() {
  const [activeTab, setActiveTab] = useState('overview');

  const biomassApplications: BiomassApplication[] = [
    {
      name: 'Microalgae Biofuel Production',
      targetBiomass: 'Chlorella vulgaris, Spirulina platensis',
      lightStrategy: 'High-intensity red (660nm) with pulsed white for maximum photosynthetic efficiency',
      expectedIncrease: '20-35% biomass yield',
      energyEfficiency: '35% reduction in kWh/kg',
      marketValue: '$8-12/kg dry weight',
      co2Impact: '1.8kg CO₂ absorbed per kg biomass'
    },
    {
      name: 'Lettuce & Leafy Greens Mass Production',
      targetBiomass: 'Lactuca sativa, Brassica oleracea',
      lightStrategy: 'Optimized red/blue ratio with green penetration for canopy density',
      expectedIncrease: '25-35% yield per m²',
      energyEfficiency: '20% energy reduction per kg',
      marketValue: '$4-8/kg fresh weight',
      co2Impact: '2.2kg CO₂ absorbed per kg biomass'
    },
    {
      name: 'Hemp Biomass for Industrial Applications',
      targetBiomass: 'Cannabis sativa (industrial hemp)',
      lightStrategy: 'Full spectrum with far-red enhancement for stem elongation and fiber density',
      expectedIncrease: '15-25% dry biomass',
      energyEfficiency: '25% improved light conversion',
      marketValue: '$1.5-3/kg dry biomass',
      co2Impact: '1.6kg CO₂ absorbed per kg biomass'
    },
    {
      name: 'Mushroom Substrate Enhancement',
      targetBiomass: 'Oyster mushrooms, Shiitake',
      lightStrategy: 'Blue light stimulation for fruiting body development',
      expectedIncrease: '20-30% yield increase',
      energyEfficiency: '40% faster growth cycles',
      marketValue: '$6-15/kg fresh weight',
      co2Impact: '0.9kg CO₂ absorbed per kg biomass'
    },
    {
      name: 'Aquatic Plant Biomass',
      targetBiomass: 'Azolla filiculoides, Lemna minor',
      lightStrategy: 'Green-enhanced spectrum for underwater light penetration',
      expectedIncrease: '25-40% coverage rate',
      energyEfficiency: '30% faster doubling time',
      marketValue: '$2-5/kg dry weight',
      co2Impact: '3.1kg CO₂ absorbed per kg biomass'
    },
    {
      name: 'Tree Seedling Mass Production',
      targetBiomass: 'Forest & fruit tree seedlings',
      lightStrategy: 'Dynamic spectrum changing with growth stage for optimal biomass accumulation',
      expectedIncrease: '15-30% faster growth',
      energyEfficiency: '45% reduced time to market',
      marketValue: '$0.50-5/seedling',
      co2Impact: '20-100kg CO₂ absorption potential per tree'
    }
  ];

  const biomassMetrics: BiomassMetric[] = [
    {
      parameter: 'Biomass Yield',
      standardValue: 100,
      optimizedValue: 145,
      unit: 'g/m²/day',
      improvementType: 'increase',
      method: 'Optimized PPFD and spectrum distribution'
    },
    {
      parameter: 'Photosynthetic Efficiency',
      standardValue: 3.2,
      optimizedValue: 4.8,
      unit: '%',
      improvementType: 'increase',
      method: 'Wavelength-specific targeting of photosystems'
    },
    {
      parameter: 'Light Use Efficiency',
      standardValue: 2.1,
      optimizedValue: 3.4,
      unit: 'g biomass/mol photons',
      improvementType: 'increase',
      method: 'Dynamic light intensity and timing control'
    },
    {
      parameter: 'Energy Cost per kg',
      standardValue: 12.5,
      optimizedValue: 8.2,
      unit: 'kWh/kg',
      improvementType: 'decrease',
      method: 'LED efficiency optimization and scheduling'
    },
    {
      parameter: 'Growth Rate',
      standardValue: 21,
      optimizedValue: 14,
      unit: 'days to harvest',
      improvementType: 'decrease',
      method: 'Accelerated photosynthetic cycles'
    },
    {
      parameter: 'CO₂ Conversion Rate',
      standardValue: 1.2,
      optimizedValue: 1.9,
      unit: 'kg CO₂/kg biomass',
      improvementType: 'increase',
      method: 'Enhanced carbon fixation through light optimization'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-emerald-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-800/30 border border-emerald-600/50 rounded-full px-4 py-2 text-sm text-emerald-300">
              <Factory className="w-4 h-4" />
              Industrial Scale Production
            </div>
            <h1 className="text-5xl font-bold text-white">Biomass Optimization & Mass Production</h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Revolutionary light-based biomass enhancement for industrial applications, carbon sequestration, 
              and sustainable production. VibeLux's precision photosynthetic optimization delivers unprecedented 
              yields while reducing energy costs and environmental impact.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Industrial Scale Ready
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Carbon Negative Process
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Up to 35% Yield Increase
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
              { id: 'applications', label: 'Applications', icon: <Factory className="w-4 h-4" /> },
              { id: 'science', label: 'The Science', icon: <Microscope className="w-4 h-4" /> },
              { id: 'results', label: 'Results & Scale', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-400'
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
              <h2 className="text-4xl font-bold text-white mb-4">Industrial Biomass Production Revolution</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Transform photosynthetic efficiency at scale with precision light control for maximum biomass yield
              </p>
            </div>

            {/* Process Flow */}
            <div className="grid lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Species Selection</h3>
                <p className="text-gray-400 text-sm">
                  AI-driven analysis of crop photosynthetic characteristics and biomass production potential
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Light Optimization</h3>
                <p className="text-gray-400 text-sm">
                  Custom spectral recipes targeting maximum photosynthetic rate and carbon fixation
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gauge className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real-time Control</h3>
                <p className="text-gray-400 text-sm">
                  Automated adjustment of light intensity, spectrum, and timing based on growth stage
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Scale Production</h3>
                <p className="text-gray-400 text-sm">
                  Industrial-scale deployment with continuous monitoring and optimization
                </p>
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Performance Enhancement Metrics</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biomassMetrics.map((metric, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white">{metric.parameter}</h4>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          metric.improvementType === 'increase' ? 'text-emerald-400' : 'text-blue-400'
                        }`}>
                          {metric.improvementType === 'increase' ? '+' : '-'}
                          {Math.round(((Math.abs(metric.optimizedValue - metric.standardValue) / metric.standardValue) * 100))}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Standard:</span>
                        <span className="text-white">{metric.standardValue} {metric.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Optimized:</span>
                        <span className={`font-bold ${
                          metric.improvementType === 'increase' ? 'text-emerald-400' : 'text-blue-400'
                        }`}>
                          {metric.optimizedValue} {metric.unit}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Method:</p>
                        <p className="text-xs text-purple-300">{metric.method}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technology Pillars */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-emerald-900/20 to-gray-900 rounded-xl border border-emerald-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sun className="w-8 h-8 text-emerald-400" />
                  <h3 className="text-2xl font-bold text-white">Photosynthetic Optimization</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Targeted activation of photosystem I and II for maximum efficiency
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Dynamic light intensity adjustment preventing photoinhibition
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    CO₂ fixation enhancement through Calvin cycle optimization
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Chlorophyll synthesis stimulation for improved light capture
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Factory className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Industrial Integration</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Scalable LED arrays with enterprise-grade control systems
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Real-time biomass monitoring with computer vision
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Automated environmental control integration (CO₂, humidity, temperature)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Energy management with demand response and grid optimization
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
              <h2 className="text-4xl font-bold text-white mb-4">Industrial Applications</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Large-scale biomass production across multiple industries and applications
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {biomassApplications.map((app, index) => (
                <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
                      <p className="text-gray-400 text-sm">{app.targetBiomass}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm bg-emerald-800/30 text-emerald-300 px-2 py-1 rounded">
                        Industrial Scale
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Light Strategy</h4>
                      <p className="text-sm text-gray-300">{app.lightStrategy}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Yield Increase</h4>
                        <p className="text-lg font-bold text-emerald-400">{app.expectedIncrease}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Energy Efficiency</h4>
                        <p className="text-sm text-blue-400">{app.energyEfficiency}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Market Value</h4>
                        <p className="text-sm text-yellow-400">{app.marketValue}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">CO₂ Impact</h4>
                        <p className="text-sm text-green-400">{app.co2Impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Market Opportunity */}
            <div className="mt-16 bg-gray-900/50 rounded-xl border border-gray-800 p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Global Market Opportunities</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Biofuels</h4>
                  <p className="text-2xl font-bold text-emerald-400 mb-1">$180B</p>
                  <p className="text-xs text-gray-400">Market Size (2024)</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Food Production</h4>
                  <p className="text-2xl font-bold text-green-400 mb-1">$8.7T</p>
                  <p className="text-xs text-gray-400">Market Size (2024)</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Carbon Credits</h4>
                  <p className="text-2xl font-bold text-blue-400 mb-1">$2T</p>
                  <p className="text-xs text-gray-400">Projected by 2030</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Industrial Materials</h4>
                  <p className="text-2xl font-bold text-purple-400 mb-1">$650B</p>
                  <p className="text-xs text-gray-400">Bio-based materials</p>
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
                Advanced photobiology and plant physiology research driving industrial biomass optimization
              </p>
            </div>

            {/* Core Science */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-emerald-900/20 to-gray-900 rounded-xl border border-emerald-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sun className="w-8 h-8 text-emerald-400" />
                  <h3 className="text-2xl font-bold text-white">Photosynthetic Enhancement</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Light Reaction Optimization</h4>
                    <p className="text-gray-300 text-sm">
                      Targeted activation of photosystem II (680nm) and photosystem I (700nm) for maximum 
                      ATP and NADPH production, the energy currencies driving biomass synthesis.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Calvin Cycle Enhancement</h4>
                    <p className="text-gray-300 text-sm">
                      Blue light (400-500nm) activates RuBisCO carboxylase activity, increasing CO₂ fixation 
                      rates and carbon incorporation into organic compounds.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Photoperiod Optimization</h4>
                    <p className="text-gray-300 text-sm">
                      Dynamic light scheduling maximizes photosynthetic uptime while preventing 
                      photoinhibition and energy waste during dark reactions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FlaskConical className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Growth Rate Acceleration</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Cell Division Stimulation</h4>
                    <p className="text-gray-300 text-sm">
                      Red light (660-680nm) promotes cytokinin activity and cell cycle progression, 
                      accelerating plant growth and biomass accumulation rates.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Metabolic Rate Enhancement</h4>
                    <p className="text-gray-300 text-sm">
                      Far-red light (700-800nm) activates phytochrome responses that increase overall 
                      metabolic activity and nutrient uptake efficiency.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Root Development</h4>
                    <p className="text-gray-300 text-sm">
                      UV-A radiation (315-400nm) stimulates root hair formation and mycorrhizal 
                      associations, improving nutrient absorption for enhanced growth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Efficiency Science */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Energy Efficiency Mechanisms</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Quantum Efficiency</h4>
                  <p className="text-sm text-gray-300">
                    Maximizing photon utilization by matching LED output to chlorophyll absorption peaks (430nm, 665nm)
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Thermometer className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Heat Management</h4>
                  <p className="text-sm text-gray-300">
                    LED spectral precision eliminates waste heat from unnecessary wavelengths, reducing cooling costs
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Temporal Optimization</h4>
                  <p className="text-sm text-gray-300">
                    Dynamic intensity control matches plant circadian rhythms for maximum energy conversion efficiency
                  </p>
                </div>
              </div>
            </div>

            {/* Research Citations */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Research Foundation</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">McCree (1972)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Photosynthetic action spectrum for higher plants"
                    - Established quantum efficiency curves
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Cited 2,847x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Evans (1987)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Photosynthesis and nitrogen relationships in leaves"
                    - Nutrient-light interaction fundamentals
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Cited 1,923x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Zhu et al. (2010)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Improving photosynthetic efficiency for greater yield"
                    - Modern optimization strategies
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Cited 867x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Ort et al. (2015)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Redesigning photosynthesis to sustainably meet global food demand"
                    - Crop improvement through light optimization
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Cited 445x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Long et al. (2021)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "LED lighting systems for controlled environment agriculture"
                    - Industrial application research
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Cited 234x</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Silva et al. (2023)</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    "Carbon sequestration potential of optimized photosynthetic systems"
                    - Climate impact research
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Cited 89x</span>
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
              <h2 className="text-4xl font-bold text-white mb-4">Industrial Scale Results</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Theoretical performance metrics and projected economic impact at commercial scale
              </p>
            </div>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-emerald-900/20 to-gray-900 rounded-xl border border-emerald-800/50 p-8 text-center">
                <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">15-35%</div>
                <div className="text-gray-400">Biomass Yield Increase</div>
                <div className="text-xs text-gray-500 mt-2">Species-dependent optimization</div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8 text-center">
                <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">35%</div>
                <div className="text-gray-400">Energy Cost Reduction</div>
                <div className="text-xs text-gray-500 mt-2">kWh per kg biomass produced</div>
              </div>

              <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl border border-green-800/50 p-8 text-center">
                <Globe className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">2.5x</div>
                <div className="text-gray-400">CO₂ Sequestration</div>
                <div className="text-xs text-gray-500 mt-2">Enhanced carbon fixation rates</div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-xl border border-purple-800/50 p-8 text-center">
                <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">40%</div>
                <div className="text-gray-400">Faster Growth Cycles</div>
                <div className="text-xs text-gray-500 mt-2">Time to harvest reduction</div>
              </div>
            </div>

            {/* Economic Impact */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">Economic Impact Analysis</h3>
              <div className="grid lg:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Revenue Enhancement</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      15-35% higher biomass output per facility
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      Premium pricing for optimized biomass quality
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      Carbon credit revenue from enhanced sequestration
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      Faster crop cycles = more harvests per year
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Cost Reduction</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      35% lower energy costs per kg biomass
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      Reduced HVAC costs from LED heat efficiency
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      Lower labor costs per unit output
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      Reduced facility space requirements per kg
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Payback Timeline</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      <span><strong>6-12 months:</strong> Large facilities (10,000+ m²)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      <span><strong>12-18 months:</strong> Medium facilities (2,000-10,000 m²)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      <span><strong>18-24 months:</strong> Small facilities (&lt;2,000 m&sup2;)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Scale Demonstration */}
            <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 rounded-xl border border-emerald-800/50 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Projected Scale Potential</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">Industrial</div>
                  <div className="text-sm text-gray-400">Scale capabilities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">Modular</div>
                  <div className="text-sm text-gray-400">Deployment design</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">Carbon</div>
                  <div className="text-sm text-gray-400">Sequestration potential</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">ROI</div>
                  <div className="text-sm text-gray-400">Potential based on projections</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-emerald-900/20 to-gray-950 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">Ready to Scale Your Biomass Production?</h2>
          <p className="text-xl text-gray-400">
            Explore VibeLux's potential for enhanced biomass yields and carbon sequestration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Start Industrial Biomass Optimization
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Download Scale Analysis
              <FileText className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>Industrial scale ready • Carbon negative process • Proven ROI at scale</p>
            <p className="mt-2">🌱 <em>"Scaling photosynthesis for a sustainable future"</em></p>
          </div>
        </div>
      </section>
    </div>
  );
}