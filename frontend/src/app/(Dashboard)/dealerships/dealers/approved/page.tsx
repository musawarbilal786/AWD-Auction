"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Card, Button, Dropdown, Menu, Tag, Modal } from "antd";
import { EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { showErrorToast, COMMON_ERROR_MESSAGES, showSuccessToast } from "@/utils/errorHandler";

const interestMap: Record<string, string> = {
  1: "Sell a vehicle",
  2: "Purchase a vehicle",
  3: "Both",
};

export default function DealersApprovedPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDealers = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const res = await axios.get(`${apiUrl}/users/api/v1/dealership/?approved=1`, { headers });
        setData(res.data.results || res.data);
      } catch (error) {
        showErrorToast(error, "Approved dealers");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDealers();
  }, []);

  const handleDelete = (dealerId: number) => {
    setSelectedDealerId(dealerId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDealerId) return;
    setDeleteLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${apiUrl}/users/api/v1/dealership/${selectedDealerId}/`, { headers });
      setData(prev => prev.filter((dealer: any) => dealer.id !== selectedDealerId));
      showSuccessToast("Dealer deleted successfully!", "Dealer");
    } catch (err: any) {
      showErrorToast(err, "Dealer deletion");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedDealerId(null);
    }
  };

  const columns = [
    {
      title: "Dealer Name",
      dataIndex: "dealership_name",
      key: "dealership_name",
    },
    {
      title: "Dealer Interest",
      dataIndex: "dealership_interest", 
      key: "dealership_interest",
      render: (value: number) => interestMap[String(value)] || "-",
    },
    {
      title: "Contact",
      key: "contact",
      render: (_: any, record: any) => (
        <div>
          Email : {record.email || "-"}<br />
          Phone : {record.phone_number || "-"}
        </div>
      ),
    },
    {
      title: "Approved",
      dataIndex: "approved",
      key: "approved",
      render: () => <Tag color="green">Approved</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const menu = (
          <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />}>
              <Link href={`/dealerships/dealers/${record.id}`}>Edit</Link>
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
              Delete
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button>
              <span className="flex items-center gap-1">
                <SettingOutlined /> <DownOutlined />
              </span>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const tableData = { 
    selectableRows: true,
    isEnableFilterInput: true,
    showAddButton: true, 
    addButtonLabel: "Add New User", 
    addButtonHref: "/dealerships/dealers/add"
  };
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Dealerships", href: "/dealerships" },
          { label: "Dealers", href: "/dealerships/dealers" },
          { label: "Approved" }
        ]}
      />
      <div className="p-6">
        <DataTable columns={columns} data={data} tableData={tableData} loading={loading} />
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedDealerId(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
          title={<span className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /> Delete Dealer</span>}
          description="Are you sure you want to delete this dealer? This action cannot be undone."
        />
      </div>
      <div className="flex gap-4 mt-4">
        <Link href="/dealerships/dealers/trash" className="text-blue-700 hover:underline">View Trashed Dealers</Link>
        <span>|</span>
        <Link href="/dealerships/dealers/approved" className="text-blue-700 hover:underline">View Active Dealers</Link>
      </div>
    </div>
  );
} 