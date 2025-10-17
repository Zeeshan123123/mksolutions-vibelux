'use client';

import { useState, useEffect } from 'react';
import { pushClient } from '@/lib/push/push-client';

export default function PushNotificationDemo() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const initialized = await pushClient.initialize();
      setIsInitialized(initialized);
      setPermission(pushClient.getPermissionStatus());
      setStatus(pushClient.getStatus());
    };

    init();
  }, []);

  const requestPermission = async () => {
    const newPermission = await pushClient.requestPermission();
    setPermission(newPermission);
    setStatus(pushClient.getStatus());
  };

  const sendTestNotification = async (type: string) => {
    const facilityId = 'demo-greenhouse-1';
    
    switch (type) {
      case 'growth':
        await pushClient.sendGrowthAlert(
          facilityId,
          'Unusual growth pattern detected in sector 3',
          'warning'
        );
        break;
        
      case 'equipment':
        await pushClient.sendEquipmentAlert(
          facilityId,
          'LED Array #3',
          'Temperature sensor offline'
        );
        break;
        
      case 'environment':
        await pushClient.sendEnvironmentAlert(
          facilityId,
          'Temperature',
          32,
          25
        );
        break;
        
      case 'harvest':
        await pushClient.sendHarvestAlert(
          facilityId,
          'Cherry Tomatoes',
          3
        );
        break;
        
      case 'maintenance':
        await pushClient.sendMaintenanceAlert(
          facilityId,
          'Clean air filters',
          'Tomorrow'
        );
        break;
        
      case 'system':
        await pushClient.sendSystemAlert(
          'VibeLux platform update available',
          'info'
        );
        break;
    }
  };

  if (!isInitialized) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Push Notifications</h3>
        <p className="text-gray-300">Initializing notification system...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">🔔 VibeLux Push Notifications</h3>
      
      {/* Status */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-2">Status</h4>
        <div className="space-y-1 text-sm">
          <div className="text-gray-300">
            <span className="font-medium">Supported:</span> 
            <span className={status?.supported ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>
              {status?.supported ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          <div className="text-gray-300">
            <span className="font-medium">Permission:</span> 
            <span className={`ml-2 ${
              permission === 'granted' ? 'text-green-400' : 
              permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {permission === 'granted' ? '✓ Granted' : 
               permission === 'denied' ? '✗ Denied' : '⚠ Not requested'}
            </span>
          </div>
          <div className="text-gray-300">
            <span className="font-medium">Service Worker:</span> 
            <span className={status?.serviceWorkerReady ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>
              {status?.serviceWorkerReady ? '✓ Ready' : '✗ Not ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Permission Request */}
      {permission !== 'granted' && (
        <div className="mb-6">
          <button
            onClick={requestPermission}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={permission === 'denied'}
          >
            {permission === 'denied' ? 'Permission Denied' : 'Enable Notifications'}
          </button>
          {permission === 'denied' && (
            <p className="text-sm text-gray-400 mt-2">
              Notifications were blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>
      )}

      {/* Test Notifications */}
      {permission === 'granted' && (
        <div>
          <h4 className="font-medium text-white mb-3">Test Notifications</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => sendTestNotification('growth')}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              🌱 Growth Alert
            </button>
            <button
              onClick={() => sendTestNotification('equipment')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              ⚙️ Equipment Alert
            </button>
            <button
              onClick={() => sendTestNotification('environment')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              🌡️ Environment Alert
            </button>
            <button
              onClick={() => sendTestNotification('harvest')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              🌾 Harvest Alert
            </button>
            <button
              onClick={() => sendTestNotification('maintenance')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              🔧 Maintenance Alert
            </button>
            <button
              onClick={() => sendTestNotification('system')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              🚀 System Alert
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-slate-700 rounded-lg">
        <h5 className="font-medium text-white mb-2">How it works:</h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Click "Enable Notifications" to grant permission</li>
          <li>• Test different alert types with the buttons above</li>
          <li>• Notifications include vibration patterns and actions</li>
          <li>• Critical alerts require interaction to dismiss</li>
          <li>• Works even when the app is in the background</li>
        </ul>
      </div>
    </div>
  );
}