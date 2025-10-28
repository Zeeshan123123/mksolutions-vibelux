// src/lib/notification/alert-notification.ts

import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface NotificationConfig {
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    fromName?: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    fromPhone: string;
  };
}

export interface EmailNotification {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: {
    id: string;
    data: Record<string, any>;
  };
}

export interface SMSNotification {
  to: string | string[];
  message: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// ============================================
// RATE LIMITER
// ============================================

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    // Clean up expired entries
    if (entry && entry.resetTime < now) {
      this.limits.delete(key);
    }

    const current = this.limits.get(key);

    if (!current) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetIn: this.windowMs,
      };
    }

    if (current.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: current.resetTime - now,
      };
    }

    current.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - current.count,
      resetIn: current.resetTime - now,
    };
  }

  reset(key: string): void {
    this.limits.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetTime < now) {
        this.limits.delete(key);
      }
    }
  }
}

// ============================================
// ALERT NOTIFICATION SERVICE
// ============================================

export class AlertNotificationService {
  private config: NotificationConfig;
  private twilioClient: any;
  private emailRateLimiter: RateLimiter;
  private smsRateLimiter: RateLimiter;

  constructor(config: NotificationConfig) {
    this.config = config;

    // Initialize SendGrid
    sgMail.setApiKey(config.sendgrid.apiKey);

    // Initialize Twilio (optional - only if credentials provided)
if (config.twilio.accountSid && config.twilio.authToken && 
    config.twilio.accountSid.startsWith('AC')) {
  this.twilioClient = twilio(
    config.twilio.accountSid,
    config.twilio.authToken
  );
  console.log('✅ Twilio initialized');
} else {
  this.twilioClient = null;
  console.log('⚠️ Twilio not configured - SMS disabled');
}

    // Initialize rate limiters
    // Email: 20 per hour per recipient
    this.emailRateLimiter = new RateLimiter(20, 60 * 60 * 1000);
    // SMS: 10 per hour per recipient
    this.smsRateLimiter = new RateLimiter(10, 60 * 60 * 1000);

    // Cleanup old entries every 5 minutes
    setInterval(() => {
      this.emailRateLimiter.cleanup();
      this.smsRateLimiter.cleanup();
    }, 5 * 60 * 1000);
  }

  // ============================================
  // EMAIL NOTIFICATIONS
  // ============================================

  async sendEmail(
    notification: EmailNotification
  ): Promise<NotificationResult> {
    try {
      const recipients = Array.isArray(notification.to)
        ? notification.to
        : [notification.to];

      // Check rate limits for all recipients
      for (const recipient of recipients) {
        const rateLimitCheck = this.emailRateLimiter.check(
          `email:${recipient}`
        );
        if (!rateLimitCheck.allowed) {
          return {
            success: false,
            error: `Rate limit exceeded for ${recipient}. Try again in ${Math.ceil(rateLimitCheck.resetIn / 1000)}s`,
          };
        }
      }

      const msg: any = {
        to: notification.to,
        from: {
          email: this.config.sendgrid.fromEmail,
          name: this.config.sendgrid.fromName || 'Alert System',
        },
        subject: notification.subject,
      };

      // Use template if provided, otherwise use html/text
      if (notification.template) {
        msg.templateId = notification.template.id;
        msg.dynamicTemplateData = notification.template.data;
      } else {
        if (notification.html) msg.html = notification.html;
        if (notification.text) msg.text = notification.text;
      }

      const response = await sgMail.send(msg);

      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
      };
    } catch (error: any) {
      console.error('Email notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  // ============================================
  // SMS NOTIFICATIONS
  // ============================================

  async sendSMS(notification: SMSNotification): Promise<NotificationResult> {
      if (!this.twilioClient) {
    return {
      success: false,
      error: 'SMS service not configured. Please add Twilio credentials.',
    };
  }
    try {
      const recipients = Array.isArray(notification.to)
        ? notification.to
        : [notification.to];

      // For multiple recipients, send individually
      if (recipients.length > 1) {
        const results = await Promise.all(
          recipients.map((to) =>
            this.sendSMS({ to, message: notification.message })
          )
        );

        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          return {
            success: false,
            error: `Failed to send to ${failed.length} recipient(s)`,
          };
        }

        return { success: true };
      }

      const recipient = recipients[0];

      // Check rate limit
      const rateLimitCheck = this.smsRateLimiter.check(`sms:${recipient}`);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: `Rate limit exceeded for ${recipient}. Try again in ${Math.ceil(rateLimitCheck.resetIn / 1000)}s`,
        };
      }

      const message = await this.twilioClient.messages.create({
        body: notification.message,
        from: this.config.twilio.fromPhone,
        to: recipient,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error: any) {
      console.error('SMS notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }
  }

  // ============================================
  // COMBINED NOTIFICATIONS
  // ============================================

  async sendAlert(params: {
    email?: EmailNotification;
    sms?: SMSNotification;
  }): Promise<{
    email?: NotificationResult;
    sms?: NotificationResult;
  }> {
    const results: {
      email?: NotificationResult;
      sms?: NotificationResult;
    } = {};

    if (params.email) {
      results.email = await this.sendEmail(params.email);
    }

    if (params.sms) {
      results.sms = await this.sendSMS(params.sms);
    }

    return results;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async sendCriticalAlert(params: {
    to: { email: string; phone?: string };
    title: string;
    message: string;
  }): Promise<void> {
    const { to, title, message } = params;

    const alerts = await this.sendAlert({
      email: {
        to: to.email,
        subject: `🚨 CRITICAL: ${title}`,
        html: this.generateCriticalAlertHTML(title, message),
        text: `CRITICAL ALERT: ${title}\n\n${message}`,
      },
      sms: to.phone
        ? {
            to: to.phone,
            message: `CRITICAL: ${title} - ${message.substring(0, 100)}`,
          }
        : undefined,
    });

    if (!alerts.email?.success && !alerts.sms?.success) {
      throw new Error('Failed to send critical alert through any channel');
    }
  }

  private generateCriticalAlertHTML(title: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; }
            .title { color: #dc3545; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .message { font-size: 16px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert-box">
              <div class="title">🚨 ${title}</div>
              <div class="message">${message}</div>
            </div>
            <div class="footer">
              This is an automated critical alert. Please take immediate action.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getRateLimitInfo(identifier: string, type: 'email' | 'sms') {
    const limiter = type === 'email' ? this.emailRateLimiter : this.smsRateLimiter;
    return limiter.check(`${type}:${identifier}`);
  }

  resetRateLimit(identifier: string, type: 'email' | 'sms') {
    const limiter = type === 'email' ? this.emailRateLimiter : this.smsRateLimiter;
    limiter.reset(`${type}:${identifier}`);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let notificationService: AlertNotificationService | null = null;

export function initNotificationService(config: NotificationConfig) {
  notificationService = new AlertNotificationService(config);
  return notificationService;
}

export function getNotificationService(): AlertNotificationService {
  if (!notificationService) {
    throw new Error('Notification service not initialized. Call initNotificationService first.');
  }
  return notificationService;
}