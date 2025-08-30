import { Modal } from "antd";
import React, { useState } from "react";

interface OfferNowModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (amount: number) => void;
  loading?: boolean;
}

const OfferNowModal: React.FC<OfferNowModalProps> = ({ open, onCancel, onSubmit, loading = false }) => {
  const [amount, setAmount] = useState(100);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(Number(val));
  };

  const handleSubmit = () => {
    if (amount > 0 && !loading) onSubmit(amount);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={420}
      closeIcon={<span className="text-2xl text-blue-500">×</span>}
    >
      <div className="flex flex-col items-center justify-center py-6">
        {/* Money bag icon as SVG */}
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
          <path d="M12 2C13.1046 2 14 2.89543 14 4V5.38268C14 5.76522 14.214 6.11742 14.5528 6.27639L16.4472 7.17157C17.1747 7.51314 17.1747 8.48686 16.4472 8.82843L14.5528 9.72361C14.214 9.88258 14 10.2348 14 10.6173V12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12V10.6173C10 10.2348 9.786 9.88258 9.44721 9.72361L7.55279 8.82843C6.8253 8.48686 6.8253 7.51314 7.55279 7.17157L9.44721 6.27639C9.786 6.11742 10 5.76522 10 5.38268V4C10 2.89543 10.8954 2 12 2Z" fill="#3B82F6"/>
          <ellipse cx="12" cy="17" rx="8" ry="5" fill="#3B82F6"/>
          <text x="12" y="20" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">$</text>
        </svg>
        <div className="text-2xl font-bold mt-4 mb-2 text-center">Place Your Offer Now.</div>
        <div className="text-gray-500 text-center mb-6">Seize the opportunity and place your offer now to unlock exceptional value.</div>
        <div className="flex items-center justify-center w-full mb-6">
          <span className="text-blue-500 text-3xl font-bold mr-2">$</span>
          <input
            type="text"
            value={amount}
            onChange={handleInput}
            className="text-3xl font-bold border-b-2 border-blue-500 outline-none w-32 text-center bg-transparent"
            style={{ appearance: 'textfield' }}
            disabled={loading}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-2 rounded text-lg flex items-center justify-center"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className="loader mr-2"></span> : null}
          {loading ? 'Placing...' : 'Place Offer'}
        </button>
      </div>
    </Modal>
  );
};

export default OfferNowModal; 