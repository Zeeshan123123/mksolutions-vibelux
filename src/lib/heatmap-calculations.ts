/**
 * Heatmap and Lighting Calculations
 * Advanced photometric calculations for greenhouse design
 */

export interface HeatmapPoint {
  x: number;
  y: number;
  ppfd: number;
  dli: number;
  temperature?: number;
  efficiency?: number;
}

export interface SpectrumDataPoint {
  wavelength: number;
  intensity: number;
  color: string;
}

export interface LightSource {
  id: string;
  x: number;
  y: number;
  type: string;
  power: number;
  ppfd: number;
  efficiency: number;
  spectrum?: {
    red: number;
    blue: number;
    green: number;
    farRed: number;
    uv: number;
  };
}

export interface SpaceConfig {
  width: number;
  height: number;
  plantHeight?: number;
  reflectivity?: number;
}

/**
 * Calculate PPFD at a specific point given light sources
 */
export function calculatePPFD(
  x: number, 
  y: number, 
  lightSources: LightSource[], 
  spaceConfig: SpaceConfig
): number {
  let totalPPFD = 0;
  
  for (const light of lightSources) {
    // Distance from light to point
    const distance = Math.sqrt(
      Math.pow(x - light.x, 2) + Math.pow(y - light.y, 2)
    );
    
    // Inverse square law with minimum distance to avoid infinite values
    const effectiveDistance = Math.max(distance, 0.1);
    const distanceFactor = 1 / Math.pow(effectiveDistance, 2);
    
    // Light distribution pattern (simplified cosine distribution)
    const angle = Math.atan2(Math.abs(y - light.y), Math.abs(x - light.x));
    const angleFactor = Math.cos(angle);
    
    // Wall reflection factor (simplified)
    const reflectionFactor = spaceConfig.reflectivity || 0.8;
    const wallReflection = calculateWallReflection(x, y, spaceConfig) * reflectionFactor * 0.1;
    
    // Calculate PPFD contribution from this light
    const lightPPFD = light.ppfd * distanceFactor * angleFactor + wallReflection;
    totalPPFD += Math.max(lightPPFD, 0);
  }
  
  return Math.round(totalPPFD);
}

/**
 * Calculate Daily Light Integral (DLI) from PPFD
 */
export function calculateDLI(ppfd: number, photoperiod: number = 18): number {
  // DLI = PPFD × photoperiod × 0.0036 (conversion factor)
  return Math.round(ppfd * photoperiod * 0.0036 * 100) / 100;
}

/**
 * Generate spectrum data for visualization
 */
export function generateSpectrumData(lightSources: LightSource[]): SpectrumDataPoint[] {
  const spectrumData: SpectrumDataPoint[] = [];
  
  // Standard wavelength ranges
  const wavelengths = [
    { range: [380, 430], color: '#8B00FF', name: 'UV/Violet' },
    { range: [430, 490], color: '#0000FF', name: 'Blue' },
    { range: [490, 560], color: '#00FF00', name: 'Green' },
    { range: [560, 590], color: '#FFFF00', name: 'Yellow' },
    { range: [590, 630], color: '#FFA500', name: 'Orange' },
    { range: [630, 700], color: '#FF0000', name: 'Red' },
    { range: [700, 800], color: '#800000', name: 'Far Red' }
  ];
  
  for (const waveRange of wavelengths) {
    let totalIntensity = 0;
    
    for (const light of lightSources) {
      if (light.spectrum) {
        // Map spectrum values to wavelength ranges
        switch (waveRange.name) {
          case 'UV/Violet':
            totalIntensity += light.spectrum.uv || 0;
            break;
          case 'Blue':
            totalIntensity += light.spectrum.blue || 0;
            break;
          case 'Green':
            totalIntensity += light.spectrum.green || 0;
            break;
          case 'Red':
            totalIntensity += light.spectrum.red || 0;
            break;
          case 'Far Red':
            totalIntensity += light.spectrum.farRed || 0;
            break;
          default:
            totalIntensity += (light.spectrum.green || 0) * 0.3; // Default fallback
        }
      } else {
        // Default spectrum distribution if no spectrum data
        totalIntensity += light.ppfd * 0.1;
      }
    }
    
    spectrumData.push({
      wavelength: (waveRange.range[0] + waveRange.range[1]) / 2,
      intensity: Math.round(totalIntensity),
      color: waveRange.color
    });
  }
  
  return spectrumData;
}

/**
 * Optimize light placement using genetic algorithm approximation
 */
export function optimizeLightPlacement(
  currentLights: LightSource[],
  spaceConfig: SpaceConfig,
  targetPPFD: number = 400
): LightSource[] {
  const optimizedLights = [...currentLights];
  const iterations = 10;
  
  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < optimizedLights.length; j++) {
      const light = optimizedLights[j];
      const currentScore = calculateUniformityScore(optimizedLights, spaceConfig, targetPPFD);
      
      // Try small position adjustments
      const adjustments = [
        { x: 0.1, y: 0 },
        { x: -0.1, y: 0 },
        { x: 0, y: 0.1 },
        { x: 0, y: -0.1 }
      ];
      
      let bestAdjustment = { x: 0, y: 0 };
      let bestScore = currentScore;
      
      for (const adj of adjustments) {
        const testLight = {
          ...light,
          x: Math.max(0, Math.min(spaceConfig.width, light.x + adj.x)),
          y: Math.max(0, Math.min(spaceConfig.height, light.y + adj.y))
        };
        
        const testLights = [...optimizedLights];
        testLights[j] = testLight;
        
        const score = calculateUniformityScore(testLights, spaceConfig, targetPPFD);
        
        if (score > bestScore) {
          bestScore = score;
          bestAdjustment = adj;
        }
      }
      
      // Apply best adjustment
      if (bestScore > currentScore) {
        optimizedLights[j] = {
          ...light,
          x: Math.max(0, Math.min(spaceConfig.width, light.x + bestAdjustment.x)),
          y: Math.max(0, Math.min(spaceConfig.height, light.y + bestAdjustment.y))
        };
      }
    }
  }
  
  return optimizedLights;
}

/**
 * Calculate wall reflection contribution
 */
function calculateWallReflection(x: number, y: number, spaceConfig: SpaceConfig): number {
  const { width, height } = spaceConfig;
  
  // Distance to nearest walls
  const distToLeft = x;
  const distToRight = width - x;
  const distToTop = y;
  const distToBottom = height - y;
  
  const minDistance = Math.min(distToLeft, distToRight, distToTop, distToBottom);
  
  // Reflection decreases with distance from walls
  return Math.max(0, (1 - minDistance / Math.min(width, height)) * 0.2);
}

/**
 * Calculate uniformity score for light distribution
 */
function calculateUniformityScore(
  lights: LightSource[], 
  spaceConfig: SpaceConfig, 
  targetPPFD: number
): number {
  const samplePoints = 25; // 5x5 grid
  const stepX = spaceConfig.width / (Math.sqrt(samplePoints) - 1);
  const stepY = spaceConfig.height / (Math.sqrt(samplePoints) - 1);
  
  const ppfdValues: number[] = [];
  
  for (let i = 0; i < Math.sqrt(samplePoints); i++) {
    for (let j = 0; j < Math.sqrt(samplePoints); j++) {
      const x = i * stepX;
      const y = j * stepY;
      const ppfd = calculatePPFD(x, y, lights, spaceConfig);
      ppfdValues.push(ppfd);
    }
  }
  
  // Calculate coefficient of variation (lower is better)
  const mean = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
  const variance = ppfdValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / ppfdValues.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;
  
  // Score based on uniformity and target achievement
  const uniformityScore = Math.max(0, 1 - cv);
  const targetScore = Math.max(0, 1 - Math.abs(mean - targetPPFD) / targetPPFD);
  
  return (uniformityScore + targetScore) / 2;
}

/**
 * Generate heatmap data for a given space and light configuration
 */
export function generateHeatmapData(
  lightSources: LightSource[],
  spaceConfig: SpaceConfig,
  resolution: number = 20
): HeatmapPoint[] {
  const heatmapData: HeatmapPoint[] = [];
  const stepX = spaceConfig.width / resolution;
  const stepY = spaceConfig.height / resolution;
  
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const x = i * stepX;
      const y = j * stepY;
      const ppfd = calculatePPFD(x, y, lightSources, spaceConfig);
      const dli = calculateDLI(ppfd);
      
      heatmapData.push({
        x,
        y,
        ppfd,
        dli,
        efficiency: ppfd > 0 ? Math.min(100, (ppfd / 600) * 100) : 0
      });
    }
  }
  
  return heatmapData;
}

/**
 * Calculate energy metrics for the lighting system
 */
export function calculateEnergyMetrics(lightSources: LightSource[]) {
  const totalPower = lightSources.reduce((sum, light) => sum + light.power, 0);
  const totalPPFD = lightSources.reduce((sum, light) => sum + light.ppfd, 0);
  const avgEfficiency = lightSources.length > 0 
    ? lightSources.reduce((sum, light) => sum + light.efficiency, 0) / lightSources.length 
    : 0;
  
  return {
    totalPower: Math.round(totalPower),
    totalPPFD: Math.round(totalPPFD),
    averageEfficiency: Math.round(avgEfficiency * 100) / 100,
    ppfdPerWatt: totalPower > 0 ? Math.round((totalPPFD / totalPower) * 100) / 100 : 0,
    dailyEnergyUsage: Math.round(totalPower * 18 / 1000 * 100) / 100, // 18 hour photoperiod, kWh
    monthlyCost: Math.round(totalPower * 18 * 30 * 0.12 / 1000 * 100) / 100 // $0.12/kWh estimate
  };
}

/**
 * Calculate detailed heatmap for advanced design page
 */
export function calculateDetailedHeatmap(
  lightSources: LightSource[],
  length: number,
  width: number,
  resolution: number = 30
): HeatmapPoint[] {
  const spaceConfig: SpaceConfig = {
    width,
    height: length, // Note: height here represents length in space
    plantHeight: 0.5, // Default plant height
    reflectivity: 0.8
  };
  
  return generateHeatmapData(lightSources, spaceConfig, resolution);
}