// Main onboarding components
export { default as OnboardingController } from './OnboardingController'
export { default as WelcomeSequence } from './WelcomeSequence'
export { default as OnboardingTooltip } from './OnboardingTooltip'
export { default as OnboardingProgress } from './OnboardingProgress'
export { default as FacilitySetupWizard } from './FacilitySetupWizard'
export { default as ContextualTooltip, HelpWrapper, useContextualHelp } from './ContextualTooltip'

// Tour components
export { default as DashboardTour } from './tours/DashboardTour'
export { default as DesignStudioTour } from './tours/DesignStudioTour'
export { default as CalculatorsTour } from './tours/CalculatorsTour'
export { default as AnalyticsTour } from './tours/AnalyticsTour'

// Context and hooks
export { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext'
export { useOnboardingTour } from '../../hooks/useOnboardingTour'

// Types
export type { 
  OnboardingStep, 
  OnboardingModule, 
  OnboardingState 
} from '../../contexts/OnboardingContext'