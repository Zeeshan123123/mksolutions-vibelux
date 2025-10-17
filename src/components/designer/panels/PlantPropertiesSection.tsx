'use client';

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  TrendingUp, 
  Ruler, 
  AlertCircle, 
  RefreshCw,
  Info,
  Lightbulb,
  Droplets,
  Wind,
  BookOpen
} from 'lucide-react';
import { ADVANCED_CROP_DATABASE, type AdvancedCropSpec } from '@/lib/plants/advanced-plant-system';
import { RESEARCH_BACKED_CROPS, getCitationForMetric, isRecommendationValid } from '@/lib/plants/research-backed-crop-data';
import { ResearchReferencePanel } from './ResearchReferencePanel';
import { EXPANDED_CROP_SPECIFICATIONS, CROPS_BY_CATEGORY } from '@/lib/plants/expanded-plant-specifications';

interface PlantPropertiesSectionProps {
  selectedObject: any;
  onUpdate: (property: string, value: any) => void;
}

export function PlantPropertiesSection({ selectedObject, onUpdate }: PlantPropertiesSectionProps) {
  const [showHeightWarning, setShowHeightWarning] = useState(false);
  const [recommendedHeight, setRecommendedHeight] = useState<number | null>(null);
  const [cropSpec, setCropSpec] = useState<AdvancedCropSpec | null>(null);
  const [showCitation, setShowCitation] = useState<string | null>(null);
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  
  // Map variety to crop ID
  const getCropId = (variety: string): string => {
    const mapping: Record<string, string> = {
      'lettuce': 'butterhead-lettuce',
      'tomato': 'high-wire-tomato',
      'tomatoes': 'high-wire-tomato',
      'high-wire': 'high-wire-tomato',
      'cannabis': 'cannabis-sativa',
      'hemp': 'cannabis-sativa',
      'basil': 'genovese-basil',
      'herbs': 'genovese-basil',
      'strawberry': 'strawberry',
      'strawberries': 'strawberry'
    };
    return mapping[variety] || variety;
  };

  // Update crop spec when variety changes
  useEffect(() => {
    const cropId = selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce');
    const spec = ADVANCED_CROP_DATABASE[cropId] || EXPANDED_CROP_SPECIFICATIONS[cropId];
    setCropSpec(spec);
    
    if (spec) {
      // Get recommended height based on growth stage
      const stage = selectedObject.growthStage || 'vegetative';
      const stageData = spec.growthStages.find(s => s.name === stage);
      if (stageData) {
        const heightInFeet = stageData.heightInches / 12;
        setRecommendedHeight(heightInFeet);
        
        // Check if current height is significantly different
        const currentHeight = selectedObject.height;
        const difference = Math.abs(currentHeight - heightInFeet);
        setShowHeightWarning(difference > heightInFeet * 0.3); // 30% difference triggers warning
      }
    }
  }, [selectedObject.variety, selectedObject.growthStage, selectedObject.cropId]);

  const handleVarietyChange = (variety: string) => {
    const cropId = getCropId(variety);
    onUpdate('variety', variety);
    onUpdate('cropId', cropId);
    
    // Auto-update height to recommended value
    const spec = ADVANCED_CROP_DATABASE[cropId];
    if (spec) {
      const stage = selectedObject.growthStage || 'vegetative';
      const stageData = spec.growthStages.find(s => s.name === stage);
      if (stageData) {
        onUpdate('height', stageData.heightInches / 12);
      }
    }
  };

  const handleGrowthStageChange = (stage: string) => {
    onUpdate('growthStage', stage);
    
    // Auto-update height when growth stage changes
    if (cropSpec) {
      const stageData = cropSpec.growthStages.find(s => s.name === stage);
      if (stageData) {
        onUpdate('height', stageData.heightInches / 12);
      }
    }
  };

  const resetToRecommendedHeight = () => {
    if (recommendedHeight !== null) {
      onUpdate('height', recommendedHeight);
      setShowHeightWarning(false);
    }
  };

  // Get lighting recommendations
  const getLightingRecommendations = () => {
    if (!cropSpec) return null;
    
    const stage = selectedObject.growthStage || 'vegetative';
    const stageData = cropSpec.growthStages.find(s => s.name === stage);
    if (!stageData) return null;

    return {
      ppfd: stageData.lightRequirements.topLighting.ppfd,
      photoperiod: stageData.lightRequirements.topLighting.photoperiod,
      dli: cropSpec.yieldModel.optimalDLI,
      needsInterlighting: cropSpec.lightingStrategies.interLighting?.recommended,
      needsUnderCanopy: cropSpec.lightingStrategies.underCanopy?.beneficial
    };
  };

  const lightingRecs = getLightingRecommendations();

  return (
    <>
      {/* Plant Variety Selection */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            Plant Variety
          </label>
          <select
            value={selectedObject.variety || 'lettuce'}
            onChange={(e) => handleVarietyChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm hover:border-blue-500 transition-colors"
          >
            <optgroup label="Leafy Greens ({CROPS_BY_CATEGORY.leafy?.length || 0} varieties)">
              {CROPS_BY_CATEGORY.leafy?.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({Math.round(crop.height)}" tall) ✓
                </option>
              )) || (
                <>
                  <option value="lettuce">Butterhead Lettuce (6" tall) ✓</option>
                  <option value="microgreens">Microgreens (3" tall)</option>
                </>
              )}
            </optgroup>
            <optgroup label="Fruiting Crops ({CROPS_BY_CATEGORY.fruiting?.length || 0} varieties)">
              {CROPS_BY_CATEGORY.fruiting?.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({crop.height > 12 ? `${Math.round(crop.height/12)}ft` : `${Math.round(crop.height)}"`} tall) ✓
                </option>
              )) || (
                <>
                  <option value="high-wire-tomato">High-Wire Tomatoes (15ft tall) ✓</option>
                  <option value="tomato">Standard Tomatoes (6ft tall)</option>
                </>
              )}
            </optgroup>
            <optgroup label="Herbs ({CROPS_BY_CATEGORY.herb?.length || 0} varieties)">
              {CROPS_BY_CATEGORY.herb?.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({Math.round(crop.height)}" tall) ✓
                </option>
              )) || (
                <>
                  <option value="basil">Genovese Basil (2ft tall)</option>
                  <option value="herbs">Mixed Herbs (1-2ft tall)</option>
                </>
              )}
            </optgroup>
            <optgroup label="Specialty Crops ({CROPS_BY_CATEGORY.specialty?.length || 0} varieties)">
              {CROPS_BY_CATEGORY.specialty?.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({Math.round(crop.height)}" tall) ✓
                </option>
              )) || (
                <>
                  <option value="cannabis">Cannabis (4ft tall) ✓</option>
                  <option value="strawberry">Strawberries (8" tall)</option>
                </>
              )}
            </optgroup>
          </select>
        </div>

        {/* Growth Stage with Icons */}
        <div>
          <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Growth Stage
          </label>
          <select
            value={selectedObject.growthStage || 'vegetative'}
            onChange={(e) => handleGrowthStageChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm hover:border-blue-500 transition-colors"
          >
            {cropSpec?.growthStages.map(stage => (
              <option key={stage.name} value={stage.name}>
                {stage.name.charAt(0).toUpperCase() + stage.name.slice(1)} 
                ({Math.round(stage.heightInches)}" tall, {stage.durationDays} days)
              </option>
            )) || (
              <>
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="harvest">Harvest</option>
              </>
            )}
          </select>
        </div>

        {/* Smart Height Editor */}
        <div>
          <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Ruler className="w-3 h-3" />
            Plant Height
            {showHeightWarning && (
              <span className="text-yellow-500 flex items-center gap-1 ml-auto">
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs">Non-standard height</span>
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={selectedObject.height.toFixed(1)}
              onChange={(e) => onUpdate('height', parseFloat(e.target.value))}
              className={`flex-1 px-2 py-1 bg-gray-700 border rounded text-sm ${
                showHeightWarning ? 'border-yellow-500' : 'border-gray-600'
              }`}
              step="0.5"
              min="0.1"
            />
            <span className="text-xs text-gray-400">ft</span>
            {showHeightWarning && recommendedHeight && (
              <button
                onClick={resetToRecommendedHeight}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs flex items-center gap-1 transition-colors"
                title={`Reset to recommended ${recommendedHeight.toFixed(1)}ft`}
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
          {recommendedHeight && (
            <p className="text-xs text-gray-500 mt-1">
              Recommended: {recommendedHeight.toFixed(1)}ft for {selectedObject.growthStage || 'this stage'}
            </p>
          )}
        </div>

        {/* Plant Spacing */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Plant Spacing</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={selectedObject.spacing || (cropSpec?.spacing.optimal || 12)}
              onChange={(e) => onUpdate('spacing', parseFloat(e.target.value))}
              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
              step="1"
              min="1"
            />
            <span className="text-xs text-gray-400">inches</span>
          </div>
          {cropSpec && (
            <p className="text-xs text-gray-500 mt-1">
              Recommended: {cropSpec.spacing.optimal}" ({cropSpec.spacing.plantsPerSqFt} plants/sq ft)
            </p>
          )}
        </div>

        {/* Lighting Requirements Info Box */}
        {lightingRecs && (
          <div className="bg-gray-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Lighting Requirements
              {RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')] && (
                <button
                  onClick={() => setShowCitation(showCitation === 'lighting' ? null : 'lighting')}
                  className="ml-auto text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  Research
                </button>
              )}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Target PPFD:</span>
                <span className="text-white">{lightingRecs.ppfd} μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Photoperiod:</span>
                <span className="text-white">{lightingRecs.photoperiod} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Optimal DLI:</span>
                <span className="text-white">{lightingRecs.dli} mol/m²/day</span>
              </div>
              {lightingRecs.needsInterlighting && (
                <div className="flex items-center gap-1 text-blue-400 mt-2">
                  <Info className="w-3 h-3" />
                  <span>Interlighting recommended for tall plants</span>
                </div>
              )}
              {lightingRecs.needsUnderCanopy && (
                <div className="flex items-center gap-1 text-purple-400 mt-1">
                  <Info className="w-3 h-3" />
                  <span>Under-canopy lighting beneficial</span>
                </div>
              )}
            </div>
            
            {/* Research Citation Panel */}
            {showCitation === 'lighting' && RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')] && (
              <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-600">
                <p className="text-xs font-medium text-blue-400 mb-1">Research Source:</p>
                <p className="text-xs text-gray-300">
                  {RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')].lightingData.ppfd.citation.authors} ({RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')].lightingData.ppfd.citation.year})
                </p>
                <p className="text-xs text-gray-400 italic mt-1">
                  "{RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')].lightingData.ppfd.citation.title}"
                </p>
                {RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')].lightingData.ppfd.citation.url && (
                  <a 
                    href={RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')].lightingData.ppfd.citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
                  >
                    View Paper →
                  </a>
                )}
                <div className="mt-2 space-y-1">
                  {RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')].lightingData.ppfd.citation.keyFindings.map((finding, idx) => (
                    <p key={idx} className="text-xs text-gray-400">• {finding}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Environmental Needs */}
        {cropSpec && (
          <div className="bg-gray-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Wind className="w-4 h-4 text-blue-400" />
              Environmental Needs
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Temperature:</span>
                <span className="text-white">
                  {cropSpec.growthStages[0].environmentalNeeds.temperature.day}°F day / 
                  {cropSpec.growthStages[0].environmentalNeeds.temperature.night}°F night
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Humidity:</span>
                <span className="text-white">{cropSpec.growthStages[0].environmentalNeeds.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CO₂:</span>
                <span className="text-white">{cropSpec.growthStages[0].environmentalNeeds.co2} ppm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VPD Range:</span>
                <span className="text-white">
                  {cropSpec.growthStages[0].environmentalNeeds.vpd.min}-
                  {cropSpec.growthStages[0].environmentalNeeds.vpd.max} kPa
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Suggest lighting for this plant
                onUpdate('needsLightingUpdate', true);
              }}
              className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white flex items-center justify-center gap-1 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              Optimize Lighting
            </button>
            <button
              onClick={() => {
                // Apply recommended settings
                if (cropSpec) {
                  const stage = selectedObject.growthStage || 'vegetative';
                  const stageData = cropSpec.growthStages.find(s => s.name === stage);
                  if (stageData) {
                    onUpdate('height', stageData.heightInches / 12);
                    onUpdate('spacing', cropSpec.spacing.optimal);
                  }
                }
              }}
              className="flex-1 px-2 py-1.5 bg-gray-600 hover:bg-gray-700 rounded text-xs text-white flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Apply Defaults
            </button>
          </div>
          
          {/* Research Button */}
          {RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')] && (
            <button
              onClick={() => setShowResearchPanel(true)}
              className="w-full px-2 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs text-white flex items-center justify-center gap-1 transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              View Research Papers ({Object.keys(RESEARCH_BACKED_CROPS[selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')]).length} sources)
            </button>
          )}
        </div>
      </div>
      
      {/* Research Reference Panel */}
      <ResearchReferencePanel
        cropId={selectedObject.cropId || getCropId(selectedObject.variety || 'lettuce')}
        isOpen={showResearchPanel}
        onClose={() => setShowResearchPanel(false)}
      />
    </>
  );
}