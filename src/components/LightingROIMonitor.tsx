"use client"

import { useState, useEffect } from 'react'
import { 
  Sun,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Gauge,
  BarChart3,
  Settings,
  Info,
  Calendar,
  Download,
  AlertCircle
} from 'lucide-react'

interface SpectrumChannel {
  wavelength: string
  color: string
  percentage: number
  efficiency: number
  optimal: number
}

interface FixtureData {
  id: string
  name: string
  zone: string
  ppfd: number
  kWh: number
  ppfdPerWatt: number
  spectrumQuality: number
  degradation: number
  lastCalibrated: string
  status: 'optimal' | 'degrading' | 'drifting' | 'maintenance'
}

interface SpectrumRecipe {
  id: string
  name: string
  phase: string
  channels: SpectrumChannel[]
  expectedYieldUplift: number
  energySavings: number
}

export function LightingROIMonitor() {
  const [selectedFixture, setSelectedFixture] = useState<string>('fix-1')
  const [viewMode, setViewMode] = useState<'efficiency' | 'spectrum' | 'recommendations'>('efficiency')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  // Real-time PPFD per kWh
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    avgPPFD: 650,
    totalKW: 142.5,
    ppfdPerKWh: 4.56,
    spectrumEfficiency: 92,
    photonEfficiency: 2.8 // μmol/J
  })

  // Fixture inventory
  const fixtures: FixtureData[] = [
    {
      id: 'fix-1',
      name: 'LED Array A1-A4',
      zone: 'Flower Room A',
      ppfd: 680,
      kWh: 35.2,
      ppfdPerWatt: 2.85,
      spectrumQuality: 94,
      degradation: 3.2,
      lastCalibrated: '15 days ago',
      status: 'optimal'
    },
    {
      id: 'fix-2',
      name: 'LED Array B1-B4',
      zone: 'Flower Room B',
      ppfd: 625,
      kWh: 34.8,
      ppfdPerWatt: 2.65,
      spectrumQuality: 87,
      degradation: 8.5,
      lastCalibrated: '62 days ago',
      status: 'degrading'
    },
    {
      id: 'fix-3',
      name: 'Veg Lights V1-V6',
      zone: 'Vegetative Hall',
      ppfd: 420,
      kWh: 18.5,
      ppfdPerWatt: 3.35,
      spectrumQuality: 91,
      degradation: 2.1,
      lastCalibrated: '8 days ago',
      status: 'optimal'
    },
    {
      id: 'fix-4',
      name: 'Clone LEDs C1-C3',
      zone: 'Propagation',
      ppfd: 200,
      kWh: 5.2,
      ppfdPerWatt: 5.68,
      spectrumQuality: 78,
      degradation: 4.5,
      lastCalibrated: '45 days ago',
      status: 'drifting'
    }
  ]

  const currentFixture = fixtures.find(f => f.id === selectedFixture) || fixtures[0]

  // Current spectrum configuration
  const currentSpectrum: SpectrumChannel[] = [
    { wavelength: '450nm', color: 'Blue', percentage: 18, efficiency: 92, optimal: 20 },
    { wavelength: '470nm', color: 'Royal Blue', percentage: 12, efficiency: 89, optimal: 12 },
    { wavelength: '525nm', color: 'Green', percentage: 8, efficiency: 75, optimal: 6 },
    { wavelength: '630nm', color: 'Red', percentage: 35, efficiency: 94, optimal: 35 },
    { wavelength: '660nm', color: 'Deep Red', percentage: 22, efficiency: 96, optimal: 23 },
    { wavelength: '730nm', color: 'Far Red', percentage: 5, efficiency: 88, optimal: 4 }
  ]

  // Recommended spectrum recipes
  const spectrumRecipes: SpectrumRecipe[] = [
    {
      id: 'late-flower-boost',
      name: 'Late Flower Boost',
      phase: 'Week 6-8 Flower',
      channels: [
        { wavelength: '450nm', color: 'Blue', percentage: 15, efficiency: 92, optimal: 15 },
        { wavelength: '470nm', color: 'Royal Blue', percentage: 10, efficiency: 89, optimal: 10 },
        { wavelength: '525nm', color: 'Green', percentage: 5, efficiency: 75, optimal: 5 },
        { wavelength: '630nm', color: 'Red', percentage: 38, efficiency: 94, optimal: 38 },
        { wavelength: '660nm', color: 'Deep Red', percentage: 26, efficiency: 96, optimal: 26 },
        { wavelength: '730nm', color: 'Far Red', percentage: 6, efficiency: 88, optimal: 6 }
      ],
      expectedYieldUplift: 8.5,
      energySavings: 12
    },
    {
      id: 'veg-growth',
      name: 'Vegetative Growth',
      phase: 'Vegetative',
      channels: [
        { wavelength: '450nm', color: 'Blue', percentage: 25, efficiency: 92, optimal: 25 },
        { wavelength: '470nm', color: 'Royal Blue', percentage: 15, efficiency: 89, optimal: 15 },
        { wavelength: '525nm', color: 'Green', percentage: 10, efficiency: 75, optimal: 10 },
        { wavelength: '630nm', color: 'Red', percentage: 30, efficiency: 94, optimal: 30 },
        { wavelength: '660nm', color: 'Deep Red', percentage: 18, efficiency: 96, optimal: 18 },
        { wavelength: '730nm', color: 'Far Red', percentage: 2, efficiency: 88, optimal: 2 }
      ],
      expectedYieldUplift: 5.2,
      energySavings: 8
    }
  ]

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        avgPPFD: 640 + Math.random() * 20,
        totalKW: 140 + Math.random() * 5,
        ppfdPerKWh: 4.4 + Math.random() * 0.3,
        spectrumEfficiency: 90 + Math.random() * 5,
        photonEfficiency: 2.7 + Math.random() * 0.2
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
            <h2 className="text-xl font-semibold text-white">Tunable Lighting ROI + Photon Efficiency</h2>
            <p className="text-sm text-gray-400 mt-1">
              Real-time spectrum optimization and fixture performance monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Calibrate
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Avg PPFD</span>
            </div>
            <p className="text-2xl font-bold text-white">{realtimeMetrics.avgPPFD.toFixed(0)}</p>
            <p className="text-xs text-gray-500">μmol/m²/s</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">PPFD/kWh</span>
            </div>
            <p className="text-2xl font-bold text-white">{realtimeMetrics.ppfdPerKWh.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">+3.2%</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Photon Eff.</span>
            </div>
            <p className="text-2xl font-bold text-white">{realtimeMetrics.photonEfficiency.toFixed(1)}</p>
            <p className="text-xs text-gray-500">μmol/J</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Spectrum Eff.</span>
            </div>
            <p className="text-2xl font-bold text-white">{realtimeMetrics.spectrumEfficiency.toFixed(1)}%</p>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${realtimeMetrics.spectrumEfficiency}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400">Total Load</span>
            </div>
            <p className="text-2xl font-bold text-white">{realtimeMetrics.totalKW.toFixed(1)}</p>
            <p className="text-xs text-gray-500">kW</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('efficiency')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'efficiency'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Fixture Efficiency
          </button>
          <button
            onClick={() => setViewMode('spectrum')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'spectrum'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Spectrum Analysis
          </button>
          <button
            onClick={() => setViewMode('recommendations')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'recommendations'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            AI Recommendations
          </button>
        </div>

        {/* Fixture Efficiency View */}
        {viewMode === 'efficiency' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Fixture Performance Monitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixtures.map((fixture) => (
                <button
                  key={fixture.id}
                  onClick={() => setSelectedFixture(fixture.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedFixture === fixture.id
                      ? 'bg-purple-600/20 border-purple-600'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white text-left">{fixture.name}</h4>
                      <p className="text-sm text-gray-400 text-left">{fixture.zone}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      fixture.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                      fixture.status === 'degrading' ? 'bg-yellow-500/20 text-yellow-400' :
                      fixture.status === 'drifting' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {fixture.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-left">
                      <span className="text-gray-400">PPFD</span>
                      <p className="text-white font-medium">{fixture.ppfd}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-400">μmol/W</span>
                      <p className="text-white font-medium">{fixture.ppfdPerWatt.toFixed(2)}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-400">Degradation</span>
                      <p className={`font-medium ${
                        fixture.degradation < 5 ? 'text-green-400' :
                        fixture.degradation < 10 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {fixture.degradation}%
                      </p>
                    </div>
                  </div>

                  {fixture.status !== 'optimal' && (
                    <div className={`mt-3 p-2 rounded flex items-center gap-2 ${
                      fixture.status === 'degrading' ? 'bg-yellow-500/10' :
                      fixture.status === 'drifting' ? 'bg-orange-500/10' :
                      'bg-red-500/10'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${
                        fixture.status === 'degrading' ? 'text-yellow-400' :
                        fixture.status === 'drifting' ? 'text-orange-400' :
                        'text-red-400'
                      }`} />
                      <span className="text-xs text-gray-300">
                        {fixture.status === 'degrading' ? 'Schedule maintenance' :
                         fixture.status === 'drifting' ? 'Spectrum calibration needed' :
                         'Immediate attention required'}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Fixture Details */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-3">{currentFixture.name} - Detailed Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Last Calibrated</span>
                  <p className="text-white">{currentFixture.lastCalibrated}</p>
                </div>
                <div>
                  <span className="text-gray-400">Energy Usage</span>
                  <p className="text-white">{currentFixture.kWh} kWh</p>
                </div>
                <div>
                  <span className="text-gray-400">Spectrum Quality</span>
                  <p className="text-white">{currentFixture.spectrumQuality}%</p>
                </div>
                <div>
                  <span className="text-gray-400">Est. Lifespan Remaining</span>
                  <p className="text-white">{100 - currentFixture.degradation * 2}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spectrum Analysis View */}
        {viewMode === 'spectrum' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Current Spectrum Configuration</h3>
            <div className="space-y-3">
              {currentSpectrum.map((channel) => (
                <div key={channel.wavelength} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ 
                          backgroundColor: 
                            channel.color === 'Blue' ? '#3B82F6' :
                            channel.color === 'Royal Blue' ? '#2563EB' :
                            channel.color === 'Green' ? '#10B981' :
                            channel.color === 'Red' ? '#EF4444' :
                            channel.color === 'Deep Red' ? '#DC2626' :
                            '#F59E0B'
                        }}
                      />
                      <div>
                        <p className="font-medium text-white">{channel.color} - {channel.wavelength}</p>
                        <p className="text-xs text-gray-400">Efficiency: {channel.efficiency}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{channel.percentage}%</p>
                      <p className="text-xs text-gray-400">Optimal: {channel.optimal}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${channel.percentage}%`,
                          backgroundColor: 
                            channel.color === 'Blue' ? '#3B82F6' :
                            channel.color === 'Royal Blue' ? '#2563EB' :
                            channel.color === 'Green' ? '#10B981' :
                            channel.color === 'Red' ? '#EF4444' :
                            channel.color === 'Deep Red' ? '#DC2626' :
                            '#F59E0B'
                        }}
                      />
                    </div>
                    {Math.abs(channel.percentage - channel.optimal) > 2 && (
                      <Info className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Spectrum Optimization Available</span>
              </div>
              <p className="text-sm text-gray-300">
                Your current spectrum is 94% optimal. Adjusting blue (-2%) and far-red (+1%) 
                could improve photon efficiency by 6% and reduce energy consumption by 8%.
              </p>
            </div>
          </div>
        )}

        {/* AI Recommendations View */}
        {viewMode === 'recommendations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Spectrum Recommendations</h3>
            <div className="space-y-4">
              {spectrumRecipes.map((recipe) => (
                <div 
                  key={recipe.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{recipe.name}</h4>
                      <p className="text-sm text-gray-400">{recipe.phase}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-400">
                        +{recipe.expectedYieldUplift}% yield
                      </p>
                      <p className="text-xs text-gray-400">
                        -{recipe.energySavings}% energy
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {recipe.channels.slice(0, 3).map((channel) => (
                      <div key={channel.wavelength} className="text-xs">
                        <span className="text-gray-400">{channel.color}</span>
                        <p className="text-white font-medium">{channel.percentage}%</p>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm">
                    Apply Recipe
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">Time-Based Optimization Available</p>
                  <p className="text-sm text-gray-300">
                    Based on your crop's current phase (Week 6 Flower), implementing a progressive 
                    spectrum shift over the next 14 days could increase terpene production by 12% 
                    while maintaining current yield projections.
                  </p>
                  <button className="mt-2 text-sm text-yellow-400 hover:text-yellow-300 font-medium">
                    View Schedule →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projected ROI */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Projected Annual ROI from Optimization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Energy Savings</h4>
            <p className="text-2xl font-bold text-green-400">$18,420</p>
            <p className="text-xs text-gray-500 mt-1">12% reduction in kWh</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Yield Increase</h4>
            <p className="text-2xl font-bold text-purple-400">+8.5%</p>
            <p className="text-xs text-gray-500 mt-1">~2.1 kg/month additional</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Maintenance Savings</h4>
            <p className="text-2xl font-bold text-blue-400">$4,200</p>
            <p className="text-xs text-gray-500 mt-1">Extended fixture lifespan</p>
          </div>
        </div>
      </div>
    </div>
  )
}