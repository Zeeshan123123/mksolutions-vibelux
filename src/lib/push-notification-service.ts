import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceType: 'desktop' | 'mobile';
  userAgent: string;
  createdAt: Date;
  active: boolean;
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  maintenanceAlerts: boolean;
  predictiveFailure: boolean;
  maintenanceDue: boolean;
  equipmentFailure: boolean;
  performanceWarning: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  frequency: 'immediate' | 'hourly' | 'daily';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export type MaintenanceNotificationType = 
  | 'failure_imminent'
  | 'maintenance_due'
  | 'equipment_failure'
  | 'performance_warning'
  | 'maintenance_overdue'
  | 'predictive_alert'
  | 'system_health_critical'
  | 'sensor_malfunction';

export class PushNotificationService {
  private vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
  };

  /**
   * Subscribe a user to push notifications
   */
  async subscribe(params: {
    userId: string;
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    };
    deviceType: 'desktop' | 'mobile';
    userAgent: string;
  }): Promise<PushSubscription> {
    try {
      // Remove existing subscription for this user and endpoint
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: params.userId,
          endpoint: params.subscription.endpoint,
        },
      });

      // Create new subscription
      const subscription = await prisma.pushSubscription.create({
        data: {
          userId: params.userId,
          endpoint: params.subscription.endpoint,
          p256dh: params.subscription.keys.p256dh,
          auth: params.subscription.keys.auth,
          deviceType: params.deviceType,
          userAgent: params.userAgent,
          active: true,
        },
      });

      return {
        id: subscription.id,
        userId: subscription.userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
        deviceType: subscription.deviceType as 'desktop' | 'mobile',
        userAgent: subscription.userAgent,
        createdAt: subscription.createdAt,
        active: subscription.active,
      };
    } catch (error) {
      logger.error('api', 'Error subscribing to push notifications:', error );
      throw new Error('Failed to subscribe to push notifications');
    }
  }

  /**
   * Unsubscribe a user from push notifications
   */
  async unsubscribe(userId: string, endpoint?: string): Promise<void> {
    try {
      const where: any = { userId };
      if (endpoint) {
        where.endpoint = endpoint;
      }

      await prisma.pushSubscription.updateMany({
        where,
        data: { active: false },
      });
    } catch (error) {
      logger.error('api', 'Error unsubscribing from push notifications:', error );
      throw new Error('Failed to unsubscribe from push notifications');
    }
  }

  /**
   * Get user's push subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId,
          active: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        deviceType: sub.deviceType as 'desktop' | 'mobile',
        userAgent: sub.userAgent,
        createdAt: sub.createdAt,
        active: sub.active,
      }));
    } catch (error) {
      logger.error('api', 'Error fetching user subscriptions:', error );
      return [];
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await prisma.notificationPreferences.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          enabled: preferences.enabled ?? true,
          maintenanceAlerts: preferences.maintenanceAlerts ?? true,
          predictiveFailure: preferences.predictiveFailure ?? true,
          maintenanceDue: preferences.maintenanceDue ?? true,
          equipmentFailure: preferences.equipmentFailure ?? true,
          performanceWarning: preferences.performanceWarning ?? true,
          quietHoursEnabled: preferences.quietHours?.enabled ?? false,
          quietHoursStart: preferences.quietHours?.start ?? '22:00',
          quietHoursEnd: preferences.quietHours?.end ?? '07:00',
          frequency: preferences.frequency ?? 'immediate',
          soundEnabled: preferences.soundEnabled ?? true,
          vibrationEnabled: preferences.vibrationEnabled ?? true,
        },
      });
    } catch (error) {
      logger.error('api', 'Error updating notification preferences:', error );
      throw new Error('Failed to update notification preferences');
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Return default preferences
        return {
          userId,
          enabled: true,
          maintenanceAlerts: true,
          predictiveFailure: true,
          maintenanceDue: true,
          equipmentFailure: true,
          performanceWarning: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00',
          },
          frequency: 'immediate',
          soundEnabled: true,
          vibrationEnabled: true,
        };
      }

      return {
        userId: preferences.userId,
        enabled: preferences.enabled,
        maintenanceAlerts: preferences.maintenanceAlerts,
        predictiveFailure: preferences.predictiveFailure,
        maintenanceDue: preferences.maintenanceDue,
        equipmentFailure: preferences.equipmentFailure,
        performanceWarning: preferences.performanceWarning,
        quietHours: {
          enabled: preferences.quietHoursEnabled,
          start: preferences.quietHoursStart,
          end: preferences.quietHoursEnd,
        },
        frequency: preferences.frequency as 'immediate' | 'hourly' | 'daily',
        soundEnabled: preferences.soundEnabled,
        vibrationEnabled: preferences.vibrationEnabled,
      };
    } catch (error) {
      logger.error('api', 'Error fetching notification preferences:', error );
      throw new Error('Failed to fetch notification preferences');
    }
  }

  /**
   * Send push notification to user
   */
  async sendPushNotification(
    userId: string,
    payload: PushNotificationPayload,
    type: MaintenanceNotificationType
  ): Promise<void> {
    try {
      // Check user preferences
      const preferences = await this.getPreferences(userId);
      
      if (!preferences.enabled) {
        return;
      }

      // Check if this notification type is enabled
      if (!this.isNotificationTypeEnabled(type, preferences)) {
        return;
      }

      // Check quiet hours
      if (this.isQuietHours(preferences.quietHours)) {
        return;
      }

      // Get user's active subscriptions
      const subscriptions = await this.getUserSubscriptions(userId);
      
      if (subscriptions.length === 0) {
        return;
      }

      // Create notification in database
      await createNotification({
        userId,
        type: this.mapToNotificationType(type),
        title: payload.title,
        message: payload.body,
        data: payload.data,
      });

      // Send push notification to all user's devices
      const pushPromises = subscriptions.map(subscription => 
        this.sendToSubscription(subscription, payload, preferences)
      );

      await Promise.allSettled(pushPromises);

      // Log notification history
      await this.logNotificationHistory(userId, type, payload);

    } catch (error) {
      logger.error('api', 'Error sending push notification:', error );
      throw new Error('Failed to send push notification');
    }
  }

  /**
   * Send critical maintenance alert
   */
  async sendCriticalMaintenanceAlert(params: {
    userId: string;
    equipmentId: string;
    equipmentName: string;
    alertType: MaintenanceNotificationType;
    message: string;
    facilityName?: string;
    actionUrl?: string;
  }): Promise<void> {
    const payload: PushNotificationPayload = {
      title: `Critical Maintenance Alert`,
      body: `${params.equipmentName}: ${params.message}`,
      icon: '/icons/maintenance-alert.png',
      badge: '/icons/badge.png',
      tag: `maintenance-${params.equipmentId}`,
      requireInteraction: true,
      data: {
        equipmentId: params.equipmentId,
        equipmentName: params.equipmentName,
        alertType: params.alertType,
        facilityName: params.facilityName,
        actionUrl: params.actionUrl,
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'acknowledge',
          title: 'Acknowledge',
          icon: '/icons/check.png',
        },
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view.png',
        },
      ],
    };

    await this.sendPushNotification(params.userId, payload, params.alertType);
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    payload: PushNotificationPayload,
    type: MaintenanceNotificationType
  ): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendPushNotification(userId, payload, type)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Test notification - sends a test push notification
   */
  async sendTestNotification(userId: string): Promise<void> {
    const payload: PushNotificationPayload = {
      title: 'Test Notification',
      body: 'This is a test notification from Vibelux maintenance system.',
      icon: '/icons/test-notification.png',
      data: {
        test: true,
        timestamp: Date.now(),
      },
    };

    await this.sendPushNotification(userId, payload, 'system_health_critical');
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const history = await prisma.notificationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return history;
    } catch (error) {
      logger.error('api', 'Error fetching notification history:', error );
      return [];
    }
  }

  /**
   * Clean up inactive subscriptions
   */
  async cleanupInactiveSubscriptions(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await prisma.pushSubscription.deleteMany({
        where: {
          OR: [
            { active: false },
            { updatedAt: { lt: thirtyDaysAgo } },
          ],
        },
      });
    } catch (error) {
      logger.error('api', 'Error cleaning up inactive subscriptions:', error );
    }
  }

  // Private helper methods

  private async sendToSubscription(
    subscription: PushSubscription,
    payload: PushNotificationPayload,
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      const webpush = await import('web-push');
      
      // Set VAPID details
      webpush.setVapidDetails(
        'mailto:support@vibelux.com',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );

      // Customize payload based on preferences
      const customizedPayload = {
        ...payload,
        silent: !preferences.soundEnabled,
        vibrate: preferences.vibrationEnabled ? [200, 100, 200] : undefined,
      };

      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(customizedPayload),
        {
          vapidDetails: {
            subject: 'mailto:support@vibelux.com',
            publicKey: this.vapidKeys.publicKey,
            privateKey: this.vapidKeys.privateKey,
          },
        }
      );

    } catch (error) {
      logger.error('api', 'Error sending to subscription:', error );
      
      // Mark subscription as inactive if it failed
      if (error.statusCode === 410) {
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { active: false },
        });
      }
    }
  }

  private isNotificationTypeEnabled(
    type: MaintenanceNotificationType,
    preferences: NotificationPreferences
  ): boolean {
    switch (type) {
      case 'failure_imminent':
      case 'predictive_alert':
        return preferences.predictiveFailure;
      case 'maintenance_due':
      case 'maintenance_overdue':
        return preferences.maintenanceDue;
      case 'equipment_failure':
        return preferences.equipmentFailure;
      case 'performance_warning':
        return preferences.performanceWarning;
      default:
        return preferences.maintenanceAlerts;
    }
  }

  private isQuietHours(quietHours: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private mapToNotificationType(type: MaintenanceNotificationType): string {
    switch (type) {
      case 'failure_imminent':
        return 'facility_alert';
      case 'maintenance_due':
        return 'facility_alert';
      case 'equipment_failure':
        return 'facility_alert';
      case 'performance_warning':
        return 'warning';
      default:
        return 'facility_alert';
    }
  }

  private async logNotificationHistory(
    userId: string,
    type: MaintenanceNotificationType,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      await prisma.notificationHistory.create({
        data: {
          userId,
          type,
          title: payload.title,
          message: payload.body,
          data: payload.data,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('api', 'Error logging notification history:', error );
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Notification templates for maintenance alerts
export const MaintenanceNotificationTemplates = {
  failureImminent: (equipmentName: string, prediction: string) => ({
    type: 'failure_imminent' as MaintenanceNotificationType,
    title: '🚨 Critical Equipment Alert',
    body: `${equipmentName} failure predicted: ${prediction}`,
    requireInteraction: true,
  }),

  maintenanceDue: (equipmentName: string, dueDate: string) => ({
    type: 'maintenance_due' as MaintenanceNotificationType,
    title: '⚠️ Maintenance Due',
    body: `${equipmentName} maintenance is due on ${dueDate}`,
  }),

  maintenanceOverdue: (equipmentName: string, daysPastDue: number) => ({
    type: 'maintenance_overdue' as MaintenanceNotificationType,
    title: '🔴 Maintenance Overdue',
    body: `${equipmentName} maintenance is ${daysPastDue} days overdue`,
    requireInteraction: true,
  }),

  equipmentFailure: (equipmentName: string, errorCode?: string) => ({
    type: 'equipment_failure' as MaintenanceNotificationType,
    title: '❌ Equipment Failure',
    body: `${equipmentName} has failed${errorCode ? ` (${errorCode})` : ''}`,
    requireInteraction: true,
  }),

  performanceWarning: (equipmentName: string, metric: string, value: number) => ({
    type: 'performance_warning' as MaintenanceNotificationType,
    title: '⚡ Performance Warning',
    body: `${equipmentName} ${metric} is ${value}% below expected`,
  }),

  sensorMalfunction: (sensorName: string, location: string) => ({
    type: 'sensor_malfunction' as MaintenanceNotificationType,
    title: '📡 Sensor Malfunction',
    body: `${sensorName} at ${location} is not responding`,
  }),
};