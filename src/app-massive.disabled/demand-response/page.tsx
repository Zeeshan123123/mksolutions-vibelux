'use client'

import { useState } from 'react'
import { DemandResponseOptimizer } from '@/components/DemandResponseOptimizer'
import { 
  Zap,
  DollarSign,
  Building2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  ChevronRight,
  Battery,
  Sun,
  Activity,
  Users,
  Calculator
} from 'lucide-react'

export default function DemandResponsePage() {
  const [selectedUtility, setSelectedUtility] = useState<'SCE' | 'PGE' | 'SDGE'>('SCE')
  const [facilitySize, setFacilitySize] = useState(2000) // kW
  
  // Utility rate information
  const utilityRates = {
    SCE: {
      peak: 0.45,
      offPeak: 0.12,
      superOffPeak: 0.08,
      demandCharge: 18.50, // $/kW
      peakHours: '4PM - 9PM'
    },
    PGE: {
      peak: 0.42,
      offPeak: 0.14,
      superOffPeak: 0.10,
      demandCharge: 22.00,
      peakHours: '4PM - 8PM'
    },
    SDGE: {
      peak: 0.48,
      offPeak: 0.15,
      superOffPeak: 0.09,
      demandCharge: 20.50,
      peakHours: '4PM - 9PM'
    }
  }
  
  const currentRates = utilityRates[selectedUtility]
  
  // Quick facility presets
  const facilityPresets = [
    { name: 'Small Indoor (500kW)', size: 500, lighting: 300, hvac: 150 },
    { name: 'Medium Indoor (1MW)', size: 1000, lighting: 600, hvac: 300 },
    { name: 'Large Indoor (2MW)', size: 2000, lighting: 1240, hvac: 600 },
    { name: 'XL Facility (5MW)', size: 5000, lighting: 3100, hvac: 1500 }
  ]
  
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-600/20 rounded-xl">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Demand Response Optimization
              </h1>
              <p className="text-gray-400 mt-1">
                Maximize revenue through grid participation and peak avoidance
              </p>
            </div>
          </div>
          
          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-800/50">
            <h2 className="text-lg font-semibold text-white mb-4">
              Why Demand Response for Cannabis Cultivation?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">$50K-100K+ Annual Revenue</p>
                  <p className="text-xs text-gray-300 mt-1">
                    From DR programs and peak avoidance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Avoid Peak Charges</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Save $12-18/kW during critical events
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Automated Response</p>
                  <p className="text-xs text-gray-300 mt-1">
                    OpenADR integration for hands-free operation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Grid Resilience</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Support grid stability and earn incentives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Utility Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Utility Provider
              </h3>
              <div className="space-y-2">
                {(['SCE', 'PGE', 'SDGE'] as const).map((utility) => (
                  <button
                    key={utility}
                    onClick={() => setSelectedUtility(utility)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedUtility === utility
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {utility === 'SCE' ? 'Southern California Edison' :
                           utility === 'PGE' ? 'Pacific Gas & Electric' :
                           'San Diego Gas & Electric'}
                        </p>
                        <p className="text-xs opacity-80 mt-0.5">
                          Peak: {utilityRates[utility].peakHours}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Facility Size */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Facility Configuration
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Total Connected Load (kW)
                </label>
                <input
                  type="number"
                  value={facilitySize}
                  onChange={(e) => setFacilitySize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  step="100"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">Quick Presets:</p>
                {facilityPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setFacilitySize(preset.size)}
                    className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 text-left transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Current Costs */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Current Energy Costs
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Peak Rate</span>
                  <span className="text-lg font-semibold text-white">
                    ${currentRates.peak}/kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Off-Peak Rate</span>
                  <span className="text-lg font-semibold text-white">
                    ${currentRates.offPeak}/kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Demand Charge</span>
                  <span className="text-lg font-semibold text-white">
                    ${currentRates.demandCharge}/kW
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Monthly Peak Demand Cost</span>
                    <span className="text-xl font-bold text-red-400">
                      ${(facilitySize * currentRates.demandCharge).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Optimization Results */}
          <div className="lg:col-span-2">
            <DemandResponseOptimizer
              facilityProfile={{
                peakDemand: facilitySize,
                averageLoad: facilitySize * 0.8,
                rateSchedule: selectedUtility === 'SCE' ? 'TOU-PA-3' : 'E-20'
              }}
            />
          </div>
        </div>
        
        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              DR Aggregators
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Partner with aggregators to simplify enrollment:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">Leap Energy</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">CPower</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">Enel X</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">Voltus</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Battery className="w-5 h-5 text-green-400" />
              Technology Stack
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Required equipment for full automation:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">OpenADR 2.0b Client</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">Smart Lighting Controls</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">VFD on HVAC/Pumps</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span className="text-gray-300">Energy Management System</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-yellow-400" />
              ROI Calculator
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Implementation Cost</span>
                <span className="text-white">${(facilitySize * 15).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Annual Revenue</span>
                <span className="text-green-400">${(facilitySize * 40).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-300">Simple Payback</span>
                  <span className="text-lg font-bold text-purple-400">4.5 months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Self-Service Assessment */}
        <div className="mt-8 space-y-6">
          {/* Is DR Right for You? */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Calculator className="w-7 h-7 text-green-400" />
              Is Demand Response Right for Your Facility?
            </h2>
            <p className="text-gray-300 mb-6">
              Use this self-assessment to determine if your facility is a good candidate for demand response programs:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Qualification Checklist */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">✅ Qualification Checklist</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Peak demand ≥ 200kW</p>
                      <p className="text-xs text-gray-400">Your facility: {facilitySize}kW {facilitySize >= 200 ? '✅ Qualified' : '❌ Too small'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Controllable loads available</p>
                      <p className="text-xs text-gray-400">Lighting, HVAC, dehumidification systems</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Can reduce 10-20% of peak load</p>
                      <p className="text-xs text-gray-400">Target reduction: {Math.round(facilitySize * 0.15)}kW for 2-4 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Automation capabilities</p>
                      <p className="text-xs text-gray-400">BMS or ability to install DR controls</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Revenue Potential */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">💰 Your Revenue Potential</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/30 border border-green-800/50 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Capacity Payments</h4>
                    <p className="text-2xl font-bold text-white">${(facilitySize * 25).toLocaleString()}/year</p>
                    <p className="text-xs text-gray-300">Based on ${facilitySize >= 1000 ? '25' : '20'}/kW annual capacity</p>
                  </div>
                  
                  <div className="p-4 bg-blue-900/30 border border-blue-800/50 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">Event Payments</h4>
                    <p className="text-2xl font-bold text-white">${(facilitySize * 15).toLocaleString()}/year</p>
                    <p className="text-xs text-gray-300">~20 events/year at $0.75/kWh reduced</p>
                  </div>
                  
                  <div className="p-4 bg-purple-900/30 border border-purple-800/50 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">Peak Avoidance</h4>
                    <p className="text-2xl font-bold text-white">${(facilitySize * currentRates.demandCharge * 0.3).toLocaleString()}/month</p>
                    <p className="text-xs text-gray-300">30% reduction in peak demand charges</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-300">Total Annual Value:</span>
                      <span className="text-3xl font-bold text-green-400">
                        ${((facilitySize * 40) + (facilitySize * currentRates.demandCharge * 3.6)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Implementation Roadmap */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock className="w-7 h-7 text-blue-400" />
              Implementation Roadmap
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Assessment & Enrollment</h3>
                <p className="text-sm text-gray-400">
                  Analyze your load profile, select programs, and complete utility enrollment
                </p>
                <p className="text-xs text-blue-400 mt-2">2-4 weeks</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Equipment Installation</h3>
                <p className="text-sm text-gray-400">
                  Install DR controls, communication equipment, and integrate with existing systems
                </p>
                <p className="text-xs text-purple-400 mt-2">1-2 weeks</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Testing & Commissioning</h3>
                <p className="text-sm text-gray-400">
                  Test response capabilities, tune control strategies, and verify performance
                </p>
                <p className="text-xs text-green-400 mt-2">1 week</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">4</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Live Operations</h3>
                <p className="text-sm text-gray-400">
                  Begin earning revenue from DR events while maintaining growing conditions
                </p>
                <p className="text-xs text-yellow-400 mt-2">Ongoing</p>
              </div>
            </div>
          </div>
          
          {/* FAQ */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Will DR events affect my plants?</h3>
                  <p className="text-sm text-gray-400">
                    No. Our control strategies prioritize plant health by reducing non-critical loads first (lighting dimming, HVAC optimization) while maintaining environmental conditions within acceptable ranges.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">How often are DR events called?</h3>
                  <p className="text-sm text-gray-400">
                    Typically 15-25 events per year, mostly during summer afternoons (4-8PM). Events are predictable and you receive 1-4 hour advance notice.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">What if I can't participate in an event?</h3>
                  <p className="text-sm text-gray-400">
                    Most programs allow opt-outs for operational needs. You simply won't receive payment for that event, but there's no penalty.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">What's the upfront investment?</h3>
                  <p className="text-sm text-gray-400">
                    Typically $10-20/kW for controls and integration. Many utilities offer rebates that cover 50-100% of costs. Simple payback is usually 3-6 months.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Can I work with an aggregator?</h3>
                  <p className="text-sm text-gray-400">
                    Yes! Aggregators like CPower, Enel X, and Leap handle enrollment, payments, and compliance, making participation much simpler.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Do I need new equipment?</h3>
                  <p className="text-sm text-gray-400">
                    Most facilities can participate with existing systems. We add smart controls and communication equipment that integrates with your current infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-800/50">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Ready to Start Earning Revenue?
            </h2>
            <p className="text-gray-300 mb-6 text-center max-w-3xl mx-auto">
              Based on your facility size ({facilitySize}kW), you could earn <strong>${((facilitySize * 40) + (facilitySize * currentRates.demandCharge * 3.6)).toLocaleString()}/year</strong> from demand response programs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                Get Implementation Quote
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:blake@vibelux.ai?subject=Demand Response Assessment&body=Hi Blake,%0D%0A%0D%0AI\'m interested in demand response for my facility:%0D%0A%0D%0AFacility Size: ' + facilitySize + 'kW%0D%0AUtility: ' + selectedUtility + '%0D%0A%0D%0APlease provide more information about implementation and next steps.'}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Schedule Expert Consultation
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-400 mt-4">
              Still have questions? Email <span className="text-purple-400">blake@vibelux.ai</span> for personalized guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}