"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Form, Input, Button, Select, message } from "antd";
import React, { useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { useRouter } from "next/navigation";

export default function AddTicketStatusPage() {
  const [form] = Form.useForm();
  const [color, setColor] = useState("#000000");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Prepare the payload according to the API specification
      const payload = {
        name: values.name,
        color: values.color,
        is_default: values.is_default,
        type_can_be_change: values.type_can_be_change,
        ticket_type: values.ticket_type
      };
      
      const response = await axios.post(`${apiUrl}/arbitration/api/v1/ticket-status/`, payload, { headers });
      
      if (response.data) {
        showSuccessToast("Ticket status created successfully!", "Status");
        router.push("/tickets/statuses");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to create ticket status.";
      showErrorToast(err, "Status Creation");
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Statuses", href: "/tickets/statuses" }, { label: "Add" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <Form
          form={form}
          layout="vertical"
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
          initialValues={{ 
            color: "#000000", 
            is_default: "No",
            type_can_be_change: "No",
            ticket_type: 1
          }}
          onFinish={handleSubmit}
        >
          <Form.Item 
            label="Name" 
            name="name" 
            rules={[{ required: true, message: 'Please enter a name' }]}
          > 
            <Input placeholder="Enter status name" />
          </Form.Item>
          
          <Form.Item 
            label="Color" 
            name="color"
            rules={[{ required: true, message: 'Please select a color' }]}
          >
            <Input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)} 
              style={{ width: 60, height: 32, padding: 0, border: 'none', background: 'none' }} 
            />
          </Form.Item>
          
          <Form.Item 
            label="Is Default" 
            name="is_default"
            rules={[{ required: true, message: 'Please select default status' }]}
          >
            <Select 
              placeholder="Select default status"
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" }
              ]} 
            />
          </Form.Item>
          
          <Form.Item 
            label="Type Can Be Changed" 
            name="type_can_be_change"
            rules={[{ required: true, message: 'Please select if type can be changed' }]}
          >
            <Select 
              placeholder="Select if type can be changed"
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" }
              ]} 
            />
          </Form.Item>
          
          <Form.Item 
            label="Ticket Type" 
            name="ticket_type"
            rules={[{ required: true, message: 'Please select ticket type' }]}
          >
            <Select 
              placeholder="Select ticket type"
              options={[
                { value: 1, label: "Arbitration" },
                { value: 2, label: "Support" },
                { value: 3, label: "General" }
              ]} 
            />
          </Form.Item>
        </Form>
        
        <div className="flex justify-end mt-6">
          <Button 
            type="default" 
            onClick={() => router.back()}
            className="mr-4"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="bg-sky-600"
            onClick={() => form.submit()}
          >
            Create Status
          </Button>
        </div>
      </div>
    </div>
  );
} 