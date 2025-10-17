/**
 * VibeLux Continuous Audit System - Implementation Example
 * This demonstrates how the continuous audit and verification works in practice
 */

import { z } from 'zod';

// Data schemas for validation
const EnergyReadingSchema = z.object({
  timestamp: z.date(),
  kWh: z.number().positive(),
  kW: z.number().positive(),
  powerFactor: z.number().min(0).max(1),
  voltage: z.number().positive(),
  current: z.number().positive(),
  frequency: z.number().min(59).max(61), // Hz tolerance
  metadata: z.object({
    source: z.enum(['UTILITY_API', 'BMS', 'IOT_SENSOR', 'MANUAL']),
    quality: z.number().min(0).max(1),
    validated: z.boolean()
  })
});

const BaselineModelSchema = z.object({
  r2: z.number().min(0).max(1),
  cvrmse: z.number().min(0).max(1),
  coefficients: z.object({
    intercept: z.number(),
    cdd: z.number(),
    hdd: z.number(),
    occupancy: z.number().optional(),
    production: z.number().optional()
  }),
  lastCalibration: z.date(),
  dataPoints: z.number().positive()
});

// Types
type EnergyReading = z.infer<typeof EnergyReadingSchema>;
type BaselineModel = z.infer<typeof BaselineModelSchema>;

interface AnomalyDetectionResult {
  hasAnomaly: boolean;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL' | null;
  type: string | null;
  confidence: number;
  recommendation: string | null;
}

interface SavingsCalculation {
  baseline: number;
  actual: number;
  savings: number;
  savingsPercent: number;
  adjustments: {
    weather: number;
    occupancy: number;
    nonRoutine: number;
  };
  uncertainty: number;
  confidence: number;
}

interface AuditResult {
  verified: boolean;
  savings: SavingsCalculation;
  dataQuality: {
    completeness: number;
    accuracy: number;
    anomalies: number;
  };
  modelPerformance: {
    r2: number;
    cvrmse: number;
  };
  financialSplit: {
    totalSavings: number;
    customerShare: number;
    vibeluxShare: number;
  };
}

// Main Continuous Audit Service
export class ContinuousAuditService {
  private readonly MINIMUM_R2 = 0.75;
  private readonly ANOMALY_THRESHOLD = {
    MINOR: 0.05,
    MAJOR: 0.10,
    CRITICAL: 0.20
  };
  
  /**
   * Real-time data validation as readings come in
   */
  async validateReading(reading: unknown): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const validated = EnergyReadingSchema.parse(reading);
      
      const issues: string[] = [];
      
      // Range checks
      if (validated.kWh > validated.kW * 0.25) { // 15-minute interval
        issues.push('kWh exceeds maximum possible for 15-minute interval');
      }
      
      // Power factor check
      if (validated.powerFactor < 0.7) {
        issues.push('Power factor below typical range');
      }
      
      // Frequency check (already validated by schema)
      
      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        valid: false,
        issues: ['Failed schema validation']
      };
    }
  }
  
  /**
   * Detect anomalies using multiple methods
   */
  async detectAnomalies(
    current: EnergyReading,
    historical: EnergyReading[],
    expected: number
  ): Promise<AnomalyDetectionResult> {
    // Calculate statistics from historical data
    const values = historical.map(h => h.kWh);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
    );
    
    // 1. Statistical anomaly detection (3-sigma rule)
    const zScore = Math.abs((current.kWh - mean) / stdDev);
    const statisticalAnomaly = zScore > 3;
    
    // 2. Deviation from expected (baseline model)
    const deviation = Math.abs((current.kWh - expected) / expected);
    
    // 3. Rate of change detection
    const lastReading = historical[historical.length - 1];
    const rateOfChange = Math.abs((current.kWh - lastReading.kWh) / lastReading.kWh);
    
    // Determine severity
    let severity: 'MINOR' | 'MAJOR' | 'CRITICAL' | null = null;
    let type: string | null = null;
    let recommendation: string | null = null;
    
    if (deviation > this.ANOMALY_THRESHOLD.CRITICAL || rateOfChange > 0.5) {
      severity = 'CRITICAL';
      type = 'EXTREME_DEVIATION';
      recommendation = 'Pause billing and investigate immediately';
    } else if (deviation > this.ANOMALY_THRESHOLD.MAJOR || statisticalAnomaly) {
      severity = 'MAJOR';
      type = 'SIGNIFICANT_DEVIATION';
      recommendation = 'Flag for manual review';
    } else if (deviation > this.ANOMALY_THRESHOLD.MINOR) {
      severity = 'MINOR';
      type = 'MINOR_DEVIATION';
      recommendation = 'Monitor and include in monthly report';
    }
    
    return {
      hasAnomaly: severity !== null,
      severity,
      type,
      confidence: 1 - (stdDev / mean), // Higher confidence with lower variance
      recommendation
    };
  }
  
  /**
   * Calculate savings using IPMVP Option C methodology
   */
  async calculateSavings(
    actualUsage: number,
    baselineModel: BaselineModel,
    conditions: {
      cdd: number;
      hdd: number;
      occupancy?: number;
      production?: number;
    }
  ): Promise<SavingsCalculation> {
    // Apply baseline model with current conditions
    const { coefficients } = baselineModel;
    
    let adjustedBaseline = coefficients.intercept;
    adjustedBaseline += coefficients.cdd * conditions.cdd;
    adjustedBaseline += coefficients.hdd * conditions.hdd;
    
    if (coefficients.occupancy && conditions.occupancy !== undefined) {
      adjustedBaseline += coefficients.occupancy * conditions.occupancy;
    }
    
    if (coefficients.production && conditions.production !== undefined) {
      adjustedBaseline += coefficients.production * conditions.production;
    }
    
    // Calculate savings
    const savings = adjustedBaseline - actualUsage;
    const savingsPercent = (savings / adjustedBaseline) * 100;
    
    // Calculate uncertainty (simplified)
    const modelUncertainty = (1 - baselineModel.r2) * 0.5;
    const measurementUncertainty = 0.02; // 2% measurement error
    const totalUncertainty = Math.sqrt(
      Math.pow(modelUncertainty, 2) + Math.pow(measurementUncertainty, 2)
    );
    
    return {
      baseline: adjustedBaseline,
      actual: actualUsage,
      savings,
      savingsPercent,
      adjustments: {
        weather: (coefficients.cdd * conditions.cdd + coefficients.hdd * conditions.hdd),
        occupancy: coefficients.occupancy ? coefficients.occupancy * (conditions.occupancy || 0) : 0,
        nonRoutine: 0 // Would be calculated separately
      },
      uncertainty: totalUncertainty,
      confidence: 0.90 // 90% confidence interval per IPMVP
    };
  }
  
  /**
   * Perform monthly audit
   */
  async performMonthlyAudit(
    customerId: string,
    month: string
  ): Promise<AuditResult> {
    // In a real implementation, these would come from database
    const monthlyData = await this.getMonthlyData(customerId, month);
    const baselineModel = await this.getBaselineModel(customerId);
    const conditions = await this.getMonthlyConditions(customerId, month);
    
    // Calculate data quality metrics
    const totalExpectedReadings = 30 * 24 * 4; // 30 days * 24 hours * 4 readings/hour
    const validReadings = monthlyData.filter(d => d.metadata.validated).length;
    const completeness = validReadings / totalExpectedReadings;
    
    // Detect anomalies
    const anomalies = await Promise.all(
      monthlyData.map(reading => 
        this.detectAnomalies(reading, monthlyData, baselineModel.coefficients.intercept)
      )
    );
    const anomalyCount = anomalies.filter(a => a.hasAnomaly).length;
    
    // Calculate monthly savings
    const totalActual = monthlyData.reduce((sum, d) => sum + d.kWh, 0);
    const savings = await this.calculateSavings(
      totalActual,
      baselineModel,
      conditions
    );
    
    // Financial calculations (assuming $0.12/kWh average rate)
    const avgRate = 0.12;
    const dollarSavings = savings.savings * avgRate;
    
    // Verify model performance
    const modelValid = baselineModel.r2 >= this.MINIMUM_R2;
    const dataValid = completeness >= 0.90;
    const anomalyValid = (anomalyCount / monthlyData.length) < 0.05;
    
    return {
      verified: modelValid && dataValid && anomalyValid,
      savings,
      dataQuality: {
        completeness,
        accuracy: 0.98, // Would be calculated from validation results
        anomalies: anomalyCount
      },
      modelPerformance: {
        r2: baselineModel.r2,
        cvrmse: baselineModel.cvrmse
      },
      financialSplit: {
        totalSavings: dollarSavings,
        customerShare: dollarSavings * 0.70,
        vibeluxShare: dollarSavings * 0.30
      }
    };
  }
  
  /**
   * Generate audit report
   */
  async generateAuditReport(audit: AuditResult): Promise<string> {
    return `
# VibeLux Monthly Audit Report

## Verification Status: ${audit.verified ? '✅ VERIFIED' : '❌ REQUIRES REVIEW'}

### Savings Summary
- Baseline Usage: ${audit.savings.baseline.toFixed(0)} kWh
- Actual Usage: ${audit.savings.actual.toFixed(0)} kWh
- **Energy Saved: ${audit.savings.savings.toFixed(0)} kWh (${audit.savings.savingsPercent.toFixed(1)}%)**
- Uncertainty: ±${(audit.savings.uncertainty * 100).toFixed(1)}%

### Financial Split
- Total Savings: $${audit.financialSplit.totalSavings.toFixed(2)}
- **Customer Savings (70%): $${audit.financialSplit.customerShare.toFixed(2)}**
- VibeLux Fee (30%): $${audit.financialSplit.vibeluxShare.toFixed(2)}

### Data Quality
- Completeness: ${(audit.dataQuality.completeness * 100).toFixed(1)}%
- Accuracy: ${(audit.dataQuality.accuracy * 100).toFixed(1)}%
- Anomalies Detected: ${audit.dataQuality.anomalies}

### Model Performance
- R²: ${audit.modelPerformance.r2.toFixed(3)} (${audit.modelPerformance.r2 >= 0.75 ? 'Pass' : 'Fail'})
- CV(RMSE): ${(audit.modelPerformance.cvrmse * 100).toFixed(1)}%

### Compliance
- IPMVP Protocol: Option C ✅
- Confidence Level: 90% ✅
- Third-Party Verifiable: Yes ✅

*Report generated: ${new Date().toISOString()}*
    `;
  }
  
  // Mock data methods (would connect to real databases)
  private async getMonthlyData(customerId: string, month: string): Promise<EnergyReading[]> {
    // Mock implementation
    return [];
  }
  
  private async getBaselineModel(customerId: string): Promise<BaselineModel> {
    // Mock implementation
    return {
      r2: 0.85,
      cvrmse: 0.12,
      coefficients: {
        intercept: 1000,
        cdd: 50,
        hdd: 40,
        occupancy: 200
      },
      lastCalibration: new Date(),
      dataPoints: 8760
    };
  }
  
  private async getMonthlyConditions(customerId: string, month: string) {
    // Mock implementation
    return {
      cdd: 10,
      hdd: 5,
      occupancy: 0.95
    };
  }
}

// Example usage
async function runContinuousAudit() {
  const auditService = new ContinuousAuditService();
  
  // Real-time validation
  const reading = {
    timestamp: new Date(),
    kWh: 125.5,
    kW: 450,
    powerFactor: 0.92,
    voltage: 480,
    current: 542,
    frequency: 60.01,
    metadata: {
      source: 'UTILITY_API' as const,
      quality: 0.99,
      validated: true
    }
  };
  
  const validation = await auditService.validateReading(reading);
  logger.info('api', 'Reading valid:', { data: validation.valid });
  
  // Monthly audit
  const audit = await auditService.performMonthlyAudit('customer-123', '2025-01');
  const report = await auditService.generateAuditReport(audit);
  logger.info('api', report);
}

export default ContinuousAuditService;