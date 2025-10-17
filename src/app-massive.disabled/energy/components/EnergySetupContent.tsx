'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CONTROL_SYSTEMS } from '@/lib/integrations/control-systems-catalog'
import { 
  Zap, 
  Settings, 
  Plus, 
  Trash2, 
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  Clock,
  Cpu,
  RefreshCw,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

interface LightingZone {
  id: string
  name: string
  deviceId: string
  maxPower: number
  cropType: string
  growthStage: string
}

interface RateSchedule {
  peakStart: string
  peakEnd: string
  peakRate: number
  offPeakRate: number
  shoulderRate?: number
  demandCharge?: number
}

export function EnergySetupContent() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  
  // Facility info
  const [facilityName, setFacilityName] = useState('')
  const [zipCode, setZipCode] = useState('')
  
  // Control system selection
  const [selectedControlSystem, setSelectedControlSystem] = useState('')
  const [controlSystemConfig, setControlSystemConfig] = useState({
    host: '',
    port: 502,
    apiUrl: '',
    apiKey: '',
    username: '',
    password: ''
  })
  
  // Rate schedule (if not using API)
  const [useManualRates, setUseManualRates] = useState(false)
  const [rateSchedule, setRateSchedule] = useState<RateSchedule>({
    peakStart: '14:00',
    peakEnd: '19:00',
    peakRate: 0.18,
    offPeakRate: 0.08,
    shoulderRate: 0.12,
    demandCharge: 15.00
  })
  
  // Zones from control system
  const [detectedZones, setDetectedZones] = useState<any[]>([])
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  
  // Compatibility check results
  const [compatibilityCheck, setCompatibilityCheck] = useState<any>(null)

  // Transform comprehensive control systems for the dropdown
  const CONTROL_SYSTEM_OPTIONS = [
    ...CONTROL_SYSTEMS.map(system => ({
      id: system.id,
      name: `${system.name} (${system.manufacturer})`,
      type: system.apiType,
      icon: system.category === 'greenhouse' ? 'cpu' : 
            system.category === 'cannabis' ? 'zap' : 'settings',
      category: system.category,
      protocols: system.protocols
    })),
    { id: 'other', name: 'Other / Custom', type: 'custom', icon: 'plus', category: 'custom', protocols: [] }
  ]
  
  // Check compatibility when control system is selected
  React.useEffect(() => {
    if (selectedControlSystem) {
      checkSystemCompatibility()
    }
  }, [selectedControlSystem])
  
  const checkSystemCompatibility = async () => {
    try {
      // Simulate API call
      const mockCompatibility = {
        compatible: true,
        features: ['lighting_control', 'hvac_control', 'irrigation_control'],
        limitations: [],
        setupTime: '15-30 minutes'
      }
      setCompatibilityCheck(mockCompatibility)
    } catch (error) {
      console.error('Compatibility check failed:', error)
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock detected zones
      const mockZones = [
        { id: 'zone1', name: 'Veg Room 1', deviceId: 'light_1', maxPower: 1200, cropType: 'cannabis', growthStage: 'vegetative' },
        { id: 'zone2', name: 'Flower Room A', deviceId: 'light_2', maxPower: 2400, cropType: 'cannabis', growthStage: 'flowering' },
        { id: 'zone3', name: 'Clone Area', deviceId: 'light_3', maxPower: 600, cropType: 'cannabis', growthStage: 'clone' }
      ]
      
      setDetectedZones(mockZones)
      setSelectedZones(mockZones.map(z => z.id))
      setStep(4)
    } catch (error) {
      console.error('Connection test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeSetup = async () => {
    setIsLoading(true)
    try {
      // Simulate setup completion
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSetupComplete(true)
    } catch (error) {
      console.error('Setup completion failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (setupComplete) {
    return (
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Setup Complete!</h3>
          <p className="text-gray-400 mb-6">
            Your energy optimization system is now configured and ready to start saving you money.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => window.location.href = '/energy?tab=monitoring'}
              className="bg-green-600 hover:bg-green-700"
            >
              View Monitoring
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              onClick={() => window.location.href = '/energy?tab=optimization'}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Start Optimization
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-300">Setup Progress</span>
            <span className="text-sm text-gray-400">{step} of 4</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Facility Info</span>
            <span>Control System</span>
            <span>Connection</span>
            <span>Zones</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Facility Information */}
      {step === 1 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Facility Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="facilityName" className="text-gray-300">Facility Name</Label>
                <Input
                  id="facilityName"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g., Main Cultivation Facility"
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g., 90210"
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!facilityName || !zipCode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Control System
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Control System Selection */}
      {step === 2 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-400" />
              Select Control System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTROL_SYSTEM_OPTIONS.map((system) => (
                <button
                  key={system.id}
                  onClick={() => setSelectedControlSystem(system.id)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedControlSystem === system.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-900/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {system.icon === 'cpu' && <Cpu className="w-5 h-5 text-blue-400" />}
                    {system.icon === 'zap' && <Zap className="w-5 h-5 text-purple-400" />}
                    {system.icon === 'settings' && <Settings className="w-5 h-5 text-green-400" />}
                    {system.icon === 'plus' && <Plus className="w-5 h-5 text-gray-400" />}
                    <span className="font-medium text-white">{system.name}</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {system.type === 'modbus' ? 'Modbus TCP/IP' : 
                     system.type === 'rest' ? 'REST API' :
                     system.type === 'cloud' ? 'Cloud API' :
                     system.type === 'bacnet' ? 'BACnet/IP' :
                     system.type === 'proprietary' ? 'Proprietary Protocol' :
                     'Custom Integration'}
                  </p>
                  {system.protocols.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: {system.protocols.slice(0, 2).join(', ')}
                      {system.protocols.length > 2 && ` +${system.protocols.length - 2} more`}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {compatibilityCheck && (
              <Alert className="border-green-800 bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  <strong>Compatible!</strong> This system supports all required features. 
                  Estimated setup time: {compatibilityCheck.setupTime}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!selectedControlSystem}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Connection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Connection Configuration */}
      {step === 3 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Connection Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="host" className="text-gray-300">Host/IP Address</Label>
                <Input
                  id="host"
                  value={controlSystemConfig.host}
                  onChange={(e) => setControlSystemConfig({...controlSystemConfig, host: e.target.value})}
                  placeholder="192.168.1.100"
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="port" className="text-gray-300">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={controlSystemConfig.port}
                  onChange={(e) => setControlSystemConfig({...controlSystemConfig, port: parseInt(e.target.value)})}
                  placeholder="502"
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              {selectedControlSystem !== 'modbus' && (
                <>
                  <div>
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input
                      id="username"
                      value={controlSystemConfig.username}
                      onChange={(e) => setControlSystemConfig({...controlSystemConfig, username: e.target.value})}
                      className="bg-gray-900 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={controlSystemConfig.password}
                      onChange={(e) => setControlSystemConfig({...controlSystemConfig, password: e.target.value})}
                      className="bg-gray-900 border-gray-600 text-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={testConnection}
                disabled={isLoading || !controlSystemConfig.host}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            <div className="flex justify-between">
              <Button 
                onClick={() => setStep(2)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Zone Selection */}
      {step === 4 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Select Zones for Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-800 bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                We detected {detectedZones.length} lighting zones. Select which ones you'd like to optimize.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {detectedZones.map((zone) => (
                <div 
                  key={zone.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedZones.includes(zone.id)
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-gray-600 bg-gray-900/50 hover:bg-gray-700/50'
                  }`}
                  onClick={() => {
                    if (selectedZones.includes(zone.id)) {
                      setSelectedZones(selectedZones.filter(id => id !== zone.id))
                    } else {
                      setSelectedZones([...selectedZones, zone.id])
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{zone.name}</h4>
                      <p className="text-sm text-gray-400">
                        {zone.maxPower}W • {zone.cropType} • {zone.growthStage}
                      </p>
                    </div>
                    {selectedZones.includes(zone.id) && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button 
                onClick={() => setStep(3)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={completeSetup}
                disabled={isLoading || selectedZones.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Completing Setup...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}