"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { Button, Dropdown, Spin, Modal } from "antd";
import { SettingOutlined, DownOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

export default function TicketStatusesPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch ticket statuses from API
  const fetchTicketStatuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/arbitration/api/v1/ticket-status/`, { headers });
      
      // Map API response to table format
      const mappedData = (response.data || []).map((item: any, index: number) => ({
        key: item.id || index + 1,
        name: item.name || item.status_name || item.title || "Unknown Status",
        color: item.color || item.color_code || "#cccccc",
        systemDefault: item.is_default || item.system_default || item.is_system_default || false,
        originalData: item
      }));
      
      setData(mappedData);
      showSuccessToast("Ticket statuses loaded successfully!", "Statuses");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch ticket statuses.");
      showErrorToast(err, "Ticket statuses");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketStatuses();
  }, []);

  // Delete ticket status function
  const handleDeleteStatus = async (record: any) => {
    try {
      setDeleteLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const payload = {
        is_active: "True"
      };
      
      await axios.delete(`${apiUrl}/arbitration/api/v1/inactive-ticket-status/${record.key}/`, { 
        headers,
        data: payload 
      });
      
      showSuccessToast("Status deleted successfully!", "Status");
      fetchTicketStatuses(); // Refresh the list
    } catch (error: any) {
      showErrorToast(error, "Delete status");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirm = (record: any) => {
    Modal.confirm({
      title: 'Delete Status',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete this status?</p>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <strong>Status Name:</strong> {record.name}
          </div>
          <p className="mt-2 text-red-600 text-sm">This action cannot be undone.</p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return handleDeleteStatus(record);
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (val: string) => (
        <span className="flex items-center gap-2">
          <span style={{ background: val, width: 18, height: 18, display: 'inline-block', borderRadius: 3, border: '1px solid #ccc' }} />
          <span>{val}</span>
        </span>
      ),
    },
    {
      title: "System Default",
      dataIndex: "systemDefault",
      key: "systemDefault",
      render: (val: boolean) => val ? "Yes" : "No",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const items = [
          {
            key: 'edit',
            label: <span className="flex items-center gap-2"><EditOutlined /> Edit</span>,
            onClick: () => {
              router.push(`/tickets/statuses/${record.key}/edit`);
            },
          },
          {
            key: 'delete',
            label: <span className="flex items-center gap-2 text-red-600"><DeleteOutlined /> Delete</span>,
            onClick: () => {
              showDeleteConfirm(record);
            },
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<span className="flex items-center gap-1"><SettingOutlined /><DownOutlined /></span>} />
          </Dropdown>
        );
      },
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col w-full bg-gray-50">
        <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Statuses" }, { label: "List" }]} />
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading ticket statuses...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col w-full bg-gray-50">
        <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Statuses" }, { label: "List" }]} />
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-4">Error Loading Ticket Statuses</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button type="primary" onClick={fetchTicketStatuses}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-gray-50">
        <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Statuses" }, { label: "List" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <DataTable
          columns={columns}
          data={data}
          tableData={{
              isEnableFilterInput: true,
              selectableRows: true,
              showAddButton: true,
              addButtonLabel: "Add ",
              addButtonHref: "/tickets/statuses/create",
            }}
          />
        </div>
    </div>
  );
} 