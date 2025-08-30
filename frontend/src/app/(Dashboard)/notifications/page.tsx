"use client";

import React, { useState, useEffect } from 'react';
import './notifications.css';
import { 
  Card, 
  List, 
  Tag, 
  Space, 
  Typography, 
  Avatar, 
  Badge, 
  Empty, 
  Spin,
  Button,
  Select,
  Input,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import { 
  BellOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  ReloadOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/services/api/notifications';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

// Remove mock data - now using real-time API

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

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'auction':
      return '🏆';
    case 'payment':
      return '💰';
    case 'inspection':
      return '🔍';
    case 'transport':
      return '🚚';
    case 'system':
      return '⚙️';
    default:
      return '📢';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'auction':
      return 'blue';
    case 'payment':
      return 'green';
    case 'inspection':
      return 'orange';
    case 'transport':
      return 'purple';
    case 'system':
      return 'red';
    default:
      return 'default';
  }
};

export default function NotificationsPage() {
  const user = useSelector((state: RootState) => state.user);
  const [filters, setFilters] = useState({
    priority: 'all',
    type: 'all',
    readStatus: 'all',
    search: ''
  });
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  const {
    notifications,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    handlePageChange
  } = useNotifications();

  // Filter notifications based on current filters
  useEffect(() => {
    if (!notifications) return;
    
    let filtered = [...notifications];
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }
    
    if (filters.readStatus !== 'all') {
      filtered = filtered.filter(n => 
        filters.readStatus === 'read' ? (n.isRead || n.is_read) : !(n.isRead || n.is_read)
      );
    }
    
    if (filters.search) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (n.content || n.text || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, filters]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearFilters = () => {
    setFilters({
      priority: 'all',
      type: 'all',
      readStatus: 'all',
      search: ''
    });
  };

  // unreadCount is now provided by the hook

  const renderNotificationItem = (notification: Notification) => (
    <List.Item
      key={notification.id}
      className={`notification-item ${!(notification.isRead || notification.is_read) ? 'unread' : ''} hover:shadow-md transition-all duration-200`}
      data-priority={notification.priority}
      style={{
        backgroundColor: (notification.isRead || notification.is_read) ? 'transparent' : '#f0f9ff',
        borderLeft: `4px solid ${(notification.isRead || notification.is_read) ? '#e5e7eb' : getPriorityColor(notification.priority) === 'red' ? '#ef4444' : getPriorityColor(notification.priority) === 'orange' ? '#f97316' : '#3b82f6'}`,
        borderRadius: '8px',
        marginBottom: '8px',
        padding: '16px',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onClick={() => {
        if (!(notification.isRead || notification.is_read)) {
          handleMarkAsRead(notification.id.toString());
        }
      }}
    >
      <div className="flex items-start w-full">
        <div className="flex-shrink-0 mr-3">
          <Badge count={(notification.isRead || notification.is_read) ? 0 : 1} size="small">
            <Avatar 
              size={48} 
              icon={getPriorityIcon(notification.priority)}
              style={{ 
                backgroundColor: getPriorityColor(notification.priority) === 'red' ? '#fef2f2' : 
                              getPriorityColor(notification.priority) === 'orange' ? '#fff7ed' : '#eff6ff'
              }}
            />
          </Badge>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Title level={5} className="mb-0" style={{ color: (notification.isRead || notification.is_read) ? '#6b7280' : '#111827' }}>
                {notification.title}
              </Title>
              {!(notification.isRead || notification.is_read) && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
            <Space size="small">
              {notification.type && (
                <Tag color={getTypeColor(notification.type)}>
                  {getTypeIcon(notification.type)} {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </Tag>
              )}
              <Tag color={getPriorityColor(notification.priority)}>
                {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
              </Tag>
            </Space>
          </div>
          
          <Paragraph className="mb-2 text-gray-600">
            {notification.content || notification.text}
          </Paragraph>
          
          <div className="flex items-center justify-between">
            <Space size="middle">
              <Text type="secondary" className="text-sm">
                <ClockCircleOutlined className="mr-1" />
                {formatDistanceToNow(new Date(notification.createdAt || notification.created_at || Date.now()), { addSuffix: true })}
              </Text>
              {notification.sender && (
                <Text type="secondary" className="text-sm">
                  From: {notification.sender}
                </Text>
              )}
            </Space>
            
            <Space size="small">
              {notification.actionUrl && (
                <Button 
                  type="link" 
                  size="small"
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  View Details
                </Button>
              )}
              {!(notification.isRead || notification.is_read) && (
                <Button 
                  type="link" 
                  size="small"
                  className="p-0 h-auto text-gray-500 hover:text-gray-700"
                  onClick={() => handleMarkAsRead(notification.id.toString())}
                >
                  Mark as Read
                </Button>
              )}
            </Space>
          </div>
          
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <Text type="secondary" className="text-xs font-medium">Additional Info:</Text>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <Tag key={key} className="text-xs">
                    {key}: {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </List.Item>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BellOutlined className="text-2xl text-blue-600" />
            <Title level={2} className="mb-0">Notifications</Title>
            {unreadCount > 0 && (
              <Badge count={unreadCount} size="small" className="ml-2">
                <div className="w-6 h-6"></div>
              </Badge>
            )}
            
            {/* User role indicator */}
            <div className="flex items-center gap-2">
              <Tag color="blue" className="text-xs">
                {user?.role || user?.backendRole || 'User'}
              </Tag>
            </div>
            
            {/* Real-time status indicator */}
            <div className="flex items-center gap-2">
              {loading && <Spin size="small" />}
              {error && <span className="text-red-500 text-xs">Error loading</span>}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live Updates</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={() => fetchNotifications()}
              loading={loading}
              title="Refresh notifications"
            />
            <Button 
              type="primary" 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              icon={<CheckCircleOutlined />}
            >
              Mark All as Read
            </Button>
          </div>
        </div>
        
        <Text type="secondary">
          Stay updated with important updates, auction results, payments, and system notifications
        </Text>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Notifications"
          description={error}
          type="error"
          showIcon
          className="mb-4"
          action={
            <Button size="small" onClick={() => fetchNotifications()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <Select
            value={filters.priority}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            style={{ width: 150 }}
            placeholder="Priority"
          >
            <Option value="all">All Priorities</Option>
            <Option value="high">High Priority</Option>
            <Option value="medium">Medium Priority</Option>
            <Option value="low">Low Priority</Option>
          </Select>
          
          <Select
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            style={{ width: 150 }}
            placeholder="Type"
          >
            <Option value="all">All Types</Option>
            <Option value="system">System</Option>
            <Option value="auction">Auction</Option>
            <Option value="payment">Payment</Option>
            <Option value="inspection">Inspection</Option>
            <Option value="transport">Transport</Option>
            <Option value="general">General</Option>
          </Select>
          
          <Select
            value={filters.readStatus}
            onChange={(value) => setFilters(prev => ({ ...prev, readStatus: value }))}
            style={{ width: 150 }}
            placeholder="Status"
          >
            <Option value="all">All Statuses</Option>
            <Option value="unread">Unread</Option>
            <Option value="read">Read</Option>
          </Select>
          
          <Search
            placeholder="Search notifications..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ width: 250 }}
            allowClear
          />
          
          <Button 
            type="text" 
            icon={<ClearOutlined />} 
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Text className="text-gray-600">
              Showing {filteredNotifications.length} of {total} notifications
            </Text>
            {loading && <Spin size="small" />}
          </div>
        </div>
        
        {filteredNotifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications found. Try adjusting your filters or check back later"
            className="py-8"
          />
        ) : (
          <List
            dataSource={filteredNotifications}
            renderItem={renderNotificationItem}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        )}
      </Card>
    </div>
  );
}
