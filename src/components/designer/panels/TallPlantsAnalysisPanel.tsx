'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Settings, Download, Eye, TreePine, Target, TrendingUp } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { MultiLayerCanopyRayTracer, CanopyLayer, LeafOpticalProperties, SpectralPowerDistribution } from '@/lib/photonics/multi-layer-canopy-raytracer';
import { PlantPlacementSystem } from '@/lib/photonics/plant-placement-system';
import { vec3 } from 'gl-matrix';

interface TallPlantsResults {
  ppfdByHeight: { height: number; ppfd: number; }[];
  lightPenetration: number; // Percentage reaching bottom 30cm
  canopyEfficiency: number; // Light utilization efficiency
  uniformity: { cv: number; minMaxRatio: number; };
  recommendations: string[];
  yieldPrediction: { relative: number; biomass: string; };
}

interface TallPlantsAnalysisPanelProps {
  onClose: () => void;
}

export function TallPlantsAnalysisPanel({ onClose }: TallPlantsAnalysisPanelProps) {
  const { state } = useDesigner();
  const { room, objects } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<TallPlantsResults | null>(null);
  const [settings, setSettings] = useState({
    cropType: 'cannabis',
    growthStage: 'flowering',
    plantHeight: 150, // cm
    plantSpacing: 100, // cm
    lightingConfig: 'top-only',
    canopyDensity: 'medium',
    raysPerPixel: 3000
  });

  const cropProfiles = {
    cannabis: {
      name: 'Cannabis',
      maxHeight: 200,
      leafAngle: 'planophile' as const,
      lai: { vegetative: 4.5, flowering: 6.0 },
      chlorophyll: { vegetative: 50, flowering: 40 },
      verticalDistribution: 'bell', // Peaked at 65% height
      lightRequirement: { vegetative: 400, flowering: 600 }
    },
    tomato: {
      name: 'Tomatoes (Indeterminate)',
      maxHeight: 250,
      leafAngle: 'spherical' as const,
      lai: { vegetative: 3.5, flowering: 4.2 },
      chlorophyll: { vegetative: 35, flowering: 32 },
      verticalDistribution: 'uniform',
      lightRequirement: { vegetative: 300, flowering: 400 }
    },
    cucumber: {
      name: 'Cucumbers (Vining)',
      maxHeight: 220,
      leafAngle: 'spherical' as const,
      lai: { vegetative: 3.0, flowering: 3.8 },
      chlorophyll: { vegetative: 38, flowering: 35 },
      verticalDistribution: 'linear', // Decreasing with height
      lightRequirement: { vegetative: 250, flowering: 350 }
    }
  };

  const lightingConfigs = {
    'top-only': { name: 'Top Lighting Only', efficiency: 0.65 },
    'top-side': { name: 'Top + Side Lighting', efficiency: 0.75 },
    'intracanopy': { name: 'Top + Side + Intracanopy', efficiency: 0.85 }
  };

  const runTallPlantsAnalysis = async () => {
    if (!room || objects.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      // Create ray tracer with high precision for tall plants
      const rayTracer = new MultiLayerCanopyRayTracer({
        raysPerPixel: settings.raysPerPixel,
        maxBounces: 20, // More bounces for complex canopies
        wavelengthSamples: 51,
        enableVolumetricScattering: true,
        enableFluorescence: true,
        convergenceThreshold: 0.003
      });

      // Set room dimensions
      rayTracer.setRoom(
        room.width * 0.3048,
        room.length * 0.3048,
        room.height * 0.3048,
        room.reflectances.walls
      );

      // Create plant placement system
      const plantSystem = new PlantPlacementSystem();
      const cropProfile = cropProfiles[settings.cropType as keyof typeof cropProfiles];
      
      // Calculate plant positions
      const roomArea = (room.width * 0.3048) * (room.length * 0.3048);
      const plantSpacing = settings.plantSpacing / 100; // Convert cm to m
      const plantsPerRow = Math.floor((room.width * 0.3048) / plantSpacing);
      const numRows = Math.floor((room.length * 0.3048) / plantSpacing);
      
      const positions: number[] = [];
      const sizes: number[] = [];
      const properties: number[] = [];
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < plantsPerRow; col++) {
          const x = (col + 0.5) * plantSpacing;
          const y = (row + 0.5) * plantSpacing;
          
          // Add natural variation
          const heightVariation = 0.85 + Math.random() * 0.3;
          const healthVariation = 0.9 + Math.random() * 0.1;
          
          positions.push(x, y, 0.1); // 10cm pot height
          sizes.push(
            (settings.plantHeight / 100) * heightVariation,
            (settings.plantSpacing / 200) * (0.8 + Math.random() * 0.4) // Canopy diameter
          );
          properties.push(
            cropProfile.lai[settings.growthStage as keyof typeof cropProfile.lai] * healthVariation,
            healthVariation
          );
        }
      }

      // Create single tall canopy layer with individual plants
      const opticalProps = createTallPlantOpticalProperties(cropProfile, settings.growthStage);
      
      rayTracer.addLayer({
        id: 'tall-canopy',
        height: 0.1, // Base height (pot level)
        thickness: settings.plantHeight / 100, // Convert cm to m
        lai: cropProfile.lai[settings.growthStage as keyof typeof cropProfile.lai],
        leafAngleDistribution: { type: cropProfile.leafAngle },
        leafOpticalProperties: opticalProps,
        plantDensity: plantsPerRow * numRows / roomArea,
        growthStage: settings.growthStage as 'vegetative' | 'flowering',
        species: cropProfile.name,
        plantPlacement: {
          positions: new Float32Array(positions),
          sizes: new Float32Array(sizes),
          properties: new Float32Array(properties)
        }
      });

      // Add fixtures with appropriate spectra
      const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);
      fixtures.forEach((fixture, index) => {
        if (!fixture.model) return;

        const spectrum = createGrowLightSpectrum(settings.cropType, settings.growthStage);
        
        rayTracer.addLightSource({
          position: vec3.fromValues(
            fixture.x * 0.3048,
            fixture.y * 0.3048,
            fixture.z * 0.3048
          ),
          spectrum: new SpectralPowerDistribution(spectrum),
          intensity: (fixture.model.ppf || 1000) * (fixture.dimmingLevel || 100) / 100,
          distribution: 'lambertian',
          beamAngle: fixture.model.beamAngle || 120
        });
      });

      // Run simulation with fine resolution for tall plants
      const result = await rayTracer.trace(0.05); // 5cm grid resolution

      // Process results for tall plants analysis
      const processedResults = analyzeTallPlantsResults(result, cropProfile, settings, fixtures);
      setResults(processedResults);
      visualizeTallPlantsResults(processedResults);

    } catch (error) {
      console.error('Tall plants analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createTallPlantOpticalProperties = (cropProfile: any, growthStage: string): LeafOpticalProperties => {
    const props = {
      reflectance: new Array(401),
      transmittance: new Array(401),
      absorptance: new Array(401),
      chlorophyllContent: cropProfile.chlorophyll[growthStage as keyof typeof cropProfile.chlorophyll],
      carotenoidContent: settings.cropType === 'cannabis' && growthStage === 'flowering' ? 12 : 8,
      waterContent: settings.cropType === 'cannabis' ? 750 : 850,
      dryMatter: settings.cropType === 'cannabis' ? 200 : 100
    };

    // Generate spectral properties based on crop type
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      if (wavelength >= 400 && wavelength <= 500) { // Blue
        props.reflectance[i] = 0.04;
        props.transmittance[i] = 0.04;
        props.absorptance[i] = 0.92;
      } else if (wavelength >= 500 && wavelength <= 600) { // Green
        const greenReflection = settings.cropType === 'cannabis' ? 0.12 : 0.15;
        props.reflectance[i] = greenReflection;
        props.transmittance[i] = 0.08;
        props.absorptance[i] = 1 - greenReflection - 0.08;
      } else if (wavelength >= 600 && wavelength <= 700) { // Red
        props.reflectance[i] = 0.04;
        props.transmittance[i] = 0.04;
        props.absorptance[i] = 0.92;
      } else if (wavelength >= 700 && wavelength <= 800) { // Far-red
        props.reflectance[i] = 0.45;
        props.transmittance[i] = 0.45;
        props.absorptance[i] = 0.10;
      }
    }

    return props;
  };

  const createGrowLightSpectrum = (cropType: string, growthStage: string): Float32Array => {
    const spectrum = new Float32Array(401);
    
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      if (cropType === 'cannabis') {
        if (growthStage === 'vegetative') {
          // More blue for vegetative growth
          spectrum[i] += 1.5 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25));
          spectrum[i] += 1.0 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 25 * 25));
        } else {
          // More red for flowering
          spectrum[i] += 0.8 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25));
          spectrum[i] += 2.0 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 25 * 25));
          spectrum[i] += 0.5 * Math.exp(-Math.pow(wavelength - 730, 2) / (2 * 30 * 30));
        }
      } else {
        // Balanced spectrum for tomatoes/cucumbers
        spectrum[i] += 1.0 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25));
        spectrum[i] += 0.6 * Math.exp(-Math.pow(wavelength - 530, 2) / (2 * 30 * 30));
        spectrum[i] += 1.4 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 20 * 20));
      }
    }
    
    return spectrum;
  };

  const analyzeTallPlantsResults = (result: any, cropProfile: any, settings: any, fixtures: any[]): TallPlantsResults => {
    // Calculate PPFD at different heights
    const ppfdByHeight: { height: number; ppfd: number; }[] = [];
    const plantHeight = settings.plantHeight / 100; // Convert to meters
    const heightSteps = 20;
    
    for (let i = 0; i <= heightSteps; i++) {
      const height = (i / heightSteps) * plantHeight;
      const relativeHeight = height / plantHeight;
      
      // Get PPFD from the main canopy layer
      const basePPFD = result.ppfdByLayer.get('tall-canopy') || 0;
      
      // Apply vertical distribution based on crop type
      let heightFactor = 1;
      if (cropProfile.verticalDistribution === 'bell') {
        // Bell curve peaked at 65% height
        const peak = 0.65;
        heightFactor = Math.exp(-Math.pow((relativeHeight - peak) * 3, 2));
      } else if (cropProfile.verticalDistribution === 'linear') {
        heightFactor = 1 - relativeHeight * 0.4; // 40% reduction at top
      } else {
        heightFactor = 1; // Uniform distribution
      }
      
      ppfdByHeight.push({
        height: height * 100, // Convert back to cm
        ppfd: basePPFD * heightFactor
      });
    }

    // Calculate light penetration to lower canopy
    const bottomPPFD = ppfdByHeight.slice(0, 6).reduce((sum, p) => sum + p.ppfd, 0) / 6; // Bottom 30%
    const topPPFD = ppfdByHeight.slice(-6).reduce((sum, p) => sum + p.ppfd, 0) / 6; // Top 30%
    const lightPenetration = topPPFD > 0 ? (bottomPPFD / topPPFD) * 100 : 0;

    // Calculate canopy efficiency
    const totalLightInput = fixtures.reduce((sum, f) => sum + (f.model?.ppf || 1000), 0);
    const totalCaptured = ppfdByHeight.reduce((sum, p) => sum + p.ppfd, 0);
    const canopyEfficiency = totalLightInput > 0 ? (totalCaptured / (totalLightInput * ppfdByHeight.length)) * 100 : 0;

    // Calculate uniformity
    const ppfdValues = ppfdByHeight.map(p => p.ppfd).filter(v => v > 0);
    const avgPPFD = ppfdValues.reduce((sum, v) => sum + v, 0) / ppfdValues.length;
    const variance = ppfdValues.reduce((sum, v) => sum + Math.pow(v - avgPPFD, 2), 0) / ppfdValues.length;
    const cv = Math.sqrt(variance) / avgPPFD;
    const minMaxRatio = Math.min(...ppfdValues) / Math.max(...ppfdValues);

    // Generate recommendations
    const recommendations = generateTallPlantsRecommendations(
      ppfdByHeight, lightPenetration, canopyEfficiency, cropProfile, settings
    );

    // Predict relative yield
    const targetPPFD = cropProfile.lightRequirement[settings.growthStage as keyof typeof cropProfile.lightRequirement];
    const actualAvgPPFD = avgPPFD;
    const relativeYield = Math.min(actualAvgPPFD / targetPPFD, 1.2); // Cap at 120%

    return {
      ppfdByHeight,
      lightPenetration,
      canopyEfficiency,
      uniformity: { cv, minMaxRatio },
      recommendations,
      yieldPrediction: {
        relative: relativeYield,
        biomass: relativeYield > 1.1 ? 'Excellent' : relativeYield > 0.9 ? 'Good' : relativeYield > 0.7 ? 'Fair' : 'Poor'
      }
    };
  };

  const generateTallPlantsRecommendations = (
    ppfdByHeight: any[], lightPenetration: number, canopyEfficiency: number, 
    cropProfile: any, settings: any
  ): string[] => {
    const recommendations = [];

    if (lightPenetration < 30) {
      recommendations.push('Consider adding side lighting or intracanopy lighting to improve lower canopy illumination.');
    }

    if (canopyEfficiency < 60) {
      recommendations.push('Light utilization efficiency is low. Consider adjusting fixture height or beam angles.');
    }

    if (settings.cropType === 'cannabis' && settings.growthStage === 'flowering') {
      if (lightPenetration < 40) {
        recommendations.push('For flowering cannabis, consider selective defoliation to improve light penetration.');
      }
    }

    const avgPPFD = ppfdByHeight.reduce((sum, p) => sum + p.ppfd, 0) / ppfdByHeight.length;
    const targetPPFD = cropProfile.lightRequirement[settings.growthStage as keyof typeof cropProfile.lightRequirement];
    
    if (avgPPFD < targetPPFD * 0.8) {
      recommendations.push(`Increase light intensity. Target: ${targetPPFD} μmol/m²/s, Current: ${avgPPFD.toFixed(0)} μmol/m²/s`);
    }

    if (settings.plantSpacing < 80 && settings.cropType === 'cannabis') {
      recommendations.push('Consider wider plant spacing for better air circulation and light penetration.');
    }

    return recommendations;
  };

  const visualizeTallPlantsResults = (results: TallPlantsResults) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw plant height profile
    const maxPPFD = Math.max(...results.ppfdByHeight.map(p => p.ppfd));
    const maxHeight = Math.max(...results.ppfdByHeight.map(p => p.height));
    
    // Draw background grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw PPFD profile
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    results.ppfdByHeight.forEach((point, index) => {
      const x = (point.ppfd / maxPPFD) * (canvas.width - 40) + 20;
      const y = canvas.height - (point.height / maxHeight) * (canvas.height - 40) - 20;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText('PPFD →', canvas.width - 60, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Height (cm) →', 0, 0);
    ctx.restore();

    // Add key points
    ctx.fillStyle = '#10b981';
    results.ppfdByHeight.forEach((point, index) => {
      if (index % 5 === 0) { // Every 5th point
        const x = (point.ppfd / maxPPFD) * (canvas.width - 40) + 20;
        const y = canvas.height - (point.height / maxHeight) * (canvas.height - 40) - 20;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add value label
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(`${point.ppfd.toFixed(0)}`, x + 6, y - 6);
        ctx.fillStyle = '#10b981';
      }
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      room: { width: room.width, length: room.length, height: room.height },
      settings,
      results
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tall-plants-analysis-${settings.cropType}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <TreePine className="w-6 h-6 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Tall Plants Analysis</h2>
              <p className="text-sm text-gray-400">Cannabis, tomatoes, and cucumber light modeling</p>
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
                  onClick={() => window.open('/demo/vertical-farm-raytracing/tall-plants/', '_blank')}
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
              <h3 className="text-lg font-semibold text-white">Plant Configuration</h3>
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
                  Growth Stage
                </label>
                <select
                  value={settings.growthStage}
                  onChange={(e) => setSettings(prev => ({ ...prev, growthStage: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering/Fruiting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plant Height: {settings.plantHeight}cm
                </label>
                <input
                  type="range"
                  min="50"
                  max={cropProfiles[settings.cropType as keyof typeof cropProfiles].maxHeight}
                  step="10"
                  value={settings.plantHeight}
                  onChange={(e) => setSettings(prev => ({ ...prev, plantHeight: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plant Spacing: {settings.plantSpacing}cm
                </label>
                <input
                  type="range"
                  min="60"
                  max="150"
                  step="10"
                  value={settings.plantSpacing}
                  onChange={(e) => setSettings(prev => ({ ...prev, plantSpacing: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lighting Configuration
                </label>
                <select
                  value={settings.lightingConfig}
                  onChange={(e) => setSettings(prev => ({ ...prev, lightingConfig: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {Object.entries(lightingConfigs).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
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
                  <option value={1000}>Fast (1000 rays)</option>
                  <option value={2000}>Standard (2000 rays)</option>
                  <option value={3000}>High (3000 rays)</option>
                  <option value={5000}>Ultra (5000 rays)</option>
                </select>
              </div>
            </div>

            <button
              onClick={runTallPlantsAnalysis}
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
                  Analyze Tall Plants
                </div>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="flex-1 p-4">
            {!results && !isAnalyzing && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TreePine className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Ready for Tall Plants Analysis</h3>
                  <p>Configure plant settings and click "Analyze Tall Plants" to model light distribution in your tall crop canopy.</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Tall Plants Analysis in Progress</h3>
                  <p>Modeling light interactions with {settings.plantHeight}cm tall {cropProfiles[settings.cropType as keyof typeof cropProfiles].name}...</p>
                </div>
              </div>
            )}

            {results && (
              <div className="h-full flex flex-col">
                {/* Visualization */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">PPFD vs Plant Height</h3>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="w-full border border-gray-600 rounded bg-black"
                  />
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  {/* Key Metrics */}
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      Key Metrics
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-300 text-sm">Light Penetration</div>
                        <div className="text-green-400 font-medium text-lg">{results.lightPenetration.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-300 text-sm">Canopy Efficiency</div>
                        <div className="text-blue-400 font-medium">{results.canopyEfficiency.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-300 text-sm">Uniformity CV</div>
                        <div className="text-yellow-400 font-medium">{(results.uniformity.cv * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Yield Prediction */}
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Yield Prediction
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-300 text-sm">Relative Yield</div>
                        <div className="text-purple-400 font-medium text-lg">{(results.yieldPrediction.relative * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-300 text-sm">Biomass Quality</div>
                        <div className={`font-medium ${
                          results.yieldPrediction.biomass === 'Excellent' ? 'text-green-400' :
                          results.yieldPrediction.biomass === 'Good' ? 'text-blue-400' :
                          results.yieldPrediction.biomass === 'Fair' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {results.yieldPrediction.biomass}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Height Profile Summary */}
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-md font-semibold text-white mb-3">Height Profile</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Top 30%</span>
                        <span className="text-green-400">
                          {results.ppfdByHeight.slice(-6).reduce((sum, p) => sum + p.ppfd, 0) / 6 | 0} μmol/m²/s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Mid 40%</span>
                        <span className="text-yellow-400">
                          {results.ppfdByHeight.slice(6, -6).reduce((sum, p) => sum + p.ppfd, 0) / 8 | 0} μmol/m²/s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Bottom 30%</span>
                        <span className="text-red-400">
                          {results.ppfdByHeight.slice(0, 6).reduce((sum, p) => sum + p.ppfd, 0) / 6 | 0} μmol/m²/s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-md font-semibold text-white mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {results.recommendations.map((rec, index) => (
                        <div key={index} className="text-gray-300 text-xs p-2 bg-gray-700 rounded">
                          {rec}
                        </div>
                      ))}
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