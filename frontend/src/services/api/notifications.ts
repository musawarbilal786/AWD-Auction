import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Notification {
  id: string | number;
  title: string;
  text: string; // API uses 'text' instead of 'content'
  priority: 'high' | 'medium' | 'low';
  type?: 'system' | 'auction' | 'payment' | 'inspection' | 'transport' | 'general'; // Optional since API doesn't provide it
  is_read: boolean; // API uses 'is_read' instead of 'isRead'
  created_at: string; // API uses 'created_at' instead of 'createdAt'
  user?: number; // API provides 'user' field
  user_role?: string; // User role for filtering
  // Legacy fields for backward compatibility
  content?: string;
  isRead?: boolean;
  createdAt?: string;
  sender?: string;
  actionUrl?: string;
  metadata?: {
    auctionId?: string;
    amount?: number;
    vehicleId?: string;
    [key: string]: any;
  };
}

export interface NotificationFilters {
  priority?: 'high' | 'medium' | 'low' | 'all';
  type?: 'system' | 'auction' | 'payment' | 'inspection' | 'transport' | 'general' | 'all';
  readStatus?: 'read' | 'unread' | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
  userRole?: string; // Add user role filtering
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

class NotificationService {
  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get user role from localStorage or state
  private getUserRole(): string {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.role || user.backendRole || 'superadmin';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    return 'superadmin';
  }

  // Get all notifications with filters and role-based filtering
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      if (filters.readStatus && filters.readStatus !== 'all') {
        params.append('is_read', filters.readStatus === 'read' ? 'true' : 'false');
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      
      if (filters.pageSize) {
        params.append('page_size', filters.pageSize.toString());
      }

      // Add user role filtering
      const userRole = filters.userRole || this.getUserRole();
      if (userRole && userRole !== 'superadmin') {
        params.append('user_role', userRole);
      }

      const response = await axios.get(`${API_BASE_URL}/communication/api/v1/notifications/`, {
        headers: this.getAuthHeaders(),
      });

      // Handle direct array response from API
      if (Array.isArray(response.data)) {
        return {
          notifications: response.data,
          total: response.data.length,
          page: 1,
          pageSize: response.data.length
        };
      }

      // Handle expected object response
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get unread notifications count with role filtering
  async getUnreadCount(): Promise<number> {
    try {
      const userRole = this.getUserRole();
      const params = new URLSearchParams();
      
      if (userRole && userRole !== 'superadmin') {
        params.append('user_role', userRole);
      }

      const response = await axios.get(`${API_BASE_URL}/communication/api/v1/notifications/unread-count/?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data.unread_count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await axios.patch(`${API_BASE_URL}/communication/api/v1/notifications/${notificationId}/mark-read/`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read with role filtering
  async markAllAsRead(): Promise<void> {
    try {
      const userRole = this.getUserRole();
      const params = new URLSearchParams();
      
      if (userRole && userRole !== 'superadmin') {
        params.append('user_role', userRole);
      }

      await axios.patch(`${API_BASE_URL}/communication/api/v1/notifications/mark-all-read/?${params.toString()}`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/communication/api/v1/notifications/${notificationId}/`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get recent notifications (for header bell) with role filtering
  async getRecentNotifications(limit: number = 5): Promise<Notification[]> {
    try {
      const userRole = this.getUserRole();
      const params = new URLSearchParams();
      
      if (userRole && userRole !== 'superadmin') {
        params.append('user_role', userRole);
      }

      const response = await axios.get(`${API_BASE_URL}/communication/api/v1/notifications/recent/?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      // Handle direct array response from API
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Handle expected object response
      return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw error;
    }
  }

  // Create notification (for admin purposes)
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await axios.post(`${API_BASE_URL}/communication/api/v1/notifications/`, notificationData, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Update notification (for admin purposes)
  async updateNotification(notificationId: string, notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/communication/api/v1/notifications/${notificationId}/`, notificationData, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  // Get notification statistics with role filtering
  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    read: number;
    byPriority: { high: number; medium: number; low: number };
    byType: { [key: string]: number };
  }> {
    try {
      const userRole = this.getUserRole();
      const params = new URLSearchParams();
      
      if (userRole && userRole !== 'superadmin') {
        params.append('user_role', userRole);
      }

      const response = await axios.get(`${API_BASE_URL}/communication/api/v1/notifications/stats/?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

