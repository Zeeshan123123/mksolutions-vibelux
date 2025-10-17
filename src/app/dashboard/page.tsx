'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import {
  Activity,
  Zap,
  Calculator,
  Lightbulb,
  FileText,
  Settings,
  TrendingUp,
  Users,
  ArrowRight,
  Crown,
  Lock,
  Unlock,
  Home,
  Package,
  BarChart3,
  Brain,
  Wrench,
  ShoppingCart,
  Building,
  Leaf,
  FlaskConical,
  DollarSign,
  Shield,
  Cpu,
  Cloud,
  Database,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Gauge,
  Target,
  Layers,
  Grid3x3,
  Beaker,
  Truck,
  ClipboardCheck,
  GraduationCap,
  HeartHandshake,
  Search
} from 'lucide-react'

export default function DashboardPage() {
  const { userId } = useAuth()
  const { subscription, isLoading: subLoading } = useSubscription()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Determine user's plan
  const userPlan = subscription?.plan || 'free'
  const isPro = ['professional', 'enterprise', 'teams'].includes(userPlan)
  const isEnterprise = userPlan === 'enterprise'

  const quickStats = [
    { label: 'Active Projects', value: '0', icon: Activity, color: 'text-blue-400' },
    { label: 'Energy Saved', value: '0 kWh', icon: Zap, color: 'text-green-400' },
    { label: 'Calculations', value: '0', icon: Calculator, color: 'text-purple-400' },
    { label: 'Reports', value: '0', icon: FileText, color: 'text-yellow-400' },
  ]

  const categories = [
    { id: 'all', name: 'All Features', icon: Grid3x3 },
    { id: 'design', name: 'Design & Engineering', icon: Lightbulb },
    { id: 'cultivation', name: 'Cultivation', icon: Leaf },
    { id: 'analytics', name: 'Analytics & AI', icon: Brain },
    { id: 'operations', name: 'Operations', icon: Settings },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingCart },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'integration', name: 'Integrations', icon: Cpu },
  ]

  const allFeatures = [
    // Design & Engineering
    {
      category: 'design',
      title: 'Basic Designer',
      description: 'Create simple lighting layouts with up to 10 fixtures',
      href: '/design',
      icon: Lightbulb,
      badge: 'FREE',
      badgeColor: 'bg-green-600',
      available: true,
      popular: false
    },
    {
      category: 'design',
      title: 'Advanced Designer',
      description: 'Professional CAD/MEP tools with unlimited fixtures',
      href: '/design/advanced',
      icon: Settings,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: true
    },
    {
      category: 'design',
      title: 'Electrical Estimator',
      description: 'Load calculations, panel sizing, wire gauge analysis',
      href: '/tools/electrical-estimator',
      icon: Zap,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },
    {
      category: 'design',
      title: 'HVAC Planner',
      description: 'Climate control and ventilation design',
      href: '/tools/hvac-planner',
      icon: Cloud,
      badge: isPro ? 'AVAILABLE' : 'TEAMS+',
      badgeColor: isPro ? 'bg-green-600' : 'bg-blue-600',
      available: ['teams', 'professional', 'enterprise'].includes(userPlan),
      popular: false
    },

    // Cultivation Management
    {
      category: 'cultivation',
      title: 'Crop Planning',
      description: '200+ crop varieties with DLI/PPFD requirements',
      href: '/cultivation/crop-planning',
      icon: Leaf,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: true
    },
    {
      category: 'cultivation',
      title: 'IPM System',
      description: 'AI pest detection with GPS mapping',
      href: '/cultivation/ipm',
      icon: Shield,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: true
    },
    {
      category: 'cultivation',
      title: 'Seed-to-Sale',
      description: 'Complete plant lifecycle tracking',
      href: '/cultivation/seed-to-sale',
      icon: Package,
      badge: isEnterprise ? 'AVAILABLE' : 'ENTERPRISE',
      badgeColor: isEnterprise ? 'bg-green-600' : 'bg-red-600',
      available: isEnterprise,
      popular: false
    },
    {
      category: 'cultivation',
      title: 'Harvest Manager',
      description: 'Post-harvest processing and quality control',
      href: '/cultivation/harvest',
      icon: ClipboardCheck,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },

    // Analytics & AI
    {
      category: 'analytics',
      title: 'Calculators Suite',
      description: 'Access 25+ professional calculators',
      href: '/calculators-advanced',
      icon: Calculator,
      badge: 'FREE TRIAL',
      badgeColor: 'bg-blue-600',
      available: true,
      popular: true
    },
    {
      category: 'analytics',
      title: 'AI Crop Assistant',
      description: 'AI-powered growing insights and predictions',
      href: '/ai/crop-assistant',
      icon: Brain,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: true
    },
    {
      category: 'analytics',
      title: 'Plant Health AI',
      description: 'Disease detection using computer vision',
      href: '/ai/plant-health',
      icon: HeartHandshake,
      badge: 'BETA',
      badgeColor: 'bg-yellow-600',
      available: isPro,
      popular: false
    },
    {
      category: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Custom dashboards and trend analysis',
      href: '/analytics',
      icon: BarChart3,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },
    {
      category: 'analytics',
      title: 'ML Predictions',
      description: 'Yield, energy, and quality predictions',
      href: '/ai/predictions',
      icon: Target,
      badge: isEnterprise ? 'AVAILABLE' : 'ENTERPRISE',
      badgeColor: isEnterprise ? 'bg-green-600' : 'bg-red-600',
      available: isEnterprise,
      popular: false
    },

    // Operations
    {
      category: 'operations',
      title: 'Project Manager',
      description: 'Greenhouse construction and project tracking',
      href: '/projects',
      icon: Building,
      badge: ['teams', 'professional', 'enterprise'].includes(userPlan) ? 'AVAILABLE' : 'TEAMS+',
      badgeColor: ['teams', 'professional', 'enterprise'].includes(userPlan) ? 'bg-green-600' : 'bg-blue-600',
      available: ['teams', 'professional', 'enterprise'].includes(userPlan),
      popular: false
    },
    {
      category: 'operations',
      title: 'Equipment Maintenance',
      description: 'Preventive maintenance and calibration tracking',
      href: '/operations/maintenance',
      icon: Wrench,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },
    {
      category: 'operations',
      title: 'Labor Management',
      description: 'Employee scheduling and task tracking',
      href: '/operations/labor',
      icon: Users,
      badge: isEnterprise ? 'AVAILABLE' : 'ENTERPRISE',
      badgeColor: isEnterprise ? 'bg-green-600' : 'bg-red-600',
      available: isEnterprise,
      popular: false
    },
    {
      category: 'operations',
      title: 'Training Center',
      description: 'Employee training and certification tracking',
      href: '/operations/training',
      icon: GraduationCap,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },
    {
      category: 'operations',
      title: 'SOP Library',
      description: 'Standard operating procedures management',
      href: '/sops',
      icon: BookOpen,
      badge: 'FREE',
      badgeColor: 'bg-green-600',
      available: true,
      popular: false
    },

    // Marketplace
    {
      category: 'marketplace',
      title: 'Recipe Marketplace',
      description: 'Buy and sell proven growing recipes',
      href: '/marketplace',
      icon: ShoppingCart,
      badge: 'LIVE',
      badgeColor: 'bg-green-600',
      available: true,
      popular: true
    },
    {
      category: 'marketplace',
      title: 'Equipment Trading',
      description: 'Buy and sell grow equipment',
      href: 'https://www.secondbloomauctions.com',
      icon: Package,
      badge: 'EXTERNAL',
      badgeColor: 'bg-gray-600',
      available: true,
      popular: false,
      external: true
    },
    {
      category: 'marketplace',
      title: 'Produce Sales',
      description: 'B2B produce marketplace',
      href: '/marketplace/produce',
      icon: Truck,
      badge: 'COMING SOON',
      badgeColor: 'bg-orange-600',
      available: false,
      popular: false
    },

    // Financial
    {
      category: 'financial',
      title: 'Energy Savings',
      description: 'Free program - we share savings with you',
      href: '/energy-savings',
      icon: Zap,
      badge: 'FREE',
      badgeColor: 'bg-green-600',
      available: true,
      popular: true,
      highlight: true
    },
    {
      category: 'financial',
      title: 'ROI Calculator',
      description: 'Calculate return on investment',
      href: '/calculators/roi',
      icon: TrendingUp,
      badge: 'FREE',
      badgeColor: 'bg-green-600',
      available: true,
      popular: false
    },
    {
      category: 'financial',
      title: 'Financial Integration',
      description: 'QuickBooks and Xero sync',
      href: '/financial/integration',
      icon: DollarSign,
      badge: isEnterprise ? 'AVAILABLE' : 'ENTERPRISE',
      badgeColor: isEnterprise ? 'bg-green-600' : 'bg-red-600',
      available: isEnterprise,
      popular: false
    },
    {
      category: 'financial',
      title: 'Grant Finder',
      description: 'Find and apply for agricultural grants',
      href: '/financial/grants',
      icon: FileText,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },

    // Compliance
    {
      category: 'compliance',
      title: 'Compliance Tracker',
      description: 'State compliance checklists and reminders',
      href: '/compliance',
      icon: Shield,
      badge: 'FREE',
      badgeColor: 'bg-green-600',
      available: true,
      popular: false
    },
    {
      category: 'compliance',
      title: 'GMP Suite',
      description: '21 CFR Part 11 compliant documentation',
      href: '/compliance/gmp',
      icon: ClipboardCheck,
      badge: isEnterprise ? 'AVAILABLE' : 'ENTERPRISE',
      badgeColor: isEnterprise ? 'bg-green-600' : 'bg-red-600',
      available: isEnterprise,
      popular: false
    },
    {
      category: 'compliance',
      title: 'Food Safety',
      description: 'HACCP compliance and tracking',
      href: '/compliance/food-safety',
      icon: Shield,
      badge: isEnterprise ? 'AVAILABLE' : 'ENTERPRISE',
      badgeColor: isEnterprise ? 'bg-green-600' : 'bg-red-600',
      available: isEnterprise,
      popular: false
    },

    // Integrations
    {
      category: 'integration',
      title: 'Sensor Hub',
      description: 'Connect all your sensors and IoT devices',
      href: '/integrations/sensors',
      icon: Cpu,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },
    {
      category: 'integration',
      title: 'API Access',
      description: 'REST API for custom integrations',
      href: '/api/docs',
      icon: Database,
      badge: isPro ? 'AVAILABLE' : 'PRO',
      badgeColor: isPro ? 'bg-green-600' : 'bg-purple-600',
      available: isPro,
      popular: false
    },
    {
      category: 'integration',
      title: 'ERP Integration',
      description: 'SAP, Oracle, Microsoft Dynamics',
      href: '/integrations/erp',
      icon: Layers,
      badge: isEnterprise ? 'AVAILABLE' : 'ENTERPRISE',
      badgeColor: isEnterprise ? 'bg-green-600' : 'bg-red-600',
      available: isEnterprise,
      popular: false
    },
  ]

  // Filter features based on search and category
  const filteredFeatures = allFeatures.filter(feature => {
    const matchesSearch = searchQuery === '' || 
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Group features by category for display
  const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, typeof filteredFeatures>)

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <SiteHeader />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Welcome to VibeLux - {userPlan === 'free' ? 'Explore our features' : `You're on the ${userPlan} plan`}
            </p>
            <div className="mt-4">
              <Link href="/control-center" className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm">
                Go to Control Center
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured - Energy Savings Program */}
          {(selectedCategory === 'all' || selectedCategory === 'financial') && (
            <Card className="mb-8 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-white">Free Energy Savings Program</h3>
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">FEATURED</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Start saving energy immediately with no upfront cost. We optimize your facility and share the savings with you (75% yours, 25% ours).
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        No upfront investment
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        15-45% typical savings
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Monthly payments
                      </span>
                    </div>
                  </div>
                  <Link href="/energy-savings">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Grid by Category */}
          <div className="space-y-8">
            {Object.entries(groupedFeatures).map(([categoryId, features]) => (
              <div key={categoryId}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  {(() => {
                    const IconComp = categories.find(c => c.id === categoryId)?.icon
                    return IconComp ? <IconComp className="w-5 h-5 text-gray-400" /> : null
                  })()}
                  {getCategoryName(categoryId)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <Link 
                      key={index} 
                      href={feature.available || feature.badge === 'FREE' || feature.badge === 'FREE TRIAL' ? feature.href : '/pricing'}
                      target={feature.external ? '_blank' : undefined}
                      rel={feature.external ? 'noopener noreferrer' : undefined}
                    >
                      <Card className={`bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer h-full ${
                        feature.highlight ? 'ring-2 ring-green-600' : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <feature.icon className="w-5 h-5 text-gray-400" />
                              <CardTitle className="text-white text-base">{feature.title}</CardTitle>
                            </div>
                            <div className="flex items-center gap-1">
                              {feature.popular && (
                                <Star className="w-4 h-4 text-yellow-400" />
                              )}
                              <span className={`${feature.badgeColor} text-white text-xs px-2 py-1 rounded-full`}>
                                {feature.badge}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                              {feature.available || feature.badge === 'FREE' || feature.badge === 'FREE TRIAL' ? (
                                <span className="text-purple-400 flex items-center">
                                  Open <ArrowRight className="w-3 h-3 ml-1" />
                                </span>
                              ) : (
                                <span className="text-gray-500 flex items-center">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Upgrade Required
                                </span>
                              )}
                            </div>
                            {feature.external && (
                              <span className="text-xs text-gray-500">External</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade CTA - Only show if not on enterprise */}
          {userPlan !== 'enterprise' && (
            <Card className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-800">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-white">
                        {userPlan === 'free' ? 'Unlock Full Platform Access' : 'Upgrade Your Plan'}
                      </h3>
                    </div>
                      <p className="text-gray-400 mb-4">
                        Get access to {userPlan === 'free' ? '1000+' : 'all'} features, unlimited projects, and advanced tools
                      </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">25+ Calculators</span>
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">AI Designer</span>
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">CAD Export</span>
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">API Access</span>
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">ML Predictions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-2">Starting at</p>
                    <p className="text-3xl font-bold text-white mb-3">$29/mo</p>
                    <Link href="/pricing">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  <h3 className="font-semibold text-white">Documentation</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Learn how to use all features</p>
                <Link href="/docs" className="text-sm text-purple-400 hover:text-purple-300">
                  View Docs →
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <HelpCircle className="w-6 h-6 text-green-400" />
                  <h3 className="font-semibold text-white">Support</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Get help from our team</p>
                <Link href="/support" className="text-sm text-purple-400 hover:text-purple-300">
                  Contact Support →
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Gauge className="w-6 h-6 text-purple-400" />
                  <h3 className="font-semibold text-white">Quick Start</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Get started in 5 minutes</p>
                <Link href="/quickstart" className="text-sm text-purple-400 hover:text-purple-300">
                  Start Tutorial →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}