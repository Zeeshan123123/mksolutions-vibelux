'use client';

import { VPDAdvancedCalculator } from '@/components/VPDAdvancedCalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function VPDAdvancedCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How advanced VPD works"
        subheading="Account for leaf temperature offsets and target bands per stage."
        steps={[
          { title: 'Leaf temp offset', description: 'Adjust canopy vs air temp', href: '#', ctaLabel: 'Offset' },
          { title: 'Stage bands', description: 'Acceptable min/max VPD by stage', href: '#', ctaLabel: 'Bands' },
          { title: 'Recommendations', description: 'Suggested temp/RH setpoints', href: '#', ctaLabel: 'Setpoints' },
          { title: 'Apply to controls', description: 'Implement in automation', href: '/energy-monitoring', ctaLabel: 'Monitoring' },
        ]}
      />
      <VPDAdvancedCalculator />
    </div>
  );
}