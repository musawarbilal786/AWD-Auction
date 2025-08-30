"use client";

import { Card, Button, Dropdown, Menu } from "antd";
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
    title: "Purchase Value",
    dataIndex: "purchaseValue",
    key: "purchaseValue",
  },
  {
    title: "Buyer Fee",
    dataIndex: "buyerFee",
    key: "buyerFee",
    render: (fee: number) => `$${fee}`,
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
  { key: "1", name: "Test", purchaseValue: "$100 - $12", buyerFee: 10 },
  { key: "2", name: "Basic 4", purchaseValue: "$10,001 - $15,000", buyerFee: 150 },
  { key: "3", name: "Basic 3", purchaseValue: "$5,001 - $10,000", buyerFee: 120 },
  { key: "4", name: "Basic 2", purchaseValue: "$1,001 - $5,000", buyerFee: 110 },
  { key: "5", name: "Basic", purchaseValue: "$0 - $1,000", buyerFee: 100 },
];

export default function BuyerFeePage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Buyer Fee", href: "/app/buyer-fee" }]} />
      <div className="p-6">
        <Card>
          <DataTable columns={columns} data={data} tableData={{}} />
        </Card>
      </div>
    </div>
  );
} 