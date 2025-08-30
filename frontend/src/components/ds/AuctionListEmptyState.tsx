import React from "react";

export default function AuctionListEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2">
        <circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2" fill="#f1f5f9" />
        <path d="M8 12h8M8 16h4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="text-lg font-semibold">No auctions found</div>
    </div>
  );
} 