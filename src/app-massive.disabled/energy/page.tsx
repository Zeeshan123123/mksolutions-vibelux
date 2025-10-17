'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Activity,
  Settings,
  BarChart3,
  TrendingDown,
  Eye,
  DollarSign,
  Plus,
  Battery,
  Shield,
  Target,
  Gauge
} from 'lucide-react'

// Removed unused component imports to fix build errors

// Import content components (we'll create these)
import { EnergyOverviewContent } from './components/EnergyOverviewContent'
import { EnergyMonitoringContent } from './components/EnergyMonitoringContent'
import { EnergyOptimizationContent } from './components/EnergyOptimizationContent'
import { EnergySetupContent } from './components/EnergySetupContent'
import { EnergySavingsContent } from './components/EnergySavingsContent'

// Import access control
import { TierGate, TierTabTrigger } from '@/components/access/TierGate'
import { hasFeatureAccess, type TierLevel } from '@/lib/access-control'

type EnergyTab = 'overview' | 'monitoring' | 'optimization' | 'savings' | 'setup'

export default function ConsolidatedEnergyHub() {
  const { isSignedIn, userId } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<EnergyTab>('overview')
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'developer'>('user')
  const [subscriptionTier, setSubscriptionTier] = useState<TierLevel>('free')
  const [userModules, setUserModules] = useState<string[]>([])

  // Get initial tab from URL parameters
  useEffect(() => {
    const tab = searchParams?.get('tab') as EnergyTab
    if (tab && ['overview', 'monitoring', 'optimization', 'savings', 'setup'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Initialize user data
  useEffect(() => {
    if (isSignedIn && userId) {
      // Load user role and subscription tier
      setUserRole('user') // Placeholder
      setSubscriptionTier('starter') // Placeholder - default to starter for demo
      setUserModules(['energy-management']) // Placeholder modules
    }
  }, [isSignedIn, userId])

  const tabConfig = [
    {
      value: 'overview',
      label: 'Overview',
      icon: Eye,
      description: 'Energy management landing and quick overview',
      feature: 'energy.overview' as const,
    },
    {
      value: 'monitoring',
      label: 'Monitoring',
      icon: Activity,
      description: 'Real-time energy monitoring and verification',
      feature: 'energy.monitoring' as const,
    },
    {
      value: 'optimization',
      label: 'Optimization',
      icon: Target,
      description: 'AI-powered energy optimization dashboard',
      feature: 'energy.optimization' as const,
    },
    {
      value: 'savings',
      label: 'Savings',
      icon: DollarSign,
      description: 'Energy savings tracking and reporting',
      feature: 'energy.savings' as const,
    },
    {
      value: 'setup',
      label: 'Setup',
      icon: Settings,
      description: 'System configuration and integration setup',
      feature: 'energy.setup' as const,
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                Energy Management Hub
              </h1>
              <p className="text-gray-400 mt-1">
                Comprehensive energy optimization and monitoring for cultivation facilities
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">23.5%</div>
                <div className="text-xs text-gray-400">Energy Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">$3.2K</div>
                <div className="text-xs text-gray-400">Monthly Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">1.2 MW</div>
                <div className="text-xs text-gray-400">Peak Reduction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EnergyTab)}>
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-800">
            {tabConfig.map((tab) => {
              const Icon = tab.icon
              const hasAccess = hasFeatureAccess(tab.feature, subscriptionTier)
              
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={!hasAccess}
                  className="flex items-center gap-2 relative data-[state=active]:bg-yellow-600 data-[state=active]:text-white disabled:opacity-50"
                >
                  <TierTabTrigger
                    value={tab.value}
                    userTier={subscriptionTier}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                  </TierTabTrigger>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Energy Overview</h2>
                <p className="text-gray-400">Smart energy management solutions for cultivation</p>
              </div>
            </div>
            <EnergyOverviewContent userRole={userRole} subscriptionTier={subscriptionTier} />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <TierGate
              userTier={subscriptionTier}
              userModules={userModules}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Energy Monitoring</h2>
                  <p className="text-gray-400">Real-time energy monitoring and verification</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                    Live Data
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-900/30 text-blue-400">
                    IPMVP Certified
                  </Badge>
                </div>
              </div>
              <EnergyMonitoringContent />
            </TierGate>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            {!hasFeatureAccess('energy.optimization', subscriptionTier) ? (
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-white">Premium Feature</CardTitle>
                  <CardDescription>
                    AI-powered Energy Optimization is available with Professional and Enterprise plans
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <button className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold">
                    Upgrade to Pro
                  </button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Energy Optimization</h2>
                    <p className="text-gray-400">AI-powered optimization without compromising crops</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400">
                      AI Powered
                    </Badge>
                    <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                      Crop Safe
                    </Badge>
                  </div>
                </div>
                <EnergyOptimizationContent />
              </>
            )}
          </TabsContent>

          <TabsContent value="savings" className="space-y-6">
            {!hasFeatureAccess('energy.savings', subscriptionTier) ? (
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-white">Premium Feature</CardTitle>
                  <CardDescription>
                    Energy Savings Tracking is available with Professional and Enterprise plans
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <button className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold">
                    Upgrade to Pro
                  </button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Energy Savings</h2>
                    <p className="text-gray-400">Track verified savings and revenue sharing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                      75/25 Split
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-900/30 text-blue-400">
                      Verified
                    </Badge>
                  </div>
                </div>
                <EnergySavingsContent />
              </>
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Energy Setup</h2>
                <p className="text-gray-400">Configure your energy optimization system</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Integration
                </button>
              </div>
            </div>
            <EnergySetupContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}