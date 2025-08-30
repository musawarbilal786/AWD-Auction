"use client";
import { Card, Row, Col, Table, Tag, Statistic, Progress } from "antd";
import { DollarOutlined, CreditCardOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const columns = [
  {
    title: "Job ID",
    dataIndex: "jobId",
    key: "jobId",
    render: (jobId: string) => (
      <span className="font-mono text-blue-600">{jobId}</span>
    ),
  },
  {
    title: "Vehicle",
    dataIndex: "vehicle",
    key: "vehicle",
  },
  {
    title: "Route",
    dataIndex: "route",
    key: "route",
    render: (route: any) => (
      <div>
        <div className="text-sm">{route.from} → {route.to}</div>
        <div className="text-xs text-gray-500">{route.distance} km</div>
      </div>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (amount: number) => (
      <span className="font-bold text-green-600">${amount}</span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const color = status === 'Paid' ? 'green' : status === 'Pending' ? 'orange' : 'blue';
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
];

const data = [
  {
    key: "1",
    jobId: "TR-2024-001",
    vehicle: "Toyota Camry 2022",
    route: {
      from: "New York, NY",
      to: "Los Angeles, CA",
      distance: 250
    },
    amount: 450,
    status: "Paid",
    date: "2024-01-15",
  },
  {
    key: "2",
    jobId: "TR-2024-002",
    vehicle: "Honda Civic 2023",
    route: {
      from: "Chicago, IL",
      to: "Miami, FL",
      distance: 180
    },
    amount: 380,
    status: "Pending",
    date: "2024-01-20",
  },
  {
    key: "3",
    jobId: "TR-2024-003",
    vehicle: "Ford Mustang 2021",
    route: {
      from: "Houston, TX",
      to: "Phoenix, AZ",
      distance: 320
    },
    amount: 520,
    status: "Paid",
    date: "2024-01-25",
  },
];

export default function TransporterPaymentsPage() {
  const totalEarnings = data.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = data.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = data.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <Breadcrumbs 
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Payments" }
        ]} 
      />
      
      <div className="space-y-6 mt-6">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Earnings"
                value={totalEarnings}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Paid Amount"
                value={paidAmount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Amount"
                value={pendingAmount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="This Month"
                value={1830}
                prefix={<CreditCardOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix="USD"
              />
            </Card>
          </Col>
        </Row>

        {/* Payment Progress */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Payment Status Overview">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Paid</span>
                    <span>{paidAmount} USD</span>
                  </div>
                  <Progress 
                    percent={Math.round((paidAmount / totalEarnings) * 100)} 
                    strokeColor="#52c41a" 
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Pending</span>
                    <span>{pendingAmount} USD</span>
                  </div>
                  <Progress 
                    percent={Math.round((pendingAmount / totalEarnings) * 100)} 
                    strokeColor="#faad14" 
                  />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Recent Activity">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div>
                    <div className="font-semibold text-green-600">Payment Received</div>
                    <div className="text-sm text-gray-600">Job TR-2024-001</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$450</div>
                    <div className="text-sm text-gray-600">Today</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                  <div>
                    <div className="font-semibold text-orange-600">Payment Pending</div>
                    <div className="text-sm text-gray-600">Job TR-2024-002</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$380</div>
                    <div className="text-sm text-gray-600">2 days ago</div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Payment History Table */}
        <Card title="Payment History">
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            className="custom-table"
          />
        </Card>
      </div>
    </div>
  );
}
