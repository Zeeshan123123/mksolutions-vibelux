'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Leaf, 
  Brain, 
  BarChart3, 
  CloudRain, 
  Boxes, 
  Link2, 
  Camera,
  AlertTriangle,
  TrendingUp,
  Activity,
  Thermometer,
  Droplets,
  Sun,
  Target,
  Database,
  Cpu,
  Wifi
} from 'lucide-react'

// Import components that exist
import { WeatherWidget } from '@/components/weather/WeatherWidget'

export function UnifiedIntelligenceContent() {
  const [selectedFacility, setSelectedFacility] = useState('facility-1')
  const [activeSystem, setActiveSystem] = useState('energy')

  const facilityLocation = { lat: 40.7128, lon: -74.0060 } // NYC default

  const systemStatus = [
    { name: 'Energy Management', status: 'optimal', efficiency: 94, icon: Zap, color: 'green' },
    { name: 'Environmental Control', status: 'good', efficiency: 87, icon: Thermometer, color: 'blue' },
    { name: 'Lighting Systems', status: 'optimal', efficiency: 92, icon: Sun, color: 'yellow' },
    { name: 'Water Management', status: 'warning', efficiency: 76, icon: Droplets, color: 'orange' },
    { name: 'Plant Health', status: 'optimal', efficiency: 96, icon: Leaf, color: 'green' },
    { name: 'Automation', status: 'good', efficiency: 89, icon: Cpu, color: 'purple' }
  ]

  const aiInsights = [
    {
      id: 1,
      type: 'optimization',
      title: 'Energy Usage Optimization',
      description: 'AI detected 12% energy savings opportunity by adjusting lighting schedules during peak hours.',
      impact: 'high',
      confidence: 94,
      action: 'Implement suggested lighting schedule',
      category: 'energy'
    },
    {
      id: 2,
      type: 'prediction',
      title: 'Plant Growth Acceleration',
      description: 'Environmental conditions are optimal for 15% faster growth in Zone B over next 5 days.',
      impact: 'medium',
      confidence: 87,
      action: 'Adjust harvest schedule',
      category: 'cultivation'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Humidity Anomaly Detected',
      description: 'Unusual humidity patterns in Zone C may indicate HVAC maintenance requirement.',
      impact: 'medium',
      confidence: 91,
      action: 'Schedule HVAC inspection',
      category: 'environment'
    },
    {
      id: 4,
      type: 'efficiency',
      title: 'Resource Allocation',
      description: 'AI suggests reallocating 23% of lighting resources from Zone A to Zone D for better ROI.',
      impact: 'high',
      confidence: 88,
      action: 'Review lighting distribution',
      category: 'lighting'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-900/30 border-green-800'
      case 'good': return 'text-blue-400 bg-blue-900/30 border-blue-800'
      case 'warning': return 'text-orange-400 bg-orange-900/30 border-orange-800'
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-800'
      default: return 'text-gray-400 bg-gray-900/30 border-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-900/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30'
      case 'low': return 'text-green-400 bg-green-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Engine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Processing Power</span>
                <span className="text-green-400">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Quality</span>
                <span className="text-blue-400">96%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Model Accuracy</span>
                <span className="text-purple-400">92%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Data Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Sensors Active</span>
                <span className="text-green-400">47/50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Points/min</span>
                <span className="text-blue-400">2,340</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Predictions/hr</span>
                <span className="text-purple-400">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Optimization Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">91.5%</div>
              <div className="text-green-400 text-sm">+2.3% from last week</div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-gray-400">Energy: 94%</div>
                <div className="text-xs text-gray-400">Growth: 89%</div>
                <div className="text-xs text-gray-400">Efficiency: 91%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Grid */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">System Intelligence Overview</CardTitle>
          <CardDescription className="text-gray-400">
            Real-time AI monitoring of all facility systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemStatus.map((system, index) => {
              const Icon = system.icon
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                  onClick={() => setActiveSystem(system.name.toLowerCase().replace(' ', '-'))}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`w-5 h-5 text-${system.color}-400`} />
                    <h3 className="text-white font-medium text-sm">{system.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Status</span>
                      <Badge className={getStatusColor(system.status)}>
                        {system.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Efficiency</span>
                      <span className="text-white font-semibold">{system.efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`bg-${system.color}-400 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${system.efficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights and Recommendations */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Insights & Recommendations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Smart recommendations based on real-time data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{insight.title}</h3>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confident
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{insight.description}</p>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                        {insight.action}
                      </button>
                      <button className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded text-sm transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {insight.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Growth Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="text-gray-300">Next Harvest (Zone A)</span>
                <span className="text-green-400 font-semibold">14 days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="text-gray-300">Expected Yield</span>
                <span className="text-blue-400 font-semibold">2.3 kg/m²</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="text-gray-300">Quality Score</span>
                <span className="text-purple-400 font-semibold">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-400" />
              Environmental Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherWidget lat={facilityLocation.lat} lon={facilityLocation.lon} />
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-400" />
            System Integrations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Connected systems and data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Climate Control', status: 'connected', icon: Thermometer },
              { name: 'Lighting System', status: 'connected', icon: Sun },
              { name: 'Irrigation', status: 'connected', icon: Droplets },
              { name: 'Security Cameras', status: 'limited', icon: Camera },
              { name: 'Energy Meters', status: 'connected', icon: Zap },
              { name: 'Nutrient Sensors', status: 'connected', icon: Leaf },
              { name: 'Air Quality', status: 'maintenance', icon: Activity },
              { name: 'Network', status: 'connected', icon: Wifi }
            ].map((integration, index) => {
              const Icon = integration.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{integration.name}</p>
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}