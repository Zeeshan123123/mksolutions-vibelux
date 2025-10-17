'use client';

import { EnvironmentalControlCalculator } from '@/components/EnvironmentalControlCalculator';

export default function EnvironmentalSimulatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Environmental Simulator</h1>
        <p className="text-gray-400 mb-8">24-hour climate simulation and optimization</p>
        <EnvironmentalControlCalculator />
      </div>
    </div>
  );
}