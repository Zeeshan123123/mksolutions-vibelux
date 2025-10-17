'use client'

import { useState } from 'react'
import { 
  Plus, 
  Save, 
  Eye, 
  Grid, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity,
  Thermometer,
  Zap,
  Droplets,
  Sun,
  Target,
  TrendingUp,
  Settings,
  Trash2,
  Copy,
  Move,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Widget {
  id: string
  name: string
  description: string
  icon: any
  category: string
  color: string
  size: 'small' | 'medium' | 'large'
}

export function DashboardBuilderContent() {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['energy-usage', 'temperature'])
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const availableWidgets: Widget[] = [
    {
      id: 'energy-usage',
      name: 'Energy Usage',
      description: 'Real-time energy consumption monitoring',
      icon: Zap,
      category: 'energy',
      color: 'yellow',
      size: 'medium'
    },
    {
      id: 'temperature',
      name: 'Temperature Monitor',
      description: 'Environment temperature tracking',
      icon: Thermometer,
      category: 'environment',
      color: 'red',
      size: 'small'
    },
    {
      id: 'humidity',
      name: 'Humidity Levels',
      description: 'Relative humidity monitoring',
      icon: Droplets,
      category: 'environment',
      color: 'blue',
      size: 'small'
    },
    {
      id: 'light-intensity',
      name: 'Light Intensity',
      description: 'PPFD and DLI measurements',
      icon: Sun,
      category: 'lighting',
      color: 'orange',
      size: 'medium'
    },
    {
      id: 'performance-chart',
      name: 'Performance Chart',
      description: 'Overall system performance trends',
      icon: BarChart3,
      category: 'analytics',
      color: 'purple',
      size: 'large'
    },
    {
      id: 'growth-metrics',
      name: 'Growth Metrics',
      description: 'Plant growth tracking and analysis',
      icon: TrendingUp,
      category: 'cultivation',
      color: 'green',
      size: 'medium'
    },
    {
      id: 'alerts-panel',
      name: 'Alerts Panel',
      description: 'System alerts and notifications',
      icon: Activity,
      category: 'monitoring',
      color: 'red',
      size: 'small'
    },
    {
      id: 'efficiency-gauge',
      name: 'Efficiency Gauge',
      description: 'Overall system efficiency indicator',
      icon: Target,
      category: 'analytics',
      color: 'indigo',
      size: 'small'
    }
  ]

  const categories = ['energy', 'environment', 'lighting', 'analytics', 'cultivation', 'monitoring']

  const handleWidgetSelect = (widgetId: string) => {
    if (selectedWidgets.includes(widgetId)) {
      setSelectedWidgets(selectedWidgets.filter(id => id !== widgetId))
    } else {
      setSelectedWidgets([...selectedWidgets, widgetId])
    }
  }

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId)
  }

  const handleDragEnd = () => {
    setDraggedWidget(null)
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedWidget) {
      const currentIndex = selectedWidgets.indexOf(draggedWidget)
      if (currentIndex !== -1) {
        const newSelectedWidgets = [...selectedWidgets]
        newSelectedWidgets.splice(currentIndex, 1)
        newSelectedWidgets.splice(targetIndex, 0, draggedWidget)
        setSelectedWidgets(newSelectedWidgets)
      }
    }
  }

  const getWidgetById = (id: string) => availableWidgets.find(w => w.id === id)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      energy: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
      environment: 'bg-blue-900/30 text-blue-400 border-blue-800',
      lighting: 'bg-orange-900/30 text-orange-400 border-orange-800',
      analytics: 'bg-purple-900/30 text-purple-400 border-purple-800',
      cultivation: 'bg-green-900/30 text-green-400 border-green-800',
      monitoring: 'bg-red-900/30 text-red-400 border-red-800'
    }
    return colors[category] || 'bg-gray-900/30 text-gray-400 border-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Widget Library */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Widget Library</CardTitle>
          <CardDescription className="text-gray-400">
            Drag and drop widgets to build your custom dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableWidgets
                    .filter(widget => widget.category === category)
                    .map(widget => {
                      const Icon = widget.icon
                      const isSelected = selectedWidgets.includes(widget.id)
                      
                      return (
                        <div
                          key={widget.id}
                          onClick={() => handleWidgetSelect(widget.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-900/30' 
                              : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-6 h-6 text-${widget.color}-400`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm">{widget.name}</h4>
                              <p className="text-gray-400 text-xs mt-1">{widget.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className={getCategoryColor(widget.category)}>
                                  {widget.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {widget.size}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Preview */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Dashboard Preview</CardTitle>
              <CardDescription className="text-gray-400">
                {selectedWidgets.length} widget{selectedWidgets.length !== 1 ? 's' : ''} selected
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
              <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedWidgets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No widgets selected</p>
              <p className="text-sm">Choose widgets from the library above to build your dashboard</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
                {selectedWidgets.map((widgetId, index) => {
                  const widget = getWidgetById(widgetId)
                  if (!widget) return null
                  
                  const Icon = widget.icon
                  
                  return (
                    <div
                      key={`${widgetId}-${index}`}
                      draggable={!previewMode}
                      onDragStart={() => handleDragStart(widgetId)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(index)}
                      className={`
                        relative p-4 bg-gray-700 rounded-lg border border-gray-600 
                        ${widget.size === 'large' ? 'md:col-span-2 lg:col-span-3' : 
                          widget.size === 'medium' ? 'md:col-span-1' : 'md:col-span-1'
                        }
                        ${!previewMode ? 'cursor-move hover:border-gray-500' : ''}
                        ${draggedWidget === widgetId ? 'opacity-50' : ''}
                      `}
                    >
                      {!previewMode && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-gray-300">
                            <Settings className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleWidgetSelect(widgetId)}
                            className="p-1 bg-red-600 hover:bg-red-500 rounded text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={`w-5 h-5 text-${widget.color}-400`} />
                        <h3 className="text-white font-medium">{widget.name}</h3>
                      </div>
                      
                      {/* Mock widget content */}
                      <div className="space-y-2">
                        {widget.category === 'analytics' && (
                          <div className="h-24 bg-gray-600 rounded flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        {widget.category === 'energy' && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Current Usage</span>
                            <span className="text-white font-bold">2.4 kW</span>
                          </div>
                        )}
                        {widget.category === 'environment' && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Current</span>
                            <span className="text-white font-bold">
                              {widget.id === 'temperature' ? '24°C' : '65%'}
                            </span>
                          </div>
                        )}
                        {widget.category === 'lighting' && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">PPFD</span>
                              <span className="text-white">400 μmol/m²/s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">DLI</span>
                              <span className="text-white">28.8 mol/m²/d</span>
                            </div>
                          </div>
                        )}
                        {widget.category === 'cultivation' && (
                          <div className="h-16 bg-gray-600 rounded flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                        )}
                        {widget.category === 'monitoring' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-gray-400 text-sm">All systems operational</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}