/**
 * Advanced Plant System with Crop-Specific Heights and Lighting Strategies
 * Supports interlighting, under-canopy lighting, and dynamic growth modeling
 */

// Import research-backed data for accuracy
import { RESEARCH_BACKED_CROPS } from './research-backed-crop-data';

export interface PlantGrowthStage {
  name: string;
  durationDays: number;
  heightInches: number;
  canopyDiameter: number;
  lightRequirements: {
    topLighting: { ppfd: number; photoperiod: number };
    interLighting?: { ppfd: number; heightPercent: number }; // % of plant height
    underCanopy?: { ppfd: number; spectrum: string };
  };
  environmentalNeeds: {
    temperature: { day: number; night: number };
    humidity: number;
    co2: number;
    vpd: { min: number; max: number };
  };
}

export interface PlantArchitecture {
  type: 'bushy' | 'vining' | 'columnar' | 'spreading' | 'rosette';
  matureHeight: number; // inches
  matureWidth: number; // inches
  canopyShape: 'round' | 'oval' | 'irregular' | 'pyramidal';
  stemCount: number;
  leafAreaIndex: number; // m²/m²
  lightPenetration: number; // % of light that penetrates canopy
}

export interface AdvancedCropSpec {
  id: string;
  commonName: string;
  scientificName: string;
  category: 'leafy' | 'fruiting' | 'herb' | 'flower' | 'specialty';
  architecture: PlantArchitecture;
  growthStages: PlantGrowthStage[];
  spacing: {
    inRow: number; // inches
    betweenRows: number; // inches
    plantsPerSqFt: number;
  };
  lightingStrategies: {
    topLighting: {
      optimal: boolean;
      fixtures: 'overhead' | 'close-canopy';
      heightAboveCanopy: number; // inches
    };
    interLighting?: {
      recommended: boolean;
      layers: number;
      fixtureType: 'LED-bar' | 'LED-tube' | 'HPS-bulb';
      positioning: 'between-rows' | 'within-canopy';
      startStage: string; // growth stage name
    };
    underCanopy?: {
      beneficial: boolean;
      targetArea: 'lower-leaves' | 'fruit-zone' | 'stem-base';
      spectrum: 'red-heavy' | 'blue-heavy' | 'far-red' | 'uv';
      timing: 'continuous' | 'end-of-day' | 'night-break';
    };
    supplemental?: {
      sidelight?: boolean;
      uplighting?: boolean;
      dynamicControl?: boolean;
    };
  };
  yieldModel: {
    baseYield: number; // g/plant/cycle
    lightResponseCurve: 'linear' | 'logarithmic' | 'saturation';
    optimalDLI: number;
    maxDLI: number;
  };
}

// Comprehensive crop database with advanced specifications
export const ADVANCED_CROP_DATABASE: Record<string, AdvancedCropSpec> = {
  // High-wire tomatoes - tall vining crop
  'high-wire-tomato': {
    id: 'high-wire-tomato',
    commonName: 'High-Wire Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'fruiting',
    architecture: {
      type: 'vining',
      matureHeight: 180, // 15 feet
      matureWidth: 24,
      canopyShape: 'columnar',
      stemCount: 1,
      leafAreaIndex: 3.5,
      lightPenetration: 30 // Dense canopy blocks 70% of light
    },
    growthStages: [
      {
        name: 'seedling',
        durationDays: 21,
        heightInches: 6,
        canopyDiameter: 4,
        lightRequirements: {
          topLighting: { ppfd: 200, photoperiod: 16 }
        },
        environmentalNeeds: {
          temperature: { day: 75, night: 65 },
          humidity: 70,
          co2: 800,
          vpd: { min: 0.6, max: 0.9 }
        }
      },
      {
        name: 'vegetative',
        durationDays: 30,
        heightInches: 48,
        canopyDiameter: 18,
        lightRequirements: {
          topLighting: { ppfd: 500, photoperiod: 18 },
          interLighting: { ppfd: 150, heightPercent: 50 }
        },
        environmentalNeeds: {
          temperature: { day: 77, night: 67 },
          humidity: 65,
          co2: 1000,
          vpd: { min: 0.8, max: 1.2 }
        }
      },
      {
        name: 'flowering',
        durationDays: 14,
        heightInches: 72,
        canopyDiameter: 24,
        lightRequirements: {
          topLighting: { ppfd: 600, photoperiod: 12 },
          interLighting: { ppfd: 200, heightPercent: 60 }
        },
        environmentalNeeds: {
          temperature: { day: 75, night: 65 },
          humidity: 60,
          co2: 1200,
          vpd: { min: 1.0, max: 1.4 }
        }
      },
      {
        name: 'production',
        durationDays: 180,
        heightInches: 180,
        canopyDiameter: 24,
        lightRequirements: {
          topLighting: { ppfd: 700, photoperiod: 16 },
          interLighting: { ppfd: 250, heightPercent: 70 },
          underCanopy: { ppfd: 50, spectrum: 'red-heavy' }
        },
        environmentalNeeds: {
          temperature: { day: 73, night: 63 },
          humidity: 55,
          co2: 1500,
          vpd: { min: 1.2, max: 1.6 }
        }
      }
    ],
    spacing: {
      inRow: 18,
      betweenRows: 48,
      plantsPerSqFt: 0.33
    },
    lightingStrategies: {
      topLighting: {
        optimal: true,
        fixtures: 'overhead',
        heightAboveCanopy: 36
      },
      interLighting: {
        recommended: true,
        layers: 3, // One every 5-6 feet of height
        fixtureType: 'LED-bar',
        positioning: 'between-rows',
        startStage: 'vegetative'
      },
      underCanopy: {
        beneficial: true,
        targetArea: 'fruit-zone',
        spectrum: 'red-heavy',
        timing: 'continuous'
      },
      supplemental: {
        sidelight: true,
        dynamicControl: true
      }
    },
    yieldModel: {
      baseYield: 60000, // 60kg/plant/year
      lightResponseCurve: 'logarithmic',
      optimalDLI: 30,
      maxDLI: 40
    }
  },

  // Lettuce - compact leafy crop
  'butterhead-lettuce': {
    id: 'butterhead-lettuce',
    commonName: 'Butterhead Lettuce',
    scientificName: 'Lactuca sativa',
    category: 'leafy',
    architecture: {
      type: 'rosette',
      matureHeight: 6,
      matureWidth: 10,
      canopyShape: 'round',
      stemCount: 1,
      leafAreaIndex: 2.5,
      lightPenetration: 60
    },
    growthStages: [
      {
        name: 'seedling',
        durationDays: 7,
        heightInches: 1,
        canopyDiameter: 2,
        lightRequirements: {
          topLighting: { 
            ppfd: 100, 
            photoperiod: RESEARCH_BACKED_CROPS['butterhead-lettuce']?.lightingData.photoperiod.hours || 16 
          }
        },
        environmentalNeeds: {
          temperature: { day: 70, night: 60 },
          humidity: 70,
          co2: 400,
          vpd: { min: 0.4, max: 0.6 }
        }
      },
      {
        name: 'vegetative',
        durationDays: 21,
        heightInches: 3,
        canopyDiameter: 6,
        lightRequirements: {
          topLighting: { ppfd: 180, photoperiod: 18 }
        },
        environmentalNeeds: {
          temperature: { day: 68, night: 58 },
          humidity: 65,
          co2: 600,
          vpd: { min: 0.6, max: 0.8 }
        }
      },
      {
        name: 'harvest',
        durationDays: 7,
        heightInches: 6,
        canopyDiameter: 10,
        lightRequirements: {
          topLighting: { ppfd: 200, photoperiod: 16 }
        },
        environmentalNeeds: {
          temperature: { day: 65, night: 55 },
          humidity: 60,
          co2: 800,
          vpd: { min: 0.7, max: 0.9 }
        }
      }
    ],
    spacing: {
      inRow: 8,
      betweenRows: 8,
      plantsPerSqFt: 2.25
    },
    lightingStrategies: {
      topLighting: {
        optimal: true,
        fixtures: 'close-canopy',
        heightAboveCanopy: 12
      }
      // No interlighting needed for short crops
    },
    yieldModel: {
      baseYield: 150, // g/plant/cycle
      lightResponseCurve: 'linear',
      optimalDLI: 14,
      maxDLI: 17
    }
  },

  // Cannabis - bushy crop with under-canopy needs
  'cannabis-sativa': {
    id: 'cannabis-sativa',
    commonName: 'Cannabis',
    scientificName: 'Cannabis sativa',
    category: 'flower',
    architecture: {
      type: 'bushy',
      matureHeight: 60,
      matureWidth: 48,
      canopyShape: 'irregular',
      stemCount: 8, // After topping
      leafAreaIndex: 4.0,
      lightPenetration: 20 // Very dense canopy
    },
    growthStages: [
      {
        name: 'clone',
        durationDays: 14,
        heightInches: 6,
        canopyDiameter: 6,
        lightRequirements: {
          topLighting: { ppfd: 150, photoperiod: 18 }
        },
        environmentalNeeds: {
          temperature: { day: 75, night: 70 },
          humidity: 80,
          co2: 400,
          vpd: { min: 0.5, max: 0.7 }
        }
      },
      {
        name: 'vegetative',
        durationDays: 30,
        heightInches: 24,
        canopyDiameter: 30,
        lightRequirements: {
          topLighting: { ppfd: 600, photoperiod: 18 }
        },
        environmentalNeeds: {
          temperature: { day: 78, night: 68 },
          humidity: 65,
          co2: 1200,
          vpd: { min: 0.8, max: 1.2 }
        }
      },
      {
        name: 'flowering-early',
        durationDays: 21,
        heightInches: 36,
        canopyDiameter: 42,
        lightRequirements: {
          topLighting: { ppfd: 800, photoperiod: 12 }
        },
        environmentalNeeds: {
          temperature: { day: 76, night: 66 },
          humidity: 55,
          co2: 1500,
          vpd: { min: 1.0, max: 1.4 }
        }
      },
      {
        name: 'flowering-late',
        durationDays: 42,
        heightInches: 48,
        canopyDiameter: 48,
        lightRequirements: {
          topLighting: { ppfd: 1000, photoperiod: 12 },
          underCanopy: { ppfd: 100, spectrum: 'red-heavy' }
        },
        environmentalNeeds: {
          temperature: { day: 74, night: 64 },
          humidity: 45,
          co2: 1200,
          vpd: { min: 1.2, max: 1.6 }
        }
      }
    ],
    spacing: {
      inRow: 48,
      betweenRows: 48,
      plantsPerSqFt: 0.25
    },
    lightingStrategies: {
      topLighting: {
        optimal: true,
        fixtures: 'overhead',
        heightAboveCanopy: 24
      },
      underCanopy: {
        beneficial: true,
        targetArea: 'lower-leaves',
        spectrum: 'red-heavy',
        timing: 'continuous'
      },
      supplemental: {
        sidelight: true,
        uplighting: true,
        dynamicControl: true
      }
    },
    yieldModel: {
      baseYield: 600, // g/plant/cycle
      lightResponseCurve: 'saturation',
      optimalDLI: 45,
      maxDLI: 55
    }
  },

  // Basil - herb with specific spectrum needs
  'genovese-basil': {
    id: 'genovese-basil',
    commonName: 'Genovese Basil',
    scientificName: 'Ocimum basilicum',
    category: 'herb',
    architecture: {
      type: 'bushy',
      matureHeight: 24,
      matureWidth: 18,
      canopyShape: 'round',
      stemCount: 4,
      leafAreaIndex: 3.0,
      lightPenetration: 40
    },
    growthStages: [
      {
        name: 'seedling',
        durationDays: 14,
        heightInches: 2,
        canopyDiameter: 3,
        lightRequirements: {
          topLighting: { ppfd: 150, photoperiod: 16 }
        },
        environmentalNeeds: {
          temperature: { day: 75, night: 65 },
          humidity: 65,
          co2: 400,
          vpd: { min: 0.6, max: 0.8 }
        }
      },
      {
        name: 'vegetative',
        durationDays: 28,
        heightInches: 12,
        canopyDiameter: 12,
        lightRequirements: {
          topLighting: { ppfd: 300, photoperiod: 18 }
        },
        environmentalNeeds: {
          temperature: { day: 77, night: 67 },
          humidity: 60,
          co2: 800,
          vpd: { min: 0.8, max: 1.1 }
        }
      },
      {
        name: 'harvest',
        durationDays: 7,
        heightInches: 18,
        canopyDiameter: 16,
        lightRequirements: {
          topLighting: { ppfd: 350, photoperiod: 16 },
          underCanopy: { ppfd: 50, spectrum: 'blue-heavy' }
        },
        environmentalNeeds: {
          temperature: { day: 75, night: 65 },
          humidity: 55,
          co2: 1000,
          vpd: { min: 0.9, max: 1.2 }
        }
      }
    ],
    spacing: {
      inRow: 6,
      betweenRows: 8,
      plantsPerSqFt: 3
    },
    lightingStrategies: {
      topLighting: {
        optimal: true,
        fixtures: 'close-canopy',
        heightAboveCanopy: 18
      },
      underCanopy: {
        beneficial: true,
        targetArea: 'lower-leaves',
        spectrum: 'blue-heavy', // Increases essential oil content
        timing: 'end-of-day'
      }
    },
    yieldModel: {
      baseYield: 200, // g/plant/cycle
      lightResponseCurve: 'linear',
      optimalDLI: 18,
      maxDLI: 22
    }
  },

  // Strawberries - spreading crop with unique needs
  'strawberry': {
    id: 'strawberry',
    commonName: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    category: 'fruiting',
    architecture: {
      type: 'spreading',
      matureHeight: 8,
      matureWidth: 12,
      canopyShape: 'irregular',
      stemCount: 1,
      leafAreaIndex: 2.0,
      lightPenetration: 50
    },
    growthStages: [
      {
        name: 'establishment',
        durationDays: 30,
        heightInches: 4,
        canopyDiameter: 6,
        lightRequirements: {
          topLighting: { ppfd: 250, photoperiod: 16 }
        },
        environmentalNeeds: {
          temperature: { day: 70, night: 60 },
          humidity: 70,
          co2: 600,
          vpd: { min: 0.6, max: 0.9 }
        }
      },
      {
        name: 'vegetative',
        durationDays: 60,
        heightInches: 6,
        canopyDiameter: 10,
        lightRequirements: {
          topLighting: { ppfd: 350, photoperiod: 14 }
        },
        environmentalNeeds: {
          temperature: { day: 68, night: 58 },
          humidity: 65,
          co2: 800,
          vpd: { min: 0.8, max: 1.1 }
        }
      },
      {
        name: 'flowering',
        durationDays: 30,
        heightInches: 8,
        canopyDiameter: 12,
        lightRequirements: {
          topLighting: { ppfd: 400, photoperiod: 12 },
          underCanopy: { ppfd: 30, spectrum: 'far-red' } // Promotes flowering
        },
        environmentalNeeds: {
          temperature: { day: 65, night: 55 },
          humidity: 60,
          co2: 1000,
          vpd: { min: 0.9, max: 1.2 }
        }
      }
    ],
    spacing: {
      inRow: 12,
      betweenRows: 12,
      plantsPerSqFt: 1
    },
    lightingStrategies: {
      topLighting: {
        optimal: true,
        fixtures: 'close-canopy',
        heightAboveCanopy: 24
      },
      underCanopy: {
        beneficial: true,
        targetArea: 'fruit-zone',
        spectrum: 'far-red',
        timing: 'end-of-day'
      },
      supplemental: {
        sidelight: true // For vertical growing systems
      }
    },
    yieldModel: {
      baseYield: 500, // g/plant/season
      lightResponseCurve: 'logarithmic',
      optimalDLI: 20,
      maxDLI: 25
    }
  }
};

// Lighting fixture placement calculator for different strategies
export interface LightingPlacement {
  strategy: 'top' | 'inter' | 'under' | 'side';
  fixtures: Array<{
    x: number;
    y: number;
    z: number;
    rotation: number;
    fixtureType: string;
    targetPPFD: number;
  }>;
}

export function calculateInterLightingPositions(
  plantRows: Array<{ x: number; y: number; height: number }>,
  cropSpec: AdvancedCropSpec,
  roomDimensions: { width: number; length: number; height: number }
): LightingPlacement[] {
  const placements: LightingPlacement[] = [];
  
  if (!cropSpec.lightingStrategies.interLighting?.recommended) {
    return placements;
  }

  const { layers, positioning } = cropSpec.lightingStrategies.interLighting;
  const currentStage = cropSpec.growthStages[cropSpec.growthStages.length - 1]; // Mature stage
  const plantHeight = currentStage.heightInches / 12; // Convert to feet
  const layerSpacing = plantHeight / (layers + 1);

  // Calculate interlighting positions
  const interLights: LightingPlacement['fixtures'] = [];
  
  plantRows.forEach((row, rowIndex) => {
    for (let layer = 1; layer <= layers; layer++) {
      const z = layerSpacing * layer;
      
      if (positioning === 'between-rows' && rowIndex < plantRows.length - 1) {
        // Place lights between this row and the next
        const nextRow = plantRows[rowIndex + 1];
        interLights.push({
          x: row.x,
          y: (row.y + nextRow.y) / 2,
          z: z,
          rotation: 0,
          fixtureType: 'LED-bar-interlight',
          targetPPFD: currentStage.lightRequirements.interLighting?.ppfd || 200
        });
      } else if (positioning === 'within-canopy') {
        // Place lights within the canopy
        interLights.push({
          x: row.x,
          y: row.y,
          z: z,
          rotation: 90, // Perpendicular to row
          fixtureType: 'LED-tube-interlight',
          targetPPFD: currentStage.lightRequirements.interLighting?.ppfd || 150
        });
      }
    }
  });

  placements.push({
    strategy: 'inter',
    fixtures: interLights
  });

  return placements;
}

export function calculateUnderCanopyLighting(
  plantPositions: Array<{ x: number; y: number; canopyRadius: number }>,
  cropSpec: AdvancedCropSpec
): LightingPlacement[] {
  const placements: LightingPlacement[] = [];
  
  if (!cropSpec.lightingStrategies.underCanopy?.beneficial) {
    return placements;
  }

  const { targetArea, spectrum } = cropSpec.lightingStrategies.underCanopy;
  const underCanopyLights: LightingPlacement['fixtures'] = [];
  
  plantPositions.forEach(plant => {
    // Calculate placement based on target area
    const xOffset = 0, yOffset = 0;
    
    switch (targetArea) {
      case 'lower-leaves':
        // Place lights around the perimeter
        for (let angle = 0; angle < 360; angle += 90) {
          const rad = (angle * Math.PI) / 180;
          underCanopyLights.push({
            x: plant.x + Math.cos(rad) * plant.canopyRadius * 0.8,
            y: plant.y + Math.sin(rad) * plant.canopyRadius * 0.8,
            z: 0.5, // 6 inches above ground
            rotation: angle + 90, // Point toward plant
            fixtureType: `under-canopy-${spectrum}`,
            targetPPFD: 100
          });
        }
        break;
        
      case 'fruit-zone':
        // Place lights targeting fruit zone (typically middle height)
        underCanopyLights.push({
          x: plant.x,
          y: plant.y - plant.canopyRadius * 0.6,
          z: 1.5, // 18 inches for fruit zone
          rotation: 0,
          fixtureType: `fruit-zone-${spectrum}`,
          targetPPFD: 80
        });
        break;
        
      case 'stem-base':
        // Single light at stem base
        underCanopyLights.push({
          x: plant.x,
          y: plant.y,
          z: 0.25, // 3 inches
          rotation: 0,
          fixtureType: `stem-light-${spectrum}`,
          targetPPFD: 50
        });
        break;
    }
  });

  placements.push({
    strategy: 'under',
    fixtures: underCanopyLights
  });

  return placements;
}

// Calculate total light requirements including all strategies
export function calculateTotalLightRequirements(
  cropSpec: AdvancedCropSpec,
  growingArea: number, // square feet
  growthStage: string
): {
  topLightPPF: number;
  interLightPPF: number;
  underCanopyPPF: number;
  totalPPF: number;
  recommendedFixtures: {
    top: { count: number; wattage: number };
    inter?: { count: number; wattage: number };
    under?: { count: number; wattage: number };
  };
} {
  const stage = cropSpec.growthStages.find(s => s.name === growthStage) || 
                cropSpec.growthStages[cropSpec.growthStages.length - 1];
  
  // Calculate PPF requirements (μmol/s)
  const topLightPPF = (stage.lightRequirements.topLighting.ppfd * growingArea * 0.0929) / 4.6; // Convert sq ft to sq m
  const interLightPPF = stage.lightRequirements.interLighting ? 
    (stage.lightRequirements.interLighting.ppfd * growingArea * 0.0929) / 4.6 : 0;
  const underCanopyPPF = stage.lightRequirements.underCanopy ? 
    (stage.lightRequirements.underCanopy.ppfd * growingArea * 0.0929 * 0.3) / 4.6 : 0; // 30% of area
  
  const totalPPF = topLightPPF + interLightPPF + underCanopyPPF;
  
  // Calculate fixture recommendations (assuming 2.8 μmol/J efficacy)
  const efficacy = 2.8;
  const recommendedFixtures = {
    top: {
      count: Math.ceil(topLightPPF / 1800), // 650W fixture = ~1800 PPF
      wattage: Math.ceil(topLightPPF / efficacy)
    }
  };
  
  if (interLightPPF > 0) {
    recommendedFixtures.inter = {
      count: Math.ceil(interLightPPF / 300), // 100W interlight = ~300 PPF
      wattage: Math.ceil(interLightPPF / efficacy)
    };
  }
  
  if (underCanopyPPF > 0) {
    recommendedFixtures.under = {
      count: Math.ceil(underCanopyPPF / 150), // 50W under-canopy = ~150 PPF
      wattage: Math.ceil(underCanopyPPF / efficacy)
    };
  }
  
  return {
    topLightPPF,
    interLightPPF,
    underCanopyPPF,
    totalPPF,
    recommendedFixtures
  };
}

// Growth simulation over time
export function simulatePlantGrowth(
  cropSpec: AdvancedCropSpec,
  startDate: Date,
  environmentalConditions: {
    actualDLI: number;
    avgTemperature: number;
    avgHumidity: number;
    avgCO2: number;
  }
): {
  currentStage: string;
  currentHeight: number;
  currentCanopyDiameter: number;
  daysInStage: number;
  projectedYield: number;
  healthScore: number; // 0-100
} {
  const daysSincePlanting = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  let totalDays = 0;
  let currentStage = cropSpec.growthStages[0];
  
  // Find current growth stage
  for (const stage of cropSpec.growthStages) {
    if (daysSincePlanting < totalDays + stage.durationDays) {
      currentStage = stage;
      break;
    }
    totalDays += stage.durationDays;
  }
  
  const daysInStage = daysSincePlanting - totalDays;
  const stageProgress = daysInStage / currentStage.durationDays;
  
  // Interpolate current size
  const prevStage = cropSpec.growthStages[Math.max(0, cropSpec.growthStages.indexOf(currentStage) - 1)];
  const currentHeight = prevStage.heightInches + 
    (currentStage.heightInches - prevStage.heightInches) * stageProgress;
  const currentCanopyDiameter = prevStage.canopyDiameter + 
    (currentStage.canopyDiameter - prevStage.canopyDiameter) * stageProgress;
  
  // Calculate health score based on environmental match
  let healthScore = 100;
  
  // DLI factor
  const dliRatio = environmentalConditions.actualDLI / cropSpec.yieldModel.optimalDLI;
  if (dliRatio < 0.8) healthScore -= (0.8 - dliRatio) * 50;
  if (dliRatio > 1.2) healthScore -= (dliRatio - 1.2) * 30;
  
  // Temperature factor
  const tempDiff = Math.abs(environmentalConditions.avgTemperature - currentStage.environmentalNeeds.temperature.day);
  healthScore -= tempDiff * 2;
  
  // CO2 factor
  const co2Ratio = environmentalConditions.avgCO2 / currentStage.environmentalNeeds.co2;
  if (co2Ratio < 0.8) healthScore -= (0.8 - co2Ratio) * 20;
  
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Project yield based on conditions
  let yieldMultiplier = healthScore / 100;
  
  // Apply light response curve
  switch (cropSpec.yieldModel.lightResponseCurve) {
    case 'linear':
      yieldMultiplier *= dliRatio;
      break;
    case 'logarithmic':
      yieldMultiplier *= Math.log10(9 * dliRatio + 1);
      break;
    case 'saturation':
      yieldMultiplier *= dliRatio / (0.5 + dliRatio);
      break;
  }
  
  const projectedYield = cropSpec.yieldModel.baseYield * yieldMultiplier;
  
  return {
    currentStage: currentStage.name,
    currentHeight,
    currentCanopyDiameter,
    daysInStage,
    projectedYield,
    healthScore
  };
}