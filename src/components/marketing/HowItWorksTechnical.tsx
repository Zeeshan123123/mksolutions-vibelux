"use client"

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Upload,
  Brain,
  Cpu,
  LineChart,
  Download,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Info,
  Zap,
  Clock,
  Shield,
  Globe,
  Database,
  Wifi,
  Settings,
  FileText,
  BarChart,
  DollarSign,
  Users,
  Building,
  Camera,
  Gauge
} from 'lucide-react'

const steps = [
  {
    id: 'setup',
    number: '01',
    title: 'Initial Setup & Configuration',
    duration: '5-15 minutes',
    icon: Settings,
    color: 'from-purple-500 to-blue-500',
    overview: 'Quick onboarding process to configure your facility profile and connect existing systems',
    details: [
      {
        title: 'Facility Profile Creation',
        description: 'Define your growing spaces, crop types, and production goals',
        technical: 'Multi-tenant architecture with isolated data namespaces',
        requirements: ['Basic facility info', 'Growing area dimensions', 'Crop selection']
      },
      {
        title: 'System Integration',
        description: 'Connect your existing sensors, controls, and business systems',
        technical: 'Auto-discovery protocols scan network for compatible devices',
        requirements: ['Network access', 'Device credentials', 'API keys (if applicable)']
      },
      {
        title: 'Baseline Establishment',
        description: 'System learns your current performance metrics',
        technical: 'ML algorithms analyze historical data to establish baselines',
        requirements: ['7-30 days of data', 'Typical operating conditions']
      }
    ],
    output: 'Fully configured platform ready for optimization'
  },
  {
    id: 'monitoring',
    number: '02',
    title: 'Real-Time Monitoring & Data Collection',
    duration: 'Continuous',
    icon: Gauge,
    color: 'from-green-500 to-teal-500',
    overview: 'Automated data collection from all connected systems with real-time processing',
    details: [
      {
        title: 'Sensor Data Aggregation',
        description: 'Collect data from environmental, energy, and production sensors',
        technical: 'Time-series database ingests 1M+ data points per day',
        requirements: ['Active sensors', 'Network connectivity', 'Power supply']
      },
      {
        title: 'Computer Vision Analysis',
        description: 'AI analyzes plant health through camera feeds',
        technical: 'CNN models process images for disease/stress detection',
        requirements: ['IP cameras', 'Good lighting', '5MP+ resolution']
      },
      {
        title: 'Manual Data Entry',
        description: 'Field teams input observations via mobile app',
        technical: 'Offline-capable PWA with background sync',
        requirements: ['Mobile device', 'Internet (periodic)', 'User training']
      }
    ],
    output: 'Complete real-time visibility of all operations'
  },
  {
    id: 'analysis',
    number: '03',
    title: 'AI Analysis & Optimization',
    duration: 'Real-time + Daily',
    icon: Brain,
    color: 'from-orange-500 to-red-500',
    overview: 'Advanced AI algorithms analyze data to identify optimization opportunities',
    details: [
      {
        title: 'Pattern Recognition',
        description: 'ML models identify inefficiencies and anomalies',
        technical: 'Ensemble methods combining LSTM, Random Forest, and XGBoost',
        requirements: ['Minimum 7 days data', 'Stable operations', 'Defined KPIs']
      },
      {
        title: 'Predictive Analytics',
        description: 'Forecast yields, energy usage, and maintenance needs',
        technical: 'Time-series forecasting with 92%+ accuracy',
        requirements: ['Historical data', 'Consistent tracking', 'Accurate inputs']
      },
      {
        title: 'Optimization Engine',
        description: 'Calculate optimal setpoints for all systems',
        technical: 'Multi-objective optimization balancing yield, quality, and cost',
        requirements: ['Performance goals', 'Constraint definitions', 'Cost data']
      }
    ],
    output: 'Actionable recommendations for improvement'
  },
  {
    id: 'automation',
    number: '04',
    title: 'Automated Control & Execution',
    duration: 'Continuous',
    icon: Cpu,
    color: 'from-blue-500 to-purple-500',
    overview: 'System automatically implements optimizations while maintaining safety',
    details: [
      {
        title: 'Direct Control Integration',
        description: 'Send optimized setpoints to climate and lighting systems',
        technical: 'Bidirectional communication with fail-safe protocols',
        requirements: ['Compatible controllers', 'Write permissions', 'Safety limits']
      },
      {
        title: 'Smart Scheduling',
        description: 'Optimize equipment schedules based on utility rates',
        technical: 'Dynamic programming solver with rolling optimization',
        requirements: ['Time-of-use rates', 'Flexible operations', 'Storage capacity']
      },
      {
        title: 'Alert & Response',
        description: 'Automated responses to critical conditions',
        technical: 'Rule engine with sub-second response time',
        requirements: ['Alert thresholds', 'Response protocols', 'Contact info']
      }
    ],
    output: 'Optimized operations running automatically'
  },
  {
    id: 'results',
    number: '05',
    title: 'Performance Tracking & Reporting',
    duration: 'Daily/Weekly/Monthly',
    icon: BarChart,
    color: 'from-emerald-500 to-green-500',
    overview: 'Comprehensive reporting shows ROI and identifies further opportunities',
    details: [
      {
        title: 'KPI Dashboards',
        description: 'Real-time visualization of all key metrics',
        technical: 'WebGL-accelerated charts with drill-down capability',
        requirements: ['Display device', 'User accounts', 'Metric selection']
      },
      {
        title: 'ROI Tracking',
        description: 'Automated calculation of savings and improvements',
        technical: 'Financial modeling engine with attribution analysis',
        requirements: ['Baseline data', 'Cost inputs', 'Production records']
      },
      {
        title: 'Compliance Reports',
        description: 'Automated regulatory and certification reporting',
        technical: 'Template engine with audit trail generation',
        requirements: ['Compliance rules', 'Data retention', 'Approval workflow']
      }
    ],
    output: 'Complete visibility into performance and ROI'
  }
]

const techSpecs = [
  { label: 'Data Processing', value: '10ms latency' },
  { label: 'Uptime SLA', value: '99.9%' },
  { label: 'API Rate Limit', value: '10,000 req/min' },
  { label: 'Data Retention', value: '7 years' },
  { label: 'Encryption', value: 'AES-256' },
  { label: 'Compliance', value: 'SOC 2, GDPR' }
]

export default function HowItWorksTechnical() {
  const [expandedStep, setExpandedStep] = useState<string | null>('setup')

  return (
    <section className="py-20 px-6 lg:px-8 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white"
          >
            How VibeLux Works: Step-by-Step Technical Guide
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            From setup to results in 5 clear steps. See exactly how our platform 
            transforms your cultivation operation with detailed technical specifications.
          </motion.p>
        </div>

        {/* Steps Accordion */}
        <div className="space-y-4 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="w-full text-left"
              >
                <div className={`bg-gray-800 rounded-xl p-6 border transition-all ${
                  expandedStep === step.id ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{step.number}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <p className="text-gray-400 mt-1">{step.overview}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{step.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${
                      expandedStep === step.id ? 'rotate-180' : ''
                    }`} />
                  </div>

                  {expandedStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                            <h4 className="font-semibold text-white mb-2">{detail.title}</h4>
                            <p className="text-sm text-gray-300 mb-3">{detail.description}</p>
                            
                            <div className="space-y-3">
                              <div className="bg-gray-800 rounded p-3 border border-gray-700">
                                <div className="flex items-start gap-2 mb-2">
                                  <Info className="w-4 h-4 text-purple-400 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-medium text-purple-400">Technical Details</p>
                                    <p className="text-xs text-gray-400 mt-1">{detail.technical}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-gray-400 mb-2">Requirements:</p>
                                <ul className="space-y-1">
                                  {detail.requirements.map((req, reqIndex) => (
                                    <li key={reqIndex} className="text-xs text-gray-500 flex items-start gap-1">
                                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <p className="text-sm text-gray-300">
                              <span className="font-medium text-white">Output:</span> {step.output}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-purple-400" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Technical Specifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-purple-500/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Platform Technical Specifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techSpecs.map((spec) => (
              <div key={spec.label} className="text-center">
                <p className="text-2xl font-bold text-purple-400 mb-1">{spec.value}</p>
                <p className="text-xs text-gray-400">{spec.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Integration Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <Database className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="font-semibold text-white mb-2">Universal Compatibility</h4>
            <p className="text-sm text-gray-400">
              Works with any sensor, controller, or system through our extensive protocol support
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <Shield className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="font-semibold text-white mb-2">Enterprise Security</h4>
            <p className="text-sm text-gray-400">
              Bank-level encryption, SOC 2 compliance, and complete audit trails
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <Globe className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="font-semibold text-white mb-2">Cloud + Edge</h4>
            <p className="text-sm text-gray-400">
              Hybrid architecture ensures reliability with local control and cloud intelligence
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}