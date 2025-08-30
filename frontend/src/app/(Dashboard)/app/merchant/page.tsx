"use client";

import { useState } from "react";
import { Card } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import CompanyDetails from '@/components/merchant-profile/CompanyDetails';
import PersonalInformation from '@/components/merchant-profile/PersonalInformation';
import TaxInformation from '@/components/merchant-profile/TaxInformation';
import EmailAddresses from '@/components/merchant-profile/EmailAddresses';
import SiteLogos from '@/components/merchant-profile/SiteLogos';
import SocialNetworking from '@/components/merchant-profile/SocialNetworking';
// import SocialNetworking from '@/components/merchant-profile/SocialNetworking'; // Uncomment when implemented

const tabs = [
  { key: "company", label: "Company Details", content: <CompanyDetails /> },
  { key: "personal", label: "Personal Information", content: <PersonalInformation /> },
  { key: "tax", label: "Tax Information", content: <TaxInformation /> },
  { key: "email", label: "Email Addresses", content: <EmailAddresses /> },
  { key: "social", label: "Social Networking", content: <SocialNetworking /> },
  { key: "logos", label: "Site Logos", content: <SiteLogos /> },
];

export default function MerchantPage() {
  const role = useSelector((state: RootState) => state.user.role);
  if (role === "ds") return <div>Merchant Profile Page</div>;
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const activeTabObj = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Merchant Profile", href: "/app/merchant" }]} />
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