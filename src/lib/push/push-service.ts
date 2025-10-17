/**
 * Push Notification Service for VibeLux
 * Handles web push notifications and mobile push
 */

import webpush from 'web-push';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  deviceType?: 'web' | 'ios' | 'android';
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  endpoint: string;
}

export class PushService {
  constructor() {
    this.initializeWebPush();
  }

  private initializeWebPush() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:support@vibelux.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    } else {
      console.warn('VAPID keys not configured. Push notifications will not work.');
    }
  }

  async sendNotification(
    subscription: PushSubscription,
    notification: PushNotification
  ): Promise<PushResult> {
    try {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/vibelux-logo-192.png',
        badge: notification.badge || '/vibelux-badge.png',
        image: notification.image,
        tag: notification.tag,
        data: notification.data || {},
        requireInteraction: notification.requireInteraction || false,
        actions: notification.actions || [],
        silent: notification.silent || false,
        timestamp: notification.timestamp || Date.now(),
      });

      const options = {
        TTL: 60 * 60 * 24, // 24 hours
        vapidDetails: undefined, // Already set globally
      };

      const result = await webpush.sendNotification(subscription, payload, options);

      return {
        success: true,
        statusCode: result.statusCode,
        endpoint: subscription.endpoint,
      };
    } catch (error: any) {
      console.error('Push notification error:', error);
      
      // Handle specific errors
      if (error.statusCode === 410) {
        // Subscription expired or invalid
        return {
          success: false,
          statusCode: 410,
          error: 'Subscription expired',
          endpoint: subscription.endpoint,
        };
      }

      return {
        success: false,
        statusCode: error.statusCode,
        error: error.message,
        endpoint: subscription.endpoint,
      };
    }
  }

  async sendBulkNotifications(
    subscriptions: PushSubscription[],
    notification: PushNotification
  ): Promise<PushResult[]> {
    // Send notifications in parallel with batching
    const batchSize = 500; // Web push recommended batch size
    const results: PushResult[] = [];

    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      const batchPromises = batch.map(sub => this.sendNotification(sub, notification));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            error: result.reason.message,
            endpoint: batch[index].endpoint,
          };
        }
      }));
    }

    return results;
  }

  async sendTopicNotification(
    topic: string,
    notification: PushNotification,
    getSubscriptions: (topic: string) => Promise<PushSubscription[]>
  ): Promise<{ sent: number; failed: number; results: PushResult[] }> {
    const subscriptions = await getSubscriptions(topic);
    const results = await this.sendBulkNotifications(subscriptions, notification);
    
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return { sent, failed, results };
  }

  generateVAPIDKeys(): { publicKey: string; privateKey: string } {
    const vapidKeys = webpush.generateVAPIDKeys();
    return {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
    };
  }

  // Notification templates for common alerts
  createAlertNotification(
    type: string,
    data: Record<string, any>
  ): PushNotification {
    const templates: Record<string, (data: any) => PushNotification> = {
      temperature: (data) => ({
        title: '🌡️ Temperature Alert',
        body: `${data.location}: ${data.value}°C (${data.threshold} threshold)`,
        tag: 'temperature-alert',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'acknowledge', title: 'Acknowledge' },
        ],
        data: { type: 'temperature', ...data },
      }),
      
      humidity: (data) => ({
        title: '💧 Humidity Alert',
        body: `${data.location}: ${data.value}% (${data.threshold} threshold)`,
        tag: 'humidity-alert',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'acknowledge', title: 'Acknowledge' },
        ],
        data: { type: 'humidity', ...data },
      }),
      
      equipment: (data) => ({
        title: '⚠️ Equipment Alert',
        body: `${data.equipment}: ${data.status}`,
        tag: 'equipment-alert',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Equipment' },
          { action: 'maintenance', title: 'Schedule Maintenance' },
        ],
        data: { type: 'equipment', ...data },
      }),
      
      harvest: (data) => ({
        title: '🌿 Harvest Ready',
        body: `${data.crop} in ${data.location} is ready for harvest`,
        tag: 'harvest-alert',
        image: data.imageUrl,
        actions: [
          { action: 'schedule', title: 'Schedule Harvest' },
          { action: 'details', title: 'View Details' },
        ],
        data: { type: 'harvest', ...data },
      }),
      
      pest: (data) => ({
        title: '🐛 Pest Detection',
        body: `${data.pestType} detected in ${data.location}`,
        tag: 'pest-alert',
        image: data.imageUrl,
        requireInteraction: true,
        actions: [
          { action: 'treatment', title: 'View Treatment' },
          { action: 'ignore', title: 'Ignore' },
        ],
        data: { type: 'pest', ...data },
      }),
    };

    const template = templates[type];
    if (!template) {
      return {
        title: 'VibeLux Alert',
        body: data.message || 'New notification',
        data,
      };
    }

    return template(data);
  }

  // Service worker message for background sync
  createSyncMessage(action: string, data: any): string {
    return JSON.stringify({
      type: 'background-sync',
      action,
      data,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const pushService = new PushService();