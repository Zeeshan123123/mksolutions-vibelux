'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  LayoutDashboard,
  Users,
  BarChart3,
  Building2,
  MessageSquare,
  Settings,
  Shield,
  Search,
  Activity,
  DollarSign,
  Zap,
  Database,
  Mail,
  Tag,
  Eye,
  AlertTriangle
} from 'lucide-react'

// Import admin section components
import { AdminOverviewContent } from './components/AdminOverviewContent'
import { AdminUsersContent } from './components/AdminUsersContent'
import { AdminAnalyticsContent } from './components/AdminAnalyticsContent'
import { AdminMonitoringContent } from './components/AdminMonitoringContent'
import { AdminOperationsContent } from './components/AdminOperationsContent'
import { AdminContentContent } from './components/AdminContentContent'
import { AdminCommunicationsContent } from './components/AdminCommunicationsContent'
import { AdminSystemContent } from './components/AdminSystemContent'

type AdminSection = 'overview' | 'users' | 'analytics' | 'operations' | 'communications' | 'system' | 'monitoring' | 'content'

export default function ConsolidatedAdminInterface() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  // Get initial section from URL parameters
  useEffect(() => {
    const section = searchParams?.get('section') as AdminSection
    if (section && ['overview', 'users', 'analytics', 'operations', 'communications', 'system', 'monitoring', 'content'].includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  // Check admin authorization
  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/check-access')
      if (response.ok) {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
      }
    } catch (error) {
      setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  const sectionConfig = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Dashboard metrics and activity',
      color: 'text-purple-400'
    },
    {
      value: 'users',
      label: 'Users',
      icon: Users,
      description: 'User management and access control',
      color: 'text-blue-400'
    },
    {
      value: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Platform metrics and insights',
      color: 'text-green-400'
    },
    {
      value: 'monitoring',
      label: 'Monitoring',
      icon: Activity,
      description: 'System health and performance',
      color: 'text-orange-400'
    },
    {
      value: 'operations',
      label: 'Operations',
      icon: Building2,
      description: 'Business and marketplace',
      color: 'text-yellow-400'
    },
    {
      value: 'content',
      label: 'Content',
      icon: Eye,
      description: 'Features and paywall management',
      color: 'text-cyan-400'
    },
    {
      value: 'communications',
      label: 'Comms',
      icon: MessageSquare,
      description: 'Email and support',
      color: 'text-pink-400'
    },
    {
      value: 'system',
      label: 'System',
      icon: Settings,
      description: 'Settings and maintenance',
      color: 'text-gray-400'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin interface...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Card className="border-red-800 bg-red-900/20 max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-gray-300">
              You don't have permission to access the admin interface.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                Admin Control Center
              </h1>
              <p className="text-gray-400 mt-1">
                Comprehensive platform administration and monitoring
              </p>
            </div>
            
            {/* Global Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users, orders, settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Total Users</span>
                </div>
                <p className="text-2xl font-bold text-white mt-1">12,543</p>
                <p className="text-xs text-green-400">+156 today</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-white mt-1">$124K</p>
                <p className="text-xs text-green-400">+12% MTD</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">API Calls</span>
                </div>
                <p className="text-2xl font-bold text-white mt-1">2.4M</p>
                <p className="text-xs text-gray-400">Last 24h</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">System Load</span>
                </div>
                <p className="text-2xl font-bold text-white mt-1">42%</p>
                <p className="text-xs text-green-400">Healthy</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-300">Active Issues</span>
                </div>
                <p className="text-2xl font-bold text-white mt-1">3</p>
                <p className="text-xs text-red-400">Needs attention</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Tabs */}
        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as AdminSection)}>
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 mb-8 bg-gray-800">
            {sectionConfig.map((section) => {
              const Icon = section.icon
              
              return (
                <TabsTrigger
                  key={section.value}
                  value={section.value}
                  className="flex flex-col gap-1 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Icon className={`w-5 h-5 ${section.color}`} />
                  <span className="text-xs font-medium">{section.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <AdminOverviewContent searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">User & Access Management</h2>
                <p className="text-gray-400">Manage users, permissions, credits, and audit logs</p>
              </div>
              <Badge variant="secondary" className="bg-blue-900/30 text-blue-400">
                <Users className="w-3 h-3 mr-1" />
                12,543 Total
              </Badge>
            </div>
            <AdminUsersContent searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Analytics & Insights</h2>
                <p className="text-gray-400">Platform analytics, CAD usage, and business intelligence</p>
              </div>
              <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                <BarChart3 className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
            </div>
            <AdminAnalyticsContent />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">System Monitoring</h2>
                <p className="text-gray-400">Performance, health, client monitoring, and energy systems</p>
              </div>
              <Badge variant="secondary" className="bg-orange-900/30 text-orange-400">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
            <AdminMonitoringContent />
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Business Operations</h2>
                <p className="text-gray-400">Marketplace, affiliates, revenue, and visual operations</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400">
                <DollarSign className="w-3 h-3 mr-1" />
                $124K MTD
              </Badge>
            </div>
            <AdminOperationsContent />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Content & Features</h2>
                <p className="text-gray-400">Feature flags, paywall management, and content control</p>
              </div>
              <Badge variant="secondary" className="bg-cyan-900/30 text-cyan-400">
                <Eye className="w-3 h-3 mr-1" />
                Control
              </Badge>
            </div>
            <AdminContentContent />
          </TabsContent>

          <TabsContent value="communications" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Communications Hub</h2>
                <p className="text-gray-400">Email management, support tickets, and promotional campaigns</p>
              </div>
              <Badge variant="secondary" className="bg-pink-900/30 text-pink-400">
                <Mail className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <AdminCommunicationsContent />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">System Administration</h2>
                <p className="text-gray-400">Backups, feature flags, automation, debug tools, and settings</p>
              </div>
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                <Database className="w-3 h-3 mr-1" />
                Operational
              </Badge>
            </div>
            <AdminSystemContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}