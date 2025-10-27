/**
 * Emergency Notification System
 * Handles critical service request notifications
 */

import { logger } from '@/lib/logging/production-logger';
import { SendGridService } from '@/lib/email/sendgrid-service';
import { TwilioClient } from '@/lib/sms/twilio-client';

export interface EmergencyNotification {
  serviceRequestId: string;
  facilityName: string;
  priority: 'emergency' | 'urgent' | 'normal';
  category: string;
  description: string;
  facilityAddress?: string;
  contactPerson: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface ServiceProvider {
  id: string;
  email: string;
  companyName: string;
  phone?: string;
}

/**
 * Send emergency notifications to service providers
 */
export async function sendEmergencyNotifications(
  notification: EmergencyNotification,
  providers: ServiceProvider[]
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  logger.info('api', 'Sending emergency notifications', {
    serviceRequestId: notification.serviceRequestId,
    priority: notification.priority,
    providerCount: providers.length
  });

  // Send notifications to all providers in parallel
  const results = await Promise.allSettled([
    ...providers.map(provider => sendEmailNotification(notification, provider)),
    ...providers.map(provider => sendSMSNotification(notification, provider)),
  ]);

  // Collect any errors
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      errors.push(`Notification ${index} failed: ${result.reason}`);
    }
  });

  // Also send to internal monitoring
  await sendInternalAlert(notification, providers);

  const success = errors.length === 0;
  
  logger.info('api', 'Emergency notifications completed', {
    serviceRequestId: notification.serviceRequestId,
    success,
    errorCount: errors.length
  });

  return { success, errors };
}

/**
 * Send email notification to service provider
 */
async function sendEmailNotification(
  notification: EmergencyNotification,
  provider: ServiceProvider
): Promise<void> {
  try {
    // In development/demo mode, just log
    if (process.env.NODE_ENV === 'development') {
      logger.info('api', 'Email notification (dev mode)', {
        to: provider.email,
        company: provider.companyName,
        serviceRequestId: notification.serviceRequestId,
        priority: notification.priority
      });
      return;
    }

    // Check if email service is configured
    if (!process.env.SENDGRID_API_KEY) {
      logger.warn('api', 'SendGrid not configured, skipping email notification');
      return;
    }

    const emailService = new SendGridService();
    const priorityInfo = formatNotificationPriority(notification.priority);
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.ai'}/service-requests/${notification.serviceRequestId}`;

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${notification.priority === 'emergency' ? '#dc2626' : '#ea580c'}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .priority { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${priorityInfo.emoji} ${priorityInfo.urgencyText}</h1>
          </div>
          <div class="content">
            <p>Hello ${provider.companyName},</p>
            <p>You have been matched with a ${notification.priority} service request that requires your immediate attention.</p>
            
            <div class="priority">${priorityInfo.emoji} Expected Response: ${priorityInfo.responseTime}</div>
            
            <div class="info-row"><span class="label">Facility:</span> ${notification.facilityName}</div>
            <div class="info-row"><span class="label">Service Type:</span> ${notification.category}</div>
            <div class="info-row"><span class="label">Description:</span> ${notification.description}</div>
            ${notification.facilityAddress ? `<div class="info-row"><span class="label">Location:</span> ${notification.facilityAddress}</div>` : ''}
            
            <h3>Contact Information:</h3>
            <div class="info-row"><span class="label">Contact Person:</span> ${notification.contactPerson}</div>
            ${notification.contactPhone ? `<div class="info-row"><span class="label">Phone:</span> ${notification.contactPhone}</div>` : ''}
            ${notification.contactEmail ? `<div class="info-row"><span class="label">Email:</span> ${notification.contactEmail}</div>` : ''}
            
            <a href="${dashboardUrl}" class="button">View Service Request</a>
          </div>
          <div class="footer">
            <p>VibeLux Emergency Service Notification System</p>
            <p>Service Request ID: ${notification.serviceRequestId}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    const result = await emailService.send({
      to: provider.email,
      subject: `${priorityInfo.emoji} ${notification.priority.toUpperCase()} Service Request - ${notification.facilityName}`,
      html: htmlContent,
      categories: ['emergency', 'service-request', notification.priority],
      customArgs: {
        serviceRequestId: notification.serviceRequestId,
        priority: notification.priority,
        providerId: provider.id
      }
    });

    if (result.success) {
      logger.info('api', 'Emergency email notification sent', {
        to: provider.email,
        serviceRequestId: notification.serviceRequestId,
        messageId: result.messageId
      });
    } else {
      throw new Error(result.error || 'Failed to send email');
    }

  } catch (error) {
    logger.error('api', 'Failed to send email notification', {
      error,
      provider: provider.email,
      serviceRequestId: notification.serviceRequestId
    });
    throw error;
  }
}

/**
 * Send SMS notification for emergency requests
 */
async function sendSMSNotification(
  notification: EmergencyNotification,
  provider: ServiceProvider
): Promise<void> {
  // Only send SMS for emergency and urgent requests
  if (notification.priority === 'normal' || !provider.phone) {
    return;
  }

  try {
    // In development/demo mode, just log
    if (process.env.NODE_ENV === 'development') {
      logger.info('api', 'SMS notification (dev mode)', {
        to: provider.phone,
        company: provider.companyName,
        serviceRequestId: notification.serviceRequestId,
        priority: notification.priority
      });
      return;
    }

    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      logger.warn('api', 'Twilio not configured, skipping SMS notification');
      return;
    }

    const smsService = new TwilioClient();
    const priorityInfo = formatNotificationPriority(notification.priority);
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.ai'}/service-requests/${notification.serviceRequestId}`;

    // Create concise SMS message (SMS has character limits)
    const message = `${priorityInfo.emoji} ${notification.priority.toUpperCase()}: ${notification.facilityName} needs ${notification.category} service. Contact: ${notification.contactPerson} ${notification.contactPhone || notification.contactEmail || ''}. View: ${dashboardUrl}`;

    // Send SMS via Twilio
    const result = await smsService.sendSMS({
      to: provider.phone,
      body: message
    });

    logger.info('api', 'Emergency SMS notification sent', {
      to: provider.phone,
      serviceRequestId: notification.serviceRequestId,
      messageId: result.sid,
      status: result.status
    });

  } catch (error: any) {
    // Don't throw for SMS failures if it's just configuration issue
    if (error.message?.includes('Twilio credentials not configured')) {
      logger.warn('api', 'SMS notification skipped - Twilio not configured');
      return;
    }

    logger.error('api', 'Failed to send SMS notification', {
      error: error.message || error,
      provider: provider.phone,
      serviceRequestId: notification.serviceRequestId
    });
    // Don't throw - we don't want SMS failure to block email notifications
  }
}

/**
 * Send internal alert for monitoring
 */
async function sendInternalAlert(
  notification: EmergencyNotification,
  providers: ServiceProvider[]
): Promise<void> {
  try {
    // Log for internal monitoring systems
    logger.warn('api', 'Emergency service request created', {
      serviceRequestId: notification.serviceRequestId,
      facilityName: notification.facilityName,
      priority: notification.priority,
      category: notification.category,
      providersNotified: providers.length,
      timestamp: new Date().toISOString(),
      alertLevel: notification.priority === 'emergency' ? 'critical' : 'warning'
    });

    // Send to internal monitoring dashboard
    if (typeof window === 'undefined') {
      // Server-side only - emit event for real-time dashboard
      const EventEmitter = require('events');
      const internalEvents = new EventEmitter();
      internalEvents.emit('emergency-alert', {
        type: 'service-request',
        data: notification,
        providers: providers.length
      });
    }

    // Send Slack notification if webhook is configured
    if (process.env.SLACK_WEBHOOK_URL && notification.priority === 'emergency') {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `:rotating_light: *EMERGENCY SERVICE REQUEST*`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Emergency Service Request Created*\n*Facility:* ${notification.facilityName}\n*Category:* ${notification.category}\n*Priority:* ${notification.priority.toUpperCase()}\n*Providers Notified:* ${providers.length}`
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Description:* ${notification.description}`
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: { type: 'plain_text', text: 'View Request' },
                    url: `${process.env.NEXT_PUBLIC_APP_URL}/service-requests/${notification.serviceRequestId}`
                  }
                ]
              }
            ]
          })
        });
        
        logger.info('api', 'Slack alert sent for emergency request', {
          serviceRequestId: notification.serviceRequestId
        });
      } catch (slackError) {
        logger.error('api', 'Failed to send Slack alert', { error: slackError });
      }
    }

    // Send internal management email for emergency requests
    if (notification.priority === 'emergency' && process.env.INTERNAL_ALERT_EMAIL) {
      try {
        const emailService = new SendGridService();
        await emailService.send({
          to: process.env.INTERNAL_ALERT_EMAIL,
          subject: `🚨 EMERGENCY: Service Request at ${notification.facilityName}`,
          html: `
            <h2>Emergency Service Request Alert</h2>
            <p><strong>Service Request ID:</strong> ${notification.serviceRequestId}</p>
            <p><strong>Facility:</strong> ${notification.facilityName}</p>
            <p><strong>Category:</strong> ${notification.category}</p>
            <p><strong>Priority:</strong> ${notification.priority}</p>
            <p><strong>Providers Notified:</strong> ${providers.length}</p>
            <p><strong>Description:</strong> ${notification.description}</p>
            <p><strong>Contact:</strong> ${notification.contactPerson} (${notification.contactPhone || notification.contactEmail})</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/service-requests/${notification.serviceRequestId}">View Request</a></p>
          `,
          categories: ['internal', 'emergency-alert']
        });
      } catch (emailError) {
        logger.error('api', 'Failed to send internal alert email', { error: emailError });
      }
    }

  } catch (error) {
    logger.error('api', 'Failed to send internal alert', {
      error,
      serviceRequestId: notification.serviceRequestId
    });
    // Don't throw - internal alerts shouldn't block the main flow
  }
}

/**
 * Format notification based on priority
 */
export function formatNotificationPriority(priority: string): {
  emoji: string;
  urgencyText: string;
  responseTime: string;
} {
  switch (priority) {
    case 'emergency':
      return {
        emoji: '🚨',
        urgencyText: 'IMMEDIATE RESPONSE REQUIRED',
        responseTime: 'within 1 hour'
      };
    case 'urgent':
      return {
        emoji: '⚠️',
        urgencyText: 'URGENT - Same Day Response',
        responseTime: 'within 4 hours'
      };
    default:
      return {
        emoji: '📋',
        urgencyText: 'Standard Request',
        responseTime: 'within 24-48 hours'
      };
  }
}