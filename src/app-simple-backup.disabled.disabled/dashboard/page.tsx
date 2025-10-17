'use client'

import { useState, useEffect, Suspense } from 'react'
// import { useAuth } from '@/contexts/AuthContext' // Disabled for test deployment
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
  Plus,
  MapPin,
  Building2
} from 'lucide-react'

// Import existing dashboard components
import { DashboardManager } from '@/components/collaborative/DashboardManager'
import { ShareableDashboard } from '@/components/collaborative/ShareableDashboard'

// Import main dashboard content (we'll extract this from the current dashboard)
import { MainDashboardContent } from './components/MainDashboardContent'
import { DashboardBuilderContent } from './components/DashboardBuilderContent'
import { UnifiedIntelligenceContent } from './components/UnifiedIntelligenceContent'
import LocationBasedAnalysis from '@/components/analysis/LocationBasedAnalysisFixed'
import { ProjectManagementPanel } from '@/components/project-management/ProjectManagementPanel'

// Import access control
import { TierGate, TierTabTrigger } from '@/components/access/TierGate'
import { hasFeatureAccess, type TierLevel } from '@/lib/access-control'

type DashboardTab = 'overview' | 'collaborative' | 'builder' | 'intelligence' | 'analysis' | 'projects'

function DashboardContent() {
  // const { isSignedIn, userId } = useAuth() // Disabled for test deployment
  const isSignedIn = true;
  const userId = 'test-user';
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'developer'>('user')
  const [subscriptionTier, setSubscriptionTier] = useState<TierLevel>('free')
  const [userModules, setUserModules] = useState<string[]>([])

  // Get initial tab from URL parameters
  useEffect(() => {
    const tab = searchParams?.get('tab') as DashboardTab
    if (tab && ['overview', 'collaborative', 'builder', 'intelligence', 'analysis', 'projects'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Initialize user data
  useEffect(() => {
    if (isSignedIn && userId) {
      // Load user role and subscription tier
      // TODO: Replace with actual user data from your auth context or API
      // For now, check localStorage for demo purposes
      const savedTier = localStorage.getItem('demo-subscription-tier');
      const savedRole = localStorage.getItem('demo-user-role');
      
      setUserRole((savedRole as any) || 'user');
      setSubscriptionTier((savedTier as any) || 'free');
      setUserModules(['environmental-monitoring']);
    }
  }, [isSignedIn, userId])

  const tabConfig = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Main dashboard with projects and quick actions',
      feature: 'dashboard.overview' as const,
    },
    {
      value: 'collaborative',
      label: 'Collaborative',
      icon: Users,
      description: 'Team dashboards and shared insights',
      feature: 'dashboard.collaborative' as const,
    },
    {
      value: 'builder',
      label: 'Builder',
      icon: Grid,
      description: 'Create custom dashboard layouts',
      feature: 'dashboard.builder' as const,
    },
    {
      value: 'intelligence',
      label: 'Intelligence',
      icon: Brain,
      description: 'AI-powered unified analytics',
      feature: 'dashboard.intelligence' as const,
    },
    {
      value: 'analysis',
      label: 'Location Analysis',
      icon: MapPin,
      description: 'Climate analysis and crop suitability assessment',
      feature: 'dashboard.intelligence' as const,
    },
    {
      value: 'projects',
      label: 'Projects',
      icon: Building2,
      description: 'Project management and tracking',
      feature: 'dashboard.projects' as const,
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Simplified Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Your cultivation operations</p>
            </div>
            
            {/* Simplified Stats */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-right">
                <div className="text-base sm:text-lg font-semibold text-green-400">3/5</div>
                <div className="text-xs text-gray-400">Fixtures</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-base sm:text-lg font-semibold text-blue-400">2</div>
                <div className="text-xs text-gray-400">Projects</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-base sm:text-lg font-semibold text-purple-400">Free</div>
                <div className="text-xs text-gray-400">Plan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-800 h-10 sm:h-12 text-xs sm:text-sm">
            {tabConfig.slice(0, 5).map((tab) => {
              const Icon = tab.icon
              const hasAccess = hasFeatureAccess(tab.feature, subscriptionTier)
              
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={!hasAccess}
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white disabled:opacity-30 h-8 sm:h-10 px-2 sm:px-4"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-xs">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview">
            <MainDashboardContent userRole={userRole} subscriptionTier={subscriptionTier} />
          </TabsContent>

          <TabsContent value="collaborative">
            <TierGate userTier={subscriptionTier} userModules={userModules}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DashboardManager />
                </div>
                <div>
                  <ShareableDashboard />
                </div>
              </div>
            </TierGate>
          </TabsContent>

          <TabsContent value="builder">
            <TierGate userTier={subscriptionTier} userModules={userModules}>
              <DashboardBuilderContent />
            </TierGate>
          </TabsContent>

          <TabsContent value="intelligence">
            <TierGate userTier={subscriptionTier} userModules={userModules}>
              <UnifiedIntelligenceContent />
            </TierGate>
          </TabsContent>

          <TabsContent value="analysis">
            <TierGate userTier={subscriptionTier} userModules={userModules}>
              <LocationBasedAnalysis userType="grower" />
            </TierGate>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ConsolidatedDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}