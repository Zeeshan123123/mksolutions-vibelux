/**
 * Plant Placement System for Vertical Farm Ray Tracing
 * 
 * Handles individual plant positioning, growth stages, and spatial optimization
 * for accurate light distribution modeling
 */

import { vec3 } from 'gl-matrix';

export interface PlantInstance {
  id: string;
  position: vec3; // x, y position on the growing surface
  species: string;
  variety?: string;
  
  // Growth parameters
  plantingDate: Date;
  currentAge: number; // days
  growthStage: 'seed' | 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  
  // Physical characteristics
  currentHeight: number; // cm
  currentCanopyDiameter: number; // cm
  leafAreaIndex: number; // Individual plant LAI
  rootZoneRadius: number; // cm
  
  // For tall/vining plants
  canopyShape?: 'spherical' | 'cylindrical' | 'conical' | 'vine';
  canopyBaseHeight?: number; // Height where canopy starts (cm)
  supportStructure?: 'trellis' | 'stake' | 'cage' | 'vertical-tower';
  leafDistribution?: 'uniform' | 'top-heavy' | 'bottom-heavy' | 'sparse';
  
  // Optical properties modifier
  healthIndex: number; // 0-1, affects light absorption
  stressFactors?: {
    water?: number;
    nutrient?: number;
    disease?: number;
  };
}

export interface GrowingTray {
  id: string;
  dimensions: { width: number; length: number }; // meters
  position: vec3; // Position in room
  height: number; // Height from floor
  
  // Growing medium
  mediumType: 'rockwool' | 'coco' | 'perlite' | 'dwc' | 'nft' | 'aeroponic';
  mediumDepth: number; // cm
  
  // Plant arrangement
  plantingPattern: PlantingPattern;
  plants: PlantInstance[];
}

export interface PlantingPattern {
  type: 'grid' | 'hexagonal' | 'row' | 'custom';
  spacing: { x: number; y: number }; // cm
  offset?: { x: number; y: number }; // cm
  rotation?: number; // degrees
}

export interface PlantSpecies {
  name: string;
  scientificName: string;
  category: 'leafy' | 'herb' | 'fruiting' | 'root' | 'flower';
  
  // Growth characteristics
  growthRate: {
    germination: number; // days
    seedling: number;
    vegetative: number;
    flowering?: number;
    fruiting?: number;
    totalCycle: number;
  };
  
  // Size parameters by growth stage
  sizeProfile: {
    [stage: string]: {
      height: { min: number; max: number; typical: number };
      canopyDiameter: { min: number; max: number; typical: number };
      leafAreaIndex: { min: number; max: number; typical: number };
    };
  };
  
  // Light requirements
  lightRequirements: {
    ppfdOptimal: { min: number; max: number };
    ppfdTolerance: { min: number; max: number };
    photoperiod: { min: number; max: number }; // hours
    dliTarget: number; // mol/m²/day
    spectrumPreference?: {
      blue: number; // 400-500nm percentage
      green: number; // 500-600nm percentage
      red: number; // 600-700nm percentage
      farRed: number; // 700-800nm percentage
    };
  };
  
  // Spacing requirements
  spacing: {
    seedling: { x: number; y: number };
    vegetative: { x: number; y: number };
    mature: { x: number; y: number };
  };
}

// Common plant species database
export const PLANT_SPECIES_DATABASE: Record<string, PlantSpecies> = {
  'lettuce-butterhead': {
    name: 'Butterhead Lettuce',
    scientificName: 'Lactuca sativa var. capitata',
    category: 'leafy',
    growthRate: {
      germination: 7,
      seedling: 14,
      vegetative: 21,
      totalCycle: 42
    },
    sizeProfile: {
      seedling: {
        height: { min: 2, max: 5, typical: 3 },
        canopyDiameter: { min: 3, max: 8, typical: 5 },
        leafAreaIndex: { min: 0.5, max: 1.5, typical: 1.0 }
      },
      vegetative: {
        height: { min: 10, max: 20, typical: 15 },
        canopyDiameter: { min: 15, max: 30, typical: 25 },
        leafAreaIndex: { min: 2.0, max: 4.0, typical: 3.0 }
      }
    },
    lightRequirements: {
      ppfdOptimal: { min: 150, max: 250 },
      ppfdTolerance: { min: 100, max: 400 },
      photoperiod: { min: 14, max: 18 },
      dliTarget: 12,
      spectrumPreference: {
        blue: 20,
        green: 20,
        red: 50,
        farRed: 10
      }
    },
    spacing: {
      seedling: { x: 5, y: 5 },
      vegetative: { x: 15, y: 15 },
      mature: { x: 25, y: 25 }
    }
  },
  'basil-genovese': {
    name: 'Genovese Basil',
    scientificName: 'Ocimum basilicum',
    category: 'herb',
    growthRate: {
      germination: 5,
      seedling: 14,
      vegetative: 28,
      flowering: 14,
      totalCycle: 56
    },
    sizeProfile: {
      seedling: {
        height: { min: 3, max: 8, typical: 5 },
        canopyDiameter: { min: 2, max: 5, typical: 3 },
        leafAreaIndex: { min: 0.8, max: 1.5, typical: 1.2 }
      },
      vegetative: {
        height: { min: 20, max: 40, typical: 30 },
        canopyDiameter: { min: 15, max: 25, typical: 20 },
        leafAreaIndex: { min: 3.0, max: 5.0, typical: 4.0 }
      }
    },
    lightRequirements: {
      ppfdOptimal: { min: 200, max: 350 },
      ppfdTolerance: { min: 150, max: 500 },
      photoperiod: { min: 14, max: 16 },
      dliTarget: 15,
      spectrumPreference: {
        blue: 25,
        green: 15,
        red: 50,
        farRed: 10
      }
    },
    spacing: {
      seedling: { x: 5, y: 5 },
      vegetative: { x: 20, y: 20 },
      mature: { x: 25, y: 25 }
    }
  },
  'microgreens-mix': {
    name: 'Microgreens Mix',
    scientificName: 'Various',
    category: 'leafy',
    growthRate: {
      germination: 2,
      seedling: 5,
      vegetative: 7,
      totalCycle: 14
    },
    sizeProfile: {
      seedling: {
        height: { min: 1, max: 3, typical: 2 },
        canopyDiameter: { min: 1, max: 2, typical: 1.5 },
        leafAreaIndex: { min: 1.0, max: 2.0, typical: 1.5 }
      },
      vegetative: {
        height: { min: 5, max: 10, typical: 7 },
        canopyDiameter: { min: 2, max: 4, typical: 3 },
        leafAreaIndex: { min: 2.0, max: 3.0, typical: 2.5 }
      }
    },
    lightRequirements: {
      ppfdOptimal: { min: 100, max: 200 },
      ppfdTolerance: { min: 50, max: 300 },
      photoperiod: { min: 12, max: 16 },
      dliTarget: 8,
      spectrumPreference: {
        blue: 30,
        green: 20,
        red: 40,
        farRed: 10
      }
    },
    spacing: {
      seedling: { x: 1, y: 1 },
      vegetative: { x: 2, y: 2 },
      mature: { x: 3, y: 3 }
    }
  },
  'tomato-indeterminate': {
    name: 'Indeterminate Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'fruiting',
    growthRate: {
      germination: 7,
      seedling: 21,
      vegetative: 35,
      flowering: 21,
      fruiting: 60,
      totalCycle: 144
    },
    sizeProfile: {
      seedling: {
        height: { min: 10, max: 20, typical: 15 },
        canopyDiameter: { min: 10, max: 20, typical: 15 },
        leafAreaIndex: { min: 1.0, max: 2.0, typical: 1.5 }
      },
      vegetative: {
        height: { min: 50, max: 100, typical: 75 },
        canopyDiameter: { min: 30, max: 50, typical: 40 },
        leafAreaIndex: { min: 3.0, max: 5.0, typical: 4.0 }
      },
      flowering: {
        height: { min: 100, max: 200, typical: 150 },
        canopyDiameter: { min: 40, max: 60, typical: 50 },
        leafAreaIndex: { min: 4.0, max: 6.0, typical: 5.0 }
      },
      fruiting: {
        height: { min: 150, max: 300, typical: 200 },
        canopyDiameter: { min: 50, max: 80, typical: 60 },
        leafAreaIndex: { min: 3.5, max: 5.5, typical: 4.5 }
      }
    },
    lightRequirements: {
      ppfdOptimal: { min: 400, max: 600 },
      ppfdTolerance: { min: 200, max: 800 },
      photoperiod: { min: 12, max: 16 },
      dliTarget: 20,
      spectrumPreference: {
        blue: 15,
        green: 10,
        red: 60,
        farRed: 15
      }
    },
    spacing: {
      seedling: { x: 15, y: 15 },
      vegetative: { x: 45, y: 45 },
      mature: { x: 60, y: 60 }
    }
  },
  'cannabis-sativa': {
    name: 'Cannabis Sativa',
    scientificName: 'Cannabis sativa',
    category: 'flower',
    growthRate: {
      germination: 5,
      seedling: 14,
      vegetative: 42,
      flowering: 63,
      totalCycle: 124
    },
    sizeProfile: {
      seedling: {
        height: { min: 10, max: 20, typical: 15 },
        canopyDiameter: { min: 10, max: 20, typical: 15 },
        leafAreaIndex: { min: 1.5, max: 2.5, typical: 2.0 }
      },
      vegetative: {
        height: { min: 60, max: 120, typical: 90 },
        canopyDiameter: { min: 60, max: 100, typical: 80 },
        leafAreaIndex: { min: 4.0, max: 7.0, typical: 5.5 }
      },
      flowering: {
        height: { min: 100, max: 200, typical: 150 },
        canopyDiameter: { min: 80, max: 120, typical: 100 },
        leafAreaIndex: { min: 5.0, max: 8.0, typical: 6.5 }
      }
    },
    lightRequirements: {
      ppfdOptimal: { min: 600, max: 900 },
      ppfdTolerance: { min: 400, max: 1200 },
      photoperiod: { min: 12, max: 18 },
      dliTarget: 35,
      spectrumPreference: {
        blue: 20,
        green: 10,
        red: 55,
        farRed: 15
      }
    },
    spacing: {
      seedling: { x: 20, y: 20 },
      vegetative: { x: 60, y: 60 },
      mature: { x: 100, y: 100 }
    }
  },
  'cucumber-vine': {
    name: 'Cucumber (Vine)',
    scientificName: 'Cucumis sativus',
    category: 'fruiting',
    growthRate: {
      germination: 4,
      seedling: 14,
      vegetative: 21,
      flowering: 14,
      fruiting: 42,
      totalCycle: 95
    },
    sizeProfile: {
      vegetative: {
        height: { min: 50, max: 150, typical: 100 },
        canopyDiameter: { min: 30, max: 50, typical: 40 },
        leafAreaIndex: { min: 2.5, max: 4.0, typical: 3.2 }
      },
      fruiting: {
        height: { min: 150, max: 300, typical: 200 },
        canopyDiameter: { min: 40, max: 60, typical: 50 },
        leafAreaIndex: { min: 3.0, max: 5.0, typical: 4.0 }
      }
    },
    lightRequirements: {
      ppfdOptimal: { min: 300, max: 500 },
      ppfdTolerance: { min: 200, max: 700 },
      photoperiod: { min: 12, max: 16 },
      dliTarget: 18,
      spectrumPreference: {
        blue: 20,
        green: 15,
        red: 50,
        farRed: 15
      }
    },
    spacing: {
      seedling: { x: 20, y: 20 },
      vegetative: { x: 40, y: 40 },
      mature: { x: 50, y: 50 }
    }
  }
};

export class PlantPlacementSystem {
  private trays: Map<string, GrowingTray> = new Map();
  private species: Map<string, PlantSpecies> = new Map();
  
  constructor() {
    // Load default species
    Object.entries(PLANT_SPECIES_DATABASE).forEach(([key, species]) => {
      this.species.set(key, species);
    });
  }
  
  /**
   * Create a new growing tray with plant arrangement
   */
  createTray(config: {
    dimensions: { width: number; length: number };
    position: vec3;
    height: number;
    mediumType: GrowingTray['mediumType'];
    plantingPattern: PlantingPattern;
    species: string;
    plantingDate?: Date;
  }): GrowingTray {
    const tray: GrowingTray = {
      id: `tray-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dimensions: config.dimensions,
      position: config.position,
      height: config.height,
      mediumType: config.mediumType,
      mediumDepth: 5, // Default 5cm
      plantingPattern: config.plantingPattern,
      plants: []
    };
    
    // Generate plant positions based on pattern
    const plants = this.generatePlantPositions(
      tray,
      config.species,
      config.plantingDate || new Date()
    );
    
    tray.plants = plants;
    this.trays.set(tray.id, tray);
    
    return tray;
  }
  
  /**
   * Generate plant positions based on planting pattern
   */
  private generatePlantPositions(
    tray: GrowingTray,
    speciesKey: string,
    plantingDate: Date
  ): PlantInstance[] {
    const plants: PlantInstance[] = [];
    const species = this.species.get(speciesKey);
    if (!species) return plants;
    
    const pattern = tray.plantingPattern;
    const { width, length } = tray.dimensions;
    
    // Convert dimensions from meters to cm for calculations
    const widthCm = width * 100;
    const lengthCm = length * 100;
    
    switch (pattern.type) {
      case 'grid':
        const cols = Math.floor(widthCm / pattern.spacing.x);
        const rows = Math.floor(lengthCm / pattern.spacing.y);
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = (col + 0.5) * pattern.spacing.x + (pattern.offset?.x || 0);
            const y = (row + 0.5) * pattern.spacing.y + (pattern.offset?.y || 0);
            
            if (x < widthCm && y < lengthCm) {
              plants.push(this.createPlantInstance(
                vec3.fromValues(x / 100, y / 100, 0), // Convert back to meters
                species,
                plantingDate
              ));
            }
          }
        }
        break;
        
      case 'hexagonal':
        const hexCols = Math.floor(widthCm / pattern.spacing.x);
        const hexRows = Math.floor(lengthCm / (pattern.spacing.y * 0.866)); // Hex height factor
        
        for (let row = 0; row < hexRows; row++) {
          const rowOffset = (row % 2) * (pattern.spacing.x / 2);
          for (let col = 0; col < hexCols; col++) {
            const x = col * pattern.spacing.x + rowOffset + (pattern.offset?.x || 0);
            const y = row * pattern.spacing.y * 0.866 + (pattern.offset?.y || 0);
            
            if (x < widthCm && y < lengthCm) {
              plants.push(this.createPlantInstance(
                vec3.fromValues(x / 100, y / 100, 0),
                species,
                plantingDate
              ));
            }
          }
        }
        break;
        
      case 'row':
        const numRows = Math.floor(lengthCm / pattern.spacing.y);
        const plantsPerRow = Math.floor(widthCm / pattern.spacing.x);
        
        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < plantsPerRow; col++) {
            const x = (col + 0.5) * pattern.spacing.x;
            const y = (row + 0.5) * pattern.spacing.y;
            
            plants.push(this.createPlantInstance(
              vec3.fromValues(x / 100, y / 100, 0),
              species,
              plantingDate
            ));
          }
        }
        break;
    }
    
    return plants;
  }
  
  /**
   * Create individual plant instance
   */
  private createPlantInstance(
    position: vec3,
    species: PlantSpecies,
    plantingDate: Date
  ): PlantInstance {
    const age = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const growthStage = this.determineGrowthStage(age, species);
    const stageProfile = species.sizeProfile[growthStage] || species.sizeProfile.seedling;
    
    // Add some natural variation
    const heightVariation = 0.8 + Math.random() * 0.4; // 80-120%
    const canopyVariation = 0.9 + Math.random() * 0.2; // 90-110%
    
    return {
      id: `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      species: species.name,
      plantingDate,
      currentAge: age,
      growthStage,
      currentHeight: stageProfile.height.typical * heightVariation,
      currentCanopyDiameter: stageProfile.canopyDiameter.typical * canopyVariation,
      leafAreaIndex: stageProfile.leafAreaIndex.typical,
      rootZoneRadius: stageProfile.canopyDiameter.typical * 0.3,
      healthIndex: 0.9 + Math.random() * 0.1 // 90-100% health
    };
  }
  
  /**
   * Determine growth stage based on age
   */
  private determineGrowthStage(age: number, species: PlantSpecies): PlantInstance['growthStage'] {
    const { growthRate } = species;
    
    if (age < growthRate.germination) return 'germination';
    if (age < growthRate.germination + growthRate.seedling) return 'seedling';
    if (age < growthRate.germination + growthRate.seedling + growthRate.vegetative) return 'vegetative';
    if (growthRate.flowering && age < growthRate.totalCycle - (growthRate.fruiting || 0)) return 'flowering';
    if (growthRate.fruiting && age < growthRate.totalCycle) return 'fruiting';
    return 'harvest';
  }
  
  /**
   * Update plant growth over time
   */
  updatePlantGrowth(days: number = 1): void {
    this.trays.forEach(tray => {
      tray.plants.forEach(plant => {
        plant.currentAge += days;
        
        // Update growth stage and size
        const species = Array.from(this.species.values()).find(s => s.name === plant.species);
        if (species) {
          const oldStage = plant.growthStage;
          plant.growthStage = this.determineGrowthStage(plant.currentAge, species);
          
          // Update size if stage changed
          if (oldStage !== plant.growthStage) {
            const stageProfile = species.sizeProfile[plant.growthStage];
            if (stageProfile) {
              const growthFactor = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation
              plant.currentHeight = stageProfile.height.typical * growthFactor * plant.healthIndex;
              plant.currentCanopyDiameter = stageProfile.canopyDiameter.typical * growthFactor * plant.healthIndex;
              plant.leafAreaIndex = stageProfile.leafAreaIndex.typical * plant.healthIndex;
            }
          }
        }
      });
    });
  }
  
  /**
   * Calculate effective LAI at a specific point considering individual plants
   */
  calculateLocalLAI(position: vec3, layerHeight: number): number {
    let totalLAI = 0;
    
    this.trays.forEach(tray => {
      // Check if tray is at this height
      if (Math.abs(tray.height - layerHeight) < 0.1) {
        tray.plants.forEach(plant => {
          // Calculate distance from point to plant center
          const distance = vec3.distance(position, plant.position);
          
          // If point is within plant canopy
          if (distance < plant.currentCanopyDiameter / 200) { // Convert cm to m
            // Calculate contribution based on distance from center
            const normalizedDistance = distance / (plant.currentCanopyDiameter / 200);
            const contribution = plant.leafAreaIndex * (1 - normalizedDistance * normalizedDistance);
            totalLAI += Math.max(0, contribution);
          }
        });
      }
    });
    
    return totalLAI;
  }
  
  /**
   * Get plants within a specific area
   */
  getPlantsInArea(
    center: vec3,
    radius: number,
    heightRange?: { min: number; max: number }
  ): PlantInstance[] {
    const plantsInArea: PlantInstance[] = [];
    
    this.trays.forEach(tray => {
      // Check height if range provided
      if (heightRange && (tray.height < heightRange.min || tray.height > heightRange.max)) {
        return;
      }
      
      tray.plants.forEach(plant => {
        const distance = vec3.distance(center, plant.position);
        if (distance <= radius) {
          plantsInArea.push(plant);
        }
      });
    });
    
    return plantsInArea;
  }
  
  /**
   * Optimize plant spacing based on growth stage
   */
  optimizeSpacing(trayId: string): void {
    const tray = this.trays.get(trayId);
    if (!tray) return;
    
    // Group plants by growth stage
    const stageGroups = new Map<string, PlantInstance[]>();
    tray.plants.forEach(plant => {
      const group = stageGroups.get(plant.growthStage) || [];
      group.push(plant);
      stageGroups.set(plant.growthStage, group);
    });
    
    // Reorganize based on optimal spacing for each stage
    // This is a simplified version - real implementation would use optimization algorithms
    const currentX = 0;
    stageGroups.forEach((plants, stage) => {
      plants.forEach((plant, index) => {
        const species = Array.from(this.species.values()).find(s => s.name === plant.species);
        if (species) {
          const spacing = species.spacing[stage as keyof typeof species.spacing] || species.spacing.mature;
          const row = Math.floor(index / Math.floor(tray.dimensions.width * 100 / spacing.x));
          const col = index % Math.floor(tray.dimensions.width * 100 / spacing.x);
          
          plant.position[0] = (col + 0.5) * spacing.x / 100;
          plant.position[1] = (row + 0.5) * spacing.y / 100;
        }
      });
    });
  }
  
  /**
   * Export tray configuration for ray tracer
   */
  exportForRayTracer(trayId: string): {
    positions: Float32Array;
    sizes: Float32Array;
    properties: Float32Array;
  } {
    const tray = this.trays.get(trayId);
    if (!tray) {
      return {
        positions: new Float32Array(0),
        sizes: new Float32Array(0),
        properties: new Float32Array(0)
      };
    }
    
    const positions = new Float32Array(tray.plants.length * 3);
    const sizes = new Float32Array(tray.plants.length * 2); // height, diameter
    const properties = new Float32Array(tray.plants.length * 2); // LAI, health
    
    tray.plants.forEach((plant, index) => {
      // Positions (global coordinates)
      positions[index * 3] = tray.position[0] + plant.position[0];
      positions[index * 3 + 1] = tray.position[1] + plant.position[1];
      positions[index * 3 + 2] = tray.height;
      
      // Sizes
      sizes[index * 2] = plant.currentHeight / 100; // Convert to meters
      sizes[index * 2 + 1] = plant.currentCanopyDiameter / 100;
      
      // Properties
      properties[index * 2] = plant.leafAreaIndex;
      properties[index * 2 + 1] = plant.healthIndex;
    });
    
    return { positions, sizes, properties };
  }
}

/**
 * Helper function to create common tray configurations
 */
export function createStandardTray(
  type: 'seedling' | 'vegetative' | 'production',
  species: string,
  position: vec3,
  height: number
): GrowingTray {
  const system = new PlantPlacementSystem();
  
  const configs = {
    seedling: {
      dimensions: { width: 1.2, length: 0.6 }, // Standard propagation tray
      pattern: { type: 'grid' as const, spacing: { x: 5, y: 5 } },
      mediumType: 'rockwool' as const
    },
    vegetative: {
      dimensions: { width: 2.4, length: 1.2 }, // Double size
      pattern: { type: 'grid' as const, spacing: { x: 15, y: 15 } },
      mediumType: 'coco' as const
    },
    production: {
      dimensions: { width: 3.6, length: 1.2 }, // Production size
      pattern: { type: 'hexagonal' as const, spacing: { x: 25, y: 25 } },
      mediumType: 'nft' as const
    }
  };
  
  const config = configs[type];
  return system.createTray({
    dimensions: config.dimensions,
    position,
    height,
    mediumType: config.mediumType,
    plantingPattern: config.pattern,
    species
  });
}