import type { LightSource } from './lighting-design'
import type { ParsedIESFile } from './ies-parser'

// Enhanced light source with IES data support
export interface EnhancedLightSource extends LightSource {
  iesFile?: ParsedIESFile // Real measured photometric data
  useIES?: boolean // Flag to prefer IES over geometric approximation
}

// Memoization cache for PPFD calculations
const ppfdCache = new Map<string, number>()
const iesCache = new Map<string, number>()

// Generate cache key for PPFD calculation
function generateCacheKey(x: number, y: number, source: LightSource): string {
  return `${x},${y}-${source.position.x},${source.position.y},${source.ppf},${source.beamAngle},${source.height}`
}

// Generate cache key for IES-based calculation
function generateIESCacheKey(x: number, y: number, source: EnhancedLightSource): string {
  const iesId = source.iesFile?.header.filename || 'none'
  return `ies-${x},${y}-${source.position.x},${source.position.y},${source.ppf},${source.height}-${iesId}`
}

// Calculate PPFD using real IES photometric data
function calculatePPFDFromIES(
  x: number,
  y: number,
  source: EnhancedLightSource
): number {
  if (!source.iesFile || !source.useIES) {
    return 0
  }

  const cacheKey = generateIESCacheKey(x, y, source)
  if (iesCache.has(cacheKey)) {
    return iesCache.get(cacheKey)!
  }

  const { photometry } = source.iesFile
  const { verticalAngles, horizontalAngles, candelaMatrix } = photometry

  // Calculate distance and angles from source to point
  const dx = x - source.position.x
  const dy = y - source.position.y
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy)
  const totalDistance = Math.sqrt(
    horizontalDistance * horizontalDistance + 
    source.height * source.height
  )

  // Calculate vertical angle (from nadir downward)
  const verticalAngle = Math.atan(horizontalDistance / source.height) * (180 / Math.PI)
  
  // Calculate horizontal angle (rotation around vertical axis)
  const horizontalAngle = Math.atan2(dy, dx) * (180 / Math.PI)
  const normalizedHorizontalAngle = ((horizontalAngle % 360) + 360) % 360

  // Find nearest angles in IES data
  const verticalIndex = findNearestAngleIndex(verticalAngles, verticalAngle)
  const horizontalIndex = findNearestAngleIndex(horizontalAngles, normalizedHorizontalAngle)

  // Get candela value with interpolation
  const candela = interpolateCandelaValue(
    photometry,
    verticalAngle,
    normalizedHorizontalAngle,
    verticalIndex,
    horizontalIndex
  )

  // Convert candela-based angular shape to a normalized intensity factor, and scale by PPF.
  // We do NOT convert lumens to μmol. Use PPF directly for horticulture.
  const distanceFactorSq = 1 / (totalDistance * totalDistance)
  const cosVerticalAngle = Math.cos(verticalAngle * Math.PI / 180)
  const maxCandela = Math.max(1, Math.max(...candelaMatrix.flat()))
  const intensityFactor = candela / maxCandela
  // Base PPFD from inverse square and incidence angle
  const base = distanceFactorSq * cosVerticalAngle
  // Scale by source PPF (μmol/s) assuming point source at this location
  const ppfd = source.ppf * intensityFactor * base

  iesCache.set(cacheKey, ppfd)
  return ppfd
}

// Find nearest angle index in IES data
function findNearestAngleIndex(angles: number[], targetAngle: number): number {
  if (angles.length === 0) return 0
  
  let nearestIndex = 0
  let minDifference = Math.abs(angles[0] - targetAngle)
  
  for (let i = 1; i < angles.length; i++) {
    const difference = Math.abs(angles[i] - targetAngle)
    if (difference < minDifference) {
      minDifference = difference
      nearestIndex = i
    }
  }
  
  return nearestIndex
}

// Interpolate candela value between nearest IES data points
function interpolateCandelaValue(
  photometry: ParsedIESFile['photometry'],
  verticalAngle: number,
  horizontalAngle: number,
  verticalIndex: number,
  horizontalIndex: number
): number {
  const { verticalAngles, horizontalAngles, candelaMatrix } = photometry
  
  // Simple nearest-neighbor for now - could be enhanced with bilinear interpolation
  const candela = candelaMatrix[horizontalIndex]?.[verticalIndex] || 0
  
  // If we're near the edges, try bilinear interpolation
  if (verticalIndex < verticalAngles.length - 1 && horizontalIndex < horizontalAngles.length - 1) {
    const v1 = verticalAngles[verticalIndex]
    const v2 = verticalAngles[verticalIndex + 1]
    const h1 = horizontalAngles[horizontalIndex]
    const h2 = horizontalAngles[horizontalIndex + 1]
    
    if (v2 !== v1 && h2 !== h1) {
      // Bilinear interpolation
      const c11 = candelaMatrix[horizontalIndex]?.[verticalIndex] || 0
      const c12 = candelaMatrix[horizontalIndex]?.[verticalIndex + 1] || 0
      const c21 = candelaMatrix[horizontalIndex + 1]?.[verticalIndex] || 0
      const c22 = candelaMatrix[horizontalIndex + 1]?.[verticalIndex + 1] || 0
      
      const t1 = (verticalAngle - v1) / (v2 - v1)
      const t2 = (horizontalAngle - h1) / (h2 - h1)
      
      const interpolated = 
        c11 * (1 - t1) * (1 - t2) +
        c12 * t1 * (1 - t2) +
        c21 * (1 - t1) * t2 +
        c22 * t1 * t2
      
      return interpolated
    }
  }
  
  return candela
}

// Calculate PPFD at a single point from a single source (with memoization)
export function calculatePPFDAtPoint(
  x: number,
  y: number,
  source: LightSource | EnhancedLightSource
): number {
  // Check if this is an enhanced source with IES data
  const enhancedSource = source as EnhancedLightSource
  if (enhancedSource.iesFile && enhancedSource.useIES) {
    return calculatePPFDFromIES(x, y, enhancedSource)
  }

  // Check if this is a linear fixture that should be modeled as distributed source
  if (source.fixture?.length && source.fixture.length > 1) {
    return calculateDistributedPPFD(x, y, source)
  }

  // Fall back to point source geometric approximation
  return calculatePointSourcePPFD(x, y, source)
}


// Calculate PPFD for distributed linear light sources
function calculateDistributedPPFD(
  x: number,
  y: number,
  source: LightSource
): number {
  const fixtureLength = source.fixture?.length || 1
  const segments = Math.max(Math.ceil(fixtureLength * 2), 8) // 2 segments per foot, minimum 8
  const segmentLength = fixtureLength / segments
  const ppfPerSegment = source.ppf / segments
  
  let totalPPFD = 0
  
  // Assume linear fixture is oriented along X-axis (can be enhanced later for rotation)
  const startX = source.position.x - (fixtureLength / 2)
  
  for (let i = 0; i < segments; i++) {
    const segmentX = startX + (i + 0.5) * segmentLength
    const segmentY = source.position.y
    
    // Create virtual point source for this segment
    const segmentSource: LightSource = {
      position: { x: segmentX, y: segmentY },
      ppf: ppfPerSegment,
      beamAngle: source.beamAngle,
      height: source.height,
      enabled: source.enabled
    }
    
    totalPPFD += calculatePointSourcePPFD(x, y, segmentSource)
  }
  
  return totalPPFD
}

// Point source PPFD calculation (original logic)
function calculatePointSourcePPFD(
  x: number,
  y: number,
  source: LightSource
): number {
  const cacheKey = generateCacheKey(x, y, source)
  
  if (ppfdCache.has(cacheKey)) {
    return ppfdCache.get(cacheKey)!
  }

  // Distance from light source
  const dx = x - source.position.x
  const dy = y - source.position.y
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy)
  const totalDistance = Math.sqrt(
    horizontalDistance * horizontalDistance + 
    source.height * source.height
  )

  // Angle from vertical
  const angle = Math.atan(horizontalDistance / source.height) * (180 / Math.PI)

  // Apply beam angle falloff using cosine-squared for more realistic distribution
  const halfBeamAngle = source.beamAngle / 2
  let intensity = 1.0
  
  if (angle <= halfBeamAngle) {
    // Within beam angle - use cosine-squared falloff for more realistic distribution
    intensity = Math.pow(Math.cos(angle * Math.PI / 180), 2)
  } else {
    // Outside beam angle - smooth falloff to zero
    const falloffAngle = halfBeamAngle * 1.2 // 20% extension for soft edge
    if (angle < falloffAngle) {
      const falloffRatio = (angle - halfBeamAngle) / (falloffAngle - halfBeamAngle)
      intensity = Math.pow(Math.cos(halfBeamAngle * Math.PI / 180), 2) * (1 - falloffRatio)
    } else {
      intensity = 0
    }
  }

  // Inverse square law
  const distanceFactor = 1 / (totalDistance * totalDistance)
  
  // For horticultural calculations, use realistic approach
  // PPFD = PPF × intensity × distance factor × cosine of incident angle
  const cosineIncidentAngle = source.height / totalDistance
  const ppfd = source.ppf * intensity * distanceFactor * cosineIncidentAngle

  ppfdCache.set(cacheKey, ppfd)
  return ppfd
}

// Optimized PPFD grid calculation
export function calculateOptimizedPPFDGrid(
  width: number,
  height: number,
  sources: LightSource[],
  resolution: number = 50
): number[][] {
  const gridWidth = Math.ceil(width * resolution / 10)
  const gridHeight = Math.ceil(height * resolution / 10)
  const grid: number[][] = []

  // Pre-calculate step sizes
  const xStep = width / gridWidth
  const yStep = height / gridHeight

  for (let y = 0; y < gridHeight; y++) {
    const row: number[] = []
    const yPos = y * yStep + yStep / 2

    for (let x = 0; x < gridWidth; x++) {
      const xPos = x * xStep + xStep / 2
      let totalPPFD = 0

      // Sum contributions from all light sources
      for (const source of sources) {
        totalPPFD += calculatePPFDAtPoint(xPos, yPos, source)
      }

      row.push(totalPPFD)
    }
    grid.push(row)
  }

  return grid
}

// Clear cache when needed (e.g., when fixtures change significantly)
export function clearPPFDCache(): void {
  ppfdCache.clear()
}

// Clear IES calculation cache
export function clearIESCache(): void {
  iesCache.clear()
}

// Clear all caches
export function clearAllCaches(): void {
  ppfdCache.clear()
  iesCache.clear()
}

// Create an enhanced light source with IES data
export function createEnhancedLightSource(
  source: LightSource,
  iesFile?: ParsedIESFile,
  useIES: boolean = true
): EnhancedLightSource {
  return {
    ...source,
    iesFile,
    useIES: useIES && !!iesFile
  }
}

// Convert IES photometric data to PPFD scaling factor
export function calculateIESScalingFactor(iesFile: ParsedIESFile, targetPPF: number): number {
  const { photometry } = iesFile
  // Use maximum candela as shape normalization; scaling handled by PPF selection
  const maxCandela = Math.max(1, Math.max(...photometry.candelaMatrix.flat()))
  // Keep factor at 1.0 since we scale by PPF externally; maintain API compatibility
  return targetPPF > 0 && maxCandela > 0 ? 1.0 : 1.0
}

// Validate IES data compatibility with light source
export function validateIESCompatibility(
  source: LightSource,
  iesFile: ParsedIESFile
): { compatible: boolean; warnings: string[] } {
  const warnings: string[] = []
  let compatible = true
  
  const { analysis } = iesFile.photometry
  
  // Check beam angle compatibility
  const iesBeamAngle = analysis.beamAngle
  const sourceBeamAngle = source.beamAngle
  
  if (Math.abs(iesBeamAngle - sourceBeamAngle) > 20) {
    warnings.push(`Beam angle mismatch: IES has ${iesBeamAngle.toFixed(1)}°, source has ${sourceBeamAngle}°`)
  }
  
  // Check for reasonable photometric data
  if (analysis.peak < 10) {
    warnings.push('Very low peak intensity in IES file - may not be suitable for horticultural applications')
    compatible = false
  }
  
  if (iesFile.photometry.totalLumens < 100) {
    warnings.push('Very low lumen output in IES file')
  }
  
  return { compatible, warnings }
}

// Calculate uniformity metrics with optimizations
export function calculateUniformityMetrics(grid: number[][]): {
  average: number
  min: number
  max: number
  uniformity: number
  cv: number // Coefficient of variation
} {
  if (grid.length === 0 || grid[0].length === 0) {
    return { average: 0, min: 0, max: 0, uniformity: 0, cv: 0 }
  }

  let sum = 0
  let min = Infinity
  let max = -Infinity
  let count = 0

  // Single pass to calculate min, max, and sum
  for (const row of grid) {
    for (const value of row) {
      sum += value
      min = Math.min(min, value)
      max = Math.max(max, value)
      count++
    }
  }

  const average = count > 0 ? sum / count : 0
  const uniformity = max > 0 ? average / max : 0

  // Calculate coefficient of variation
  let variance = 0
  for (const row of grid) {
    for (const value of row) {
      variance += Math.pow(value - average, 2)
    }
  }
  variance = count > 1 ? variance / (count - 1) : 0
  const cv = average > 0 ? Math.sqrt(variance) / average : 0

  return {
    average: Math.round(average),
    min: Math.round(min),
    max: Math.round(max),
    uniformity: Math.round(uniformity * 100) / 100,
    cv: Math.round(cv * 100) / 100
  }
}

// Calculate coverage area above threshold
export function calculateCoverageArea(
  grid: number[][],
  threshold: number
): number {
  if (grid.length === 0 || grid[0].length === 0) {
    return 0
  }

  let aboveThreshold = 0
  let total = 0

  for (const row of grid) {
    for (const value of row) {
      if (value >= threshold) {
        aboveThreshold++
      }
      total++
    }
  }

  return total > 0 ? (aboveThreshold / total) * 100 : 0
}

// Batch calculate DLI for different photoperiods
export function calculateDLIBatch(
  ppfd: number,
  photoperiods: number[]
): Map<number, number> {
  const dliMap = new Map<number, number>()
  
  for (const photoperiod of photoperiods) {
    // DLI = PPFD × photoperiod × 0.0036
    const dli = ppfd * photoperiod * 0.0036
    dliMap.set(photoperiod, Math.round(dli * 10) / 10)
  }
  
  return dliMap
}

// Calculate DLI (Daily Light Integral) from PPFD and photoperiod
export function calculateDLI(ppfd: number, photoperiod: number): number {
  // DLI = PPFD × photoperiod × 0.0036
  return ppfd * photoperiod * 0.0036
}

// Calculate PPFD from multiple fixtures at a point
export function calculateMultiFixturePPFD(
  x: number,
  y: number,
  fixtures: Array<{
    ppf: number
    x: number
    y: number
    height: number
    beamAngle: number
    beamAngleY?: number // For asymmetric beams
  }>
): number {
  let totalPPFD = 0
  
  for (const fixture of fixtures) {
    const source: LightSource = {
      position: { x: fixture.x, y: fixture.y },
      ppf: fixture.ppf,
      beamAngle: fixture.beamAngle,
      height: fixture.height,
      enabled: true
    }
    totalPPFD += calculatePPFDAtPoint(x, y, source)
  }
  
  return totalPPFD
}

// Generate PPFD heatmap data for visualization
export function generatePPFDHeatmap(
  fixtures: Array<{
    ppf: number
    x: number
    y: number
    height: number
    beamAngle: number
  }>,
  roomWidth: number,
  roomLength: number,
  resolution: number = 0.25
): Array<{ x: number; y: number; ppfd: number }> {
  const data: Array<{ x: number; y: number; ppfd: number }> = []
  
  // Generate grid points
  for (let y = resolution / 2; y < roomLength; y += resolution) {
    for (let x = resolution / 2; x < roomWidth; x += resolution) {
      const ppfd = calculateMultiFixturePPFD(x, y, fixtures)
      data.push({ x, y, ppfd })
    }
  }
  
  return data
}

// Calculate uniformity metrics from PPFD values
export function calculateUniformity(ppfdValues: number[]): {
  min: number
  max: number
  avg: number
  uniformityRatio: number
  cv: number
} {
  if (ppfdValues.length === 0) {
    return { min: 0, max: 0, avg: 0, uniformityRatio: 0, cv: 0 }
  }
  
  const min = Math.min(...ppfdValues)
  const max = Math.max(...ppfdValues)
  const sum = ppfdValues.reduce((a, b) => a + b, 0)
  const avg = sum / ppfdValues.length
  
  // Uniformity ratio (min/avg)
  const uniformityRatio = avg > 0 ? min / avg : 0
  
  // Calculate coefficient of variation (CV)
  const variance = ppfdValues.reduce((sum, value) => {
    return sum + Math.pow(value - avg, 2)
  }, 0) / (ppfdValues.length - 1)
  
  const stdDev = Math.sqrt(variance)
  const cv = avg > 0 ? (stdDev / avg) * 100 : 0
  
  return {
    min: Math.round(min),
    max: Math.round(max),
    avg: Math.round(avg),
    uniformityRatio: Math.round(uniformityRatio * 100) / 100,
    cv: Math.round(cv * 10) / 10
  }
}