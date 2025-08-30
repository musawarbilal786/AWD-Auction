"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Card, Tag, Button, Dropdown, Modal } from "antd";
import { SettingOutlined, DownOutlined, StopOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

// Static data for fallback (keeping the same structure)
const staticData = [
  {
    key: 1,
    name: "1987 Honda Concerto 4D SUV AWD",
    img: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=60",
    auctionId: "114109692",
    vin: "H4ANKIGY2SXYsZlr",
    expected: 5220,
    lastBid: 710,
    timer: "Ended",
    status: "On Going",
  },
  {
    key: 2,
    name: "2016 Ford F150 Supercrew 4WD",
    img: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=60",
    auctionId: "360182582",
    vin: "JTDBVRBD7JA005366",
    expected: 17925,
    lastBid: 14100,
    timer: "Ended",
    status: "On Going",
  },
  {
    key: 3,
    name: "1975 Mazda Aerostar 4D SUV AWD",
    auctionId: "589660664",
    vin: "BC5RYuHWoZtGREDT2",
    expected: 3653,
    lastBid: 1800,
    timer: "Ended",
    status: "On Going",
  },
  {
    key: 4,
    name: "2013 Honda Atos 4D SUV RWD",
    auctionId: "752837163",
    vin: "aTcmQjk6oNe0vrQWQ",
    expected: 7184,
    lastBid: 100,
    timer: "Ended",
    status: "On Going",
  },
  {
    key: 5,
    name: "2019 Cadillac XT4 Sport",
    auctionId: "801905644",
    vin: "1GYFZR40KF197271",
    expected: 20000,
    lastBid: 1000,
    timer: "Ended",
    status: "On Going",
  },
  {
    key: 6,
    name: "2019 Nissan Armada 4D SUV RWD",
    img: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=60",
    auctionId: "1237717821",
    vin: "JN8AY2ND2KX008152",
    expected: 21750,
    lastBid: 17000,
    timer: "Ended",
    status: "On Going",
  },
  {
    key: 7,
    name: "2003 Honda CR-V 4D SUV 4WD",
    auctionId: "1400973061",
    vin: "SHSRD78803U118563",
    expected: 1100,
    lastBid: 300,
    timer: "Ended",
    status: "Sold",
  },
  {
    key: 8,
    name: "2011 Ford Daytona 4D SUV AWD",
    auctionId: "1438795222",
    vin: "GUZuEzhbkWsnylkdJ",
    expected: 7706,
    lastBid: 5300,
    timer: "Ended",
    status: "On Going",
  },
  {
    key: 9,
    name: "2016 Ford F450 Supercrew 4WD",
    auctionId: "1504103362",
    vin: "testvinVIN",
    expected: 17925,
    lastBid: 0,
    timer: "00:00",
    status: "On Going",
  },
];

export default function AuctionsLivePage() {
  const [data, setData] = useState(staticData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stopLoading, setStopLoading] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);

  // Handle stop auction
  const handleStopAuction = async (auction: any) => {
    setSelectedAuction(auction);
    setStopModalVisible(true);
  };

  // Confirm stop auction
  const confirmStopAuction = async () => {
    if (!selectedAuction) return;
    
    setStopLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const payload = {
        status: 0
      };
      
      await axios.patch(`${apiUrl}/auctions/api/v1/stop/${selectedAuction.auctionId}/`, payload, { headers });
      
      showSuccessToast("Auction stopped successfully!", "Auction");
      setStopModalVisible(false);
      setSelectedAuction(null);
      
      // Refresh the data
      fetchLiveAuctions();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to stop auction.";
      showErrorToast(err, "Stop Auction");
    } finally {
      setStopLoading(false);
    }
  };

  // Fetch live auctions function
  const fetchLiveAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await axios.get(`${apiUrl}/auctions/api/v1/live/`, { headers });
      
      // Map API response to match the existing data structure
      const mappedData = (response.data || []).map((item: any, index: number) => {
        const req = item.request_id || {};
        
        // Debug logging to check the structure
        console.log('API Item:', item);
        console.log('Last Bid ID:', item.last_bid_id);
        console.log('Bid Amount:', item.last_bid_id?.bid);
        
        return {
          key: item.id || index + 1,
          name: `${req.year || ''} ${req.make || ''} ${req.model || ''}`.trim() || 'Vehicle',
          img: req.image || "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=60",
          auctionId: item.auction_id || req.auction_id || item.id || '',
          vin: req.vin ? req.vin.slice(-6) : '-',
          expected: req.expected_price || 0,
          lastBid: item.last_bid_id?.bid || 0,
          timer: "10:00", // Static timer for now
          status: item.status === 1 ? "On Going" : item.status === 2 ? "In Negotiation" : item.status === 3 ? "Ended" : "On Going",
        };
      });
      
      setData(mappedData);
    } catch (err: any) {
      console.error("Failed to fetch live auctions:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch live auctions.");
      // Keep static data as fallback
      setData(staticData);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "img",
      key: "img",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
            <div className="w-[60px] h-[40px] flex items-center justify-center bg-gray-100 rounded">
              <span role="img" aria-label="car">🚗</span>
            </div>
        </div>
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Auction ID", dataIndex: "auctionId", key: "auctionId" },
    { title: "VIN", dataIndex: "vin", key: "vin" },
    {
      title: "Expected",
      dataIndex: "expected",
      key: "expected",
      render: (v: number) => <span className="font-bold">${v.toLocaleString()}</span>,
    },
    {
      title: "Last Bid",
      dataIndex: "lastBid",
      key: "lastBid",
      render: (v: number, record: any) => (
        <span className={v > 0 ? "font-bold text-green-600" : "font-bold text-red-600"}>
          {v > 0 ? `$${v.toLocaleString()}` : "--"}
        </span>
      ),
    },
    {
      title: "Timer",
      dataIndex: "timer",
      key: "timer",
      render: (v: string) => <span className="font-semibold text-green-600">{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => {
        let color = "green";
        if (v === "Ended") color = "#facc15";
        if (v === "Sold") color = "#22d3ee";
        return <Tag color={color} className="font-semibold">{v}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const items = [
          {
            key: 'stop',
            label: <span className="flex items-center gap-2 text-red-600"><StopOutlined /> Stop Auction</span>,
            onClick: () => handleStopAuction(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<span className="flex items-center gap-1"><SettingOutlined /><DownOutlined /></span>} />
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    fetchLiveAuctions();
  }, []);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Auctions", href: "/auctions" }, { label: "Live" }]} />
      <div className="p-6">
        <div className="flex justify-end mb-2 text-gray-500 text-sm">
          <span>Live {data.length} | Bids {data.reduce((sum, item) => sum + (item.lastBid > 0 ? 1 : 0), 0)}</span>
        </div>
        <Card>
          <DataTable 
            columns={columns} 
            data={data} 
            tableData={{
              isEnableFilterInput: true,
              showAddButton: false,
            }} 
            loading={loading}
          />
        </Card>
        
        {/* Stop Auction Confirmation Modal */}
        <Modal
          title={
            <span className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-red-500" />
              Stop Auction
            </span>
          }
          open={stopModalVisible}
          onCancel={() => {
            setStopModalVisible(false);
            setSelectedAuction(null);
          }}
          footer={null}
          width={500}
        >
          <div className="py-4">
            <p className="text-lg mb-4">
              Are you sure you want to stop this auction?
            </p>
            {selectedAuction && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p><strong>Auction ID:</strong> {selectedAuction.auctionId}</p>
                <p><strong>Vehicle:</strong> {selectedAuction.name}</p>
                <p><strong>VIN:</strong> {selectedAuction.vin}</p>
              </div>
            )}
            <p className="text-red-600 text-sm mb-6">
              This action will immediately stop the auction and cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button 
                onClick={() => {
                  setStopModalVisible(false);
                  setSelectedAuction(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                danger
                loading={stopLoading}
                onClick={confirmStopAuction}
              >
                Stop Auction
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
} 