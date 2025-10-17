import Link from 'next/link'
import type { Metadata } from 'next'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export const metadata: Metadata = {
  title: 'BMS Monitoring | VibeLux',
  description: 'Ingest and analyze facility sensor and energy data. Real-time monitoring with regression analytics and savings verification.',
}

export default function BMSMonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/40 rounded-full text-blue-300 text-sm mb-4">
            Sensor Hub & Monitoring
          </div>
          <h1 className="text-4xl font-bold mb-3">BMS Monitoring & Sensor Ingest</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Stream facility data into VibeLux via secure API. Store readings, run regressions, and drive verified energy savings.
          </p>
        </div>

        <HowItWorksStrip
          heading="How BMS Monitoring Works"
          subheading="Connect your building systems and start capturing readings in minutes."
          planNotice="Sensor Hub included in Teams+ plans"
          steps={[
            { title: 'Connect', description: 'Send readings to /api/bms/ingest with your facilityId and sensor payloads', href: '/docs', ctaLabel: 'API Docs' },
            { title: 'Store', description: 'Data is stored in your Postgres (Neon) for reliability and analysis', href: '#', ctaLabel: 'Data Model' },
            { title: 'Analyze', description: 'Use regression analytics to correlate drivers vs. energy usage', href: '/analytics/overview', ctaLabel: 'Analytics' },
            { title: 'Save', description: 'Feed insights into schedules and savings verification', href: '/energy', ctaLabel: 'Energy Program' },
          ]}
        />

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            {
              title: 'Secure Ingest API',
              desc: 'POST /api/bms/ingest accepts batched readings with timestamps, units, and optional cost.',
            },
            {
              title: 'Typed Storage',
              desc: 'Readings persisted in EnergyReading with indices for fast analytics and dashboards.',
            },
            {
              title: 'Privacy First',
              desc: 'Per-facility scoping and audit logging. No device secrets stored in plaintext.',
            },
          ].map((c) => (
            <div key={c.title} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-gray-300 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/pricing" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
            View Plans
          </Link>
        </div>
      </div>
    </div>
  )
}