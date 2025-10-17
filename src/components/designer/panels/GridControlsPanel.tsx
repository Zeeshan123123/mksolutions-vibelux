'use client';

import React, { useState, useEffect } from 'react';
import { Grid3x3, Eye, EyeOff, Ruler, Settings } from 'lucide-react';
import { GridService, GridSettings } from '@/lib/cad/grid-service';
import { cn } from '@/lib/utils';

interface GridControlsPanelProps {
  gridService: GridService;
  onSettingsChange?: (settings: GridSettings) => void;
  className?: string;
}

export function GridControlsPanel({ 
  gridService, 
  onSettingsChange,
  className 
}: GridControlsPanelProps) {
  const [settings, setSettings] = useState<GridSettings>(gridService.getSettings());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = (key: keyof GridSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    gridService.updateSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const increments = settings.unit === 'imperial' 
    ? GridService.ARCHITECTURAL_INCREMENTS 
    : GridService.METRIC_INCREMENTS;

  return (
    <div className={cn("bg-gray-800 rounded-lg p-3 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
          <Grid3x3 className="w-4 h-4" />
          Grid & Snap
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Advanced Settings"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateSetting('visible', !settings.visible)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
            settings.visible 
              ? "bg-purple-600 text-white" 
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          )}
          title={settings.visible ? "Hide Grid" : "Show Grid"}
        >
          {settings.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Grid
        </button>

        <button
          onClick={() => updateSetting('snapEnabled', !settings.snapEnabled)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
            settings.snapEnabled 
              ? "bg-purple-600 text-white" 
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          )}
          title={settings.snapEnabled ? "Disable Snap" : "Enable Snap"}
        >
          <Ruler className="w-3 h-3" />
          Snap
        </button>

        <div className="flex-1" />

        <select
          value={settings.unit}
          onChange={(e) => updateSetting('unit', e.target.value)}
          className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs"
        >
          <option value="imperial">Imperial</option>
          <option value="metric">Metric</option>
        </select>
      </div>

      {/* Snap Increment Buttons */}
      <div className="space-y-1">
        <div className="text-xs text-gray-400 mb-1">Snap Increment</div>
        <div className="grid grid-cols-4 gap-1">
          {increments.slice(0, 8).map((inc) => (
            <button
              key={inc.value}
              onClick={() => updateSetting('snapIncrement', inc.value)}
              className={cn(
                "px-2 py-1 rounded text-xs transition-colors",
                settings.snapIncrement === inc.value
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
              title={`Snap to ${inc.label}`}
            >
              {inc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-3 pt-3 border-t border-gray-700">
          {/* Grid Style */}
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Grid Style</div>
            <div className="flex gap-1">
              {['dots', 'lines', 'crosses'].map((style) => (
                <button
                  key={style}
                  onClick={() => updateSetting('gridStyle', style as any)}
                  className={cn(
                    "px-3 py-1 rounded text-xs capitalize transition-colors",
                    settings.gridStyle === style
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Major Grid Lines */}
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Major Grid Every</div>
            <input
              type="number"
              value={settings.majorGridLines}
              onChange={(e) => updateSetting('majorGridLines', parseInt(e.target.value) || 1)}
              className="w-full px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs"
              min="1"
              max="100"
            />
          </div>

          {/* Grid Colors */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Grid Color</div>
              <input
                type="color"
                value={settings.gridColor}
                onChange={(e) => updateSetting('gridColor', e.target.value)}
                className="w-full h-6 bg-gray-700 rounded cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Major Color</div>
              <input
                type="color"
                value={settings.majorGridColor}
                onChange={(e) => updateSetting('majorGridColor', e.target.value)}
                className="w-full h-6 bg-gray-700 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Custom Increment */}
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Custom Increment</div>
            <div className="flex gap-1">
              <input
                type="number"
                value={settings.snapIncrement}
                onChange={(e) => updateSetting('snapIncrement', parseFloat(e.target.value) || 0.25)}
                className="flex-1 px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs"
                step="0.0625"
                min="0.0625"
              />
              <span className="px-2 py-1 text-xs text-gray-400">
                {settings.unit === 'imperial' ? 'inches' : 'mm'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}