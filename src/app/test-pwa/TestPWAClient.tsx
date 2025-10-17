'use client';

import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { PWAManager } from '@/components/pwa/PWAManager';
import { PWAFeatures } from '@/components/PWAFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Check, 
  AlertCircle,
  Wifi,
  WifiOff,
  Bell,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TestPWAPage() {
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: '',
    viewport: { width: 0, height: 0 },
    deviceType: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    isOnline: true,
    isPWAInstalled: false,
    supportsNotifications: false,
    supportsServiceWorker: false
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (width < 768) deviceType = 'mobile';
      else if (width < 1024) deviceType = 'tablet';

      setDeviceInfo({
        userAgent: navigator.userAgent,
        viewport: { width, height },
        deviceType,
        isOnline: navigator.onLine,
        isPWAInstalled: window.matchMedia('(display-mode: standalone)').matches,
        supportsNotifications: 'Notification' in window,
        supportsServiceWorker: 'serviceWorker' in navigator
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('online', updateDeviceInfo);
    window.addEventListener('offline', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('online', updateDeviceInfo);
      window.removeEventListener('offline', updateDeviceInfo);
    };
  }, []);

  const getDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <ResponsiveLayout
      title="PWA Test Center"
      description="Testing Progressive Web App features and responsive design"
      showPWAManager={true}
      user={{
        name: "Test User",
        email: "test@vibelux.ai"
      }}
    >
      <div className="space-y-6">
        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDeviceIcon()}
              Device Information
            </CardTitle>
            <CardDescription>
              Current device capabilities and viewport information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Device Type</h4>
                <div className="flex items-center gap-2">
                  {getDeviceIcon()}
                  <span className="capitalize font-medium">{deviceInfo.deviceType}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Viewport</h4>
                <span className="font-mono text-sm">
                  {deviceInfo.viewport.width} × {deviceInfo.viewport.height}
                </span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Connection</h4>
                <div className="flex items-center gap-2">
                  {deviceInfo.isOnline ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                  <Badge variant={deviceInfo.isOnline ? "default" : "destructive"}>
                    {deviceInfo.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Features Status */}
        <Card>
          <CardHeader>
            <CardTitle>PWA Features Status</CardTitle>
            <CardDescription>
              Progressive Web App capabilities on this device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">App Installation</div>
                    <div className="text-sm text-gray-600">
                      {deviceInfo.isPWAInstalled ? 'Installed as app' : 'Running in browser'}
                    </div>
                  </div>
                </div>
                {deviceInfo.isPWAInstalled ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-600">
                      {deviceInfo.supportsNotifications ? 'Supported' : 'Not supported'}
                    </div>
                  </div>
                </div>
                {deviceInfo.supportsNotifications ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <WifiOff className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Service Worker</div>
                    <div className="text-sm text-gray-600">
                      {deviceInfo.supportsServiceWorker ? 'Available for offline use' : 'Not supported'}
                    </div>
                  </div>
                </div>
                {deviceInfo.supportsServiceWorker ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Responsive Design</div>
                    <div className="text-sm text-gray-600">
                      Adaptive layout active
                    </div>
                  </div>
                </div>
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Manager Component */}
        <Card>
          <CardHeader>
            <CardTitle>PWA Management</CardTitle>
            <CardDescription>
              Install, configure, and test Progressive Web App features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PWAManager />
          </CardContent>
        </Card>

        {/* Detailed PWA Features */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed PWA Features</CardTitle>
            <CardDescription>
              Comprehensive overview of all Progressive Web App capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PWAFeatures />
          </CardContent>
        </Card>

        {/* Browser Info */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
            <CardDescription>
              User agent and technical details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <code className="text-xs text-gray-700 break-all">
                {deviceInfo.userAgent}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}