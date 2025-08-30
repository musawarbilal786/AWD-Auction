"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { DatePicker, Input, Select, Button, Tag } from "antd";
import React, { useState } from "react";
import { DownOutlined, EyeFilled, FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ExpandableRowContent from "@/components/common/ExpandableRowContent";

function FinancialReportExpandedRow({ record, expanded }: { record: any, expanded: boolean }) {
  return (
    <ExpandableRowContent expanded={expanded}>
      <span className="mb-4 bg-sky-700 text-white rounded px-4 py-1 flex items-center gap-2">
        <FileTextOutlined />
        View Invoice
      </span>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Buyer Invoice Card */}
        <div className="flex-1 bg-white rounded-xl shadow p-6 min-w-[220px]">
          <div className="font-bold text-blue-900 text-lg mb-1">Buyer Invoice</div>
          <div className="text-gray-500 text-sm mb-2">02 Jun 2025</div>
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex justify-between"><span>Bid Price</span><span className="font-bold text-right">100.00</span></div>
            <div className="flex justify-between"><span>Buying Fee</span><span className="font-bold text-right">0.00</span></div>
            <div className="flex justify-between"><span>Extended Arbitration</span><span className="font-bold text-right">10.00</span></div>
            <div className="flex justify-between font-bold mt-2"><span>Total</span><span className="text-blue-900">$10.00</span></div>
          </div>
          <button className="bg-sky-700 text-white rounded px-4 py-1 flex items-center gap-2">
            <EyeFilled/>
            View Invoice
          </button>
        </div>
        {/* Seller Transfer Card */}
        <div className="flex-1 bg-white rounded-xl shadow p-6 min-w-[220px]">
          <div className="font-bold text-blue-900 text-lg mb-1">Seller Transfer</div>
          <div className="text-gray-500 text-sm mb-2">04 Nov 2024</div>
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex justify-between"><span>Bid Amount</span><span className="font-bold text-right">100.00</span></div>
            <div className="flex justify-between"><span>Inspection Fee</span><span className="font-bold text-right">-50.00</span></div>
            <div className="flex justify-between"><span>Selling Fee</span><span className="font-bold text-right">-10.00</span></div>
            <div className="flex justify-between font-bold mt-2"><span>Total Amount</span><span className="text-blue-900">$40.00</span></div>
          </div>
        </div>
        {/* Transporter Transfer Card */}
        <div className="flex-1 bg-white rounded-xl shadow p-6 min-w-[220px] flex flex-col justify-center items-center">
          <div className="font-bold text-blue-900 text-lg mb-1">Transporter Transfer</div>
          <div className="text-gray-500 text-sm mb-2">No Transport is Taken</div>
        </div>
        {/* Platform Profit Card */}
        <div className="flex-1 bg-white rounded-xl shadow p-6 min-w-[220px]">
          <div className="font-bold text-blue-900 text-lg mb-1">Platform Profit</div>
          <div className="text-gray-500 text-sm mb-2">04 Nov 2024</div>
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex justify-between"><span>Buying Fee</span><span className="font-bold text-right">0.00</span></div>
            <div className="flex justify-between"><span>Inspection Fee</span><span className="font-bold text-right">50.00</span></div>
            <div className="flex justify-between"><span>Selling Fee</span><span className="font-bold text-right">10.00</span></div>
            <div className="flex justify-between font-bold mt-2"><span>Total</span><span className="text-green-600">$-50.00</span></div>
          </div>
        </div>
      </div>
    </ExpandableRowContent>
  );
}

export default function FinancialReportPage() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [filterBy, setFilterBy] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([]);

  // Mock summary values
  const buyerTotal = 6223.00;
  const sellerTotal = 580.30;
  const transportTotal = 901.04;
  const platformTotal = 3092.99;

  // Mock columns and data
  const columns = [
    {
      title: "Auction ID",
      dataIndex: "auctionId",
      key: "auctionId",
    },
    {
      title: "Vehicle Details",
      dataIndex: "vehicleDetails",
      key: "vehicleDetails",
    },
    {
      title: "Seller",
      dataIndex: "seller",
      key: "seller",
      render: (val: any) => <div dangerouslySetInnerHTML={{ __html: val }} />,
    },
    {
      title: "Buyer",
      dataIndex: "buyer",
      key: "buyer",
      render: (val: any) => <div dangerouslySetInnerHTML={{ __html: val }} />,
    },
    {
      title: "Won Type",
      dataIndex: "wonType",
      key: "wonType",
      render: (val: string) => val ? <Tag color="gold">{val}</Tag> : null,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: string) => {
        if (val === "Delivered") return <Tag color="green">Delivered</Tag>;
        if (val === "Manual Delivery") return <Tag color="orange">Manual Delivery</Tag>;
        if (val === "Payment Received") return <Tag color="cyan">Payment Received</Tag>;
        if (val === "Proxy Won") return <Tag color="yellow">Proxy Won</Tag>;
        return <Tag>{val}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => val ? `$ ${val}` : null,
    },
  ];

  const data = [
    {
      key: 1,
      auctionId: "1984188628",
      vehicleDetails: "VIN : JA4J4UA86NZ065825<br/>2024 for testing 1010 triming9999",
      seller: "<b>Archienoah</b><br/>Archienoah San Tan Valley,<br/>247 E Gold Dust Way, 85142,<br/><b>+1 (928) 453-6555</b>",
      buyer: "<b>Henryroob</b><br/>15205 North Kierland Blvd. Suite 100, Scottsdale<br/>+1 (363) 787-3833",
      wonType: "",
      status: "Delivered",
      amount: 100,
    },
    {
      key: 2,
      auctionId: "2478293148",
      vehicleDetails: "VIN : 23456<br/>887 othermake testmodel2 testTrim",
      seller: "<b>Speed Car</b><br/>South Dakota, 34021 N US-45, Grayslake, IL 60030 ,<br/>57102,<br/><b>605-371-7629</b>",
      buyer: "<b>Lacey Stanley</b><br/>Taylor Berg, Daryl Vincent<br/>+1 (273) 953-8544",
      wonType: "",
      status: "Manual Delivery",
      amount: 500,
    },
    {
      key: 3,
      auctionId: "562511253",
      vehicleDetails: "VIN : JN8AS5MV5CW392335<br/>2 2 2 2",
      seller: "<b>Archienoah</b><br/>Archienoah San Tan Valley,<br/>247 E Gold Dust Way, 85142,<br/><b>+1 (928) 453-6555</b>",
      buyer: "<b>Henryroob</b><br/>15205 North Kierland Blvd. Suite 100, Scottsdale<br/>+1 (363) 787-3833",
      wonType: "",
      status: "Payment Received",
      amount: 300,
    },
    {
      key: 4,
      auctionId: "385888834",
      vehicleDetails: "VIN : 887<br/>12345 testMake testModel testTrim",
      seller: "<b>Speed Car</b><br/>New York yard, 433 1st Ave, New York, NY 10010, USA, 00000,<br/><b>+1 (545) 4455 454</b>",
      buyer: "<b>Lacey Stanley</b><br/>Taylor Berg, Daryl Vincent<br/>+1 (273) 953-8544",
      wonType: "",
      status: "Delivered",
      amount: 234,
    },
    {
      key: 5,
      auctionId: "3107157482",
      vehicleDetails: "VIN : JM3TB3DV4C0352508<br/>2012 Mazda CX-9 4D SUV AWD",
      seller: "<b>Aladdin Harmon</b><br/>Aladdin Harmon RUSSELLVILLE, 15046 Hwy 43 Ste C, 35653,<br/><b>+1 (533) 926-8259</b>",
      buyer: "<b>Marten Lobo</b><br/>1520 E Buena Vista Drive #A, Lake Buena Vista<br/>+1 (312) 226-3610",
      wonType: "Proxy Won",
      status: "Delivered",
      amount: 400,
    },
    {
      key: 6,
      auctionId: "47124828",
      vehicleDetails: "VIN : WMWZC3C53CWL85138<br/>2012 Mini Cooper 4D Hatchback",
      seller: "<b>Aladdin Harmon</b><br/>Aladdin Harmon RUSSELLVILLE, 15046 Hwy 43 Ste C, 35653,<br/><b>+1 (533) 926-8259</b>",
      buyer: "<b>Marten Lobo</b><br/>1520 E Buena Vista Drive #A, Lake Buena Vista<br/>+1 (312) 226-3610",
      wonType: "Proxy Won",
      status: "Delivered",
      amount: 1700,
    },
    {
      key: 7,
      auctionId: "3719587407",
      vehicleDetails: "VIN : 1G2MB35B16Y118676<br/>2006 Pontiac Solstice 2D Roadster",
      seller: "<b>Aladdin Harmon</b><br/>Aladdin Harmon RUSSELLVILLE, 15046 Hwy 43 Ste C, 35653,<br/><b>+1 (533) 926-8259</b>",
      buyer: "<b>Marten Lobo</b><br/>1520 E Buena Vista Drive #A, Lake Buena Vista<br/>+1 (312) 226-3610",
      wonType: "",
      status: "Delivered",
      amount: 200,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <div className="px-2 sm:px-6 pt-4 pb-2 w-full">
        <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Financial" }]} />
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 mb-4 mt-2 w-full">
          <div className="flex flex-row gap-2 items-center flex-wrap">
            <span className="font-semibold">Date From:</span>
            <DatePicker format="DD/MM/YYYY" className="!w-[140px]" placeholder="dd/mm/yyyy" />
            <span className="font-semibold">to</span>
            <DatePicker format="DD/MM/YYYY" className="!w-[140px]" placeholder="dd/mm/yyyy" />
          </div>
          <div className="flex flex-row gap-2 items-center flex-wrap">
            <span className="font-semibold">Filter By:</span>
            <Select defaultValue="All" className="!w-[120px]" options={[{ value: "All", label: "All" }]} />
          </div>
          <div className="flex-1 flex flex-row gap-2 items-center">
            <button className="bg-sky-700 text-white font-bold rounded px-4 py-1 flex items-center gap-2">
              <SearchOutlined />
              Search
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-blue-100 text-blue-900 font-bold rounded px-4 py-2">Buyer Total: <span className="text-lg">{buyerTotal.toFixed(2)}</span></div>
          <div className="bg-green-100 text-green-900 font-bold rounded px-4 py-2">Seller Total: <span className="text-lg">{sellerTotal.toFixed(2)}</span></div>
          <div className="bg-yellow-100 text-yellow-900 font-bold rounded px-4 py-2">Transport Total: <span className="text-lg">{transportTotal.toFixed(2)}</span></div>
          <div className="bg-gray-100 text-gray-900 font-bold rounded px-4 py-2">Platform Total: <span className="text-lg">{platformTotal.toFixed(2)}</span></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col w-full px-2 sm:px-6 pb-4">
        <div className="flex-1 bg-white rounded-xl shadow-md p-2 sm:p-6 w-full overflow-auto">
          <DataTable
            columns={columns}
            data={data}
            tableData={{
              isEnableFilterInput: false,
              selectableRows: false,
            }}
            expandable={{
              expandedRowRender: (record: any) => <FinancialReportExpandedRow record={record} expanded={expandedRowKeys.includes(record.key)} />,
              expandedRowKeys,
              onExpand: (expanded: boolean, record: any) => {
                setExpandedRowKeys(expanded ? [record.key] : []);
              },
              rowExpandable: (record: any) => true,
              expandIcon: ({ expanded, onExpand, record }: { expanded: boolean; onExpand: (record: any, e: React.MouseEvent<HTMLElement, MouseEvent>) => void; record: any }) => (
                <Button
                  type="text"
                  icon={<DownOutlined rotate={expanded ? 180 : 0} />}
                  onClick={e => onExpand(record, e)}
                  className="!flex items-center justify-center !w-10 !h-16"
                />
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
} 