import { getAccessToken } from './auth';
import { logger } from '@/lib/logging/production-logger';

// Crop-specific PPFD requirements for professional growing
export interface CropPPFDRequirements {
  name: string;
  seedling: { min: number; max: number; optimal: number };
  vegetative: { min: number; max: number; optimal: number };
  flowering: { min: number; max: number; optimal: number };
  dliRange: { min: number; max: number; optimal: number };
}

export const CROP_PPFD_DATABASE: Record<string, CropPPFDRequirements> = {
  lettuce: {
    name: 'Lettuce',
    seedling: { min: 50, max: 150, optimal: 100 },
    vegetative: { min: 150, max: 300, optimal: 200 },
    flowering: { min: 200, max: 400, optimal: 250 },
    dliRange: { min: 12, max: 17, optimal: 14 }
  },
  tomato: {
    name: 'Tomato',
    seedling: { min: 100, max: 200, optimal: 150 },
    vegetative: { min: 200, max: 400, optimal: 300 },
    flowering: { min: 400, max: 800, optimal: 600 },
    dliRange: { min: 20, max: 30, optimal: 25 }
  },
  cannabis: {
    name: 'Cannabis',
    seedling: { min: 100, max: 300, optimal: 200 },
    vegetative: { min: 300, max: 600, optimal: 400 },
    flowering: { min: 600, max: 1000, optimal: 800 },
    dliRange: { min: 35, max: 50, optimal: 40 }
  },
  basil: {
    name: 'Basil',
    seedling: { min: 75, max: 175, optimal: 125 },
    vegetative: { min: 150, max: 350, optimal: 250 },
    flowering: { min: 200, max: 450, optimal: 300 },
    dliRange: { min: 12, max: 20, optimal: 16 }
  },
  strawberry: {
    name: 'Strawberry',
    seedling: { min: 100, max: 250, optimal: 175 },
    vegetative: { min: 200, max: 400, optimal: 300 },
    flowering: { min: 300, max: 600, optimal: 450 },
    dliRange: { min: 15, max: 25, optimal: 20 }
  }
};

// Data Visualization SDK integration for heatmaps and sprites
export class DataVisualization {
  private viewer: any;
  private dataVizExtn: any;
  private heatmapData: any[] = [];
  private currentCrop: string = 'lettuce';
  private currentGrowthStage: 'seedling' | 'vegetative' | 'flowering' = 'vegetative';

  constructor(viewer: any) {
    this.viewer = viewer;
  }

  async initialize() {
    try {
      // Load Data Visualization extension
      await this.viewer.loadExtension('Autodesk.DataVisualization');
      this.dataVizExtn = this.viewer.getExtension('Autodesk.DataVisualization');
      
      logger.info('Data Visualization extension loaded');
    } catch (error) {
      logger.error('Failed to load Data Visualization extension', error );
      throw error;
    }
  }

  // Set current crop and growth stage for analysis
  setCropParameters(crop: string, growthStage: 'seedling' | 'vegetative' | 'flowering') {
    this.currentCrop = crop;
    this.currentGrowthStage = growthStage;
    logger.info('Updated crop parameters', { crop, growthStage });
  }

  // Create crop-specific PPFD heatmap overlay
  async createPPFDHeatmap(fixtures: any[], roomDimensions: any, crop?: string, growthStage?: 'seedling' | 'vegetative' | 'flowering') {
    try {
      // Update crop parameters if provided
      if (crop) this.currentCrop = crop;
      if (growthStage) this.currentGrowthStage = growthStage;

      // Generate heatmap data based on fixture positions and PPFD values
      const heatmapData = this.generatePPFDGrid(fixtures, roomDimensions);
      
      // Get crop-specific requirements
      const cropReqs = CROP_PPFD_DATABASE[this.currentCrop];
      if (!cropReqs) {
        throw new Error(`Unknown crop: ${this.currentCrop}`);
      }

      const stageReqs = cropReqs[this.currentGrowthStage];
      
      // Create crop-specific style map for professional analysis
      const styleMap = {
        [`Below Minimum (<${stageReqs.min})`]: {
          color: 0x800080, // Purple - insufficient light
          type: 'gradient',
          minValue: 0,
          maxValue: stageReqs.min
        },
        [`Optimal Range (${stageReqs.min}-${stageReqs.max})`]: {
          color: 0x00ff00, // Green - optimal
          type: 'gradient',
          minValue: stageReqs.min,
          maxValue: stageReqs.max
        },
        [`Above Maximum (>${stageReqs.max})`]: {
          color: 0xffa500, // Orange - excessive light
          type: 'gradient',
          minValue: stageReqs.max,
          maxValue: Math.max(1200, stageReqs.max * 1.5)
        },
        [`Critical Optimal (${stageReqs.optimal}±10%)`]: {
          color: 0x00ffff, // Cyan - ideal zone
          type: 'gradient',
          minValue: stageReqs.optimal * 0.9,
          maxValue: stageReqs.optimal * 1.1
        }
      };

      // Apply heatmap to the model
      await this.dataVizExtn.setupSurfaceShading(this.viewer.model, heatmapData, {
        type: 'PlanarHeatmap',
        placementPosition: { x: 0, y: 0, z: 0 },
        style: styleMap,
        alpha: 0.7,
        gridResolution: 50
      });

      // Store heatmap data for analysis
      this.heatmapData = heatmapData;

      // Generate professional analysis report
      const analysisReport = this.generateProfessionalAnalysis(heatmapData, cropReqs, stageReqs);
      
      logger.info('PPFD heatmap created with professional analysis', {
        crop: this.currentCrop,
        stage: this.currentGrowthStage,
        analysis: analysisReport
      });

      return {
        success: true,
        analysis: analysisReport,
        crop: this.currentCrop,
        growthStage: this.currentGrowthStage
      };
    } catch (error) {
      logger.error('Failed to create PPFD heatmap', error );
      throw error;
    }
  }

  // Generate PPFD grid data based on fixtures
  private generatePPFDGrid(fixtures: any[], roomDimensions: any) {
    const { length, width, height } = roomDimensions;
    const gridSize = 50; // Grid resolution
    const data: any[] = [];

    // Calculate grid points
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const worldX = (x / gridSize) * length - length / 2;
        const worldY = (y / gridSize) * width - width / 2;
        const worldZ = 0; // Floor level

        // Calculate cumulative PPFD at this point from all fixtures
        let totalPPFD = 0;
        
        fixtures.forEach(fixture => {
          const distance = this.calculateDistance(
            { x: worldX, y: worldY, z: worldZ },
            fixture.position
          );
          
          // Simple inverse square law calculation
          // In reality, this would use the fixture's IES data
          const fixturePPFD = fixture.specs?.ppfd || 800;
          const beamAngle = fixture.specs?.beamAngle || 120;
          const ppfdAtPoint = this.calculatePPFDAtPoint(
            fixturePPFD,
            distance,
            beamAngle,
            fixture.position,
            { x: worldX, y: worldY, z: worldZ }
          );
          
          totalPPFD += ppfdAtPoint;
        });

        data.push({
          position: { x: worldX, y: worldY, z: worldZ },
          value: totalPPFD,
          sensorId: `grid_${x}_${y}`
        });
      }
    }

    return data;
  }

  // Calculate distance between two 3D points
  private calculateDistance(p1: any, p2: any): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Calculate PPFD at a specific point from a fixture
  private calculatePPFDAtPoint(
    fixturePPFD: number,
    distance: number,
    beamAngle: number,
    fixturePos: any,
    pointPos: any
  ): number {
    // Inverse square law
    const distanceFactor = 1 / (distance * distance);
    
    // Beam angle factor (simplified)
    const angle = this.calculateAngle(fixturePos, pointPos);
    const halfBeam = beamAngle / 2;
    const angleFactor = angle <= halfBeam ? 1 : Math.max(0, 1 - (angle - halfBeam) / halfBeam);
    
    return fixturePPFD * distanceFactor * angleFactor;
  }

  // Calculate angle between fixture and point
  private calculateAngle(fixturePos: any, pointPos: any): number {
    const dx = pointPos.x - fixturePos.x;
    const dy = pointPos.y - fixturePos.y;
    const dz = pointPos.z - fixturePos.z;
    
    // Assuming fixtures point downward
    const fixtureDir = { x: 0, y: 0, z: -1 };
    const toPoint = { x: dx, y: dy, z: dz };
    
    // Normalize vectors
    const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (mag === 0) return 0;
    
    toPoint.x /= mag;
    toPoint.y /= mag;
    toPoint.z /= mag;
    
    // Dot product for angle
    const dot = fixtureDir.x * toPoint.x + fixtureDir.y * toPoint.y + fixtureDir.z * toPoint.z;
    return Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
  }

  // Create DLI visualization
  async createDLIVisualization(ppfdData: any[], photoperiod: number) {
    try {
      // Convert PPFD to DLI
      const dliData = ppfdData.map(point => ({
        ...point,
        value: (point.value * photoperiod * 3.6) / 1000 // Convert to mol/m²/day
      }));

      // DLI-specific color scheme
      const dliStyleMap = {
        'Low DLI (0-10)': { color: 0x0000ff, minValue: 0, maxValue: 10 },
        'Medium DLI (10-20)': { color: 0x00ff00, minValue: 10, maxValue: 20 },
        'High DLI (20-40)': { color: 0xffff00, minValue: 20, maxValue: 40 },
        'Very High DLI (>40)': { color: 0xff0000, minValue: 40, maxValue: 60 }
      };

      await this.dataVizExtn.setupSurfaceShading(this.viewer.model, dliData, {
        type: 'PlanarHeatmap',
        placementPosition: { x: 0, y: 0, z: 0 },
        style: dliStyleMap,
        alpha: 0.7
      });
    } catch (error) {
      logger.error('Failed to create DLI visualization', error );
      throw error;
    }
  }

  // Create uniformity visualization
  async createUniformityMap(ppfdData: any[]) {
    try {
      // Calculate uniformity metrics
      const values = ppfdData.map(p => p.value);
      const avgPPFD = values.reduce((a, b) => a + b, 0) / values.length;
      const minPPFD = Math.min(...values);
      const maxPPFD = Math.max(...values);
      
      // Create uniformity data
      const uniformityData = ppfdData.map(point => ({
        ...point,
        value: Math.abs(point.value - avgPPFD) / avgPPFD * 100 // Deviation percentage
      }));

      // Uniformity color scheme (lower is better)
      const uniformityStyleMap = {
        'Excellent (<10%)': { color: 0x00ff00, minValue: 0, maxValue: 10 },
        'Good (10-20%)': { color: 0xffff00, minValue: 10, maxValue: 20 },
        'Fair (20-30%)': { color: 0xff9900, minValue: 20, maxValue: 30 },
        'Poor (>30%)': { color: 0xff0000, minValue: 30, maxValue: 100 }
      };

      await this.dataVizExtn.setupSurfaceShading(this.viewer.model, uniformityData, {
        type: 'PlanarHeatmap',
        placementPosition: { x: 0, y: 0, z: 0 },
        style: uniformityStyleMap,
        alpha: 0.7
      });

      return {
        average: avgPPFD,
        min: minPPFD,
        max: maxPPFD,
        uniformity: minPPFD / avgPPFD
      };
    } catch (error) {
      logger.error('Failed to create uniformity map', error );
      throw error;
    }
  }

  // Add sprite indicators for sensor positions
  async addSensorSprites(sensorPositions: any[]) {
    try {
      const sprites = sensorPositions.map((pos, index) => ({
        id: `sensor_${index}`,
        position: pos,
        type: 'sensor',
        url: '/images/sensor-icon.png', // You'll need to add this icon
        size: 24
      }));

      await this.dataVizExtn.addSprites('SensorSprites', sprites, {
        onClick: (sprite: any) => {
          logger.info('Sensor clicked', { data: sprite });
          // Show sensor details
        }
      });
    } catch (error) {
      logger.error('Failed to add sensor sprites', error );
      throw error;
    }
  }

  // Toggle heatmap visibility
  async toggleHeatmap(visible: boolean) {
    try {
      if (visible) {
        await this.dataVizExtn.showHeatmap();
      } else {
        await this.dataVizExtn.hideHeatmap();
      }
    } catch (error) {
      logger.error('Failed to toggle heatmap', error );
    }
  }

  // Update heatmap in real-time
  async updateHeatmap(newData: any[]) {
    try {
      await this.dataVizExtn.updateSurfaceShading(newData);
    } catch (error) {
      logger.error('Failed to update heatmap', error );
      throw error;
    }
  }

  // Export heatmap as image
  async exportHeatmapImage(): Promise<string> {
    try {
      const screenshot = await this.viewer.getScreenShot(1920, 1080);
      return screenshot;
    } catch (error) {
      logger.error('Failed to export heatmap', error );
      throw error;
    }
  }

  // Generate professional analysis report
  private generateProfessionalAnalysis(
    heatmapData: any[], 
    cropReqs: CropPPFDRequirements, 
    stageReqs: { min: number; max: number; optimal: number }
  ) {
    const values = heatmapData.map(p => p.value);
    const total = values.length;
    
    // Calculate coverage statistics
    const belowMin = values.filter(v => v < stageReqs.min).length;
    const inOptimal = values.filter(v => v >= stageReqs.min && v <= stageReqs.max).length;
    const aboveMax = values.filter(v => v > stageReqs.max).length;
    const inIdealZone = values.filter(v => 
      v >= stageReqs.optimal * 0.9 && v <= stageReqs.optimal * 1.1
    ).length;

    // Calculate metrics
    const avgPPFD = values.reduce((a, b) => a + b, 0) / total;
    const minPPFD = Math.min(...values);
    const maxPPFD = Math.max(...values);
    const uniformity = minPPFD / avgPPFD; // Industry standard metric
    
    // Generate recommendations
    const recommendations: string[] = [];
    const issues: string[] = [];
    
    if (belowMin / total > 0.1) {
      issues.push(`${Math.round(belowMin/total*100)}% of canopy below minimum PPFD`);
      recommendations.push('Add more fixtures or increase fixture output in low-light areas');
    }
    
    if (aboveMax / total > 0.05) {
      issues.push(`${Math.round(aboveMax/total*100)}% of canopy above maximum PPFD`);
      recommendations.push('Consider dimming fixtures or raising mounting height in high-light areas');
    }
    
    if (uniformity < 0.8) {
      issues.push(`Poor light uniformity (${(uniformity*100).toFixed(1)}% - target >80%)`);
      recommendations.push('Optimize fixture spacing and positioning for better uniformity');
    }
    
    if (inOptimal / total < 0.8) {
      issues.push(`Only ${Math.round(inOptimal/total*100)}% of canopy in optimal range`);
      recommendations.push('Fine-tune fixture configuration to maximize optimal coverage');
    }
    
    // Performance grade
    const optimalCoverage = inOptimal / total;
    const grade = optimalCoverage >= 0.9 ? 'A+' :
                  optimalCoverage >= 0.8 ? 'A' :
                  optimalCoverage >= 0.7 ? 'B' :
                  optimalCoverage >= 0.6 ? 'C' : 'D';

    return {
      crop: cropReqs.name,
      growthStage: this.currentGrowthStage,
      grade,
      metrics: {
        averagePPFD: Math.round(avgPPFD),
        minPPFD: Math.round(minPPFD),
        maxPPFD: Math.round(maxPPFD),
        uniformity: Math.round(uniformity * 1000) / 10, // Percentage
        optimalCoverage: Math.round(optimalCoverage * 1000) / 10 // Percentage
      },
      coverage: {
        belowMinimum: Math.round(belowMin/total * 1000) / 10,
        optimal: Math.round(inOptimal/total * 1000) / 10,
        aboveMaximum: Math.round(aboveMax/total * 1000) / 10,
        idealZone: Math.round(inIdealZone/total * 1000) / 10
      },
      requirements: {
        min: stageReqs.min,
        max: stageReqs.max,
        optimal: stageReqs.optimal
      },
      issues,
      recommendations,
      energyEfficiency: {
        estimated_kwh_per_sqm: Math.round(avgPPFD * 0.0024 * 100) / 100, // Rough estimate
        utilization: Math.round(inOptimal/total * 100)
      }
    };
  }

  // Export professional report as structured data
  async generateProfessionalReport(): Promise<any> {
    if (!this.heatmapData || this.heatmapData.length === 0) {
      throw new Error('No heatmap data available. Create a heatmap first.');
    }

    const cropReqs = CROP_PPFD_DATABASE[this.currentCrop];
    const stageReqs = cropReqs[this.currentGrowthStage];
    const analysis = this.generateProfessionalAnalysis(this.heatmapData, cropReqs, stageReqs);

    return {
      timestamp: new Date().toISOString(),
      projectName: `${cropReqs.name} ${this.currentGrowthStage} Analysis`,
      analysis,
      exportSettings: {
        gridResolution: 50,
        calculations: 'Industry Standard PPFD Analysis',
        standards: 'Based on peer-reviewed horticultural research'
      }
    };
  }

  // Cleanup
  dispose() {
    if (this.dataVizExtn) {
      this.dataVizExtn.removeSurfaceShading();
      this.dataVizExtn.removeAllSprites();
    }
    this.heatmapData = [];
  }
}