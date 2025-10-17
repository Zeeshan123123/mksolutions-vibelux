"use client"

import { useState, useEffect } from 'react'
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Leaf,
  BarChart3,
  Calendar,
  AlertCircle,
  Info,
  Target,
  Activity,
  Download
} from 'lucide-react'

interface EnergyMetric {
  timestamp: string
  kWh: number
  cost: number
  grams: number
  ppfd: number
  dli: number
}

interface CropCycle {
  id: string
  strain: string
  phase: string
  dayInPhase: number
  totalKWh: number
  totalCost: number
  projectedYield: number
  actualYield?: number
}

export function EnergyROITracker() {
  const [timeframe, setTimeframe] = useState<'realtime' | 'daily' | 'weekly' | 'cycle'>('realtime')
  const [selectedCycle, setSelectedCycle] = useState<string>('current')
  
  // Real-time metrics
  const [currentMetrics, setCurrentMetrics] = useState({
    instantKW: 142.5,
    dailyKWh: 3420,
    costPerKWh: 0.12,
    currentPPFD: 650,
    todaysDLI: 28.4,
    gramsHarvestedToday: 0,
    projectedGramsToday: 2150
  })

  // Calculate real-time cost per gram
  const realtimeCostPerGram = currentMetrics.gramsHarvestedToday > 0 
    ? (currentMetrics.dailyKWh * currentMetrics.costPerKWh) / currentMetrics.gramsHarvestedToday
    : (currentMetrics.dailyKWh * currentMetrics.costPerKWh) / currentMetrics.projectedGramsToday

  const costPerPound = realtimeCostPerGram * 453.592

  // Active crop cycles
  const cropCycles: CropCycle[] = [
    {
      id: 'current',
      strain: 'Blue Dream',
      phase: 'Flowering',
      dayInPhase: 42,
      totalKWh: 142800,
      totalCost: 17136,
      projectedYield: 24500,
      actualYield: 18200
    },
    {
      id: 'batch-2',
      strain: 'OG Kush',
      phase: 'Vegetative',
      dayInPhase: 18,
      totalKWh: 28400,
      totalCost: 3408,
      projectedYield: 22000
    }
  ]

  const currentCycle = cropCycles.find(c => c.id === selectedCycle) || cropCycles[0]

  // Historical data for charts
  const getEnergyData = () => {
    if (timeframe === 'realtime') {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        kWh: 140 + Math.random() * 20,
        cost: (140 + Math.random() * 20) * 0.12,
        efficiency: 0.8 + Math.random() * 0.2
      }))
    } else if (timeframe === 'daily') {
      return Array.from({ length: 7 }, (_, i) => ({
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        kWh: 3200 + Math.random() * 400,
        cost: (3200 + Math.random() * 400) * 0.12,
        efficiency: 0.82 + Math.random() * 0.15
      }))
    } else if (timeframe === 'weekly') {
      return Array.from({ length: 4 }, (_, i) => ({
        label: `Week ${i + 1}`,
        kWh: 22400 + Math.random() * 2800,
        cost: (22400 + Math.random() * 2800) * 0.12,
        efficiency: 0.83 + Math.random() * 0.14
      }))
    } else {
      return [
        { label: 'Clone', kWh: 8400, cost: 1008, efficiency: 0.95 },
        { label: 'Veg', kWh: 42000, cost: 5040, efficiency: 0.88 },
        { label: 'Flower', kWh: 92400, cost: 11088, efficiency: 0.85 }
      ]
    }
  }

  const energyData = getEnergyData()

  // PPFD efficiency calculation
  const ppfdEfficiency = currentMetrics.currentPPFD / (currentMetrics.instantKW * 1000 / 400) // μmol/J

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetrics(prev => ({
        ...prev,
        instantKW: 140 + Math.random() * 10,
        currentPPFD: 640 + Math.random() * 20,
        todaysDLI: Math.min(prev.todaysDLI + 0.1, 40)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Energy ROI + Cost Tracking</h2>
            <p className="text-sm text-gray-400 mt-1">
              Real-time energy efficiency and cost per gram analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="realtime">Real-Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="cycle">Full Cycle</option>
            </select>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Real-Time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Current Draw</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {currentMetrics.instantKW.toFixed(1)} kW
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ${(currentMetrics.instantKW * currentMetrics.costPerKWh).toFixed(2)}/hr
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Cost per Gram</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${realtimeCostPerGram.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ${costPerPound.toFixed(2)}/lb
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">PPFD Efficiency</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {ppfdEfficiency.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">μmol/J</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Today's DLI</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {currentMetrics.todaysDLI.toFixed(1)}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(currentMetrics.todaysDLI / 40) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Energy Usage Chart */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Energy Consumption {timeframe === 'realtime' ? 'Today' : `This ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`}
        </h3>
        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {energyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col gap-1">
                  <div 
                    className="w-full bg-yellow-500 rounded-t"
                    style={{ height: `${(data.kWh / Math.max(...energyData.map(d => d.kWh))) * 180}px` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 -rotate-45 origin-left whitespace-nowrap">
                  {data.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span className="text-sm text-gray-400">kWh Usage</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Total: {energyData.reduce((sum, d) => sum + d.kWh, 0).toFixed(0)} kWh 
            (${(energyData.reduce((sum, d) => sum + d.cost, 0)).toFixed(2)})
          </p>
        </div>
      </div>

      {/* Crop Cycle Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Selector */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Crop Cycle Energy Analysis</h3>
          <div className="space-y-3">
            {cropCycles.map((cycle) => {
              const costPerGram = cycle.actualYield 
                ? cycle.totalCost / cycle.actualYield
                : cycle.totalCost / (cycle.projectedYield * (cycle.dayInPhase / 56))
              
              return (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedCycle(cycle.id)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedCycle === cycle.id
                      ? 'bg-purple-600/20 border-purple-600'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{cycle.strain}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cycle.phase === 'Flowering' ? 'bg-purple-500/20 text-purple-400' :
                      cycle.phase === 'Vegetative' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {cycle.phase} - Day {cycle.dayInPhase}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Energy</span>
                      <p className="text-white">{(cycle.totalKWh / 1000).toFixed(1)} MWh</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Cost/g</span>
                      <p className="text-white">${costPerGram.toFixed(3)}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {currentCycle.strain} - Detailed Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Energy Consumed</span>
                <span className="text-sm font-medium text-white">
                  {(currentCycle.totalKWh / 1000).toFixed(2)} MWh
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Total Cost</span>
                <span className="text-sm font-medium text-white">
                  ${currentCycle.totalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Projected Yield</span>
                <span className="text-sm font-medium text-white">
                  {(currentCycle.projectedYield / 1000).toFixed(1)} kg
                </span>
              </div>
              {currentCycle.actualYield && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Actual Yield</span>
                  <span className="text-sm font-medium text-green-400">
                    {(currentCycle.actualYield / 1000).toFixed(1)} kg
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-white mb-3">Projected ROI</h4>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Cost per kg</span>
                  <span className="text-sm font-medium text-white">
                    ${(currentCycle.totalCost / (currentCycle.projectedYield / 1000)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Market price/kg</span>
                  <span className="text-sm font-medium text-white">$2,200</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-sm font-medium text-gray-400">Net margin</span>
                  <span className="text-sm font-bold text-green-400">
                    ${(2200 - (currentCycle.totalCost / (currentCycle.projectedYield / 1000))).toFixed(2)}/kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Alerts */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Energy Optimization Opportunities</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Peak Hour Usage Alert</p>
              <p className="text-sm text-gray-400 mt-1">
                32% of your lighting runs during peak rate hours (2-8 PM). Shifting to off-peak could save 
                $426/month without affecting DLI targets.
              </p>
            </div>
            <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors">
              Optimize
            </button>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Spectrum Efficiency</p>
              <p className="text-sm text-gray-400 mt-1">
                Your current spectrum could be optimized for late flower. Adjusting red:far-red ratio 
                could improve photon efficiency by 8%.
              </p>
            </div>
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}