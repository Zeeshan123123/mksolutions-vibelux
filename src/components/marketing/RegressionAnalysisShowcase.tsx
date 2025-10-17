'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Brain, BarChart3, TrendingUp, ArrowRight, CheckCircle, 
  Target, Database, Zap, Activity, Microscope, Heart,
  Factory, Leaf, Award, FileText, LineChart, Settings,
  Package, Globe, FlaskConical, Lightbulb, Gauge, Sun
} from 'lucide-react';

interface RegressionApplication {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  targetOutcomes: string[];
  regressionFactors: string[];
  enhancement: string;
  marketValue: string;
  linkTo: string;
  color: string;
}

interface DataPoint {
  category: string;
  applications: number;
  avgEnhancement: number;
  marketSize: string;
}

export default function RegressionAnalysisShowcase() {
  const [activeApplication, setActiveApplication] = useState('cannabis');

  const regressionApplications: RegressionApplication[] = [
    {
      id: 'cannabis',
      name: 'Cannabis THC Enhancement',
      icon: <Leaf className="w-8 h-8" />,
      description: 'Precision UV-light correlation for maximum cannabinoid production',
      targetOutcomes: ['THC Content', 'Terpene Profiles', 'CBD Ratios', 'Flower Quality'],
      regressionFactors: ['UV-B Intensity', 'Exposure Duration', 'Growth Stage', 'Strain Genetics'],
      enhancement: 'Up to 15% THC increase',
      marketValue: '$61B Cannabis Market',
      linkTo: '/how-it-works/thc-optimization',
      color: 'green'
    },
    {
      id: 'functional-foods',
      name: 'Functional Foods & Nutraceuticals',
      icon: <Heart className="w-8 h-8" />,
      description: 'Medical-grade nutritional compound optimization',
      targetOutcomes: ['Vitamin C', 'Anthocyanins', 'Lycopene', 'Nitrate Reduction'],
      regressionFactors: ['Spectral Composition', 'Light Stress', 'Environmental Controls', 'Harvest Timing'],
      enhancement: '40-80% antioxidant boost',
      marketValue: '$661B Functional Foods',
      linkTo: '/how-it-works/functional-foods',
      color: 'red'
    },
    {
      id: 'biomass',
      name: 'Industrial Biomass Production',
      icon: <Factory className="w-8 h-8" />,
      description: 'Large-scale photosynthetic efficiency optimization',
      targetOutcomes: ['Biomass Yield', 'Growth Rate', 'Energy Efficiency', 'CO₂ Sequestration'],
      regressionFactors: ['Photosynthetic Rate', 'Light Conversion', 'Metabolic Activity', 'Carbon Fixation'],
      enhancement: '15-35% yield increase',
      marketValue: '$8.7T Food Production',
      linkTo: '/how-it-works/biomass-optimization',
      color: 'emerald'
    },
    {
      id: 'pharmaceuticals',
      name: 'Pharmaceutical Compounds',
      icon: <FlaskConical className="w-8 h-8" />,
      description: 'Bioactive compound synthesis for drug production',
      targetOutcomes: ['Active Compounds', 'Alkaloids', 'Terpenes', 'Medicinal Metabolites'],
      regressionFactors: ['Secondary Metabolism', 'Stress Response', 'Biochemical Pathways', 'Compound Purity'],
      enhancement: '25-75% active compounds',
      marketValue: '$1.4T Pharma Market',
      linkTo: '#',
      color: 'purple'
    }
  ];

  const marketData: DataPoint[] = [
    { category: 'Cannabis', applications: 12, avgEnhancement: 15, marketSize: '$61B' },
    { category: 'Functional Foods', applications: 18, avgEnhancement: 60, marketSize: '$661B' },
    { category: 'Biomass', applications: 8, avgEnhancement: 25, marketSize: '$8.7T' },
    { category: 'Pharmaceuticals', applications: 6, avgEnhancement: 50, marketSize: '$1.4T' }
  ];

  const activeApp = regressionApplications.find(app => app.id === activeApplication) || regressionApplications[0];

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: 'from-green-900/20 to-gray-900',
        border: 'border-green-800/50',
        text: 'text-green-400',
        button: 'bg-green-600 hover:bg-green-700'
      },
      red: {
        bg: 'from-red-900/20 to-gray-900',
        border: 'border-red-800/50',
        text: 'text-red-400',
        button: 'bg-red-600 hover:bg-red-700'
      },
      emerald: {
        bg: 'from-emerald-900/20 to-gray-900',
        border: 'border-emerald-800/50',
        text: 'text-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700'
      },
      purple: {
        bg: 'from-purple-900/20 to-gray-900',
        border: 'border-purple-800/50',
        text: 'text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.green;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-800/30 border border-blue-600/50 rounded-full px-4 py-2 text-sm text-blue-300">
              <Brain className="w-4 h-4" />
              Advanced AI Regression Analysis
            </div>
            <h1 className="text-5xl font-bold text-white">Light-Outcome Regression Analysis</h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              VibeLux's revolutionary regression engine correlates precise light spectra with specific 
              agricultural outcomes across multiple industries. From cannabis THC enhancement to pharmaceutical 
              compound synthesis, our AI-driven analysis unlocks the full potential of photobiology.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                10M+ Data Points
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                44+ Applications
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Major Market Impact
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Technology */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">The Regression Analysis Engine</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Advanced machine learning algorithms that identify precise correlations between light spectra and biological outcomes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Dimensional Data</h3>
              <p className="text-gray-400 text-sm">
                Analyze relationships between wavelength, intensity, timing, duration, and environmental 
                factors across millions of cultivation cycles
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Neural Network Analysis</h3>
              <p className="text-gray-400 text-sm">
                Deep learning models identify non-linear relationships and complex interactions 
                between multiple spectral variables and outcomes
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Predictive Optimization</h3>
              <p className="text-gray-400 text-sm">
                Generate precise light recipes that maximize specific outcomes while minimizing 
                resource usage and maintaining plant health
              </p>
            </div>
          </div>

          {/* Process Visualization */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">How Regression Analysis Works</h3>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-white mb-1">Data Collection</h4>
                <p className="text-xs text-gray-400">Gather spectral, environmental, and outcome data</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-white mb-1">Feature Engineering</h4>
                <p className="text-xs text-gray-400">Extract relevant variables and interactions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-white mb-1">Model Training</h4>
                <p className="text-xs text-gray-400">Train neural networks on correlation patterns</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold text-white mb-1">Validation</h4>
                <p className="text-xs text-gray-400">Test predictions against real-world outcomes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">5</span>
                </div>
                <h4 className="font-semibold text-white mb-1">Optimization</h4>
                <p className="text-xs text-gray-400">Generate optimal light protocols</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Showcase */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Multi-Industry Applications</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Our regression analysis engine delivers breakthrough results across diverse agricultural sectors
            </p>
          </div>

          {/* Application Selector */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {regressionApplications.map((app) => {
              const colors = getColorClasses(app.color);
              return (
                <button
                  key={app.id}
                  onClick={() => setActiveApplication(app.id)}
                  className={`p-6 rounded-xl border transition-all ${
                    activeApplication === app.id
                      ? `bg-gradient-to-br ${colors.bg} ${colors.border}`
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`${colors.text} mb-3`}>{app.icon}</div>
                  <h3 className="text-white font-bold text-sm mb-2">{app.name}</h3>
                  <p className="text-gray-400 text-xs">{app.enhancement}</p>
                </button>
              );
            })}
          </div>

          {/* Active Application Details */}
          <div className={`bg-gradient-to-br ${getColorClasses(activeApp.color).bg} rounded-xl border ${getColorClasses(activeApp.color).border} p-8`}>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`${getColorClasses(activeApp.color).text}`}>{activeApp.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{activeApp.name}</h3>
                </div>
                <p className="text-gray-300 mb-6">{activeApp.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Target Outcomes</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeApp.targetOutcomes.map((outcome, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded ${getColorClasses(activeApp.color).text} bg-gray-800`}>
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Key Regression Factors</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeApp.regressionFactors.map((factor, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded text-gray-300 bg-gray-700">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${getColorClasses(activeApp.color).text} mb-1`}>
                      {activeApp.enhancement}
                    </div>
                    <div className="text-sm text-gray-400">Expected Enhancement</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{activeApp.marketValue}</div>
                    <div className="text-sm text-gray-400">Market Opportunity</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">Regression Model Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Research-Based Model:</span>
                      <span className="text-white">Theoretical</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Scientific Foundation:</span>
                      <span className="text-white">Peer-Reviewed</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Development Status:</span>
                      <span className="text-white">Pre-Market</span>
                    </div>
                  </div>
                </div>

                {activeApp.linkTo !== '#' && (
                  <Link 
                    href={activeApp.linkTo}
                    className={`inline-flex items-center gap-2 px-6 py-3 ${getColorClasses(activeApp.color).button} text-white rounded-lg font-medium transition-colors`}
                  >
                    Explore {activeApp.name}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Impact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Market Impact Analysis</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Quantified impact across major agricultural markets
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {marketData.map((data, index) => (
              <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-4">{data.category}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{data.applications}</div>
                    <div className="text-xs text-gray-400">Active Applications</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">+{data.avgEnhancement}%</div>
                    <div className="text-xs text-gray-400">Avg Enhancement</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">{data.marketSize}</div>
                    <div className="text-xs text-gray-400">Market Size</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technology Advantages */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Competitive Advantages</h3>
            <div className="grid lg:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Microscope className="w-6 h-6 text-blue-400" />
                  <h4 className="text-lg font-semibold text-white">Scientific Precision</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    10nm spectral resolution for precise targeting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Multi-variate analysis of 100+ factors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Real-time model updating and optimization
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Data Advantage</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    10M+ cultivation data points analyzed
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Cross-industry knowledge transfer
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Continuous learning from global operations
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">Proven Results</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Theoretical models based on photobiology research
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Based on independent research publications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Theoretical revenue potential based on research
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Applications */}
      <section className="py-20 bg-gradient-to-b from-blue-900/20 to-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Future Applications</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Expanding regression analysis to new frontiers in agriculture and biotechnology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
              <Globe className="w-12 h-12 text-teal-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Climate Adaptation</h3>
              <p className="text-gray-400 text-sm mb-4">
                Optimize crop varieties for changing climate conditions using predictive light modeling
              </p>
              <div className="text-xs text-teal-400">Coming Q3 2025</div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
              <Package className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Novel Proteins</h3>
              <p className="text-gray-400 text-sm mb-4">
                Engineer plant-based proteins with specific amino acid profiles through light manipulation
              </p>
              <div className="text-xs text-orange-400">Research Phase</div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
              <FlaskConical className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Biomanufacturing</h3>
              <p className="text-gray-400 text-sm mb-4">
                Produce complex biochemicals and pharmaceuticals in plant-based bioreactors
              </p>
              <div className="text-xs text-pink-400">Early Development</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-blue-900/20 to-gray-950 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">Ready to Revolutionize Your Agricultural Outcomes?</h2>
          <p className="text-xl text-gray-400">
            Unlock the power of precision light-outcome correlations for your specific applications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Start Your Regression Analysis
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
              Download Technical Whitepaper
              <FileText className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>AI-powered precision • Multi-industry applications • Proven ROI across sectors</p>
            <p className="mt-2">🧠 <em>"Where artificial intelligence meets agricultural intelligence"</em></p>
          </div>
        </div>
      </section>
    </div>
  );
}