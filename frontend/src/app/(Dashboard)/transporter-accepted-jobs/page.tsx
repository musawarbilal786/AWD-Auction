"use client";
import { Card, Table, Button, Tag, Space, Image, Progress, Dropdown, Modal, message } from "antd";
import { EyeOutlined, CheckCircleOutlined, MoreOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { useRouter } from "next/navigation";

export default function TransporterAcceptedJobsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const router = useRouter();
  
  const handleViewDetails = (id: string) => {
    router.push(`/transporter-accepted-jobs/${id}`);
  };

  const handleMarkAsCompleted = async () => {
    if (!selectedJobId) return;
    
    setUpdateLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Call the API to update the tracking status
      const response = await axios.patch(
        `${apiUrl}/transportation/api/v1/accepted-jobs/${selectedJobId}/`,
        { tracking_status: 6 },
        { headers }
      );
      
      if (response.data) {
        showSuccessToast("Job marked as completed successfully!", "Status Update");
        setConfirmModalVisible(false);
        setSelectedJobId(null);
        setSelectedAction(null);
        // Refresh the jobs list
        await fetchAcceptedJobs();
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to mark job as completed.";
      showErrorToast(err, "Status Update");
      message.error(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const showConfirmModal = (jobId: string, action: string) => {
    setSelectedJobId(jobId);
    setSelectedAction(action);
    setConfirmModalVisible(true);
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
    setSelectedJobId(null);
    setSelectedAction(null);
  };

  const columns = [
    {
      title: "Vehicle",
      dataIndex: "vehicle",
      key: "vehicle",
      render: (vehicle: any, record: any) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.image || "/images/dummy-profile-logo.jpg"}
            alt="vehicle"
            width={60}
            height={40}
            className="rounded"
          />
          <div>
            <div className="font-semibold">{vehicle}</div>
            <div className="text-sm text-gray-600">VIN: {record.vin}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Pickup Location",
      dataIndex: "pickup",
      key: "pickup",
      render: (pickup: any) => (
        <div>
          <div className="font-semibold">{pickup.name}</div>
          <div className="text-sm text-gray-600">{pickup.address}</div>
        </div>
      ),
    },
    {
      title: "Dropoff Location",
      dataIndex: "dropoff",
      key: "dropoff",
      render: (dropoff: any) => (
        <div>
          <div className="font-semibold">{dropoff.name}</div>
          <div className="text-sm text-gray-600">{dropoff.address}</div>
        </div>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <div className="w-32">
          <Progress percent={progress} size="small" />
          <div className="text-xs text-gray-600 mt-1">{progress}% Complete</div>
        </div>
      ),
    },
    {
      title: "Transport Fee",
      dataIndex: "transportFee",
      key: "transportFee",
      render: (fee: number) => (
        <div className="text-center">
          <div className="font-bold text-green-600">${fee}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color="green">Accepted</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const items = [
          {
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />,
            onClick: () => handleViewDetails(record.key.toString() || '')
          },
          {
            key: 'complete',
            label: 'Mark as Completed',
            icon: <CheckOutlined />,
            onClick: () => showConfirmModal(record.key.toString() || '', 'complete')
          },
          {
            key: 'cancel',
            label: 'Cancel Job',
            icon: <CloseOutlined />,
            onClick: () => showConfirmModal(record.key.toString() || '', 'cancel')
          }
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} size="small">
              Actions
            </Button>
          </Dropdown>
        );
      },
    },
  ];
  const fetchAcceptedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/transportation/api/v1/accepted-jobs/`, { headers });
      
      // Map API response to match the existing data structure
      const mappedData = (response.data || []).map((item: any, index: number) => {
        return {
          key: item.id || index + 1,
          vehicle: item.vehicle || item.vehicle_name || `${item.year || ''} ${item.make || ''} ${item.model || ''}`.trim() || 'Vehicle',
          vin: item.vin ? item.vin.slice(-6) : item.vin || '-',
          image: item.image || item.vehicle_image || "/images/car1.jpg",
          pickup: {
            name: item.pickup_location?.name || item.pickup_name || "Pickup Location",
            address: item.pickup_location?.address || item.pickup_address || "Address not available",
          },
          dropoff: {
            name: item.dropoff_location?.name || item.dropoff_name || "Dropoff Location", 
            address: item.dropoff_location?.address || item.dropoff_address || "Address not available",
          },
          progress: item.progress || item.completion_percentage || 0,
          transportFee: item.transport_fee || item.fee || 0,
          status: item.status || "In Progress",
          originalData: item, // Keep original data for actions
        };
      });
      
      setData(mappedData);
      showSuccessToast("Accepted jobs loaded successfully!", "Jobs");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch accepted jobs.");
      showErrorToast(err, "Accepted jobs");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);

  if (loading) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Accepted Jobs" }
          ]} 
        />
        <Card className="mt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading accepted jobs...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Accepted Jobs" }
          ]} 
        />
        <Card className="mt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button type="primary" onClick={fetchAcceptedJobs}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs 
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Accepted Jobs" }
        ]} 
      />
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accepted Jobs</h1>
            <p className="text-gray-600">Manage your active transportation jobs</p>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleOutlined className="text-green-600 text-xl" />
            <span className="text-lg font-semibold">{data.length} Active Jobs</span>
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          className="custom-table"
                />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title={selectedAction === 'complete' ? "Mark as Completed" : "Cancel Job"}
        open={confirmModalVisible}
        onCancel={handleCancelConfirm}
        footer={null}
        width={400}
      >
        <div className="text-center py-4">
          <p className="text-lg mb-6">
            {selectedAction === 'complete' 
              ? "Are you sure you want to mark this job as completed?" 
              : "Are you sure you want to cancel this job?"
            }
          </p>
          
          <div className="flex justify-center space-x-3">
            <Button onClick={handleCancelConfirm}>
              Cancel
            </Button>
            {selectedAction === 'complete' && (
              <Button 
                type="primary" 
                onClick={handleMarkAsCompleted}
                loading={updateLoading}
                className="bg-green-600"
              >
                Mark as Completed
              </Button>
            )}
            {selectedAction === 'cancel' && (
              <Button 
                type="primary" 
                danger
                loading={updateLoading}
              >
                Cancel Job
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

