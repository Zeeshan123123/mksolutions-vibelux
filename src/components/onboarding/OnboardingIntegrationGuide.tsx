"use client"

import React, { useState } from 'react'
import { logger } from '@/lib/logging/production-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code, 
  BookOpen, 
  Zap, 
  Users, 
  Settings,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react'

export default function OnboardingIntegrationGuide() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const codeExamples = {
    basicIntegration: `// pages/dashboard.tsx
import { OnboardingPageWrapper } from '@/components/onboarding'

export default function Dashboard() {
  return (
    <OnboardingPageWrapper showOnboarding={true} autoStart={true}>
      <div data-onboarding="dashboard">
        {/* Your dashboard content */}
      </div>
    </OnboardingPageWrapper>
  )
}`,

    contextualHelp: `// Add contextual help to any element
import { HelpWrapper } from '@/components/onboarding'

<HelpWrapper
  elementId="my-feature"
  title="Feature Name"
  content="Description of the feature"
  type="tip"
  position="bottom"
>
  <button data-onboarding-help="my-feature">
    My Feature Button
  </button>
</HelpWrapper>`,

    customTour: `// Create a custom tour
import { useOnboarding } from '@/components/onboarding'

export function MyCustomTour() {
  const { startOnboarding } = useOnboarding()
  
  const customModule = {
    id: 'custom-tour',
    title: 'Custom Feature Tour',
    steps: [
      {
        id: 'step-1',
        title: 'First Step',
        description: 'This is the first step',
        targetElement: '[data-onboarding="step-1"]',
        position: 'bottom'
      }
    ]
  }
  
  return (
    <button onClick={() => startOnboarding('custom-tour')}>
      Start Custom Tour
    </button>
  )
}`,

    providerSetup: `// app/layout.tsx
import { OnboardingProvider } from '@/components/onboarding'

export default function RootLayout({ children }) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  )
}`,

    facilitySetup: `// Use the facility setup wizard
import { FacilitySetupWizard } from '@/components/onboarding'

export function SetupPage() {
  const handleComplete = (config) => {
    // Handle facility configuration
    logger.info('system', 'Facility config:', { data: config })
  }
  
  return (
    <FacilitySetupWizard 
      onComplete={handleComplete}
      onSkip={() => logger.info('system', 'Setup skipped')}
    />
  )
}`,

    customTooltip: `// Custom contextual tooltip
import { ContextualTooltip } from '@/components/onboarding'

<ContextualTooltip
  elementId="advanced-feature"
  title="Advanced Feature"
  content="This feature requires professional subscription"
  type="warning"
  showOnHover={true}
  persistent={true}
  learnMoreUrl="/docs/advanced-features"
/>`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-400" />
            Onboarding Integration Guide
          </CardTitle>
          <CardDescription className="text-gray-400">
            Learn how to integrate the VibeLux onboarding system into your application
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="quick-start" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-start" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">1. Setup the Provider</CardTitle>
              <CardDescription className="text-gray-400">
                Wrap your application with the OnboardingProvider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(codeExamples.providerSetup, 'provider')}
                >
                  {copiedCode === 'provider' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.providerSetup}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">2. Add Page Wrapper</CardTitle>
              <CardDescription className="text-gray-400">
                Wrap your pages with OnboardingPageWrapper
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(codeExamples.basicIntegration, 'basic')}
                >
                  {copiedCode === 'basic' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.basicIntegration}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">3. Add Data Attributes</CardTitle>
              <CardDescription className="text-gray-400">
                Add data attributes to elements for targeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">For guided tours:</h4>
                  <Badge variant="outline" className="font-mono">
                    data-onboarding="element-id"
                  </Badge>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">For contextual help:</h4>
                  <Badge variant="outline" className="font-mono">
                    data-onboarding-help="element-id"
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  OnboardingController
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Main controller for the onboarding system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Manages welcome sequence</li>
                  <li>• Controls guided tours</li>
                  <li>• Handles progress tracking</li>
                  <li>• Provides floating action button</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  HelpWrapper
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Contextual help for UI elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Hover/click tooltips</li>
                  <li>• Multiple tooltip types</li>
                  <li>• Customizable positioning</li>
                  <li>• Learn more links</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  FacilitySetupWizard
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Interactive facility configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Multi-step configuration</li>
                  <li>• Crop and equipment selection</li>
                  <li>• Zone configuration</li>
                  <li>• Validation and presets</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="w-5 h-5 mr-2 text-blue-400" />
                  Tour Components
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Page-specific tour guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• DashboardTour</li>
                  <li>• DesignStudioTour</li>
                  <li>• CalculatorsTour</li>
                  <li>• AnalyticsTour</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contextual Help Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(codeExamples.contextualHelp, 'contextual')}
                >
                  {copiedCode === 'contextual' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.contextualHelp}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Custom Tour Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(codeExamples.customTour, 'custom')}
                >
                  {copiedCode === 'custom' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.customTour}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Facility Setup Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(codeExamples.facilitySetup, 'facility')}
                >
                  {copiedCode === 'facility' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.facilitySetup}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Customization Options</CardTitle>
              <CardDescription className="text-gray-400">
                Tailor the onboarding experience to your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Tooltip Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-600/20 text-blue-400">info</Badge>
                    <Badge className="bg-yellow-600/20 text-yellow-400">tip</Badge>
                    <Badge className="bg-orange-600/20 text-orange-400">warning</Badge>
                    <Badge className="bg-purple-600/20 text-purple-400">help</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Positioning:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">top</Badge>
                    <Badge variant="outline">bottom</Badge>
                    <Badge variant="outline">left</Badge>
                    <Badge variant="outline">right</Badge>
                    <Badge variant="outline">center</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">User Preferences:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Show/hide tooltips</li>
                    <li>• Auto-progress tours</li>
                    <li>• Contextual help</li>
                    <li>• Completion rewards</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Tooltip</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(codeExamples.customTooltip, 'tooltip')}
                >
                  {copiedCode === 'tooltip' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.customTooltip}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Code className="w-4 h-4 mr-2" />
              API Reference
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Users className="w-4 h-4 mr-2" />
              Community
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}