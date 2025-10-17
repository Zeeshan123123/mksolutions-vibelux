"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from "@clerk/nextjs"
import { logger } from '@/lib/client-logger';

export interface OnboardingStep {
  id: string
  title: string
  description: string
  targetElement?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  page?: string
  action?: string
  isCompleted?: boolean
  isOptional?: boolean
  order: number
}

export interface OnboardingModule {
  id: string
  title: string
  description: string
  icon: string
  estimatedTime: string
  steps: OnboardingStep[]
  isCompleted?: boolean
  isOptional?: boolean
  prerequisite?: string[]
  category: 'getting-started' | 'design-studio' | 'dashboard' | 'calculators' | 'analytics' | 'advanced'
}

export interface OnboardingState {
  isActive: boolean
  currentStep: number
  currentModule: string | null
  completedSteps: string[]
  completedModules: string[]
  skippedSteps: string[]
  userPreferences: {
    showTooltips: boolean
    autoProgress: boolean
    showContextualHelp: boolean
    enableRewards: boolean
  }
  progress: {
    totalSteps: number
    completedSteps: number
    overallProgress: number
  }
}

interface OnboardingContextType {
  state: OnboardingState
  modules: OnboardingModule[]
  isOnboardingActive: boolean
  currentStep: OnboardingStep | null
  
  // Actions
  startOnboarding: (moduleId?: string) => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  skipStep: (stepId: string) => void
  completeStep: (stepId: string) => void
  completeModule: (moduleId: string) => void
  setCurrentModule: (moduleId: string) => void
  updatePreferences: (preferences: Partial<OnboardingState['userPreferences']>) => void
  resetOnboarding: () => void
  
  // Utilities
  getStepById: (stepId: string) => OnboardingStep | null
  getModuleById: (moduleId: string) => OnboardingModule | null
  getNextModule: () => OnboardingModule | null
  shouldShowTooltip: (elementId: string) => boolean
  markElementSeen: (elementId: string) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

// Default onboarding modules
const defaultModules: OnboardingModule[] = [
  {
    id: 'welcome',
    title: 'Welcome to VibeLux',
    description: 'Get introduced to the platform and its key features',
    icon: '👋',
    estimatedTime: '3 minutes',
    category: 'getting-started',
    steps: [
      {
        id: 'welcome-intro',
        title: 'Welcome to VibeLux',
        description: 'Let\'s get you started with the most comprehensive cultivation platform',
        position: 'center',
        order: 1
      },
      {
        id: 'dashboard-overview',
        title: 'Your Dashboard',
        description: 'This is your central hub for monitoring all your facilities and projects',
        targetElement: '[data-onboarding="dashboard"]',
        position: 'bottom',
        page: '/dashboard',
        order: 2
      },
      {
        id: 'navigation-tour',
        title: 'Main Navigation',
        description: 'Access all platform features from this navigation menu',
        targetElement: '[data-onboarding="navigation"]',
        position: 'right',
        order: 3
      }
    ]
  },
  {
    id: 'design-studio',
    title: 'Design Studio',
    description: 'Learn to create and optimize lighting designs',
    icon: '🎨',
    estimatedTime: '5 minutes',
    category: 'design-studio',
    prerequisite: ['welcome'],
    steps: [
      {
        id: 'design-intro',
        title: 'AI-Powered Design Studio',
        description: 'Create professional lighting designs with AI assistance',
        targetElement: '[data-onboarding="design-studio"]',
        position: 'bottom',
        page: '/design',
        order: 1
      },
      {
        id: 'cad-import',
        title: 'Import CAD Files',
        description: 'Upload your existing facility designs in 60+ formats',
        targetElement: '[data-onboarding="cad-import"]',
        position: 'left',
        page: '/design',
        order: 2
      },
      {
        id: 'fixture-placement',
        title: 'Place Fixtures',
        description: 'Add and position lighting fixtures in your design',
        targetElement: '[data-onboarding="fixture-placement"]',
        position: 'top',
        page: '/design',
        order: 3
      },
      {
        id: 'ppfd-analysis',
        title: 'PPFD Analysis',
        description: 'View real-time light distribution and uniformity analysis',
        targetElement: '[data-onboarding="ppfd-analysis"]',
        position: 'right',
        page: '/design',
        order: 4
      }
    ]
  },
  {
    id: 'calculators',
    title: 'Professional Calculators',
    description: 'Master the 25+ professional calculators',
    icon: '🧮',
    estimatedTime: '4 minutes',
    category: 'calculators',
    steps: [
      {
        id: 'calculator-overview',
        title: 'Calculator Suite',
        description: 'Access 25+ professional calculators for all your calculations',
        targetElement: '[data-onboarding="calculators"]',
        position: 'bottom',
        page: '/calculators',
        order: 1
      },
      {
        id: 'vpd-calculator',
        title: 'VPD Calculator',
        description: 'Calculate Vapor Pressure Deficit for optimal plant growth',
        targetElement: '[data-onboarding="vpd-calculator"]',
        position: 'left',
        page: '/calculators',
        order: 2
      },
      {
        id: 'light-requirements',
        title: 'Light Requirements',
        description: 'Calculate optimal PPFD for your specific crops',
        targetElement: '[data-onboarding="light-requirements"]',
        position: 'top',
        page: '/calculators',
        order: 3
      }
    ]
  },
  {
    id: 'facility-setup',
    title: 'Facility Configuration',
    description: 'Set up your facility for optimal monitoring and control',
    icon: '🏭',
    estimatedTime: '6 minutes',
    category: 'getting-started',
    steps: [
      {
        id: 'facility-info',
        title: 'Basic Information',
        description: 'Tell us about your facility type and growing operation',
        position: 'center',
        order: 1
      },
      {
        id: 'crop-selection',
        title: 'Crop Selection',
        description: 'Choose your primary crops to customize the experience',
        position: 'center',
        order: 2
      },
      {
        id: 'equipment-setup',
        title: 'Equipment Setup',
        description: 'Connect your existing sensors and control systems',
        position: 'center',
        order: 3
      },
      {
        id: 'zone-configuration',
        title: 'Zone Configuration',
        description: 'Set up growing zones and environmental targets',
        position: 'center',
        order: 4
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Monitoring',
    description: 'Learn to track performance and optimize operations',
    icon: '📊',
    estimatedTime: '4 minutes',
    category: 'analytics',
    prerequisite: ['facility-setup'],
    steps: [
      {
        id: 'analytics-overview',
        title: 'Performance Analytics',
        description: 'Monitor your facility performance with advanced analytics',
        targetElement: '[data-onboarding="analytics"]',
        position: 'bottom',
        page: '/analytics',
        order: 1
      },
      {
        id: 'energy-monitoring',
        title: 'Energy Monitoring',
        description: 'Track energy consumption and identify savings opportunities',
        targetElement: '[data-onboarding="energy-monitoring"]',
        position: 'left',
        page: '/energy-dashboard',
        order: 2
      },
      {
        id: 'alerts-setup',
        title: 'Alert Configuration',
        description: 'Set up alerts for critical conditions and equipment issues',
        targetElement: '[data-onboarding="alerts"]',
        position: 'top',
        order: 3
      }
    ]
  }
]

const initialState: OnboardingState = {
  isActive: false,
  currentStep: 0,
  currentModule: null,
  completedSteps: [],
  completedModules: [],
  skippedSteps: [],
  userPreferences: {
    showTooltips: true,
    autoProgress: false,
    showContextualHelp: true,
    enableRewards: true
  },
  progress: {
    totalSteps: 0,
    completedSteps: 0,
    overallProgress: 0
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<OnboardingState>(initialState)
  const [modules] = useState<OnboardingModule[]>(defaultModules)
  const [seenElements, setSeenElements] = useState<string[]>([])

  // Calculate progress whenever state changes
  useEffect(() => {
    const totalSteps = modules.reduce((acc, module) => acc + module.steps.length, 0)
    const completedSteps = state.completedSteps.length
    const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

    setState(prev => ({
      ...prev,
      progress: {
        totalSteps,
        completedSteps,
        overallProgress
      }
    }))
  }, [state.completedSteps, modules])

  // Load user's onboarding progress from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedState = localStorage.getItem(`onboarding_${user.id}`)
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          setState(prev => ({ ...prev, ...parsed }))
        } catch (error) {
          logger.error('system', 'Error loading onboarding state:', error )
        }
      }
    }
  }, [user?.id])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(state))
    }
  }, [state, user?.id])

  const getCurrentModule = () => {
    if (!state.currentModule) return null
    return modules.find(m => m.id === state.currentModule) || null
  }

  const getCurrentStep = () => {
    const module = getCurrentModule()
    if (!module || state.currentStep >= module.steps.length) return null
    return module.steps[state.currentStep]
  }

  const startOnboarding = (moduleId?: string) => {
    const targetModule = moduleId ? modules.find(m => m.id === moduleId) : modules[0]
    if (!targetModule) return

    setState(prev => ({
      ...prev,
      isActive: true,
      currentModule: targetModule.id,
      currentStep: 0
    }))
  }

  const skipOnboarding = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentModule: null,
      currentStep: 0
    }))
  }

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentModule: null,
      currentStep: 0,
      completedModules: [...modules.map(m => m.id)]
    }))
  }

  const nextStep = () => {
    const module = getCurrentModule()
    if (!module) return

    const nextStepIndex = state.currentStep + 1
    if (nextStepIndex >= module.steps.length) {
      // Module completed
      completeModule(module.id)
      
      // Find next module
      const nextModule = getNextModule()
      if (nextModule) {
        setState(prev => ({
          ...prev,
          currentModule: nextModule.id,
          currentStep: 0
        }))
      } else {
        completeOnboarding()
      }
    } else {
      setState(prev => ({
        ...prev,
        currentStep: nextStepIndex
      }))
    }
  }

  const previousStep = () => {
    if (state.currentStep > 0) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }))
    }
  }

  const skipStep = (stepId: string) => {
    setState(prev => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps, stepId]
    }))
    nextStep()
  }

  const completeStep = (stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }))
    nextStep()
  }

  const completeModule = (moduleId: string) => {
    setState(prev => ({
      ...prev,
      completedModules: [...prev.completedModules, moduleId]
    }))
  }

  const setCurrentModule = (moduleId: string) => {
    setState(prev => ({
      ...prev,
      currentModule: moduleId,
      currentStep: 0,
      isActive: true
    }))
  }

  const updatePreferences = (preferences: Partial<OnboardingState['userPreferences']>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }))
  }

  const resetOnboarding = () => {
    setState(initialState)
    setSeenElements([])
  }

  const getStepById = (stepId: string): OnboardingStep | null => {
    for (const module of modules) {
      const step = module.steps.find(s => s.id === stepId)
      if (step) return step
    }
    return null
  }

  const getModuleById = (moduleId: string): OnboardingModule | null => {
    return modules.find(m => m.id === moduleId) || null
  }

  const getNextModule = (): OnboardingModule | null => {
    const currentModule = getCurrentModule()
    if (!currentModule) return modules[0]

    const currentIndex = modules.findIndex(m => m.id === currentModule.id)
    const nextIndex = currentIndex + 1
    
    if (nextIndex < modules.length) {
      return modules[nextIndex]
    }
    
    return null
  }

  const shouldShowTooltip = (elementId: string): boolean => {
    return state.userPreferences.showTooltips && !seenElements.includes(elementId)
  }

  const markElementSeen = (elementId: string) => {
    setSeenElements(prev => [...prev, elementId])
  }

  const value: OnboardingContextType = {
    state,
    modules,
    isOnboardingActive: state.isActive,
    currentStep: getCurrentStep(),
    
    startOnboarding,
    skipOnboarding,
    completeOnboarding,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    completeModule,
    setCurrentModule,
    updatePreferences,
    resetOnboarding,
    
    getStepById,
    getModuleById,
    getNextModule,
    shouldShowTooltip,
    markElementSeen
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}