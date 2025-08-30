"use client";

import { Table, Card, Button, Input, Space, Dropdown, Modal } from "antd";
import { SearchOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, FileSearchOutlined, DownOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect, useState } from "react";
import axios from "axios";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import { getUserColumns } from "@/components/common/userColumns";

const UsersPage = () => {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const role = useSelector((state: RootState) => state.user.role);

  const handleDelete = (userId: number) => {
    setSelectedUserId(userId);
    setDeleteModalOpen(true);
  };

  const columns = getUserColumns(handleDelete);

  const tableData = { 
    selectableRows: true,
    isEnableFilterInput: true,
    showAddButton: true, 
    addButtonLabel: "Add New User", 
    addButtonHref: "/app/users/add"
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;
    
    setDeleteLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/users/api/v1/admin/user/${selectedUserId}/`, { headers });
      
      // Remove the deleted user from the state
      setUsersData(prevUsers => prevUsers.filter(user => user.id !== selectedUserId));
      
      // Show success message
      showSuccessToast(COMMON_SUCCESS_MESSAGES.DELETED, 'User');
    } catch (err: any) {
      showErrorToast(err, "User deletion");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedUserId(null);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/users/api/v1/admin/users-list/`, { headers });
        setUsersData(res.data);
        showSuccessToast('Users fetched successfully!', 'Users');
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch users.");
        showErrorToast(err, "Users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const mappedUsers = usersData.map((u: any) => ({
    key: u.id,
    name: u.full_name,
    email: u.email,
    mobile: u.mobile_no,
    role: u.role?.name,
    status: u.status === 1 ? "Active" : "Inactive",
  }));

  if (role === "ds") return <div>Users Page</div>;
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Users", href: "/app/users" }]} />
        <DataTable columns={columns} data={mappedUsers} tableData={tableData} loading={loading} />
        <div className="flex gap-4 mt-4">
          <Link href="/app/users/trash" className="text-blue-700 hover:underline">
            View Trash Records
          </Link>
          <span>|</span>
          <Link href="/app/users" className="text-blue-700 hover:underline">
            View Active Records
          </Link>
        </div>
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedUserId(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
          title={<span className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /> Delete User</span>}
          description="Are you sure you want to delete this user? This action cannot be undone."
        />
    </div>
  );
};

export default UsersPage; 