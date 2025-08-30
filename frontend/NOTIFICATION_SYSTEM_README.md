# Notification System Implementation

This document describes the implementation of a real-time notification system for the AWD Auction platform.

## Overview

The notification system provides real-time updates for various events including:
- Auction updates
- Payment notifications
- Inspection requests
- Transportation jobs
- System messages
- General notifications

## Features

### 🚀 Real-time Updates
- Automatic polling every 30 seconds
- Live status indicators
- Manual refresh capability
- Error handling with retry options

### 🔔 Smart Notifications
- Priority-based categorization (High, Medium, Low)
- Type-based filtering (Auction, Payment, Inspection, Transport, System, General)
- Read/unread status tracking
- Search functionality
- Pagination support

### 🎯 Multiple Hooks
- `useNotifications` - Full notification management with pagination
- `useRecentNotifications` - Recent notifications for header bell
- `useRealTimeNotifications` - Configurable real-time updates

## API Endpoints

All notification endpoints follow the pattern:
```
${API_BASE_URL}/communication/api/v1/notifications/
```

### Available Endpoints:
- `GET /` - Get all notifications with filters and pagination
- `GET /unread-count/` - Get unread notifications count
- `PATCH /{id}/mark-read/` - Mark notification as read
- `PATCH /mark-all-read/` - Mark all notifications as read
- `DELETE /{id}/` - Delete notification
- `GET /recent/?limit={n}` - Get recent notifications
- `POST /` - Create notification (admin)
- `PATCH /{id}/` - Update notification (admin)
- `GET /stats/` - Get notification statistics

## Usage Examples

### Basic Notification Hook
```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.title}
          {!notification.isRead && (
            <button onClick={() => markAsRead(notification.id)}>
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Real-time Notifications Hook
```tsx
import { useRealTimeNotifications } from '@/hooks/useNotifications';

function HeaderNotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    isRealTime,
    pausePolling,
    resumePolling,
    refresh
  } = useRealTimeNotifications(30000); // 30 seconds

  return (
    <div>
      <Badge count={unreadCount}>
        <BellIcon />
      </Badge>
      {isRealTime && <span className="live-indicator">Live</span>}
      <button onClick={refresh}>Refresh</button>
      <button onClick={pausePolling}>Pause</button>
      <button onClick={resumePolling}>Resume</button>
    </div>
  );
}
```

### Notification Service (Direct API calls)
```tsx
import { notificationService } from '@/services/api/notifications';

// Get notifications with filters
const notifications = await notificationService.getNotifications({
  priority: 'high',
  type: 'auction',
  readStatus: 'unread',
  page: 1,
  pageSize: 10
});

// Mark as read
await notificationService.markAsRead('notification-id');

// Get unread count
const unreadCount = await notificationService.getUnreadCount();
```

## Components

### NotificationBell
Located at `src/components/common/NotificationBell.tsx`
- Real-time notification bell for header
- Shows unread count badge
- Dropdown with recent notifications
- Live status indicator

### NotificationsPage
Located at `src/app/(Dashboard)/notifications/page.tsx`
- Full notifications management page
- Advanced filtering and search
- Pagination support
- Real-time updates

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Polling Intervals
- Default: 30 seconds
- Configurable per hook usage
- Can be paused/resumed

## Data Structure

### Notification Interface
```typescript
interface Notification {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  type: 'system' | 'auction' | 'payment' | 'inspection' | 'transport' | 'general';
  isRead: boolean;
  createdAt: string;
  sender?: string;
  actionUrl?: string;
  metadata?: {
    auctionId?: string;
    amount?: number;
    vehicleId?: string;
    [key: string]: any;
  };
}
```

### Filter Interface
```typescript
interface NotificationFilters {
  priority?: 'high' | 'medium' | 'low' | 'all';
  type?: 'system' | 'auction' | 'payment' | 'inspection' | 'transport' | 'general' | 'all';
  readStatus?: 'read' | 'unread' | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
}
```

## Error Handling

The system includes comprehensive error handling:
- Network error detection
- User-friendly error messages
- Retry mechanisms
- Fallback to cached data when possible
- Loading states for better UX

## Performance Considerations

- Automatic cleanup of intervals on component unmount
- Debounced search functionality
- Efficient pagination
- Optimistic updates for read status
- Background polling that can be paused

## Future Enhancements

- WebSocket support for instant updates
- Push notifications
- Email notifications
- Notification preferences
- Advanced filtering options
- Notification templates
- Bulk operations

## Troubleshooting

### Common Issues

1. **Notifications not updating**
   - Check if polling is paused
   - Verify API endpoint is accessible
   - Check browser console for errors

2. **API errors**
   - Verify authentication token
   - Check API endpoint configuration
   - Ensure proper CORS setup

3. **Performance issues**
   - Reduce polling interval
   - Implement pagination
   - Use filters to limit data

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('debug', 'notifications');
```

## Contributing

When adding new notification types or features:
1. Update the Notification interface
2. Add corresponding API endpoints
3. Update filter options
4. Add appropriate icons and colors
5. Test with real-time updates
6. Update documentation

## Support

For technical support or questions about the notification system, please refer to the development team or create an issue in the project repository.
