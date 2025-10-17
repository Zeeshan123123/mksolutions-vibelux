'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Activity, Gauge, TrendingUp, AlertTriangle } from 'lucide-react'

// Dynamically import the dashboard to avoid SSR issues
const EnergyVerificationDashboard = dynamic(
  () => import('@/components/EnergyVerificationDashboard.stub').then(mod => ({ default: mod.EnergyVerificationDashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading Energy Dashboard...</span>
      </div>
    )
  }
)

const RealTimeEnergyMonitor = dynamic(
  () => import('@/components/energy/RealTimeEnergyMonitor').then(mod => ({ default: mod.RealTimeEnergyMonitor })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading Real-time Monitor...</span>
      </div>
    )
  }
)

export function EnergyMonitoringContent() {
  // Test facility ID - in production this would come from user context
  const facilityId = 'test-facility-001'
  const baselineId = 'baseline-001' // Optional

  return (
    <div className="space-y-8">
      {/* Monitoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Current Usage
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">847.2 kW</div>
            <p className="text-xs text-gray-400">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-400" />
              +2.3% from last hour
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Peak Demand
            </CardTitle>
            <Gauge className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,234 kW</div>
            <p className="text-xs text-gray-400">
              Today's maximum
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Energy Savings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">23.5%</div>
            <p className="text-xs text-gray-400">
              vs baseline period
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              System Status
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Online</div>
            <p className="text-xs text-gray-400">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Energy Monitor */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Real-time Energy Monitoring
          </CardTitle>
          <p className="text-gray-400">
            Live utility integration and energy consumption tracking
          </p>
        </CardHeader>
        <CardContent>
          <RealTimeEnergyMonitor />
        </CardContent>
      </Card>

      {/* Energy Verification Dashboard */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-green-400" />
            IPMVP-Certified Energy Verification
          </CardTitle>
          <p className="text-gray-400">
            Verified energy savings tracking and reporting
          </p>
        </CardHeader>
        <CardContent>
          <EnergyVerificationDashboard />
        </CardContent>
      </Card>

      {/* Monitoring Alerts */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Monitoring Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Peak demand reduced by 150kW during DR event</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Battery optimization cycle completed</p>
                <p className="text-xs text-gray-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Time-of-use rate change detected</p>
                <p className="text-xs text-gray-400">6 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}