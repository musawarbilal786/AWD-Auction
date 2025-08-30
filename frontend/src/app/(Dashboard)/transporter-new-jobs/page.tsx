"use client";
import { Card, Table, Button, Tag, Space, Image, Modal } from "antd";
import { EyeOutlined, CarOutlined, LeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import ExpandableRowContent from "@/components/common/ExpandableRowContent";
import { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

const columns = [
  {
    title: "",
    dataIndex: "image",
    key: "image",
    width: 80,
    render: (img: any, record: any) => (
      <div className="flex items-center space-x-2">
        <Image
          src={img || "/images/car1.jpg"}
          alt="vehicle"
          width={60}
          height={40}
          className="rounded"
        />
        {record.selected && <LeftOutlined className="text-blue-600" />}
      </div>
    ),
  },
  {
    title: "VIN(last six)",
    dataIndex: "vin",
    key: "vin",
    render: (vin: string) => (
      <span className="font-mono">{vin}</span>
    ),
  },
  {
    title: "Vehicle",
    dataIndex: "vehicle",
    key: "vehicle",
  },
  {
    title: "Pickup Time",
    dataIndex: "pickupTime",
    key: "pickupTime",
  },
  {
    title: "Drop Time",
    dataIndex: "dropTime",
    key: "dropTime",
  },
  {
    title: "Transport Fee",
    dataIndex: "transportFee",
    key: "transportFee",
    render: (fee: number, record: any) => (
      <div className="text-center">
        <div className="font-bold text-green-600">${fee}</div>
        <div className="text-sm text-gray-600">@ ${record.transportRate}/km</div>
      </div>
    ),
  },
];

export default function TransporterNewJobsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [acceptingJob, setAcceptingJob] = useState(false);

  const fetchNewJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/transportation/api/v1/new-jobs/`, { headers });
      
      // Map API response to match the existing data structure
      const mappedData = (response.data || []).map((item: any, index: number) => {
        return {
          key: item.id || index + 1,
          vehicle: item.vehicle || item.vehicle_name || `${item.year || ''} ${item.make || ''} ${item.model || ''}`.trim() || 'Vehicle',
          vin: item.vin ? item.vin.slice(-6) : item.vin || '-',
          image: item.image || item.vehicle_image || "/images/car1.jpg",
          pickupTime: item.pickup_time || item.pickup_date || "Not decided",
          dropTime: item.drop_time || item.drop_date || "Not decided",
          transportFee: item.transport_fee || item.fee || 0,
          transportRate: item.transport_rate || item.rate_per_km || 0,
          selected: item.selected || false,
          pickup: {
            name: item.pickup_location?.name || item.pickup_name || "Pickup Location",
            address: item.pickup_location?.address || item.pickup_address || "Address not available",
            phone: item.pickup_location?.phone || item.pickup_phone || "Phone not available",
          },
          dropoff: {
            name: item.dropoff_location?.name || item.dropoff_name || "Dropoff Location",
            address: item.dropoff_location?.address || item.dropoff_address || "Address not available",
            phone: item.dropoff_location?.phone || item.dropoff_phone || "Phone not available",
          },
          distance: item.distance || item.distance_km || 0,
          originalData: item, // Keep original data for API calls
        };
      });
      
      setData(mappedData);
      showSuccessToast("New jobs fetched successfully!", "Jobs");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch new jobs.");
      showErrorToast(err, "New jobs");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewJobs();
  }, []);

  const handleAcceptJob = (record: any) => {
    setSelectedJob(record);
    setConfirmModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedJob) return;
    
    setAcceptingJob(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Call API to accept the job
      await axios.post(`${apiUrl}/transportation/api/v1/accept-job/`, {
        job_id: selectedJob.originalData?.id || selectedJob.key
      }, { headers });
      
      showSuccessToast("Job accepted successfully!", "Job Acceptance");
      
      // Close modal and refresh data
      setConfirmModalOpen(false);
      setSelectedJob(null);
      fetchNewJobs(); // Refresh the list
      
    } catch (error: any) {
      console.error('Error accepting job:', error);
      showErrorToast(error, "Job acceptance");
    } finally {
      setAcceptingJob(false);
    }
  };

  const handleCancelAccept = () => {
    setConfirmModalOpen(false);
    setSelectedJob(null);
  };

  const renderExpandedContent = (record: any) => (
    <ExpandableRowContent expanded={expandedRowKeys.includes(record.key)}>
      <Button type="primary" className="mb-4">Details</Button>
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Pickup Location */}
        <div>
          <div className="font-bold text-blue-900 mb-2">Pickup Location</div>
          <div className="font-semibold">{record.pickup.name}</div>
          <div className="text-gray-600">{record.pickup.address}</div>
          <div className="text-gray-600">{record.pickup.phone}</div>
        </div>
        
        {/* Distance & Action */}
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            <Image src="/icons/distance.svg" alt="distance" width={60} height={60} />
          </div>
          <div className="font-bold text-blue-900 mb-1">Distance</div>
          <div className="text-lg font-semibold">{record.distance}</div>
          <Button 
            type="primary" 
            size="large" 
            className="mt-4"
            onClick={() => handleAcceptJob(record)}
          >
            Accept the Job
          </Button>
        </div>
        
        {/* Dropoff Location */}
        <div>
          <div className="font-bold text-blue-900 mb-2">Dropoff Location</div>
          <div className="font-semibold">{record.dropoff.name}</div>
          <div className="text-gray-600">{record.dropoff.address}</div>
          <div className="text-gray-600">{record.dropoff.phone}</div>
        </div>
      </div>
    </ExpandableRowContent>
  );

  const expandableConfig = {
    expandedRowRender: renderExpandedContent,
    expandedRowKeys,
    onExpand: (expanded: boolean, record: any) => {
      setExpandedRowKeys(expanded ? [record.key] : []);
    },
    rowExpandable: (record: any) => true,
  };

  if (loading) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "New Jobs" }
          ]} 
        />
        <Card className="mt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading new jobs...</p>
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
            { label: "New Jobs" }
          ]} 
        />
        <Card className="mt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button type="primary" onClick={fetchNewJobs}>
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
          { label: "New Jobs" }
        ]} 
      />
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Jobs</h1>
            <p className="text-gray-600">Browse and accept available transportation jobs</p>
          </div>
          <div className="flex items-center space-x-2">
            <CarOutlined className="text-blue-600 text-xl" />
            <span className="text-lg font-semibold">{data.length} Jobs Available</span>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={data}
          tableData={{
            isEnableFilterInput: false,
          }}
          expandable={expandableConfig}
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onCancel={handleCancelAccept}
        footer={null}
        width={400}
        centered
        className="custom-modal"
      >
        <div className="text-center py-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <ExclamationCircleOutlined className="text-white text-2xl" />
            </div>
          </div>
          
          {/* Confirmation Text */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you sure you are accepting this job?
            </h3>
            {selectedJob && (
              <div className="text-sm text-gray-600">
                <div className="font-semibold">{selectedJob.vehicle}</div>
                <div>VIN: {selectedJob.vin}</div>
                <div>Transport Fee: ${selectedJob.transportFee}</div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              type="primary"
              size="large"
              onClick={handleConfirmAccept}
              loading={acceptingJob}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yes, Confirm it!
            </Button>
            <Button
              danger
              size="large"
              onClick={handleCancelAccept}
              disabled={acceptingJob}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
