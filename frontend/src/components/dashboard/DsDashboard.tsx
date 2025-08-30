"use client";
import { Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Image from "next/image";

const auctionPerformance = [
  {
    title: "Ford F150 2016",
    vin: "1G1F1DRS960145730",
    views: 0,
    bids: 0,
  },
  {
    title: "Volkwage Jetta 2021",
    vin: "3VWCS7BUXWM031277",
    views: 0,
    bids: 0,
  },
  {
    title: "Cadillac 1010 2021",
    vin: "123344455",
    views: 0,
    bids: 0,
  },
];

export default function DsDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
      {/* Desktop layout: two columns */}
      <div className="hidden md:flex flex-row gap-4 w-full">
        {/* Left/Main column: Banner, Auction Performance, Listing Views */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Banner */}
          <div className="relative rounded-xl overflow-hidden shadow-md h-[220px] md:h-[260px]">
            <Image
              src="/images/ds-banner"
              alt="Dashboard Hero"
              fill
              className="object-cover object-center z-0"
              priority
            />
            <div className="absolute inset-0 bg-blue-900 bg-opacity-80 z-10 rounded-xl" />
            <div className="relative z-20 flex flex-col justify-center h-full px-6 md:px-10 gap-2 md:gap-4">
              <div className="text-white text-xl md:text-3xl font-bold max-w-2xl leading-tight">
                We updated our cancellation policy to ensure the user experience
              </div>
              <div className="text-white text-base md:text-lg max-w-xl">
                Learn more about our latest news on blog
              </div>
              <button className="mt-3 w-fit bg-black text-white font-semibold rounded px-6 py-2 text-base md:text-lg shadow hover:bg-gray-900 transition">
                Explore Updates
              </button>
            </div>
          </div>
          {/* Auction Performance */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">Auctions Performance</span>
              <span className="text-gray-400 text-sm font-bold">Top 5</span>
            </div>
            <div className="divide-y divide-gray-100">
              {auctionPerformance.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center py-2 gap-1 md:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-blue-900 truncate">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate">{item.vin}</div>
                  </div>
                  <div className="flex flex-row items-center gap-8 mt-1 md:mt-0">
                    <div className="text-center">
                      <div className="text-sky-700 font-bold text-base">{item.views}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sky-700 font-bold cursor-pointer">No Bids</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Listing Views */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col gap-2 min-h-[100px]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">Your listings views</span>
              <span className="text-gray-400 text-sm font-bold flex items-center gap-1">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#A0AEC0" strokeWidth="2" d="M8 7h8m-8 4h8m-8 4h4"/><rect width="24" height="24" rx="12" fill="#F3F4F6"/></svg>
                Last 7 days
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-400 font-semibold min-h-[60px]">No data found</div>
          </div>
        </div>
        {/* Right column: User Info/Stats */}
        <div className="w-full md:w-[360px] flex-shrink-0 flex flex-col gap-4 md:self-start">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-2">
            <Avatar size={64} className="bg-blue-700 text-white text-2xl" icon={<UserOutlined />}>
              MB
            </Avatar>
            <div className="text-center mt-2">
              <div className="text-gray-500 text-base font-semibold">Hello!</div>
              <div className="text-blue-900 text-xl font-bold leading-tight">Musawar Bilal</div>
              <div className="text-gray-400 text-sm">Dealership : testing dealer</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <span className="text-gray-500 font-medium">Total Listings</span>
              <span className="text-blue-900 font-bold text-lg">0</span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-gray-500 font-medium">Total Spent</span>
              <span className="text-blue-900 font-bold text-lg">$ 0</span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-gray-500 font-medium">Total Bids</span>
              <span className="text-blue-900 font-bold text-lg">1</span>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile layout: stack everything in correct order */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Banner */}
        <div className="relative rounded-xl overflow-hidden shadow-md h-[220px]">
          <Image
            src="/images/ds-banner"
            alt="Dashboard Hero"
            fill
            className="object-cover object-center z-0"
            priority
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-80 z-10 rounded-xl" />
          <div className="relative z-20 flex flex-col justify-center h-full px-6 gap-2">
            <div className="text-white text-xl font-bold max-w-2xl leading-tight">
              We updated our cancellation policy to ensure the user experience
            </div>
            <div className="text-white text-base max-w-xl">
              Learn more about our latest news on blog
            </div>
            <button className="mt-3 w-fit bg-black text-white font-semibold rounded px-6 py-2 text-base shadow hover:bg-gray-900 transition">
              Explore Updates
            </button>
          </div>
        </div>
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-2">
          <Avatar size={64} className="bg-blue-700 text-white text-2xl" icon={<UserOutlined />}>
            MB
          </Avatar>
          <div className="text-center mt-2">
            <div className="text-gray-500 text-base font-semibold">Hello!</div>
            <div className="text-blue-900 text-xl font-bold leading-tight">Musawar Bilal</div>
            <div className="text-gray-400 text-sm">Dealership : testing dealer</div>
          </div>
        </div>
        {/* Total Listings Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center">
            <span className="text-gray-500 font-medium">Total Listings</span>
            <span className="text-blue-900 font-bold text-lg">0</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-gray-500 font-medium">Total Spent</span>
            <span className="text-blue-900 font-bold text-lg">$ 0</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-gray-500 font-medium">Total Bids</span>
            <span className="text-blue-900 font-bold text-lg">1</span>
          </div>
        </div>
        {/* Auction Performance */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-900">Auctions Performance</span>
            <span className="text-gray-400 text-sm font-bold">Top 5</span>
          </div>
          <div className="divide-y divide-gray-100">
            {auctionPerformance.map((item, idx) => (
              <div key={idx} className="flex flex-col py-2 gap-1">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-blue-900 truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 truncate">{item.vin}</div>
                </div>
                <div className="flex flex-row items-center gap-8 mt-1">
                  <div className="text-center">
                    <div className="text-sky-700 font-bold text-base">{item.views}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sky-700 font-bold cursor-pointer">No Bids</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Listing Views */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 min-h-[100px]">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-900">Your listings views</span>
            <span className="text-gray-400 text-sm font-bold flex items-center gap-1">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#A0AEC0" strokeWidth="2" d="M8 7h8m-8 4h8m-8 4h4"/><rect width="24" height="24" rx="12" fill="#F3F4F6"/></svg>
              Last 7 days
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400 font-semibold min-h-[60px]">No data found</div>
        </div>
      </div>
    </div>
  );
} 