'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

type Circuit = { circuit: number; description: string; loadVA: number; poles: 1 | 2 | 3 }

export default function PanelSchedulesPage() {
  const [voltage, setVoltage] = useState(208)
  const [phases, setPhases] = useState(3)
  const [panelAmps, setPanelAmps] = useState(225)
  const [circuits, setCircuits] = useState<Circuit[]>([
    { circuit: 1, description: 'Lighting', loadVA: 2400, poles: 1 },
    { circuit: 3, description: 'Receptacles', loadVA: 1800, poles: 1 },
    { circuit: 5, description: 'HVAC Condenser', loadVA: 7200, poles: 2 },
  ])

  const calc = useMemo(() => {
    const totalVA = circuits.reduce((s, c) => s + c.loadVA, 0)
    const voltsLL = phases === 3 ? voltage : voltage
    const amps = phases === 3 ? totalVA / (Math.sqrt(3) * voltsLL) : totalVA / voltsLL
    const percent = (amps / panelAmps) * 100
    return { totalVA, amps: Number(amps.toFixed(1)), percent: Number(percent.toFixed(0)) }
  }, [circuits, voltage, phases, panelAmps])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'Total VA', value: calc.totalVA },
      { metric: 'Calculated Amps', value: calc.amps },
      { metric: 'Panel Loading %', value: calc.percent },
    ], 'panel_schedule_summary.csv')
    exportToCSV(circuits as any[], 'panel_circuits.csv')
  }

  const exportPDF = async () => {
    // Compose payload for electrical report endpoint
    const summary = {
      totalFixtures: circuits.length,
      totalWattage: calc.totalVA, // proxy
      requiredCircuits: circuits.length,
      panelSize: panelAmps,
      voltageDrop: undefined,
      estimatedCost: undefined,
    } as any

    const circuitSchedule = circuits.map(c => ({
      circuit: c.circuit,
      description: c.description,
      phase: phases,
      breaker: `${panelAmps}A`,
      wire: `${voltage}V`,
      load: c.loadVA,
      fixtures: ''
    }))

    const payload = {
      project: { name: 'Panel Schedule', date: new Date().toISOString().split('T')[0], preparedBy: 'Vibelux' },
      summary,
      circuitSchedule,
      panelLocations: [{ name: 'Main Panel' }]
    }

    const res = await fetch('/api/reports/electrical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'panel_schedule.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Panel Schedules (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How panel schedules work"
          subheading="Set panel parameters → add circuits → check loading → export."
          planNotice="Pro plan: panel schedule PDF export"
          steps={[
            { title: 'Set panel parameters', description: 'Voltage, phases, rating', href: '#', ctaLabel: 'Configure' },
            { title: 'Add circuits', description: 'Lighting, HVAC, receptacles, equipment', href: '/design/advanced', ctaLabel: 'From Design' },
            { title: 'Validate loading', description: 'Amps and % loading summary', href: '#', ctaLabel: 'Review' },
            { title: 'Export schedule', description: 'CSV and report for drawings', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Panel Parameters</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-400">Voltage</label>
              <Input type="number" value={voltage} onChange={e => setVoltage(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Phases</label>
              <Input type="number" value={phases} onChange={e => setPhases(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Panel Amps</label>
              <Input type="number" value={panelAmps} onChange={e => setPanelAmps(Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={exportCSV} className="w-full">Export CSV</Button>
              <Button variant="outline" onClick={exportPDF} className="w-full">Export PDF</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Circuits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {circuits.map(c => (
              <div key={c.circuit} className="grid md:grid-cols-4 gap-3 p-3 bg-gray-800 rounded">
                <div>#{c.circuit}</div>
                <div>{c.description}</div>
                <div>{c.loadVA} VA</div>
                <div>{c.poles}-pole</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

