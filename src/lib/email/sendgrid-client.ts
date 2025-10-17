/**
 * SendGrid Email Client
 * Handles automated customer communications
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface EmailTemplate {
  to: string;
  subject: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  html?: string;
  text?: string;
}

export class SendGridClient {
  /**
   * Send utility connection invitation
   */
  static async sendUtilityConnectionInvite(
    email: string,
    facilityId: string,
    facilityName: string,
    customerName?: string
  ) {
    const authUrl = `https://utilityapi.com/authorize/blake_vibelux?facility_id=${facilityId}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success`;

    const msg = {
      to: email,
      from: {
        email: 'energy@vibelux.ai',
        name: 'VibeLux Energy Team'
      },
      subject: '🔋 Connect Your Utility in 30 Seconds - Start Saving Today',
      templateId: process.env.SENDGRID_UTILITY_INVITE_TEMPLATE_ID,
      dynamicTemplateData: {
        customer_name: customerName || 'there',
        facility_name: facilityName,
        auth_url: authUrl,
        savings_estimate: '20-40%',
        connection_time: '30 seconds',
        // Additional dynamic links
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        security_url: `${process.env.NEXT_PUBLIC_APP_URL}/security`,
        how_it_works_url: `${process.env.NEXT_PUBLIC_APP_URL}/how-it-works`,
        unsubscribe_url: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      }
    };

    try {
      await sgMail.send(msg);
      logger.info('api', `✉️ Utility connection invite sent to ${email}`);
    } catch (error) {
      logger.error('api', 'SendGrid error:', error );
      throw error;
    }
  }

  /**
   * Send connection success confirmation
   */
  static async sendConnectionSuccess(
    email: string,
    utilityName: string,
    expectedSavings?: number
  ) {
    const msg = {
      to: email,
      from: {
        email: 'energy@vibelux.ai',
        name: 'VibeLux Energy Team'
      },
      subject: '✅ Utility Connected Successfully - Analysis Started',
      templateId: process.env.SENDGRID_CONNECTION_SUCCESS_TEMPLATE_ID,
      dynamicTemplateData: {
        utility_name: utilityName,
        expected_savings: expectedSavings || '$5,000-$15,000',
        analysis_time: '24-48 hours',
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      }
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      logger.error('api', 'SendGrid error:', error );
    }
  }

  /**
   * Send savings report ready notification
   */
  static async sendSavingsReportReady(
    email: string,
    facilityName: string,
    annualSavings: number,
    customerShare: number
  ) {
    const msg = {
      to: email,
      from: {
        email: 'energy@vibelux.ai',
        name: 'VibeLux Energy Team'
      },
      subject: `💰 Your Energy Savings Report is Ready - Save $${annualSavings.toLocaleString()}/year`,
      templateId: process.env.SENDGRID_SAVINGS_REPORT_TEMPLATE_ID,
      dynamicTemplateData: {
        facility_name: facilityName,
        annual_savings: annualSavings.toLocaleString(),
        customer_share: customerShare.toLocaleString(),
        monthly_savings: Math.round(customerShare / 12).toLocaleString(),
        report_url: `${process.env.NEXT_PUBLIC_APP_URL}/reports/savings`,
        cta_text: 'View My Savings Report'
      }
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      logger.error('api', 'SendGrid error:', error );
    }
  }

  /**
   * Send connection failure notification
   */
  static async sendConnectionFailure(
    email: string,
    facilityName: string,
    reason?: string
  ) {
    const msg = {
      to: email,
      from: {
        email: 'support@vibelux.ai',
        name: 'VibeLux Support'
      },
      subject: '⚠️ Utility Connection Issue - Action Required',
      templateId: process.env.SENDGRID_CONNECTION_FAILURE_TEMPLATE_ID,
      dynamicTemplateData: {
        facility_name: facilityName,
        failure_reason: reason || 'Authorization was not completed',
        retry_url: `https://utilityapi.com/authorize/blake_vibelux?facility_id=${facilityName}`,
        support_email: 'support@vibelux.ai'
      }
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      logger.error('api', 'SendGrid error:', error );
    }
  }

  /**
   * Send monthly savings update
   */
  static async sendMonthlySavingsUpdate(
    email: string,
    month: string,
    savedAmount: number,
    carbonReduced: number,
    yearToDateSavings: number
  ) {
    const msg = {
      to: email,
      from: {
        email: 'energy@vibelux.ai',
        name: 'VibeLux Energy Team'
      },
      subject: `📊 ${month} Energy Savings Report - You Saved $${savedAmount}`,
      templateId: process.env.SENDGRID_MONTHLY_UPDATE_TEMPLATE_ID,
      dynamicTemplateData: {
        month,
        saved_amount: savedAmount.toLocaleString(),
        carbon_reduced: carbonReduced.toLocaleString(),
        ytd_savings: yearToDateSavings.toLocaleString(),
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      }
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      logger.error('api', 'SendGrid error:', error );
    }
  }

  /**
   * Send bulk invitations
   */
  static async sendBulkInvitations(
    invitations: Array<{
      email: string;
      facilityId: string;
      facilityName: string;
      customerName?: string;
    }>
  ) {
    const messages = invitations.map(inv => ({
      to: inv.email,
      from: {
        email: 'energy@vibelux.ai',
        name: 'VibeLux Energy Team'
      },
      subject: '🔋 Connect Your Utility in 30 Seconds - Start Saving Today',
      templateId: process.env.SENDGRID_UTILITY_INVITE_TEMPLATE_ID,
      dynamicTemplateData: {
        customer_name: inv.customerName || 'there',
        facility_name: inv.facilityName,
        auth_url: `https://utilityapi.com/authorize/blake_vibelux?facility_id=${inv.facilityId}`,
        savings_estimate: '20-40%'
      }
    }));

    try {
      await sgMail.send(messages);
      logger.info('api', `✉️ Sent ${messages.length} utility connection invites`);
    } catch (error) {
      logger.error('api', 'Bulk send error:', error );
      throw error;
    }
  }
}

export default SendGridClient;