"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import { useState } from "react";
import { Button, Dropdown, Menu, Tag } from "antd";
import { EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { showSuccessToast, showErrorToast } from "@/utils/errorHandler";

const interestMap: { [key: number]: string } = {
  1: "Sell a vehicle",
  2: "Purchase a vehicle",
  3: "Both",
};

const dummyDealerships = [
  { id: 1, dealership_name: "Shah Brother", dealership_interest: 1, email: "shah@example.com", phone_number: "1234567890", approved: 1 },
  { id: 2, dealership_name: "Marten Lobo", dealership_interest: 2, email: "marten@example.com", phone_number: "9876543210", approved: 2 },
  { id: 3, dealership_name: "Aladdin Harmon", dealership_interest: 3, email: "aladdin@example.com", phone_number: "5555555555", approved: 1 },
];

export default function DealershipsPage() {
  const [data, setData] = useState(dummyDealerships);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    setDeleteLoading(true);
    try {
      // Dummy soft delete: just remove from list
      setData(prev => prev.filter(d => d.id !== selectedId));
      showSuccessToast("Dealership deleted!", "Dealership");
    } catch (err) {
      showErrorToast(err, "Dealership deletion");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedId(null);
    }
  };

  const columns = [
    { title: "Dealer Name", dataIndex: "dealership_name", key: "dealership_name" },
    { title: "Dealer Interest", dataIndex: "dealership_interest", key: "dealership_interest", render: (v: number) => interestMap[v] || "-" },
    { title: "Contact", key: "contact", render: (_: any, record: any) => (<div>Email : {record.email || "-"}<br />Phone : {record.phone_number || "-"}</div>) },
    { title: "Approved", dataIndex: "approved", key: "approved", render: (v: number) => <Tag color={v === 1 ? "green" : v === 2 ? "default" : "red"}>{v === 1 ? "Approved" : v === 2 ? "Pending" : "Not Approved"}</Tag> },
    { title: "Action", key: "action", render: (_: any, record: any) => {
      const menu = (
        <Menu>
          <Menu.Item key="edit" icon={<EditOutlined />}><Link href={`/dealerships/dealers/${record.id}`}>Edit</Link></Menu.Item>
          <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>Delete</Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button><span className="flex items-center gap-1"><SettingOutlined /> <DownOutlined /></span></Button>
        </Dropdown>
      );
    } },
  ];

  const tableData = {
    selectableRows: true,
    isEnableFilterInput: true,
    showAddButton: true,
    addButtonLabel: "Add Dealership",
    addButtonHref: "/dealerships/dealers/add"
  };

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Dealerships", href: "/dealerships" }, { label: "List" }]} />
      <DataTable columns={columns} data={data} tableData={tableData} />
      <div className="flex gap-4 mt-4">
        <Link href="/dealerships/trash" className="text-blue-700 hover:underline">View Trash Records</Link>
        <span>|</span>
        <Link href="/dealerships" className="text-blue-700 hover:underline">View Active Records</Link>
      </div>
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedId(null); }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={<span className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /> Delete Dealership</span>}
        description="Are you sure you want to delete this dealership? This action cannot be undone."
      />
    </div>
  );
} 