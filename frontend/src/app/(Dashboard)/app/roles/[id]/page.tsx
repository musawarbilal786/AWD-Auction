"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Input, Select, Button, Card, message, Form, Radio, Checkbox, Collapse } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PermissionManager from "./PermissionManager";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import axios from "axios";
import { useRouter } from "next/navigation";

// Dummy roles data for demonstration
const roles = [
  { key: 1, name: "Super admin", type: "Fixed", status: "Active" },
  { key: 2, name: "Admin", type: "Fixed", status: "Active" },
  { key: 3, name: "Manager", type: "Fixed", status: "Active" },
  { key: 4, name: "Inspector", type: "Fixed", status: "Inactive" },
  { key: 5, name: "Transporter", type: "Fixed", status: "Inactive" },
  { key: 7, name: "Data Analyser", type: "Fixed", status: "Active" },
];

type RoleForm = {
  key?: number;
  name: string;
  type: string;
  status: string;
};

const defaultRole: RoleForm = {
  name: "",
  type: "Fixed",
  status: "Active",
};

export default function EditViewRolePage() {
  const { id } = useParams();
  const role = roles.find(r => String(r.key) === String(id));
  const [form, setForm] = useState<RoleForm>(role ? { ...role } : defaultRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!role) return <div className="p-6">Role not found</div>;

  const handleChange = (field: keyof RoleForm, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.patch(`${apiUrl}/users/api/v1/role/${id}/`, form, { headers });
      showSuccessToast(COMMON_SUCCESS_MESSAGES.UPDATED, "Role");
      router.push("/app/roles");
    } catch (error) {
      showErrorToast(error, "Role update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mx-auto mt-8">
        <Breadcrumbs items={[{ label: "Roles" }, { label: "Edit" }]} />
        {/* <Button type="primary" loading={loading} onClick={handleSave} className="px-8 h-11 rounded-lg text-white bg-sky-600 hover:bg-sky-700 font-semibold">
          Save
        </Button> */}
      <Form layout="vertical">
        <div className="flex gap-4 mb-6">
          <Form.Item label="Name" name="name" className="flex-1">
            <Input
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Enter role name"
            />
          </Form.Item>
          <Form.Item label="Type" name="type" className="flex-1">
            <Select
              value={form.type}
              onChange={value => handleChange("type", value)}
              options={[
                { value: "Fixed", label: "Fixed" },
                { value: "Flexible", label: "Flexible" },
              ]}
              className="w-full"
            />
          </Form.Item>
        </div>
        <div className="flex items-center gap-8 mb-6">
          <Form.Item label="Status" name="status" className="mb-0">
            <Radio.Group
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <Radio value="Active">Active</Radio>
              <Radio value="Inactive">Inactive</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
        <PermissionManager />
       <div className="flex justify-end">
       <button 
         onClick={handleSave}
         disabled={loading}
         className="px-8 h-11 mt-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 font-semibold"
       >
         {loading ? 'Saving...' : 'Save Changes'}
       </button>
       </div>
      </Form>
    </div>
  );
} 