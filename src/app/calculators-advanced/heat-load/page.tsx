'use client';

import { EnhancedHeatLoadCalculator } from '@/components/EnhancedHeatLoadCalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function HeatLoadCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How heat load works"
        subheading="Calculate sensible and latent loads from lights, equipment, and people to size HVAC."
        steps={[
          { title: 'Lighting & equipment', description: 'Watts → BTU/h sensible', href: '/design/advanced', ctaLabel: 'From Design' },
          { title: 'Occupancy & latent', description: 'People and moisture generation', href: '#', ctaLabel: 'Inputs' },
          { title: 'Delta T / airflow', description: 'Translate to required CFM and tons', href: '/design/mep/mechanical/room-loads', ctaLabel: 'Room Loads' },
          { title: 'Export report', description: 'Provide to mechanical engineer', href: '/export-center', ctaLabel: 'Export' },
        ]}
      />
      <EnhancedHeatLoadCalculator />
    </div>
  );
}