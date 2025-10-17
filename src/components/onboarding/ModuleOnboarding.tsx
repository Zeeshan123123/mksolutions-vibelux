"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles,
  Calculator,
  Brain,
  Cpu,
  BookOpen,
  BarChart3,
  Wifi,
  Shield,
  Package,
  ArrowRight,
  Check,
  Zap,
  Settings,
  Leaf,
  Users,
  Building,
  Timer,
  Layers,
  Clock,
  Globe,
  Heart,
  Bell,
  CheckSquare,
  Gauge,
  FileText,
  Dna,
  Bug,
  Lightbulb,
  Thermometer,
  Droplet,
  Bot,
  Recycle,
  DollarSign,
  Sprout,
  TrendingUp,
  Rocket,
  GraduationCap,
  Sun,
  Upload,
  Droplets,
  Wind
} from 'lucide-react'

interface OnboardingModule {
  id: string
  name: string
  icon: any
  steps: OnboardingStep[]
  estimatedTime: string
  skipAllowed: boolean
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  required: boolean
  estimatedMinutes: number
}

// Module-specific onboarding flows
const onboardingModules: Record<string, OnboardingModule> = {
  'ai-design-studio': {
    id: 'ai-design-studio',
    name: 'AI Design Studio',
    icon: Brain,
    estimatedTime: '5 minutes',
    skipAllowed: true,
    steps: [
      {
        id: 'room-setup',
        title: 'Room Dimensions',
        description: 'Set up your grow room dimensions',
        component: RoomDimensionsStep,
        required: true,
        estimatedMinutes: 1
      },
      {
        id: 'crop-selection',
        title: 'Crop Type',
        description: 'Select your primary crops',
        component: CropSelectionStep,
        required: true,
        estimatedMinutes: 1
      },
      {
        id: 'fixture-library',
        title: 'Fixture Library',
        description: 'Import fixtures or use DLC database',
        component: FixtureLibraryStep,
        required: false,
        estimatedMinutes: 2
      },
      {
        id: 'first-design',
        title: 'Create First Design',
        description: 'Generate your first lighting layout',
        component: FirstDesignStep,
        required: false,
        estimatedMinutes: 1
      }
    ]
  },
  
  'calculator-suite': {
    id: 'calculator-suite',
    name: 'Professional Calculators',
    icon: Calculator,
    estimatedTime: '3 minutes',
    skipAllowed: true,
    steps: [
      {
        id: 'calculator-preferences',
        title: 'Calculator Preferences',
        description: 'Set your default units and preferences',
        component: CalculatorPreferencesStep,
        required: true,
        estimatedMinutes: 1
      },
      {
        id: 'favorite-calculators',
        title: 'Pin Favorites',
        description: 'Choose your most-used calculators',
        component: FavoriteCalculatorsStep,
        required: false,
        estimatedMinutes: 1
      },
      {
        id: 'quick-tutorial',
        title: 'Quick Tutorial',
        description: 'Learn the top 3 calculators',
        component: CalculatorTutorialStep,
        required: false,
        estimatedMinutes: 1
      }
    ]
  },

  'control-center': {
    id: 'control-center',
    name: 'Advanced Control Center',
    icon: Cpu,
    estimatedTime: '15 minutes',
    skipAllowed: false,
    steps: [
      {
        id: 'facility-config',
        title: 'Facility Configuration',
        description: 'Set up your facility details',
        component: FacilityConfigStep,
        required: true,
        estimatedMinutes: 3
      },
      {
        id: 'sensor-setup',
        title: 'Connect Sensors',
        description: 'Integrate your environmental sensors',
        component: SensorSetupStep,
        required: true,
        estimatedMinutes: 5
      },
      {
        id: 'equipment-connection',
        title: 'Equipment Setup',
        description: 'Connect control systems',
        component: EquipmentConnectionStep,
        required: true,
        estimatedMinutes: 5
      },
      {
        id: 'alert-preferences',
        title: 'Alerts & Notifications',
        description: 'Configure your alert preferences',
        component: AlertPreferencesStep,
        required: false,
        estimatedMinutes: 2
      }
    ]
  },

  'research-library': {
    id: 'research-library',
    name: 'Research Library',
    icon: BookOpen,
    estimatedTime: '2 minutes',
    skipAllowed: true,
    steps: [
      {
        id: 'research-interests',
        title: 'Research Interests',
        description: 'Select your areas of interest',
        component: ResearchInterestsStep,
        required: true,
        estimatedMinutes: 1
      },
      {
        id: 'search-tutorial',
        title: 'Search Tutorial',
        description: 'Learn advanced search techniques',
        component: SearchTutorialStep,
        required: false,
        estimatedMinutes: 1
      }
    ]
  },

  'energy-optimization': {
    id: 'energy-optimization',
    name: 'Energy Management',
    icon: Zap,
    estimatedTime: '10 minutes',
    skipAllowed: false,
    steps: [
      {
        id: 'utility-connection',
        title: 'Utility Connection',
        description: 'Connect your utility account',
        component: UtilityConnectionStep,
        required: true,
        estimatedMinutes: 3
      },
      {
        id: 'baseline-setup',
        title: 'Energy Baseline',
        description: 'Establish your baseline consumption',
        component: BaselineSetupStep,
        required: true,
        estimatedMinutes: 3
      },
      {
        id: 'equipment-audit',
        title: 'Equipment Audit',
        description: 'Audit your energy-consuming equipment',
        component: EquipmentAuditStep,
        required: true,
        estimatedMinutes: 4
      }
    ]
  },

  'marketplace': {
    id: 'marketplace',
    name: 'B2B Marketplace',
    icon: Package,
    estimatedTime: '5 minutes',
    skipAllowed: true,
    steps: [
      {
        id: 'business-profile',
        title: 'Business Profile',
        description: 'Create your business profile',
        component: BusinessProfileStep,
        required: true,
        estimatedMinutes: 2
      },
      {
        id: 'marketplace-preferences',
        title: 'Marketplace Settings',
        description: 'Set buying/selling preferences',
        component: MarketplacePreferencesStep,
        required: true,
        estimatedMinutes: 2
      },
      {
        id: 'verification',
        title: 'Verification',
        description: 'Verify your business',
        component: VerificationStep,
        required: false,
        estimatedMinutes: 1
      }
    ]
  }
}

// AI Design Studio Components
function RoomDimensionsStep({ onComplete }: { onComplete: () => void }) {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '',
    units: 'feet'
  })
  const [roomType, setRoomType] = useState<'indoor' | 'greenhouse' | 'vertical'>('indoor')
  
  const handleSave = () => {
    // Save to localStorage for now (would save to database in production)
    localStorage.setItem('roomDimensions', JSON.stringify({ ...dimensions, roomType }))
    onComplete()
  }
  
  const isValid = dimensions.length && dimensions.width && dimensions.height
  
  return (
    <div className="space-y-6">
      {/* Room Type Selection */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Facility Type</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'indoor', label: 'Indoor', icon: Building },
            { value: 'greenhouse', label: 'Greenhouse', icon: Leaf },
            { value: 'vertical', label: 'Vertical Farm', icon: Layers }
          ].map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                onClick={() => setRoomType(type.value as any)}
                className={`p-4 rounded-lg border transition-all ${
                  roomType === type.value
                    ? 'bg-purple-600/20 border-purple-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Unit Selection */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Measurement Units</label>
        <div className="flex gap-2">
          {['feet', 'meters'].map(unit => (
            <button
              key={unit}
              onClick={() => setDimensions({ ...dimensions, units: unit })}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                dimensions.units === unit
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">Room Dimensions</label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Length ({dimensions.units})</label>
            <input 
              type="number" 
              value={dimensions.length}
              onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none" 
              placeholder={dimensions.units === 'feet' ? '40' : '12'}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Width ({dimensions.units})</label>
            <input 
              type="number" 
              value={dimensions.width}
              onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none" 
              placeholder={dimensions.units === 'feet' ? '20' : '6'}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height ({dimensions.units})</label>
            <input 
              type="number" 
              value={dimensions.height}
              onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none" 
              placeholder={dimensions.units === 'feet' ? '10' : '3'}
            />
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-400">
          💡 Tip: For accurate lighting design, measure from floor to the mounting height of your fixtures, not to the ceiling.
        </p>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleSave} 
          disabled={!isValid}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function CropSelectionStep({ onComplete }: { onComplete: () => void }) {
  const [selectedCrops, setSelectedCrops] = useState<string[]>([])
  const [primaryCrop, setPrimaryCrop] = useState<string>('')
  
  const crops = [
    { emoji: '🌿', name: 'Cannabis', dli: '25-45', photoperiod: '12-18' },
    { emoji: '🍅', name: 'Tomatoes', dli: '20-30', photoperiod: '16-18' },
    { emoji: '🥬', name: 'Leafy Greens', dli: '12-17', photoperiod: '14-16' },
    { emoji: '🌱', name: 'Herbs', dli: '10-15', photoperiod: '14-16' },
    { emoji: '🍓', name: 'Strawberries', dli: '17-20', photoperiod: '12-16' },
    { emoji: '🥒', name: 'Cucumbers', dli: '20-30', photoperiod: '16-18' }
  ]
  
  const toggleCrop = (cropName: string) => {
    if (selectedCrops.includes(cropName)) {
      setSelectedCrops(selectedCrops.filter(c => c !== cropName))
      if (primaryCrop === cropName) setPrimaryCrop('')
    } else {
      setSelectedCrops([...selectedCrops, cropName])
      if (selectedCrops.length === 0) setPrimaryCrop(cropName)
    }
  }
  
  const handleSave = () => {
    localStorage.setItem('selectedCrops', JSON.stringify({ selectedCrops, primaryCrop }))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-400 mb-4">
          Select all crops you grow. We'll optimize for your primary crop.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {crops.map(crop => {
            const isSelected = selectedCrops.includes(crop.name)
            const isPrimary = primaryCrop === crop.name
            
            return (
              <button 
                key={crop.name} 
                onClick={() => toggleCrop(crop.name)}
                className={`relative p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-600'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                {isPrimary && (
                  <span className="absolute top-2 right-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                )}
                <div className="text-3xl mb-2">{crop.emoji}</div>
                <div className="text-white font-medium">{crop.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  DLI: {crop.dli}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {selectedCrops.length > 1 && (
        <div>
          <label className="block text-sm text-gray-400 mb-3">Primary Crop (for optimization)</label>
          <div className="grid grid-cols-2 gap-2">
            {selectedCrops.map(cropName => (
              <button
                key={cropName}
                onClick={() => setPrimaryCrop(cropName)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  primaryCrop === cropName
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {crops.find(c => c.name === cropName)?.emoji} {cropName}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Crop-specific tips */}
      {primaryCrop && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-400">
            🌱 {primaryCrop} Tip: {primaryCrop === 'Cannabis' 
              ? 'We\'ll set up both vegetative and flowering light recipes for optimal growth.'
              : primaryCrop === 'Tomatoes'
              ? 'Our Dutch-method protocols will maximize your yield and fruit quality.'
              : primaryCrop === 'Leafy Greens'
              ? 'We\'ll optimize for rapid growth cycles and consistent quality.'
              : 'We\'ll customize light recipes for your specific varieties.'
            }
          </p>
        </div>
      )}
      
      <button 
        onClick={handleSave} 
        disabled={selectedCrops.length === 0}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        Continue
      </button>
    </div>
  )
}

function FixtureLibraryStep({ onComplete }: { onComplete: () => void }) {
  const [importMethod, setImportMethod] = useState<'dlc' | 'manual' | 'skip'>('')
  const [selectedFixtures, setSelectedFixtures] = useState<any[]>([])
  
  const popularFixtures = [
    { brand: 'Fluence', model: 'SPYDR 2p', wattage: 645, ppf: 1700, dlc: true },
    { brand: 'Gavita', model: 'Pro 1700e LED', wattage: 645, ppf: 1700, dlc: true },
    { brand: 'California Lightworks', model: 'MegaDrive 1000', wattage: 1000, ppf: 2550, dlc: true },
    { brand: 'Philips', model: 'GreenPower LED toplighting', wattage: 1000, ppf: 3000, dlc: true }
  ]
  
  const handleImportDLC = () => {
    // In production, this would open DLC import tool
    alert('DLC import would open here')
  }
  
  const handleSave = () => {
    localStorage.setItem('fixtureLibrary', JSON.stringify({ importMethod, selectedFixtures }))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      {!importMethod ? (
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setImportMethod('dlc')}
            className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Import from DLC Database</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Access 1000+ verified fixtures with certified performance data
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setImportMethod('manual')}
            className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Add Fixtures Manually</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Enter your fixture specifications manually
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setImportMethod('skip')}
            className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">I'll Add Later</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Use sample fixtures for now
                </p>
              </div>
            </div>
          </button>
        </div>
      ) : importMethod === 'manual' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Popular Fixtures</h4>
            <button 
              onClick={() => setImportMethod('')}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back
            </button>
          </div>
          
          <div className="space-y-3">
            {popularFixtures.map((fixture, index) => (
              <label
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFixtures.some(f => f.model === fixture.model)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFixtures([...selectedFixtures, fixture])
                    } else {
                      setSelectedFixtures(selectedFixtures.filter(f => f.model !== fixture.model))
                    }
                  }}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-white">{fixture.brand} {fixture.model}</div>
                  <div className="text-sm text-gray-400">
                    {fixture.wattage}W • {fixture.ppf} PPF • {fixture.dlc && 'DLC Listed'}
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          <button 
            onClick={handleSave}
            className="mt-6 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
          >
            Continue with {selectedFixtures.length} Fixtures
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Setup complete!</p>
          <button onClick={handleSave} className="mt-4 text-purple-400 hover:text-purple-300">
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

function FirstDesignStep({ onComplete }: { onComplete: () => void }) {
  const [designName, setDesignName] = useState('')
  const [targetPPFD, setTargetPPFD] = useState('')
  const [uniformity, setUniformity] = useState('0.8')
  const [mounting, setMounting] = useState('10')
  
  // Load saved data
  const dimensions = JSON.parse(localStorage.getItem('roomDimensions') || '{}')
  const crops = JSON.parse(localStorage.getItem('selectedCrops') || '{}')
  
  const suggestedPPFD = {
    'Cannabis': 800,
    'Tomatoes': 600,
    'Leafy Greens': 300,
    'Herbs': 250
  }[crops.primaryCrop] || 500
  
  const handleCreateDesign = () => {
    const designData = {
      name: designName || `${crops.primaryCrop} Room Design`,
      targetPPFD: targetPPFD || suggestedPPFD,
      uniformity,
      mounting,
      dimensions,
      crop: crops.primaryCrop
    }
    
    localStorage.setItem('firstDesign', JSON.stringify(designData))
    
    // In production, this would actually create the design
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
        <h4 className="font-semibold text-purple-400 mb-2">Ready to create your first design!</h4>
        <p className="text-sm text-gray-300">
          Based on your {dimensions.length}×{dimensions.width}×{dimensions.height} {dimensions.units} {dimensions.roomType} growing {crops.primaryCrop}
        </p>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Design Name (optional)</label>
        <input
          type="text"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          placeholder={`${crops.primaryCrop} Room Design`}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Target PPFD (μmol/m²/s)</label>
          <input
            type="number"
            value={targetPPFD}
            onChange={(e) => setTargetPPFD(e.target.value)}
            placeholder={suggestedPPFD.toString()}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Suggested: {suggestedPPFD}</p>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Uniformity Target</label>
          <select
            value={uniformity}
            onChange={(e) => setUniformity(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="0.7">0.7 (Standard)</option>
            <option value="0.8">0.8 (Recommended)</option>
            <option value="0.9">0.9 (Premium)</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Mounting Height ({dimensions.units})</label>
        <input
          type="number"
          value={mounting}
          onChange={(e) => setMounting(e.target.value)}
          placeholder="10"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">Distance from canopy to fixtures</p>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-400">
          The AI will optimize fixture placement to achieve {targetPPFD || suggestedPPFD} PPFD with {uniformity} uniformity
        </p>
      </div>
      
      <button
        onClick={handleCreateDesign}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Create My First Design
      </button>
    </div>
  )
}

// Calculator Suite Components
function CalculatorPreferencesStep({ onComplete }: { onComplete: () => void }) {
  const [preferences, setPreferences] = useState({
    units: 'imperial',
    currency: 'USD',
    electricityRate: '0.12',
    defaultPhotoperiod: '16',
    defaultCO2: '1000'
  })
  
  const handleSave = () => {
    localStorage.setItem('calculatorPreferences', JSON.stringify(preferences))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">Measurement System</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPreferences({ ...preferences, units: 'imperial' })}
            className={`p-4 rounded-lg border transition-all ${
              preferences.units === 'imperial'
                ? 'bg-purple-600/20 border-purple-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="font-medium">Imperial</div>
            <div className="text-xs mt-1">ft, lb, °F</div>
          </button>
          <button
            onClick={() => setPreferences({ ...preferences, units: 'metric' })}
            className={`p-4 rounded-lg border transition-all ${
              preferences.units === 'metric'
                ? 'bg-purple-600/20 border-purple-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="font-medium">Metric</div>
            <div className="text-xs mt-1">m, kg, °C</div>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD ($)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Electricity Rate ($/kWh)</label>
          <input
            type="number"
            step="0.01"
            value={preferences.electricityRate}
            onChange={(e) => setPreferences({ ...preferences, electricityRate: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm text-gray-400 mb-3">Default Values</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Photoperiod (hours)</label>
            <input
              type="number"
              value={preferences.defaultPhotoperiod}
              onChange={(e) => setPreferences({ ...preferences, defaultPhotoperiod: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">CO₂ Level (ppm)</label>
            <input
              type="number"
              value={preferences.defaultCO2}
              onChange={(e) => setPreferences({ ...preferences, defaultCO2: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
        <p className="text-sm text-green-400">
          These preferences will be used as defaults across all calculators
        </p>
      </div>
      
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
      >
        Save Preferences
      </button>
    </div>
  )
}

function FavoriteCalculatorsStep({ onComplete }: { onComplete: () => void }) {
  const [favorites, setFavorites] = useState<string[]>([])
  
  const calculators = [
    { id: 'vpd', name: 'VPD Calculator', icon: Wind, category: 'Environmental' },
    { id: 'dli', name: 'DLI Calculator', icon: Sun, category: 'Lighting' },
    { id: 'ppfd', name: 'PPFD Calculator', icon: Lightbulb, category: 'Lighting' },
    { id: 'roi', name: 'ROI Calculator', icon: DollarSign, category: 'Financial' },
    { id: 'fertigation', name: 'Fertigation Calculator', icon: Droplets, category: 'Nutrition' },
    { id: 'co2', name: 'CO₂ Injection', icon: Wind, category: 'Environmental' },
    { id: 'hvac', name: 'HVAC Sizing', icon: Thermometer, category: 'Environmental' },
    { id: 'irrigation', name: 'Irrigation Scheduling', icon: Droplets, category: 'Water' },
    { id: 'harvest', name: 'Harvest Timing', icon: Leaf, category: 'Planning' }
  ]
  
  const categories = [...new Set(calculators.map(c => c.category))]
  
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }
  
  const handleSave = () => {
    localStorage.setItem('favoriteCalculators', JSON.stringify(favorites))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Pin your most-used calculators for quick access. You can change this anytime.
      </p>
      
      {categories.map(category => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-400 mb-3">{category}</h4>
          <div className="grid grid-cols-1 gap-2">
            {calculators
              .filter(calc => calc.category === category)
              .map(calc => {
                const isFavorite = favorites.includes(calc.id)
                return (
                  <button
                    key={calc.id}
                    onClick={() => toggleFavorite(calc.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isFavorite
                        ? 'bg-purple-600/20 border-purple-600'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <calc.icon className="w-6 h-6 text-gray-400" />
                      <span className="text-white">{calc.name}</span>
                    </div>
                    {isFavorite && <Check className="w-5 h-5 text-purple-400" />}
                  </button>
                )
              })}
          </div>
        </div>
      ))}
      
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-400">
          {favorites.length > 0 
            ? `${favorites.length} calculators pinned to your dashboard`
            : 'Select at least 3 calculators you use frequently'
          }
        </p>
      </div>
      
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
      >
        {favorites.length > 0 ? `Continue with ${favorites.length} Favorites` : 'Skip for Now'}
      </button>
    </div>
  )
}

function CalculatorTutorialStep({ onComplete }: { onComplete: () => void }) {
  const [currentTutorial, setCurrentTutorial] = useState(0)
  
  const tutorials = [
    {
      title: 'VPD Calculator',
      icon: Wind,
      description: 'Calculate Vapor Pressure Deficit for optimal transpiration',
      tips: [
        'Enter temperature and humidity',
        'Aim for 0.8-1.2 kPa in veg, 1.2-1.6 in flower',
        'Adjust based on leaf temperature offset'
      ]
    },
    {
      title: 'DLI Calculator',
      icon: Sun,
      description: 'Daily Light Integral for total light exposure',
      tips: [
        'Input PPFD and photoperiod hours',
        'Cannabis needs 25-45 mol/m²/day',
        'Leafy greens need 12-17 mol/m²/day'
      ]
    },
    {
      title: 'ROI Calculator',
      icon: DollarSign,
      description: 'Calculate return on investment for equipment',
      tips: [
        'Enter equipment cost and energy savings',
        'Factor in yield improvements',
        'Includes financing options'
      ]
    }
  ]
  
  const tutorial = tutorials[currentTutorial]
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <tutorial.icon className="w-10 h-10 text-gray-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">{tutorial.title}</h3>
            <p className="text-sm text-gray-400">{tutorial.description}</p>
          </div>
        </div>
        
        <div className="space-y-3 mt-6">
          <h4 className="text-sm font-medium text-gray-400">Quick Tips:</h4>
          {tutorial.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-purple-400 mt-0.5">•</span>
              <span className="text-gray-300 text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tutorials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTutorial(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTutorial ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-3">
          {currentTutorial > 0 && (
            <button
              onClick={() => setCurrentTutorial(currentTutorial - 1)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Previous
            </button>
          )}
          {currentTutorial < tutorials.length - 1 ? (
            <button
              onClick={() => setCurrentTutorial(currentTutorial + 1)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              Start Using Calculators
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Control Center Components
function FacilityConfigStep({ onComplete }: { onComplete: () => void }) {
  const [config, setConfig] = useState({
    facilityName: '',
    facilityType: 'indoor',
    zones: '1',
    sqft: '',
    licenses: [] as string[],
    integrationType: ''
  })
  
  const handleSave = () => {
    localStorage.setItem('facilityConfig', JSON.stringify(config))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Facility Name</label>
        <input
          type="text"
          value={config.facilityName}
          onChange={(e) => setConfig({ ...config, facilityName: e.target.value })}
          placeholder="Main Cultivation Facility"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Facility Type</label>
          <select
            value={config.facilityType}
            onChange={(e) => setConfig({ ...config, facilityType: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="indoor">Indoor</option>
            <option value="greenhouse">Greenhouse</option>
            <option value="vertical">Vertical Farm</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Number of Zones</label>
          <input
            type="number"
            value={config.zones}
            onChange={(e) => setConfig({ ...config, zones: e.target.value })}
            min="1"
            max="50"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Total Square Footage</label>
        <input
          type="number"
          value={config.sqft}
          onChange={(e) => setConfig({ ...config, sqft: e.target.value })}
          placeholder="10000"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-3">Control System Integration</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'argus', name: 'Argus', popular: true },
            { id: 'priva', name: 'Priva', popular: true },
            { id: 'trolmaster', name: 'TrolMaster', popular: true },
            { id: 'growlink', name: 'Growlink', popular: false },
            { id: 'custom', name: 'Custom/Other', popular: false },
            { id: 'none', name: 'No System Yet', popular: false }
          ].map(system => (
            <button
              key={system.id}
              onClick={() => setConfig({ ...config, integrationType: system.id })}
              className={`p-3 rounded-lg border transition-all ${
                config.integrationType === system.id
                  ? 'bg-purple-600/20 border-purple-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="text-sm">{system.name}</span>
              {system.popular && (
                <span className="text-xs text-purple-400 block mt-1">Popular</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-400">
          💻 We'll help you connect to {config.integrationType ? config.integrationType : 'your control system'} in the next steps
        </p>
      </div>
      
      <button
        onClick={handleSave}
        disabled={!config.facilityName || !config.sqft}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        Continue to Sensor Setup
      </button>
    </div>
  )
}

function SensorSetupStep({ onComplete }: { onComplete: () => void }) {
  const [setupMethod, setSetupMethod] = useState<'automatic' | 'manual' | 'later'>('')
  const [protocols, setProtocols] = useState<string[]>([])
  const [sensorCount, setSensorCount] = useState({
    temperature: '',
    humidity: '',
    co2: '',
    light: ''
  })
  
  const handleSave = () => {
    localStorage.setItem('sensorSetup', JSON.stringify({ setupMethod, protocols, sensorCount }))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      {!setupMethod ? (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            How would you like to connect your environmental sensors?
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setSetupMethod('automatic')}
              className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Automatic Discovery</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Scan network for compatible sensors (recommended)
                  </p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSetupMethod('manual')}
              className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Manual Configuration</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Add sensors by IP address or serial connection
                  </p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSetupMethod('later')}
              className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Configure Later</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    I'll set up sensors after completing onboarding
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : setupMethod === 'manual' ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-white">Sensor Configuration</h4>
            <button 
              onClick={() => setSetupMethod('')}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-3">Communication Protocols</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'wifi', name: 'WiFi', icon: Wifi },
                  { id: 'lora', name: 'LoRa/LoRaWAN', icon: Wifi },
                  { id: 'modbus', name: 'Modbus/RS485', icon: Cpu },
                  { id: 'mqtt', name: 'MQTT', icon: Globe },
                  { id: 'zigbee', name: 'Zigbee', icon: Wifi },
                  { id: 'api', name: 'Cloud API', icon: Globe }
                ].map(protocol => {
                  const Icon = protocol.icon
                  const isSelected = protocols.includes(protocol.id)
                  return (
                    <button
                      key={protocol.id}
                      onClick={() => {
                        if (isSelected) {
                          setProtocols(protocols.filter(p => p !== protocol.id))
                        } else {
                          setProtocols([...protocols, protocol.id])
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{protocol.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-3">Number of Sensors</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Temperature Sensors</label>
                  <input
                    type="number"
                    value={sensorCount.temperature}
                    onChange={(e) => setSensorCount({ ...sensorCount, temperature: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Humidity Sensors</label>
                  <input
                    type="number"
                    value={sensorCount.humidity}
                    onChange={(e) => setSensorCount({ ...sensorCount, humidity: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CO₂ Sensors</label>
                  <input
                    type="number"
                    value={sensorCount.co2}
                    onChange={(e) => setSensorCount({ ...sensorCount, co2: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Light/PAR Sensors</label>
                  <input
                    type="number"
                    value={sensorCount.light}
                    onChange={(e) => setSensorCount({ ...sensorCount, light: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="mt-6 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
          >
            Continue to Equipment
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <Wifi className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Sensor setup will be available in Control Center</p>
          <button onClick={handleSave} className="text-purple-400 hover:text-purple-300">
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

function EquipmentConnectionStep({ onComplete }: { onComplete: () => void }) {
  const [equipment, setEquipment] = useState({
    hvac: [] as string[],
    lighting: [] as string[],
    irrigation: [] as string[],
    other: [] as string[]
  })
  
  const equipmentOptions = {
    hvac: [
      { id: 'ac', name: 'Air Conditioners', icon: '❄️' },
      { id: 'dehu', name: 'Dehumidifiers', icon: '💧' },
      { id: 'fans', name: 'Exhaust Fans', icon: '🌬️' },
      { id: 'heaters', name: 'Heaters', icon: '🔥' }
    ],
    lighting: [
      { id: 'led', name: 'LED Fixtures', icon: '💡' },
      { id: 'hps', name: 'HPS Lights', icon: '☀️' },
      { id: 'controllers', name: 'Light Controllers', icon: '🌙' },
      { id: 'timers', name: 'Timers', icon: '⏰' }
    ],
    irrigation: [
      { id: 'pumps', name: 'Water Pumps', icon: '💦' },
      { id: 'valves', name: 'Solenoid Valves', icon: '🔧' },
      { id: 'dosers', name: 'Nutrient Dosers', icon: '🧪' },
      { id: 'tanks', name: 'Water Tanks', icon: '🎢' }
    ],
    other: [
      { id: 'co2', name: 'CO₂ Systems', icon: '🌬️' },
      { id: 'cameras', name: 'IP Cameras', icon: '📹' },
      { id: 'access', name: 'Access Control', icon: '🔐' },
      { id: 'alarms', name: 'Alarm Systems', icon: '🚨' }
    ]
  }
  
  const toggleEquipment = (category: keyof typeof equipment, id: string) => {
    const current = equipment[category]
    if (current.includes(id)) {
      setEquipment({
        ...equipment,
        [category]: current.filter(e => e !== id)
      })
    } else {
      setEquipment({
        ...equipment,
        [category]: [...current, id]
      })
    }
  }
  
  const handleSave = () => {
    localStorage.setItem('equipmentSetup', JSON.stringify(equipment))
    onComplete()
  }
  
  const totalEquipment = Object.values(equipment).flat().length
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Select the equipment types you want to control and monitor
      </p>
      
      {Object.entries(equipmentOptions).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-400 mb-3 capitalize">
            {category === 'hvac' ? 'HVAC Equipment' : category}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => {
              const isSelected = equipment[category as keyof typeof equipment].includes(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleEquipment(category as keyof typeof equipment, item.id)}
                  className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      
      {totalEquipment > 0 && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-400">
            ✓ {totalEquipment} equipment types selected for integration
          </p>
        </div>
      )}
      
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
      >
        {totalEquipment > 0 ? `Continue with ${totalEquipment} Equipment Types` : 'Skip for Now'}
      </button>
    </div>
  )
}

function AlertPreferencesStep({ onComplete }: { onComplete: () => void }) {
  const [preferences, setPreferences] = useState({
    criticalAlerts: ['email', 'sms', 'push'],
    warningAlerts: ['email', 'push'],
    infoAlerts: ['push'],
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '06:00'
  })
  
  const alertTypes = [
    { id: 'critical', name: 'Critical Alerts', description: 'Equipment failures, extreme conditions', icon: '🔴' },
    { id: 'warning', name: 'Warning Alerts', description: 'Approaching limits, maintenance due', icon: '🟡' },
    { id: 'info', name: 'Info Alerts', description: 'Status updates, reports ready', icon: '🔵' }
  ]
  
  const channels = [
    { id: 'email', name: 'Email', icon: '✉️' },
    { id: 'sms', name: 'SMS', icon: '📱' },
    { id: 'push', name: 'Push', icon: '🔔' },
    { id: 'phone', name: 'Phone Call', icon: '☎️' }
  ]
  
  const toggleChannel = (alertType: string, channel: string) => {
    const key = `${alertType}Alerts` as keyof typeof preferences
    const current = preferences[key] as string[]
    
    if (current.includes(channel)) {
      setPreferences({
        ...preferences,
        [key]: current.filter(c => c !== channel)
      })
    } else {
      setPreferences({
        ...preferences,
        [key]: [...current, channel]
      })
    }
  }
  
  const handleSave = () => {
    localStorage.setItem('alertPreferences', JSON.stringify(preferences))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Configure how you want to receive alerts from your facility
      </p>
      
      <div className="space-y-4">
        {alertTypes.map(alertType => (
          <div key={alertType.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{alertType.icon}</span>
              <div>
                <h4 className="font-medium text-white">{alertType.name}</h4>
                <p className="text-xs text-gray-400">{alertType.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {channels.map(channel => {
                const key = `${alertType.id}Alerts` as keyof typeof preferences
                const isSelected = (preferences[key] as string[]).includes(channel.id)
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(alertType.id, channel.id)}
                    className={`p-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-600'
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-lg block mb-1">{channel.icon}</span>
                    <span className="text-xs text-gray-300">{channel.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <h4 className="font-medium text-white">Quiet Hours</h4>
            <p className="text-xs text-gray-400">Delay non-critical alerts during these hours</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.quietHours}
            onChange={(e) => setPreferences({ ...preferences, quietHours: e.target.checked })}
            className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          />
        </label>
        
        {preferences.quietHours && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <input
                type="time"
                value={preferences.quietStart}
                onChange={(e) => setPreferences({ ...preferences, quietStart: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Time</label>
              <input
                type="time"
                value={preferences.quietEnd}
                onChange={(e) => setPreferences({ ...preferences, quietEnd: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        Complete Control Center Setup
      </button>
    </div>
  )
}

// Research Library Components
function ResearchInterestsStep({ onComplete }: { onComplete: () => void }) {
  const [interests, setInterests] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState('')
  
  const topics = [
    { id: 'genetics', name: 'Genetics & Breeding', icon: Dna },
    { id: 'nutrition', name: 'Plant Nutrition', icon: Seedling },
    { id: 'pest', name: 'IPM & Pest Management', icon: Bug },
    { id: 'lighting', name: 'Lighting Research', icon: Lightbulb },
    { id: 'climate', name: 'Climate Control', icon: Thermometer },
    { id: 'water', name: 'Water & Irrigation', icon: Droplet },
    { id: 'cultivation', name: 'Cultivation Methods', icon: Leaf },
    { id: 'automation', name: 'Automation & AI', icon: Bot },
    { id: 'sustainability', name: 'Sustainability', icon: Recycle },
    { id: 'economics', name: 'Ag Economics', icon: DollarSign },
    { id: 'organic', name: 'Organic Methods', icon: Sprout },
    { id: 'vertical', name: 'Vertical Farming', icon: Building }
  ]
  
  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter(i => i !== id))
    } else {
      setInterests([...interests, id])
    }
  }
  
  const handleSave = () => {
    localStorage.setItem('researchInterests', JSON.stringify({ interests, customTopics }))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Select topics to personalize your research recommendations
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {topics.map(topic => {
          const isSelected = interests.includes(topic.id)
          const IconComponent = topic.icon
          return (
            <button
              key={topic.id}
              onClick={() => toggleInterest(topic.id)}
              className={`p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-purple-600/20 border-purple-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <IconComponent className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">{topic.name}</span>
            </button>
          )
        })}
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Other Topics (optional)</label>
        <textarea
          value={customTopics}
          onChange={(e) => setCustomTopics(e.target.value)}
          placeholder="Enter any specific research areas or keywords..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none h-20 resize-none"
        />
      </div>
      
      {interests.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            📚 We'll curate research papers based on your {interests.length} selected topics
          </p>
        </div>
      )}
      
      <button
        onClick={handleSave}
        disabled={interests.length === 0 && !customTopics}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        {interests.length > 0 ? `Continue with ${interests.length} Topics` : 'Skip for Now'}
      </button>
    </div>
  )
}

function SearchTutorialStep({ onComplete }: { onComplete: () => void }) {
  const [currentTip, setCurrentTip] = useState(0)
  
  const searchTips = [
    {
      title: 'Basic Search',
      example: 'cannabis yield optimization',
      tips: [
        'Use natural language queries',
        'AI understands context and synonyms',
        'Results ranked by relevance and recency'
      ]
    },
    {
      title: 'Advanced Filters',
      example: 'LED lighting AND tomatoes AFTER:2020',
      tips: [
        'Use AND, OR, NOT operators',
        'Filter by date with AFTER: or BEFORE:',
        'Filter by journal or author'
      ]
    },
    {
      title: 'AI Summaries',
      example: 'Summarize top 5 papers on VPD control',
      tips: [
        'Ask for summaries of multiple papers',
        'Compare different research findings',
        'Extract specific data points'
      ]
    }
  ]
  
  const tip = searchTips[currentTip]
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{tip.title}</h3>
        
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-400 mb-1">Example search:</p>
          <code className="text-purple-400 font-mono">{tip.example}</code>
        </div>
        
        <div className="space-y-2">
          {tip.tips.map((tipText, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{tipText}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {searchTips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTip(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTip ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-3">
          {currentTip > 0 && (
            <button
              onClick={() => setCurrentTip(currentTip - 1)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Previous
            </button>
          )}
          {currentTip < searchTips.length - 1 ? (
            <button
              onClick={() => setCurrentTip(currentTip + 1)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Next Tip
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Start Researching
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Energy Optimization Components
function UtilityConnectionStep({ onComplete }: { onComplete: () => void }) {
  const [utilityInfo, setUtilityInfo] = useState({
    provider: '',
    accountNumber: '',
    rateSchedule: '',
    demandCharges: false,
    timeOfUse: false,
    solarInstalled: false,
    batteryStorage: false
  })
  
  const commonProviders = [
    'Pacific Gas & Electric (PG&E)',
    'Southern California Edison (SCE)',
    'ConEd (New York)',
    'ComEd (Illinois)',
    'Duke Energy',
    'Other'
  ]
  
  const handleSave = () => {
    localStorage.setItem('utilityConnection', JSON.stringify(utilityInfo))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Utility Provider</label>
        <select
          value={utilityInfo.provider}
          onChange={(e) => setUtilityInfo({ ...utilityInfo, provider: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="">Select Provider...</option>
          {commonProviders.map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Account Number (optional)</label>
          <input
            type="text"
            value={utilityInfo.accountNumber}
            onChange={(e) => setUtilityInfo({ ...utilityInfo, accountNumber: e.target.value })}
            placeholder="1234-5678-90"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Rate Schedule</label>
          <input
            type="text"
            value={utilityInfo.rateSchedule}
            onChange={(e) => setUtilityInfo({ ...utilityInfo, rateSchedule: e.target.value })}
            placeholder="A-10, E-19, etc."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Rate Structure</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={utilityInfo.demandCharges}
              onChange={(e) => setUtilityInfo({ ...utilityInfo, demandCharges: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <div>
              <span className="text-white">Demand Charges</span>
              <p className="text-xs text-gray-400">Charged based on peak power usage</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={utilityInfo.timeOfUse}
              onChange={(e) => setUtilityInfo({ ...utilityInfo, timeOfUse: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <div>
              <span className="text-white">Time-of-Use Rates</span>
              <p className="text-xs text-gray-400">Different rates at different times</p>
            </div>
          </label>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Renewable Energy</h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800 rounded-lg border border-gray-700">
            <input
              type="checkbox"
              checked={utilityInfo.solarInstalled}
              onChange={(e) => setUtilityInfo({ ...utilityInfo, solarInstalled: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <div>
              <span className="text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                Solar Panels
              </span>
            </div>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800 rounded-lg border border-gray-700">
            <input
              type="checkbox"
              checked={utilityInfo.batteryStorage}
              onChange={(e) => setUtilityInfo({ ...utilityInfo, batteryStorage: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <div>
              <span className="text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Battery Storage
              </span>
            </div>
          </label>
        </div>
      </div>
      
      {(utilityInfo.demandCharges || utilityInfo.timeOfUse) && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-400">
            💰 Great! We can optimize for {utilityInfo.demandCharges && 'demand charges'}
            {utilityInfo.demandCharges && utilityInfo.timeOfUse && ' and '}
            {utilityInfo.timeOfUse && 'time-of-use rates'}
          </p>
        </div>
      )}
      
      <button
        onClick={handleSave}
        disabled={!utilityInfo.provider}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        Continue to Baseline
      </button>
    </div>
  )
}

function BaselineSetupStep({ onComplete }: { onComplete: () => void }) {
  const [baseline, setBaseline] = useState({
    avgMonthlyKwh: '',
    avgMonthlyCost: '',
    peakDemand: '',
    powerFactor: '0.95',
    dataSource: 'manual'
  })
  
  const handleSave = () => {
    localStorage.setItem('energyBaseline', JSON.stringify(baseline))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        We'll use your current energy usage as a baseline to measure savings
      </p>
      
      <div>
        <label className="block text-sm text-gray-400 mb-3">How would you like to provide baseline data?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setBaseline({ ...baseline, dataSource: 'manual' })}
            className={`p-3 rounded-lg border transition-all ${
              baseline.dataSource === 'manual'
                ? 'bg-purple-600/20 border-purple-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <FileText className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Enter Manually</span>
          </button>
          
          <button
            onClick={() => setBaseline({ ...baseline, dataSource: 'upload' })}
            className={`p-3 rounded-lg border transition-all ${
              baseline.dataSource === 'upload'
                ? 'bg-purple-600/20 border-purple-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Upload className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Upload Bills</span>
          </button>
        </div>
      </div>
      
      {baseline.dataSource === 'manual' ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Avg Monthly kWh</label>
              <input
                type="number"
                value={baseline.avgMonthlyKwh}
                onChange={(e) => setBaseline({ ...baseline, avgMonthlyKwh: e.target.value })}
                placeholder="50000"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Avg Monthly Cost ($)</label>
              <input
                type="number"
                value={baseline.avgMonthlyCost}
                onChange={(e) => setBaseline({ ...baseline, avgMonthlyCost: e.target.value })}
                placeholder="6000"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Peak Demand (kW)</label>
              <input
                type="number"
                value={baseline.peakDemand}
                onChange={(e) => setBaseline({ ...baseline, peakDemand: e.target.value })}
                placeholder="250"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Your highest 15-min demand</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Power Factor</label>
              <input
                type="number"
                step="0.01"
                value={baseline.powerFactor}
                onChange={(e) => setBaseline({ ...baseline, powerFactor: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Typically 0.85-0.95</p>
            </div>
          </div>
          
          {baseline.avgMonthlyKwh && baseline.avgMonthlyCost && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                📈 Your current rate: ${
                  (parseFloat(baseline.avgMonthlyCost) / parseFloat(baseline.avgMonthlyKwh)).toFixed(3)
                }/kWh
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 bg-gray-800 rounded-lg">
          <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Upload your last 3 utility bills</p>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            Select Files
          </button>
        </div>
      )}
      
      <button
        onClick={handleSave}
        disabled={baseline.dataSource === 'manual' && (!baseline.avgMonthlyKwh || !baseline.avgMonthlyCost)}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        Continue to Equipment
      </button>
    </div>
  )
}

function EquipmentAuditStep({ onComplete }: { onComplete: () => void }) {
  const [equipment, setEquipment] = useState({
    lighting: { count: '', wattage: '', hours: '12' },
    hvac: { tons: '', seer: '14' },
    dehumidifiers: { count: '', pintsPerDay: '' },
    fans: { count: '', hp: '' },
    pumps: { count: '', hp: '' },
    other: { description: '', kw: '' }
  })
  
  const handleSave = () => {
    localStorage.setItem('equipmentAudit', JSON.stringify(equipment))
    onComplete()
  }
  
  // Calculate estimated load
  const lightingLoad = parseFloat(equipment.lighting.count || '0') * parseFloat(equipment.lighting.wattage || '0') / 1000
  const hvacLoad = parseFloat(equipment.hvac.tons || '0') * 3.5 // Rough estimate: 3.5kW per ton
  const dehuLoad = parseFloat(equipment.dehumidifiers.count || '0') * 0.7 // Rough estimate
  const totalLoad = lightingLoad + hvacLoad + dehuLoad
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Quick equipment audit to identify savings opportunities
      </p>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-400" />
          Lighting
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1"># of Fixtures</label>
            <input
              type="number"
              value={equipment.lighting.count}
              onChange={(e) => setEquipment({
                ...equipment,
                lighting: { ...equipment.lighting, count: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Watts Each</label>
            <input
              type="number"
              value={equipment.lighting.wattage}
              onChange={(e) => setEquipment({
                ...equipment,
                lighting: { ...equipment.lighting, wattage: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hours/Day</label>
            <input
              type="number"
              value={equipment.lighting.hours}
              onChange={(e) => setEquipment({
                ...equipment,
                lighting: { ...equipment.lighting, hours: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          HVAC
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total Tonnage</label>
            <input
              type="number"
              value={equipment.hvac.tons}
              onChange={(e) => setEquipment({
                ...equipment,
                hvac: { ...equipment.hvac, tons: e.target.value }
              })}
              placeholder="20"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Average SEER</label>
            <input
              type="number"
              value={equipment.hvac.seer}
              onChange={(e) => setEquipment({
                ...equipment,
                hvac: { ...equipment.hvac, seer: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-400" />
          Dehumidification
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1"># of Units</label>
            <input
              type="number"
              value={equipment.dehumidifiers.count}
              onChange={(e) => setEquipment({
                ...equipment,
                dehumidifiers: { ...equipment.dehumidifiers, count: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pints/Day Each</label>
            <input
              type="number"
              value={equipment.dehumidifiers.pintsPerDay}
              onChange={(e) => setEquipment({
                ...equipment,
                dehumidifiers: { ...equipment.dehumidifiers, pintsPerDay: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      {totalLoad > 0 && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-400">
            ⚡ Estimated connected load: {totalLoad.toFixed(1)} kW
          </p>
          <p className="text-xs text-green-400/80 mt-1">
            We'll optimize this equipment for 15-30% energy savings
          </p>
        </div>
      )}
      
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        Complete Energy Setup
      </button>
    </div>
  )
}

// Marketplace Components
function BusinessProfileStep({ onComplete }: { onComplete: () => void }) {
  const [profile, setProfile] = useState({
    businessName: '',
    businessType: '',
    licenseNumber: '',
    yearsInBusiness: '',
    description: '',
    certifications: [] as string[]
  })
  
  const businessTypes = [
    'Licensed Cultivator',
    'Equipment Supplier',
    'Service Provider',
    'Testing Laboratory',
    'Genetics/Seeds',
    'Nutrients/Inputs',
    'Technology Provider',
    'Consulting'
  ]
  
  const certificationOptions = [
    { id: 'organic', name: 'Organic Certified', icon: '🌿' },
    { id: 'gmp', name: 'GMP Certified', icon: '✅' },
    { id: 'iso', name: 'ISO Certified', icon: '🏅' },
    { id: 'state', name: 'State Licensed', icon: '🆔' }
  ]
  
  const toggleCert = (id: string) => {
    if (profile.certifications.includes(id)) {
      setProfile({ ...profile, certifications: profile.certifications.filter(c => c !== id) })
    } else {
      setProfile({ ...profile, certifications: [...profile.certifications, id] })
    }
  }
  
  const handleSave = () => {
    localStorage.setItem('businessProfile', JSON.stringify(profile))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Business Name</label>
        <input
          type="text"
          value={profile.businessName}
          onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
          placeholder="VibeLux Cultivation LLC"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Business Type</label>
        <select
          value={profile.businessType}
          onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="">Select Type...</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">License # (if applicable)</label>
          <input
            type="text"
            value={profile.licenseNumber}
            onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
            placeholder="C10-0000123-LIC"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Years in Business</label>
          <input
            type="number"
            value={profile.yearsInBusiness}
            onChange={(e) => setProfile({ ...profile, yearsInBusiness: e.target.value })}
            placeholder="5"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Business Description</label>
        <textarea
          value={profile.description}
          onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          placeholder="Tell potential partners about your business..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none h-20 resize-none"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-3">Certifications & Credentials</label>
        <div className="grid grid-cols-2 gap-3">
          {certificationOptions.map(cert => {
            const isSelected = profile.certifications.includes(cert.id)
            return (
              <button
                key={cert.id}
                onClick={() => toggleCert(cert.id)}
                className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="text-xl">{cert.icon}</span>
                <span className="text-sm">{cert.name}</span>
              </button>
            )
          })}
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={!profile.businessName || !profile.businessType}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        Continue to Preferences
      </button>
    </div>
  )
}

function MarketplacePreferencesStep({ onComplete }: { onComplete: () => void }) {
  const [preferences, setPreferences] = useState({
    role: [] as string[],
    categories: [] as string[],
    notifications: {
      newListings: true,
      priceAlerts: true,
      messages: true,
      weeklyDigest: false
    }
  })
  
  const roles = [
    { id: 'buyer', name: 'Buyer', description: 'Purchase products and services' },
    { id: 'seller', name: 'Seller', description: 'List products for sale' },
    { id: 'both', name: 'Both', description: 'Buy and sell on marketplace' }
  ]
  
  const categories = [
    'Lighting Equipment',
    'HVAC Systems',
    'Nutrients & Inputs',
    'Growing Media',
    'Seeds & Genetics',
    'Testing Services',
    'Consulting Services',
    'Automation & Controls'
  ]
  
  const toggleCategory = (category: string) => {
    if (preferences.categories.includes(category)) {
      setPreferences({
        ...preferences,
        categories: preferences.categories.filter(c => c !== category)
      })
    } else {
      setPreferences({
        ...preferences,
        categories: [...preferences.categories, category]
      })
    }
  }
  
  const handleSave = () => {
    localStorage.setItem('marketplacePreferences', JSON.stringify(preferences))
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-3">How will you use the marketplace?</label>
        <div className="space-y-3">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setPreferences({ ...preferences, role: [role.id] })}
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                preferences.role.includes(role.id)
                  ? 'bg-purple-600/20 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              <h4 className="font-medium text-white">{role.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{role.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-3">Categories of Interest</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => {
            const isSelected = preferences.categories.includes(category)
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-2 rounded-lg border transition-all text-sm ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-3">Notification Preferences</label>
        <div className="space-y-3">
          {Object.entries({
            newListings: 'New listings in my categories',
            priceAlerts: 'Price drop alerts',
            messages: 'Messages from buyers/sellers',
            weeklyDigest: 'Weekly marketplace digest'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-white">{label}</span>
              <input
                type="checkbox"
                checked={preferences.notifications[key as keyof typeof preferences.notifications]}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    [key]: e.target.checked
                  }
                })}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
            </label>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={preferences.role.length === 0}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        {preferences.role.includes('seller') ? 'Continue to Verification' : 'Complete Setup'}
      </button>
    </div>
  )
}

function VerificationStep({ onComplete }: { onComplete: () => void }) {
  const [verification, setVerification] = useState({
    agreeToTerms: false,
    businessDocs: false,
    bankAccount: false
  })
  
  const allChecked = verification.agreeToTerms && verification.businessDocs && verification.bankAccount
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">Seller Verification Required</h4>
        <p className="text-sm text-gray-300">
          To maintain marketplace quality and trust, all sellers must complete verification.
        </p>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            checked={verification.agreeToTerms}
            onChange={(e) => setVerification({ ...verification, agreeToTerms: e.target.checked })}
            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mt-0.5"
          />
          <div>
            <h4 className="font-medium text-white">Marketplace Terms & Conditions</h4>
            <p className="text-sm text-gray-400 mt-1">
              I agree to the marketplace terms including fees, policies, and code of conduct
            </p>
          </div>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            checked={verification.businessDocs}
            onChange={(e) => setVerification({ ...verification, businessDocs: e.target.checked })}
            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mt-0.5"
          />
          <div>
            <h4 className="font-medium text-white">Business Documentation</h4>
            <p className="text-sm text-gray-400 mt-1">
              I'll provide business license, insurance, and other required documents
            </p>
          </div>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            checked={verification.bankAccount}
            onChange={(e) => setVerification({ ...verification, bankAccount: e.target.checked })}
            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mt-0.5"
          />
          <div>
            <h4 className="font-medium text-white">Payment Information</h4>
            <p className="text-sm text-gray-400 mt-1">
              I'll connect a bank account for payments (Stripe secure processing)
            </p>
          </div>
        </label>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">What happens next?</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <p>• Complete verification in your dashboard</p>
          <p>• Review takes 1-2 business days</p>
          <p>• Start listing products once approved</p>
          <p>• Access to premium seller tools</p>
        </div>
      </div>
      
      <button
        onClick={onComplete}
        disabled={!allChecked}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Package className="w-5 h-5" />
        Complete Marketplace Setup
      </button>
    </div>
  )
}

interface ModuleOnboardingProps {
  moduleId: string
  onComplete?: () => void
}

export function ModuleOnboarding({ moduleId, onComplete }: ModuleOnboardingProps) {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  
  const module = onboardingModules[moduleId]
  
  if (!module) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Module onboarding not found</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-purple-400 hover:text-purple-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentStep = module.steps[currentStepIndex]
  const StepComponent = currentStep?.component

  const handleStepComplete = () => {
    if (currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]))
    }
    
    if (currentStepIndex < module.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // Onboarding complete
      if (onComplete) {
        onComplete()
      } else {
        // Navigate to the appropriate module page
        const moduleRoutes: Record<string, string> = {
          'ai-design-studio': '/design',
          'calculator-suite': '/calculators',
          'control-center': '/control-center',
          'research-library': '/research-library',
          'energy-optimization': '/energy',
          'marketplace': '/marketplace'
        }
        router.push(moduleRoutes[moduleId] || '/dashboard')
      }
    }
  }

  const handleSkip = () => {
    if (module.skipAllowed) {
      if (onComplete) {
        onComplete()
      } else {
        router.push('/dashboard')
      }
    }
  }

  const progress = ((currentStepIndex + 1) / module.steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <module.icon className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">{module.name} Setup</h1>
                <p className="text-sm text-gray-400">
                  Step {currentStepIndex + 1} of {module.steps.length} • {module.estimatedTime} total
                </p>
              </div>
            </div>
            {module.skipAllowed && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Skip Setup
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {module.steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  index === currentStepIndex
                    ? 'bg-purple-600 text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {completedSteps.has(step.id) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                )}
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          {currentStep && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
                <p className="text-gray-400">{currentStep.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Estimated time: {currentStep.estimatedMinutes} {currentStep.estimatedMinutes === 1 ? 'minute' : 'minutes'}
                </p>
              </div>
              
              <StepComponent onComplete={handleStepComplete} />
            </>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Need help? <a href="#" className="text-purple-400 hover:text-purple-300">Contact support</a> or check our <a href="/docs" className="text-purple-400 hover:text-purple-300">documentation</a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook to trigger module onboarding after subscription
export function useModuleOnboarding() {
  const router = useRouter()
  
  const startModuleOnboarding = (moduleId: string) => {
    // Check if user has completed onboarding for this module
    const completedModules = localStorage.getItem('completedOnboarding')
    const completed = completedModules ? JSON.parse(completedModules) : []
    
    if (!completed.includes(moduleId)) {
      router.push(`/onboarding/${moduleId}`)
    }
  }
  
  const markModuleComplete = (moduleId: string) => {
    const completedModules = localStorage.getItem('completedOnboarding')
    const completed = completedModules ? JSON.parse(completedModules) : []
    
    if (!completed.includes(moduleId)) {
      completed.push(moduleId)
      localStorage.setItem('completedOnboarding', JSON.stringify(completed))
    }
  }
  
  return { startModuleOnboarding, markModuleComplete }
}