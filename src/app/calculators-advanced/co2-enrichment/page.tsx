'use client';

import { CO2EnrichmentCalculator } from '@/components/CO2EnrichmentCalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function CO2EnrichmentCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How CO₂ enrichment works"
        subheading="Target ppm by crop stage; compute flow and duration for controllers."
        steps={[
          { title: 'Set target ppm', description: 'Stage-based CO₂ setpoints', href: '#', ctaLabel: 'Targets' },
          { title: 'Room volume & leakage', description: 'Calculate required flow', href: '#', ctaLabel: 'Inputs' },
          { title: 'Controller timing', description: 'Pulse duration and safety', href: '#', ctaLabel: 'Guide' },
          { title: 'Apply to controls', description: 'Use with VibeLux or third-party', href: '/energy-monitoring', ctaLabel: 'Monitoring' },
        ]}
      />
      <CO2EnrichmentCalculator />
    </div>
  );
}