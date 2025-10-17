'use client';

import React, { useState } from 'react';
import { 
  Sun, Settings, ChevronDown, Clock, Globe, Zap,
  Home, Tent, Leaf, Building, Pencil, BarChart3, Activity, FileDown
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface CompactTopToolbarProps {
  selectedCrop?: string;
  onCropChange?: (crop: string) => void;
  photoperiod?: number;
  onPhotoperiodChange?: (value: number) => void;
  onModeChange?: (mode: 'design' | 'analyze' | 'simulate' | 'output') => void;
  currentMode?: 'design' | 'analyze' | 'simulate' | 'output';
}

const modeConfigs = {
  design: { label: 'Design', icon: Pencil, color: 'text-blue-600' },
  analyze: { label: 'Analyze', icon: BarChart3, color: 'text-purple-600' },
  simulate: { label: 'Simulate', icon: Activity, color: 'text-green-600' },
  output: { label: 'Output', icon: FileDown, color: 'text-orange-600' }
};

export function CompactTopToolbar({
  selectedCrop = 'custom',
  photoperiod = 12,
  onPhotoperiodChange,
  onModeChange,
  currentMode = 'design'
}: CompactTopToolbarProps) {
  const { state } = useDesigner();
  const { showNotification } = useNotifications();
  const [showModeMenu, setShowModeMenu] = useState(false);
  
  const currentModeConfig = modeConfigs[currentMode];

  return (
    <div className="h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 relative z-50">
      {/* Left Section - Logo and Mode */}
      <div className="flex items-center gap-6 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">VibeLux</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">Pro</span>
          </div>
        </div>
        
        {/* Mode Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowModeMenu(!showModeMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <currentModeConfig.icon className={`w-4 h-4 ${currentModeConfig.color}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentModeConfig.label}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Center Section - Room Type and Stats */}
      <div className="flex items-center gap-4 flex-1 justify-center max-w-lg">
        {/* Room Type Selector */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 bg-purple-600 text-white"
            title="Indoor Room"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:block">Room</span>
          </button>
          <button
            className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            title="Greenhouse"
          >
            <Tent className="w-4 h-4" />
            <span className="hidden sm:block">Greenhouse</span>
          </button>
        </div>

        {/* Crop Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Leaf className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Hr:</span>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={photoperiod}
              onChange={(e) => onPhotoperiodChange?.(Number(e.target.value))}
              className="w-12 px-1 py-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-center focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            PPFD: <strong className="text-gray-800 dark:text-gray-200">{state.calculations?.averagePPFD?.toFixed(0) || 0}</strong>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            DLI: <strong className="text-green-600 dark:text-green-400">{((state.calculations?.averagePPFD || 0) * photoperiod * 0.0036).toFixed(1)}</strong>
          </div>
        </div>
      </div>

      {/* Right Section - Tools */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'solarDLI' }))}
          className="px-3 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors flex items-center gap-2"
          title="Solar DLI Calculator"
        >
          <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300 hidden md:block">Solar</span>
        </button>
        
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'electricalDesignOutput' }))}
          className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center gap-2"
          title="Electrical Design"
        >
          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300 hidden md:block">Electrical</span>
        </button>

        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}