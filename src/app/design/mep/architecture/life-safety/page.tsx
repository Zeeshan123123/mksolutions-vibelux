'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

async function exportArchitecturalPDF(payload: any) {
  const res = await fetch('/api/reports/architectural', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(payload?.project?.name || 'architectural')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export default function LifeSafetyPage() {
  const [areaFt2, setAreaFt2] = useState(20000)
  const [occLoadFactor, setOccLoadFactor] = useState(100) // ft2/person proxy
  const [egressWidthPerOcc, setEgressWidthPerOcc] = useState(0.2) // in/person proxy

  const result = useMemo(() => {
    const occupants = Math.ceil(areaFt2 / occLoadFactor)
    const reqEgressWidthIn = occupants * egressWidthPerOcc
    const stairsIn = Math.ceil(reqEgressWidthIn / 44) // proxy stairs width units
    return { occupants, reqEgressWidthIn: Math.round(reqEgressWidthIn), stairsIn }
  }, [areaFt2, occLoadFactor, egressWidthPerOcc])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'Area (ft²)', value: areaFt2 },
      { metric: 'Occ Load Factor (ft²/p)', value: occLoadFactor },
      { metric: 'Occupant Load', value: result.occupants },
      { metric: 'Required Egress Width (in)', value: result.reqEgressWidthIn },
      { metric: 'Stair Units (proxy)', value: result.stairsIn },
    ], 'life_safety_summary.csv')
  }

  const exportPDF = async () => {
    await exportArchitecturalPDF({
      project: { name: 'Life Safety Summary', date: new Date().toISOString().split('T')[0], preparedBy: 'Vibelux' },
      architectural: {
        occupancy: 'F-1 (Factory/Industrial, moderate hazard)',
        occupantLoad: result.occupants,
        egressWidth: `${result.reqEgressWidthIn} in`,
        exitCount: Math.max(2, Math.ceil(result.occupants / 50))
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Life Safety Summary (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How life safety summary works"
          subheading="Estimate occupant load and egress requirements for early planning."
          steps={[
            { title: 'Area & occupancy', description: 'Area and load factor by use', href: '#', ctaLabel: 'Inputs' },
            { title: 'Egress width', description: 'Per-occupant width proxy', href: '#', ctaLabel: 'Guidance' },
            { title: 'Stairs/exits', description: 'Translate widths into units', href: '#', ctaLabel: 'Review' },
            { title: 'Export summary', description: 'Share with architect/code consultant', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-3">
            <div>
              <label className="text-sm text-gray-400">Area (ft²)</label>
              <Input type="number" value={areaFt2} onChange={e => setAreaFt2(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Occ Load Factor</label>
              <Input type="number" value={occLoadFactor} onChange={e => setOccLoadFactor(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Egress Width per Person (in)</label>
              <Input type="number" step="0.01" value={egressWidthPerOcc} onChange={e => setEgressWidthPerOcc(Number(e.target.value))} />
            </div>
            <div className="md:col-span-2 flex items-end justify-end gap-2">
              <Button onClick={exportCSV}>Export CSV</Button>
              <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-400">Occupants</div>
              <div className="text-xl">{result.occupants.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Req. Egress Width</div>
              <div className="text-xl">{result.reqEgressWidthIn} in</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Stair Units (proxy)</div>
              <div className="text-xl">{result.stairsIn}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

