"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { OnboardingController } from './index'
import DashboardTour from './tours/DashboardTour'
import DesignStudioTour from './tours/DesignStudioTour'
import CalculatorsTour from './tours/CalculatorsTour'
import AnalyticsTour from './tours/AnalyticsTour'

interface OnboardingPageWrapperProps {
  children: React.ReactNode
  showOnboarding?: boolean
  showContextualHelp?: boolean
  autoStart?: boolean
}

export default function OnboardingPageWrapper({
  children,
  showOnboarding = true,
  showContextualHelp = true,
  autoStart = false
}: OnboardingPageWrapperProps) {
  const pathname = usePathname()

  const getPageTour = () => {
    if (!showContextualHelp) return null

    switch (pathname) {
      case '/dashboard':
        return <DashboardTour />
      case '/design':
      case '/design/advanced':
        return <DesignStudioTour />
      case '/calculators':
        return <CalculatorsTour />
      case '/analytics':
      case '/energy-dashboard':
        return <AnalyticsTour />
      default:
        return null
    }
  }

  return (
    <div className="relative">
      {children}
      
      {/* Page-specific contextual help */}
      {getPageTour()}
      
      {/* Main onboarding controller */}
      {showOnboarding && (
        <OnboardingController 
          autoStart={autoStart}
          showProgress={true}
        />
      )}
    </div>
  )
}