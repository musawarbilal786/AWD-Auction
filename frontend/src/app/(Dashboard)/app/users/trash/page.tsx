"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { ReloadOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

export default function TrashUsersPage() {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const role = useSelector((state: RootState) => state.user.role);

  const handleRestore = async (userId: number) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.patch(
        `${apiUrl}/users/api/v1/admin/inactive-users/${userId}/delete/`,
        { is_active: true },
        { headers }
      );
      setUsersData(prevUsers => prevUsers.filter(user => user.id !== userId));
      showSuccessToast("User restored!", "User");
    } catch (err: any) {
      showErrorToast(err, "User restore");
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = (userId: number) => {
    setSelectedUserId(userId);
    setDeleteModalOpen(true);
  };

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      render: (key: number, _: any, idx: number) => idx + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <Link href={`/app/users/${record.key}`}>
          <span className="text-blue-700 font-semibold cursor-pointer hover:underline">{name}</span>
        </Link>
      ),
    },
    {
      title: "Username",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span className="text-blue-700 cursor-pointer hover:underline">{email}</span>,
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${status === "Active" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}`}>
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const menuItems = [
          {
            key: "restore",
            icon: <ReloadOutlined />,
            label: (
              <span
                className="cursor-pointer hover:underline"
                onClick={() => handleRestore(record.key)}
              >
                Restore
              </span>
            ),
          },
          {
            key: "purge",
            icon: <DeleteOutlined />,
            label: (
              <span
                className="cursor-pointer hover:underline text-red-600"
                onClick={() => handlePurge(record.key)}
              >
                Purge
              </span>
            ),
          },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <span className="inline-flex items-center gap-1 px-3 py-1 border rounded cursor-pointer hover:bg-gray-50">
              <span className="text-blue-700"><DownOutlined /></span>
            </span>
          </Dropdown>
        );
      },
    },
  ];

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;
    setDeleteLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/users/api/v1/admin/inactive-users/${selectedUserId}/delete/`, { headers });
      setUsersData(prevUsers => prevUsers.filter(user => user.id !== selectedUserId));
      showSuccessToast("User permanently deleted!", "User");
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
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/users/api/v1/admin/inactive-users/`, { headers });
        setUsersData(res.data);
        showSuccessToast('Trash users fetched successfully!', 'Users');
      } catch (err: any) {
        showErrorToast(err, "Trash Users");
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

  if (role === "ds") return <div>Trash Users Page</div>;
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Users", href: "/app/users" }, { label: "Trash", href: "/app/users/trash" }]} />
      <DataTable columns={columns} data={mappedUsers} loading={loading} />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUserId(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={<span className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /> Delete User</span>}
        description="Are you sure you want to permanently delete this user? This action cannot be undone."
      />
      <div className="flex gap-4 mt-4">
        <Link href="/app/users" className="text-blue-700 hover:underline">
          View Active Records
        </Link>
      </div>
    </div>
  );
} 