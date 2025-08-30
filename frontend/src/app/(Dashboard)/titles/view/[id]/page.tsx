"use client";
import { Card, Button, Row, Col, Divider, Modal, Form, Input } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import CreateSellerLabelModal from "@/components/modals/CreateSellerLabelModal";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function TitleViewPage() {
  const { id } = useParams();
  const [isLabelModalOpen, setLabelModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Mock data for demonstration
  const auctionId = id || "2408459329";
  const vin = "5TFBT54147X002142";
  const odometer = "16300";
  const vehicleName = "Double Cab 4WD";
  const seller = {
    dealership: "Viva Cars",
    address: "4034 Granville Lane",
    city: "",
    zip: "0000",
    email: "",
    phone: "+1 (547) 812-3511",
    inspection: "Granville Lane",
  };
  const buyer = {
    dealership: "Speed Car",
    address: "34021 N US-45, Grayslake, IL 60030, State : Arizona (AZ)",
    city: "",
    zip: "57102",
    email: "test@gmail.com",
    phone: "605-371-7629",
    inspection: "South Dakota",
  };

  const handleUpdateToDelivered = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelivered = () => {
    setShowConfirmModal(false);
    // TODO: Add your logic to update the status to Delivered here
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-semibold">Auction ID {auctionId} <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded">Title Shipped</span></div>
        <Button type="primary" size="large" onClick={handleUpdateToDelivered}>Update to Delivered</Button>
      </div>
      <Row gutter={24} className="mb-10">
        <Col xs={24} md={8}>
          <Card title={<span className="font-bold">Seller Return Label</span>} bordered={false} className="shadow-sm">
            <div className="mb-2 font-semibold">Tracking Number</div>
            <div className="mb-2">Shipment Date</div>
            <div className="mb-2">Service Name</div>
            <Button className="mt-2 w-full" disabled>View Return Label</Button>
            <Button className="mt-2 w-full" type="primary" onClick={() => setLabelModalOpen(true)}>Create Return Label</Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title={<span className="font-bold">Title Receiving</span>} bordered={false} className="shadow-sm">
            <div className="mb-2">File uploaded</div>
            <div className="flex gap-2 mt-2">
              <Button type="primary">View File</Button>
              <Button>Title Re-Upload</Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title={<span className="font-bold">AWD Return Label</span>} bordered={false} className="shadow-sm">
            <div className="mb-4 text-center font-medium">Return label not created yet.</div>
            <div className="flex gap-2 justify-center">
              <Button type="primary" onClick={() => setLabelModalOpen(true)}>Create AWD Return Label</Button>
              <Button>Add Manually</Button>
            </div>
          </Card>
        </Col>
      </Row>
      <Card className="mb-8 shadow-sm" bordered={false}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xl font-bold mb-1">{vehicleName}</div>
            <div className="mb-1 text-base">VIN : <span className="font-semibold text-blue-900">{vin}</span></div>
            <div className="mb-1 text-base">Odometer : <span className="font-semibold">{odometer}</span></div>
          </div>
        </div>
      </Card>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card bordered={false} className="shadow-sm">
            <div className="font-bold text-lg mb-2 text-blue-900">SELLER DETAILS</div>
            <Divider className="my-2" />
            <div className="mb-1">Dealership : <span className="font-semibold">{seller.dealership}</span></div>
            <div className="mb-1">Inspection Address : <span className="font-semibold">{seller.inspection}</span></div>
            <div className="mb-1">{seller.address}</div>
            <div className="mb-1">ZIP : {seller.zip}</div>
            <div className="mb-1">Email : {seller.email || <span className="text-gray-400">N/A</span>}</div>
            <div className="mb-1">Phone : {seller.phone}</div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} className="shadow-sm">
            <div className="font-bold text-lg mb-2 text-blue-900">BUYER DETAILS</div>
            <Divider className="my-2" />
            <div className="mb-1">Dealership : <span className="font-semibold">{buyer.dealership}</span></div>
            <div className="mb-1">Title Delivery Address : {buyer.inspection}</div>
            <div className="mb-1">{buyer.address}</div>
            <div className="mb-1">ZIP : {buyer.zip}</div>
            <div className="mb-1">Email : {buyer.email}</div>
            <div className="mb-1">Phone : {buyer.phone}</div>
          </Card>
        </Col>
      </Row>
      <CreateSellerLabelModal
        open={isLabelModalOpen}
        onCancel={() => setLabelModalOpen(false)}
        onConfirm={() => setLabelModalOpen(false)}
        vin={vin}
      />
      <ConfirmModal
        open={showConfirmModal}
        onOk={handleConfirmDelivered}
        onCancel={() => setShowConfirmModal(false)}
        title="Confirm Status Update"
        content={"Are you sure you want to update the status to Delivered?"}
        okText="Yes, Update"
        cancelText="Cancel"
      />
    </div>
  );
} 