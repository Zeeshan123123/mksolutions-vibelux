"use client";

import React from 'react';
import IntegratedSAMTCOCalculator from '@/components/IntegratedSAMTCOCalculator';

export default function TCOCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Total Cost of Ownership (TCO)</h1>
          <p className="text-gray-400 mt-2">
            Model full lifecycle costs and benefits including CAPEX, OPEX, incentives, and integrated solar.
          </p>
        </div>
        <IntegratedSAMTCOCalculator />
      </div>
    </div>
  );
}


