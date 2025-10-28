import { initNotificationService } from './alert-notifications';
import { notificationConfig } from '@/lib/notifications/config/config';

export function initializeNotifications() {
  try {
    initNotificationService(notificationConfig);
    console.log('✅ Notification service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize notification service:', error);
  }
}