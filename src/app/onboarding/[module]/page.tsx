"use client"

import { ModuleOnboarding, useModuleOnboarding } from '@/components/onboarding/ModuleOnboarding'
import { useParams, useRouter } from 'next/navigation'

export default function ModuleOnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const { markModuleComplete } = useModuleOnboarding()
  
  const moduleId = params?.module as string
  
  const handleComplete = () => {
    markModuleComplete(moduleId)
    
    // Navigate to the appropriate module page
    const moduleRoutes: Record<string, string> = {
      'ai-design-studio': '/design',
      'calculator-suite': '/calculators',
      'control-center': '/control-center',
      'research-library': '/research-library',
      'energy-optimization': '/energy',
      'marketplace': '/marketplace'
    }
    
    router.push(moduleRoutes[moduleId] || '/dashboard')
  }
  
  return <ModuleOnboarding moduleId={moduleId} onComplete={handleComplete} />
}