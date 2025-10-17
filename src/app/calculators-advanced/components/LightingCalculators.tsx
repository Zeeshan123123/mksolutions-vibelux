'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ArrowRight,
  Sun, 
  Lightbulb,
  Activity,
  Zap,
  Eye,
  BarChart3,
  Target,
  Layers
} from 'lucide-react'

interface LightingCalculatorsProps {
  searchQuery: string
}

const lightingTools = [
  { 
    title: 'PPFD Heat Map Visualizer',
    description: '3D visualization of light distribution, uniformity analysis, and optimization recommendations',
    href: '/calculators-advanced/ppfd-map',
    icon: Sun,
    tags: ['3D Visualization', 'Most Popular', 'Design Tool'],
    featured: true,
    metrics: { users: '2.3K', accuracy: '99.5%' }
  },
  { 
    title: 'PPFD ↔ DLI Converter',
    description: 'Convert between instantaneous PPFD and Daily Light Integral with photoperiod adjustments',
    href: '/calculators?tab=ppfd-dli',
    icon: Sun,
    tags: ['Essential', 'Quick Calculation'],
    metrics: { users: '1.8K', saves: '5min' }
  },
  { 
    title: 'Coverage Area Calculator',
    description: 'Optimize fixture placement, calculate overlap, and ensure uniform light distribution',
    href: '/calculators-advanced/coverage-area',
    icon: Layers,
    tags: ['Layout Design', 'Spacing'],
    metrics: { projects: '450+', coverage: '95%+' }
  },
  { 
    title: 'Light Requirements by Stage',
    description: 'Calculate precise light requirements based on growth stage, crop type, and fruit load',
    href: '/calculators-advanced/light-requirements',
    icon: Target,
    tags: ['Crop-Specific', 'Stage-Based'],
    metrics: { crops: '25+', stages: '6' }
  },
  { 
    title: 'Spectrum Analyzer',
    description: 'Analyze light spectrum composition and calculate photosynthetic photon flux',
    href: '/photosynthetic-calculator',
    icon: Activity,
    tags: ['Advanced', 'Spectrum', 'YPF'],
    metrics: { wavelengths: '380-780nm' }
  },
  { 
    title: 'Energy Cost Calculator',
    description: 'Calculate electricity costs for lighting with time-of-use rates and demand charges',
    href: '/calculators?tab=energy-cost',
    icon: Zap,
    tags: ['Cost Analysis', 'ROI'],
    metrics: { savings: 'Up to 40%' }
  },
  { 
    title: 'Crop DLI Analysis',
    description: 'Compare current light levels to optimal DLI targets for your specific crops',
    href: '/calculators?tab=crop-dli',
    icon: Lightbulb,
    tags: ['Crop Health', 'Optimization'],
    metrics: { database: '100+ crops' }
  },
  { 
    title: 'Light Uniformity Checker',
    description: 'Analyze and optimize light uniformity across your growing area',
    href: '/calculators?tab=uniformity',
    icon: BarChart3,
    tags: ['Quality Control', 'Standards'],
    metrics: { target: '>0.7 uniformity' }
  }
]

export function LightingCalculators({ searchQuery }: LightingCalculatorsProps) {
  const filteredTools = lightingTools.filter(tool => 
    searchQuery === '' || 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredTools.length === 0) {
    return (
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No lighting calculators found matching "{searchQuery}"</p>
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
          <Card key={tool.href} className="border-yellow-800 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-800/30 rounded-lg">
                    <Icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      {tool.title}
                      <Badge variant="secondary" className="bg-yellow-800 text-yellow-200">
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
                    <Badge key={tag} variant="outline" className="border-yellow-700 text-yellow-300">
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
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Open Calculator
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Other Tools Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTools.filter(tool => !tool.featured).map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-900/30 rounded-lg">
                      <Icon className="w-6 h-6 text-yellow-400" />
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

      {/* Quick Tips */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-yellow-400" />
            Pro Tips for Lighting Calculations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Start with the PPFD Heat Map to visualize your current setup</li>
            <li>• Use Coverage Area Calculator before purchasing new fixtures</li>
            <li>• Check crop-specific DLI requirements for optimal yields</li>
            <li>• Consider energy costs when planning photoperiods</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}