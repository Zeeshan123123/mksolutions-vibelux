"use client"

import React, { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { generateCompletionReward } from '@/lib/onboarding/utils'
import { 
  Settings, 
  RotateCcw, 
  Download, 
  Trash2,
  CheckCircle,
  Clock,
  Star,
  Award,
  AlertTriangle,
  Info,
  BookOpen,
  Eye,
  Zap,
  Gift,
  BarChart3
} from 'lucide-react'

export default function OnboardingSettings() {
  const { 
    state, 
    modules, 
    updatePreferences, 
    resetOnboarding, 
    setCurrentModule 
  } = useOnboarding()
  
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)

  const handlePreferenceChange = (key: keyof typeof state.userPreferences, value: boolean) => {
    updatePreferences({ [key]: value })
  }

  const handleReset = () => {
    resetOnboarding()
    setShowResetDialog(false)
  }

  const handleRestartModule = (moduleId: string) => {
    setCurrentModule(moduleId)
  }

  const exportProgress = () => {
    const progressData = {
      completedModules: state.completedModules,
      completedSteps: state.completedSteps,
      skippedSteps: state.skippedSteps,
      progress: state.progress,
      preferences: state.userPreferences,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vibelux-onboarding-progress-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getModuleStatus = (moduleId: string) => {
    if (state.completedModules.includes(moduleId)) {
      return { status: 'completed', color: 'text-green-400', icon: CheckCircle }
    } else if (state.currentModule === moduleId) {
      return { status: 'in-progress', color: 'text-blue-400', icon: Clock }
    } else {
      return { status: 'pending', color: 'text-gray-400', icon: Clock }
    }
  }

  const getModuleProgress = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return 0
    
    const completedSteps = module.steps.filter(step => 
      state.completedSteps.includes(step.id)
    ).length
    
    return (completedSteps / module.steps.length) * 100
  }

  const reward = generateCompletionReward(
    state.progress.completedSteps,
    state.progress.totalSteps
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-400" />
            Onboarding Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your onboarding experience and preferences
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-white">
                  {state.progress.completedSteps} / {state.progress.totalSteps}
                </span>
              </div>
              <Progress value={state.progress.overallProgress} className="h-2" />
              <div className="text-xs text-gray-500 text-right">
                {Math.round(state.progress.overallProgress)}% complete
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Modules Completed</span>
                <span className="text-white">
                  {state.completedModules.length} / {modules.length}
                </span>
              </div>
              <Progress 
                value={(state.completedModules.length / modules.length) * 100} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Skipped Steps</span>
                <span className="text-white">{state.skippedSteps.length}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-600 text-gray-300"
              onClick={() => setShowProgressDialog(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-400" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Show Tooltips</Label>
                  <p className="text-xs text-gray-400">
                    Display contextual help tooltips
                  </p>
                </div>
                <Switch
                  checked={state.userPreferences.showTooltips}
                  onCheckedChange={(checked) => handlePreferenceChange('showTooltips', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Auto Progress</Label>
                  <p className="text-xs text-gray-400">
                    Automatically advance to next step
                  </p>
                </div>
                <Switch
                  checked={state.userPreferences.autoProgress}
                  onCheckedChange={(checked) => handlePreferenceChange('autoProgress', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Contextual Help</Label>
                  <p className="text-xs text-gray-400">
                    Show contextual help hints
                  </p>
                </div>
                <Switch
                  checked={state.userPreferences.showContextualHelp}
                  onCheckedChange={(checked) => handlePreferenceChange('showContextualHelp', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Completion Rewards</Label>
                  <p className="text-xs text-gray-400">
                    Show achievement rewards
                  </p>
                </div>
                <Switch
                  checked={state.userPreferences.enableRewards}
                  onCheckedChange={(checked) => handlePreferenceChange('enableRewards', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-600 text-gray-300"
              onClick={exportProgress}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Progress
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full border-orange-600 text-orange-400 hover:bg-orange-600/10"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Progress
            </Button>

            {reward && (
              <div className="p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">
                    {reward.title}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {reward.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Management */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
            Module Management
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage individual onboarding modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.map((module) => {
              const { status, color, icon: StatusIcon } = getModuleStatus(module.id)
              const progress = getModuleProgress(module.id)
              
              return (
                <div key={module.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-5 h-5 ${color}`} />
                    <div>
                      <h4 className="text-white font-medium">{module.title}</h4>
                      <p className="text-sm text-gray-400">{module.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="text-xs bg-gray-600 text-gray-300">
                          {module.steps.length} steps
                        </Badge>
                        <Badge className="text-xs bg-gray-600 text-gray-300">
                          {module.estimatedTime}
                        </Badge>
                        {progress > 0 && progress < 100 && (
                          <Badge className="text-xs bg-blue-600/20 text-blue-400">
                            {Math.round(progress)}% complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestartModule(module.id)}
                        className="border-gray-600 text-gray-300"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restart
                      </Button>
                    )}
                    {status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestartModule(module.id)}
                        className="border-blue-600 text-blue-400"
                      >
                        Start
                      </Button>
                    )}
                    {status === 'in-progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestartModule(module.id)}
                        className="border-purple-600 text-purple-400"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
              Reset Onboarding Progress
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-400">
              This will reset all your onboarding progress, including:
            </p>
            
            <ul className="text-sm text-gray-400 space-y-1 ml-4">
              <li>• Completed modules and steps</li>
              <li>• Skipped steps</li>
              <li>• User preferences</li>
              <li>• Progress tracking</li>
            </ul>
            
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">
                  This action cannot be undone
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Details Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Detailed Progress
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {modules.map((module) => {
              const progress = getModuleProgress(module.id)
              const isCompleted = state.completedModules.includes(module.id)
              
              return (
                <div key={module.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{module.title}</h4>
                    {isCompleted && (
                      <Badge className="bg-green-600/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {module.steps.map((step) => {
                      const isStepCompleted = state.completedSteps.includes(step.id)
                      const isStepSkipped = state.skippedSteps.includes(step.id)
                      
                      return (
                        <div key={step.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            {isStepCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : isStepSkipped ? (
                              <div className="w-4 h-4 bg-yellow-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">S</span>
                              </div>
                            ) : (
                              <div className="w-4 h-4 bg-gray-600 rounded-full" />
                            )}
                            <span className={`${isStepCompleted ? 'text-green-400' : 'text-gray-300'}`}>
                              {step.title}
                            </span>
                          </div>
                          
                          {isStepSkipped && (
                            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-600">
                              Skipped
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {module !== modules[modules.length - 1] && (
                    <Separator className="bg-gray-700" />
                  )}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}