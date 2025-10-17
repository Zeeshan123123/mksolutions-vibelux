'use client';

import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, X, Plus } from 'lucide-react';
import { AIALayerManager, LayerProperties, AIA_LAYER_GROUPS } from '@/lib/cad/aia-layer-standards';
import { cn } from '@/lib/utils';

interface AIALayersPanelProps {
  layerManager: AIALayerManager;
  onClose?: () => void;
  className?: string;
}

export function AIALayersPanel({ layerManager, onClose, className }: AIALayersPanelProps) {
  const [layers, setLayers] = useState(layerManager.getAllLayers());
  const [activeLayer, setActiveLayer] = useState(layerManager.getActiveLayer());
  const [filter, setFilter] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Electrical']));

  const handleSetActiveLayer = (layerName: string) => {
    layerManager.setActiveLayer(layerName);
    setActiveLayer(layerManager.getActiveLayer());
  };

  const toggleVisibility = (layerName: string) => {
    layerManager.toggleLayerVisibility(layerName);
    setLayers([...layerManager.getAllLayers()]);
  };

  const toggleLock = (layerName: string) => {
    layerManager.toggleLayerLock(layerName);
    setLayers([...layerManager.getAllLayers()]);
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredGroups = AIA_LAYER_GROUPS.map(group => ({
    ...group,
    layers: group.layers.filter(layer => 
      layer.name.toLowerCase().includes(filter.toLowerCase()) ||
      layer.description.toLowerCase().includes(filter.toLowerCase())
    )
  })).filter(group => group.layers.length > 0);

  return (
    <div className={cn("bg-gray-800 rounded-lg shadow-xl w-80", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-200">AIA Layers</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Current Layer */}
      <div className="px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-1">Current Layer</div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: activeLayer.color }}
          />
          <span className="text-sm font-medium text-white">{activeLayer.name}</span>
          <span className="text-xs text-gray-400">({activeLayer.description})</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-700">
        <input
          type="text"
          placeholder="Search layers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-2 py-1 bg-gray-700 text-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* Layer Groups */}
      <div className="max-h-96 overflow-y-auto">
        {filteredGroups.map(group => (
          <div key={group.name} className="border-b border-gray-700 last:border-b-0">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">{group.name}</span>
                <span className="text-xs text-gray-500">({group.layers.length})</span>
              </div>
              <svg
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  expandedGroups.has(group.name) && "rotate-90"
                )}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Group Layers */}
            {expandedGroups.has(group.name) && (
              <div className="bg-gray-850">
                {group.layers.map(layer => (
                  <div
                    key={layer.name}
                    className={cn(
                      "px-4 py-1 flex items-center gap-2 hover:bg-gray-700 cursor-pointer transition-colors",
                      activeLayer.name === layer.name && "bg-purple-900 bg-opacity-30"
                    )}
                    onClick={() => handleSetActiveLayer(layer.name)}
                  >
                    {/* Color */}
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: layer.color }}
                    />
                    
                    {/* Name */}
                    <span className="text-xs font-mono text-gray-300 flex-1">
                      {layer.name}
                    </span>
                    
                    {/* Controls */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.name);
                      }}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title={layer.visible ? "Hide Layer" : "Show Layer"}
                    >
                      {layer.visible ? (
                        <Eye className="w-3 h-3 text-gray-400" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(layer.name);
                      }}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                    >
                      {layer.locked ? (
                        <Lock className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Unlock className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between">
        <button className="text-xs text-purple-400 hover:text-purple-300">
          New Layer...
        </button>
        <button className="text-xs text-gray-400 hover:text-gray-300">
          Layer Properties...
        </button>
      </div>
    </div>
  );
}