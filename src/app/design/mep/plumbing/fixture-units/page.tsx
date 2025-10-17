'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

async function exportPlumbingPDF(payload: any) {
  const res = await fetch('/api/reports/plumbing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(payload?.project?.name || 'plumbing')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

type Fixture = { name: string; fuCold: number; fuHot: number; qty: number }

export default function FixtureUnitsPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([
    { name: 'Lavatory', fuCold: 1, fuHot: 1, qty: 6 },
    { name: 'Water Closet (tank)', fuCold: 2.5, fuHot: 0, qty: 4 },
    { name: 'Shower', fuCold: 2, fuHot: 2, qty: 4 },
  ])

  const result = useMemo(() => {
    const cold = fixtures.reduce((s, f) => s + f.fuCold * f.qty, 0)
    const hot = fixtures.reduce((s, f) => s + f.fuHot * f.qty, 0)
    const total = cold + hot
    // simple IPC conversion proxy to gpm (illustrative)
    const serviceGpm = Math.round(total * 0.75)
    return { cold, hot, total, serviceGpm }
  }, [fixtures])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'Cold FU', value: result.cold },
      { metric: 'Hot FU', value: result.hot },
      { metric: 'Total FU', value: result.total },
      { metric: 'Estimated Service Flow (gpm)', value: result.serviceGpm },
    ], 'fixture_units.csv')
  }

  const exportPDF = async () => {
    await exportPlumbingPDF({
      project: { name: 'Plumbing Fixture Units', date: new Date().toISOString().split('T')[0], preparedBy: 'Vibelux' },
      plumbing: {
        coldFu: result.cold,
        hotFu: result.hot,
        totalFu: result.total,
        serviceGpm: result.serviceGpm
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Fixture Unit Sizing (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How fixture units work"
          subheading="Sum hot/cold fixture units to estimate service flow and pipe sizing baseline."
          steps={[
            { title: 'List fixtures', description: 'Lav, WC, shower, etc.', href: '#', ctaLabel: 'Add Fixtures' },
            { title: 'Apply FU factors', description: 'Cold and hot fixture units', href: '#', ctaLabel: 'Factors' },
            { title: 'Estimate service flow', description: 'Convert FU to gpm (proxy)', href: '#', ctaLabel: 'Review' },
            { title: 'Export summary', description: 'Provide to plumbing designer', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-gray-400">Cold FU</div>
              <div className="text-xl">{result.cold}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Hot FU</div>
              <div className="text-xl">{result.hot}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Total FU</div>
              <div className="text-xl">{result.total}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Service Flow</div>
              <div className="text-xl">{result.serviceGpm} gpm</div>
            </div>
            <div className="md:col-span-4 flex justify-end gap-2">
              <Button onClick={exportCSV}>Export CSV</Button>
              <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Fixtures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fixtures.map((f, i) => (
              <div key={i} className="grid md:grid-cols-5 gap-3 p-3 bg-gray-800 rounded">
                <div>{f.name}</div>
                <div>{f.fuCold} FU cold</div>
                <div>{f.fuHot} FU hot</div>
                <div>{f.qty} qty</div>
                <div className="text-right">{f.fuCold * f.qty + f.fuHot * f.qty} FU</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

