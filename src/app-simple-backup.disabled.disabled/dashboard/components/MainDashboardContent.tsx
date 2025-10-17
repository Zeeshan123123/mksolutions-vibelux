'use client'

import Link from 'next/link'
import { 
  LayoutGrid, 
  Calculator,
  Lightbulb,
  FileText,
  TrendingUp,
  Crown,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TierLevel } from '@/lib/access-control';

interface MainDashboardContentProps {
  userRole: 'user' | 'admin' | 'developer'
  subscriptionTier: TierLevel
}

export function MainDashboardContent({ userRole, subscriptionTier }: MainDashboardContentProps) {
  const quickActions = [
    { href: "/design", label: "New Design", icon: LayoutGrid, description: "Create lighting design" },
    { href: "/calculators", label: "Calculator", icon: Calculator, description: "PPFD & DLI calculations" },
    { href: "/fixtures", label: "Fixtures", icon: Lightbulb, description: "Browse LED fixtures" },
    { href: "/reports", label: "Reports", icon: FileText, description: "Generate reports" }
  ]

  return (
    <div className="space-y-6">
      {/* Upgrade Banner for Free Users */}
      {subscriptionTier === 'free' && (
        <Card className="border-purple-600/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Free Plan - Explore VibeLux Features</p>
                  <p className="text-gray-400 text-sm">You're currently using 3 of 5 available fixtures</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/calculators" 
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
                >
                  Try Calculator
                </Link>
                <Link 
                  href="/pricing" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href}>
              <Card className="border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors h-full">
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-1">{action.label}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Projects */}
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Recent Projects</h3>
            <Link 
              href="/projects" 
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
              <div>
                <p className="text-white text-sm">Indoor Lettuce Farm</p>
                <p className="text-gray-400 text-xs">Updated 2 hours ago</p>
              </div>
              <span className="text-green-400 text-xs">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
              <div>
                <p className="text-white text-sm">Cannabis Facility Design</p>
                <p className="text-gray-400 text-xs">Updated 1 day ago</p>
              </div>
              <span className="text-blue-400 text-xs">In Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}