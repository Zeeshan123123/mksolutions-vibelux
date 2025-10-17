'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Activity,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'

interface AdminOverviewContentProps {
  searchQuery: string
}

export function AdminOverviewContent({ searchQuery }: AdminOverviewContentProps) {
  // Mock data - in production this would come from API
  const recentActivity = [
    { id: 1, type: 'user_signup', message: 'New user registration: john.doe@example.com', time: '2 minutes ago', icon: Users, color: 'text-blue-400' },
    { id: 2, type: 'order', message: 'New marketplace order #12543 - $450', time: '15 minutes ago', icon: Package, color: 'text-green-400' },
    { id: 3, type: 'alert', message: 'High API usage detected from IP 192.168.1.100', time: '1 hour ago', icon: AlertTriangle, color: 'text-yellow-400' },
    { id: 4, type: 'system', message: 'Backup completed successfully', time: '3 hours ago', icon: CheckCircle, color: 'text-green-400' },
    { id: 5, type: 'error', message: 'Failed login attempt for admin@vibelux.ai', time: '4 hours ago', icon: XCircle, color: 'text-red-400' }
  ]

  const activeIssues = [
    { id: 1, severity: 'high', title: 'Database connection pool exhaustion', description: 'Connection limit reaching 90%', time: '30 minutes' },
    { id: 2, severity: 'medium', title: 'Elevated error rate in payment processing', description: '3% error rate in last hour', time: '1 hour' },
    { id: 3, severity: 'low', title: 'Slow query detected in analytics', description: 'Query taking >5s to execute', time: '2 hours' }
  ]

  const quickActions = [
    { label: 'User Management', href: '/admin?section=users', icon: Users, count: '12.5K' },
    { label: 'View Analytics', href: '/admin?section=analytics', icon: TrendingUp, count: 'Live' },
    { label: 'System Health', href: '/admin?section=system', icon: Activity, count: '98.5%' },
    { label: 'Revenue Report', href: '/admin?section=operations', icon: DollarSign, count: '$124K' }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.label} href={action.href}>
              <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{action.count}</span>
                  </div>
                  <p className="text-gray-300 font-medium">{action.label}</p>
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Recent Activity
              <Badge variant="secondary" className="bg-purple-900/30 text-purple-400">
                Live
              </Badge>
            </CardTitle>
            <CardDescription>Latest platform events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 bg-gray-700 rounded-lg ${activity.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link href="/admin/audit-logs" className="flex items-center gap-2 text-sm text-purple-400 mt-4 hover:text-purple-300">
              View all activity
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Active Issues */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Active Issues
              <Badge variant="secondary" className="bg-red-900/30 text-red-400">
                3 Active
              </Badge>
            </CardTitle>
            <CardDescription>System alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIssues.map((issue) => (
                <div key={issue.id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{issue.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        issue.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                        issue.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{issue.description}</p>
                  <p className="text-xs text-gray-500">Detected {issue.time} ago</p>
                </div>
              ))}
            </div>
            <Link href="/admin?section=system" className="flex items-center gap-2 text-sm text-purple-400 mt-4 hover:text-purple-300">
              System diagnostics
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">System Performance Overview</CardTitle>
          <CardDescription>Key metrics for the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">API Response Time</p>
              <p className="text-2xl font-bold text-white">124ms</p>
              <p className="text-xs text-green-400">-12% from yesterday</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Database Queries</p>
              <p className="text-2xl font-bold text-white">2.4M</p>
              <p className="text-xs text-gray-400">+5% from yesterday</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-white">94.2%</p>
              <p className="text-xs text-green-400">Optimal</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-white">0.12%</p>
              <p className="text-xs text-green-400">Within limits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Quick Links */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Administrative Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/admin/audit-logs" className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-white">Audit Logs</p>
            </Link>
            <Link href="/admin/backups" className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
              <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-white">Backups</p>
            </Link>
            <Link href="/admin/features" className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
              <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-white">Feature Flags</p>
            </Link>
            <Link href="/admin/promo-codes" className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
              <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-white">Promo Codes</p>
            </Link>
            <Link href="/admin/support" className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
              <Users className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-sm text-white">Support Tickets</p>
            </Link>
            <Link href="/admin/debug" className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-white">Debug Tools</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}