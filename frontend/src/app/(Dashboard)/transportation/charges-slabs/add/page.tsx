"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Form, Input, Button, Select } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

export default function AddChargesSlabPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Map form values to API payload
      const payload = {
        name: values.slabName,
        km_range_start: values.rangeStart,
        km_range_end: values.rangeEnd,
        buyer_charges_per_km: values.buyerCharges,
        transporter_charges_per_km: values.transporterCharges,
        status: values.status === "Active" ? 1 : 0
      };

      // Make the API call
      await axios.post(
        `${apiUrl}/transportation/api/v1/charges-slab/`,
        payload,
        { headers }
      );

      showSuccessToast(COMMON_SUCCESS_MESSAGES.CREATED, "Charges Slab");
      router.push('/transportation/charges-slabs');
    } catch (error: any) {
      showErrorToast(error, "Charges slab creation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Transportation", href: "/transportation" }, { label: "Charges Slabs", href: "/transportation/charges-slabs" }, { label: "Add" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          {/* <h2 className="text-2xl font-bold text-sky-700">Transportation Charges Slabs <span className="text-black font-normal">/ Add</span></h2> */}
          <Button 
            type="primary" 
            className="bg-sky-600 hover:bg-sky-700 rounded-md px-8 py-2" 
            onClick={() => form.submit()}
            loading={loading}
            disabled={loading}
          >
            Save
          </Button>
        </div>
        <Form
          form={form}
          layout="vertical"
          className="w-full"
          onFinish={handleSubmit}
          disabled={loading}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 mb-6">
            <Form.Item label="Slab Name" name="slabName" className="mb-0" rules={[{ required: true, message: 'Please enter slab name' }]}> 
              <Input placeholder="Enter slab name" /> 
            </Form.Item>
            <Form.Item label="Range Start" name="rangeStart" className="mb-0" rules={[{ required: true, message: 'Please enter range start' }]}> 
              <Input addonAfter="miles" type="number" placeholder="Enter start range" /> 
            </Form.Item>
            <Form.Item label="Range End" name="rangeEnd" className="mb-0" rules={[{ required: true, message: 'Please enter range end' }]}> 
              <Input addonAfter="miles" type="number" placeholder="Enter end range" /> 
            </Form.Item>
            <Form.Item label="Buyer Charges (miles)" name="buyerCharges" className="mb-0" rules={[{ required: true, message: 'Please enter buyer charges' }]}> 
              <Input addonBefore="$" type="number" placeholder="Enter buyer charges" /> 
            </Form.Item>
            <Form.Item label="Transporter Charges (miles)" name="transporterCharges" className="mb-0" rules={[{ required: true, message: 'Please enter transporter charges' }]}> 
              <Input addonBefore="$" type="number" placeholder="Enter transporter charges" /> 
            </Form.Item>
            <Form.Item label="Status" name="status" className="mb-0" rules={[{ required: true, message: 'Please select status' }]}> 
              <Select 
                options={[
                  { value: "Active", label: "Active" }, 
                  { value: "Inactive", label: "Inactive" }
                ]} 
                placeholder="Select status" 
              /> 
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
} 