import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification, NotificationFilters, NotificationResponse } from '@/services/api/notifications';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

// Configuration constants
const DEFAULT_POLLING_INTERVAL = 30000; // 30 seconds
const RECENT_NOTIFICATIONS_LIMIT = 10;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch notifications with filters
  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.getNotifications({
        ...filters,
        page: currentPage,
        pageSize,
      });
      
      // Ensure we have valid data before setting state
      if (response && Array.isArray(response.notifications)) {
        setNotifications(response.notifications);
        setTotal(response.total || 0);
      } else {
        console.warn('Invalid notifications response:', response);
        setNotifications([]);
        setTotal(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      showSuccessToast('Notification marked as read');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      showErrorToast(errorMessage);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      showSuccessToast('All notifications marked as read');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      showErrorToast(errorMessage);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      showSuccessToast('Notification deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      showErrorToast(errorMessage);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle page change
  const handlePageChange = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  }, []);

  // Get unread count
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Set up automatic polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, DEFAULT_POLLING_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    // State
    notifications,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    unreadCount,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    handlePageChange,
    fetchUnreadCount,
    
    // Computed
    hasUnread: unreadCount > 0,
    unreadNotifications: notifications?.filter(n => !(n.isRead || n.is_read)) || [],
    readNotifications: notifications?.filter(n => (n.isRead || n.is_read)) || [],
  };
};

export const useRecentNotifications = (limit: number = 5) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the main notifications endpoint instead of /recent/ to ensure it works
      const response = await notificationService.getNotifications({ pageSize: limit });
      
      // Ensure we have valid data before setting state
      if (response && Array.isArray(response.notifications)) {
        setNotifications(response.notifications);
      } else {
        console.warn('Invalid recent notifications response:', response);
        setNotifications([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent notifications';
      setError(errorMessage);
      console.error('Failed to fetch recent notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRecentNotifications();
  }, [fetchRecentNotifications]);

  // Set up automatic polling every 30 seconds for recent notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentNotifications();
    }, DEFAULT_POLLING_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchRecentNotifications]);

  return {
    notifications,
    loading,
    error,
    fetchRecentNotifications,
    markAsRead,
    unreadCount: notifications?.filter(n => !(n.isRead || n.is_read))?.length || 0,
  };
};

export const useRealTimeNotifications = (pollingInterval: number = DEFAULT_POLLING_INTERVAL) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both notifications and unread count
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        notificationService.getRecentNotifications(RECENT_NOTIFICATIONS_LIMIT),
        notificationService.getUnreadCount()
      ]);
      
      // Ensure we have valid data before setting state
      if (Array.isArray(notificationsResponse)) {
        setNotifications(notificationsResponse);
      } else {
        console.warn('Invalid real-time notifications response:', notificationsResponse);
        setNotifications([]);
      }
      
      if (typeof unreadCountResponse === 'number') {
        setUnreadCount(unreadCountResponse);
      } else {
        console.warn('Invalid unread count response:', unreadCountResponse);
        setUnreadCount(0);
      }
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Real-time notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state - handle both field names
      setNotifications(prev => 
        prev.map(n => n.id.toString() === notificationId ? { ...n, isRead: true, is_read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Set up automatic polling
  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up interval
    const interval = setInterval(() => {
      fetchNotifications();
    }, pollingInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchNotifications, pollingInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Pause/resume polling
  const [isPollingPaused, setIsPollingPaused] = useState(false);

  const pausePolling = useCallback(() => {
    setIsPollingPaused(true);
  }, []);

  const resumePolling = useCallback(() => {
    setIsPollingPaused(false);
    fetchNotifications(); // Fetch immediately when resuming
  }, [fetchNotifications]);

  // Conditional polling based on pause state
  useEffect(() => {
    if (isPollingPaused) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchNotifications, pollingInterval, isPollingPaused]);

  return {
    // State
    notifications,
    loading,
    error,
    unreadCount,
    lastUpdate,
    isPollingPaused,
    
    // Actions
    fetchNotifications,
    markAsRead,
    refresh,
    pausePolling,
    resumePolling,
    
    // Computed
    hasUnread: unreadCount > 0,
    unreadNotifications: notifications.filter(n => !n.isRead),
    readNotifications: notifications.filter(n => n.isRead),
    isRealTime: !isPollingPaused,
  };
};

export default useNotifications;

