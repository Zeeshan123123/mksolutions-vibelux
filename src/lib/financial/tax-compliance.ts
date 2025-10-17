/**
 * Tax Compliance and Financial Reporting System
 * Comprehensive tax calculation, reporting, and compliance management for cannabis operations
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';

export type TaxJurisdiction = 'federal' | 'state' | 'local';
export type TaxType = 'income' | 'sales' | 'excise' | 'property' | 'payroll' | 'cannabis_specific';
export type TaxPeriod = 'monthly' | 'quarterly' | 'annually';
export type ComplianceStatus = 'compliant' | 'pending' | 'overdue' | 'non_compliant';
export type FilingStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'amended';

export interface TaxCalculation {
  id: string;
  jurisdiction: TaxJurisdiction;
  taxType: TaxType;
  period: TaxPeriod;
  
  // Calculation Details
  taxableAmount: number;
  taxRate: number;
  taxOwed: number;
  deductions: number;
  credits: number;
  adjustments: number;
  
  // Period Information
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  
  // Supporting Data
  transactions: string[];
  documentIds: string[];
  
  // Status
  status: ComplianceStatus;
  filingStatus: FilingStatus;
  
  // Metadata
  calculatedBy: string;
  calculatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxFiling {
  id: string;
  calculationId: string;
  jurisdiction: TaxJurisdiction;
  taxType: TaxType;
  
  // Filing Details
  formType: string;
  filingMethod: 'electronic' | 'paper';
  confirmationNumber?: string;
  
  // Amounts
  totalTax: number;
  totalPaid: number;
  balanceDue: number;
  refundAmount: number;
  
  // Dates
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  submittedDate?: Date;
  acceptedDate?: Date;
  
  // Status
  status: FilingStatus;
  
  // Supporting Documents
  attachments: string[];
  
  // Payment Information
  paymentMethod?: string;
  paymentDate?: Date;
  paymentReference?: string;
  
  // Metadata
  preparedBy: string;
  submittedBy?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxDeduction {
  id: string;
  name: string;
  description: string;
  category: string;
  
  // Deduction Details
  amount: number;
  percentage?: number;
  maximumAmount?: number;
  
  // Eligibility
  eligibilityCriteria: string[];
  supportingDocuments: string[];
  
  // Tax Information
  jurisdiction: TaxJurisdiction;
  taxType: TaxType;
  
  // Validity
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxCredit {
  id: string;
  name: string;
  description: string;
  category: string;
  
  // Credit Details
  amount: number;
  percentage?: number;
  maximumAmount?: number;
  
  // Eligibility
  eligibilityCriteria: string[];
  supportingDocuments: string[];
  
  // Tax Information
  jurisdiction: TaxJurisdiction;
  taxType: TaxType;
  
  // Validity
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Section280E {
  id: string;
  calculationId: string;
  
  // 280E Specific Calculations
  totalExpenses: number;
  allowableDeductions: number;
  disallowedDeductions: number;
  
  // Expense Categories
  costOfGoodsSold: number;
  nonDeductibleExpenses: number;
  
  // Supporting Analysis
  expenseAnalysis: Array<{
    category: string;
    amount: number;
    deductible: boolean;
    reason: string;
  }>;
  
  // Documentation
  supportingDocuments: string[];
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceAlert {
  id: string;
  type: 'deadline' | 'requirement' | 'regulation_change' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Alert Details
  title: string;
  description: string;
  jurisdiction: TaxJurisdiction;
  
  // Timing
  dueDate?: Date;
  reminderDate?: Date;
  
  // Action Required
  actionRequired: string;
  assignedTo?: string;
  
  // Status
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  
  // Resolution
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxDocument {
  id: string;
  type: '1099' | 'W2' | 'K1' | 'invoice' | 'receipt' | 'bank_statement' | 'other';
  name: string;
  description: string;
  
  // File Information
  filePath: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  
  // Tax Information
  taxYear: number;
  jurisdiction: TaxJurisdiction;
  relatedTransactions: string[];
  
  // Metadata
  uploadedBy: string;
  uploadedAt: Date;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditTrail {
  id: string;
  entityType: 'calculation' | 'filing' | 'document' | 'deduction' | 'credit';
  entityId: string;
  
  // Action Details
  action: 'created' | 'updated' | 'deleted' | 'submitted' | 'approved' | 'rejected';
  description: string;
  
  // User Information
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Change Details
  previousValue?: any;
  newValue?: any;
  
  // Tracking
  timestamp: Date;
}

class TaxComplianceManager extends EventEmitter {
  private facilityId: string;
  private userId: string;
  private taxRates: Map<string, number> = new Map();
  private deductions: Map<string, TaxDeduction> = new Map();
  private credits: Map<string, TaxCredit> = new Map();

  constructor(facilityId: string, userId: string) {
    super();
    this.facilityId = facilityId;
    this.userId = userId;
    this.loadTaxConfiguration();
  }

  /**
   * Calculate taxes for a specific period
   */
  async calculateTaxes(
    jurisdiction: TaxJurisdiction,
    taxType: TaxType,
    period: TaxPeriod,
    startDate: Date,
    endDate: Date
  ): Promise<TaxCalculation> {
    try {
      // Get transactions for the period
      const transactions = await this.getTransactionsForPeriod(startDate, endDate);
      
      // Calculate taxable amount
      const taxableAmount = this.calculateTaxableAmount(transactions, taxType);
      
      // Get tax rate
      const taxRate = this.getTaxRate(jurisdiction, taxType);
      
      // Calculate base tax
      let taxOwed = taxableAmount * (taxRate / 100);
      
      // Apply deductions
      const deductions = await this.calculateDeductions(
        transactions,
        jurisdiction,
        taxType,
        startDate,
        endDate
      );
      
      // Apply credits
      const credits = await this.calculateCredits(
        transactions,
        jurisdiction,
        taxType,
        startDate,
        endDate
      );
      
      // Apply adjustments
      const adjustments = await this.calculateAdjustments(
        transactions,
        jurisdiction,
        taxType,
        startDate,
        endDate
      );
      
      // Final tax calculation
      taxOwed = Math.max(0, taxOwed - deductions + credits + adjustments);
      
      const calculation: TaxCalculation = {
        id: this.generateCalculationId(),
        jurisdiction,
        taxType,
        period,
        taxableAmount,
        taxRate,
        taxOwed,
        deductions,
        credits,
        adjustments,
        startDate,
        endDate,
        dueDate: this.calculateDueDate(endDate, period),
        transactions: transactions.map(t => t.id),
        documentIds: [],
        status: 'compliant',
        filingStatus: 'draft',
        calculatedBy: this.userId,
        calculatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTaxCalculation(calculation);

      // Check for Section 280E if applicable
      if (taxType === 'income' && jurisdiction === 'federal') {
        await this.calculateSection280E(calculation.id, transactions);
      }

      this.emit('tax-calculated', calculation);
      logger.info('api', `Calculated ${taxType} tax for ${jurisdiction}: $${taxOwed.toFixed(2)}`);
      
      return calculation;
    } catch (error) {
      logger.error('api', 'Failed to calculate taxes:', error );
      throw error;
    }
  }

  /**
   * Calculate Section 280E adjustments
   */
  async calculateSection280E(calculationId: string, transactions: any[]): Promise<Section280E> {
    try {
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Analyze expenses for 280E compliance
      const expenseAnalysis = await this.analyzeExpensesFor280E(transactions);
      
      const allowableDeductions = expenseAnalysis
        .filter(e => e.deductible)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const disallowedDeductions = expenseAnalysis
        .filter(e => !e.deductible)
        .reduce((sum, e) => sum + e.amount, 0);

      // Calculate COGS
      const costOfGoodsSold = this.calculateCOGS(transactions);
      
      const section280E: Section280E = {
        id: this.generateSection280EId(),
        calculationId,
        totalExpenses,
        allowableDeductions,
        disallowedDeductions,
        costOfGoodsSold,
        nonDeductibleExpenses: disallowedDeductions,
        expenseAnalysis,
        supportingDocuments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveSection280E(section280E);

      this.emit('section-280e-calculated', section280E);
      logger.info('api', `Section 280E calculated: $${disallowedDeductions.toFixed(2)} disallowed`);
      
      return section280E;
    } catch (error) {
      logger.error('api', 'Failed to calculate Section 280E:', error );
      throw error;
    }
  }

  /**
   * Create tax filing
   */
  async createTaxFiling(
    calculationId: string,
    formType: string,
    filingMethod: 'electronic' | 'paper'
  ): Promise<TaxFiling> {
    try {
      const calculation = await this.getTaxCalculation(calculationId);
      if (!calculation) throw new Error('Tax calculation not found');

      const filing: TaxFiling = {
        id: this.generateFilingId(),
        calculationId,
        jurisdiction: calculation.jurisdiction,
        taxType: calculation.taxType,
        formType,
        filingMethod,
        totalTax: calculation.taxOwed,
        totalPaid: 0,
        balanceDue: calculation.taxOwed,
        refundAmount: 0,
        periodStart: calculation.startDate,
        periodEnd: calculation.endDate,
        dueDate: calculation.dueDate,
        status: 'draft',
        attachments: [],
        preparedBy: this.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTaxFiling(filing);

      this.emit('tax-filing-created', filing);
      logger.info('api', `Created tax filing: ${filing.id}`);
      
      return filing;
    } catch (error) {
      logger.error('api', 'Failed to create tax filing:', error );
      throw error;
    }
  }

  /**
   * Submit tax filing
   */
  async submitTaxFiling(filingId: string): Promise<TaxFiling> {
    try {
      const filing = await this.getTaxFiling(filingId);
      if (!filing) throw new Error('Tax filing not found');

      // Validate filing
      await this.validateTaxFiling(filing);

      // Submit based on method
      if (filing.filingMethod === 'electronic') {
        await this.submitElectronicFiling(filing);
      } else {
        await this.submitPaperFiling(filing);
      }

      filing.status = 'submitted';
      filing.submittedDate = new Date();
      filing.submittedBy = this.userId;
      filing.updatedAt = new Date();

      await this.saveTaxFiling(filing);

      this.emit('tax-filing-submitted', filing);
      logger.info('api', `Submitted tax filing: ${filing.id}`);
      
      return filing;
    } catch (error) {
      logger.error('api', 'Failed to submit tax filing:', error );
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: {
      totalTaxLiability: number;
      totalPaid: number;
      balanceDue: number;
      complianceScore: number;
    };
    byJurisdiction: Array<{
      jurisdiction: TaxJurisdiction;
      totalTax: number;
      filings: number;
      compliance: ComplianceStatus;
    }>;
    alerts: ComplianceAlert[];
    recommendations: string[];
  }> {
    try {
      const calculations = await this.getTaxCalculationsInRange(startDate, endDate);
      const filings = await this.getTaxFilingsInRange(startDate, endDate);
      const alerts = await this.getComplianceAlerts();

      const totalTaxLiability = calculations.reduce((sum, c) => sum + c.taxOwed, 0);
      const totalPaid = filings.reduce((sum, f) => sum + f.totalPaid, 0);
      const balanceDue = totalTaxLiability - totalPaid;

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(calculations, filings, alerts);

      // Group by jurisdiction
      const byJurisdiction = this.groupByJurisdiction(calculations, filings);

      // Generate recommendations
      const recommendations = this.generateComplianceRecommendations(
        calculations,
        filings,
        alerts
      );

      return {
        summary: {
          totalTaxLiability,
          totalPaid,
          balanceDue,
          complianceScore
        },
        byJurisdiction,
        alerts,
        recommendations
      };
    } catch (error) {
      logger.error('api', 'Failed to generate compliance report:', error );
      throw error;
    }
  }

  /**
   * Create compliance alert
   */
  async createComplianceAlert(
    alertData: Omit<ComplianceAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ComplianceAlert> {
    try {
      const alert: ComplianceAlert = {
        id: this.generateAlertId(),
        ...alertData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveComplianceAlert(alert);

      // Send notifications if critical
      if (alert.severity === 'critical') {
        await this.sendCriticalAlert(alert);
      }

      this.emit('compliance-alert-created', alert);
      logger.info('api', `Created compliance alert: ${alert.title}`);
      
      return alert;
    } catch (error) {
      logger.error('api', 'Failed to create compliance alert:', error );
      throw error;
    }
  }

  /**
   * Monitor compliance deadlines
   */
  async monitorComplianceDeadlines(): Promise<void> {
    try {
      const upcomingDeadlines = await this.getUpcomingDeadlines();
      
      for (const deadline of upcomingDeadlines) {
        const daysUntilDue = Math.ceil(
          (deadline.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue <= 7) {
          await this.createComplianceAlert({
            type: 'deadline',
            severity: daysUntilDue <= 3 ? 'critical' : 'high',
            title: `Tax Filing Due Soon: ${deadline.formType}`,
            description: `${deadline.formType} filing is due in ${daysUntilDue} days`,
            jurisdiction: deadline.jurisdiction,
            dueDate: deadline.dueDate,
            actionRequired: 'Complete and submit tax filing',
            status: 'open'
          });
        }
      }
    } catch (error) {
      logger.error('api', 'Failed to monitor compliance deadlines:', error );
    }
  }

  // Private helper methods

  private async getTransactionsForPeriod(startDate: Date, endDate: Date): Promise<any[]> {
    return await prisma.transaction.findMany({
      where: {
        facilityId: this.facilityId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private calculateTaxableAmount(transactions: any[], taxType: TaxType): number {
    switch (taxType) {
      case 'income':
        return transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
      case 'sales':
        return transactions
          .filter(t => t.type === 'sale')
          .reduce((sum, t) => sum + t.amount, 0);
      case 'excise':
        return transactions
          .filter(t => t.category === 'cannabis_sale')
          .reduce((sum, t) => sum + t.amount, 0);
      default:
        return 0;
    }
  }

  private getTaxRate(jurisdiction: TaxJurisdiction, taxType: TaxType): number {
    const key = `${jurisdiction}_${taxType}`;
    return this.taxRates.get(key) || 0;
  }

  private async calculateDeductions(
    transactions: any[],
    jurisdiction: TaxJurisdiction,
    taxType: TaxType,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const applicableDeductions = Array.from(this.deductions.values())
      .filter(d => d.jurisdiction === jurisdiction && d.taxType === taxType);

    let totalDeductions = 0;

    for (const deduction of applicableDeductions) {
      const deductionAmount = await this.calculateDeductionAmount(
        deduction,
        transactions,
        startDate,
        endDate
      );
      totalDeductions += deductionAmount;
    }

    return totalDeductions;
  }

  private async calculateCredits(
    transactions: any[],
    jurisdiction: TaxJurisdiction,
    taxType: TaxType,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const applicableCredits = Array.from(this.credits.values())
      .filter(c => c.jurisdiction === jurisdiction && c.taxType === taxType);

    let totalCredits = 0;

    for (const credit of applicableCredits) {
      const creditAmount = await this.calculateCreditAmount(
        credit,
        transactions,
        startDate,
        endDate
      );
      totalCredits += creditAmount;
    }

    return totalCredits;
  }

  private async calculateAdjustments(
    transactions: any[],
    jurisdiction: TaxJurisdiction,
    taxType: TaxType,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Calculate any special adjustments
    return 0;
  }

  private calculateDueDate(endDate: Date, period: TaxPeriod): Date {
    const dueDate = new Date(endDate);
    
    switch (period) {
      case 'monthly':
        dueDate.setMonth(dueDate.getMonth() + 1);
        dueDate.setDate(15);
        break;
      case 'quarterly':
        dueDate.setMonth(dueDate.getMonth() + 2);
        dueDate.setDate(15);
        break;
      case 'annually':
        dueDate.setFullYear(dueDate.getFullYear() + 1);
        dueDate.setMonth(3); // April
        dueDate.setDate(15);
        break;
    }
    
    return dueDate;
  }

  private async analyzeExpensesFor280E(transactions: any[]): Promise<Array<{
    category: string;
    amount: number;
    deductible: boolean;
    reason: string;
  }>> {
    const expenses = transactions.filter(t => t.type === 'expense');
    const analysis = [];

    for (const expense of expenses) {
      const deductible = this.isExpenseDeductibleUnder280E(expense);
      analysis.push({
        category: expense.category,
        amount: expense.amount,
        deductible,
        reason: deductible ? 'Allowable under 280E' : 'Disallowed under 280E'
      });
    }

    return analysis;
  }

  private isExpenseDeductibleUnder280E(expense: any): boolean {
    // Section 280E allows deductions for COGS and certain direct costs
    const allowableCategories = [
      'cost_of_goods_sold',
      'direct_materials',
      'direct_labor',
      'manufacturing_overhead'
    ];

    return allowableCategories.includes(expense.category);
  }

  private calculateCOGS(transactions: any[]): number {
    return transactions
      .filter(t => t.type === 'expense' && t.category === 'cost_of_goods_sold')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private async calculateDeductionAmount(
    deduction: TaxDeduction,
    transactions: any[],
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Calculate deduction amount based on type and criteria
    return 0;
  }

  private async calculateCreditAmount(
    credit: TaxCredit,
    transactions: any[],
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Calculate credit amount based on type and criteria
    return 0;
  }

  private async validateTaxFiling(filing: TaxFiling): Promise<void> {
    // Validate filing completeness and accuracy
  }

  private async submitElectronicFiling(filing: TaxFiling): Promise<void> {
    // Submit filing electronically
  }

  private async submitPaperFiling(filing: TaxFiling): Promise<void> {
    // Submit filing via paper
  }

  private calculateComplianceScore(
    calculations: TaxCalculation[],
    filings: TaxFiling[],
    alerts: ComplianceAlert[]
  ): number {
    // Calculate overall compliance score
    return 85; // Placeholder
  }

  private groupByJurisdiction(
    calculations: TaxCalculation[],
    filings: TaxFiling[]
  ): Array<{
    jurisdiction: TaxJurisdiction;
    totalTax: number;
    filings: number;
    compliance: ComplianceStatus;
  }> {
    // Group by jurisdiction
    return [];
  }

  private generateComplianceRecommendations(
    calculations: TaxCalculation[],
    filings: TaxFiling[],
    alerts: ComplianceAlert[]
  ): string[] {
    // Generate recommendations
    return [];
  }

  private async getUpcomingDeadlines(): Promise<any[]> {
    // Get upcoming tax deadlines
    return [];
  }

  private async sendCriticalAlert(alert: ComplianceAlert): Promise<void> {
    // Send critical alert notifications
  }

  // Database operations
  private async loadTaxConfiguration(): Promise<void> {
    // Load tax rates, deductions, and credits
  }

  private async saveTaxCalculation(calculation: TaxCalculation): Promise<void> {
    await prisma.taxCalculation.upsert({
      where: { id: calculation.id },
      create: { ...calculation, facilityId: this.facilityId },
      update: calculation
    });
  }

  private async getTaxCalculation(calculationId: string): Promise<TaxCalculation | null> {
    return await prisma.taxCalculation.findUnique({
      where: { id: calculationId }
    });
  }

  private async saveTaxFiling(filing: TaxFiling): Promise<void> {
    await prisma.taxFiling.upsert({
      where: { id: filing.id },
      create: { ...filing, facilityId: this.facilityId },
      update: filing
    });
  }

  private async getTaxFiling(filingId: string): Promise<TaxFiling | null> {
    return await prisma.taxFiling.findUnique({
      where: { id: filingId }
    });
  }

  private async saveSection280E(section280E: Section280E): Promise<void> {
    await prisma.section280E.upsert({
      where: { id: section280E.id },
      create: section280E,
      update: section280E
    });
  }

  private async saveComplianceAlert(alert: ComplianceAlert): Promise<void> {
    await prisma.complianceAlert.upsert({
      where: { id: alert.id },
      create: { ...alert, facilityId: this.facilityId },
      update: alert
    });
  }

  private async getTaxCalculationsInRange(startDate: Date, endDate: Date): Promise<TaxCalculation[]> {
    return await prisma.taxCalculation.findMany({
      where: {
        facilityId: this.facilityId,
        startDate: { gte: startDate },
        endDate: { lte: endDate }
      }
    });
  }

  private async getTaxFilingsInRange(startDate: Date, endDate: Date): Promise<TaxFiling[]> {
    return await prisma.taxFiling.findMany({
      where: {
        facilityId: this.facilityId,
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate }
      }
    });
  }

  private async getComplianceAlerts(): Promise<ComplianceAlert[]> {
    return await prisma.complianceAlert.findMany({
      where: {
        facilityId: this.facilityId,
        status: { in: ['open', 'in_progress'] }
      }
    });
  }

  // ID generators
  private generateCalculationId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFilingId(): string {
    return `filing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSection280EId(): string {
    return `280e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { TaxComplianceManager };
export default TaxComplianceManager;