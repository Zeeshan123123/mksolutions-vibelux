'use client';

import { PsychrometricCalculator } from '@/components/PsychrometricCalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function PsychrometricCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How psychrometrics work"
        subheading="Work with moist air properties to derive setpoints and latent loads."
        planNotice="Pro plan: export charts and batch calculations"
        steps={[
          { title: 'Pick two properties', description: 'Any two (e.g., DB + RH)', href: '#', ctaLabel: 'Select' },
          { title: 'Compute state', description: 'Wet bulb, dew point, grains', href: '#', ctaLabel: 'Compute' },
          { title: 'Process lines', description: 'Cooling/dehumidifying paths', href: '#', ctaLabel: 'Process' },
          { title: 'Apply to HVAC', description: 'Feed DOAS and coil sizing', href: '/design/mep/mechanical/ventilation-doas', ctaLabel: 'DOAS' },
        ]}
      />
      <PsychrometricCalculator />
    </div>
  );
}