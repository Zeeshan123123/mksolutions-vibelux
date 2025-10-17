"use client"

import { useState, useEffect } from 'react'
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Thermometer,
  Droplets,
  BarChart3,
  Calendar,
  Download,
  Info
} from 'lucide-react'

interface HealthMetric {
  category: string
  score: number
  weight: number
  trend: 'up' | 'down' | 'stable'
  details: string
}

interface HistoricalData {
  date: string
  score: number
  climate: number
  labor: number
  energy: number
  anomalies: number
}

export function FacilityHealthScore() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'season'>('week')
  const [showDetails, setShowDetails] = useState(false)

  // Calculate individual metric scores
  const metrics: HealthMetric[] = [
    {
      category: 'Climate Stability',
      score: 92,
      weight: 0.35,
      trend: 'up',
      details: 'VPD variance: 0.1 kPa, Temp stability: 98.2%'
    },
    {
      category: 'Labor Efficiency',
      score: 87,
      weight: 0.25,
      trend: 'stable',
      details: 'Tasks/hour: 4.2, Completion rate: 94%'
    },
    {
      category: 'Energy Efficiency',
      score: 78,
      weight: 0.25,
      trend: 'down',
      details: 'kWh/kg: 45.2 (target: 42), PPFD efficiency: 82%'
    },
    {
      category: 'Anomaly Rate',
      score: 95,
      weight: 0.15,
      trend: 'up',
      details: '2 minor events this week (down from 5)'
    }
  ]

  // Calculate composite score
  const compositeScore = Math.round(
    metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0)
  )

  // Historical data for trending
  const getHistoricalData = (): HistoricalData[] => {
    const baseData = {
      week: [
        { date: 'Mon', score: 84, climate: 88, labor: 85, energy: 76, anomalies: 90 },
        { date: 'Tue', score: 85, climate: 90, labor: 84, energy: 77, anomalies: 92 },
        { date: 'Wed', score: 83, climate: 87, labor: 86, energy: 75, anomalies: 88 },
        { date: 'Thu', score: 86, climate: 91, labor: 87, energy: 78, anomalies: 94 },
        { date: 'Fri', score: 87, climate: 92, labor: 87, energy: 78, anomalies: 95 },
        { date: 'Sat', score: 88, climate: 92, labor: 87, energy: 78, anomalies: 95 },
        { date: 'Today', score: compositeScore, climate: 92, labor: 87, energy: 78, anomalies: 95 }
      ],
      month: [
        { date: 'Week 1', score: 82, climate: 85, labor: 83, energy: 75, anomalies: 88 },
        { date: 'Week 2', score: 84, climate: 88, labor: 84, energy: 76, anomalies: 90 },
        { date: 'Week 3', score: 85, climate: 89, labor: 86, energy: 77, anomalies: 92 },
        { date: 'Week 4', score: 87, climate: 91, labor: 87, energy: 78, anomalies: 94 },
        { date: 'This Week', score: compositeScore, climate: 92, labor: 87, energy: 78, anomalies: 95 }
      ],
      season: [
        { date: 'Oct', score: 80, climate: 83, labor: 81, energy: 73, anomalies: 85 },
        { date: 'Nov', score: 82, climate: 85, labor: 83, energy: 75, anomalies: 88 },
        { date: 'Dec', score: 84, climate: 88, labor: 85, energy: 76, anomalies: 90 },
        { date: 'Jan', score: compositeScore, climate: 92, labor: 87, energy: 78, anomalies: 95 }
      ]
    }
    return baseData[timeRange]
  }

  const historicalData = getHistoricalData()

  // Determine health status
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (score >= 80) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' }
    if (score >= 70) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { label: 'Needs Attention', color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  const healthStatus = getHealthStatus(compositeScore)

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Facility Health Score</h2>
            <p className="text-sm text-gray-400 mt-1">
              Real-time composite health indicator
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'season')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="season">This Season</option>
            </select>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${compositeScore * 3.52} 352`}
                    className={healthStatus.color}
                  />
                </svg>
                <div className="absolute">
                  <p className="text-4xl font-bold text-white">{compositeScore}</p>
                  <p className="text-xs text-gray-400">out of 100</p>
                </div>
              </div>
              <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full ${healthStatus.bg}`}>
                <Activity className={`w-4 h-4 ${healthStatus.color}`} />
                <span className={`text-sm font-medium ${healthStatus.color}`}>
                  {healthStatus.label}
                </span>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 text-sm text-gray-400 hover:text-white flex items-center gap-1 mx-auto transition-colors"
              >
                <Info className="w-4 h-4" />
                {showDetails ? 'Hide' : 'Show'} calculation details
              </button>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 h-full">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Score Trend</h3>
              <div className="relative h-48">
                {/* Simple line chart visualization */}
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {historicalData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-purple-600 rounded-t"
                        style={{ 
                          height: `${(data.score / 100) * 100}%`,
                          opacity: index === historicalData.length - 1 ? 1 : 0.6
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2 -rotate-45 origin-left whitespace-nowrap">
                        {data.date}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Baseline */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.category} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {metric.category === 'Climate Stability' && <Thermometer className="w-5 h-5 text-blue-400" />}
                {metric.category === 'Labor Efficiency' && <Users className="w-5 h-5 text-purple-400" />}
                {metric.category === 'Energy Efficiency' && <Zap className="w-5 h-5 text-yellow-400" />}
                {metric.category === 'Anomaly Rate' && <AlertCircle className="w-5 h-5 text-green-400" />}
                <h4 className="font-medium text-white text-sm">{metric.category}</h4>
              </div>
              {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
              {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              {metric.trend === 'stable' && <BarChart3 className="w-4 h-4 text-gray-400" />}
            </div>
            <p className="text-2xl font-bold text-white mb-1">{metric.score}</p>
            <p className="text-xs text-gray-500">{metric.details}</p>
            {showDetails && (
              <p className="text-xs text-gray-600 mt-2">Weight: {(metric.weight * 100).toFixed(0)}%</p>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Optimize Energy Usage</p>
              <p className="text-sm text-gray-400 mt-1">
                Your kWh/kg is 7.6% above target. Consider shifting 30% of lighting load to off-peak hours 
                to improve your energy efficiency score by an estimated 8 points.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Climate Control Excellence</p>
              <p className="text-sm text-gray-400 mt-1">
                Your climate stability is in the top 10% of VibeLux facilities. Maintain current 
                VPD control strategies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Performance */}
      {showDetails && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Detailed Metrics History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 text-gray-400 font-medium">Period</th>
                  <th className="text-center py-2 text-gray-400 font-medium">Overall</th>
                  <th className="text-center py-2 text-gray-400 font-medium">Climate</th>
                  <th className="text-center py-2 text-gray-400 font-medium">Labor</th>
                  <th className="text-center py-2 text-gray-400 font-medium">Energy</th>
                  <th className="text-center py-2 text-gray-400 font-medium">Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-800/50">
                    <td className="py-2 text-white">{data.date}</td>
                    <td className="text-center py-2">
                      <span className={`font-medium ${getHealthStatus(data.score).color}`}>
                        {data.score}
                      </span>
                    </td>
                    <td className="text-center py-2 text-gray-300">{data.climate}</td>
                    <td className="text-center py-2 text-gray-300">{data.labor}</td>
                    <td className="text-center py-2 text-gray-300">{data.energy}</td>
                    <td className="text-center py-2 text-gray-300">{data.anomalies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}