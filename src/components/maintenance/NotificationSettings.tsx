'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Settings, 
  TestTube, 
  History, 
  Smartphone, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Vibrate,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';

interface NotificationPreferences {
  enabled: boolean;
  maintenanceAlerts: boolean;
  predictiveFailure: boolean;
  maintenanceDue: boolean;
  equipmentFailure: boolean;
  performanceWarning: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface PushSubscription {
  id: string;
  endpoint: string;
  deviceType: 'desktop' | 'mobile';
  userAgent: string;
  createdAt: string;
  active: boolean;
}

interface NotificationHistory {
  id: string;
  type: string;
  title: string;
  message: string;
  sentAt: string;
  data?: any;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
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
  });

  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkPushSupport();
    fetchNotificationData();
  }, []);

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(supported);
    
    if (supported) {
      setPermissionStatus(Notification.permission);
    }
  };

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions and preferences
      const response = await fetch('/api/notifications/subscribe');
      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.data.subscriptions);
        setPreferences(data.data.preferences);
      }
      
      // Fetch notification history
      const historyResponse = await fetch('/api/notifications/test');
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        setHistory(historyData.data);
      }
      
    } catch (error) {
      logger.error('system', 'Error fetching notification data:', error );
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        toast.success('Notification permission granted');
        await subscribeToPushNotifications();
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      logger.error('system', 'Error requesting notification permission:', error );
      toast.error('Failed to request notification permission');
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      
      const vapidResponse = await fetch('/api/notifications/subscribe');
      const vapidData = await vapidResponse.json();
      
      if (!vapidData.success) {
        throw new Error('Failed to get VAPID public key');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidData.data.vapidPublicKey,
      });

      const subscriptionData = {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!))),
          },
        },
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        userAgent: navigator.userAgent,
      };

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Successfully subscribed to push notifications');
        await fetchNotificationData();
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      logger.error('system', 'Error subscribing to push notifications:', error );
      toast.error('Failed to subscribe to push notifications');
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/notifications/subscribe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });

      const result = await response.json();
      
      if (result.success) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
        toast.success('Notification preferences updated');
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      logger.error('system', 'Error updating preferences:', error );
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setTesting(true);
      
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test notification sent');
        setTimeout(() => fetchNotificationData(), 2000);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      logger.error('system', 'Error sending test notification:', error );
      toast.error('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const unsubscribeFromPushNotifications = async (endpoint?: string) => {
    try {
      const url = endpoint 
        ? `/api/notifications/subscribe?endpoint=${encodeURIComponent(endpoint)}`
        : '/api/notifications/subscribe';
        
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Unsubscribed from push notifications');
        await fetchNotificationData();
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      logger.error('system', 'Error unsubscribing:', error );
      toast.error('Failed to unsubscribe from push notifications');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'failure_imminent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance_due':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'equipment_failure':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'performance_warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-muted-foreground">
            Configure your push notification preferences for maintenance alerts
          </p>
        </div>
        <Button onClick={sendTestNotification} disabled={testing || !preferences.enabled}>
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TestTube className="h-4 w-4 mr-2" />
          )}
          Test Notification
        </Button>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {/* Permission Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Enable push notifications to receive maintenance alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pushSupported && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Push notifications are not supported in this browser
                  </AlertDescription>
                </Alert>
              )}

              {pushSupported && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {permissionStatus === 'granted' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Permission Status: {permissionStatus}
                    </span>
                  </div>
                  {permissionStatus !== 'granted' && (
                    <Button onClick={requestNotificationPermission}>
                      Enable Notifications
                    </Button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications for maintenance alerts
                  </p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={preferences.enabled}
                  onCheckedChange={(checked) => updatePreferences({ enabled: checked })}
                  disabled={saving || permissionStatus !== 'granted'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                Choose which types of maintenance alerts you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Predictive Failure Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Critical alerts when equipment failure is predicted
                  </p>
                </div>
                <Switch
                  checked={preferences.predictiveFailure}
                  onCheckedChange={(checked) => updatePreferences({ predictiveFailure: checked })}
                  disabled={saving || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Due</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts when scheduled maintenance is due
                  </p>
                </div>
                <Switch
                  checked={preferences.maintenanceDue}
                  onCheckedChange={(checked) => updatePreferences({ maintenanceDue: checked })}
                  disabled={saving || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Equipment Failure</Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate alerts when equipment fails
                  </p>
                </div>
                <Switch
                  checked={preferences.equipmentFailure}
                  onCheckedChange={(checked) => updatePreferences({ equipmentFailure: checked })}
                  disabled={saving || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Performance Warnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts when equipment performance degrades
                  </p>
                </div>
                <Switch
                  checked={preferences.performanceWarning}
                  onCheckedChange={(checked) => updatePreferences({ performanceWarning: checked })}
                  disabled={saving || !preferences.enabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Notification Frequency</Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={(value) => updatePreferences({ frequency: value as any })}
                    disabled={saving || !preferences.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Summary</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {preferences.soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  <Label>Sound</Label>
                </div>
                <Switch
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => updatePreferences({ soundEnabled: checked })}
                  disabled={saving || !preferences.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vibrate className="h-4 w-4" />
                  <Label>Vibration</Label>
                </div>
                <Switch
                  checked={preferences.vibrationEnabled}
                  onCheckedChange={(checked) => updatePreferences({ vibrationEnabled: checked })}
                  disabled={saving || !preferences.enabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Set hours when you don't want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Quiet Hours</Label>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => 
                    updatePreferences({ 
                      quietHours: { ...preferences.quietHours, enabled: checked } 
                    })
                  }
                  disabled={saving || !preferences.enabled}
                />
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => 
                        updatePreferences({ 
                          quietHours: { ...preferences.quietHours, start: e.target.value } 
                        })
                      }
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => 
                        updatePreferences({ 
                          quietHours: { ...preferences.quietHours, end: e.target.value } 
                        })
                      }
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                Manage devices that receive push notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No devices connected for push notifications
                  </p>
                ) : (
                  subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {subscription.deviceType === 'mobile' ? (
                          <Smartphone className="h-5 w-5" />
                        ) : (
                          <Monitor className="h-5 w-5" />
                        )}
                        <div>
                          <p className="font-medium">
                            {subscription.deviceType === 'mobile' ? 'Mobile Device' : 'Desktop'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Connected {formatDate(subscription.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={subscription.active ? 'default' : 'secondary'}>
                          {subscription.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unsubscribeFromPushNotifications(subscription.endpoint)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription>
                Recent push notifications sent to your devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No notification history
                    </p>
                  ) : (
                    history.map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        {getNotificationTypeIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(notification.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}