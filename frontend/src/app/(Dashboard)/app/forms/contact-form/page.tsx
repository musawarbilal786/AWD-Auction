"use client";

import { Card, Button, Dropdown, Menu } from "antd";
import { EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Subject", dataIndex: "subject", key: "subject" },
  { title: "Message", dataIndex: "message", key: "message" },
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
  { key: "1", name: "John Doe", email: "john@example.com", subject: "Inquiry", message: "I have a question about your service." },
  { key: "2", name: "Jane Smith", email: "jane@example.com", subject: "Support", message: "Please help with my account." },
];

export default function ContactFormPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Contact Form", href: "/app/forms/contact-form" }]} />
      <div className="p-6">
        <Card>
          <DataTable columns={columns} data={data} tableData={{}} />
        </Card>
      </div>
    </div>
  );
} 