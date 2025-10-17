'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

export default function TrialDetailPage() {
  const params = useParams<{ trialId: string }>()
  const trialId = params?.trialId
  const [detail, setDetail] = useState<any>(null)
  const [metric, setMetric] = useState('yield')
  const [anova, setAnova] = useState<any>(null)

  useEffect(() => {
    if (!trialId) return
    fetch(`/api/trials/${trialId}`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load trial'))
      .then(setDetail)
      .catch(() => toast({ title: 'Error', description: 'Unable to load trial detail' }))
  }, [trialId])

  useEffect(() => {
    if (!trialId) return
    fetch(`/api/trials/${trialId}/anova?metric=${encodeURIComponent(metric)}`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(setAnova)
      .catch(() => setAnova(null))
  }, [trialId, metric])

  const obsSummary = useMemo(() => {
    const list: Array<{ name: string; n: number }> = detail?.observations || []
    return list
  }, [detail])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{detail?.trial?.name || 'Trial'}</h1>
          <div className="text-sm text-muted-foreground">Crop: {detail?.trial?.crop || '—'}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/research/trials"><Button variant="outline">Back</Button></Link>
          {detail?.trial?.id && (
            <Button
              onClick={async () => {
                try {
                  const resp = await fetch('/api/marketplace/trial-licenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      trialId: detail.trial.id,
                      title: `${detail.trial.name} License`,
                      summary: 'Usage rights to apply trial-proven parameters and SOPs',
                      licenseType: 'ONE_TIME_LICENSE',
                      usageRights: 'COMMERCIAL',
                      priceCents: 49900,
                      currency: 'usd',
                      territory: ['US']
                    })
                  })
                  if (!resp.ok) throw new Error('Create failed')
                  const data = await resp.json()
                  window.location.href = `/marketplace?created=${data.id}`
                } catch {
                  toast({ title: 'Error', description: 'Failed to create listing' })
                }
              }}
            >
              Create License Listing
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Treatments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {detail?.treatments?.map((t: any) => (
                <div key={t.id} className="px-3 py-1 rounded border text-sm">{t.name} — {t.level}</div>
              ))}
            </div>
            <div className="mt-4">
              <div className="font-medium mb-2">Units</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {detail?.units?.map((u: any) => (
                  <div key={u.id} className="text-xs rounded border px-2 py-1">Zone {u.zone} • Rep {u.replicate}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {obsSummary?.length ? obsSummary.map((o) => (
              <div key={o.name} className="flex items-center justify-between text-sm">
                <span>{o.name}</span>
                <span className="text-muted-foreground">n={o.n}</span>
              </div>
            )) : <div className="text-sm text-muted-foreground">No observations yet</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ANOVA</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Metric" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yield">Yield</SelectItem>
                <SelectItem value="thc">THC</SelectItem>
                <SelectItem value="terpenes">Terpenes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {anova ? (
            <div className="text-sm">
              <div className="mb-2 text-muted-foreground">F={anova?.anova?.F?.toFixed?.(3)} df={anova?.anova?.dfb}/{anova?.anova?.dfw}</div>
              <div className="font-medium mb-1">Pairwise (Tukey-style q)</div>
              <div className="space-y-1">
                {anova?.tukey?.comparisons?.map((c: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{c.a} vs {c.b}</span>
                    <span>q={c.q.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="text-sm text-muted-foreground">Not enough data</div>}
        </CardContent>
      </Card>
    </div>
  )
}


