"use client";
import "../globals.css";
import ClientHeader from "@/components/layout/ClientHeader";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { navItemsByRole, getDsNavItems, getTransporterNavItems } from "@/data/navItems";
import { Drawer, Button, Menu, Avatar, Dropdown } from "antd";
import Image from "next/image";
import { MenuOutlined, CloseOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/store/userSlice";
import NotificationBell from "@/components/common/NotificationBell";

interface NavItem {
  key?: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.user) || { role: 'superadmin', backendRole: 'SUPER_ADMIN' };
  let navItems = [];
  let dsMode = false;
  if (user.role === "ds") {
    navItems = getDsNavItems(user.backendRole || "BOTH");
    dsMode = true;
  } else if (user.role === "transporter") {
    navItems = getTransporterNavItems();
    dsMode = true;
  } else {
    navItems = navItemsByRole[user.role] || [];
  }
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!access || !user) {
      router.push('/login');
    } else {
      setAuthLoading(false);
    }
  }, [router]);

  if (authLoading) {
    return null; // Or a spinner if you prefer
  }

  function findLabelByHref(items: any[], href: string): string | null {
    for (const item of items) {
      if (item.href === href) return item.label;
      if (item.children) {
        const found = findLabelByHref(item.children, href);
        if (found) return found;
      }
    }
    return null;
  }
  const pageTitle = findLabelByHref(navItems, pathname) || "Dashboard";
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  };
  const userMenu = (
    <div className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="font-semibold text-gray-800">Hamza Faham</div>
      </div>
      <div className="flex flex-col">
        <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"><SettingOutlined />Account Settings</a>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 text-left w-full" type="button" onClick={handleLogout}><LogoutOutlined />Logout</button>
      </div>
    </div>
  );
  const convertToMenuItems = (items: NavItem[]): any[] => items.map(item => item.children ? {
    key: item.label.toLowerCase(),
    icon: item.icon,
    label: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
    children: item.children.map((child: NavItem) => ({
      key: child.key || child.label.toLowerCase(),
      icon: child.icon,
      label: child.href ? <Link href={child.href}>{child.label}</Link> : child.label,
      children: child.children?.map((subChild: NavItem) => ({
        key: subChild.key || subChild.label.toLowerCase(),
        label: <Link href={subChild.href || '#'}>{subChild.label}</Link>
      }))
    }))
  } : {
    key: item.label.toLowerCase(),
    icon: item.icon,
    label: <Link href={item.href || '#'}>{item.label}</Link>
  });

  return (
    dsMode ? (
      <div className="flex min-h-screen bg-[#f8fafc] font-arial">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white min-h-screen">
          <div className="flex items-center justify-center h-20">
            <Image src="/awd-logo.png" alt="AWD AUCTIONS" width={120} height={40} className="object-contain" />
          </div>
          <Menu
            mode="inline"
            items={convertToMenuItems(navItems)}
            className="border-0 mt-2 text-base font-medium"
            style={{ background: 'white' }}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
          />
        </aside>
        {/* Mobile Sidebar Drawer */}
        <Drawer
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={280}
          className="md:hidden"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <Image src="/awd-logo.png" alt="AWD Auctions" width={120} height={40} />
              <Button type="text" icon={<CloseOutlined />} onClick={() => setDrawerOpen(false)} />
            </div>
            <Menu
              mode="inline"
              items={convertToMenuItems(navItems)}
              className="border-0 text-base font-medium"
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              onClick={({ key }) => setDrawerOpen(false)}
            />
          </div>
        </Drawer>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Restore hardcoded DS header */}
          <header className="w-full bg-[#f8fafc]">
            <div className="flex items-center px-0 md:px-0 h-24 justify-between">
              {/* Hamburger for mobile (left side) */}
              <div className="block md:hidden ml-2">
                <Button
                  className="border-none shadow-none"
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: 24 }} />}
                  onClick={() => setDrawerOpen(true)}
                />
              </div>
              {/* Logo and Page Title */}
              <div className="flex items-center gap-6 pl-6">
                <span className="text-3xl font-bold text-gray-900">{pageTitle}</span>
              </div>
              {/* Right: Amount and Avatar */}
              <div className="flex items-center gap-6 pr-6">
                <span className="text-lg font-semibold text-gray-900">$0.00</span>
                <NotificationBell />
                <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight" arrow>
                  <Avatar size={40} src="/images/dummy-profile-logo.jpg" className="bg-blue-100 cursor-pointer" />
                </Dropdown>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-10 bg-[#f8fafc]">
            {children}
          </main>
        </div>
      </div>
    ) : (
      <div className="font-arial">
        <ClientHeader />
        {children}
      </div>
    )
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
