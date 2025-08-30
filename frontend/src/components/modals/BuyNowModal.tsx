import React from 'react';
import { Modal, Button } from 'antd';

interface BuyNowModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  price?: string | number;
  vin?: string;
  loading?: boolean;
}

export default function BuyNowModal({
  open,
  onClose,
  onConfirm,
  title,
  price,
  vin,
  loading = false
}: BuyNowModalProps) {
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
        {/* Checkmark Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Purchase</h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">Are you sure you want to buy this vehicle now? This action cannot be undone.</p>
        
        {/* Vehicle Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-lg font-semibold text-gray-900 mb-2">{title}</div>
          {price && <div className="text-xl font-bold text-sky-600">$ {price}</div>}
          {vin && <div className="text-sm text-gray-500 mt-1">VIN: {vin}</div>}
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
            className="bg-green-600 hover:bg-green-700 flex-1 h-12 text-lg font-semibold"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            Confirm Purchase
          </Button>
        </div>
      </div>
    </Modal>
  );
} 