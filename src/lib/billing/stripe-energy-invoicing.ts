/**
 * Stripe Automated Energy Savings Invoicing
 * Automatically generates and collects payment for energy savings share
 */

import Stripe from 'stripe';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { utilityBillParser, UtilityBillData } from './utility-bill-parser';
import { sendGridService } from '@/lib/email/sendgrid-service';
import { EventEmitter } from 'events';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export interface EnergySavingsInvoice {
  id: string;
  customerId: string;
  stripeCustomerId: string;
  stripeInvoiceId?: string;
  
  // Billing Period
  periodStart: Date;
  periodEnd: Date;
  billingMonth: string;
  
  // Baseline Data
  baselineUsage: number; // kWh
  baselineCost: number; // $
  baselineWeatherNormalized: number; // kWh
  
  // Actual Data
  actualUsage: number; // kWh
  actualCost: number; // $
  utilityBillId?: string;
  
  // Savings Calculation
  energySaved: number; // kWh
  costSaved: number; // $
  savingsPercentage: number; // %
  
  // Revenue Share
  vibeluxShare: number; // $ (30%)
  customerSavings: number; // $ (70%)
  
  // Payment
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'disputed';
  paymentMethod: 'ach' | 'card' | 'wire' | 'check';
  paymentDate?: Date;
  stripePaymentIntentId?: string;
  
  // Metadata
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date;
  notes?: string;
  disputeReason?: string;
  
  // Verification
  verified: boolean;
  verificationMethod: 'automatic' | 'manual' | 'third_party';
  confidence: number; // 0-100
}

export class StripeEnergyInvoicing extends EventEmitter {
  private processingQueue: Map<string, any> = new Map();
  
  /**
   * Setup customer for automated billing
   */
  async setupCustomer(params: {
    email: string;
    name: string;
    company: string;
    facilityAddress: string;
    utilityCompany: string;
    utilityAccountNumber: string;
    paymentMethod: {
      type: 'ach' | 'card';
      token?: string; // Stripe token
      accountNumber?: string; // For ACH
      routingNumber?: string; // For ACH
    };
    agreementAccepted: {
      version: string;
      timestamp: Date;
      ipAddress: string;
      checkboxes: Record<string, boolean>;
      signature: any;
    };
  }): Promise<{
    customerId: string;
    stripeCustomerId: string;
    paymentMethodId: string;
    subscriptionId?: string;
  }> {
    try {
      logger.info('billing', `Setting up energy savings customer: ${params.email}`);
      
      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        description: params.company,
        metadata: {
          company: params.company,
          facilityAddress: params.facilityAddress,
          utilityCompany: params.utilityCompany,
          utilityAccountNumber: params.utilityAccountNumber,
          agreementVersion: params.agreementAccepted.version,
          agreementDate: params.agreementAccepted.timestamp.toISOString()
        }
      });
      
      // Attach payment method
      let paymentMethodId: string;
      
      if (params.paymentMethod.type === 'ach') {
        // Create ACH payment method
        const bankAccount = await stripe.customers.createSource(stripeCustomer.id, {
          source: {
            type: 'ach_debit',
            currency: 'usd',
            owner: {
              name: params.name,
              email: params.email
            },
            account_number: params.paymentMethod.accountNumber,
            routing_number: params.paymentMethod.routingNumber,
            account_holder_type: 'company'
          }
        });
        
        paymentMethodId = bankAccount.id;
        
        // Verify bank account (micro-deposits)
        await this.initiateBankVerification(stripeCustomer.id, bankAccount.id);
        
      } else {
        // Attach card payment method
        const paymentMethod = await stripe.paymentMethods.attach(
          params.paymentMethod.token!,
          { customer: stripeCustomer.id }
        );
        
        paymentMethodId = paymentMethod.id;
        
        // Set as default
        await stripe.customers.update(stripeCustomer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }
      
      // Store customer in database
      const customer = await prisma.energyCustomer.create({
        data: {
          email: params.email,
          name: params.name,
          company: params.company,
          stripeCustomerId: stripeCustomer.id,
          stripePaymentMethodId: paymentMethodId,
          paymentMethodType: params.paymentMethod.type,
          facilityAddress: params.facilityAddress,
          utilityCompany: params.utilityCompany,
          utilityAccountNumber: params.utilityAccountNumber,
          agreementData: params.agreementAccepted as any,
          status: 'active',
          createdAt: new Date()
        }
      });
      
      // Send welcome email
      await sendGridService.send({
        to: params.email,
        templateId: 'energy-welcome',
        dynamicTemplateData: {
          customerName: params.name,
          company: params.company,
          savingsEstimate: '25-35%',
          firstBillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      });
      
      this.emit('customerCreated', customer);
      
      return {
        customerId: customer.id,
        stripeCustomerId: stripeCustomer.id,
        paymentMethodId
      };
      
    } catch (error) {
      logger.error('billing', 'Failed to setup customer', error as Error);
      throw error;
    }
  }
  
  /**
   * Process utility bill and generate invoice
   */
  async processUtilityBill(params: {
    customerId: string;
    billData: UtilityBillData | { source: any };
    baselineOverride?: {
      usage: number;
      cost: number;
    };
  }): Promise<EnergySavingsInvoice> {
    try {
      const customer = await prisma.energyCustomer.findUnique({
        where: { id: params.customerId }
      });
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      logger.info('billing', `Processing utility bill for ${customer.email}`);
      
      // Parse bill if needed
      let billData: UtilityBillData;
      if ('source' in params.billData) {
        billData = await utilityBillParser.parseBill(params.billData.source);
      } else {
        billData = params.billData;
      }
      
      // Get baseline data
      const baseline = await this.getBaseline(
        customer.id,
        billData.periodStart,
        billData.periodEnd,
        params.baselineOverride
      );
      
      // Apply weather normalization
      const normalizedBaseline = await this.weatherNormalize(
        baseline,
        billData.periodStart,
        billData.periodEnd,
        customer.facilityAddress
      );
      
      // Calculate savings
      const energySaved = Math.max(0, normalizedBaseline.usage - billData.kwhUsage);
      const costSaved = Math.max(0, normalizedBaseline.cost - billData.totalCost);
      const savingsPercentage = (costSaved / normalizedBaseline.cost) * 100;
      
      // Calculate revenue share
      const vibeluxShare = costSaved * 0.30; // 30% to VibeLux
      const customerSavings = costSaved * 0.70; // 70% to customer
      
      // Check performance guarantee
      const meetsGuarantee = savingsPercentage >= 15;
      const billableAmount = meetsGuarantee ? vibeluxShare : 0;
      
      // Create invoice record
      const invoice = await prisma.energyInvoice.create({
        data: {
          customerId: customer.id,
          stripeCustomerId: customer.stripeCustomerId,
          periodStart: billData.periodStart,
          periodEnd: billData.periodEnd,
          billingMonth: billData.periodStart.toLocaleString('default', { month: 'long', year: 'numeric' }),
          baselineUsage: baseline.usage,
          baselineCost: baseline.cost,
          baselineWeatherNormalized: normalizedBaseline.usage,
          actualUsage: billData.kwhUsage,
          actualCost: billData.totalCost,
          energySaved,
          costSaved,
          savingsPercentage,
          vibeluxShare: billableAmount,
          customerSavings,
          paymentStatus: billableAmount > 0 ? 'pending' : 'paid', // No charge if no savings
          paymentMethod: customer.paymentMethodType as any,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
          verified: billData.confidence > 90,
          verificationMethod: 'automatic',
          confidence: billData.confidence,
          createdAt: new Date()
        }
      });
      
      // Generate Stripe invoice if billable
      if (billableAmount > 10) { // Minimum $10 to invoice
        await this.createStripeInvoice(invoice, customer);
      } else if (billableAmount > 0) {
        // Accumulate small amounts for later
        await this.accumulateCredit(customer.id, billableAmount);
      }
      
      // Send invoice email
      await this.sendInvoiceEmail(invoice, customer);
      
      // Schedule automatic payment
      if (billableAmount > 0) {
        await this.schedulePayment(invoice, customer);
      }
      
      this.emit('invoiceCreated', invoice);
      
      return invoice as EnergySavingsInvoice;
      
    } catch (error) {
      logger.error('billing', 'Failed to process utility bill', error as Error);
      throw error;
    }
  }
  
  /**
   * Create Stripe invoice
   */
  private async createStripeInvoice(invoice: any, customer: any): Promise<void> {
    try {
      // Create invoice item
      await stripe.invoiceItems.create({
        customer: customer.stripeCustomerId,
        amount: Math.round(invoice.vibeluxShare * 100), // Convert to cents
        currency: 'usd',
        description: `Energy Savings Share - ${invoice.billingMonth}`,
        metadata: {
          invoiceId: invoice.id,
          periodStart: invoice.periodStart.toISOString(),
          periodEnd: invoice.periodEnd.toISOString(),
          energySaved: invoice.energySaved.toString(),
          costSaved: invoice.costSaved.toString(),
          savingsPercentage: invoice.savingsPercentage.toFixed(1)
        }
      });
      
      // Create and finalize invoice
      const stripeInvoice = await stripe.invoices.create({
        customer: customer.stripeCustomerId,
        collection_method: 'charge_automatically',
        auto_advance: true,
        description: `VibeLux Energy Savings - ${invoice.billingMonth}`,
        metadata: {
          invoiceId: invoice.id,
          type: 'energy_savings'
        }
      });
      
      // Finalize invoice
      await stripe.invoices.finalizeInvoice(stripeInvoice.id);
      
      // Update our invoice with Stripe ID
      await prisma.energyInvoice.update({
        where: { id: invoice.id },
        data: { stripeInvoiceId: stripeInvoice.id }
      });
      
      logger.info('billing', `Stripe invoice created: ${stripeInvoice.id}`);
      
    } catch (error) {
      logger.error('billing', 'Failed to create Stripe invoice', error as Error);
      throw error;
    }
  }
  
  /**
   * Schedule automatic payment
   */
  private async schedulePayment(invoice: any, customer: any): Promise<void> {
    try {
      // Add to processing queue
      this.processingQueue.set(invoice.id, {
        invoice,
        customer,
        attempts: 0,
        nextAttempt: invoice.dueDate
      });
      
      // Schedule payment for due date
      setTimeout(async () => {
        await this.processPayment(invoice.id);
      }, invoice.dueDate.getTime() - Date.now());
      
      logger.info('billing', `Payment scheduled for ${invoice.dueDate}`);
      
    } catch (error) {
      logger.error('billing', 'Failed to schedule payment', error as Error);
    }
  }
  
  /**
   * Process automatic payment
   */
  async processPayment(invoiceId: string): Promise<void> {
    try {
      const invoice = await prisma.energyInvoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true }
      });
      
      if (!invoice || invoice.paymentStatus === 'paid') {
        return;
      }
      
      logger.info('billing', `Processing payment for invoice ${invoiceId}`);
      
      // Update status
      await prisma.energyInvoice.update({
        where: { id: invoiceId },
        data: { paymentStatus: 'processing' }
      });
      
      if (invoice.stripeInvoiceId) {
        // Charge through Stripe
        const stripeInvoice = await stripe.invoices.pay(invoice.stripeInvoiceId);
        
        if (stripeInvoice.status === 'paid') {
          await this.markInvoicePaid(invoiceId, stripeInvoice.payment_intent as string);
        } else {
          await this.handlePaymentFailure(invoiceId, 'Payment failed');
        }
      } else {
        // Manual payment processing
        await this.processManualPayment(invoice);
      }
      
    } catch (error: any) {
      logger.error('billing', `Payment failed for invoice ${invoiceId}`, error);
      await this.handlePaymentFailure(invoiceId, error.message);
    }
  }
  
  /**
   * Mark invoice as paid
   */
  private async markInvoicePaid(invoiceId: string, paymentIntentId?: string): Promise<void> {
    const invoice = await prisma.energyInvoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId
      },
      include: { customer: true }
    });
    
    // Send payment confirmation
    await sendGridService.send({
      to: invoice.customer.email,
      templateId: 'payment-success',
      dynamicTemplateData: {
        customerName: invoice.customer.name,
        amount: invoice.vibeluxShare,
        invoiceNumber: invoice.id,
        savingsAmount: invoice.costSaved,
        period: invoice.billingMonth
      }
    });
    
    this.emit('paymentSuccessful', invoice);
    logger.info('billing', `Invoice ${invoiceId} marked as paid`);
  }
  
  /**
   * Handle payment failure
   */
  private async handlePaymentFailure(invoiceId: string, reason: string): Promise<void> {
    const queueItem = this.processingQueue.get(invoiceId);
    
    if (queueItem && queueItem.attempts < 3) {
      // Retry payment
      queueItem.attempts++;
      queueItem.nextAttempt = new Date(Date.now() + (queueItem.attempts * 5 * 24 * 60 * 60 * 1000)); // Retry in 5 days * attempt
      
      setTimeout(async () => {
        await this.processPayment(invoiceId);
      }, queueItem.nextAttempt.getTime() - Date.now());
      
      logger.info('billing', `Payment retry scheduled for ${queueItem.nextAttempt}`);
      
    } else {
      // Mark as failed after 3 attempts
      const invoice = await prisma.energyInvoice.update({
        where: { id: invoiceId },
        data: {
          paymentStatus: 'failed',
          notes: reason
        },
        include: { customer: true }
      });
      
      // Send failure notification
      await sendGridService.send({
        to: invoice.customer.email,
        templateId: 'payment-failed',
        dynamicTemplateData: {
          customerName: invoice.customer.name,
          amount: invoice.vibeluxShare,
          reason,
          updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/update-payment`
        }
      });
      
      this.emit('paymentFailed', invoice);
      logger.error('billing', `Invoice ${invoiceId} payment failed: ${reason}`);
    }
  }
  
  /**
   * Get baseline data for comparison
   */
  private async getBaseline(
    customerId: string,
    periodStart: Date,
    periodEnd: Date,
    override?: { usage: number; cost: number }
  ): Promise<{ usage: number; cost: number }> {
    if (override) {
      return override;
    }
    
    // Get same period from previous year
    const lastYearStart = new Date(periodStart);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
    const lastYearEnd = new Date(periodEnd);
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);
    
    const historicalInvoices = await prisma.energyInvoice.findMany({
      where: {
        customerId,
        periodStart: { gte: lastYearStart },
        periodEnd: { lte: lastYearEnd }
      }
    });
    
    if (historicalInvoices.length > 0) {
      // Average historical usage
      const totalUsage = historicalInvoices.reduce((sum, inv) => sum + inv.actualUsage, 0);
      const totalCost = historicalInvoices.reduce((sum, inv) => sum + inv.actualCost, 0);
      
      return {
        usage: totalUsage / historicalInvoices.length,
        cost: totalCost / historicalInvoices.length
      };
    }
    
    // If no historical data, use industry averages
    const billingDays = Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return {
      usage: billingDays * 1000, // 1000 kWh per day average
      cost: billingDays * 150 // $150 per day average
    };
  }
  
  /**
   * Apply weather normalization
   */
  private async weatherNormalize(
    baseline: { usage: number; cost: number },
    periodStart: Date,
    periodEnd: Date,
    location: string
  ): Promise<{ usage: number; cost: number }> {
    try {
      // Get weather data for both periods
      const currentWeather = await this.getWeatherData(periodStart, periodEnd, location);
      const baselineWeather = await this.getWeatherData(
        new Date(periodStart.getFullYear() - 1, periodStart.getMonth(), periodStart.getDate()),
        new Date(periodEnd.getFullYear() - 1, periodEnd.getMonth(), periodEnd.getDate()),
        location
      );
      
      // Calculate degree day adjustment
      const coolingAdjustment = (currentWeather.coolingDegreeDays - baselineWeather.coolingDegreeDays) * 50; // 50 kWh per CDD
      const heatingAdjustment = (currentWeather.heatingDegreeDays - baselineWeather.heatingDegreeDays) * 30; // 30 kWh per HDD
      
      const totalAdjustment = coolingAdjustment + heatingAdjustment;
      const adjustmentFactor = 1 + (totalAdjustment / baseline.usage);
      
      return {
        usage: baseline.usage * adjustmentFactor,
        cost: baseline.cost * adjustmentFactor
      };
      
    } catch (error) {
      logger.error('billing', 'Weather normalization failed', error as Error);
      return baseline; // Return unadjusted if weather data unavailable
    }
  }
  
  /**
   * Get weather data for period
   */
  private async getWeatherData(
    startDate: Date,
    endDate: Date,
    location: string
  ): Promise<{ coolingDegreeDays: number; heatingDegreeDays: number }> {
    // This would integrate with NOAA or other weather API
    // For now, return mock data
    return {
      coolingDegreeDays: 150,
      heatingDegreeDays: 50
    };
  }
  
  /**
   * Send invoice email to customer
   */
  private async sendInvoiceEmail(invoice: any, customer: any): Promise<void> {
    await sendGridService.send({
      to: customer.email,
      templateId: 'energy-invoice',
      dynamicTemplateData: {
        customerName: customer.name,
        invoiceNumber: invoice.id,
        period: invoice.billingMonth,
        baselineUsage: invoice.baselineUsage,
        actualUsage: invoice.actualUsage,
        energySaved: invoice.energySaved,
        costSaved: invoice.costSaved.toFixed(2),
        savingsPercentage: invoice.savingsPercentage.toFixed(1),
        vibeluxShare: invoice.vibeluxShare.toFixed(2),
        customerSavings: invoice.customerSavings.toFixed(2),
        dueDate: invoice.dueDate.toLocaleDateString(),
        viewInvoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`
      }
    });
  }
  
  /**
   * Process manual payment (wire/check)
   */
  private async processManualPayment(invoice: any): Promise<void> {
    // This would integrate with banking APIs or manual reconciliation
    logger.info('billing', `Manual payment processing for invoice ${invoice.id}`);
  }
  
  /**
   * Accumulate small credits for later billing
   */
  private async accumulateCredit(customerId: string, amount: number): Promise<void> {
    await prisma.energyCustomer.update({
      where: { id: customerId },
      data: {
        accumulatedCredit: {
          increment: amount
        }
      }
    });
  }
  
  /**
   * Initiate bank account verification
   */
  private async initiateBankVerification(customerId: string, bankAccountId: string): Promise<void> {
    // Stripe will send micro-deposits for verification
    logger.info('billing', `Bank verification initiated for ${customerId}`);
  }
  
  /**
   * Handle utility API webhook
   */
  async handleUtilityWebhook(event: {
    type: string;
    utilityCompany: string;
    accountNumber: string;
    data: any;
  }): Promise<void> {
    if (event.type === 'bill.available') {
      // New bill available, fetch and process
      const customer = await prisma.energyCustomer.findFirst({
        where: {
          utilityAccountNumber: event.accountNumber,
          utilityCompany: event.utilityCompany
        }
      });
      
      if (customer) {
        await this.processUtilityBill({
          customerId: customer.id,
          billData: event.data
        });
      }
    }
  }
  
  /**
   * Get customer billing history
   */
  async getBillingHistory(customerId: string): Promise<EnergySavingsInvoice[]> {
    const invoices = await prisma.energyInvoice.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });
    
    return invoices as EnergySavingsInvoice[];
  }
  
  /**
   * Dispute an invoice
   */
  async disputeInvoice(invoiceId: string, reason: string): Promise<void> {
    await prisma.energyInvoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: 'disputed',
        disputeReason: reason
      }
    });
    
    this.emit('invoiceDisputed', { invoiceId, reason });
  }
}

// Export singleton instance
export const stripeEnergyInvoicing = new StripeEnergyInvoicing();