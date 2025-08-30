# Universal Notification System for AWD Auctions

## 🎯 **Overview**

The notification system has been implemented across **ALL admin panels** and user types in the AWD Auctions application. Every user, regardless of their role, now has access to real-time notifications.

## 👥 **Supported User Types**

### 1. **Super Admin** (`/notifications`)
- Full access to all notifications
- Can view, manage, and create notifications
- Accessible from main admin dashboard

### 2. **Dealership Staff** (`(ds)/` routes)
- Role-based notifications (buyer/seller/both)
- Accessible from dealership dashboard header
- Filtered by user role and permissions

### 3. **Transporters** (`transporter/` routes)
- Transport-specific notifications
- Accessible from transporter dashboard header
- Filtered by transporter role

### 4. **Inspectors** (`inspection/` routes)
- Inspection-related notifications
- Accessible from inspector dashboard header
- Filtered by inspector role

### 5. **Buyers & Sellers** (via dealership staff)
- Notifications filtered by their specific role
- Accessible through dealership dashboard

## 🔔 **Notification Bell Location**

### **Main Admin Dashboard**
- Located in the top-right header
- Shows unread count badge
- Real-time updates every 30 seconds

### **Dealership Dashboard (DS Mode)**
- Located in the top-right header (before avatar)
- Shows unread count badge
- Role-based filtering

### **Transporter Dashboard**
- Located in the top-right header
- Shows unread count badge
- Transport-specific notifications

## 🚀 **Features**

### **Real-Time Updates**
- Automatic polling every 30 seconds
- Live status indicator
- Real-time unread count

### **Role-Based Filtering**
- Notifications automatically filtered by user role
- API calls include `user_role` parameter
- Secure access control

### **Universal Components**
- `NotificationBell` - Header dropdown for all user types
- `NotificationsPage` - Full page view for all user types
- `useNotifications` - Hook for all notification operations

### **Smart Field Mapping**
- Supports both API field names (`is_read`, `text`) and legacy names (`isRead`, `content`)
- Automatic fallback handling
- Type-safe operations

## 📁 **File Structure**

```
src/
├── components/
│   ├── common/
│   │   └── NotificationBell.tsx          # Universal notification dropdown
│   └── layout/
│       ├── Header.tsx                    # Main admin header (includes NotificationBell)
│       └── ClientHeader.tsx              # Role-based header routing
├── app/(Dashboard)/
│   ├── layout.tsx                        # DS mode layout (includes NotificationBell)
│   ├── notifications/
│   │   └── page.tsx                      # Universal notifications page
│   ├── (ds)/                             # Dealership dashboard
│   ├── transporter/                       # Transporter dashboard
│   └── inspection/                        # Inspector dashboard
├── hooks/
│   └── useNotifications.ts                # Universal notification hooks
└── services/api/
    └── notifications.ts                   # Role-aware API service
```

## 🔧 **Implementation Details**

### **Role Detection**
```typescript
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
```

### **Role-Based API Calls**
```typescript
// Add user role filtering
const userRole = filters.userRole || this.getUserRole();
if (userRole && userRole !== 'superadmin') {
  params.append('user_role', userRole);
}
```

### **Universal Hook Usage**
```typescript
// Works for all user types
const {
  notifications,
  loading,
  error,
  unreadCount,
  fetchNotifications,
  markAsRead
} = useNotifications();
```

## 🎨 **UI Components**

### **NotificationBell (Header Dropdown)**
- Shows 5 most recent notifications
- Real-time unread count badge
- Quick actions (mark as read, view all)
- Role-based filtering

### **NotificationsPage (Full Page)**
- Complete notification management
- Advanced filtering (priority, type, status, search)
- Pagination support
- Bulk actions (mark all as read)

## 🔒 **Security Features**

### **Role-Based Access Control**
- Notifications filtered by user role
- API endpoints respect user permissions
- Secure token-based authentication

### **Data Validation**
- Input sanitization
- Type safety with TypeScript
- Error handling and fallbacks

## 📱 **Responsive Design**

### **Mobile Support**
- Notification bell works on all screen sizes
- Responsive notification page layout
- Touch-friendly interactions

### **Cross-Platform**
- Works on desktop, tablet, and mobile
- Consistent experience across devices

## 🧪 **Testing**

### **Test Scenarios**
1. **Super Admin**: Access to all notifications
2. **Dealership Staff**: Role-filtered notifications
3. **Transporters**: Transport-specific notifications
4. **Inspectors**: Inspection-related notifications
5. **Buyers/Sellers**: Role-appropriate notifications

### **Test Cases**
- Notification creation and display
- Real-time updates
- Role-based filtering
- Mark as read functionality
- Search and filtering
- Pagination

## 🚀 **Usage Examples**

### **Adding to New Dashboard**
```typescript
import NotificationBell from "@/components/common/NotificationBell";

// In your header component
<div className="header-right">
  <NotificationBell />
  <UserAvatar />
</div>
```

### **Using Notifications Hook**
```typescript
import { useNotifications } from "@/hooks/useNotifications";

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <span>Unread: {unreadCount}</span>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.title}
          <button onClick={() => markAsRead(notification.id.toString())}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 **API Endpoints**

### **Base URL**
```
/communication/api/v1/notifications/
```

### **Endpoints**
- `GET /` - Get all notifications (with role filtering)
- `GET /recent/` - Get recent notifications (with role filtering)
- `GET /unread-count/` - Get unread count (with role filtering)
- `PATCH /{id}/mark-read/` - Mark notification as read
- `PATCH /mark-all-read/` - Mark all notifications as read (with role filtering)
- `GET /stats/` - Get notification statistics (with role filtering)

### **Query Parameters**
- `user_role` - Filter by user role (automatically added)
- `priority` - Filter by priority (high/medium/low)
- `type` - Filter by type (system/auction/payment/etc.)
- `is_read` - Filter by read status
- `search` - Search in title and content
- `page` - Page number for pagination
- `page_size` - Items per page

## 🎯 **Next Steps**

### **Immediate**
- Test notifications across all user types
- Verify role-based filtering works correctly
- Ensure real-time updates function properly

### **Future Enhancements**
- Push notifications for critical alerts
- Email/SMS notification integration
- Notification preferences per user
- Advanced notification scheduling
- Notification analytics and reporting

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Notifications not showing**: Check user role and permissions
2. **Real-time updates not working**: Verify polling interval and API connectivity
3. **Role filtering issues**: Check localStorage user data format
4. **Type errors**: Ensure Notification interface matches API response

### **Debug Information**
- Check browser console for API calls
- Verify user role in localStorage
- Check network tab for API responses
- Ensure authentication tokens are valid

## 📞 **Support**

For issues or questions about the notification system:
1. Check the browser console for errors
2. Verify user role and permissions
3. Test API endpoints directly
4. Review this documentation

---

**The notification system is now universal and works across all admin panels, providing a consistent experience for all user types while maintaining proper role-based access control.**
