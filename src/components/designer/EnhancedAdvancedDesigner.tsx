'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AdvancedDesignerProfessional } from './AdvancedDesignerProfessional';
import { GridService } from '@/lib/cad/grid-service';
import { AIALayerManager } from '@/lib/cad/aia-layer-standards';
import { DimensionTools } from '@/lib/cad/dimension-tools';
import { CADKeyboardShortcuts } from '@/lib/cad/keyboard-shortcuts';
import { GridControlsPanel } from './panels/GridControlsPanel';
import { CommandLine } from './ui/CommandLine';
import { AIALayersPanel } from './panels/AIALayersPanel';
import { DimensionToolbar } from './tools/DimensionToolbar';
import { cn } from '@/lib/utils';

interface EnhancedAdvancedDesignerProps {
  className?: string;
}

/**
 * Enhanced Advanced Designer with Professional CAD Features
 * Wraps the existing AdvancedDesignerProfessional with additional CAD tools
 */
export function EnhancedAdvancedDesigner({ className }: EnhancedAdvancedDesignerProps) {
  // Initialize CAD services
  const [gridService] = useState(() => new GridService());
  const [layerManager] = useState(() => new AIALayerManager());
  const [dimensionTools] = useState(() => new DimensionTools(gridService));
  const [keyboardShortcuts] = useState(() => new CADKeyboardShortcuts());
  
  // UI state
  const [showGridControls, setShowGridControls] = useState(true);
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [showDimensionToolbar, setShowDimensionToolbar] = useState(false);
  
  // Canvas ref for grid rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize keyboard shortcuts
  useEffect(() => {
    if (containerRef.current) {
      keyboardShortcuts.registerHandler(containerRef.current);
      
      // Register command handlers
      const unsubscribers = [
        keyboardShortcuts.onCommand('LINE', () => setActiveTool('line')),
        keyboardShortcuts.onCommand('CIRCLE', () => setActiveTool('circle')),
        keyboardShortcuts.onCommand('RECTANGLE', () => setActiveTool('rectangle')),
        keyboardShortcuts.onCommand('DIMENSION', () => {
          setActiveTool('dimension');
          setShowDimensionToolbar(true);
        }),
        keyboardShortcuts.onCommand('MOVE', () => setActiveTool('move')),
        keyboardShortcuts.onCommand('COPY', () => setActiveTool('copy')),
        keyboardShortcuts.onCommand('ROTATE', () => setActiveTool('rotate')),
        keyboardShortcuts.onCommand('GRID', () => {
          const settings = gridService.getSettings();
          gridService.updateSettings({ ...settings, visible: !settings.visible });
        }),
        keyboardShortcuts.onCommand('SNAP', () => {
          const settings = gridService.getSettings();
          gridService.updateSettings({ ...settings, snapEnabled: !settings.snapEnabled });
        }),
      ];
      
      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    }
  }, [keyboardShortcuts, gridService]);

  // Handle command line commands
  const handleCommand = useCallback((command: string, args: string[]) => {
    console.log('Command:', command, 'Args:', args);
    
    // Handle layer commands
    if (command === 'LAYER') {
      setShowLayersPanel(true);
    }
    
    // Handle grid commands
    else if (command === 'GRID') {
      if (args[0] === 'ON') {
        gridService.updateSettings({ ...gridService.getSettings(), visible: true });
      } else if (args[0] === 'OFF') {
        gridService.updateSettings({ ...gridService.getSettings(), visible: false });
      } else {
        const settings = gridService.getSettings();
        gridService.updateSettings({ ...settings, visible: !settings.visible });
      }
    }
    
    // Pass other commands to keyboard shortcuts
    else {
      keyboardShortcuts.executeCommand(command);
    }
  }, [gridService, keyboardShortcuts]);

  return (
    <div ref={containerRef} className={cn("relative h-full", className)}>
      {/* Grid overlay canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Main designer component */}
      <AdvancedDesignerProfessional />
      
      {/* Enhanced CAD panels */}
      <div className="absolute top-20 left-4 space-y-4 z-20">
        {/* Grid Controls */}
        {showGridControls && (
          <GridControlsPanel
            gridService={gridService}
            onSettingsChange={() => {
              // Trigger grid redraw
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  // Grid rendering would happen here based on viewport
                }
              }
            }}
          />
        )}
        
        {/* Dimension Toolbar */}
        {showDimensionToolbar && activeTool === 'dimension' && (
          <DimensionToolbar
            dimensionTools={dimensionTools}
            onClose={() => setShowDimensionToolbar(false)}
          />
        )}
      </div>
      
      {/* Layers Panel */}
      {showLayersPanel && (
        <div className="absolute top-20 right-4 z-20">
          <AIALayersPanel
            layerManager={layerManager}
            onClose={() => setShowLayersPanel(false)}
          />
        </div>
      )}
      
      {/* Command Line */}
      <CommandLine
        onCommand={handleCommand}
        shortcuts={keyboardShortcuts}
        position="bottom"
      />
      
      {/* Professional Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-900 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400 z-30">
        <div className="flex items-center gap-4">
          <span>Grid: {gridService.getSettings().snapIncrement}"</span>
          <span>Layer: {layerManager.getActiveLayer().name}</span>
          <span>Tool: {activeTool.toUpperCase()}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <span>SNAP: {gridService.getSettings().snapEnabled ? 'ON' : 'OFF'}</span>
          <span>GRID: {gridService.getSettings().visible ? 'ON' : 'OFF'}</span>
          <span>ORTHO: OFF</span>
        </div>
      </div>
    </div>
  );
}