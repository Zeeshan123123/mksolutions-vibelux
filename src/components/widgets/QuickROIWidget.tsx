'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickROIWidget() {
  const router = useRouter();
  const [sqft, setSqft] = useState('');
  const [rate, setRate] = useState('');
  
  const calculate = () => {
    const size = parseFloat(sqft) || 10000;
    const electricity = parseFloat(rate) || 0.12;
    
    // Quick calculation
    const annualCost = size * 35 * 12 * electricity * 365 / 1000; // 35W/sqft, 12hrs/day
    const savings = annualCost * 0.25; // 25% average savings
    
    // Redirect to full calculator with values
    router.push(`/calculators/roi?size=${size}&rate=${electricity}`);
  };
  
  const quickCalc = () => {
    if (!sqft || !rate) return null;
    
    const size = parseFloat(sqft);
    const electricity = parseFloat(rate);
    const annualCost = size * 35 * 12 * electricity * 365 / 1000;
    const savings = annualCost * 0.25;
    
    return savings;
  };
  
  const estimatedSavings = quickCalc();

  return (
    <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="w-6 h-6 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Quick ROI Calculator</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Facility Size (sq ft)</label>
          <input
            type="number"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
            placeholder="10000"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Electricity Rate ($/kWh)</label>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="0.12"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
        </div>
        
        {estimatedSavings && (
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Estimated Annual Savings</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">
              ${estimatedSavings.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on 25% energy reduction
            </div>
          </div>
        )}
        
        <button
          onClick={calculate}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          See Full Analysis
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Most growers see ROI in 3-6 months
      </p>
    </div>
  );
}