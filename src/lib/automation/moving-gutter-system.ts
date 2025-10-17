/**
 * Moving Gutter System Design
 * Automated NFT gutter spacing system similar to HortiPlan/CropKing
 * with intelligent plant spacing and growth optimization
 */

import { vec3 } from 'gl-matrix';

export interface GutterSystemConfig {
  // System dimensions
  systemLength: number; // meters
  systemWidth: number; // meters
  gutterCount: number;
  gutterWidth: number; // 0.1m typical for NFT
  gutterDepth: number; // 0.05m typical
  
  // Movement system
  maxSpacing: number; // maximum spacing between gutters (m)
  minSpacing: number; // minimum spacing between gutters (m)
  movementSpeed: number; // m/min
  automationEnabled: boolean;
  
  // Crop parameters
  cropType: 'lettuce' | 'herbs' | 'strawberries' | 'tomatoes' | 'leafy-greens' | 'microgreens';
  plantingDensity: number; // plants per meter
  growthStages: GrowthStage[];
  
  // Environmental
  lightingHeight: number; // height of LED fixtures
  ventilationZones: VentilationZone[];
}

export interface GrowthStage {
  stage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  daysFromPlanting: number;
  optimalSpacing: number; // meters between gutter centers
  leafSpan: number; // expected leaf span in meters
  height: number; // plant height in meters
  lightRequirement: number; // PPFD
  nutrientConcentration: number; // EC
}

export interface VentilationZone {
  startX: number;
  endX: number;
  airflowRate: number; // CFM
  temperature: number; // °C
  humidity: number; // %RH
}

export interface GutterPosition {
  gutterId: string;
  currentX: number; // current position along width
  targetX: number; // target position
  spacing: number; // spacing from previous gutter
  isMoving: boolean;
  plantAge: number; // days since planting
  currentStage: string;
  occupancy: PlantOccupancy[];
}

export interface PlantOccupancy {
  position: number; // position along gutter length
  plantId: string;
  plantedDate: Date;
  expectedHarvest: Date;
  currentSize: {
    leafSpan: number;
    height: number;
  };
}

export interface MovementCommand {
  gutterId: string;
  targetPosition: number;
  speed: number;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reason: string;
  estimatedDuration: number; // minutes
}

export class MovingGutterSystem {
  private config: GutterSystemConfig;
  private gutters: Map<string, GutterPosition> = new Map();
  private movementQueue: MovementCommand[] = [];
  private isSystemRunning = false;
  
  constructor(config: GutterSystemConfig) {
    this.config = config;
    this.initializeGutters();
  }

  /**
   * Initialize gutter positions with even spacing
   */
  private initializeGutters() {
    const initialSpacing = this.config.systemWidth / this.config.gutterCount;
    
    for (let i = 0; i < this.config.gutterCount; i++) {
      const gutterId = `gutter-${i + 1}`;
      const position: GutterPosition = {
        gutterId,
        currentX: i * initialSpacing + (initialSpacing / 2),
        targetX: i * initialSpacing + (initialSpacing / 2),
        spacing: initialSpacing,
        isMoving: false,
        plantAge: 0,
        currentStage: 'seedling',
        occupancy: []
      };
      
      this.gutters.set(gutterId, position);
    }
  }

  /**
   * Calculate optimal spacing based on plant growth stage
   */
  calculateOptimalSpacing(plantAge: number): number {
    const growthStages = this.config.growthStages.sort((a, b) => a.daysFromPlanting - b.daysFromPlanting);
    
    // Find current growth stage
    let currentStage = growthStages[0];
    for (const stage of growthStages) {
      if (plantAge >= stage.daysFromPlanting) {
        currentStage = stage;
      } else {
        break;
      }
    }
    
    // Add buffer for leaf expansion
    const bufferFactor = 1.2; // 20% buffer
    const optimalSpacing = Math.max(
      currentStage.optimalSpacing * bufferFactor,
      this.config.minSpacing
    );
    
    return Math.min(optimalSpacing, this.config.maxSpacing);
  }

  /**
   * Analyze current system and determine needed movements
   */
  analyzeSpacingNeeds(): MovementCommand[] {
    const commands: MovementCommand[] = [];
    const gutterArray = Array.from(this.gutters.values()).sort((a, b) => a.currentX - b.currentX);
    
    for (let i = 0; i < gutterArray.length; i++) {
      const gutter = gutterArray[i];
      const optimalSpacing = this.calculateOptimalSpacing(gutter.plantAge);
      
      // Calculate ideal position based on neighbors
      let idealPosition: number;
      
      if (i === 0) {
        // First gutter - position based on spacing to next
        idealPosition = optimalSpacing / 2;
      } else if (i === gutterArray.length - 1) {
        // Last gutter - position based on spacing from previous
        idealPosition = this.config.systemWidth - (optimalSpacing / 2);
      } else {
        // Middle gutters - balance between neighbors
        const prevGutter = gutterArray[i - 1];
        const nextGutter = gutterArray[i + 1];
        const prevOptimalSpacing = this.calculateOptimalSpacing(prevGutter.plantAge);
        const nextOptimalSpacing = this.calculateOptimalSpacing(nextGutter.plantAge);
        
        // Calculate position that optimizes spacing to both neighbors
        idealPosition = prevGutter.currentX + (prevOptimalSpacing + optimalSpacing) / 2;
        
        // Ensure we don't crowd the next gutter
        const maxPosition = nextGutter.currentX - (optimalSpacing + nextOptimalSpacing) / 2;
        idealPosition = Math.min(idealPosition, maxPosition);
      }
      
      // Check if movement is needed
      const currentPosition = gutter.currentX;
      const positionDifference = Math.abs(idealPosition - currentPosition);
      const tolerance = 0.05; // 5cm tolerance
      
      if (positionDifference > tolerance && !gutter.isMoving) {
        const movementDistance = Math.abs(idealPosition - currentPosition);
        const estimatedTime = movementDistance / (this.config.movementSpeed / 60); // convert to seconds
        
        // Determine priority based on crowding severity
        let priority: MovementCommand['priority'] = 'low';
        if (positionDifference > optimalSpacing * 0.3) priority = 'high';
        else if (positionDifference > optimalSpacing * 0.15) priority = 'medium';
        
        commands.push({
          gutterId: gutter.gutterId,
          targetPosition: idealPosition,
          speed: this.config.movementSpeed,
          priority,
          reason: `Optimize spacing for ${gutter.currentStage} stage (${gutter.plantAge} days)`,
          estimatedDuration: estimatedTime
        });
      }
    }
    
    return commands.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  /**
   * Execute movement command
   */
  async executeMovement(command: MovementCommand): Promise<boolean> {
    const gutter = this.gutters.get(command.gutterId);
    if (!gutter || gutter.isMoving) {
      return false;
    }
    
    // Check for collisions
    if (this.checkCollisionPath(command.gutterId, command.targetPosition)) {
      console.warn(`Collision detected for ${command.gutterId}, movement delayed`);
      return false;
    }
    
    // Start movement
    gutter.isMoving = true;
    gutter.targetX = command.targetPosition;
    
    try {
      // Simulate movement (in real system, this would control actuators)
      await this.simulateMovement(gutter, command);
      
      // Update final position
      gutter.currentX = command.targetPosition;
      gutter.isMoving = false;
      
      // Update spacing to neighbors
      this.updateSpacingMetrics();
      
      return true;
    } catch (error) {
      console.error(`Movement failed for ${command.gutterId}:`, error);
      gutter.isMoving = false;
      return false;
    }
  }

  /**
   * Check for potential collisions during movement
   */
  private checkCollisionPath(movingGutterId: string, targetPosition: number): boolean {
    const movingGutter = this.gutters.get(movingGutterId);
    if (!movingGutter) return true;
    
    const safetyBuffer = 0.1; // 10cm safety buffer
    const gutterWidth = this.config.gutterWidth;
    
    for (const [gutterId, gutter] of this.gutters) {
      if (gutterId === movingGutterId) continue;
      
      // Check if target position would cause collision
      const distance = Math.abs(targetPosition - gutter.currentX);
      const minDistance = gutterWidth + safetyBuffer;
      
      if (distance < minDistance) {
        return true; // Collision detected
      }
    }
    
    return false;
  }

  /**
   * Simulate movement with realistic timing
   */
  private async simulateMovement(gutter: GutterPosition, command: MovementCommand): Promise<void> {
    const distance = Math.abs(command.targetPosition - gutter.currentX);
    const duration = (distance / (command.speed / 60)) * 1000; // Convert to milliseconds
    
    // For real implementation, this would interface with motor controllers
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * Update spacing metrics after movement
   */
  private updateSpacingMetrics() {
    const gutterArray = Array.from(this.gutters.values()).sort((a, b) => a.currentX - b.currentX);
    
    for (let i = 0; i < gutterArray.length; i++) {
      const gutter = gutterArray[i];
      
      if (i < gutterArray.length - 1) {
        const nextGutter = gutterArray[i + 1];
        gutter.spacing = nextGutter.currentX - gutter.currentX;
      } else {
        gutter.spacing = this.config.systemWidth - gutter.currentX;
      }
      
      this.gutters.set(gutter.gutterId, gutter);
    }
  }

  /**
   * Auto-spacing routine - main automation logic
   */
  async runAutoSpacing(): Promise<void> {
    if (!this.config.automationEnabled || this.isSystemRunning) {
      return;
    }
    
    this.isSystemRunning = true;
    
    try {
      // Analyze current spacing needs
      const movements = this.analyzeSpacingNeeds();
      
      if (movements.length === 0) {
        console.log('No spacing adjustments needed');
        return;
      }
      
      console.log(`Executing ${movements.length} gutter movements`);
      
      // Execute movements in priority order, avoiding conflicts
      for (const movement of movements) {
        const success = await this.executeMovement(movement);
        if (success) {
          console.log(`Completed movement: ${movement.gutterId} -> ${movement.targetPosition}m`);
        }
        
        // Small delay between movements for safety
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } finally {
      this.isSystemRunning = false;
    }
  }

  /**
   * Plant new crop in specific gutter
   */
  plantCrop(gutterId: string, plantPositions: number[], plantedDate: Date = new Date()): boolean {
    const gutter = this.gutters.get(gutterId);
    if (!gutter) return false;
    
    // Calculate expected harvest date based on crop type
    const cropData = this.getCropData(this.config.cropType);
    const expectedHarvest = new Date(plantedDate);
    expectedHarvest.setDate(expectedHarvest.getDate() + cropData.harvestDays);
    
    // Add plants to gutter occupancy
    const newPlants: PlantOccupancy[] = plantPositions.map((position, index) => ({
      position,
      plantId: `${gutterId}-plant-${Date.now()}-${index}`,
      plantedDate,
      expectedHarvest,
      currentSize: {
        leafSpan: cropData.initialLeafSpan,
        height: cropData.initialHeight
      }
    }));
    
    gutter.occupancy = [...gutter.occupancy, ...newPlants];
    gutter.plantAge = 0; // Reset to new planting
    gutter.currentStage = 'seedling';
    
    this.gutters.set(gutterId, gutter);
    
    // Trigger immediate spacing analysis
    if (this.config.automationEnabled) {
      setTimeout(() => this.runAutoSpacing(), 5000); // 5 second delay
    }
    
    return true;
  }

  /**
   * Update plant ages and growth stages
   */
  updatePlantGrowth(): void {
    const currentDate = new Date();
    
    for (const [gutterId, gutter] of this.gutters) {
      if (gutter.occupancy.length === 0) continue;
      
      // Find oldest plants to determine gutter age
      const oldestPlant = gutter.occupancy.reduce((oldest, plant) => 
        plant.plantedDate < oldest.plantedDate ? plant : oldest
      );
      
      const ageInDays = Math.floor(
        (currentDate.getTime() - oldestPlant.plantedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      gutter.plantAge = ageInDays;
      
      // Update growth stage
      const growthStages = this.config.growthStages.sort((a, b) => a.daysFromPlanting - b.daysFromPlanting);
      let currentStage = 'seedling';
      
      for (const stage of growthStages) {
        if (ageInDays >= stage.daysFromPlanting) {
          currentStage = stage.stage;
        }
      }
      
      gutter.currentStage = currentStage;
      
      // Update plant sizes based on growth
      gutter.occupancy = gutter.occupancy.map(plant => {
        const plantAge = Math.floor(
          (currentDate.getTime() - plant.plantedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const stageData = this.config.growthStages.find(s => s.stage === currentStage);
        if (stageData) {
          plant.currentSize = {
            leafSpan: stageData.leafSpan,
            height: stageData.height
          };
        }
        
        return plant;
      });
      
      this.gutters.set(gutterId, gutter);
    }
  }

  /**
   * Get crop-specific data
   */
  private getCropData(cropType: string) {
    const cropDatabase = {
      'lettuce': {
        harvestDays: 35,
        initialLeafSpan: 0.05,
        initialHeight: 0.02
      },
      'herbs': {
        harvestDays: 28,
        initialLeafSpan: 0.03,
        initialHeight: 0.02
      },
      'strawberries': {
        harvestDays: 60,
        initialLeafSpan: 0.08,
        initialHeight: 0.05
      },
      'microgreens': {
        harvestDays: 14,
        initialLeafSpan: 0.02,
        initialHeight: 0.01
      }
    };
    
    return cropDatabase[cropType as keyof typeof cropDatabase] || cropDatabase.lettuce;
  }

  /**
   * Get system status and metrics
   */
  getSystemStatus() {
    const gutterArray = Array.from(this.gutters.values());
    const movingCount = gutterArray.filter(g => g.isMoving).length;
    const totalPlants = gutterArray.reduce((sum, g) => sum + g.occupancy.length, 0);
    
    // Calculate spacing efficiency
    const spacingEfficiency = this.calculateSpacingEfficiency();
    
    // Calculate light distribution efficiency
    const lightEfficiency = this.calculateLightEfficiency();
    
    return {
      systemRunning: this.isSystemRunning,
      gutterCount: this.config.gutterCount,
      movingGutters: movingCount,
      totalPlants,
      averageSpacing: gutterArray.reduce((sum, g) => sum + g.spacing, 0) / gutterArray.length,
      spacingEfficiency,
      lightEfficiency,
      pendingMovements: this.movementQueue.length,
      gutterPositions: gutterArray.map(g => ({
        id: g.gutterId,
        position: g.currentX,
        spacing: g.spacing,
        plantAge: g.plantAge,
        stage: g.currentStage,
        plantCount: g.occupancy.length,
        isMoving: g.isMoving
      }))
    };
  }

  /**
   * Calculate spacing efficiency based on optimal vs actual spacing
   */
  private calculateSpacingEfficiency(): number {
    const gutterArray = Array.from(this.gutters.values());
    let totalEfficiency = 0;
    
    for (const gutter of gutterArray) {
      const optimalSpacing = this.calculateOptimalSpacing(gutter.plantAge);
      const actualSpacing = gutter.spacing;
      const efficiency = Math.min(actualSpacing / optimalSpacing, optimalSpacing / actualSpacing);
      totalEfficiency += efficiency;
    }
    
    return totalEfficiency / gutterArray.length;
  }

  /**
   * Calculate light distribution efficiency
   */
  private calculateLightEfficiency(): number {
    // Simplified calculation - in real system would consider fixture positions
    const gutterArray = Array.from(this.gutters.values());
    const spacingVariance = this.calculateSpacingVariance(gutterArray);
    
    // Lower variance = better light distribution efficiency
    return Math.max(0, 1 - (spacingVariance / this.config.maxSpacing));
  }

  private calculateSpacingVariance(gutters: GutterPosition[]): number {
    const spacings = gutters.map(g => g.spacing);
    const mean = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
    const variance = spacings.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / spacings.length;
    return Math.sqrt(variance);
  }

  private getPriorityValue(priority: MovementCommand['priority']): number {
    const values = { low: 1, medium: 2, high: 3, emergency: 4 };
    return values[priority];
  }

  /**
   * Emergency stop all movements
   */
  emergencyStop(): void {
    for (const [gutterId, gutter] of this.gutters) {
      gutter.isMoving = false;
      gutter.targetX = gutter.currentX;
    }
    this.movementQueue = [];
    this.isSystemRunning = false;
    console.log('Emergency stop activated - all gutter movement halted');
  }

  /**
   * Get recommended planting schedule
   */
  getPlantingSchedule(weeksAhead: number = 8): Array<{
    week: number;
    date: Date;
    gutterId: string;
    action: 'plant' | 'harvest';
    cropType: string;
    expectedYield: number;
  }> {
    const schedule = [];
    const currentDate = new Date();
    const cropData = this.getCropData(this.config.cropType);
    
    // Generate planting schedule based on harvest timing
    for (let week = 0; week < weeksAhead; week++) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(weekDate.getDate() + (week * 7));
      
      // Stagger plantings across gutters
      const gutterIndex = week % this.config.gutterCount;
      const gutterId = `gutter-${gutterIndex + 1}`;
      
      schedule.push({
        week,
        date: weekDate,
        gutterId,
        action: 'plant',
        cropType: this.config.cropType,
        expectedYield: this.calculateExpectedYield(gutterId)
      });
      
      // Add harvest schedule
      if (week >= Math.ceil(cropData.harvestDays / 7)) {
        const harvestDate = new Date(weekDate);
        harvestDate.setDate(harvestDate.getDate() + cropData.harvestDays);
        
        schedule.push({
          week: week + Math.ceil(cropData.harvestDays / 7),
          date: harvestDate,
          gutterId,
          action: 'harvest',
          cropType: this.config.cropType,
          expectedYield: this.calculateExpectedYield(gutterId)
        });
      }
    }
    
    return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculateExpectedYield(gutterId: string): number {
    // Simplified yield calculation
    const plantsPerMeter = this.config.plantingDensity;
    const gutterLength = this.config.systemLength;
    const totalPlants = plantsPerMeter * gutterLength;
    
    const yieldPerPlant = {
      'lettuce': 0.15, // kg
      'herbs': 0.08,
      'strawberries': 0.25,
      'microgreens': 0.05
    };
    
    const cropYield = yieldPerPlant[this.config.cropType as keyof typeof yieldPerPlant] || 0.1;
    return totalPlants * cropYield;
  }
}

// Export default configuration for lettuce production
export const defaultLettuceConfig: GutterSystemConfig = {
  systemLength: 12, // 12 meters
  systemWidth: 8,   // 8 meters
  gutterCount: 12,
  gutterWidth: 0.1,
  gutterDepth: 0.05,
  maxSpacing: 1.0,
  minSpacing: 0.3,
  movementSpeed: 0.5, // 0.5 m/min
  automationEnabled: true,
  cropType: 'lettuce',
  plantingDensity: 10, // plants per meter
  lightingHeight: 2.0,
  growthStages: [
    {
      stage: 'seedling',
      daysFromPlanting: 0,
      optimalSpacing: 0.3,
      leafSpan: 0.05,
      height: 0.02,
      lightRequirement: 150,
      nutrientConcentration: 0.8
    },
    {
      stage: 'vegetative',
      daysFromPlanting: 7,
      optimalSpacing: 0.5,
      leafSpan: 0.15,
      height: 0.08,
      lightRequirement: 200,
      nutrientConcentration: 1.2
    },
    {
      stage: 'flowering',
      daysFromPlanting: 21,
      optimalSpacing: 0.8,
      leafSpan: 0.25,
      height: 0.15,
      lightRequirement: 250,
      nutrientConcentration: 1.0
    },
    {
      stage: 'harvest',
      daysFromPlanting: 35,
      optimalSpacing: 0.8,
      leafSpan: 0.3,
      height: 0.18,
      lightRequirement: 200,
      nutrientConcentration: 0.6
    }
  ],
  ventilationZones: [
    {
      startX: 0,
      endX: 4,
      airflowRate: 500,
      temperature: 22,
      humidity: 65
    },
    {
      startX: 4,
      endX: 8,
      airflowRate: 500,
      temperature: 22,
      humidity: 65
    }
  ]
};