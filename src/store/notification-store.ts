import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [],
      
      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
          };
          
          // Auto-remove after duration (default 5 seconds)
          if (notification.duration !== 0) {
            setTimeout(() => {
              set((state) => ({
                notifications: state.notifications.filter(n => n.id !== newNotification.id),
              }));
            }, notification.duration || 5000);
          }
          
          return {
            notifications: [...state.notifications, newNotification],
          };
        }),
        
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        })),
        
      clearAll: () =>
        set(() => ({
          notifications: [],
        })),
    }),
    {
      name: 'Notification Store',
    }
  )
);

// Convenience functions
export const notify = {
  success: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
      ...options,
    }),
    
  error: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
      duration: 0, // Errors don't auto-dismiss by default
      ...options,
    }),
    
  warning: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    }),
    
  info: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
      ...options,
    }),
};