'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function VentilationDOASPage() {
  const [people, setPeople] = useState(10)
  const [raCfmPerPerson, setRaCfmPerPerson] = useState(15)
  const [oaFrac, setOaFrac] = useState(1)
  const [targetGrainRemoval, setTargetGrainRemoval] = useState(40) // grains/lb target removal

  const result = useMemo(() => {
    const raCfm = people * raCfmPerPerson
    const oaCfm = raCfm * oaFrac
    // very simplified latent sizing proxy using target grain removal
    const latentTons = (oaCfm * targetGrainRemoval) / 7000 / 0.7 // proxy
    const totalTons = latentTons * 1.2 // assume 20% sensible add
    return { raCfm, oaCfm, latentTons: Number(latentTons.toFixed(2)), totalTons: Number(totalTons.toFixed(2)) }
  }, [people, raCfmPerPerson, oaFrac, targetGrainRemoval])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'Return Air CFM', value: result.raCfm },
      { metric: 'Outside Air CFM', value: result.oaCfm },
      { metric: 'Latent Tons', value: result.latentTons },
      { metric: 'Total Tons (est)', value: result.totalTons },
    ], 'ventilation_doas.csv')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Ventilation / DOAS (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How ventilation sizing works"
          subheading="People-based airflow with outside air fraction and moisture removal targets."
          steps={[
            { title: 'Occupancy & RA/Person', description: 'People and required RA CFM per person', href: '#', ctaLabel: 'Inputs' },
            { title: 'OA fraction', description: 'Fresh air fraction for DOAS', href: '#', ctaLabel: 'Set OA' },
            { title: 'Target grains removal', description: 'Moisture removal target to protect crop', href: '#', ctaLabel: 'Targets' },
            { title: 'Export CSV', description: 'Share with mechanical engineer', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-400">People</label>
              <Input type="number" value={people} onChange={e => setPeople(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">RA CFM / Person</label>
              <Input type="number" value={raCfmPerPerson} onChange={e => setRaCfmPerPerson(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">OA Fraction</label>
              <Input type="number" value={oaFrac} onChange={e => setOaFrac(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Target Grain Removal</label>
              <Input type="number" value={targetGrainRemoval} onChange={e => setTargetGrainRemoval(Number(e.target.value))} />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button onClick={exportCSV}>Export CSV</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-gray-400">Return Air</div>
              <div className="text-xl">{Math.round(result.raCfm).toLocaleString()} CFM</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Outside Air</div>
              <div className="text-xl">{Math.round(result.oaCfm).toLocaleString()} CFM</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Latent</div>
              <div className="text-xl">{result.latentTons} tons</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Total (est)</div>
              <div className="text-xl">{result.totalTons} tons</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

