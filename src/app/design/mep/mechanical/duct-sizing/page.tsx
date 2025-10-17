'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

async function exportMechanicalPDF(payload: any) {
  const res = await fetch('/api/reports/mechanical', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(payload?.project?.name || 'mechanical')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DuctSizingPage() {
  const [cfm, setCfm] = useState(2000)
  const [velocityFpm, setVelocityFpm] = useState(900)

  const result = useMemo(() => {
    const areaFt2 = cfm / velocityFpm
    const diameterIn = Math.sqrt((areaFt2 * 144) / (Math.PI / 4))
    return { areaFt2: Number(areaFt2.toFixed(2)), diameterIn: Number(diameterIn.toFixed(1)) }
  }, [cfm, velocityFpm])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'CFM', value: cfm },
      { metric: 'Velocity (fpm)', value: velocityFpm },
      { metric: 'Area (ft²)', value: result.areaFt2 },
      { metric: 'Round Duct Diameter (in)', value: result.diameterIn },
    ], 'duct_sizing.csv')
  }

  const exportPDF = async () => {
    await exportMechanicalPDF({
      project: { name: 'Duct Sizing', date: new Date().toISOString().split('T')[0], preparedBy: 'Vibelux' },
      mechanical: {
        cfm,
        velocityFpm,
        areaFt2: result.areaFt2,
        diameterIn: result.diameterIn
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Duct Sizing (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How duct sizing works"
          subheading="Enter CFM and target velocity to calculate area and round diameter."
          steps={[
            { title: 'Input airflow', description: 'Room or system CFM', href: '/design/mep/mechanical/room-loads', ctaLabel: 'Room Loads' },
            { title: 'Target velocity', description: 'Select quiet/sensible ranges', href: '#', ctaLabel: 'Guidelines' },
            { title: 'Review results', description: 'Area and equivalent round diameter', href: '#', ctaLabel: 'Review' },
            { title: 'Export CSV', description: 'Share with mechanical designer/CAD', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-400">CFM</label>
              <Input type="number" value={cfm} onChange={e => setCfm(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Velocity (fpm)</label>
              <Input type="number" value={velocityFpm} onChange={e => setVelocityFpm(Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={exportCSV} className="w-full">Export CSV</Button>
              <Button variant="outline" onClick={exportPDF} className="w-full">Export PDF</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400">Area</div>
              <div className="text-xl">{result.areaFt2} ft²</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Round Diameter</div>
              <div className="text-xl">{result.diameterIn} in</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

