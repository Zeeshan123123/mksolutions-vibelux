"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { 
  Building, 
  Leaf, 
  Zap, 
  Thermometer, 
  Droplets,
  Sun,
  Wifi,
  MapPin,
  Users,
  Calculator,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Gauge,
  Target,
  Settings2
} from 'lucide-react'

interface FacilitySetupWizardProps {
  onComplete: (config: FacilityConfiguration) => void
  onSkip: () => void
}

interface FacilityConfiguration {
  facilityInfo: {
    name: string
    type: 'indoor' | 'greenhouse' | 'vertical' | 'outdoor'
    location: string
    size: number
    sizeUnit: 'sqft' | 'sqm'
    zones: number
  }
  crops: {
    primary: string[]
    secondary: string[]
    growthStages: string[]
  }
  equipment: {
    lighting: string[]
    climate: string[]
    irrigation: string[]
    sensors: string[]
  }
  zoneConfiguration: {
    zones: Array<{
      id: string
      name: string
      crop: string
      stage: string
      targets: {
        temperature: [number, number]
        humidity: [number, number]
        co2: number
        ppfd: number
      }
    }>
  }
}

const facilityTypes = [
  { id: 'indoor', name: 'Indoor Facility', icon: Building, description: 'Fully controlled environment' },
  { id: 'greenhouse', name: 'Greenhouse', icon: Sun, description: 'Semi-controlled with natural light' },
  { id: 'vertical', name: 'Vertical Farm', icon: Leaf, description: 'Multi-tier growing system' },
  { id: 'outdoor', name: 'Outdoor/Field', icon: MapPin, description: 'Open field cultivation' }
]

const cropOptions = [
  { id: 'cannabis', name: 'Cannabis', category: 'medicinal' },
  { id: 'tomatoes', name: 'Tomatoes', category: 'vegetables' },
  { id: 'lettuce', name: 'Lettuce', category: 'leafy-greens' },
  { id: 'spinach', name: 'Spinach', category: 'leafy-greens' },
  { id: 'herbs', name: 'Herbs', category: 'culinary' },
  { id: 'strawberries', name: 'Strawberries', category: 'fruit' },
  { id: 'peppers', name: 'Peppers', category: 'vegetables' },
  { id: 'cucumbers', name: 'Cucumbers', category: 'vegetables' },
  { id: 'microgreens', name: 'Microgreens', category: 'specialty' },
  { id: 'mushrooms', name: 'Mushrooms', category: 'specialty' }
]

const equipmentOptions = {
  lighting: [
    'LED Full Spectrum',
    'LED Red/Blue',
    'HPS (High Pressure Sodium)',
    'CMH (Ceramic Metal Halide)',
    'T5 Fluorescent',
    'Natural Light Only'
  ],
  climate: [
    'HVAC System',
    'Climate Computer',
    'Exhaust Fans',
    'Circulation Fans',
    'Dehumidifier',
    'Humidifier',
    'CO2 Generator',
    'Heating System',
    'Cooling System'
  ],
  irrigation: [
    'Drip Irrigation',
    'Sprinkler System',
    'Flood Tables',
    'NFT (Nutrient Film Technique)',
    'DWC (Deep Water Culture)',
    'Aeroponics',
    'Hand Watering',
    'Automated Fertigation'
  ],
  sensors: [
    'Temperature Sensors',
    'Humidity Sensors',
    'CO2 Sensors',
    'pH Sensors',
    'EC Sensors',
    'Light Sensors',
    'Soil Moisture Sensors',
    'Flow Sensors',
    'Pressure Sensors'
  ]
}

export default function FacilitySetupWizard({ onComplete, onSkip }: FacilitySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<FacilityConfiguration>({
    facilityInfo: {
      name: '',
      type: 'indoor',
      location: '',
      size: 1000,
      sizeUnit: 'sqft',
      zones: 1
    },
    crops: {
      primary: [],
      secondary: [],
      growthStages: []
    },
    equipment: {
      lighting: [],
      climate: [],
      irrigation: [],
      sensors: []
    },
    zoneConfiguration: {
      zones: []
    }
  })

  const steps = [
    { id: 'facility-info', title: 'Facility Information', icon: Building },
    { id: 'crops', title: 'Crop Selection', icon: Leaf },
    { id: 'equipment', title: 'Equipment Setup', icon: Zap },
    { id: 'zones', title: 'Zone Configuration', icon: Target }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(config)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateConfig = (section: keyof FacilityConfiguration, data: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const generateZones = () => {
    const zones = []
    for (let i = 0; i < config.facilityInfo.zones; i++) {
      zones.push({
        id: `zone-${i + 1}`,
        name: `Zone ${i + 1}`,
        crop: config.crops.primary[0] || 'lettuce',
        stage: 'vegetative',
        targets: {
          temperature: [68, 75] as [number, number],
          humidity: [50, 60] as [number, number],
          co2: 1000,
          ppfd: 400
        }
      })
    }
    updateConfig('zoneConfiguration', { zones })
  }

  const renderFacilityInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Building className="w-12 h-12 text-blue-400 mx-auto" />
        <h3 className="text-xl font-semibold text-white">Tell us about your facility</h3>
        <p className="text-gray-400">This helps us customize the platform for your needs</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="facility-name" className="text-white">Facility Name</Label>
          <Input
            id="facility-name"
            placeholder="e.g., Main Growing Facility"
            value={config.facilityInfo.name}
            onChange={(e) => updateConfig('facilityInfo', { name: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Facility Type</Label>
          <RadioGroup 
            value={config.facilityInfo.type} 
            onValueChange={(value) => updateConfig('facilityInfo', { type: value })}
          >
            {facilityTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <RadioGroupItem value={type.id} id={type.id} />
                <Label htmlFor={type.id} className="flex items-center space-x-3 cursor-pointer">
                  <type.icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-white font-medium">{type.name}</div>
                    <div className="text-sm text-gray-400">{type.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facility-size" className="text-white">Total Size</Label>
            <Input
              id="facility-size"
              type="number"
              value={config.facilityInfo.size}
              onChange={(e) => updateConfig('facilityInfo', { size: Number(e.target.value) })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size-unit" className="text-white">Unit</Label>
            <Select value={config.facilityInfo.sizeUnit} onValueChange={(value) => updateConfig('facilityInfo', { sizeUnit: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sqft">Square Feet</SelectItem>
                <SelectItem value="sqm">Square Meters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zones" className="text-white">Number of Growing Zones</Label>
          <div className="space-y-2">
            <Slider
              value={[config.facilityInfo.zones]}
              onValueChange={(value) => updateConfig('facilityInfo', { zones: value[0] })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-white">{config.facilityInfo.zones} zones</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-white">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="e.g., Denver, CO"
            value={config.facilityInfo.location}
            onChange={(e) => updateConfig('facilityInfo', { location: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  )

  const renderCropsStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Leaf className="w-12 h-12 text-green-400 mx-auto" />
        <h3 className="text-xl font-semibold text-white">What do you grow?</h3>
        <p className="text-gray-400">Select your primary and secondary crops</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Primary Crops (Select up to 3)</Label>
          <div className="grid grid-cols-2 gap-2">
            {cropOptions.map((crop) => (
              <div key={crop.id} className="flex items-center space-x-2">
                <Checkbox
                  id={crop.id}
                  checked={config.crops.primary.includes(crop.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (config.crops.primary.length < 3) {
                        updateConfig('crops', { 
                          primary: [...config.crops.primary, crop.id] 
                        })
                      }
                    } else {
                      updateConfig('crops', { 
                        primary: config.crops.primary.filter(id => id !== crop.id) 
                      })
                    }
                  }}
                />
                <Label htmlFor={crop.id} className="text-white cursor-pointer">
                  {crop.name}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {crop.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Growth Stages You Manage</Label>
          <div className="grid grid-cols-2 gap-2">
            {['seedling', 'vegetative', 'flowering', 'harvest'].map((stage) => (
              <div key={stage} className="flex items-center space-x-2">
                <Checkbox
                  id={stage}
                  checked={config.crops.growthStages.includes(stage)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateConfig('crops', { 
                        growthStages: [...config.crops.growthStages, stage] 
                      })
                    } else {
                      updateConfig('crops', { 
                        growthStages: config.crops.growthStages.filter(s => s !== stage) 
                      })
                    }
                  }}
                />
                <Label htmlFor={stage} className="text-white cursor-pointer capitalize">
                  {stage}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderEquipmentStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Zap className="w-12 h-12 text-yellow-400 mx-auto" />
        <h3 className="text-xl font-semibold text-white">What equipment do you have?</h3>
        <p className="text-gray-400">Select your current equipment for better integration</p>
      </div>

      <div className="space-y-6">
        {Object.entries(equipmentOptions).map(([category, options]) => (
          <div key={category} className="space-y-2">
            <Label className="text-white capitalize flex items-center">
              {category === 'lighting' && <Lightbulb className="w-4 h-4 mr-2" />}
              {category === 'climate' && <Thermometer className="w-4 h-4 mr-2" />}
              {category === 'irrigation' && <Droplets className="w-4 h-4 mr-2" />}
              {category === 'sensors' && <Gauge className="w-4 h-4 mr-2" />}
              {category} Equipment
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${category}-${option}`}
                    checked={config.equipment[category as keyof typeof config.equipment].includes(option)}
                    onCheckedChange={(checked) => {
                      const currentEquipment = config.equipment[category as keyof typeof config.equipment]
                      if (checked) {
                        updateConfig('equipment', {
                          [category]: [...currentEquipment, option]
                        })
                      } else {
                        updateConfig('equipment', {
                          [category]: currentEquipment.filter(item => item !== option)
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`${category}-${option}`} className="text-white cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderZonesStep = () => {
    if (config.zoneConfiguration.zones.length === 0) {
      generateZones()
    }

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Target className="w-12 h-12 text-purple-400 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Configure your zones</h3>
          <p className="text-gray-400">Set up environmental targets for each zone</p>
        </div>

        <div className="space-y-4">
          {config.zoneConfiguration.zones.map((zone, index) => (
            <Card key={zone.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">{zone.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure environmental targets for this zone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Primary Crop</Label>
                    <Select 
                      value={zone.crop} 
                      onValueChange={(value) => {
                        const updatedZones = [...config.zoneConfiguration.zones]
                        updatedZones[index].crop = value
                        updateConfig('zoneConfiguration', { zones: updatedZones })
                      }}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cropOptions.map((crop) => (
                          <SelectItem key={crop.id} value={crop.id}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Growth Stage</Label>
                    <Select 
                      value={zone.stage} 
                      onValueChange={(value) => {
                        const updatedZones = [...config.zoneConfiguration.zones]
                        updatedZones[index].stage = value
                        updateConfig('zoneConfiguration', { zones: updatedZones })
                      }}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seedling">Seedling</SelectItem>
                        <SelectItem value="vegetative">Vegetative</SelectItem>
                        <SelectItem value="flowering">Flowering</SelectItem>
                        <SelectItem value="harvest">Harvest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Temperature Range (°F)</Label>
                    <div className="px-3 py-2 bg-gray-700 rounded text-white">
                      {zone.targets.temperature[0]}° - {zone.targets.temperature[1]}°
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Humidity Range (%)</Label>
                    <div className="px-3 py-2 bg-gray-700 rounded text-white">
                      {zone.targets.humidity[0]}% - {zone.targets.humidity[1]}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">CO2 Target (ppm)</Label>
                    <div className="px-3 py-2 bg-gray-700 rounded text-white">
                      {zone.targets.co2} ppm
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">PPFD Target (μmol/m²/s)</Label>
                    <div className="px-3 py-2 bg-gray-700 rounded text-white">
                      {zone.targets.ppfd} μmol/m²/s
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderFacilityInfoStep()
      case 1:
        return renderCropsStep()
      case 2:
        return renderEquipmentStep()
      case 3:
        return renderZonesStep()
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Settings2 className="w-8 h-8 text-blue-400" />
            <CardTitle className="text-2xl text-white">Facility Setup</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Let's configure your facility for optimal monitoring and control
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index <= currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack} className="border-gray-600 text-gray-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button variant="ghost" onClick={onSkip} className="text-gray-400">
                Skip Setup
              </Button>
            </div>
            
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}