'use client'
import React, { useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import AuctionSearchBar from "@/components/ds/AuctionSearchBar";
import axios from "axios";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Waiting for Buyer Confirmation', color: 'gray' },
  2: { label: 'Payment Pending', color: 'orange' },
  3: { label: 'Completed', color: 'green' },
  4: { label: 'Reserved Price', color: 'gold' },
  5: { label: 'Proxy Won', color: 'blue' },
  // Add more as needed
};

function StatusTag({ status }: { status: number }) {
  const statusObj = STATUS_MAP[status] || { label: String(status), color: 'gray' };
  return (
    <span
      className={`font-semibold px-2 py-1 rounded`}
      style={{ background: statusObj.color === 'gray' ? '#f3f4f6' : statusObj.color === 'orange' ? '#fbbf24' : statusObj.color === 'green' ? '#bbf7d0' : statusObj.color === 'gold' ? '#fde68a' : statusObj.color === 'blue' ? '#dbeafe' : '#f3f4f6', color: statusObj.color === 'gray' ? '#6b7280' : statusObj.color === 'orange' ? '#b45309' : statusObj.color === 'green' ? '#166534' : statusObj.color === 'gold' ? '#b45309' : statusObj.color === 'blue' ? '#1e40af' : '#6b7280' }}
    >
      {statusObj.label}
    </span>
  );
}

function ExpandedRowContent({ record }: { record: any }) {
  return (
    <div className="bg-white border-t border-gray-200 p-6 flex flex-col gap-6">
      <div className="flex gap-4 mb-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold text-base">Payment</button>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-200">
          <div className="text-7xl text-gray-200 mb-4">$</div>
          <p className="text-gray-500 text-center max-w-xs mb-6">
            Currently in the 'Payment Pending' zone, eagerly awaiting our buyer's transaction to complete the payment process <span role="img" aria-label="luck">🍀</span><span role="img" aria-label="card">💳</span>
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl text-gray-300 mb-2">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="5" y="7" width="14" height="10" rx="2" fill="#D1D5DB"/><rect x="7" y="9" width="10" height="2" rx="1" fill="#9CA3AF"/><rect x="7" y="13" width="6" height="2" rx="1" fill="#9CA3AF"/></svg>
          </div>
          <div className="font-bold text-2xl mb-2">Auction ID {record.auctionId}</div>
          <div className="mb-1"><span className="font-semibold">Bid Amount</span></div>
          <div className="text-2xl font-bold mb-1">${Number(record.bidPrice).toLocaleString()}</div>
          <div className="mb-1"><span className="font-semibold">Won Date</span></div>
          <div className="text-lg font-bold">{record.wonDate}</div>
        </div>
      </div>
    </div>
  );
}

export default function DsSellingCurrentSales() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiUrl}/auctions/api/v1/current-selling/`, { headers });
        // Map API response to table data shape
        const mapped = (response.data || []).map((item: any, index: number) => {
          const req = item.request_id || {};
          // Bid amount: last_bid_id.bid or request_id.expected_price
          let bidPrice = item.last_bid_id?.bid || req.expected_price || item.expected_price || 0;
          // Won date: request_id.auction_date or request_id.inspected_date
          let wonDate = req.auction_date || req.inspected_date || item.won_at || item.created_at || '';
          if (wonDate) {
            try {
              wonDate = new Date(wonDate).toLocaleDateString();
            } catch {}
          }
          return {
            key: item.id || index + 1,
            image: req.image || "/images/auth-background.jpg",
            vin: req.vin ? req.vin.slice(-6) : '-',
            vehicle: `${req.make || ''} ${req.model || ''}`.trim() || 'Vehicle',
            wonDate,
            bidPrice,
            reserved: item.reserved_price ? true : false,
            status: item.status,
            auctionId: req.auction_id || item.auction_id || item.id || '',
            proxyWon: item.proxy_won || false,
          };
        });
        setData(mapped);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch active selling data.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(row =>
    row.vin.toLowerCase().includes(search.toLowerCase()) ||
    row.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'VIN(last six)',
      dataIndex: 'vin',
      key: 'vin',
      width: 120,
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicle',
      key: 'vehicle',
    },
    {
      title: 'Won Date',
      dataIndex: 'wonDate',
      key: 'wonDate',
    },
    {
      title: 'Bid Price',
      dataIndex: 'bidPrice',
      key: 'bidPrice',
      render: (val: number, record: any) => (
        <span className="font-bold">$ {Number(val).toLocaleString()} {record.reserved && <span className="text-yellow-500 font-semibold">Reserved Price</span>} {record.proxyWon && <span className="text-yellow-500 font-semibold">Proxy Won</span>}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: number) => <StatusTag status={val} />,
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
        <div className="text-center py-8 text-gray-500">Loading active selling data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Active Selling</h1>
      <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
      <DataTable
        columns={columns}
        data={filteredData}
        expandable={{
          expandedRowRender: (record: any) => <ExpandedRowContent record={record} />,
          expandedRowKeys,
          onExpand: (expanded: boolean, record: any) => {
            setExpandedRowKeys(expanded ? [record.key] : []);
          },
        }}
        tableData={{ isEnableFilterInput: false }}
      />
    </div>
  );
} 