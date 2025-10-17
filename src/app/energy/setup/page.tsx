'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function EnergySetupWizard() {
  const router = useRouter()
  const [facilityName, setFacilityName] = useState('My Facility')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStart = async () => {
    setIsSubmitting(true)
    try {
      const resp = await fetch('/api/energy/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityName })
      })
      if (!resp.ok) throw new Error('Failed')
      const data = await resp.json()
      router.push(`/energy/setup/utility?facilityId=${data.facilityId}`)
    } catch {
      toast({ title: 'Error', description: 'Failed to initialize setup' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Energy Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Facility Name</label>
            <Input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
          </div>
          <Button onClick={handleStart} disabled={isSubmitting}>
            {isSubmitting ? 'Starting...' : 'Start Setup'}
          </Button>
        </CardContent>
      </Card>

      <HowItWorksStrip
        heading="How the Energy Setup Works"
        subheading="Connect your data and establish a seasonal baseline so verified savings can be tracked automatically."
        steps={[
          {
            title: 'Create or select facility',
            description: 'We set up your facility record and baseline container.',
            ctaLabel: 'Start',
            href: '#',
          },
          {
            title: 'Connect utility or upload bill',
            description: 'Link Utility API or upload PDFs for AI parsing to seed your baseline.',
            ctaLabel: 'Connect/Upload',
            href: '/integrations/utility-api?tab=pdf-processing',
          },
          {
            title: 'Seasonality + adjustments',
            description: 'Add monthly baselines and operational adjustments (e.g., HPS→LED conversions).',
            ctaLabel: 'Manage Baseline',
            href: '/energy/setup/utility',
          },
          {
            title: 'Verified savings tracking',
            description: 'Simulate, verify, and share savings. Your share is paid out automatically.',
            ctaLabel: 'Open Dashboard',
            href: '/energy-dashboard',
          },
        ]}
      />
    </div>
  )
}


