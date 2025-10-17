'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Users,
  UserPlus,
  Shield,
  CreditCard,
  Clock,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Ban,
  Key,
  Mail,
  ArrowRight
} from 'lucide-react'

interface AdminUsersContentProps {
  searchQuery: string
}

export function AdminUsersContent({ searchQuery }: AdminUsersContentProps) {
  const [userSearch, setUserSearch] = useState(searchQuery)

  // Mock data
  const userStats = [
    { label: 'Total Users', value: '12,543', change: '+156', icon: Users, color: 'text-blue-400' },
    { label: 'Active Today', value: '3,421', change: '+12%', icon: Eye, color: 'text-green-400' },
    { label: 'Pro Users', value: '1,856', change: '+23', icon: CreditCard, color: 'text-purple-400' },
    { label: 'Admins', value: '12', change: '0', icon: Shield, color: 'text-red-400' }
  ]

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', plan: 'pro', joined: '2 hours ago', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', plan: 'free', joined: '5 hours ago', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin', plan: 'enterprise', joined: '1 day ago', status: 'active' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', plan: 'pro', joined: '2 days ago', status: 'suspended' }
  ]

  const quickActions = [
    { label: 'User Management', href: '/admin/users', icon: Users, description: 'Search and manage users' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: Clock, description: 'View user activity' },
    { label: 'Access Control', href: '/admin/paywall-override', icon: Key, description: 'Manage permissions' },
    { label: 'Credits System', href: '/admin/credits', icon: CreditCard, description: 'Manage user credits' }
  ]

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {userStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-gray-700 bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-green-400">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.label} href={action.href}>
              <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{action.label}</h4>
                      <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* User Search and Management */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription>Search and manage platform users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link href="/admin/users">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Recent Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={`text-xs ${
                        user.role === 'admin' ? 'bg-red-900/30 text-red-400' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={`text-xs ${
                        user.plan === 'enterprise' ? 'bg-purple-900/30 text-purple-400' :
                        user.plan === 'pro' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={`text-xs ${
                        user.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-400">{user.joined}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">Showing 1-4 of 12,543 users</p>
            <Link href="/admin/users" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
              View all users
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Preview */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent User Activity</CardTitle>
            <Link href="/admin/audit-logs">
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">User john@example.com logged in</p>
                <p className="text-xs text-gray-400">IP: 192.168.1.100 • 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">User jane@example.com upgraded to Pro</p>
                <p className="text-xs text-gray-400">Payment: $49.99 • 1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white">Failed login attempt for admin@vibelux.ai</p>
                <p className="text-xs text-gray-400">IP: 45.67.89.123 • 2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}