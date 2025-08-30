"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { useRouter } from "next/navigation";
import { Button, Dropdown, Modal } from "antd";
import { EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

export default function ChargesSlabsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchChargesSlabs = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await axios.get(`${apiUrl}/transportation/api/v1/charges-slab/`, { headers });
      
      // Map API response to table data format - using actual API response structure
      const mappedData = (response.data || []).map((slab: any, index: number) => ({
        key: slab.id || index + 1,
        slabName: slab.name || 'N/A',
        range: `${slab.km_range_start || 0} - ${slab.km_range_end || 0} miles`,
        buyerCharges: slab.buyer_charges_per_km || 0,
        transporterCharges: slab.transporter_charges_per_km || 0,
      }));

      setData(mappedData);
      showSuccessToast('Charges slabs fetched successfully!', 'Charges Slabs');
    } catch (err: any) {
      showErrorToast(err, "Charges slabs");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slabId: number, slabName: string) => {
    setDeleting(slabId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Make the DELETE API call
      await axios.delete(`${apiUrl}/transportation/api/v1/charges-slab/${slabId}/`, { headers });
      
      showSuccessToast(COMMON_SUCCESS_MESSAGES.DELETED, "Charges Slab");
      
      // Refresh the data after successful deletion
      await fetchChargesSlabs();
    } catch (error: any) {
      showErrorToast(error, "Charges slab deletion");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      title: "Slab Name",
      dataIndex: "slabName",
      key: "slabName",
    },
    {
      title: "Range",
      dataIndex: "range",
      key: "range",
    },
    {
      title: "Buyer Charges",
      dataIndex: "buyerCharges",
      key: "buyerCharges",
      render: (val: any) => <span>${val}</span>,
    },
    {
      title: "Transporter Charges",
      dataIndex: "transporterCharges",
      key: "transporterCharges",
      render: (val: any) => <span>${val}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const items = [
          {
            key: 'edit',
            label: (
              <span className="flex items-center gap-2">
                <EditOutlined /> Edit
              </span>
            ),
            onClick: () => {
              // Navigate to edit page
              window.location.href = `/transportation/charges-slabs/${record.key}/edit`;
            },
          },
          {
            key: 'delete',
            label: (
              <span className="flex items-center gap-2 text-red-600">
                <DeleteOutlined /> Delete
              </span>
            ),
            onClick: () => {
              // Show delete confirmation
              Modal.confirm({
                title: 'Delete Charges Slab',
                content: `Are you sure you want to delete "${record.slabName}"?`,
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: () => handleDelete(record.key, record.slabName),
              });
            },
          },
        ];
        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
          >
            <Button type="text" icon={<span className="flex items-center gap-1"><SettingOutlined /><DownOutlined /></span>} />
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    fetchChargesSlabs();
  }, []);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Transportation", href: "/transportation" }, { label: "Charges Slabs" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* <h2 className="text-2xl font-bold text-sky-700 mb-4">Transportation Charges Slabs <span className="text-black font-normal">/ List</span></h2> */}
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          tableData={{
            isEnableFilterInput: true,
            showAddButton: true,
            addButtonLabel: "Add Slab",
            addButtonHref: "/transportation/charges-slabs/add",
            // selectableRows: true,
          }}
        />
        <div className="flex gap-4 mt-4">
          <a href="#" className="text-sky-700 hover:underline">View Trash Records</a>
          <a href="#" className="text-sky-700 hover:underline">View Active Records</a>
        </div>
      </div>
    </div>
  );
} 