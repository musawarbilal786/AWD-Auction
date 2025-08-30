"use client";

import { useState } from "react";
import { Input, Select, Button, Card, message } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AddRolePage() {
  const [form, setForm] = useState({
    name: "",
    type: "Fixed",
    status: 1,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string | number) => {
    setForm({ ...form, [field]: value });
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log(form);
      await axios.post(`${apiUrl}/users/api/v1/role/`, form, { headers });
      showSuccessToast(COMMON_SUCCESS_MESSAGES.CREATED, "Role");
      router.push("/app/roles");
    } catch (error) {
      showErrorToast(error, "Role creation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={[{ label: "Roles", href: "/app/roles" }, { label: "Add New Role" }]} />
      <Card className="mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-semibold">Role Name</label>
            <Input
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Enter role name"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Type</label>
            <Select
              value={form.type}
              onChange={value => handleChange("type", value)}
              options={[
                { value: "Fixed", label: "Fixed" },
                { value: "Flexible", label: "Flexible" },
              ]}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Status</label>
            <Select
              value={form.status}
              onChange={value => handleChange("status", value)}
              options={[
                { value: 1, label: "Active" },
                { value: 0, label: "Inactive" },
              ]}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onFinish} className="px-8 text-white py-2 bg-sky-600 hover:bg-sky-700 rounded-md">
            Save
            {loading && <span className="ml-2">Saving...</span>}
          </button>
        </div>
      </Card>
    </div>
  );
} 