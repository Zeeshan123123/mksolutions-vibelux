import type { Metadata } from 'next'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export const metadata: Metadata = {
  title: 'Energy Savings Deep Dive | VibeLux',
  description: 'Seasonal baselines, manual adjustments (HPS→LED, hours), weather normalization, and verification examples.'
}

export default function EnergyDeepDivePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Energy Savings Deep Dive</h1>
          <p className="text-gray-400 text-lg">Seasonality, operational adjustments, and verified savings with examples.</p>
        </div>

        <HowItWorksStrip
          heading="How Verification Works"
          subheading="Establish monthly baselines, apply adjustments, track reductions, share revenue."
          steps={[
            { title: 'Baseline', description: 'Set monthly baselines (kWh, kW, rate)', href: '/energy/setup/utility', ctaLabel: 'Setup' },
            { title: 'Adjust', description: 'Record changes like HPS→LED and hours', href: '/integrations/utility-api?tab=automation', ctaLabel: 'Adjustments' },
            { title: 'Normalize', description: 'Optional weather normalization for fair comparisons', href: '#', ctaLabel: 'Weather' },
            { title: 'Verify', description: 'Calculate verified savings and pay out shares', href: '/pricing', ctaLabel: 'Program' },
          ]}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-2">Seasonality</h3>
            <p className="text-gray-300 text-sm">Use monthly baselines to reflect seasonal changes in lighting/heating loads and daylight contribution.</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-2">Operational Adjustments</h3>
            <p className="text-gray-300 text-sm">Record material changes (e.g., HPS to LED) and operation hours to adjust comparisons fairly.</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-2">Verification</h3>
            <p className="text-gray-300 text-sm">Compute savings with adjustments and optional weather normalization; log methodology in reports.</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-2">Revenue Sharing</h3>
            <p className="text-gray-300 text-sm">A typical split: buyer retains 75% of verified savings; we take 25% only when you save.</p>
          </div>
        </div>
      </div>
    </div>
  )
}


