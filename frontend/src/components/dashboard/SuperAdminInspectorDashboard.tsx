"use client";
import { Card } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SendOutlined,
} from "@ant-design/icons";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const cards = [
  {
    icon: <ClockCircleOutlined style={{ fontSize: 64, color: '#b3d1f7' }} />,
    label: "Pending Inspections",
    value: 40,
  },
  {
    icon: <CheckCircleOutlined style={{ fontSize: 64, color: '#b3d1f7' }} />,
    label: "Ready For Auctions",
    value: 30,
  },
  {
    icon: <ToolOutlined style={{ fontSize: 64, color: '#b3d1f7' }} />,
    label: "Live Auctions",
    value: 8,
  },
  {
    icon: <SendOutlined style={{ fontSize: 64, color: '#b3d1f7' }} />,
    label: "Sold Cars",
    value: 14,
  },
];

export default function SuperAdminInspectorDashboard() {
  return (
    <div className="font-arial p-4 md:p-8 bg-gray-100 min-h-screen">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
      <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div className="flex flex-row items-center gap-6 rounded-xl shadow-sm border h-40 p-4" key={idx}>
              <div className="">
                {card.icon}
              </div>
              <div className="flex flex-col justify-center w-2/3">
                <span className="text-gray-500 text-base mb-1">{card.label}</span>
                <span className="text-blue-600 text-2xl">{card.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 