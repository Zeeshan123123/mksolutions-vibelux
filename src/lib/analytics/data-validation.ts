/**
 * Data Validation and Quality Monitoring Service
 * Ensures data integrity and quality for analytics pipeline
 */

import { prisma } from '@/lib/prisma';

export interface ValidationRule {
  field: string;
  type: 'range' | 'required' | 'format' | 'consistency' | 'outlier';
  constraint: any;
  severity: 'warning' | 'error' | 'critical';
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
  criticalIssues: ValidationIssue[];
  dataQualityScore: number;
  recommendations: string[];
}

export interface ValidationIssue {
  rule: string;
  field: string;
  value: any;
  expectedValue?: any;
  severity: 'warning' | 'error' | 'critical';
  description: string;
  recordId?: string;
  timestamp: Date;
}

export interface DataQualityReport {
  facilityId: string;
  period: { start: Date; end: Date };
  overallScore: number;
  metrics: {
    completeness: number; // % of required fields populated
    accuracy: number;     // % of values within expected ranges
    consistency: number;  // % of data consistent across sources
    timeliness: number;   // % of data received on time
    validity: number;     // % of data matching format requirements
  };
  issuesSummary: {
    critical: number;
    errors: number;
    warnings: number;
  };
  trends: Array<{
    date: string;
    score: number;
    issues: number;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    impact: string;
  }>;
}

export class DataValidationService {
  private validationRules: Map<string, ValidationRule[]> = new Map();

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * Initialize validation rules for different data types
   */
  private initializeValidationRules() {
    // Sensor data validation rules
    const sensorRules: ValidationRule[] = [
      {
        field: 'temperature',
        type: 'range',
        constraint: { min: 10, max: 45 },
        severity: 'error',
        description: 'Temperature must be between 10°C and 45°C'
      },
      {
        field: 'humidity',
        type: 'range',
        constraint: { min: 0, max: 100 },
        severity: 'error',
        description: 'Humidity must be between 0% and 100%'
      },
      {
        field: 'co2',
        type: 'range',
        constraint: { min: 300, max: 2000 },
        severity: 'warning',
        description: 'CO2 levels outside optimal range (300-2000 ppm)'
      },
      {
        field: 'power',
        type: 'range',
        constraint: { min: 0, max: 10000 },
        severity: 'error',
        description: 'Power consumption must be positive and realistic'
      },
      {
        field: 'timestamp',
        type: 'required',
        constraint: null,
        severity: 'critical',
        description: 'Timestamp is required for all sensor readings'
      }
    ];

    // Harvest data validation rules
    const harvestRules: ValidationRule[] = [
      {
        field: 'actualYield',
        type: 'range',
        constraint: { min: 0, max: 1000 },
        severity: 'error',
        description: 'Yield must be positive and realistic (0-1000 kg)'
      },
      {
        field: 'plantCount',
        type: 'range',
        constraint: { min: 1, max: 10000 },
        severity: 'error',
        description: 'Plant count must be positive and realistic'
      },
      {
        field: 'harvestDate',
        type: 'required',
        constraint: null,
        severity: 'critical',
        description: 'Harvest date is required'
      },
      {
        field: 'qualityGrade',
        type: 'format',
        constraint: { pattern: /^[A-D]$/ },
        severity: 'warning',
        description: 'Quality grade must be A, B, C, or D'
      }
    ];

    // Financial data validation rules
    const financialRules: ValidationRule[] = [
      {
        field: 'amount',
        type: 'range',
        constraint: { min: 0, max: 1000000 },
        severity: 'error',
        description: 'Financial amounts must be positive and realistic'
      },
      {
        field: 'pricePerUnit',
        type: 'range',
        constraint: { min: 0.01, max: 10000 },
        severity: 'warning',
        description: 'Price per unit seems outside normal range'
      },
      {
        field: 'currency',
        type: 'format',
        constraint: { pattern: /^[A-Z]{3}$/ },
        severity: 'error',
        description: 'Currency must be 3-letter ISO code (e.g., USD)'
      }
    ];

    this.validationRules.set('sensor', sensorRules);
    this.validationRules.set('harvest', harvestRules);
    this.validationRules.set('financial', financialRules);
  }

  /**
   * Validate sensor reading data
   */
  async validateSensorData(
    facilityId: string,
    sensorData: any[],
    recordTimestamp?: Date
  ): Promise<ValidationResult> {
    const rules = this.validationRules.get('sensor') || [];
    const issues: ValidationIssue[] = [];

    for (const reading of sensorData) {
      for (const rule of rules) {
        const issue = this.applyValidationRule(reading, rule, recordTimestamp);
        if (issue) {
          issues.push(issue);
        }
      }

      // Additional outlier detection
      if (reading.sensorType && reading.value !== null) {
        const outlierIssue = await this.detectOutliers(
          facilityId,
          reading.sensorType,
          reading.value,
          recordTimestamp || new Date()
        );
        if (outlierIssue) {
          issues.push(outlierIssue);
        }
      }
    }

    return this.generateValidationResult(issues);
  }

  /**
   * Validate harvest data
   */
  async validateHarvestData(
    facilityId: string,
    harvestData: any[],
    recordTimestamp?: Date
  ): Promise<ValidationResult> {
    const rules = this.validationRules.get('harvest') || [];
    const issues: ValidationIssue[] = [];

    for (const harvest of harvestData) {
      for (const rule of rules) {
        const issue = this.applyValidationRule(harvest, rule, recordTimestamp);
        if (issue) {
          issues.push(issue);
        }
      }

      // Consistency checks
      const consistencyIssues = await this.checkHarvestConsistency(facilityId, harvest);
      issues.push(...consistencyIssues);
    }

    return this.generateValidationResult(issues);
  }

  /**
   * Validate financial data
   */
  async validateFinancialData(
    facilityId: string,
    financialData: any[],
    recordTimestamp?: Date
  ): Promise<ValidationResult> {
    const rules = this.validationRules.get('financial') || [];
    const issues: ValidationIssue[] = [];

    for (const transaction of financialData) {
      for (const rule of rules) {
        const issue = this.applyValidationRule(transaction, rule, recordTimestamp);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return this.generateValidationResult(issues);
  }

  /**
   * Generate comprehensive data quality report
   */
  async generateDataQualityReport(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DataQualityReport> {
    // Validate all data types for the period
    const sensorData = await this.getSensorDataForPeriod(facilityId, startDate, endDate);
    const harvestData = await this.getHarvestDataForPeriod(facilityId, startDate, endDate);
    const financialData = await this.getFinancialDataForPeriod(facilityId, startDate, endDate);

    const [sensorValidation, harvestValidation, financialValidation] = await Promise.all([
      this.validateSensorData(facilityId, sensorData),
      this.validateHarvestData(facilityId, harvestData),
      this.validateFinancialData(facilityId, financialData)
    ]);

    // Calculate overall metrics
    const totalRecords = sensorData.length + harvestData.length + financialData.length;
    const totalIssues = sensorValidation.warnings.length + sensorValidation.errors.length + 
                       sensorValidation.criticalIssues.length + harvestValidation.warnings.length + 
                       harvestValidation.errors.length + harvestValidation.criticalIssues.length +
                       financialValidation.warnings.length + financialValidation.errors.length + 
                       financialValidation.criticalIssues.length;

    const completeness = this.calculateCompleteness(sensorData, harvestData, financialData);
    const accuracy = this.calculateAccuracy(sensorValidation, harvestValidation, financialValidation);
    const consistency = await this.calculateConsistency(facilityId, startDate, endDate);
    const timeliness = await this.calculateTimeliness(facilityId, startDate, endDate);
    const validity = this.calculateValidity(sensorValidation, harvestValidation, financialValidation);

    const overallScore = (completeness + accuracy + consistency + timeliness + validity) / 5;

    // Generate trends (last 30 days)
    const trends = await this.generateQualityTrends(facilityId, startDate, endDate);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      { completeness, accuracy, consistency, timeliness, validity },
      [sensorValidation, harvestValidation, financialValidation]
    );

    return {
      facilityId,
      period: { start: startDate, end: endDate },
      overallScore,
      metrics: {
        completeness,
        accuracy,
        consistency,
        timeliness,
        validity
      },
      issuesSummary: {
        critical: [sensorValidation, harvestValidation, financialValidation].reduce((sum, v) => sum + v.criticalIssues.length, 0),
        errors: [sensorValidation, harvestValidation, financialValidation].reduce((sum, v) => sum + v.errors.length, 0),
        warnings: [sensorValidation, harvestValidation, financialValidation].reduce((sum, v) => sum + v.warnings.length, 0)
      },
      trends,
      recommendations
    };
  }

  /**
   * Apply individual validation rule
   */
  private applyValidationRule(
    data: any,
    rule: ValidationRule,
    timestamp?: Date
  ): ValidationIssue | null {
    const value = data[rule.field];

    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          return {
            rule: rule.field + '_required',
            field: rule.field,
            value,
            severity: rule.severity,
            description: rule.description,
            recordId: data.id,
            timestamp: timestamp || new Date()
          };
        }
        break;

      case 'range':
        if (value !== null && value !== undefined) {
          const { min, max } = rule.constraint;
          if (value < min || value > max) {
            return {
              rule: rule.field + '_range',
              field: rule.field,
              value,
              expectedValue: `${min}-${max}`,
              severity: rule.severity,
              description: rule.description,
              recordId: data.id,
              timestamp: timestamp || new Date()
            };
          }
        }
        break;

      case 'format':
        if (value !== null && value !== undefined) {
          const { pattern } = rule.constraint;
          if (!pattern.test(String(value))) {
            return {
              rule: rule.field + '_format',
              field: rule.field,
              value,
              severity: rule.severity,
              description: rule.description,
              recordId: data.id,
              timestamp: timestamp || new Date()
            };
          }
        }
        break;
    }

    return null;
  }

  /**
   * Detect outliers using statistical methods
   */
  private async detectOutliers(
    facilityId: string,
    sensorType: string,
    value: number,
    timestamp: Date
  ): Promise<ValidationIssue | null> {
    // Get recent readings for statistical analysis
    const recentReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType,
        timestamp: {
          gte: new Date(timestamp.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          lt: timestamp
        }
      },
      select: { value: true },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    if (recentReadings.length < 10) return null; // Not enough data for outlier detection

    const values = recentReadings.map(r => r.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Z-score based outlier detection (3-sigma rule)
    const zScore = Math.abs((value - mean) / stdDev);
    
    if (zScore > 3) {
      return {
        rule: 'outlier_detection',
        field: sensorType,
        value,
        expectedValue: `${mean.toFixed(2)} ± ${(3 * stdDev).toFixed(2)}`,
        severity: zScore > 4 ? 'error' : 'warning',
        description: `Value is ${zScore.toFixed(2)} standard deviations from the mean`,
        timestamp
      };
    }

    return null;
  }

  /**
   * Check harvest data consistency
   */
  private async checkHarvestConsistency(
    facilityId: string,
    harvestData: any
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check yield per plant ratio
    if (harvestData.actualYield && harvestData.plantCount) {
      const yieldPerPlant = harvestData.actualYield / harvestData.plantCount;
      
      // Typical yield per plant: 50-500g (0.05-0.5 kg)
      if (yieldPerPlant < 0.02 || yieldPerPlant > 1) {
        issues.push({
          rule: 'yield_per_plant_consistency',
          field: 'actualYield',
          value: yieldPerPlant,
          expectedValue: '0.05-0.5 kg per plant',
          severity: 'warning',
          description: `Yield per plant (${yieldPerPlant.toFixed(3)} kg) seems unusual`,
          recordId: harvestData.id,
          timestamp: new Date()
        });
      }
    }

    // Check harvest date vs zone data
    if (harvestData.zoneId && harvestData.harvestDate) {
      const zone = await prisma.zone.findUnique({
        where: { id: harvestData.zoneId }
      });

      if (zone?.plantingDate) {
        const growthPeriod = (harvestData.harvestDate.getTime() - zone.plantingDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Cannabis typically takes 60-120 days from seed to harvest
        if (growthPeriod < 30 || growthPeriod > 200) {
          issues.push({
            rule: 'growth_period_consistency',
            field: 'harvestDate',
            value: growthPeriod,
            expectedValue: '60-120 days',
            severity: 'warning',
            description: `Growth period (${Math.round(growthPeriod)} days) seems unusual`,
            recordId: harvestData.id,
            timestamp: new Date()
          });
        }
      }
    }

    return issues;
  }

  /**
   * Generate validation result summary
   */
  private generateValidationResult(issues: ValidationIssue[]): ValidationResult {
    const warnings = issues.filter(issue => issue.severity === 'warning');
    const errors = issues.filter(issue => issue.severity === 'error');
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');

    const isValid = errors.length === 0 && criticalIssues.length === 0;
    
    // Calculate data quality score (0-100)
    const totalIssues = issues.length;
    const weightedIssues = criticalIssues.length * 3 + errors.length * 2 + warnings.length * 1;
    const dataQualityScore = totalIssues === 0 ? 100 : Math.max(0, 100 - weightedIssues * 5);

    const recommendations = this.generateValidationRecommendations(issues);

    return {
      isValid,
      warnings,
      errors,
      criticalIssues,
      dataQualityScore,
      recommendations
    };
  }

  /**
   * Calculate data completeness percentage
   */
  private calculateCompleteness(sensorData: any[], harvestData: any[], financialData: any[]): number {
    const allData = [...sensorData, ...harvestData, ...financialData];
    if (allData.length === 0) return 100;

    const requiredFields = ['timestamp', 'value', 'facilityId']; // Core required fields
    let completeRecords = 0;

    for (const record of allData) {
      const isComplete = requiredFields.every(field => 
        record[field] !== null && record[field] !== undefined && record[field] !== ''
      );
      if (isComplete) completeRecords++;
    }

    return (completeRecords / allData.length) * 100;
  }

  /**
   * Calculate data accuracy percentage
   */
  private calculateAccuracy(...validationResults: ValidationResult[]): number {
    const totalRecords = validationResults.reduce((sum, result) => 
      sum + result.warnings.length + result.errors.length + result.criticalIssues.length, 0
    );
    
    if (totalRecords === 0) return 100;

    const inaccurateRecords = validationResults.reduce((sum, result) => 
      sum + result.errors.length + result.criticalIssues.length, 0
    );

    return Math.max(0, ((totalRecords - inaccurateRecords) / totalRecords) * 100);
  }

  /**
   * Calculate data consistency across sources
   */
  private async calculateConsistency(facilityId: string, startDate: Date, endDate: Date): Promise<number> {
    // Compare sensor data with manual entries, harvest data with sales data, etc.
    // For now, return a placeholder score
    return 85;
  }

  /**
   * Calculate data timeliness score
   */
  private async calculateTimeliness(facilityId: string, startDate: Date, endDate: Date): Promise<number> {
    // Check if data is received within expected timeframes
    // For now, return a placeholder score
    return 90;
  }

  /**
   * Calculate format validity percentage
   */
  private calculateValidity(...validationResults: ValidationResult[]): number {
    const totalRecords = validationResults.reduce((sum, result) => 
      sum + result.warnings.length + result.errors.length + result.criticalIssues.length, 0
    );
    
    if (totalRecords === 0) return 100;

    const formatErrors = validationResults.reduce((sum, result) => 
      sum + result.errors.filter(e => e.rule.includes('_format')).length, 0
    );

    return Math.max(0, ((totalRecords - formatErrors) / totalRecords) * 100);
  }

  /**
   * Generate quality trends over time
   */
  private async generateQualityTrends(
    facilityId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Array<{ date: string; score: number; issues: number }>> {
    // Generate daily quality scores for the period
    const trends = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      
      // Get data for this day and calculate score
      const dayScore = Math.floor(Math.random() * 20) + 80; // Placeholder: 80-100
      const dayIssues = Math.floor(Math.random() * 5); // Placeholder: 0-5 issues
      
      trends.push({
        date: currentDate.toISOString().split('T')[0],
        score: dayScore,
        issues: dayIssues
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return trends;
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(
    metrics: any,
    validationResults: ValidationResult[]
  ): Array<{ priority: 'high' | 'medium' | 'low'; category: string; description: string; impact: string }> {
    const recommendations = [];

    if (metrics.completeness < 90) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Data Completeness',
        description: 'Implement required field validation and default value handling',
        impact: 'Improve analytics accuracy and reporting completeness'
      });
    }

    if (metrics.accuracy < 85) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Data Accuracy',
        description: 'Add real-time validation and outlier detection for sensor readings',
        impact: 'Reduce false alerts and improve operational decisions'
      });
    }

    const totalCritical = validationResults.reduce((sum, result) => sum + result.criticalIssues.length, 0);
    if (totalCritical > 0) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Critical Issues',
        description: 'Address critical data validation failures immediately',
        impact: 'Prevent system failures and data corruption'
      });
    }

    return recommendations;
  }

  /**
   * Generate specific validation recommendations
   */
  private generateValidationRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations = [];
    const issueTypes = new Set(issues.map(issue => issue.rule));

    if (issueTypes.has('temperature_range')) {
      recommendations.push('Check temperature sensor calibration and environmental controls');
    }

    if (issueTypes.has('outlier_detection')) {
      recommendations.push('Investigate sudden changes in sensor readings - check for equipment malfunctions');
    }

    if (issueTypes.has('yield_per_plant_consistency')) {
      recommendations.push('Verify plant count accuracy and harvest measurement procedures');
    }

    return recommendations;
  }

  // Helper methods to fetch data for validation
  private async getSensorDataForPeriod(facilityId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await prisma.sensorReading.findMany({
      where: {
        facilityId,
        timestamp: { gte: startDate, lte: endDate }
      }
    });
  }

  private async getHarvestDataForPeriod(facilityId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: { gte: startDate, lte: endDate }
      }
    });
  }

  private async getFinancialDataForPeriod(facilityId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const [sales, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: {
          facilityId,
          saleDate: { gte: startDate, lte: endDate }
        }
      }),
      prisma.expense.findMany({
        where: {
          facilityId,
          date: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return [...sales, ...expenses];
  }
}

// Export singleton instance
export const dataValidationService = new DataValidationService();