import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';

interface SetProxyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  title: string;
  price?: string | number;
  vin?: string;
  currentBid?: number | null;
  loading?: boolean;
}

export default function SetProxyModal({
  open,
  onClose,
  onConfirm,
  title,
  price,
  vin,
  currentBid,
  loading = false
}: SetProxyModalProps) {
  const [proxyAmount, setProxyAmount] = useState("");

  const handleConfirm = () => {
    const amount = parseFloat(proxyAmount);
    if (amount > 0) {
      onConfirm(amount);
    }
  };

  const incrementAmount = () => {
    const currentAmount = parseFloat(proxyAmount) || 0;
    setProxyAmount((currentAmount + 100).toFixed(2));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setProxyAmount(value);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      closeIcon={
        <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center">
          <span className="text-white text-lg font-bold">×</span>
        </div>
      }
    >
      <div className="text-center">
        {/* Proxy Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Proxy Bid</h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">Set your maximum bid amount. The system will automatically bid on your behalf up to this amount.</p>
        
        {/* Vehicle Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-lg font-semibold text-gray-900 mb-2">{title}</div>
          {price && <div className="text-xl font-bold text-sky-600">$ {price}</div>}
          {vin && <div className="text-sm text-gray-500 mt-1">VIN: {vin}</div>}
          {currentBid && (
            <div className="text-sm text-gray-600 mt-2">
              Current Bid: $ {currentBid.toLocaleString()}
            </div>
          )}
        </div>
        
        {/* Proxy Amount Input */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-2 text-left">Proxy Amount</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                size="large"
                value={`$ ${proxyAmount}`}
                onChange={handleInputChange}
                className="text-2xl font-bold text-purple-600 text-center"
                style={{ fontSize: '24px', fontWeight: 'bold', color: '#9333ea' }}
                placeholder="Enter proxy amount"
              />
            </div>
            <Button 
              type="primary" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={incrementAmount}
            >
              + $100
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-left">
            This will be your maximum bid amount. The system will bid automatically on your behalf.
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            size="large"
            className="flex-1 h-12 text-lg font-semibold"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            size="large"
            className="bg-purple-600 hover:bg-purple-700 flex-1 h-12 text-lg font-semibold"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading || !proxyAmount || parseFloat(proxyAmount) <= 0}
          >
            Set Proxy
          </Button>
        </div>
      </div>
    </Modal>
  );
} 