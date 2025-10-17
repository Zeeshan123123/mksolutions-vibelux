'use client';

import { AdvancedROICalculator } from '@/components/AdvancedROICalculator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How ROI works"
        subheading="Enter costs, savings, and time horizon to compute ROI and payback."
        planNotice="Pro plan: IRR/NPV and advanced export"
        steps={[
          { title: 'Capex & opex', description: 'Equipment, install, maintenance', href: '#', ctaLabel: 'Inputs' },
          { title: 'Savings', description: 'Energy, yield, labor assumptions', href: '#', ctaLabel: 'Assumptions' },
          { title: 'ROI & payback', description: 'Compute IRR/NPV/payback (pro)', href: '/pricing', ctaLabel: 'Unlock Pro' },
          { title: 'Export report', description: 'Share with stakeholders', href: '/export-center', ctaLabel: 'Export' },
        ]}
      />
      <AdvancedROICalculator />
    </div>
  );
}