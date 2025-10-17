"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/logging/production-logger';

interface ModuleSubscriptionButtonProps {
  moduleId: string
  priceId: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  requiresOnboarding?: boolean
}

export function ModuleSubscriptionButton({
  moduleId,
  priceId,
  price,
  interval,
  features,
  requiresOnboarding = true
}: ModuleSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { userId } = useAuth()
  
  const handleSubscribe = async () => {
    if (!userId) {
      router.push('/sign-in')
      return
    }
    
    setLoading(true)
    
    try {
      // Create checkout session (unified endpoint)
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId,
          // Reuse moduleId as planId to tag metadata and plan mapping
          planId: moduleId
        })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        logger.error('system', 'Failed to create checkout session', data)
      }
    } catch (error) {
      logger.error('system', 'Subscription error:', error )
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Subscribe - ${price}/{interval}
        </>
      )}
    </button>
  )
}