"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Star,
  Zap,
  Brain,
  Calculator,
  BarChart3,
  Settings,
  Lightbulb,
  Users,
  Shield,
  X
} from 'lucide-react'

interface WelcomeSequenceProps {
  isOpen: boolean
  onClose: () => void
  onStartOnboarding: (moduleId?: string) => void
  onSkipOnboarding: () => void
}

export default function WelcomeSequence({ 
  isOpen, 
  onClose, 
  onStartOnboarding, 
  onSkipOnboarding 
}: WelcomeSequenceProps) {
  const { user } = useAuth()
  const { modules, state } = useOnboarding()
  const [currentView, setCurrentView] = useState<'welcome' | 'overview' | 'modules'>('welcome')
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  
  const userName = user?.firstName || 'there'
  const isReturningUser = state.completedSteps.length > 0

  const handleStartOnboarding = (moduleId?: string) => {
    onStartOnboarding(moduleId)
    onClose()
  }

  const handleSkipOnboarding = () => {
    onSkipOnboarding()
    onClose()
  }

  const getModuleIcon = (moduleId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'welcome': <Sparkles className="w-5 h-5" />,
      'design-studio': <Brain className="w-5 h-5" />,
      'calculators': <Calculator className="w-5 h-5" />,
      'facility-setup': <Settings className="w-5 h-5" />,
      'analytics': <BarChart3 className="w-5 h-5" />
    }
    return iconMap[moduleId] || <Star className="w-5 h-5" />
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'getting-started': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'design-studio': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'calculators': 'bg-green-500/20 text-green-400 border-green-500/30',
      'analytics': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'advanced': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return colorMap[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const WelcomeView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to VibeLux, {userName}! 👋
          </h2>
          <p className="text-gray-400 text-lg">
            {isReturningUser 
              ? "Welcome back! Ready to continue your journey?" 
              : "Let's get you set up with the most comprehensive cultivation platform"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center pb-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-lg text-white">AI-Powered Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 text-center">
              Create optimized lighting designs with AI assistance and 60+ CAD formats
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center pb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Calculator className="w-6 h-6 text-green-400" />
            </div>
            <CardTitle className="text-lg text-white">25+ Calculators</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 text-center">
              Professional tools for VPD, PPFD, nutrients, and all cultivation calculations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center pb-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="text-lg text-white">Real-Time Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 text-center">
              Monitor performance, track energy usage, and optimize operations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={() => setCurrentView('overview')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          Get Started
        </Button>
        <Button 
          onClick={() => setCurrentView('modules')}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          size="lg"
        >
          Choose Your Path
        </Button>
        <Button 
          onClick={handleSkipOnboarding}
          variant="ghost"
          className="text-gray-400 hover:text-white"
          size="lg"
        >
          Skip for Now
        </Button>
      </div>
    </div>
  )

  const OverviewView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Play className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Learning Journey
          </h2>
          <p className="text-gray-400">
            We'll guide you through the essential features step by step
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
          What You'll Learn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Navigate the Dashboard</p>
                <p className="text-sm text-gray-400">Your central hub for all operations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Create Lighting Designs</p>
                <p className="text-sm text-gray-400">AI-powered design studio basics</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Use Professional Tools</p>
                <p className="text-sm text-gray-400">Master the calculator suite</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Monitor Performance</p>
                <p className="text-sm text-gray-400">Analytics and reporting tools</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Set Up Your Facility</p>
                <p className="text-sm text-gray-400">Configure zones and equipment</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Optimize Operations</p>
                <p className="text-sm text-gray-400">Energy savings and automation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-500/20">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-white font-medium">Estimated Time: 15-20 minutes</p>
            <p className="text-sm text-gray-400">Complete at your own pace, skip any step</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={() => handleStartOnboarding()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          size="lg"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Start Learning
        </Button>
        <Button 
          onClick={() => setCurrentView('modules')}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          size="lg"
        >
          Choose Specific Module
        </Button>
      </div>
    </div>
  )

  const ModulesView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-red-600 rounded-full flex items-center justify-center mx-auto">
          <Star className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Choose Your Learning Path
          </h2>
          <p className="text-gray-400">
            Select specific modules you want to explore
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {modules.map((module) => {
          const isCompleted = state.completedModules.includes(module.id)
          const isSelected = selectedModule === module.id
          
          return (
            <Card 
              key={module.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-purple-900/30 border-purple-500/50' 
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
              }`}
              onClick={() => setSelectedModule(isSelected ? null : module.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      {getModuleIcon(module.id)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white flex items-center">
                        {module.title}
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-400 ml-2" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getCategoryColor(module.category)}>
                      {module.category.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {module.estimatedTime}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {isSelected && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Steps:</span>
                      <span className="text-white">{module.steps.length}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {module.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2 text-sm">
                          <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                            {index + 1}
                          </div>
                          <span className="text-gray-300">{step.title}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => handleStartOnboarding(module.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      Start This Module
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={() => handleStartOnboarding()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          size="lg"
        >
          Start Full Tour
        </Button>
        <Button 
          onClick={() => setCurrentView('overview')}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          size="lg"
        >
          Back to Overview
        </Button>
      </div>
    </div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeView />
      case 'overview':
        return <OverviewView />
      case 'modules':
        return <ModulesView />
      default:
        return <WelcomeView />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {currentView === 'welcome' && 'Welcome to VibeLux'}
              {currentView === 'overview' && 'Onboarding Overview'}
              {currentView === 'modules' && 'Learning Modules'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {renderCurrentView()}
      </DialogContent>
    </Dialog>
  )
}