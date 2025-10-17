'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BarChart3, TrendingUp, Activity, Zap, ArrowRight } from 'lucide-react'

export function AdminAnalyticsContent() {
  const analyticsLinks = [
    { title: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3, description: 'User behavior and metrics' },
    { title: 'CAD Usage Stats', href: '/admin/cad-usage', icon: Zap, description: 'Feature usage analytics' },
    { title: 'Business Intelligence', href: '/admin/business-intelligence', icon: TrendingUp, description: 'Advanced insights and reporting' }
  ]

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {analyticsLinks.map((link) => {
        const Icon = link.icon
        return (
          <Link key={link.title} href={link.href}>
            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}