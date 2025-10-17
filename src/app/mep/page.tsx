import Link from 'next/link'
import type { Metadata } from 'next'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export const metadata: Metadata = {
  title: 'MEP Suite | VibeLux',
  description: 'Electrical one-line, panel schedules, fault/AIC checks, DOAS/duct sizing, and export-ready documentation.',
}

export default function MEPSuitePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700/40 rounded-full text-purple-300 text-sm mb-4">
            Mechanical • Electrical • Plumbing
          </div>
          <h1 className="text-4xl font-bold mb-3">MEP Suite for CEA Facilities</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Design-ready tools for electrical one-lines, panel schedules, fault/AIC checks, DOAS and duct sizing—all exportable to PDF/DXF/Excel.
          </p>
        </div>

        <HowItWorksStrip
          heading="How MEP Suite Works"
          subheading="Go from concept to construction documents."
          planNotice="PDF/DXF/Excel exports included in Pro+ plans"
          steps={[
            { title: 'Define', description: 'Enter system data for panels, feeders, and HVAC parameters', href: '/design/mep/electrical/panel-schedules', ctaLabel: 'Electrical' },
            { title: 'Validate', description: 'Run fault/AIC checks and loading validations', href: '/design/mep/electrical/fault-aic', ctaLabel: 'Fault/AIC' },
            { title: 'Size', description: 'Calculate DOAS and duct dimensions for airflow performance', href: '/design/mep/mechanical/duct-sizing', ctaLabel: 'Ducts' },
            { title: 'Export', description: 'Generate PDF/DXF/Excel for bidding and construction', href: '#', ctaLabel: 'Export' },
          ]}
        />

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { title: 'One-Line Diagrams', desc: 'Lay out service, transformers, panels, and loads with simplified visuals.' },
            { title: 'Panel Schedules', desc: 'Balanced circuits, VA, amps, and loading percentages ready for export.' },
            { title: 'Fault/AIC', desc: 'Check available fault current and ensure interrupting ratings meet code.' },
          ].map(card => (
            <div key={card.title} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-300 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/pricing" className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">
            View Plans
          </Link>
        </div>
      </div>
    </div>
  )
}


