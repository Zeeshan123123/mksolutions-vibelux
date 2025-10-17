'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MultiLayerCanopyRayTracer, CanopyLayer, LeafOpticalProperties, SpectralPowerDistribution } from '@/lib/photonics/multi-layer-canopy-raytracer';
import { vec3 } from 'gl-matrix';

export default function VerticalFarmRayTracingDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  
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
      
      // Set room
      rayTracer.setRoom(10, 20, 8, 0.7);
      
      // Add layers
      const layers = [
        { id: 'top', height: 6, thickness: 0.8, lai: 3.5 },
        { id: 'middle', height: 4, thickness: 0.6, lai: 2.8 },
        { id: 'bottom', height: 2, thickness: 0.5, lai: 2.0 }
      ];
      
      layers.forEach(layer => {
        const opticalProps: LeafOpticalProperties = {
          reflectance: new Array(401).fill(0.1),
          transmittance: new Array(401).fill(0.1),
          absorptance: new Array(401).fill(0.8),
          chlorophyllContent: 35,
          carotenoidContent: 8,
          waterContent: 800,
          dryMatter: 50
        };
        
        rayTracer.addLayer({
          ...layer,
          leafAngleDistribution: { type: 'spherical' },
          leafOpticalProperties: opticalProps,
          plantDensity: 100,
          growthStage: 'vegetative',
          species: 'Lettuce'
        });
      });
      
      // Add light
      rayTracer.addLightSource({
        position: vec3.fromValues(5, 10, 7.5),
        spectrum: new SpectralPowerDistribution(new Float32Array(401).fill(1)),
        intensity: 2000,
        distribution: 'lambertian',
        beamAngle: 120
      });
      
      // Run simulation
      const result = await rayTracer.trace(0.5);
      setResults(result);
      
    } catch (error) {
      console.error('Ray tracing error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Vertical Farm Ray Tracing Demo</h1>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#e0f2fe', 
        borderRadius: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        <p style={{ marginBottom: '0.5rem' }}>
          This demo shows uniform plant distribution. For a more realistic simulation with individual plant placement:
        </p>
        <a 
          href="/demo/vertical-farm-raytracing/with-plants"
          style={{ color: '#0369a1', textDecoration: 'underline' }}
        >
          Try the Advanced Demo with Plant Placement →
        </a>
        <br />
        <a 
          href="/demo/vertical-farm-raytracing/tall-plants"
          style={{ color: '#0369a1', textDecoration: 'underline' }}
        >
          Try the Tall Plants Demo (Cannabis, Tomatoes, Cucumbers) →
        </a>
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
          cursor: isCalculating ? 'not-allowed' : 'pointer'
        }}
      >
        {isCalculating ? 'Calculating...' : 'Run Ray Tracing'}
      </button>
      
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
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Uniformity</h3>
              {Array.from(results.uniformityByLayer.entries()).map(([layerId, uniformity]) => (
                <div key={layerId} style={{ marginBottom: '0.25rem' }}>
                  <strong>{layerId}:</strong> CV = {(uniformity.cv * 100).toFixed(1)}%
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}