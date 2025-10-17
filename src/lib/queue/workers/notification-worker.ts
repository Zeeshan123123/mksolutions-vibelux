import { Job } from 'bull';
import { queues } from '../queue-manager';
import { logger } from '../../logging/production-logger';
import { db } from '../../prisma';
import { getWebSocketServer } from '../../websocket/scalable-websocket-server';
import { sendSMS } from '../../sms/twilio-client';
import { sendPushNotification } from '../../push/push-service';

// Send alert notifications
queues.notificationQueue.process('send-alert', async (job: Job) => {
  const { userId, type, severity, title, message, data } = job.data;
  
  try {
    logger.info('api', 'Processing alert notification', { userId, type, severity });
    
    // Get user notification preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        notificationSettings: true
      }
    });
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const settings = user.notificationSettings?.settings as any || {};
    
    // Create notification record
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
        priority: severity,
        category: 'alert'
      }
    });
    
    // Send via enabled channels
    const channels: string[] = [];
    
    // In-app notification (always send)
    if (settings.inApp?.enabled !== false) {
      const wsServer = getWebSocketServer();
      wsServer.sendToUser(user.clerkId, 'notification', {
        id: notification.id,
        type,
        title,
        message,
        severity,
        timestamp: new Date()
      });
      channels.push('in-app');
    }
    
    // Email notification
    if (settings.email?.enabled && shouldSendEmail(type, settings.email)) {
      await queues.emailQueue.add('send-email', {
        to: user.email,
        subject: `[${severity.toUpperCase()}] ${title}`,
        template: 'generic',
        data: {
          html: formatAlertEmail(title, message, severity, data),
          text: `${title}\n\n${message}`
        }
      });
      channels.push('email');
    }
    
    // SMS notification (for critical alerts or if enabled)
    if (settings.sms?.enabled && (severity === 'critical' || shouldSendSMS(type, settings.sms))) {
      if (user.phoneNumber) {
        await sendSMS({
          to: user.phoneNumber,
          body: `VibeLux Alert: ${title}\n${message.substring(0, 140)}...`
        });
        channels.push('sms');
      }
    }
    
    // Push notification
    if (settings.push?.enabled && shouldSendPush(type, settings.push)) {
      await sendPushNotification({
        userId: user.clerkId,
        title,
        body: message,
        data: { notificationId: notification.id, type, severity }
      });
      channels.push('push');
    }
    
    logger.info('api', 'Alert sent successfully', { 
      notificationId: notification.id,
      channels 
    });
    
    return {
      success: true,
      notificationId: notification.id,
      channelsSent: channels
    };
    
  } catch (error) {
    logger.error('api', 'Failed to send alert', error as Error);
    throw error;
  }
});

// Process marketplace notifications
queues.notificationQueue.process('marketplace-notification', async (job: Job) => {
  const { type, recipientId, data } = job.data;
  
  try {
    logger.info('api', 'Processing marketplace notification', { type, recipientId });
    
    // Get recipient
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
      include: { notificationSettings: true }
    });
    
    if (!recipient) {
      throw new Error(`Recipient ${recipientId} not found`);
    }
    
    const settings = recipient.notificationSettings?.settings as any || {};
    
    // Create notification record
    const notification = await db.notification.create({
      data: {
        userId: recipientId,
        type: `marketplace-${type}`,
        title: getMarketplaceTitle(type, data),
        message: getMarketplaceMessage(type, data),
        data,
        priority: 'medium',
        category: 'marketplace'
      }
    });
    
    // Send notifications based on preferences
    if (settings.inApp?.enabled && settings.inApp[type]) {
      const wsServer = getWebSocketServer();
      wsServer.sendToUser(recipient.clerkId, 'notification', {
        type: 'marketplace',
        data: notification
      });
    }
    
    if (settings.email?.enabled && settings.email[type]) {
      await queues.emailQueue.add('send-email', {
        to: recipient.email,
        subject: getMarketplaceTitle(type, data),
        template: type,
        data
      });
    }
    
    return {
      success: true,
      notificationId: notification.id
    };
    
  } catch (error) {
    logger.error('api', 'Failed to process marketplace notification', error as Error);
    throw error;
  }
});

// Batch notification processing
queues.notificationQueue.process('batch-notifications', async (job: Job) => {
  const { notifications } = job.data;
  
  try {
    logger.info('api', `Processing batch of ${notifications.length} notifications`);
    
    const results = [];
    
    for (const notif of notifications) {
      try {
        const result = await queues.notificationQueue.add(notif.type, notif.data);
        results.push({ success: true, jobId: result.id });
      } catch (error) {
        results.push({ success: false, error: (error as Error).message });
      }
    }
    
    return {
      total: notifications.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
    
  } catch (error) {
    logger.error('api', 'Batch notification processing failed', error as Error);
    throw error;
  }
});

// Helper functions
function shouldSendEmail(type: string, emailSettings: any): boolean {
  const typeMap: any = {
    'equipment-offer': emailSettings.equipmentOffers,
    'service-bid': emailSettings.serviceBids,
    'user-invite': emailSettings.userInvites,
    'system-health': true, // Always send system health alerts
    'sensor-alert': true,  // Always send sensor alerts
    'compliance': true     // Always send compliance alerts
  };
  
  return typeMap[type] !== false;
}

function shouldSendSMS(type: string, smsSettings: any): boolean {
  if (smsSettings.urgentOnly) {
    return ['system-health', 'sensor-alert', 'compliance'].includes(type);
  }
  
  const typeMap: any = {
    'equipment-offer': smsSettings.equipmentOffers,
    'service-bid': smsSettings.serviceBids,
    'user-invite': smsSettings.userInvites
  };
  
  return typeMap[type] === true;
}

function shouldSendPush(type: string, pushSettings: any): boolean {
  const typeMap: any = {
    'equipment-offer': pushSettings.equipmentOffers,
    'service-bid': pushSettings.serviceBids,
    'user-invite': pushSettings.userInvites,
    'marketplace-update': pushSettings.marketplaceUpdates,
    'system-health': true,
    'sensor-alert': true,
    'compliance': true
  };
  
  return typeMap[type] !== false;
}

function formatAlertEmail(title: string, message: string, severity: string, data: any): string {
  const severityColors: any = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${severityColors[severity] || '#8b5cf6'}; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">${title}</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            ${message}
          </p>
          
          ${data ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3 style="color: #1f2937;">Details:</h3>
              <pre style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 14px;">
${JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://vibelux.ai/alerts" style="background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View in Dashboard
          </a>
        </div>
      </div>
    </div>
  `;
}

function getMarketplaceTitle(type: string, data: any): string {
  switch (type) {
    case 'equipment-offer':
      return `New Equipment Offer: ${data.equipment.name}`;
    case 'service-bid':
      return `New Bid: $${data.bidAmount} for ${data.serviceName}`;
    case 'user-invite':
      return `You've been invited to join ${data.inviterCompany || 'a team'}`;
    default:
      return 'VibeLux Marketplace Update';
  }
}

function getMarketplaceMessage(type: string, data: any): string {
  switch (type) {
    case 'equipment-offer':
      return `${data.sellerName} has sent you an offer for ${data.equipment.name} at $${data.equipment.price}`;
    case 'service-bid':
      return `${data.bidderName} has submitted a bid of $${data.bidAmount} for your ${data.serviceName} request`;
    case 'user-invite':
      return `${data.inviterName} has invited you to join as ${data.role}`;
    default:
      return 'You have a new update in the VibeLux Marketplace';
  }
}

export default queues.notificationQueue;