 

import Link from 'next/link'
import { ArrowRight, Zap, Brain, Calculator, Ruler, BarChart3, Shield, Globe, FileText, Layers, Thermometer, Grid3X3 } from 'lucide-react'
import { FeatureShowcase } from '@/components/marketing/FeatureShowcase'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | VibeLux',
  description:
    'Design engineering, advanced calculators, analytics, compliance, and integrations—everything you need to plan and operate modern cultivation.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'VibeLux Features',
    description:
      'Design engineering, advanced calculators, analytics, compliance, and integrations—everything you need to plan and operate modern cultivation.',
    url: 'https://vibelux.ai/features',
    type: 'website',
  },
}

export default function FeaturesPage() {
  const pillars = [
    {
      icon: Ruler,
      title: 'Design & Engineering',
      description:
        'Plan professional facilities with 3D visualization, panel schedules, and mechanical/electrical calculations.',
      links: [
        { label: 'Advanced Designer', href: '/design/advanced' },
        { label: 'CFD Analysis', href: '/cfd-analysis' },
      ],
    },
    {
    icon: Calculator,
      title: 'Advanced Calculators',
      description:
        'Hundreds of research‑grade tools for lighting, environment, and finance—built for growers and engineers.',
      links: [
        { label: 'All Calculators', href: '/calculators-advanced' },
        { label: 'ROI', href: '/calculators-advanced/roi' },
        { label: 'TCO', href: '/calculators-advanced/tco' },
      ],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description:
        'Dashboards, regression analysis, and exportable reports that translate data into decisions.',
      links: [
        { label: 'Regression Analysis', href: '/analytics/regression-analysis' },
        { label: 'Professional Reports', href: '/professional-reporting' },
      ],
    },
    {
      icon: Thermometer,
      title: 'Environmental Control',
      description:
        'Model climate strategies, optimize VPD and CO₂, and prepare for BMS/SCADA integrations.',
      links: [
        { label: 'VPD Tools', href: '/calculators-advanced/vpd' },
        { label: 'Psychrometric', href: '/calculators-advanced/psychrometric' },
      ],
    },
    {
      icon: Brain,
      title: 'AI Optimization',
      description:
        'Assistants and models for yield, quality, and energy—embedded where they drive the most value.',
      links: [
        { label: 'Design AI', href: '/(dashboard)/design/optimize' },
      ],
    },
    {
      icon: Shield,
      title: 'Compliance & SOPs',
      description:
        'Organize SOPs, track batches, and prepare documentation for audits and certifications.',
      links: [
        { label: 'METRC Overview', href: '/compliance/metrc' },
      ],
    },
    {
      icon: Globe,
      title: 'Integrations',
      description:
        'Connect climate computers, accounting, and data pipelines to keep teams and systems in sync.',
      links: [
        { label: 'PRIVA Integration', href: '/integrations/priva' },
      ],
    },
    {
      icon: FileText,
      title: 'Exports & Deliverables',
      description:
        'One‑click exports for drawings, analyses, and executive summaries to share with stakeholders.',
      links: [
        { label: 'Export Center', href: '/export-center' },
      ],
    },
  ]

  const proof = [
    { icon: Grid3X3, label: 'Calculators & tools', value: '300+' },
    { icon: Layers, label: 'UI components', value: '1,100+' },
    { icon: Zap, label: 'Performance‑focused', value: 'Edge & SSR' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/10 via-indigo-600/10 to-blue-600/10" />
        <div className="container mx-auto px-6 py-20 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold leading-tight">
              Everything you need to design, optimize, and operate modern cultivation
            </h1>
            <p className="text-gray-300 text-lg mt-4">
              VibeLux combines design engineering, research‑grade calculators, analytics, and compliance into a single, fast platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link 
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700"
              >
                See live demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/calculators-advanced"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                Explore calculators
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Proof band */}
      <section className="container mx-auto px-6 -mt-8 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {proof.map((p) => (
            <div key={p.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex items-center gap-3">
              <p.icon className="w-6 h-6 text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">{p.label}</div>
                <div className="text-lg font-semibold">{p.value}</div>
                    </div>
                      </div>
                    ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="container mx-auto px-6 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <p.icon className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold">{p.title}</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {p.links.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700">
                    {l.label}
                  </Link>
            ))}
          </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep feature explorer (existing component) */}
      <section className="mt-10">
        <FeatureShowcase />
      </section>

      {/* Mini FAQ */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Can I start with calculators only?</h3>
            <p className="text-gray-300 text-sm">Yes. Use calculators free, then upgrade to unlock saving, export, and batch features. You can adopt Designer and analytics later without migrations.</p>
              </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Do you support enterprise SSO and roles?</h3>
            <p className="text-gray-300 text-sm">Role‑based access, audit logs, MFA, and SSO/SAML are supported. Integrations and APIs are available for IT teams.</p>
              </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">How do exports work?</h3>
            <p className="text-gray-300 text-sm">Generate engineering summaries, financial analyses, and reports from the Export Center. Outputs include PDF/CSV as applicable.</p>
              </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">What integrations are available?</h3>
            <p className="text-gray-300 text-sm">Climate computers (e.g., PRIVA), accounting (QuickBooks), and data pipelines. Talk to us for custom connectors.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold">Build your next facility with confidence</h2>
          <p className="text-gray-300 mt-2">Start with calculators, generate reports, and scale into full design and analytics when you’re ready.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700">
              See live demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700">
              Compare plans
              </Link>
          </div>
        </div>
      </section>
    </div>
  )
}