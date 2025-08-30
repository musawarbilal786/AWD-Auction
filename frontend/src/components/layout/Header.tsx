"use client";
import React, { useState } from "react";
import {
  MenuOutlined,
  FullscreenOutlined,
  RollbackOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import NotificationBell from "@/components/common/NotificationBell";
import { Drawer, Button, Avatar, Dropdown, Menu } from "antd";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { usePageTitle } from "@/context/PageTitleContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/userSlice";

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: NavItem[];
  key?: string;
}

interface HeaderProps {
  navItems: NavItem[];
  roleLabel?: string;
  dsMode?: boolean;
  children?: React.ReactNode;
}

export default function Header({ navItems, roleLabel, dsMode = false, children }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  // Dropdown menu for user profile
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Account Settings
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

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

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleMenuClick = (key: string) => {
    setSelectedKeys([key]);
    setDrawerOpen(false);
  };

  const renderMenuItem = (item: NavItem) => {
    if (item.children) {
      const menuItems = item.children.map(child => ({
        key: child.key || child.label.toLowerCase(),
        icon: child.icon,
        label: child.href ? <Link href={child.href}>{child.label}</Link> : child.label,
        children: child.children?.map(subChild => ({
          key: subChild.key || subChild.label.toLowerCase(),
          label: <Link href={subChild.href || '#'}>{subChild.label}</Link>
        }))
      }));

      return (
        <Dropdown key={item.label} menu={{ items: menuItems }} trigger={["hover"]} placement="bottomLeft">
          <Link
            href={item.href || "#"}
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors text-base font-normal cursor-pointer"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        </Dropdown>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href || "#"}
        className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors text-base font-normal"
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  const convertToMenuItems = (items: NavItem[]) => {
    return items.map(item => {
      if (item.children) {
        return {
          key: item.label.toLowerCase(),
          icon: item.icon,
          label: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
          children: item.children.map(child => ({
            key: child.key || child.label.toLowerCase(),
            icon: child.icon,
            label: child.href ? <Link href={child.href}>{child.label}</Link> : child.label,
            children: child.children?.map(subChild => ({
              key: subChild.key || subChild.label.toLowerCase(),
              label: <Link href={subChild.href || '#'}>{subChild.label}</Link>
            }))
          }))
        };
      }
      return {
        key: item.label.toLowerCase(),
        icon: item.icon,
        label: <Link href={item.href || '#'}>{item.label}</Link>
      };
    });
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
          {roleLabel && (
            <span className="ml-2 text-[#f5a623] font-semibold hidden md:inline">/ {roleLabel}</span>
          )}
        </div>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Top right buttons (add more if needed) */}
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
        <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight" arrow>
          <Avatar size={40} src={user.avatar} className="bg-blue-100 cursor-pointer" />
        </Dropdown>
      </div>
      {/* Bottom Bar: Navigation (desktop/tablet only) */}
      <div className="hidden lg:flex px-4 md:px-8 h-14 items-center gap-x-6 border-b border-gray-200 bg-white">
        <nav className="flex flex-1 flex-wrap gap-x-6 gap-y-2">
          {navItems.map(item => renderMenuItem(item))}
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
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={convertToMenuItems(navItems)}
            className="border-0"
            onClick={({ key }) => handleMenuClick(key)}
          />
        </div>
      </Drawer>
    </header>
  );
} 