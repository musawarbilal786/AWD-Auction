import { Modal, Input } from "antd";
import React, { useState } from "react";

interface SendToAuctionModalProps {
  open: boolean;
  onOk: (auctionData: any) => void;
  onCancel: () => void;
  vehicleData?: any; // Accept the full object
}

export default function SendToAuctionModal({
  open,
  onOk,
  onCancel,
  vehicleData = {},
}: SendToAuctionModalProps) {
  if (!vehicleData) return null;
  const [auctionType, setAuctionType] = useState("bring_money");
  const [auctionTiming, setAuctionTiming] = useState("10_minutes");
  const [creditUse, setCreditUse] = useState("inspection");
  const [editableReservePrice, setEditableReservePrice] = useState(vehicleData.reserve_price || 0);

  // Destructure and fallback
  const {
    make,
    model,
    year,
    vin,
    odometer,
    expected_price,
    credit,
    reserve_price,
    // add more fields as needed
  } = vehicleData;

  const vehicleTitle = `${make || ""} ${model || ""} ${year || ""}`.trim() || "Vehicle";
  const mileage = odometer ? `${odometer} Miles` : "";
  const estimatedPrice = expected_price || 0;
  const reservePrice = reserve_price || 0;
  const vehicleVin = vin || "-";
  const vehicleCredit = credit || 0;

  const handleSend = () => {
    const payload = {
      request_id: vehicleData.id,
      reserve_price: Number(editableReservePrice),
      auction_type: auctionType === "bring_money" ? 1 : 2,
      credit_use_for_inspection_fee: creditUse === "inspection" ? 1 : 0,
      credit_use_for_selling_fee: creditUse === "selling" ? 1 : 0
    };
    onOk(payload);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={500}
      closeIcon={
        <div className="w-8 h-8 flex items-center justify-center bg-sky-500 rounded-full text-white text-lg cursor-pointer">
          ×
        </div>
      }
      className="p-0"
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b">
        <div className="text-2xl font-bold text-sky-800 mb-1">Send To Auction</div>
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-lg mb-0">{vehicleTitle}</div>
            <div className="text-gray-500 text-sm leading-tight">{vehicleVin}</div>
            <div className="text-gray-500 text-sm leading-tight">{mileage}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-semibold">Estimated Price</div>
            <div className="text-3xl font-extrabold text-sky-900">${Number(estimatedPrice).toLocaleString()}</div>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="px-8 pt-6 pb-0 bg-white">
        {/* Reserve Price */}
        <div className="font-bold text-xs text-gray-700 mb-2 mt-2 tracking-wider">RESERVE PRICE</div>
        <div className="mb-2">
          <Input
            size="large"
            value={editableReservePrice}
            onChange={(e) => setEditableReservePrice(e.target.value.replace(/[^0-9]/g, ''))}
            className="text-lg font-bold text-sky-700"
            style={{ fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}
            prefix="$"
          />
        </div>
        <hr className="mb-6" />
        {/* Auction Type */}
        <div className="font-semibold text-gray-700 mb-2">Auction Type</div>
        <div className="flex flex-col gap-3 mb-6">
          <div
            className={`border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer ${auctionType === "bring_money" ? "border-sky-500 bg-sky-50" : "border-gray-300 bg-white"}`}
            onClick={() => setAuctionType("bring_money")}
          >
            <div>
              <div className={`font-bold text-base ${auctionType === "bring_money" ? "text-sky-700" : "text-gray-900"}`}>Bring the money</div>
              <div className="text-gray-400 text-xs">This option will start bidding $0</div>
            </div>
            {auctionType === "bring_money" && (
              <span className="w-6 h-6 flex items-center justify-center border-2 border-sky-500 rounded-full">
                <span className="w-3 h-3 bg-sky-500 rounded-full block"></span>
              </span>
            )}
          </div>
          <div
            className={`border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer ${auctionType === "less_reserve" ? "border-sky-500 bg-sky-50" : "border-gray-300 bg-white"}`}
            onClick={() => setAuctionType("less_reserve")}
          >
            <div>
              <div className={`font-bold text-base ${auctionType === "less_reserve" ? "text-sky-700" : "text-gray-900"}`}>$3,000 less than reserve</div>
              <div className="text-gray-400 text-xs">Start the bid at $3,000 less than reserve</div>
            </div>
            {auctionType === "less_reserve" && (
              <span className="w-6 h-6 flex items-center justify-center border-2 border-sky-500 rounded-full">
                <span className="w-3 h-3 bg-sky-500 rounded-full block"></span>
              </span>
            )}
          </div>
        </div>
        {/* Auction Timing */}
        <div className="font-semibold text-gray-700 mb-2">Auction Timing</div>
        <div className="flex flex-col gap-3 mb-6">
          <div
            className={`border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer ${auctionTiming === "10_minutes" ? "border-sky-500 bg-blue-50" : "border-gray-300 bg-white"}`}
            onClick={() => setAuctionTiming("10_minutes")}
          >
            <div className={`font-bold text-base ${auctionTiming === "10_minutes" ? "text-sky-700" : "text-gray-900"}`}>10 Minutes</div>
            {auctionTiming === "10_minutes" && (
              <span className="w-6 h-6 flex items-center justify-center border-2 border-sky-500 rounded-full">
                <span className="w-3 h-3 bg-sky-500 rounded-full block"></span>
              </span>
            )}
          </div>
        </div>
        {/* Credit Use */}
        <div className="mt-2 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-700 text-base">Credit Use</span>
            <span className="font-bold text-gray-700 text-base">${vehicleCredit?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex gap-4">
            <div
              className={`flex-1 border rounded-lg px-4 py-3 font-bold text-center cursor-pointer ${
                creditUse === "inspection" 
                  ? "border-sky-500 bg-sky-50 text-sky-700" 
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              onClick={() => setCreditUse("inspection")}
            >
              For Inspection Fee
            </div>
            <div
              className={`flex-1 border rounded-lg px-4 py-3 font-bold text-center cursor-pointer ${
                creditUse === "selling" 
                  ? "border-sky-500 bg-sky-50 text-sky-700" 
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              onClick={() => setCreditUse("selling")}
            >
              For Selling Fee
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 pb-6 border-t mt-8">
          <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold bg-white" onClick={onCancel}>Close</button>
          <button className="px-6 py-2 rounded-lg text-white font-semibold bg-sky-600 hover:bg-sky-700" onClick={handleSend}>Send Now</button>
        </div>
      </div>
    </Modal>
  );
} 