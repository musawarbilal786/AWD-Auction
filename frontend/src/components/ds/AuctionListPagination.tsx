import React from "react";

interface AuctionListPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function AuctionListPagination({ currentPage, totalPages, pageSize, pageSizeOptions, onPageChange, onPageSizeChange }: AuctionListPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex flex-row items-center justify-between mt-6 gap-4 flex-wrap">
      <div className="flex flex-row items-center gap-2">
        <span className="text-gray-500 text-sm">Items per page:</span>
        <select
          className="rounded border px-2 py-1 text-sm shadow"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-row items-center gap-1">
        <button
          className="px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {pages.map(page => (
          <button
            key={page}
            className={`px-3 py-1 rounded font-semibold ${page === currentPage ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
} 