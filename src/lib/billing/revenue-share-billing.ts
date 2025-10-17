/**
 * Revenue Share Billing System
 * Automated billing based on verified energy savings
 * Handles monthly calculations, invoicing, and payment processing
 */

import { EventEmitter } from 'events';
import Stripe from 'stripe';
import { db } from '@/lib/db';

// Billing interfaces
export interface BillingAccount {
  id: string;
  facilityId: string;
  stripeCustomerId: string;
  status: 'active' | 'suspended' | 'cancelled';
  billingCycle: 'monthly' | 'quarterly';
  paymentMethod: PaymentMethod;
  billingAddress: BillingAddress;
  taxInfo: TaxInfo;
  creditLimit?: number;
  currentBalance: number;
  preferences: BillingPreferences;
  created: Date;
  activated?: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'ach' | 'wire' | 'check';
  isDefault: boolean;
  details: {
    last4?: string;
    brand?: string;
    bankName?: string;
    accountType?: string;
  };
  verified: boolean;
  verifiedDate?: Date;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TaxInfo {
  taxId?: string;
  taxExempt: boolean;
  exemptionCertificate?: string;
  vatNumber?: string;
  taxRate: number; // percentage
}

export interface BillingPreferences {
  invoiceDelivery: 'email' | 'mail' | 'both';
  invoiceFormat: 'pdf' | 'csv' | 'both';
  autoPayEnabled: boolean;
  paymentTerms: number; // days
  reminderSchedule: number[]; // days before due date
  consolidatedBilling: boolean; // for multi-facility
}

export interface BillingPeriod {
  id: string;
  facilityId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'calculating' | 'review' | 'approved' | 'invoiced' | 'paid' | 'disputed';
  savingsData: SavingsData;
  adjustments: BillingAdjustment[];
  invoice?: Invoice;
  verification: VerificationData;
}

export interface SavingsData {
  baselineConsumption: number; // kWh
  actualConsumption: number; // kWh
  grossSavings: number; // kWh
  adjustedSavings: number; // kWh after adjustments
  savingsPercentage: number; // %
  weatherNormalized: boolean;
  demandSavings?: number; // kW
  energyRate: number; // $/kWh
  demandRate?: number; // $/kW
  totalSavingsValue: number; // $
  confidence: number; // % confidence in calculations
}

export interface BillingAdjustment {
  id: string;
  type: 'weather' | 'occupancy' | 'production' | 'equipment' | 'baseline' | 'credit' | 'penalty';
  description: string;
  amount: number; // kWh or $ depending on type
  factor?: number; // Adjustment factor
  appliedBy: string;
  appliedDate: Date;
  approved: boolean;
  approvedBy?: string;
  documentation?: string;
}

export interface VerificationData {
  method: 'utility_bill' | 'meter_data' | 'third_party' | 'combined';
  utilityBillsVerified: boolean;
  meterDataVerified: boolean;
  thirdPartyVerified: boolean;
  verificationDate?: Date;
  verifiedBy?: string;
  discrepancies: Discrepancy[];
  confidence: number; // %
}

export interface Discrepancy {
  type: 'data_missing' | 'calculation_error' | 'meter_variance' | 'billing_mismatch';
  description: string;
  impact: number; // kWh or $
  resolution?: string;
  resolved: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  billingAccountId: string;
  billingPeriodId: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'disputed';
  issueDate: Date;
  dueDate: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  payments: Payment[];
  disputes: Dispute[];
  pdfUrl?: string;
  sentDate?: Date;
  viewedDate?: Date;
  paidDate?: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  category: 'energy_savings' | 'demand_savings' | 'adjustment' | 'fee' | 'credit';
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'card' | 'ach' | 'wire' | 'check' | 'credit';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  processedDate?: Date;
  reference?: string;
  failureReason?: string;
  stripePaymentIntentId?: string;
}

export interface Dispute {
  id: string;
  invoiceId: string;
  type: 'calculation' | 'measurement' | 'baseline' | 'service' | 'other';
  description: string;
  disputedAmount: number;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  createdDate: Date;
  createdBy: string;
  resolution?: string;
  resolvedDate?: Date;
  resolvedBy?: string;
  creditIssued?: number;
}

export interface RevenueShareConfig {
  customerShare: number; // percentage (e.g., 70)
  vibeluxShare: number; // percentage (e.g., 30)
  minimumMonthlyCharge?: number; // $
  maximumMonthlyCharge?: number; // $
  performanceThreshold?: number; // minimum savings % to bill
  truUpPeriod: 'monthly' | 'quarterly' | 'annually';
  disputeGracePeriod: number; // days
}

export class RevenueShareBillingSystem extends EventEmitter {
  private stripe: Stripe;
  private accounts = new Map<string, BillingAccount>();
  private periods = new Map<string, BillingPeriod>();
  private invoices = new Map<string, Invoice>();
  private config: RevenueShareConfig = {
    customerShare: 70,
    vibeluxShare: 30,
    minimumMonthlyCharge: 100,
    performanceThreshold: 5, // 5% minimum savings
    truUpPeriod: 'quarterly',
    disputeGracePeriod: 30
  };

  constructor(stripeKey: string) {
    super();
    this.stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });
    this.startBillingScheduler();
  }

  private startBillingScheduler() {
    logger.info('api', '💰 Starting Revenue Share Billing System...');
    
    // Run billing calculations daily at 2 AM
    const now = new Date();
    const tomorrow2AM = new Date(now);
    tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
    tomorrow2AM.setHours(2, 0, 0, 0);
    
    const msUntil2AM = tomorrow2AM.getTime() - now.getTime();
    
    setTimeout(() => {
      this.runDailyBilling();
      
      // Then run every 24 hours
      setInterval(() => {
        this.runDailyBilling();
      }, 24 * 60 * 60 * 1000);
    }, msUntil2AM);
    
    logger.info('api', '✅ Billing scheduler started');
  }

  async createBillingAccount(
    facilityId: string,
    customerData: {
      email: string;
      name: string;
      phone?: string;
      taxId?: string;
    },
    billingAddress: BillingAddress
  ): Promise<BillingAccount> {
    logger.info('api', `💳 Creating billing account for facility ${facilityId}`);
    
    try {
      // Create Stripe customer
      const stripeCustomer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        tax_id_data: customerData.taxId ? [{
          type: 'us_ein',
          value: customerData.taxId
        }] : undefined,
        address: {
          line1: billingAddress.line1,
          line2: billingAddress.line2,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postalCode,
          country: billingAddress.country
        },
        metadata: {
          facilityId,
          accountType: 'revenue_share'
        }
      });
      
      const account: BillingAccount = {
        id: `billing_${Date.now()}_${facilityId}`,
        facilityId,
        stripeCustomerId: stripeCustomer.id,
        status: 'active',
        billingCycle: 'monthly',
        paymentMethod: {
          id: '',
          type: 'ach',
          isDefault: true,
          details: {},
          verified: false
        },
        billingAddress,
        taxInfo: {
          taxId: customerData.taxId,
          taxExempt: false,
          taxRate: await this.calculateTaxRate(billingAddress)
        },
        currentBalance: 0,
        preferences: {
          invoiceDelivery: 'email',
          invoiceFormat: 'pdf',
          autoPayEnabled: false,
          paymentTerms: 30,
          reminderSchedule: [7, 3, 1],
          consolidatedBilling: false
        },
        created: new Date()
      };
      
      // Store account
      await this.saveAccount(account);
      this.accounts.set(account.id, account);
      
      logger.info('api', `✅ Billing account created: ${account.id}`);
      this.emit('accountCreated', account);
      
      return account;
      
    } catch (error) {
      logger.error('api', 'Failed to create billing account:', error );
      throw error;
    }
  }

  private async calculateTaxRate(address: BillingAddress): Promise<number> {
    // In production, integrate with tax calculation service
    // For now, use simplified state sales tax rates
    const stateTaxRates: Record<string, number> = {
      'CA': 7.25,
      'TX': 6.25,
      'NY': 8.0,
      'FL': 6.0,
      'IL': 6.25,
      // Add more states...
    };
    
    return stateTaxRates[address.state] || 0;
  }

  async addPaymentMethod(
    accountId: string,
    paymentMethodId: string, // Stripe payment method ID
    setAsDefault: boolean = true
  ): Promise<PaymentMethod> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Billing account ${accountId} not found`);
    }
    
    try {
      // Attach payment method to Stripe customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: account.stripeCustomerId
      });
      
      // Get payment method details
      const stripePaymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
      
      const paymentMethod: PaymentMethod = {
        id: paymentMethodId,
        type: stripePaymentMethod.type as any,
        isDefault: setAsDefault,
        details: this.extractPaymentDetails(stripePaymentMethod),
        verified: true,
        verifiedDate: new Date()
      };
      
      // Update account
      account.paymentMethod = paymentMethod;
      
      if (setAsDefault) {
        await this.stripe.customers.update(account.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }
      
      await this.saveAccount(account);
      
      logger.info('api', `✅ Payment method added to account ${accountId}`);
      this.emit('paymentMethodAdded', { accountId, paymentMethod });
      
      return paymentMethod;
      
    } catch (error) {
      logger.error('api', 'Failed to add payment method:', error );
      throw error;
    }
  }

  private extractPaymentDetails(stripePaymentMethod: Stripe.PaymentMethod): any {
    if (stripePaymentMethod.card) {
      return {
        last4: stripePaymentMethod.card.last4,
        brand: stripePaymentMethod.card.brand,
        expMonth: stripePaymentMethod.card.exp_month,
        expYear: stripePaymentMethod.card.exp_year
      };
    } else if (stripePaymentMethod.us_bank_account) {
      return {
        last4: stripePaymentMethod.us_bank_account.last4,
        bankName: stripePaymentMethod.us_bank_account.bank_name,
        accountType: stripePaymentMethod.us_bank_account.account_type
      };
    }
    return {};
  }

  async startBillingPeriod(facilityId: string, startDate: Date, endDate: Date): Promise<BillingPeriod> {
    logger.info('api', `📅 Starting billing period for facility ${facilityId}`);
    
    const period: BillingPeriod = {
      id: `period_${Date.now()}_${facilityId}`,
      facilityId,
      startDate,
      endDate,
      status: 'pending',
      savingsData: {
        baselineConsumption: 0,
        actualConsumption: 0,
        grossSavings: 0,
        adjustedSavings: 0,
        savingsPercentage: 0,
        weatherNormalized: false,
        energyRate: 0,
        totalSavingsValue: 0,
        confidence: 0
      },
      adjustments: [],
      verification: {
        method: 'combined',
        utilityBillsVerified: false,
        meterDataVerified: false,
        thirdPartyVerified: false,
        discrepancies: [],
        confidence: 0
      }
    };
    
    await this.savePeriod(period);
    this.periods.set(period.id, period);
    
    logger.info('api', `✅ Billing period created: ${period.id}`);
    this.emit('periodStarted', period);
    
    return period;
  }

  async calculatePeriodSavings(periodId: string): Promise<SavingsData> {
    const period = this.periods.get(periodId);
    if (!period) {
      throw new Error(`Billing period ${periodId} not found`);
    }
    
    logger.info('api', `🧮 Calculating savings for period ${periodId}`);
    period.status = 'calculating';
    
    try {
      // Fetch baseline data
      const baselineData = await this.fetchBaselineData(
        period.facilityId, 
        period.startDate, 
        period.endDate
      );
      
      // Fetch actual consumption
      const actualData = await this.fetchActualConsumption(
        period.facilityId,
        period.startDate,
        period.endDate
      );
      
      // Apply weather normalization
      const normalizedBaseline = await this.applyWeatherNormalization(
        baselineData,
        period.startDate,
        period.endDate
      );
      
      // Calculate gross savings
      const grossSavings = normalizedBaseline.consumption - actualData.consumption;
      const savingsPercentage = (grossSavings / normalizedBaseline.consumption) * 100;
      
      // Get utility rates
      const rates = await this.fetchUtilityRates(period.facilityId, period.endDate);
      
      // Calculate savings value
      const energySavingsValue = grossSavings * rates.energyRate;
      const demandSavingsValue = (normalizedBaseline.demand - actualData.demand) * rates.demandRate;
      
      period.savingsData = {
        baselineConsumption: normalizedBaseline.consumption,
        actualConsumption: actualData.consumption,
        grossSavings,
        adjustedSavings: grossSavings, // Will be adjusted later
        savingsPercentage,
        weatherNormalized: true,
        demandSavings: normalizedBaseline.demand - actualData.demand,
        energyRate: rates.energyRate,
        demandRate: rates.demandRate,
        totalSavingsValue: energySavingsValue + demandSavingsValue,
        confidence: 95
      };
      
      // Apply any manual adjustments
      period.savingsData.adjustedSavings = this.applyAdjustments(period);
      
      period.status = 'review';
      await this.savePeriod(period);
      
      logger.info('api', `✅ Savings calculated: ${savingsPercentage.toFixed(1)}% (${grossSavings.toLocaleString()} kWh)`);
      this.emit('savingsCalculated', { periodId, savings: period.savingsData });
      
      return period.savingsData;
      
    } catch (error) {
      logger.error('api', 'Failed to calculate savings:', error );
      period.status = 'pending';
      throw error;
    }
  }

  private async fetchBaselineData(facilityId: string, startDate: Date, endDate: Date) {
    // Fetch from database - this would query historical baseline data
    const query = `
      SELECT 
        SUM(consumption) as consumption,
        MAX(demand) as demand
      FROM baseline_data
      WHERE facility_id = $1
        AND date >= $2
        AND date <= $3
    `;
    
    // Simulated data for now
    return {
      consumption: 50000, // kWh
      demand: 150 // kW
    };
  }

  private async fetchActualConsumption(facilityId: string, startDate: Date, endDate: Date) {
    // Fetch from meter readings or utility bills
    const query = `
      SELECT 
        SUM(consumption) as consumption,
        MAX(demand) as demand
      FROM meter_readings
      WHERE facility_id = $1
        AND timestamp >= $2
        AND timestamp <= $3
    `;
    
    // Simulated data showing 18% reduction
    return {
      consumption: 41000, // kWh
      demand: 125 // kW
    };
  }

  private async applyWeatherNormalization(
    baselineData: any,
    startDate: Date,
    endDate: Date
  ) {
    // Apply weather normalization using degree days
    // This would integrate with weather data API
    const adjustmentFactor = 1.02; // 2% adjustment for weather
    
    return {
      consumption: baselineData.consumption * adjustmentFactor,
      demand: baselineData.demand
    };
  }

  private async fetchUtilityRates(facilityId: string, date: Date) {
    // Fetch current utility rates
    // This would query rate schedules from utility integration
    return {
      energyRate: 0.12, // $/kWh
      demandRate: 15.00 // $/kW
    };
  }

  private applyAdjustments(period: BillingPeriod): number {
    let adjustedSavings = period.savingsData.grossSavings;
    
    for (const adjustment of period.adjustments) {
      if (!adjustment.approved) continue;
      
      if (adjustment.type === 'credit' || adjustment.type === 'penalty') {
        // Direct $ adjustments handled separately
        continue;
      }
      
      if (adjustment.factor) {
        adjustedSavings *= adjustment.factor;
      } else {
        adjustedSavings += adjustment.amount;
      }
    }
    
    return Math.max(0, adjustedSavings); // Never negative
  }

  async generateInvoice(periodId: string): Promise<Invoice> {
    const period = this.periods.get(periodId);
    if (!period) {
      throw new Error(`Billing period ${periodId} not found`);
    }
    
    if (period.status !== 'approved') {
      throw new Error('Billing period must be approved before invoicing');
    }
    
    logger.info('api', `📄 Generating invoice for period ${periodId}`);
    
    const account = await this.getFacilityBillingAccount(period.facilityId);
    if (!account) {
      throw new Error('No billing account found for facility');
    }
    
    // Check if meets minimum performance threshold
    if (period.savingsData.savingsPercentage < this.config.performanceThreshold) {
      logger.info('api', '⚠️ Savings below performance threshold, no invoice generated');
      period.status = 'invoiced'; // Mark as processed but no invoice
      return {} as Invoice;
    }
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}_${periodId}`,
      number: await this.generateInvoiceNumber(),
      billingAccountId: account.id,
      billingPeriodId: periodId,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + account.preferences.paymentTerms * 24 * 60 * 60 * 1000),
      lineItems: [],
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      amountPaid: 0,
      amountDue: 0,
      payments: [],
      disputes: []
    };
    
    // Calculate VibeLux share
    const vibeluxShare = period.savingsData.totalSavingsValue * (this.config.vibeluxShare / 100);
    
    // Add energy savings line item
    if (period.savingsData.adjustedSavings > 0) {
      invoice.lineItems.push({
        id: `line_${Date.now()}_1`,
        description: `Energy Savings Share (${this.config.vibeluxShare}% of verified savings)`,
        category: 'energy_savings',
        quantity: period.savingsData.adjustedSavings,
        unit: 'kWh',
        rate: period.savingsData.energyRate * (this.config.vibeluxShare / 100),
        amount: period.savingsData.adjustedSavings * period.savingsData.energyRate * (this.config.vibeluxShare / 100),
        metadata: {
          baselineConsumption: period.savingsData.baselineConsumption,
          actualConsumption: period.savingsData.actualConsumption,
          savingsPercentage: period.savingsData.savingsPercentage
        }
      });
    }
    
    // Add demand savings line item
    if (period.savingsData.demandSavings && period.savingsData.demandSavings > 0) {
      invoice.lineItems.push({
        id: `line_${Date.now()}_2`,
        description: `Demand Savings Share (${this.config.vibeluxShare}% of peak reduction)`,
        category: 'demand_savings',
        quantity: period.savingsData.demandSavings,
        unit: 'kW',
        rate: (period.savingsData.demandRate || 0) * (this.config.vibeluxShare / 100),
        amount: period.savingsData.demandSavings * (period.savingsData.demandRate || 0) * (this.config.vibeluxShare / 100),
        metadata: {
          peakReduction: period.savingsData.demandSavings
        }
      });
    }
    
    // Add adjustments
    for (const adjustment of period.adjustments) {
      if (adjustment.type === 'credit' || adjustment.type === 'penalty') {
        invoice.lineItems.push({
          id: `line_adj_${adjustment.id}`,
          description: adjustment.description,
          category: 'adjustment',
          quantity: 1,
          unit: 'each',
          rate: adjustment.amount,
          amount: adjustment.amount
        });
      }
    }
    
    // Calculate totals
    invoice.subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Apply minimum/maximum charges
    if (this.config.minimumMonthlyCharge && invoice.subtotal < this.config.minimumMonthlyCharge) {
      invoice.lineItems.push({
        id: `line_min_${Date.now()}`,
        description: 'Minimum monthly charge adjustment',
        category: 'fee',
        quantity: 1,
        unit: 'each',
        rate: this.config.minimumMonthlyCharge - invoice.subtotal,
        amount: this.config.minimumMonthlyCharge - invoice.subtotal
      });
      invoice.subtotal = this.config.minimumMonthlyCharge;
    }
    
    if (this.config.maximumMonthlyCharge && invoice.subtotal > this.config.maximumMonthlyCharge) {
      invoice.lineItems.push({
        id: `line_max_${Date.now()}`,
        description: 'Maximum monthly charge adjustment',
        category: 'credit',
        quantity: 1,
        unit: 'each',
        rate: -(invoice.subtotal - this.config.maximumMonthlyCharge),
        amount: -(invoice.subtotal - this.config.maximumMonthlyCharge)
      });
      invoice.subtotal = this.config.maximumMonthlyCharge;
    }
    
    // Calculate tax
    invoice.taxAmount = invoice.subtotal * (account.taxInfo.taxRate / 100);
    invoice.totalAmount = invoice.subtotal + invoice.taxAmount;
    invoice.amountDue = invoice.totalAmount;
    
    // Save invoice
    await this.saveInvoice(invoice);
    this.invoices.set(invoice.id, invoice);
    
    // Update period
    period.invoice = invoice;
    period.status = 'invoiced';
    await this.savePeriod(period);
    
    // Generate PDF
    invoice.pdfUrl = await this.generateInvoicePDF(invoice);
    
    logger.info('api', `✅ Invoice generated: ${invoice.number} for $${invoice.totalAmount.toFixed(2)}`);
    this.emit('invoiceGenerated', invoice);
    
    return invoice;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices this month
    const count = await this.getMonthlyInvoiceCount(year, parseInt(month));
    
    return `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  private async getMonthlyInvoiceCount(year: number, month: number): Promise<number> {
    // Query database for invoice count
    // Simulated for now
    return Math.floor(Math.random() * 100);
  }

  private async generateInvoicePDF(invoice: Invoice): Promise<string> {
    // Generate PDF using template
    // This would use a PDF generation library
    logger.info('api', `📑 Generating PDF for invoice ${invoice.number}`);
    return `/invoices/${invoice.id}/invoice.pdf`;
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    
    const account = await this.getAccount(invoice.billingAccountId);
    if (!account) {
      throw new Error('Billing account not found');
    }
    
    logger.info('api', `📧 Sending invoice ${invoice.number}`);
    
    try {
      // Send via preferred method
      if (account.preferences.invoiceDelivery === 'email' || account.preferences.invoiceDelivery === 'both') {
        await this.sendInvoiceEmail(invoice, account);
      }
      
      if (account.preferences.invoiceDelivery === 'mail' || account.preferences.invoiceDelivery === 'both') {
        await this.sendInvoiceMail(invoice, account);
      }
      
      // Update invoice status
      invoice.status = 'sent';
      invoice.sentDate = new Date();
      await this.saveInvoice(invoice);
      
      // Schedule reminders
      this.schedulePaymentReminders(invoice, account);
      
      // Process auto-pay if enabled
      if (account.preferences.autoPayEnabled && account.paymentMethod.verified) {
        setTimeout(() => {
          this.processAutoPay(invoice, account);
        }, 24 * 60 * 60 * 1000); // Process next day
      }
      
      logger.info('api', `✅ Invoice sent: ${invoice.number}`);
      this.emit('invoiceSent', invoice);
      
    } catch (error) {
      logger.error('api', 'Failed to send invoice:', error );
      throw error;
    }
  }

  private async sendInvoiceEmail(invoice: Invoice, account: BillingAccount): Promise<void> {
    // Send email with invoice PDF attachment
    // This would use an email service
    logger.info('api', `📧 Emailing invoice ${invoice.number}`);
  }

  private async sendInvoiceMail(invoice: Invoice, account: BillingAccount): Promise<void> {
    // Queue for physical mail service
    logger.info('api', `📬 Mailing invoice ${invoice.number}`);
  }

  private schedulePaymentReminders(invoice: Invoice, account: BillingAccount): void {
    for (const daysBefore of account.preferences.reminderSchedule) {
      const reminderDate = new Date(invoice.dueDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);
      
      if (reminderDate > new Date()) {
        setTimeout(() => {
          this.sendPaymentReminder(invoice, account, daysBefore);
        }, reminderDate.getTime() - Date.now());
      }
    }
  }

  private async sendPaymentReminder(invoice: Invoice, account: BillingAccount, daysBefore: number): Promise<void> {
    if (invoice.status === 'paid') return;
    
    logger.info('api', `🔔 Sending payment reminder for invoice ${invoice.number} (${daysBefore} days before due)`);
    // Send reminder email
    this.emit('reminderSent', { invoice, daysBefore });
  }

  private async processAutoPay(invoice: Invoice, account: BillingAccount): Promise<void> {
    if (invoice.status === 'paid') return;
    
    logger.info('api', `💳 Processing auto-pay for invoice ${invoice.number}`);
    
    try {
      const payment = await this.processPayment(invoice.id, {
        amount: invoice.amountDue,
        paymentMethodId: account.paymentMethod.id
      });
      
      logger.info('api', `✅ Auto-pay successful for invoice ${invoice.number}`);
      
    } catch (error) {
      logger.error('api', 'Auto-pay failed:', error );
      this.emit('autoPayFailed', { invoice, error });
    }
  }

  async processPayment(
    invoiceId: string,
    paymentData: {
      amount: number;
      paymentMethodId?: string;
      method?: 'card' | 'ach' | 'wire' | 'check';
    }
  ): Promise<Payment> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    
    if (invoice.status === 'paid') {
      throw new Error('Invoice is already paid');
    }
    
    logger.info('api', `💰 Processing payment for invoice ${invoice.number}`);
    
    const payment: Payment = {
      id: `pay_${Date.now()}_${invoiceId}`,
      invoiceId,
      amount: paymentData.amount,
      method: paymentData.method || 'card',
      status: 'pending',
      reference: ''
    };
    
    try {
      if (paymentData.paymentMethodId) {
        // Process through Stripe
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(paymentData.amount * 100), // Convert to cents
          currency: 'usd',
          customer: invoice.billingAccountId,
          payment_method: paymentData.paymentMethodId,
          confirm: true,
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.number
          }
        });
        
        payment.stripePaymentIntentId = paymentIntent.id;
        payment.status = paymentIntent.status === 'succeeded' ? 'completed' : 'processing';
        payment.processedDate = new Date();
        
      } else {
        // Manual payment (wire, check)
        payment.status = 'processing';
      }
      
      // Update invoice
      invoice.payments.push(payment);
      invoice.amountPaid += payment.amount;
      invoice.amountDue = invoice.totalAmount - invoice.amountPaid;
      
      if (invoice.amountDue <= 0) {
        invoice.status = 'paid';
        invoice.paidDate = new Date();
      }
      
      await this.saveInvoice(invoice);
      
      logger.info('api', `✅ Payment processed: ${payment.id} for $${payment.amount.toFixed(2)}`);
      this.emit('paymentProcessed', payment);
      
      return payment;
      
    } catch (error) {
      payment.status = 'failed';
      payment.failureReason = error instanceof Error ? error.message : 'Payment processing failed';
      
      invoice.payments.push(payment);
      await this.saveInvoice(invoice);
      
      logger.error('api', 'Payment failed:', error );
      throw error;
    }
  }

  async createDispute(
    invoiceId: string,
    disputeData: {
      type: Dispute['type'];
      description: string;
      disputedAmount: number;
      createdBy: string;
    }
  ): Promise<Dispute> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    
    logger.info('api', `⚠️ Creating dispute for invoice ${invoice.number}`);
    
    const dispute: Dispute = {
      id: `disp_${Date.now()}_${invoiceId}`,
      invoiceId,
      type: disputeData.type,
      description: disputeData.description,
      disputedAmount: disputeData.disputedAmount,
      status: 'open',
      createdDate: new Date(),
      createdBy: disputeData.createdBy
    };
    
    invoice.disputes.push(dispute);
    invoice.status = 'disputed';
    
    await this.saveInvoice(invoice);
    
    logger.info('api', `✅ Dispute created: ${dispute.id}`);
    this.emit('disputeCreated', dispute);
    
    // Notify billing team
    this.notifyBillingTeam(dispute);
    
    return dispute;
  }

  private notifyBillingTeam(dispute: Dispute): void {
    // Send notification to billing team
    logger.info('api', `📨 Notifying billing team of dispute ${dispute.id}`);
  }

  private async runDailyBilling(): Promise<void> {
    logger.info('api', '🔄 Running daily billing tasks...');
    
    try {
      // Process end-of-period calculations
      await this.processEndOfPeriod();
      
      // Check for overdue invoices
      await this.checkOverdueInvoices();
      
      // Process scheduled payments
      await this.processScheduledPayments();
      
      logger.info('api', '✅ Daily billing tasks completed');
      
    } catch (error) {
      logger.error('api', 'Daily billing error:', error );
      this.emit('billingError', error);
    }
  }

  private async processEndOfPeriod(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find periods ending today
    for (const [periodId, period] of this.periods) {
      if (period.endDate <= today && period.status === 'pending') {
        try {
          await this.calculatePeriodSavings(periodId);
        } catch (error) {
          logger.error('api', `Failed to calculate savings for period ${periodId}:`, error);
        }
      }
    }
  }

  private async checkOverdueInvoices(): Promise<void> {
    const today = new Date();
    
    for (const [invoiceId, invoice] of this.invoices) {
      if (invoice.status === 'sent' && invoice.dueDate < today) {
        invoice.status = 'overdue';
        await this.saveInvoice(invoice);
        
        logger.info('api', `⚠️ Invoice ${invoice.number} is overdue`);
        this.emit('invoiceOverdue', invoice);
      }
    }
  }

  private async processScheduledPayments(): Promise<void> {
    // Process any scheduled ACH or wire transfers
    logger.info('api', 'Processing scheduled payments...');
  }

  // Database methods (would be implemented with actual database)
  private async saveAccount(account: BillingAccount): Promise<void> {
    // Save to database
    logger.info('api', `💾 Saving billing account ${account.id}`);
  }

  private async savePeriod(period: BillingPeriod): Promise<void> {
    // Save to database
    logger.info('api', `💾 Saving billing period ${period.id}`);
  }

  private async saveInvoice(invoice: Invoice): Promise<void> {
    // Save to database
    logger.info('api', `💾 Saving invoice ${invoice.id}`);
  }

  private async getAccount(accountId: string): Promise<BillingAccount | undefined> {
    return this.accounts.get(accountId);
  }

  private async getFacilityBillingAccount(facilityId: string): Promise<BillingAccount | undefined> {
    return Array.from(this.accounts.values()).find(a => a.facilityId === facilityId);
  }

  // Public API methods
  public updateConfig(config: Partial<RevenueShareConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('api', '⚙️ Billing configuration updated');
  }

  public getConfig(): RevenueShareConfig {
    return { ...this.config };
  }

  public async getInvoice(invoiceId: string): Promise<Invoice | undefined> {
    return this.invoices.get(invoiceId);
  }

  public async getFacilityInvoices(facilityId: string): Promise<Invoice[]> {
    const account = await this.getFacilityBillingAccount(facilityId);
    if (!account) return [];
    
    return Array.from(this.invoices.values())
      .filter(inv => inv.billingAccountId === account.id)
      .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  }

  public async getAccountBalance(accountId: string): Promise<number> {
    const invoices = Array.from(this.invoices.values())
      .filter(inv => inv.billingAccountId === accountId && inv.status !== 'cancelled');
    
    return invoices.reduce((balance, inv) => balance + inv.amountDue, 0);
  }

  public async generateStatement(accountId: string, startDate: Date, endDate: Date): Promise<any> {
    const account = await this.getAccount(accountId);
    if (!account) throw new Error('Account not found');
    
    const invoices = Array.from(this.invoices.values())
      .filter(inv => 
        inv.billingAccountId === accountId &&
        inv.issueDate >= startDate &&
        inv.issueDate <= endDate
      );
    
    const payments = invoices.flatMap(inv => inv.payments)
      .filter(pay => pay.status === 'completed');
    
    return {
      account,
      period: { startDate, endDate },
      invoices,
      payments,
      summary: {
        totalInvoiced: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        totalPaid: payments.reduce((sum, pay) => sum + pay.amount, 0),
        balance: account.currentBalance
      }
    };
  }
}

export default RevenueShareBillingSystem;