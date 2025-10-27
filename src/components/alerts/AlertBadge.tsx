'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAlertWebSocket } from '@/hooks/useAlertWebSocket';

interface AlertBadgeProps {
  facilityId: string;
  onClick?: () => void;
}

export function AlertBadge({ facilityId, onClick }: AlertBadgeProps) {
  const [alertCount, setAlertCount] = useState(0);
  const { newAlert } = useAlertWebSocket(facilityId);

  // Fetch active alert count
  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const response = await fetch(
          `/api/alerts/logs?facilityId=${facilityId}&status=ACTIVE&limit=1`
        );
        const data = await response.json();
        
        if (data.success && data.pagination) {
          setAlertCount(data.pagination.total);
        }
      } catch (error) {
        console.error('Failed to fetch alert count:', error);
      }
    }

    fetchAlertCount();
    
    // Refresh every minute
    const interval = setInterval(fetchAlertCount, 60000);
    return () => clearInterval(interval);
  }, [facilityId]);

  // Update count when new alert arrives
  useEffect(() => {
    if (newAlert) {
      setAlertCount(prev => prev + 1);
    }
  }, [newAlert]);

  const hasAlerts = alertCount > 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
      title={`${alertCount} active alert${alertCount !== 1 ? 's' : ''}`}
    >
      <Bell className={`w-5 h-5 ${hasAlerts ? 'text-red-400' : 'text-gray-400'}`} />
      
      {hasAlerts && (
        <>
          {/* Badge */}
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full px-1">
            {alertCount > 99 ? '99+' : alertCount}
          </span>
          
          {/* Pulse animation for critical alerts */}
          {alertCount > 0 && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </>
      )}
    </button>
  );
}

