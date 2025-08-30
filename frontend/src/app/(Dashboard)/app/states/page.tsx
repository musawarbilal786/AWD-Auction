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
    title: "State Name",
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
    title: "Country",
    dataIndex: "country",
    key: "country",
    render: (country: any) => country?.name || 'N/A',
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
          <Link href={`/app/states/${record.id}`}>
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

const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
];

const tableData = {
  selectableRows: true,
  isEnableFilterInput: true,
  showAddButton: true, 
  addButtonLabel: "Add New State", 
  addButtonHref: "/app/states/add"
};

export default function StatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/utils/api/v1/states/`, { headers });
        setStates(res.data || []);
        showSuccessToast('States fetched successfully!', 'States');
      } catch (err) {
        showErrorToast(err, "States");
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  const handleAddState = () => {
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

  const mappedStates = states.map((state, index) => ({
    key: state.id || index,
    id: state.id,
    name: state.name,
    code: state.code,
    country: state.country,
    status: state.status,
  }));

  return (
    <div>
      <Breadcrumbs items={[{ label: "States", href: "/app/states" }]} />
      <div className="p-6">
          <DataTable columns={columns} data={mappedStates} tableData={tableData} loading={loading} />
          <Modal
            title="Add New State"
            open={isModalOpen}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="Save"
            cancelText="Cancel"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="State Name"
                rules={[{ required: true, message: "Please enter state name" }]}
              >
                <Input placeholder="Enter state name" />
              </Form.Item>
              <Form.Item
                name="code"
                label="State Code"
                rules={[{ required: true, message: "Please enter state code" }]}
              >
                <Input placeholder="Enter state code" />
              </Form.Item>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: "Please select country" }]}
              >
                <Select
                  placeholder="Select country"
                  options={countries}
                />
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