'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  TrendingUp,
  Database,
  Flag,
  BarChart3,
  Activity,
  Settings,
  Bot,
  Shield,
  Zap,
  Package,
  DollarSign,
  Gift,
  Hash,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Cpu,
  HardDrive,
  Cloud,
  Lock,
  UserCheck,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminCapability {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  stats?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  features?: string[];
  status?: 'active' | 'beta' | 'coming-soon';
}

export function AdminDashboardOverview() {
  const router = useRouter();

  const capabilities: AdminCapability[] = [
    {
      title: 'User Management',
      description: 'Manage users, permissions, and impersonate for support',
      icon: Users,
      route: '/admin',
      stats: [
        { label: 'Total Users', value: '12,847', trend: 'up' },
        { label: 'Active Today', value: '3,842' },
        { label: 'New This Month', value: '523', trend: 'up' }
      ],
      features: ['User Search', 'Impersonation', 'Audit Logs', 'Bulk Actions'],
      status: 'active'
    },
    {
      title: 'Credit Management',
      description: 'Give credits, run campaigns, and track AI usage',
      icon: Gift,
      route: '/admin/credits',
      stats: [
        { label: 'Credits Given', value: '12,500', trend: 'up' },
        { label: 'Active Campaigns', value: '3' },
        { label: 'Avg Credits/User', value: '157' }
      ],
      features: ['Individual Credits', 'Bulk Campaigns', 'Usage Analytics', 'Email Notifications'],
      status: 'active'
    },
    {
      title: 'Promo Codes',
      description: 'Create viral social media campaigns with shareable codes',
      icon: Hash,
      route: '/admin/promo-codes',
      stats: [
        { label: 'Active Codes', value: '5' },
        { label: 'Total Redemptions', value: '342', trend: 'up' },
        { label: 'Conversion Rate', value: '27.4%' }
      ],
      features: ['Auto-generate Codes', 'Social Media Posts', 'Tracking Analytics', 'Expiration Control'],
      status: 'active'
    },
    {
      title: 'Performance Monitoring',
      description: 'Real-time system performance and infrastructure metrics',
      icon: TrendingUp,
      route: '/admin/performance',
      stats: [
        { label: 'Uptime', value: '99.98%', trend: 'stable' },
        { label: 'Avg Response', value: '124ms' },
        { label: 'Error Rate', value: '0.02%', trend: 'down' }
      ],
      features: ['API Metrics', 'Database Health', 'Cache Performance', 'Marketplace Stats'],
      status: 'active'
    },
    {
      title: 'Database Backup',
      description: 'Automated backups with encryption and restore capabilities',
      icon: Database,
      route: '/admin/backup',
      stats: [
        { label: 'Total Backups', value: '28' },
        { label: 'Success Rate', value: '96.4%' },
        { label: 'Storage Used', value: '4.2GB' }
      ],
      features: ['Automated Backups', 'Encryption', 'Point-in-time Recovery', 'S3 Storage'],
      status: 'active'
    },
    {
      title: 'Feature Flags',
      description: 'Control feature rollouts and A/B testing',
      icon: Flag,
      route: '/admin/features',
      stats: [
        { label: 'Active Flags', value: '7' },
        { label: 'Experiments', value: '3' },
        { label: 'Success Rate', value: '82%', trend: 'up' }
      ],
      features: ['Percentage Rollouts', 'User Targeting', 'A/B Testing', 'Scheduling'],
      status: 'active'
    },
    {
      title: 'Marketplace Analytics',
      description: 'Recipe marketplace performance and revenue tracking',
      icon: BarChart3,
      route: '/admin/marketplace',
      stats: [
        { label: 'Total Recipes', value: '127' },
        { label: 'Revenue', value: '$128k', trend: 'up' },
        { label: 'Active Users', value: '3,842' }
      ],
      features: ['Recipe Performance', 'Author Analytics', 'Revenue Tracking', 'User Insights'],
      status: 'active'
    },
    {
      title: 'User Analytics',
      description: 'Comprehensive user behavior and engagement insights',
      icon: Activity,
      route: '/admin/analytics',
      stats: [
        { label: 'DAU/MAU', value: '68%', trend: 'up' },
        { label: 'Retention', value: '78.4%' },
        { label: 'ARPU', value: '$42', trend: 'up' }
      ],
      features: ['User Journey', 'Cohort Analysis', 'Geographic Data', 'Behavior Tracking'],
      status: 'active'
    },
    {
      title: 'Advanced Visualizations',
      description: 'Sankey, Gantt, Spider charts and interactive dashboards',
      icon: BarChart3,
      route: '/visualizations',
      stats: [
        { label: 'Chart Types', value: '12+' },
        { label: 'Interactive Features', value: '8' },
        { label: 'Export Formats', value: '5' }
      ],
      features: ['Sankey Diagrams', 'Spider Charts', 'Network Graphs', 'Gantt Charts'],
      status: 'active'
    },
    {
      title: 'Collaborative Dashboards',
      description: 'Shared dashboards with real-time annotations and comments',
      icon: Users,
      route: '/dashboards',
      stats: [
        { label: 'Shared Dashboards', value: '12' },
        { label: 'Active Collaborators', value: '28' },
        { label: 'Comments', value: '89' }
      ],
      features: ['Real-time Comments', 'Annotations', 'Permission Controls', 'Version History'],
      status: 'active'
    },
    {
      title: 'AI & Automation',
      description: 'Advanced AI integration and workflow automation',
      icon: Bot,
      route: '/admin/automation',
      stats: [
        { label: 'AI Requests', value: '45.8k' },
        { label: 'Automation Rules', value: '23' },
        { label: 'Time Saved', value: '312h' }
      ],
      features: ['Advanced AI', 'Workflow Builder', 'Smart Alerts', 'Auto-responses'],
      status: 'beta'
    },
    {
      title: 'System Settings',
      description: 'Global configuration and security settings',
      icon: Settings,
      route: '/admin/settings',
      stats: [
        { label: 'Config Items', value: '156' },
        { label: 'Last Updated', value: '2h ago' },
        { label: 'Sync Status', value: 'Active' }
      ],
      features: ['Environment Config', 'Security Policies', 'API Keys', 'Integrations'],
      status: 'active'
    }
  ];

  const systemHealth = {
    overall: 'healthy' as const,
    components: [
      { name: 'API Services', status: 'operational', uptime: 99.99 },
      { name: 'Database', status: 'operational', uptime: 99.98 },
      { name: 'Cache Layer', status: 'operational', uptime: 100 },
      { name: 'Job Queue', status: 'degraded', uptime: 98.5 },
      { name: 'File Storage', status: 'operational', uptime: 99.95 }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: AdminCapability['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>;
      case 'beta':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Beta</Badge>;
      case 'coming-soon':
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Coming Soon</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time platform status and health metrics</CardDescription>
            </div>
            <Badge className={
              systemHealth.overall === 'healthy' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            }>
              {systemHealth.overall === 'healthy' ? 'All Systems Operational' : 'Partial Degradation'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {systemHealth.components.map((component) => (
              <div key={component.name} className="text-center">
                <div className={`text-2xl mb-1 ${getStatusColor(component.status)}`}>
                  {component.status === 'operational' ? (
                    <CheckCircle className="w-8 h-8 mx-auto" />
                  ) : component.status === 'degraded' ? (
                    <AlertCircle className="w-8 h-8 mx-auto" />
                  ) : (
                    <AlertCircle className="w-8 h-8 mx-auto" />
                  )}
                </div>
                <p className="text-sm font-medium text-white">{component.name}</p>
                <p className="text-xs text-gray-400">{component.uptime}% uptime</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {capabilities.map((capability) => {
          const Icon = capability.icon;
          return (
            <Card 
              key={capability.route} 
              className="cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => router.push(capability.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  {getStatusBadge(capability.status)}
                </div>
                <CardTitle className="text-lg mt-3">{capability.title}</CardTitle>
                <CardDescription>{capability.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {capability.stats && (
                  <div className="space-y-2 mb-4">
                    {capability.stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{stat.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-white">{stat.value}</span>
                          {stat.trend && (
                            <span className={
                              stat.trend === 'up' ? 'text-green-400' :
                              stat.trend === 'down' ? 'text-red-400' :
                              'text-gray-400'
                            }>
                              {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {capability.features && (
                  <div className="flex flex-wrap gap-1">
                    {capability.features.slice(0, 3).map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {capability.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{capability.features.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <UserCheck className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-sm font-medium text-white">Review Users</p>
              <p className="text-xs text-gray-400">8 pending</p>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <FileText className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-sm font-medium text-white">View Reports</p>
              <p className="text-xs text-gray-400">3 new</p>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <Download className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-sm font-medium text-white">Export Data</p>
              <p className="text-xs text-gray-400">Last: 2h ago</p>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <RefreshCw className="w-5 h-5 text-yellow-400 mb-2" />
              <p className="text-sm font-medium text-white">Sync Systems</p>
              <p className="text-xs text-gray-400">All synced</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}