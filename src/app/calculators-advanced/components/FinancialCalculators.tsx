'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ArrowRight,
  DollarSign,
  TrendingUp,
  Calculator,
  PiggyBank,
  FileText,
  Zap,
  BarChart3,
  Building2,
  Percent
} from 'lucide-react'

interface FinancialCalculatorsProps {
  searchQuery: string
}

const financialTools = [
  { 
    title: 'Advanced ROI Calculator',
    description: 'Comprehensive return on investment analysis with seasonal pricing, utility rates, and financing options',
    href: '/calculators-advanced/roi',
    icon: TrendingUp,
    tags: ['Most Popular', 'Detailed Analysis'],
    metrics: { avgROI: '2.3 years', accuracy: '94%' }
  },
  { 
    title: 'Total Cost of Ownership',
    description: 'Compare LED vs HPS lifecycle costs including energy, maintenance, and replacement. Integrates with rebate finder.',
    href: '/calculators-advanced/tco',
    icon: Calculator,
    tags: ['Comparison Tool', '10-Year View', 'Includes Rebates'],
    metrics: { savings: '$150K+', factors: '15+' }
  },
  { 
    title: 'Equipment Leasing Calculator',
    description: 'Analyze lease vs buy options with tax implications and cash flow projections',
    href: '/equipment-leasing',
    icon: Building2,
    tags: ['Financing', 'Cash Flow'],
    metrics: { options: '5 types', terms: '1-7 years' }
  },
  { 
    title: 'Utility Rebate Finder',
    description: 'Comprehensive database of utility incentives and rebates with automated application assistance',
    href: '/rebate-calculator',
    icon: PiggyBank,
    tags: ['Standalone App', 'Location-Based', 'Featured'],
    featured: true,
    isExternal: true,
    metrics: { programs: '500+', avg: '$25K', states: '50' }
  },
  { 
    title: 'Electrical Installation Estimator',
    description: 'Detailed cost breakdown for electrical infrastructure and installation',
    href: '/calculators-advanced/electrical-estimator',
    icon: Zap,
    tags: ['Installation', 'Budget Planning'],
    metrics: { items: '50+', labor: 'Included' }
  },
  { 
    title: 'Revenue Sharing Calculator',
    description: 'Calculate VibeLux 75/25 revenue sharing model for energy savings programs',
    href: '/pricing/calculator',
    icon: Percent,
    tags: ['VibeLux Program', 'No Upfront Cost'],
    metrics: { split: '75/25', guaranteed: 'Yes' }
  }
]

export function FinancialCalculators({ searchQuery }: FinancialCalculatorsProps) {
  const filteredTools = financialTools.filter(tool => 
    searchQuery === '' || 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredTools.length === 0) {
    return (
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No financial calculators found matching "{searchQuery}"</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Featured Tool */}
      {filteredTools.filter(tool => tool.featured).map((tool) => {
        const Icon = tool.icon
        return (
          <Card key={tool.href} className="border-blue-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-800/30 rounded-lg">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      {tool.title}
                      <Badge variant="secondary" className="bg-blue-800 text-blue-200">
                        Featured
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-blue-700 text-blue-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {Object.entries(tool.metrics).map(([key, value]) => (
                    <span key={key}>
                      <span className="capitalize">{key}:</span> <strong className="text-white">{value}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <Link href={tool.href}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    {tool.title.includes('Rebate') ? 'Find Rebates' : 'Calculate ROI'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Average Payback</p>
            <p className="text-2xl font-bold text-green-400">2.3 years</p>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Energy Savings</p>
            <p className="text-2xl font-bold text-blue-400">40-60%</p>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Typical Rebate</p>
            <p className="text-2xl font-bold text-yellow-400">$15-50K</p>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">IRR Range</p>
            <p className="text-2xl font-bold text-purple-400">25-45%</p>
          </CardContent>
        </Card>
      </div>

      {/* Other Tools Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTools.filter(tool => !tool.featured).map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{tool.title}</CardTitle>
                      <CardDescription className="mt-1">{tool.description}</CardDescription>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {tool.metrics && (
                      <div className="text-xs text-gray-400">
                        {Object.entries(tool.metrics)[0] && (
                          <span>
                            {Object.entries(tool.metrics)[0][0]}: <strong className="text-gray-200">{Object.entries(tool.metrics)[0][1]}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Financial Tips */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Financial Planning Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Always check for utility rebates before calculating final ROI</li>
            <li>• Consider both CapEx and OpEx in your total cost analysis</li>
            <li>• Factor in maintenance costs - LEDs require 90% less maintenance</li>
            <li>• Include demand charge reductions in your calculations</li>
            <li>• Account for productivity gains from better light quality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}