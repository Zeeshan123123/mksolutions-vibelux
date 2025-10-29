'use client';

import { useState, useEffect } from 'react';
import { NavigationLayout } from '@/components/navigation/NavigationLayout';
import { AlertDetectionDashboard } from '@/components/alerts/AlertDetectionDashboard';
import { Bell, Settings, Plus } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function AlertsPage() {
  const [facilityId, setFacilityId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's facility from localStorage or API
    // For now, use the first available facility
    async function getFacilityId() {
      try {
        // Try to get from localStorage first
        const storedFacilityId = localStorage.getItem('selectedFacilityId');
        
        if (storedFacilityId) {
          setFacilityId(storedFacilityId);
        } else {
          // Use default facility ID from setup
          setFacilityId('cmh5wpg2p0000vdm4hfg2e5q6');
        }
      } catch (error) {
        console.error('Error getting facility ID:', error);
        // Fallback to default
        setFacilityId('cmh5wpg2p0000vdm4hfg2e5q6');
      } finally {
        setLoading(false);
      }
    }

    getFacilityId();
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <NavigationLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-400">Loading...</div>
        </div>
      </NavigationLayout>
    );
  }

  return (
    <NavigationLayout>
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }}
      />

      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Alert Management</h1>
                <p className="text-gray-400 mt-1">
                  Monitor and manage sensor alerts for your facility
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                onClick={() => window.location.href = '/sensors'}
              >
                <Settings className="w-5 h-5" />
                Manage Sensors
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                onClick={() => window.location.href = '/alerts/configure'}
              >
                <Plus className="w-5 h-5" />
                New Alert Rule
              </button>
            </div>
          </div>
        </div>

        {/* Alert Dashboard */}
        {facilityId ? (
          <AlertDetectionDashboard facilityId={facilityId} />
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Facility Selected</h3>
            <p className="text-gray-400">
              Please select a facility to view alerts.
            </p>
          </div>
        )}
      </div>
    </NavigationLayout>
  );
}

