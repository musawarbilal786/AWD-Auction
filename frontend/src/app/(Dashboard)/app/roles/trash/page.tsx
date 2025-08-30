"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { ReloadOutlined, DeleteOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

const statusColors: Record<string, string> = {
  "Active": "bg-green-100 text-green-700 border-green-300",
  "Inactive": "bg-red-100 text-red-700 border-red-300",
};

const typeColors: Record<string, string> = {
  "Fixed": "bg-blue-900 text-white border-blue-700",
  "Flexible": "bg-gray-100 text-gray-700 border-gray-300",
};

export default function TrashRolesPage() {
  const [rolesData, setRolesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const role = useSelector((state: RootState) => state.user.role);

  const handleRestore = async (roleId: number) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.patch(
        `${apiUrl}/users/api/v1/admin/inactive-role/${roleId}/delete/`,
        { is_active: true },
        { headers }
      );
      setRolesData(prevRoles => prevRoles.filter(role => role.id !== roleId));
      showSuccessToast("Role restored!", "Role");
    } catch (err: any) {
      showErrorToast(err, "Role restore");
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = (roleId: number) => {
    setSelectedRoleId(roleId);
    setDeleteModalOpen(true);
  };

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      render: (key: number, _: any, idx: number) => idx + 1,
      width: 48,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <Link href={`/app/roles/${record.key}`}>
          <span className="text-blue-700 cursor-pointer hover:underline">{name}</span>
        </Link>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <span className={`inline-block px-3 py-1 rounded font-semibold border text-xs ${typeColors[type] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{type}</span>
      ),
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`inline-block px-3 py-1 rounded font-semibold border text-xs ${statusColors[status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{status}</span>
      ),
      width: 100,
    },
    {
      title: "Action",
      key: "action",
      align: "center" as const,
      width: 80,
      render: (_: any, record: any) => {
        const menuItems = [
          {
            key: "restore",
            icon: <ReloadOutlined className="text-green-600" />,
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
            icon: <DeleteOutlined className="text-red-600" />,
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
            <span className="inline-flex items-center gap-1 px-2 py-1 border rounded cursor-pointer hover:bg-gray-50">
              <SettingOutlined className="text-blue-700" />
              <DownOutlined className="text-blue-700" />
            </span>
          </Dropdown>
        );
      },
    },
  ];

  const handleConfirmDelete = async () => {
    if (!selectedRoleId) return;
    setDeleteLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/users/api/v1/admin/inactive-role/${selectedRoleId}/delete/`, { headers });
      setRolesData(prevRoles => prevRoles.filter(role => role.id !== selectedRoleId));
      showSuccessToast("Role permanently deleted!", "Role");
    } catch (err: any) {
      showErrorToast(err, "Role deletion");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedRoleId(null);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/users/api/v1/admin/inactive-role/`, { headers });
        // Filter for inactive roles only
        const inactiveRoles = res.data;
        setRolesData(inactiveRoles);
        showSuccessToast('Trash roles fetched successfully!', 'Roles');
      } catch (err: any) {
        showErrorToast(err, "Trash Roles");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const mappedRoles = rolesData.map((r: any) => ({
    key: r.id,
    name: r.name,
    type: r.is_fixed ? "Fixed" : "Flexible",
    status: r.status === 1 ? "Active" : "Inactive",
  }));

  if (role === "ds") return <div>Trash Roles Page</div>;
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Roles", href: "/app/roles" }, { label: "Trash", href: "/app/roles/trash" }]} />
      <DataTable columns={columns} data={mappedRoles} loading={loading} />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedRoleId(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={<span className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /> Delete Role</span>}
        description="Are you sure you want to permanently delete this role? This action cannot be undone."
      />
      <div className="flex gap-4 mt-4">
        <Link href="/app/roles" className="text-blue-700 hover:underline">
          View Active Records
        </Link>
      </div>
    </div>
  );
} 