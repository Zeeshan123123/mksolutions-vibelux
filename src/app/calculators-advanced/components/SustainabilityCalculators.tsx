'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ArrowRight,
  Globe,
  Droplets,
  Leaf,
  BarChart3,
  TreePine,
  Recycle,
  Factory,
  Award
} from 'lucide-react'

interface SustainabilityCalculatorsProps {
  searchQuery: string
}

const sustainabilityTools = [
  { 
    title: 'Carbon Footprint Calculator',
    description: 'Complete greenhouse gas emissions analysis including Scope 1, 2, and 3 emissions with reduction strategies',
    href: '/sustainability/calculator',
    icon: Globe,
    tags: ['ESG Compliance', 'Featured', 'Comprehensive'],
    featured: true,
    metrics: { scopes: '1, 2 & 3', standards: 'GHG Protocol' }
  },
  { 
    title: 'Water Use Efficiency',
    description: 'Analyze water consumption, identify waste, and optimize irrigation strategies',
    href: '/features/scientific-tools/water-use-efficiency-calculator',
    icon: Droplets,
    tags: ['Conservation', 'Optimization'],
    metrics: { savings: 'Up to 40%', monitoring: 'Real-time' }
  },
  { 
    title: 'Energy-Water Nexus',
    description: 'Understand the relationship between energy use and water consumption in your facility',
    href: '/calculators-advanced/energy-moisture-balance',
    icon: Recycle,
    tags: ['Integrated', 'Advanced'],
    metrics: { correlation: '0.85', insights: 'Actionable' }
  }
]

export function SustainabilityCalculators({ searchQuery }: SustainabilityCalculatorsProps) {
  const filteredTools = sustainabilityTools.filter(tool => 
    searchQuery === '' || 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredTools.length === 0) {
    return (
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="text-center py-12">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No sustainability calculators found matching "{searchQuery}"</p>
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
          <Card key={tool.href} className="border-blue-800 bg-gradient-to-r from-blue-900/20 to-green-900/20">
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
                    Calculate Emissions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Sustainability Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <Factory className="w-5 h-5 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">Scope 1</p>
            <p className="text-lg font-medium text-white">Direct Emissions</p>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <Globe className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Scope 2</p>
            <p className="text-lg font-medium text-white">Energy Indirect</p>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <Recycle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-sm text-gray-400">Scope 3</p>
            <p className="text-lg font-medium text-white">Value Chain</p>
          </CardContent>
        </Card>
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-4">
            <TreePine className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-sm text-gray-400">Offset</p>
            <p className="text-lg font-medium text-white">Carbon Credits</p>
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

      {/* Sustainability Goals */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-green-400" />
            Sustainability Targets & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Common Targets</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Net Zero by 2030-2050</li>
                <li>• 40% water reduction by 2025</li>
                <li>• 100% renewable energy</li>
                <li>• Zero waste to landfill</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Certifications</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• B Corp Certification</li>
                <li>• LEED Building Standards</li>
                <li>• ISO 14001 Environmental</li>
                <li>• Carbon Neutral Certified</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card className="border-green-800 bg-green-900/20">
        <CardHeader>
          <CardTitle className="text-green-400 text-sm flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Your Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">-42%</p>
              <p className="text-xs text-gray-400">Carbon Reduction</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">-35%</p>
              <p className="text-xs text-gray-400">Water Savings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">-60%</p>
              <p className="text-xs text-gray-400">Energy Use</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Compared to traditional cultivation methods
          </p>
        </CardContent>
      </Card>
    </div>
  )
}