"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import SuperAdminInspectorDashboard from "@/components/dashboard/SuperAdminInspectorDashboard";
import DsDashboard from "@/components/dashboard/DsDashboard";
import TransporterDashboard from "@/components/dashboard/TransporterDashboard";

export default function DashboardPage() {
  const role = useSelector((state: RootState) => state.user.role);
  console.log({role})
  if (role === "ds") {
    return <DsDashboard />;
  } else if (role === "transporter") {
    return <TransporterDashboard />;
  }
  return <SuperAdminInspectorDashboard />;
} 