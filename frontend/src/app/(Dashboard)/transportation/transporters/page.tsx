"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { Tag, Dropdown, Button, Menu } from "antd";
import { SettingOutlined, DownOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

const columns = [
  { title: "Business Name", dataIndex: "businessName", key: "businessName" },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  {
    title: "Approved",
    dataIndex: "approved",
    key: "approved",
    render: (approved: string) => (
      <Tag color={approved === "Approved" ? "green" : "default"}>{approved}</Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => {
      const menu = (
        <Menu>
          <Menu.Item key="edit">
            <Link href={`/transportation/transporters/${record.key}/edit`}>Edit</Link>
          </Menu.Item>
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

export default function TransportersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransportationData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // Send the GET request to the transportation API endpoint
        const res = await axios.get(`${apiUrl}/transportation/api/v1/transporter/`, { headers });
        
        // Update the state with the fetched data
        setData(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch transportation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransportationData();
  }, []);

  const mappedData = data.map((item: any) => ({
    key: item.id,
    businessName: item.business_name || "N/A",
    name: `${item.first_name || ""} ${item.last_name || ""}`.trim() || "N/A",
    email: item.email,
    approved: item.approved ? "Approved" : "Pending",
  }));

  return (
    <div>
      <Breadcrumbs items={[{ label: "Transportation", href: "/transportation" }, { label: "Transporters" }]} />
      <div className="p-6">
        <DataTable
          columns={columns}
          data={mappedData} // Using fetched data
          tableData={{
            // selectableRows: true,
            isEnableFilterInput: true,
            showAddButton: true,
            addButtonLabel: "Add Transporter",
            addButtonHref: "/transportation/transporters/add",
          }}
        />
      </div>
    </div>
  );
}
