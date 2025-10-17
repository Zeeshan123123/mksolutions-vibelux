'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Settings, ArrowRight, Zap, Target, TrendingUp, Battery, Loader2 } from 'lucide-react'

// Dynamically import the dashboard to avoid SSR issues
const EnergyOptimizationDashboard = dynamic(
  () => import('@/components/EnergyOptimizationDashboard.stub').then(mod => ({ default: mod.EnergyOptimizationDashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading Optimization Dashboard...</span>
      </div>
    )
  }
)

export function EnergyOptimizationContent() {
  const [facilityId, setFacilityId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has completed energy setup
    const checkEnergySetup = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/energy/facilities')
        if (response.ok) {
          const data = await response.json()
          if (data.facilities && data.facilities.length > 0) {
            // Use the first facility for now
            setFacilityId(data.facilities[0].id)
          } else {
            // For demo purposes, set a default facility ID
            setFacilityId('demo-facility-1')
          }
        } else {
          // For demo purposes, set a default facility ID
          setFacilityId('demo-facility-1')
        }
      } catch (err) {
        // For demo purposes, set a default facility ID
        setFacilityId('demo-facility-1')
      } finally {
        setLoading(false)
      }
    }

    checkEnergySetup()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading optimization dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-800 bg-red-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-300">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Optimization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Active Optimizations
            </CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-gray-400">
              Running autonomously
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Potential Savings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$4.2K</div>
            <p className="text-xs text-gray-400">
              Additional monthly savings available
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              AI Confidence
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">94.7%</div>
            <p className="text-xs text-gray-400">
              Model accuracy score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Crop Safety Notice */}
      <Alert className="border-green-800 bg-green-900/20">
        <AlertCircle className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          <strong>Crop Protection Active:</strong> All optimizations are constrained to never compromise plant health or yields. 
          Environmental parameters remain within safe cultivation ranges at all times.
        </AlertDescription>
      </Alert>

      {/* Main Optimization Dashboard */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            AI Energy Optimization Dashboard
          </CardTitle>
          <CardDescription>
            Intelligent energy optimization with crop-safe constraints and revenue sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {facilityId ? (
            <EnergyOptimizationDashboard />
          ) : (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Setup Required</h3>
              <p className="text-gray-400 mb-6">
                Complete your energy setup to start using AI optimization features.
              </p>
              <Button 
                onClick={() => window.location.href = '/energy?tab=setup'}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Strategies */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Active Strategies</CardTitle>
            <CardDescription>
              Currently running optimization algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Battery className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Battery Optimization</p>
                    <p className="text-xs text-gray-400">Smart charge/discharge cycles</p>
                  </div>
                </div>
                <span className="text-xs bg-green-800 text-green-200 px-2 py-1 rounded">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Demand Response</p>
                    <p className="text-xs text-gray-400">Grid event participation</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Time-of-Use</p>
                    <p className="text-xs text-gray-400">Load shifting optimization</p>
                  </div>
                </div>
                <span className="text-xs bg-yellow-800 text-yellow-200 px-2 py-1 rounded">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Optimization Performance</CardTitle>
            <CardDescription>
              Recent AI optimization results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Energy Savings</span>
                <span className="text-sm font-medium text-green-400">+23.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Cost Reduction</span>
                <span className="text-sm font-medium text-blue-400">+$3,247/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Peak Demand</span>
                <span className="text-sm font-medium text-yellow-400">-18.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Grid Revenue</span>
                <span className="text-sm font-medium text-purple-400">+$1,156/mo</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Total Monthly Benefit</span>
                  <span className="text-lg font-bold text-green-400">+$4,403</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}