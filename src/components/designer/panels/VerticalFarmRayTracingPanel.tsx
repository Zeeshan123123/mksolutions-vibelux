'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Settings, Download, Eye, Lightbulb, Target, BarChart3 } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { MultiLayerCanopyRayTracer, CanopyLayer, LeafOpticalProperties, SpectralPowerDistribution } from '@/lib/photonics/multi-layer-canopy-raytracer';
import { vec3 } from 'gl-matrix';

interface RayTracingResults {
  ppfdByLayer: Map<string, number>;
  uniformityByLayer: Map<string, { min: number; max: number; avg: number; cv: number; }>;
  penetrationProfile: { depth: number; ppfd: number; }[];
  totalPPFD: number;
  lightCapture: number;
  recommendation: string;
}

interface VerticalFarmRayTracingPanelProps {
  onClose: () => void;
}

export function VerticalFarmRayTracingPanel({ onClose }: VerticalFarmRayTracingPanelProps) {
  const { state } = useDesigner();
  const { room, objects } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<RayTracingResults | null>(null);
  const [settings, setSettings] = useState({
    cropType: 'lettuce',
    layerHeight: 0.8, // meters
    numberOfLayers: 3,
    raysPerPixel: 2000,
    enableScattering: true,
    enableFluorescence: true
  });

  const cropProfiles = {
    lettuce: {
      name: 'Lettuce',
      lai: 2.5,
      leafAngle: 'spherical' as const,
      chlorophyll: 30,
      waterContent: 850
    },
    basil: {
      name: 'Basil',
      lai: 3.2,
      leafAngle: 'spherical' as const,
      chlorophyll: 35,
      waterContent: 800
    },
    spinach: {
      name: 'Spinach',
      lai: 2.8,
      leafAngle: 'planophile' as const,
      chlorophyll: 40,
      waterContent: 900
    },
    kale: {
      name: 'Kale',
      lai: 3.5,
      leafAngle: 'erectophile' as const,
      chlorophyll: 45,
      waterContent: 820
    }
  };

  const runRayTracing = async () => {
    if (!room || objects.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      // Create ray tracer with professional settings
      const rayTracer = new MultiLayerCanopyRayTracer({
        raysPerPixel: settings.raysPerPixel,
        maxBounces: 12,
        wavelengthSamples: 41, // Higher spectral resolution
        enableVolumetricScattering: settings.enableScattering,
        enableFluorescence: settings.enableFluorescence,
        convergenceThreshold: 0.005
      });

      // Set room dimensions (convert feet to meters)
      rayTracer.setRoom(
        room.width * 0.3048,
        room.length * 0.3048, 
        room.height * 0.3048,
        room.reflectances.walls
      );

      // Create vertical farm layers
      const cropProfile = cropProfiles[settings.cropType as keyof typeof cropProfiles];
      const opticalProps: LeafOpticalProperties = createOpticalProperties(cropProfile);

      for (let layer = 0; layer < settings.numberOfLayers; layer++) {
        const layerHeight = (room.height * 0.3048) - (layer + 1) * settings.layerHeight - 0.5;
        
        rayTracer.addLayer({
          id: `layer-${layer}`,
          height: layerHeight,
          thickness: settings.layerHeight * 0.8, // 80% of layer height for plants
          lai: cropProfile.lai,
          leafAngleDistribution: { type: cropProfile.leafAngle },
          leafOpticalProperties: opticalProps,
          plantDensity: 25, // plants/m²
          growthStage: 'mature',
          species: cropProfile.name
        });
      }

      // Add fixtures from designer
      const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);
      fixtures.forEach((fixture, index) => {
        if (!fixture.model) return;

        // Create realistic LED spectrum
        const spectrum = createLEDSpectrum(fixture.model.spectrum || 'Full Spectrum');
        
        rayTracer.addLightSource({
          position: vec3.fromValues(
            fixture.x * 0.3048, // Convert feet to meters
            fixture.y * 0.3048,
            fixture.z * 0.3048
          ),
          spectrum: new SpectralPowerDistribution(spectrum),
          intensity: (fixture.model.ppf || 1000) * (fixture.dimmingLevel || 100) / 100,
          distribution: 'lambertian',
          beamAngle: fixture.model.beamAngle || 120
        });
      });

      // Run ray tracing simulation
      const result = await rayTracer.trace(0.1); // 10cm grid resolution

      // Process results
      const processedResults: RayTracingResults = {
        ppfdByLayer: result.ppfdByLayer,
        uniformityByLayer: result.uniformityByLayer,
        penetrationProfile: calculatePenetrationProfile(result),
        totalPPFD: Array.from(result.ppfdByLayer.values()).reduce((sum, ppfd) => sum + ppfd, 0),
        lightCapture: calculateLightCapture(result, fixtures),
        recommendation: generateRecommendation(result, cropProfile, fixtures.length)
      };

      setResults(processedResults);
      visualizeResults(processedResults);

    } catch (error) {
      console.error('Ray tracing error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createOpticalProperties = (cropProfile: typeof cropProfiles.lettuce): LeafOpticalProperties => {
    const props = {
      reflectance: new Array(401),
      transmittance: new Array(401),
      absorptance: new Array(401),
      chlorophyllContent: cropProfile.chlorophyll,
      carotenoidContent: 8,
      waterContent: cropProfile.waterContent,
      dryMatter: 50
    };

    // Generate realistic spectral properties for leafy greens
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      if (wavelength >= 400 && wavelength <= 500) { // Blue region
        props.reflectance[i] = 0.05;
        props.transmittance[i] = 0.05;
        props.absorptance[i] = 0.90;
      } else if (wavelength >= 500 && wavelength <= 600) { // Green region
        props.reflectance[i] = 0.15; // Higher green reflection
        props.transmittance[i] = 0.10;
        props.absorptance[i] = 0.75;
      } else if (wavelength >= 600 && wavelength <= 700) { // Red region
        props.reflectance[i] = 0.05;
        props.transmittance[i] = 0.05;
        props.absorptance[i] = 0.90;
      } else { // Far-red region
        props.reflectance[i] = 0.50;
        props.transmittance[i] = 0.40;
        props.absorptance[i] = 0.10;
      }
    }

    return props;
  };

  const createLEDSpectrum = (spectrumType: string): Float32Array => {
    const spectrum = new Float32Array(401);
    
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      if (spectrumType.toLowerCase().includes('full')) {
        // Full spectrum LED
        spectrum[i] += 0.8 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25)); // Blue
        spectrum[i] += 0.6 * Math.exp(-Math.pow(wavelength - 530, 2) / (2 * 30 * 30)); // Green
        spectrum[i] += 1.5 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 20 * 20)); // Red
        spectrum[i] += 0.3 * Math.exp(-Math.pow(wavelength - 735, 2) / (2 * 25 * 25)); // Far-red
      } else if (spectrumType.toLowerCase().includes('red')) {
        // Red-heavy spectrum
        spectrum[i] += 0.5 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25)); // Blue
        spectrum[i] += 2.0 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 20 * 20)); // Red
        spectrum[i] += 0.4 * Math.exp(-Math.pow(wavelength - 735, 2) / (2 * 25 * 25)); // Far-red
      } else {
        // Default balanced spectrum
        spectrum[i] += 1.0 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25)); // Blue
        spectrum[i] += 1.2 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 20 * 20)); // Red
      }
    }
    
    return spectrum;
  };

  const calculatePenetrationProfile = (result: any): { depth: number; ppfd: number; }[] => {
    const profile = [];
    let depth = 0;
    
    for (const [layerId, ppfd] of result.ppfdByLayer.entries()) {
      profile.push({ depth, ppfd });
      depth += settings.layerHeight;
    }
    
    return profile;
  };

  const calculateLightCapture = (result: any, fixtures: any[]): number => {
    const totalInput = fixtures.reduce((sum, f) => sum + (f.model?.ppf || 1000), 0);
    const totalCaptured = Array.from(result.ppfdByLayer.values()).reduce((sum, ppfd) => sum + ppfd, 0);
    return totalInput > 0 ? (totalCaptured / totalInput) * 100 : 0;
  };

  const generateRecommendation = (result: any, cropProfile: any, fixtureCount: number): string => {
    const avgPPFD = Array.from(result.ppfdByLayer.values()).reduce((sum, ppfd) => sum + ppfd, 0) / result.ppfdByLayer.size;
    
    if (avgPPFD < 200) {
      return `Low light levels detected. Consider adding ${Math.ceil(fixtureCount * 0.5)} more fixtures for optimal ${cropProfile.name} growth.`;
    } else if (avgPPFD > 600) {
      return `High light levels detected. Consider reducing fixture intensity or increasing layer spacing to prevent light stress.`;
    } else {
      return `Light levels are optimal for ${cropProfile.name} production. Uniformity could be improved with better fixture spacing.`;
    }
  };

  const visualizeResults = (results: RayTracingResults) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw layer visualization
    const layerHeight = canvas.height / settings.numberOfLayers;
    
    results.penetrationProfile.forEach((layer, index) => {
      const y = index * layerHeight;
      const intensity = Math.min(layer.ppfd / 500, 1); // Normalize to 500 PPFD max
      
      // Create gradient for each layer
      const gradient = ctx.createLinearGradient(0, y, canvas.width, y);
      gradient.addColorStop(0, `rgba(255, 255, 0, ${intensity * 0.8})`);
      gradient.addColorStop(1, `rgba(255, 0, 0, ${intensity * 0.4})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, canvas.width, layerHeight - 2);
      
      // Add layer label
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(`Layer ${index + 1}: ${layer.ppfd.toFixed(0)} μmol/m²/s`, 10, y + 20);
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      room: { width: room.width, length: room.length, height: room.height },
      settings,
      results: {
        ppfdByLayer: Object.fromEntries(results.ppfdByLayer),
        uniformityByLayer: Object.fromEntries(results.uniformityByLayer),
        penetrationProfile: results.penetrationProfile,
        totalPPFD: results.totalPPFD,
        lightCapture: results.lightCapture,
        recommendation: results.recommendation
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vertical-farm-raytracing-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Vertical Farm Ray Tracing</h2>
              <p className="text-sm text-gray-400">Multi-layer canopy light analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {results && (
              <>
                <button
                  onClick={exportResults}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  title="Export Results"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.open('/demo/vertical-farm-raytracing/', '_blank')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  title="View Standalone Demo"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Settings Panel */}
          <div className="w-80 p-4 border-r border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Analysis Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Crop Type
                </label>
                <select
                  value={settings.cropType}
                  onChange={(e) => setSettings(prev => ({ ...prev, cropType: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {Object.entries(cropProfiles).map(([key, profile]) => (
                    <option key={key} value={key}>{profile.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Layer Height: {settings.layerHeight}m
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={settings.layerHeight}
                  onChange={(e) => setSettings(prev => ({ ...prev, layerHeight: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Layers: {settings.numberOfLayers}
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  step="1"
                  value={settings.numberOfLayers}
                  onChange={(e) => setSettings(prev => ({ ...prev, numberOfLayers: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ray Quality: {settings.raysPerPixel}
                </label>
                <select
                  value={settings.raysPerPixel}
                  onChange={(e) => setSettings(prev => ({ ...prev, raysPerPixel: parseInt(e.target.value) }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value={500}>Fast (500 rays)</option>
                  <option value={1000}>Standard (1000 rays)</option>
                  <option value={2000}>High (2000 rays)</option>
                  <option value={5000}>Ultra (5000 rays)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="scattering"
                  checked={settings.enableScattering}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableScattering: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="scattering" className="text-sm text-gray-300">
                  Enable Volumetric Scattering
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fluorescence"
                  checked={settings.enableFluorescence}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableFluorescence: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="fluorescence" className="text-sm text-gray-300">
                  Enable Chlorophyll Fluorescence
                </label>
              </div>
            </div>

            <button
              onClick={runRayTracing}
              disabled={isAnalyzing}
              className="w-full mt-6 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  Run Ray Tracing
                </div>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="flex-1 p-4">
            {!results && !isAnalyzing && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Ready for Analysis</h3>
                  <p>Configure settings and click "Run Ray Tracing" to analyze your vertical farm lighting design.</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Ray Tracing in Progress</h3>
                  <p>Calculating photon interactions with {settings.numberOfLayers} canopy layers...</p>
                </div>
              </div>
            )}

            {results && (
              <div className="h-full flex flex-col">
                {/* Visualization */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Light Penetration Profile</h3>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="w-full border border-gray-600 rounded bg-black"
                  />
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  {/* PPFD by Layer */}
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      PPFD by Layer
                    </h4>
                    <div className="space-y-2">
                      {Array.from(results.ppfdByLayer.entries()).map(([layerId, ppfd], index) => (
                        <div key={layerId} className="flex justify-between">
                          <span className="text-gray-300">Layer {index + 1}</span>
                          <span className="text-green-400 font-medium">{ppfd.toFixed(0)} μmol/m²/s</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uniformity Analysis */}
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      Uniformity Analysis
                    </h4>
                    <div className="space-y-2">
                      {Array.from(results.uniformityByLayer.entries()).map(([layerId, uniformity], index) => (
                        <div key={layerId}>
                          <div className="text-gray-300 text-sm">Layer {index + 1}</div>
                          <div className="text-blue-400 font-medium">CV: {(uniformity.cv * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-md font-semibold text-white mb-3">Summary</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-300 text-sm">Total PPFD</div>
                        <div className="text-yellow-400 font-medium text-lg">{results.totalPPFD.toFixed(0)} μmol/m²/s</div>
                      </div>
                      <div>
                        <div className="text-gray-300 text-sm">Light Capture</div>
                        <div className="text-purple-400 font-medium">{results.lightCapture.toFixed(1)}%</div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-700 rounded">
                        <div className="text-gray-300 text-sm mb-1">Recommendation</div>
                        <div className="text-gray-100 text-xs">{results.recommendation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}