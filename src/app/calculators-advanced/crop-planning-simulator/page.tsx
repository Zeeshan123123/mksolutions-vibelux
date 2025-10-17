'use client';

import { CropPlanningSimulator } from '@/components/CropPlanningSimulator';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function CropPlanningSimulatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How crop planning works"
        subheading="Align seeding, transplant, and harvest schedules to meet demand."
        steps={[
          { title: 'Set demand curve', description: 'Weekly/monthly volume targets', href: '#', ctaLabel: 'Demand' },
          { title: 'Growth durations', description: 'Stage durations by crop', href: '#', ctaLabel: 'Durations' },
          { title: 'Capacity & constraints', description: 'Beds, benches, labor windows', href: '#', ctaLabel: 'Constraints' },
          { title: 'Plan & export', description: 'Schedules and purchase plans', href: '/export-center', ctaLabel: 'Export' },
        ]}
      />
      <CropPlanningSimulator />
    </div>
  );
}