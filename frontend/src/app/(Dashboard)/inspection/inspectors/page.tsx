"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Card, Button, Dropdown, Menu } from "antd";
import { EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { showErrorToast } from "@/utils/errorHandler";

const columns = [
  { 
    title: "Name", 
    key: "name", 
    render: (_: any, record: any) => `${record.first_name} ${record.last_name}` 
  },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
  { 
    title: "State Name", 
    key: "state", 
    render: (_: any, record: any) => record.state || "-" 
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => {
      const menu = (
        <Menu>
          <Menu.Item key="edit" icon={<EditOutlined />}>
            <Link href={`/inspection/inspectors/${record.id}`}>Edit</Link>
          </Menu.Item>
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

export default function InspectorsListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspectors = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/inspections/api/v1/inspectors/`, { headers });
        setData(res.data.results || res.data);
      } catch (error) {
        showErrorToast(error, "Inspectors");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInspectors();
  }, []);

  const tableData = { 
    selectableRows: true,
    isEnableFilterInput: true,
    showAddButton: true, 
    addButtonLabel: "Add New Inspector", 
    addButtonHref: "/inspection/inspectors/add"
  };
  return (
    <div>
      <Breadcrumbs items={[{ label: "Inspection", href: "/inspection" }, { label: "Inspectors" }]} />
      <div className="p-6">
          <DataTable columns={columns} data={data} tableData={tableData} loading={loading} />
      </div>
    </div>
  );
} 