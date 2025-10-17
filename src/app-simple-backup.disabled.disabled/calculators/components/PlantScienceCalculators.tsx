'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ArrowRight,
  Leaf,
  Beaker,
  Calendar,
  FlaskConical,
  Sprout,
  BarChart3,
  Layers,
  Activity,
  Timer
} from 'lucide-react'

interface PlantScienceCalculatorsProps {
  searchQuery: string
}

const plantScienceTools = [
  { 
    title: 'Production Planning System',
    description: 'Complete crop scheduling with harvest predictions, labor planning, and yield forecasting',
    href: '/calculators/production-planner',
    icon: Calendar,
    tags: ['Planning', 'Featured', 'Comprehensive'],
    featured: true,
    metrics: { accuracy: '92%', crops: '25+' }
  },
  { 
    title: 'Fertilizer Formulator',
    description: 'Create custom liquid fertilizer recipes with NPK ratios and micronutrient balancing',
    href: '/calculators/fertilizer',
    icon: FlaskConical,
    tags: ['Nutrients', 'Mixing', 'Popular'],
    metrics: { recipes: '100+', precision: '0.1 EC' }
  },
  { 
    title: 'Crop Planning Simulator',
    description: 'Optimize planting schedules, crop rotations, and space utilization',
    href: '/calculators/crop-planning-simulator',
    icon: Sprout,
    tags: ['Simulation', 'Optimization'],
    metrics: { scenarios: 'Unlimited', ROI: '+25%' }
  },
  { 
    title: 'Nutrient Dosing Calculator',
    description: 'Light-based nutrient recommendations with automated dosing schedules',
    href: '/nutrient-dosing',
    icon: Beaker,
    tags: ['Automated', 'DLI-Based'],
    metrics: { method: 'Light-driven', stages: '6' }
  },
  { 
    title: 'Specific Leaf Area (SLA)',
    description: 'Calculate leaf efficiency and optimize canopy management',
    href: '/calculators?tab=sla',
    icon: Leaf,
    tags: ['Canopy', 'Efficiency'],
    metrics: { units: 'cm²/g' }
  },
  { 
    title: 'Leaf Area Index (LAI)',
    description: 'Measure canopy density for optimal light penetration',
    href: '/calculators?tab=lai',
    icon: Layers,
    tags: ['Canopy', 'Light'],
    metrics: { optimal: '3-5 LAI' }
  },
  { 
    title: 'Light Use Efficiency',
    description: 'Analyze photosynthetic efficiency and optimize growth parameters',
    href: '/calculators?tab=lue',
    icon: Activity,
    tags: ['Photosynthesis', 'Advanced'],
    metrics: { units: 'g/mol' }
  },
  { 
    title: 'Crop DLI Requirements',
    description: 'Database of optimal DLI targets for various crops and growth stages',
    href: '/calculators?tab=crop-dli',
    icon: BarChart3,
    tags: ['Reference', 'Database'],
    metrics: { crops: '100+', stages: 'All' }
  }
]

export function PlantScienceCalculators({ searchQuery }: PlantScienceCalculatorsProps) {
  const filteredTools = plantScienceTools.filter(tool => 
    searchQuery === '' || 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredTools.length === 0) {
    return (
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="text-center py-12">
          <Leaf className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No plant science calculators found matching "{searchQuery}"</p>
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
          <Card key={tool.href} className="border-green-800 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
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
                    Open Planner
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Growth Stage Reference */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Timer className="w-4 h-4 text-green-400" />
            Quick Reference: Growth Stages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Clone/Seedling</p>
              <p className="text-white font-medium">100-300 PPFD</p>
            </div>
            <div>
              <p className="text-gray-400">Vegetative</p>
              <p className="text-white font-medium">300-600 PPFD</p>
            </div>
            <div>
              <p className="text-gray-400">Flowering</p>
              <p className="text-white font-medium">600-1000 PPFD</p>
            </div>
          </div>
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

      {/* Nutrient Tips */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Beaker className="w-4 h-4 text-green-400" />
            Plant Science Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Match nutrient strength to light intensity (higher DLI = higher EC)</li>
            <li>• Monitor runoff EC and pH daily for optimal uptake</li>
            <li>• Adjust fertilizer ratios based on growth stage</li>
            <li>• Use production planning to optimize harvest timing</li>
            <li>• Track SLA to identify stress before visual symptoms</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}