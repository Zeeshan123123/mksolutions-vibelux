"use client"
import { useEffect, useState } from 'react'
import { logger } from '@/lib/logging/production-logger';
import {
  Download,
  FileText,
  File,
  FileCode,
  Box,
  Grid3x3,
  Layers,
  Camera,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Upload,
  Eye,
  Lightbulb,
  Package,
  Zap,
  Calendar,
  Clock,
  Link,
  Mail,
  Globe,
  Server,
  History,
  Play,
  Pause,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react'

interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: React.FC<any>
  category: 'photometric' | 'cad' | '3d' | 'data' | 'report'
  available: boolean
}

interface ExportOptions {
  format: string
  includeMetadata: boolean
  units: 'metric' | 'imperial'
  precision: 'low' | 'medium' | 'high'
  compression: boolean
  customSettings: { [key: string]: any }
}

interface ScheduledReport {
  id: string
  name: string
  format: string
  frequency: 'daily' | 'weekly' | 'monthly'
  nextRun: string
  recipients: string[]
  webhookUrl?: string
  isActive: boolean
  lastRun?: string
  createdAt: string
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  headers: { [key: string]: string }
  isActive: boolean
  lastTriggered?: string
  successCount: number
  failureCount: number
}

interface ExportHistory {
  id: string
  format: string
  fileName: string
  fileSize: string
  timestamp: string
  status: 'success' | 'failed' | 'processing'
  downloadUrl?: string
}

interface PhotometricData {
  luminousIntensity: number[][]
  angles: { vertical: number[], horizontal: number[] }
  lumens: number
  watts: number
  efficacy: number
  cct?: number
  cri?: number
  manufacturer: string
  model: string
  description: string
}

export function AdvancedExportCenter() {
  const [selectedFormat, setSelectedFormat] = useState<string>('ies')
  const [activeTab, setActiveTab] = useState<'export' | 'scheduled' | 'webhooks' | 'history'>('export')
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'ies',
    includeMetadata: true,
    units: 'metric',
    precision: 'high',
    compression: false,
    customSettings: {}
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly Performance Report',
      format: 'pdf',
      frequency: 'weekly',
      nextRun: '2024-07-26T09:00:00Z',
      recipients: ['admin@vibelux.ai', 'reports@company.com'],
      isActive: true,
      lastRun: '2024-07-19T09:00:00Z',
      createdAt: '2024-07-01T12:00:00Z'
    },
    {
      id: '2',
      name: 'Monthly Energy Analytics',
      format: 'excel',
      frequency: 'monthly',
      nextRun: '2024-08-01T08:00:00Z',
      recipients: ['energy@vibelux.ai'],
      webhookUrl: 'https://api.company.com/reports',
      isActive: true,
      createdAt: '2024-06-15T10:00:00Z'
    }
  ])
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Analytics Dashboard',
      url: 'https://dashboard.company.com/webhook',
      events: ['export_complete', 'report_generated'],
      headers: { 'Authorization': 'Bearer xxx', 'Content-Type': 'application/json' },
      isActive: true,
      lastTriggered: '2024-07-19T14:30:00Z',
      successCount: 127,
      failureCount: 3
    },
    {
      id: '2',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/xxx',
      events: ['export_failed', 'schedule_failed'],
      headers: { 'Content-Type': 'application/json' },
      isActive: true,
      successCount: 45,
      failureCount: 0
    }
  ])
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      try {
        setHistoryLoading(true)
        const res = await fetch('/api/exports?limit=100')
        const data = await res.json().catch(() => ({}))
        if (res.ok && Array.isArray(data?.exports)) {
          const list: ExportHistory[] = data.exports.map((e: any) => ({
            id: e.id,
            format: (e.format || 'file').toUpperCase(),
            fileName: e.fileName || `${e.id}.${e.format || 'zip'}`,
            fileSize: e.fileSize ? humanFileSize(e.fileSize) : '-',
            timestamp: e.createdAt || new Date().toISOString(),
            status: e.status === 'completed' ? 'success' : (e.status === 'failed' ? 'failed' : 'processing'),
            downloadUrl: e.downloadUrl
          }))
          setExportHistory(list)
        } else {
          setExportHistory([])
        }
      } finally {
        setHistoryLoading(false)
      }
    })()
  }, [])

  function humanFileSize(bytes: number): string {
    if (!bytes || isNaN(bytes as any)) return '-'
    const thresh = 1024
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B'
    }
    const units = ['KB', 'MB', 'GB', 'TB']
    let u = -1
    do {
      bytes /= thresh
      ++u
    } while (Math.abs(bytes) >= thresh && u < units.length - 1)
    return bytes.toFixed(1) + ' ' + units[u]
  }

  const exportFormats: ExportFormat[] = [
    // Photometric Formats
    {
      id: 'ies',
      name: 'IES (LM-63)',
      extension: '.ies',
      description: 'IESNA standard photometric file format',
      icon: Lightbulb,
      category: 'photometric',
      available: true
    },
    {
      id: 'eulumdat',
      name: 'EULUMDAT',
      extension: '.ldt',
      description: 'European photometric data format',
      icon: Lightbulb,
      category: 'photometric',
      available: true
    },
    {
      id: 'cie102',
      name: 'CIE 102',
      extension: '.cie',
      description: 'CIE standard photometric format',
      icon: Lightbulb,
      category: 'photometric',
      available: true
    },
    
    // CAD Formats
    {
      id: 'dwg',
      name: 'AutoCAD DWG',
      extension: '.dwg',
      description: '2D/3D CAD drawing format',
      icon: FileCode,
      category: 'cad',
      available: true
    },
    {
      id: 'dxf',
      name: 'AutoCAD DXF',
      extension: '.dxf',
      description: 'Drawing exchange format',
      icon: FileCode,
      category: 'cad',
      available: true
    },
    {
      id: 'revit',
      name: 'Revit Family',
      extension: '.rfa',
      description: 'BIM family file for Revit',
      icon: Box,
      category: 'cad',
      available: true
    },
    
    // 3D Formats
    {
      id: 'obj',
      name: 'Wavefront OBJ',
      extension: '.obj',
      description: '3D model with materials',
      icon: Box,
      category: '3d',
      available: true
    },
    {
      id: 'fbx',
      name: 'Autodesk FBX',
      extension: '.fbx',
      description: '3D model with animations',
      icon: Box,
      category: '3d',
      available: true
    },
    {
      id: 'gltf',
      name: 'glTF 2.0',
      extension: '.gltf',
      description: 'GL Transmission Format',
      icon: Box,
      category: '3d',
      available: true
    },
    
    // Lighting Software
    {
      id: 'agi32',
      name: 'AGi32',
      extension: '.agi',
      description: 'AGi32 calculation file',
      icon: Grid3x3,
      category: 'data',
      available: true
    },
    {
      id: 'dialux',
      name: 'DIALux',
      extension: '.dlx',
      description: 'DIALux project file',
      icon: Grid3x3,
      category: 'data',
      available: true
    },
    {
      id: 'relux',
      name: 'Relux',
      extension: '.rlx',
      description: 'Relux project format',
      icon: Grid3x3,
      category: 'data',
      available: true
    }
  ]

  // Sample photometric data
  const samplePhotometricData: PhotometricData = {
    luminousIntensity: generateSampleIntensityData(),
    angles: {
      vertical: Array.from({ length: 37 }, (_, i) => i * 5), // 0-180 degrees
      horizontal: Array.from({ length: 24 }, (_, i) => i * 15) // 0-360 degrees
    },
    lumens: 12500,
    watts: 150,
    efficacy: 83.3,
    cct: 4000,
    cri: 85,
    manufacturer: 'Vibelux',
    model: 'VBX-LED-150W',
    description: 'High efficiency horticultural LED fixture'
  }

  function generateSampleIntensityData(): number[][] {
    // Generate realistic intensity distribution
    const data: number[][] = []
    for (let v = 0; v <= 180; v += 5) {
      const row: number[] = []
      for (let h = 0; h < 360; h += 15) {
        // Lambertian distribution with some variation
        const intensity = 1000 * Math.cos((v * Math.PI) / 180) * (1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1)
        row.push(Math.max(0, intensity))
      }
      data.push(row)
    }
    return data
  }

  const generateIESContent = (data: PhotometricData): string => {
    const lines: string[] = []
    
    // IES Header
    lines.push('IESNA:LM-63-2002')
    lines.push(`[TEST] ${data.model}`)
    lines.push(`[MANUFAC] ${data.manufacturer}`)
    lines.push(`[LUMCAT] ${data.description}`)
    lines.push(`[LUMINAIRE] ${data.model}`)
    lines.push('[LAMPCAT] LED')
    lines.push(`[LAMP] LED ${data.watts}W`)
    lines.push('')
    
    // Tilt information
    lines.push('TILT=NONE')
    lines.push('')
    
    // Photometric data
    lines.push('1') // Number of lamps
    lines.push(data.lumens.toString()) // Lumens per lamp
    lines.push('1.0') // Candela multiplier
    lines.push(data.angles.vertical.length.toString()) // Number of vertical angles
    lines.push(data.angles.horizontal.length.toString()) // Number of horizontal angles
    lines.push('1') // Photometric type (1 = Type C)
    lines.push('2') // Units (2 = meters)
    lines.push('0 0 0') // Luminaire dimensions
    
    // Ballast information
    lines.push('1.0 1.0 0.0')
    
    // Angles
    lines.push(data.angles.vertical.join(' '))
    lines.push(data.angles.horizontal.join(' '))
    
    // Intensity values
    for (let h = 0; h < data.angles.horizontal.length; h++) {
      const values: number[] = []
      for (let v = 0; v < data.angles.vertical.length; v++) {
        values.push(data.luminousIntensity[v][h])
      }
      lines.push(values.map(v => v.toFixed(1)).join(' '))
    }
    
    return lines.join('\n')
  }

  const generateEULUMDATContent = (data: PhotometricData): string => {
    const lines: string[] = []
    
    // EULUMDAT Header
    lines.push(data.manufacturer)
    lines.push('1') // Type indicator
    lines.push('0') // Symmetry
    lines.push(data.angles.horizontal.length.toString()) // Mc
    lines.push((data.angles.horizontal[1] - data.angles.horizontal[0]).toString()) // Dc
    lines.push(data.angles.vertical.length.toString()) // Ng
    lines.push((data.angles.vertical[1] - data.angles.vertical[0]).toString()) // Dg
    lines.push('1') // Measurement report number
    lines.push(data.model) // Luminaire name
    lines.push(data.description) // Luminaire number
    lines.push('') // File name
    lines.push('') // Date/user
    
    // Dimensions and lamp data
    lines.push('400 400 150') // Length, width, height
    lines.push('1.0 1.0 1.0 1.0') // Length/diameter of luminous area
    lines.push('0 0 -100') // Downward flux, light output ratio, conversion factor
    lines.push('1') // Number of lamps
    lines.push('1') // Number of lamp types
    lines.push(`LED ${data.watts}W`) // Lamp type
    lines.push(data.lumens.toString()) // Total flux of lamps
    
    // Add more EULUMDAT specific data...
    
    return lines.join('\r\n')
  }

  const generateDXFContent = (): string => {
    // Simplified DXF generation for fixture outline
    const dxf: string[] = []
    
    // DXF Header
    dxf.push('0\nSECTION\n2\nHEADER')
    dxf.push('9\n$ACADVER\n1\nAC1024') // AutoCAD 2010
    dxf.push('9\n$INSUNITS\n70\n4') // Millimeters
    dxf.push('0\nENDSEC')
    
    // DXF Tables
    dxf.push('0\nSECTION\n2\nTABLES')
    dxf.push('0\nTABLE\n2\nLTYPE\n70\n1')
    dxf.push('0\nLTYPE\n2\nCONTINUOUS\n70\n0\n3\nSolid line\n72\n65\n73\n0\n40\n0.0')
    dxf.push('0\nENDTAB\n0\nENDSEC')
    
    // DXF Entities
    dxf.push('0\nSECTION\n2\nENTITIES')
    
    // Draw fixture rectangle
    dxf.push('0\nLWPOLYLINE\n8\n0\n90\n4\n70\n1') // Closed polyline with 4 vertices
    dxf.push('10\n0\n20\n0') // Vertex 1
    dxf.push('10\n600\n20\n0') // Vertex 2
    dxf.push('10\n600\n20\n100') // Vertex 3
    dxf.push('10\n0\n20\n100') // Vertex 4
    
    dxf.push('0\nENDSEC\n0\nEOF')
    
    return dxf.join('\n')
  }

  const generateOBJContent = (): string => {
    // Simple OBJ file for a fixture box
    const obj: string[] = []
    
    obj.push('# Vibelux Fixture Model')
    obj.push('# Generated by Vibelux Export Center')
    obj.push('')
    
    // Vertices
    obj.push('# Vertices')
    obj.push('v -0.3 -0.05 -0.05')
    obj.push('v 0.3 -0.05 -0.05')
    obj.push('v 0.3 0.05 -0.05')
    obj.push('v -0.3 0.05 -0.05')
    obj.push('v -0.3 -0.05 0.05')
    obj.push('v 0.3 -0.05 0.05')
    obj.push('v 0.3 0.05 0.05')
    obj.push('v -0.3 0.05 0.05')
    obj.push('')
    
    // Texture coordinates
    obj.push('# Texture coordinates')
    obj.push('vt 0 0')
    obj.push('vt 1 0')
    obj.push('vt 1 1')
    obj.push('vt 0 1')
    obj.push('')
    
    // Normals
    obj.push('# Normals')
    obj.push('vn 0 0 -1')
    obj.push('vn 0 0 1')
    obj.push('vn 0 -1 0')
    obj.push('vn 1 0 0')
    obj.push('vn 0 1 0')
    obj.push('vn -1 0 0')
    obj.push('')
    
    // Faces
    obj.push('# Faces')
    obj.push('f 1/1/1 2/2/1 3/3/1 4/4/1')
    obj.push('f 5/1/2 8/2/2 7/3/2 6/4/2')
    obj.push('f 1/1/3 5/2/3 6/3/3 2/4/3')
    obj.push('f 2/1/4 6/2/4 7/3/4 3/4/4')
    obj.push('f 3/1/5 7/2/5 8/3/5 4/4/5')
    obj.push('f 5/1/6 1/2/6 4/3/6 8/4/6')
    
    return obj.join('\n')
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      let content = ''
      let filename = `vibelux_export_${Date.now()}`
      
      switch (selectedFormat) {
        case 'ies':
          content = generateIESContent(samplePhotometricData)
          filename += '.ies'
          break
        case 'eulumdat':
          content = generateEULUMDATContent(samplePhotometricData)
          filename += '.ldt'
          break
        case 'dxf':
          content = generateDXFContent()
          filename += '.dxf'
          break
        case 'obj':
          content = generateOBJContent()
          filename += '.obj'
          break
        default:
          content = JSON.stringify(samplePhotometricData, null, 2)
          filename += '.json'
      }
      
      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (error) {
      logger.error('system', 'Export failed:', error )
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const getCategoryFormats = (category: string) => {
    return exportFormats.filter(f => f.category === category)
  }

  const toggleScheduledReport = (id: string) => {
    setScheduledReports(prev => prev.map(report => 
      report.id === id ? { ...report, isActive: !report.isActive } : report
    ))
  }

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, isActive: !webhook.isActive } : webhook
    ))
  }

  const deleteScheduledReport = (id: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id))
  }

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id))
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'export':
        return renderExportTab()
      case 'scheduled':
        return renderScheduledTab()
      case 'webhooks':
        return renderWebhooksTab()
      case 'history':
        return renderHistoryTab()
      default:
        return renderExportTab()
    }
  }

  const renderExportTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Format Selection */}
      <div className="lg:col-span-2 space-y-6">
        {/* Photometric Formats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Photometric Data Formats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {getCategoryFormats('photometric').map(format => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === format.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                disabled={!format.available}
              >
                <format.icon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <h3 className="font-medium text-gray-100">{format.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{format.extension}</p>
                {!format.available && (
                  <p className="text-xs text-red-400 mt-2">Coming Soon</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CAD Formats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            CAD & BIM Formats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {getCategoryFormats('cad').map(format => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === format.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                disabled={!format.available}
              >
                <format.icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-medium text-gray-100">{format.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{format.extension}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Formats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-green-400" />
            3D Model Formats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {getCategoryFormats('3d').map(format => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === format.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                disabled={!format.available}
              >
                <format.icon className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-medium text-gray-100">{format.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{format.extension}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-6">
        {/* Format Details */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Format Details</h3>
          {exportFormats.find(f => f.id === selectedFormat) && (
            <div>
              <h4 className="font-medium text-gray-100">
                {exportFormats.find(f => f.id === selectedFormat)?.name}
              </h4>
              <p className="text-sm text-gray-400 mt-2">
                {exportFormats.find(f => f.id === selectedFormat)?.description}
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Industry standard format</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Compatible with major software</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Preserves all metadata</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Export Options
          </h3>
          
          <div className="space-y-4">
            {/* Units */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Units</label>
              <select
                value={exportOptions.units}
                onChange={(e) => setExportOptions({ ...exportOptions, units: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>

            {/* Precision */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Precision</label>
              <select
                value={exportOptions.precision}
                onChange={(e) => setExportOptions({ ...exportOptions, precision: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
              >
                <option value="low">Low (1 decimal)</option>
                <option value="medium">Medium (2 decimals)</option>
                <option value="high">High (3 decimals)</option>
              </select>
            </div>

            {/* Include Metadata */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400">Include Metadata</label>
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
            </div>

            {/* Compression */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400">Compress Output</label>
              <input
                type="checkbox"
                checked={exportOptions.compression}
                onChange={(e) => setExportOptions({ ...exportOptions, compression: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-1">Export Tips</p>
              <ul className="space-y-1 text-xs">
                <li>• IES files are best for lighting analysis</li>
                <li>• DWG/DXF for CAD integration</li>
                <li>• OBJ/FBX for 3D visualization</li>
                <li>• Include metadata for traceability</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderScheduledTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Scheduled Reports</h2>
          <p className="text-gray-400 text-sm mt-1">Automate report generation and delivery</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Scheduled Reports List */}
      <div className="space-y-4">
        {scheduledReports.map(report => (
          <div key={report.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-100 mb-1">{report.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {report.format.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {report.frequency}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {report.recipients.length} recipients
                  </span>
                  {report.webhookUrl && (
                    <span className="flex items-center gap-1">
                      <Link className="w-4 h-4" />
                      Webhook
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleScheduledReport(report.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    report.isActive 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                  title={report.isActive ? 'Pause' : 'Resume'}
                >
                  {report.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => deleteScheduledReport(report.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Next Run:</span>
                <p className="text-gray-100 font-medium">
                  {new Date(report.nextRun).toLocaleDateString()} at {new Date(report.nextRun).toLocaleTimeString()}
                </p>
              </div>
              {report.lastRun && (
                <div>
                  <span className="text-gray-400">Last Run:</span>
                  <p className="text-gray-100 font-medium">
                    {new Date(report.lastRun).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-400">Status:</span>
                <p className={`font-medium ${
                  report.isActive ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {report.isActive ? 'Active' : 'Paused'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-gray-400 text-sm">Recipients:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {report.recipients.map((email, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    {email}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Webhook Integrations</h2>
          <p className="text-gray-400 text-sm mt-1">Send real-time notifications to external systems</p>
        </div>
        <button
          onClick={() => setShowWebhookModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map(webhook => (
          <div key={webhook.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-100 mb-1">{webhook.name}</h3>
                <p className="text-sm text-gray-400 font-mono">{webhook.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWebhook(webhook.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    webhook.isActive 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                  title={webhook.isActive ? 'Disable' : 'Enable'}
                >
                  {webhook.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => deleteWebhook(webhook.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-400">Status:</span>
                <p className={`font-medium ${
                  webhook.isActive ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {webhook.isActive ? 'Active' : 'Disabled'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Success Rate:</span>
                <p className="text-gray-100 font-medium">
                  {Math.round((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100)}%
                </p>
              </div>
              {webhook.lastTriggered && (
                <div>
                  <span className="text-gray-400">Last Triggered:</span>
                  <p className="text-gray-100 font-medium">
                    {new Date(webhook.lastTriggered).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-gray-400 text-sm">Events:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {webhook.events.map((event, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-700/50 rounded p-3">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Successful</span>
                </div>
                <p className="text-xl font-bold text-gray-100">{webhook.successCount}</p>
              </div>
              <div className="bg-gray-700/50 rounded p-3">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed</span>
                </div>
                <p className="text-xl font-bold text-gray-100">{webhook.failureCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Export History</h2>
          <p className="text-gray-400 text-sm mt-1">View and download previous exports</p>
        </div>
        <button
          onClick={async () => {
            try {
              setHistoryLoading(true)
              const res = await fetch('/api/exports?limit=100')
              const data = await res.json().catch(() => ({}))
              if (res.ok && Array.isArray(data?.exports)) {
                const list: ExportHistory[] = data.exports.map((e: any) => ({
                  id: e.id,
                  format: (e.format || 'file').toUpperCase(),
                  fileName: e.fileName || `${e.id}.${e.format || 'zip'}`,
                  fileSize: e.fileSize ? humanFileSize(e.fileSize) : '-',
                  timestamp: e.createdAt || new Date().toISOString(),
                  status: e.status === 'completed' ? 'success' : (e.status === 'failed' ? 'failed' : 'processing'),
                  downloadUrl: e.downloadUrl
                }))
                setExportHistory(list)
              }
            } finally {
              setHistoryLoading(false)
            }
          }}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-sm"
        >{historyLoading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      {/* History List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {exportHistory.map(item => (
                <tr key={item.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-100">{item.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{item.format}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{item.fileSize}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'success' 
                        ? 'bg-green-500/20 text-green-400'
                        : item.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status === 'success' && <CheckCircle className="w-3 h-3" />}
                      {item.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                      {item.status === 'processing' && <Clock className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.downloadUrl && item.status === 'success' ? (
                      <a href={item.downloadUrl} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Advanced Export Center</h1>
          <p className="text-gray-400">Export designs, schedule reports, and manage integrations</p>
        </div>
        {activeTab === 'export' && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'export', label: 'Export', icon: Download },
            { id: 'scheduled', label: 'Scheduled Reports', icon: Calendar },
            { id: 'webhooks', label: 'Webhooks', icon: Globe },
            { id: 'history', label: 'History', icon: History }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Export Progress */}
      {isExporting && activeTab === 'export' && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Export Progress</span>
            <span className="text-sm text-gray-100">{exportProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}