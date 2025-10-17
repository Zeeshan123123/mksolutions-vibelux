'use client';

import React, { useState } from 'react';
import { X, FileDown, FileUp, Ruler, Square, Circle, Triangle, Minus, Grid, Move, Copy, Trash2, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface CADToolsPanelProps {
  onClose: () => void;
}

export function CADToolsPanel({ onClose }: CADToolsPanelProps) {
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(12); // inches

  const tools = [
    { id: 'select', icon: Move, label: 'Select' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'polygon', icon: Triangle, label: 'Polygon' },
    { id: 'measure', icon: Ruler, label: 'Measure' },
  ];

  const actions = [
    { id: 'copy', icon: Copy, label: 'Copy' },
    { id: 'delete', icon: Trash2, label: 'Delete' },
    { id: 'rotate', icon: RotateCw, label: 'Rotate' },
    { id: 'flipH', icon: FlipHorizontal, label: 'Flip H' },
    { id: 'flipV', icon: FlipVertical, label: 'Flip V' },
  ];

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Grid className="h-5 w-5" />
          CAD Tools
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Drawing Tools */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Drawing Tools</h4>
        <div className="grid grid-cols-3 gap-2">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-3 rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  selectedTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Actions</h4>
        <div className="grid grid-cols-5 gap-2">
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                title={action.label}
              >
                <Icon className="h-4 w-4 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Settings */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Grid Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Show Grid</span>
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={(e) => setGridEnabled(e.target.checked)}
              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Snap to Grid</span>
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <div>
            <label className="text-sm text-gray-300">Grid Size (inches)</label>
            <input
              type="number"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value) || 12)}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
            />
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors">
          <FileUp className="h-4 w-4" />
          Import DWG/DXF
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors">
          <FileDown className="h-4 w-4" />
          Export CAD
        </button>
      </div>
    </div>
  );
}