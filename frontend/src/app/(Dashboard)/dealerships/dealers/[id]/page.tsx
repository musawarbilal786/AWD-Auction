"use client";
import { redirect, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input, Select, Upload, Form } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

const { Option } = Select;

// Mapping constants for proper label display
const dealershipTypeOptions = [
  { value: "1", label: "Franchise" },
  { value: "2", label: "Independent" },
  { value: "3", label: "Wholesale" },
  { value: "4", label: "Commercial" },
];

const dealershipInterestOptions = [
  { value: "1", label: "Sell a vehicle" },
  { value: "2", label: "Purchase a vehicle" },
  { value: "3", label: "Both" },
];

const approvedStatusOptions = [
  { value: "0", label: "Pending" },
  { value: "1", label: "Approved" },
  { value: "2", label: "Not Approved" },
];

const contactPreferenceOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text Message" },
];

const sellerFeeTypeOptions = [
  { value: "Basic $10", label: "Basic $10" },
  { value: "Basic %2", label: "Basic %2" },
];

const defaultDealer = {
  first_name: "",
  last_name: "",
  email: "",
  mobile_no: "",
  phone_number: "",
  contact_preference: "",
  dealership_name: "",
  street_name: "",
  tax_id: "",
  website: "",
  city_name: "",
  dealer_license: undefined as UploadFile | undefined,
  business_license: undefined as UploadFile | undefined,
  retail_certificate: undefined as UploadFile | undefined,
  state_id: undefined as number | undefined,
  zipcode: "",
  dealership_type: "",
  dealership_interest: "",
  no_of_locations: "",
  cars_in_stock: "",
  seller_fees_type_id: "",
  approved: "",
};

export default function DealerViewEditPage() {
  const { id } = useParams();
  const isAddMode = id === "add";
  const [dealerValues, setDealerValues] = useState<typeof defaultDealer>(defaultDealer);
  const [loading, setLoading] = useState(false);
  const [initialDealerValues, setInitialDealerValues] = useState<typeof defaultDealer | null>(null);
  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);

  // Transform API data to ensure proper string values for dropdowns
  const transformApiData = (data: any) => {
    return {
      ...data,
      dealership_type: data.dealership_type ? String(data.dealership_type) : "",
      dealership_interest: data.dealership_interest ? String(data.dealership_interest) : "",
      approved: data.approved !== undefined && data.approved !== null ? String(data.approved) : "",
      seller_fees_type_id: data.seller_fees_type_id ? String(data.seller_fees_type_id) : "",
      contact_preference: data.contact_preference ? String(data.contact_preference) : "",
    };
  };

  const handleChange = (field: keyof typeof defaultDealer, value: any) => {
    setDealerValues({ ...dealerValues, [field]: value });
  };

  const handleFileChange = (field: keyof typeof defaultDealer, info: { fileList: UploadFile[] }) => {
    setDealerValues({
      ...dealerValues,
      [field]: info.fileList[0] ? info.fileList[0] : undefined,
    });
  };

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/utils/api/v1/states/`, { headers });
        setStates(res.data || []);
      } catch (err) {
        showErrorToast(err, "States");
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!isAddMode) {
      const fetchDealer = async () => {
        setLoading(true);
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const { data } = await axios.get(`${apiUrl}/users/api/v1/dealership/${id}/`, { headers });
          const transformedData = transformApiData(data);
          setDealerValues(transformedData);
          setInitialDealerValues(transformedData);
        } catch (error) {
          showErrorToast(error, "Dealer data");
        } finally {
          setLoading(false);
        }
      };
      fetchDealer();
    }
  }, [id, isAddMode]);

  const handleSave = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
    const headers = {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    try {
      if (isAddMode) {
        const formData = new FormData();
        Object.entries(dealerValues).forEach(([key, value]) => {
          if (
            key === "dealer_license" ||
            key === "business_license" ||
            key === "retail_certificate"
          ) {
            if (value && (value as UploadFile).originFileObj) {
              formData.append(key, (value as UploadFile).originFileObj as File);
            }
          } else {
            if (value !== undefined && value !== null) {
              formData.append(key, value as string);
            }
          }
        });
        await axios.post(`${apiUrl}/users/api/v1/dealership/`, formData, { headers });
        showSuccessToast(COMMON_SUCCESS_MESSAGES.CREATED, "Dealer");
        redirect("/dealerships/dealers/pending")
      } else {
        // PATCH: Only send changed fields
        const patchData = new FormData();
        if (initialDealerValues) {
          Object.entries(dealerValues).forEach(([key, value]) => {
            if (value !== initialDealerValues[key as keyof typeof defaultDealer]) {
              if (
                key === "dealer_license" ||
                key === "business_license" ||
                key === "retail_certificate"
              ) {
                if (value && (value as UploadFile).originFileObj) {
                  patchData.append(key, (value as UploadFile).originFileObj as File);
                }
              } else if (value !== undefined && value !== null) {
                patchData.append(key, value as string);
              }
            }
          });
          await axios.patch(`${apiUrl}/users/api/v1/dealership/${id}/`, patchData, { headers });
          showSuccessToast(COMMON_SUCCESS_MESSAGES.UPDATED, "Dealer");
        }
      }
    } catch (error: any) {
      showErrorToast(error, "Dealer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <Breadcrumbs
        items={[
          { label: "Dealers", href: "/dealerships/dealers/approved" },
          { label: isAddMode ? "Add Dealer" : "Edit Dealer" }
        ]}
        showSaveButton={true}
        saveButtonLabel={isAddMode ? "Add Dealer" : "Save"}
        onSaveButtonClick={handleSave}
      />
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <Form layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item label="Dealership Type">
              <Select
                placeholder="Select..."
                value={dealerValues.dealership_type}
                onChange={v => handleChange("dealership_type", v)}
                disabled={!isAddMode}
              >
                {dealershipTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Dealership Interest">
              <Select
                placeholder="Select..."
                value={dealerValues.dealership_interest}
                onChange={v => handleChange("dealership_interest", v)}
              >
                {dealershipInterestOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Seller Fee Type">
              <Select
                placeholder="Select..."
                value={dealerValues.seller_fees_type_id}
                onChange={v => handleChange("seller_fees_type_id", v)}
              >
                {sellerFeeTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Dealership Name">
              <Input value={dealerValues.dealership_name} onChange={e => handleChange("dealership_name", e.target.value)} />
            </Form.Item>
            <Form.Item label="Dealership Street Name">
              <Input value={dealerValues.street_name} onChange={e => handleChange("street_name", e.target.value)} />
            </Form.Item>
            <Form.Item label="City_name">
              <Input value={dealerValues.city_name} onChange={e => handleChange("city_name", e.target.value)} />
            </Form.Item>
            <Form.Item label="State">
              <Select
                placeholder="Select..."
                value={dealerValues.state_id}
                onChange={v => handleChange("state_id", v)}
                showSearch
                optionFilterProp="children"
              >
                {states.map(state => (
                  <Option key={state.id} value={state.id}>{state.name} ({state.code})</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Zipcode">
              <Input value={dealerValues.zipcode} onChange={e => handleChange("zipcode", e.target.value)} />
            </Form.Item>
            <Form.Item label="Website">
              <Input value={dealerValues.website} onChange={e => handleChange("website", e.target.value)} />
            </Form.Item>
            <Form.Item label="No of locations">
              <Input value={dealerValues.no_of_locations} onChange={e => handleChange("no_of_locations", e.target.value)} />
            </Form.Item>
            <Form.Item label="Cars in stock">
              <Input value={dealerValues.cars_in_stock} onChange={e => handleChange("cars_in_stock", e.target.value)} />
            </Form.Item>
            <Form.Item label="First Name">
              <Input value={dealerValues.first_name} onChange={e => handleChange("first_name", e.target.value)} />
            </Form.Item>
            <Form.Item label="Last Name">
              <Input value={dealerValues.last_name} onChange={e => handleChange("last_name", e.target.value)} />
            </Form.Item>
            <Form.Item label="Email">
              <Input value={dealerValues.email} onChange={e => handleChange("email", e.target.value)} />
            </Form.Item>
            <Form.Item label="Phone Number">
              <Input value={dealerValues.phone_number} onChange={e => handleChange("phone_number", e.target.value)} />
            </Form.Item>
            <Form.Item label="Mobile Number">
              <Input value={dealerValues.mobile_no} onChange={e => handleChange("mobile_no", e.target.value)} />
            </Form.Item>
            <Form.Item label="Contact Preference Options">
              <Select
                placeholder="Select..."
                value={dealerValues.contact_preference}
                onChange={v => handleChange("contact_preference", v)}
              >
                {contactPreferenceOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Approved">
              <Select
                placeholder="Select..."
                value={dealerValues.approved}
                onChange={v => handleChange("approved", v)}
                disabled={!isAddMode}
              >
                {approvedStatusOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Form.Item label={<span className="font-semibold">Dealer License</span>}>
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                onChange={info => handleFileChange("dealer_license", info)}
                fileList={dealerValues.dealer_license ? [{ ...dealerValues.dealer_license, uid: "1" }] : []}
              >
                <div className="border border-gray-300 rounded-md p-6 text-center cursor-pointer">Drag File</div>
              </Upload>
            </Form.Item>
            <Form.Item label={<span className="font-semibold">Business License</span>}>
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                onChange={info => handleFileChange("business_license", info)}
                fileList={dealerValues.business_license ? [{ ...dealerValues.business_license, uid: "2" }] : []}
              >
                <div className="border border-gray-300 rounded-md p-6 text-center cursor-pointer">Drag File</div>
              </Upload>
            </Form.Item>
            <Form.Item label={<span className="font-semibold">Retail Certificate</span>}>
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                onChange={info => handleFileChange("retail_certificate", info)}
                fileList={dealerValues.retail_certificate ? [{ ...dealerValues.retail_certificate, uid: "3" }] : []}
              >
                <div className="border border-gray-300 rounded-md p-6 text-center cursor-pointer">Drag File</div>
              </Upload>
            </Form.Item>
          </div>

        </Form>
      </div>
    </div>
  );
} 