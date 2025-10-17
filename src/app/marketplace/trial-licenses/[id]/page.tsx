'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required'
    })
    if (error) {
      toast({ title: 'Payment error', description: error.message })
    } else {
      toast({ title: 'Success', description: 'License purchased' })
    }
  }

  return (
    <div className="space-y-3">
      <PaymentElement />
      <Button onClick={handleSubmit} disabled={!stripe}>Pay</Button>
    </div>
  )
}

export default function TrialLicenseCheckoutPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [listing, setListing] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/marketplace/trial-licenses/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setListing(data.listing))
  }, [id])

  const startPurchase = async () => {
    const resp = await fetch(`/api/marketplace/trial-licenses/${id}/purchase`, { method: 'POST' })
    if (!resp.ok) {
      toast({ title: 'Error', description: 'Failed to start purchase' }); return
    }
    const data = await resp.json()
    setClientSecret(data.clientSecret)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <HowItWorksStrip
        dense
        heading="How this purchase works"
        subheading="You pay securely via Stripe. On confirmation, your license is activated and access is granted."
        planNotice="Seller tools included in Starter+ plans"
        steps={[
          { title: 'Review listing', description: 'Scope, rights, exclusivity, price', href: '/marketplace/trial-licenses', ctaLabel: 'Back to listings' },
          { title: 'Pay securely', description: 'Card details handled by Stripe', href: '#', ctaLabel: 'Proceed' },
          { title: 'Webhook confirmation', description: 'Payment confirmed → access granted', href: '/docs', ctaLabel: 'Learn more' },
          { title: 'Access assets', description: 'Trial data, SOPs, and parameters', href: '/research/trials', ctaLabel: 'Open Trial' },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>{listing?.title || 'License'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">Trial: {listing?.trialName}</div>
          <div className="mb-4">{listing?.summary}</div>
          <div className="font-semibold mb-4">{listing ? (listing.priceCents/100).toLocaleString('en-US', { style: 'currency', currency: (listing.currency||'USD').toUpperCase() }) : ''}</div>

          {!clientSecret ? (
            <Button onClick={startPurchase}>Purchase License</Button>
          ) : stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          ) : (
            <div className="text-sm text-red-500">Stripe publishable key missing</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


