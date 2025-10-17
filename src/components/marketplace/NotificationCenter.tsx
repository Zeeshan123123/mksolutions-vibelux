'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Package, 
  Wrench, 
  UserPlus, 
  X, 
  Check, 
  Clock,
  DollarSign,
  Calendar,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useNotifications } from '@/components/ui/NotificationSystem';
import { formatDistanceToNow } from 'date-fns';

interface MarketplaceNotification {
  id: string;
  type: 'equipment_offer' | 'service_bid' | 'user_invite' | 'offer_accepted' | 'bid_accepted' | 'invite_accepted';
  title: string;
  message: string;
  data: any;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'marketplace' | 'services' | 'team';
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'marketplace' | 'services' | 'team'>('all');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/marketplace');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, readAt: new Date() } : n)
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}/accept`, {
        method: 'POST'
      });
      
      if (response.ok) {
        showSuccess('Offer accepted successfully!');
        loadNotifications();
      } else {
        showError('Failed to accept offer');
      }
    } catch (error) {
      showError('An error occurred');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}/reject`, {
        method: 'POST'
      });
      
      if (response.ok) {
        showSuccess('Offer rejected');
        loadNotifications();
      }
    } catch (error) {
      showError('An error occurred');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'equipment_offer':
      case 'offer_accepted':
        return <Package className="w-5 h-5" />;
      case 'service_bid':
      case 'bid_accepted':
        return <Wrench className="w-5 h-5" />;
      case 'user_invite':
      case 'invite_accepted':
        return <UserPlus className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'equipment_offer':
      case 'offer_accepted':
        return 'text-blue-500';
      case 'service_bid':
      case 'bid_accepted':
        return 'text-green-500';
      case 'user_invite':
      case 'invite_accepted':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.readAt;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 p-4 border-b overflow-x-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'marketplace', label: 'Marketplace' },
                  { id: 'services', label: 'Services' },
                  { id: 'team', label: 'Team' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'unread' && unreadCount > 0 && (
                      <span className="ml-1">({unreadCount})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <Bell className="w-8 h-8 mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !notification.readAt ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getIconColor(notification.type)}`}>
                            {getIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            {/* Notification-specific content */}
                            {notification.type === 'equipment_offer' && notification.data && (
                              <div className="bg-gray-100 rounded p-2 mb-2 text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-600">Condition:</span>
                                  <span className="font-medium capitalize">{notification.data.condition}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Price:</span>
                                  <span className="font-medium text-green-600">
                                    ${notification.data.price}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {notification.type === 'service_bid' && notification.data && (
                              <div className="bg-gray-100 rounded p-2 mb-2 text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-600">Service:</span>
                                  <span className="font-medium capitalize">{notification.data.serviceType}</span>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-600">Estimate:</span>
                                  <span className="font-medium text-green-600">
                                    ${notification.data.estimatedCost}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Start Date:</span>
                                  <span className="font-medium">
                                    {new Date(notification.data.proposedStartDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {notification.type === 'equipment_offer' && (
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptOffer(notification.data.offerId);
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectOffer(notification.data.offerId);
                                  }}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            
                            {notification.actionUrl && notification.type !== 'equipment_offer' && (
                              <a
                                href={notification.actionUrl}
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {notification.actionLabel || 'View'}
                                <ChevronRight className="w-4 h-4" />
                              </a>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}