'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Atom, Brain, Dna, Cpu, Camera, Cloud, Link2, Activity,
  FlaskConical, Microscope, Gauge, Layers, Shield, Zap,
  TrendingUp, Package, Globe, BarChart3, Eye, Sparkles,
  Binary, Beaker, Satellite, Waves, Fingerprint, Workflow
} from 'lucide-react';

const comprehensiveFeatures = [
  {
    title: '🧬 Quantum Biotechnology & Advanced Science',
    description: 'Research-grade quantum biology and advanced photobiology systems',
    icon: Atom,
    color: 'from-violet-500 to-purple-600',
    badge: 'ADVANCED',
    features: [
      {
        name: 'Quantum Biotechnology Optimization',
        description: 'Quantum-level photosynthesis optimization using advanced physics models',
        href: '/quantum-biotechnology',
        highlights: ['Quantum yield calculations', 'Photon flux optimization', 'Electron transport modeling', 'Quantum coherence analysis']
      },
      {
        name: 'Farquhar Photosynthesis Calculator',
        description: 'Academic-grade photosynthesis modeling based on the Farquhar-von Caemmerer-Berry model',
        href: '/unified-dashboard',
        highlights: ['C3/C4 photosynthesis modeling', 'Rubisco kinetics', 'CO2 assimilation rates', 'Temperature response curves']
      },
      {
        name: 'Chlorophyll Fluorescence Tracking',
        description: 'PAM fluorometry integration for real-time photosystem health monitoring',
        href: '/unified-dashboard',
        highlights: ['Fv/Fm measurements', 'NPQ analysis', 'ETR calculations', 'Stress detection']
      },
      {
        name: 'Photomorphogenesis Simulator',
        description: 'Advanced light-driven morphological development modeling',
        href: '/unified-dashboard',
        highlights: ['Phytochrome responses', 'Cryptochrome modeling', 'Shade avoidance', 'Photoperiodism control']
      }
    ]
  },
  {
    title: '📸 Hyperspectral Imaging & Computer Vision',
    description: 'Advanced imaging systems for plant phenotyping and stress detection',
    icon: Camera,
    color: 'from-emerald-500 to-teal-600',
    badge: 'ENTERPRISE',
    features: [
      {
        name: 'Hyperspectral Analysis Platform',
        description: 'Multi-band spectral imaging for early disease and nutrient detection',
        href: '/hyperspectral',
        highlights: ['400-1000nm spectral range', 'Disease signature detection', 'Nutrient mapping', 'Water stress imaging']
      },
      {
        name: 'Trichome Density Analyzer',
        description: 'Computer vision for automated trichome counting and maturity analysis',
        href: '/unified-dashboard',
        highlights: ['AI trichome detection', 'Maturity scoring', 'Harvest timing', 'Quality prediction']
      },
      {
        name: 'Biomass 3D Visualizer',
        description: 'Real-time 3D biomass accumulation modeling and visualization',
        href: '/unified-dashboard',
        highlights: ['3D growth modeling', 'Canopy structure analysis', 'Light interception', 'Yield forecasting']
      },
      {
        name: 'Tissue Analysis Optimization',
        description: 'Advanced plant tissue analysis with ML-powered recommendations',
        href: '/unified-dashboard',
        highlights: ['Nutrient profiling', 'Deficiency detection', 'Optimization algorithms', 'Historical tracking']
      }
    ]
  },
  {
    title: 'Machine Learning & AI Systems',
    description: 'Self-learning algorithms and predictive analytics powered by Claude 4',
    icon: Brain,
    color: 'from-blue-500 to-indigo-600',
    badge: 'AI-POWERED',
    features: [
      {
        name: 'Reinforcement Learning Dashboard',
        description: 'Self-optimizing cultivation algorithms that improve over time',
        href: '/unified-dashboard',
        highlights: ['Q-learning algorithms', 'Policy optimization', 'Reward modeling', 'Continuous improvement']
      },
      {
        name: 'ML Model Training Interface',
        description: 'Train custom models on your facility data for personalized optimization',
        href: '/unified-dashboard',
        highlights: ['Custom model training', 'Data pipeline management', 'Model versioning', 'A/B testing']
      },
      {
        name: 'Disease Prediction System',
        description: 'AI-powered disease forecasting with 3-7 day advance warning',
        href: '/disease-prediction',
        highlights: ['Multi-pathogen detection', 'Environmental correlation', 'Treatment recommendations', 'Outbreak prevention']
      },
      {
        name: 'Claude Analytics Insights',
        description: 'Natural language analytics powered by Claude 4 Sonnet',
        href: '/unified-dashboard',
        highlights: ['Ask questions in English', 'Automated insights', 'Anomaly explanations', 'Action recommendations']
      }
    ]
  },
  {
    title: '⛓️ Blockchain & Carbon Credits',
    description: 'Transparent supply chain and carbon credit trading on-chain',
    icon: Link2,
    color: 'from-yellow-500 to-orange-600',
    badge: 'WEB3',
    features: [
      {
        name: 'Blockchain Carbon Credits',
        description: 'Trade and track carbon credits with blockchain transparency',
        href: '/carbon-credits',
        highlights: ['Automated credit generation', 'Smart contract trading', 'Verified emissions', 'Market integration']
      },
      {
        name: 'Supply Chain Traceability',
        description: 'Seed-to-sale blockchain tracking for compliance and transparency',
        href: '/unified-dashboard',
        highlights: ['Immutable records', 'QR code tracking', 'Consumer transparency', 'Regulatory compliance']
      },
      {
        name: 'ESG Reporting Platform',
        description: 'Automated environmental, social, and governance reporting',
        href: '/api/esg/emissions',
        highlights: ['Carbon footprint tracking', 'Water usage reports', 'Energy efficiency metrics', 'Sustainability scores']
      }
    ]
  },
  {
    title: 'GPU Acceleration & Ray Tracing',
    description: 'High-performance computing for real-time light simulation',
    icon: Cpu,
    color: 'from-red-500 to-pink-600',
    badge: 'GPU',
    features: [
      {
        name: 'GPU Ray Tracing Engine',
        description: 'Real-time photorealistic light simulation with GPU acceleration',
        href: '/gpu-raytracing',
        highlights: ['CUDA acceleration', 'Real-time rendering', 'Photon mapping', 'Caustics simulation']
      },
      {
        name: 'Monte Carlo Light Simulation',
        description: 'Statistical light distribution modeling for optimal fixture placement',
        href: '/unified-dashboard',
        highlights: ['Probabilistic modeling', 'Variance reduction', 'Convergence analysis', 'Uncertainty quantification']
      },
      {
        name: 'WebGL 3D Visualization',
        description: 'Browser-based 3D facility visualization with real-time updates',
        href: '/unified-dashboard',
        highlights: ['No plugins required', 'Real-time shadows', 'Interactive controls', 'Mobile compatible']
      },
      {
        name: 'Digital Twin Simulator',
        description: 'Complete virtual facility replica for testing and optimization',
        href: '/unified-dashboard',
        highlights: ['Physics simulation', 'What-if scenarios', 'Risk-free testing', 'Predictive maintenance']
      }
    ]
  },
  {
    title: 'Advanced Plant Science',
    description: 'Research-grade tools for plant physiology and optimization',
    icon: Dna,
    color: 'from-green-500 to-lime-600',
    badge: 'RESEARCH',
    features: [
      {
        name: 'Circadian Rhythm Manager',
        description: 'Optimize plant circadian cycles for maximum productivity',
        href: '/unified-dashboard',
        highlights: ['Clock gene expression', 'Photoperiod optimization', 'Seasonal adjustments', 'Chronobiology']
      },
      {
        name: 'Photobleaching Prevention',
        description: 'AI-powered system to prevent light damage in sensitive crops',
        href: '/unified-dashboard',
        highlights: ['Real-time monitoring', 'Predictive alerts', 'Spectrum adjustment', 'Damage prevention']
      },
      {
        name: 'Phytocannabinoid Tracker',
        description: 'Track and optimize cannabinoid production throughout growth',
        href: '/unified-dashboard',
        highlights: ['THC/CBD tracking', 'Terpene profiles', 'Harvest optimization', 'Quality prediction']
      },
      {
        name: 'Tissue Culture Optimization',
        description: 'Advanced protocols for plant tissue culture and micropropagation',
        href: '/unified-dashboard',
        highlights: ['Protocol library', 'Success rate tracking', 'Contamination prevention', 'Clone management']
      }
    ]
  },
  {
    title: 'Energy & Weather Intelligence',
    description: 'Advanced energy optimization with real-time weather integration',
    icon: Zap,
    color: 'from-amber-500 to-yellow-600',
    badge: 'SAVES 40%',
    features: [
      {
        name: 'Weather-Aware Energy Optimization',
        description: 'AI adjusts energy usage based on weather forecasts and grid pricing',
        href: '/energy-optimization',
        highlights: ['NOAA integration', 'Grid price forecasting', 'HVAC optimization', 'Natural ventilation']
      },
      {
        name: 'Peak Hour Spectrum Optimizer',
        description: 'Shift spectrum during expensive hours without affecting DLI',
        href: '/unified-dashboard',
        highlights: ['Deep red efficiency mode', 'Grid demand response', 'Cost reduction', 'DLI maintenance']
      },
      {
        name: 'Energy Market Integration',
        description: 'Real-time energy trading and demand response participation',
        href: '/unified-dashboard',
        highlights: ['Market price feeds', 'Automated trading', 'DR event participation', 'Revenue generation']
      },
      {
        name: 'CHP Decision Engine',
        description: 'Combined heat and power optimization for maximum efficiency',
        href: '/energy-optimization',
        highlights: ['Heat recovery', 'CO2 capture', 'Economic optimization', 'Grid independence']
      }
    ]
  },
  {
    title: '📡 IoT & Sensor Networks',
    description: 'Advanced sensor integration and wireless monitoring systems',
    icon: Satellite,
    color: 'from-cyan-500 to-blue-600',
    badge: 'IOT',
    features: [
      {
        name: 'Virtual Sensor Grid',
        description: 'AI-powered virtual sensors fill gaps in physical sensor coverage',
        href: '/unified-dashboard',
        highlights: ['Sensor fusion', 'Gap filling', 'Predictive sensing', 'Cost reduction']
      },
      {
        name: 'BLE Asset Tracking',
        description: 'Bluetooth Low Energy tracking for equipment and personnel',
        href: '/api/ble',
        highlights: ['Real-time location', 'Asset management', 'Safety monitoring', 'Theft prevention']
      },
      {
        name: 'Fluorescence Sensors',
        description: 'Integration with PAM fluorometers and spectral sensors',
        href: '/api/v1/sensors/fluorescence',
        highlights: ['Real-time Fv/Fm', 'Stress detection', 'Multi-point monitoring', 'Automated alerts']
      },
      {
        name: 'Water Usage Analytics',
        description: 'Comprehensive water monitoring and optimization system',
        href: '/api/water/usage',
        highlights: ['Flow monitoring', 'Leak detection', 'Usage patterns', 'Conservation alerts']
      }
    ]
  }
];

export default function ComprehensiveFeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              The Complete Vibelux Platform
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Every advanced feature. Every cutting-edge technology. All integrated into one powerful platform.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">50+ Advanced Systems</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">AI-Powered Everything</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">Research Grade</span>
              </div>
            </div>
          </motion.div>

          {/* Feature Categories */}
          <div className="space-y-20">
            {comprehensiveFeatures.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} p-3 flex items-center justify-center`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{category.title}</h2>
                      <p className="text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  {category.badge && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${category.color} text-white`}>
                      {category.badge}
                    </span>
                  )}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: categoryIndex * 0.1 + featureIndex * 0.05 }}
                      className="group"
                    >
                      <Link href={feature.href}>
                        <div className="h-full p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                            {feature.name}
                          </h3>
                          <p className="text-gray-400 mb-4">
                            {feature.description}
                          </p>
                          <div className="space-y-2">
                            {feature.highlights.map((highlight, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                <span className="text-sm text-gray-500">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-12 border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Access Everything?</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Get instant access to all 50+ advanced features, AI systems, and research-grade tools.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/unified-dashboard">
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                    Access Unified Dashboard
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="px-8 py-4 bg-gray-800 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300">
                    View Pricing
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}