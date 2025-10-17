'use client';

import { PPFDMapCalculator } from '@/components/PPFDMapCalculator';
import Link from 'next/link'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function PPFDMapCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How PPFD mapping works"
        subheading="Simulate distribution across canopy to evaluate uniformity."
        steps={[
          { title: 'Import layout', description: 'Room and fixture positions', href: '/design/advanced', ctaLabel: 'Open Designer' },
          { title: 'Set canopy plane', description: 'Calculation height', href: '#', ctaLabel: 'Set Height' },
          { title: 'Run simulation', description: 'View heatmap & min/avg', href: '#', ctaLabel: 'Simulate' },
          { title: 'Optimize', description: 'Adjust spacing and aim', href: '/design/advanced', ctaLabel: 'Refine' },
        ]}
      />
      <div className="max-w-6xl mx-auto px-6 -mt-4 mb-4 text-right text-xs">
        <Link href="/how-it-works/photometry-ies?utm_source=vibelux&utm_medium=howitworks&utm_campaign=photometry_help&utm_content=ppfd_map" className="text-blue-400 hover:text-blue-300 underline">
          Learn about IES/photometry
        </Link>
      </div>
      <PPFDMapCalculator />
    </div>
  );
}