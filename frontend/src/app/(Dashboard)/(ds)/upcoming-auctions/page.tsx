'use client'
import React, { useState, useMemo, useEffect } from "react";
import AuctionSearchBar from "@/components/ds/AuctionSearchBar";
import AuctionFiltersSidebar from "@/components/ds/AuctionFiltersSidebar";
import UpcomingAuctionCard from "@/components/ds/UpcomingAuctionCard";
import AuctionListPagination from "@/components/ds/AuctionListPagination";
import AuctionListEmptyState from "@/components/ds/AuctionListEmptyState";
import axios from "axios";
import { useRouter } from "next/navigation";

// Mock filter options
const filterOptions = {
  makeModel: [
    { value: "Ford", label: "Ford", count: 2 },
    { value: "BMW", label: "BMW", count: 1 },
    { value: "Toyota", label: "Toyota", count: 1 },
    { value: "Honda", label: "Honda", count: 1 },
    { value: "Chevrolet", label: "Chevrolet", count: 1 },
  ],
  price: { range: [100, 900], marks: { 100: "$100", 900: "$900" } },
  year: { range: [2002, 2023], marks: { 2002: "2002", 2023: "2023" } },
  mileage: { range: [10, 120000], marks: { 10: "10 Miles", 120000: "120k Miles" } },
  fuelType: [
    { value: "Gas", label: "Gas", count: 3 },
    { value: "Hybrid", label: "Hybrid", count: 1 },
    { value: "Diesel", label: "Diesel", count: 1 },
  ],
  transmission: [
    { value: "Automatic", label: "Automatic", count: 4 },
    { value: "Manual", label: "Manual", count: 1 },
  ],
};

const defaultFilters = {
  makeModel: [],
  price: [100, 900],
  year: [2002, 2023],
  mileage: [10, 120000],
  fuelType: [],
  transmission: [],
};

export default function DsUpcomingAuctions() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiUrl}/auctions/api/v1/upcoming/`, { headers });
        // Map API response to UI shape
        const mapped = (response.data || []).map((item: any) => {
          const req = item.request_id || {};
          // Map lights array to colors
          const colors = Array.isArray(req.lights)
            ? req.lights.map((color: string) => ({ color, label: color.charAt(0).toUpperCase() + color.slice(1) }))
            : [];
          return {
            image: "/images/auth-background.jpg", // Placeholder, replace if you have real image
            title: `${req.year || ''} ${req.make || ''} ${req.model || ''}`.trim(),
            vin: req.vin || '',
            colors,
            specs: [
              { label: "Miles", value: req.odometer || '' },
              { label: "ENG", value: req.engine || '' },
              { label: "Cyl", value: req.cylinders || '' },
              { label: "Transmission", value: req.transmission || '' },
            ],
            status: "Coming Soon",
            labelText: "Coming Soon",
            id: item.id, // Assuming item.id is available from the API
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
            <>
              <div className="text-center text-gray-500">Loading upcoming auctions...</div>
              <AuctionListEmptyState />
            </>
          ) : error ? (
            <>
              <div className="text-center text-red-500">{error}</div>
              <AuctionListEmptyState />
            </>
          ) : pagedAuctions.length === 0 ? (
            <AuctionListEmptyState />
          ) : (
            pagedAuctions.map((auction, idx) => (
              <UpcomingAuctionCard
                key={idx}
                {...auction}
                routePath={`/upcoming-auctions/${auction.id}`}
              />
            ))
          )}
          <AuctionListPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[3, 5, 10]}
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