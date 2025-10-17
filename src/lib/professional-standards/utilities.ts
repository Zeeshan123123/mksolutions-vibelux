/**
 * Professional Standards - Utility Functions
 * Common utilities and helpers for professional systems
 */

import { 
  Point2D, 
  BoundingBox, 
  Matrix2D, 
  ValidationResult, 
  QualityMetric,
  ExportOptions,
  PROFESSIONAL_STANDARDS 
} from './types';

// Geometric Utilities
export class GeometryUtils {
  /**
   * Calculate distance between two points
   */
  static distance(p1: Point2D, p2: Point2D): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Calculate angle between two points
   */
  static angle(p1: Point2D, p2: Point2D): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * Rotate point around origin
   */
  static rotatePoint(point: Point2D, angle: number, origin: Point2D = { x: 0, y: 0 }): Point2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    
    return {
      x: origin.x + dx * cos - dy * sin,
      y: origin.y + dx * sin + dy * cos
    };
  }

  /**
   * Scale point from origin
   */
  static scalePoint(point: Point2D, scale: number, origin: Point2D = { x: 0, y: 0 }): Point2D {
    return {
      x: origin.x + (point.x - origin.x) * scale,
      y: origin.y + (point.y - origin.y) * scale
    };
  }

  /**
   * Create bounding box from points
   */
  static boundingBox(points: Point2D[]): BoundingBox {
    if (points.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY }
    };
  }

  /**
   * Check if point is inside bounding box
   */
  static pointInBounds(point: Point2D, bounds: BoundingBox): boolean {
    return point.x >= bounds.min.x && 
           point.x <= bounds.max.x && 
           point.y >= bounds.min.y && 
           point.y <= bounds.max.y;
  }

  /**
   * Expand bounding box by margin
   */
  static expandBounds(bounds: BoundingBox, margin: number): BoundingBox {
    return {
      min: { x: bounds.min.x - margin, y: bounds.min.y - margin },
      max: { x: bounds.max.x + margin, y: bounds.max.y + margin }
    };
  }
}

// Drawing Scale Utilities
export class ScaleUtils {
  /**
   * Parse scale string to ratio
   */
  static parseScale(scaleString: string): number {
    const match = scaleString.match(/^1:(\d+)$/);
    if (match) {
      return 1 / parseInt(match[1]);
    }
    
    const parts = scaleString.split(':');
    if (parts.length === 2) {
      return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    
    return 1;
  }

  /**
   * Format scale ratio to string
   */
  static formatScale(ratio: number): string {
    if (ratio === 1) return '1:1';
    if (ratio < 1) return `1:${Math.round(1 / ratio)}`;
    return `${ratio}:1`;
  }

  /**
   * Get appropriate scale for drawing size
   */
  static suggestScale(drawingBounds: BoundingBox, paperSize: { width: number; height: number }): string {
    const drawingWidth = drawingBounds.max.x - drawingBounds.min.x;
    const drawingHeight = drawingBounds.max.y - drawingBounds.min.y;
    
    const scaleX = paperSize.width / drawingWidth;
    const scaleY = paperSize.height / drawingHeight;
    const scale = Math.min(scaleX, scaleY) * 0.8; // 80% of paper size
    
    // Find nearest standard scale
    const scales = PROFESSIONAL_STANDARDS.DRAWING_SCALES.map(s => ScaleUtils.parseScale(s));
    const nearestScale = scales.reduce((prev, curr) => 
      Math.abs(curr - scale) < Math.abs(prev - scale) ? curr : prev
    );
    
    return ScaleUtils.formatScale(nearestScale);
  }

  /**
   * Convert real dimensions to drawing dimensions
   */
  static realToDrawing(realDimension: number, scale: string): number {
    return realDimension * ScaleUtils.parseScale(scale);
  }

  /**
   * Convert drawing dimensions to real dimensions
   */
  static drawingToReal(drawingDimension: number, scale: string): number {
    return drawingDimension / ScaleUtils.parseScale(scale);
  }
}

// Unit Conversion Utilities
export class UnitUtils {
  private static readonly conversions: Record<string, Record<string, number>> = {
    length: {
      mm: 1,
      cm: 10,
      m: 1000,
      in: 25.4,
      ft: 304.8,
      yd: 914.4
    },
    area: {
      'mm²': 1,
      'cm²': 100,
      'm²': 1000000,
      'in²': 645.16,
      'ft²': 92903.04
    },
    volume: {
      'mm³': 1,
      'cm³': 1000,
      'm³': 1000000000,
      'in³': 16387.064,
      'ft³': 28316846.592
    },
    force: {
      N: 1,
      kN: 1000,
      lbf: 4.44822,
      kip: 4448.22
    },
    pressure: {
      Pa: 1,
      kPa: 1000,
      MPa: 1000000,
      psi: 6894.76,
      psf: 47.8803
    },
    temperature: {
      K: (k: number) => k,
      C: (c: number) => c + 273.15,
      F: (f: number) => (f - 32) * 5/9 + 273.15
    }
  };

  /**
   * Convert between units
   */
  static convert(value: number, fromUnit: string, toUnit: string, type: string): number {
    const conversionTable = this.conversions[type];
    if (!conversionTable) {
      throw new Error(`Unknown unit type: ${type}`);
    }

    if (type === 'temperature') {
      // Special handling for temperature
      const kelvin = (conversionTable[fromUnit] as Function)(value);
      if (toUnit === 'K') return kelvin;
      if (toUnit === 'C') return kelvin - 273.15;
      if (toUnit === 'F') return (kelvin - 273.15) * 9/5 + 32;
    }

    const fromFactor = conversionTable[fromUnit];
    const toFactor = conversionTable[toUnit];
    
    if (fromFactor === undefined || toFactor === undefined) {
      throw new Error(`Unknown units: ${fromUnit} or ${toUnit}`);
    }

    return (value * fromFactor) / toFactor;
  }

  /**
   * Format number with appropriate precision for unit type
   */
  static formatWithUnit(value: number, unit: string, precision?: number): string {
    let displayPrecision = precision;
    
    if (displayPrecision === undefined) {
      // Auto-determine precision based on unit
      if (unit.includes('mm') || unit === 'in') displayPrecision = 1;
      else if (unit.includes('cm') || unit === 'ft') displayPrecision = 2;
      else if (unit.includes('m') || unit === 'yd') displayPrecision = 3;
      else displayPrecision = 2;
    }

    return `${value.toFixed(displayPrecision)} ${unit}`;
  }
}

// Validation Utilities
export class ValidationUtils {
  /**
   * Validate drawing completeness
   */
  static validateCompleteness(drawing: any): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Check title block
    if (!drawing.titleBlock) {
      results.push({
        id: 'missing-title-block',
        type: 'error',
        category: 'completeness',
        message: 'Missing title block',
        description: 'Drawing must include a complete title block with project information',
        recommendation: 'Add title block with project name, number, date, and signatures',
        severity: 'critical',
        autoFixAvailable: true,
        affectedElements: []
      });
    }

    // Check dimensions
    const undimensionedElements = drawing.elements?.filter((el: any) => 
      el.type === 'line' && !el.annotations?.some((ann: any) => ann.type === 'dimension')
    ) || [];

    if (undimensionedElements.length > 0) {
      results.push({
        id: 'missing-dimensions',
        type: 'warning',
        category: 'completeness',
        message: `${undimensionedElements.length} elements without dimensions`,
        description: 'All significant geometry should be dimensioned',
        recommendation: 'Add dimensions to all construction-critical elements',
        severity: 'major',
        autoFixAvailable: false,
        affectedElements: undimensionedElements.map((el: any) => el.id)
      });
    }

    return results;
  }

  /**
   * Validate standards compliance
   */
  static validateStandardsCompliance(drawing: any, standards: string[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Line weight compliance
    const elements = drawing.elements || [];
    const invalidLineWeights = elements.filter((el: any) => 
      el.style?.lineWeight && 
      !PROFESSIONAL_STANDARDS.LINE_WEIGHTS.includes(el.style.lineWeight)
    );

    if (invalidLineWeights.length > 0) {
      results.push({
        id: 'non-standard-line-weights',
        type: 'warning',
        category: 'standards',
        message: `${invalidLineWeights.length} elements with non-standard line weights`,
        description: 'Line weights should follow professional standards',
        recommendation: 'Use standard line weights: ' + PROFESSIONAL_STANDARDS.LINE_WEIGHTS.join(', '),
        severity: 'minor',
        autoFixAvailable: true,
        affectedElements: invalidLineWeights.map((el: any) => el.id)
      });
    }

    // Text size compliance
    const textElements = elements.filter((el: any) => el.type === 'text');
    const invalidTextSizes = textElements.filter((el: any) => 
      el.style?.textStyle?.size && 
      !PROFESSIONAL_STANDARDS.TEXT_SIZES.includes(el.style.textStyle.size)
    );

    if (invalidTextSizes.length > 0) {
      results.push({
        id: 'non-standard-text-sizes',
        type: 'warning',
        category: 'standards',
        message: `${invalidTextSizes.length} text elements with non-standard sizes`,
        description: 'Text sizes should follow professional standards',
        recommendation: 'Use standard text sizes: ' + PROFESSIONAL_STANDARDS.TEXT_SIZES.join(', '),
        severity: 'minor',
        autoFixAvailable: true,
        affectedElements: invalidTextSizes.map((el: any) => el.id)
      });
    }

    return results;
  }

  /**
   * Calculate overall quality score
   */
  static calculateQualityScore(validationResults: ValidationResult[]): number {
    if (validationResults.length === 0) return 100;

    const weights = {
      critical: 25,
      major: 10,
      minor: 2
    };

    const totalDeductions = validationResults.reduce((total, result) => {
      return total + weights[result.severity];
    }, 0);

    return Math.max(0, 100 - totalDeductions);
  }
}

// File and Export Utilities
export class ExportUtils {
  /**
   * Generate filename with proper conventions
   */
  static generateFilename(
    projectNumber: string,
    sheetNumber: string,
    revision: string,
    format: string
  ): string {
    const cleanProject = projectNumber.replace(/[^a-zA-Z0-9-]/g, '');
    const cleanSheet = sheetNumber.replace(/[^a-zA-Z0-9-]/g, '');
    const cleanRevision = revision.replace(/[^a-zA-Z0-9]/g, '');
    
    return `${cleanProject}_${cleanSheet}_Rev${cleanRevision}.${format.toLowerCase()}`;
  }

  /**
   * Validate export options
   */
  static validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = [];

    if (options.scale <= 0) {
      errors.push('Scale must be positive');
    }

    if (options.resolution && options.resolution < 72) {
      errors.push('Resolution should be at least 72 DPI');
    }

    if (options.customSize && (options.customSize.width <= 0 || options.customSize.height <= 0)) {
      errors.push('Custom size dimensions must be positive');
    }

    if (options.margins) {
      const totalWidth = options.margins.left + options.margins.right;
      const totalHeight = options.margins.top + options.margins.bottom;
      
      if (options.paperSize === 'CUSTOM' && options.customSize) {
        if (totalWidth >= options.customSize.width) {
          errors.push('Horizontal margins exceed paper width');
        }
        if (totalHeight >= options.customSize.height) {
          errors.push('Vertical margins exceed paper height');
        }
      }
    }

    return errors;
  }

  /**
   * Get optimal export settings for format
   */
  static getOptimalSettings(format: ExportOptions['format']): Partial<ExportOptions> {
    const settings: Record<string, Partial<ExportOptions>> = {
      PDF: {
        resolution: 300,
        colorMode: 'RGB',
        paperSize: 'ARCH_D'
      },
      DWG: {
        colorMode: 'RGB'
      },
      DXF: {
        colorMode: 'RGB'
      },
      PNG: {
        resolution: 300,
        colorMode: 'RGB'
      },
      JPEG: {
        resolution: 150,
        colorMode: 'RGB'
      },
      SVG: {
        colorMode: 'RGB'
      },
      TIFF: {
        resolution: 300,
        colorMode: 'CMYK'
      }
    };

    return settings[format] || {};
  }
}

// Layer Management Utilities
export class LayerUtils {
  /**
   * Generate standard layer names
   */
  static generateStandardLayers(): Record<string, any> {
    return {
      'A-WALL': { description: 'Walls', color: '#FFFFFF', lineWeight: 0.7 },
      'A-DOOR': { description: 'Doors', color: '#FFFF00', lineWeight: 0.5 },
      'A-WIND': { description: 'Windows', color: '#00FFFF', lineWeight: 0.5 },
      'S-GRID': { description: 'Structural Grid', color: '#FF0000', lineWeight: 0.5 },
      'S-BEAM': { description: 'Structural Beams', color: '#FF8080', lineWeight: 0.7 },
      'S-COLS': { description: 'Structural Columns', color: '#FF4040', lineWeight: 0.7 },
      'M-DUCT': { description: 'HVAC Ductwork', color: '#00FF00', lineWeight: 0.5 },
      'M-EQUP': { description: 'Mechanical Equipment', color: '#80FF80', lineWeight: 0.7 },
      'E-POWR': { description: 'Power', color: '#0000FF', lineWeight: 0.5 },
      'E-LITE': { description: 'Lighting', color: '#8080FF', lineWeight: 0.5 },
      'G-ANNO': { description: 'Annotations', color: '#FFFF00', lineWeight: 0.25 },
      'G-DIMS': { description: 'Dimensions', color: '#FF00FF', lineWeight: 0.25 },
      'G-TTLB': { description: 'Title Block', color: '#FFFFFF', lineWeight: 0.5 }
    };
  }

  /**
   * Validate layer naming convention
   */
  static validateLayerName(layerName: string): boolean {
    // AIA layer naming standard: D-SSSS-###
    const aiaPattern = /^[A-Z]-[A-Z]{4}(-\d{3})?$/;
    return aiaPattern.test(layerName);
  }

  /**
   * Suggest layer name based on element type
   */
  static suggestLayerName(elementType: string, discipline: string): string {
    const disciplinePrefix = discipline.charAt(0).toUpperCase();
    const typeMap: Record<string, string> = {
      wall: 'WALL',
      door: 'DOOR',
      window: 'WIND',
      beam: 'BEAM',
      column: 'COLS',
      duct: 'DUCT',
      equipment: 'EQUP',
      power: 'POWR',
      lighting: 'LITE',
      annotation: 'ANNO',
      dimension: 'DIMS'
    };

    const suffix = typeMap[elementType.toLowerCase()] || 'MISC';
    return `${disciplinePrefix}-${suffix}`;
  }
}

// Professional Utilities Collection
export const ProfessionalUtils = {
  Geometry: GeometryUtils,
  Scale: ScaleUtils,
  Units: UnitUtils,
  Validation: ValidationUtils,
  Export: ExportUtils,
  Layer: LayerUtils
};

export default ProfessionalUtils;