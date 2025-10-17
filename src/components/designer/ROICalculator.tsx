import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Leaf, Zap } from 'lucide-react';

interface ROICalculatorProps {
  fixtures: any[];
  room: any;
  powerMetrics: any;
  onClose: () => void;
}

export default function ROICalculator({ fixtures, room, powerMetrics, onClose }: ROICalculatorProps) {
  const [electricityRate, setElectricityRate] = useState(0.12); // $/kWh
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [yieldIncrease, setYieldIncrease] = useState(30); // %
  const [cropValuePerPound, setCropValuePerPound] = useState(2000);
  
  const calculations = useMemo(() => {
    const totalPower = powerMetrics?.totalPower || 0;
    const dailyKwh = (totalPower / 1000) * hoursPerDay;
    const annualKwh = dailyKwh * 365;
    const annualElectricityCost = annualKwh * electricityRate;
    
    const fixturesCost = fixtures.length * 800; // Estimated $800 per fixture
    const installationCost = fixtures.length * 200; // Estimated $200 per fixture installation
    const totalInitialInvestment = fixturesCost + installationCost;
    
    const area = room.dimensions.length * room.dimensions.width;
    const baseYieldPerSqFt = 0.5; // pounds per sq ft per year
    const enhancedYieldPerSqFt = baseYieldPerSqFt * (1 + yieldIncrease / 100);
    const additionalYield = (enhancedYieldPerSqFt - baseYieldPerSqFt) * area;
    const annualRevenue = additionalYield * cropValuePerPound;
    
    const annualProfit = annualRevenue - annualElectricityCost;
    const paybackPeriod = totalInitialInvestment / annualProfit;
    const fiveYearROI = ((annualProfit * 5 - totalInitialInvestment) / totalInitialInvestment) * 100;
    
    return {
      totalInitialInvestment,
      annualElectricityCost,
      annualRevenue,
      annualProfit,
      paybackPeriod,
      fiveYearROI,
      dailyKwh,
      annualKwh,
      additionalYield
    };
  }, [fixtures, room, powerMetrics, electricityRate, hoursPerDay, yieldIncrease, cropValuePerPound]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Electricity Rate ($/kWh)
          </label>
          <input
            type="number"
            value={electricityRate}
            onChange={(e) => setElectricityRate(Number(e.target.value))}
            step="0.01"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hours Per Day
          </label>
          <input
            type="number"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Yield Increase (%)
          </label>
          <input
            type="number"
            value={yieldIncrease}
            onChange={(e) => setYieldIncrease(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Crop Value ($/lb)
          </label>
          <input
            type="number"
            value={cropValuePerPound}
            onChange={(e) => setCropValuePerPound(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold">Initial Investment</h3>
          </div>
          <p className="text-2xl font-bold">${calculations.totalInitialInvestment.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold">Annual Energy Cost</h3>
          </div>
          <p className="text-2xl font-bold">${calculations.annualElectricityCost.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Additional Annual Revenue</h3>
          </div>
          <p className="text-2xl font-bold">${calculations.annualRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Annual Profit</h3>
          </div>
          <p className="text-2xl font-bold text-green-400">${calculations.annualProfit.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-purple-900 bg-opacity-50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">ROI Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Payback Period:</span>
            <span className="font-bold">{calculations.paybackPeriod.toFixed(1)} years</span>
          </div>
          <div className="flex justify-between">
            <span>5-Year ROI:</span>
            <span className="font-bold text-green-400">{calculations.fiveYearROI.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Additional Yield:</span>
            <span className="font-bold">{calculations.additionalYield.toFixed(0)} lbs/year</span>
          </div>
        </div>
      </div>
    </div>
  );
}