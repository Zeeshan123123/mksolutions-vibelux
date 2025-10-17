'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

type TrialSummary = { trialId: string; n: number; mean: number; sd: number; treatments: Array<{ treatment: string; n: number; mean: number; sd: number }> }

export default function CompareTrialsPage() {
  const [metric, setMetric] = useState('yield')
  const [ids, setIds] = useState('')
  const [results, setResults] = useState<{ metric: string; trials: TrialSummary[] } | null>(null)

  const fetchCompare = () => {
    const trialIds = ids.split(',').map(s => s.trim()).filter(Boolean)
    if (trialIds.length < 2) {
      toast({ title: 'Need at least two trials', description: 'Enter comma-separated trial IDs' })
      return
    }
    fetch(`/api/trials/compare?trialIds=${encodeURIComponent(trialIds.join(','))}&metric=${encodeURIComponent(metric)}`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(setResults)
      .catch(() => toast({ title: 'Error', description: 'Compare failed' }))
  }

  const hasData = !!results?.trials?.length

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Compare Trials</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Parameters</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="trial_a, trial_b, trial_c" value={ids} onChange={e => setIds(e.target.value)} className="w-96" />
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Metric" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yield">Yield</SelectItem>
                <SelectItem value="thc">THC</SelectItem>
                <SelectItem value="terpenes">Terpenes</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchCompare}>Compare</Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="space-y-4">
              {results!.trials.map(t => (
                <Card key={t.trialId}>
                  <CardHeader>
                    <CardTitle className="text-sm">Trial {t.trialId} — n={t.n} mean={t.mean.toFixed(2)} sd={t.sd.toFixed(2)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {t.treatments.map(tr => (
                      <div key={tr.treatment} className="flex justify-between text-xs border-b py-1">
                        <span>{tr.treatment}</span>
                        <span>n={tr.n} mean={tr.mean.toFixed(2)} sd={tr.sd.toFixed(2)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <div className="text-sm text-muted-foreground">Enter trial IDs to compare.</div>}
        </CardContent>
      </Card>
    </div>
  )
}


