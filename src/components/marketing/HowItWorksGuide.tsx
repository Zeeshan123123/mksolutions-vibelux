"use client"

import { useState } from 'react'
import { 
  Upload, 
  Cpu, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Lightbulb,
  Building,
  Zap,
  Play,
  Download,
  Settings,
  Monitor
} from 'lucide-react'

interface ProcessStep {
  id: string
  title: string
  subtitle: string
  description: string
  icon: any
  duration: string
  inputs: string[]
  outputs: string[]
  benefits: string[]
  example: string
  videoUrl?: string
}

const processSteps: ProcessStep[] = [
  {
    id: 'upload',
    title: 'Upload Your Facility',
    subtitle: 'CAD files, sketches, or floor plans',
    description: 'Import your existing facility layout using any of 60+ supported file formats including AutoCAD (DWG/DXF), Revit, SketchUp, or even hand-drawn sketches. Our AI automatically extracts room dimensions, ceiling heights, and identifies optimal fixture placement zones.',
    icon: Upload,
    duration: '2-5 minutes',
    inputs: [
      'CAD files (DWG, DXF, Revit, SketchUp)',
      'Floor plans or blueprints',
      'Room dimensions and ceiling height',
      'Electrical layouts (optional)'
    ],
    outputs: [
      '3D facility model',
      'Accurate room measurements',
      'Electrical infrastructure mapping',
      'Zone identification for lighting'
    ],
    benefits: [
      'Works with any file format',
      'Automatic dimension extraction',
      'No manual measurements needed'
    ],
    example: 'A 10,000 sq ft cannabis facility with 12 grow rooms gets fully mapped in under 3 minutes'
  },
  {
    id: 'design',
    title: 'AI Designs Your Lighting',
    subtitle: 'Professional fixtures from DLC database',
    description: 'Our AI analyzes your facility and selects the optimal fixtures from our database of 2,400+ DLC-qualified horticultural lights. It considers your crop type, target PPFD, energy costs, and uniformity requirements to create a professional lighting design that maximizes both performance and efficiency.',
    icon: Lightbulb,
    duration: '30 seconds',
    inputs: [
      'Crop type and growth stage',
      'Target PPFD requirements',
      'Budget constraints',
      'Energy cost ($/kWh)'
    ],
    outputs: [
      'Optimal fixture selection',
      'Precise placement coordinates',
      'PPFD uniformity analysis',
      'Power consumption calculations'
    ],
    benefits: [
      'Uses real DLC fixture data',
      'Maximizes light uniformity',
      'Minimizes energy costs'
    ],
    example: 'Replaces 40x 1000W HPS with 32x LED fixtures, saving $4,200/month in electricity'
  },
  {
    id: 'reports',
    title: 'Get Professional Reports',
    subtitle: 'CAD drawings, ROI analysis, compliance docs',
    description: 'Download complete professional documentation including CAD drawings, photometric analysis, energy calculations, and ROI projections. All reports are investor-ready and meet professional engineering standards. Perfect for permits, financing, or stakeholder presentations.',
    icon: FileText,
    duration: 'Instant',
    inputs: [
      'Facility design data',
      'Local utility rates',
      'Project timeline',
      'Financing requirements'
    ],
    outputs: [
      'Professional CAD drawings (DWG, PDF)',
      'Photometric analysis (IES format)',
      'ROI and payback calculations',
      'Compliance documentation'
    ],
    benefits: [
      'Investor-ready presentations',
      'Professional engineering quality',
      'Automatic compliance reports'
    ],
    example: 'Complete facility documentation package ready for $2M financing presentation'
  },
  {
    id: 'optimize',
    title: 'Connect & Optimize',
    subtitle: 'Real-time monitoring and automation',
    description: 'Connect your sensors and controllers to enable continuous optimization. VibeLux monitors environmental conditions, energy usage, and plant health to automatically adjust lighting schedules, manage peak demand, and optimize time-of-use rates for maximum savings.',
    icon: BarChart3,
    duration: 'Ongoing',
    inputs: [
      'Sensor data (temp, humidity, CO2)',
      'Energy monitoring devices',
      'Lighting controllers',
      'Utility rate schedules'
    ],
    outputs: [
      'Automated lighting schedules',
      'Peak demand management',
      'Real-time alerts',
      'Performance analytics'
    ],
    benefits: [
      '30-40% energy cost reduction',
      '24/7 automated optimization',
      'Predictive maintenance alerts'
    ],
    example: 'Facility saves additional $2,800/month through intelligent scheduling and demand management'
  }
]

const customerJourneys = [
  {
    type: 'New Facility',
    description: 'Planning a new build or major renovation',
    timeline: '2-4 weeks',
    focus: 'Design optimization and permit documentation',
    savings: '$50,000+ in construction costs',
    icon: Building
  },
  {
    type: 'Retrofit Existing',
    description: 'Upgrading lighting in existing facility',
    timeline: '1-2 weeks', 
    focus: 'Equipment selection and ROI maximization',
    savings: '$30,000+ annually in energy costs',
    icon: Zap
  },
  {
    type: 'Optimize Operations',
    description: 'Improving existing facility performance',
    timeline: '2-3 days',
    focus: 'Automation and scheduling optimization', 
    savings: '15-25% reduction in operating costs',
    icon: TrendingUp
  }
]

export function HowItWorksGuide() {
  const [selectedStep, setSelectedStep] = useState('upload')
  const [selectedJourney, setSelectedJourney] = useState('New Facility')
  
  const currentStep = processSteps.find(step => step.id === selectedStep) || processSteps[0]

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-6">
          How VibeLux Works
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          From facility upload to optimized operations in minutes. 
          Professional lighting design made simple with AI-powered automation.
        </p>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">5 min</div>
            <div className="text-sm text-gray-400">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">30-40%</div>
            <div className="text-sm text-gray-400">Energy Savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">2,400+</div>
            <div className="text-sm text-gray-400">DLC Fixtures</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">99.9%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>
      </div>

      {/* Customer Journey Types */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Choose Your Journey
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {customerJourneys.map((journey, index) => {
            const Icon = journey.icon
            const isSelected = selectedJourney === journey.type
            
            return (
              <button
                key={index}
                onClick={() => setSelectedJourney(journey.type)}
                className={`text-left p-6 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <Icon className={`w-8 h-8 mb-4 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-white mb-2">{journey.type}</h3>
                <p className="text-gray-400 text-sm mb-3">{journey.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-green-400">
                    <Clock className="w-3 h-3" />
                    {journey.timeline}
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <DollarSign className="w-3 h-3" />
                    {journey.savings}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Interactive Process Steps */}
      <div className="mb-16">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {processSteps.map((step, index) => {
            const Icon = step.icon
            const isSelected = selectedStep === step.id
            const isCompleted = processSteps.findIndex(s => s.id === selectedStep) > index
            
            return (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-white/20' : isCompleted ? 'bg-green-500' : 'bg-gray-700'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{step.title}</div>
                  <div className="text-xs opacity-75">{step.duration}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Current Step Details */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left side - Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <currentStep.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{currentStep.title}</h3>
                  <p className="text-blue-400 font-medium">{currentStep.subtitle}</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                {currentStep.description}
              </p>
              
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">Example Result</span>
                </div>
                <p className="text-gray-300 text-sm">{currentStep.example}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-blue-400">
                  <Clock className="w-4 h-4" />
                  <span>Takes {currentStep.duration}</span>
                </div>
                {currentStep.videoUrl && (
                  <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                    <Play className="w-4 h-4" />
                    <span>Watch Video</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right side - Inputs/Outputs */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-gray-400" />
                  What You Provide
                </h4>
                <ul className="space-y-2">
                  {currentStep.inputs.map((input, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      {input}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-400" />
                  What You Get
                </h4>
                <ul className="space-y-2">
                  {currentStep.outputs.map((output, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {output}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  Key Benefits
                </h4>
                <ul className="space-y-2">
                  {currentStep.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Flow */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Complete Process Flow
        </h2>
        <div className="relative">
          {/* Flow line */}
          <div className="hidden lg:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-500 to-green-500" />
          
          <div className="grid lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{step.subtitle}</p>
                  <div className="text-xs text-blue-400">{step.duration}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-900/30 to-green-900/30 border border-blue-500/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-300 text-lg mb-6">
          Start optimizing your facility with VibeLux today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
            Schedule Demo
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          14-day free trial • Credit card required • Setup support included
        </p>
      </div>
    </div>
  )
}