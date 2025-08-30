"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

const SECTION_FIELDS: { [key: string]: { key: string; label: string }[] } = {
  EXTERIOR: [
    { key: "body_demage", label: "Body Demage" },
    { key: "glass_demage", label: "Glass Demage" },
    { key: "lights_demage", label: "Lights Demage" },
    { key: "surface_rust", label: "Surface Rust" },
    { key: "rust", label: "Rust" },
    { key: "previous_repair", label: "Previous Repair" },
    { key: "poor_repair", label: "Poor Repair" },
    { key: "hail_demage", label: "Hail Demage" },
    { key: "aftermarket_parts_exterior", label: "Aftermarket Parts" },
    { key: "paint_meter_readings", label: "Paint Meter Readings" },
  ],
  "FRAME & UNIBODY": [
    { key: "structural_announcements", label: "Structural Announcements" },
    { key: "undercarriage_surface_rust", label: "Undercarriage Surface Rust" },
    { key: "undercarriage_heavy_rust", label: "Undercarriage Heavy Rust" },
    { key: "penetrating_rust", label: "Penetrating Rust" },
  ],
  MECHANICALS: [
    { key: "cold_start", label: "Cold Start" },
    { key: "jump_start_required", label: "Jump Start Required" },
    { key: "engine_not_crank", label: "Engine Not Crank" },
    { key: "engine_not_start", label: "Engine Not Start" },
    { key: "engine_noise", label: "Engine Noise" },
    { key: "engine_knock", label: "Engine Knock" },
    { key: "engine_rough_idle", label: "Engine Rough Idle" },
    { key: "engine_not_enough_power", label: "Engine Not Enough Power" },
    { key: "engine_transmission", label: "Engine Transmission" },
    { key: "engine_odometer", label: "Engine Odometer" },
    { key: "engine_not_stay_running", label: "Engine Not Stay Running" },
    { key: "internal_engine_noise", label: "Internal Engine Noise" },
    { key: "engine_runs_rough", label: "Engine Runs Rough" },
    { key: "engine_timing_issue", label: "Engine Timing Issue" },
    { key: "excessive_smoke", label: "Excessive Smoke" },
    { key: "head_gasket_issue", label: "Head Gasket Issue" },
    { key: "oil_coolant_intermix_on_dipstick", label: "Oil Coolant Intermix On Dipstick" },
    { key: "turbo_or_supercharger_issue", label: "Turbo Or Supercharger Issue" },
    { key: "excessive_exhaust_noise", label: "Excessive Exhaust Noise" },
    { key: "exhaust_modifications", label: "Exhaust Modifications" },
    { key: "suspension_modifications", label: "Suspension Modifications" },
    { key: "emissions_modifications", label: "Emissions Modifications" },
    { key: "emissions_sticker_issue", label: "Emissions Sticker Issue" },
    { key: "catalytic_converters_missing", label: "Catalytic Converters Missing" },
  ],
  "DRIVEABILITY": [
    { key: "vehicle_inop", label: "Vehicle Inop" },
    { key: "transmission_issue", label: "Transmission Issue" },
    { key: "obdii_codes_present", label: "OBDII Codes Present" },
    { key: "4wd_drivetrain_issue", label: "4WD Drivetrain Issue" },
    { key: "steering_issue", label: "Steering Issue" },
    { key: "break_issue", label: "Break Issue" },
    { key: "suspension_issue", label: "Suspension Issue" },
  ],
  "WARNING LIGHTS": [
    { key: "check_engine_light", label: "Check Engine Light" },
    { key: "airbag_light", label: "Airbag Light" },
    { key: "brake_or_abs_light", label: "Brake Or ABS Light" },
    { key: "traction_control_light", label: "Traction Control Light" },
    { key: "tpms_light", label: "TPMS Light" },
    { key: "battery_or_charging_light", label: "Battery Or Charging Light" },
    { key: "other_warning_light", label: "Other Warning Light" },
  ],
  INTERIOR: [
    { key: "seat_damage", label: "Seat Damage" },
    { key: "carpet_damage", label: "Carpet Damage" },
    { key: "dash_instrument_panel_demage", label: "Dash Instrument Panel Demage" },
    { key: "trim_damage", label: "Trim Damage" },
    { key: "odor", label: "Odor" },
    { key: "not_equipped_with_factory_ac", label: "Not Equipped With Factory AC" },
    { key: "electronics_issue", label: "Electronics Issue" },
    { key: "five_digit_odometer", label: "Five Digit Odometer" },
    { key: "sunroof", label: "Sunroof" },
    { key: "navigation", label: "Navigation" },
    { key: "backup_camera", label: "Backup Camera" },
    { key: "aftermarket_interior_accessories", label: "Aftermarket Interior Accessories" },
    { key: "airbag_deployed", label: "Airbag Deployed" },
    { key: "climate_control_not_working", label: "Climate Control Not Working" },
    { key: "leather_or_leather_type_seats", label: "Leather Or Leather Type Seats" },
  ],
  "WHEEL & TIRES": [
    { key: "aftermarket_rims_or_tires", label: "Aftermarket Rims Or Tires" },
    { key: "damaged_wheels", label: "Damaged Wheels" },
    { key: "incorrectly_sized_tires", label: "Incorrectly Sized Tires" },
    { key: "damaged_tires", label: "Damaged Tires" },
    { key: "uneven_tread_wear", label: "Uneven Tread Wear" },
    { key: "mismatched_tires", label: "Mismatched Tires" },
    { key: "missing_spare_tire_and_or_equipment", label: "Missing Spare Tire And Or Equipment" },
  ],
};

function getSectionData(section: string, data: any) {
  // Try to get the section data from the API structure
  const req = data.request_id || {};
  let sectionData = {};
  switch (section) {
    case "EXTERIOR":
      sectionData = req.exterior ? JSON.parse(req.exterior) : {};
      break;
    case "FRAME & UNIBODY":
      sectionData = req.frame ? JSON.parse(req.frame) : {};
      break;
    case "MECHANICALS":
      sectionData = req.mechanical ? JSON.parse(req.mechanical) : {};
      break;
    case "DRIVEABILITY":
      sectionData = req.drivability ? JSON.parse(req.drivability) : {};
      break;
    case "WARNING LIGHTS":
      sectionData = req.warning_lights ? JSON.parse(req.warning_lights) : {};
      break;
    case "INTERIOR":
      sectionData = req.interior ? JSON.parse(req.interior) : {};
      break;
    case "WHEEL & TIRES":
      sectionData = req.wheels ? JSON.parse(req.wheels) : {};
      break;
    default:
      sectionData = {};
  }
  // Some sections may have a 'radio' property with the actual fields
  if ((sectionData as any).radio) return (sectionData as any).radio;
  return sectionData;
}

function SectionModal({ open, onClose, section, data }: { open: boolean, onClose: () => void, section: string | null, data: any }) {
  if (!open || !section) return null;
  const fields = SECTION_FIELDS[section] || [];
  const sectionData = getSectionData(section, data);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-xl font-bold mb-4">{section.replace(/_/g, ' ')}</div>
        <table className="w-full text-sm">
          <tbody>
            {fields.map((f: any) => (
              <tr key={f.key} className="border-b last:border-b-0">
                <td className="py-2 font-semibold uppercase">{f.label}</td>
                <td className="py-2 text-right">{sectionData && sectionData[f.key] !== undefined ? (sectionData[f.key] ? sectionData[f.key] : "NO") : "NO"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UpcomingAuctionDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalSection, setModalSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiUrl}/auctions/api/v1/upcoming/${id}/`, { headers });
        setData(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch auction details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data found.</div>;

  // Extract fields from API response
  const req = data.request_id || {};
  const dealer = req.dealer || {};
  const location = req.inspection_location || {};
  const colors = Array.isArray(req.lights)
    ? req.lights.map((color: string) => ({ color, label: color.charAt(0).toUpperCase() + color.slice(1) }))
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <SectionModal open={!!modalSection} onClose={() => setModalSection(null)} section={modalSection} data={data} />
      {/* Title */}
      <div className="text-2xl md:text-3xl font-bold mb-4">{`${req.year || ''} ${req.make || ''} ${req.model || ''}`.trim()}</div>
      {/* Two-column layout: image/info left, details right */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Image, car info, price, issues */}
        <div className="flex-1 flex flex-col items-start">
          <div className="bg-gray-50 rounded-xl p-8 flex flex-col items-center w-full">
            <img
              src="/images/auth-background.jpg"
              alt={req.title || "Auction Car"}
              className="w-[350px] h-[260px] object-contain rounded border bg-white"
            />
          </div>
          <div className="font-bold text-lg mt-6 mb-1">{`${req.year || ''} ${req.make || ''} ${req.model || ''}`.trim()}</div>
          <div className="text-gray-400 font-mono text-sm mb-1">{req.vin}</div>
          <div className="text-gray-400 text-sm mb-2">{req.odometer ? `${req.odometer} Miles` : null}</div>
          <div className="text-2xl font-bold bg-gray-100 rounded px-4 py-2 mb-6">${req.expected_price || data.expected_price || "N/A"}</div>
          <div className="flex flex-col gap-2 mb-6">
            <div className="font-bold">Body Demage</div>
            <div className="font-bold">Glass Demage</div>
            <div className="font-bold">Lights Demage</div>
            <div className="font-bold">Surface Rust</div>
            <div className="font-bold">Poor Repair</div>
            <div className="font-bold">OBDI Codes</div>
            <div className="font-bold">Incomplete Readiness Monitors</div>
          </div>
        </div>
        {/* Right: Seller, price, description, details, tire measurements, section buttons */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center mb-2">
            <div>
              <span className="text-xs text-gray-500">Seller</span><br />
              <span className="font-bold text-sky-800">{dealer.dealership_name || "Speed Car"}</span><br />
              <span className="text-sky-700 text-sm font-semibold">{location.address || "34021 N US-45, Grayslake, IL 60030,"}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-sky-700 font-semibold">EXPECTED PRICE</span><br />
              <span className="text-2xl font-bold">${req.expected_price || data.expected_price || "N/A"}</span>
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-2">
            {req.description || "I'm Selling My Car In Very Good Price If Any One Interested Contact Me Hurry In Any Case Thank You."}
          </div>
          <table className="w-full text-sm mt-2 border-t">
            <tbody>
              <tr><td className="py-1 font-semibold">Distance</td><td>{location.distance || "718"}</td></tr>
              <tr><td className="py-1 font-semibold">City</td><td>{location.city?.name || "Syracuse, NY"}</td></tr>
              <tr><td className="py-1 font-semibold">VIN</td><td>{req.vin || "BC5RYuHWoZtGREDT2"}</td></tr>
              <tr><td className="py-1 font-semibold">Transmission</td><td>{req.transmission || "transmission"}</td></tr>
              <tr><td className="py-1 font-semibold">Drive Train</td><td>{req.drivetrain || ""}</td></tr>
              <tr><td className="py-1 font-semibold">Engine</td><td>{req.engine || ""}</td></tr>
              <tr><td className="py-1 font-semibold">Fuel Type</td><td>{req.fuel_type || ""}</td></tr>
              <tr><td className="py-1 font-semibold">Year</td><td>{req.year || "1975"}</td></tr>
              <tr><td className="py-1 font-semibold">Make</td><td>{req.make || "Mazda"}</td></tr>
              <tr><td className="py-1 font-semibold">Model</td><td>{req.model || "Aerostar"}</td></tr>
              <tr><td className="py-1 font-semibold">Auction ID</td><td>{data.auction_id || "589660664"}</td></tr>
              <tr><td className="py-1 font-semibold">Auction Date</td><td>{data.created_at ? new Date(data.created_at).toLocaleDateString() : "26/02/2024"}</td></tr>
            </tbody>
          </table>
          {/* Tire Measurements */}
          <div className="mt-4">
            <div className="font-bold">Tire Measurements</div>
            <div className="text-sm text-gray-700">Front Right Tire: <span className="text-gray-400 ml-2">"</span></div>
            <div className="text-sm text-gray-700">Front Left Tire: <span className="text-gray-400 ml-2">"</span></div>
            <div className="text-sm text-gray-700">Back Left Tire: <span className="text-gray-400 ml-2">"</span></div>
            <div className="text-sm text-gray-700">Back Right Tire: <span className="text-gray-400 ml-2">"</span></div>
          </div>
          {/* Section buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {Object.keys(SECTION_FIELDS).map((section: string, i: number) => (
              <button
                key={section}
                className="bg-gray-100 border rounded-lg px-4 py-3 font-semibold text-left hover:bg-sky-50 transition"
                style={{ minWidth: 180 }}
                onClick={() => setModalSection(section)}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 