"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, Input, Select } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { FormField } from "@/components/common/FormField";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

export default function UserViewEditPage() {
  const { id } = useParams();
  const isAddMode = id === "add";
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isAddMode);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const currentUserRole = useSelector((state: RootState) => state.user.role);
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    personal_email: '',
    mobile_no: '',
    address: '',
    role_name: '',
    role_id: undefined as number | undefined,
    email: '',
    password: undefined as string | undefined,
    status: '1',
  });
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (!isAddMode && id) {
      const fetchUser = async () => {
        setFetching(true);
        setFetchError(null);
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const res = await axios.get(`${apiUrl}/users/api/v1/admin/user/${id}/`, { headers });
          const userData = res.data;
          if (userData.status !== undefined) {
            userData.status = String(userData.status);
          }
          if (userData.role) {
            userData.role_name = userData.role.name;
            userData.role_id = userData.role.id;
          }
          setUserData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            personal_email: userData.personal_email || '',
            mobile_no: userData.mobile_no || '',
            address: userData.address || '',
            role_name: userData.role_name || '',
            role_id: userData.role_id !== undefined ? Number(userData.role_id) : undefined,
            email: userData.email || '',
            password: undefined,
            status: userData.status || '1',
          });
          form.setFieldsValue(userData);
        } catch (err: any) {
          setFetchError(err?.response?.data?.detail || err?.message || "Failed to fetch user data.");
          showErrorToast(err, "User data");
        } finally {
          setFetching(false);
        }
      };
      fetchUser();
    }
  }, [id, isAddMode, form]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/users/api/v1/role/`, { headers });
        setRoles(res.data || []);
      } catch (err) {
        showErrorToast(err, "Roles");
      }
    };
    fetchRoles();
  }, []);

  if (!isAddMode && fetching) return <div className="p-6">Loading user data...</div>;
  if (!isAddMode && fetchError) return <div className="p-6 text-red-500">{fetchError}</div>;

  const handleInputChange = (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    form.setFieldValue(field, value);
  };

  const handleRoleChange = (roleId: number, option: any) => {
    setUserData(prev => ({
      ...prev,
      role_name: option.label,
      role_id: roleId
    }));
    form.setFieldValue('role_name', option.label);
    form.setFieldValue('role_id', roleId);
  };

  const handleSave = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const payload = { ...userData };
    if (!payload.password) {
      delete payload.password;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    try {
      if (isAddMode) {
        await axios.post(`${apiUrl}/users/api/v1/admin/add-user/`, payload, { headers });
        showSuccessToast(COMMON_SUCCESS_MESSAGES.CREATED, "User");
      } else {
        await axios.patch(`${apiUrl}/users/api/v1/admin/user/${id}/`, payload, { headers });
        showSuccessToast(COMMON_SUCCESS_MESSAGES.UPDATED, "User");
      }
    } catch (error: any) {
      showErrorToast(error, "User");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <Breadcrumbs 
        items={[{ label: "Users", href: "/app/app/users" }, { label: isAddMode ? "Add New User" : "Edit" }]} 
        showSaveButton={true}
        saveButtonLabel={isAddMode ? "Add User" : "Save Changes"}
        onSaveButtonClick={() => form.submit()}
      />
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={userData}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              name="first_name"
              label="First Name"
              type="text"
              required
              rules={[{ required: true, message: "First name is required" }]}
              value={userData.first_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('first_name', e.target.value)}
            />
            <FormField
              name="last_name"
              label="Last Name"
              type="text"
              required
              rules={[{ required: true, message: "Last name is required" }]}
              value={userData.last_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('last_name', e.target.value)}
            />
            <FormField
              name="personal_email"
              label="Personal Email"
              type="email"
              value={userData.personal_email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('personal_email', e.target.value)}
            />
            <FormField
              name="mobile_no"
              label="Mobile No"
              type="text"
              value={userData.mobile_no}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mobile_no', e.target.value)}
            />
            <FormField
              name="address"
              label="Address"
              type="text"
              value={userData.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
            />
            <Form.Item
              name="role_id"
              label="Role"
              rules={[{ required: true, message: "Role is required" }]}
            >
              <Select
                value={userData.role_id}
                onChange={handleRoleChange}
                options={roles.map(role => ({
                  value: role.id,
                  label: role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                }))}
              />
            </Form.Item>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="email"
                label="Email (Username)"
                type="email"
                required
                rules={[{ required: true, message: "Email is required" }]}
                value={userData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
              />
              <FormField
                name="password"
                label="Password"
                type="password"
                required={isAddMode}
                rules={isAddMode ? [{ required: true, message: "Password is required" }] : []}
                placeholder={isAddMode ? "Enter password" : "(Leave empty, if unchanged)"}
                value={userData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
              />
            </div>
          </div>
          <div className="mb-6">
            <FormField
              name="status"
              label="Status"
              type="select"
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "In-Active" },
              ]}
              value={userData.status}
              onChange={(value: string) => handleInputChange('status', value)}
            />
          </div>
        </Form>
      </div>
    </div>
  );
} 