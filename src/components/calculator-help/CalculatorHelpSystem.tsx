'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  HelpCircle, 
  BookOpen, 
  Calculator, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Download,
  Play
} from 'lucide-react'

interface CalculatorGuide {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  prerequisites?: string[]
  steps: GuideStep[]
  tips: string[]
  troubleshooting: TroubleshootingItem[]
  relatedCalculators: string[]
}

interface GuideStep {
  title: string
  description: string
  inputExample?: string
  expectedOutput?: string
  image?: string
  warning?: string
}

interface TroubleshootingItem {
  problem: string
  solution: string
  severity: 'info' | 'warning' | 'error'
}

const calculatorGuides: CalculatorGuide[] = [
  {
    id: 'ppfd-calculator',
    title: 'PPFD Calculator Guide',
    description: 'Learn how to calculate Photosynthetic Photon Flux Density for optimal plant growth',
    category: 'lighting',
    difficulty: 'Beginner',
    estimatedTime: '5 minutes',
    steps: [
      {
        title: 'Enter Fixture Wattage',
        description: 'Input the electrical power consumption of your LED fixture in watts. This is typically found on the fixture specifications or power supply.',
        inputExample: '600W',
        warning: 'Make sure to use actual power draw, not LED chip power'
      },
      {
        title: 'Input Efficacy',
        description: 'Enter the photosynthetic photon efficacy in μmol/J. Modern LED fixtures typically range from 2.0-3.5 μmol/J.',
        inputExample: '2.8 μmol/J',
        expectedOutput: 'Higher efficacy means more photons per watt'
      },
      {
        title: 'Define Coverage Area',
        description: 'Specify the area covered by the fixture in square meters. Measure the effective growing area, not total fixture footprint.',
        inputExample: '1.2 m²',
        warning: 'Use actual growing area for accurate PPFD calculation'
      },
      {
        title: 'Review Results',
        description: 'The calculator will show PPFD in μmol/m²/s with interpretation for different growth stages.',
        expectedOutput: 'PPFD: 1400 μmol/m²/s - High intensity suitable for flowering'
      }
    ],
    tips: [
      'Modern full-spectrum LEDs typically have efficacy between 2.5-3.2 μmol/J',
      'For vegetative growth, target 400-600 PPFD; for flowering, 800-1200 PPFD',
      'Consider wall losses and reflector efficiency when measuring coverage area',
      'PPFD decreases with distance - measure at canopy level'
    ],
    troubleshooting: [
      {
        problem: 'PPFD seems too high or low',
        solution: 'Verify efficacy rating from manufacturer specs. Check if wattage is wall draw or LED chip power.',
        severity: 'warning'
      },
      {
        problem: 'Results don\'t match PAR meter readings',
        solution: 'PPFD varies across coverage area. Calculator gives average - actual readings vary by 20-30%.',
        severity: 'info'
      }
    ],
    relatedCalculators: ['dli-calculator', 'energy-cost-calculator']
  },
  {
    id: 'vpd-calculator',
    title: 'VPD Calculator Guide',
    description: 'Master Vapor Pressure Deficit calculations for optimal transpiration control',
    category: 'environmental',
    difficulty: 'Intermediate',
    estimatedTime: '8 minutes',
    prerequisites: ['Basic understanding of humidity and temperature'],
    steps: [
      {
        title: 'Measure Air Temperature',
        description: 'Record ambient air temperature at canopy level in Celsius. Use calibrated thermometer for accuracy.',
        inputExample: '24°C',
        warning: 'Temperature should be measured at plant height, not ceiling level'
      },
      {
        title: 'Measure Relative Humidity',
        description: 'Input relative humidity percentage at the same location as temperature measurement.',
        inputExample: '65%',
        expectedOutput: 'Humidity affects plant transpiration rate'
      },
      {
        title: 'Interpret VPD Results',
        description: 'Review calculated VPD and recommended growing stages. VPD indicates plant\'s ability to transpire.',
        expectedOutput: 'VPD: 1.05 kPa - Optimal for late vegetative growth'
      }
    ],
    tips: [
      'Ideal VPD ranges: Seedlings 0.4-0.8 kPa, Vegetative 0.8-1.2 kPa, Flowering 1.0-1.5 kPa',
      'High VPD (>1.6 kPa) causes plant stress and closes stomata',
      'Low VPD (<0.4 kPa) reduces transpiration and can cause mold issues',
      'Measure VPD at multiple locations for representative readings'
    ],
    troubleshooting: [
      {
        problem: 'VPD readings inconsistent throughout day',
        solution: 'Normal variation. Track VPD every 2-4 hours and adjust environmental controls accordingly.',
        severity: 'info'
      },
      {
        problem: 'Cannot achieve target VPD',
        solution: 'Balance temperature and humidity. Increase temperature OR decrease humidity to raise VPD.',
        severity: 'warning'
      }
    ],
    relatedCalculators: ['heat-load-calculator', 'transpiration-calculator']
  },
  {
    id: 'voltage-drop-calculator',
    title: 'Voltage Drop Calculator Guide',
    description: 'NEC-compliant electrical calculations for safe and efficient installations',
    category: 'electrical',
    difficulty: 'Advanced',
    estimatedTime: '15 minutes',
    prerequisites: ['Basic electrical knowledge', 'Understanding of NEC requirements'],
    steps: [
      {
        title: 'Determine Load Current',
        description: 'Calculate or measure the actual current draw of your electrical load in amperes.',
        inputExample: '25A continuous load',
        warning: 'Use 125% of continuous loads per NEC 210.19(A)'
      },
      {
        title: 'Measure Circuit Length',
        description: 'Measure one-way distance from panel to load location in feet. Include all bends and vertical runs.',
        inputExample: '150 feet',
        expectedOutput: 'Longer circuits have higher voltage drop'
      },
      {
        title: 'Select Conductor Material',
        description: 'Choose copper or aluminum conductors based on your installation requirements.',
        inputExample: 'Copper (most common)',
        warning: 'Aluminum requires larger sizes due to higher resistance'
      },
      {
        title: 'Review NEC Compliance',
        description: 'Verify calculated voltage drop meets NEC requirements: 3% for feeders, 5% total system.',
        expectedOutput: 'Voltage drop: 2.8% - NEC compliant'
      }
    ],
    tips: [
      'NEC allows 3% voltage drop on feeders, 3% on branch circuits (5% total)',
      'Copper has lower resistance than aluminum but costs more',
      'Consider future load growth when sizing conductors',
      'Voltage drop affects motor performance and lamp output significantly'
    ],
    troubleshooting: [
      {
        problem: 'Voltage drop exceeds NEC limits',
        solution: 'Increase conductor size, reduce circuit length, or use higher system voltage.',
        severity: 'error'
      },
      {
        problem: 'Calculated values don\'t match field measurements',
        solution: 'Check for loose connections, damaged conductors, or incorrect length measurements.',
        severity: 'warning'
      }
    ],
    relatedCalculators: ['circuit-design-calculator', 'panel-load-calculator']
  }
]

interface CalculatorHelpSystemProps {
  calculatorId?: string
  onClose?: () => void
}

export function CalculatorHelpSystem({ calculatorId, onClose }: CalculatorHelpSystemProps) {
  const [selectedGuide, setSelectedGuide] = useState<CalculatorGuide | null>(
    calculatorId ? calculatorGuides.find(g => g.id === calculatorId) || null : null
  )
  const [activeStep, setActiveStep] = useState(0)

  const currentGuide = selectedGuide || calculatorGuides[0]

  if (selectedGuide) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Guide Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedGuide(null)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            ← Back to All Guides
          </Button>
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Close Help
            </Button>
          )}
        </div>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-2xl">{currentGuide.title}</CardTitle>
                <CardDescription className="text-lg mt-2">{currentGuide.description}</CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  {currentGuide.difficulty}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {currentGuide.estimatedTime}
                </Badge>
              </div>
            </div>
            
            {currentGuide.prerequisites && (
              <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-yellow-400">Prerequisites</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {currentGuide.prerequisites.map((prereq, index) => (
                    <li key={index}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Step-by-Step Guide */}
        <Tabs value="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="steps">Step-by-Step</TabsTrigger>
            <TabsTrigger value="tips">Tips & Best Practices</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            <TabsTrigger value="related">Related Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Step Navigation */}
              <div className="lg:col-span-1">
                <Card className="border-gray-700 bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {currentGuide.steps.map((step, index) => (
                      <Button
                        key={index}
                        variant={activeStep === index ? "default" : "ghost"}
                        className={`w-full justify-start text-left ${
                          activeStep === index 
                            ? "bg-blue-600 text-white" 
                            : "text-gray-300 hover:bg-gray-700"
                        }`}
                        onClick={() => setActiveStep(index)}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          {step.title}
                        </span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Step Content */}
              <div className="lg:col-span-3">
                <Card className="border-gray-700 bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {activeStep + 1}
                      </span>
                      {currentGuide.steps[activeStep].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {currentGuide.steps[activeStep].description}
                    </p>

                    {currentGuide.steps[activeStep].inputExample && (
                      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-green-400">Example Input</span>
                        </div>
                        <code className="text-green-300 font-mono">
                          {currentGuide.steps[activeStep].inputExample}
                        </code>
                      </div>
                    )}

                    {currentGuide.steps[activeStep].expectedOutput && (
                      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-blue-400">Expected Result</span>
                        </div>
                        <p className="text-blue-300">
                          {currentGuide.steps[activeStep].expectedOutput}
                        </p>
                      </div>
                    )}

                    {currentGuide.steps[activeStep].warning && (
                      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="font-medium text-red-400">Important Warning</span>
                        </div>
                        <p className="text-red-300">
                          {currentGuide.steps[activeStep].warning}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Previous Step
                      </Button>
                      <Button
                        onClick={() => setActiveStep(Math.min(currentGuide.steps.length - 1, activeStep + 1))}
                        disabled={activeStep === currentGuide.steps.length - 1}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Tips & Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentGuide.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-4">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  Common Issues & Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentGuide.troubleshooting.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      item.severity === 'error' ? 'bg-red-900/30 border-red-700' :
                      item.severity === 'warning' ? 'bg-yellow-900/30 border-yellow-700' :
                      'bg-blue-900/30 border-blue-700'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          item.severity === 'error' ? 'text-red-400' :
                          item.severity === 'warning' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                        <div>
                          <h4 className={`font-medium mb-2 ${
                            item.severity === 'error' ? 'text-red-300' :
                            item.severity === 'warning' ? 'text-yellow-300' :
                            'text-blue-300'
                          }`}>
                            {item.problem}
                          </h4>
                          <p className="text-gray-300">{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related" className="space-y-4">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Related Calculators</CardTitle>
                <CardDescription>
                  These calculators work well together for comprehensive facility design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentGuide.relatedCalculators.map((relatedId, index) => {
                    const relatedGuide = calculatorGuides.find(g => g.id === relatedId)
                    if (!relatedGuide) return null
                    
                    return (
                      <div
                        key={index}
                        className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
                        onClick={() => setSelectedGuide(relatedGuide)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white mb-1">{relatedGuide.title}</h4>
                            <p className="text-sm text-gray-400">{relatedGuide.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Guide Selection View
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Calculator Help & Tutorials</h2>
        <p className="text-gray-400 text-lg">
          Step-by-step guides to master VibeLux's professional calculators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculatorGuides.map((guide) => (
          <Card 
            key={guide.id}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all cursor-pointer group"
            onClick={() => setSelectedGuide(guide)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <div className="flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      guide.difficulty === 'Beginner' ? 'bg-green-600' :
                      guide.difficulty === 'Intermediate' ? 'bg-yellow-600' :
                      'bg-red-600'
                    } text-white`}
                  >
                    {guide.difficulty}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-white group-hover:text-green-400 transition-colors">
                {guide.title}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {guide.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>⏱️ {guide.estimatedTime}</span>
                <span>{guide.steps.length} steps</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800 h-auto p-4"
            >
              <div className="flex flex-col items-center gap-2">
                <Download className="w-6 h-6" />
                <span>Download Cheat Sheet</span>
                <span className="text-xs text-gray-400">PDF reference guide</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800 h-auto p-4"
            >
              <div className="flex flex-col items-center gap-2">
                <Play className="w-6 h-6" />
                <span>Video Tutorials</span>
                <span className="text-xs text-gray-400">Step-by-step videos</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800 h-auto p-4"
            >
              <div className="flex flex-col items-center gap-2">
                <ExternalLink className="w-6 h-6" />
                <span>API Documentation</span>
                <span className="text-xs text-gray-400">For developers</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}