"use client";

import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { AuthLayout } from "@/components/layout/AuthLayout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import axios from "axios";

export default function ForgotPassword() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/users/api/v1/forgot-password/`, values);
      showSuccessToast("Password reset link sent to your email.");
    } catch (error) {
      showErrorToast(error, "Password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="md">
      <div className="flex flex-col items-center justify-center w-full">
        <Image src="/awd-logo.png" alt="AWD Auctions" width={160} height={60} className="mb-4" />
        <h2 className="text-2xl font-bold text-sky-600 mb-1 text-center">Password reset</h2>
        <p className="text-gray-500 text-base mb-8 text-center">Enter your registered email and we will send you password reset link.</p>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="w-full"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
            className="mb-8"
          >
            <Input size="large" placeholder="Email" className="font-poppins" />
          </Form.Item>
          <div className="flex justify-between items-center w-full gap-4 mt-2">
            <Button
              type="default"
              className="px-8 py-2 h-11 rounded-lg font-[600] bg-white text-black border-0 shadow-none hover:bg-gray-100"
              onClick={() => router.back()}
              block
            >
              Go Back
            </Button>
            <button
              type="submit"
              className="px-8 py-2 h-11 w-full bg-sky-600 hover:bg-sky-700 rounded-lg font-[600] text-white border-0"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset now"}
            </button>
          </div>
        </Form>
      </div>
    </AuthLayout>
  );
} 