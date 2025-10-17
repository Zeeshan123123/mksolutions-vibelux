'use client';

import { VoltageDropCalculator } from '@/components/VoltageDropCalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function ElectricalEstimatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How electrical estimator works"
        subheading="Estimate wire size/voltage drop and costs from load and run length."
        planNotice="Pro plan: cost library and batch export"
        steps={[
          { title: 'Enter load & length', description: 'Amps, voltage, conductor length', href: '#', ctaLabel: 'Inputs' },
          { title: 'Select conductor', description: 'Copper/Aluminum, temperature rating', href: '#', ctaLabel: 'Conductor' },
          { title: 'Review voltage drop', description: 'Ensure within design limits', href: '#', ctaLabel: 'Review' },
          { title: 'Export', description: 'Use for rough cost and panel planning', href: '/design/mep/electrical/panel-schedules', ctaLabel: 'Panels' },
        ]}
      />
      <VoltageDropCalculator />
    </div>
  );
}