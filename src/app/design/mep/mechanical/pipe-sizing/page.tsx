'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV } from '@/lib/exportUtils'

export default function PipeSizingPage() {
  const [gpm, setGpm] = useState(40)
  const [velocityFps, setVelocityFps] = useState(5)

  const result = useMemo(() => {
    // Area (ft^2) = Q (ft^3/s) / v (ft/s) ; Q = gpm * 0.133681 / 60
    const qCfs = gpm * 0.002228
    const areaFt2 = qCfs / velocityFps
    const diameterIn = Math.sqrt((areaFt2 * 144) / (Math.PI / 4))
    return { areaFt2: Number(areaFt2.toFixed(4)), diameterIn: Number(diameterIn.toFixed(2)) }
  }, [gpm, velocityFps])

  const exportCSV = () => {
    exportToCSV([
      { metric: 'GPM', value: gpm },
      { metric: 'Velocity (ft/s)', value: velocityFps },
      { metric: 'Area (ft²)', value: result.areaFt2 },
      { metric: 'Pipe Diameter (in)', value: result.diameterIn },
    ], 'pipe_sizing.csv')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Pipe Sizing (MVP)</h1>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-400">Flow (GPM)</label>
              <Input type="number" value={gpm} onChange={e => setGpm(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Velocity (ft/s)</label>
              <Input type="number" value={velocityFps} onChange={e => setVelocityFps(Number(e.target.value))} />
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
              <div className="text-xs text-gray-400">Area</div>
              <div className="text-xl">{result.areaFt2} ft²</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Diameter</div>
              <div className="text-xl">{result.diameterIn} in</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

