import Link from 'next/link'
import type { Metadata } from 'next'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export const metadata: Metadata = {
  title: 'Trials & Licensing | VibeLux',
  description: 'List proven trials, sell licenses, and manage entitlements. Buyers get instant access after payment.'
}

export default function TrialsLicensingOverviewPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/40 rounded-full text-blue-300 text-sm mb-4">
            Trials & Licensing
          </div>
          <h1 className="text-4xl font-bold mb-3">Monetize Your Protocols</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Create listings from successful trials. Buyers pay via Stripe; entitlements grant access automatically.
          </p>
        </div>

        <HowItWorksStrip
          heading="How Licensing Works"
          subheading="Seller lists → Buyer pays → Webhook confirms → Access granted."
          planNotice="Seller tools included in Starter+ plans"
          steps={[
            { title: 'Create Listing', description: 'Select a trial and set rights, exclusivity, price', href: '/research/trials', ctaLabel: 'Select Trial' },
            { title: 'Checkout', description: 'Buyer completes secure Stripe checkout', href: '/marketplace/trial-licenses', ctaLabel: 'Browse' },
            { title: 'Entitlement', description: 'Payment success → entitlement created', href: '#', ctaLabel: 'How it’s granted' },
            { title: 'Manage', description: 'Track buyers and granted access in your dashboard', href: '/marketplace', ctaLabel: 'Manage' },
          ]}
        />

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { title: 'Usage Rights', desc: 'Commercial, research-only, or unlimited—clear terms for both sides.' },
            { title: 'Exclusivity', desc: 'Sell exclusive or non-exclusive licenses depending on your goals.' },
            { title: 'Automation', desc: 'Webhooks finalize purchases and create entitlements instantly.' },
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


