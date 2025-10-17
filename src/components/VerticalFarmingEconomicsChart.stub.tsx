'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Calculator,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  Building,
  Layers,
  Zap,
  Droplets,
  Users,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Settings,
  Maximize
} from 'lucide-react'
import { EnhancedChartRenderer } from './EnhancedChartRenderer'

interface EconomicsData {
  month: string
  revenue: number
  costs: number
  profit: number
  margin: number
  yieldKg: number
  pricePerKg: number
}

interface CostBreakdown {
  category: string
  amount: number
  percentage: number
  color: string
  description: string
}

interface ROIProjection {
  year: number
  investment: number
  revenue: number
  operatingCosts: number
  profit: number
  cumulativeProfit: number
  roi: number
}

export default function VerticalFarmingEconomicsChart(props: any) {
  const [mounted, setMounted] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'monthly' | 'yearly' | 'projection'>('monthly')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'costs' | 'profit' | 'roi'>('profit')
  const [showBreakdown, setShowBreakdown] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock economic data
  const monthlyData: EconomicsData[] = [
    { month: 'Jan', revenue: 45000, costs: 32000, profit: 13000, margin: 28.9, yieldKg: 1800, pricePerKg: 25 },
    { month: 'Feb', revenue: 48000, costs: 33500, profit: 14500, margin: 30.2, yieldKg: 1900, pricePerKg: 25.3 },
    { month: 'Mar', revenue: 52000, costs: 35000, profit: 17000, margin: 32.7, yieldKg: 2050, pricePerKg: 25.4 },
    { month: 'Apr', revenue: 55000, costs: 36200, profit: 18800, margin: 34.2, yieldKg: 2150, pricePerKg: 25.6 },
    { month: 'May', revenue: 58000, costs: 37500, profit: 20500, margin: 35.3, yieldKg: 2250, pricePerKg: 25.8 },
    { month: 'Jun', revenue: 61000, costs: 38800, profit: 22200, margin: 36.4, yieldKg: 2350, pricePerKg: 26.0 },
    { month: 'Jul', revenue: 64000, costs: 40000, profit: 24000, margin: 37.5, yieldKg: 2450, pricePerKg: 26.1 },
    { month: 'Aug', revenue: 67000, costs: 41200, profit: 25800, margin: 38.5, yieldKg: 2550, pricePerKg: 26.3 },
    { month: 'Sep', revenue: 70000, costs: 42500, profit: 27500, margin: 39.3, yieldKg: 2650, pricePerKg: 26.4 },
    { month: 'Oct', revenue: 73000, costs: 43800, profit: 29200, margin: 40.0, yieldKg: 2750, pricePerKg: 26.5 },
    { month: 'Nov', revenue: 76000, costs: 45000, profit: 31000, margin: 40.8, yieldKg: 2850, pricePerKg: 26.7 },
    { month: 'Dec', revenue: 79000, costs: 46200, profit: 32800, margin: 41.5, yieldKg: 2950, pricePerKg: 26.8 }
  ]

  const costBreakdown: CostBreakdown[] = [
    { category: 'Energy', amount: 18500, percentage: 42, color: '#EF4444', description: 'Lighting, HVAC, equipment power' },
    { category: 'Labor', amount: 12000, percentage: 27, color: '#3B82F6', description: 'Operators, technicians, management' },
    { category: 'Seeds/Materials', amount: 6500, percentage: 15, color: '#10B981', description: 'Seeds, nutrients, growing media' },
    { category: 'Facility', amount: 4200, percentage: 10, color: '#F59E0B', description: 'Rent, insurance, utilities' },
    { category: 'Equipment', amount: 2800, percentage: 6, color: '#8B5CF6', description: 'Maintenance, depreciation, repairs' }
  ]

  const roiProjections: ROIProjection[] = [
    { year: 0, investment: 2500000, revenue: 0, operatingCosts: 0, profit: -2500000, cumulativeProfit: -2500000, roi: -100 },
    { year: 1, investment: 0, revenue: 600000, operatingCosts: 420000, profit: 180000, cumulativeProfit: -2320000, roi: -92.8 },
    { year: 2, investment: 0, revenue: 720000, operatingCosts: 450000, profit: 270000, cumulativeProfit: -2050000, roi: -82.0 },
    { year: 3, investment: 0, revenue: 864000, operatingCosts: 480000, profit: 384000, cumulativeProfit: -1666000, roi: -66.6 },
    { year: 4, investment: 0, revenue: 1037000, operatingCosts: 510000, profit: 527000, cumulativeProfit: -1139000, roi: -45.6 },
    { year: 5, investment: 0, revenue: 1244000, operatingCosts: 540000, profit: 704000, cumulativeProfit: -435000, roi: -17.4 },
    { year: 6, investment: 0, revenue: 1493000, operatingCosts: 570000, profit: 923000, cumulativeProfit: 488000, roi: 19.5 },
    { year: 7, investment: 0, revenue: 1792000, operatingCosts: 600000, profit: 1192000, cumulativeProfit: 1680000, roi: 67.2 }
  ]

  const handleExport = () => {
    const data = selectedTimeframe === 'monthly' ? monthlyData : roiProjections
    const csvContent = selectedTimeframe === 'monthly' 
      ? 'Month,Revenue,Costs,Profit,Margin,Yield(kg),Price/kg\n' + 
        monthlyData.map(row => `${row.month},${row.revenue},${row.costs},${row.profit},${row.margin},${row.yieldKg},${row.pricePerKg}`).join('\n')
      : 'Year,Investment,Revenue,Operating Costs,Profit,Cumulative Profit,ROI\n' +
        roiProjections.map(row => `${row.year},${row.investment},${row.revenue},${row.operatingCosts},${row.profit},${row.cumulativeProfit},${row.roi}`).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vertical-farming-economics-${selectedTimeframe}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const calculateBreakevenPoint = (): number => {
    return roiProjections.findIndex(p => p.cumulativeProfit > 0)
  }

  const getCurrentYearMetrics = () => {
    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0)
    const totalCosts = monthlyData.reduce((sum, m) => sum + m.costs, 0)
    const totalProfit = totalRevenue - totalCosts
    const avgMargin = monthlyData.reduce((sum, m) => sum + m.margin, 0) / monthlyData.length
    const totalYield = monthlyData.reduce((sum, m) => sum + m.yieldKg, 0)
    
    return {
      revenue: totalRevenue,
      costs: totalCosts,
      profit: totalProfit,
      margin: avgMargin,
      yield: totalYield,
      avgPrice: totalRevenue / totalYield
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'revenue': return <TrendingUp className="w-4 h-4" />
      case 'costs': return <TrendingDown className="w-4 h-4" />
      case 'profit': return <DollarSign className="w-4 h-4" />
      case 'roi': return <Target className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  if (!mounted) {
    return (
      <div className="p-8 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const currentMetrics = getCurrentYearMetrics()
  const breakevenYear = calculateBreakevenPoint()

  const chartData = selectedTimeframe === 'monthly' ? 
    monthlyData.map(item => ({
      name: item.month,
      revenue: item.revenue / 1000, // Convert to thousands
      costs: item.costs / 1000,
      profit: item.profit / 1000,
      margin: item.margin,
      yield: item.yieldKg
    })) :
    roiProjections.slice(1).map(item => ({
      name: `Year ${item.year}`,
      revenue: item.revenue / 1000,
      costs: item.operatingCosts / 1000,
      profit: item.profit / 1000,
      cumulativeProfit: item.cumulativeProfit / 1000,
      roi: item.roi
    }))

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-green-600" />
              Vertical Farming Economics
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Comprehensive financial analysis and ROI projections for vertical farming operations
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="monthly">Monthly View</option>
              <option value="yearly">Yearly View</option>
              <option value="projection">ROI Projection</option>
            </select>
            
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="profit">Profit Analysis</option>
              <option value="revenue">Revenue Trends</option>
              <option value="costs">Cost Analysis</option>
              <option value="roi">ROI Performance</option>
            </select>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <span className="text-xl font-bold">+${currentMetrics.profit.toLocaleString()}</span>
            </div>
            <div className="text-xl font-bold mb-1">Annual Profit</div>
            <div className="text-green-100 text-sm">{currentMetrics.margin.toFixed(1)}% margin</div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-xl font-bold">${currentMetrics.revenue.toLocaleString()}</span>
            </div>
            <div className="text-xl font-bold mb-1">Annual Revenue</div>
            <div className="text-blue-100 text-sm">{currentMetrics.yield.toLocaleString()}kg produced</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8" />
              <span className="text-xl font-bold">{breakevenYear} yrs</span>
            </div>
            <div className="text-xl font-bold mb-1">Breakeven Point</div>
            <div className="text-purple-100 text-sm">ROI positive by year {breakevenYear}</div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calculator className="w-8 h-8" />
              <span className="text-xl font-bold">${currentMetrics.avgPrice.toFixed(2)}</span>
            </div>
            <div className="text-xl font-bold mb-1">Avg Price/kg</div>
            <div className="text-orange-100 text-sm">Premium pricing strategy</div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {getMetricIcon(selectedMetric)}
                  {selectedTimeframe === 'monthly' ? 'Monthly' : selectedTimeframe === 'yearly' ? 'Yearly' : 'ROI'} Performance
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Revenue</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Costs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Profit</span>
                  </div>
                </div>
              </div>
              
              <EnhancedChartRenderer
                data={chartData}
                type={selectedTimeframe === 'projection' ? 'line' : 'bar'}
                title=""
                xAxisKey="name"
                yAxisKey={selectedMetric === 'roi' ? 'roi' : selectedMetric === 'revenue' ? 'revenue' : selectedMetric === 'costs' ? 'costs' : 'profit'}
                className="h-80"
              />
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white border rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Cost Breakdown
            </h4>
            
            <div className="space-y-4">
              {costBreakdown.map((cost, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: cost.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">{cost.category}</div>
                      <div className="text-xs text-gray-500">{cost.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${cost.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{cost.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Monthly Costs</span>
                <span>${costBreakdown.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Revenue Growth</h4>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Monthly revenue showing consistent 6.2% average growth with premium pricing maintaining strong margins.
            </p>
            <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
              <strong>Projection:</strong> $79k monthly by December
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">Cost Optimization</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Energy costs represent 42% of operating expenses. LED efficiency improvements could reduce by 15%.
            </p>
            <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
              <strong>Opportunity:</strong> $33k annual savings potential
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Market Position</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Premium pricing at $26.8/kg vs market average of $22/kg demonstrates strong value proposition.
            </p>
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              <strong>Advantage:</strong> 22% price premium sustained
            </div>
          </div>
        </div>

        {/* ROI Timeline */}
        <div className="bg-white border rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            ROI Timeline & Milestones
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-900">Key Milestones</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Break-even Point</div>
                    <div className="text-sm text-gray-600">Positive cumulative cash flow</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">Year {breakevenYear}</div>
                    <div className="text-sm text-gray-500">ROI: 19.5%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Full ROI Recovery</div>
                    <div className="text-sm text-gray-600">100% return on investment</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">Year 7</div>
                    <div className="text-sm text-gray-500">ROI: 67.2%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Peak Efficiency</div>
                    <div className="text-sm text-gray-600">Optimal operations achieved</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">Year 5</div>
                    <div className="text-sm text-gray-500">$1.24M revenue</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-900">Investment Summary</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Initial Investment:</span>
                  <span className="font-semibold text-gray-900">$2.5M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">7-Year Revenue:</span>
                  <span className="font-semibold text-gray-900">$7.65M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">7-Year Profit:</span>
                  <span className="font-semibold text-gray-900">$4.18M</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-gray-600">Net ROI (7 years):</span>
                  <span className="font-bold text-green-600 text-lg">+67.2%</span>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800">
                    <strong>Investment Grade:</strong> Excellent
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Strong fundamentals with predictable cash flows and premium market position
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}