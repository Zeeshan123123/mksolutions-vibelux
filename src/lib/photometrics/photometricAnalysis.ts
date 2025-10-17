import { IESData, IESParser } from './iesParser';
import type { Position3D, LightingFixture } from '@/lib/types/lighting';

export interface PhotometricPoint {
  position: Position3D;
  intensity: number;
  illuminance: number;
  angle: number;
}

export interface PhotometricGrid {
  points: PhotometricPoint[][];
  dimensions: {
    width: number;
    height: number;
    resolution: number;
  };
  statistics: {
    min: number;
    max: number;
    average: number;
    uniformity: number;
    cv: number; // Coefficient of variation
  };
}

export class PhotometricAnalysis {
  private iesData: Map<string, IESData> = new Map();
  
  /**
   * Load IES data for a fixture type
   */
  async loadIESFile(fixtureType: string, iesContent: string): Promise<void> {
    const data = await IESParser.parse(iesContent);
    this.iesData.set(fixtureType, data);
  }
  
  /**
   * Calculate illuminance at a point from a single fixture
   */
  calculateIlluminance(
    fixture: LightingFixture,
    point: Position3D,
    iesData?: IESData
  ): number {
    // Get IES data for fixture
    const photometricData = iesData || this.iesData.get(fixture.specifications.model);
    if (!photometricData) {
      // Fallback to simple calculation
      return this.calculateSimpleIlluminance(fixture, point);
    }
    
    // Calculate vector from fixture to point
    const dx = point.x - fixture.position.x;
    const dy = point.y - fixture.position.y;
    const dz = point.z - fixture.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Calculate angles
    const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
    const verticalAngle = Math.atan2(horizontalDistance, Math.abs(dz)) * (180 / Math.PI);
    const horizontalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Get candela value from IES data
    const candela = IESParser.interpolateCandela(
      photometricData,
      verticalAngle,
      horizontalAngle
    );
    
    // Apply dimming if specified
    const dimmingFactor = fixture.dimming || 1.0;
    
    // Calculate illuminance (lux = candela / distance²)
    const illuminance = (candela * dimmingFactor) / (distance * distance);
    
    // Apply cosine correction for angle of incidence
    const cosineAngle = Math.abs(dz) / distance;
    return illuminance * cosineAngle;
  }
  
  /**
   * Simple illuminance calculation without IES data
   */
  private calculateSimpleIlluminance(
    fixture: LightingFixture,
    point: Position3D
  ): number {
    const power = fixture.specifications.power;
    const efficacy = fixture.specifications.efficacy || 2.5; // μmol/J default
    const ppf = power * efficacy;
    
    // Calculate distance
    const dx = point.x - fixture.position.x;
    const dy = point.y - fixture.position.y;
    const dz = point.z - fixture.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Lambertian distribution
    const beamAngle = fixture.specifications.beamAngle || 120;
    const halfAngle = (beamAngle * Math.PI) / 360;
    const solidAngle = 2 * Math.PI * (1 - Math.cos(halfAngle));
    
    // Calculate angle from fixture normal
    const angle = Math.acos(Math.abs(dz) / distance);
    
    if (angle > halfAngle) {
      return 0; // Outside beam angle
    }
    
    // Cosine falloff
    const intensity = (ppf / solidAngle) * Math.cos(angle);
    const ppfd = intensity / (distance * distance);
    
    return ppfd * (fixture.dimming || 1.0);
  }
  
  /**
   * Generate photometric grid for multiple fixtures
   */
  generateGrid(
    fixtures: LightingFixture[],
    area: { width: number; length: number; height: number },
    resolution: number = 0.5 // meters
  ): PhotometricGrid {
    const cols = Math.ceil(area.width / resolution);
    const rows = Math.ceil(area.length / resolution);
    const points: PhotometricPoint[][] = [];
    
    let minIntensity = Infinity;
    let maxIntensity = -Infinity;
    let totalIntensity = 0;
    let pointCount = 0;
    
    // Calculate illuminance at each grid point
    for (let row = 0; row < rows; row++) {
      const rowPoints: PhotometricPoint[] = [];
      
      for (let col = 0; col < cols; col++) {
        const x = col * resolution - area.width / 2;
        const y = row * resolution - area.length / 2;
        const z = 0; // Floor level
        
        const point: Position3D = { x, y, z };
        
        // Sum contribution from all fixtures
        let totalIlluminance = 0;
        for (const fixture of fixtures) {
          if (fixture.enabled !== false) {
            totalIlluminance += this.calculateIlluminance(fixture, point);
          }
        }
        
        // Convert to PPFD if needed
        const intensity = totalIlluminance;
        
        rowPoints.push({
          position: point,
          intensity,
          illuminance: totalIlluminance,
          angle: 0 // Could calculate incident angle if needed
        });
        
        // Update statistics
        minIntensity = Math.min(minIntensity, intensity);
        maxIntensity = Math.max(maxIntensity, intensity);
        totalIntensity += intensity;
        pointCount++;
      }
      
      points.push(rowPoints);
    }
    
    // Calculate statistics
    const average = totalIntensity / pointCount;
    const uniformity = minIntensity / average;
    
    // Calculate coefficient of variation
    let sumSquaredDiff = 0;
    for (const row of points) {
      for (const point of row) {
        const diff = point.intensity - average;
        sumSquaredDiff += diff * diff;
      }
    }
    const variance = sumSquaredDiff / pointCount;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / average;
    
    return {
      points,
      dimensions: {
        width: area.width,
        height: area.length,
        resolution
      },
      statistics: {
        min: minIntensity,
        max: maxIntensity,
        average,
        uniformity,
        cv
      }
    };
  }
  
  /**
   * Generate polar intensity distribution
   */
  generatePolarDistribution(
    fixtureType: string,
    angles: number[] = Array.from({ length: 37 }, (_, i) => i * 10)
  ): { angle: number; intensity: number }[] {
    const iesData = this.iesData.get(fixtureType);
    if (!iesData) {
      throw new Error(`No IES data loaded for fixture type: ${fixtureType}`);
    }
    
    const distribution: { angle: number; intensity: number }[] = [];
    
    for (const angle of angles) {
      const intensity = IESParser.interpolateCandela(iesData, angle, 0);
      distribution.push({ angle, intensity });
    }
    
    return distribution;
  }
  
  /**
   * Calculate Daily Light Integral (DLI)
   */
  calculateDLI(ppfd: number, photoperiod: number): number {
    // DLI = PPFD × photoperiod × 3600 / 1,000,000
    return (ppfd * photoperiod * 3600) / 1000000;
  }
  
  /**
   * Optimize fixture placement for uniform coverage
   */
  optimizePlacement(
    area: { width: number; length: number; height: number },
    targetPPFD: number,
    fixtureType: string,
    constraints?: {
      minSpacing?: number;
      maxSpacing?: number;
      minHeight?: number;
      maxHeight?: number;
    }
  ): { fixtures: LightingFixture[]; grid: PhotometricGrid } {
    const iesData = this.iesData.get(fixtureType);
    if (!iesData) {
      throw new Error(`No IES data loaded for fixture type: ${fixtureType}`);
    }
    
    // Start with a regular grid and optimize
    const minSpacing = constraints?.minSpacing || 1.0;
    const maxSpacing = constraints?.maxSpacing || 3.0;
    const optimalHeight = constraints?.minHeight || area.height * 0.8;
    
    let bestLayout: LightingFixture[] = [];
    let bestUniformity = 0;
    
    // Try different spacing configurations
    for (let spacing = minSpacing; spacing <= maxSpacing; spacing += 0.1) {
      const fixtures = this.generateRegularGrid(
        area,
        spacing,
        optimalHeight,
        fixtureType
      );
      
      const grid = this.generateGrid(fixtures, area);
      
      // Check if target PPFD is met
      if (grid.statistics.average >= targetPPFD * 0.9 &&
          grid.statistics.average <= targetPPFD * 1.1 &&
          grid.statistics.uniformity > bestUniformity) {
        bestLayout = fixtures;
        bestUniformity = grid.statistics.uniformity;
      }
    }
    
    // If no good layout found, use closest match
    if (bestLayout.length === 0) {
      bestLayout = this.generateRegularGrid(
        area,
        (minSpacing + maxSpacing) / 2,
        optimalHeight,
        fixtureType
      );
    }
    
    const finalGrid = this.generateGrid(bestLayout, area);
    return { fixtures: bestLayout, grid: finalGrid };
  }
  
  /**
   * Generate regular grid of fixtures
   */
  private generateRegularGrid(
    area: { width: number; length: number },
    spacing: number,
    height: number,
    fixtureType: string
  ): LightingFixture[] {
    const fixtures: LightingFixture[] = [];
    const cols = Math.floor(area.width / spacing);
    const rows = Math.floor(area.length / spacing);
    
    const xOffset = (area.width - (cols - 1) * spacing) / 2;
    const yOffset = (area.length - (rows - 1) * spacing) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const fixture: LightingFixture = {
          id: `fixture-${row}-${col}`,
          type: 'led',
          position: {
            x: col * spacing - area.width / 2 + xOffset,
            y: row * spacing - area.length / 2 + yOffset,
            z: height
          },
          specifications: {
            model: fixtureType,
            power: 645,
            efficacy: 2.7,
            lifespan: 50000,
            beamAngle: 120,
            spectrum: 'full'
          },
          enabled: true,
          dimming: 1.0
        };
        fixtures.push(fixture);
      }
    }
    
    return fixtures;
  }
}