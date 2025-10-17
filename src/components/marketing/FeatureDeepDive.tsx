"use client"

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Zap, 
  Brain, 
  LineChart, 
  DollarSign,
  ArrowRight,
  Check,
  ChevronRight,
  Info,
  Calculator,
  Gauge,
  TrendingDown,
  Clock,
  Calendar,
  BarChart,
  FileText,
  AlertCircle,
  Settings,
  Database,
  Wifi,
  Cloud,
  Lock,
  Shield
} from 'lucide-react'

const features = [
  {
    id: 'energy-optimization',
    title: 'Energy Optimization System',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    shortDescription: 'AI-powered energy management that reduces costs significantly',
    technicalDescription: 'Our energy optimization system uses machine learning algorithms to analyze your facility\'s energy consumption patterns, weather data, utility rates, and equipment performance to automatically optimize energy usage while maintaining optimal growing conditions.',
    howItWorks: [
      {
        step: 1,
        title: 'Data Collection',
        description: 'System collects real-time data from smart meters, sensors, and utility APIs',
        technical: 'Polling frequency: 1-minute intervals, supports Modbus, BACnet, and REST APIs'
      },
      {
        step: 2,
        title: 'Pattern Analysis',
        description: 'ML algorithms identify usage patterns and inefficiencies',
        technical: 'Uses LSTM neural networks for time-series prediction'
      },
      {
        step: 3,
        title: 'Optimization Engine',
        description: 'Calculates optimal schedules based on rates and conditions',
        technical: 'Linear programming solver with high variable capacity'
      },
      {
        step: 4,
        title: 'Automated Control',
        description: 'Sends commands to equipment to implement optimizations',
        technical: 'Sub-second response time, fail-safe protocols, manual override capability'
      }
    ],
    specifications: [
      { label: 'Savings', value: 'Significant' },
      { label: 'ROI Period', value: '3-6 months' },
      { label: 'Data Points', value: 'Millions/day' },
      { label: 'Response Time', value: '<1 second' },
      { label: 'Accuracy', value: 'High' },
      { label: 'Integration', value: 'Multiple systems' }
    ],
    benefits: [
      'Reduce energy costs significantly',
      'Participate in demand response programs',
      'Prevent peak demand charges',
      'Optimize equipment runtime',
      'Real-time anomaly detection',
      'Automated reporting'
    ]
  },
  {
    id: 'ai-design',
    title: 'AI-Powered Lighting Design',
    icon: Brain,
    color: 'from-purple-500 to-blue-500',
    shortDescription: 'Conversational AI that designs optimal lighting layouts in seconds',
    technicalDescription: 'Using advanced AI and proprietary algorithms, our system understands natural language requests and generates photometrically accurate lighting designs optimized for uniformity, efficiency, and plant growth.',
    howItWorks: [
      {
        step: 1,
        title: 'Natural Language Input',
        description: 'Describe your space and requirements in plain English',
        technical: 'NLP processing with intent recognition and entity extraction'
      },
      {
        step: 2,
        title: 'Space Analysis',
        description: 'AI analyzes room dimensions and growing requirements',
        technical: '3D spatial reasoning with constraint satisfaction algorithms'
      },
      {
        step: 3,
        title: 'Fixture Selection',
        description: 'Intelligent selection from our growing fixture database',
        technical: 'Multi-objective optimization considering PPFD, efficiency, and cost'
      },
      {
        step: 4,
        title: 'Layout Generation',
        description: 'Creates optimal placement with real-time PPFD calculations',
        technical: 'GPU-accelerated ray tracing with 1cm resolution'
      }
    ],
    specifications: [
      { label: 'Design Time', value: '10-30 seconds' },
      { label: 'Accuracy', value: 'High PPFD' },
      { label: 'Fixtures DB', value: 'Growing Daily' },
      { label: 'AI Model', value: 'Advanced AI' },
      { label: 'Calculations', value: 'Millions' },
      { label: 'Languages', value: 'English' }
    ],
    benefits: [
      'Design in seconds vs hours',
      'No CAD experience needed',
      'Optimal uniformity guaranteed',
      'Cost optimization included',
      'Multiple layout options',
      'Export to any format'
    ]
  },
  {
    id: 'predictive-analytics',
    title: 'Predictive Analytics Engine',
    icon: LineChart,
    color: 'from-green-500 to-teal-500',
    shortDescription: 'ML-powered predictions for yield, energy, and maintenance',
    technicalDescription: 'Advanced machine learning models trained on extensive data from commercial facilities to predict yields, detect anomalies, and forecast maintenance needs with high accuracy.',
    howItWorks: [
      {
        step: 1,
        title: 'Historical Analysis',
        description: 'Analyzes all historical data from your facility',
        technical: 'Time-series decomposition with seasonal trend analysis'
      },
      {
        step: 2,
        title: 'Model Training',
        description: 'Trains custom ML models for your specific conditions',
        technical: 'Ensemble methods combining Random Forest, XGBoost, and neural networks'
      },
      {
        step: 3,
        title: 'Real-time Scoring',
        description: 'Continuously scores current conditions against predictions',
        technical: 'Streaming inference with 100ms latency'
      },
      {
        step: 4,
        title: 'Alert Generation',
        description: 'Proactive alerts before issues impact production',
        technical: 'Statistical process control with dynamic thresholds'
      }
    ],
    specifications: [
      { label: 'Prediction Accuracy', value: 'High' },
      { label: 'Lead Time', value: '7-14 days' },
      { label: 'Data Sources', value: 'Multiple' },
      { label: 'Update Frequency', value: 'Real-time' },
      { label: 'Models', value: 'Multiple types' },
      { label: 'Training Data', value: 'Extensive' }
    ],
    benefits: [
      'Prevent crop losses',
      'Optimize resource usage',
      'Reduce maintenance costs',
      'Improve yield consistency',
      'Data-driven decisions',
      'Competitive advantage'
    ]
  },
  {
    id: 'revenue-sharing',
    title: 'Revenue Sharing Platform',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-500',
    shortDescription: 'Blockchain-secured equipment financing through revenue sharing',
    technicalDescription: 'Revolutionary platform that connects equipment buyers with investors through smart contracts, enabling performance-based payments and eliminating upfront costs while providing transparent, automated revenue distribution.',
    howItWorks: [
      {
        step: 1,
        title: 'Equipment Request',
        description: 'Post equipment needs with performance projections',
        technical: 'Smart contract creation with escrow initialization'
      },
      {
        step: 2,
        title: 'Investor Matching',
        description: 'AI matches requests with qualified investors',
        technical: 'Risk scoring algorithm with multiple parameters'
      },
      {
        step: 3,
        title: 'Performance Monitoring',
        description: 'Sensors track actual vs projected performance',
        technical: 'Tamper-proof IoT sensors with blockchain logging'
      },
      {
        step: 4,
        title: 'Automated Payments',
        description: 'Revenue automatically distributed based on performance',
        technical: 'Smart contract execution with multi-sig verification'
      }
    ],
    specifications: [
      { label: 'Platform Fee', value: '15%' },
      { label: 'Escrow Protection', value: '100%' },
      { label: 'Payment Speed', value: '<24 hours' },
      { label: 'Min Investment', value: '$1,000' },
      { label: 'Contracts', value: 'Ethereum' },
      { label: 'Verification', value: '3-party' }
    ],
    benefits: [
      'Zero upfront costs',
      'Performance-based payments',
      'Investor protection',
      'Automated distribution',
      'Transparent tracking',
      'Dispute resolution'
    ]
  }
]

export default function FeatureDeepDive() {
  const [selectedFeature, setSelectedFeature] = useState(features[0])
  const [activeTab, setActiveTab] = useState<'how' | 'specs' | 'benefits'>('how')

  return (
    <section className="py-20 px-6 lg:px-8 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white"
          >
            Deep Dive: How Our Technology Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Select any feature below to see detailed technical specifications, 
            implementation details, and real-world performance metrics
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature Selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Select a Feature</h3>
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedFeature.id === feature.id
                      ? 'bg-gradient-to-r ' + feature.color + ' border-transparent'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${
                      selectedFeature.id === feature.id ? 'text-white' : 'text-gray-400'
                    }`} />
                    <div>
                      <h4 className={`font-semibold ${
                        selectedFeature.id === feature.id ? 'text-white' : 'text-gray-200'
                      }`}>
                        {feature.title}
                      </h4>
                      <p className={`text-sm ${
                        selectedFeature.id === feature.id ? 'text-white/80' : 'text-gray-400'
                      }`}>
                        {feature.shortDescription}
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ml-auto ${
                      selectedFeature.id === feature.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Feature Details */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedFeature.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${selectedFeature.color} rounded-xl flex items-center justify-center`}>
                  <selectedFeature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedFeature.title}</h3>
                  <p className="text-gray-400">{selectedFeature.technicalDescription}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('how')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'how'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  How It Works
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'specs'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'benefits'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Benefits
                </button>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'how' && (
                  <div className="space-y-6">
                    {selectedFeature.howItWorks.map((step, index) => (
                      <div key={step.step} className="relative">
                        {index < selectedFeature.howItWorks.length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-700" />
                        )}
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${selectedFeature.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                            {step.step}
                          </div>
                          <div className="flex-1 pb-8">
                            <h4 className="text-lg font-semibold text-white mb-1">{step.title}</h4>
                            <p className="text-gray-300 mb-2">{step.description}</p>
                            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-purple-400 mt-0.5" />
                                <p className="text-sm text-gray-400">
                                  <span className="font-medium text-purple-400">Technical:</span> {step.technical}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFeature.specifications.map((spec) => (
                      <div key={spec.label} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">{spec.label}</p>
                        <p className="text-xl font-bold text-white">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'benefits' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedFeature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-gray-300">{benefit}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* CTA */}
              <div className="mt-8 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Ready to implement this feature?</p>
                    <p className="text-xs text-gray-400">Get started with a free consultation</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}