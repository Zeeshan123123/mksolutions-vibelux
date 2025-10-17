/**
 * Recipe Payment Processing System
 * Handles payments, subscriptions, and royalty distributions for licensed recipes
 */

import { LicensedRecipe, RecipeLicense } from './recipe-licensing'

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto';
  last4: string;
  brand?: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  recipeId: string;
  licenseId: string;
  type: 'purchase' | 'subscription' | 'royalty';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: Date;
  completedAt?: Date;
  metadata: {
    recipeName: string;
    licensorId: string;
    licenseeId: string;
    period?: { start: Date; end: Date };
  };
}

export interface RoyaltyCalculation {
  licenseId: string;
  period: { start: Date; end: Date };
  metrics: {
    totalYield: number;
    marketPrice: number;
    grossValue: number;
    operatingCosts: number;
    netProfit: number;
  };
  royaltyRate: number;
  royaltyAmount: number;
  platformFee: number;
  payoutAmount: number;
}

export interface SubscriptionStatus {
  licenseId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'paused';
  currentPeriod: { start: Date; end: Date };
  nextBillingDate: Date;
  amount: number;
  failedPayments: number;
}

export class RecipePaymentProcessor {
  private readonly PLATFORM_FEE_RATE = 0.15; // 15% platform fee
  private readonly MIN_ROYALTY_AMOUNT = 100; // $100 minimum
  
  /**
   * Process initial recipe license purchase
   */
  async processPurchase(
    recipe: LicensedRecipe,
    licenseeId: string,
    paymentMethodId: string,
    licenseType: 'one-time' | 'subscription' | 'royalty'
  ): Promise<{ license: RecipeLicense; transaction: Transaction }> {
    // Calculate amount based on license type
    const amount = this.calculateInitialPayment(recipe, licenseType);
    
    // Create transaction
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      recipeId: recipe.id,
      licenseId: '', // Will be set after license creation
      type: 'purchase',
      amount,
      currency: 'USD',
      status: 'pending',
      paymentMethod: paymentMethodId,
      createdAt: new Date(),
      metadata: {
        recipeName: recipe.name,
        licensorId: recipe.creatorId,
        licenseeId
      }
    };
    
    try {
      // Process payment through payment provider
      await this.chargePayment(amount, paymentMethodId);
      
      // Create license
      const license = await this.createLicense(
        recipe,
        licenseeId,
        licenseType,
        transaction.id
      );
      
      // Update transaction
      transaction.licenseId = license.id;
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      
      // Distribute funds
      await this.distributeFunds(amount, recipe.creatorId);
      
      return { license, transaction };
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }
  
  /**
   * Process recurring subscription payment
   */
  async processSubscriptionPayment(
    license: RecipeLicense,
    recipe: LicensedRecipe
  ): Promise<Transaction> {
    if (license.type !== 'subscription') {
      throw new Error('License is not a subscription');
    }
    
    const amount = recipe.licensing.pricing.monthly || recipe.licensing.pricing.yearly! / 12;
    
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      recipeId: recipe.id,
      licenseId: license.id,
      type: 'subscription',
      amount,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'stored-payment-method',
      createdAt: new Date(),
      metadata: {
        recipeName: recipe.name,
        licensorId: recipe.creatorId,
        licenseeId: license.licenseeId,
        period: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    };
    
    try {
      await this.chargePayment(amount, 'stored-payment-method');
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      
      // Update license dates
      license.payment.lastPayment = new Date();
      license.payment.nextPayment = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      license.payment.totalPaid += amount;
      
      await this.distributeFunds(amount, recipe.creatorId);
      
      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }
  
  /**
   * Calculate and process royalty payment
   */
  async processRoyaltyPayment(
    license: RecipeLicense,
    recipe: LicensedRecipe,
    cycleData: {
      yield: number; // grams
      marketPrice: number; // $/gram
      costs: number; // total costs
    }
  ): Promise<{ calculation: RoyaltyCalculation; transaction: Transaction }> {
    if (license.type !== 'royalty') {
      throw new Error('License is not royalty-based');
    }
    
    // Calculate royalty
    const grossValue = cycleData.yield * cycleData.marketPrice;
    const netProfit = grossValue - cycleData.costs;
    const royaltyRate = recipe.licensing.pricing.royaltyPercent! / 100;
    const royaltyAmount = Math.max(
      netProfit * royaltyRate,
      recipe.licensing.pricing.royaltyMinimum || this.MIN_ROYALTY_AMOUNT
    );
    
    const platformFee = royaltyAmount * this.PLATFORM_FEE_RATE;
    const payoutAmount = royaltyAmount - platformFee;
    
    const calculation: RoyaltyCalculation = {
      licenseId: license.id,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      metrics: {
        totalYield: cycleData.yield,
        marketPrice: cycleData.marketPrice,
        grossValue,
        operatingCosts: cycleData.costs,
        netProfit
      },
      royaltyRate,
      royaltyAmount,
      platformFee,
      payoutAmount
    };
    
    // Create transaction
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      recipeId: recipe.id,
      licenseId: license.id,
      type: 'royalty',
      amount: royaltyAmount,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'stored-payment-method',
      createdAt: new Date(),
      metadata: {
        recipeName: recipe.name,
        licensorId: recipe.creatorId,
        licenseeId: license.licenseeId,
        period: calculation.period
      }
    };
    
    try {
      await this.chargePayment(royaltyAmount, 'stored-payment-method');
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      
      // Update license payment info
      license.payment.totalPaid += royaltyAmount;
      if (!license.payment.royaltyReports) {
        license.payment.royaltyReports = [];
      }
      license.payment.royaltyReports.push({
        id: this.generateTransactionId(),
        period: calculation.period,
        cycles: 1,
        totalYield: cycleData.yield,
        yieldValue: grossValue,
        royaltyRate: royaltyRate,
        royaltyDue: royaltyAmount,
        paid: true,
        paidAt: new Date()
      });
      
      await this.distributeFunds(payoutAmount, recipe.creatorId);
      
      return { calculation, transaction };
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }
  
  /**
   * Handle subscription cancellation
   */
  async cancelSubscription(
    license: RecipeLicense,
    immediate: boolean = false
  ): Promise<void> {
    if (license.type !== 'subscription') {
      throw new Error('License is not a subscription');
    }
    
    if (immediate) {
      license.status = 'cancelled';
      license.endDate = new Date();
    } else {
      // Cancel at end of billing period
      license.status = 'active'; // Still active until end date
      license.endDate = license.payment.nextPayment;
    }
    
    // Cancel recurring payment
    await this.cancelRecurringPayment(license.id);
  }
  
  /**
   * Process refund
   */
  async processRefund(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
    // Get original transaction
    const originalTransaction = await this.getTransaction(transactionId);
    
    if (originalTransaction.status !== 'completed') {
      throw new Error('Cannot refund non-completed transaction');
    }
    
    const refundAmount = amount || originalTransaction.amount;
    
    // Process refund through payment provider
    await this.refundPayment(originalTransaction.paymentMethod, refundAmount);
    
    // Create refund transaction
    const refundTransaction: Transaction = {
      ...originalTransaction,
      id: this.generateTransactionId(),
      amount: -refundAmount,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date()
    };
    
    // Update license status if full refund
    if (refundAmount === originalTransaction.amount) {
      await this.revokeLicense(originalTransaction.licenseId);
    }
    
    return refundTransaction;
  }
  
  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    license: RecipeLicense
  ): Promise<SubscriptionStatus> {
    if (license.type !== 'subscription') {
      throw new Error('License is not a subscription');
    }
    
    const now = new Date();
    const nextBilling = license.payment.nextPayment || now;
    
    let status: SubscriptionStatus['status'] = 'active';
    if (license.status === 'cancelled') {
      status = 'cancelled';
    } else if (nextBilling < now) {
      status = 'past_due';
    }
    
    return {
      licenseId: license.id,
      status,
      currentPeriod: {
        start: license.payment.lastPayment || license.startDate,
        end: nextBilling
      },
      nextBillingDate: nextBilling,
      amount: license.payment.amount,
      failedPayments: 0 // Would track failed payment attempts
    };
  }
  
  /**
   * Calculate initial payment amount
   */
  private calculateInitialPayment(
    recipe: LicensedRecipe,
    licenseType: 'one-time' | 'subscription' | 'royalty'
  ): number {
    const { pricing } = recipe.licensing;
    
    switch (licenseType) {
      case 'one-time':
        return pricing.oneTime || 0;
      case 'subscription':
        // First month payment
        return pricing.monthly || (pricing.yearly ? pricing.yearly / 12 : 0);
      case 'royalty':
        // No upfront payment for royalty model
        return 0;
      default:
        throw new Error('Invalid license type');
    }
  }
  
  /**
   * Distribute funds after platform fee
   */
  private async distributeFunds(
    amount: number,
    creatorId: string
  ): Promise<void> {
    const platformFee = amount * this.PLATFORM_FEE_RATE;
    const creatorPayout = amount - platformFee;
    
    // Queue payout to creator
    await this.queuePayout(creatorId, creatorPayout);
    
    // Record platform revenue
    await this.recordPlatformRevenue(platformFee);
  }
  
  // Mock implementations of payment provider methods
  private async chargePayment(amount: number, paymentMethodId: string): Promise<void> {
    // Integration with Stripe/PayPal/etc
    logger.info('api', `Charging ${amount} to ${paymentMethodId}`);
  }
  
  private async refundPayment(paymentMethodId: string, amount: number): Promise<void> {
    logger.info('api', `Refunding ${amount} to ${paymentMethodId}`);
  }
  
  private async cancelRecurringPayment(licenseId: string): Promise<void> {
    logger.info('api', `Cancelling recurring payment for ${licenseId}`);
  }
  
  private async createLicense(
    recipe: LicensedRecipe,
    licenseeId: string,
    type: 'one-time' | 'subscription' | 'royalty',
    transactionId: string
  ): Promise<RecipeLicense> {
    // Create license record
    return {
      id: this.generateTransactionId(),
      recipeId: recipe.id,
      licenseeId,
      licensorId: recipe.creatorId,
      type,
      startDate: new Date(),
      endDate: type === 'subscription' ? 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined,
      payment: {
        amount: this.calculateInitialPayment(recipe, type),
        frequency: type === 'subscription' ? 'monthly' : 'one-time',
        totalPaid: this.calculateInitialPayment(recipe, type),
        lastPayment: new Date(),
        nextPayment: type === 'subscription' ?
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
      },
      usage: {
        totalCycles: 0,
        totalArea: 0
      },
      support: {
        included: recipe.licensing.supportIncluded,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        ticketsUsed: 0,
        ticketsRemaining: 5
      },
      status: 'active'
    };
  }
  
  private async getTransaction(transactionId: string): Promise<Transaction> {
    // Mock - would fetch from database
    throw new Error('Transaction not found');
  }
  
  private async revokeLicense(licenseId: string): Promise<void> {
    // Update license status to revoked
    logger.info('api', `Revoking license ${licenseId}`);
  }
  
  private async queuePayout(creatorId: string, amount: number): Promise<void> {
    // Queue payout for processing
    logger.info('api', `Queueing payout of ${amount} to creator ${creatorId}`);
  }
  
  private async recordPlatformRevenue(amount: number): Promise<void> {
    // Record platform fee revenue
    logger.info('api', `Recording platform revenue: ${amount}`);
  }
  
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton
export const recipePaymentProcessor = new RecipePaymentProcessor();