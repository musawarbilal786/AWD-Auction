"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Header from "./Header";
import { navItemsByRole, getDsNavItems, getTransporterNavItems } from "@/data/navItems";

export default function ClientHeader() {
  const user = useSelector((state: RootState) => state.user);
  let navItems = [];
  let roleLabel = "Super Admin";
  let dsMode = false;
  if (user.role === "ds") {
    navItems = getDsNavItems(user.backendRole || "BOTH");
    roleLabel = user.backendRole || "D/S";
    dsMode = true;
  } else if (user.role === "transporter") {
    navItems = getTransporterNavItems();
    roleLabel = "Transporter";
    dsMode = true;
  } else if (user.role === "inspector") {
    navItems = navItemsByRole["inspector"] || [];
    roleLabel = "Inspector";
  } else {
    navItems = navItemsByRole["superadmin"] || [];
    roleLabel = "Super Admin";
  }
  return <Header navItems={navItems} roleLabel={roleLabel} dsMode={dsMode} />;
} 