"use client"

import React, { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { generateCompletionReward } from '@/lib/onboarding/utils'
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Trophy,
  Target,
  BarChart3,
  X,
  Settings,
  Award,
  Gift
} from 'lucide-react'

interface OnboardingProgressProps {
  onClose: () => void
  onComplete: () => void
}

export default function OnboardingProgress({ onClose, onComplete }: OnboardingProgressProps) {
  const { state, modules, currentStep } = useOnboarding()
  const [showReward, setShowReward] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const currentModule = modules.find(m => m.id === state.currentModule)
  const reward = generateCompletionReward(
    state.progress.completedSteps,
    state.progress.totalSteps
  )

  const getModuleProgress = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return 0
    
    const moduleSteps = module.steps.length
    const completedModuleSteps = module.steps.filter(step => 
      state.completedSteps.includes(step.id)
    ).length
    
    return (completedModuleSteps / moduleSteps) * 100
  }

  const handleShowReward = () => {
    if (reward) {
      setShowReward(true)
    }
  }

  const handleComplete = () => {
    onComplete()
    if (reward && reward.type === 'completion') {
      setShowReward(true)
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-[9998]">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-600 shadow-lg"
          size="sm"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {Math.round(state.progress.overallProgress)}%
        </Button>
      </div>
    )
  }

  return (
    <>
      <Card className="fixed top-4 right-4 z-[9998] w-80 bg-gray-800/95 border-gray-700 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg text-white">Learning Progress</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Overall Progress</span>
              <span className="text-sm font-semibold text-white">
                {state.progress.completedSteps} / {state.progress.totalSteps}
              </span>
            </div>
            <Progress value={state.progress.overallProgress} className="h-2" />
            <div className="text-xs text-gray-500 text-right">
              {Math.round(state.progress.overallProgress)}% complete
            </div>
          </div>

          {/* Current Module */}
          {currentModule && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current Module</span>
                <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                  {currentModule.title}
                </Badge>
              </div>
              <Progress value={getModuleProgress(currentModule.id)} className="h-2" />
              <div className="text-xs text-gray-500">
                {currentStep?.title}
              </div>
            </div>
          )}

          {/* Module List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Modules</span>
              <span className="text-xs text-gray-500">
                {state.completedModules.length} / {modules.length}
              </span>
            </div>
            
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {modules.map((module) => {
                const isCompleted = state.completedModules.includes(module.id)
                const isCurrent = state.currentModule === module.id
                const progress = getModuleProgress(module.id)
                
                return (
                  <div
                    key={module.id}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      isCurrent ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4 text-purple-400" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-600 rounded-full" />
                      )}
                      <span className={`truncate ${isCompleted ? 'text-green-400' : 'text-gray-300'}`}>
                        {module.title}
                      </span>
                    </div>
                    
                    {!isCompleted && progress > 0 && (
                      <span className="text-xs text-gray-400">
                        {Math.round(progress)}%
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reward Button */}
          {reward && (
            <Button
              onClick={handleShowReward}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              size="sm"
            >
              <Gift className="w-4 h-4 mr-2" />
              View Reward
            </Button>
          )}

          {/* Complete Button */}
          {state.progress.overallProgress >= 100 && (
            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              size="sm"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Complete Onboarding
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Reward Modal */}
      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-400 mr-2" />
              Congratulations!
            </DialogTitle>
          </DialogHeader>
          
          {reward && (
            <div className="space-y-4 text-center">
              <div className="text-6xl">{reward.icon}</div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{reward.title}</h3>
                <p className="text-gray-400">{reward.description}</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-yellow-400 font-semibold">+{reward.points}</div>
                  <div className="text-xs text-gray-400">Points</div>
                </div>
                
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                  <div className="text-purple-400 font-semibold">{reward.badge}</div>
                  <div className="text-xs text-gray-400">Badge</div>
                </div>
              </div>
              
              <Button
                onClick={() => setShowReward(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                Awesome!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}