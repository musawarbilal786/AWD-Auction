import { Modal, Input, Button } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';

interface ChangeBidPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPrice: number) => void;
  currentPrice: number;
  lastChangedAmount?: number;
  loading?: boolean;
  auctionId?: string;
  vehicleInfo?: string;
}

const ChangeBidPriceModal = ({
  isOpen,
  onClose,
  onSave,
  currentPrice,
  lastChangedAmount,
  loading = false,
  auctionId,
  vehicleInfo
}: ChangeBidPriceModalProps) => {
  // Use lastChangedAmount if available, otherwise use currentPrice
  const displayAmount = lastChangedAmount !== undefined ? lastChangedAmount : currentPrice;
  const [newPrice, setNewPrice] = useState(displayAmount.toString());

  useEffect(() => {
    setNewPrice(displayAmount.toString());
  }, [displayAmount]);

  const handleSave = () => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price > 0) {
      onSave(price);
    }
  };

  const handleCancel = () => {
    setNewPrice(displayAmount.toString());
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
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
        {/* Gavel Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center">
            <DollarOutlined className="text-white text-2xl" />
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Counter Offer</h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">Propose a new price for this negotiation.</p>
        
        {/* Auction Info */}
        {auctionId && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Auction ID: <span className="font-semibold">{auctionId}</span></div>
            {vehicleInfo && (
              <div className="text-sm text-gray-600">Vehicle: <span className="font-semibold">{vehicleInfo}</span></div>
            )}
          </div>
        )}
        
        {/* Current Amount */}
        <div className="mb-6">
          <div className="text-lg font-semibold text-gray-900 mb-4">
            {lastChangedAmount !== undefined ? 'Last Changed Amount' : 'Current Offer'}: $ {displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
        </div>

        {/* New Amount Input */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <Input
                size="large"
                value={`$ ${newPrice}`}
                onChange={(e) => setNewPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                className="text-2xl font-bold text-sky-600 text-center"
                style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}
                placeholder="Enter counter offer amount"
              />
            </div>
            <Button 
              type="primary" 
              className="bg-sky-600 hover:bg-sky-700"
              onClick={() => {
                const current = parseFloat(newPrice) || 0;
                setNewPrice((current + 100).toFixed(2));
              }}
            >
              + $100
            </Button>
          </div>
        </div>
        
        {/* Send Counter Offer Button */}
        <Button 
          type="primary" 
          size="large"
          className="bg-green-600 hover:bg-green-700 w-full h-12 text-lg font-semibold"
          onClick={handleSave}
          loading={loading}
          disabled={!newPrice || parseFloat(newPrice) <= 0}
          icon={<DollarOutlined />}
        >
          Send Counter Offer
        </Button>
      </div>
    </Modal>
  );
};

export default ChangeBidPriceModal; 