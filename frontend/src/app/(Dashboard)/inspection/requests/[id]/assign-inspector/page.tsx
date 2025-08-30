"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, Spin, Select, Button, message } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

const InfoPair = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex justify-between py-2 border-b">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold">{value || "N/A"}</span>
  </div>
);

export default function AssignInspectorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [requestData, setRequestData] = useState<any>(null);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [selectedInspector, setSelectedInspector] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const requestDetailsPromise = axios.get(`${apiUrl}/inspections/api/v1/requests/${id}/`, { headers });
        const inspectorsPromise = axios.get(`${apiUrl}/inspections/api/v1/inspectors`, { headers });
        
        const [requestRes, inspectorsRes] = await Promise.all([requestDetailsPromise, inspectorsPromise]);
        
        setRequestData(requestRes.data);
        setInspectors(inspectorsRes.data || []);
        if (requestRes.data.inspector_assigned) {
          setSelectedInspector(requestRes.data.inspector_assigned.id);
        }

      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch data.");
        showErrorToast(err, "Inspector assignment data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!selectedInspector) {
      showErrorToast({ message: "Please select an inspector." });
      return;
    }
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.patch(`${apiUrl}/inspections/api/v1/request/${id}/assign-inspector/`, {
        inspector_assigned: selectedInspector
      }, { headers });

      showSuccessToast(COMMON_SUCCESS_MESSAGES.ASSIGNED, "Inspector");
      router.push("/inspection/requests");
    } catch (err: any) {
      showErrorToast(err, "Inspector assignment");
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbItems = [
    { label: "Inspection", href: "/inspection" },
    { label: "Requests", href: "/inspection/requests" },
    { label: `Assign Inspector for Request ${id}` },
  ];

  if (loading) {
    return (
      <main>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="p-6 flex justify-center items-center h-96"><Spin size="large" /></div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="p-6 text-red-500 text-center">{error}</div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumbs 
        items={[{ label: "Inspection", href: "/inspection" }, { label: "Requests", href: "/inspection/requests" }, { label: `Assign Inspector` }]} 
        showSaveButton={true}
        saveButtonLabel={"Save Changes"}
        onSaveButtonClick={() => handleSave()}
      />
      <div className="p-6">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div>
              <InfoPair label="Make" value={requestData.make} />
              <InfoPair label="Model" value={requestData.model} />
              <InfoPair label="Year" value={requestData.year} />
              <InfoPair label="Trim" value={requestData.trim} />
              <InfoPair label="Transmission" value={requestData.transmission} />
              <InfoPair label="Odometer" value={requestData.odometer} />
              <InfoPair label="Expected Price" value={`$${requestData.expected_price}`} />
            </div>
            <div>
              <InfoPair label="Dealer" value={requestData.dealer?.dealership_name} />
              <InfoPair label="Dealer State" value={requestData.inspection_location?.state?.name} />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Available Inspectors</h3>
            <Select
              placeholder="Select..."
              className="w-full md:w-1/3"
              value={selectedInspector}
              onChange={(value) => setSelectedInspector(value)}
              options={inspectors.map(inspector => ({
                value: inspector.id,
                label: inspector.full_name || `${inspector.first_name} ${inspector.last_name}`,
              }))}
            />
          </div>
        </Card>
      </div>
    </main>
  );
} 