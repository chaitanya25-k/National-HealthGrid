import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AlertNotification } from '../types';

interface NotificationContextType {
  notifications: AlertNotification[];
  unreadCount: number;
  criticalCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  acknowledgeAlert: (id: string) => Promise<void>;
  simulateAlert: (params?: { resource?: string; severity?: 'CRITICAL' | 'HIGH' | 'WATCH'; title?: string; message?: string }) => Promise<void>;
  recentToast: AlertNotification | null;
  clearToast: () => void;
  refreshNotifications: () => Promise<void>;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentToast, setRecentToast] = useState<AlertNotification | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const seen = new Set<string>();
          const unique: AlertNotification[] = [];
          for (const item of data) {
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              unique.push(item);
            }
          }
          setNotifications(unique);
        }
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, []);

  const triggerToast = useCallback((alert: AlertNotification) => {
    setRecentToast(alert);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setRecentToast(null);
    }, 6000);
  }, []);

  const clearToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setRecentToast(null);
  }, []);

  // SSE real-time connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      setConnectionStatus('connecting');
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.onopen = () => {
        setConnectionStatus('connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INIT' && Array.isArray(payload.notifications)) {
            const seen = new Set<string>();
            const unique: AlertNotification[] = [];
            for (const item of payload.notifications) {
              if (item && item.id && !seen.has(item.id)) {
                seen.add(item.id);
                unique.push(item);
              }
            }
            setNotifications(unique);
          } else if (payload.type === 'NEW_ALERT' && payload.notification) {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === payload.notification.id)) {
                return prev;
              }
              return [payload.notification, ...prev];
            });
            triggerToast(payload.notification);
          } else if (payload.type === 'NOTIFICATION_ACKNOWLEDGED' && payload.data?.id) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.data.id ? { ...n, acknowledged: true } : n))
            );
          } else if (payload.type === 'CAPACITY_UPDATED' || payload.type === 'INVENTORY_UPDATED') {
            fetchNotifications();
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        setConnectionStatus('disconnected');
        eventSource?.close();
        // Retry connection after 5 seconds
        retryTimeout = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();
    fetchNotifications();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [fetchNotifications, triggerToast]);

  const acknowledgeAlert = async (id: string) => {
    const token = localStorage.getItem('hg_token');
    try {
      const res = await fetch('/api/notifications/ack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n))
        );
      }
    } catch (e) {
      console.error('Failed to acknowledge notification:', e);
    }
  };

  const simulateAlert = async (params?: {
    resource?: string;
    severity?: 'CRITICAL' | 'HIGH' | 'WATCH';
    title?: string;
    message?: string;
  }) => {
    const token = localStorage.getItem('hg_token');
    try {
      const res = await fetch('/api/notifications/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(params || {}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notification) {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === data.notification.id)) {
              return prev;
            }
            return [data.notification, ...prev];
          });
          triggerToast(data.notification);
        }
      }
    } catch (e) {
      console.error('Failed to simulate alert:', e);
    }
  };

  const toggleDrawer = () => setIsOpen((prev) => !prev);

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;
  const criticalCount = notifications.filter(
    (n) => !n.acknowledged && (n.severity === 'CRITICAL' || n.severity === 'HIGH')
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        criticalCount,
        isOpen,
        setIsOpen,
        toggleDrawer,
        acknowledgeAlert,
        simulateAlert,
        recentToast,
        clearToast,
        refreshNotifications: fetchNotifications,
        connectionStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
