"use client";
import React, { useState } from "react";
import {
  HomeOutlined,
  MenuOutlined,
  CloseOutlined,
  RollbackOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import { Drawer, Button, Avatar } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/common/NotificationBell";

const navItems = [
  { label: "Dashboard", icon: <HomeOutlined />, href: "/" },
  { label: "Tasks", icon: <HomeOutlined />, href: "/tasks" },
];

export default function InspectorHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();

  // Fullscreen toggle handler
  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="w-full bg-white shadow z-50">
      {/* Top Bar */}
      <div className="flex items-center px-4 md:px-8 h-16 border-b border-gray-200">
        {/* Hamburger for mobile (left side) */}
        <div className="block md:hidden mr-2">
          <Button
            className="border-none shadow-none"
            type="text"
            icon={<MenuOutlined style={{ fontSize: 24 }} />}
            onClick={() => setDrawerOpen(true)}
          />
        </div>
        {/* Logo and Role */}
        <div className="flex items-center flex-shrink-0">
          <Image src="/awd-logo.png" alt="AWD AUCTIONS" width={120} height={40} className="object-contain" />
          <span className="ml-2 text-[#f5a623] font-semibold hidden md:inline">/ Inspector</span>
        </div>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Top right buttons */}
        <div className="hidden lg:flex items-center gap-4 mr-10">
          <Button
            icon={<RollbackOutlined />}
            type="text"
            aria-label="Go Back"
            onClick={() => router.back()}
          />
          <Button
            icon={<FullscreenOutlined />}
            type="text"
            aria-label="Toggle Fullscreen"
            onClick={handleFullscreen}
          />
          <NotificationBell />
        </div>
        <Avatar size={40} src="/images/dummy-profile-logo.jpg" className="bg-blue-100 cursor-pointer" />
      </div>
      {/* Bottom Bar: Navigation (desktop/tablet only) */}
      <div className="hidden lg:flex px-4 md:px-8 h-14 items-center gap-x-6 border-b border-gray-200 bg-white">
        <nav className="flex flex-1 flex-wrap gap-x-6 gap-y-2">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href || "#"}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors text-base font-normal"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
        className="lg:hidden"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <Image src="/awd-logo.png" alt="AWD Auctions" width={120} height={40} />
            <Button type="text" icon={<CloseOutlined />} onClick={() => setDrawerOpen(false)} />
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href || "#"}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors text-base font-normal py-2"
                onClick={() => setDrawerOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </Drawer>
    </header>
  );
} 