'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MultiLayerCanopyRayTracer, CanopyLayer, LeafOpticalProperties, SpectralPowerDistribution } from '@/lib/photonics/multi-layer-canopy-raytracer';
import { PlantPlacementSystem, PlantingPattern } from '@/lib/photonics/plant-placement-system';
import { vec3 } from 'gl-matrix';

export default function VerticalFarmRayTracingWithPlants() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [plantingMode, setPlantingMode] = useState<'uniform' | 'realistic'>('realistic');
  
  const runDemo = async () => {
    setIsCalculating(true);
    
    try {
      // Create ray tracer
      const rayTracer = new MultiLayerCanopyRayTracer({
        raysPerPixel: 1000,
        maxBounces: 10,
        wavelengthSamples: 31,
        enableVolumetricScattering: true,
        enableFluorescence: true,
        convergenceThreshold: 0.01
      });
      
      // Set room (10m x 20m x 8m)
      rayTracer.setRoom(10, 20, 8, 0.7);
      
      // Create plant placement system
      const plantSystem = new PlantPlacementSystem();
      
      // Layer configurations
      const layerConfigs = [
        {
          id: 'top',
          height: 6,
          thickness: 0.8,
          species: 'lettuce-butterhead',
          pattern: { type: 'hexagonal' as const, spacing: { x: 25, y: 25 } }
        },
        {
          id: 'middle',
          height: 4,
          thickness: 0.6,
          species: 'basil-genovese',
          pattern: { type: 'grid' as const, spacing: { x: 20, y: 20 } }
        },
        {
          id: 'bottom',
          height: 2,
          thickness: 0.5,
          species: 'microgreens-mix',
          pattern: { type: 'grid' as const, spacing: { x: 5, y: 5 } }
        }
      ];
      
      // Create layers with plant placement
      layerConfigs.forEach(config => {
        const opticalProps = createOpticalProperties(config.species);
        
        if (plantingMode === 'realistic') {
          // Create trays with individual plants
          const numTrays = 4; // 4 trays per layer
          const trayWidth = 2.4; // meters
          const trayLength = 1.2;
          const allPositions: number[] = [];
          const allSizes: number[] = [];
          const allProperties: number[] = [];
          
          for (let i = 0; i < numTrays; i++) {
            const trayX = (i % 2) * (trayWidth + 0.5) + 1;
            const trayY = Math.floor(i / 2) * (trayLength + 0.5) + 1;
            
            const tray = plantSystem.createTray({
              dimensions: { width: trayWidth, length: trayLength },
              position: vec3.fromValues(trayX, trayY, config.height),
              height: config.height,
              mediumType: 'nft',
              plantingPattern: config.pattern,
              species: config.species,
              plantingDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 21 days ago
            });
            
            const trayData = plantSystem.exportForRayTracer(tray.id);
            allPositions.push(...Array.from(trayData.positions));
            allSizes.push(...Array.from(trayData.sizes));
            allProperties.push(...Array.from(trayData.properties));
          }
          
          rayTracer.addLayer({
            id: config.id,
            height: config.height,
            thickness: config.thickness,
            lai: 3.0, // Default LAI (will be overridden by plant placement)
            leafAngleDistribution: { type: 'spherical' },
            leafOpticalProperties: opticalProps,
            plantDensity: 100,
            growthStage: 'vegetative',
            species: config.species,
            plantPlacement: {
              positions: new Float32Array(allPositions),
              sizes: new Float32Array(allSizes),
              properties: new Float32Array(allProperties)
            }
          });
        } else {
          // Uniform distribution (original method)
          rayTracer.addLayer({
            id: config.id,
            height: config.height,
            thickness: config.thickness,
            lai: config.id === 'top' ? 3.5 : config.id === 'middle' ? 2.8 : 2.0,
            leafAngleDistribution: { type: 'spherical' },
            leafOpticalProperties: opticalProps,
            plantDensity: 100,
            growthStage: 'vegetative',
            species: config.species
          });
        }
      });
      
      // Add lights
      const lights = [
        { position: vec3.fromValues(2.5, 5, 7.5), intensity: 2000 },
        { position: vec3.fromValues(7.5, 5, 7.5), intensity: 2000 },
        { position: vec3.fromValues(2.5, 15, 7.5), intensity: 2000 },
        { position: vec3.fromValues(7.5, 15, 7.5), intensity: 2000 }
      ];
      
      lights.forEach(light => {
        rayTracer.addLightSource({
          position: light.position,
          spectrum: createFullSpectrum(),
          intensity: light.intensity,
          distribution: 'lambertian',
          beamAngle: 120
        });
      });
      
      // Run simulation with finer grid
      const result = await rayTracer.trace(0.2); // 20cm grid
      setResults(result);
      
      // Visualize
      visualizeResults(result);
      
    } catch (error) {
      console.error('Ray tracing error:', error);
    } finally {
      setIsCalculating(false);
    }
  };
  
  const createOpticalProperties = (species: string): LeafOpticalProperties => {
    const props = {
      reflectance: new Array(401),
      transmittance: new Array(401),
      absorptance: new Array(401),
      chlorophyllContent: 35,
      carotenoidContent: 8,
      waterContent: 800,
      dryMatter: 50
    };
    
    // Species-specific adjustments
    if (species.includes('lettuce')) {
      props.chlorophyllContent = 30;
    } else if (species.includes('basil')) {
      props.chlorophyllContent = 45;
    } else if (species.includes('microgreens')) {
      props.chlorophyllContent = 25;
    }
    
    // Generate spectral properties
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      if (wavelength >= 400 && wavelength <= 500) { // Blue
        props.reflectance[i] = 0.05;
        props.transmittance[i] = 0.05;
        props.absorptance[i] = 0.9;
      } else if (wavelength >= 500 && wavelength <= 600) { // Green
        props.reflectance[i] = 0.15;
        props.transmittance[i] = 0.1;
        props.absorptance[i] = 0.75;
      } else if (wavelength >= 600 && wavelength <= 700) { // Red
        props.reflectance[i] = 0.05;
        props.transmittance[i] = 0.05;
        props.absorptance[i] = 0.9;
      } else { // Far-red
        props.reflectance[i] = 0.4;
        props.transmittance[i] = 0.4;
        props.absorptance[i] = 0.2;
      }
    }
    
    return props;
  };
  
  const createFullSpectrum = (): SpectralPowerDistribution => {
    const spectrum = new Float32Array(401);
    
    // White LED with blue peak and phosphor
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      // Blue LED peak at 450nm
      spectrum[i] += Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 20 * 20)) * 2;
      
      // Phosphor emission (broad)
      if (wavelength >= 500 && wavelength <= 700) {
        spectrum[i] += 1.0 + 0.2 * Math.sin((wavelength - 500) * 0.02);
      }
      
      // Add some red enhancement for horticulture
      spectrum[i] += 0.5 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 25 * 25));
    }
    
    return new SpectralPowerDistribution(spectrum);
  };
  
  const visualizeResults = (result: any) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Plant Distribution: ${plantingMode === 'realistic' ? 'Individual Plants' : 'Uniform LAI'}`, 10, 25);
    
    // Add visualization code here...
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Vertical Farm Ray Tracing with Plant Placement
      </h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>
          Distribution Mode:
          <select 
            value={plantingMode} 
            onChange={(e) => setPlantingMode(e.target.value as any)}
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          >
            <option value="uniform">Uniform LAI</option>
            <option value="realistic">Individual Plants</option>
          </select>
        </label>
      </div>
      
      <button 
        onClick={runDemo} 
        disabled={isCalculating}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          backgroundColor: isCalculating ? '#ccc' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: isCalculating ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {isCalculating ? 'Calculating...' : 'Run Ray Tracing'}
      </button>
      
      <canvas 
        ref={canvasRef}
        width={800}
        height={200}
        style={{ 
          width: '100%', 
          maxWidth: '800px',
          border: '1px solid #333',
          marginBottom: '1rem'
        }}
      />
      
      {results && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Results</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>PPFD by Layer</h3>
              {Array.from(results.ppfdByLayer.entries()).map(([layerId, ppfd]) => (
                <div key={layerId} style={{ marginBottom: '0.25rem' }}>
                  <strong>{layerId}:</strong> {ppfd.toFixed(0)} μmol/m²/s
                </div>
              ))}
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Light Distribution</h3>
              {Array.from(results.uniformityByLayer.entries()).map(([layerId, uniformity]) => (
                <div key={layerId} style={{ marginBottom: '0.5rem' }}>
                  <strong>{layerId}:</strong>
                  <div style={{ fontSize: '0.875rem', marginLeft: '1rem' }}>
                    <div>Min/Max: {uniformity.min.toFixed(0)}/{uniformity.max.toFixed(0)}</div>
                    <div>CV: {(uniformity.cv * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Key Insights</h3>
              <ul style={{ fontSize: '0.875rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  {plantingMode === 'realistic' 
                    ? 'Individual plant modeling shows gaps between plants affect light penetration'
                    : 'Uniform LAI assumes perfect plant distribution'}
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Higher CV in realistic mode indicates need for optimized fixture placement
                </li>
                <li>
                  Consider inter-canopy lighting for better uniformity
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}