"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { Button, Dropdown, Spin, Modal } from "antd";
import { SettingOutlined, DownOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

export default function TicketCategoriesPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch ticket categories from API
  const fetchTicketCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/arbitration/api/v1/ticket-type/`, { headers });
      
      // Map API response to table format
      const mappedData = (response.data || []).map((item: any, index: number) => ({
        key: item.id || index + 1,
        name: item.name || item.type_name || item.title || item.category || "Unknown Category",
        systemDefault: item.is_default || item.system_default || item.is_system_default || false,
        originalData: item
      }));
      
      setData(mappedData);
      showSuccessToast("Ticket categories loaded successfully!", "Categories");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch ticket categories.");
      showErrorToast(err, "Ticket categories");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketCategories();
  }, []);

  // Delete ticket category function
  const handleDeleteCategory = async (record: any) => {
    try {
      setDeleteLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      await axios.delete(`${apiUrl}/arbitration/api/v1/ticket-type/${record.key}/`, { 
        headers
      });
      
      showSuccessToast("Category deleted successfully!", "Category");
      fetchTicketCategories(); // Refresh the list
    } catch (error: any) {
      showErrorToast(error, "Delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirm = (record: any) => {
    Modal.confirm({
      title: 'Delete Category',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete this category?</p>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <strong>Category Name:</strong> {record.name}
          </div>
          <p className="mt-2 text-red-600 text-sm">This action cannot be undone.</p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return handleDeleteCategory(record);
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
              router.push(`/tickets/categories/${record.key}/edit`);
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
        <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Categories" }, { label: "List" }]} />
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading ticket categories...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col w-full bg-gray-50">
        <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Categories" }, { label: "List" }]} />
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-4">Error Loading Ticket Categories</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button type="primary" onClick={fetchTicketCategories}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-gray-50">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Categories" }, { label: "List" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <DataTable
          columns={columns}
          data={data}
          tableData={{
            isEnableFilterInput: true,
            selectableRows: true,
            showAddButton: true,
            addButtonLabel: "Add ",
            addButtonHref: "/tickets/categories/create",
          }}
        />
        <div className="flex gap-4 mt-4">
          <Link href="/tickets/categories/trash" className="text-blue-700 hover:underline">
            View Trash
          </Link>
        </div>
      </div>
    </div>
  );
} 