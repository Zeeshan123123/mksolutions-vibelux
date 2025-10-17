'use client'

import React, { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function UtilityBillsStep() {
  const router = useRouter()
  const params = useSearchParams()
  const facilityId = params.get('facilityId') || ''
  const [ratePerKwh, setRatePerKwh] = useState(0.12)
  const [averageMonthlyKwh, setAverageMonthlyKwh] = useState(0)
  const [demandKw, setDemandKw] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const save = async () => {
    setIsSubmitting(true)
    try {
      const resp = await fetch('/api/energy/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, ratePerKwh, averageMonthlyKwh, demandKw })
      })
      if (!resp.ok) throw new Error('Failed')
      router.push(`/energy/setup/finish?facilityId=${facilityId}`)
    } catch {
      toast({ title: 'Error', description: 'Failed to save baseline' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Utility Baseline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Average Monthly kWh</label>
            <Input type="number" value={averageMonthlyKwh} onChange={(e) => setAverageMonthlyKwh(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Peak Demand (kW)</label>
            <Input type="number" value={demandKw} onChange={(e) => setDemandKw(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Rate ($/kWh)</label>
            <Input type="number" step="0.01" value={ratePerKwh} onChange={(e) => setRatePerKwh(Number(e.target.value))} />
          </div>
          <Button onClick={save} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save & Continue'}</Button>
        </CardContent>
      </Card>

      <HowItWorksStrip
        dense
        heading="How this step works"
        subheading="Use utility bills or direct connections to establish your seasonal baseline."
        planNotice="Starter+ plans: Utility API sync and advanced adjustments"
        steps={[
          { title: 'Upload bill or connect Utility API', description: 'PDF parsing via AI or direct data link', href: '/integrations/utility-api?tab=pdf-processing', ctaLabel: 'Open Utility API' },
          { title: 'Confirm extracted values', description: 'Average kWh, peak demand, rate per kWh', href: '#', ctaLabel: 'Review' },
          { title: 'Seasonality + adjustments', description: 'Monthly baselines and operational deltas (HPS→LED, occupancy)', href: '/integrations/utility-api?tab=connections', ctaLabel: 'Manage' },
          { title: 'Proceed to finish', description: 'Enable dashboards and verified savings', href: '/energy/setup/finish', ctaLabel: 'Next' },
        ]}
      />
    </div>
  )
}


