/**
 * SendGrid Email Service
 * Comprehensive email system for VibeLux platform
 */

import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { logger } from '../logging/production-logger';
import { prisma } from '../prisma';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
  categories?: string[];
  sendAt?: number;
  batchId?: string;
  asm?: {
    groupId: number;
    groupsToDisplay?: number[];
  };
  ipPoolName?: string;
  customArgs?: Record<string, string>;
  trackingSettings?: {
    clickTracking?: { enable: boolean };
    openTracking?: { enable: boolean };
    subscriptionTracking?: { enable: boolean };
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  category: 'transactional' | 'marketing' | 'notification' | 'business';
}

export class SendGridService {
  private readonly defaultFrom = process.env.SENDGRID_FROM_EMAIL || 'hello@vibelux.ai';
  private readonly defaultReplyTo = process.env.SENDGRID_REPLY_TO || 'support@vibelux.ai';
  
  // Template IDs (will be created in SendGrid)
  public readonly templates = {
    // Transactional
    welcome: 'd-welcome001',
    emailVerification: 'd-verify001',
    passwordReset: 'd-reset001',
    passwordChanged: 'd-changed001',
    accountDeleted: 'd-deleted001',
    twoFactorCode: 'd-2fa001',
    
    // Subscription & Billing
    subscriptionConfirmation: 'd-subconf001',
    subscriptionUpgrade: 'd-upgrade001',
    subscriptionDowngrade: 'd-downgrade001',
    subscriptionCanceled: 'd-canceled001',
    subscriptionRenewal: 'd-renewal001',
    paymentSuccessful: 'd-payment001',
    paymentFailed: 'd-failed001',
    trialEnding: 'd-trial001',
    invoiceGenerated: 'd-invoice001',
    
    // System Notifications
    systemAlert: 'd-alert001',
    environmentalAlert: 'd-envAlert001',
    maintenanceNotice: 'd-maintenance001',
    performanceReport: 'd-performance001',
    weeklyDigest: 'd-digest001',
    monthlyReport: 'd-monthly001',
    
    // Collaboration
    teamInvite: 'd-invite001',
    projectShared: 'd-shared001',
    commentNotification: 'd-comment001',
    mentionNotification: 'd-mention001',
    taskAssigned: 'd-task001',
    
    // Business
    quoteSent: 'd-quote001',
    contractSent: 'd-contract001',
    proposalSent: 'd-proposal001',
    sopApproval: 'd-sop001',
    complianceReport: 'd-compliance001',
    
    // Marketing
    newsletter: 'd-news001',
    productUpdate: 'd-update001',
    featureAnnouncement: 'd-feature001',
    webinarInvite: 'd-webinar001',
    surveyRequest: 'd-survey001',
    referralProgram: 'd-referral001',
    
    // Marketplace
    orderConfirmation: 'd-order001',
    orderShipped: 'd-shipped001',
    orderDelivered: 'd-delivered001',
    bidReceived: 'd-bid001',
    offerAccepted: 'd-accepted001',
    reviewRequest: 'd-review001',
    
    // Growing Operations
    harvestReminder: 'd-harvest001',
    pestAlert: 'd-pest001',
    nutrientSchedule: 'd-nutrient001',
    lightingSchedule: 'd-lighting001',
    labResults: 'd-lab001',
    yieldReport: 'd-yield001',
  };
  
  /**
   * Send a single email
   */
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const msg: MailDataRequired = {
        to: options.to,
        from: options.from || this.defaultFrom,
        replyTo: options.replyTo || this.defaultReplyTo,
        subject: options.subject,
        categories: options.categories,
        sendAt: options.sendAt,
        batchId: options.batchId,
        asm: options.asm,
        ipPoolName: options.ipPoolName,
        customArgs: options.customArgs,
        trackingSettings: options.trackingSettings || {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: true }
        }
      };
      
      // Use template or HTML/text
      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.dynamicTemplateData;
      } else {
        msg.html = options.html;
        msg.text = options.text;
      }
      
      // Add attachments if provided
      if (options.attachments) {
        msg.attachments = options.attachments;
      }
      
      // Send the email
      const [response] = await sgMail.send(msg);
      
      // Log success
      await this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        templateId: options.templateId,
        status: 'sent',
        messageId: response.headers['x-message-id'],
        sendGridId: response.headers['x-sendgrid-id']
      });
      
      return {
        success: true,
        messageId: response.headers['x-message-id']
      };
    } catch (error: any) {
      logger.error('email', 'Failed to send email via SendGrid', error);
      
      // Log failure
      await this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        templateId: options.templateId,
        status: 'failed',
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Send multiple emails in batch
   */
  async sendBatch(emails: EmailOptions[]): Promise<{ sent: number; failed: number; results: any[] }> {
    const results = [];
    let sent = 0;
    let failed = 0;
    
    // Process in batches of 1000 (SendGrid limit)
    const batchSize = 1000;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const messages = batch.map(email => ({
          to: email.to,
          from: email.from || this.defaultFrom,
          replyTo: email.replyTo || this.defaultReplyTo,
          subject: email.subject,
          templateId: email.templateId,
          dynamicTemplateData: email.dynamicTemplateData,
          html: email.html,
          text: email.text,
          categories: email.categories,
          customArgs: email.customArgs
        }));
        
        const response = await sgMail.send(messages);
        sent += batch.length;
        results.push(...response);
      } catch (error: any) {
        failed += batch.length;
        logger.error('email', `Batch send failed for ${batch.length} emails`, error);
        results.push({ error: error.message, count: batch.length });
      }
    }
    
    return { sent, failed, results };
  }
  
  /**
   * Send transactional emails
   */
  async sendWelcomeEmail(user: { email: string; name: string; plan?: string }) {
    return this.send({
      to: user.email,
      templateId: this.templates.welcome,
      dynamicTemplateData: {
        userName: user.name,
        userEmail: user.email,
        planName: user.plan || 'Free',
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`,
        year: new Date().getFullYear()
      },
      categories: ['transactional', 'welcome'],
      customArgs: {
        userId: user.email,
        emailType: 'welcome'
      }
    });
  }
  
  async sendVerificationEmail(user: { email: string; name: string }, verificationUrl: string) {
    return this.send({
      to: user.email,
      templateId: this.templates.emailVerification,
      dynamicTemplateData: {
        userName: user.name,
        verificationUrl,
        expiresIn: '24 hours',
        supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`
      },
      categories: ['transactional', 'verification']
    });
  }
  
  async sendPasswordResetEmail(user: { email: string; name: string }, resetUrl: string) {
    return this.send({
      to: user.email,
      templateId: this.templates.passwordReset,
      dynamicTemplateData: {
        userName: user.name,
        resetUrl,
        expiresIn: '1 hour',
        ipAddress: 'User IP here', // Get from request
        supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`
      },
      categories: ['transactional', 'password-reset']
    });
  }
  
  /**
   * Send subscription emails
   */
  async sendSubscriptionEmail(type: 'confirmation' | 'upgrade' | 'downgrade' | 'canceled' | 'renewal', data: any) {
    const templateMap = {
      confirmation: this.templates.subscriptionConfirmation,
      upgrade: this.templates.subscriptionUpgrade,
      downgrade: this.templates.subscriptionDowngrade,
      canceled: this.templates.subscriptionCanceled,
      renewal: this.templates.subscriptionRenewal
    };
    
    return this.send({
      to: data.email,
      templateId: templateMap[type],
      dynamicTemplateData: {
        userName: data.name,
        planName: data.planName,
        previousPlan: data.previousPlan,
        price: data.price,
        interval: data.interval,
        nextBillingDate: data.nextBillingDate,
        features: data.features,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
      },
      categories: ['transactional', 'subscription', type]
    });
  }
  
  /**
   * Send alert emails
   */
  async sendAlert(alert: {
    type: 'environmental' | 'system' | 'security' | 'compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    recipients: string[];
    title: string;
    message: string;
    data?: Record<string, any>;
    actionUrl?: string;
  }) {
    const severityColors = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444',
      critical: '#991B1B'
    };
    
    return this.send({
      to: alert.recipients,
      templateId: alert.type === 'environmental' ? this.templates.environmentalAlert : this.templates.systemAlert,
      dynamicTemplateData: {
        alertTitle: alert.title,
        alertMessage: alert.message,
        severity: alert.severity,
        severityColor: severityColors[alert.severity],
        timestamp: new Date().toISOString(),
        actionUrl: alert.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/alerts`,
        data: alert.data
      },
      categories: ['notification', 'alert', alert.type],
      trackingSettings: {
        openTracking: { enable: true },
        clickTracking: { enable: true }
      }
    });
  }
  
  /**
   * Send report emails
   */
  async sendReport(report: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
    recipients: string[];
    facilityName: string;
    metrics: any;
    insights: string[];
    recommendations: string[];
    attachments?: any[];
  }) {
    const templateMap = {
      daily: this.templates.performanceReport,
      weekly: this.templates.weeklyDigest,
      monthly: this.templates.monthlyReport,
      quarterly: this.templates.monthlyReport,
      annual: this.templates.monthlyReport
    };
    
    return this.send({
      to: report.recipients,
      templateId: templateMap[report.type],
      dynamicTemplateData: {
        reportType: report.type,
        facilityName: report.facilityName,
        reportPeriod: this.getReportPeriod(report.type),
        metrics: report.metrics,
        insights: report.insights,
        recommendations: report.recommendations,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/analytics`,
        exportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reports/export`
      },
      attachments: report.attachments,
      categories: ['report', report.type]
    });
  }
  
  /**
   * Send invoice emails
   */
  async sendInvoice(invoice: {
    recipient: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    items: Array<{ description: string; quantity: number; price: number }>;
    pdfUrl?: string;
  }) {
    return this.send({
      to: invoice.recipient,
      templateId: this.templates.invoiceGenerated,
      dynamicTemplateData: {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        items: invoice.items,
        subtotal: invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        tax: invoice.amount * 0.08, // Calculate based on location
        total: invoice.amount,
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.invoiceNumber}`,
        pdfUrl: invoice.pdfUrl
      },
      categories: ['business', 'invoice']
    });
  }
  
  /**
   * Send marketing emails
   */
  async sendNewsletter(newsletter: {
    recipients: string[];
    subject: string;
    content: {
      hero: { title: string; subtitle: string; image?: string };
      articles: Array<{ title: string; summary: string; link: string; image?: string }>;
      announcements?: string[];
    };
  }) {
    return this.sendBatch(
      newsletter.recipients.map(recipient => ({
        to: recipient,
        subject: newsletter.subject,
        templateId: this.templates.newsletter,
        dynamicTemplateData: {
          heroTitle: newsletter.content.hero.title,
          heroSubtitle: newsletter.content.hero.subtitle,
          heroImage: newsletter.content.hero.image,
          articles: newsletter.content.articles,
          announcements: newsletter.content.announcements,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`,
          preferencesUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preferences`
        },
        categories: ['marketing', 'newsletter'],
        asm: {
          groupId: 12345, // Newsletter unsubscribe group
          groupsToDisplay: [12345]
        }
      }))
    );
  }
  
  /**
   * Log email activity
   */
  private async logEmail(data: {
    to: string[];
    subject: string;
    templateId?: string;
    status: 'sent' | 'failed' | 'bounced' | 'opened' | 'clicked';
    messageId?: string;
    sendGridId?: string;
    error?: string;
  }) {
    try {
      await prisma.emailLog.create({
        data: {
          recipients: data.to,
          subject: data.subject,
          templateId: data.templateId,
          status: data.status,
          messageId: data.messageId,
          sendGridId: data.sendGridId,
          error: data.error,
          sentAt: new Date()
        }
      });
    } catch (error) {
      logger.error('email', 'Failed to log email activity', error as Error);
    }
  }
  
  /**
   * Handle SendGrid webhooks
   */
  async handleWebhook(events: any[]) {
    for (const event of events) {
      switch (event.event) {
        case 'delivered':
        case 'bounce':
        case 'dropped':
        case 'deferred':
          await this.updateEmailStatus(event.sg_message_id, event.event);
          break;
          
        case 'open':
        case 'click':
          await this.trackEngagement(event.sg_message_id, event.event, event.url);
          break;
          
        case 'unsubscribe':
        case 'group_unsubscribe':
          await this.handleUnsubscribe(event.email, event.asm_group_id);
          break;
          
        case 'spamreport':
          await this.handleSpamReport(event.email);
          break;
      }
    }
  }
  
  private async updateEmailStatus(messageId: string, status: string) {
    try {
      await prisma.emailLog.updateMany({
        where: { messageId },
        data: { 
          status: status as any,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('email', 'Failed to update email status', error as Error);
    }
  }
  
  private async trackEngagement(messageId: string, event: string, url?: string) {
    try {
      await prisma.emailEngagement.create({
        data: {
          messageId,
          event,
          url,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('email', 'Failed to track engagement', error as Error);
    }
  }
  
  private async handleUnsubscribe(email: string, groupId?: number) {
    try {
      await prisma.emailPreference.upsert({
        where: { email },
        update: {
          unsubscribed: true,
          unsubscribedGroups: groupId ? { push: groupId } : undefined,
          unsubscribedAt: new Date()
        },
        create: {
          email,
          unsubscribed: true,
          unsubscribedGroups: groupId ? [groupId] : [],
          unsubscribedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('email', 'Failed to handle unsubscribe', error as Error);
    }
  }
  
  private async handleSpamReport(email: string) {
    try {
      await prisma.emailPreference.upsert({
        where: { email },
        update: {
          markedAsSpam: true,
          markedAsSpamAt: new Date()
        },
        create: {
          email,
          markedAsSpam: true,
          markedAsSpamAt: new Date()
        }
      });
    } catch (error) {
      logger.error('email', 'Failed to handle spam report', error as Error);
    }
  }
  
  private getReportPeriod(type: string): string {
    const now = new Date();
    const periods = {
      daily: `${now.toLocaleDateString()}`,
      weekly: `Week of ${new Date(now.setDate(now.getDate() - 7)).toLocaleDateString()}`,
      monthly: `${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      quarterly: `Q${Math.floor((now.getMonth() + 3) / 3)} ${now.getFullYear()}`,
      annual: `${now.getFullYear()}`
    };
    return periods[type as keyof typeof periods] || '';
  }
}

// Export singleton instance
export const sendGridService = new SendGridService();