'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Eye, 
  EyeOff, 
  Download, 
  Settings,
  RefreshCw,
  Info,
  Palette,
  BarChart3,
  Sun
} from 'lucide-react';
import { DataVisualization } from '@/lib/autodesk/data-visualization';

interface PPFDHeatmapControlsProps {
  viewer: any;
  fixtures: any[];
  roomDimensions: any;
  photoperiod?: number;
}

export function PPFDHeatmapControls({ 
  viewer, 
  fixtures, 
  roomDimensions,
  photoperiod = 12 
}: PPFDHeatmapControlsProps) {
  const [dataViz, setDataViz] = useState<DataVisualization | null>(null);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [visualizationType, setVisualizationType] = useState<'ppfd' | 'dli' | 'uniformity'>('ppfd');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Initialize Data Visualization
  useEffect(() => {
    if (viewer && !dataViz) {
      const viz = new DataVisualization(viewer);
      viz.initialize().then(() => {
        setDataViz(viz);
        logger.info('system', 'Data Visualization initialized');
      }).catch(error => {
        logger.error('system', 'Failed to initialize Data Visualization:', error );
      });
    }

    return () => {
      if (dataViz) {
        dataViz.dispose();
      }
    };
  }, [viewer]);

  // Auto-update heatmap when fixtures change
  useEffect(() => {
    if (autoUpdate && heatmapVisible && dataViz && fixtures.length > 0) {
      updateHeatmap();
    }
  }, [fixtures, autoUpdate, heatmapVisible]);

  const updateHeatmap = async () => {
    if (!dataViz) return;
    
    setIsLoading(true);
    try {
      switch (visualizationType) {
        case 'ppfd':
          await dataViz.createPPFDHeatmap(fixtures, roomDimensions);
          break;
        case 'dli':
          await dataViz.createDLIVisualization(
            dataViz['heatmapData'], // Access internal data
            photoperiod
          );
          break;
        case 'uniformity':
          const uniformityMetrics = await dataViz.createUniformityMap(
            dataViz['heatmapData']
          );
          setMetrics(uniformityMetrics);
          break;
      }
    } catch (error) {
      logger.error('system', 'Failed to update heatmap:', error );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHeatmap = async () => {
    if (!dataViz) return;
    
    const newVisibility = !heatmapVisible;
    setHeatmapVisible(newVisibility);
    
    if (newVisibility) {
      await updateHeatmap();
    } else {
      await dataViz.toggleHeatmap(false);
    }
  };

  const exportHeatmap = async () => {
    if (!dataViz) return;
    
    try {
      const imageUrl = await dataViz.exportHeatmapImage();
      
      // Download the image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${visualizationType}-heatmap-${Date.now()}.png`;
      link.click();
    } catch (error) {
      logger.error('system', 'Failed to export heatmap:', error );
    }
  };

  const changeVisualizationType = async (type: 'ppfd' | 'dli' | 'uniformity') => {
    setVisualizationType(type);
    if (heatmapVisible) {
      await updateHeatmap();
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Light Analysis
        </h3>
        <button
          onClick={toggleHeatmap}
          className={`p-2 rounded-lg transition-colors ${
            heatmapVisible 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          title={heatmapVisible ? 'Hide heatmap' : 'Show heatmap'}
        >
          {heatmapVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Visualization Type Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Visualization Type</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => changeVisualizationType('ppfd')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              visualizationType === 'ppfd'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            PPFD
          </button>
          <button
            onClick={() => changeVisualizationType('dli')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              visualizationType === 'dli'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            DLI
          </button>
          <button
            onClick={() => changeVisualizationType('uniformity')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              visualizationType === 'uniformity'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            Uniformity
          </button>
        </div>
      </div>

      {/* Metrics Display */}
      {metrics && (
        <div className="mb-4 p-3 bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Analysis Metrics
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Average PPFD:</span>
              <span className="text-white">{metrics.average?.toFixed(0)} μmol/m²/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Min/Max:</span>
              <span className="text-white">
                {metrics.min?.toFixed(0)} / {metrics.max?.toFixed(0)} μmol/m²/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uniformity:</span>
              <span className={`font-medium ${
                metrics.uniformity > 0.7 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {(metrics.uniformity * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          Color Scale
        </h4>
        <div className="space-y-1">
          {visualizationType === 'ppfd' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>0-200 μmol/m²/s (Low)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>200-600 μmol/m²/s (Medium)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>600-1000 μmol/m²/s (High)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>&gt;1000 μmol/m²/s (Very High)</span>
              </div>
            </>
          )}
          {visualizationType === 'dli' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>0-10 mol/m²/day (Low)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>10-20 mol/m²/day (Medium)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>20-40 mol/m²/day (High)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>&gt;40 mol/m²/day (Very High)</span>
              </div>
            </>
          )}
          {visualizationType === 'uniformity' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>&lt;10% deviation (Excellent)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>10-20% deviation (Good)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>20-30% deviation (Fair)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>&gt;30% deviation (Poor)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">Auto-update</label>
          <button
            onClick={() => setAutoUpdate(!autoUpdate)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoUpdate ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoUpdate ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={updateHeatmap}
            disabled={isLoading || !heatmapVisible}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Updating...' : 'Refresh'}
          </button>
          <button
            onClick={exportHeatmap}
            disabled={!heatmapVisible}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-300">
          <Info className="w-3 h-3 inline mr-1" />
          Heatmap shows light distribution at canopy level. 
          {fixtures.length === 0 && ' Add fixtures to see visualization.'}
        </p>
      </div>
    </div>
  );
}