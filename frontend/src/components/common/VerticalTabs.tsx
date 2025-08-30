import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

interface VerticalTabsProps {
  items: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'antd' | 'sidebar';
}

export default function VerticalTabs({ items, activeKey, onChange, className = '', variant = 'antd' }: VerticalTabsProps) {
  if (variant === 'sidebar') {
    return (
      <ul className={`flex flex-col overflow-x-auto md:overflow-x-visible ${className}`}>
        {items.map(tab => (
          <li key={tab.key}>
            <button
              className={`w-full text-left px-6 py-3 font-semibold transition-colors duration-150 ${activeKey === tab.key ? "bg-sky-600 text-white" : "hover:bg-sky-100 text-sky-700"}`}
              onClick={() => onChange(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    );
  }
  // Default: Ant Design Tabs
  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
      items={items.map(tab => ({ key: tab.key, label: tab.label }))}
      tabPosition="left"
      className={`w-full vertical-tabs ${className}`}
    />
  );
} 