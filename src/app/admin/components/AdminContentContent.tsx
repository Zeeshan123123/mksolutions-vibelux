'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { Eye, Lock, Flag, FileText, Settings, DollarSign } from 'lucide-react'
import { PromoCodesManager } from './PromoCodesManager'

export function AdminContentContent() {
  const contentSections = [
    { 
      title: 'Feature Flags', 
      href: '/admin/features', 
      icon: Flag, 
      description: 'Toggle features on/off',
      stats: { total: 24, active: 18 }
    },
    { 
      title: 'Paywall Management', 
      href: '/admin/paywall', 
      icon: Lock, 
      description: 'Subscription and access control',
      stats: { plans: 4, subscribers: '2,341' }
    },
    { 
      title: 'Content Moderation', 
      href: '/admin/moderation', 
      icon: Eye, 
      description: 'Review and moderate content',
      stats: { pending: 12, reviewed: '1,234' }
    },
    { 
      title: 'Template Management', 
      href: '/admin/templates', 
      icon: FileText, 
      description: 'Email and page templates',
      stats: { templates: 18, active: 12 }
    }
  ]

  const featureFlags = [
    { name: 'New Dashboard UI', key: 'new_dashboard', enabled: true, description: 'Enable redesigned dashboard' },
    { name: 'AI Recommendations', key: 'ai_recommendations', enabled: false, description: 'Show AI-powered suggestions' },
    { name: 'Beta Features', key: 'beta_features', enabled: true, description: 'Allow access to beta features' },
    { name: 'Advanced Analytics', key: 'advanced_analytics', enabled: true, description: 'Enable advanced analytics tools' }
  ]

  const paywallPlans = [
    { name: 'Free', users: 8432, revenue: '$0', features: '5 features' },
    { name: 'Starter', users: 2341, revenue: '$24,532', features: '15 features' },
    { name: 'Professional', users: 1245, revenue: '$62,250', features: '25 features' },
    { name: 'Enterprise', users: 525, revenue: '$78,750', features: 'All features' }
  ]

  return (
    <div className="space-y-6">
      {/* Content Management Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {contentSections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.title} href={section.href}>
              <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-900/30 rounded-lg">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(section.stats).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-gray-400 capitalize">{key}</p>
                        <p className="text-white font-medium text-lg">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Feature Flags */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Quick Feature Toggles</CardTitle>
              <CardDescription>Enable or disable features globally</CardDescription>
            </div>
            <Link href="/admin/features">
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {featureFlags.map((flag) => (
            <div key={flag.key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="text-white font-medium">{flag.name}</p>
                <p className="text-sm text-gray-400">{flag.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={flag.enabled ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}>
                  {flag.enabled ? 'Active' : 'Inactive'}
                </Badge>
                <Switch defaultChecked={flag.enabled} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Paywall Overview */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Subscription Plans</CardTitle>
              <CardDescription>Current paywall configuration and metrics</CardDescription>
            </div>
            <Link href="/admin/paywall">
              <Button variant="secondary" size="sm">
                Manage Plans
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {paywallPlans.map((plan) => (
              <div key={plan.name} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{plan.name}</h4>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{plan.users}</p>
                <p className="text-sm text-gray-400">users</p>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-sm text-green-400 font-medium">{plan.revenue}/mo</p>
                  <p className="text-xs text-gray-400">{plan.features}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-sm text-gray-400">Active Pages</p>
            </div>
            <p className="text-2xl font-bold text-white">124</p>
            <p className="text-xs text-green-400">+12 this week</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <p className="text-sm text-gray-400">Page Views</p>
            </div>
            <p className="text-2xl font-bold text-white">892K</p>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <p className="text-sm text-gray-400">Gated Content</p>
            </div>
            <p className="text-2xl font-bold text-white">68</p>
            <p className="text-xs text-gray-400">Premium features</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-4 h-4 text-cyan-400" />
              <p className="text-sm text-gray-400">Feature Flags</p>
            </div>
            <p className="text-2xl font-bold text-white">18/24</p>
            <p className="text-xs text-green-400">75% active</p>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes */}
      <PromoCodesManager />
    </div>
  )
}