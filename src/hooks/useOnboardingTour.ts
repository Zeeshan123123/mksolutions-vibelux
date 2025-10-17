import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logging/production-logger';
import { useOnboarding } from '@/contexts/OnboardingContext'
import { 
  waitForElement, 
  scrollToElement, 
  createSpotlight, 
  removeSpotlight,
  trackOnboardingEvent,
  getDeviceAdjustments
} from '@/lib/onboarding/utils'

interface UseTourOptions {
  autoStart?: boolean
  scrollOffset?: number
  highlightDelay?: number
  enableSpotlight?: boolean
}

export const useOnboardingTour = (options: UseTourOptions = {}) => {
  const {
    autoStart = true,
    scrollOffset = 100,
    highlightDelay = 500,
    enableSpotlight = true
  } = options

  const router = useRouter()
  const { 
    isOnboardingActive, 
    currentStep, 
    nextStep, 
    previousStep, 
    skipStep, 
    completeStep,
    state
  } = useOnboarding()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const spotlightRef = useRef<HTMLElement | null>(null)
  const stepStartTime = useRef<number>(0)

  // Auto-start tour when component mounts
  useEffect(() => {
    if (autoStart && isOnboardingActive && currentStep) {
      startCurrentStep()
    }
  }, [autoStart, isOnboardingActive, currentStep])

  // Clean up spotlight when component unmounts
  useEffect(() => {
    return () => {
      if (spotlightRef.current) {
        removeSpotlight()
      }
    }
  }, [])

  const startCurrentStep = async () => {
    if (!currentStep) return

    setIsLoading(true)
    setError(null)
    stepStartTime.current = Date.now()

    try {
      // Navigate to page if required
      if (currentStep.page && window.location.pathname !== currentStep.page) {
        router.push(currentStep.page)
        
        // Wait for navigation to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Wait for target element if specified
      if (currentStep.targetElement) {
        await waitForElement(currentStep.targetElement, 5000)
        
        // Scroll to element
        await new Promise(resolve => setTimeout(resolve, 300))
        scrollToElement(currentStep.targetElement, scrollOffset)
        
        // Add spotlight effect
        if (enableSpotlight) {
          await new Promise(resolve => setTimeout(resolve, highlightDelay))
          spotlightRef.current = createSpotlight(currentStep.targetElement)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start step')
      logger.error('api', 'Error starting onboarding step:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = () => {
    if (!currentStep) return

    // Track step completion
    const timeSpent = Date.now() - stepStartTime.current
    trackOnboardingEvent('step_complete', {
      stepId: currentStep.id,
      timeSpent,
      completionRate: (state.completedSteps.length / state.progress.totalSteps) * 100
    })

    // Remove spotlight
    if (spotlightRef.current) {
      removeSpotlight()
      spotlightRef.current = null
    }

    // Complete step and move to next
    completeStep(currentStep.id)
  }

  const handlePreviousStep = () => {
    if (spotlightRef.current) {
      removeSpotlight()
      spotlightRef.current = null
    }
    
    previousStep()
  }

  const handleSkipStep = () => {
    if (!currentStep) return

    // Track step skip
    const timeSpent = Date.now() - stepStartTime.current
    trackOnboardingEvent('step_skip', {
      stepId: currentStep.id,
      timeSpent
    })

    // Remove spotlight
    if (spotlightRef.current) {
      removeSpotlight()
      spotlightRef.current = null
    }

    // Skip step
    skipStep(currentStep.id)
  }

  const restartCurrentStep = () => {
    if (spotlightRef.current) {
      removeSpotlight()
      spotlightRef.current = null
    }
    
    startCurrentStep()
  }

  const getStepProgress = () => {
    if (!currentStep) return { current: 0, total: 0, percentage: 0 }

    const { completedSteps, progress } = state
    const current = completedSteps.length + 1
    const total = progress.totalSteps
    const percentage = (current / total) * 100

    return { current, total, percentage }
  }

  const getDeviceOptimizations = () => {
    const adjustments = getDeviceAdjustments()
    
    return {
      isMobile: adjustments.isMobile,
      isTablet: adjustments.isTablet,
      tooltipSize: adjustments.tooltipSize,
      shouldUseModal: adjustments.isMobile && currentStep?.position === 'center'
    }
  }

  return {
    // State
    isOnboardingActive,
    currentStep,
    isLoading,
    error,
    stepProgress: getStepProgress(),
    deviceOptimizations: getDeviceOptimizations(),
    
    // Actions
    startCurrentStep,
    handleNextStep,
    handlePreviousStep,
    handleSkipStep,
    restartCurrentStep,
    
    // Utilities
    canGoBack: state.currentStep > 0,
    canGoNext: !!currentStep,
    isLastStep: !currentStep || getStepProgress().current >= getStepProgress().total
  }
}