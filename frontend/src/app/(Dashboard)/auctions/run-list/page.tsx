"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Tag, Button } from "antd";
import DataTable from "@/components/common/DataTable";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { showToast } from "@/components/common/Toaster";
import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import axios from "axios";

const columns = [
  { title: "Auction ID", dataIndex: "auctionId", key: "auctionId" },
  {
    title: "Vehicle Details",
    dataIndex: "vehicleDetails",
    key: "vehicleDetails",
    render: (details: any) => (
      <div>
        <div>VIN : {details.vin}</div>
        <div>{details.name}</div>
      </div>
    ),
  },
  {
    title: "Seller",
    dataIndex: "seller",
    key: "seller",
    render: (seller: any) => (
      <div>
        <div className="font-bold">{seller.name}</div>
        <div>{seller.address}</div>
        <div className="font-bold">{seller.phone}</div>
      </div>
    ),
  },
  {
    title: "Buyer",
    dataIndex: "buyer",
    key: "buyer",
    render: (buyer: any) => (
      <div>
        <div className="font-bold">{buyer.name}</div>
        <div>{buyer.address}</div>
        <div className="font-bold">{buyer.phone}</div>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => <Tag color="blue">{status}</Tag>,
  },
];

export default function AuctionsRunListPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setTableLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiUrl}/auctions/api/v1/on-run-list/`, { headers });
        // Map API response to table data shape
        const mapped = (response.data || []).map((item: any) => ({
          key: item.id || item.auctionId || item.request_id || Math.random(),
          auctionId: item.auctionId || item.id || '',
          vehicleDetails: {
            vin: item.vin || (item.request_id && item.request_id.vin) || '',
            name: `${(item.request_id && item.request_id.year) || ''} ${(item.request_id && item.request_id.make) || ''} ${(item.request_id && item.request_id.model) || ''}`.trim(),
          },
          seller: {
            name: (item.dealer && item.dealer.dealership_name) || '',
            address: [
              item.dealer?.street_name,
              item.dealer?.city?.name,
              item.dealer?.state?.name,
              item.dealer?.zipcode
            ].filter(Boolean).join(', '),
            phone: (item.dealer && item.dealer.phone_number) || '',
          },
          buyer: {
            name: (item.buyer && item.buyer.name) || '',
            address: (item.buyer && item.buyer.address) || '',
            phone: (item.buyer && item.buyer.phone) || '',
          },
          status: 'In a Run List',
        }));
        setData(mapped);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch run list.");
        setData([]);
      } finally {
        setTableLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendToAuction = async () => {
    if (selectedRowKeys.length === 0) {
      showErrorToast({ message: "Please make selection before sending to auction" });
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${apiUrl}/auctions/api/v1/admin/send-to-auctions/`, { ids: selectedRowKeys }, { headers });
      showSuccessToast(COMMON_SUCCESS_MESSAGES.SENT, "Items to auction");
      setSelectedRowKeys([]);
      // Refresh the table after successful send
      setTableLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/auctions/api/v1/on-run-list/`, { headers });
        const mapped = (response.data || []).map((item: any) => ({
          key: item.id || item.auctionId || item.request_id || Math.random(),
          auctionId: item.auctionId || item.id || '',
          vehicleDetails: {
            vin: item.vin || (item.request_id && item.request_id.vin) || '',
            name: `${(item.request_id && item.request_id.year) || ''} ${(item.request_id && item.request_id.make) || ''} ${(item.request_id && item.request_id.model) || ''}`.trim(),
          },
          seller: {
            name: (item.dealer && item.dealer.dealership_name) || '',
            address: [
              item.dealer?.street_name,
              item.dealer?.city?.name,
              item.dealer?.state?.name,
              item.dealer?.zipcode
            ].filter(Boolean).join(', '),
            phone: (item.dealer && item.dealer.phone_number) || '',
          },
          buyer: {
            name: (item.buyer && item.buyer.name) || '',
            address: (item.buyer && item.buyer.address) || '',
            phone: (item.buyer && item.buyer.phone) || '',
          },
          status: 'In a Run List',
        }));
        setData(mapped);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch run list.");
        setData([]);
      } finally {
        setTableLoading(false);
      }
    } catch (error) {
      showErrorToast(error, "Sending to auction");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    showToast({ type: "success", message: "Sent to auction successfully!" });
    // Here you can add your logic to actually send to auction
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Auctions", href: "/auctions" }, { label: "Run List" }]} />
      <div className="p-6">
        <div className="flex justify-end mb-2">
          <button className="bg-sky-600 text-white px-4 py-2 rounded" onClick={handleSendToAuction} disabled={loading}>Send To Auction</button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <DataTable
          columns={columns}
          data={data}
          tableData={{
            selectableRows: true,
            isEnableFilterInput: true,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          loading={tableLoading}
        />
        <ConfirmModal
          open={showModal}
          onOk={handleConfirm}
          onCancel={() => setShowModal(false)}
          title="!"
          content={"Are you sure you are sending to auctions?"}
          okText="Yes, Confirm it!"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
} 