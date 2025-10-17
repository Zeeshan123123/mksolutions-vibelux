import type { Metadata } from 'next'
import Link from 'next/link'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export const metadata: Metadata = {
  title: 'Analytics & Regression | VibeLux',
  description: 'Correlation analysis between drivers and energy usage. Hourly alignment, R², and actionable insights.'
}

export default function AnalyticsOverviewPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/40 rounded-full text-blue-300 text-sm mb-4">
            Analytics & Insights
          </div>
          <h1 className="text-4xl font-bold mb-3">Analytics & Regression</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Quantify relationships between environmental drivers and energy usage. Identify high-impact levers for savings.
          </p>
        </div>

        <HowItWorksStrip
          heading="From Readings to Insights"
          subheading="Pair sensor data and energy usage, align by hour, compute trend lines and R²."
          steps={[
            { title: 'Ingest', description: 'Stream readings via /api/bms/ingest', href: '/bms', ctaLabel: 'Sensor Hub' },
            { title: 'Align', description: 'Automatic hourly alignment of drivers vs. targets', href: '#', ctaLabel: 'Alignment' },
            { title: 'Regress', description: 'GET /api/analytics/regression?x=...&y=...', href: '/docs', ctaLabel: 'API Docs' },
            { title: 'Act', description: 'Drive schedules and baselines from quantified drivers', href: '/energy', ctaLabel: 'Energy' },
          ]}
        />

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { title: 'Hourly Alignment', desc: 'We align time series to hourly buckets for robust pairing.' },
            { title: 'Linear Regression', desc: 'Slope, intercept, and R² quantify the relationships.' },
            { title: 'Actionable', desc: 'Feed insights into controls and verify savings impacts.' },
          ].map(card => (
            <div key={card.title} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-300 text-sm">{card.desc}</p>
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


