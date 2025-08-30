"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs } from "antd";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import axios from "axios";
import { CopyOutlined, EyeOutlined, PushpinOutlined } from "@ant-design/icons";

export default function WonAuctionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("details");
  const [copied, setCopied] = useState<{ vin: boolean; auction: boolean }>({ vin: false, auction: false });

  const handleCopy = (type: "vin" | "auction", value: string) => {
    navigator.clipboard.writeText(value || "");
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 1200);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiUrl}/auctions/api/v1/won/${id}/`, { headers });
        setData(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to fetch auction details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Helper for seller/dealer info
  const seller = data?.dealer || {};
  const sellerName = seller.dealership_name || "-";
  const sellerAddress = [seller.street_name, seller.city?.name, seller.state?.name, seller.zipcode].filter(Boolean).join(", ");
  const sellerPhone = seller.phone_number || "-";

  // Helper for buyer info (placeholder)
  const buyer = data?.buyer || {};
  const buyerName = buyer.name || "-";
  const buyerAddress = buyer.address || "-";
  const buyerPhone = buyer.phone || "-";

  // Inspector info
  const inspector = data?.inspector_assigned || {};
  const inspectorName = inspector.first_name || "-";
  const inspectorEmail = inspector.email || "-";
  const inspectorPhone = inspector.phone_number || "-";

  // Car info
  const make = data?.make || "-";
  const model = data?.model || "-";
  const trim = data?.trim || "-";
  const year = data?.year || "-";
  const vin = data?.vin || "-";
  const auctionId = data?.auction_id || "-";
  const expectedPrice = data?.expected_price || "-";
  const bidPrice = data?.bid_price || "-";
  const auctionStart = data?.auction_date ? new Date(data.auction_date).toLocaleDateString() : "-";
  const auctionEnd = data?.auction_end ? new Date(data.auction_end).toLocaleDateString() : "-";

  // Placeholder for report URL, bids, and views
  const reportUrl = data?.report_url || "#";
  const bidsCount = data?.bids_count ?? 1; // fallback to 1 if not available
  const viewsCount = data?.views_count ?? 0; // fallback to 0 if not available

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <Breadcrumbs items={[{ label: "Auctions", href: "/auctions" }, { label: "Won", href: "/auctions/won" }, { label: `Auction ${auctionId}` }]} />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            {/* Top bar: left and right icons/buttons */}
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => router.push(`/auctions-ds/${id}`)}
                className="bg-white border border-sky-700 text-sky-700 px-3 py-1 rounded shadow-sm font-semibold hover:bg-sky-50 transition"
              >
                View Report
              </button>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-sky-900 font-semibold">
                  <PushpinOutlined /> Bids {bidsCount}
                </span>
                <span className="flex items-center gap-1 text-sky-900 font-semibold">
                  <EyeOutlined /> Views {viewsCount}
                </span>
              </div>
            </div>
            {/* Top section: image + title */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 border-b pb-6 mb-6">
              <div className="flex-shrink-0 w-full md:w-64 h-40 bg-gray-200 rounded flex items-center justify-center">
                {/* Placeholder image */}
                <span className="text-gray-400">Image</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="text-2xl font-bold">{make} {model} {trim} {year}</div>
                <div className="text-gray-500 text-sm flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    VIN {vin}
                    <CopyOutlined
                      className="cursor-pointer hover:text-sky-700"
                      onClick={() => handleCopy("vin", vin)}
                    />
                    {copied.vin && <span className="text-xs text-sky-700 ml-1">Copied!</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    AUCTION {auctionId}
                    <CopyOutlined
                      className="cursor-pointer hover:text-sky-700"
                      onClick={() => handleCopy("auction", auctionId)}
                    />
                    {copied.auction && <span className="text-xs text-sky-700 ml-1">Copied!</span>}
                  </span>
                </div>
              </div>
            </div>
            {/* Tabs */}
            <Tabs activeKey={tab} onChange={setTab} className="mb-4">
              <Tabs.TabPane tab="Details" key="details">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Dealer */}
                  <div>
                    <div className="font-semibold text-sky-800 mb-1">Dealer</div>
                    <div>{sellerName}</div>
                    <div>{sellerAddress}</div>
                    <div>{sellerPhone}</div>
                  </div>
                  {/* Buyer */}
                  <div>
                    <div className="font-semibold text-sky-800 mb-1">Buyer</div>
                    <div>{buyerName}</div>
                    <div>{buyerAddress}</div>
                    <div>{buyerPhone}</div>
                  </div>
                  {/* Inspector */}
                  <div>
                    <div className="font-semibold text-sky-800 mb-1">Inspector</div>
                    <div>{inspectorName}</div>
                    <div>{inspectorEmail}</div>
                    <div>{inspectorPhone}</div>
                  </div>
                  {/* Price/Info */}
                  <div className="flex flex-col items-end">
                    <div className="text-gray-500">Expected</div>
                    <div className="font-bold text-lg">${expectedPrice}</div>
                    <div className="text-gray-500 mt-2">Bid Price</div>
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold text-xl mt-1">${bidPrice}</div>
                  </div>
                </div>
                {/* Car info row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  <div>
                    <div className="text-gray-500">Make</div>
                    <div className="font-semibold">{make}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Model</div>
                    <div className="font-semibold">{model}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Trim</div>
                    <div className="font-semibold">{trim}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Year</div>
                    <div className="font-semibold">{year}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Auction Start</div>
                    <div className="font-semibold">{auctionStart}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Auction End</div>
                    <div className="font-semibold">{auctionEnd}</div>
                  </div>
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Payment" key="payment">
                <div className="text-gray-500">Payment tab content (to be provided)</div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Title & Transport" key="title-transport">
                <div className="text-gray-500">Title & Transport tab content (to be provided)</div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Photos" key="photos">
                <div className="text-gray-500">Photos tab content (to be provided)</div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
} 