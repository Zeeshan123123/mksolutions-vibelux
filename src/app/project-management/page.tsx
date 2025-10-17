import Link from 'next/link'
import type { Metadata } from 'next'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export const metadata: Metadata = {
  title: 'Project Management Suite | VibeLux',
  description: 'Organize projects, manage versions, and export construction-ready packages. Centralize MEP outputs and AI Designer reports.'
}

export default function ProjectManagementPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-gray-300 text-sm mb-4">
            Project Management
          </div>
          <h1 className="text-4xl font-bold mb-3">Project Management Suite</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            From concept to construction: templates, versioning, MEP outputs, and export-ready deliverables all in one place.
          </p>
        </div>

        <HowItWorksStrip
          heading="How Project Management Works"
          subheading="Keep your team aligned with structured workflows and export-ready packages."
          steps={[
            { title: 'Template', description: 'Start from proven templates or import designs', href: '/design/advanced', ctaLabel: 'Design Studio' },
            { title: 'Organize', description: 'Track versions, notes, and sheet indexes', href: '/design/mep/architecture/sheet-manager', ctaLabel: 'Sheet Manager' },
            { title: 'Integrate', description: 'Attach MEP outputs and AI Designer reports', href: '/mep', ctaLabel: 'MEP Suite' },
            { title: 'Export', description: 'Generate PDF/DXF/Excel for bidding and build', href: '#', ctaLabel: 'Export' },
          ]}
        />

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { title: 'Versions & Notes', desc: 'Maintain clear version history and project notes to track decisions.' },
            { title: 'Linked Outputs', desc: 'Attach panel schedules, one-lines, and PPFD maps to each project.' },
            { title: 'Export Center', desc: 'Generate combined packages for submittals and construction.' },
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


