'use client';

import { VPDAdvancedCalculator } from '@/components/VPDAdvancedCalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function VPDCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How VPD works"
        subheading="Input temperature and humidity to target VPD setpoints by crop stage."
        steps={[
          { title: 'Enter temp/RH', description: 'Dry bulb and relative humidity', href: '#', ctaLabel: 'Inputs' },
          { title: 'Select crop stage', description: 'Veg, flower, cloning presets', href: '#', ctaLabel: 'Stages' },
          { title: 'Review target VPD', description: 'Get recommended setpoints', href: '#', ctaLabel: 'Targets' },
          { title: 'Apply in controls', description: 'Use to drive HVAC/Dehu setpoints', href: '/energy-monitoring', ctaLabel: 'Open Monitoring' },
        ]}
      />
      <VPDAdvancedCalculator />
    </div>
  );
}