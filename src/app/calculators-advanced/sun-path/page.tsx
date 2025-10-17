'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sun, MapPin, Calendar, Compass, Download } from 'lucide-react'

type SunSample = { time: string; altitude: number; azimuth: number }

// Simple solar position approximations (sufficient for design visualization)
function toJulian(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

function solarPosition(lat: number, lon: number, date: Date) {
  // Based on NOAA simplified equations
  const rad = Math.PI / 180
  const d = toJulian(date) - 2451545.0
  const g = (357.529 + 0.98560028 * d) * rad
  const q = (280.459 + 0.98564736 * d) * rad
  const L = q + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad
  const e = (23.439 - 0.00000036 * d) * rad
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))
  const dec = Math.asin(Math.sin(e) * Math.sin(L))
  const GMST = (18.697374558 + 24.06570982441908 * d) % 24
  const LST = ((GMST + lon / 15 + 24) % 24) * 15 * rad
  const H = LST - ra
  const altitude = Math.asin(
    Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(H)
  )
  const azimuth = Math.atan2(
    -Math.sin(H),
    Math.tan(dec) * Math.cos(lat * rad) - Math.sin(lat * rad) * Math.cos(H)
  )
  return { altitude: altitude / rad, azimuth: (azimuth / rad + 360) % 360 }
}

function generateDaySamples(lat: number, lon: number, date: Date): SunSample[] {
  const samples: SunSample[] = []
  const day = new Date(date)
  for (let h = 0; h < 24; h++) {
    const d = new Date(day)
    d.setHours(h, 0, 0, 0)
    const p = solarPosition(lat, lon, d)
    samples.push({
      time: `${String(h).padStart(2, '0')}:00`,
      altitude: p.altitude,
      azimuth: p.azimuth,
    })
  }
  return samples
}

export default function SunPathViewer() {
  const [lat, setLat] = useState(39.7392) // Denver
  const [lon, setLon] = useState(-104.9903)
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0])

  const samples = useMemo(() => {
    const d = new Date(dateStr + 'T12:00:00')
    return generateDaySamples(lat, lon, d)
  }, [lat, lon, dateStr])

  const exportCSV = () => {
    const header = 'Time,Altitude (deg),Azimuth (deg)\n'
    const rows = samples.map(s => `${s.time},${s.altitude.toFixed(1)},${s.azimuth.toFixed(1)}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sun-path-${dateStr}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Sun className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold">Sun Path / Sun Angle Viewer</h1>
        </div>
        <p className="text-gray-400">Visualize solar altitude and azimuth across a day for your site. Useful for greenhouse orientation, glazing, and seasonal shading.</p>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Location & Date</CardTitle>
            <CardDescription>Set latitude/longitude and date to compute the sun path.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-400">Latitude (°)</label>
                <Input type="number" step="0.0001" value={lat} onChange={e => setLat(Number(e.target.value))} className="bg-gray-800 border-gray-600" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Longitude (°)</label>
                <Input type="number" step="0.0001" value={lon} onChange={e => setLon(Number(e.target.value))} className="bg-gray-800 border-gray-600" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="bg-gray-800 border-gray-600" />
                </div>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full gap-2" onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plots */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle>Altitude vs Time</CardTitle>
              <CardDescription>Solar elevation angle through the day</CardDescription>
            </CardHeader>
            <CardContent>
              <AltitudeChart samples={samples} />
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Compass className="w-4 h-4" /> Azimuth Polar Plot</CardTitle>
              <CardDescription>Compass plot colored by altitude</CardDescription>
            </CardHeader>
            <CardContent>
              <AzimuthPolar samples={samples} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AltitudeChart({ samples }: { samples: SunSample[] }) {
  const w = 600, h = 260, padding = 40
  const maxAlt = 90
  const points = samples.map((s, i) => {
    const x = padding + (i / 23) * (w - padding * 2)
    const y = padding + (1 - Math.max(0, s.altitude) / maxAlt) * (h - padding * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="w-full h-auto">
      <rect x={0} y={0} width={w} height={h} fill="#0b0f19" rx={8} />
      {/* axes */}
      <line x1={padding} y1={padding} x2={padding} y2={h - padding} stroke="#334155" />
      <line x1={padding} y1={h - padding} x2={w - padding} y2={h - padding} stroke="#334155" />
      {/* labels */}
      {[0, 15, 30, 45, 60, 75, 90].map(a => (
        <text key={a} x={padding - 10} y={padding + (1 - a / 90) * (h - padding * 2)} fill="#94a3b8" fontSize={10} textAnchor="end">{a}°</text>
      ))}
      {/* polyline */}
      <polyline fill="none" stroke="#fbbf24" strokeWidth={2} points={points} />
      {samples.map((s, i) => (
        <circle key={i} cx={padding + (i / 23) * (w - padding * 2)} cy={padding + (1 - Math.max(0, s.altitude) / 90) * (h - padding * 2)} r={2} fill="#fde68a" />
      ))}
    </svg>
  )
}

function AzimuthPolar({ samples }: { samples: SunSample[] }) {
  const size = 260
  const r = 110
  const cx = size / 2
  const cy = size / 2
  const markers = samples.filter((_, i) => i % 2 === 0)
  return (
    <svg width={size} height={size} className="w-full h-auto">
      <rect x={0} y={0} width={size} height={size} fill="#0b0f19" rx={8} />
      {/* compass circles */}
      {[1, 0.66, 0.33].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * f} fill="none" stroke="#334155" />
      ))}
      {/* N/E/S/W labels */}
      {[
        { t: 'N', a: 0 }, { t: 'E', a: 90 }, { t: 'S', a: 180 }, { t: 'W', a: 270 }
      ].map((d, i) => {
        const ang = (d.a - 90) * (Math.PI / 180)
        return <text key={i} x={cx + Math.cos(ang) * (r + 12)} y={cy + Math.sin(ang) * (r + 12)} fill="#94a3b8" fontSize={11} textAnchor="middle" dominantBaseline="middle">{d.t}</text>
      })}
      {/* sun points */}
      {markers.map((s, i) => {
        // Map azimuth (0=N) clockwise, and altitude to color/intensity
        const ang = (s.azimuth - 90) * (Math.PI / 180)
        const rr = r * (1 - Math.max(0, Math.min(60, s.altitude)) / 60) // higher altitude = closer to center
        const x = cx + Math.cos(ang) * rr
        const y = cy + Math.sin(ang) * rr
        const c = s.altitude > 0 ? '#fbbf24' : '#475569'
        return <circle key={i} cx={x} cy={y} r={3} fill={c} />
      })}
    </svg>
  )
}


