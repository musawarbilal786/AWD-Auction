"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Form, Input, Button, message } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { useRouter, useParams } from "next/navigation";

export default function EditTicketCategoryPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;

  // Fetch category data
  const fetchCategoryData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await axios.get(`${apiUrl}/arbitration/api/v1/ticket-type/${categoryId}/`, { headers });
      
      if (response.data) {
        setCategoryData(response.data);
        const data = response.data;
        
        // Set form values
        form.setFieldsValue({
          name: data.name
        });
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to fetch category data.";
      showErrorToast(err, "Category Fetch");
      message.error(errorMessage);
    } finally {
      setFetchLoading(false);
    }
  };

  // Update category
  const handleUpdate = async (values: any) => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const payload = {
        name: values.name
      };
      
      const response = await axios.patch(`${apiUrl}/arbitration/api/v1/ticket-type/${categoryId}/`, payload, { headers });
      
      if (response.data) {
        showSuccessToast("Category updated successfully!", "Category");
        router.push("/tickets/categories");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to update category.";
      showErrorToast(err, "Category Update");
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  if (fetchLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Loading category data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-gray-50">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Categories", href: "/tickets/categories" }, { label: "Edit" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item 
            label="Name" 
            name="name" 
            rules={[{ required: true, message: 'Please enter a name' }]}
          > 
            <Input placeholder="Enter category name" />
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
            Update Category
          </Button>
        </div>
      </div>
    </div>
  );
} 