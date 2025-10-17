import { logger } from '@/lib/client-logger';

export interface DataTypeInference {
  detectedType: 'number' | 'date' | 'boolean' | 'text' | 'mixed' | 'cultivation_parameter';
  confidence: number;
  subtype?: string;
  units?: string;
  format?: string;
  issues: TypeIssue[];
  suggestions: string[];
}

export interface TypeIssue {
  type: 'mixed_types' | 'invalid_format' | 'inconsistent_units' | 'out_of_range' | 'missing_values';
  count: number;
  percentage: number;
  examples: any[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CleaningStrategy {
  approach: 'convert_all' | 'split_column' | 'standardize_format' | 'impute_missing' | 'remove_outliers';
  parameters: Record<string, any>;
  expectedSuccess: number;
  risks: string[];
}

export interface CleaningResult {
  originalValues: any[];
  cleanedValues: any[];
  transformations: Transformation[];
  issues: CleaningIssue[];
  confidence: number;
  metadata: CleaningMetadata;
}

export interface Transformation {
  type: 'unit_conversion' | 'format_standardization' | 'type_casting' | 'outlier_removal' | 'imputation';
  description: string;
  affectedCount: number;
  details: Record<string, any>;
}

export interface CleaningIssue {
  type: 'unresolvable_conflict' | 'data_loss' | 'uncertain_conversion' | 'outlier_detected';
  severity: 'info' | 'warning' | 'error';
  description: string;
  affectedValues: any[];
  recommendation: string;
}

export interface CleaningMetadata {
  originalCount: number;
  cleanedCount: number;
  successRate: number;
  dataLoss: number;
  qualityImprovement: number;
}

export interface EquipmentFormat {
  name: string;
  vendor: string;
  patterns: FieldPattern[];
  unitConversions: UnitConversion[];
  dateFormats: string[];
  specialHandling: SpecialHandling[];
}

export interface FieldPattern {
  pattern: RegExp;
  standardField: string;
  confidence: number;
  preprocessing?: (value: any) => any;
}

export interface UnitConversion {
  from: string[];
  to: string;
  factor: number;
  offset?: number;
}

export interface SpecialHandling {
  condition: (data: any[]) => boolean;
  handler: (data: any[]) => any[];
  description: string;
}

export class IntelligentDataCleaner {
  private equipmentFormats: Map<string, EquipmentFormat> = new Map();
  private cultivationParameterRanges: Map<string, [number, number]> = new Map();
  private unitConversions: Map<string, UnitConversion[]> = new Map();

  constructor() {
    this.initializeEquipmentFormats();
    this.initializeCultivationRanges();
    this.initializeUnitConversions();
  }

  private initializeEquipmentFormats() {
    // Priva greenhouse control systems
    this.equipmentFormats.set('priva', {
      name: 'Priva',
      vendor: 'Priva',
      patterns: [
        { pattern: /temp.*greenhouse/i, standardField: 'temperature_air', confidence: 0.9 },
        { pattern: /rh.*greenhouse/i, standardField: 'humidity_relative', confidence: 0.9 },
        { pattern: /co2.*ppm/i, standardField: 'co2_concentration', confidence: 0.95 },
        { pattern: /par.*radiation/i, standardField: 'ppfd', confidence: 0.9 },
        { pattern: /wind.*speed/i, standardField: 'air_velocity', confidence: 0.8 }
      ],
      unitConversions: [
        { from: ['°C'], to: '°C', factor: 1 },
        { from: ['°F'], to: '°C', factor: 0.5556, offset: -32 }
      ],
      dateFormats: ['DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss'],
      specialHandling: []
    });

    // Argus Controls
    this.equipmentFormats.set('argus', {
      name: 'Argus Controls',
      vendor: 'Argus',
      patterns: [
        { pattern: /zone.*temp/i, standardField: 'temperature_air', confidence: 0.9 },
        { pattern: /zone.*humid/i, standardField: 'humidity_relative', confidence: 0.9 },
        { pattern: /light.*level/i, standardField: 'ppfd', confidence: 0.85 },
        { pattern: /vent.*position/i, standardField: 'ventilation_position', confidence: 0.8 }
      ],
      unitConversions: [
        { from: ['F'], to: '°C', factor: 0.5556, offset: -32 },
        { from: ['%RH', 'RH%'], to: '%', factor: 1 }
      ],
      dateFormats: ['MM/DD/YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss'],
      specialHandling: []
    });

    // TrolMaster (smaller operations)
    this.equipmentFormats.set('trolmaster', {
      name: 'TrolMaster',
      vendor: 'TrolMaster',
      patterns: [
        { pattern: /temp.*[°]?[cf]/i, standardField: 'temperature_air', confidence: 0.9 },
        { pattern: /humid.*%/i, standardField: 'humidity_relative', confidence: 0.9 },
        { pattern: /vpd.*kpa/i, standardField: 'vpd', confidence: 0.95 },
        { pattern: /co2.*ppm/i, standardField: 'co2_concentration', confidence: 0.95 }
      ],
      unitConversions: [
        { from: ['kPa'], to: 'kPa', factor: 1 },
        { from: ['hPa'], to: 'kPa', factor: 0.1 }
      ],
      dateFormats: ['YYYY-MM-DD HH:mm:ss', 'MM/DD/YYYY HH:mm'],
      specialHandling: []
    });
  }

  private initializeCultivationRanges() {
    this.cultivationParameterRanges.set('temperature_air', [10, 40]); // °C
    this.cultivationParameterRanges.set('temperature_root', [15, 30]); // °C
    this.cultivationParameterRanges.set('humidity_relative', [20, 95]); // %
    this.cultivationParameterRanges.set('vpd', [0.4, 2.5]); // kPa
    this.cultivationParameterRanges.set('co2_concentration', [300, 2000]); // ppm
    this.cultivationParameterRanges.set('ppfd', [100, 2500]); // μmol/m²/s
    this.cultivationParameterRanges.set('dli', [15, 65]); // mol/m²/day
    this.cultivationParameterRanges.set('ph', [4.0, 9.0]);
    this.cultivationParameterRanges.set('ec', [0.3, 4.0]); // mS/cm
    this.cultivationParameterRanges.set('air_velocity', [0, 5]); // m/s
  }

  private initializeUnitConversions() {
    // Temperature conversions
    this.unitConversions.set('temperature', [
      { from: ['°F', 'fahrenheit', 'f'], to: '°C', factor: 5/9, offset: -32 },
      { from: ['K', 'kelvin'], to: '°C', factor: 1, offset: -273.15 }
    ]);

    // Pressure conversions
    this.unitConversions.set('pressure', [
      { from: ['hPa', 'hectopascal'], to: 'kPa', factor: 0.1 },
      { from: ['mbar', 'millibar'], to: 'kPa', factor: 0.1 },
      { from: ['psi'], to: 'kPa', factor: 6.895 }
    ]);

    // Light conversions
    this.unitConversions.set('light', [
      { from: ['lux'], to: 'ppfd', factor: 0.0185 }, // Approximate for LED
      { from: ['footcandles', 'fc'], to: 'ppfd', factor: 0.2 }
    ]);

    // EC conversions
    this.unitConversions.set('conductivity', [
      { from: ['ppm', 'tds'], to: 'mS/cm', factor: 0.002 }, // Approximate
      { from: ['μS/cm', 'us/cm'], to: 'mS/cm', factor: 0.001 }
    ]);
  }

  async detectDataTypes(values: any[]): Promise<DataTypeInference> {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) {
      return {
        detectedType: 'text',
        confidence: 0.1,
        issues: [{
          type: 'missing_values',
          count: values.length,
          percentage: 100,
          examples: [],
          severity: 'critical'
        }],
        suggestions: ['Column contains no valid data - consider removing or filling with default values']
      };
    }

    // Analyze data patterns
    const patterns = {
      number: 0,
      date: 0,
      boolean: 0,
      text: 0,
      cultivation: 0
    };

    const issues: TypeIssue[] = [];
    const suggestions: string[] = [];
    let detectedUnits: string | undefined;
    let detectedFormat: string | undefined;

    nonNullValues.forEach(value => {
      const strValue = value.toString().trim();
      
      // Check for numbers (including with units)
      if (/^-?\d+\.?\d*\s*[a-zA-Z%°]*$/.test(strValue)) {
        patterns.number++;
        
        // Extract units
        const unitMatch = strValue.match(/[a-zA-Z%°]+$/);
        if (unitMatch && !detectedUnits) {
          detectedUnits = unitMatch[0];
        }
      }
      // Check for dates
      else if (this.isDateValue(strValue)) {
        patterns.date++;
        
        // Detect date format
        if (!detectedFormat) {
          detectedFormat = this.detectDateFormat(strValue);
        }
      }
      // Check for booleans
      else if (/^(true|false|yes|no|on|off|1|0)$/i.test(strValue)) {
        patterns.boolean++;
      }
      // Check for cultivation parameters
      else if (this.isCultivationParameter(strValue)) {
        patterns.cultivation++;
      }
      else {
        patterns.text++;
      }
    });

    // Determine dominant type
    const total = nonNullValues.length;
    const typeRatios = {
      number: patterns.number / total,
      date: patterns.date / total,
      boolean: patterns.boolean / total,
      text: patterns.text / total,
      cultivation: patterns.cultivation / total
    };

    // Find the most common type
    const dominantType = Object.entries(typeRatios).reduce((a, b) => 
      typeRatios[a[0] as keyof typeof typeRatios] > typeRatios[b[0] as keyof typeof typeRatios] ? a : b
    )[0] as keyof typeof typeRatios;

    const confidence = typeRatios[dominantType];

    // Check for mixed types
    const mixedTypeCount = Object.values(typeRatios).filter(ratio => ratio > 0.1).length;
    if (mixedTypeCount > 1) {
      issues.push({
        type: 'mixed_types',
        count: total - Math.max(...Object.values(patterns)),
        percentage: (1 - confidence) * 100,
        examples: nonNullValues.slice(0, 5),
        severity: confidence < 0.7 ? 'high' : 'medium'
      });
      
      suggestions.push('Consider splitting column or standardizing data format');
    }

    // Check for missing values
    const missingCount = values.length - nonNullValues.length;
    if (missingCount > 0) {
      issues.push({
        type: 'missing_values',
        count: missingCount,
        percentage: (missingCount / values.length) * 100,
        examples: [],
        severity: missingCount / values.length > 0.3 ? 'high' : 'medium'
      });
    }

    return {
      detectedType: dominantType === 'cultivation' ? 'cultivation_parameter' : dominantType,
      confidence,
      units: detectedUnits,
      format: detectedFormat,
      issues,
      suggestions
    };
  }

  async cleanMixedTypeColumn(values: any[]): Promise<CleaningResult> {
    const transformations: Transformation[] = [];
    const issues: CleaningIssue[] = [];
    const originalValues = [...values];
    let cleanedValues = [...values];

    // First pass: standardize formats
    const formatStandardization = await this.standardizeFormats(cleanedValues);
    cleanedValues = formatStandardization.values;
    transformations.push(...formatStandardization.transformations);
    issues.push(...formatStandardization.issues);

    // Second pass: handle units
    const unitConversion = await this.convertUnits(cleanedValues);
    cleanedValues = unitConversion.values;
    transformations.push(...unitConversion.transformations);
    issues.push(...unitConversion.issues);

    // Third pass: type casting
    const typeCasting = await this.castToConsistentType(cleanedValues);
    cleanedValues = typeCasting.values;
    transformations.push(...typeCasting.transformations);
    issues.push(...typeCasting.issues);

    // Fourth pass: outlier detection and handling
    const outlierHandling = await this.handleOutliers(cleanedValues);
    cleanedValues = outlierHandling.values;
    transformations.push(...outlierHandling.transformations);
    issues.push(...outlierHandling.issues);

    // Calculate success metrics
    const successfulConversions = cleanedValues.filter((v, i) => 
      v !== null && v !== undefined && v !== originalValues[i]
    ).length;
    
    const confidence = successfulConversions / originalValues.filter(v => v !== null && v !== undefined).length;

    const metadata: CleaningMetadata = {
      originalCount: originalValues.length,
      cleanedCount: cleanedValues.filter(v => v !== null && v !== undefined).length,
      successRate: confidence,
      dataLoss: (originalValues.length - cleanedValues.filter(v => v !== null).length) / originalValues.length,
      qualityImprovement: this.calculateQualityImprovement(originalValues, cleanedValues)
    };

    return {
      originalValues,
      cleanedValues,
      transformations,
      issues,
      confidence,
      metadata
    };
  }

  private async standardizeFormats(values: any[]): Promise<{
    values: any[];
    transformations: Transformation[];
    issues: CleaningIssue[];
  }> {
    const transformations: Transformation[] = [];
    const issues: CleaningIssue[] = [];
    const result = values.map(value => {
      if (value === null || value === undefined || value === '') return value;
      
      const strValue = value.toString().trim();
      
      // Standardize boolean values
      if (/^(yes|y|true|t|on|enabled|1)$/i.test(strValue)) {
        return true;
      }
      if (/^(no|n|false|f|off|disabled|0)$/i.test(strValue)) {
        return false;
      }
      
      // Standardize date formats
      if (this.isDateValue(strValue)) {
        const standardDate = this.parseFlexibleDate(strValue);
        if (standardDate) {
          return standardDate;
        }
      }
      
      // Standardize numeric values with units
      const numericMatch = strValue.match(/^(-?\d+\.?\d*)\s*([a-zA-Z%°]*)$/);
      if (numericMatch) {
        const [, numberPart, unitPart] = numericMatch;
        const number = parseFloat(numberPart);
        
        if (!isNaN(number)) {
          // Return object with number and units for further processing
          return { value: number, unit: unitPart || undefined };
        }
      }
      
      return value;
    });

    const standardizedCount = result.filter((v, i) => v !== values[i]).length;
    if (standardizedCount > 0) {
      transformations.push({
        type: 'format_standardization',
        description: `Standardized ${standardizedCount} values to consistent formats`,
        affectedCount: standardizedCount,
        details: { types: ['boolean', 'date', 'numeric_with_units'] }
      });
    }

    return { values: result, transformations, issues };
  }

  private async convertUnits(values: any[]): Promise<{
    values: any[];
    transformations: Transformation[];
    issues: CleaningIssue[];
  }> {
    const transformations: Transformation[] = [];
    const issues: CleaningIssue[] = [];
    
    // Detect the most common unit
    const unitCounts = new Map<string, number>();
    values.forEach(value => {
      if (value && typeof value === 'object' && value.unit) {
        const count = unitCounts.get(value.unit) || 0;
        unitCounts.set(value.unit, count + 1);
      }
    });

    if (unitCounts.size <= 1) {
      // No unit conversion needed
      return { 
        values: values.map(v => v && typeof v === 'object' && v.value !== undefined ? v.value : v), 
        transformations, 
        issues 
      };
    }

    // Find the most common unit as target
    const targetUnit = Array.from(unitCounts.entries())
      .sort(([,a], [,b]) => b - a)[0][0];

    const result = values.map(value => {
      if (!value || typeof value !== 'object' || value.unit === undefined) {
        return value && typeof value === 'object' && value.value !== undefined ? value.value : value;
      }

      if (value.unit === targetUnit) {
        return value.value;
      }

      // Attempt unit conversion
      const conversion = this.findUnitConversion(value.unit, targetUnit);
      if (conversion) {
        const convertedValue = value.value * conversion.factor + (conversion.offset || 0);
        return convertedValue;
      }

      // Could not convert - flag as issue
      issues.push({
        type: 'uncertain_conversion',
        severity: 'warning',
        description: `Could not convert from ${value.unit} to ${targetUnit}`,
        affectedValues: [value],
        recommendation: `Manually verify conversion factor for ${value.unit} to ${targetUnit}`
      });

      return value.value; // Return unconverted value
    });

    const convertedCount = values.filter(v => v && typeof v === 'object' && v.unit && v.unit !== targetUnit).length;
    if (convertedCount > 0) {
      transformations.push({
        type: 'unit_conversion',
        description: `Converted ${convertedCount} values to standard unit: ${targetUnit}`,
        affectedCount: convertedCount,
        details: { targetUnit, conversions: Array.from(unitCounts.keys()) }
      });
    }

    return { values: result, transformations, issues };
  }

  private async castToConsistentType(values: any[]): Promise<{
    values: any[];
    transformations: Transformation[];
    issues: CleaningIssue[];
  }> {
    const transformations: Transformation[] = [];
    const issues: CleaningIssue[] = [];

    // Detect the target type based on majority
    const typeInference = await this.detectDataTypes(values);
    
    const result = values.map(value => {
      if (value === null || value === undefined || value === '') return value;

      try {
        switch (typeInference.detectedType) {
          case 'number':
            const num = typeof value === 'number' ? value : parseFloat(value.toString());
            return isNaN(num) ? null : num;
          
          case 'date':
            if (value instanceof Date) return value;
            const date = this.parseFlexibleDate(value.toString());
            return date || null;
          
          case 'boolean':
            if (typeof value === 'boolean') return value;
            const strVal = value.toString().toLowerCase().trim();
            if (['true', 'yes', '1', 'on', 'enabled'].includes(strVal)) return true;
            if (['false', 'no', '0', 'off', 'disabled'].includes(strVal)) return false;
            return null;
          
          default:
            return value.toString();
        }
      } catch (error) {
        issues.push({
          type: 'unresolvable_conflict',
          severity: 'warning',
          description: `Could not convert value to ${typeInference.detectedType}`,
          affectedValues: [value],
          recommendation: 'Consider manual data correction or removal'
        });
        return null;
      }
    });

    const castCount = result.filter((v, i) => v !== values[i] && v !== null).length;
    if (castCount > 0) {
      transformations.push({
        type: 'type_casting',
        description: `Cast ${castCount} values to ${typeInference.detectedType}`,
        affectedCount: castCount,
        details: { targetType: typeInference.detectedType, confidence: typeInference.confidence }
      });
    }

    return { values: result, transformations, issues };
  }

  private async handleOutliers(values: any[]): Promise<{
    values: any[];
    transformations: Transformation[];
    issues: CleaningIssue[];
  }> {
    const transformations: Transformation[] = [];
    const issues: CleaningIssue[] = [];

    // Only handle numeric outliers
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (numericValues.length < 5) {
      return { values, transformations, issues }; // Not enough data for outlier detection
    }

    // Calculate IQR for outlier detection
    const sorted = [...numericValues].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers: number[] = [];
    const result = values.map(value => {
      if (typeof value === 'number' && !isNaN(value)) {
        if (value < lowerBound || value > upperBound) {
          outliers.push(value);
          
          // For cultivation data, check against known ranges
          const inValidRange = this.isInCultivationRange(value);
          if (!inValidRange) {
            issues.push({
              type: 'outlier_detected',
              severity: 'warning',
              description: `Value ${value} is outside expected range`,
              affectedValues: [value],
              recommendation: 'Verify data accuracy or consider as anomaly'
            });
            
            // Don't remove outliers automatically, just flag them
            return value;
          }
        }
      }
      return value;
    });

    if (outliers.length > 0) {
      transformations.push({
        type: 'outlier_removal',
        description: `Detected ${outliers.length} potential outliers`,
        affectedCount: outliers.length,
        details: { outliers: outliers.slice(0, 5), bounds: [lowerBound, upperBound] }
      });
    }

    return { values: result, transformations, issues };
  }

  // Helper methods
  private isDateValue(value: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
      /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}/, // MM-DD-YYYY
      /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD
    ];
    
    return datePatterns.some(pattern => pattern.test(value)) || !isNaN(Date.parse(value));
  }

  private detectDateFormat(dateString: string): string {
    if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateString)) return 'YYYY-MM-DD';
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) return 'MM/DD/YYYY';
    if (/^\d{1,2}-\d{1,2}-\d{4}/.test(dateString)) return 'MM-DD-YYYY';
    if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(dateString)) return 'YYYY/MM/DD';
    return 'ISO';
  }

  private parseFlexibleDate(dateString: string): Date | null {
    try {
      // Try standard parsing first
      const standardDate = new Date(dateString);
      if (!isNaN(standardDate.getTime())) {
        return standardDate;
      }

      // Try different formats
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})/, // YYYY/MM/DD
      ];

      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          const [, part1, part2, part3] = match;
          
          // Determine if it's MM/DD/YYYY or DD/MM/YYYY based on values
          if (parseInt(part1) > 12) {
            // Must be DD/MM/YYYY
            const date = new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1));
            if (!isNaN(date.getTime())) return date;
          } else if (parseInt(part2) > 12) {
            // Must be MM/DD/YYYY
            const date = new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2));
            if (!isNaN(date.getTime())) return date;
          } else {
            // Ambiguous - try MM/DD/YYYY first (US format)
            const date1 = new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2));
            if (!isNaN(date1.getTime())) return date1;
            
            const date2 = new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1));
            if (!isNaN(date2.getTime())) return date2;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private isCultivationParameter(value: string): boolean {
    const cultivationKeywords = [
      'temperature', 'temp', 'humidity', 'rh', 'co2', 'ppfd', 'par', 'dli',
      'ph', 'ec', 'vpd', 'light', 'nutrients', 'fertilizer', 'yield'
    ];
    
    const lowerValue = value.toLowerCase();
    return cultivationKeywords.some(keyword => lowerValue.includes(keyword));
  }

  private findUnitConversion(fromUnit: string, toUnit: string): UnitConversion | null {
    for (const conversions of this.unitConversions.values()) {
      const conversion = conversions.find(c => 
        c.from.some(f => f.toLowerCase() === fromUnit.toLowerCase()) && 
        c.to.toLowerCase() === toUnit.toLowerCase()
      );
      if (conversion) return conversion;
    }
    return null;
  }

  private isInCultivationRange(value: number): boolean {
    // This would be enhanced with parameter-specific range checking
    // For now, basic sanity check
    return value > -100 && value < 10000; // Very broad range
  }

  private calculateQualityImprovement(original: any[], cleaned: any[]): number {
    const originalValid = original.filter(v => v !== null && v !== undefined && v !== '').length;
    const cleanedValid = cleaned.filter(v => v !== null && v !== undefined && v !== '').length;
    
    // Simple quality metric based on valid data count
    return ((cleanedValid - originalValid) / original.length) * 100;
  }
}

// Export singleton instance
export const intelligentDataCleaner = new IntelligentDataCleaner();