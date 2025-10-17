"use client"

import { useState, useEffect } from 'react'
import { 
  Wifi,
  WifiOff,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Settings,
  Plus,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Database,
  Cpu,
  Radio,
  Gauge
} from 'lucide-react'

interface Sensor {
  id: string
  name: string
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec' | 'flow' | 'pressure'
  manufacturer: string
  model: string
  serialNumber: string
  location: string
  zone: string
  status: 'online' | 'offline' | 'warning' | 'error'
  connectionType: 'wifi' | 'lora' | 'zigbee' | 'ethernet' | 'rs485'
  lastReading?: {
    value: number
    unit: string
    timestamp: Date
  }
  batteryLevel?: number
  signalStrength?: number
  calibration: {
    lastCalibrated: Date
    nextCalibration: Date
    offset: number
  }
  alerts: {
    minThreshold?: number
    maxThreshold?: number
    enabled: boolean
  }
  metadata: {
    installDate: Date
    firmware: string
    ipAddress?: string
    macAddress?: string
  }
}

interface SensorReading {
  sensorId: string
  timestamp: Date
  value: number
  quality: 'good' | 'questionable' | 'bad'
}

interface Gateway {
  id: string
  name: string
  type: 'lora' | 'zigbee' | 'wifi' | 'modbus'
  status: 'online' | 'offline'
  connectedSensors: number
  ipAddress: string
  firmware: string
  lastSeen: Date
}

export function SensorIntegrationHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'gateways' | 'data' | 'settings'>('overview')
  const [selectedRadio, setSelectedSensor] = useState<Radio | null>(null)
  const [showAddRadio, setShowAddSensor] = useState(false)
  const [realtimeData, setRealtimeData] = useState<Record<string, SensorReading[]>>({})

  // Sample sensors
  const [sensors] = useState<Radio[]>([
    {
      id: 'sensor-1',
      name: 'Flower Room A - Temp/RH',
      type: 'temperature',
      manufacturer: 'Onset',
      model: 'HOBO MX2301A',
      serialNumber: 'MX2301A-1234',
      location: 'Flower Room A - Canopy Level',
      zone: 'flower-a',
      status: 'online',
      connectionType: 'wifi',
      lastReading: {
        value: 24.3,
        unit: '°C',
        timestamp: new Date()
      },
      batteryLevel: 87,
      signalStrength: -52,
      calibration: {
        lastCalibrated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextCalibration: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        offset: 0.2
      },
      alerts: {
        minThreshold: 20,
        maxThreshold: 28,
        enabled: true
      },
      metadata: {
        installDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        firmware: 'v3.2.1',
        ipAddress: '192.168.1.101',
        macAddress: 'AA:BB:CC:DD:EE:01'
      }
    },
    {
      id: 'sensor-2',
      name: 'Flower Room A - CO2',
      type: 'co2',
      manufacturer: 'SenseAir',
      model: 'S8',
      serialNumber: 'S8-5678',
      location: 'Flower Room A - Center',
      zone: 'flower-a',
      status: 'online',
      connectionType: 'rs485',
      lastReading: {
        value: 1150,
        unit: 'ppm',
        timestamp: new Date()
      },
      calibration: {
        lastCalibrated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextCalibration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        offset: 0
      },
      alerts: {
        minThreshold: 800,
        maxThreshold: 1500,
        enabled: true
      },
      metadata: {
        installDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        firmware: 'v2.1.0'
      }
    },
    {
      id: 'sensor-3',
      name: 'Veg Room - PAR Sensor',
      type: 'light',
      manufacturer: 'Apogee',
      model: 'SQ-500',
      serialNumber: 'SQ500-9012',
      location: 'Vegetative Room - Canopy',
      zone: 'veg-1',
      status: 'warning',
      connectionType: 'ethernet',
      lastReading: {
        value: 425,
        unit: 'μmol/m²/s',
        timestamp: new Date()
      },
      calibration: {
        lastCalibrated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextCalibration: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Overdue
        offset: -5
      },
      alerts: {
        minThreshold: 200,
        maxThreshold: 800,
        enabled: true
      },
      metadata: {
        installDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
        firmware: 'v1.4.2',
        ipAddress: '192.168.1.102'
      }
    },
    {
      id: 'sensor-4',
      name: 'Irrigation Tank - pH',
      type: 'ph',
      manufacturer: 'BlueLab',
      model: 'Guardian Monitor',
      serialNumber: 'BLG-3456',
      location: 'Mixing Room - Tank 1',
      zone: 'irrigation',
      status: 'offline',
      connectionType: 'wifi',
      lastReading: {
        value: 6.2,
        unit: 'pH',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      signalStrength: -88,
      calibration: {
        lastCalibrated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextCalibration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        offset: 0.1
      },
      alerts: {
        minThreshold: 5.5,
        maxThreshold: 6.5,
        enabled: true
      },
      metadata: {
        installDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        firmware: 'v4.0.1',
        ipAddress: '192.168.1.103',
        macAddress: 'AA:BB:CC:DD:EE:03'
      }
    }
  ])

  // Sample gateways
  const [gateways] = useState<Gateway[]>([
    {
      id: 'gw-1',
      name: 'Main LoRa Gateway',
      type: 'lora',
      status: 'online',
      connectedSensors: 24,
      ipAddress: '192.168.1.10',
      firmware: 'v2.3.0',
      lastSeen: new Date()
    },
    {
      id: 'gw-2',
      name: 'Zigbee Coordinator',
      type: 'zigbee',
      status: 'online',
      connectedSensors: 16,
      ipAddress: '192.168.1.11',
      firmware: 'v3.1.2',
      lastSeen: new Date()
    },
    {
      id: 'gw-3',
      name: 'Modbus Gateway',
      type: 'modbus',
      status: 'offline',
      connectedSensors: 0,
      ipAddress: '192.168.1.12',
      firmware: 'v1.5.0',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000)
    }
  ])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: Record<string, SensorReading[]> = {}
      
      sensors.forEach(sensor => {
        if (sensor.status === 'online' && sensor.lastReading) {
          const variation = sensor.type === 'temperature' ? 0.5 :
                          sensor.type === 'humidity' ? 2 :
                          sensor.type === 'co2' ? 50 :
                          sensor.type === 'light' ? 20 : 0.1
          
          const newReading: SensorReading = {
            sensorId: sensor.id,
            timestamp: new Date(),
            value: sensor.lastReading.value + (Math.random() - 0.5) * variation,
            quality: 'good'
          }
          
          if (!newData[sensor.id]) {
            newData[sensor.id] = []
          }
          newData[sensor.id].push(newReading)
        }
      })
      
      setRealtimeData(prev => {
        const updated = { ...prev }
        Object.entries(newData).forEach(([sensorId, readings]) => {
          if (!updated[sensorId]) {
            updated[sensorId] = []
          }
          updated[sensorId] = [...updated[sensorId], ...readings].slice(-50) // Keep last 50 readings
        })
        return updated
      })
    }, 5000)
    
    return () => clearInterval(interval)
  }, [sensors])

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-5 h-5" />
      case 'humidity': return <Droplets className="w-5 h-5" />
      case 'co2': return <Wind className="w-5 h-5" />
      case 'light': return <Sun className="w-5 h-5" />
      case 'ph': return <Activity className="w-5 h-5" />
      case 'ec': return <Gauge className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/20'
      case 'offline': return 'text-red-400 bg-red-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'error': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'wifi': return <Wifi className="w-4 h-4" />
      case 'lora': return <Radio className="w-4 h-4" />
      case 'zigbee': return <Radio className="w-4 h-4" />
      case 'ethernet': return <Cpu className="w-4 h-4" />
      case 'rs485': return <Cpu className="w-4 h-4" />
      default: return <Wifi className="w-4 h-4" />
    }
  }

  // Calculate metrics
  const totalSensors = sensors.length
  const onlineSensors = sensors.filter(s => s.status === 'online').length
  const offlineSensors = sensors.filter(s => s.status === 'offline').length
  const warningSensors = sensors.filter(s => s.status === 'warning').length
  const calibrationDue = sensors.filter(s => s.calibration.nextCalibration < new Date()).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Sensor Integration Hub</h2>
            <p className="text-sm text-gray-400 mt-1">
              Manage and monitor all facility sensors
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setShowAddSensor(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Sensor
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['overview', 'sensors', 'gateways', 'data', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Total Sensors</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalSensors}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Online</span>
              </div>
              <p className="text-2xl font-bold text-white">{onlineSensors}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-sm text-gray-400">Offline</span>
              </div>
              <p className="text-2xl font-bold text-white">{offlineSensors}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Warnings</span>
              </div>
              <p className="text-2xl font-bold text-white">{warningSensors}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-400">Cal. Due</span>
              </div>
              <p className="text-2xl font-bold text-white">{calibrationDue}</p>
            </div>
          </div>

          {/* Recent Readings */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Live Sensor Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sensors.filter(s => s.status === 'online').map(sensor => {
                const latestReading = realtimeData[sensor.id]?.[realtimeData[sensor.id].length - 1]
                const trend = realtimeData[sensor.id]?.length > 1 
                  ? latestReading?.value > realtimeData[sensor.id][realtimeData[sensor.id].length - 2].value
                  : null

                return (
                  <div key={sensor.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSensorIcon(sensor.type)}
                        <span className="text-sm text-gray-400">{sensor.name}</span>
                      </div>
                      {trend !== null && (
                        trend ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {latestReading?.value.toFixed(1) || sensor.lastReading?.value}
                      <span className="text-sm font-normal text-gray-400 ml-1">
                        {sensor.lastReading?.unit}
                      </span>
                    </p>
                    <div className="mt-2 h-12">
                      {/* Mini sparkline chart */}
                      <div className="flex items-end h-full gap-0.5">
                        {realtimeData[sensor.id]?.slice(-20).map((reading, idx) => {
                          const readings = realtimeData[sensor.id].slice(-20)
                          const min = Math.min(...readings.map(r => r.value))
                          const max = Math.max(...readings.map(r => r.value))
                          const height = ((reading.value - min) / (max - min)) * 100
                          
                          return (
                            <div
                              key={idx}
                              className="flex-1 bg-purple-600 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Gateway Status */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Gateway Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gateways.map(gateway => (
                <div key={gateway.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{gateway.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(gateway.status)}`}>
                      {gateway.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white uppercase">{gateway.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Connected</span>
                      <span className="text-white">{gateway.connectedSensors} sensors</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IP Address</span>
                      <span className="text-white font-mono text-xs">{gateway.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Seen</span>
                      <span className="text-white">{gateway.lastSeen.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sensors Tab */}
      {activeTab === 'sensors' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">All Sensors</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="pb-3 text-sm font-medium text-gray-400">Name</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Type</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Location</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Connection</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Last Reading</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Battery</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map(sensor => (
                  <tr key={sensor.id} className="border-b border-gray-800/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {getSensorIcon(sensor.type)}
                        <span className="text-white">{sensor.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{sensor.type}</td>
                    <td className="py-3 text-gray-300">{sensor.location}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sensor.status)}`}>
                        {sensor.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-gray-300">
                        {getConnectionIcon(sensor.connectionType)}
                        <span className="text-xs">{sensor.connectionType}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {sensor.lastReading && (
                        <div>
                          <p className="text-white">
                            {sensor.lastReading.value} {sensor.lastReading.unit}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sensor.lastReading.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {sensor.batteryLevel && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                sensor.batteryLevel > 50 ? 'bg-green-500' :
                                sensor.batteryLevel > 20 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${sensor.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{sensor.batteryLevel}%</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setSelectedSensor(sensor)}
                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{selectedSensor.name}</h3>
              <button
                onClick={() => setSelectedSensor(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Minus className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sensor Info */}
              <div>
                <h4 className="font-medium text-white mb-3">Device Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Manufacturer</span>
                    <p className="text-white">{selectedSensor.manufacturer}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Model</span>
                    <p className="text-white">{selectedSensor.model}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Serial Number</span>
                    <p className="text-white font-mono">{selectedSensor.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Firmware</span>
                    <p className="text-white">{selectedSensor.metadata.firmware}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Install Date</span>
                    <p className="text-white">{selectedSensor.metadata.installDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Connection</span>
                    <p className="text-white">{selectedSensor.connectionType.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Calibration */}
              <div>
                <h4 className="font-medium text-white mb-3">Calibration</h4>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Last Calibrated</span>
                      <p className="text-white">{selectedSensor.calibration.lastCalibrated.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Next Calibration</span>
                      <p className={`${
                        selectedSensor.calibration.nextCalibration < new Date() ? 'text-red-400' : 'text-white'
                      }`}>
                        {selectedSensor.calibration.nextCalibration.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Offset</span>
                      <p className="text-white">{selectedSensor.calibration.offset}</p>
                    </div>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Calibrate Now
                  </button>
                </div>
              </div>

              {/* Alert Settings */}
              <div>
                <h4 className="font-medium text-white mb-3">Alert Settings</h4>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Enable Alerts</span>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        selectedSensor.alerts.enabled ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedSensor.alerts.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Min Threshold</label>
                      <input
                        type="number"
                        value={selectedSensor.alerts.minThreshold}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Max Threshold</label>
                      <input
                        type="number"
                        value={selectedSensor.alerts.maxThreshold}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  Test Connection
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  Download Data
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  Remove Sensor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}