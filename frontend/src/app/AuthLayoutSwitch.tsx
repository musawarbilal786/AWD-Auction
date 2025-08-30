"use client";
import { usePathname } from "next/navigation";
import AppLayoutInner from "./(Dashboard)/layout";

// Import AppLayoutInner from the same file or export it if needed
import React from "react";


export default function AuthLayoutSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AppLayoutInner>{children}</AppLayoutInner>;
} 