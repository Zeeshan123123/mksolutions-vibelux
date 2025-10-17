'use client';

import { TranspirationCalculator } from '@/components/TranspirationCalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function TranspirationCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How transpiration works"
        subheading="Estimate plant water loss to size irrigation and dehumidification."
        planNotice="Pro plan: scenario comparison and export"
        steps={[
          { title: 'Environmental inputs', description: 'Temp, RH, airflow, light', href: '#', ctaLabel: 'Inputs' },
          { title: 'Crop parameters', description: 'Leaf area and stomatal factors', href: '#', ctaLabel: 'Crop' },
          { title: 'Water loss', description: 'Hourly/day totals per zone', href: '#', ctaLabel: 'Results' },
          { title: 'Apply to DOAS', description: 'Drive dehumidifier sizing', href: '/design/mep/mechanical/ventilation-doas', ctaLabel: 'DOAS' },
        ]}
      />
      <TranspirationCalculator />
    </div>
  );
}