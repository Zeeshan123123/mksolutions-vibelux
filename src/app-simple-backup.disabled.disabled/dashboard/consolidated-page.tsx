'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  Settings2,
  Brain,
  Eye,
  BarChart3,
  TrendingUp,
  Share2,
  Grid,
  Plus
} from 'lucide-react'

// Import existing dashboard components
import { DashboardManager } from '@/components/collaborative/DashboardManager'
import { ShareableDashboard } from '@/components/collaborative/ShareableDashboard'

// Import main dashboard content (we'll extract this from the current dashboard)
import { MainDashboardContent } from './components/MainDashboardContent'
import { DashboardBuilderContent } from './components/DashboardBuilderContent'
import { UnifiedIntelligenceContent } from './components/UnifiedIntelligenceContent'

type DashboardTab = 'overview' | 'collaborative' | 'builder' | 'intelligence'

export default function ConsolidatedDashboard() {
  const { isSignedIn, userId } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'developer'>('user')
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'professional' | 'enterprise'>('free')

  // Get initial tab from URL parameters
  useEffect(() => {
    const tab = searchParams?.get('tab') as DashboardTab
    if (tab && ['overview', 'collaborative', 'builder', 'intelligence'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Initialize user data
  useEffect(() => {
    if (isSignedIn && userId) {
      // Load user role and subscription tier
      // This would typically come from your auth context or API
      setUserRole('user') // Placeholder
      setSubscriptionTier('professional') // Placeholder
    }
  }, [isSignedIn, userId])

  const tabConfig = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Main dashboard with projects and quick actions'
    },
    {
      value: 'collaborative',
      label: 'Collaborative',
      icon: Users,
      description: 'Team dashboards and shared insights'
    },
    {
      value: 'builder',
      label: 'Builder',
      icon: Grid,
      description: 'Create custom dashboard layouts',
      premium: true
    },
    {
      value: 'intelligence',
      label: 'Intelligence',
      icon: Brain,
      description: 'AI-powered unified analytics',
      premium: true
    }
  ]

  const isPremiumFeature = (tab: string) => {
    const tabInfo = tabConfig.find(t => t.value === tab)
    return tabInfo?.premium && subscriptionTier === 'free'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Comprehensive view of your cultivation operations
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">98.5%</div>
                <div className="text-xs text-gray-400">System Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">12</div>
                <div className="text-xs text-gray-400">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">$2.4K</div>
                <div className="text-xs text-gray-400">Monthly Savings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-800">
            {tabConfig.map((tab) => {
              const Icon = tab.icon
              const disabled = isPremiumFeature(tab.value)
              
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={disabled}
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white disabled:opacity-50"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.premium && subscriptionTier === 'free' && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Pro
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Overview Dashboard</h2>
                <p className="text-gray-400">Your main operations hub</p>
              </div>
            </div>
            <MainDashboardContent userRole={userRole} subscriptionTier={subscriptionTier} />
          </TabsContent>

          <TabsContent value="collaborative" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Collaborative Dashboards</h2>
                <p className="text-gray-400">Share insights and collaborate with your team</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Dashboard
                </button>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DashboardManager />
              </div>
              <div>
                <ShareableDashboard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            {isPremiumFeature('builder') ? (
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-white">Premium Feature</CardTitle>
                  <CardDescription>
                    Dashboard Builder is available with Professional and Enterprise plans
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold">
                    Upgrade to Pro
                  </button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Dashboard Builder</h2>
                    <p className="text-gray-400">Create custom dashboard layouts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Widget
                    </button>
                  </div>
                </div>
                <DashboardBuilderContent />
              </>
            )}
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            {isPremiumFeature('intelligence') ? (
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-white">Premium Feature</CardTitle>
                  <CardDescription>
                    AI-powered Intelligence Dashboard is available with Professional and Enterprise plans
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold">
                    Upgrade to Pro
                  </button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Unified Intelligence</h2>
                    <p className="text-gray-400">AI-powered insights and analytics</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                      AI Powered
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-900/30 text-blue-400">
                      Real-time
                    </Badge>
                  </div>
                </div>
                <UnifiedIntelligenceContent />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}