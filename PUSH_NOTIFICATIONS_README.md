# Comprehensive Push Notification System for Predictive Maintenance Alerts

This document describes the comprehensive push notification system implemented for Vibelux's predictive maintenance alerts.

## Overview

The system provides real-time push notifications for critical maintenance events, predictive failure alerts, and equipment performance warnings. It includes user preferences management, notification history tracking, and comprehensive error handling.

## Components

### 1. Push Notification Service (`/src/lib/push-notification-service.ts`)

**Core Features:**
- Manages push notification subscriptions (desktop and mobile)
- Handles different notification types (failure imminent, maintenance due, etc.)
- User notification preferences and scheduling
- Quiet hours functionality
- Notification history tracking
- Device management and cleanup

**Key Methods:**
- `subscribe()` - Subscribe user to push notifications
- `sendCriticalMaintenanceAlert()` - Send high-priority maintenance alerts
- `updatePreferences()` - Update user notification preferences
- `sendBulkNotifications()` - Send notifications to multiple users
- `cleanupInactiveSubscriptions()` - Remove outdated subscriptions

**Notification Types:**
- `failure_imminent` - Critical equipment failure predicted
- `maintenance_due` - Scheduled maintenance is due
- `equipment_failure` - Equipment has failed
- `performance_warning` - Equipment performance degraded
- `maintenance_overdue` - Maintenance is past due
- `predictive_alert` - General predictive maintenance alert
- `system_health_critical` - System health issues
- `sensor_malfunction` - Sensor connectivity issues

### 2. API Endpoints

#### `/src/app/api/notifications/subscribe/route.ts`
- **POST**: Subscribe to push notifications
- **GET**: Get user's subscriptions and preferences
- **PUT**: Update notification preferences
- **DELETE**: Unsubscribe from push notifications

#### `/src/app/api/notifications/test/route.ts`
- **POST**: Send test notification
- **GET**: Get notification history

### 3. Notification Settings Component (`/src/components/maintenance/NotificationSettings.tsx`)

**Features:**
- Enable/disable push notifications
- Configure notification types (predictive failure, maintenance due, etc.)
- Set quiet hours
- Manage notification frequency (immediate, hourly, daily)
- Sound and vibration settings
- Device management
- Notification history viewer
- Test notification functionality

**User Interface:**
- Tabbed interface (Settings, Devices, History)
- Real-time permission status
- Device type detection (mobile/desktop)
- Error handling and user feedback

### 4. Enhanced Service Worker (`/public/sw.js`)

**Push Notification Features:**
- Enhanced push event handling with JSON payload parsing
- Smart notification actions (View, Acknowledge, Dismiss)
- Intelligent navigation based on notification context
- Background sync for maintenance alerts
- Push subscription change handling
- Notification dismissal tracking

**Background Sync:**
- Automatic maintenance alert checking when online
- Offline notification queuing
- Summary notifications for multiple alerts

### 5. Updated Maintenance Alerts API (`/src/app/app/api/maintenance/alerts/route.ts`)

**Enhanced Features:**
- Automatic push notification triggering
- Duplicate prevention (time-based filtering)
- Context-aware notification content
- Priority-based notification logic
- Equipment and facility information integration

**Notification Triggers:**
- Overdue maintenance (daily notifications)
- Upcoming maintenance (high priority or within 24 hours)
- Predictive alerts (health score < 60%)
- Performance guarantee violations

## Configuration

### Environment Variables

```env
# VAPID Keys for Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
```

### Database Schema Requirements

The system requires these additional database tables:

```sql
-- Push Subscriptions
CREATE TABLE push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_type TEXT NOT NULL,
  user_agent TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  user_id TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  maintenance_alerts BOOLEAN DEFAULT true,
  predictive_failure BOOLEAN DEFAULT true,
  maintenance_due BOOLEAN DEFAULT true,
  equipment_failure BOOLEAN DEFAULT true,
  performance_warning BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  frequency TEXT DEFAULT 'immediate',
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification History
CREATE TABLE notification_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### 1. Subscribe to Push Notifications

```typescript
// Client-side subscription
const subscription = await navigator.serviceWorker.ready
  .then(registration => registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey
  }));

// Send to server
await fetch('/api/notifications/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscription: {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
      }
    },
    deviceType: 'desktop',
    userAgent: navigator.userAgent
  })
});
```

### 2. Send Critical Maintenance Alert

```typescript
import { pushNotificationService } from '@/lib/push-notification-service';

await pushNotificationService.sendCriticalMaintenanceAlert({
  userId: 'user123',
  equipmentId: 'pump001',
  equipmentName: 'Main Water Pump',
  alertType: 'failure_imminent',
  message: 'Bearing temperature critical: 85°C',
  facilityName: 'Greenhouse A',
  actionUrl: '/equipment/pump001'
});
```

### 3. Update User Preferences

```typescript
await pushNotificationService.updatePreferences(userId, {
  predictiveFailure: true,
  maintenanceDue: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00'
  },
  frequency: 'immediate',
  soundEnabled: false
});
```

### 4. Bulk Notifications

```typescript
await pushNotificationService.sendBulkNotifications(
  ['user1', 'user2', 'user3'],
  {
    title: 'Facility-Wide Alert',
    body: 'Power outage detected in Greenhouse B',
    requireInteraction: true
  },
  'equipment_failure'
);
```

## Integration with Existing Systems

### Maintenance Scheduler Integration

```typescript
// In maintenance scheduler
import { pushNotificationService } from '@/lib/push-notification-service';

// When creating maintenance schedules
const sendMaintenanceReminders = async () => {
  const upcomingMaintenance = await getUpcomingMaintenance();
  
  for (const maintenance of upcomingMaintenance) {
    if (maintenance.dueInHours <= 24) {
      await pushNotificationService.sendCriticalMaintenanceAlert({
        userId: maintenance.assignedTo,
        equipmentId: maintenance.equipmentId,
        equipmentName: maintenance.equipmentName,
        alertType: 'maintenance_due',
        message: `Maintenance due in ${maintenance.dueInHours} hours`,
        actionUrl: `/maintenance/schedules/${maintenance.id}`
      });
    }
  }
};
```

### Equipment Monitoring Integration

```typescript
// In equipment monitoring system
const monitorEquipmentHealth = async (equipmentId: string, healthScore: number) => {
  if (healthScore < 60) {
    const equipment = await getEquipmentById(equipmentId);
    const facilityUsers = await getFacilityUsers(equipment.facilityId);
    
    await pushNotificationService.sendBulkNotifications(
      facilityUsers.map(u => u.id),
      {
        title: 'Equipment Health Critical',
        body: `${equipment.name} health score: ${healthScore}%`,
        requireInteraction: true
      },
      'failure_imminent'
    );
  }
};
```

## Security Considerations

1. **VAPID Keys**: Store VAPID keys securely as environment variables
2. **User Authentication**: All API endpoints require authentication
3. **Subscription Validation**: Validate push subscriptions before storing
4. **Rate Limiting**: Implement rate limiting on notification endpoints
5. **Data Sanitization**: Sanitize all notification content
6. **Permission Verification**: Verify user permissions before sending notifications

## Performance Optimization

1. **Batch Processing**: Group notifications for efficiency
2. **Duplicate Prevention**: Time-based filtering prevents spam
3. **Background Sync**: Use service worker background sync
4. **Cleanup Tasks**: Regular cleanup of inactive subscriptions
5. **Selective Sending**: Only send to users with relevant permissions

## Testing

### Test Notification
```typescript
await pushNotificationService.sendTestNotification(userId);
```

### Notification History
```typescript
const history = await pushNotificationService.getNotificationHistory(userId, 50);
```

## Troubleshooting

### Common Issues

1. **Notifications Not Received**
   - Check browser notification permissions
   - Verify VAPID keys are correct
   - Ensure service worker is registered
   - Check user preferences settings

2. **Service Worker Issues**
   - Clear browser cache
   - Re-register service worker
   - Check browser console for errors

3. **Subscription Failures**
   - Verify HTTPS is enabled
   - Check VAPID key format
   - Ensure browser supports push notifications

### Debugging

```typescript
// Enable debug logging
console.log('Push subscription:', subscription);
console.log('User preferences:', preferences);
console.log('Notification payload:', payload);
```

## Future Enhancements

1. **Rich Notifications**: Add images and custom actions
2. **Notification Scheduling**: Schedule notifications for specific times
3. **Smart Grouping**: Group related notifications
4. **Analytics Dashboard**: Track notification engagement
5. **A/B Testing**: Test different notification formats
6. **Multi-language Support**: Localized notification content

## File Locations

- Push Notification Service: `/src/lib/push-notification-service.ts`
- API Routes: `/src/app/api/notifications/`
- Settings Component: `/src/components/maintenance/NotificationSettings.tsx`
- Service Worker: `/public/sw.js`
- Updated Alerts API: `/src/app/app/api/maintenance/alerts/route.ts`
- Updated Notifications: `/src/lib/notifications.ts`

This comprehensive system provides a robust foundation for predictive maintenance notifications with extensive customization options and professional-grade error handling.