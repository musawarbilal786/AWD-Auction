"use client";

import { Card, Button, Dropdown, Menu, Tag } from "antd";
import { EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const columns = [
  {
    title: "Slab Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (type: string) => type === "percentage" ? "Percentage" : "Fixed",
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
    render: (value: number, record: any) => record.type === "percentage" ? `%${value}` : `$${value}`,
  },
  {
    title: "Is Default",
    dataIndex: "isDefault",
    key: "isDefault",
    render: (isDefault: boolean) => isDefault ? "Default" : "",
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => {
      const menu = (
        <Menu>
          <Menu.Item key="edit" icon={<EditOutlined />}>Edit</Menu.Item>
          <Menu.Item key="delete" icon={<DeleteOutlined />} danger>Delete</Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            <span className="flex items-center gap-1">
              <SettingOutlined /> <DownOutlined />
            </span>
          </Button>
        </Dropdown>
      );
    },
  },
];

const data = [
  { key: "1", name: "Basic %2", type: "percentage", value: 2, isDefault: false },
  { key: "2", name: "Basic $10", type: "fixed", value: 10, isDefault: true },
];

export default function SellerFeesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Seller Fees Types", href: "/app/seller-fees" }]} />
      <div className="p-6">
        <Card>
          <DataTable columns={columns} data={data} tableData={{}} />
        </Card>
      </div>
    </div>
  );
} 