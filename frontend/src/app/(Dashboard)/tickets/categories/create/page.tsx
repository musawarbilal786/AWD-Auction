"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Form, Input, Button, message } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

export default function AddTicketCategoryPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateCategory = async (values: any) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const payload = {
        name: values.name,
      };

      await axios.post(`${apiUrl}/arbitration/api/v1/ticket-type/`, payload, { headers });
      
      showSuccessToast("Category created successfully!", "Category");
      form.resetFields();
      router.push("/tickets/categories");
    } catch (error: any) {
      showErrorToast(error, "Create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-gray-50">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Categories", href: "/tickets/categories" }, { label: "Add" }]} />
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col w-full">
        <div className="flex justify-end mb-4">
          <Button 
            type="primary" 
            htmlType="submit" 
            form="add-category-form"
            loading={loading}
            className="bg-sky-600 hover:bg-sky-700 px-8 py-1 h-auto"
          >
            Add Category
          </Button>
        </div>
        <Form
          id="add-category-form"
          form={form}
          layout="vertical"
          initialValues={{ name: "" }}
          onFinish={handleCreateCategory}
        >
          <Form.Item 
            label="Name" 
            name="name" 
            rules={[
              { required: true, message: 'Please enter a category name' },
              { min: 2, message: 'Category name must be at least 2 characters' },
              { max: 100, message: 'Category name must not exceed 100 characters' }
            ]}
          > 
            <Input placeholder="Enter category name" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
} 