"use client";
import { useParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import axios from "axios";
import { useState, useEffect } from "react";
import { showErrorToast } from "@/utils/errorHandler";
import { Button, Tag, Modal, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: 'Pending', color: 'default' },
  1: { label: 'Waiting for speciality approval', color: 'gold' },
  2: { label: 'Inspector Assigned', color: 'blue' },
  3: { label: 'Inspection started', color: 'geekblue' },
  4: { label: 'Inspection Completed', color: 'green' },
  5: { label: 'On Auction', color: 'cyan' },
  6: { label: 'Waiting for buyer confirmation', color: 'purple' },
  7: { label: 'Payment pending', color: 'magenta' },
  8: { label: 'Delivered', color: 'lime' },
};

export default function SpecialityApprovalDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [expectedPriceInput, setExpectedPriceInput] = useState("");
  const [priceLoading, setPriceLoading] = useState(false);

  const openPriceModal = () => {
    setExpectedPriceInput(task.expected_price ? String(task.expected_price) : "");
    setPriceModalOpen(true);
  };
  const closePriceModal = () => setPriceModalOpen(false);

  const handleChangeExpectedPrice = async () => {
    setPriceLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.patch(
        `${apiUrl}/inspections/api/v1/speciality-vehicle/${id}/approve/`,
        { expected_price: expectedPriceInput },
        { headers }
      );
      setPriceModalOpen(false);
      // Refresh data
      const res = await axios.get(`${apiUrl}/inspections/api/v1/requests/${id}/`, { headers });
      setTask(res.data);
    } catch (err: any) {
      showErrorToast(err, "Change Expected Price");
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/inspections/api/v1/requests/${id}/`, { headers });
        setTask(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch data.");
        showErrorToast(err, "Speciality Approval details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTask();
  }, [id]);

  if (loading) return <div className="p-6">Loading data...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!task) return <div className="p-6">Record not found</div>;

  const statusNum = typeof task.status === 'number' ? task.status : Number(task.status);
  const statusObj = STATUS_MAP[statusNum] || { label: task.status_label || task.status || 'N/A', color: 'default' };
  const valuation = task.valuation || {};

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Speciality Approval", href: "/inspection/speciality-approval" }, { label: "Details" }]} />
      <div className="bg-white rounded-xl shadow-md px-6 mb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold text-gray-800 mb-1">Request ID {task.id}</div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div className="">
            <div className="text-2xl font-bold text-blue-900 mb-1">{task.vehicle || task.vehicle_name || 'N/A'}</div>
            <div className="text-gray-600">{task.year || ''} {task.odometer || task.mileage ? `${task.odometer || task.mileage} Miles` : ''}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold">Inspector :</span>
              <span>{task.inspector || task.inspector_name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status :</span>
              <Tag color={statusObj.color} className="text-base">{statusObj.label}</Tag>
            </div>
          </div>
        </div>
        {/* Valuation Table */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 text-center font-bold text-lg text-blue-900">ROUGH</div>
            <div className="flex-1 text-center font-bold text-lg text-blue-900">AVERAGE</div>
            <div className="flex-1 text-center font-bold text-lg text-blue-900">CLEAN</div>
            <div className="text-xs text-gray-500">History adjusted values</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex-1 text-center text-blue-900 text-lg">{valuation.rough ? `$${Number(valuation.rough).toLocaleString()}` : '-'}</div>
            <div className="flex-1 text-center text-blue-900 text-lg">{valuation.average ? `$${Number(valuation.average).toLocaleString()}` : '-'}</div>
            <div className="flex-1 text-center text-blue-900 text-lg">{valuation.clean ? `$${Number(valuation.clean).toLocaleString()}` : '-'}</div>
            <div className="flex-1" />
          </div>
        </div>
        {/* Expected Reserve Price */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <div className="font-semibold text-gray-700 mb-1">EXPECTED RESERVE PRICE</div>
            <div className="text-gray-700">Expected reserve price</div>
            <div className="text-gray-700">Description: <span className="font-semibold">{task.description || 'N/A'}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-blue-900">{task.expected_price ? `$${Number(task.expected_price).toLocaleString()}` : 'N/A'}</span>
            <button
              className="ml-2 px-3 py-1 bg-sky-500 hover:bg-orange-600 text-white rounded font-semibold text-sm"
              onClick={openPriceModal}
            >
              <EditOutlined />{" "}
              Change
            </button>
          </div>
        </div>
        {/* Change Expected Price Modal */}
        <Modal
          open={priceModalOpen}
          onCancel={closePriceModal}
          footer={null}
          centered
          title={<span className="font-bold text-lg">Change Expected Price</span>}
          width={480}
        >
          <div className="flex flex-col gap-6 py-4">
            <Input
              type="number"
              value={expectedPriceInput}
              onChange={e => setExpectedPriceInput(e.target.value)}
              className="text-2xl font-bold w-full px-4 py-3 text-center"
              min={0}
              prefix="$"
              style={{ border: '1px solid #d1d5db' }}
            />
            <div className="flex justify-end gap-4 mt-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded"
                onClick={handleChangeExpectedPrice}
                disabled={priceLoading}
              >
                {priceLoading ? 'Changing...' : 'Change'}
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-8 rounded"
                onClick={closePriceModal}
                disabled={priceLoading}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* VIN/Dealership Card */}
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <div className="font-bold text-blue-900 mb-2 text-lg">VIN</div>
            <div className="mb-1">VIN: <span className="font-bold">{task.vin}</span></div>
            <div>Dealership: <span className="font-bold">{task.dealership || (task.inspection_location?.dealership?.dealership_name) || 'N/A'}</span></div>
            <div>Inspection Address: <span className="font-bold">{task.inspection_location?.address || task.location || 'N/A'}</span></div>
            <div>ZIP: <span className="font-bold">{task.inspection_location?.zip || task.zip || 'N/A'}</span></div>
            <div>Email: <span className="font-bold">{task.email || 'N/A'}</span></div>
            <div>Phone: <span className="font-bold">{task.phone || 'N/A'}</span></div>
          </div>
          {/* Vehicle Details Card */}
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <div className="font-bold text-blue-900 mb-2 text-lg">VEHICLE DETAILS</div>
            <div>Vehicle: <span className="font-bold">{task.vehicle || task.vehicle_name || 'N/A'}</span></div>
            <div>Transmission: <span className="font-bold">{task.transmission || 'N/A'}</span></div>
            <div>Drivetrain: <span className="font-bold">{task.drivetrain || 'N/A'}</span></div>
            <div>Odometer: <span className="font-bold">{task.odometer || task.mileage || 'N/A'}</span></div>
            <div>Year: <span className="font-bold">{task.year || 'N/A'}</span></div>
            <div>Make: <span className="font-bold">{task.make || 'N/A'}</span></div>
            <div>Model: <span className="font-bold">{task.model || 'N/A'}</span></div>
            <div>Actual Mileage: <span className="font-bold">{task.actual_mileage ? 'Yes' : 'No'}</span></div>
            <div>Title Absent: <span className="font-bold">{task.title_absent ? 'Yes' : 'No'}</span></div>
            <div>Title Brand: <span className="font-bold">{task.title_brand ? 'Yes' : 'No'}</span></div>
          </div>
          {/* Vehicle Condition Card */}
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <div className="font-bold text-blue-900 mb-2 text-lg">VEHICLE CONDITION</div>
            <div>Mechanical/Electrical: <span className="font-bold">{task.mechanical_condition || task.condition?.mechanical || 'No issues'}</span></div>
            <div>Frame Damage: <span className="font-bold">{task.frame_damage || task.condition?.frame || 'No'}</span></div>
            <div>Factory Emissions: <span className="font-bold">{task.factory_emissions || task.condition?.emissions || 'No Modifications'}</span></div>
            <div>Driveability: <span className="font-bold">{task.driveability || task.condition?.driveability || 'Yes'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
} 