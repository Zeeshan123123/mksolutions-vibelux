'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/client-logger'

interface SubscriptionData {
  tier: string
  status: string
  features: Record<string, boolean>
  limits: Record<string, number>
  periodEnd?: string
  plan?: string
  addOns?: string[]
  bundleId?: string
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  isLoading: boolean
  hasActiveSubscription: boolean
  canAccessFeature: (feature: string) => boolean
  refetchSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Feature access matrix - Updated to match new tier names
const FEATURE_ACCESS: Record<string, string[]> = {
  'advanced-design': ['design-solo', 'starter', 'teams', 'professional', 'enterprise', 'ADMIN'],
  'energy-monitoring': ['starter', 'teams', 'professional', 'enterprise', 'ADMIN'],
  'ai-assistant': ['professional', 'enterprise', 'ADMIN'],
  'multi-site': ['teams', 'professional', 'enterprise', 'ADMIN'],
  'api-access': ['professional', 'enterprise', 'ADMIN'],
  'priority-support': ['professional', 'enterprise', 'ADMIN'],
  'custom-reports': ['professional', 'enterprise', 'ADMIN'],
  'team-management': ['teams', 'professional', 'enterprise', 'ADMIN'],
  'research-suite': ['professional', 'enterprise', 'ADMIN']
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = async () => {
    if (!userId) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/user/subscription-status')
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else {
        // Default to free tier if fetch fails
        setSubscription({
          tier: 'FREE',
          status: 'none',
          features: {},
          limits: {
            projects: 1,
            zones: 3,
            fixtures: 50
          }
        })
      }
    } catch (error) {
      logger.error('system', 'Error fetching subscription:', error)
      // Default to free tier on error
      setSubscription({
        tier: 'FREE',
        status: 'none',
        features: {},
        limits: {
          projects: 1,
          zones: 3,
          fixtures: 50
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [userId])

  const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trialing'
  
  const canAccessFeature = (feature: string) => {
    if (!subscription) return false
    
    // Check if user's tier has access to this feature
    const allowedTiers = FEATURE_ACCESS[feature] || []
    return allowedTiers.includes(subscription.tier)
  }

  return (
    <SubscriptionContext.Provider value={{ 
      subscription, 
      isLoading, 
      hasActiveSubscription, 
      canAccessFeature,
      refetchSubscription: fetchSubscription 
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}