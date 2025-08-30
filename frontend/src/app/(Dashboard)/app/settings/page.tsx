"use client";

import { useState } from "react";
import { Card } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import FeesAndCharges from "@/components/settings/FeesAndCharges";
import AuctionSetting from "@/components/settings/AuctionSetting";
import FedExInfo from "@/components/settings/FedExInfo";
import Security from "@/components/settings/Security";
import Other from "@/components/settings/Other";
import APIs from "@/components/settings/APIs";
import EmailSettings from "@/components/settings/EmailSettings";
import Maintenance from "@/components/settings/Maintenance";
import Messages from "@/components/settings/Messages";
import Reset from "@/components/settings/Reset";

const tabs = [
  { key: "fees", label: "Fees And Charges", content: <FeesAndCharges /> },
  { key: "auction", label: "Auction Setting", content: <AuctionSetting /> },
  { key: "fedex", label: "FedEx Information", content: <FedExInfo /> },
  { key: "security", label: "Security", content: <Security /> },
  { key: "other", label: "Other", content: <Other /> },
  { key: "apis", label: "APIs", content: <APIs /> },
  { key: "email", label: "Email Settings", content: <EmailSettings /> },
  { key: "maintenance", label: "Maintenance", content: <Maintenance /> },
  { key: "messages", label: "Messages", content: <Messages /> },
  { key: "reset", label: "Reset", content: <Reset /> },
];

export default function SettingsPage() {
  const role = useSelector((state: RootState) => state.user.role);
  if (role === "ds") return <div>Settings Page</div>;
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const activeTabObj = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/app/settings" }]} />
      <Card className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-r bg-gray-50 md:sticky top-0 z-10">
            <ul className="flex flex-col overflow-x-auto md:overflow-x-visible">
              {tabs.map(tab => (
                <li key={tab.key}>
                  <button
                    className={`w-full text-left px-6 py-3 font-semibold transition-colors duration-150 ${activeTab === tab.key ? "bg-sky-600 text-white" : "hover:bg-sky-100 text-sky-700"}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Content Area */}
          <div className="flex-1 pl-4 min-h-[400px] w-full">{activeTabObj?.content}</div>
        </div>
      </Card>
    </div>
  );
} 