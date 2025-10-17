'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Workflow, 
  Zap, 
  Shield, 
  Activity, 
  Database, 
  GitBranch, 
  Cloud, 
  ArrowRight,
  CheckCircle,
  Clock,
  Bot,
  Settings,
  Brain,
  Gauge,
  Users,
  AlertTriangle
} from 'lucide-react';

const workflowFeatures = [
  {
    title: 'Smart Facility Workflows',
    description: 'Automated workflows for complete facility lifecycle management',
    href: '/automation',
    icon: Workflow,
    features: [
      'Automated climate adjustments based on growth stage',
      'Smart irrigation scheduling with weather integration',
      'Equipment maintenance workflows with predictive alerts',
      'Harvest timing optimization with quality analysis'
    ]
  },
  {
    title: 'Energy Optimization Workflows',
    description: 'Intelligent energy management with zero-cost API integrations',
    href: '/energy-optimization',
    icon: Zap,
    features: [
      'NOAA weather-based energy forecasting',
      'Automated load balancing during peak hours',
      'Smart HVAC control with VPD optimization',
      'Demand response automation with utility integration'
    ]
  },
  {
    title: 'Quality Assurance Workflows',
    description: 'AI-powered quality control and compliance automation',
    href: '/quality',
    icon: Shield,
    features: [
      'Hybrid ML plant health monitoring',
      'Automated compliance reporting and documentation',
      'Smart notification routing by severity and facility',
      'Photo-based quality assessment with auto-optimization'
    ]
  },
  {
    title: 'Operational Intelligence',
    description: 'Real-time monitoring and automated decision making',
    href: '/control-center',
    icon: Brain,
    features: [
      'Cross-facility benchmarking and insights',
      'Automated alert escalation workflows',
      'Predictive analytics for yield optimization',
      'Performance-driven equipment recommendations'
    ]
  }
];

const workflowBenefits = [
  {
    title: 'Reduce Manual Tasks by 80%',
    description: 'Automate repetitive operations and focus on strategic decisions',
    icon: Clock
  },
  {
    title: 'Improve Consistency',
    description: 'Standardized processes across all facilities and teams',
    icon: CheckCircle
  },
  {
    title: 'Real-time Intelligence',
    description: 'AI-powered insights and automated responses to facility conditions',
    icon: Bot
  },
  {
    title: 'Scalable Operations',
    description: 'Workflows that scale from single facility to enterprise operations',
    icon: Settings
  }
];

export default function WorkflowAutomationPage() {
  return (
    <>
      <MarketingNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
        {/* Hero Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 backdrop-blur-sm rounded-full border border-blue-700/50 mb-6"
            >
              <Workflow className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Intelligent Workflow Automation</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Automate Your Entire
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent">
                Cultivation Workflow
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
            >
              From seed to sale, VibeLux automates complex cultivation workflows with AI-powered intelligence, 
              zero-cost API integrations, and real-time facility optimization.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                href="/get-started"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Automating
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/demo/zero-cost-api"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-semibold rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300"
              >
                View Zero-Cost API Demo
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Workflow Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Complete Workflow Automation
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Intelligent workflows powered by our zero-cost API optimizations and hybrid ML architecture
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {workflowFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                      <feature.icon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href={feature.href}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Benefits */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Transform Your Operations
              </h2>
              <p className="text-xl text-gray-300">
                See immediate improvements across all aspects of your cultivation business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workflowBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced API Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Powered by Zero-Cost API Optimizations
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Significant value through intelligent API integrations and hybrid ML architecture
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/30">
                <Brain className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Hybrid ML Architecture</h3>
                <p className="text-gray-300 mb-4">
                  Instant client-side feedback combined with detailed server-side platform intelligence for competitive advantage.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Instant user feedback (&lt;100ms)</li>
                  <li>• Cross-facility benchmarking</li>
                  <li>• Platform learning advantage</li>
                  <li>• Best-in-class UX + analytics</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-xl p-8 border border-green-500/30">
                <Cloud className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Weather Intelligence</h3>
                <p className="text-gray-300 mb-4">
                  NOAA historical weather integration with seasonal analysis and climate risk assessment for facility planning.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Historical weather patterns</li>
                  <li>• Climate risk assessment</li>
                  <li>• Seasonal recommendations</li>
                  <li>• Energy demand forecasting</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl p-8 border border-blue-500/30">
                <Zap className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Enhanced Media Processing</h3>
                <p className="text-gray-300 mb-4">
                  Cloudinary auto-optimization and smart notifications deliver 50% faster loading with intelligent routing.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Auto-optimized photos (50% faster)</li>
                  <li>• AI plant analysis</li>
                  <li>• Smart push notifications</li>
                  <li>• Satellite imagery integration</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-900/30 to-green-900/30 backdrop-blur-sm rounded-2xl p-12 border border-blue-500/30"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Automate Your Workflows?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Automate your operations with VibeLux
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/get-started"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-semibold rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300"
                >
                  Schedule Demo
                  <Users className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}