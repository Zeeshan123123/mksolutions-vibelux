'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useCart } from '@/contexts/CartContext'
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { logger } from '@/lib/client-logger';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function CheckoutPage() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const { items, getTotal, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in?redirect_url=/checkout')
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (items.length === 0) {
      router.push('/pricing')
    }
  }, [items, router])

  const handleCheckout = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Create checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            type: item.type,
            quantity: item.quantity,
            interval: item.interval
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }

    } catch (err) {
      logger.error('system', 'Checkout error:', err)
      setError('An error occurred during checkout. Please try again.')
      setIsProcessing(false)
    }
  }

  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/pricing')}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to pricing
          </button>
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
          <p className="text-gray-400 mt-1">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b border-gray-800">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      )}
                      {item.interval && (
                        <p className="text-sm text-gray-500 mt-1">
                          Billed {item.interval}ly × {item.quantity}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">${getTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Payment</h2>
              
              {/* Security Badge */}
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Secure checkout with Stripe</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isProcessing || items.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                You will be redirected to Stripe to complete your purchase
              </p>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Secure SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}