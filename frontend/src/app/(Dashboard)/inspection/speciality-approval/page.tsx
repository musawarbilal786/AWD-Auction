"use client";
import { useParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import axios from "axios";
import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { Button, Tag, Dropdown, Menu, Card } from "antd";
import { CheckOutlined, DeleteOutlined, DownOutlined, SettingOutlined, EyeOutlined } from "@ant-design/icons";
import ConfirmModal from "@/components/modals/ConfirmModal";
import DataTable from "@/components/common/DataTable";
import { getInspectionStatusLabel, getInspectionStatusColor } from "@/utils/inspectionStatusMapping";

export default function SpecialityApprovalPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const router = useRouter();

  // Approve handler
  const handleApprove = async (task: any) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const expected_price = task.expected_price || "0";
      await axios.patch(
        `${apiUrl}/inspections/api/v1/speciality-vehicle/${task.id}/approve/`,
        { expected_price },
        { headers }
      );
      showSuccessToast("Vehicle marked as complete!", "Speciality Approval");
      // Refresh the list after approval
      fetchTasks();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to approve vehicle.";
      showErrorToast(errorMsg, "Speciality Approval");
    }
  };

  // Delete handler
  const handleDelete = async (task: any) => {
    // TODO: Call your delete API here
    // Optionally refresh the list or show a toast
    // Example: showSuccessToast('Deleted!', 'Speciality Approval');
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.get(`${apiUrl}/inspections/api/v1/speciality-vehicle/requests/`, { headers });
      const rawData = res.data.results || res.data.data || (Array.isArray(res.data) ? res.data : []);
      
      const transformedData = rawData.map((item: any) => ({
        key: item.id.toString(),
        id: item.id,
        vehicle: item.vehicle || item.vehicle_name || 'N/A',
        status: item.status || 0,
        expected_price: item.expected_price || 0,
        // Add more fields as needed from the API response
      }));

      setData(transformedData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch data.");
      showErrorToast(err, "Speciality Approval data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Vehicle", dataIndex: "vehicle", key: "vehicle" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number | string) => (
        <Tag color={getInspectionStatusColor(status)}>{getInspectionStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const menuItems = [
          {
            key: "view",
            label: "View",
            icon: <EyeOutlined className="text-blue-600" />,
          },
          {
            key: "approve",
            label: "Approve",
            icon: <CheckOutlined className="text-green-600" />,
          },
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined className="text-red-600" />,
          },
        ];

        const handleMenuClick = (e: { key: string }) => {
          if (e.key === 'view') {
            router.push(`/inspection/speciality-approval/${record.id}`);
          }
          if (e.key === 'approve') {
            setSelectedTask(record);
            setConfirmModalOpen(true);
          }
          if (e.key === 'delete') {
            handleDelete(record);
          }
        };

        const menu = <Menu onClick={handleMenuClick} items={menuItems} />;

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

  if (error) {
    return (
      <main>
        <Breadcrumbs items={[{ label: "Inspection", href: "/inspection" }, { label: "Speciality Approval" }]} />
        <div className="p-6">
          <Card>
            <div className="text-red-500 text-center py-8">{error}</div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumbs items={[{ label: "Inspection", href: "/inspection" }, { label: "Speciality Approval" }]} />
      <div className="p-6">
        <DataTable 
          columns={columns} 
          data={data} 
          tableData={{}} 
          loading={loading} 
        />
      </div>
      <ConfirmModal
        open={confirmModalOpen}
        onOk={async () => {
          if (selectedTask) await handleApprove(selectedTask);
          setConfirmModalOpen(false);
          setSelectedTask(null);
        }}
        onCancel={() => {
          setConfirmModalOpen(false);
          setSelectedTask(null);
        }}
        title="Confirm Approval"
        content={
          <span>Are you sure you want to approve this vehicle for auction?</span>
        }
        okText="Yes, Approve"
        cancelText="Cancel"
      />
    </main>
  );
} 