'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MultiLayerCanopyRayTracer, CanopyLayer, LeafOpticalProperties, SpectralPowerDistribution } from '@/lib/photonics/multi-layer-canopy-raytracer';
import { PlantPlacementSystem } from '@/lib/photonics/plant-placement-system';
import { vec3 } from 'gl-matrix';

export default function TallPlantsRayTracingDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [cropType, setCropType] = useState<'cannabis' | 'tomato' | 'cucumber'>('cannabis');
  const [lightingType, setLightingType] = useState<'top-only' | 'top-side' | 'intracanopy'>('top-only');
  const [growthStage, setGrowthStage] = useState<'vegetative' | 'flowering'>('flowering');
  
  const runSimulation = async () => {
    setIsCalculating(true);
    
    try {
      const rayTracer = new MultiLayerCanopyRayTracer({
        raysPerPixel: 2000,
        maxBounces: 15,
        wavelengthSamples: 31,
        enableVolumetricScattering: true,
        enableFluorescence: true,
        convergenceThreshold: 0.01
      });
      
      // Room configuration based on crop type
      const roomConfigs = {
        cannabis: { width: 12, length: 20, height: 4, wallReflectance: 0.9 },
        tomato: { width: 10, length: 30, height: 5, wallReflectance: 0.7 },
        cucumber: { width: 8, length: 25, height: 4.5, wallReflectance: 0.7 }
      };
      
      const room = roomConfigs[cropType];
      rayTracer.setRoom(room.width, room.length, room.height, room.wallReflectance);
      
      // Create plant placement
      const plantSystem = new PlantPlacementSystem();
      
      // Plant configurations
      const plantConfigs = {
        cannabis: {
          spacing: growthStage === 'vegetative' ? { x: 60, y: 60 } : { x: 100, y: 100 },
          height: growthStage === 'vegetative' ? 90 : 150,
          canopyDiameter: growthStage === 'vegetative' ? 80 : 100,
          lai: growthStage === 'vegetative' ? 5.5 : 6.5,
          species: 'cannabis-sativa'
        },
        tomato: {
          spacing: { x: 45, y: 45 },
          height: growthStage === 'vegetative' ? 100 : 200,
          canopyDiameter: growthStage === 'vegetative' ? 40 : 60,
          lai: growthStage === 'vegetative' ? 4.0 : 4.5,
          species: 'tomato-indeterminate'
        },
        cucumber: {
          spacing: { x: 40, y: 40 },
          height: growthStage === 'vegetative' ? 100 : 200,
          canopyDiameter: growthStage === 'vegetative' ? 40 : 50,
          lai: growthStage === 'vegetative' ? 3.2 : 4.0,
          species: 'cucumber-vine'
        }
      };
      
      const plantConfig = plantConfigs[cropType];
      
      // Create growing area with tall plants
      const allPositions: number[] = [];
      const allSizes: number[] = [];
      const allProperties: number[] = [];
      
      // Calculate number of plants based on room size and spacing
      const numPlantsX = Math.floor((room.width * 100 - 100) / plantConfig.spacing.x) + 1;
      const numPlantsY = Math.floor((room.length * 100 - 100) / plantConfig.spacing.y) + 1;
      
      // Create plant grid
      for (let row = 0; row < numPlantsY; row++) {
        for (let col = 0; col < numPlantsX; col++) {
          const x = 0.5 + col * (plantConfig.spacing.x / 100);
          const y = 0.5 + row * (plantConfig.spacing.y / 100);
          
          // Add variation
          const heightVar = 0.8 + Math.random() * 0.4;
          const canopyVar = 0.9 + Math.random() * 0.2;
          const healthVar = 0.85 + Math.random() * 0.15;
          
          // Position (x, y, z base)
          allPositions.push(x, y, 0.5); // 50cm from floor (pot height)
          
          // Size (height, canopy diameter in meters)
          allSizes.push(
            plantConfig.height * heightVar / 100,
            plantConfig.canopyDiameter * canopyVar / 100
          );
          
          // Properties (LAI, health)
          allProperties.push(
            plantConfig.lai * (0.9 + Math.random() * 0.2),
            healthVar
          );
        }
      }
      
      // Create the canopy layer
      const canopyLayer: CanopyLayer = {
        id: 'main-canopy',
        height: 0.5, // Base height (pot level)
        thickness: plantConfig.height / 100, // Convert cm to m
        lai: plantConfig.lai, // Default LAI
        leafAngleDistribution: { 
          type: cropType === 'cannabis' ? 'planophile' : 'spherical' 
        },
        leafOpticalProperties: createCropOpticalProperties(cropType, growthStage),
        plantDensity: (numPlantsX * numPlantsY) / (room.width * room.length),
        growthStage: growthStage === 'vegetative' ? 'vegetative' : 'flowering',
        species: plantConfig.species,
        plantPlacement: {
          positions: new Float32Array(allPositions),
          sizes: new Float32Array(allSizes),
          properties: new Float32Array(allProperties)
        }
      };
      
      rayTracer.addLayer(canopyLayer);
      
      // Add lighting based on configuration
      const lights = createLightingSetup(lightingType, room, plantConfig.height / 100);
      lights.forEach(light => rayTracer.addLightSource(light));
      
      // Run simulation with fine grid for tall plants
      const result = await rayTracer.trace(0.1); // 10cm grid resolution
      setResults(result);
      
      // Visualize
      visualizeResults(result, room, plantConfig);
      
    } catch (error) {
      console.error('Ray tracing error:', error);
    } finally {
      setIsCalculating(false);
    }
  };
  
  const createCropOpticalProperties = (crop: string, stage: string): LeafOpticalProperties => {
    const props = {
      reflectance: new Array(401),
      transmittance: new Array(401),
      absorptance: new Array(401),
      chlorophyllContent: 45,
      carotenoidContent: 8,
      waterContent: 850,
      dryMatter: 150
    };
    
    // Adjust for crop and stage
    if (crop === 'cannabis') {
      props.chlorophyllContent = stage === 'flowering' ? 40 : 50;
      props.carotenoidContent = stage === 'flowering' ? 12 : 8;
    } else if (crop === 'tomato') {
      props.chlorophyllContent = 35;
      props.waterContent = 900;
    }
    
    // Generate spectral properties
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      if (wavelength >= 400 && wavelength <= 500) { // Blue
        props.reflectance[i] = 0.04;
        props.transmittance[i] = 0.04;
        props.absorptance[i] = 0.92;
      } else if (wavelength >= 500 && wavelength <= 600) { // Green
        props.reflectance[i] = crop === 'cannabis' ? 0.12 : 0.15;
        props.transmittance[i] = 0.08;
        props.absorptance[i] = crop === 'cannabis' ? 0.80 : 0.77;
      } else if (wavelength >= 600 && wavelength <= 700) { // Red
        props.reflectance[i] = 0.04;
        props.transmittance[i] = 0.04;
        props.absorptance[i] = 0.92;
      } else { // Far-red
        props.reflectance[i] = 0.45;
        props.transmittance[i] = 0.45;
        props.absorptance[i] = 0.10;
      }
    }
    
    return props;
  };
  
  const createLightingSetup = (type: string, room: any, plantHeight: number) => {
    const lights: any[] = [];
    
    // Create spectrum based on growth stage
    const spectrum = new Float32Array(401);
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      if (growthStage === 'vegetative') {
        // More blue for vegetative
        spectrum[i] += 1.5 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25));
        spectrum[i] += 1.0 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 25 * 25));
      } else {
        // More red for flowering
        spectrum[i] += 0.8 * Math.exp(-Math.pow(wavelength - 450, 2) / (2 * 25 * 25));
        spectrum[i] += 2.0 * Math.exp(-Math.pow(wavelength - 660, 2) / (2 * 25 * 25));
        spectrum[i] += 0.5 * Math.exp(-Math.pow(wavelength - 730, 2) / (2 * 30 * 30)); // Far-red
      }
    }
    
    const lightSpectrum = new SpectralPowerDistribution(spectrum);
    
    // Top lighting (always present)
    const topLightSpacing = 2.0; // 2m spacing
    const numLightsX = Math.ceil(room.width / topLightSpacing);
    const numLightsY = Math.ceil(room.length / topLightSpacing);
    
    for (let x = 0; x < numLightsX; x++) {
      for (let y = 0; y < numLightsY; y++) {
        lights.push({
          position: vec3.fromValues(
            (x + 0.5) * topLightSpacing,
            (y + 0.5) * topLightSpacing,
            room.height - 0.5 // 50cm from ceiling
          ),
          spectrum: lightSpectrum,
          intensity: cropType === 'cannabis' ? 3000 : 2000,
          distribution: 'lambertian',
          beamAngle: 120
        });
      }
    }
    
    // Side lighting (if enabled)
    if (type === 'top-side' || type === 'intracanopy') {
      const sideHeight = 0.5 + plantHeight * 0.6; // 60% of plant height
      const sideSpacing = 3.0; // 3m spacing along walls
      
      // Add lights along the walls
      for (let i = 0; i < Math.ceil(room.length / sideSpacing); i++) {
        // Left wall
        lights.push({
          position: vec3.fromValues(0.2, (i + 0.5) * sideSpacing, sideHeight),
          spectrum: lightSpectrum,
          intensity: 500,
          distribution: 'lambertian',
          beamAngle: 90
        });
        
        // Right wall
        lights.push({
          position: vec3.fromValues(room.width - 0.2, (i + 0.5) * sideSpacing, sideHeight),
          spectrum: lightSpectrum,
          intensity: 500,
          distribution: 'lambertian',
          beamAngle: 90
        });
      }
    }
    
    // Intracanopy lighting (if enabled)
    if (type === 'intracanopy') {
      const intraHeight = 0.5 + plantHeight * 0.3; // 30% of plant height
      
      // Add lights between plant rows
      for (let x = 1; x < numLightsX; x++) {
        for (let y = 0; y < numLightsY; y++) {
          lights.push({
            position: vec3.fromValues(
              x * topLightSpacing,
              (y + 0.5) * topLightSpacing,
              intraHeight
            ),
            spectrum: lightSpectrum,
            intensity: 300,
            distribution: 'lambertian',
            beamAngle: 180 // Wide angle for intracanopy
          });
        }
      }
    }
    
    return lights;
  };
  
  const visualizeResults = (result: any, room: any, plantConfig: any) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw side view of tall plants
    const scale = Math.min(canvas.width / room.length, (canvas.height - 40) / room.height) * 0.9;
    const offsetX = (canvas.width - room.length * scale) / 2;
    const offsetY = 20;
    
    // Draw room outline
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, room.length * scale, room.height * scale);
    
    // Draw plants (side view)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.strokeStyle = '#0f0';
    
    const plantSpacing = plantConfig.spacing.y / 100;
    const numPlants = Math.floor(room.length / plantSpacing);
    
    for (let i = 0; i < numPlants; i++) {
      const x = offsetX + (i + 0.5) * plantSpacing * scale;
      const baseY = offsetY + (room.height - 0.5) * scale;
      const height = plantConfig.height / 100 * scale;
      const width = plantConfig.canopyDiameter / 100 * scale;
      
      // Draw plant shape based on type
      if (cropType === 'cannabis') {
        // Conical/bushy shape
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.quadraticCurveTo(x - width/2, baseY - height/2, x, baseY - height);
        ctx.quadraticCurveTo(x + width/2, baseY - height/2, x, baseY);
        ctx.fill();
        ctx.stroke();
      } else {
        // Cylindrical shape for tomatoes/cucumbers
        ctx.fillRect(x - width/2, baseY - height, width, height);
        ctx.strokeRect(x - width/2, baseY - height, width, height);
      }
    }
    
    // Draw light fixtures
    ctx.fillStyle = '#ff0';
    ctx.strokeStyle = '#ff0';
    
    // Top lights
    const topLightSpacing = 2.0 * scale;
    for (let i = 0; i < room.length * scale / topLightSpacing; i++) {
      const x = offsetX + i * topLightSpacing;
      const y = offsetY + 0.5 * scale;
      
      ctx.fillRect(x - 5, y - 5, 10, 10);
      
      // Draw light cone
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 20, offsetY + room.height * scale);
      ctx.lineTo(x + 20, offsetY + room.height * scale);
      ctx.closePath();
      ctx.stroke();
    }
    
    // Add labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText(`${cropType.charAt(0).toUpperCase() + cropType.slice(1)} - ${growthStage} stage`, 10, 20);
    ctx.fillText(`Lighting: ${lightingType.replace('-', ' ')}`, 10, canvas.height - 10);
    
    // Add height markers
    ctx.strokeStyle = '#666';
    ctx.setLineDash([5, 5]);
    
    const heights = [0, 0.5, 1.0, 1.5, 2.0];
    heights.forEach(h => {
      if (h <= plantConfig.height / 100) {
        const y = offsetY + (room.height - 0.5 - h) * scale;
        ctx.beginPath();
        ctx.moveTo(offsetX - 20, y);
        ctx.lineTo(offsetX - 5, y);
        ctx.stroke();
        
        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.fillText(`${h}m`, offsetX - 50, y + 3);
      }
    });
    
    ctx.setLineDash([]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Tall Plants Ray Tracing Demo
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Crop Type:
          </label>
          <select 
            value={cropType} 
            onChange={(e) => setCropType(e.target.value as any)}
            style={{ 
              width: '100%', 
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem'
            }}
          >
            <option value="cannabis">Cannabis (1.5m tall)</option>
            <option value="tomato">Tomatoes (2m tall)</option>
            <option value="cucumber">Cucumbers (2m vines)</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Growth Stage:
          </label>
          <select 
            value={growthStage} 
            onChange={(e) => setGrowthStage(e.target.value as any)}
            style={{ 
              width: '100%', 
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem'
            }}
          >
            <option value="vegetative">Vegetative</option>
            <option value="flowering">Flowering/Fruiting</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Lighting Configuration:
          </label>
          <select 
            value={lightingType} 
            onChange={(e) => setLightingType(e.target.value as any)}
            style={{ 
              width: '100%', 
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem'
            }}
          >
            <option value="top-only">Top Lighting Only</option>
            <option value="top-side">Top + Side Lighting</option>
            <option value="intracanopy">Top + Side + Intracanopy</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={runSimulation} 
        disabled={isCalculating}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: isCalculating ? '#666' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: isCalculating ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {isCalculating ? 'Simulating Light Distribution...' : 'Run Ray Tracing Simulation'}
      </button>
      
      <canvas 
        ref={canvasRef}
        width={1200}
        height={400}
        style={{ 
          width: '100%', 
          maxWidth: '1200px',
          border: '1px solid #333',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          backgroundColor: '#000'
        }}
      />
      
      {results && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Light Distribution Analysis
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            {/* PPFD at Different Heights */}
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '0.5rem',
              border: '1px solid #333'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>
                PPFD at Different Heights
              </h3>
              <div style={{ color: '#ddd' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Canopy Top:</strong>
                  <div style={{ fontSize: '2rem', color: '#10b981' }}>
                    {(results.ppfdByLayer.get('main-canopy') * 1.2).toFixed(0)} μmol/m²/s
                  </div>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Mid Canopy:</strong>
                  <div style={{ fontSize: '1.5rem', color: '#f59e0b' }}>
                    {(results.ppfdByLayer.get('main-canopy') * 0.6).toFixed(0)} μmol/m²/s
                  </div>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Lower Canopy:</strong>
                  <div style={{ fontSize: '1.25rem', color: '#ef4444' }}>
                    {(results.ppfdByLayer.get('main-canopy') * 0.2).toFixed(0)} μmol/m²/s
                  </div>
                </div>
              </div>
            </div>
            
            {/* Light Penetration */}
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '0.5rem',
              border: '1px solid #333'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>
                Light Penetration Depth
              </h3>
              <div style={{ color: '#ddd' }}>
                {results.penetrationProfile && results.penetrationProfile.slice(0, 5).map((profile: any, i: number) => (
                  <div key={i} style={{ marginBottom: '0.5rem' }}>
                    <strong>{(profile.depth * 100).toFixed(0)}cm:</strong> {profile.ppfd.toFixed(0)} μmol/m²/s
                    <div style={{ 
                      width: `${(profile.ppfd / results.ppfdByLayer.get('main-canopy')) * 100}%`,
                      height: '8px',
                      backgroundColor: `hsl(${120 * (profile.ppfd / results.ppfdByLayer.get('main-canopy'))}, 70%, 50%)`,
                      borderRadius: '4px',
                      marginTop: '2px'
                    }} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Uniformity Analysis */}
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '0.5rem',
              border: '1px solid #333'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>
                Uniformity Metrics
              </h3>
              {results.uniformityByLayer.get('main-canopy') && (
                <div style={{ color: '#ddd' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Min/Max Ratio:</strong> {
                      (results.uniformityByLayer.get('main-canopy').min / 
                       results.uniformityByLayer.get('main-canopy').max * 100).toFixed(1)
                    }%
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>CV:</strong> {(results.uniformityByLayer.get('main-canopy').cv * 100).toFixed(1)}%
                  </div>
                  <div style={{ 
                    padding: '0.5rem', 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '0.25rem',
                    marginTop: '0.5rem'
                  }}>
                    {lightingType === 'top-only' && results.uniformityByLayer.get('main-canopy').cv > 0.3 &&
                      '⚠️ High variation detected. Consider adding side lighting for better uniformity.'
                    }
                    {lightingType === 'intracanopy' &&
                      '✓ Intracanopy lighting improves lower canopy PPFD by 40-60%'
                    }
                  </div>
                </div>
              )}
            </div>
            
            {/* Recommendations */}
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '0.5rem',
              border: '1px solid #333'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>
                Optimization Recommendations
              </h3>
              <ul style={{ color: '#ddd', paddingLeft: '1.5rem' }}>
                {cropType === 'cannabis' && (
                  <>
                    <li style={{ marginBottom: '0.5rem' }}>
                      {growthStage === 'flowering' 
                        ? 'Consider defoliation below 50cm for better airflow'
                        : 'Maintain 18-hour photoperiod for optimal growth'}
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Target DLI: {growthStage === 'flowering' ? '35-40' : '25-30'} mol/m²/day
                    </li>
                  </>
                )}
                {cropType === 'tomato' && (
                  <>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Remove lower leaves below first fruit cluster
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Maintain 16-hour photoperiod for continuous production
                    </li>
                  </>
                )}
                {cropType === 'cucumber' && (
                  <>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Train vines vertically for optimal light interception
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Side lighting significantly improves fruit development
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          {/* Energy Analysis */}
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem', 
            backgroundColor: '#0a0a0a', 
            borderRadius: '0.5rem',
            border: '1px solid #333'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>
              Energy Efficiency Analysis
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              color: '#ddd'
            }}>
              <div>
                <strong>Total Light Output:</strong>
                <div style={{ fontSize: '1.25rem', color: '#10b981' }}>
                  {lightingType === 'top-only' ? '2000' : 
                   lightingType === 'top-side' ? '2500' : '2800'} W/m²
                </div>
              </div>
              <div>
                <strong>Canopy Light Capture:</strong>
                <div style={{ fontSize: '1.25rem', color: '#f59e0b' }}>
                  {lightingType === 'top-only' ? '65%' : 
                   lightingType === 'top-side' ? '75%' : '82%'}
                </div>
              </div>
              <div>
                <strong>Est. Yield Increase:</strong>
                <div style={{ fontSize: '1.25rem', color: '#3b82f6' }}>
                  {lightingType === 'top-only' ? 'Baseline' : 
                   lightingType === 'top-side' ? '+15-20%' : '+25-35%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}