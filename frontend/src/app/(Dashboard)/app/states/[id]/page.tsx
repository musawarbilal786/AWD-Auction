"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input, Select, Button, Card } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import axios from "axios";

type StateForm = {
  name: string;
  code: string;
  country_id: number | undefined;
  status: number;
};

const defaultState: StateForm = {
  name: "",
  code: "",
  country_id: undefined,
  status: 1,
};

export default function StateViewEditPage() {
  const { id } = useParams();
  const isAddMode = id === "add";
  const [form, setForm] = useState<StateForm>(defaultState);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isAddMode);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/utils/api/v1/countries/`, { headers });
        setCountries(res.data || []);
      } catch (err) {
        showErrorToast(err, "Countries");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!isAddMode && id) {
      const fetchState = async () => {
        setFetching(true);
        setFetchError(null);
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const res = await axios.get(`${apiUrl}/utils/api/v1/states/${id}/`, { headers });
          const stateData = res.data;
          setForm({
            name: stateData.name || "",
            code: stateData.code || "",
            country_id: stateData.country?.id || undefined,
            status: stateData.status || 1,
          });
        } catch (err: any) {
          setFetchError(err?.response?.data?.detail || err?.message || "Failed to fetch state data.");
          showErrorToast(err, "State data");
        } finally {
          setFetching(false);
        }
      };
      fetchState();
    }
  }, [id, isAddMode]);

  if (!isAddMode && fetching) return <div className="p-6">Loading state data...</div>;
  if (!isAddMode && fetchError) return <div className="p-6 text-red-500">{fetchError}</div>;

  const handleChange = (field: keyof StateForm, value: string | number) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (isAddMode) {
        await axios.post(`${apiUrl}/utils/api/v1/states/`, form, { headers });
        showSuccessToast(COMMON_SUCCESS_MESSAGES.CREATED, "State");
      } else {
        await axios.patch(`${apiUrl}/utils/api/v1/states/${id}/`, form, { headers });
        showSuccessToast(COMMON_SUCCESS_MESSAGES.UPDATED, "State");
      }
      router.push("/app/states");
    } catch (error: any) {
      showErrorToast(error, "State");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <Breadcrumbs 
        items={[
          { label: "States", href: "/app/states" }, 
          { label: isAddMode ? "Add New State" : "Edit State" }
        ]} 
        showSaveButton={true}
        saveButtonLabel={isAddMode ? "Add State" : "Save Changes"}
        onSaveButtonClick={handleSave}
      />
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-semibold">State Name</label>
            <Input
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Enter state name"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">State Code</label>
            <Input
              value={form.code}
              onChange={e => handleChange("code", e.target.value)}
              placeholder="Enter state code"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Country</label>
            <Select
              value={form.country_id}
              onChange={value => handleChange("country_id", value)}
              placeholder="Select country"
              options={countries.map(country => ({
                value: country.id,
                label: country.name,
              }))}
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
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-8 text-white py-2 bg-sky-600 hover:bg-sky-700 rounded-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isAddMode ? 'Add State' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
} 