import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs/server';
import { useWebSocket } from '@/hooks/useWebSocket';

interface MarketplaceNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  createdAt: Date;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export function useMarketplaceNotifications() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
    onMessage: (message) => {
      if (message.type === 'notification') {
        // Add new notification to the top of the list
        setNotifications(prev => [message.data, ...prev]);
        if (!message.data.readAt) {
          setUnreadCount(prev => prev + 1);
        }
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(message.data.title, {
            body: message.data.message,
            icon: '/icon-192x192.png',
            tag: message.data.id
          });
        }
      } else if (message.type === 'notification_read') {
        // Update notification read status
        setNotifications(prev => 
          prev.map(n => 
            n.id === message.data.notificationId 
              ? { ...n, readAt: new Date() }
              : n
          )
        );
        setUnreadCount(message.data.unreadCount);
      }
    }
  });

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/notifications/marketplace');
      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, readAt: new Date() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Subscribe to notification channels
  const subscribe = useCallback((channels: string[]) => {
    if (isConnected) {
      sendMessage({
        type: 'subscribe',
        channels
      });
    }
  }, [isConnected, sendMessage]);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe to user's notification channel
  useEffect(() => {
    if (userId && isConnected) {
      subscribe([`user:${userId}:notifications`]);
    }
  }, [userId, isConnected, subscribe]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    refresh: loadNotifications
  };
}