"use client";
import { useState, useEffect } from "react";
import { Card, Tabs, Button, Modal, Form, Select, Upload, message, Input } from "antd";
import { CheckCircleTwoTone, CarOutlined, FileTextOutlined, DollarOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, UploadOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

const { TextArea } = Input;
import DataTable from "@/components/common/DataTable";
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
  20: 'On Run List',
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

interface WonBid {
  key: string;
  auctionId: string;
  wonAt: string;
  expectedPrice: number;
  wonPrice: number;
  reservePrice: number | null;
  vehicleInfo: string;
  vin: string;
  stockNo: string;
  odometer: string;
  originalData?: any;
  status: number;
  statusLabel: string;
}

// --- Modal Components ---
function ArbitrationFormModal({
  visible,
  onCancel,
  onSubmit,
  loading,
  auctionData
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading: boolean;
  auctionData: WonBid;
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...values, attachments: fileList });
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const uploadProps = {
    beforeUpload: () => false,
    multiple: true,
    fileList,
    onChange: handleUploadChange,
    accept: '.png,.jpg,.jpeg,.pdf,.doc,.docx',
  };

  return (
    <Modal
      title="Arbitration Form"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Submit Now
        </Button>,
      ]}
      width={800}
    >
      {/* Note about Oil Leak */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <ExclamationCircleOutlined className="text-yellow-600 mr-2" />
          <span className="text-yellow-800 font-medium">Oil Leak is not acceptable for arbitration</span>
        </div>
      </div>

      <Form form={form} layout="vertical" 
            initialValues={{
              name: `${auctionData.originalData?.request_id?.buyer_id?.first_name || ''} ${auctionData.originalData?.request_id?.buyer_id?.last_name || ''}`.trim() || 'N/A',
              email: auctionData.originalData?.request_id?.buyer_id?.email || 'N/A',
              subject: `Arbitration Request for VIN ${auctionData.vin} - ${auctionData.originalData?.request_id?.year || ''} ${auctionData.originalData?.request_id?.make || ''} ${auctionData.originalData?.request_id?.model || ''}`.trim()
            }}>
        <Form.Item
          label="Name"
          name="name"
        >
          <Input disabled className="disabled-input" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
        >
          <Input disabled className="disabled-input" />
        </Form.Item>

        <Form.Item
          label="Subject"
          name="subject"
        >
          <Input disabled className="disabled-input" />
        </Form.Item>

        <Form.Item
          label="Define Issues"
          name="issues"
          rules={[{ required: true, message: 'Please describe the issues' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Please describe the issues you encountered with the vehicle..."
          />
        </Form.Item>

        <Form.Item label="Upload Evidence (Images/Videos of the issue)">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>
              Drag 'n' drop evidence files here, or click to select files
            </Button>
          </Upload>
          <div className="text-xs text-gray-500 mt-1">
            Upload clear photos or videos showing the specific issue with the vehicle
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

function TransportationBookingModal({
  visible,
  onCancel,
  onConfirm,
  loading,
  auctionData,
  locations
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (values: any) => void;
  loading: boolean;
  auctionData: WonBid;
  locations: any[];
}) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title="Book Transportation"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" loading={loading} onClick={handleSubmit}>
          Book Transportation
        </Button>,
      ]}
      width={700}
    >
      <div className="py-4">
        <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <p className="text-gray-900 font-semibold">{auctionData.vehicleInfo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
              <p className="text-gray-900 font-mono">{auctionData.vin}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auction ID</label>
              <p className="text-gray-900 font-mono">{auctionData.auctionId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Winning Bid</label>
              <p className="text-green-600 font-bold">${auctionData.wonPrice?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Pickup Location"
              name="pickup_location"
              rules={[{ required: true, message: 'Please select pickup location' }]}
            >
              <Select
                placeholder="Select pickup location"
                showSearch
                optionFilterProp="children"
                options={locations.map((location: any) => ({
                  label: location.address,
                  value: location.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Drop Location"
              name="drop_location"
              rules={[{ required: true, message: 'Please select drop location' }]}
            >
              <Select
                placeholder="Select drop location"
                showSearch
                optionFilterProp="children"
                options={locations.map((location: any) => ({
                  label: location.address,
                  value: location.id,
                }))}
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

function TransportationConfirmModal({
  visible,
  onCancel,
  onConfirm,
  loading,
  auctionData
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (values: { attachment: UploadFile }) => void;
  loading: boolean;
  auctionData: WonBid;
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length > 0) {
        onConfirm({ attachment: fileList[0] });
      } else {
        message.error('Please upload an attachment');
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const uploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    maxCount: 1,
    fileList,
    onChange: handleUploadChange,
    accept: '.png,.jpg,.jpeg,.pdf,.doc,.docx',
  };

  return (
    <Modal
      title="Transportation Not Required"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          No, Cancel
        </Button>,
        <Button key="confirm" type="primary" loading={loading} onClick={handleSubmit}>
          Yes, I'll get the vehicle myself
        </Button>,
      ]}
      width={600}
    >
      <div className="py-4">
        <p className="text-lg text-gray-800 mb-4">
          Are you sure you will get the vehicle yourself?
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Vehicle:</span> {auctionData.vehicleInfo}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">VIN:</span> {auctionData.vin}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Auction ID:</span> {auctionData.auctionId}
          </p>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="Upload Attachment"
            name="attachment"
            rules={[{ required: true, message: 'Please upload an attachment' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} className="w-full">
                Click to Upload Attachment
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

function ConfirmationModal({ 
  visible, 
  onCancel, 
  onConfirm, 
  loading, 
  auctionData, 
  locations 
}: { 
  visible: boolean; 
  onCancel: () => void; 
  onConfirm: (values: any) => void; 
  loading: boolean; 
  auctionData: WonBid; 
  locations: any[]; 
}) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title="Confirm Auction Purchase"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" loading={loading} onClick={handleSubmit}>
          Confirm Purchase
        </Button>,
      ]}
      width={600}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <p className="text-gray-900">{auctionData.vehicleInfo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
            <p className="text-gray-900 font-mono">{auctionData.vin}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auction ID</label>
            <p className="text-gray-900 font-mono">{auctionData.auctionId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Winning Bid</label>
            <p className="text-gray-900 font-bold">${auctionData.wonPrice?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Vehicle Delivery Location"
            name="vehicle_delivery_location"
            rules={[{ required: true, message: 'Please select vehicle delivery location' }]}
          >
            <Select
              placeholder="Select vehicle delivery location"
              options={locations.map((location: any) => ({
                label: location.address,
                value: location.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Title Delivery Location"
            name="title_delivery_location"
            rules={[{ required: true, message: 'Please select title delivery location' }]}
          >
            <Select
              placeholder="Select title delivery location"
              options={locations.map((location: any) => ({
                label: location.address,
                value: location.id,
              }))}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

// --- Tab Components ---
function ConfirmationTab({ bid, onConfirm }: { bid: WonBid; onConfirm: (values: any) => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [transportModalVisible, setTransportModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [transportLoading, setTransportLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);

  // Check if auction is already confirmed based on request_id.status
  const isConfirmed = bid.originalData?.request_id?.status === 6;

  // Fetch locations when modal opens
  const fetchLocations = async () => {
    setLocationsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiUrl}/users/api/v1/dealer-locations/`, { headers });
      setLocations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      showErrorToast(error, "Locations");
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleConfirmClick = () => {
    setModalVisible(true);
    fetchLocations();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalConfirm = async (values: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        auction_id: bid.originalData?.auction_id || bid.auctionId,
        request_id: bid.originalData?.request_id?.id || bid.originalData?.request_id,
        auction_won_id: bid.originalData?.id || bid.key,
        title_delivery_location: values.title_delivery_location,
        vehicle_delivery_location: values.vehicle_delivery_location,
      };

      await axios.post(`${apiUrl}/auctions/api/v1/buyer-confirmation/`, payload, { headers });
      
      showSuccessToast("Auction confirmed successfully!", "Confirmation");
      setModalVisible(false);
      onConfirm(values);
    } catch (error) {
      showErrorToast(error, "Confirmation");
    } finally {
      setLoading(false);
    }
  };

  const handleTransportationNotRequired = () => {
    setTransportModalVisible(true);
  };

  const handleTransportModalCancel = () => {
    setTransportModalVisible(false);
  };

  const handleTransportModalConfirm = async (values: { attachment: UploadFile }) => {
    setTransportLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add the attachment file
      if (values.attachment && values.attachment.originFileObj) {
        formData.append('attachment', values.attachment.originFileObj);
      }

      // Add other payload data if needed
      formData.append('auction_id', bid.originalData?.auction_id || bid.auctionId);
      formData.append('request_id', bid.originalData?.request_id?.id || bid.originalData?.request_id);
      formData.append('auction_won_id', bid.originalData?.id || bid.key);

      await axios.patch(`${apiUrl}/inspections/api/v1/1/manual-delivered/`, formData, { headers });
      
      showSuccessToast("Transportation preference updated successfully!", "Transportation");
      setTransportModalVisible(false);
      onConfirm({}); // Refresh data
    } catch (error) {
      showErrorToast(error, "Transportation");
    } finally {
      setTransportLoading(false);
    }
  };

  const handleTakeTransportation = () => {
    setBookingModalVisible(true);
    fetchLocations(); // Fetch locations when modal opens
  };

  const handleBookingModalCancel = () => {
    setBookingModalVisible(false);
  };

  const handleBookingModalConfirm = async (values: any) => {
    setBookingLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        auction_id: bid.originalData?.auction_id || bid.auctionId,
        pickup_location: values.pickup_location,
        drop_location: values.drop_location,
      };

      await axios.post(`${apiUrl}/transportation/api/v1/create-jobs/`, payload, { headers });
      
      showSuccessToast("Transportation booked successfully!", "Transportation");
      setBookingModalVisible(false);
      onConfirm({}); // Refresh data
    } catch (error) {
      showErrorToast(error, "Transportation Booking");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center py-8">
        <CheckCircleTwoTone twoToneColor="#bdbdbd" style={{ fontSize: 56, marginBottom: 16 }} />
        <h2 className="text-2xl font-bold mb-2">Congratulations! You won this bid!</h2>
        <p className="text-gray-500 mb-6 text-center max-w-xl">
          Kindly proceed with your confirmation and initiate the necessary payments. Your prompt action ensures a smooth and efficient process.
        </p>
        {isConfirmed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded border border-green-200">
              <CheckCircleTwoTone twoToneColor="#22c55e" style={{ fontSize: 20 }} />
              <span className="font-semibold">Auction Confirmed</span>
            </div>
            
            {/* Transportation Options */}
            <div className="mt-4">
              {/* Check transportation status from API response */}
              {bid.originalData?.request_id?.transportation_taken === 1 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-blue-600 text-xl mr-3" />
                    <div>
                      <h5 className="text-blue-800 font-semibold">Transportation Job Created</h5>
                      <p className="text-blue-600 text-sm">A transportation job has been created for this vehicle.</p>
                    </div>
                  </div>
                </div>
              ) : bid.originalData?.request_id?.manual_delivered === 1 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-600 text-xl mr-3" />
                    <div>
                      <h5 className="text-green-800 font-semibold">Manual Delivery Confirmed</h5>
                      <p className="text-green-600 text-sm">Vehicle will be delivered manually by the buyer.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    className="bg-orange-600 text-white px-6 py-2 rounded font-semibold hover:bg-orange-700 transition flex items-center gap-2"
                    onClick={handleTransportationNotRequired}
                  >
                    <CarOutlined />
                    Transportation not required
                  </button>
                  <button 
                    className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                    onClick={handleTakeTransportation}
                  >
                    <CalendarOutlined />
                    Take transportation
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button 
            className="bg-blue-600 text-white px-8 py-2 rounded font-semibold text-lg hover:bg-blue-700 transition"
            onClick={handleConfirmClick}
          >
            Confirm Now
          </button>
        )}
      </div>

      <ConfirmationModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        loading={loading}
        auctionData={bid}
        locations={locations}
      />

      <TransportationConfirmModal
        visible={transportModalVisible}
        onCancel={handleTransportModalCancel}
        onConfirm={handleTransportModalConfirm}
        loading={transportLoading}
        auctionData={bid}
      />

      <TransportationBookingModal
        visible={bookingModalVisible}
        onCancel={handleBookingModalCancel}
        onConfirm={handleBookingModalConfirm}
        loading={bookingLoading}
        auctionData={bid}
        locations={locations}
      />
    </>
  );
}

function VehicleDetailsTab({ bid }: { bid: WonBid }) {
  const vehicleData = bid.originalData?.request_id;
  
  if (!vehicleData) {
    return <div className="text-center py-8 text-gray-500">No vehicle details available</div>;
  }

  const details = [
    { label: "Year", value: vehicleData.year },
    { label: "Make", value: vehicleData.make },
    { label: "Model", value: vehicleData.model },
    { label: "Trim", value: vehicleData.trim },
    { label: "Series", value: vehicleData.series },
    { label: "VIN", value: vehicleData.vin },
    { label: "Stock No", value: vehicleData.stock_no },
    { label: "Odometer", value: `${vehicleData.odometer} mi` },
    { label: "Cylinders", value: vehicleData.cylinders },
    { label: "Transmission", value: vehicleData.transmission },
    { label: "Drivetrain", value: vehicleData.drivetrain },
    { label: "Days on Lot", value: vehicleData.days_on_lot },
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {details.map((detail, index) => (
          <div key={index} className="bg-white p-3 rounded border">
            <label className="block text-sm font-medium text-gray-700 mb-1">{detail.label}</label>
            <p className="text-gray-900">{detail.value || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InspectionReportTab({ bid }: { bid: WonBid }) {
  const inspectionReports = bid.originalData?.inspection_reports || [];
  
  if (!inspectionReports.length) {
    return <div className="text-center py-8 text-gray-500">No inspection reports available</div>;
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Inspection Reports</h3>
      <div className="space-y-4">
        {inspectionReports.map((report: any, index: number) => (
          <Card key={index} title={`Report ${index + 1}`} className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report ID</label>
                <p className="text-gray-900">{report.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-gray-900">{new Date(report.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yellow Lights</label>
                <p className="text-gray-900">{report.yellow}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Red Lights</label>
                <p className="text-gray-900">{report.red}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ArbitrationTab({ bid }: { bid: WonBid }) {
  const [arbitrationModalVisible, setArbitrationModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleRequestArbitration = () => {
    setArbitrationModalVisible(true);
  };

  const handleModalCancel = () => {
    setArbitrationModalVisible(false);
  };

  const handleArbitrationSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Create FormData for the API request
      const formData = new FormData();
      
      // Add required fields based on the screenshot structure
      formData.append('auction_id', bid.originalData?.auction_id || bid.auctionId);
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('subject', values.subject);
      formData.append('priority', values.priority);
      formData.append('issues', values.issues);
      
      // Add attachments (multiple files)
      if (values.attachments && values.attachments.length > 0) {
        values.attachments.forEach((file: UploadFile, index: number) => {
          if (file.originFileObj) {
            formData.append('attachments', file.originFileObj);
          }
        });
      }

      await axios.post(`${apiUrl}/arbitration/api/v1/request/`, formData, { headers });
      
      showSuccessToast("Arbitration request submitted successfully!", "Arbitration");
      setArbitrationModalVisible(false);
    } catch (error) {
      showErrorToast(error, "Arbitration");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Mock arbitration data - replace with real data
  const arbitrationData = {
    status: "7 days remaining",
    startDate: "09 Aug 2025",
    endDate: "16 Aug 2025",
  };

  return (
    <>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Arbitration Status */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7 days Arbitration</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Status :</span>
                <span className="text-red-500 font-medium">{arbitrationData.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Start Date :</span>
                <span className="text-gray-900">{arbitrationData.startDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">End Date :</span>
                <span className="text-gray-900">{arbitrationData.endDate}</span>
              </div>
            </div>

            <Button 
              type="primary" 
              size="large"
              onClick={handleRequestArbitration}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Request for Arbitration
            </Button>
          </div>

          {/* Right Column - Arbitration Process */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Arbitration Process</h2>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">General.</h4>
                <p className="text-gray-600 text-sm">
                  If a buyer has received a vehicle that has an undisclosed issue that is covered for arbitration under this policy, the buyer may notify.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Timing.</h4>
                <p className="text-gray-600 text-sm">
                  Buyer will have 10 calendar days from the date of purchase.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Extended Arbitration Windows.</h4>
                <p className="text-gray-600 text-sm">
                  Buyer may, at the time of purchase, choose to purchase an extended arbitration option for any given vehicle which would give the buyer either an additional 30 days.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Investigation.</h4>
                <p className="text-gray-600 text-sm">
                  In order to fully investigate the arbitration claim, AWD Auctions may require the buyer to provide evidence of the claim and assist in diagnosis of any undisclosed condition issues within a specified timeframe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArbitrationFormModal
        visible={arbitrationModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleArbitrationSubmit}
        loading={submitLoading}
        auctionData={bid}
      />
    </>
  );
}

// --- Main Page ---
export default function DsActiveBuyingWon() {
  const [wonBids, setWonBids] = useState<WonBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/auctions/api/v1/buying-won/`, { headers });
      
      const mapped = (response.data || []).map((item: any, idx: number) => {
        const req = item.request_id || {};
        const reservePrice = item.reserve_price || req.reserve_price || null;
        const status = req.status || 0;
        const statusLabel = STATUS_MAP[status] || 'Unknown';
        const wonPrice = item.last_bid_id?.bid || 0;
        
        return {
          key: item.id || idx,
          auctionId: item.auction_id,
          wonAt: item.won_at,
          expectedPrice: item.expected_price,
          wonPrice: wonPrice,
          reservePrice: reservePrice,
          vehicleInfo: req ? `${req.year || ''} ${req.make || ''} ${req.model || ''}`.trim() : 'N/A',
          vin: req.vin || 'N/A',
          stockNo: req.stock_no || 'N/A',
          odometer: req.odometer || 'N/A',
          originalData: item, // Store full original data
          status: status,
          statusLabel: statusLabel,
        };
      });
      
      setWonBids(mapped);
    } catch (error) {
      console.error('Failed to fetch won bids:', error);
      showErrorToast(error, "Won Bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmation = () => {
    // Refresh data after confirmation
    fetchData();
  };

  const columns = [
    {
      title: "Auction ID",
      dataIndex: "auctionId",
      key: "auctionId",
      render: (val: string) => <span className="font-mono text-sm">{val}</span>,
      width: 120,
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleInfo",
      key: "vehicleInfo",
      render: (val: string) => <span className="font-medium">{val}</span>,
      width: 150,
    },
    {
      title: "VIN",
      dataIndex: "vin",
      key: "vin",
      render: (val: string) => <span className="font-mono text-sm">{val}</span>,
      width: 120,
    },
    {
      title: "Stock No",
      dataIndex: "stockNo",
      key: "stockNo",
      render: (val: string) => <span className="text-gray-600">{val}</span>,
      width: 100,
    },
    {
      title: "Odometer",
      dataIndex: "odometer",
      key: "odometer",
      render: (val: string) => <span className="text-gray-600">{val} mi</span>,
      width: 100,
    },
    {
      title: "Won At",
      dataIndex: "wonAt",
      key: "wonAt",
      render: (val: string) => {
        const date = new Date(val);
        return (
          <span className="text-sm font-medium">{date.toLocaleDateString()}</span>
        );
      },
      width: 120,
    },
    {
      title: "Expected Price",
      dataIndex: "expectedPrice",
      key: "expectedPrice",
      render: (val: number) => <span className="font-bold text-green-600">$ {val ? val.toLocaleString() : '-'}</span>,
      width: 120,
    },
    {
      title: "Won Price",
      dataIndex: "wonPrice",
      key: "wonPrice",
      render: (val: number) => <span className="font-bold text-blue-600">$ {val ? val.toLocaleString() : '-'}</span>,
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "statusLabel",
      key: "status",
      render: (statusLabel: string) => (
        <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${statusColors[statusLabel] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
          {statusLabel}
        </span>
      ),
      width: 150,
    },
  ];

  const ExpandableRowContent = ({ record }: { record: WonBid }) => {
    // Check if auction is confirmed (same logic as transportation buttons)
    const isConfirmed = record.originalData?.request_id?.status === 6;
    
    const items = [
      {
        key: "confirmation",
        label: "Confirmation",
        children: <ConfirmationTab bid={record} onConfirm={handleConfirmation} />,
      },
      {
        key: "details",
        label: "Vehicle Details",
        children: <VehicleDetailsTab bid={record} />,
      },
      {
        key: "inspection",
        label: "Inspection Report",
        children: <InspectionReportTab bid={record} />,
      },
      // Only show arbitration tab if auction is confirmed
      ...(isConfirmed ? [{
        key: "arbitration",
        label: "Arbitration",
        children: <ArbitrationTab bid={record} />,
      }] : []),
    ];

    return (
      <div className="p-6 bg-gray-50">
        <Tabs items={items} />
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Won Auctions</h1>
        <p className="text-gray-600">Manage your successfully won auction bids</p>
      </div>
      
      <DataTable 
        columns={columns} 
        data={wonBids} 
        loading={loading}
        expandable={{
          expandedRowRender: (record: WonBid) => <ExpandableRowContent record={record} />,
          expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
          onExpand: (expanded: boolean, record: WonBid) => {
            setExpandedRowKey(expanded ? record.key : null);
          },
        }}
      />
    </div>
  );
} 