"use client"

import { useState } from "react"
import { Form, Button, Checkbox } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Logo } from "@/components/common/Logo"
import { FormField } from "@/components/common/FormField"
import Image from "next/image"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/userSlice"
import axios from "axios"
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler"

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

// Map backend role names to frontend role keys
function mapBackendRoleToFrontend(roleName: string) {
  console.log({roleName})
  switch (roleName) {
    case "SUPER_ADMIN":
      return "superadmin";
    case "SELLER":
    case "BUYER":
    case "SELLER/BUYER":
      return "ds";
    case "INSPECTOR":
      return "inspector";
    case "TRANSPORTER":
      return "transporter";
    default:
      return "ds";
  }
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  async function onSubmit(values: LoginForm) {
    setIsLoading(true)
    try {
      console.log("Before API call", values);
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)
      const response = await axios.post(`${apiUrl}/users/api/v1/login/`, formData)
      console.log("After API call", response.data);
      const userData = response.data
      const user = userData.user
      console.log("User object:", user);
      localStorage.setItem("access", userData.access)
      localStorage.setItem("refresh", userData.refresh)
      const frontendRole = mapBackendRoleToFrontend(user.role?.name || "")
      dispatch(setUser({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        role: frontendRole,
        backendRole: user.role?.name,
        avatar: "/images/dummy-profile-logo.jpg",
      }))
      showSuccessToast(COMMON_SUCCESS_MESSAGES.LOGGED_IN);
      if (frontendRole === "superadmin") {
        router.push("/")
      } else if (frontendRole === "inspector") {
        router.push("/")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Login error:", error);
      showErrorToast(error, "Login");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center px-4 sm:px-6">
        <Image src="/awd-logo.png" alt="Logo" className="my-4" width={200} height={100} />
        <h1 className="text-xl sm:text-2xl font-bold text-sky-600">Sign in to your Account</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Enter your details to proceed further</p>
      </div>
      <div className="px-4 sm:px-6 my-8">
        <Form
          form={form}
          name="login"
          onFinish={onSubmit}
          layout="vertical"
          requiredMark={false}
          className="space-y-4 sm:space-y-5"
        >
          <FormField
            name="email"
            type="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" }
            ]}
            prefix={<UserOutlined />}
            placeholder="Email"
            disabled={isLoading}
          />

          <FormField
            name="password"
            type="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 5, message: "Password must be at least 5 characters" }
            ]}
            prefix={<LockOutlined />}
            placeholder="Password"
            disabled={isLoading}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between mb-4">
            <div className="mt-2 sm:mt-0">
              <Checkbox>Remember for logged in</Checkbox>
            </div>
            <Link href="/forgot-password" className="text-sky-600 hover:underline">
              Forgot Password
            </Link>
          </div>

          <Form.Item className="mb-0 text-center">
            <button
              className="px-12 rounded-lg text-white bg-sky-600 hover:bg-sky-700 p-3"
            >
              {isLoading ? "Signing in..." : "Log in"}
            </button>
          </Form.Item>
        </Form>

        <div className="mt-5 sm:mt-6 text-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/registration" className="text-sky-600 hover:underline font-medium">
              sign up for free
            </Link>
          </p>
        </div>
        <div className="text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-center mt-2">
          <p className="text-[10px]">Download Our Free App To Transact-On-The-Go!</p>
          <Image src="/images/download-app.png" alt="Logo" className="sm:my-4" width={250} height={150} />
        </div>
      </div>
    </AuthLayout>
  )
} 