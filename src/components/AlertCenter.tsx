"use client"

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logging/production-logger'
import { 
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Filter,
  Settings,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  Clock,
  User,
  Zap,
  Thermometer,
  Droplets,
  Sun
} from 'lucide-react'

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'system' | 'climate' | 'energy' | 'lighting' | 'health' | 'compliance'
  title: string
  message: string
  timestamp: Date
  source: string
  zone?: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  actions?: AlertAction[]
  metadata?: Record<string, any>
}

interface AlertAction {
  label: string
  action: string
  primary?: boolean
}

interface AlertFilter {
  types: string[]
  categories: string[]
  zones: string[]
  timeRange: 'all' | '24h' | '7d' | '30d'
  showResolved: boolean
}

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<AlertFilter>({
    types: ['critical', 'warning', 'info', 'success'],
    categories: ['system', 'climate', 'energy', 'lighting', 'health', 'compliance'],
    zones: [],
    timeRange: '24h',
    showResolved: false
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Sample alerts - in production, these would come from WebSocket/API
  useEffect(() => {
    const sampleAlerts: Alert[] = [
      {
        id: 'alert-1',
        type: 'critical',
        category: 'climate',
        title: 'Temperature Spike in Flower Room A',
        message: 'Temperature has exceeded 85°F for more than 15 minutes. Current: 87.3°F',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        source: 'Climate Control System',
        zone: 'flower-a',
        acknowledged: false,
        resolved: false,
        actions: [
          { label: 'Adjust HVAC', action: 'hvac_boost', primary: true },
          { label: 'View Trends', action: 'view_trends' }
        ],
        metadata: {
          currentTemp: 87.3,
          targetTemp: 75,
          duration: '17 minutes'
        }
      },
      {
        id: 'alert-2',
        type: 'warning',
        category: 'energy',
        title: 'Peak Demand Warning',
        message: 'Facility is approaching peak demand threshold. Consider load shedding.',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        source: 'Energy Management',
        acknowledged: true,
        acknowledgedBy: 'John D.',
        acknowledgedAt: new Date(Date.now() - 15 * 60 * 1000),
        resolved: false,
        actions: [
          { label: 'Shed Load', action: 'shed_load', primary: true },
          { label: 'Override', action: 'override' }
        ],
        metadata: {
          currentDemand: 485,
          peakLimit: 500,
          costImpact: '$1,250/month'
        }
      },
      {
        id: 'alert-3',
        type: 'warning',
        category: 'lighting',
        title: 'Fixture Degradation Detected',
        message: 'LED Array B2 showing 12% efficiency loss. Maintenance recommended.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: 'Lighting Monitor',
        zone: 'flower-b',
        acknowledged: true,
        acknowledgedBy: 'Sarah M.',
        acknowledgedAt: new Date(Date.now() - 90 * 60 * 1000),
        resolved: false,
        actions: [
          { label: 'Schedule Service', action: 'schedule_maintenance', primary: true },
          { label: 'View History', action: 'view_history' }
        ]
      },
      {
        id: 'alert-4',
        type: 'info',
        category: 'health',
        title: 'Facility Health Score Update',
        message: 'Health score improved to 92/100. Energy efficiency up 3%.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        source: 'Health Monitor',
        acknowledged: true,
        acknowledgedBy: 'System',
        acknowledgedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        resolved: true,
        resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 'alert-5',
        type: 'success',
        category: 'system',
        title: 'Backup Completed Successfully',
        message: 'Daily backup completed. 142GB backed up to cloud storage.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        source: 'Backup System',
        acknowledged: true,
        acknowledgedBy: 'System',
        acknowledgedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolved: true,
        resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ]
    
    setAlerts(sampleAlerts)
    setUnreadCount(sampleAlerts.filter(a => !a.acknowledged).length)
  }, [])

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (!filter.types.includes(alert.type)) return false
    if (!filter.categories.includes(alert.category)) return false
    if (!filter.showResolved && alert.resolved) return false
    
    // Time range filter
    const now = Date.now()
    const alertTime = alert.timestamp.getTime()
    if (filter.timeRange === '24h' && now - alertTime > 24 * 60 * 60 * 1000) return false
    if (filter.timeRange === '7d' && now - alertTime > 7 * 24 * 60 * 60 * 1000) return false
    if (filter.timeRange === '30d' && now - alertTime > 30 * 24 * 60 * 60 * 1000) return false
    
    return true
  })

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'climate': return <Thermometer className="w-5 h-5" />
      case 'energy': return <Zap className="w-5 h-5" />
      case 'lighting': return <Sun className="w-5 h-5" />
      case 'health': return <AlertCircle className="w-5 h-5" />
      case 'compliance': return <Info className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-800'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-800'
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-800'
      case 'success': return 'text-green-400 bg-green-500/20 border-green-800'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-800'
    }
  }

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            acknowledged: true, 
            acknowledgedBy: 'Current User',
            acknowledgedAt: new Date()
          }
        : alert
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            resolved: true, 
            resolvedBy: 'Current User',
            resolvedAt: new Date()
          }
        : alert
    ))
  }

  const handleAction = (alert: Alert, action: string) => {
    logger.info('system', `Executing action ${action} for alert ${alert.id}`)
    
    switch (action) {
      case 'hvac_boost':
        // Simulate HVAC boost action
        alert.message = `HVAC boosted to cool down. Target: ${alert.metadata?.targetTemp}°F`
        alert.acknowledged = true
        alert.acknowledgedBy = 'System Auto-Response'
        alert.acknowledgedAt = new Date()
        setAlerts(prev => prev.map(a => a.id === alert.id ? {...alert} : a))
        break
        
      case 'view_trends':
        // Navigate to trends page
        window.open('/monitoring/environmental-rtr', '_blank')
        break
        
      case 'shed_load':
        // Simulate load shedding
        alert.message = 'Load shedding activated. Non-critical systems reduced by 15%'
        alert.acknowledged = true
        alert.acknowledgedBy = 'Energy Management'
        alert.acknowledgedAt = new Date()
        setAlerts(prev => prev.map(a => a.id === alert.id ? {...alert} : a))
        break
        
      case 'override':
        // Override the warning
        alert.message = 'Peak demand warning overridden. Monitoring continues.'
        alert.acknowledged = true
        alert.acknowledgedBy = 'User Override'
        alert.acknowledgedAt = new Date()
        setAlerts(prev => prev.map(a => a.id === alert.id ? {...alert} : a))
        break
        
      case 'schedule_maintenance':
        // Schedule maintenance
        alert.message = 'Maintenance scheduled for LED Array B2. Service ticket #MT-2024-001 created.'
        alert.acknowledged = true
        alert.acknowledgedBy = 'Maintenance System'
        alert.acknowledgedAt = new Date()
        setAlerts(prev => prev.map(a => a.id === alert.id ? {...alert} : a))
        break
        
      case 'view_history':
        // Navigate to fixture history
        window.open('/monitoring/fixtures/history', '_blank')
        break
        
      case 'acknowledge':
        // Mark as acknowledged
        alert.acknowledged = true
        alert.acknowledgedBy = 'User'
        alert.acknowledgedAt = new Date()
        setAlerts(prev => prev.map(a => a.id === alert.id ? {...alert} : a))
        break
        
      case 'resolve':
        // Mark as resolved
        alert.resolved = true
        alert.resolvedBy = 'User'
        alert.resolvedAt = new Date()
        setAlerts(prev => prev.map(a => a.id === alert.id ? {...alert} : a))
        break
        
      default:
        logger.warn('system', `Action ${action} not implemented yet`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Alert Center</h2>
              <p className="text-sm text-gray-400 mt-1">
                {filteredAlerts.length} active alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filter.timeRange}
            onChange={(e) => setFilter(prev => ({ ...prev, timeRange: e.target.value as any }))}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white cursor-pointer">
            <input
              type="checkbox"
              checked={filter.showResolved}
              onChange={(e) => setFilter(prev => ({ ...prev, showResolved: e.target.checked }))}
              className="rounded"
            />
            Show Resolved
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Types:</span>
            {['critical', 'warning', 'info', 'success'].map(type => (
              <label key={type} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.types.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilter(prev => ({ ...prev, types: [...prev.types, type] }))
                    } else {
                      setFilter(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }))
                    }
                  }}
                  className="rounded"
                />
                <span className={`text-xs ${
                  type === 'critical' ? 'text-red-400' :
                  type === 'warning' ? 'text-yellow-400' :
                  type === 'info' ? 'text-blue-400' :
                  'text-green-400'
                }`}>
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-gray-900 rounded-xl border p-4 transition-all ${
              getAlertColor(alert.type)
            } ${!alert.acknowledged ? 'ring-2 ring-opacity-50' : ''}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${getAlertColor(alert.type)} flex-shrink-0`}>
                  {getAlertIcon(alert.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <h3 className="font-medium text-white break-words">{alert.title}</h3>
                    {alert.zone && (
                      <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded w-fit">
                        {alert.zone}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2 break-words">{alert.message}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="break-words">{alert.source}</span>
                    {alert.acknowledgedBy && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 flex-shrink-0" />
                        Ack by {alert.acknowledgedBy}
                      </span>
                    )}
                  </div>

                  {alert.metadata && (
                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(alert.metadata).map(([key, value]) => (
                          <span key={key} className="flex-shrink-0">
                            <span className="text-gray-500">{key}:</span> 
                            <span className="text-gray-300 ml-1">{value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.actions && !alert.resolved && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {alert.actions.map((action) => (
                        <button
                          key={action.action}
                          onClick={() => handleAction(alert, action.action)}
                          className={`px-3 py-1 rounded text-sm transition-colors flex-shrink-0 ${
                            action.primary
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                    title="Acknowledge"
                  >
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {alert.acknowledged && !alert.resolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
                  >
                    Resolve
                  </button>
                )}
                {alert.resolved && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No alerts matching your filters</p>
        </div>
      )}

      {/* Alert Statistics */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Alert Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">
              {alerts.filter(a => a.type === 'critical' && !a.resolved).length}
            </p>
            <p className="text-sm text-gray-400">Critical</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {alerts.filter(a => a.type === 'warning' && !a.resolved).length}
            </p>
            <p className="text-sm text-gray-400">Warnings</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              {alerts.filter(a => !a.acknowledged).length}
            </p>
            <p className="text-sm text-gray-400">Unacknowledged</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {alerts.filter(a => a.resolved).length}
            </p>
            <p className="text-sm text-gray-400">Resolved Today</p>
          </div>
        </div>
      </div>
    </div>
  )
}