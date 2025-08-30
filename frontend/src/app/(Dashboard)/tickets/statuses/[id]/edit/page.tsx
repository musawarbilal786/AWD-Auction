"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Form, Input, Button, Select, message, Modal, Popconfirm } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { useRouter, useParams } from "next/navigation";

export default function EditTicketStatusPage() {
  const [form] = Form.useForm();
  const [color, setColor] = useState("#000000");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const statusId = params.id;

  // Fetch status data
  const fetchStatusData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await axios.get(`${apiUrl}/arbitration/api/v1/ticket-status/${statusId}/`, { headers });
      
      if (response.data) {
        setStatusData(response.data);
        const data = response.data;
        
        // Set form values based on the actual API response structure
        form.setFieldsValue({
          name: data.name,
          color: data.color,
          is_default: data.ticket_type?.is_default || "No",
          type_can_be_change: data.type_can_be_change,
          ticket_type: data.ticket_type?.id || 1
        });
        setColor(data.color);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to fetch status data.";
      showErrorToast(err, "Status Fetch");
      message.error(errorMessage);
    } finally {
      setFetchLoading(false);
    }
  };

  // Update status
  const handleUpdate = async (values: any) => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const payload = {
        name: values.name,
        color: values.color,
        is_default: values.is_default,
        type_can_be_change: values.type_can_be_change,
        ticket_type: values.ticket_type
      };
      
      const response = await axios.patch(`${apiUrl}/arbitration/api/v1/ticket-status/${statusId}/`, payload, { headers });
      
      if (response.data) {
        showSuccessToast("Ticket status updated successfully!", "Status");
        router.push("/tickets/statuses");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to update ticket status.";
      showErrorToast(err, "Status Update");
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete status
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      await axios.delete(`${apiUrl}/arbitration/api/v1/ticket-status/${statusId}/`, { headers });
      
      showSuccessToast("Ticket status deleted successfully!", "Status");
      router.push("/tickets/statuses");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to delete ticket status.";
      showErrorToast(err, "Status Delete");
      message.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (statusId) {
      fetchStatusData();
    }
  }, [statusId]);

  if (fetchLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Loading status data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumbs items={[
        { label: "Tickets", href: "/tickets" }, 
        { label: "Statuses", href: "/tickets/statuses" }, 
        { label: "Edit" }
      ]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <Form
          form={form}
          layout="vertical"
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
          onFinish={handleUpdate}
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
        
        <div className="flex justify-between mt-6">
          <Popconfirm
            title="Delete Status"
            description="Are you sure you want to delete this status? This action cannot be undone."
            onConfirm={handleDelete}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button 
              type="primary" 
              danger
              loading={deleteLoading}
            >
              Delete Status
            </Button>
          </Popconfirm>
          
          <div className="flex space-x-4">
            <Button 
              type="default" 
              onClick={() => router.back()}
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
              Update Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 