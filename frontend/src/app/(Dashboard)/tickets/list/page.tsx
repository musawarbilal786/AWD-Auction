"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { Button, Dropdown, Tag, Spin } from "antd";
import { SettingOutlined, DownOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

export default function TicketListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/arbitration/api/v1/tickets/`, { headers });
      
      // Map API response to table format
      const mappedData = (response.data || []).map((item: any, index: number) => ({
        key: item.id || index + 1,
        ticketNo: item.id || `TKT-${index + 1}`,
        updated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "N/A",
        name: item.name || "N/A",
        email: item.email || "N/A",
        auctionId: item.auction_id || "N/A",
        subject: item.subject || "No subject",
        message: item.message || "No message",
        status: item.status?.name || "New",
        statusColor: item.status?.color || "default",
        priority: item.priority || "2",
        category: item.category_id?.name || "N/A",
        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A",
        originalData: item
      }));
      
      setData(mappedData);
      showSuccessToast("Tickets loaded successfully!", "Tickets");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch tickets.");
      showErrorToast(err, "Tickets");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const columns = [
    {
      title: "Ticket No",
      dataIndex: "ticketNo",
      key: "ticketNo",
      render: (val: string) => <span className="font-semibold text-blue-700 cursor-pointer">{val}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (val: string) => (
        <Tag color="blue">{val}</Tag>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (val: string) => (
        <span className="flex items-center gap-2"><UserOutlined className="text-yellow-600" /> {val}</span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (val: string, record: any) => (
        <div>
          <div className="font-semibold">{val}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Auction ID",
      dataIndex: "auctionId",
      key: "auctionId",
      render: (val: string) => (
        <span className="font-mono text-sm">{val}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: string, record: any) => {
        return <Tag color={record.statusColor || "default"}>{val}</Tag>;
      },
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      render: (val: string) => (
        <div className="text-sm">
          <div>{val}</div>
          <div className="text-xs text-gray-500">Updated</div>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const items = [
          {
            key: 'view',
            label: (
              <span className="flex items-center gap-2"><EyeOutlined /> View Details</span>
            ),
            onClick: () => {
              // Pass the ticket data through URL state
              const ticketData = encodeURIComponent(JSON.stringify(record));
              router.push(`/tickets/list/${record.key}?data=${ticketData}`);
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

  // Loading and error handling in the render
  if (loading) {
    return (
      <div className="p-6">
        <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "List" }]} />
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "List" }]} />
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-4">Error Loading Tickets</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button type="primary" onClick={fetchTickets}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "List" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <DataTable
          columns={columns}
          data={data}
          tableData={{
            isEnableFilterInput: true,
            selectableRows: true,
          }}
        />
      </div>
    </div>
  );
} 