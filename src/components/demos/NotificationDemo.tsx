'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, Check, X, Smartphone, Mail } from 'lucide-react';

interface NotificationDemoProps {
  isRunning: boolean;
  onMetricsUpdate: (metrics: any) => void;
}

export function NotificationDemo({ isRunning, onMetricsUpdate }: NotificationDemoProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isRunning) {
      // Check notification permission
      if ('Notification' in window) {
        setPermission(Notification.permission);
        
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(perm => {
            setPermission(perm);
          });
        }
      }

      // Simulate notification
      setTimeout(() => {
        setShowNotification(true);
        onMetricsUpdate({
          before: 150, // $150/mo for SMS
          after: 0,    // $0 for web push
          improvement: '100%'
        });

        // Send actual notification if permitted
        if (Notification.permission === 'granted') {
          new Notification('VibeLux Alert', {
            body: 'Temperature in Greenhouse A exceeds threshold!',
            icon: '/logo-192.png',
            badge: '/logo-192.png',
            vibrate: [200, 100, 200]
          });
        }
      }, 2000);
    } else {
      setShowNotification(false);
    }
  }, [isRunning, onMetricsUpdate]);

  return (
    <div className="space-y-6">
      {/* Notification Demo */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-white">Web Push Notifications</h4>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            permission === 'granted' 
              ? 'bg-green-900/50 text-green-400' 
              : permission === 'denied'
              ? 'bg-red-900/50 text-red-400'
              : 'bg-yellow-900/50 text-yellow-400'
          }`}>
            {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not Set'}
          </span>
        </div>

        {isRunning && showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-lg p-4 border border-orange-700/50"
          >
            <div className="flex items-start gap-3">
              <BellRing className="w-6 h-6 text-orange-400 animate-pulse" />
              <div className="flex-1">
                <h5 className="font-semibold text-white mb-1">Temperature Alert</h5>
                <p className="text-gray-300 text-sm">
                  Greenhouse A temperature exceeds 85°F threshold. Current: 87.3°F
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm font-medium transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-medium transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cost Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 rounded-lg p-6 border border-red-900/50">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-red-400" />
            <div>
              <h5 className="font-semibold text-white">SMS Notifications</h5>
              <p className="text-red-400 text-sm">$150/month</p>
            </div>
          </div>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-400" />
              $0.0075 per SMS
            </li>
            <li className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-400" />
              Limited to 160 characters
            </li>
            <li className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-400" />
              No rich media
            </li>
            <li className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-400" />
              Carrier fees apply
            </li>
          </ul>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6 border border-green-900/50">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-8 h-8 text-green-400" />
            <div>
              <h5 className="font-semibold text-white">Web Push</h5>
              <p className="text-green-400 text-sm">$0/month</p>
            </div>
          </div>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Completely free
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Rich notifications
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Images & actions
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Works offline
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}