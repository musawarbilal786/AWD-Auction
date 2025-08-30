"use client";
import { Card, Row, Col, Avatar } from "antd";
import { CarOutlined, CheckCircleOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

export default function TransporterDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-white">
        <div className="flex items-center space-x-4">
          <Avatar size={64} src="/images/dummy-profile-logo.jpg" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hello!</h1>
            <h2 className="text-xl font-semibold text-gray-800">Muhammad Haseeb</h2>
          </div>
        </div>
      </Card>

      {/* Job Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <div className="flex items-center justify-center space-x-3">
              <CarOutlined className="text-4xl text-blue-500" />
              <div>
                <div className="text-lg font-semibold text-gray-700">New Jobs</div>
                <div className="text-3xl font-bold text-blue-600">2</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircleOutlined className="text-4xl text-green-500" />
              <div>
                <div className="text-lg font-semibold text-gray-700">Accepted Jobs</div>
                <div className="text-3xl font-bold text-green-600">0</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <div className="flex items-center justify-center space-x-3">
              <SafetyCertificateOutlined className="text-4xl text-purple-500" />
              <div>
                <div className="text-lg font-semibold text-gray-700">Completed Jobs</div>
                <div className="text-3xl font-bold text-purple-600">0</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold">New job available</div>
                  <div className="text-sm text-gray-600">Toyota Camry 2022</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">$450</div>
                  <div className="text-sm text-gray-600">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold">New job available</div>
                  <div className="text-sm text-gray-600">Honda Civic 2023</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">$380</div>
                  <div className="text-sm text-gray-600">4 hours ago</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions">
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded transition-colors">
                <div className="font-semibold text-blue-600">View New Jobs</div>
                <div className="text-sm text-gray-600">Check available transportation jobs</div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded transition-colors">
                <div className="font-semibold text-green-600">Update Profile</div>
                <div className="text-sm text-gray-600">Manage your profile information</div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded transition-colors">
                <div className="font-semibold text-purple-600">View Earnings</div>
                <div className="text-sm text-gray-600">Check your payment history</div>
              </button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
