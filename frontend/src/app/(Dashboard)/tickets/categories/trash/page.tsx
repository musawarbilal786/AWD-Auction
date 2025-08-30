"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { ReloadOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

export default function TrashTicketCategoriesPage() {
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const handleRestore = async (categoryId: number) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.patch(
        `${apiUrl}/arbitration/api/v1/inactive-ticket-type/${categoryId}/`,
        { is_active: "True" },
        { headers }
      );
      setCategoriesData(prevCategories => prevCategories.filter(category => category.id !== categoryId));
      showSuccessToast("Category restored!", "Category");
    } catch (err: any) {
      showErrorToast(err, "Category restore");
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
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
        <Link href={`/tickets/categories/${record.key}`}>
          <span className="text-blue-700 font-semibold cursor-pointer hover:underline">{name}</span>
        </Link>
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
    if (!selectedCategoryId) return;
    setDeleteLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/arbitration/api/v1/inactive-ticket-type/${selectedCategoryId}/`, { headers });
      setCategoriesData(prevCategories => prevCategories.filter(category => category.id !== selectedCategoryId));
      showSuccessToast("Category permanently deleted!", "Category");
    } catch (err: any) {
      showErrorToast(err, "Category deletion");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedCategoryId(null);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/arbitration/api/v1/inactive-ticket-type/`, { headers });
        setCategoriesData(res.data);
        showSuccessToast('Trash categories fetched successfully!', 'Categories');
      } catch (err: any) {
        showErrorToast(err, "Trash Categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const mappedCategories = categoriesData.map((category: any) => ({
    key: category.id,
    name: category.name || category.type_name || category.title || category.category || "Unknown Category",
    systemDefault: category.is_default || category.system_default || category.is_system_default || false,
  }));

  return (
    <div className="p-6">
      <Breadcrumbs items={[
        { label: "Tickets", href: "/tickets" }, 
        { label: "Categories", href: "/tickets/categories" }, 
        { label: "Trash", href: "/tickets/categories/trash" }
      ]} />
      <DataTable columns={columns} data={mappedCategories} loading={loading} />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCategoryId(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={<span className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /> Delete Category</span>}
        description="Are you sure you want to permanently delete this category? This action cannot be undone."
      />
      <div className="flex gap-4 mt-4">
        <Link href="/tickets/categories" className="text-blue-700 hover:underline">
          View Active Records
        </Link>
      </div>
    </div>
  );
}
