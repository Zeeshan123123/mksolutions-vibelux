/**
 * Expanded Plant Specifications for Advanced System
 * Comprehensive crop database with growth modeling
 */

import { AdvancedCropSpec } from './advanced-plant-system';
import { RESEARCH_BACKED_CROPS } from './research-backed-crop-data';

// Helper to generate crop spec from research data
function generateCropSpecFromResearch(
  id: string, 
  researchData: any
): AdvancedCropSpec | null {
  if (!researchData) return null;

  const stages = [];
  
  // Generate growth stages based on research
  if (researchData.growthData.height.seedling > 0) {
    stages.push({
      name: 'seedling',
      durationDays: 7,
      heightInches: researchData.growthData.height.seedling,
      canopyDiameter: researchData.growthData.height.seedling * 0.8,
      lightRequirements: {
        topLighting: {
          ppfd: Math.round(researchData.lightingData.ppfd.min),
          photoperiod: researchData.lightingData.photoperiod.hours
        }
      },
      environmentalNeeds: {
        temperature: {
          day: researchData.environmentalData.temperature.day[0],
          night: researchData.environmentalData.temperature.night[0]
        },
        humidity: researchData.environmentalData.humidity.range[0],
        co2: researchData.environmentalData.co2?.ambient || 400,
        vpd: { min: 0.4, max: 0.8 }
      }
    });
  }

  // Vegetative stage
  stages.push({
    name: 'vegetative',
    durationDays: 21,
    heightInches: researchData.growthData.height.vegetative,
    canopyDiameter: researchData.growthData.height.vegetative * 1.2,
    lightRequirements: {
      topLighting: {
        ppfd: researchData.lightingData.ppfd.optimal,
        photoperiod: researchData.lightingData.photoperiod.hours
      }
    },
    environmentalNeeds: {
      temperature: {
        day: (researchData.environmentalData.temperature.day[0] + researchData.environmentalData.temperature.day[1]) / 2,
        night: (researchData.environmentalData.temperature.night[0] + researchData.environmentalData.temperature.night[1]) / 2
      },
      humidity: (researchData.environmentalData.humidity.range[0] + researchData.environmentalData.humidity.range[1]) / 2,
      co2: researchData.environmentalData.co2?.enriched || 800,
      vpd: { min: 0.8, max: 1.2 }
    }
  });

  // Mature/harvest stage
  stages.push({
    name: 'harvest',
    durationDays: 7,
    heightInches: researchData.growthData.height.mature,
    canopyDiameter: researchData.growthData.height.mature * 1.5,
    lightRequirements: {
      topLighting: {
        ppfd: researchData.lightingData.ppfd.optimal,
        photoperiod: researchData.lightingData.photoperiod.hours
      }
    },
    environmentalNeeds: {
      temperature: {
        day: researchData.environmentalData.temperature.day[1],
        night: researchData.environmentalData.temperature.night[1]
      },
      humidity: researchData.environmentalData.humidity.range[1],
      co2: researchData.environmentalData.co2?.enriched || 800,
      vpd: { min: 0.9, max: 1.4 }
    }
  });

  // Determine architecture type
  let architectureType: any = 'bushy';
  if (researchData.growthData.height.mature > 60) {
    architectureType = 'vining';
  } else if (researchData.growthData.height.mature < 8) {
    architectureType = 'rosette';
  } else if (researchData.cropName.toLowerCase().includes('strawberry')) {
    architectureType = 'spreading';
  }

  return {
    id,
    commonName: researchData.cropName,
    scientificName: researchData.scientificName,
    category: determineCategory(researchData.cropName),
    architecture: {
      type: architectureType,
      matureHeight: researchData.growthData.height.mature,
      matureWidth: researchData.growthData.height.mature * 0.8,
      canopyShape: architectureType === 'rosette' ? 'round' : 'irregular',
      stemCount: 1,
      leafAreaIndex: 2.5,
      lightPenetration: 50
    },
    growthStages: stages,
    spacing: {
      inRow: researchData.growthData.spacing.optimal,
      betweenRows: researchData.growthData.spacing.optimal * 1.5,
      plantsPerSqFt: Math.round(144 / (researchData.growthData.spacing.optimal * researchData.growthData.spacing.optimal))
    },
    lightingStrategies: {
      topLighting: {
        optimal: true,
        fixtures: researchData.lightingData.ppfd.optimal > 400 ? 'overhead' : 'close-canopy',
        heightAboveCanopy: researchData.lightingData.ppfd.optimal > 400 ? 36 : 18
      },
      // Add interlighting for tall crops
      ...(researchData.growthData.height.mature > 48 ? {
        interLighting: {
          recommended: true,
          layers: Math.floor(researchData.growthData.height.mature / 60),
          fixtureType: 'LED-bar',
          positioning: 'between-rows',
          startStage: 'vegetative'
        }
      } : {}),
      // Add under-canopy for certain crops
      ...(researchData.cropName.toLowerCase().includes('cannabis') || 
          researchData.cropName.toLowerCase().includes('strawberry') ? {
        underCanopy: {
          beneficial: true,
          targetArea: researchData.cropName.toLowerCase().includes('cannabis') ? 'lower-leaves' : 'fruit-zone',
          spectrum: researchData.lightingData.spectrum?.farRed ? 'far-red' : 'red-heavy',
          timing: 'continuous'
        }
      } : {})
    },
    yieldModel: {
      baseYield: estimateYield(researchData),
      lightResponseCurve: researchData.lightingData.ppfd.max > 600 ? 'logarithmic' : 'linear',
      optimalDLI: researchData.lightingData.dli.optimal,
      maxDLI: researchData.lightingData.dli.max
    }
  };
}

function determineCategory(cropName: string): AdvancedCropSpec['category'] {
  const name = cropName.toLowerCase();
  if (name.includes('lettuce') || name.includes('spinach') || name.includes('kale')) return 'leafy';
  if (name.includes('tomato') || name.includes('pepper') || name.includes('cucumber') || name.includes('strawberry')) return 'fruiting';
  if (name.includes('basil') || name.includes('cilantro') || name.includes('herb')) return 'herb';
  if (name.includes('cannabis')) return 'flower';
  return 'specialty';
}

function estimateYield(researchData: any): number {
  // Estimate yield based on crop type and cycle length
  const cycleDays = 35; // Average
  const plantsPerSqM = researchData.growthData.spacing.plantsPerSqMeter || 10;
  
  // Rough estimates g/plant/cycle
  const cropYields: Record<string, number> = {
    'lettuce': 150,
    'spinach': 100,
    'kale': 200,
    'basil': 80,
    'cilantro': 50,
    'tomato': 500,
    'pepper': 300,
    'cucumber': 800,
    'strawberry': 150,
    'cannabis': 500,
    'microgreens': 20
  };

  for (const [crop, yieldVal] of Object.entries(cropYields)) {
    if (researchData.cropName.toLowerCase().includes(crop)) {
      return yieldVal;
    }
  }
  
  return 100; // Default
}

// Generate specs for all research-backed crops
export const EXPANDED_CROP_SPECIFICATIONS: Record<string, AdvancedCropSpec> = {};

Object.entries(RESEARCH_BACKED_CROPS).forEach(([id, researchData]) => {
  const spec = generateCropSpecFromResearch(id, researchData);
  if (spec) {
    EXPANDED_CROP_SPECIFICATIONS[id] = spec;
  }
});

// Export complete list of available crops
export const AVAILABLE_CROPS = Object.keys(EXPANDED_CROP_SPECIFICATIONS).map(id => ({
  id,
  name: EXPANDED_CROP_SPECIFICATIONS[id].commonName,
  scientificName: EXPANDED_CROP_SPECIFICATIONS[id].scientificName,
  category: EXPANDED_CROP_SPECIFICATIONS[id].category,
  height: EXPANDED_CROP_SPECIFICATIONS[id].architecture.matureHeight,
  researchBacked: true
})).sort((a, b) => a.name.localeCompare(b.name));

// Group crops by category for UI
export const CROPS_BY_CATEGORY = {
  leafy: AVAILABLE_CROPS.filter(c => c.category === 'leafy'),
  fruiting: AVAILABLE_CROPS.filter(c => c.category === 'fruiting'),
  herb: AVAILABLE_CROPS.filter(c => c.category === 'herb'),
  flower: AVAILABLE_CROPS.filter(c => c.category === 'flower'),
  specialty: AVAILABLE_CROPS.filter(c => c.category === 'specialty')
};

// Quick lookup for common names
export const CROP_NAME_MAPPING: Record<string, string> = {
  'lettuce': 'butterhead-lettuce',
  'romaine': 'romaine-lettuce',
  'spinach': 'spinach',
  'kale': 'kale',
  'basil': 'genovese-basil',
  'cilantro': 'cilantro',
  'tomato': 'high-wire-tomato',
  'tomatoes': 'high-wire-tomato',
  'pepper': 'bell-pepper',
  'peppers': 'bell-pepper',
  'cucumber': 'cucumber',
  'cucumbers': 'cucumber',
  'strawberry': 'strawberry',
  'strawberries': 'strawberry',
  'cannabis': 'cannabis-sativa',
  'hemp': 'cannabis-sativa',
  'microgreens': 'microgreens-mix',
  'mushroom': 'mushrooms-oyster',
  'mushrooms': 'mushrooms-oyster',
  'saffron': 'saffron',
  'wasabi': 'wasabi'
};