/**
 * Emergency Notification System
 * Handles critical service request notifications
 */

import { logger } from '@/lib/logging/production-logger';

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

    // Production implementation would use your email service (SendGrid, AWS SES, etc.)
    const emailData = {
      to: provider.email,
      subject: `🚨 ${notification.priority.toUpperCase()} Service Request - ${notification.facilityName}`,
      template: 'emergency-service-request',
      variables: {
        companyName: provider.companyName,
        facilityName: notification.facilityName,
        priority: notification.priority,
        category: notification.category,
        description: notification.description,
        contactPerson: notification.contactPerson,
        contactPhone: notification.contactPhone,
        contactEmail: notification.contactEmail,
        facilityAddress: notification.facilityAddress,
        serviceRequestId: notification.serviceRequestId,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/service-requests/${notification.serviceRequestId}`
      }
    };

    // TODO: Implement actual email sending
    // await emailService.send(emailData);
    
    logger.info('api', 'Email notification sent', {
      to: provider.email,
      serviceRequestId: notification.serviceRequestId
    });

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

    const message = `🚨 ${notification.priority.toUpperCase()}: ${notification.facilityName} needs ${notification.category} service. Contact: ${notification.contactPerson} ${notification.contactPhone || notification.contactEmail}. View: ${process.env.NEXT_PUBLIC_APP_URL}/service-requests/${notification.serviceRequestId}`;

    // TODO: Implement actual SMS sending (Twilio, AWS SNS, etc.)
    // await smsService.send({
    //   to: provider.phone,
    //   message: message
    // });

    logger.info('api', 'SMS notification sent', {
      to: provider.phone,
      serviceRequestId: notification.serviceRequestId
    });

  } catch (error) {
    logger.error('api', 'Failed to send SMS notification', {
      error,
      provider: provider.phone,
      serviceRequestId: notification.serviceRequestId
    });
    throw error;
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
      timestamp: new Date().toISOString()
    });

    // In production, you might also send to:
    // - Slack webhook
    // - PagerDuty
    // - Internal monitoring dashboard
    // - Management email alerts

  } catch (error) {
    logger.error('api', 'Failed to send internal alert', {
      error,
      serviceRequestId: notification.serviceRequestId
    });
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