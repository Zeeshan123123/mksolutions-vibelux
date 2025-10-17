"use client"

import Link from 'next/link'
import { useState } from 'react'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Clock, 
  ArrowRight, 
  CheckCircle,
  Play,
  Star,
  Users,
  DollarSign,
  Zap,
  Building,
  Leaf,
  BarChart3,
  FileText,
  Sparkles
} from 'lucide-react'

export function ImprovedHomepage() {
  const { isSignedIn } = useUser()
  const [selectedBenefit, setSelectedBenefit] = useState('energy')
  
  const benefits = {
    energy: {
      title: 'Cut Energy Costs by 30-40%',
      subtitle: 'Smart AI optimizes your lighting schedule and reduces peak demand charges',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      stats: '$54K avg. annual savings',
      example: '10,000 sq ft facility saves $4,500/month'
    },
    yield: {
      title: 'Increase Yields by 15-25%',
      subtitle: 'Professional lighting design ensures optimal PPFD coverage across your facility',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20', 
      stats: '0.7-1.2 lbs/sq ft typical',
      example: 'Better uniformity = more consistent harvests'
    },
    time: {
      title: 'Save 10+ Hours Per Week',
      subtitle: 'Automated monitoring, alerts, and professional reports eliminate manual tasks',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      stats: '60% less time on admin',
      example: 'Automated compliance reports and tracking'
    }
  }

  const howItWorks = [
    {
      step: '1',
      title: 'Upload Your Facility',
      description: 'Import CAD files (DWG, Revit, SketchUp) or sketch your layout. Works with 60+ file formats.',
      icon: Building,
      duration: '5 minutes'
    },
    {
      step: '2', 
      title: 'AI Designs Your Lighting',
      description: 'Our AI analyzes your space and designs optimal fixture placement using real DLC-qualified fixtures.',
      icon: Lightbulb,
      duration: '2 minutes'
    },
    {
      step: '3',
      title: 'Get Professional Reports',
      description: 'Download CAD drawings, photometric analysis, and ROI calculations ready for investors.',
      icon: FileText,
      duration: 'Instant'
    },
    {
      step: '4',
      title: 'Connect & Optimize',
      description: 'Connect sensors and controllers to enable automated optimization and monitoring.',
      icon: BarChart3,
      duration: 'Optional'
    }
  ]

  const socialProof = [
    { metric: '2,400+', label: 'Facilities Optimized' },
    { metric: '30%', label: 'Potential Energy Savings' }, 
    { metric: '99.9%', label: 'Uptime SLA' },
    { metric: '4.8/5', label: 'Customer Rating' }
  ]

  const customerTypes = [
    {
      type: 'Cannabis Facilities',
      description: 'Indoor & greenhouse cultivation optimization',
      features: ['State compliance reports', 'Energy rebate applications', 'Investor-ready documentation'],
      icon: Leaf,
      color: 'text-green-400'
    },
    {
      type: 'Food Production',
      description: 'Vertical farms, leafy greens, tomatoes, herbs',
      features: ['Crop-specific light recipes', 'Multi-zone optimization', 'Research-grade data'],
      icon: Building,
      color: 'text-blue-400'
    },
    {
      type: 'Research Facilities',
      description: 'Universities and R&D operations',
      features: ['Experimental design tools', 'Data export capabilities', 'Academic pricing'],
      icon: Users,
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent" />
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-8">
            {/* Social proof badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 px-6 py-3 rounded-full mb-4">
              <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold">
                1000+ features • 30% potential energy savings
              </span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Cut Energy Costs by{' '}
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  30-40%
                </span>
                <br />
                with AI-Powered Lighting
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                VibeLux combines professional lighting design with intelligent optimization. 
                Upload your facility, get AI-designed lighting plans, and start saving immediately.
                <strong className="text-white block mt-2">No hardware required. Works with any equipment.</strong>
              </p>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              {isSignedIn ? (
                <Link href="/design" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-green-500/25">
                  Go to Design Studio
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-green-500/25">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </SignUpButton>
                  <button className="bg-gray-800/50 hover:bg-gray-700 border border-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                </>
              )}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
            <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {socialProof.map((item, index) => (
              <div key={index} className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-white">{item.metric}</p>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits - Interactive */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Three Ways VibeLux Grows Your Bottom Line
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Transform your operations with professional lighting design and AI optimization.
            </p>
          </div>

          {/* Interactive Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {Object.entries(benefits).map(([key, benefit]) => {
              const Icon = benefit.icon
              return (
                <div 
                  key={key}
                  className={`cursor-pointer transition-all duration-300 p-8 rounded-2xl border-2 ${
                    selectedBenefit === key 
                      ? `${benefit.bgColor} border-current scale-105` 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedBenefit(key)}
                >
                  <Icon className={`w-12 h-12 ${benefit.color} mb-6`} />
                  <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 mb-4">{benefit.subtitle}</p>
                  <div className={`text-sm font-semibold ${benefit.color}`}>
                    {benefit.stats}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {benefit.example}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ROI Calculator Preview */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Calculate Your Potential Savings
              </h3>
              <p className="text-gray-300 mb-6">
                See exactly how much you could save with VibeLux at your facility
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <input 
                  type="number" 
                  placeholder="Facility size (sq ft)"
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600"
                />
                <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  Get My ROI Report
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Average facility saves $4,500/month • Results in 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How VibeLux Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From facility upload to optimized operations in minutes. 
              No complex installations or learning curves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 mb-3">{step.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm text-blue-400">
                    <Clock className="w-4 h-4" />
                    {step.duration}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Process flow indicators */}
          <div className="hidden lg:flex justify-center mt-12">
            <div className="flex items-center gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  {i < 2 && <ArrowRight className="w-6 h-6 text-gray-600 mx-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Types */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Every Type of Facility
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Specialized tools and compliance features for your specific operation
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {customerTypes.map((customer, index) => {
              const Icon = customer.icon
              return (
                <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-8 h-8 ${customer.color}`} />
                    <h3 className="text-xl font-bold text-white">{customer.type}</h3>
                  </div>
                  <p className="text-gray-400 mb-6">{customer.description}</p>
                  <ul className="space-y-2">
                    {customer.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className={`w-4 h-4 ${customer.color}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-green-900/20 border-y border-blue-500/30">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Saving on Energy Costs?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start optimizing your facility with VibeLux today. 
            Free trial includes full access to professional design tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isSignedIn ? (
              <Link href="/design" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl">
                Go to Design Studio
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl">
                  Start Your 14-Day Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignUpButton>
            )}
            <Link href="/contact" className="bg-gray-800/50 hover:bg-gray-700 border border-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
              Talk to an Expert
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Full access to all features
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Setup support included
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}