import { useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import CompanyDetails from './CompanyDetails';
import PersonalInformation from './PersonalInformation';
import TaxInformation from './TaxInformation';
import EmailAddresses from './EmailAddresses';
import SiteLogos from './SiteLogos';

export default function MerchantProfile() {
  const [activeTab, setActiveTab] = useState('1');

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Company Details',
      children: <CompanyDetails />,
    },
    {
      key: '2',
      label: 'Personal Information',
      children: <PersonalInformation />,
    },
    {
      key: '3',
      label: 'Tax Information',
      children: <TaxInformation />,
    },
    {
      key: '4',
      label: 'Email Addresses',
      children: <EmailAddresses />,
    },
    {
      key: '5',
      label: 'Social Networking',
      children: <div>Social Networking Content</div>,
    },
    {
      key: '6',
      label: 'Site Logos',
      children: <SiteLogos />,
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Merchant Profile</h2>
      <div className="flex gap-8">
        <div className="w-64">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            tabPosition="left"
            className="w-full"
          />
        </div>
        <div className="flex-1">
          {items.find(item => item.key === activeTab)?.children}
        </div>
      </div>
    </div>
  );
} 