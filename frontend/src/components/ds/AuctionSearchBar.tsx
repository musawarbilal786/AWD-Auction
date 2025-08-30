import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface AuctionSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  placeholder?: string;
  show?: boolean;
}

export default function AuctionSearchBar({ value, onChange, onSearch, placeholder = "Search by Year, Make or Model...", show = true }: AuctionSearchBarProps) {
  if (!show) return null;
  return (
    <div className="w-full flex flex-row items-center gap-2 mb-4">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-l-lg shadow h-12 text-base flex-1"
        onPressEnter={onSearch}
      />
      <button
        className="bg-sky-600 hover:bg-sky-700 text-white rounded-r-lg px-5 h-12 flex items-center justify-center text-xl"
        onClick={onSearch}
        aria-label="Search"
      >
        <SearchOutlined />
      </button>
    </div>
  );
} 