"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Card, Tag } from "antd";
import DataTable from "@/components/common/DataTable";

const columns = [
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Dealer Name", dataIndex: "dealer", key: "dealer" },
  { title: "Credit Amount", dataIndex: "credit", key: "credit", render: (v: number) => `$${v.toFixed(2)}` },
  { title: "Used Amount", dataIndex: "used", key: "used", render: (v: number) => `$${v.toFixed(2)}` },
  { title: "Balance", dataIndex: "balance", key: "balance", render: (v: number) => `$${v.toFixed(2)}` },
  {
    title: "Useability",
    dataIndex: "useability",
    key: "useability",
    render: (uses: string[]) => uses.map(use => <Tag color="blue" key={use}>{use}</Tag>),
  },
];

const data = [
  { key: "1", date: "05-04-2025", dealer: "Shah Brother", credit: 600, used: 0, balance: 600, useability: ["Inspection"] },
  { key: "2", date: "05-04-2025", dealer: "Shah Brother", credit: 600, used: 0, balance: 600, useability: ["Selling Fee"] },
  { key: "3", date: "04-04-2025", dealer: "test", credit: 100, used: 0, balance: 100, useability: ["Inspection"] },
  { key: "4", date: "28-02-2024", dealer: "Marten Lobo", credit: 200, used: 0, balance: 200, useability: ["Inspection", "Selling Fee", "Buying"] },
  { key: "5", date: "27-02-2024", dealer: "Aladdin Harmon", credit: 50, used: 50, balance: 0, useability: ["Inspection", "Selling Fee", "Buying"] },
  { key: "6", date: "27-02-2024", dealer: "Marten Lobo", credit: 50, used: 50, balance: 0, useability: ["Inspection", "Selling Fee"] },
  { key: "7", date: "27-02-2024", dealer: "Mike angle", credit: 20, used: 0, balance: 20, useability: ["Inspection", "Selling Fee"] },
  { key: "8", date: "26-02-2024", dealer: "Aladdin Harmon", credit: 10, used: 10, balance: 0, useability: ["Inspection", "Selling Fee"] },
];

export default function DealershipsCreditsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Dealerships", href: "/dealerships" }, { label: "Credits" }]} />
      <div className="p-6">
        <Card>
          <DataTable columns={columns} data={data} tableData={{}} />
        </Card>
      </div>
    </div>
  );
} 