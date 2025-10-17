'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  ArrowRight,
  Sun, 
  Lightbulb,
  Droplets,
  Thermometer,
  Wind,
  DollarSign,
  TrendingUp,
  Calculator,
  Leaf,
  Globe,
  Activity,
  Zap,
  Clock,
  BarChart3,
  Calendar
} from 'lucide-react'

interface AllCalculatorsProps {
  searchQuery: string
}

const allCalculators = [
  // Lighting
  { 
    category: 'lighting',
    title: 'PPFD Heat Map Visualizer',
    description: '3D light distribution and uniformity analysis',
    href: '/calculators/ppfd-map',
    icon: Sun,
    tags: ['3D', 'Visualization', 'Popular'],
    color: 'text-yellow-400'
  },
  { 
    category: 'lighting',
    title: 'PPFD ↔ DLI Converter',
    description: 'Convert between instantaneous and daily light integrals',
    href: '/calculators?tab=ppfd-dli',
    icon: Sun,
    tags: ['Essential', 'Quick'],
    color: 'text-yellow-400'
  },
  { 
    category: 'lighting',
    title: 'Coverage Area Calculator',
    description: 'Optimize fixture layout and spacing',
    href: '/calculators/coverage-area',
    icon: Lightbulb,
    tags: ['Design', 'Layout'],
    color: 'text-yellow-400'
  },
  { 
    category: 'lighting',
    title: 'Light Requirements Calculator',
    description: 'Calculate requirements by growth stage',
    href: '/calculators/light-requirements',
    icon: Lightbulb,
    tags: ['Crop Science'],
    color: 'text-yellow-400'
  },
  
  // Environmental
  { 
    category: 'environmental',
    title: 'VPD Calculator',
    description: 'Vapor pressure deficit for optimal transpiration',
    href: '/calculators/vpd',
    icon: Droplets,
    tags: ['Essential', 'Popular'],
    color: 'text-blue-400'
  },
  { 
    category: 'environmental',
    title: 'Advanced VPD Calculator',
    description: 'VPD with humidity deficit analysis',
    href: '/calculators/vpd-advanced',
    icon: Droplets,
    tags: ['Advanced', 'Detailed'],
    color: 'text-blue-400'
  },
  { 
    category: 'environmental',
    title: 'Environmental Simulator',
    description: '24-hour climate simulation and optimization',
    href: '/calculators/environmental-simulator',
    icon: Activity,
    tags: ['Advanced', 'Simulation'],
    color: 'text-green-400'
  },
  { 
    category: 'environmental',
    title: 'Heat Load Calculator',
    description: 'HVAC sizing and cooling requirements',
    href: '/calculators/heat-load',
    icon: Thermometer,
    tags: ['HVAC', 'Design'],
    color: 'text-red-400'
  },
  { 
    category: 'environmental',
    title: 'CO₂ Enrichment Calculator',
    description: 'CO₂ requirements and cost analysis',
    href: '/calculators/co2-enrichment',
    icon: Wind,
    tags: ['Growth', 'Optimization'],
    color: 'text-gray-400'
  },
  { 
    category: 'environmental',
    title: 'Transpiration Calculator',
    description: 'Penman-Monteith water use calculations',
    href: '/calculators/transpiration',
    icon: Droplets,
    tags: ['Water', 'Science'],
    color: 'text-blue-400'
  },
  { 
    category: 'environmental',
    title: 'Psychrometric Calculator',
    description: 'Air properties and plant health assessment',
    href: '/calculators/psychrometric',
    icon: Wind,
    tags: ['Technical', 'HVAC'],
    color: 'text-gray-400'
  },
  
  // Financial
  { 
    category: 'financial',
    title: 'Advanced ROI Calculator',
    description: 'Detailed payback analysis with seasonal pricing',
    href: '/calculators/roi',
    icon: TrendingUp,
    tags: ['Popular', 'Business'],
    color: 'text-green-400'
  },
  { 
    category: 'financial',
    title: 'TCO Calculator',
    description: 'Total cost of ownership analysis',
    href: '/tco-calculator',
    icon: Calculator,
    tags: ['Comparison', 'Long-term'],
    color: 'text-purple-400'
  },
  { 
    category: 'financial',
    title: 'Equipment Leasing Calculator',
    description: 'Lease vs buy financial comparison',
    href: '/equipment-leasing',
    icon: DollarSign,
    tags: ['Financing', 'Options'],
    color: 'text-green-400'
  },
  { 
    category: 'financial',
    title: 'Utility Rebate Finder',
    description: 'Comprehensive rebate database with automated application assistance',
    href: '/rebate-calculator',
    icon: DollarSign,
    tags: ['Standalone App', 'Incentives', 'Featured'],
    color: 'text-green-400'
  },
  { 
    category: 'financial',
    title: 'Electrical Cost Estimator',
    description: 'Complete installation cost breakdown',
    href: '/calculators/electrical-estimator',
    icon: Zap,
    tags: ['Installation', 'Budget'],
    color: 'text-yellow-400'
  },
  
  // Plant Science
  { 
    category: 'plant-science',
    title: 'Fertilizer Formulator',
    description: 'Custom liquid fertilizer recipes',
    href: '/calculators/fertilizer',
    icon: Leaf,
    tags: ['Nutrients', 'Mixing'],
    color: 'text-green-400'
  },
  { 
    category: 'plant-science',
    title: 'Production Planner',
    description: 'Week-by-week crop scheduling system',
    href: '/calculators/production-planner',
    icon: Calendar,
    tags: ['Planning', 'Schedule'],
    color: 'text-purple-400'
  },
  { 
    category: 'plant-science',
    title: 'Crop Planning Simulator',
    description: 'Optimize planting schedules and rotations',
    href: '/calculators/crop-planning-simulator',
    icon: Leaf,
    tags: ['Simulation', 'Planning'],
    color: 'text-green-400'
  },
  { 
    category: 'plant-science',
    title: 'Nutrient Dosing Calculator',
    description: 'Light-based nutrient recommendations',
    href: '/nutrient-dosing',
    icon: Leaf,
    tags: ['Automated', 'Precision'],
    color: 'text-green-400'
  },
  
  // Sustainability
  { 
    category: 'sustainability',
    title: 'Carbon Footprint Calculator',
    description: 'Scope 1, 2, and 3 emissions analysis',
    href: '/sustainability/calculator',
    icon: Globe,
    tags: ['ESG', 'Compliance'],
    color: 'text-blue-400'
  },
  { 
    category: 'sustainability',
    title: 'Water Use Efficiency',
    description: 'Water consumption optimization tools',
    href: '/features/scientific-tools/water-use-efficiency-calculator',
    icon: Droplets,
    tags: ['Conservation', 'Efficiency'],
    color: 'text-blue-400'
  }
]

export function AllCalculators({ searchQuery }: AllCalculatorsProps) {
  const filteredCalculators = allCalculators.filter(calc => 
    searchQuery === '' || 
    calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    calc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const categoryOrder = ['lighting', 'environmental', 'financial', 'plant-science', 'sustainability']
  const categorizedCalculators = categoryOrder.map(category => ({
    category,
    calculators: filteredCalculators.filter(calc => calc.category === category)
  })).filter(group => group.calculators.length > 0)

  if (filteredCalculators.length === 0) {
    return (
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="text-center py-12">
          <p className="text-gray-400">No calculators found matching "{searchQuery}"</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {categorizedCalculators.map(({ category, calculators }) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-white mb-4 capitalize">
            {category.replace('-', ' ')} Calculators
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => {
              const Icon = calc.icon
              return (
                <Link key={calc.href} href={calc.href}>
                  <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Icon className={`w-8 h-8 ${calc.color}`} />
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <CardTitle className="text-white text-lg">{calc.title}</CardTitle>
                      <CardDescription>{calc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {calc.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs bg-gray-700 text-gray-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}