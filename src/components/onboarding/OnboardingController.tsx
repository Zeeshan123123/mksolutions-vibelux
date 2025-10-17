"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useOnboardingTour } from '@/hooks/useOnboardingTour'
import WelcomeSequence from './WelcomeSequence'
import OnboardingTooltip from './OnboardingTooltip'
import OnboardingProgress from './OnboardingProgress'
import { trackOnboardingEvent } from '@/lib/onboarding/utils'

interface OnboardingControllerProps {
  autoStart?: boolean
  showProgress?: boolean
}

export default function OnboardingController({ 
  autoStart = false, 
  showProgress = true 
}: OnboardingControllerProps) {
  const { user } = useAuth()
  const { 
    isOnboardingActive, 
    currentStep, 
    startOnboarding, 
    skipOnboarding, 
    completeOnboarding,
    state 
  } = useOnboarding()
  
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  // Check if user should see welcome on first visit
  useEffect(() => {
    if (!user?.id) return

    const hasSeenWelcome = localStorage.getItem(`onboarding_welcome_${user.id}`)
    const isFirstVisit = !hasSeenWelcome && state.completedSteps.length === 0
    
    if (isFirstVisit && autoStart && !hasShownWelcome) {
      setShowWelcome(true)
      setHasShownWelcome(true)
      localStorage.setItem(`onboarding_welcome_${user.id}`, 'true')
    }
  }, [user?.id, autoStart, state.completedSteps.length, hasShownWelcome])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOnboardingActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          handleCloseOnboarding()
          break
        case 'ArrowRight':
          e.preventDefault()
          // This will be handled by the tour hook
          break
        case 'ArrowLeft':
          e.preventDefault()
          // This will be handled by the tour hook
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOnboardingActive])

  const handleStartOnboarding = (moduleId?: string) => {
    trackOnboardingEvent('start', { moduleId })
    startOnboarding(moduleId)
    setShowWelcome(false)
  }

  const handleSkipOnboarding = () => {
    trackOnboardingEvent('skip', {})
    skipOnboarding()
    setShowWelcome(false)
  }

  const handleCompleteOnboarding = () => {
    trackOnboardingEvent('complete', {
      completionRate: state.progress.overallProgress
    })
    completeOnboarding()
  }

  const handleCloseOnboarding = () => {
    skipOnboarding()
  }

  return (
    <>
      {/* Welcome Modal */}
      <WelcomeSequence
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onStartOnboarding={handleStartOnboarding}
        onSkipOnboarding={handleSkipOnboarding}
      />

      {/* Onboarding Tooltip */}
      <OnboardingTooltip
        isVisible={isOnboardingActive && !showWelcome}
        onClose={handleCloseOnboarding}
      />

      {/* Progress Indicator */}
      {showProgress && isOnboardingActive && (
        <OnboardingProgress
          onClose={handleCloseOnboarding}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Floating Action Button for Manual Start */}
      {!isOnboardingActive && !showWelcome && state.progress.overallProgress < 100 && (
        <button
          onClick={() => setShowWelcome(true)}
          className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          title="Continue Onboarding"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </>
  )
}