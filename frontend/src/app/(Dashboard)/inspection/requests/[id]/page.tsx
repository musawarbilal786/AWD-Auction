"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Card, Spin, Tag } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { showErrorToast, COMMON_ERROR_MESSAGES } from "@/utils/errorHandler";

const DetailItem = ({ title, content, className }: { title: string, content: React.ReactNode, className?: string }) => (
  <div className={className}>
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="font-semibold text-base">{content || "N/A"}</p>
  </div>
);

export default function InspectionRequestDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchRequestDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const response = await axios.get(`${apiUrl}/inspections/api/v1/requests/${id}/`, { headers });
          setData(response.data);
        } catch (err: any) {
          setError(err?.response?.data?.detail || err?.message || "Failed to fetch inspection request details.");
          showErrorToast(err, "Inspection request details");
        } finally {
          setLoading(false);
        }
      };
      fetchRequestDetails();
    }
  }, [id]);

  const breadcrumbItems = [
    { label: "Inspection", href: "/inspection" },
    { label: "Requests", href: "/inspection/requests" },
    { label: `Details` },
  ];

  if (loading) {
    return (
      <main>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="p-6 flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
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

  if (!data) {
    return (
      <main>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="p-6 text-center">No data found for this request.</div>
      </main>
    );
  }

  const statusText = data.inspector_assigned ? "Inspector Assigned" : "Pending";
  const statusColor = data.inspector_assigned ? "blue" : "default";

  return (
    <main>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="p-6">
        <Card>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Request ID {data.id}</h2>
              <p className="text-gray-600">{data.vin} | {data.odometer} Miles</p>
            </div>
            <div>
              <span className="text-gray-500">Status : </span>
              <Tag color={statusColor}>{statusText}</Tag>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <DetailItem title="ROUGH" content={`$${data.rough}`} />
              <DetailItem title="AVERAGE" content={`$${data.average}`} />
              <DetailItem title="CLEAN" content={`$${data.clean}`} />
            </div>
          </div>

          <div className="my-6 py-4 border-t border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-700 uppercase tracking-wide">Expected Reserve Price</h3>
                <p className="text-sm text-gray-500 mt-2">Expected reserve price</p>
                {data.description && (
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">Description:</span> {data.description}
                  </p>
                )}
              </div>
              <p className="text-3xl font-bold text-sky-700">
                ${data.expected_price != null ? data.expected_price.toLocaleString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 border rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-4">VIN</h3>
              <DetailItem title="VIN" content={data.vin} />
              <DetailItem title="Dealership" content={data.dealer?.dealership_name} />
              <DetailItem title="Inspection Address" content={
                <>
                  <p>{data.inspection_location?.address}</p>
                  <p>{data.inspection_location?.city?.name}, {data.inspection_location?.state?.name} {data.inspection_location?.zip}</p>
                </>
              } />
              <DetailItem title="Email" content={data.inspection_location?.email} />
              <DetailItem title="Phone" content={data.inspection_location?.phone} />
            </div>

            <div className="space-y-4 p-6 border rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-4">VEHICLE DETAILS</h3>
              <DetailItem title="Vehicle" content={`${data.year} ${data.make} ${data.model}`} />
              <DetailItem title="Transmission" content={data.transmission} />
              <DetailItem title="Drivetrain" content={data.drivetrain} />
              <DetailItem title="Odometer" content={`${data.odometer} Miles`} />
              <DetailItem title="Actual Mileage" content={data.unknown_mileage ? 'No' : 'Yes'} />
              <DetailItem title="Title Absent" content={data.title_absent ? 'Yes' : 'No'} />
              <DetailItem title="Title Branded" content={data.title_branded ? 'Yes' : 'No'} />
            </div>

            <div className="space-y-4 p-6 border rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-4">VEHICLE CONDITION</h3>
              <DetailItem title="Mechanical/Electrical" content={data.mechanical_issue ? 'Issues' : 'No Issues'} />
              <DetailItem title="Frame Damage" content={data.frame_damage ? 'Yes' : 'No Issues'} />
              <DetailItem title="Factory Emissions" content={data.factory_emissions_modified ? 'Modified' : 'No Modifications'} />
              <DetailItem title="Driveability" content={data.driveability_issue ? 'Issues' : 'No Issues'} />
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
} 