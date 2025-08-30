"use client";
import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Tag, Image, Divider, Spin, Modal, Select, Form, message } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

interface JobDetail {
  key: string | number;
  vin: string;
  auctionId: string;
  vehicle: string;
  pickupTime: string;
  transportFee: number;
  transportRate: number;
  image: string;
  pickup: {
    name: string;
    address: string;
    gateKey?: string;
    phone: string;
    email: string;
  };
  dropoff: {
    name: string;
    address: string;
    gateKey?: string;
    phone: string;
    email: string;
  };
  distance: string;
  transporter?: {
    name: string;
    email: string;
    cell: string;
    phone: string;
    businessName?: string;
  };
  jobStatus?: string;
  vehicleDetails?: {
    year: string;
    make: string;
    model: string;
    trim: string;
    odometer: string;
    transmission: string;
    drivetrain: string;
  };
  seller?: {
    name: string;
    email: string;
    phone: string;
  };
  buyer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function AcceptedJobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchJobDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Use the specific accepted jobs endpoint with the job ID
      const response = await axios.get(`${apiUrl}/transportation/api/v1/accepted-jobs/${params.id}/`, { headers });
      
      const job = response.data;
      
      if (!job) {
        throw new Error('Job not found');
      }

      // Map the job data to our interface
      const mappedJob: JobDetail = {
        key: job.id || params.id,
        vin: job.request_id?.vin ? job.request_id.vin.slice(-6) : 'N/A',
        auctionId: job.auction_id || job.request_id?.auction_id || 'N/A',
        vehicle: `${job.request_id?.year || ''} ${job.request_id?.make || ''} ${job.request_id?.model || ''}`.trim() || 'N/A',
        pickupTime: job.pickup_time || "Not decided",
        transportFee: job.transport_charges || 0,
        transportRate: job.charges_per_mile || 0,
        image: "/images/dummy-profile-logo.jpg", // Default image since not in API
        pickup: {
          name: job.request_id?.inspection_location?.title || "Pickup Location",
          address: job.request_id?.inspection_location?.address || "Address not available",
          gateKey: job.seller_dual_gate_key || "N/A",
          phone: job.request_id?.inspection_location?.phone || "N/A",
          email: job.request_id?.inspection_location?.email || "N/A"
        },
        dropoff: {
          name: job.drop_location?.title || "Dropoff Location",
          address: job.drop_location?.address || "Address not available",
          gateKey: job.buyer_dual_gate_key || "N/A",
          phone: job.drop_location?.phone || "N/A",
          email: job.drop_location?.email || "N/A"
        },
        distance: job.distance || "0 m",
        transporter: {
          name: `${job.transporter_id?.first_name || ''} ${job.transporter_id?.last_name || ''}`.trim() || "N/A",
          email: job.transporter_id?.email || "N/A",
          cell: job.transporter_id?.cell_number || "N/A",
          phone: job.transporter_id?.phone_number || "N/A",
          businessName: job.transporter_id?.business_name || undefined
        },
        jobStatus: job.status === 1 ? "Active" : "Inactive",
        vehicleDetails: {
          year: job.request_id?.year || "N/A",
          make: job.request_id?.make || "N/A",
          model: job.request_id?.model || "N/A",
          trim: job.request_id?.trim || "N/A",
          odometer: job.request_id?.odometer || "N/A",
          transmission: job.request_id?.transmission || "N/A",
          drivetrain: job.request_id?.drivetrain || "N/A"
        },
        seller: {
          name: job.request_id?.dealer?.dealership_name || "N/A",
          email: job.request_id?.dealer?.email || "N/A",
          phone: job.request_id?.dealer?.phone_number || "N/A"
        },
        buyer: {
          name: job.buyer_id?.dealership_name || "N/A",
          email: job.buyer_id?.email || "N/A",
          phone: job.buyer_id?.phone_number || "N/A"
        }
      };

      setJobDetail(mappedJob);
      showSuccessToast("Job details loaded successfully!", "Job Details");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to fetch job details.";
      setError(errorMessage);
      showErrorToast(err, "Job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchJobDetail();
    }
  }, [params.id]);

  const handleUpdateStatus = async (values: { status: number }) => {
    // Only allow "Completed" status for now
    if (values.status !== 3) {
      message.warning("Only 'Completed' status is currently available for updates.");
      return;
    }

    setUpdateLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Call the API to update the tracking status
      const response = await axios.patch(
        `${apiUrl}/transportation/api/v1/accepted-jobs/${params.id}/`,
        { tracking_status: 6 },
        { headers }
      );
      
      if (response.data) {
        showSuccessToast("Job status updated successfully!", "Status Update");
        setUpdateModalVisible(false);
        form.resetFields();
        // Refresh the job details
        await fetchJobDetail();
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to update job status.";
      showErrorToast(err, "Status Update");
      message.error(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const showUpdateModal = () => {
    setUpdateModalVisible(true);
    form.setFieldsValue({ status: 3 }); // Set to "Completed" by default
  };

  const handleCancelUpdate = () => {
    setUpdateModalVisible(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Accepted Jobs", href: "/transporter-accepted-jobs" },
            { label: "Job Details" }
          ]} 
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spin size="large" />
            <p className="text-gray-600 mt-4">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !jobDetail) {
    return (
      <div>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Accepted Jobs", href: "/transporter-accepted-jobs" },
            { label: "Job Details" }
          ]} 
        />
        <Card className="mt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error || "Job not found"}</p>
            <Button type="primary" onClick={() => router.back()}>
              Go Back
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
          { label: "Accepted Jobs", href: "/transporter-accepted-jobs" },
          { label: `Job #${jobDetail.key}` }
        ]} 
      />
      
      <div className="mt-6 space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.back()}
                type="text"
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
                <p className="text-gray-600">Job ID: {jobDetail.key}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Tag color="green" className="text-lg px-4 py-2">
                {jobDetail.jobStatus}
              </Tag>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={showUpdateModal}
                className="bg-blue-600"
              >
                Update Tracking Status
              </Button>
            </div>
          </div>
        </Card>

                {/* Vehicle Information */}
        <Card title="Vehicle Information" className="shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <Image
                src={jobDetail.image}
                alt="Vehicle"
                width={300}
                height={200}
                className="rounded-lg"
                fallback="/images/dummy-profile-logo.jpg"
              />
            </div>
            <div className="md:w-2/3">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Vehicle">{jobDetail.vehicle}</Descriptions.Item>
                <Descriptions.Item label="VIN (last 6)">{jobDetail.vin}</Descriptions.Item>
                <Descriptions.Item label="Auction ID">{jobDetail.auctionId}</Descriptions.Item>
                <Descriptions.Item label="Distance">{jobDetail.distance}</Descriptions.Item>
                <Descriptions.Item label="Year">{jobDetail.vehicleDetails?.year}</Descriptions.Item>
                <Descriptions.Item label="Make">{jobDetail.vehicleDetails?.make}</Descriptions.Item>
                <Descriptions.Item label="Model">{jobDetail.vehicleDetails?.model}</Descriptions.Item>
                <Descriptions.Item label="Trim">{jobDetail.vehicleDetails?.trim}</Descriptions.Item>
                <Descriptions.Item label="Odometer">{jobDetail.vehicleDetails?.odometer}</Descriptions.Item>
                <Descriptions.Item label="Transmission">{jobDetail.vehicleDetails?.transmission}</Descriptions.Item>
                <Descriptions.Item label="Drivetrain">{jobDetail.vehicleDetails?.drivetrain}</Descriptions.Item>
                <Descriptions.Item label="Pickup Time">{jobDetail.pickupTime}</Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card title="Financial Information" className="shadow-sm">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Transport Fee">
              <span className="text-green-600 font-bold text-lg">${jobDetail.transportFee}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Rate per km">
              <span className="text-blue-600 font-semibold">${jobDetail.transportRate}/km</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Location */}
          <Card title="Pickup Location" className="shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <EnvironmentOutlined className="text-blue-600" />
                <span className="font-semibold">{jobDetail.pickup.name}</span>
              </div>
              <p className="text-gray-700">{jobDetail.pickup.address}</p>
              <div className="flex items-center space-x-2 mt-2">
                <PhoneOutlined className="text-blue-600" />
                <span>{jobDetail.pickup.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MailOutlined className="text-blue-600" />
                <span>{jobDetail.pickup.email}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Gate Key</p>
                <p className="text-2xl font-bold text-green-600 tracking-widest">
                  {jobDetail.pickup.gateKey}
                </p>
              </div>
            </div>
          </Card>

          {/* Dropoff Location */}
          <Card title="Dropoff Location" className="shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <EnvironmentOutlined className="text-green-600" />
                <span className="font-semibold">{jobDetail.dropoff.name}</span>
              </div>
              <p className="text-gray-700">{jobDetail.dropoff.address}</p>
              <div className="flex items-center space-x-2 mt-2">
                <PhoneOutlined className="text-green-600" />
                <span>{jobDetail.dropoff.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MailOutlined className="text-green-600" />
                <span>{jobDetail.dropoff.email}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Gate Key</p>
                <p className="text-2xl font-bold text-green-600 tracking-widest">
                  {jobDetail.dropoff.gateKey}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Seller and Buyer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seller Information */}
          {jobDetail.seller && (
            <Card title="Seller Information" className="shadow-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-blue-900">{jobDetail.seller.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MailOutlined className="text-blue-600" />
                    <span>{jobDetail.seller.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneOutlined className="text-green-600" />
                    <span>{jobDetail.seller.phone}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button type="primary" size="small" className="bg-blue-600">
                    Contact Seller
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Buyer Information */}
          {jobDetail.buyer && (
            <Card title="Buyer Information" className="shadow-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-green-900">{jobDetail.buyer.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MailOutlined className="text-blue-600" />
                    <span>{jobDetail.buyer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneOutlined className="text-green-600" />
                    <span>{jobDetail.buyer.phone}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button type="primary" size="small" className="bg-green-600">
                    Contact Buyer
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Transporter Information */}
        {jobDetail.transporter && (
          <Card title="Transporter Information" className="shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">{jobDetail.transporter.name}</h4>
                {jobDetail.transporter.businessName && (
                  <p className="text-gray-600 mb-3">{jobDetail.transporter.businessName}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MailOutlined className="text-blue-600" />
                    <span>{jobDetail.transporter.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneOutlined className="text-green-600" />
                    <span>{jobDetail.transporter.cell}</span>
                  </div>
                  {jobDetail.transporter.phone && (
                    <div className="flex items-center space-x-2">
                      <PhoneOutlined className="text-gray-600" />
                      <span>{jobDetail.transporter.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Button type="primary" size="large" className="bg-blue-600">
                  Contact Transporter
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal
        title="Update Tracking Status"
        open={updateModalVisible}
        onCancel={handleCancelUpdate}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStatus}
          initialValues={{ status: 3 }}
        >
          <Form.Item
            label="Tracking Status"
            name="status"
            rules={[{ required: true, message: 'Please select a tracking status' }]}
          >
            <Select
              placeholder="Select status"
              size="large"
              options={[
                { value: 1, label: 'Active' },
                { value: 2, label: 'In Progress' },
                { value: 6, label: 'Completed' },
                { value: 4, label: 'Cancelled' },
                { value: 5, label: 'On Hold' }
              ]}
            />
          </Form.Item>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button onClick={handleCancelUpdate}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={updateLoading}
              className="bg-blue-600"
            >
              Update Tracking Status
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
