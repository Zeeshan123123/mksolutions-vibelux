/**
 * Multi-Layer Canopy Ray Tracer for Vertical Farming
 * 
 * Implements advanced ray tracing through multiple canopy layers with:
 * - Layer-specific LAI (Leaf Area Index)
 * - Inter-canopy light scattering
 * - Spectral absorption per layer
 * - Vertical light distribution profiles
 * 
 * Units and Conventions:
 * - Distances: meters (m)
 * - Irradiance: W/m²/nm (spectral irradiance per nanometer)
 * - PPFD: μmol/m²/s (photosynthetic photon flux density)
 * - Wavelength: nanometers (nm), 380-780nm range
 * - LAI: m²/m² (dimensionless leaf area per ground area)
 * 
 * Key Assumptions:
 * - Beer-Lambert law applies with modifications for scattering
 * - Leaf optical properties are wavelength-dependent
 * - Scattering is approximated as 50% of non-absorbed light
 * - Fluorescence quantum yield is fixed at 5%
 */

import { vec3, mat4 } from 'gl-matrix';
// Spectral power distribution type
export class SpectralPowerDistribution {
  constructor(public data: Float32Array) {}
  
  getSpectralData(): Float32Array {
    return this.data;
  }
}

export interface CanopyLayer {
  id: string;
  height: number; // Height from ground (m)
  thickness: number; // Layer thickness (m)
  lai: number; // Leaf Area Index (can be overridden by plant placement)
  leafAngleDistribution: LeafAngleDistribution;
  leafOpticalProperties: LeafOpticalProperties;
  plantDensity: number; // plants/m²
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'mature';
  species: string;
  // Optional plant placement data
  plantPlacement?: {
    positions: Float32Array; // x,y,z coordinates
    sizes: Float32Array; // height, canopy diameter pairs
    properties: Float32Array; // LAI, health pairs
  };
}

export interface LeafAngleDistribution {
  type: 'spherical' | 'uniform' | 'planophile' | 'erectophile' | 'plagiophile' | 'extremophile';
  meanAngle?: number; // degrees from horizontal
  beta?: number; // Beta distribution parameter
}

export interface LeafOpticalProperties {
  // Wavelength-dependent properties (380-780nm)
  reflectance: number[]; // Array of 401 values
  transmittance: number[]; // Array of 401 values
  absorptance: number[]; // Array of 401 values
  chlorophyllContent: number; // mg/m²
  carotenoidContent: number; // mg/m²
  waterContent: number; // g/m²
  dryMatter: number; // g/m²
}

export interface RayTracingConfig {
  raysPerPixel: number;
  maxBounces: number;
  wavelengthSamples: number;
  enableVolumetricScattering: boolean;
  enableFluorescence: boolean;
  convergenceThreshold: number;
}

export interface LightSource {
  position: vec3;
  spectrum: SpectralPowerDistribution;
  intensity: number; // μmol/s
  distribution: 'lambertian' | 'ies' | 'gaussian';
  iesData?: any;
  beamAngle?: number;
}

export interface TracingResult {
  ppfdByLayer: Map<string, number>;
  spectralIrradianceByLayer: Map<string, Float32Array>;
  absorptionByLayer: Map<string, { par: number; blue: number; red: number; farRed: number }>;
  penetrationProfile: { depth: number; ppfd: number; spectrum: Float32Array }[];
  scatteringContribution: number;
  uniformityByLayer: Map<string, { min: number; max: number; avg: number; cv: number }>;
}

export class MultiLayerCanopyRayTracer {
  private layers: CanopyLayer[] = [];
  private lightSources: LightSource[] = [];
  private config: RayTracingConfig;
  private roomDimensions: { width: number; length: number; height: number };
  private wallMaterial: { reflectance: number[]; diffuse: boolean };
  
  // Pre-computed leaf angle PDFs for efficiency
  private leafAnglePDFs: Map<string, Float32Array> = new Map();
  
  // Wavelength sampling for spectral calculations
  private wavelengths: Float32Array;
  
  constructor(config: RayTracingConfig = {
    raysPerPixel: 1000,
    maxBounces: 10,
    wavelengthSamples: 31, // Sample every 10nm from 400-700nm
    enableVolumetricScattering: true,
    enableFluorescence: true,
    convergenceThreshold: 0.01
  }) {
    this.config = config;
    this.wavelengths = this.generateWavelengthSamples();
  }

  setRoom(width: number, length: number, height: number, wallReflectance: number = 0.7) {
    this.roomDimensions = { width, length, height };
    this.wallMaterial = {
      reflectance: new Array(401).fill(wallReflectance),
      diffuse: true
    };
  }

  addLayer(layer: CanopyLayer) {
    // Validate layer parameters
    if (layer.lai < 0 || layer.lai > 20) {
      console.warn(`Unusual LAI value: ${layer.lai}. Typical range is 0-10.`);
    }
    if (layer.thickness < 0.01 || layer.thickness > 5) {
      console.warn(`Unusual layer thickness: ${layer.thickness}m. Typical range is 0.1-3m.`);
    }
    if (layer.leafOpticalProperties.reflectance.length !== 401 ||
        layer.leafOpticalProperties.transmittance.length !== 401 ||
        layer.leafOpticalProperties.absorptance.length !== 401) {
      throw new Error('Leaf optical properties must have 401 wavelength points (380-780nm)');
    }
    
    this.layers.push(layer);
    this.layers.sort((a, b) => b.height - a.height); // Sort top to bottom
    this.precomputeLeafAnglePDF(layer);
  }

  addLightSource(light: LightSource) {
    this.lightSources.push(light);
  }

  /**
   * Main ray tracing function
   */
  async trace(gridResolution: number = 0.1): Promise<TracingResult> {
    const result: TracingResult = {
      ppfdByLayer: new Map(),
      spectralIrradianceByLayer: new Map(),
      absorptionByLayer: new Map(),
      penetrationProfile: [],
      scatteringContribution: 0,
      uniformityByLayer: new Map()
    };

    // Initialize result maps
    this.layers.forEach(layer => {
      result.ppfdByLayer.set(layer.id, 0);
      result.spectralIrradianceByLayer.set(layer.id, new Float32Array(401));
      result.absorptionByLayer.set(layer.id, { par: 0, blue: 0, red: 0, farRed: 0 });
      result.uniformityByLayer.set(layer.id, { min: Infinity, max: 0, avg: 0, cv: 0 });
    });

    // Create sampling grid
    const gridX = Math.ceil(this.roomDimensions.width / gridResolution);
    const gridY = Math.ceil(this.roomDimensions.length / gridResolution);
    const totalPoints = gridX * gridY;

    // Trace rays for each grid point
    for (let x = 0; x < gridX; x++) {
      for (let y = 0; y < gridY; y++) {
        const worldX = (x + 0.5) * gridResolution;
        const worldY = (y + 0.5) * gridResolution;
        
        // Trace through all layers at this position
        const columnResult = await this.traceColumn(worldX, worldY);
        
        // Aggregate results
        this.aggregateColumnResults(result, columnResult);
      }
      
      // Progress callback
      if (x % 10 === 0) {
        const progress = (x * gridY) / totalPoints;
        console.log(`Ray tracing progress: ${(progress * 100).toFixed(1)}%`);
      }
    }

    // Calculate uniformity metrics
    this.calculateUniformity(result, totalPoints);
    
    // Generate penetration profile
    result.penetrationProfile = this.generatePenetrationProfile(result);

    return result;
  }

  /**
   * Trace rays through a vertical column at given position
   */
  private async traceColumn(x: number, y: number): Promise<any> {
    const columnResult = {
      layers: new Map<string, {
        irradiance: Float32Array;
        absorbed: Float32Array;
        ppfd: number;
      }>()
    };

    // Initialize for each layer
    this.layers.forEach(layer => {
      columnResult.layers.set(layer.id, {
        irradiance: new Float32Array(401),
        absorbed: new Float32Array(401),
        ppfd: 0
      });
    });

    // Trace rays from each light source
    for (const light of this.lightSources) {
      for (let ray = 0; ray < this.config.raysPerPixel; ray++) {
        // Generate ray from light to column position
        const rayDir = this.generateRayDirection(light, x, y);
        const rayOrigin = vec3.clone(light.position);
        
        // Trace through layers
        await this.traceRayThroughLayers(
          rayOrigin,
          rayDir,
          light.spectrum,
          columnResult,
          0
        );
      }
    }

    // Normalize by number of rays
    columnResult.layers.forEach(layerData => {
      for (let i = 0; i < 401; i++) {
        layerData.irradiance[i] /= this.config.raysPerPixel;
        layerData.absorbed[i] /= this.config.raysPerPixel;
      }
      layerData.ppfd = this.calculatePPFD(layerData.irradiance);
    });

    return columnResult;
  }

  /**
   * Trace a single ray through multiple canopy layers
   */
  private async traceRayThroughLayers(
    origin: vec3,
    direction: vec3,
    spectrum: SpectralPowerDistribution,
    columnResult: any,
    bounceCount: number
  ): Promise<void> {
    if (bounceCount > this.config.maxBounces) return;

    let currentOrigin = vec3.clone(origin);
    const currentDirection = vec3.clone(direction);
    let currentSpectrum = spectrum.getSpectralData();
    
    // Check each layer from top to bottom
    for (const layer of this.layers) {
      const intersection = this.intersectLayer(currentOrigin, currentDirection, layer);
      
      if (intersection) {
        // Calculate path length through layer
        const pathLength = intersection.exitPoint ? 
          vec3.distance(intersection.entryPoint, intersection.exitPoint) :
          layer.thickness;
        
        // Apply Beer-Lambert law with spectral resolution
        const { transmitted, absorbed, scattered } = this.applyBeerLambert(
          currentSpectrum,
          pathLength,
          layer,
          intersection.entryPoint
        );
        
        // Record absorption in this layer
        const layerData = columnResult.layers.get(layer.id);
        for (let i = 0; i < 401; i++) {
          layerData.absorbed[i] += absorbed[i];
          layerData.irradiance[i] += currentSpectrum[i];
        }
        
        // Handle scattering
        if (this.config.enableVolumetricScattering && scattered.some(s => s > 0)) {
          // Generate scattered rays
          const scatteredRays = this.generateScatteredRays(
            intersection.entryPoint,
            currentDirection,
            layer,
            scattered
          );
          
          // Recursively trace scattered rays
          for (const scatteredRay of scatteredRays) {
            await this.traceRayThroughLayers(
              scatteredRay.origin,
              scatteredRay.direction,
              new SpectralPowerDistribution(scatteredRay.spectrum),
              columnResult,
              bounceCount + 1
            );
          }
        }
        
        // Handle fluorescence
        if (this.config.enableFluorescence && layer.leafOpticalProperties.chlorophyllContent > 0) {
          const fluorescence = this.calculateFluorescence(absorbed, layer);
          if (fluorescence.some(f => f > 0)) {
            // Add fluorescence as a new light source within the canopy
            const fluorescenceSpectrum = new SpectralPowerDistribution(fluorescence);
            await this.traceRayThroughLayers(
              intersection.entryPoint,
              this.randomHemisphereDirection(vec3.fromValues(0, 0, -1)),
              fluorescenceSpectrum,
              columnResult,
              bounceCount + 1
            );
          }
        }
        
        // Update spectrum for next layer
        currentSpectrum = transmitted;
        if (intersection.exitPoint) {
          currentOrigin = vec3.clone(intersection.exitPoint);
        }
      }
    }
    
    // Check for wall reflections
    const wallHit = this.intersectWalls(currentOrigin, currentDirection);
    if (wallHit && bounceCount < this.config.maxBounces) {
      const reflectedSpectrum = this.calculateWallReflection(currentSpectrum, wallHit);
      const reflectedDir = this.calculateReflectionDirection(currentDirection, wallHit.normal);
      
      await this.traceRayThroughLayers(
        wallHit.point,
        reflectedDir,
        new SpectralPowerDistribution(reflectedSpectrum),
        columnResult,
        bounceCount + 1
      );
    }
  }

  /**
   * Calculate local LAI based on plant positions
   */
  private calculateLocalLAI(position: vec3, layer: CanopyLayer): number {
    if (!layer.plantPlacement) {
      return layer.lai; // Use uniform LAI if no placement data
    }
    
    const { positions, sizes, properties } = layer.plantPlacement;
    const numPlants = positions.length / 3;
    let totalLAI = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < numPlants; i++) {
      const plantX = positions[i * 3];
      const plantY = positions[i * 3 + 1];
      const plantZ = positions[i * 3 + 2];
      
      const plantHeight = sizes[i * 2]; // Plant height
      const canopyRadius = sizes[i * 2 + 1] / 2; // Diameter to radius
      const plantLAI = properties[i * 2]; // Individual plant LAI
      const health = properties[i * 2 + 1]; // Health factor
      
      // Calculate distance from ray position to plant center
      const dx = position[0] - plantX;
      const dy = position[1] - plantY;
      const dz = position[2] - plantZ;
      const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if within canopy radius horizontally
      if (horizontalDistance < canopyRadius) {
        // For tall plants, check vertical distribution
        let verticalWeight = 1.0;
        
        // If ray is above or below plant, no contribution
        if (dz < 0 || dz > plantHeight) {
          continue;
        }
        
        // Model vertical LAI distribution based on plant type
        const relativeHeight = dz / plantHeight;
        
        // Different vertical distributions for different plant types
        if (layer.species.includes('cannabis')) {
          // Cannabis: Bell-shaped distribution slightly shifted upward
          // Peak at 60-70% height during flowering
          const peak = layer.growthStage === 'flowering' ? 0.65 : 0.5;
          verticalWeight = Math.exp(-Math.pow((relativeHeight - peak) * 3, 2));
        } else if (layer.species.includes('tomato')) {
          // Tomato: More uniform with slight top bias after lower leaf removal
          if (relativeHeight < 0.2) {
            verticalWeight = 0.3; // Lower leaves often removed
          } else {
            verticalWeight = 0.8 + 0.2 * relativeHeight;
          }
        } else if (layer.species.includes('cucumber')) {
          // Cucumber: Relatively uniform along trained vine
          verticalWeight = 0.9 + 0.1 * Math.sin(relativeHeight * Math.PI);
        } else if (layer.species.includes('lettuce') || layer.species.includes('leafy')) {
          // Leafy greens: Concentrated near base
          verticalWeight = Math.exp(-relativeHeight * 2);
        } else {
          // Default: Bell-shaped centered at mid-height
          verticalWeight = Math.exp(-Math.pow((relativeHeight - 0.5) * 2, 2));
        }
        
        // Horizontal distribution (Gaussian from center)
        const normalizedDist = horizontalDistance / canopyRadius;
        const horizontalWeight = Math.exp(-2 * normalizedDist * normalizedDist);
        
        const totalPlantWeight = horizontalWeight * verticalWeight;
        totalLAI += plantLAI * health * totalPlantWeight;
        totalWeight += totalPlantWeight;
      }
    }
    
    // If no plants affect this position, use layer default
    return totalWeight > 0 ? totalLAI : layer.lai;
  }

  /**
   * Apply Beer-Lambert law with spectral resolution
   */
  private applyBeerLambert(
    spectrum: Float32Array,
    pathLength: number,
    layer: CanopyLayer,
    position?: vec3
  ): { transmitted: Float32Array; absorbed: Float32Array; scattered: Float32Array } {
    const transmitted = new Float32Array(401);
    const absorbed = new Float32Array(401);
    const scattered = new Float32Array(401);
    
    // Use local LAI if position is provided, otherwise use layer average
    const localLAI = position ? this.calculateLocalLAI(position, layer) : layer.lai;
    
    // Calculate extinction coefficient based on LAI and leaf angle distribution
    const G = this.calculateLeafProjectionFunction(layer.leafAngleDistribution);
    const extinctionCoeff = G * localLAI / layer.thickness;
    
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      // Get leaf optical properties at this wavelength
      const reflectance = layer.leafOpticalProperties.reflectance[i];
      const transmittance = layer.leafOpticalProperties.transmittance[i];
      const absorptance = layer.leafOpticalProperties.absorptance[i];
      
      // Modified Beer-Lambert with scattering
      const totalExtinction = extinctionCoeff * pathLength;
      const directTransmission = Math.exp(-totalExtinction);
      
      // Account for leaf reflectance and transmittance
      const scatteringAlbedo = reflectance + transmittance;
      const effectiveTransmission = directTransmission + 
        (1 - directTransmission) * scatteringAlbedo * 0.5; // Approximation
      
      transmitted[i] = spectrum[i] * effectiveTransmission;
      absorbed[i] = spectrum[i] * (1 - effectiveTransmission) * absorptance;
      scattered[i] = spectrum[i] * (1 - effectiveTransmission) * scatteringAlbedo;
    }
    
    return { transmitted, absorbed, scattered };
  }

  /**
   * Calculate leaf projection function G for different leaf angle distributions
   */
  private calculateLeafProjectionFunction(distribution: LeafAngleDistribution): number {
    switch (distribution.type) {
      case 'spherical':
        return 0.5;
      case 'uniform':
        return 0.5;
      case 'planophile': // Horizontal leaves
        return 0.88;
      case 'erectophile': // Vertical leaves
        return 0.32;
      case 'plagiophile': // 45° leaves
        return 0.66;
      case 'extremophile': // Mix of horizontal and vertical
        return 0.6;
      default:
        // Custom distribution based on mean angle
        if (distribution.meanAngle !== undefined) {
          // Limit angle to prevent infinity at 90 degrees
          const angleRad = Math.min(distribution.meanAngle * Math.PI / 180, Math.PI / 2 - 0.1);
          return 0.5 / Math.cos(angleRad);
        }
        return 0.5;
    }
  }

  /**
   * Calculate chlorophyll fluorescence emission
   */
  private calculateFluorescence(absorbed: Float32Array, layer: CanopyLayer): Float32Array {
    const fluorescence = new Float32Array(401);
    const chlorophyllContent = layer.leafOpticalProperties.chlorophyllContent;
    
    if (chlorophyllContent === 0) return fluorescence;
    
    // Chlorophyll fluorescence peaks at 685nm and 740nm
    const quantumYield = 0.05; // Typical for healthy plants
    
    // Integrate absorbed blue and red light
    let excitationEnergy = 0;
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      if (wavelength >= 400 && wavelength <= 500) { // Blue
        excitationEnergy += absorbed[i] * 1.2; // Higher energy photons
      } else if (wavelength >= 600 && wavelength <= 680) { // Red
        excitationEnergy += absorbed[i];
      }
    }
    
    // Emit fluorescence with Gaussian peaks
    const peak1 = 685; // nm
    const peak2 = 740; // nm
    const sigma1 = 15; // nm
    const sigma2 = 25; // nm
    
    for (let i = 0; i < 401; i++) {
      const wavelength = 380 + i;
      
      const gaussian1 = Math.exp(-Math.pow(wavelength - peak1, 2) / (2 * sigma1 * sigma1));
      const gaussian2 = Math.exp(-Math.pow(wavelength - peak2, 2) / (2 * sigma2 * sigma2));
      
      fluorescence[i] = excitationEnergy * quantumYield * 
        (0.7 * gaussian1 + 0.3 * gaussian2) / (sigma1 + sigma2);
    }
    
    return fluorescence;
  }

  /**
   * Generate scattered rays based on leaf optical properties
   */
  private generateScatteredRays(
    origin: vec3,
    incidentDir: vec3,
    layer: CanopyLayer,
    scatteredSpectrum: Float32Array
  ): Array<{ origin: vec3; direction: vec3; spectrum: Float32Array }> {
    const rays: Array<{ origin: vec3; direction: vec3; spectrum: Float32Array }> = [];
    
    // Number of scattered rays based on importance
    const totalScattered = scatteredSpectrum.reduce((a, b) => a + b, 0);
    const numRays = Math.min(Math.ceil(totalScattered * 10), 5);
    
    for (let i = 0; i < numRays; i++) {
      // Sample leaf angle from distribution
      const leafNormal = this.sampleLeafNormal(layer.leafAngleDistribution);
      
      // Calculate reflection/transmission based on leaf interaction
      const cosTheta = Math.abs(vec3.dot(incidentDir, leafNormal));
      const isReflection = Math.random() < 0.5; // Simplified - should use actual R/T ratio
      
      let scatteredDir: vec3;
      if (isReflection) {
        // Lambertian reflection from leaf surface
        scatteredDir = this.randomHemisphereDirection(leafNormal);
      } else {
        // Transmission through leaf
        const transmitted = vec3.create();
        vec3.negate(transmitted, leafNormal);
        scatteredDir = this.randomHemisphereDirection(transmitted);
      }
      
      rays.push({
        origin: vec3.clone(origin),
        direction: scatteredDir,
        spectrum: Float32Array.from(scatteredSpectrum).map(s => s / numRays)
      });
    }
    
    return rays;
  }

  /**
   * Sample a leaf normal vector based on leaf angle distribution
   */
  private sampleLeafNormal(distribution: LeafAngleDistribution): vec3 {
    let theta: number; // Angle from vertical
    let phi: number;   // Azimuth angle
    
    // Sample zenith angle based on distribution
    switch (distribution.type) {
      case 'spherical':
        theta = Math.acos(1 - 2 * Math.random());
        break;
      case 'planophile':
        theta = Math.PI / 2 - Math.abs(this.gaussianRandom() * Math.PI / 6);
        break;
      case 'erectophile':
        theta = Math.abs(this.gaussianRandom() * Math.PI / 6);
        break;
      case 'uniform':
        theta = Math.random() * Math.PI / 2;
        break;
      default:
        theta = (distribution.meanAngle || 45) * Math.PI / 180;
        theta += this.gaussianRandom() * Math.PI / 12; // Add some variation
    }
    
    // Random azimuth
    phi = Math.random() * 2 * Math.PI;
    
    // Convert to Cartesian
    const normal = vec3.fromValues(
      Math.sin(theta) * Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta)
    );
    
    return normal;
  }

  /**
   * Check if ray intersects a canopy layer
   */
  private intersectLayer(origin: vec3, direction: vec3, layer: CanopyLayer): any {
    const topZ = layer.height + layer.thickness / 2;
    const bottomZ = layer.height - layer.thickness / 2;
    
    // Check if ray intersects layer bounds
    const t1 = (topZ - origin[2]) / direction[2];
    const t2 = (bottomZ - origin[2]) / direction[2];
    
    const tMin = Math.min(t1, t2);
    const tMax = Math.max(t1, t2);
    
    if (tMax < 0 || tMin > 1e6) return null;
    
    const entryT = Math.max(0, tMin);
    const exitT = Math.min(1e6, tMax);
    
    if (entryT > exitT) return null;
    
    const entryPoint = vec3.create();
    vec3.scaleAndAdd(entryPoint, origin, direction, entryT);
    
    const exitPoint = vec3.create();
    vec3.scaleAndAdd(exitPoint, origin, direction, exitT);
    
    // Check if points are within room bounds
    if (entryPoint[0] < 0 || entryPoint[0] > this.roomDimensions.width ||
        entryPoint[1] < 0 || entryPoint[1] > this.roomDimensions.length) {
      return null;
    }
    
    return { entryPoint, exitPoint };
  }

  /**
   * Calculate PPFD from spectral irradiance
   * Converts W/m²/nm to μmol/m²/s for PAR region (400-700nm)
   */
  private calculatePPFD(irradiance: Float32Array): number {
    let ppfd = 0;
    const h = 6.626e-34; // Planck's constant (J·s)
    const c = 2.998e8;   // Speed of light (m/s)
    const Na = 6.022e23; // Avogadro's number
    
    // Integrate over PAR region (400-700nm)
    for (let i = 20; i <= 320; i++) { // 400nm to 700nm  
      const wavelength = (380 + i) * 1e-9; // meters
      const irradianceWm2 = irradiance[i]; // W/m²/nm at this wavelength
      
      // Energy per photon at this wavelength (J/photon)
      const energyPerPhoton = h * c / wavelength;
      
      // Photon flux: W/m²/nm / (J/photon) = photons/m²/s/nm
      const photonFlux = irradianceWm2 / energyPerPhoton;
      
      // Convert to μmol/m²/s/nm
      const micromoleFlux = photonFlux / (Na / 1e6);
      
      // Sum over 1nm bandwidth
      ppfd += micromoleFlux;
    }
    
    return ppfd;
  }

  /**
   * Helper functions
   */
  private generateWavelengthSamples(): Float32Array {
    const samples = new Float32Array(this.config.wavelengthSamples);
    for (let i = 0; i < this.config.wavelengthSamples; i++) {
      samples[i] = 400 + (i * 300 / (this.config.wavelengthSamples - 1));
    }
    return samples;
  }

  private precomputeLeafAnglePDF(layer: CanopyLayer): void {
    // Precompute probability density function for leaf angles
    const pdf = new Float32Array(180); // 1-degree resolution
    
    for (let angle = 0; angle < 180; angle++) {
      pdf[angle] = this.leafAngleProbability(angle, layer.leafAngleDistribution);
    }
    
    // Normalize
    const sum = pdf.reduce((a, b) => a + b, 0);
    for (let i = 0; i < 180; i++) {
      pdf[i] /= sum;
    }
    
    this.leafAnglePDFs.set(layer.id, pdf);
  }

  private leafAngleProbability(angleDegrees: number, distribution: LeafAngleDistribution): number {
    const angleRad = angleDegrees * Math.PI / 180;
    
    switch (distribution.type) {
      case 'spherical':
        return Math.sin(angleRad);
      case 'uniform':
        return 1;
      case 'planophile':
        return 2 * (1 + Math.cos(2 * angleRad)) / Math.PI;
      case 'erectophile':
        return 2 * (1 - Math.cos(2 * angleRad)) / Math.PI;
      default:
        // Beta distribution
        const beta = distribution.beta || 1;
        return Math.pow(Math.sin(angleRad), beta);
    }
  }

  private randomHemisphereDirection(normal: vec3): vec3 {
    // Generate random direction in hemisphere oriented by normal
    const u1 = Math.random();
    const u2 = Math.random();
    
    const r = Math.sqrt(1 - u1 * u1);
    const phi = 2 * Math.PI * u2;
    
    const localDir = vec3.fromValues(
      r * Math.cos(phi),
      r * Math.sin(phi),
      u1
    );
    
    // Transform to world space
    const tangent = vec3.create();
    const bitangent = vec3.create();
    this.createOrthonormalBasis(normal, tangent, bitangent);
    
    const worldDir = vec3.create();
    vec3.scale(worldDir, tangent, localDir[0]);
    vec3.scaleAndAdd(worldDir, worldDir, bitangent, localDir[1]);
    vec3.scaleAndAdd(worldDir, worldDir, normal, localDir[2]);
    
    return vec3.normalize(worldDir, worldDir);
  }

  private createOrthonormalBasis(normal: vec3, tangent: vec3, bitangent: vec3): void {
    if (Math.abs(normal[0]) > 0.9) {
      vec3.set(tangent, 0, 1, 0);
    } else {
      vec3.set(tangent, 1, 0, 0);
    }
    
    vec3.cross(tangent, tangent, normal);
    vec3.normalize(tangent, tangent);
    
    vec3.cross(bitangent, normal, tangent);
  }

  private gaussianRandom(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private generateRayDirection(light: LightSource, x: number, y: number): vec3 {
    const target = vec3.fromValues(x, y, this.layers[0].height);
    const direction = vec3.create();
    vec3.subtract(direction, target, light.position);
    vec3.normalize(direction, direction);
    
    // Add some jitter for soft shadows
    const jitter = 0.01;
    direction[0] += (Math.random() - 0.5) * jitter;
    direction[1] += (Math.random() - 0.5) * jitter;
    direction[2] += (Math.random() - 0.5) * jitter;
    vec3.normalize(direction, direction);
    
    return direction;
  }

  private intersectWalls(origin: vec3, direction: vec3): any {
    // Simple box intersection
    const bounds = {
      min: vec3.fromValues(0, 0, 0),
      max: vec3.fromValues(
        this.roomDimensions.width,
        this.roomDimensions.length,
        this.roomDimensions.height
      )
    };
    
    let tMin = 0;
    let tMax = Infinity;
    let normal = vec3.create();
    
    for (let i = 0; i < 3; i++) {
      if (Math.abs(direction[i]) < 1e-6) {
        if (origin[i] < bounds.min[i] || origin[i] > bounds.max[i]) {
          return null;
        }
      } else {
        const t1 = (bounds.min[i] - origin[i]) / direction[i];
        const t2 = (bounds.max[i] - origin[i]) / direction[i];
        
        const tNear = Math.min(t1, t2);
        const tFar = Math.max(t1, t2);
        
        if (tNear > tMin) {
          tMin = tNear;
          normal = vec3.create();
          normal[i] = t1 < t2 ? -1 : 1;
        }
        
        tMax = Math.min(tMax, tFar);
        
        if (tMin > tMax) return null;
      }
    }
    
    if (tMin < 0) return null;
    
    const point = vec3.create();
    vec3.scaleAndAdd(point, origin, direction, tMin);
    
    return { point, normal, distance: tMin };
  }

  private calculateWallReflection(spectrum: Float32Array, wallHit: any): Float32Array {
    const reflected = new Float32Array(401);
    
    for (let i = 0; i < 401; i++) {
      reflected[i] = spectrum[i] * this.wallMaterial.reflectance[i];
    }
    
    return reflected;
  }

  private calculateReflectionDirection(incident: vec3, normal: vec3): vec3 {
    if (this.wallMaterial.diffuse) {
      // Lambertian reflection
      return this.randomHemisphereDirection(normal);
    } else {
      // Specular reflection
      const reflected = vec3.create();
      const dot = vec3.dot(incident, normal);
      vec3.scaleAndAdd(reflected, incident, normal, -2 * dot);
      return vec3.normalize(reflected, reflected);
    }
  }

  private aggregateColumnResults(result: TracingResult, columnResult: any): void {
    columnResult.layers.forEach((layerData: any, layerId: string) => {
      const currentPPFD = result.ppfdByLayer.get(layerId) || 0;
      result.ppfdByLayer.set(layerId, currentPPFD + layerData.ppfd);
      
      const currentSpectrum = result.spectralIrradianceByLayer.get(layerId)!;
      for (let i = 0; i < 401; i++) {
        currentSpectrum[i] += layerData.irradiance[i];
      }
      
      // Calculate absorption by wavelength bands
      const absorption = result.absorptionByLayer.get(layerId)!;
      for (let i = 0; i < 401; i++) {
        const wavelength = 380 + i;
        const absorbed = layerData.absorbed[i];
        
        if (wavelength >= 400 && wavelength <= 700) {
          absorption.par += absorbed;
        }
        if (wavelength >= 400 && wavelength <= 500) {
          absorption.blue += absorbed;
        }
        if (wavelength >= 600 && wavelength <= 700) {
          absorption.red += absorbed;
        }
        if (wavelength >= 700 && wavelength <= 800) {
          absorption.farRed += absorbed;
        }
      }
      
      // Update uniformity stats
      const uniformity = result.uniformityByLayer.get(layerId)!;
      uniformity.min = Math.min(uniformity.min, layerData.ppfd);
      uniformity.max = Math.max(uniformity.max, layerData.ppfd);
      uniformity.avg += layerData.ppfd;
    });
  }

  private calculateUniformity(result: TracingResult, totalPoints: number): void {
    result.uniformityByLayer.forEach((uniformity, layerId) => {
      uniformity.avg /= totalPoints;
      
      // Calculate coefficient of variation
      // This is simplified - proper CV would need variance calculation
      const range = uniformity.max - uniformity.min;
      uniformity.cv = uniformity.avg > 0 ? range / uniformity.avg : 0;
    });
  }

  private generatePenetrationProfile(result: TracingResult): any[] {
    const profile: any[] = [];
    
    // Sample at regular height intervals
    const heightStep = 0.1; // meters
    for (let height = this.roomDimensions.height; height >= 0; height -= heightStep) {
      let ppfd = 0;
      const spectrum = new Float32Array(401);
      
      // Find which layer this height belongs to
      for (const layer of this.layers) {
        if (height >= layer.height - layer.thickness / 2 &&
            height <= layer.height + layer.thickness / 2) {
          ppfd = result.ppfdByLayer.get(layer.id) || 0;
          const layerSpectrum = result.spectralIrradianceByLayer.get(layer.id);
          if (layerSpectrum) {
            for (let i = 0; i < 401; i++) {
              spectrum[i] = layerSpectrum[i];
            }
          }
          break;
        }
      }
      
      profile.push({
        depth: this.roomDimensions.height - height,
        ppfd,
        spectrum
      });
    }
    
    return profile;
  }
}