"use client";
import { useState, useEffect } from "react";
import VerticalTabs from "@/components/common/VerticalTabs";
import { Form, Button } from "antd";
import { FormField } from "@/components/common/FormField";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

// Field name mapping: UI field name -> API field name
const fieldNameMap: Record<string, string> = {
  frontRightCorner: "exterior_front_right_corner",
  backRightCorner: "exterior_back_right_corner",
  rightSide: "exterior_right_side",
  sunroof: "exterior_sunroof",
  // ...add all mappings here as needed
};

const TABS = [
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
  { key: "mechanical", label: "Mechanical" },
  { key: "damage_rust", label: "Demage & Rust" },
  { key: "wheels", label: "Wheels" },
  { key: "warning_lights", label: "Warning Lights" },
  { key: "frame_unibody", label: "Frame/Unibody" },
  { key: "drivability", label: "Drivability" },
];

// List of all yes/no fields
const defaultYesNoFields = [
  "glassDamaged", "lightsDamaged", "surfaceRust", "rust", "previousRepair", "poorQualityRepairs", "hailDamage", "aftermarketParts", "paintMeterReadings",
  // Add all other yes/no field names used in your form here
];
const defaultState: Record<string, any> = {};
defaultYesNoFields.forEach(field => { defaultState[field] = 0; });
// Set default color tag indication to GREEN (0)
defaultState.colorTagIndication = 0;

export default function InspectionFormPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectionId = params.id;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const [activeTab, setActiveTab] = useState("exterior");
  const [form] = Form.useForm();
  // Centralized state for all fields, with yes/no fields defaulting to 0
  const [inspectionData, setInspectionData] = useState<Record<string, any>>(defaultState);
  // Centralized file state for uploads (optional, for AntD Upload controlled mode)
  const [fileLists, setFileLists] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  // Load previous data if resuming
  useEffect(() => {
    const isResume = searchParams.get("resume") === "1";
    console.log("[Resume Inspection Debug] isResume:", isResume, "inspectionId:", inspectionId);
    
    if (!isResume) {
      // First time visit - use localStorage values for color tag indication
      const hasRed = localStorage.getItem(`inspection_${inspectionId}_has_red`);
      const hasGreen = localStorage.getItem(`inspection_${inspectionId}_has_green`);
      
      if (hasRed !== null && hasGreen !== null) {
        const redValue = JSON.parse(hasRed);
        const greenValue = JSON.parse(hasGreen);
        
        // Set color tag indication based on localStorage values
        // If has_green=true and has_red=false, then GREEN is selected (colorTagIndication=0)
        // If has_green=false and has_red=true, then RED is selected (colorTagIndication=1)
        const colorTagIndication = greenValue ? 0 : 1;
        
        setInspectionData(prev => ({ 
          ...prev, 
          colorTagIndication,
          green: greenValue ? 1 : 0,
          red: redValue ? 1 : 0
        }));
        
        // Update form field
        form.setFieldValue("colorTagIndication", colorTagIndication);
      }
      return;
    }
    
    const fetchInspection = async () => {
      setLoading(true);
      try {
        console.log("[Resume Inspection Debug] Fetching:", `${API_BASE_URL}/inspections/api/v1/inspection-report/${inspectionId}/`);
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE_URL}/inspections/api/v1/inspection-report/${inspectionId}/`, {
          method: "GET",
          headers,
        });
        if (!res.ok) throw new Error("Failed to fetch inspection data");
        const data = await res.json();
        console.log("[Resume Inspection Debug] Fetched data:", data);
        
        // Parse all JSON sections and build complete inspection data
        const newInspectionData: Record<string, any> = {};
        const newFileLists: Record<string, any[]> = {};
        
        // Parse exterior section
        if (data.exterior) {
          try {
            const exterior = JSON.parse(data.exterior);
            console.log("[Resume Inspection Debug] Parsed exterior:", exterior);
            
            // Map radio buttons
            if (exterior.radio) {
              newInspectionData.bodyDamage = exterior.radio.body_demage ?? 0;
              newInspectionData.glassDamaged = exterior.radio.glass_demage ?? 0;
              newInspectionData.lightsDamaged = exterior.radio.lights_demage ?? 0;
              newInspectionData.surfaceRust = exterior.radio.surface_rust ?? 0;
              newInspectionData.rust = exterior.radio.rust ?? 0;
              newInspectionData.previousRepair = exterior.radio.previous_repair ?? 0;
              newInspectionData.poorQualityRepairs = exterior.radio.poor_repair ?? 0;
              newInspectionData.hailDamage = exterior.radio.hail_demage ?? 0;
              newInspectionData.aftermarketParts = exterior.radio.aftermarket_parts_exterior ?? 0;
              newInspectionData.paintMeterReadings = exterior.radio.paint_meter_readings ?? 0;
            }
            
            // Map text fields
            if (exterior.text) {
              newInspectionData.bodyDamageText = exterior.text.body_demage ?? "";
              newInspectionData.paintMeterLowValue = exterior.text.paint_meter_low_value ?? "";
              newInspectionData.paintMeterHighValue = exterior.text.paint_meter_high_value ?? "";
              newInspectionData.colorTagReason = exterior.text.color_tag_reason ?? "";
            }
            
            // Map images (convert URLs to fileList format)
            if (exterior.images) {
              Object.entries(exterior.images).forEach(([key, url]) => {
                if (url && typeof url === 'string') {
                  const uiKey = Object.keys(fieldNameMap).find(k => fieldNameMap[k] === key);
                  if (uiKey) {
                    newFileLists[uiKey] = [{
                      uid: `-${Date.now()}-${Math.random()}`,
                      name: url.split('/').pop() || 'file',
                      status: 'done',
                      url: url,
                      originFileObj: null
                    }];
                  }
                }
              });
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing exterior:", e);
          }
        }
        
        // Parse interior section
        if (data.interior) {
          try {
            const interior = JSON.parse(data.interior);
            console.log("[Resume Inspection Debug] Parsed interior:", interior);
            
            if (interior.radio) {
              newInspectionData.seatDamage = interior.radio.seat_damage ?? 0;
              newInspectionData.carpetDamage = interior.radio.carpet_damage ?? 0;
              newInspectionData.dashPanelDamage = interior.radio.dash_instrument_panel_demage ?? 0;
              newInspectionData.interiorTrimDamage = interior.radio.trim_damage ?? 0;
              newInspectionData.interiorOdor = interior.radio.odor ?? 0;
              newInspectionData.noFactoryAC = interior.radio.not_equipped_with_factory_ac ?? 0;
              newInspectionData.electronicsIssue = interior.radio.electronics_issue ?? 0;
              newInspectionData.fiveDigitOdometer = interior.radio.five_digit_odometer ?? 0;
              newInspectionData.interiorSunroofQ = interior.radio.sunroof ?? 0;
              newInspectionData.interiorNavigationQ = interior.radio.navigation ?? 0;
              newInspectionData.backupCamera = interior.radio.backup_camera ?? 0;
              newInspectionData.aftermarketInteriorAccessories = interior.radio.aftermarket_interior_accessories ?? 0;
              newInspectionData.airbagDeployed = interior.radio.airbag_deployed ?? 0;
              newInspectionData.climateControlNotWorking = interior.radio.climate_control_not_working ?? 0;
              newInspectionData.leatherSeats = interior.radio.leather_or_Leather_type_seats ?? 0;
            }
            
            // Map interior images
            if (interior.images) {
              Object.entries(interior.images).forEach(([key, url]) => {
                if (url && typeof url === 'string') {
                  const uiKey = Object.keys(fieldNameMap).find(k => fieldNameMap[k] === key);
                  if (uiKey) {
                    newFileLists[uiKey] = [{
                      uid: `-${Date.now()}-${Math.random()}`,
                      name: url.split('/').pop() || 'file',
                      status: 'done',
                      url: url,
                      originFileObj: null
                    }];
                  }
                }
              });
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing interior:", e);
          }
        }
        
        // Parse mechanical section
        if (data.mechanical) {
          try {
            const mechanical = JSON.parse(data.mechanical);
            console.log("[Resume Inspection Debug] Parsed mechanical:", mechanical);
            
            if (mechanical.radio) {
              newInspectionData.mechColdStart = mechanical.radio.cold_start ?? 0;
              newInspectionData.mechJumpStart = mechanical.radio.jump_start_required ?? 0;
              newInspectionData.mechNoCrank = mechanical.radio.engine_not_crank ?? 0;
              newInspectionData.mechCrankNoStart = mechanical.radio.engine_not_start ?? 0;
              newInspectionData.mechEngineNoise = mechanical.radio.engine_noise ?? 0;
              newInspectionData.mechEngineKnock = mechanical.radio.engine_knock ?? 0;
              newInspectionData.mechRoughIdle = mechanical.radio.engine_rough_dle ?? 0;
              newInspectionData.mechNotEnoughPower = mechanical.radio.engine_not_enough_power ?? 0;
              newInspectionData.mechTransmission = mechanical.radio.engine_transmission ?? "ok";
              newInspectionData.mechOdometer = mechanical.radio.engine_odometer ?? "ok";
              newInspectionData.mechNoStayRunning = mechanical.radio.engine_not_stay_running ?? 0;
              newInspectionData.mechInternalNoise = mechanical.radio.internal_engine_noise ?? 0;
              newInspectionData.mechRunsRough = mechanical.radio.engine_runs_rough ?? 0;
              newInspectionData.mechTimingChain = mechanical.radio.engine_timing_issue ?? 0;
              newInspectionData.mechExcessiveSmoke = mechanical.radio.excessive_smoke ?? 0;
              newInspectionData.mechHeadGasket = mechanical.radio.head_gasket_issue ?? 0;
              newInspectionData.mechOilCoolantIntermix = mechanical.radio.oil_coolant_intermix_on_dipstick ?? 0;
              newInspectionData.mechTurbo = mechanical.radio.turbo_or_supercharger_issue ?? 0;
              newInspectionData.mechExcessiveExhaustNoise = mechanical.radio.excessive_exhaust_noise ?? 0;
              newInspectionData.mechExhaustMod = mechanical.radio.exhaust_modifications ?? 0;
              newInspectionData.mechSuspensionMod = mechanical.radio.suspension_modifications ?? 0;
              newInspectionData.mechEmissionsMod = mechanical.radio.emissions_modifications ?? 0;
              newInspectionData.mechEmissionsSticker = mechanical.radio.emissions_sticker_issue ?? 0;
              newInspectionData.mechCatalyticMissing = mechanical.radio.catalytic_converters_missing ?? 0;
              newInspectionData.mechAftermarketParts = mechanical.radio.aftermarket_parts_mechanical ?? 0;
              newInspectionData.mechAccessoryIssue = mechanical.radio.engine_accessory_issue ?? 0;
              newInspectionData.mechFluidLeak = mechanical.radio.active_fluid_leak ?? 0;
              newInspectionData.mechOilLevel = mechanical.radio.oil_level_issue ?? 0;
              newInspectionData.mechOilCondition = mechanical.radio.oil_condition_issue ?? 0;
              newInspectionData.mechCoolantLevel = mechanical.radio.coolant_level_issue ?? 0;
            }
            
            // Map mechanical images
            if (mechanical.images) {
              Object.entries(mechanical.images).forEach(([key, url]) => {
                if (url && typeof url === 'string') {
                  const uiKey = Object.keys(fieldNameMap).find(k => fieldNameMap[k] === key);
                  if (uiKey) {
                    newFileLists[uiKey] = [{
                      uid: `-${Date.now()}-${Math.random()}`,
                      name: url.split('/').pop() || 'file',
                      status: 'done',
                      url: url,
                      originFileObj: null
                    }];
                  }
                }
              });
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing mechanical:", e);
          }
        }
        
        // Parse wheels section
        if (data.wheels) {
          try {
            const wheels = JSON.parse(data.wheels);
            console.log("[Resume Inspection Debug] Parsed wheels:", wheels);
            
            if (wheels.input) {
              newInspectionData.tireFrontRight = wheels.input.measurement_front_right ?? "";
              newInspectionData.tireFrontLeft = wheels.input.measurement_front_left ?? "";
              newInspectionData.tireBackLeft = wheels.input.measurement_back_left ?? "";
              newInspectionData.tireBackRight = wheels.input.measurement_back_right ?? "";
            }
            
            if (wheels.radio) {
              newInspectionData.aftermarketRimsTires = wheels.radio.aftermarket_rims_or_tires ?? 0;
              newInspectionData.damagedWheels = wheels.radio.damaged_wheels ?? 0;
              newInspectionData.incorrectlySizedTires = wheels.radio.incorrectly_sized_tires ?? 0;
              newInspectionData.damagedTires = wheels.radio.damaged_tires ?? 0;
              newInspectionData.unevenTreadWear = wheels.radio.uneven_tread_wear ?? 0;
              newInspectionData.mismatchedTires = wheels.radio.mismatched_tires ?? 0;
              newInspectionData.missingSpareTire = wheels.radio.missing_spare_tire_and_or_equipment ?? 0;
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing wheels:", e);
          }
        }
        
        // Parse warning_lights section
        if (data.warning_lights) {
          try {
            const warningLights = JSON.parse(data.warning_lights);
            console.log("[Resume Inspection Debug] Parsed warning_lights:", warningLights);
            
            if (warningLights.radio) {
              newInspectionData.checkEngineLight = warningLights.radio.check_engine_light ?? 0;
              newInspectionData.airbagLight = warningLights.radio.airbag_light ?? 0;
              newInspectionData.brakeAbsLight = warningLights.radio.brake_or_abs_light ?? 0;
              newInspectionData.tractionControlLight = warningLights.radio.traction_control_light ?? 0;
              newInspectionData.tpmsLight = warningLights.radio.tpms_light ?? 0;
              newInspectionData.batteryChargingLight = warningLights.radio.battery_or_charging_light ?? 0;
              newInspectionData.otherWarningLight = warningLights.radio.other_warning_light ?? 0;
            }
            
            if (warningLights.text) {
              newInspectionData.otherWarningLightText = warningLights.text.other_warning_light_text ?? "";
            }
            
            if (warningLights.obdii_code) {
              newInspectionData.obdiiCode1 = warningLights.obdii_code.one ?? "";
              newInspectionData.obdiiCode2 = warningLights.obdii_code.two ?? "";
              newInspectionData.obdiiCode3 = warningLights.obdii_code.three ?? "";
              newInspectionData.obdiiCode4 = warningLights.obdii_code.four ?? "";
              newInspectionData.obdiiCode5 = warningLights.obdii_code.five ?? "";
              newInspectionData.obdiiCode6 = warningLights.obdii_code.six ?? "";
              newInspectionData.obdiiCode7 = warningLights.obdii_code.seven ?? "";
              newInspectionData.obdiiCode8 = warningLights.obdii_code.eight ?? "";
              newInspectionData.obdiiCode9 = warningLights.obdii_code.nine ?? "";
              newInspectionData.obdiiCode10 = warningLights.obdii_code.ten ?? "";
            }
            
            if (warningLights.monitor) {
              newInspectionData.monitor1 = warningLights.monitor.one ?? "";
              newInspectionData.monitor2 = warningLights.monitor.two ?? "";
              newInspectionData.monitor3 = warningLights.monitor.three ?? "";
              newInspectionData.monitor4 = warningLights.monitor.four ?? "";
              newInspectionData.monitor5 = warningLights.monitor.five ?? "";
            }
            
            // Map OBDII files
            if (warningLights.images && warningLights.images.obdii_files) {
              if (Array.isArray(warningLights.images.obdii_files) && warningLights.images.obdii_files.length > 0) {
                newFileLists.obdiiFile = warningLights.images.obdii_files.map((url: string, index: number) => ({
                  uid: `-${Date.now()}-${index}`,
                  name: url.split('/').pop() || 'file',
                  status: 'done',
                  url: url,
                  originFileObj: null
                }));
              }
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing warning_lights:", e);
          }
        }
        
        // Parse frame section
        if (data.frame) {
          try {
            const frame = JSON.parse(data.frame);
            console.log("[Resume Inspection Debug] Parsed frame:", frame);
            
            if (frame.radio) {
              newInspectionData.structuralAnnouncements = frame.radio.structural_announcements ?? 0;
              newInspectionData.undercarriageSurfaceRust = frame.radio.undercarriage_surface_rust ?? 0;
              newInspectionData.undercarriageHeavyRust = frame.radio.undercarriage_heavy_rust ?? 0;
              newInspectionData.penetratingRust = frame.radio.penetrating_rust ?? 0;
            }
            
            if (frame.text) {
              newInspectionData.structuralAnnouncementsText = frame.text.structural_announcements_text ?? "";
              newInspectionData.undercarriageSurfaceRustText = frame.text.undercarriage_surface_rust_text ?? "";
              newInspectionData.undercarriageHeavyRustText = frame.text.undercarriage_heavy_rust_text ?? "";
              newInspectionData.penetratingRustText = frame.text.penetrating_rust_text ?? "";
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing frame:", e);
          }
        }
        
        // Parse drivability section
        if (data.drivability) {
          try {
            const drivability = JSON.parse(data.drivability);
            console.log("[Resume Inspection Debug] Parsed drivability:", drivability);
            
            if (drivability.radio) {
              newInspectionData.vehicleInop = drivability.radio.vehicle_inop ?? 0;
              newInspectionData.transmissionIssue = drivability.radio.transmission_issue ?? 0;
              newInspectionData.obdiiCodesPresent = drivability.radio.obdii_codes_present ?? 0;
              newInspectionData.drivetrainIssue = drivability.radio["4wd_drivetrain_issue"] ?? 0;
              newInspectionData.steeringIssue = drivability.radio.steering_issue ?? 0;
              newInspectionData.brakeIssue = drivability.radio.break_issue ?? 0;
              newInspectionData.suspensionIssue = drivability.radio.suspension_issue ?? 0;
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing drivability:", e);
          }
        }
        
        // Parse damage_and_rust section
        if (data.demage_and_rust) {
          try {
            const damageAndRust = JSON.parse(data.demage_and_rust);
            console.log("[Resume Inspection Debug] Parsed damage_and_rust:", damageAndRust);
            
            newInspectionData.damageNotes = damageAndRust.demage_notes ?? "";
            newInspectionData.rustNotes = damageAndRust.rust_notes ?? "";
            
            // Map damage and rust files
            if (damageAndRust.images) {
              if (damageAndRust.images.demage_files && Array.isArray(damageAndRust.images.demage_files)) {
                newFileLists.damageFiles = damageAndRust.images.demage_files.map((url: string, index: number) => ({
                  uid: `-${Date.now()}-damage-${index}`,
                  name: url.split('/').pop() || 'file',
                  status: 'done',
                  url: url,
                  originFileObj: null
                }));
              }
              
              if (damageAndRust.images.rust_files && Array.isArray(damageAndRust.images.rust_files)) {
                newFileLists.rustFiles = damageAndRust.images.rust_files.map((url: string, index: number) => ({
                  uid: `-${Date.now()}-rust-${index}`,
                  name: url.split('/').pop() || 'file',
                  status: 'done',
                  url: url,
                  originFileObj: null
                }));
              }
            }
          } catch (e) {
            console.error("[Resume Inspection Debug] Error parsing damage_and_rust:", e);
          }
        }
        
        // Set color indicators from the inspection report data
        newInspectionData.green = data.green ?? 0;
        newInspectionData.red = data.red ?? 0;
        newInspectionData.yellow = data.yellow ?? 0;
        newInspectionData.purple = data.purple ?? 0;
        
        // Set color tag indication based on request_id.has_red and has_green values
        // These come from the original request data, not the inspection report
        const requestData = data.request_id || {};
        const hasRed = requestData.has_red || false;
        const hasGreen = requestData.has_green || false;
        
        // If has_green=true and has_red=false, then GREEN is selected (colorTagIndication=0)
        // If has_green=false and has_red=true, then RED is selected (colorTagIndication=1)
        newInspectionData.colorTagIndication = hasGreen ? 0 : 1; // 0=GREEN, 1=RED
        
        console.log("[Resume Inspection Debug] Request color values:", { hasRed, hasGreen });
        console.log("[Resume Inspection Debug] Calculated colorTagIndication:", newInspectionData.colorTagIndication);
        
        console.log("[Resume Inspection Debug] Final newInspectionData:", newInspectionData);
        console.log("[Resume Inspection Debug] Final newFileLists:", newFileLists);
        
        // Update both states
        setInspectionData((prev) => ({ ...prev, ...newInspectionData }));
        setFileLists((prev) => ({ ...prev, ...newFileLists }));
        
        // Update AntD form
        form.setFieldsValue(newInspectionData);
        
        // Force re-render for color tag indication with a small delay
        console.log("[Resume Inspection Debug] Setting form field colorTagIndication to:", newInspectionData.colorTagIndication);
        setTimeout(() => {
          form.setFieldValue("colorTagIndication", newInspectionData.colorTagIndication);
        }, 100);
        
      } catch (err) {
        console.error("[Resume Inspection Debug] Error fetching inspection data:", err);
        showErrorToast(err, "Failed to load inspection data");
      } finally {
        setLoading(false);
      }
    };
    fetchInspection();
  }, [API_BASE_URL, inspectionId, searchParams, form]);

  // Handle field changes for all types
  const handleFieldChange = (field: string, e: any) => {
    console.log(`Field change for ${field}:`, e);
    
    if (e && e.fileList !== undefined) {
      // Upload field
      setFileLists(prev => ({ ...prev, [field]: e.fileList }));
      setInspectionData(prev => ({ ...prev, [field]: e.fileList }));
    } else if (e && e.target) {
      console.log(`Setting ${field} to:`, e.target.value);
      setInspectionData(prev => ({ ...prev, [field]: e.target.value }));
    } else {
      console.log(`Setting ${field} to:`, e);
      setInspectionData(prev => ({ ...prev, [field]: e }));
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    const formData = new FormData();

    // 1. Append files with correct API keys
    Object.entries(fileLists).forEach(([uiKey, fileList]) => {
      const apiKey = fieldNameMap[uiKey] || uiKey;
      fileList.forEach((fileObj) => {
        if (fileObj.originFileObj) {
          formData.append(apiKey, fileObj.originFileObj);
        }
      });
    });

    // 2. Build grouped JSON objects for each section
    // --- EXTERIOR ---
    const exterior = {
      radio: {
        body_demage: inspectionData.bodyDamage,
        glass_demage: inspectionData.glassDamaged,
        lights_demage: inspectionData.lightsDamaged,
        surface_rust: inspectionData.surfaceRust,
        rust: inspectionData.rust,
        previous_repair: inspectionData.previousRepair,
        poor_repair: inspectionData.poorQualityRepairs,
        hail_demage: inspectionData.hailDamage,
        aftermarket_parts_exterior: inspectionData.aftermarketParts,
        paint_meter_readings: inspectionData.paintMeterReadings,
      },
      text: {
        body_demage: inspectionData.bodyDamageText,
        paint_meter_low_value: inspectionData.paintMeterLowValue,
        paint_meter_high_value: inspectionData.paintMeterHighValue,
        color_tag_reason: inspectionData.colorTagReason,
      }
    };
    formData.append("exterior", JSON.stringify(exterior));

    // --- INTERIOR ---
    const interior = {
      radio: {
        seat_damage: inspectionData.seatDamage,
        carpet_damage: inspectionData.carpetDamage,
        dash_instrument_panel_demage: inspectionData.dashPanelDamage,
        trim_damage: inspectionData.interiorTrimDamage,
        odor: inspectionData.interiorOdor,
        not_equipped_with_factory_ac: inspectionData.noFactoryAC,
        electronics_issue: inspectionData.electronicsIssue,
        five_digit_odometer: inspectionData.fiveDigitOdometer,
        sunroof: inspectionData.interiorSunroofQ,
        navigation: inspectionData.interiorNavigationQ,
        backup_camera: inspectionData.backupCamera,
        aftermarket_interior_accessories: inspectionData.aftermarketInteriorAccessories,
        airbag_deployed: inspectionData.airbagDeployed,
        climate_control_not_working: inspectionData.climateControlNotWorking,
        leather_or_Leather_type_seats: inspectionData.leatherSeats,
      }
    };
    formData.append("interior", JSON.stringify(interior));

    // --- MECHANICAL ---
    const mechanical = {
      radio: {
        cold_start: inspectionData.mechColdStart,
        jump_start_required: inspectionData.mechJumpStart,
        engine_not_crank: inspectionData.mechNoCrank,
        engine_not_start: inspectionData.mechCrankNoStart,
        engine_noise: inspectionData.mechEngineNoise,
        engine_knock: inspectionData.mechEngineKnock,
        engine_rough_dle: inspectionData.mechRoughIdle,
        engine_not_enough_power: inspectionData.mechNotEnoughPower,
        engine_transmission: inspectionData.mechTransmission,
        engine_odometer: inspectionData.mechOdometer,
        engine_not_stay_running: inspectionData.mechNoStayRunning,
        internal_engine_noise: inspectionData.mechInternalNoise,
        engine_runs_rough: inspectionData.mechRunsRough,
        engine_timing_issue: inspectionData.mechTimingChain,
        excessive_smoke: inspectionData.mechExcessiveSmoke,
        head_gasket_issue: inspectionData.mechHeadGasket,
        oil_coolant_intermix_on_dipstick: inspectionData.mechOilCoolantIntermix,
        turbo_or_supercharger_issue: inspectionData.mechTurbo,
        excessive_exhaust_noise: inspectionData.mechExcessiveExhaustNoise,
        exhaust_modifications: inspectionData.mechExhaustMod,
        suspension_modifications: inspectionData.mechSuspensionMod,
        emissions_modifications: inspectionData.mechEmissionsMod,
        emissions_sticker_issue: inspectionData.mechEmissionsSticker,
        catalytic_converters_missing: inspectionData.mechCatalyticMissing,
        aftermarket_parts_mechanical: inspectionData.mechAftermarketParts,
        engine_accessory_issue: inspectionData.mechAccessoryIssue,
        active_fluid_leak: inspectionData.mechFluidLeak,
        oil_level_issue: inspectionData.mechOilLevel,
        oil_condition_issue: inspectionData.mechOilCondition,
        coolant_level_issue: inspectionData.mechCoolantLevel,
      }     
    };
    formData.append("mechanical", JSON.stringify(mechanical));

    // --- WHEELS ---
    const wheels = {
      input: {
        measurement_front_right: inspectionData.tireFrontRight,
        measurement_front_left: inspectionData.tireFrontLeft,
        measurement_back_left: inspectionData.tireBackLeft,
        measurement_back_right: inspectionData.tireBackRight,
      },
      radio: {
        aftermarket_rims_or_tires: inspectionData.aftermarketRimsTires,
        damaged_wheels: inspectionData.damagedWheels,
        incorrectly_sized_tires: inspectionData.incorrectlySizedTires,
        damaged_tires: inspectionData.damagedTires,
        uneven_tread_wear: inspectionData.unevenTreadWear,
        mismatched_tires: inspectionData.mismatchedTires,
        missing_spare_tire_and_or_equipment: inspectionData.missingSpareTire,
      }
    };
    formData.append("wheels", JSON.stringify(wheels));

    // --- WARNING LIGHTS ---
    const warning_lights = {
      obdii_code: {
        one: inspectionData.obdiiCode1,
        two: inspectionData.obdiiCode2,
        three: inspectionData.obdiiCode3,
        four: inspectionData.obdiiCode4,
        five: inspectionData.obdiiCode5,
        six: inspectionData.obdiiCode6,
        seven: inspectionData.obdiiCode7,
        eight: inspectionData.obdiiCode8,
        nine: inspectionData.obdiiCode9,
        ten: inspectionData.obdiiCode10,
      },
      monitor: {
        one: inspectionData.monitor1,
        two: inspectionData.monitor2,
        three: inspectionData.monitor3,
        four: inspectionData.monitor4,
        five: inspectionData.monitor5,
      },
      radio: {
        check_engine_light: inspectionData.checkEngineLight,
        airbag_light: inspectionData.airbagLight,
        brake_or_abs_light: inspectionData.brakeAbsLight,
        traction_control_light: inspectionData.tractionControlLight,
        tpms_light: inspectionData.tpmsLight,
        battery_or_charging_light: inspectionData.batteryChargingLight,
        other_warning_light: inspectionData.otherWarningLight,
      },
      text: {
        other_warning_light_text: inspectionData.otherWarningLightText,
      }
    };
    formData.append("warning_lights", JSON.stringify(warning_lights));

    // --- FRAME ---
    const frame = {
      radio: {
        structural_announcements: inspectionData.structuralAnnouncements,
        undercarriage_surface_rust: inspectionData.undercarriageSurfaceRust,
        undercarriage_heavy_rust: inspectionData.undercarriageHeavyRust,
        penetrating_rust: inspectionData.penetratingRust,
      },
      text: {
        structural_announcements_text: inspectionData.structuralAnnouncementsText,
        undercarriage_surface_rust_text: inspectionData.undercarriageSurfaceRustText,
        undercarriage_heavy_rust_text: inspectionData.undercarriageHeavyRustText,
        penetrating_rust_text: inspectionData.penetratingRustText,
      }
    };
    formData.append("frame", JSON.stringify(frame));

    // --- DRIVABILITY ---
    const drivability = {
      radio: {
        vehicle_inop: inspectionData.vehicleInop,
        transmission_issue: inspectionData.transmissionIssue,
        obdii_codes_present: inspectionData.obdiiCodesPresent,
        "4wd_drivetrain_issue": inspectionData.drivetrainIssue,
        steering_issue: inspectionData.steeringIssue,
        break_issue: inspectionData.brakeIssue,
        suspension_issue: inspectionData.suspensionIssue,
      }
    };
    formData.append("drivability", JSON.stringify(drivability));

    // 3. Append simple text fields
    formData.append("demage_notes", inspectionData.damageNotes || "");
    formData.append("rust_notes", inspectionData.rustNotes || "");
    
    // Set green/red based on color tag indication
    const colorTagIndication = inspectionData.colorTagIndication ?? 0;
    const greenValue = colorTagIndication === 0 ? "1" : "0"; // GREEN selected = 1, RED selected = 0
    const redValue = colorTagIndication === 1 ? "1" : "0";   // RED selected = 1, GREEN selected = 0
    
    formData.append("green", greenValue);
    formData.append("red", redValue);
    console.log("Color tag indication value being sent:", inspectionData.colorTagIndication);
    console.log("Green value:", greenValue, "Red value:", redValue);
    formData.append("color_tag_indication", colorTagIndication.toString());

    // 4. Submit as before
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      await fetch(`${API_BASE_URL}/inspections/api/v1/inspection-report/${inspectionId}/`, {
        method: "POST",
        body: formData,
        headers,
      });
      
      // Remove localStorage values after successful submission
      localStorage.removeItem(`inspection_${inspectionId}_has_red`);
      localStorage.removeItem(`inspection_${inspectionId}_has_green`);
      
      showSuccessToast(COMMON_SUCCESS_MESSAGES.SAVED, "Inspection report");
      router.push(`/tasks/${inspectionId}`);
    } catch (error) {
      showErrorToast(error, "Inspection report submission");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "exterior":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Images */}
              <div className="space-y-4">
                <div className="font-bold text-lg mb-2">Images</div>
                <FormField
                  type="upload"
                  label="Front Right Corner"
                  name="frontRightCorner"
                  fileList={fileLists.frontRightCorner}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}      
                  onChange={(e: any) => handleFieldChange("frontRightCorner", e)}
                />
                <FormField
                  type="upload"
                  label="Back Right Corner"
                  name="backRightCorner"
                  fileList={fileLists.backRightCorner}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("backRightCorner", e)}
                />
                <FormField
                  type="upload"
                  label="Right Side"
                  name="rightSide"
                  fileList={fileLists.rightSide}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("rightSide", e)}
                />
                <FormField
                  type="upload"
                  label="Sunroof"
                  name="sunroof"
                  fileList={fileLists.sunroof}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("sunroof", e)}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  type="upload"
                  label="Front"
                  name="front"
                  fileList={fileLists.front}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("front", e)}
                />
                <FormField
                  type="upload"
                  label="Back"
                  name="back"
                  fileList={fileLists.back}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("back", e)}
                />
                <FormField
                  type="upload"
                  label="Car Model Badge"
                  name="carModelBadge"
                  fileList={fileLists.carModelBadge}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("carModelBadge", e)}
                />
                <FormField
                  type="upload"
                  label="Windshield Vin"
                  name="windshieldVin"
                  fileList={fileLists.windshieldVin}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("windshieldVin", e)}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  type="upload"
                  label="Front Left Corner"
                  name="frontLeftCorner"
                  fileList={fileLists.frontLeftCorner}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("frontLeftCorner", e)}
                />
                <FormField
                  type="upload"
                  label="Back Left Corner"
                  name="backLeftCorner"
                  fileList={fileLists.backLeftCorner}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("backLeftCorner", e)}
                />
                <FormField
                  type="upload"
                  label="Roof"
                  name="roof"
                  fileList={fileLists.roof}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("roof", e)}
                />
                <FormField
                  type="upload"
                  label="Gas Fill Area Open"
                  name="gasFillAreaOpen"
                  fileList={fileLists.gasFillAreaOpen}
                  uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}
                  onChange={(e: any) => handleFieldChange("gasFillAreaOpen", e)}
                />
              </div>
            </div>
            {/* Wheels Images */}
            <div className="font-bold text-lg mt-8 mb-2">Wheels Images</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                type="upload"
                label="Front Driver Wheel"
                name="frontDriverWheel"
                fileList={fileLists.frontDriverWheel}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("frontDriverWheel", e)}
              />
              <FormField
                type="upload"
                label="Front Passenger Wheel"
                name="frontPassengerWheel"
                fileList={fileLists.frontPassengerWheel}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("frontPassengerWheel", e)}
              />
              <FormField
                type="upload"
                label="Back Driver Wheel"
                name="backDriverWheel"
                fileList={fileLists.backDriverWheel}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("backDriverWheel", e)}
              />
              <FormField
                type="upload"
                label="Back Passenger Wheel"
                name="backPassengerWheel"
                fileList={fileLists.backPassengerWheel} 
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("backPassengerWheel", e)}
              />
            </div>
            {/* Undercarriage Images */}
            <div className="font-bold text-lg mt-8 mb-2">Undercarriage Images</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                type="upload"
                label="Front Driver Wheel"
                name="undercarFrontDriverWheel"
                fileList={fileLists.undercarFrontDriverWheel}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("undercarFrontDriverWheel", e)}
              />
              <FormField
                type="upload"
                label="Under Front Bumper"
                name="underFrontBumper"
                fileList={fileLists.underFrontBumper}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("underFrontBumper", e)}
              />
              <FormField
                type="upload"
                label="Front Passenger Wheel"
                name="undercarFrontPassengerWheel"
                fileList={fileLists.undercarFrontPassengerWheel}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("undercarFrontPassengerWheel", e)}
              />
              <FormField
                type="upload"
                label="Back Driver Wheel"
                name="undercarBackDriverWheel"
                fileList={fileLists.undercarBackDriverWheel}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("undercarBackDriverWheel", e)}
              />
              <FormField
                type="upload"
                label="Under Back Bumper"
                name="underBackBumper"
                fileList={fileLists.underBackBumper}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("underBackBumper", e)}
              />
              <FormField
                type="upload"
                label="Back Passenger Wheel"
                name="undercarBackPassengerWheel"
                fileList={fileLists.undercarBackPassengerWheel}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("undercarBackPassengerWheel", e)}
              />
              <FormField
                type="upload"
                label="Panoramic Photo (front half)"
                name="panoramicFront"
                fileList={fileLists.panoramicFront}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("panoramicFront", e)}
              />
              <FormField
                type="upload"
                label="Panoramic Photo (back half)"
                name="panoramicBack"
                fileList={fileLists.panoramicBack}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("panoramicBack", e)}
              />
            </div>
            {/* Questions */}
            <div className="font-bold text-lg mt-8 mb-2">Questions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="button-group"
                label="Body Damage"
                name="bodyDamage"
                value={inspectionData.bodyDamage ?? 0}
                onChange={(e: any) => handleFieldChange("bodyDamage", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "MODERATE", value: 1 },
                  { label: "MAJOR", value: 2 },
                ]}
              />
              <FormField
                type="button-group"
                label="Glass Damaged/Cracked"
                name="glassDamaged"
                value={inspectionData.glassDamaged ?? 0}
                onChange={(e: any) => handleFieldChange("glassDamaged", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Lights Damaged/Cracked"
                name="lightsDamaged"
                value={inspectionData.lightsDamaged ?? 0}
                onChange={(e: any) => handleFieldChange("lightsDamaged", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Surface Rust"
                name="surfaceRust"
                value={inspectionData.surfaceRust ?? 0}
                onChange={(e: any) => handleFieldChange("surfaceRust", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Rust"
                name="rust"
                value={inspectionData.rust ?? 0}
                onChange={(e: any) => handleFieldChange("rust", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Previous Repair"
                name="previousRepair"
                value={inspectionData.previousRepair ?? 0}
                onChange={(e: any) => handleFieldChange("previousRepair", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Poor Quality Repairs"
                name="poorQualityRepairs"
                value={inspectionData.poorQualityRepairs ?? 0}
                onChange={(e: any) => handleFieldChange("poorQualityRepairs", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Hail Damage"
                name="hailDamage"
                value={inspectionData.hailDamage ?? 0}
                onChange={(e: any) => handleFieldChange("hailDamage", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Aftermarket Parts - Exterior"
                name="aftermarketParts"
                value={inspectionData.aftermarketParts ?? 0}
                onChange={(e: any) => handleFieldChange("aftermarketParts", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Paint Meter Readings"
                name="paintMeterReadings"
                value={inspectionData.paintMeterReadings ?? 0}
                onChange={(e: any) => handleFieldChange("paintMeterReadings", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Color Tag Indication"
                name="colorTagIndication"
                value={inspectionData.colorTagIndication ?? 0}
                onChange={(e: any) => handleFieldChange("colorTagIndication", e)}
                options={[
                  { label: "GREEN", value: 0 },
                  { label: "RED", value: 1 },
                ]}
                key={`colorTagIndication-${inspectionData.colorTagIndication}`}
              />
            </div>
          </div>
        );
      case "interior":
        return (
          <div className="space-y-8">
            {/* Images */}
            <div className="font-bold text-lg mb-2">Images</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                type="upload"
                label="Front Driver Side"
                name="interiorFrontDriverSide"
                fileList={fileLists.interiorFrontDriverSide}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorFrontDriverSide", e)}
              />
              <FormField
                type="upload"
                label="Front Passenger Side"
                name="interiorFrontPassengerSide"
                fileList={fileLists.interiorFrontPassengerSide}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorFrontPassengerSide", e)}
              />
              <FormField
                type="upload"
                label="Backseat Picture From Right Side"
                name="interiorBackseatRight"
                fileList={fileLists.interiorBackseatRight}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorBackseatRight", e)}
              />
              <FormField
                type="upload"
                label="Backseat Picture From Left Side"
                name="interiorBackseatLeft"
                fileList={fileLists.interiorBackseatLeft}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorBackseatLeft", e)}
              />
              <FormField
                type="upload"
                label="Center Stack"
                name="interiorCenterStack"
                fileList={fileLists.interiorCenterStack}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorCenterStack", e)}
              />
              <FormField
                type="upload"
                label="Center Console"
                name="interiorCenterConsole"
                fileList={fileLists.interiorCenterConsole}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorCenterConsole", e)}
              />
              <FormField
                type="upload"
                label="Odometer / Dashboard Full View"
                name="interiorOdometerDashboard"
                fileList={fileLists.interiorOdometerDashboard}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorOdometerDashboard", e)}
              />
              <FormField
                type="upload"
                label="Navigation"
                name="interiorNavigation"
                fileList={fileLists.interiorNavigation}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorNavigation", e)}
              />
              <FormField
                type="upload"
                label="Odometer Mileage"
                name="interiorOdometerMileage"
                fileList={fileLists.interiorOdometerMileage}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorOdometerMileage", e)}
              />
              <FormField
                type="upload"
                label="Trunk Interior"
                name="interiorTrunk"
                fileList={fileLists.interiorTrunk}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorTrunk", e)}
              />
              <FormField
                type="upload"
                label="Under trunk space"
                name="interiorUnderTrunk"
                fileList={fileLists.interiorUnderTrunk}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorUnderTrunk", e)}
              />
              <FormField
                type="upload"
                label="Full View Front Dash & Center Console"
                name="interiorFullDashConsole"
                fileList={fileLists.interiorFullDashConsole}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorFullDashConsole", e)}
              />
              <FormField
                type="upload"
                label="Sunroof"
                name="interiorSunroof"
                fileList={fileLists.interiorSunroof}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorSunroof", e)}
              />
              <FormField
                type="upload"
                label="Car Manual"
                name="interiorCarManual"
                fileList={fileLists.interiorCarManual}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("interiorCarManual", e)}
              />
            </div>
            {/* Questions */}
            <div className="font-bold text-lg mt-8 mb-2">Questions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="button-group"
                label="Seat Damage"
                name="seatDamage"
                value={inspectionData.seatDamage ?? 0}
                onChange={(e: any) => handleFieldChange("seatDamage", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "MODERATE", value: 1 },
                  { label: "MAJOR", value: 2 },
                ]}
              />
              <FormField
                type="button-group"
                label="Carpet Damage"
                name="carpetDamage"
                value={inspectionData.carpetDamage ?? 0}
                onChange={(e: any) => handleFieldChange("carpetDamage", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Dash/Instrument Panel Damage?"
                name="dashPanelDamage"
                value={inspectionData.dashPanelDamage ?? 0}
                onChange={(e: any) => handleFieldChange("dashPanelDamage", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Interior Trim Damage"
                name="interiorTrimDamage"
                value={inspectionData.interiorTrimDamage ?? 0}
                onChange={(e: any) => handleFieldChange("interiorTrimDamage", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Interior Odor"
                name="interiorOdor"
                value={inspectionData.interiorOdor ?? 0}
                onChange={(e: any) => handleFieldChange("interiorOdor", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Not Equipped with Factory A/C?"
                name="noFactoryAC"
                value={inspectionData.noFactoryAC ?? 0}
                onChange={(e: any) => handleFieldChange("noFactoryAC", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Electronics Issue?"
                name="electronicsIssue"
                value={inspectionData.electronicsIssue ?? 0}
                onChange={(e: any) => handleFieldChange("electronicsIssue", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Five Digit Odometer"
                name="fiveDigitOdometer"
                value={inspectionData.fiveDigitOdometer ?? 0}
                onChange={(e: any) => handleFieldChange("fiveDigitOdometer", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Sunroof"
                name="interiorSunroofQ"
                value={inspectionData.interiorSunroofQ ?? 0}
                onChange={(e: any) => handleFieldChange("interiorSunroofQ", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Navigation"
                name="interiorNavigationQ"
                value={inspectionData.interiorNavigationQ ?? 0}
                onChange={(e: any) => handleFieldChange("interiorNavigationQ", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Backup camera"
                name="backupCamera"
                value={inspectionData.backupCamera ?? 0}
                onChange={(e: any) => handleFieldChange("backupCamera", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Aftermarket Interior Accessories"
                name="aftermarketInteriorAccessories"
                value={inspectionData.aftermarketInteriorAccessories ?? 0}
                onChange={(e: any) => handleFieldChange("aftermarketInteriorAccessories", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Airbag Deployed"
                name="airbagDeployed"
                value={inspectionData.airbagDeployed ?? 0}
                onChange={(e: any) => handleFieldChange("airbagDeployed", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Climate Control Not Working"
                name="climateControlNotWorking"
                value={inspectionData.climateControlNotWorking ?? 0}
                onChange={(e: any) => handleFieldChange("climateControlNotWorking", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Leather or Leather Type Seats"
                name="leatherSeats"
                value={inspectionData.leatherSeats ?? 0}
                onChange={(e: any) => handleFieldChange("leatherSeats", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
            </div>
          </div>
        );
      case "mechanical":
        return (
          <div className="space-y-8">
            {/* Images */}
            <div className="font-bold text-lg mb-2">Images</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                type="upload"
                label="Oil Stick"
                name="mechOilStick"
                fileList={fileLists.mechOilStick}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("mechOilStick", e)}
              />
              <FormField
                type="upload"
                label="Emission/Vin Sticker"
                name="mechEmissionVinSticker"
                fileList={fileLists.mechEmissionVinSticker}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("mechEmissionVinSticker", e)}
              />
              <FormField
                type="upload"
                label="Engine Full View"
                name="mechEngineFullView"
                fileList={fileLists.mechEngineFullView}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("mechEngineFullView", e)}
              />
              <FormField
                type="upload"
                label="Coolant"
                name="mechCoolant"
                fileList={fileLists.mechCoolant}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("mechCoolant", e)}
              />
              <FormField
                type="upload"
                label="Starting Sound"
                name="mechStartingSound"
                fileList={fileLists.mechStartingSound}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("mechStartingSound", e)}
              />
              <FormField
                type="upload"
                label="Idle Sound"
                name="mechIdleSound"
                fileList={fileLists.mechIdleSound}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("mechIdleSound", e)}
              />
            </div>
            {/* Questions */}
            <div className="font-bold text-lg mt-8 mb-2">Questions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="button-group"
                label="Cold Start"
                name="mechColdStart"
                value={inspectionData.mechColdStart ?? 0}
                onChange={(e: any) => handleFieldChange("mechColdStart", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Jump Start Required"
                name="mechJumpStart"
                value={inspectionData.mechJumpStart ?? 0}
                onChange={(e: any) => handleFieldChange("mechJumpStart", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Engine Does Not Crank"
                name="mechNoCrank"
                value={inspectionData.mechNoCrank ?? 0}
                onChange={(e: any) => handleFieldChange("mechNoCrank", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Cranks, Does Not Start"
                name="mechCrankNoStart"
                value={inspectionData.mechCrankNoStart ?? 0}
                onChange={(e: any) => handleFieldChange("mechCrankNoStart", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Noise"
                name="mechEngineNoise"
                value={inspectionData.mechEngineNoise ?? 0}
                onChange={(e: any) => handleFieldChange("mechEngineNoise", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Knock"
                name="mechEngineKnock"
                value={inspectionData.mechEngineKnock ?? 0}
                onChange={(e: any) => handleFieldChange("mechEngineKnock", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Rough Idle"
                name="mechRoughIdle"
                value={inspectionData.mechRoughIdle ?? 0}
                onChange={(e: any) => handleFieldChange("mechRoughIdle", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Not Enough Power?"
                name="mechNotEnoughPower"
                value={inspectionData.mechNotEnoughPower ?? 0}
                onChange={(e: any) => handleFieldChange("mechNotEnoughPower", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Transmission"
                name="mechTransmission"
                value={inspectionData.mechTransmission ?? "ok"}
                onChange={(e: any) => handleFieldChange("mechTransmission", e)}
                options={[
                  { label: "OK", value: "ok" },
                  { label: "DELAYED RESPONSE", value: "delayed" },
                  { label: "SLIP", value: "slip" },
                ]}
              />
              <FormField
                type="button-group"
                label="Odometer"
                name="mechOdometer"
                value={inspectionData.mechOdometer ?? "ok"}
                onChange={(e: any) => handleFieldChange("mechOdometer", e)}
                options={[
                  { label: "OK", value: "ok" },
                  { label: "ROLL BACK", value: "rollback" },
                  { label: "EXACT MILEAGE UNSURE", value: "unsure" },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Engine Does Not Stay Running"
                name="mechNoStayRunning"
                value={inspectionData.mechNoStayRunning ?? 0}
                onChange={(e: any) => handleFieldChange("mechNoStayRunning", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Internal Engine Noise"
                name="mechInternalNoise"
                value={inspectionData.mechInternalNoise ?? 0}
                onChange={(e: any) => handleFieldChange("mechInternalNoise", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Runs Rough/Hesitation"
                name="mechRunsRough"
                value={inspectionData.mechRunsRough ?? 0}
                onChange={(e: any) => handleFieldChange("mechRunsRough", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Timing Chain/Camshaft Issue"
                name="mechTimingChain"
                value={inspectionData.mechTimingChain ?? 0}
                onChange={(e: any) => handleFieldChange("mechTimingChain", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Excessive Smoke from Exhaust"
                name="mechExcessiveSmoke"
                value={inspectionData.mechExcessiveSmoke ?? 0}
                onChange={(e: any) => handleFieldChange("mechExcessiveSmoke", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Head Gasket Issue"
                name="mechHeadGasket"
                value={inspectionData.mechHeadGasket ?? 0}
                onChange={(e: any) => handleFieldChange("mechHeadGasket", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Problem: Oil/Coolant Intermix on Dipstick"
                name="mechOilCoolantIntermix"
                value={inspectionData.mechOilCoolantIntermix ?? 0}
                onChange={(e: any) => handleFieldChange("mechOilCoolantIntermix", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Turbo/Supercharger Issue"
                name="mechTurbo"
                value={inspectionData.mechTurbo ?? 0}
                onChange={(e: any) => handleFieldChange("mechTurbo", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Excessive Exhaust Noise"
                name="mechExcessiveExhaustNoise"
                value={inspectionData.mechExcessiveExhaustNoise ?? 0}
                onChange={(e: any) => handleFieldChange("mechExcessiveExhaustNoise", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Exhaust Modifications"
                name="mechExhaustMod"
                value={inspectionData.mechExhaustMod ?? 0}
                onChange={(e: any) => handleFieldChange("mechExhaustMod", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Suspension Modifications"
                name="mechSuspensionMod"
                value={inspectionData.mechSuspensionMod ?? 0}
                onChange={(e: any) => handleFieldChange("mechSuspensionMod", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Emissions Modifications"
                name="mechEmissionsMod"
                value={inspectionData.mechEmissionsMod ?? 0}
                onChange={(e: any) => handleFieldChange("mechEmissionsMod", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Emissions Sticker Issue"
                name="mechEmissionsSticker"
                value={inspectionData.mechEmissionsSticker ?? 0}
                onChange={(e: any) => handleFieldChange("mechEmissionsSticker", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Catalytic Converters Missing"
                name="mechCatalyticMissing"
                value={inspectionData.mechCatalyticMissing ?? 0}
                onChange={(e: any) => handleFieldChange("mechCatalyticMissing", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Aftermarket Parts - Mechanical"
                name="mechAftermarketParts"
                value={inspectionData.mechAftermarketParts ?? 0}
                onChange={(e: any) => handleFieldChange("mechAftermarketParts", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Engine Accessory Issue"
                name="mechAccessoryIssue"
                value={inspectionData.mechAccessoryIssue ?? 0}
                onChange={(e: any) => handleFieldChange("mechAccessoryIssue", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Active Fluid Leak"
                name="mechFluidLeak"
                value={inspectionData.mechFluidLeak ?? 0}
                onChange={(e: any) => handleFieldChange("mechFluidLeak", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Oil Level Issue"
                name="mechOilLevel"
                value={inspectionData.mechOilLevel ?? 0}
                onChange={(e: any) => handleFieldChange("mechOilLevel", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Oil Condition Issue"
                name="mechOilCondition"
                value={inspectionData.mechOilCondition ?? 0}
                onChange={(e: any) => handleFieldChange("mechOilCondition", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Coolant Level Issue"
                name="mechCoolantLevel"
                value={inspectionData.mechCoolantLevel ?? 0}
                onChange={(e: any) => handleFieldChange("mechCoolantLevel", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
            </div>
          </div>
        );
      case "wheels":
        return (
          <div className="space-y-8">
            {/* Tire Measurements */}
            <div className="font-bold text-lg mb-2">Tire Measurements</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                type="text"
                label="Front Right Tire"
                name="tireFrontRight"
                value={inspectionData.tireFrontRight}
                onChange={(e: any) => handleFieldChange("tireFrontRight", e)}
              />
              <FormField
                type="text"
                label="Front Left Tire"
                name="tireFrontLeft"
                value={inspectionData.tireFrontLeft}
                onChange={(e: any) => handleFieldChange("tireFrontLeft", e)}
              />
              <FormField
                type="text"
                label="Back Left Tire"
                name="tireBackLeft"
                value={inspectionData.tireBackLeft}
                onChange={(e: any) => handleFieldChange("tireBackLeft", e)}
              />
              <FormField
                type="text"
                label="Back Right Tire"
                name="tireBackRight"
                value={inspectionData.tireBackRight}
                onChange={(e: any) => handleFieldChange("tireBackRight", e)}
              />
            </div>
            {/* Questions */}
            <div className="font-bold text-lg mt-8 mb-2">Questions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="button-group"
                label="Aftermarket Rims / Tires"
                name="aftermarketRimsTires"
                value={inspectionData.aftermarketRimsTires ?? 0}
                onChange={(e: any) => handleFieldChange("aftermarketRimsTires", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Damaged Wheels"
                name="damagedWheels"
                value={inspectionData.damagedWheels ?? 0}
                onChange={(e: any) => handleFieldChange("damagedWheels", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Incorrectly Sized Tires"
                name="incorrectlySizedTires"
                value={inspectionData.incorrectlySizedTires ?? 0}
                onChange={(e: any) => handleFieldChange("incorrectlySizedTires", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Damaged Tires"
                name="damagedTires"
                value={inspectionData.damagedTires ?? 0}
                onChange={(e: any) => handleFieldChange("damagedTires", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Uneven Tread Wear"
                name="unevenTreadWear"
                value={inspectionData.unevenTreadWear ?? 0}
                onChange={(e: any) => handleFieldChange("unevenTreadWear", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Mismatched Tires"
                name="mismatchedTires"
                value={inspectionData.mismatchedTires ?? 0}
                onChange={(e: any) => handleFieldChange("mismatchedTires", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Missing Spare Tire and / or Equipment"
                name="missingSpareTire"
                value={inspectionData.missingSpareTire ?? 0}
                onChange={(e: any) => handleFieldChange("missingSpareTire", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
            </div>
          </div>
        );
      case "warning_lights":
        return (
          <div className="space-y-8">
            {/* Questions */}
            <div className="font-bold text-lg mb-2">Questions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="button-group"
                label="Check Engine Light"
                name="checkEngineLight"
                value={inspectionData.checkEngineLight ?? 0}
                onChange={(e: any) => handleFieldChange("checkEngineLight", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Airbag Light"
                name="airbagLight"
                value={inspectionData.airbagLight ?? 0}
                onChange={(e: any) => handleFieldChange("airbagLight", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Brake/ABS Light"
                name="brakeAbsLight"
                value={inspectionData.brakeAbsLight ?? 0}
                onChange={(e: any) => handleFieldChange("brakeAbsLight", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Traction Control Light"
                name="tractionControlLight"
                value={inspectionData.tractionControlLight ?? 0}
                onChange={(e: any) => handleFieldChange("tractionControlLight", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="TPMS Light"
                name="tpmsLight"
                value={inspectionData.tpmsLight ?? 0}
                onChange={(e: any) => handleFieldChange("tpmsLight", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Battery/Charging Light"
                name="batteryChargingLight"
                value={inspectionData.batteryChargingLight ?? 0}
                onChange={(e: any) => handleFieldChange("batteryChargingLight", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Other Warning Light"
                name="otherWarningLight"
                value={inspectionData.otherWarningLight ?? 0}
                onChange={(e: any) => handleFieldChange("otherWarningLight", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
            </div>
            {/* OBDII Codes */}
            <div className="font-bold text-lg mt-8 mb-2 flex items-center gap-4">OBDII Codes <FormField type="upload" name="obdiiFile" inputClassName="!p-0 !m-0" labelClassName="!hidden" /></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                type="text"
                label="Code 1"
                name="obdiiCode1"
                value={inspectionData.obdiiCode1}
                onChange={(e: any) => handleFieldChange("obdiiCode1", e)}
              />
              <FormField
                type="text"
                label="Code 2"
                name="obdiiCode2"
                value={inspectionData.obdiiCode2}
                onChange={(e: any) => handleFieldChange("obdiiCode2", e)}
              />
              <FormField
                type="text"
                label="Code 3"
                name="obdiiCode3"
                value={inspectionData.obdiiCode3}
                onChange={(e: any) => handleFieldChange("obdiiCode3", e)}
              />
              <FormField
                type="text"
                label="Code 4"
                name="obdiiCode4"
                value={inspectionData.obdiiCode4}
                onChange={(e: any) => handleFieldChange("obdiiCode4", e)}
              />
              <FormField
                type="text"
                label="Code 5"
                name="obdiiCode5"
                value={inspectionData.obdiiCode5}
                onChange={(e: any) => handleFieldChange("obdiiCode5", e)}
              />
              <FormField
                type="text"
                label="Code 6"
                name="obdiiCode6"
                value={inspectionData.obdiiCode6}
                onChange={(e: any) => handleFieldChange("obdiiCode6", e)}
              />
              <FormField
                type="text"
                label="Code 7"
                name="obdiiCode7"
                value={inspectionData.obdiiCode7}
                onChange={(e: any) => handleFieldChange("obdiiCode7", e)}
              />
              <FormField
                type="text"
                label="Code 8"
                name="obdiiCode8"
                value={inspectionData.obdiiCode8}
                onChange={(e: any) => handleFieldChange("obdiiCode8", e)}
              />
              <FormField
                type="text"
                label="Code 9"
                name="obdiiCode9"
                value={inspectionData.obdiiCode9}
                onChange={(e: any) => handleFieldChange("obdiiCode9", e)}
              />
              <FormField
                type="text"
                label="Code 10"
                name="obdiiCode10"
                value={inspectionData.obdiiCode10}
                onChange={(e: any) => handleFieldChange("obdiiCode10", e)}
              />
            </div>
            {/* Incomplete Readiness Monitors */}
            <div className="font-bold text-lg mt-8 mb-2">Incomplete Readiness Monitors</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <FormField
                type="text"
                label="Monitor 1"
                name="monitor1"
                value={inspectionData.monitor1}
                onChange={(e: any) => handleFieldChange("monitor1", e)}
              />
              <FormField
                type="text"
                label="Monitor 2"
                name="monitor2"
                value={inspectionData.monitor2}
                onChange={(e: any) => handleFieldChange("monitor2", e)}
              />
              <FormField
                type="text"
                label="Monitor 3"
                name="monitor3"
                value={inspectionData.monitor3}
                onChange={(e: any) => handleFieldChange("monitor3", e)}
              />
              <FormField
                type="text"
                label="Monitor 4"
                name="monitor4"
                value={inspectionData.monitor4}
                onChange={(e: any) => handleFieldChange("monitor4", e)}
              />
              <FormField
                type="text"
                label="Monitor 5"
                name="monitor5"
                value={inspectionData.monitor5}
                onChange={(e: any) => handleFieldChange("monitor5", e)}
              />
            </div>
          </div>
        );
      case "frame_unibody":
        return (
          <div className="space-y-8">
            {/* Questions */}
            <div className="font-bold text-lg mb-2">Questions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="button-group"
                label="Structural Announcements"
                name="structuralAnnouncements"
                value={inspectionData.structuralAnnouncements ?? 0}
                onChange={(e: any) => handleFieldChange("structuralAnnouncements", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Undercarriage Surface Rust"
                name="undercarriageSurfaceRust"
                value={inspectionData.undercarriageSurfaceRust ?? 0}
                onChange={(e: any) => handleFieldChange("undercarriageSurfaceRust", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Undercarriage Heavy Rust"
                name="undercarriageHeavyRust"
                value={inspectionData.undercarriageHeavyRust ?? 0}
                onChange={(e: any) => handleFieldChange("undercarriageHeavyRust", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Penetrating Rust"
                name="penetratingRust"
                value={inspectionData.penetratingRust ?? 0}
                onChange={(e: any) => handleFieldChange("penetratingRust", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
            </div>
          </div>
        );
      case "drivability":
        return (
          <div className="space-y-8">
            {/* Questions */}
            <div className="font-bold text-lg mb-2">Questions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="button-group"
                label="Vehicle INOP (Does Not Move)"
                name="vehicleInop"
                value={inspectionData.vehicleInop ?? 0}
                onChange={(e: any) => handleFieldChange("vehicleInop", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Transmission Issue"
                name="transmissionIssue"
                value={inspectionData.transmissionIssue ?? 0}
                onChange={(e: any) => handleFieldChange("transmissionIssue", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="OBDII codes present"
                name="obdiiCodesPresent"
                value={inspectionData.obdiiCodesPresent ?? 0}
                onChange={(e: any) => handleFieldChange("obdiiCodesPresent", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="4x4 / 4WD / Drivetrain Issue"
                name="drivetrainIssue"
                value={inspectionData.drivetrainIssue ?? 0}
                onChange={(e: any) => handleFieldChange("drivetrainIssue", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Steering Issue"
                name="steeringIssue"
                value={inspectionData.steeringIssue ?? 0}
                onChange={(e: any) => handleFieldChange("steeringIssue", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Brake Issue"
                name="brakeIssue"
                value={inspectionData.brakeIssue ?? 0}
                onChange={(e: any) => handleFieldChange("brakeIssue", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
              <FormField
                type="button-group"
                label="Suspension Issue"
                name="suspensionIssue"
                value={inspectionData.suspensionIssue ?? 0}
                onChange={(e: any) => handleFieldChange("suspensionIssue", e)}
                options={[
                  { label: "NO", value: 0 },
                  { label: "YES", value: 1 },
                ]}
              />
            </div>
          </div>
        );
      case "damage_rust":
        return (
          <div className="space-y-8">
            {/* Damages Section */}
            <div>
              <div className="font-bold text-lg mb-2">Damages</div>
              <FormField
                type="textarea"
                label="Notes"
                name="damageNotes"
                value={inspectionData.damageNotes ?? ""}
                onChange={(e: any) => handleFieldChange("damageNotes", e)}
              />
              <FormField
                type="upload"
                label="Add File"
                name="damageFiles"
                fileList={fileLists.damageFiles}
                onChange={(e: any) => handleFieldChange("damageFiles", e)}
              />
            </div>
            {/* Rust Section */}
            <div>
              <div className="font-bold text-lg mb-2">Rust</div>
              <FormField
                type="textarea"
                label="Notes"
                name="rustNotes"
                value={inspectionData.rustNotes ?? ""}
                onChange={(e: any) => handleFieldChange("rustNotes", e)}
              />
              <FormField
                type="upload"
                label="Add File"
                name="rustFiles"
                fileList={fileLists.rustFiles}
                uploadProps={{ maxCount: 1, listType: "picture", maxSize: 400 }}    
                onChange={(e: any) => handleFieldChange("rustFiles", e)}
              />
            </div>
          </div>
        );
      // TODO: Add other tab contents (mechanical, etc.)
      default:
        return <div className="text-gray-400">Coming soon...</div>;
    }
  };

  return (
    <div className="p-6">
      {loading && <div className="mb-4 text-blue-600">Loading previous inspection data...</div>}
      {/* Header with Submit button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inspection Form</h1>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          className="bg-sky-700 hover:bg-sky-800"
          disabled={loading}
        >
          Submit Inspection
        </Button>
      </div>

    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64">
        <VerticalTabs
          items={TABS.map(tab => ({ key: tab.key, label: tab.label }))}
          activeKey={activeTab}
          onChange={setActiveTab}
          variant="sidebar"
        />
      </div>
      <div className="flex-1 bg-white rounded-xl shadow-md p-8">
          <Form form={form} layout="vertical" className="space-y-8" onFinish={handleSubmit}>
          {renderTabContent()}
        </Form>
        </div>
      </div>
    </div>
  );
} 
