// Enhanced IES file parser for comprehensive photometric data handling
// Supports IESNA LM-63-1995, LM-63-2002, and LM-63-2019 formats

import { logger } from '@/lib/client-logger';
import type { IESPhotometry } from './ies-generator'

export interface IESHeader {
  filename: string
  version: string
  manufacturer: string
  lumcat: string
  luminaire: string
  lamp: string
  ballast: string
  issueDate: string
  testLab?: string
  testDate?: string
  description?: string
}

export interface IESMetadata {
  tiltType: string
  numberOfLamps: number
  lumensPerLamp: number
  candelaMultiplier: number
  numberOfVerticalAngles: number
  numberOfHorizontalAngles: number
  photometricType: number
  unitsType: number
  luminousWidth: number
  luminousLength: number
  luminousHeight: number
  ballastFactor?: number
  ballastLampPhotometricFactor?: number
  inputWatts?: number
}

export interface PhotometricAnalysis {
  nadir: number // Peak downward intensity (cd)
  peak: number // Maximum intensity at any angle (cd)
  peakAngle: { vertical: number; horizontal: number }
  beamAngle: number // Angle where intensity drops to 50% of peak
  fieldAngle: number // Angle where intensity drops to 10% of peak
  efficiency: number // Luminaire efficiency (lumens out / lumens in)
  distribution: 'narrow' | 'medium' | 'wide' | 'very-wide'
  centerLineIntensity: number[] // Candela values along main axis
  uniformityRatio: number // Min/max uniformity
  cutoffAngle: number // Where intensity drops below 5%
}

export interface ParsedIESFile {
  header: IESHeader
  photometry: IESPhotometry & {
    candelaMatrix: number[][] // Raw candela values [vertical][horizontal]
    analysis: PhotometricAnalysis
  }
  metadata: IESMetadata
}

/**
 * Enhanced IES file parser with comprehensive photometric analysis
 */
export function parseIESFile(content: string): ParsedIESFile {
  const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0)
  
  let currentIndex = 0
  
  // Detect IES version
  const versionLine = lines.find(line => line.match(/^IESNA:\s*(LM-\d+-\d+|91|95|02)/i))
  const version = versionLine ? versionLine.split(':')[1].trim() : 'Unknown'
  
  // Initialize header with defaults
  const header: IESHeader = {
    filename: '',
    version,
    manufacturer: 'Unknown',
    lumcat: '',
    luminaire: '',
    lamp: '',
    ballast: '',
    issueDate: '',
    testLab: undefined,
    testDate: undefined,
    description: undefined
  }
  
  // Parse header section with enhanced keyword support
  while (currentIndex < lines.length && !lines[currentIndex].toUpperCase().includes('TILT')) {
    const line = lines[currentIndex]
    
    // Parse header fields with better regex matching
    const keywordMatch = line.match(/^\[([^\]]+)\]\s*(.*)/)
    if (keywordMatch) {
      const [, keyword, value] = keywordMatch
      switch (keyword.toUpperCase()) {
        case 'TEST':
          header.testLab = value.trim()
          break
        case 'TESTDATE':
          header.testDate = value.trim()
          break
        case 'ISSUEDATE':
          header.issueDate = value.trim()
          break
        case 'MANUFAC':
          header.manufacturer = value.trim() || 'Unknown'
          break
        case 'LUMCAT':
          header.lumcat = value.trim()
          break
        case 'LUMINAIRE':
          header.luminaire = value.trim()
          break
        case 'LAMP':
          header.lamp = value.trim()
          break
        case 'BALLAST':
          header.ballast = value.trim()
          break
        case 'OTHER':
          header.description = value.trim()
          break
      }
    }
    
    currentIndex++
  }
  
  // Skip TILT line and parse tilt data
  let tiltType = 'NONE'
  if (currentIndex < lines.length && lines[currentIndex].toUpperCase().includes('TILT')) {
    tiltType = lines[currentIndex].split('=')[1]?.trim() || 'NONE'
    currentIndex++
  }
  
  // Parse photometric data
  if (currentIndex >= lines.length) {
    throw new Error('Invalid IES file: Missing photometric data section')
  }
  
  // Parse the main photometric line - enhanced parsing
  const photometricData: number[] = []
  
  // Keep reading lines until we have at least 10 numbers for the photometric header
  while (currentIndex < lines.length && photometricData.length < 10) {
    const line = lines[currentIndex++]
    if (line && !line.startsWith('[')) {
      const numbers = line.split(/\s+/)
        .filter(n => n.length > 0)
        .map(Number)
        .filter(n => !isNaN(n))
      photometricData.push(...numbers)
    }
  }
  
  if (photometricData.length < 10) {
    throw new Error(`Invalid IES file: Incomplete photometric data (found ${photometricData.length} values, need at least 10)`)
  }
  
  const photometricLine = photometricData
  
  const [
    numberOfLamps,
    lumensPerLamp,
    candelaMultiplier,
    numberOfVerticalAngles,
    numberOfHorizontalAngles,
    photometricType,
    unitsType,
    luminousWidth,
    luminousLength,
    luminousHeight
  ] = photometricLine
  
  // Parse ballast factor and future use lines (these are sometimes combined or missing)
  let ballastFactor = 1.0
  let futureUse = 1.0
  
  if (currentIndex < lines.length) {
    const ballastLine = lines[currentIndex++].split(/\s+/).map(Number).filter(n => !isNaN(n))
    if (ballastLine.length > 0) ballastFactor = ballastLine[0]
    if (ballastLine.length > 1) futureUse = ballastLine[1]
  }
  
  if (currentIndex < lines.length && futureUse === 1.0) {
    const futureLine = lines[currentIndex++].split(/\s+/).map(Number).filter(n => !isNaN(n))
    if (futureLine.length > 0) futureUse = futureLine[0]
  }
  
  // Parse horizontal angles
  const horizontalAngles: number[] = []
  while (horizontalAngles.length < numberOfHorizontalAngles && currentIndex < lines.length) {
    const line = lines[currentIndex++]
    const angles = line.split(/\s+/)
      .filter(a => a.length > 0)
      .map(Number)
      .filter(n => !isNaN(n))
    horizontalAngles.push(...angles)
  }
  
  // Fill missing angles with defaults if needed
  if (horizontalAngles.length === 0) {
    horizontalAngles.push(0) // Default single horizontal angle
  }
  
  // Parse vertical angles
  const verticalAngles: number[] = []
  while (verticalAngles.length < numberOfVerticalAngles && currentIndex < lines.length) {
    const line = lines[currentIndex++]
    const angles = line.split(/\s+/)
      .filter(a => a.length > 0)
      .map(Number)
      .filter(n => !isNaN(n))
    verticalAngles.push(...angles)
  }
  
  // Fill missing angles with defaults if needed
  while (verticalAngles.length < numberOfVerticalAngles) {
    const lastAngle = verticalAngles[verticalAngles.length - 1] || 0
    verticalAngles.push(lastAngle + 5) // Add 5 degree increments
  }
  
  // Parse candela values
  const candela: number[][] = []
  const totalCandelaValues = numberOfVerticalAngles * numberOfHorizontalAngles
  const allCandelaValues: number[] = []
  
  
  // Read all remaining lines for candela data
  while (currentIndex < lines.length && allCandelaValues.length < totalCandelaValues) {
    const line = lines[currentIndex++]
    const values = line.split(/\s+/)
      .filter(v => v.length > 0)
      .map(val => {
        const num = Number(val)
        return isNaN(num) ? 0 : num * candelaMultiplier
      })
    allCandelaValues.push(...values)
  }
  
  
  // Fill in missing values with zeros if needed
  while (allCandelaValues.length < totalCandelaValues) {
    allCandelaValues.push(0)
  }
  
  // Organize candela values into 2D array
  let valueIndex = 0
  for (let h = 0; h < numberOfHorizontalAngles; h++) {
    const column: number[] = []
    for (let v = 0; v < numberOfVerticalAngles; v++) {
      column.push(allCandelaValues[valueIndex++] || 0)
    }
    candela.push(column)
  }
  
  // Calculate total lumens and max candela
  const maxCandela = Math.max(...candela.flat())
  const totalLumens = numberOfLamps * lumensPerLamp
  
  // Calculate beam and field angles
  const centerHorizontalIndex = horizontalAngles.length > 1 ? Math.floor(horizontalAngles.length / 2) : 0
  const centerColumn = candela[centerHorizontalIndex] || candela[0] || []
  const maxVerticalCandela = Math.max(...centerColumn, 0)
  
  // Find beam angle (50% of peak intensity)
  const halfMaxCandela = maxVerticalCandela * 0.5
  let beamAngle = 180
  
  for (let v = 0; v < verticalAngles.length && v < centerColumn.length; v++) {
    if (centerColumn[v] <= halfMaxCandela) {
      beamAngle = verticalAngles[v] * 2 // Double because we're measuring from center
      break
    }
  }
  
  const fieldAngle = beamAngle * 1.5 // Approximate field angle
  
  // Perform comprehensive photometric analysis
  const analysis = analyzePhotometricDistribution(verticalAngles, horizontalAngles, candela)
  
  // Create metadata object
  const metadata: IESMetadata = {
    tiltType,
    numberOfLamps,
    lumensPerLamp,
    candelaMultiplier,
    numberOfVerticalAngles,
    numberOfHorizontalAngles,
    photometricType,
    unitsType,
    luminousWidth,
    luminousLength,
    luminousHeight,
    ballastFactor,
    ballastLampPhotometricFactor: futureUse,
    inputWatts: luminousHeight > 0 ? luminousHeight : undefined
  }
  
  return {
    header,
    photometry: {
      verticalAngles,
      horizontalAngles,
      candela,
      totalLumens,
      maxCandela,
      beamAngle,
      fieldAngle,
      candelaMatrix: candela,
      analysis
    },
    metadata
  }
}

/**
 * Comprehensive photometric distribution analysis
 */
function analyzePhotometricDistribution(
  verticalAngles: number[],
  horizontalAngles: number[],
  candelaMatrix: number[][]
): PhotometricAnalysis {
  if (!candelaMatrix.length || !candelaMatrix[0]?.length) {
    throw new Error('Invalid candela matrix for analysis')
  }

  // Find peak intensity and its location
  let peak = 0
  let peakVertical = 0
  let peakHorizontal = 0
  
  for (let h = 0; h < horizontalAngles.length; h++) {
    for (let v = 0; v < verticalAngles.length; v++) {
      const candela = candelaMatrix[h]?.[v] || 0
      if (candela > peak) {
        peak = candela
        peakVertical = verticalAngles[v] || 0
        peakHorizontal = horizontalAngles[h] || 0
      }
    }
  }

  // Find nadir intensity (straight down, 0°)
  const nadirVerticalIndex = verticalAngles.findIndex(angle => angle === 0)
  const nadirHorizontalIndex = horizontalAngles.findIndex(angle => angle === 0) || 0
  const nadir = nadirVerticalIndex !== -1 ? 
    (candelaMatrix[nadirHorizontalIndex]?.[nadirVerticalIndex] || 0) : 0

  // Get center line intensity (main beam axis)
  const centerHorizontalIndex = Math.floor(horizontalAngles.length / 2)
  const centerLineIntensity = candelaMatrix[centerHorizontalIndex] || candelaMatrix[0] || []

  // Calculate beam angle (50% of peak)
  const halfPeak = peak * 0.5
  let beamAngle = 180
  
  for (let v = 0; v < verticalAngles.length; v++) {
    const intensity = centerLineIntensity[v] || 0
    if (intensity <= halfPeak && verticalAngles[v] > 0) {
      beamAngle = verticalAngles[v] * 2 // Double for full cone angle
      break
    }
  }

  // Calculate field angle (10% of peak)
  const tenthPeak = peak * 0.1
  let fieldAngle = 180
  
  for (let v = 0; v < verticalAngles.length; v++) {
    const intensity = centerLineIntensity[v] || 0
    if (intensity <= tenthPeak && verticalAngles[v] > 0) {
      fieldAngle = verticalAngles[v] * 2
      break
    }
  }

  // Calculate cutoff angle (5% of peak)
  const cutoffThreshold = peak * 0.05
  let cutoffAngle = 180
  
  for (let v = 0; v < verticalAngles.length; v++) {
    const intensity = centerLineIntensity[v] || 0
    if (intensity <= cutoffThreshold && verticalAngles[v] > 0) {
      cutoffAngle = verticalAngles[v] * 2
      break
    }
  }

  // Determine distribution type
  let distribution: PhotometricAnalysis['distribution']
  if (beamAngle < 30) distribution = 'narrow'
  else if (beamAngle < 60) distribution = 'medium'
  else if (beamAngle < 100) distribution = 'wide'
  else distribution = 'very-wide'

  // Calculate uniformity ratio (min/max in useful zone)
  const usefulZone = centerLineIntensity.slice(0, Math.floor(centerLineIntensity.length * 0.7))
  const minIntensity = Math.min(...usefulZone.filter(i => i > 0))
  const maxIntensity = Math.max(...usefulZone)
  const uniformityRatio = maxIntensity > 0 ? minIntensity / maxIntensity : 0

  // Calculate luminaire efficiency (simplified)
  const totalCandela = candelaMatrix.flat().reduce((sum, val) => sum + val, 0)
  const efficiency = totalCandela > 0 ? (totalCandela / candelaMatrix.flat().length) / peak : 0

  return {
    nadir,
    peak,
    peakAngle: { vertical: peakVertical, horizontal: peakHorizontal },
    beamAngle,
    fieldAngle,
    efficiency,
    distribution,
    centerLineIntensity,
    uniformityRatio,
    cutoffAngle
  }
}

/**
 * Validate IES file format
 */
export function validateIESFile(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    // Basic format checks - make more lenient
    if (!content.toUpperCase().includes('TILT')) {
      logger.warn('api', 'IES file may be missing TILT directive', { data: 'attempting to parse anyway' })
    }
    
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    if (lines.length < 10) {
      errors.push('File too short to be a valid IES file')
    }
    
    // Try to parse and catch specific errors
    parseIESFile(content)
    
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown parsing error')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Convert uploaded IES file to our internal format
 */
export function convertUploadedIES(file: File): Promise<ParsedIESFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const validation = validateIESFile(content)
        
        if (!validation.valid) {
          reject(new Error(`Invalid IES file: ${validation.errors.join(', ')}`))
          return
        }
        
        const parsedIES = parseIESFile(content)
        parsedIES.header.filename = file.name
        
        resolve(parsedIES)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Extract key photometric characteristics from parsed IES data
 */
export function extractPhotometricSummary(parsedIES: ParsedIESFile) {
  const { photometry, metadata } = parsedIES
  
  const efficacy = photometry.totalLumens / (metadata.numberOfLamps * 100) // Assume 100W per lamp if not specified
  const centerBeamPPFD = photometry.maxCandela * 4.54 // Convert to PPFD approximation
  
  return {
    totalLumens: photometry.totalLumens,
    maxCandela: photometry.maxCandela,
    beamAngle: photometry.beamAngle,
    fieldAngle: photometry.fieldAngle,
    estimatedEfficacy: efficacy,
    centerBeamPPFD,
    fixtureSize: {
      width: metadata.luminousWidth,
      length: metadata.luminousLength,
      height: metadata.luminousHeight
    },
    numberOfLamps: metadata.numberOfLamps
  }
}