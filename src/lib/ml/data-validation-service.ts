/**
 * ML-Specific Data Validation and Quality Assessment Service
 * Comprehensive validation for machine learning workflows with cultivation data
 */

export interface ValidationRule {
  field: string;
  type: 'required' | 'numeric' | 'range' | 'categorical' | 'datetime' | 'custom';
  parameters?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface DataQualityReport {
  overall: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    readyForML: boolean;
  };
  completeness: {
    score: number;
    missingDataPercentage: number;
    fieldsWithMissingData: string[];
    criticalFieldsMissing: string[];
  };
  consistency: {
    score: number;
    inconsistentFields: Array<{
      field: string;
      issue: string;
      affectedRecords: number;
    }>;
  };
  accuracy: {
    score: number;
    outliers: Array<{
      field: string;
      value: any;
      expected: string;
      recordIndex: number;
    }>;
    anomalies: Array<{
      field: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
  validity: {
    score: number;
    invalidRecords: number;
    validationErrors: Array<{
      field: string;
      rule: string;
      message: string;
      recordIndex: number;
    }>;
  };
  uniqueness: {
    score: number;
    duplicateRecords: number;
    duplicateFields: Array<{
      field: string;
      duplicateCount: number;
    }>;
  };
  recommendations: string[];
  mlReadinessChecks: {
    sufficientData: boolean;
    balancedTarget: boolean;
    noDataLeakage: boolean;
    temporalConsistency: boolean;
    featureVariability: boolean;
  };
}

export interface FeatureQualityAssessment {
  featureName: string;
  dataType: string;
  quality: {
    completeness: number; // % non-null
    uniqueness: number; // % unique values
    consistency: number; // data format consistency
    validity: number; // within expected ranges
  };
  statistics: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    std?: number;
    skewness?: number;
    kurtosis?: number;
  };
  distribution: {
    type: 'normal' | 'skewed' | 'uniform' | 'bimodal' | 'unknown';
    outlierCount: number;
    outlierPercentage: number;
  };
  mlSuitability: {
    score: number;
    variance: number;
    correlationWithTarget?: number;
    informationGain?: number;
    issues: string[];
  };
  recommendations: string[];
}

export class MLDataValidationService {
  private static cultivationValidationRules: ValidationRule[] = [
    // Environmental parameters
    {
      field: 'temperature',
      type: 'range',
      parameters: { min: 10, max: 40 },
      message: 'Temperature should be between 10°C and 40°C',
      severity: 'error'
    },
    {
      field: 'humidity',
      type: 'range',
      parameters: { min: 0, max: 100 },
      message: 'Humidity should be between 0% and 100%',
      severity: 'error'
    },
    {
      field: 'vpd',
      type: 'range',
      parameters: { min: 0, max: 5 },
      message: 'VPD should be between 0 and 5 kPa',
      severity: 'warning'
    },
    {
      field: 'co2',
      type: 'range',
      parameters: { min: 300, max: 2000 },
      message: 'CO2 should be between 300 and 2000 ppm',
      severity: 'warning'
    },
    
    // Lighting parameters
    {
      field: 'ppfd',
      type: 'range',
      parameters: { min: 0, max: 2500 },
      message: 'PPFD should be between 0 and 2500 μmol/m²/s',
      severity: 'error'
    },
    {
      field: 'dli',
      type: 'range',
      parameters: { min: 0, max: 70 },
      message: 'DLI should be between 0 and 70 mol/m²/day',
      severity: 'error'
    },
    {
      field: 'photoperiod',
      type: 'range',
      parameters: { min: 0, max: 24 },
      message: 'Photoperiod should be between 0 and 24 hours',
      severity: 'error'
    },
    
    // Nutrition parameters
    {
      field: 'ph',
      type: 'range',
      parameters: { min: 4, max: 8.5 },
      message: 'pH should be between 4.0 and 8.5',
      severity: 'error'
    },
    {
      field: 'ec',
      type: 'range',
      parameters: { min: 0, max: 5 },
      message: 'EC should be between 0 and 5 mS/cm',
      severity: 'warning'
    },
    
    // Outcome variables
    {
      field: 'yield',
      type: 'range',
      parameters: { min: 0, max: 5000 },
      message: 'Yield should be between 0 and 5000 g/m²',
      severity: 'warning'
    },
    {
      field: 'quality_score',
      type: 'range',
      parameters: { min: 0, max: 100 },
      message: 'Quality score should be between 0 and 100',
      severity: 'error'
    }
  ];

  /**
   * Perform comprehensive data quality assessment
   */
  static async assessDataQuality(data: any[]): Promise<DataQualityReport> {
    if (!data || data.length === 0) {
      throw new Error('No data provided for quality assessment');
    }

    const fields = Object.keys(data[0]);
    
    // Calculate individual quality dimensions
    const completeness = this.assessCompleteness(data, fields);
    const consistency = this.assessConsistency(data, fields);
    const accuracy = this.assessAccuracy(data, fields);
    const validity = this.assessValidity(data);
    const uniqueness = this.assessUniqueness(data);
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (completeness.score * 0.25) +
      (consistency.score * 0.20) +
      (accuracy.score * 0.25) +
      (validity.score * 0.20) +
      (uniqueness.score * 0.10)
    );

    const grade = this.getQualityGrade(overallScore);
    const mlReadinessChecks = this.assessMLReadiness(data, fields);
    
    return {
      overall: {
        score: overallScore,
        grade,
        readyForML: overallScore >= 70 && mlReadinessChecks.sufficientData
      },
      completeness,
      consistency,
      accuracy,
      validity,
      uniqueness,
      recommendations: this.generateRecommendations({
        completeness,
        consistency,
        accuracy,
        validity,
        uniqueness,
        mlReadinessChecks
      }),
      mlReadinessChecks
    };
  }

  /**
   * Assess individual feature quality for ML
   */
  static assessFeatureQuality(data: any[], featureName: string): FeatureQualityAssessment {
    const values = data.map(row => row[featureName]).filter(v => v !== null && v !== undefined);
    const allValues = data.map(row => row[featureName]);
    
    if (values.length === 0) {
      throw new Error(`Feature '${featureName}' has no valid data`);
    }

    const isNumeric = values.every(v => typeof v === 'number' || !isNaN(Number(v)));
    const numericValues = isNumeric ? values.map(Number) : [];
    
    // Quality dimensions
    const completeness = (values.length / data.length) * 100;
    const uniqueValues = new Set(values);
    const uniqueness = (uniqueValues.size / values.length) * 100;
    
    // Statistical analysis for numeric features
    const statistics = isNumeric ? this.calculateStatistics(numericValues) : {};
    const distribution = isNumeric ? this.analyzeDistribution(numericValues) : {
      type: 'unknown' as const,
      outlierCount: 0,
      outlierPercentage: 0
    };

    // ML suitability assessment
    const variance = isNumeric ? this.calculateVariance(numericValues) : 0;
    const mlScore = this.calculateMLSuitabilityScore({
      completeness,
      uniqueness,
      variance,
      dataType: isNumeric ? 'numeric' : 'categorical',
      outlierPercentage: distribution.outlierPercentage
    });

    return {
      featureName,
      dataType: isNumeric ? 'numeric' : 'categorical',
      quality: {
        completeness: Math.round(completeness),
        uniqueness: Math.round(uniqueness),
        consistency: this.assessFieldConsistency(allValues),
        validity: this.assessFieldValidity(values, featureName)
      },
      statistics,
      distribution,
      mlSuitability: {
        score: mlScore,
        variance,
        issues: this.identifyFeatureIssues({
          completeness,
          uniqueness,
          variance,
          outlierPercentage: distribution.outlierPercentage
        })
      },
      recommendations: this.generateFeatureRecommendations({
        featureName,
        completeness,
        uniqueness,
        variance,
        dataType: isNumeric ? 'numeric' : 'categorical'
      })
    };
  }

  /**
   * Validate data against cultivation-specific rules
   */
  static validateCultivationData(data: any[]): Array<{
    recordIndex: number;
    field: string;
    rule: string;
    message: string;
    severity: string;
  }> {
    const violations = [];

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      
      for (const rule of this.cultivationValidationRules) {
        const value = record[rule.field];
        
        if (value === null || value === undefined) {
          if (rule.type === 'required') {
            violations.push({
              recordIndex: i,
              field: rule.field,
              rule: rule.type,
              message: rule.message,
              severity: rule.severity
            });
          }
          continue;
        }

        switch (rule.type) {
          case 'numeric':
            if (isNaN(Number(value))) {
              violations.push({
                recordIndex: i,
                field: rule.field,
                rule: rule.type,
                message: rule.message,
                severity: rule.severity
              });
            }
            break;

          case 'range':
            const numValue = Number(value);
            if (!isNaN(numValue) && rule.parameters) {
              if (numValue < rule.parameters.min || numValue > rule.parameters.max) {
                violations.push({
                  recordIndex: i,
                  field: rule.field,
                  rule: rule.type,
                  message: rule.message,
                  severity: rule.severity
                });
              }
            }
            break;

          case 'categorical':
            if (rule.parameters?.allowedValues && 
                !rule.parameters.allowedValues.includes(value)) {
              violations.push({
                recordIndex: i,
                field: rule.field,
                rule: rule.type,
                message: rule.message,
                severity: rule.severity
              });
            }
            break;
        }
      }
    }

    return violations;
  }

  private static assessCompleteness(data: any[], fields: string[]) {
    const totalCells = data.length * fields.length;
    let nonNullCells = 0;
    const fieldsWithMissing = [];
    const criticalFieldsMissing = [];

    for (const field of fields) {
      let fieldNonNull = 0;
      for (const record of data) {
        if (record[field] !== null && record[field] !== undefined && record[field] !== '') {
          fieldNonNull++;
          nonNullCells++;
        }
      }
      
      if (fieldNonNull < data.length) {
        fieldsWithMissing.push(field);
        if (fieldNonNull / data.length < 0.5) {
          criticalFieldsMissing.push(field);
        }
      }
    }

    const missingPercentage = ((totalCells - nonNullCells) / totalCells) * 100;
    const score = Math.max(0, 100 - missingPercentage);

    return {
      score: Math.round(score),
      missingDataPercentage: Math.round(missingPercentage),
      fieldsWithMissingData: fieldsWithMissing,
      criticalFieldsMissing
    };
  }

  private static assessConsistency(data: any[], fields: string[]) {
    const inconsistentFields = [];
    let totalInconsistencies = 0;

    for (const field of fields) {
      const values = data.map(r => r[field]).filter(v => v != null);
      if (values.length === 0) continue;

      // Check data type consistency
      const types = new Set(values.map(v => typeof v));
      if (types.size > 1) {
        inconsistentFields.push({
          field,
          issue: `Mixed data types: ${Array.from(types).join(', ')}`,
          affectedRecords: values.length
        });
        totalInconsistencies++;
      }

      // Check format consistency for numeric fields
      if (types.has('string')) {
        const stringValues = values.filter(v => typeof v === 'string');
        const numericLike = stringValues.filter(v => !isNaN(Number(v)));
        if (numericLike.length > stringValues.length * 0.8) {
          inconsistentFields.push({
            field,
            issue: 'Mixed numeric and string formats',
            affectedRecords: stringValues.length - numericLike.length
          });
          totalInconsistencies++;
        }
      }
    }

    const score = Math.max(0, 100 - (totalInconsistencies * 10));
    
    return {
      score: Math.round(score),
      inconsistentFields
    };
  }

  private static assessAccuracy(data: any[], fields: string[]) {
    const outliers = [];
    const anomalies = [];
    
    for (const field of fields) {
      const values = data.map(r => r[field])
        .filter(v => v != null && !isNaN(Number(v)))
        .map(Number);
      
      if (values.length === 0) continue;

      // Detect outliers using IQR method
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      for (let i = 0; i < data.length; i++) {
        const value = Number(data[i][field]);
        if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
          outliers.push({
            field,
            value,
            expected: `${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}`,
            recordIndex: i
          });
        }
      }

      // Check for obvious anomalies
      if (values.some(v => v < 0) && ['temperature', 'humidity', 'ppfd'].includes(field)) {
        anomalies.push({
          field,
          description: 'Negative values detected for parameter that should be positive',
          severity: 'high' as const
        });
      }
    }

    const outlierPercentage = (outliers.length / data.length) * 100;
    const score = Math.max(0, 100 - outlierPercentage - (anomalies.length * 5));

    return {
      score: Math.round(score),
      outliers: outliers.slice(0, 20), // Limit to first 20 outliers
      anomalies
    };
  }

  private static assessValidity(data: any[]) {
    const violations = this.validateCultivationData(data);
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    
    const errorPenalty = (errorCount / data.length) * 100;
    const warningPenalty = (warningCount / data.length) * 50;
    const score = Math.max(0, 100 - errorPenalty - warningPenalty);

    return {
      score: Math.round(score),
      invalidRecords: errorCount,
      validationErrors: violations.slice(0, 50) // Limit to first 50 errors
    };
  }

  private static assessUniqueness(data: any[]) {
    // Simple duplicate detection based on all fields
    const serialized = data.map(record => JSON.stringify(record));
    const unique = new Set(serialized);
    const duplicateCount = data.length - unique.size;
    
    const duplicatePercentage = (duplicateCount / data.length) * 100;
    const score = Math.max(0, 100 - duplicatePercentage);

    return {
      score: Math.round(score),
      duplicateRecords: duplicateCount,
      duplicateFields: [] // Could be enhanced to check individual field duplicates
    };
  }

  private static assessMLReadiness(data: any[], fields: string[]) {
    return {
      sufficientData: data.length >= 100, // Minimum 100 records for ML
      balancedTarget: true, // Would need target variable analysis
      noDataLeakage: true, // Would need temporal analysis
      temporalConsistency: this.checkTemporalConsistency(data),
      featureVariability: this.checkFeatureVariability(data, fields)
    };
  }

  private static checkTemporalConsistency(data: any[]): boolean {
    // Check if timestamps are in order (if timestamp field exists)
    const timestampFields = ['timestamp', 'date', 'datetime', 'created_at'];
    const timeField = timestampFields.find(field => 
      data[0] && data[0][field] !== undefined
    );
    
    if (!timeField) return true; // No temporal data to check

    for (let i = 1; i < data.length; i++) {
      const prev = new Date(data[i-1][timeField]);
      const curr = new Date(data[i][timeField]);
      if (curr < prev) return false;
    }
    
    return true;
  }

  private static checkFeatureVariability(data: any[], fields: string[]): boolean {
    // Check that features have sufficient variability
    for (const field of fields) {
      const values = data.map(r => r[field]).filter(v => v != null);
      const unique = new Set(values);
      
      if (unique.size === 1) return false; // No variability
      if (unique.size / values.length < 0.01) return false; // Very low variability
    }
    
    return true;
  }

  private static calculateStatistics(values: number[]) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2
      : sorted[Math.floor(n/2)];
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    
    const skewness = values.reduce((acc, val) => acc + Math.pow((val - mean) / std, 3), 0) / n;
    const kurtosis = values.reduce((acc, val) => acc + Math.pow((val - mean) / std, 4), 0) / n - 3;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: Number(mean.toFixed(3)),
      median: Number(median.toFixed(3)),
      std: Number(std.toFixed(3)),
      skewness: Number(skewness.toFixed(3)),
      kurtosis: Number(kurtosis.toFixed(3))
    };
  }

  private static analyzeDistribution(values: number[]) {
    const stats = this.calculateStatistics(values);
    const { mean, std } = stats;
    
    // Simple outlier detection using standard deviation
    const outliers = values.filter(v => Math.abs(v - mean) > 3 * std);
    
    // Determine distribution type based on skewness
    let type: 'normal' | 'skewed' | 'uniform' | 'bimodal' | 'unknown' = 'unknown';
    if (Math.abs(stats.skewness) < 0.5) type = 'normal';
    else if (Math.abs(stats.skewness) > 1) type = 'skewed';
    
    return {
      type,
      outlierCount: outliers.length,
      outlierPercentage: (outliers.length / values.length) * 100
    };
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  }

  private static calculateMLSuitabilityScore(params: {
    completeness: number;
    uniqueness: number;
    variance: number;
    dataType: string;
    outlierPercentage: number;
  }): number {
    let score = 0;
    
    // Completeness (30% weight)
    score += (params.completeness / 100) * 30;
    
    // Uniqueness (20% weight)
    score += Math.min(params.uniqueness / 100, 1) * 20;
    
    // Variance (25% weight) - higher variance is better for ML
    if (params.dataType === 'numeric') {
      score += Math.min(params.variance / 100, 1) * 25;
    } else {
      score += (params.uniqueness > 10 ? 1 : params.uniqueness / 10) * 25;
    }
    
    // Outlier penalty (15% weight)
    score += Math.max(0, 1 - params.outlierPercentage / 20) * 15;
    
    // Data type bonus (10% weight)
    score += (params.dataType === 'numeric' ? 1 : 0.7) * 10;
    
    return Math.round(score);
  }

  private static assessFieldConsistency(values: any[]): number {
    const nonNullValues = values.filter(v => v != null);
    if (nonNullValues.length === 0) return 0;
    
    const types = new Set(nonNullValues.map(v => typeof v));
    return types.size === 1 ? 100 : Math.max(0, 100 - (types.size - 1) * 25);
  }

  private static assessFieldValidity(values: any[], fieldName: string): number {
    const rule = this.cultivationValidationRules.find(r => r.field === fieldName);
    if (!rule) return 100;
    
    const violations = values.filter(value => {
      if (rule.type === 'range' && rule.parameters) {
        const numValue = Number(value);
        return !isNaN(numValue) && 
               (numValue < rule.parameters.min || numValue > rule.parameters.max);
      }
      return false;
    });
    
    return Math.max(0, 100 - (violations.length / values.length) * 100);
  }

  private static identifyFeatureIssues(params: {
    completeness: number;
    uniqueness: number;
    variance: number;
    outlierPercentage: number;
  }): string[] {
    const issues = [];
    
    if (params.completeness < 80) {
      issues.push('High percentage of missing values');
    }
    if (params.uniqueness < 5) {
      issues.push('Very low variability - mostly constant values');
    }
    if (params.variance < 0.01) {
      issues.push('Extremely low variance - may not be useful for ML');
    }
    if (params.outlierPercentage > 10) {
      issues.push('High percentage of outliers detected');
    }
    
    return issues;
  }

  private static generateFeatureRecommendations(params: {
    featureName: string;
    completeness: number;
    uniqueness: number;
    variance: number;
    dataType: string;
  }): string[] {
    const recommendations = [];
    
    if (params.completeness < 80) {
      recommendations.push('Consider imputation strategies for missing values');
    }
    if (params.uniqueness < 5) {
      recommendations.push('Consider removing this feature due to low variability');
    }
    if (params.dataType === 'numeric' && params.variance > 1000) {
      recommendations.push('Consider normalizing or standardizing this feature');
    }
    
    return recommendations;
  }

  private static getQualityGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private static generateRecommendations(assessment: any): string[] {
    const recommendations = [];
    
    if (assessment.completeness.score < 80) {
      recommendations.push('Improve data completeness by collecting missing values or using imputation');
    }
    if (assessment.consistency.score < 80) {
      recommendations.push('Standardize data formats and fix type inconsistencies');
    }
    if (assessment.accuracy.score < 80) {
      recommendations.push('Review and clean outliers and anomalies in the data');
    }
    if (assessment.validity.score < 80) {
      recommendations.push('Fix validation errors and ensure data meets cultivation standards');
    }
    if (!assessment.mlReadinessChecks.sufficientData) {
      recommendations.push('Collect more data - minimum 100 records recommended for ML');
    }
    
    return recommendations;
  }
}

export default MLDataValidationService;