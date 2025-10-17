'use client'

import Link from 'next/link'
import { 
  Zap, 
  Battery, 
  TrendingDown, 
  DollarSign, 
  Shield, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings,
  BarChart3,
  Lightbulb,
  Sun,
  Moon,
  Wind,
  Gauge,
  Target,
  Award,
  Leaf,
  Calculator
} from 'lucide-react'

interface EnergyOverviewContentProps {
  userRole: 'user' | 'admin' | 'developer'
  subscriptionTier: 'free' | 'starter' | 'professional' | 'enterprise'
}

export function EnergyOverviewContent({ userRole, subscriptionTier }: EnergyOverviewContentProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/20 via-transparent to-transparent rounded-xl" />
        <div className="relative p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">
              AI-Powered Energy Optimization
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-400 bg-clip-text text-transparent">
            Smart Energy Management
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Intelligent demand response and grid optimization for cultivation facilities. 
            Monitor energy usage and optimize operations without compromising plant health.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/energy?tab=setup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
            >
              <Settings className="w-5 h-5" />
              Start Energy Setup
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/energy?tab=monitoring"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              View Monitoring
            </Link>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">Real-Time</div>
              <div className="text-sm text-gray-400">Energy Monitoring</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-gray-400">System Monitoring</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">Smart</div>
              <div className="text-sm text-gray-400">Optimization</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">Easy</div>
              <div className="text-sm text-gray-400">Integration</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-gradient-to-b from-gray-900/50 to-transparent rounded-xl">
        <div className="px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Energy Optimization Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Monitor energy usage, track costs, and optimize your facility's power consumption 
              with intelligent controls and real-time analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Energy Monitoring</h3>
              <p className="text-gray-400 mb-6">
                Connect to your existing control system to monitor energy usage patterns 
                and track consumption across your facility.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Control system integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Real-time usage tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Cost analysis tools
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Controls</h3>
              <p className="text-gray-400 mb-6">
                Intelligent control systems that can be configured to optimize energy usage 
                while maintaining your cultivation requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Configurable automation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Schedule optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Custom parameters
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Analytics & Reporting</h3>
              <p className="text-gray-400 mb-6">
                Comprehensive energy analytics with detailed reporting and insights 
                to help you understand and optimize your facility's performance.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Usage analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Cost tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Detailed reporting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Advanced Energy Features</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive energy management tools designed specifically for controlled environment agriculture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Time-of-Use Optimization",
                description: "Automatically shift non-critical loads to off-peak hours when electricity rates are lowest."
              },
              {
                icon: Target,
                title: "Demand Response",
                description: "Participate in utility demand response programs to earn additional revenue during grid events."
              },
              {
                icon: Battery,
                title: "Battery Integration",
                description: "Optimize battery charging and discharging cycles to maximize savings and grid revenue."
              },
              {
                icon: Sun,
                title: "Solar Coordination",
                description: "Coordinate with solar panels to maximize self-consumption and minimize grid dependency."
              },
              {
                icon: Shield,
                title: "Plant Protection",
                description: "Advanced algorithms ensure energy optimizations never compromise plant health or yields."
              },
              {
                icon: Gauge,
                title: "Real-Time Analytics",
                description: "Live dashboards showing energy usage, costs, savings, and grid conditions."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-center">Get Started with Energy Management</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/energy?tab=setup"
              className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-medium">Setup Integration</div>
                <div className="text-sm text-gray-400">Connect your systems</div>
              </div>
            </Link>
            <Link 
              href="/energy?tab=monitoring"
              className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Activity className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-medium">Real-time Monitor</div>
                <div className="text-sm text-gray-400">View live data</div>
              </div>
            </Link>
            <Link 
              href="/energy?tab=optimization"
              className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Target className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium">AI Optimization</div>
                <div className="text-sm text-gray-400">Smart controls</div>
              </div>
            </Link>
            <Link 
              href="/energy?tab=savings"
              className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <DollarSign className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-medium">Track Savings</div>
                <div className="text-sm text-gray-400">Revenue sharing</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}