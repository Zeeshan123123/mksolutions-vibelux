'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Thermometer, Wind, Workflow, Pipette, 
  PanelTop, Split, Zap, 
  Droplets, Flame, 
  FileStack, ShieldCheck
} from 'lucide-react'

const sections = [
  {
    title: 'Mechanical',
    items: [
      { name: 'Room Loads', icon: Thermometer, href: '/design/mep/mechanical/room-loads' },
      { name: 'Ventilation / DOAS', icon: Wind, href: '/design/mep/mechanical/ventilation-doas' },
      { name: 'Duct Sizing', icon: Workflow, href: '/design/mep/mechanical/duct-sizing' },
      { name: 'Pipe Sizing', icon: Pipette, href: '/design/mep/mechanical/pipe-sizing' },
    ],
  },
  {
    title: 'Electrical',
    items: [
      { name: 'Panel Schedules', icon: PanelTop, href: '/design/mep/electrical/panel-schedules' },
      { name: 'One-Line Diagram', icon: Split, href: '/design/mep/electrical/one-line' },
      { name: 'Fault / AIC Check', icon: Zap, href: '/design/mep/electrical/fault-aic' },
    ],
  },
  {
    title: 'Plumbing',
    items: [
      { name: 'Fixture Unit Sizing', icon: Droplets, href: '/design/mep/plumbing/fixture-units' },
      { name: 'DHW Sizing', icon: Flame, href: '/design/mep/plumbing/dhw-sizing' },
    ],
  },
  {
    title: 'Architecture',
    items: [
      { name: 'Sheet Manager', icon: FileStack, href: '/design/mep/architecture/sheet-manager' },
      { name: 'Life Safety Summary', icon: ShieldCheck, href: '/design/mep/architecture/life-safety' },
    ],
  },
]

export default function MEPIndexPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">MEP / Architecture – MVP Tools</h1>
        <p className="text-gray-400">Quick calculators and exports. These are scaffolds and do not change database state.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Card key={section.title} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {section.items.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <Button variant="outline" className="w-full justify-start">
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

