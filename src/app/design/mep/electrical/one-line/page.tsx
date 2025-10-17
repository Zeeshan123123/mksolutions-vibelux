'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

type Node = { id: string; type: 'utility' | 'xfmr' | 'panel' | 'load'; label: string }
type Edge = { from: string; to: string }

export default function OneLinePage() {
  const [nodes] = useState<Node[]>([
    { id: 'util', type: 'utility', label: 'Utility Service' },
    { id: 'xf1', type: 'xfmr', label: '75 kVA, 5.75% Z' },
    { id: 'MDP', type: 'panel', label: 'Main Dist Panel 400A' },
    { id: 'LP1', type: 'panel', label: 'Lighting Panel 225A' },
  ])
  const [edges] = useState<Edge[]>([
    { from: 'util', to: 'xf1' },
    { from: 'xf1', to: 'MDP' },
    { from: 'MDP', to: 'LP1' },
  ])

  const exportCSV = () => {
    exportToCSV(nodes as any[], 'one_line_nodes.csv')
    exportToCSV(edges as any[], 'one_line_edges.csv')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">One-Line Diagram (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How one-line works"
          subheading="Define source → transformer → main distribution → panels → loads. Export for CAD."
          planNotice="Pro plan: CAD/DXF exports and electrical report bundling"
          steps={[
            { title: 'Define source/xfmr', description: 'Utility service and transformer impedance', href: '/design/mep/electrical/fault-aic', ctaLabel: 'Fault/AIC' },
            { title: 'Add panels', description: 'Main and downstream panels by rating', href: '/design/mep/electrical/panel-schedules', ctaLabel: 'Panel Schedules' },
            { title: 'Assign loads', description: 'Lighting and equipment loads to panels', href: '/design/advanced', ctaLabel: 'Designer' },
            { title: 'Export', description: 'Export CSV and send to CAD/DXF', href: '/export-center', ctaLabel: 'Export Center' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Graph</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={exportCSV}>Export CSV</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400">Nodes</div>
                {nodes.map(n => (
                  <div key={n.id} className="p-2 bg-gray-800 rounded mb-2">{n.id} – {n.type} – {n.label}</div>
                ))}
              </div>
              <div>
                <div className="text-xs text-gray-400">Edges</div>
                {edges.map((e, i) => (
                  <div key={i} className="p-2 bg-gray-800 rounded mb-2">{e.from} → {e.to}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

