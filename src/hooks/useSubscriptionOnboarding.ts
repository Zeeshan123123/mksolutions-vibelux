import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';

interface SubscriptionModule {
  id: string
  name: string
  requiresOnboarding: boolean
}

// Map subscription products to onboarding modules
const subscriptionModuleMap: Record<string, string> = {
  'price_lighting_design': 'ai-design-studio',
  'price_calculator_suite': 'calculator-suite',
  'price_control_center': 'control-center',
  'price_research_library': 'research-library',
  'price_energy_management': 'energy-optimization',
  'price_marketplace': 'marketplace',
  'price_sensor_hub': 'sensor-integration',
  'price_compliance': 'compliance-setup',
  'price_mobile_ops': 'mobile-setup'
}

export function useSubscriptionOnboarding() {
  const router = useRouter()
  const { userId } = useAuth()
  
  useEffect(() => {
    if (!userId) return
    
    // Check for pending onboarding from subscription
    const checkPendingOnboarding = async () => {
      try {
        // This would connect to your subscription system (Stripe, etc.)
        const response = await fetch('/api/user/pending-onboarding', {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.pendingModule) {
            // User just subscribed to a module - start onboarding
            const moduleId = subscriptionModuleMap[data.subscriptionProduct]
            
            if (moduleId) {
              // Check if already completed
              const completedModules = localStorage.getItem('completedOnboarding')
              const completed = completedModules ? JSON.parse(completedModules) : []
              
              if (!completed.includes(moduleId)) {
                // Redirect to module-specific onboarding
                router.push(`/onboarding/${moduleId}`)
              }
            }
          }
        }
      } catch (error) {
        logger.error('api', 'Error checking pending onboarding:', error )
      }
    }
    
    checkPendingOnboarding()
  }, [userId, router])
  
  // Manual trigger for onboarding
  const triggerModuleOnboarding = (subscriptionProduct: string) => {
    const moduleId = subscriptionModuleMap[subscriptionProduct]
    
    if (moduleId) {
      router.push(`/onboarding/${moduleId}`)
    }
  }
  
  return { triggerModuleOnboarding }
}