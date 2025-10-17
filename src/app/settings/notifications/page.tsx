'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Smartphone, Globe, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationSettings {
  email: {
    enabled: boolean;
    equipmentOffers: boolean;
    serviceBids: boolean;
    userInvites: boolean;
    marketplaceUpdates: boolean;
    weeklyDigest: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    equipmentOffers: boolean;
    serviceBids: boolean;
    userInvites: boolean;
  };
  push: {
    enabled: boolean;
    equipmentOffers: boolean;
    serviceBids: boolean;
    userInvites: boolean;
    marketplaceUpdates: boolean;
  };
  inApp: {
    enabled: boolean;
    equipmentOffers: boolean;
    serviceBids: boolean;
    userInvites: boolean;
    marketplaceUpdates: boolean;
  };
}

export default function NotificationSettingsPage() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      equipmentOffers: true,
      serviceBids: true,
      userInvites: true,
      marketplaceUpdates: false,
      weeklyDigest: true
    },
    sms: {
      enabled: false,
      urgentOnly: true,
      equipmentOffers: false,
      serviceBids: false,
      userInvites: true
    },
    push: {
      enabled: true,
      equipmentOffers: true,
      serviceBids: true,
      userInvites: true,
      marketplaceUpdates: true
    },
    inApp: {
      enabled: true,
      equipmentOffers: true,
      serviceBids: true,
      userInvites: true,
      marketplaceUpdates: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/settings/notifications');
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        toast({
          title: 'Settings saved',
          description: 'Your notification preferences have been updated.'
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (channel: keyof NotificationSettings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: value
      }
    }));
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSetting('push', 'enabled', true);
        toast({
          title: 'Push notifications enabled',
          description: 'You will now receive push notifications.'
        });
      } else {
        updateSetting('push', 'enabled', false);
        toast({
          title: 'Push notifications blocked',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Choose how you want to receive notifications from VibeLux
          </p>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Receive updates and alerts via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled" className="font-semibold">
                Enable email notifications
              </Label>
              <Switch
                id="email-enabled"
                checked={settings.email.enabled}
                onCheckedChange={(checked) => updateSetting('email', 'enabled', checked)}
              />
            </div>
            
            {settings.email.enabled && (
              <>
                <Separator />
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-equipment">Equipment offers</Label>
                    <Switch
                      id="email-equipment"
                      checked={settings.email.equipmentOffers}
                      onCheckedChange={(checked) => updateSetting('email', 'equipmentOffers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-service">Service bids</Label>
                    <Switch
                      id="email-service"
                      checked={settings.email.serviceBids}
                      onCheckedChange={(checked) => updateSetting('email', 'serviceBids', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-invites">User invites</Label>
                    <Switch
                      id="email-invites"
                      checked={settings.email.userInvites}
                      onCheckedChange={(checked) => updateSetting('email', 'userInvites', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-marketplace">Marketplace updates</Label>
                    <Switch
                      id="email-marketplace"
                      checked={settings.email.marketplaceUpdates}
                      onCheckedChange={(checked) => updateSetting('email', 'marketplaceUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-digest">Weekly digest</Label>
                    <Switch
                      id="email-digest"
                      checked={settings.email.weeklyDigest}
                      onCheckedChange={(checked) => updateSetting('email', 'weeklyDigest', checked)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              Get text messages for urgent updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-enabled" className="font-semibold">
                Enable SMS notifications
              </Label>
              <Switch
                id="sms-enabled"
                checked={settings.sms.enabled}
                onCheckedChange={(checked) => updateSetting('sms', 'enabled', checked)}
              />
            </div>
            
            {settings.sms.enabled && (
              <>
                <Separator />
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-urgent">Urgent notifications only</Label>
                    <Switch
                      id="sms-urgent"
                      checked={settings.sms.urgentOnly}
                      onCheckedChange={(checked) => updateSetting('sms', 'urgentOnly', checked)}
                    />
                  </div>
                  {!settings.sms.urgentOnly && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-equipment">Equipment offers</Label>
                        <Switch
                          id="sms-equipment"
                          checked={settings.sms.equipmentOffers}
                          onCheckedChange={(checked) => updateSetting('sms', 'equipmentOffers', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-service">Service bids</Label>
                        <Switch
                          id="sms-service"
                          checked={settings.sms.serviceBids}
                          onCheckedChange={(checked) => updateSetting('sms', 'serviceBids', checked)}
                        />
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-invites">User invites</Label>
                    <Switch
                      id="sms-invites"
                      checked={settings.sms.userInvites}
                      onCheckedChange={(checked) => updateSetting('sms', 'userInvites', checked)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Browser and mobile app notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-enabled" className="font-semibold">
                Enable push notifications
              </Label>
              <Switch
                id="push-enabled"
                checked={settings.push.enabled}
                onCheckedChange={(checked) => {
                  if (checked && 'Notification' in window && Notification.permission === 'default') {
                    requestPushPermission();
                  } else {
                    updateSetting('push', 'enabled', checked);
                  }
                }}
              />
            </div>
            
            {settings.push.enabled && (
              <>
                <Separator />
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-equipment">Equipment offers</Label>
                    <Switch
                      id="push-equipment"
                      checked={settings.push.equipmentOffers}
                      onCheckedChange={(checked) => updateSetting('push', 'equipmentOffers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-service">Service bids</Label>
                    <Switch
                      id="push-service"
                      checked={settings.push.serviceBids}
                      onCheckedChange={(checked) => updateSetting('push', 'serviceBids', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-invites">User invites</Label>
                    <Switch
                      id="push-invites"
                      checked={settings.push.userInvites}
                      onCheckedChange={(checked) => updateSetting('push', 'userInvites', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-marketplace">Marketplace updates</Label>
                    <Switch
                      id="push-marketplace"
                      checked={settings.push.marketplaceUpdates}
                      onCheckedChange={(checked) => updateSetting('push', 'marketplaceUpdates', checked)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              In-App Notifications
            </CardTitle>
            <CardDescription>
              Notifications within the VibeLux platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp-enabled" className="font-semibold">
                Enable in-app notifications
              </Label>
              <Switch
                id="inapp-enabled"
                checked={settings.inApp.enabled}
                onCheckedChange={(checked) => updateSetting('inApp', 'enabled', checked)}
              />
            </div>
            
            {settings.inApp.enabled && (
              <>
                <Separator />
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inapp-equipment">Equipment offers</Label>
                    <Switch
                      id="inapp-equipment"
                      checked={settings.inApp.equipmentOffers}
                      onCheckedChange={(checked) => updateSetting('inApp', 'equipmentOffers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inapp-service">Service bids</Label>
                    <Switch
                      id="inapp-service"
                      checked={settings.inApp.serviceBids}
                      onCheckedChange={(checked) => updateSetting('inApp', 'serviceBids', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inapp-invites">User invites</Label>
                    <Switch
                      id="inapp-invites"
                      checked={settings.inApp.userInvites}
                      onCheckedChange={(checked) => updateSetting('inApp', 'userInvites', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inapp-marketplace">Marketplace updates</Label>
                    <Switch
                      id="inapp-marketplace"
                      checked={settings.inApp.marketplaceUpdates}
                      onCheckedChange={(checked) => updateSetting('inApp', 'marketplaceUpdates', checked)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={loadSettings} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}