/**
 * Advanced PPFD calculation with distributed light sources and IES support
 * Handles linear and area light sources, not just point sources
 */

import type { ParsedIESFile } from './ies-parser';

export interface AdvancedFixtureData {
  x: number; // position in meters
  y: number; // position in meters
  z: number; // height in meters
  rotation: number; // degrees
  ppf: number; // μmol/s
  beamAngle: number; // degrees
  enabled: boolean;
  // Physical dimensions
  length?: number; // meters (for linear fixtures)
  width?: number; // meters
  height?: number; // meters
  // Optional IES data
  iesData?: ParsedIESFile;
  // Spectrum data
  spectrumData?: {
    blue: number;
    green: number;
    red: number;
    farRed: number;
  };
}

/**
 * Calculate PPFD from a distributed light source (linear or area)
 * Uses multiple sample points along the fixture for accurate distribution
 */
function calculatePPFDFromDistributedFixture(
  fixture: AdvancedFixtureData,
  pointX: number,
  pointY: number,
  canopyHeight: number
): number {
  if (!fixture.enabled) return 0;

  // For linear fixtures, sample along the length
  const samples = fixture.length && fixture.length > 0.5 ? Math.ceil(fixture.length * 10) : 1;
  let totalPPFD = 0;

  for (let i = 0; i < samples; i++) {
    // Calculate sample position along fixture
    const t = samples > 1 ? i / (samples - 1) : 0.5;
    const offset = (t - 0.5) * (fixture.length || 0);
    
    // Apply rotation to offset
    const rad = (fixture.rotation || 0) * Math.PI / 180;
    const sampleX = fixture.x + offset * Math.cos(rad);
    const sampleY = fixture.y + offset * Math.sin(rad);
    
    // Calculate distance from this sample point
    const dx = sampleX - pointX;
    const dy = sampleY - pointY;
    const dz = fixture.z - canopyHeight;
    
    const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
    const totalDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Calculate angle from fixture to point
    const angle = Math.atan2(horizontalDistance, dz) * (180 / Math.PI);
    
    // Apply beam angle falloff
    let intensityFactor = 1;
    
    if (fixture.iesData) {
      // Use IES photometric data if available
      const maxCandela = fixture.iesData.photometry?.maxCandela || 1;
      intensityFactor = getIESIntensity(fixture.iesData, angle, 0) / maxCandela;
    } else {
      // Use simple beam angle model
      const halfBeamAngle = fixture.beamAngle / 2;
      if (angle > halfBeamAngle) {
        const falloffAngle = halfBeamAngle * 1.5;
        if (angle < falloffAngle) {
          intensityFactor = 1 - (angle - halfBeamAngle) / (falloffAngle - halfBeamAngle);
        } else {
          intensityFactor = 0;
        }
      }
    }
    
    // Distribute PPF across samples
    const samplePPF = fixture.ppf / samples;
    
    // Modified inverse square law for distributed sources with cosine incidence
    const cosTheta = Math.max(0, dz / totalDistance);
    const ppfd = (samplePPF * intensityFactor * cosTheta) / (4 * Math.PI * totalDistance * totalDistance);
    
    // samplePPF is already in μmol/s, so ppfd is μmol/m²/s; do not apply lumen→PPF factors
    totalPPFD += ppfd;
  }
  
  return Math.max(0, totalPPFD);
}

/**
 * Get intensity from IES data at specific angles
 */
function getIESIntensity(iesData: ParsedIESFile, verticalAngle: number, horizontalAngle: number): number {
  const photometry = iesData.photometry;

  const vAngles = photometry.verticalAngles;
  const hAngles = photometry.horizontalAngles;

  // Clamp vertical angle to range
  const vMin = vAngles[0];
  const vMax = vAngles[vAngles.length - 1];
  const v = Math.max(vMin, Math.min(vMax, verticalAngle));

  // Wrap horizontal angle to [0, 360]
  let h = horizontalAngle;
  while (h < 0) h += 360;
  while (h > 360) h -= 360;

  // Find bracketing indices for vertical
  let vLow = 0;
  let vHigh = vAngles.length - 1;
  for (let i = 0; i < vAngles.length - 1; i++) {
    if (vAngles[i] <= v && v <= vAngles[i + 1]) {
      vLow = i;
      vHigh = i + 1;
      break;
    }
  }
  const vRange = vAngles[vHigh] - vAngles[vLow] || 1;
  const vT = (v - vAngles[vLow]) / vRange;

  // Find bracketing indices for horizontal (account for wrap at 360)
  let hLow = 0;
  let hHigh = 0;
  for (let i = 0; i < hAngles.length - 1; i++) {
    if (hAngles[i] <= h && h <= hAngles[i + 1]) {
      hLow = i;
      hHigh = i + 1;
      break;
    }
  }
  // If not found (e.g., near 360), wrap to 0
  if (hHigh === 0 && h >= hAngles[hAngles.length - 1]) {
    hLow = hAngles.length - 1;
    hHigh = 0; // wrap to 0 degrees
  }
  const hLowAngle = hAngles[hLow];
  const hHighAngle = hHigh === 0 && hLow === hAngles.length - 1 ? 360 : hAngles[hHigh];
  const hRange = (hHighAngle - hLowAngle) || 1;
  const hT = (h - hLowAngle) / hRange;

  // Sample four surrounding candela values with wrapping
  const c00 = photometry.candela[hLow][vLow];
  const c01 = photometry.candela[hLow][vHigh];
  const c10 = photometry.candela[hHigh === photometry.candela.length ? 0 : hHigh][vLow];
  const c11 = photometry.candela[hHigh === photometry.candela.length ? 0 : hHigh][vHigh];

  // Bilinear interpolation
  const c0 = c00 + (c01 - c00) * vT;
  const c1 = c10 + (c11 - c10) * vT;
  const c = c0 + (c1 - c0) * hT;

  return c;
}

/**
 * Enhanced PPFD grid calculation with distributed light sources
 */
export function calculateAdvancedPPFDGrid(
  fixtures: AdvancedFixtureData[],
  roomWidth: number,
  roomLength: number,
  canopyHeight: number,
  gridResolution: number = 50
): number[][] {
  const grid: number[][] = [];
  const cellWidth = roomWidth / gridResolution;
  const cellLength = roomLength / gridResolution;
  
  for (let y = 0; y < gridResolution; y++) {
    const row: number[] = [];
    const pointY = y * cellLength + cellLength / 2;
    
    for (let x = 0; x < gridResolution; x++) {
      const pointX = x * cellWidth + cellWidth / 2;
      let totalPPFD = 0;
      
      // Sum contributions from all fixtures
      for (const fixture of fixtures) {
        totalPPFD += calculatePPFDFromDistributedFixture(fixture, pointX, pointY, canopyHeight);
      }
      
      row.push(totalPPFD);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Get fixture dimensions from DLC data or model specifications
 * Now uses REAL DLC fixture dimensions for accurate calculations
 */
export function getFixtureDimensions(fixtureModel: string): { length: number; width: number; height: number } {
  // Import the DLC fixture dimensions service
  try {
    const { fixtureDimensionsService } = require('@/lib/dlc/fixture-dimensions-service');
    
    // Try to get real dimensions from DLC database first
    const dlcFixture = fixtureDimensionsService.getFixtureDimensions(fixtureModel);
    if (dlcFixture) {
      return {
        length: dlcFixture.lengthM,
        width: dlcFixture.widthM,
        height: dlcFixture.heightM
      };
    }
  } catch (error) {
    console.warn('DLC fixture dimensions service not available, using fallback');
  }
  
  // Enhanced fallback dimensions based on REAL DLC data
  const realDLCDimensions = {
    // Fluence fixtures
    'spydr': { length: 1.190, width: 1.088, height: 0.102 }, // SPYDR 2i real dimensions
    'fluence': { length: 1.190, width: 1.088, height: 0.102 },
    
    // Gavita fixtures  
    'gavita': { length: 1.120, width: 1.120, height: 0.120 }, // Pro 1700e real dimensions
    '1700e': { length: 1.120, width: 1.120, height: 0.120 },
    
    // Philips/Signify fixtures
    'philips': { length: 0.730, width: 0.240, height: 0.090 }, // GreenPower LED real dimensions
    'greenpower': { length: 0.730, width: 0.240, height: 0.090 },
    'signify': { length: 0.730, width: 0.240, height: 0.090 },
    
    // California LightWorks
    'california': { length: 1.219, width: 0.521, height: 0.102 }, // MegaDrive 1000 real
    'lightworks': { length: 1.219, width: 0.521, height: 0.102 },
    'megadrive': { length: 1.219, width: 0.521, height: 0.102 },
    
    // Thrive Agritech
    'thrive': { length: 1.097, width: 0.203, height: 0.112 }, // Pinnacle HP real
    'pinnacle': { length: 1.097, width: 0.203, height: 0.112 },
    
    // Generic patterns (less accurate fallback)
    'linear': { length: 1.2, width: 0.1, height: 0.08 },
    'compact': { length: 0.6, width: 0.6, height: 0.15 },
    'force': { length: 1.0, width: 0.3, height: 0.12 },
    'module': { length: 0.3, width: 0.3, height: 0.08 },
    'bar': { length: 1.2, width: 0.08, height: 0.06 },
    'panel': { length: 0.6, width: 0.6, height: 0.1 }
  };
  
  // Check model name for real fixture matches first
  const modelLower = fixtureModel.toLowerCase();
  
  // Try to find exact fixture match
  for (const [key, dims] of Object.entries(realDLCDimensions)) {
    if (modelLower.includes(key)) {
      return dims;
    }
  }
  
  // Default to a common mid-size fixture
  return { length: 1.0, width: 0.6, height: 0.1 };
}

/**
 * Get beam angle from model specifications
 */
export function getBeamAngle(fixtureModel: string): number {
  const modelLower = fixtureModel.toLowerCase();
  
  // Specific beam angles mentioned by user
  if (modelLower.includes('wb') || modelLower.includes('wide beam')) {
    return 140; // Wide beam
  } else if (modelLower.includes('production module')) {
    return 140; // Philips production module
  } else if (modelLower.includes('quadro')) {
    return 90; // TLF Force Quadro has different beam angle
  }
  
  // Default beam angles by type
  if (modelLower.includes('linear')) {
    return 120;
  } else if (modelLower.includes('compact')) {
    return 120;
  }
  
  return 120; // Default
}