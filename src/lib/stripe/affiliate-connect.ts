/**
 * Stripe Connect Integration for Affiliate Payouts
 * Handles onboarding and automated payouts for affiliates
 */

import Stripe from 'stripe';
import { logger } from '@/lib/logging/production-logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

export interface ConnectAccountData {
  affiliateId: string;
  email: string;
  country?: string;
  businessType?: 'individual' | 'company';
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export class StripeConnectService {
  /**
   * Create a new Stripe Connect account for an affiliate
   */
  async createConnectAccount(data: ConnectAccountData): Promise<{
    accountId: string;
    onboardingUrl: string;
  }> {
    try {
      // Create the Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: data.country || 'US',
        email: data.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: data.businessType || 'individual',
        metadata: {
          affiliateId: data.affiliateId,
          platform: 'vibelux'
        }
      });

      // Generate account onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate/onboarding/refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate/onboarding/complete`,
        type: 'account_onboarding'
      });

      logger.info('api', `Created Connect account ${account.id} for affiliate ${data.affiliateId}`);

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url
      };
    } catch (error) {
      logger.error('api', 'Failed to create Connect account:', error);
      throw new Error('Failed to create payment account');
    }
  }

  /**
   * Get Connect account details
   */
  async getAccount(accountId: string): Promise<Stripe.Account> {
    try {
      return await stripe.accounts.retrieve(accountId);
    } catch (error) {
      logger.error('api', `Failed to retrieve account ${accountId}:`, error);
      throw new Error('Failed to retrieve account details');
    }
  }

  /**
   * Check if account is fully onboarded
   */
  async isAccountReady(accountId: string): Promise<boolean> {
    try {
      const account = await this.getAccount(accountId);
      return account.charges_enabled && account.payouts_enabled;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a payout to affiliate's connected account
   */
  async createPayout(
    accountId: string,
    amount: number,
    currency: string = 'usd',
    description?: string
  ): Promise<Stripe.Transfer> {
    try {
      // First create a transfer to the connected account
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        destination: accountId,
        description: description || 'VibeLux affiliate commission payout',
        metadata: {
          type: 'affiliate_commission',
          platform: 'vibelux'
        }
      });

      logger.info('api', `Created transfer ${transfer.id} for ${amount} ${currency} to ${accountId}`);

      return transfer;
    } catch (error) {
      logger.error('api', 'Failed to create payout:', error);
      throw new Error('Failed to process payout');
    }
  }

  /**
   * Create a bulk payout for multiple affiliates
   */
  async createBulkPayouts(
    payouts: Array<{
      accountId: string;
      amount: number;
      affiliateId: string;
      description?: string;
    }>
  ): Promise<{
    successful: Array<{ affiliateId: string; transferId: string }>;
    failed: Array<{ affiliateId: string; error: string }>;
  }> {
    const successful: Array<{ affiliateId: string; transferId: string }> = [];
    const failed: Array<{ affiliateId: string; error: string }> = [];

    for (const payout of payouts) {
      try {
        const transfer = await this.createPayout(
          payout.accountId,
          payout.amount,
          'usd',
          payout.description
        );

        successful.push({
          affiliateId: payout.affiliateId,
          transferId: transfer.id
        });
      } catch (error) {
        failed.push({
          affiliateId: payout.affiliateId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Generate a dashboard link for connected account
   */
  async createDashboardLink(accountId: string): Promise<string> {
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      return loginLink.url;
    } catch (error) {
      logger.error('api', `Failed to create dashboard link for ${accountId}:`, error);
      throw new Error('Failed to create dashboard link');
    }
  }

  /**
   * Update account information
   */
  async updateAccount(
    accountId: string,
    updates: {
      businessProfile?: Stripe.AccountUpdateParams.BusinessProfile;
      individual?: Stripe.AccountUpdateParams.Individual;
      company?: Stripe.AccountUpdateParams.Company;
    }
  ): Promise<Stripe.Account> {
    try {
      return await stripe.accounts.update(accountId, updates);
    } catch (error) {
      logger.error('api', `Failed to update account ${accountId}:`, error);
      throw new Error('Failed to update account');
    }
  }

  /**
   * Get payout schedule for account
   */
  async getPayoutSchedule(accountId: string): Promise<{
    interval: string;
    delay_days: number;
  }> {
    try {
      const account = await this.getAccount(accountId);
      return account.settings?.payouts?.schedule || { interval: 'manual', delay_days: 0 };
    } catch (error) {
      logger.error('api', `Failed to get payout schedule for ${accountId}:`, error);
      throw new Error('Failed to get payout schedule');
    }
  }

  /**
   * Update payout schedule
   */
  async updatePayoutSchedule(
    accountId: string,
    schedule: {
      interval: 'manual' | 'daily' | 'weekly' | 'monthly';
      weekly_anchor?: string;
      monthly_anchor?: number;
      delay_days?: number;
    }
  ): Promise<void> {
    try {
      await stripe.accounts.update(accountId, {
        settings: {
          payouts: {
            schedule
          }
        }
      });

      logger.info('api', `Updated payout schedule for account ${accountId}`);
    } catch (error) {
      logger.error('api', `Failed to update payout schedule for ${accountId}:`, error);
      throw new Error('Failed to update payout schedule');
    }
  }

  /**
   * Handle account verification webhooks
   */
  async handleAccountUpdate(account: Stripe.Account): Promise<void> {
    const affiliateId = account.metadata?.affiliateId;
    if (!affiliateId) return;

    // Update affiliate status based on account status
    if (account.charges_enabled && account.payouts_enabled) {
      // Account is fully verified
      logger.info('api', `Connect account ${account.id} fully verified for affiliate ${affiliateId}`);
      
      // TODO: Update affiliate record with Stripe account ID
      // await db.affiliates.update(affiliateId, {
      //   stripeAccountId: account.id,
      //   stripeAccountStatus: 'active'
      // });
    } else if (account.requirements?.currently_due?.length) {
      // Account needs more information
      logger.warn('api', `Connect account ${account.id} needs more info:`, account.requirements.currently_due);
      
      // TODO: Send email to affiliate about required information
    }
  }

  /**
   * Get transfer history for an account
   */
  async getTransferHistory(
    accountId: string,
    limit: number = 10
  ): Promise<Stripe.Transfer[]> {
    try {
      const transfers = await stripe.transfers.list({
        destination: accountId,
        limit
      });

      return transfers.data;
    } catch (error) {
      logger.error('api', `Failed to get transfer history for ${accountId}:`, error);
      return [];
    }
  }

  /**
   * Calculate and return platform fees
   */
  calculatePlatformFee(amount: number, feePercentage: number = 2.5): number {
    return Math.round(amount * (feePercentage / 100));
  }

  /**
   * Create a transfer with platform fee
   */
  async createPayoutWithFee(
    accountId: string,
    grossAmount: number,
    platformFeePercentage: number = 2.5,
    description?: string
  ): Promise<{
    transfer: Stripe.Transfer;
    netAmount: number;
    platformFee: number;
  }> {
    const platformFee = this.calculatePlatformFee(grossAmount, platformFeePercentage);
    const netAmount = grossAmount - platformFee;

    try {
      // Create transfer for net amount
      const transfer = await stripe.transfers.create({
        amount: Math.round(netAmount * 100),
        currency: 'usd',
        destination: accountId,
        description: description || 'VibeLux affiliate commission payout (after fees)',
        metadata: {
          type: 'affiliate_commission',
          gross_amount: grossAmount,
          platform_fee: platformFee,
          fee_percentage: platformFeePercentage
        }
      });

      return {
        transfer,
        netAmount,
        platformFee
      };
    } catch (error) {
      logger.error('api', 'Failed to create payout with fee:', error);
      throw new Error('Failed to process payout');
    }
  }
}

// Export singleton instance
export const stripeConnect = new StripeConnectService();