'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

type Listing = {
  id: string; title: string; summary?: string; priceCents: number; currency: string; trialname?: string; trialName?: string
}

export default function TrialLicensesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/marketplace/trial-licenses')
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setListings(data.listings || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trial Licenses</h1>
        <Link href="/research/trials"><Button variant="outline">Create from Trial</Button></Link>
      </div>

      <HowItWorksStrip
        dense
        heading="How licensing works"
        subheading="Turn proven trials into licensed IP with checkout and entitlement."
        steps={[
          { title: 'Create listing', description: 'Select trial and define rights/price', href: '/research/trials', ctaLabel: 'Select Trial' },
          { title: 'Checkout', description: 'Buyer pays via Stripe; purchase created', href: '/marketplace/trial-licenses', ctaLabel: 'Browse' },
          { title: 'Webhook confirmation', description: 'Payment confirmed → access granted', href: '/docs', ctaLabel: 'See Docs' },
          { title: 'Manage licenses', description: 'Track buyers and entitlements', href: '/marketplace/onboarding', ctaLabel: 'Seller Onboarding' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(l => (
          <Card key={l.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{l.title}</span>
                <Link href={`/marketplace/trial-licenses/${l.id}`}><Button size="sm" variant="outline">View</Button></Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">Trial: {l.trialName || (l as any).trialname || '—'}</div>
              <div className="text-sm mb-2">{l.summary || 'License for proven parameters and SOPs.'}</div>
              <div className="font-semibold">{(l.priceCents/100).toLocaleString('en-US', { style: 'currency', currency: (l.currency || 'USD').toUpperCase() })}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


