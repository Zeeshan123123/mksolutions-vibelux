"use client"

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logging/production-logger';
import { 
  Home,
  Camera,
  CheckSquare,
  AlertTriangle,
  Thermometer,
  Droplets,
  Sun,
  Menu,
  X,
  MapPin,
  Clock,
  Battery,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  LogOut,
  ChevronRight,
  Leaf,
  Activity,
  BarChart3,
  MessageSquare,
  Phone,
  Settings
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: any
  color: string
  action: () => void
}

interface ZoneStatus {
  id: string
  name: string
  temperature: number
  humidity: number
  lightLevel: number
  status: 'optimal' | 'warning' | 'critical'
  activeAlerts: number
  pendingTasks: number
}

interface RecentActivity {
  id: string
  type: 'task' | 'alert' | 'note'
  description: string
  timestamp: Date
  zone?: string
}

export function MobileFieldDashboard() {
  const [showMenu, setShowMenu] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced')
  const [currentUser] = useState({ name: 'John Doe', role: 'Grower' })

  // Quick actions for mobile users
  const quickActions: QuickAction[] = [
    {
      id: 'camera',
      label: 'Take Photo',
      icon: Camera,
      color: 'bg-blue-600',
      action: () => logger.info('system', 'Open camera')
    },
    {
      id: 'task',
      label: 'New Task',
      icon: CheckSquare,
      color: 'bg-green-600',
      action: () => logger.info('system', 'Create task')
    },
    {
      id: 'alert',
      label: 'Report Issue',
      icon: AlertTriangle,
      color: 'bg-red-600',
      action: () => logger.info('system', 'Report issue')
    },
    {
      id: 'note',
      label: 'Add Note',
      icon: MessageSquare,
      color: 'bg-purple-600',
      action: () => logger.info('system', 'Add note')
    }
  ]

  // Zone data
  const [zones] = useState<ZoneStatus[]>([
    {
      id: 'zone-1',
      name: 'Flower Room A',
      temperature: 24.5,
      humidity: 55,
      lightLevel: 650,
      status: 'optimal',
      activeAlerts: 0,
      pendingTasks: 3
    },
    {
      id: 'zone-2',
      name: 'Flower Room B',
      temperature: 26.8,
      humidity: 62,
      lightLevel: 680,
      status: 'warning',
      activeAlerts: 1,
      pendingTasks: 2
    },
    {
      id: 'zone-3',
      name: 'Veg Room 1',
      temperature: 25.2,
      humidity: 65,
      lightLevel: 450,
      status: 'optimal',
      activeAlerts: 0,
      pendingTasks: 1
    },
    {
      id: 'zone-4',
      name: 'Clone Room',
      temperature: 23.8,
      humidity: 75,
      lightLevel: 200,
      status: 'optimal',
      activeAlerts: 0,
      pendingTasks: 0
    }
  ])

  // Recent activity
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: 'activity-1',
      type: 'task',
      description: 'Completed IPM inspection',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      zone: 'Flower Room A'
    },
    {
      id: 'activity-2',
      type: 'alert',
      description: 'Temperature spike detected',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      zone: 'Flower Room B'
    },
    {
      id: 'activity-3',
      type: 'note',
      description: 'Yellowing on lower leaves, row 12',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      zone: 'Veg Room 1'
    }
  ])

  // Simulate online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Simulate battery level
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      })
    }
  }, [])

  const getZoneStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const handleSync = () => {
    setSyncStatus('syncing')
    setTimeout(() => {
      setSyncStatus('synced')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-lg font-semibold">VibeLux Field</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              
              {/* Battery */}
              <div className="flex items-center gap-1">
                <Battery className={`w-4 h-4 ${
                  batteryLevel > 50 ? 'text-green-400' :
                  batteryLevel > 20 ? 'text-yellow-400' :
                  'text-red-400'
                }`} />
                <span className="text-xs text-gray-400">{batteryLevel}%</span>
              </div>
              
              {/* Sync Status */}
              <button
                onClick={handleSync}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${
                  syncStatus === 'syncing' ? 'animate-spin text-blue-400' : 'text-gray-400'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Current Location Bar */}
        <div className="px-4 pb-3 flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Current Zone:</span>
          <span className="text-white font-medium">Flower Room A</span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMenu(false)}>
          <div className="absolute left-0 top-0 h-full w-72 bg-gray-900 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-gray-400">{currentUser.role}</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <Home className="w-5 h-5 text-gray-400" />
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <CheckSquare className="w-5 h-5 text-gray-400" />
                <span>My Tasks</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <Camera className="w-5 h-5 text-gray-400" />
                <span>Photo Log</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <Activity className="w-5 h-5 text-gray-400" />
                <span>Sensor Data</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Settings</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>Support</span>
              </a>
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
              <button className="flex items-center gap-3 p-3 w-full hover:bg-gray-800 rounded-lg transition-colors text-red-400">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-transform`}
            >
              <action.icon className="w-6 h-6 text-white" />
              <span className="text-sm font-medium text-white">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Zone Status Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Zone Status</h2>
          <div className="space-y-3">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className="w-full p-4 bg-gray-900 rounded-xl border border-gray-800 active:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getZoneStatusColor(zone.status)}`} />
                    <h3 className="font-medium text-white">{zone.name}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Thermometer className="w-4 h-4" />
                      <span>Temp</span>
                    </div>
                    <p className="text-white font-medium">{zone.temperature}°C</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Droplets className="w-4 h-4" />
                      <span>RH</span>
                    </div>
                    <p className="text-white font-medium">{zone.humidity}%</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Sun className="w-4 h-4" />
                      <span>PPFD</span>
                    </div>
                    <p className="text-white font-medium">{zone.lightLevel}</p>
                  </div>
                </div>
                
                {(zone.activeAlerts > 0 || zone.pendingTasks > 0) && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800">
                    {zone.activeAlerts > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">{zone.activeAlerts} alerts</span>
                      </div>
                    )}
                    {zone.pendingTasks > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400">{zone.pendingTasks} tasks</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'task' ? 'bg-green-500/20' :
                    activity.type === 'alert' ? 'bg-red-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {activity.type === 'task' ? <CheckSquare className="w-4 h-4 text-green-400" /> :
                     activity.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                     <MessageSquare className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      {activity.zone && (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>{activity.zone}</span>
                          <span>•</span>
                        </>
                      )}
                      <Clock className="w-3 h-3" />
                      <span>{activity.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-3xl font-bold text-green-400">12</p>
            <p className="text-sm text-gray-400 mt-1">Tasks Completed</p>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-3xl font-bold text-purple-400">4.2h</p>
            <p className="text-sm text-gray-400 mt-1">Time Logged</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-800 rounded-lg transition-colors">
            <Home className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-purple-400">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-800 rounded-lg transition-colors">
            <CheckSquare className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400">Tasks</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-800 rounded-lg transition-colors">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400">Stats</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-800 rounded-lg transition-colors">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}