"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  Building, 
  Leaf, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  CheckCircle,
  Star,
  Target,
  BarChart3,
  FileText,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react'

interface CustomerPersona {
  id: string
  name: string
  title: string
  company: string
  avatar: string
  painPoints: string[]
  goals: string[]
  priorities: string[]
  journey: JourneyStage[]
  icon: any
  color: string
  bgColor: string
}

interface JourneyStage {
  stage: string
  title: string
  description: string
  duration: string
  actions: string[]
  outcomes: string[]
  tools: string[]
  blockers: string[]
}

const customerPersonas: CustomerPersona[] = [
  {
    id: 'cannabis-owner',
    name: 'Marcus Rodriguez',
    title: 'Facility Owner',
    company: 'Green Valley Cannabis',
    avatar: '👨‍💼',
    icon: Leaf,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    painPoints: [
      'Energy costs eating 40% of revenue',
      'Inconsistent yields across rooms',
      'Compliance reporting takes 10+ hours/week',
      'Investors demanding better ROI data'
    ],
    goals: [
      'Cut energy costs by 30%+',
      'Increase yields by 20%',
      'Automate compliance reporting',
      'Prepare for Series A funding'
    ],
    priorities: [
      'Immediate ROI and payback',
      'State compliance automation',
      'Professional investor materials',
      'Minimal disruption to operations'
    ],
    journey: [
      {
        stage: 'Awareness',
        title: 'Discovering Energy Optimization',
        description: 'Realizes energy costs are too high after reviewing monthly P&L',
        duration: '1-2 weeks',
        actions: [
          'Google search: "reduce cannabis energy costs"',
          'Read industry articles and case studies',
          'Join cannabis business forums',
          'Calculate current energy spend'
        ],
        outcomes: [
          'Understands energy optimization potential',
          'Discovers VibeLux through industry content',
          'Downloads ROI calculator'
        ],
        tools: ['ROI Calculator', 'Energy Audit', 'Industry Case Studies'],
        blockers: [
          'Too many vendor options',
          'Unclear ROI timelines',
          'Worried about operational disruption'
        ]
      },
      {
        stage: 'Consideration',
        title: 'Evaluating Solutions',
        description: 'Comparing different energy optimization platforms and consultants',
        duration: '2-4 weeks',
        actions: [
          'Sign up for VibeLux free trial',
          'Upload facility layout',
          'Generate lighting design',
          'Compare with competitor quotes'
        ],
        outcomes: [
          'Sees actual savings potential for their facility',
          'Gets professional CAD drawings',
          'Understands implementation process'
        ],
        tools: ['Design Studio', 'Professional Reports', 'Demo Sessions'],
        blockers: [
          'Need approval from business partner',
          'Wants references from similar facilities',
          'Concerned about learning curve'
        ]
      },
      {
        stage: 'Purchase',
        title: 'Making the Investment',
        description: 'Ready to commit but needs final validation and smooth onboarding',
        duration: '1-2 weeks',
        actions: [
          'Schedule demo with VibeLux team',
          'Get references from existing customers',
          'Review contract and SLA terms',
          'Plan implementation timeline'
        ],
        outcomes: [
          'Signs annual contract',
          'Gets dedicated account manager',
          'Receives implementation plan'
        ],
        tools: ['Customer References', 'Implementation Planning', 'Contract Portal'],
        blockers: [
          'Complex procurement process',
          'Need additional stakeholder buy-in',
          'Budget approval timing'
        ]
      },
      {
        stage: 'Onboarding',
        title: 'Getting Set Up',
        description: 'Initial setup and configuration with VibeLux team support',
        duration: '1 week',
        actions: [
          'Connect sensors and controllers',
          'Configure crop profiles and zones',
          'Set up automated reporting',
          'Train team on dashboard'
        ],
        outcomes: [
          'System fully operational',
          'Team trained and confident',
          'First energy savings visible'
        ],
        tools: ['Onboarding Wizard', 'Team Training', 'Setup Support'],
        blockers: [
          'Technical integration challenges',
          'Staff resistance to new system',
          'Time constraints during busy season'
        ]
      },
      {
        stage: 'Success',
        title: 'Realizing Value',
        description: 'Seeing results and becoming a VibeLux advocate',
        duration: 'Ongoing',
        actions: [
          'Monitor energy savings dashboard',
          'Generate monthly compliance reports',
          'Share ROI data with investors',
          'Refer other facility owners'
        ],
        outcomes: [
          '35% energy cost reduction achieved',
          '22% yield improvement',
          'Automated compliance reporting',
          'Successful Series A funding'
        ],
        tools: ['Analytics Dashboard', 'Automated Reports', 'ROI Tracking'],
        blockers: [
          'Seasonal variations in performance',
          'Need for advanced features',
          'Scaling to multiple facilities'
        ]
      }
    ]
  },
  {
    id: 'vertical-farm-cto',
    name: 'Example CTO Profile',
    title: 'Chief Technology Officer',
    company: 'Vertical Farm Example',
    avatar: '👩‍🔬',
    icon: Building,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    painPoints: [
      'Need precise light recipes for multiple crop varieties',
      'Manual optimization too time-consuming',
      'Investors demanding better unit economics',
      'Scaling to multiple facilities'
    ],
    goals: [
      'Standardize operations across facilities',
      'Optimize crop-specific light recipes',
      'Reduce operational labor by 30%',
      'Improve margins for Series B'
    ],
    priorities: [
      'Data-driven decision making',
      'Scalable automation platform',
      'Research-grade documentation',
      'API integrations'
    ],
    journey: [
      {
        stage: 'Research',
        title: 'Technical Due Diligence',
        description: 'Evaluating platforms for technical capabilities and scalability',
        duration: '2-3 months',
        actions: [
          'Review technical documentation',
          'Test API integrations',
          'Evaluate data export capabilities',
          'Run pilot at single facility'
        ],
        outcomes: [
          'Confirms technical requirements',
          'Validates integration possibilities',
          'Gets approval from engineering team'
        ],
        tools: ['API Documentation', 'Technical Pilot', 'Integration Testing'],
        blockers: [
          'Complex technical requirements',
          'Need custom integrations',
          'Long evaluation process'
        ]
      }
      // Additional journey stages...
    ]
  }
]

const journeyStages = ['Awareness', 'Consideration', 'Purchase', 'Onboarding', 'Success']

export function CustomerJourneyOptimizer() {
  const [selectedPersona, setSelectedPersona] = useState('cannabis-owner')
  const [selectedStage, setSelectedStage] = useState('Awareness')
  
  const currentPersona = customerPersonas.find(p => p.id === selectedPersona) || customerPersonas[0]
  const currentStage = currentPersona.journey.find(s => s.stage === selectedStage) || currentPersona.journey[0]

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-6">
          Your Path to Success with VibeLux
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          See how customers like you achieve 30-40% energy savings and 15-25% yield improvements. 
          Each journey is tailored to your specific role and facility type.
        </p>
      </div>

      {/* Persona Selector */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Choose Your Role
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customerPersonas.map((persona) => {
            const Icon = persona.icon
            const isSelected = selectedPersona === persona.id
            
            return (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona.id)}
                className={`text-left p-6 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? `border-current ${persona.bgColor}` 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{persona.avatar}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{persona.name}</h3>
                    <p className="text-sm text-gray-400">{persona.title}</p>
                    <p className="text-xs text-gray-500">{persona.company}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Key Challenges:</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {persona.painPoints.slice(0, 2).map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Goals:</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {persona.goals.slice(0, 2).map((goal, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className={`w-1 h-1 ${persona.color.replace('text-', 'bg-')} rounded-full mt-2 flex-shrink-0`} />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            {currentPersona.name}'s Journey to Success
          </h2>
          <div className={`flex items-center gap-2 ${currentPersona.color}`}>
            <currentPersona.icon className="w-5 h-5" />
            <span className="font-medium">{currentPersona.title}</span>
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="relative mb-8">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-gray-700 via-blue-500 to-green-500" />
          <div className="flex justify-between">
            {journeyStages.map((stage, index) => {
              const isSelected = selectedStage === stage
              const isCompleted = journeyStages.indexOf(selectedStage) > index
              const stageData = currentPersona.journey.find(s => s.stage === stage)
              
              return (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`relative flex flex-col items-center p-4 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white scale-105' 
                      : isCompleted
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-white/20' : isCompleted ? 'bg-green-500' : 'bg-gray-700'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-center">{stage}</div>
                  {stageData && (
                    <div className="text-xs text-center mt-1 opacity-75">{stageData.duration}</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Current Stage Details */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{currentStage.title}</h3>
              <p className="text-gray-300 mb-6">{currentStage.description}</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Key Actions
                  </h4>
                  <ul className="space-y-2">
                    {currentStage.actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                        <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Success Outcomes
                  </h4>
                  <ul className="space-y-2">
                    {currentStage.outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  VibeLux Tools & Resources
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {currentStage.tools.map((tool, index) => (
                    <div key={index} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium text-blue-400">{tool}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Common Blockers & Solutions
                </h4>
                <ul className="space-y-3">
                  {currentStage.blockers.map((blocker, index) => (
                    <li key={index} className="bg-red-900/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-red-300 font-medium">{blocker}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Solution: Our team provides dedicated support to overcome this challenge
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stage-specific CTA */}
              <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-500/30 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">Ready for this stage?</h5>
                {selectedStage === 'Awareness' && (
                  <Link href="/calculators-advanced" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    Try Our Calculators <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {selectedStage === 'Consideration' && (
                  <Link href="/design/advanced" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {selectedStage === 'Purchase' && (
                  <Link href="/pricing" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    View Pricing <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Metrics */}
      <div className="text-center bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6">
          Start Your Journey with VibeLux
        </h2>
        <p className="text-sm text-gray-400 mb-6">*Results vary based on facility type and implementation</p>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">Up to 30%</div>
            <div className="text-sm text-gray-400">Potential Energy Savings*</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">Up to 20%</div>
            <div className="text-sm text-gray-400">Potential Yield Improvement*</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">Reduced</div>
            <div className="text-sm text-gray-400">Admin Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">Positive</div>
            <div className="text-sm text-gray-400">ROI Potential*</div>
          </div>
        </div>
        <Link href="/design/advanced" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center gap-2 mx-auto shadow-xl">
          Start Your Journey Today
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}