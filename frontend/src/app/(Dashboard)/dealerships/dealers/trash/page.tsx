"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Tag } from "antd";
import { ReloadOutlined, DeleteOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { showSuccessToast, showErrorToast } from "@/utils/errorHandler";
import axios from "axios";

const interestMap: Record<string, string> = {
  1: "Sell a vehicle",
  2: "Purchase a vehicle",
  3: "Both",
};

export default function TrashedDealersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleRestore = async (id: number) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.patch(
        `${apiUrl}/users/api/v1/admin/inactive-dealership/${id}/delete/`,
        { is_active: true },
        { headers }
      );
      setData(prev => prev.filter(d => d.id !== id));
      showSuccessToast("Dealer restored!", "Dealer");
    } catch (err) {
      showErrorToast(err, "Dealer restore");
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = (id: number) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/users/api/v1/admin/inactive-dealership/${selectedId}/delete/`, { headers });
      setData(prev => prev.filter(d => d.id !== selectedId));
      showSuccessToast("Dealer permanently deleted!", "Dealer");
    } catch (err) {
      showErrorToast(err, "Dealer deletion");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    const fetchTrashedDealers = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/users/api/v1/admin/inactive-dealership/`, { headers });
        setData(res.data);
        showSuccessToast('Trashed dealers fetched successfully!', 'Dealers');
      } catch (err) {
        showErrorToast(err, "Trashed Dealers");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrashedDealers();
  }, []);

  const columns = [
    { title: "Dealer Name", dataIndex: "dealership_name", key: "dealership_name" },
    { title: "Dealer Interest", dataIndex: "dealership_interest", key: "dealership_interest", render: (v: number) => interestMap[String(v)] || "-" },
    { title: "Contact", key: "contact", render: (_: any, record: any) => (<div>Email : {record.email || "-"}<br />Phone : {record.phone_number || "-"}</div>) },
    { title: "Approved", dataIndex: "approved", key: "approved", render: (v: number) => <Tag color={v === 1 ? "green" : v === 2 ? "default" : "red"}>{v === 1 ? "Approved" : v === 2 ? "Pending" : "Not Approved"}</Tag> },
    { title: "Action", key: "action", render: (_: any, record: any) => {
      const menu = (
        <Menu>
          <Menu.Item key="restore" icon={<ReloadOutlined />} onClick={() => handleRestore(record.id)}>Restore</Menu.Item>
          <Menu.Item key="purge" icon={<DeleteOutlined />} danger onClick={() => handlePurge(record.id)}>Purge</Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button><span className="flex items-center gap-1"><SettingOutlined /> <DownOutlined /></span></Button>
        </Dropdown>
      );
    } },
  ];

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Dealerships", href: "/dealerships" }, { label: "Dealers", href: "/dealerships/dealers" }, { label: "Trashed Dealers" }]} />
      <DataTable columns={columns} data={data} loading={loading} />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedId(null); }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={<span className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /> Delete Dealer</span>}
        description="Are you sure you want to permanently delete this dealer? This action cannot be undone."
      />
      <div className="flex gap-4 mt-4">
        <Link href="/dealerships/dealers" className="text-blue-700 hover:underline">View Active Dealers</Link>
      </div>
    </div>
  );
} 