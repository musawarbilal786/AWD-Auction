import React, { useState } from "react";
import { Collapse, Switch, Checkbox } from "antd";
import {
  HomeOutlined,
  ToolOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CarOutlined,
  CreditCardOutlined,
  ProfileOutlined,
  UserOutlined,
  IdcardOutlined,
  CheckOutlined,
  HeartOutlined,
  FieldTimeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FileSearchOutlined,
  CloseCircleOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
const { Panel } = Collapse;

// Example permission data structure (easy to extend)
const defaultActions = ["View", "Add", "Edit", "Delete"];
const defaultPermissions = [
  {
    key: "dashboard",
    label: "Dashboard",
    actions: defaultActions,
  },
  {
    key: "app",
    label: "App",
    actions: defaultActions,
    children: [
      { key: "users", label: "Users", actions: defaultActions },
      { key: "roles", label: "Roles", actions: defaultActions },
      { key: "settings", label: "Settings", actions: defaultActions },
      { key: "merchant", label: "Merchant Profile", actions: defaultActions },
      { key: "countries", label: "Countries", actions: defaultActions },
      { key: "states", label: "States", actions: defaultActions },
      { key: "buyer-fee", label: "Buyer Fee", actions: defaultActions },
      { key: "seller-fees", label: "Seller Fees Types", actions: defaultActions },
      {
        key: "forms",
        label: "Forms",
        actions: defaultActions,
        children: [
          { key: "contact-form", label: "Contact Form", actions: defaultActions },
        ],
      },
      {
        key: "career",
        label: "Career",
        actions: defaultActions,
        children: [
          { key: "career", label: "Career", actions: defaultActions },
          { key: "applicents", label: "Applicents", actions: defaultActions },
        ],
      },
      {
        key: "pages",
        label: "Pages",
        actions: defaultActions,
        children: [
          { key: "media", label: "Media", actions: defaultActions },
          { key: "add-vehicle", label: "Add Vehicle", actions: defaultActions },
          { key: "covid-19", label: "Covid 19", actions: defaultActions },
          { key: "resource-center", label: "Resource Center", actions: defaultActions },
          { key: "trust-safety", label: "Trust Safety", actions: defaultActions },
          { key: "about", label: "About", actions: defaultActions },
          { key: "against-discrimination", label: "Against Discrimination", actions: defaultActions },
          { key: "how-it-work", label: "How It Work", actions: defaultActions },
        ],
      },
    ],
  },
  {
    key: "dealerships",
    label: "Dealerships",
    actions: defaultActions,
    children: [
      {
        key: "dealers",
        label: "Dealers",
        actions: defaultActions,
        children: [
          { key: "pending", label: "Pending", actions: defaultActions },
          { key: "approved", label: "Approved", actions: defaultActions },
          { key: "suspended", label: "Suspended", actions: defaultActions },
        ],
      },
      { key: "credits", label: "Credits", actions: defaultActions },
    ],
  },
  {
    key: "inspection",
    label: "Inspection",
    actions: defaultActions,
    children: [
      { key: "pending", label: "Pending", actions: defaultActions },
      { key: "requests", label: "Requests", actions: defaultActions },
      {
        key: "completed",
        label: "Completed",
        actions: defaultActions,
        children: [
          { key: "approved", label: "Approved", actions: defaultActions },
          { key: "denied", label: "Denied", actions: defaultActions },
        ],
      },
      { key: "inspectors", label: "Inspectors", actions: defaultActions },
    ],
  },
  {
    key: "auctions",
    label: "Auctions",
    actions: defaultActions,
    children: [
      { key: "live", label: "Live", actions: defaultActions },
      { key: "won", label: "Won", actions: defaultActions },
      { key: "run-list", label: "Run List", actions: defaultActions },
    ],
  },
  { key: "titles", label: "Titles", actions: defaultActions },
  {
    key: "transportation",
    label: "Transportation",
    actions: defaultActions,
    children: [
      { key: "transporters", label: "Transporters", actions: defaultActions },
      {
        key: "jobs",
        label: "Jobs",
        actions: defaultActions,
        children: [
          { key: "unpicked", label: "Un-Picked", actions: defaultActions },
          { key: "accepted", label: "Accepted", actions: defaultActions },
          { key: "ended", label: "Ended", actions: defaultActions },
        ],
      },
      { key: "charges-slabs", label: "Charges Slabs", actions: defaultActions },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    actions: defaultActions,
    children: [
      { key: "seller-payment", label: "Seller Payment", actions: defaultActions },
      { key: "transporter-payment", label: "Transporter Payment", actions: defaultActions },
    ],
  },
  {
    key: "tickets",
    label: "Tickets",
    actions: defaultActions,
    children: [
      { key: "ticket-list", label: "Tickets List", actions: defaultActions },
      { key: "ticket-statuses", label: "Statuses", actions: defaultActions },
      { key: "ticket-categories", label: "Categories", actions: defaultActions },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    actions: defaultActions,
    children: [
      { key: "financial-report", label: "Financial Report", actions: defaultActions },
    ],
  },
];

type PermissionAction = string;
type PermissionGroup = {
  key: string;
  label: string;
  actions?: PermissionAction[];
  children?: PermissionGroup[];
};

interface PermissionManagerProps {
  permissions?: PermissionGroup[];
  value?: PermissionValues;
  onChange?: (values: PermissionValues) => void;
}

interface PermissionValues {
  [groupKey: string]: {
    [action: string]: boolean;
  };
}

// Helper to get all keys/actions for "grant all"
function getAllPermissionKeys(permissions: PermissionGroup[]): { group: string; actions: PermissionAction[] }[] {
  let keys: { group: string; actions: PermissionAction[] }[] = [];
  permissions.forEach((group: PermissionGroup) => {
    if (group.actions) {
      keys.push({ group: group.key, actions: group.actions });
    }
    if (group.children) {
      group.children.forEach((child: PermissionGroup) => {
        keys.push({ group: child.key, actions: child.actions || [] });
      });
    }
  });
  return keys;
}

// Icon mapping for permission groups
const groupIcons: Record<string, React.ReactNode> = {
  dashboard: <HomeOutlined className="text-lg text-blue-500 mr-2" />,
  app: <ToolOutlined className="text-lg text-blue-500 mr-2" />,
  dealerships: <ShopOutlined className="text-lg text-blue-500 mr-2" />,
  inspection: <SafetyCertificateOutlined className="text-lg text-blue-500 mr-2" />,
  auctions: <AppstoreOutlined className="text-lg text-blue-500 mr-2" />,
  titles: <FileTextOutlined className="text-lg text-blue-500 mr-2" />,
  transportation: <CarOutlined className="text-lg text-blue-500 mr-2" />,
  payments: <CreditCardOutlined className="text-lg text-blue-500 mr-2" />,
  tickets: <IdcardOutlined className="text-lg text-blue-500 mr-2" />,
  reports: <ProfileOutlined className="text-lg text-blue-500 mr-2" />,
  tasks: <HomeOutlined className="text-lg text-blue-500 mr-2" />,
};

export default function PermissionManager({
  permissions = defaultPermissions,
  value,
  onChange,
}: PermissionManagerProps) {
  // State: { [groupKey]: { [action]: boolean } }
  const [permissionValues, setPermissionValues] = useState<PermissionValues>(() => {
    if (value) return value;
    const initial: PermissionValues = {};
    permissions.forEach((group: PermissionGroup) => {
      if (group.actions) {
        initial[group.key] = {};
        group.actions.forEach((action: PermissionAction) => {
          initial[group.key][action] = false;
        });
      }
      if (group.children) {
        group.children.forEach((child: PermissionGroup) => {
          initial[child.key] = {};
          (child.actions || []).forEach((action: PermissionAction) => {
            initial[child.key][action] = false;
          });
        });
      }
    });
    return initial;
  });

  // Grant all permissions
  const allGranted = getAllPermissionKeys(permissions).every(({ group, actions }) =>
    actions.every((action) => permissionValues[group]?.[action])
  );

  const handleGrantAll = (checked: boolean) => {
    const newValues = { ...permissionValues };
    getAllPermissionKeys(permissions).forEach(({ group, actions }) => {
      actions.forEach((action) => {
        newValues[group][action] = checked;
      });
    });
    setPermissionValues(newValues);
    onChange?.(newValues);
  };

  // Group select all
  const handleSelectAllInGroup = (group: PermissionGroup, checked: boolean) => {
    setPermissionValues((prev) => {
      const newValues = { ...prev };
      if (group.actions) {
        group.actions.forEach((action: PermissionAction) => {
          newValues[group.key][action] = checked;
        });
      }
      if (group.children) {
        group.children.forEach((child: PermissionGroup) => {
          (child.actions || []).forEach((action: PermissionAction) => {
            newValues[child.key][action] = checked;
          });
        });
      }
      onChange?.(newValues);
      return newValues;
    });
  };

  // Individual permission toggle
  const handlePermissionChange = (groupKey: string, action: string, checked: boolean) => {
    setPermissionValues((prev) => {
      const newValues = {
        ...prev,
        [groupKey]: { ...prev[groupKey], [action]: checked },
      };
      onChange?.(newValues);
      return newValues;
    });
  };

  // Check if all in group are selected
  const isGroupAllSelected = (group: PermissionGroup) => {
    if (group.actions) {
      return group.actions.every((action: PermissionAction) => permissionValues[group.key][action]);
    }
    if (group.children) {
      return group.children.every((child: PermissionGroup) => {
        if (!child.actions) return true;
        return child.actions.every((action: PermissionAction) => permissionValues[child.key][action]);
      });
    }
    return false;
  };

  return (
    <div>
      <div className="mb-2">
        <Checkbox
          checked={allGranted}
          onChange={(e) => handleGrantAll(e.target.checked)}
          className=""
        >
          Grant all permissions
        </Checkbox>
      </div>
      <br />
      <Collapse bordered={false} expandIconPosition="end" className="bg-white">
        {permissions.map((group) => (
          <Panel
            key={group.key}
            header={
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center text-lg">
                  {groupIcons[group.key] || <AppstoreOutlined className="text-lg text-blue-500 mr-2" />} {group.label}
                </span>
                <Checkbox
                  checked={isGroupAllSelected(group)}
                  onChange={(e) => handleSelectAllInGroup(group, e.target.checked)}
                >
                  Select All
                </Checkbox>
              </div>
            }
            className="!rounded-lg !mb-2 border-2 border-gray-200 shadow-sm"
          >
            {group.actions && (
              <div className="grid grid-cols-2 md:flex gap-4 md:gap-6 items-center mb-4">
                {group.actions.map((action) => (
                  <div key={action} className="flex items-center gap-2">
                    <Switch
                      checked={permissionValues[group.key][action]}
                      onChange={(checked) => handlePermissionChange(group.key, action, checked)}
                         className="bg-gray-200"
                         unCheckedChildren={<CheckOutlined />}
                         checkedChildren={<CloseOutlined />}
                    />
                    <span className="">{action}</span>
                  </div>
                ))}
              </div>
            )}
            {group.children &&
              group.children.map((child) => (
                <div key={child.key} className="mb-4">
                  <div className="font-bold mb-2">{child.label}</div>
                  <div className="grid grid-cols-2 md:flex gap-4 md:gap-6 items-center">
                    {child.actions && child.actions.map((action: PermissionAction) => (
                      <div key={action} className="flex items-center gap-2">
                        <Switch
                          checked={permissionValues[child.key][action]}
                          onChange={(checked) => handlePermissionChange(child.key, action, checked)}
                          className="bg-gray-200"
                        />
                        <span className="">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
} 