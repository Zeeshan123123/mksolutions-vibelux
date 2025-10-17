// IES (Illuminating Engineering Society) File Parser
// Parses photometric data files for accurate light distribution modeling

export interface IESData {
  testLabName: string;
  testReportNumber: string;
  luminaireCatalogNumber: string;
  luminaireDescription: string;
  lampCatalogNumber: string;
  lampDescription: string;
  
  // Photometric properties
  numberOfLamps: number;
  lumensPerLamp: number;
  totalLumens: number;
  multiplier: number;
  
  // Geometry
  width: number;
  length: number;
  height: number;
  
  // Angular data
  verticalAngles: number[];
  horizontalAngles: number[];
  candelaValues: number[][];
  
  // Calculated properties
  maxCandela: number;
  beamAngle: number;
  fieldAngle: number;
  efficacy: number;
  coneOfLight: {
    angle: number;
    diameter: number;
    coverage: number;
  };
}

export class IESParser {
  private static readonly TILT_NONE = 'NONE';
  private static readonly TILT_INCLUDE = 'INCLUDE';
  
  /**
   * Parse IES file content
   */
  static async parse(content: string): Promise<IESData> {
    const lines = content.split('\n').map(line => line.trim());
    let lineIndex = 0;
    
    // Skip to the TILT line
    while (lineIndex < lines.length && !lines[lineIndex].includes('TILT=')) {
      lineIndex++;
    }
    
    if (lineIndex >= lines.length) {
      throw new Error('Invalid IES file: TILT line not found');
    }
    
    // Parse TILT
    const tiltLine = lines[lineIndex++];
    const hasTilt = !tiltLine.includes(this.TILT_NONE);
    
    if (hasTilt) {
      // Skip tilt data for now
      lineIndex += 4;
    }
    
    // Parse header data
    const header: Partial<IESData> = {
      testLabName: '',
      testReportNumber: '',
      luminaireCatalogNumber: '',
      luminaireDescription: '',
      lampCatalogNumber: '',
      lampDescription: ''
    };
    
    // Parse photometric data line
    const photometricData = lines[lineIndex++].split(/\s+/).map(Number);
    const numberOfLamps = photometricData[0];
    const lumensPerLamp = photometricData[1];
    const multiplier = photometricData[2];
    const numVerticalAngles = photometricData[3];
    const numHorizontalAngles = photometricData[4];
    const photometricType = photometricData[5];
    const unitsType = photometricData[6];
    const width = photometricData[7];
    const length = photometricData[8];
    const height = photometricData[9];
    
    // Parse ballast data
    const ballastData = lines[lineIndex++].split(/\s+/).map(Number);
    const ballastFactor = ballastData[0];
    const ballastLampQuantity = ballastData[1];
    const inputWatts = ballastData[2];
    
    // Parse vertical angles
    const verticalAngles: number[] = [];
    let anglesRead = 0;
    while (anglesRead < numVerticalAngles) {
      const angleLine = lines[lineIndex++].split(/\s+/).map(Number);
      verticalAngles.push(...angleLine);
      anglesRead += angleLine.length;
    }
    
    // Parse horizontal angles
    const horizontalAngles: number[] = [];
    anglesRead = 0;
    while (anglesRead < numHorizontalAngles) {
      const angleLine = lines[lineIndex++].split(/\s+/).map(Number);
      horizontalAngles.push(...angleLine);
      anglesRead += angleLine.length;
    }
    
    // Parse candela values
    const candelaValues: number[][] = [];
    for (let h = 0; h < numHorizontalAngles; h++) {
      const values: number[] = [];
      let valuesRead = 0;
      while (valuesRead < numVerticalAngles) {
        const valueLine = lines[lineIndex++].split(/\s+/).map(Number);
        values.push(...valueLine);
        valuesRead += valueLine.length;
      }
      candelaValues.push(values);
    }
    
    // Calculate derived properties
    const maxCandela = Math.max(...candelaValues.flat());
    const totalLumens = numberOfLamps * lumensPerLamp * ballastFactor;
    const efficacy = inputWatts > 0 ? totalLumens / inputWatts : 0;
    
    // Calculate beam and field angles
    const { beamAngle, fieldAngle } = this.calculateBeamAngles(verticalAngles, candelaValues[0], maxCandela);
    
    // Calculate cone of light
    const coneOfLight = this.calculateConeOfLight(beamAngle, height);
    
    return {
      ...header,
      numberOfLamps,
      lumensPerLamp,
      totalLumens,
      multiplier,
      width,
      length,
      height,
      verticalAngles,
      horizontalAngles,
      candelaValues,
      maxCandela,
      beamAngle,
      fieldAngle,
      efficacy,
      coneOfLight
    } as IESData;
  }
  
  /**
   * Calculate beam angle (50% of max intensity) and field angle (10% of max intensity)
   */
  private static calculateBeamAngles(
    angles: number[],
    intensities: number[],
    maxIntensity: number
  ): { beamAngle: number; fieldAngle: number } {
    const beamThreshold = maxIntensity * 0.5;
    const fieldThreshold = maxIntensity * 0.1;
    
    let beamAngle = 0;
    let fieldAngle = 0;
    
    // Find angles where intensity drops below thresholds
    for (let i = 0; i < angles.length; i++) {
      if (intensities[i] >= beamThreshold) {
        beamAngle = angles[i] * 2; // Multiply by 2 for full cone angle
      }
      if (intensities[i] >= fieldThreshold) {
        fieldAngle = angles[i] * 2;
      }
    }
    
    return { beamAngle, fieldAngle };
  }
  
  /**
   * Calculate cone of light properties
   */
  private static calculateConeOfLight(
    beamAngle: number,
    mountingHeight: number
  ): { angle: number; diameter: number; coverage: number } {
    const angleRad = (beamAngle * Math.PI) / 180;
    const radius = Math.tan(angleRad / 2) * mountingHeight;
    const diameter = radius * 2;
    const coverage = Math.PI * radius * radius;
    
    return {
      angle: beamAngle,
      diameter,
      coverage
    };
  }
  
  /**
   * Generate IES file content from data
   */
  static generate(data: IESData): string {
    const lines: string[] = [];
    
    // Header
    lines.push('IESNA:LM-63-2002');
    lines.push(`[TEST] ${data.testLabName}`);
    lines.push(`[TESTLAB] ${data.testLabName}`);
    lines.push(`[ISSUEDATE] ${new Date().toISOString().split('T')[0]}`);
    lines.push(`[MANUFAC] Vibelux Lighting Systems`);
    lines.push(`[LUMCAT] ${data.luminaireCatalogNumber}`);
    lines.push(`[LUMINAIRE] ${data.luminaireDescription}`);
    lines.push(`[LAMPCAT] ${data.lampCatalogNumber}`);
    lines.push(`[LAMP] ${data.lampDescription}`);
    lines.push('TILT=NONE');
    
    // Photometric data
    lines.push(
      `${data.numberOfLamps} ${data.lumensPerLamp} ${data.multiplier} ` +
      `${data.verticalAngles.length} ${data.horizontalAngles.length} 1 2 ` +
      `${data.width} ${data.length} ${data.height}`
    );
    
    // Ballast data
    lines.push('1.0 1 0');
    
    // Vertical angles
    lines.push(data.verticalAngles.join(' '));
    
    // Horizontal angles
    lines.push(data.horizontalAngles.join(' '));
    
    // Candela values
    for (const row of data.candelaValues) {
      lines.push(row.join(' '));
    }
    
    return lines.join('\n');
  }
  
  /**
   * Interpolate candela value for arbitrary angles
   */
  static interpolateCandela(
    data: IESData,
    verticalAngle: number,
    horizontalAngle: number
  ): number {
    // Find surrounding angles
    const vIndex = this.findSurroundingIndices(data.verticalAngles, verticalAngle);
    const hIndex = this.findSurroundingIndices(data.horizontalAngles, horizontalAngle);
    
    // Bilinear interpolation
    const v1 = data.candelaValues[hIndex.lower][vIndex.lower];
    const v2 = data.candelaValues[hIndex.lower][vIndex.upper];
    const v3 = data.candelaValues[hIndex.upper][vIndex.lower];
    const v4 = data.candelaValues[hIndex.upper][vIndex.upper];
    
    const fx = vIndex.fraction;
    const fy = hIndex.fraction;
    
    const i1 = v1 * (1 - fx) + v2 * fx;
    const i2 = v3 * (1 - fx) + v4 * fx;
    
    return i1 * (1 - fy) + i2 * fy;
  }
  
  private static findSurroundingIndices(
    angles: number[],
    targetAngle: number
  ): { lower: number; upper: number; fraction: number } {
    for (let i = 0; i < angles.length - 1; i++) {
      if (targetAngle >= angles[i] && targetAngle <= angles[i + 1]) {
        const fraction = (targetAngle - angles[i]) / (angles[i + 1] - angles[i]);
        return { lower: i, upper: i + 1, fraction };
      }
    }
    
    // If angle is outside range, clamp to nearest
    if (targetAngle < angles[0]) {
      return { lower: 0, upper: 0, fraction: 0 };
    } else {
      const lastIndex = angles.length - 1;
      return { lower: lastIndex, upper: lastIndex, fraction: 0 };
    }
  }
}