"use client";
import { useParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import axios from "axios";
import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import { Button, Tag } from "antd";

// Status code to label and color mapping
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

export default function TaskDetailsPage() {
  const params = useParams();
  const id = Number(params.id);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/inspections/api/v1/inspector-task/${id}/`, { headers });
        setTask(res.data);
        
        // Store has_red and has_green in localStorage for inspection form
        if (res.data.has_red !== undefined && res.data.has_green !== undefined) {
          localStorage.setItem(`inspection_${id}_has_red`, JSON.stringify(res.data.has_red));
          localStorage.setItem(`inspection_${id}_has_green`, JSON.stringify(res.data.has_green));
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch task data.");
        showErrorToast(err, "Task data");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTask();
  }, [id]);

  const handleMarkAsComplete = async () => {
    setMarkingComplete(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      await axios.patch(`${apiUrl}/inspections/api/v1/inspection-report/${id}/mark-complete/`, {
        inspection_status: 1
      }, { headers });
      
      showSuccessToast(COMMON_SUCCESS_MESSAGES.UPDATED, "Inspection status");
      // Refresh task data to show updated status
      const res = await axios.get(`${apiUrl}/inspections/api/v1/inspector-task/${id}/`, { headers });
      setTask(res.data);
    } catch (err: any) {
      showErrorToast(err, "Marking inspection as complete");
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) return <div className="p-6">Loading task data...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!task) return <div className="p-6">Task not found</div>;

  // Status logic
  const statusNum = typeof task.status === 'number' ? task.status : Number(task.status);
  const statusObj = STATUS_MAP[statusNum] || { label: task.status_label || task.status || 'N/A', color: 'default' };

  // Button logic
  let actionButtons = null;
  if (statusNum === 2) { // Inspector Assigned
    actionButtons = <button className="bg-sky-700 text-white px-4 py-1 rounded-md" onClick={() => router.push(`/tasks/${id}/inspection`)}>Start Inspection</button>;
  } else if (statusNum === 3) { // Inspection started
    actionButtons = <div className="flex gap-2">
      <button 
        className="bg-sky-700 text-white px-4 py-1 rounded-md disabled:opacity-50" 
        onClick={handleMarkAsComplete}
        disabled={markingComplete}
      >
        {markingComplete ? 'Marking...' : 'Mark As Completed'}
      </button>
      <button className="bg-sky-700 text-white px-4 py-1 rounded-md" onClick={() => router.push(`/tasks/${id}/inspection?resume=1`)}>Resume Inspection</button>
    </div>;
  }

  // Valuation values (example fields, adjust as needed)
  const valuation = task.valuation || {};

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Tasks", href: "/tasks" }, { label: "Details" }]} />
      <div className="bg-white rounded-xl shadow-md px-6 mb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold text-gray-800 mb-1">Request ID {task.id}</div>
          <div> {actionButtons}</div>
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
          <div className="text-3xl font-bold text-blue-900">{task.expected_price ? `$${Number(task.expected_price).toLocaleString()}` : 'N/A'}</div>
        </div>
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