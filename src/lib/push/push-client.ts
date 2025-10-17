'use client';

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

export interface VibeLuxAlert extends PushNotification {
  alertType: 'critical' | 'warning' | 'info';
  facilityId?: string;
  timestamp?: number;
}

class VibeLuxPushClient {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    }
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    try {
      // Wait for service worker to be ready
      this.registration = await navigator.serviceWorker.ready;
      console.log('VibeLux Push: Service worker ready for notifications');
      return true;
    } catch (error) {
      console.error('VibeLux Push: Failed to initialize', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('VibeLux Push: Permission status:', permission);
    return permission;
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return 'denied';
    }
    return Notification.permission;
  }

  async showNotification(notification: VibeLuxAlert): Promise<boolean> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error('VibeLux Push: Service worker not available');
      return false;
    }

    if (this.getPermissionStatus() !== 'granted') {
      console.warn('VibeLux Push: Permission not granted');
      return false;
    }

    try {
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/icon-192x192.png',
        data: {
          ...notification.data,
          alertType: notification.alertType,
          facilityId: notification.facilityId,
          timestamp: notification.timestamp || Date.now(),
          url: '/' // Default to home page
        },
        tag: notification.tag || `vibelux-${notification.alertType}`,
        requireInteraction: notification.requireInteraction || notification.alertType === 'critical',
        actions: notification.actions || this.getDefaultActions(notification.alertType),
        silent: false,
        vibrate: this.getVibrationPattern(notification.alertType)
      };

      await this.registration.showNotification(notification.title, options);
      console.log('VibeLux Push: Notification shown successfully');
      return true;

    } catch (error) {
      console.error('VibeLux Push: Failed to show notification', error);
      return false;
    }
  }

  private getDefaultActions(alertType: VibeLuxAlert['alertType']) {
    const baseActions = [
      { action: 'view', title: 'View Details', icon: '/icons/icon-192x192.png' },
      { action: 'dismiss', title: 'Dismiss', icon: '/icons/icon-192x192.png' }
    ];

    if (alertType === 'critical') {
      return [
        { action: 'acknowledge', title: 'Acknowledge', icon: '/icons/icon-192x192.png' },
        ...baseActions
      ];
    }

    return baseActions;
  }

  private getVibrationPattern(alertType: VibeLuxAlert['alertType']): number[] {
    switch (alertType) {
      case 'critical':
        return [200, 100, 200, 100, 200]; // Urgent pattern
      case 'warning':
        return [300, 100, 300]; // Moderate pattern
      case 'info':
        return [200]; // Single pulse
      default:
        return [200];
    }
  }

  // VibeLux-specific notification methods
  async sendGrowthAlert(facilityId: string, message: string, severity: 'warning' | 'critical' = 'warning') {
    return this.showNotification({
      title: `🌱 Growth Alert - ${facilityId}`,
      body: message,
      alertType: severity,
      facilityId,
      tag: `growth-${facilityId}`,
      data: { type: 'growth', facilityId }
    });
  }

  async sendEquipmentAlert(facilityId: string, equipmentName: string, issue: string) {
    return this.showNotification({
      title: `⚙️ Equipment Alert - ${facilityId}`,
      body: `${equipmentName}: ${issue}`,
      alertType: 'critical',
      facilityId,
      tag: `equipment-${facilityId}`,
      requireInteraction: true,
      data: { type: 'equipment', facilityId, equipmentName }
    });
  }

  async sendEnvironmentAlert(facilityId: string, parameter: string, value: number, threshold: number) {
    const isEmergency = Math.abs(value - threshold) > threshold * 0.2; // 20% deviation
    
    return this.showNotification({
      title: `🌡️ Environment Alert - ${facilityId}`,
      body: `${parameter}: ${value} (threshold: ${threshold})`,
      alertType: isEmergency ? 'critical' : 'warning',
      facilityId,
      tag: `environment-${facilityId}-${parameter}`,
      data: { type: 'environment', facilityId, parameter, value, threshold }
    });
  }

  async sendHarvestAlert(facilityId: string, cropName: string, daysToHarvest: number) {
    return this.showNotification({
      title: `🌾 Harvest Ready - ${facilityId}`,
      body: `${cropName} ready for harvest in ${daysToHarvest} days`,
      alertType: 'info',
      facilityId,
      tag: `harvest-${facilityId}`,
      data: { type: 'harvest', facilityId, cropName, daysToHarvest }
    });
  }

  async sendMaintenanceAlert(facilityId: string, task: string, dueDate: string) {
    return this.showNotification({
      title: `🔧 Maintenance Due - ${facilityId}`,
      body: `${task} scheduled for ${dueDate}`,
      alertType: 'info',
      facilityId,
      tag: `maintenance-${facilityId}`,
      data: { type: 'maintenance', facilityId, task, dueDate }
    });
  }

  async sendSystemAlert(message: string, severity: 'info' | 'warning' | 'critical' = 'info') {
    return this.showNotification({
      title: '🚀 VibeLux System',
      body: message,
      alertType: severity,
      tag: 'system-alert',
      data: { type: 'system' }
    });
  }

  // Batch notifications for multiple facilities
  async sendBulkAlerts(alerts: VibeLuxAlert[]): Promise<{ sent: number; failed: number }> {
    const results = await Promise.allSettled(
      alerts.map(alert => this.showNotification(alert))
    );

    const sent = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - sent;

    console.log(`VibeLux Push: Bulk notifications - ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // Get notification history (if supported)
  async getNotifications(): Promise<Notification[]> {
    if (!this.registration) {
      return [];
    }

    try {
      return await this.registration.getNotifications();
    } catch (error) {
      console.error('VibeLux Push: Failed to get notifications', error);
      return [];
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.forEach(notification => notification.close());
  }

  // Clear notifications by tag
  async clearNotificationsByTag(tag: string): Promise<void> {
    const notifications = await this.getNotifications();
    notifications
      .filter(notification => notification.tag === tag)
      .forEach(notification => notification.close());
  }

  getStatus() {
    return {
      supported: this.isSupported,
      permission: this.getPermissionStatus(),
      serviceWorkerReady: !!this.registration
    };
  }
}

export const pushClient = new VibeLuxPushClient();
export default pushClient;