"use client";

import { Table, Card, Button, Input, Space, Tag, Modal, Form, Select, Dropdown, Menu } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import Link from "next/link";

const columns = [
  {
    title: "Country Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Code",
    dataIndex: "code",
    key: "code",
    render: (code: string) => <Tag color="blue">{code}</Tag>,
  },
  {
    title: "Currency",
    dataIndex: "currency",
    key: "currency",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: number) => (
      <Tag color={status === 1 ? "green" : "red"}>
        {status === 1 ? "Active" : "Inactive"}
      </Tag>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    render: (_: any, record: any) => {
      const menu = (
        <Menu>
          <Link href={`/app/countries/${record.id}`}>
            <Menu.Item key="edit" icon={<EditOutlined />}>
              Edit
            </Menu.Item>
          </Link>
          <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
            Delete
          </Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            Action <DownOutlined />
          </Button>
        </Dropdown>
      );
    },
  },
];

const tableData = {};

export default function CountriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.get(`${apiUrl}/utils/api/v1/countries/`, { headers });
      setCountries(res.data || []);
      showSuccessToast('Countries fetched successfully!', 'Countries');
    } catch (err) {
      showErrorToast(err, "Countries");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCountries();
  }, []);

  const handleAddCountry = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const mappedCountries = countries.map((country, index) => ({
    key: country.id || index,
    id: country.id,
    name: country.name,
    code: country.code,
    currency: country.currency || 'N/A',
    status: country.status,
  }));

const tableData = {
  selectableRows: true,
  isEnableFilterInput: true,
  showAddButton: true, 
  addButtonLabel: "Add New Country", 
  addButtonHref: "/app/countries/add"
};

  return (
    <div>
      <Breadcrumbs items={[{ label: "Countries", href: "/app/countries" }]} />
      <div className="p-6">

          <DataTable columns={columns} data={mappedCountries} tableData={tableData} loading={loading} />

          <Modal
            title="Add New Country"
            open={isModalOpen}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="Save"
            cancelText="Cancel"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Country Name"
                rules={[{ required: true, message: "Please enter country name" }]}
              >
                <Input placeholder="Enter country name" />
              </Form.Item>
              <Form.Item
                name="code"
                label="Country Code"
                rules={[{ required: true, message: "Please enter country code" }]}
              >
                <Input placeholder="Enter country code" />
              </Form.Item>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: "Please enter currency" }]}
              >
                <Input placeholder="Enter currency" />
              </Form.Item>
              <Form.Item
                name="status"
                label="Status"
                initialValue="Active"
              >
                <Input placeholder="Enter status" />
              </Form.Item>
            </Form>
          </Modal>

      </div>
    </div>
  );
} 