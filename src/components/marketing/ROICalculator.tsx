'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calculator, 
  TrendingDown, 
  DollarSign, 
  Zap,
  Building,
  ArrowRight,
  Info
} from 'lucide-react'

export default function ROICalculator() {
  const [facilitySize, setFacilitySize] = useState(10000)
  const [energyCost, setEnergyCost] = useState(0.12)
  const [lightingHours, setLightingHours] = useState(18)
  const [hvacLoad, setHvacLoad] = useState(40)
  
  // Calculate savings
  const wattsPerSqFt = 2.5 // Industry average
  const totalWatts = facilitySize * wattsPerSqFt
  const dailyKwh = (totalWatts / 1000) * lightingHours
  const monthlyKwh = dailyKwh * 30
  const currentMonthlyCost = monthlyKwh * energyCost
  
  // VibeLux optimizations
  const lightingSavings = 0.30 // 30% lighting reduction
  const hvacSavings = hvacLoad * 0.01 * 0.25 // 25% HVAC savings
  const totalSavingsPercent = lightingSavings + hvacSavings
  const monthlySavings = currentMonthlyCost * totalSavingsPercent
  const annualSavings = monthlySavings * 12
  
  // Payback period (Professional plan at $299/month)
  const monthlySubscription = 299
  const netMonthlySavings = monthlySavings - monthlySubscription
  const paybackDays = monthlySubscription / (monthlySavings / 30)

  return (
    <section className="py-20 bg-gradient-to-b from-gray-950 to-purple-950/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Calculate Your Savings
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how much you can save with VibeLux energy optimization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator Inputs */}
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-purple-500" />
              Your Facility Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facility Size (sq ft)
                </label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={facilitySize}
                  onChange={(e) => setFacilitySize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>1,000</span>
                  <span className="text-white font-medium">{facilitySize.toLocaleString()} sq ft</span>
                  <span>100,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Energy Cost ($/kWh)
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.01"
                  value={energyCost}
                  onChange={(e) => setEnergyCost(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>$0.05</span>
                  <span className="text-white font-medium">${energyCost.toFixed(2)}/kWh</span>
                  <span>$0.30</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Daily Lighting Hours
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  step="1"
                  value={lightingHours}
                  onChange={(e) => setLightingHours(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>12h</span>
                  <span className="text-white font-medium">{lightingHours} hours</span>
                  <span>24h</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HVAC Load (% of total energy)
                </label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={hvacLoad}
                  onChange={(e) => setHvacLoad(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>20%</span>
                  <span className="text-white font-medium">{hvacLoad}%</span>
                  <span>60%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400">
                  Industry average: 2.5W/sq ft for lighting, adjustable based on your actual usage
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Current Costs */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4">Current Energy Costs</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Energy Usage</span>
                  <span className="text-white font-medium">{monthlyKwh.toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Energy Cost</span>
                  <span className="text-white font-medium">${currentMonthlyCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Energy Cost</span>
                  <span className="text-white font-medium">${(currentMonthlyCost * 12).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* VibeLux Savings */}
            <div className="bg-gradient-to-r from-green-900/20 to-purple-900/20 rounded-xl p-6 border border-green-800">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-500" />
                With VibeLux Optimization
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lighting Savings</span>
                  <span className="text-green-400 font-medium">-{(lightingSavings * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HVAC Savings</span>
                  <span className="text-green-400 font-medium">-{(hvacSavings * 100).toFixed(0)}%</span>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Savings</span>
                    <span className="text-green-400 font-bold text-xl">-{(totalSavingsPercent * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Summary */}
            <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-800">
              <h4 className="text-2xl font-bold text-white mb-6">Your ROI Summary</h4>
              
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monthly Savings</span>
                    <span className="text-3xl font-bold text-green-400">
                      ${monthlySavings.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Annual Savings</span>
                    <span className="text-3xl font-bold text-green-400">
                      ${annualSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">VibeLux Pays for Itself In</span>
                    <span className="text-2xl font-bold text-purple-400">
                      {paybackDays.toFixed(0)} days
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Net Monthly Profit</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      ${netMonthlySavings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <a 
                  href="/sign-up" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-purple-600 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                >
                  Start Saving Now
                  <ArrowRight className="w-5 h-5" />
                </a>
                <p className="text-sm text-gray-500 mt-3">
                  14-day free trial • Credit card required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-purple-500" />
            </div>
            <h5 className="font-semibold text-white mb-2">Smart Scheduling</h5>
            <p className="text-sm text-gray-400">
              AI optimizes lighting schedules based on your crops' needs
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
            <h5 className="font-semibold text-white mb-2">Zone Control</h5>
            <p className="text-sm text-gray-400">
              Only light areas that need it, when they need it
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
            <h5 className="font-semibold text-white mb-2">HVAC Sync</h5>
            <p className="text-sm text-gray-400">
              Coordinate lighting and HVAC to minimize heat load
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
            <h5 className="font-semibold text-white mb-2">Demand Response</h5>
            <p className="text-sm text-gray-400">
              Shift loads to avoid peak pricing automatically
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}