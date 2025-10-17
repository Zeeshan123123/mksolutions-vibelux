'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ArrowRight,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  Gauge,
  Cloud,
  Waves,
  AlertTriangle,
  Timer
} from 'lucide-react'

interface EnvironmentalCalculatorsProps {
  searchQuery: string
}

const environmentalTools = [
  { 
    title: 'Environmental Simulator',
    description: 'Complete 24-hour climate simulation with predictive modeling and optimization recommendations',
    href: '/calculators-advanced/environmental-simulator',
    icon: Activity,
    tags: ['Advanced', 'Simulation', 'Featured'],
    featured: true,
    metrics: { parameters: '15+', accuracy: '96%' }
  },
  { 
    title: 'VPD Calculator',
    description: 'Calculate vapor pressure deficit for optimal plant transpiration and growth',
    href: '/calculators-advanced/vpd',
    icon: Droplets,
    tags: ['Essential', 'Most Used'],
    metrics: { users: '3.1K', saves: '15%' }
  },
  { 
    title: 'Advanced VPD & Humidity Deficit',
    description: 'Comprehensive VPD analysis with humidity deficit, dew point, and leaf temperature adjustments',
    href: '/calculators-advanced/vpd-advanced',
    icon: Droplets,
    tags: ['Professional', 'Detailed'],
    metrics: { calculations: '8 types' }
  },
  { 
    title: 'Heat Load Calculator',
    description: 'Calculate cooling requirements, HVAC sizing, and energy consumption for your facility',
    href: '/calculators-advanced/heat-load',
    icon: Thermometer,
    tags: ['HVAC Design', 'Critical'],
    metrics: { factors: '12+', BTU: 'Accurate' }
  },
  { 
    title: 'CO₂ Enrichment Planner',
    description: 'Optimize CO₂ supplementation with cost analysis and delivery method comparison',
    href: '/calculators-advanced/co2-enrichment',
    icon: Cloud,
    tags: ['Yield Boost', 'ROI'],
    metrics: { yield: '+30%', methods: '4' }
  },
  { 
    title: 'Transpiration Calculator',
    description: 'Penman-Monteith equation for precise water use and irrigation planning',
    href: '/calculators-advanced/transpiration',
    icon: Waves,
    tags: ['Water Management', 'Scientific'],
    metrics: { equation: 'Penman-Monteith' }
  },
  { 
    title: 'Psychrometric Calculator',
    description: 'Complete air properties analysis including enthalpy, humidity ratio, and wet bulb',
    href: '/calculators-advanced/psychrometric',
    icon: Gauge,
    tags: ['Technical', 'HVAC Pro'],
    metrics: { properties: '10+' }
  },
  { 
    title: 'Environmental Control Sizing',
    description: 'Complete HVAC system design with equipment recommendations and energy analysis',
    href: '/calculators-advanced/environmental-control',
    icon: Wind,
    tags: ['System Design', 'Comprehensive'],
    metrics: { brands: '15+', efficiency: 'SEER 20+' }
  },
  { 
    title: 'Real-time Environmental Monitor',
    description: 'Live environmental analysis with alerts and optimization suggestions',
    href: '/calculators-advanced/environmental-monitoring',
    icon: Activity,
    tags: ['Monitoring', 'Real-time'],
    metrics: { refresh: '1min', alerts: 'Smart' }
  },
  { 
    title: 'Energy-Moisture Balance',
    description: 'Analyze the relationship between energy use and moisture management',
    href: '/calculators-advanced/energy-moisture-balance',
    icon: Timer,
    tags: ['Advanced', 'Efficiency'],
    metrics: { savings: '20-30%' }
  }
]

export function EnvironmentalCalculators({ searchQuery }: EnvironmentalCalculatorsProps) {
  const filteredTools = environmentalTools.filter(tool => 
    searchQuery === '' || 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredTools.length === 0) {
    return (
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="text-center py-12">
          <Wind className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No environmental calculators found matching "{searchQuery}"</p>
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
          <Card key={tool.href} className="border-green-800 bg-gradient-to-r from-green-900/20 to-blue-900/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-800/30 rounded-lg">
                    <Icon className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      {tool.title}
                      <Badge variant="secondary" className="bg-green-800 text-green-200">
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
                    <Badge key={tag} variant="outline" className="border-green-700 text-green-300">
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
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Open Simulator
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Critical Alerts */}
      <Card className="border-yellow-800 bg-yellow-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Environmental Control Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">
            Start with VPD calculations to establish baseline environmental targets before sizing HVAC equipment.
          </p>
        </CardContent>
      </Card>

      {/* Other Tools Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTools.filter(tool => !tool.featured).map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-900/30 rounded-lg">
                      <Icon className="w-6 h-6 text-green-400" />
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

      {/* Environmental Ranges Guide */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white text-sm">Optimal Environmental Ranges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">VPD (Veg)</p>
              <p className="text-white font-medium">0.8-1.2 kPa</p>
            </div>
            <div>
              <p className="text-gray-400">VPD (Flower)</p>
              <p className="text-white font-medium">1.2-1.6 kPa</p>
            </div>
            <div>
              <p className="text-gray-400">CO₂ (Lights On)</p>
              <p className="text-white font-medium">1000-1500 ppm</p>
            </div>
            <div>
              <p className="text-gray-400">Air Changes</p>
              <p className="text-white font-medium">60-80/hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}