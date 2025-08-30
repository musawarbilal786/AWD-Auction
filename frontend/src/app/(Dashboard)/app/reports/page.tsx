"use client";

import { Card, Select, DatePicker, Button, Table, Space, Row, Col } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";

const { RangePicker } = DatePicker;

const tableData = {};

export default function ReportsPage() {
  const columns = [
    {
      title: "Report ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Report Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Generated Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="link" icon={<DownloadOutlined />}>
            Download
          </Button>
          <Button type="link" icon={<ReloadOutlined />}>
            Regenerate
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      id: "REP-001",
      type: "Sales Report",
      date: "2024-03-15",
      status: "Completed",
    },
    {
      key: "2",
      id: "REP-002",
      type: "Inventory Report",
      date: "2024-03-14",
      status: "Completed",
    },
    {
      key: "3",
      id: "REP-003",
      type: "User Activity Report",
      date: "2024-03-13",
      status: "Processing",
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-6">Reports</h1>

        {/* Filters */}
        <div className="mb-6">
          <Row gutter={16}>
            <Col span={6}>
              <Select
                placeholder="Select Report Type"
                style={{ width: "100%" }}
                options={[
                  { value: "sales", label: "Sales Report" },
                  { value: "inventory", label: "Inventory Report" },
                  { value: "user_activity", label: "User Activity Report" },
                  { value: "financial", label: "Financial Report" },
                ]}
              />
            </Col>
            <Col span={6}>
              <RangePicker style={{ width: "100%" }} />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Select Status"
                style={{ width: "100%" }}
                options={[
                  { value: "completed", label: "Completed" },
                  { value: "processing", label: "Processing" },
                  { value: "failed", label: "Failed" },
                ]}
              />
            </Col>
            <Col span={6}>
              <Button type="primary" block>
                Generate Report
              </Button>
            </Col>
          </Row>
        </div>

        {/* Reports Table */}
        <DataTable columns={columns} data={data} tableData={tableData} />
      </Card>
    </div>
  );
} 