/**
 * Utility Data Validation and Verification System
 * Ensures data quality and accuracy across all utility data sources
 */

import { EventEmitter } from 'events';
import { UsageData, BillingData } from './types';
import { ParsedBillData } from './bill-parser';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 quality score
  issues: ValidationIssue[];
  recommendations: string[];
  metadata: ValidationMetadata;
}

export interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'data_quality' | 'consistency' | 'completeness' | 'accuracy';
  field: string;
  message: string;
  expectedValue?: any;
  actualValue?: any;
  confidence: number; // 0-100
}

export interface ValidationMetadata {
  validationDate: Date;
  dataSource: string;
  recordCount: number;
  coveragePeriod: {
    start: Date;
    end: Date;
    days: number;
  };
  completeness: number; // 0-100%
  accuracy: number; // 0-100%
  consistency: number; // 0-100%
}

export interface ValidationRules {
  usage: {
    minValue: number;
    maxValue: number;
    expectedUnit: string;
    seasonalVariation: number; // %
    yearOverYearVariation: number; // %
  };
  billing: {
    minAmount: number;
    maxAmount: number;
    expectedCurrency: string;
    rateConsistency: number; // %
    chargeBreakdown: {
      energyMin: number; // % of total
      energyMax: number; // % of total
      demandMax: number; // % of total
      taxesMax: number; // % of total
    };
  };
  temporal: {
    maxGapHours: number;
    minCoverage: number; // % of expected intervals
    requiredConsecutiveDays: number;
  };
  consistency: {
    billVsUsageVariance: number; // %
    meterReadingVariance: number; // %
    rateCalculationVariance: number; // %
  };
}

export class UtilityDataValidator extends EventEmitter {
  private rules: ValidationRules;
  private benchmarks: Map<string, any> = new Map();

  constructor(rules?: Partial<ValidationRules>) {
    super();
    this.rules = {
      usage: {
        minValue: 0,
        maxValue: 1000000, // 1M kWh per month
        expectedUnit: 'kWh',
        seasonalVariation: 50, // 50% variation is normal
        yearOverYearVariation: 30 // 30% YoY variation is normal
      },
      billing: {
        minAmount: 0,
        maxAmount: 100000, // $100k per month
        expectedCurrency: 'USD',
        rateConsistency: 20, // 20% rate variation is normal
        chargeBreakdown: {
          energyMin: 40, // Energy should be at least 40% of bill
          energyMax: 85, // Energy should be at most 85% of bill
          demandMax: 40, // Demand should be at most 40% of bill
          taxesMax: 15 // Taxes should be at most 15% of bill
        }
      },
      temporal: {
        maxGapHours: 24, // Max 24 hour gap in data
        minCoverage: 95, // 95% coverage required
        requiredConsecutiveDays: 28 // Need 28 consecutive days
      },
      consistency: {
        billVsUsageVariance: 15, // 15% variance allowed
        meterReadingVariance: 5, // 5% variance allowed
        rateCalculationVariance: 10 // 10% variance allowed
      },
      ...rules
    };

    this.loadBenchmarks();
  }

  /**
   * Validate usage data array
   */
  validateUsageData(data: UsageData[], facilityId?: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const metadata: ValidationMetadata = {
      validationDate: new Date(),
      dataSource: 'usage_data',
      recordCount: data.length,
      coveragePeriod: this.getCoveragePeriod(data),
      completeness: 0,
      accuracy: 0,
      consistency: 0
    };

    // Validate data completeness
    const completenessIssues = this.validateDataCompleteness(data);
    issues.push(...completenessIssues);

    // Validate individual readings
    const readingIssues = this.validateUsageReadings(data);
    issues.push(...readingIssues);

    // Validate temporal consistency
    const temporalIssues = this.validateTemporalConsistency(data);
    issues.push(...temporalIssues);

    // Validate seasonal patterns
    const seasonalIssues = this.validateSeasonalPatterns(data);
    issues.push(...seasonalIssues);

    // Calculate quality metrics
    metadata.completeness = this.calculateCompleteness(data);
    metadata.accuracy = this.calculateAccuracy(issues);
    metadata.consistency = this.calculateConsistency(issues);

    const score = this.calculateOverallScore(metadata, issues);
    const isValid = score >= 70 && issues.filter(i => i.severity === 'critical').length === 0;

    return {
      isValid,
      score,
      issues,
      recommendations: this.generateRecommendations(issues),
      metadata
    };
  }

  /**
   * Validate billing data array
   */
  validateBillingData(data: BillingData[], usageData?: UsageData[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    const metadata: ValidationMetadata = {
      validationDate: new Date(),
      dataSource: 'billing_data',
      recordCount: data.length,
      coveragePeriod: this.getBillingCoveragePeriod(data),
      completeness: 0,
      accuracy: 0,
      consistency: 0
    };

    // Validate billing amounts
    const amountIssues = this.validateBillingAmounts(data);
    issues.push(...amountIssues);

    // Validate charge breakdowns
    const chargeIssues = this.validateChargeBreakdowns(data);
    issues.push(...chargeIssues);

    // Validate rate consistency
    const rateIssues = this.validateRateConsistency(data);
    issues.push(...rateIssues);

    // Cross-validate with usage data if available
    if (usageData) {
      const crossValidationIssues = this.crossValidateBillingWithUsage(data, usageData);
      issues.push(...crossValidationIssues);
    }

    // Calculate quality metrics
    metadata.completeness = this.calculateBillingCompleteness(data);
    metadata.accuracy = this.calculateAccuracy(issues);
    metadata.consistency = this.calculateConsistency(issues);

    const score = this.calculateOverallScore(metadata, issues);
    const isValid = score >= 70 && issues.filter(i => i.severity === 'critical').length === 0;

    return {
      isValid,
      score,
      issues,
      recommendations: this.generateRecommendations(issues),
      metadata
    };
  }

  /**
   * Validate parsed bill data
   */
  validateParsedBill(data: ParsedBillData): ValidationResult {
    const issues: ValidationIssue[] = [];
    const metadata: ValidationMetadata = {
      validationDate: new Date(),
      dataSource: 'parsed_bill',
      recordCount: 1,
      coveragePeriod: {
        start: data.billingPeriod.startDate,
        end: data.billingPeriod.endDate,
        days: data.billingPeriod.days
      },
      completeness: 0,
      accuracy: 0,
      consistency: 0
    };

    // Validate required fields
    const requiredFieldIssues = this.validateRequiredFields(data);
    issues.push(...requiredFieldIssues);

    // Validate account information
    const accountIssues = this.validateAccountInformation(data);
    issues.push(...accountIssues);

    // Validate usage values
    const usageIssues = this.validateParsedUsage(data);
    issues.push(...usageIssues);

    // Validate billing period
    const periodIssues = this.validateBillingPeriod(data);
    issues.push(...periodIssues);

    // Validate charge calculations
    const chargeIssues = this.validateChargeCalculations(data);
    issues.push(...chargeIssues);

    // Calculate quality metrics
    metadata.completeness = this.calculateParsedBillCompleteness(data);
    metadata.accuracy = this.calculateAccuracy(issues);
    metadata.consistency = this.calculateConsistency(issues);

    const score = this.calculateOverallScore(metadata, issues);
    const isValid = score >= 60 && issues.filter(i => i.severity === 'critical').length === 0;

    return {
      isValid,
      score,
      issues,
      recommendations: this.generateRecommendations(issues),
      metadata
    };
  }

  /**
   * Validate data completeness
   */
  private validateDataCompleteness(data: UsageData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (data.length === 0) {
      issues.push({
        severity: 'critical',
        category: 'completeness',
        field: 'data_array',
        message: 'No usage data provided',
        confidence: 100
      });
      return issues;
    }

    // Check for gaps in data
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const expectedInterval = this.detectExpectedInterval(sortedData);
    
    for (let i = 1; i < sortedData.length; i++) {
      const gap = sortedData[i].timestamp.getTime() - sortedData[i-1].timestamp.getTime();
      const expectedGap = expectedInterval * 1000; // Convert to milliseconds
      
      if (gap > expectedGap * 2) { // Allow 2x tolerance
        issues.push({
          severity: 'warning',
          category: 'completeness',
          field: 'timestamp',
          message: `Data gap detected: ${Math.round(gap / 1000 / 60)} minutes`,
          confidence: 95
        });
      }
    }

    return issues;
  }

  /**
   * Validate individual usage readings
   */
  private validateUsageReadings(data: UsageData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const [index, reading] of data.entries()) {
      // Check for negative values
      if (reading.usage < 0) {
        issues.push({
          severity: 'critical',
          category: 'data_quality',
          field: 'usage',
          message: `Negative usage value: ${reading.usage}`,
          actualValue: reading.usage,
          confidence: 100
        });
      }

      // Check for unrealistic values
      if (reading.usage > this.rules.usage.maxValue) {
        issues.push({
          severity: 'critical',
          category: 'data_quality',
          field: 'usage',
          message: `Unrealistic usage value: ${reading.usage}`,
          actualValue: reading.usage,
          expectedValue: `< ${this.rules.usage.maxValue}`,
          confidence: 90
        });
      }

      // Check for unit consistency
      if (reading.unit !== this.rules.usage.expectedUnit) {
        issues.push({
          severity: 'warning',
          category: 'consistency',
          field: 'unit',
          message: `Unexpected unit: ${reading.unit}`,
          actualValue: reading.unit,
          expectedValue: this.rules.usage.expectedUnit,
          confidence: 85
        });
      }

      // Check for outliers
      if (index > 0) {
        const previousReading = data[index - 1];
        const change = Math.abs(reading.usage - previousReading.usage);
        const changePercent = (change / previousReading.usage) * 100;
        
        if (changePercent > 500) { // 500% change is likely an error
          issues.push({
            severity: 'warning',
            category: 'data_quality',
            field: 'usage',
            message: `Possible outlier: ${changePercent.toFixed(1)}% change`,
            actualValue: reading.usage,
            confidence: 80
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate temporal consistency
   */
  private validateTemporalConsistency(data: UsageData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (data.length < 2) return issues;

    // Check timestamp ordering
    for (let i = 1; i < data.length; i++) {
      if (data[i].timestamp <= data[i-1].timestamp) {
        issues.push({
          severity: 'critical',
          category: 'consistency',
          field: 'timestamp',
          message: 'Timestamps are not in chronological order',
          confidence: 100
        });
        break;
      }
    }

    // Check for future timestamps
    const now = new Date();
    for (const reading of data) {
      if (reading.timestamp > now) {
        issues.push({
          severity: 'warning',
          category: 'data_quality',
          field: 'timestamp',
          message: 'Future timestamp detected',
          actualValue: reading.timestamp,
          confidence: 95
        });
      }
    }

    return issues;
  }

  /**
   * Validate seasonal patterns
   */
  private validateSeasonalPatterns(data: UsageData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Group data by month
    const monthlyData = new Map<number, number[]>();
    for (const reading of data) {
      const month = reading.timestamp.getMonth();
      if (!monthlyData.has(month)) {
        monthlyData.set(month, []);
      }
      monthlyData.get(month)!.push(reading.usage);
    }

    // Check for unrealistic seasonal variations
    if (monthlyData.size >= 12) {
      const monthlyAverages = Array.from(monthlyData.entries()).map(([month, values]) => ({
        month,
        average: values.reduce((sum, val) => sum + val, 0) / values.length
      }));

      const overallAverage = monthlyAverages.reduce((sum, data) => sum + data.average, 0) / monthlyAverages.length;
      const maxDeviation = Math.max(...monthlyAverages.map(data => Math.abs(data.average - overallAverage)));
      const deviationPercent = (maxDeviation / overallAverage) * 100;

      if (deviationPercent > this.rules.usage.seasonalVariation) {
        issues.push({
          severity: 'warning',
          category: 'data_quality',
          field: 'seasonal_pattern',
          message: `High seasonal variation: ${deviationPercent.toFixed(1)}%`,
          actualValue: deviationPercent,
          expectedValue: `< ${this.rules.usage.seasonalVariation}%`,
          confidence: 70
        });
      }
    }

    return issues;
  }

  /**
   * Validate billing amounts
   */
  private validateBillingAmounts(data: BillingData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const bill of data) {
      // Check for negative amounts
      if (bill.totalAmount < 0) {
        issues.push({
          severity: 'critical',
          category: 'data_quality',
          field: 'totalAmount',
          message: `Negative total amount: ${bill.totalAmount}`,
          actualValue: bill.totalAmount,
          confidence: 100
        });
      }

      // Check for unrealistic amounts
      if (bill.totalAmount > this.rules.billing.maxAmount) {
        issues.push({
          severity: 'warning',
          category: 'data_quality',
          field: 'totalAmount',
          message: `High billing amount: $${bill.totalAmount}`,
          actualValue: bill.totalAmount,
          expectedValue: `< $${this.rules.billing.maxAmount}`,
          confidence: 85
        });
      }

      // Check for zero amounts (which might be valid)
      if (bill.totalAmount === 0) {
        issues.push({
          severity: 'info',
          category: 'data_quality',
          field: 'totalAmount',
          message: 'Zero billing amount detected',
          actualValue: bill.totalAmount,
          confidence: 70
        });
      }
    }

    return issues;
  }

  /**
   * Validate charge breakdowns
   */
  private validateChargeBreakdowns(data: BillingData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const bill of data) {
      const total = bill.totalAmount;
      if (total === 0) continue;

      const energyPercent = (bill.energyCharges / total) * 100;
      const demandPercent = ((bill.demandCharges || 0) / total) * 100;
      const taxesPercent = ((bill.taxes || 0) / total) * 100;

      // Check energy charges percentage
      if (energyPercent < this.rules.billing.chargeBreakdown.energyMin) {
        issues.push({
          severity: 'warning',
          category: 'consistency',
          field: 'energyCharges',
          message: `Low energy charges: ${energyPercent.toFixed(1)}%`,
          actualValue: energyPercent,
          expectedValue: `> ${this.rules.billing.chargeBreakdown.energyMin}%`,
          confidence: 80
        });
      }

      // Check demand charges percentage
      if (demandPercent > this.rules.billing.chargeBreakdown.demandMax) {
        issues.push({
          severity: 'warning',
          category: 'consistency',
          field: 'demandCharges',
          message: `High demand charges: ${demandPercent.toFixed(1)}%`,
          actualValue: demandPercent,
          expectedValue: `< ${this.rules.billing.chargeBreakdown.demandMax}%`,
          confidence: 80
        });
      }

      // Check taxes percentage
      if (taxesPercent > this.rules.billing.chargeBreakdown.taxesMax) {
        issues.push({
          severity: 'warning',
          category: 'consistency',
          field: 'taxes',
          message: `High taxes: ${taxesPercent.toFixed(1)}%`,
          actualValue: taxesPercent,
          expectedValue: `< ${this.rules.billing.chargeBreakdown.taxesMax}%`,
          confidence: 75
        });
      }
    }

    return issues;
  }

  /**
   * Cross-validate billing with usage data
   */
  private crossValidateBillingWithUsage(billingData: BillingData[], usageData: UsageData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Group usage data by month to compare with bills
    const monthlyUsage = new Map<string, number>();
    for (const reading of usageData) {
      const monthKey = `${reading.timestamp.getFullYear()}-${reading.timestamp.getMonth()}`;
      monthlyUsage.set(monthKey, (monthlyUsage.get(monthKey) || 0) + reading.usage);
    }

    for (const bill of billingData) {
      const billMonthKey = `${bill.billDate.getFullYear()}-${bill.billDate.getMonth()}`;
      const usageForMonth = monthlyUsage.get(billMonthKey);

      if (usageForMonth) {
        const variance = Math.abs(bill.usage - usageForMonth);
        const variancePercent = (variance / bill.usage) * 100;

        if (variancePercent > this.rules.consistency.billVsUsageVariance) {
          issues.push({
            severity: 'warning',
            category: 'consistency',
            field: 'usage_consistency',
            message: `Bill vs usage variance: ${variancePercent.toFixed(1)}%`,
            actualValue: variancePercent,
            expectedValue: `< ${this.rules.consistency.billVsUsageVariance}%`,
            confidence: 85
          });
        }
      }
    }

    return issues;
  }

  // Helper methods
  private getCoveragePeriod(data: UsageData[]): { start: Date; end: Date; days: number } {
    if (data.length === 0) {
      return { start: new Date(), end: new Date(), days: 0 };
    }

    const sorted = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const start = sorted[0].timestamp;
    const end = sorted[sorted.length - 1].timestamp;
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return { start, end, days };
  }

  private getBillingCoveragePeriod(data: BillingData[]): { start: Date; end: Date; days: number } {
    if (data.length === 0) {
      return { start: new Date(), end: new Date(), days: 0 };
    }

    const sorted = [...data].sort((a, b) => a.billDate.getTime() - b.billDate.getTime());
    const start = sorted[0].startDate;
    const end = sorted[sorted.length - 1].endDate;
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return { start, end, days };
  }

  private detectExpectedInterval(data: UsageData[]): number {
    if (data.length < 2) return 3600; // Default 1 hour

    const intervals = [];
    for (let i = 1; i < Math.min(data.length, 10); i++) {
      const interval = data[i].timestamp.getTime() - data[i-1].timestamp.getTime();
      intervals.push(interval / 1000); // Convert to seconds
    }

    // Return the most common interval
    const intervalCounts = new Map<number, number>();
    for (const interval of intervals) {
      intervalCounts.set(interval, (intervalCounts.get(interval) || 0) + 1);
    }

    let maxCount = 0;
    let mostCommonInterval = 3600;
    for (const [interval, count] of intervalCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonInterval = interval;
      }
    }

    return mostCommonInterval;
  }

  private calculateCompleteness(data: UsageData[]): number {
    if (data.length === 0) return 0;

    const period = this.getCoveragePeriod(data);
    const expectedInterval = this.detectExpectedInterval(data);
    const expectedReadings = Math.ceil((period.days * 24 * 3600) / expectedInterval);
    
    return Math.min(100, (data.length / expectedReadings) * 100);
  }

  private calculateBillingCompleteness(data: BillingData[]): number {
    if (data.length === 0) return 0;

    const period = this.getBillingCoveragePeriod(data);
    const expectedBills = Math.ceil(period.days / 30); // Assuming monthly billing
    
    return Math.min(100, (data.length / expectedBills) * 100);
  }

  private calculateParsedBillCompleteness(data: ParsedBillData): number {
    const requiredFields = ['accountNumber', 'billingPeriod', 'usage', 'charges'];
    const completedFields = requiredFields.filter(field => {
      const value = (data as any)[field];
      return value !== null && value !== undefined && value !== '';
    });

    return (completedFields.length / requiredFields.length) * 100;
  }

  private calculateAccuracy(issues: ValidationIssue[]): number {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const warningIssues = issues.filter(i => i.severity === 'warning').length;
    
    // Weight critical issues more heavily
    const score = Math.max(0, 100 - (criticalIssues * 25) - (warningIssues * 10));
    return score;
  }

  private calculateConsistency(issues: ValidationIssue[]): number {
    const consistencyIssues = issues.filter(i => i.category === 'consistency').length;
    return Math.max(0, 100 - (consistencyIssues * 15));
  }

  private calculateOverallScore(metadata: ValidationMetadata, issues: ValidationIssue[]): number {
    const weights = {
      completeness: 0.3,
      accuracy: 0.4,
      consistency: 0.3
    };

    return Math.round(
      metadata.completeness * weights.completeness +
      metadata.accuracy * weights.accuracy +
      metadata.consistency * weights.consistency
    );
  }

  private generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];

    // Group issues by category
    const issuesByCategory = new Map<string, ValidationIssue[]>();
    for (const issue of issues) {
      if (!issuesByCategory.has(issue.category)) {
        issuesByCategory.set(issue.category, []);
      }
      issuesByCategory.get(issue.category)!.push(issue);
    }

    // Generate recommendations based on issue patterns
    if (issuesByCategory.has('completeness')) {
      recommendations.push('Improve data collection frequency to reduce gaps');
      recommendations.push('Implement automated data validation at ingestion');
    }

    if (issuesByCategory.has('data_quality')) {
      recommendations.push('Review data sources for accuracy and calibration');
      recommendations.push('Implement outlier detection and correction');
    }

    if (issuesByCategory.has('consistency')) {
      recommendations.push('Cross-validate data across multiple sources');
      recommendations.push('Implement automated consistency checks');
    }

    if (issuesByCategory.has('accuracy')) {
      recommendations.push('Verify meter calibration and reading accuracy');
      recommendations.push('Implement third-party data verification');
    }

    return recommendations;
  }

  private validateRequiredFields(data: ParsedBillData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const requiredFields = ['accountNumber', 'billingPeriod', 'usage', 'charges'];

    for (const field of requiredFields) {
      const value = (data as any)[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        issues.push({
          severity: 'critical',
          category: 'completeness',
          field,
          message: `Required field is missing: ${field}`,
          confidence: 100
        });
      }
    }

    return issues;
  }

  private validateAccountInformation(data: ParsedBillData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate account number format
    if (data.accountNumber && !/^\d{8,12}$/.test(data.accountNumber)) {
      issues.push({
        severity: 'warning',
        category: 'data_quality',
        field: 'accountNumber',
        message: 'Account number format appears invalid',
        actualValue: data.accountNumber,
        confidence: 80
      });
    }

    return issues;
  }

  private validateParsedUsage(data: ParsedBillData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (data.usage.current < 0) {
      issues.push({
        severity: 'critical',
        category: 'data_quality',
        field: 'usage.current',
        message: 'Negative usage value',
        actualValue: data.usage.current,
        confidence: 100
      });
    }

    if (data.usage.current > this.rules.usage.maxValue) {
      issues.push({
        severity: 'warning',
        category: 'data_quality',
        field: 'usage.current',
        message: 'Unusually high usage value',
        actualValue: data.usage.current,
        expectedValue: `< ${this.rules.usage.maxValue}`,
        confidence: 85
      });
    }

    return issues;
  }

  private validateBillingPeriod(data: ParsedBillData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (data.billingPeriod.days < 15 || data.billingPeriod.days > 45) {
      issues.push({
        severity: 'warning',
        category: 'data_quality',
        field: 'billingPeriod.days',
        message: `Unusual billing period: ${data.billingPeriod.days} days`,
        actualValue: data.billingPeriod.days,
        expectedValue: '28-31 days',
        confidence: 90
      });
    }

    return issues;
  }

  private validateChargeCalculations(data: ParsedBillData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const calculatedTotal = data.charges.energyCharges + data.charges.demandCharges + 
                          data.charges.deliveryCharges + data.charges.taxes + 
                          data.charges.otherCharges;

    const variance = Math.abs(calculatedTotal - data.charges.totalAmount);
    const variancePercent = (variance / data.charges.totalAmount) * 100;

    if (variancePercent > 5) {
      issues.push({
        severity: 'warning',
        category: 'consistency',
        field: 'charges',
        message: `Charge breakdown doesn't sum to total: ${variancePercent.toFixed(1)}% difference`,
        actualValue: calculatedTotal,
        expectedValue: data.charges.totalAmount,
        confidence: 90
      });
    }

    return issues;
  }

  private validateRateConsistency(data: BillingData[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Calculate implied rates for each bill
    const rates = data.map(bill => {
      if (bill.usage === 0) return null;
      return bill.energyCharges / bill.usage;
    }).filter(rate => rate !== null) as number[];

    if (rates.length < 2) return issues;

    // Check for rate consistency
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const maxDeviation = Math.max(...rates.map(rate => Math.abs(rate - avgRate)));
    const deviationPercent = (maxDeviation / avgRate) * 100;

    if (deviationPercent > this.rules.billing.rateConsistency) {
      issues.push({
        severity: 'warning',
        category: 'consistency',
        field: 'rate_consistency',
        message: `High rate variation: ${deviationPercent.toFixed(1)}%`,
        actualValue: deviationPercent,
        expectedValue: `< ${this.rules.billing.rateConsistency}%`,
        confidence: 85
      });
    }

    return issues;
  }

  private loadBenchmarks(): void {
    // Load industry benchmarks for validation
    this.benchmarks.set('commercial_usage_kwh_per_sqft', 15); // 15 kWh/sq ft/year
    this.benchmarks.set('residential_usage_kwh_per_month', 900); // 900 kWh/month
    this.benchmarks.set('typical_rate_per_kwh', 0.12); // $0.12/kWh
    this.benchmarks.set('typical_demand_charge_per_kw', 15); // $15/kW
  }
}

export default UtilityDataValidator;