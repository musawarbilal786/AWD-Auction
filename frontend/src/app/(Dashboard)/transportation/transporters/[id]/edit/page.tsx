"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Form, Button, Row, Col, Upload, Modal, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import { FormField } from "@/components/common/FormField";

interface TransporterFormData {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  streetName: string;
  city: string;
  state: string;
  zipcode: string;
  website: string;
  phoneNumber: string;
  ext: string;
  cellPhoneNumber: string;
  approved: string;
  cdl: any[];
  businessLicense: any[];
  proofOfInsurance: any[];
  mc: any[];
}

export default function EditTransporterPage() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [formData, setFormData] = useState<TransporterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '',
    streetName: '',
    city: '',
    state: '',
    zipcode: '',
    website: '',
    phoneNumber: '',
    ext: '',
    cellPhoneNumber: '',
    approved: 'Pending',
    cdl: [],
    businessLicense: [],
    proofOfInsurance: [],
    mc: []
  });
  const router = useRouter();

  // Fetch transporter data
  useEffect(() => {
    const fetchTransporter = async () => {
      setFetching(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/transportation/api/v1/transporter/${id}/`, { headers });
        const transporterData = res.data;
        
        setFormData({
          firstName: transporterData.first_name || '',
          lastName: transporterData.last_name || '',
          email: transporterData.email || '',
          businessName: transporterData.business_name || '',
          streetName: transporterData.street_name || '',
          city: transporterData.city_name || '',
          state: transporterData.state || '',
          zipcode: transporterData.zipcode || '',
          website: transporterData.website || '',
          phoneNumber: transporterData.phone_number || '',
          ext: transporterData.ext || '',
          cellPhoneNumber: transporterData.cell_number || '',
          approved: transporterData.approved ? 'Approved' : 'Pending',
          cdl: [],
          businessLicense: [],
          proofOfInsurance: [],
          mc: []
        });
        
        form.setFieldsValue({
          firstName: transporterData.first_name || '',
          lastName: transporterData.last_name || '',
          email: transporterData.email || '',
          businessName: transporterData.business_name || '',
          streetName: transporterData.street_name || '',
          city: transporterData.city_name || '',
          state: transporterData.state || '',
          zipcode: transporterData.zipcode || '',
          website: transporterData.website || '',
          phoneNumber: transporterData.phone_number || '',
          ext: transporterData.ext || '',
          cellPhoneNumber: transporterData.cell_number || '',
          approved: transporterData.approved ? 'Approved' : 'Pending',
        });
      } catch (err: any) {
        showErrorToast(err, "Transporter data");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchTransporter();
    }
  }, [id, form]);

  // Fetch states data
  useEffect(() => {
    const fetchStates = async () => {
      setStatesLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/utils/api/v1/states/`, { headers });
        setStates(res.data || []);
      } catch (err) {
        showErrorToast(err, "States");
      } finally {
        setStatesLoading(false);
      }
    };
    fetchStates();
  }, []);

  const handleInputChange = (field: keyof TransporterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    form.setFieldValue(field, value);
  };

  const handleSubmit = async () => {
    try {
      // Validate form before submission
      await form.validateFields();
      
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Create FormData for multipart/form-data submission
      const apiData = new FormData();
      
      // Map form data to API fields using Object.entries pattern
      const fieldMapping = {
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        streetName: 'street_name',
        city: 'city_name',
        businessName: 'business_name',
        state: 'state',
        zipcode: 'zipcode',
        website: 'website',
        phoneNumber: 'phone_number',
        ext: 'ext',
        cellPhoneNumber: 'cell_number',
        approved: 'approved'
      };

      // Add text fields
      Object.entries(fieldMapping).forEach(([formKey, apiKey]) => {
        const value = formData[formKey as keyof TransporterFormData];
        if (apiKey === 'approved') {
          apiData.append(apiKey, value === 'Approved' ? '1' : '0');
        } else if (typeof value === 'string' || typeof value === 'number') {
          apiData.append(apiKey, String(value));
        } else {
          apiData.append(apiKey, '');
        }
      });

      // Add files if they exist
      const fileFields = {
        cdl: 'commercial_driver_license',
        businessLicense: 'business_license',
        proofOfInsurance: 'proof_of_insurance',
        mc: 'motor_carrier'
      };

      Object.entries(fileFields).forEach(([formKey, apiKey]) => {
        const files = formData[formKey as keyof TransporterFormData] as any[];
        if (files && files.length > 0 && files[0].originFileObj) {
          apiData.append(apiKey, files[0].originFileObj);
        }
      });

      // Make the API call
      await axios.patch(
        `${apiUrl}/transportation/api/v1/transporter/${id}/`,
        apiData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      showSuccessToast(COMMON_SUCCESS_MESSAGES.UPDATED, "Transporter");
      router.push('/transportation/transporters');
    } catch (error: any) {
      showErrorToast(error, "Transporter update");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false, // Prevent automatic upload
    multiple: false,
    accept: 'image/*,.pdf,.doc,.docx',
  };

  if (fetching) return <div className="p-6">Loading transporter data...</div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Transportation", href: "/transportation" }, { label: "Transporters", href: "/transportation/transporters" }, { label: "Edit" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-end items-center mb-6">
          <div className="flex gap-2">
            <Button type="default" onClick={() => setIsModalOpen(true)} disabled={loading}>Create Password</Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              Save
            </Button>
          </div>
        </div>
        <Form 
          form={form}
          layout="vertical" 
          disabled={loading}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <FormField
                name="businessName"
                label="Business Name"
                type="text"
                required
                rules={[{ required: true, message: 'Business Name is required' }]}
                value={formData.businessName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('businessName', e.target.value)}
              />
              <FormField
                name="streetName"
                label="Street Name"
                type="text"
                value={formData.streetName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('streetName', e.target.value)}
              />
              <FormField
                name="city"
                label="City"
                type="text"
                value={formData.city}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
              />
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'State is required' }]}
              >
                <FormField
                  type="select"
                  loading={statesLoading}
                  placeholder="Select state"
                  value={formData.state}
                  onChange={(value: any) => handleInputChange('state', value)}
                  options={states.map(state => ({
                    value: state.id,
                    label: `${state.name} (${state.code})`
                  }))}
                />
              </Form.Item>
              <FormField
                name="zipcode"
                label="Zipcode"
                type="text"
                value={formData.zipcode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('zipcode', e.target.value)}
              />
              <FormField
                name="website"
                label="Website"
                type="text"
                value={formData.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website', e.target.value)}
              />
            </Col>
            <Col xs={24} md={12}>
              <FormField
                name="firstName"
                label="First Name"
                type="text"
                required
                rules={[{ required: true, message: 'First Name is required' }]}
                value={formData.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
              />
              <FormField
                name="lastName"
                label="Last Name"
                type="text"
                required
                rules={[{ required: true, message: 'Last Name is required' }]}
                value={formData.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
              />
              <FormField
                name="email"
                label="Email"
                type="email"
                required
                rules={[{ required: true, message: 'Email is required' }]}
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
              />
              <FormField
                name="phoneNumber"
                label="Phone Number"
                type="text"
                value={formData.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phoneNumber', e.target.value)}
              />
              <FormField
                name="ext"
                label="Ext"
                type="text"
                value={formData.ext}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('ext', e.target.value)}
              />
              <FormField
                name="cellPhoneNumber"
                label="Cell Phone Number"
                type="text"
                value={formData.cellPhoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cellPhoneNumber', e.target.value)}
              />
              <FormField
                name="approved"
                label="Approved"
                type="select"
                value={formData.approved}
                onChange={(value: string) => handleInputChange('approved', value)}
                options={[
                  { value: "Approved", label: "Approved" },
                  { value: "Pending", label: "Pending" }
                ]}
              />
            </Col>
          </Row>
          <Row gutter={24} className="mt-4">
            <Col xs={24} md={6}>
              <Form.Item label="Commercial Driver License (CDL)" name="cdl">
                <Upload.Dragger 
                  className="min-h-[140px]"
                  {...uploadProps}
                  fileList={formData.cdl}
                  onChange={(info) => handleInputChange('cdl', info.fileList)}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Drag File</p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Business License" name="businessLicense">
                <Upload.Dragger 
                  className="min-h-[140px]"
                  {...uploadProps}
                  fileList={formData.businessLicense}
                  onChange={(info) => handleInputChange('businessLicense', info.fileList)}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Drag File</p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Proof of Insurance" name="proofOfInsurance">
                <Upload.Dragger 
                  className="min-h-[140px]"
                  {...uploadProps}
                  fileList={formData.proofOfInsurance}
                  onChange={(info) => handleInputChange('proofOfInsurance', info.fileList)}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Drag File</p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Motor Carrier (MC)" name="mc">
                <Upload.Dragger 
                  className="min-h-[140px]"
                  {...uploadProps}
                  fileList={formData.mc}
                  onChange={(info) => handleInputChange('mc', info.fileList)}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Drag File</p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Modal
          title="Create Password"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form layout="vertical">
            <Form.Item label="Password" name="password"><Input.Password /></Form.Item>
            <Form.Item label="Confirm Password" name="confirmPassword"><Input.Password /></Form.Item>
            <div className="flex justify-end">
              <Button type="primary" onClick={() => setIsModalOpen(false)}>Create</Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
} 