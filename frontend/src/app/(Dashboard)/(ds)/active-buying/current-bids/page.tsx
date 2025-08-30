"use client";
import React, { useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import AuctionSearchBar from "@/components/ds/AuctionSearchBar";
import OfferNowModal from "@/components/modals/OfferNowModal";
import axios from "axios";

// Status code to label mapping for request status (following tasks page mapping)
const REQUEST_STATUS_MAP: Record<number, string> = {
  0: 'Pending',
  1: 'Waiting for speciality approval',
  2: 'Inspector Assigned',
  3: 'Inspection started',
  4: 'Inspection Completed',
  21: 'On Auction',
  5: 'Waiting for buyer confirmation',
  6: 'Payment pending',
  7: 'Delivered',
};

const requestStatusColors: Record<string, string> = {
  "Pending": "bg-gray-100 text-gray-700 border-gray-300",
  "Waiting for speciality approval": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Inspector Assigned": "bg-purple-100 text-purple-700 border-purple-300",
  "Inspection started": "bg-orange-100 text-orange-700 border-orange-300",
  "Inspection Completed": "bg-blue-100 text-blue-700 border-blue-300",
  "On Auction": "bg-green-100 text-green-700 border-green-300",
  "Waiting for buyer confirmation": "bg-indigo-100 text-indigo-700 border-indigo-300",
  "Payment pending": "bg-pink-100 text-pink-700 border-pink-300",
  "Delivered": "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const columns = [
  {
    title: "",
    dataIndex: "image",
    key: "image",
    width: 60,
    render: (img: string) => img ? (
      <img src={img} alt="car" className="w-12 h-12 object-cover rounded" />
    ) : null,
  },
  {
    title: "VIN(last six)",
    dataIndex: "vin",
    key: "vin",
    width: 120,
  },
  {
    title: "Auction ID",
    dataIndex: "auctionId",
    key: "auctionId",
    width: 140,
    render: (id: string) => <span className="text-blue-600 font-medium cursor-pointer">{id}</span>,
  },
  {
    title: "Vehicle",
    dataIndex: "vehicle",
    key: "vehicle",
    width: 220,
  },
  {
    title: "Bid Price",
    dataIndex: "bidPrice",
    key: "bidPrice",
    render: (val: number) => <span className="font-bold">$ {val.toLocaleString()}</span>,
    width: 120,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: number) => {
      const statusLabel = REQUEST_STATUS_MAP[status] || 'Unknown';
      return (
        <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${requestStatusColors[statusLabel] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
          {statusLabel}
        </span>
      );
    },
    width: 100,
  },
];

function ExpandedRow({ record, onNewOffer }: { record: any; onNewOffer: () => void }) {
  return (
    <div className="bg-white p-4 border-t">
      <div className="flex items-center mb-4">
        <button className="bg-blue-500 text-white px-6 py-2 font-semibold text-lg mr-4 cursor-default">Your Bids</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-bold">Buyer</th>
              <th className="px-4 py-2 text-left font-bold">Bid Date</th>
              <th className="px-4 py-2 text-left font-bold">Bid Price</th>
              <th className="px-4 py-2 text-left font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {record.bids && record.bids.length > 0 ? (
              record.bids.map((bid: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{bid.buyer}</td>
                  <td className="px-4 py-2">{bid.bidDate}</td>
                  <td className="px-4 py-2 font-bold">${bid.bidPrice.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded font-semibold ${bid.status === "Pending" ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-600"}`}>{bid.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">No bids yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <div className="flex justify-center mt-6">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-2 rounded text-lg"
          onClick={onNewOffer}
        >
          New Offer
        </button>
      </div> */}
    </div>
  );
}

export default function DsActiveBuyingCurrentBids() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowKey, setExpandedRowKey] = useState<number | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerRowKey, setOfferRowKey] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiUrl}/auctions/api/v1/current-buying/`, { headers });
        
        // Map API response to table data shape
        const mapped = (response.data || []).map((item: any, index: number) => {
          const req = item.request_id || {};
          return {
            key: item.id || index + 1,
            vin: req.vin ? req.vin.slice(-6) : '-',
            auctionId: item.auction_id || item.id || '',
            vehicle: `${req.year || ''} ${req.make || ''} ${req.model || ''}`.trim() || 'Vehicle',
            bidPrice: item.last_bid_id?.bid || 0,
            status: req.status || 0, // Use status from request_id object
            image: req.image || "/images/auth-background.jpg",
            bids: item.bids ? item.bids.map((bid: any) => ({
              buyer: bid.buyer_name || bid.buyer || 'Unknown',
              bidDate: bid.created_at ? new Date(bid.created_at).toLocaleString("en-GB").replace(",", "") : new Date().toLocaleString("en-GB").replace(",", ""),
              bidPrice: bid.amount || bid.bid_price || 0,
              status: bid.status || 'Pending',
            })) : [],
          };
        });
        setData(mapped);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch current bids.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(row =>
    row.vin.toLowerCase().includes(search.toLowerCase()) ||
    row.auctionId.toLowerCase().includes(search.toLowerCase()) ||
    row.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  const handleExpand = (expanded: boolean, record: any) => {
    setExpandedRowKey(expanded ? record.key : null);
  };

  const handleNewOffer = (rowKey: number) => {
    setOfferRowKey(rowKey);
    setOfferModalOpen(true);
  };

  const handleOfferSubmit = (amount: number) => {
    setData(prev =>
      prev.map(row =>
        row.key === offerRowKey
          ? {
              ...row,
              bids: [
                ...row.bids,
                {
                  buyer: "You",
                  bidDate: new Date().toLocaleString("en-GB").replace(",", ""),
                  bidPrice: amount,
                  status: "Pending",
                },
              ],
              bidPrice: amount,
            }
          : row
      )
    );
    setOfferModalOpen(false);
    setOfferRowKey(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
        <div className="text-center py-8 text-gray-500">Loading current bids...</div>
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
      <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
      <DataTable
        columns={columns}
        data={filteredData}
        expandable={{
          expandedRowRender: (record: any) => (
            <ExpandedRow record={record} onNewOffer={() => handleNewOffer(record.key)} />
          ),
          expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
          onExpand: handleExpand,
        }}
        tableData={{ isEnableFilterInput: false }}
      />
      <OfferNowModal
        open={offerModalOpen}
        onCancel={() => setOfferModalOpen(false)}
        onSubmit={handleOfferSubmit}
      />
    </div>
  );
} 