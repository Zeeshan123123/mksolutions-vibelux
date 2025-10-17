'use client'

import React, { useState, useEffect } from 'react'
import { useDLCFixtures } from '@/components/designer/hooks/useDLCFixtures'
import type { FixtureModel } from '@/components/FixtureLibrary'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Lightbulb, 
  Building, 
  Flower,
  Grid,
  Zap,
  Filter,
  Search,
  Check,
  Star,
  Loader
} from 'lucide-react'

interface WizardStep {
  id: string
  name: string
  completed: boolean
}

interface GreenhouseConfig {
  type: 'indoor' | 'greenhouse'
  dimensions: {
    length: number
    width: number
    height: number
  }
  cropType: string
  lightingGoal: 'sole-source' | 'supplemental'
  targetPPFD: number
  selectedFixtures: FixtureModel[]
}

interface SmartGreenhouseSetupWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (config: GreenhouseConfig) => void
}

export function SmartGreenhouseSetupWizard({ 
  isOpen, 
  onClose, 
  onComplete 
}: SmartGreenhouseSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<Partial<GreenhouseConfig>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [efficacyRange, setEfficacyRange] = useState({ min: 0, max: 5 })
  
  const { fixtures, loading, error } = useDLCFixtures()

  const steps: WizardStep[] = [
    { id: 'space-setup', name: 'Space Setup', completed: false },
    { id: 'crop-selection', name: 'Crop Selection', completed: false },
    { id: 'lighting-goals', name: 'Lighting Goals', completed: false },
    { id: 'fixture-selection', name: 'DLC Fixture Selection', completed: false },
    { id: 'review', name: 'Review & Generate', completed: false }
  ]

  const cropTypes = [
    { id: 'leafy-greens', name: 'Leafy Greens', ppfd: 200, icon: '🥬' },
    { id: 'herbs', name: 'Herbs', ppfd: 300, icon: '🌿' },
    { id: 'tomatoes', name: 'Tomatoes', ppfd: 400, icon: '🍅' },
    { id: 'cannabis', name: 'Cannabis', ppfd: 800, icon: '🌿' },
    { id: 'berries', name: 'Berries', ppfd: 350, icon: '🫐' },
    { id: 'flowers', name: 'Flowers', ppfd: 250, icon: '🌸' }
  ]

  // Filter fixtures based on search and filters
  const filteredFixtures = fixtures.filter(fixture => {
    const matchesSearch = !searchTerm || 
      fixture.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.model.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBrand = selectedBrands.length === 0 || 
      selectedBrands.includes(fixture.brand)
    
    const matchesEfficacy = fixture.efficacy >= efficacyRange.min && 
      fixture.efficacy <= efficacyRange.max

    return matchesSearch && matchesBrand && matchesEfficacy
  })

  // Get unique brands for filter
  const availableBrands = [...new Set(fixtures.map(f => f.brand))].sort()

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFixtureToggle = (fixture: FixtureModel) => {
    const selectedFixtures = config.selectedFixtures || []
    const isSelected = selectedFixtures.some(f => f.id === fixture.id)
    
    if (isSelected) {
      setConfig({
        ...config,
        selectedFixtures: selectedFixtures.filter(f => f.id !== fixture.id)
      })
    } else {
      setConfig({
        ...config,
        selectedFixtures: [...selectedFixtures, fixture]
      })
    }
  }

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand))
    } else {
      setSelectedBrands([...selectedBrands, brand])
    }
  }

  const handleComplete = () => {
    if (config.selectedFixtures && config.selectedFixtures.length > 0) {
      onComplete(config as GreenhouseConfig)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Smart Greenhouse Setup Wizard
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : index < currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index === currentStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 0: Space Setup */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Choose Your Growing Environment
                </h3>
                <p className="text-gray-400">
                  Select the type of space you'll be designing for
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={() => setConfig({ ...config, type: 'indoor' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    config.type === 'indoor'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Building className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-medium text-white mb-2">Indoor Space</h4>
                  <p className="text-sm text-gray-400">
                    Grow rooms, warehouses, controlled environments
                  </p>
                </button>

                <button
                  onClick={() => setConfig({ ...config, type: 'greenhouse' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    config.type === 'greenhouse'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Flower className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h4 className="font-medium text-white mb-2">Greenhouse</h4>
                  <p className="text-sm text-gray-400">
                    Glass houses, polytunnels, natural light structures
                  </p>
                </button>
              </div>

              {config.type && (
                <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                  <h4 className="font-medium text-white mb-4">Space Dimensions</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Length (ft)</label>
                      <input
                        type="number"
                        value={config.dimensions?.length || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          dimensions: {
                            ...config.dimensions,
                            length: parseFloat(e.target.value) || 0,
                            width: config.dimensions?.width || 0,
                            height: config.dimensions?.height || 0
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Width (ft)</label>
                      <input
                        type="number"
                        value={config.dimensions?.width || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          dimensions: {
                            ...config.dimensions,
                            length: config.dimensions?.length || 0,
                            width: parseFloat(e.target.value) || 0,
                            height: config.dimensions?.height || 0
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Height (ft)</label>
                      <input
                        type="number"
                        value={config.dimensions?.height || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          dimensions: {
                            ...config.dimensions,
                            length: config.dimensions?.length || 0,
                            width: config.dimensions?.width || 0,
                            height: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Crop Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What Will You Be Growing?
                </h3>
                <p className="text-gray-400">
                  This helps us recommend the optimal lighting intensity and spectrum
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cropTypes.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => setConfig({ 
                      ...config, 
                      cropType: crop.id,
                      targetPPFD: crop.ppfd 
                    })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.cropType === crop.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-3xl mb-2">{crop.icon}</div>
                    <h4 className="font-medium text-white text-sm">{crop.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {crop.ppfd} PPFD
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Lighting Goals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Lighting Strategy
                </h3>
                <p className="text-gray-400">
                  How will you use artificial lighting in your growing operation?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setConfig({ ...config, lightingGoal: 'sole-source' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    config.lightingGoal === 'sole-source'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h4 className="font-medium text-white mb-2">Sole-Source Lighting</h4>
                  <p className="text-sm text-gray-400">
                    Complete artificial lighting with no natural light dependency
                  </p>
                </button>

                <button
                  onClick={() => setConfig({ ...config, lightingGoal: 'supplemental' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    config.lightingGoal === 'supplemental'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Grid className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-medium text-white mb-2">Supplemental Lighting</h4>
                  <p className="text-sm text-gray-400">
                    Boost natural light during low-light periods or seasons
                  </p>
                </button>
              </div>

              {config.lightingGoal && (
                <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                  <h4 className="font-medium text-white mb-4">Target PPFD</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current target:</span>
                      <span className="text-white font-medium">{config.targetPPFD || 0} μmol/m²/s</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1200"
                      step="50"
                      value={config.targetPPFD || 0}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        targetPPFD: parseInt(e.target.value) 
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>100</span>
                      <span>1200</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: DLC Fixture Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  DLC Fixture Selection
                </h3>
                <p className="text-gray-400">
                  Choose the most efficient DLC-certified fixtures
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Loading DLC fixtures...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-400 mb-2">Error loading fixtures</div>
                  <div className="text-sm text-gray-400">{error}</div>
                </div>
              ) : fixtures.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">No DLC fixtures available</div>
                  <div className="text-sm text-gray-500">
                    Check that the DLC fixtures file is properly loaded
                  </div>
                </div>
              ) : (
                <>
                  {/* Search and Filters */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search fixtures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="text-sm text-gray-400">Brands:</div>
                      {availableBrands.slice(0, 6).map(brand => (
                        <button
                          key={brand}
                          onClick={() => handleBrandToggle(brand)}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            selectedBrands.includes(brand)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fixtures List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredFixtures.slice(0, 20).map((fixture) => {
                      const isSelected = config.selectedFixtures?.some(f => f.id === fixture.id)
                      return (
                        <div
                          key={fixture.id}
                          onClick={() => handleFixtureToggle(fixture)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                <div>
                                  <h4 className="font-medium text-white">
                                    {fixture.brand} {fixture.model}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                    <span>{fixture.wattage}W</span>
                                    <span>{fixture.ppf} PPF</span>
                                    <span>{fixture.efficacy.toFixed(1)} PPE</span>
                                    <span className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-400" />
                                      DLC Certified
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-400'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {config.selectedFixtures && config.selectedFixtures.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">
                        Selected Fixtures ({config.selectedFixtures.length})
                      </h4>
                      <div className="space-y-2">
                        {config.selectedFixtures.map(fixture => (
                          <div key={fixture.id} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {fixture.brand} {fixture.model}
                            </span>
                            <span className="text-gray-400">
                              {fixture.wattage}W • {fixture.efficacy.toFixed(1)} PPE
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Review Your Configuration
                </h3>
                <p className="text-gray-400">
                  Ready to generate your lighting design
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Space Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{config.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dimensions:</span>
                      <span className="text-white">
                        {config.dimensions?.length}' × {config.dimensions?.width}' × {config.dimensions?.height}'
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Area:</span>
                      <span className="text-white">
                        {((config.dimensions?.length || 0) * (config.dimensions?.width || 0)).toFixed(1)} sq ft
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Growing Setup</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crop:</span>
                      <span className="text-white capitalize">
                        {cropTypes.find(c => c.id === config.cropType)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strategy:</span>
                      <span className="text-white capitalize">
                        {config.lightingGoal?.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target PPFD:</span>
                      <span className="text-white">{config.targetPPFD} μmol/m²/s</span>
                    </div>
                  </div>
                </div>
              </div>

              {config.selectedFixtures && config.selectedFixtures.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">
                    Selected DLC Fixtures ({config.selectedFixtures.length})
                  </h4>
                  <div className="space-y-3">
                    {config.selectedFixtures.map(fixture => (
                      <div key={fixture.id} className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">
                            {fixture.brand} {fixture.model}
                          </div>
                          <div className="text-sm text-gray-400">
                            {fixture.wattage}W • {fixture.ppf} PPF • {fixture.efficacy.toFixed(1)} PPE
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm">✓ DLC Certified</div>
                          <div className="text-gray-400 text-xs">${fixture.price || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!config.selectedFixtures || config.selectedFixtures.length === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                config.selectedFixtures && config.selectedFixtures.length > 0
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Generate Design
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && (!config.type || !config.dimensions?.length)) ||
                (currentStep === 1 && !config.cropType) ||
                (currentStep === 2 && !config.lightingGoal) ||
                (currentStep === 3 && (!config.selectedFixtures || config.selectedFixtures.length === 0))
              }
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                (currentStep === 0 && config.type && config.dimensions?.length) ||
                (currentStep === 1 && config.cropType) ||
                (currentStep === 2 && config.lightingGoal) ||
                (currentStep === 3 && config.selectedFixtures && config.selectedFixtures.length > 0) ||
                currentStep === 4
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartGreenhouseSetupWizard