'use client';

import React, { useState } from 'react';
import { Ruler, X, Square, Circle, RotateCw, Minus } from 'lucide-react';
import { DimensionTools } from '@/lib/cad/dimension-tools';
import { cn } from '@/lib/utils';

interface DimensionToolbarProps {
  dimensionTools: DimensionTools;
  onClose?: () => void;
  className?: string;
}

export function DimensionToolbar({ dimensionTools, onClose, className }: DimensionToolbarProps) {
  const [activeType, setActiveType] = useState<string>('linear');
  const [currentStyle, setCurrentStyle] = useState('ARCHITECTURAL');

  const dimensionTypes = [
    { id: 'linear', icon: Minus, label: 'Linear', shortcut: 'DLI' },
    { id: 'aligned', icon: RotateCw, label: 'Aligned', shortcut: 'DAL' },
    { id: 'angular', icon: Circle, label: 'Angular', shortcut: 'DAN' },
    { id: 'radial', icon: Circle, label: 'Radius', shortcut: 'DRA' },
    { id: 'diameter', icon: Circle, label: 'Diameter', shortcut: 'DDI' },
    { id: 'chain', icon: Square, label: 'Chain', shortcut: 'DCH' },
  ];

  const handleStyleChange = (styleName: string) => {
    const style = (DimensionTools.STYLES as any)[styleName];
    if (style) {
      dimensionTools.setStyle(style);
      setCurrentStyle(styleName);
    }
  };

  return (
    <div className={cn("bg-gray-800 rounded-lg shadow-xl p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
          <Ruler className="w-4 h-4" />
          Dimension Tools
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

      {/* Dimension Types */}
      <div className="grid grid-cols-3 gap-1 mb-3">
        {dimensionTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-2 rounded transition-colors",
              activeType === type.id
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
            title={`${type.label} (${type.shortcut})`}
          >
            <type.icon className="w-4 h-4" />
            <span className="text-xs">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400">Dimension Style</div>
        <select
          value={currentStyle}
          onChange={(e) => handleStyleChange(e.target.value)}
          className="w-full px-2 py-1 bg-gray-700 text-gray-200 rounded text-sm"
        >
          <option value="ARCHITECTURAL">Architectural</option>
          <option value="ENGINEERING">Engineering</option>
          <option value="DECIMAL">Decimal</option>
        </select>
      </div>

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        <div>Click points to create dimensions</div>
        <div>ESC to cancel • Enter to confirm</div>
      </div>
    </div>
  );
}