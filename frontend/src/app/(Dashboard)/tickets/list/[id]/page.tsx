"use client";
import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Tag, Image, Spin, Timeline, Divider } from 'antd';
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

interface TicketDetail {
  key: string | number;
  ticketNo: string;
  updated: string;
  name: string;
  subject: string;
  status: string;
  priority: string;
  description?: string;
  attachments?: any[];
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  assignedTo?: string;
  originalData?: any;
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTicketDataFromURL = () => {
    setLoading(true);
    try {
      const dataParam = searchParams.get('data');
      if (!dataParam) {
        throw new Error('No ticket data found in URL');
      }

      const ticket = JSON.parse(decodeURIComponent(dataParam));
      
      if (!ticket) {
        throw new Error('Invalid ticket data');
      }

      // Map the ticket data to our interface
      const mappedTicket: TicketDetail = {
        key: ticket.key || params.id,
        ticketNo: ticket.ticketNo || `TKT-${params.id}`,
        updated: ticket.updated || 'N/A',
        name: ticket.name || 'N/A',
        subject: ticket.subject || 'No subject',
        status: ticket.status || 'New',
        priority: ticket.priority || '2',
        description: ticket.message || 'No description provided',
        attachments: ticket.attachments || [],
        createdAt: ticket.createdAt || 'N/A',
        updatedAt: ticket.updated || 'N/A',
        category: ticket.category || 'N/A',
        assignedTo: ticket.assignedTo || 'Unassigned',
        originalData: ticket
      };

      setTicketDetail(mappedTicket);
      showSuccessToast("Ticket details loaded successfully!", "Ticket Details");
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load ticket details from URL.";
      setError(errorMessage);
      showErrorToast(err, "Ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      getTicketDataFromURL();
    }
  }, [params.id, searchParams]);

  if (loading) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Tickets", href: "/tickets" },
            { label: "List", href: "/tickets/list" },
            { label: "Ticket Details" }
          ]} 
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spin size="large" />
            <p className="text-gray-600 mt-4">Loading ticket details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticketDetail) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Tickets", href: "/tickets" },
            { label: "List", href: "/tickets/list" },
            { label: "Ticket Details" }
          ]} 
        />
        <Card className="mt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error || "Ticket not found"}</p>
            <Button type="primary" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'red';
      case 'resolved':
        return 'green';
      case 'reported to seller':
        return 'blue';
      case 'in progress':
        return 'orange';
      case 'closed':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '1':
        return 'red';
      case '2':
        return 'orange';
      case '3':
        return 'blue';
      case '4':
        return 'green';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case '1':
        return 'Urgent';
      case '2':
        return 'High';
      case '3':
        return 'Medium';
      case '4':
        return 'Low';
      default:
        return 'Medium';
    }
  };

  return (
    <div>
      <Breadcrumbs 
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Tickets", href: "/tickets" },
          { label: "List", href: "/tickets/list" },
          { label: `Ticket #${ticketDetail.ticketNo}` }
        ]} 
      />
      
      <div className="mt-6 space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.back()}
                type="text"
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
                <p className="text-gray-600">Ticket #{ticketDetail.ticketNo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Tag color={getStatusColor(ticketDetail.status)} className="text-lg px-4 py-2">
                {ticketDetail.status}
              </Tag>
              <Tag color={getPriorityColor(ticketDetail.priority)} className="text-lg px-4 py-2">
                {getPriorityLabel(ticketDetail.priority)} Priority
              </Tag>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card title="Basic Information" className="shadow-sm">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ticket Number">
              <span className="font-semibold text-blue-700">{ticketDetail.ticketNo}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {ticketDetail.category}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              <div className="flex items-center space-x-2">
                <UserOutlined className="text-blue-600" />
                <span>{ticketDetail.name}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">
              {ticketDetail.assignedTo}
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
              <div className="flex items-center space-x-2">
                <CalendarOutlined className="text-green-600" />
                <span>{ticketDetail.createdAt}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              <div className="flex items-center space-x-2">
                <CalendarOutlined className="text-orange-600" />
                <span>{ticketDetail.updatedAt}</span>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Subject and Description */}
        <Card title="Issue Details" className="shadow-sm">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Subject</h4>
              <div className="flex items-center space-x-2">
                <FileTextOutlined className="text-blue-600" />
                <span className="text-lg">{ticketDetail.subject}</span>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{ticketDetail.description}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Attachments */}
        {ticketDetail.attachments && ticketDetail.attachments.length > 0 && (
          <Card title="Attachments" className="shadow-sm">
            <div className="space-y-2">
              {ticketDetail.attachments.map((attachment: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <FileTextOutlined className="text-blue-600" />
                  <span className="text-gray-700">{attachment.name || `Attachment ${index + 1}`}</span>
                  {attachment.size && (
                    <span className="text-xs text-gray-500">({attachment.size})</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Timeline */}
        <Card title="Ticket Timeline" className="shadow-sm">
          <Timeline>
            <Timeline.Item color="blue">
              <div className="space-y-1">
                <div className="font-semibold">Ticket Created</div>
                <div className="text-sm text-gray-600">{ticketDetail.createdAt}</div>
                <div className="text-sm text-gray-500">by {ticketDetail.name}</div>
              </div>
            </Timeline.Item>
            
            {ticketDetail.status !== 'New' && (
              <Timeline.Item color="green">
                <div className="space-y-1">
                  <div className="font-semibold">Status Updated</div>
                  <div className="text-sm text-gray-600">{ticketDetail.updatedAt}</div>
                  <div className="text-sm text-gray-500">Status changed to {ticketDetail.status}</div>
                </div>
              </Timeline.Item>
            )}
            
            {ticketDetail.assignedTo !== 'Unassigned' && (
              <Timeline.Item color="orange">
                <div className="space-y-1">
                  <div className="font-semibold">Assigned</div>
                  <div className="text-sm text-gray-600">Assigned to {ticketDetail.assignedTo}</div>
                </div>
              </Timeline.Item>
            )}
          </Timeline>
        </Card>

        {/* Actions */}
        {/* <Card title="Actions" className="shadow-sm">
          <div className="flex space-x-4">
            <Button type="primary" className="bg-blue-600">
              Update Status
            </Button>
            <Button type="default">
              Assign Ticket
            </Button>
            <Button type="default">
              Add Comment
            </Button>
            <Button type="default" danger>
              Close Ticket
            </Button>
          </div>
        </Card> */}
      </div>
    </div>
  );
}
