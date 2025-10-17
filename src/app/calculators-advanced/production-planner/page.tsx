'use client';

import { ProductionPlanner } from '@/components/ProductionPlanner';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function ProductionPlannerPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <HowItWorksStrip
        dense
        heading="How production planning works"
        subheading="Translate forecasts into weekly sowing/transplant/harvest plans."
        planNotice="Teams+ plan: task export and API"
        steps={[
          { title: 'Forecast demand', description: 'Import sales forecast or set targets', href: '#', ctaLabel: 'Forecast' },
          { title: 'Map stages', description: 'Stage timings and capacity limits', href: '#', ctaLabel: 'Stages' },
          { title: 'Generate plan', description: 'Week-by-week actions and labor', href: '#', ctaLabel: 'Plan' },
          { title: 'Export tasks', description: 'Sync to project management', href: '/project-management', ctaLabel: 'Tasks' },
        ]}
      />
      <ProductionPlanner />
    </div>
  );
}