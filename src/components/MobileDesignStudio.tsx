'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MobileContainer, 
  MobileCard, 
  MobileButton, 
  MobileGrid,
  MobileSlidePanel 
} from '@/components/ui/mobile-responsive'
import { 
  Layers, 
  Grid, 
  Eye, 
  Settings, 
  Download, 
  Share, 
  Plus, 
  Minus,
  RotateCcw,
  Move,
  Square,
  Circle,
  Triangle,
  Lightbulb,
  Ruler,
  Palette,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer,
  Trash2,
  Copy,
  MoreHorizontal,
  ChevronDown,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tool {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  category: 'select' | 'draw' | 'fixture' | 'measure'
}

interface ViewMode {
  id: string
  name: string
  description: string
}

const tools: Tool[] = [
  { id: 'select', name: 'Select', icon: MousePointer, category: 'select' },
  { id: 'pan', name: 'Pan', icon: Hand, category: 'select' },
  { id: 'rectangle', name: 'Rectangle', icon: Square, category: 'draw' },
  { id: 'circle', name: 'Circle', icon: Circle, category: 'draw' },
  { id: 'polygon', name: 'Polygon', icon: Triangle, category: 'draw' },
  { id: 'fixture', name: 'Fixture', icon: Lightbulb, category: 'fixture' },
  { id: 'measure', name: 'Measure', icon: Ruler, category: 'measure' }
]

const viewModes: ViewMode[] = [
  { id: 'design', name: '2D Design', description: 'Top-down layout view' },
  { id: 'analysis', name: 'PPFD Analysis', description: 'Light intensity heatmap' },
  { id: '3d', name: '3D View', description: 'Three-dimensional preview' },
  { id: 'fixtures', name: 'Fixtures', description: 'Equipment details' }
]

interface DesignProject {
  name: string
  dimensions: { width: number; height: number }
  fixtures: number
  lastModified: string
}

export function MobileDesignStudio() {
  const [selectedTool, setSelectedTool] = useState('select')
  const [viewMode, setViewMode] = useState('design')
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showLayers, setShowLayers] = useState(false)
  const [showProperties, setShowProperties] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showViewModes, setShowViewModes] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const currentProject: DesignProject = {
    name: 'Lighting Design Studio',
    dimensions: { width: 16, height: 16 },
    fixtures: 3,
    lastModified: '2 minutes ago'
  }

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const handleZoomIn = () => setZoomLevel(prev => Math.min(200, prev + 25))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(25, prev - 25))
  const handleZoomReset = () => setZoomLevel(100)

  const getToolsByCategory = (category: Tool['category']) => 
    tools.filter(tool => tool.category === category)

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {currentProject.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{currentProject.dimensions.width}' × {currentProject.dimensions.height}'</span>
              <span>{currentProject.fixtures} fixtures</span>
              <span>Modified {currentProject.lastModified}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={() => setShowExport(true)}
            >
              <Share className="w-5 h-5" />
            </MobileButton>
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={() => setShowProperties(true)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </MobileButton>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {viewModes.map((mode) => (
            <MobileButton
              key={mode.id}
              variant={viewMode === mode.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(mode.id)}
              className="whitespace-nowrap flex-shrink-0"
            >
              {mode.name}
            </MobileButton>
          ))}
          <MobileButton
            variant="ghost"
            size="sm"
            onClick={() => setShowViewModes(true)}
            className="ml-auto flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4" />
          </MobileButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas Area */}
        <div 
          ref={canvasRef}
          className="w-full h-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: `${(zoomLevel / 100) * 20}px ${(zoomLevel / 100) * 20}px`
            }}
          />
          
          {/* Sample Design Elements */}
          <div className="absolute inset-0 p-4">
            {/* Room outline */}
            <div 
              className="border-2 border-gray-600 dark:border-gray-400 relative"
              style={{
                width: `${(zoomLevel / 100) * 200}px`,
                height: `${(zoomLevel / 100) * 200}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Sample fixtures */}
              <div 
                className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center"
                style={{ top: '25%', left: '25%', transform: 'translate(-50%, -50%)' }}
              >
                <Lightbulb className="w-4 h-4 text-yellow-800" />
              </div>
              <div 
                className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center"
                style={{ top: '25%', right: '25%', transform: 'translate(50%, -50%)' }}
              >
                <Lightbulb className="w-4 h-4 text-yellow-800" />
              </div>
              <div 
                className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center"
                style={{ bottom: '25%', left: '50%', transform: 'translate(-50%, 50%)' }}
              >
                <Lightbulb className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          {/* Analysis Overlay */}
          {viewMode === 'analysis' && (
            <div className="absolute inset-0 bg-gradient-radial from-yellow-200 via-green-200 to-blue-200 opacity-50" />
          )}
        </div>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Zoom Controls */}
          <MobileCard padding="sm" className="flex flex-col gap-1">
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="w-8 h-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </MobileButton>
            <div className="text-xs text-center text-gray-600 dark:text-gray-400 px-1">
              {zoomLevel}%
            </div>
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="w-8 h-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </MobileButton>
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
              className="w-8 h-8 p-0"
            >
              <RotateCcw className="w-3 h-3" />
            </MobileButton>
          </MobileCard>

          {/* Layer Controls */}
          <MobileButton
            variant={showLayers ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowLayers(true)}
            className="w-10 h-10"
          >
            <Layers className="w-5 h-5" />
          </MobileButton>
        </div>
      </div>

      {/* Tool Palette */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-7 gap-2">
          {tools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <MobileButton
                key={tool.id}
                variant={selectedTool === tool.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedTool(tool.id)}
                className="aspect-square flex flex-col items-center justify-center p-2"
              >
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-xs">{tool.name}</span>
              </MobileButton>
            )
          })}
        </div>
      </div>

      {/* Layers Panel */}
      <MobileSlidePanel
        isOpen={showLayers}
        onClose={() => setShowLayers(false)}
        title="Layers"
      >
        <div className="p-4 space-y-3">
          {[
            { name: 'Room Layout', visible: true, locked: false },
            { name: 'Fixtures', visible: true, locked: false },
            { name: 'PPFD Analysis', visible: viewMode === 'analysis', locked: false },
            { name: 'Measurements', visible: false, locked: false }
          ].map((layer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-4 h-4 rounded border-2",
                  layer.visible 
                    ? "bg-blue-600 border-blue-600" 
                    : "border-gray-300 dark:border-gray-600"
                )} />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {layer.name}
                </span>
              </div>
              <div className="flex gap-2">
                <MobileButton variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </MobileButton>
                <MobileButton variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </MobileButton>
              </div>
            </div>
          ))}
        </div>
      </MobileSlidePanel>

      {/* Properties Panel */}
      <MobileSlidePanel
        isOpen={showProperties}
        onClose={() => setShowProperties(false)}
        title="Properties"
      >
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Room Dimensions
            </h4>
            <MobileGrid cols={2} gap={3}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Width (ft)
                </label>
                <input 
                  type="number" 
                  value={16}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height (ft)
                </label>
                <input 
                  type="number" 
                  value={16}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                />
              </div>
            </MobileGrid>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Analysis Settings
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target PPFD
                </label>
                <input 
                  type="number" 
                  value={800}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Uniformity Target
                </label>
                <input 
                  type="number" 
                  value={90}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </MobileSlidePanel>

      {/* Export Panel */}
      <MobileSlidePanel
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Export & Share"
      >
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MobileButton variant="outline" className="flex flex-col items-center gap-2 h-20">
              <FileText className="w-6 h-6" />
              <span className="text-sm">PDF Report</span>
            </MobileButton>
            <MobileButton variant="outline" className="flex flex-col items-center gap-2 h-20">
              <ImageIcon className="w-6 h-6" />
              <span className="text-sm">PNG Image</span>
            </MobileButton>
            <MobileButton variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Download className="w-6 h-6" />
              <span className="text-sm">CAD File</span>
            </MobileButton>
            <MobileButton variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Share className="w-6 h-6" />
              <span className="text-sm">Share Link</span>
            </MobileButton>
          </div>
        </div>
      </MobileSlidePanel>

      {/* View Modes Detail Panel */}
      <MobileSlidePanel
        isOpen={showViewModes}
        onClose={() => setShowViewModes(false)}
        title="View Modes"
      >
        <div className="p-4 space-y-3">
          {viewModes.map((mode) => (
            <MobileButton
              key={mode.id}
              variant={viewMode === mode.id ? 'primary' : 'outline'}
              className="w-full flex flex-col items-start gap-1 h-auto p-4"
              onClick={() => {
                setViewMode(mode.id)
                setShowViewModes(false)
              }}
            >
              <span className="font-medium">{mode.name}</span>
              <span className="text-sm opacity-70">{mode.description}</span>
            </MobileButton>
          ))}
        </div>
      </MobileSlidePanel>
    </div>
  )
}

export default MobileDesignStudio