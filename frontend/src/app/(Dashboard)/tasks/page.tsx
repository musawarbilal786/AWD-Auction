"use client";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import { Dropdown } from "antd";
import { EyeOutlined, CheckCircleOutlined, DownOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

// Status code to label mapping
const STATUS_MAP: Record<number, string> = {
  0: 'Pending',
  1: 'Waiting for speciality approval',
  2: 'Inspector Assigned',
  3: 'Inspection started',
  4: 'Inspection Completed',
  21: 'On Auction',
  20:'On Run List',
  5: 'Waiting for buyer confirmation',
  6: 'Payment pending',
  7: 'Delivered',
};

const statusColors: Record<string, string> = {
  "Inspection Completed": "bg-blue-100 text-blue-700 border-blue-300",
  "Inspection started": "bg-orange-100 text-orange-700 border-orange-300",
  "Pending": "bg-gray-100 text-gray-700 border-gray-300",
  "Waiting for speciality approval": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Inspector Assigned": "bg-purple-100 text-purple-700 border-purple-300",
  "On Auction": "bg-green-100 text-green-700 border-green-300",
  "Waiting for buyer confirmation": "bg-indigo-100 text-indigo-700 border-indigo-300",
  "Payment pending": "bg-pink-100 text-pink-700 border-pink-300",
  "Delivered": "bg-emerald-100 text-emerald-700 border-emerald-300",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const hasFetched = useRef(false);

  // API function to mark inspection as complete/reject
  const markInspectionComplete = async (inspectionId: number, status: number) => {
    setActionLoading(inspectionId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await axios.patch(
        `${apiUrl}/inspections/api/v1/inspection-report/${inspectionId}/mark-complete/`,
        { inspection_status: status },
        { headers }
      );
      
      if (status === 1) {
        showSuccessToast("Inspection accepted successfully", "Task");
      } else {
        showSuccessToast("Inspection rejected successfully", "Task");
      }
      
      // Refresh the tasks list with a small delay to ensure API has processed the update
      console.log("Refreshing tasks list after successful API call...");
      setTimeout(() => {
        fetchTasks();
      }, 500);
      
    } catch (error: any) {
      console.error("Error marking inspection:", error);
      showErrorToast(error?.response?.data?.detail || error?.message || "Failed to update inspection status", "Task");
    } finally {
      setActionLoading(null);
    }
  };

  // Fetch tasks function
  const fetchTasks = async () => {
    console.log("Fetching tasks...");
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.get(`${apiUrl}/inspections/api/v1/inspector-tasks/`, { headers });
      console.log("Tasks fetched:", res.data?.length || 0, "items");
      setTasks(res.data || []);
      showSuccessToast('Tasks fetched successfully!', 'Tasks');
    } catch (err) {
      console.error("Error fetching tasks:", err);
      showErrorToast(err, "Tasks");
    } finally {
      setLoading(false);
    }
  };

  // Columns definition inside component to access state and functions
  const columns = [
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Inspection Location", dataIndex: "location", key: "location" },
    { title: "Vehicle", dataIndex: "vehicle", key: "vehicle" },
    { title: "Expected Price", dataIndex: "price", key: "price" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number) => {
        const statusLabel = STATUS_MAP[status] || 'Unknown';
        return (
          <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${statusColors[statusLabel] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
            {statusLabel}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const handleMenuClick = ({ key }: { key: string }) => {
          switch (key) {
            case "accept":
              markInspectionComplete(record.id, 1);
              break;
            case "reject":
              markInspectionComplete(record.id, 0);
              break;
          }
        };

        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: <Link href={`/tasks/${record.id}`}>View</Link>,
          },
          {
            key: "accept",
            icon: <CheckOutlined />,
            label: <span>Accept Inspection</span>,
            disabled: actionLoading === record.id,
          },
          {
            key: "reject",
            icon: <CloseOutlined />,
            label: <span>Reject Inspection</span>,
            disabled: actionLoading === record.id,
          },
        ];
        
        if (record.status === "Inspection started") {
          menuItems.push({
            key: "mark-completed",
            icon: <CheckCircleOutlined />,
            label: <span>Mark as Completed</span>,
          });
        }
        
        return (
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["click"]}>
            <span className="inline-flex items-center gap-1 px-3 py-1 border rounded cursor-pointer hover:bg-gray-50">
              {actionLoading === record.id ? "Loading..." : "Actions"} <DownOutlined className="text-xs" />
            </span>
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTasks();
    }
  }, []);

  const mappedTasks = tasks.map((task, index) => ({
    key: task.id || index,
    id: task.id,
    vin: task.vin || 'N/A',
    location: task.inspection_location?.title || 'N/A',
    vehicle: task.vehicle ? `${task.vehicle.year} ${task.vehicle.make} ${task.vehicle.model}` : 'N/A',
    price: task.expected_price ? `$${Number(task.expected_price).toLocaleString()}` : 'N/A',
    status: task.status || 0,
  }));

  return (
    <div className="p-6">
      <DataTable columns={columns} data={mappedTasks} loading={loading} />
    </div>
  );
} 