'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

type Room = {
  name: string
  areaFt2: number
  occupants: number
  lightsWPerFt2: number
  equipmentW: number
  uatBTUh: number // infiltration/process/other
}

export default function RoomLoadsPage() {
  const [rooms, setRooms] = useState<Room[]>([
    { name: 'Grow Room 1', areaFt2: 1200, occupants: 4, lightsWPerFt2: 30, equipmentW: 2000, uatBTUh: 5000 },
  ])
  const [designDeltaT, setDesignDeltaT] = useState(20) // F
  const [latentPerOccupantBtuh, setLatentPerOccupantBtuh] = useState(200)

  const results = useMemo(() => {
    return rooms.map((r) => {
      const lightsW = r.lightsWPerFt2 * r.areaFt2
      const sensibleFromLightsBtuh = lightsW * 3.412
      const sensibleEquipBtuh = r.equipmentW * 3.412
      const sensiblePeopleBtuh = r.occupants * 245 // approx sensible per person
      const latentPeopleBtuh = r.occupants * latentPerOccupantBtuh
      const sensibleOtherBtuh = r.uatBTUh
      const sensibleTotal = sensibleFromLightsBtuh + sensibleEquipBtuh + sensiblePeopleBtuh + sensibleOtherBtuh
      const cfmNeeded = sensibleTotal / (1.08 * designDeltaT)
      return {
        room: r.name,
        areaFt2: r.areaFt2,
        occupants: r.occupants,
        lightsWPerFt2: r.lightsWPerFt2,
        sensibleBtuh: Math.round(sensibleTotal),
        latentBtuh: Math.round(latentPeopleBtuh),
        cfm: Math.round(cfmNeeded),
      }
    })
  }, [rooms, designDeltaT, latentPerOccupantBtuh])

  const exportCSV = () => {
    exportToCSV(results as any[], 'room_loads.csv')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Room Loads (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How room load calc works"
          subheading="Enter sensible/latent inputs to size airflow and cooling."
          steps={[
            { title: 'Define rooms', description: 'Area, occupants, equipment', href: '#', ctaLabel: 'Add Room' },
            { title: 'Lighting power', description: 'Use design PPD / watts/ft²', href: '/design/advanced', ctaLabel: 'From Design' },
            { title: 'Set design delta T', description: 'Typical 15–25°F depending on application', href: '#', ctaLabel: 'Guidance' },
            { title: 'Export loads', description: 'Provide to mechanical engineer', href: '/export-center', ctaLabel: 'Export' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Design Parameters</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-400">Delta T (°F)</label>
              <Input type="number" value={designDeltaT} onChange={e => setDesignDeltaT(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Latent per Occupant (BTU/h)</label>
              <Input type="number" value={latentPerOccupantBtuh} onChange={e => setLatentPerOccupantBtuh(Number(e.target.value))} />
            </div>
            <div className="flex items-end">
              <Button onClick={exportCSV} className="w-full">Export CSV</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((r) => (
              <div key={r.room} className="grid md:grid-cols-6 gap-3 p-3 bg-gray-800 rounded">
                <div>
                  <div className="text-xs text-gray-400">Room</div>
                  <div className="font-medium">{r.room}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Area (ft²)</div>
                  <div>{r.areaFt2}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Occupants</div>
                  <div>{r.occupants}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Sensible (BTU/h)</div>
                  <div>{r.sensibleBtuh.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Latent (BTU/h)</div>
                  <div>{r.latentBtuh.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">CFM Required</div>
                  <div>{r.cfm.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

