'use client'

import React, { useState } from 'react'
import { 
  Upload, 
  Brain, 
  Zap, 
  TrendingDown, 
  DollarSign,
  ArrowRight,
  Building,
  Cpu,
  BarChart3,
  Smartphone,
  Cloud,
  Shield,
  CheckCircle
} from 'lucide-react'

export default function ProcessFlow() {
  const [activeFlow, setActiveFlow] = useState<'energy' | 'gaas' | 'architecture'>('energy')

  const energySavingsFlow = [
    {
      icon: Upload,
      title: "Import Your Facility",
      description: "Upload CAD files or use our 3D designer",
      color: "purple"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Machine learning analyzes your energy usage patterns",
      color: "blue"
    },
    {
      icon: Zap,
      title: "Optimization",
      description: "Identifies savings opportunities across lighting, HVAC, and operations",
      color: "yellow"
    },
    {
      icon: TrendingDown,
      title: "Implementation",
      description: "Automated controls reduce energy waste 24/7",
      color: "green"
    },
    {
      icon: DollarSign,
      title: "Save 20-40%",
      description: "Track savings in real-time dashboard",
      color: "emerald"
    }
  ]

  const gaasFlow = [
    {
      icon: Building,
      title: "Your Facility",
      description: "Focus on growing, not software",
      color: "green"
    },
    {
      icon: Cloud,
      title: "VibeLux Cloud",
      description: "We handle all infrastructure, updates, and scaling",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2, automated backups, 99.9% uptime SLA",
      color: "purple"
    },
    {
      icon: Smartphone,
      title: "Access Anywhere",
      description: "Web, mobile, API - work from anywhere",
      color: "orange"
    },
    {
      icon: CheckCircle,
      title: "Always Current",
      description: "New features added weekly, no IT needed",
      color: "green"
    }
  ]

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            How VibeLux Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            See how our platform delivers results from day one
          </p>
          
          {/* Flow Selector */}
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveFlow('energy')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeFlow === 'energy' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Energy Savings Process
            </button>
            <button
              onClick={() => setActiveFlow('gaas')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeFlow === 'gaas' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Growing-as-a-Service
            </button>
            <button
              onClick={() => setActiveFlow('architecture')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeFlow === 'architecture' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              System Architecture
            </button>
          </div>
        </div>

        {/* Energy Savings Flow */}
        {activeFlow === 'energy' && (
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-green-600 transform -translate-y-1/2 hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
              {energySavingsFlow.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-gray-800 rounded-xl p-6 text-center relative z-10 hover:transform hover:scale-105 transition-all">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${step.color}-500/20 flex items-center justify-center`}>
                      <step.icon className={`w-8 h-8 text-${step.color}-500`} />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                  {index < energySavingsFlow.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-600 z-20" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-4 bg-green-900/20 border border-green-800 rounded-lg px-6 py-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-green-400 font-medium">
                  Average customer saves $4,500/month within 60 days
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Growing-as-a-Service Flow */}
        {activeFlow === 'gaas' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {gaasFlow.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${step.color}-500/20 flex items-center justify-center`}>
                      <step.icon className={`w-8 h-8 text-${step.color}-500`} />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">What's Included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">Infrastructure</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Cloud hosting</li>
                    <li>• Auto-scaling</li>
                    <li>• CDN delivery</li>
                    <li>• Database management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">Maintenance</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Security updates</li>
                    <li>• Bug fixes</li>
                    <li>• Performance optimization</li>
                    <li>• Feature updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">Support</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 24/7 monitoring</li>
                    <li>• Help documentation</li>
                    <li>• Video tutorials</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Architecture */}
        {activeFlow === 'architecture' && (
          <div className="space-y-8">
            <SystemArchitecture />
          </div>
        )}
      </div>
    </section>
  )
}

function SystemArchitecture() {
  return (
    <div className="bg-gray-800 rounded-xl p-8">
      <h3 className="text-2xl font-bold text-white mb-8 text-center">
        VibeLux Integration Architecture
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Sources */}
        <div className="space-y-4">
          <h4 className="font-semibold text-purple-400 mb-4">Data Sources</h4>
          
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-white font-medium">CAD Files</p>
                <p className="text-xs text-gray-400">AutoCAD, Revit, IFC, 60+ formats</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-white font-medium">IoT Sensors</p>
                <p className="text-xs text-gray-400">Temperature, humidity, CO2, light</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-white font-medium">Climate Systems</p>
                <p className="text-xs text-gray-400">Priva, Argus, Hortimax, Link4</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-white font-medium">Business Systems</p>
                <p className="text-xs text-gray-400">ERP, CRM, accounting, CMMS</p>
              </div>
            </div>
          </div>
        </div>

        {/* VibeLux Core */}
        <div className="space-y-4">
          <h4 className="font-semibold text-purple-400 mb-4">VibeLux Platform</h4>
          
          <div className="bg-gradient-to-b from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-800">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-purple-600 rounded-xl flex items-center justify-center mb-3">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h5 className="font-semibold text-white">AI Processing Core</h5>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="bg-gray-900/50 rounded px-3 py-2 text-gray-300">
                • Machine Learning Models
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2 text-gray-300">
                • Real-time Analytics
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2 text-gray-300">
                • Predictive Algorithms
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2 text-gray-300">
                • Computer Vision
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2 text-gray-300">
                • Time-series Database
              </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          <h4 className="font-semibold text-purple-400 mb-4">Delivered Value</h4>
          
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-white font-medium">Energy Optimization</p>
                <p className="text-xs text-gray-400">20-40% reduction</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-white font-medium">Mobile Access</p>
                <p className="text-xs text-gray-400">iOS, Android, offline sync</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-white font-medium">Automated Reports</p>
                <p className="text-xs text-gray-400">Compliance, analytics, insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-white font-medium">Risk Mitigation</p>
                <p className="text-xs text-gray-400">Predictive maintenance, alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Lines - Visual representation */}
      <div className="mt-8 pt-8 border-t border-gray-700">
        <p className="text-center text-gray-400 text-sm">
          All systems connected via secure API with real-time data synchronization
        </p>
      </div>
    </div>
  )
}