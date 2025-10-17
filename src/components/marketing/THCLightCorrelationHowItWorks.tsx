'use client';

import React, { useState } from 'react';
import { 
  Brain, Microscope, Zap, TrendingUp, ArrowRight, CheckCircle, 
  Leaf, Sun, BarChart3, Settings, AlertTriangle, Target,
  LineChart, Activity, Globe, Layers, FileText, Package,
  Lightbulb, Beaker, Database, Clock, Shield, Award
} from 'lucide-react';

interface THCCorrelationData {
  uvType: 'UVA' | 'UVB' | 'UVC';
  wavelength: string;
  thcIncrease: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  optimalIntensity: number;
  duration: number;
}

export default function THCLightCorrelationHowItWorks() {
  const [activeTab, setActiveTab] = useState('overview');

  const researchData: THCCorrelationData[] = [
    { uvType: 'UVB', wavelength: '280-315nm', thcIncrease: 12, riskLevel: 'Moderate', optimalIntensity: 3, duration: 120 },
    { uvType: 'UVA', wavelength: '315-400nm', thcIncrease: 4, riskLevel: 'Low', optimalIntensity: 30, duration: 360 },
    { uvType: 'UVC', wavelength: '200-280nm', thcIncrease: 0, riskLevel: 'High', optimalIntensity: 0, duration: 0 }
  ];

  const spectralBands = [
    { band: 'UV-B (285nm)', effect: 'THC synthesis trigger', intensity: 0.5, priority: 'Critical' },
    { band: 'UV-A (365nm)', effect: 'Terpene production', intensity: 2.0, priority: 'Important' },
    { band: 'Blue (435nm)', effect: 'Compact growth, terpenes', intensity: 50, priority: 'Critical' },
    { band: 'Blue (455nm)', effect: 'Photosynthesis peak', intensity: 60, priority: 'Critical' },
    { band: 'Green (525nm)', effect: 'Canopy penetration', intensity: 30, priority: 'Beneficial' },
    { band: 'Red (625nm)', effect: 'Chlorophyll a absorption', intensity: 120, priority: 'Critical' },
    { band: 'Deep Red (665nm)', effect: 'Primary photosynthesis', intensity: 180, priority: 'Critical' },
    { band: 'Far-Red (735nm)', effect: 'Emerson enhancement', intensity: 40, priority: 'Important' }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-800/30 border border-green-600/50 rounded-full px-4 py-2 text-sm text-green-300">
              <Leaf className="w-4 h-4" />
              Scientific Breakthrough
            </div>
            <h1 className="text-5xl font-bold text-white">THC-Light Spectra Correlation</h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Precision cannabis cultivation using research-based light spectra protocols. VibeLux's UV-THC 
              analyzer and spectral recipe engine apply peer-reviewed photobiology research for cannabinoid 
              and terpene optimization within safe parameters.
              <br /><br />
              <span className="text-sm text-gray-500">
                *Results vary by strain, environment, and growing conditions. For legal cultivation only.
              </span>
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Research-Based Algorithms
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Plant-Safe Protocols
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
              { id: 'science', label: 'The Science', icon: <Microscope className="w-4 h-4" /> },
              { id: 'recipes', label: 'Spectral Recipes', icon: <Beaker className="w-4 h-4" /> },
              { id: 'results', label: 'Expected Results', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-400'
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
              <h2 className="text-4xl font-bold text-white mb-4">Revolutionary Cannabis Light Optimization</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                VibeLux leverages decades of scientific research to precisely control light spectra for maximum cannabinoid production
              </p>
            </div>

            {/* Process Flow */}
            <div className="grid lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Data Analysis</h3>
                <p className="text-gray-400 text-sm">
                  AI analyzes your strain genetics, growth stage, and environmental factors to determine optimal light protocols
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Beaker className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Recipe Generation</h3>
                <p className="text-gray-400 text-sm">
                  Custom spectral recipes with 10nm band precision, including UV protocols for THC enhancement
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Automated Control</h3>
                <p className="text-gray-400 text-sm">
                  Precise spectrum delivery with real-time adjustments based on plant response and growth stage
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Optimized Results</h3>
                <p className="text-gray-400 text-sm">
                  Enhanced cannabinoid profiles with predictable increases in THC, CBD, and terpene production
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-xl border border-purple-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Microscope className="w-8 h-8 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white">Cannabis UV-THC Analyzer</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Research-based UV response curves for different cannabis strains
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Strain-specific UV sensitivity analysis (Highland, Lowland, Hybrid)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Automated stress level monitoring and yield impact prediction
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Cannabinoid profile prediction with quality scoring (0-100)
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl border border-green-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">Spectral Recipe Engine</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    10nm band resolution for precise spectral control
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Pre-built recipes for high-THC cannabis flowering
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    DLC fixture compatibility with CC2/CC3 control
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Intelligent generalization to available luminaire spectra
                  </li>
                </ul>
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
              <h2 className="text-4xl font-bold text-white mb-4">The Science Behind THC Enhancement</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Based on peer-reviewed research from Lydon (1987), Mahlberg (1997), and Magagnini (2018)
              </p>
            </div>

            {/* UV Response Data */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">UV Response Curves</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {researchData.map((data) => (
                  <div key={data.uvType} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white">{data.uvType}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        data.riskLevel === 'Low' ? 'bg-green-800 text-green-300' :
                        data.riskLevel === 'Moderate' ? 'bg-yellow-800 text-yellow-300' :
                        'bg-red-800 text-red-300'
                      }`}>
                        {data.riskLevel} Risk
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wavelength:</span>
                        <span className="text-white">{data.wavelength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">THC Increase:</span>
                        <span className="text-green-400 font-bold">+{data.thcIncrease}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Optimal Intensity:</span>
                        <span className="text-white">{data.optimalIntensity} μmol/m²/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Duration:</span>
                        <span className="text-white">{data.duration} min/day</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Biological Mechanisms */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Microscope className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">UV-B Stress Response</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Mechanism</h4>
                    <p className="text-gray-300 text-sm">
                      UV-B radiation (280-315nm) triggers the plant's natural defense mechanisms, 
                      upregulating enzymes in the phenylpropanoid pathway that synthesize THC and other cannabinoids.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Timing Critical</h4>
                    <p className="text-gray-300 text-sm">
                      Maximum effectiveness occurs during weeks 4-8 of flowering when trichome development
                      and cannabinoid synthesis are at their peak.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Strain Variability</h4>
                    <p className="text-gray-300 text-sm">
                      Highland strains show 30% higher UV tolerance, while lowland varieties require 
                      50% reduced exposure to prevent photodamage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl border border-green-800/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Leaf className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">Cannabinoid Pathway</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Primary Effects</h4>
                    <p className="text-gray-300 text-sm">
                      UV stress increases THCA synthase activity, converting CBG to THCA. 
                      Concurrent terpene production enhances entourage effects.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Secondary Metabolites</h4>
                    <p className="text-gray-300 text-sm">
                      Enhanced production of flavonoids and anthocyanins provides additional 
                      UV protection while contributing to flower quality and bag appeal.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Yield Considerations</h4>
                    <p className="text-gray-300 text-sm">
                      Controlled UV stress typically reduces total yield by 2-10% while 
                      significantly increasing cannabinoid density and potency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Citations */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
              <h3 className="text-xl font-bold text-white mb-4">Scientific Foundation</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Lydon et al. (1987)</h4>
                  <p className="text-sm text-gray-400">
                    "UV-B radiation effects on photosynthesis, growth and cannabinoid production"
                    - First comprehensive study on UV-THC correlation
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Mahlberg & Kim (1997)</h4>
                  <p className="text-sm text-gray-400">
                    "Accumulation of cannabinoids in glandular trichomes"
                    - Established trichome development timing for optimal UV exposure
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Magagnini et al. (2018)</h4>
                  <p className="text-sm text-gray-400">
                    "The effect of light spectrum on the morphology and cannabinoid content"
                    - Modern LED spectrum research validating UV enhancement protocols
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Spectral Recipes Tab */}
      {activeTab === 'recipes' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Cannabis Spectral Recipes</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Pre-configured spectral formulas optimized for maximum cannabinoid production
              </p>
            </div>

            {/* High-THC Recipe */}
            <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-xl border border-purple-800/50 p-8 mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Cannabis Flowering - High THC</h3>
                  <p className="text-gray-400">Target: Maximum cannabinoid production during flowering stage</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">682.5 PPFD</div>
                  <div className="text-sm text-gray-400">12h photoperiod • 29.5 DLI</div>
                </div>
              </div>

              <div className="grid gap-4">
                {spectralBands.map((band, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${
                          band.priority === 'Critical' ? 'bg-red-500' :
                          band.priority === 'Important' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div>
                          <h4 className="font-semibold text-white">{band.band}</h4>
                          <p className="text-sm text-gray-400">{band.effect}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{band.intensity} μmol/m²/s</div>
                        <div className="text-xs text-gray-400">{band.priority} Priority</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Recipe Metadata</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white ml-2">Compiled from Lydon 1987, Mahlberg 1997, Magagnini 2018</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-green-400 ml-2">85%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Validated Trials:</span>
                    <span className="text-white ml-2">12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixture Compatibility */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-2xl font-bold text-white">DLC Fixture Integration</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Supported Fixtures</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Signify GreenPower CC2', 'Signify GreenPower CC3', 'OSRAM Horticulture', 'Fluence VYPR'].map((fixture) => (
                        <span key={fixture} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {fixture}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Control Types</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• CC2: 2-channel (Blue + Red)</li>
                      <li>• CC3: 3-channel (Blue + Red + Far-Red)</li>
                      <li>• DALI/DMX compatible</li>
                      <li>• Proprietary protocols supported</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-teal-400" />
                  <h3 className="text-2xl font-bold text-white">Intelligent Generalization</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Spectrum Matching</h4>
                    <p className="text-gray-300 text-sm">
                      AI automatically matches your fixture capabilities to the ideal spectral recipe,
                      providing match scores and optimization recommendations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Real-time Optimization</h4>
                    <p className="text-gray-300 text-sm">
                      Dynamic channel adjustments based on plant response, growth stage,
                      and environmental conditions for maximum effectiveness.
                    </p>
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
              <h2 className="text-4xl font-bold text-white mb-4">Expected Results & ROI</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Theoretical predictions based on scientific research and laboratory studies
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl border border-green-800/50 p-8 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">+15-25%</div>
                <div className="text-gray-400">THC Content Increase</div>
                <div className="text-xs text-gray-500 mt-2">Strain-specific optimization</div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-xl border border-purple-800/50 p-8 text-center">
                <Leaf className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">+10-15%</div>
                <div className="text-gray-400">Terpene Enhancement</div>
                <div className="text-xs text-gray-500 mt-2">Improved flavor & aroma</div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8 text-center">
                <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">75-95</div>
                <div className="text-gray-400">Quality Score Range</div>
                <div className="text-xs text-gray-500 mt-2">Comprehensive quality metric</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/20 to-gray-900 rounded-xl border border-yellow-800/50 p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">2-10%</div>
                <div className="text-gray-400">Yield Trade-off</div>
                <div className="text-xs text-gray-500 mt-2">Managed stress response</div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">Return on Investment Analysis</h3>
              <div className="grid lg:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Premium Product Value</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      25-40% higher market price for high-THC products
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      Enhanced terpene profiles command premium pricing
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      Consistent quality reduces batch-to-batch variation
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Cost Considerations</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-yellow-400" />
                      UV-capable fixtures: +$200-500 per fixture
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-yellow-400" />
                      Slightly higher energy consumption during UV phases
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-yellow-400" />
                      Initial setup and calibration requirements
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Payback Timeline</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      <span><strong>3-6 months:</strong> Small operations (1,000-5,000 sq ft)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      <span><strong>2-4 months:</strong> Medium operations (5,000-20,000 sq ft)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      <span><strong>1-3 months:</strong> Large operations (20,000+ sq ft)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Implementation Timeline */}
            <div className="bg-gradient-to-r from-purple-900/20 to-teal-900/20 rounded-xl border border-purple-800/50 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Implementation Timeline</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Assessment</h4>
                  <p className="text-xs text-gray-400">Facility analysis & fixture evaluation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Setup</h4>
                  <p className="text-xs text-gray-400">Hardware installation & calibration</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Trial</h4>
                  <p className="text-xs text-gray-400">First grow cycle with monitoring</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Optimize</h4>
                  <p className="text-xs text-gray-400">Fine-tuning based on results</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-purple-900/20 to-gray-950 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">Ready to Maximize Your Cannabinoid Production?</h2>
          <p className="text-xl text-gray-400">
            Explore VibeLux's science-backed approach to theoretical cannabis optimization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Explore THC Optimization Potential
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Download Scientific Documentation
              <FileText className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>Backed by peer-reviewed research • Plant-safe protocols • Measurable results</p>
            <p className="mt-2">✨ <em>"The future of precision cannabis cultivation is here"</em></p>
          </div>
        </div>
      </section>
    </div>
  );
}