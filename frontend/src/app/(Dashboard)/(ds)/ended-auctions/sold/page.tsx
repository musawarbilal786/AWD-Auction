"use client"
import React, { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/common/DataTable";
import AuctionSearchBar from "@/components/ds/AuctionSearchBar";
import axios from "axios";

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
    title: "Your Bid/Offer",
    dataIndex: "yourBid",
    key: "yourBid",
    render: (val: number) => <span className="font-bold">$ {val ? val.toLocaleString() : '-'}</span>,
    width: 120,
  },
  {
    title: "Sold For",
    dataIndex: "soldFor",
    key: "soldFor",
    render: (val: number) => <span className="font-bold">$ {val ? val.toLocaleString() : '-'}</span>,
    width: 120,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (val: any) => {
      let label = val;
      let color = "gray";
      if (val === 21 || val === "21") {
        label = "Pending";
        color = "orange";
      } else if (val === 5 || val === "5") {
        label = "Sold";
        color = "green";
      }
      return (
        <span
          className={`font-semibold px-3 py-1 rounded`}
          style={{
            background:
              color === "orange"
                ? "#fbbf24"
                : color === "green"
                ? "#bbf7d0"
                : "#f3f4f6",
            color:
              color === "orange"
                ? "#b45309"
                : color === "green"
                ? "#166534"
                : "#6b7280",
          }}
        >
          {label}
        </span>
      );
    },
    width: 100,
  },
];

export default function DsEndedAuctionsSold() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSoldAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiUrl}/auctions/api/v1/sold/`, { headers });
      const mapped = (response.data || []).map((item: any, idx: number) => {
        const req = item.request_id || {};
        // Determine yourBid/offer: max of offers.amount and bids.bid
        let offerAmount = null;
        if (Array.isArray(item.offers) && item.offers.length > 0) {
          offerAmount = Math.max(...item.offers.map((o: any) => Number(o.amount) || 0));
        } else if (item.offers && typeof item.offers === 'object' && item.offers.amount) {
          offerAmount = Number(item.offers.amount);
        }
        let bidAmount = null;
        if (Array.isArray(item.bids) && item.bids.length > 0) {
          bidAmount = Math.max(...item.bids.map((b: any) => Number(b.bid) || 0));
        } else if (item.bids && typeof item.bids === 'object' && item.bids.bid) {
          bidAmount = Number(item.bids.bid);
        }
        let yourBid = null;
        if (offerAmount !== null && bidAmount !== null) {
          yourBid = Math.max(offerAmount, bidAmount);
        } else if (offerAmount !== null) {
          yourBid = offerAmount;
        } else if (bidAmount !== null) {
          yourBid = bidAmount;
        } else {
          yourBid = null;
        }
        // Sold For: from won_bid_id.bid if exists
        let soldFor = null;
        if (item.won_bid_id && typeof item.won_bid_id === 'object' && item.won_bid_id.bid) {
          soldFor = item.won_bid_id.bid;
        } else {
          soldFor = null;
        }
        return {
          key: item.id || idx + 1,
          vin: req.vin ? String(req.vin).slice(-6) : '-',
          auctionId: req.auction_id || item.id || '',
          vehicle: `${req.year || ''} ${req.make || ''} ${req.model || ''}`.trim() || 'Vehicle',
          yourBid: yourBid,
          soldFor: soldFor,
          status: req.status || item.status || '-',
          image: "/images/auth-background.jpg",
        };
      });
      setData(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch sold auctions.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSoldAuctions();
  }, [fetchSoldAuctions]);

  // Optionally filter data by search (e.g., VIN, auctionId, vehicle)
  const filteredData = data.filter(row =>
    row.vin.toLowerCase().includes(search.toLowerCase()) ||
    row.auctionId.toLowerCase().includes(search.toLowerCase()) ||
    row.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
        <div className="text-center py-8 text-gray-500">Loading sold auctions...</div>
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
    <div className="">
      <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
      <DataTable
        columns={columns}
        data={filteredData}
        tableData={{ isEnableFilterInput: false }}
      />
    </div>
  );
} 