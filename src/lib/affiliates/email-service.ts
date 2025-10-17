/**
 * Affiliate Email Service
 * Handles all email communications for the affiliate program
 */

import { sendEmail } from '@/lib/email/email-service';
import { render } from '@react-email/render';
import { AffiliateWelcomeEmail } from '@/lib/email/templates/affiliate-welcome';
import { AffiliatePayoutEmail } from '@/lib/email/templates/affiliate-payout';
import { AffiliateApplicationReceivedEmail } from '@/lib/email/templates/affiliate-application-received';
import { logger } from '@/lib/logging/production-logger';

interface AffiliateEmailData {
  email: string;
  name: string;
}

export class AffiliateEmailService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app';

  /**
   * Send application received confirmation
   */
  async sendApplicationReceived(data: AffiliateEmailData): Promise<void> {
    try {
      const emailHtml = render(
        AffiliateApplicationReceivedEmail({
          applicantName: data.name,
          applicationDate: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        })
      );

      await sendEmail({
        to: data.email,
        subject: 'Application Received - VibeLux Affiliate Program',
        html: emailHtml,
        tags: ['affiliate', 'application-received']
      });

      logger.info('api', `Sent application received email to ${data.email}`);
    } catch (error) {
      logger.error('api', 'Failed to send application received email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to approved affiliate
   */
  async sendWelcomeEmail(data: {
    email: string;
    name: string;
    affiliateCode: string;
    commissionRate: number;
  }): Promise<void> {
    try {
      const affiliateLink = `${this.baseUrl}?ref=${data.affiliateCode}`;
      const dashboardUrl = `${this.baseUrl}/affiliate/dashboard`;

      const emailHtml = render(
        AffiliateWelcomeEmail({
          affiliateName: data.name,
          affiliateCode: data.affiliateCode,
          affiliateLink,
          dashboardUrl,
          commissionRate: data.commissionRate
        })
      );

      await sendEmail({
        to: data.email,
        subject: 'Welcome to the VibeLux Affiliate Program! 🎉',
        html: emailHtml,
        tags: ['affiliate', 'welcome']
      });

      logger.info('api', `Sent welcome email to affiliate ${data.email}`);
    } catch (error) {
      logger.error('api', 'Failed to send welcome email:', error);
      throw error;
    }
  }

  /**
   * Send payout processed notification
   */
  async sendPayoutNotification(data: {
    email: string;
    name: string;
    payoutAmount: number;
    netAmount: number;
    platformFee: number;
    period: string;
    transactionId: string;
    commissions: Array<{
      customerName: string;
      amount: number;
      date: string;
    }>;
  }): Promise<void> {
    try {
      const dashboardUrl = `${this.baseUrl}/affiliate/dashboard`;

      const emailHtml = render(
        AffiliatePayoutEmail({
          affiliateName: data.name,
          payoutAmount: data.payoutAmount,
          netAmount: data.netAmount,
          platformFee: data.platformFee,
          period: data.period,
          transactionId: data.transactionId,
          dashboardUrl,
          commissions: data.commissions
        })
      );

      await sendEmail({
        to: data.email,
        subject: `Affiliate Payout Processed - $${data.netAmount.toFixed(2)} 💰`,
        html: emailHtml,
        tags: ['affiliate', 'payout']
      });

      logger.info('api', `Sent payout notification to ${data.email}`);
    } catch (error) {
      logger.error('api', 'Failed to send payout notification:', error);
      throw error;
    }
  }

  /**
   * Send monthly performance summary
   */
  async sendMonthlySummary(data: {
    email: string;
    name: string;
    month: string;
    stats: {
      clicks: number;
      conversions: number;
      revenue: number;
      commission: number;
      conversionRate: number;
    };
    topProducts: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
  }): Promise<void> {
    try {
      const dashboardUrl = `${this.baseUrl}/affiliate/dashboard`;

      // For now, use a simple HTML template
      const html = `
        <h2>Hi ${data.name},</h2>
        <p>Here's your affiliate performance summary for ${data.month}:</p>
        
        <h3>Key Metrics:</h3>
        <ul>
          <li>Total Clicks: ${data.stats.clicks}</li>
          <li>Conversions: ${data.stats.conversions}</li>
          <li>Conversion Rate: ${data.stats.conversionRate.toFixed(2)}%</li>
          <li>Revenue Generated: $${data.stats.revenue.toFixed(2)}</li>
          <li>Commission Earned: $${data.stats.commission.toFixed(2)}</li>
        </ul>
        
        <h3>Top Performing Products:</h3>
        <ol>
          ${data.topProducts.map(p => 
            `<li>${p.name} - ${p.sales} sales ($${p.revenue.toFixed(2)})</li>`
          ).join('')}
        </ol>
        
        <p><a href="${dashboardUrl}">View Full Dashboard</a></p>
        
        <p>Keep up the great work!</p>
        <p>The VibeLux Team</p>
      `;

      await sendEmail({
        to: data.email,
        subject: `${data.month} Affiliate Performance Summary`,
        html,
        tags: ['affiliate', 'monthly-summary']
      });

      logger.info('api', `Sent monthly summary to ${data.email}`);
    } catch (error) {
      logger.error('api', 'Failed to send monthly summary:', error);
      throw error;
    }
  }

  /**
   * Send commission tier upgrade notification
   */
  async sendTierUpgrade(data: {
    email: string;
    name: string;
    oldTier: string;
    newTier: string;
    newRate: number;
    activeReferrals: number;
  }): Promise<void> {
    try {
      const html = `
        <h2>Congratulations ${data.name}! 🎉</h2>
        
        <p>Great news! You've been upgraded to the <strong>${data.newTier}</strong> tier in our affiliate program!</p>
        
        <h3>Your New Benefits:</h3>
        <ul>
          <li>Commission Rate: ${data.newRate}%</li>
          <li>Active Referrals: ${data.activeReferrals}</li>
          <li>Previous Tier: ${data.oldTier}</li>
        </ul>
        
        <p>This upgrade reflects your outstanding performance and dedication to helping growers discover VibeLux.</p>
        
        <p>Keep up the amazing work!</p>
        <p>The VibeLux Team</p>
      `;

      await sendEmail({
        to: data.email,
        subject: `Congratulations! You've been upgraded to ${data.newTier} tier 🏆`,
        html,
        tags: ['affiliate', 'tier-upgrade']
      });

      logger.info('api', `Sent tier upgrade notification to ${data.email}`);
    } catch (error) {
      logger.error('api', 'Failed to send tier upgrade notification:', error);
      throw error;
    }
  }

  /**
   * Send account suspension notification
   */
  async sendAccountSuspension(data: {
    email: string;
    name: string;
    reason: string;
    contactEmail: string;
  }): Promise<void> {
    try {
      const html = `
        <h2>Hi ${data.name},</h2>
        
        <p>We're writing to inform you that your VibeLux affiliate account has been temporarily suspended.</p>
        
        <p><strong>Reason:</strong> ${data.reason}</p>
        
        <p>If you believe this is an error or would like to discuss this decision, please contact us at 
        <a href="mailto:${data.contactEmail}">${data.contactEmail}</a>.</p>
        
        <p>We value our affiliate partnerships and hope to resolve this matter quickly.</p>
        
        <p>Best regards,<br>The VibeLux Team</p>
      `;

      await sendEmail({
        to: data.email,
        subject: 'Important: VibeLux Affiliate Account Status',
        html,
        tags: ['affiliate', 'account-suspension']
      });

      logger.info('api', `Sent account suspension notification to ${data.email}`);
    } catch (error) {
      logger.error('api', 'Failed to send account suspension notification:', error);
      throw error;
    }
  }

  /**
   * Send referral conversion notification
   */
  async sendConversionNotification(data: {
    email: string;
    name: string;
    customerName: string;
    productName: string;
    orderValue: number;
    commission: number;
  }): Promise<void> {
    try {
      const html = `
        <h2>Great news ${data.name}! 💰</h2>
        
        <p>One of your referrals just made a purchase!</p>
        
        <h3>Conversion Details:</h3>
        <ul>
          <li>Customer: ${data.customerName}</li>
          <li>Product: ${data.productName}</li>
          <li>Order Value: $${data.orderValue.toFixed(2)}</li>
          <li>Your Commission: $${data.commission.toFixed(2)}</li>
        </ul>
        
        <p>This commission will be included in your next monthly payout.</p>
        
        <p>Keep sharing and earning!</p>
        <p>The VibeLux Team</p>
      `;

      await sendEmail({
        to: data.email,
        subject: `Cha-ching! You earned $${data.commission.toFixed(2)} in commission`,
        html,
        tags: ['affiliate', 'conversion-notification']
      });

      logger.info('api', `Sent conversion notification to ${data.email}`);
    } catch (error) {
      logger.error('api', 'Failed to send conversion notification:', error);
      // Don't throw - this is not critical
    }
  }
}

// Export singleton instance
export const affiliateEmailService = new AffiliateEmailService();