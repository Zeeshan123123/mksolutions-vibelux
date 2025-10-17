'use client';

import { EnhancedCoverageAreaCalculator } from '@/components/EnhancedCoverageAreaCalculator';
import Link from 'next/link'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function CoverageAreaCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How coverage area works"
        subheading="Estimate fixture count to meet light levels for given dimensions."
        steps={[
          { title: 'Room dimensions', description: 'Width/length/height', href: '/design/advanced', ctaLabel: 'From Design' },
          { title: 'Fixture selection', description: 'PPF and distribution', href: '/fixtures', ctaLabel: 'Browse Fixtures' },
          { title: 'Target PPFD/DLI', description: 'Set crop-specific targets', href: '/design/advanced', ctaLabel: 'Set Targets' },
          { title: 'Export', description: 'Use for budgeting and layout', href: '/export-center', ctaLabel: 'Export' },
        ]}
      />
      <div className="max-w-6xl mx-auto px-6 -mt-4 mb-4 text-right text-xs">
        <Link href="/how-it-works/photometry-ies?utm_source=vibelux&utm_medium=howitworks&utm_campaign=photometry_help&utm_content=coverage_area" className="text-blue-400 hover:text-blue-300 underline">
          Learn about IES/photometry
        </Link>
      </div>
      <EnhancedCoverageAreaCalculator />
    </div>
  );
}