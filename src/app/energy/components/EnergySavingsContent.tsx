'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Zap,
  TrendingUp,
  DollarSign,
  Leaf,
  Award,
  Calendar,
  Download,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Battery,
  Sun,
  Moon,
  Activity,
  RefreshCw
} from 'lucide-react'

export function EnergySavingsContent() {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(true)
  const [savingsData, setSavingsData] = useState<any>(null)
  const [facilityId] = useState('facility-001') // In production, get from user context

  // Mock data for demo
  const mockSavingsData = {
    totalSavings: 47250.30,
    monthlySavings: 3247.50,
    yearlySavings: 56700.00,
    revenueShare: {
      customer: 35437.73,
      vibelux: 11812.57
    },
    achievements: [
      { id: 1, title: "Energy Saver", description: "Saved 50,000 kWh", icon: "zap", earned: true },
      { id: 2, title: "Peak Reducer", description: "Reduced peak demand by 25%", icon: "trending-down", earned: true },
      { id: 3, title: "Grid Helper", description: "Participated in 10 DR events", icon: "battery", earned: false }
    ],
    monthlyData: [
      { month: 'Jan', savings: 2450, baseline: 8900, optimized: 6450 },
      { month: 'Feb', savings: 2680, baseline: 8700, optimized: 6020 },
      { month: 'Mar', savings: 3120, baseline: 9200, optimized: 6080 },
      { month: 'Apr', savings: 3247, baseline: 8950, optimized: 5703 },
      { month: 'May', savings: 3580, baseline: 9400, optimized: 5820 },
      { month: 'Jun', savings: 4100, baseline: 10200, optimized: 6100 }
    ],
    savingsBreakdown: [
      { name: 'Time-of-Use', value: 1450, color: '#3B82F6' },
      { name: 'Demand Response', value: 897, color: '#10B981' },
      { name: 'Battery Optimization', value: 650, color: '#F59E0B' },
      { name: 'Load Shifting', value: 250, color: '#8B5CF6' }
    ]
  }

  // Fetch real savings data
  useEffect(() => {
    fetchSavingsData()
  }, [facilityId])

  const fetchSavingsData = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavingsData(mockSavingsData)
    } catch (error) {
      console.error('Error fetching savings data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load savings data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      toast({
        title: 'Report Generated',
        description: 'Your monthly energy savings report has been generated.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Savings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${savingsData?.totalSavings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-400">
              Since program start
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Monthly Savings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${savingsData?.monthlySavings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-400">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Your Share (75%)
            </CardTitle>
            <Award className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${savingsData?.revenueShare?.customer?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-400">
              Revenue sharing
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              CO₂ Reduced
            </CardTitle>
            <Leaf className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24.3t</div>
            <p className="text-xs text-gray-400">
              Carbon footprint reduction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sharing Explanation */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Revenue Sharing (75/25 Split)
          </CardTitle>
          <CardDescription>
            VibeLux shares 75% of verified energy savings with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Your Share (75%)</span>
                  <span className="text-lg font-bold text-green-400">
                    ${savingsData?.revenueShare?.customer?.toLocaleString() || '0'}
                  </span>
                </div>
                <Progress value={75} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">VibeLux Share (25%)</span>
                  <span className="text-lg font-bold text-blue-400">
                    ${savingsData?.revenueShare?.vibelux?.toLocaleString() || '0'}
                  </span>
                </div>
                <Progress value={25} className="h-3" />
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">How it works:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Energy savings are verified using IPMVP standards</li>
                <li>• You keep 75% of all verified savings</li>
                <li>• Payments are made monthly</li>
                <li>• No upfront costs or equipment purchases</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Chart */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Monthly Energy Consumption & Savings</CardTitle>
          <CardDescription>
            Comparison of baseline vs optimized energy usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={savingsData?.monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="baseline" 
                stackId="1" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.3}
                name="Baseline Usage ($)"
              />
              <Area 
                type="monotone" 
                dataKey="optimized" 
                stackId="2" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
                name="Optimized Usage ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Savings Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Savings Breakdown</CardTitle>
            <CardDescription>
              Sources of energy cost reduction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={savingsData?.savingsBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value}`}
                >
                  {savingsData?.savingsBreakdown?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Achievements</CardTitle>
            <CardDescription>
              Energy efficiency milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsData?.achievements?.map((achievement: any) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {achievement.earned ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{achievement.title}</p>
                    <p className="text-xs text-gray-400">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Reports & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button 
              onClick={fetchSavingsData} 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button 
              onClick={() => window.location.href = '/energy?tab=optimization'}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Optimization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}