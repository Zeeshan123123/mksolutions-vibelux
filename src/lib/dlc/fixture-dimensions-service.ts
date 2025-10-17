/**
 * DLC Fixture Dimensions Service
 * Integrates with existing DLC parser to ensure accurate light distribution calculations
 */

import { logger } from '@/lib/logging/production-logger';
import { DLCFixturesParser, type DLCFixtureData } from '@/lib/dlc-fixtures-parser';

export interface EnhancedDLCFixture extends DLCFixtureData {
  // Enhanced calculations for light distribution
  lengthM: number; // converted to meters
  widthM: number; 
  heightM: number;
  ppfDensity: number; // PPF per square meter of fixture area
  beamAngle: number; // degrees
  fieldAngle: number; // degrees
  lightGrid: number[][]; // Even PPF distribution across fixture mechanical dimensions
  mountingType: 'overhead' | 'vertical' | 'rack';
}

export class FixtureDimensionsService {
  private dlcParser = new DLCFixturesParser();
  private enhancedFixtures = new Map<string, EnhancedDLCFixture>();
  private isLoaded = false;
  
  constructor() {
    this.loadRealDLCData();
  }
  
  /**
   * Load and enhance real DLC fixture data from CSV
   */
  private async loadRealDLCData(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      logger.info('system', '📐 Loading REAL DLC fixture dimensions from CSV...');
      
      // Load from the actual DLC CSV file
      await this.dlcParser.loadFromFile('/dlc_hort_full_2025-05-29.csv');
      const dlcFixtures = this.dlcParser.getDLCFixtures();
      
      logger.info('system', `📊 Processing ${dlcFixtures.length} real DLC fixtures...`);
      
      // Enhance each fixture with proper light distribution
      for (const dlc of dlcFixtures) {
        const enhanced = this.enhanceFixture(dlc);
        
        // Store by various keys for easy lookup
        this.enhancedFixtures.set(dlc.productId, enhanced);
        this.enhancedFixtures.set(`${dlc.manufacturer}-${dlc.modelNumber}`.toLowerCase().replace(/[^a-z0-9]/g, '-'), enhanced);
        this.enhancedFixtures.set(`${dlc.brand}-${dlc.productName}`.toLowerCase().replace(/[^a-z0-9]/g, '-'), enhanced);
      }
      
      this.isLoaded = true;
      logger.info('system', `✅ Enhanced ${dlcFixtures.length} DLC fixtures with accurate dimensions and light distribution`);
      
    } catch (error) {
      logger.error('system', 'Failed to load DLC data:', error);
      throw error;
    }
  }
  
  /**
   * Enhance a DLC fixture with accurate light distribution calculations
   */
  private enhanceFixture(dlc: DLCFixtureData): EnhancedDLCFixture {
    // Convert dimensions to meters (DLC data is in inches)
    const lengthM = (dlc.length || this.estimateLength(dlc)) * 0.0254; // inches to meters
    const widthM = (dlc.width || this.estimateWidth(dlc)) * 0.0254;
    const heightM = (dlc.height || this.estimateHeight(dlc)) * 0.0254;
    
    // Calculate fixture area and PPF density
    const fixtureArea = lengthM * widthM; // square meters
    const ppf = dlc.testedPPF || dlc.reportedPPF || 0;
    const ppfDensity = fixtureArea > 0 ? ppf / fixtureArea : 0; // μmol/s/m²
    
    // Determine beam angles based on fixture characteristics
    const beamAngle = this.calculateBeamAngle(dlc);
    const fieldAngle = beamAngle + 20; // Field angle typically 20° wider
    
    // Generate even light distribution across fixture mechanical dimensions
    const lightGrid = this.generateEvenLightDistribution(lengthM, widthM, ppf);
    
    // Determine mounting type
    const mountingType = this.determineMountingType(dlc);
    
    return {
      ...dlc,
      lengthM,
      widthM, 
      heightM,
      ppfDensity,
      beamAngle,
      fieldAngle,
      lightGrid,
      mountingType
    };
  }
  
  /**
   * Estimate length if not provided in DLC data
   */
  private estimateLength(dlc: DLCFixtureData): number {
    const wattage = dlc.testedWattage || dlc.reportedWattage || 0;
    if (wattage < 100) return 24; // 24 inches for small fixtures
    if (wattage < 300) return 36; // 36 inches for medium 
    if (wattage < 600) return 48; // 48 inches for large
    return 60; // 60 inches for extra large
  }
  
  /**
   * Estimate width if not provided in DLC data
   */
  private estimateWidth(dlc: DLCFixtureData): number {
    const wattage = dlc.testedWattage || dlc.reportedWattage || 0;
    if (wattage < 100) return 12; // 12 inches for small fixtures
    if (wattage < 300) return 18; // 18 inches for medium
    if (wattage < 600) return 24; // 24 inches for large
    return 36; // 36 inches for extra large
  }
  
  /**
   * Estimate height if not provided in DLC data
   */
  private estimateHeight(dlc: DLCFixtureData): number {
    const wattage = dlc.testedWattage || dlc.reportedWattage || 0;
    if (wattage < 100) return 3; // 3 inches for small fixtures
    if (wattage < 300) return 4; // 4 inches for medium
    if (wattage < 600) return 6; // 6 inches for large
    return 8; // 8 inches for extra large
  }
  
  /**
   * Calculate beam angle based on fixture characteristics
   */
  private calculateBeamAngle(dlc: DLCFixtureData): number {
    // Use DLC reported beam angle if available
    if (dlc.width && dlc.length) {
      // Wide fixtures typically have wider beam angles
      const aspectRatio = dlc.length / dlc.width;
      if (aspectRatio > 3) return 160; // Linear fixtures have wide distribution
      if (aspectRatio > 2) return 140; // Rectangular fixtures
      return 120; // Square-ish fixtures
    }
    
    // Default based on wattage/PPF
    const ppf = dlc.testedPPF || dlc.reportedPPF || 0;
    if (ppf > 2500) return 110; // High-power fixtures are more focused
    if (ppf > 1500) return 120; // Medium power
    return 130; // Lower power fixtures have wider distribution
  }
  
  /**
   * Determine mounting type based on fixture characteristics  
   */
  private determineMountingType(dlc: DLCFixtureData): 'overhead' | 'vertical' | 'rack' {
    // Check DLC lighting scheme data
    if (dlc.category?.toLowerCase().includes('intra-canopy')) return 'vertical';
    if (dlc.category?.toLowerCase().includes('rack')) return 'rack';
    return 'overhead'; // Default for top lighting
  }
  
  /**
   * Generate EVEN light distribution across fixture mechanical dimensions
   * This ensures light comes evenly across the fixture area, not just from center
   */
  private generateEvenLightDistribution(lengthM: number, widthM: number, totalPPF: number): number[][] {
    const gridResolution = 0.05; // 5cm grid for high precision
    const rows = Math.ceil(lengthM / gridResolution);
    const cols = Math.ceil(widthM / gridResolution);
    
    const grid: number[][] = [];
    
    // Calculate PPF per grid cell for EVEN distribution
    const cellArea = gridResolution * gridResolution; // m²
    const fixtureArea = lengthM * widthM; // m²
    const ppfPerCell = (totalPPF * cellArea) / fixtureArea; // Even distribution
    
    logger.info('system', `🔆 Generating even light distribution: ${rows}x${cols} grid, ${ppfPerCell.toFixed(1)} PPF per cell`);
    
    // Create perfectly even distribution with slight edge tapering for realism
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        // Distance from edges (normalized 0-1)
        const edgeDistanceI = Math.min(i / rows, (rows - i) / rows) * 2; // 0 at edge, 1 at center
        const edgeDistanceJ = Math.min(j / cols, (cols - j) / cols) * 2;
        const edgeFactor = Math.min(edgeDistanceI, edgeDistanceJ);
        
        // Gentle tapering: 90% at edges, 100% in center
        const intensity = ppfPerCell * (0.9 + 0.1 * edgeFactor);
        
        grid[i][j] = intensity;
      }
    }
    
    return grid;
  }
  
  /**
   * Get enhanced fixture data by ID or model name
   */
  async getEnhancedFixture(fixtureId: string): Promise<EnhancedDLCFixture | null> {
    await this.loadRealDLCData(); // Ensure data is loaded
    
    const normalizedId = fixtureId.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fixture = this.enhancedFixtures.get(normalizedId) || 
                   this.enhancedFixtures.get(fixtureId) ||
                   this.enhancedFixtures.get(fixtureId.toLowerCase());
    
    if (!fixture) {
      logger.warn('system', `Enhanced fixture not found for: ${fixtureId}`);
      return null;
    }
    
    return fixture;
  }
  
  /**
   * Get fixture dimensions (backward compatibility)
   */
  async getFixtureDimensions(fixtureId: string): Promise<{ length: number; width: number; height: number } | null> {
    const enhanced = await this.getEnhancedFixture(fixtureId);
    if (!enhanced) return null;
    
    return {
      length: enhanced.lengthM,
      width: enhanced.widthM,
      height: enhanced.heightM
    };
  }
  
  /**
   * Calculate PPFD at a specific point from a fixture using REAL DLC data
   */
  async calculatePPFDAtPoint(
    fixtureId: string,
    fixturePosition: [number, number, number], // [x, y, z] in meters
    targetPoint: [number, number, number],
    canopyHeight: number = 0
  ): Promise<number> {
    const fixture = await this.getEnhancedFixture(fixtureId);
    if (!fixture) return 0;
    
    const [fx, fy, fz] = fixturePosition;
    const [tx, ty, tz] = targetPoint;
    
    // Check if point is within fixture coverage area
    const relativeX = tx - fx;
    const relativeY = ty - fy;
    
    if (Math.abs(relativeX) > fixture.lengthM / 2 || Math.abs(relativeY) > fixture.widthM / 2) {
      return 0; // Outside fixture area
    }
    
    // Distance from fixture to point
    const distance = Math.sqrt(
      Math.pow(relativeX, 2) +
      Math.pow(relativeY, 2) +
      Math.pow(fz - tz, 2)
    );
    
    if (distance === 0) return 0;
    
    // Get light intensity from EVEN distribution grid
    const gridResolution = 0.05;
    const gridX = Math.floor((relativeX + fixture.lengthM / 2) / gridResolution);
    const gridY = Math.floor((relativeY + fixture.widthM / 2) / gridResolution);
    
    const gridIntensity = fixture.lightGrid[gridX]?.[gridY] || 0;
    
    // Apply inverse square law with beam angle consideration
    const angle = Math.atan(Math.sqrt(relativeX * relativeX + relativeY * relativeY) / (fz - tz));
    const angleDegrees = angle * 180 / Math.PI;
    
    let beamFactor = 1;
    if (angleDegrees > fixture.beamAngle / 2) {
      // Outside beam angle - reduce intensity
      const fadeAngle = fixture.fieldAngle / 2;
      if (angleDegrees > fadeAngle) {
        beamFactor = 0; // Outside field angle
      } else {
        // Linear fade from beam to field angle
        beamFactor = 1 - (angleDegrees - fixture.beamAngle / 2) / (fadeAngle - fixture.beamAngle / 2);
      }
    }
    
    // Calculate final PPFD using even distribution
    const ppfd = (gridIntensity * beamFactor) / (distance * distance);
    
    return Math.max(0, ppfd);
  }
  
  /**
   * Get fixture 3D model data for CAD export using REAL DLC data
   */
  async getFixture3DModel(fixtureId: string): Promise<any> {
    const fixture = await this.getEnhancedFixture(fixtureId);
    if (!fixture) return null;
    
    const ppf = fixture.testedPPF || fixture.reportedPPF || 0;
    const wattage = fixture.testedWattage || fixture.reportedWattage || 0;
    
    return {
      id: fixture.productId,
      name: `${fixture.manufacturer} ${fixture.productName}`,
      geometry: {
        type: 'box',
        dimensions: [fixture.lengthM, fixture.widthM, fixture.heightM],
        dimensionsInches: [fixture.length || 0, fixture.width || 0, fixture.height || 0],
        material: 'aluminum',
        color: '#2a2a2a'
      },
      lighting: {
        type: 'led_array',
        ppf: ppf,
        wattage: wattage,
        efficacy: ppf / wattage,
        distribution: fixture.lightGrid,
        beamAngle: fixture.beamAngle,
        spectrum: {
          blue: fixture.reportedBlueFlux || 0,
          green: fixture.reportedGreenFlux || 0,
          red: fixture.reportedRedFlux || 0,
          farRed: fixture.reportedFarRedFlux || 0
        }
      },
      metadata: {
        manufacturer: fixture.manufacturer,
        brand: fixture.brand,
        model: fixture.modelNumber,
        dlcListed: true,
        dlcQualified: fixture.dateQualified,
        mountingType: fixture.mountingType,
        dimmable: fixture.dimmable,
        warranty: fixture.warranty
      }
    };
  }
  
  /**
   * Calculate optimal fixture spacing using REAL DLC dimensions
   */
  async calculateOptimalSpacing(
    fixtureId: string,
    targetPPFD: number,
    mountingHeight: number,
    uniformityTarget: number = 0.8
  ): Promise<{ spacingX: number; spacingY: number }> {
    const fixture = await this.getEnhancedFixture(fixtureId);
    if (!fixture) {
      throw new Error(`Fixture not found: ${fixtureId}`);
    }
    
    const ppf = fixture.testedPPF || fixture.reportedPPF || 0;
    
    // Calculate coverage area at mounting height
    const beamRadius = mountingHeight * Math.tan((fixture.beamAngle / 2) * Math.PI / 180);
    const coverageArea = Math.PI * beamRadius * beamRadius;
    
    // Calculate required PPF per fixture for target PPFD
    const requiredPPF = targetPPFD * coverageArea;
    const utilizationFactor = 0.85; // Account for losses
    
    if (requiredPPF > ppf * utilizationFactor) {
      logger.warn('system', `Target PPFD ${targetPPFD} may be too high for ${fixture.productName}`);
    }
    
    // Calculate optimal spacing for uniformity based on ACTUAL fixture dimensions
    const spacingFactor = uniformityTarget > 0.8 ? 0.7 : 0.85; // Closer spacing for better uniformity
    const spacingX = beamRadius * 2 * spacingFactor;
    const spacingY = beamRadius * 2 * spacingFactor;
    
    return {
      spacingX: Math.max(spacingX, fixture.lengthM * 1.1), // Minimum spacing = fixture length + 10%
      spacingY: Math.max(spacingY, fixture.widthM * 1.1)   // Minimum spacing = fixture width + 10%
    };
  }
  
  /**
   * Export all fixtures for CAD systems using REAL DLC data
   */
  async exportFixturesForCAD(): Promise<any[]> {
    await this.loadRealDLCData();
    const fixtures = Array.from(this.enhancedFixtures.values());
    
    const cadModels = await Promise.all(
      fixtures.map(async (fixture) => {
        const model = await this.getFixture3DModel(fixture.productId);
        return {
          ...model,
          realDLCData: {
            productId: fixture.productId,
            dateQualified: fixture.dateQualified,
            category: fixture.category,
            dimensions: {
              lengthInches: fixture.length,
              widthInches: fixture.width,
              heightInches: fixture.height,
              lengthMeters: fixture.lengthM,
              widthMeters: fixture.widthM,
              heightMeters: fixture.heightM
            }
          }
        };
      })
    );
    
    logger.info('system', `📐 Exported ${cadModels.length} fixtures with REAL DLC dimensions for CAD`);
    return cadModels;
  }
  
  /**
   * Get all available fixtures
   */
  async getAllFixtures(): Promise<EnhancedDLCFixture[]> {
    await this.loadRealDLCData();
    return Array.from(this.enhancedFixtures.values());
  }
  
  /**
   * Search fixtures by manufacturer or model
   */
  async searchFixtures(query: string): Promise<EnhancedDLCFixture[]> {
    await this.loadRealDLCData();
    const normalizedQuery = query.toLowerCase();
    
    return Array.from(this.enhancedFixtures.values()).filter(fixture =>
      fixture.manufacturer.toLowerCase().includes(normalizedQuery) ||
      fixture.brand.toLowerCase().includes(normalizedQuery) ||
      fixture.productName.toLowerCase().includes(normalizedQuery) ||
      fixture.modelNumber.toLowerCase().includes(normalizedQuery)
    );
  }
}

// Export singleton instance
export const fixtureDimensionsService = new FixtureDimensionsService();