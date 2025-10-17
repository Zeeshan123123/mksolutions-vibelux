'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function FaultAICPage() {
  const [utilityMVA, setUtilityMVA] = useState(500)
  const [xfmrKVA, setXfmrKVA] = useState(75)
  const [xfmrPercentZ, setXfmrPercentZ] = useState(5.75)
  const [voltageLL, setVoltageLL] = useState(480)

  const result = useMemo(() => {
    // Simplified available fault current at transformer secondary
    const baseMVA = xfmrKVA / 1000
    const puZ = xfmrPercentZ / 100
    const secFaultMVA = baseMVA / puZ
    const amps = (secFaultMVA * 1e6) / (Math.sqrt(3) * voltageLL)
    return { secFaultMVA: Number(secFaultMVA.toFixed(1)), amps: Math.round(amps) }
  }, [xfmrKVA, xfmrPercentZ, voltageLL])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'Utility MVA (ref)', value: utilityMVA },
      { metric: 'Transformer kVA', value: xfmrKVA },
      { metric: 'Transformer %Z', value: xfmrPercentZ },
      { metric: 'Voltage (L-L)', value: voltageLL },
      { metric: 'Fault at Secondary (MVA)', value: result.secFaultMVA },
      { metric: 'Fault Current (A)', value: result.amps },
    ], 'fault_aic.csv')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Fault / AIC Check (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How fault/AIC check works"
          subheading="Estimate available fault current at the transformer secondary and validate equipment ratings."
          steps={[
            { title: 'Enter transformer data', description: 'kVA and %Z from submittals', href: '#', ctaLabel: 'Inputs' },
            { title: 'Set system voltage', description: 'Line-to-line voltage', href: '#', ctaLabel: 'Voltage' },
            { title: 'Check AIC ratings', description: 'Compare fault current vs. breaker AIC', href: '/design/mep/electrical/panel-schedules', ctaLabel: 'Panels' },
            { title: 'Export results', description: 'Share with electrical designer', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-3">
            <div>
              <label className="text-sm text-gray-400">Utility MVA (ref)</label>
              <Input type="number" value={utilityMVA} onChange={e => setUtilityMVA(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Transformer kVA</label>
              <Input type="number" value={xfmrKVA} onChange={e => setXfmrKVA(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Transformer %Z</label>
              <Input type="number" step="0.01" value={xfmrPercentZ} onChange={e => setXfmrPercentZ(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Voltage (L-L)</label>
              <Input type="number" value={voltageLL} onChange={e => setVoltageLL(Number(e.target.value))} />
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
              <div className="text-xs text-gray-400">Fault at Secondary</div>
              <div className="text-xl">{result.secFaultMVA} MVA</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Fault Current</div>
              <div className="text-xl">{result.amps.toLocaleString()} A</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

