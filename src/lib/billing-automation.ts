'use client';

import { z } from 'zod';

// Types and Interfaces
export interface UtilityBill {
  id: string;
  customerId: string;
  facilityId: string;
  billDate: Date;
  billingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  kwhUsage: number;
  demandKw: number;
  totalCost: number;
  rateSchedule: string;
  utilityProvider: string;
  weatherData?: WeatherData;
}

export interface WeatherData {
  avgTemperature: number;
  coolingDegreeDays: number;
  heatingDegreeDays: number;
  peakTemperature: number;
  minTemperature: number;
}

export interface BaselineData {
  customerId: string;
  facilityId: string;
  establishedDate: Date;
  historicalUsage: MonthlyUsage[];
  averageKwhPerMonth: number;
  averageCostPerMonth: number;
  weatherNormalizationFactor: number;
}

export interface MonthlyUsage {
  month: string;
  year: number;
  kwhUsage: number;
  totalCost: number;
  coolingDegreeDays: number;
  heatingDegreeDays: number;
}

export interface SavingsCalculation {
  id: string;
  customerId: string;
  facilityId: string;
  billId: string;
  calculationDate: Date;
  baselineUsage: number;
  actualUsage: number;
  weatherAdjustedBaseline: number;
  kwhSavings: number;
  costSavings: number;
  savingsPercentage: number;
  demandResponseRevenue: number;
  totalBenefit: number;
  vibeLuxShare: number;
  customerShare: number;
  performanceGuarantee: boolean;
  thirdPartyVerified: boolean;
  verificationDate?: Date;
}

export interface BillingRecord {
  id: string;
  customerId: string;
  facilityId: string;
  invoiceNumber: string;
  billingDate: Date;
  dueDate: Date;
  savingsCalculationId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'disputed';
  paymentMethod?: string;
  paidDate?: Date;
  notes?: string;
}

// Validation Schemas
const UtilityBillSchema = z.object({
  customerId: z.string().min(1),
  facilityId: z.string().min(1),
  billDate: z.date(),
  billingPeriod: z.object({
    startDate: z.date(),
    endDate: z.date()
  }),
  kwhUsage: z.number().positive(),
  demandKw: z.number().positive(),
  totalCost: z.number().positive(),
  rateSchedule: z.string().min(1),
  utilityProvider: z.string().min(1)
});

// Weather Normalization Functions
export class WeatherNormalization {
  static calculateDegreeDays(avgTemp: number, baseTemp: number = 65): number {
    return Math.max(0, Math.abs(avgTemp - baseTemp));
  }

  static normalizeUsage(
    actualUsage: number,
    actualCDD: number,
    baselineCDD: number,
    weatherSensitivity: number = 0.02
  ): number {
    const degreeDayDifference = actualCDD - baselineCDD;
    const weatherAdjustment = degreeDayDifference * weatherSensitivity;
    return actualUsage * (1 - weatherAdjustment);
  }

  static calculateWeatherSensitivity(historicalData: MonthlyUsage[]): number {
    // Simple linear regression to determine weather sensitivity
    const n = historicalData.length;
    const sumX = historicalData.reduce((sum, data) => sum + data.coolingDegreeDays, 0);
    const sumY = historicalData.reduce((sum, data) => sum + data.kwhUsage, 0);
    const sumXY = historicalData.reduce((sum, data) => sum + (data.coolingDegreeDays * data.kwhUsage), 0);
    const sumX2 = historicalData.reduce((sum, data) => sum + (data.coolingDegreeDays ** 2), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
    const avgUsage = sumY / n;
    const avgCDD = sumX / n;
    
    return Math.abs(slope / avgUsage); // Normalize to percentage
  }
}

// Baseline Calculation Service
export class BaselineCalculationService {
  static establishBaseline(historicalBills: UtilityBill[]): BaselineData {
    if (historicalBills.length < 12) {
      throw new Error('Minimum 12 months of historical data required for baseline');
    }

    const sortedBills = historicalBills.sort((a, b) => a.billDate.getTime() - b.billDate.getTime());
    const last12Months = sortedBills.slice(-12);
    
    const monthlyUsage: MonthlyUsage[] = last12Months.map(bill => ({
      month: bill.billDate.toLocaleDateString('en-US', { month: 'long' }),
      year: bill.billDate.getFullYear(),
      kwhUsage: bill.kwhUsage,
      totalCost: bill.totalCost,
      coolingDegreeDays: bill.weatherData?.coolingDegreeDays || 0,
      heatingDegreeDays: bill.weatherData?.heatingDegreeDays || 0
    }));

    const averageKwhPerMonth = monthlyUsage.reduce((sum, usage) => sum + usage.kwhUsage, 0) / 12;
    const averageCostPerMonth = monthlyUsage.reduce((sum, usage) => sum + usage.totalCost, 0) / 12;
    const weatherNormalizationFactor = WeatherNormalization.calculateWeatherSensitivity(monthlyUsage);

    return {
      customerId: historicalBills[0].customerId,
      facilityId: historicalBills[0].facilityId,
      establishedDate: new Date(),
      historicalUsage: monthlyUsage,
      averageKwhPerMonth,
      averageCostPerMonth,
      weatherNormalizationFactor
    };
  }
}

// Savings Calculation Service
export class SavingsCalculationService {
  private static readonly MINIMUM_SAVINGS_PERCENTAGE = 0.15; // 15% guarantee
  private static readonly VIBELUX_SHARE = 0.30; // 30% to VibeLux
  private static readonly CUSTOMER_SHARE = 0.70; // 70% to Customer

  static calculateSavings(
    currentBill: UtilityBill,
    baseline: BaselineData,
    demandResponseRevenue: number = 0
  ): SavingsCalculation {
    const billMonth = currentBill.billDate.toLocaleDateString('en-US', { month: 'long' });
    const billYear = currentBill.billDate.getFullYear();

    // Find corresponding baseline month
    const baselineMonth = baseline.historicalUsage.find(
      usage => usage.month === billMonth && usage.year === billYear - 1
    );

    if (!baselineMonth) {
      throw new Error(`No baseline data available for ${billMonth} ${billYear}`);
    }

    // Weather normalize the baseline
    const actualCDD = currentBill.weatherData?.coolingDegreeDays || 0;
    const baselineCDD = baselineMonth.coolingDegreeDays;
    
    const weatherAdjustedBaseline = WeatherNormalization.normalizeUsage(
      baselineMonth.kwhUsage,
      actualCDD,
      baselineCDD,
      baseline.weatherNormalizationFactor
    );

    // Calculate savings
    const kwhSavings = Math.max(0, weatherAdjustedBaseline - currentBill.kwhUsage);
    const costSavings = Math.max(0, (weatherAdjustedBaseline / baselineMonth.kwhUsage) * baselineMonth.totalCost - currentBill.totalCost);
    const savingsPercentage = costSavings / ((weatherAdjustedBaseline / baselineMonth.kwhUsage) * baselineMonth.totalCost);

    // Total benefit including demand response
    const totalBenefit = costSavings + demandResponseRevenue;

    // Calculate shares
    const vibeLuxShare = totalBenefit * this.VIBELUX_SHARE;
    const customerShare = totalBenefit * this.CUSTOMER_SHARE;

    // Performance guarantee check
    const performanceGuarantee = savingsPercentage >= this.MINIMUM_SAVINGS_PERCENTAGE;

    return {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: currentBill.customerId,
      facilityId: currentBill.facilityId,
      billId: currentBill.id,
      calculationDate: new Date(),
      baselineUsage: baselineMonth.kwhUsage,
      actualUsage: currentBill.kwhUsage,
      weatherAdjustedBaseline,
      kwhSavings,
      costSavings,
      savingsPercentage,
      demandResponseRevenue,
      totalBenefit,
      vibeLuxShare: performanceGuarantee ? vibeLuxShare : 0,
      customerShare: performanceGuarantee ? customerShare : totalBenefit,
      performanceGuarantee,
      thirdPartyVerified: false
    };
  }

  static async verifyCalculation(
    calculation: SavingsCalculation,
    utilityBill: UtilityBill,
    baseline: BaselineData
  ): Promise<boolean> {
    // Third-party verification logic
    // This would integrate with external verification services
    
    // For now, return true if calculations are consistent
    const recalculated = this.calculateSavings(utilityBill, baseline, calculation.demandResponseRevenue);
    
    const tolerance = 0.02; // 2% tolerance for verification
    const costSavingsDiff = Math.abs(calculation.costSavings - recalculated.costSavings);
    const isVerified = costSavingsDiff <= (recalculated.costSavings * tolerance);
    
    return isVerified;
  }
}

// Billing Automation Service
export class BillingAutomationService {
  private static readonly PAYMENT_TERMS_DAYS = 15;

  static generateInvoice(
    savingsCalculation: SavingsCalculation,
    customerInfo: any
  ): BillingRecord {
    const invoiceNumber = `INV-${Date.now()}-${savingsCalculation.customerId.slice(-4)}`;
    const billingDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(billingDate.getDate() + this.PAYMENT_TERMS_DAYS);

    return {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: savingsCalculation.customerId,
      facilityId: savingsCalculation.facilityId,
      invoiceNumber,
      billingDate,
      dueDate,
      savingsCalculationId: savingsCalculation.id,
      amount: savingsCalculation.vibeLuxShare,
      status: 'pending',
      notes: `Energy savings share for period. Total savings: $${savingsCalculation.totalBenefit.toFixed(2)}, Customer share: $${savingsCalculation.customerShare.toFixed(2)}`
    };
  }

  static async processAutomaticBilling(
    utilityBill: UtilityBill,
    baseline: BaselineData,
    demandResponseRevenue: number = 0
  ): Promise<{
    savingsCalculation: SavingsCalculation;
    billingRecord: BillingRecord | null;
    notifications: string[];
  }> {
    const notifications: string[] = [];

    try {
      // Calculate savings
      const savingsCalculation = SavingsCalculationService.calculateSavings(
        utilityBill,
        baseline,
        demandResponseRevenue
      );

      // Check performance guarantee
      if (!savingsCalculation.performanceGuarantee) {
        notifications.push(
          `Performance guarantee not met. Minimum 15% savings required, actual: ${(savingsCalculation.savingsPercentage * 100).toFixed(1)}%. Service provided free this month.`
        );
      }

      // Generate invoice only if VibeLux share > 0
      let billingRecord: BillingRecord | null = null;
      if (savingsCalculation.vibeLuxShare > 0) {
        billingRecord = this.generateInvoice(savingsCalculation, { customerId: utilityBill.customerId });
        notifications.push(`Invoice generated: ${billingRecord.invoiceNumber} for $${billingRecord.amount.toFixed(2)}`);
      }

      // Add verification notification
      if (!savingsCalculation.thirdPartyVerified) {
        notifications.push('Third-party verification pending. Payment will be processed after verification.');
      }

      return {
        savingsCalculation,
        billingRecord,
        notifications
      };
    } catch (error) {
      notifications.push(`Error processing billing: ${error}`);
      throw error;
    }
  }
}

// Reporting Service
export class BillingReportingService {
  static generateMonthlySavingsReport(
    savingsCalculations: SavingsCalculation[],
    customerInfo: any
  ): {
    summary: any;
    details: SavingsCalculation[];
    chartData: any[];
  } {
    const totalSavings = savingsCalculations.reduce((sum, calc) => sum + calc.totalBenefit, 0);
    const totalVibeLuxShare = savingsCalculations.reduce((sum, calc) => sum + calc.vibeLuxShare, 0);
    const totalCustomerShare = savingsCalculations.reduce((sum, calc) => sum + calc.customerShare, 0);
    const avgSavingsPercentage = savingsCalculations.reduce((sum, calc) => sum + calc.savingsPercentage, 0) / savingsCalculations.length;

    const summary = {
      totalSavings,
      totalVibeLuxShare,
      totalCustomerShare,
      avgSavingsPercentage,
      performanceGuaranteesMet: savingsCalculations.filter(calc => calc.performanceGuarantee).length,
      totalCalculations: savingsCalculations.length
    };

    const chartData = savingsCalculations.map(calc => ({
      month: calc.calculationDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      savings: calc.totalBenefit,
      savingsPercentage: calc.savingsPercentage * 100,
      kwhSavings: calc.kwhSavings
    }));

    return {
      summary,
      details: savingsCalculations,
      chartData
    };
  }

  static generateCustomerStatement(
    savingsCalculation: SavingsCalculation,
    billingRecord: BillingRecord | null
  ): string {
    return `
VIBELUX ENERGY SAVINGS STATEMENT
================================

Customer ID: ${savingsCalculation.customerId}
Facility ID: ${savingsCalculation.facilityId}
Statement Date: ${savingsCalculation.calculationDate.toLocaleDateString()}

SAVINGS CALCULATION SUMMARY:
----------------------------
Baseline Usage (Weather Adjusted): ${savingsCalculation.weatherAdjustedBaseline.toFixed(0)} kWh
Actual Usage: ${savingsCalculation.actualUsage.toFixed(0)} kWh
Energy Savings: ${savingsCalculation.kwhSavings.toFixed(0)} kWh (${(savingsCalculation.savingsPercentage * 100).toFixed(1)}%)

FINANCIAL SUMMARY:
------------------
Total Cost Savings: $${savingsCalculation.costSavings.toFixed(2)}
Demand Response Revenue: $${savingsCalculation.demandResponseRevenue.toFixed(2)}
Total Benefit: $${savingsCalculation.totalBenefit.toFixed(2)}

REVENUE SHARE (70/30 Split):
----------------------------
Your Share (70%): $${savingsCalculation.customerShare.toFixed(2)}
VibeLux Share (30%): $${savingsCalculation.vibeLuxShare.toFixed(2)}

PERFORMANCE GUARANTEE:
----------------------
Minimum Required Savings: 15%
Actual Savings: ${(savingsCalculation.savingsPercentage * 100).toFixed(1)}%
Status: ${savingsCalculation.performanceGuarantee ? 'GUARANTEE MET ✓' : 'SERVICE PROVIDED FREE'}

${billingRecord ? `
BILLING INFORMATION:
-------------------
Invoice Number: ${billingRecord.invoiceNumber}
Amount Due: $${billingRecord.amount.toFixed(2)}
Due Date: ${billingRecord.dueDate.toLocaleDateString()}
Payment Status: ${billingRecord.status.toUpperCase()}
` : 'No payment required this month.'}

Questions? Contact: billing@vibelux.ai | 1-800-VIBELUX
`;
  }
}

// Export all services
export {
  WeatherNormalization,
  BaselineCalculationService,
  SavingsCalculationService,
  BillingAutomationService,
  BillingReportingService
};