'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface RevenueMetrics {
  totalRevenue: number
  partnerRevenue: number
  vibeluxRevenue: number
  monthlyGrowth: number
  activePartners: number
  newPartners: number
  conversionRate: number
  averageOrderValue: number
}

interface PartnerData {
  id: string
  name: string
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  revenue: number
  commission: number
  conversionRate: number
  customers: number
  status: 'active' | 'inactive' | 'pending'
}

interface RevenueShare {
  month: string
  totalRevenue: number
  partnerShare: number
  vibeluxShare: number
  growth: number
}

export function RevenueSharingDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    partnerRevenue: 0,
    vibeluxRevenue: 0,
    monthlyGrowth: 0,
    activePartners: 0,
    newPartners: 0,
    conversionRate: 0,
    averageOrderValue: 0
  })

  const [partners, setPartners] = useState<PartnerData[]>([])
  const [revenueHistory, setRevenueHistory] = useState<RevenueShare[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading revenue sharing data
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Mock revenue metrics
      setMetrics({
        totalRevenue: 2847500,
        partnerRevenue: 1138000,
        vibeluxRevenue: 1709500,
        monthlyGrowth: 18.5,
        activePartners: 47,
        newPartners: 8,
        conversionRate: 23.8,
        averageOrderValue: 15420
      })

      // Mock partner data
      setPartners([
        {
          id: '1',
          name: 'GreenTech Solutions',
          tier: 'Platinum',
          revenue: 485200,
          commission: 145560,
          conversionRate: 31.2,
          customers: 23,
          status: 'active'
        },
        {
          id: '2',
          name: 'AgTech Innovations',
          tier: 'Gold',
          revenue: 298750,
          commission: 74688,
          conversionRate: 28.5,
          customers: 18,
          status: 'active'
        },
        {
          id: '3',
          name: 'Vertical Farm Pro',
          tier: 'Silver',
          revenue: 187300,
          commission: 37460,
          conversionRate: 19.8,
          customers: 12,
          status: 'active'
        },
        {
          id: '4',
          name: 'Smart Grow Systems',
          tier: 'Bronze',
          revenue: 94200,
          commission: 14130,
          conversionRate: 15.2,
          customers: 7,
          status: 'active'
        },
        {
          id: '5',
          name: 'HydroTech Partners',
          tier: 'Gold',
          revenue: 72750,
          commission: 18188,
          conversionRate: 25.1,
          customers: 5,
          status: 'pending'
        }
      ])

      // Mock revenue history
      setRevenueHistory([
        { month: 'Jan', totalRevenue: 1980000, partnerShare: 792000, vibeluxShare: 1188000, growth: 12.3 },
        { month: 'Feb', totalRevenue: 2150000, partnerShare: 860000, vibeluxShare: 1290000, growth: 8.6 },
        { month: 'Mar', totalRevenue: 2380000, partnerShare: 952000, vibeluxShare: 1428000, growth: 10.7 },
        { month: 'Apr', totalRevenue: 2520000, partnerShare: 1008000, vibeluxShare: 1512000, growth: 5.9 },
        { month: 'May', totalRevenue: 2695000, partnerShare: 1078000, vibeluxShare: 1617000, growth: 6.9 },
        { month: 'Jun', totalRevenue: 2847500, partnerShare: 1139000, vibeluxShare: 1708500, growth: 5.7 }
      ])

      setLoading(false)
    }

    loadData()
  }, [])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'Bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'inactive': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Sharing</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Partner revenue distribution and performance analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Partner Portal
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+{metrics.monthlyGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.partnerRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.partnerRevenue / metrics.totalRevenue) * 100).toFixed(1)}% of total
            </p>
            <Progress 
              value={(metrics.partnerRevenue / metrics.totalRevenue) * 100} 
              className="h-1 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activePartners}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.newPartners} new this month
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-500">Growing</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.conversionRate}% conversion rate
            </p>
            <Progress value={metrics.conversionRate} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Split</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm">VibeLux Share</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${metrics.vibeluxRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {((metrics.vibeluxRevenue / metrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Partner Share</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${metrics.partnerRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {((metrics.partnerRevenue / metrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Revenue trend chart</p>
                    <p className="text-xs">+{metrics.monthlyGrowth}% growth this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Partners */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partners.slice(0, 3).map((partner, index) => (
                  <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">{partner.customers} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${partner.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{partner.conversionRate}% conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Partner</th>
                      <th className="text-left py-3 px-4">Tier</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Commission</th>
                      <th className="text-right py-3 px-4">Conversion</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.id} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{partner.name}</p>
                            <p className="text-xs text-muted-foreground">{partner.customers} customers</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getTierColor(partner.tier)}>
                            {partner.tier}
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          ${partner.revenue.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 font-medium text-green-600">
                          ${partner.commission.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {partner.conversionRate}%
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center">
                            {getStatusIcon(partner.status)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">6-month revenue trend</p>
                    <p className="text-xs">$2.85M total this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Partner Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={94} className="w-20 h-2" />
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue Growth</span>
                    <div className="flex items-center gap-2">
                      <Progress value={76} className="w-20 h-2" />
                      <span className="text-sm font-medium">+18.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Partner Retention</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-20 h-2" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Monthly Partner Payouts</p>
                      <p className="text-xs text-muted-foreground">Scheduled for July 1st</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${(metrics.partnerRevenue * 0.3).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">47 partners</p>
                  </div>
                </div>
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">All payouts are processed automatically on the 1st of each month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}