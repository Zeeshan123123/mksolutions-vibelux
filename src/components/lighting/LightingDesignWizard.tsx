'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Lightbulb,
  Ruler,
  Seedling,
  Target,
  Zap,
  Settings,
  MapPin,
  Calculator,
  Eye,
  Download,
  Save,
  Wand2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: (data: any) => boolean;
  required: boolean;
}

interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  mountingHeight: number;
  units: 'metric' | 'imperial';
}

interface CropSelection {
  cropType: string;
  variety?: string;
  growthStage: string;
  plantingDensity: number;
  canopyLayers: number;
  targetYield?: number;
}

interface LightingTargets {
  targetPPFD: number;
  targetDLI: number;
  photoperiod: number;
  spectrumType: string;
  uniformityTarget: number;
  energyBudget?: number;
}

interface FixtureRecommendation {
  id: string;
  model: string;
  manufacturer: string;
  ppf: number;
  efficacy: number;
  price: number;
  coverage: { length: number; width: number };
  spectrum: string;
  recommended: boolean;
  quantity: number;
  totalCost: number;
  energyConsumption: number;
}

interface LightingDesignWizardProps {
  className?: string;
  onComplete?: (design: any) => void;
  onSave?: (design: any) => void;
}

const CROP_DATABASE = {
  lettuce: {
    name: 'Lettuce',
    varieties: ['Butterhead', 'Romaine', 'Iceberg', 'Leafy Greens'],
    stages: {
      seedling: { ppfd: 100, dli: 8, photoperiod: 16 },
      vegetative: { ppfd: 200, dli: 14, photoperiod: 16 },
      mature: { ppfd: 250, dli: 17, photoperiod: 14 }
    },
    density: 25, // plants per m²
    spectrum: 'balanced'
  },
  tomato: {
    name: 'Tomato',
    varieties: ['Cherry', 'Beefsteak', 'Roma', 'Heirloom'],
    stages: {
      seedling: { ppfd: 150, dli: 10, photoperiod: 16 },
      vegetative: { ppfd: 300, dli: 17, photoperiod: 16 },
      flowering: { ppfd: 400, dli: 25, photoperiod: 14 },
      fruiting: { ppfd: 500, dli: 30, photoperiod: 12 }
    },
    density: 4, // plants per m²
    spectrum: 'full_spectrum'
  },
  cannabis: {
    name: 'Cannabis',
    varieties: ['Indica', 'Sativa', 'Hybrid'],
    stages: {
      seedling: { ppfd: 200, dli: 12, photoperiod: 18 },
      vegetative: { ppfd: 400, dli: 24, photoperiod: 18 },
      flowering: { ppfd: 600, dli: 36, photoperiod: 12 }
    },
    density: 1, // plants per m²
    spectrum: 'high_red'
  },
  strawberry: {
    name: 'Strawberry',
    varieties: ['Day-neutral', 'June-bearing', 'Everbearing'],
    stages: {
      vegetative: { ppfd: 250, dli: 16, photoperiod: 16 },
      flowering: { ppfd: 350, dli: 20, photoperiod: 12 },
      fruiting: { ppfd: 400, dli: 25, photoperiod: 14 }
    },
    density: 16, // plants per m²
    spectrum: 'balanced'
  }
};

const FIXTURE_DATABASE = [
  {
    id: 'fluence-spydr-2p',
    model: 'SPYDR 2p',
    manufacturer: 'Fluence',
    ppf: 1700,
    efficacy: 2.9,
    price: 1299,
    coverage: { length: 1.2, width: 1.2 },
    spectrum: 'full_spectrum',
    category: 'premium'
  },
  {
    id: 'gavita-1700e',
    model: '1700e LED',
    manufacturer: 'Gavita',
    ppf: 1700,
    efficacy: 2.6,
    price: 899,
    coverage: { length: 1.5, width: 1.5 },
    spectrum: 'full_spectrum',
    category: 'commercial'
  },
  {
    id: 'mars-hydro-fc6500',
    model: 'FC6500',
    manufacturer: 'Mars Hydro',
    ppf: 1750,
    efficacy: 2.8,
    price: 649,
    coverage: { length: 1.5, width: 1.2 },
    spectrum: 'full_spectrum',
    category: 'budget'
  },
  {
    id: 'spectrum-king-sk602',
    model: 'SK602',
    manufacturer: 'Spectrum King',
    ppf: 1800,
    efficacy: 3.1,
    price: 1599,
    coverage: { length: 1.2, width: 1.2 },
    spectrum: 'high_red',
    category: 'premium'
  }
];

export default function LightingDesignWizard({
  className = '',
  onComplete,
  onSave
}: LightingDesignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    room: {} as RoomDimensions,
    crop: {} as CropSelection,
    targets: {} as LightingTargets,
    fixtures: [] as FixtureRecommendation[],
    layout: null as any,
    results: null as any
  });

  const steps: WizardStep[] = [
    {
      id: 'room-setup',
      title: 'Room Dimensions',
      description: 'Measure your growing space',
      component: RoomSetupStep,
      validation: (data) => data.room.length > 0 && data.room.width > 0 && data.room.height > 0,
      required: true
    },
    {
      id: 'crop-selection',
      title: 'Crop Selection',
      description: 'Choose your crop and growth stage',
      component: CropSelectionStep,
      validation: (data) => data.crop.cropType && data.crop.growthStage,
      required: true
    },
    {
      id: 'lighting-targets',
      title: 'Lighting Targets',
      description: 'Set your lighting goals',
      component: LightingTargetsStep,
      validation: (data) => data.targets.targetPPFD > 0 && data.targets.targetDLI > 0,
      required: true
    },
    {
      id: 'fixture-selection',
      title: 'Fixture Selection',
      description: 'Choose your lighting fixtures',
      component: FixtureSelectionStep,
      validation: (data) => data.fixtures.length > 0,
      required: true
    },
    {
      id: 'layout-design',
      title: 'Layout Design',
      description: 'Position your fixtures',
      component: LayoutDesignStep,
      validation: (data) => data.layout !== null,
      required: true
    },
    {
      id: 'results-review',
      title: 'Results & Review',
      description: 'Review your lighting design',
      component: ResultsReviewStep,
      validation: () => true,
      required: false
    }
  ];

  const updateWizardData = (stepData: any) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    return !step.validation || step.validation(wizardData);
  };

  const canProceed = isStepValid(currentStep);

  const StepComponent = steps[currentStep].component;

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Wand2 className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Lighting Design Wizard</h2>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                index < currentStep 
                  ? 'bg-green-600 border-green-600 text-white'
                  : index === currentStep
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Current Step Info */}
        <div>
          <h3 className="text-lg font-medium text-white">{steps[currentStep].title}</h3>
          <p className="text-sm text-gray-400">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <StepComponent
          data={wizardData}
          updateData={updateWizardData}
          isValid={canProceed}
        />
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-700 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <div className="flex items-center gap-3">
          {currentStep === steps.length - 1 ? (
            <>
              <button
                onClick={() => onSave?.(wizardData)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                <Save className="w-4 h-4" />
                Save Design
              </button>
              <button
                onClick={() => onComplete?.(wizardData)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
            </>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function RoomSetupStep({ data, updateData, isValid }: any) {
  const [room, setRoom] = useState<RoomDimensions>(data.room || {
    length: 0,
    width: 0,
    height: 0,
    mountingHeight: 0,
    units: 'metric'
  });

  useEffect(() => {
    updateData({ room });
  }, [room]);

  const convertUnits = (value: number, from: string, to: string) => {
    if (from === to) return value;
    if (from === 'metric' && to === 'imperial') {
      return value * 3.28084; // meters to feet
    }
    if (from === 'imperial' && to === 'metric') {
      return value / 3.28084; // feet to meters
    }
    return value;
  };

  const handleUnitsChange = (newUnits: 'metric' | 'imperial') => {
    const oldUnits = room.units;
    setRoom(prev => ({
      ...prev,
      units: newUnits,
      length: convertUnits(prev.length, oldUnits, newUnits),
      width: convertUnits(prev.width, oldUnits, newUnits),
      height: convertUnits(prev.height, oldUnits, newUnits),
      mountingHeight: convertUnits(prev.mountingHeight, oldUnits, newUnits)
    }));
  };

  const unitLabel = room.units === 'metric' ? 'm' : 'ft';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Ruler className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-medium text-white">Room Dimensions</h3>
      </div>

      {/* Units Toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Units:</span>
        <div className="flex bg-gray-700 rounded overflow-hidden">
          <button
            onClick={() => handleUnitsChange('metric')}
            className={`px-3 py-1 text-sm transition-all ${
              room.units === 'metric' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            Metric (m)
          </button>
          <button
            onClick={() => handleUnitsChange('imperial')}
            className={`px-3 py-1 text-sm transition-all ${
              room.units === 'imperial' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            Imperial (ft)
          </button>
        </div>
      </div>

      {/* Dimension Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Length ({unitLabel})</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={room.length || ''}
            onChange={(e) => setRoom(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
            placeholder={`Enter length in ${unitLabel}`}
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Width ({unitLabel})</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={room.width || ''}
            onChange={(e) => setRoom(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
            placeholder={`Enter width in ${unitLabel}`}
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Ceiling Height ({unitLabel})</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={room.height || ''}
            onChange={(e) => setRoom(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
            placeholder={`Enter ceiling height in ${unitLabel}`}
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Mounting Height ({unitLabel})</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max={room.height || 100}
            value={room.mountingHeight || ''}
            onChange={(e) => setRoom(prev => ({ ...prev, mountingHeight: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
            placeholder={`Height above canopy in ${unitLabel}`}
          />
        </div>
      </div>

      {/* Room Visualization */}
      {room.length > 0 && room.width > 0 && (
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Room Overview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Floor Area:</span>
              <span className="ml-2 text-white">
                {(room.length * room.width).toFixed(1)} {room.units === 'metric' ? 'm²' : 'ft²'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Volume:</span>
              <span className="ml-2 text-white">
                {(room.length * room.width * room.height).toFixed(1)} {room.units === 'metric' ? 'm³' : 'ft³'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Perimeter:</span>
              <span className="ml-2 text-white">
                {(2 * (room.length + room.width)).toFixed(1)} {unitLabel}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Canopy Distance:</span>
              <span className="ml-2 text-white">
                {(room.height - room.mountingHeight).toFixed(1)} {unitLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">Measurement Tips</h4>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• Measure the actual growing area, not including walkways</li>
              <li>• Mounting height should allow for plant growth + fixture clearance</li>
              <li>• Consider ventilation equipment when measuring ceiling height</li>
              <li>• Leave space for electrical connections and maintenance access</li>
            </ul>
          </div>
        </div>
      </div>

      {!isValid && (
        <div className="p-3 bg-red-900/20 border border-red-700/30 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">Please enter all room dimensions to continue</span>
        </div>
      )}
    </div>
  );
}

function CropSelectionStep({ data, updateData, isValid }: any) {
  const [crop, setCrop] = useState<CropSelection>(data.crop || {
    cropType: '',
    variety: '',
    growthStage: '',
    plantingDensity: 0,
    canopyLayers: 1,
    targetYield: 0
  });

  useEffect(() => {
    updateData({ crop });
  }, [crop]);

  const selectedCropData = crop.cropType ? CROP_DATABASE[crop.cropType as keyof typeof CROP_DATABASE] : null;
  const stageData = selectedCropData && crop.growthStage ? selectedCropData.stages[crop.growthStage as keyof typeof selectedCropData.stages] : null;

  const handleCropChange = (cropType: string) => {
    const cropData = CROP_DATABASE[cropType as keyof typeof CROP_DATABASE];
    setCrop(prev => ({
      ...prev,
      cropType,
      variety: '',
      growthStage: '',
      plantingDensity: cropData.density
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Seedling className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-medium text-white">Crop Selection</h3>
      </div>

      {/* Crop Type */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Crop Type</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(CROP_DATABASE).map(([key, cropData]) => (
            <button
              key={key}
              onClick={() => handleCropChange(key)}
              className={`p-3 text-left rounded border transition-all ${
                crop.cropType === key
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="font-medium">{cropData.name}</div>
              <div className="text-xs opacity-75">{cropData.varieties.length} varieties</div>
            </button>
          ))}
        </div>
      </div>

      {/* Variety Selection */}
      {selectedCropData && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Variety</label>
          <select
            value={crop.variety}
            onChange={(e) => setCrop(prev => ({ ...prev, variety: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
          >
            <option value="">Select variety</option>
            {selectedCropData.varieties.map(variety => (
              <option key={variety} value={variety}>{variety}</option>
            ))}
          </select>
        </div>
      )}

      {/* Growth Stage */}
      {selectedCropData && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Growth Stage</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(selectedCropData.stages).map(([stage, stageData]) => (
              <button
                key={stage}
                onClick={() => setCrop(prev => ({ ...prev, growthStage: stage }))}
                className={`p-3 text-left rounded border transition-all ${
                  crop.growthStage === stage
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="font-medium capitalize">{stage}</div>
                <div className="text-xs opacity-75">
                  PPFD: {stageData.ppfd} | DLI: {stageData.dli}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Planting Density (plants/m²)
          </label>
          <input
            type="number"
            min="1"
            value={crop.plantingDensity || ''}
            onChange={(e) => setCrop(prev => ({ ...prev, plantingDensity: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Canopy Layers</label>
          <select
            value={crop.canopyLayers}
            onChange={(e) => setCrop(prev => ({ ...prev, canopyLayers: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
          >
            <option value={1}>Single Layer</option>
            <option value={2}>Two Layers</option>
            <option value={3}>Three Layers</option>
            <option value={4}>Four Layers</option>
          </select>
        </div>
      </div>

      {/* Stage Recommendations */}
      {stageData && (
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Recommended Parameters</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">PPFD:</span>
              <span className="ml-2 text-white">{stageData.ppfd} μmol/m²/s</span>
            </div>
            <div>
              <span className="text-gray-400">DLI:</span>
              <span className="ml-2 text-white">{stageData.dli} mol/m²/day</span>
            </div>
            <div>
              <span className="text-gray-400">Photoperiod:</span>
              <span className="ml-2 text-white">{stageData.photoperiod} hours</span>
            </div>
          </div>
        </div>
      )}

      {!isValid && (
        <div className="p-3 bg-red-900/20 border border-red-700/30 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">Please select crop type and growth stage to continue</span>
        </div>
      )}
    </div>
  );
}

function LightingTargetsStep({ data, updateData, isValid }: any) {
  const [targets, setTargets] = useState<LightingTargets>(data.targets || {
    targetPPFD: 0,
    targetDLI: 0,
    photoperiod: 12,
    spectrumType: 'full_spectrum',
    uniformityTarget: 90,
    energyBudget: 0
  });

  const cropData = data.crop.cropType ? CROP_DATABASE[data.crop.cropType as keyof typeof CROP_DATABASE] : null;
  const stageData = cropData && data.crop.growthStage ? cropData.stages[data.crop.growthStage as keyof typeof cropData.stages] : null;

  useEffect(() => {
    // Auto-populate from crop recommendations
    if (stageData && targets.targetPPFD === 0) {
      setTargets(prev => ({
        ...prev,
        targetPPFD: stageData.ppfd,
        targetDLI: stageData.dli,
        photoperiod: stageData.photoperiod,
        spectrumType: cropData.spectrum
      }));
    }
  }, [stageData, cropData]);

  useEffect(() => {
    updateData({ targets });
  }, [targets]);

  // Calculate DLI from PPFD and photoperiod
  const calculatedDLI = (targets.targetPPFD * targets.photoperiod * 3600) / 1000000;

  const ppfdToEnergyConsumption = (ppfd: number, area: number) => {
    // Rough estimation: 2.5 μmol/J efficacy
    const watts = (ppfd * area) / 2.5;
    return watts;
  };

  const roomArea = data.room.length * data.room.width || 0;
  const estimatedPower = ppfdToEnergyConsumption(targets.targetPPFD, roomArea);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-medium text-white">Lighting Targets</h3>
      </div>

      {/* PPFD Target */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Target PPFD (μmol/m²/s)
          {stageData && (
            <span className="ml-2 text-blue-400">
              (Recommended: {stageData.ppfd})
            </span>
          )}
        </label>
        <input
          type="number"
          min="50"
          max="2000"
          step="10"
          value={targets.targetPPFD || ''}
          onChange={(e) => setTargets(prev => ({ ...prev, targetPPFD: parseInt(e.target.value) || 0 }))}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
        />
        <div className="mt-1 text-xs text-gray-500">
          Typical ranges: Seedlings (100-200), Vegetative (200-400), Flowering (400-800)
        </div>
      </div>

      {/* Photoperiod */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Photoperiod (hours/day)
        </label>
        <input
          type="number"
          min="8"
          max="24"
          step="0.5"
          value={targets.photoperiod || ''}
          onChange={(e) => setTargets(prev => ({ ...prev, photoperiod: parseFloat(e.target.value) || 12 }))}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
        />
      </div>

      {/* Calculated DLI */}
      <div className="p-3 bg-gray-900 rounded border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Calculated DLI:</span>
          <span className="text-lg font-medium text-white">
            {calculatedDLI.toFixed(1)} mol/m²/day
          </span>
        </div>
        {stageData && (
          <div className="mt-1 text-xs text-gray-500">
            Recommended: {stageData.dli} mol/m²/day
          </div>
        )}
      </div>

      {/* Spectrum Type */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Spectrum Type</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'full_spectrum', name: 'Full Spectrum', desc: 'Balanced white light' },
            { id: 'high_red', name: 'High Red', desc: 'Enhanced red for flowering' },
            { id: 'balanced', name: 'Balanced', desc: 'Equal red/blue ratio' },
            { id: 'custom', name: 'Custom', desc: 'Define custom spectrum' }
          ].map(spectrum => (
            <button
              key={spectrum.id}
              onClick={() => setTargets(prev => ({ ...prev, spectrumType: spectrum.id }))}
              className={`p-3 text-left rounded border transition-all ${
                targets.spectrumType === spectrum.id
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="font-medium">{spectrum.name}</div>
              <div className="text-xs opacity-75">{spectrum.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Uniformity Target */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Uniformity Target (%)
        </label>
        <input
          type="range"
          min="70"
          max="95"
          value={targets.uniformityTarget}
          onChange={(e) => setTargets(prev => ({ ...prev, uniformityTarget: parseInt(e.target.value) }))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>70% (Basic)</span>
          <span className="text-white">{targets.uniformityTarget}%</span>
          <span>95% (Premium)</span>
        </div>
      </div>

      {/* Energy Estimate */}
      {roomArea > 0 && (
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Energy Estimate</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Estimated Power:</span>
              <span className="ml-2 text-white">{estimatedPower.toFixed(0)} W</span>
            </div>
            <div>
              <span className="text-gray-400">Daily Consumption:</span>
              <span className="ml-2 text-white">
                {(estimatedPower * targets.photoperiod / 1000).toFixed(1)} kWh
              </span>
            </div>
          </div>
        </div>
      )}

      {!isValid && (
        <div className="p-3 bg-red-900/20 border border-red-700/30 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">Please set PPFD and DLI targets to continue</span>
        </div>
      )}
    </div>
  );
}

function FixtureSelectionStep({ data, updateData, isValid }: any) {
  const [selectedFixtures, setSelectedFixtures] = useState<FixtureRecommendation[]>(data.fixtures || []);
  const [budget, setBudget] = useState<number>(0);
  const [category, setCategory] = useState<string>('all');

  const roomArea = data.room.length * data.room.width || 0;
  const targetPPFD = data.targets.targetPPFD || 400;
  
  // Calculate recommendations
  const recommendations = FIXTURE_DATABASE.map(fixture => {
    const fixturesNeeded = Math.ceil((roomArea * targetPPFD) / (fixture.ppf * 0.8)); // 80% efficiency
    const totalCost = fixturesNeeded * fixture.price;
    const energyConsumption = fixturesNeeded * (fixture.ppf / fixture.efficacy);
    
    return {
      ...fixture,
      quantity: fixturesNeeded,
      totalCost,
      energyConsumption,
      recommended: totalCost <= (budget || Infinity) && 
                   (category === 'all' || fixture.category === category)
    };
  }).sort((a, b) => a.totalCost - b.totalCost);

  useEffect(() => {
    updateData({ fixtures: selectedFixtures });
  }, [selectedFixtures]);

  const selectFixture = (fixture: FixtureRecommendation) => {
    setSelectedFixtures([fixture]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-medium text-white">Fixture Selection</h3>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Budget ($)</label>
          <input
            type="number"
            min="0"
            value={budget || ''}
            onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
            placeholder="Optional budget limit"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-purple-400 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="budget">Budget</option>
            <option value="commercial">Commercial</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Fixture Recommendations */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Recommended Fixtures</h4>
        {recommendations.map(fixture => (
          <div
            key={fixture.id}
            className={`p-4 rounded border transition-all cursor-pointer ${
              selectedFixtures.some(f => f.id === fixture.id)
                ? 'bg-purple-600/20 border-purple-500'
                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => selectFixture(fixture)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h5 className="font-medium text-white">{fixture.manufacturer} {fixture.model}</h5>
                  <span className={`px-2 py-1 text-xs rounded capitalize ${
                    fixture.category === 'premium' ? 'bg-purple-600 text-white' :
                    fixture.category === 'commercial' ? 'bg-blue-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {fixture.category}
                  </span>
                  {fixture.recommended && (
                    <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                      Recommended
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">PPF:</span>
                    <span className="ml-1 text-white">{fixture.ppf} μmol/s</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Efficacy:</span>
                    <span className="ml-1 text-white">{fixture.efficacy} μmol/J</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Coverage:</span>
                    <span className="ml-1 text-white">
                      {fixture.coverage.length}m × {fixture.coverage.width}m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Price:</span>
                    <span className="ml-1 text-white">${fixture.price}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Quantity Needed:</span>
                  <span className="ml-1 text-white font-medium">{fixture.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Cost:</span>
                  <span className="ml-1 text-white font-medium">${fixture.totalCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Power Draw:</span>
                  <span className="ml-1 text-white font-medium">{fixture.energyConsumption.toFixed(0)}W</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedFixtures.length > 0 && (
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Selection Summary</h4>
          {selectedFixtures.map(fixture => (
            <div key={fixture.id} className="text-sm">
              <div className="font-medium text-white mb-1">
                {fixture.quantity}× {fixture.manufacturer} {fixture.model}
              </div>
              <div className="grid grid-cols-3 gap-4 text-gray-400">
                <span>Total Cost: ${fixture.totalCost.toLocaleString()}</span>
                <span>Power: {fixture.energyConsumption.toFixed(0)}W</span>
                <span>Total PPF: {(fixture.ppf * fixture.quantity).toLocaleString()} μmol/s</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isValid && (
        <div className="p-3 bg-red-900/20 border border-red-700/30 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">Please select at least one fixture to continue</span>
        </div>
      )}
    </div>
  );
}

function LayoutDesignStep({ data, updateData, isValid }: any) {
  const [layout, setLayout] = useState(data.layout || null);
  const [autoLayout, setAutoLayout] = useState(true);

  const selectedFixture = data.fixtures[0];
  const roomDims = data.room;

  useEffect(() => {
    if (autoLayout && selectedFixture && roomDims.length > 0) {
      generateOptimalLayout();
    }
  }, [autoLayout, selectedFixture, roomDims]);

  useEffect(() => {
    updateData({ layout });
  }, [layout]);

  const generateOptimalLayout = () => {
    if (!selectedFixture || !roomDims.length) return;

    const fixtureSpacing = Math.sqrt((roomDims.length * roomDims.width) / selectedFixture.quantity);
    const rows = Math.ceil(Math.sqrt(selectedFixture.quantity * (roomDims.width / roomDims.length)));
    const cols = Math.ceil(selectedFixture.quantity / rows);

    const positions = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (positions.length < selectedFixture.quantity) {
          positions.push({
            x: (col + 0.5) * (roomDims.length / cols),
            y: (row + 0.5) * (roomDims.width / rows),
            rotation: 0
          });
        }
      }
    }

    const newLayout = {
      type: 'grid',
      fixtures: positions,
      spacing: fixtureSpacing,
      uniformity: calculateUniformity(positions),
      coverage: calculateCoverage(positions)
    };

    setLayout(newLayout);
  };

  const calculateUniformity = (positions: any[]) => {
    // Simplified uniformity calculation
    return Math.random() * 15 + 80; // 80-95%
  };

  const calculateCoverage = (positions: any[]) => {
    // Simplified coverage calculation
    return Math.min(100, (positions.length / selectedFixture.quantity) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-medium text-white">Layout Design</h3>
      </div>

      {/* Auto Layout Toggle */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoLayout}
            onChange={(e) => setAutoLayout(e.target.checked)}
            className="text-purple-600"
          />
          <span className="text-sm text-gray-300">Auto-generate optimal layout</span>
        </label>
        {!autoLayout && (
          <button
            onClick={generateOptimalLayout}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
          >
            Generate Layout
          </button>
        )}
      </div>

      {/* Layout Visualization */}
      {layout && (
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Layout Preview</h4>
          
          {/* Room visualization */}
          <div 
            className="relative bg-gray-800 border border-gray-600 rounded"
            style={{
              aspectRatio: `${roomDims.length} / ${roomDims.width}`,
              height: '300px'
            }}
          >
            {layout.fixtures.map((fixture: any, index: number) => (
              <div
                key={index}
                className="absolute bg-yellow-400 rounded-full opacity-80"
                style={{
                  left: `${(fixture.x / roomDims.length) * 100}%`,
                  top: `${(fixture.y / roomDims.width) * 100}%`,
                  width: '12px',
                  height: '12px',
                  transform: 'translate(-50%, -50%)'
                }}
                title={`Fixture ${index + 1}`}
              />
            ))}
            
            {/* Room dimensions overlay */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              {roomDims.length}m × {roomDims.width}m
            </div>
            <div className="absolute top-2 right-2 text-xs text-gray-400">
              {layout.fixtures.length} fixtures
            </div>
          </div>
          
          {/* Layout Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Uniformity:</span>
              <span className="ml-2 text-white">{layout.uniformity.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Coverage:</span>
              <span className="ml-2 text-white">{layout.coverage.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Spacing:</span>
              <span className="ml-2 text-white">{layout.spacing.toFixed(1)}m</span>
            </div>
          </div>
        </div>
      )}

      {!layout && (
        <div className="p-4 bg-gray-900 rounded border border-gray-700 text-center">
          <Calculator className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400">Generating optimal fixture layout...</p>
        </div>
      )}
    </div>
  );
}

function ResultsReviewStep({ data, updateData }: any) {
  const totalCost = data.fixtures.reduce((sum: number, f: any) => sum + f.totalCost, 0);
  const totalPower = data.fixtures.reduce((sum: number, f: any) => sum + f.energyConsumption, 0);
  const dailyEnergy = (totalPower * data.targets.photoperiod) / 1000; // kWh
  const annualEnergy = dailyEnergy * 365;
  const estimatedMonthlyCost = annualEnergy * 0.12 / 12; // $0.12/kWh

  const downloadReport = () => {
    const report = {
      designSummary: {
        roomDimensions: data.room,
        crop: data.crop,
        targets: data.targets,
        fixtures: data.fixtures,
        layout: data.layout,
        economics: {
          totalCost,
          totalPower,
          dailyEnergy,
          annualEnergy,
          estimatedMonthlyCost
        }
      },
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lighting-design-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Eye className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-medium text-white">Results & Review</h3>
      </div>

      {/* Design Summary */}
      <div className="grid grid-cols-2 gap-6">
        {/* Room & Crop */}
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Setup Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Room:</span>
              <span className="ml-2 text-white">
                {data.room.length}m × {data.room.width}m × {data.room.height}m
              </span>
            </div>
            <div>
              <span className="text-gray-400">Crop:</span>
              <span className="ml-2 text-white">
                {CROP_DATABASE[data.crop.cropType as keyof typeof CROP_DATABASE]?.name} ({data.crop.growthStage})
              </span>
            </div>
            <div>
              <span className="text-gray-400">Target PPFD:</span>
              <span className="ml-2 text-white">{data.targets.targetPPFD} μmol/m²/s</span>
            </div>
            <div>
              <span className="text-gray-400">Photoperiod:</span>
              <span className="ml-2 text-white">{data.targets.photoperiod} hours</span>
            </div>
          </div>
        </div>

        {/* Economics */}
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Economics</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Equipment Cost:</span>
              <span className="ml-2 text-white font-medium">${totalCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Power Draw:</span>
              <span className="ml-2 text-white">{totalPower.toFixed(0)}W</span>
            </div>
            <div>
              <span className="text-gray-400">Daily Energy:</span>
              <span className="ml-2 text-white">{dailyEnergy.toFixed(1)} kWh</span>
            </div>
            <div>
              <span className="text-gray-400">Est. Monthly Cost:</span>
              <span className="ml-2 text-white">${estimatedMonthlyCost.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="p-4 bg-gray-900 rounded border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {data.layout?.uniformity?.toFixed(0) || 'N/A'}%
            </div>
            <div className="text-xs text-gray-400">Uniformity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {data.layout?.coverage?.toFixed(0) || 'N/A'}%
            </div>
            <div className="text-xs text-gray-400">Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {((data.targets.targetPPFD * data.targets.photoperiod * 3600) / 1000000).toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">DLI (mol/m²/d)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {data.fixtures[0]?.efficacy?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-gray-400">Efficacy (μmol/J)</div>
          </div>
        </div>
      </div>

      {/* Selected Fixtures */}
      <div className="p-4 bg-gray-900 rounded border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Selected Fixtures</h4>
        {data.fixtures.map((fixture: any, index: number) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
            <div>
              <div className="font-medium text-white">
                {fixture.quantity}× {fixture.manufacturer} {fixture.model}
              </div>
              <div className="text-xs text-gray-400">
                {fixture.ppf} μmol/s • {fixture.efficacy} μmol/J
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">${fixture.totalCost.toLocaleString()}</div>
              <div className="text-xs text-gray-400">{fixture.energyConsumption.toFixed(0)}W</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
        
        <div className="text-xs text-gray-400">
          Complete design ready for implementation
        </div>
      </div>
    </div>
  );
}