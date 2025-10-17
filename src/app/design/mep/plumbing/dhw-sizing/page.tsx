'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function DHWSizingPage() {
  const [peakGpm, setPeakGpm] = useState(8)
  const [riseF, setRiseF] = useState(70)
  const [storageMin, setStorageMin] = useState(20)

  const result = useMemo(() => {
    // Instantaneous heater input (BTU/h) ≈ gpm * 500 * deltaT
    const btuh = peakGpm * 500 * riseF
    const kBTUhr = Math.round(btuh / 1000)
    const storageGal = Math.max(40, storageMin + peakGpm * 5)
    return { btuh: Math.round(btuh), kBTUhr, storageGal: Math.round(storageGal) }
  }, [peakGpm, riseF, storageMin])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'Peak Flow (gpm)', value: peakGpm },
      { metric: 'Temp Rise (°F)', value: riseF },
      { metric: 'Heater Input (BTU/h)', value: result.btuh },
      { metric: 'Heater Input (kBTU/h)', value: result.kBTUhr },
      { metric: 'Storage (gal)', value: result.storageGal },
    ], 'dhw_sizing.csv')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">DHW Sizing (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How DHW sizing works"
          subheading="Peak gpm and temperature rise drive instantaneous input; storage smooths peaks."
          steps={[
            { title: 'Peak flow', description: 'Aggregate gpm from fixtures/process', href: '/design/mep/plumbing/fixture-units', ctaLabel: 'From Fixtures' },
            { title: 'Temperature rise', description: 'Incoming to setpoint delta T', href: '#', ctaLabel: 'Set Rise' },
            { title: 'Storage allowance', description: 'Minimum storage to buffer demand', href: '#', ctaLabel: 'Set Storage' },
            { title: 'Export results', description: 'Share with plumbing engineer', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-400">Peak Flow (gpm)</label>
              <Input type="number" value={peakGpm} onChange={e => setPeakGpm(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Temp Rise (°F)</label>
              <Input type="number" value={riseF} onChange={e => setRiseF(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Min Storage (gal)</label>
              <Input type="number" value={storageMin} onChange={e => setStorageMin(Number(e.target.value))} />
            </div>
            <div className="flex items-end">
              <Button onClick={exportCSV} className="w-full">Export CSV</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400">Heater Input</div>
              <div className="text-xl">{result.kBTUhr} kBTU/h</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Storage</div>
              <div className="text-xl">{result.storageGal} gal</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

