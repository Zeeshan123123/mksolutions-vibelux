'use client';

import React, { useState } from 'react';
import { 
  Leaf, 
  Grid3x3, 
  Lightbulb,
  Layers,
  TrendingUp,
  Settings,
  Plus,
  Copy
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { ADVANCED_CROP_DATABASE } from '@/lib/plants/advanced-plant-system';

export function PlantToolbar() {
  const { state, addObject, dispatch, showNotification } = useDesigner();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('butterhead-lettuce');

  const handleAddPlant = () => {
    const room = state.room;
    if (!room) {
      showNotification('warning', 'Please create a room first');
      return;
    }

    const cropSpec = ADVANCED_CROP_DATABASE[selectedCrop];
    if (!cropSpec) return;

    // Add single plant at room center
    const centerX = room.width / 2;
    const centerY = room.length / 2;
    const stage = cropSpec.growthStages.find(s => s.name === 'vegetative') || cropSpec.growthStages[0];

    addObject({
      type: 'plant',
      x: centerX,
      y: centerY,
      z: 0,
      rotation: 0,
      width: cropSpec.architecture.matureWidth / 12, // Convert inches to feet
      length: cropSpec.architecture.matureWidth / 12,
      height: stage.heightInches / 12,
      enabled: true,
      variety: selectedCrop,
      cropId: selectedCrop,
      growthStage: 'vegetative',
      targetDLI: cropSpec.yieldModel.optimalDLI,
      customName: cropSpec.commonName
    });

    showNotification('success', `Added ${cropSpec.commonName} plant`);
  };

  const handleAddPlantGrid = () => {
    const room = state.room;
    if (!room) {
      showNotification('warning', 'Please create a room first');
      return;
    }

    const cropSpec = ADVANCED_CROP_DATABASE[selectedCrop];
    if (!cropSpec) return;

    // Calculate optimal grid based on crop spacing
    const spacingFeet = cropSpec.spacing.optimal / 12;
    const cols = Math.floor(room.width * 0.8 / spacingFeet);
    const rows = Math.floor(room.length * 0.8 / spacingFeet);
    
    const startX = (room.width - (cols - 1) * spacingFeet) / 2;
    const startY = (room.length - (rows - 1) * spacingFeet) / 2;
    const stage = cropSpec.growthStages.find(s => s.name === 'vegetative') || cropSpec.growthStages[0];

    let count = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        addObject({
          type: 'plant',
          x: startX + col * spacingFeet,
          y: startY + row * spacingFeet,
          z: 0,
          rotation: 0,
          width: cropSpec.architecture.matureWidth / 12,
          length: cropSpec.architecture.matureWidth / 12,
          height: stage.heightInches / 12,
          enabled: true,
          variety: selectedCrop,
          cropId: selectedCrop,
          growthStage: 'vegetative',
          targetDLI: cropSpec.yieldModel.optimalDLI,
          customName: `${cropSpec.commonName}-${row}-${col}`
        });
        count++;
      }
    }

    showNotification('success', `Added ${count} ${cropSpec.commonName} plants in ${rows}x${cols} grid`);
  };

  const handleDuplicatePlants = () => {
    const plants = state.objects.filter(obj => obj.type === 'plant' && state.ui.selectedObjectIds.includes(obj.id));
    if (plants.length === 0) {
      showNotification('info', 'Select plants to duplicate first');
      return;
    }

    plants.forEach(plant => {
      addObject({
        ...plant,
        id: undefined as any, // Will be auto-generated
        x: plant.x + 2,
        y: plant.y + 2,
        customName: plant.customName ? `${plant.customName}-copy` : undefined
      });
    });

    showNotification('success', `Duplicated ${plants.length} plant(s)`);
  };

  const handleAdvanceGrowthStage = () => {
    const plants = state.objects.filter(obj => obj.type === 'plant' && state.ui.selectedObjectIds.includes(obj.id));
    if (plants.length === 0) {
      showNotification('info', 'Select plants to advance growth stage');
      return;
    }

    plants.forEach(plant => {
      const cropSpec = ADVANCED_CROP_DATABASE[plant.cropId || plant.variety];
      if (!cropSpec) return;

      const currentStageIndex = cropSpec.growthStages.findIndex(s => s.name === plant.growthStage);
      const nextStageIndex = Math.min(currentStageIndex + 1, cropSpec.growthStages.length - 1);
      const nextStage = cropSpec.growthStages[nextStageIndex];

      dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          id: plant.id,
          updates: {
            growthStage: nextStage.name,
            height: nextStage.heightInches / 12
          }
        }
      });
    });

    showNotification('success', `Advanced growth stage for ${plants.length} plant(s)`);
    dispatch({ type: 'RECALCULATE' });
  };

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 transition-all duration-300 ${
      isExpanded ? 'w-auto' : 'w-14'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
        title="Plant Tools"
      >
        <Leaf className="w-5 h-5 text-green-400" />
      </button>

      {/* Expanded Toolbar */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-700">
          {/* Crop Selection */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Select Crop Type</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            >
              <optgroup label="Leafy Greens">
                <option value="butterhead-lettuce">Butterhead Lettuce</option>
              </optgroup>
              <optgroup label="Vining Crops">
                <option value="high-wire-tomato">High-Wire Tomatoes</option>
              </optgroup>
              <optgroup label="Herbs">
                <option value="genovese-basil">Genovese Basil</option>
              </optgroup>
              <optgroup label="Specialty">
                <option value="cannabis-sativa">Cannabis</option>
                <option value="strawberry">Strawberries</option>
              </optgroup>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddPlant}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center justify-center gap-1 transition-colors"
              title="Add single plant"
            >
              <Plus className="w-3 h-3" />
              Add Plant
            </button>
            <button
              onClick={handleAddPlantGrid}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center justify-center gap-1 transition-colors"
              title="Add plant grid"
            >
              <Grid3x3 className="w-3 h-3" />
              Add Grid
            </button>
            <button
              onClick={handleDuplicatePlants}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center justify-center gap-1 transition-colors"
              title="Duplicate selected plants"
            >
              <Copy className="w-3 h-3" />
              Duplicate
            </button>
            <button
              onClick={handleAdvanceGrowthStage}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center justify-center gap-1 transition-colors"
              title="Advance growth stage"
            >
              <TrendingUp className="w-3 h-3" />
              Grow
            </button>
          </div>

          {/* Quick Info */}
          {selectedCrop && ADVANCED_CROP_DATABASE[selectedCrop] && (
            <div className="mt-3 p-2 bg-gray-700 rounded text-xs text-gray-300">
              <div className="font-medium text-white mb-1">
                {ADVANCED_CROP_DATABASE[selectedCrop].commonName}
              </div>
              <div className="space-y-0.5">
                <div>Height: {ADVANCED_CROP_DATABASE[selectedCrop].architecture.matureHeight}"</div>
                <div>Spacing: {ADVANCED_CROP_DATABASE[selectedCrop].spacing.optimal}"</div>
                <div>DLI: {ADVANCED_CROP_DATABASE[selectedCrop].yieldModel.optimalDLI} mol/m²/day</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}