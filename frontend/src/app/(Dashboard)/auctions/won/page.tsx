"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Tag, Dropdown, Button, Menu } from "antd";
import { EyeOutlined, FileTextOutlined, SettingOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const statusColor = (status: string) => {
  switch (status) {
    case "Payment Pending":
      return "default";
    case "In Negotiation":
      return "blue";
    case "Delivered":
      return "green";
    case "Manual Delivery":
      return "gold";
    case "Payment Received":
      return "green";
    default:
      return "default";
  }
};

export default function AuctionsWonPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Move columns inside the component to access router
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
      render: (status: string[] | string) => (
        <div className="flex flex-col gap-1">
          {(Array.isArray(status) ? status : [status]).map((s, i) => (
            <Tag key={i} color={statusColor(s)}>{s}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const menu = (
          <Menu onClick={({ key }) => {
            if (key === "view") {
              router.push(`/auctions/won/${record.key}`);
            }
          }}>
            <Menu.Item key="view" icon={<EyeOutlined />}>View</Menu.Item>
            <Menu.Item key="report" icon={<FileTextOutlined />}>View Report</Menu.Item>
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiUrl}/auctions/api/v1/won/`, { headers });
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
          status: Array.isArray(item.status) ? item.status : [item.status || ''],
        }));
        setData(mapped);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch won auctions.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Auctions", href: "/auctions" }, { label: "Won" }]} />
      <div className="p-6">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <DataTable
          columns={columns}
          data={data}
          tableData={{
            selectableRows: true,
            isEnableFilterInput: true,
          }}
          loading={loading}
        />
      </div>
    </div>
  );
} 