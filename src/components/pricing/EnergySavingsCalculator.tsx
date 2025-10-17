'use client';

import { useState } from 'react';
import { 
  Calculator, TrendingDown, DollarSign, Zap, 
  AlertCircle, ArrowRight, CheckCircle, Info 
} from 'lucide-react';
import { ENERGY_SAVINGS_PROGRAM } from '@/lib/pricing/unified-pricing';

interface SavingsResult {
  currentCost: number;
  estimatedSavings: number;
  vibeluxShare: number;
  growerProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  roi: number;
}

export function EnergySavingsCalculator() {
  const [inputs, setInputs] = useState({
    facilitySize: 10000, // sq ft
    lightsWattage: 50, // kW
    hoursPerDay: 12,
    daysPerMonth: 30,
    electricityRate: 0.12, // $/kWh
    demandCharge: 15, // $/kW
    peakHours: 4,
  });
  
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SavingsResult | null>(null);

  const calculateSavings = () => {
    // Current monthly energy cost
    const monthlyKwh = inputs.lightsWattage * inputs.hoursPerDay * inputs.daysPerMonth;
    const energyCost = monthlyKwh * inputs.electricityRate;
    const demandCost = inputs.lightsWattage * inputs.demandCharge;
    const currentCost = energyCost + demandCost;

    // Estimated savings (using typical 35% savings)
    const savingsRate = ENERGY_SAVINGS_PROGRAM.estimatedSavings.typical;
    const totalSavings = currentCost * savingsRate;

    // Revenue split
    const vibeluxShare = totalSavings * ENERGY_SAVINGS_PROGRAM.revenueShare;
    const growerProfit = totalSavings - vibeluxShare;

    setResults({
      currentCost,
      estimatedSavings: totalSavings,
      vibeluxShare,
      growerProfit,
      monthlyProfit: growerProfit,
      yearlyProfit: growerProfit * 12,
      roi: (growerProfit * 12) / (currentCost * 12) * 100,
    });
    setShowResults(true);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="bg-gray-900 rounded-xl p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-green-400" />
          Energy Savings Calculator
        </h2>
        <p className="text-gray-400">
          See how much you can earn with our free Energy Savings Program
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Facility Size (sq ft)
            </label>
            <input
              type="number"
              value={inputs.facilitySize}
              onChange={(e) => setInputs({ ...inputs, facilitySize: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Total Lighting Load (kW)
            </label>
            <input
              type="number"
              value={inputs.lightsWattage}
              onChange={(e) => setInputs({ ...inputs, lightsWattage: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Hours Per Day
            </label>
            <input
              type="number"
              value={inputs.hoursPerDay}
              onChange={(e) => setInputs({ ...inputs, hoursPerDay: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Electricity Rate ($/kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={inputs.electricityRate}
              onChange={(e) => setInputs({ ...inputs, electricityRate: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Demand Charge ($/kW)
            </label>
            <input
              type="number"
              step="0.01"
              value={inputs.demandCharge}
              onChange={(e) => setInputs({ ...inputs, demandCharge: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2">How It Works</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Automated load shedding during peak hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Demand response participation for utility rebates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Weather-adaptive lighting control</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Time-of-use optimization</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-400 mb-2">Revenue Sharing</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Your Share:</span>
                <span className="font-semibold text-white">75%</span>
              </div>
              <div className="flex justify-between">
                <span>VibeLux Share:</span>
                <span className="font-semibold text-white">25%</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                <Info className="w-3 h-3 inline mr-1" />
                We only make money when you save money
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={calculateSavings}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate My Savings
      </button>

      {/* Results Section */}
      {showResults && results && (
        <div className="mt-8 space-y-6">
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Estimated Earnings</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Monthly Energy Cost:</span>
                    <span className="text-white font-semibold">{formatCurrency(results.currentCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Monthly Savings:</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(results.estimatedSavings)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">VibeLux Share (25%):</span>
                    <span className="text-gray-400">-{formatCurrency(results.vibeluxShare)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Your Monthly Profit:</span>
                      <span className="text-green-400 font-bold text-xl">{formatCurrency(results.growerProfit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-green-900/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {formatCurrency(results.yearlyProfit)}
                  </div>
                  <div className="text-sm text-gray-400">Annual Profit</div>
                  <div className="mt-3 text-lg font-semibold text-white">
                    {results.roi.toFixed(0)}% ROI
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-yellow-400 mb-1">Requirements:</p>
                <ul className="space-y-1">
                  {ENERGY_SAVINGS_PROGRAM.requirements.map((req, idx) => (
                    <li key={idx}>• {req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2">
              Get Started - It's Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}