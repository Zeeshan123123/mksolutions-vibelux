'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

type TrialRow = { id: string; name: string; crop: string | null; createdat?: string; createdAt?: string }

export default function TrialsDashboardPage() {
  const [trials, setTrials] = useState<TrialRow[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    const q = filter.toLowerCase()
    return trials.filter(t => (t.name || '').toLowerCase().includes(q) || (t.crop || '').toLowerCase().includes(q))
  }, [trials, filter])

  useEffect(() => {
    setLoading(true)
    fetch('/api/trials')
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load trials'))
      .then(data => setTrials(data.trials || []))
      .catch(() => toast({ title: 'Error', description: 'Unable to load trials' }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trials</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search trials" value={filter} onChange={e => setFilter(e.target.value)} className="w-64" />
          <Link href="/research/trials/designer"><Button>Create Trial</Button></Link>
        </div>
      </div>

      <HowItWorksStrip
        dense
        heading="How trials work"
        subheading="Design → Randomize → Observe → Analyze (ANOVA) → License"
        planNotice="Research module required (Starter+). Licensing requires active billing."
        steps={[
          { title: 'Design & randomize', description: 'Define factors, treatments, blocks, and replicates', href: '/research/trials/designer', ctaLabel: 'Open Designer' },
          { title: 'Collect observations', description: 'Multi-zone, multi-light metrics and covariates', href: '/research/trials', ctaLabel: 'View Trials' },
          { title: 'Analyze results', description: 'One-way ANOVA and pairwise comparisons', href: '/research/trials/compare', ctaLabel: 'Compare' },
          { title: 'License on marketplace', description: 'List successful trials for purchase', href: '/marketplace/trial-licenses', ctaLabel: 'Go to Marketplace' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <Card key={t.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.name}</span>
                <Link href={`/research/trials/${t.id}`}><Button variant="outline" size="sm">Open</Button></Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Crop: {t.crop || '—'}</div>
              <div className="text-xs text-muted-foreground mt-1">Created: {new Date(t.createdAt || (t as any).createdat || Date.now()).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


