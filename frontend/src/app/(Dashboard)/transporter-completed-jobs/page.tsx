"use client";
import { Card, Table, Button, Tag, Space, Image } from "antd";
import { EyeOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

const columns = [
  {
    title: "Vehicle",
    dataIndex: "vehicle",
    key: "vehicle",
    render: (vehicle: any, record: any) => (
      <div className="flex items-center space-x-3">
        <Image
          src={record.image || "/images/car1.jpg"}
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
    title: "Route",
    dataIndex: "route",
    key: "route",
    render: (route: any) => (
      <div>
        <div className="text-sm">{route.from} → {route.to}</div>
        <div className="text-xs text-gray-500">{route.distance} km</div>
      </div>
    ),
  },
  {
    title: "Completed Date",
    dataIndex: "completedDate",
    key: "completedDate",
  },
  {
    title: "Duration",
    dataIndex: "duration",
    key: "duration",
    render: (duration: string) => (
      <div className="text-center">
        <div className="font-semibold">{duration}</div>
        <div className="text-xs text-gray-600">Total Time</div>
      </div>
    ),
  },
  {
    title: "Earnings",
    dataIndex: "earnings",
    key: "earnings",
    render: (earnings: number) => (
      <div className="text-center">
        <div className="font-bold text-green-600">${earnings}</div>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag color="green">Completed</Tag>
    ),
  },
  // {
  //   title: "Action",
  //   key: "action",
  //   render: (_: any, record: any) => (
  //     <Space>
  //       <Button type="primary" icon={<EyeOutlined />} size="small">
  //         View Details
  //       </Button>
  //       <Button type="default" size="small">
  //         Download Receipt
  //       </Button>
  //     </Space>
  //   ),
  // },
];

export default function TransporterCompletedJobsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/transportation/api/v1/completed-jobs/`, { headers });
      
      // Map API response to match the existing data structure
      const mappedData = (response.data || []).map((item: any, index: number) => {
        // Format dates
        const completedDate = item.completed_date || item.completion_date ? 
          new Date(item.completed_date || item.completion_date).toLocaleDateString() : 
          'N/A';
        
        // Calculate duration if start and end dates are available
        let duration = item.duration || 'N/A';
        if (item.start_date && (item.completed_date || item.completion_date)) {
          const start = new Date(item.start_date);
          const end = new Date(item.completed_date || item.completion_date);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          duration = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        }

        return {
          key: item.id || index + 1,
          vehicle: item.vehicle || item.vehicle_name || `${item.year || ''} ${item.make || ''} ${item.model || ''}`.trim() || 'Vehicle',
          vin: item.vin ? item.vin.slice(-6) : item.vin || '-',
          image: item.image || item.vehicle_image || "/images/car1.jpg",
          route: {
            from: item.pickup_location?.name || item.pickup_name || item.from_location || "Pickup Location",
            to: item.dropoff_location?.name || item.dropoff_name || item.to_location || "Dropoff Location",
            distance: item.distance || item.distance_km || 0
          },
          completedDate: completedDate,
          duration: duration,
          earnings: item.earnings || item.transport_fee || item.fee || 0,
          status: item.status || "Completed",
          originalData: item, // Keep original data for actions
        };
      });
      
      setData(mappedData);
      showSuccessToast("Completed jobs loaded successfully!", "Jobs");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch completed jobs.");
      showErrorToast(err, "Completed jobs");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

  if (loading) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Completed Jobs" }
          ]} 
        />
        <Card className="mt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading completed jobs...</p>
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
            { label: "Completed Jobs" }
          ]} 
        />
        <Card className="mt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button type="primary" onClick={fetchCompletedJobs}>
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
          { label: "Completed Jobs" }
        ]} 
      />
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Completed Jobs</h1>
            <p className="text-gray-600">View your completed transportation jobs</p>
          </div>
          <div className="flex items-center space-x-2">
            <SafetyCertificateOutlined className="text-green-600 text-xl" />
            <span className="text-lg font-semibold">{data.length} Completed Jobs</span>
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
    </div>
  );
}
