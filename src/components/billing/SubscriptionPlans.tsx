'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Rocket, Star } from 'lucide-react'
import Link from 'next/link'

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  monthlyPriceId: string
  annualPriceId: string
  features: PlanFeature[]
  icon: React.ReactNode
  popular?: boolean
  tier: 'grower' | 'professional' | 'business'
}

const plans: Plan[] = [
  {
    id: 'grower',
    name: 'Grower',
    description: 'Perfect for small operations and consultants',
    monthlyPrice: 29,
    annualPrice: 276, // $29 * 12 * 0.8 (20% discount)
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_DESIGN_SOLO_MONTHLY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_GROWER_MONTHLY_PRICE_ID || '',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_DESIGN_SOLO_ANNUAL_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_GROWER_ANNUAL_PRICE_ID || '',
    icon: <Star className="w-6 h-6" />,
    tier: 'grower',
    features: [
      { text: 'Basic lighting design tools', included: true },
      { text: 'DLI & PPFD calculators', included: true },
      { text: 'Fixture library access', included: true },
      { text: '10 project saves', included: true },
      { text: 'PDF report export', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: '3D visualization', included: false },
      { text: 'IoT integration', included: false },
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced tools for professional designers',
    monthlyPrice: 199,
    annualPrice: 1908, // $199 * 12 * 0.8 (20% discount)
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || '',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID || '',
    icon: <Rocket className="w-6 h-6" />,
    tier: 'professional',
    popular: true,
    features: [
      { text: 'Everything in Grower', included: true },
      { text: 'Advanced 3D design studio', included: true },
      { text: 'Statistical analysis tools', included: true },
      { text: 'IoT sensor integration (50 sensors)', included: true },
      { text: 'Unlimited project saves', included: true },
      { text: 'Team collaboration (10 members)', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false },
    ]
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Full-scale enterprise solutions',
    monthlyPrice: 499,
    annualPrice: 4788, // $499 * 12 * 0.8 (20% discount)
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID || '',
    icon: <Crown className="w-6 h-6" />,
    tier: 'business',
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'CFD thermal analysis', included: true },
      { text: 'Unlimited IoT sensors', included: true },
      { text: 'Multi-facility management', included: true },
      { text: 'Advanced team management', included: true },
      { text: 'White-label options', included: true },
      { text: 'API access & webhooks', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations', included: true },
    ]
  }
]

const queryCredits = [
  {
    id: '25-queries',
    name: '25 AI Queries',
    price: 10,
    priceId: process.env.NEXT_PUBLIC_STRIPE_QUERIES_25_PRICE_ID || '',
    description: 'Perfect for occasional AI assistance'
  },
  {
    id: '100-queries',
    name: '100 AI Queries',
    price: 35,
    priceId: process.env.NEXT_PUBLIC_STRIPE_QUERIES_100_PRICE_ID || '',
    description: 'Great value for regular users',
    popular: true
  },
  {
    id: '500-queries',
    name: '500 AI Queries',
    price: 150,
    priceId: process.env.NEXT_PUBLIC_STRIPE_QUERIES_500_PRICE_ID || '',
    description: 'Best for power users and teams'
  }
]

export function SubscriptionPlans() {
  const { user } = useUser()
  const [isAnnual, setIsAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: Plan) => {
    if (!user) return

    setLoading(plan.id)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: isAnnual ? plan.annualPriceId : plan.monthlyPriceId,
          mode: 'subscription'
        }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleBuyCredits = async (creditPack: typeof queryCredits[0]) => {
    if (!user) return

    setLoading(creditPack.id)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: creditPack.priceId,
          mode: 'payment'
        }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Link href="/api/stripe/customer-portal" className="text-purple-300 underline">
          Manage Billing Portal
        </Link>
      </div>
      {/* Subscription Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 mb-6">
            Unlock the full potential of VibeLux with our professional plans
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-600 text-white">Save 20%</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative border-gray-700 bg-gray-800 ${
                plan.popular ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4 text-green-400">
                  {plan.icon}
                </div>
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-400">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                  {isAnnual && (
                    <div className="text-sm text-green-400 mt-1">
                      Save ${(plan.monthlyPrice * 12) - plan.annualPrice}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check 
                        className={`w-4 h-4 ${
                          feature.included ? 'text-green-400' : 'text-gray-600'
                        }`} 
                      />
                      <span className={`text-sm ${
                        feature.included ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {loading === plan.id ? 'Loading...' : `Start ${plan.name} Plan`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Query Credits */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">AI Query Credits</h2>
          <p className="text-gray-400">
            Purchase additional AI query credits à la carte
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {queryCredits.map((credit) => (
            <Card 
              key={credit.id} 
              className={`border-gray-700 bg-gray-800 ${
                credit.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {credit.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    Best Value
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4 text-purple-400">
                  <Zap className="w-6 h-6" />
                </div>
                <CardTitle className="text-white">{credit.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {credit.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">
                    ${credit.price}
                  </span>
                  <div className="text-sm text-gray-400 mt-1">
                    ${(credit.price / parseInt(credit.name.split(' ')[0])).toFixed(2)} per query
                  </div>
                </div>
              </CardHeader>

              <CardFooter>
                <Button
                  onClick={() => handleBuyCredits(credit)}
                  disabled={loading === credit.id}
                  className={`w-full ${
                    credit.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {loading === credit.id ? 'Loading...' : 'Purchase Credits'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}