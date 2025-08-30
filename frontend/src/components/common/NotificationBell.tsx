"use client";

import React, { useState } from 'react';
import { Badge, Popover, Button, List, Typography, Space, Tag, Avatar, Empty, Spin } from 'antd';
import { BellOutlined, ExclamationCircleOutlined, InfoCircleOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/services/api/notifications';
import { formatDistanceToNow } from 'date-fns';

const { Text, Title } = Typography;

// Remove the local Notification interface since we're importing it

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'medium':
      return <InfoCircleOutlined style={{ color: '#fa8c16' }} />;
    case 'low':
      return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
    default:
      return <InfoCircleOutlined />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'blue';
    default:
      return 'default';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'auction':
      return 'purple';
    case 'payment':
      return 'green';
    case 'inspection':
      return 'cyan';
    case 'transport':
      return 'blue';
    case 'system':
      return 'gray';
    default:
      return 'default';
  }
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Use the main notifications hook for the dropdown
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    unreadCount
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 5); // Show only 5 most recent

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push('/notifications');
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!(notification.isRead || notification.is_read)) {
      handleMarkAsRead(notification.id.toString());
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setOpen(false);
  };

  const notificationContent = (
    <div className="w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Title level={5} className="mb-0">Notifications</Title>
          {loading && <Spin size="small" />}
          {error && <span className="text-red-500 text-xs">Error loading</span>}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="text" 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
            title="Refresh notifications"
          />
          <Button type="link" size="small" onClick={handleViewAll}>
            View All
          </Button>
        </div>
      </div>
      
      {recentNotifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No notifications"
          className="py-4"
        />
      ) : (
        <List
          dataSource={recentNotifications}
          renderItem={(notification: Notification) => (
            <List.Item
              key={notification.id}
              className={`cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors ${
                !(notification.isRead || notification.is_read) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start w-full">
                <div className="flex-shrink-0 mr-3">
                  <Avatar 
                    size={32} 
                    icon={getPriorityIcon(notification.priority)}
                    style={{ 
                      backgroundColor: getPriorityColor(notification.priority) === 'red' ? '#fef2f2' : 
                                    getPriorityColor(notification.priority) === 'orange' ? '#fff7ed' : '#eff6ff'
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Title level={5} className="mb-0 text-sm" style={{ 
                      color: (notification.isRead || notification.is_read) ? '#6b7280' : '#111827',
                      fontWeight: (notification.isRead || notification.is_read) ? 'normal' : '600'
                    }}>
                      {notification.title}
                    </Title>
                    {!(notification.isRead || notification.is_read) && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <Text className="text-xs text-gray-600 line-clamp-2 mb-2 block">
                    {notification.content || notification.text}
                  </Text>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDistanceToNow(new Date(notification.createdAt || notification.created_at || Date.now()), { addSuffix: true })}</span>
                    {notification.sender && <span>From: {notification.sender}</span>}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="notification-popover"
    >
      <Badge count={unreadCount} size="small" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined className="text-lg" />}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full"
          onClick={() => setOpen(!open)}
        />
      </Badge>
    </Popover>
  );
}
