'use client'
import React, { useState, useMemo } from "react";
import AuctionSearchBar from "@/components/ds/AuctionSearchBar";
import AuctionFiltersSidebar from "@/components/ds/AuctionFiltersSidebar";
import AuctionListCard from "@/components/ds/AuctionListCard";
import AuctionListPagination from "@/components/ds/AuctionListPagination";
import AuctionListEmptyState from "@/components/ds/AuctionListEmptyState";
import axios from "axios";

const filterOptions = {
  makeModel: [
    { value: "Ford", label: "Ford", count: 2 },
    { value: "BMW", label: "BMW", count: 1 },
    { value: "Toyota", label: "Toyota", count: 1 },
    { value: "Honda", label: "Honda", count: 1 },
    { value: "Chevrolet", label: "Chevrolet", count: 2 },
    { value: "Mazda", label: "Mazda", count: 1 },
    { value: "Hummer", label: "Hummer", count: 1 },
    { value: "Nissan", label: "Nissan", count: 1 },
    { value: "Kia", label: "Kia", count: 1 },
    { value: "Audi", label: "Audi", count: 1 },
    { value: "Hyundai", label: "Hyundai", count: 1 },
  ],
  price: { range: [100, 40000], marks: { 100: "$100", 40000: "$40k" } },
  year: { range: [1975, 2023], marks: { 1975: "1975", 2023: "2023" } },
  mileage: { range: [1000, 120000], marks: { 1000: "1k Miles", 120000: "120k Miles" } },
  fuelType: [
    { value: "Gas", label: "Gas", count: 8 },
    { value: "Hybrid", label: "Hybrid", count: 2 },
    { value: "Diesel", label: "Diesel", count: 2 },
  ],
  transmission: [
    { value: "Automatic", label: "Automatic", count: 10 },
    { value: "Manual", label: "Manual", count: 2 },
  ],
};

const defaultFilters = {
  makeModel: [],
  price: [100, 40000],
  year: [1975, 2023],
  mileage: [1000, 120000],
  fuelType: [],
  transmission: [],
};

export default function DsAuctions() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<any[]>([]);

  // Fetch auctions function
  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiUrl}/auctions/api/v1/marketplace/`, { headers });
      // Robust mapping as in upcoming-auctions
      const mapped = (response.data || []).map((item: any) => {
        const req = item.request_id || item; // fallback to item if no request_id
        const colors = Array.isArray(req.lights)
          ? req.lights.map((color: string) => ({ color, label: color.charAt(0).toUpperCase() + color.slice(1) }))
          : [];
        // Map status number to label and color
        let labelText = '';
        let labelColor = '';
        let statusLabel = '';
        if (typeof item.status === 'number') {
          switch (item.status) {
            case 0:
              labelText = 'Coming Soon';
              labelColor = '#64748b';
              statusLabel = 'Coming Soon';
              break;
            case 1:
              labelText = 'Live';
              labelColor = '#22c55e';
              statusLabel = 'Live';
              break;
            case 2:
              labelText = 'In Negotiation';
              labelColor = '#eab308';
              statusLabel = 'In Negotiation';
              break;
            case 3:
              labelText = 'Ended';
              labelColor = '#ef4444';
              statusLabel = 'Ended';
              break;
            default:
              labelText = 'Unknown';
              labelColor = '#64748b';
              statusLabel = 'Unknown';
          }
        } else if (typeof item.status === 'string') {
          labelText = item.status;
          labelColor = '#64748b';
          statusLabel = item.status;
        }
        
        const safe = (v: any) => v === undefined || v === null || v === '' ? '-' : v;
        
        return {
          id: item.id || req.id,
          auctionId: item.auction_id || req.auction_id,
          image: req.image || "/images/auth-background.jpg",
          title: `${safe(req.year)} ${safe(req.make)} ${safe(req.model)}`.replace(/-/g, '').trim() || 'Vehicle',
          vin: req.vin ? req.vin.slice(-6) : '-',
          colors,
          specs: [
            { label: 'Mileage', value: safe(req.odometer) },
            { label: 'Transmission', value: safe(req.transmission) },
            { label: 'Drivetrain', value: safe(req.drivetrain) },
          ],
          status: statusLabel,
          labelText,
          labelColor,
          price: req.expected_price ? `$${Number(req.expected_price).toLocaleString()}` : 'N/A',
          miles: req.odometer ? `${Number(req.odometer).toLocaleString()}` : null,
          hasBids: item.last_bid_id !== null,
          currentBid: item.last_bid_id?.bid || null,
        };
      });
      setAuctions(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch auctions.");
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh auctions function to be passed to AuctionListCard
  const refreshAuctions = () => {
    console.log("Refreshing auctions list...");
    fetchAuctions();
  };

  React.useEffect(() => {
    fetchAuctions();
  }, []);

  // Filtering logic
  const filteredAuctions = useMemo(() => {
    let data = auctions;
    if (search.trim()) {
      data = data.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (filters.makeModel.length) {
      data = data.filter(a => filters.makeModel.some((m: string) => a.title.toLowerCase().includes(m.toLowerCase())));
    }
    // (Add more filter logic as needed)
    return data;
  }, [search, filters, auctions]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAuctions.length / pageSize);
  const pagedAuctions = filteredAuctions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-2xl font-bold mt-2">Marketplace</h1>
      
      <AuctionSearchBar value={search} onChange={setSearch} onSearch={() => {}} />
      {/* Filters button for mobile */}
      <div className="md:hidden flex justify-end mb-2">
        <button
          className="border rounded-lg px-4 py-2 flex items-center gap-2 text-sky-700 font-semibold bg-white shadow"
          onClick={() => setFiltersOpen(true)}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M6 12h12M10 18h4" stroke="#0369a1" strokeWidth="2" strokeLinecap="round"/></svg>
          Filters
        </button>
      </div>
      {/* Mobile Filters Modal */}
      {filtersOpen && (
        <AuctionFiltersSidebar
          filters={filters}
          onChange={setFilters}
          filterOptions={filterOptions}
          onApply={() => { setPage(1); setFiltersOpen(false); }}
          open={true}
          onClose={() => setFiltersOpen(false)}
        />
      )}
      <div className="flex flex-col md:flex-row gap-6 w-full">
       
        {/* Auction List */}
        <div className="flex-1 flex flex-col gap-4">
          {loading ? (
            <p>Loading auctions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : pagedAuctions.length === 0 ? (
            <AuctionListEmptyState />
          ) : (
            pagedAuctions.map((auction, idx) => (
              <AuctionListCard 
                key={idx} 
                {...auction} 
                routePath={`/auctions-ds/${auction.id}`}
                auctionId={auction.auctionId}
                hasBids={auction.hasBids}
                currentBid={auction.currentBid}
                onRefresh={refreshAuctions}
              />
            ))
          )}
          <AuctionListPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20]}
            onPageChange={setPage}
            onPageSizeChange={size => { setPageSize(size); setPage(1); }}
          />
        </div>
        
        {/* Desktop sidebar */}
        <div className="hidden md:block md:w-80 w-full flex-shrink-0">
          <AuctionFiltersSidebar
            filters={filters}
            onChange={setFilters}
            filterOptions={filterOptions}
            onApply={() => setPage(1)}
          />
        </div>
       
      </div>
    </div>
  );
} 