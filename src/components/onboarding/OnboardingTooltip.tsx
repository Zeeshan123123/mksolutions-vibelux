"use client"

import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOnboardingTour } from '@/hooks/useOnboardingTour'
import { getElementPosition, calculateTooltipPosition } from '@/lib/onboarding/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  SkipForward, 
  RotateCcw,
  Clock,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface OnboardingTooltipProps {
  isVisible: boolean
  onClose: () => void
}

export default function OnboardingTooltip({ isVisible, onClose }: OnboardingTooltipProps) {
  const {
    currentStep,
    isLoading,
    error,
    stepProgress,
    deviceOptimizations,
    handleNextStep,
    handlePreviousStep,
    handleSkipStep,
    restartCurrentStep,
    canGoBack,
    canGoNext,
    isLastStep
  } = useOnboardingTour()

  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' as const })
  const [isVisible_, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 140 })

  // Update tooltip position when step changes
  useEffect(() => {
    if (!currentStep || !isVisible) {
      setIsVisible(false)
      return
    }

    const updatePosition = () => {
      if (currentStep.position === 'center') {
        // Center modal on screen
        setPosition({
          top: window.innerHeight / 2 - tooltipSize.height / 2,
          left: window.innerWidth / 2 - tooltipSize.width / 2,
          placement: 'bottom'
        })
        setIsVisible(true)
        return
      }

      if (!currentStep.targetElement) {
        setIsVisible(false)
        return
      }

      const elementPosition = getElementPosition(currentStep.targetElement)
      if (!elementPosition) {
        setIsVisible(false)
        return
      }

      const calculatedPosition = calculateTooltipPosition(
        elementPosition,
        currentStep.position || 'bottom',
        deviceOptimizations.tooltipSize
      )

      setPosition(calculatedPosition)
      setIsVisible(true)
    }

    // Small delay to ensure DOM updates
    const timer = setTimeout(updatePosition, 100)
    
    // Update position on resize
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [currentStep, isVisible, tooltipSize, deviceOptimizations.tooltipSize])

  // Measure tooltip size when it renders
  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect()
      setTooltipSize({ width: rect.width, height: rect.height })
    }
  }, [currentStep])

  if (!isVisible || !currentStep || !isVisible_) {
    return null
  }

  const getArrowPosition = () => {
    const { placement } = position
    const arrowClasses = "absolute w-3 h-3 bg-gray-800 border-l border-t border-gray-700 rotate-45"
    
    switch (placement) {
      case 'top':
        return <div className={`${arrowClasses} -bottom-1.5 left-1/2 transform -translate-x-1/2`} />
      case 'bottom':
        return <div className={`${arrowClasses} -top-1.5 left-1/2 transform -translate-x-1/2 rotate-[225deg]`} />
      case 'left':
        return <div className={`${arrowClasses} -right-1.5 top-1/2 transform -translate-y-1/2 rotate-[315deg]`} />
      case 'right':
        return <div className={`${arrowClasses} -left-1.5 top-1/2 transform -translate-y-1/2 rotate-[135deg]`} />
      default:
        return null
    }
  }

  const tooltipContent = (
    <Card 
      ref={tooltipRef}
      className={`
        fixed z-[10000] bg-gray-800 border-gray-700 shadow-2xl
        ${deviceOptimizations.isMobile ? 'w-80 max-w-[90vw]' : 'w-96 max-w-[400px]'}
        ${currentStep.position === 'center' ? 'shadow-2xl' : ''}
      `}
      style={{
        top: position.top,
        left: position.left,
        transform: currentStep.position === 'center' ? 'translate(-50%, -50%)' : 'none'
      }}
    >
      {/* Arrow for positioned tooltips */}
      {currentStep.position !== 'center' && getArrowPosition()}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-500/30">
              Step {stepProgress.current} of {stepProgress.total}
            </Badge>
            {currentStep.isOptional && (
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                Optional
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <CardTitle className="text-lg text-white flex items-center">
          {currentStep.title}
          {currentStep.targetElement && (
            <Target className="w-4 h-4 ml-2 text-purple-400" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-gray-300 text-base">
          {currentStep.description}
        </CardDescription>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{Math.round(stepProgress.percentage)}%</span>
          </div>
          <Progress value={stepProgress.percentage} className="h-2" />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Preparing step...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="flex gap-2 flex-1">
            {canGoBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousStep}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={restartCurrentStep}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipStep}
              className="text-gray-400 hover:text-white"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        {!deviceOptimizations.isMobile && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
            <div className="flex justify-between">
              <span>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">←</kbd> to go back</span>
              <span>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">→</kbd> to continue</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Render tooltip in portal for proper positioning
  return createPortal(tooltipContent, document.body)
}